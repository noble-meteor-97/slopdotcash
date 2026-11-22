# Issue #2702 handoff (22 November 2026)

vibestack is at b1dc7fe2a: origin/vibestack de9510ff9 merged with
claude/vibestack-2702 and all eleven track branches (app, projcomp, privaward,
solescrow, conversion, monthly, ms, escrow, exec, commit, release).
claude/vibestack-2702 equals it. The track/<key> branches keep each track's own history.

Checked on b1dc7fe2a (Node 26.13.0):
- `pnpm -s gen`: passes.
- `node vibestack/spec.ts tasks //#build`: passes.
- `node formal/catalog.ts --check && node formal/check.ts`: passes (255 specs, 66 PRD subsections, 473 models, 2065 open legacy gaps).
- `pnpm exec vibelang --noEmit -p .` at the root: passes.
- Per-package vibelang still fails; counts are (de9510ff9 → b1dc7fe2a):

  | package | errors |
  |---|---|
  | apps/settlement | 99 → 18 |
  | packages/frontend | 101 → 23 |
  | apps/backend | 80 → 11 |
  | apps/security | 73 → 7 |
  | apps/fees | 48 → 14 |
  | apps/points | 90 → 8 |
  | apps/slopbot | 71 → 8 |
  | apps/contributor | 16 → 2 |

  The remaining errors include backend access/store.vibe events, projects/admin/routes.vibe, owner/setup.vibe, fees buybackPool/codec.vibe and slopbot closeAttempt/close.vibe.
- Not run: the scoped sims and proofs after the merge, and the full `pnpm check`.

Unfinished:
- The workflow was stopped mid-review. These reviews or repairs did not finish: privaward (its spec/settlement/privateAward.proof.dfy is an unverified checkpoint), escrow, monthly, ms, exec and commit.
- formal/drafts/monthly-reserve.md is not retired yet. The decision is to retire it and its index entry.
- Fix the per-package type errors.
- Run the full `pnpm check` and record the commit, commands and outcomes on #2702.
- Items 6 (owner review and `pnpm accept`) and 7 (implementation acceptance) stay with the owner.
- PR #3042 is closed because its branch equals vibestack.

Merge resolutions to recheck:
- monthlySettlement.md keeps the computed `otherOpenPledges(s)` and gains the ms track's headFresh step rules and wider samples.
- projectComposition.md keeps withExceptionAppends.
- conversion.md keeps the foreign-wallet sample and adds the tx 14 sample.
- Where the app track and vibestack fixed the same lines, vibestack's version won.

Tools in this folder:
- scoped.ts (`node scoped.ts <root> <module> sim|prove`).
- The workflow scripts (wf-tracks.js, wf-tip.js).
- clone-nm.sh.
- recovered/ (saved workflow plans).

Paths inside them point at ~/.slop-vs and need editing on a new machine.
