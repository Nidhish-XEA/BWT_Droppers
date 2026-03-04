const ctx = document.getElementById('riskChart').getContext('2d');
const riskChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
        labels: ['Risk', 'Safe'],
        datasets: [{
            data: [0, 100],
            backgroundColor: [
                'rgba(16, 185, 129, 0.8)', // Green initially
                'rgba(255, 255, 255, 0.05)'
            ],
            borderWidth: 0,
            borderRadius: 5
        }]
    },
    options: {
        cutout: '80%',
        rotation: -90,
        circumference: 180,
        plugins: {
            legend: { display: false },
            tooltip: { enabled: false }
        },
        animation: { animateRotate: true, animateScale: false }
    }
});

let lastLogCount = 0;
let previousMode = "REAL";

function createTypewriterEffect(element, text, speed = 10) {
    element.innerHTML = '';
    let i = 0;
    function typeWriter() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(typeWriter, speed);
        }
    }
    typeWriter();
}

function updateUI(data) {
    // 1. Update Gauge
    const score = data.risk_score;
    document.getElementById('risk-number').innerText = score;

    riskChart.data.datasets[0].data = [score, 100 - score];

    let color = 'rgba(16, 185, 129, 0.8)'; // Green
    let textColorClass = 'text-green';

    if (score >= 50) {
        color = 'rgba(255, 51, 102, 0.8)'; // Red
        textColorClass = 'text-red';
    } else if (score >= 20) {
        color = 'rgba(245, 158, 11, 0.8)'; // Yellow
        textColorClass = 'text-yellow';
    }

    riskChart.data.datasets[0].backgroundColor[0] = color;
    riskChart.update();

    const riskNumberEl = document.getElementById('risk-number');
    riskNumberEl.className = `gauge-center-text ${textColorClass}`;

    // 2. Update Classification and Status Panel
    const attackerTypeEl = document.getElementById('attacker-type');
    attackerTypeEl.innerText = data.attacker_type;
    attackerTypeEl.className = `metric-value ${textColorClass}`;

    document.getElementById('behavior-deviation').innerText = data.behavior_analysis;
    document.getElementById('total-reqs').innerText = data.total_requests;
    document.getElementById('suspicious-reqs').innerText = data.suspicious_requests;

    const statusEl = document.getElementById('system-status-indicator');
    const breachModal = document.getElementById('breach-modal');
    const panels = document.querySelectorAll('.panel');

    if (data.system_state === "SHADOW") {
        statusEl.innerText = "ISOLATED (SHADOW)";
        statusEl.className = "status-badge shadow-active";

        // Minimalist Breach Banner
        if (previousMode !== "SHADOW") {
            breachModal.classList.add('active');
            panels.forEach(p => p.classList.add('alert-mode'));

            setTimeout(() => {
                breachModal.classList.remove('active');
            }, 5000); // Banner stays a bit longer
        }
    } else {
        statusEl.innerText = "Healthy";
        statusEl.className = "status-badge";
        panels.forEach(p => p.classList.remove('alert-mode'));
    }
    previousMode = data.system_state;

    // 3. Update Logs (Typewriter style for new logs)
    const logFeed = document.getElementById('activity-feed');
    if (data.session_logs.length > lastLogCount) {
        if (lastLogCount === 0) logFeed.innerHTML = ""; // clear waiting message

        for (let i = lastLogCount; i < data.session_logs.length; i++) {
            const logParts = data.session_logs[i].split("] ");
            if (logParts.length < 2) continue;

            const timeStr = logParts[0] + "]";
            const msgStr = logParts[1];

            const isCritical = msgStr.includes("Flagged");
            const isWarning = msgStr.includes("Failed");

            const li = document.createElement('div');
            li.className = `log-entry ${isCritical ? 'critical' : (isWarning ? 'failed' : '')}`;

            // Format log nicely
            const actionParts = msgStr.split(" - ");
            let contentHTML = `<span class="log-time">${timeStr}</span>`;
            if (actionParts.length > 1) {
                contentHTML += `<span class="log-endpoint">${actionParts[1]}</span> <span>${actionParts[0]}</span>`;
            } else {
                contentHTML += `<span>${msgStr}</span>`;
            }

            li.innerHTML = contentHTML;
            logFeed.prepend(li);
        }
        lastLogCount = data.session_logs.length;
    }

    // 4. Update Risk Reasons
    const reasonsList = document.getElementById('risk-reasons');
    if (data.risk_reasons && data.risk_reasons.length > 0) {
        reasonsList.innerHTML = data.risk_reasons.map(r => `<li class="reason-item">${r}</li>`).join('');
    } else if (data.risk_score === 0) {
        reasonsList.innerHTML = '<li style="color: #64748b; font-size: 13px; font-style: italic;">System nominal. No deviations detected.</li>';
    }
}

async function startPolling() {
    setInterval(async () => {
        try {
            const res = await fetch('/dashboard-data');
            const data = await res.json();
            updateUI(data);
        } catch (e) {
            console.error("Polling error:", e);
        }
    }, 250); // Lively sync: 250ms instapoll
}

// Ensure gauge starts at 0 visually before poll
startPolling();
