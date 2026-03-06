const characters = [
    "ウシ","カニ","ガボン","ガマネ","カロン",
    "キノピオ","キノピコ","キャサリン","キングテレサ","クッパ",
    "クッパJr","クリボー","サンボ","ジュゲム","チョロプー",
    "ツッコンドル","デイジー","テレン","トッテン","ドンキーコング",
    "ノコノコ","パサパサ","パタテンテン","パックン","ハッチン",
    "ハナチャン","ハンマーブロス","ピーチ","フィッシュボーン","プー",
    "プクプク","ブル","ヘイホー","ベビィデイジー","ベビィピーチ",
    "ベビィルイージ","ベビィマリオ","ベビィロゼッタ","ペンギン","ポイハナ",
    "ポリーン","マリオ","モンテ","ユキダルマ","ヨッシー",
    "リフトン","ルイージ","ロゼッタ","ワリオ","ワルイージ"
];

const machines = [
    "Bダッシュ","FCロボットバイク","H2O","Wチョッパー","イグニッション",
    "カラフルスクーター","キラーヘッド","ケロケロード","こいのぼり","コゲッソー",
    "サファリカーゴ","スーパーカーペット","スケルトン","スターモービル","スタンダードカート",
    "スタンダードバイク","スチームバイク","タートルバギー","トイダンプ","ドカンバイク",
    "ドッシーウェーブ","ドルフィンキック","バウザーバギー","パタテンテン","ビッグブル",
    "ファイアチャージャー","ファイアモービル","ベルトライク","ホットラリー","マッハクイーン",
    "マッハレーサー","ムービースター","メカクッパ","ラリーカート","ラリーゲイター",
    "ラリーバイク","リボンクラシカル","レディオライト","ロイヤルターボ","ローブスター"
];

let myChars = JSON.parse(localStorage.getItem('myChars')) || [...characters];
let myMachines = JSON.parse(localStorage.getItem('myMachines')) || [...machines];

// アプリ設定（初期値：演出あり、2秒）
let rouletteSettings = JSON.parse(localStorage.getItem('rouletteSettings')) || {
    skip: false,
    time: 2.0
};

let isSpinningChar = false;
let isSpinningMachine = false;

window.onload = () => {
    generateList('charList', characters, myChars, 'char', "マリオ画像/キャラクター/", ".avif");
    generateList('machineList', machines, myMachines, 'machine', "マリオ画像/マシン/", ".png");

    // 設定画面の初期値を反映
    document.getElementById('skipAnimation').checked = rouletteSettings.skip;
    document.getElementById('rouletteTime').value = rouletteSettings.time;
    document.getElementById('timeValue').innerText = rouletteSettings.time;

    // スライダー連動
    document.getElementById('rouletteTime').oninput = function() {
        document.getElementById('timeValue').innerText = this.value;
    };
};

function generateList(containerId, fullList, currentOwnList, type, path, ext) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";
    fullList.forEach(name => {
        const isOwned = currentOwnList.includes(name);
        const item = document.createElement('div');
        item.className = `select-item ${isOwned ? '' : 'disabled'}`;
        item.innerHTML = `
            <img src="${path}${name}${ext}" alt="${name}">
            <span>${name}</span>
            <input type="checkbox" ${isOwned ? 'checked' : ''} onchange="toggleItem('${type}', '${name}', this)">
        `;
        item.onclick = (e) => {
            if(e.target.tagName !== 'INPUT') {
                const cb = item.querySelector('input');
                cb.checked = !cb.checked;
                toggleItem(type, name, cb);
            }
        };
        container.appendChild(item);
    });
}

function toggleItem(type, name, checkbox) {
    const list = type === 'char' ? myChars : myMachines;
    if (checkbox.checked) {
        if (!list.includes(name)) list.push(name);
        checkbox.parentElement.classList.remove('disabled');
    } else {
        const index = list.indexOf(name);
        if (index > -1) list.splice(index, 1);
        checkbox.parentElement.classList.add('disabled');
    }
    localStorage.setItem(type === 'char' ? 'myChars' : 'myMachines', JSON.stringify(list));
}

function openModal(id) { document.getElementById(id).style.display = "block"; }

function closeModal(id) {
    if (id === 'appSettingsModal') {
        // 設定を保存
        rouletteSettings.skip = document.getElementById('skipAnimation').checked;
        rouletteSettings.time = parseFloat(document.getElementById('rouletteTime').value);
        localStorage.setItem('rouletteSettings', JSON.stringify(rouletteSettings));
    }
    document.getElementById(id).style.display = "none";
}

function runRoulette(fullArray, ownArray, imgId, nameId, path, ext, frameId) {
    if (ownArray.length === 0) {
        alert("アイテムが選択されていません！");
        return;
    }

    const frame = document.getElementById(frameId);
    const imgElement = document.getElementById(imgId);
    const nameElement = document.getElementById(nameId);
    const placeholder = document.getElementById(imgId === "charImg" ? "charPlaceholder" : "machinePlaceholder");

    // 演出カット設定の場合
    if (rouletteSettings.skip) {
        const r = Math.floor(Math.random() * ownArray.length);
        const name = ownArray[r];
        imgElement.src = `${path}${name}${ext}`;
        nameElement.innerText = name;
        placeholder.style.display = "none";
        imgElement.style.display = "block";
        finishAnimation(frameId);
        return;
    }

    // 通常のルーレット演出
    let speed = 50;
    let elapsed = 0;
    const maxTime = rouletteSettings.time * 1000;

    frame.style.boxShadow = "0 0 30px rgba(255, 220, 0, 0.8)";
    frame.style.borderColor = "#ffcc00";

    function spin() {
        const r = Math.floor(Math.random() * ownArray.length);
        const name = ownArray[r];

        placeholder.style.display = "none";
        imgElement.style.display = "block";
        imgElement.src = `${path}${name}${ext}`;
        nameElement.innerText = name;

        // 設定時間に合わせて徐々に遅くする
        speed += (maxTime / 150); 
        elapsed += speed;

        if (elapsed < maxTime) {
            setTimeout(spin, speed);
        } else {
            finishAnimation(frameId);
        }
    }
    spin();
}

function finishAnimation(frameId) {
    const frame = document.getElementById(frameId);
    if (frameId === "charFrame") isSpinningChar = false;
    if (frameId === "machineFrame") isSpinningMachine = false;
    frame.style.boxShadow = "0 4px 10px rgba(0,0,0,0.1)";
    frame.style.borderColor = "#333";
    frame.classList.add('winner-animation');
    setTimeout(() => frame.classList.remove('winner-animation'), 400);
}

function spinCharacter() { if (!isSpinningChar) { isSpinningChar = true; runRoulette(characters, myChars, "charImg", "charName", "マリオ画像/キャラクター/", ".avif", "charFrame"); } }
function spinMachine() { if (!isSpinningMachine) { isSpinningMachine = true; runRoulette(machines, myMachines, "machineImg", "machineName", "マリオ画像/マシン/", ".png", "machineFrame"); } }

function spinAll() {
    if (myChars.length === 0 || myMachines.length === 0) { alert("選択されていません！"); return; }
    spinCharacter();
    spinMachine();
}