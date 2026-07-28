/* ==================================================================
   5장 · 독립을 향하여  (ch5.js)

   주인공과 김구 선생님, 독립군이 마지막 싸움을 준비해요.
   일본 헌병대장과 맞서 싸워 이기면 광복이 눈앞이에요!

   ★ 싸우는 방법 : 막고 치기

     1) 헌병대장이 「준비」 자세를 취해요  → 곧 공격해요!
     2) 「공격」 할 때 1번 버튼으로 점프해서 피해요
     3) 공격이 빗나가면 「빈틈」 이 생겨요 → 3번 버튼으로 공격!
     4) 헌병대장의 기력을 모두 없애면 승리 (+30점)

     ※ 빈틈이 아닐 때 공격하면 헛손질을 해서 잠깐 움직이지 못해요.
        아무 때나 마구 누르면 안 돼요!
   ================================================================== */

MISSIONS[5] = (function () {

  /* ----------------------------------------------------------------
     1. 싸움 규칙 숫자들
     ---------------------------------------------------------------- */
  const BOSS_HP = 5;        // 헌병대장의 기력
  const HERO_HP = 3;        // 주인공의 기력

  const JUMP_TIME  = 620;   // 점프해서 공중에 떠 있는 시간 (밀리초)
  const MISS_TIME  = 420;   // 헛손질하고 굳어 있는 시간
  const HIT_FLASH  = 260;   // 맞았을 때 번쩍이는 시간

  /* 헌병대장의 동작 시간 (기력이 줄수록 점점 빨라져요) */
  const IDLE_TIME   = [900, 500];   // 처음 900 → 마지막 500
  const READY_TIME  = [780, 430];   // 「준비」 신호를 보여주는 시간
  const STRIKE_TIME = [300, 240];   // 내려치는 시간
  const OPEN_TIME   = [900, 620];   // 빈틈이 생기는 시간


  /* ----------------------------------------------------------------
     2. 이 미션이 기억해야 할 것들
     ---------------------------------------------------------------- */
  let bossHp = 0;
  let heroHp = 0;
  let bossState = '';       // idle · ready · strike · open
  let stateTimer = 0;       // 지금 동작이 끝날 때까지 남은 시간
  let jumpUntil = 0;        // 이 시각까지 공중에 떠 있어요
  let missUntil = 0;        // 이 시각까지 헛손질로 굳어 있어요
  let struck = false;       // 이번 공격이 이미 판정됐는지
  let running = false;
  let lastTime = 0;
  let onSuccess = null;
  let onFail = null;
  let node = {};


  /* ----------------------------------------------------------------
     3. 도우미
     ---------------------------------------------------------------- */

  /* 기력이 줄수록 동작이 빨라지게 시간을 계산해요.
     range 는 [처음시간, 마지막시간] 이에요. */
  function speedOf(range) {
    const gone = (BOSS_HP - bossHp) / BOSS_HP;   // 0 에서 시작해 1까지
    return range[0] + (range[1] - range[0]) * gone;
  }

  /* 지금 공중에 떠 있나요? */
  function isJumping(now) { return now < jumpUntil; }

  /* 지금 헛손질로 굳어 있나요? */
  function isStiff(now) { return now < missUntil; }


  /* ----------------------------------------------------------------
     4. 화면 그리기
     ---------------------------------------------------------------- */

  /* 기력 막대를 그려요 */
  function drawHp() {
    let bossHtml = '';
    for (let i = 0; i < BOSS_HP; i++) {
      bossHtml += '<span class="m5-pip' + (i < bossHp ? '' : ' is-lost') + '"></span>';
    }
    node.bossHp.innerHTML = bossHtml;

    let heroHtml = '';
    for (let i = 0; i < HERO_HP; i++) {
      heroHtml += '<span class="m5-pip is-mine' + (i < heroHp ? '' : ' is-lost') + '"></span>';
    }
    node.heroHp.innerHTML = heroHtml;
  }

  /* 헌병대장의 지금 동작을 화면에 보여줘요 */
  function drawBoss() {
    const words = {
      idle:   '……',
      ready:  '준비!  곧 공격한다',
      strike: '공격!  점프로 피해라',
      open:   '빈틈!  지금 공격하라',
    };

    node.boss.className = 'm5-boss is-' + bossState;
    node.signal.className = 'm5-signal is-' + bossState;
    node.signal.textContent = words[bossState];

    // 이쪽을 노려볼 때만 눈이 켜져요
    node.bossFig.classList.toggle('is-looking',
      bossState === 'ready' || bossState === 'strike');
  }

  /* 주인공의 모습을 바꿔요 */
  function drawHero(now) {
    node.hero.classList.toggle('is-jumping', isJumping(now));
    node.hero.classList.toggle('is-stiff', isStiff(now));
  }

  function setTalk(text, kind) {
    node.talk.textContent = text;
    node.talk.className = 'm5-talk' + (kind ? ' is-' + kind : '');
  }


  /* ----------------------------------------------------------------
     5. 헌병대장의 동작 바꾸기
     ---------------------------------------------------------------- */
  function nextBossState() {
    if (bossState === 'idle') {
      bossState = 'ready';
      stateTimer = speedOf(READY_TIME);
      if (window.Sound) Sound.alert();       // 삐빅! 곧 공격해요

    } else if (bossState === 'ready') {
      bossState = 'strike';
      stateTimer = speedOf(STRIKE_TIME);
      struck = false;                        // 이번 공격은 아직 판정 안 했어요

    } else if (bossState === 'strike') {
      bossState = 'open';
      stateTimer = speedOf(OPEN_TIME);

    } else {
      bossState = 'idle';
      stateTimer = speedOf(IDLE_TIME);
    }

    drawBoss();
  }


  /* ----------------------------------------------------------------
     6. 주인공의 행동
     ---------------------------------------------------------------- */

  /* 1번 버튼 : 점프해서 피하기 */
  function jump() {
    if (!running) return;
    const now = performance.now();
    if (isJumping(now) || isStiff(now)) return;   // 이미 뛰었거나 굳었으면 못 해요

    jumpUntil = now + JUMP_TIME;
    drawHero(now);
  }

  /* 3번 버튼 : 공격하기 */
  function attack() {
    if (!running) return;
    const now = performance.now();
    if (isStiff(now)) return;

    if (bossState === 'open') {
      /* ---- 빈틈을 정확히 노렸어요! ---- */
      bossHp -= 1;
      drawHp();
      node.boss.classList.add('is-hurt');
      setTimeout(function () { node.boss.classList.remove('is-hurt'); }, HIT_FLASH);

      if (window.Sound) Sound.ding();
      setTalk('명중! 헌병대장이 물러선다.', 'good');

      if (bossHp <= 0) { win(); return; }

      // 맞으면 바로 다음 동작으로 넘어가요
      bossState = 'idle';
      stateTimer = speedOf(IDLE_TIME);
      drawBoss();

    } else {
      /* ---- 빈틈이 아닌데 휘둘렀어요 ---- */
      missUntil = now + MISS_TIME;
      setTalk('헛손질! 잠시 움직일 수 없다.', 'bad');
      drawHero(now);
    }
  }


  /* ----------------------------------------------------------------
     7. 맞았을 때 / 이겼을 때 / 졌을 때
     ---------------------------------------------------------------- */
  function heroHit() {
    heroHp -= 1;
    drawHp();

    node.hero.classList.add('is-hurt');
    setTimeout(function () { node.hero.classList.remove('is-hurt'); }, HIT_FLASH);

    if (window.Sound) Sound.ppyong();

    if (heroHp <= 0) { lose(); return; }
    setTalk('공격에 맞았다! 다음엔 점프로 피하자.', 'bad');
  }

  function win() {
    running = false;
    node.boss.classList.add('is-down');
    node.signal.className = 'm5-signal';
    node.signal.textContent = '';
    setTalk('일본 헌병대장을 물리쳤다! 광복이 눈앞이다.', 'good');
    if (window.Sound) Sound.fanfare();
    setTimeout(onSuccess, 1500);
  }

  function lose() {
    running = false;
    setTalk('기력이 다했다...', 'bad');
    setTimeout(function () {
      onFail('일본 헌병대장과의 싸움에서 힘이 다했어요!');
    }, 900);
  }


  /* ----------------------------------------------------------------
     8. 1초에 60번 반복되는 게임의 심장
     ---------------------------------------------------------------- */
  function loop(now) {
    if (!running) return;

    const delta = Math.min(now - lastTime, 50);
    lastTime = now;

    if (game.paused) {                 // 잠시 멈춤 중이면 시간을 멈춰요
      jumpUntil += delta;
      missUntil += delta;
      requestAnimationFrame(loop);
      return;
    }

    /* 헌병대장의 동작 시간을 줄여요 */
    stateTimer -= delta;
    if (stateTimer <= 0) nextBossState();

    /* 내려치는 순간에 딱 한 번만 맞았는지 확인해요 */
    if (bossState === 'strike' && !struck) {
      struck = true;
      if (!isJumping(now)) heroHit();       // 공중에 없으면 맞아요!
      else setTalk('잘 피했다!', 'good');
    }

    drawHero(now);
    if (running) requestAnimationFrame(loop);
  }


  /* ----------------------------------------------------------------
     9. 미션 시작하기
     ---------------------------------------------------------------- */
  function start(success, fail) {
    onSuccess = success;
    onFail = fail;

    bossHp = BOSS_HP;
    heroHp = HERO_HP;
    bossState = 'idle';
    stateTimer = 1200;                 // 처음에는 조금 여유를 줘요
    jumpUntil = 0;
    missUntil = 0;
    running = true;

    const stage = MissionUtil.setStage(
      '<div class="m5-scene">' +

        // 위쪽 : 양쪽 기력 막대
        '<div class="m5-bars">' +
          '<div class="m5-side">' +
            '<span class="m5-who">주인공</span>' +
            '<span class="m5-hp m5-hero-hp"></span>' +
          '</div>' +
          '<div class="m5-side m5-right">' +
            '<span class="m5-hp m5-boss-hp"></span>' +
            '<span class="m5-who">일본 헌병대장</span>' +
          '</div>' +
        '</div>' +

        // 가운데 : 싸움터
        '<div class="m5-arena">' +
          '<div class="m5-signal"></div>' +
          '<div class="m5-ground"></div>' +
          '<div class="m5-hero">' + MissionUtil.figure('hero') + '</div>' +
          '<div class="m5-boss is-idle">' +
            MissionUtil.figure('captain') +
            '<span class="m5-blade"></span>' +      // 내려치는 칼
          '</div>' +
        '</div>' +

        '<p class="m5-talk">마지막 싸움이다. 겁먹지 말자.</p>' +
        '<p class="m5-tip">' +
          '<span class="m3-key">1번</span> 점프해서 피하기 &nbsp;·&nbsp; ' +
          '<span class="m3-key">3번</span> 빈틈에 공격하기' +
        '</p>' +

      '</div>'
    );

    node = {
      boss:    stage.querySelector('.m5-boss'),
      bossFig: stage.querySelector('.m5-boss .fig'),
      hero:    stage.querySelector('.m5-hero'),
      signal:  stage.querySelector('.m5-signal'),
      bossHp:  stage.querySelector('.m5-boss-hp'),
      heroHp:  stage.querySelector('.m5-hero-hp'),
      talk:    stage.querySelector('.m5-talk'),
    };

    drawHp();
    drawBoss();

    /* 버튼을 연결해요 */
    Input.on('jump',   jump);      // 1번 : 점프
    Input.on('attack', attack);    // 3번 : 공격

    /* 마우스로도 싸울 수 있어요 (왼쪽 절반=점프, 오른쪽 절반=공격) */
    stage.querySelector('.m5-arena').addEventListener('pointerdown', function (e) {
      const box = e.currentTarget.getBoundingClientRect();
      if (e.clientX - box.left < box.width / 2) jump();
      else attack();
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
    hint: '「준비」 뒤 공격이 온다. 1번으로 점프해 피하고, 「빈틈」에 3번으로 공격하라.',
  };
})();
