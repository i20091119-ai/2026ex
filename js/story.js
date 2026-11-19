/* ==================================================================
   독립을 향하여 - 장 사이 이야기 (story.js)

   ★ 각 장이 시작하기 전에 등장인물이 한 줄씩 이야기해요.
     4번 버튼을 누르면 다음 줄로 넘어가요.
     (글자가 나오는 중에 누르면 그 줄이 한꺼번에 다 나와요)
     1번 버튼을 누르면 이야기를 모두 넘기고 바로 시작해요.

   대사는 서진모둠 기획서의 이야기를 그대로 살려서 썼어요.

   who  : 누가 말하는지 (실루엣 모양)
          'hero' 주인공 / 'mate' 독립운동가 동료 / 'kimgu' 김구
          'yu' 유관순 / 'police' 일본 경찰 / 'captain' 일본 헌병대장
          'army' 한국광복군
          'narr' 해설 (사람 없이 이야기만 나와요)
   name : 이름표에 쓸 이름
   text : 하는 말
   ================================================================== */

const STORIES = {

  /* ---------- 1장 · 비밀 편지 ---------- */
  1: [
    { who: 'narr', text: '1940년대 일제강점기. 조선은 일본의 지배를 받고 있었다.' },
    { who: 'narr', text: '사람들은 자유를 잃은 채 힘들게 살아가고 있었다.' },
    { who: 'narr', text: '학교를 마치고 집으로 가던 어느 날 저녁이었다.' },
    { who: 'mate', name: '독립운동가', text: '여보게, 학생. 잠깐 이리 와 보게.' },
    { who: 'mate', name: '독립운동가', text: '이 편지를 비밀 아지트까지 전해 주겠나? 일본 경찰에게 들켜서는 절대 안 되네.' },
    { who: 'hero', name: '나', text: '…알겠습니다. 꼭 전하겠습니다.' },
  ],

  /* ---------- 2장 · 김구 선생님과의 만남 ---------- */
  2: [
    { who: 'narr', text: '편지를 무사히 전한 주인공은 비밀 아지트 안으로 들어갔다.' },
    { who: 'kimgu', name: '김구', text: '자네가 편지를 가져온 학생인가. 정말 고맙네.' },
    { who: 'kimgu', name: '김구', text: '나라를 되찾기 위해서는 많은 사람들의 용기와 도움이 필요하다네.' },
    { who: 'kimgu', name: '김구', text: '다음 임무를 맡기기 전에, 우리 역사를 얼마나 아는지 물어보겠네.' },
  ],

  /* ---------- 3장 · 태극기 지키기 ---------- */
  3: [
    { who: 'mate', name: '독립운동가', text: '큰일이네! 일본 경찰이 우리가 숨겨 둔 태극기를 찾고 있어.' },
    { who: 'mate', name: '독립운동가', text: '태극기 다섯 장을 골목 곳곳에 나누어 숨겨 두었네.' },
    { who: 'mate', name: '독립운동가', text: '경찰보다 먼저 모두 찾아서 안전한 곳으로 옮겨 주게.' },
    { who: 'hero', name: '나', text: '붉은 곳에는 보초가 서 있으니 다른 길로 돌아가야겠어.' },
  ],

  /* ---------- 4장 · 만세운동 준비 ---------- */
  4: [
    { who: 'narr', text: '【역사 메모】 실제 유관순 열사는 1919년 3·1 운동 때 아우내 장터에서 만세운동을 이끌었고, 1920년 서대문 형무소에서 돌아가셨다.' },
    { who: 'narr', text: '이 장은 유관순 열사의 뜻을 기리며 꾸민 이야기다. 태극기를 지켜 낸 주인공은 유관순을 만났다.' },
    { who: 'yu', name: '유관순', text: '이 태극기로 만세운동을 준비할 거예요.' },
    { who: 'yu', name: '유관순', text: '광장에 모인 사람들에게 하나씩 나누어 주고, 독립의 뜻을 알려 주세요.' },
    { who: 'yu', name: '유관순', text: '순찰하는 일본 경찰이 있으니 가까이 가지 않게 조심하세요.' },
  ],

  /* ---------- 5장 · 독립을 향하여 ---------- */
  5: [
    { who: 'narr', text: '모든 준비를 마쳤다. 이제 마지막 싸움만이 남았다.' },
    { who: 'kimgu', name: '김구', text: '여기까지 온 것은 모두 자네와 같은 이들의 용기 덕분이네.' },
    { who: 'kimgu', name: '김구', text: '우리 한국광복군도 자네 뒤를 지킬 걸세. 우리는 모두 함께 싸우는 것이네.' },
    { who: 'captain', name: '일본 헌병대장', text: '감히 독립을 꿈꾸다니! 여기서 끝을 내 주마!' },
    { who: 'hero', name: '나', text: '우리는 물러서지 않는다!' },
  ],

  /* ---------- 6장 · 광복의 날 ---------- */
  6: [
    { who: 'narr', text: '마지막 임무까지 마친 그날 밤이 지나고…' },
    { who: 'kimgu', name: '김구', text: '이보게, 들리는가? 거리에서 사람들이 만세를 부르고 있네.' },
  ],
};


/* ==================================================================
   오늘 배운 역사 (끝 화면에 나와요)
   ★ 게임 속 이야기는 꾸민 것이지만, 여기는 실제 역사예요.
     장마다 하나씩, 그 장에서 해낸 만큼 보여줘요.
   ================================================================== */
