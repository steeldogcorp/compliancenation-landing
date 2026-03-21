/* ═══════════════════════════════════════════════════════════════
   Compliance Nation Landing Page — Script
   Pricing Engine + ROI Calculator + Form Handler
   ═══════════════════════════════════════════════════════════════ */

// ── Pricing Tiers (mirrors prisma/seed-tiers.ts exactly) ─────────

const CONSORTIUM_TIERS = [
    { minDrivers: 1,  maxDrivers: 10,  basePriceInCents: 20000, perDriverInCents: 0 },
    { minDrivers: 11, maxDrivers: 20,  basePriceInCents: 0,     perDriverInCents: 2000 },
    { minDrivers: 21, maxDrivers: 30,  basePriceInCents: 0,     perDriverInCents: 1800 },
    { minDrivers: 31, maxDrivers: 50,  basePriceInCents: 0,     perDriverInCents: 1500 },
    { minDrivers: 51, maxDrivers: 100, basePriceInCents: 0,     perDriverInCents: 1200 },
];

const CORE_TIERS = [
    { minDrivers: 1,  maxDrivers: 10,  basePriceInCents: 19900, perDriverInCents: 0 },
    { minDrivers: 11, maxDrivers: 20,  basePriceInCents: 0,     perDriverInCents: 2000 },
    { minDrivers: 21, maxDrivers: 30,  basePriceInCents: 0,     perDriverInCents: 1800 },
    { minDrivers: 31, maxDrivers: 50,  basePriceInCents: 0,     perDriverInCents: 1500 },
    { minDrivers: 51, maxDrivers: 100, basePriceInCents: 0,     perDriverInCents: 1200 },
];

const PREMIUM_TIERS = [
    { minDrivers: 1,  maxDrivers: 5,   basePriceInCents: 29900, perDriverInCents: 0 },
    { minDrivers: 6,  maxDrivers: 10,  basePriceInCents: 0,     perDriverInCents: 4700 },
    { minDrivers: 11, maxDrivers: 20,  basePriceInCents: 0,     perDriverInCents: 4000 },
    { minDrivers: 21, maxDrivers: 30,  basePriceInCents: 0,     perDriverInCents: 3500 },
    { minDrivers: 31, maxDrivers: 50,  basePriceInCents: 0,     perDriverInCents: 3000 },
    { minDrivers: 51, maxDrivers: 100, basePriceInCents: 0,     perDriverInCents: 2500 },
];

// ── Plan Configs ──────────────────────────────────────────────────

const PLAN_CONFIGS = [
    {
        key: "consortium",
        name: "Consortium",
        subtitle: "Best for small fleets needing drug & alcohol compliance only",
        tiers: CONSORTIUM_TIERS,
        popular: false,
        isAnnual: true,
        highlights: [
            "Consortium roster management",
            "Random selection pool generator",
            "Quarterly compliance tracking",
            "Basic driver onboarding",
        ],
        roiHeadline: "Consortium simplifies drug & alcohol compliance",
    },
    {
        key: "core",
        name: "Core Compliance",
        subtitle: "Best for growing fleets replacing manual compliance",
        tiers: CORE_TIERS,
        popular: true,
        isAnnual: false,
        highlights: [
            "Everything in Consortium",
            "Complete DQ file management",
            "Vehicle file management",
            "Annual MVR & Clearinghouse pulls",
            "5 legacy driver imports included",
            "ELP testing (5 included, then per-test)",
        ],
        roiHeadline: "Core Compliance replaces manual compliance work",
    },
    {
        key: "premium",
        name: "Premium",
        subtitle: "Best for high-volume fleets needing full automation",
        tiers: PREMIUM_TIERS,
        popular: false,
        isAnnual: false,
        highlights: [
            "Everything in Core Compliance",
            "Continuous MVR monitoring",
            "Clearinghouse queries included",
            "FMCSA SAFER Sync",
            "CPDP DataQs crash challenge tool",
            "Priority support",
        ],
        roiHeadline: "Premium automates high-volume compliance operations",
    },
];

// ── ROI Constants ─────────────────────────────────────────────────

const AVG_COMPLIANCE_MANAGER = 85000;
const AVG_SAFETY_MANAGER = 70000;
const AUTOMATION_FACTOR = 0.7;
const HOURS_SAVED_PER_DRIVER = 0.4;

// ── Graduated Price Calculator ────────────────────────────────────

