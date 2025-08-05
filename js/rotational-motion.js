// Rotational Motion Simulation
class RotationalMotionSimulation extends BaseSimulation {
    constructor(canvas, ctx) {
        super(canvas, ctx);
        this.initialAngularVelocity = 2;
        this.angularAcceleration = 0.5;
        this.radius = 80;
        this.spokes = 8;
    }

    setupInitialState() {
        this.angle = 0;
        this.angularVelocity = this.initialAngularVelocity;
        this.centerX = this.displayWidth / 2;
        this.centerY = this.displayHeight / 2;
    }

    updatePhysics() {
        this.angularVelocity += this.angularAcceleration * this.dt;
        this.angle += this.angularVelocity * this.dt;
    }

    drawObjects() {
        this.ctx.save();
        this.ctx.translate(this.centerX, this.centerY);
        this.ctx.rotate(this.angle);
        
        const gradient = this.ctx.createRadialGradient(-20, -20, 0, 0, 0, this.radius);
        gradient.addColorStop(0, '#8b5cf6');
        gradient.addColorStop(1, '#6366f1');
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.strokeStyle = '#e2e8f0';
        this.ctx.lineWidth = 3;
        for (let i = 0; i < this.spokes; i++) {
            this.ctx.rotate((Math.PI * 2) / this.spokes);
            this.ctx.beginPath();
            this.ctx.moveTo(0, 0);
            this.ctx.lineTo(this.radius, 0);
            this.ctx.stroke();
        }
        this.ctx.restore();
    }

    drawUI() {
        super.drawUI();
        this.ctx.fillStyle = '#e2e8f0';
        this.ctx.font = '14px Space Grotesk';
        this.ctx.fillText(`Angle: ${(this.angle * 180 / Math.PI).toFixed(1)}°`, 20, 60);
        this.ctx.fillText(`Angular Velocity: ${this.angularVelocity.toFixed(2)} rad/s`, 20, 80);
    }

    getControls() {
        return [
            { name: 'initialAngularVelocity', label: 'Initial ω', min: -10, max: 10, step: 0.5, value: this.initialAngularVelocity, unit: 'rad/s' },
            { name: 'angularAcceleration', label: 'Angular α', min: -5, max: 5, step: 0.1, value: this.angularAcceleration, unit: 'rad/s²' }
        ];
    }
    updateParameter(name, value) { super.updateParameter(name, value); this.reset(); }
}
