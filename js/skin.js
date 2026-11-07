/* ==================================================================
   독립을 향하여 - 우리가 그린 그림 넣기 (skin.js)

   ★ images 폴더에 정해진 이름으로 그림을 넣으면
     게임이 그 그림을 써요. 그림이 없으면 지금 모습 그대로예요.

     예) images/hero.png 를 넣으면 → 주인공이 우리가 그린 그림으로 바뀌어요

   그림 이름표는 아래 SLOTS 에 있어요.
   (images/README.md 에 자세한 설명이 있어요)
   ================================================================== */

const Skin = (function () {

  /* 그림을 넣을 수 있는 자리들이에요 */
  const SLOTS = {
    // 사람 (배경이 투명한 그림이 좋아요)
    'hero':         '주인공',
    'mate':         '독립운동가 동료',
    'kimgu':        '김구',
    'yu':           '유관순',
    'police':       '일본 경찰',
    'police-look':  '일본 경찰 - 이쪽을 쳐다볼 때 (없어도 돼요)',
    'captain':      '일본 헌병대장',
    'captain-look': '일본 헌병대장 - 공격하려고 노려볼 때 (없어도 돼요)',

    // 배경
    'title':        '시작 화면 배경',
    'ch1':          '1장 배경 (골목길)',
    'ch2':          '2장 배경 (비밀 아지트)',
    'ch3':          '3장 배경 (미로 바닥)',
    'ch4':          '4장 배경 (광장)',
    'ch5':          '5장 배경 (마지막 싸움)',
    'ch6':          '6장 배경 (광복의 날)',
  };

  const ready = {};     // 그림이 잘 불러와졌는지

  /* 그림 주소예요.
     한 파일 버전(독립을향하여.html)은 그림이 파일 안에 들어 있어요. */
  function url(name) {
    if (window.SKIN_DATA && window.SKIN_DATA[name]) return window.SKIN_DATA[name];
    return 'images/' + name + '.png';
  }

  /* 게임을 켤 때 그림이 있는지 하나씩 확인해요 */
  Object.keys(SLOTS).forEach(function (name) {
    const img = new Image();
    img.onload = function () {
      ready[name] = true;
      if (name === 'title') drawTitle();
    };
    img.src = url(name);      // 없으면 그냥 조용히 넘어가요
  });

  /* 시작 화면 배경 */
  function drawTitle() {
    const node = document.getElementById('screen-title');
    if (!node) return;
    node.classList.add('has-art');
    // 글씨가 잘 보이게 살짝 어둡게 덮어요
    node.style.backgroundImage =
      'linear-gradient(rgba(16,21,42,0.3), rgba(16,21,42,0.3)), url("' + url('title') + '")';
  }

  /* 사람 그림을 만들어요. 그림이 없으면 null (→ 원래 실루엣) */
  function figure(who, extra) {
    if (!ready[who]) return null;
    const look = ready[who + '-look'];
    return '<span class="fig fig--' + who + ' has-art' + (look ? ' has-look' : '') +
             ' ' + (extra || '') + '">' +
             '<img class="f-art" src="' + url(who) + '" alt="">' +
             (look ? '<img class="f-art f-art--look" src="' + url(who + '-look') + '" alt="">' : '') +
           '</span>';
  }

  /* 장 배경을 무대에 깔아요 */
  function stage(node) {
    if (!node || typeof game === 'undefined' || typeof CHAPTERS === 'undefined') return;
    const ch = CHAPTERS[game.chapterIndex];
    const name = ch ? 'ch' + ch.id : '';
    if (!ready[name]) return;
    node.classList.add('has-art-bg');
    node.style.backgroundImage =
      'linear-gradient(rgba(16,21,42,0.35), rgba(16,21,42,0.35)), url("' + url(name) + '")';
  }

  return { SLOTS: SLOTS, has: function (n) { return !!ready[n]; }, url: url, figure: figure, stage: stage };
})();
