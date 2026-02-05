// ====== Supabase 設定 ======
// ★ここにあなたのSupabase URLとAnon Keyを入れてください
const SUPABASE_URL = 'https://zitbkitympccjrcmnmxa.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_A8WOzqnOfTymxV9X7h60mw_063YdJAQ';

// Supabaseクライアントの初期化
let supabase;
try {
  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log('✅ Supabase initialized successfully');
} catch (error) {
  console.error('❌ Supabase initialization failed:', error);
}

// ====== 設定 ======
const AREA_STEP_MIN = 600;    // 600分(10h)ごとにエリア
const KM_PER_MIN = 0.01;      // 1分 = 0.01km
const AREAS = [
  { id: 1,  name: "出航前夜" },
  { id: 2,  name: "霧の山麓" },
  { id: 3,  name: "帳簿の小径" },
  { id: 4,  name: "稜線の風" },
  { id: 5,  name: "印章の峠" },
  { id: 6,  name: "薄明の谷" },
  { id: 7,  name: "配分の幕営" },
  { id: 8,  name: "星図の高地" },
  { id: 9,  name: "外套の回廊" },
  { id: 10, name: "暁の旗影" },

  { id: 11, name: "古道の勘定" },
  { id: 12, name: "鐘楼の残高" },
  { id: 13, name: "監査の岩稜" },
  { id: 14, name: "約定の断崖" },
  { id: 15, name: "元帳の城門" },
  { id: 16, name: "仕訳の渡渉" },
  { id: 17, name: "黄昏の城塞" },
  { id: 18, name: "未収の雪前" },
  { id: 19, name: "月白の稜線" },
  { id: 20, name: "白い峠道" },

  { id: 21, name: "雪渓の勘定" },
  { id: 22, name: "静寂の監査路" },
  { id: 23, name: "星影の元帳" },
  { id: 24, name: "氷原の配分" },
  { id: 25, name: "黒曜の城壁" },
  { id: 26, name: "残高の祈り" },
  { id: 27, name: "断崖の印章" },
  { id: 28, name: "白夜の回廊" },
  { id: 29, name: "境界の鐘" },
  { id: 30, name: "暁へ続く稜線" },
];

const AREA_NAME_POOLS = [
  // Chapter 1(序盤:柔らかい/霧/焚き火)
  {
    light: ["薄明", "暁", "霧", "宵", "星影"],
    terrain: ["山麓", "小径", "谷", "幕営", "稜線", "峠"],
    acct: ["帳簿", "印章", "配分", "約定", "未収", "元帳"],
    flavor: ["焚き火", "外套", "古道", "旗影", "回廊", "星図"],
  },
  // Chapter 2(中盤:硬い/城塞/断崖/監査)
  {
    light: ["黄昏", "月白", "夜", "黒曜", "薄闇"],
    terrain: ["城門", "城塞", "断崖", "岩稜", "高地", "回廊"],
    acct: ["監査", "仕訳", "残高", "勘定", "契約", "見積"],
    flavor: ["鐘楼", "検問", "関所", "追手", "封印", "誓い"],
  },
  // Chapter 3(終盤:白い/雪/静寂)
  {
    light: ["白夜", "暁光", "星白", "月影", "静寂"],
    terrain: ["雪渓", "氷原", "白い峠", "雪前", "境界", "稜線"],
    acct: ["清算", "精算", "残差", "一致", "確証", "回収"],
    flavor: ["祈り", "終端", "古い星図", "帰路", "門", "誓約"],
  },
];

