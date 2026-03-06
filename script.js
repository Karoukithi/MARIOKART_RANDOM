const characters = ["ウシ","カニ","ガボン","ガマネ","カロン","キノピオ","キノピコ","キャサリン","キングテレサ","クッパ","クッパJr","クリボー","サンボ","ジュゲム","チョロプー","ツッコンドル","デイジー","テレン","トッテン","ドンキーコング","ノコノコ","パサパサ","パタテンテン","パックン","ハッチン","ハナチャン","ハンマーブロス","ピーチ","フィッシュボーン","プー","プクプク","ブル","ヘイホー","ベビィデイジー","ベビィピーチ","ベビィルイージ","ベビィマリオ","ベビィロゼッタ","ペンギン","ポイハナ","ポリーン","マリオ","モンテ","ユキダルマ","ヨッシー","リフトン","ルイージ","ロゼッタ","ワリオ","ワルイージ"];
const machines = ["Bダッシュ","FCロボットバイク","H2O","Wチョッパー","イグニッション","カラフルスクーター","キラーヘッド","ケロケロード","こいのぼり","コゲッソー","サファリカーゴ","スーパーカーペット","スケルトン","スターモービル","スタンダードカート","スタンダードバイク","スチームバイク","タートルバギー","トイダンプ","ドカンバイク","ドッシーウェーブ","ドルフィンキック","バウザーバギー","パタテンテン","ビッグブル","ファイアチャージャー","ファイアモービル","ベルトライク","ホットラリー","マッハクイーン","マッハレーサー","ムービースター","メカクッパ","ラリーカート","ラリーゲイター","ラリーバイク","リボンクラシカル","レディオライト","ロイヤルターボ","ローブスター"];

let myChars = JSON.parse(localStorage.getItem('myChars')) || [...characters];
let myMachines = JSON.parse(localStorage.getItem('myMachines')) || [...machines];
let usedChars = [];
let usedMachines = [];

let isCharSpinning = false; 
let isMachSpinning = false;

let players = JSON.parse(localStorage.getItem('roulettePlayers')) || [{name: "PLAYER 1"}];
let rouletteSettings = JSON.parse(localStorage.getItem('rouletteSettings')) || {
    skip: false, time: 2.0, excludeChar: false, excludeMachine: false,
    preventCharOverlap: false, preventMachOverlap: false
};

window.onload = () => {
    generateList('charList', characters, myChars, 'char', "マリオ画像/キャラクター/", ".avif");
    generateList('machineList', machines, myMachines, 'machine', "マリオ画像/マシン/", ".png");
    
    document.getElementById('skipAnimation').checked = rouletteSettings.skip;
    document.getElementById('rouletteTime').value = rouletteSettings.time;
    document.getElementById('timeValue').innerText = rouletteSettings.time;
    document.getElementById('mainExcludeChar').checked = rouletteSettings.excludeChar;
    document.getElementById('mainExcludeMachine').checked = rouletteSettings.excludeMachine;
    document.getElementById('preventCharOverlap').checked = rouletteSettings.preventCharOverlap;
    document.getElementById('preventMachOverlap').checked = rouletteSettings.preventMachOverlap;

    document.getElementById('rouletteTime').oninput = function() { document.getElementById('timeValue').innerText = this.value; };

    initMultiDisplay();
    document.getElementById('playerCountSelect').value = players.length;
    generatePlayerInputs(); 
    updateHistoryDisplay();
};

function updateAllButtonsState() {
    const isAnySpinning = isCharSpinning || isMachSpinning;
    document.getElementById('spinCharBtn').disabled = isCharSpinning;
    document.getElementById('spinMachBtn').disabled = isMachSpinning;
    document.getElementById('spinAllBtn').disabled = isAnySpinning;
    
    const menuItems = document.querySelectorAll('.menu-item, .history-toggle-btn');
    menuItems.forEach(item => {
        item.style.pointerEvents = isAnySpinning ? 'none' : 'auto';
        item.style.opacity = isAnySpinning ? '0.6' : '1';
    });
}

