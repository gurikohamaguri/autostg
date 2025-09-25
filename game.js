const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const endingVideo = document.getElementById('endingVideo');
const clearScreen = document.getElementById('clearScreen');
const finalScoreEl = document.getElementById('finalScore');
const playEndingBtn = document.getElementById('playEndingBtn');
const backToTitleBtn = document.getElementById('backToTitleBtn');
const ultButton = document.getElementById('ultButton');
const loading = document.getElementById('loading');
const reloadButton = document.getElementById('reloadButton');
const exitButton = document.getElementById('exitButton');
const orientationOverlay = document.getElementById('orientation-overlay');
const pauseButton = document.getElementById('pauseButton');
const scoreEl = document.getElementById('score');
const lifeEl = document.getElementById('life');
const ultGaugeBarEl = document.getElementById('ultGaugeBar');
const pngtuberContainer = document.getElementById('pngtuberContainer');
const gameUiContainer = document.getElementById('gameUiContainer');
const voiceMuteButton = document.getElementById('voiceMuteButton');

let isVoiceMuted = false;
let lastVolume = 0.2;
let isMutedByPause = false;

if (reloadButton) {
    reloadButton.addEventListener('click', () => location.reload());
}
if (exitButton) {
    exitButton.addEventListener('click', () => {
        backToTitle();
    });
}

// --- レスポンシブ対応 ---
const referenceHeight = 900; // 基準となる画面の高さ
let scale = 1;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
scale = canvas.height / referenceHeight;

function recalculateScaling() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    scale = canvas.height / referenceHeight;
    calculatePngTuberSize();
    adjustUiForMobile();
}

function scaleValue(value) {
    return value * scale;
}

// --- スマホ・タッチ操作判定 ---
const isMobile = (('ontouchstart' in window) || (navigator.maxTouchPoints > 0));

let pngtuberSize;
function calculatePngTuberSize() {
    const isLandscape = window.innerWidth > window.innerHeight;
    if (isMobile) {
        // スマホなら画面の高さの25%
        pngtuberSize = window.innerHeight * 0.25;
    } else {
        // PCなら画面の高さの30%
        pngtuberSize = window.innerHeight * 0.3;
    }
    // ただし、横長画面の場合は幅を取りすぎないように、画面幅の20%を上限とする
    if (isLandscape) {
        pngtuberSize = Math.min(pngtuberSize, window.innerWidth * 0.2);
    }
    pngtuberContainer.style.height = `${pngtuberSize}px`;
    pngtuberContainer.style.width = `${pngtuberSize}px`;
}

function adjustUiForMobile() {
    if (isMobile) {
        const uiContainerRight = 2; // vw
        const uiContainerBottom = 2; // vh
        const buttonMargin = 2; // vw

        gameUiContainer.style.right = `${uiContainerRight}vw`;
        gameUiContainer.style.bottom = `${uiContainerBottom}vh`;

        const pngtuberWidthVW = (pngtuberSize / window.innerWidth) * 100;
        const ultButtonRight = uiContainerRight + pngtuberWidthVW + buttonMargin;

        ultButton.style.right = `${ultButtonRight}vw`;
    }
}

calculatePngTuberSize();
adjustUiForMobile();

// --- オーディオコントロール ---
const audioControlsContainer = document.getElementById('audioControls');
const audioControls = {
    muteButton: document.getElementById('muteButton'),
    volumeSlider: document.getElementById('volumeSlider'),
};

