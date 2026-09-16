// DOM-a osorik kargatu arte itxaron
document.addEventListener('DOMContentLoaded', () => {

  // 1. DOMeko elementuak hautatu
  const configForm = document.getElementById('setup-form');
  const btnPlay = document.getElementById('btn-jugar');

  // 2. Inprimakia bidaltzeko gertaera entzun
  configForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Orria berriro kargatzea saihestu

    // Inprimakiko datuak hartu
    const formData = new FormData(configForm);
    
    // Aukeratutako balioak jaso eta zenbaki osoetara bihurtu (parseInt)
    const intentos = parseInt(formData.get('intentos'), 10);
    const letras = parseInt(formData.get('letras'), 10);

    // Partida hasi hautatutako aukerekin
    startGame({ intentos, letras });
  });

  //Partida hasieratzeko funtzio nagusia
  function startGame(config) {
    console.log(`Konfiguratutako saialdiak: ${config.intentos}`);
    console.log(`Konfiguratutako hizki kopurua: ${config.letras}`);

    // Botoian feedback bisuala erakutsi
    btnPlay.textContent = 'Kargatzen...';
    btnPlay.disabled = true;

    // Hemen hurrengo urratsa joango da: inprimakia ezkutatu eta taula marraztu
  }

});