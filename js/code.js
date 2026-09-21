document.addEventListener('DOMContentLoaded', () => {

    const setupForm = document.getElementById("setup-form");
    const board = document.getElementById("board");
    const keyboard = document.getElementById("keyboard");
    const historySection = document.getElementById("history");
    const historyList = document.getElementById("history-list");
    const btnReplay = document.getElementById("btn-replay");

    const HISTORIAL_KEY = "wordle-historial";

    // Jokoaren egoera aldagaiak
    let targetWord = "";
    let currentRow = 0;
    let currentCol = 0;
    let maxRows = 0;
    let wordLength = 0;
    let intentosRealizados = [];

    const KEYBOARD_LAYOUT = [
        ['Á', 'É', 'Í', 'Ó', 'Ú'],
        ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ'],
        ['Enter', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DEL']
    ];

    const iniciarJuego = async (event) => {
        event.preventDefault();

        maxRows = parseInt(document.getElementById("intentos").value, 10);
        wordLength = parseInt(document.getElementById("letras").value, 10);

        // Resetear contadores
        currentRow = 0;
        currentCol = 0;
        intentosRealizados = [];

        // 1. APIari deitu hitza lortzeko
        targetWord = await obtenerPalabraObjetivo(wordLength);
        console.log(`Lortutako hitza (sekretua): ${targetWord}`);

        // 2. Inprimakia ezkutatu eta interfazea sortu
        setupForm.style.display = "none";
        historySection.style.display = "none";
        board.style.display = "";
        keyboard.style.display = "";
        crearTablero(maxRows, wordLength);
        crearTeclado();

        // 3. Teklatu fisikoa entzuteko gertaera gehitu
        document.removeEventListener('keydown', manejarTecladoFisico);
        document.addEventListener('keydown', manejarTecladoFisico);
    };

    /**
     * APIaren kontrako fetch eskaera egiten duen funtzio asinkronoa
     */
    const obtenerPalabraObjetivo = async (longitud) => {
        try {
            const response = await fetch(`https://random-word-api.herokuapp.com/word?lang=es&length=${longitud}`);
            const data = await response.json();
            return data[0].toUpperCase();
        } catch (error) {
            console.error("Errorea hitza kargatzerakoan:", error);
            return "ZAZPI".slice(0, longitud).toUpperCase();
        }
    };

    const crearTablero = (saialdiak, hizkiak) => {
        board.innerHTML = '';
        for (let i = 0; i < saialdiak; i++) {
            const row = document.createElement('div');
            row.classList.add('row');
            row.dataset.row = i;

            for (let j = 0; j < hizkiak; j++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.col = j;
                row.appendChild(cell);
            }
            board.appendChild(row);
        }
    };

    const crearTeclado = () => {
        keyboard.innerHTML = '';

        KEYBOARD_LAYOUT.forEach((rowKeys) => {
            const rowContainer = document.createElement('div');
            rowContainer.classList.add('keyboard-row');

            rowKeys.forEach((keyVal) => {
                const button = document.createElement('button');
                button.type = 'button';
                button.textContent = keyVal;
                button.classList.add('key');
                button.dataset.key = keyVal;

                if (keyVal === 'Enter' || keyVal === 'DEL') {
                    button.classList.add('key-large');
                }

                rowContainer.appendChild(button);
            });

            keyboard.appendChild(rowContainer);
        });

        keyboard.addEventListener('click', (e) => {
            const target = e.target;
            if (!target.classList.contains('key')) return;
            procesarEntrada(target.dataset.key);
        });
    };

    /**
     * Teklatu fisikoaren sakatzeak bideratzeko funtzioa (BackSpace eta Delete/Supr onartuz)
     */
    const manejarTecladoFisico = (e) => {
        const key = e.key.toUpperCase();

        if (key === 'ENTER') {
            procesarEntrada('Enter');
        } else if (key === 'BACKSPACE' || key === 'DELETE') {
            procesarEntrada('DEL');
        } else if (/^[A-ZÁÉÍÓÚÑ]$/.test(key)) {
            procesarEntrada(key);
        }
    };

    /**
     * Hizkiak idatzi, ezabatu edo 'Enter' kudeatzeko logika nagusia
     */
    const procesarEntrada = (key) => {
        if (currentRow >= maxRows) return;

        if (key === 'DEL') {
            if (currentCol > 0) {
                currentCol--;
                const cell = obtenerCeldaActual(currentRow, currentCol);
                cell.textContent = '';
            }
        } else if (key === 'Enter') {
            if (currentCol === wordLength) {
                comprobarPalabra();
            } else {
                console.log("Ez zaude errenkadaren amaieran hitza bidaltzeko.");
            }
        } else {
            if (currentCol < wordLength) {
                const cell = obtenerCeldaActual(currentRow, currentCol);
                cell.textContent = key;
                currentCol++;
            }
        }
    };

    /**
     * "Intro" premionatzerakoan letren egoera egiaztatzeko eta klaseak aplikatzeko logika
     */
    const comprobarPalabra = () => {
        const rowCells = [];
        let wordEntered = "";

        for (let i = 0; i < wordLength; i++) {
            const cell = obtenerCeldaActual(currentRow, i);
            rowCells.push(cell);
            wordEntered += cell.textContent;
        }

        const targetArray = targetWord.split('');
        const classes = new Array(wordLength).fill('no');

        // 1. Pasada: Posizio eta letra zuzenak ('ok')
        for (let i = 0; i < wordLength; i++) {
            if (wordEntered[i] === targetArray[i]) {
                classes[i] = 'ok';
                targetArray[i] = null;
            }
        }

        // 2. Pasada: Hitzean dauden baina beste posizio batean daudenak ('existe')
        for (let i = 0; i < wordLength; i++) {
            if (classes[i] !== 'ok') {
                const foundIdx = targetArray.indexOf(wordEntered[i]);
                if (foundIdx !== -1) {
                    classes[i] = 'existe';
                    targetArray[foundIdx] = null;
                }
            }
        }

        // 3. Tableroko gelaxkei eta teklatu birtualari CSS klaseak jarri
        for (let i = 0; i < wordLength; i++) {
            const cell = rowCells[i];
            const letter = wordEntered[i];
            const statusClass = classes[i];

            cell.classList.add(statusClass);

            const keyButton = keyboard.querySelector(`.key[data-key="${letter}"]`);
            if (keyButton) {
                if (statusClass === 'ok') {
                    keyButton.classList.remove('existe', 'no');
                    keyButton.classList.add('ok');
                } else if (statusClass === 'existe' && !keyButton.classList.contains('ok')) {
                    keyButton.classList.remove('no');
                    keyButton.classList.add('existe');
                } else if (statusClass === 'no' && !keyButton.classList.contains('ok') && !keyButton.classList.contains('existe')) {
                    keyButton.classList.add('no');
                }
            }
        }

        intentosRealizados.push(wordEntered);

        // Jokoaren amaiera kudeatu
        if (wordEntered === targetWord) {
            currentRow = maxRows;
            setTimeout(() => {
                alert("Zorionak! Hitza asmatu duzu! 🎉");
                finalizarJuego(true);
            }, 100);
        } else {
            currentRow++;
            currentCol = 0;
            if (currentRow >= maxRows) {
                setTimeout(() => {
                    alert(`Ezin izan duzu lortu. Hitza zen: ${targetWord}`);
                    finalizarJuego(false);
                }, 100);
            }
        }
    };

    /**
     * Partida amaitutakoan datuak localStorage-n gordetzeko funtzioa (azken 10ak)
     */
    const gordePartida = (irabazi) => {
        const partida = {
            hitza: targetWord,
            saiakerak: intentosRealizados,
            data: new Date().toLocaleString('es-ES'),
            irabazi: irabazi
        };

        let historiala = [];
        try {
            historiala = JSON.parse(localStorage.getItem(HISTORIAL_KEY)) || [];
        } catch (error) {
            console.error("Errorea historiala irakurtzerakoan:", error);
            historiala = [];
        }

        historiala.unshift(partida);
        historiala = historiala.slice(0, 10);

        localStorage.setItem(HISTORIAL_KEY, JSON.stringify(historiala));

        return historiala;
    };

    /**
     * Historialeko partidak zerrendan bistaratzeko funtzioa
     */
    const bistaratuHistoriala = (historiala) => {
        historyList.innerHTML = '';

        historiala.forEach((partida) => {
            const item = document.createElement('li');
            item.classList.add('history-item', partida.irabazi ? 'win' : 'loss');

            const header = document.createElement('div');
            header.classList.add('history-header');

            const wordSpan = document.createElement('span');
            wordSpan.classList.add('history-word');
            wordSpan.textContent = partida.hitza;

            const resultSpan = document.createElement('span');
            resultSpan.classList.add('history-result');
            resultSpan.textContent = partida.irabazi ? 'Irabazita' : 'Galduta';

            header.appendChild(wordSpan);
            header.appendChild(resultSpan);

            const dateDiv = document.createElement('div');
            dateDiv.classList.add('history-date');
            dateDiv.textContent = partida.data;

            const attemptsDiv = document.createElement('div');
            attemptsDiv.classList.add('history-attempts');
            attemptsDiv.textContent = partida.saiakerak.join(', ');

            item.appendChild(header);
            item.appendChild(dateDiv);
            item.appendChild(attemptsDiv);

            historyList.appendChild(item);
        });
    };

    /**
     * Jolasa amaitutakoan taula eta teklatua ezkutatu, partida gorde eta historiala erakusteko funtzioa
     */
    const finalizarJuego = (irabazi) => {
        document.removeEventListener('keydown', manejarTecladoFisico);

        board.style.display = "none";
        keyboard.style.display = "none";

        const historiala = gordePartida(irabazi);
        bistaratuHistoriala(historiala);

        historySection.style.display = "flex";
    };

    /**
     * "Jugar de nuevo" botoiak konfigurazio-inprimakira itzultzeko funtzioa
     */
    const berrabiarazi = () => {
        historySection.style.display = "none";
        board.innerHTML = '';
        keyboard.innerHTML = '';
        setupForm.style.display = "flex";
    };

    const obtenerCeldaActual = (rowIdx, colIdx) => {
        return board.querySelector(`.row[data-row="${rowIdx}"] .cell[data-col="${colIdx}"]`);
    };

    setupForm.addEventListener("submit", iniciarJuego);
    btnReplay.addEventListener("click", berrabiarazi);

});