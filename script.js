const fortuneData = {
    romance: [
        "ピンク色の小物を身につけて、あなたの可愛いお守りにしてね。",
        "お気に入りのホットドリンクを飲んで、リラックスして待ってみよう。",
        "今日はヘアスタイルを少し変えて、新しい風を纏ってみて。"
    ],
    fun: [
        "今日はお気に入りのカフェの新作や、気になっていたお菓子をチェックしてみて！",
        "お部屋のクッションの配置を変えたり、小さなお花を飾ったりしてみて。",
        "普段は通らない道を一歩だけ歩いてみて。小さな可愛い看板を探そう！"
    ],
    daily: [
        "深呼吸を3回して、お気に入りの音楽を1曲だけ目をつむって聴いてみて。",
        "スマホを少しだけ置いて、ハーブティーや温かい白湯を淹れてみて。",
        "今日はあなたの好きな心地よい素材の服を選んで身を包んでみて。"
    ]
};

const moodNames = { romance: "🩷 恋愛", fun: "💛 楽しいこと", daily: "💚 不安解消" };

let appState = {
    completedCount: 0,       
    currentPieces: [],        
    todoList: [],             
    historyMemories: [],      
    archive: []               
};

let selectedTodoIndex = null;
let activeFortune = { mood: '', text: '' };

function loadData() {
    const saved = localStorage.getItem('pirka_puzzle_data');
    if (saved) {
        appState = JSON.parse(saved);
    }
    if (!appState.currentPieces || appState.currentPieces.length !== 9) {
        appState.currentPieces = Array(9).fill(null);
    }
    if (!appState.todoList) appState.todoList = [];
    if (!appState.historyMemories) appState.historyMemories = [];
    if (!appState.archive) appState.archive = [];
}

function saveData() {
    localStorage.setItem('pirka_puzzle_data', JSON.stringify(appState));
}

// スタート画面用のDOM
const startScreen = document.getElementById('start-screen');
const mainContents = document.getElementById('main-contents');
const btnStartApp = document.getElementById('btn-start-app');

const screenHome = document.getElementById('screen-home');
const screenAlbum = document.getElementById('screen-album');
const navHome = document.getElementById('nav-home');
const navAlbum = document.getElementById('nav-album');

const puzzleBoard = document.getElementById('puzzle-board');
const growthBar = document.getElementById('growth-bar');
const growthText = document.getElementById('growth-text');

const fortunePopup = document.getElementById('fortune-popup');
const fortuneText = document.getElementById('fortune-text');
const btnAddTodo = document.getElementById('btn-add-todo');
const btnCloseFortune = document.getElementById('btn-close-fortune');

const todoPopup = document.getElementById('todo-popup');
const todoListContainer = document.getElementById('todo-list-container');
const btnCompleteTodo = document.getElementById('btn-complete-todo');
const btnCloseTodo = document.getElementById('btn-close-todo');
const btnOpenTodo = document.getElementById('btn-open-todo');
const todoBadge = document.getElementById('todo-badge');

const archiveGrid = document.getElementById('archive-grid');
const detailPopup = document.getElementById('detail-popup');
const detailName = document.getElementById('detail-name');
const detailDate = document.getElementById('detail-date');
const detailMemories = document.getElementById('detail-memories');
const btnCloseDetail = document.getElementById('btn-close-detail');

// 🌟 スタートボタンのクリックイベント
btnStartApp.addEventListener('click', () => {
    startScreen.classList.add('hidden'); // タイトル画面を消す
    mainContents.classList.remove('hidden'); // 本編を表示
    renderPuzzleBoard();
});

navHome.addEventListener('click', () => {
    navHome.classList.add('active'); navAlbum.classList.remove('active');
    screenHome.classList.remove('hidden'); screenAlbum.classList.add('hidden');
    renderPuzzleBoard();
});

navAlbum.addEventListener('click', () => {
    navAlbum.classList.add('active'); navHome.classList.remove('active');
    screenAlbum.classList.remove('hidden'); screenHome.classList.add('hidden');
    renderArchive();
});

function renderPuzzleBoard() {
    puzzleBoard.innerHTML = '';
    let filledCount = 0;

    appState.currentPieces.forEach((piece, index) => {
        const cell = document.createElement('div');
        cell.className = 'puzzle-piece';
        
        if (piece) {
            cell.classList.add('filled', `filled-${piece}`);
            cell.textContent = '✨';
            filledCount++;
        } else {
            cell.textContent = index + 1;
        }
        puzzleBoard.appendChild(cell);
    });

    const percentage = (filledCount / 9) * 100;
    growthBar.style.width = `${percentage}%`;
    growthText.textContent = `集まったピース: ${filledCount} / 9`;

    if (appState.todoList.length > 0) {
        todoBadge.textContent = appState.todoList.length;
        todoBadge.classList.remove('hidden');
    } else {
        todoBadge.classList.add('hidden');
    }
}

document.querySelectorAll('.mood-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const mood = btn.getAttribute('data-mood');
        const list = fortuneData[mood];
        const text = list[Math.floor(Math.random() * list.length)];
        
        activeFortune = { mood, text };
        fortuneText.textContent = text;
        fortunePopup.classList.remove('hidden');
    });
});