// --- アセットのパス ---
const assetPaths = {
    player: [
        'assets/f/f_33.png', 'assets/f/f_24.png', 'assets/f/f_20.png', 'assets/f/f_8.png', 'assets/f/f_6.png', 'assets/f/f_3.png', 'assets/f/f64.png', 'assets/f/f63.png', 'assets/f/f62.png', 'assets/f/f61.png', 'assets/f/f60.png', 'assets/f/f58.png', 'assets/f/F_55.png', 'assets/f/f56.png', 'assets/f/f59.png', 'assets/f/F_54.png', 'assets/f/f_51.png', 'assets/f/f55.png', 'assets/f/f57.png', 'assets/f/f65.png', 'assets/f/f_52.png', 'assets/f/F_53.png', 'assets/f/f_0.png', 'assets/f/f_1.png', 'assets/f/f_10.png', 'assets/f/f_13.png', 'assets/f/f_14.png', 'assets/f/f_15.png', 'assets/f/f_16.png', 'assets/f/f_17.png', 'assets/f/f_18.png', 'assets/f/f_19.png', 'assets/f/f_2.png', 'assets/f/f_21.png', 'assets/f/f_22.png', 'assets/f/f_23.png', 'assets/f/f_25.png', 'assets/f/f_26.png', 'assets/f/f_27.png', 'assets/f/f_28.png', 'assets/f/f_29.png', 'assets/f/f_30.png', 'assets/f/f_31.png', 'assets/f/f_32.png', 'assets/f/f_34.png', 'assets/f/f_35.png', 'assets/f/f_36.png', 'assets/f/f_37.png', 'assets/f/f_38.png', 'assets/f/f_39.png', 'assets/f/f_4.png', 'assets/f/f_40.png', 'assets/f/f_41.png', 'assets/f/f_42.png', 'assets/f/f_43.png', 'assets/f/f_44.png', 'assets/f/f_45.png', 'assets/f/f_46.png', 'assets/f/f_47.png', 'assets/f/f_48.png', 'assets/f/f_49.png', 'assets/f/f_5.png', 'assets/f/f_50.png', 'assets/f/f_7.png', 'assets/f/f_9.png'
    ],
    enemies: [
        'assets/e/e71.png', 'assets/e/e67.png', 'assets/e/e68.png', 'assets/e/e69.png', 'assets/e/e70.png', 'assets/e/e72.png', 'assets/e/e-66.png', 'assets/e/e_10.png', 'assets/e/e_11.png', 'assets/e/e_12.png', 'assets/e/e_13.png', 'assets/e/e_14.png', 'assets/e/e_15.png', 'assets/e/e_16.png', 'assets/e/e_17.png', 'assets/e/e_18.png', 'assets/e/e_19.png', 'assets/e/e_20.png', 'assets/e/e_21.png', 'assets/e/e_22.png', 'assets/e/e_23.png', 'assets/e/e_24.png', 'assets/e/e_25.png', 'assets/e/e_26.png', 'assets/e/e_27.png', 'assets/e/e_29.png', 'assets/e/e_30.png', 'assets/e/e_31.png', 'assets/e/e_32.png', 'assets/e/e_33.png', 'assets/e/e_36.png', 'assets/e/e_37.png', 'assets/e/e_39.png', 'assets/e/e_4.png', 'assets/e/e_40.png', 'assets/e/e_41.png', 'assets/e/e_42.png', 'assets/e/e_43.png', 'assets/e/e_44.png', 'assets/e/e_45.png', 'assets/e/e_47.png', 'assets/e/e_48.png', 'assets/e/e_49.png', 'assets/e/e_5.png', 'assets/e/e_50.png', 'assets/e/e_51.png', 'assets/e/e_53.png', 'assets/e/e_54.png', 'assets/e/e_55.png', 'assets/e/e_56.png', 'assets/e/e_57.png', 'assets/e/e_58.png', 'assets/e/e_59.png', 'assets/e/e_6.png', 'assets/e/e_60.png', 'assets/e/e_61.png', 'assets/e/e_62.png', 'assets/e/e_63.png', 'assets/e/e_64.png', 'assets/e/e_65.png', 'assets/e/e_8.png', 'assets/e/e_9.png'
    ],
    bosses: [
        'assets/b/b_0.png', 'assets/b/b_1.png', 'assets/b/b_2.png', 'assets/b/b_3.png', 'assets/b/b_4.png', 'assets/b/b_5.png'
    ],
    backgrounds: [
        'assets/bg/bg_0.jpg', 'assets/bg/bg_1.jpg', 'assets/bg/bg_10.png', 'assets/bg/bg_100.png', 'assets/bg/bg_101.png', 'assets/bg/bg_102.png', 'assets/bg/bg_11.png', 'assets/bg/bg_12.png', 'assets/bg/bg_13.png', 'assets/bg/bg_14.png', 'assets/bg/bg_15.jpg', 'assets/bg/bg_16.png', 'assets/bg/bg_17.png', 'assets/bg/bg_18.png', 'assets/bg/bg_19.png', 'assets/bg/bg_2.png', 'assets/bg/bg_20.png', 'assets/bg/bg_21.png', 'assets/bg/bg_22.png', 'assets/bg/bg_23.png', 'assets/bg/bg_24.png', 'assets/bg/bg_25.png', 'assets/bg/bg_26.jpg', 'assets/bg/bg_26.png', 'assets/bg/bg_27.png', 'assets/bg/bg_28.png', 'assets/bg/bg_29.png', 'assets/bg/bg_3.png', 'assets/bg/bg_30.png', 'assets/bg/bg_31.png', 'assets/bg/bg_32.png', 'assets/bg/bg_33.png', 'assets/bg/bg_34.png', 'assets/bg/bg_35.png', 'assets/bg/bg_36.png', 'assets/bg/bg_37.png', 'assets/bg/bg_38.png', 'assets/bg/bg_39.png', 'assets/bg/bg_4.png', 'assets/bg/bg_40.png', 'assets/bg/bg_41.png', 'assets/bg/bg_42.png', 'assets/bg/bg_43.png', 'assets/bg/bg_44.png', 'assets/bg/bg_45.png', 'assets/bg/bg_46.png', 'assets/bg/bg_47.png', 'assets/bg/bg_48.png', 'assets/bg/bg_49.png', 'assets/bg/bg_5.png', 'assets/bg/bg_50.png', 'assets/bg/bg_51.png', 'assets/bg/bg_52.png', 'assets/bg/bg_53.png', 'assets/bg/bg_54.png', 'assets/bg/bg_55.png', 'assets/bg/bg_56.png', 'assets/bg/bg_57.png', 'assets/bg/bg_58.png', 'assets/bg/bg_59.png', 'assets/bg/bg_6.png', 'assets/bg/bg_60.png', 'assets/bg/bg_61.png', 'assets/bg/bg_62.png', 'assets/bg/bg_63.png', 'assets/bg/bg_64.png', 'assets/bg/bg_65.png', 'assets/bg/bg_66.png', 'assets/bg/bg_67.png', 'assets/bg/bg_68.png', 'assets/bg/bg_69.png', 'assets/bg/bg_7.png', 'assets/bg/bg_70.png', 'assets/bg/bg_71.png', 'assets/bg/bg_72.png', 'assets/bg/bg_73.png', 'assets/bg/bg_74.png', 'assets/bg/bg_75.png', 'assets/bg/bg_76.png', 'assets/bg/bg_77.png', 'assets/bg/bg_78.png', 'assets/bg/bg_79.png', 'assets/bg/bg_8.png', 'assets/bg/bg_80.png', 'assets/bg/bg_81.png', 'assets/bg/bg_82.png', 'assets/bg/bg_83.png', 'assets/bg/bg_84.png', 'assets/bg/bg_85.png', 'assets/bg/bg_86.png', 'assets/bg/bg_87.png', 'assets/bg/bg_88.png', 'assets/bg/bg_89.png', 'assets/bg/bg_9.png', 'assets/bg/bg_90.png', 'assets/bg/bg_91.png', 'assets/bg/bg_92.png', 'assets/bg/bg_93.png', 'assets/bg/bg_94.png', 'assets/bg/bg_95.png', 'assets/bg/bg_96.png', 'assets/bg/bg_98.png', 'assets/bg/bg_99.png'
    ],
    cutins: [
        'assets/c/c_0.png', 'assets/c/c_1.png', 'assets/c/c_11.png', 'assets/c/c_12.png', 'assets/c/c_13.png', 'assets/c/c_14.png', 'assets/c/c_15.png', 'assets/c/c_16.png', 'assets/c/c_17.png', 'assets/c/c_19.png', 'assets/c/c_2.png', 'assets/c/c_20.png', 'assets/c/c_21.png', 'assets/c/c_3.png', 'assets/c/c_4.png', 'assets/c/c_5.png', 'assets/c/c_7.png', 'assets/c/c_9.png', 'assets/c/c22.png', 'assets/c/c24.png', 'assets/c/c30.png', 'assets/c/c31.png', 'assets/c/c33.png', 'assets/c/c34.png', 'assets/c/c35.png', 'assets/c/c36.png', 'assets/c/c37.png', 'assets/c/c38.png', 'assets/c/c39.png', 'assets/c/c40.png', 'assets/c/c41.png', 'assets/c/c42.png', 'assets/c/c43.png', 'assets/c/c45.png', 'assets/c/c46.png', 'assets/c/c47.png', 'assets/c/c48.png', 'assets/c/c49.png', 'assets/c/c50.png', 'assets/c/c51.png', 'assets/c/c52.png', 'assets/c/c53.png', 'assets/c/c54.png', 'assets/c/c55.png', 'assets/c/c56.png', 'assets/c/c57.png', 'assets/c/c58.png', 'assets/c/c59.png', 'assets/c/c60.png', 'assets/c/c61.png', 'assets/c/c62.png', 'assets/c/c63.png', 'assets/c/c64.png', 'assets/c/c65.png', 'assets/c/c66.png'
    ],
    bgm: {
        normal: [
            'assets/bgm/normal/bgm_1.mp3', 'assets/bgm/normal/bgm_10.mp3', 'assets/bgm/normal/bgm_12.mp3', 'assets/bgm/normal/bgm_15.mp3', 'assets/bgm/normal/bgm_16.mp3', 'assets/bgm/normal/bgm_17.mp3', 'assets/bgm/normal/bgm_2.mp3', 'assets/bgm/normal/bgm_21.mp3', 'assets/bgm/normal/bgm_25.mp3', 'assets/bgm/normal/bgm_28.mp3', 'assets/bgm/normal/bgm_29.mp3', 'assets/bgm/normal/bgm_30.mp3', 'assets/bgm/normal/bgm_31.mp3', 'assets/bgm/normal/bgm_33.mp3', 'assets/bgm/normal/bgm_38.mp3', 'assets/bgm/normal/bgm_39.mp3', 'assets/bgm/normal/bgm_4.mp3', 'assets/bgm/normal/bgm_43.mp3', 'assets/bgm/normal/bgm_45.mp3', 'assets/bgm/normal/bgm_50.mp3', 'assets/bgm/normal/bgm_51.mp3', 'assets/bgm/normal/bgm_52.mp3', 'assets/bgm/normal/bgm_7.mp3', 'assets/bgm/normal/bgm_8.mp3', 'assets/bgm/normal/bgm_9.mp3'
        ],
        boss: [
            'assets/bgm/boss/bbgm_18.mp3', 'assets/bgm/boss/bbgm_19.mp3', 'assets/bgm/boss/bbgm_20.mp3', 'assets/bgm/boss/bbgm_22.mp3', 'assets/bgm/boss/bbgm_23.mp3', 'assets/bgm/boss/bbgm_26.mp3', 'assets/bgm/boss/bbgm_44.mp3', 'assets/bgm/boss/bbgm_46.mp3', 'assets/bgm/boss/bbgm_47.mp3', 'assets/bgm/boss/bbgm_48.mp3', 'assets/bgm/boss/bbgm_49.mp3'
        ]
    },
    endings: [
        'assets/ed/Hallucination.mp4', 'assets/ed/one-page-at-a-time.mp4', 'assets/ed/thanks-for-being-there-for-me.mp4', 'assets/ed/the-western-star-aglow.mp4'
    ],
    pngtuber: {
        cc: 'assets/png/cc.png',
        co: 'assets/png/co.png',
        dd: 'assets/png/dd.png',
        oc: 'assets/png/oc.png',
        oo: 'assets/png/oo.png'
    },
    voices: {
        damage: [
            'assets/voice/d101.mp3', 'assets/voice/d1101.mp3', 'assets/voice/d2-401.mp3', 'assets/voice/d21.mp3', 'assets/voice/d22.mp3'
        ],
        ult: [
            'assets/voice/u12-101.mp3', 'assets/voice/u13.mp3', 'assets/voice/u1401.mp3', 'assets/voice/u2-201.mp3', 'assets/voice/u21.mp3', 'assets/voice/u3-101.mp3', 'assets/voice/u41 01.mp3', 'assets/voice/u5101.mp3', 'assets/voice/u6101.mp3', 'assets/voice/u7-101.mp3', 'assets/voice/u7101.mp3', 'assets/voice/u8101.mp3', 'assets/voice/u9-101.mp3', 'assets/voice/u91.mp3', 'assets/voice/u9101.mp3', 'assets/voice/u9201.mp3'
        ],
    }
};

