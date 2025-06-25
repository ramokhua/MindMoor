// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }

    // Mood Tracker
    const moodChartCtx = document.getElementById('mood-chart').getContext('2d');
    let moodChart;
    let moodHistory = JSON.parse(localStorage.getItem('moodHistory')) || [];

    function updateMoodChart() {
        const labels = moodHistory.map(entry => new Date(entry.date).toLocaleDateString());
        const data = moodHistory.map(entry => {
            const moods = { happy: 3, sad: 1, angry: 2, anxious: 1 };
            return moods[entry.mood] || 2;
        });

        if (moodChart) moodChart.destroy();

        moodChart = new Chart(moodChartCtx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Mood Trend',
                    data: data,
                    borderColor: '#5d93a6',
                    backgroundColor: 'rgba(93, 147, 166, 0.1)',
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                scales: {
                    y: {
                        min: 0,
                        max: 3,
                        ticks: {
                            callback: function(value) {
                                const moods = { 1: 'Low', 2: 'Medium', 3: 'High' };
                                return moods[value] || '';
                            }
                        }
                    }
                }
            }
        });
    }

    document.querySelectorAll('.moods button').forEach(btn => {
        btn.addEventListener('click', function() {
            const mood = this.getAttribute('data-mood');
            const moodData = {
                date: new Date().toISOString(),
                mood: mood
            };
            
            moodHistory.push(moodData);
            localStorage.setItem('moodHistory', JSON.stringify(moodHistory));
            
            document.getElementById('mood-result').innerHTML = `
                <p>You're feeling <strong>${mood}</strong></p>
                <p>${getMoodTip(mood)}</p>
            `;
            
            updateMoodChart();
        });
    });

    function getMoodTip(mood) {
        const tips = {
            happy: "Great! Consider journaling about what's making you happy.",
            sad: "It's okay to feel this way. Try a breathing exercise.",
            angry: "Take deep breaths. Count to 10 slowly.",
            anxious: "Let's do a 4-7-8 breathing exercise.",
            confused: "Take a moment to gather your thoughts. Maybe jot down what's confusing you and see if it helps to clarify things.",
            clueless: "It's okay to feel uncertain. You can chat with our chatbot Moira or try talking it out with someone you trust or take a short break to clear your mind."
        };
        return tips[mood] || "Thank you for sharing.";
    }

    // Journal System
    const journal = {
        entries: JSON.parse(localStorage.getItem('journal')) || [],
        
        addEntry: function(text) {
            this.entries.push({
                date: new Date().toISOString(),
                text: text
            });
            localStorage.setItem('journal', JSON.stringify(this.entries));
            this.renderEntries();
        },
        
        renderEntries: function() {
            const container = document.getElementById('journal-entries');
            container.innerHTML = '';
            
            this.entries.forEach(entry => {
                const div = document.createElement('div');
                div.className = 'journal-entry';
                div.innerHTML = `
                    <small>${new Date(entry.date).toLocaleString()}</small>
                    <p>${entry.text}</p>
                `;
                container.appendChild(div);
            });
        }
    };

    document.getElementById('journal-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const text = document.getElementById('journal-text').value.trim();
        if (text) {
            journal.addEntry(text);
            document.getElementById('journal-text').value = '';
        }
    });

    // Breathing Exercise Functionality
