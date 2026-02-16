(() => {
    // 1. REFERENCIAS AL DOM
    const img = document.getElementById('player-img');
    const player = document.getElementById('player');
    const container = document.querySelector('.game-container');
    
    // Nivel 1
    const level1Exit = document.getElementById('level1-exit');
    const keyPrompt = document.getElementById('key-prompt');
    
    // Nivel 2 (Nuevas referencias)
    const promptSign = document.getElementById('prompt-sign');     // Cartel
    const promptScooter = document.getElementById('prompt-scooter'); // Patinete
    const promptCar = document.getElementById('prompt-car');       // Coche

    const introScreen = document.getElementById('intro-screen');
    const blackCurtain = document.getElementById('black-curtain');
    const carObstacle = document.getElementById('car-obstacle'); 

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

    // 3. VARIABLES
    let velocity = 0;
    const MAX_SPEED = 4;       
    const ACCELERATION = 0.5;  
    const friction = 0.85;
    let direction = 'right'; 
    let currentAnimation = null;
    let currentLevel = 1;
    let posX = 0;
    let isInitialized = false;
    let gameStarted = false; 
    
    let isNearExit = false; // Solo para nivel 1

    const keys = { a: false, d: false, e: false };

    // 4. LÓGICA DE MOVIMIENTO
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
        
        // Comprobar interacciones en cada movimiento
        checkInteractions(); 
    }

    // Colisión con el coche invisible (Solo Nivel 2)
    function checkCollision(nextX) {
        if (currentLevel !== 2) return false;
        
        const carStyle = window.getComputedStyle(carObstacle);
        const carLeft = parseInt(carStyle.left); 
        const carWidth = parseInt(carStyle.width); 

        const playerWidth = player.getBoundingClientRect().width;
        
        // Zona del obstáculo
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

    // 5. SISTEMA DE INTERACCIONES (NIVEL 1 Y 2)
    function checkInteractions() {
        // Obtenemos la posición X del centro del jugador relativa al juego
        const playerRect = player.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const relativePlayerX = (playerRect.left + playerRect.width / 2) - containerRect.left;

        // --- NIVEL 1: PUERTA ---
        if (currentLevel === 1) {
            if(!level1Exit || level1Exit.style.display === 'none') return;
            const doorRect = level1Exit.getBoundingClientRect();
            const doorCenter = (doorRect.left + doorRect.width/2) - containerRect.left;
            
            const dist = Math.abs(relativePlayerX - doorCenter);
            if (dist < 100) {
                if (!isNearExit) { isNearExit = true; keyPrompt.classList.add('visible'); }
            } else {
                if (isNearExit) { isNearExit = false; keyPrompt.classList.remove('visible'); }
            }
        }

        // --- NIVEL 2: CARTEL, PATINETE, COCHE ---
        if (currentLevel === 2) {
            // Definimos las zonas donde se activan las teclas (coinciden con el HTML)
            
            // 1. Cartel (Alrededor de 150px)
            if (Math.abs(relativePlayerX - 190) < 70) {
                promptSign.classList.add('visible');
            } else {
                promptSign.classList.remove('visible');
            }

            // 2. Patinete (Alrededor de 450px)
            if (Math.abs(relativePlayerX - 490) < 70) {
                promptScooter.classList.add('visible');
            } else {
                promptScooter.classList.remove('visible');
            }

            // 3. Coche (Alrededor de 700px)
            if (Math.abs(relativePlayerX - 750) < 100) {
                promptCar.classList.add('visible');
            } else {
                promptCar.classList.remove('visible');
            }
        }
    }

    function loadLevel2() {
        console.log("Cambiando al Nivel 2...");
        currentLevel = 2;
        
        // Ocultar Nivel 1
        level1Exit.style.display = 'none';
        
        // Activar Nivel 2 (CSS y elementos)
        container.classList.add('level-2');
        
        // Reset jugador
        posX = 50; 
        velocity = 0;
        direction = 'right';
        player.style.left = posX + 'px';
        setIdle();
    }

    // 6. INPUTS
    window.addEventListener('keydown', (e) => {
        if (!gameStarted) return;
        const key = e.key.toLowerCase();
        
        if(key === 'a') keys.a = true;
        if(key === 'd') keys.d = true;
        
        if(key === 'e') {
            // Acción en Nivel 1: Cambiar de nivel
            if (isNearExit && currentLevel === 1) {
                loadLevel2();
            }
            // Acción en Nivel 2: Aquí puedes poner lógica futura
        }
    });

    window.addEventListener('keyup', (e) => {
        if (!gameStarted) return;
        const key = e.key.toLowerCase();
        if(key === 'a') keys.a = false;
        if(key === 'd') keys.d = false;
    });

    window.addEventListener('resize', () => { if(isInitialized) applyPosition(); });

    // 7. LOOP PRINCIPAL
    function init(){
        if(isInitialized) return;
        posX = 50; 
        applyPosition();
        setIdle();
        isInitialized = true;
        requestAnimationFrame(loop);
    }

    function loop(){
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
            // Choque solo si vamos hacia adelante y golpeamos el coche en Nivel 2
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

    // 8. INICIO
    function handleStartInput() {
        if (gameStarted) return;
        gameStarted = true;
        window.removeEventListener('keydown', handleStartInput);
        blackCurtain.style.opacity = '1';

        setTimeout(() => {
            introScreen.style.display = 'none';
            introScreen.querySelector('video').pause();
            init(); 
            setTimeout(() => { blackCurtain.style.opacity = '0'; }, 500);
        }, 1500);
    }

    if(img.complete) { window.addEventListener('keydown', handleStartInput); } 
    else { img.onload = () => { window.addEventListener('keydown', handleStartInput); }; }

})();