const languageMap = {
    hi: 'hi-IN',
    en: 'en-US',
    bhojpuri: 'hi-IN', // Bhojpuri fallback to Hindi
    tamil: 'ta-IN'
};

let currentUtterance = null;

export function speakLine(text, lang = 'en') {
    return new Promise((resolve) => {
        if (!window.speechSynthesis) {
            // Speech synthesis not supported, resolve immediately
            resolve();
            return;
        }

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = languageMap[lang] || 'en-US';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        utterance.onend = () => {
            currentUtterance = null;
            resolve();
        };

        utterance.onerror = (event) => {
            console.warn('Speech synthesis error:', event.error);
            currentUtterance = null;
            resolve();
        };

        currentUtterance = utterance;
        window.speechSynthesis.speak(utterance);
    });
}

export function stopSpeaking() {
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
    currentUtterance = null;
}

export function isSpeaking() {
    return window.speechSynthesis ? window.speechSynthesis.speaking : false;
}