// --- 読み込んだアセットを格納 ---
const assets = {
    player: [], enemies: [], bosses: [], backgrounds: [], cutins: [], bgm: { normal: [], boss: [] }, endings: [],
    pngtuber: { oo: null, oc: null, co: null, cc: null, dd: null },
    voices: { damage: [], ult: [] },
    currentBgm: null,
    currentTitleCutin: null,
    currentGameoverCutin: null,
    currentClearCutin: null,
    currentUltCutin: null,
};

// --- PNGTuberの状態管理 ---
let pngtuberState = 'normal'; // normal, damage, ult, damage_hold, ult_hold
let isVoicePlaying = false;
let blinkTimer = 0;
let pngtuberImage = null;

// --- ゲームの状態管理 ---
const gameState = {
    LOADING: 'loading',
    TITLE: 'title',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAMEOVER: 'gameover',
    CLEAR: 'clear',
    ULT_CUTIN: 'ult_cutin',
    BOSS_APPEAR_FLASH: 'boss_appear_flash',
    CLEAR_WHITEOUT: 'clear_whiteout',
    GAMEOVER_BLACKOUT: 'gameover_blackout',
};
let currentState = gameState.LOADING;
let player;
let boss = null;
let enemies = [];
let enemyBullets = [];
let enemySpawnTimer = 0;
let gameTimer = 0;
let ultCutinTimer = 0;
let transitionTimer = 0;
let backgroundX = 0;
let gameBackground;
let score = 0;
let ultGauge = 0;
const ultGaugeMax = 600; // 10秒 * 60fps
let ultReady = false;
let assetsLoaded = 0;
let assetsToLoad = 0;
let ultUsageCount = 0;
let bossEnrageTimer = -1;
let isBossEnraged = false;
let bossEnragePenaltyTimer = -1;
let purpleFlashTimer = 0;

// --- 入力管理 ---
const keys = {};
const mouse = { x: 0, y: 0, left: false, right: false };
let touchX = null;
let touchY = null;

// --- 一時停止画面のボタン定義 ---
let resumeButtonRect = {};
let titleButtonRect = {};

window.addEventListener('keydown', (e) => { keys[e.code] = true; });
window.addEventListener('keyup', (e) => { keys[e.code] = false; });
window.addEventListener('mousemove', (e) => { 
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});
window.addEventListener('contextmenu', (e) => e.preventDefault());


// --- クラス定義 ---
class Bullet {
    constructor(x, y, speedX = 10, speedY = 0, color = 'yellow', width = 15, height = 5) {
        this.x = x;
        this.y = y;
        this.width = scaleValue(width);
        this.height = scaleValue(height);
        this.speedX = scaleValue(speedX);
        this.speedY = scaleValue(speedY);
        this.color = color;
        this.active = true;
        this.homing = false;
        this.homingTimer = 0;
    }

    update() {
        if (this.homing && this.homingTimer > 0 && player) {
            const dx = (player.x + player.width / 2) - this.x;
            const dy = (player.y + player.height / 2) - this.y;
            const angle = Math.atan2(dy, dx);
            const speed = Math.sqrt(this.speedX * this.speedX + this.speedY * this.speedY);
            const acceleration = 0.05;
            this.speedX += Math.cos(angle) * acceleration;
            this.speedY += Math.sin(angle) * acceleration;

            // Normalize speed
            const currentSpeed = Math.sqrt(this.speedX * this.speedX + this.speedY * this.speedY);
            if (currentSpeed > speed) {
                this.speedX = (this.speedX / currentSpeed) * speed;
                this.speedY = (this.speedY / currentSpeed) * speed;
            }
            this.homingTimer--;
        }

        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x > canvas.width || this.x < -this.width || this.y > canvas.height || this.y < -this.height) {
            this.active = false;
        }
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class Player {
    constructor() {
        if (isMobile) {
            this.height = Math.min(canvas.width, canvas.height) * 0.15;
            this.width = this.height;
        } else {
            this.width = scaleValue(150);
            this.height = scaleValue(150);
        }
        this.x = scaleValue(100);
        this.y = canvas.height / 2 - this.height / 2;
        this.speed = scaleValue(7);
        this.image = assets.player[Math.floor(Math.random() * assets.player.length)];
        this.bullets = [];
        this.shootCooldown = 0;
        this.health = 10;
        this.hitTimer = 0;
        this.damageColor = null;
    }

    update() {
        if (this.hitTimer > 0) {
            this.hitTimer--;
        }

        // 移動
        if (isMobile && touchX !== null && touchY !== null) {
            // スマホ：タッチ座標に追従
            const targetX = touchX - this.width / 2;
            const targetY = touchY - this.height / 2;
            this.x += (targetX - this.x) * 0.3; // スムーズに追従
            this.y += (targetY - this.y) * 0.3;
        } else if (!isMobile) {
            // PC：キーボード操作
            if (keys['KeyW'] || keys['ArrowUp']) this.y -= this.speed;
            if (keys['KeyS'] || keys['ArrowDown']) this.y += this.speed;
            if (keys['KeyA'] || keys['ArrowLeft']) this.x -= this.speed;
            if (keys['KeyD'] || keys['ArrowRight']) this.x += this.speed;
        }

        // 画面外に出ないように制限
        if (this.x < 0) this.x = 0;
        if (this.x > canvas.width - this.width) this.x = canvas.width - this.width;
        if (this.y < 0) this.y = 0;
        if (this.y > canvas.height - this.height) this.y = canvas.height - this.height;

        // 射撃
        if (this.shootCooldown > 0) {
            this.shootCooldown--;
        }
        if ((isMobile || keys['Space'] || mouse.left) && this.shootCooldown === 0) {
            this.shoot();
            this.shootCooldown = 15; // 15フレームのクールダウン
        }

        // ULT (PC)
        if (!isMobile && (keys['ShiftLeft'] || mouse.right) && ultReady) {
            this.useUlt();
            if (mouse.right) mouse.right = false; // 右クリックは単発トリガー
        }

        // 弾の更新
        this.bullets.forEach(bullet => bullet.update());
        this.bullets = this.bullets.filter(bullet => bullet.active);
    }

    draw() {
        if (this.hitTimer > 0 && Math.floor(this.hitTimer / 4) % 2 === 0) {
            // 点滅で消えるフレーム
            if (this.damageColor === 'purple') {
                ctx.fillStyle = 'rgba(128, 0, 128, 0.8)';
                ctx.fillRect(this.x, this.y, this.width, this.height);
            }
            // 白点滅の場合は何もしない（透明になる）
        } else {
            // 表示されるフレーム
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        }
        this.bullets.forEach(bullet => bullet.draw());
    }

    shoot() {
        const bulletX = this.x + this.width;
        const bulletY = this.y + this.height / 2 - scaleValue(2.5);
        this.bullets.push(new Bullet(bulletX, bulletY));
    }

    useUlt() {
        if (!ultReady) return;
        ultUsageCount++; // ULT使用回数をカウント
        ultReady = false;
        ultGauge = 0;
    
        if (!isVoiceMuted) {
            isVoicePlaying = true;
            pngtuberState = 'ult_hold';
            const ultVoice = assets.voices.ult[Math.floor(Math.random() * assets.voices.ult.length)];
            if (ultVoice) {
                ultVoice.volume = Math.min(1, audioControls.volumeSlider.value * 2.5);
                ultVoice.play();
                ultVoice.onended = () => { isVoicePlaying = false; };
            } else {
                isVoicePlaying = false;
            }
        }
    
        assets.currentUltCutin = assets.cutins[Math.floor(Math.random() * assets.cutins.length)];
        setCurrentState(gameState.ULT_CUTIN);
    }
    
    takeDamage(amount, color = 'white') {
        if (this.hitTimer === 0) {
            this.health -= amount;
            this.hitTimer = 60; // 1秒間無敵
            this.damageColor = color;
    
            if (!isVoiceMuted) {
                isVoicePlaying = true;
                pngtuberState = 'damage_hold';
                const damageVoice = assets.voices.damage[Math.floor(Math.random() * assets.voices.damage.length)];
                if (damageVoice) {
                    damageVoice.volume = Math.min(1, audioControls.volumeSlider.value * 2.5);
                    damageVoice.play();
                    damageVoice.onended = () => { isVoicePlaying = false; };
                } else {
                    isVoicePlaying = false;
                }
            }
    
            if (this.health <= 0) {
                setCurrentState(gameState.GAMEOVER_BLACKOUT);
            }
        }
    }
}

class Enemy {
    constructor() {
        this.x = canvas.width;
        this.y = Math.random() * (canvas.height - scaleValue(200)) + scaleValue(100); // 上下端に寄らないように調整
        this.image = assets.enemies[Math.floor(Math.random() * assets.enemies.length)];
        this.active = true;
        this.hitTimer = 0;

        const sizeType = ['S', 'M', 'L'][Math.floor(Math.random() * 3)];
        const moveType = ['straight', 'homing', 'zigzag', 'circle'][Math.floor(Math.random() * 4)];
        this.bulletType = ['none', 'single', 'triple', 'homing', 'beam', 'radial'][Math.floor(Math.random() * 6)];
        this.health = [2, 4, 6][Math.floor(Math.random() * 3)];
        this.shootCooldown = Math.random() * 100 + 50;

        if (isMobile) {
            const baseSize = Math.min(canvas.width, canvas.height);
            switch (sizeType) {
                case 'S': this.height = baseSize * 0.20; break;
                case 'M': this.height = baseSize * 0.25; break;
                case 'L': this.height = baseSize * 0.30; break;
            }
            this.width = this.height;
        } else {
            switch (sizeType) {
                case 'S': this.width = scaleValue(200); this.height = scaleValue(200); break;
                case 'M': this.width = scaleValue(250); this.height = scaleValue(250); break;
                case 'L': this.width = scaleValue(300); this.height = scaleValue(300); break;
            }
        }

        this.moveType = moveType;
        this.speedX = -Math.random() * scaleValue(2) - scaleValue(1);
        this.speedY = 0;

        // 新しい移動パターンのためのプロパティ初期化
        if (this.moveType === 'zigzag') {
            this.initialY = this.y;
            this.amplitude = scaleValue([30, 60, 90][Math.floor(Math.random() * 3)]); // 振れ幅
            this.speedY = (Math.random() > 0.5 ? 2 : -2) * scale;
        } else if (this.moveType === 'circle') {
            this.centerY = this.y;
            this.radius = scaleValue([40, 80, 120][Math.floor(Math.random() * 3)]); // 円の半径
            this.angle = 0;
            this.angleSpeed = (Math.random() * 0.04 + 0.02) * (Math.random() > 0.5 ? 1 : -1);
        }
    }

