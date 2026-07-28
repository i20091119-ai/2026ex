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
    face: '🧑',
    story: '학교에서 돌아오는 길, 독립운동가 동료를 만났어요.',
    mission: '일본 경찰에게 들키지 않고 비밀 편지를 전달하세요!',
    point: 10,
  },
  {
    id: 2,
    name: '2장 · 김구 선생님과의 만남',
    face: '👴',
    story: '비밀 아지트에서 김구 선생님을 만났어요.',
    mission: '"나라를 되찾으려면 많은 사람의 용기가 필요하단다." 역사 퀴즈 3개를 맞혀 보세요!',
    point: 0, // ❓ 기획서에 점수가 안 적혀 있어요. 선생님께 여쭤볼 부분이에요.
  },
  {
    id: 3,
    name: '3장 · 태극기 지키기',
    face: '🇰🇷',
    story: '동료가 숨겨둔 태극기를 일본 경찰보다 먼저 찾아야 해요.',
    mission: '미로를 통과해서 태극기를 찾으세요! (경찰 조심!)',
    point: 10,
  },
  {
    id: 4,
    name: '4장 · 만세운동 준비',
    face: '👧',
    story: '유관순을 만나 만세운동을 준비해요.',
    mission: '사람들에게 태극기 5개를 나누어 주세요!',
    point: 0, // ❓ '+3포인트'가 1개당인지 전체인지 아직 안 정해졌어요.
  },
  {
    id: 5,
    name: '5장 · 독립을 향하여',
    face: '⚔️',
    story: '주인공과 김구 선생님, 독립군이 마지막 싸움을 준비해요.',
    mission: '일본군과의 싸움에서 승리하세요!',
    point: 30,
  },
  {
    id: 6,
    name: '6장 · 광복의 날',
    face: '🎉',
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
  let text = '';
  for (let i = 0; i < MAX_LIFE; i++) {
    text += (i < game.life) ? '❤️' : '🖤';
  }
  el.hearts.textContent = text;
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
      '<div class="caught-emoji">👮</div>' +
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
  el.bubbleFace.textContent = ch.face;
  el.bubbleText.textContent = ch.story + ' ' + ch.mission;

  // 6장(광복)이 되면 화면이 환하게 밝아져요! ☀️
  document.body.classList.toggle('liberation', ch.id === 6);

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
  el.endEmoji.textContent = '🎉';
  el.endTitle.textContent = '광복!';
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
  el.endEmoji.textContent = '😢';
  el.endTitle.textContent = '붙잡혔어요...';
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

  showToast('🔍  글씨 크기 ' + Math.round(size * 100) + '%');
}


/* ---------- 5번 버튼 : 소리 크기 🔊 ----------
   누를 때마다 소리가 한 단계씩 바뀌어요.
   꺼짐 → 작게 → 보통 → 크게 → 다시 꺼짐 ... */
function changeVolume() {
  const level = Sound.cycleVolume();
  showToast(level.icon + '  ' + level.label);
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
  openOverlay('⏸️', '잠깐 멈춤',
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

  openOverlay('❓', '조작 방법', buildControlRows(),
    [{ label: '닫기', run: closeOverlay, big: true }]);
}


/* ---------- 7번 버튼 : 처음으로 🏠 ----------
   잘못 눌러서 게임이 날아가면 속상하니까, 한 번 더 물어봐요. */
function askGoHome() {
  if (overlayOpen) { closeOverlay(); return; }

  openOverlay('🏠', '처음으로 갈까요?',
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
  openOverlay('📜', '게임 설명',
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

/* 화면의 모든 버튼을 마우스로 누를 때도 '뽁' 소리가 나요 */
document.addEventListener('click', function (e) {
  if (e.target.closest('button') && !e.target.closest('.pad-btn')) Sound.pok();
});

// 게임이 켜지면 시작 화면부터 보여줘요
goTitle();
