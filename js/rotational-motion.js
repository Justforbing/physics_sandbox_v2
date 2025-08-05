// Rotational Motion Simulation
class RotationalMotionSimulation extends BaseSimulation {
    constructor(canvas, ctx) {
        super(canvas, ctx);
        
        // Simulation parameters
        this.initialAngularVelocity = 2; // rad/s
        this.angularAcceleration = 0.5; // rad/s²
        this.radius = 80; // pixels
        this.momentOfInertia = 1; // kg⋅m²
        this.appliedTorque = 0.5; // N⋅m
        this.friction = 0.1; // friction coefficient
        
        // Current state
        this.angle = 0; // radians
        this.angularVelocity = this.initialAngularVelocity;
        this.centerX = null;
        this.centerY = null;
        
        // Visual elements
        this.spokes = 8;
        this.particles = [];
        this.maxParticles = 20;
        
        // Data recording
        this.angleData = [];
        this.angularVelocityData = [];
        this.angularAccelerationData = [];
        this.kineticEnergyData = [];
        this.maxDataPoints = 300;
        
        // Animation effects
        this.rotationTrail = [];
        this.maxTrailLength = 100;
        
        // Different visualization modes
        this.visualMode = 'disk'; // 'disk', 'wheel', 'propeller'
    }

    setupInitialState() {
        this.angle = 0;
        this.angularVelocity = this.initialAngularVelocity;
        
        // Calculate angular acceleration from torque
        this.angularAcceleration = (this.appliedTorque - this.friction * this.angularVelocity) / this.momentOfInertia;
        
        // Set center position
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
        
        // Clear data arrays
        this.angleData = [];
        this.angularVelocityData = [];
        this.angularAccelerationData = [];
        this.kineticEnergyData = [];
        this.rotationTrail = [];
        this.particles = [];
        
        // Initialize particles for effects
        this.initializeParticles();
    }

    initializeParticles() {
        this.particles = [];
        for (let i = 0; i < this.maxParticles; i++) {
            this.particles.push({
                angle: (i / this.maxParticles) * Math.PI * 2,
                radius: this.radius * 0.7 + Math.random() * this.radius * 0.3,
                opacity: Math.random() * 0.5 + 0.3,
                size: Math.random() * 3 + 1
            });
        }
    }

    updatePhysics() {
        if (!this.startTime) return;
        
        // Calculate net torque (applied torque minus friction)
        const frictionTorque = this.friction * this.angularVelocity;
        const netTorque = this.appliedTorque - frictionTorque;
        
        // Calculate angular acceleration: α = τ/I
        this.angularAcceleration = netTorque / this.momentOfInertia;
        
        // Update angular velocity: ω = ω₀ + αt
        this.angularVelocity += this.angularAcceleration * this.dt;
        
        // Prevent negative angular velocity if friction would reverse it
        if (this.appliedTorque === 0 && this.angularVelocity < 0) {
            this.angularVelocity = 0;
            this.angularAcceleration = 0;
        }
        
        // Update angle: θ = θ₀ + ωt + ½αt²
        this.angle += this.angularVelocity * this.dt + 0.5 * this.angularAcceleration * this.dt * this.dt;
        
        // Keep angle within 0-2π for display purposes
        this.angle = this.angle % (Math.PI * 2);
        if (this.angle < 0) this.angle += Math.PI * 2;
        
        // Update particles based on rotation
        this.updateParticles();
        
        // Add to rotation trail
        const trailPoint = {
            x: this.centerX + Math.cos(this.angle) * (this.radius * 0.9),
            y: this.centerY + Math.sin(this.angle) * (this.radius * 0.9),
            time: this.time,
            speed: Math.abs(this.angularVelocity)
        };
        
        this.rotationTrail.push(trailPoint);
        if (this.rotationTrail.length > this.maxTrailLength) {
            this.rotationTrail.shift();
        }
        
        // Record data
        const kineticEnergy = 0.5 * this.momentOfInertia * this.angularVelocity * this.angularVelocity;
        
        this.angleData.push({ time: this.time, value: this.angle * 180 / Math.PI }); // Convert to degrees
        this.angularVelocityData.push({ time: this.time, value: this.angularVelocity });
        this.angularAccelerationData.push({ time: this.time, value: this.angularAcceleration });
        this.kineticEnergyData.push({ time: this.time, value: kineticEnergy });
        
        if (this.angleData.length > this.maxDataPoints) {
            this.angleData.shift();
            this.angularVelocityData.shift();
            this.angularAccelerationData.shift();
            this.kineticEnergyData.shift();
        }
    }

