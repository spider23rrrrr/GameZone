const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
$('#year').textContent = new Date().getFullYear();

const search = $('#search');
const cards = $$('.game-card');
let activeFilter = 'all';
function filterGames(){
  const q = search.value.trim().toLocaleLowerCase('ar');
  let visible = 0;
  cards.forEach(card => {
    const matchesText = (card.dataset.name + ' ' + card.textContent).toLocaleLowerCase('ar').includes(q);
    const matchesCategory = activeFilter === 'all' || card.dataset.category === activeFilter;
    card.hidden = !(matchesText && matchesCategory);
    if(!card.hidden) visible++;
  });
  $('#no-results').hidden = visible !== 0;
}
search.addEventListener('input', filterGames);
$$('.filter').forEach(btn => btn.addEventListener('click', () => {
  $$('.filter').forEach(b => b.classList.remove('active'));
  btn.classList.add('active'); activeFilter = btn.dataset.filter; filterGames();
}));

const modal = $('#game-modal'), content = $('#game-content'), title = $('#modal-title');
let cleanup = null;
function openGame(game){
  if(cleanup){cleanup();cleanup=null}
  const names = {clicker:'اختبار سرعة النقر',guess:'خمن الرقم',tic:'إكس أو'};
  title.textContent = names[game] || 'اللعبة';
  modal.hidden = false;
  if(game==='clicker') renderClicker();
  if(game==='guess') renderGuess();
  if(game==='tic') renderTic();
}
function closeGame(){modal.hidden=true;if(cleanup){cleanup();cleanup=null}}
$$('[data-game]').forEach(btn=>btn.addEventListener('click',()=>openGame(btn.dataset.game)));
$('#close-modal').addEventListener('click',closeGame);
$$('[data-close="true"]').forEach(el=>el.addEventListener('click',closeGame));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.hidden)closeGame()});

function renderClicker(){
  content.innerHTML = `<div class="game-ui"><p>انقر بأسرع ما يمكنك قبل انتهاء الوقت!</p><div class="big-score" id="score">0</div><p id="timer">الوقت: 10 ثوانٍ</p><button id="tap" disabled>ابدأ أولاً</button><p class="status" id="result"></p></div>`;
  let score=0, time=10, interval=null, running=false;
  const tap=$('#tap',content), scoreEl=$('#score',content), timer=$('#timer',content), result=$('#result',content);
  tap.addEventListener('click',()=>{if(running){score++;scoreEl.textContent=score}});
  const start=document.createElement('button');start.textContent='ابدأ اللعب';tap.before(start);
  start.addEventListener('click',()=>{
    if(running)return;score=0;time=10;running=true;scoreEl.textContent='0';result.textContent='انطلق!';
    tap.disabled=false;tap.textContent='انقر!';
    start.disabled=true;
    interval=setInterval(()=>{time--;timer.textContent='الوقت: '+time+' ثوانٍ';if(time<=0){clearInterval(interval);running=false;tap.disabled=true;start.disabled=false;tap.textContent='انتهى الوقت';result.textContent='نتيجتك: '+score+' نقرة! جرّب مرة أخرى.'}},1000);
  });
  cleanup=()=>clearInterval(interval);
}
function renderGuess(){
  const secret=Math.floor(Math.random()*100)+1;let tries=0,finished=false;
  content.innerHTML=`<div class="game-ui"><p>اختر رقمًا من 1 إلى 100 وحاول الوصول إلى الرقم الصحيح.</p><input id="guess-input" type="number" min="1" max="100" placeholder="1 - 100"><button id="guess-btn">تحقق</button><p class="status" id="guess-status" aria-live="polite">بالتوفيق!</p><p>عدد المحاولات: <b id="tries">0</b></p><button id="guess-reset">لعبة جديدة</button></div>`;
  const input=$('#guess-input',content), status=$('#guess-status',content);
  function check(){if(finished)return;const n=Number(input.value);if(!Number.isInteger(n)||n<1||n>100){status.textContent='أدخل رقمًا صحيحًا بين 1 و100.';return}tries++;$('#tries',content).textContent=tries;if(n===secret){status.textContent=`أحسنت! وجدت الرقم ${secret} في ${tries} محاولة.`;finished=true}else status.textContent=n<secret?'الرقم أكبر من ذلك!':'الرقم أصغر من ذلك!';input.value='';input.focus()}
  $('#guess-btn',content).addEventListener('click',check);input.addEventListener('keydown',e=>{if(e.key==='Enter')check()});
  $('#guess-reset',content).addEventListener('click',renderGuess);
}
function renderTic(){
  let board=Array(9).fill(''),turn='X',over=false;
  content.innerHTML=`<div class="game-ui"><p>العب ضد صديق بجانبك. اللاعب X يبدأ أولاً.</p><div class="tic-board" id="tic-board"></div><p class="status" id="tic-status" aria-live="polite">دور اللاعب X</p><button id="tic-reset">إعادة اللعب</button></div>`;
  const boardEl=$('#tic-board',content),status=$('#tic-status',content);
  const wins=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  function draw(){boardEl.innerHTML='';board.forEach((v,i)=>{const b=document.createElement('button');b.className='tic-cell';b.textContent=v;b.setAttribute('aria-label','الخانة '+(i+1));b.addEventListener('click',()=>move(i));boardEl.appendChild(b)})}
  function move(i){if(over||board[i])return;board[i]=turn;const won=wins.some(line=>line.every(k=>board[k]===turn));if(won){status.textContent='فاز اللاعب '+turn+'!';over=true}else if(board.every(Boolean)){status.textContent='تعادل!';over=true}else{turn=turn==='X'?'O':'X';status.textContent='دور اللاعب '+turn}draw()}
  function reset(){board=Array(9).fill('');turn='X';over=false;status.textContent='دور اللاعب X';draw()}
  $('#tic-reset',content).addEventListener('click',reset);draw();
}
// أضف اسم اللعبة للقائمة
const names = {clicker:'اختبار سرعة النقر', guess:'خمن الرقم', tic:'إكس أو', rps:'حجر ورقة مقص'};

