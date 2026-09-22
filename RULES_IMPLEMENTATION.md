# Card rules — local implementation

Updated 2026-09-21. Scope: audit items 1–3. Explicit handlers cover the 123 known cards; this is not exhaustive certification of every interaction.

## Implemented

- Advantage: previous-turn Counter winner, or opponent when the active player skips Counter. Neither player after a tie; inactive on turn one. Persists through current Judgement. Cosmos Rave cost reduction occurs before payment; Encore speed and DAKA retrieval are gated by Advantage. Echo post-damage triggers require both Advantage and positive damage. Stellarealm blocks the opponent only on the specified loss.
- Shorekeeper: own Counter-start draw before card selection; Switch draw/discard; selectable Intro retrieval; heal draw at most twice per turn, optional and not consumed on skip; End loop grants next two Intro Combo draws; legal skill Level up; dynamic HP-based damage.
- Camellya: selectable Basic Attack retrieval; correct red loss condition; level-two source returns to Character Deck only when levelled over; incoming/outgoing damage passives; legal selectable skill Level up; Intro result requires the correct switch.
- Encore: ability-only level-two placement, passive red buff, delayed return by placement turn; first Normal Attack buff; positive-damage retrieval; inherited losing Heavy/Forte damage at Counter end; Intro retrieval; lock further Combo; actual-damage draw.
- Chixia: Counter damage, Counter-end damage threshold, optional Normal Attack retrieval, Leader Skill +3 passive, Intro damage and blue-loss return.
- Sanhua: optional blue Counter charge, trash-to-Concerto choice, optional switch and +3 Follow-up counter, skill Level up, Concerto-conditioned switch, end-turn charge, next-turn opponent Combo prohibition.
- Echo: max one in own Action Area; five Concerto set bonuses require this source plus at least two distinct card codes of that set; first matching-element use per turn only. Appropriate player chooses discard/resource/trash targets; random effect remains random.
- UI: Advantage indicator, dynamic damage bonuses, Counter-start phase, mandatory player effects drain during bot turns, skill buttons outside overlapping character images. Character Deck picker excludes illegal normal level-up targets.

## Item 3 — explicit conditions, costs and targets

- Removed genericCharacterEvent and genericActionEffect. Registered known card codes replace unconditional isSupported=true; unknown codes are rejected. Display translations no longer govern Leader Skill legality or Chixia passive damage.
- Rover (M): explicit green Counter/green win/red loss, each-turn Leader draw, Dodge draw-then-discard, Intro switch-then-draw, Sensor reveal, Grapple draw/follow-up and Mid-air win draw. Optional skills now use the normal skill queue and aura path.
- Rover (F)/(M) BP01-017/020: mandatory top-card reveal followed by the player choosing to take it or leave it on top; both Enter and Level-up source triggers work. Yangyang Enter/Level-up charge remains optional.
- Discard costs cannot resolve with fewer cards and still award the bonus or switch. Yangyang return-to-hand rechecks cost, Leader and Action presence; cards leaving Action lose transient modifiers. Skill Level-up rejects a stale or wrong-character reserve target without removing another card.
- Airborn checks cards played during this turn, including cards already returned from Action. Incarnation search reveals the chosen physical copy. Jinshi top-five resolution avoids recycling freshly revealed non-Jinshi cards into the same reveal.

### Item 3 validation

- 103 Node tests passed, zero failed/skipped/todo; 24 additional focused tests. Includes 90 seeded full matches across all character families plus 20 original matches, checking card identity/conservation, legal choices and termination.
- Browser smoke: Rover (M)/Rover (F)/Yangyang against default bot reached turn 5, performed 2 level-ups and 5 choices, no page errors and no switch to bot hand. The runner retries transient DOM detachment during automatic phase transitions. This is not exhaustive UI coverage.
- Syntax checks: engine.js, card-rules.js, app.js. git diff --check passed. Local changes only; no push/deploy.
- Existing red-only Combo restriction remains unchanged pending item 4. Engine-wide mandatory-skip enforcement remains item 5.

## Earlier items 1–2 evidence and validation

