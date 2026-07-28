/* ==================================================================
   독립을 향하여 - 게임의 뼈대 (game.js)

   이 파일이 하는 일
   1) 화면 3개(시작 / 게임 / 끝)를 바꿔 끼워요
   2) 독립 포인트(점수)를 기억하고 화면에 보여줘요
   3) 6개 장을 순서대로 진행시켜요
   ================================================================== */


/* ------------------------------------------------------------------
   1. 게임이 기억해야 할 것들을 한곳에 모아뒀어요.
   ------------------------------------------------------------------ */
const MAX_LIFE = 3;   // 목숨은 3개로 시작해요

const game = {
  score: 0,           // 지금까지 모은 독립 포인트
  chapterIndex: 0,    // 지금 몇 번째 장인지 (0부터 세요)
  life: MAX_LIFE,     // 남은 목숨(하트) 개수
  paused: false,      // 잠깐 멈춤 중인지
};


/* ------------------------------------------------------------------
   2. 6개 장의 정보예요. 기획서에 적힌 그대로 적었어요.
      id      : 장 번호
      name    : 점수판에 보여줄 이름
      face    : 말풍선에 나올 캐릭터 얼굴
      story   : 장이 시작될 때 들려줄 이야기
      mission : 이번 장에서 해야 할 일
      point   : 미션을 끝내면 받는 독립 포인트
   ------------------------------------------------------------------ */
const CHAPTERS = [
  {
    id: 1,
    name: '1장 · 비밀 편지',
    face: 'mate',      // 독립운동가 동료
    story: '학교에서 돌아오는 길, 독립운동가 동료를 만났어요.',
    mission: '일본 경찰에게 들키지 않고 비밀 편지를 전달하세요!',
    point: 10,
  },
  {
    id: 2,
    name: '2장 · 김구 선생님과의 만남',
    face: 'kimgu',     // 김구 선생님
    story: '비밀 아지트에서 김구 선생님을 만났어요.',
    mission: '"나라를 되찾으려면 많은 사람의 용기가 필요하단다." 역사 퀴즈 3개를 맞혀 보세요!',
    point: 0, // 2장은 문제 하나 맞힐 때마다 5점씩 바로 줘요 (ch2.js 에서)
  },
  {
    id: 3,
    name: '3장 · 태극기 지키기',
    face: 'hero',      // 주인공
    story: '동료가 숨겨둔 태극기를 일본 경찰보다 먼저 찾아야 해요.',
    mission: '미로를 통과해서 태극기를 찾으세요! (경찰 조심!)',
    point: 10,
  },
  {
    id: 4,
    name: '4장 · 만세운동 준비',
    face: 'yu',        // 유관순
    story: '유관순을 만나 만세운동을 준비해요.',
    mission: '사람들에게 태극기 5개를 나누어 주세요!',
    point: 0, // 4장은 태극기를 한 명에게 전할 때마다 3점씩 바로 줘요 (ch4.js 에서)
  },
  {
    id: 5,
    name: '5장 · 독립을 향하여',
    face: 'captain',   // 일본 헌병대장
    story: '주인공과 김구 선생님, 독립군이 마지막 싸움을 준비해요.',
    mission: '일본군과의 싸움에서 승리하세요!',
    point: 30,
  },
  {
    id: 6,
    name: '6장 · 광복의 날',
    face: 'hero',      // 광복을 맞은 주인공
    story: '드디어 일본의 지배에서 벗어났어요!',
    mission: '사람들이 태극기를 흔들며 기뻐해요. 대한 독립 만세!',
    point: 0,
  },
];


/* ------------------------------------------------------------------
   3. 화면에서 자주 쓰는 부분들을 미리 찾아둬요.
      (매번 찾으면 느려지니까 한 번만 찾아서 이름을 붙여요)
   ------------------------------------------------------------------ */
