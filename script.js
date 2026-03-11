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

// ===== PRICING CALCULATOR =====
const TIERS = {
    consortium: {
        name: 'Consortium',
        period: 'year',
        basePriceCents: 20000, // $200/year
        baseDrivers: 10,
        tiers: [
            { min: 1, max: 10, perDriverCents: 0 },      // included in base
            { min: 11, max: 20, perDriverCents: 2000 },   // $20/driver/yr
            { min: 21, max: 30, perDriverCents: 1800 },   // $18/driver/yr
            { min: 31, max: 50, perDriverCents: 1500 },   // $15/driver/yr
            { min: 51, max: 100, perDriverCents: 1200 },  // $12/driver/yr
        ],
        features: [
            'Random drug & alcohol testing pool',
            'Certificate of enrollment',
            'Company drug & alcohol policy',
            'Lab coordination & record keeping',
            'DOT-compliant random selections',
            'Test result record management',
        ]
    },
    core: {
        name: 'Core Compliance',
        period: 'month',
        basePriceCents: 19900, // $199/month
        baseDrivers: 10,
        tiers: [
            { min: 1, max: 10, perDriverCents: 0 },
            { min: 11, max: 20, perDriverCents: 2000 },   // $20/driver/mo
            { min: 21, max: 30, perDriverCents: 1800 },   // $18/driver/mo
            { min: 31, max: 50, perDriverCents: 1500 },   // $15/driver/mo
            { min: 51, max: 100, perDriverCents: 1200 },  // $12/driver/mo
        ],
        features: [
            'Everything in Consortium',
            'Automated driver onboarding',
            'Driver qualification file builder',
            'Driving record checks on hire',
            'FMCSA Clearinghouse queries',
            'Deadline tracking & expiration alerts',
            'Vehicle maintenance file tracking',
        ]
    },
    premium: {
        name: 'Premium',
        period: 'month',
        basePriceCents: 29900, // $299/month
        baseDrivers: 5,
        tiers: [
            { min: 1, max: 5, perDriverCents: 0 },       // included in base
            { min: 6, max: 10, perDriverCents: 4700 },    // $47/driver/mo
            { min: 11, max: 20, perDriverCents: 4000 },   // $40/driver/mo
            { min: 21, max: 30, perDriverCents: 3500 },   // $35/driver/mo
            { min: 31, max: 50, perDriverCents: 3000 },   // $30/driver/mo
            { min: 51, max: 100, perDriverCents: 2500 },  // $25/driver/mo
        ],
        features: [
            'Everything in Core Compliance',
            'Continuous driving record monitoring',
            'Insurance broker integration',
            'One-click DOT audit export',
            'Reasonable suspicion training (free)',
            'AI compliance assistant',
            'Priority support',
        ]
    }
};

const SAFETY_MANAGER_LOW = 55000;
const SAFETY_MANAGER_HIGH = 75000;

let currentTier = 'core';
let currentDrivers = 10;

function calculatePrice(tierKey, drivers) {
    const tier = TIERS[tierKey];
    const baseDrivers = tier.baseDrivers;
    let totalCents = tier.basePriceCents;
    let extraDriverCost = 0;
    const extraDrivers = Math.max(0, drivers - baseDrivers);

    if (extraDrivers > 0) {
        let remaining = extraDrivers;
        for (let i = 1; i < tier.tiers.length; i++) {
            const band = tier.tiers[i];
            const bandSize = band.max - band.min + 1;
            const driversInBand = Math.min(remaining, bandSize);
            if (driversInBand <= 0) break;
            extraDriverCost += driversInBand * band.perDriverCents;
            remaining -= driversInBand;
        }
    }

    totalCents += extraDriverCost;
    return {
        total: totalCents,
        base: tier.basePriceCents,
        extra: extraDriverCost,
        extraDrivers: extraDrivers,
        baseDrivers: baseDrivers,
        period: tier.period,
    };
}

function formatDollars(cents) {
    return '$' + (cents / 100).toLocaleString('en-US', { maximumFractionDigits: 0 });
}

function updateCalc() {
    const tier = TIERS[currentTier];
    const price = calculatePrice(currentTier, currentDrivers);

    // Update driver count display
    document.getElementById('calcDriverCount').textContent = currentDrivers;

    // Update price display
    document.getElementById('calcAmount').textContent = (price.total / 100).toLocaleString('en-US', { maximumFractionDigits: 0 });
    document.getElementById('calcPeriod').textContent = '/' + price.period;

    // Average per driver
    const avgPerDriver = (price.total / 100 / currentDrivers).toFixed(2);
    document.getElementById('calcAvgDriver').textContent = '$' + avgPerDriver + ' avg cost per driver';

    // Breakdown
    document.getElementById('calcBase').parentElement.querySelector('span:first-child').textContent = 'Base fee (includes ' + price.baseDrivers + ' drivers)';
    document.getElementById('calcBase').textContent = formatDollars(price.base);
    const extraRow = document.getElementById('calcExtraRow');
    if (price.extraDrivers > 0) {
        extraRow.style.display = 'flex';
        document.getElementById('calcExtraLabel').textContent = price.extraDrivers + ' additional driver' + (price.extraDrivers > 1 ? 's' : '');
        document.getElementById('calcExtraAmount').textContent = formatDollars(price.extra);
    } else {
        extraRow.style.display = 'none';
    }
    document.getElementById('calcTotal').textContent = formatDollars(price.total) + '/' + price.period;

    // Feature list
    const featureList = document.getElementById('calcFeatureList');
    featureList.innerHTML = tier.features.map(f => '<li>' + f + '</li>').join('');

    // ROI Calculation
    let annualCost;
    if (price.period === 'year') {
        annualCost = price.total / 100;
    } else {
        annualCost = (price.total / 100) * 12;
    }

    document.getElementById('roiOurCost').textContent = '$' + annualCost.toLocaleString('en-US', { maximumFractionDigits: 0 }) + '/yr';

    const savingsLow = SAFETY_MANAGER_LOW - annualCost;
    const savingsHigh = SAFETY_MANAGER_HIGH - annualCost;

    if (savingsLow > 0) {
        document.getElementById('roiSavings').textContent =
            '$' + savingsLow.toLocaleString('en-US', { maximumFractionDigits: 0 }) +
            ' – $' + savingsHigh.toLocaleString('en-US', { maximumFractionDigits: 0 });
    } else {
        document.getElementById('roiSavings').textContent =
            'Up to $' + savingsHigh.toLocaleString('en-US', { maximumFractionDigits: 0 });
    }

    // Update slider fill
    const slider = document.getElementById('driverSlider');
    const percent = ((currentDrivers - 1) / 99) * 100;
    slider.style.background = 'linear-gradient(to right, #3B82F6 0%, #06B6D4 ' + percent + '%, #1A2744 ' + percent + '%)';
}

// Tier tab clicks
document.getElementById('calcTierTabs').addEventListener('click', function(e) {
    const tab = e.target.closest('.calc-tier-tab');
    if (!tab) return;
    currentTier = tab.dataset.tier;
    document.querySelectorAll('.calc-tier-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    updateCalc();
});

// Slider input
const driverSlider = document.getElementById('driverSlider');
if (driverSlider) {
    driverSlider.addEventListener('input', function() {
        currentDrivers = parseInt(this.value, 10);
        updateCalc();
    });
}

// Initialize
updateCalc();
