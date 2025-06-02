(function() {  // --- Parameters & Device Detection ---
  const params      = new URLSearchParams(location.search);
  const competition = (params.get('competition') || 'Low').toLowerCase();
  const valence     = params.get('valence')   || 'Positive';
  const round       = parseInt(params.get('round')) || 1;
  const mode        = params.get('mode') || 'vs'; // 'vs' or 'solo'
  const isMobile    = /Mobi|Android|iPhone|iPad|iPod/.test(navigator.userAgent);

  // --- Solo Mode Setup ---
  if (mode === 'solo') {
    document.body.classList.add('solo-mode');
    document.getElementById('loadingText').textContent = 'Loading Tetris...';
  }
  // --- CPU Name & Pill Color ---
  const names   = ['Ash', 'Jordan', 'Riley', 'Taylor'];
  const cpuName = names[Math.floor(Math.random() * names.length)];
  const cpuPill = document.getElementById('cpuPill');
  
  if (mode === 'vs') {
    cpuPill.innerHTML = `${cpuName}: <b><span id='cpuScorePill'>0</span> pts</b>`;
    if (competition === 'low') {
      cpuPill.className = 'pill purple';
      document.getElementById('cpuCanvas').style.borderColor = 'purple';
    }
  }
  // --- Responsive Canvas Sizing ---
  if (mode === 'vs') {
    if (isMobile && competition === 'high') {
      document.getElementById('playerCanvas').style.maxWidth = '90vw';
      document.getElementById('cpuCanvas'   ).style.maxWidth = '60vw';
    }
    if (isMobile && competition === 'low') {
      document.getElementById('cpuCanvas').style.display = 'none';
    }
  }
  // --- Loading Sequence ---
  const loadingBarFg   = document.getElementById('loadingBarFg');
  const loadingOverlay = document.getElementById('loadingOverlay');
  const loadingText    = document.getElementById('loadingText');

  // Animate bar to full over 4 seconds
  requestAnimationFrame(() => loadingBarFg.style.width = '100%');

  // After 4s, show "Opponent Found" for 1s, then hide overlay and start countdown
  setTimeout(() => {
    if (mode === 'solo') {
      loadingText.textContent = 'Ready to Play!';
    } else {
      loadingText.textContent = 'Opponent Found';
    }
    setTimeout(() => {
      loadingOverlay.style.display = 'none';
      startCountdown();
    }, 1000);
  }, 4000);

  // --- Countdown for Game Start ---
  const countdownOverlay = document.getElementById('countdownOverlay');
  function startCountdown() {
    let count = 3;
    countdownOverlay.style.visibility = 'visible';
    countdownOverlay.textContent = count;
    const timer = setInterval(() => {
      count--;
      if (count > 0) {
        countdownOverlay.textContent = count;
      } else {
        clearInterval(timer);
        countdownOverlay.style.visibility = 'hidden';
        lastTime = performance.now();
        requestAnimationFrame(gameLoop);
      }
    }, 1000);
  }

  // --- Tetris Logic (Shapes, Colors, Heuristics, Board Class) ---
  const SHAPES = {
    I: [ [[1,1,1,1]], [[1],[1],[1],[1]] ],
    O: [ [[1,1],[1,1]] ],
    T: [ [[0,1,0],[1,1,1]], [[1,0],[1,1],[1,0]], [[1,1,1],[0,1,0]], [[0,1],[1,1],[0,1]] ],
    S: [ [[0,1,1],[1,1,0]], [[1,0],[1,1],[0,1]] ],
    Z: [ [[1,1,0],[0,1,1]], [[0,1],[1,1],[1,0]] ],
    J: [ [[1,0,0],[1,1,1]], [[1,1],[1,0],[1,0]], [[1,1,1],[0,0,1]], [[0,1],[0,1],[1,1]] ],
    L: [ [[0,0,1],[1,1,1]], [[1,0],[1,0],[1,1]], [[1,1,1],[1,0,0]], [[1,1],[0,1],[0,1]] ]
  };
  const COLORS = { O:'blue', I:'purple', T:'orange', S:'pink', Z:'yellow', L:'red', J:'green', G:'gray' };

  function aggregateHeight(grid) {
    let h=0;
    for (let c=0; c<10; c++) {
      for (let r=0; r<20; r++) {
        if (grid[r][c]) { h += 20-r; break; }
      }
    }
    return h;
  }
  function countHoles(grid) {
    let holes=0;
    for (let c=0; c<10; c++) {
      let seen=false;
      for (let r=0; r<20; r++) {
        if (grid[r][c]) seen=true;
        else if (seen) holes++;
      }
    }
    return holes;
  }
  function bumpiness(grid) {
    const heights=[];
    for (let c=0; c<10; c++) {
      let h=0;
      for (let r=0; r<20; r++) if (grid[r][c]) { h=20-r; break; }
      heights.push(h);
    }
    let b=0;
    for (let i=0; i<9; i++) b += Math.abs(heights[i]-heights[i+1]);
    return b;
  }

  class TetrisBoard {
    constructor(id, mode) {
      this.ctx = document.getElementById(id).getContext('2d');
      this.mode = mode;
      this.grid = Array.from({length:20}, ()=>Array(10).fill(0));
      this.score = 0;
      this.garbage = 0;
      this.hold = null;
      this.canHold = true;
      this.prevShape = null;
      this.gameOver = false;
      this.cpuTimer = 0;
      this.ready = (mode==='human');
      this.readyTimer = 0;
      this.readyDelay = mode==='cpu'
        ? (competition==='high'
           ? Math.random()*100 + 100
           : Math.random()*500 + 500)
        : 0;
      this.spawn();
      this.dropInterval = mode==='cpu'
        ? (competition==='high' ? 200 : 1000)
        : 500;
      this.acc = 0;
    }    spawn() {
      const keys = Object.keys(SHAPES);
      let p;
      do { p = keys[Math.floor(Math.random()*keys.length)]; }
      while (p===this.prevShape);
      this.prevShape = p;
      this.shape = SHAPES[p];
      this.rot = 0;
      this.mat = this.shape[0];
      this.x = Math.floor((10 - this.mat[0].length)/2);
      this.y = 0;
      this.canHold = true;
      if (!this.valid(this.mat, this.x, this.y)) this.gameOver = true;
      if (this.mode==='cpu') this.planCPU();
    }
    valid(mat,x,y) {
      for (let r=0; r<mat.length; r++) for (let c=0; c<mat[r].length; c++) {
        if (!mat[r][c]) continue;
        const X = x+c, Y = y+r;
        if (X<0||X>=10||Y<0||Y>=20||this.grid[Y][X]) return false;
      }
      return true;
    }
    clearLines() {
      const before = this.grid.length;
      this.grid = this.grid.filter(row => row.some(v=>v===0));
      const L = 20 - this.grid.length;
      while (this.grid.length<20) this.grid.unshift(Array(10).fill(0));
      return L;
    }
    lock() {
      for (let r=0; r<this.mat.length; r++) for (let c=0; c<this.mat[r].length; c++) {
        if (this.mat[r][c]) this.grid[this.y+r][this.x+c] = this.prevShape;
      }
      const L = this.clearLines();
      if (L) {
        this.score += L*100;
        if (competition==='high') this.garbage += L;
        if (competition==='high' && L>=4) triggerTetrisAlert();
      }
      this.spawn();
    }
    move(dx,dy) {
      if (this.valid(this.mat, this.x+dx, this.y+dy)) {
        this.x += dx;
        this.y += dy;
        return true;
      }
      return false;
    }
    rotate() {
      const nr = (this.rot+1) % this.shape.length;
      const nm = this.shape[nr];
      if (this.valid(nm, this.x, this.y)) {
        this.rot = nr;
        this.mat = nm;
      }
    }    hardDrop() {
      while (this.move(0,1));
      this.lock();
    }
    hold() {
      if (!this.canHold) return;
      
      if (this.hold === null) {
        // First hold - just store current piece and spawn new one
        this.hold = this.prevShape;
        this.spawn();
      } else {
        // Swap current piece with held piece
        const tempShape = this.hold;
        this.hold = this.prevShape;
        
        // Set up the swapped piece
        this.prevShape = tempShape;
        this.shape = SHAPES[tempShape];
        this.rot = 0;
        this.mat = this.shape[0];
        this.x = Math.floor((10 - this.mat[0].length)/2);
        this.y = 0;
        
        // Check if the swapped piece can be placed
        if (!this.valid(this.mat, this.x, this.y)) {
          this.gameOver = true;
        }
        
        if (this.mode === 'cpu') this.planCPU();
      }
      
      this.canHold = false;
    }
    planCPU() {
      let best=Infinity, plan={};
      for (let r=0; r<this.shape.length; r++) {
        const mat = this.shape[r];
        const w = mat[0].length;
        for (let x=0; x<=10-w; x++) {
          let y=0;
          while (this.valid(mat,x,y)) y++;
          y--;
          if (y<0) continue;
          const g = this.grid.map(row=>row.slice());
          for (let rr=0; rr<mat.length; rr++) for (let cc=0; cc<mat[rr].length; cc++) {
            if (mat[rr][cc]) g[y+rr][x+cc] = 1;
          }
          const lines = 20 - g.filter(rw=>rw.every(v=>v!==0)).length;
          const score = aggregateHeight(g)
                      + countHoles(g)*1.5
                      + bumpiness(g)*0.5
                      - lines*10;
          if (score < best) {
            best = score;
            plan = {rot:r, x, y};
          }
        }
      }
      this.cpuPlan = plan;
    }
    receiveGarbage(rows) {
      for (let i=0; i<rows; i++) {
        this.grid.shift();
        this.grid.push(Array(10).fill('G'));
      }
    }
    update(dt) {
      if (this.mode==='cpu' && !this.ready) {
        this.readyTimer += dt;
        if (this.readyTimer >= this.readyDelay) this.ready = true;
        else return;
      }
      if (this.gameOver) return;
      this.acc += dt;
      if (this.acc > this.dropInterval) {
        this.acc = 0;
        if (!this.move(0,1)) this.lock();
      }
      if (this.mode==='cpu' && this.cpuPlan) {
        this.cpuTimer += dt;
        const interval = competition==='high'?200:800;
        if (this.cpuTimer > interval) {
          if (this.rot !== this.cpuPlan.rot) this.rotate();
          else if (this.x < this.cpuPlan.x) this.move(1,0);
          else if (this.x > this.cpuPlan.x) this.move(-1,0);
          else {
            if (competition==='high') this.hardDrop();
            this.cpuTimer = 0;
          }
        }
      }
    }
    draw() {
      const ctx = this.ctx;
      ctx.clearRect(0,0,300,600);
      for (let r=0; r<20; r++) for (let c=0; c<10; c++) {
        if (this.grid[r][c]) {
          ctx.fillStyle = COLORS[this.grid[r][c]];
          ctx.fillRect(c*30, r*30, 30,30);
        }
        ctx.strokeStyle='#333';
        ctx.strokeRect(c*30, r*30, 30,30);
      }
      if (!this.gameOver) {
        ctx.fillStyle = COLORS[this.prevShape];
        for (let r=0; r<this.mat.length; r++) for (let c=0; c<this.mat[r].length; c++) {
          if (this.mat[r][c]) {
            ctx.fillRect((this.x+c)*30, (this.y+r)*30, 30,30);
            ctx.strokeRect((this.x+c)*30, (this.y+r)*30, 30,30);
          }
        }
      }
      this.drawHold();
    }
    drawHold() {
      const hc = document.getElementById('holdCanvas');
      const ctx = hc.getContext('2d');
      ctx.clearRect(0,0,64,64);
      if (!this.hold) return;
      const mat = SHAPES[this.hold][0];
      const sz = 64 / mat.length;
      ctx.fillStyle = COLORS[this.hold];
      for (let r=0; r<mat.length; r++) for (let c=0; c<mat[r].length; c++) {
        if (mat[r][c]) {
          ctx.fillRect(c*sz, r*sz, sz,sz);
          ctx.strokeRect(c*sz, r*sz, sz,sz);
        }
      }
    }
  }  // --- Initialize Boards & Start Loop ---
  window.player = new TetrisBoard('playerCanvas', 'human');
  if (mode === 'vs') {
    window.cpu = new TetrisBoard('cpuCanvas', 'cpu');
  }
  
  // Initialize scores to 0
  updateScores(0, 0);
  
  let lastTime = performance.now();
  function gameLoop(timestamp) {
    const dt = timestamp - lastTime;
    lastTime = timestamp;
    player.update(dt);
    if (mode === 'vs' && window.cpu) {
      cpu.update(dt);
    }

    if (mode === 'vs' && competition === 'high' && window.cpu) {
      // Send all garbage rows
      while (player.garbage > 0) { cpu.receiveGarbage(1); player.garbage--; }
      while (cpu.garbage > 0)    { player.receiveGarbage(1); cpu.garbage--; }
    }

    player.draw();
    if (mode === 'vs' && window.cpu) {
      cpu.draw();
      updateScores(player.score, cpu.score);
    } else {
      updateScores(player.score, 0);
    }

    if (mode === 'solo') {
      if (!player.gameOver) {
        requestAnimationFrame(gameLoop);
      } else {
        showSoloGameOver();
      }
    } else {
      if (!player.gameOver && !cpu.gameOver) {
        requestAnimationFrame(gameLoop);
      } else {
        showChat();
      }
    }
  }

  // --- Input Handling & Utilities ---  // Update score pills and show lead text
  function updateScores(p, c) {
    document.getElementById('playerScorePill').textContent = p;
    if (mode === 'vs') {
      document.getElementById('cpuScorePill').textContent = c;
    }
    // Update vertical score bars if present
    const playerBarLabel = document.getElementById('scoreBarPlayerLabel');
    const cpuBarLabel = document.getElementById('scoreBarCpuLabel');
    const cpuNameLabel = document.querySelector('.score-name-cpu');
    if (playerBarLabel) playerBarLabel.textContent = p;
    if (cpuBarLabel && mode === 'vs') cpuBarLabel.textContent = c;
    if (cpuNameLabel && mode === 'vs') cpuNameLabel.textContent = cpuName;
    // Animate bar fill heights
    const playerInner = document.getElementById('scoreBarPlayerInner');
    const cpuInner = document.getElementById('scoreBarCpuInner');
    let maxScore = Math.max(1000, p, c);
    if (maxScore === 0) maxScore = 1;
    const playerPct = p / maxScore;
    const cpuPct = c / maxScore;
    if (playerInner) playerInner.style.height = (playerPct * 100) + '%';
    if (cpuInner && mode === 'vs') cpuInner.style.height = (cpuPct * 100) + '%';
    const lead = document.getElementById('leadText');
    if (mode === 'vs' && competition === 'high') {
      if (p > c && updateScores.last !== 'p') {
        lead.textContent = 'PLAYER TAKES THE LEAD!!';
        lead.style.display = 'block';
        setTimeout(() => lead.style.display = 'none', 3000);
        updateScores.last = 'p';
      }
      if (c > p && updateScores.last !== 'c') {
        lead.textContent = cpuName + ' TAKES THE LEAD!!';
        lead.style.display = 'block';
        setTimeout(() => lead.style.display = 'none', 3000);
        updateScores.last = 'c';
      }
    }
  }
  updateScores.last = null;
  // Flash a TETRIS alert
  function triggerTetrisAlert() {
    const overlay = document.getElementById('tetrisOverlay');
    overlay.style.display = 'block';
    setTimeout(() => overlay.style.display = 'none', 1500);
  }

  // Show solo game over screen
  function showSoloGameOver() {
    const box = document.createElement('div');
    Object.assign(box.style, {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: 'linear-gradient(135deg, #1e1e2f, #2e2e5e)',
      padding: '30px',
      borderRadius: '16px',
      zIndex: '999',
      fontFamily: 'Arial, sans-serif',
      color: '#fff',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      minWidth: '320px',
      textAlign: 'center',
      border: '2px solid #3a3a5e'
    });

    const title = document.createElement('h2');
    title.textContent = 'Game Over!';
    title.style.margin = '0 0 16px 0';
    title.style.fontSize = '2rem';
    title.style.color = '#ff6b6b';
    title.style.textShadow = '0 2px 4px rgba(0,0,0,0.5)';

    const score = document.createElement('div');
    score.textContent = `Final Score: ${player.score}`;
    score.style.fontSize = '1.4rem';
    score.style.margin = '0 0 20px 0';
    score.style.fontWeight = 'bold';
    score.style.color = '#4ecdc4';

    const playAgain = document.createElement('button');
    playAgain.textContent = 'Play Again';
    Object.assign(playAgain.style, {
      backgroundColor: '#4ecdc4',
      color: '#1e1e2f',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '8px',
      fontSize: '1.1rem',
      fontWeight: 'bold',
      cursor: 'pointer',
      boxShadow: '0 4px 12px rgba(78,205,196,0.3)',
      transition: 'all 0.2s ease'
    });

    playAgain.addEventListener('click', () => {
      location.reload();
    });

    playAgain.addEventListener('mouseover', () => {
      playAgain.style.backgroundColor = '#45b7b8';
      playAgain.style.transform = 'translateY(-2px)';
    });

    playAgain.addEventListener('mouseout', () => {
      playAgain.style.backgroundColor = '#4ecdc4';
      playAgain.style.transform = 'translateY(0)';
    });

    box.appendChild(title);
    box.appendChild(score);
    box.appendChild(playAgain);
    document.body.appendChild(box);
  }

  // Show chat box and post response
 function showChat() {
  const box = document.createElement('div');
  Object.assign(box.style, {
    position: 'absolute',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    transformOrigin: 'center',
    background: 'linear-gradient(135deg, #1e1e2f, #2e2e5e)',
    padding: '20px',
    borderRadius: '12px',
    zIndex: '999',
    fontFamily: 'Arial, sans-serif',
    color: '#fff',
    boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
    minWidth: '280px',
    textAlign: 'center'
  });

  const msg = document.createElement('div');
  let text = 'That was something.';
  if (valence === 'Positive') text = 'Thanks for playing. That was great.';
  if (valence === 'Negative') text = 'Lol. I beat you. You lost.';
  msg.textContent = cpuName + ': ' + text;
  msg.style.marginBottom = '12px';
  msg.style.fontSize = '16px';
  msg.style.lineHeight = '1.4';
  msg.style.fontWeight = '500';

  const inp = document.createElement('input');
  inp.type = 'text';
  inp.placeholder = 'Your response…';
    Object.assign(inp.style, {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid #555',
    fontSize: '14px',
    fontFamily: 'inherit',
    backgroundColor: '#f0f0f0',
    color: '#000',
    outline: 'none',
    transition: 'border 0.2s ease, box-shadow 0.2s ease',
    boxSizing: 'border-box'
    });


  inp.addEventListener('focus', () => {
    inp.style.border = '1px solid #3399ff';
  });

  inp.addEventListener('blur', () => {
    inp.style.border = '1px solid #555';
  });

  box.appendChild(msg);
  box.appendChild(inp);
  document.body.appendChild(box);
  inp.focus();

  inp.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && this.value.trim()) {
      window.parent.postMessage({
        type: 'chatResponse',
        round: round,
        valence: valence,
        text: this.value.trim()
      }, '*');
      this.disabled = true;
      this.style.opacity = '0.5';
    }
  });
}


  // Desktop keyboard controls
  document.addEventListener('keydown', e => {
    if (player.gameOver) return;
    switch (e.key) {
      case 'a': case 'ArrowLeft':  player.move(-1,0); break;
      case 'd': case 'ArrowRight': player.move(1,0);  break;
      case 's': case 'ArrowDown':  player.move(0,1);  break;
      case ' ':                   player.hardDrop();  break;
      case 'c':                   player.hold();     break;
    }
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') player.rotate();
  });

  // Mouse/touch drag & tap on player canvas
  let dragStartX = null;
  const pc = document.getElementById('playerCanvas');
  pc.addEventListener('pointerdown', e => {
    if (player.gameOver) return;
    dragStartX = e.clientX;
    pc.setPointerCapture(e.pointerId);
  });
  pc.addEventListener('pointermove', e => {
    if (dragStartX === null) return;
    const dx = e.clientX - dragStartX;
    const cell = pc.clientWidth / 10;
    if (dx > cell)  { player.move(1,0);  dragStartX = e.clientX; }
    if (dx < -cell) { player.move(-1,0); dragStartX = e.clientX; }
  });
  pc.addEventListener('pointerup', e => {
    if (dragStartX !== null) {
      if (Math.abs(e.clientX - dragStartX) < 5) player.rotate();
      dragStartX = null;
    }
  });

  // Mobile control buttons
  document.querySelectorAll('#mobileControls button').forEach(btn => {
    btn.addEventListener('click', () => {
      const cmd = btn.dataset.cmd;
      switch (cmd) {
        case 'moveLeft':   player.move(-1,0); break;
        case 'moveDown':   player.move(0,1);  break;
        case 'moveRight':  player.move(1,0);  break;
        case 'rotate':     player.rotate();   break;
        case 'hardDrop':   player.hardDrop(); break;
        case 'hold':       player.hold();     break;
      }
    });
  });

  // --- Make Desktop Controls Functional ---
document.getElementById('holdButton').onclick = () => { if (!window.player?.gameOver) window.player.hold(); };
document.getElementById('moveLeft').onclick  = () => { if (!window.player?.gameOver) window.player.move(-1,0); };
document.getElementById('moveDown').onclick  = () => { if (!window.player?.gameOver) window.player.move(0,1); };
document.getElementById('moveRight').onclick = () => { if (!window.player?.gameOver) window.player.move(1,0); };
document.getElementById('rotateButton').onclick = () => { if (!window.player?.gameOver) window.player.rotate(); };
document.getElementById('dropButton').onclick   = () => { if (!window.player?.gameOver) window.player.hardDrop(); };
})();