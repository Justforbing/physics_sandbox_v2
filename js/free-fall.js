// js/free-fall.js

// Free Fall Simulation
class FreeFallSimulation extends BaseSimulation {
    constructor(canvas, ctx) {
        super(canvas, ctx);
        
        // Simulation parameters
        this.initialHeight = 10; // meters
        this.initialVelocity = 0; // m/s (upward positive)
        this.mass = 1; // kg
        this.airResistance = 0; // coefficient
        
        // Current state
        this.height = this.initialHeight;
        this.velocity = this.initialVelocity;
        this.acceleration = -this.gravity;
        
        // Visual parameters
        this.objectRadius = 15;
        this.groundY = null;
        this.startY = null;
        this.objectX = null;
        
        // Trail and data
        this.trail = [];
        this.maxTrailLength = 100;
        this.heightData = [];
        this.velocityData = [];
        this.maxDataPoints = 200;
        
        // Animation states
        this.hasLanded = false;
        this.bounceCoefficient = 0.6;
    }

    setupInitialState() {
        // --- FIX STARTS HERE ---
        const dpr = window.devicePixelRatio || 1;
        const displayWidth = this.canvas.width / dpr;
        const displayHeight = this.canvas.height / dpr;
        // --- FIX ENDS HERE ---

        this.height = this.initialHeight;
        this.velocity = this.initialVelocity;
        this.acceleration = -this.gravity;
        this.hasLanded = false;
        
        this.groundY = displayHeight - 50;
        this.startY = 50;
        this.objectX = displayWidth / 2;
        
        this.trail = [];
        this.heightData = [];
        this.velocityData = [];
    }

    updatePhysics() {
        if (this.hasLanded) return;
        
        // Apply air resistance if enabled
        let netAcceleration = -this.gravity;
        if (this.airResistance > 0) {
            const airForce = -this.airResistance * this.velocity * Math.abs(this.velocity);
            netAcceleration += airForce / this.mass;
        }
        
        this.acceleration = netAcceleration;
        
        // Update velocity and position using Euler integration
        this.velocity += this.acceleration * this.dt;
        this.height += this.velocity * this.dt;
        
        // Check for ground collision
        if (this.height <= 0 && this.velocity < 0) {
            this.height = 0;
            this.velocity = -this.velocity * this.bounceCoefficient;
            
            if (Math.abs(this.velocity) < 0.5) {
                this.hasLanded = true;
                this.velocity = 0;
            }
        }
        
        // Convert height to pixel coordinates
        const pixelY = this.groundY - (this.height * this.pixelsPerMeter);
        
        // Add to trail
        this.trail.push({
            x: this.objectX,
            y: pixelY,
            time: this.time,
            velocity: this.velocity
        });
        
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }
        
        // Record data
        this.heightData.push({ time: this.time, value: this.height });
        this.velocityData.push({ time: this.time, value: this.velocity });
        
