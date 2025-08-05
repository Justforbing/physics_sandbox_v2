// Projectile Motion Simulation
class ProjectileMotionSimulation extends BaseSimulation {
    constructor(canvas, ctx) {
        super(canvas, ctx);
        this.initialVelocity = 25;
        this.launchAngle = 45;
        this.launchHeight = 2;
        this.pixelsPerMeter = 20;
    }

    setupInitialState() {
        const angleRad = (this.launchAngle * Math.PI) / 180;
        this.velocity = { x: this.initialVelocity * Math.cos(angleRad), y: this.initialVelocity * Math.sin(angleRad) };
        this.position = { x: 0, y: this.launchHeight };
        this.hasLanded = false;
        this.launcherX = 60;
        this.groundY = this.displayHeight - 50;
        this.launcherY = this.groundY - (this.launchHeight * this.pixelsPerMeter);
        this.trail = [];
        // Reset the camera on each new simulation
        this.camera = { x: 0, y: 0 };
    }

    updatePhysics() {
        if (this.hasLanded) return;
        this.velocity.y -= this.gravity * this.dt;
        this.position.x += this.velocity.x * this.dt;
        this.position.y += this.velocity.y * this.dt;

        if (this.position.y <= 0 && this.velocity.y < 0) this.hasLanded = true;
    }

    // This is the new camera logic
    updateCamera() {
        // Calculate the projectile's position in pixels
        const pixelX = this.launcherX + (this.position.x * this.pixelsPerMeter);
        const pixelY = this.groundY - (this.position.y * this.pixelsPerMeter);

        // Pan horizontally to keep the projectile in the left third of the screen
        this.camera.x = pixelX - this.displayWidth * 0.3;

        // Pan vertically only when the projectile goes above the halfway point
        const verticalThreshold = this.displayHeight / 2;
        if (pixelY < verticalThreshold) {
            this.camera.y = pixelY - verticalThreshold;
        } else {
            // Keep the camera from panning down past the initial view
            this.camera.y = 0; 
        }
    }
    
    drawBackground() {
        super.drawBackground();
        // Draw a very wide ground plane so it's always visible as the camera pans
        this.ctx.fillStyle = '#059669';
        this.ctx.fillRect(this.camera.x - 2000, this.groundY, this.displayWidth + 4000, this.displayHeight);
    }

    drawObjects() {
        // Calculate current projectile position and add to trail
        const pixelX = this.launcherX + (this.position.x * this.pixelsPerMeter);
        const pixelY = this.groundY - (this.position.y * this.pixelsPerMeter);
        if (!this.hasLanded) {
            this.trail.push({ x: pixelX, y: pixelY });
        }
        if (this.trail.length > 400) this.trail.shift();

        // Draw the trail
        if (this.trail.length > 1) {
            this.ctx.strokeStyle = '#10b981';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(this.trail[0].x, this.trail[0].y);
            this.trail.forEach(p => this.ctx.lineTo(p.x, p.y));
            this.ctx.stroke();
        }

        // Draw the projectile object
        if (!this.hasLanded) {
            const gradient = this.ctx.createRadialGradient(pixelX - 2, pixelY - 2, 0, pixelX, pixelY, 8);
            gradient.addColorStop(0, '#f97316');
            gradient.addColorStop(1, '#ea580c');
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(pixelX, pixelY, 8, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    drawUI() {
        super.drawUI();
        this.ctx.fillStyle = '#e2e8f0';
        this.ctx.font = '14px Space Grotesk';
        this.ctx.fillText(`Position: (${this.position.x.toFixed(1)}, ${this.position.y.toFixed(1)}) m`, 20, 60);
    }

    getControls() {
        return [
            { name: 'initialVelocity', label: 'Initial Velocity', min: 5, max: 50, step: 1, value: this.initialVelocity, unit: 'm/s' },
            { name: 'launchAngle', label: 'Launch Angle', min: 5, max: 85, step: 1, value: this.launchAngle, unit: '°' },
            { name: 'launchHeight', label: 'Launch Height', min: 0, max: 10, step: 0.5, value: this.launchHeight, unit: 'm' }
        ];
    }
    updateParameter(name, value) { super.updateParameter(name, value); this.reset(); }
}