function executeRoulette(type, onComplete) {
    const isChar = type === 'char';
    const ownList = isChar ? myChars : myMachines;
    const path = isChar ? "マリオ画像/キャラクター/" : "マリオ画像/マシン/";
    const ext = isChar ? ".avif" : ".png";
    const settingsExclude = isChar ? rouletteSettings.excludeChar : rouletteSettings.excludeMachine;
    const settingsNoOverlap = isChar ? rouletteSettings.preventCharOverlap : rouletteSettings.preventMachOverlap;

    let finishedCount = 0;
    let currentTurnResults = []; 

    players.forEach((_, i) => {
        const img = document.getElementById(`${isChar?'char':'mach'}Img_${i}`);
        const ph = document.getElementById(`${isChar?'char':'mach'}Ph_${i}`);
        const label = document.getElementById(`${isChar?'char':'mach'}Label_${i}`);
        const frame = document.getElementById(`${isChar?'char':'mach'}Frame_${i}`);
        
        let elapsed = 0; let speed = 50; const maxTime = rouletteSettings.time * 1000;
        
        function spin() {
            let pool = [...ownList];
            if (settingsExclude) {
                const history = isChar ? usedChars : usedMachines;
                let filtered = pool.filter(n => !history.includes(n));
                if (filtered.length > 0) pool = filtered;
            }

            let res;
            if (elapsed >= maxTime || rouletteSettings.skip) {
                let finalPool = settingsNoOverlap ? pool.filter(n => !currentTurnResults.includes(n)) : pool;
                if (finalPool.length === 0) finalPool = pool;
                res = finalPool[Math.floor(Math.random() * finalPool.length)];
                currentTurnResults.push(res);
            } else {
                res = pool[Math.floor(Math.random() * pool.length)];
            }

            if(ph) ph.style.display = "none"; 
            if(img) { img.style.display = "block"; img.src = `${path}${res}${ext}`; }
            if(label) label.innerText = res;
            
            speed += (maxTime / 100); elapsed += speed;
            
            if (elapsed < maxTime && !rouletteSettings.skip) { 
                setTimeout(spin, speed); 
            } else { 
                if (isChar) usedChars.push(res); else usedMachines.push(res);
                updateHistoryDisplay();
                if(frame) {
                    frame.classList.remove('winner-animation');
                    void frame.offsetWidth; 
                    frame.classList.add('winner-animation');
                }
                finishedCount++;
                if (finishedCount === players.length && onComplete) onComplete();
            }
        }
        spin();
    });
}

function spinCharacter() {
    if (isCharSpinning) return;
    if (rouletteSettings.preventCharOverlap && myChars.length < players.length) return alert("リスト数が足りません！");
    isCharSpinning = true;
    updateAllButtonsState();
    executeRoulette('char', () => { isCharSpinning = false; updateAllButtonsState(); });
}

function spinMachine() {
    if (isMachSpinning) return;
    if (rouletteSettings.preventMachOverlap && myMachines.length < players.length) return alert("リスト数が足りません！");
    isMachSpinning = true;
    updateAllButtonsState();
    executeRoulette('machine', () => { isMachSpinning = false; updateAllButtonsState(); });
}

function spinAll() {
    if (isCharSpinning || isMachSpinning) return;
    const charShort = rouletteSettings.preventCharOverlap && myChars.length < players.length;
    const machShort = rouletteSettings.preventMachOverlap && myMachines.length < players.length;
    if (charShort || machShort) return alert("リストの数が足りません！");

    isCharSpinning = true; isMachSpinning = true;
    updateAllButtonsState();

    let charDone = false; let machDone = false;
    executeRoulette('char', () => { 
        charDone = true; isCharSpinning = false;
        updateAllButtonsState();
    });
    executeRoulette('machine', () => { 
        machDone = true; isMachSpinning = false;
        updateAllButtonsState();
    });
}

function syncSettings(type) {
    if (type === 'char') rouletteSettings.excludeChar = document.getElementById('mainExcludeChar').checked;
    else rouletteSettings.excludeMachine = document.getElementById('mainExcludeMachine').checked;
    localStorage.setItem('rouletteSettings', JSON.stringify(rouletteSettings));
}

function generatePlayerInputs() {
    const count = parseInt(document.getElementById('playerCountSelect').value);
    const container = document.getElementById('playerNameInputs');
    container.innerHTML = "";
    for (let i = 0; i < count; i++) {
        const currentName = (players[i] && i < players.length) ? players[i].name : `PLAYER ${i + 1}`;
        container.innerHTML += `<div class="player-input-item"><label class="p-color-${i + 1}">P${i + 1}</label><input type="text" class="p-name-input" data-idx="${i}" value="${currentName}"></div>`;
    }
}

