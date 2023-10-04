const mario = document.querySelector('.mario');
const pipe = document.querySelector('.pipe');
let gameOverMusicPlayed = false;
let playerName = '';
let startTime = 0;
let endTime = 0;
let bestTime = Infinity;
let timerInterval; // Variável para armazenar o intervalo do cronômetro

const start = document.querySelector('.start');
const gameOver = document.querySelector('.game-over');
const playerNameInput = document.getElementById('playerName');
const rankTableBody = document.getElementById('rankTableBody');
const timerElement = document.getElementById('time'); // Elemento do cronômetro

audioStart = new Audio('songs/audio_theme.mp3');
audioGameOver = new Audio('songs/audio_gameover.mp3');

const updateRanking = () => {
  // Load existing ranking data from localStorage
  const rankingData = JSON.parse(localStorage.getItem('ranking')) || [];

  // Add the current player's data to the ranking
  rankingData.push({ name: playerName, time: bestTime });

  // Sort the ranking based on the best time (descending order)
  rankingData.sort((a, b) => b.time - a.time); // Inverter a ordem

  // Keep only the top 10 players
  rankingData.splice(10);

  // Update the HTML table
  rankTableBody.innerHTML = '';
  rankingData.forEach((player, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${player.name}</td>
      <td>${(player.time / 1000).toFixed(2)} s</td>
    `;
    rankTableBody.appendChild(row);
  });

  // Store the updated ranking data in localStorage
  localStorage.setItem('ranking', JSON.stringify(rankingData));
}

const submitName = () => {
  playerName = playerNameInput.value.trim(); // Remove espaços em branco do nome
  if (playerName === '') {
    alert('Por favor, insira um nome válido.');
    return; // Não permita nomes em branco
  }
  playerNameInput.disabled = true;
  playerNameInput.style.display = 'none';
  document.querySelector('.user-input button').style.display = 'none';

  // Iniciar o jogo após enviar o nome
  startGame();
}

const updateTimer = () => {
  const currentTime = (Date.now() - startTime) / 1000; // Tempo decorrido em segundos
  timerElement.textContent = currentTime.toFixed(2);
}

const startGame = () => {
  // Verifique se o jogador inseriu um nome válido
  if (!playerName || playerName.trim() === '') {
    alert('Por favor, insira um nome antes de iniciar o jogo.');
    return; // Não inicie o jogo se o nome estiver em branco
  }
  // Hide the instruction
  const instruction = document.querySelector('.instructions');
  instruction.style.display = 'none';

  // Start the game logic (e.g., animate the pipe)
  pipe.classList.add('pipe-animation');

  // Hide the start button
  start.style.display = 'none';

  // Record the start time
  startTime = Date.now();

  // Iniciar o cronômetro
  timerInterval = setInterval(updateTimer, 10); // Atualiza o cronômetro a cada 10 milissegundos

  // Play the background music
  audioStart.play();
}

const restartGame = () => {
  // Refresh or reload the page
  location.reload();
  gameOver.style.display = 'none';
  pipe.style.left = '';
  pipe.style.right = '0';
  mario.src = 'img/mario.gif';
  mario.style.width = '150px';
  mario.style.bottom = '0';

  start.style.display = 'none';

  audioGameOver.pause();
  audioGameOver.currentTime = 0;

  audioStart.play();
  audioStart.currentTime = 0;

  // Parar o cronômetro e redefinir o tempo
  clearInterval(timerInterval);
  timerElement.textContent = '0.00';
}

const jump = () => {
  mario.classList.add('jump');

  setTimeout(() => {
    mario.classList.remove('jump');
  }, 800);
}

const loop = () => {
  setInterval(() => {
    const pipePosition = pipe.offsetLeft;
    const marioPosition = window
      .getComputedStyle(mario)
      .bottom.replace('px', ' ');

    if (pipePosition <= 120 && pipePosition > 0 && marioPosition < 80) {
      pipe.classList.remove('.pipe-animation');
      pipe.style.left = `${pipePosition}px`;

      mario.classList.remove('.jump');
      mario.style.bottom = `${marioPosition}px`;

      mario.src = 'img/game-over.png';
      mario.style.width = '80px';
      mario.style.marginLeft = '50px';

      function stopAudioStart() {
        audioStart.pause();
      }
      stopAudioStart();

      audioGameOver.play();

      function stopAudio() {
        audioGameOver.pause();
      }
      setTimeout(stopAudio, 7000);

      gameOver.style.display = 'flex';

      // Record the end time and calculate the time elapsed
      endTime = Date.now();
      const currentTime = endTime - startTime;

      if (currentTime < bestTime) {
        bestTime = currentTime;
        updateRanking();
      }

      // Parar o cronômetro
      clearInterval(timerInterval);
    }
  }, 10);
}

loop();

document.addEventListener('keypress', (e) => {
  const tecla = e.key;
  if (tecla === ' ') {
    jump();
  }
});

document.addEventListener('touchstart', (e) => {
  if (e.touches.length) {
    jump();
  }
});

document.addEventListener('keypress', (e) => {
  const tecla = e.key;
  if (tecla === 'Enter') {
    startGame();
  }
});