const el = {
  screens: {
    title: document.getElementById('screen-title'),
    game:  document.getElementById('screen-game'),
    end:   document.getElementById('screen-end'),
  },
  chapterName: document.getElementById('hud-chapter-name'),
  score:       document.getElementById('hud-score'),
  hearts:      document.getElementById('hud-hearts'),
  stage:       document.getElementById('stage-inner'),
  bubbleFace:  document.getElementById('bubble-face'),
  bubbleText:  document.getElementById('bubble-text'),
  endEmoji:    document.getElementById('end-emoji'),
  endTitle:    document.getElementById('end-title'),
  endMessage:  document.getElementById('end-message'),
  endScore:    document.getElementById('end-score'),
  btnStart:    document.getElementById('btn-start'),
  btnRetry:    document.getElementById('btn-retry'),
};


/* ------------------------------------------------------------------
   4. 화면 바꾸기
      showScreen('game') 이라고 부르면 게임 화면만 보여요.
   ------------------------------------------------------------------ */
function showScreen(name) {
  // 먼저 모든 화면을 숨겨요
  for (const key in el.screens) {
    el.screens[key].classList.remove('is-on');
  }
  // 그리고 원하는 화면 하나만 보여줘요
  el.screens[name].classList.add('is-on');
}


/* ------------------------------------------------------------------
   5. 점수 다루기
   ------------------------------------------------------------------ */

// 점수를 화면에 다시 그려요
function drawScore() {
  el.score.textContent = game.score;
}

// 점수를 올려요. 올라갈 때 숫자가 통통 튀어요!
function addScore(amount) {
  if (amount <= 0) return;      // 0점이면 아무 일도 안 해요
  game.score += amount;
  drawScore();
  Sound.ding();               // 띠링! 하고 기분 좋은 소리가 나요

  // 'pop' 이름표를 잠깐 붙였다 떼면 커졌다 작아지는 애니메이션이 나와요
  el.score.classList.remove('pop');
  void el.score.offsetWidth;    // 애니메이션을 처음부터 다시 트는 방법이에요
  el.score.classList.add('pop');
}


/* ------------------------------------------------------------------
   5-2. 목숨(하트) 다루기
   ------------------------------------------------------------------ */

// 남은 목숨만큼 빨간 하트, 잃은 만큼 까만 하트를 그려요
function drawHearts() {
  let html = '';
  for (let i = 0; i < MAX_LIFE; i++) {
    // 남아 있으면 붉은 마름모, 잃었으면 흐린 마름모
    html += '<span class="life-mark' + (i < game.life ? '' : ' is-lost') + '"></span>';
  }
  el.hearts.innerHTML = html;
}

// 일본 경찰에게 들켰을 때 부르는 함수예요
function caught(reason) {
  Sound.ppyong();          // 뿅... 하고 시무룩한 소리가 나요
  game.life -= 1;          // 하트가 하나 줄어요
  drawHearts();

  // 하트가 부르르 떨려요
  el.hearts.classList.remove('shake');
  void el.hearts.offsetWidth;
  el.hearts.classList.add('shake');

  // 하트를 다 잃으면 게임이 끝나요
  if (game.life <= 0) {
    gameOver(reason);
    return;
  }

  // 아직 하트가 남았으면, 이번 장을 처음부터 다시 해요
  showCaughtMessage(reason);
}

// "들켰다!" 알림을 보여주고, 잠시 뒤 이번 장을 다시 시작해요
function showCaughtMessage(reason) {
  stopMission();   // 하던 미션을 멈춰요
  Input.clear();   // 들킨 동안에는 버튼이 안 먹게 잠깐 꺼둬요

  el.stage.innerHTML =
    '<div class="caught-box">' +
      '<div class="caught-emoji">' + MissionUtil.figure('police', 'is-looking') + '</div>' +
      '<h3>들켰다!</h3>' +
      '<p>' + (reason || '일본 경찰에게 발각되었어요.') + '</p>' +
      '<p class="caught-sub">이번 장을 처음부터 다시 해요</p>' +
    '</div>';

  // 2초 뒤에 같은 장을 다시 시작해요
  setTimeout(startChapter, 2000);
}


/* ------------------------------------------------------------------
   6. 장(챕터) 진행하기
   ------------------------------------------------------------------ */

