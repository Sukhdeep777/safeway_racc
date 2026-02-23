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
    const victoryScreen = document.getElementById('victory-screen');
    const btnPlayAgain = document.getElementById('btn-play-again');
    // 2. IMÁGENES PRECARGADAS
    const gifs = {
        rightRun: 'animaciones/correr-derecho.gif',
        leftRun: 'animaciones/correr-izquierda.gif',
        idleRight: 'animaciones/paradoderecha.gif',
        idleLeft: 'animaciones/paradoizquierda.gif'
    };
    // (Debajo de los gifs del jugador...)
    const bgPreloads = ['imagenes/busamarillo.gif', 'imagenes/busverde.gif'];
    bgPreloads.forEach(path => {
        const preloadBg = new Image();
        preloadBg.src = path;
    });
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
    let isWaitingForLight = false; // Bloquea al jugador mientras el semáforo cambia
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

        if (currentInteraction === 'paso-peatones') {
            // El jugador decide ser prudente y esperar
            isWaitingForLight = true;
            
            // Forzamos al jugador a quedarse completamente quieto
            keys.a = false;
            keys.d = false;
            velocity = 0;
            setIdle();

            // --- 1. ANIMACIÓN DEL COCHE VERTICAL (DESDE EL FONDO) ---
            killerCar.style.display = 'block';
            
            let carY = 400; // Empieza lejos en el horizonte
            let carScale = 0.2; // Escala inicial pequeña
            
            // Lo posicionamos un poco más a la derecha de Torrent para que pase por la carretera
            // Ajusta este "+ 150" si necesitas que el coche pase más a la izquierda o derecha
            killerCar.style.left = (posX + 250) + 'px'; 
            killerCar.style.bottom = carY + 'px';
            killerCar.style.transform = `scale(${carScale})`;

            function passCarVertically() {
                carY -= 25; // Velocidad de caída muy alta (pasa rápido)
                carScale += 0.08; // Crece rápido para mantener la perspectiva
                
                killerCar.style.bottom = carY + 'px';
                killerCar.style.transform = `scale(${carScale})`;

                // Cuando el coche sale de la pantalla por abajo (hacia la cámara)
// Cuando el coche sale de la pantalla por abajo (hacia la cámara)
                if (carY < -300) {
                    killerCar.style.display = 'none'; // Lo ocultamos
                    
                    // --- 2. TRANSICIÓN DE FONDOS CON FUNDIDO ---
                    changeBackgroundSmoothly('imagenes/busamarillo.gif');

                    // Esperamos 3 segundos y cambiamos a verde
                    setTimeout(() => {
                        changeBackgroundSmoothly('imagenes/busverde.gif');
                        
                        // Esperamos a que acabe el fundido (600ms) para lanzar el diálogo
                        setTimeout(() => {
                            // Mensaje educativo y de alivio
                            showMessage("Torrent", "name-torrent", "Uf... Has vist a quina velocitat anava aquell cotxe? Menys mal que m'he esperat. Ara sí que està verd.", null);
                            
                            // Liberamos al jugador
                            isWaitingForLight = false;
                        }, 600); 

                    }, 3000); 
                    
                } else {
                    // Seguimos animando hasta que salga de la pantalla
                    requestAnimationFrame(passCarVertically);
                }
            }
            
            // Disparamos la animación del coche
            requestAnimationFrame(passCarVertically);
        }

        currentInteraction = null; 
    });

