(() => {
    // 1. REFERENCIAS AL DOM
    const img = document.getElementById('player-img');
    const player = document.getElementById('player');
    const container = document.querySelector('.game-container');
    const level1Exit = document.getElementById('level1-exit');
    const keyPrompt = document.getElementById('key-prompt');
    const introScreen = document.getElementById('intro-screen');
    const blackCurtain = document.getElementById('black-curtain');
    
    // --- ESTA ERA LA LÍNEA QUE FALTABA ---
    const carObstacle = document.getElementById('car-obstacle'); 
    // -------------------------------------

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

    // 4. LÓGICA DE MOVIMIENTO Y LÍMITES
    function updateBounds(){
        const rect = container.getBoundingClientRect();
        const pRect = player.getBoundingClientRect();
        return { min: 0, max: rect.width - pRect.width };
    }

    function applyPosition(){
        const bounds = updateBounds();
        
        // Mantener dentro de la pantalla
        if(posX < bounds.min) posX = bounds.min;
        if(posX > bounds.max) posX = bounds.max;
        
        player.style.left = posX + 'px';
        
        checkInteractions(); 
    }

    // --- LÓGICA DE COLISIÓN CON EL COCHE ---
    function checkCollision(nextX) {
        if (currentLevel !== 2) return false; // Solo en nivel 2

        // Posición del coche (obstáculo)
        const carStyle = window.getComputedStyle(carObstacle);
        const carLeft = parseInt(carStyle.left);
        const carWidth = parseInt(carStyle.width); // Usamos el ancho definido en CSS (250px)

        // Posición futura del jugador
        const playerWidth = player.getBoundingClientRect().width;
        const playerRightSide = nextX + playerWidth;
        const playerLeftSide = nextX;

        // Zona de colisión: El morro del coche
        // El coche está en left: 600px.
        // Si el jugador va hacia la derecha y su lado derecho toca el coche:
        if (velocity > 0 && playerRightSide > carLeft + 20 && playerLeftSide < carLeft + carWidth) {
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

    // 5. INTERACCIONES (PUERTA NIVEL 1)
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
        
        // Ocultar cosas del nivel 1
        level1Exit.style.display = 'none';
        
        // Cambiar fondo
        container.classList.add('level-2');
        
        // Resetear posición jugador al inicio
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
            keys.a = true; 
        }
        if(key === 'd'){
            keys.d = true; 
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
        // A. Cambiar dirección visual (instantáneo)
        if (keys.a && !keys.d) direction = 'left';
        if (keys.d && !keys.a) direction = 'right';

        // B. Calcular Velocidad
        if(keys.d && velocity < MAX_SPEED) velocity = Math.min(velocity + ACCELERATION, MAX_SPEED);
        if(keys.a && velocity > -MAX_SPEED) velocity = Math.max(velocity - ACCELERATION, -MAX_SPEED);
        
        // Fricción (frenar si no pulso nada)
        if(!keys.a && !keys.d) {
            velocity *= friction;
            if(Math.abs(velocity) < 0.05) velocity = 0;
        }

        // C. ANIMACIÓN
        if (velocity === 0) {
            setIdle();
        } else {
            setRun(direction);
        }

        // D. MOVIMIENTO Y COLISIÓN
        if(velocity !== 0){ 
            // Predecir dónde estaría el jugador
            const nextX = posX + velocity;

            // Verificar si choca con el coche
            if (checkCollision(nextX)) {
                // ¡CHOCA! Frenar en seco y no actualizar posición
                velocity = 0;
                setIdle();
            } else {
                // NO CHOCA: Aplicar movimiento
                posX = nextX;
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
        
        // Efecto visual
        blackCurtain.style.opacity = '1';

        setTimeout(() => {
            introScreen.style.display = 'none';
            introScreen.querySelector('video').pause(); // Parar video para ahorrar recursos
            init(); 
            setTimeout(() => { blackCurtain.style.opacity = '0'; }, 500);
        }, 1500);
    }

    // Esperar a que cargue la imagen principal
    if(img.complete) { 
        window.addEventListener('keydown', handleStartInput); 
    } else {
        img.onload = () => { window.addEventListener('keydown', handleStartInput); };
    }

})();