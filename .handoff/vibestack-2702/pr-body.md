Work toward #2702 on the `vibestack` branch. This branch collects every piece of the issue's remaining work as it lands.

## Status of #2702

- [x] (1) Value history and leases: folded into specs in 4e0075fe4.
- [x] (2) Assessment Inbox: folded in 4e0075fe4.
- [ ] (3) EVM monthly-reserve draft. The audit plan retires `formal/drafts/monthly-reserve.md`, because `evmEscrow` already states and proves every contract rule in it and the draft contradicts the current `ProjectEscrow.sol`. The remaining obligations move to the specs that own them:
  - evmEscrow and ledger, handled by the spec session;
  - escrow;
  - monthlyExecution, plus a new executorJournal;
  - monthlyCommitment;
  - reserveRelease;
  - monthlySettlement.
- [x] (4) Legacy transitions and scenarios reconciled: 7c8bd9e9b, already on `vibestack`.
- [ ] (5) Unmodified `pnpm check` on the integrated head. A run on 6364cda9a failed:
  - Passed: the model stage for 242 specs, replay for 225, and 225 `always` checks, plus 1280 `sometimes` goals and guard probes.
  - Real model failures: `projectComposition` breaks a `leadsTo` rule, and `privateAward` has a dead guard, `canReviewRelated`.
  - Four runs hit the 60-minute cap: `solanaEscrow`, `conversion`, `monthly` and `monthlySettlement`.
  - Review stage: 252 items wait on the owner's `pnpm accept`.
  
  Since then, checkpoints 820d30d18 and 7816c2ee9 left the tip unable to run `pnpm gen`. The first commit here repairs that and is still in progress.
- [ ] (6) Owner review and `pnpm accept`: owner-gated.
- [ ] (7) Implementation acceptance: a later phase.

## In this PR so far

- An in-progress tip repair covering `projects.md`, `accounts.md`, three points specs and `spendAlerts`. Its goal is that `pnpm gen`, the formal catalog and check, typecheck and the points build all pass.

Draft until the tip repair, the five spec fixes, the reserve integration and a full `pnpm check` on the final head are all in.
