/* ==================================================================
   3장 · 태극기 지키기  (ch3.js)

   미로를 돌아다니며 숨겨진 태극기를 찾고,
   안전한 곳으로 무사히 옮기면 성공이에요.

   ★ 일본 경찰이 두 종류 나와요!

     1) 순찰 경찰 🚶 : 정해진 길을 왔다 갔다 해요.
                       움직임을 잘 보고 타이밍을 맞춰 지나가세요.

     2) 보초 경찰 🧍 : 길목에 가만히 서서 지켜요.
                       빨갛게 표시된 경계 구역에 들어가면 들켜요.
                       다른 길로 돌아가야 해요!

   조작 : 스틱(방향키)으로 네 방향 움직이기
   ================================================================== */

MISSIONS[3] = (function () {

  /* ----------------------------------------------------------------
     1. 미로 지도
        '#' 은 벽, '.' 은 지나갈 수 있는 길이에요.
     ---------------------------------------------------------------- */
  const MAZE = [
    '#####################',
    '#.......#.....#.....#',
    '#.#.#.#.###.#.#.#.#.#',
    '#.....#.....#.......#',
    '#.#.###.#.#.#####.#.#',
    '#.#.#...............#',
    '#.#.#.###.#####.#.#.#',
    '#...#.#.............#',
    '#.#.#.#.###.###.#.#.#',
    '#.........#.........#',
    '#.###.###.###.#.###.#',
    '#.......#...........#',
    '#####################',
  ];

  const ROWS = MAZE.length;      // 세로 칸 수 (13)
  const COLS = MAZE[0].length;   // 가로 칸 수 (21)

  const START = { r: 1, c: 1 };    // 주인공이 출발하는 곳
  const SAFE  = { r: 11, c: 1 };   // 태극기를 모두 가져가야 할 안전한 곳

  /* ★ 태극기 5장이 미로 곳곳에 따로 숨겨져 있어요!
     다섯 장을 모두 찾아야 안전한 곳으로 갈 수 있어요. */
  const FLAGS = [
    { r: 1,  c: 9  },
    { r: 1,  c: 19 },
    { r: 7,  c: 13 },
    { r: 11, c: 5  },
    { r: 11, c: 19 },
  ];

  /* 보초 경찰이 서 있는 자리예요.
     이 자리와 바로 옆 칸이 '경계 구역'이 돼요.
     세 명 모두 피해도 태극기를 다 모을 수 있는지 미리 확인했어요. */
  const GUARDS = [
    { r: 3,  c: 19 },
    { r: 5,  c: 12 },
    { r: 10, c: 15 },
  ];

  /* 순찰 경찰이 왔다 갔다 하는 길이에요.

     ★ 중요 : 순찰 경찰이 걷는 복도를 통째로 피해도
       태극기 다섯 장과 안전한 곳에 모두 갈 수 있는지 확인했어요.
       그래서 부딪힐 것 같으면 언제든 다른 길로 돌아가면 돼요! */
  const PATROLS = [
    [ { r: 1, c: 2 },  { r: 1, c: 7 }  ],   // 출발 근처 위쪽 복도
    [ { r: 2, c: 7 },  { r: 5, c: 7 }  ],   // 왼쪽 가운데 세로 복도
    [ { r: 2, c: 19 }, { r: 7, c: 19 } ],   // 오른쪽 끝 세로 복도
  ];

  /* 게임 빠르기 (숫자가 작을수록 빨라요, 단위는 밀리초) */
  const HERO_STEP   = 135;   // 주인공이 한 칸 움직이는 데 걸리는 시간
  const PATROL_STEP = 420;   // 순찰 경찰이 한 칸 움직이는 시간


  /* ----------------------------------------------------------------
     2. 이 미션이 기억해야 할 것들
     ---------------------------------------------------------------- */
  let hero = { r: 0, c: 0 };
  let taken = [];             // 주운 태극기 번호들
  let patrols = [];           // 순찰 경찰들의 상태
  let dangerCells = [];       // 보초 경찰의 경계 구역
  let running = false;
  let heroTimer = 0;          // 주인공이 다음에 움직일 수 있는 시각
  let lastTime = 0;
  let onSuccess = null;
  let onFail = null;
  let node = {};


  /* ----------------------------------------------------------------
     3. 미로를 다루는 도우미들
     ---------------------------------------------------------------- */

  /* 그 칸이 지나갈 수 있는 길인가요? */
  function isOpen(r, c) {
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return false;
    return MAZE[r][c] === '.';
  }

  /* 두 칸이 같은 자리인가요? */
  function same(a, b) { return a.r === b.r && a.c === b.c; }

  /* 보초 경찰의 경계 구역을 만들어요.
     보초가 선 칸 + 바로 옆 네 칸이 위험해요. */
  function makeDangerCells() {
    const list = [];
    GUARDS.forEach(function (g) {
      list.push({ r: g.r, c: g.c });
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) {
        const r = g.r + d[0];
        const c = g.c + d[1];
        if (isOpen(r, c)) list.push({ r: r, c: c });
      });
    });
    return list;
  }

  /* 그 칸이 보초의 경계 구역인가요? */
  function isDanger(pos) {
    return dangerCells.some(function (d) { return same(d, pos); });
  }

  /* 어떤 칸에서 다른 칸까지 가는 가장 짧은 길을 찾아줘요.
     (미로에서 길 찾기는 '너비 우선 탐색'이라는 방법을 써요.
      가까운 칸부터 하나씩 넓게 퍼져나가며 찾는 방법이에요.) */
  function findPath(from, to) {
    const came = {};                       // 어디에서 왔는지 적어두는 곳
    const queue = [from];
    came[from.r + ',' + from.c] = null;

    while (queue.length > 0) {
      const now = queue.shift();
      if (same(now, to)) break;            // 목적지에 도착했어요!

      const around = [
        { r: now.r - 1, c: now.c },
        { r: now.r + 1, c: now.c },
        { r: now.r, c: now.c - 1 },
        { r: now.r, c: now.c + 1 },
      ];

      for (const next of around) {
        const key = next.r + ',' + next.c;
        if (isOpen(next.r, next.c) && came[key] === undefined) {
          came[key] = now;
          queue.push(next);
        }
      }
    }

    // 도착지에서 거꾸로 되짚어서 길을 완성해요
    const path = [];
    let cur = to;
    while (cur && came[cur.r + ',' + cur.c] !== undefined) {
      path.unshift(cur);
      cur = came[cur.r + ',' + cur.c];
    }
    return path;   // [첫걸음, 둘째걸음, ... , 도착]
  }


  /* ----------------------------------------------------------------
     4. 화면 그리기
     ---------------------------------------------------------------- */

  /* 어떤 칸의 화면 위치를 알려줘요 (퍼센트로) */
  function cellStyle(pos) {
    return 'left:' + (pos.c * 100 / COLS) + '%;' +
           'top:'  + (pos.r * 100 / ROWS) + '%;';
  }

  /* 주인공을 지금 칸으로 옮겨요 */
  function drawHero() {
    node.hero.style.left = (hero.c * 100 / COLS) + '%';
    node.hero.style.top  = (hero.r * 100 / ROWS) + '%';
    node.hero.classList.toggle('has-flag', taken.length > 0);
  }

  /* 순찰 경찰들을 지금 칸으로 옮겨요 */
  function drawPatrols() {
    patrols.forEach(function (cop) {
      cop.node.style.left = (cop.pos.c * 100 / COLS) + '%';
      cop.node.style.top  = (cop.pos.r * 100 / ROWS) + '%';
    });
  }

  /* 위쪽에 남은 태극기 개수를 그려요 */
  function drawCount() {
    let html = '';
    for (let i = 0; i < FLAGS.length; i++) {
      html += '<span class="m3-mark' +
              (taken.indexOf(i) !== -1 ? ' is-got' : '') + '"></span>';
    }
    node.count.innerHTML = html;
    node.countText.textContent = '찾은 태극기 ' + taken.length + ' / ' + FLAGS.length;
  }

  /* 위쪽 안내 글을 바꿔요 */
  function setNotice(text, kind) {
    node.notice.textContent = text;
    node.notice.className = 'm3-notice' + (kind ? ' is-' + kind : '');
  }


  /* ----------------------------------------------------------------
     5. 주인공 움직이기
     ---------------------------------------------------------------- */
  function moveHero(now) {
    if (now < heroTimer) return;         // 아직 다음 걸음 차례가 아니에요

    let dr = 0, dc = 0;
    if (Input.dir.up)         dr = -1;
    else if (Input.dir.down)  dr = 1;
    else if (Input.dir.left)  dc = -1;
    else if (Input.dir.right) dc = 1;

    if (dr === 0 && dc === 0) return;    // 아무 방향도 안 눌렀어요

    const next = { r: hero.r + dr, c: hero.c + dc };
    if (!isOpen(next.r, next.c)) return; // 벽이라서 못 가요

    hero = next;
    heroTimer = now + HERO_STEP;
    drawHero();

    /* --- 보초의 경계 구역에 들어갔나요? --- */
    if (isDanger(hero)) {
      lose('보초를 서던 일본 경찰에게 들켰어요!');
      return;
    }

    /* --- 태극기가 숨겨진 칸에 도착했나요? --- */
    FLAGS.forEach(function (flag, i) {
      if (taken.indexOf(i) !== -1) return;      // 이미 주운 태극기예요
      if (!same(hero, flag)) return;

      taken.push(i);
      node.flags[i].classList.add('is-taken');
      drawCount();
      if (window.Sound) Sound.ding();

      const left = FLAGS.length - taken.length;
      if (left > 0) {
        setNotice('태극기를 찾았다!  아직 ' + left + '장 더 남았다.', 'good');
      } else {
        node.safe.classList.add('is-active');
        setNotice('다섯 장을 모두 찾았다! 안전한 곳으로 옮겨라.', 'good');
      }
      drawHero();
    });

    /* --- 태극기를 모두 들고 안전한 곳에 도착했나요? --- */
    if (taken.length >= FLAGS.length && same(hero, SAFE)) {
      running = false;
      setNotice('태극기 다섯 장을 모두 안전하게 지켜냈다!', 'good');
      setTimeout(onSuccess, 900);
    }
  }


  /* ----------------------------------------------------------------
     6. 순찰 경찰 움직이기
     ---------------------------------------------------------------- */
  function movePatrols(now) {
    patrols.forEach(function (cop) {
      if (now < cop.nextMove) return;    // 아직 움직일 차례가 아니에요
      cop.nextMove = now + PATROL_STEP;

      let target = cop.route[cop.routeIndex];

      // 순찰 지점에 도착했으면 다음 지점으로 방향을 바꿔요
      if (same(cop.pos, target)) {
        cop.routeIndex = (cop.routeIndex + 1) % cop.route.length;
        target = cop.route[cop.routeIndex];
      }

      const path = findPath(cop.pos, target);
      if (path.length > 0) cop.pos = path[0];   // 한 칸만 움직여요
    });

    drawPatrols();

    // 순찰 경찰과 부딪혔나요?
    for (const cop of patrols) {
      if (same(cop.pos, hero)) {
        lose('순찰하던 일본 경찰과 마주쳤어요!');
        return;
      }
    }
  }


  /* ----------------------------------------------------------------
     7. 들켰을 때
     ---------------------------------------------------------------- */
  function lose(reason) {
    running = false;
    node.hero.classList.add('is-caught');
    setNotice(reason, 'bad');
    setTimeout(function () { onFail(reason); }, 800);
  }


  /* ----------------------------------------------------------------
     8. 1초에 60번 반복되는 게임의 심장
     ---------------------------------------------------------------- */
  function loop(now) {
    if (!running) return;

    const delta = Math.min(now - lastTime, 50);
    lastTime = now;

    if (game.paused) {                   // 잠시 멈춤 중이면 쉬어요
      // 멈춘 동안 시간이 흐르지 않게 시각을 뒤로 미뤄요
      heroTimer += delta;
      patrols.forEach(function (cop) { cop.nextMove += delta; });
      requestAnimationFrame(loop);
      return;
    }

    moveHero(now);
    if (running) movePatrols(now);
    if (running) requestAnimationFrame(loop);
  }


  /* ----------------------------------------------------------------
     9. 미션 시작하기
     ---------------------------------------------------------------- */
  function start(success, fail) {
    onSuccess = success;
    onFail = fail;

    hero = { r: START.r, c: START.c };
    taken = [];
    running = true;
    heroTimer = 0;
    dangerCells = makeDangerCells();

    /* --- 미로 벽을 그려요 --- */
    let html = '';
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (MAZE[r][c] === '#') {
          html += '<div class="m3-wall" style="' + cellStyle({ r: r, c: c }) + '"></div>';
        }
      }
    }

    /* --- 보초의 경계 구역을 빨갛게 칠해요 --- */
    dangerCells.forEach(function (d) {
      html += '<div class="m3-danger" style="' + cellStyle(d) + '"></div>';
    });

    /* --- 태극기 5장과 안전한 곳 --- */
    FLAGS.forEach(function (flag, i) {
      html += '<div class="m3-item m3-flagcell" data-flag="' + i + '" style="' +
              cellStyle(flag) + '"></div>';
    });
    html += '<div class="m3-item m3-safecell" style="' + cellStyle(SAFE) + '"></div>';

    /* --- 보초 경찰 (가만히 서 있어요) --- */
    GUARDS.forEach(function (g) {
      html += '<div class="m3-actor m3-guard" style="' + cellStyle(g) + '">' +
              MissionUtil.figure('police', 'is-looking') + '</div>';
    });

    /* --- 순찰 경찰 (움직여요) --- */
    PATROLS.forEach(function (route, i) {
      html += '<div class="m3-actor m3-cop" data-cop="' + i + '" style="' +
              cellStyle(route[0]) + '">' + MissionUtil.figure('police') + '</div>';
    });

    /* --- 주인공 --- */
    html += '<div class="m3-actor m3-hero" style="' + cellStyle(START) + '">' +
            MissionUtil.figure('hero') + '</div>';

    const stage = MissionUtil.setStage(
      '<div class="m3-scene">' +
        '<div class="m3-head">' +
          '<span class="m3-count"></span>' +
          '<span class="m3-count-text"></span>' +
        '</div>' +
        '<p class="m3-notice">숨겨진 태극기 다섯 장을 모두 찾아라. 붉은 곳은 보초가 지키고 있다.</p>' +
        '<div class="m3-maze" style="--cols:21;--rows:13">' + html + '</div>' +
        '<p class="m3-tip">' +
          '<span class="m3-key">스틱</span> 네 방향 이동 &nbsp;·&nbsp; ' +
          '<span class="m3-legend m3-legend-guard"></span> 보초(붉은 곳 금지) &nbsp;·&nbsp; ' +
          '<span class="m3-legend m3-legend-cop"></span> 순찰(부딪히면 들킴)' +
        '</p>' +
      '</div>'
    );

    node = {
      notice:    stage.querySelector('.m3-notice'),
      hero:      stage.querySelector('.m3-hero'),
      flags:     Array.prototype.slice.call(stage.querySelectorAll('.m3-flagcell')),
      safe:      stage.querySelector('.m3-safecell'),
      count:     stage.querySelector('.m3-count'),
      countText: stage.querySelector('.m3-count-text'),
    };

    /* 순찰 경찰들의 처음 상태를 정해요 */
    patrols = PATROLS.map(function (route, i) {
      return {
        pos: { r: route[0].r, c: route[0].c },
        route: route,
        routeIndex: 1,          // 다음에 갈 순찰 지점
        nextMove: 0,
        node: stage.querySelector('[data-cop="' + i + '"]'),
      };
    });

    drawHero();
    drawPatrols();
    drawCount();

    lastTime = performance.now();
    requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
  }


  return {
    start: start,
    stop: stop,
    hint: '미로에 숨겨진 태극기 다섯 장을 모두 찾아 안전한 곳으로 옮겨라. 붉은 곳은 보초가 지킨다.',
  };
})();
