// Linear Motion Simulation
class LinearMotionSimulation extends BaseSimulation {
    constructor(canvas, ctx) {
        super(canvas, ctx);
        this.initialVelocity = 5;
        this.acceleration = 2;
        this.pixelsPerMeter = 50;
    }

    setupInitialState() {
        this.position = 0;
        this.velocity = this.initialVelocity;
        this.trackY = this.displayHeight / 2;
        this.startX = 50;
        this.endX = this.displayWidth - 50;
    }

    updatePhysics() {
        this.velocity = this.initialVelocity + this.acceleration * this.time;
        this.position = this.initialVelocity * this.time + 0.5 * this.acceleration * this.time * this.time;
        const pixelPosition = this.startX + (this.position * this.pixelsPerMeter);
        if (pixelPosition > this.endX + 20) this.reset();
    }

    drawBackground() {
        super.drawBackground();
        this.ctx.strokeStyle = '#6366f1';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(this.startX, this.trackY);
        this.ctx.lineTo(this.endX, this.trackY);
        this.ctx.stroke();
    }

    drawObjects() {
        const pixelPosition = this.startX + (this.position * this.pixelsPerMeter);
        const clampedPosition = Math.min(pixelPosition, this.endX);
        const gradient = this.ctx.createRadialGradient(clampedPosition - 5, this.trackY - 5, 0, clampedPosition, this.trackY, 15);
        gradient.addColorStop(0, '#8b5cf6');
        gradient.addColorStop(1, '#6366f1');
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(clampedPosition, this.trackY, 15, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawUI() {
        super.drawUI();
        this.ctx.fillStyle = '#e2e8f0';
        this.ctx.font = '16px Space Grotesk';
        this.ctx.fillText(`Position: ${this.position.toFixed(2)} m`, 20, 60);
        this.ctx.fillText(`Velocity: ${this.velocity.toFixed(2)} m/s`, 20, 85);
    }
    
    getControls() {
        return [
            { name: 'initialVelocity', label: 'Initial Velocity', min: -10, max: 10, step: 1, value: this.initialVelocity, unit: 'm/s' },
            { name: 'acceleration', label: 'Acceleration', min: -5, max: 5, step: 0.5, value: this.acceleration, unit: 'm/s²' }
        ];
    }
    updateParameter(name, value) { super.updateParameter(name, value); this.reset(); }
}
