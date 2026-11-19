/* ==================================================================
   6장 · 광복의 날  (ch6.js)

   마지막 장이에요. 싸우는 미션이 아니라 함께 기뻐하는 장면이에요.

   ★ 세 가지가 함께 일어나요
     1) 이야기가 한 줄씩 저절로 흘러가요 (가만히 보면 돼요)
     2) 스틱을 좌우로 흔들면 태극기가 펄럭이고, 밤하늘이 새벽으로 밝아져요
     3) ★ 만세 박자 : 북이 굴러와 고리에 닿는 순간 A(1번) 버튼을 누르면
        모두 「만세!」 하고 뛰어올라요. 정확할수록 새벽이 빨리 밝아지고,
        3번 연속 맞힐 때마다 사람들이 한 명씩 거리로 몰려나와요!
        (놓쳐도 벌칙은 없어요. 기뻐하는 장이니까요)

   하늘이 완전히 밝아지면 불꽃이 터지며 광복이 이루어지고 게임이 끝나요.

   조작 : A(1번) 버튼 = 만세!   스틱 좌우 = 태극기 흔들기
          마우스로 누르면 만세, 좌우로 움직이면 흔들기
   ================================================================== */

MISSIONS[6] = (function () {

  /* ----------------------------------------------------------------
     1. 광장에 모인 사람들
        누구인지와, 화면 어디에 설지 정해요.
     ---------------------------------------------------------------- */
  const CROWD = [
    { who: 'mate',    x: 12, size: 0.85 },
    { who: 'kimgu',   x: 28, size: 1.0  },
    { who: 'hero',    x: 45, size: 1.15 },   // 주인공은 가운데, 조금 크게
    { who: 'yu',      x: 62, size: 1.0  },
    { who: 'mate',    x: 78, size: 0.85 },
    { who: 'hero',    x: 91, size: 0.75 },
  ];

  /* 한 줄씩 흘러갈 이야기예요 (기획서에 적힌 그대로) */
  const STORY = [
    '1945년 8월 15일.',
    '일본의 지배에서 벗어나, 조선이 광복을 맞이했다.',
    '사람들은 거리로 나와 태극기를 흔들었다.',
    '주인공도 독립운동가들과 함께 자유를 되찾은 기쁨을 나누었다.',
    '대한 독립 만세!',
  ];

  /* 만세 박자에 맞춰 거리로 몰려나오는 사람들 (3번 연속 맞힐 때마다 한 명씩) */
  const JOINERS = [
    { who: 'army', x: 20, size: 0.7 },
    { who: 'mate', x: 70, size: 0.72 },
    { who: 'yu',   x: 36, size: 0.7 },
    { who: 'army', x: 85, size: 0.68 },
    { who: 'mate', x: 4,  size: 0.7 },
    { who: 'yu',   x: 54, size: 0.68 },
  ];

  const STORY_GAP = 2600;    // 이야기 한 줄이 머무는 시간 (밀리초)
  const SHAKE_ADD = 4;       // 한 번 흔들 때마다 밝아지는 정도
  const DAWN_FADE = 2;       // 아무것도 안 하면 1초에 이만큼씩 다시 어두워져요

  const BEAT     = 900;      // 북이 굴러오는 간격 (밀리초)
  const TRAVEL   = 1800;     // 북이 오른쪽 끝에서 고리까지 오는 시간
  const PERFECT  = 130;      // 이만큼 가까우면 「딱 좋아!」
  const GOOD     = 270;      // 이만큼 가까우면 「좋아!」
  const ADD_PERFECT = 8;     // 딱 좋아! 일 때 밝아지는 정도
  const ADD_GOOD    = 5;     // 좋아! 일 때 밝아지는 정도
  const BEAT_START  = 2200;  // 첫 북이 고리에 닿는 때 (이야기 첫 줄을 본 뒤)


  /* ----------------------------------------------------------------
     2. 이 미션이 기억해야 할 것들
     ---------------------------------------------------------------- */
  let dawn = 0;              // 하늘이 얼마나 밝아졌는지 (0 ~ 100)
  let lastSide = '';         // 마지막으로 흔든 방향 (좌 / 우)
  let storyIndex = 0;
  let storyTimer = 0;
  let running = false;
  let done = false;          // 광복이 이루어졌는지
  let lastTime = 0;
  let lastMouseX = null;
  let clock = 0;             // 이 장의 시계 (멈춤 중에는 안 흘러요)
  let nextBeat = 0;          // 다음 북이 고리에 닿을 시각
  let drums = [];            // 굴러오는 북들 { t: 닿는 시각, el, judged }
  let combo = 0;             // 연속으로 맞힌 수
  let joined = 0;            // 몰려나온 사람 수
  let onSuccess = null;
  let node = {};


  /* ----------------------------------------------------------------
     3. 태극기 흔들기
        ★ 왼쪽 → 오른쪽 → 왼쪽 ... 번갈아 흔들어야 세어져요.
          한쪽만 계속 누르고 있으면 안 돼요!
     ---------------------------------------------------------------- */
  function shake(side) {
    if (!running || done) return;
    if (side === lastSide) return;      // 같은 쪽을 또 흔들면 안 세요

    lastSide = side;
    dawn = MissionUtil.clamp(dawn + SHAKE_ADD, 0, 100);

    // 태극기가 펄럭여요
    node.scene.classList.remove('is-waving');
    void node.scene.offsetWidth;        // 애니메이션을 처음부터 다시 틀어요
    node.scene.classList.add('is-waving');

    if (window.Sound) Sound.pok();
    drawDawn();

    if (dawn >= 100) liberate();        // 하늘이 다 밝아졌어요!
  }


  /* ----------------------------------------------------------------
     3-2. 만세 박자
     ---------------------------------------------------------------- */

  /* 효과 글자 하나를 잠깐 띄워요 */
  function pop(text, cls, x, y) {
    const el = document.createElement('div');
    el.className = 'm6-pop ' + (cls || '');
    el.textContent = text;
    el.style.left = x + '%';
    el.style.top = y + '%';
    node.scene.appendChild(el);
    setTimeout(function () { el.remove(); }, 900);
  }

  /* 북 하나를 오른쪽 끝에 놓아요 */
  function addDrum(t) {
    const el = document.createElement('span');
    el.className = 'm6-drum';
    node.lane.appendChild(el);
    drums.push({ t: t, el: el, judged: false });
  }

  /* 북들을 굴려요 (고리에 닿는 시각에 맞춰 자리를 정해요) */
  function moveDrums() {
    // 앞으로 굴러올 북을 미리 만들어 둬요
    while (nextBeat - clock <= TRAVEL) {
      addDrum(nextBeat);
      nextBeat += BEAT;
    }
    drums.forEach(function (d) {
      const left = (d.t - clock) / TRAVEL;            // 1 = 오른쪽 끝, 0 = 고리
      d.el.style.left = (12 + left * 85) + '%';
      if (!d.judged && clock - d.t > GOOD) {          // 놓쳤어요 (벌칙은 없어요)
        d.judged = true;
        d.el.classList.add('is-miss');
        combo = 0;
        drawCombo();
      }
    });
    // 지나간 북은 치워요
    drums = drums.filter(function (d) {
      if (clock - d.t > 600) { d.el.remove(); return false; }
      return true;
    });
  }

  /* A(1번) 버튼 : 만세! */
  function manse() {
    if (!running || done) return;
    // 고리에 가장 가까운, 아직 안 친 북을 찾아요
    let best = null;
    drums.forEach(function (d) {
      if (d.judged) return;
      if (!best || Math.abs(d.t - clock) < Math.abs(best.t - clock)) best = d;
    });
    if (!best || Math.abs(best.t - clock) > GOOD) return;   // 박자가 아니면 그냥 넘어가요

    const perfect = Math.abs(best.t - clock) <= PERFECT;
    best.judged = true;
    best.el.classList.add('is-hit');

    combo += 1;
    dawn = MissionUtil.clamp(dawn + (perfect ? ADD_PERFECT : ADD_GOOD), 0, 100);
    drawDawn();
    drawCombo();

    // 모두 「만세!」 하고 뛰어올라요
    node.scene.classList.remove('is-manse');
    void node.scene.offsetWidth;
    node.scene.classList.add('is-manse');
    pop(perfect ? '딱 좋아!' : '좋아!', perfect ? 'is-perfect' : 'is-good', 12, 72);
    pop('만세!', 'is-manse', 30 + Math.random() * 40, 30 + Math.random() * 12);
    if (window.Sound) { Sound.drum(); if (perfect) Sound.ding(); }

    // 3번 연속 맞힐 때마다 사람이 한 명씩 몰려나와요
    if (combo % 3 === 0 && joined < JOINERS.length) addJoiner();

    if (dawn >= 100) liberate();
  }

  /* 거리로 사람 한 명이 몰려나와요 */
  function addJoiner() {
    const p = JOINERS[joined];
    joined += 1;
    const el = document.createElement('div');
    el.className = 'm6-person is-joiner';
    el.style.left = p.x + '%';
    el.style.setProperty('--size', p.size);
    el.innerHTML = '<span class="m6-flag"></span>' + MissionUtil.figure(p.who);
    node.crowd.appendChild(el);
    pop('함께해요!', 'is-join', p.x, 58);
  }

  function drawCombo() {
    node.combo.textContent = combo >= 2 ? '만세 ×' + combo : '';
    node.combo.classList.toggle('is-hot', combo >= 6);
  }


  /* ----------------------------------------------------------------
     4. 화면 그리기
     ---------------------------------------------------------------- */

  /* 하늘 밝기와 게이지를 화면에 그려요 */
  function drawDawn() {
    node.scene.style.setProperty('--dawn', dawn / 100);
    node.gaugeFill.style.width = dawn + '%';
  }

  /* 이야기 한 줄을 보여줘요 */
  function showStory() {
    node.story.textContent = STORY[storyIndex];

    // 글자가 스르륵 나타나게 해요
    node.story.classList.remove('is-in');
    void node.story.offsetWidth;
    node.story.classList.add('is-in');

    storyIndex += 1;

    // 이야기가 다 끝났는데 아직 하늘이 어두우면 살짝 알려줘요
    if (storyIndex >= STORY.length) {
      node.hint.innerHTML = '북에 맞춰 <b>A</b> 버튼으로 만세! 태극기도 흔들어 새벽을 맞이하라';
    }
  }


  /* ----------------------------------------------------------------
     5. 광복!
     ---------------------------------------------------------------- */
  function liberate() {
    done = true;
    running = false;

    // 화면 전체가 환하게 바뀌어요 ☀️
    document.body.classList.add('liberation');
    node.scene.classList.add('is-free');

    node.story.textContent = '대한 독립 만세!';
    node.story.classList.add('is-big');
    node.hint.textContent = '';

    if (window.Sound) Sound.fanfare();

    // ★ 불꽃이 하늘에 터지고, 태극기 색 꽃가루가 내려와요
    drums.forEach(function (d) { d.el.remove(); });
    drums = [];
    node.lane.classList.add('is-done');
    for (let i = 0; i < 7; i++) {
      setTimeout(firework, i * 320);
    }
    for (let i = 0; i < 46; i++) {
      const c = document.createElement('span');
      c.className = 'm6-confetti';
      c.style.left = Math.random() * 100 + '%';
      c.style.setProperty('--c', ['#cd2e3a', '#0047a0', '#ffffff', '#f0d78a'][i % 4]);
      c.style.setProperty('--d', (1.6 + Math.random() * 1.6) + 's');
      c.style.setProperty('--delay', Math.random() * 1.2 + 's');
      c.style.setProperty('--sway', (Math.random() * 60 - 30) + 'px');
      node.scene.appendChild(c);
    }

    setTimeout(onSuccess, 3600);
  }


  /* 불꽃 하나가 하늘에서 터져요 */
  function firework() {
    if (!node.scene) return;
    const x = 12 + Math.random() * 76;
    const y = 10 + Math.random() * 30;
    const colors = ['#ffd36b', '#ff6b6b', '#7fb2ff', '#ffffff'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    for (let i = 0; i < 14; i++) {
      const a = (Math.PI * 2 * i) / 14;
      const sp = document.createElement('span');
      sp.className = 'm6-spark';
      sp.style.left = x + '%';
      sp.style.top = y + '%';
      sp.style.setProperty('--dx', Math.cos(a) * 60 + 'px');
      sp.style.setProperty('--dy', Math.sin(a) * 60 + 'px');
      sp.style.setProperty('--c', color);
      node.scene.appendChild(sp);
      setTimeout(function () { sp.remove(); }, 1100);
    }
    if (window.Sound) Sound.drum();
  }


  /* ----------------------------------------------------------------
     6. 1초에 60번 반복되는 게임의 심장
     ---------------------------------------------------------------- */
  function loop(now) {
    if (!running) return;

    const delta = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;

    if (game.paused) {
      requestAnimationFrame(loop);
      return;
    }

    /* 이야기를 한 줄씩 넘겨요 */
    if (storyIndex < STORY.length) {
      storyTimer -= delta * 1000;
      if (storyTimer <= 0) {
        showStory();
        storyTimer = STORY_GAP;
      }
    }

    /* 만세 박자 : 시계가 흐르고 북이 굴러와요 */
    clock += delta * 1000;
    moveDrums();

    /* 흔들기를 멈추면 하늘이 조금씩 다시 어두워져요 */
    if (dawn > 0 && dawn < 100) {
      dawn = MissionUtil.clamp(dawn - DAWN_FADE * delta, 0, 100);
      drawDawn();
    }

    requestAnimationFrame(loop);
  }


  /* ----------------------------------------------------------------
     7. 미션 시작하기
     ---------------------------------------------------------------- */
  function start(success) {
    onSuccess = success;

    dawn = 0;
    lastSide = '';
    storyIndex = 0;
    storyTimer = 700;        // 잠깐 뒤에 첫 줄이 나와요
    done = false;
    running = true;
    lastMouseX = null;
    clock = 0;
    nextBeat = BEAT_START;
    drums = [];
    combo = 0;
    joined = 0;

    // 이 장은 어두운 밤에서 시작해요 (흔들어야 밝아져요)
    document.body.classList.remove('liberation');

    /* --- 사람들을 그려요 (모두 태극기를 들고 있어요) --- */
    let crowdHtml = '';
    CROWD.forEach(function (person) {
      crowdHtml +=
        '<div class="m6-person" style="left:' + person.x + '%;' +
             '--size:' + person.size + '">' +
          '<span class="m6-flag"></span>' +
          MissionUtil.figure(person.who) +
        '</div>';
    });

    const stage = MissionUtil.setStage(
      '<div class="m6-scene" style="--dawn:0">' +

        '<div class="m6-sky"></div>' +         // 밤 → 새벽으로 바뀌는 하늘
        '<div class="m6-sun"></div>' +         // 떠오르는 해
        '<div class="m6-crowd">' + crowdHtml + '</div>' +
        '<div class="m6-ground"></div>' +

        '<p class="m6-story"></p>' +
        '<p class="m6-combo"></p>' +

        // 만세 박자 : 북이 오른쪽에서 굴러와 왼쪽 고리에 닿아요
        '<div class="m6-lane"><span class="m6-ring">A</span></div>' +
        '<p class="m6-hint">북이 고리에 닿을 때 <b>A</b> 버튼 = 만세! &nbsp;·&nbsp; 스틱 좌 · 우 = 태극기 흔들기</p>' +

        '<div class="m6-gauge"><div class="m6-gauge-fill"></div></div>' +

      '</div>'
    );

    node = {
      scene:     stage.querySelector('.m6-scene'),
      story:     stage.querySelector('.m6-story'),
      hint:      stage.querySelector('.m6-hint'),
      gaugeFill: stage.querySelector('.m6-gauge-fill'),
      lane:      stage.querySelector('.m6-lane'),
      crowd:     stage.querySelector('.m6-crowd'),
      combo:     stage.querySelector('.m6-combo'),
    };

    drawDawn();

    /* --- 스틱 좌우로 흔들기 --- */
    Input.on('dir:left',  function () { shake('left'); });
    Input.on('dir:right', function () { shake('right'); });

    /* --- 마우스를 좌우로 움직여도 흔들려요 --- */
    node.scene.addEventListener('pointermove', function (e) {
      if (lastMouseX === null) { lastMouseX = e.clientX; return; }
      const moved = e.clientX - lastMouseX;
      if (Math.abs(moved) < 26) return;      // 조금 움직인 건 세지 않아요
      shake(moved > 0 ? 'right' : 'left');
      lastMouseX = e.clientX;
    });

    /* --- A(1번) 버튼 = 만세! (마우스로 눌러도 돼요) --- */
    Input.on('jump', manse);
    node.scene.addEventListener('pointerdown', manse);

    lastTime = performance.now();
    requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
  }


  return {
    start: start,
    stop: stop,
    hint: '드디어 광복의 날. 북에 맞춰 A 버튼으로 만세를 부르고, 스틱을 흔들어 태극기를 펄럭여라.',
  };
})();
