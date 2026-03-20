(() => {
    // 1. REFERENCIAS AL DOM
    const img = document.getElementById('player-img');
    const player = document.getElementById('player');
    const container = document.querySelector('.game-container');
    
    const level1Exit = document.getElementById('level1-exit');
    const keyPrompt = document.getElementById('key-prompt');
    
    // Elementos Nivel 2.
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
    const busVideoScreen = document.getElementById('bus-video-screen');
    const busVideo = document.getElementById('bus-video');
    const scooterVideoScreen = document.getElementById('scooter-video-screen');
    const scooterVideo = document.getElementById('scooter-video');
    const tutorialTeclas = document.getElementById('tutorial-teclas');
    const gameOverText = document.getElementById('game-over-text');
    const tutorialWS = document.getElementById('tutorial-ws');

    // =========================================
    // AUDIO — Declaración de todos los sonidos
    // =========================================
    const audioDisco = new Audio('audios/gente_disco.mp3');
    audioDisco.loop   = true;
    audioDisco.volume = 0.25; // Volumen bajo: ambiental de fondo

    // Dos instancias de coche.mp3 para que puedan sonar de forma independiente
    // audioCochePass  → coche que pasa por el semáforo (corto, no loop)
    // audioMotor      → motor en bucle mientras conducimos
    const audioCochePass = new Audio('audios/coche.mp3');
    audioCochePass.loop   = false;
    audioCochePass.volume = 0.75;

    const audioMotor = new Audio('audios/coche.mp3');
    audioMotor.loop   = true;
    audioMotor.volume = 0.45;

    const audioViento = new Audio('audios/viento.mp3');
    audioViento.loop   = true;
    audioViento.volume = 0.6;
    /** Detiene TODOS los audios del juego y reinicia su posición */
    function stopAllAudio() {
        [audioDisco, audioCochePass, audioMotor].forEach(a => {
            a.pause();
            a.currentTime = 0;
        });
    }

    /** Detiene motor y coche-pass (útil al salir del nivel coche / nivel 4) */
    function stopCarAudio() {
        audioCochePass.pause();
        audioCochePass.currentTime = 0;
        audioMotor.pause();
        audioMotor.currentTime = 0;
    }
    // =========================================

    // 2. IMÁGENES PRECARGADAS
    const gifs = {
        rightRun: 'animaciones/correr-derecho.gif',
        leftRun: 'animaciones/correr-izquierda.gif',
        idleRight: 'animaciones/paradoderecha.gif',
        idleLeft: 'animaciones/paradoizquierda.gif'
    };
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
    const MAX_SPEED = 4;      
    const ACCELERATION = 0.4;  
    const friction = 0.85;
    let direction = 'right';
    let currentAnimation = null;
    let currentLevel = 1;
    let posX = 0;
    let posY = 70;
    
    let isInitialized = false; 
    let gameStarted = false;
    let isNearExit = false;
    let isDialogueActive = false; 
    let isConfirmationActive = false; 
    let currentInteraction = null; 
    let currentStep = 0;
    
    let isParkUnlocked = false; 
    let isTransitioning = false; 
    let isCrossingBadly = false;
    let isDead = false;
    
    let hasSpokenAtCrosswalk = false;

    const keys = { a: false, d: false, e: false, w: false, s: false };    
    let isWaitingForLight = false;
    let isLevelFinished = false;

    let grandmaActive = false;
    let grandmaHasStarted = false;
    let grandmaAnimFrame = null;

    let rocks = [];           
    let rockSpawnTimer = 0;   
    let isMinigameActive = false; 

    let rockSpeed = 5;
    let drunkFrameCount = 0;
    let dizzinessLevel = 0;
    
    let isScooterFinesPlaying = false;
    let scooterFinesStep = 0;
    const scooterFinesDialogue = [
        {
            name: "Torrent",
            class: "name-torrent",
            text: "No hauria de fer servir el patinet sense protecció pròpia... He comès tres greus errors."
        },
        {
            name: "Narrador",
            class: "name-narrador",
            text: "La primera multa: no portar casc. La protecció és obligatòria. 50 euros."
        },
        {
            name: "Narrador",
            class: "name-narrador",
            text: "La segona multa: escoltar música mentre condueixes. Això et distreu i t'impedeix escoltar els sons del trànsit. 30 euros."
        },
        {
            name: "Narrador",
            class: "name-narrador",
            text: "La tercera multa: no tenir el patinet registrat a la DGT. És necessari el registre oficial. 60 euros.Un total de 140 euros."
        }
    ];

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

        if (currentLevel === 6 && !grandmaHasStarted) {
            grandmaHasStarted = true;
            setTimeout(startGrandmaAnimation, 10000);
        }
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
            isCrossingBadly = true; 
        } else if (currentInteraction === 'scooter') {
            loadLevelPatinete();
        } else if (currentInteraction === 'coche') {
            loadLevelCoche();
        }
        
        currentInteraction = null; 
    });

    btnNo.addEventListener('click', () => {
        closeConfirmation(); 

        if (currentInteraction === 'paso-peatones') {
            isWaitingForLight = true;
            keys.a = false;
            keys.d = false;
            velocity = 0;
            setIdle();

            // ── AUDIO: coche que pasa en verde (el "seguro") ──────────────────
            audioCochePass.currentTime = 0;
            audioCochePass.play().catch(() => {});
            // ─────────────────────────────────────────────────────────────────

            killerCar.style.display = 'block';
            
            let carY = 400;
            let carScale = 0.2;
            
            killerCar.style.left = (posX + 250) + 'px'; 
            killerCar.style.bottom = carY + 'px';
            killerCar.style.transform = `scale(${carScale})`;

            function passCarVertically() {
                carY -= 25;
                carScale += 0.08;
                
                killerCar.style.bottom = carY + 'px';
                killerCar.style.transform = `scale(${carScale})`;

                if (carY < -300) {
                    killerCar.style.display = 'none';

                    // ── AUDIO: el coche ya no se ve → paramos el sonido ───────
                    audioCochePass.pause();
                    audioCochePass.currentTime = 0;
                    // ─────────────────────────────────────────────────────────

                    changeBackgroundSmoothly('imagenes/busamarillo.gif');

                    setTimeout(() => {
                        changeBackgroundSmoothly('imagenes/busverde.gif');
                        
                        setTimeout(() => {
                            showMessage("Torrent", "name-torrent", "Uf... Has vist a quina velocitat anava aquell cotxe? Menys mal que m'he esperat. Ara sí que està verd.", null);
                            isWaitingForLight = false;
                        }, 600); 

                    }, 3000); 
                    
                } else {
                    requestAnimationFrame(passCarVertically);
                }
            }
            
            requestAnimationFrame(passCarVertically);
        }

        currentInteraction = null; 
    });

    // --- FUNCIÓN PARA TRANSICIONES SUAVES DE FONDO ---
    function changeBackgroundSmoothly(newImgSrc) {
        player.style.zIndex = '10';
        killerCar.style.zIndex = '10';

        const fader = document.createElement('div');
        fader.style.position = 'absolute';
        fader.style.top = '0';
        fader.style.left = '0';
        fader.style.width = '100%';
        fader.style.height = '100%';
        fader.style.backgroundImage = `url('${newImgSrc}')`;
        fader.style.backgroundSize = 'cover'; 
        fader.style.backgroundPosition = 'center';
        fader.style.zIndex = '1';
        fader.style.opacity = '0';
        fader.style.transition = 'opacity 0.6s ease-in-out';
        fader.style.pointerEvents = 'none';

        container.appendChild(fader);

        requestAnimationFrame(() => {
            fader.style.opacity = '1';
        });

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
        if (currentLevel === 4 && !hasSpokenAtCrosswalk && posX > 130) {
            posX = 130;
            velocity = 0;
        }
        if (currentLevel === 3 && posX >= bounds.max && !isTransitioning) {
            posX = bounds.max; 
            loadLevel4();
        } 
        else if (currentLevel === 4 && !isTransitioning && !isCrossingBadly && posX >= 600 && !isDead && !isLevelFinished) {
            isLevelFinished = true;
            posX = 600; 
            playBusVideo();
        }
        else if (posX > bounds.max) {
            posX = bounds.max;
        }

        player.style.left = posX + 'px';

        if (currentLevel === 4 && !hasSpokenAtCrosswalk && !isTransitioning && !isDead) {
            if (posX >= 128) {
                velocity = 0;      
                keys.d = false;    
                hasSpokenAtCrosswalk = true; 
                showMessage("Torrent", "name-torrent", "Vaja, el semàfor està en vermell... Hauria de creuar ara mateix o m'espero a que canviï?", "paso-peatones");
            }
        }

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

        if (gameOverText) {
            gameOverText.innerText = "Creuar en vermell no ha estat una bona idea...";
        }

        // ── AUDIO: coche que atropella ────────────────────────────────────────
        audioCochePass.currentTime = 0;
        audioCochePass.play().catch(() => {});
        // ─────────────────────────────────────────────────────────────────────

        killerCar.style.display = 'block';
        
        let carY = 400;
        let carScale = 0.2;
        
        killerCar.style.left = (posX - 50) + 'px';
        killerCar.style.bottom = carY + 'px';
        killerCar.style.transform = `scale(${carScale})`;
        
        let isHit = false;

        function animateCar() {
            carY -= 12;
            carScale += 0.04;
            
            killerCar.style.bottom = carY + 'px';
            killerCar.style.transform = `scale(${carScale})`;

            if (!isHit && carY <= 100) {
                isHit = true;
            }

            if (isHit) {
                player.style.bottom = carY + 'px'; 
            }

            if (carY < -300) {
                // ── AUDIO: coche fuera de pantalla → paramos el sonido ────────
                audioCochePass.pause();
                audioCochePass.currentTime = 0;
                // ─────────────────────────────────────────────────────────────
                gameOverScreen.style.display = 'flex';
                player.style.display = 'none';
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
        victoryScreen.style.display = 'flex';
    }

    // === BOTÓN VOLVER A JUGAR ===
    btnPlayAgain.addEventListener('click', () => {
        victoryScreen.style.display = 'none';

        hasSpokenAtCrosswalk = false;
        isCrossingBadly      = false;
        isDead               = false;
        isLevelFinished      = false;
        isWaitingForLight    = false;

        loadLevel2();
    });

    // === ANIMACIÓN DE VIDEO DEL AUTOBÚS (CINEMÁTICA FINAL) ===
    function playBusVideo() {
        velocity = 0;
        keys.a = false;
        keys.d = false;
        setIdle();

        // Paramos el motor antes de reproducir el vídeo del autobús
        stopCarAudio();
        
        busVideoScreen.style.display = 'flex';
        busVideo.play();

        busVideo.onended = () => {
            busVideoScreen.style.display = 'none';
            triggerVictory();
        };
    }

    // === FUNCIONES AUXILIARES MINIJUEGO PATINETE ===
    function spawnRock() {
        const rock = document.createElement('img');
        rock.src = 'imagenes/roca.png';
        rock.className = 'obstacle-rock';
        rock.style.position = 'absolute';
        rock.style.width = '50px';  
        rock.style.zIndex = '5';    
        rock.style.left = '850px';  

        const carrilArriba = 400;
        const carrilAbajo = 180;
        
        if (Math.random() > 0.5) {
            rock.style.bottom = carrilArriba + 'px';
        } else {
            rock.style.bottom = carrilAbajo + 'px';
        }

        container.appendChild(rock);
        rocks.push(rock); 
    }

    function check2DCollision(rect1, rect2, margin = 10) {
        return !(
            rect1.top + margin    > rect2.bottom - margin ||
            rect1.bottom - margin < rect2.top + margin    ||
            rect1.right - margin  < rect2.left + margin   ||
            rect1.left + margin   > rect2.right - margin
        );
    }

    function triggerScooterDeath() {
        isMinigameActive = false;
        isDead = true;
        velocity = 0;
        keys.w = false; keys.s = false;

        audioViento.pause();
        audioViento.currentTime = 0;
        
        container.style.transform = 'none';
        player.style.display = 'none';

        if (tutorialWS) tutorialWS.style.display = 'none';
        scooterVideoScreen.style.display = 'flex';
        scooterVideo.currentTime = 0;
        scooterVideo.play();

        function startFreezeLogic() {
            const freezeTime = scooterVideo.duration * 0.75;

            const videoCheckInterval = setInterval(() => {
                if (scooterVideo.currentTime >= freezeTime) {
                    scooterVideo.pause();
                    clearInterval(videoCheckInterval);

                    setTimeout(() => {
                        dialogueBox.style.zIndex = '5001';
                        isScooterFinesPlaying = true;
                        scooterFinesStep = 0;
                        showNextScooterFinesDialogue();
                    }, 500);
                }
            }, 100);
        }

        if (scooterVideo.readyState >= 1) {
            startFreezeLogic();
        } else {
            scooterVideo.onloadedmetadata = startFreezeLogic;
        }
    }

    function showNextScooterFinesDialogue() {
        if (scooterFinesStep < scooterFinesDialogue.length) {
            isDialogueActive = true;
            dialogueBox.style.display = 'block';
            
            const line = scooterFinesDialogue[scooterFinesStep];
            speakerName.textContent = line.name + ":";
            speakerName.className = "speaker-name " + line.class;
            dialogueText.textContent = line.text;

            scooterFinesStep++;
        } else {
            isDialogueActive = false;
            isScooterFinesPlaying = false;
            dialogueBox.style.display = 'none';
            scooterVideoScreen.style.display = 'none';

            const titleEl = document.getElementById('game-over-title');
            if (titleEl) titleEl.innerText = "T'HAN ENXAMPAT!";
            if (gameOverText) gameOverText.innerText = "Has rebut 140 euros de multes per no respectar les normes del patinet.";

            document.getElementById('btn-retry').style.display = 'none';
            document.getElementById('btn-new-path').style.display = 'inline-block';

            gameOverScreen.style.display = 'flex';
        }
    }

    // === ANIMACIÓ ÀVIA (LEVEL COCHE) ===
    function startGrandmaAnimation() {
        const grandma = document.getElementById('grandma');
        if (!grandma || grandmaActive) return;

        grandmaActive = true;
        grandma.style.display = 'block';

        let gWidth  = 4;
        let gBottom = 445;
        let gX      = 460;

        grandma.style.width      = gWidth  + 'px';
        grandma.style.bottom     = gBottom + 'px';
        grandma.style.left       = gX      + 'px';
        grandma.style.display    = 'block';

        function animateGrandma() {
            if (!grandmaActive) return;

            let speedFactor = gWidth / 30;

            gWidth  += 0.4 + speedFactor;
            gBottom -= 1.2 + speedFactor;
            gX      -= 1.0 + speedFactor * 0.5;

            grandma.style.width  = gWidth  + 'px';
            grandma.style.bottom = gBottom + 'px';
            grandma.style.left   = gX      + 'px';

            if (gWidth >= 130 || gBottom <= 230) {
                grandmaActive = false;
                triggerGrandmaCollision();
                return;
            }

            grandmaAnimFrame = requestAnimationFrame(animateGrandma);
        }

        grandmaAnimFrame = requestAnimationFrame(animateGrandma);
    }

    function triggerGrandmaCollision() {
        container.style.animation = 'none';
        container.style.filter = 'none';

        const grandma = document.getElementById('grandma');
        if (grandma) {
            const frozenSrc = grandma.src.split('?')[0] + '?freeze=' + Date.now();
            grandma.src = frozenSrc;
        }

        const greyOverlay = document.getElementById('grey-overlay');
        if (greyOverlay) {
            greyOverlay.style.display = 'block';
            requestAnimationFrame(() => {
                greyOverlay.style.opacity = '1';
            });
        }
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
        if (currentLevel === 5) {
            const newSrc = 'imagenes/patinete.gif';
            if(currentAnimation !== newSrc) {
                currentAnimation = newSrc;
                img.src = newSrc;
            }
            return;
        }
        img.style.transform = 'scaleX(1)';
        const newSrc = direction === 'left' ? gifs.idleLeft : gifs.idleRight;
        if(currentAnimation !== newSrc) {
            currentAnimation = newSrc;
            img.src = newSrc;
        }
    }

    function setRun(dir){
        if (currentLevel === 5) {
            const newSrc = 'imagenes/patinete.gif';
            if(currentAnimation !== newSrc) {
                currentAnimation = newSrc;
                img.src = newSrc;
            }
            img.style.transform = dir === 'left' ? 'scaleX(-1)' : 'scaleX(1)';
            return;
        }

        img.style.transform = 'scaleX(1)';
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
        // ── AUDIO: paramos disco y motor al volver al menú de caminos ─────────
        stopAllAudio();
        // ─────────────────────────────────────────────────────────────────────

        currentLevel = 2;
        isParkUnlocked = false;
        promptPark.classList.remove('unlocked');
        isTransitioning = false;
        isDead = false;
        isMinigameActive = false;
        isScooterFinesPlaying = false;
        scooterFinesStep = 0;
        isDialogueActive = false;
        isConfirmationActive = false;
        currentInteraction = null;
        dialogueBox.style.display = 'none';
        dialogueBox.style.zIndex = '5001';
        confirmationModal.style.display = 'none';
        scooterVideoScreen.style.display = 'none';
        gameOverScreen.style.display = 'none';

        rocks.forEach(r => r.remove());
        rocks = [];

        container.classList.remove('level-patinete', 'level-3', 'level-4', 'level-coche');
        container.style.transform = 'none';
        container.style.animation = '';
        container.style.filter    = '';
        if (tutorialWS) tutorialWS.style.display = '';
        container.style.backgroundImage = '';

        level1Exit.style.display = 'none';

        player.style.display = 'block';
        player.style.bottom = '80px';
        player.style.transform = 'scale(1)';
        posX = 50;
        velocity = 0;
        direction = 'right';
        player.style.left = posX + 'px';

        container.classList.add('level-2');
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
        isCrossingBadly = false;
        isDead = false;
        isLevelFinished = false; 
        isWaitingForLight = false; 
        container.style.backgroundImage = "";

        blackCurtain.style.opacity = '1';
        killerCar.style.display = 'none'; 
        
        player.style.display = 'block';
        player.style.transform = 'scale(1)';
        player.style.bottom = '80px';
        
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

    function checkInteractionsLevel2() {
        const playerRect      = player.getBoundingClientRect();
        const containerRect   = container.getBoundingClientRect();
        const relativePlayerX = (playerRect.left + playerRect.width / 2) - containerRect.left;

        if (isParkUnlocked) {
            promptSign.classList.remove('visible');
            promptScooter.classList.remove('visible');
            promptCar.classList.remove('visible');
            return;
        }

        if (Math.abs(relativePlayerX - 75)  < 60) promptSign.classList.add('visible');
        else promptSign.classList.remove('visible');

        if (Math.abs(relativePlayerX - 320) < 60) promptScooter.classList.add('visible');
        else promptScooter.classList.remove('visible');

        if (Math.abs(relativePlayerX - 600) < 60) promptCar.classList.add('visible');
        else promptCar.classList.remove('visible');
    }

    function loadLevelPatinete() {
        if (isTransitioning) return;
        isTransitioning = true;
        currentLevel    = 5;
        blackCurtain.style.opacity = '1';

        setTimeout(() => {
            container.classList.remove('level-2');
            container.classList.add('level-patinete');

            if (tutorialTeclas) tutorialTeclas.style.display = 'none';

            rocks.forEach(rock => rock.remove());
            rocks            = [];
            rockSpawnTimer   = 0;
            isMinigameActive = true;
            isDead           = false;
            rockSpeed        = 5;
            drunkFrameCount  = 0;
            dizzinessLevel   = 0;
            container.style.transform = 'none';

            player.style.display   = 'block';
            posX = 50; velocity = 0; direction = 'right';
            player.style.left      = posX + 'px';
            player.style.transform = 'scale(0.7)';
            posY = 220;
            player.style.bottom    = posY + 'px';
            setIdle();

            audioViento.currentTime = 0;
            audioViento.play().catch(() => {});
            setTimeout(() => {
                blackCurtain.style.opacity = '0';
                setTimeout(() => { isTransitioning = false; }, 600);
            }, 500);
        }, 1000);
    }

    // === CARGAR NIVEL COCHE ===
    function loadLevelCoche() {
        if (isTransitioning) return;
        isTransitioning = true;
        currentLevel = 6;

        blackCurtain.style.opacity = '1';

        setTimeout(() => {
            container.classList.remove('level-2', 'level-3', 'level-4', 'level-patinete');
            container.classList.add('level-coche');
            container.style.transform = 'none';
            container.style.backgroundImage = '';

            isDead = false;
            isLevelFinished = false;
            isCrossingBadly = false;
            isWaitingForLight = false;
            isMinigameActive = false;
            killerCar.style.display = 'none';
            rocks.forEach(r => r.remove());
            rocks = [];

            grandmaActive = false;
            grandmaHasStarted = false;
            if (grandmaAnimFrame) { cancelAnimationFrame(grandmaAnimFrame); grandmaAnimFrame = null; }
            container.style.animation = '';
            container.style.filter    = '';
            const grandmaEl = document.getElementById('grandma');
            if (grandmaEl) grandmaEl.style.display = 'none';
            const greyEl = document.getElementById('grey-overlay');
            if (greyEl) { greyEl.style.display = 'none'; greyEl.style.opacity = '0'; }

            player.style.display = 'block';
            player.style.bottom = '80px';
            player.style.transform = 'scale(1)';
            posX = 0;
            velocity = 0;
            direction = 'right';
            player.style.left = posX + 'px';
            setIdle();

            // ── AUDIO: motor en bucle mientras conducimos ─────────────────────
            audioMotor.currentTime = 0;
            audioMotor.play().catch(() => {});
            // ─────────────────────────────────────────────────────────────────

            showMessage(
                "Narrador", "name-narrador",
                "Has decidit agafar el cotxe. Però has begut aquesta nit... Conduir ara podria tenir conseqüències molt greus.",
                null
            );

            setTimeout(() => {
                blackCurtain.style.opacity = '0';
                setTimeout(() => { isTransitioning = false; }, 600);
            }, 500);

        }, 1000);
    }

    // 8. INPUTS (TECLADO)
    window.addEventListener('keydown', (e) => {
        if (!gameStarted) return;
        
        if (isWaitingForLight) return; 

        const key = e.key.toLowerCase();
       
        if(key === 'e' && isDialogueActive) {
            if (isScooterFinesPlaying) {
                showNextScooterFinesDialogue();
                return;
            }
            
            if (!isInitialized) {
                showNextDialogue();
            } else {
                if (currentInteraction === 'paso-peatones') {
                    openConfirmation();
                } else if (['cartel', 'scooter', 'coche'].includes(currentInteraction)) {
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
        if(key === 'w' || e.key === 'ArrowUp') keys.w = true;
        if(key === 's' || e.key === 'ArrowDown') keys.s = true;

        if(key === 'e' && !isDialogueActive && !isConfirmationActive) {
            const playerRect = player.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            const relativeX = (playerRect.left + playerRect.width / 2) - containerRect.left;

            if (isNearExit && currentLevel === 1) loadLevel2();

            if (currentLevel === 2) {
                if (isParkUnlocked && Math.abs(relativeX - 500) < 100) { loadLevel3(); return; }
                if (!isParkUnlocked) {
                    if (Math.abs(relativeX - 75) < 60) showMessage("Torrent", "name-torrent", "La meva casa està molt lluny.", "cartel");
                    else if (Math.abs(relativeX - 320) < 60) showMessage("Torrent", "name-torrent", "Hi ha un patinet aquí. Puc agafar-lo per arribar més ràpid, però no porto casc. L'agafo?", "scooter");
                    else if (Math.abs(relativeX - 600) < 100) showMessage("Torrent", "name-torrent", "No sé si estic en bones condicions per conduir...", "coche");
                }
            }
        }
    });

    window.addEventListener('keyup', (e) => {
        const key = e.key.toLowerCase();
        if(key === 'a') keys.a = false;
        if(key === 'd') keys.d = false;
        if(key === 'w' || e.key === 'ArrowUp') keys.w = false;
        if(key === 's' || e.key === 'ArrowDown') keys.s = false;
    });

    // 9. LOOP PRINCIPAL
    function loop(){
        if (!isInitialized || isDialogueActive || isConfirmationActive) {
             if(isInitialized) requestAnimationFrame(loop);
             return;
        }

        // --- LÓGICA EXCLUSIVA PARA EL PATINETE (NIVEL 5) ---
        if (currentLevel === 5) {
            if (!isMinigameActive || isDead) {
                requestAnimationFrame(loop);
                return;
            }

            drunkFrameCount++;
            if (drunkFrameCount % 300 === 0) { 
                rockSpeed += 1.5;
                dizzinessLevel += 0.8;
            }

            if (dizzinessLevel > 0) {
                let rotacion = Math.sin(drunkFrameCount * 0.03) * dizzinessLevel;
                let movY = Math.cos(drunkFrameCount * 0.04) * (dizzinessLevel * 2);
                container.style.transform = `rotate(${rotacion}deg) translateY(${movY}px) scale(1.05)`;
            }

            let speedY = 0;
            const VELOCIDAD_PATINETE = 4; 

            if (keys.w) speedY = VELOCIDAD_PATINETE;
            if (keys.s) speedY = -VELOCIDAD_PATINETE;

            let perdidaEquilibrio = Math.sin(drunkFrameCount * 0.05) * (dizzinessLevel * 1.5);

            if (speedY !== 0 || perdidaEquilibrio !== 0) {
                posY += speedY + perdidaEquilibrio;
                if (posY > 340) posY = 340;
                if (posY < 150) posY = 150;
                player.style.bottom = posY + 'px';
            }
            setRun('right');

            rockSpawnTimer++;
            let tiempoSpawn = Math.max(40, 90 - (dizzinessLevel * 10)); 
            
            if (rockSpawnTimer > tiempoSpawn) {
                spawnRock();
                rockSpawnTimer = 0;
            }

            const playerRect = player.getBoundingClientRect();

            for (let i = rocks.length - 1; i >= 0; i--) {
                const rock = rocks[i];
                
                let currentRockX = parseFloat(rock.style.left);
                currentRockX -= rockSpeed; 
                rock.style.left = currentRockX + 'px';

                const rockRect = rock.getBoundingClientRect();
                if (check2DCollision(playerRect, rockRect, 15)) { 
                    triggerScooterDeath();
                    requestAnimationFrame(loop); 
                    return;
                }

                if (currentRockX < -100) {
                    rock.remove();      
                    rocks.splice(i, 1); 
                }
            }

        }
        // --- LÓGICA NORMAL (NIVELES 1 AL 4 Y 6) ---
        else {
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

            // ── AUDIO: música de discoteca al arrancar el nivel 1 ─────────────
            audioDisco.currentTime = 0;
            audioDisco.play().catch(() => {});
            // ─────────────────────────────────────────────────────────────────

            posX = 50; applyPosition(); setIdle();
            setTimeout(() => { 
                blackCurtain.style.opacity = '0'; 
                showNextDialogue(); 
            }, 500);
        }, 800);
    }

    if(img.complete) { window.addEventListener('keydown', handleStartInput); }
    else { img.onload = () => { window.addEventListener('keydown', handleStartInput); }; }

    btnRetry.addEventListener('click', () => {
        gameOverScreen.style.display = 'none';
        isScooterFinesPlaying = false;
        scooterFinesStep = 0;
        
        if (currentLevel === 5) {
            loadLevelPatinete();
        } else {
            loadLevel4();
        }
    });

    document.getElementById('btn-new-path').addEventListener('click', () => {
        gameOverScreen.style.display = 'none';
        const titleEl = document.getElementById('game-over-title');
        if (titleEl) titleEl.innerText = "HAS ESTAT ATROPELLAT!";
        document.getElementById('btn-retry').style.display = 'inline-block';
        document.getElementById('btn-new-path').style.display = 'none';
        dialogueBox.style.zIndex = '';

        isScooterFinesPlaying = false;
        scooterFinesStep = 0;
        rocks.forEach(r => r.remove());
        rocks = [];

        loadLevel2();
    });

})();