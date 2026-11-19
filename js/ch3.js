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

  /* ★ 보초의 경계 구역이 숨 쉬듯 넓어졌다 좁아졌다 해요.
     1칸 → 2칸 → 3칸 → 2칸 → 다시 1칸 … (복도를 따라 퍼져요)
     넓어지기 직전에는 새로 칠해질 칸이 점선으로 깜빡여요! */
  const ZONE_STEPS = [1, 2, 3, 2];   // 경계 구역 크기 차례
  const ZONE_TIME  = 1800;           // 한 단계가 이어지는 시간 (밀리초)
  const WARN_TIME  = 800;            // 넓어지기 전에 미리 깜빡이는 시간

  /* 게임 빠르기 (숫자가 작을수록 빨라요, 단위는 밀리초) */
  const HERO_STEP   = 135;   // 주인공이 한 칸 움직이는 데 걸리는 시간
  const PATROL_STEP = 420;   // 순찰 경찰이 한 칸 움직이는 시간


  /* ----------------------------------------------------------------
     2. 이 미션이 기억해야 할 것들
     ---------------------------------------------------------------- */
  let hero = { r: 0, c: 0 };
  let taken = [];             // 주운 태극기 번호들
  let patrols = [];           // 순찰 경찰들의 상태
  let zones = [];             // 보초마다 경계 구역 { dist: 칸까지 거리, offset, nodes }
  let zoneClock = 0;          // 경계 구역 시계 (멈춤 중에는 안 흘러요)
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

  /* 보초 한 명의 경계 구역을 만들어요.
     보초 자리에서 복도를 따라 몇 칸 떨어졌는지 재어 둬요. (최대 3칸) */
  function makeZone(g, i) {
    const dist = {};
    dist[g.r + ',' + g.c] = 0;
    const queue = [{ r: g.r, c: g.c }];
    while (queue.length) {
      const cur = queue.shift();
      const d = dist[cur.r + ',' + cur.c];
      if (d >= 3) continue;
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (m) {
        const r = cur.r + m[0], c = cur.c + m[1];
        const key = r + ',' + c;
        if (isOpen(r, c) && dist[key] === undefined) {
          dist[key] = d + 1;
          queue.push({ r: r, c: c });
        }
      });
    }
    return { dist: dist, offset: i * 1300, nodes: [], shown: '' };
  }

  /* 지금 이 보초의 경계 구역은 몇 칸인가요? (그리고 곧 몇 칸이 되나요?) */
  function zoneState(z) {
    const t = zoneClock + z.offset;
    const k = Math.floor(t / ZONE_TIME) % ZONE_STEPS.length;
    const now = ZONE_STEPS[k];
    const next = ZONE_STEPS[(k + 1) % ZONE_STEPS.length];
    const left = ZONE_TIME - (t % ZONE_TIME);
    return { now: now, warn: (next > now && left < WARN_TIME) ? next : now };
  }

  /* 그 칸이 보초의 경계 구역인가요? */
  function isDanger(pos) {
    const key = pos.r + ',' + pos.c;
    return zones.some(function (z) {
      const d = z.dist[key];
      return d !== undefined && d <= zoneState(z).now;
    });
  }

  /* 경계 구역을 화면에 칠해요 (바뀐 게 있을 때만) */
  function drawZones() {
    zones.forEach(function (z) {
      const st = zoneState(z);
      const tag = st.now + '/' + st.warn;
      if (tag === z.shown) return;
      z.shown = tag;
      z.nodes.forEach(function (n) {
        n.el.classList.toggle('is-on', n.d <= st.now);
        n.el.classList.toggle('is-warn', n.d > st.now && n.d <= st.warn);
      });
    });
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
    // ★ 출발한 칸은 길에 넣지 않아요.
    //   (전에는 출발 칸이 '첫걸음'으로 들어가서, 순찰 경찰이
    //    제자리에 한 걸음 내딛고는 영영 움직이지 않았어요!)
    if (came[to.r + ',' + to.c] === undefined) return [];   // 갈 수 없는 곳
    const path = [];
    let cur = to;
    while (came[cur.r + ',' + cur.c] !== null) {
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

    zoneClock += delta;                  // 경계 구역 시계가 흘러요
    drawZones();

    moveHero(now);
    if (running) movePatrols(now);

    /* 가만히 서 있던 칸이 경계 구역으로 바뀌어도 들켜요 */
    if (running && isDanger(hero)) lose('넓어진 경계 구역에 들켰어요!');

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
    zones = GUARDS.map(makeZone);
    zoneClock = 0;

    /* --- 미로 벽을 그려요 --- */
    let html = '';
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (MAZE[r][c] === '#') {
          html += '<div class="m3-wall" style="' + cellStyle({ r: r, c: c }) + '"></div>';
        }
      }
    }

    /* --- 보초의 경계 구역 칸들 (켜졌다 꺼졌다 해요) --- */
    zones.forEach(function (z, gi) {
      for (const key in z.dist) {
        const rc = key.split(',');
        html += '<div class="m3-danger" data-g="' + gi + '" data-d="' + z.dist[key] + '" style="' +
                cellStyle({ r: +rc[0], c: +rc[1] }) + '"></div>';
      }
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
          '<span class="m3-legend m3-legend-guard"></span> 보초(붉은 곳 금지 · 점선이 깜빡이면 곧 넓어져요) &nbsp;·&nbsp; ' +
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

    /* 경계 구역 칸들을 보초별로 기억해 두고, 처음 모습을 칠해요 */
    stage.querySelectorAll('.m3-danger').forEach(function (el) {
      zones[+el.dataset.g].nodes.push({ el: el, d: +el.dataset.d });
    });
    drawZones();

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
