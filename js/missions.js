/* ==================================================================
   독립을 향하여 - 미션 보관함 (missions.js)

   각 장의 미션 게임을 여기에 하나씩 담아둘 거예요.
   예) MISSIONS[1] = 1장 미션,  MISSIONS[2] = 2장 미션 ...

   미션 하나는 이렇게 생겼어요.
   {
     start: function (성공했을때, 들켰을때) { ... 미션 시작 ... },
     stop:  function () { ... 미션 정리 ... },
     hint:  '화면 아래 말풍선에 보여줄 조작 설명',
   }
   ================================================================== */

const MISSIONS = {};


/* ------------------------------------------------------------------
   모든 미션이 함께 쓰는 편리한 도구들이에요.
   ------------------------------------------------------------------ */
const MissionUtil = {

  /* 게임 무대를 비우고 새 화면을 그려요 */
  setStage: function (html) {
    const stage = document.getElementById('stage-inner');
    stage.innerHTML = html;
    return stage;
  },

  /* 0과 1 사이의 아무 숫자나 뽑아요 (min 과 max 사이의 값) */
  random: function (min, max) {
    return min + Math.random() * (max - min);
  },

  /* 숫자가 너무 작거나 커지지 않게 울타리를 쳐요 */
  clamp: function (value, min, max) {
    return Math.max(min, Math.min(max, value));
  },

  /* 실루엣 캐릭터 한 명을 그려요.
     who : 'hero'(주인공) 'police'(경찰) 'kimgu'(김구)
           'yu'(유관순) 'mate'(동료) 'captain'(헌병대장)
     extra : 덧붙일 이름표 (예: 'm1-hero') */
  figure: function (who, extra) {
    return '<span class="fig fig--' + who + ' ' + (extra || '') + '">' +
             '<i class="f-hat"></i>' +
             '<i class="f-head"><i class="f-eyes"></i></i>' +
             '<i class="f-body"></i>' +
           '</span>';
  },
};
