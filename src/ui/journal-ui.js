// src/ui/journal-ui.js
// Journal overlay UI

import { getJournalEntries, clearJournal } from '../journal/system.js';
import { getRelationshipData } from '../relationship.js';

let journalVisible = false;
let journalElement = null;

const CHARACTER_NAMES = {
  sundaram: { en: 'Sundaram Sharma', hi: 'सुंदरम शर्मा' },
  arjun: { en: 'Arjun Malhotra', hi: 'अर्जुन मल्होत्रा' },
  rekha: { en: 'Rekha Iyer', hi: 'रेखा अय्यर' }
};

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

export function initJournalUI() {
  journalElement = document.createElement('div');
  journalElement.id = 'journal-overlay';
  journalElement.className = 'hidden';
  journalElement.innerHTML = `
    <div class="journal-container">
      <div class="journal-header">
        <h2 class="journal-title">Journal</h2>
        <button id="journal-close" class="journal-close-btn">✕</button>
      </div>
      <div class="journal-entries"></div>
    </div>
  `;
  document.body.appendChild(journalElement);

  document.getElementById('journal-close').addEventListener('click', hideJournal);
}

export function showJournal() {
  journalVisible = true;
  journalElement.classList.remove('hidden');
  updateJournalDisplay();
}

export function hideJournal() {
  journalVisible = false;
  journalElement.classList.add('hidden');
}

export function toggleJournal() {
  if (journalVisible) {
    hideJournal();
  } else {
    showJournal();
  }
}

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

function updateJournalDisplay() {
  const entries = getJournalEntries();
  const container = journalElement.querySelector('.journal-entries');

  if (entries.length === 0) {
    container.innerHTML = `
      <div class="journal-empty">
        <div class="journal-empty-icon">📖</div>
        <div class="journal-empty-text">No entries yet. Keep playing to discover the story.</div>
      </div>
    `;
    return;
  }

  container.innerHTML = entries.map(entry => `
    <div class="journal-entry" data-character="${entry.character}">
      <div class="journal-entry-character">${CHARACTER_NAMES[entry.character]?.en || entry.character}</div>
      <div class="journal-entry-title">${entry.title.en}</div>
      <div class="journal-entry-content">
        <div class="text-hi">${entry.content.hi}</div>
        <div class="text-en">${entry.content.en}</div>
      </div>
    </div>
  `).join('');
  
  renderRelationships(container);
}

// Keyboard shortcut: J to toggle journal
document.addEventListener('keydown', (e) => {
  if (e.key === 'j' || e.key === 'J') {
    // Don't toggle if dialogue is active or other UI is open
    const dialogueOverlay = document.getElementById('dialogue-overlay');
    if (dialogueOverlay && !dialogueOverlay.classList.contains('hidden')) {
      return;
    }
    toggleJournal();
  }
});
