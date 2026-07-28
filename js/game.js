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
const game = {
  score: 0,        // 지금까지 모은 독립 포인트
  chapterIndex: 0, // 지금 몇 번째 장인지 (0부터 세요)
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

  // 'pop' 이름표를 잠깐 붙였다 떼면 커졌다 작아지는 애니메이션이 나와요
  el.score.classList.remove('pop');
  void el.score.offsetWidth;    // 애니메이션을 처음부터 다시 트는 방법이에요
  el.score.classList.add('pop');
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

  // 아직 미션 게임은 만드는 중이라, 임시 안내와 버튼을 보여줘요
  el.stage.innerHTML =
    '<div style="text-align:center">' +
      '<p class="todo-note">' + ch.id + '장 미션은 다음 단계에서 만들 거예요</p>' +
      '<button id="btn-next" class="big-btn" style="margin-top:18px">미션 성공 (연습용)</button>' +
    '</div>';

  // 연습용 버튼을 누르면 이번 장을 성공한 것으로 쳐요
  document.getElementById('btn-next').addEventListener('click', clearChapter);
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
  document.body.classList.remove('liberation');
  drawScore();
  showScreen('game');
  startChapter();
}

// 모든 임무를 마쳤을 때
function finishGame() {
  el.endEmoji.textContent = '🎉';
  el.endTitle.textContent = '광복!';
  el.endMessage.textContent = '모든 임무를 마치고 독립을 이루었어요. 대한 독립 만세!';
  el.endScore.textContent = game.score;
  showScreen('end');
}


/* ------------------------------------------------------------------
   8. 버튼에 기능을 연결해요
   ------------------------------------------------------------------ */
el.btnStart.addEventListener('click', startGame);
el.btnRetry.addEventListener('click', function () {
  document.body.classList.remove('liberation');
  showScreen('title');
});
