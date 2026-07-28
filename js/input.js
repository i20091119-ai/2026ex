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
    { no: 1, act: 'jump',   label: '점프',   emoji: '🦘', keys: ['ControlLeft', 'KeyJ'] },
    { no: 2, act: 'talk',   label: '말걸기', emoji: '💬', keys: ['AltLeft', 'KeyK'] },
    { no: 3, act: 'attack', label: '공격',   emoji: '✊', keys: ['Space', 'KeyL'] },
    { no: 4, act: 'next',   label: '다음',   emoji: '➡️', keys: ['ShiftLeft', 'Enter'] },
    { no: 5, act: 'btn5',   label: '(비어둠)', emoji: '⬜', keys: ['KeyZ'] },
    { no: 6, act: 'btn6',   label: '(비어둠)', emoji: '⬜', keys: ['KeyX'] },
    { no: 7, act: 'btn7',   label: '(비어둠)', emoji: '⬜', keys: ['KeyC'] },
    { no: 8, act: 'btn8',   label: '(비어둠)', emoji: '⬜', keys: ['KeyV'] },
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

  /* 마지막으로 조종한 기기 이름 (화면에 보여줘요) */
  let deviceText = '키보드';


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
    const list = listeners[act];
    if (!list) return;
    list.forEach(function (fn) { fn(); });
  }

  /* 버튼이 눌리는 순간에 하는 일 */
  function pressButton(act) {
    if (held[act]) return;      // 이미 누르고 있으면 또 세지 않아요
    held[act] = true;
    highlight(act, true);       // 안내판에 불을 켜요
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
      return (
        '<div class="pad-btn" data-act="' + b.act + '">' +
          '<span class="pad-no">' + b.no + '</span>' +
          '<span class="pad-emoji">' + b.emoji + '</span>' +
          '<span class="pad-name">' + b.label + '</span>' +
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

  window.addEventListener('gamepadconnected', function (e) {
    deviceText = '조종기 연결됨 (' + e.gamepad.id.slice(0, 18) + ')';
    updateDeviceText();
  });

  window.addEventListener('gamepaddisconnected', function () {
    deviceText = '키보드';
    updateDeviceText();
  });

  function checkGamepad() {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];

    for (let i = 0; i < pads.length; i++) {
      const pad = pads[i];
      if (!pad) continue;

      /* --- 버튼 8개 확인하기 --- */
      BUTTONS.forEach(function (b, index) {
        const btn = pad.buttons[index];
        const now = btn ? btn.pressed : false;
        const key = 'b' + index;

        if (now && !padWas[key]) pressButton(b.act);     // 방금 눌렸어요
        if (!now && padWas[key]) releaseButton(b.act);   // 방금 뗐어요
        padWas[key] = now;
      });

      /* --- 방향 스틱 확인하기 ---
         스틱은 숫자로 알려줘요.
         가로(axes[0])가 -1이면 왼쪽, +1이면 오른쪽
         세로(axes[1])가 -1이면 위,   +1이면 아래 */
      const x = pad.axes[0] || 0;
      const y = pad.axes[1] || 0;

      /* 십자 버튼(D-pad)이 있는 조종기도 있어서 같이 확인해요 */
      const dpad = {
        up:    isDown(pad.buttons[12]),
        down:  isDown(pad.buttons[13]),
        left:  isDown(pad.buttons[14]),
        right: isDown(pad.buttons[15]),
      };

      setPadDir('up',    y < -STICK_LIMIT || dpad.up);
      setPadDir('down',  y >  STICK_LIMIT || dpad.down);
      setPadDir('left',  x < -STICK_LIMIT || dpad.left);
      setPadDir('right', x >  STICK_LIMIT || dpad.right);

      break;   // 조종기 1개만 쓰니까 첫 번째만 확인하고 끝내요
    }

    requestAnimationFrame(checkGamepad);   // 다시 확인하러 가요
  }

  function isDown(btn) { return btn ? btn.pressed : false; }

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

    /* 부탁을 취소해요 (장이 바뀔 때 정리하려고 만들었어요) */
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

    /* 처음 한 번 안내판을 그려요 */
    init: function () {
      drawGuide();
      updateDeviceText();
    },
  };
})();

/* 화면이 다 준비되면 안내판을 그려요 */
Input.init();
