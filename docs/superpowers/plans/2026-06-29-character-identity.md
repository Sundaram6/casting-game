# Character Identity & Relationship Visibility — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Surface character identity and relationship dynamics to players through dialogue fixes, UI enhancements, journal profiles, and flashback activation.

**Architecture:** Enhance existing systems (dialogue, switcher, title cards, journal, flashbacks) to reveal character backgrounds organically. No new UI overlays or data models.

**Tech Stack:** Three.js r160.1, Vite, ES modules, CSS, Canvas2D

## Global Constraints

- Three.js r160.1 (npm), Vite for dev server
- Mobile support required, 30+ FPS desktop, 20+ FPS mobile
- No external texture files — procedural textures via Canvas2D
- Trilingual dialogue: Hindi, English, Bhojpuri — subtitled
- Build: `npm run build` must pass
- Dev server: `npm run dev` → localhost:5173

---

### Task 1: Complete Dialogue Speaker Names

**Files:**
- Modify: `src/ui/dialogue-ui.js:19-25`

**Interfaces:**
- Consumes: none
- Produces: complete `speakerNames` map used by `updateDialogueUI()`

- [ ] **Step 1: Read current speakerNames map**

```bash
cat src/ui/dialogue-ui.js | head -30
```

- [ ] **Step 2: Replace speakerNames with complete map**

In `src/ui/dialogue-ui.js`, replace the existing `speakerNames` object (lines 19-25) with:

```js
const speakerNames = {
    'Sundaram': 'Sundaram Sharma',
    'Arjun': 'Arjun Malhotra',
    'Rekha': 'Rekha Iyer',
    'Vikram': 'Vikram Malhotra',
    'Auto Driver': 'Auto Driver',
    'Office Staff': 'Office Staff',
    'Another Staff': 'Office Staff',
    'Actor': 'Fellow Actor',
    'Assistant': 'Casting Assistant',
    'Raksh': 'Raksh Chhabra',
    'Narrator': ''
};
```

- [ ] **Step 3: Verify syntax**

```bash
node -c src/ui/dialogue-ui.js
```

- [ ] **Step 4: Commit**

```bash
git add src/ui/dialogue-ui.js
git commit -m "fix: complete dialogue speaker name map"
```

---

### Task 2: Add Role Label to Title Card

**Files:**
- Modify: `src/effects/transitions.js:30-50`

**Interfaces:**
- Consumes: none (standalone change)
- Produces: `showTitleCard(hindi, english, callback)` — adds optional `role` parameter

- [ ] **Step 1: Read current showTitleCard**

```bash
cat src/effects/transitions.js
```

- [ ] **Step 2: Update showTitleCard to accept role parameter**

In `src/effects/transitions.js`, replace `showTitleCard` function with:

```js
function showTitleCard(hindi, english, callback, role) {
    if (!overlay) return;
    
    let roleHtml = '';
    if (role) {
        roleHtml = `<div style="font-family: 'Outfit', sans-serif; font-size: 0.9rem; color: rgba(255,255,255,0.5); font-style: italic; margin-top: 0.5rem; letter-spacing: 1px;">${role}</div>`;
    }
    
    overlay.innerHTML = `
        <div style="text-align: center;">
            <div style="font-family: 'Noto Sans Devanagari', sans-serif; font-size: 2.5rem; color: white; text-shadow: 0 0 20px rgba(0,0,0,0.8);">${hindi}</div>
            <div style="font-family: 'Outfit', sans-serif; font-size: 1.2rem; color: rgba(255,255,255,0.7); letter-spacing: 2px; margin-top: 0.3rem;">${english}</div>
            ${roleHtml}
        </div>
    `;
    
    overlay.style.transition = 'opacity 0.8s ease';
    overlay.style.opacity = '1';
    
    setTimeout(() => {
        overlay.style.opacity = '0';
        setTimeout(() => {
            if (callback) callback();
        }, 800);
    }, 3000);
}
```