const HISTORY = {
  1: { title: '비밀 연락망',
       text: '일제는 독립운동가를 늘 감시했어요. 그래서 대한민국 임시정부는 「연통제」라는 비밀 연락망을 만들어 몰래 소식과 편지를 주고받았어요.' },
  2: { title: '김구',
       text: '김구는 대한민국 임시정부를 이끈 독립운동가예요. 1940년에는 임시정부의 주석(가장 높은 자리)이 되었어요.' },
  3: { title: '태극기',
       text: '일제강점기에는 태극기를 마음대로 쓸 수 없었어요. 사람들은 태극기를 몰래 숨겨 두고 지켰어요.' },
  4: { title: '3·1 운동과 유관순',
       text: '1919년 3월 1일, 온 나라에서 「대한 독립 만세」를 외친 3·1 운동이 일어났어요. 유관순 열사는 고향 아우내 장터에서 만세운동을 이끌었어요.' },
  5: { title: '한국광복군',
       text: '1940년 임시정부는 우리 군대인 한국광복군을 만들었어요. 광복군은 나라 안으로 들어가 일본과 싸울 작전을 준비했어요.' },
  6: { title: '광복',
       text: '1945년 8월 15일, 일본이 전쟁에서 지면서 우리나라는 광복을 맞았어요. 광복은 「빛을 되찾았다」는 뜻이에요.' },
};


/* ==================================================================
   이야기 보여주기
   ================================================================== */
const Story = (function () {

  const TYPE_SPEED = 38;     // 글자 하나가 나오는 시간 (밀리초)

  let lines = [];            // 이번 장의 대사들
  let index = 0;             // 지금 몇 번째 줄인지
  let typing = false;        // 글자가 나오는 중인지
  let typeTimer = null;
  let onDone = null;         // 이야기가 끝나면 부를 함수
  let running = false;
  let node = {};

  /* ---------- 한 줄을 화면에 그려요 ---------- */
  function showLine() {
    const line = lines[index];
    const isNarr = line.who === 'narr';

    // 해설일 때는 사람 없이 가운데에 이야기만 나와요
    node.scene.classList.toggle('is-narr', isNarr);
    // 빨간 눈은 일본 경찰과 헌병대장에게만 그려요 (우리 편은 무섭지 않게!)
    const enemy = line.who === 'police' || line.who === 'captain';
    node.cast.innerHTML = isNarr ? '' : MissionUtil.figure(line.who, enemy ? 'is-looking' : '');
    node.scene.classList.toggle('is-enemy', enemy);
    node.name.textContent = isNarr ? '' : line.name;
    node.count.textContent = (index + 1) + ' / ' + lines.length;

    // 글자를 하나씩 보여줘요 (타자 치듯이)
    const text = line.text;
    let shown = 0;
    typing = true;
    node.text.textContent = '';
    node.more.classList.remove('is-on');

    clearInterval(typeTimer);
    typeTimer = setInterval(function () {
      if (game.paused) return;              // 잠시 멈춤 중이면 기다려요
      shown += 1;
      node.text.textContent = text.slice(0, shown);
      if (shown >= text.length) finishTyping();
    }, TYPE_SPEED);
  }

  /* 글자가 다 나왔어요 */
  function finishTyping() {
    clearInterval(typeTimer);
    typing = false;
    node.text.textContent = lines[index].text;
    node.more.classList.add('is-on');       // ▼ 표시가 깜빡여요
  }

  /* ---------- 4번 버튼 : 다음 ---------- */
  function next() {
    if (!running) return;

    // 글자가 나오는 중이면, 먼저 그 줄을 한꺼번에 다 보여줘요
    if (typing) { finishTyping(); return; }

    index += 1;
    if (index >= lines.length) { end(); return; }
    showLine();
  }

  /* ---------- 1번 버튼 : 모두 넘기기 ---------- */
  function skipAll() {
    if (!running) return;
    end();
  }

  /* 이야기가 끝났어요 → 미션을 시작해요 */
  function end() {
    stop();
    if (onDone) onDone();
  }

  /* ---------- 이야기 시작 ---------- */
  function play(chapter, done) {
    lines = STORIES[chapter.id] || [];
    index = 0;
    onDone = done;
    running = true;

    if (lines.length === 0) { end(); return; }

    const stage = MissionUtil.setStage(
      '<div class="story">' +
        '<p class="story-chapter">' +
          '<span>제 ' + chapter.id + ' 장</span>' +
          '<b>' + chapter.name.replace(/^\d+장 · /, '') + '</b>' +
        '</p>' +
        '<div class="story-cast"></div>' +
        '<div class="story-box">' +
          '<p class="story-name"></p>' +
          '<p class="story-text"></p>' +
          '<div class="story-foot">' +
            '<span class="story-count"></span>' +
            '<span class="story-keys">4번 다음 &nbsp;·&nbsp; 1번 모두 넘기기</span>' +
            '<span class="story-more">▼</span>' +
          '</div>' +
        '</div>' +
      '</div>'
    );

    node = {
      scene: stage.querySelector('.story'),
      cast:  stage.querySelector('.story-cast'),
      name:  stage.querySelector('.story-name'),
      text:  stage.querySelector('.story-text'),
      count: stage.querySelector('.story-count'),
      more:  stage.querySelector('.story-more'),
    };

    // 4번 = 다음, 1번 = 모두 넘기기, 마우스로 눌러도 다음
    Input.on('next', next);
    Input.on('jump', skipAll);
    node.scene.addEventListener('click', next);

    showLine();
  }

  /* ---------- 멈추기 (처음으로 등을 눌렀을 때) ---------- */
  function stop() {
    running = false;
    typing = false;
    clearInterval(typeTimer);
    typeTimer = null;
  }

  return { play: play, stop: stop };
})();
