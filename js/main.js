// Physics in Motion - Main Application Logic
class PhysicsApp {
    constructor() {
        this.currentSimulation = null;
        this.animationId = null;
        this.isPlaying = false;
        this.canvas = null;
        this.ctx = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupNavigation();
        this.setupIntersectionObserver();
        this.generateFloatingParticles();
    }

    setupEventListeners() {
        // Navigation toggle
        const navToggle = document.querySelector('.nav-toggle');
        const navList = document.querySelector('.nav-list');
        
        navToggle?.addEventListener('click', () => {
            navList.classList.toggle('active');
        });

        // Simulation cards
        document.querySelectorAll('.simulation-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const type = card.dataset.type;
                this.openSimulation(type);
            });
        });

        // Control buttons
        document.getElementById('playPauseBtn')?.addEventListener('click', () => {
            this.togglePlayPause();
        });

        document.getElementById('resetBtn')?.addEventListener('click', () => {
            this.resetSimulation();
        });

        // Close simulation
        document.querySelector('.close-viewer')?.addEventListener('click', () => {
            this.closeSimulation();
        });

        // Escape key to close simulation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentSimulation) {
                this.closeSimulation();
            }
        });

        // Window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = link.getAttribute('href');
                
                if (target.startsWith('#')) {
                    const element = document.querySelector(target);
                    if (element) {
                        element.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }
                
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                
                document.querySelector('.nav-list')?.classList.remove('active');
            });
        });
    }

    setupIntersectionObserver() {
        const sections = document.querySelectorAll('section');
        const navLinks = document.querySelectorAll('.nav-link');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${id}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }, { threshold: 0.6 });

        sections.forEach(section => {
            observer.observe(section);
        });
    }

    generateFloatingParticles() {
        const particlesContainer = document.querySelector('.floating-particles');
        if (!particlesContainer) return;
        if(particlesContainer.children.length > 0) return; // Don't add more particles

        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.style.position = 'absolute';
            particle.style.width = Math.random() * 4 + 1 + 'px';
            particle.style.height = particle.style.width;
            particle.style.background = `rgba(99, 102, 241, ${Math.random() * 0.5 + 0.1})`;
            particle.style.borderRadius = '50%';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.animation = `float ${Math.random() * 20 + 10}s infinite linear`;
            particle.style.animationDelay = Math.random() * 20 + 's';
            
            particlesContainer.appendChild(particle);
        }
    }

    openSimulation(type) {
        const viewer = document.getElementById('simulationViewer');
        const title = document.getElementById('viewerTitle');
        this.canvas = document.getElementById('simulationCanvas');
        const controlsContainer = document.getElementById('controlsContainer');

        if (!viewer || !this.canvas) return;

        const titles = {
            linear: 'Linear Motion Simulator',
            freefall: 'Free Fall Simulator',
            projectile: 'Projectile Motion Simulator',
            rotational: 'Rotational Motion Simulator'
        };
        title.textContent = titles[type] || 'Physics Simulator';

        controlsContainer.innerHTML = '';
        
        viewer.classList.add('active');
        document.body.style.overflow = 'hidden';

        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();

        switch (type) {
            case 'linear': this.currentSimulation = new LinearMotionSimulation(this.canvas, this.ctx); break;
            case 'freefall': this.currentSimulation = new FreeFallSimulation(this.canvas, this.ctx); break;
            case 'projectile': this.currentSimulation = new ProjectileMotionSimulation(this.canvas, this.ctx); break;
            case 'rotational': this.currentSimulation = new RotationalMotionSimulation(this.canvas, this.ctx); break;
            default: return;
        }

        this.setupControls(controlsContainer);
        this.currentSimulation.init();
        this.currentSimulation.draw();

        this.isPlaying = false;
        const playBtn = document.getElementById('playPauseBtn');
        if (playBtn) playBtn.textContent = '▶️ Play';
    }

    closeSimulation() {
        this.pauseAnimation();
        const viewer = document.getElementById('simulationViewer');
        viewer.classList.remove('active');
        document.body.style.overflow = '';
        this.currentSimulation = null;
    }

    setupCanvas() {
        const container = this.canvas.parentElement;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;

        this.canvas.style.width = `${rect.width}px`;
        this.canvas.style.height = `${rect.height}px`;

        // This is the crucial fix: Reset transform and apply scale once.
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    setupControls(container) {
        if (!this.currentSimulation?.getControls) return;
        const controls = this.currentSimulation.getControls();
        
        controls.forEach(control => {
            const controlItem = document.createElement('div');
            controlItem.className = 'control-item';
            const label = document.createElement('label');
            label.textContent = control.label;
            const input = document.createElement('input');
            input.type = 'range';
            input.min = control.min;
            input.max = control.max;
            input.step = control.step || 0.1;
            input.value = control.value;
            const valueDisplay = document.createElement('span');
            valueDisplay.className = 'value-display';
            valueDisplay.textContent = `${control.value} ${control.unit || ''}`;
            
            input.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                valueDisplay.textContent = `${value} ${control.unit || ''}`;
                this.currentSimulation?.updateParameter(control.name, value);
            });
            
            label.appendChild(valueDisplay);
            controlItem.appendChild(label);
            controlItem.appendChild(input);
            container.appendChild(controlItem);
        });
    }

    togglePlayPause() {
        const playBtn = document.getElementById('playPauseBtn');
        if (this.isPlaying) {
            this.pauseAnimation();
            playBtn.textContent = '▶️ Play';
        } else {
            this.startAnimation();
            playBtn.textContent = '⏸️ Pause';
        }
    }

    startAnimation() {
        if (!this.currentSimulation || this.isPlaying) return;
        this.isPlaying = true;
        const animate = (timestamp) => {
            if (!this.isPlaying) return;
            this.currentSimulation.update(timestamp);
            this.currentSimulation.draw();
            this.animationId = requestAnimationFrame(animate);
        };
        this.animationId = requestAnimationFrame(animate);
    }

    pauseAnimation() {
        this.isPlaying = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    resetSimulation() {
        this.pauseAnimation();
        this.currentSimulation?.reset();
        this.currentSimulation?.draw();
        const playBtn = document.getElementById('playPauseBtn');
        if (playBtn) playBtn.textContent = '▶️ Play';
    }

    handleResize() {
        if (this.canvas && this.currentSimulation) {
            this.setupCanvas();
            this.currentSimulation.resize();
            this.currentSimulation.draw();
        }
    }
}

