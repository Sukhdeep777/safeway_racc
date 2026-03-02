import { state } from '../core.js';
import { player, container } from '../ui.js';
import { setRun, check2DCollision, triggerScooterDeath, spawnRock } from './utilsPatinete.js';

export function updateLevelPatinete(state){
    if(!state.isMinigameActive || state.isDead) return;

    state.drunkFrameCount++;
    if(state.drunkFrameCount%300===0){ state.rockSpeed+=1.5; state.dizzinessLevel+=0.8; }

    if(state.dizzinessLevel>0){
        let rot=Math.sin(state.drunkFrameCount*0.03)*state.dizzinessLevel;
        let movY=Math.cos(state.drunkFrameCount*0.04)*(state.dizzinessLevel*2);
        container.style.transform=`rotate(${rot}deg) translateY(${movY}px) scale(1.05)`;
    }

    let speedY=0;
    const VELOCIDAD_PATINETE=4;
    if(state.keys.w) speedY=VELOCIDAD_PATINETE;
    if(state.keys.s) speedY=-VELOCIDAD_PATINETE;

    let perdidaEquilibrio=Math.sin(state.drunkFrameCount*0.05)*(state.dizzinessLevel*1.5);
    if(speedY!==0 || perdidaEquilibrio!==0){
        state.posY+=speedY+perdidaEquilibrio;
        if(state.posY>340) state.posY=340;
        if(state.posY<150) state.posY=150;
        player.style.bottom=state.posY+'px';
    }

    setRun(state,'right');

    state.rockSpawnTimer++;
    let tiempoSpawn=Math.max(40,90-(state.dizzinessLevel*10));
    if(state.rockSpawnTimer>tiempoSpawn){ spawnRock(); state.rockSpawnTimer=0; }

    const playerRect=player.getBoundingClientRect();
    for(let i=state.rocks.length-1;i>=0;i--){
        const rock=state.rocks[i];
        let x=parseFloat(rock.style.left)-state.rockSpeed;
        rock.style.left=x+'px';
        if(check2DCollision(playerRect, rock.getBoundingClientRect(),15)){ triggerScooterDeath(); return; }
        if(x<-100){ rock.remove(); state.rocks.splice(i,1); }
    }
}