        if (this.heightData.length > this.maxDataPoints) {
            this.heightData.shift();
            this.velocityData.shift();
        }
    }

    drawBackground() {
        super.drawBackground();
        const dpr = window.devicePixelRatio || 1;
        const displayWidth = this.canvas.width / dpr;
        const displayHeight = this.canvas.height / dpr;
        
        // Draw height scale
        this.ctx.strokeStyle = '#6366f1';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(50, this.startY);
        this.ctx.lineTo(50, this.groundY);
        this.ctx.stroke();
        
        // Height markers
        this.ctx.fillStyle = '#94a3b8';
        this.ctx.font = '12px Space Grotesk';
        this.ctx.textAlign = 'right';
        
        const maxHeight = (this.groundY - this.startY) / this.pixelsPerMeter;
        for (let i = 0; i <= maxHeight; i+=2) {
            const y = this.groundY - (i * this.pixelsPerMeter);
            if (y < this.startY) continue;
            
            this.ctx.strokeStyle = '#374151';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(45, y);
            this.ctx.lineTo(55, y);
            this.ctx.stroke();
            
            this.ctx.fillText(i + 'm', 40, y + 4);
        }
        
        // Draw ground
        this.ctx.fillStyle = '#059669';
        this.ctx.fillRect(0, this.groundY, displayWidth, displayHeight - this.groundY);
        
        this.ctx.textAlign = 'left';
    }


    drawObjects() {
        // Draw trail with velocity-based coloring
        if (this.trail.length > 1) {
            for (let i = 1; i < this.trail.length; i++) {
                const alpha = (i / this.trail.length) * 0.8;
                const speed = Math.abs(this.trail[i].velocity);
                const hue = Math.max(0, 240 - speed * 10); // Blue to red based on speed
                
                this.ctx.strokeStyle = `hsla(${hue}, 70%, 60%, ${alpha})`;
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.moveTo(this.trail[i-1].x, this.trail[i-1].y);
                this.ctx.lineTo(this.trail[i].x, this.trail[i].y);
                this.ctx.stroke();
            }
        }
        
        // Draw object
        const pixelY = this.groundY - (this.height * this.pixelsPerMeter);
        
        // Object shadow on ground
        if (this.height > 0.1) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            const shadowRadius = this.objectRadius * (1 - this.height / (this.initialHeight+5) * 0.5);
            this.ctx.beginPath();
            this.ctx.ellipse(this.objectX, this.groundY + 5, shadowRadius, shadowRadius * 0.3, 0, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Main object with gradient
        const gradient = this.ctx.createRadialGradient(
            this.objectX - 4, pixelY - 4, 0,
            this.objectX, pixelY, this.objectRadius
        );
        
        if (this.hasLanded) {
            gradient.addColorStop(0, '#6b7280');
            gradient.addColorStop(1, '#374151');
        } else {
            gradient.addColorStop(0, '#f59e0b');
            gradient.addColorStop(1, '#d97706');
        }
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(this.objectX, pixelY, this.objectRadius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Object highlight
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        this.ctx.beginPath();
        this.ctx.arc(this.objectX - 3, pixelY - 3, this.objectRadius * 0.4, 0, Math.PI * 2);
        this.ctx.fill();
    }


    drawUI() {
        super.drawUI();
        
        // Current values display
        this.ctx.fillStyle = '#e2e8f0';
        this.ctx.font = '16px Space Grotesk';
        
        this.ctx.fillText(`Height: ${this.height.toFixed(2)} m`, 20, 60);
        this.ctx.fillText(`Velocity: ${this.velocity.toFixed(2)} m/s`, 20, 85);
        this.ctx.fillText(`Acceleration: ${this.acceleration.toFixed(2)} m/s²`, 20, 110);
        
        if (this.hasLanded) {
            this.ctx.fillStyle = '#10b981';
            this.ctx.fillText('Object has landed!', 20, 135);
        }
        
        // Free fall equations
        this.ctx.fillStyle = '#94a3b8';
        this.ctx.font = '14px Space Grotesk';
        this.ctx.fillText('Free Fall Equations:', 20, 165);
        this.ctx.fillText('v = v₀ - gt', 20, 185);
        this.ctx.fillText('h = h₀ + v₀t - ½gt²', 20, 205);
    }

    getControls() {
        return [
            {
                name: 'initialHeight',
                label: 'Initial Height',
                min: 1,
                max: 20,
                step: 0.5,
                value: this.initialHeight,
                unit: 'm'
            },
            {
                name: 'initialVelocity',
                label: 'Initial Velocity',
                min: -20,
                max: 20,
                step: 0.5,
                value: this.initialVelocity,
                unit: 'm/s'
            },
            {
                name: 'mass',
                label: 'Mass',
                min: 0.1,
                max: 5,
                step: 0.1,
                value: this.mass,
                unit: 'kg'
            },
            {
                name: 'airResistance',
                label: 'Air Resistance',
                min: 0,
                max: 0.5,
                step: 0.01,
                value: this.airResistance,
                unit: ''
            }
        ];
    }

    updateParameter(name, value) {
        super.updateParameter(name, value);
        
        if (['initialHeight', 'initialVelocity', 'mass', 'airResistance'].includes(name)) {
            this.reset();
        }
    }
}