// ストーリー解放条件
const STORIES = [
  {
    id: 1,
    title: "第1話:帳簿と焚き火",
    unlockMin: 300,
    canShift: false,
    body:
`風は冷たく、山の影は早い。わたしは小さな焚き火の前で、革の帳簿を開いた。
この旅では、歩いた距離ではなく「積み上げた時間」が道標になる。

隊の補給係は言う。「物資は有限。配分を誤れば、明日が消える」
今日の勉強時間を、ページの端に静かに記す。数字は嘘をつかない。

火の向こう側に、銀の外套を羽織った護衛が立っていた。
彼は必要以上に近づかず、必要以上に目を逸らさない。
「記録するのか」それだけ。声は低く、刺さらない。

わたしが頷くと、彼は一瞬だけ口元をゆるめた。
その表情は、夜の山より短い。
旅は今夜、ようやく始まる。`,
    choices: [
      { text: "「手伝って」と言う(近づく)" },
      { text: "「大丈夫」と言う(距離を保つ)" },
    ],
    diffs: [
      { when: (st)=> st.trust >= 3, text: "わたしが記す手つきに、彼は何も言わず頷いた。" },
      { when: (st)=> st.loyalty >= 2, text: "気づくと彼は、焚き火の風上を塞ぐ位置に立っていた。" },
    ],
  },

  {
    id: 2,
    title: "第2話:契約の印章",
    unlockMin: 600,
    canShift: false,
    body:
`峠の交易所は石造りで、冷えた匂いがした。
宿代は前払い。食料は保証なし。ここでは言葉より契約が強い。

帳簿の余白に条件を書き出す。
「対価」「期限」「不履行の罰」――短い線で、未来を縛るために。
護衛は黙ってそれを見ている。わたしが迷うと、指先で一箇所だけ示した。
「成功報酬にするなら、成功の定義を決めろ」

その助言は正しい。腹立たしいほど。
印章を押す。蝋が赤く固まって、運命みたいに見える。

外へ出ると、雨が止んでいた。
彼が外套を少しだけ傾ける。わたしの肩に雨粒が落ちない角度。
気づいたふりをするか、しないか。あなたは迷う。`,
    choices: [
      { text: "「…ありがとう」と小さく言う(気づいていると伝える)" },
      { text: "何も言わずに歩く(平静を装う)" },
    ],
    diffs: [
      { when: (st)=> st.trust >= 4, text: "印章をしまうと、彼は迷わず出口へ先導した。" },
      { when: (st)=> st.loyalty >= 2, text: "雨上がりの足場で、彼はわたしの歩幅に合わせて速度を落とした。" },
    ],
  },

  {
    id: 3,
    title: "第3話:稜線の配分",
    unlockMin: 900,
    canShift: false,
    body:
`翌朝、稜線は薄い光で切り取られていた。
遠くに見えるのは荒れた城壁と、さらにその先の雪の峰。
息を整え、今日の分を歩く。

隊は二手に分かれる。偵察と補給。
誰をどこへ回すか。配分は感情で決められない。
帳簿の数字を見て、必要な方へ人を置く。
護衛は不満を言わない。ただ、主人の判断を「受け入れる」目をする。

昼、岩陰で休むとき、彼が水を差し出した。
指が触れそうで触れない距離。
わたしは受け取って、すぐ飲むべきか、少しだけからかうべきか迷う。`,
    choices: [
      { text: "すぐ受け取って飲む(信頼を示す)" },
      { text: "「毒じゃない?」と冗談めかす(距離を試す)" },
    ],
    diffs: [
      { when: (st)=> st.trust >= 5, text: "わたしが決める前に、彼は既に次の安全な足場を選んでいた。" },
      { when: (st)=> st.loyalty >= 3, text: "休憩のあいだ、彼は無言でわたしの背後を守った。" },
    ],
  },

  {
    id: 4,
    title: "第4話:暁の旗",
    unlockMin: 1200,
    canShift: true,
    body:
`夜明け前、空が青くほどける瞬間がある。
その色は「暁」と呼ぶには冷たくて、でも確かに希望だった。

谷の村は略奪で荒れていた。
わたしは帳簿を閉じ、村の人に聞く。
何が足りないか。誰が困っているか。今、何を優先するか。
護衛は後ろに立ち、剣の柄に手を添えるだけで脅しになる。

物資を配る。全員に満足はない。
それでも、最悪を避ける配分はできる。

戻り道、彼が言った。「怖くなかったか」
答える前に、少しだけ息を吸う。
強がるか、正直に言うか。`,
    choices: [
      { text: "「怖かった。でもやるしかなかった」と言う(正直)", shift: { trust: +1 } },
      { text: "「平気」と言う(強く見せる)", shift: {} },
    ],
    diffs: [
      { when: (st)=> st.trust >= 2, text: "彼は返事を聞いてから、短く「…了解」と言った。" },
      { when: (st)=> st.loyalty >= 3, text: "風が強い場所で、彼は自然にわたしの風上へ回った。" },
    ],
  },

  {
    id: 5,
    title: "第5話:未収の言葉",
    unlockMin: 1500,
    canShift: false,
    body:
`雪の手前の山域で、風が音を変えた。
きしむ木、遠い狼、冷たい星。
焚き火の前で、今日の学びを帳簿に写す。
数行のメモでも、積み上げれば地図になる。

護衛が隣に座る。いつもより近い。
彼はわたしの帳簿を見ず、炎だけを見ていた。
「お前は、なぜそこまで記録する」
声は静かで、答えを急がせない。

少し考える。
本当の理由を言うか、うまく言い換えるか。`,
    choices: [
      { text: "「進んだ証拠がほしい。自分を信じたい」と言う" },
      { text: "「癖みたいなもの」と軽く流す" },
    ],
    diffs: [
      { when: (st)=> st.trust >= 3, text: "彼は返事をしない。ただ、火に薪を足す手つきが丁寧だった。" },
      { when: (st)=> st.loyalty >= 4, text: "わたしが帳簿を閉じるまで、彼は席を立たなかった。" },
    ],
  },
];

