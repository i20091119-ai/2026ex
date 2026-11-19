/* ==================================================================
   독립을 향하여 - 영어로 보기 (lang.js)

   ★ 기획서의 대상에 '외국인'도 있어서 영어로도 할 수 있게 했어요.
     시작 화면 오른쪽 위 「English」 버튼을 누르면 바뀌어요.

   어떻게 바꾸나요?
     게임 코드는 그대로 한국어로 글씨를 써요.
     영어 모드일 때는 화면에 한국어 글씨가 나타나는 순간
     아래 '번역표'를 보고 영어로 바꿔치기해요.
     → 새 글씨를 넣으면 번역표에도 한 줄 더해 주세요!
   ================================================================== */

const Lang = (function () {

  const KEY = 'dokrip.lang';

  /* ---------- 번역표 : 한국어 → 영어 ---------- */
  const EN = {
    /* 시작 화면 */
    '독립을 향하여 - 서진모둠': 'Toward Independence - Team Seojin',
    '독립을': 'Toward',
    '향하여': 'Independence',
    '설명란': 'How to play',
    '조종기 확인': 'Controller',
    '조종기 확인 중…': 'Checking controller…',
    '조종기 : 이 화면에서는 막혀 있어요': 'Controller: blocked on this page',
    '조종기 : 안 보여요 — 버튼을 한 번 눌러 보세요': 'Controller: not found — press any button',
    '⚠️ 이 화면은 다른 페이지 안에 끼워져 있어서': '⚠️ This page is inside another page, so',
    '조이스틱이 막혀요.': 'the joystick is blocked.',
    '조이스틱으로 하려면': 'To use the joystick, type',
    '를 주소창에 직접 입력하세요.': 'in the address bar.',
    '게임 시작': 'Start game',
    '게임 설명 보기': 'How to play',

    /* 점수판 · 안내판 */
    '장': 'CH',
    '목숨': 'Lives',
    '독립 포인트': 'Independence Points',
    '움직이기': 'Move',
    '점프': 'Jump',
    '말걸기': 'Talk',
    '공격': 'Attack',
    '다음': 'Next',
    '소리크기': 'Volume',
    '잠시멈춤': 'Pause',
    '처음으로': 'Home',
    '글씨크기': 'Text size',
    '키보드': 'Keyboard',
    '마우스': 'Mouse',
    '키보드 / 조종기': 'Keyboard / Controller',
    '조종기 연결 안 됨': 'No controller',
    '눌러서 조종기 확인·맞추기': 'Click to check or set up the controller',
    '소리 꺼짐': 'Sound off',
    '소리 작게': 'Sound low',
    '소리 보통': 'Sound medium',
    '소리 크게': 'Sound high',

    /* 장 이름과 말풍선 */
    '1장 · 비밀 편지': 'Ch.1 · The Secret Letter',
    '2장 · 김구 선생님과의 만남': 'Ch.2 · Meeting Kim Gu',
    '3장 · 태극기 지키기': 'Ch.3 · Protect the Taegukgi',
    '4장 · 만세운동 준비': 'Ch.4 · Preparing the Manse Movement',
    '5장 · 독립을 향하여': 'Ch.5 · Toward Independence',
    '6장 · 광복의 날': 'Ch.6 · Liberation Day',
    '비밀 편지': 'The Secret Letter',
    '김구 선생님과의 만남': 'Meeting Kim Gu',
    '태극기 지키기': 'Protect the Taegukgi',
    '만세운동 준비': 'Preparing the Manse Movement',
    '독립을 향하여': 'Toward Independence',
    '광복의 날': 'Liberation Day',
    '학교에서 돌아오는 길, 독립운동가 동료를 만났어요.': 'On the way home from school, you met an independence activist.',
    '일본 경찰에게 들키지 않고 비밀 편지를 전달하세요!': 'Deliver the secret letter without being caught by the Japanese police!',
    '비밀 아지트에서 김구 선생님을 만났어요.': 'You met Kim Gu at the secret hideout.',
    '"나라를 되찾으려면 많은 사람의 용기가 필요하단다." 역사 퀴즈 3개를 맞혀 보세요!': '"To win back our country, we need the courage of many people." Answer 3 history questions!',
    '동료가 숨겨둔 태극기를 일본 경찰보다 먼저 찾아야 해요.': 'Find the hidden Taegukgi flags before the Japanese police do.',
    '미로를 통과해서 태극기를 찾으세요! (경찰 조심!)': 'Get through the maze and find the flags! (Watch out for police!)',
    '유관순을 만나 만세운동을 준비해요.': 'Meet Yu Gwan-sun and prepare the Manse Movement.',
    '사람들에게 태극기 5개를 나누어 주세요!': 'Hand out 5 Taegukgi flags to the people!',
    '주인공과 김구 선생님, 독립군이 마지막 싸움을 준비해요.': 'You, Kim Gu and the independence army prepare for the final battle.',
    '일본군과의 싸움에서 승리하세요!': 'Win the battle against the Japanese army!',
    '드디어 일본의 지배에서 벗어났어요!': 'At last, Korea is free from Japanese rule!',
    '사람들이 태극기를 흔들며 기뻐해요. 대한 독립 만세!': 'People wave the Taegukgi with joy. Long live Korean independence!',
    '여기에 미션이 들어갈 거예요': 'The mission goes here',
    '말풍선 내용': 'Message',

    /* 이야기 : 이름표 */
    '독립운동가': 'Independence activist',
    '나': 'Me',
    '김구': 'Kim Gu',
    '유관순': 'Yu Gwan-sun',
    '일본 헌병대장': 'Japanese military police captain',
    '4번 다음  ·  1번 모두 넘기기': '#4 next  ·  #1 skip all',

    /* 이야기 : 대사 */
    '1940년대 일제강점기. 조선은 일본의 지배를 받고 있었다.': 'The 1940s. Korea (Joseon) was under Japanese colonial rule.',
    '사람들은 자유를 잃은 채 힘들게 살아가고 있었다.': 'People had lost their freedom and lived hard lives.',
    '학교를 마치고 집으로 가던 어느 날 저녁이었다.': 'One evening, on the way home from school…',
    '여보게, 학생. 잠깐 이리 와 보게.': 'Hey, student. Come here for a moment.',
    '이 편지를 비밀 아지트까지 전해 주겠나? 일본 경찰에게 들켜서는 절대 안 되네.': 'Will you take this letter to our secret hideout? The Japanese police must never see you.',
    '…알겠습니다. 꼭 전하겠습니다.': '…I understand. I will deliver it.',
    '편지를 무사히 전한 주인공은 비밀 아지트 안으로 들어갔다.': 'The letter arrived safely, and you stepped inside the secret hideout.',
    '자네가 편지를 가져온 학생인가. 정말 고맙네.': 'So you are the student who brought the letter. Thank you.',
    '나라를 되찾기 위해서는 많은 사람들의 용기와 도움이 필요하다네.': 'To win back our country, we need the courage and help of many people.',
    '다음 임무를 맡기기 전에, 우리 역사를 얼마나 아는지 물어보겠네.': 'Before your next mission, let me see how well you know our history.',
    '큰일이네! 일본 경찰이 우리가 숨겨 둔 태극기를 찾고 있어.': 'Trouble! The Japanese police are searching for the flags we hid.',
    '태극기 다섯 장을 골목 곳곳에 나누어 숨겨 두었네.': 'We hid five Taegukgi flags around the alleys.',
    '경찰보다 먼저 모두 찾아서 안전한 곳으로 옮겨 주게.': 'Find them all before the police and take them somewhere safe.',
    '붉은 곳에는 보초가 서 있으니 다른 길로 돌아가야겠어.': 'Guards stand on the red squares. I must go around them.',
    '【역사 메모】 실제 유관순 열사는 1919년 3·1 운동 때 아우내 장터에서 만세운동을 이끌었고, 1920년 서대문 형무소에서 돌아가셨다.': '[History note] The real Yu Gwan-sun led the Manse protest at Aunae Market during the March 1st Movement of 1919, and died in Seodaemun Prison in 1920.',
    '이 장은 유관순 열사의 뜻을 기리며 꾸민 이야기다. 태극기를 지켜 낸 주인공은 유관순을 만났다.': 'This chapter is a story made to honor her spirit. Having saved the flags, you meet Yu Gwan-sun.',
    '이 태극기로 만세운동을 준비할 거예요.': 'We will prepare the Manse Movement with these flags.',
    '광장에 모인 사람들에게 하나씩 나누어 주고, 독립의 뜻을 알려 주세요.': 'Give one to each person in the square and tell them what independence means.',
    '순찰하는 일본 경찰이 있으니 가까이 가지 않게 조심하세요.': 'Japanese police are on patrol. Do not get close to them.',
    '모든 준비를 마쳤다. 이제 마지막 싸움만이 남았다.': 'Everything is ready. Only the final battle remains.',
    '여기까지 온 것은 모두 자네와 같은 이들의 용기 덕분이네.': 'We came this far thanks to the courage of people like you.',
    '우리 한국광복군도 자네 뒤를 지킬 걸세. 우리는 모두 함께 싸우는 것이네.': 'The Korean Liberation Army will stand behind you. We all fight together.',
    '감히 독립을 꿈꾸다니! 여기서 끝을 내 주마!': 'How dare you dream of independence! This ends here!',
    '우리는 물러서지 않는다!': 'We will not back down!',
    '마지막 임무까지 마친 그날 밤이 지나고…': 'The night after the last mission passed…',
    '이보게, 들리는가? 거리에서 사람들이 만세를 부르고 있네.': 'Listen! Can you hear? People are shouting "Manse!" in the streets.',

    /* 1장 */
    '음?': 'Hm?',
    '누구냐!': 'Who goes there!',
    '지금 달려!': 'Run now!',
    '멈출 준비!': 'Get ready to stop!',
    '멈춰!': 'Freeze!',
    '움직이는 걸 경찰이 봤어요!': 'The police saw you moving!',
    '오른쪽 방향키를': 'Hold the right arrow',
    '꾹': 'down',
    '누르면 달려요 ·': 'to run ·',
    '「멈춰!」 가 뜨면': 'when “Freeze!” appears,',
    '얼른 손을 떼면': 'let go quickly',
    '살 수 있어요': 'to stay safe',
    '첫 번째 경찰': 'Police 1',
    '두 번째 경찰': 'Police 2',
    '경찰이 한 명 더 왔다! 둘 다 뒤돌아야 달릴 수 있다.': 'Another policeman came! Run only when both have turned away.',
    '경찰이 뒤돌았을 때만 달려라. 「멈춰!」가 뜨면 얼른 손을 떼면 된다.': 'Run only while the police look away. When “Freeze!” appears, let go quickly.',
    '경찰이 뒤돌았을 때만 달려라. 「멈춰!」가 뜨면 멈추고, 손전등이 오면 짚단·장독·수레 옆에서 ↓ 로 숨어라.': 'Run only while the police look away. Stop at “Freeze!”, and when the flashlight comes, hide next to a haystack, jar or cart with ↓.',
    '손전등을 비춘다!  짚단 · 장독 · 수레 옆에서 ↓ 로 숨어라!': 'Flashlight coming! Hide next to a haystack, jar or cart with ↓!',
    '손전등 불빛에 들켰다!': 'The flashlight found you!',
    '손전등 불빛에 들켰어요!': 'The flashlight found you!',
    '…아무도 없군': '…nobody there',
    '아슬아슬!': 'Close call!',
    '숨어라!': 'Hide!',
    '휴…': 'Phew…',
    '↓ 숨기': '↓ hide',
    '살 수 있어요 ·': 'to stay safe ·',
    '손전등이 오면 숨을 곳 옆에서': 'when the flashlight comes, hide with',
    '살 수 있어요 · 손전등이 오면 숨을 곳 옆에서': 'to stay safe · when the flashlight comes, hide with',

    /* 2장 : 퀴즈 */
    '역사 문제': 'History quiz',
    '스틱 위·아래로 고르고, 2번 버튼으로 대답한다': 'Choose with the stick (up/down) and answer with button #2',
    '김구 선생님의 물음에 답하여라. 스틱 위·아래로 고르고 2번 버튼으로 대답한다.': 'Answer Kim Gu\'s questions. Choose with the stick (up/down) and answer with button #2.',
    '옳거니! 잘 알고 있구나.': 'Correct! You know it well.',
    '김구 선생님의 물음에 답하여라. 등잔불이 다 타기 전에! 막히면 3번(X)으로 귀띔을 받는다.': 'Answer Kim Gu\'s questions before the lamp burns out! Stuck? Press #3 (X) for a hint.',
    '스틱 위·아래로 고르고, 2번 버튼으로 대답한다 · 3번(X) 김구 선생님의 귀띔': 'Choose with the stick (up/down), answer with #2 · #3 (X) hint from Kim Gu',
    '저벅… 저벅…': 'step… step…',
    '쉿! 일본 경찰이 문 앞을 지나간다…': 'Shh! Japanese police are passing the door…',
    '휴, 지나갔다. 다시 생각해 보자.': 'Phew, they\'re gone. Let\'s think again.',
    '김구 : 훌륭하네! 자네라면 믿고 다음 임무를 맡길 수 있겠어.': 'Kim Gu: Excellent! I can trust you with the next mission.',
    '정답': 'CORRECT',
    '백범 인정': 'APPROVED',
    '귀띔': 'hint',
    '우리나라 국기의 이름은 무엇일까요?': 'What is the name of Korea\'s national flag?',
    '태극기': 'Taegukgi',
    '일장기': 'Hinomaru',
    '성조기': 'Stars and Stripes',
    '일장기는 일본, 성조기는 미국의 국기예요.': 'The Hinomaru is Japan\'s flag, and the Stars and Stripes is the USA\'s.',
    '광복절은 몇 월 며칠일까요?': 'When is Liberation Day (Gwangbokjeol)?',
    '8월 15일': 'August 15',
    '3월 1일': 'March 1',
    '6월 25일': 'June 25',
    '1945년 8월 15일, 우리나라가 광복을 맞이했어요.': 'Korea was liberated on August 15, 1945.',
    '3·1운동 때 사람들이 다 함께 외친 말은?': 'What did people shout together in the March 1st Movement?',
    '대한 독립 만세': 'Long live Korean independence',
    '대한민국 만세': 'Long live the Republic of Korea',
    '광복 만세': 'Long live liberation',
    '1919년 3월 1일, 온 나라에 "대한 독립 만세" 소리가 울려 퍼졌어요.': 'On March 1, 1919, "Long live Korean independence!" rang out across the country.',
    '일제강점기에 우리나라를 지배한 나라는 어디일까요?': 'Which country ruled Korea during the colonial period?',
    '일본': 'Japan',
    '중국': 'China',
    '러시아': 'Russia',
    '1910년부터 1945년까지 일본이 우리나라를 지배했어요.': 'Japan ruled Korea from 1910 to 1945.',
    '우리나라를 대표하는 꽃(나라꽃)은 무엇일까요?': 'What is Korea\'s national flower?',
    '무궁화': 'Mugunghwa (rose of Sharon)',
    '벚꽃': 'Cherry blossom',
    '장미': 'Rose',
    '무궁화는 "끝없이 피는 꽃"이라는 뜻을 가진 우리나라 꽃이에요.': 'Mugunghwa, "the flower that never stops blooming", is Korea\'s national flower.',
    '3·1운동에서 만세를 부르다 붙잡힌 소녀는 누구일까요?': 'Which girl was arrested for shouting "Manse" in the March 1st Movement?',
    '신사임당': 'Shin Saimdang',
    '논개': 'Nongae',
    '유관순은 열일곱 살에 만세운동을 이끌었어요.': 'Yu Gwan-sun led the Manse protest when she was a teenager.',
    '대한민국 임시정부를 이끈 분은 누구일까요?': 'Who led the Provisional Government of the Republic of Korea?',
    '이순신': 'Yi Sun-sin',
    '세종대왕': 'King Sejong',
    '김구 선생님은 임시정부의 주석으로 독립운동을 이끌었어요.': 'Kim Gu led the independence movement as President of the Provisional Government.',
    '태극기 가운데 있는 동그란 무늬의 이름은?': 'What is the circle in the middle of the Taegukgi called?',
    '태극': 'Taegeuk',
    '해와 달': 'Sun and moon',
    '빨강과 파랑이 어우러진 이 무늬를 태극이라고 해요.': 'This red-and-blue pattern is called the Taegeuk.',
    '3·1운동이 일어난 해는 언제일까요?': 'In which year did the March 1st Movement happen?',
    '1919년': '1919',
    '1910년': '1910',
    '1945년': '1945',
    '1950년': '1950',
    '1919년 3월 1일에 3·1운동이 일어났어요. 1910년은 나라를 빼앗긴 해예요.': 'The March 1st Movement began on March 1, 1919. 1910 is the year Korea lost its sovereignty.',
    '나라를 되찾은 날을 기념하는 날의 이름은?': 'What is the holiday that celebrates Korea winning back its freedom?',
    '광복절': 'Liberation Day',
    '개천절': 'National Foundation Day',
    '한글날': 'Hangeul Day',
    '광복절은 8월 15일이에요. 개천절은 고조선을 세운 날, 한글날은 한글을 기념하는 날이에요.': 'Liberation Day is August 15. National Foundation Day marks the founding of Gojoseon, and Hangeul Day celebrates the Korean alphabet.',
    '대한민국 임시정부가 세워진 나라는 어디일까요?': 'In which country was the Provisional Government set up?',
    '미국': 'USA',
    '1919년 중국 상하이에 대한민국 임시정부를 세웠어요.': 'The Provisional Government was founded in Shanghai, China in 1919.',
    '김구 선생님이 쓴 책의 이름은 무엇일까요?': 'What is the name of the book Kim Gu wrote?',
    '백범일지': 'Baekbeom Ilji',
    '난중일기': 'Nanjung Ilgi',
    '목민심서': 'Mongmin Simseo',
    '백범은 김구 선생님의 호예요. 난중일기는 이순신 장군이 썼어요.': 'Baekbeom is Kim Gu\'s pen name. Nanjung Ilgi was written by Admiral Yi Sun-sin.',
    '우리나라가 일본에게 나라를 빼앗긴 해는 언제일까요?': 'In which year did Korea lose its sovereignty to Japan?',
    '1910년부터 1945년까지, 35년 동안 나라를 빼앗겼어요.': 'Korea lost its sovereignty for 35 years, from 1910 to 1945.',
    '1940년 대한민국 임시정부가 만든 군대의 이름은?': 'What army did the Provisional Government create in 1940?',
    '한국광복군': 'Korean Liberation Army',
    '의병': 'Righteous Army',
    '별기군': 'Byeolgigun',
    '한국광복군은 나라를 되찾기 위해 임시정부가 만든 우리 군대예요.': 'The Korean Liberation Army was the army the Provisional Government created to win back the country.',
    '1909년 하얼빈에서 이토 히로부미를 처단한 독립운동가는?': 'Which independence activist shot Ito Hirobumi in Harbin in 1909?',
    '안중근': 'An Jung-geun',
    '윤봉길': 'Yun Bong-gil',
    '이봉창': 'Yi Bong-chang',
    '안중근 의사는 1909년 중국 하얼빈에서 의거를 일으켰어요.': 'An Jung-geun carried out his act of resistance in Harbin, China in 1909.',

    /* 3장 */
    '찾은 태극기': 'Flags found',
    '보초를 서던 일본 경찰에게 들켰어요!': 'A Japanese guard caught you!',
    '다섯 장을 모두 찾았다! 안전한 곳으로 옮겨라.': 'All five found! Take them to the safe place.',
    '태극기 다섯 장을 모두 안전하게 지켜냈다!': 'All five flags are safe!',
    '순찰하던 일본 경찰과 마주쳤어요!': 'You ran into a patrolling policeman!',
    '숨겨진 태극기 다섯 장을 모두 찾아라. 붉은 곳은 보초가 지키고 있다.': 'Find all five hidden flags. Guards watch the red squares.',
    '스틱': 'Stick',
    '네 방향 이동  ·': 'move 4 ways  ·',
    '네 방향 이동 ·': 'move 4 ways ·',
    '보초(붉은 곳 금지)  ·': 'guard (no red squares)  ·',
    '보초(붉은 곳 금지 · 점선이 깜빡이면 곧 넓어져요)  ·': 'guard (no red squares · blinking dashes = about to grow)  ·',
    '보초(붉은 곳 금지 · 점선이 깜빡이면 곧 넓어져요) ·': 'guard (no red squares · blinking dashes = about to grow) ·',
    '넓어진 경계 구역에 들켰어요!': 'The guard\'s watch area grew and caught you!',
    '보초(붉은 곳 금지) ·': 'guard (no red squares) ·',
    '순찰(부딪히면 들킴)': 'patrol (don\'t bump into them)',
    '미로에 숨겨진 태극기 다섯 장을 모두 찾아 안전한 곳으로 옮겨라. 붉은 곳은 보초가 지킨다.': 'Find all five flags hidden in the maze and take them to safety. Guards watch the red squares.',
    '어두운 골목에서 반짝이는 태극기 다섯 장을 찾아 안전한 곳으로! 경찰 수색 막대가 다 차기 전에.': 'Find the five flags twinkling in the dark alleys and take them to safety, before the police search bar fills!',
    '어둠 속에 숨겨진 태극기 다섯 장을 찾아라. 반짝이는 곳을 잘 봐! 경찰보다 먼저!': 'Find the five flags hidden in the dark. Watch for twinkles! Beat the police!',
    '경찰 수색': 'Police search',
    '일본 경찰이 먼저 태극기를 찾아냈어요!': 'The Japanese police found the flags first!',
    '휴!': 'Phew!',
    '+1': '+1',

    /* 4장 */
    '고맙습니다! 이 깃발을 꼭 들겠습니다.': 'Thank you! I will hold this flag high.',
    '우리 손으로 나라를 되찾읍시다.': 'Let us win back our country with our own hands.',
    '아이들에게도 나누어 주겠소.': 'I will share them with the children too.',
    '두렵지만, 함께라면 할 수 있습니다.': 'I am scared, but together we can do it.',
    '대한 독립 만세!': 'Long live Korean independence!',
    '남은 태극기': 'Flags left',
    '사람들 곁으로 다가가야 한다.': 'You need to get closer to the people.',
    '유관순 : 이제 다 함께 만세를 부를 때입니다!': 'Yu Gwan-sun: Now it is time to shout "Manse" together!',
    '순찰하던 일본 경찰에게 들켰다!': 'A patrolling policeman caught you!',
    '만세운동을 준비하다 일본 경찰에게 들켰어요!': 'The police caught you preparing the Manse Movement!',
    '유관순 : 이 태극기를 사람들에게 나누어 주세요.': 'Yu Gwan-sun: Please hand these flags out to the people.',
    '걸어다니기  ·': 'walk  ·',
    '걸어다니기 ·': 'walk ·',
    '곁에 있는 사람에게 태극기 건네기': 'give a flag to a nearby person',
    '너무 멀어요. 곁으로 다가가야 한다.': 'Too far. Get closer.',
    '담과 수레를 돌아 사람들에게 태극기를 나누어 주어라. 순찰하는 일본 경찰을 조심할 것.': 'Go around the walls and carts and hand out the flags. Watch out for the patrolling police.',
    '경찰 등불 앞을 피해 뒤로 돌아가며, 사람 곁에서 2번을 꾹 눌러 태극기를 몰래 건네라. 다 건네면 유관순에게!': 'Stay out of the police lanterns and sneak behind them. Hold #2 next to a person to hand over a flag. Then return to Yu Gwan-sun!',
    '2번 꾹': 'hold #2',
    '곁에 있는 사람에게 몰래 건네기  ·  경찰 등불 앞은 피하고 뒤로 돌아가요': 'secretly hand a flag to a nearby person  ·  avoid the lantern light, go behind the police',
    '건네다 멈췄다. 2번을 꾹 눌러야 몰래 건넬 수 있어.': 'You stopped. Hold #2 to hand it over secretly.',
    '유관순에게 돌아가 만세 신호를 보내자!': 'Go back to Yu Gwan-sun and give the Manse signal!',
    '다 건넸다! 유관순에게 돌아가 2번으로 만세 신호를 보내자!': 'All handed out! Go back to Yu Gwan-sun and press #2 to give the Manse signal!',
    '경찰의 등불에 들켰다!': 'Caught in a policeman\'s lantern light!',

    /* 5장 */
    '준비!  곧 공격한다': 'Ready! Attack coming',
    '공격!  점프로 피해라': 'Attack! Jump to dodge',
    '빈틈!  지금 공격하라': 'Opening! Attack now',
    '명중! 헌병대장이 물러선다.': 'Hit! The captain steps back.',
    '헛손질! 잠시 움직일 수 없다.': 'Missed! You can\'t move for a moment.',
    '공격에 맞았다! 다음엔 점프로 피하자.': 'You got hit! Jump to dodge next time.',
    '일본 헌병대장을 물리쳤다! 광복이 눈앞이다.': 'You defeated the captain! Liberation is near.',
    '기력이 다했다...': 'Out of strength...',
    '일본 헌병대장과의 싸움에서 힘이 다했어요!': 'You ran out of strength fighting the captain!',
    '잘 피했다!': 'Nice dodge!',
    '회피!': 'Dodge!',
    '헛손질!': 'Miss!',
    '승리!': 'Victory!',
    '주인공': 'You',
    '김구 · 한국광복군': 'Kim Gu · Korean Liberation Army',
    '마지막 싸움이다. 겁먹지 말자.': 'The final battle. Don\'t be afraid.',
    '점프해서 피하기  ·': 'jump to dodge  ·',
    '점프해서 피하기 ·': 'jump to dodge ·',
    '빈틈에 공격하기': 'attack the opening',
    '「준비」 뒤 공격이 온다. 1번으로 점프해 피하고, 「빈틈」에 3번으로 공격하라.': 'After “Ready” comes an attack. Jump with #1 to dodge, then attack with #3 at the “Opening”.',

    /* 6장 */
    '1945년 8월 15일.': 'August 15, 1945.',
    '일본의 지배에서 벗어나, 조선이 광복을 맞이했다.': 'Free from Japanese rule, Korea was liberated.',
    '사람들은 거리로 나와 태극기를 흔들었다.': 'People poured into the streets waving the Taegukgi.',
    '주인공도 독립운동가들과 함께 자유를 되찾은 기쁨을 나누었다.': 'You shared the joy of freedom with the independence activists.',
    '태극기를 흔들어 새벽을 맞이하라  (스틱 좌 · 우)': 'Wave the flag to bring the dawn  (stick left · right)',
    '스틱을 좌 · 우로 흔들어 태극기를 펄럭여라': 'Wave the stick left and right to fly the flag',
    '드디어 광복의 날. 스틱을 좌우로 흔들어 태극기를 펄럭이면 새벽이 밝아온다.': 'Liberation Day at last. Wave the stick left and right to fly the flag, and the dawn will come.',
    '드디어 광복의 날. 북에 맞춰 A 버튼으로 만세를 부르고, 스틱을 흔들어 태극기를 펄럭여라.': 'Liberation Day at last. Shout "Manse!" with A on the drum beat, and wave the flag with the stick.',
    '북이 고리에 닿을 때': 'When a drum reaches the ring, press',
    '버튼 = 만세!  ·  스틱 좌 · 우 = 태극기 흔들기': '= Manse!  ·  Stick left · right = wave the flag',
    '북에 맞춰': 'On the drum beat, press',
    '버튼으로 만세! 태극기도 흔들어 새벽을 맞이하라': 'for Manse! Wave the flag too and bring the dawn',
    '딱 좋아!': 'Perfect!',
    '좋아!': 'Good!',
    '만세!': 'Manse!',
    '함께해요!': 'Join us!',

    /* 들켰을 때 · 끝 화면 */
    '들켰다!': 'Caught!',
    '일본 경찰에게 발각되었어요.': 'The Japanese police caught you.',
    '이번 장을 처음부터 다시 해요': 'Restarting this chapter',
    '광복': 'Liberation',
    '광복!': 'Liberation!',
    '모든 임무를 마쳤어요!': 'All missions complete!',
    '모든 임무를 마치고 독립을 이루었어요. 대한 독립 만세!': 'You completed every mission and won independence. Long live Korean independence!',
    '붙잡히고 말았다': 'You were captured',
    '하지만 포기하지 말아요. 다시 도전!': 'But don\'t give up. Try again!',
    '내 독립 포인트': 'My Independence Points',
    '최고 기록!': 'New record!',
    '최고 기록': 'High scores',
    '다시 하기': 'Play again',
    '오늘 배운 역사': 'History you learned today',
    '이 게임은 실제 역사를 바탕으로 꾸민 이야기예요.': 'This game is a story based on real history.',
    '아직 기록이 없어요': 'No records yet',
    '비밀 연락망': 'Secret network',
    '일제는 독립운동가를 늘 감시했어요. 그래서 대한민국 임시정부는 「연통제」라는 비밀 연락망을 만들어 몰래 소식과 편지를 주고받았어요.': 'Japan always watched independence activists, so the Provisional Government built a secret network called "Yeontongje" to pass news and letters in secret.',
    '김구는 대한민국 임시정부를 이끈 독립운동가예요. 1940년에는 임시정부의 주석(가장 높은 자리)이 되었어요.': 'Kim Gu was an independence activist who led the Provisional Government. In 1940 he became its President (the highest position).',
    '일제강점기에는 태극기를 마음대로 쓸 수 없었어요. 사람들은 태극기를 몰래 숨겨 두고 지켰어요.': 'Under Japanese rule, Koreans could not freely use the Taegukgi. People hid their flags and protected them.',
    '3·1 운동과 유관순': 'March 1st & Yu Gwan-sun',
    '1919년 3월 1일, 온 나라에서 「대한 독립 만세」를 외친 3·1 운동이 일어났어요. 유관순 열사는 고향 아우내 장터에서 만세운동을 이끌었어요.': 'On March 1, 1919, people all over Korea shouted "Long live Korean independence!" Yu Gwan-sun led the protest at Aunae Market in her hometown.',
    '1940년 임시정부는 우리 군대인 한국광복군을 만들었어요. 광복군은 나라 안으로 들어가 일본과 싸울 작전을 준비했어요.': 'In 1940 the Provisional Government created the Korean Liberation Army, which prepared a plan to enter Korea and fight Japan.',
    '1945년 8월 15일, 일본이 전쟁에서 지면서 우리나라는 광복을 맞았어요. 광복은 「빛을 되찾았다」는 뜻이에요.': 'On August 15, 1945, Japan lost the war and Korea was liberated. "Gwangbok" means "the light restored".',

    /* 덮개 창 : 멈춤 · 처음으로 · 설명 */
    '글씨 크기': 'Text size',
    '스틱으로 고르고 · 4번으로 결정': 'Choose with the stick · confirm with #4',
    '멈춤': 'PAUSE',
    '잠깐 멈춤': 'Paused',
    '잠깐 쉬는 중이에요.': 'Taking a short break.',
    '6번 버튼을 다시 누르면 이어서 해요!': 'Press button #6 again to continue!',
    '지금 소리 :': 'Sound now:',
    '(5번 버튼으로 바꿔요)': '(change with button #5)',
    '이어서 하기': 'Continue',
    '조종기 확인·맞추기': 'Controller check & setup',
    '조작': 'CONTROLS',
    '조작 방법': 'Controls',
    '닫기': 'Close',
    '처음': 'HOME',
    '처음으로 갈까요?': 'Go back to the start?',
    '지금까지 모은 독립 포인트가 사라져요.': 'Your Independence Points will be lost.',
    '정말 처음 화면으로 갈까요?': 'Really go back to the title screen?',
    '아니요, 계속할래요': 'No, keep playing',
    '네, 처음으로': 'Yes, go home',
    '설명': 'INFO',
    '게임 설명': 'About the game',
    '때는': 'The time is',
    '1940년대 일제강점기': 'the 1940s, the Japanese colonial period',
    '조선은 일본의 지배를 받고 있고,': 'Korea is under Japanese rule,',
    '사람들은 자유를 잃은 채 힘들게 살고 있어요.': 'and people have lost their freedom.',
    '주인공은 학교에서 돌아오는 길에': 'On the way home from school,',
    '독립운동가를 만나 비밀 임무를 맡게 돼요.': 'you meet an independence activist and take on a secret mission.',
    '목표는 단 하나, 독립!': 'There is only one goal: independence!',
    '임무 6개를 하나씩 해결하면 광복을 맞이해요.': 'Complete 6 missions one by one to reach liberation.',
    '일본 경찰에게 들키지 않게 조심하세요!': 'Don\'t get caught by the Japanese police!',
    '알겠어요': 'Got it',
    '방향키 / 스틱': 'Arrow keys / stick',

    /* 조종기 확인 · 맞추기 */
    '확인': 'CHECK',
    '조종기의 스틱과 버튼을 하나씩 움직여 보세요.': 'Move the stick and press the buttons one by one.',
    '들어오는 신호가 아래에 그대로 나타나요.': 'The signals appear below.',
    '조종기 맞추기': 'Controller setup',
    '자세한 진단': 'Detailed test',
    '기본값으로': 'Reset',
    '왼쪽 스위치(기종 선택)를': 'Set the left switch (mode) to',
    '(위쪽)에 두세요.': '(up).',
    '오른쪽 스위치(스틱 신호)를': 'Set the right switch (stick) to',
    '(가운데)에 두세요.': '(middle).',
    '이름': 'Name',
    '방식': 'Mode',
    'XINPUT (표준) — 좋아요': 'XINPUT (standard) — good',
    'DINPUT (표준 아님)': 'DINPUT (not standard)',
    '방향': 'Direction',
    '버튼': 'Buttons',
    '축': 'Axes',
    '스위치 두 개를 이렇게 두세요': 'Set the two switches like this',
    '· 왼쪽(기종 선택) →': '· Left (mode) →',
    '(위쪽)': '(up)',
    '· 오른쪽(스틱 신호) →': '· Right (stick) →',
    '(가운데)': '(middle)',
    '스틱을 움직였는데 위 「방향」에 불이 안 들어오면': 'If "Direction" does not light up when you move the stick,',
    '「조종기 맞추기」를 해보세요.': 'try "Controller setup".',
    '스틱을': 'Push the stick',
    '위로': 'UP',
    '아래로': 'DOWN',
    '왼쪽으로': 'LEFT',
    '오른쪽으로': 'RIGHT',
    '미세요': ' ',
    '조종기의': 'Press the',
    '버튼을 누르세요': 'button on the controller',
    '설정': 'SETUP',
    '이 단계 건너뛰기': 'Skip this step',
    '그만두기': 'Stop',
    '아래 두 버튼은 마우스로 눌러요': 'Use the mouse for the two buttons below',
    '처음 꽂은 조종기예요! 한 번만 맞추면 정확하게 움직여요.': 'New controller! Set it up once and it will work correctly.',
    '기다리는 중…': 'Waiting…',
    '건너뜀': 'skipped',
    '(건너뜀)': '(skipped)',
    '조종기를 읽는 중 문제가 생겼어요.': 'There was a problem reading the controller.',
    '아래 「이 단계 건너뛰기」로 넘어갈 수 있어요.': 'You can use "Skip this step" below.',
    '조종기가 잡히지 않았어요.': 'No controller found.',
    '이 페이지가 창 안의 창(iframe)에서 열려 있어요.': 'This page is open inside another page (iframe).',
    '브라우저는 이럴 때 조종기 사용을 막는 경우가 많아요.': 'Browsers often block controllers in that case.',
    '주소창에 게임 주소를': 'Paste the game address',
    '직접 붙여넣어 새 탭에서': 'directly into a new tab',
    '열어 주세요.': 'to open it.',
    '그러면 조종기가 잡혀요!': 'Then the controller will work!',
    '아무 버튼이나 한 번': 'Press any button',
    '눌러 보세요.': 'once on the controller.',
    '왼쪽 스위치를': 'Set the left switch to',
    'USB 를 뺐다 꽂고 새로고침하세요.': 'Unplug and replug the USB, then refresh.',
    '완료': 'DONE',
    '조종기 맞추기 끝!': 'Controller setup done!',
    '이제 조종기로 게임을 할 수 있어요.': 'You can now play with the controller.',
    '이 설정은 저장돼서 다음에 켜도 그대로예요.': 'This setup is saved for next time.',
    '좋아요': 'OK',
    '스틱 ✔': 'stick ✔',
    '스틱 (건너뜀)': 'stick (skipped)',
    '팀 - 서진': 'Team - Seojin',
    '조종기': 'Press',
    '버튼을 누르면 시작해요': 'on the controller to start',
    '키보드는 Enter · 마우스는 ▶ 클릭': 'Keyboard: Enter · Mouse: click ▶',
    '7번(LT) 버튼을': 'Press button #7 (LT)',
    '한 번 더': 'once more',
    '누르면 바로 처음 화면으로 가요': 'to go straight to the title screen',
    '2026. 창녕교육지원청영재교육원 초등발명반': '2026. Changnyeong Gifted Education Center · Elementary Invention Class',
    '누르면 달려요 · 「멈춰!」 가 뜨면': 'to run · when “Freeze!” appears,',
    'English': 'English',

    /* 자리 비움 */
    '대기': 'IDLE',
    '계속할까요?': 'Still playing?',
    '아무 버튼이나 누르면 이어서 해요.': 'Press any button to continue.',
    '그대로 두면 처음 화면으로 돌아가요.': 'Otherwise the game returns to the title screen.',
    '계속하기': 'Continue',
  };

  /* ---------- 숫자가 섞인 글씨는 모양을 보고 바꿔요 ---------- */
  const PATTERNS = [
    [/^제 (\d) 장$/, function (m) { return 'CHAPTER ' + m[1]; }],
    [/^(\d)장을 해내면 열려요$/, function (m) { return 'Unlocks after Chapter ' + m[1]; }],
    [/^(\d+)장$/, function (m) { return 'Ch.' + m[1]; }],
    [/^(\d+)점$/, function (m) { return m[1] + ' pts'; }],
    [/^만세 ×(\d+)$/, function (m) { return 'Manse ×' + m[1]; }],
    [/^연속 정답 ×(\d+)$/, function (m) { return 'Streak ×' + m[1]; }],
    [/^김구 : 흠… 「(.+)」 은\(는\) 아니라네\.$/, function (m) { return 'Kim Gu: Hmm… it\'s not “' + t(m[1]) + '”.'; }],
    [/^(\d+)번 (.+) ✔$/, function (m) { return '#' + m[1] + ' ' + t(m[2]) + ' ✔'; }],
    [/^(\d+)번 (.+) \(건너뜀\)$/, function (m) { return '#' + m[1] + ' ' + t(m[2]) + ' (skipped)'; }],
    [/^(\d+)번$/, function (m) { return '#' + m[1]; }],
    [/^(\d+)번 (.+)$/, function (m) { return '#' + m[1] + ' ' + t(m[2]); }],
    [/^찾은 태극기 (\d+) \/ (\d+)$/, function (m) { return 'Flags found ' + m[1] + ' / ' + m[2]; }],
    [/^남은 태극기 (\d+)개$/, function (m) { return 'Flags left: ' + m[1]; }],
    [/^태극기를 찾았다!\s+아직 (\d+)장 더 남았다\.$/, function (m) { return 'Found a flag! ' + m[1] + ' more to go.'; }],
    [/^「 (.+) 」  —  경찰이 한 명 더 왔다!$/, function (m) { return '“' + t(m[1]) + '”  —  Another policeman arrived!'; }],
    [/^「 (.+) 」$/, function (m) { return '“' + t(m[1]) + '”'; }],
    [/^아니란다\. 정답은 「(.+)」 이야\. (.+)$/, function (m) { return 'Not quite. The answer is “' + t(m[1]) + '”. ' + t(m[2]); }],
    [/^조종기 : 연결됨 \((\w+)\)$/, function (m) { return 'Controller: connected (' + m[1] + ')'; }],
    [/^🕹️ 조종기 연결됨 \((\w+)\)$/, function (m) { return '🕹️ Controller connected (' + m[1] + ')'; }],
    [/^(글씨|화면) 크기 (\d+)%$/, function (m) { return 'Text size ' + m[2] + '%'; }],
    [/^([■□]+) (.+)$/, function (m) { return m[1] + ' ' + t(m[2]); }],
    [/^게임에서 (\d)번 「(.+)」 버튼이 돼요$/, function (m) { return 'It becomes button #' + m[1] + ' “' + t(m[2]) + '” in the game'; }],
    [/^그 버튼은 이미 「(.+)」에 썼어요\. 다른 버튼을 눌러 주세요\.$/, function (m) { return 'That button is already used for “' + t(m[1]) + '”. Press a different one.'; }],
    [/^스틱 (.)$/, function (m) { return 'stick ' + m[1]; }],
    [/^(.+) 버튼$/, function (m) { return m[1] + ' button'; }],
    [/^(.+?) 하지만 포기하지 말아요\. 다시 도전!$/, function (m) { return t(m[1]) + ' But don\'t give up. Try again!'; }],
    // 🦘 점프 처럼 그림 글자 + 한국어
    [/^([^\s가-힣]+) (.+)$/, function (m) { return m[1] + ' ' + t(m[2]); }],
  ];

  let on = false;
  try { on = localStorage.getItem(KEY) === 'en'; } catch (e) {}

  /* 한 줄을 영어로 바꿔요. 번역표에 없으면 그대로 둬요 */
  function t(text) {
    if (!on || !text || !/[가-힣]/.test(text)) return text;
    const lead = text.match(/^\s*/)[0];
    const tail = text.match(/\s*$/)[0];
    const core = text.trim().replace(/ /g, ' ');
    if (Object.prototype.hasOwnProperty.call(EN, core)) return lead + EN[core] + tail;
    for (let i = 0; i < PATTERNS.length; i++) {
      const m = core.match(PATTERNS[i][0]);
      if (m) return lead + PATTERNS[i][1](m) + tail;
    }
    return text;
  }

  /* 화면의 글씨를 모두 살펴 바꿔요 */
  function walk(root) {
    if (!on || !root) return;
    if (root.nodeType === 3) { fixText(root); return; }
    if (root.nodeType !== 1) return;
    fixAttrs(root);
    const it = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    let n;
    while ((n = it.nextNode())) {
      if (n.nodeType === 3) fixText(n); else fixAttrs(n);
    }
  }
  function fixText(node) {
    const v = node.nodeValue;
    if (!/[가-힣]/.test(v)) return;
    const nv = t(v);
    if (nv !== v) node.nodeValue = nv;
  }
  function fixAttrs(el) {
    ['title', 'aria-label', 'placeholder'].forEach(function (a) {
      const v = el.getAttribute && el.getAttribute(a);
      if (v && /[가-힣]/.test(v)) el.setAttribute(a, t(v));
    });
  }

  /* 새 글씨가 나타날 때마다 바로 바꿔요 */
  const watcher = new MutationObserver(function (list) {
    if (!on) return;
    list.forEach(function (m) {
      if (m.type === 'characterData') fixText(m.target);
      else if (m.type === 'attributes') fixAttrs(m.target);
      else m.addedNodes.forEach(walk);
    });
  });

  function start() {
    document.documentElement.lang = on ? 'en' : 'ko';
    if (on) {
      document.title = t(document.title);
      walk(document.body);
    }
    watcher.observe(document.body, {
      childList: true, subtree: true, characterData: true,
      attributes: true, attributeFilter: ['title', 'aria-label'],
    });
  }

  /* 한국어 ↔ English 바꾸기 (화면을 새로 불러와요) */
  function toggle() {
    try { localStorage.setItem(KEY, on ? 'ko' : 'en'); } catch (e) {}
    location.reload();
  }

  if (document.body) start();
  else document.addEventListener('DOMContentLoaded', start);

  return { t: t, isEnglish: function () { return on; }, toggle: toggle };
})();
