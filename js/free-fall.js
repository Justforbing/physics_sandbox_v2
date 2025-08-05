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
        this.objectRadius = 12;
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
        this.bounceCoefficient = 0.7;
    }

    setupInitialState() {
        this.height = this.initialHeight;
        this.velocity = this.initialVelocity;
        this.acceleration = -this.gravity;
        this.hasLanded = false;
        
        this.groundY = this.canvas.height - 50;
        this.startY = 50;
        this.objectX = this.canvas.width / 2;
        
        this.trail = [];
        this.heightData = [];
        this.velocityData = [];
    }

    updatePhysics() {
        if (!this.startTime || this.hasLanded) return;
        
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
            y: Math.max(pixelY, this.startY),
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
        for (let i = 0; i <= maxHeight; i++) {
            const y = this.groundY - (i * this.pixelsPerMeter);
            
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
        this.ctx.fillRect(0, this.groundY, this.canvas.width, this.canvas.height - this.groundY);
        
        // Ground pattern
        this.ctx.fillStyle = '#047857';
        for (let x = 0; x < this.canvas.width; x += 20) {
            this.ctx.fillRect(x, this.groundY, 10, this.canvas.height - this.groundY);
        }
        
        // Draw gravity arrow
        this.drawGravityIndicator();
        
        this.ctx.textAlign = 'left';
    }

    drawGravityIndicator() {
        const arrowX = this.canvas.width - 80;
        const arrowY = 80;
        
        // Arrow shaft
        this.ctx.strokeStyle = '#ef4444';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(arrowX, arrowY);
        this.ctx.lineTo(arrowX, arrowY + 40);
        this.ctx.stroke();
        
        // Arrow head
        this.ctx.fillStyle = '#ef4444';
        this.ctx.beginPath();
        this.ctx.moveTo(arrowX, arrowY + 40);
        this.ctx.lineTo(arrowX - 6, arrowY + 30);
        this.ctx.lineTo(arrowX + 6, arrowY + 30);
        this.ctx.fill();
        
        // Label
        this.ctx.fillStyle = '#ef4444';
        this.ctx.font = '12px Space Grotesk';
        this.ctx.fillText('g = 9.81 m/s²', arrowX - 20, arrowY - 10);
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
        const clampedY = Math.max(pixelY, this.startY);
        
        // Object shadow on ground
        if (this.height > 0.1) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            const shadowRadius = this.objectRadius * (1 + this.height * 0.1);
            this.ctx.beginPath();
            this.ctx.ellipse(this.objectX, this.groundY + 10, shadowRadius, shadowRadius * 0.3, 0, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Main object with gradient
        const gradient = this.ctx.createRadialGradient(
            this.objectX - 4, clampedY - 4, 0,
            this.objectX, clampedY, this.objectRadius
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
        this.ctx.arc(this.objectX, clampedY, this.objectRadius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Object highlight
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        this.ctx.beginPath();
        this.ctx.arc(this.objectX - 3, clampedY - 3, this.objectRadius * 0.4, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Velocity vector
        if (Math.abs(this.velocity) > 0.5 && !this.hasLanded) {
            const vectorLength = Math.min(Math.abs(this.velocity) * 4, 60);
            const direction = this.velocity > 0 ? -1 : 1; // Up is negative Y
            
            this.ctx.strokeStyle = this.velocity > 0 ? '#10b981' : '#ef4444';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(this.objectX + this.objectRadius + 5, clampedY);
            this.ctx.lineTo(this.objectX + this.objectRadius + 5, clampedY + (vectorLength * direction));
            this.ctx.stroke();
            
            // Arrow head
            this.ctx.fillStyle = this.velocity > 0 ? '#10b981' : '#ef4444';
            this.ctx.beginPath();
            const arrowTipY = clampedY + (vectorLength * direction);
            this.ctx.moveTo(this.objectX + this.objectRadius + 5, arrowTipY);
            this.ctx.lineTo(this.objectX + this.objectRadius, arrowTipY - (direction * 8));
            this.ctx.lineTo(this.objectX + this.objectRadius + 10, arrowTipY - (direction * 8));
            this.ctx.fill();
        }
        
        // Draw mini graphs
        this.drawMiniGraphs();
    }

    drawMiniGraphs() {
        const graphWidth = 150;
        const graphHeight = 80;
        const graphX = this.canvas.width - graphWidth - 20;
        const heightGraphY = 20;
        const velocityGraphY = heightGraphY + graphHeight + 20;
        
        // Height graph
        this.drawGraph(
            this.heightData,
            graphX, heightGraphY, graphWidth, graphHeight,
            'Height (m)', '#10b981'
        );
        
        // Velocity graph
        this.drawGraph(
            this.velocityData,
            graphX, velocityGraphY, graphWidth, graphHeight,
            'Velocity (m/s)', '#ef4444'
        );
    }

    drawGraph(data, x, y, width, height, label, color) {
        if (data.length < 2) return;
        
        // Background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(x, y, width, height);
        
        // Border
        this.ctx.strokeStyle = '#374151';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x, y, width, height);
        
        // Label
        this.ctx.fillStyle = '#e2e8f0';
        this.ctx.font = '12px Space Grotesk';
        this.ctx.fillText(label, x + 5, y + 15);
        
        // Find min/max values
        const values = data.map(d => d.value);
        const minValue = Math.min(...values);
        const maxValue = Math.max(...values);
        const range = maxValue - minValue || 1;
        
        // Draw data line
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        
        for (let i = 0; i < data.length; i++) {
            const dataX = x + (i / (data.length - 1)) * width;
            const dataY = y + height - ((data[i].value - minValue) / range) * (height - 20);
            
            if (i === 0) {
                this.ctx.moveTo(dataX, dataY);
            } else {
                this.ctx.lineTo(dataX, dataY);
            }
        }
        
        this.ctx.stroke();
        
        // Current value
        if (data.length > 0) {
            const currentValue = data[data.length - 1].value;
            this.ctx.fillStyle = color;
            this.ctx.font = '10px Space Grotesk';
            this.ctx.fillText(currentValue.toFixed(1), x + width - 40, y + height - 5);
        }
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
                max: 15,
                step: 0.5,
                value: this.initialHeight,
                unit: 'm'
            },
            {
                name: 'initialVelocity',
                label: 'Initial Velocity',
                min: -10,
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
