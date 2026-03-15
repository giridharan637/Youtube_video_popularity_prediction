function analyzeTitleSEO() {
    const title = document.getElementById('tool-title-input').value;
    const resultDiv = document.getElementById('title-analysis-result');
    const scoreText = document.getElementById('title-score-text');
    const scoreBar = document.getElementById('title-score-bar');
    const tipsUl = document.getElementById('title-tips');

    if (!title.trim()) return;

    resultDiv.classList.remove('hidden');
    let score = 0;
    tipsUl.innerHTML = '';

    // Length check
    if (title.length >= 40 && title.length <= 60) {
        score += 40;
        addTip('green', 'Perfect title length (40-60 chars).');
    } else if (title.length > 0 && title.length < 40) {
        score += 20;
        addTip('yellow', 'A bit short. Try adding more descriptive keywords.');
    } else if (title.length > 60) {
        score += 25;
        addTip('red', 'Too long. It might get truncated in search results.');
    }

    // Buzzwords
    const buzzwords = ['how', 'to', 'top', 'best', 'review', 'vlog', 'tutorial', '2023', '2024', '2025', '2026', 'why', 'guide', 'explained', 'amazing', 'viral', 'secret'];
    const foundBuzzwords = buzzwords.filter(word => title.toLowerCase().includes(word));
    if (foundBuzzwords.length > 0) {
        score += 40;
        addTip('green', `Great use of buzzwords: ${foundBuzzwords.slice(0, 3).join(', ')}.`);
    } else {
        addTip('yellow', 'Try adding power words like "Best", "How To", or "Guide".');
    }

    // Numbers/Year
    if (/\d+/.test(title)) {
        score += 20;
        addTip('green', 'Numbers in titles often increase CTR.');
    }

    score = Math.min(100, score);
    scoreText.innerText = `${score}/100`;
    scoreBar.style.width = `${score}%`;

    // Bar color
    if (score < 40) scoreBar.style.backgroundColor = '#ef4444';
    else if (score < 80) scoreBar.style.backgroundColor = '#eab308';
    else scoreBar.style.backgroundColor = '#22c55e';

    function addTip(color, text) {
        const icon = color === 'green' ? 'fa-check-circle text-green-500' : (color === 'yellow' ? 'fa-exclamation-circle text-yellow-500' : 'fa-times-circle text-red-500');
        tipsUl.innerHTML += `<li class="flex items-center gap-2"><i class="fas ${icon}"></i> ${text}</li>`;
    }
}

function generateTags() {
    const cat = document.getElementById('tool-category-select').value;
    const resultDiv = document.getElementById('tags-result');
    const tagsMap = {
        '10': ['Music', 'New Music', 'Cover', 'Live Performance', 'Artist', 'Music Video', 'Trending', 'Pop', 'Acoustic', 'Songwriter'],
        '20': ['Gaming', 'Gameplay', 'Let\'s Play', 'Stream', 'Esports', 'Gamer', 'Twitch', 'Walkthrough', 'PC Gaming', 'Modding'],
        '27': ['Education', 'Tutorial', 'Learn', 'How To', 'Science', 'Study', 'Tips', 'Masterclass', 'Online Course', 'Student'],
        '28': ['Tech', 'Review', 'Unboxing', 'Gadgets', 'Technology', 'Setup', 'Apple', 'Android', 'Future Tech', 'Computing'],
        '24': ['Entertainment', 'Funny', 'Comedy', 'Vlog', 'Trending', 'Drama', 'Reaction', 'StoryTime', 'Prank', 'Challenge']
    };

    resultDiv.classList.remove('hidden');
    resultDiv.style.display = 'flex';
    resultDiv.innerHTML = '';

    const tags = tagsMap[cat] || [];
    tags.forEach((tag, index) => {
        const span = document.createElement('span');
        span.className = 'px-3 py-1.5 rounded-full text-xs font-semibold bg-[var(--gradient-full)] text-white shadow-md cursor-pointer transition-transform hover:scale-110 inline-block animate__animated animate__zoomIn';
        span.style.animationDelay = `${index * 50}ms`;
        span.innerText = `#${tag.replace(/\s+/g, '')}`;
        span.onclick = () => {
            navigator.clipboard.writeText(span.innerText);
            const originalText = span.innerText;
            span.innerText = 'Copied!';
            setTimeout(() => span.innerText = originalText, 1000);
        };
        resultDiv.appendChild(span);
    });
}

function optimizeDescription() {
    const desc = document.getElementById('tool-desc-input').value;
    const resultDiv = document.getElementById('desc-analysis-result');
    const statusLabel = document.getElementById('desc-length-status');
    const feedbackText = document.getElementById('desc-feedback');

    if (!desc.trim()) return;

    resultDiv.classList.remove('hidden');
    const len = desc.length;

    if (len < 200) {
        statusLabel.innerText = 'Too Short';
        statusLabel.className = 'text-xs font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/20';
        feedbackText.innerText = 'Your description is very short. Aim for at least 500 characters to help YouTube index your video properly.';
    } else if (len >= 500 && len <= 2000) {
        statusLabel.innerText = 'Optimal';
        statusLabel.className = 'text-xs font-bold px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 border border-green-500/20';
        feedbackText.innerText = 'Great job! This length is perfect for SEO. Make sure your call-to-action is in the first few lines.';
    } else {
        statusLabel.innerText = 'Long';
        statusLabel.className = 'text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20';
        feedbackText.innerText = 'Your description is quite long. This is fine, but ensure the most important information is at the very top.';
    }
}

// Check for URL parameters to auto-open specific tools
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const requestedTool = urlParams.get('tool');
    
    if (requestedTool === 'tags') {
        // Scroll to tags or highlight it?
    }
});
