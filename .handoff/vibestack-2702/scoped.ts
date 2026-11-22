// Scoped vibestack driver: run the simulation stage or the proof stage of `pnpm check` for one spec module.
// Usage: node scoped.ts <worktree-root> <module, e.g. settlement__monthly> sim|prove [seedMode]
// It imports the worktree's own vibestack sources, so results match the full check for that module
// (proof: imported units' lemma clauses are offered as axioms only if listed by the unit; here none are offered,
// which can only make the proof harder, never easier).
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const [rootArg, moduleName, mode = "sim", profileName = "normal"] = process.argv.slice(2);
if (!rootArg || !moduleName) { console.error("usage: node scoped.ts <root> <module> sim|prove"); process.exit(2); }
const root = path.resolve(rootArg);
const vs = (f: string) => import(pathToFileURL(path.join(root, "vibestack", f)).href);
const { readSpecs } = await vs("parse.ts");
const { typecheckAll, generated, proofUnits } = await vs("units.ts");
const { readSrc } = await vs("util.ts");
const { simulation } = await vs("simulate.ts");
const { profile } = await vs("testing/profile.ts");
const { show } = await vs("pipeline.ts");

const memory = { root, fresh: false, used: new Set<string>() };
const specs = readSpecs(root);
// A module name with a slash is a verified source file (e.g. apps/points/src/kernels/scoring/lines.ts).
const srcFile = moduleName.includes("/") ? moduleName : undefined;
const target = srcFile ? specs[0] : specs.find((s: any) => s.name === moduleName);
if (!target) { console.error(`no spec module ${moduleName}`); process.exit(2); }
// Generate the target and everything it imports, in the order readSpecs gives (imports first).
const needed = new Set<string>();
const want = (n: string) => { if (needed.has(n)) return; needed.add(n); specs.find((s: any) => s.name === n)?.imports.forEach(want); };
if (srcFile) for (const m of fs.readFileSync(path.join(root, srcFile), "utf8").matchAll(/gen\/(\w+)\.ts/g)) want(m[1]); else want(moduleName);
const chosen = specs.filter((s: any) => needed.has(s.name));
const typed = typecheckAll(memory, chosen);
const models = new Map<string, any>();
for (const spec of chosen) {
  try { models.set(spec.name, generated(root, spec, await typed.get(spec.name), models)); }
  catch (e) { console.log(`[model FAIL] ${spec.file}: ${(e as Error).message}`); await Promise.allSettled(typed.values()); process.exit(1); }
}
await Promise.allSettled(typed.values());
const model = srcFile ? undefined : models.get(moduleName);
console.log(`[model ok] ${target.file}`);

if (mode === "sim") {
  const loaded = path.join(root, ".spec-cache", `scoped-${process.pid}`);
  fs.mkdirSync(loaded, { recursive: true });
  try {
    for (const f of fs.readdirSync(path.join(root, "gen")).filter((f) => f === "package.json" || f.endsWith(".ts"))) fs.copyFileSync(path.join(root, "gen", f), path.join(loaded, f));
    const domain = await import(pathToFileURL(path.join(loaded, `${moduleName}.ts`)).href);
    const { seed } = profile(profileName);
    const sim = await simulation(memory, target, specs, model, domain, seed);
    let failed = 0;
    for (const r of sim.said) { if (!r.ok) failed++; console.log(`[sim ${r.ok ? "ok" : "FAIL"}] ${show(r).replaceAll("\0", "@")}`); }
    console.log(`SCOPED DONE sim ${moduleName}: ${failed ? `${failed} failed` : "all ok"}`);
    process.exit(failed ? 1 : 0);
  } finally { fs.rmSync(loaded, { recursive: true, force: true }); }
} else if (mode === "prove") {
  const { prove, LIB_FILE, libraryFor } = await vs("prove.ts");
  const { located } = await vs("parse.ts");
  const units = proofUnits(root, [...models.values()], srcFile ? readSrc(root).filter((f: any) => f.file === srcFile) : []);
  const u = units.find((x: any) => x.unit === (srcFile ? srcFile.replaceAll("/", "-") : `${moduleName}.ts`));
  if (!u) { console.log(`SCOPED DONE prove ${moduleName}: no proof unit`); process.exit(0); }
  const p = located(root, u.proofFile);
  const text = fs.existsSync(p) ? fs.readFileSync(p, "utf8") : undefined;
  const proof = await prove(memory, u, { proof: text === undefined ? undefined : { file: u.proofFile, text }, lib: text === undefined ? undefined : libraryFor(fs.readFileSync(LIB_FILE, "utf8"), text), axioms: [] });
  console.log(`total ${proof.total}, unproved ${proof.unproved.length}, errors ${proof.errors.length}`);
  for (const x of proof.unproved) console.log(`  unproved: ${x}`);
  for (const x of proof.errors) console.log(`  error: ${String(x).slice(0, 2000)}`);
  console.log(`SCOPED DONE prove ${moduleName}: ${proof.unproved.length || proof.errors.length ? "FAIL" : "ok"}`);
  process.exit(proof.unproved.length || proof.errors.length ? 1 : 0);
}
