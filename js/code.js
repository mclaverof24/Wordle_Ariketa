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
   * Teklatu fisikoaren sakatzeak bideratzeko funtzioa
   */
  const manejarTecladoFisico = (e) => {
    const key = e.key.toUpperCase();

    if (key === 'ENTER') {
      procesarEntrada('Enter');
    } else if (key === 'BACKSPACE') {
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
        console.log(`Errenkada amaituta (${currentRow}). Hitzaren egiaztapena egingo da.`);
        currentRow++;
        currentCol = 0;
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

  const obtenerCeldaActual = (rowIdx, colIdx) => {
    return board.querySelector(`.row[data-row="${rowIdx}"] .cell[data-col="${colIdx}"]`);
  };

  setupForm.addEventListener("submit", iniciarJuego);

});