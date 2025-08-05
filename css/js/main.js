document.addEventListener('DOMContentLoaded', () => {
    // Universal setup for all canvases
    const canvases = document.querySelectorAll('canvas');
    canvases.forEach(canvas => {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    });

    // --- Linear Motion ---
    const velocitySlider = document.getElementById('velocity');
    const velocityValue = document.getElementById('velocity-value');
    velocitySlider.addEventListener('input', () => {
        velocityValue.textContent = velocitySlider.value;
        setLinearVelocity(parseFloat(velocitySlider.value));
    });
    initLinearMotion();

    // --- Free Fall ---
    const gravitySlider = document.getElementById('gravity');
    const gravityValue = document.getElementById('gravity-value');
    const startFreefallBtn = document.getElementById('start-freefall');
    gravitySlider.addEventListener('input', () => {
        gravityValue.textContent = gravitySlider.value;
        setGravity(parseFloat(gravitySlider.value));
    });
    startFreefallBtn.addEventListener('click', startFreeFall);
    initFreeFall();

    // --- Projectile Motion ---
    const angleSlider = document.getElementById('angle');
    const angleValue = document.getElementById('angle-value');
    const initialVelocitySlider = document.getElementById('initial-velocity');
    const initialVelocityValue = document.getElementById('initial-velocity-value');
    const launchProjectileBtn = document.getElementById('launch-projectile');
    angleSlider.addEventListener('input', () => angleValue.textContent = angleSlider.value);
    initialVelocitySlider.addEventListener('input', () => initialVelocityValue.textContent = initialVelocitySlider.value);
    launchProjectileBtn.addEventListener('click', () => {
        const angle = parseFloat(angleSlider.value);
        const velocity = parseFloat(initialVelocitySlider.value);
        launchProjectile(angle, velocity);
    });
    initProjectileMotion();

    // --- Rotational Motion ---
    const angularVelocitySlider = document.getElementById('angular-velocity');
    const angularVelocityValue = document.getElementById('angular-velocity-value');
    angularVelocitySlider.addEventListener('input', () => {
        angularVelocityValue.textContent = angularVelocitySlider.value;
        setAngularVelocity(parseFloat(angularVelocitySlider.value));
    });
    initRotationalMotion();
});
