#!/usr/bin/env node
// Fact-check gate for the myth-facts template.
//   node scripts/check-facts.mjs <project-folder>
// Fails (exit 1) unless facts.md exists and every row of its claims table has the status `verified` and a source.
// It cannot judge whether a claim is true; it makes sure someone wrote down where each one was checked.
import fs from 'node:fs';
import path from 'node:path';

const project = path.resolve(process.argv[2] || '.');
const file = path.join(project, 'facts.md');
if (!fs.existsSync(file)) { console.error(`no facts.md in ${project}. Write one before you make the voice.`); process.exit(1); }

const rows = fs.readFileSync(file, 'utf8').split('\n')
  .filter((l) => /^\|\s*\d+\s*\|/.test(l))
  .map((l) => l.split('|').slice(1, -1).map((c) => c.trim()));

if (!rows.length) { console.error('facts.md has no claim rows (| 1 | claim | status | source | notes |).'); process.exit(1); }

let bad = 0;
for (const [n, claim, status, source] of rows) {
  const problems = [];
  if (String(status).toLowerCase() !== 'verified') problems.push(`status is "${status}", not verified`);
  if (!source || source.length < 12) problems.push('no source named');
  if (problems.length) { bad++; console.error(`row ${n}: ${claim}\n  ${problems.join('; ')}`); }
}

// A script with far more sentences than claim rows probably has unchecked claims.
const script = path.join(project, 'script.md');
if (fs.existsSync(script)) {
  const sentences = fs.readFileSync(script, 'utf8').split('\n')
    .filter((l) => l.trim() && !l.startsWith('#') && !l.startsWith('>')).join(' ')
    .split(/[.?!]\s/).filter((x) => x.trim().length > 12).length;
  if (rows.length < Math.floor(sentences / 2)) console.warn(`warning: ${rows.length} claims for about ${sentences} sentences. Did you check every name, number and cause?`);
}

if (bad) { console.error(`\n${bad} of ${rows.length} claims are not verified. Fix facts.md or the script.`); process.exit(1); }
console.log(`facts ok: ${rows.length} claims verified.`);
