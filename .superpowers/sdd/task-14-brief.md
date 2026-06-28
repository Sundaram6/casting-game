### Task 14: Add Hindi Font Support

**Files:**
- Modify: `index.html` (add Google Fonts link)
- Modify: `styles.css` (add Hindi font styles)

**Interfaces:**
- Consumes: none
- Produces: Hindi text renders correctly in dialogue UI

- [ ] **Step 1: Add Noto Sans Devanagari font**

In `index.html`, add to `<head>`:
```html
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;700&family=Outfit:wght@400;700;900&display=swap" rel="stylesheet">
```

- [ ] **Step 2: Add Hindi font styles**

In `styles.css`:
```css
.text-hi, .text-bhojpuri, .transition-hi {
    font-family: 'Noto Sans Devanagari', sans-serif;
}

.text-en {
    font-family: 'Outfit', sans-serif;
    color: #aaa;
    font-size: 0.9em;
    margin-top: 4px;
}

.text-bhojpuri {
    color: #D4A574;
    font-style: italic;
}
```

- [ ] **Step 3: Test**

Verify Hindi text renders correctly in dialogue.

- [ ] **Step 4: Commit**

```bash
git add index.html styles.css
git commit -m "feat: add Hindi font support for trilingual dialogue"
```
