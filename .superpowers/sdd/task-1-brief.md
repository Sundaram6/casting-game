### Task 1: Scaffold Vite Project

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Modify: `index.html`

**Interfaces:**
- Consumes: existing `game.js`, `styles.css`
- Produces: working Vite dev server with hot reload

- [ ] **Step 1: Create package.json**

```json
{
  "name": "casting-office-3d",
  "version": "2.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "three": "^0.160.0"
  },
  "devDependencies": {
    "vite": "^5.0.0"
  }
}
```

- [ ] **Step 2: Create vite.config.js**

```javascript
import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
});
```

- [ ] **Step 3: Update index.html script tag**

Replace the old script tag with:
```html
<script type="module" src="/src/main.js"></script>
```

- [ ] **Step 4: Install dependencies**

```bash
npm install
```

- [ ] **Step 5: Test dev server**

```bash
npm run dev
```

Verify game loads in browser at `http://localhost:5173`.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json vite.config.js index.html
git commit -m "feat: scaffold Vite project with Three.js dependency"
```
