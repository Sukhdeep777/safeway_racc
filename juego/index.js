(() => {
    // =========================================
    // 1. REFERENCIAS AL DOM (ELEMENTOS HTML)
    // =========================================
    const img = document.getElementById('player-img');
    const player = document.getElementById('player');
    const container = document.querySelector('.game-container');
    
    // Elementos interactivos del Nivel 1
    const level1Exit = document.getElementById('level1-exit');
    const keyPrompt = document.getElementById('key-prompt');
    
    // =========================================
    // 2. CONFIGURACIÓN DE ANIMACIONES
    // =========================================
    const gifs = {
        rightRun: 'animaciones/correr-derecho.gif',
        leftRun: 'animaciones/correr-izquierda.gif',
        idleRight: 'animaciones/paradoderecha.gif',
        idleLeft: 'animaciones/paradoizquierda.gif'
    };

    // Precarga de imágenes para evitar parpadeos
    Object.values(gifs).forEach(path => {
        const preload = new Image();
        preload.src = path;
    });

    // =========================================
    // 3. VARIABLES DEL JUEGO
    // =========================================
    let velocity = 0;
    const MAX_SPEED = 4;
    const ACCELERATION = 0.5;
    const friction = 0.85;
    let direction = 'right'; 
    let currentAnimation = null;
    
    // Estado del nivel
    let currentLevel = 1;
    let isNearExit = false; 
    let posX = 0;
    let isInitialized = false;

    // Teclas presionadas
    const keys = { 
        a: false, 
        d: false,
        e: false 
    };

    // =========================================
    // 4. LÓGICA DE MOVIMIENTO Y POSICIÓN
    // =========================================
    function updateBounds(){
        const rect = container.getBoundingClientRect();
        const pRect = player.getBoundingClientRect();
        return {
            min: 0,
            max: rect.width - pRect.width
        };
    }

    function applyPosition(){
        const bounds = updateBounds();
        
        // Mantener al jugador dentro de la pantalla
        if(posX < bounds.min) posX = bounds.min;
        if(posX > bounds.max) posX = bounds.max;
        
        player.style.left = posX + 'px';
        
        // Verificar si está cerca de la puerta
        checkInteractions(); 
    }

    // Cambiar animación (Parado)
    function setIdle(){
        const newSrc = direction === 'left' ? gifs.idleLeft : gifs.idleRight;
        if(currentAnimation !== newSrc) {
            currentAnimation = newSrc;
            img.src = newSrc;
        }
    }

    // Cambiar animación (Corriendo)
    function setRun(dir){
        const newSrc = dir === 'left' ? gifs.leftRun : gifs.rightRun;
        if(currentAnimation !== newSrc) {
            currentAnimation = newSrc;
            img.src = newSrc;
        }
    }

    // =========================================
    // 5. SISTEMA DE INTERACCIÓN Y NIVELES
    // =========================================
    function checkInteractions() {
        if (currentLevel !== 1) return; // Solo funciona en nivel 1

        const playerRect = player.getBoundingClientRect();
        
        // Verificamos si level1Exit existe antes de medirlo
        if(!level1Exit || level1Exit.style.display === 'none') return;

        const doorRect = level1Exit.getBoundingClientRect();

        // Calcular distancia entre centros
        const playerCenter = playerRect.left + (playerRect.width / 2);
        const doorCenter = doorRect.left + (doorRect.width / 2);
        const distance = Math.abs(playerCenter - doorCenter);

        // Si está cerca (menos de 100px)
        if (distance < 100) {
            if (!isNearExit) {
                isNearExit = true;
                keyPrompt.classList.add('visible'); // Mostrar tecla E
            }
        } else {
            if (isNearExit) {
                isNearExit = false;
                keyPrompt.classList.remove('visible'); // Ocultar tecla E
            }
        }
    }

    function loadLevel2() {
        // --- AQUÍ HE QUITADO EL ALERT ---
        // Antes había: alert("Enhorabuena..."); ¡YA NO ESTÁ!
        
        console.log("Cambiando al Nivel 2...");
        currentLevel = 2;
        
        // 1. Ocultar la puerta y el icono del Nivel 1
        level1Exit.style.display = 'none';

        // 2. Cambiar el fondo (CSS se encarga del color/imagen)
        container.classList.add('level-2');

        // 3. Resetear al jugador al inicio (Izquierda) para que empiece el nivel 2
        posX = 50; 
        velocity = 0;
        direction = 'right';
        
        // Actualizar posición visualmente ya
        player.style.left = posX + 'px';
        setIdle();
    }

    // =========================================
    // 6. CONTROL DE TECLADO (INPUTS)
    // =========================================
    window.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();

        if(key === 'a'){
            keys.a = true;
            direction = 'left';
            if(velocity > -MAX_SPEED) velocity = Math.max(velocity - ACCELERATION, -MAX_SPEED);
            setRun('left');
        }
        if(key === 'd'){
            keys.d = true;
            direction = 'right';
            if(velocity < MAX_SPEED) velocity = Math.min(velocity + ACCELERATION, MAX_SPEED);
            setRun('right');
        }
        
        // INTERACCIÓN CON TECLA E
        if(key === 'e'){
            if (isNearExit && currentLevel === 1) {
                loadLevel2(); // ¡Cambio directo sin avisos!
            }
        }
    });

    window.addEventListener('keyup', (e) => {
        const key = e.key.toLowerCase();

        if(key === 'a'){
            keys.a = false;
        }
        if(key === 'd'){
            keys.d = false;
        }
    });

    window.addEventListener('resize', () => {
        if(isInitialized) applyPosition();
    });

    // =========================================
    // 7. BUCLE PRINCIPAL (GAME LOOP)
    // =========================================
    function init(){
        if(isInitialized) return;
        
        // Posición inicial del jugador
        posX = 50; 
        
        applyPosition();
        setIdle();
        isInitialized = true;
        
        // Arrancar el bucle de animación
        requestAnimationFrame(loop);
    }

    function loop(){
        // Movimiento continuo
        if(keys.d && velocity < MAX_SPEED) velocity = Math.min(velocity + ACCELERATION, MAX_SPEED);
        if(keys.a && velocity > -MAX_SPEED) velocity = Math.max(velocity - ACCELERATION, -MAX_SPEED);
        
        // Fricción (frenado suave)
        if(!keys.a && !keys.d) {
            velocity *= friction;
            if(Math.abs(velocity) < 0.05) { 
                velocity = 0; 
                setIdle();
            }
        } else {
             // Mantener animación de correr si hay velocidad
             if(velocity !== 0) setRun(direction);
        }

        if(velocity !== 0){
            posX += velocity;
            applyPosition();
        }
        
        requestAnimationFrame(loop);
    }

    // Arrancar el juego cuando la imagen del jugador cargue
    if(img.complete) { init(); }
    else { img.onload = () => { init(); } }

})();