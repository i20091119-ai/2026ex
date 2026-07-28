/* ==================================================================
   2장 · 김구 선생님과의 만남  (ch2.js)

   비밀 아지트에서 김구 선생님을 만나 역사 퀴즈 3개를 풀어요.

   - 한 문제 맞힐 때마다 독립 포인트 +5점 (3개 다 맞히면 15점)
   - 문제는 쉬움 → 보통 → 어려움 순서로 점점 어려워져요
   - 틀리면 선생님이 정답을 알려주고 그 문제를 다시 물어봐요

   조작 : 스틱(방향키) 위 아래로 답을 고르고
          2번 버튼(말걸기)으로 대답해요. 마우스로 눌러도 돼요.
   ================================================================== */

MISSIONS[2] = (function () {

  /* ----------------------------------------------------------------
     1. 문제 보관함
        난이도별로 3문제씩, 모두 9문제를 담아뒀어요.
        q     : 문제
        a     : 정답
        wrong : 틀린 보기 2개
        why   : 틀렸을 때 알려줄 설명
     ---------------------------------------------------------------- */
  const QUIZ_BANK = {

    easy: [
      { q: '우리나라 국기의 이름은 무엇일까요?',
        a: '태극기', wrong: ['일장기', '성조기'],
        why: '일장기는 일본, 성조기는 미국의 국기예요.' },

      { q: '광복절은 몇 월 며칠일까요?',
        a: '8월 15일', wrong: ['3월 1일', '6월 25일'],
        why: '1945년 8월 15일, 우리나라가 광복을 맞이했어요.' },

      { q: '3·1운동 때 사람들이 다 함께 외친 말은?',
        a: '대한 독립 만세', wrong: ['대한민국 만세', '광복 만세'],
        why: '1919년 3월 1일, 온 나라에 "대한 독립 만세" 소리가 울려 퍼졌어요.' },
    ],

    normal: [
      { q: '3·1운동에서 만세를 부르다 붙잡힌 소녀는 누구일까요?',
        a: '유관순', wrong: ['신사임당', '논개'],
        why: '유관순은 열일곱 살에 만세운동을 이끌었어요.' },

      { q: '대한민국 임시정부를 이끈 분은 누구일까요?',
        a: '김구', wrong: ['이순신', '세종대왕'],
        why: '김구 선생님은 임시정부의 주석으로 독립운동을 이끌었어요.' },

      { q: '태극기 가운데 있는 동그란 무늬의 이름은?',
        a: '태극', wrong: ['무궁화', '해와 달'],
        why: '빨강과 파랑이 어우러진 이 무늬를 태극이라고 해요.' },
    ],

    hard: [
      { q: '대한민국 임시정부가 세워진 나라는 어디일까요?',
        a: '중국', wrong: ['일본', '미국'],
        why: '1919년 중국 상하이에 대한민국 임시정부를 세웠어요.' },

      { q: '김구 선생님이 쓴 책의 이름은 무엇일까요?',
        a: '백범일지', wrong: ['난중일기', '목민심서'],
        why: '백범은 김구 선생님의 호예요. 난중일기는 이순신 장군이 썼어요.' },

      { q: '우리나라가 일본에게 나라를 빼앗긴 해는 언제일까요?',
        a: '1910년', wrong: ['1945년', '1950년'],
        why: '1910년부터 1945년까지, 35년 동안 나라를 빼앗겼어요.' },
    ],
  };

  /* ----------------------------------------------------------------
     2. 이번에 낼 문제 3개를 고르는 곳
        [난이도, 몇 번째 문제] 로 적어요. (0이 1번, 1이 2번, 2가 3번)

        ★ 문제를 바꾸고 싶으면 아래 숫자만 고치면 돼요! ★
        지금은 쉬움 3번 → 보통 3번 → 어려움 3번 이에요.
     ---------------------------------------------------------------- */
  const PICK = [
    ['easy',   2],   // 쉬움 3번 : 3·1운동 때 외친 말
    ['normal', 2],   // 보통 3번 : 태극기 가운데 무늬
    ['hard',   2],   // 어려움 3번 : 나라를 빼앗긴 해
  ];

  const POINT_PER_QUIZ = 5;   // 한 문제 맞힐 때마다 주는 점수


  /* ----------------------------------------------------------------
     3. 이 미션이 기억해야 할 것들
     ---------------------------------------------------------------- */
  let quizIndex = 0;       // 지금 몇 번째 문제인지
  let choices = [];        // 지금 문제의 보기 3개 (섞은 것)
  let cursor = 0;          // 지금 고르고 있는 보기 번호
  let locked = false;      // 답을 맞춘 뒤 잠깐 못 누르게 잠그는 값
  let onSuccess = null;
  let node = {};


  /* ----------------------------------------------------------------
     4. 도우미
     ---------------------------------------------------------------- */

  /* PICK 에 적힌 대로 문제를 꺼내와요 */
  function getQuiz(i) {
    const level = PICK[i][0];
    const number = PICK[i][1];
    return QUIZ_BANK[level][number];
  }

  /* 보기 순서를 섞어요. 그래야 정답이 항상 같은 자리에 있지 않아요! */
  function shuffle(list) {
    const copy = list.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = copy[i];
      copy[i] = copy[j];
      copy[j] = temp;
    }
    return copy;
  }


  /* ----------------------------------------------------------------
     5. 화면 그리기
     ---------------------------------------------------------------- */

  /* 새 문제를 화면에 펼쳐요 */
  function showQuiz() {
    const quiz = getQuiz(quizIndex);

    // 정답과 틀린 보기를 합쳐서 섞어요
    choices = shuffle([quiz.a].concat(quiz.wrong));
    cursor = 0;
    locked = false;

    node.count.textContent = (quizIndex + 1) + ' / ' + PICK.length;
    node.question.textContent = quiz.q;
    node.talk.textContent = '';
    node.talk.className = 'm2-talk';

    drawChoices();
  }

  /* 보기 3개를 그려요 */
  function drawChoices() {
    node.choices.innerHTML = choices.map(function (text, i) {
      return '<button class="m2-choice' + (i === cursor ? ' is-on' : '') + '" ' +
             'data-index="' + i + '">' +
               '<span class="m2-num">' + (i + 1) + '</span>' +
               '<span>' + text + '</span>' +
             '</button>';
    }).join('');

    // 마우스로 보기를 눌러도 답이 돼요
    node.choices.querySelectorAll('.m2-choice').forEach(function (btn) {
      btn.addEventListener('click', function () {
        cursor = Number(btn.dataset.index);
        answer();
      });
    });
  }

  /* 고르는 자리를 위아래로 옮겨요 */
  function moveCursor(step) {
    if (locked) return;
    cursor = (cursor + step + choices.length) % choices.length;
    drawChoices();
  }


  /* ----------------------------------------------------------------
     6. 답을 말했을 때
     ---------------------------------------------------------------- */
  function answer() {
    if (locked) return;
    locked = true;

    const quiz = getQuiz(quizIndex);
    const picked = choices[cursor];

    if (picked === quiz.a) {
      /* ---- 맞았어요! ---- */
      node.talk.textContent = '옳거니! 잘 알고 있구나.';
      node.talk.className = 'm2-talk is-right';
      markChoice(true);

      addScore(POINT_PER_QUIZ);        // 한 문제당 5점

      // 잠시 뒤 다음 문제로 넘어가요
      setTimeout(function () {
        quizIndex += 1;
        if (quizIndex >= PICK.length) {
          onSuccess();                 // 3문제를 다 맞혔어요!
        } else {
          showQuiz();
        }
      }, 1200);

    } else {
      /* ---- 틀렸어요 ---- */
      if (window.Sound) Sound.ppyong();

      node.talk.textContent = '아니란다. 정답은 「' + quiz.a + '」 이야. ' + quiz.why;
      node.talk.className = 'm2-talk is-wrong';
      markChoice(false);

      // 잠시 뒤 같은 문제를 다시 물어봐요 (보기 순서는 새로 섞여요)
      setTimeout(showQuiz, 2600);
    }
  }

  /* 고른 보기에 맞음/틀림 표시를 해요 */
  function markChoice(isRight) {
    const quiz = getQuiz(quizIndex);

    node.choices.querySelectorAll('.m2-choice').forEach(function (btn, i) {
      if (i === cursor) btn.classList.add(isRight ? 'is-right' : 'is-wrong');
      // 틀렸을 때는 진짜 정답도 함께 알려줘요
      if (!isRight && choices[i] === quiz.a) btn.classList.add('is-answer');
    });
  }


  /* ----------------------------------------------------------------
     7. 미션 시작하기
     ---------------------------------------------------------------- */
  function start(success) {
    onSuccess = success;
    quizIndex = 0;

    const stage = MissionUtil.setStage(
      '<div class="m2-scene">' +

        // 왼쪽 : 김구 선생님
        '<div class="m2-person">' +
          MissionUtil.figure('kimgu', 'is-looking') +
          '<span class="m2-name">김구</span>' +
        '</div>' +

        // 오른쪽 : 문제와 보기
        '<div class="m2-panel">' +
          '<div class="m2-head">' +
            '<span class="m2-label">역사 문제</span>' +
            '<span class="m2-count"></span>' +
          '</div>' +
          '<p class="m2-question"></p>' +
          '<div class="m2-choices"></div>' +
          '<p class="m2-talk"></p>' +
          '<p class="m2-tip">스틱 위·아래로 고르고, 2번 버튼으로 대답한다</p>' +
        '</div>' +

      '</div>'
    );

    node = {
      count:    stage.querySelector('.m2-count'),
      question: stage.querySelector('.m2-question'),
      choices:  stage.querySelector('.m2-choices'),
      talk:     stage.querySelector('.m2-talk'),
    };

    showQuiz();

    // 조종기와 키보드를 연결해요
    Input.on('dir:up',   function () { moveCursor(-1); });
    Input.on('dir:down', function () { moveCursor(1); });
    Input.on('talk',     answer);      // 2번 버튼 : 말걸기
    Input.on('next',     answer);      // 4번 버튼으로도 대답할 수 있어요
  }

  function stop() {
    locked = true;
  }


  return {
    start: start,
    stop: stop,
    hint: '김구 선생님의 물음에 답하여라. 스틱 위·아래로 고르고 2번 버튼으로 대답한다.',
  };
})();
