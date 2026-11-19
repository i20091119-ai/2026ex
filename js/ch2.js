/* ==================================================================
   2장 · 김구 선생님과의 만남  (ch2.js)

   비밀 아지트에서 김구 선생님을 만나 역사 퀴즈 3개를 풀어요.

   - 한 문제 맞힐 때마다 독립 포인트 +5점 (3개 다 맞히면 15점)
   - 문제는 쉬움 → 보통 → 어려움 순서로 점점 어려워져요
   - 틀리면 선생님이 정답을 알려주고 그 문제를 다시 물어봐요

   ★ 더 재밌게!
   - 등잔불 : 한 문제에 14초. 불이 다 타면 「쉿! 일본 경찰이 지나간다」
     방이 잠깐 어두워졌다가 같은 문제를 다시 물어요 (벌칙은 없어요)
   - 김구 선생님의 귀띔 : 3번(X) 버튼. 틀린 보기 하나를 지워 줘요 (한 장에 두 번)
   - 맞히면 「정답」 도장이 쾅! 세 문제를 모두 한 번에 맞히면 「백범 인정」!

   조작 : 스틱(방향키) 위 아래로 답을 고르고
          2번 버튼(말걸기)으로 대답해요. 마우스로 눌러도 돼요.
          3번 버튼(X) = 김구 선생님의 귀띔
   ================================================================== */

