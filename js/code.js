document.addEventListener('DOMContentLoaded', () => {

    const setupForm = document.getElementById("setup-form");
    const board = document.getElementById("board");
    const keyboard = document.getElementById("keyboard");

    // Jokoaren egoera aldagaiak
    let targetWord = "";
    let currentRow = 0;
    let currentCol = 0;
    let maxRows = 0;
    let wordLength = 0;

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

        // 1. APIari deitu hitza lortzeko
        targetWord = await obtenerPalabraObjetivo(wordLength);
        console.log(`Lortutako hitza (sekretua): ${targetWord}`);

        // 2. Inprimakia ezkutatu eta interfazea sortu
        setupForm.style.display = "none";
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

        // Jokoaren amaiera kudeatu
        if (wordEntered === targetWord) {
            setTimeout(() => alert("Zorionak! Hitza asmatu duzu! 🎉"), 100);
            currentRow = maxRows;
        } else {
            currentRow++;
            currentCol = 0;
            if (currentRow >= maxRows) {
                setTimeout(() => alert(`Ezin izan duzu lortu. Hitza zen: ${targetWord}`), 100);
            }
        }
    };

    const obtenerCeldaActual = (rowIdx, colIdx) => {
        return board.querySelector(`.row[data-row="${rowIdx}"] .cell[data-col="${colIdx}"]`);
    };

    setupForm.addEventListener("submit", iniciarJuego);

});