- [ ] **Step 3: Verify syntax**

```bash
node -c src/effects/transitions.js
```

- [ ] **Step 4: Commit**

```bash
git add src/effects/transitions.js
git commit -m "feat: add role label to title card"
```

---

### Task 3: Pass Role to Title Card from Switcher

**Files:**
- Modify: `src/ui/switcher-ui.js:91-124`

**Interfaces:**
- Consumes: `getCharacterConfig(charId).role` from characters.js
- Produces: passes `role` to `showTitleCard()` from transitions.js

- [ ] **Step 1: Read current switchToCharacter function**

```bash
grep -n "showTitleCard" src/ui/switcher-ui.js
```

- [ ] **Step 2: Update showTitleCard call to pass role**

In `src/ui/switcher-ui.js`, find the `showTitleCard` call inside `switchToCharacter` (around line 116) and change:

```js
// Before:
showTitleCard(titles.hindi, titles.english, () => {

// After:
const charConfig = getCharacterConfig(charId);
showTitleCard(titles.hindi, titles.english, () => {
```

Then find the closing of that callback and add role parameter. The full block should be:

```js
const charConfig = getCharacterConfig(charId);
showTitleCard(titles.hindi, titles.english, () => {
    fadeFromBlack(() => {
        switchingInProgress = false;
        currentCharacter = charId;
        updateSwitcherDisplay();
    });
}, charConfig.role);
```

- [ ] **Step 3: Verify syntax**

```bash
node -c src/ui/switcher-ui.js
```

- [ ] **Step 4: Commit**

```bash
git add src/ui/switcher-ui.js
git commit -m "feat: pass role label to title card on character switch"
```

---

### Task 4: Add Role Labels to Switcher Buttons

**Files:**
- Modify: `src/ui/switcher-ui.js:126-165`
- Modify: `styles.css:975-1063`

**Interfaces:**
- Consumes: `getCharacterConfig(charId).role` from characters.js
- Produces: role labels visible on switcher buttons

- [ ] **Step 1: Read current createSwitcherUI**

```bash
sed -n '126,165p' src/ui/switcher-ui.js
```

- [ ] **Step 2: Add role span to button creation**

In `src/ui/switcher-ui.js`, inside `createSwitcherUI()`, after the `nameHiEl` creation (around line 150), add:

```js
const roleEl = document.createElement('span');
roleEl.className = 'switcher-role';
const charConfig = getCharacterConfig(charId);
roleEl.textContent = charConfig.role;
```

Then append `roleEl` to the button after `nameHiEl`:

```js
btn.appendChild(lockEl);
btn.appendChild(nameEl);
btn.appendChild(nameHiEl);
btn.appendChild(roleEl);
```

- [ ] **Step 3: Add CSS for switcher-role**

In `styles.css`, after the `.switcher-name-hi` rule (around line 1063), add:

```css
.switcher-role {
    font-size: 0.55rem;
    color: rgba(255, 215, 0, 0.5);
    font-style: italic;
    letter-spacing: 0.5px;
    margin-top: 2px;
}
```

- [ ] **Step 4: Verify syntax**

```bash
node -c src/ui/switcher-ui.js
```

- [ ] **Step 5: Commit**

```bash
git add src/ui/switcher-ui.js styles.css
git commit -m "feat: add role labels to character switcher buttons"
```

---

### Task 5: Add HUD Character Indicator

**Files:**
- Modify: `index.html:22-27`
- Modify: `src/ui/switcher-ui.js:91-124`
- Modify: `styles.css` (append)

**Interfaces:**
- Consumes: `getCharacterConfig(charId)` from characters.js
- Produces: persistent character name/role display in HUD

- [ ] **Step 1: Add HUD character div to index.html**

In `index.html`, after the existing `#hud` div (around line 27), add:

```html
<div id="hud-character">
    <div id="hud-char-name"></div>
    <div id="hud-char-role"></div>
</div>
```

