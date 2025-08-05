// js/projectile-motion.js

// Projectile Motion Simulation
class ProjectileMotionSimulation extends BaseSimulation {
    constructor(canvas, ctx) {
        super(canvas, ctx);
        
        this.initialVelocity = 25; // m/s
        this.launchAngle = 45; // degrees
        this.launchHeight = 2; // meters
        
        this.position = { x: 0, y: this.launchHeight };
        this.velocity = { x: 0, y: 0 };
        
        this.objectRadius = 8;
        this.launcherX = 80;
        this.launcherY = null;
        this.scale = 20;
        
        this.trail = [];
        this.maxTrailLength = 200;
        
        this.hasLanded = false;
    }

    setupInitialState() {
        // --- FIX STARTS HERE ---
        const dpr = window.devicePixelRatio || 1;
        const displayHeight = this.canvas.height / dpr;
        // --- FIX ENDS HERE ---

        const angleRad = (this.launchAngle * Math.PI) / 180;
        this.velocity.x = this.initialVelocity * Math.cos(angleRad);
        this.velocity.y = this.initialVelocity * Math.sin(angleRad);
        
        this.position.x = 0;
        this.position.y = this.launchHeight;
        
        this.hasLanded = false;
        
        this.launcherY = displayHeight - 80 - (this.launchHeight * this.scale);
        
        this.trail = [];
    }

    updatePhysics() {
        if (!this.startTime || this.hasLanded) return;
        
        this.velocity.y -= this.gravity * this.dt;
        this.position.x += this.velocity.x * this.dt;
        this.position.y += this.velocity.y * this.dt;
        
        if (this.position.y <= 0 && this.velocity.y < 0) {
            this.position.y = 0;
            this.hasLanded = true;
        }
        
        const pixelX = this.launcherX + (this.position.x * this.scale);
        const pixelY = this.launcherY - ((this.position.y - this.launchHeight) * this.scale);
        
        this.trail.push({ x: pixelX, y: pixelY });
        
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }
    }

    drawBackground() {
        super.drawBackground();
        const dpr = window.devicePixelRatio || 1;
        const displayWidth = this.canvas.width / dpr;
        const displayHeight = this.canvas.height / dpr;

        this.ctx.fillStyle = '#059669';
        this.ctx.fillRect(0, displayHeight - 30, displayWidth, 30);
    }

    drawObjects() {
        if (this.trail.length > 1) {
            this.ctx.strokeStyle = '#10b981';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(this.trail[0].x, this.trail[0].y);
            for (let i = 1; i < this.trail.length; i++) {
                this.ctx.lineTo(this.trail[i].x, this.trail[i].y);
            }
            this.ctx.stroke();
        }
        
        if (!this.hasLanded) {
            const pixelX = this.launcherX + (this.position.x * this.scale);
            const pixelY = this.launcherY - ((this.position.y - this.launchHeight) * this.scale);
            
            const gradient = this.ctx.createRadialGradient(
                pixelX - 2, pixelY - 2, 0,
                pixelX, pixelY, this.objectRadius
            );
            gradient.addColorStop(0, '#f97316');
            gradient.addColorStop(1, '#ea580c');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(pixelX, pixelY, this.objectRadius, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    drawUI() {
        super.drawUI();
        
        this.ctx.fillStyle = '#e2e8f0';
        this.ctx.font = '14px Space Grotesk';
        this.ctx.fillText(`Position: (${this.position.x.toFixed(1)}, ${this.position.y.toFixed(1)}) m`, 20, 60);
        this.ctx.fillText(`Velocity: (${this.velocity.x.toFixed(1)}, ${this.velocity.y.toFixed(1)}) m/s`, 20, 80);
    }

    getControls() {
        return [
            { name: 'initialVelocity', label: 'Initial Velocity', min: 5, max: 50, step: 1, value: this.initialVelocity, unit: 'm/s' },
            { name: 'launchAngle', label: 'Launch Angle', min: 5, max: 85, step: 1, value: this.launchAngle, unit: '°' },
            { name: 'launchHeight', label: 'Launch Height', min: 0, max: 10, step: 0.5, value: this.launchHeight, unit: 'm' }
        ];
    }

    updateParameter(name, value) {
        super.updateParameter(name, value);
        if (['initialVelocity', 'launchAngle', 'launchHeight'].includes(name)) {
            this.reset();
        }
    }
}