function calculateGraduatedPrice(tiers, driverCount) {
    let totalCents = 0;
    for (const tier of tiers) {
        if (driverCount < tier.minDrivers) continue;
        const driversInBracket = Math.min(driverCount, tier.maxDrivers || driverCount) - tier.minDrivers + 1;
        if (driversInBracket <= 0) continue;
        if (tier.basePriceInCents > 0) {
            totalCents += tier.basePriceInCents;
        } else {
            totalCents += driversInBracket * tier.perDriverInCents;
        }
    }
    return totalCents;
}

// ── State ─────────────────────────────────────────────────────────

let selectedPlan = "core";
let driverCount = 10;

// ── DOM References ────────────────────────────────────────────────

const slider = document.getElementById("driverSlider");
const countEl = document.getElementById("driverCount");
const planTabsEl = document.getElementById("planTabs");
const planCardsEl = document.getElementById("planCards");
const roiTitle = document.getElementById("roiTitle");
const roiLaborCost = document.getElementById("roiLaborCost");
const roiAnnualCost = document.getElementById("roiAnnualCost");
const roiSavings = document.getElementById("roiSavings");
const roiHours = document.getElementById("roiHours");
const roiPayback = document.getElementById("roiPayback");
const roiFraming = document.getElementById("roiFraming");
const roiLaborInline = document.getElementById("roiLaborInline");
const roiMonthlyInline = document.getElementById("roiMonthlyInline");

// ── Format Helpers ────────────────────────────────────────────────

function fmt(n) { return Math.round(n).toLocaleString("en-US"); }
function fmtDollars(cents) { return "$" + fmt(cents / 100); }

// ── Render ────────────────────────────────────────────────────────

function update() {
    const isOverCap = driverCount > 50;
    const displayCount = isOverCap ? 50 : driverCount;

    // Update driver count display
    countEl.textContent = isOverCap ? "50+" : driverCount;
    countEl.classList.toggle("over-cap", isOverCap);

    // Update plan tabs
    planTabsEl.querySelectorAll(".plan-tab").forEach(tab => {
        tab.classList.toggle("active", tab.dataset.plan === selectedPlan);
    });

    // Calculate prices for all plans
    const prices = PLAN_CONFIGS.map(plan => ({
        key: plan.key,
        totalCents: calculateGraduatedPrice(plan.tiers, displayCount),
    }));

    // Find selected plan
    const selConfig = PLAN_CONFIGS.find(p => p.key === selectedPlan);
    const selPrice = prices.find(p => p.key === selectedPlan);
    const selMonthly = selPrice.totalCents / 100;
    const selAnnual = selConfig.isAnnual ? selMonthly : selMonthly * 12;

    // ROI calculations
    const estimatedLabor = Math.round((AVG_COMPLIANCE_MANAGER + AVG_SAFETY_MANAGER) * AUTOMATION_FACTOR);
    const savings = Math.max(0, estimatedLabor - selAnnual);
    const hoursSaved = Math.round(displayCount * HOURS_SAVED_PER_DRIVER);
    const monthlySav = savings / 12;
    const paybackDays = monthlySav > 0 ? Math.max(1, Math.round((selAnnual / 12) / (monthlySav / 30))) : 0;

    // Update ROI section
    roiTitle.textContent = selConfig.roiHeadline;
    roiLaborCost.textContent = "$" + fmt(estimatedLabor);
    roiAnnualCost.textContent = "$" + fmt(Math.round(selAnnual));
    roiSavings.textContent = "$" + fmt(Math.round(savings));
    roiHours.textContent = hoursSaved + " hrs/week";
    roiPayback.textContent = paybackDays + " days";
    roiLaborInline.textContent = "$" + fmt(estimatedLabor) + " employee";
    roiMonthlyInline.textContent = "$" + fmt(Math.round(selAnnual / 12)) + "/month";

    // Render plan cards
    let cardsHTML = "";
    PLAN_CONFIGS.forEach((plan, i) => {
        const price = prices[i];
        const total = price.totalCents / 100;
        const perDriver = total / displayCount;
        const isSelected = selectedPlan === plan.key;
        const period = plan.isAnnual ? "/yr" : "/mo";

        let classes = "plan-card";
        if (plan.key === "consortium") classes += " is-consortium";
        if (plan.popular) classes += " is-popular";
        if (isSelected) classes += " selected";

        let priceHTML = "";
        if (isOverCap) {
            priceHTML = `
                <div class="plan-card-contact">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                    <a href="mailto:sales@compliancenation.io">Contact Sales</a>
                </div>
            `;
        } else {
            priceHTML = `
                <p class="plan-card-per-driver">$${perDriver.toFixed(2)} per driver${period}</p>
                <div class="plan-card-total">
                    <span class="plan-card-amount">$${fmt(total)}</span>
                    <span class="plan-card-period">${period}</span>
                </div>
                <p class="plan-card-for">for ${driverCount} driver${driverCount !== 1 ? "s" : ""}</p>
            `;
        }

        const timeBadge = plan.popular ? `
            <div class="plan-card-time-badge">
                <p>⏱ Saves 15–25 admin hours/week</p>
            </div>
        ` : "";

        const badge = plan.popular ? `<div class="plan-card-badge">Most Popular</div>` : "";

        const ctaClass = plan.popular ? "plan-card-cta-primary" : "plan-card-cta-secondary";
        const ctaText = isOverCap ? "Contact Sales" : "Get Started";
        const ctaHref = isOverCap ? "mailto:sales@compliancenation.io" : "#subscribe";

        const featuresHTML = plan.highlights.map(h =>
            `<li><span class="plan-card-check">✓</span><span>${h}</span></li>`
        ).join("");

        cardsHTML += `
            <div class="${classes}" data-plan="${plan.key}">
                ${badge}
                <div>
                    <div class="plan-card-name">${plan.name}</div>
                    <p class="plan-card-subtitle">${plan.subtitle}</p>
                </div>
                <div class="plan-card-price">${priceHTML}</div>
                ${timeBadge}
                <ul class="plan-card-features">${featuresHTML}</ul>
                <a href="${ctaHref}" class="plan-card-cta ${ctaClass}">${ctaText}</a>
            </div>
        `;
    });
    planCardsEl.innerHTML = cardsHTML;

    // Add click handlers to plan cards
    planCardsEl.querySelectorAll(".plan-card").forEach(card => {
        card.addEventListener("click", (e) => {
            if (e.target.closest(".plan-card-cta")) return;
            selectedPlan = card.dataset.plan;
            update();
        });
    });
}