// ====== グローバル状態 ======
let currentUser = null;
let state = null;

// ====== DOM要素 ======
const els = {
  // 認証関連
  authSection: document.getElementById("authSection"),
  appSection: document.getElementById("appSection"),
  loginForm: document.getElementById("loginForm"),
  signupForm: document.getElementById("signupForm"),
  loginEmail: document.getElementById("loginEmail"),
  loginPassword: document.getElementById("loginPassword"),
  signupEmail: document.getElementById("signupEmail"),
  signupPassword: document.getElementById("signupPassword"),
  loginBtn: document.getElementById("loginBtn"),
  signupBtn: document.getElementById("signupBtn"),
  showSignupBtn: document.getElementById("showSignupBtn"),
  showLoginBtn: document.getElementById("showLoginBtn"),
  logoutBtn: document.getElementById("logoutBtn"),
  userEmail: document.getElementById("userEmail"),
  authError: document.getElementById("authError"),
  
  // アプリ関連
  todayMin: document.getElementById("todayMin"),
  totalMin: document.getElementById("totalMin"),
  streak: document.getElementById("streak"),
  km: document.getElementById("km"),
  toNext: document.getElementById("toNext"),
  toNextStory: document.getElementById("toNextStory"),
  areaBadge: document.getElementById("areaBadge"),
  bar: document.getElementById("bar"),
  startBtn: document.getElementById("startBtn"),
  stopBtn: document.getElementById("stopBtn"),
  addBtn: document.getElementById("addBtn"),
  timerHint: document.getElementById("timerHint"),
  logList: document.getElementById("logList"),
  resetTodayBtn: document.getElementById("resetTodayBtn"),
  resetAllBtn: document.getElementById("resetAllBtn"),
  
  storyBadge: document.getElementById("storyBadge"),
  storyList: document.getElementById("storyList"),
  
  addDialog: document.getElementById("addDialog"),
  addHours: document.getElementById("addHours"),
  addMins: document.getElementById("addMins"),
  addMemo: document.getElementById("addMemo"),
  saveAddBtn: document.getElementById("saveAddBtn"),
  
  unlockDialog: document.getElementById("unlockDialog"),
  unlockText: document.getElementById("unlockText"),
  closeUnlockBtn: document.getElementById("closeUnlockBtn"),
  
  storyDialog: document.getElementById("storyDialog"),
  storyTitle: document.getElementById("storyTitle"),
  storyMeta: document.getElementById("storyMeta"),
  storyBody: document.getElementById("storyBody"),
  choiceBox: document.getElementById("choiceBox"),
  markReadBtn: document.getElementById("markReadBtn"),
  closeStoryBtn: document.getElementById("closeStoryBtn"),
};

