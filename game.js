// Henry's Jobs - Educational Minecraft-style Block Game
// A fun game for kids to learn about different jobs and occupations

class HenrysJobs {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;

        // Game state
        this.money = 0;
        this.level = 1;
        this.jobsCompleted = 0;
        this.currentJob = null;
        this.blocks = [];
        this.particles = [];
        this.floatingTexts = [];
        
        // Player
        this.player = {
            x: 100,
            y: 0,
            width: 25,
            height: 40,
            velocityX: 0,
            velocityY: 0,
            jumping: false,
            color: '#FF6B6B'
        };

        // Input
        this.keys = {};
        this.gridSize = 30;
        this.gravity = 0.6;

        // Jobs with rewards
        this.jobs = [
            {
                id: 'doctor',
                name: '🏥 Doctor',
                emoji: '🩺',
                fact: 'Doctors help people stay healthy and treat illnesses. They study for many years!',
                reward: 50,
                objectives: [
                    'Build a hospital bed (5 blocks)',
                    'Create a medicine cabinet',
                    'Build a waiting room (10 blocks)'
                ],
                color: '#E74C3C',
                targetBlocks: 15
            },
            {
                id: 'firefighter',
                name: '🚒 Firefighter',
                emoji: '🔥',
                fact: 'Firefighters are brave heroes! They work day and night to save lives and put out fires.',
                reward: 60,
                objectives: [
                    'Build a fire truck with blocks',
                    'Create a fire station',
                    'Build a tall watchtower (12 blocks)'
                ],
                color: '#FF6B35',
                targetBlocks: 18
            },
            {
                id: 'pilot',
                name: '✈️ Pilot',
                emoji: '🛩️',
                fact: 'Pilots control huge airplanes and fly people around the world. They need excellent skills!',
                reward: 70,
                objectives: [
                    'Build an airplane shape with blocks',
                    'Create an airport terminal',
                    'Build a control tower (15 blocks)'
                ],
                color: '#3498DB',
                targetBlocks: 20
            },
            {
                id: 'astronaut',
                name: '🚀 Astronaut',
                emoji: '🛰️',
                fact: 'Astronauts travel to space in rockets! They explore the universe and conduct science experiments.',
                reward: 90,
                objectives: [
                    'Build a rocket (12 blocks high)',
                    'Create a space station module',
                    'Build a launch pad (25 blocks)'
                ],
                color: '#8E44AD',
                targetBlocks: 25
            },
            {
                id: 'chef',
                name: '👨‍🍳 Chef',
                emoji: '🍳',
                fact: 'Chefs create amazing dishes! They need creativity, math skills, and love for food.',
                reward: 55,
                objectives: [
                    'Build a kitchen counter',
                    'Create a stove area',
                    'Build a dining table section (12 blocks)'
                ],
                color: '#F39C12',
                targetBlocks: 16
            },
            {
                id: 'teacher',
                name: '📚 Teacher',
                emoji: '👨‍🏫',
                fact: 'Teachers help students learn and grow. They shape the future with their knowledge!',
                reward: 50,
                objectives: [
                    'Build a classroom desk area',
                    'Create a blackboard section',
                    'Build a bookshelf (10 blocks)'
                ],
                color: '#9B59B6',
                targetBlocks: 14
            },
            {
                id: 'engineer',
                name: '🏗️ Engineer',
                emoji: '⚙️',
                fact: 'Engineers design and build amazing things! They solve problems and create structures.',
                reward: 80,
                objectives: [
                    'Build a bridge structure (15 blocks)',
                    'Create a building frame',
                    'Build a machine-like structure'
                ],
                color: '#27AE60',
                targetBlocks: 22
            },
            {
                id: 'veterinarian',
                name: '🐾 Veterinarian',
                emoji: '🐶',
                fact: 'Vets are animal doctors! They help pets and wild animals stay healthy and happy.',
                reward: 65,
                objectives: [
                    'Build a pet clinic area',
                    'Create an animal recovery room',
                    'Build a pet play area (10 blocks)'
                ],
                color: '#E67E22',
                targetBlocks: 17
            },
            {
                id: 'musician',
                name: '🎵 Musician',
                emoji: '🎸',
                fact: 'Musicians create joy through music! Music helps our brains and makes everyone happy!',
                reward: 100,
                objectives: [
                    'Build a concert stage (18 blocks)',
                    'Create a sound booth area',
                    'Build an instrument display stand'
                ],
                color: '#E91E63',
                targetBlocks: 21
            }
        ];

