(() => {
    // 1. REFERENCIAS AL DOM
    const img = document.getElementById('player-img');
    const player = document.getElementById('player');
    const container = document.querySelector('.game-container');
   
    // Nivel 1
    const level1Exit = document.getElementById('level1-exit');
    const keyPrompt = document.getElementById('key-prompt');
   
    // Nivel 2
    const promptSign = document.getElementById('prompt-sign');
    const promptScooter = document.getElementById('prompt-scooter');
    const promptCar = document.getElementById('prompt-car');

    const introScreen = document.getElementById('intro-screen');
    const blackCurtain = document.getElementById('black-curtain');
    const carObstacle = document.getElementById('car-obstacle');

    // Referencias Caja de Diálogo
    const dialogueBox = document.getElementById('dialogue-box');
    const speakerName = document.getElementById('speaker-name');
    const dialogueText = document.getElementById('dialogue-text');

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
    let isInitialized = false; // Importante: esto controla si podemos movernos
    let gameStarted = false;
    let isNearExit = false;
    let isDialogueActive = false;
    let currentStep = 0;

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

    // 5. LÓGICA DE DIÁLOGOS
    function showNextDialogue() {
        if (currentStep < story.length) {
            // MOSTRAR SIGUIENTE FRASE DE LA INTRO
            isDialogueActive = true;
            dialogueBox.style.display = 'block';
            
            const line = story[currentStep];
            speakerName.textContent = line.name + ":";
            speakerName.className = "speaker-name " + line.class;
            dialogueText.textContent = line.text;
            
            currentStep++;
        } else {
            // FINAL DE LA INTRO -> ACTIVAR EL JUEGO
            isDialogueActive = false;
            dialogueBox.style.display = 'none';
            isInitialized = true; // <--- ESTO ES LO QUE TE FALTABA PARA MOVERTE
            requestAnimationFrame(loop);
        }
    }

    // --- FUNCIÓN PARA MOSTRAR UN MENSAJE ÚNICO (CARTEL, ETC) ---
    function showMessage(name, cssClass, text) {
        isDialogueActive = true; 
        dialogueBox.style.display = 'block';
        
        speakerName.textContent = name + ":";
        speakerName.className = "speaker-name " + cssClass;
        dialogueText.textContent = text;
        
        velocity = 0;
        setIdle();
    }

    // --- FUNCIÓN PARA CERRAR EL MENSAJE ---
    function closeMessage() {
        isDialogueActive = false;
        dialogueBox.style.display = 'none';
    }

    // 6. MOVIMIENTO Y COLISIONES
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

    // 7. INTERACCIONES
    function checkInteractions() {
        const playerRect = player.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const relativePlayerX = (playerRect.left + playerRect.width / 2) - containerRect.left;

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

        if (currentLevel === 2) {
            if (Math.abs(relativePlayerX - 75) < 60) promptSign.classList.add('visible');
            else promptSign.classList.remove('visible');

            if (Math.abs(relativePlayerX - 320) < 60) promptScooter.classList.add('visible');
            else promptScooter.classList.remove('visible');

            if (Math.abs(relativePlayerX - 600) < 60) promptCar.classList.add('visible');
            else promptCar.classList.remove('visible');
        }
    }

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

    // 8. INPUTS (TECLADO) - *** AQUÍ ESTABA EL PROBLEMA ***
    window.addEventListener('keydown', (e) => {
        if (!gameStarted) return;
        const key = e.key.toLowerCase();
       
        // A) GESTIÓN DE DIÁLOGOS
        if(key === 'e' && isDialogueActive) {
            
            // CASO 1: Estamos en la INTRO (Aún no hemos empezado a jugar)
            if (!isInitialized) {
                showNextDialogue(); // Esto avanza la historia o activa el juego al final
            } 
            // CASO 2: Estamos jugando y leyendo un cartel
            else {
                closeMessage(); // Esto solo cierra la ventanita
            }
            return;
        }

        // B) MOVIMIENTO
        if(key === 'a') keys.a = true;
        if(key === 'd') keys.d = true;

        // C) INTERACCIONES (Solo si no hay diálogo)
        if(key === 'e' && !isDialogueActive) {
            
            const playerRect = player.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            const relativeX = (playerRect.left + playerRect.width / 2) - containerRect.left;

            if (isNearExit && currentLevel === 1) {
                loadLevel2();
            }

            if (currentLevel === 2) {
                // Interacción CARTEL
                if (Math.abs(relativeX - 75) < 60) {
                    showMessage(
                        "Torrent", 
                        "name-torrent", 
                        "És bona opció però la meva casa esta molt lluny."
                    );
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
        if (!isInitialized || isDialogueActive) {
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