// ====== 認証関連 ======
async function showError(message) {
  els.authError.textContent = message;
  els.authError.style.display = 'block';
  setTimeout(() => {
    els.authError.style.display = 'none';
  }, 3000);
}

async function handleLogin(e) {
  e.preventDefault();
  const email = els.loginEmail.value;
  const password = els.loginPassword.value;
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    showError(error.message);
  } else {
    currentUser = data.user;
    await loadUserData();
    showApp();
  }
}

async function handleSignup(e) {
  e.preventDefault();
  const email = els.signupEmail.value;
  const password = els.signupPassword.value;
  
  if (password.length < 6) {
    showError('パスワードは6文字以上にしてください');
    return;
  }
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (error) {
    showError(error.message);
  } else {
    showError('確認メールを送信しました。メールを確認してください。');
  }
}

async function handleLogout() {
  await supabase.auth.signOut();
  currentUser = null;
  state = null;
  showAuth();
}

function showAuth() {
  els.authSection.style.display = 'block';
  els.appSection.style.display = 'none';
  els.loginForm.style.display = 'block';
  els.signupForm.style.display = 'none';
}

function showApp() {
  els.authSection.style.display = 'none';
  els.appSection.style.display = 'block';
  els.userEmail.textContent = currentUser?.email || '';
  render(state);
}

els.loginBtn.addEventListener('click', handleLogin);
els.signupBtn.addEventListener('click', handleSignup);
els.logoutBtn.addEventListener('click', handleLogout);

els.showSignupBtn.addEventListener('click', (e) => {
  e.preventDefault();
  els.loginForm.style.display = 'none';
  els.signupForm.style.display = 'block';
});

els.showLoginBtn.addEventListener('click', (e) => {
  e.preventDefault();
  els.signupForm.style.display = 'none';
  els.loginForm.style.display = 'block';
});

// ====== Supabaseデータ同期 ======
async function loadUserData() {
  const { data, error } = await supabase
    .from('user_data')
    .select('*')
    .eq('user_id', currentUser.id)
    .single();
  
  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
    console.error('Error loading data:', error);
    state = defaultState();
  } else if (data) {
    state = data.state_data;
  } else {
    state = defaultState();
    await saveUserData();
  }
}

async function saveUserData() {
  if (!currentUser) return;
  
  const { error } = await supabase
    .from('user_data')
    .upsert({
      user_id: currentUser.id,
      state_data: state,
      updated_at: new Date().toISOString(),
    });
  
  if (error) {
    console.error('Error saving data:', error);
  }
}

// ====== ヘルパー関数 ======
function defaultState() {
  return {
    sessions: [],
    streak: 0,
    timer: { running: false, startTs: null },
    trust: 0,
    loyalty: 0,
    awareness: 0,
    readStories: {},
    storyChoices: {},
  };
}

function todayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function nowTimeStr() {
  const d = new Date();
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

function sumMinutes(state, dateFilter = null) {
  let total = 0;
  for (const s of state.sessions) {
    if (!dateFilter || s.date === dateFilter) {
      total += s.minutes;
    }
  }
  return total;
}

function formatHM(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}分`;
  if (m === 0) return `${h}時間`;
  return `${h}時間${m}分`;
}

function hmToMinutes(h, m) {
  return (h || 0) * 60 + (m || 0);
}

function computeArea(totalMin) {
  const idx = Math.floor(totalMin / AREA_STEP_MIN) + 1;
  const safeIdx = Math.min(idx, AREAS.length);
  const area = AREAS[safeIdx - 1];
  const inArea = totalMin % AREA_STEP_MIN;
  const ratio = inArea / AREA_STEP_MIN;
  const toNext = AREA_STEP_MIN - inArea;
  return { idx: safeIdx, ratio, toNext, area };
}

function unlockedStories(totalMin) {
  return STORIES.filter(s => totalMin >= s.unlockMin);
}

function nextStoryInfo(totalMin) {
  const next = STORIES.find(s => totalMin < s.unlockMin);
  if (!next) return { toNext: 0 };
  return { toNext: next.unlockMin - totalMin };
}

function updateStreak(state, date) {
  const sorted = [...new Set(state.sessions.map(s => s.date))].sort();
  if (sorted.length === 0) {
    state.streak = 0;
    return;
  }
  
  let streak = 1;
  for (let i = sorted.length - 1; i > 0; i--) {
    const curr = new Date(sorted[i]);
    const prev = new Date(sorted[i - 1]);
    const diffDays = Math.floor((curr - prev) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }
  state.streak = streak;
}

function renderTabs() {
  const tabs = document.querySelectorAll(".tab");
  const panels = document.querySelectorAll(".tabPanel");
  
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      
      const target = tab.dataset.tab;
      panels.forEach(p => {
        if (p.id === `tab-${target}`) {
          p.classList.remove("hidden");
        } else {
          p.classList.add("hidden");
        }
      });
    });
  });
}

function renderLogs(state) {
  const tKey = todayKey();
  const todaySessions = state.sessions.filter(s => s.date === tKey).reverse();
  
  els.logList.innerHTML = "";
  
  if (todaySessions.length === 0) {
    els.logList.innerHTML = '<div style="color:var(--muted);font-size:12px;">まだ記録がありません</div>';
    return;
  }
  
  for (const s of todaySessions) {
    const item = document.createElement("div");
    item.className = "logItem";
    
    const left = document.createElement("div");
    left.className = "logLeft";
    
    const m = document.createElement("div");
    m.className = "logMin";
    m.textContent = formatHM(s.minutes);
    
    const memo = document.createElement("div");
    memo.className = "logMemo";
    memo.textContent = s.memo ? s.memo : "(メモなし)";
    
    left.appendChild(m);
    left.appendChild(memo);
    
    const time = document.createElement("div");
    time.className = "logTime";
    time.textContent = s.time;
    
    item.appendChild(left);
    item.appendChild(time);
    els.logList.appendChild(item);
  }
}

function renderStories(state, totalMin) {
  const unlocked = unlockedStories(totalMin);
  const unlockedCount = unlocked.length;
  
  const readCount = unlocked.filter(s => state.readStories[String(s.id)]).length;
  els.storyBadge.textContent = `Unlocked ${unlockedCount} / Read ${readCount}`;
  
  els.storyList.innerHTML = "";
  
  for (const s of STORIES) {
    const isUnlocked = totalMin >= s.unlockMin;
    const isRead = !!state.readStories[String(s.id)];
    
    const item = document.createElement("div");
    item.className = "storyItem";
    
    const left = document.createElement("div");
    left.className = "storyLeft";
    
    const name = document.createElement("div");
    name.className = "storyName";
    name.textContent = s.title;
    
    const req = document.createElement("div");
    req.className = "storyReq";
    req.textContent = `解放条件:累計 ${formatHM(s.unlockMin)}`;
    
    left.appendChild(name);
    left.appendChild(req);
    
    const pill = document.createElement("div");
    pill.className = "pill";
    
    if (!isUnlocked) {
      pill.classList.add("lock");
      pill.textContent = "Locked";
    } else if (isRead) {
      pill.classList.add("read");
      pill.textContent = "Read";
    } else {
      pill.classList.add("ok");
      pill.textContent = "Open";
    }
    
    item.appendChild(left);
    item.appendChild(pill);
    
    if (isUnlocked) {
      item.style.cursor = "pointer";
      item.addEventListener("click", () => openStory(state, s, totalMin));
    } else {
      item.style.opacity = "0.75";
    }
    
    els.storyList.appendChild(item);
  }
}

let currentStoryId = null;

function openStory(state, story, totalMin) {
  currentStoryId = story.id;
  
  let text = story.body;
  
  if (Array.isArray(story.diffs)) {
    const hit = story.diffs.find(d => typeof d.when === "function" && d.when(state));
    if (hit && hit.text) text += "\n\n" + hit.text;
  }
  
  els.storyTitle.textContent = story.title;
  els.storyMeta.textContent = `累計 ${formatHM(totalMin)} / T${state.trust} L${state.loyalty} A${state.awareness}`;
  els.storyBody.textContent = text;
  
  const isRead = !!state.readStories[String(story.id)];
  els.markReadBtn.textContent = isRead ? "読了を解除" : "読了にする";
  
  els.choiceBox.innerHTML = "";
  if (Array.isArray(story.choices) && story.choices.length > 0) {
    const picked = state.storyChoices[String(story.id)];
    const note = document.createElement("div");
    note.className = "choiceNote";
    note.textContent = (picked == null)
      ? "選択肢:ひとつ選ぶ(あとで変えられない)"
      : "選択済み(変更不可)";
    els.choiceBox.appendChild(note);
    
    story.choices.forEach((c, idx) => {
      const btn = document.createElement("button");
      btn.className = "choiceBtn";
      btn.type = "button";
      btn.textContent = c.text;
      
      if (picked != null) {
        btn.disabled = true;
        if (picked === idx) btn.textContent = "✓ " + btn.textContent;
      } else {
        btn.addEventListener("click", () => applyChoice(state, story, idx));
      }
      els.choiceBox.appendChild(btn);
    });
  }
  
  els.storyDialog.showModal();
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

async function applyChoice(state, story, choiceIndex) {
  const key = String(story.id);
  if (state.storyChoices[key] != null) return;
  
  state.storyChoices[key] = choiceIndex;
  
  const canShift = story.canShift === true;
  
  if (canShift) {
    const choice = story.choices?.[choiceIndex];
    
    if (choice && choice.shift) {
      if (choice.shift.trust) state.trust += choice.shift.trust;
      if (choice.shift.loyalty) state.loyalty += choice.shift.loyalty;
      if (choice.shift.awareness) state.awareness += choice.shift.awareness;
    }
  }
  
  state.trust = clamp(state.trust, 0, 999);
  state.loyalty = clamp(state.loyalty, 0, 999);
  state.awareness = clamp(state.awareness, 0, 999);
  
  await saveUserData();
  
  const totalMin = sumMinutes(state);
  openStory(state, story, totalMin);
  render(state);
}

function render(state) {
  if (!state) return;
  
  const tKey = todayKey();
  const todayMin = sumMinutes(state, tKey);
  const totalMin = sumMinutes(state);
  
  els.todayMin.textContent = formatHM(todayMin);
  els.totalMin.textContent = formatHM(totalMin);
  els.streak.textContent = state.streak;
  
  const totalKm = totalMin * KM_PER_MIN;
  els.km.textContent = totalKm.toFixed(1);
  
  const { idx, ratio, toNext, area } = computeArea(totalMin);
  els.areaBadge.textContent = area.name;
  
  els.toNext.textContent = formatHM(toNext);
  
  const ns = nextStoryInfo(totalMin);
  els.toNextStory.textContent = formatHM(ns.toNext);
  
  els.bar.style.width = `${Math.max(0, Math.min(100, ratio * 100))}%`;
  
  renderLogs(state);
  renderStories(state, totalMin);
  
  if (state.timer.running && state.timer.startTs) {
    els.timerHint.textContent = "計測中…";
    els.startBtn.disabled = true;
    els.stopBtn.disabled = false;
  } else {
    els.timerHint.textContent = "未計測";
    els.startBtn.disabled = false;
    els.stopBtn.disabled = true;
  }
}

async function addSession(state, minutes, memo) {
  const date = todayKey();
  const time = nowTimeStr();
  
  const totalBefore = sumMinutes(state);
  const unlockedBefore = unlockedStories(totalBefore).length;
  
  state.sessions.push({ date, minutes, memo: memo || "", time });
  updateStreak(state, date);
  
  const totalAfter = sumMinutes(state);
  const unlockedAfter = unlockedStories(totalAfter).length;
  
  await saveUserData();
  render(state);
  
  const beforeArea = computeArea(totalBefore).idx;
  const afterArea = computeArea(totalAfter).idx;
  if (afterArea > beforeArea) {
    els.unlockText.textContent = `Area ${afterArea} が解放されました。`;
    els.unlockDialog.showModal();
  }
  
  if (unlockedAfter > unlockedBefore) {
    const newly = STORIES[unlockedAfter - 1];
    els.unlockText.textContent = `ストーリー解放:${newly.title}`;
    els.unlockDialog.showModal();
  }
}

function msToMinutes(ms) {
  return Math.max(1, Math.round(ms / 60000));
}

// ====== 初期化 ======
supabase.auth.onAuthStateChange(async (event, session) => {
  if (session) {
    currentUser = session.user;
    await loadUserData();
    showApp();
  } else {
    showAuth();
  }
});

// 起動時のチェック
(async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    currentUser = session.user;
    await loadUserData();
    showApp();
  } else {
    showAuth();
  }
  
  renderTabs();
})();

// ====== イベントリスナー ======
els.startBtn.addEventListener("click", async () => {
  state.timer.running = true;
  state.timer.startTs = Date.now();
  await saveUserData();
  render(state);
});

els.stopBtn.addEventListener("click", async () => {
  if (!state.timer.running || !state.timer.startTs) return;
  
  const elapsedMs = Date.now() - state.timer.startTs;
  const minutes = msToMinutes(elapsedMs);
  
  state.timer.running = false;
  state.timer.startTs = null;
  
  await saveUserData();
  render(state);
  
  await addSession(state, minutes, "(タイマー計測)");
});

els.addBtn.addEventListener("click", () => {
  els.addHours.value = "";
  els.addMins.value = "";
  els.addMemo.value = "";
  els.addDialog.showModal();
});

els.saveAddBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  
  const h = Number(els.addHours.value);
  const m = Number(els.addMins.value);
  const minutes = hmToMinutes(h, m);
  
  if (!Number.isFinite(minutes) || minutes <= 0) {
    els.addHours.focus();
    return;
  }
  if (m > 59) {
    els.addMins.focus();
    return;
  }
  
  const memo = els.addMemo.value.trim();
  els.addDialog.close();
  await addSession(state, minutes, memo);
});

els.closeUnlockBtn.addEventListener("click", () => {
  els.unlockDialog.close();
});

els.closeStoryBtn.addEventListener("click", () => {
  els.storyDialog.close();
});

els.markReadBtn.addEventListener("click", async () => {
  if (currentStoryId == null) return;
  const key = String(currentStoryId);
  state.readStories[key] = !state.readStories[key];
  await saveUserData();
  render(state);
  els.markReadBtn.textContent = state.readStories[key] ? "読了を解除" : "読了にする";
});

els.resetTodayBtn.addEventListener("click", async () => {
  const tKey = todayKey();
  state.sessions = state.sessions.filter(s => s.date !== tKey);
  await saveUserData();
  render(state);
});

els.resetAllBtn.addEventListener("click", async () => {
  state = defaultState();
  await saveUserData();
  render(state);
});
