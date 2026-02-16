(() => {
    // 1. REFERENCIAS AL DOM
    const img = document.getElementById('player-img');
    const player = document.getElementById('player');
    const container = document.querySelector('.game-container');
    const level1Exit = document.getElementById('level1-exit');
    const keyPrompt = document.getElementById('key-prompt');
    const introScreen = document.getElementById('intro-screen');
    const blackCurtain = document.getElementById('black-curtain');

// 4. LÓGICA DE MOVIMIENTO
    
    function checkCollision(nextX) {
        if (currentLevel !== 2) return false; // Solo funciona en nivel 2

        const carLeft = parseInt(window.getComputedStyle(carObstacle).left);
        const playerWidth = player.getBoundingClientRect().width;
        const playerRightSide = nextX + playerWidth;

        // Si el jugador va a la derecha y toca el coche...
        if (velocity > 0 && playerRightSide > (carLeft + 20)) {
            return true; 
        }
        return false;
    }
    // <--- FIN DE LO NUEVO

    function updateBounds(){
       // ... (el resto sigue igual)    
    }
    // 2. ANIMACIONES
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
    const MAX_SPEED = 3;       
    const ACCELERATION = 0.3;  
    const friction = 0.85;
    let direction = 'right'; 
    let currentAnimation = null;
    let currentLevel = 1;
    let isNearExit = false; 
    let posX = 0;
    let isInitialized = false;
    let gameStarted = false; 
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
        checkInteractions(); 
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

    // 5. INTERACCIONES
    function checkInteractions() {
        if (currentLevel !== 1) return;
        const playerRect = player.getBoundingClientRect();
        if(!level1Exit || level1Exit.style.display === 'none') return;
        const doorRect = level1Exit.getBoundingClientRect();
        const distance = Math.abs((playerRect.left + playerRect.width/2) - (doorRect.left + doorRect.width/2));

        if (distance < 100) {
            if (!isNearExit) { isNearExit = true; keyPrompt.classList.add('visible'); }
        } else {
            if (isNearExit) { isNearExit = false; keyPrompt.classList.remove('visible'); }
        }
    }

    function loadLevel2() {
        console.log("Cambiando al Nivel 2...");
        currentLevel = 2;
        level1Exit.style.display = 'none';
        container.classList.add('level-2');
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
        if(key === 'a'){
            keys.a = true; direction = 'left';
            if(velocity > -MAX_SPEED) velocity = Math.max(velocity - ACCELERATION, -MAX_SPEED);
            setRun('left');
        }
        if(key === 'd'){
            keys.d = true; direction = 'right';
            if(velocity < MAX_SPEED) velocity = Math.min(velocity + ACCELERATION, MAX_SPEED);
            setRun('right');
        }
        if(key === 'e' && isNearExit && currentLevel === 1) loadLevel2();
    });

    window.addEventListener('keyup', (e) => {
        if (!gameStarted) return;
        const key = e.key.toLowerCase();
        if(key === 'a') keys.a = false;
        if(key === 'd') keys.d = false;
    });

    window.addEventListener('resize', () => { if(isInitialized) applyPosition(); });

    // 7. LOOP
    // 7. LOOP
    function init(){
        if(isInitialized) return;
        posX = 50; 
        applyPosition();
        setIdle();
        isInitialized = true;
        requestAnimationFrame(loop);
    }

    // <--- ESTE ES EL NUEVO LOOP REEMPLAZADO:
    function loop(){
        // 1. Calcular velocidad
        if(keys.d && velocity < MAX_SPEED) velocity = Math.min(velocity + ACCELERATION, MAX_SPEED);
        if(keys.a && velocity > -MAX_SPEED) velocity = Math.max(velocity - ACCELERATION, -MAX_SPEED);
        
        if(!keys.a && !keys.d) {
            velocity *= friction;
            if(Math.abs(velocity) < 0.05) { velocity = 0; setIdle(); }
        } else {
             if(velocity !== 0) setRun(direction);
        }

        // 2. Comprobar colisión y mover
        if(velocity !== 0){ 
            // PREGUNTA: ¿Si me muevo, choco?
            if (checkCollision(posX + velocity)) {
                // SÍ CHOCO: Frenar en seco
                velocity = 0;
                setIdle(); 
            } else {
                // NO CHOCO: Moverse normal
                posX += velocity; 
                applyPosition(); 
            }
        }
        
        requestAnimationFrame(loop);
    }

    // 8. TRANSICIÓN DE INICIO
    function handleStartInput() {
        if (gameStarted) return;
        gameStarted = true;
        window.removeEventListener('keydown', handleStartInput);
        blackCurtain.style.opacity = '1';

        setTimeout(() => {
            introScreen.style.display = 'none';
            init(); 
            requestAnimationFrame(loop);
            setTimeout(() => { blackCurtain.style.opacity = '0'; }, 500);
        }, 1500);
    }

    img.onload = () => { window.addEventListener('keydown', handleStartInput); };
    if(img.complete) { window.addEventListener('keydown', handleStartInput); }

})();