- [ ] **Step 2: Add CSS for hud-character**

In `styles.css`, append:

```css
#hud-character {
    position: fixed;
    top: 20px;
    left: 20px;
    z-index: 150;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(8px);
    padding: 8px 14px;
    border-radius: 6px;
    border: 1px solid rgba(255, 215, 0, 0.15);
    pointer-events: none;
}

#hud-char-name {
    font-family: 'Outfit', sans-serif;
    font-size: 0.85rem;
    color: rgba(255, 215, 0, 0.9);
    font-weight: 600;
    letter-spacing: 0.5px;
}

#hud-char-role {
    font-family: 'Outfit', sans-serif;
    font-size: 0.65rem;
    color: rgba(255, 255, 255, 0.45);
    font-style: italic;
    margin-top: 2px;
}
```

- [ ] **Step 3: Add updateHudCharacter function to switcher-ui.js**

In `src/ui/switcher-ui.js`, add a new function before `initSwitcherUI`:

```js
function updateHudCharacter(charId) {
    const nameEl = document.getElementById('hud-char-name');
    const roleEl = document.getElementById('hud-char-role');
    if (!nameEl || !roleEl) return;
    const config = getCharacterConfig(charId);
    nameEl.textContent = config.name;
    roleEl.textContent = config.role;
}
```

- [ ] **Step 4: Call updateHudCharacter on character switch**

In `src/ui/switcher-ui.js`, inside `switchToCharacter()`, after `currentCharacter = charId;` (around line 119), add:

```js
updateHudCharacter(charId);
```

- [ ] **Step 5: Call updateHudCharacter on init**

In `src/ui/switcher-ui.js`, inside `initSwitcherUI()`, after `currentCharacter = getCharacter();` (around line 169), add:

```js
updateHudCharacter(currentCharacter);
```

- [ ] **Step 6: Verify syntax**

```bash
node -c src/ui/switcher-ui.js
```

- [ ] **Step 7: Commit**

```bash
git add index.html src/ui/switcher-ui.js styles.css
git commit -m "feat: add HUD character indicator showing name and role"
```

---

### Task 6: Add Journal Character Profiles

**Files:**
- Modify: `src/journal/entries.js`
- Modify: `src/ui/switcher-ui.js:208-228`

**Interfaces:**
- Consumes: `addJournalByTrigger()` from journal/system.js
- Produces: biographical entries triggered on first character switch

- [ ] **Step 1: Add biographical entries to entries.js**

In `src/journal/entries.js`, add these entries to the `JOURNAL_ENTRIES` object (before the closing `};`):

```js
sundaram_profile: {
    character: 'sundaram',
    title: { en: 'Sundaram Sharma — The Outsider', hi: 'सुंदरम शर्मा — बाहरी' },
    content: {
        en: 'Theater artist from Patna, Bihar. Fluent in Hindi, English, and Bhojpuri. Came to Mumbai with dreams and a train ticket. No contacts, no surname that opens doors. Just talent and hunger.',
        hi: 'बिहार के पटना से थिएटर कलाकार। हिंदी, अंग्रेजी और भोजपुरी में धाराप्रवाह। मुंबई सपनों और ट्रेन के टिकट के साथ आया। कोई संपर्क नहीं, कोई ऐसा उपनाम नहीं जो दरवाज़े खोले। बस प्रतिभा और भूख।'
    },
    trigger: 'character_profile_sundaram'
},
arjun_profile: {
    character: 'arjun',
    title: { en: 'Arjun Malhotra — The Nepo Kid', hi: 'अर्जुन मल्होत्रा — नेपो किड' },
    content: {
        en: 'Son of Vikram Malhotra, one of Bollywood\'s biggest producers. Grew up on film sets. Everyone knows his father\'s name — not his. The industry calls it privilege. He calls it pressure.',
        hi: 'बॉलीवुड के सबसे बड़े निर्माताओं में से एक विक्रम मल्होत्रा के बेटे। फिल्म के सेट पर पले-बढ़े। सबको उनके पिता का नाम पता है — उनका नहीं। इंडस्ट्री इसे फ़ायदा कहती है। वो इसे दबाव कहते हैं।'
    },
    trigger: 'character_profile_arjun'
},
rekha_profile: {
    character: 'rekha',
    title: { en: 'Rekha Iyer — The Gatekeeper', hi: 'रेखा अय्यर — द्वारपाल' },
    content: {
        en: 'Thirty years in casting. She\'s seen a thousand hopefuls walk through that door. Some she fought for. Some she let go. The question is which ones she remembers.',
        hi: 'कास्टिंग में तीस साल। उसने हज़ारों उम्मीदवारों को उस दरवाज़े से जाते देखा है। कुछ के लिए लड़ी। कुछ को जाने दिया। सवाल यह है कि उसे कौन याद हैं।'
    },
    trigger: 'character_profile_rekha'
},
```

