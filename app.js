// PROTOTYPE fake data layer — build 時換成真 API
// 55688 隊員 CRM 互動原型共用層：seed 假資料（localStorage 持久化）＋互動 helper
// 零依賴：vanilla JS，file:// 直接開

(function () {
  'use strict';

  var STORE_KEY = 'crm55688_proto_v19';

  /* 活動參加名單生成（deterministic；每活動 40 筆示意，前 3 筆為完整 Profile 假資料隊員） */
  function buildParticipants() {
    var SURNAMES = ['王', '林', '張', '李', '陳', '黃', '吳', '劉', '蔡', '楊'];
    var GIVEN = ['志明', '淑惠', '建宏', '雅婷', '俊傑', '美玲', '文雄', '麗華', '家豪', '怡君'];
    var IDS = ['小黃', '小黃', '多元', '小黃', '多元試跑'];
    function gen(actKey, n) {
      var seedFixed = [
        { code: '123456', name: '陳大明', identity: '小黃', before: 5.2, after: 7.8 },
        { code: '0103', name: '林志偉', identity: '多元', before: 3.1, after: 4.6 },
        { code: '0217', name: '張淑芬', identity: '多元試跑', before: 1.2, after: 1.9 }
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
    // 車隊對照表全量（2026-07-13 定版：使用者更新 CSV，Tolife合作車隊錯誤列已移除、保留小黃台北生通，共 72 筆；
    // 正式版由 fleet_dictionary 匯入全量替換維護（REQ-IMP-017），原型以 fleetDict 為唯一來源）
    var fleetDict = [
      { name: "小黃台北生通", category: "小黃", region: "台北" },
      { name: "大文山車隊", category: "小黃", region: "桃園" },
      { name: "小黃干城衛星", category: "小黃", region: "台中" },
      { name: "小黃建宏", category: "小黃", region: "花蓮" },
      { name: "小黃耐斯都會", category: "小黃", region: "台北" },
      { name: "干城衛星車隊", category: "小黃", region: "台中" },
      { name: "台中中華大小黃", category: "小黃", region: "台中" },
      { name: "台中分公司", category: "小黃", region: "台中" },
      { name: "台中無線車隊", category: "小黃", region: "台中" },
      { name: "台北分公司", category: "小黃", region: "台北" },
      { name: "台北志英", category: "小黃", region: "台北" },
      { name: "台南分公司", category: "小黃", region: "台南" },
      { name: "台南有慶", category: "小黃", region: "台南" },
      { name: "台灣大有慶", category: "小黃", region: "台南" },
      { name: "行一台南", category: "小黃", region: "台南" },
      { name: "志英車隊", category: "小黃", region: "台北" },
      { name: "宜蘭分公司", category: "小黃", region: "宜蘭" },
      { name: "怡美車隊", category: "小黃", region: "台中" },
      { name: "泛亞北區", category: "小黃", region: "台北" },
      { name: "泛亞台中", category: "小黃", region: "台中" },
      { name: "泛亞桃園", category: "小黃", region: "桃園" },
      { name: "花蓮分公司", category: "小黃", region: "花蓮" },
      { name: "金門分公司", category: "小黃", region: "離島" },
      { name: "青溪車行", category: "小黃", region: "台中" },
      { name: "南投快捷車隊", category: "小黃", region: "台中" },
      { name: "城市衛星北區", category: "小黃", region: "台北" },
      { name: "城市衛星保留", category: "小黃", region: "台北" },
      { name: "城市衛星南區", category: "小黃", region: "高雄" },
      { name: "城市衛星聯合花蓮", category: "小黃", region: "花蓮" },
      { name: "紅帥車隊", category: "小黃", region: "新竹" },
      { name: "桃園分公司", category: "小黃", region: "桃園" },
      { name: "高雄分公司", category: "小黃", region: "高雄" },
      { name: "高雄嘉鑫", category: "小黃", region: "高雄" },
      { name: "高雄潼澤", category: "小黃", region: "高雄" },
      { name: "祥賀車隊", category: "小黃", region: "台北" },
      { name: "菁英高雄", category: "小黃", region: "高雄" },
      { name: "新竹分公司", category: "小黃", region: "新竹" },
      { name: "新利達車隊", category: "小黃", region: "桃園" },
      { name: "新進車隊", category: "小黃", region: "新竹" },
      { name: "嘉義分公司", category: "小黃", region: "嘉義" },
      { name: "彰化雅客車隊", category: "小黃", region: "台中" },
      { name: "熊讚高雄", category: "小黃", region: "高雄" },
      { name: "賓樂車隊", category: "小黃", region: "台北" },
      { name: "慶安車隊", category: "小黃", region: "台北" },
      { name: "澎湖分公司", category: "小黃", region: "離島" },
      { name: "龍星北區", category: "小黃", region: "台北" },
      { name: "聯合有慶", category: "小黃", region: "台南" },
      { name: "聯合車隊", category: "小黃", region: "台北" },
      { name: "聯合彰化", category: "小黃", region: "台中" },
      { name: "雙美車隊", category: "小黃", region: "台中" },
      { name: "警光北區", category: "小黃", region: "台北" },
      { name: "中航車隊", category: "多元", region: "台中" },
      { name: "多元千里眼", category: "多元", region: "台中" },
      { name: "多元台中", category: "多元", region: "台中" },
      { name: "多元台中立忠", category: "多元", region: "台中" },
      { name: "多元台北", category: "多元", region: "台北" },
      { name: "多元台北生通", category: "多元", region: "台北" },
      { name: "多元台北宏力", category: "多元", region: "台北" },
      { name: "多元台北保底", category: "多元", region: "台北" },
      { name: "多元台南", category: "多元", region: "台南" },
      { name: "多元台南有慶", category: "多元", region: "台南" },
      { name: "多元宜蘭", category: "多元", region: "宜蘭" },
      { name: "多元花蓮", category: "多元", region: "花蓮" },
      { name: "多元桃園", category: "多元", region: "桃園" },
      { name: "多元高雄", category: "多元", region: "高雄" },
      { name: "多元新竹", category: "多元", region: "新竹" },
      { name: "多元嘉義", category: "多元", region: "嘉義" },
      { name: "多元慶安", category: "多元", region: "台北" },
      { name: "多元鴻順", category: "多元", region: "台中" },
      { name: "幸福車隊", category: "多元", region: "台北" },
      { name: "耐斯都會車隊", category: "多元", region: "台北" },
      { name: "台北多元試跑", category: "多元試跑", region: "台北" }
    ];
    // 車隊（branch）→車隊地區對照（REQ-SET-007；「台北」＝雙北）：由 fleetDict（＝車隊對照表）衍生，不另維護清單；
    // 示範假資料僅建台北／桃園／宜蘭三地區之隊員，故只取此三區
    var branchRegions = {};
    ['台北', '桃園', '宜蘭'].forEach(function (rg) {
      branchRegions[rg] = fleetDict.filter(function (f) { return f.region === rg; }).map(function (f) { return f.name; });
    });
    // 隊員每日／年趨勢種子（①REQ-PROF-002 趨勢粒度日/年：taskTrend daily/yearly，deterministic sine 種子，與 profile.html genMember 之 trend() 同構）
    function buildDailyYearly(seedBase, monthlyTasks) {
      function gen(base, n) {
        var arr = [];
        for (var j = 0; j < n; j++) {
          var x = Math.sin((seedBase + j) * 12.9898) * 43758.5453;
          var r = x - Math.floor(x);
          arr.push(Math.max(1, Math.round(base * (0.88 + r * 0.24) + j * base * 0.015)));
        }
        return arr;
      }
      return { daily: gen(monthlyTasks / 30, 30), yearly: gen(monthlyTasks * 12, 3) };
    }
    var dy123456 = buildDailyYearly(101, 156);
    var dy0103 = buildDailyYearly(202, 98);
    var dy0217 = buildDailyYearly(303, 41);
    return {
      meta: {
        dataAsOf: '2026-07-06',        // 資料截至（昨日）
        importedAt: '2026-07-07 06:30',
        staleDays: 0                   // 超過 2 天顯示過期警示（demo 可切）
      },
      branchRegions: branchRegions,
      fleetDict: fleetDict,
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
        ],
        '桃園市': [
          { d: '桃園區', tasks: 15420, accepted: 10630 },
          { d: '中壢區', tasks: 13980, accepted: 9540 },
          { d: '平鎮區', tasks: 8760, accepted: 5850 },
          { d: '龜山區', tasks: 7340, accepted: 4830 }
        ],
        '台中市': [
          { d: '西屯區', tasks: 16850, accepted: 11720 },
          { d: '北屯區', tasks: 14210, accepted: 9680 },
          { d: '南屯區', tasks: 9870, accepted: 6650 },
          { d: '西區', tasks: 7920, accepted: 5210 }
        ],
        '高雄市': [
          { d: '左營區', tasks: 14680, accepted: 10020 },
          { d: '三民區', tasks: 13120, accepted: 8830 },
          { d: '鳳山區', tasks: 10450, accepted: 6980 },
          { d: '苓雅區', tasks: 8290, accepted: 5460 }
        ]
      },
      // 活動清單（與 pages/activity.html 假資料同源，2026-07-14 手動同步；seg.js 指定活動下拉／handoff 查找、import.html 目標活動下拉共用。
      // 總覽活動卡自 2026-07-14 起改用 overview.html 自帶 ACTS——本清單僅提供 id/name/type/起迄，統計欄位已移除）
      activities: [
        { id: 'ACT-2026-06A', name: '雙北地區進步獎', type: '晚尖峰', start: '2026-06-01', end: '2026-07-31' },
        { id: 'ACT-2026-06B', name: '桃園早尖峰衝刺獎', type: '早尖峰', start: '2026-06-15', end: '2026-07-31' },
        { id: 'ACT-2026-06C', name: '夏季通勤加碼獎', type: '早尖峰', start: '2026-06-08', end: '2026-07-04' },
        { id: 'ACT-2026-05D', name: '5月新血招募獎勵', type: '車組招募', start: '2026-05-01', end: '2026-05-31' },
        { id: 'ACT-2026-04E', name: '4月早尖峰達人賽', type: '早尖峰', start: '2026-04-01', end: '2026-04-30' },
        { id: 'ACT-2026-02F', name: '春節加碼獎勵', type: '節慶關懷', start: '2026-02-10', end: '2026-02-20' }
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
          taskTrend: { daily: dy123456.daily, weekly: [34, 38, 36, 41, 39, 42, 40], monthly: [148, 152, 149, 158, 161, 156], quarterly: [438, 455, 471, 462], yearly: dy123456.yearly },
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
          taskTrend: { daily: dy0103.daily, weekly: [20, 22, 21, 25, 24, 26, 23], monthly: [88, 92, 95, 90, 101, 98], quarterly: [265, 278, 289, 284], yearly: dy0103.yearly },
          incomeTrend: { monthly: [28900, 29800, 30500, 29400, 32100, 31400] },
          contacts: [
            { date: '2026-05-30 11:15', project: '6月晚尖峰意願調查', content: '意願：參加', result: '參加' }
          ]
        },
        '0217': {
          code: '0217', name: '張淑芬', identity: '多元試跑', region: '台北市', branch: '台北多元試跑', carModel: '商務型', fleetGroups: ['預設'],
          onlineDays: { month: 9, quarter: 22, year: 61 }, evePeakDays: 4, mornPeakDays: 6,
          acceptRate: 8, joinedActivity: false, activityTypes: [],
          monthlyTasks: 41, monthlyIncome: 12800, topDistricts: ['大安區', '中山區', '松山區'],
          refuseReasons: [],
          taskTrend: { daily: dy0217.daily, weekly: [8, 10, 9, 11, 12, 10, 11], monthly: [32, 35, 38, 40, 43, 41], quarterly: [98, 105, 112, 119], yearly: dy0217.yearly },
          incomeTrend: { monthly: [9800, 10500, 11400, 12100, 13000, 12800] },
          contacts: []
        }
      },
      // 活動參加名單（活動 id → 參加者含前後差異；正式版為全量分頁查詢，原型每活動 40 筆示意）
      activityParticipants: buildParticipants(),
      // 指標池（REQ-OV-005：從池中挑選組卡）
      metricPool: [
        { key: 'acceptedMembers', name: '有承接隊員數', dims: ['地區', '尖峰時段', '承接天數級距'] },
        { key: 'acceptRate', name: '承接率', dims: ['地區', '尖峰時段'] },  // 2026-07-13 統一口徑：Σ承接÷Σ詢問（driver_inquiry_stats），原「總覽承接率」任務狀態口徑歸檔
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

  /* 電話去識別化（REQ-PROF-007 收窄：0912-345-678→0912-***-678，保留前四碼與末三碼；空值/待補/非預期格式原樣回傳） */
  function maskPhone(p) {
    p = String(p || '');
    if (!p || p === '待補') return p;
    var m = /^(\d{4})-(\d{3})-(\d{3})$/.exec(p);
    if (!m) return p;
    return m[1] + '-***-' + m[3];
  }

  /* ── CSV 匯出（BOM＋逗號/引號/換行跳脫；供各頁「匯出」鈕組 rows 後呼叫） ── */
  function csvCell(v) {
    v = v == null ? '' : String(v);
    if (/["\n,]/.test(v)) v = '"' + v.replace(/"/g, '""') + '"';
    return v;
  }
  function downloadCsv(filename, rows, textCols) {
    // textCols＝須以文字輸出之欄 index：純數字值包成 ="0103" 防 Excel 吃掉前導零（隊編等，2026-07-17 走查第 9 條）
    var text = rows.map(function (row) {
      return row.map(function (v, i) {
        if (textCols && textCols.indexOf(i) >= 0 && v != null && /^\d+$/.test(String(v)))
          return '"=""' + String(v) + '"""';
        return csvCell(v);
      }).join(',');
    }).join('\r\n');
    var blob = new Blob(['\uFEFF' + text], { type: 'text/csv;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  /* ── XLSX 匯出（REQ-CS-023 三工作表；2026-07-20 拍板「三區塊分三分頁」）──
        零依賴實作：XLSX＝ZIP 容器＋SpreadsheetML——以 STORED（不壓縮）ZIP 組裝、儲存格全用 inline string／number；
        字串一律文字儲存格 → 隊編前導零天然保留（xlsx 版取代 CSV ="0123" 技法） ── */
  var CRC_TABLE = (function () {
    var t = [], c;
    for (var n = 0; n < 256; n++) {
      c = n;
      for (var k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      t[n] = c >>> 0;
    }
    return t;
  })();
  function crc32(bytes) {
    var c = 0xFFFFFFFF;
    for (var i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  }
  function utf8Bytes(s) { return new TextEncoder().encode(s); }
  function xmlEsc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function colRef(i) { var s = ''; i++; while (i > 0) { var m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); } return s; }
  function sheetXml(rows) {
    var xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>';
    rows.forEach(function (row, ri) {
      xml += '<row r="' + (ri + 1) + '">';
      row.forEach(function (v, ci) {
        if (v == null || v === '') return;
        var ref = colRef(ci) + (ri + 1);
        if (typeof v === 'number' && isFinite(v)) xml += '<c r="' + ref + '"><v>' + v + '</v></c>';
        else xml += '<c r="' + ref + '" t="inlineStr"><is><t xml:space="preserve">' + xmlEsc(v) + '</t></is></c>';
      });
      xml += '</row>';
    });
    return xml + '</sheetData></worksheet>';
  }
  function zipStore(files) {  // files: [{name, data:Uint8Array}] → STORED zip Blob（local headers＋central directory＋EOCD）
    var parts = [], central = [], offset = 0;
    files.forEach(function (f) {
      var nameB = utf8Bytes(f.name), crc = crc32(f.data), sz = f.data.length;
      var lh = new Uint8Array(30 + nameB.length), dv = new DataView(lh.buffer);
      dv.setUint32(0, 0x04034b50, true); dv.setUint16(4, 20, true); dv.setUint16(6, 0x0800, true);
      dv.setUint32(14, crc, true); dv.setUint32(18, sz, true); dv.setUint32(22, sz, true);
      dv.setUint16(26, nameB.length, true);
      lh.set(nameB, 30);
      parts.push(lh, f.data);
      var ch = new Uint8Array(46 + nameB.length), cv = new DataView(ch.buffer);
      cv.setUint32(0, 0x02014b50, true); cv.setUint16(4, 20, true); cv.setUint16(6, 20, true); cv.setUint16(8, 0x0800, true);
      cv.setUint32(16, crc, true); cv.setUint32(20, sz, true); cv.setUint32(24, sz, true);
      cv.setUint16(28, nameB.length, true); cv.setUint32(42, offset, true);
      ch.set(nameB, 46);
      central.push(ch);
      offset += lh.length + sz;
    });
    var centralSize = 0; central.forEach(function (c) { centralSize += c.length; });
    var eocd = new Uint8Array(22), ev = new DataView(eocd.buffer);
    ev.setUint32(0, 0x06054b50, true);
    ev.setUint16(8, files.length, true); ev.setUint16(10, files.length, true);
    ev.setUint32(12, centralSize, true); ev.setUint32(16, offset, true);
    return new Blob(parts.concat(central, [eocd]), { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }
  function downloadXlsx(filename, sheets) {  // sheets: [{name, rows}]；工作表名限 31 字、不得含 : \ / ? * [ ]
    var files = [
      { name: '[Content_Types].xml', data: utf8Bytes('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' + sheets.map(function (s, i) { return '<Override PartName="/xl/worksheets/sheet' + (i + 1) + '.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'; }).join('') + '</Types>') },
      { name: '_rels/.rels', data: utf8Bytes('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>') },
      { name: 'xl/workbook.xml', data: utf8Bytes('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>' + sheets.map(function (s, i) { return '<sheet name="' + xmlEsc(s.name) + '" sheetId="' + (i + 1) + '" r:id="rId' + (i + 1) + '"/>'; }).join('') + '</sheets></workbook>') },
      { name: 'xl/_rels/workbook.xml.rels', data: utf8Bytes('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' + sheets.map(function (s, i) { return '<Relationship Id="rId' + (i + 1) + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet' + (i + 1) + '.xml"/>'; }).join('') + '</Relationships>') }
    ];
    sheets.forEach(function (s, i) { files.push({ name: 'xl/worksheets/sheet' + (i + 1) + '.xml', data: utf8Bytes(sheetXml(s.rows)) }); });
    var blob = zipStore(files);
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
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
  /* tooltip 出界修正（2026-07-15 使用者走查：捲動容器內 tip 被 overflow 裁切）：
     hover/focus 時改 fixed 定位釘在 viewport 上，離開後還原——一律不被 .chart-wrap 等容器裁切 */
  function positionTip(icon) {
    var tip = icon.querySelector('.crm-info-tip'); if (!tip) return;
    var r = icon.getBoundingClientRect();
    var x = Math.max(150, Math.min(window.innerWidth - 150, r.left + r.width / 2));
    tip.style.maxWidth = '300px';
    tip.style.whiteSpace = 'normal';
    tip.style.overflowWrap = 'anywhere';  // 無空格長字串（如備註連續數字）強制斷行，防溢出框外（2026-07-20 走查）
    tip.style.position = 'fixed';
    tip.style.left = x + 'px';
    tip.style.bottom = 'auto';
    if (r.top > 90) { tip.style.top = (r.top - 8) + 'px'; tip.style.transform = 'translate(-50%,-100%)'; }
    else { tip.style.top = (r.bottom + 8) + 'px'; tip.style.transform = 'translate(-50%,0)'; }
  }
  function resetTip(icon) {
    var tip = icon.querySelector('.crm-info-tip'); if (!tip) return;
    tip.style.position = ''; tip.style.left = ''; tip.style.top = ''; tip.style.bottom = ''; tip.style.transform = '';
  }
  document.addEventListener('mouseover', function (e) { var i = e.target.closest && e.target.closest('.crm-info'); if (i) positionTip(i); });
  document.addEventListener('mouseout', function (e) { var i = e.target.closest && e.target.closest('.crm-info'); if (i) resetTip(i); });
  document.addEventListener('focusin', function (e) { var i = e.target.closest && e.target.closest('.crm-info'); if (i) positionTip(i); });
  document.addEventListener('focusout', function (e) { var i = e.target.closest && e.target.closest('.crm-info'); if (i) resetTip(i); });

  /* ── 共用導覽列 ── */
  var NAV_ITEMS = [
    { key: 'overview', label: '總覽', href: 'overview.html', ready: true },
    { key: 'peak', label: '尖峰完成數', href: 'peak.html', ready: true },
    { key: 'capacity', label: '運力分析', href: 'capacity.html', ready: true },  // 2026-07-13 重規劃：三分頁＝尖峰運力 YoY／承接率分析／缺口快速觀察（原運力查詢四子分頁歸檔）
    { key: 'profile', label: '隊員 Profile', href: 'profile.html', ready: true },
    { key: 'activity', label: '隊員活動', href: 'activity.html', ready: true },
    { key: 'callcenter', label: '客服外撥', href: 'callcenter.html', ready: true },  // 2026-07-16 使用者拍板改名（原「客服紀錄」）
    { key: 'import', label: '資料匯入', href: 'import.html', ready: true },
    { key: 'settings', label: '系統設定', href: 'settings.html', ready: true }
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
        /* 使用者選單下拉（REQ-AUTH-004：變更密碼入口） */
        '.nav-user{border:none;background:transparent;cursor:pointer;font-family:inherit;font-size:inherit;color:inherit;display:inline-flex;align-items:center;gap:3px;padding:4px 6px;border-radius:8px}' +
        '.nav-user:hover{background:var(--surface-warm)}' +
        '.nav-user-caret{font-size:10px;color:var(--muted)}' +
        '.nav-user-menu{position:absolute;top:calc(100% + 8px);right:0;background:var(--surface);border:1px solid var(--border-soft);border-radius:12px;box-shadow:rgba(0,0,0,.12) 0 8px 32px;padding:6px;z-index:600;min-width:150px;display:none}' +
        '.nav-user-menu.show{display:block}' +
        '.nav-user-menu-item{display:block;width:100%;text-align:left;border:none;background:transparent;padding:8px 10px;border-radius:8px;font-size:13.5px;color:var(--fg-2);cursor:pointer;font-family:inherit}' +
        '.nav-user-menu-item:hover{background:var(--surface-warm)}' +
        /* 變更密碼 modal（自帶樣式，各頁不一定有 .modal 系列 class 可沿用） */
        '.pcm-backdrop{position:fixed;inset:0;background:rgba(20,20,19,.45);z-index:8000;display:none;align-items:center;justify-content:center;padding:16px}' +
        '.pcm-backdrop.show{display:flex}' +
        '.pcm-box{background:var(--surface);border-radius:16px;width:400px;max-width:100%;padding:24px;box-shadow:rgba(0,0,0,.18) 0 12px 48px}' +
        '.pcm-box h3{font-weight:500;font-size:18px;margin:0 0 6px}' +
        '.pcm-desc{color:var(--muted);font-size:12.5px;margin:0 0 16px;line-height:1.6}' +
        '.pcm-field{margin-bottom:12px}' +
        '.pcm-field label{display:block;font-size:12.5px;color:var(--fg-2);margin-bottom:4px}' +
        '.pcm-field input{width:100%;box-sizing:border-box;border:1px solid var(--border-soft);border-radius:8px;padding:8px 10px;font-size:14px;font-family:inherit;background:var(--surface);color:var(--fg)}' +
        '.pcm-hint{font-size:11.5px;color:var(--muted);margin-top:4px}' +
        '.pcm-error{background:#fbeceb;color:var(--danger);border-radius:8px;padding:8px 10px;font-size:12.5px;margin-bottom:12px;display:none}' +
        '.pcm-error.show{display:block}' +
        '.pcm-foot{display:flex;justify-content:flex-end;gap:8px;margin-top:18px}' +
        '.pcm-btn{border:none;cursor:pointer;border-radius:8px;font-size:13.5px;padding:8px 14px;min-height:36px;font-family:inherit}' +
        '.pcm-btn-cancel{background:var(--surface-warm);color:var(--fg-2)}' +
        '.pcm-btn-primary{background:var(--brand-55688);color:var(--brand-55688-on)}' +
        '.pcm-btn-primary:hover{background:var(--brand-55688-deep)}' +
        /* 手機漢堡選單（2026-07-15 使用者拍板：桌機不動、窄螢幕收進抽屜） */
        '.nav-burger{display:none;border:1px solid var(--border-soft);background:var(--surface);border-radius:8px;min-width:38px;min-height:32px;font-size:17px;line-height:1;color:var(--fg-2);cursor:pointer;font-family:inherit;align-items:center;justify-content:center;transition:background var(--motion-fast)}' +
        '.nav-burger:hover{background:var(--surface-warm)}' +
        '@media(max-width:768px){' +
          '.nav-user{display:none}.brand-title{display:none}' +
          '.data-chip{font-size:11px;padding:3px 8px;white-space:nowrap}' +
          '.nav-inner{padding:0 12px;gap:10px;justify-content:space-between}' +
          '.crm-info-tip{max-width:180px}' +
          '.page{padding-left:14px;padding-right:14px}' +
          '.nav-burger{display:inline-flex}' +
          '.nav-links{display:none;position:absolute;top:100%;left:0;right:0;background:var(--surface);border-bottom:1px solid var(--border-soft);box-shadow:rgba(0,0,0,.12) 0 14px 28px;flex-direction:column;gap:2px;padding:8px 12px 12px;overflow-x:visible}' +
          '#crm-nav.nav-open .nav-links{display:flex}' +
          '.nav-link{min-height:44px;font-size:15.5px;border-radius:10px}' +
          '.nav-link.active{background:var(--surface-warm);box-shadow:inset 3px 0 0 var(--brand-55688);border-radius:10px}' +
        '}';
      document.head.appendChild(st);
    }
    var html = '<div class="nav-inner">' +
      '<div class="nav-brand"><span class="brand-badge">55688</span><span class="brand-title">隊員 CRM</span></div>' +
      '<div class="nav-links" id="nav-links" role="navigation" aria-label="主選單">';
    NAV_ITEMS.forEach(function (it) {
      var cls = 'nav-link' + (it.key === activeKey ? ' active' : '') + (it.ready ? '' : ' pending');
      html += '<a class="' + cls + '" href="' + it.href + '" data-ready="' + it.ready + '" ' +
        (it.key === activeKey ? 'aria-current="page"' : '') + '>' + it.label + '</a>';
    });
    html += '</div>' +
      '<div class="nav-meta" style="position:relative">' +
      '<button class="nav-burger" id="nav-burger" type="button" aria-expanded="false" aria-controls="nav-links" aria-label="開啟主選單">☰</button>' +
      '<button class="pref-btn" id="pref-toggle" type="button" aria-haspopup="true" aria-expanded="false" title="顯示設定（字級／字重）">Aa</button>' +
      '<div class="pref-pop" id="pref-pop" role="menu" aria-label="顯示設定">' +
        '<div class="pref-row"><span class="pl">字型大小</span><span class="pref-seg" data-pref="fs">' +
          '<button type="button" data-v="sm">小</button><button type="button" data-v="md">中</button><button type="button" data-v="lg">大</button></span></div>' +
        '<div class="pref-row"><span class="pl">字體粗細</span><span class="pref-seg" data-pref="fw">' +
          '<button type="button" data-v="light">細</button><button type="button" data-v="md">適中</button><button type="button" data-v="bold">粗</button></span></div>' +
      '</div>' +
      '<span class="data-chip" title="最後成功匯入時間">資料截至 ' + dataAsOf + '</span>' +
      '<button class="nav-user" id="nav-user-btn" type="button" aria-haspopup="true" aria-expanded="false">王營管<span class="nav-user-caret" aria-hidden="true">▾</span></button>' +
      '<div class="nav-user-menu" id="nav-user-menu" role="menu" aria-label="使用者選單">' +
        '<button type="button" class="nav-user-menu-item" id="nav-user-pwd" role="menuitem">變更密碼</button>' +
        '<button type="button" class="nav-user-menu-item" id="nav-user-logout" role="menuitem">登出</button>' +
      '</div></div></div>';
    nav.innerHTML = html;
    nav.querySelectorAll('a.pending').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        toast('此頁面將於下一批原型提供（本批交付：總覽）');
      });
    });
    // 手機漢堡選單開合（Esc／點外側關閉；aria-expanded 同步）
    var burger = document.getElementById('nav-burger');
    function closeDrawer() { nav.classList.remove('nav-open'); burger.setAttribute('aria-expanded', 'false'); burger.textContent = '☰'; burger.setAttribute('aria-label', '開啟主選單'); }
    burger.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = nav.classList.toggle('nav-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.textContent = open ? '✕' : '☰';
      burger.setAttribute('aria-label', open ? '關閉主選單' : '開啟主選單');
    });
    document.addEventListener('click', function (e) { if (nav.classList.contains('nav-open') && !nav.contains(e.target)) closeDrawer(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('nav-open')) closeDrawer(); });
    initPrefs(nav);
    initUserMenu(nav);
  }

  /* ── 使用者選單下拉＋變更密碼（REQ-AUTH-004：忘記密碼文案兌現「登入後可於個人選單自行變更密碼」） ── */
  function initUserMenu(nav) {
    var btn = nav.querySelector('#nav-user-btn');
    var menu = nav.querySelector('#nav-user-menu');
    if (!btn || !menu) return;
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var show = !menu.classList.contains('show');
      menu.classList.toggle('show', show);
      btn.setAttribute('aria-expanded', String(show));
    });
    document.addEventListener('click', function (e) {
      if (!menu.contains(e.target) && e.target !== btn) { menu.classList.remove('show'); btn.setAttribute('aria-expanded', 'false'); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('show')) { menu.classList.remove('show'); btn.setAttribute('aria-expanded', 'false'); }
    });
    var pwdItem = nav.querySelector('#nav-user-pwd');
    pwdItem.addEventListener('click', function () {
      menu.classList.remove('show');
      btn.setAttribute('aria-expanded', 'false');
      openPwdChangeModal();
    });
    var logoutItem = nav.querySelector('#nav-user-logout');
    logoutItem.addEventListener('click', function () {
      menu.classList.remove('show');
      btn.setAttribute('aria-expanded', 'false');
      location.href = 'login.html';
    });
  }

  var pcmBackdrop = null;
  function ensurePwdChangeModal() {
    if (pcmBackdrop) return pcmBackdrop;
    pcmBackdrop = document.createElement('div');
    pcmBackdrop.className = 'pcm-backdrop';
    pcmBackdrop.id = 'pcm-backdrop';
    pcmBackdrop.setAttribute('role', 'dialog');
    pcmBackdrop.setAttribute('aria-modal', 'true');
    pcmBackdrop.setAttribute('aria-labelledby', 'pcm-title');
    pcmBackdrop.innerHTML =
      '<div class="pcm-box">' +
        '<h3 id="pcm-title">變更密碼</h3>' +
        '<p class="pcm-desc">請輸入目前密碼與新密碼；新密碼將於下次登入生效。</p>' +
        '<div class="pcm-error" id="pcm-error"></div>' +
        '<div class="pcm-field"><label for="pcm-cur">目前密碼</label><input type="password" id="pcm-cur" autocomplete="current-password"></div>' +
        '<div class="pcm-field"><label for="pcm-new">新密碼</label><input type="password" id="pcm-new" autocomplete="new-password">' +
          '<div class="pcm-hint">至少 8 碼，需包含英文與數字</div></div>' +
        '<div class="pcm-field"><label for="pcm-confirm">確認新密碼</label><input type="password" id="pcm-confirm" autocomplete="new-password"></div>' +
        '<div class="pcm-foot">' +
          '<button type="button" class="pcm-btn pcm-btn-cancel" id="pcm-cancel">取消</button>' +
          '<button type="button" class="pcm-btn pcm-btn-primary" id="pcm-ok">確認變更</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(pcmBackdrop);

    var errBox = pcmBackdrop.querySelector('#pcm-error');
    var curInput = pcmBackdrop.querySelector('#pcm-cur');
    var newInput = pcmBackdrop.querySelector('#pcm-new');
    var confirmInput = pcmBackdrop.querySelector('#pcm-confirm');

    function showErr(msg) { errBox.textContent = msg; errBox.classList.add('show'); }
    function hideErr() { errBox.classList.remove('show'); errBox.textContent = ''; }
    function close() {
      pcmBackdrop.classList.remove('show');
      curInput.value = ''; newInput.value = ''; confirmInput.value = '';
      hideErr();
    }
    pcmBackdrop.querySelector('#pcm-cancel').addEventListener('click', close);
    pcmBackdrop.addEventListener('click', function (e) { if (e.target === pcmBackdrop) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && pcmBackdrop.classList.contains('show')) close(); });
    pcmBackdrop.querySelector('#pcm-ok').addEventListener('click', function () {
      hideErr();
      if (!curInput.value) { showErr('請輸入目前密碼'); curInput.focus(); return; }
      if (newInput.value.length < 8 || !/[A-Za-z]/.test(newInput.value) || !/[0-9]/.test(newInput.value)) {
        showErr('新密碼至少 8 碼，需包含英文與數字'); newInput.focus(); return;
      }
      if (newInput.value !== confirmInput.value) { showErr('兩次輸入的新密碼不一致，請重新輸入'); confirmInput.focus(); return; }
      close();
      toast('密碼已變更');
    });
    return pcmBackdrop;
  }
  function openPwdChangeModal() {
    var modal = ensurePwdChangeModal();
    modal.classList.add('show');
    modal.querySelector('#pcm-cur').focus();
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

  /* ── 頁內畫面歷史（2026-07-16 使用者拍板：所有 tab 切換＋下鑽記入瀏覽器歷史，「上一頁」先頁內回退再離開頁面） ──
     頁面端用法：
       var commit = CRM.initPageHistory(getViewState, applyViewState);
       // getViewState()：回傳可 JSON 序列化的目前畫面狀態物件（tab、下鑽 id…）
       // applyViewState(st)：把畫面切到指定狀態（冪等、不推歷史）
       // 每個使用者觸發的切換 listener 末尾呼叫 commit()
     popstate 還原期間 commit() 自動抑制；同狀態不重複推；不動 URL（既有 #act=／?m= 深連結不受影響） */
  function initPageHistory(getState, applyState) {
    var suppress = false;
    var initial = getState();
    window.addEventListener('popstate', function (e) {
      suppress = true;
      try { applyState(e.state || initial); } finally { suppress = false; }
    });
    history.replaceState(initial, '');
    return function commit() {
      if (suppress) return;
      var st = getState();
      if (JSON.stringify(history.state) === JSON.stringify(st)) return;
      history.pushState(st, '');
    };
  }

  /* ── 匯出到全域 ── */
  window.CRM = {
    load: load, save: save, reset: reset,
    fmt: fmt, pct: pct, maskName: maskName, maskPhone: maskPhone, toast: toast,
    mountStateSwitcher: mountStateSwitcher,
    mountNav: mountNav,
    infoIcon: infoIcon,
    initPageHistory: initPageHistory,
    downloadCsv: downloadCsv,
    downloadXlsx: downloadXlsx
  };
})();