    update() {
        if (this.hitTimer > 0) {
            this.hitTimer--;
        }

        const speedMultiplier = isBossEnraged ? 1.5 : 1;

        // 移動ロジック
        switch (this.moveType) {
            case 'homing':
                if (player) {
                    const dy = player.y - this.y;
                    this.y += Math.sign(dy) * Math.min(Math.abs(dy), Math.abs(this.speedX * speedMultiplier));
                }
                this.x += this.speedX * speedMultiplier;
                break;
            case 'zigzag':
                this.y += this.speedY * speedMultiplier;
                if (this.y < this.initialY - this.amplitude || this.y > this.initialY + this.amplitude) {
                    this.speedY *= -1;
                }
                this.x += this.speedX * speedMultiplier;
                break;
            case 'circle':
                this.angle += this.angleSpeed * speedMultiplier;
                this.y = this.centerY + Math.sin(this.angle) * this.radius;
                this.x += this.speedX * speedMultiplier;
                break;
            case 'straight':
            default:
                this.x += this.speedX * speedMultiplier;
                break;
        }


        if (this.x < -this.width) {
            this.active = false;
        }

        this.shootCooldown--;
        if (this.shootCooldown <= 0) {
            this.shoot();
            this.shootCooldown = (Math.random() * 100 + 100) / speedMultiplier;
        }
    }

    draw() {
        if (this.hitTimer > 0 && Math.floor(this.hitTimer / 4) % 2 === 0) {
            // 点滅処理
        } else {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        }
    }

    shoot() {
        if (this.bulletType === 'none' || !player) return;

        const speedMultiplier = isBossEnraged ? 1.5 : 1;
        const bulletX = this.x;
        const bulletY = this.y + this.height / 2;

        switch (this.bulletType) {
            case 'single':
                enemyBullets.push(new Bullet(bulletX, bulletY, -5 * speedMultiplier, 0, '#ff6666'));
                break;
            case 'triple':
                enemyBullets.push(new Bullet(bulletX, bulletY, -5 * speedMultiplier, -1 * speedMultiplier, '#ff6666'));
                enemyBullets.push(new Bullet(bulletX, bulletY, -5 * speedMultiplier, 0, '#ff6666'));
                enemyBullets.push(new Bullet(bulletX, bulletY, -5 * speedMultiplier, 1 * speedMultiplier, '#ff6666'));
                if (isBossEnraged) {
                    enemyBullets.push(new Bullet(bulletX, bulletY, -5 * speedMultiplier, -2 * speedMultiplier, '#ff6666'));
                    enemyBullets.push(new Bullet(bulletX, bulletY, -5 * speedMultiplier, 2 * speedMultiplier, '#ff6666'));
                }
                break;
            case 'homing':
                const dx = player.x - this.x;
                const dy = player.y - this.y;
                const angle = Math.atan2(dy, dx);
                const speed = 4 * speedMultiplier;
                enemyBullets.push(new Bullet(bulletX, bulletY, Math.cos(angle) * speed, Math.sin(angle) * speed, '#ff4444'));
                break;
            case 'beam':
                enemyBullets.push(new Bullet(bulletX, bulletY - scaleValue(10), -8 * speedMultiplier, 0, '#ff0000', 50, 20));
                break;
            case 'radial':
                const bulletCount = isBossEnraged ? 9 : 6;
                for (let i = 0; i < bulletCount; i++) {
                    const angle = (i / bulletCount) * Math.PI * 2;
                    enemyBullets.push(new Bullet(bulletX, bulletY, Math.cos(angle) * 3 * speedMultiplier, Math.sin(angle) * 3 * speedMultiplier, '#ff8888'));
                }
                break;
        }
    }
    
    takeDamage(amount) {
        this.health -= amount;
        this.hitTimer = 15;
        if (this.health <= 0) {
            this.active = false;
            score += 100;
        }
    }
}

class Boss {
    constructor() {
        if (isMobile) {
            const baseSize = Math.min(canvas.width, canvas.height);
            this.width = baseSize * 0.35;
            this.height = baseSize * 0.35;
        } else {
            this.width = scaleValue(250);
            this.height = scaleValue(250);
        }
        this.x = canvas.width;
        this.y = canvas.height / 2 - this.height / 2;
        this.image = assets.bosses[Math.floor(Math.random() * assets.bosses.length)];
        this.health = 100;
        this.maxHealth = 100;
        this.speedX = scaleValue(-1);
        this.speedY = scaleValue(1);
        this.shootCooldown = 0;
        this.hitTimer = 0;
        this.attackPhase = 0;
        this.attackPhaseTimer = 0;
    }

    update() {
        if (this.hitTimer > 0) {
            this.hitTimer--;
        }

        const speedMultiplier = isBossEnraged ? 1.5 : 1;

        // 初期位置まで移動
        if (this.x > canvas.width - this.width - scaleValue(50)) {
            this.x += this.speedX * speedMultiplier;
        } else {
            // 上下に移動
            this.y += this.speedY * speedMultiplier;
            if (this.y < 0 || this.y > canvas.height - this.height) {
                this.speedY *= -1;
            }
        }

        this.attackPhaseTimer++;
        if (this.attackPhaseTimer > 300 / speedMultiplier) { // 5秒ごとにフェーズ変更
            this.attackPhase = (this.attackPhase + 1) % 4;
            this.attackPhaseTimer = 0;
        }

        // 攻撃
        this.shootCooldown--;
        if (this.shootCooldown <= 0) {
            this.shoot();
            this.setShootCooldown();
        }
    }

    setShootCooldown() {
        const speedMultiplier = isBossEnraged ? 1.5 : 1;
        switch (this.attackPhase) {
            case 0: this.shootCooldown = 90 / speedMultiplier; break; // Radial
            case 1: this.shootCooldown = 120 / speedMultiplier; break; // Wide
            case 2: this.shootCooldown = 30 / speedMultiplier; break;  // 3-way
            case 3: this.shootCooldown = 60 / speedMultiplier; break; // Homing
            default: this.shootCooldown = 90 / speedMultiplier;
        }
    }

