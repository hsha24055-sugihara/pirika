// おみくじデータの定義
const fortuneData = {
    romance: [
        "もしかしたら、今日あなたをこっそり見つめてくれている人がいるかも！ピンク色の小物を身につけて、あなたの可愛いお守りにしてね。",
        "近いうちに、心がぽっと温まるような優しい連絡が届く予感。お気に入りのホットドリンクを飲んで、リラックスして待ってみよう。",
        "もしかしたら、過去の懐かしい笑顔があなたを思い出しているかも。今日はヘアスタイルを少し変えて、新しい風を纏ってみて。"
    ],
    fun: [
        "今日はお気に入りのカフェの新作や、気になっていたお菓子をチェックしてみて！小さな『美味しい幸せ』があなたを待っているよ。",
        "お部屋のクッションの配置を変えたり、小さなお花を飾ったりしてみて。お家の中にきらきらした新しいワクワクが見つかるはず！",
        "普段は通らない道を一歩だけ歩いてみて。小さな可愛い看板や、素敵なお守りになる景色に出会えるかもしれないよ。"
    ],
    daily: [
        "深呼吸を3回して、お気に入りの音楽を1曲だけ目をつむって聴いてみて。心がスーッと軽くなって、安心のベールに包まれるよ。",
        "スマホを少しだけ置いて、ハーブティーや温かい白湯を淹れてみて。科学的にも心が落ち着く時間を作ると、新しい明日が見えてくるよ。",
        "今日はあなたの好きな心地よい素材の服を選んでみて。触れるだけでホッとするお守りのような1日が過ごせるよ。"
    ]
};

// キャラクターの進化形態定義（1〜5段階）
const evolutionConfig = {
    romance: {
        names: ["ふしぎな浮かぶ雲", "ほんのり桜色の雲", "恋のつぼみ雲", "ときめきの球体", "恋するハートの結晶"],
        classes: ["stage-1", "romance-stage-2", "romance-stage-3", "romance-stage-4", "romance-stage-5"]
    },
    fun: {
        names: ["ふしぎな浮かぶ雲", "うきうき黄色の雲", "ひらめき星屑雲", "わくわくの球体", "毎日のきらきら星"],
        classes: ["stage-1", "fun-stage-2", "fun-stage-3", "fun-stage-4", "fun-stage-5"]
    },
    daily: {
        names: ["ふしぎな浮かぶ雲", "やすらぎ緑の雲", "おちつき若葉雲", "まどろみの球体", "おちつく森のしずく"],
        classes: ["stage-1", "daily-stage-2", "daily-stage-3", "daily-stage-4", "daily-stage-5"]
    }
};

// アプリの現在の状態（State）
let appState = {
    currentStage: 1, // 1 ~ 5
    currentMood: null, // 'romance', 'fun', 'daily'
    currentMemories: [], // 現在のキャラを育てるためにクリアした行動
    album: [] // 育ちきったキャラのコレクションリスト
};

// ローカルストレージからデータを読み込み
function loadData() {
    const saved = localStorage.getItem('pirka_app_data');
    if (saved) {
        appState = JSON.parse(saved);
        // 保証コード（以前の古い形式対策）
        if(!appState.currentMemories) appState.currentMemories = [];
        if(!appState.album) appState.album = [];
    }
}

// ローカルストレージへデータを保存
function saveData() {
    localStorage.setItem('pirka_app_data', JSON.stringify(appState));
}

// UI要素の取得
const screenHome = document.getElementById('screen-home');
const screenAlbum = document.getElementById('screen-album');
const navHome = document.getElementById('nav-home');
const navAlbum = document.getElementById('nav-album');

const mainCharacter = document.getElementById('main-character');
const currentEvolutionName = document.getElementById('current-evolution-name');
const growthBar = document.getElementById('growth-bar');
const growthText = document.getElementById('growth-text');

const fortunePopup = document.getElementById('fortune-popup');
const fortuneText = document.getElementById('fortune-text');
const btnDoAction = document.getElementById('btn-do-action');
const btnClosePopup = document.getElementById('btn-close-popup');

const albumGrid = document.getElementById('album-grid');
const detailPopup = document.getElementById('detail-popup');
const detailName = document.getElementById('detail-name');
const detailAvatar = document.getElementById('detail-avatar');
const detailDate = document.getElementById('detail-date');
const detailMemories = document.getElementById('detail-memories');
const btnCloseDetail = document.getElementById('btn-close-detail');

// 現在選択された一時的なおみくじ行動
let activeFortuneMessage = "";

// 画面切り替え処理
navHome.addEventListener('click', () => {
    navHome.classList.add('active');
    navAlbum.classList.remove('active');
    screenHome.classList.remove('hidden');
    screenAlbum.classList.add('hidden');
    updateHomeScreen();
});

navAlbum.addEventListener('click', () => {
    navAlbum.classList.add('active');
    navHome.classList.remove('active');
    screenAlbum.classList.remove('hidden');
    screenHome.classList.add('hidden');
    renderAlbum();
});