- [ ] **Step 2: Trigger profile entries on first character switch**

In `src/ui/switcher-ui.js`, inside the `chapterComplete` event listener (around line 208), add profile triggers. Before the `switch (chapter)` block, add:

```js
// Trigger character profile on first switch
const profileTrigger = `character_profile_${chapter}`;
if (!hasEntry(profileTrigger)) {
    addJournalByTrigger(profileTrigger);
}
```

Also add `hasJournalEntry` to the imports at the top of the file:

```js
import { addJournalByTrigger, hasEntry } from '../journal/system.js';
```

- [ ] **Step 3: Verify syntax**

```bash
node -c src/journal/entries.js
node -c src/ui/switcher-ui.js
```

- [ ] **Step 4: Commit**

```bash
git add src/journal/entries.js src/ui/switcher-ui.js
git commit -m "feat: add biographical journal entries for each character"
```

---

### Task 7: Add Relationship Tracking to Journal UI

**Files:**
- Modify: `src/relationship.js`
- Modify: `src/ui/journal-ui.js`
- Modify: `styles.css` (append)

**Interfaces:**
- Consumes: `getRelationshipSummary()` from relationship.js
- Produces: relationship bars visible in journal

- [ ] **Step 1: Add getRelationshipData export to relationship.js**

In `src/relationship.js`, add this export after the existing exports:

```js
export function getRelationshipData() {
    return JSON.parse(JSON.stringify(relationships));
}
```

- [ ] **Step 2: Add relationship section to journal-ui.js**

In `src/ui/journal-ui.js`, add a relationship rendering function and call it from `updateJournalDisplay`:

Add at the top of the file, after imports:

```js
import { getRelationshipData } from '../relationship.js';

const CHARACTER_DISPLAY = {
    sundaram: { en: 'Sundaram Sharma', hi: 'सुंदरम शर्मा' },
    arjun: { en: 'Arjun Malhotra', hi: 'अर्जुन मल्होत्रा' },
    rekha: { en: 'Rekha Iyer', hi: 'रेखा अय्यर' }
};

const STAT_LABELS = {
    trust: { en: 'Trust', hi: 'विश्वास' },
    respect: { en: 'Respect', hi: 'सम्मान' },
    empathy: { en: 'Empathy', hi: 'सहानुभूति' },
    guilt: { en: 'Guilt', hi: 'अपराध बोध' },
    complicity: { en: 'Complicity', hi: 'संलिप्तता' }
};
```

Add a function to render relationship bars:

