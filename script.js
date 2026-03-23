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
        subtitle: "Drug & alcohol compliance without the overhead",
        tiers: CONSORTIUM_TIERS,
        popular: false,
        isAnnual: true,
        highlights: [
            "Consortium roster management",
            "Random selection pool generator",
            "Quarterly compliance tracking",
            "Basic driver onboarding",
        ],
        roiHeadline: "Simplify drug & alcohol compliance",
    },
    {
        key: "core",
        name: "Core Compliance",
        subtitle: "Stay compliant without spreadsheets or manual follow-up",
        tiers: CORE_TIERS,
        popular: true,
        isAnnual: false,
        highlights: [
            "Driver application + VOE automation",
            "Complete DQ file management",
            "Vehicle file tracking & alerts",
            "Annual MVR & Clearinghouse pulls",
            "Digital audit-ready compliance files",
            "Drug & alcohol consortium included",
        ],
        roiHeadline: "Replace manual compliance work",
    },
    {
        key: "command",
        name: "Compliance Command",
        subtitle: "Reduce risk. Reduce workload. Run a better operation.",
        tiers: PREMIUM_TIERS,
        popular: false,
        isAnnual: false,
        highlights: [
            "Everything in Core Compliance",
            "Continuous MVR monitoring (real-time alerts)",
            "Automated Clearinghouse queries",
            "Driver document delegation via SMS",
            "Live crash reporting & test decision engine",
            "AI safety insights & violation trending",
            "DataQs crash challenge assistant",
        ],
        roiHeadline: "Prevent costly mistakes and reduce workload",
    },
];

// ── ROI Constants ─────────────────────────────────────────────────

const AVG_COMPLIANCE_MANAGER = 85000;
const AVG_SAFETY_MANAGER = 70000;
const AUTOMATION_FACTOR = 0.7;
const RISK_EVENT_COST = 25000;
const COMMAND_RISK_REDUCTION = 0.6;

// ── Graduated Price Calculator ────────────────────────────────────

function calculateGraduatedPrice(tiers, driverCount) {
    let totalCents = 0;
    let baseApplied = false;
    for (const tier of tiers) {
        if (driverCount < tier.minDrivers) continue;
        const bracketMax = tier.maxDrivers || driverCount;
        const driversInBracket = Math.min(driverCount, bracketMax) - tier.minDrivers + 1;
        if (driversInBracket <= 0) continue;
        
        if (tier.basePriceInCents > 0 && !baseApplied) {
            totalCents += tier.basePriceInCents;
            baseApplied = true;
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
const roiLaborSub = document.getElementById("roiLaborSub");
const roiSavingsLabel = document.getElementById("roiSavingsLabel");
const valBar1Text = document.getElementById("valBar1Text");
const valBar2Text = document.getElementById("valBar2Text");

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
    let savings = Math.max(0, estimatedLabor - selAnnual);
    let riskSavings = 0;
    if (selectedPlan === "command") {
        riskSavings = Math.round(RISK_EVENT_COST * COMMAND_RISK_REDUCTION);
        savings += riskSavings;
    }

    let hoursSaved;
    if (selectedPlan === "core") hoursSaved = Math.round(displayCount * 0.4);
    else if (selectedPlan === "command") hoursSaved = Math.round(displayCount * 0.7);
    else hoursSaved = Math.round(displayCount * 0.1);

    const monthlySav = savings / 12;
    const paybackDays = monthlySav > 0 ? Math.max(1, Math.round((selAnnual / 12) / (monthlySav / 30))) : 0;

    // Update ROI section
    roiTitle.textContent = selConfig.roiHeadline;
    roiLaborCost.textContent = "$" + fmt(selectedPlan === "command" ? estimatedLabor + RISK_EVENT_COST : estimatedLabor);
    roiLaborSub.textContent = selectedPlan === "command" ? "labor + $25k risk exposure/yr" : "per year in labor";
    roiAnnualCost.textContent = "$" + fmt(Math.round(selAnnual));
    roiSavingsLabel.textContent = selectedPlan === "command" ? "Total Impact" : "Your Savings";
    roiSavings.textContent = "$" + fmt(Math.round(savings));
    roiHours.textContent = hoursSaved + " hrs/week";
    roiPayback.textContent = paybackDays + " days";
    roiFraming.textContent = selectedPlan === "command" ? "Prevent just one violation or suspended-license incident and Compliance Command pays for itself." : "Replace manual compliance work and eliminate admin overhead.";
    
    valBar1Text.textContent = selectedPlan === "command" ? "Eliminate $25K+ in risk exposure" : "Save $56K–$118K/year";
    valBar2Text.textContent = selectedPlan === "command" ? "Automate 85–95% of safety ops" : "Reduce workload by 60–80%";

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

        let valueTag = "";
        if (plan.key === "core") {
            valueTag = `<div style="background:#eff6ff; border:1px solid #dbeafe; border-radius:8px; padding:8px 12px; margin-bottom:16px; text-align:center;">
                <p style="font-size:12px; font-weight:600; color:#1d4ed8; margin:0; display:flex; align-items:center; justify-content:center; gap:4px">
                    <span>💰</span> Saves $56K–$118K/year
                </p>
            </div>`;
        } else if (plan.key === "command") {
            valueTag = `<div style="background:#eef2ff; border:1px solid #e0e7ff; border-radius:8px; padding:8px 12px; margin-bottom:16px; text-align:center;">
                <p style="font-size:11.5px; font-weight:600; color:#4338ca; margin:0; display:flex; align-items:center; justify-content:center; gap:4px; white-space:nowrap;">
                    <span>⚙️</span> Saves 15-25 hrs/wk + reduces risk
                </p>
            </div>`;
        }

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
                ${valueTag}
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

const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbyjcunBvmqmaINlHIFDc_t3_X_O79LUl-HpV2upjDGz-LAzgQ8AlS3pSyoR9GU9n7Z5/exec";

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
                headers: { "Content-Type": "text/plain" },
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
