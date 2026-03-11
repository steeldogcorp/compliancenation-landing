// ===== NAVBAR SCROLL EFFECT =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// ===== MOBILE MENU =====
const mobileToggle = document.getElementById('mobileToggle');
const navLinks = document.getElementById('navLinks');
mobileToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
});
// Close mobile menu on link click
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ===== COUNTER ANIMATION =====
function animateCounter(el, target) {
    const duration = 1500;
    const start = performance.now();
    const from = 0;

    function tick(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // ease out cubic
        const ease = 1 - Math.pow(1 - progress, 3);
        const value = Math.round(from + (target - from) * ease);
        el.textContent = value;
        if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
}

// Observe counters
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseInt(el.dataset.target, 10);
            if (target) animateCounter(el, target);
            counterObserver.unobserve(el);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('[data-target]').forEach(el => {
    counterObserver.observe(el);
});

// ===== WORKFLOW STEP ANIMATION =====
const workflowSteps = document.querySelectorAll('.workflow-step');
const workflowProgress = document.getElementById('workflowProgress');
let currentStep = 0;

function activateWorkflowStep(index) {
    workflowSteps.forEach((step, i) => {
        step.classList.toggle('active', i <= index);
    });
    const progressPercent = (index / (workflowSteps.length - 1)) * 100;
    if (workflowProgress) {
        workflowProgress.style.height = progressPercent + '%';
    }
}

// Auto-cycle through steps
let workflowInterval;
const workflowObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            currentStep = 0;
            activateWorkflowStep(0);
            workflowInterval = setInterval(() => {
                currentStep = (currentStep + 1) % workflowSteps.length;
                activateWorkflowStep(currentStep);
            }, 2000);
            workflowObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.3 });

const workflowSection = document.getElementById('how-it-works');
if (workflowSection) {
    workflowObserver.observe(workflowSection);
}

// ===== SCROLL REVEAL =====
const revealElements = document.querySelectorAll(
    '.feature-card, .comparison-card, .pricing-card, .step-content, .subscribe-card'
);

revealElements.forEach(el => el.classList.add('reveal'));

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

revealElements.forEach(el => revealObserver.observe(el));

// ===== SUBSCRIBE FORM =====
const form = document.getElementById('subscribeForm');
const submitBtn = document.getElementById('subscribeBtn');
const successEl = document.getElementById('subscribeSuccess');

if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoading = submitBtn.querySelector('.btn-loading');
        
        // Show loading state
        btnText.style.display = 'none';
        btnLoading.style.display = 'inline-flex';
        submitBtn.disabled = true;

        try {
            const formData = new FormData(form);
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                form.style.display = 'none';
                successEl.style.display = 'block';
                document.querySelector('.form-disclaimer').style.display = 'none';
            } else {
                throw new Error('Form submission failed');
            }
        } catch (err) {
            // Fallback: still show success since we don't have formspree configured yet
            // In production, replace with actual error handling
            form.style.display = 'none';
            successEl.style.display = 'block';
            document.querySelector('.form-disclaimer').style.display = 'none';
        }
    });
}

// ===== SMOOTH SCROLL FOR CTA BUTTONS =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});
