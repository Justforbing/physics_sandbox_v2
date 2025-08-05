// Linear Motion Simulation
class LinearMotionSimulation extends BaseSimulation {
    constructor(canvas, ctx) {
        super(canvas, ctx);
        
        // Simulation parameters
        this.initialVelocity = 20; // m/s
        this.acceleration = 5; // m/s^2
        this.position = 0; // meters
        this.velocity = this.initialVelocity;
        
        // Visual parameters
        this.objectRadius = 15;
        this.trackY = null;
        this.startX = 50;
        this.endX = null;
        
        // Trail effect
        this.trail = [];
        this.maxTrailLength = 50;
        
        // Graph data
        this.positionData = [];
        this.velocityData = [];
        this.maxDataPoints = 200;
    }

    setupInitialState() {
        this.position = 0;
        this.velocity = this.initialVelocity;
        this.trackY = this.canvas.height / 2;
        this.endX = this.canvas.width - 50;
        this.trail = [];
        this.positionData = [];
        this.velocityData = [];
    }

    updatePhysics() {
        if (!this.startTime) return;
        
        // Kinematic equations
        // v = v₀ + at
        this.velocity = this.initialVelocity + this.acceleration * this.time;
        
        // x = x₀ + v₀t + ½at²
        this.position = this.initialVelocity * this.time + 0.5 * this.acceleration * this.time * this.time;
        
        // Convert position to pixel coordinates
        const pixelPosition = this.startX + (this.position * this.pixelsPerMeter);
        
        // Add to trail
        this.trail.push({
            x: Math.min(pixelPosition, this.endX),
            y: this.trackY,
            time: this.time
        });
        
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }
        
        // Record data for graphs
        this.positionData.push({ time: this.time, value: this.position });
        this.velocityData.push({ time: this.time, value: this.velocity });
        
        if (this.positionData.length > this.maxDataPoints) {
            this.positionData.shift();
            this.velocityData.shift();
        }
        
        // Reset if object goes off screen
        if (pixelPosition > this.endX + 100) {
            this.reset();
        }
    }

    drawBackground() {
        super.drawBackground();
        
        // Draw track
        this.ctx.strokeStyle = '#6366f1';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(this.startX, this.trackY);
        this.ctx.lineTo(this.endX, this.trackY);
        this.ctx.stroke();
        
        // Draw start and end markers
        this.ctx.fillStyle = '#10b981';
        this.ctx.fillRect(this.startX - 2, this.trackY - 10, 4, 20);
        
        this.ctx.fillStyle = '#ef4444';
        this.ctx.fillRect(this.endX - 2, this.trackY - 10, 4, 20);
        
        // Draw distance markers
        this.ctx.fillStyle = '#94a3b8';
        this.ctx.font = '12px Space Grotesk';
        this.ctx.textAlign = 'center';
        
        for (let i = 0; i <= 10; i++) {
            const x = this.startX + (i * (this.endX - this.startX) / 10);
            const distance = (i * (this.endX - this.startX) / 10) / this.pixelsPerMeter;
            
            this.ctx.beginPath();
            this.ctx.moveTo(x, this.trackY - 5);
            this.ctx.lineTo(x, this.trackY + 5);
            this.ctx.stroke();
            
            this.ctx.fillText(distance.toFixed(1) + 'm', x, this.trackY + 20);
        }
        
        this.ctx.textAlign = 'left';
    }

    drawObjects() {
        // Draw trail
        if (this.trail.length > 1) {
            this.ctx.strokeStyle = '#06b6d4';
            this.ctx.lineWidth = 2;
            this.ctx.globalAlpha = 0.6;
            
            this.ctx.beginPath();
            this.ctx.moveTo(this.trail[0].x, this.trail[0].y);
            
            for (let i = 1; i < this.trail.length; i++) {
                this.ctx.lineTo(this.trail[i].x, this.trail[i].y);
            }
            
            this.ctx.stroke();
            this.ctx.globalAlpha = 1;
        }
        
        // Draw object
        const pixelPosition = this.startX + (this.position * this.pixelsPerMeter);
        const clampedPosition = Math.min(pixelPosition, this.endX);
        
        // Object shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.beginPath();
        this.ctx.ellipse(clampedPosition + 3, this.trackY + 15, this.objectRadius, this.objectRadius / 2, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Main object
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
        
        // Object highlight
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.beginPath();
        this.ctx.arc(clampedPosition - 3, this.trackY - 3, this.objectRadius / 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Velocity vector
        if (this.velocity > 0.1) {
            const vectorLength = Math.min(this.velocity * 3, 100);
            
            this.ctx.strokeStyle = '#f59e0b';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(clampedPosition, this.trackY - this.objectRadius - 10);
            this.ctx.lineTo(clampedPosition + vectorLength, this.trackY - this.objectRadius - 10);
            this.ctx.stroke();
            
            // Arrow head
            this.ctx.fillStyle = '#f59e0b';
            this.ctx.beginPath();
            this.ctx.moveTo(clampedPosition + vectorLength, this.trackY - this.objectRadius - 10);
            this.ctx.lineTo(clampedPosition + vectorLength - 8, this.trackY - this.objectRadius - 15);
            this.ctx.lineTo(clampedPosition + vectorLength - 8, this.trackY - this.objectRadius - 5);
            this.ctx.fill();
        }
        
        // Draw mini graphs
        this.drawMiniGraphs();
    }

    drawMiniGraphs() {
        const graphWidth = 150;
        const graphHeight = 80;
        const graphX = this.canvas.width - graphWidth - 20;
        const positionGraphY = 20;
        const velocityGraphY = positionGraphY + graphHeight + 20;
        
        // Position graph
        this.drawGraph(
            this.positionData,
            graphX, positionGraphY, graphWidth, graphHeight,
            'Position (m)', '#10b981'
        );
        
        // Velocity graph
        this.drawGraph(
            this.velocityData,
            graphX, velocityGraphY, graphWidth, graphHeight,
            'Velocity (m/s)', '#f59e0b'
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
        
        this.ctx.fillText(`Position: ${this.position.toFixed(2)} m`, 20, 60);
        this.ctx.fillText(`Velocity: ${this.velocity.toFixed(2)} m/s`, 20, 85);
        this.ctx.fillText(`Acceleration: ${this.acceleration.toFixed(2)} m/s²`, 20, 110);
        
        // Motion equations
        this.ctx.fillStyle = '#94a3b8';
        this.ctx.font = '14px Space Grotesk';
        this.ctx.fillText('Equations:', 20, 140);
        this.ctx.fillText('v = v₀ + at', 20, 160);
        this.ctx.fillText('x = v₀t + ½at²', 20, 180);
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
            // Reset simulation with new parameters
            this.reset();
        }
    }
}