MISSIONS[2] = (function () {

  /* ----------------------------------------------------------------
     1. 문제 보관함
        난이도별로 5문제씩, 모두 15문제를 담아뒀어요.
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

      { q: '일제강점기에 우리나라를 지배한 나라는 어디일까요?',
        a: '일본', wrong: ['중국', '러시아'],
        why: '1910년부터 1945년까지 일본이 우리나라를 지배했어요.' },

      { q: '우리나라를 대표하는 꽃(나라꽃)은 무엇일까요?',
        a: '무궁화', wrong: ['벚꽃', '장미'],
        why: '무궁화는 "끝없이 피는 꽃"이라는 뜻을 가진 우리나라 꽃이에요.' },
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

      { q: '3·1운동이 일어난 해는 언제일까요?',
        a: '1919년', wrong: ['1910년', '1945년'],
        why: '1919년 3월 1일에 3·1운동이 일어났어요. 1910년은 나라를 빼앗긴 해예요.' },

      { q: '나라를 되찾은 날을 기념하는 날의 이름은?',
        a: '광복절', wrong: ['개천절', '한글날'],
        why: '광복절은 8월 15일이에요. 개천절은 고조선을 세운 날, 한글날은 한글을 기념하는 날이에요.' },
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

      { q: '1940년 대한민국 임시정부가 만든 군대의 이름은?',
        a: '한국광복군', wrong: ['의병', '별기군'],
        why: '한국광복군은 나라를 되찾기 위해 임시정부가 만든 우리 군대예요.' },

      { q: '1909년 하얼빈에서 이토 히로부미를 처단한 독립운동가는?',
        a: '안중근', wrong: ['윤봉길', '이봉창'],
        why: '안중근 의사는 1909년 중국 하얼빈에서 의거를 일으켰어요.' },
    ],
  };

  /* ----------------------------------------------------------------
     2. 이번에 낼 문제 3개를 고르는 곳
        ★ 할 때마다 다른 문제가 나와요!
          쉬움 · 보통 · 어려움에서 한 문제씩 아무거나 뽑아요.
          (바로 전 판에 나온 문제는 되도록 빼고 뽑아요)
        문제를 더 넣고 싶으면 위 보관함에 한 줄씩 더하면 돼요.
     ---------------------------------------------------------------- */
  const LEVELS = ['easy', 'normal', 'hard'];
  let PICK = [];            // 이번 판에 낼 문제들 [난이도, 몇 번째]
  const lastTime = {};      // 바로 전 판에 나온 문제 번호

  function pickQuizzes() {
    PICK = LEVELS.map(function (level) {
      const count = QUIZ_BANK[level].length;
      let number = Math.floor(Math.random() * count);
      if (count > 1 && number === lastTime[level]) number = (number + 1) % count;
      lastTime[level] = number;
      return [level, number];
    });
  }

  const POINT_PER_QUIZ = 5;   // 한 문제 맞힐 때마다 주는 점수

  const LAMP_TIME  = 14;      // 등잔불이 타는 시간 (초) — 한 문제에 이만큼
  const LAMP_ALERT = 5;       // 이만큼 남으면 발소리가 들려요
  const HINTS      = 2;       // 김구 선생님의 귀띔 (한 장에 두 번)


  /* ----------------------------------------------------------------
     3. 이 미션이 기억해야 할 것들
     ---------------------------------------------------------------- */
  let quizIndex = 0;       // 지금 몇 번째 문제인지
  let choices = [];        // 지금 문제의 보기 3개 (섞은 것)
  let cursor = 0;          // 지금 고르고 있는 보기 번호
  let locked = false;      // 답을 맞춘 뒤 잠깐 못 누르게 잠그는 값
  let onSuccess = null;
  let node = {};
  let lamp = LAMP_TIME;       // 등잔불이 얼마나 남았는지 (초)
  let hintsLeft = HINTS;
  let crossed = -1;           // 귀띔으로 지운 보기 번호
  let crossedText = '';       // 지운 보기 글자 (보기를 다시 섞어도 계속 지워 둬요)
  let streak = 0;             // 한 번에 맞힌 연속 수
  let firstTry = true;        // 이번 문제를 아직 안 틀렸는지
  let allFirst = true;        // 세 문제 모두 한 번에 맞혔는지
  let darkness = false;       // 경찰이 지나가서 방이 어두운 중
  let running = false;
  let lastFrame = 0;          // 등잔불 시계를 재려고 기억해두는 값
  let stepTimer = 0;


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
    crossed = crossedText ? choices.indexOf(crossedText) : -1;
    if (cursor === crossed) cursor = 1;
    lamp = LAMP_TIME;
    drawLamp();

    node.count.textContent = (quizIndex + 1) + ' / ' + PICK.length;
    node.question.textContent = quiz.q;
    node.talk.textContent = '';
    node.talk.className = 'm2-talk';

    drawChoices();
  }

  /* 보기 3개를 그려요 */
  function drawChoices() {
    node.choices.innerHTML = choices.map(function (text, i) {
      return '<button class="m2-choice' + (i === cursor ? ' is-on' : '') +
             (i === crossed ? ' is-crossed' : '') + '" ' +
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
    if (cursor === crossed) cursor = (cursor + step + choices.length) % choices.length;  // 지운 보기는 건너뛰어요
    drawChoices();
  }

  /* 등잔불 막대를 그려요 */
  function drawLamp() {
    const k = Math.max(0, lamp / LAMP_TIME);
    node.lampFill.style.width = (k * 100) + '%';
    node.lamp.classList.toggle('is-low', lamp <= LAMP_ALERT && lamp > 0);
    node.steps.textContent = (lamp <= LAMP_ALERT && lamp > 0 && !locked) ? '저벅… 저벅…' : '';
    node.steps.style.opacity = lamp <= LAMP_ALERT ? (1 - lamp / LAMP_ALERT) * 0.7 + 0.3 : 0;
  }

  /* 귀띔과 연속 정답 표시 */
  function drawBadges() {
    let h = '';
    for (let i = 0; i < HINTS; i++) h += '<span class="m2-hintdot' + (i < hintsLeft ? '' : ' is-used') + '"></span>';
    node.hints.innerHTML = '<b>X</b> 귀띔 ' + h;
    node.streak.textContent = streak >= 2 ? '연속 정답 ×' + streak : '';
  }

  /* ---------- 3번(X) 버튼 : 김구 선생님의 귀띔 ---------- */
  function useHint() {
    if (locked || darkness || hintsLeft <= 0 || crossed >= 0) return;
    const quiz = getQuiz(quizIndex);
    const wrongs = [];
    choices.forEach(function (c, i) { if (c !== quiz.a) wrongs.push(i); });
    crossed = wrongs[Math.floor(Math.random() * wrongs.length)];
    crossedText = choices[crossed];
    hintsLeft -= 1;
    if (cursor === crossed) cursor = (cursor + 1) % choices.length;
    node.talk.textContent = '김구 : 흠… 「' + choices[crossed] + '」 은(는) 아니라네.';
    node.talk.className = 'm2-talk';
    if (window.Sound) Sound.pok();
    drawChoices();
    drawBadges();
  }

  /* 클래스를 붙였다 떼요 (애니메이션을 처음부터 다시) */
  function flash(el, cls, ms) {
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
    setTimeout(function () { el.classList.remove(cls); }, ms);
  }

  /* 도장을 쾅! 찍어요 */
  function stamp(text, cls) {
    const el = document.createElement('div');
    el.className = 'm2-stamp ' + (cls || '');
    el.textContent = text;
    node.panel.appendChild(el);
    setTimeout(function () { el.remove(); }, cls === 'is-big' ? 2400 : 1150);
  }

  /* ---------- 등잔불이 다 탔어요 : 경찰이 지나가요 ---------- */
  function policePass() {
    darkness = true;
    locked = true;
    node.scene.classList.add('is-dark');
    node.talk.textContent = '쉿! 일본 경찰이 문 앞을 지나간다…';
    node.talk.className = 'm2-talk is-wrong';
    if (window.Sound) Sound.alert();
    streak = 0;
    drawBadges();
    setTimeout(function () {
      if (!running) return;
      darkness = false;
      node.scene.classList.remove('is-dark');
      showQuiz();
      node.talk.textContent = '휴, 지나갔다. 다시 생각해 보자.';
    }, 2200);
  }

  /* 등잔불이 타요 (1초에 60번) */
  function loop(now) {
    if (!running) return;
    const delta = Math.min((now - lastFrame) / 1000, 0.05);
    lastFrame = now;
    if (!game.paused && !locked && !darkness) {
      lamp -= delta;
      // 발소리가 점점 빨라져요
      if (lamp <= LAMP_ALERT) {
        stepTimer -= delta;
        if (stepTimer <= 0) {
          stepTimer = 0.35 + (lamp / LAMP_ALERT) * 0.45;
          if (window.Sound) Sound.step();
        }
      }
      if (lamp <= 0) { lamp = 0; drawLamp(); policePass(); }
      else drawLamp();
    }
    requestAnimationFrame(loop);
  }


  /* ----------------------------------------------------------------
     6. 답을 말했을 때
     ---------------------------------------------------------------- */
  function answer() {
    if (locked || darkness) return;
    if (cursor === crossed) return;          // 지운 보기는 고를 수 없어요
    locked = true;
    drawLamp();

    const quiz = getQuiz(quizIndex);
    const picked = choices[cursor];

    if (picked === quiz.a) {
      /* ---- 맞았어요! ---- */
      node.talk.textContent = '옳거니! 잘 알고 있구나.';
      node.talk.className = 'm2-talk is-right';
      markChoice(true);
      stamp('정답');                    // 붉은 도장 쾅!
      flash(node.person, 'is-nod', 600);   // 김구 선생님이 끄덕끄덕
      if (window.Sound) Sound.hit && Sound.hit();
      if (firstTry) streak += 1;
      drawBadges();

      addScore(POINT_PER_QUIZ);        // 한 문제당 5점

      // 잠시 뒤 다음 문제로 넘어가요
      setTimeout(function () {
        quizIndex += 1;
        firstTry = true;
        crossedText = '';              // 새 문제는 지운 보기가 없어요
        if (quizIndex >= PICK.length) {
          if (allFirst) {
            // ★ 세 문제를 모두 한 번에 맞혔어요!
            stamp('백범 인정', 'is-big');
            node.talk.textContent = '김구 : 훌륭하네! 자네라면 믿고 다음 임무를 맡길 수 있겠어.';
            node.talk.className = 'm2-talk is-right';
            if (window.Sound) Sound.fanfare();
            setTimeout(finish, 2200);
          } else {
            finish();                  // 3문제를 다 맞혔어요!
          }
        } else {
          showQuiz();
        }
      }, 1300);

    } else {
      /* ---- 틀렸어요 ---- */
      if (window.Sound) Sound.ppyong();

      node.talk.textContent = '아니란다. 정답은 「' + quiz.a + '」 이야. ' + quiz.why;
      node.talk.className = 'm2-talk is-wrong';
      markChoice(false);
      flash(node.panel, 'is-shake', 450);
      firstTry = false;
      allFirst = false;
      streak = 0;
      drawBadges();

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
  function finish() {
    running = false;
    onSuccess();
  }

  function start(success) {
    onSuccess = success;
    pickQuizzes();           // 이번 판 문제를 새로 뽑아요
    quizIndex = 0;
    hintsLeft = HINTS;
    crossedText = '';
    streak = 0;
    firstTry = true;
    allFirst = true;
    darkness = false;
    running = true;

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
            '<span class="m2-streak"></span>' +
            '<span class="m2-hints"></span>' +
            '<span class="m2-count"></span>' +
          '</div>' +
          // 등잔불 : 다 타면 경찰이 지나가요
          '<div class="m2-lamp"><span class="m2-flame"></span>' +
            '<div class="m2-lamp-bar"><div class="m2-lamp-fill"></div></div>' +
            '<span class="m2-steps"></span></div>' +
          '<p class="m2-question"></p>' +
          '<div class="m2-choices"></div>' +
          '<p class="m2-talk"></p>' +
          '<p class="m2-tip">스틱 위·아래로 고르고, 2번 버튼으로 대답한다 · 3번(X) 김구 선생님의 귀띔</p>' +
        '</div>' +

      '</div>'
    );

    node = {
      count:    stage.querySelector('.m2-count'),
      question: stage.querySelector('.m2-question'),
      choices:  stage.querySelector('.m2-choices'),
      talk:     stage.querySelector('.m2-talk'),
      scene:    stage.querySelector('.m2-scene'),
      panel:    stage.querySelector('.m2-panel'),
      person:   stage.querySelector('.m2-person'),
      lamp:     stage.querySelector('.m2-lamp'),
      lampFill: stage.querySelector('.m2-lamp-fill'),
      steps:    stage.querySelector('.m2-steps'),
      hints:    stage.querySelector('.m2-hints'),
      streak:   stage.querySelector('.m2-streak'),
    };

    showQuiz();
    drawBadges();
    lastFrame = performance.now();
    requestAnimationFrame(loop);

    // 조종기와 키보드를 연결해요
    Input.on('dir:up',   function () { moveCursor(-1); });
    Input.on('dir:down', function () { moveCursor(1); });
    Input.on('talk',     answer);      // 2번 버튼 : 말걸기
    Input.on('next',     answer);      // 4번 버튼으로도 대답할 수 있어요
    Input.on('attack',   useHint);     // 3번 버튼(X) : 김구 선생님의 귀띔
  }

  function stop() {
    locked = true;
    running = false;
  }


  return {
    start: start,
    stop: stop,
    hint: '김구 선생님의 물음에 답하여라. 등잔불이 다 타기 전에! 막히면 3번(X)으로 귀띔을 받는다.',
  };
})();
