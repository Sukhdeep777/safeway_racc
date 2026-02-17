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
    const promptPark = document.getElementById('prompt-park'); // NUEVO

    const introScreen = document.getElementById('intro-screen');
    const blackCurtain = document.getElementById('black-curtain');
    const carObstacle = document.getElementById('car-obstacle');

    const dialogueBox = document.getElementById('dialogue-box');
    const speakerName = document.getElementById('speaker-name');
    const dialogueText = document.getElementById('dialogue-text');

    const confirmationModal = document.getElementById('confirmation-modal');
    const btnYes = document.getElementById('btn-yes');
    const btnNo = document.getElementById('btn-no');

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
    
    // NUEVA VARIABLE: ¿Está desbloqueado el parque?
    let isParkUnlocked = false; 

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
        // No reseteamos currentInteraction aquí para poder usarlo en el btnYes
    }

    // --- LÓGICA DE BOTONES (SÍ / NO) ---
    btnYes.addEventListener('click', () => {
        closeConfirmation();

        // CASO 1: COCHE (Game Over)
        if (currentInteraction === 'coche') {
            showMessage("Narrador", "name-narrador", "Mala idea. Els teus reflexos fallen i acabes tenint un accident.", null);
            setTimeout(() => location.reload(), 5000);
        }
        // CASO 2: PATINETE (Game Over)
        else if (currentInteraction === 'scooter') {
            showMessage("Narrador", "name-narrador", "Sense casc i de nit... una mala caiguda t'envia a l'hospital.", null);
            setTimeout(() => location.reload(), 5000);
        }
        // CASO 3: CARTEL -> DESBLOQUEA PARQUE
        else if (currentInteraction === 'cartel') {
            showMessage("Torrent", "name-torrent", "Tens raó. Millor vaig caminant pel parc, és més segur i s'arriba abans.", null);
            
            // Lógica para activar el parque
            isParkUnlocked = true;
            promptPark.classList.add('unlocked'); // Hace visible la E en el medio
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
        if(posX > bounds.max) posX = bounds.max;
        player.style.left = posX + 'px';
        checkInteractions();
    }

    function checkCollision(nextX) {
        if (currentLevel !== 2) return false; // Solo colisiona en nivel 2
        if (currentLevel === 3) return false; // En nivel 3 no hay coche

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
            // Cartel
            if (Math.abs(relativePlayerX - 75) < 60) promptSign.classList.add('visible');
            else promptSign.classList.remove('visible');

            // Scooter
            if (Math.abs(relativePlayerX - 320) < 60) promptScooter.classList.add('visible');
            else promptScooter.classList.remove('visible');

            // Coche
            if (Math.abs(relativePlayerX - 600) < 60) promptCar.classList.add('visible');
            else promptCar.classList.remove('visible');

            // Parque (Solo si está desbloqueado)
            // Nota: La E ya está visible por CSS 'unlocked', aquí solo comprobamos distancia lógica
            // para saber si puedes pulsar E, no para mostrarla (porque ya se muestra siempre)
        }
    }

    // --- CARGAR NIVELES ---

    function loadLevel2() {
        currentLevel = 2;
        level1Exit.style.display = 'none';
        container.classList.add('level-2');
        posX = 50;
        velocity = 0;
        direction = 'right';
        player.style.left = posX + 'px';
        setIdle();
    }

    function loadLevel3() {
        currentLevel = 3;
        
        // Efecto de transición (cortinilla negra opcional)
        blackCurtain.style.opacity = '1';
        
        setTimeout(() => {
            // Quitamos la clase level-2 y ponemos level-3
            container.classList.remove('level-2');
            container.classList.add('level-3');

            // Reseteamos posición
            posX = 50;
            velocity = 0;
            direction = 'right';
            player.style.left = posX + 'px';
            setIdle();

            // Mensaje de entrada al nivel 3
            showMessage("Narrador", "name-narrador", "El parc està tranquil a aquestes hores. L'aire fresc t'ajuda a aclarir la ment.", null);

            setTimeout(() => {
                blackCurtain.style.opacity = '0';
            }, 500);

        }, 1000);
    }

    // 8. INPUTS (TECLADO)
    window.addEventListener('keydown', (e) => {
        if (!gameStarted) return;
        const key = e.key.toLowerCase();
       
        // A) GESTIÓN DE DIÁLOGOS
        if(key === 'e' && isDialogueActive) {
            if (!isInitialized) {
                showNextDialogue();
            } 
            else {
                // Si es un objeto interactuable, abrimos confirmación
                if (['cartel', 'scooter', 'coche'].includes(currentInteraction)) {
                    openConfirmation();
                } else {
                    closeMessage();
                }
            }
            return;
        }

        if (isConfirmationActive) return;

        // B) MOVIMIENTO
        if(key === 'a') keys.a = true;
        if(key === 'd') keys.d = true;

        // C) INTERACCIONES
        if(key === 'e' && !isDialogueActive && !isConfirmationActive) {
            
            const playerRect = player.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            const relativeX = (playerRect.left + playerRect.width / 2) - containerRect.left;

            // Nivel 1 -> Salida
            if (isNearExit && currentLevel === 1) {
                loadLevel2();
            }

            // Nivel 2
            if (currentLevel === 2) {
                
                // Si el parque está desbloqueado y estamos cerca del centro (aprox 500px)
                if (isParkUnlocked && Math.abs(relativeX - 500) < 100) {
                    loadLevel3();
                    return; // Importante para no activar otras cosas a la vez
                }

                if (Math.abs(relativeX - 75) < 60) {
                    showMessage("Torrent", "name-torrent", "És bona opció però la meva casa està molt lluny.", "cartel");
                }
                else if (Math.abs(relativeX - 320) < 60) {
                    showMessage("Torrent", "name-torrent", "Podria anar amb patinet, però no porto el casc i no vull jugar-me-la.", "scooter");
                }
                else if (Math.abs(relativeX - 600) < 100) { 
                    showMessage("Torrent", "name-torrent", "No sé si estic en bones condicions per conduir...", "coche");
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
            // Solo comprobamos colisión coche en Nivel 2
            if (velocity > 0 && checkCollision(nextX)) {
                velocity = 0;
                setIdle();
            } else {
                posX = nextX;
                applyPosition();
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
           
            posX = 50;
            applyPosition();
            setIdle();
           
            setTimeout(() => { 
                blackCurtain.style.opacity = '0'; 
                showNextDialogue(); 
            }, 500);
        }, 1500);
    }

    if(img.complete) { window.addEventListener('keydown', handleStartInput); }
    else { img.onload = () => { window.addEventListener('keydown', handleStartInput); }; }

})();