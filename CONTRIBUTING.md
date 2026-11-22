# Contributing

Thanks for helping make OutSystems interfaces more consistent and accessible. Contributions are welcome:
- corrections;
- new lessons learned;
- rules;
- pattern notes;
- script improvements;
- adapters for more agents.

## Ground rules
- **Agent-independent.** Everything must work for any agent that can read Markdown. Scripts use **Node.js 18+ with no dependencies**; don't add npm packages to the scripts.
- **Verified facts only.** Token values, variable names, class names, client actions and breakpoints must come from a primary source:
  - the OutSystems UI bundle;
  - the `OutSystems/outsystems-ui` repository;
  - the OutSystems documentation;
  - a reproducible test.

  Cite it in the PR. Mark anything unverified as such in the text.
- **Both versions.** Say whether a rule applies to OutSystems UI Classic (2.x), 3.0, or both. Never give a Classic variable as advice for 3.0, or the reverse.
- **No private data.** Don't include client names, internal project names, URLs, screenshots of real apps, or credentials. Generalize lessons ("a case-management app").
- **Explain why.** Rules state the reason (performance, accessibility criterion, maintenance cost), not just the instruction.
- **Keep SKILL.md lean** (under ~300 lines; the `description` stays ≤ 1024 characters). Details go in `references/`.

## How to add…
### a lesson learned
Add it to `references/lessons-learned.md` as **problem → cause → rule**, with the next free `LES-xx` ID. If it should be enforced, also add a rule to `references/review-checklist.md`, and a linter check if it's detectable in CSS.

### a review rule
Add a row to the right family table in `references/review-checklist.md` (`TOK`, `THM`, `LAY`, `RSP`, `A11Y`, `CMP`, `FRM`, `LST`, `FDB`, `TXT`, `PRF`, `GOV`) with: the next free ID, the rule, a severity (Blocker / Major / Minor), and how to check it (`lint`, `contrast`, `browser`, `model`). The test suite fails if any file cites an ID that isn't defined.

### a linter check
1. Implement it in `scripts/lint-ui-css.mjs` with a `report(ID, severity, line, selector, message, fix)` call. The fix must name the token or pattern to use.
2. Add a failing example to `scripts/examples/` (or extend one), and make sure the "good" examples stay at 0 findings.
3. Add assertions in `tests/lint.test.mjs`.
4. Document the rule ID in the script header and in the checklist.

### or update token values (new OutSystems UI release)
1. Read the new values from the published packages (`npm view outsystems-ui version`; files on `https://cdn.jsdelivr.net/npm/outsystems-ui@<v>/dist/`).
2. Update `scripts/tokens-osui3.json` (or `tokens.json` for Classic) and the tables in `references/osui-versions-and-migration.md` / `design-tokens.md`.
3. Re-run `node scripts/contrast.mjs --osui 3 --audit`, and update the contrast facts in `references/accessibility.md` if anything changed.
4. Add a CHANGELOG entry.

## Development
```bash
npm test               # node --test: linter, contrast checker, skill structure, rule IDs, links
npm run lint:examples  # print the linter output for every example
```
There's nothing to install: `npm test` uses only Node's built-in test runner.

### Running the eval cases (optional)
`evals/` holds realistic prompts with graders in the `claude plugin eval` format. If you have Claude Code:
```bash
claude plugin eval . --allow-tools Write,Edit,Bash --scaffold
```
These are real, billed model runs.

## Pull requests
- One topic per PR, with a CHANGELOG entry under **Unreleased**.
- `npm test` passes.
- Keep `adapters/core-rules.md` and the block in `adapters/copilot-instructions.md` in sync when you change an always-on rule.
- Write in plain, direct English. Prefer tables and short rules over long prose.

## Code of conduct
Be respectful and constructive. This project follows the [Contributor Covenant 2.1](https://www.contributor-covenant.org/version/2/1/code_of_conduct/). Report unacceptable behaviour privately to the maintainers through the contact in the repository profile.