    draw() {
        if (this.hitTimer > 0 && Math.floor(this.hitTimer / 4) % 2 === 0) {
            // 点滅処理
        } else {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        }
        // HPバー
        const barWidth = scaleValue(400);
        const barHeight = scaleValue(20);
        const barX = canvas.width / 2 - barWidth / 2;
        const barY = scaleValue(20);
        ctx.fillStyle = '#555';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(barX, barY, (this.health / this.maxHealth) * barWidth, barHeight);
        ctx.strokeStyle = '#fff';
        ctx.strokeRect(barX, barY, barWidth, barHeight);
    }

    shoot() {
        const speedMultiplier = isBossEnraged ? 1.5 : 1;
        const bulletX = this.x + this.width / 2;
        const bulletY = this.y + this.height / 2;

        switch (this.attackPhase) {
            case 0: // 放射弾 (Radial)
                const radialCount = isBossEnraged ? 24 : 16;
                for (let i = 0; i < radialCount; i++) {
                    const angle = (i / radialCount) * Math.PI * 2 + (this.attackPhaseTimer / 100);
                    enemyBullets.push(new Bullet(bulletX, bulletY, Math.cos(angle) * 4 * speedMultiplier, Math.sin(angle) * 4 * speedMultiplier, '#ff00ff', 10, 10));
                }
                break;
            case 1: // 幅広直線 (Wide Straight)
                const wideCount = isBossEnraged ? 5 : 3;
                for (let i = -wideCount; i <= wideCount; i++) {
                    enemyBullets.push(new Bullet(this.x, this.y + this.height/2 + i * scaleValue(20), -7 * speedMultiplier, 0, '#ff99ff', 15, 15));
                }
                break;
            case 2: // 3方向弾 (3-way)
                if (player) {
                    const dx = player.x - this.x;
                    const dy = player.y - this.y;
                    const angleToPlayer = Math.atan2(dy, dx);
                    const threeWayCount = isBossEnraged ? 3 : 1;
                    for (let i = -threeWayCount; i <= threeWayCount; i++) {
                        const angle = angleToPlayer + i * (Math.PI / 10); // 18度ずつ
                        enemyBullets.push(new Bullet(bulletX, bulletY, Math.cos(angle) * 6 * speedMultiplier, Math.sin(angle) * 6 * speedMultiplier, '#cc00cc', 12, 12));
                    }
                }
                break;
            case 3: // 追尾弾 (Homing)
                if (player) {
                    const dx = player.x - this.x;
                    const dy = player.y - this.y;
                    const angle = Math.atan2(dy, dx);
                    const speed = 3 * speedMultiplier;
                    const homingBullet = new Bullet(bulletX, bulletY, Math.cos(angle) * speed, Math.sin(angle) * speed, '#ff44cc', 15, 15);
                    homingBullet.homing = true;
                    homingBullet.homingTimer = 180; // 3秒間追尾
                    enemyBullets.push(homingBullet);
                    if (isBossEnraged) {
                        const homingBullet2 = new Bullet(bulletX, bulletY, Math.cos(angle + Math.PI) * speed, Math.sin(angle + Math.PI) * speed, '#ff44cc', 15, 15);
                        homingBullet2.homing = true;
                        homingBullet2.homingTimer = 180; // 3秒間追尾
                        enemyBullets.push(homingBullet2);
                    }
                }
                break;
        }
    }
    
    takeDamage(amount) {
        this.health -= amount;
        this.hitTimer = 15;
        score += 50;
        if (this.health <= 0) {
            score += 5000; // ボス撃破ボーナス
            setCurrentState(gameState.CLEAR_WHITEOUT);
        }
    }
}

function spawnEnemy() {
    enemies.push(new Enemy());
}

function spawnBoss() {
    boss = new Boss();
    playRandomBossBgm();
    bossEnrageTimer = 60 * 60; // 60秒
    isBossEnraged = false;
    bossEnragePenaltyTimer = -1;
}

function enrageBoss() {
    isBossEnraged = true;
    purpleFlashTimer = 30; // 0.5秒のフラッシュ
    playRandomBossBgm();
    let newBg;
    do {
        newBg = assets.backgrounds[Math.floor(Math.random() * assets.backgrounds.length)];
    } while (newBg === gameBackground && assets.backgrounds.length > 1);
    gameBackground = newBg;
    bossEnragePenaltyTimer = 10 * 60; // 10秒
}

// --- アセット読み込み ---
function updateLoadingProgress() {
    if (assetsToLoad > 0) {
        const progress = (assetsLoaded / assetsToLoad) * 100;
        const progressBar = document.getElementById('progressBar');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
        const loadingText = document.querySelector('#loading p');
        if(loadingText){
            loadingText.textContent = `NOW LOADING... ${Math.round(progress)}%`;
        }
    }
}

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            assetsLoaded++;
            updateLoadingProgress();
            resolve(img);
        };
        img.onerror = (e) => reject(`Failed to load image: ${src}`);
        img.src = src;
    });
}

function loadAudio(src) {
    return new Promise((resolve, reject) => {
        const audio = new Audio();
        audio.oncanplay = () => {
            assetsLoaded++;
            updateLoadingProgress();
            resolve(audio);
        };
        audio.onerror = (e) => reject(`Failed to load audio: ${src}`);
        audio.src = src;
    });
}

async function loadAssets() {
    const imageTypes = ['player', 'enemies', 'bosses', 'backgrounds', 'cutins'];
    const promises = [];

    // Calculate total assets to load
    assetsToLoad = 0;
    imageTypes.forEach(type => assetsToLoad += assetPaths[type].length);
    Object.values(assetPaths.bgm).forEach(list => assetsToLoad += list.length);
    Object.keys(assetPaths.pngtuber).forEach(() => assetsToLoad++);
    Object.keys(assetPaths.voices).forEach(type => assetsToLoad += assetPaths.voices[type].length);

    // Load images
    for (const type of imageTypes) {
        for (const path of assetPaths[type]) {
            promises.push(loadImage(path).then(img => assets[type].push(img)));
        }
    }

    // Load PNGTuber images
    for (const key in assetPaths.pngtuber) {
        promises.push(loadImage(assetPaths.pngtuber[key]).then(img => assets.pngtuber[key] = img));
    }

    // Load BGM audio
    for (const type in assetPaths.bgm) { // 'normal', 'boss'
        for (const path of assetPaths.bgm[type]) {
            promises.push(loadAudio(path).then(audio => assets.bgm[type].push(audio)));
        }
    }

    // Load voice audio
    for (const type in assetPaths.voices) {
        for (const path of assetPaths.voices[type]) {
            promises.push(loadAudio(path).then(audio => assets.voices[type].push(audio)));
        }
    }

    try {
        await Promise.all(promises);
        const loadingText = document.querySelector('#loading p');
        const loadingScreen = document.getElementById('loading');

        if (loadingText) {
            loadingText.textContent = "Click or Press any key to Start";
            loadingScreen.style.cursor = 'pointer';
        }

        const startApp = () => {
            // Remove both listeners to ensure this only runs once.
            loadingScreen.removeEventListener('click', startApp);
            window.removeEventListener('keydown', startApp);

            if (loading) {
                loading.style.display = 'none';
            }
            setVolume(audioControls.volumeSlider.value);
            setCurrentState(gameState.TITLE);
        };

        loadingScreen.addEventListener('click', startApp);
        window.addEventListener('keydown', startApp);

    } catch (error) {
        console.error("アセットの読み込み中にエラーが発生しました:", error);
        const loadingText = document.querySelector('#loading p');
        if(loadingText) {
            loadingText.textContent = "アセットの読み込みに失敗しました。コンソールを確認してください。";
            loadingText.style.color = 'red';
        }
    }
}

// --- ゲーム初期化 ---
function initGame() {
    recalculateScaling(); // ゲーム開始時にもスケーリングを再計算
    player = new Player();
    boss = null;
    enemies = [];
    enemyBullets = [];
    enemySpawnTimer = 0;
    gameTimer = 0;
    score = 0;
    ultGauge = 0;
    ultReady = false;
    ultUsageCount = 0; // ULT使用回数をリセット
    gameBackground = assets.backgrounds[Math.floor(Math.random() * assets.backgrounds.length)];
    backgroundX = 0;
    pngtuberState = 'normal';
    blinkTimer = 0;
    isVoicePlaying = false;
    bossEnrageTimer = -1;
    isBossEnraged = false;
    bossEnragePenaltyTimer = -1;
    purpleFlashTimer = 0;
}

