const rotationalCanvas = document.getElementById('rotational-canvas');
const rotationalCtx = rotationalCanvas.getContext('2d');
let rotationAngle = 0;
let angularVelocity = 1;

function setAngularVelocity(vel) {
    angularVelocity = vel;
}

function drawRotationalObject() {
    rotationalCtx.clearRect(0, 0, rotationalCanvas.width, rotationalCanvas.height);
    rotationalCtx.save();
    rotationalCtx.translate(rotationalCanvas.width / 2, rotationalCanvas.height / 2);
    rotationalCtx.rotate(rotationAngle);
    rotationalCtx.fillStyle = '#ffc107';
    rotationalCtx.fillRect(-75, -15, 150, 30);
    rotationalCtx.fillStyle = '#6f42c1';
    rotationalCtx.fillRect(-15, -75, 30, 150);
    rotationalCtx.restore();
}

function updateRotationalMotion() {
    rotationAngle += angularVelocity / 60;
    drawRotationalObject();
    requestAnimationFrame(updateRotationalMotion);
}

function initRotationalMotion() {
    updateRotationalMotion();
}
