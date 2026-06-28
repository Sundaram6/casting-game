let subtitlesEnabled = true;

export function toggleSubtitles() {
    subtitlesEnabled = !subtitlesEnabled;
    document.body.classList.toggle('subtitles-off', !subtitlesEnabled);
}

export function areSubtitlesEnabled() {
    return subtitlesEnabled;
}

document.getElementById('settings-btn')?.addEventListener('click', toggleSubtitles);