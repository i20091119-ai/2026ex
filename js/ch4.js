/* ==================================================================
   4장 · 만세운동 준비  (ch4.js)

   유관순을 만나 만세운동을 준비해요.
   광장에 모인 사람들에게 태극기를 나누어 주고
   독립의 뜻을 알리면 성공이에요.

   - 태극기 하나를 전할 때마다 독립 포인트 +3점 (5명이면 15점)
   - 3장 미로와 달리 칸이 없어요. 광장을 자유롭게 걸어 다녀요.
   - 일본 경찰은 광장 전체를 돌아다니고,
     태극기를 하나 건넬 때마다 경찰이 한 명씩 늘어나요!
   - ★ 경찰은 앞쪽만 등불로 비춰 봐요. 불빛 안에 들어가면 들켜요.
     뒤쪽은 안 보이니 몰래 돌아가요! (부딪히면 들켜요)
   - ★ 태극기는 몰래 건네요 : 사람 곁에서 2번(B)을 0.5초 꾹!
   - ★ 다섯 명에게 다 건네면 유관순에게 돌아가 2번으로 만세 신호!

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

  /* ★ 광장을 돌아다니는 일본 경찰이에요.
     정해진 길만 도는 게 아니라, 광장 곳곳의 '길목'을 마음대로 골라 걸어 다녀요.
     처음엔 1명이고, 태극기를 하나 건넬 때마다 1명씩 늘어나요! */
  const COP_SPEED = 13;    // 경찰이 걷는 빠르기
  const COP_REACH = 8;     // 이만큼 가까워지면 들켜요
  const COP_GRACE = 1.2;   // 새로 온 경찰은 이 시간(초) 동안은 잡지 못해요 (나타나는 중)
  const CONE_LEN  = 12;    // 경찰 등불이 닿는 거리
  const CONE_HALF = 30 * Math.PI / 180;   // 등불이 퍼지는 각도 (반쪽)
  const TOUCH     = 5.5;   // 이만큼 가까우면 뒤에서도 들켜요 (부딪힘)
  const HAND_TIME = 0.5;   // 태극기를 몰래 건네는 데 걸리는 시간 (초)
  const SEEN_TIME = 0.35;  // 등불 안에 이만큼 머물러야 들켜요 (얼른 빠져나오면 살아요)

  /* 경찰이 걸어 다닐 수 있는 길목들 (광장을 바둑판처럼 나눈 점들)
     담이나 수레 위의 점은 빼고, 담을 넘지 않고 갈 수 있는 점끼리만 이어요. */
  const GRID_X = [8, 20, 32, 44, 56, 68, 80, 92];
  const GRID_Y = [8, 20, 32, 44, 56, 68, 80, 92];

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
  let cops = [];                 // 돌아다니는 일본 경찰들
  let spots = [];                // 경찰이 다닐 수 있는 길목들
  let handing = null;            // 지금 건네는 중 { i: 사람 번호, t: 걸린 시간, mouse }
  let finalStep = false;         // 다 건네고 유관순에게 돌아가는 중
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
  /* 2번(B) 을 누르면 건네기 시작 (꾹 누르고 있어야 해요) */
  function startHand(fromMouse) {
    if (!running) return;
    // 다 건넸으면 유관순에게 만세 신호!
    if (finalStep) {
      if (distance(hero, YU) < REACH) signal();
      else {
        node.talk.textContent = '유관순에게 돌아가 만세 신호를 보내자!';
        node.talk.className = 'm4-talk';
      }
      return;
    }
    if (nearest < 0) {
      node.talk.textContent = '사람들 곁으로 다가가야 한다.';
      node.talk.className = 'm4-talk';
      return;
    }
    handing = { i: nearest, t: 0, mouse: !!fromMouse };
    people[nearest].node.classList.add('is-handing');
  }

  function cancelHand(msg) {
    if (!handing) return;
    people[handing.i].node.classList.remove('is-handing');
    people[handing.i].node.style.setProperty('--p', 0);
    handing = null;
    if (msg) { node.talk.textContent = msg; node.talk.className = 'm4-talk'; }
  }

  /* 건네는 동안 원이 차올라요 */
  function updateHand(delta, moved) {
    if (!handing) return;
    const held = Input.held.talk || Input.held.next || handing.mouse;
    if (moved || !held || nearest !== handing.i) {
      cancelHand('건네다 멈췄다. 2번을 꾹 눌러야 몰래 건넬 수 있어.');
      return;
    }
    handing.t += delta;
    people[handing.i].node.style.setProperty('--p', Math.min(1, handing.t / HAND_TIME));
    if (handing.t >= HAND_TIME) {
      people[handing.i].node.classList.remove('is-handing');
      handing = null;
      giveFlag();
    }
  }

  /* 유관순에게 만세 신호! → 성공 */
  function signal() {
    running = false;
    node.talk.textContent = '유관순 : 이제 다 함께 만세를 부를 때입니다!';
    node.talk.className = 'm4-talk is-good';
    node.field.classList.add('is-ready');       // 광장이 환해져요
    if (window.Sound) Sound.fanfare();
    setTimeout(onSuccess, 1600);
  }

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

    /* ★ 태극기를 건넬 때마다 경찰이 한 명씩 더 와요 (마지막 한 장은 빼고) */
    if (given < PEOPLE.length) {
      addCop();
      if (window.Sound) Sound.alert();
      node.talk.textContent = '「 ' + PEOPLE[person.index].say + ' 」  —  경찰이 한 명 더 왔다!';
    }

    /* 다섯 명 모두에게 나누어 주었나요? → 유관순에게 돌아가요 */
    if (given >= PEOPLE.length) {
      finalStep = true;
      node.yu.classList.add('is-call');
      node.talk.textContent = '다 건넸다! 유관순에게 돌아가 2번으로 만세 신호를 보내자!';
      node.talk.className = 'm4-talk is-good';
      if (window.Sound) Sound.ding();
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

    const moved = Math.abs(hero.x - nx) > 0.001 || Math.abs(hero.y - ny) > 0.001 ||
                  Input.dir.left || Input.dir.right || Input.dir.up || Input.dir.down;
    drawHero();
    updateNearest();
    updateHand(delta, moved);
    if (finalStep) node.yu.classList.toggle('is-near', distance(hero, YU) < REACH);
    moveCops(delta);

    requestAnimationFrame(loop);
  }


  /* ----------------------------------------------------------------
     6-2. 돌아다니는 일본 경찰
     ---------------------------------------------------------------- */

  /* 두 점 사이를 담에 부딪히지 않고 곧장 걸어갈 수 있나요? */
  function clearPath(a, b) {
    for (let t = 0; t <= 1; t += 0.05) {
      if (hitsWall(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t)) return false;
    }
    return true;
  }

  /* 길목 지도를 만들어요 (게임을 시작할 때 한 번) */
  function buildSpots() {
    spots = [];
    GRID_Y.forEach(function (y) {
      GRID_X.forEach(function (x) {
        if (!hitsWall(x, y)) spots.push({ x: x, y: y, next: [] });
      });
    });
    // 바로 옆(대각선 포함) 길목끼리, 담을 넘지 않으면 이어요
    spots.forEach(function (a, i) {
      spots.forEach(function (b, j) {
        if (i === j) return;
        const near = Math.abs(a.x - b.x) <= 12 && Math.abs(a.y - b.y) <= 12;
        if (near && clearPath(a, b)) a.next.push(j);
      });
    });
  }

  /* 길목 a 에서 b 까지 가는 가장 짧은 길을 찾아요 (넓게 퍼져 나가며 찾기) */
  function findPath(a, b) {
    const came = {};
    came[a] = -1;
    const queue = [a];
    while (queue.length) {
      const cur = queue.shift();
      if (cur === b) break;
      spots[cur].next.forEach(function (n) {
        if (came[n] === undefined) { came[n] = cur; queue.push(n); }
      });
    }
    if (came[b] === undefined) return [];
    const path = [];
    for (let cur = b; cur !== a; cur = came[cur]) path.unshift(cur);
    return path;
  }

  /* 경찰 한 명이 다음에 갈 길목을 골라요.
     ★ 광장 저 멀리 아무 곳이나 목적지로 정하고, 길을 따라 걸어가요.
       도착하면 또 다른 먼 곳을 골라요. 그래서 광장 전체를 돌아다녀요! */
  function pickNext(c) {
    if (!c.path || c.path.length === 0) {
      let dest = c.at;
      for (let tries = 0; tries < 20; tries++) {
        const d = Math.floor(Math.random() * spots.length);
        if (distance(spots[d], spots[c.at]) > 35) { dest = d; break; }
      }
      c.path = findPath(c.at, dest);
      if (c.path.length === 0) c.path = spots[c.at].next.slice(0, 1);
    }
    c.at = c.path.shift();
  }

  /* 경찰 한 명을 광장에 들여보내요.
     주인공과 가장 먼 길목 몇 곳 중 한 곳에서 나타나요. */
  function addCop() {
    const far = spots
      .map(function (sp, i) { return { i: i, d: distance(hero, sp) }; })
      .sort(function (a, b) { return b.d - a.d; })
      .slice(0, 6);
    const pick = far[Math.floor(Math.random() * far.length)].i;

    const el = document.createElement('div');
    el.className = 'm4-cop is-new';
    el.innerHTML = MissionUtil.figure('police');
    node.field.appendChild(el);

    // 경찰 등불 (앞쪽 부채꼴)
    const cone = document.createElement('div');
    cone.className = 'm4-cone is-new';
    node.field.insertBefore(cone, node.field.firstChild);

    const c = {
      x: spots[pick].x, y: spots[pick].y,
      at: pick, path: [],
      speed: COP_SPEED * MissionUtil.random(0.85, 1.05),   // 조금씩 빠르기가 달라요
      grace: COP_GRACE,
      node: el,
      cone: cone,
      face: Math.random() * Math.PI * 2,     // 바라보는 방향
    };
    pickNext(c);
    cops.push(c);
    placeCop(c);
  }

  function placeCop(c) {
    c.node.style.left = c.x + '%';
    c.node.style.top  = c.y + '%';
    c.node.classList.toggle('is-left', Math.cos(c.face) < 0);
    drawCone(c);
  }

  /* 등불 부채꼴을 그려요 (광장 위의 점들을 이어서) */
  function drawCone(c) {
    if (!c.cone) return;
    const pts = [c.x + '% ' + c.y + '%'];
    for (let k = 0; k <= 6; k++) {
      const a = c.face - CONE_HALF + (CONE_HALF * 2) * k / 6;
      pts.push((c.x + Math.cos(a) * CONE_LEN) + '% ' + (c.y + Math.sin(a) * CONE_LEN / 0.55) + '%');
    }
    c.cone.style.clipPath = 'polygon(' + pts.join(',') + ')';
    c.cone.style.background = 'radial-gradient(ellipse ' + CONE_LEN + '% ' + (CONE_LEN / 0.55) + '% at ' +
      c.x + '% ' + c.y + '%, rgba(255, 236, 160, 0.42), rgba(255, 220, 130, 0.12) 75%, transparent 100%)';
  }

  /* 각도 차이 (0 ~ π) */
  function angleGap(a, b) {
    let d = Math.abs(a - b) % (Math.PI * 2);
    return d > Math.PI ? Math.PI * 2 - d : d;
  }

  function moveCops(delta) {
    for (let k = 0; k < cops.length; k++) {
      const c = cops[k];
      const target = spots[c.at];
      const dx = target.x - c.x;
      const dy = target.y - c.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 1.2) {
        pickNext(c);                       // 길목에 닿으면 다음 길목을 골라요
      } else {
        c.x += (dx / dist) * c.speed * delta;
        c.y += (dy / dist) * c.speed * delta * 1.7;
        // 걸어가는 쪽으로 천천히 고개를 돌려요
        const want = Math.atan2((dy / dist) * 1.7 * 0.55, dx / dist);
        let turn = want - c.face;
        while (turn > Math.PI) turn -= Math.PI * 2;
        while (turn < -Math.PI) turn += Math.PI * 2;
        c.face += Math.max(-5 * delta, Math.min(5 * delta, turn));
      }
      placeCop(c);

      if (c.grace > 0) {                   // 막 나타난 경찰은 아직 못 잡아요
        c.grace -= delta;
        if (c.grace <= 0) { c.node.classList.remove('is-new'); c.cone.classList.remove('is-new'); }
        continue;
      }

      // ★ 등불 안에 들어가거나(앞쪽), 바로 부딪히면(어느 쪽이든) 들켜요!
      const hx = hero.x - c.x;
      const hy = (hero.y - c.y) * 0.55;
      const d = Math.sqrt(hx * hx + hy * hy);
      const inLight = d < CONE_LEN && angleGap(Math.atan2(hy, hx), c.face) < CONE_HALF;
      // 등불에 들어가면 불빛이 붉게 번쩍! 얼른 빠져나오면 살아요
      c.seen = inLight ? (c.seen || 0) + delta : 0;
      c.cone.classList.toggle('is-alert', inLight);
      if (inLight && !c.alerted) { c.alerted = true; if (window.Sound) Sound.alert(); }
      if (!inLight) c.alerted = false;
      if (d < TOUCH || c.seen > SEEN_TIME) {
        running = false;
        cancelHand();
        c.node.querySelector('.fig').classList.add('is-looking');
        c.cone.classList.add('is-caught');
        node.talk.textContent = c.seen > SEEN_TIME ? '경찰의 등불에 들켰다!' : '순찰하던 일본 경찰에게 들켰다!';
        node.talk.className = 'm4-talk is-bad';
        setTimeout(function () {
          onFail('만세운동을 준비하다 일본 경찰에게 들켰어요!');
        }, 800);
        return;
      }
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
    handing = null;
    finalStep = false;

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
          // 유관순은 광장 가운데에 서 있어요
          '<div class="m4-yu" style="left:' + YU.x + '%;top:' + YU.y + '%">' +
            '<span class="m4-bubble is-yu">2</span>' +
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
          '<span class="m3-key">2번 꾹</span> 곁에 있는 사람에게 몰래 건네기 &nbsp;·&nbsp; 경찰 등불 앞은 피하고 뒤로 돌아가요' +
        '</p>' +

      '</div>'
    );

    node = {
      field:     stage.querySelector('.m4-field'),
      hero:      stage.querySelector('.m4-hero'),
      count:     stage.querySelector('.m4-count'),
      countText: stage.querySelector('.m4-count-text'),
      talk:      stage.querySelector('.m4-talk'),
      yu:        stage.querySelector('.m4-yu'),
    };

    people = PEOPLE.map(function (person, i) {
      return {
        done: false,
        index: i,
        node: stage.querySelector('[data-person="' + i + '"]'),
      };
    });

    /* 경찰이 다닐 길목 지도를 만들고, 첫 경찰 한 명을 들여보내요 */
    buildSpots();
    cops = [];
    addCop();
    cops[0].grace = 0;                    // 처음 경찰은 바로 순찰을 시작해요
    cops[0].node.classList.remove('is-new');

    drawHero();
    drawCount();

    // 2번 버튼(말걸기)으로 태극기를 건네요
    Input.on('talk', function () { startHand(false); });
    Input.on('next', function () { startHand(false); });   // 4번 버튼으로도 돼요

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
        startHand(true);                 // 마우스는 누른 채로 있지 않아도 돼요
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
    hint: '경찰 등불 앞을 피해 뒤로 돌아가며, 사람 곁에서 2번을 꾹 눌러 태극기를 몰래 건네라. 다 건네면 유관순에게!',
  };
})();