- 79 Node tests passed, zero failed/skipped/todo. Includes prior tests, card-specific positive/negative cases, 45 new seeded full matches and 20 prior seeded matches. New matches check identity/card conservation, nonempty character stacks, Echo limit, valid choices and termination.
- Browser test with a real Shorekeeper/Camellya/Encore deck against default bot reached turn 5, performed 2 level-ups and 10 target/payment choices; no page errors and no switch to bot hand. This is a smoke test, not exhaustive UI coverage.
- All edited JS syntax checks and git diff --check passed. No push/deploy.
- Tests: node --test tests/*.test.mjs. Tests for old direct effects now resolve queued triggers before checking outcomes; assertions still check real outcomes.

## Sources and decisions

- Local cards_master.json, per-card ability IDs, rule PDF Ver1.0.1 (especially 913.13 and 905/913.8).
- Inspected actual local card images BP01-002, BP01-034 and BP01-063: first damage only; distinct Echo set types; Encore Intro retrieval from trash. Thai database wording omits these details. No translation data was overwritten.
- Retained existing heal cap of 20; confirming general HP-cap policy remains outside this change.

## Remaining scope

- Red-only Combo policy is unchanged as requested previously. Follow-up values from Sanhua/Shorekeeper are recorded correctly but cannot unlock non-red wins until audit item 4 is addressed.
- Item 3 removes generic text parsing from engine rules. Mandatory skip enforcement, broader bot scheduling and the full animation event queue remain item 5. No claim that all game rules are complete.
- Existing saved deck naming change and pre-existing deleted playmat were preserved.

## Initial item 1–2 explicit handlers

This table indicates code-path coverage (including passives and cards without printed abilities), not exhaustive testing of every interaction.

| Code | Name | Kind |
|---|---|---|
| BP01-001 | Camellya | Character |
| BP01-002 | Camellya | Character |
| BP01-003 | Camellya | Character |
| BP01-004 | Camellya | Character |
| BP01-005 | Camellya | Character |
| BP01-006 | Shorekeeper | Character |
| BP01-007 | Shorekeeper | Character |
| BP01-008 | Shorekeeper | Character |
| BP01-009 | Shorekeeper | Character |
| BP01-010 | Shorekeeper | Character |
| BP01-011 | Encore | Character |
| BP01-012 | Encore | Character |
| BP01-013 | Encore | Character |
| BP01-014 | Encore | Character |
| BP01-015 | Encore | Character |
| BP01-025 | Chixia | Character |
| BP01-026 | Chixia | Character |
| BP01-027 | Chixia | Character |
| BP01-031 | Sanhua | Character |
| BP01-032 | Sanhua | Character |
| BP01-033 | Sanhua | Character |
| BP01-034 | Traffic Illuminator | Action |
| BP01-035 | Inferno Rider | Action |
| BP01-036 | Gulpuff | Action |
| BP01-037 | Lampylumen Myriad | Action |
| BP01-038 | Chirpuff | Action |
| BP01-039 | Feilian Beringal | Action |
| BP01-040 | Roseshroom | Action |
| BP01-041 | Crownless | Action |
| BP01-042 | Cruisewing | Action |
| BP01-043 | Mourning Aix | Action |
| BP01-044 | Burgeoning • Basic Attack | Action |
| BP01-045 | Burgeoning • Dodge Counter | Action |
| BP01-046 | Everblooming | Action |
| BP01-047 | Burgeoning • Heavy Attack | Action |
| BP01-048 | Crimson Blossom | Action |
| BP01-049 | Fervor Efflorescent | Action |
| BP01-050 | Crimson Pistil | Action |
| BP01-051 | Vining Ronde | Action |
| BP01-052 | Origin Calculus • Basic Attack | Action |
| BP01-053 | Origin Calculus • Dodge | Action |
| BP01-054 | Enlightenment | Action |
| BP01-055 | Origin Calculus • Heavy Attack | Action |
| BP01-056 | Chaos Theory | Action |
| BP01-057 | End loop | Action |
| BP01-058 | Supernal Stellarealm | Action |
| BP01-059 | Wooly Attack • Basic Attack | Action |
| BP01-060 | Wooly Attack • Heavy Attack | Action |
| BP01-061 | Black & White Woolies | Action |
| BP01-062 | Cosmos Rave | Action |
| BP01-063 | Woolies Helpers | Action |
| BP01-064 | Wooly Attack • Dodge Counter | Action |
| BP01-072 | DAKA DAKA! | Action |
| BP01-076 | Freezing Thorns | Action |
| BP01-077 | Ice Burst | Action |
| SD01-005 | Chixia | Character |
| SD01-006 | Chixia | Character |
| SD01-007 | POW POW • Basic Attack | Action |
| SD01-008 | POW POW • Dodge Counter | Action |
| SD01-009 | Leaping Flames | Action |
| SD01-010 | Whizzing Fight Spirit | Action |
| SD01-011 | Blazing Flames | Action |
| SD02-003 | Sanhua | Character |
| SD02-004 | Sanhua | Character |
| SD02-012 | Frigid Light • Basic Attack | Action |
| SD02-013 | Frigid Light • Dodge | Action |
| SD02-014 | Silversnow | Action |
| SD02-015 | Eternal Frost | Action |
| SD02-016 | Glacial Gaze | Action |
