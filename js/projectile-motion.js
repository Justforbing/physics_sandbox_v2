// Projectile Motion Simulation
class ProjectileMotionSimulation extends BaseSimulation {
    constructor(canvas, ctx) {
        super(canvas, ctx);
        
        // Simulation parameters
        this.initialVelocity = 25; // m/s
        this.launchAngle = 45; // degrees
        this.launchHeight = 2; // meters
        this.airResistance = 0; // coefficient
        this.windSpeed = 0; // m/s (positive = right)
        
        // Current state
        this.position = { x: 0, y: this.launchHeight };
        this.velocity = { x: 0, y: 0 };
        this.acceleration = { x: 0, y: -this.gravity };
        
        // Visual parameters
        this.objectRadius = 8;
        this.launcherX = 80;
        this.launcherY = null;
        this.scale = 20; // pixels per meter
        
        // Trail and trajectory
        this.trail = [];
        this.maxTrailLength = 200;
        this.trajectoryPrediction = [];
        this.showPrediction = true;
        
        // Data recording
        this.heightData = [];
        this.rangeData = [];
        this.speedData = [];
        this.maxDataPoints = 300;
        
        // Animation states
        this.hasLanded = false;
        this.maxHeight = 0;
        this.range = 0;
        this.flightTime = 0;
    }

    setupInitialState() {
        // Calculate initial velocity components
        const angleRad = (this.launchAngle * Math.PI) / 180;
        this.velocity.x = this.initialVelocity * Math.cos(angleRad);
        this.velocity.y = this.initialVelocity * Math.sin(angleRad);
        
        // Reset position
        this.position.x = 0;
        this.position.y = this.launchHeight;
        
        // Reset state
        this.hasLanded = false;
        this.maxHeight = this.launchHeight;
        this.range = 0;
        this.flightTime = 0;
        
        // Set visual parameters
        this.launcherY = this.canvas.height - 80 - (this.launchHeight * this.scale);
        
        // Clear data
        this.trail = [];
        this.heightData = [];
        this.rangeData = [];
        this.speedData = [];
        
        // Calculate trajectory prediction
        this.calculateTrajectoryPrediction();
    }

    calculateTrajectoryPrediction() {
        this.trajectoryPrediction = [];
        
        // Simulate trajectory without air resistance for prediction
        const dt = 0.05;
        let predPos = { x: 0, y: this.launchHeight };
        let predVel = { ...this.velocity };
        let t = 0;
        
        while (predPos.y >= 0 && t < 20) {
            this.trajectoryPrediction.push({
                x: this.launcherX + (predPos.x * this.scale),
                y: this.launcherY - ((predPos.y - this.launchHeight) * this.scale)
            });
            
            // Simple ballistic trajectory (no air resistance)
            predVel.y -= this.gravity * dt;
            predPos.x += predVel.x * dt;
            predPos.y += predVel.y * dt;
            
            t += dt;
        }
    }

    updatePhysics() {
        if (!this.startTime || this.hasLanded) return;
        
        // Calculate forces
        let netAcceleration = { x: 0, y: -this.gravity };
        
        // Add wind effect
        if (this.windSpeed !== 0) {
            netAcceleration.x += this.windSpeed * 0.1;
        }
        
        // Add air resistance if enabled
        if (this.airResistance > 0) {
            const speed = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2);
            if (speed > 0) {
                const dragMagnitude = this.airResistance * speed * speed;
                netAcceleration.x -= (dragMagnitude * this.velocity.x) / speed;
                netAcceleration.y -= (dragMagnitude * this.velocity.y) / speed;
            }
        }
        
        this.acceleration = netAcceleration;
        
        // Update velocity and position using Verlet integration for better accuracy
        this.velocity.x += this.acceleration.x * this.dt;
        this.velocity.y += this.acceleration.y * this.dt;
        this.position.x += this.velocity.x * this.dt;
        this.position.y += this.velocity.y * this.dt;
        
        // Track maximum height
        this.maxHeight = Math.max(this.maxHeight, this.position.y);
        
        // Check for ground collision
        if (this.position.y <= 0 && this.velocity.y < 0) {
            this.position.y = 0;
            this.hasLanded = true;
            this.range = this.position.x;
            this.flightTime = this.time;
        }
        
        // Add to trail
        const pixelX = this.launcherX + (this.position.x * this.scale);
        const pixelY = this.launcherY - ((this.position.y - this.launchHeight) * this.scale);
        