```js
function renderRelationships(container) {
    const data = getRelationshipData();
    
    const section = document.createElement('div');
    section.className = 'journal-section';
    section.innerHTML = `<div class="journal-section-title">Relationships</div>`;
    
    for (const [charId, stats] of Object.entries(data)) {
        const charDiv = document.createElement('div');
        charDiv.className = 'journal-relationship';
        
        const name = CHARACTER_DISPLAY[charId]?.en || charId;
        charDiv.innerHTML = `<div class="journal-rel-name">${name}</div>`;
        
        for (const [stat, value] of Object.entries(stats)) {
            const label = STAT_LABELS[stat]?.en || stat;
            const barHtml = `
                <div class="journal-rel-stat">
                    <span class="journal-rel-label">${label}</span>
                    <div class="journal-rel-bar">
                        <div class="journal-rel-fill" style="width: ${value}%"></div>
                    </div>
                    <span class="journal-rel-value">${value}%</span>
                </div>
            `;
            charDiv.innerHTML += barHtml;
        }
        
        section.appendChild(charDiv);
    }
    
    container.appendChild(section);
}
```

In `updateJournalDisplay()`, after the entries loop, add:

```js
renderRelationships(contentEl);
```

- [ ] **Step 3: Add CSS for relationship bars**

In `styles.css`, append:

```css
.journal-section {
    margin-top: 20px;
    padding-top: 15px;
    border-top: 1px solid rgba(255, 215, 0, 0.15);
}

.journal-section-title {
    font-family: 'Outfit', sans-serif;
    font-size: 0.85rem;
    color: rgba(255, 215, 0, 0.7);
    text-transform: uppercase;
    letter-spacing: 2px;
    margin-bottom: 15px;
}

.journal-relationship {
    margin-bottom: 15px;
}

.journal-rel-name {
    font-family: 'Outfit', sans-serif;
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 6px;
}

.journal-rel-stat {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
}

.journal-rel-label {
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.5);
    min-width: 80px;
}

.journal-rel-bar {
    flex: 1;
    height: 6px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    overflow: hidden;
}

.journal-rel-fill {
    height: 100%;
    background: linear-gradient(90deg, rgba(255, 215, 0, 0.6), rgba(255, 215, 0, 0.9));
    border-radius: 3px;
    transition: width 0.3s ease;
}

.journal-rel-value {
    font-size: 0.65rem;
    color: rgba(255, 215, 0, 0.6);
    min-width: 30px;
    text-align: right;
}
```

- [ ] **Step 4: Verify syntax**

```bash
node -c src/relationship.js
node -c src/ui/journal-ui.js
```

- [ ] **Step 5: Commit**

```bash
git add src/relationship.js src/ui/journal-ui.js styles.css
git commit -m "feat: add relationship tracking visualization to journal"
```

---

### Task 8: Add Bihar Dialogue to Sundaram's Chapter

**Files:**
- Modify: `src/dialogue/sundaram.js`

**Interfaces:**
- Consumes: none
- Produces: dialogue nodes that reveal Sundaram's Bihar origin

- [ ] **Step 1: Read current look_around node**

```bash
grep -n "look_around" src/dialogue/sundaram.js
```

- [ ] **Step 2: Add Bihar line to look_around node**

In `src/dialogue/sundaram.js`, find the `look_around` node. Update its `text` to include Bihar reference:

```js
look_around: {
    speaker: 'Sundaram',
    text: {
        hi: 'पहले इधर-उधर देखते हैं... दादर से यहाँ तक 16 घंटे की ट्रेन थी। पटना से मुंबई... वही सपना, बस शहर बदल गया।',
        en: 'Let me look around first... 16 hours by train from Dadar. Patna to Mumbai... same dream, just a different city.',
        bhojpuri: 'पहिले इधर-उधर देखते हैं... दादर से यहाँ तक 16 घंटे की ट्रेन थी। पटना से मुंबई... वही सपना, बस शहर बदल गया।'
    },
    options: [
        {
            text: {
                hi: 'अंदर जाओ',
                en: 'Go inside',
                bhojpuri: 'अंदर जाव'
            },
            next: 'enter_office'
        },
        {
            text: {
                hi: 'चाय वाले से बात करो',
                en: 'Talk to the chai wallah',
                bhojpuri: 'चाय वाला से बात करव'
            },
            next: 'chai'
        }
    ]
},
```

