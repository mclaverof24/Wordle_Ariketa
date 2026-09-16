document.addEventListener('DOMContentLoaded', () => {

  const setupForm = document.getElementById("setup-form");
  const board = document.getElementById("board");
  const keyboard = document.getElementById("keyboard");

  // Teklatuaren errenkadak (Irudiaren egitura bera)
  const KEYBOARD_LAYOUT = [
    ['Á', 'É', 'Í', 'Ó', 'Ú'],
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ'],
    ['Enter', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DEL']
  ];

  const iniciarJuego = (event) => {
    event.preventDefault();

    const intentosSeleccionados = parseInt(document.getElementById("intentos").value, 10);
    const letrasSeleccionadas = parseInt(document.getElementById("letras").value, 10);

    setupForm.style.display = "none";

    crearTablero(intentosSeleccionados, letrasSeleccionadas);
    crearTeclado();
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

  /**
   * Teklatu birtuala dinamikoki sortzen duen funtzioa
   */
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

    // Event Delegation bidez klikak entzun
    keyboard.addEventListener('click', manejarPulsacion);
  };

  /**
   * Teklatuko botoiak sakatzean exekutatzen den funtzioa
   */
  const manejarPulsacion = (e) => {
    const target = e.target;
    if (!target.classList.contains('key')) return;

    const key = target.dataset.key;
    console.log(`Sakatutako tekla: ${key}`);
  };

  setupForm.addEventListener("submit", iniciarJuego);

});