// --- 当たり判定 ---
function checkCollisions() {
    // プレイヤーの弾 vs 敵
    for (let i = player.bullets.length - 1; i >= 0; i--) {
        const bullet = player.bullets[i];
        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];
            if (isColliding(bullet, enemy)) {
                bullet.active = false;
                enemy.takeDamage(1);
            }
        }
    }

    // プレイヤーの弾 vs ボス
    if (boss) {
        for (let i = player.bullets.length - 1; i >= 0; i--) {
            const bullet = player.bullets[i];
            if (isColliding(bullet, boss)) {
                bullet.active = false;
                boss.takeDamage(1);
            }
        }
    }

    // 敵の弾 vs プレイヤー
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        const bullet = enemyBullets[i];
        if (isColliding(bullet, player)) {
            bullet.active = false;
            player.takeDamage(1);
        }
    }

    // プレイヤー vs 敵
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        if (isColliding(player, enemy)) {
            enemy.active = false;
            player.takeDamage(3);
        }
    }
    
    // プレイヤー vs ボス
    if (boss && isColliding(player, boss)) {
        player.takeDamage(5);
    }

    // 不要になったオブジェクトを配列から削除
    player.bullets = player.bullets.filter(b => b.active);
    enemies = enemies.filter(e => e.active);
    enemyBullets = enemyBullets.filter(b => b.active);
}

function isColliding(rect1, rect2) {
    const margin = 0.7; // 当たり判定を少し厳しく
    return (
        rect1.x < rect2.x + rect2.width * margin &&
        rect1.x + rect1.width * margin > rect2.x &&
        rect1.y < rect2.y + rect2.height * margin &&
        rect1.y + rect1.height * margin > rect2.y
    );
}

function calculateFinalScore() {
    if (!player) return { finalScore: score, lifeBonus: 0, ultPenalty: 0, baseScore: score };
    const lifeBonus = player.health * 1000;
    const ultPenalty = ultUsageCount * 500;
    const finalScore = score + lifeBonus - ultPenalty;
    return { finalScore, lifeBonus, ultPenalty, baseScore: score };
}

// --- PNGTuber更新ロジック ---
function updatePngtuber() {
    blinkTimer++;
    let currentPngtuberImage;

    switch (pngtuberState) {
        case 'damage_hold':
            currentPngtuberImage = assets.pngtuber.dd;
            if (player.hitTimer === 0 && !isVoicePlaying) {
                pngtuberState = 'normal';
            }
            break;
        case 'ult_hold':
            currentPngtuberImage = assets.pngtuber.oo;
            if (!isVoicePlaying) {
                pngtuberState = 'normal';
            }
            break;
        case 'normal':
        default:
            // 通常時は瞬き
            if (blinkTimer > 180) { // 3秒ごとに瞬き
                currentPngtuberImage = assets.pngtuber.cc;
                if (blinkTimer > 188) { // 8フレーム(0.13秒)閉じ続ける
                    blinkTimer = 0;
                }
            } else {
                currentPngtuberImage = assets.pngtuber.oc;
            }
            break;
    }
    if (currentPngtuberImage && pngtuberContainer) {
        pngtuberContainer.style.backgroundImage = `url(${currentPngtuberImage.src})`;
    }
}

