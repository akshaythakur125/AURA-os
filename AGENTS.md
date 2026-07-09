<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Writing prompts for opencode

The owner runs a separate local tool called opencode for some design/build work on this
project. Whenever asked to draft a prompt/command for opencode, always write it as a full
creative + engineering brief in this register — never a short task list or a "noob" prompt:

- **Role framing**: address it as the design lead / senior engineer on this, not a
  task-runner.
- **Audience empathy**: ground the ask in who actually uses AuraCheck and what they need to
  feel, not just visual adjectives.
- **Reference language with reasoning**: name real products/brands as references, but explain
  *why* each one is relevant (the underlying principle to extract), never just a name-drop
  list.
- **Principles, not checklists**: organize asks as a small number of design/engineering
  principles with rationale, not a flat list of "add X, add Y."
- **A concrete bar for "done"**: give a real gut-check the requester can hold the output to.
- **Non-negotiable process rules at the end, every time**:
  - This is a refinement of the existing app — never delete, restructure, or scaffold over
    existing files, routes, or directories. No logic changes unless explicitly asked.
  - Work in chunks; build, sanity-check, and commit each chunk separately. No mega-commits.
  - Before every push: run `git remote -v` and confirm it points to
    `akshaythakur125/aura-os`. Stop and flag it if it shows anything else, or "no remote
    configured" — do not improvise a fix.
  - After every push: paste the raw, verbatim output of `git log --oneline -5` and
    `git push` — never a prose summary. opencode has twice reported "pushed successfully"
    when nothing had actually reached GitHub, so summaries are not trusted on this project;
    only the real terminal output is.
  - Production build (`npm run build`) must pass clean before every commit.

This standard applies to every future opencode prompt drafted in this project — design
work, features, bug fixes, anything — regardless of what the specific ask is.
