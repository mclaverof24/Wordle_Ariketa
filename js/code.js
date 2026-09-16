document.addEventListener('DOMContentLoaded', () => {

  // Formularioa eta taula jaso
  const setupForm = document.getElementById("setup-form");
  const board = document.getElementById("board");

  // Inprimakia bidaltzean jokoa hasieratzeko gezi-funtzioa
  const iniciarJuego = (event) => {
    event.preventDefault(); // Orria berriro kargatzea saihestu

    // Hautatutako balioak irakurri
    const intentosSeleccionados = parseInt(document.getElementById("intentos").value, 10);
    const letrasSeleccionadas = parseInt(document.getElementById("letras").value, 10);

    // Inprimakia ezkutatu
    setupForm.style.display = "none";

    // Taula sortu bi for erabiliz
    crearTablero(intentosSeleccionados, letrasSeleccionadas);
  };


  const crearTablero = (saialdiak, hizkiak) => {
    board.innerHTML = ''; // Edukia garbitu

    // 1. FOR: Saialdiak (errenkadak)
    for (let i = 0; i < saialdiak; i++) {
      const row = document.createElement('div');
      row.classList.add('row');
      row.dataset.row = i;

      // 2. FOR: Hizkiak (gelaxkak)
      for (let j = 0; j < hizkiak; j++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.col = j;
        row.appendChild(cell);
      }

      board.appendChild(row);
    }
  };

  // Inprimakiko submit gertaera entzun
  setupForm.addEventListener("submit", iniciarJuego);

});