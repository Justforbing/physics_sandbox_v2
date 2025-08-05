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
                
                // Update active nav link
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                
                // Close mobile menu
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
        }, {
            threshold: 0.6
        });

        sections.forEach(section => {
            observer.observe(section);
        });
    }

    generateFloatingParticles() {
        const particlesContainer = document.querySelector('.floating-particles');
        if (!particlesContainer) return;

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
        const canvas = document.getElementById('simulationCanvas');
        const controlsContainer = document.getElementById('controlsContainer');

        if (!viewer || !canvas) return;

        // Set title
        const titles = {
            linear: 'Linear Motion Simulator',
            freefall: 'Free Fall Simulator',
            projectile: 'Projectile Motion Simulator',
            rotational: 'Rotational Motion Simulator'
        };
        
        title.textContent = titles[type] || 'Physics Simulator';

        // Setup canvas
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.setupCanvas();

        // Clear previous controls
        controlsContainer.innerHTML = '';

        // Create simulation based on type
        switch (type) {
            case 'linear':
                this.currentSimulation = new LinearMotionSimulation(this.canvas, this.ctx);
                break;
            case 'freefall':
                this.currentSimulation = new FreeFallSimulation(this.canvas, this.ctx);
                break;
            case 'projectile':
                this.currentSimulation = new ProjectileMotionSimulation(this.canvas, this.ctx);
                break;
            case 'rotational':
                this.currentSimulation = new RotationalMotionSimulation(this.canvas, this.ctx);
                break;
            default:
                return;
        }

        // Setup controls
        this.setupControls(controlsContainer);

        // Show viewer
        viewer.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Start simulation
        this.currentSimulation.init();
        this.startAnimation();
    }

    closeSimulation() {
        const viewer = document.getElementById('simulationViewer');
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }

        viewer.classList.remove('active');
        document.body.style.overflow = '';
        
        this.currentSimulation = null;
        this.isPlaying = false;
        
        // Reset play button
        const playBtn = document.getElementById('playPauseBtn');
        if (playBtn) {
            playBtn.textContent = '▶️ Play';
        }
    }

    setupCanvas() {
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();
        
        // Set canvas size based on container
        const maxWidth = Math.min(800, rect.width - 40);
        const maxHeight = Math.min(400, rect.height - 40);
        
        this.canvas.width = maxWidth;
        this.canvas.height = maxHeight;
        
        // Scale for high DPI displays
        const dpr = window.devicePixelRatio || 1;
        const displayWidth = this.canvas.clientWidth;
        const displayHeight = this.canvas.clientHeight;
        
        this.canvas.width = displayWidth * dpr;
        this.canvas.height = displayHeight * dpr;
        this.ctx.scale(dpr, dpr);
        
        this.canvas.style.width = displayWidth + 'px';
        this.canvas.style.height = displayHeight + 'px';
    }

    setupControls(container) {
        if (!this.currentSimulation || !this.currentSimulation.getControls) return;

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
                
                if (this.currentSimulation && this.currentSimulation.updateParameter) {
                    this.currentSimulation.updateParameter(control.name, value);
                }
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
        
        this.isPlaying = !this.isPlaying;
    }

    startAnimation() {
        if (!this.currentSimulation) return;
        
        const animate = (timestamp) => {
            this.currentSimulation.update(timestamp);
            this.currentSimulation.draw();
            
            if (this.isPlaying) {
                this.animationId = requestAnimationFrame(animate);
            }
        };
        
        this.isPlaying = true;
        this.animationId = requestAnimationFrame(animate);
    }

    pauseAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.isPlaying = false;
    }

    resetSimulation() {
        if (this.currentSimulation && this.currentSimulation.reset) {
            this.currentSimulation.reset();
        }
        
        // Reset play state
        this.pauseAnimation();
        const playBtn = document.getElementById('playPauseBtn');
        if (playBtn) {
            playBtn.textContent = '▶️ Play';
        }
    }

    handleResize() {
        if (this.canvas && this.currentSimulation) {
            this.setupCanvas();
            if (this.currentSimulation.resize) {
                this.currentSimulation.resize();
            }
        }
    }
}

// Utility functions
function scrollToSimulations() {
    const simulationsSection = document.getElementById('simulations');
    if (simulationsSection) {
        simulationsSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
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
        
        // Default physics parameters
        this.gravity = 9.81; // m/s^2
        this.pixelsPerMeter = 50; // pixels per meter for visualization
    }

    init() {
        this.startTime = null;
        this.lastTime = 0;
        this.time = 0;
        this.setupInitialState();
    }

    update(timestamp) {
        if (!this.startTime) {
            this.startTime = timestamp;
            this.lastTime = timestamp;
        }

        this.dt = (timestamp - this.lastTime) / 1000; // Convert to seconds
        this.time = (timestamp - this.startTime) / 1000;
        this.lastTime = timestamp;

        this.updatePhysics();
    }

    draw() {
        // Clear canvas with dark background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawBackground();
        this.drawObjects();
        this.drawUI();
    }

    setupInitialState() {
        // Override in child classes
    }

    updatePhysics() {
        // Override in child classes
    }

    drawBackground() {
        // Draw grid
        this.ctx.strokeStyle = 'rgba(99, 102, 241, 0.2)';
        this.ctx.lineWidth = 1;
        
        const gridSize = 20;
        
        // Vertical lines
        for (let x = 0; x < this.canvas.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y < this.canvas.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }

    drawObjects() {
        // Override in child classes
    }

    drawUI() {
        // Draw time
        this.ctx.fillStyle = '#e2e8f0';
        this.ctx.font = '16px Space Grotesk';
        this.ctx.fillText(`Time: ${this.time.toFixed(2)}s`, 20, 30);
    }

    reset() {
        this.init();
    }

    resize() {
        // Handle canvas resize
        this.setupInitialState();
    }

    updateParameter(name, value) {
        // Override in child classes
        if (this.hasOwnProperty(name)) {
            this[name] = value;
        }
    }

    getControls() {
        // Override in child classes
        return [];
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PhysicsApp();
});

// Smooth scrolling for anchor links
document.addEventListener('click', (e) => {
    if (e.target.matches('a[href^="#"]')) {
        e.preventDefault();
        const target = document.querySelector(e.target.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
});

// Add scroll effect to header
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (header) {
        if (window.scrollY > 100) {
            header.style.background = 'rgba(15, 15, 35, 0.95)';
            header.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)';
        } else {
            header.style.background = 'rgba(15, 15, 35, 0.8)';
            header.style.boxShadow = 'none';
        }
    }
});
