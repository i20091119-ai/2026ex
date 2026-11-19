/* ==================================================================
   1장 · 비밀 편지  (ch1.js)

   ★ 놀이 방법은 '무궁화 꽃이 피었습니다' 와 똑같아요!

   - 일본 경찰이 뒤를 돌아보고 있을 때(🙈) 앞으로 달려요
   - 경찰이 이쪽을 볼 때(👀) 움직이면 들켜요!
   - 오른쪽 끝 비밀 아지트까지 편지를 전달하면 성공이에요

   ★ 더 재밌게!
   - 경찰이 「음?」 하고 돌아보려다 그냥 다시 돌아서기도 해요 (속임수)
   - 길 중간부터는 「손전등」 이 길을 쓸고 지나가요.
     이때는 가만히 있어도 들켜요! 짚단·장독·수레 옆에서 스틱 ↓ 로 숨어요.
   - 아슬아슬하게 멈추면 「아슬아슬!」 이 떠요

   조작 : 오른쪽 방향키(또는 스틱 오른쪽)를 꾹 누르면 앞으로 가요
          왼쪽 방향키(스틱 ←)로 뒤로 물러날 수도 있어요
          숨을 곳 옆에서 아래 방향키(스틱 ↓)를 꾹 누르면 숨어요
          마우스로 화면을 꾹 눌러도 앞으로 가요
   ================================================================== */