- [ ] **Step 3: Add Bihar reference to chai node**

In `src/dialogue/sundaram.js`, find the `chai` node. Add Bihar connection to the text:

```js
chai: {
    speaker: 'Sundaram',
    text: {
        hi: 'चाय वाला: "चाय लोगे?" ... लगता है बिहारी है। एहसान हो जाएगा।',
        en: 'Chai wallah: "Want some tea?" ... Looks like he\'s from Bihar. A familiar connection.',
        bhojpuri: 'चाय वाला: "चाय लेव?" ... लगता है बिहारी है। एहसान हो जाएगा।'
    },
    options: [
        {
            text: {
                hi: '"बिहारी हो?"',
                en: '"Are you from Bihar?"',
                bhojpuri: '"बिहारी हो?"'
            },
            next: 'chai_bihar'
        },
        {
            text: {
                hi: 'बस चाय लो',
                en: 'Just take the tea',
                bhojpuri: 'बस चाय लेव'
            },
            next: 'enter_office'
        }
    ]
},
```

Add the new `chai_bihar` node after the `chai` node:

```js
chai_bihar: {
    speaker: 'Sundaram',
    text: {
        hi: 'चाय वाला: "हाँ भैया, पटना से। यहाँ चाय बेचते हैं, सपने देखते हैं।" ... अच्छा लगा कोई अपना मिला।',
        en: 'Chai wallah: "Yes brother, from Patna. Sell tea here, dream here." ... Nice to find someone from home.',
        bhojpuri: 'चाय वाला: "हाँ भैया, पटना से। यहाँ चाय बेचते हैं, सपने देखते हैं।" ... अच्छा लगा कोई अपना मिला।'
    },
    options: [
        {
            text: {
                hi: 'अंदर जाओ',
                en: 'Go inside',
                bhojpuri: 'अंदर जाव'
            },
            next: 'enter_office'
        }
    ]
},
```

- [ ] **Step 4: Add Bihar reference to waiting_room node**

In `src/dialogue/sundaram.js`, find the `waiting_room` node. Add identity reveal to the text:

```js
waiting_room: {
    speaker: 'Sundaram',
    text: {
        hi: 'वेटिंग रूम में बैठे हैं... सब मुंबई वाले लगते हैं। मैं अकेला बिहारी हूँ शायद। पटना में थिएटर करता था, अब यहाँ ऑडिशन दे रहा हूँ।',
        en: 'Sitting in the waiting room... everyone looks like they\'re from Mumbai. Maybe I\'m the only one from Bihar. Used to do theater in Patna, now giving auditions here.',
        bhojpuri: 'वेटिंग रूम में बैठे हैं... सब मुंबई वाले लगते हैं। मैं अकेला बिहारी हूँ शायद। पटना में थिएटर करता था, अब यहाँ ऑडिशन दे रहा हूँ।'
    },
    options: [
        {
            text: {
                hi: 'चुपचाप बैठो',
                en: 'Sit quietly',
                bhojpuri: 'चुपचाप बैठव'
            },
            next: 'sit_and_wait'
        },
        {
            text: {
                hi: 'किसी से बात करो',
                en: 'Talk to someone',
                bhojpuri: 'किसी से बात करव'
            },
            next: 'talk_actor'
        }
    ]
},
```

- [ ] **Step 5: Verify syntax**

```bash
node -c src/dialogue/sundaram.js
```

- [ ] **Step 6: Commit**

```bash
git add src/dialogue/sundaram.js
git commit -m "feat: add Bihar identity reveal to Sundaram's dialogue"
```

---

### Task 9: Activate Flashback System

**Files:**
- Modify: `src/flashback/system.js`
- Modify: `src/dialogue/sundaram.js`
- Modify: `src/dialogue/arjun.js`
- Modify: `src/dialogue/rekha.js`
- Modify: `src/journal/entries.js`

