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

     ★ 기력이 절반 남으면 헌병대장이 화가 나요.
        - 「속임수」 : 공격하는 척만 해요. 이때 공격하면 헛손질!
        - 「한 번 더」 : 두 번 연달아 내려쳐요. 두 번 다 피해야 해요.
   ================================================================== */

MISSIONS[5] = (function () {

  /* ----------------------------------------------------------------
     1. 싸움 규칙 숫자들
     ---------------------------------------------------------------- */
  const BOSS_HP = 4;        // 헌병대장의 기력 (네 번만 맞히면 이겨요)
  const HERO_HP = 4;        // 주인공의 기력 (네 번 맞아도 버틸 수 있어요)

  const JUMP_TIME  = 780;   // 점프해서 공중에 떠 있는 시간 (밀리초)
  const MISS_TIME  = 280;   // 헛손질하고 굳어 있는 시간
  const HIT_FLASH  = 260;   // 맞았을 때 번쩍이는 시간

  /* 헌병대장의 동작 시간 (기력이 줄수록 점점 빨라져요) */
  const IDLE_TIME   = [1100, 750];  // 처음 1100 → 마지막 750
  const READY_TIME  = [1150, 800];  // 「준비」 신호를 보여주는 시간 (넉넉하게)
  const STRIKE_TIME = [380, 320];   // 내려치는 시간 (이 동안 뛰어도 피할 수 있어요)
  const OPEN_TIME   = [1400, 1050]; // 빈틈이 생기는 시간 (공격할 틈이 길어요)

  /* 화난 헌병대장의 기술 */
  const ANGRY_HP     = 2;     // 기력이 이만큼 남으면 화가 나요
  const FEINT_CHANCE = 0.3;   // 속임수를 쓸 확률
  const FEINT_TIME   = 750;   // 속임수 자세를 보여주는 시간
  const DOUBLE_CHANCE = 0.5;  // 두 번 연달아 내려칠 확률
  const READY2_TIME  = 820;   // 두 번째 공격 전 「한 번 더」 시간
  const SHOUT_TIME   = 1300;  // 동료의 외침이 보이는 시간


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
  let angry = false;        // 헌병대장이 화가 났는지
  let strikeNo = 0;         // 이번에 몇 번째 내려치기인지 (1 또는 2)
  let lastFeint = false;    // 바로 전에 속임수를 썼는지 (두 번 연속은 안 해요)
  let feintSwing = false;   // 속임수 때 공격 버튼을 눌렀는지
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
      ready:  strikeNo === 1 ? '한 번 더!  다시 온다' : '준비!  곧 공격한다',
      feint:  '속임수!  기다려라',
      strike: '공격!  점프로 피해라',
      open:   '빈틈!  지금 공격하라',
    };

    node.boss.className = 'm5-boss is-' + bossState + (angry ? ' is-angry' : '');
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

  /* ----------------------------------------------------------------
     4-2. 싸움 효과 (휘두르기, 불꽃, 숫자, 화면 흔들림)
     ★ 효과는 잠깐 나타났다가 저절로 사라져요.
     ---------------------------------------------------------------- */

  /* 어떤 것의 가운데 자리를 싸움터 안의 좌표(px)로 알려줘요 */
  function centerOf(el) {
    const r = el.getBoundingClientRect();
    const a = node.arena.getBoundingClientRect();
    return { x: r.left + r.width / 2 - a.left, y: r.top + r.height / 2 - a.top, w: r.width, h: r.height };
  }

  /* 효과 하나를 잠깐 띄워요 */
  function fx(cls, x, y, html, life, vars) {
    const el = document.createElement('div');
    el.className = 'm5-fx ' + cls;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    if (vars) for (const k in vars) el.style.setProperty(k, vars[k]);
    if (html) el.innerHTML = html;
    node.arena.appendChild(el);
    setTimeout(function () { el.remove(); }, life || 700);
  }

  /* 불꽃이 사방으로 튀어요 */
  function sparks(x, y, color, count) {
    for (let i = 0; i < (count || 9); i++) {
      const a = Math.random() * Math.PI * 2;
      const d = 30 + Math.random() * 45;
      fx('m5-spark', x, y, '', 600, {
        '--dx': Math.cos(a) * d + 'px', '--dy': Math.sin(a) * d + 'px', '--c': color || '#ffe08a',
      });
    }
  }

  /* 클래스를 붙였다가 애니메이션이 끝나면 떼요 (여러 번 해도 처음부터 다시) */
  function flash(el, cls, ms) {
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
    setTimeout(function () { el.classList.remove(cls); }, ms);
  }

  /* 주인공과 헌병대장 사이 거리(px) — 돌진할 거리를 정할 때 써요 */
  function gap() {
    const h = centerOf(node.hero), b = centerOf(node.bossFig);
    return Math.max(40, b.x - h.x);
  }

  /* 뒤에 있는 동료가 한마디 외쳐요 */
  function shout(text) {
    node.shout.textContent = text;
    flash(node.shout, 'is-on', SHOUT_TIME);
  }

  function pick(list) { return list[Math.floor(Math.random() * list.length)]; }

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
      strikeNo = 0;
      stateTimer = speedOf(READY_TIME);
      if (window.Sound) Sound.alert();       // 삐빅! 곧 공격해요

    } else if (bossState === 'ready' && angry && strikeNo === 0 && !lastFeint && Math.random() < FEINT_CHANCE) {
      /* ★ 속임수 : 내려치는 척만 하고 물러나요 */
      lastFeint = true;
      feintSwing = false;
      bossState = 'feint';
      stateTimer = FEINT_TIME;
      setTalk('속임수다! 섣불리 공격하지 마라.', '');

    } else if (bossState === 'feint') {
      if (!feintSwing) shout('속지 않았다!');
      bossState = 'idle';
      stateTimer = speedOf(IDLE_TIME) * 0.6;

    } else if (bossState === 'ready') {
      lastFeint = false;
      strikeNo += 1;
      bossState = 'strike';
      stateTimer = speedOf(STRIKE_TIME);
      struck = false;                        // 이번 공격은 아직 판정 안 했어요
      // 주인공 바로 앞까지 확 달려들어요
      node.boss.style.setProperty('--lunge', Math.max(0, gap() - 70) + 'px');
      if (window.Sound) Sound.swish();
      const h = centerOf(node.hero);
      fx('m5-slash is-enemy', h.x + 26, h.y - 6, '', 420);

    } else if (bossState === 'strike') {
      // 내려치는 동안 한 번도 안 뛰었으면 그제서야 맞아요
      if (!struck) { struck = true; heroHit(); if (!running) return; }
      if (angry && strikeNo === 1 && Math.random() < DOUBLE_CHANCE) {
        /* ★ 한 번 더! 두 번째 공격이 와요 */
        bossState = 'ready';
        stateTimer = READY2_TIME;
        if (window.Sound) Sound.alert();
      } else {
        bossState = 'open';
        stateTimer = speedOf(OPEN_TIME);
      }

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

      // ★ 헌병대장에게 달려가 베고 돌아와요
      node.hero.style.setProperty('--dash', Math.max(0, gap() - 80) + 'px');
      flash(node.hero, 'is-dash', 420);
      if (window.Sound) Sound.swish();
      setTimeout(function () {
        const b = centerOf(node.bossFig);
        fx('m5-slash', b.x, b.y, '', 420);              // 하얀 칼 자국
        sparks(b.x, b.y, '#ffe08a', 10);                  // 불꽃
        fx('m5-pop is-dmg', b.x, b.y - b.h * 0.55, '-1', 800);
        flash(node.bossFig, 'is-knock', 380);             // 뒤로 밀려나요
        flash(node.arena, 'is-shake', 300);               // 화면이 흔들려요
        if (window.Sound) Sound.hit();
      }, 150);

      if (window.Sound) Sound.ding();
      setTalk('명중! 헌병대장이 물러선다.', 'good');

      // 뒤에 있는 동료들이 함께 기뻐해요
      node.allies.classList.remove('is-cheer');
      void node.allies.offsetWidth;            // 애니메이션을 처음부터 다시
      node.allies.classList.add('is-cheer');

      if (bossHp <= 0) { win(); return; }
      shout(pick(['좋다!', '그렇지!', '조금만 더!']));

      // 맞으면 바로 다음 동작으로 넘어가요
      bossState = 'idle';
      stateTimer = speedOf(IDLE_TIME);

      // ★ 기력이 절반 남으면 화가 나서 기술을 써요
      if (bossHp === ANGRY_HP && !angry) {
        angry = true;
        stateTimer = 1800;                 // 화내는 동안은 잠깐 쉬어요
        setTimeout(function () {
          if (!running) return;
          setTalk('헌병대장이 화가 났다! 속임수와 연속 공격을 조심하라.', 'bad');
          flash(node.arena, 'is-shake', 300);
          if (window.Sound) Sound.alert();
        }, 450);
      }
      drawBoss();

    } else {
      /* ---- 빈틈이 아닌데 휘둘렀어요 ---- */
      if (bossState === 'feint') feintSwing = true;
      missUntil = now + MISS_TIME;
      setTalk('헛손질! 잠시 움직일 수 없다.', 'bad');
      drawHero(now);
      flash(node.hero, 'is-whiff', 300);                // 허공을 가르는 몸짓
      if (window.Sound) Sound.swish();
      const h = centerOf(node.hero);
      fx('m5-slash is-miss', h.x + 34, h.y, '', 360);
      fx('m5-pop is-miss', h.x, h.y - h.h * 0.6, '헛손질!', 700);
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

    // ★ 맞으면 뒤로 밀려나고, 화면이 붉게 번쩍이며 흔들려요
    const h = centerOf(node.hero);
    sparks(h.x, h.y, '#ff5a5a', 8);
    fx('m5-pop is-ouch', h.x, h.y - h.h * 0.6, '-1', 800);
    flash(node.heroFig, 'is-knock', 380);
    flash(node.arena, 'is-shake', 300);
    flash(node.arena, 'is-ouch', 380);
    if (window.Sound) Sound.hit();
    if (window.Sound) Sound.ppyong();

    if (heroHp <= 0) { lose(); return; }
    setTalk('공격에 맞았다! 다음엔 점프로 피하자.', 'bad');
    if (heroHp === 1) shout('버텨라! 우리가 있다!');
  }

  function win() {
    running = false;
    // ★ 마지막 한 방! 크게 번쩍이고 불꽃이 터져요
    setTimeout(function () {
      const b = centerOf(node.bossFig);
      sparks(b.x, b.y, '#ffffff', 16);
      sparks(b.x, b.y, '#ffe08a', 12);
      flash(node.arena, 'is-win', 900);
      fx('m5-pop is-win', centerOf(node.arena).x, centerOf(node.arena).y * 0.55, '승리!', 1400);
      node.allies.classList.add('is-cheer-loop');
    }, 160);
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

    /* ★ 내려치는 동안 공중에 있으면 피한 거예요.
       전에는 내려치는 '첫 순간'에만 확인해서 조금만 늦어도 맞았어요.
       이제는 칼이 내려오는 동안 언제 뛰어도 피할 수 있어요.
       (끝까지 안 뛰면 공격이 끝날 때 맞아요) */
    if (bossState === 'strike' && !struck && isJumping(now)) {
      struck = true;
      setTalk('잘 피했다!', 'good');
      const h = centerOf(node.hero);
      fx('m5-pop is-dodge', h.x, h.y - h.h * 0.7, '회피!', 700);
      fx('m5-dust', h.x, centerOf(node.ground).y, '', 500);
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
    angry = false;
    strikeNo = 0;
    lastFeint = false;
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
          // 주인공 뒤 : 김구 선생님과 한국광복군이 함께 서 있어요 (기획서 5장)
          '<div class="m5-allies">' +
            '<span class="m5-ally">' + MissionUtil.figure('army') + '</span>' +
            '<span class="m5-ally">' + MissionUtil.figure('kimgu') + '</span>' +
            '<span class="m5-ally">' + MissionUtil.figure('army') + '</span>' +
            '<span class="m5-ally-name">김구 · 한국광복군</span>' +
            '<span class="m5-shout"></span>' +       // 동료의 외침
          '</div>' +
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
      heroFig: stage.querySelector('.m5-hero .fig'),
      arena:   stage.querySelector('.m5-arena'),
      ground:  stage.querySelector('.m5-ground'),
      allies:  stage.querySelector('.m5-allies'),
      shout:   stage.querySelector('.m5-shout'),
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
    hint: '「준비」 뒤 공격이 온다. 1번으로 점프해 피하고, 「빈틈」에 3번으로 공격하라. 화가 나면 「속임수」와 「한 번 더」를 조심!',
  };
})();