function savePlayers() {
    const inputs = document.querySelectorAll('.p-name-input');
    players = Array.from(inputs).map(input => ({ name: input.value || `PLAYER ${parseInt(input.dataset.idx) + 1}` }));
    rouletteSettings.preventCharOverlap = document.getElementById('preventCharOverlap').checked;
    rouletteSettings.preventMachOverlap = document.getElementById('preventMachOverlap').checked;
    localStorage.setItem('roulettePlayers', JSON.stringify(players));
    localStorage.setItem('rouletteSettings', JSON.stringify(rouletteSettings));
    initMultiDisplay();
    closeModal('playerModal');
}

function initMultiDisplay() {
    const charRoot = document.getElementById('charContainer');
    const machRoot = document.getElementById('machineContainer');
    const count = players.length;
    charRoot.className = `multi-grid-container grid-${count}`;
    machRoot.className = `multi-grid-container grid-${count}`;
    charRoot.innerHTML = ""; machRoot.innerHTML = "";
    players.forEach((p, i) => {
        const tag = `<div class="p-name-tag p-color-${i + 1}">${p.name}</div>`;
        charRoot.innerHTML += `<div class="player-frame" id="charFrame_${i}">${tag}<div class="placeholder" id="charPh_${i}">？</div><img id="charImg_${i}" style="display:none;"><div class="p-result-name" id="charLabel_${i}">-</div></div>`;
        machRoot.innerHTML += `<div class="player-frame" id="machFrame_${i}">${tag}<div class="placeholder" id="machPh_${i}">？</div><img id="machImg_${i}" style="display:none;"><div class="p-result-name" id="machLabel_${i}">-</div></div>`;
    });
}

function openModal(id) { document.getElementById(id).style.display = "block"; }
function closeModal(id) {
    if (id === 'appSettingsModal') {
        rouletteSettings.skip = document.getElementById('skipAnimation').checked;
        rouletteSettings.time = parseFloat(document.getElementById('rouletteTime').value);
        localStorage.setItem('rouletteSettings', JSON.stringify(rouletteSettings));
    }
    document.getElementById(id).style.display = "none";
}

function generateList(id, full, current, type, path, ext) {
    const container = document.getElementById(id);
    if(!container) return;
    container.innerHTML = "";
    full.forEach(name => {
        const isOwned = current.includes(name);
        const item = document.createElement('div');
        item.className = `select-item ${isOwned ? '' : 'disabled'}`;
        item.innerHTML = `<img src="${path}${name}${ext}"><br>${name}<input type="checkbox" ${isOwned ? 'checked' : ''} style="display:none">`;
        item.onclick = () => {
            const cb = item.querySelector('input'); cb.checked = !cb.checked;
            const list = type === 'char' ? myChars : myMachines;
            if (cb.checked) { if (!list.includes(name)) list.push(name); item.classList.remove('disabled'); }
            else { const idx = list.indexOf(name); if (idx > -1) list.splice(idx, 1); item.classList.add('disabled'); }
            localStorage.setItem(type === 'char' ? 'myChars' : 'myMachines', JSON.stringify(list));
        };
        container.appendChild(item);
    });
}

// 一括選択・解除の関数
function bulkSelect(type, isAll) {
    const fullList = (type === 'char') ? characters : machines;
    const targetList = isAll ? [...fullList] : [];
    
    if (type === 'char') {
        myChars = targetList;
        localStorage.setItem('myChars', JSON.stringify(myChars));
        generateList('charList', characters, myChars, 'char', "マリオ画像/キャラクター/", ".avif");
    } else {
        myMachines = targetList;
        localStorage.setItem('myMachines', JSON.stringify(myMachines));
        generateList('machineList', machines, myMachines, 'machine', "マリオ画像/マシン/", ".png");
    }
}

function updateHistoryDisplay() {
    const cg = document.getElementById('charHistoryGrid'); 
    const mg = document.getElementById('machineHistoryGrid');
    if(cg) {
        cg.innerHTML = "";
        [...usedChars].reverse().slice(0, 12).forEach(n => cg.innerHTML += `<div class="select-item"><img src="マリオ画像/キャラクター/${n}.avif"><br>${n}</div>`);
    }
    if(mg) {
        mg.innerHTML = "";
        [...usedMachines].reverse().slice(0, 12).forEach(n => mg.innerHTML += `<div class="select-item"><img src="マリオ画像/マシン/${n}.png"><br>${n}</div>`);
    }
}

function resetHistory(t) { if (t === 'char') usedChars = []; else usedMachines = []; updateHistoryDisplay(); }