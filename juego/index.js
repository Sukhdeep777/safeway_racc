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
    const SPEED = 4; // base speed in px per frame, adjust as needed
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
            velocity = -SPEED;
            setRun('left');
        }
        if(e.key === 'd' || e.key === 'D'){
            keys.d = true;
            direction = 'right';
            velocity = SPEED;
            setRun('right');
        }
    });

    window.addEventListener('keyup', (e) => {
        if(e.key === 'a' || e.key === 'A'){
            keys.a = false;
            if(keys.d){ direction = 'right'; velocity = SPEED; setRun('right'); }
            else { velocity = 0; setIdle(); }
        }
        if(e.key === 'd' || e.key === 'D'){
            keys.d = false;
            if(keys.a){ direction = 'left'; velocity = -SPEED; setRun('left'); }
            else { velocity = 0; setIdle(); }
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
