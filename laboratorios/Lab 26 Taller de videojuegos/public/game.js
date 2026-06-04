const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const H = canvas.height;
const W = canvas.width;

// Configuración
const LANES = 4;
const LANE_WIDTH = W / LANES;
const CAR_WIDTH = 32;
const CAR_HEIGHT = 56;
//const ROAD_SPEED = 320; // pixeles por segundo

//Cambian ROAD_SPEED por:
let roadSpeed = 320;
const BASE_ROAD_SPEED = 320;
const BASE_SPAWN_INTERVAL = 0.9;

const DASH_HEIGHT = 28;
const DASH_GAP = 24;

// Bonus de puntos
let bonus = null;
let bonusTimer = 5;
const BONUS_POINTS = 500;

// Convierte un índice de carril (0..3) a la coord X del centro del auto
function laneToX(lane){
    return lane * LANE_WIDTH + (LANE_WIDTH - CAR_WIDTH) / 2;
}

const player = {
    lane: 1, //empieza en el segundo carril, recuerda empieza en 0
    y: H - 80
};

// Estado del juego
const state = {
    testX: 0
};

// Input
window.addEventListener("keydown", (e) => {
    if(e.key === "ArrowLeft" || e.key === "a"){
        player.lane = Math.max(0, player.lane - 1); // mover a la izquierda, sin salir del carril 0
    }
    if(e.key === "ArrowRight" || e.key === "d"){
        player.lane = Math.min(LANES - 1, player.lane + 1); // mover a la derecha, sin salir del carril 3   
    }
    if(e.key === " " && gameOver){
        enemies.length = 0; // eliminar todos los enemigos
        bonus = null; // eliminar el bonus si estaba en pantalla
        bonusTimer = 5; // reiniciar el tiempo para que vuelva a aparecer
        spawnTimer = 0;
        gameOver = false;
        score = 0;
        scoreSubmitted = false;
        player.lane = 1; // reiniciar posición del jugador
    }
});

let roadOffset = 0;
const enemies = [];
let spawnTimer = 0;
const SPAWN_INTERVAL = 0.9; // segundos entre spawns
let gameOver = false;
let score = 0;
let scoreSubmitted = false; // para evitar múltiples envíos de score

function rectsOverlap(ax,ay,aw,ah,bx,by,bw,bh){
    return  ax < bx+bw && 
            ax+aw > bx && 
            ay < by+bh && 
            ay+ah > by;
}

async function submitScore() {
    if (scoreSubmitted) return;
    scoreSubmitted = true;

    const name = (prompt('GAME OVER\nTu nombre (max 12):', 'ANON') || 'ANON').trim() || 'ANON';

    try {
        const res = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, score: Math.floor(score) })
        });
        const top = await res.json();
        console.log('Nuevo top 10:', top);
    } catch (err) {
        console.error('No se pudo enviar el score', err);
    }
}

