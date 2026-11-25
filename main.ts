// The GPS Swears It Was a Shortcut — make.fun entry.
//
// The program writes the GPS's one-line excuse to /output/entry.txt.
// The gate requires UTF-8 text of 1 to 200 characters, not only
// whitespace, so the line is validated before it is written and read
// back afterwards to prove the file holds exactly the validated line.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The GPS speaks for itself: smug, defensive, and blaming the map
// rather than owning the detour. One line, one breath, no setup,
// no dialogue tags.
const LINE =
  "I didn't get you lost, the map sent us through a wedding because the bride asked for a grand entrance, and frankly you were the closest thing to a parade.";

const MAX_CHARS = 200;
const MIN_WORDS = 5;
const MAX_WORDS = 60;

function validate(line: string): string[] {
  const problems: string[] = [];
  if (line.length < 1 || line.length > MAX_CHARS) {
    problems.push(`length ${line.length} is outside 1-${MAX_CHARS} characters`);
  }
  if (line.trim().length === 0) {
    problems.push("line is only whitespace");
  }
  if (line !== line.trim()) {
    problems.push("line has leading or trailing whitespace");
  }
  if (line.includes("\n") || line.includes("\r")) {
    problems.push("line must be a single line");
  }
  if (/^["']|["']$/.test(line)) {
    problems.push("line must carry no dialogue tags or surrounding quotes");
  }
  const words = line.split(/\s+/).filter(Boolean);
  if (words.length < MIN_WORDS || words.length > MAX_WORDS) {
    problems.push(`word count ${words.length} is outside ${MIN_WORDS}-${MAX_WORDS}`);
  }
  // One breath: a single sentence, so it reads cleanly aloud.
  const stops = (line.match(/[.!?]/g) ?? []).length;
  if (stops !== 1 || !/[.!?]$/.test(line)) {
    problems.push("line must be exactly one sentence");
  }
  return problems;
}

const problems = validate(LINE);
if (problems.length > 0) {
  for (const problem of problems) console.error(`invalid line: ${problem}`);
  process.exit(1);
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "entry.txt");
writeFileSync(outPath, LINE, "utf8");

// Read-back check: the file must hold exactly the validated line.
const written = readFileSync(outPath, "utf8");
if (written !== LINE) {
  console.error("read-back mismatch: entry.txt does not hold the validated line");
  process.exit(1);
}

const words = LINE.split(/\s+/).filter(Boolean).length;
console.log(`Wrote ${outPath} (${LINE.length} chars, ${words} words)`);
console.log(LINE);