// 지금 장의 정보를 꺼내와요
function currentChapter() {
  return CHAPTERS[game.chapterIndex];
}

// 한 장을 화면에 펼쳐요
function startChapter() {
  const ch = currentChapter();

  // 점수판에 장 이름을 써요
  el.chapterName.textContent = ch.name;

  // 말풍선에 이야기와 미션을 써요
  el.bubbleFace.innerHTML = MissionUtil.figure(ch.face);
  el.bubbleText.textContent = ch.story + ' ' + ch.mission;

  // 6장은 어두운 밤에서 시작해요.
  // 태극기를 흔들어야 새벽이 밝아와요! (ch6.js 에서 밝게 바꿔줘요)
  document.body.classList.remove('liberation');

  // 장이 바뀌면 하던 미션과 버튼 약속을 깨끗이 정리해요
  stopMission();
  Input.clear();

  // 이번 장의 미션 게임을 찾아봐요
  const mission = MISSIONS[ch.id];

  if (mission) {
    // 미션이 있으면 시작해요!
    // 성공하면 clearChapter, 들키면 caught 를 불러달라고 부탁해요.
    currentMission = mission;
    if (mission.hint) el.bubbleText.textContent = mission.hint;
    mission.start(clearChapter, caught);

  } else {
    // 아직 안 만든 장은 연습용 버튼을 보여줘요
    currentMission = null;
    el.stage.innerHTML =
      '<div style="text-align:center">' +
        '<p class="todo-note">' + ch.id + '장 미션은 다음에 만들 거예요</p>' +
        '<button id="btn-next" class="big-btn" style="margin-top:18px">미션 성공 (연습용)</button>' +
        '<button id="btn-fail" class="small-btn" style="margin-top:12px">들키기 (연습용)</button>' +
      '</div>';

    document.getElementById('btn-next').addEventListener('click', clearChapter);
    document.getElementById('btn-fail').addEventListener('click', function () {
      caught('연습으로 들켜 봤어요!');
    });

    // 조종기 4번 버튼(다음)을 눌러도 넘어가요!
    Input.on('next', clearChapter);
  }
}

/* 지금 하고 있는 미션을 기억해둬요 (장을 옮길 때 정리하려고요) */
let currentMission = null;

/* 하던 미션을 깨끗이 정리해요 */
function stopMission() {
  if (currentMission && currentMission.stop) currentMission.stop();
  currentMission = null;
}

// 이번 장의 미션을 성공했을 때 부르는 함수예요
function clearChapter() {
  const ch = currentChapter();

  addScore(ch.point);   // 이번 장의 점수를 더해요

  // 마지막 장이었다면 게임이 끝나요
  if (game.chapterIndex >= CHAPTERS.length - 1) {
    finishGame();
    return;
  }

  // 아니면 다음 장으로 넘어가요
  game.chapterIndex += 1;
  startChapter();
}


/* ------------------------------------------------------------------
   7. 게임 시작과 끝
   ------------------------------------------------------------------ */

// 게임을 처음부터 시작해요
function startGame() {
  game.score = 0;
  game.chapterIndex = 0;
  game.life = MAX_LIFE;
  document.body.classList.remove('liberation');
  drawScore();
  drawHearts();
  if (Sound.isOn()) Sound.startBgm();   // 잔잔한 배경음악을 틀어요
  showScreen('game');
  startChapter();
}

// 모든 임무를 마쳤을 때 (이겼어요!)
function finishGame() {
  stopMission();
  Input.clear();
  Sound.fanfare();            // 짜잔! 축하 소리
  el.endEmoji.innerHTML = '광복';
  el.endTitle.textContent = '대한 독립 만세';
  el.endMessage.textContent = '모든 임무를 마치고 독립을 이루었어요. 대한 독립 만세!';
  el.endScore.textContent = game.score;
  showScreen('end');
}

