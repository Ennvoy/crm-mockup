// PROTOTYPE 分群篩選共用元件（REQ-SEG-001~005、REQ-E2E-012）— build 時換成真 API
// 掛載於 profile.html 的「分群篩選」tab（介面形式定版：Profile 頁內 tab）
// 用法：CRMSEG.mount(containerEl)

(function () {
  'use strict';

  var SEG_KEY = 'crm55688_segments_v1';   // 已儲存名單條件（segment）

  /* ── 假資料池：2,000 名隊員，deterministic 生成（含 3 名完整假資料隊員） ── */
  var SURNAMES = ['王', '林', '張', '李', '陳', '黃', '吳', '劉', '蔡', '楊'];
  var GIVEN = ['志明', '淑惠', '建宏', '雅婷', '俊傑', '美玲', '文雄', '麗華', '家豪', '怡君'];
  var IDS = ['小黃', '小黃', '小黃', '多元', '多元', '多元試跑'];
  var TAGS = ['預設', '一般預約', '提供刷卡付款', '提供悠遊卡付款', '提供綁定付款', '敬老愛心_台北', '敬老愛心_新北', '敬老愛心_雙北', '好孕車組', '開行李箱', '攜帶輪椅', '手機充電', '低底盤車', '送餐車組', '短程預約', '專派任務', '乘車券', '國旅卡車組'];
  var CARS = ['RAV4', 'Tesla', 'Altis', '豪華型', '商務型'];
  var ACT_TYPES = ['獎勵活動', '培訓課程', '車組招募'];
  var REASONS = ['低價', '距離遠', '目的地不符', '時段不合', '車輛保養中'];
  var REGION_OF_BRANCH_REGION = { '台北': ['台北市', '新北市'], '桃園': ['桃園市'], '宜蘭': ['宜蘭縣'] };

  var pool = null;
  function rnd(s, k) { var x = Math.sin((s + k) * 12.9898) * 43758.5453; return x - Math.floor(x); }

  /* 活動成效假資料（REQ-SEG-006，依隊編 seed 決定性生成）：
     actCount＝實際參加活動次數；actGoalRate＝跨活動達標率（未參加任何活動者無資料，null）；
     actGrowth＝指定活動任務增長比例（前期 0 任務者除零無意義，以 actIsNewOrRestart 標記、growth 為 null） */
  function actStats(s) {
    var isNew = rnd(s, 40) < 0.12;
    var cnt = Math.floor(rnd(s, 41) * 6);                                   // 0~5 次
    var goal = cnt > 0 ? Math.round(rnd(s, 42) * 1000) / 10 : null;         // 0~100.0%
    var growth = isNew ? null : Math.round((rnd(s, 43) * 1800 - 400)) / 10; // −40.0%~140.0%
    return { actCount: cnt, actGoalRate: goal, actGrowth: growth, actIsNewOrRestart: isNew };
  }

  function buildPool(DB) {
    var branches = [];
    Object.keys(DB.branchRegions).forEach(function (rg) {
      DB.branchRegions[rg].forEach(function (b) { branches.push({ name: b, region: rg }); });
    });
    /* 行政區字典（REQ-SEG-001：縣市＝依近 90 天完成任務上車行政區換算）：取自 DB.distribution（承接任務分布圖同一字典），
       原型示範資料僅雙北（台北市／新北市）具行政區細節；桃園／宜蘭無對應資料，district 留空、縣市維持車隊地區直接對應 */
    var DIST_LIST = [];
    Object.keys(DB.distribution || {}).forEach(function (city) {
      (DB.distribution[city] || []).forEach(function (o) { DIST_LIST.push({ d: o.d, city: city }); });
    });
    function cityOfDistrict(d) {
      var hit = DIST_LIST.filter(function (x) { return x.d === d; })[0];
      return hit ? hit.city : null;
    }
    var list = [];
    // 3 名完整假資料隊員（與 Profile 頁一致；行政區取其 topDistricts 首名，縣市由此換算，與 Profile 常跑區域口徑一致）
    Object.keys(DB.members).forEach(function (code) {
      var m = DB.members[code];
      var cs = 0; for (var ci = 0; ci < m.code.length; ci++) cs = cs * 31 + m.code.charCodeAt(ci);
      var st = actStats(cs % 100000);
      var district0 = (m.topDistricts && m.topDistricts[0]) || '';
      list.push({
        code: m.code, name: m.name, identity: m.identity, region: cityOfDistrict(district0) || m.region, district: district0,
        branch: m.branch, branchRegion: '台北',
        carModel: m.carModel, fleetGroups: m.fleetGroups,
        monthOnline: m.onlineDays.month, mornPeak: m.mornPeakDays, evePeak: m.evePeakDays,
        acceptRate: m.acceptRate, joined: m.joinedActivity, actTypes: m.activityTypes,
        monthlyTasks: m.monthlyTasks, refuseReasons: m.refuseReasons,
        actCount: st.actCount, actGoalRate: st.actGoalRate, actGrowth: st.actGrowth, actIsNewOrRestart: st.actIsNewOrRestart
      });
    });
    for (var i = 0; i < 2000; i++) {
      var s = 7000 + i * 13;
      var br = branches[Math.floor(rnd(s, 1) * branches.length)];
      var regions = REGION_OF_BRANCH_REGION[br.region];
      var mo = Math.floor(rnd(s, 2) * 32);                     // 上個月上線 0~31 天
      var tags = [];
      var tN = 1 + Math.floor(rnd(s, 3) * 5), t0 = Math.floor(rnd(s, 4) * TAGS.length);
      for (var t = 0; t < tN; t++) tags.push(TAGS[(t0 + t * 3) % TAGS.length]);
      var joined = rnd(s, 5) > 0.55;
      var nRs = Math.floor(rnd(s, 6) * 3.4);
      var st = actStats(s);
      // 行政區＋縣市（REQ-SEG-001）：車隊地區＝台北（雙北）者由行政區字典指派、縣市依行政區換算；
      // 其餘車隊地區（桃園／宜蘭）無行政區字典資料，維持縣市直接指派、district 留空
      var district = '', region;
      if (br.region === '台北' && DIST_LIST.length) {
        var distObj = DIST_LIST[Math.floor(rnd(s, 20) * DIST_LIST.length)];
        district = distObj.d; region = distObj.city;
      } else {
        region = regions[Math.floor(rnd(s, 10) * regions.length)];
      }
      list.push({
        code: String(10000 + i), name: SURNAMES[Math.floor(rnd(s, 7) * 10)] + GIVEN[Math.floor(rnd(s, 8) * 10)],
        identity: IDS[Math.floor(rnd(s, 9) * IDS.length)],
        region: region, district: district,
        branch: br.name, branchRegion: br.region,
        carModel: CARS[Math.floor(rnd(s, 12) * CARS.length)],
        fleetGroups: tags,
        monthOnline: mo,
        mornPeak: Math.min(mo, Math.floor(rnd(s, 13) * 24)),
        evePeak: Math.min(mo, Math.floor(rnd(s, 14) * 26)),
        acceptRate: Math.floor(5 + rnd(s, 15) * 40),
        joined: joined,
        actTypes: joined ? [ACT_TYPES[Math.floor(rnd(s, 16) * 3)]] : [],
        monthlyTasks: Math.floor(20 + rnd(s, 17) * 180),
        refuseReasons: REASONS.slice(0, nRs),
        actCount: st.actCount, actGoalRate: st.actGoalRate, actGrowth: st.actGrowth, actIsNewOrRestart: st.actIsNewOrRestart
      });
    }
    return list;
  }

  /* ── 篩選條件狀態與判定（AND 跨欄位、OR 同欄位多值，REQ-SEG-001） ── */
  function emptyCond() {
    // 名單池僅含正式隊員（退隊者不進池，REQ-SEG-001；正式／退隊由名冊全量比對推導，REQ-IMP-015）
    return { identity: [], region: [], branchRegion: [], branch: [], district: [], tags: [], car: [],
      bucket: [], mornMin: '', eveMin: '', arMin: '', arMax: '', joined: '', actTypes: [], mtMin: '', mtMax: '', reasons: [],
      // 活動成效維度（REQ-SEG-006）：①參加活動次數 ②跨活動達標率 ③指定活動任務增長比例
      actCountMin: '', actGoalMin: '', actActivity: '', actGrowthMin: '', actGrowthMax: '', actIncludeNew: false };
  }
  function withDefaults(saved) {
    // 相容舊版已儲存名單條件（缺新欄位時補預設值，避免 input.value 顯示 "undefined"）
    var merged = emptyCond();
    Object.keys(saved || {}).forEach(function (k) { merged[k] = saved[k]; });
    return merged;
  }
  function bucketOf(d) { return d === 0 ? '0' : (d <= 10 ? '1-10' : (d <= 20 ? '11-20' : '21+')); }
  function match(m, c) {
    if (c.identity.length && c.identity.indexOf(m.identity) < 0) return false;
    if (c.region.length && c.region.indexOf(m.region) < 0) return false;
    if (c.district.length && c.district.indexOf(m.district) < 0) return false;
    if (c.branchRegion.length && c.branchRegion.indexOf(m.branchRegion) < 0) return false;
    if (c.branch.length && c.branch.indexOf(m.branch) < 0) return false;
    if (c.tags.length && !c.tags.some(function (t) { return m.fleetGroups.indexOf(t) >= 0; })) return false;
    if (c.car.length && c.car.indexOf(m.carModel) < 0) return false;
    if (c.bucket.length && c.bucket.indexOf(bucketOf(m.monthOnline)) < 0) return false;
    if (c.mornMin !== '' && !(m.mornPeak >= Number(c.mornMin))) return false;
    if (c.eveMin !== '' && !(m.evePeak >= Number(c.eveMin))) return false;
    if (c.arMin !== '' && !(m.acceptRate >= Number(c.arMin))) return false;
    if (c.arMax !== '' && !(m.acceptRate <= Number(c.arMax))) return false;
    if (c.joined === 'yes' && !m.joined) return false;
    if (c.joined === 'no' && m.joined) return false;
    if (c.actTypes.length && !c.actTypes.some(function (t) { return m.actTypes.indexOf(t) >= 0; })) return false;
    if (c.mtMin !== '' && !(m.monthlyTasks >= Number(c.mtMin))) return false;
    if (c.mtMax !== '' && !(m.monthlyTasks <= Number(c.mtMax))) return false;
    if (c.reasons.length && !c.reasons.some(function (t) { return m.refuseReasons.indexOf(t) >= 0; })) return false;
    if (c.actCountMin !== '' && !(m.actCount >= Number(c.actCountMin))) return false;
    if (c.actGoalMin !== '' && (m.actGoalRate === null || !(m.actGoalRate >= Number(c.actGoalMin)))) return false;
    if (c.actActivity) {
      // 指定活動任務增長比例：前期 0 任務者（actIsNewOrRestart）不落入任何比例區間，僅在勾選「含新增/重啟」時另計入（REQ-SEG-006③）
      var passRange = !m.actIsNewOrRestart &&
        (c.actGrowthMin === '' || m.actGrowth >= Number(c.actGrowthMin)) &&
        (c.actGrowthMax === '' || m.actGrowth <= Number(c.actGrowthMax));
      var passNew = c.actIncludeNew && m.actIsNewOrRestart;
      if (!passRange && !passNew) return false;
    }
    return true;
  }
  function condSummary(c, db) {
    var p = [];
    if (c.identity.length) p.push(c.identity.join('/'));
    if (c.branchRegion.length) p.push('車隊地區 ' + c.branchRegion.map(function (r) { return r === '台北' ? '台北（雙北）' : r; }).join('/'));
    if (c.branch.length) p.push('車隊 ' + c.branch.join('/'));
    if (c.region.length) p.push(c.region.join('/'));
    if (c.district.length) p.push('行政區 ' + c.district.join('/'));
    if (c.tags.length) p.push('車組 ' + c.tags.join('/'));
    if (c.car.length) p.push('車款 ' + c.car.join('/'));
    if (c.bucket.length) p.push('上線級距 ' + c.bucket.join('/'));
    if (c.mornMin !== '') p.push('早尖峰 ≥' + c.mornMin + ' 天');
    if (c.eveMin !== '') p.push('晚尖峰 ≥' + c.eveMin + ' 天');
    if (c.arMin !== '' || c.arMax !== '') p.push('承接率 ' + (c.arMin || 0) + '~' + (c.arMax || 100) + '%');
    if (c.joined === 'yes') p.push('曾參與活動');
    if (c.joined === 'no') p.push('未參與活動');
    if (c.actTypes.length) p.push('活動類型 ' + c.actTypes.join('/'));
    if (c.mtMin !== '' || c.mtMax !== '') p.push('月承接 ' + (c.mtMin || 0) + '~' + (c.mtMax || '∞') + ' 趟');
    if (c.reasons.length) p.push('不願承接原因 ' + c.reasons.join('/'));
    if (c.actCountMin !== '') p.push('參加活動次數 ≥' + c.actCountMin + ' 次');
    if (c.actGoalMin !== '') p.push('跨活動達標率 ≥' + c.actGoalMin + '%');
    if (c.actActivity) {
      var acts = (db && db.activities) || [];
      var actObj = acts.filter(function (a) { return a.id === c.actActivity; })[0];
      var rangeTxt = (c.actGrowthMin !== '' || c.actGrowthMax !== '') ? '（' + (c.actGrowthMin || '−∞') + '~' + (c.actGrowthMax || '+∞') + '%）' : '';
      p.push('任務增長［' + (actObj ? actObj.name : c.actActivity) + '］' + rangeTxt + (c.actIncludeNew ? '含新增/重啟' : ''));
    }
    return p.length ? p.join('＋') : '（無條件＝全體）';
  }

  function loadSegs() { try { return JSON.parse(localStorage.getItem(SEG_KEY)) || []; } catch (e) { return []; } }
  function saveSegs(x) { localStorage.setItem(SEG_KEY, JSON.stringify(x)); }

  /* ── 元件樣式（一次注入，兩個入口共用） ── */
  function injectCss() {
    if (document.getElementById('seg-css')) return;
    var st = document.createElement('style');
    st.id = 'seg-css';
    st.textContent =
      '.seg-wrap{display:grid;grid-template-columns:400px minmax(0,1fr);gap:16px;align-items:start;margin-top:20px}' +
      '@media(max-width:1000px){.seg-wrap{grid-template-columns:1fr}}' +
      '.seg-panel,.seg-res,.seg-saved{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:20px}' +
      '.seg-title{font-family:var(--font-display);font-weight:500;font-size:18px;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap}' +
      '.seg-g{padding:10px 0;border-bottom:1px solid var(--border-soft)}' +
      '.seg-g:last-child{border-bottom:none}' +
      '.seg-g .gl{font-size:12.5px;color:var(--muted);margin-bottom:6px;display:flex;align-items:center;gap:6px}' +
      '.seg-chips{display:flex;flex-wrap:wrap;gap:6px}' +
      '.seg-chip{border:1px solid var(--border-soft);background:var(--surface);border-radius:9999px;padding:4px 12px;font-size:12.5px;color:var(--fg-2);cursor:pointer;min-height:30px;font-family:inherit}' +
      '.seg-chip[aria-pressed="true"]{background:var(--fg);color:var(--surface);border-color:var(--fg)}' +
      '.seg-num{width:76px;border:1px solid var(--border-soft);border-radius:8px;padding:5px 8px;font-size:13px;font-family:inherit;background:var(--surface);color:var(--fg);min-height:32px}' +
      '.seg-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:13px;color:var(--fg-2)}' +
      '.seg-lock{font-size:10.5px;background:rgba(181,51,51,.08);color:var(--danger);border-radius:9999px;padding:2px 8px}' +
      '.seg-count{font-size:34px;font-weight:600;font-variant-numeric:tabular-nums;letter-spacing:-.5px}' +
      '.seg-count small{font-size:13px;color:var(--meta);font-weight:400;margin-left:4px}' +
      '.seg-actions{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}' +
      '.seg-save-inline{display:inline-flex;align-items:center;gap:6px}' +
      '.seg-btn{display:inline-flex;align-items:center;gap:6px;border:none;cursor:pointer;border-radius:8px;font-size:13.5px;padding:8px 14px;min-height:38px;background:var(--surface-warm);color:var(--fg-2);box-shadow:0 0 0 1px #d1cfc5;font-family:inherit}' +
      '.seg-btn:hover{background:#e0ddd1}' +
      '.seg-btn.primary{background:var(--accent);color:var(--accent-on);box-shadow:0 0 0 1px var(--accent)}' +
      '.seg-btn.primary:hover{background:var(--accent-hover)}' +
      '.seg-table{width:100%;border-collapse:collapse;font-size:13px}' +
      '.seg-table th{text-align:left;color:var(--meta);font-weight:500;padding:8px 10px;border-bottom:1px solid var(--border-soft);white-space:nowrap}' +
      '.seg-table td{padding:8px 10px;border-bottom:1px solid var(--border-soft);white-space:nowrap}' +
      '.seg-table tr.mrow{cursor:pointer}' +
      '.seg-table tr.mrow:hover{background:var(--surface-warm)}' +
      '.seg-saved{margin-top:16px}' +
      '.seg-seg{display:flex;justify-content:space-between;gap:10px;align-items:center;padding:10px 0;border-bottom:1px solid var(--border-soft);flex-wrap:wrap}' +
      '.seg-seg:last-child{border-bottom:none}' +
      '.seg-seg .sn{font-weight:500;font-size:14px}' +
      '.seg-seg .sc{color:var(--meta);font-size:12px;max-width:420px}' +
      '.seg-modal{position:fixed;inset:0;background:rgba(30,28,24,.4);display:none;align-items:center;justify-content:center;z-index:8000;padding:16px}' +
      '.seg-modal.show{display:flex}' +
      '.seg-modal .box{background:var(--surface);border-radius:16px;padding:24px;max-width:560px;width:100%;max-height:86vh;overflow:auto}' +
      '.seg-modal h3{font-family:var(--font-display);font-weight:500;font-size:20px;margin-bottom:10px}' +
      '.seg-modal label{font-size:13px;color:var(--muted);display:block;margin:12px 0 4px}' +
      '.seg-modal input[type=text]{width:100%;border:1px solid var(--border-soft);border-radius:8px;padding:8px 10px;font-size:14px;font-family:inherit;background:var(--surface);color:var(--fg)}' +
      '.seg-modal select{width:100%;border:1px solid var(--border-soft);border-radius:8px;padding:8px 10px;font-size:14px;font-family:inherit;background:var(--surface);color:var(--fg);min-height:38px}' +
      '.seg-modal .box{position:relative}' +
      '.seg-modal-close{position:absolute;top:16px;right:16px;border:none;background:transparent;cursor:pointer;font-size:15px;color:var(--muted);min-width:32px;min-height:32px;border-radius:8px;font-family:inherit}' +
      '.seg-modal-close:hover{background:var(--surface-warm);color:var(--fg)}' +
      '.seg-hint{color:var(--meta);font-size:12.5px}' +
      '.seg-handoff-chip{display:inline-flex;align-items:center;gap:6px;background:rgba(201,100,66,.12);color:var(--accent);border-radius:9999px;padding:5px 12px;font-size:12.5px;font-weight:500}';
    document.head.appendChild(st);
  }

  /* ── 掛載 ── */
  function mount(host) {
    injectCss();
    var DB = CRM.load();
    if (!pool) pool = buildPool(DB);
    var cond = emptyCond();

    /* 活動頁移交接收（REQ-SEG-006／REQ-ACT-022）：讀取 activity.html 寫入之預帶條件，套用後立即清除該 key，避免重整頁面重複套用 */
    var handoff = null;
    try {
      var hRaw = localStorage.getItem('crm-seg-handoff');
      if (hRaw) {
        var hParsed = JSON.parse(hRaw);
        if (hParsed && hParsed.source === 'activity') handoff = hParsed;
      }
    } catch (e) { /* 壞資料忽略 */ }
    if (handoff) {
      if (handoff.activityId) cond.actActivity = handoff.activityId;
      if (handoff.identity) cond.identity = [handoff.identity];
      localStorage.removeItem('crm-seg-handoff');
    }

    var branches = [];
    Object.keys(DB.branchRegions).forEach(function (rg) {
      DB.branchRegions[rg].forEach(function (b) { branches.push({ name: b, region: rg }); });
    });
    /* 行政區選項（REQ-SEG-001）：取自 DB.distribution（承接任務分布圖同一字典），原型示範資料僅涵蓋雙北 */
    var allDistricts = [];
    Object.keys(DB.distribution || {}).forEach(function (city) {
      (DB.distribution[city] || []).forEach(function (o) { allDistricts.push(o.d); });
    });

    function chips(key, values, labels) {
      return '<div class="seg-chips">' + values.map(function (v, i) {
        return '<button type="button" class="seg-chip" data-k="' + key + '" data-v="' + v + '" aria-pressed="' + (cond[key].indexOf(v) >= 0) + '">' + (labels ? labels[i] : v) + '</button>';
      }).join('') + '</div>';
    }

    /* 活動 select 選項（REQ-ACT-015／REQ-SEG-004：進行中活動優先排前＋末項為新建活動） */
    function activityOptions() {
      var today = DB.meta.dataAsOf;
      var acts = (DB.activities || []).map(function (a) { return { a: a, ongoing: a.end > today }; });
      acts.sort(function (x, y) { if (x.ongoing !== y.ongoing) return x.ongoing ? -1 : 1; return 0; });
      return acts.map(function (o) {
        return '<option value="' + o.a.id + '">' + o.a.name + (o.ongoing ? '（進行中）' : '') + '</option>';
      }).join('') + '<option value="__new__">＋新建活動（帶入後至隊員活動頁完成主檔設定）</option>';
    }

    /* 指定活動任務增長比例之活動下拉（REQ-SEG-006③：限單一指定活動，不含「新建活動」選項） */
    function growthActivityOptions() {
      return (DB.activities || []).map(function (a) {
        return '<option value="' + a.id + '"' + (cond.actActivity === a.id ? ' selected' : '') + '>' + a.name + '</option>';
      }).join('');
    }

    host.innerHTML =
      '<div class="seg-row" style="margin-top:14px">' +
        '<button type="button" class="seg-btn" id="seg-demo">一鍵帶入示例條件（雙北＋晚尖峰 ≥11 天＋曾參與活動）</button>' +
        '<button type="button" class="seg-btn" id="seg-clear">清除全部條件</button>' +
        '<span class="seg-hint">' + '條件之間 AND、同欄位多值 OR（REQ-SEG-001）　' + CRM.infoIcon('條件涵蓋 Profile 維度；結果即時重算。儲存的名單條件（segment）再次執行時以最新匯入資料重新計算') + '</span>' +
      '</div>' +
      '<div class="seg-wrap">' +
        '<div>' +
          '<div class="seg-panel" id="seg-panel">' +
            '<div class="seg-title">篩選條件</div>' +
            '<div class="seg-g"><div class="gl">身份別</div>' + chips('identity', ['小黃', '多元', '多元試跑']) + '</div>' +
            '<div class="seg-g"><div class="gl">車隊地區 ' + CRM.infoIcon('雙北＝車隊地區「台北」（依車隊→地區對照表，REQ-SET-007）') + '</div>' + chips('branchRegion', ['台北', '桃園', '宜蘭'], ['台北（雙北）', '桃園', '宜蘭']) + '</div>' +
            '<div class="seg-g"><div class="gl">車隊（可複選）</div><div class="seg-row"><select id="seg-branch" class="seg-num" style="width:auto;min-width:180px"><option value="">＋ 加入車隊…</option>' +
              Object.keys(DB.branchRegions).map(function (rg) {
                return '<optgroup label="' + rg + '">' + DB.branchRegions[rg].map(function (b) { return '<option>' + b + '</option>'; }).join('') + '</optgroup>';
              }).join('') + '</select></div><div class="seg-chips" id="seg-branch-chips" style="margin-top:6px"></div></div>' +
            '<div class="seg-g"><div class="gl">縣市 ' + CRM.infoIcon('縣市值依近 90 天完成任務上車行政區換算（資料源 task_stats_member，REQ-SEG-001）；原型示範資料僅雙北隊員具行政區細節，桃園／宜蘭隊員縣市維持車隊地區直接對應') + '</div>' + chips('region', ['台北市', '新北市', '桃園市', '宜蘭縣']) + '</div>' +
            '<div class="seg-g"><div class="gl">行政區 ' + CRM.infoIcon('行政區選項對齊承接任務分布圖字典（目前僅涵蓋雙北）；與縣市為 AND 條件，可疊加篩選') + '</div>' + chips('district', allDistricts) + '</div>' +
            '<div class="seg-g"><div class="gl">車組（多值標籤）</div>' + chips('tags', TAGS) + '</div>' +
            '<div class="seg-g"><div class="gl">車款</div>' + chips('car', CARS) + '</div>' +
            '<div class="seg-g"><div class="gl">上線天數（上個月，級距）</div>' + chips('bucket', ['0', '1-10', '11-20', '21+'], ['0 天', '1~10 天', '11~20 天', '21 天以上']) + '</div>' +
            '<div class="seg-g"><div class="gl">早／晚尖峰上線天數（最近 30 天）</div><div class="seg-row">早 ≥ <input type="number" min="0" max="31" class="seg-num" id="seg-morn">　晚 ≥ <input type="number" min="0" max="31" class="seg-num" id="seg-eve"> 天</div></div>' +
            '<div class="seg-g"><div class="gl">歷史承接率區間（最近 90 天）' + CRM.infoIcon('承接率（統一口徑）＝Σ承接任務 ÷ Σ任務數（排除別人已承接）；資料源 driver_inquiry_stats（司機任務詢問統計），取最近 90 天') + '</div><div class="seg-row"><input type="number" min="0" max="100" class="seg-num" id="seg-armin"> % ~ <input type="number" min="0" max="100" class="seg-num" id="seg-armax"> %</div></div>' +
            '<div class="seg-g"><div class="gl">是否曾參與活動</div>' +
              '<div class="seg-chips">' +
              [['', '不限'], ['yes', '是'], ['no', '否']].map(function (o) {
                return '<button type="button" class="seg-chip" data-joined="' + o[0] + '" aria-pressed="' + (cond.joined === o[0]) + '">' + o[1] + '</button>';
              }).join('') + '</div></div>' +
            '<div class="seg-g"><div class="gl">參與活動類型</div>' + chips('actTypes', ACT_TYPES) + '</div>' +
            '<div class="seg-g"><div class="gl">歷史每月承接任務數（趟）' + CRM.infoIcon('最近 12 個月承接任務總數 ÷ 12（例：156 趟/月）；承接任務取自 driver_inquiry_stats「承接任務」欄（accepted_count），與承接率分子同源') + '</div><div class="seg-row"><input type="number" min="0" class="seg-num" id="seg-mtmin"> ~ <input type="number" min="0" class="seg-num" id="seg-mtmax"></div></div>' +
            '<div class="seg-g"><div class="gl">不願承接任務的原因 <span class="seg-lock">需 callrecord.view_all</span> ' + CRM.infoIcon('客服回覆值條件需 callrecord.view_all 權限（REQ-SEG-005，防繞過客服外撥 scope）；原型以已授權視角展示') + '</div>' + chips('reasons', REASONS) + '</div>' +
            '<div class="seg-g"><div class="gl">活動成效 ' + CRM.infoIcon('與「是否曾參與活動」為 AND 各自獨立生效，口徑差異：曾參與＝TA 名單命中（含分群圈選僅入名單、未必實際參加）；參加＝實際參加該活動（REQ-SEG-006）') + '</div>' +
              '<div class="seg-chips" id="seg-handoff-chip" style="margin-bottom:8px"></div>' +
              '<div class="seg-row" style="margin-bottom:8px">參加活動次數 ≥ <input type="number" min="0" class="seg-num" id="seg-actcount" value="' + cond.actCountMin + '"> 次 ' + CRM.infoIcon('參加＝實際參加該活動（合併後 TA：報名匯入＋結算補入，SR-RT-140）；僅被分群圈選、未實際參加者不計') + '</div>' +
              '<div class="seg-row" style="margin-bottom:8px">跨活動達標率 ≥ <input type="number" min="0" max="100" class="seg-num" id="seg-actgoal" value="' + cond.actGoalMin + '"> % ' + CRM.infoIcon('＝整檔達標活動數÷實際參加活動數；分母僅計「已有任一結算批次」之活動，尚未開始結算之活動排除於分子與分母（REQ-SEG-006②／REQ-ACT-017）') + '</div>' +
              '<div class="seg-row" style="margin-bottom:6px">指定活動任務增長比例 ' + CRM.infoIcon('限單一指定活動——不同活動之成效計算時段互異，跨活動增長不可加總或平均；前期任務數為 0 者除零無意義、不落入任何比例區間，請改用「含新增/重啟」獨立勾選（REQ-SEG-006③，口徑對齊 REQ-ACT-014 重新啟動）') + '</div>' +
              '<div class="seg-row" style="margin-bottom:6px"><select id="seg-act-growth-select" class="seg-num" style="width:auto;min-width:180px"><option value="">不限（先選活動）</option>' + growthActivityOptions() + '</select></div>' +
              '<div class="seg-row"><input type="number" class="seg-num" id="seg-actgrowmin" value="' + cond.actGrowthMin + '"> % ~ <input type="number" class="seg-num" id="seg-actgrowmax" value="' + cond.actGrowthMax + '"> %　' +
                '<label style="display:inline-flex;align-items:center;gap:5px;font-size:13px;color:var(--fg-2)"><input type="checkbox" id="seg-actgrownew"' + (cond.actIncludeNew ? ' checked' : '') + '> 含新增/重啟（前期 0 任務）</label></div>' +
            '</div>' +
          '</div>' +
          '<div class="seg-saved"><div class="seg-title">已儲存名單條件（segment）' + CRM.infoIcon('REQ-SEG-003：條件組合可命名儲存重複使用；執行時以最新匯入資料重新計算') + '</div><div id="seg-seglist"></div></div>' +
        '</div>' +
        '<div class="seg-res">' +
          '<div class="seg-title">篩選結果 <span class="seg-hint" id="seg-cond-sum"></span></div>' +
          '<div class="seg-count"><span id="seg-count">0</span><small>人符合（以最新匯入資料計算・資料截至 ' + DB.meta.dataAsOf + '）</small></div>' +
          '<div class="seg-actions">' +
            '<button type="button" class="seg-btn primary" id="seg-to-call">帶入外撥專案</button>' +
            '<button type="button" class="seg-btn primary" id="seg-to-act">帶入活動 TA</button>' +
            '<button type="button" class="seg-btn" id="seg-save">儲存為名單條件</button>' +
            '<span class="seg-save-inline" id="seg-save-inline" style="display:none">' +
              '<input type="text" id="seg-save-name" class="seg-num" style="width:220px" aria-label="名單條件名稱">' +
              '<button type="button" class="seg-btn primary" id="seg-save-confirm">確認</button>' +
              '<button type="button" class="seg-btn" id="seg-save-cancel">取消</button>' +
            '</span>' +
            '<button type="button" class="seg-btn" id="seg-export">匯出名單（活動報名用）</button>' +
          '</div>' +
          '<div class="chart-wrap" style="overflow-x:auto"><table class="seg-table"><thead><tr id="seg-thead"></tr></thead><tbody id="seg-rows"></tbody></table></div>' +
          '<p class="seg-hint" id="seg-more" style="margin-top:8px"></p>' +
        '</div>' +
      '</div>' +
      '<div class="seg-modal" id="seg-modal" role="dialog" aria-modal="true" aria-label="帶入外撥專案">' +
        '<div class="box"><h3>帶入外撥專案</h3>' +
        '<p class="seg-hint">篩選結果將整批帶入新外撥專案之名單——僅帶隊編＋姓名；行動電話非批次可得資訊，為外撥專案之保留欄位、由客服撥打作業時填寫（REQ-SEG-004）。確認後將直接前往客服外撥頁面。</p>' +
        '<label for="seg-pname">專案名稱</label><input type="text" id="seg-pname">' +
        '<label>名單筆數</label><div style="font-size:22px;font-weight:600" id="seg-pcount"></div>' +
        '<label>名單預覽（前 5 筆）</label><div class="chart-wrap" style="overflow-x:auto"><table class="seg-table"><thead><tr><th>隊編</th><th>姓名</th><th>行動電話（保留欄位）</th></tr></thead><tbody id="seg-preview"></tbody></table></div>' +
        '<div class="seg-actions" style="margin-top:16px"><button type="button" class="seg-btn primary" id="seg-pok">建立專案並前往客服外撥</button><button type="button" class="seg-btn" id="seg-pcancel">取消</button></div>' +
        '</div></div>' +
      '<div class="seg-modal" id="seg-act-modal" role="dialog" aria-modal="true" aria-label="帶入活動 TA 名單">' +
        '<div class="box">' +
        '<button type="button" class="seg-modal-close" id="seg-act-x" aria-label="關閉">✕</button>' +
        '<h3>帶入活動 TA 名單</h3>' +
        '<p class="seg-hint">將帶入 <strong id="seg-act-count">0</strong> 人（僅隊編＋姓名，來源標記：分群圈選）。確認後將直接前往隊員活動頁。</p>' +
        '<label for="seg-act-select">選擇活動</label><select id="seg-act-select">' + activityOptions() + '</select>' +
        '<p class="seg-hint" style="margin-top:12px">正式報名名冊匯入後將以隊編自動合併（來源標記：報名匯入）</p>' +
        '<div class="seg-actions" style="margin-top:16px"><button type="button" class="seg-btn primary" id="seg-act-confirm">確認帶入</button><button type="button" class="seg-btn" id="seg-act-cancel">取消</button></div>' +
        '</div></div>';

    /* 移交提示 chips（活動頁下鑽帶入，REQ-ACT-022）：讀取時已套用預設值，此處僅顯示來源說明 */
    if (handoff) {
      var hoParts = ['來自活動：' + (handoff.activityName || handoff.activityId || '—')];
      if (handoff.week) hoParts.push('第' + handoff.week + '週');
      if (handoff.tier) hoParts.push('級距' + handoff.tier);
      document.getElementById('seg-handoff-chip').innerHTML =
        '<span class="seg-handoff-chip">' + hoParts.join('・') + '</span>' +
        '<span class="seg-hint">已套用對應預設值（活動／身份別，如適用）</span>';
    }

    /* 結果欄位動態附加（REQ-SEG-002）：基礎欄固定（隊編/姓名/身份別/車隊/縣市），
       其餘欄視對應篩選條件是否勾選才附加顯示——條件相關欄位才進表，避免固定一堆用不到的欄位 */
    var RESULT_COLS = [
      { label: '隊編', base: true, get: function (m) { return m.code; } },
      { label: '姓名（去識別化）', base: true, get: function (m) { return CRM.maskName(m.name); } },
      { label: '身份別', base: true, get: function (m) { return m.identity; } },
      { label: '車隊', base: true, get: function (m) { return m.branch; } },
      { label: '縣市', base: true, get: function (m) { return m.region; } },
      { label: '行政區', active: function (c) { return c.district.length > 0; }, get: function (m) { return m.district || '—'; } },
      { label: '車組', active: function (c) { return c.tags.length > 0; }, get: function (m) { return m.fleetGroups.join('、'); } },
      { label: '車款', active: function (c) { return c.car.length > 0; }, get: function (m) { return m.carModel; } },
      { label: '上月上線', active: function (c) { return c.bucket.length > 0; }, get: function (m) { return m.monthOnline + ' 天'; } },
      { label: '早尖峰', active: function (c) { return c.mornMin !== ''; }, get: function (m) { return m.mornPeak + ' 天'; } },
      { label: '晚尖峰', active: function (c) { return c.eveMin !== ''; }, get: function (m) { return m.evePeak + ' 天'; } },
      { label: '承接率', active: function (c) { return c.arMin !== '' || c.arMax !== ''; }, get: function (m) { return m.acceptRate + '%'; } },
      { label: '曾參與', active: function (c) { return c.joined !== ''; }, get: function (m) { return m.joined ? '是' : '否'; } },
      { label: '活動類型', active: function (c) { return c.actTypes.length > 0; }, get: function (m) { return m.actTypes.length ? m.actTypes.join('、') : '—'; } },
      { label: '月承接', active: function (c) { return c.mtMin !== '' || c.mtMax !== ''; }, get: function (m) { return m.monthlyTasks + ' 趟'; } },
      { label: '不願承接原因', active: function (c) { return c.reasons.length > 0; }, get: function (m) { return m.refuseReasons.length ? m.refuseReasons.join('、') : '—'; } },
      { label: '參加次數', active: function (c) { return c.actCountMin !== ''; }, get: function (m) { return m.actCount + ' 次'; } },
      { label: '跨活動達標率', active: function (c) { return c.actGoalMin !== ''; }, get: function (m) { return m.actGoalRate === null ? '—' : m.actGoalRate + '%'; } },
      { label: '任務增長', active: function (c) { return c.actActivity !== ''; }, get: function (m) { return m.actIsNewOrRestart ? '新增/重啟' : (m.actGrowth + '%'); } }
    ];

    var result = [];
    function recompute() {
      result = pool.filter(function (m) { return match(m, cond); });
      document.getElementById('seg-count').textContent = CRM.fmt(result.length);
      document.getElementById('seg-cond-sum').textContent = condSummary(cond, DB);
      var activeCols = RESULT_COLS.filter(function (col) { return col.base || col.active(cond); });
      document.getElementById('seg-thead').innerHTML = activeCols.map(function (col) { return '<th>' + col.label + '</th>'; }).join('');
      var rows = result.slice(0, 50).map(function (m) {
        return '<tr class="mrow" data-code="' + m.code + '" tabindex="0" aria-label="檢視隊編 ' + m.code + ' 的 Profile">' +
          activeCols.map(function (col) { return '<td>' + col.get(m) + '</td>'; }).join('') + '</tr>';
      }).join('');
      document.getElementById('seg-rows').innerHTML = rows || ('<tr><td colspan="' + activeCols.length + '" style="color:var(--meta)">無符合條件之隊員（調整條件試試）</td></tr>');
      document.getElementById('seg-more').textContent = result.length > 50 ? '共 ' + CRM.fmt(result.length) + ' 人，清單示意前 50 筆；正式版為分頁完整清單。點任一列可進入該隊員 Profile。' : (result.length ? '點任一列可進入該隊員 Profile。' : '');
      host.querySelectorAll('.mrow').forEach(function (tr) {
        tr.addEventListener('click', function () { location.href = 'profile.html?m=' + encodeURIComponent(tr.dataset.code); });
        tr.addEventListener('keydown', function (e) { if (e.key === 'Enter') location.href = 'profile.html?m=' + encodeURIComponent(tr.dataset.code); });
      });
    }

    function paintChips() {
      host.querySelectorAll('.seg-chip[data-k]').forEach(function (b) {
        b.setAttribute('aria-pressed', String(cond[b.dataset.k].indexOf(b.dataset.v) >= 0));
      });
      host.querySelectorAll('.seg-chip[data-joined]').forEach(function (b) {
        b.setAttribute('aria-pressed', String(cond.joined === b.dataset.joined));
      });
      document.getElementById('seg-branch-chips').innerHTML = cond.branch.map(function (b) {
        return '<button type="button" class="seg-chip" data-rmbranch="' + b + '" aria-pressed="true">' + b + ' ×</button>';
      }).join('');
      host.querySelectorAll('[data-rmbranch]').forEach(function (b) {
        b.addEventListener('click', function () {
          cond.branch = cond.branch.filter(function (x) { return x !== b.dataset.rmbranch; });
          paintChips(); recompute();
        });
      });
    }

    /* 事件 */
    host.querySelectorAll('.seg-chip[data-k]').forEach(function (b) {
      b.addEventListener('click', function () {
        var arr = cond[b.dataset.k], i = arr.indexOf(b.dataset.v);
        if (i >= 0) arr.splice(i, 1); else arr.push(b.dataset.v);
        paintChips(); recompute();
      });
    });
    host.querySelectorAll('.seg-chip[data-joined]').forEach(function (b) {
      b.addEventListener('click', function () { cond.joined = b.dataset.joined; paintChips(); recompute(); });
    });
    document.getElementById('seg-branch').addEventListener('change', function () {
      if (this.value && cond.branch.indexOf(this.value) < 0) cond.branch.push(this.value);
      this.value = '';
      paintChips(); recompute();
    });
    [['seg-morn', 'mornMin'], ['seg-eve', 'eveMin'], ['seg-armin', 'arMin'], ['seg-armax', 'arMax'], ['seg-mtmin', 'mtMin'], ['seg-mtmax', 'mtMax'],
     ['seg-actcount', 'actCountMin'], ['seg-actgoal', 'actGoalMin'], ['seg-actgrowmin', 'actGrowthMin'], ['seg-actgrowmax', 'actGrowthMax']].forEach(function (p) {
      document.getElementById(p[0]).addEventListener('input', function () { cond[p[1]] = this.value; recompute(); });
    });
    document.getElementById('seg-act-growth-select').addEventListener('change', function () { cond.actActivity = this.value; recompute(); });
    document.getElementById('seg-actgrownew').addEventListener('change', function () { cond.actIncludeNew = this.checked; recompute(); });
    document.getElementById('seg-clear').addEventListener('click', function () {
      cond = emptyCond();
      ['seg-morn', 'seg-eve', 'seg-armin', 'seg-armax', 'seg-mtmin', 'seg-mtmax', 'seg-actcount', 'seg-actgoal', 'seg-actgrowmin', 'seg-actgrowmax'].forEach(function (id) { document.getElementById(id).value = ''; });
      document.getElementById('seg-act-growth-select').value = '';
      document.getElementById('seg-actgrownew').checked = false;
      paintChips(); recompute();
    });
    document.getElementById('seg-demo').addEventListener('click', function () {
      // REQ-E2E-012 示例：雙北＋晚尖峰上線 ≥11 天＋曾參與活動
      cond = emptyCond();
      cond.branchRegion = ['台北'];
      cond.joined = 'yes';
      document.getElementById('seg-eve').value = '11';
      cond.eveMin = '11';
      ['seg-morn', 'seg-armin', 'seg-armax', 'seg-mtmin', 'seg-mtmax', 'seg-actcount', 'seg-actgoal', 'seg-actgrowmin', 'seg-actgrowmax'].forEach(function (id) { document.getElementById(id).value = ''; });
      document.getElementById('seg-act-growth-select').value = '';
      document.getElementById('seg-actgrownew').checked = false;
      paintChips(); recompute();
      CRM.toast('已帶入 REQ-E2E-012 示例條件');
    });

    /* segment 儲存／執行／刪除（REQ-SEG-003） */
    function renderSegs() {
      var segs = loadSegs();
      document.getElementById('seg-seglist').innerHTML = segs.length ? segs.map(function (sg, i) {
        return '<div class="seg-seg"><div><div class="sn">' + sg.name + '</div><div class="sc">' + sg.summary + '</div></div>' +
          '<div class="seg-row"><button type="button" class="seg-btn" data-run="' + i + '">執行（以最新資料重算）</button><button type="button" class="seg-btn" data-del="' + i + '" aria-label="刪除 ' + sg.name + '">刪除</button></div></div>';
      }).join('') : '<p class="seg-hint">尚無儲存的名單條件。設定條件後點「儲存為名單條件」。</p>';
      host.querySelectorAll('[data-run]').forEach(function (b) {
        b.addEventListener('click', function () {
          var sg = loadSegs()[Number(b.dataset.run)];
          cond = withDefaults(sg.cond); // 相容舊版名單條件（無活動成效欄位時補預設值）
          ['seg-morn|mornMin', 'seg-eve|eveMin', 'seg-armin|arMin', 'seg-armax|arMax', 'seg-mtmin|mtMin', 'seg-mtmax|mtMax',
           'seg-actcount|actCountMin', 'seg-actgoal|actGoalMin', 'seg-actgrowmin|actGrowthMin', 'seg-actgrowmax|actGrowthMax'].forEach(function (p) {
            var q = p.split('|'); document.getElementById(q[0]).value = cond[q[1]];
          });
          document.getElementById('seg-act-growth-select').value = cond.actActivity || '';
          document.getElementById('seg-actgrownew').checked = !!cond.actIncludeNew;
          paintChips(); recompute();
          CRM.toast('已以最新匯入資料重新計算「' + sg.name + '」');
        });
      });
      host.querySelectorAll('[data-del]').forEach(function (b) {
        b.addEventListener('click', function () {
          var segs2 = loadSegs(); segs2.splice(Number(b.dataset.del), 1); saveSegs(segs2); renderSegs();
        });
      });
    }

    /* 儲存為名單條件：行內命名輸入（REQ-SEG-002）——不用 window.prompt（阻塞式對話框擋走查自動化），
       改在按鈕旁顯示行內輸入框＋確認/取消，預設值＝自動產生名，使用者可改 */
    var saveBtn = document.getElementById('seg-save');
    var saveInline = document.getElementById('seg-save-inline');
    var saveNameInput = document.getElementById('seg-save-name');
    function autoSegName() { return '名單條件 ' + (loadSegs().length + 1) + '（' + CRM.fmt(result.length) + ' 人）'; }
    function closeSaveInline() { saveInline.style.display = 'none'; saveBtn.style.display = ''; }
    saveBtn.addEventListener('click', function () {
      saveNameInput.value = autoSegName();
      saveBtn.style.display = 'none';
      saveInline.style.display = 'inline-flex';
      saveNameInput.focus();
      saveNameInput.select();
    });
    document.getElementById('seg-save-cancel').addEventListener('click', closeSaveInline);
    document.getElementById('seg-save-confirm').addEventListener('click', function () {
      var segs = loadSegs();
      var name = saveNameInput.value.trim() || autoSegName();
      segs.push({ name: name, summary: condSummary(cond, DB), cond: JSON.parse(JSON.stringify(cond)) });
      saveSegs(segs); renderSegs();
      closeSaveInline();
      CRM.toast('已儲存「' + name + '」');
    });
    saveNameInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); document.getElementById('seg-save-confirm').click(); }
      else if (e.key === 'Escape') { e.stopPropagation(); closeSaveInline(); }
    });

    /* 帶入外撥專案（REQ-SEG-004、REQ-E2E-012 步驟 3）：真動作——寫 localStorage["crm-cs-bringin"]＝{name, rows:[{code,name}]}＋導頁 callcenter.html */
    function defaultBringinName() { return '分群名單 ' + ((DB.meta && DB.meta.dataAsOf) ? DB.meta.dataAsOf.slice(0, 7) : ''); }
    var modal = document.getElementById('seg-modal');
    document.getElementById('seg-to-call').addEventListener('click', function () {
      if (!result.length) { CRM.toast('目前 0 人符合，請先設定條件'); return; }
      document.getElementById('seg-pname').value = defaultBringinName();
      document.getElementById('seg-pcount').textContent = CRM.fmt(result.length) + ' 筆（＝篩選結果數）';
      document.getElementById('seg-preview').innerHTML = result.slice(0, 5).map(function (m) {
        return '<tr><td>' + m.code + '</td><td>' + CRM.maskName(m.name) + '</td><td style="color:var(--meta)">—（由客服填寫）</td></tr>';
      }).join('');
      modal.classList.add('show');
    });
    document.getElementById('seg-pcancel').addEventListener('click', function () { modal.classList.remove('show'); });
    modal.addEventListener('click', function (e) { if (e.target === modal) modal.classList.remove('show'); });
    document.getElementById('seg-pok').addEventListener('click', function () {
      var name = document.getElementById('seg-pname').value.trim() || defaultBringinName();
      var rows = result.map(function (m) { return { code: m.code, name: m.name }; });
      try { localStorage.setItem('crm-cs-bringin', JSON.stringify({ name: name, rows: rows })); } catch (e) { /* storage 不可用時忽略，仍導頁；客服外撥頁面可重新帶入 */ }
      modal.classList.remove('show');
      location.href = 'callcenter.html';
    });
    document.getElementById('seg-export').addEventListener('click', function () {
      var rows = [['隊編', '姓名', '身份別', '車隊', '縣市']];
      result.forEach(function (m) { rows.push([m.code, m.name, m.identity, m.branch, m.city || '']); });
      CRM.downloadCsv('分群名單_' + (CRM.load().meta.dataAsOf || '') + '.csv', rows, [0]);  // 隊編欄文字化防前導零遺失
      CRM.toast('已下載名單 ' + CRM.fmt(result.length) + ' 筆（匯出依 REQ-GEN-006 寫入審計——原型示意）');
    });

    /* 帶入活動 TA（REQ-ACT-015／REQ-SEG-004：分群篩選帶入活動 TA 名單，來源標記「分群圈選」） */
    var actModal = document.getElementById('seg-act-modal');
    function closeActModal() { actModal.classList.remove('show'); }
    document.getElementById('seg-to-act').addEventListener('click', function () {
      if (!result.length) { CRM.toast('目前 0 人符合，請先設定條件'); return; }
      document.getElementById('seg-act-count').textContent = CRM.fmt(result.length);
      actModal.classList.add('show');
    });
    document.getElementById('seg-act-x').addEventListener('click', closeActModal);
    document.getElementById('seg-act-cancel').addEventListener('click', closeActModal);
    actModal.addEventListener('click', function (e) { if (e.target === actModal) closeActModal(); });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (actModal.classList.contains('show')) closeActModal();
      if (modal.classList.contains('show')) modal.classList.remove('show');
    });
    document.getElementById('seg-act-confirm').addEventListener('click', function () {
      var sel = document.getElementById('seg-act-select');
      var actId = sel.value, actName;
      if (actId === '__new__') {
        actName = '新建活動';
      } else {
        var found = (DB.activities || []).filter(function (a) { return a.id === actId; });
        actName = found.length ? found[0].name : sel.options[sel.selectedIndex].text;
      }
      /* seg→activity 真動作（沿用 crm-seg-handoff 之反向補件，另立 key 避免與既有 activity→seg 方向混用）：
         寫 localStorage["crm-act-ta"]＝{codes:[...], cond:摘要字串}＋導頁 activity.html；activity 端讀取後接手（另一 worker 實作） */
      var codes = result.map(function (m) { return m.code; });
      var condText = '目標活動：' + actName + '｜篩選條件：' + condSummary(cond, DB);
      try { localStorage.setItem('crm-act-ta', JSON.stringify({ codes: codes, cond: condText })); } catch (e) { /* storage 不可用時忽略，仍導頁 */ }
      closeActModal();
      location.href = 'activity.html';
    });

    paintChips(); recompute(); renderSegs();
  }

  /* 活動頁移交接收：以 hash #seg 進入 profile.html 時，先切到「分群篩選」tab（REQ-ACT-022／REQ-SEG-006）；
     實際套用預帶條件與清除 localStorage 於 mount() 內處理。等 DOMContentLoaded 才觸發，
     確保 profile.html 內嵌腳本已完成 .pf-tab click 監聽器綁定（該腳本晚於本檔載入執行）。 */
  document.addEventListener('DOMContentLoaded', function () {
    if (location.hash !== '#seg') return;
    var tab2 = document.getElementById('pf-tab-2');
    if (tab2) tab2.click();
  });

  window.CRMSEG = { mount: mount };
})();