**Interfaces:**
- Consumes: `triggerFlashback()` from flashback/system.js, `FLASHBACK_SCENES` from flashback/scenes.js
- Produces: flashbacks triggered at story moments, skippable, with journal entries

- [ ] **Step 1: Add skip handler to flashback system**

In `src/flashback/system.js`, add a skip handler. After the `triggerFlashback` function, add:

```js
let skipRequested = false;

export function requestSkip() {
    skipRequested = true;
}

export function isSkipRequested() {
    return skipRequested;
}

export function resetSkip() {
    skipRequested = false;
}
```

In the `updateFlashback` function, add skip check during the `playing` phase. Find the playing phase block and add:

```js
case 'playing':
    flashbackTimer += dt;
    if (flashbackTimer >= duration || skipRequested) {
        skipRequested = false;
        phase = 'fading_out';
        flashbackTimer = 0;
    }
    break;
```

- [ ] **Step 2: Add Escape/click skip listener**

In `src/flashback/system.js`, add event listeners for skip. After the skip functions, add:

```js
function initSkipListeners() {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isFlashbackActive()) {
            requestSkip();
        }
    });
    document.addEventListener('click', () => {
        if (isFlashbackActive()) {
            requestSkip();
        }
    });
}

let listenersInitialized = false;
export function ensureSkipListeners() {
    if (!listenersInitialized) {
        initSkipListeners();
        listenersInitialized = true;
    }
}
```

- [ ] **Step 3: Add flashback journal entries**

In `src/journal/entries.js`, add entries for each flashback:

```js
sundaram_flashback: {
    character: 'sundaram',
    title: { en: 'Patna — Mother\'s Shop', hi: 'पटना — माँ की दुकान' },
    content: {
        en: 'The smell of incense and old books. Mother\'s small shop near Patna Junction. She said: "Go to Mumbai. Learn. Come back and teach." I never went back.',
        hi: 'अगरबत्ती और पुरानी किताबों की खुशबू। पटना जंक्शन के पास माँ की छोटी दुकान। उन्होंने कहा: "मुंबई जाओ। सीखो। वापस आकर सिखाओ।" मैं कभी वापस नहीं गया।'
    },
    trigger: 'flashback_sundaram_patna'
},
arjun_flashback: {
    character: 'arjun',
    title: { en: 'The Film Set — Age 8', hi: 'फिल्म का सेट — उम्र 8 साल' },
    content: {
        en: 'Dad lifted me onto his shoulders. The director said "He has your face." I got the role before I knew what acting was. That\'s when I learned: in this family, doors open themselves.',
        hi: 'पापा ने मुझे कंधों पर उठाया। निर्देशक ने कहा "उसके चेहरे में तुम हो।" मुझे भूमिका मिल गई इससे पहले कि मैं अभिनय का मतलब जानता। तभी सीखा: इस परिवार में दरवाज़े अपने आप खुलते हैं।'
    },
    trigger: 'flashback_arjun_childhood'
},
rekha_flashback: {
    character: 'rekha',
    title: { en: '1998 — Geeta', hi: '1998 — गीता' },
    content: {
        en: 'Geeta. An Adivasi actress from Jharkhand. Raw talent, no connections. I fought for her. The producer said "Who is she?" I said "She\'s better than your star." He said "Then find another project." I stayed quiet.',
        hi: 'गीता। झारखंड की एक आदिवासी अभिनेत्री। कच्ची प्रतिभा, कोई संपर्क नहीं। मैंने उसके लिए लड़ा। निर्माता ने कहा "वो कौन है?" मैंने कहा "वो आपकी स्टार से बेहतर है।" उसने कहा "तो कोई और प्रोजेक्ट ढूंढो।" मैं चुप रही।'
    },
    trigger: 'flashback_rekha_1998'
},
```

- [ ] **Step 4: Trigger flashbacks from dialogue**

