# Task 6: Implement Arjun's Key Scenes

## Files:
- Modify: `src/chapters/arjun.js`
- Modify: `src/dialogue/arjun.js`

## Interfaces:
- Consumes: relationship tracker, dialogue engine, environment presets
- Produces: Complete playable Arjun chapter

## Steps:

### Step 1: Implement the waiting room encounter

The most important scene in Arjun's chapter — Arjun meets Sundaram in the waiting room.

Create environmental trigger: when Arjun's camera is within 5 units of Sundaram's NPC position, trigger dialogue node `arjun_waiting_sundaram`.

Dialogue beats:
1. Arjun notices Sundaram's creased headshot
2. Awkward attempt to connect using Bhojpuri
3. Sundaram's monologue about his journey
4. Arjun's internal conflict (shown through choice options)
5. The casting assistant calls Arjun's name — he goes in immediately

### Step 2: Implement the audition scene

Arjun performs his monologue. This is NOT a minigame — it's a narrative sequence:
1. Camera moves to audition room
2. Arjun speaks (dialogue with speech synthesis)
3. Raksh's response plays
4. Player sees the outcome

### Step 3: Implement the dinner confrontation

The climax of Arjun's chapter. A dialogue-heavy scene with his father:
1. Restaurant environment (retextured office or new location)
2. Vikram Malhotra's character appears (NPC or dialogue-only)
3. Key line: "Tere baap ne mehnat ki hai taaki tereko mehnat na karni pade."
4. Player choices determine Arjun's emotional arc
5. Ends with Arjun's realization

### Step 4: Test full Arjun chapter

Play through Arjun's complete chapter:
- Morning scene → auto ride → arrival → waiting room → audition → dinner
- Verify all dialogue plays correctly
- Verify relationship effects apply
- Verify environment presets shift correctly

### Step 5: Commit

```bash
git add src/chapters/arjun.js src/dialogue/arjun.js
git commit -m "feat: implement Arjun's complete chapter (morning to dinner)"
```
