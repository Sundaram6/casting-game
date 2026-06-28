## Task 14: Add Hindi Font Support

**Status:** DONE

### What was implemented
1. Added Noto Sans Devanagari font alongside Outfit in `index.html` via Google Fonts link
2. Added CSS classes for Hindi/Bhojpuri/English text rendering in `styles.css`

### Files changed
- `index.html:8` — Google Fonts link updated to include Noto Sans Devanagari (400,700) + Outfit (400,700,900)
- `styles.css:792-807` — Added CSS classes:
  - `.text-hi, .text-bhojpuri, .transition-hi` — Noto Sans Devanagari font family
  - `.text-en` — Outfit font family with muted color styling
  - `.text-bhojpuri` — Warm color (#D4A574) with italic style

### Commit
- `0ec7120` feat: add Hindi font support for trilingual dialogue

### Self-review
- All three CSS classes from the spec are present
- Google Fonts URL matches spec exactly
- No overengineering — just the font link and three style blocks
- Existing codebase patterns preserved (Outfit was already used, Noto Sans Devanagari is the standard Hindi web font)