// ── Event Listeners ───────────────────────────────────────────────

slider.addEventListener("input", () => {
    driverCount = parseInt(slider.value);
    update();
});

planTabsEl.addEventListener("click", (e) => {
    const tab = e.target.closest(".plan-tab");
    if (!tab) return;
    selectedPlan = tab.dataset.plan;
    update();
});

// ── Form Submission → Google Sheets ───────────────────────────────
//
// SETUP INSTRUCTIONS:
// 1. Create a Google Sheet (any name)
// 2. Open Extensions → Apps Script
// 3. Paste this code into Code.gs:
//
//    function doPost(e) {
//      var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
//      var data = JSON.parse(e.postData.contents);
//      sheet.appendRow([
//        new Date(),
//        data.name || '',
//        data.email || '',
//        data.company || '',
//        data.fleet_size || ''
//      ]);
//      return ContentService
//        .createTextOutput(JSON.stringify({ result: 'success' }))
//        .setMimeType(ContentService.MimeType.JSON);
//    }
//
// 4. Deploy → New Deployment → Web App
//    - Execute as: Me
//    - Who has access: Anyone
// 5. Copy the Web App URL and paste it below:

const GOOGLE_SHEET_URL = ""; // ← Paste your Google Apps Script Web App URL here

const form = document.getElementById("subscribeForm");
const submitBtn = document.getElementById("subscribeBtn");
const successEl = document.getElementById("subscribeSuccess");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const btnText = submitBtn.querySelector(".btn-text");
    const btnLoading = submitBtn.querySelector(".btn-loading");

    const payload = {
        name: document.getElementById("subscribeName").value,
        email: document.getElementById("subscribeEmail").value,
        company: document.getElementById("subscribeCompany").value,
        fleet_size: document.getElementById("subscribeFleet").value,
        timestamp: new Date().toISOString(),
    };

    // Show loading
    btnText.style.display = "none";
    btnLoading.style.display = "inline";
    submitBtn.disabled = true;

    try {
        if (GOOGLE_SHEET_URL) {
            await fetch(GOOGLE_SHEET_URL, {
                method: "POST",
                mode: "no-cors",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
        }

        // Show success
        form.style.display = "none";
        successEl.style.display = "block";
    } catch (err) {
        // Still show success (no-cors won't return readable response)
        form.style.display = "none";
        successEl.style.display = "block";
    }
});

// ── Navbar scroll effect ──────────────────────────────────────────

const navbar = document.getElementById("navbar");
window.addEventListener("scroll", () => {
    navbar.style.boxShadow = window.scrollY > 10
        ? "0 1px 3px rgba(0,0,0,0.08)"
        : "none";
});

// ── Init ──────────────────────────────────────────────────────────
update();