btnCloseFortune.addEventListener('click', () => fortunePopup.classList.add('hidden'));

btnAddTodo.addEventListener('click', () => {
    appState.todoList.push({
        mood: activeFortune.mood,
        text: activeFortune.text,
        date: new Date().toLocaleDateString('ja-JP')
    });
    saveData();
    renderPuzzleBoard();
    fortunePopup.classList.add('hidden');
    alert("「やることリスト」に登録しました！上の📋ボタンから確認できます。");
});

btnOpenTodo.addEventListener('click', () => {
    renderTodoList();
    todoPopup.classList.remove('hidden');
});

btnCloseTodo.addEventListener('click', () => todoPopup.classList.add('hidden'));

function renderTodoList() {
    todoListContainer.innerHTML = '';
    selectedTodoIndex = null;

    if (appState.todoList.length === 0) {
        todoListContainer.innerHTML = '<p style="text-align:center;font-size:13px;color:var(--text-sub);padding:20px;">登録中のタスクはありません</p>';
        return;
    }

    appState.todoList.forEach((todo, index) => {
        const item = document.createElement('div');
        item.className = 'todo-item';
        item.dataset.index = index;

        const tag = document.createElement('span');
        tag.className = `todo-item-tag tag-${todo.mood}`;
        tag.textContent = moodNames[todo.mood];

        const text = document.createElement('div');
        text.className = 'todo-item-text';
        text.textContent = todo.text;

        item.appendChild(tag);
        item.appendChild(text);

        item.addEventListener('click', () => {
            document.querySelectorAll('.todo-item').forEach(el => el.classList.remove('selected'));
            item.classList.add('selected');
            selectedTodoIndex = index;
        });

        todoListContainer.appendChild(item);
    });
}

btnCompleteTodo.addEventListener('click', () => {
    if (selectedTodoIndex === null) {
        alert("できた項目をリストから選んでタップしてください！");
        return;
    }

    const emptyIndices = [];
    appState.currentPieces.forEach((p, i) => {
        if (p === null) emptyIndices.push(i);
    });

    if (emptyIndices.length > 0) {
        const targetTodo = appState.todoList[selectedTodoIndex];
        const randomBoardIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
        appState.currentPieces[randomBoardIndex] = targetTodo.mood;

        appState.historyMemories.push({
            text: targetTodo.text,
            mood: targetTodo.mood,
            date: new Date().toLocaleDateString('ja-JP')
        });

        appState.todoList.splice(selectedTodoIndex, 1);
        saveData();
        renderPuzzleBoard();
        renderTodoList();

        const isComplete = appState.currentPieces.every(p => p !== null);
        if (isComplete) {
            todoPopup.classList.add('hidden');
            appState.completedCount += 1;

            setTimeout(() => {
                alert(`パズルが完全に揃いました！🧩✨\nがまとめたあなたの思い出として、宝箱へ大切にしまいます。`);

                appState.archive.push({
                    id: Date.now(),
                    name: `パズルお守り #${appState.completedCount}`,
                    date: new Date().toLocaleDateString('ja-JP'),
                    memories: [...appState.historyMemories]
                });

                appState.currentPieces = Array(9).fill(null);
                appState.historyMemories = [];
                saveData();
                renderPuzzleBoard();
            }, 500);
        } else {
            alert("ナイスファイト！パズルに新しく1ピースはまりました！");
        }
    }
});

function renderArchive() {
    archiveGrid.innerHTML = '';
    if (appState.archive.length === 0) {
        archiveGrid.innerHTML = '<p style="grid-column:span 2;text-align:center;font-size:13px;color:var(--text-sub);padding:40px;">まだ完成したパズルはありません</p>';
        return;
    }

    appState.archive.forEach(item => {
        const box = document.createElement('div');
        box.className = 'archive-item';

        const icon = document.createElement('div');
        icon.className = 'archive-icon';
        icon.textContent = '🧩';

        const name = document.createElement('span');
        name.className = 'archive-name';
        name.textContent = item.name;

        box.appendChild(icon);
        box.appendChild(name);

        box.addEventListener('click', () => {
            detailName.textContent = item.name;
            detailDate.textContent = item.date;
            detailMemories.innerHTML = '';

            item.memories.forEach(m => {
                const mDiv = document.createElement('div');
                mDiv.className = 'memory-item';
                mDiv.innerHTML = `<strong>[${moodNames[m.mood]}]</strong> ${m.text}`;
                detailMemories.appendChild(mDiv);
            });

            detailPopup.classList.remove('hidden');
        });

        archiveGrid.appendChild(box);
    });
}

btnCloseDetail.addEventListener('click', () => detailPopup.classList.add('hidden'));

// 起動処理
loadData();

window.addEventListener('click', (e) => {
    if (e.target === fortunePopup) fortunePopup.classList.add('hidden');
    if (e.target === todoPopup) todoPopup.classList.add('hidden');
    if (e.target === detailPopup) detailPopup.classList.add('hidden');
});