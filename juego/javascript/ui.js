import { state } from './core.js';

export const img = document.getElementById('player-img');
export const player = document.getElementById('player');
export const container = document.querySelector('.game-container');
export const dialogueBox = document.getElementById('dialogue-box');
export const speakerName = document.getElementById('speaker-name');
export const dialogueText = document.getElementById('dialogue-text');
export const confirmationModal = document.getElementById('confirmation-modal');

const gifs = {
    rightRun: 'animaciones/correr-derecho.gif',
    leftRun: 'animaciones/correr-izquierda.gif',
    idleRight: 'animaciones/paradoderecha.gif',
    idleLeft: 'animaciones/paradoizquierda.gif'
};

export function setIdle(state) {
    if(state.currentLevel===5){
        const newSrc = 'imagenes/patinete.gif';
        if(state.currentAnimation!==newSrc){ state.currentAnimation=newSrc; img.src=newSrc; }
        return;
    }
    img.style.transform = 'scaleX(1)';
    const newSrc = state.direction==='left'?gifs.idleLeft:gifs.idleRight;
    if(state.currentAnimation!==newSrc){ state.currentAnimation=newSrc; img.src=newSrc; }
}

export function setRun(state, dir){
    if(state.currentLevel===5){
        const newSrc = 'imagenes/patinete.gif';
        if(state.currentAnimation!==newSrc){ state.currentAnimation=newSrc; img.src=newSrc; }
        img.style.transform = dir==='left'?'scaleX(-1)':'scaleX(1)';
        return;
    }
    img.style.transform = 'scaleX(1)';
    const newSrc = dir==='left'?gifs.leftRun:gifs.rightRun;
    if(state.currentAnimation!==newSrc){ state.currentAnimation=newSrc; img.src=newSrc; }
}

export function showMessage(name, cssClass, text, interactionType){
    state.isDialogueActive = true;
    state.currentInteraction = interactionType;
    dialogueBox.style.display = 'block';
    speakerName.textContent = name + ":";
    speakerName.className = "speaker-name "+cssClass;
    dialogueText.textContent = text;
    state.velocity=0;
    setIdle(state);
}

export function closeMessage(){ state.isDialogueActive=false; dialogueBox.style.display='none'; state.currentInteraction=null; }

export function openConfirmation(){ dialogueBox.style.display='none'; state.isDialogueActive=false; state.isConfirmationActive=true; confirmationModal.style.display='block'; }

export function closeConfirmation(){ confirmationModal.style.display='none'; state.isConfirmationActive=false; }

export function changeBackgroundSmoothly(newImgSrc){
    const fader = document.createElement('div');
    fader.style.position='absolute';
    fader.style.top='0'; fader.style.left='0';
    fader.style.width='100%'; fader.style.height='100%';
    fader.style.backgroundImage=`url('${newImgSrc}')`;
    fader.style.backgroundSize='cover'; fader.style.opacity='0'; fader.style.transition='opacity 0.6s';
    fader.style.pointerEvents='none';
    container.appendChild(fader);
    requestAnimationFrame(()=>fader.style.opacity='1');
    setTimeout(()=>{ container.style.backgroundImage=`url('${newImgSrc}')`; fader.remove(); },600);
}

export function applyPosition(state){ /* Aquí va la lógica que tenías dentro de applyPosition() */ }
export function checkInteractions(){ /* Aquí va la función completa de checkInteractions() */ }