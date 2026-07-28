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

  /* ★ 광장에 놓인 장애물이에요 (돌담과 수레).
     가로지를 수 없어서 빙 돌아가야 해요.
     x, y 는 왼쪽 위 모서리, w 는 너비, h 는 높이예요. */
  const WALLS = [
    { x: 10, y: 34, w: 26, h: 5, kind: 'wall' },   // 왼쪽 위 돌담
    { x: 46, y: 30, w: 24, h: 5, kind: 'wall' },   // 오른쪽 위 돌담
    { x: 60, y: 48, w: 5,  h: 22, kind: 'wall' },  // 오른쪽 세로 돌담
    { x: 16, y: 52, w: 5,  h: 24, kind: 'cart' },  // 왼쪽에 세워둔 수레
    { x: 34, y: 58, w: 20, h: 5,  kind: 'cart' },  // 가운데 아래 수레
  ];

  /* ★ 광장을 순찰하는 일본 경찰이에요.
     이 지점들을 차례대로 돌아요. 부딪히면 들켜요! */
  const COP_ROUTE = [
    { x: 86, y: 55 }, { x: 86, y: 88 }, { x: 66, y: 88 },
    { x: 66, y: 55 }, { x: 86, y: 55 },
  ];

  const COP_SPEED = 15;    // 경찰이 걷는 빠르기
  const COP_REACH = 8;     // 이만큼 가까워지면 들켜요
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
  let cop = null;                // 순찰하는 일본 경찰
  let running = false;
  let onFail = null;             // 들켰을 때 부를 함수
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

  /* 그 자리가 장애물 안인가요?
     주인공은 점이 아니라 조금 넓으니까 여유를 조금 둬요. */
  const PAD_X = 3;
  const PAD_Y = 5;

  function hitsWall(x, y) {
    return WALLS.some(function (w) {
      return x + PAD_X > w.x && x - PAD_X < w.x + w.w &&
             y + PAD_Y > w.y && y - PAD_Y < w.y + w.h;
    });
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

    /* 방향키를 누른 만큼 걸어가요 (네 방향 모두 돼요)
       가로와 세로를 따로 옮겨요. 그러면 담에 부딪혀도
       담을 따라 스르륵 미끄러져서 답답하지 않아요! */
    let nx = hero.x;
    let ny = hero.y;

    if (Input.dir.left)  nx = inField(nx - SPEED_X * delta);
    if (Input.dir.right) nx = inField(nx + SPEED_X * delta);
    if (!hitsWall(nx, hero.y)) hero.x = nx;      // 가로로 갈 수 있으면 가요

    if (Input.dir.up)    ny = inField(ny - SPEED_Y * delta);
    if (Input.dir.down)  ny = inField(ny + SPEED_Y * delta);
    if (!hitsWall(hero.x, ny)) hero.y = ny;      // 세로로 갈 수 있으면 가요

    drawHero();
    updateNearest();
    moveCop(delta);

    requestAnimationFrame(loop);
  }


  /* ----------------------------------------------------------------
     6-2. 순찰하는 일본 경찰
     ---------------------------------------------------------------- */
  function moveCop(delta) {
    if (!cop) return;

    const target = COP_ROUTE[cop.step];
    const dx = target.x - cop.x;
    const dy = target.y - cop.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 1.2) {
      // 다음 지점으로 방향을 바꿔요
      cop.step = (cop.step + 1) % COP_ROUTE.length;
    } else {
      // 목표 쪽으로 조금씩 걸어가요
      cop.x += (dx / dist) * COP_SPEED * delta;
      cop.y += (dy / dist) * COP_SPEED * delta * 1.7;
    }

    cop.node.style.left = cop.x + '%';
    cop.node.style.top  = cop.y + '%';

    // 주인공과 너무 가까워지면 들켜요!
    if (distance(hero, cop) < COP_REACH) {
      running = false;
      cop.node.querySelector('.fig').classList.add('is-looking');
      node.talk.textContent = '순찰하던 일본 경찰에게 들켰다!';
      node.talk.className = 'm4-talk is-bad';
      setTimeout(function () {
        onFail('만세운동을 준비하다 일본 경찰에게 들켰어요!');
      }, 800);
    }
  }


  /* ----------------------------------------------------------------
     7. 미션 시작하기
     ---------------------------------------------------------------- */
  function start(success, fail) {
    onSuccess = success;
    onFail = fail;

    hero = { x: 50, y: 88 };
    given = 0;
    nearest = -1;
    running = true;

    /* --- 장애물(돌담과 수레)을 그려요 --- */
    let wallsHtml = '';
    WALLS.forEach(function (w) {
      wallsHtml +=
        '<div class="m4-wall is-' + w.kind + '" style="' +
          'left:' + w.x + '%;top:' + w.y + '%;' +
          'width:' + w.w + '%;height:' + w.h + '%"></div>';
    });

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
          wallsHtml +
          peopleHtml +
          // 순찰하는 일본 경찰
          '<div class="m4-cop">' + MissionUtil.figure('police') + '</div>' +
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
      cop:       stage.querySelector('.m4-cop'),
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

    /* 순찰 경찰을 첫 자리에 세워요 */
    cop = {
      x: COP_ROUTE[0].x,
      y: COP_ROUTE[0].y,
      step: 1,
      node: node.cop,
    };
    cop.node.style.left = cop.x + '%';
    cop.node.style.top  = cop.y + '%';

    drawHero();
    drawCount();

    // 2번 버튼(말걸기)으로 태극기를 건네요
    Input.on('talk', giveFlag);
    Input.on('next', giveFlag);        // 4번 버튼으로도 돼요

    /* 마우스로 사람을 눌러도 태극기를 줄 수 있어요.
       단, 곁에 다가가 있을 때만요! (담을 뚫고 줄 수는 없어요) */
    people.forEach(function (person, i) {
      person.node.addEventListener('click', function () {
        if (person.done || !running) return;
        if (distance(hero, PEOPLE[i]) > REACH) {
          node.talk.textContent = '너무 멀어요. 곁으로 다가가야 한다.';
          node.talk.className = 'm4-talk';
          return;
        }
        nearest = i;
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
    hint: '담과 수레를 돌아 사람들에게 태극기를 나누어 주어라. 순찰하는 일본 경찰을 조심할 것.',
  };
})();
