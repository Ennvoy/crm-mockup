// PROTOTYPE fake data layer — build 時換成真 API
// 55688 隊員 CRM 互動原型共用層：seed 假資料（localStorage 持久化）＋互動 helper
// 零依賴：vanilla JS，file:// 直接開

(function () {
  'use strict';

  var STORE_KEY = 'crm55688_proto_v12';

  /* 活動參加名單生成（deterministic；每活動 40 筆示意，前 3 筆為完整 Profile 假資料隊員） */
  function buildParticipants() {
    var SURNAMES = ['王', '林', '張', '李', '陳', '黃', '吳', '劉', '蔡', '楊'];
    var GIVEN = ['志明', '淑惠', '建宏', '雅婷', '俊傑', '美玲', '文雄', '麗華', '家豪', '怡君'];
    var IDS = ['小黃', '小黃', '多元', '小黃', '試跑'];
    function gen(actKey, n) {
      var seedFixed = [
        { code: '123456', name: '陳大明', identity: '小黃', before: 5.2, after: 7.8 },
        { code: '0103', name: '林志偉', identity: '多元', before: 3.1, after: 4.6 },
        { code: '0217', name: '張淑芬', identity: '試跑', before: 1.2, after: 1.9 }
      ];
      var list = seedFixed.slice();
      for (var i = 0; i < n - 3; i++) {
        var s = actKey * 1000 + i;
        var r = function (k) { var x = Math.sin((s + k) * 12.9898) * 43758.5453; return x - Math.floor(x); };
        var before = Math.round(r(1) * 60 + 5) / 10;             // 0.5~6.5
        var delta = Math.round((r(2) - 0.35) * 50) / 10;          // -1.7~+3.2（多數進步）
        list.push({
          code: String(1000 + Math.floor(r(3) * 8999)),
          name: SURNAMES[Math.floor(r(4) * 10)] + GIVEN[Math.floor(r(5) * 10)],
          identity: IDS[Math.floor(r(6) * 5)],
          before: before, after: Math.max(0, Math.round((before + delta) * 10) / 10)
        });
      }
      return list;
    }
    return { 'ACT-2026-07A': gen(1, 40), 'ACT-2026-07B': gen(2, 40), 'ACT-2026-06C': gen(3, 40) };
  }

  /* ────────────────────────────────────────────────
   * Seed 假資料（貼近真實量級：參考 Tableau 截圖數字）
   * ──────────────────────────────────────────────── */
  function buildSeed() {
    // 車隊（branch）→車隊地區對照（REQ-SET-007；「台北」＝雙北。初始清單依主管提供之分公司對照表，正式清單隨匯入更新）
    var branchRegions = {
      '台北': ['台北分公司', '台北志英', '志英車隊', '小黃耐斯都會', '耐斯都會車隊', '幸福車隊', '泛亞北區', '城市衛星北區', '城市衛星保留', '賓樂車隊', '祥賀車隊', '慶安車隊', '龍星北區', '聯合車隊', '警光北區', '台北多元試跑', '多元台北', '多元台北生通', '多元台北宏力', '多元台北保底', '多元慶安'],
      '桃園': ['大文山車隊', '桃園分公司', '泛亞桃園', '多元桃園'],
      '宜蘭': ['宜蘭分公司', '多元宜蘭']
    };
    return {
      meta: {
        dataAsOf: '2026-07-06',        // 資料截至（昨日）
        importedAt: '2026-07-07 06:30',
        staleDays: 0                   // 超過 2 天顯示過期警示（demo 可切）
      },
      branchRegions: branchRegions,
      // 承接任務分布（本月 by 行政區；city → districts）
      distribution: {
        '台北市': [
          { d: '信義區', tasks: 42180, accepted: 31432 },
          { d: '大安區', tasks: 39860, accepted: 30110 },
          { d: '中山區', tasks: 37210, accepted: 27155 },
          { d: '內湖區', tasks: 28934, accepted: 20551 },
          { d: '南港區', tasks: 18211, accepted: 12874 },
          { d: '松山區', tasks: 24870, accepted: 18140 }
        ],
        '新北市': [
          { d: '板橋區', tasks: 33420, accepted: 23110 },
          { d: '中和區', tasks: 26108, accepted: 17795 },
          { d: '永和區', tasks: 19883, accepted: 13472 },
          { d: '新店區', tasks: 17651, accepted: 11982 },
          { d: '三重區', tasks: 21467, accepted: 14322 },
          { d: '新莊區', tasks: 20894, accepted: 14075 }
        ]
      },
      // 進行中活動（總覽只顯示進行中）
      activities: [
        {
          id: 'ACT-2026-07A', name: '7月早尖峰衝刺獎勵', type: '早尖峰',
          start: '2026-07-01', end: '2026-07-31',
          signup: 1284, cost: 386200, extraTasks: 8214, cumTasks: 24310,
          baseline: { b0: 212, b1: 486, b2: 391, b3: 195 },   // 活動前日均完成級距：0 / 1~3 / 4~6 / 7+
          current:  { b0: 128, b1: 402, b2: 484, b3: 270 }    // 活動迄今
        },
        {
          id: 'ACT-2026-07B', name: '雙北晚尖峰加碼', type: '晚尖峰',
          start: '2026-06-15', end: '2026-07-15',
          signup: 962, cost: 274800, extraTasks: 5931, cumTasks: 18752,
          baseline: { b0: 158, b1: 371, b2: 293, b3: 140 },
          current:  { b0: 94,  b1: 318, b2: 355, b3: 195 }
        },
        {
          id: 'ACT-2026-06C', name: '寵物車組招募月', type: '車組招募',
          start: '2026-06-01', end: '2026-07-20',
          signup: 317, cost: 95400, extraTasks: 1268, cumTasks: 4108,
          baseline: { b0: 61, b1: 122, b2: 89, b3: 45 },
          current:  { b0: 40, b1: 109, b2: 108, b3: 60 }
        }
      ],
      // 總覽「關鍵指標」排卡：預設＝隊員運力六卡；其餘指標（有承接數等）由指標池「新增指標卡」加入
      // 每卡 d7/d30＝主數字與 7／30 天前之差（REQ-OV-011）；運力卡主數字＝b1+b2+b3（0 天 b0 不計入，REQ-OV-003）
      keyCards: [
        { id: 'k1', kind: 'simple', label: '全台隊員總數', value: 21847, d7: 38, d30: 156, note: '正式隊員',
          info: '最新一次隊員主檔匯入之正式隊員數（車發最新數據；退隊者由名冊全量比對自動排除）' },
        { id: 'k2', kind: 'simple', label: '雙北地區隊員數', value: 9326, d7: 12, d30: -61,
          note: '包含車隊：' + branchRegions['台北'].join('、'),
          info: '所屬車隊之車隊地區＝台北（雙北）的正式隊員數。包含車隊：' + branchRegions['台北'].join('、') + '（車隊→地區對照可於系統設定維護）' },
        { id: 'k3', kind: 'buckets', label: '全台・早尖峰可用運力', b0: 14192, b1: 1204, b2: 2861, b3: 3590, d7: 85, d30: -142, note: '上個月的上線天數',
          info: '上個月早尖峰（07:00–08:59）有上線（≥1 天）之隊員數＝1~10／11~20／21 天以上三桶加總；0 天＝上個月未上線之正式隊員，列示供參考、不計入主數字；級距切點後台可調' },
        { id: 'k4', kind: 'buckets', label: '全台・晚尖峰可用運力', b0: 13525, b1: 1436, b2: 3012, b3: 3874, d7: 47, d30: 203, note: '上個月的上線天數',
          info: '上個月晚尖峰（17:00–18:59）有上線（≥1 天）之隊員數＝1~10／11~20／21 天以上三桶加總；0 天＝上個月未上線之正式隊員，列示供參考、不計入主數字；級距切點後台可調' },
        { id: 'k5', kind: 'buckets', label: '雙北・早尖峰可用運力', b0: 5844, b1: 543, b2: 1288, b3: 1651, d7: 36, d30: -58, note: '上個月的上線天數',
          info: '雙北（車隊地區＝台北）隊員上個月早尖峰有上線（≥1 天）之人數＝三桶加總；0 天列示供參考、不計入主數字；級距切點後台可調' },
        { id: 'k6', kind: 'buckets', label: '雙北・晚尖峰可用運力', b0: 5504, b1: 647, b2: 1395, b3: 1780, d7: -21, d30: 94, note: '上個月的上線天數',
          info: '雙北（車隊地區＝台北）隊員上個月晚尖峰有上線（≥1 天）之人數＝三桶加總；0 天列示供參考、不計入主數字；級距切點後台可調' }
      ],
      // 有承接隊員數之指標模板（新增指標卡選「有承接隊員數」時取用）
      // 週視角級距＝該週承接天數 1~2/3~4/5+；月視角級距＝該月承接天數 1~10/11~20/21+（口徑不同、數據不同）
      acceptTemplates: {
        '全台|早尖峰': {
          weeklyBuckets: { b1: 1732, b2: 1268, b3: 894 }, monthlyBuckets: { b1: 6820, b2: 5261, b3: 3153 },
          weekly: [3510, 3622, 3585, 3701, 3894, 3760, 3894], monthly: [13870, 14211, 14405, 14782, 15012, 15234] },
        '全台|晚尖峰': {
          weeklyBuckets: { b1: 1985, b2: 1547, b3: 1103 }, monthlyBuckets: { b1: 7912, b2: 6205, b3: 3906 },
          weekly: [4212, 4385, 4290, 4467, 4521, 4390, 4635], monthly: [16210, 16873, 17102, 17554, 17891, 18023] },
        '雙北|早尖峰': {
          weeklyBuckets: { b1: 742, b2: 583, b3: 411 }, monthlyBuckets: { b1: 2951, b2: 2280, b3: 1387 },
          weekly: [1544, 1602, 1571, 1655, 1736, 1690, 1736], monthly: [6021, 6178, 6244, 6410, 6532, 6618] },
        '雙北|晚尖峰': {
          weeklyBuckets: { b1: 903, b2: 688, b3: 494 }, monthlyBuckets: { b1: 3517, b2: 2748, b3: 1695 },
          weekly: [1892, 1955, 1921, 2010, 2064, 2018, 2085], monthly: [7284, 7452, 7539, 7724, 7861, 7960] }
      },
      // 隊員 Profile 假資料（REQ-PROF-002：11 維度；依協理 image4 範例，去除評分/優良標章）
      members: {
        '123456': {
          code: '123456', name: '陳大明', identity: '小黃', region: '台北市', branch: '台北分公司', carModel: 'RAV4',
          fleetGroups: ['好孕車組', '敬老愛心_台北', '提供刷卡付款', '提供悠遊卡付款', '開行李箱', '一般預約'],
          onlineDays: { month: 26, quarter: 78, year: 301 }, evePeakDays: 18, mornPeakDays: 16,
          acceptRate: 32, joinedActivity: true, activityTypes: ['獎勵活動', '培訓課程'],
          monthlyTasks: 156, monthlyIncome: 48600, topDistricts: ['信義區', '南港區', '內湖區'],
          refuseReasons: ['低價', '距離遠', '目的地不符'],
          taskTrend: { weekly: [34, 38, 36, 41, 39, 42, 40], monthly: [148, 152, 149, 158, 161, 156], quarterly: [438, 455, 471, 462] },
          incomeTrend: { monthly: [45200, 46800, 45900, 49100, 50200, 48600] },
          contacts: [
            { date: '2026-06-18 14:22', project: '6月晚尖峰意願調查', content: '意願：參加；不願承接原因：低價、距離遠', result: '參加' },
            { date: '2026-04-09 10:05', project: '4月獎勵活動邀約', content: '簡訊通知：是；意願：參加', result: '參加' },
            { date: '2026-01-22 16:40', project: '1月流失預警關懷', content: '第一次電訪未接聽；第二次接聽，反映目的地不符', result: '不參加' }
          ]
        },
        '0103': {
          code: '0103', name: '林志偉', identity: '多元', region: '新北市', branch: '多元台北', carModel: 'Tesla',
          fleetGroups: ['提供綁定付款', '敬老愛心_新北', '低底盤車', '送餐車組'],
          onlineDays: { month: 18, quarter: 51, year: 194 }, evePeakDays: 12, mornPeakDays: 8,
          acceptRate: 21, joinedActivity: true, activityTypes: ['獎勵活動'],
          monthlyTasks: 98, monthlyIncome: 31400, topDistricts: ['板橋區', '中和區', '三重區'],
          refuseReasons: ['低價'],
          taskTrend: { weekly: [20, 22, 21, 25, 24, 26, 23], monthly: [88, 92, 95, 90, 101, 98], quarterly: [265, 278, 289, 284] },
          incomeTrend: { monthly: [28900, 29800, 30500, 29400, 32100, 31400] },
          contacts: [
            { date: '2026-05-30 11:15', project: '6月晚尖峰意願調查', content: '意願：參加', result: '參加' }
          ]
        },
        '0217': {
          code: '0217', name: '張淑芬', identity: '試跑', region: '台北市', branch: '台北多元試跑', carModel: '商務型', fleetGroups: ['預設'],
          onlineDays: { month: 9, quarter: 22, year: 61 }, evePeakDays: 4, mornPeakDays: 6,
          acceptRate: 8, joinedActivity: false, activityTypes: [],
          monthlyTasks: 41, monthlyIncome: 12800, topDistricts: ['大安區', '中山區', '松山區'],
          refuseReasons: [],
          taskTrend: { weekly: [8, 10, 9, 11, 12, 10, 11], monthly: [32, 35, 38, 40, 43, 41], quarterly: [98, 105, 112, 119] },
          incomeTrend: { monthly: [9800, 10500, 11400, 12100, 13000, 12800] },
          contacts: []
        }
      },
      // 活動參加名單（活動 id → 參加者含前後差異；正式版為全量分頁查詢，原型每活動 40 筆示意）
      activityParticipants: buildParticipants(),
      // 指標池（REQ-OV-005：從池中挑選組卡）
      metricPool: [
        { key: 'acceptedMembers', name: '有承接隊員數', dims: ['地區', '尖峰時段', '承接天數級距'] },
        { key: 'acceptRate', name: '總覽承接率', dims: ['地區', '尖峰時段'] },
        { key: 'completedTasks', name: '完成任務數', dims: ['地區', '尖峰時段'] },
        { key: 'onlineMembers', name: '上線隊員數', dims: ['地區', '尖峰時段', '上線天數級距'] },
        { key: 'dailyAvgCompleted', name: '日均完成數', dims: ['地區', '級距'] },
        { key: 'revenue', name: '營業額', dims: ['地區', '尖峰時段'] }
      ]
    };
  }

  /* ── localStorage 持久化 ── */
  function load() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* 壞資料回 seed */ }
    var s = buildSeed();
    save(s);
    return s;
  }
  function save(data) { localStorage.setItem(STORE_KEY, JSON.stringify(data)); }
  function reset() { localStorage.removeItem(STORE_KEY); location.reload(); }

  /* ── 工具 ── */
  function fmt(n) {
    if (n === null || n === undefined) return '–';
    return Number(n).toLocaleString('zh-TW');
  }
  function pct(n) { return (n === null || n === undefined) ? '–' : (Math.round(n * 10) / 10) + '%'; }

  /* 姓名去識別化（REQ-PROF-007：各清單/報表預設遮罩——陳大明→陳○明、王明→王○；具權限者見全名） */
  function maskName(n) {
    n = String(n || '');
    if (n.length <= 1) return n;
    if (n.length === 2) return n.charAt(0) + '○';
    return n.charAt(0) + new Array(n.length - 1).join('○') + n.charAt(n.length - 1);
  }

  /* ── Toast（提示未完成頁面等） ── */
  function toast(msg) {
    var t = document.createElement('div');
    t.setAttribute('role', 'status');
    t.style.cssText = 'position:fixed;left:50%;bottom:88px;transform:translateX(-50%);background:var(--fg);color:var(--surface);padding:10px 20px;border-radius:12px;font-size:14px;z-index:9999;box-shadow:rgba(0,0,0,.15) 0 4px 24px;opacity:0;transition:opacity .2s';
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(function () { t.style.opacity = '1'; });
    setTimeout(function () { t.style.opacity = '0'; setTimeout(function () { t.remove(); }, 250); }, 2600);
  }

  /* ── 原型狀態切換器（每頁右下角固定；REQ 異常路徑可視化） ── */
  var VIEW_STATES = [
    { key: 'normal', label: '正常' },
    { key: 'empty', label: '空狀態' },
    { key: 'loading', label: '載入中' },
    { key: 'error', label: '錯誤' },
    { key: 'forbidden', label: '權限不足' }
  ];
  function mountStateSwitcher(onChange) {
    var wrap = document.createElement('div');
    wrap.style.cssText = 'position:fixed;right:16px;bottom:16px;z-index:9000;background:var(--surface);border:1px solid var(--border-soft);border-radius:12px;box-shadow:rgba(0,0,0,.08) 0 4px 24px;padding:8px;display:flex;gap:4px;align-items:center;font-size:12px';
    var tag = document.createElement('span');
    tag.textContent = '原型狀態';
    tag.style.cssText = 'color:var(--meta);padding:0 6px';
    wrap.appendChild(tag);
    VIEW_STATES.forEach(function (s) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = s.label;
      b.dataset.state = s.key;
      b.style.cssText = 'padding:5px 10px;border-radius:8px;border:none;background:transparent;color:var(--muted);cursor:pointer;font-size:12px;min-height:28px';
      b.addEventListener('click', function () {
        wrap.querySelectorAll('button').forEach(function (x) { x.style.background = 'transparent'; x.style.color = 'var(--muted)'; x.setAttribute('aria-pressed', 'false'); });
        b.style.background = 'var(--fg)'; b.style.color = 'var(--surface)';
        b.setAttribute('aria-pressed', 'true');
        onChange(s.key);
      });
      if (s.key === 'normal') { b.style.background = 'var(--fg)'; b.style.color = 'var(--surface)'; b.setAttribute('aria-pressed', 'true'); }
      wrap.appendChild(b);
    });
    var rst = document.createElement('button');
    rst.type = 'button';
    rst.textContent = '重置假資料';
    rst.style.cssText = 'margin-left:6px;padding:5px 10px;border-radius:8px;border:1px solid var(--border-soft);background:var(--surface-warm);color:var(--fg-2);cursor:pointer;font-size:12px;min-height:28px';
    rst.addEventListener('click', reset);
    wrap.appendChild(rst);
    document.body.appendChild(wrap);
  }

  /* ── 口徑說明 tooltip（REQ-GEN-002：info icon hover 顯示，不佔排版） ── */
  function infoIcon(text) {
    return '<span class="crm-info" tabindex="0" role="note" aria-label="' + text.replace(/"/g, '&quot;') + '">' +
      '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M12 16v-5M12 8h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' +
      '<span class="crm-info-tip">' + text + '</span></span>';
  }

  /* ── 共用導覽列 ── */
  var NAV_ITEMS = [
    { key: 'overview', label: '總覽', href: 'overview.html', ready: true },
    { key: 'peak', label: '尖峰完成數', href: 'peak.html', ready: true },
    { key: 'capacity', label: '運力查詢', href: '#', ready: false },  // 含子分頁：承接任務的分布／上線時段分布／車組／車款
    { key: 'profile', label: '隊員 Profile', href: 'profile.html', ready: true },
    { key: 'activity', label: '隊員活動', href: '#', ready: false },
    { key: 'callcenter', label: '客服紀錄', href: '#', ready: false },
    { key: 'import', label: '資料匯入', href: '#', ready: false },
    { key: 'settings', label: '系統設定', href: '#', ready: false }
  ];
  function mountNav(activeKey, dataAsOf) {
    var nav = document.getElementById('crm-nav');
    if (!nav) return;
    // 共用響應式修正（手機不破版）＋字級/字重偏好（REQ：大/中/小、細/適中/粗）
    if (!document.getElementById('crm-nav-fix')) {
      var st = document.createElement('style');
      st.id = 'crm-nav-fix';
      st.textContent =
        'html,body{overflow-x:clip}' +
        '.nav-links{min-width:0;-webkit-overflow-scrolling:touch}' +
        /* 字級（body zoom）與字重（內文繼承權重）偏好 */
        'html[data-fs="sm"] body{zoom:.88}html[data-fs="lg"] body{zoom:1.15}' +
        'html[data-fw="light"] body{font-weight:300}html[data-fw="bold"] body{font-weight:500}' +
        '.pref-btn{border:1px solid var(--border-soft);background:var(--surface);border-radius:8px;padding:5px 10px;font-size:13.5px;color:var(--fg-2);cursor:pointer;min-height:32px;font-family:inherit}' +
        '.pref-btn:hover{background:var(--surface-warm)}' +
        '.pref-pop{position:absolute;top:calc(100% + 8px);right:0;background:var(--surface);border:1px solid var(--border-soft);border-radius:12px;box-shadow:rgba(0,0,0,.12) 0 8px 32px;padding:14px;z-index:600;width:230px;display:none}' +
        '.pref-pop.show{display:block}' +
        '.pref-row{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:6px 0}' +
        '.pref-row .pl{font-size:13px;color:var(--muted)}' +
        '.pref-seg{display:inline-flex;background:var(--surface-warm);border-radius:9999px;padding:2px}' +
        '.pref-seg button{border:none;background:transparent;padding:4px 11px;border-radius:9999px;font-size:12.5px;color:var(--muted);cursor:pointer;min-height:26px;font-family:inherit}' +
        '.pref-seg button[aria-pressed="true"]{background:var(--surface);color:var(--fg);box-shadow:0 0 0 1px var(--border-soft)}' +
        '@media(max-width:768px){' +
          '.nav-user{display:none}.brand-title{display:none}' +
          '.data-chip{font-size:11px;padding:3px 8px;white-space:nowrap}' +
          '.nav-inner{padding:0 12px;gap:10px}' +
          '.crm-info-tip{max-width:180px}' +
          '.page{padding-left:14px;padding-right:14px}' +
        '}';
      document.head.appendChild(st);
    }
    var html = '<div class="nav-inner">' +
      '<div class="nav-brand"><span class="brand-badge">55688</span><span class="brand-title">隊員 CRM</span></div>' +
      '<div class="nav-links" role="navigation" aria-label="主選單">';
    NAV_ITEMS.forEach(function (it) {
      var cls = 'nav-link' + (it.key === activeKey ? ' active' : '') + (it.ready ? '' : ' pending');
      html += '<a class="' + cls + '" href="' + it.href + '" data-ready="' + it.ready + '" ' +
        (it.key === activeKey ? 'aria-current="page"' : '') + '>' + it.label + '</a>';
    });
    html += '</div>' +
      '<div class="nav-meta" style="position:relative">' +
      '<button class="pref-btn" id="pref-toggle" type="button" aria-haspopup="true" aria-expanded="false" title="顯示設定（字級／字重）">Aa</button>' +
      '<div class="pref-pop" id="pref-pop" role="menu" aria-label="顯示設定">' +
        '<div class="pref-row"><span class="pl">字型大小</span><span class="pref-seg" data-pref="fs">' +
          '<button type="button" data-v="sm">小</button><button type="button" data-v="md">中</button><button type="button" data-v="lg">大</button></span></div>' +
        '<div class="pref-row"><span class="pl">字體粗細</span><span class="pref-seg" data-pref="fw">' +
          '<button type="button" data-v="light">細</button><button type="button" data-v="md">適中</button><button type="button" data-v="bold">粗</button></span></div>' +
      '</div>' +
      '<span class="data-chip" title="最後成功匯入時間">資料截至 ' + dataAsOf + '</span>' +
      '<span class="nav-user">王營管</span></div></div>';
    nav.innerHTML = html;
    nav.querySelectorAll('a.pending').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        toast('此頁面將於下一批原型提供（本批交付：總覽）');
      });
    });
    initPrefs(nav);
  }

  /* ── 顯示偏好：字級 大/中/小、字重 細/適中/粗（localStorage 持久、全站生效） ── */
  var PREF_KEY = 'crm55688_prefs';
  function loadPrefs() {
    try { return JSON.parse(localStorage.getItem(PREF_KEY)) || { fs: 'md', fw: 'md' }; }
    catch (e) { return { fs: 'md', fw: 'md' }; }
  }
  function applyPrefs(p) {
    document.documentElement.dataset.fs = p.fs;
    document.documentElement.dataset.fw = p.fw;
  }
  function initPrefs(nav) {
    var prefs = loadPrefs();
    applyPrefs(prefs);
    var pop = nav.querySelector('#pref-pop');
    var btn = nav.querySelector('#pref-toggle');
    function paint() {
      nav.querySelectorAll('.pref-seg').forEach(function (seg) {
        var key = seg.dataset.pref;
        seg.querySelectorAll('button').forEach(function (b) {
          b.setAttribute('aria-pressed', String(prefs[key] === b.dataset.v));
        });
      });
    }
    paint();
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var show = !pop.classList.contains('show');
      pop.classList.toggle('show', show);
      btn.setAttribute('aria-expanded', String(show));
    });
    document.addEventListener('click', function (e) {
      if (!pop.contains(e.target) && e.target !== btn) { pop.classList.remove('show'); btn.setAttribute('aria-expanded', 'false'); }
    });
    nav.querySelectorAll('.pref-seg button').forEach(function (b) {
      b.addEventListener('click', function () {
        prefs[b.closest('.pref-seg').dataset.pref] = b.dataset.v;
        localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
        applyPrefs(prefs); paint();
      });
    });
  }

  /* ── 匯出到全域 ── */
  window.CRM = {
    load: load, save: save, reset: reset,
    fmt: fmt, pct: pct, maskName: maskName, toast: toast,
    mountStateSwitcher: mountStateSwitcher,
    mountNav: mountNav,
    infoIcon: infoIcon
  };
})();
