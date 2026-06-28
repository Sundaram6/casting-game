const sounds = {
    fail: new Audio('https://www.myinstants.com/media/sounds/emotional-damage-meme.mp3'),
    sensual: new Audio('https://www.myinstants.com/media/sounds/careless-whisper-1.mp3'),
    sigma: new Audio('https://www.myinstants.com/media/sounds/sigma-rule-meme-song.mp3'),
    victorious: new Audio('https://www.myinstants.com/media/sounds/final-fantasy-vii-victory-fanfare-1.mp3'),
    type: new Audio('https://www.myinstants.com/media/sounds/minecraft_click.mp3'),
    bgm: new Audio('https://www.myinstants.com/media/sounds/wii-shop-channel-music.mp3'),
    chatter: new Audio('https://www.myinstants.com/media/sounds/crowd-talking-1.mp3')
};

sounds.bgm.loop = true;
sounds.bgm.volume = 0.2;
sounds.chatter.loop = true;
sounds.chatter.volume = 0.4;
sounds.sensual.volume = 0.85;
sounds.victorious.volume = 0.75;
sounds.sigma.volume = 0.8;

function playSound(snd) {
    snd.currentTime = 0;
    snd.play().catch(e => console.log("Audio play blocked"));
}

function stopAllSounds() {
    Object.values(sounds).forEach(s => {
        if (s && typeof s.pause === 'function') {
            s.pause();
            s.currentTime = 0;
        }
    });
}

export { sounds, playSound, stopAllSounds };
