export const meta = {
  name: 'vibestack-tip-repair',
  description: 'Repair origin/vibestack so gen, catalog, formal check, typecheck and the points build pass, then review and fix',
  phases: [
    { title: 'Repair', detail: 'one agent repairs the tip on fix/tip-repair' },
    { title: 'Review', detail: 'fidelity and evidence reviewers' },
    { title: 'Fix', detail: 'address confirmed review problems' },
  ],
}

const W = '/Users/shawwalters/.slop-vs/vs-tip'
const T = '/Users/shawwalters/.slop-vs/tools'
const CTX = `
Repository: the Slop "vibestack" branch, worktree ${W} on branch fix/tip-repair (from origin/vibestack 43f31d9e8). Use Node 26: export PATH=~/.nvm/versions/node/v26.13.0/bin:$PATH. Specs are Markdown files under spec/ with Quint blocks; \`pnpm -s gen\` (node vibestack/spec.ts gen) generates gen/ and stops at the first error. Dependencies are installed (pnpm install --ignore-scripts); the vibestack dist build (\`node vibestack/spec.ts tasks //#build\`) depends on gen and must succeed once gen does. A scoped driver runs one module's simulation or proof stage exactly as \`pnpm check\` does: \`node ${T}/scoped.ts ${W} <module> sim|prove\` (module names like backend__projects; it prints [sim ok]/[sim FAIL] and ends with "SCOPED DONE"). Scratch files go in /Users/shawwalters/.slop-vs/scratch-<label>/, never inside the worktree. Stop only processes you started, by exact PID.

The tip is broken by work-in-progress checkpoints (820d30d18 "Checkpoint the units and spec rules interrupted by the usage limit", later 7816c2ee9 "Review the spec rules derived from development and checkpoint unit work"). A previous repair attempt (lost to a disk wipe) found these problems, in order of discovery; re-verify each on this head, since 7816c2ee9 may already have fixed some (accounts.md already uses N::anySuppressed):
1. spec/backend/projects.md: \`pure val exceptionSamples\` is a non-sample pure val holding a set of records, which vibestack/gen/types.ts refuses ("sets of records or lists are not supported; use a list"). Fix: inline it as a local val inside exceptionValues (\`pure val exceptionValues = { val exceptionSamples = Set(...) exceptionSamples.union(...)... }\`).
2. spec/backend/projects.md: "repositoryValues (spec/backend/projects.md:~652) holds int, but the parameter repository of appendable is NewRepository: rename the parameter or the set, as each <param>Values is used for every parameter of that name". Fix found: rename appendable's parameter (e.g. to candidate) and its uses.
3. spec/backend/projectComposition.md: requestValues used fields kind and branch that GrantRequest (spec/security/enforcement.md) no longer has; Set(E::goodGrant) fits.
4. spec/fees/diagnostics.md lines ~56-59: QNT000 "no viable alternative at input ,run": \`run\` is a Quint keyword used as a parameter name; rename it.
5. spec/backend/accounts.md sometimesClosureCancelledMail: if it reads \`N::anySuppressed(s.inbox) and s.members.some(m => m.membership == Closed)\`, it is weaker than intended because Suppressed also arises from opt-out; make the suppressed notice's recipient the closed member (keep the goal's name).
6. formal/spec-catalog.json is stale: regenerate with \`node formal/catalog.ts\`; then \`node formal/catalog.ts --check && node formal/check.ts\` must pass. The check also reported model-map successor conflicts, missing catalog entries (fees/diagnostics, operations/robinhoodRpcRotation, points/reviewedHistory) and legacy-reconciliation names that no longer exist (e.g. canRecordFunding/recordFunding in projects.md): fix formal/legacy-reconciliation.json and formal/*.json faithfully (a renamed definition: point to the new name; a removed one: a gap or abstraction entry with an honest note), never by deleting coverage.
7. \`pnpm --filter @repo/points build\` failed with TS2322 in apps/points/src/programs/main.vibe:42-46 (Command<unknown, unknown> not assignable to Command<unknown, Crypto | Git | HttpClient | NodeServices>) and earlier in apps/backend/src/projects/live.vibe:105-107 (project row type lacks stewardAccount and listing fields required by the read type). Fix the implementation with real values from the D1 row / registry, never stubbed defaults that change behavior.
Rules: never weaken, delete or rename an always rule, step rule, law, leadsTo, story or sometimes goal; follow the intent of the checkpoint diffs (git show <sha> -- <file>); add a "Discovered by simulation:" sentence for any sample-set change. Money is integer base units.`

