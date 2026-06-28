# Task 16: Add Sound Design Enhancements

## Files:
- Modify: `src/audio/ambient.js`
- Create: `src/audio/music.js`
- Create: `src/audio/voice.js`
- Modify: `src/dialogue/engine.js`

## Interfaces:
- Consumes: scene, character state, chapter state
- Produces: `playAmbient(location)`, `playMusic(track)`, `speakLine(text, lang)`

## Steps:

### Step 1: Enhance ambient system

Expand `src/audio/ambient.js` with location-based soundscapes:
- casting_office: ac hum, distant phones, chai pour
- waiting_room: muffled talk, fan whir, footsteps
- audition_room: silence, ticking clock
- mumbai_street: auto horn, bollywood music distant, construction
- pg_room: ceiling fan, neighbor TV, traffic outside
- bandra_apartment: city hum glass, sleek door
- restaurant: ambient chatter, clinking glasses

### Step 2: Create music system

Create `src/audio/music.js`:
- sundaram_hopeful: harmonium melody
- arjun_cool: minimal piano
- rekha_melancholy: music box 90s
- ending: single piano note

### Step 3: Create voice playback system

Create `src/audio/voice.js`:
- Use Web Speech API (speechSynthesis)
- Support Hindi, English, Bhojpuri, Tamil
- speakLine(text, lang) returns Promise
- stopSpeaking() cancels current utterance

### Step 4: Integrate with dialogue engine

Modify `src/dialogue/engine.js` to call `speakLine()` when dialogue plays.

### Step 5: Commit

```bash
git add src/audio/ src/dialogue/engine.js
git commit -m "feat: add sound design with ambient, music, and voice systems"
```
