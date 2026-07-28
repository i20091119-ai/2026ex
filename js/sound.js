/* ==================================================================
   독립을 향하여 - 소리 담당 파일 (sound.js)

   ★ 소리 파일(mp3)을 하나도 안 써요!
     컴퓨터한테 "이런 높이의 소리를 이만큼 내줘"라고 부탁해서
     그 자리에서 소리를 만들어내요. 이걸 Web Audio 라고 해요.

   만드는 소리
   - 뽁   : 버튼을 누를 때
   - 띠링 : 점수가 오를 때
   - 뿅   : 실패했을 때
   - 배경음악 : 잔잔하게 계속 흐르는 음악
   ================================================================== */

const Sound = (function () {

  /* ----------------------------------------------------------------
     1. 소리 크기 단계
        5번 버튼을 누를 때마다 이 순서대로 바뀌어요.
     ---------------------------------------------------------------- */
  const LEVELS = [
    { value: 0.0, label: '소리 꺼짐', icon: '🔇' },
    { value: 0.3, label: '소리 작게', icon: '🔈' },
    { value: 0.6, label: '소리 보통', icon: '🔉' },
    { value: 1.0, label: '소리 크게', icon: '🔊' },
  ];

  let levelIndex = 2;      // 처음에는 '보통'으로 시작해요

  let ctx = null;          // 소리를 만드는 기계 (처음 눌렀을 때 켜져요)
  let master = null;       // 전체 소리 크기를 조절하는 손잡이
  let bgmGain = null;      // 배경음악만 따로 조절하는 손잡이
  let bgmTimer = null;     // 배경음악을 계속 이어주는 시계


  /* ----------------------------------------------------------------
     2. 소리 기계 켜기
        브라우저 규칙 때문에, 사용자가 버튼을 한 번 눌러야
        소리를 낼 수 있어요. 그래서 필요할 때 켜요.
     ---------------------------------------------------------------- */
  function wake() {
    if (!ctx) {
      const Maker = window.AudioContext || window.webkitAudioContext;
      if (!Maker) return false;        // 아주 오래된 브라우저면 소리 없이 진행해요

      ctx = new Maker();

      master = ctx.createGain();       // 전체 소리 크기 손잡이
      master.gain.value = LEVELS[levelIndex].value;
      master.connect(ctx.destination);

      bgmGain = ctx.createGain();      // 배경음악은 효과음보다 작게
      bgmGain.gain.value = 0.28;
      bgmGain.connect(master);
    }

    // 잠들어 있으면 깨워요
    if (ctx.state === 'suspended') ctx.resume();
    return true;
  }


  /* ----------------------------------------------------------------
     3. 소리 하나를 내는 기본 도구
        freq  : 소리의 높이 (숫자가 클수록 높은 소리)
        dur   : 소리의 길이 (초)
        type  : 소리의 느낌 ('sine'=부드러움, 'square'=또렷함)
        when  : 몇 초 뒤에 낼지
        to    : 어디로 보낼지 (안 적으면 효과음으로)
     ---------------------------------------------------------------- */
  function tone(freq, dur, type, when, to, peak) {
    if (!ctx) return;

    const start = ctx.currentTime + (when || 0);

    const osc = ctx.createOscillator();   // 소리를 만드는 부분
    const gain = ctx.createGain();        // 소리 크기를 다루는 부분

    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, start);

    // 소리가 갑자기 '툭' 끊기면 지직거려요.
    // 그래서 부드럽게 커졌다가 부드럽게 사라지게 해요.
    const top = peak || 0.32;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(top, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);

    osc.connect(gain);
    gain.connect(to || master);

    osc.start(start);
    osc.stop(start + dur + 0.03);
  }


  /* ----------------------------------------------------------------
     4. 게임에서 쓰는 소리들
     ---------------------------------------------------------------- */

  /* 뽁! - 버튼을 누를 때 나는 짧고 귀여운 소리 */
  function pok() {
    if (!wake()) return;
    tone(680, 0.07, 'square', 0, null, 0.18);
    tone(980, 0.05, 'square', 0.05, null, 0.13);
  }

  /* 띠링! - 점수가 오를 때 나는 기분 좋은 소리 (낮은음 → 높은음) */
  function ding() {
    if (!wake()) return;
    tone(880, 0.12, 'sine', 0,    null, 0.3);   // 라
    tone(1318, 0.20, 'sine', 0.1, null, 0.3);   // 높은 미
  }

  /* 뿅... - 실패했을 때 나는 시무룩한 소리 (높은음 → 낮은음) */
  function ppyong() {
    if (!wake()) return;
    tone(420, 0.16, 'triangle', 0,    null, 0.3);
    tone(260, 0.28, 'triangle', 0.14, null, 0.3);
  }

  /* 삐빅! - 경찰이 돌아볼 때 나는 조심하라는 소리 */
  function alert() {
    if (!wake()) return;
    tone(760, 0.09, 'square', 0,    null, 0.22);
    tone(760, 0.09, 'square', 0.13, null, 0.22);
  }

  /* 짜잔! - 광복을 맞이했을 때 나는 축하 소리 */
  function fanfare() {
    if (!wake()) return;
    const notes = [523, 659, 784, 1047];   // 도-미-솔-높은도
    notes.forEach(function (f, i) {
      tone(f, 0.3, 'sine', i * 0.12, null, 0.32);
    });
  }


  /* ----------------------------------------------------------------
     5. 잔잔한 배경음악
        낮은 음 몇 개를 천천히 반복해서 연주해요.
        '도-레-미-솔-라' 다섯 음만 써서 어떻게 이어져도
        듣기 좋은 소리가 나요. (이걸 5음 음계라고 해요)
     ---------------------------------------------------------------- */
  const MELODY = [
    262, 294, 330, 392, 440,   // 도 레 미 솔 라
    392, 330, 294, 262, 220,   // 솔 미 레 도 라(낮은)
  ];

  let melodyStep = 0;

  function playBgmNote() {
    if (!ctx) return;

    const note = MELODY[melodyStep % MELODY.length];

    tone(note, 1.6, 'sine', 0, bgmGain, 0.22);          // 멜로디
    tone(note / 2, 2.2, 'triangle', 0, bgmGain, 0.12);  // 낮은 화음을 살짝 겹쳐요

    melodyStep += 1;
  }

  /* 배경음악을 켜요 */
  function startBgm() {
    if (!wake()) return;
    if (bgmTimer) return;             // 이미 켜져 있으면 그냥 둬요

    playBgmNote();
    bgmTimer = setInterval(playBgmNote, 900);   // 0.9초마다 한 음씩
  }

  /* 배경음악을 꺼요 */
  function stopBgm() {
    clearInterval(bgmTimer);
    bgmTimer = null;
  }


  /* ----------------------------------------------------------------
     6. 소리 크기 조절 (5번 버튼이 쓰는 기능)
     ---------------------------------------------------------------- */

  /* 다음 단계로 소리 크기를 바꿔요.
     꺼짐 → 작게 → 보통 → 크게 → 다시 꺼짐 ... */
  function cycleVolume() {
    levelIndex = (levelIndex + 1) % LEVELS.length;
    applyVolume();
    return LEVELS[levelIndex];        // 지금 단계를 알려줘요 (화면에 표시하려고)
  }

  /* 지금 정해진 크기를 실제 소리에 적용해요 */
  function applyVolume() {
    const level = LEVELS[levelIndex];

    if (level.value > 0) {
      wake();                          // 소리를 켜야 하면 기계를 깨워요
      if (master) master.gain.value = level.value;
      startBgm();
    } else {
      if (master) master.gain.value = 0;
      stopBgm();                       // 꺼짐이면 배경음악도 멈춰요
    }
  }


  /* ----------------------------------------------------------------
     7. 다른 파일에서 쓸 수 있게 열어둬요
     ---------------------------------------------------------------- */
  return {
    pok: pok,
    ding: ding,
    ppyong: ppyong,
    alert: alert,
    fanfare: fanfare,

    startBgm: startBgm,
    stopBgm: stopBgm,

    cycleVolume: cycleVolume,
    level: function () { return LEVELS[levelIndex]; },
    isOn:  function () { return LEVELS[levelIndex].value > 0; },

    /* 사용자가 처음 화면을 눌렀을 때 소리 기계를 깨워요 */
    wake: wake,
  };
})();