        this.initializeUI();
        this.setupEventListeners();
        this.createGround();
        this.gameLoop();
    }

    initializeUI() {
        const jobList = document.getElementById('jobList');
        jobList.innerHTML = '';
        
        this.jobs.forEach((job, index) => {
            const btn = document.createElement('button');
            btn.className = 'jobButton';
            btn.textContent = job.name;
            btn.style.background = `linear-gradient(135deg, ${job.color}, ${this.lighten(job.color, 20)})`;
            
            if (index < this.jobsCompleted) {
                btn.classList.add('completed');
            }
            
            btn.addEventListener('click', () => this.selectJob(job));
            jobList.appendChild(btn);
        });
    }

    lighten(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, (num >> 16) + amt);
        const G = Math.min(255, (num >> 8 & 0x00FF) + amt);
        const B = Math.min(255, (num & 0x0000FF) + amt);
        return "#" + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }

    selectJob(job) {
        this.currentJob = job;
        this.blocks = [];
        this.particles = [];
        this.floatingTexts = [];
        this.player.x = 100;
        this.player.y = 0;
        this.createGround();

        document.getElementById('jobTitle').textContent = job.name;
        document.getElementById('jobFact').textContent = job.fact;
        
        const objectivesList = document.getElementById('objectivesList');
        objectivesList.innerHTML = '';
        job.objectives.forEach((obj, i) => {
            const li = document.createElement('li');
            li.className = 'objective';
            li.textContent = obj;
            li.id = `obj-${i}`;
            objectivesList.appendChild(li);
        });
    }

    createGround() {
        for (let i = 0; i < Math.ceil(this.canvas.width / this.gridSize); i++) {
            for (let j = 0; j < 3; j++) {
                this.blocks.push({
                    x: i * this.gridSize,
                    y: this.canvas.height - (j * this.gridSize) - this.gridSize,
                    width: this.gridSize,
                    height: this.gridSize,
                    color: this.getRandomColor(),
                    isGround: true
                });
            }
        }
    }

    getRandomColor() {
        const colors = ['#FF6B6B', '#4ECDC4', '#FFD93D', '#6BCB77', '#FF8E72', '#A8E6CF', '#FFD3B6', '#FFAAA5', '#74B9FF', '#A29BFE'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });

        this.canvas.addEventListener('click', (e) => {
            if (!this.currentJob) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
            const y = (e.clientY - rect.top) * (this.canvas.height / rect.height);

            const gridX = Math.floor(x / this.gridSize) * this.gridSize;
            const gridY = Math.floor(y / this.gridSize) * this.gridSize;

            const isOccupied = this.blocks.some(b => b.x === gridX && b.y === gridY);

            if (!isOccupied) {
                this.blocks.push({
                    x: gridX,
                    y: gridY,
                    width: this.gridSize,
                    height: this.gridSize,
                    color: this.getRandomColor(),
                    isGround: false
                });

                this.createParticles(gridX + this.gridSize / 2, gridY + this.gridSize / 2);
                this.playBlockSound();
                this.checkJobProgress();
            }
        });

        window.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'r') {
                const nonGroundBlocks = this.blocks.filter(b => !b.isGround);
                if (nonGroundBlocks.length > 0) {
                    this.blocks = this.blocks.filter(b => b.isGround);
                }
            }
        });
    }

    checkJobProgress() {
        if (!this.currentJob) return;

        const userBlocks = this.blocks.filter(b => !b.isGround).length;
        
        if (userBlocks >= this.currentJob.targetBlocks) {
            this.completeJob();
        }
    }

    completeJob() {
        if (!this.currentJob) return;

        const reward = this.currentJob.reward;
        this.money += reward;
        this.level = Math.floor(this.money / 100) + 1;
        this.jobsCompleted++;

        this.showAchievement(this.currentJob.name, this.currentJob.emoji, reward);
        this.updateStats();
        this.initializeUI();
        
        // Clear game
        setTimeout(() => {
            this.currentJob = null;
            this.blocks = [];
            document.getElementById('jobTitle').textContent = 'Job Complete!';
            document.getElementById('jobFact').textContent = 'Select another job to continue playing!';
            document.getElementById('objectivesList').innerHTML = '';
        }, 2000);
    }

    showAchievement(title, emoji, reward) {
        const popup = document.getElementById('achievementPopup');
        document.getElementById('achievementIcon').textContent = emoji;
        document.getElementById('achievementTitle').textContent = 'Job Complete!';
        document.getElementById('achievementText').textContent = title;
        document.getElementById('achievementReward').textContent = `+$${reward}`;
        
        popup.classList.add('show');
        setTimeout(() => popup.classList.remove('show'), 2500);
    }

    playBlockSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (e) {
            // Audio context not available
        }
    }

    createParticles(x, y) {
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x: x,
                y: y,
                velocityX: (Math.random() - 0.5) * 8,
                velocityY: (Math.random() - 0.5) * 8,
                life: 1,
                color: this.getRandomColor(),
                size: Math.random() * 5 + 2
            });
        }
    }

    addFloatingText(x, y, text) {
        this.floatingTexts.push({
            x: x,
            y: y,
            text: text,
            life: 1,
            age: 0
        });
    }

    updateStats() {
        document.getElementById('moneyDisplay').textContent = '$' + this.money;
        document.getElementById('levelDisplay').textContent = this.level;
        document.getElementById('jobsDisplay').textContent = this.jobsCompleted + '/9';
    }

    update() {
        // Player movement
        if (this.keys['a'] || this.keys['arrowleft']) {
            this.player.velocityX = -5;
        } else if (this.keys['d'] || this.keys['arrowright']) {
            this.player.velocityX = 5;
        } else {
            this.player.velocityX *= 0.85;
        }

        // Gravity
        this.player.velocityY += this.gravity;

        // Jump
        if ((this.keys[' '] || this.keys['w'] || this.keys['arrowup']) && !this.player.jumping) {
            this.player.velocityY = -12;
            this.player.jumping = true;
        }

        // Update position
        this.player.x += this.player.velocityX;
        this.player.y += this.player.velocityY;

        // Boundaries
        if (this.player.x < 0) this.player.x = 0;
        if (this.player.x + this.player.width > this.canvas.width) {
            this.player.x = this.canvas.width - this.player.width;
        }

        // Collision detection
        this.player.jumping = true;
        for (let block of this.blocks) {
            if (this.isColliding(this.player, block)) {
                if (this.player.velocityY >= 0) {
                    this.player.y = block.y - this.player.height;
                    this.player.velocityY = 0;
                    this.player.jumping = false;
                }
            }
        }

        // Fall
        if (this.player.y > this.canvas.height) {
            this.player.y = 0;
            this.player.velocityY = 0;
        }

        // Update particles
        this.particles = this.particles.filter(p => {
            p.x += p.velocityX;
            p.y += p.velocityY;
            p.velocityY += 0.2;
            p.life -= 0.02;
            return p.life > 0;
        });

        // Update floating texts
        this.floatingTexts = this.floatingTexts.filter(t => {
            t.y -= 2;
            t.age++;
            return t.age < 60;
        });
    }

    isColliding(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    draw() {
        // Background
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#E0F6FF');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw blocks
        for (let block of this.blocks) {
            this.ctx.fillStyle = block.color;
            this.ctx.fillRect(block.x, block.y, block.width, block.height);
            
            this.ctx.strokeStyle = 'rgba(0,0,0,0.2)';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(block.x, block.y, block.width, block.height);

            // Highlight
            this.ctx.fillStyle = 'rgba(255,255,255,0.1)';
            this.ctx.fillRect(block.x + 2, block.y + 2, block.width - 4, block.height - 4);
        }

        // Draw player
        this.ctx.fillStyle = this.player.color;
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        
        // Eyes
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(this.player.x + 4, this.player.y + 8, 5, 5);
        this.ctx.fillRect(this.player.x + 16, this.player.y + 8, 5, 5);
        
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(this.player.x + 6, this.player.y + 10, 2, 2);
        this.ctx.fillRect(this.player.x + 18, this.player.y + 10, 2, 2);

        // Draw particles
        for (let p of this.particles) {
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = p.life;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.globalAlpha = 1;
        }

        // Draw floating text
        for (let t of this.floatingTexts) {
            this.ctx.fillStyle = '#FFD93D';
            this.ctx.globalAlpha = Math.min(1, t.age / 10, (60 - t.age) / 10);
            this.ctx.font = 'bold 20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(t.text, t.x, t.y);
            this.ctx.globalAlpha = 1;
        }

        // Grid
        this.ctx.strokeStyle = 'rgba(0,0,0,0.03)';
        this.ctx.lineWidth = 0.5;
        for (let i = 0; i < this.canvas.width; i += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, 0);
            this.ctx.lineTo(i, this.canvas.height);
            this.ctx.stroke();
        }
        for (let i = 0; i < this.canvas.height; i += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i);
            this.ctx.lineTo(this.canvas.width, i);
            this.ctx.stroke();
        }
    }

    gameLoop = () => {
        this.update();
        this.draw();
        requestAnimationFrame(this.gameLoop);
    };
}

// Start game when page loads
window.addEventListener('load', () => {
    new HenrysJobs();
});