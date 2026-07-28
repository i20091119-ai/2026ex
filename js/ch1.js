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
  let policeState = '';    // 경찰이 지금 무엇을 하는지
  let stateTimer = 0;      // 지금 상태가 얼마나 남았는지 (초)
  let running = false;     // 미션이 진행 중인지
  let mouseHold = false;   // 마우스를 누르고 있는지
  let lastTime = 0;        // 시간을 재려고 기억해두는 값

  let onSuccess = null;    // 성공하면 부를 함수
  let onFail = null;       // 들키면 부를 함수

  let node = {};           // 화면 조각들을 담아둘 곳

  /* 주인공이 달리는 빠르기 (1초에 몇 칸 가는지) */
  const SPEED = 26;


  /* ----------------------------------------------------------------
     2. 경찰의 세 가지 상태

     'away'    🙈 뒤돌아 있음  → 지금이 달릴 기회!
     'warning' 🤔 돌아보려고 함 → 얼른 멈춰야 해요
     'watching'👀 이쪽을 봄     → 움직이면 들켜요!
     ---------------------------------------------------------------- */
  function nextPoliceState() {
    // 도착에 가까워질수록 어려워져요 (기획서: 점점 어려워진다)
    const hard = hero / 100;          // 0에서 시작해 1까지 커져요

    if (policeState === 'away') {
      policeState = 'warning';
      // 갈수록 '돌아본다!' 신호가 짧아져서 더 급해져요
      stateTimer = MissionUtil.random(0.75, 0.5) - hard * 0.25;
      stateTimer = MissionUtil.clamp(stateTimer, 0.32, 0.8);

    } else if (policeState === 'warning') {
      policeState = 'watching';
      stateTimer = MissionUtil.random(1.0, 2.0) + hard * 0.6;
      if (window.Sound) Sound.alert();       // 삐빅! 조심하라는 소리

    } else {
      policeState = 'away';
      // 갈수록 달릴 수 있는 시간이 짧아져요
      stateTimer = MissionUtil.random(2.2, 3.4) - hard * 1.2;
      stateTimer = MissionUtil.clamp(stateTimer, 0.9, 3.4);
    }

    drawPolice();
  }


  /* ----------------------------------------------------------------
     3. 화면 그리기
     ---------------------------------------------------------------- */

  /* 경찰의 얼굴과 말풍선을 바꿔요 */
  function drawPolice() {
    if (!node.police) return;

    const words = { away: '......', warning: '음?', watching: '누구냐!' };
    node.policeWord.textContent = words[policeState];

    // 이쪽을 볼 때만 실루엣에 눈이 반짝 나타나요
    node.policeFig.classList.toggle('is-looking', policeState === 'watching');

    // 상태에 따라 색이 바뀌어요 (초록=안전, 노랑=조심, 빨강=위험)
    node.police.className = 'm1-police is-' + policeState;
    node.light.className = 'm1-light is-' + policeState;

    const lightWords = { away: '지금 달려!', warning: '멈출 준비!', watching: '멈춰!' };
    node.light.textContent = lightWords[policeState];
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

    // (1) 경찰 상태를 시간에 따라 바꿔요
    stateTimer -= delta;
    if (stateTimer <= 0) nextPoliceState();

    // (2) 지금 앞으로 가라는 신호가 들어왔는지 확인해요
    const wantMove = Input.dir.right || Input.dir.up || mouseHold;

    if (wantMove) {
      // 경찰이 보고 있는데 움직이면 들켜요!
      if (policeState === 'watching') {
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
    node.police.classList.add('is-angry');
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
    policeState = 'away';
    stateTimer = 2.5;
    mouseHold = false;
    running = true;

    // 화면을 그려요
    const stage = MissionUtil.setStage(
      '<div class="m1-scene">' +

        // 위쪽 : 일본 경찰 (실루엣으로 그렸어요)
        '<div class="m1-police is-away">' +
          '<span class="m1-word"></span>' +
          '<span class="m1-face">' + MissionUtil.figure('police') + '</span>' +
        '</div>' +

        // 가운데 : 신호등처럼 알려주는 글씨
        '<div class="m1-light is-away">지금 달려!</div>' +

        // 아래쪽 : 길과 주인공
        '<div class="m1-road">' +
          '<div class="m1-goal"></div>' +          // 비밀 아지트 (대문 모양)
          '<div class="m1-hero">' + MissionUtil.figure('hero') + '</div>' +
        '</div>' +

        // 맨 아래 : 얼마나 왔는지 보여주는 막대
        '<div class="m1-bar"><div class="m1-bar-fill"></div></div>' +
        '<p class="m1-tip">오른쪽 방향키를 <b>꾹</b> 누르면 달려요 ' +
        '(마우스로 화면을 눌러도 돼요)</p>' +

      '</div>'
    );

    // 화면 조각들을 찾아서 기억해둬요
    node = {
      police:     stage.querySelector('.m1-police'),
      policeFace: stage.querySelector('.m1-face'),
      policeFig:  stage.querySelector('.m1-face .fig'),
      heroFig:    stage.querySelector('.m1-hero .fig'),
      policeWord: stage.querySelector('.m1-word'),
      light:      stage.querySelector('.m1-light'),
      hero:       stage.querySelector('.m1-hero'),
      goal:       stage.querySelector('.m1-goal'),
      barFill:    stage.querySelector('.m1-bar-fill'),
    };

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