function update(dt){
    if(gameOver) return;

    score += dt * 100; // 100 puntos por segundo

    // tope para no romper el juego aumentando la velocidad infinitamente
    roadSpeed = BASE_ROAD_SPEED + Math.min(score / 4, 320); 

    roadOffset = (roadOffset + roadSpeed * dt) % (DASH_HEIGHT + DASH_GAP);

    //Spawn de rivales
    spawnTimer -= dt;
    if(spawnTimer <= 0){
        // a medida que aumenta el score, disminuye el intervalo de spawn, pero no menos de 0.35s
        spawnTimer = Math.max(0.35, BASE_SPAWN_INTERVAL -score / 5000); 
        enemies.push({
            lane: Math.floor(Math.random() * LANES),
            y: -CAR_HEIGHT
        });
    }

    // Spawn del bonus
    bonusTimer -= dt;
    if(bonusTimer <= 0 && bonus === null){
        bonus = {
            lane: Math.floor(Math.random() * LANES),
            y: -CAR_HEIGHT
        };

        bonusTimer = 6;
    }

    //Mover rivales hacia abajo y descartar los que salieron
    for( const e of enemies){
        e.y += roadSpeed * dt;
    }

    // Mover bonus hacia abajo y quitarlo si sale de la pantalla
    if(bonus !== null){
        bonus.y += roadSpeed * dt;

        if(bonus.y > H){
            bonus = null;
        }
    }

    // Eliminar enemigos fuera de pantalla
    for(let i = enemies.length -1; i >= 0; i--){
        if(enemies[i].y > H){
            enemies.splice(i, 1);
        }
    }

    if(!gameOver){
        const px = laneToX(player.lane);
        for(const e of enemies){
            const ex = laneToX(e.lane);
            if(rectsOverlap(px, player.y, CAR_WIDTH, CAR_HEIGHT, 
                ex, e.y, CAR_WIDTH, CAR_HEIGHT)){
                gameOver = true;
                submitScore();
                break;
            }
        }

        // Colisión con bonus
        if(bonus !== null){
            const bx = laneToX(bonus.lane);

            if(rectsOverlap(px, player.y, CAR_WIDTH, CAR_HEIGHT,
                bx, bonus.y, CAR_WIDTH, CAR_HEIGHT)){
                score += BONUS_POINTS; // sumar puntos extra
                bonus = null; // quitar el bonus al tomarlo
            }
        }
    }
}

function render(){
    //Limpiar el canvas
    ctx.fillStyle = "#111122";
    ctx.fillRect(0, 0, W, H);

    // Dibujar un rectángulo de prueba
    //ctx.fillStyle = "#00ffaa";
    //ctx.fillRect(state.testX, H/2, 40, 40);

    // Líneas divisoras entre carriles
    ctx.fillStyle = "#3a3a5a";
    for(let lane = 1; lane < LANES; lane++){
        const x = lane * LANE_WIDTH - 2;
        for(let y = -DASH_HEIGHT + roadOffset; y < H; y += DASH_HEIGHT + DASH_GAP){
            ctx.fillRect(x,y,4,DASH_HEIGHT);
        }
    }

    // Rivales
    ctx.fillStyle = "#ff66cc";
    for(const e of enemies){
        ctx.fillRect(laneToX(e.lane), e.y, CAR_WIDTH, CAR_HEIGHT);
    }

    // Bonus
    if(bonus !== null){
        ctx.fillStyle = "#ffdd33";
        ctx.fillRect(laneToX(bonus.lane), bonus.y, CAR_WIDTH, CAR_HEIGHT);
    }

    // Jugador
    ctx.shadowColor = "#00ffaa";
    ctx.shadowBlur = 12;
    ctx.fillStyle = "#00ffaa";
    ctx.fillRect(laneToX(player.lane), player.y, CAR_WIDTH, CAR_HEIGHT);
    ctx.shadowBlur = 0;

    // Score
    ctx.fillStyle = '#00ffaa';
    ctx.font = 'bold 16px "Courier New", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('SCORE: ' + Math.floor(score), 10, 24);

    // Indicador de velocidad en la esq. superior derecha
    ctx.fillStyle = "#888";
    ctx.font = '12px "Courier New", monospace';
    ctx.textAlign = 'right';
    ctx.fillText('SPEED: ' + Math.floor(roadSpeed), W - 10, 24);

    if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, W, H);

        ctx.fillStyle = '#ff66cc';
        ctx.font = 'bold 28px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', W / 2, H / 2 - 10);

        ctx.fillStyle = '#e0e0ff';
        ctx.font = '14px "Courier New", monospace';
        ctx.fillText('Presiona ESPACIO para reiniciar', W / 2, H / 2 + 20);
    }
}

let lastTime = performance.now();

function loop(now){
    const dt = (now - lastTime) / 1000; // milisegundos a segundos
    lastTime = now;

    update(dt);
    render();

    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);