// 하트를 모두 잃었을 때 (졌어요)
function gameOver(reason) {
  stopMission();
  Input.clear();
  Sound.stopBgm();            // 배경음악을 멈춰요
  document.body.classList.remove('liberation');
  el.endEmoji.innerHTML = MissionUtil.figure('police', 'is-looking');
  el.endTitle.textContent = '붙잡히고 말았다';
  el.endMessage.textContent = (reason || '일본 경찰에게 발각되었어요.') +
                              ' 하지만 포기하지 말아요. 다시 도전!';
  el.endScore.textContent = game.score;
  showScreen('end');
}


/* ==================================================================
   7-2. 5~8번 버튼이 하는 일
        이 버튼들은 게임 어디서나 항상 눌러서 쓸 수 있어요.
   ================================================================== */

/* ---------- 8번 버튼 : 글씨 크기 🔍 ----------
   아케이드 화면이 멀리 있으면 글씨가 작아 보여요.
   8번을 누를 때마다 글씨가 커지고, 제일 커지면 다시 처음 크기로 돌아와요. */
const ZOOM_STEPS = [1, 1.15, 1.3];   // 100% → 115% → 130% → 다시 100%
let zoomStep = 0;

function toggleZoom() {
  zoomStep = (zoomStep + 1) % ZOOM_STEPS.length;   // 다음 크기로 넘어가요
  const size = ZOOM_STEPS[zoomStep];

  // 화면 전체를 그만큼 크게 그려요
  document.body.style.zoom = size;

  showToast('글씨 크기 ' + Math.round(size * 100) + '%');
}


/* ---------- 5번 버튼 : 소리 크기 🔊 ----------
   누를 때마다 소리가 한 단계씩 바뀌어요.
   꺼짐 → 작게 → 보통 → 크게 → 다시 꺼짐 ... */
function changeVolume() {
  const level = Sound.cycleVolume();
  showToast(level.label);
  if (level.value > 0) Sound.pok();   // 바뀐 크기를 소리로 확인시켜줘요
}

/* 화면 아래에 잠깐 떴다 사라지는 알림이에요 */
let toastTimer = null;
function showToast(text) {
  const node = document.getElementById('zoom-toast');
  node.textContent = text;
  node.classList.add('is-on');

  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () {
    node.classList.remove('is-on');
  }, 1200);
}


/* ---------- 덮개 화면 도우미 ----------
   멈추기 · 도움말 · 처음으로 가 모두 이 창을 함께 써요. */
const overlay = {
  box:     document.getElementById('overlay'),
  emoji:   document.getElementById('overlay-emoji'),
  title:   document.getElementById('overlay-title'),
  body:    document.getElementById('overlay-body'),
  actions: document.getElementById('overlay-actions'),
};

let overlayOpen = false;   // 지금 덮개가 열려 있는지 기억해요

/* 덮개 창을 열어요.
   buttons 는 [{ label: '글자', run: 누르면할일 }] 모양이에요. */
function openOverlay(emoji, title, bodyHtml, buttons) {
  overlay.emoji.textContent = emoji;
  overlay.title.textContent = title;
  overlay.body.innerHTML = bodyHtml;
  overlay.actions.innerHTML = '';

  // 아래쪽 버튼들을 만들어 붙여요
  (buttons || []).forEach(function (b) {
    const btn = document.createElement('button');
    btn.className = b.big ? 'big-btn' : 'small-btn';
    btn.textContent = b.label;
    btn.addEventListener('click', b.run);
    overlay.actions.appendChild(btn);
  });

  overlay.box.classList.add('is-on');
  overlayOpen = true;
  game.paused = true;          // 게임을 잠깐 멈춰요
  Input.setBlocked(true);      // 게임 조작도 잠깐 쉬어요
}

/* 덮개 창을 닫아요 */
function closeOverlay() {
  overlay.box.classList.remove('is-on');
  overlayOpen = false;
  game.paused = false;         // 다시 게임이 움직여요
  Input.setBlocked(false);     // 게임 조작도 다시 켜요
}