// وأضف شرط تشغيل اللعبة
if(game==='rps') renderRPS();
function renderRPS() {
  content.innerHTML = `
    <div class="game-ui">
      <p>اختر إحدى الخيارات لمواجهة الكمبيوتر:</p>
      <div style="font-size: 30px; margin: 15px 0;">
        <button id="rock" style="font-size:24px;">🪨 حجر</button>
        <button id="paper" style="font-size:24px;">📄 ورقة</button>
        <button id="scissors" style="font-size:24px;">✂️ مقص</button>
      </div>
      <p class="status" id="rps-status">ابدأ اللعب!</p>
      <p>النقاط - أنت: <b id="p-score">0</b> | الكمبيوتر: <b id="c-score">0</b></p>
    </div>
  `;

  let pScore = 0, cScore = 0;
  const choices = ['حجر', 'ورقة', 'مقص'];
  const emojis = { 'حجر': '🪨', 'ورقة': '📄', 'مقص': '✂️' };

  function play(playerChoice) {
    const compChoice = choices[Math.floor(Math.random() * 3)];
    const status = $('#rps-status', content);

    if (playerChoice === compChoice) {
      status.textContent = `تعادل! كلاهما اختار ${emojis[playerChoice]}`;
    } else if (
      (playerChoice === 'حجر' && compChoice === 'مقص') ||
      (playerChoice === 'ورقة' && compChoice === 'حجر') ||
      (playerChoice === 'مقص' && compChoice === 'ورقة')
    ) {
      pScore++;
      status.textContent = `فزت! ${emojis[playerChoice]} يهزم ${emojis[compChoice]}`;
    } else {
      cScore++;
      status.textContent = `خسرت! ${emojis[compChoice]} يهزم ${emojis[playerChoice]}`;
    }

    $('#p-score', content).textContent = pScore;
    $('#c-score', content).textContent = cScore;
  }

  $('#rock', content).onclick = () => play('حجر');
  $('#paper', content).onclick = () => play('ورقة');
  $('#scissors', content).onclick = () => play('مقص');
}
// أضف اسم اللعبة لقائمة الأسماء
const names = {
  clicker: 'اختبار سرعة النقر',
  guess: 'خمن الرقم',
  tic: 'إكس أو',
  geometry: 'Geometry Dash' // 👈 اسم اللعبة الجديدة
};

// أضف الشرط لفتح اللعبة
if(game === 'geometry') renderIframeGame('https://scratch.mit.edu/projects/105500895/embed');
function renderIframeGame(gameUrl) {
  content.innerHTML = `
    <div class="game-ui" style="padding: 10px;">
      <iframe 
        src="${gameUrl}" 
        style="width: 100%; height: 380px; border: none; border-radius: 10px;" 
        allowfullscreen>
      </iframe>
    </div>
  `;
}