// --- FUNCIÓN PARA TRANSICIONES SUAVES DE FONDO ---
    function changeBackgroundSmoothly(newImgSrc) {
        // Aseguramos que el jugador y el coche siempre estén por delante
        player.style.zIndex = '10';
        killerCar.style.zIndex = '10';

        // Creamos una capa temporal
        const fader = document.createElement('div');
        fader.style.position = 'absolute';
        fader.style.top = '0';
        fader.style.left = '0';
        fader.style.width = '100%';
        fader.style.height = '100%';
        fader.style.backgroundImage = `url('${newImgSrc}')`;
        // Ajusta esto a 'cover' o '100% 100%' según cómo tengas tu CSS original
        fader.style.backgroundSize = 'cover'; 
        fader.style.backgroundPosition = 'center';
        fader.style.zIndex = '1'; // Se pone justo encima del fondo actual
        fader.style.opacity = '0';
        fader.style.transition = 'opacity 0.6s ease-in-out'; // Duración del fundido (0.6 seg)
        fader.style.pointerEvents = 'none';

        container.appendChild(fader);

        // Disparamos la transición visual
        requestAnimationFrame(() => {
            fader.style.opacity = '1';
        });

        // Cuando termina el fundido, aplicamos el fondo real y borramos la capa
        setTimeout(() => {
            container.style.backgroundImage = `url('${newImgSrc}')`;
            fader.remove();
        }, 600);
    }
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
        } 
        // --- LÓGICA DE VICTORIA ARREGLADA ---
        // Añadimos !isTransitioning para que no salte durante el fundido a negro
        else if (currentLevel === 4 && !isTransitioning && !isCrossingBadly && posX >= 600 && !isDead) {
            posX = 600; // Fija a Torrent al pisar la acera derecha
            triggerVictory(); // Llamamos a la función de ganar
        } 
        else if (posX > bounds.max) {
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

        // LÓGICA DE ATROPELLO
        // Si decidió cruzar (isCrossingBadly) y llega al medio de la carretera (aprox pixel 427)
        if (currentLevel === 4 && isCrossingBadly && posX >= 427 && !isDead) {
            triggerDeathSequence(); 
        }

        checkInteractions();
    }

// === ANIMACIÓN DE ATROPELLO (DESDE EL FONDO) ===
    function triggerDeathSequence() {
        isDead = true;
        velocity = 0;
        keys.a = false;
        keys.d = false;
        setIdle();

        killerCar.style.display = 'block';
        
        // Posición inicial: Lejos en el horizonte (arriba y pequeño)
        let carY = 400; // Altura en el horizonte (puedes subirlo si quieres que empiece más lejos)
        let carScale = 0.2; // Escala muy pequeña
        
        // Centramos el coche con la posición actual del jugador
        killerCar.style.left = (posX - 50) + 'px'; // Ajusta el -50 para centrar tu coche.png con el personaje
        killerCar.style.bottom = carY + 'px';
        killerCar.style.transform = `scale(${carScale})`;
        
        let isHit = false;

        function animateCar() {
            carY -= 12; // Velocidad a la que el coche "baja" hacia la cámara
            carScale += 0.04; // Velocidad a la que el coche "crece" (efecto 3D)
            
            killerCar.style.bottom = carY + 'px';
            killerCar.style.transform = `scale(${carScale})`;

            // El jugador está en bottom: 80px. El impacto ocurre cuando el coche llega a esa altura.
            if (!isHit && carY <= 100) {
                isHit = true;
            }

            // Si el coche lo golpea, el jugador es arrastrado hacia abajo (hacia la cámara)
            if (isHit) {
                player.style.bottom = carY + 'px'; 
            }

            // Cuando el coche (y el jugador) salen de la pantalla por abajo
// Cuando el coche sale de la pantalla...
            if (carY < -300) {  // (O si usas la horizontal: si carX > 1200)
                gameOverScreen.style.display = 'flex'; // Muestra la pantalla negra
                player.style.display = 'none';         // <-- AÑADE ESTO: Oculta a Torrent
            } else {
                requestAnimationFrame(animateCar);
            }
        }
        
        requestAnimationFrame(animateCar);
    }

// === ANIMACIÓN DE VICTORIA ===
    function triggerVictory() {
        velocity = 0;
        keys.a = false;
        keys.d = false;
        setIdle();
        
        // Mostramos la pantalla de victoria (usamos 'flex' porque así lo centramos en el CSS en línea)
        victoryScreen.style.display = 'flex';
    }

    // === BOTÓN VOLVER A JUGAR ===
    btnPlayAgain.addEventListener('click', () => {
        // La forma más limpia y segura de reiniciar un juego de navegador 
        // a su estado de "Fábrica" es recargar la página.
        window.location.reload(); 
    });

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
        
        // <-- ESTAS DOS LÍNEAS FALTABAN -->
        isWaitingForLight = false; 
        container.style.backgroundImage = ""; // Borra el verde/amarillo para que vuelva al rojo por defecto

        blackCurtain.style.opacity = '1';
        killerCar.style.display = 'none'; 
        
        // <-- AÑADE ESTAS DOS LÍNEAS PARA RESETEAR AL JUGADOR -->
        player.style.display = 'block';  // Lo vuelve a hacer visible
        player.style.bottom = '80px';    // Lo devuelve a su altura original
        
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
        
        // Bloqueo del jugador mientras espera el semáforo
        if (isWaitingForLight) return; 

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