const startBreathingBtn = document.getElementById('start-breathing');
if (startBreathingBtn) {
    const breathingCircle = document.getElementById('breathing-circle');
    const breathingText = document.getElementById('breathing-text');
    let isBreathing = false;
    let breathInterval;

    startBreathingBtn.addEventListener('click', function() {
        if (isBreathing) {
            clearInterval(breathInterval);
            isBreathing = false;
            this.textContent = 'Start';
            breathingText.textContent = 'Ready';
            breathingCircle.style.transform = 'scale(1)';
            breathingCircle.style.backgroundColor = 'var(--primary)';
            breathingCircle.classList.remove('breathing-in', 'holding', 'breathing-out');
            breathingCircle.classList.remove('breathing-active');
            return;
        }
        
        isBreathing = true;
        this.textContent = 'Stop';
        const pattern = document.getElementById('breathing-pattern').value;
        
        let inhale = 4, hold = 4, exhale = 4, pause = 0;
        
        switch(pattern) {
            case '478':
                inhale = 4; hold = 7; exhale = 8; break;
            case 'box':
                inhale = 4; hold = 4; exhale = 4; pause = 4; break;
            case 'relax':
                inhale = 4; hold = 7; exhale = 8; break;
        }
        
        let cycle = 0;
        breathingCircle.classList.add('breathing-active');
        
        breathInterval = setInterval(() => {
            const phase = cycle % (pause ? 4 : 3);
            
            breathingCircle.classList.remove('breathing-in', 'holding', 'breathing-out', 'pausing');
            
            if (phase === 0) {
                // Inhale
                breathingText.textContent = `Breathe In (${inhale}s)`;
                breathingCircle.style.backgroundColor = 'var(--accent)';
                breathingCircle.style.transform = 'scale(1.1)';
                breathingCircle.classList.add('breathing-in');
            } 
            else if (phase === 1) {
                // Hold
                breathingText.textContent = `Hold (${hold}s)`;
                breathingCircle.classList.add('holding');
            } 
            else if (phase === 2) {
                // Exhale
                breathingText.textContent = `Breathe Out (${exhale}s)`;
                breathingCircle.style.backgroundColor = 'var(--primary)';
                breathingCircle.style.transform = 'scale(1)';
                breathingCircle.classList.add('breathing-out');
            }
            else if (phase === 3) {
                // Pause (for box breathing)
                breathingText.textContent = `Pause (${pause}s)`;
                breathingCircle.classList.add('pausing');
            }
            
            cycle++;
        }, (inhale + hold + exhale + pause) * 1000 / (pause ? 4 : 3));
    });
}

      document.addEventListener('DOMContentLoaded', function() {
    const groundingExercise = document.querySelector('.grounding-exercise');
    if (!groundingExercise) return;

    const steps = document.querySelectorAll('.grounding-step');
    const prevBtn = document.getElementById('prev-step');
    const nextBtn = document.getElementById('next-step');
    const startOverBtn = document.getElementById('start-over');
    const stepCounter = document.querySelector('.step-counter');
    
    let currentStep = 0;
    const totalSteps = steps.length;

    function updateStepDisplay() {
        steps.forEach((step, index) => {
            step.classList.toggle('active', index === currentStep);
        });
        
        stepCounter.textContent = `Step ${totalSteps - currentStep} of ${totalSteps}`;
        prevBtn.disabled = currentStep === 0;
        nextBtn.textContent = currentStep === totalSteps - 1 ? 'Finish' : 'Next';
        
        if (currentStep === totalSteps - 1) {
            startOverBtn.style.display = 'inline-block';
            nextBtn.style.display = 'none';
        } else {
            startOverBtn.style.display = 'none';
            nextBtn.style.display = 'inline-block';
        }
    }

    nextBtn.addEventListener('click', function() {
        if (currentStep < totalSteps - 1) {
            currentStep++;
            updateStepDisplay();
        } else {
            // Exercise completed
            groundingExercise.classList.add('completed');
        }
    });

    prevBtn.addEventListener('click', function() {
        if (currentStep > 0) {
            currentStep--;
            updateStepDisplay();
        }
    });

    startOverBtn.addEventListener('click', function() {
        currentStep = 0;
        groundingExercise.classList.remove('completed');
        updateStepDisplay();
        document.querySelectorAll('.grounding-inputs input').forEach(input => {
            input.value = '';
        });
    });

    // Initialize
    updateStepDisplay();
});

document.addEventListener('DOMContentLoaded', function() {
    chatbot.init();
});

    // Initialize
    if (moodHistory.length > 0) updateMoodChart();
    journal.renderEntries();
});