        this.trail.push({
            x: Math.min(pixelX, this.canvas.width - 20),
            y: Math.max(pixelY, 20),
            time: this.time,
            speed: Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2)
        });
        
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }
        
        // Record data
        this.heightData.push({ time: this.time, value: this.position.y });
        this.rangeData.push({ time: this.time, value: this.position.x });
        this.speedData.push({ 
            time: this.time, 
            value: Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2) 
        });
        
        if (this.heightData.length > this.maxDataPoints) {
            this.heightData.shift();
            this.rangeData.shift();
            this.speedData.shift();
        }
    }

    drawBackground() {
        super.drawBackground();
        
        // Draw ground
        this.ctx.fillStyle = '#059669';
        this.ctx.fillRect(0, this.canvas.height - 30, this.canvas.width, 30);
        
        // Ground pattern
        this.ctx.fillStyle = '#047857';
        for (let x = 0; x < this.canvas.width; x += 30) {
            this.ctx.fillRect(x, this.canvas.height - 30, 15, 30);
        }
        
        // Draw launcher
        this.drawLauncher();
        
        // Draw distance markers
        this.drawDistanceMarkers();
        
        // Draw wind indicator
        if (this.windSpeed !== 0) {
            this.drawWindIndicator();
        }
    }

    drawLauncher() {
        const angleRad = (this.launchAngle * Math.PI) / 180;
        const barrelLength = 40;
        
        // Launcher base
        this.ctx.fillStyle = '#374151';
        this.ctx.beginPath();
        this.ctx.arc(this.launcherX, this.launcherY, 15, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Launcher barrel
        this.ctx.strokeStyle = '#6b7280';
        this.ctx.lineWidth = 8;
        this.ctx.lineCap = 'round';
        this.ctx.beginPath();
        this.ctx.moveTo(this.launcherX, this.launcherY);
        this.ctx.lineTo(
            this.launcherX + Math.cos(angleRad) * barrelLength,
            this.launcherY - Math.sin(angleRad) * barrelLength
        );
        this.ctx.stroke();
        
        // Angle arc
        this.ctx.strokeStyle = '#f59e0b';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(this.launcherX, this.launcherY, 25, -angleRad, 0);
        this.ctx.stroke();
        
        // Angle label
        this.ctx.fillStyle = '#f59e0b';
        this.ctx.font = '12px Space Grotesk';
        this.ctx.fillText(`${this.launchAngle}°`, this.launcherX + 30, this.launcherY + 5);
    }

    drawDistanceMarkers() {
        this.ctx.strokeStyle = '#374151';
        this.ctx.lineWidth = 1;
        this.ctx.fillStyle = '#94a3b8';
        this.ctx.font = '10px Space Grotesk';
        this.ctx.textAlign = 'center';
        
        const groundY = this.canvas.height - 30;
        const maxDistance = (this.canvas.width - this.launcherX) / this.scale;
        
        for (let i = 0; i <= maxDistance; i += 5) {
            const x = this.launcherX + (i * this.scale);
            if (x < this.canvas.width - 20) {
                this.ctx.beginPath();
                this.ctx.moveTo(x, groundY);
                this.ctx.lineTo(x, groundY + 10);
                this.ctx.stroke();
                
                this.ctx.fillText(`${i}m`, x, groundY + 25);
            }
        }
        
        this.ctx.textAlign = 'left';
    }

    drawWindIndicator() {
        const arrowX = this.canvas.width - 100;
        const arrowY = 50;
        const windStrength = Math.abs(this.windSpeed);
        const windDirection = this.windSpeed > 0 ? 1 : -1;
        
        // Wind arrow
        this.ctx.strokeStyle = '#06b6d4';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(arrowX - (windDirection * 20), arrowY);
        this.ctx.lineTo(arrowX + (windDirection * 20), arrowY);
        this.ctx.stroke();
        
        // Arrow head
        this.ctx.fillStyle = '#06b6d4';
        this.ctx.beginPath();
        this.ctx.moveTo(arrowX + (windDirection * 20), arrowY);
        this.ctx.lineTo(arrowX + (windDirection * 15), arrowY - 5);
        this.ctx.lineTo(arrowX + (windDirection * 15), arrowY + 5);
        this.ctx.fill();
        
        // Wind label
        this.ctx.fillStyle = '#06b6d4';
        this.ctx.font = '12px Space Grotesk';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`Wind: ${this.windSpeed.toFixed(1)} m/s`, arrowX, arrowY + 20);
        this.ctx.textAlign = 'left';
    }

    drawObjects() {
        // Draw trajectory prediction
        if (this.showPrediction && this.trajectoryPrediction.length > 1) {
            this.ctx.strokeStyle = 'rgba(156, 163, 175, 0.5)';
            this.ctx.lineWidth = 2;
            this.ctx.setLineDash([5, 5]);
            this.ctx.beginPath();
            this.ctx.moveTo(this.trajectoryPrediction[0].x, this.trajectoryPrediction[0].y);
            
            for (let i = 1; i < this.trajectoryPrediction.length; i++) {
                this.ctx.lineTo(this.trajectoryPrediction[i].x, this.trajectoryPrediction[i].y);
            }
            this.ctx.stroke();
            this.ctx.setLineDash([]);
        }
        
        // Draw trail with speed-based coloring
        if (this.trail.length > 1) {
            for (let i = 1; i < this.trail.length; i++) {
                const alpha = (i / this.trail.length) * 0.8;
                const speed = this.trail[i].speed;
                const hue = Math.max(0, 120 - speed * 2); // Green to red based on speed
                
                this.ctx.strokeStyle = `hsla(${hue}, 70%, 60%, ${alpha})`;
                this.ctx.lineWidth = 3;
                this.ctx.beginPath();
                this.ctx.moveTo(this.trail[i-1].x, this.trail[i-1].y);
                this.ctx.lineTo(this.trail[i].x, this.trail[i].y);
                this.ctx.stroke();
            }
        }
        
        // Draw projectile
        if (!this.hasLanded) {
            const pixelX = this.launcherX + (this.position.x * this.scale);
            const pixelY = this.launcherY - ((this.position.y - this.launchHeight) * this.scale);
            const clampedX = Math.min(pixelX, this.canvas.width - 20);
            const clampedY = Math.max(pixelY, 20);
            
            // Projectile shadow
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            this.ctx.beginPath();
            this.ctx.ellipse(clampedX + 2, this.canvas.height - 25, this.objectRadius, this.objectRadius * 0.3, 0, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Main projectile
            const gradient = this.ctx.createRadialGradient(
                clampedX - 2, clampedY - 2, 0,
                clampedX, clampedY, this.objectRadius
            );
            gradient.addColorStop(0, '#f97316');
            gradient.addColorStop(1, '#ea580c');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(clampedX, clampedY, this.objectRadius, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Highlight
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            this.ctx.beginPath();
            this.ctx.arc(clampedX - 2, clampedY - 2, this.objectRadius * 0.3, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Velocity vector
            this.drawVelocityVector(clampedX, clampedY);
        }
        
        // Draw landing marker
        if (this.hasLanded) {
            const landingX = this.launcherX + (this.range * this.scale);
            this.ctx.fillStyle = '#ef4444';
            this.ctx.beginPath();
            this.ctx.arc(landingX, this.canvas.height - 30, 8, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Range line
            this.ctx.strokeStyle = '#ef4444';
            this.ctx.lineWidth = 2;
            this.ctx.setLineDash([3, 3]);
            this.ctx.beginPath();
            this.ctx.moveTo(this.launcherX, this.launcherY);
            this.ctx.lineTo(landingX, this.canvas.height - 30);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
        }
        
        // Draw mini graphs
        this.drawMiniGraphs();
    }

    drawVelocityVector(x, y) {
        if (Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2) < 1) return;
        
        const vectorScale = 2;
        const vx = this.velocity.x * vectorScale;
        const vy = -this.velocity.y * vectorScale; // Flip Y for screen coordinates
        
        // Velocity vector
        this.ctx.strokeStyle = '#10b981';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x + vx, y + vy);
        this.ctx.stroke();
        
        // Arrow head
        const angle = Math.atan2(vy, vx);
        this.ctx.fillStyle = '#10b981';
        this.ctx.beginPath();
        this.ctx.moveTo(x + vx, y + vy);
        this.ctx.lineTo(
            x + vx - 8 * Math.cos(angle - Math.PI / 6),
            y + vy - 8 * Math.sin(angle - Math.PI / 6)
        );
        this.ctx.lineTo(
            x + vx - 8 * Math.cos(angle + Math.PI / 6),
            y + vy - 8 * Math.sin(angle + Math.PI / 6)
        );
        this.ctx.fill();
        
        // Velocity components
        this.ctx.font = '10px Space Grotesk';
        this.ctx.fillText(`v = ${Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2).toFixed(1)} m/s`, x + 15, y - 15);
    }

    drawMiniGraphs() {
        const graphWidth = 120;
        const graphHeight = 60;
        const graphX = this.canvas.width - graphWidth - 20;
        const heightGraphY = 120;
        const speedGraphY = heightGraphY + graphHeight + 15;
        
        // Height vs time graph
        this.drawGraph(
            this.heightData,
            graphX, heightGraphY, graphWidth, graphHeight,
            'Height (m)', '#10b981'
        );
        
        // Speed vs time graph
        this.drawGraph(
            this.speedData,
            graphX, speedGraphY, graphWidth, graphHeight,
            'Speed (m/s)', '#f59e0b'
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
        this.ctx.font = '10px Space Grotesk';
        this.ctx.fillText(label, x + 3, y + 12);
        
        // Find min/max values
        const values = data.map(d => d.value);
        const minValue = Math.min(0, ...values);
        const maxValue = Math.max(...values);
        const range = maxValue - minValue || 1;
        
        // Draw data line
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        
        for (let i = 0; i < data.length; i++) {
            const dataX = x + (i / (data.length - 1)) * width;
            const dataY = y + height - ((data[i].value - minValue) / range) * (height - 15);
            
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
            this.ctx.font = '8px Space Grotesk';
            this.ctx.fillText(currentValue.toFixed(1), x + width - 25, y + height - 3);
        }
    }

    drawUI() {
        super.drawUI();
        
        // Current values display
        this.ctx.fillStyle = '#e2e8f0';
        this.ctx.font = '14px Space Grotesk';
        
        this.ctx.fillText(`Position: (${this.position.x.toFixed(1)}, ${this.position.y.toFixed(1)}) m`, 20, 60);
        this.ctx.fillText(`Velocity: (${this.velocity.x.toFixed(1)}, ${this.velocity.y.toFixed(1)}) m/s`, 20, 80);
        this.ctx.fillText(`Speed: ${Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2).toFixed(1)} m/s`, 20, 100);
        
        if (this.hasLanded) {
            this.ctx.fillStyle = '#10b981';
            this.ctx.fillText(`Range: ${this.range.toFixed(1)} m`, 20, 125);
            this.ctx.fillText(`Max Height: ${this.maxHeight.toFixed(1)} m`, 20, 145);
            this.ctx.fillText(`Flight Time: ${this.flightTime.toFixed(1)} s`, 20, 165);
        }
        
        // Projectile motion equations
        this.ctx.fillStyle = '#94a3b8';
        this.ctx.font = '12px Space Grotesk';
        this.ctx.fillText('Projectile Equations:', 20, 190);
        this.ctx.fillText('x = v₀cos(θ)t', 20, 205);
        this.ctx.fillText('y = h₀ + v₀sin(θ)t - ½gt²', 20, 220);
        this.ctx.fillText('Range = v₀²sin(2θ)/g', 20, 235);
    }

    getControls() {
        return [
            {
                name: 'initialVelocity',
                label: 'Initial Velocity',
                min: 5,
                max: 50,
                step: 1,
                value: this.initialVelocity,
                unit: 'm/s'
            },
            {
                name: 'launchAngle',
                label: 'Launch Angle',
                min: 5,
                max: 85,
                step: 5,
                value: this.launchAngle,
                unit: '°'
            },
            {
                name: 'launchHeight',
                label: 'Launch Height',
                min: 0,
                max: 10,
                step: 0.5,
                value: this.launchHeight,
                unit: 'm'
            },
            {
                name: 'windSpeed',
                label: 'Wind Speed',
                min: -10,
                max: 10,
                step: 0.5,
                value: this.windSpeed,
                unit: 'm/s'
            },
            {
                name: 'airResistance',
                label: 'Air Resistance',
                min: 0,
                max: 0.1,
                step: 0.005,
                value: this.airResistance,
                unit: ''
            }
        ];
    }

    updateParameter(name, value) {
        super.updateParameter(name, value);
        
        if (['initialVelocity', 'launchAngle', 'launchHeight', 'windSpeed', 'airResistance'].includes(name)) {
            this.reset();
        }
    }
}
