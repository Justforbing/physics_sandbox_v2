// js/linear-motion.js

// Linear Motion Simulation
class LinearMotionSimulation extends BaseSimulation {
    constructor(canvas, ctx) {
        super(canvas, ctx);
        
        this.initialVelocity = 20; // m/s
        this.acceleration = 5; // m/s^2
        this.position = 0; // meters
        this.velocity = this.initialVelocity;
        
        this.objectRadius = 15;
        this.trackY = null;
        this.startX = 50;
        this.endX = null;
        
        this.trail = [];
        this.maxTrailLength = 50;
    }

    setupInitialState() {
        // --- FIX STARTS HERE ---
        const dpr = window.devicePixelRatio || 1;
        const displayWidth = this.canvas.width / dpr;
        const displayHeight = this.canvas.height / dpr;
        // --- FIX ENDS HERE ---

        this.position = 0;
        this.velocity = this.initialVelocity;
        this.trackY = displayHeight / 2;
        this.endX = displayWidth - 50;
        this.trail = [];
    }

    updatePhysics() {
        if (!this.startTime) return;
        
        this.velocity = this.initialVelocity + this.acceleration * this.time;
        this.position = this.initialVelocity * this.time + 0.5 * this.acceleration * this.time * this.time;
        
        const pixelPosition = this.startX + (this.position * this.pixelsPerMeter);
        
        this.trail.push({
            x: Math.min(pixelPosition, this.endX),
            y: this.trackY,
            time: this.time
        });
        
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }
        
        if (pixelPosition > this.endX + 20) {
            this.reset();
            this.pauseAnimation();
        }
    }

    drawBackground() {
        super.drawBackground();
        
        this.ctx.strokeStyle = '#6366f1';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(this.startX, this.trackY);
        this.ctx.lineTo(this.endX, this.trackY);
        this.ctx.stroke();
        
        this.ctx.fillStyle = '#10b981';
        this.ctx.fillRect(this.startX - 2, this.trackY - 10, 4, 20);
        
        this.ctx.fillStyle = '#ef4444';
        this.ctx.fillRect(this.endX - 2, this.trackY - 10, 4, 20);
    }

    drawObjects() {
        const pixelPosition = this.startX + (this.position * this.pixelsPerMeter);
        const clampedPosition = Math.min(pixelPosition, this.endX);
        
        const gradient = this.ctx.createRadialGradient(
            clampedPosition - 5, this.trackY - 5, 0,
            clampedPosition, this.trackY, this.objectRadius
        );
        gradient.addColorStop(0, '#8b5cf6');
        gradient.addColorStop(1, '#6366f1');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(clampedPosition, this.trackY, this.objectRadius, 0, Math.PI * 2);
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
            {
                name: 'initialVelocity',
                label: 'Initial Velocity',
                min: 0,
                max: 50,
                step: 1,
                value: this.initialVelocity,
                unit: 'm/s'
            },
            {
                name: 'acceleration',
                label: 'Acceleration',
                min: -20,
                max: 20,
                step: 0.5,
                value: this.acceleration,
                unit: 'm/s²'
            }
        ];
    }

    updateParameter(name, value) {
        super.updateParameter(name, value);
        
        if (name === 'initialVelocity' || name === 'acceleration') {
            this.reset();
        }
    }
}
