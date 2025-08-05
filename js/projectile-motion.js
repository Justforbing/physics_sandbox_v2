const projectileCanvas = document.getElementById('projectile-canvas');
const projectileCtx = projectileCanvas.getContext('2d');
let projectileX, projectileY, projectileVx, projectileVy;
let projectileGravity = 9.8;
let isLaunching = false;

function launchProjectile(angle, velocity) {
    const angleRad = angle * Math.PI / 180;
    projectileX = 30;
    projectileY = projectileCanvas.height - 30;
    projectileVx = velocity * Math.cos(angleRad);
    projectileVy = -velocity * Math.sin(angleRad);
    isLaunching = true;
}

function drawProjectile() {
    projectileCtx.clearRect(0, 0, projectileCanvas.width, projectileCanvas.height);
    if (isLaunching) {
        projectileCtx.fillStyle = '#28a745';
        projectileCtx.beginPath();
        projectileCtx.arc(projectileX, projectileY, 20, 0, Math.PI * 2);
        projectileCtx.fill();
    }
}

function updateProjectileMotion() {
    if (isLaunching) {
        projectileVy += projectileGravity / 60;
        projectileX += projectileVx;
        projectileY += projectileVy;

        if (projectileY > projectileCanvas.height - 20 || projectileX > projectileCanvas.width) {
            isLaunching = false;
        }
    }
    drawProjectile();
    requestAnimationFrame(updateProjectileMotion);
}

function initProjectileMotion() {
    updateProjectileMotion();
}
