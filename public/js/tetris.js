(function () {
  var COLS = 10, ROWS = 20, BLOCK = 30;
  var PIECES = [
    { shape: [[1,1,1,1]], color: '#45d6e6' },
    { shape: [[1,1],[1,1]], color: '#f7e476' },
    { shape: [[0,1,0],[1,1,1]], color: '#b484e0' },
    { shape: [[0,1,1],[1,1,0]], color: '#57F287' },
    { shape: [[1,1,0],[0,1,1]], color: '#ef4444' },
    { shape: [[1,0,0],[1,1,1]], color: '#8b5cf6' },
    { shape: [[0,0,1],[1,1,1]], color: '#f59e0b' }
  ];
  var COLORS = {
    board: 'rgba(139,92,246,0.04)',
    grid: 'rgba(139,92,246,0.04)',
    ghost: 'rgba(139,92,246,0.15)',
    border: 'rgba(139,92,246,0.06)'
  };

  var canvas, ctx, nextCanvas, nextCtx;
  var board = [];
  var current, next, pos, score, lines, level;
  var gameLoop, dropInterval, gameState;
  var overlay, overlayTitle, overlaySub, startBtn;
  var currentUser = null;

  function initBoard() {
    board = [];
    for (var r = 0; r < ROWS; r++) {
      board[r] = [];
      for (var c = 0; c < COLS; c++) {
        board[r][c] = 0;
      }
    }
  }

  function randomPiece() {
    return JSON.parse(JSON.stringify(PIECES[Math.floor(Math.random() * PIECES.length)]));
  }

  function rotateMatrix(m) {
    var rows = m.length, cols = m[0].length;
    var result = [];
    for (var c = 0; c < cols; c++) {
      result[c] = [];
      for (var r = rows - 1; r >= 0; r--) {
        result[c].push(m[r][c]);
      }
    }
    return result;
  }

  function isValid(shape, row, col) {
    for (var r = 0; r < shape.length; r++) {
      for (var c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          var newR = row + r, newC = col + c;
          if (newC < 0 || newC >= COLS || newR >= ROWS || newR < 0) return false;
          if (newR >= 0 && board[newR][newC]) return false;
        }
      }
    }
    return true;
  }

  function lockPiece() {
    for (var r = 0; r < current.shape.length; r++) {
      for (var c = 0; c < current.shape[r].length; c++) {
        if (current.shape[r][c]) {
          var boardR = pos.row + r, boardC = pos.col + c;
          if (boardR >= 0 && boardR < ROWS && boardC >= 0 && boardC < COLS) {
            board[boardR][boardC] = current.color;
          }
        }
      }
    }
    clearLines();
    spawnPiece();
  }

  function clearLines() {
    var cleared = 0;
    for (var r = ROWS - 1; r >= 0; r--) {
      var full = true;
      for (var c = 0; c < COLS; c++) {
        if (!board[r][c]) { full = false; break; }
      }
      if (full) {
        board.splice(r, 1);
        board.unshift(new Array(COLS).fill(0));
        cleared++;
        r++;
      }
    }
    if (cleared > 0) {
      var pts = [0, 100, 300, 500, 800];
      score += (pts[cleared] || 0) * level;
      lines += cleared;
      level = Math.floor(lines / 10) + 1;
      dropInterval = Math.max(80, 500 - (level - 1) * 30);
      updateUI();
    }
  }

  function spawnPiece() {
    next = next || randomPiece();
    current = next;
    current.shape = JSON.parse(JSON.stringify(next.shape));
    next = randomPiece();
    pos = { row: -1, col: Math.floor((COLS - current.shape[0].length) / 2) };
    if (!isValid(current.shape, 0, pos.col)) {
      pos.row = 0;
      if (!isValid(current.shape, pos.row, pos.col)) {
        gameOver();
        return;
      }
    }
    pos.row = -1;
    drawNext();
    render();
  }

  function getGhostRow() {
    var ghost = pos.row;
    while (isValid(current.shape, ghost + 1, pos.col)) ghost++;
    return ghost;
  }

  function moveLeft() { if (current && isValid(current.shape, pos.row, pos.col - 1)) { pos.col--; render(); } }
  function moveRight() { if (current && isValid(current.shape, pos.row, pos.col + 1)) { pos.col++; render(); } }
  function moveDown() {
    if (!current) return;
    if (isValid(current.shape, pos.row + 1, pos.col)) {
      pos.row++;
      render();
      return true;
    }
    lockPiece();
    render();
    return false;
  }

  function rotatePiece() {
    if (!current) return;
    var rotated = rotateMatrix(current.shape);
    if (isValid(rotated, pos.row, pos.col)) {
      current.shape = rotated;
    } else {
      var kicks = [-1, 1, -2, 2];
      for (var i = 0; i < kicks.length; i++) {
        if (isValid(rotated, pos.row, pos.col + kicks[i])) {
          current.shape = rotated;
          pos.col += kicks[i];
          break;
        }
      }
    }
    render();
  }

  function hardDrop() {
    if (!current) return;
    while (isValid(current.shape, pos.row + 1, pos.col)) pos.row++;
    lockPiece();
    render();
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (var r = 0; r < ROWS; r++) {
      for (var c = 0; c < COLS; c++) {
        var x = c * BLOCK, y = r * BLOCK, color = board[r][c];
        if (color) {
          drawBlock(ctx, x, y, color);
        } else {
          ctx.fillStyle = COLORS.board;
          ctx.fillRect(x, y, BLOCK, BLOCK);
          ctx.strokeStyle = COLORS.grid;
          ctx.lineWidth = 0.5;
          ctx.strokeRect(x, y, BLOCK, BLOCK);
        }
      }
    }

    if (current) {
      var ghostRow = getGhostRow();
      for (var r = 0; r < current.shape.length; r++) {
        for (var c = 0; c < current.shape[r].length; c++) {
          if (current.shape[r][c]) {
            var gx = (pos.col + c) * BLOCK, gy = (ghostRow + r) * BLOCK;
            ctx.fillStyle = COLORS.ghost;
            ctx.fillRect(gx, gy, BLOCK, BLOCK);
          }
        }
      }

      for (var r = 0; r < current.shape.length; r++) {
        for (var c = 0; c < current.shape[r].length; c++) {
          if (current.shape[r][c]) {
            var cx = (pos.col + c) * BLOCK, cy = (pos.row + r) * BLOCK;
            drawBlock(ctx, cx, cy, current.color);
          }
        }
      }
    }
  }

  function drawBlock(context, x, y, color) {
    var inset = 1;
    context.fillStyle = color;
    context.shadowColor = color;
    context.shadowBlur = 6;
    context.fillRect(x + inset, y + inset, BLOCK - inset * 2, BLOCK - inset * 2);
    context.shadowBlur = 0;

    context.fillStyle = 'rgba(255,255,255,0.08)';
    context.fillRect(x + inset, y + inset, BLOCK - inset * 2, 3);
    context.fillRect(x + inset, y + inset, 3, BLOCK - inset * 2);
    context.fillStyle = 'rgba(0,0,0,0.15)';
    context.fillRect(x + BLOCK - inset - 3, y + inset, 3, BLOCK - inset * 2);
    context.fillRect(x + inset, y + BLOCK - inset - 3, BLOCK - inset * 2, 3);
  }

  function drawNext() {
    nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
    if (!next) return;
    var s = next.shape, size = 28;
    var cols = s[0].length, rows = s.length;
    var ox = (nextCanvas.width - cols * size) / 2;
    var oy = (nextCanvas.height - rows * size) / 2;
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        if (s[r][c]) {
          var x = ox + c * size, y = oy + r * size, inset = 1;
          nextCtx.fillStyle = next.color;
          nextCtx.shadowColor = next.color;
          nextCtx.shadowBlur = 6;
          nextCtx.fillRect(x + inset, y + inset, size - inset * 2, size - inset * 2);
          nextCtx.shadowBlur = 0;
          nextCtx.fillStyle = 'rgba(255,255,255,0.08)';
          nextCtx.fillRect(x + inset, y + inset, size - inset * 2, 2);
          nextCtx.fillRect(x + inset, y + inset, 2, size - inset * 2);
        }
      }
    }
  }

  function updateUI() {
    document.getElementById('tetrisScore').textContent = score;
    document.getElementById('tetrisLines').textContent = lines;
    document.getElementById('tetrisLevel').textContent = level;
  }

  function showOverlay(title, sub, btnText) {
    overlay.style.display = 'flex';
    overlayTitle.textContent = title;
    overlaySub.textContent = sub;
    startBtn.textContent = btnText;
  }

  function hideOverlay() {
    overlay.style.display = 'none';
  }

  function submitScore() {
    if (!currentUser || score === 0) return;
    try {
      var scoresRef = db.collection('tetris_scores');
      scoresRef.doc(currentUser.id).get().then(function (doc) {
        if (doc.exists && doc.data().score >= score) return;
        scoresRef.doc(currentUser.id).set({
          discordId: currentUser.id,
          username: currentUser.username,
          score: score,
          lines: lines,
          level: level,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }).then(function () {
          fetchLeaderboard();
        }).catch(function () {});
      }).catch(function () {});
    } catch (e) {}
  }

  function fetchLeaderboard() {
    var content = document.getElementById('tetrisLbContent');
    if (!content) return;
    content.innerHTML = '<div class="tetris-lb-loading">Загрузка...</div>';
    try {
      db.collection('tetris_scores')
        .orderBy('score', 'desc')
        .limit(10)
        .get()
        .then(function (snap) {
          if (snap.empty) {
            content.innerHTML = '<div class="tetris-lb-empty">Пока нет рекордов</div>';
            return;
          }
          var html = '<table class="tetris-lb-table"><tr><th>#</th><th>Игрок</th><th>Счёт</th></tr>';
          var i = 0;
          snap.forEach(function (doc) {
            i++;
            var d = doc.data();
            var cls = '';
            if (i <= 3) cls = ' top-' + i;
            if (currentUser && doc.id === currentUser.id) cls += ' current-user';
            html += '<tr class="' + cls.trim() + '">';
            html += '<td>' + i + '</td>';
            html += '<td><div class="tetris-lb-name" title="' + escapeHtml(d.username) + '">' + escapeHtml(d.username) + '</div></td>';
            html += '<td>' + d.score + '</td>';
            html += '</tr>';
          });
          html += '</table>';
          content.innerHTML = html;
        })
        .catch(function () {
          content.innerHTML = '<div class="tetris-lb-empty">Ошибка загрузки</div>';
        });
    } catch (e) {
      content.innerHTML = '<div class="tetris-lb-empty">Ошибка загрузки</div>';
    }
  }

  function escapeHtml(str) {
    return (str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function startGame() {
    if (gameState === 'playing') return;
    initBoard();
    score = 0; lines = 0; level = 1;
    dropInterval = 500;
    next = null;
    updateUI();
    spawnPiece();
    hideOverlay();
    gameState = 'playing';
    clearInterval(gameLoop);
    gameLoop = setInterval(function () {
      if (gameState === 'playing') moveDown();
    }, dropInterval);
  }

  function pauseGame() {
    if (gameState === 'playing') {
      gameState = 'paused';
      showOverlay('Пауза', 'Нажмите «Продолжить»', 'Продолжить');
    } else if (gameState === 'paused') {
      gameState = 'playing';
      hideOverlay();
    }
  }

  function gameOver() {
    gameState = 'gameover';
    current = null;
    clearInterval(gameLoop);
    showOverlay('Игра окончена', 'Счёт: ' + score, 'Играть снова');
    render();
    submitScore();
  }

  function restartGame() {
    gameState = 'idle';
    clearInterval(gameLoop);
    startGame();
  }

  function init() {
    canvas = document.getElementById('tetrisCanvas');
    ctx = canvas.getContext('2d');
    nextCanvas = document.getElementById('nextCanvas');
    nextCtx = nextCanvas.getContext('2d');
    overlay = document.getElementById('tetrisOverlay');
    overlayTitle = document.getElementById('tetrisOverlayTitle');
    overlaySub = document.getElementById('tetrisOverlaySub');
    startBtn = document.getElementById('tetrisStartBtn');

    if (!canvas || !nextCanvas) return;

    gameState = 'idle';
    initBoard();
    showOverlay('Тетрис', 'Нажмите «Старт»', 'Старт');

    fetch('/api/me').then(function (r) { return r.json(); }).then(function (data) {
      if (data.authenticated) {
        currentUser = { id: data.user.id, username: data.user.username };
      }
      fetchLeaderboard();
    }).catch(function () {
      fetchLeaderboard();
    });

    startBtn.addEventListener('click', function () {
      if (gameState === 'idle' || gameState === 'gameover') startGame();
      else if (gameState === 'paused') pauseGame();
    });

    document.getElementById('tetrisPauseBtn').addEventListener('click', pauseGame);
    document.getElementById('tetrisRestartBtn').addEventListener('click', restartGame);

    document.addEventListener('keydown', function (e) {
      // Only handle keys when tetris section is visible
      var tetrisPage = document.getElementById('page-tetris');
      if (!tetrisPage || !tetrisPage.classList.contains('active')) return;
      // Don't intercept when user is typing in an input/textarea
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;

      var isPause = e.code === 'KeyP';
      var isRestart = e.code === 'KeyR';

      if (gameState !== 'playing') {
        if (isPause && gameState === 'paused') { e.preventDefault(); pauseGame(); return; }
        if (isRestart) { e.preventDefault(); restartGame(); return; }
        if (e.key === 'Enter' || e.key === ' ') {
          if (gameState === 'idle' || gameState === 'gameover') { e.preventDefault(); startGame(); return; }
          if (gameState === 'paused') { e.preventDefault(); pauseGame(); return; }
        }
        return;
      }

      switch (e.key) {
        case 'ArrowLeft': e.preventDefault(); moveLeft(); break;
        case 'ArrowRight': e.preventDefault(); moveRight(); break;
        case 'ArrowDown': e.preventDefault(); moveDown(); break;
        case 'ArrowUp': e.preventDefault(); rotatePiece(); break;
        case ' ': e.preventDefault(); hardDrop(); break;
      }

      if (isPause) { e.preventDefault(); pauseGame(); }
      if (isRestart) { e.preventDefault(); restartGame(); }
    });

    document.querySelectorAll('[data-tetris]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (gameState !== 'playing') return;
        var action = btn.getAttribute('data-tetris');
        switch (action) {
          case 'left': moveLeft(); break;
          case 'right': moveRight(); break;
          case 'rotate': rotatePiece(); break;
          case 'hardDrop': hardDrop(); break;
        }
      });
    });

    render();
    drawNext();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