/* ---------- 6번 버튼 : 잠깐 멈추기 ⏸️ ---------- */
function togglePause() {
  if (overlayOpen) { closeOverlay(); return; }   // 이미 열려 있으면 닫아요

  const lv = Sound.level();
  openOverlay('멈춤', '잠깐 멈춤',
    '<p style="text-align:center">잠깐 쉬는 중이에요.<br>' +
    '6번 버튼을 다시 누르면 이어서 해요!</p>' +
    '<p style="text-align:center;margin-top:10px;opacity:.75;font-size:13px">' +
    '지금 소리 : <b>' + lv.icon + ' ' + lv.label + '</b>' +
    ' &nbsp;(5번 버튼으로 바꿔요)</p>',
    [
      { label: '이어서 하기', run: closeOverlay, big: true },
    ]);
}


/* ---------- 조작 방법 보기 ❓ ----------
   시작 화면의 '설명란'에서 볼 수 있어요. */
function showHelp() {
  if (overlayOpen) { closeOverlay(); return; }

  openOverlay('조작', '조작 방법', buildControlRows(),
    [{ label: '닫기', run: closeOverlay, big: true }]);
}


/* ---------- 7번 버튼 : 처음으로 🏠 ----------
   잘못 눌러서 게임이 날아가면 속상하니까, 한 번 더 물어봐요. */
function askGoHome() {
  if (overlayOpen) { closeOverlay(); return; }

  openOverlay('처음', '처음으로 갈까요?',
    '<p style="text-align:center">지금까지 모은 독립 포인트가 사라져요.<br>정말 처음 화면으로 갈까요?</p>',
    [
      { label: '아니요, 계속할래요', run: closeOverlay, big: true },
      { label: '네, 처음으로', run: function () { closeOverlay(); goTitle(); } },
    ]);
}


/* ---------- 5~8번 버튼을 진짜로 연결해요 ----------
   onSystem 으로 걸면 장이 바뀌어도 지워지지 않아요! */
Input.onSystem('volume', changeVolume);   // 5번
Input.onSystem('pause',  togglePause);    // 6번
Input.onSystem('home',   askGoHome);      // 7번
Input.onSystem('zoom',   toggleZoom);     // 8번


/* ------------------------------------------------------------------
   8. 버튼에 기능을 연결해요
      마우스로 눌러도 되고, 키보드나 조종기로 눌러도 돼요.
   ------------------------------------------------------------------ */

// 시작 화면으로 돌아가요
function goTitle() {
  stopMission();
  Input.clear();
  document.body.classList.remove('liberation');
  showScreen('title');
  // 시작 화면에서는 어느 버튼을 눌러도 게임이 시작돼요
  Input.on('next', startGame);
  Input.on('jump', startGame);
}

el.btnStart.addEventListener('click', startGame);
el.btnRetry.addEventListener('click', goTitle);

/* 시작 화면 왼쪽 아래 '설명란' ❓ 버튼이에요.
   누르면 게임 이야기와 목표를 알려줘요. */
document.getElementById('btn-info').addEventListener('click', function () {
  openOverlay('설명', '게임 설명',
    '<p>때는 <b>1940년대 일제강점기</b>.</p>' +
    '<p>조선은 일본의 지배를 받고 있고,<br>' +
    '사람들은 자유를 잃은 채 힘들게 살고 있어요.</p>' +
    '<p>주인공은 학교에서 돌아오는 길에<br>' +
    '독립운동가를 만나 비밀 임무를 맡게 돼요.</p>' +
    '<p style="color:#ffe9a8;margin-top:10px">' +
    '<b>목표는 단 하나, 독립!</b></p>' +
    '<p style="margin-top:10px">임무 6개를 하나씩 해결하면 광복을 맞이해요.<br>' +
    '일본 경찰에게 들키지 않게 조심하세요!</p>' +
    '<h4 style="margin:16px 0 8px">조작 방법</h4>' +
    buildControlRows(),
    [{ label: '알겠어요', run: closeOverlay, big: true }]);
});

/* 조작 방법 표를 만들어요.
   버튼 정보표를 그대로 읽어오니까, 버튼이 바뀌면 설명도 저절로 바뀌어요! */
