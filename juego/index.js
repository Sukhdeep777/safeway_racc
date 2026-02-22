(() => {
    // 1. REFERENCIAS AL DOM
    const img = document.getElementById('player-img');
    const player = document.getElementById('player');
    const container = document.querySelector('.game-container');
    
    const level1Exit = document.getElementById('level1-exit');
    const keyPrompt = document.getElementById('key-prompt');
    
    // Elementos Nivel 2
    const promptSign = document.getElementById('prompt-sign');
    const promptScooter = document.getElementById('prompt-scooter');
    const promptCar = document.getElementById('prompt-car');
    const promptPark = document.getElementById('prompt-park'); 

    // Referencia al icono del paso de peatones (opcional visualmente)
    const promptCrosswalk = document.getElementById('prompt-crosswalk');

    const introScreen = document.getElementById('intro-screen');
    const blackCurtain = document.getElementById('black-curtain');
    const carObstacle = document.getElementById('car-obstacle');

    const dialogueBox = document.getElementById('dialogue-box');
    const speakerName = document.getElementById('speaker-name');
    const dialogueText = document.getElementById('dialogue-text');

    const confirmationModal = document.getElementById('confirmation-modal');
    const btnYes = document.getElementById('btn-yes');
    const btnNo = document.getElementById('btn-no');

    const killerCar = document.getElementById('killer-car');
    const gameOverScreen = document.getElementById('game-over-screen');
    const btnRetry = document.getElementById('btn-retry');
    // 2. IMÁGENES PRECARGADAS
    const gifs = {
        rightRun: 'animaciones/correr-derecho.gif',
        leftRun: 'animaciones/correr-izquierda.gif',
        idleRight: 'animaciones/paradoderecha.gif',
        idleLeft: 'animaciones/paradoizquierda.gif'
    };
    Object.values(gifs).forEach(path => {
        const preload = new Image();
        preload.src = path;
    });

    // 3. VARIABLES DE ESTADO
    let velocity = 0;
    const MAX_SPEED = 3;      
    const ACCELERATION = 0.3;  
    const friction = 0.85;
    let direction = 'right';
    let currentAnimation = null;
    let currentLevel = 1;
    let posX = 0;
    
    let isInitialized = false; 
    let gameStarted = false;
    let isNearExit = false;
    let isDialogueActive = false; 
    let isConfirmationActive = false; 
    let currentInteraction = null; 
    let currentStep = 0;
    
    let isParkUnlocked = false; 
    let isTransitioning = false; 
    let isCrossingBadly = false; // Controla si decidió cruzar en rojo
    let isDead = false;          // Controla si está en la animación de atropello
    // VARIABLE NUEVA: Para controlar el diálogo automático del semáforo
    let hasSpokenAtCrosswalk = false;

    const keys = { a: false, d: false, e: false };

    // 4. HISTORIA (DIÁLOGOS INTRO)
    const story = [
        {
            name: "Narrador",
            class: "name-narrador",
            text: "La nit s'esvaeix lentament entre el ressò rítmic de la música i els llums de neó. Tot i que l'eufòria encara omple la sala, el temps dicta la seva pròpia sentència."
        },
        {
            name: "Torrent",
            class: "name-torrent",
            text: "Crec que ja n'hi ha prou per avui... Ha estat una vetllada intensa, però ja va essent hora de tornar a casa i descansar de debò."
        }
    ];

    // 5. FUNCIONES DE DIÁLOGO Y UI
    function showNextDialogue() {
        if (currentStep < story.length) {
            isDialogueActive = true;
            dialogueBox.style.display = 'block';
            const line = story[currentStep];
            speakerName.textContent = line.name + ":";
            speakerName.className = "speaker-name " + line.class;
            dialogueText.textContent = line.text;
            currentStep++;
        } else {
            isDialogueActive = false;
            dialogueBox.style.display = 'none';
            isInitialized = true; 
            requestAnimationFrame(loop);
        }
    }

    function showMessage(name, cssClass, text, interactionType) {
        isDialogueActive = true;
        currentInteraction = interactionType; 
        dialogueBox.style.display = 'block';
        speakerName.textContent = name + ":";
        speakerName.className = "speaker-name " + cssClass;
        dialogueText.textContent = text;
        velocity = 0;
        setIdle();
    }

    function closeMessage() {
        isDialogueActive = false;
        dialogueBox.style.display = 'none';
        currentInteraction = null;
    }

    function openConfirmation() {
        dialogueBox.style.display = 'none';
        isDialogueActive = false;
        isConfirmationActive = true; 
        confirmationModal.style.display = 'block';
    }

    function closeConfirmation() {
        confirmationModal.style.display = 'none';
        isConfirmationActive = false;
    }

// --- LÓGICA DE BOTONES (SÍ / NO) ---
    btnYes.addEventListener('click', () => {
        closeConfirmation(); 

        if (currentInteraction === 'cartel') {
            isParkUnlocked = true;
            promptPark.classList.add('unlocked');
        } else if (currentInteraction === 'paso-peatones') {
            // El jugador decide cruzar en rojo
            isCrossingBadly = true; 
        }
        
        currentInteraction = null; 
    });

    btnNo.addEventListener('click', () => {
        closeConfirmation(); 
        currentInteraction = null; 
    });

    // 6. MOVIMIENTO Y FÍSICA
    function updateBounds(){
        const rect = container.getBoundingClientRect();
        const pRect = player.getBoundingClientRect();
        return { min: 0, max: rect.width - pRect.width };
    }

function applyPosition(){
        const bounds = updateBounds();
        if(posX < bounds.min) posX = bounds.min;
        
        if (currentLevel === 3 && posX >= bounds.max && !isTransitioning) {
            posX = bounds.max; 
            loadLevel4();
        } else if (posX > bounds.max) {
            posX = bounds.max;
        }

        player.style.left = posX + 'px';

        // LÓGICA AUTOMÁTICA NIVEL 4 (Diálogo Semáforo)
        if (currentLevel === 4 && !hasSpokenAtCrosswalk && !isTransitioning && !isDead) {
            if (posX >= 144) {
                velocity = 0;      
                keys.d = false;    
                hasSpokenAtCrosswalk = true; 
                showMessage("Torrent", "name-torrent", "Vaja, el semàfor està en vermell... Hauria de creuar ara mateix o m'espero a que canviï?", "paso-peatones");
            }
        }

        // NUEVO: LÓGICA DE ATROPELLO
        // Si decidió cruzar (isCrossingBadly) y llega al medio de la carretera (aprox pixel 550)
        if (currentLevel === 4 && isCrossingBadly && posX >= 550 && !isDead) {
            triggerDeathSequence(); // Lanza la animación
        }

        checkInteractions();
    }


// === ANIMACIÓN DE ATROPELLO ===
    function triggerDeathSequence() {
        isDead = true;
        velocity = 0;
        keys.a = false;
        keys.d = false;
        setIdle();

        killerCar.style.display = 'block';
        let carX = -400; // El coche empieza fuera de la pantalla por la izquierda
        killerCar.style.left = carX + 'px';

        let isHit = false;

        function animateCar() {
            carX += 25; // Velocidad muy rápida del coche
            killerCar.style.left = carX + 'px';

            // Detectar el impacto (cuando el coche alcanza al jugador)
            if (!isHit && carX + 200 >= posX) {
                isHit = true;
            }

            // Si ha impactado, el jugador se mueve pegado al morro del coche (se lo lleva)
            if (isHit) {
                posX = carX + 200; 
                player.style.left = posX + 'px';
            }

            // Cuando el coche sale de la pantalla por la derecha
            if (carX > 1200) {
                gameOverScreen.style.display = 'flex'; // Muestra la pantalla negra
            } else {
                requestAnimationFrame(animateCar);
            }
        }
        
        requestAnimationFrame(animateCar);
    }

    function checkCollision(nextX) {
        if (currentLevel !== 2) return false; 
        const carStyle = window.getComputedStyle(carObstacle);
        const carLeft = parseInt(carStyle.left);
        const carWidth = parseInt(carStyle.width);
        const playerWidth = player.getBoundingClientRect().width;
        
        if (nextX + playerWidth > carLeft + 20 && nextX < carLeft + carWidth) {
            return true;
        }
        return false;
    }

    function setIdle(){
        const newSrc = direction === 'left' ? gifs.idleLeft : gifs.idleRight;
        if(currentAnimation !== newSrc) {
            currentAnimation = newSrc;
            img.src = newSrc;
        }
    }

    function setRun(dir){
        const newSrc = dir === 'left' ? gifs.leftRun : gifs.rightRun;
        if(currentAnimation !== newSrc) {
            currentAnimation = newSrc;
            img.src = newSrc;
        }
    }

    // 7. CHECKER DE INTERACCIONES
    function checkInteractions() {
        const playerRect = player.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const relativePlayerX = (playerRect.left + playerRect.width / 2) - containerRect.left;

        // NIVEL 1
        if (currentLevel === 1) {
            if(!level1Exit || level1Exit.style.display === 'none') return;
            const doorRect = level1Exit.getBoundingClientRect();
            const doorCenter = (doorRect.left + doorRect.width/2) - containerRect.left;
            
            if (Math.abs(relativePlayerX - doorCenter) < 100) {
                if (!isNearExit) { isNearExit = true; keyPrompt.classList.add('visible'); }
            } else {
                if (isNearExit) { isNearExit = false; keyPrompt.classList.remove('visible'); }
            }
        }

        // NIVEL 2
        if (currentLevel === 2) {
            if (isParkUnlocked) {
                 promptSign.classList.remove('visible');
                 promptScooter.classList.remove('visible');
                 promptCar.classList.remove('visible');
                 return; 
            }
            if (Math.abs(relativePlayerX - 75) < 60) promptSign.classList.add('visible');
            else promptSign.classList.remove('visible');
            if (Math.abs(relativePlayerX - 320) < 60) promptScooter.classList.add('visible');
            else promptScooter.classList.remove('visible');
            if (Math.abs(relativePlayerX - 600) < 60) promptCar.classList.add('visible');
            else promptCar.classList.remove('visible');
        }
    }

    // --- CARGAR NIVELES ---

    function loadLevel2() {
        currentLevel = 2;
        level1Exit.style.display = 'none';
        container.classList.add('level-2');
        posX = 50; velocity = 0; direction = 'right';
        player.style.left = posX + 'px';
        setIdle();
    }

    function loadLevel3() {
        if (isTransitioning) return;
        isTransitioning = true;
        currentLevel = 3;
        blackCurtain.style.opacity = '1';
        setTimeout(() => {
            container.classList.remove('level-2');
            container.classList.add('level-3');
            posX = 50; velocity = 0; direction = 'right';
            player.style.left = posX + 'px';
            setIdle();
            showMessage("Narrador", "name-narrador", "El parc està tranquil a aquestes hores. L'aire fresc t'ajuda a aclarir la ment. Segueix endavant.", null);
            setTimeout(() => { blackCurtain.style.opacity = '0'; isTransitioning = false; }, 500);
        }, 1000);
    }

function loadLevel4() {
        if (isTransitioning) return;
        isTransitioning = true;
        currentLevel = 4;
        
        hasSpokenAtCrosswalk = false; 
        isCrossingBadly = false; // Reset
        isDead = false;          // Reset

        blackCurtain.style.opacity = '1';
        killerCar.style.display = 'none'; // Oculta el coche por si venimos de un reintento
        
        setTimeout(() => {
            container.classList.remove('level-3');
            container.classList.add('level-4');
            posX = 50; 
            velocity = 0; 
            direction = 'right';
            player.style.left = posX + 'px';
            setIdle();

            setTimeout(() => { 
                blackCurtain.style.opacity = '0'; 
                setTimeout(() => { isTransitioning = false; }, 600);
            }, 500);
        }, 1000);
    }

    // 8. INPUTS (TECLADO)
    window.addEventListener('keydown', (e) => {
        if (!gameStarted) return;
        const key = e.key.toLowerCase();
       
        // Si hay un diálogo activo y pulsamos E...
        if(key === 'e' && isDialogueActive) {
            if (!isInitialized) {
                showNextDialogue();
            } 
            else {
                // Si la interacción es del tipo 'paso-peatones' (la automática),
                // al cerrar el texto abrimos la confirmación
                if (currentInteraction === 'paso-peatones') {
                    openConfirmation();
                } 
                else if (['cartel', 'scooter', 'coche'].includes(currentInteraction)) {
                    openConfirmation();
                } else {
                    closeMessage();
                }
            }
            return;
        }

        if (isConfirmationActive) return;

        if(key === 'a') keys.a = true;
        if(key === 'd') keys.d = true;

        if(key === 'e' && !isDialogueActive && !isConfirmationActive) {
            const playerRect = player.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            const relativeX = (playerRect.left + playerRect.width / 2) - containerRect.left;

            if (isNearExit && currentLevel === 1) loadLevel2();

            if (currentLevel === 2) {
                if (isParkUnlocked && Math.abs(relativeX - 500) < 100) { loadLevel3(); return; }
                if (!isParkUnlocked) {
                    if (Math.abs(relativeX - 75) < 60) showMessage("Torrent", "name-torrent", "La meva casa està molt lluny.", "cartel");
                    else if (Math.abs(relativeX - 320) < 60) showMessage("Torrent", "name-torrent", "Podria anar amb patinet, però no porto el casc i no vull jugar-me-la.", "scooter");
                    else if (Math.abs(relativeX - 600) < 100) showMessage("Torrent", "name-torrent", "No sé si estic en bones condicions per conduir...", "coche");
                }
            }
        }
    });

    window.addEventListener('keyup', (e) => {
        const key = e.key.toLowerCase();
        if(key === 'a') keys.a = false;
        if(key === 'd') keys.d = false;
    });

    // 9. LOOP PRINCIPAL
    function loop(){
        if (!isInitialized || isDialogueActive || isConfirmationActive) {
             if(isInitialized) requestAnimationFrame(loop);
             return;
        }

        if (keys.a && !keys.d) direction = 'left';
        if (keys.d && !keys.a) direction = 'right';

        if(keys.d && velocity < MAX_SPEED) velocity = Math.min(velocity + ACCELERATION, MAX_SPEED);
        if(keys.a && velocity > -MAX_SPEED) velocity = Math.max(velocity - ACCELERATION, -MAX_SPEED);
       
        if(!keys.a && !keys.d) {
            velocity *= friction;
            if(Math.abs(velocity) < 0.05) velocity = 0;
        }

        if (velocity === 0) setIdle();
        else setRun(direction);

        if(velocity !== 0){
            const nextX = posX + velocity;
            if (currentLevel === 2 && velocity > 0 && checkCollision(nextX)) {
                velocity = 0; setIdle();
            } else {
                posX = nextX; applyPosition();
            }
        }
        requestAnimationFrame(loop);
    }

    // 10. INICIO DEL JUEGO
    function handleStartInput() {
        if (gameStarted) return;
        gameStarted = true;
        window.removeEventListener('keydown', handleStartInput);
        blackCurtain.style.opacity = '1';
        setTimeout(() => {
            introScreen.style.display = 'none';
            const video = introScreen.querySelector('video');
            if(video) video.pause();
            posX = 50; applyPosition(); setIdle();
            setTimeout(() => { 
                blackCurtain.style.opacity = '0'; 
                showNextDialogue(); 
            }, 500);
        }, 1500);
    }

    if(img.complete) { window.addEventListener('keydown', handleStartInput); }
    else { img.onload = () => { window.addEventListener('keydown', handleStartInput); }; }

    btnRetry.addEventListener('click', () => {
        gameOverScreen.style.display = 'none';
        loadLevel4(); // Vuelve a cargar el nivel del autobús desde el principio
    });

})();
