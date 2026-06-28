// Music track definitions (stub - no actual audio files)
const musicTracks = {
    sundaram_hopeful: 'harmonium melody',
    arjun_cool: 'minimal piano',
    rekha_melancholy: 'music box 90s',
    ending: 'single piano note'
};

let currentTrack = null;

export function playMusic(track) {
    if (!musicTracks[track]) {
        console.warn(`Unknown music track: ${track}`);
        return;
    }
    // Stub: no actual playback
    currentTrack = track;
    console.log(`Playing music track: ${track} (${musicTracks[track]})`);
}

export function stopMusic() {
    currentTrack = null;
    console.log('Music stopped');
}

export function getCurrentTrack() {
    return currentTrack;
}