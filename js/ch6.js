/* ==================================================================
   6장 · 광복의 날  (ch6.js)

   마지막 장이에요. 싸우는 미션이 아니라 함께 기뻐하는 장면이에요.

   ★ 두 가지가 함께 일어나요
     1) 이야기가 한 줄씩 저절로 흘러가요 (가만히 보면 돼요)
     2) 스틱을 좌우로 흔들면 태극기가 펄럭이고,
        흔들수록 밤하늘이 새벽으로 밝아져요!

   하늘이 완전히 밝아지면 광복이 이루어지고 게임이 끝나요.

   조작 : 스틱(방향키)을 좌우로 번갈아 흔들기
          마우스를 좌우로 움직여도 돼요
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

  const STORY_GAP = 2600;    // 이야기 한 줄이 머무는 시간 (밀리초)
  const SHAKE_ADD = 7;       // 한 번 흔들 때마다 밝아지는 정도
  const DAWN_FADE = 3;       // 흔들지 않으면 1초에 이만큼씩 다시 어두워져요


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
      node.hint.textContent = '태극기를 흔들어 새벽을 맞이하라  (스틱 좌 · 우)';
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

    setTimeout(onSuccess, 2200);
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
        '<p class="m6-hint">스틱을 좌 · 우로 흔들어 태극기를 펄럭여라</p>' +

        '<div class="m6-gauge"><div class="m6-gauge-fill"></div></div>' +

      '</div>'
    );

    node = {
      scene:     stage.querySelector('.m6-scene'),
      story:     stage.querySelector('.m6-story'),
      hint:      stage.querySelector('.m6-hint'),
      gaugeFill: stage.querySelector('.m6-gauge-fill'),
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

    /* --- 마우스로 눌러도 한 번 흔들려요 --- */
    node.scene.addEventListener('pointerdown', function () {
      shake(lastSide === 'left' ? 'right' : 'left');
    });

    lastTime = performance.now();
    requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
  }


  return {
    start: start,
    stop: stop,
    hint: '드디어 광복의 날. 스틱을 좌우로 흔들어 태극기를 펄럭이면 새벽이 밝아온다.',
  };
})();