    updateParticles() {
        this.particles.forEach(particle => {
            // Update particle angle based on its radius and angular velocity
            const linearVelocity = this.angularVelocity * (particle.radius / this.radius);
            particle.angle += linearVelocity * this.dt;
            
            // Add some wobble for visual effect
            particle.radius += Math.sin(this.time * 3 + particle.angle) * 0.5;
            particle.opacity = 0.3 + Math.abs(this.angularVelocity) * 0.1;
        });
    }

    drawBackground() {
        super.drawBackground();
        
        // Draw center point
        this.ctx.fillStyle = '#374151';
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, 8, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw rotation circles for reference
        this.ctx.strokeStyle = 'rgba(99, 102, 241, 0.2)';
        this.ctx.lineWidth = 1;
        for (let r = 20; r <= this.radius + 20; r += 20) {
            this.ctx.beginPath();
            this.ctx.arc(this.centerX, this.centerY, r, 0, Math.PI * 2);
            this.ctx.stroke();
        }
        
        // Draw angular velocity vector
        this.drawAngularVelocityVector();
        
        // Draw torque indicator
        this.drawTorqueIndicator();
    }

    drawAngularVelocityVector() {
        if (Math.abs(this.angularVelocity) < 0.1) return;
        
        const vectorLength = Math.min(Math.abs(this.angularVelocity) * 20, 60);
        const direction = this.angularVelocity > 0 ? 1 : -1;
        
        // Draw curved arrow to show rotation direction
        this.ctx.strokeStyle = '#10b981';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        
        const startAngle = direction > 0 ? -Math.PI/4 : Math.PI/4;
        const endAngle = direction > 0 ? Math.PI/4 : -Math.PI/4;
        
        this.ctx.arc(this.centerX, this.centerY, this.radius + 30, startAngle, endAngle);
        this.ctx.stroke();
        
        // Arrow head
        const arrowX = this.centerX + Math.cos(endAngle) * (this.radius + 30);
        const arrowY = this.centerY + Math.sin(endAngle) * (this.radius + 30);
        const tangentAngle = endAngle + (direction > 0 ? Math.PI/2 : -Math.PI/2);
        
        this.ctx.fillStyle = '#10b981';
        this.ctx.beginPath();
        this.ctx.moveTo(arrowX, arrowY);
        this.ctx.lineTo(
            arrowX - 8 * Math.cos(tangentAngle - Math.PI/6),
            arrowY - 8 * Math.sin(tangentAngle - Math.PI/6)
        );
        this.ctx.lineTo(
            arrowX - 8 * Math.cos(tangentAngle + Math.PI/6),
            arrowY - 8 * Math.sin(tangentAngle + Math.PI/6)
        );
        this.ctx.fill();
        
        // Label
        this.ctx.fillStyle = '#10b981';
        this.ctx.font = '12px Space Grotesk';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
            `ω = ${this.angularVelocity.toFixed(1)} rad/s`,
            this.centerX,
            this.centerY - this.radius - 60
        );
        this.ctx.textAlign = 'left';
    }

    drawTorqueIndicator() {
        if (this.appliedTorque === 0) return;
        
        const indicatorRadius = this.radius + 50;
        const torqueDirection = this.appliedTorque > 0 ? 1 : -1;
        
        // Torque arrow
        this.ctx.strokeStyle = '#f59e0b';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        
        const startAngle = torqueDirection > 0 ? Math.PI : 0;
        const endAngle = torqueDirection > 0 ? Math.PI * 1.5 : Math.PI * 0.5;
        
        this.ctx.arc(this.centerX, this.centerY, indicatorRadius, startAngle, endAngle);
        this.ctx.stroke();
        
        // Arrow head for torque
        const arrowX = this.centerX + Math.cos(endAngle) * indicatorRadius;
        const arrowY = this.centerY + Math.sin(endAngle) * indicatorRadius;
        const tangentAngle = endAngle + (torqueDirection > 0 ? Math.PI/2 : -Math.PI/2);
        
        this.ctx.fillStyle = '#f59e0b';
        this.ctx.beginPath();
        this.ctx.moveTo(arrowX, arrowY);
        this.ctx.lineTo(
            arrowX - 10 * Math.cos(tangentAngle - Math.PI/6),
            arrowY - 10 * Math.sin(tangentAngle - Math.PI/6)
        );
        this.ctx.lineTo(
            arrowX - 10 * Math.cos(tangentAngle + Math.PI/6),
            arrowY - 10 * Math.sin(tangentAngle + Math.PI/6)
        );
        this.ctx.fill();
        
        // Torque label
        this.ctx.fillStyle = '#f59e0b';
        this.ctx.font = '12px Space Grotesk';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
            `τ = ${this.appliedTorque.toFixed(1)} N⋅m`,
            this.centerX,
            this.centerY + this.radius + 80
        );
        this.ctx.textAlign = 'left';
    }

    drawObjects() {
        // Draw rotation trail
        if (this.rotationTrail.length > 1) {
            for (let i = 1; i < this.rotationTrail.length; i++) {
                const alpha = (i / this.rotationTrail.length) * 0.6;
                const speed = this.rotationTrail[i].speed;
                const hue = Math.max(0, 240 - speed * 30);
                
                this.ctx.strokeStyle = `hsla(${hue}, 70%, 60%, ${alpha})`;
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.moveTo(this.rotationTrail[i-1].x, this.rotationTrail[i-1].y);
                this.ctx.lineTo(this.rotationTrail[i].x, this.rotationTrail[i].y);
                this.ctx.stroke();
            }
        }
        
        // Draw rotating object based on visualization mode
        switch (this.visualMode) {
            case 'disk':
                this.drawDisk();
                break;
            case 'wheel':
                this.drawWheel();
                break;
            case 'propeller':
                this.drawPropeller();
                break;
            default:
                this.drawDisk();
        }
        
        // Draw particles
        this.drawParticles();
        
        // Draw mini graphs
        this.drawMiniGraphs();
    }

    drawDisk() {
        // Main disk
        const gradient = this.ctx.createRadialGradient(
            this.centerX - 20, this.centerY - 20, 0,
            this.centerX, this.centerY, this.radius
        );
        gradient.addColorStop(0, '#8b5cf6');
        gradient.addColorStop(0.7, '#6366f1');
        gradient.addColorStop(1, '#4f46e5');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, this.radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Spokes
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
        
        // Center hub
        this.ctx.fillStyle = '#374151';
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, 12, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Reference marker
        const markerX = this.centerX + Math.cos(this.angle) * (this.radius - 5);
        const markerY = this.centerY + Math.sin(this.angle) * (this.radius - 5);
        this.ctx.fillStyle = '#ef4444';
        this.ctx.beginPath();
        this.ctx.arc(markerX, markerY, 6, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawWheel() {
        // Outer rim
        this.ctx.strokeStyle = '#374151';
        this.ctx.lineWidth = 8;
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, this.radius, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // Inner disk
        const gradient = this.ctx.createRadialGradient(
            this.centerX - 15, this.centerY - 15, 0,
            this.centerX, this.centerY, this.radius * 0.7
        );
        gradient.addColorStop(0, '#6366f1');
        gradient.addColorStop(1, '#4f46e5');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, this.radius * 0.7, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Spokes
        this.ctx.strokeStyle = '#1f2937';
        this.ctx.lineWidth = 6;
        for (let i = 0; i < 6; i++) {
            const spokeAngle = this.angle + (i * Math.PI / 3);
            const startX = this.centerX + Math.cos(spokeAngle) * 20;
            const startY = this.centerY + Math.sin(spokeAngle) * 20;
            const endX = this.centerX + Math.cos(spokeAngle) * (this.radius - 8);
            const endY = this.centerY + Math.sin(spokeAngle) * (this.radius - 8);
            
            this.ctx.beginPath();
            this.ctx.moveTo(startX, startY);
            this.ctx.lineTo(endX, endY);
            this.ctx.stroke();
        }
        
        // Hub
        this.ctx.fillStyle = '#374151';
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, 18, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Hub highlight
        this.ctx.fillStyle = '#6b7280';
        this.ctx.beginPath();
        this.ctx.arc(this.centerX - 3, this.centerY - 3, 12, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawPropeller() {
        // Propeller blades
        this.ctx.fillStyle = '#374151';
        for (let i = 0; i < 3; i++) {
            const bladeAngle = this.angle + (i * Math.PI * 2 / 3);
            
            this.ctx.save();
            this.ctx.translate(this.centerX, this.centerY);
            this.ctx.rotate(bladeAngle);
            
            // Blade shape (ellipse)
            this.ctx.beginPath();
            this.ctx.ellipse(0, 0, this.radius * 0.8, this.radius * 0.15, 0, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Blade highlight
            this.ctx.fillStyle = '#6b7280';
            this.ctx.beginPath();
            this.ctx.ellipse(-10, -2, this.radius * 0.6, this.radius * 0.08, 0, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.fillStyle = '#374151';
            
            this.ctx.restore();
        }
        
        // Central hub
        this.ctx.fillStyle = '#1f2937';
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, 15, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Hub detail
        this.ctx.strokeStyle = '#6b7280';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, 10, 0, Math.PI * 2);
        this.ctx.stroke();
    }

    drawParticles() {
        this.particles.forEach(particle => {
            const x = this.centerX + Math.cos(particle.angle) * particle.radius;
            const y = this.centerY + Math.sin(particle.angle) * particle.radius;
            
            this.ctx.fillStyle = `rgba(6, 182, 212, ${particle.opacity})`;
            this.ctx.beginPath();
            this.ctx.arc(x, y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    drawMiniGraphs() {
        const graphWidth = 120;
        const graphHeight = 60;
        const graphX = this.canvas.width - graphWidth - 20;
        const velocityGraphY = 20;
        const energyGraphY = velocityGraphY + graphHeight + 15;
        
        // Angular velocity graph
        this.drawGraph(
            this.angularVelocityData,
            graphX, velocityGraphY, graphWidth, graphHeight,
            'ω (rad/s)', '#10b981'
        );
        
        // Kinetic energy graph
        this.drawGraph(
            this.kineticEnergyData,
            graphX, energyGraphY, graphWidth, graphHeight,
            'KE (J)', '#f59e0b'
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
        
        this.ctx.fillText(`Angle: ${(this.angle * 180 / Math.PI).toFixed(1)}°`, 20, 60);
        this.ctx.fillText(`Angular Velocity: ${this.angularVelocity.toFixed(2)} rad/s`, 20, 80);
        this.ctx.fillText(`Angular Acceleration: ${this.angularAcceleration.toFixed(2)} rad/s²`, 20, 100);
        
        const kineticEnergy = 0.5 * this.momentOfInertia * this.angularVelocity * this.angularVelocity;
        this.ctx.fillText(`Kinetic Energy: ${kineticEnergy.toFixed(2)} J`, 20, 120);
        
        const linearVelocity = this.angularVelocity * (this.radius / 100); // Convert pixels to meters
        this.ctx.fillText(`Linear Velocity (edge): ${linearVelocity.toFixed(2)} m/s`, 20, 140);
        
        // Rotational motion equations
        this.ctx.fillStyle = '#94a3b8';
        this.ctx.font = '12px Space Grotesk';
        this.ctx.fillText('Rotational Equations:', 20, 170);
        this.ctx.fillText('ω = ω₀ + αt', 20, 185);
        this.ctx.fillText('θ = θ₀ + ω₀t + ½αt²', 20, 200);
        this.ctx.fillText('τ = Iα', 20, 215);
        this.ctx.fillText('KE = ½Iω²', 20, 230);
    }

    getControls() {
        return [
            {
                name: 'initialAngularVelocity',
                label: 'Initial ω',
                min: 0,
                max: 10,
                step: 0.5,
                value: this.initialAngularVelocity,
                unit: 'rad/s'
            },
            {
                name: 'appliedTorque',
                label: 'Applied Torque',
                min: -2,
                max: 2,
                step: 0.1,
                value: this.appliedTorque,
                unit: 'N⋅m'
            },
            {
                name: 'momentOfInertia',
                label: 'Moment of Inertia',
                min: 0.1,
                max: 5,
                step: 0.1,
                value: this.momentOfInertia,
                unit: 'kg⋅m²'
            },
            {
                name: 'friction',
                label: 'Friction',
                min: 0,
                max: 1,
                step: 0.05,
                value: this.friction,
                unit: ''
            }
        ];
    }

    updateParameter(name, value) {
        super.updateParameter(name, value);
        
        if (['initialAngularVelocity', 'appliedTorque', 'momentOfInertia', 'friction'].includes(name)) {
            if (name === 'initialAngularVelocity') {
                this.reset();
            }
        }
    }

    // Method to change visualization mode
    setVisualizationMode(mode) {
        this.visualMode = mode;
    }
}