MISSIONS[1] = (function () {

  /* ----------------------------------------------------------------
     1. 이 미션이 기억해야 할 것들
     ---------------------------------------------------------------- */
  let hero = 0;            // 주인공이 어디까지 왔는지 (0 = 출발, 100 = 도착)
  let cops = [];           // 경찰들의 상태 (처음엔 한 명, 나중에 두 명)
  let secondCame = false;  // 두 번째 경찰이 나왔는지
  let running = false;     // 미션이 진행 중인지
  let mouseHold = false;   // 마우스를 누르고 있는지
  let lastTime = 0;        // 시간을 재려고 기억해두는 값
  let clock = 0;           // 이 장의 시계 (초)
  let lastMoveAt = -9;     // 마지막으로 움직인 때
  let hidden = false;      // 지금 숨어 있는지
  let search = null;       // 손전등 { phase:'warn'|'sweep', t, from, to, x }
  let searchWait = 0;      // 다음 손전등까지 남은 시간
  let dustTimer = 0;

  let onSuccess = null;    // 성공하면 부를 함수
  let onFail = null;       // 들키면 부를 함수

  let node = {};           // 화면 조각들을 담아둘 곳

  /* 주인공이 달리는 빠르기 (1초에 몇 칸 가는지)
     숫자를 줄이면 길이 길어져서 게임이 오래 걸려요. */
  const SPEED = 17;

  /* 두 번째 경찰이 나타나는 지점이에요.
     절반을 조금 넘어서면 나와요. 그때부터 확 어려워져요! */
  const SECOND_AT = 55;

  /* ★ 봐주는 시간 (초)
     경찰이 막 돌아본 순간에는 이만큼 안 잡아줘요.
     "앗!" 하고 손을 떼면 살 수 있어요. 어린 동생들에게 꼭 필요해요! */
  const GRACE = 0.28;

  /* ★ 숨을 곳 (길 위의 자리 %, 모양) */
  const SPOTS = [
    { x: 22, kind: 'hay',  name: '짚단' },
    { x: 47, kind: 'jar',  name: '장독' },
    { x: 73, kind: 'cart', name: '수레' },
  ];
  const HIDE_NEAR = 4.5;      // 숨을 곳에서 이만큼 가까우면 숨을 수 있어요

  /* ★ 손전등 수색 */
  const SEARCH_FROM  = 16;    // 이만큼 온 뒤부터 손전등이 와요
  const SEARCH_WARN  = 1.7;   // 「손전등을 비춘다!」 알림 시간 (초)
  const SEARCH_SWEEP = 2.6;   // 불빛이 길 끝에서 끝까지 쓸고 가는 시간 (초)
  const BEAM_HALF    = 6;     // 불빛의 반쯤 너비 (%)

  const FAKE_CHANCE = 0.28;   // 경찰이 돌아보는 척만 할 확률


  /* ----------------------------------------------------------------
     2. 경찰의 세 가지 상태

     'away'    🙈 뒤돌아 있음  → 지금이 달릴 기회!
     'warning' 🤔 돌아보려고 함 → 얼른 멈춰야 해요
     'watching'👀 이쪽을 봄     → 움직이면 들켜요!
     ---------------------------------------------------------------- */
  function nextState(cop) {
    // 도착에 가까워질수록 어려워져요 (기획서: 점점 어려워진다)
    const hard = hero / 100;          // 0에서 시작해 1까지 커져요

    if (cop.state === 'away') {
      cop.state = 'warning';
      // '돌아본다!' 신호 시간이에요. 짧을수록 어려워져요.
      // 도착에 가까워질수록 더 짧아져서 점점 긴장돼요.
      cop.timer = MissionUtil.clamp(1.2 - hard * 0.35, 0.7, 1.25);
      // ★ 가끔은 돌아보는 척만 하고 다시 돌아서요 (막대가 줄다가 멈춰요)
      cop.fakeAt = (hero > 8 && Math.random() < FAKE_CHANCE)
        ? cop.timer * MissionUtil.random(0.3, 0.6) : -1;

    } else if (cop.state === 'warning') {
      cop.state = 'watching';
      cop.watched = 0;                       // 이제 막 돌아봤어요 (봐주는 시간 시작)
      cop.closeCall = (clock - lastMoveAt) < 0.45;   // 방금까지 달리고 있었나요?
      cop.timer = MissionUtil.random(0.9, 1.5) + hard * 0.25;
      if (window.Sound) Sound.alert();       // 삐빅! 조심하라는 소리

    } else {
      cop.state = 'away';
      // 달릴 수 있는 시간을 넉넉하게 줘요
      cop.timer = MissionUtil.clamp(MissionUtil.random(2.8, 4.0) - hard * 1.0, 1.6, 4.0);
    }

    cop.timerMax = cop.timer;    // 남은 시간 막대를 그리려고 기억해둬요
    drawPolice();
  }

  /* 지금 경찰이 이쪽을 보고 있나요? (신호등 색을 정할 때 써요) */
  function isWatched() {
    return cops.some(function (cop) { return cop.state === 'watching'; });
  }

  /* 지금 움직이면 진짜로 들키나요?
     ★ 막 돌아본 순간(GRACE 동안)에는 봐줘요.
       "멈춰!" 가 뜬 뒤 얼른 손을 떼면 살 수 있어요. */
  function isCaught() {
    return cops.some(function (cop) {
      return cop.state === 'watching' && cop.watched > GRACE;
    });
  }

  /* 곧 돌아보려는 경찰이 있나요? */
  function isWarning() {
    return cops.some(function (cop) { return cop.state === 'warning'; });
  }


  /* ----------------------------------------------------------------
     3. 화면 그리기
     ---------------------------------------------------------------- */

  /* 경찰의 얼굴과 말풍선을 바꿔요 */
  function drawPolice() {
    const words = { away: '......', warning: '음?', watching: '누구냐!' };

    cops.forEach(function (cop) {
      if (!cop.node) return;
      cop.wordNode.textContent = words[cop.state];
      cop.figNode.classList.toggle('is-looking', cop.state === 'watching');
      cop.node.className = 'm1-police is-' + cop.state;
    });

    /* 가운데 신호등은 '가장 위험한 상태'를 보여줘요.
       한 명이라도 보고 있으면 빨간불이에요! */
    let light = 'away';
    if (isWatched())      light = 'watching';
    else if (isWarning()) light = 'warning';

    node.light.className = 'm1-light is-' + light;
    node.light.textContent =
      { away: '지금 달려!', warning: '멈출 준비!', watching: '멈춰!' }[light];
  }

  /* '돌아본다!' 신호가 얼마나 남았는지 막대로 보여줘요.
     막대가 다 줄어들면 경찰이 이쪽을 봐요! */
  function drawCountdown() {
    if (!node.count) return;

    // 곧 돌아보려는 경찰 중에 가장 급한 사람을 찾아요
    let left = 0;
    cops.forEach(function (cop) {
      if (cop.state !== 'warning') return;
      const ratio = cop.timer / (cop.timerMax || 1);
      if (left === 0 || ratio < left) left = ratio;
    });

    node.count.style.width = Math.max(0, Math.min(1, left)) * 100 + '%';
    node.count.classList.toggle('is-on', left > 0);
  }

  /* 무대 위에 글자를 잠깐 띄워요 (아슬아슬! 등) */
  function pop(text, cls) {
    const el = document.createElement('div');
    el.className = 'm1-pop ' + (cls || '');
    el.textContent = text;
    el.style.left = hero + '%';
    node.road.appendChild(el);
    setTimeout(function () { el.remove(); }, 1000);
  }

  /* 발밑에 먼지가 폴폴 */
  function dust() {
    const el = document.createElement('span');
    el.className = 'm1-dust';
    el.style.left = hero + '%';
    node.road.appendChild(el);
    setTimeout(function () { el.remove(); }, 500);
  }

  /* 가장 가까운 숨을 곳 (가까우면 그 번호, 아니면 -1) */
  function nearSpot() {
    for (let i = 0; i < SPOTS.length; i++) {
      if (Math.abs(SPOTS[i].x - hero) <= HIDE_NEAR) return i;
    }
    return -1;
  }

  /* ----------------------------------------------------------------
     3-2. 손전등 수색
     ---------------------------------------------------------------- */
  function startSearch() {
    const fromLeft = Math.random() < 0.5;
    search = { phase: 'warn', t: SEARCH_WARN, from: fromLeft ? -8 : 108, to: fromLeft ? 108 : -8 };
    search.x = search.from;
    node.warn.textContent = '손전등을 비춘다!  짚단 · 장독 · 수레 옆에서 ↓ 로 숨어라!';
    node.warn.classList.add('is-on');
    node.beam.classList.add('is-warn');
    node.beam.style.left = (fromLeft ? 2 : 98) + '%';
    node.warn.classList.add('is-search');
    node.light.className = 'm1-light is-search';     // 신호도 「숨어라!」 로 바뀌어요
    node.light.textContent = '숨어라!';
    if (window.Sound) Sound.alert();
  }

  function updateSearch(delta) {
    // 손전등이 없을 때 : 경찰이 모두 뒤돌아 있을 때만 시작해요 (위험은 한 번에 하나씩!)
    if (!search) {
      if (hero < SEARCH_FROM || hero > 92) return;
      searchWait -= delta;
      const allAway = cops.every(function (c) { return c.state === 'away' && c.timer > 1; });
      if (searchWait <= 0 && allAway) startSearch();
      return;
    }

    search.t -= delta;
    if (search.phase === 'warn') {
      if (search.t <= 0) {
        search.phase = 'sweep';
        search.t = SEARCH_SWEEP;
        node.beam.classList.remove('is-warn');
        node.beam.classList.add('is-on');
      }
      return;
    }

    // 불빛이 길을 쓸고 지나가요
    const k = 1 - search.t / SEARCH_SWEEP;
    search.x = search.from + (search.to - search.from) * k;
    node.beam.style.left = search.x + '%';

    if (!hidden && Math.abs(search.x - hero) < BEAM_HALF) {
      running = false;
      node.hero.classList.add('is-caught');
      node.warn.textContent = '손전등 불빛에 들켰다!';
      setTimeout(function () { onFail('손전등 불빛에 들켰어요!'); }, 700);
      return;
    }
    if (hidden && Math.abs(search.x - hero) < BEAM_HALF) node.hero.classList.add('is-lit');
    else node.hero.classList.remove('is-lit');

    if (search.t <= 0) {                         // 다 지나갔어요
      search = null;
      searchWait = MissionUtil.random(4.5, 6.5);
      node.beam.className = 'm1-beam';
      node.warn.classList.remove('is-on', 'is-search');
      drawPolice();                              // 신호를 원래대로
      node.hero.classList.remove('is-lit');
      pop('휴…', 'is-calm');
    }
  }

  /* 주인공을 지금 위치로 옮겨요 */
  function drawHero(moving) {
    node.hero.style.left = hero + '%';
    node.hero.classList.toggle('is-running', moving);
    node.hero.classList.toggle('is-hiding', hidden);
    node.barFill.style.width = hero + '%';
    node.scene.style.setProperty('--pan', hero);      // 배경이 천천히 따라 움직여요
    const near = nearSpot();
    node.spots.forEach(function (el, i) {
      el.classList.toggle('is-near', i === near);
      el.classList.toggle('is-used', i === near && hidden);
    });
  }


  /* ----------------------------------------------------------------
     4. 1초에 60번 반복되는 게임의 심장
     ---------------------------------------------------------------- */
  function loop(now) {
    if (!running) return;

    // 지난 번과 지금 사이에 몇 초가 흘렀는지 재요
    const delta = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;

    // 잠시 멈춤 중이면 아무것도 안 해요
    if (game.paused) {
      requestAnimationFrame(loop);
      return;
    }

    clock += delta;

    // (1) 경찰들의 상태를 시간에 따라 바꿔요
    //     (손전등이 지나가는 동안 경찰은 뒤돌아서 기다려요)
    cops.forEach(function (cop) {
      if (search) return;
      cop.timer -= delta;
      // 이쪽을 보고 있는 동안 시간을 세요 (봐주는 시간 계산에 써요)
      if (cop.state === 'watching') {
        cop.watched += delta;
        // 아슬아슬하게 멈췄어요!
        if (cop.closeCall && cop.watched > GRACE + 0.05) {
          cop.closeCall = false;
          pop('아슬아슬!', 'is-close');
        }
      }
      // 돌아보는 척만 하고 다시 돌아서요
      if (cop.state === 'warning' && cop.fakeAt > 0 && cop.timer <= cop.fakeAt) {
        cop.state = 'away';
        cop.timer = MissionUtil.random(1.6, 2.6);
        cop.timerMax = cop.timer;
        drawPolice();
        cop.wordNode.textContent = '…아무도 없군';
        return;
      }
      if (cop.timer <= 0) nextState(cop);
    });

    // (1-2) 손전등 수색
    updateSearch(delta);
    if (!running) return;

    // (2) 절반쯤 오면 두 번째 경찰이 나타나요!
    if (!secondCame && hero >= SECOND_AT) {
      addSecondCop();
    }

    // (3) 지금 앞으로 가라는 신호가 들어왔는지 확인해요
    const back = Input.dir.left && !Input.dir.right;   // ← 로 뒤로 물러날 수도 있어요 (숨을 곳으로!)
    const wantMove = Input.dir.right || Input.dir.up || mouseHold || back;

    // 숨을 곳 옆에서 ↓ 를 꾹 누르면 숨어요 (움직이면 다시 나와요)
    hidden = !wantMove && Input.dir.down && nearSpot() >= 0;

    if (wantMove) {
      // 경찰이 보고 있는데 계속 움직이면 들켜요!
      // (막 돌아본 순간에는 봐줘서, 얼른 멈추면 살 수 있어요)
      if (isCaught()) {
        running = false;
        showCaughtEffect();
        return;
      }
      // 안전하면 앞으로 나아가요
      hero = MissionUtil.clamp(hero + (back ? -SPEED : SPEED) * delta, 0, 100);
      lastMoveAt = clock;
      dustTimer -= delta;
      if (dustTimer <= 0) { dust(); dustTimer = 0.2; }
    }

    drawHero(wantMove);
    drawCountdown();

    // (4) 도착했으면 성공!
    if (hero >= 100) {
      running = false;
      showSuccessEffect();
      return;
    }

    requestAnimationFrame(loop);
  }


  /* ----------------------------------------------------------------
     5. 들켰을 때 / 성공했을 때
     ---------------------------------------------------------------- */
  function showCaughtEffect() {
    node.hero.classList.add('is-caught');   // 주인공이 붉게 물들어요
    cops.forEach(function (cop) {
      if (cop.state === 'watching') cop.node.classList.add('is-angry');
    });
    setTimeout(function () { onFail('움직이는 걸 경찰이 봤어요!'); }, 700);
  }

  function showSuccessEffect() {
    node.goal.classList.add('is-clear');    // 아지트 문이 밝게 빛나요
    setTimeout(function () { onSuccess(); }, 700);
  }


  /* ----------------------------------------------------------------
     6. 미션 시작하기
     ---------------------------------------------------------------- */
  function start(success, fail) {
    onSuccess = success;
    onFail = fail;

    // 처음 상태로 되돌려요
    hero = 0;
    cops = [];
    secondCame = false;
    mouseHold = false;
    running = true;
    clock = 0;
    lastMoveAt = -9;
    hidden = false;
    search = null;
    searchWait = 2.5;
    dustTimer = 0;

    // 화면을 그려요
    const stage = MissionUtil.setStage(
      '<div class="m1-scene">' +

        // 위쪽 : 일본 경찰들이 서는 자리
        // (처음엔 한 명, 절반쯤 가면 한 명이 더 나와요)
        '<div class="m1-cops"></div>' +

        // 가운데 : 신호등처럼 알려주는 글씨와 남은 시간 막대
        '<div class="m1-signal">' +
          '<div class="m1-light is-away">지금 달려!</div>' +
          '<div class="m1-count-bar"><div class="m1-count"></div></div>' +
        '</div>' +

        // 아래쪽 : 길과 주인공
        '<div class="m1-road">' +
          '<div class="m1-beam"></div>' +          // 손전등 불빛
          SPOTS.map(function (sp) {                // 숨을 곳 (짚단 · 장독 · 수레)
            return '<div class="m1-spot is-' + sp.kind + '" style="left:' + sp.x + '%">' +
                     '<span class="m1-spot-tip">↓ 숨기</span></div>';
          }).join('') +
          '<div class="m1-goal"></div>' +          // 비밀 아지트 (대문 모양)
          '<div class="m1-hero">' + MissionUtil.figure('hero') + '</div>' +
        '</div>' +

        // 두 번째 경찰이 나타날 때 뜨는 알림
        '<p class="m1-warn"></p>' +

        // 맨 아래 : 얼마나 왔는지 보여주는 막대
        '<div class="m1-bar"><div class="m1-bar-fill"></div></div>' +
        '<p class="m1-tip">오른쪽 방향키를 <b>꾹</b> 누르면 달려요 · ' +
        '「멈춰!」 가 뜨면 <b>얼른 손을 떼면</b> 살 수 있어요 · ' +
        '손전등이 오면 숨을 곳 옆에서 <b>↓</b></p>' +

      '</div>'
    );

    // 화면 조각들을 찾아서 기억해둬요
    node = {
      copsBox: stage.querySelector('.m1-cops'),
      light:   stage.querySelector('.m1-light'),
      count:   stage.querySelector('.m1-count'),
      hero:    stage.querySelector('.m1-hero'),
      goal:    stage.querySelector('.m1-goal'),
      barFill: stage.querySelector('.m1-bar-fill'),
      warn:    stage.querySelector('.m1-warn'),
      scene:   stage.querySelector('.m1-scene'),
      road:    stage.querySelector('.m1-road'),
      beam:    stage.querySelector('.m1-beam'),
      spots:   Array.prototype.slice.call(stage.querySelectorAll('.m1-spot')),
    };

    addCop('첫 번째 경찰', 3.4);   // 처음엔 넉넉히 달릴 수 있어요
    drawPolice();
    drawHero(false);

    // 마우스로 화면을 누르고 있어도 앞으로 가요
    stage.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      mouseHold = true;
    });
    window.addEventListener('pointerup', releaseMouse);

    // 심장을 뛰게 해요!
    lastTime = performance.now();
    requestAnimationFrame(loop);
  }

  function releaseMouse() { mouseHold = false; }


  /* ----------------------------------------------------------------
     경찰 한 명을 새로 만들어 화면에 세워요
     ---------------------------------------------------------------- */
  function addCop(name, firstTimer) {
    const box = document.createElement('div');
    box.className = 'm1-police is-away';
    box.innerHTML =
      '<span class="m1-word"></span>' +
      '<span class="m1-face">' + MissionUtil.figure('police') + '</span>' +
      '<span class="m1-copname">' + name + '</span>';

    node.copsBox.appendChild(box);

    cops.push({
      state: 'away',
      timer: firstTimer,
      watched: 0,          // 이쪽을 본 지 얼마나 됐는지 (봐주는 시간에 써요)
      node: box,
      wordNode: box.querySelector('.m1-word'),
      figNode: box.querySelector('.fig'),
    });
  }

  /* 절반쯤 왔을 때 두 번째 경찰이 나타나요.
     이제 두 경찰이 모두 뒤돌아야만 달릴 수 있어요! */
  function addSecondCop() {
    secondCame = true;
    addCop('두 번째 경찰', 2.2);

    node.warn.textContent = '경찰이 한 명 더 왔다! 둘 다 뒤돌아야 달릴 수 있다.';
    node.warn.classList.add('is-on');
    setTimeout(function () { node.warn.classList.remove('is-on'); }, 3000);

    if (window.Sound) Sound.alert();
    drawPolice();
  }


  /* ----------------------------------------------------------------
     7. 미션 정리하기 (다른 장으로 넘어갈 때 불러요)
     ---------------------------------------------------------------- */
  function stop() {
    running = false;
    mouseHold = false;
    window.removeEventListener('pointerup', releaseMouse);
  }


  /* 이 미션을 밖에서 쓸 수 있게 내보내요 */
  return {
    start: start,
    stop: stop,
    hint: '경찰이 뒤돌았을 때만 달려라. 「멈춰!」가 뜨면 멈추고, 손전등이 오면 짚단·장독·수레 옆에서 ↓ 로 숨어라.',
  };
})();
