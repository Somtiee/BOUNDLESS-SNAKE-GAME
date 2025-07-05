const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let box = 20;
let snake = [{ x: 9 * box, y: 10 * box }];
let direction = "RIGHT";
let score = 0;
let isGameOver = false;

// 🍓 Fruit
let strawberry = {
  x: Math.floor(Math.random() * 19 + 1) * box,
  y: Math.floor(Math.random() * 19 + 1) * box,
};

// 🔊 Sound effects
const eatSound = document.getElementById("eatSound");
const crashSound = document.getElementById("crashSound");

// 🧠 Highscore tracking
let currentDifficulty = document.getElementById("difficulty").value;
let highScores = JSON.parse(localStorage.getItem("snakeHighScores")) || {
  easy: 0,
  medium: 0,
  hard: 0,
};

// Set initial highscore and label
document.getElementById("highscore").textContent = highScores[currentDifficulty];
document.getElementById("current-diff").textContent = capitalize(currentDifficulty);

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// 🎮 Keyboard control
document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
  if (event.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
  if (event.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
  if (event.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
});

// 📱 Touch control
let touchStartX = null;
let touchStartY = null;

canvas.addEventListener("touchstart", (e) => {
  const touch = e.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
});

canvas.addEventListener("touchend", (e) => {
  const touch = e.changedTouches[0];
  const dx = touch.clientX - touchStartX;
  const dy = touch.clientY - touchStartY;

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 0 && direction !== "LEFT") direction = "RIGHT";
    else if (dx < 0 && direction !== "RIGHT") direction = "LEFT";
  } else {
    if (dy > 0 && direction !== "UP") direction = "DOWN";
    else if (dy < 0 && direction !== "DOWN") direction = "UP";
  }
});

// 🕹️ Game loop
function draw() {
  if (isGameOver) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < snake.length; i++) {
    ctx.fillStyle = i === 0 ? "green" : "lightgreen";
    ctx.fillRect(snake[i].x, snake[i].y, box, box);
  }

  ctx.fillStyle = "red";
  ctx.fillRect(strawberry.x, strawberry.y, box, box);

  let headX = snake[0].x;
  let headY = snake[0].y;

  if (direction === "LEFT") headX -= box;
  if (direction === "UP") headY -= box;
  if (direction === "RIGHT") headX += box;
  if (direction === "DOWN") headY += box;

  // 🍓 Eat
  if (headX === strawberry.x && headY === strawberry.y) {
    eatSound.play();
    score++;
    strawberry = {
      x: Math.floor(Math.random() * 19 + 1) * box,
      y: Math.floor(Math.random() * 19 + 1) * box,
    };
  } else {
    snake.pop();
  }

  let newHead = { x: headX, y: headY };

  // 💥 Collision
  if (
    headX < 0 || headX >= canvas.width ||
    headY < 0 || headY >= canvas.height ||
    snake.some(seg => seg.x === headX && seg.y === headY)
  ) {
    gameOver();
    return;
  }

  snake.unshift(newHead);
}

// ⏱️ Speed by difficulty
function getSpeed() {
  const diff = document.getElementById("difficulty").value;
  if (diff === "easy") return 200;
  if (diff === "medium") return 120;
  return 70; // hard
}

// 🎮 Start game
let game = setInterval(draw, getSpeed());

document.getElementById("difficulty").addEventListener("change", () => {
  currentDifficulty = document.getElementById("difficulty").value;
  document.getElementById("current-diff").textContent = capitalize(currentDifficulty);
  document.getElementById("highscore").textContent = highScores[currentDifficulty];

  clearInterval(game);
  game = setInterval(draw, getSpeed());

  // Reset game
  snake = [{ x: 9 * box, y: 10 * box }];
  direction = "RIGHT";
  score = 0;
  isGameOver = false;
  strawberry = {
    x: Math.floor(Math.random() * 19 + 1) * box,
    y: Math.floor(Math.random() * 19 + 1) * box,
  };
  document.getElementById("gameover-text").textContent = "";
  document.getElementById("restartBtn").style.display = "none";
});

// 🔁 Restart button
document.getElementById("restartBtn").addEventListener("click", () => {
  snake = [{ x: 9 * box, y: 10 * box }];
  direction = "RIGHT";
  score = 0;
  isGameOver = false;
  strawberry = {
    x: Math.floor(Math.random() * 19 + 1) * box,
    y: Math.floor(Math.random() * 19 + 1) * box,
  };
  document.getElementById("gameover-text").textContent = "";
  document.getElementById("restartBtn").style.display = "none";

  clearInterval(game);
  game = setInterval(draw, getSpeed());
});

// 💥 Game Over + Highscore check
function gameOver() {
  crashSound.play();
  clearInterval(game);
  isGameOver = true;

  if (score > highScores[currentDifficulty]) {
    highScores[currentDifficulty] = score;
    localStorage.setItem("snakeHighScores", JSON.stringify(highScores));
    document.getElementById("highscore").textContent = score;
  }

  document.getElementById("gameover-text").textContent =
    "💥 BERRYCRASHED! Your Score: " + score;
  document.getElementById("restartBtn").style.display = "inline-block";
}
