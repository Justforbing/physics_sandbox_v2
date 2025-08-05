// Free Fall Simulation
class FreeFallSimulation extends BaseSimulation {
    constructor(canvas, ctx) {
        super(canvas, ctx);
        this.initialHeight = 10;
        this.initialVelocity = 0;
        this.mass = 1;
        this.airResistance = 0;
        this.bounceCoefficient = 0.6;
    }

    setupInitialState() {
        this.height = this.initialHeight;
        this.velocity = this.initialVelocity;
        this.hasLanded = false;
        this.groundY = this.displayHeight - 50;
        this.objectX = this.displayWidth / 2;
    }

    updatePhysics() {
        if (this.hasLanded) return;
        let netAcceleration = -this.gravity + (this.airResistance > 0 ? (-this.airResistance * this.velocity * Math.abs(this.velocity)) / this.mass : 0);
        this.velocity += netAcceleration * this.dt;
        this.height += this.velocity * this.dt;
        if (this.height <= 0 && this.velocity < 0) {
            this.height = 0;
            this.velocity = -this.velocity * this.bounceCoefficient;
            if (Math.abs(this.velocity) < 0.5) this.hasLanded = true;
        }
    }

    drawObjects() {
        const pixelY = this.groundY - (this.height * this.pixelsPerMeter);
        // Shadow
        if (this.height > 0) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            const shadowRadius = 15 * (1 - this.height / (this.initialHeight + 5) * 0.5);
            this.ctx.beginPath();
            this.ctx.ellipse(this.objectX, this.groundY + 2, shadowRadius, shadowRadius * 0.3, 0, 0, Math.PI * 2);
            this.ctx.fill();
        }
        // Object
        const gradient = this.ctx.createRadialGradient(this.objectX - 4, pixelY - 4, 0, this.objectX, pixelY, 15);
        gradient.addColorStop(0, '#f59e0b');
        gradient.addColorStop(1, '#d97706');
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(this.objectX, pixelY, 15, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawUI() {
        super.drawUI();
        this.ctx.fillStyle = '#e2e8f0';
        this.ctx.font = '16px Space Grotesk';
        this.ctx.fillText(`Height: ${this.height.toFixed(2)} m`, 20, 60);
        this.ctx.fillText(`Velocity: ${this.velocity.toFixed(2)} m/s`, 20, 85);
        if (this.hasLanded) {
            this.ctx.fillStyle = '#10b981';
            this.ctx.fillText('Object has landed!', 20, 110);
        }
    }

    getControls() {
        return [
            { name: 'initialHeight', label: 'Initial Height', min: 1, max: (this.displayHeight - 100)/this.pixelsPerMeter, step: 0.5, value: this.initialHeight, unit: 'm' },
            { name: 'initialVelocity', label: 'Initial Velocity', min: -20, max: 20, step: 0.5, value: this.initialVelocity, unit: 'm/s' },
            { name: 'mass', label: 'Mass', min: 0.1, max: 5, step: 0.1, value: this.mass, unit: 'kg' },
            { name: 'airResistance', label: 'Air Resistance', min: 0, max: 0.5, step: 0.01, value: this.airResistance, unit: '' }
        ];
    }
    updateParameter(name, value) { super.updateParameter(name, value); this.reset(); }
}
