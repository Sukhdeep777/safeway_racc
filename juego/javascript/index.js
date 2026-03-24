// ============================================================
// BIENVENIDO AL CÓDIGO DEL JUEGO 🎮
// ============================================================
// JavaScript es como darle "vida" a tu HTML.
// Con HTML y CSS construyes la página (la casa y su decoración),
// con JavaScript le dices QUÉ HACE cuando el usuario interactúa.
//
// Los paréntesis (() => { ... })() al principio y al final
// son un "envoltorio" que hace que todo el código se ejecute
// automáticamente cuando carga la página, sin interferir con
// otros posibles scripts.
// ============================================================

(() => {

    // ============================================================
    // 1. REFERENCIAS AL DOM
    // ============================================================
    // El DOM es el conjunto de todos los elementos HTML de tu página.
    // Con JavaScript podemos "coger" esos elementos y guardarlos
    // en variables para usarlos más adelante.
    //
    // "document.getElementById('id')" busca el elemento que tiene
    // ese id en el HTML, igual que en CSS harías #id.
    //
    // "document.querySelector('.clase')" busca el primer elemento
    // con esa clase CSS, igual que harías .clase en CSS.
    // ============================================================

    const img       = document.getElementById('player-img');     // La imagen (gif) del personaje
    const player    = document.getElementById('player');          // El contenedor del personaje
    const container = document.querySelector('.game-container');  // El contenedor principal del juego

    const level1Exit = document.getElementById('level1-exit');   // La puerta de salida del nivel 1
    const keyPrompt  = document.getElementById('key-prompt');    // El aviso "pulsa E" que aparece cerca de la puerta

    // --- Elementos del nivel 2 ---
    // Estos son los iconos/prompts que aparecen encima de cada objeto
    // cuando el personaje se acerca a ellos
    const promptSign    = document.getElementById('prompt-sign');    // Icono sobre el cartel
    const promptScooter = document.getElementById('prompt-scooter'); // Icono sobre el patinete
    const promptCar     = document.getElementById('prompt-car');     // Icono sobre el coche
    const promptPark    = document.getElementById('prompt-park');    // Icono del parque

    // Icono del paso de peatones (por ahora solo visual)
    const promptCrosswalk = document.getElementById('prompt-crosswalk');

    // --- Pantallas y elementos de transición ---
    const introScreen  = document.getElementById('intro-screen');   // La pantalla de inicio del juego
    const blackCurtain = document.getElementById('black-curtain');  // El fondo negro que aparece entre niveles
    const carObstacle  = document.getElementById('car-obstacle');   // El coche que bloquea el camino en nivel 2

    // --- Caja de diálogo ---
    // Es el cuadro de texto que aparece cuando un personaje habla
    const dialogueBox  = document.getElementById('dialogue-box');
    const speakerName  = document.getElementById('speaker-name');   // El nombre del que habla ("Torrent:", "Narrador:")
    const dialogueText = document.getElementById('dialogue-text');  // El texto del diálogo

    // --- Modal de confirmación (preguntas Sí/No) ---
    const confirmationModal = document.getElementById('confirmation-modal'); // La ventana emergente con Sí y No
    const btnYes            = document.getElementById('btn-yes');            // Botón "Sí"
    const btnNo             = document.getElementById('btn-no');             // Botón "No"

    // --- Elementos de game over y victoria ---
    const killerCar      = document.getElementById('killer-car');       // El coche que atropella al jugador
    const gameOverScreen = document.getElementById('game-over-screen'); // Pantalla de "has perdido"
    const btnRetry       = document.getElementById('btn-retry');        // Botón "Reintentar"
    const victoryScreen  = document.getElementById('victory-screen');   // Pantalla de victoria
    const btnPlayAgain   = document.getElementById('btn-play-again');   // Botón "Jugar de nuevo"

    // --- Pantallas de vídeo ---
    // Cada vídeo tiene su propia pantalla (div) y su elemento <video>
    const busVideoScreen    = document.getElementById('bus-video-screen');
    const busVideo          = document.getElementById('bus-video');
    const scooterVideoScreen= document.getElementById('scooter-video-screen');
    const scooterVideo      = document.getElementById('scooter-video');
    const carVideoScreen    = document.getElementById('car-video-screen');
    const carVideo          = document.getElementById('car-video');

    // --- Tutoriales en pantalla ---
    const tutorialTeclas = document.getElementById('tutorial-teclas'); // Tutorial de teclas del nivel cotxe
    const tutorialWS     = document.getElementById('tutorial-ws');     // Tutorial de W/S del patinete

    // --- Texto personalizable del game over ---
    const gameOverText = document.getElementById('game-over-text'); // El mensaje explicativo al perder


    // ============================================================
    // 2. IMÁGENES PRECARGADAS
    // ============================================================
    // "Precargar" significa descargar las imágenes antes de
    // necesitarlas. Así cuando el juego las usa, ya están listas
    // y no hay un momento de "pantalla en blanco" mientras cargan.
    //
    // "new Image()" crea una imagen invisible en memoria.
    // Al ponerle .src, el navegador la descarga aunque no se vea.
    // ============================================================

    // Guardamos las rutas de los GIFs del personaje en un objeto.
    // Un objeto en JS es como una lista con nombre, como una mochila
    // donde cada bolsillo tiene una etiqueta.
    const gifs = {
        rightRun:  'animaciones/correr-derecho.gif',   // Correr hacia la derecha
        leftRun:   'animaciones/correr-izquierda.gif', // Correr hacia la izquierda
        idleRight: 'animaciones/paradoderecha.gif',    // Quieto mirando a la derecha
        idleLeft:  'animaciones/paradoizquierda.gif'   // Quieto mirando a la izquierda
    };

    // Precargamos los fondos que se usan en el semáforo
    const bgPreloads = ['imagenes/busamarillo.gif', 'imagenes/busverde.gif'];
    bgPreloads.forEach(path => {        // "forEach" recorre cada elemento de la lista
        const preloadBg = new Image(); // Crea imagen invisible
        preloadBg.src = path;          // Asignarle src la descarga en segundo plano
    });

    // Precargamos todos los GIFs del personaje de la misma forma.
    // "Object.values(gifs)" nos da solo los valores del objeto gifs
    // (las rutas), sin las etiquetas (rightRun, leftRun, etc.)
    Object.values(gifs).forEach(path => {
        const preload = new Image();
        preload.src = path;
    });


    // ============================================================
    // 3. VARIABLES DE ESTADO
    // ============================================================
    // Las variables guardan información que puede cambiar durante
    // el juego. Son como "cajitas" con un nombre donde guardamos
    // un dato.
    //
    // "let" = variable que puede cambiar de valor.
    // "const" = variable que NO puede cambiar (constante).
    // ============================================================

    // --- Movimiento del personaje ---
    let velocity = 0;           // Velocidad actual del personaje (empieza en 0, parado)
    const MAX_SPEED = 4;        // Velocidad máxima que puede alcanzar (en píxeles por frame)
    const ACCELERATION = 0.4;   // Cuánto aumenta la velocidad cada vez que pulsas una tecla
    const friction = 0.85;      // "Freno" natural: cada frame la velocidad se multiplica por esto
                                 // 0.85 = pierde un 15% de velocidad cada frame → se para suavemente

    let direction = 'right';    // Dirección actual: 'right' (derecha) o 'left' (izquierda)
    let currentAnimation = null;// Guarda el GIF que se está mostrando ahora mismo
    let currentLevel = 1;       // Nivel actual del juego (empieza en 1)
    let posX = 0;               // Posición horizontal del personaje en píxeles
    let posY = 70;              // Posición vertical del personaje en píxeles

    // --- Control del flujo del juego ---
    let isInitialized    = false; // ¿Han terminado los diálogos de intro? (¿puede moverse ya?)
    let gameStarted      = false; // ¿Ha pulsado el jugador para empezar desde la pantalla de inicio?
    let isNearExit       = false; // ¿Está el personaje cerca de la puerta de salida?
    let isDialogueActive = false; // ¿Hay un diálogo abierto ahora mismo?
    let isConfirmationActive = false; // ¿Está abierta la ventana de Sí/No?
    let currentInteraction = null;   // Qué tipo de interacción está activa ('cartel', 'scooter', etc.)
    let currentStep = 0;             // En qué paso de los diálogos de intro estamos

    // --- Flags (banderas) de estado ---
    // Un "flag" es una variable booleana (true/false) que actúa como
    // un interruptor: encendido o apagado.
    let isParkUnlocked   = false; // ¿Se ha desbloqueado el camino del parque?
    let isTransitioning  = false; // ¿Está ocurriendo una transición entre niveles?
    let isCrossingBadly  = false; // ¿Está cruzando el semáforo en rojo?
    let isDead           = false; // ¿Ha muerto el personaje?
    let hasSpokenAtCrosswalk = false; // ¿Ya apareció el diálogo del semáforo?

    // --- Teclas pulsadas ---
    // Este objeto actúa como un "panel de control":
    // cada tecla tiene true (pulsada) o false (no pulsada).
    // Se actualiza en tiempo real con los eventos de teclado.
    const keys = { a: false, d: false, e: false, w: false, s: false };

    let isWaitingForLight = false; // ¿Está esperando que cambie el semáforo a verde?
    let isLevelFinished   = false; // ¿Ha terminado el nivel actual?

    // --- Variables de la escena de la àvia (nivel cotxe) ---
    let grandmaActive     = false; // ¿Está la àvia animándose en pantalla?
    let grandmaHasStarted = false; // ¿Ya se ha lanzado la animación de la àvia?
    let grandmaAnimFrame  = null;  // Guarda el ID del requestAnimationFrame de la àvia
                                    // (para poder cancelarlo si hace falta)

    // --- Variables del minijuego del patinete ---
    let rocks          = [];    // Lista de piedras que hay en pantalla ahora mismo
    let rockSpawnTimer = 0;     // Contador para saber cuándo crear la próxima piedra
    let isMinigameActive = false; // ¿Está activo el minijuego del patinete?
    let rockSpeed      = 5;     // Velocidad a la que se mueven las piedras
    let drunkFrameCount = 0;    // Contador de frames para simular el efecto de borrachera
    let dizzinessLevel  = 0;    // Nivel de mareo (aumenta con el tiempo)

    // --- Variables de los diálogos de multas del patinete ---
    let isScooterFinesPlaying = false; // ¿Se están mostrando los diálogos de multas?
    let scooterFinesStep      = 0;     // En qué línea de diálogo de multas estamos

    // Esta es la lista de diálogos que aparecen cuando chocas con el patinete.
    // Cada elemento es un objeto con: nombre del hablante, clase CSS y texto.
    const scooterFinesDialogue = [
        {
            name: "Torrent",
            class: "name-torrent",
            text: "No hauria d'haver agafat el patinet sense la protecció adequada... He comès tres errors greus."
        },
        {
            name: "Narrador",
            class: "name-narrador",
            text: "La primera multa: no portar casc. La protecció és obligatòria. 50 euros."
        },
        {
            name: "Narrador",
            class: "name-narrador",
            text: "La segona multa: escoltar música mentre condueixis. Això et distreu i t'impedeix sentir els sons del trànsit. 30 euros."
        },
        {
            name: "Narrador",
            class: "name-narrador",
            text: "La tercera multa: no tenir el patinet registrat a la DGT. El registre oficial és obligatori. 60 euros. Un total de 140 euros."
        }
    ];

    // --- Variables del QTE (Quick Time Event) ---
    // El QTE es la escena donde tienes que pulsar E rápidamente para frenar
    let qteActive       = false; // ¿Está activo el QTE ahora mismo?
    let qtePresses      = 0;     // Cuántas veces ha pulsado E el jugador
    const QTE_MAX_PRESSES = 30;  // Cuántas pulsaciones necesita para tener éxito
    let qteCountdown    = null;  // Guarda el temporizador del QTE (para poder pararlo)
    let qteSecondsLeft  = 10;    // Segundos que quedan para completar el QTE


    // ============================================================
    // 4. HISTORIA (DIÁLOGOS DE INTRODUCCIÓN)
    // ============================================================
    // Los diálogos de la intro son un array (lista) de objetos.
    // Cada objeto es una "línea" del diálogo con quién habla y qué dice.
    // ============================================================

    const story = [
        {
            name: "Narrador",
            class: "name-narrador", // Esta clase CSS da el color/estilo al nombre
            text: "La nit s'esvaeix lentament entre el ressò rítmic de la música i els llums de neó. Tot i que l'eufòria encara omple la sala, el temps dicta la seva pròpia sentència."
        },
        {
            name: "Torrent",
            class: "name-torrent",
            text: "Crec que ja n'hi ha prou per avui... Ha estat una vetllada intensa, però ja és hora de tornar a casa i descansar de debò."
        }
    ];


    // ============================================================
    // 5. FUNCIONES DE DIÁLOGO Y UI
    // ============================================================
    // Una función es un bloque de código con nombre que puedes
    // "llamar" (ejecutar) cuando quieras desde cualquier parte.
    // Es como crear tu propio comando personalizado.
    // ============================================================

    // Muestra la siguiente línea de los diálogos de INTRODUCCIÓN
    function showNextDialogue() {

        // Comprueba si todavía hay líneas de diálogo por mostrar
        if (currentStep < story.length) {
            isDialogueActive = true;              // Bloquea el movimiento del personaje
            dialogueBox.style.display = 'block';  // Hace visible el cuadro de diálogo
                                                   // (equivale a quitar display:none en CSS)

            const line = story[currentStep];       // Coge la línea actual del array story

            // Rellena el HTML del cuadro de diálogo con los datos de esta línea
            speakerName.textContent = line.name + ":";         // Escribe "Narrador:" o "Torrent:"
            speakerName.className   = "speaker-name " + line.class; // Aplica la clase CSS del color
            dialogueText.textContent = line.text;              // Escribe el texto del diálogo

            currentStep++; // Avanza al siguiente paso (próxima vez mostrará la siguiente línea)

        } else {
            // Si ya no hay más líneas, cerramos el diálogo y arrancamos el juego
            isDialogueActive = false;
            dialogueBox.style.display = 'none'; // Oculta el cuadro de diálogo
            isInitialized = true;               // Marca que la intro ha terminado

            // "requestAnimationFrame(loop)" le dice al navegador:
            // "Antes de pintar el próximo frame en pantalla, ejecuta la función loop".
            // Es la forma correcta de hacer animaciones en JS (más suave que setInterval).
            requestAnimationFrame(loop);
        }
    }

    // Muestra un mensaje genérico (fuera de la intro) con nombre, estilo y texto
    // "interactionType" indica qué tipo de interacción lo ha provocado
    function showMessage(name, cssClass, text, interactionType) {
        isDialogueActive   = true;
        currentInteraction = interactionType;      // Guarda el tipo para saber qué hacer al pulsar E
        dialogueBox.style.display = 'block';
        speakerName.textContent   = name + ":";
        speakerName.className     = "speaker-name " + cssClass;
        dialogueText.textContent  = text;
        velocity = 0;  // Para al personaje mientras hay diálogo
        setIdle();     // Pone la animación de "quieto"
    }

    // Cierra el mensaje actual y reactiva el movimiento
    function closeMessage() {
        isDialogueActive   = false;
        dialogueBox.style.display = 'none';
        currentInteraction = null; // Ya no hay interacción activa

        // Si estamos en el nivel del cotxe y la àvia aún no ha aparecido,
        // la programamos para que aparezca 10 segundos después
        if (currentLevel === 6 && !grandmaHasStarted) {
            grandmaHasStarted = true;
            setTimeout(startGrandmaAnimation, 10000); // "setTimeout" ejecuta algo después de X milisegundos
        }
    }

    // Abre la ventana modal de confirmación (Sí / No)
    function openConfirmation() {
        dialogueBox.style.display = 'none'; // Oculta el diálogo de texto
        isDialogueActive     = false;
        isConfirmationActive = true;
        confirmationModal.style.display = 'block'; // Muestra el modal
    }

    // Cierra la ventana modal de confirmación
    function closeConfirmation() {
        confirmationModal.style.display = 'none';
        isConfirmationActive = false;
    }


    // ============================================================
    // LÓGICA DE LOS BOTONES SÍ / NO
    // ============================================================
    // "addEventListener('click', función)" hace que cuando el usuario
    // haga clic en el elemento, se ejecute esa función.
    // Es como decirle al botón: "cuando te pulsen, haz esto".
    // ============================================================

    btnYes.addEventListener('click', () => {
        closeConfirmation(); // Cierra el modal

        // Dependiendo del tipo de interacción activa, hace una cosa u otra
        if (currentInteraction === 'cartel') {
            // Ha dicho que sí al cartel → desbloquea el camino del parque
            isParkUnlocked = true;
            promptPark.classList.add('unlocked'); // Añade clase CSS 'unlocked' al icono del parque
        } else if (currentInteraction === 'paso-peatones') {
            // Ha dicho que sí a cruzar en rojo → activamos el flag de cruce peligroso
            isCrossingBadly = true;
        } else if (currentInteraction === 'scooter') {
            // Ha dicho que sí al patinete → cargamos el nivel del patinete
            loadLevelPatinete();
        } else if (currentInteraction === 'coche') {
            // Ha dicho que sí al cotxe → cargamos el nivel del cotxe
            loadLevelCoche();
        }

        currentInteraction = null; // Limpiamos la interacción activa
    });

    btnNo.addEventListener('click', () => {
        closeConfirmation();

        if (currentInteraction === 'paso-peatones') {
            // Ha dicho NO a cruzar en rojo → espera al semáforo verde
            isWaitingForLight = true;
            keys.a = false; // Suelta todas las teclas de movimiento
            keys.d = false;
            velocity = 0;
            setIdle();

            // Mostramos el coche que pasa a toda velocidad
            killerCar.style.display = 'block';

            // Posición y escala iniciales del coche (pequeño, al fondo)
            let carY     = 400;
            let carScale = 0.2;
            killerCar.style.left      = (posX + 250) + 'px';
            killerCar.style.bottom    = carY + 'px';
            killerCar.style.transform = `scale(${carScale})`;

            // Animamos el coche acercándose (sube por la pantalla y crece)
            function passCarVertically() {
                carY     -= 25;   // Sube 25px cada frame
                carScale += 0.08; // Crece un poco cada frame (simula perspectiva)
                killerCar.style.bottom    = carY + 'px';
                killerCar.style.transform = `scale(${carScale})`;

                if (carY < -300) {
                    // El coche ya salió por arriba → lo ocultamos y cambiamos el semáforo
                    killerCar.style.display = 'none';
                    changeBackgroundSmoothly('imagenes/busamarillo.gif'); // Semáforo amarillo

                    setTimeout(() => {
                        changeBackgroundSmoothly('imagenes/busverde.gif'); // Semáforo verde
                        setTimeout(() => {
                            showMessage("Torrent", "name-torrent", "Uf... Has vist quina velocitat duia aquell cotxe? Quina sort que he esperat. Ara sí que el semàfor és verd.", null);
                            isWaitingForLight = false; // Ya puede moverse de nuevo
                        }, 600);
                    }, 3000); // Espera 3 segundos entre amarillo y verde
                } else {
                    // El coche aún está en pantalla → pedimos el siguiente frame de animación
                    requestAnimationFrame(passCarVertically);
                }
            }
            requestAnimationFrame(passCarVertically); // Arranca la animación
        }

        currentInteraction = null;
    });


    // ============================================================
    // FUNCIÓN PARA TRANSICIONES SUAVES DE FONDO
    // ============================================================
    // En lugar de cambiar el fondo de golpe (que quedaría brusco),
    // creamos un div encima con el nuevo fondo y lo hacemos aparecer
    // con una transición CSS de opacidad.
    // ============================================================

    function changeBackgroundSmoothly(newImgSrc) {
        // Subimos el personaje y el coche por encima del fader
        player.style.zIndex    = '10';
        killerCar.style.zIndex = '10';

        // Creamos un div nuevo dinámicamente (como escribir HTML desde JS)
        const fader = document.createElement('div');

        // Le aplicamos estilos directamente (como CSS inline)
        fader.style.position        = 'absolute';
        fader.style.top             = '0';
        fader.style.left            = '0';
        fader.style.width           = '100%';
        fader.style.height          = '100%';
        fader.style.backgroundImage = `url('${newImgSrc}')`;
        fader.style.backgroundSize  = 'cover';
        fader.style.backgroundPosition = 'center';
        fader.style.zIndex          = '1';
        fader.style.opacity         = '0';         // Empieza invisible
        fader.style.transition      = 'opacity 0.6s ease-in-out'; // Transición CSS de 0.6s
        fader.style.pointerEvents   = 'none';      // No interfiere con clics del usuario

        container.appendChild(fader); // Lo añadimos dentro del contenedor del juego

        // "requestAnimationFrame" aquí garantiza que el div ya está en el DOM
        // antes de cambiar la opacidad (si lo hiciéramos sin esto, no habría transición)
        requestAnimationFrame(() => {
            fader.style.opacity = '1'; // Lo hacemos visible con transición suave
        });

        // Después de 0.6s (cuando termina la transición), aplicamos el fondo
        // de verdad al contenedor y eliminamos el div temporal
        setTimeout(() => {
            container.style.backgroundImage = `url('${newImgSrc}')`;
            fader.remove(); // Eliminamos el div del DOM
        }, 600);
    }


    // ============================================================
    // 6. MOVIMIENTO Y FÍSICA
    // ============================================================

    // Calcula los límites horizontales dentro de los que puede moverse
    // el personaje (no puede salirse por los bordes del contenedor)
    function updateBounds() {
        const rect  = container.getBoundingClientRect(); // Tamaño y posición del contenedor
        const pRect = player.getBoundingClientRect();    // Tamaño y posición del personaje
        return {
            min: 0,                        // Borde izquierdo (posición 0)
            max: rect.width - pRect.width  // Borde derecho (ancho contenedor - ancho personaje)
        };
    }

    // Aplica la posición calculada al personaje en pantalla
    // y detecta si ha llegado a puntos clave (semáforo, fin de nivel, etc.)
    function applyPosition() {
        const bounds = updateBounds();

        // No puede salir por la izquierda
        if (posX < bounds.min) posX = bounds.min;

        // En nivel 4, si aún no ha hablado en el semáforo,
        // no puede pasar de la posición 130 (está bloqueado hasta el diálogo)
        if (currentLevel === 4 && !hasSpokenAtCrosswalk && posX > 130) {
            posX = 130;
            velocity = 0;
        }

        // Detección de fin de nivel 3 → carga nivel 4
        if (currentLevel === 3 && posX >= bounds.max && !isTransitioning) {
            posX = bounds.max;
            loadLevel4();

        // Detección de fin de nivel 4 (llegó al autobús) → reproduce vídeo
        } else if (currentLevel === 4 && !isTransitioning && !isCrossingBadly && posX >= 600 && !isDead && !isLevelFinished) {
            isLevelFinished = true;
            posX = 600;
            playBusVideo();

        // No puede salir por la derecha en otros casos
        } else if (posX > bounds.max) {
            posX = bounds.max;
        }

        // Actualizamos la posición visual del personaje en el HTML
        // "px" es la unidad, igual que en CSS: left: 100px
        player.style.left = posX + 'px';

        // Si está en nivel 4 y llega al semáforo por primera vez → diálogo
        if (currentLevel === 4 && !hasSpokenAtCrosswalk && !isTransitioning && !isDead) {
            if (posX >= 128) {
                velocity = 0;
                keys.d   = false;
                hasSpokenAtCrosswalk = true;
                showMessage("Torrent", "name-torrent", "Vaja, el semàfor és en vermell... Hauria de creuar ara mateix o m'espero que canviï?", "paso-peatones");
            }
        }

        // Si está cruzando en rojo y llega a la posición del coche → muerte
        if (currentLevel === 4 && isCrossingBadly && posX >= 427 && !isDead) {
            triggerDeathSequence();
        }

        // Comprueba si está cerca de algún objeto interactuable
        checkInteractions();
    }


    // ============================================================
    // ANIMACIÓN DE ATROPELLAMIENTO
    // ============================================================
    // Cuando el jugador cruza en rojo, esta función muestra el coche
    // que lo arrastra y luego la pantalla de game over.
    // ============================================================

    function triggerDeathSequence() {
        isDead   = true;
        velocity = 0;
        keys.a   = false;
        keys.d   = false;
        setIdle();

        if (gameOverText) {
            gameOverText.innerText = "Creuar en vermell no ha estat una bona idea...";
        }

        killerCar.style.display   = 'block';
        let carY     = 400;
        let carScale = 0.2;
        killerCar.style.left      = (posX - 50) + 'px';
        killerCar.style.bottom    = carY + 'px';
        killerCar.style.transform = `scale(${carScale})`;

        let isHit = false; // ¿Ya ha alcanzado el coche al personaje?

        function animateCar() {
            carY     -= 12;   // El coche sube 12px por frame
            carScale += 0.04; // Y crece (se acerca)
            killerCar.style.bottom    = carY + 'px';
            killerCar.style.transform = `scale(${carScale})`;

            // Cuando el coche llega a la altura del personaje, lo "engancha"
            if (!isHit && carY <= 100) {
                isHit = true;
            }
            if (isHit) {
                player.style.bottom = carY + 'px'; // El personaje sube junto al coche
            }

            if (carY < -300) {
                // El coche salió por arriba → mostramos game over
                gameOverScreen.style.display = 'flex';
                player.style.display         = 'none';
            } else {
                requestAnimationFrame(animateCar); // Siguiente frame de la animación
            }
        }
        requestAnimationFrame(animateCar);
    }


    // ============================================================
    // ANIMACIÓN DE VICTORIA
    // ============================================================

    function triggerVictory() {
        velocity = 0;
        keys.a   = false;
        keys.d   = false;
        setIdle();
        victoryScreen.style.display = 'flex'; // Muestra la pantalla de victoria
    }


    // ============================================================
    // BOTÓN VOLVER A JUGAR (pantalla de victoria)
    // ============================================================

    btnPlayAgain.addEventListener('click', () => {
        victoryScreen.style.display = 'none';
        // Reseteamos todos los flags relacionados con el nivel 4
        hasSpokenAtCrosswalk = false;
        isCrossingBadly      = false;
        isDead               = false;
        isLevelFinished      = false;
        isWaitingForLight    = false;
        loadLevel2(); // Volvemos al nivel 2 (la calle con opciones)
    });


    // ============================================================
    // REPRODUCCIÓN DEL VÍDEO DEL AUTOBÚS
    // ============================================================
    // Se reproduce cuando el jugador llega al autobús (final nivel 4)

    function playBusVideo() {
        velocity = 0;
        keys.a   = false;
        keys.d   = false;
        setIdle();
        busVideoScreen.style.display = 'flex';
        busVideo.play(); // Inicia la reproducción del vídeo

        // "onended" es un evento que se dispara cuando el vídeo termina
        busVideo.onended = () => {
            busVideoScreen.style.display = 'none';
            triggerVictory(); // Al terminar el vídeo, mostramos victoria
        };
    }


    // ============================================================
    // FUNCIONES AUXILIARES DEL MINIJUEGO DEL PATINETE
    // ============================================================

    // Crea una piedra nueva y la añade al juego
    function spawnRock() {
        const rock = document.createElement('img'); // Creamos un elemento <img> desde JS
        rock.src       = 'imagenes/roca.png';
        rock.className = 'obstacle-rock';           // Le damos una clase CSS
        rock.style.position = 'absolute';
        rock.style.width    = '50px';
        rock.style.zIndex   = '5';
        rock.style.left     = '850px'; // Empieza fuera de la pantalla por la derecha

        // Aleatoriamente aparece en el carril de arriba o de abajo
        const carrilArriba = 400;
        const carrilAbajo  = 180;
        if (Math.random() > 0.5) {          // "Math.random()" da un número entre 0 y 1
            rock.style.bottom = carrilArriba + 'px';
        } else {
            rock.style.bottom = carrilAbajo + 'px';
        }

        container.appendChild(rock); // Añadimos la piedra al juego
        rocks.push(rock);            // Y la guardamos en nuestra lista de piedras activas
    }

    // Comprueba si dos rectángulos se solapan (colisión entre objetos)
    // "margin" es un margen de tolerancia: la colisión se detecta un poco antes
    function check2DCollision(rect1, rect2, margin = 10) {
        // Devuelve true si HAY colisión, false si NO la hay
        // La lógica invertida (con !) es: si NO están separados → están chocando
        return !(
            rect1.top    + margin > rect2.bottom - margin || // rect1 está por encima de rect2
            rect1.bottom - margin < rect2.top    + margin || // rect1 está por debajo de rect2
            rect1.right  - margin < rect2.left   + margin || // rect1 está a la izquierda de rect2
            rect1.left   + margin > rect2.right  - margin    // rect1 está a la derecha de rect2
        );
    }

    // Se ejecuta cuando el personaje choca con una piedra en el patinete
    function triggerScooterDeath() {
        isMinigameActive = false;
        isDead   = true;
        velocity = 0;
        keys.w   = false;
        keys.s   = false;

        container.style.transform = 'none'; // Quitamos el efecto de mareo
        player.style.display      = 'none'; // Ocultamos al personaje

        if (tutorialWS) tutorialWS.style.display = 'none'; // Ocultamos el tutorial

        // Mostramos el vídeo del accidente del patinete
        scooterVideoScreen.style.display = 'flex';
        scooterVideo.currentTime = 0; // Rebobinamos el vídeo al principio
        scooterVideo.play();

        // Función que espera a que el vídeo llegue al 75% para pausarlo
        function startFreezeLogic() {
            const freezeTime = scooterVideo.duration * 0.75; // 75% del total

            // "setInterval" ejecuta algo repetidamente cada X milisegundos
            // Aquí comprobamos cada 100ms si el vídeo llegó al punto de pausa
            const videoCheckInterval = setInterval(() => {
                if (scooterVideo.currentTime >= freezeTime) {
                    scooterVideo.pause();              // Pausamos el vídeo
                    clearInterval(videoCheckInterval); // Paramos el intervalo

                    setTimeout(() => {
                        // Mostramos los diálogos de las multas encima del vídeo pausado
                        dialogueBox.style.zIndex  = '5001';
                        isScooterFinesPlaying     = true;
                        scooterFinesStep          = 0;
                        showNextScooterFinesDialogue();
                    }, 500);
                }
            }, 100);
        }

        // "readyState >= 1" significa que el vídeo ya conoce su duración
        // Si no, esperamos al evento "loadedmetadata" para saberla
        if (scooterVideo.readyState >= 1) {
            startFreezeLogic();
        } else {
            scooterVideo.onloadedmetadata = startFreezeLogic;
        }
    }

    // Muestra la siguiente línea de los diálogos de multas del patinete
    function showNextScooterFinesDialogue() {
        if (scooterFinesStep < scooterFinesDialogue.length) {
            // Aún hay líneas por mostrar
            isDialogueActive = true;
            dialogueBox.style.display = 'block';
            const line = scooterFinesDialogue[scooterFinesStep];
            speakerName.textContent  = line.name + ":";
            speakerName.className    = "speaker-name " + line.class;
            dialogueText.textContent = line.text;
            scooterFinesStep++;
        } else {
            // Se acabaron las líneas → mostramos game over con las multas
            isDialogueActive      = false;
            isScooterFinesPlaying = false;
            dialogueBox.style.display    = 'none';
            scooterVideoScreen.style.display = 'none';

            const titleEl = document.getElementById('game-over-title');
            if (titleEl) titleEl.innerText = "T'HAN ENXAMPAT!";
            if (gameOverText) gameOverText.innerText = "Has rebut 140 euros de multes per no respectar les normes del patinet.";

            // Ocultamos el botón de reintentar y mostramos el de nuevo camino
            document.getElementById('btn-retry').style.display    = 'none';
            document.getElementById('btn-new-path').style.display = 'inline-block';

            gameOverScreen.style.display = 'flex';
        }
    }


    // ============================================================
    // ANIMACIÓN DE LA ÀVIA (NIVEL COTXE)
    // ============================================================
    // La àvia aparece a lo lejos y se acerca al coche.
    // Simulamos perspectiva haciéndola más grande y subiéndola
    // en pantalla a medida que "se acerca".
    // ============================================================

    function startGrandmaAnimation() {
        const grandma = document.getElementById('grandma');
        if (!grandma || grandmaActive) return; // Si ya está activa o no existe, salimos

        grandmaActive = true;
        grandma.style.display = 'block';

        // Valores iniciales: pequeña y al fondo
        let gWidth  = 4;
        let gBottom = 445;
        let gX      = 460;

        grandma.style.width  = gWidth  + 'px';
        grandma.style.bottom = gBottom + 'px';
        grandma.style.left   = gX      + 'px';
        grandma.style.display = 'block';

        function animateGrandma() {
            if (!grandmaActive) return; // Si se canceló, paramos

            // La velocidad de la àvia aumenta cuanto más grande es (efecto de aceleración)
            let speedFactor = gWidth / 30;

            gWidth  += 0.4 + speedFactor; // Crece (se acerca)
            gBottom -= 1.2 + speedFactor; // Sube en pantalla
            gX      -= 1.0 + speedFactor * 0.5; // Se desplaza un poco a la izquierda

            grandma.style.width  = gWidth  + 'px';
            grandma.style.bottom = gBottom + 'px';
            grandma.style.left   = gX      + 'px';

            // Cuando es suficientemente grande o ha subido bastante → colisión
            if (gWidth >= 130 || gBottom <= 230) {
                grandmaActive = false;
                triggerGrandmaCollision();
                return;
            }

            grandmaAnimFrame = requestAnimationFrame(animateGrandma);
        }

        grandmaAnimFrame = requestAnimationFrame(animateGrandma);
    }

    // Se ejecuta cuando la àvia llega al coche → lanza el QTE
    function triggerGrandmaCollision() {

        // 1. Paramos el juego (el flag isDialogueActive bloquea el loop)
        isDialogueActive = true;

        // 2. Cancelamos la animación de la àvia
        grandmaActive = false;
        if (grandmaAnimFrame) {
            cancelAnimationFrame(grandmaAnimFrame); // Para el requestAnimationFrame de la àvia
            grandmaAnimFrame = null;
        }

        // 3. Cambiamos el fondo instantáneamente al coche parado
        const currentFilter = window.getComputedStyle(container).filter; // Guardamos el filtro actual
        container.style.transition       = 'none'; // Sin transición
        container.style.animation        = 'none';
        container.style.animationPlayState = 'paused';
        container.classList.remove('level-coche');
        container.classList.add('level-coche-frozen');
        container.style.backgroundImage = "url('imagenes/conducir_coche_quieto.png')";
        container.style.filter = currentFilter;

        // 4. Ocultamos a la àvia, el jugador y el tutorial
        const grandmaEl2 = document.getElementById('grandma');
        if (grandmaEl2) grandmaEl2.style.display = 'none';
        player.style.display = 'none';
        if (tutorialTeclas) tutorialTeclas.style.display = 'none';

        // 5. Mostramos un overlay gris (efecto de tiempo congelado)
        const greyOverlay = document.getElementById('grey-overlay');
        if (greyOverlay) {
            greyOverlay.style.display = 'block';
            requestAnimationFrame(() => {
                greyOverlay.style.opacity = '1'; // Aparece con transición CSS
            });
        }

        // Función auxiliar: reproduce un vídeo a pantalla completa y llama a "cb" al terminar
        // "cb" es "callback": una función que se pasa como parámetro para llamarla después
        function playCarVideo(src, cb) {
            carVideo.src = src;
            carVideoScreen.style.display = 'flex';
            carVideo.currentTime = 0;
            carVideo.play();
            carVideo.onended = () => {
                cb(); // Cuando termina el vídeo, ejecuta lo que se le haya pasado
            };
        }

        // 6. Lanzamos el QTE con dos posibles resultados:
        startQTE(
            // ✅ ÉXITO: el jugador pulsó E suficientes veces → esquivó a la àvia
            () => {
                const greyEl = document.getElementById('grey-overlay');
                if (greyEl) { greyEl.style.opacity = '0'; greyEl.style.display = 'none'; }

                playCarVideo('videos/señora_esquivada.mp4', () => {
                    isDialogueActive = false;
                    container.style.filter = 'none';
                    container.classList.remove('level-coche-frozen');
                    container.style.animation       = '';
                    container.style.backgroundImage = '';

                    const titleEl = document.getElementById('game-over-title');
                    if (titleEl) titleEl.innerText = "L'HAS ESQUIVAT!";
                    if (gameOverText) gameOverText.innerText = "Has evitat atropellar l'àvia, però recorda: mai beguis si has de conduir i no et distreguis amb el mòbil. La carretera requereix tota la teva atenció.";
                    document.getElementById('btn-retry').style.display    = 'none';
                    document.getElementById('btn-new-path').style.display = 'inline-block';
                    gameOverScreen.style.display = 'flex';
                });
            },
            // ❌ FALLO: no pulsó suficientes veces → atropella a la àvia
            () => {
                container.style.filter = 'none';
                const greyEl = document.getElementById('grey-overlay');
                if (greyEl) { greyEl.style.opacity = '0'; greyEl.style.display = 'none'; }

                playCarVideo('videos/video-coche.mp4', () => {
                    const titleEl = document.getElementById('game-over-title');
                    if (titleEl) titleEl.innerText = "NO HAS ESQUIVAT L'ÀVIA!";
                    if (gameOverText) gameOverText.innerText = "No has reaccionat a temps i has tingut un accident. Conduir begut té conseqüències molt greus.";
                    document.getElementById('btn-retry').style.display    = 'none';
                    document.getElementById('btn-new-path').style.display = 'inline-block';
                    gameOverScreen.style.display = 'flex';
                });
            }
        );
    }

    // Comprueba si el personaje choca con el coche obstáculo del nivel 2
    function checkCollision(nextX) {
        if (currentLevel !== 2) return false; // Solo funciona en nivel 2

        const carStyle  = window.getComputedStyle(carObstacle);
        const carLeft   = parseInt(carStyle.left);  // "parseInt" convierte "200px" → 200
        const carWidth  = parseInt(carStyle.width);
        const playerWidth = player.getBoundingClientRect().width;

        // Si el personaje se solapa horizontalmente con el coche → colisión
        if (nextX + playerWidth > carLeft + 20 && nextX < carLeft + carWidth) {
            return true;
        }
        return false;
    }

    // Pone la animación de "quieto" (sin moverse)
    function setIdle() {
        if (currentLevel === 5) {
            // En nivel 5 (patinete) siempre usamos el mismo gif
            const newSrc = 'imagenes/patinete.gif';
            if (currentAnimation !== newSrc) {
                currentAnimation = newSrc;
                img.src = newSrc;
            }
            return;
        }

        img.style.transform = 'scaleX(1)'; // Sin espejo

        // Elegimos el gif según la dirección actual
        const newSrc = direction === 'left' ? gifs.idleLeft : gifs.idleRight;

        // Solo cambiamos el src si es diferente al actual (evita parpadeos)
        if (currentAnimation !== newSrc) {
            currentAnimation = newSrc;
            img.src = newSrc;
        }
    }

    // Pone la animación de "corriendo" en la dirección indicada
    function setRun(dir) {
        if (currentLevel === 5) {
            const newSrc = 'imagenes/patinete.gif';
            if (currentAnimation !== newSrc) {
                currentAnimation = newSrc;
                img.src = newSrc;
            }
            // En el patinete, para ir a la izquierda espejamos el gif con CSS
            img.style.transform = dir === 'left' ? 'scaleX(-1)' : 'scaleX(1)';
            return;
        }

        img.style.transform = 'scaleX(1)';
        const newSrc = dir === 'left' ? gifs.leftRun : gifs.rightRun;
        if (currentAnimation !== newSrc) {
            currentAnimation = newSrc;
            img.src = newSrc;
        }
    }


    // ============================================================
    // 7. COMPROBACIÓN DE INTERACCIONES
    // ============================================================
    // Esta función se llama en cada frame para ver si el personaje
    // está cerca de algún objeto con el que puede interactuar,
    // y muestra u oculta los prompts (iconos de "pulsa E") en consecuencia.
    // ============================================================

    function checkInteractions() {
        const playerRect    = player.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        // Calculamos el centro horizontal del personaje relativo al contenedor
        const relativePlayerX = (playerRect.left + playerRect.width / 2) - containerRect.left;

        // --- Nivel 1: detección de la puerta ---
        if (currentLevel === 1) {
            if (!level1Exit || level1Exit.style.display === 'none') return;

            const doorRect   = level1Exit.getBoundingClientRect();
            const doorCenter = (doorRect.left + doorRect.width / 2) - containerRect.left;

            if (Math.abs(relativePlayerX - doorCenter) < 100) {
                // Está cerca → mostramos el prompt "pulsa E"
                if (!isNearExit) { isNearExit = true; keyPrompt.classList.add('visible'); }
            } else {
                if (isNearExit) { isNearExit = false; keyPrompt.classList.remove('visible'); }
            }
        }

        // --- Nivel 2: detección de cartel, patinete y coche ---
        if (currentLevel === 2) {
            if (isParkUnlocked) {
                // Si el parque ya está desbloqueado, ocultamos todos los prompts
                promptSign.classList.remove('visible');
                promptScooter.classList.remove('visible');
                promptCar.classList.remove('visible');
                return;
            }

            // "Math.abs" da el valor absoluto (la distancia sin importar el signo)
            // Si la distancia al objeto es menor de 60px → mostramos su prompt
            if (Math.abs(relativePlayerX - 75)  < 60) promptSign.classList.add('visible');
            else promptSign.classList.remove('visible');

            if (Math.abs(relativePlayerX - 320) < 60) promptScooter.classList.add('visible');
            else promptScooter.classList.remove('visible');

            if (Math.abs(relativePlayerX - 600) < 60) promptCar.classList.add('visible');
            else promptCar.classList.remove('visible');
        }
    }


    // ============================================================
    // FUNCIONES DE CARGA DE NIVELES
    // ============================================================
    // Cada función resetea el estado del juego y aplica
    // las clases CSS del nuevo nivel al contenedor.
    // Las clases CSS son las que cambian el fondo de pantalla.
    // ============================================================

    function loadLevel2() {
        currentLevel = 2;

        // Reseteamos todos los flags a su estado inicial
        isParkUnlocked        = false;
        isTransitioning       = false;
        isDead                = false;
        isMinigameActive      = false;
        isScooterFinesPlaying = false;
        scooterFinesStep      = 0;
        isDialogueActive      = false;
        isConfirmationActive  = false;
        currentInteraction    = null;

        // Reseteamos la UI a su estado inicial
        promptPark.classList.remove('unlocked');
        dialogueBox.style.display       = 'none';
        dialogueBox.style.zIndex        = '5001';
        confirmationModal.style.display = 'none';
        scooterVideoScreen.style.display = 'none';
        gameOverScreen.style.display    = 'none';

        // Eliminamos todas las piedras que pudieran haber quedado del patinete
        rocks.forEach(r => r.remove()); // .remove() elimina el elemento del DOM
        rocks = [];                      // Vaciamos el array

        // Limpiamos clases y estilos del nivel anterior
        container.classList.remove('level-patinete', 'level-3', 'level-4');
        container.style.transform       = 'none';
        container.style.backgroundImage = '';
        if (tutorialWS) tutorialWS.style.display = '';

        level1Exit.style.display = 'none'; // Ocultamos la puerta del nivel 1

        // Recolocamos al personaje
        player.style.display    = 'block';
        player.style.bottom     = '80px';
        player.style.transform  = 'scale(1)';
        posX      = 50;
        velocity  = 0;
        direction = 'right';
        player.style.left = posX + 'px';

        container.classList.add('level-2'); // Aplicamos la clase CSS del nivel 2 (cambia el fondo)
        setIdle();
    }

    function loadLevel3() {
        if (isTransitioning) return; // Evitamos cargar el nivel dos veces a la vez
        isTransitioning = true;
        currentLevel    = 3;

        blackCurtain.style.opacity = '1'; // Fundimos a negro

        setTimeout(() => {
            container.classList.remove('level-2');
            container.classList.add('level-3');
            posX = 50; velocity = 0; direction = 'right';
            player.style.left = posX + 'px';
            setIdle();
            showMessage("Narrador", "name-narrador", "El parc està tranquil a aquestes hores. L'aire fresc t'ajuda a aclarir la ment. Segueix endavant.", null);
            setTimeout(() => {
                blackCurtain.style.opacity = '0'; // Quitamos el negro
                isTransitioning = false;           // Permitimos transiciones futuras
            }, 500);
        }, 1000); // Esperamos 1 segundo con el negro antes de cambiar
    }

    function loadLevel4() {
        if (isTransitioning) return;
        isTransitioning = true;
        currentLevel    = 4;

        // Reseteamos flags específicos del nivel 4
        hasSpokenAtCrosswalk = false;
        isCrossingBadly      = false;
        isDead               = false;
        isLevelFinished      = false;
        isWaitingForLight    = false;
        container.style.backgroundImage = '';

        blackCurtain.style.opacity  = '1';
        killerCar.style.display     = 'none';
        player.style.display        = 'block';
        player.style.transform      = 'scale(1)';
        player.style.bottom         = '80px';

        setTimeout(() => {
            container.classList.remove('level-3');
            container.classList.add('level-4');
            posX = 50; velocity = 0; direction = 'right';
            player.style.left = posX + 'px';
            setIdle();

            setTimeout(() => {
                blackCurtain.style.opacity = '0';
                setTimeout(() => { isTransitioning = false; }, 600);
            }, 500);
        }, 1000);
    }

    function loadLevelPatinete() {
        if (isTransitioning) return;
        isTransitioning = true;
        currentLevel    = 5;

        blackCurtain.style.opacity = '1';

        setTimeout(() => {
            container.classList.remove('level-2');
            container.classList.add('level-patinete');

            if (tutorialTeclas) tutorialTeclas.style.display = 'none';

            // Limpiamos piedras y reseteamos el minijuego
            rocks.forEach(rock => rock.remove());
            rocks            = [];
            rockSpawnTimer   = 0;
            isMinigameActive = true;
            isDead           = false;
            rockSpeed        = 5;
            drunkFrameCount  = 0;
            dizzinessLevel   = 0;
            container.style.transform = 'none';

            // Recolocamos al personaje más pequeño para el patinete
            player.style.display   = 'block';
            posX = 50; velocity = 0; direction = 'right';
            player.style.left      = posX + 'px';
            player.style.transform = 'scale(0.7)'; // Lo achicamos un 30%
            posY = 220;
            player.style.bottom    = posY + 'px';
            setIdle();

            setTimeout(() => {
                blackCurtain.style.opacity = '0';
                setTimeout(() => { isTransitioning = false; }, 600);
            }, 500);
        }, 1000);
    }


    // ============================================================
    // QTE (QUICK TIME EVENT) - La escena de frenar el coche
    // ============================================================
    // El jugador tiene 10 segundos para pulsar E 30 veces.
    // Si lo consigue → esquiva a la àvia. Si no → la atropella.
    // ============================================================

    function startQTE(onSuccess, onFail) {
        qteActive      = true;
        qtePresses     = 0;
        qteSecondsLeft = 10;

        // Creamos el overlay del QTE dinámicamente
        const qteOverlay = document.createElement('div');
        qteOverlay.id = 'qte-overlay';
        qteOverlay.style.cssText = `
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            background: rgba(0,0,0,0.0);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            font-family: 'Arial Black', sans-serif;
        `;
        // Nota: "cssText" permite escribir varios estilos a la vez como string,
        // igual que el atributo style="" en HTML

        // GIF animado de la tecla E
        const qteGif = document.createElement('img');
        qteGif.src = 'imagenes/qte_e.gif';
        qteGif.style.cssText = `
            width: 100px;
            height: 100px;
            image-rendering: pixelated;
            margin-bottom: 12px;
            filter: drop-shadow(0 0 12px #ff4444);
            animation: qte-pulse 0.4s ease-in-out infinite alternate;
        `;

        // Contador de pulsaciones (0 / 30)
        const qteCounter = document.createElement('div');
        qteCounter.id = 'qte-counter';
        qteCounter.style.cssText = `
            color: #ffffff;
            font-size: 2rem;
            font-weight: 900;
            letter-spacing: 2px;
            text-shadow: 0 0 16px #ff4444, 0 0 6px #000;
            margin-top: 8px;
            transition: transform 0.08s ease;
        `;
        qteCounter.textContent = `0 / ${QTE_MAX_PRESSES}`; // Texto inicial: "0 / 30"

        // Añadimos las animaciones al <head> del documento
        const styleTag = document.createElement('style');
        styleTag.textContent = `
            @keyframes qte-pulse {
                from { transform: scale(1);    filter: drop-shadow(0 0 10px #ff4444); }
                to   { transform: scale(1.08); filter: drop-shadow(0 0 30px #ff0000); }
            }
            @keyframes qte-hit {
                0%   { transform: scale(1.18); }
                100% { transform: scale(1); }
            }
            @keyframes qte-counter-pop {
                0%   { transform: scale(1.3); color: #ffdd00; }
                100% { transform: scale(1);   color: #ffffff; }
            }
        `;
        document.head.appendChild(styleTag);

        // Texto de instrucción que aparece encima del GIF
        const qteLabel = document.createElement('div');
        qteLabel.style.cssText = `
            color: #ffffff;
            font-size: 1.4rem;
            font-weight: 900;
            text-shadow: 0 0 10px #ff4444, 0 0 4px #000;
            margin-bottom: 16px;
            letter-spacing: 1px;
            text-align: center;
        `;
        qteLabel.textContent = 'Prem E 30 vegades per frenar!';

        // Montamos el overlay: instrucción → GIF → contador
        qteOverlay.appendChild(qteLabel);
        qteOverlay.appendChild(qteGif);
        qteOverlay.appendChild(qteCounter);
        document.body.appendChild(qteOverlay); // Lo añadimos al body de la página

        // Cuenta atrás: cada segundo restamos 1 a qteSecondsLeft
        qteCountdown = setInterval(() => {
            qteSecondsLeft--;
            if (qteSecondsLeft <= 0) {
                // Se acabó el tiempo → fallo
                endQTE(false, qteOverlay, styleTag, onSuccess, onFail);
            }
        }, 1000); // 1000 milisegundos = 1 segundo

        // Listener que detecta cada pulsación de E durante el QTE
        function qteKeyHandler(e) {
            if (!qteActive) return;
            if (e.key.toLowerCase() === 'e') {
                qtePresses++;

                // Actualizamos el texto del contador
                qteCounter.textContent = `${qtePresses} / ${QTE_MAX_PRESSES}`;

                // Animación de "pop" en el contador al pulsar
                // Forzamos reinicio de la animación: quitar → reflujo → poner
                qteCounter.style.animation = 'none';
                void qteCounter.offsetWidth; // "void" fuerza al navegador a recalcular el layout
                qteCounter.style.animation = 'qte-counter-pop 0.15s ease forwards';

                // Flash de impacto en el GIF de la tecla
                qteGif.style.animation = 'none';
                void qteGif.offsetWidth;
                qteGif.style.animation = 'qte-hit 0.1s ease, qte-pulse 0.4s ease-in-out 0.1s infinite alternate';

                if (qtePresses >= QTE_MAX_PRESSES) {
                    // Llegó a 30 pulsaciones → éxito
                    endQTE(true, qteOverlay, styleTag, onSuccess, onFail);
                }
            }
        }

        // Guardamos el handler en window para poder eliminarlo después
        window._qteKeyHandler = qteKeyHandler;
        window.addEventListener('keydown', qteKeyHandler);
    }

    // Termina el QTE (tanto si se gana como si se pierde)
    function endQTE(success, overlay, styleTag, onSuccess, onFail) {
        if (!qteActive) return; // Evitamos que se llame dos veces

        qteActive = false;
        clearInterval(qteCountdown); // Paramos el temporizador
        window.removeEventListener('keydown', window._qteKeyHandler); // Eliminamos el listener
        overlay.remove();  // Eliminamos el overlay del DOM
        if (styleTag) styleTag.remove(); // Eliminamos las animaciones añadidas

        // Ejecutamos el callback correspondiente
        if (success) {
            onSuccess(); // Función que se pasa cuando se llama a startQTE → éxito
        } else {
            onFail();    // Función que se pasa cuando se llama a startQTE → fallo
        }
    }


    // ============================================================
    // CARGAR NIVEL COTXE
    // ============================================================

    function loadLevelCoche() {
        if (isTransitioning) return;
        isTransitioning = true;
        currentLevel    = 6;

        blackCurtain.style.opacity = '1';

        setTimeout(() => {
            // Quitamos las clases de todos los niveles anteriores y añadimos la del cotxe
            container.classList.remove('level-2', 'level-3', 'level-4', 'level-patinete');
            container.classList.add('level-coche');
            container.style.transform       = 'none';
            container.style.backgroundImage = '';

            // Reseteamos todos los flags
            isDead            = false;
            isLevelFinished   = false;
            isCrossingBadly   = false;
            isWaitingForLight = false;
            isMinigameActive  = false;
            killerCar.style.display = 'none';

            // Limpiamos piedras residuales
            rocks.forEach(r => r.remove());
            rocks = [];

            // Reseteamos todo lo relacionado con la àvia
            grandmaActive     = false;
            grandmaHasStarted = false;
            if (grandmaAnimFrame) {
                cancelAnimationFrame(grandmaAnimFrame);
                grandmaAnimFrame = null;
            }
            container.style.animation = '';
            container.style.filter    = '';

            const grandmaEl = document.getElementById('grandma');
            if (grandmaEl) grandmaEl.style.display = 'none';

            const greyEl = document.getElementById('grey-overlay');
            if (greyEl) { greyEl.style.display = 'none'; greyEl.style.opacity = '0'; }

            // Recolocamos al personaje
            player.style.display   = 'block';
            player.style.bottom    = '80px';
            player.style.transform = 'scale(1)';
            posX      = 0;
            velocity  = 0;
            direction = 'right';
            player.style.left = posX + 'px';
            setIdle();

            // Mensaje de aviso antes de que empiece la escena
            showMessage(
                "Narrador", "name-narrador",
                "Has decidit agafar el cotxe. Però has begut aquesta nit... Conduir ara podria tenir conseqüències molt greus.",
                null
            );

            setTimeout(() => {
                blackCurtain.style.opacity = '0';
                setTimeout(() => { isTransitioning = false; }, 600);
            }, 500);
        }, 1000);
    }


    // ============================================================
    // 8. ENTRADAS DE TECLADO (EVENTOS)
    // ============================================================
    // Capturamos en tiempo real qué teclas están pulsadas.
    // "keydown" se dispara al pulsar una tecla.
    // "keyup" se dispara al soltarla.
    // ============================================================

    window.addEventListener('keydown', (e) => {
        if (!gameStarted) return;      // Si el juego no ha empezado, ignoramos todo
        if (isWaitingForLight) return; // Si está esperando el semáforo, no puede moverse
        if (qteActive) return;         // Durante el QTE bloqueamos movimiento (el QTE tiene su propio listener)

        const key = e.key.toLowerCase(); // Convertimos a minúsculas para no distinguir MAYÚS

        // Si E se pulsa con diálogo abierto → avanzar diálogo
        if (key === 'e' && isDialogueActive) {
            if (isScooterFinesPlaying) {
                showNextScooterFinesDialogue(); // Diálogos de multas del patinete
                return;
            }
            if (!isInitialized) {
                showNextDialogue(); // Diálogos de la intro
            } else {
                // En el resto del juego, E abre confirmación o cierra el mensaje
                if (currentInteraction === 'paso-peatones') {
                    openConfirmation();
                } else if (['cartel', 'scooter', 'coche'].includes(currentInteraction)) {
                    openConfirmation();
                } else {
                    closeMessage();
                }
            }
            return; // "return" sale de la función, no procesa más código
        }

        if (isConfirmationActive) return; // Con modal abierto, no hacemos nada más

        // Marcamos las teclas de movimiento como pulsadas
        if (key === 'a') keys.a = true;
        if (key === 'd') keys.d = true;
        if (key === 'w' || e.key === 'ArrowUp')   keys.w = true;
        if (key === 's' || e.key === 'ArrowDown')  keys.s = true;

        // Si E se pulsa SIN diálogo → interactuar con objetos del escenario
        if (key === 'e' && !isDialogueActive && !isConfirmationActive) {
            const playerRect    = player.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            const relativeX     = (playerRect.left + playerRect.width / 2) - containerRect.left;

            // Nivel 1: salir por la puerta
            if (isNearExit && currentLevel === 1) loadLevel2();

            // Nivel 2: interactuar con los objetos
            if (currentLevel === 2) {
                if (isParkUnlocked && Math.abs(relativeX - 500) < 100) {
                    loadLevel3(); // Si el parque está desbloqueado, vamos al nivel 3
                    return;
                }
                if (!isParkUnlocked) {
                    if (Math.abs(relativeX - 75)  < 60)  showMessage("Torrent", "name-torrent", "La meva casa és molt lluny d'aquí.", "cartel");
                    else if (Math.abs(relativeX - 320) < 60)  showMessage("Torrent", "name-torrent", "Hi ha un patinet aquí. Puc agafar-lo per arribar més aviat, però no porto casc. L'agafo?", "scooter");
                    else if (Math.abs(relativeX - 600) < 100) showMessage("Torrent", "name-torrent", "No sé si estic en condicions de conduir...", "coche");
                }
            }
        }
    });

    // Cuando se suelta una tecla → la marcamos como no pulsada
    window.addEventListener('keyup', (e) => {
        const key = e.key.toLowerCase();
        if (key === 'a') keys.a = false;
        if (key === 'd') keys.d = false;
        if (key === 'w' || e.key === 'ArrowUp')   keys.w = false;
        if (key === 's' || e.key === 'ArrowDown')  keys.s = false;
    });


    // ============================================================
    // 9. LOOP PRINCIPAL DEL JUEGO
    // ============================================================
    // Esta es la función más importante. Se ejecuta ~60 veces por
    // segundo (una vez por frame) gracias a requestAnimationFrame.
    // Cada vez que se ejecuta: lee las teclas, calcula el movimiento,
    // actualiza la posición y vuelve a pedir el siguiente frame.
    // Es como el "latido" del juego.
    // ============================================================

    function loop() {
        // Si el juego no está listo o hay algo bloqueante → pausamos el movimiento
        if (!isInitialized || isDialogueActive || isConfirmationActive) {
            if (isInitialized) requestAnimationFrame(loop); // Pero seguimos el loop para detectar cuando se desbloquea
            return;
        }

        // ---- NIVEL 5: MINIJUEGO DEL PATINETE ----
        if (currentLevel === 5) {
            if (!isMinigameActive || isDead) {
                requestAnimationFrame(loop);
                return;
            }

            drunkFrameCount++; // Incrementamos el contador de frames

            // Cada 300 frames (≈5 segundos) aumentamos dificultad y mareo
            if (drunkFrameCount % 300 === 0) {
                rockSpeed     += 1.5; // Las piedras van más rápido
                dizzinessLevel += 0.8; // Más mareo
            }

            // Aplicamos el efecto visual de mareo (rotación y balanceo)
            if (dizzinessLevel > 0) {
                // "Math.sin" y "Math.cos" dan valores oscilantes → movimiento ondulante
                let rotacio = Math.sin(drunkFrameCount * 0.03) * dizzinessLevel;
                let movY    = Math.cos(drunkFrameCount * 0.04) * (dizzinessLevel * 2);
                container.style.transform = `rotate(${rotacio}deg) translateY(${movY}px) scale(1.05)`;
            }

            // Movimiento vertical del patinete (W = arriba, S = abajo)
            let speedY = 0;
            const VELOCITAT_PATINETE = 4;
            if (keys.w) speedY =  VELOCITAT_PATINETE;
            if (keys.s) speedY = -VELOCITAT_PATINETE;

            // El mareo hace que el patinete se mueva solo un poco
            let perdudaEquilibri = Math.sin(drunkFrameCount * 0.05) * (dizzinessLevel * 1.5);

            if (speedY !== 0 || perdudaEquilibri !== 0) {
                posY += speedY + perdudaEquilibri;
                if (posY > 340) posY = 340; // Límite superior
                if (posY < 150) posY = 150; // Límite inferior
                player.style.bottom = posY + 'px';
            }
            setRun('right'); // El patinete siempre "corre" hacia la derecha

            // Generación de piedras: cuando el timer llega al umbral, creamos una
            rockSpawnTimer++;
            let tempsSpawn = Math.max(40, 90 - (dizzinessLevel * 10)); // El umbral baja con el mareo
            if (rockSpawnTimer > tempsSpawn) {
                spawnRock();
                rockSpawnTimer = 0;
            }

            // Movemos todas las piedras y comprobamos colisiones
            const playerRect = player.getBoundingClientRect();

            for (let i = rocks.length - 1; i >= 0; i--) { // Recorremos de atrás adelante para poder eliminar sin errores
                const rock       = rocks[i];
                let currentRockX = parseFloat(rock.style.left); // Convertimos "850px" → 850
                currentRockX -= rockSpeed; // Movemos la piedra hacia la izquierda
                rock.style.left = currentRockX + 'px';

                const rockRect = rock.getBoundingClientRect();
                if (check2DCollision(playerRect, rockRect, 15)) {
                    triggerScooterDeath(); // ¡Colisión! → muerte en el patinete
                    requestAnimationFrame(loop);
                    return;
                }

                if (currentRockX < -100) {
                    // La piedra salió por la izquierda → la eliminamos
                    rock.remove();
                    rocks.splice(i, 1); // "splice" elimina 1 elemento en la posición i del array
                }
            }

        // ---- RESTO DE NIVELES: MOVIMIENTO HORIZONTAL NORMAL ----
        } else {
            // Actualizamos la dirección según las teclas pulsadas
            if (keys.a && !keys.d) direction = 'left';
            if (keys.d && !keys.a) direction = 'right';

            // Aceleración: aumentamos la velocidad en la dirección pulsada
            if (keys.d && velocity < MAX_SPEED)  velocity = Math.min(velocity + ACCELERATION, MAX_SPEED);
            if (keys.a && velocity > -MAX_SPEED) velocity = Math.max(velocity - ACCELERATION, -MAX_SPEED);

            // Fricción: si no se pulsa nada, la velocidad disminuye gradualmente
            if (!keys.a && !keys.d) {
                velocity *= friction; // Multiplicar por 0.85 cada frame → se para suavemente
                if (Math.abs(velocity) < 0.05) velocity = 0; // Cuando es casi 0 → paramos del todo
            }

            // Actualizamos la animación según si se mueve o no
            if (velocity === 0) setIdle();
            else setRun(direction);

            // Aplicamos el movimiento si hay velocidad
            if (velocity !== 0) {
                const nextX = posX + velocity; // Calculamos la siguiente posición
                if (currentLevel === 2 && velocity > 0 && checkCollision(nextX)) {
                    // Colisión con el coche obstáculo → paramos
                    velocity = 0;
                    setIdle();
                } else {
                    posX = nextX;      // Aplicamos la nueva posición
                    applyPosition();   // Actualizamos el HTML y comprobamos puntos clave
                }
            }
        }

        requestAnimationFrame(loop); // Pedimos el siguiente frame → el loop continúa infinitamente
    }


    // ============================================================
    // 10. INICIO DEL JUEGO
    // ============================================================
    // El juego empieza cuando el jugador pulsa cualquier tecla
    // en la pantalla de inicio.
    // ============================================================

    function handleStartInput() {
        if (gameStarted) return; // Solo se ejecuta una vez
        gameStarted = true;

        // Una vez que empieza, quitamos este listener (ya no lo necesitamos)
        window.removeEventListener('keydown', handleStartInput);

        blackCurtain.style.opacity = '1'; // Fundimos a negro

        setTimeout(() => {
            introScreen.style.display = 'none'; // Ocultamos la pantalla de inicio
            const video = introScreen.querySelector('video');
            if (video) video.pause(); // Paramos el vídeo de la intro si hay uno

            posX = 50;
            applyPosition();
            setIdle();

            setTimeout(() => {
                blackCurtain.style.opacity = '0'; // Quitamos el negro
                showNextDialogue();               // Empezamos los diálogos de introducción
            }, 500);
        }, 800);
    }

    // Esperamos a que la imagen del personaje esté cargada antes de añadir el listener
    // Si ya está cargada (complete = true) → directamente
    // Si no → esperamos al evento onload
    if (img.complete) {
        window.addEventListener('keydown', handleStartInput);
    } else {
        img.onload = () => {
            window.addEventListener('keydown', handleStartInput);
        };
    }


    // ============================================================
    // BOTONES DE LA PANTALLA DE GAME OVER
    // ============================================================

    // Botón "Reintentar" → vuelve al mismo nivel donde murió
    btnRetry.addEventListener('click', () => {
        gameOverScreen.style.display = 'none';
        isScooterFinesPlaying = false;
        scooterFinesStep      = 0;

        if (currentLevel === 5) {
            loadLevelPatinete(); // Si murió en el patinete → reinicia el patinete
        } else {
            loadLevel4();        // Si murió en el semáforo → reinicia el nivel 4
        }
    });

    // Botón "Nuevo camino" → vuelve al nivel 2 para elegir otra opción
    document.getElementById('btn-new-path').addEventListener('click', () => {
        gameOverScreen.style.display = 'none';

        // Reseteamos el título del game over al valor por defecto
        const titleEl = document.getElementById('game-over-title');
        if (titleEl) titleEl.innerText = "HAS ESTAT ATROPELLAT!";

        // Mostramos el botón de reintentar y ocultamos el de nuevo camino
        document.getElementById('btn-retry').style.display    = 'inline-block';
        document.getElementById('btn-new-path').style.display = 'none';
        dialogueBox.style.zIndex = '';

        // Limpiamos el estado del patinete
        isScooterFinesPlaying = false;
        scooterFinesStep      = 0;
        rocks.forEach(r => r.remove());
        rocks = [];

        // Limpiamos el vídeo del cotxe
        carVideoScreen.style.display = 'none';
        carVideo.src = '';

        loadLevel2(); // Volvemos al nivel 2 para elegir otro camino
    });

})(); // Aquí termina el "envoltorio" que ejecuta todo automáticamente