function buildControlRows() {
  let rows = '<div class="help-row">' +
               '<span class="no">🕹️</span><span>움직이기</span>' +
               '<span class="keys">방향키 / 스틱</span>' +
             '</div>';

  Input.buttons.forEach(function (b) {
    rows += '<div class="help-row">' +
              '<span class="no">' + b.no + '</span>' +
              '<span>' + b.emoji + ' ' + b.label + '</span>' +
              '<span class="keys">' + b.keys.join(' / ') + '</span>' +
            '</div>';
  });
  return rows;
}

/* ==================================================================
   조종기 확인 화면
   ★ 아케이드 조종기를 꽂았을 때 신호가 제대로 들어오는지
     눈으로 볼 수 있어요. 잘 안 될 때 원인을 찾는 데 써요.
   ================================================================== */
let padTestTimer = null;

function openPadTest() {
  openOverlay('확인', '조종기 확인',
    '<p style="text-align:center;margin-bottom:12px">' +
      '조종기의 스틱과 버튼을 하나씩 움직여 보세요.<br>' +
      '들어오는 신호가 아래에 그대로 나타나요.</p>' +
    '<div id="pad-test-body" class="pad-test"></div>',
    [
      { label: '조종기 맞추기', run: function () { closePadTest(); startSetup(); }, big: true },
      { label: '기본값으로', run: function () { Input.clearMap(); drawPadTest(); } },
      { label: '닫기', run: closePadTest },
    ]);

  // 1초에 여러 번 다시 그려서 실시간으로 보여줘요
  clearInterval(padTestTimer);
  padTestTimer = setInterval(drawPadTest, 100);
  drawPadTest();
}

function closePadTest() {
  clearInterval(padTestTimer);
  padTestTimer = null;
  closeOverlay();
}

function drawPadTest() {
  const box = document.getElementById('pad-test-body');
  if (!box) { clearInterval(padTestTimer); return; }

  const pads = Input.readPads();

  /* --- 조종기가 아예 안 잡힐 때 --- */
  if (pads.length === 0) {
    box.innerHTML =
      '<p class="pad-test-none">조종기가 잡히지 않았어요.</p>' +
      '<ul class="pad-test-help">' +
        '<li>조종기의 <b>아무 버튼이나 한 번</b> 눌러 보세요. ' +
            '(브라우저는 버튼을 눌러야 조종기를 알아봐요)</li>' +
        '<li>왼쪽 스위치(기종 선택)를 <b>XINPUT / NS</b> 쪽, ' +
            '즉 <b>위쪽</b>으로 딸깍 미세요.</li>' +
        '<li>오른쪽 스위치(스틱 신호)를 <b>DP</b>, ' +
            '즉 <b>가운데</b>에 두세요.</li>' +
        '<li>USB 선을 뺐다가 다시 꽂고, 이 화면을 새로고침하세요.</li>' +
      '</ul>';
    return;
  }

  /* --- 조종기가 잡혔을 때 : 신호를 그대로 보여줘요 --- */
  const pad = pads[0];

  // 방향이 지금 눌려 있는지
  const dirText = ['up', 'down', 'left', 'right'].map(function (name) {
    const on = Input.dir[name];
    const mark = { up: '▲', down: '▼', left: '◀', right: '▶' }[name];
    return '<span class="pt-dir' + (on ? ' is-on' : '') + '">' + mark + '</span>';
  }).join('');

  // 버튼 8개가 눌려 있는지
  let btnText = '';
  for (let i = 0; i < 8; i++) {
    const on = pad.buttons[i];
    btnText += '<span class="pt-btn' + (on ? ' is-on' : '') + '">' + (i + 1) + '</span>';
  }

  // 축(스틱) 값들
  const axesText = pad.axes.map(function (v, i) {
    const moved = Math.abs(v) > 0.3;
    return '<span class="pt-axis' + (moved ? ' is-on' : '') + '">' +
             i + ' : ' + v.toFixed(2) +
           '</span>';
  }).join('');

  box.innerHTML =
    '<div class="pt-row"><span class="pt-label">이름</span>' +
      '<span class="pt-value">' + pad.id.slice(0, 42) + '</span></div>' +
    '<div class="pt-row"><span class="pt-label">방식</span>' +
      '<span class="pt-value">' +
        (pad.mapping === 'standard' ? 'XINPUT (표준) — 좋아요' : 'DINPUT (표준 아님)') +
      '</span></div>' +
    '<div class="pt-row"><span class="pt-label">방향</span>' +
      '<span class="pt-value">' + dirText + '</span></div>' +
    '<div class="pt-row"><span class="pt-label">버튼</span>' +
      '<span class="pt-value">' + btnText + '</span></div>' +
    '<div class="pt-row"><span class="pt-label">축</span>' +
      '<span class="pt-value pt-axes">' + axesText + '</span></div>' +
    '<p class="pad-test-tip">' +
      '<b>스위치 두 개를 이렇게 두세요</b><br>' +
      '· 왼쪽(기종 선택) → <b>XINPUT / NS</b> (위쪽)<br>' +
      '· 오른쪽(스틱 신호) → <b>DP</b> (가운데)<br><br>' +
      '스틱을 움직였는데 위 「방향」에 불이 안 들어오면 ' +
      '「조종기 맞추기」를 해보세요.</p>';
}

