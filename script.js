const mario = document.querySelector('.mario');
const pipe = document.querySelector('.pipe');
let playerName = '';
let startTime = 0;
let endTime = 0;
let bestTime = Infinity;
let timerInterval;

const start = document.querySelector('.start');
const gameOver = document.querySelector('.game-over');
const playerNameInput = document.getElementById('playerName');
const timerElement = document.getElementById('time');

const audioStart = new Audio('songs/audio_theme.mp3');
const audioGameOver = new Audio('songs/audio_gameover.mp3');

function carregarRanking() {
  try {
    const rankingData = localStorage.getItem('ranking');
    return JSON.parse(rankingData) || [];
  } catch (error) {
    console.error('Erro ao carregar o ranking:', error);
    return [];
  }
}

function salvarRanking(ranking) {
  try {
    localStorage.setItem('ranking', JSON.stringify(ranking));
    console.log('Ranking salvo com sucesso.');
  } catch (error) {
    console.error('Erro ao salvar o ranking:', error);
  }
}

function atualizarTabelaRanking() {
  const rankTableBody = document.getElementById('rankTableBody');
  rankTableBody.innerHTML = '';

  // Solicitar os dados YAML do GitHub
  fetch('https://raw.githubusercontent.com/JulianoCiawax/Mario_Jump/main/data.yml')
    .then(response => response.text())
    .then(data => {
      // Analisar os dados YAML
      const rankingData = jsyaml.load(data);

      // Ordenar o rankingData com base no tempo (menor tempo primeiro)
      rankingData.ranking.sort((a, b) => a.score - b.score);

      rankingData.ranking.forEach((player, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${index + 1}</td>
          <td>${player.name}</td>
          <td>${player.score}</td>
        `;
        rankTableBody.appendChild(row);
      });
    })
    .catch(error => {
      console.error('Erro ao carregar os dados YAML:', error);
    });
}

function updateRanking() {
  const rankingData = carregarRanking();

  rankingData.push({ name: playerName, score: bestTime });

  // Ordenar o rankingData com base no tempo (menor tempo primeiro)
  rankingData.sort((a, b) => a.score - b.score);

  if (rankingData.length > 10) {
    rankingData.pop();
  }

  salvarRanking(rankingData);
  atualizarTabelaRanking();
}

function submitName() {
  playerName = playerNameInput.value.trim();
  if (playerName === '') {
    alert('Por favor, insira um nome válido.');
    return;
  }
  playerNameInput.disabled = true;
  playerNameInput.style.display = 'none';
  document.querySelector('.user-input button').style.display = 'none';

  startGame();
}

function updateTimer() {
  const currentTime = (Date.now() - startTime) / 1000;
  timerElement.textContent = currentTime.toFixed(2);
}

function startGame() {
  if (!playerName || playerName.trim() === '') {
    alert('Por favor, insira um nome antes de iniciar o jogo.');
    return;
  }
  const instruction = document.querySelector('.instructions');
  instruction.style.display = 'none';

  pipe.classList.add('pipe-animation');

  start.style.display = 'none';

  startTime = Date.now();

  timerInterval = setInterval(updateTimer, 10);

  audioStart.play();
}

function restartGame() {
  location.reload();
}

function jump() {
  mario.classList.add('jump');

  setTimeout(() => {
    mario.classList.remove('jump');
  }, 800);
}

function loop() {
  setInterval(() => {
    const pipePosition = pipe.offsetLeft;
    const marioPosition = window
      .getComputedStyle(mario)
      .bottom.replace('px', ' ');

    if (pipePosition <= 120 && pipePosition > 0 && marioPosition < 80) {
      pipe.classList.remove('pipe-animation');
      pipe.style.left = `${pipePosition}px`;

      mario.classList.remove('jump');
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

      endTime = Date.now();
      const currentTime = endTime - startTime;

      if (currentTime < bestTime) {
        bestTime = currentTime;
        updateRanking();
      }

      clearInterval(timerInterval);
    }
  }, 10);
}

atualizarTabelaRanking(); // Chama a função para carregar e exibir o ranking ao carregar a página
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
