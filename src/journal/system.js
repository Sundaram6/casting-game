// src/journal/system.js
// Journal entry management system

import { getEntryForTrigger } from './entries.js';

let entries = [];

export function addJournalEntry(entry) {
  if (!entries.find(e => e.trigger === entry.trigger)) {
    entries.push({ ...entry, timestamp: Date.now() });
  }
}

export function addJournalByTrigger(triggerId) {
  const entry = getEntryForTrigger(triggerId);
  if (entry) {
    addJournalEntry(entry);
  }
}

export function getJournalEntries() {
  return [...entries].sort((a, b) => b.timestamp - a.timestamp);
}

export function getEntriesByCharacter(character) {
  return entries.filter(e => e.character === character);
}

export function hasEntry(triggerId) {
  return entries.some(e => e.trigger === triggerId);
}

export function clearJournal() {
  entries = [];
}
