const overlay = document.getElementById('tape-review-overlay');
const leftPanel = document.getElementById('tape-left');
const rightPanel = document.getElementById('tape-right');
const toggleBtn = document.getElementById('tape-toggle');

let isVisible = false;
let currentFocus = 'both'; // 'both', 'left', 'right'

const TAPES = {
    sundaram: {
        name: 'Sundaram Sharma',
        nameHi: 'सुंदरम शर्मा',
        origin: 'Bihar',
        description: {
            hi: 'बिहार से आया है। असली भावना है। मुंबई में कोई नहीं, फिर भी खड़ा है।',
            en: 'Came from Bihar. Real emotion. No one in Mumbai, still standing.'
        },
        dialogue: {
            hi: '"मैडम, मैं बिहार से आया हूँ। मुझे पता है कि इंडस्ट्री कैसे काम करती है।"',
            en: '"Madam, I came from Bihar. I know how the industry works."'
        },
        verdict: {
            hi: 'सुंदरम में टैलेंट है। असली दर्द है।',
            en: 'Sundaram has talent. Real pain.'
        }
    },
    arjun: {
        name: 'Arjun Kapoor',
        nameHi: 'अर्जुन कपूर',
        origin: 'Mumbai',
        description: {
            hi: 'विक्रम का बेटा। अच्छा चेहरा है, पर अंदर कुछ नहीं।',
            en: 'Vikram\'s son. Good face, but nothing inside.'
        },
        dialogue: {
            hi: '"पापा ने बोला है, रोल मिलेगा। बस नाम ही काफ़ी है।"',
            en: '"Dad said I\'ll get the role. The name is enough."'
        },
        verdict: {
            hi: 'अर्जुन में नाम है। बस।',
            en: 'Arjun has a name. That\'s all.'
        }
    }
};

export function showTapeReview() {
    if (isVisible) return;
    isVisible = true;
    currentFocus = 'both';

    overlay.classList.remove('hidden');
    renderTapes();
}

export function hideTapeReview() {
    isVisible = false;
    overlay.classList.add('hidden');
}

export function getCurrentTape() {
    return currentFocus;
}

function renderTapes() {
    const sundaram = TAPES.sundaram;
    const arjun = TAPES.arjun;

    leftPanel.innerHTML = `
        <div class="tape-header">
            <h3>${sundaram.name}</h3>
            <span class="tape-name-hi">${sundaram.nameHi}</span>
            <span class="tape-origin">${sundaram.origin}</span>
        </div>
        <div class="tape-description">
            <div class="tape-desc-hi">${sundaram.description.hi}</div>
            <div class="tape-desc-en">${sundaram.description.en}</div>
        </div>
        <div class="tape-dialogue">
            <div class="tape-dialogue-hi">${sundaram.dialogue.hi}</div>
            <div class="tape-dialogue-en">${sundaram.dialogue.en}</div>
        </div>
        <div class="tape-verdict">
            <div class="tape-verdict-hi">${sundaram.verdict.hi}</div>
            <div class="tape-verdict-en">${sundaram.verdict.en}</div>
        </div>
    `;

    rightPanel.innerHTML = `
        <div class="tape-header">
            <h3>${arjun.name}</h3>
            <span class="tape-name-hi">${arjun.nameHi}</span>
            <span class="tape-origin">${arjun.origin}</span>
        </div>
        <div class="tape-description">
            <div class="tape-desc-hi">${arjun.description.hi}</div>
            <div class="tape-desc-en">${arjun.description.en}</div>
        </div>
        <div class="tape-dialogue">
            <div class="tape-dialogue-hi">${arjun.dialogue.hi}</div>
            <div class="tape-dialogue-en">${arjun.dialogue.en}</div>
        </div>
        <div class="tape-verdict">
            <div class="tape-verdict-hi">${arjun.verdict.hi}</div>
            <div class="tape-verdict-en">${arjun.verdict.en}</div>
        </div>
    `;
}

function toggleFocus() {
    if (currentFocus === 'both') {
        currentFocus = 'left';
        leftPanel.classList.add('tape-focused');
        rightPanel.classList.add('tape-dimmed');
        rightPanel.classList.remove('tape-focused');
        leftPanel.classList.remove('tape-dimmed');
    } else if (currentFocus === 'left') {
        currentFocus = 'right';
        leftPanel.classList.add('tape-dimmed');
        rightPanel.classList.add('tape-focused');
        rightPanel.classList.remove('tape-dimmed');
        leftPanel.classList.remove('tape-focused');
    } else {
        currentFocus = 'both';
        leftPanel.classList.remove('tape-focused', 'tape-dimmed');
        rightPanel.classList.remove('tape-focused', 'tape-dimmed');
    }
}

if (toggleBtn) {
    toggleBtn.addEventListener('click', toggleFocus);
}

document.addEventListener('keydown', (e) => {
    if (!isVisible) return;

    if (e.key === 'Escape') {
        hideTapeReview();
    } else if (e.key === 'Tab') {
        e.preventDefault();
        toggleFocus();
    }
});