In `src/dialogue/sundaram.js`, find the `enter_office` node. Add a flashback trigger to its first option's effect:

```js
enter_office: {
    speaker: 'Sundaram',
    text: {
        hi: 'अंदर जाते हैं... देखते हैं कौन है।',
        en: 'Let\'s go inside... see who\'s there.',
        bhojpuri: 'अंदर जाते हैं... देखते हैं कौन है।'
    },
    options: [
        {
            text: {
                hi: 'वेटिंग रूम में बैठो',
                en: 'Sit in the waiting room',
                bhojpuri: 'वेटिंग रूम में बैठव'
            },
            next: 'waiting_room',
            effect: () => {
                import('../flashback/system.js').then(m => {
                    m.triggerFlashback('sundaram_patna', 8);
                    m.setOnFlashbackComplete(() => {
                        import('../journal/system.js').then(j => j.addJournalByTrigger('flashback_sundaram_patna'));
                    });
                });
            }
        },
        {
            text: {
                hi: 'चाय वाले से चाय लो',
                en: 'Get tea from the chai wallah',
                bhojpuri: 'चाय वाला से चाय लेव'
            },
            next: 'chai'
        }
    ]
},
```

In `src/dialogue/arjun.js`, find the `arrival_recognition` node (where staff greets Arjun). Add flashback trigger:

```js
// In the effect of the option that leads to arrival_recognition
effect: () => {
    import('../flashback/system.js').then(m => {
        m.triggerFlashback('arjun_childhood', 8);
        m.setOnFlashbackComplete(() => {
            import('../journal/system.js').then(j => j.addJournalByTrigger('flashback_arjun_childhood'));
        });
    });
}
```

In `src/dialogue/rekha.js`, find the `tapes_sundaram` node (where Rekha watches Sundaram's tape). Add flashback trigger:

```js
// In the effect of the option that leads to tapes_sundaram
effect: () => {
    import('../flashback/system.js').then(m => {
        m.triggerFlashback('rekha_1998', 8);
        m.setOnFlashbackComplete(() => {
            import('../journal/system.js').then(j => j.addJournalByTrigger('flashback_rekha_1998'));
        });
    });
}
```

- [ ] **Step 5: Ensure skip listeners are initialized**

In `src/main.js`, add to the imports and call `ensureSkipListeners()` in `initGame()`:

```js
import { ensureSkipListeners } from './flashback/system.js';
```

In `initGame()`, add:

```js
ensureSkipListeners();
```

- [ ] **Step 6: Verify syntax**

```bash
node -c src/flashback/system.js
node -c src/dialogue/sundaram.js
node -c src/dialogue/arjun.js
node -c src/dialogue/rekha.js
node -c src/journal/entries.js
node -c src/main.js
```

- [ ] **Step 7: Commit**

```bash
git add src/flashback/system.js src/dialogue/sundaram.js src/dialogue/arjun.js src/dialogue/rekha.js src/journal/entries.js src/main.js
git commit -m "feat: activate flashbacks at key story moments with skip support"
```

---

### Task 18: Build and Verify

- [ ] **Step 1: Run full build**

```bash
npm run build
```

- [ ] **Step 2: Run syntax checks on all modified files**

```bash
node -c src/ui/dialogue-ui.js
node -c src/effects/transitions.js
node -c src/ui/switcher-ui.js
node -c src/journal/entries.js
node -c src/ui/journal-ui.js
node -c src/relationship.js
node -c src/flashback/system.js
node -c src/dialogue/sundaram.js
node -c src/dialogue/arjun.js
node -c src/dialogue/rekha.js
node -c src/main.js
```

- [ ] **Step 3: Verify no old references remain**

```bash
grep -r "getGameState\|setGameState" src/
```

Expected: no output

- [ ] **Step 4: Commit build artifacts**

```bash
git add -A
git commit -m "chore: build and verify character identity features"
```