// --- 描画と更新 ---
function update() {
    if (currentState === gameState.PLAYING) {
        gameTimer++;
        backgroundX -= 1;
        if (backgroundX <= -canvas.width) {
            backgroundX = 0;
        }

        if (bossEnrageTimer > 0) {
            bossEnrageTimer--;
            if (bossEnrageTimer === 0) {
                enrageBoss();
            }
        }

        if (bossEnragePenaltyTimer > 0) {
            bossEnragePenaltyTimer--;
            if (bossEnragePenaltyTimer === 0) {
                player.takeDamage(1);
                purpleFlashTimer = 30;
                bossEnragePenaltyTimer = 10 * 60; // Reset timer
            }
        }

        if (purpleFlashTimer > 0) {
            purpleFlashTimer--;
        }

        if (!ultReady) {
            ultGauge++;
            if (ultGauge >= ultGaugeMax) {
                ultReady = true;
            }
        }

        // ボス出現ロジック
        if (gameTimer > 3600 && !boss) {
            setCurrentState(gameState.BOSS_APPEAR_FLASH);
        }

        // 雑魚敵のスポーンは常に継続
        enemySpawnTimer++;
        if (enemySpawnTimer % (isBossEnraged ? 80 : 120) === 0) {
            spawnEnemy();
        }
        
        player.update();
        enemies.forEach(e => e.update());
        if (boss) boss.update();
        enemyBullets.forEach(b => b.update());
        updatePngtuber();
        updateUI();

        checkCollisions();
    } else if (currentState === gameState.ULT_CUTIN) {
        ultCutinTimer++;
        if (ultCutinTimer > 30) { // 0.5秒間表示
            ultCutinTimer = 0;
            // ULT効果発動
            score += enemies.length * 100;
            enemies = [];
            enemyBullets = []; // 敵弾も消去
            ultGauge = 0;
            ultReady = false;
            setCurrentState(gameState.PLAYING);
        }
    } else if (currentState === gameState.BOSS_APPEAR_FLASH) {
        transitionTimer++;
        if (transitionTimer > 30) { // 0.5秒の演出
            let newBg;
            do {
                newBg = assets.backgrounds[Math.floor(Math.random() * assets.backgrounds.length)];
            } while (newBg === gameBackground && assets.backgrounds.length > 1);
            gameBackground = newBg;
            spawnBoss();
            setCurrentState(gameState.PLAYING);
        }
    } else if (currentState === gameState.CLEAR_WHITEOUT) {
        transitionTimer++;
        if (transitionTimer > 60) { // 1秒かけてホワイトアウト
            setCurrentState(gameState.CLEAR);
        }
    } else if (currentState === gameState.GAMEOVER_BLACKOUT) {
        transitionTimer++;
        if (transitionTimer > 60) { // 1秒かけてブラックアウト
            setCurrentState(gameState.GAMEOVER);
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    switch (currentState) {
        case gameState.LOADING:
            drawLoadingScreen();
            break;
        case gameState.TITLE:
            drawTitleScreen();
            break;
        case gameState.PLAYING:
        case gameState.PAUSED:
        case gameState.ULT_CUTIN:
            drawGameScreen();
            if (currentState === gameState.PAUSED) {
                drawPausedScreen();
            } else if (currentState === gameState.ULT_CUTIN) {
                drawUltCutinScreen();
            }
            break;
        case gameState.GAMEOVER:
            drawGameoverScreen();
            break;
        case gameState.CLEAR:
            // この描画はHTMLに置き換えられた
            break;
        case gameState.BOSS_APPEAR_FLASH:
            drawGameScreen();
            // 3回点滅させる
            if (transitionTimer < 30 && Math.floor(transitionTimer / 5) % 2 === 0) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            break;
        case gameState.CLEAR_WHITEOUT:
            drawGameScreen();
            ctx.fillStyle = `rgba(255, 255, 255, ${transitionTimer / 60})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            break;
        case gameState.GAMEOVER_BLACKOUT:
            drawGameScreen();
            ctx.fillStyle = `rgba(0, 0, 0, ${transitionTimer / 60})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            break;
    }

    if (purpleFlashTimer > 0) {
        ctx.fillStyle = `rgba(128, 0, 128, ${0.5 * (purpleFlashTimer / 30)})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

// --- 各画面の描画 ---
function drawImageWithAspectRatio(img, x, y, width, height) {
    const imgRatio = img.width / img.height;
    const canvasRatio = width / height;
    let drawWidth = width;
    let drawHeight = height;
    let offsetX = x;
    let offsetY = y;

    if (imgRatio > canvasRatio) {
        drawHeight = width / imgRatio;
        offsetY += (height - drawHeight) / 2;
    } else {
        drawWidth = height * imgRatio;
        offsetX += (width - drawWidth) / 2;
    }
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
}

function updateUI() {
    if (!player) return;

    if (scoreEl) {
        scoreEl.textContent = `Score: ${score}`;
    }
    if (lifeEl) {
        lifeEl.textContent = `Life: ${player.health}`;
    }
    if (ultGaugeBarEl) {
        const ultPercent = (ultGauge / ultGaugeMax) * 100;
        ultGaugeBarEl.style.width = `${ultPercent}%`;
        if (ultReady) {
            ultGaugeBarEl.style.backgroundColor = '#00ff00';
        } else {
            ultGaugeBarEl.style.backgroundColor = '#ff00ff';
        }
    }
}

function drawControls(yOffset) {
    ctx.font = `${scaleValue(20)}px "Meiryo"`;
    ctx.textAlign = 'center';
    if (isMobile) {
        ctx.fillText('スワイプ: 移動', canvas.width / 2, yOffset);
        ctx.fillText('自動で攻撃します', canvas.width / 2, yOffset + scaleValue(30));
    } else {
        ctx.fillText('WASD/矢印: 移動', canvas.width / 2, yOffset);
        ctx.fillText('スペース/左クリック: 攻撃', canvas.width / 2, yOffset + scaleValue(30));
        ctx.fillText('Shift/右クリック: ULT', canvas.width / 2, yOffset + scaleValue(60));
        ctx.fillText('ESC: 一時停止', canvas.width / 2, yOffset + scaleValue(90));
    }
}

function drawLoadingScreen() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff';
    ctx.font = `${scaleValue(30)}px "MS Gothic"`;
    ctx.textAlign = 'center';
    if (assetsToLoad > 0) {
        ctx.fillText(`Now Loading... (${assetsLoaded}/${assetsToLoad})`, canvas.width / 2, canvas.height / 2 - scaleValue(50));
    } else {
        ctx.fillText('Now Loading...', canvas.width / 2, canvas.height / 2 - scaleValue(50));
    }
    drawControls(canvas.height / 2 + scaleValue(50));
}

function drawTitleScreen() {
    if (assets.currentTitleCutin) {
        drawImageWithAspectRatio(assets.currentTitleCutin, 0, 0, canvas.width, canvas.height);
    }
    else {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, canvas.height / 2 - scaleValue(60), canvas.width, scaleValue(260));
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${scaleValue(50)}px "Meiryo"`;
    ctx.textAlign = 'center';
    ctx.fillText('えいえんのアサリガール', canvas.width / 2, canvas.height / 2);
    ctx.font = `${scaleValue(24)}px "Meiryo"`;
    ctx.fillText(isMobile ? 'Tap to Start' : 'Click to Start', canvas.width / 2, canvas.height / 2 + scaleValue(60));

    drawControls(canvas.height / 2 + scaleValue(110));
}

function drawGameScreen() {
    ctx.drawImage(gameBackground, backgroundX, 0, canvas.width, canvas.height);
    ctx.drawImage(gameBackground, backgroundX + canvas.width, 0, canvas.width, canvas.height);

    player.draw();
    enemies.forEach(e => e.draw());
    if (boss) boss.draw();
    enemyBullets.forEach(b => b.draw());

    // Draw timers
    ctx.font = `${scaleValue(30)}px "MS Gothic"`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const hpBarRightX = canvas.width / 2 + scaleValue(200);
    const timerY = scaleValue(30);

    if (bossEnrageTimer > 0) {
        ctx.fillStyle = 'white';
        ctx.fillText(`CountDown: ${Math.ceil(bossEnrageTimer / 60)}`, hpBarRightX + scaleValue(20), timerY);
    } else if (isBossEnraged && bossEnragePenaltyTimer > 0) {
        ctx.fillStyle = 'magenta';
        ctx.fillText(`Penalty: ${Math.ceil(bossEnragePenaltyTimer / 60)}`, hpBarRightX + scaleValue(20), timerY);
    }
}

function drawPausedScreen() {
    // ボタンのサイズと位置を定義
    const buttonWidth = scaleValue(280);
    const buttonHeight = scaleValue(70);
    const gap = scaleValue(40);
    const totalHeight = buttonHeight * 2 + gap;
    const startY = (canvas.height - totalHeight) / 2;

    resumeButtonRect = {
        x: (canvas.width - buttonWidth) / 2,
        y: startY,
        width: buttonWidth,
        height: buttonHeight
    };

    titleButtonRect = {
        x: (canvas.width - buttonWidth) / 2,
        y: startY + buttonHeight + gap,
        width: buttonWidth,
        height: buttonHeight
    };

    // 半透明のオーバーレイ
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // ボタンの描画
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // ゲームに戻るボタン
    ctx.fillStyle = '#333';
    ctx.fillRect(resumeButtonRect.x, resumeButtonRect.y, resumeButtonRect.width, resumeButtonRect.height);
    ctx.fillStyle = '#fff';
    ctx.font = `${scaleValue(32)}px sans-serif`;
    ctx.fillText('ゲームに戻る', canvas.width / 2, resumeButtonRect.y + buttonHeight / 2);

    // タイトルに戻るボタン
    ctx.fillStyle = '#333';
    ctx.fillRect(titleButtonRect.x, titleButtonRect.y, titleButtonRect.width, titleButtonRect.height);
    ctx.fillStyle = '#fff';
    ctx.font = `${scaleValue(32)}px sans-serif`;
    ctx.fillText('タイトルに戻る', canvas.width / 2, titleButtonRect.y + buttonHeight / 2);
}

function drawGameoverScreen() {
    if (assets.currentGameoverCutin) {
        drawImageWithAspectRatio(assets.currentGameoverCutin, 0, 0, canvas.width, canvas.height);
    }
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${scaleValue(70)}px "Meiryo"`;
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - scaleValue(100));

    const scores = calculateFinalScore();
    ctx.font = `${scaleValue(30)}px "Meiryo"`;
    ctx.fillText(`Score: ${scores.baseScore}`, canvas.width / 2, canvas.height / 2 - scaleValue(20));
    ctx.fillText(`Life Bonus: +${scores.lifeBonus}`, canvas.width / 2, canvas.height / 2 + scaleValue(20));
    ctx.fillText(`ULT Penalty: -${scores.ultPenalty}`, canvas.width / 2, canvas.height / 2 + scaleValue(60));
    ctx.font = `bold ${scaleValue(40)}px "Meiryo"`;
    ctx.fillText(`Final Score: ${scores.finalScore}`, canvas.width / 2, canvas.height / 2 + scaleValue(110));

    ctx.font = `${scaleValue(24)}px "Meiryo"`;
    ctx.fillText(isMobile ? 'Tap to Restart' : 'Click to Restart', canvas.width / 2, canvas.height / 2 + scaleValue(160));
}

function drawUltCutinScreen() {
    if (assets.currentUltCutin) {
        drawImageWithAspectRatio(assets.currentUltCutin, 0, 0, canvas.width, canvas.height);
    }
}


// --- ゲームループ ---
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// --- 状態変更とイベントリスナー ---
function handleSkip(e) {
    skipEndingVideo();
}

function setCurrentState(newState) {
    const previousState = currentState;
    currentState = newState;
    transitionTimer = 0; // 状態が変わる際にタイマーをリセット

    // Pause/Resume Mute Logic
    if (newState === gameState.PAUSED) {
        if (audioControls.volumeSlider.value > 0) {
            isMutedByPause = true;
            lastVolume = audioControls.volumeSlider.value;
            setVolume(0);
            audioControls.volumeSlider.value = 0;
        }
    } else if (previousState === gameState.PAUSED && newState === gameState.PLAYING) {
        if (isMutedByPause) {
            setVolume(lastVolume);
            audioControls.volumeSlider.value = lastVolume;
            isMutedByPause = false;
        }
    }

    const gameUiContainer = document.getElementById('gameUiContainer');

    // モバイルでのみ、ゲームの状態に応じて一時停止ボタンの表示を切り替える
    if (isMobile) {
        if (newState === gameState.PLAYING) {
            pauseButton.style.display = 'block';
        } else {
            pauseButton.style.display = 'none';
        }
    }

    if (gameUiContainer) {
        if (newState === gameState.PLAYING) {
            gameUiContainer.style.display = 'flex';
        } else if (newState === gameState.TITLE || newState === gameState.GAMEOVER || newState === gameState.CLEAR) {
            gameUiContainer.style.display = 'none';
        }
    }

    switch (newState) {
        case gameState.TITLE:
            assets.currentTitleCutin = assets.cutins[Math.floor(Math.random() * assets.cutins.length)];
            playRandomNormalBgm();
            ultGauge = 0;
            ultReady = false;
            purpleFlashTimer = 0;
            break;
        case gameState.GAMEOVER:
            assets.currentGameoverCutin = assets.cutins[Math.floor(Math.random() * assets.cutins.length)];
            stopAllBgm();
            playRandomBossBgm();
            purpleFlashTimer = 0;
            break;
        case gameState.CLEAR:
            playRandomNormalBgm();
            canvas.style.display = 'none';
            audioControlsContainer.style.display = 'none';
            const randomCutin = assets.cutins[Math.floor(Math.random() * assets.cutins.length)];
            clearScreen.style.backgroundImage = `url(${randomCutin.src})`;
            const scores = calculateFinalScore();
            document.getElementById('baseScore').textContent = `Score: ${scores.baseScore}`;
            document.getElementById('lifeBonus').textContent = `Life Bonus: +${scores.lifeBonus}`;
            document.getElementById('ultPenalty').textContent = `ULT Penalty: -${scores.ultPenalty}`;
            document.getElementById('finalScore').textContent = `Final Score: ${scores.finalScore}`;
            clearScreen.style.display = 'flex';
            purpleFlashTimer = 0;
            break;
    }
}

function playEndingVideo() {
    stopAllBgm();
    clearScreen.style.display = 'none';
    const videoSrc = assetPaths.endings[Math.floor(Math.random() * assetPaths.endings.length)];
    endingVideo.src = videoSrc;
    endingVideo.style.display = 'block';
    
    const playPromise = endingVideo.play();
    if (playPromise !== undefined) {
        playPromise.then(_ => {
            window.addEventListener('keydown', handleSkip, { once: true });
            window.addEventListener('mousedown', handleSkip, { once: true });
            if (isMobile) window.addEventListener('touchstart', handleSkip, { once: true });
        }).catch(error => {
            console.error("Video play failed:", error);
            skipEndingVideo();
        });
    }

    endingVideo.onended = () => {
        skipEndingVideo();
    };
}

function skipEndingVideo() {
    window.removeEventListener('keydown', handleSkip);
    window.removeEventListener('mousedown', handleSkip);
    if (isMobile) window.removeEventListener('touchstart', handleSkip);
    endingVideo.pause();
    endingVideo.style.display = 'none';
    endingVideo.src = "";
    endingVideo.onended = null;
    backToTitle();
}

function backToTitle() {
    clearScreen.style.display = 'none';
    canvas.style.display = 'block';
    audioControlsContainer.style.display = 'flex';
    stopAllBgm();
    setCurrentState(gameState.TITLE);
}

function handleKeyDown(e) {
    keys[e.code] = true;
    if (e.code === 'Escape') {
        if (currentState === gameState.PLAYING) {
            setCurrentState(gameState.PAUSED);
        } else if (currentState === gameState.PAUSED) {
            setCurrentState(gameState.PLAYING);
        }
    }
}

// --- BGMコントロール ---
function playRandomNormalBgm() {
    if (assets.bgm.normal.length === 0) return;
    let newBgm;
    do {
        newBgm = assets.bgm.normal[Math.floor(Math.random() * assets.bgm.normal.length)];
    } while (assets.bgm.normal.length > 1 && newBgm === assets.currentBgm);
    playBgm(newBgm);
}

function playRandomBossBgm() {
    if (assets.bgm.boss.length === 0) return;
    let newBgm;
    do {
        newBgm = assets.bgm.boss[Math.floor(Math.random() * assets.bgm.boss.length)];
    } while (assets.bgm.boss.length > 1 && newBgm === assets.currentBgm);
    playBgm(newBgm);
}

function playBgm(bgm) {
    stopAllBgm();
    if (bgm) {
        bgm.loop = true;
        bgm.play().catch(err => console.error("Audio play failed:", err));
        assets.currentBgm = bgm;
    }
}

function stopAllBgm() {
    Object.values(assets.bgm).flat().forEach(bgm => {
        bgm.pause();
        bgm.currentTime = 0;
    });
    if (assets.currentBgm) {
        assets.currentBgm.pause();
        assets.currentBgm.currentTime = 0;
        assets.currentBgm = null;
    }
}

function setVolume(volume) {
    const bgmVolume = Math.min(1, volume * 0.25);
    Object.values(assets.bgm).flat().forEach(audio => {
        if(audio) audio.volume = bgmVolume;
    });
    if(endingVideo) endingVideo.volume = volume;

    if (voiceMuteButton) {
        voiceMuteButton.disabled = volume == 0;
    }

    if (volume > 0) {
        audioControls.muteButton.textContent = 'Mute';
        lastVolume = volume;
    } else {
        audioControls.muteButton.textContent = 'Unmute';
    }
}

function toggleMute() {
    const isMuted = audioControls.volumeSlider.value == 0;
    if (isMuted) {
        setVolume(lastVolume);
        audioControls.volumeSlider.value = lastVolume;
    } else {
        lastVolume = audioControls.volumeSlider.value;
        setVolume(0);
        audioControls.volumeSlider.value = 0;
    }
}

// --- イベントリスナー設定 ---
function handleCanvasClick(clickX, clickY) {
    if (currentState === gameState.TITLE) {
        initGame();
        playRandomNormalBgm();
        setCurrentState(gameState.PLAYING);
    } else if (currentState === gameState.GAMEOVER) {
        setCurrentState(gameState.TITLE);
    } else if (currentState === gameState.PAUSED) {
        // ゲームに戻るボタンの判定
        if (clickX > resumeButtonRect.x && clickX < resumeButtonRect.x + resumeButtonRect.width &&
            clickY > resumeButtonRect.y && clickY < resumeButtonRect.y + resumeButtonRect.height) {
            setCurrentState(gameState.PLAYING);
        }
        // タイトルに戻るボタンの判定
        if (clickX > titleButtonRect.x && clickX < titleButtonRect.x + titleButtonRect.width &&
            clickY > titleButtonRect.y && clickY < titleButtonRect.y + titleButtonRect.height) {
            backToTitle();
        }
    }
}

// PC用
window.addEventListener('mousedown', (e) => {
    if (e.target === canvas) {
        if (e.button === 0) {
            mouse.left = true;
            handleCanvasClick(e.clientX, e.clientY);
        }
        if (e.button === 2) mouse.right = true;
    }
});
window.addEventListener('mouseup', (e) => {
    if (e.button === 0) mouse.left = false;
    if (e.button === 2) mouse.right = false;
});

// スマホ用
window.addEventListener('touchstart', (e) => {
    if (e.target === canvas) {
        e.preventDefault();
        const touch = e.touches[0];
        touchX = touch.clientX;
        touchY = touch.clientY;
        handleCanvasClick(touch.clientX, touch.clientY); // タイトル画面や一時停止画面でのタップに対応
    }
}, { passive: false });

window.addEventListener('touchmove', (e) => {
    if (e.target === canvas) {
        e.preventDefault();
        const touch = e.touches[0];
        touchX = touch.clientX;
        touchY = touch.clientY;
    }
}, { passive: false });

window.addEventListener('touchend', (e) => {
    if (e.target === canvas) {
        if (currentState !== gameState.PLAYING) {
             touchX = null;
             touchY = null;
        }
    }
});


if (playEndingBtn) playEndingBtn.addEventListener('click', playEndingVideo);
if (backToTitleBtn) backToTitleBtn.addEventListener('click', backToTitle);
if (ultButton) ultButton.addEventListener('click', () => {
    if (player && ultReady && currentState === gameState.PLAYING) {
        player.useUlt();
    }
});

if (pauseButton) {
    pauseButton.addEventListener('click', () => {
        if (currentState === gameState.PLAYING) {
            setCurrentState(gameState.PAUSED);
        } else if (currentState === gameState.PAUSED) {
            setCurrentState(gameState.PLAYING);
        }
    });
}

window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', (e) => { keys[e.code] = false; });
if (audioControls.muteButton) audioControls.muteButton.addEventListener('click', toggleMute);
if (audioControls.volumeSlider) audioControls.volumeSlider.addEventListener('input', (e) => setVolume(e.target.value));
if (voiceMuteButton) voiceMuteButton.addEventListener('click', () => {
    isVoiceMuted = !isVoiceMuted;
    voiceMuteButton.textContent = isVoiceMuted ? 'VoiceUnmute' : 'VoiceMute';
});

function checkOrientation() {
    if (!isMobile) return;

    const isPortrait = window.innerHeight > window.innerWidth;
    if (isPortrait) {
        orientationOverlay.style.display = 'flex';
    } else {
        orientationOverlay.style.display = 'none';
        // 画面の向きが変わった時にUIを再調整
        recalculateScaling();
    }
}

window.addEventListener('resize', () => {
    recalculateScaling();
    checkOrientation();
});

checkOrientation();


// --- ゲーム開始処理 ---
loadAssets().catch(error => {
    console.error("Failed to load assets:", error);
    ctx.fillStyle = 'red';
    ctx.font = '20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('アセットの読み込みに失敗しました。リロードしてください。', canvas.width / 2, canvas.height / 2);
});

requestAnimationFrame(gameLoop);