// ホーム画面のUI更新
function updateHomeScreen() {
    const stage = appState.currentStage;
    const mood = appState.currentMood;

    // クラスのリセット
    mainCharacter.className = "cloud-character";
    
    if (stage === 1 || !mood) {
        mainCharacter.classList.add('stage-1');
        currentEvolutionName.textContent = "ふしぎな浮かぶ雲";
    } else {
        const config = evolutionConfig[mood];
        mainCharacter.classList.add(config.classes[stage - 1]);
        currentEvolutionName.textContent = config.names[stage - 1];
    }

    // 成長バー更新 (MAX 5段階、進捗は 0%, 25%, 50%, 75%, 100%)
    const percentage = ((stage - 1) / 4) * 100;
    growthBar.style.width = `${percentage}%`;
    growthText.textContent = `成長度: ${stage} / 5`;
}

// おみくじを引く（気分ボタンクリック時）
document.querySelectorAll('.mood-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const mood = btn.getAttribute('data-mood');
        
        // 1段階目で初めて気分を選んだとき、または途中の時
        if (appState.currentStage === 1) {
            appState.currentMood = mood;
        }

        // おみくじメッセージの抽選
        const fortunes = fortuneData[mood];
        const randomIndex = Math.floor(Math.random() * fortunes.length);
        activeFortuneMessage = fortunes[randomIndex];

        // ポップアップの表示
        fortuneText.textContent = activeFortuneMessage;
        fortunePopup.classList.remove('hidden');
    });
});

// ポップアップを閉じる
btnClosePopup.addEventListener('click', () => {
    fortunePopup.classList.add('hidden');
});

// 「やってみる！（できた！）」ボタンを押したときの処理
btnDoAction.addEventListener('click', () => {
    fortunePopup.classList.add('hidden');

    // 現在の行動履歴に追加
    appState.currentMemories.push({
        text: activeFortuneMessage,
        date: new Date().toLocaleDateString('ja-JP')
    });

    // 成長段階を1進める
    if (appState.currentStage < 5) {
        appState.currentStage += 1;
    }

    // 5段階目（最終形態）に到達したかチェック
    if (appState.currentStage === 5) {
        // 育成完了のアニメーションやアラート
        setTimeout(() => {
            alert(`おめでとうございます！「${evolutionConfig[appState.currentMood].names[4]}」まで育ち切りました！標本箱に大切に保管されます。`);
            
            // アルバム（標本箱）に追加
            const completedCharacter = {
                id: Date.now(),
                mood: appState.currentMood,
                name: evolutionConfig[appState.currentMood].names[4],
                finalClass: evolutionConfig[appState.currentMood].classes[4],
                date: new Date().toLocaleDateString('ja-JP'),
                memories: [...appState.currentMemories]
            };
            appState.album.push(completedCharacter);

            // 状態のリセット（新しい雲へ）
            appState.currentStage = 1;
            appState.currentMood = null;
            appState.currentMemories = [];

            saveData();
            updateHomeScreen();
        }, 600);
    } else {
        saveData();
        updateHomeScreen();
    }
});

// アルバム（標本箱）の描画
function renderAlbum() {
    albumGrid.innerHTML = '';
    
    // スロット上限（綺麗に整列させるためのダミースロットを含む最低9個）
    const totalSlots = Math.max(9, Math.ceil(appState.album.length / 3) * 3);

    for (let i = 0; i < totalSlots; i++) {
        const item = appState.album[i];
        const slot = document.createElement('div');
        
        if (item) {
            slot.className = 'specimen-item';
            
            // ミニチュアキャラクタービジュアル
            const thumb = document.createElement('div');
            thumb.className = `cloud-character ${item.finalClass} specimen-thumb`;
            
            const nameLabel = document.createElement('span');
            nameLabel.className = 'specimen-name';
            nameLabel.textContent = item.name;

            slot.appendChild(thumb);
            slot.appendChild(nameLabel);
            
            // クリックで詳細ポップアップ表示
            slot.addEventListener('click', () => showDetail(item));
        } else {
            // 空の標本スロット
            slot.className = 'specimen-item empty-slot';
            slot.style.opacity = '0.3';
            slot.style.borderStyle = 'dashed';
            
            const emptyLabel = document.createElement('span');
            emptyLabel.className = 'specimen-name';
            emptyLabel.textContent = '-';
            emptyLabel.style.color = 'var(--text-sub)';
            slot.appendChild(emptyLabel);
        }
        
        albumGrid.appendChild(slot);
    }
}

// キャラクター詳細ポップアップの表示
function showDetail(item) {
    detailName.textContent = item.name;
    detailDate.textContent = item.date;
    
    // アバター描画
    detailAvatar.innerHTML = '';
    const avatar = document.createElement('div');
    avatar.className = `cloud-character ${item.finalClass}`;
    detailAvatar.appendChild(avatar);
    
    // 思い出リスト描画
    detailMemories.innerHTML = '';
    item.memories.forEach(m => {
        const mDiv = document.createElement('div');
        mDiv.className = 'memory-item';
        mDiv.innerHTML = `<strong>[${m.date}]</strong> ${m.text}`;
        detailMemories.appendChild(mDiv);
    });

    detailPopup.classList.remove('hidden');
}

// 詳細ポップアップを閉じる
btnCloseDetail.addEventListener('click', () => {
    detailPopup.classList.add('hidden');
});

// 初期化処理
loadData();
updateHomeScreen();
window.addEventListener('click', (e) => {
    // ポップアップの外側タップで閉じる処理（オプション）
    if (e.target === fortunePopup) fortunePopup.classList.add('hidden');
    if (e.target === detailPopup) detailPopup.classList.add('hidden');
});