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
    }

    updatePhysics() {
        if (this.hasLanded) return;
        this.velocity.y -= this.gravity * this.dt;
        this.position.x += this.velocity.x * this.dt;
        this.position.y += this.velocity.y * this.dt;
        const pixelX = this.launcherX + (this.position.x * this.pixelsPerMeter);
        const pixelY = this.groundY - (this.position.y * this.pixelsPerMeter);
        this.trail.push({ x: pixelX, y: pixelY });
        if (this.trail.length > 200) this.trail.shift();
        if (this.position.y <= 0 && this.velocity.y < 0) this.hasLanded = true;
    }
    
    drawBackground() {
        super.drawBackground();
        this.ctx.fillStyle = '#059669';
        this.ctx.fillRect(0, this.groundY, this.displayWidth, this.displayHeight - this.groundY);
    }

    drawObjects() {
        if (this.trail.length > 1) {
            this.ctx.strokeStyle = '#10b981';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(this.trail[0].x, this.trail[0].y);
            this.trail.forEach(p => this.ctx.lineTo(p.x, p.y));
            this.ctx.stroke();
        }
        if (!this.hasLanded) {
            const lastPoint = this.trail[this.trail.length - 1] || {x: this.launcherX, y: this.launcherY};
            const gradient = this.ctx.createRadialGradient(lastPoint.x - 2, lastPoint.y - 2, 0, lastPoint.x, lastPoint.y, 8);
            gradient.addColorStop(0, '#f97316');
            gradient.addColorStop(1, '#ea580c');
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(lastPoint.x, lastPoint.y, 8, 0, Math.PI * 2);
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
