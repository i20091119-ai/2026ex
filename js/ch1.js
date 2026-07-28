/* ==================================================================
   1장 · 비밀 편지  (ch1.js)

   ★ 놀이 방법은 '무궁화 꽃이 피었습니다' 와 똑같아요!

   - 일본 경찰이 뒤를 돌아보고 있을 때(🙈) 앞으로 달려요
   - 경찰이 이쪽을 볼 때(👀) 움직이면 들켜요!
   - 오른쪽 끝 비밀 아지트까지 편지를 전달하면 성공이에요

   조작 : 오른쪽 방향키(또는 스틱 오른쪽)를 꾹 누르면 앞으로 가요
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

  let onSuccess = null;    // 성공하면 부를 함수
  let onFail = null;       // 들키면 부를 함수

  let node = {};           // 화면 조각들을 담아둘 곳

  /* 주인공이 달리는 빠르기 (1초에 몇 칸 가는지)
     숫자를 줄이면 길이 길어져서 게임이 오래 걸려요. */
  const SPEED = 12;

  /* 절반쯤 왔을 때 두 번째 경찰이 나타나요.
     그때부터는 두 경찰이 모두 뒤돌아야 달릴 수 있어요! */
  const SECOND_AT = 45;


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
      // 갈수록 '돌아본다!' 신호가 짧아져서 더 급해져요
      cop.timer = MissionUtil.clamp(0.78 - hard * 0.3, 0.34, 0.85);

    } else if (cop.state === 'warning') {
      cop.state = 'watching';
      cop.timer = MissionUtil.random(1.1, 2.1) + hard * 0.5;
      if (window.Sound) Sound.alert();       // 삐빅! 조심하라는 소리

    } else {
      cop.state = 'away';
      // 갈수록 달릴 수 있는 시간이 짧아져요
      cop.timer = MissionUtil.clamp(MissionUtil.random(2.6, 3.8) - hard * 1.3, 1.0, 3.8);
    }

    drawPolice();
  }

  /* 지금 달려도 되나요?  경찰이 한 명이라도 보고 있으면 안 돼요! */
  function isWatched() {
    return cops.some(function (cop) { return cop.state === 'watching'; });
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

  /* 주인공을 지금 위치로 옮겨요 */
  function drawHero(moving) {
    node.hero.style.left = hero + '%';
    node.hero.classList.toggle('is-running', moving);
    node.barFill.style.width = hero + '%';
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

    // (1) 경찰들의 상태를 시간에 따라 바꿔요
    cops.forEach(function (cop) {
      cop.timer -= delta;
      if (cop.timer <= 0) nextState(cop);
    });

    // (2) 절반쯤 오면 두 번째 경찰이 나타나요!
    if (!secondCame && hero >= SECOND_AT) {
      addSecondCop();
    }

    // (3) 지금 앞으로 가라는 신호가 들어왔는지 확인해요
    const wantMove = Input.dir.right || Input.dir.up || mouseHold;

    if (wantMove) {
      // 경찰이 한 명이라도 보고 있는데 움직이면 들켜요!
      if (isWatched()) {
        running = false;
        showCaughtEffect();
        return;
      }
      // 안전하면 앞으로 나아가요
      hero = MissionUtil.clamp(hero + SPEED * delta, 0, 100);
    }

    drawHero(wantMove);

    // (3) 도착했으면 성공!
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

    // 화면을 그려요
    const stage = MissionUtil.setStage(
      '<div class="m1-scene">' +

        // 위쪽 : 일본 경찰들이 서는 자리
        // (처음엔 한 명, 절반쯤 가면 한 명이 더 나와요)
        '<div class="m1-cops"></div>' +

        // 가운데 : 신호등처럼 알려주는 글씨
        '<div class="m1-light is-away">지금 달려!</div>' +

        // 아래쪽 : 길과 주인공
        '<div class="m1-road">' +
          '<div class="m1-goal"></div>' +          // 비밀 아지트 (대문 모양)
          '<div class="m1-hero">' + MissionUtil.figure('hero') + '</div>' +
        '</div>' +

        // 두 번째 경찰이 나타날 때 뜨는 알림
        '<p class="m1-warn"></p>' +

        // 맨 아래 : 얼마나 왔는지 보여주는 막대
        '<div class="m1-bar"><div class="m1-bar-fill"></div></div>' +
        '<p class="m1-tip">오른쪽 방향키를 <b>꾹</b> 누르면 달려요 ' +
        '(마우스로 화면을 눌러도 돼요)</p>' +

      '</div>'
    );

    // 화면 조각들을 찾아서 기억해둬요
    node = {
      copsBox: stage.querySelector('.m1-cops'),
      light:   stage.querySelector('.m1-light'),
      hero:    stage.querySelector('.m1-hero'),
      goal:    stage.querySelector('.m1-goal'),
      barFill: stage.querySelector('.m1-bar-fill'),
      warn:    stage.querySelector('.m1-warn'),
    };

    addCop('첫 번째 경찰', 2.6);   // 첫 경찰이 서 있어요
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
      node: box,
      wordNode: box.querySelector('.m1-word'),
      figNode: box.querySelector('.fig'),
    });
  }

  /* 절반쯤 왔을 때 두 번째 경찰이 나타나요.
     이제 두 경찰이 모두 뒤돌아야만 달릴 수 있어요! */
  function addSecondCop() {
    secondCame = true;
    addCop('두 번째 경찰', 1.4);

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
    hint: '경찰이 뒤돌았을 때만 달려라. 눈이 보이면 그 자리에 멈춰야 한다.',
  };
})();