const RESULT = {
  type: 'object',
  properties: {
    commit: { type: 'string' },
    changes: { type: 'array', items: { type: 'string' } },
    checks: { type: 'array', items: { type: 'object', properties: { command: { type: 'string' }, result: { type: 'string' } }, required: ['command', 'result'] } },
    ok: { type: 'boolean' },
    openIssues: { type: 'string' },
  },
  required: ['commit', 'changes', 'checks', 'ok', 'openIssues'],
}
const REVIEW = { type: 'object', properties: { sound: { type: 'boolean' }, problems: { type: 'array', items: { type: 'string' } } }, required: ['sound', 'problems'] }
const TASK = `Loop \`pnpm -s gen\` until it succeeds, repairing each error faithfully. Then make all of these pass, and report each literally: \`node vibestack/spec.ts tasks //#build\`; \`node formal/catalog.ts\` then \`node formal/catalog.ts --check && node formal/check.ts\`; \`pnpm exec vibelang --noEmit -p .\`; \`pnpm --filter @repo/points build\`; \`pnpm --filter @repo/backend build\` if that package exists; \`pnpm lint\` limited to touched files if a full run is impractical. For each spec you changed, run \`node ${T}/scoped.ts ${W} <module> sim\` and, if it has a .proof.dfy, \`... prove\`; report outcomes (a failure that predates your change on this head is reported, not hidden). Do not run the full \`pnpm check\`. Commit on fix/tip-repair with plain descriptive messages (no attribution lines) and push it as a backup branch: \`git -C ${W} push -f origin fix/tip-repair\` (never push to vibestack). Report the final commit sha.`

phase('Repair')
let res = await agent(`${CTX}\n\n${TASK}`, { label: 'tip-repair', phase: 'Repair', schema: RESULT })
let review
for (let round = 1; round <= 2; round++) {
  phase('Review')
  const reviews = (await parallel([
    ['fidelity', 'Does any change weaken, delete or rename a rule, law, story, goal or formal coverage entry, misstate a renamed definition, or change product behavior in apps/ or packages/ beyond supplying real values the types require? Compare with the checkpoint diffs.'],
    ['evidence', 'Re-run (do not trust) pnpm -s gen, node vibestack/spec.ts tasks //#build, node formal/catalog.ts --check && node formal/check.ts, pnpm exec vibelang --noEmit -p ., pnpm --filter @repo/points build, and the scoped sims of the changed specs. Report literal outcomes and anything claimed but not shown.'],
  ].map(([k, lens]) => () => agent(`${CTX}\n\nThe repairer reported:\n${JSON.stringify(res, null, 1)}\n\nReview branch fix/tip-repair in ${W} against origin/vibestack (git -C ${W} diff origin/vibestack...fix/tip-repair) through this lens: ${lens}\nDo not edit or commit. Default to unsound if uncertain; list concrete problems with file:line.`, { label: `review:${k}:r${round}`, phase: 'Review', schema: REVIEW })))).filter(Boolean)
  review = reviews
  const problems = reviews.flatMap((r) => r.problems)
  if (reviews.length === 2 && reviews.every((r) => r.sound || r.problems.length === 0)) return { res, review, rounds: round }
  phase('Fix')
  res = await agent(`${CTX}\n\nYour previous report:\n${JSON.stringify(res, null, 1)}\n\nReviewers found these problems. Fix each real one (explain rejections with evidence), re-run the checks, commit and push fix/tip-repair again:\n${problems.map((p, i) => `${i + 1}. ${p}`).join('\n')}`, { label: `fix:r${round}`, phase: 'Fix', schema: RESULT })
}
return { res, review, rounds: 2, note: 'last fix not re-reviewed' }
