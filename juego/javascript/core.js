export const state = {
    posX: 50, posY: 70,
    velocity: 0, MAX_SPEED: 3, ACCELERATION: 0.3, friction: 0.85,
    direction: 'right', currentAnimation: null, currentLevel: 1,
    keys: { a:false, d:false, w:false, s:false, e:false },
    isInitialized: false, gameStarted: false,
    isDialogueActive: false, isConfirmationActive: false,
    currentInteraction: null, currentStep: 0,
    isParkUnlocked: false, isTransitioning: false,
    isCrossingBadly: false, isDead: false,
    hasSpokenAtCrosswalk: false, isWaitingForLight: false,
    isLevelFinished: false, rocks: [], rockSpawnTimer: 0,
    isMinigameActive: false, rockSpeed: 5, drunkFrameCount: 0, dizzinessLevel: 0,
    isScooterFinesPlaying: false, scooterFinesStep: 0
};

export function loop() {
    if(!state.isInitialized || state.isDialogueActive || state.isConfirmationActive) {
        if(state.isInitialized) requestAnimationFrame(loop);
        return;
    }

    if(state.currentLevel === 5) updateLevelPatinete(state);
    else {
        // Movimiento horizontal niveles 1-4
        if(state.keys.a && !state.keys.d) state.direction = 'left';
        if(state.keys.d && !state.keys.a) state.direction = 'right';

        if(state.keys.d && state.velocity < state.MAX_SPEED) state.velocity = Math.min(state.velocity + state.ACCELERATION, state.MAX_SPEED);
        if(state.keys.a && state.velocity > -state.MAX_SPEED) state.velocity = Math.max(state.velocity - state.ACCELERATION, -state.MAX_SPEED);

        if(!state.keys.a && !state.keys.d){
            state.velocity *= state.friction;
            if(Math.abs(state.velocity)<0.05) state.velocity=0;
        }

        if(state.velocity===0) setIdle(state);
        else setRun(state, state.direction);

        if(state.velocity!==0){
            const nextX = state.posX + state.velocity;
            if(state.currentLevel===2 && state.velocity>0 && checkCollision(nextX)) state.velocity=0;
            else { state.posX = nextX; applyPosition(state); }
        }
    }

    requestAnimationFrame(loop);
}