document.getElementById('btn-pad-test').addEventListener('click', openPadTest);


/* ==================================================================
   조종기 맞추기 (하나씩 따라 하기)

   ★ 조종기는 종류마다 신호가 달라요.
     그래서 "스틱을 위로 미세요" 하고 물어보고,
     선생님이 실제로 움직이면 그 신호를 그대로 기억해요.
     이렇게 하면 어떤 조종기든 무조건 작동해요!
   ================================================================== */

/* 물어볼 순서예요. 방향 4개 + 버튼 8개 */
const SETUP_STEPS = [
  { kind: 'dir', key: 'up',    ask: '스틱을 위로 미세요',    icon: '▲' },
  { kind: 'dir', key: 'down',  ask: '스틱을 아래로 미세요',  icon: '▼' },
  { kind: 'dir', key: 'left',  ask: '스틱을 왼쪽으로 미세요', icon: '◀' },
  { kind: 'dir', key: 'right', ask: '스틱을 오른쪽으로 미세요', icon: '▶' },
  { kind: 'act', key: 'jump',   ask: '「점프」로 쓸 버튼을 누르세요' },
  { kind: 'act', key: 'talk',   ask: '「말걸기」로 쓸 버튼을 누르세요' },
  { kind: 'act', key: 'attack', ask: '「공격」으로 쓸 버튼을 누르세요' },
  { kind: 'act', key: 'next',   ask: '「다음」으로 쓸 버튼을 누르세요' },
  { kind: 'act', key: 'volume', ask: '「소리 크기」로 쓸 버튼을 누르세요' },
  { kind: 'act', key: 'pause',  ask: '「잠시 멈춤」으로 쓸 버튼을 누르세요' },
  { kind: 'act', key: 'home',   ask: '「처음으로」로 쓸 버튼을 누르세요' },
  { kind: 'act', key: 'zoom',   ask: '「글씨 크기」로 쓸 버튼을 누르세요' },
];

let setupIndex = 0;
let setupMap = null;
let setupBase = null;      // 누르기 직전의 조종기 상태 (사진)
let setupTimer = null;

/* 설정을 시작해요 */
function startSetup() {
  setupIndex = 0;
  setupMap = { dirs: {}, acts: {} };
  openOverlay('설정', '조종기 맞추기',
    '<div id="setup-body" class="setup"></div>',
    [
      { label: '이 단계 건너뛰기', run: skipSetupStep },
      { label: '그만두기', run: stopSetup },
    ]);
  nextSetupStep();
}

