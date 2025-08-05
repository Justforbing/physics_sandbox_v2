const linearCanvas = document.getElementById('linear-canvas');
const linearCtx = linearCanvas.getContext('2d');
let linearX = 50;
let linearVelocity = 2;

function setLinearVelocity(vel) {
    linearVelocity = vel;
}

function drawLinearObject() {
    linearCtx.clearRect(0, 0, linearCanvas.width, linearCanvas.height);
    linearCtx.fillStyle = '#007BFF';
    linearCtx.fillRect(linearX, linearCanvas.height / 2 - 20, 40, 40);
}

function updateLinearMotion() {
    linearX += linearVelocity;
    if (linearX > linearCanvas.width) {
        linearX = -40;
    } else if (linearX < -40) {
        linearX = linearCanvas.width;
    }
    drawLinearObject();
    requestAnimationFrame(updateLinearMotion);
}

function initLinearMotion() {
    updateLinearMotion();
}
