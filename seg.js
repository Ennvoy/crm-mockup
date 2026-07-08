// PROTOTYPE 分群篩選共用元件（REQ-SEG-001~005、REQ-E2E-012）— build 時換成真 API
// 一份實作、兩個入口掛載：pages/segments.html（獨立子頁）與 profile.html 的「分群篩選」tab
// 用法：CRMSEG.mount(containerEl)

(function () {
  'use strict';

  var SEG_KEY = 'crm55688_segments_v1';   // 已儲存名單條件（segment）

  /* ── 假資料池：2,000 名隊員，deterministic 生成（含 3 名完整假資料隊員） ── */
  var SURNAMES = ['王', '林', '張', '李', '陳', '黃', '吳', '劉', '蔡', '楊'];
  var GIVEN = ['志明', '淑惠', '建宏', '雅婷', '俊傑', '美玲', '文雄', '麗華', '家豪', '怡君'];
  var IDS = ['小黃', '小黃', '小黃', '多元', '多元', '試跑'];
  var TAGS = ['預設', '一般預約', '提供刷卡付款', '提供悠遊卡付款', '提供綁定付款', '敬老愛心_台北', '敬老愛心_新北', '敬老愛心_雙北', '好孕車組', '開行李箱', '攜帶輪椅', '手機充電', '低底盤車', '送餐車組', '短程預約', '專派任務', '乘車券', '國旅卡車組'];
  var CARS = ['RAV4', 'Tesla', 'Altis', '豪華型', '商務型'];
  var EMPLOY = ['在職', '在職', '在職', '在職', '在職', '在職', '在職', '在職', '在職', '在職', '在職', '停權', '離職'];
  var ACT_TYPES = ['獎勵活動', '培訓課程', '車組招募'];
  var REASONS = ['低價', '距離遠', '目的地不符', '時段不合', '車輛保養中'];
  var REGION_OF_BRANCH_REGION = { '台北': ['台北市', '新北市'], '桃園': ['桃園市'], '宜蘭': ['宜蘭縣'] };

  var pool = null;
  function rnd(s, k) { var x = Math.sin((s + k) * 12.9898) * 43758.5453; return x - Math.floor(x); }

  function buildPool(DB) {
    var branches = [];
    Object.keys(DB.branchRegions).forEach(function (rg) {
      DB.branchRegions[rg].forEach(function (b) { branches.push({ name: b, region: rg }); });
    });
    var list = [];
    // 3 名完整假資料隊員（與 Profile 頁一致）
    Object.keys(DB.members).forEach(function (code) {
      var m = DB.members[code];
      list.push({
        code: m.code, name: m.name, identity: m.identity, region: m.region,
        branch: m.branch, branchRegion: '台北', employment: '在職',
        carModel: m.carModel, fleetGroups: m.fleetGroups,
        monthOnline: m.onlineDays.month, mornPeak: m.mornPeakDays, evePeak: m.evePeakDays,
        acceptRate: m.acceptRate, joined: m.joinedActivity, actTypes: m.activityTypes,
        monthlyTasks: m.monthlyTasks, refuseReasons: m.refuseReasons
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
      list.push({
        code: String(10000 + i), name: SURNAMES[Math.floor(rnd(s, 7) * 10)] + GIVEN[Math.floor(rnd(s, 8) * 10)],
        identity: IDS[Math.floor(rnd(s, 9) * IDS.length)],
        region: regions[Math.floor(rnd(s, 10) * regions.length)],
        branch: br.name, branchRegion: br.region,
        employment: EMPLOY[Math.floor(rnd(s, 11) * EMPLOY.length)],
        carModel: CARS[Math.floor(rnd(s, 12) * CARS.length)],
        fleetGroups: tags,
        monthOnline: mo,
        mornPeak: Math.min(mo, Math.floor(rnd(s, 13) * 24)),
        evePeak: Math.min(mo, Math.floor(rnd(s, 14) * 26)),
        acceptRate: Math.floor(5 + rnd(s, 15) * 40),
        joined: joined,
        actTypes: joined ? [ACT_TYPES[Math.floor(rnd(s, 16) * 3)]] : [],
        monthlyTasks: Math.floor(20 + rnd(s, 17) * 180),
        refuseReasons: REASONS.slice(0, nRs)
      });
    }
    return list;
  }
  function phoneOf(m) { return '09' + m.code.slice(-2) + '-***-' + ('00' + m.code).slice(-3); }  // 敏感遮罩（REQ-PROF-007）

  /* ── 篩選條件狀態與判定（AND 跨欄位、OR 同欄位多值，REQ-SEG-001） ── */
  function emptyCond() {
    return { identity: [], region: [], branchRegion: [], branch: [], employment: ['在職'], tags: [], car: [],
      bucket: [], mornMin: '', eveMin: '', arMin: '', arMax: '', joined: '', actTypes: [], mtMin: '', mtMax: '', reasons: [] };
  }
  function bucketOf(d) { return d === 0 ? '0' : (d <= 10 ? '1-10' : (d <= 20 ? '11-20' : '21+')); }
  function match(m, c) {
    if (c.identity.length && c.identity.indexOf(m.identity) < 0) return false;
    if (c.region.length && c.region.indexOf(m.region) < 0) return false;
    if (c.branchRegion.length && c.branchRegion.indexOf(m.branchRegion) < 0) return false;
    if (c.branch.length && c.branch.indexOf(m.branch) < 0) return false;
    if (c.employment.length && c.employment.indexOf(m.employment) < 0) return false;
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
    return true;
  }
  function condSummary(c) {
    var p = [];
    if (c.identity.length) p.push(c.identity.join('/'));
    if (c.branchRegion.length) p.push('車隊地區 ' + c.branchRegion.map(function (r) { return r === '台北' ? '台北（雙北）' : r; }).join('/'));
    if (c.branch.length) p.push('車隊 ' + c.branch.join('/'));
    if (c.region.length) p.push(c.region.join('/'));
    if (c.employment.length && c.employment.join() !== '在職') p.push(c.employment.join('/'));
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
      '.seg-hint{color:var(--meta);font-size:12.5px}';
    document.head.appendChild(st);
  }

  /* ── 掛載 ── */
  function mount(host) {
    injectCss();
    var DB = CRM.load();
    if (!pool) pool = buildPool(DB);
    var cond = emptyCond();
    var branches = [];
    Object.keys(DB.branchRegions).forEach(function (rg) {
      DB.branchRegions[rg].forEach(function (b) { branches.push({ name: b, region: rg }); });
    });

    function chips(key, values, labels) {
      return '<div class="seg-chips">' + values.map(function (v, i) {
        return '<button type="button" class="seg-chip" data-k="' + key + '" data-v="' + v + '" aria-pressed="' + (cond[key].indexOf(v) >= 0) + '">' + (labels ? labels[i] : v) + '</button>';
      }).join('') + '</div>';
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
            '<div class="seg-g"><div class="gl">身份別</div>' + chips('identity', ['小黃', '多元', '試跑']) + '</div>' +
            '<div class="seg-g"><div class="gl">車隊地區 ' + CRM.infoIcon('雙北＝車隊地區「台北」（依車隊→地區對照表，REQ-SET-007）') + '</div>' + chips('branchRegion', ['台北', '桃園', '宜蘭'], ['台北（雙北）', '桃園', '宜蘭']) + '</div>' +
            '<div class="seg-g"><div class="gl">車隊（可複選）</div><div class="seg-row"><select id="seg-branch" class="seg-num" style="width:auto;min-width:180px"><option value="">＋ 加入車隊…</option>' +
              Object.keys(DB.branchRegions).map(function (rg) {
                return '<optgroup label="' + rg + '">' + DB.branchRegions[rg].map(function (b) { return '<option>' + b + '</option>'; }).join('') + '</optgroup>';
              }).join('') + '</select></div><div class="seg-chips" id="seg-branch-chips" style="margin-top:6px"></div></div>' +
            '<div class="seg-g"><div class="gl">縣市</div>' + chips('region', ['台北市', '新北市', '桃園市', '宜蘭縣']) + '</div>' +
            '<div class="seg-g"><div class="gl">在職狀態</div>' + chips('employment', ['在職', '停權', '離職']) + '</div>' +
            '<div class="seg-g"><div class="gl">車組（多值標籤）</div>' + chips('tags', TAGS) + '</div>' +
            '<div class="seg-g"><div class="gl">車款</div>' + chips('car', CARS) + '</div>' +
            '<div class="seg-g"><div class="gl">上線天數（上個月，級距）</div>' + chips('bucket', ['0', '1-10', '11-20', '21+'], ['0 天', '1~10 天', '11~20 天', '21 天以上']) + '</div>' +
            '<div class="seg-g"><div class="gl">早／晚尖峰上線天數（最近 30 天）</div><div class="seg-row">早 ≥ <input type="number" min="0" max="31" class="seg-num" id="seg-morn">　晚 ≥ <input type="number" min="0" max="31" class="seg-num" id="seg-eve"> 天</div></div>' +
            '<div class="seg-g"><div class="gl">歷史承接率區間（最近 90 天）</div><div class="seg-row"><input type="number" min="0" max="100" class="seg-num" id="seg-armin"> % ~ <input type="number" min="0" max="100" class="seg-num" id="seg-armax"> %</div></div>' +
            '<div class="seg-g"><div class="gl">是否曾參與活動</div>' +
              '<div class="seg-chips">' +
              [['', '不限'], ['yes', '是'], ['no', '否']].map(function (o) {
                return '<button type="button" class="seg-chip" data-joined="' + o[0] + '" aria-pressed="' + (cond.joined === o[0]) + '">' + o[1] + '</button>';
              }).join('') + '</div></div>' +
            '<div class="seg-g"><div class="gl">參與活動類型</div>' + chips('actTypes', ACT_TYPES) + '</div>' +
            '<div class="seg-g"><div class="gl">歷史每月承接任務數（趟）</div><div class="seg-row"><input type="number" min="0" class="seg-num" id="seg-mtmin"> ~ <input type="number" min="0" class="seg-num" id="seg-mtmax"></div></div>' +
            '<div class="seg-g"><div class="gl">不願承接任務的原因 <span class="seg-lock">需 callrecord.view_all</span> ' + CRM.infoIcon('客服回覆值條件需 callrecord.view_all 權限（REQ-SEG-005，防繞過客服紀錄 scope）；原型以已授權視角展示') + '</div>' + chips('reasons', REASONS) + '</div>' +
          '</div>' +
          '<div class="seg-saved"><div class="seg-title">已儲存名單條件（segment）' + CRM.infoIcon('REQ-SEG-003：條件組合可命名儲存重複使用；執行時以最新匯入資料重新計算') + '</div><div id="seg-seglist"></div></div>' +
        '</div>' +
        '<div class="seg-res">' +
          '<div class="seg-title">篩選結果 <span class="seg-hint" id="seg-cond-sum"></span></div>' +
          '<div class="seg-count"><span id="seg-count">0</span><small>人符合（以最新匯入資料計算・資料截至 ' + DB.meta.dataAsOf + '）</small></div>' +
          '<div class="seg-actions">' +
            '<button type="button" class="seg-btn primary" id="seg-to-call">帶入外撥專案</button>' +
            '<button type="button" class="seg-btn" id="seg-save">儲存為名單條件</button>' +
            '<button type="button" class="seg-btn" id="seg-export">匯出名單（活動報名用）</button>' +
          '</div>' +
          '<div class="chart-wrap" style="overflow-x:auto"><table class="seg-table"><thead><tr>' +
            '<th>隊編</th><th>姓名</th><th>身份別</th><th>車隊</th><th>縣市</th><th>上月上線</th><th>晚尖峰</th><th>承接率</th><th>曾參與</th><th>行動電話 <span class="seg-lock">敏感</span></th>' +
          '</tr></thead><tbody id="seg-rows"></tbody></table></div>' +
          '<p class="seg-hint" id="seg-more" style="margin-top:8px"></p>' +
        '</div>' +
      '</div>' +
      '<div class="seg-modal" id="seg-modal" role="dialog" aria-modal="true" aria-label="帶入外撥專案">' +
        '<div class="box"><h3>帶入外撥專案</h3>' +
        '<p class="seg-hint">篩選結果將整批帶入新外撥專案之名單（隊編＋行動電話自隊員主檔帶出，REQ-SEG-004）。</p>' +
        '<label for="seg-pname">專案名稱</label><input type="text" id="seg-pname">' +
        '<label>名單筆數</label><div style="font-size:22px;font-weight:600" id="seg-pcount"></div>' +
        '<label>名單預覽（前 5 筆）</label><div class="chart-wrap" style="overflow-x:auto"><table class="seg-table"><thead><tr><th>隊編</th><th>姓名</th><th>行動電話</th></tr></thead><tbody id="seg-preview"></tbody></table></div>' +
        '<div class="seg-actions" style="margin-top:16px"><button type="button" class="seg-btn primary" id="seg-pok">建立專案（示意）</button><button type="button" class="seg-btn" id="seg-pcancel">取消</button></div>' +
        '</div></div>';

    var result = [];
    function recompute() {
      result = pool.filter(function (m) { return match(m, cond); });
      document.getElementById('seg-count').textContent = CRM.fmt(result.length);
      document.getElementById('seg-cond-sum').textContent = condSummary(cond);
      var rows = result.slice(0, 50).map(function (m) {
        return '<tr class="mrow" data-code="' + m.code + '" tabindex="0" aria-label="檢視 ' + m.name + ' 的 Profile"><td>' + m.code + '</td><td>' + m.name + '</td><td>' + m.identity + '</td><td>' + m.branch + '</td><td>' + m.region + '</td><td>' + m.monthOnline + ' 天</td><td>' + m.evePeak + ' 天</td><td>' + m.acceptRate + '%</td><td>' + (m.joined ? '是' : '否') + '</td><td>' + phoneOf(m) + '</td></tr>';
      }).join('');
      document.getElementById('seg-rows').innerHTML = rows || '<tr><td colspan="10" style="color:var(--meta)">無符合條件之隊員（調整條件試試）</td></tr>';
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
    [['seg-morn', 'mornMin'], ['seg-eve', 'eveMin'], ['seg-armin', 'arMin'], ['seg-armax', 'arMax'], ['seg-mtmin', 'mtMin'], ['seg-mtmax', 'mtMax']].forEach(function (p) {
      document.getElementById(p[0]).addEventListener('input', function () { cond[p[1]] = this.value; recompute(); });
    });
    document.getElementById('seg-clear').addEventListener('click', function () {
      cond = emptyCond();
      ['seg-morn', 'seg-eve', 'seg-armin', 'seg-armax', 'seg-mtmin', 'seg-mtmax'].forEach(function (id) { document.getElementById(id).value = ''; });
      paintChips(); recompute();
    });
    document.getElementById('seg-demo').addEventListener('click', function () {
      // REQ-E2E-012 示例：雙北＋晚尖峰上線 ≥11 天＋曾參與活動
      cond = emptyCond();
      cond.branchRegion = ['台北'];
      cond.joined = 'yes';
      document.getElementById('seg-eve').value = '11';
      cond.eveMin = '11';
      ['seg-morn', 'seg-armin', 'seg-armax', 'seg-mtmin', 'seg-mtmax'].forEach(function (id) { document.getElementById(id).value = ''; });
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
          cond = sg.cond;
          ['seg-morn|mornMin', 'seg-eve|eveMin', 'seg-armin|arMin', 'seg-armax|arMax', 'seg-mtmin|mtMin', 'seg-mtmax|mtMax'].forEach(function (p) {
            var q = p.split('|'); document.getElementById(q[0]).value = cond[q[1]];
          });
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
    document.getElementById('seg-save').addEventListener('click', function () {
      // 原型不用 window.prompt 取名（阻塞式對話框擋走查自動化）；給預設名、正式版做命名欄
      var segs = loadSegs();
      var auto = '名單條件 ' + (segs.length + 1) + '（' + CRM.fmt(result.length) + ' 人）';
      segs.push({ name: auto, summary: condSummary(cond), cond: JSON.parse(JSON.stringify(cond)) });
      saveSegs(segs); renderSegs();
      CRM.toast('已儲存「' + auto + '」（正式版可自訂名稱）');
    });

    /* 帶入外撥專案（REQ-SEG-004、REQ-E2E-012 步驟 3） */
    var modal = document.getElementById('seg-modal');
    document.getElementById('seg-to-call').addEventListener('click', function () {
      if (!result.length) { CRM.toast('目前 0 人符合，請先設定條件'); return; }
      document.getElementById('seg-pname').value = '外撥專案：' + condSummary(cond).slice(0, 24);
      document.getElementById('seg-pcount').textContent = CRM.fmt(result.length) + ' 筆（＝篩選結果數）';
      document.getElementById('seg-preview').innerHTML = result.slice(0, 5).map(function (m) {
        return '<tr><td>' + m.code + '</td><td>' + m.name + '</td><td>' + phoneOf(m) + '</td></tr>';
      }).join('');
      modal.classList.add('show');
    });
    document.getElementById('seg-pcancel').addEventListener('click', function () { modal.classList.remove('show'); });
    modal.addEventListener('click', function (e) { if (e.target === modal) modal.classList.remove('show'); });
    document.getElementById('seg-pok').addEventListener('click', function () {
      modal.classList.remove('show');
      CRM.toast('已建立外撥專案（示意）：名單 ' + CRM.fmt(result.length) + ' 筆已帶入（隊編＋電話）');
    });
    document.getElementById('seg-export').addEventListener('click', function () {
      CRM.toast('已匯出名單（示意）：' + CRM.fmt(result.length) + ' 筆，可作活動報名名單（匯出依 REQ-GEN-006 寫入審計）');
    });

    paintChips(); recompute(); renderSegs();
  }

  window.CRMSEG = { mount: mount };
})();
