let canvas, ctx;
let ballRadius = 10;
let balls; // 공을 관리할 배열
let paddleHeight = 10;
let paddleWidth = 75;
let paddleX;
let rightPressed = false;
let leftPressed = false;
let brickRowCount = 5;
let brickColumnCount; // 열 수는 동적으로 계산
let brickWidth;
let brickHeight = 20;
let brickPadding = 5;
let brickOffsetTop = 30;
let brickOffsetLeft = 30;
let score = 0;
let bricks = [];
let itemEffectTimer = null;
let itemDisplayTimer = null;
let itemIcon = ""; // 아이템 아이콘 저장
let originalPaddleWidth = 75; // 원래 패들 너비를 저장

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);


function startGame(difficulty) {
    document.getElementById('startMenu').style.display = 'none';
    canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");
    canvas.style.display = 'block';
    canvas.width = 800;
    canvas.height = 600;


    // 열 수 계산 후 벽돌 너비 설정
    brickColumnCount = Math.floor((canvas.width - 2 * brickOffsetLeft + brickPadding) / (75 + brickPadding));  // 75는 초기 추정치
    setupBricks();  // 이제 여기서 벽돌 설정

    paddleX = (canvas.width - paddleWidth) / 2;
    balls = [{ x: canvas.width / 2, y: canvas.height - 30, dx: 2, dy: -2 }]; // 초기 공 생성
    updateDifficulty(difficulty);

    requestAnimationFrame(draw);  // 게임 루프 시작
 
}