/* 다음 단계로 넘어가요 */
function nextSetupStep() {
  clearInterval(setupTimer);

  if (setupIndex >= SETUP_STEPS.length) { finishSetup(); return; }

  drawSetup();

  // 잠깐 기다렸다가 지금 상태를 사진 찍어요
  // (앞 단계에서 누른 버튼을 아직 떼지 않았을 수 있으니까요)
  setTimeout(function () {
    setupBase = Input.snapshot();
    setupTimer = setInterval(watchSetup, 60);
  }, 450);
}

/* 조종기에서 새 신호가 들어오는지 지켜봐요 */
function watchSetup() {
  if (!setupBase) { setupBase = Input.snapshot(); return; }

  const found = Input.findChange(setupBase);
  if (!found) return;

  const step = SETUP_STEPS[setupIndex];
  if (step.kind === 'dir') setupMap.dirs[step.key] = found;
  else                     setupMap.acts[step.key] = found;

  Sound.pok();
  setupIndex += 1;
  nextSetupStep();
}

/* 이 단계를 건너뛰어요 (기본값을 그대로 써요) */
function skipSetupStep() {
  setupIndex += 1;
  nextSetupStep();
}

/* 설정 화면을 그려요 */
function drawSetup() {
  const box = document.getElementById('setup-body');
  if (!box) return;

  const step = SETUP_STEPS[setupIndex];
  const pads = Input.readPads();

  if (pads.length === 0) {
    box.innerHTML =
      '<p class="setup-none">조종기가 잡히지 않았어요.<br>' +
      '조종기의 아무 버튼이나 한 번 눌러 보세요.</p>';
    return;
  }

  // 지금까지 정한 것들을 보여줘요
  let done = '';
  for (let i = 0; i < setupIndex; i++) {
    const s = SETUP_STEPS[i];
    const rule = (s.kind === 'dir') ? setupMap.dirs[s.key] : setupMap.acts[s.key];
    done += '<div class="setup-done">' +
              '<span>' + (s.icon || SETUP_NAMES[s.key]) + '</span>' +
              '<span>' + (rule ? rule.label : '건너뜀') + '</span>' +
            '</div>';
  }

  box.innerHTML =
    '<p class="setup-count">' + (setupIndex + 1) + ' / ' + SETUP_STEPS.length + '</p>' +
    '<p class="setup-ask">' + step.ask + '</p>' +
    '<p class="setup-wait">기다리는 중…</p>' +
    (done ? '<div class="setup-list">' + done + '</div>' : '');
}

/* 동작 이름을 한글로 보여주려고 만든 표예요 */
const SETUP_NAMES = {
  jump: '점프', talk: '말걸기', attack: '공격', next: '다음',
  volume: '소리', pause: '멈춤', home: '처음', zoom: '글씨',
};

/* 다 맞췄어요! */
function finishSetup() {
  clearInterval(setupTimer);
  Input.saveMap(setupMap);
  Sound.fanfare();

  let list = '';
  SETUP_STEPS.forEach(function (s) {
    const rule = (s.kind === 'dir') ? setupMap.dirs[s.key] : setupMap.acts[s.key];
    list += '<div class="setup-done">' +
              '<span>' + (s.icon || SETUP_NAMES[s.key]) + '</span>' +
              '<span>' + (rule ? rule.label : '건너뜀') + '</span>' +
            '</div>';
  });

  openOverlay('완료', '조종기 맞추기 끝!',
    '<p style="text-align:center;margin-bottom:12px">' +
      '이제 조종기로 게임을 할 수 있어요.<br>' +
      '이 설정은 저장돼서 다음에 켜도 그대로예요.</p>' +
    '<div class="setup-list">' + list + '</div>',
    [{ label: '좋아요', run: closeOverlay, big: true }]);
}

/* 도중에 그만둬요 */
function stopSetup() {
  clearInterval(setupTimer);
  setupTimer = null;
  closeOverlay();
}


/* 화면의 모든 버튼을 마우스로 누를 때도 '뽁' 소리가 나요 */
document.addEventListener('click', function (e) {
  if (e.target.closest('button') && !e.target.closest('.pad-btn')) Sound.pok();
});

// 게임이 켜지면 시작 화면부터 보여줘요
goTitle();
