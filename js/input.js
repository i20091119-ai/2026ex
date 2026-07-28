/* ==================================================================
   독립을 향하여 - 조작 담당 파일 (input.js)

   이 게임은 세 가지 방법으로 조작할 수 있어요.
   1) 키보드         : 방향키 + 정해진 글자키
   2) 마우스         : 화면을 눌러서
   3) 아케이드 조종기 : 방향 스틱 1개 + 버튼 8개

   ★ 아케이드 조종기는 컴퓨터가 '키보드'로 알아볼 때도 있고
     '게임패드'로 알아볼 때도 있어요.
     그래서 두 가지를 모두 알아듣게 만들었어요!
   ================================================================== */

const Input = (function () {

  /* ----------------------------------------------------------------
     1. 버튼 8개의 정보표
     ----------------------------------------------------------------
     no    : 조종기에 적힌 버튼 번호 (1~8)
     act   : 게임에서 하는 일의 이름
     label : 화면 안내판에 보여줄 글자
     emoji : 화면 안내판에 보여줄 그림
     keys  : 키보드로 눌렀을 때 이 버튼과 같은 것으로 쳐주는 키들

     keys 앞쪽에 있는 Control/Alt/Space/Shift/Z/X/C/V 는
     아케이드 조종기가 '키보드인 척'할 때 보내는 신호예요.
     뒤쪽 J/K/L 같은 키는 노트북으로 연습할 때 쓰라고 넣었어요.
     ---------------------------------------------------------------- */
  const BUTTONS = [
    { no: 1, act: 'jump',   label: '점프',    emoji: '🦘', arcade: 'A/X',   keys: ['ControlLeft', 'KeyJ'] },
    { no: 2, act: 'talk',   label: '말걸기',  emoji: '💬', arcade: 'B/○',   keys: ['AltLeft', 'KeyK'] },
    { no: 3, act: 'attack', label: '공격',    emoji: '✊', arcade: 'X/□',   keys: ['Space', 'KeyL'] },
    { no: 4, act: 'next',   label: '다음',    emoji: '➡️', arcade: 'Y/△',   keys: ['ShiftLeft', 'Enter'] },
    { no: 5, act: 'volume', label: '소리크기', emoji: '🔊', arcade: 'LB/L1', keys: ['KeyZ'] },
    { no: 6, act: 'pause',  label: '잠시멈춤', emoji: '⏸️', arcade: 'RB/R1', keys: ['KeyX'] },
    { no: 7, act: 'home',   label: '처음으로', emoji: '🏠', arcade: 'LT/L2', keys: ['KeyC'] },
    { no: 8, act: 'zoom',   label: '글씨크기', emoji: '🔍', arcade: 'RT/R2', keys: ['KeyV'] },
  ];

  /* 방향키 정보표예요. 방향 스틱도 이 방향들을 보내요. */
  const DIRS = {
    up:    ['ArrowUp', 'KeyW'],
    down:  ['ArrowDown', 'KeyS'],
    left:  ['ArrowLeft', 'KeyA'],
    right: ['ArrowRight', 'KeyD'],
  };


  /* ----------------------------------------------------------------
     2. 지금 무엇이 눌려 있는지 기억하는 곳
     ---------------------------------------------------------------- */
  const dir  = { up: false, down: false, left: false, right: false };
  const held = {};   // 버튼이 지금 눌려 있는지 (act 이름 -> true/false)

  BUTTONS.forEach(function (b) { held[b.act] = false; });

  /* 누군가 "이 버튼 눌리면 알려줘!" 하고 부탁한 것들을 모아두는 곳 */
  const listeners = {};

  /* 이건 장이 바뀌어도 지워지지 않는 특별한 부탁이에요.
     5~8번 버튼(확대/멈추기/도움말/처음으로)처럼
     게임 어디서나 항상 되어야 하는 것들이 여기에 들어가요. */
  const systemListeners = {};

  /* 마지막으로 조종한 기기 이름 (화면에 보여줘요) */
  let deviceText = '키보드';

  /* true 이면 게임 조작이 잠깐 멈춰요 (덮개 화면이 열렸을 때) */
  let blocked = false;

  /* ================================================================
     ★ 조종기 맞추기 (직접 배우기)

     조종기는 종류마다 신호가 달라서, 미리 정해두면 안 맞을 수 있어요.
     그래서 선생님이 조종기를 실제로 움직이면
     그 신호를 그대로 기억해두고 쓰기로 했어요.

     기억한 내용은 브라우저에 저장돼서 다음에 켜도 그대로예요.
     ================================================================ */
  const MAP_KEY = 'dokrip.padmap';   // 저장할 때 쓰는 이름표
  let padMap = null;                 // { dirs:{up:규칙,...}, acts:{jump:규칙,...} }

  /* ★ 조종기 목록을 안전하게 가져와요.

     페이지가 '창 안의 창(iframe)' 안에서 열리면 브라우저가
     조종기 사용을 막아서 여기서 에러가 날 수 있어요.
     그러면 게임 전체가 멈춰버리니까, 에러를 잡아서 넘기고
     '막혔다'고 기억해둬요. */
  let padBlocked = false;

  function getPads() {
    try {
      if (!navigator.getGamepads) return [];
      return navigator.getGamepads() || [];
    } catch (e) {
      padBlocked = true;      // 브라우저가 조종기를 막았어요
      return [];
    }
  }

  /* 이 페이지가 창 안의 창(iframe) 안에 들어 있나요? */
  function inFrame() {
    try { return window.self !== window.top; } catch (e) { return true; }
  }

  /* 저장해둔 설정을 불러와요 */
  function loadMap() {
    try {
      const raw = localStorage.getItem(MAP_KEY);
      if (raw) padMap = JSON.parse(raw);
    } catch (e) { padMap = null; }
  }
  loadMap();

  /* 축(스틱·십자키) 신호가 배운 것과 같은지 확인해요 */
  function axisMatches(rule, axes) {
    const v = axes[rule.index];
    if (v === undefined) return false;
    if (Math.abs(v) > 1.05) return false;        // 가운데(안 누름)

    if (Math.abs(rule.value) >= 0.85) {
      // 끝까지 기울인 신호 → 방향만 같으면 인정해요
      return rule.value > 0 ? v > 0.5 : v < -0.5;
    }
    // 십자키처럼 값이 딱 정해진 신호 → 그 값과 비슷해야 해요
    return Math.abs(v - rule.value) < 0.18;
  }

  /* 배운 규칙 하나가 지금 눌려 있는지 확인해요 */
  function ruleOn(rule, pad) {
    if (!rule) return false;
    if (rule.type === 'button') {
      const b = pad.buttons[rule.index];
      return b ? b.pressed : false;
    }
    return axisMatches(rule, pad.axes);
  }


  /* ----------------------------------------------------------------
     3. 도우미 함수들
     ---------------------------------------------------------------- */

  /* 어떤 키를 눌렀을 때, 그게 몇 번 버튼인지 찾아줘요 */
  function findButtonByKey(code) {
    return BUTTONS.find(function (b) { return b.keys.indexOf(code) !== -1; });
  }

  /* 어떤 키를 눌렀을 때, 그게 어느 방향인지 찾아줘요 */
  function findDirByKey(code) {
    for (const name in DIRS) {
      if (DIRS[name].indexOf(code) !== -1) return name;
    }
    return null;
  }

  /* "이 동작이 일어났어요!" 하고 부탁받은 사람들에게 알려줘요 */
  function fire(act) {
    // 먼저 항상 되어야 하는 것들(5~8번 버튼)에게 알려요
    if (systemListeners[act]) {
      systemListeners[act].forEach(function (fn) { fn(); });
    }
    // 덮개 화면(멈추기·도움말)이 열려 있으면 게임 조작은 잠깐 쉬어요
    if (blocked) return;

    // 그다음 지금 장에서 부탁한 것들에게 알려요
    const list = listeners[act];
    if (!list) return;
    list.forEach(function (fn) { fn(); });
  }

  /* 버튼이 눌리는 순간에 하는 일 */
  function pressButton(act) {
    if (held[act]) return;      // 이미 누르고 있으면 또 세지 않아요
    held[act] = true;
    highlight(act, true);       // 안내판에 불을 켜요

    // 뽁! 하고 버튼 소리가 나요
    // (5번은 소리 크기를 바꾸면서 스스로 소리를 내니까 빼요)
    if (act !== 'volume' && window.Sound) Sound.pok();

    fire(act);                  // 게임에 알려요
  }

  /* 버튼에서 손을 뗄 때 하는 일 */
  function releaseButton(act) {
    held[act] = false;
    highlight(act, false);      // 안내판 불을 꺼요
  }

  /* 방향이 눌리는 순간 */
  function pressDir(name) {
    if (dir[name]) return;
    dir[name] = true;
    highlightDir(name, true);
    fire('dir:' + name);        // 방향도 알려줘요 (퀴즈 고를 때 써요)
  }

  function releaseDir(name) {
    dir[name] = false;
    highlightDir(name, false);
  }


  /* ----------------------------------------------------------------
     4. 조작 안내판 그리기
        어떤 버튼이 무슨 일을 하는지 화면에서 볼 수 있어요.
     ---------------------------------------------------------------- */
  function drawGuide() {
    const box = document.getElementById('pad-buttons');
    if (!box) return;

    box.innerHTML = BUTTONS.map(function (b) {
      // 직접 맞춘 설정이 있으면 그걸 보여주고, 없으면 기본 이름을 보여줘요
      const learned = padMap && padMap.acts[b.act] ? padMap.acts[b.act].label : null;
      return (
        '<div class="pad-btn' + (learned ? ' is-learned' : '') + '" data-act="' + b.act + '">' +
          '<span class="pad-no">' + b.no + '</span>' +
          '<span class="pad-name">' + b.label + '</span>' +
          '<span class="pad-arcade">' + (learned || b.arcade) + '</span>' +
        '</div>'
      );
    }).join('');

    /* 마우스로도 조작할 수 있게, 안내판 버튼을 눌러도 동작해요! */
    box.querySelectorAll('.pad-btn').forEach(function (node) {
      const act = node.dataset.act;
      node.addEventListener('pointerdown', function (e) {
        e.preventDefault();
        deviceText = '마우스';
        updateDeviceText();
        pressButton(act);
      });
      node.addEventListener('pointerup',    function () { releaseButton(act); });
      node.addEventListener('pointerleave', function () { releaseButton(act); });
    });

    /* 안내판의 방향 화살표도 마우스로 누를 수 있어요 */
    document.querySelectorAll('#pad-stick .pad-arrows b').forEach(function (node) {
      const name = node.dataset.dir;
      node.addEventListener('pointerdown', function (e) {
        e.preventDefault();
        deviceText = '마우스';
        updateDeviceText();
        pressDir(name);
      });
      node.addEventListener('pointerup',    function () { releaseDir(name); });
      node.addEventListener('pointerleave', function () { releaseDir(name); });
    });
  }

  /* 버튼 칸에 불을 켜거나 꺼요 */
  function highlight(act, on) {
    const node = document.querySelector('.pad-btn[data-act="' + act + '"]');
    if (node) node.classList.toggle('is-down', on);
  }

  /* 방향 화살표에 불을 켜거나 꺼요 */
  function highlightDir(name, on) {
    const node = document.querySelector('#pad-stick b[data-dir="' + name + '"]');
    if (node) node.classList.toggle('is-down', on);
  }

  /* 지금 무엇으로 조작 중인지 화면에 써줘요 */
  function updateDeviceText() {
    const node = document.getElementById('pad-device');
    if (node) node.textContent = deviceText;
  }


  /* ----------------------------------------------------------------
     5. 키보드 신호 듣기
        (아케이드 조종기가 키보드로 인식될 때도 여기로 들어와요)
     ---------------------------------------------------------------- */
  window.addEventListener('keydown', function (e) {
    if (e.repeat) return;        // 꾹 누르고 있을 때 계속 들어오는 건 무시해요

    const d = findDirByKey(e.code);
    const b = findButtonByKey(e.code);

    if (d || b) {
      e.preventDefault();        // 화면이 위아래로 움직이지 않게 막아요
      deviceText = '키보드 / 조종기';
      updateDeviceText();
    }
    if (d) pressDir(d);
    if (b) pressButton(b.act);
  });

  window.addEventListener('keyup', function (e) {
    const d = findDirByKey(e.code);
    const b = findButtonByKey(e.code);
    if (d) releaseDir(d);
    if (b) releaseButton(b.act);
  });


  /* ----------------------------------------------------------------
     6. 게임패드(조종기) 신호 듣기
        조종기가 '게임패드'로 인식될 때 쓰는 방법이에요.
        게임패드는 신호를 보내주지 않아서, 우리가 계속 물어봐야 해요.
        그래서 1초에 60번씩 "지금 뭐 눌렸어?" 하고 확인해요.
     ---------------------------------------------------------------- */
  const padWas = {};             // 방금 전에 눌려 있었는지 기억해요
  const STICK_LIMIT = 0.5;       // 스틱을 이만큼 기울여야 '눌렀다'고 쳐요

  /* 조종기를 처음 연결했을 때 각 축이 어떤 값이었는지 적어둬요.
     아무것도 안 건드렸을 때의 값이니까, 이 값에서 벗어나면
     '움직였다'고 알 수 있어요. (조종기마다 기본값이 달라서 필요해요) */
  let padRest = null;

  /* 십자키(해트) 값을 방향으로 바꾸는 표예요.
     DINPUT 모드에서는 십자키가 버튼이 아니라
     이런 숫자 하나로 들어와요.
     -1 부터 1 까지 여덟 칸으로 나뉘어 있어요. */
  const HAT_DIRS = [
    ['up'], ['up', 'right'], ['right'], ['down', 'right'],
    ['down'], ['down', 'left'], ['left'], ['up', 'left'],
  ];

  /* 해트 값 하나를 방향 목록으로 바꿔줘요.

     ★ 조종기마다 '아무것도 안 누른 상태'의 값이 달라요.
       -1 ~ 1 을 벗어난 값(예: 3.29)으로 알려주는 조종기도 있고,
       0 으로 알려주는 조종기도 있어요. 둘 다 처리해요. */
  function readHat(value, rest) {
    if (value === undefined) return [];

    // (1) -1 ~ 1 을 벗어나면 확실히 가운데(안 누름)예요
    if (value > 1.05 || value < -1.05) return [];

    // (2) 0 에 아주 가까우면 가운데예요
    //     (해트 값은 0.14 부터 시작하니까 0.08 이면 안 겹쳐요)
    if (Math.abs(value) < 0.08) return [];

    // (3) 가운데 값이 -1~1 안에 있는 조종기라면,
    //     그 값과 아주 비슷할 때만 안 누른 것으로 봐요.
    //     (해트 값은 0.28 씩 떨어져 있어서 0.08 이면 넉넉해요)
    if (rest !== undefined && Math.abs(rest) <= 1.05 &&
        Math.abs(value - rest) < 0.08) return [];

    const index = Math.round((value + 1) * 3.5);   // 0 부터 7 까지
    return HAT_DIRS[index] || [];
  }

  window.addEventListener('gamepadconnected', function (e) {
    // mapping 이 'standard' 면 엑스인풋(XINPUT)으로 잘 연결된 거예요
    const kind = (e.gamepad.mapping === 'standard') ? 'XINPUT' : 'DINPUT';
    deviceText = '🕹️ 조종기 연결됨 (' + kind + ')';
    updateDeviceText();
  });

  window.addEventListener('gamepaddisconnected', function () {
    deviceText = '키보드';
    padRest = null;              // 다음에 꽂을 때 다시 재요
    updateDeviceText();
  });

  function checkGamepad() {
    const pads = getPads();

    for (let i = 0; i < pads.length; i++) {
      const pad = pads[i];
      if (!pad) continue;

      /* --- 버튼 8개 확인하기 ---
         배운 설정이 있으면 그 버튼을, 없으면 순서대로 1~8번을 봐요. */
      BUTTONS.forEach(function (b, index) {
        const byOrder = pad.buttons[index] ? pad.buttons[index].pressed : false;
        const byMap = padMap ? ruleOn(padMap.acts[b.act], pad) : false;
        const now = byMap || byOrder;
        const key = 'b' + index;

        if (now && !padWas[key]) pressButton(b.act);     // 방금 눌렸어요
        if (!now && padWas[key]) releaseButton(b.act);   // 방금 뗐어요
        padWas[key] = now;
      });

      /* --- 방향 스틱 확인하기 ---
         스틱은 숫자로 알려줘요.
         가로(axes[0])가 -1이면 왼쪽, +1이면 오른쪽
         세로(axes[1])가 -1이면 위,   +1이면 아래 */
      /* 조종기를 처음 봤으면, 안 건드렸을 때의 값을 적어둬요 */
      if (!padRest) padRest = Array.prototype.slice.call(pad.axes);

      /* ★ 직접 맞춘 설정이 있으면 먼저 확인해요.
         단, 기본 방식도 함께 살펴봐요. 그래야 조종기 옆 스위치를
         (LS ↔ DP ↔ RS) 바꿔도 다시 맞추지 않고 그냥 쓸 수 있어요. */
      const learned = { up: false, down: false, left: false, right: false };

      if (padMap) {
        ['up', 'down', 'left', 'right'].forEach(function (name) {
          learned[name] = ruleOn(padMap.dirs[name], pad);
        });
      }

      /* ★ 아케이드 스틱은 옆 스위치에 따라 신호가 세 가지로 달라져요.
           LS 로 두면  → axes 0, 1
           RS 로 두면  → axes 2, 3
           DP 로 두면  → 십자 버튼(12~15) 또는 해트 축
         어느 쪽으로 두어도 되게 전부 확인해요! */

      const x = biggest(pad.axes[0], pad.axes[2]);
      const y = biggest(pad.axes[1], pad.axes[3]);

      /* 십자 버튼 (XINPUT 모드에서 DP 로 두었을 때) */
      const dpad = {
        up:    isDown(pad.buttons[12]),
        down:  isDown(pad.buttons[13]),
        left:  isDown(pad.buttons[14]),
        right: isDown(pad.buttons[15]),
      };

      /* 해트 축 (DINPUT 모드에서 DP 로 두었을 때)
         네 번째 축부터 뒤쪽을 모두 살펴봐요. */
      const hat = { up: false, down: false, left: false, right: false };
      for (let a = 4; a < pad.axes.length; a++) {
        const v = pad.axes[a];

        /* 값이 -1~1 을 벗어나면 확실히 손을 뗀 상태예요.
           그때를 '가운데'로 다시 기억해두면,
           게임을 켤 때 스틱이 밀려 있었어도 저절로 고쳐져요! */
        if (v !== undefined && Math.abs(v) > 1.05) padRest[a] = v;

        readHat(v, padRest[a]).forEach(function (name) {
          hat[name] = true;
        });
      }

      /* 배운 설정이든 기본 방식이든, 하나라도 눌렸으면 움직여요 */
      setPadDir('up',    learned.up    || y < -STICK_LIMIT || dpad.up    || hat.up);
      setPadDir('down',  learned.down  || y >  STICK_LIMIT || dpad.down  || hat.down);
      setPadDir('left',  learned.left  || x < -STICK_LIMIT || dpad.left  || hat.left);
      setPadDir('right', learned.right || x >  STICK_LIMIT || dpad.right || hat.right);

      break;   // 조종기 1개만 쓰니까 첫 번째만 확인하고 끝내요
    }

    requestAnimationFrame(checkGamepad);   // 다시 확인하러 가요
  }

  /* 혹시 위에서 예상 못한 문제가 생겨도 게임이 멈추지 않도록
     한 겹 더 감싸줘요. */
  const rawCheck = checkGamepad;
  checkGamepad = function (t) {
    try { rawCheck(t); }
    catch (e) { requestAnimationFrame(checkGamepad); }
  };

  function isDown(btn) { return btn ? btn.pressed : false; }

  /* 두 숫자 중에 0에서 더 많이 벗어난 쪽을 골라줘요.
     (스틱을 LS 로 두든 RS 로 두든 움직인 쪽 값을 쓰려고요) */
  function biggest(a, b) {
    a = a || 0;
    b = b || 0;
    return Math.abs(a) >= Math.abs(b) ? a : b;
  }

  function setPadDir(name, now) {
    const key = 'd:' + name;
    if (now && !padWas[key]) pressDir(name);
    if (!now && padWas[key]) releaseDir(name);
    padWas[key] = now;
  }

  requestAnimationFrame(checkGamepad);


  /* ----------------------------------------------------------------
     7. 다른 파일에서 쓸 수 있게 열어두는 기능들
     ---------------------------------------------------------------- */
  return {
    /* 지금 눌려 있는 방향을 볼 수 있어요. 예) Input.dir.left */
    dir: dir,

    /* 지금 눌려 있는 버튼을 볼 수 있어요. 예) Input.held.jump */
    held: held,

    /* 버튼 정보표 */
    buttons: BUTTONS,

    /* "이 동작이 일어나면 알려줘!" 하고 부탁하는 방법
       예) Input.on('jump', function(){ ... })
           Input.on('dir:left', function(){ ... })              */
    on: function (act, fn) {
      if (!listeners[act]) listeners[act] = [];
      listeners[act].push(fn);
    },

    /* 장이 바뀌어도 지워지지 않는 부탁이에요 (5~8번 버튼에 써요) */
    onSystem: function (act, fn) {
      if (!systemListeners[act]) systemListeners[act] = [];
      systemListeners[act].push(fn);
    },

    /* 게임 조작을 잠깐 멈추거나 다시 켜요.
       (5~8번 버튼은 멈춰도 계속 눌러서 쓸 수 있어요) */
    setBlocked: function (v) { blocked = v; },

    /* 부탁을 취소해요 (장이 바뀔 때 정리하려고 만들었어요)
       단, onSystem 으로 건 부탁은 지워지지 않아요! */
    clear: function () {
      for (const key in listeners) delete listeners[key];
    },

    /* 버튼의 이름표를 바꿔요 (장마다 하는 일이 달라질 수 있어요) */
    setLabel: function (act, label, emoji) {
      const b = BUTTONS.find(function (x) { return x.act === act; });
      if (!b) return;
      b.label = label;
      if (emoji) b.emoji = emoji;
      drawGuide();
    },

    /* ---------- 조종기 맞추기에 쓰는 기능들 ---------- */

    /* 지금 조종기 상태를 사진 찍듯 그대로 담아와요 */
    snapshot: function () {
      const pads = getPads();
      for (let i = 0; i < pads.length; i++) {
        if (!pads[i]) continue;
        return {
          axes: Array.prototype.slice.call(pads[i].axes),
          buttons: pads[i].buttons.map(function (b) { return b.pressed; }),
        };
      }
      return null;
    },

    /* 사진 찍어둔 때와 비교해서, 무엇이 새로 눌렸는지 찾아줘요.
       찾으면 그 신호를 설명하는 '규칙'을 돌려줘요. */
    findChange: function (before) {
      const now = this.snapshot();
      if (!now || !before) return null;

      // (1) 새로 눌린 버튼이 있나요?
      for (let i = 0; i < now.buttons.length; i++) {
        if (now.buttons[i] && !before.buttons[i]) {
          return { type: 'button', index: i, label: '버튼 ' + (i + 1) };
        }
      }

      // (2) 크게 움직인 축(스틱·십자키)이 있나요?
      let best = null;
      let bestMove = 0.45;                 // 이만큼은 움직여야 인정해요
      for (let i = 0; i < now.axes.length; i++) {
        const moved = Math.abs(now.axes[i] - (before.axes[i] || 0));
        if (moved > bestMove && Math.abs(now.axes[i]) <= 1.05) {
          bestMove = moved;
          best = {
            type: 'axis',
            index: i,
            value: Math.round(now.axes[i] * 100) / 100,
            label: '축 ' + i + ' (' + (Math.round(now.axes[i] * 100) / 100) + ')',
          };
        }
      }
      return best;
    },

    /* 다 맞춘 설정을 저장해요 */
    saveMap: function (map) {
      padMap = map;
      try { localStorage.setItem(MAP_KEY, JSON.stringify(map)); } catch (e) {}
      drawGuide();
    },

    /* 맞춘 설정을 지우고 기본값으로 되돌려요 */
    clearMap: function () {
      padMap = null;
      try { localStorage.removeItem(MAP_KEY); } catch (e) {}
      drawGuide();
    },

    /* 지금 맞춘 설정이 있나요? */
    hasMap: function () { return !!padMap; },

    /* 브라우저가 조종기를 막았나요? (창 안의 창일 때 그래요) */
    isBlocked: function () { return padBlocked; },

    /* 이 페이지가 창 안의 창 안에 들어 있나요? */
    inFrame: inFrame,

    /* 어떤 동작이 조종기의 무엇에 연결됐는지 글자로 알려줘요 */
    sourceLabel: function (act) {
      if (!padMap || !padMap.acts[act]) return null;
      return padMap.acts[act].label;
    },

    /* 지금 연결된 조종기의 속살을 그대로 보여줘요.
       (조종기 확인 화면에서 써요) */
    readPads: function () {
      const pads = getPads();
      const list = [];
      for (let i = 0; i < pads.length; i++) {
        if (!pads[i]) continue;
        list.push({
          id: pads[i].id,
          mapping: pads[i].mapping,
          axes: Array.prototype.slice.call(pads[i].axes),
          buttons: pads[i].buttons.map(function (b) { return b.pressed; }),
        });
      }
      return list;
    },

    /* 처음 한 번 안내판을 그려요 */
    init: function () {
      drawGuide();
      updateDeviceText();
    },
  };
})();

/* 화면이 다 준비되면 안내판을 그려요 */
Input.init();