function updateDifficulty(level) {
    switch(level) {
        case "easy":
            paddleWidth = 100; break;
        case "medium":
            paddleWidth = 75; break;
        case "hard":
            paddleWidth = 100; break;
    }
    originalPaddleWidth = paddleWidth; // 난이도에 따라 초기 패들 너비 업데이트
    balls.forEach(ball => {
        switch(level) {
            case "easy":
                ball.dx = 2; ball.dy = -2; break;
            case "medium":
                ball.dx = 4; ball.dy = -4; break;
            case "hard":
                ball.dx = 6; ball.dy = -6; break;
        }
    });
}
function setupBricks() {
    const totalPadding = brickPadding * (brickColumnCount - 1);
    const usableWidth = canvas.width - (brickOffsetLeft * 2);
    brickWidth = (usableWidth - totalPadding) / brickColumnCount;   // 열에 따른 정확한 너비 계산

    bricks = [];
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            let item = Math.random() < 0.1 ? Math.ceil(Math.random() * 3) : 0;
            bricks[c][r] = { x: 0, y: 0, status: 1, item: item };
            let brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
            let brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
            bricks[c][r].x = brickX;
            bricks[c][r].y = brickY;
        }
    }
}
function keyDownHandler(e) {
    if(e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = true;
    } else if(e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if(e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = false;
    } else if(e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = false;
    }
}

function mouseMoveHandler(e) {
    let relativeX = e.clientX - canvas.offsetLeft;
    if (relativeX > 0 && relativeX < canvas.width) {
        paddleX = relativeX - paddleWidth / 2;
    }
}

function collisionDetection() {
    balls.forEach((ball, index) => {
        for (let c = 0; c < brickColumnCount; c++) {
            for (let r = 0; r < brickRowCount; r++) {
                let b = bricks[c][r];
                if (b.status === 1) {
                    // 벽돌과 공의 충돌 검사
                    if (ball.x > b.x - ballRadius && ball.x < b.x + brickWidth + ballRadius &&
                        ball.y > b.y - ballRadius && ball.y < b.y + brickHeight + ballRadius) {
                        
                        // 충돌 위치에 따라 반사 방향 결정
                        if (ball.x < b.x || ball.x > b.x + brickWidth) {
                            ball.dx = -ball.dx; // 좌우 충돌 시 수평 방향 반전
                        }
                        if (ball.y < b.y || ball.y > b.y + brickHeight) {
                            ball.dy = -ball.dy; // 상하 충돌 시 수직 방향 반전
                        }

                        // 공의 위치를 조정하여 벽돌 겹침 방지
                        ball.y += ball.dy;

                        b.status = 0; // 벽돌 제거
                        score++;
                        activateItem(b.item);

                        // 모든 벽돌 제거 시 게임 완료
                        if (score === brickRowCount * brickColumnCount) {
                            alert("모든 벽돌을 파괴했습니다!");
                            document.location.reload();
                        }
                    }
                }
            }
        }

        // 하단 경계 처리
        if(ball.y + ball.dy > canvas.height - ballRadius) {
            if(ball.x > paddleX && ball.x < paddleX + paddleWidth) {
                ball.dy = -ball.dy;
            } else {
                balls.splice(index, 1); // 공 제거
                if(balls.length === 0) { // 모든 공이 제거되면 게임 오버
                    alert("게임 오버");
                    document.location.reload();
                }
            }
        }
    });
}

function activateItem(item) {
    clearTimeout(itemEffectTimer);
    clearTimeout(itemDisplayTimer);
    switch (item) {
        case 1: // 공의 수가 2배로 늘어남
            for (let i = 0; i < balls.length; i++) {
                balls.push({ x: balls[i].x, y: balls[i].y, dx: balls[i].dx, dy: balls[i].dy });
            }
            itemIcon = "🔮X2";
            break;
        case 2: // 공의 수가 4배로 늘어남
            let initialCount = balls.length;
            for (let i = 0; i < 3 * initialCount; i++) {
                balls.push({ x: balls[i % initialCount].x, y: balls[i % initialCount].y, dx: balls[i % initialCount].dx, dy: balls[i % initialCount].dy });
            }
            itemIcon = "🔮X4";
            break;
        case 3: // 패들의 길이가 2배로 늘어남
            paddleWidth *= 2;
            itemIcon = "📏X2";
            itemEffectTimer = setTimeout(() => { paddleWidth = originalPaddleWidth; }, 10000);
            break;
        case 4: // 패들의 길이가 4배로 늘어남
            paddleWidth *= 4;
            itemIcon = "📏X4";
            itemEffectTimer = setTimeout(() => { paddleWidth = originalPaddleWidth; }, 10000);
            break;
        case 5: // 공의 속도가 1.5배로 빨라짐
            balls.forEach(ball => {
                ball.dx *= 1.5;
                ball.dy *= 1.5;
            });
            itemIcon = "🚀";
            itemEffectTimer = setTimeout(() => {
                balls.forEach(ball => {
                    ball.dx /= 1.5;
                    ball.dy /= 1.5;
                });
            }, 10000);
            break;
    }
    if (item > 0) {
        itemDisplayTimer = setTimeout(() => { itemIcon = ""; }, 1000); // 1초 후 아이템 아이콘 제거
    }
}

function drawBall() {
    balls.forEach(ball => {
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ballRadius, 0, Math.PI*2);
        ctx.fillStyle = "#0095DD";
        ctx.fill();
        ctx.closePath();
    });
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = "#FFFF00"; // 노란색으로 설정
    ctx.fill(); 
    ctx.closePath();
}

function drawBricks() {
    for(let c = 0; c < brickColumnCount; c++) {
        for(let r = 0; r < brickRowCount; r++) {
            if(bricks[c][r].status === 1) {
                let brickX = (c*(brickWidth + brickPadding)) + brickOffsetLeft;
                let brickY = (r*(brickHeight + brickPadding)) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = bricks[c][r].item ? "#FF0000" : "#0095DD";  // Red for items
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

function drawItemEffect() {
    if (itemIcon) {
        ctx.font = "48px Arial";
        ctx.fillStyle = "#FFD700";  // 골드색
        ctx.textAlign = "center";
        ctx.fillText(itemIcon, canvas.width / 2, canvas.height / 2);
    }
}

function drawScore() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("Score: " + score, 8, 20);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();
    drawItemEffect();
    collisionDetection();

    balls.forEach((ball, index) => {
        if (ball.x + ball.dx > canvas.width - ballRadius || ball.x + ball.dx < ballRadius) {
            ball.dx = -ball.dx;
        }
        if (ball.y + ball.dy > canvas.height - ballRadius || ball.y + ball.dy < ballRadius) {
            ball.dy = -ball.dy;
        }

        ball.x += ball.dx;
        ball.y += ball.dy;
    });

    requestAnimationFrame(draw);
}

document.addEventListener("DOMContentLoaded", () => {
    // 게임을 로드하고 준비 상태가 되면 이 부분에서 시작 메뉴를 보여주는 로직을 추가
});
