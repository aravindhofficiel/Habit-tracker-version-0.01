class HabitTracker {
    constructor() {
        this.habits = [];
        this.selectedColor = '#6366f1';
        this.init();
    }

    init() {
        this.loadHabits();
        this.setupEventListeners();
        this.renderHabits();
        this.updateStats();
    }

    setupEventListeners() {
        // Add habit button
        document.getElementById('addHabitBtn').addEventListener('click', () => {
            this.openModal();
        });

        // Modal close button
        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeModal();
        });

        // Modal background click
        document.getElementById('habitModal').addEventListener('click', (e) => {
            if (e.target.id === 'habitModal') {
                this.closeModal();
            }
        });

        // Habit form submission
        document.getElementById('habitForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createHabit();
        });

        // Color selection
        document.querySelectorAll('.color-option').forEach(option => {
            option.addEventListener('click', (e) => {
                this.selectColor(e.target);
            });
        });

        // Set default selected color
        document.querySelector('.color-option').classList.add('selected');
    }

    openModal() {
        document.getElementById('habitModal').classList.add('active');
        document.getElementById('habitForm').reset();
        this.selectColor(document.querySelector('.color-option'));
    }

    closeModal() {
        document.getElementById('habitModal').classList.remove('active');
    }

    selectColor(element) {
        document.querySelectorAll('.color-option').forEach(option => {
            option.classList.remove('selected');
        });
        element.classList.add('selected');
        this.selectedColor = element.dataset.color;
    }

    createHabit() {
        const name = document.getElementById('habitName').value.trim();
        const category = document.getElementById('habitCategory').value;
        const frequency = document.getElementById('habitFrequency').value;
        const goal = parseInt(document.getElementById('habitGoal').value) || 1;

        if (!name) return;

        const habit = {
            id: Date.now(),
            name,
            category,
            frequency,
            goal,
            color: this.selectedColor,
            currentCount: 0,
            completed: false,
            createdAt: new Date().toISOString(),
            completedDates: {},
            streak: 0,
            bestStreak: 0,
            totalCompletions: 0
        };

        this.habits.push(habit);
        this.saveHabits();
        this.renderHabits();
        this.updateStats();
        this.closeModal();
    }

    deleteHabit(id) {
        if (confirm('Are you sure you want to delete this habit?')) {
            this.habits = this.habits.filter(habit => habit.id !== id);
            this.saveHabits();
            this.renderHabits();
            this.updateStats();
        }
    }

    incrementCount(id) {
        const habit = this.habits.find(h => h.id === id);
        if (habit && habit.currentCount < habit.goal) {
            habit.currentCount++;
            if (habit.currentCount >= habit.goal) {
                habit.completed = true;
                this.markAsCompleted(habit);
            }
            this.saveHabits();
            this.renderHabits();
            this.updateStats();
        }
    }

    decrementCount(id) {
        const habit = this.habits.find(h => h.id === id);
        if (habit && habit.currentCount > 0) {
            if (habit.completed) {
                habit.completed = false;
                this.unmarkAsCompleted(habit);
            }
            habit.currentCount--;
            this.saveHabits();
            this.renderHabits();
            this.updateStats();
        }
    }

    markAsCompleted(habit) {
        const today = this.getTodayKey();
        habit.completedDates[today] = true;
        habit.totalCompletions++;
        this.calculateStreak(habit);
    }

    unmarkAsCompleted(habit) {
        const today = this.getTodayKey();
        if (habit.completedDates[today]) {
            delete habit.completedDates[today];
            habit.totalCompletions--;
            this.calculateStreak(habit);
        }
    }

    calculateStreak(habit) {
        const dates = Object.keys(habit.completedDates).sort((a, b) => new Date(b) - new Date(a));
        let streak = 0;
        let currentDate = new Date();

        for (let i = 0; i < dates.length; i++) {
            const date = new Date(dates[i]);
            const diffDays = Math.floor((currentDate - date) / (1000 * 60 * 60 * 24));
            
            if (diffDays === i) {
                streak++;
            } else {
                break;
            }
        }

        habit.streak = streak;
        habit.bestStreak = Math.max(habit.streak, habit.bestStreak);
    }

    getTodayKey() {
        return new Date().toISOString().split('T')[0];
    }

    getCategoryEmoji(category) {
        const emojis = {
            health: '🏃',
            productivity: '💼',
            learning: '📚',
            wellness: '🧘',
            other: '📌'
        };
        return emojis[category] || '📌';
    }

    getCategoryLabel(category) {
        const labels = {
            health: 'Health',
            productivity: 'Productivity',
            learning: 'Learning',
            wellness: 'Wellness',
            other: 'Other'
        };
        return labels[category] || 'Other';
    }

    renderHabits() {
        const grid = document.getElementById('habitsGrid');
        
        if (this.habits.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🎯</div>
                    <div class="empty-state-text">No habits yet</div>
                    <div class="empty-state-subtext">Click the button above to create your first habit</div>
                </div>
            `;
            return;
        }

        grid.innerHTML = this.habits.map(habit => this.createHabitCard(habit)).join('');
        this.attachCardEventListeners();
    }

    createHabitCard(habit) {
        const progress = (habit.currentCount / habit.goal) * 100;
        const categoryEmoji = this.getCategoryEmoji(habit.category);
        const categoryLabel = this.getCategoryLabel(habit.category);
        
        return `
            <div class="habit-card ${habit.completed ? 'completed' : ''}" data-id="${habit.id}" style="--primary-color: ${habit.color}">
                <div class="habit-header">
                    <div>
                        <div class="habit-name">${habit.name}</div>
                        <div class="habit-category">${categoryEmoji} ${categoryLabel}</div>
                    </div>
                    <div class="habit-actions">
                        <button class="habit-action-btn delete-btn" data-id="${habit.id}">🗑️</button>
                    </div>
                </div>
                
                <div class="habit-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <div class="habit-stats">
                        <span>${habit.currentCount} / ${habit.goal} completed</span>
                        <span>🔥 ${habit.streak} day streak</span>
                    </div>
                </div>
                
                <div class="habit-controls">
                    <div class="habit-counter">
                        <button class="counter-btn decrement-btn" data-id="${habit.id}">−</button>
                        <span class="counter-value">${habit.currentCount}</span>
                        <button class="counter-btn increment-btn" data-id="${habit.id}">+</button>
                    </div>
                    <button class="complete-btn" data-id="${habit.id}" ${habit.completed ? 'disabled' : ''}>
                        ${habit.completed ? '✓ Completed' : 'Mark Complete'}
                    </button>
                </div>
            </div>
        `;
    }

    attachCardEventListeners() {
        // Delete buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                this.deleteHabit(id);
            });
        });

        // Increment buttons
        document.querySelectorAll('.increment-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                this.incrementCount(id);
            });
        });

        // Decrement buttons
        document.querySelectorAll('.decrement-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                this.decrementCount(id);
            });
        });

        // Complete buttons
        document.querySelectorAll('.complete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                const habit = this.habits.find(h => h.id === id);
                if (habit && !habit.completed) {
                    habit.currentCount = habit.goal;
                    habit.completed = true;
                    this.markAsCompleted(habit);
                    this.saveHabits();
                    this.renderHabits();
                    this.updateStats();
                }
            });
        });
    }

    updateStats() {
        const totalHabits = this.habits.length;
        const todayCompleted = this.habits.filter(h => h.completed).length;
        const currentStreak = this.calculateOverallStreak();
        const bestStreak = Math.max(...this.habits.map(h => h.bestStreak), 0);
        const weekCompletion = this.calculateWeekCompletion();

        document.getElementById('totalHabits').textContent = totalHabits;
        document.getElementById('todayCompleted').textContent = todayCompleted;
        document.getElementById('currentStreak').textContent = `${currentStreak} days`;
        document.getElementById('bestStreak').textContent = `${bestStreak} days`;
        document.getElementById('weekCompletion').textContent = `${weekCompletion}%`;
    }

    calculateOverallStreak() {
        if (this.habits.length === 0) return 0;
        
        const today = this.getTodayKey();
        const allCompletedToday = this.habits.every(h => h.completed);
        
        if (!allCompletedToday) {
            return 0;
        }

        return Math.min(...this.habits.map(h => h.streak));
    }

    calculateWeekCompletion() {
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);

        let totalPossible = 0;
        let totalCompleted = 0;

        this.habits.forEach(habit => {
            for (let i = 0; i < 7; i++) {
                const checkDate = new Date(weekStart);
                checkDate.setDate(weekStart.getDate() + i);
                const dateKey = checkDate.toISOString().split('T')[0];
                
                if (checkDate <= new Date(habit.createdAt)) {
                    totalPossible++;
                    if (habit.completedDates[dateKey]) {
                        totalCompleted++;
                    }
                }
            }
        });

        return totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;
    }

    saveHabits() {
        localStorage.setItem('habits', JSON.stringify(this.habits));
    }

    loadHabits() {
        const stored = localStorage.getItem('habits');
        if (stored) {
            this.habits = JSON.parse(stored);
            // Reset daily counts for habits not completed today
            const today = this.getTodayKey();
            this.habits.forEach(habit => {
                if (!habit.completedDates[today]) {
                    habit.currentCount = 0;
                    habit.completed = false;
                }
            });
        }
    }

    // Method to reset daily habits at midnight
    checkAndResetDailyHabits() {
        const now = new Date();
        const lastCheck = localStorage.getItem('lastDailyReset');
        const today = this.getTodayKey();

        if (lastCheck !== today) {
            this.habits.forEach(habit => {
                habit.currentCount = 0;
                habit.completed = false;
            });
            this.saveHabits();
            this.renderHabits();
            this.updateStats();
            localStorage.setItem('lastDailyReset', today);
        }
    }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const tracker = new HabitTracker();
    
    // Check for daily reset every minute
    setInterval(() => {
        tracker.checkAndResetDailyHabits();
    }, 60000);
    
    // Check immediately on load
    tracker.checkAndResetDailyHabits();
});

// Handle visibility change to reset when app becomes active
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        const tracker = window.tracker;
        if (tracker) {
            tracker.checkAndResetDailyHabits();
        }
    }
});