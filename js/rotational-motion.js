// js/rotational-motion.js

// Rotational Motion Simulation
class RotationalMotionSimulation extends BaseSimulation {
    constructor(canvas, ctx) {
        super(canvas, ctx);
        
        this.initialAngularVelocity = 2; // rad/s
        this.angularAcceleration = 0.5; // rad/s²
        this.radius = 80; // pixels
        
        this.angle = 0; // radians
        this.angularVelocity = this.initialAngularVelocity;
        this.centerX = null;
        this.centerY = null;
        
        this.spokes = 8;
    }

    setupInitialState() {
        // --- FIX STARTS HERE ---
        const dpr = window.devicePixelRatio || 1;
        const displayWidth = this.canvas.width / dpr;
        const displayHeight = this.canvas.height / dpr;
        // --- FIX ENDS HERE ---

        this.angle = 0;
        this.angularVelocity = this.initialAngularVelocity;
        
        this.centerX = displayWidth / 2;
        this.centerY = displayHeight / 2;
    }

    updatePhysics() {
        if (!this.startTime) return;
        
        this.angularVelocity += this.angularAcceleration * this.dt;
        this.angle += this.angularVelocity * this.dt;
        this.angle %= (Math.PI * 2);
    }

    drawObjects() {
        const gradient = this.ctx.createRadialGradient(
            this.centerX - 20, this.centerY - 20, 0,
            this.centerX, this.centerY, this.radius
        );
        gradient.addColorStop(0, '#8b5cf6');
        gradient.addColorStop(1, '#6366f1');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, this.radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.strokeStyle = '#e2e8f0';
        this.ctx.lineWidth = 3;
        for (let i = 0; i < this.spokes; i++) {
            const spokeAngle = this.angle + (i * Math.PI * 2 / this.spokes);
            const startX = this.centerX + Math.cos(spokeAngle) * 15;
            const startY = this.centerY + Math.sin(spokeAngle) * 15;
            const endX = this.centerX + Math.cos(spokeAngle) * (this.radius - 10);
            const endY = this.centerY + Math.sin(spokeAngle) * (this.radius - 10);
            
            this.ctx.beginPath();
            this.ctx.moveTo(startX, startY);
            this.ctx.lineTo(endX, endY);
            this.ctx.stroke();
        }
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
            { name: 'initialAngularVelocity', label: 'Initial ω', min: 0, max: 10, step: 0.5, value: this.initialAngularVelocity, unit: 'rad/s' },
            { name: 'angularAcceleration', label: 'Angular α', min: -2, max: 2, step: 0.1, value: this.angularAcceleration, unit: 'rad/s²' }
        ];
    }

    updateParameter(name, value) {
        super.updateParameter(name, value);
        if (['initialAngularVelocity', 'angularAcceleration'].includes(name)) {
            this.reset();
        }
    }
}
