# Task 12: Build Convergence/Audition System

## Status
DONE

## Commits
- `61a25f9` feat: add convergence/audition system with three perspectives

## Test Summary
Syntax validation with `node -c` passed for both `src/convergence/system.js` and `src/convergence/audition.js`.

## Concerns
None.

## Implementation Details
- Created `src/convergence/system.js` with convergence state machine (`inactive → sundaram_audition → arjun_audition → rekha_decision → ending → complete`), `initConvergence()`, `advanceConvergence()`, `getConvergenceState()`, `isComplete()`, and `playAuditionPerspective(character)`.
- Created `src/convergence/audition.js` with `AUDITION_DIALOGUE` containing nodes for each character's audition perspective, including:
  - Sundaram's trilingual monologue (Hindi + English + Bhojpuri)
  - Arjun's nervous audition relying on father's name
  - Rekha's decision (Arjun confirmed, Sundaram rejected)
  - Quiet devastating ending (Rekha stares at Sundaram's tape, closes laptop)
- Dialogue nodes use the existing dialogue engine format (speaker, text, options) with `effects: ['advance']` on final options to trigger state advancement.
- The convergence system is a narrative sequence; player watches with no decisions required (only "Continue" options).

## Files Created
1. `src/convergence/system.js`
2. `src/convergence/audition.js`