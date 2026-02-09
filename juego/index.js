// Movimiento del jugador y cambio de GIFs (teclas 'a' y 'd')
(() => {
    const img = document.getElementById('player-img');
    const player = document.getElementById('player');
    const container = document.querySelector('.game-container');

    const gifs = {
        rightRun: 'animaciones/correr-derecho.gif',
        leftRun: 'animaciones/correr-izquierda.gif',
        idleRight: 'animaciones/paradoderecha.gif',
        idleLeft: 'animaciones/paradoizquierda.gif'
    };

    let velocity = 0; // px per frame (modified by speed)
    const MAX_SPEED = 1.2; // max speed in px per frame
    const ACCELERATION = 0.06; // acceleration rate
    const friction = 0.92; // deceleration factor (0-1)
    let direction = 'right'; // last facing direction
    const keys = { a: false, d: false };

    // Position in px from left of container
    let posX = 0;

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
        if(posX < bounds.min) posX = bounds.min;
        if(posX > bounds.max) posX = bounds.max;
        player.style.left = posX + 'px';
    }

    function setIdle(){
        img.src = direction === 'left' ? gifs.idleLeft : gifs.idleRight;
    }

    function setRun(dir){
        if(dir === 'left') img.src = gifs.leftRun;
        else img.src = gifs.rightRun;
    }

    // Keyboard
    window.addEventListener('keydown', (e) => {
        if(e.key === 'a' || e.key === 'A'){
            keys.a = true;
            direction = 'left';
            if(velocity > -MAX_SPEED) velocity = Math.max(velocity - ACCELERATION, -MAX_SPEED);
            setRun('left');
        }
        if(e.key === 'd' || e.key === 'D'){
            keys.d = true;
            direction = 'right';
            if(velocity < MAX_SPEED) velocity = Math.min(velocity + ACCELERATION, MAX_SPEED);
            setRun('right');
        }
    });

    window.addEventListener('keyup', (e) => {
        if(e.key === 'a' || e.key === 'A'){
            keys.a = false;
            if(!keys.d){ velocity *= friction; } else { direction = 'right'; velocity = Math.min(velocity + ACCELERATION, MAX_SPEED); setRun('right'); }
        }
        if(e.key === 'd' || e.key === 'D'){
            keys.d = false;
            if(!keys.a){ velocity *= friction; } else { direction = 'left'; velocity = Math.max(velocity - ACCELERATION, -MAX_SPEED); setRun('left'); }
        }
    });

    // On window resize ensure player stays in bounds
    window.addEventListener('resize', () => applyPosition());

    // Initialize position centered horizontally
    function init(){
        const rect = container.getBoundingClientRect();
        const pRect = player.getBoundingClientRect();
        posX = Math.max(0, (rect.width - pRect.width) / 2);
        applyPosition();
    }

    function loop(){
        // Apply acceleration for held keys
        if(keys.d && velocity < MAX_SPEED) velocity = Math.min(velocity + ACCELERATION, MAX_SPEED);
        if(keys.a && velocity > -MAX_SPEED) velocity = Math.max(velocity - ACCELERATION, -MAX_SPEED);
        
        // Apply friction when no keys are held
        if(!keys.a && !keys.d) {
            velocity *= friction;
            if(Math.abs(velocity) < 0.05) { velocity = 0; setIdle(); }
        }

        if(velocity !== 0){
            posX += velocity;
            applyPosition();
        }
        requestAnimationFrame(loop);
    }

    // Wait image load to initialize sizes
    if(img.complete) { init(); requestAnimationFrame(loop); }
    else { img.onload = () => { init(); requestAnimationFrame(loop); } }

})();