// Utility functions
function scrollToSimulations() {
    document.getElementById('simulations')?.scrollIntoView({ behavior: 'smooth' });
}

// Base Simulation Class
class BaseSimulation {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.startTime = null;
        this.lastTime = 0;
        this.time = 0;
        this.dt = 0;
        this.gravity = 9.81;
        this.pixelsPerMeter = 30; // Adjusted for better viewing
        this.dpr = 1;
        this.displayWidth = 0;
        this.displayHeight = 0;
    }

    init() {
        this.startTime = null;
        this.lastTime = 0;
        this.time = 0;
        this.resize(); // Sets dimensions and calls setupInitialState
    }
    
    resize() {
        this.dpr = window.devicePixelRatio || 1;
        this.displayWidth = this.canvas.width / this.dpr;
        this.displayHeight = this.canvas.height / this.dpr;
        this.setupInitialState();
    }

    update(timestamp) {
        if (!this.startTime) {
            this.startTime = timestamp;
            this.lastTime = timestamp;
        }
        this.dt = (timestamp - this.lastTime) / 1000;
        if (this.dt > 0.1) this.dt = 0.1; // Prevent large jumps
        this.time += this.dt;
        this.lastTime = timestamp;
        this.updatePhysics();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.displayWidth, this.displayHeight);
        this.ctx.fillStyle = 'rgba(15, 15, 35, 0.5)';
        this.ctx.fillRect(0, 0, this.displayWidth, this.displayHeight);
        this.drawBackground();
        this.drawObjects();
        this.drawUI();
    }

    drawBackground() {
        this.ctx.strokeStyle = 'rgba(99, 102, 241, 0.2)';
        this.ctx.lineWidth = 1;
        const gridSize = 40;
        for (let x = 0; x < this.displayWidth; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0); this.ctx.lineTo(x, this.displayHeight);
            this.ctx.stroke();
        }
        for (let y = 0; y < this.displayHeight; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y); this.ctx.lineTo(this.displayWidth, y);
            this.ctx.stroke();
        }
    }

    drawUI() {
        this.ctx.fillStyle = '#e2e8f0';
        this.ctx.font = '16px Space Grotesk';
        this.ctx.fillText(`Time: ${this.time.toFixed(2)}s`, 20, 30);
    }

    reset() { this.init(); }
    setupInitialState() { /* Override in child */ }
    updatePhysics() { /* Override in child */ }
    drawObjects() { /* Override in child */ }
    getControls() { return []; }
    updateParameter(name, value) { if (this.hasOwnProperty(name)) { this[name] = value; } }
}

document.addEventListener('DOMContentLoaded', () => new PhysicsApp());
