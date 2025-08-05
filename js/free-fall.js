const freefallCanvas = document.getElementById('freefall-canvas');
const freefallCtx = freefallCanvas.getContext('2d');
let freefallY = 40;
let freefallVelocity = 0;
let gravity = 9.8;
let isFalling = false;

function setGravity(g) {
    gravity = g;
}

function startFreeFall() {
    freefallY = 40;
    freefallVelocity = 0;
    isFalling = true;
}

function drawFreefallObject() {
    freefallCtx.clearRect(0, 0, freefallCanvas.width, freefallCanvas.height);
    freefallCtx.fillStyle = '#dc3545';
    freefallCtx.beginPath();
    freefallCtx.arc(freefallCanvas.width / 2, freefallY, 25, 0, Math.PI * 2);
    freefallCtx.fill();
}

function updateFreeFall() {
    if (isFalling) {
        freefallVelocity += gravity / 60; // Adjust for smoother animation
        freefallY += freefallVelocity;
        if (freefallY > freefallCanvas.height - 25) {
            freefallY = freefallCanvas.height - 25;
            isFalling = false;
        }
    }
    drawFreefallObject();
    requestAnimationFrame(updateFreeFall);
}

function initFreeFall() {
    drawFreefallObject();
    requestAnimationFrame(updateFreeFall);
}
