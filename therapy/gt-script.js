document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const steps = document.querySelectorAll('.grounding-step');
    const prevButtons = document.querySelectorAll('#prev-step');
    const nextButtons = document.querySelectorAll('#next-step');
    const startOverButton = document.getElementById('start-over');
    const viewDataButton = document.getElementById('view-data');
    const savedDataDiv = document.getElementById('saved-data');
    const progressBar = document.getElementById('progress-bar');
    const timerDisplay = document.getElementById('timer');
    const inputs = document.querySelectorAll('.grounding-inputs input');
    
    // Timer setup
    let startTime;
    let timerInterval;
    
    // Initialize
    initExercise();
    
    function initExercise() {
        // Hide all steps except the first one
        steps.forEach(step => {
            if (!step.classList.contains('active')) {
                step.style.display = 'none';
            }
        });
        
        // Load saved data if exists
        loadSavedData();
        
        // Update progress bar
        updateProgressBar();
        
        // Start timer
        startTimer();
    }
    
    // Navigation functions
    function navigateSteps(currentStepId, targetStepId) {
        const currentStep = document.getElementById(currentStepId);
        const targetStep = document.getElementById(targetStepId);
        
        if (currentStep && targetStep) {
            // Validate current step before proceeding
            if (targetStepId !== 'completion-message' && !validateStep(currentStepId)) {
                return;
            }
            
            currentStep.style.display = 'none';
            targetStep.style.display = 'block';
            
            currentStep.classList.remove('active');
            targetStep.classList.add('active');
            
            updateStepCounter(targetStepId);
            updateProgressBar();
            saveCurrentData();
            
            // Scroll to top of step
            window.scrollTo({top: targetStep.offsetTop - 20, behavior: 'smooth'});
        }
    }
    
    function validateStep(stepId) {
        const stepInputs = document.querySelectorAll(`#${stepId} input`);
        let isValid = true;
        
        stepInputs.forEach(input => {
            if (!input.value.trim()) {
                input.style.borderColor = 'red';
                isValid = false;
            } else {
                input.style.borderColor = '#ddd';
            }
        });
        
        if (!isValid) {
            alert('Please fill in all fields before proceeding.');
        }
        
        return isValid;
    }
    
    function updateStepCounter(stepId) {
        const stepCounters = document.querySelectorAll('.step-counter');
        let currentStepNumber, totalSteps = 5;
        
        switch(stepId) {
            case 'step-5': currentStepNumber = 1; break;
            case 'step-4': currentStepNumber = 2; break;
            case 'step-3': currentStepNumber = 3; break;
            case 'step-2': currentStepNumber = 4; break;
            case 'step-1': currentStepNumber = 5; break;
            case 'completion-message': 
                currentStepNumber = 'Completed'; 
                stopTimer();
                break;
        }
        
        stepCounters.forEach(counter => {
            counter.textContent = currentStepNumber === 'Completed' 
                ? 'Exercise Completed' 
                : `Step ${currentStepNumber} of ${totalSteps}`;
        });
    }
    
    function updateProgressBar() {
        const activeStep = document.querySelector('.grounding-step.active');
        let progress = 0;
        
        switch(activeStep.id) {
            case 'step-5': progress = 0; break;
            case 'step-4': progress = 25; break;
            case 'step-3': progress = 50; break;
            case 'step-2': progress = 75; break;
            case 'step-1': progress = 90; break;
            case 'completion-message': progress = 100; break;
        }
        
        progressBar.style.width = `${progress}%`;
    }
    
    // Data handling functions
    function saveCurrentData() {
        const data = {};
        inputs.forEach(input => {
            if (input.value.trim()) {
                const step = input.dataset.step;
                if (!data[step]) data[step] = [];
                data[step].push(input.value.trim());
            }
        });
        
        localStorage.setItem('groundingExerciseData', JSON.stringify(data));
    }
    
    function loadSavedData() {
        const savedData = localStorage.getItem('groundingExerciseData');
        if (savedData) {
            const data = JSON.parse(savedData);
            
            for (const step in data) {
                const stepInputs = document.querySelectorAll(`input[data-step="${step}"]`);
                data[step].forEach((value, index) => {
                    if (stepInputs[index]) {
                        stepInputs[index].value = value;
                    }
                });
            }
        }
    }
    
    function displaySavedData() {
        const savedData = localStorage.getItem('groundingExerciseData');
        if (savedData) {
            const data = JSON.parse(savedData);
            let html = '<h4>Your Responses:</h4><ul>';
            
            for (const step in data) {
                html += `<li><strong>${getStepName(step)}:</strong><ul>`;
                data[step].forEach(item => {
                    html += `<li>${item}</li>`;
                });
                html += '</ul></li>';
            }
            
            html += '</ul>';
            savedDataDiv.innerHTML = html;
            savedDataDiv.style.display = 'block';
        }
    }
    
    function getStepName(stepNumber) {
        switch(stepNumber) {
            case '5': return '5 Things You Can See';
            case '4': return '4 Things You Can Touch';
            case '3': return '3 Things You Can Hear';
            case '2': return '2 Things You Can Smell';
            case '1': return '1 Thing You Can Taste';
            default: return '';
        }
    }
    
    // Timer functions
    function startTimer() {
        startTime = new Date();
        timerInterval = setInterval(updateTimer, 1000);
    }
    
    function updateTimer() {
        const now = new Date();
        const elapsed = new Date(now - startTime);
        const minutes = elapsed.getUTCMinutes();
        const seconds = elapsed.getUTCSeconds();
        
        timerDisplay.textContent = `Time: ${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    function stopTimer() {
        clearInterval(timerInterval);
    }
    
    // Event listeners
    nextButtons.forEach(button => {
        button.addEventListener('click', function() {
            const currentStep = this.closest('.grounding-step');
            let nextStepId;
            
            switch(currentStep.id) {
                case 'step-5': nextStepId = 'step-4'; break;
                case 'step-4': nextStepId = 'step-3'; break;
                case 'step-3': nextStepId = 'step-2'; break;
                case 'step-2': nextStepId = 'step-1'; break;
                case 'step-1': nextStepId = 'completion-message'; break;
            }
            
            if (nextStepId) {
                navigateSteps(currentStep.id, nextStepId);
            }
        });
    });
    
    prevButtons.forEach(button => {
        button.addEventListener('click', function() {
            const currentStep = this.closest('.grounding-step');
            let prevStepId;
            
            switch(currentStep.id) {
                case 'step-4': prevStepId = 'step-5'; break;
                case 'step-3': prevStepId = 'step-4'; break;
                case 'step-2': prevStepId = 'step-3'; break;
                case 'step-1': prevStepId = 'step-2'; break;
            }
            
            if (prevStepId) {
                navigateSteps(currentStep.id, prevStepId);
            }
        });
    });
    
    startOverButton.addEventListener('click', function() {
        if (confirm('Are you sure you want to start over? This will clear your current progress.')) {
            // Reset steps
            steps.forEach(step => {
                step.style.display = 'none';
                step.classList.remove('active');
            });
            
            document.getElementById('step-5').style.display = 'block';
            document.getElementById('step-5').classList.add('active');
            
            // Clear inputs
            inputs.forEach(input => input.value = '');
            
            // Reset progress
            updateStepCounter('step-5');
            updateProgressBar();
            savedDataDiv.style.display = 'none';
            
            // Clear saved data
            localStorage.removeItem('groundingExerciseData');
            
            // Reset timer
            stopTimer();
            startTimer();
        }
    });
    
    viewDataButton.addEventListener('click', function() {
        displaySavedData();
    });
    
    // Input validation on blur
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (!this.value.trim()) {
                this.style.borderColor = 'red';
            } else {
                this.style.borderColor = '#ddd';
                saveCurrentData();
            }
        });
    });
});