/* ==================================================================
   4장 · 만세운동 준비  (ch4.js)

   유관순을 만나 만세운동을 준비해요.
   광장에 모인 사람들에게 태극기를 나누어 주고
   독립의 뜻을 알리면 성공이에요.

   - 태극기 하나를 전할 때마다 독립 포인트 +3점 (5명이면 15점)
   - 3장 미로와 달리 칸이 없어요. 광장을 자유롭게 걸어 다녀요.

   조작 : 스틱(방향키)으로 걸어다니고
          사람 곁에 다가가서 2번 버튼(말걸기)을 눌러요
   ================================================================== */

MISSIONS[4] = (function () {

  /* ----------------------------------------------------------------
     1. 광장에 모인 사람들
        x, y 는 광장 안에서의 자리예요 (0~100 사이의 값)
        say 는 태극기를 받고 하는 말이에요
     ---------------------------------------------------------------- */
  const PEOPLE = [
    { x: 20, y: 24, say: '고맙습니다! 이 깃발을 꼭 들겠습니다.' },
    { x: 47, y: 15, say: '우리 손으로 나라를 되찾읍시다.' },
    { x: 76, y: 28, say: '아이들에게도 나누어 주겠소.' },
    { x: 30, y: 72, say: '두렵지만, 함께라면 할 수 있습니다.' },
    { x: 72, y: 76, say: '대한 독립 만세!' },
  ];

  const YU = { x: 50, y: 47 };      // 유관순이 서 있는 자리
  const POINT_PER_FLAG = 3;         // 태극기 하나를 전할 때마다 주는 점수
  const REACH = 11;                 // 이만큼 가까이 가야 말을 걸 수 있어요

  /* 걷는 빠르기 (1초에 몇 칸 가는지)
     광장이 가로로 길어서, 위아래는 조금 더 빠르게 해야
     걷는 느낌이 똑같아 보여요. */
  const SPEED_X = 32;
  const SPEED_Y = 56;


  /* ----------------------------------------------------------------
     2. 이 미션이 기억해야 할 것들
     ---------------------------------------------------------------- */
  let hero = { x: 50, y: 88 };   // 주인공은 광장 아래쪽에서 시작해요
  let people = [];               // 사람 5명의 상태
  let given = 0;                 // 지금까지 나눠준 태극기 수
  let nearest = -1;              // 지금 가장 가까운 사람 번호 (없으면 -1)
  let running = false;
  let lastTime = 0;
  let onSuccess = null;
  let node = {};


  /* ----------------------------------------------------------------
     3. 도우미
     ---------------------------------------------------------------- */

  /* 두 자리가 얼마나 떨어져 있는지 재요.
     광장이 가로로 기니까 세로 거리는 조금 크게 쳐줘요. */
  function distance(a, b) {
    const dx = a.x - b.x;
    const dy = (a.y - b.y) * 0.55;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /* 숫자를 0~100 사이로 붙잡아 둬요 (광장 밖으로 못 나가게) */
  function inField(value) {
    return MissionUtil.clamp(value, 4, 96);
  }


  /* ----------------------------------------------------------------
     4. 화면 그리기
     ---------------------------------------------------------------- */

  function drawHero() {
    node.hero.style.left = hero.x + '%';
    node.hero.style.top  = hero.y + '%';
  }

  /* 남은 태극기 개수를 보여줘요 */
  function drawCount() {
    const left = PEOPLE.length - given;
    node.count.innerHTML = '';
    for (let i = 0; i < PEOPLE.length; i++) {
      node.count.innerHTML +=
        '<span class="m4-flagmark' + (i < left ? '' : ' is-used') + '"></span>';
    }
    node.countText.textContent = '남은 태극기 ' + left + '개';
  }

  /* 가장 가까운 사람을 찾아서, 말을 걸 수 있으면 표시해줘요 */
  function updateNearest() {
    let best = -1;
    let bestDist = REACH;

    people.forEach(function (person, i) {
      if (person.done) return;                  // 이미 준 사람은 넘어가요
      const d = distance(hero, PEOPLE[i]);
      if (d < bestDist) { bestDist = d; best = i; }
    });

    if (best === nearest) return;               // 달라진 게 없으면 그냥 둬요
    nearest = best;

    // 모든 사람의 '말걸기' 표시를 껐다가
    people.forEach(function (person) {
      person.node.classList.remove('is-near');
    });
    // 가장 가까운 한 사람만 켜요
    if (nearest >= 0) people[nearest].node.classList.add('is-near');
  }


  /* ----------------------------------------------------------------
     5. 태극기 건네주기 (2번 버튼 · 말걸기)
     ---------------------------------------------------------------- */
  function giveFlag() {
    if (!running) return;
    if (nearest < 0) {
      // 아무도 곁에 없어요
      node.talk.textContent = '사람들 곁으로 다가가야 한다.';
      node.talk.className = 'm4-talk';
      return;
    }

    const person = people[nearest];
    person.done = true;
    person.node.classList.remove('is-near');
    person.node.classList.add('is-done');       // 태극기를 든 모습으로 바뀌어요

    given += 1;
    addScore(POINT_PER_FLAG);                   // 한 명당 3점!
    drawCount();

    node.talk.textContent = '「 ' + PEOPLE[nearest].say + ' 」';
    node.talk.className = 'm4-talk is-good';

    nearest = -1;

    /* 다섯 명 모두에게 나누어 주었나요? */
    if (given >= PEOPLE.length) {
      running = false;
      node.talk.textContent = '유관순 : 이제 다 함께 만세를 부를 때입니다!';
      node.field.classList.add('is-ready');     // 광장이 환해져요
      if (window.Sound) Sound.fanfare();
      setTimeout(onSuccess, 1600);
    }
  }


  /* ----------------------------------------------------------------
     6. 1초에 60번 반복되는 게임의 심장
     ---------------------------------------------------------------- */
  function loop(now) {
    if (!running) return;

    const delta = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;

    if (game.paused) {                // 잠시 멈춤 중이면 쉬어요
      requestAnimationFrame(loop);
      return;
    }

    // 방향키를 누른 만큼 걸어가요 (네 방향 모두 돼요)
    if (Input.dir.left)  hero.x = inField(hero.x - SPEED_X * delta);
    if (Input.dir.right) hero.x = inField(hero.x + SPEED_X * delta);
    if (Input.dir.up)    hero.y = inField(hero.y - SPEED_Y * delta);
    if (Input.dir.down)  hero.y = inField(hero.y + SPEED_Y * delta);

    drawHero();
    updateNearest();

    requestAnimationFrame(loop);
  }


  /* ----------------------------------------------------------------
     7. 미션 시작하기
     ---------------------------------------------------------------- */
  function start(success) {
    onSuccess = success;

    hero = { x: 50, y: 88 };
    given = 0;
    nearest = -1;
    running = true;

    /* --- 사람 5명을 그려요 --- */
    let peopleHtml = '';
    PEOPLE.forEach(function (person, i) {
      peopleHtml +=
        '<div class="m4-person" data-person="' + i + '" ' +
             'style="left:' + person.x + '%;top:' + person.y + '%">' +
          MissionUtil.figure('mate') +
          '<span class="m4-bubble">2</span>' +   // 말걸기 표시
          '<span class="m4-gotflag"></span>' +   // 받은 태극기
        '</div>';
    });

    const stage = MissionUtil.setStage(
      '<div class="m4-scene">' +

        '<div class="m4-head">' +
          '<span class="m4-count"></span>' +
          '<span class="m4-count-text"></span>' +
        '</div>' +

        '<div class="m4-field">' +
          peopleHtml +
          // 유관순은 광장 가운데에 서 있어요
          '<div class="m4-yu" style="left:' + YU.x + '%;top:' + YU.y + '%">' +
            MissionUtil.figure('yu', 'is-looking') +
            '<span class="m4-name">유관순</span>' +
          '</div>' +
          '<div class="m4-hero" style="left:' + hero.x + '%;top:' + hero.y + '%">' +
            MissionUtil.figure('hero') +
          '</div>' +
        '</div>' +

        '<p class="m4-talk">유관순 : 이 태극기를 사람들에게 나누어 주세요.</p>' +
        '<p class="m4-tip">' +
          '<span class="m3-key">스틱</span> 걸어다니기 &nbsp;·&nbsp; ' +
          '<span class="m3-key">2번</span> 곁에 있는 사람에게 태극기 건네기' +
        '</p>' +

      '</div>'
    );

    node = {
      field:     stage.querySelector('.m4-field'),
      hero:      stage.querySelector('.m4-hero'),
      count:     stage.querySelector('.m4-count'),
      countText: stage.querySelector('.m4-count-text'),
      talk:      stage.querySelector('.m4-talk'),
    };

    people = PEOPLE.map(function (person, i) {
      return {
        done: false,
        node: stage.querySelector('[data-person="' + i + '"]'),
      };
    });

    drawHero();
    drawCount();

    // 2번 버튼(말걸기)으로 태극기를 건네요
    Input.on('talk', giveFlag);
    Input.on('next', giveFlag);        // 4번 버튼으로도 돼요

    // 마우스로 사람을 눌러도 태극기를 줄 수 있어요
    people.forEach(function (person, i) {
      person.node.addEventListener('click', function () {
        if (person.done) return;
        // 그 사람 곁으로 순간 이동한 것처럼 처리해요
        hero.x = PEOPLE[i].x;
        hero.y = PEOPLE[i].y + 8;
        drawHero();
        updateNearest();
        giveFlag();
      });
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
    hint: '광장을 돌아다니며 사람들에게 태극기를 나누어 주어라. 곁에 서서 2번 버튼을 누른다.',
  };
})();
