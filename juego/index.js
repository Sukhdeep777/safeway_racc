(() => {
    // --- Referencias al DOM ---
    const img = document.getElementById('player-img');
    const player = document.getElementById('player');
    const container = document.querySelector('.game-container');
    
    // Referencias para la puerta y el nivel
    const level1Exit = document.getElementById('level1-exit');
    const keyPrompt = document.getElementById('key-prompt');
    
    // --- Configuración de Animaciones ---
    const gifs = {
        rightRun: 'animaciones/correr-derecho.gif',
        leftRun: 'animaciones/correr-izquierda.gif',
        idleRight: 'animaciones/paradoderecha.gif',
        idleLeft: 'animaciones/paradoizquierda.gif'
    };

    // Preload (Mejorado para incluir la UI)
    const preloadedGifs = {};
    Object.entries(gifs).forEach(([key, path]) => {
        const preload = new Image();
        preload.src = path;
    });

    // --- Variables de Juego ---
    let velocity = 0;
    const MAX_SPEED = 4;
    const ACCELERATION = 0.5;
    const friction = 0.85;
    let direction = 'right'; 
    let currentAnimation = null;
    
    // Estado del juego
    let currentLevel = 1;
    let isNearExit = false; 
    let posX = 0;
    let isInitialized = false;

    // Teclas
    const keys = { 
        a: false, 
        d: false,
        e: false // Añadimos la tecla de interacción
    };

    // --- Lógica de Posición ---
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
        // Límites de pantalla
        if(posX < bounds.min) posX = bounds.min;
        if(posX > bounds.max) posX = bounds.max;
        
        player.style.left = posX + 'px';
        
        // Revisar interacciones después de moverse
        checkInteractions(); 
    }

    // --- Sistema de Animación ---
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

    // --- Sistema de Interacción (NUEVO) ---
    function checkInteractions() {
        if (currentLevel !== 1) return; // Solo funciona en nivel 1

        const playerRect = player.getBoundingClientRect();
        const doorRect = level1Exit.getBoundingClientRect();

        // Calculamos la distancia entre el centro del jugador y el centro de la puerta
        const playerCenter = playerRect.left + (playerRect.width / 2);
        const doorCenter = doorRect.left + (doorRect.width / 2);
        const distance = Math.abs(playerCenter - doorCenter);

        // Si está a menos de 100px de la puerta
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
        console.log("¡Cambiando al Nivel 2!");
        currentLevel = 2;
        
        // 1. Ocultar elementos del Nivel 1
        level1Exit.style.display = 'none';

        // 2. Cambiar estilo del contenedor (Fondo)
        container.classList.add('level-2');

        // 3. Resetear posición del jugador (aparece al inicio)
        posX = 50; 
        velocity = 0;
        direction = 'right';
        applyPosition();
        setIdle();

        // Opcional: Aquí podrías cargar nuevos obstáculos o enemigos
        alert("¡Has pasado al Nivel 2!"); // Feedback temporal
    }

    // --- Manejo de Teclado ---
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
        // Detectar tecla E
        if(key === 'e'){
            if (isNearExit && currentLevel === 1) {
                loadLevel2();
            }
        }
    });

    window.addEventListener('keyup', (e) => {
        const key = e.key.toLowerCase();

        if(key === 'a'){
            keys.a = false;
            if(!keys.d){ velocity *= friction; } 
            else { direction = 'right'; velocity = Math.min(velocity + ACCELERATION, MAX_SPEED); setRun('right'); }
        }
        if(key === 'd'){
            keys.d = false;
            if(!keys.a){ velocity *= friction; } 
            else { direction = 'left'; velocity = Math.max(velocity - ACCELERATION, -MAX_SPEED); setRun('left'); }
        }
    });

    window.addEventListener('resize', () => {
        if(isInitialized) applyPosition();
    });

    // --- Bucle Principal ---
    function init(){
        if(isInitialized) return;
        const rect = container.getBoundingClientRect();
        const pRect = player.getBoundingClientRect();
        
        // Empezar a la izquierda
        posX = 50; 
        
        applyPosition();
        setIdle();
        isInitialized = true;
    }

    function loop(){
        // Movimiento
        if(keys.d && velocity < MAX_SPEED) velocity = Math.min(velocity + ACCELERATION, MAX_SPEED);
        if(keys.a && velocity > -MAX_SPEED) velocity = Math.max(velocity - ACCELERATION, -MAX_SPEED);
        
        if(!keys.a && !keys.d) {
            velocity *= friction;
            if(Math.abs(velocity) < 0.05) { 
                velocity = 0; 
                setIdle();
            }
        }

        if(velocity !== 0){
            posX += velocity;
            applyPosition();
        }
        
        requestAnimationFrame(loop);
    }

    // Inicio
    if(img.complete) { init(); requestAnimationFrame(loop); }
    else { img.onload = () => { init(); requestAnimationFrame(loop); } }

})();