# Task 7: Create Rekha's Dialogue Trees

## Files:
- Create: `src/dialogue/rekha.js`

## Interfaces:
- Consumes: dialogue engine API
- Produces: `REKHA_DIALOGUE` object

## Steps:

### Step 1: Write Rekha's dialogue content

Rekha's chapter dialogue for these scenes:
1. **Morning routine** (3-4 nodes): Filter coffee, scripts, phone buzzing
2. **Reviewing tapes** (4-5 nodes): Watching Sundaram's and Arjun's audition tapes side by side
3. **Phone call with Vikram** (5-6 nodes): The compromising conversation — she pushes back, then relents
4. **Flashback trigger** (2-3 nodes): The Adivasi actress from 1998
5. **Meeting Sundaram** (4-5 nodes): After his audition, she sees his potential and his disappointment
6. **Ending** (3-4 nodes): Glass of wine, the photo, the weight of 30 years

Language: Hindi + English + occasional Tamil words (she's half-Tamil, half-Marathi)

### Step 2: Create REKHA_DIALOGUE export

```javascript
export const REKHA_DIALOGUE = {
  morning_routine: {
    speaker: 'rekha',
    text: { en: ' filter coffee. Scripts. The same morning for 30 years.', hi: 'फ़िल्टर कॉफ़ी। स्क्रिप्ट्स। 30 साल से वही सुबह।' },
    next: 'morning_scripts'
  },
  // ... (full dialogue tree with 30+ nodes)
};
```

### Step 3: Commit

```bash
git add src/dialogue/rekha.js
git commit -m "feat: add Rekha's dialogue trees"
```
