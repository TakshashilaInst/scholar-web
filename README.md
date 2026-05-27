<p>
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License"/>
  <img src="https://img.shields.io/badge/Status-Public_Preview-orange?style=flat-square" alt="Status"/>
  <img src="https://img.shields.io/badge/Backend-Anthropic_%7C_OpenRouter-blueviolet?style=flat-square" alt="Backend"/>
</p>

# Takshashila Scholar — Web

> Takshashila in a box. The research methods, frameworks, and analytical flows that Takshashila researchers use — available to anyone with an API key, anywhere, in a browser.

**→ Live site: [takshashilainst.github.io/scholar-web](https://takshashilainst.github.io/scholar-web/)**

---

## Start here

Three entry points, depending on where you are:

**1. You have a policy issue and want to think it through systematically**
→ Pick **Path B** on the homepage. Runs Bardach's 8-step analysis, then walks you through stakeholder mapping, causal analysis, and drafting.

**2. You have a draft and want it reviewed before it goes anywhere**
→ Pick **Path C**. Runs pre-submission review (RBF, voice, structure), the values check against Takshashila's five commitments, and an adversarial argument critique.

**3. You are a student who has never done policy analysis**
→ Click "New here?" on the homepage. It asks you to pick a news issue and walk through one exercise. No prior knowledge needed.

---

## What this is

Every Indian state needs many Takshashilas. In the pre-AI age, building that meant building institutions — which takes years. AI makes a version of it possible right now.

Takshashila Scholar is the methodology made open. Thirteen tools covering the full research lifecycle, organised into three guided paths with context carrying forward from one stage to the next.

```
Frame & analyse
  01  Hypothesis Development   — turn intuition into a testable claim; Research Brief
  02  Find a Framework         — match your problem to the right analytical lens
  03  Policy Analysis          — Bardach's 8-step, India-specific lenses

Map & trace
  04  Stakeholder Analysis     — Interest × Power matrix, veto players, coalitions
  05  Causal Loop Analysis     — named feedback loops, cross-connections, leverage points

Draft
  06  Op-ed Draft              — 600–900 words, Takshashila voice, RBF structure
  07  Policy Brief Draft       — recommendation leads; evidence both sides
  08  Discussion Document      — 2000–6000 words; maps a problem, opens debate

Review & finalise
  09  Draft Review             — RBF, structure, voice, 21st-century realities
  10  Values Review            — five commitments; tensions surfaced as questions
  11  21st-Century Realities   — climate, energy transition, information age, complexity
  12  Argument Critique        — adversarial; Baloney Detection + Sagan's method
  13  Citation Formatter       — Takshashila house style; use at the very end
```

A router on the homepage groups these into three starting paths and walks the researcher through the right sequence. Tools can also be used individually.

---

## How it works

- **Zero backend.** Static HTML, CSS, JS hosted on GitHub Pages. No server, no accounts, no tracking.
- **Bring your own API key.** Stored only in your browser's `localStorage`. Sent only to the provider you choose.
- **No data stored.** Conversations live only in the browser tab. Refresh and they are gone.

### Two providers, your choice

| Provider | Best for | Cost |
|---|---|---|
| **Anthropic** (default) | Lowest latency; direct browser-to-Anthropic calls | Anthropic API rates — [console.anthropic.com](https://console.anthropic.com) |
| **OpenRouter** | Many models (DeepSeek, Gemini, GPT, Llama, Qwen, Claude) through one key; much cheaper for students | OpenRouter rates — [openrouter.ai/keys](https://openrouter.ai/keys) |

---

## Want more? The CLI plugin

This browser app is a simplified subset. The full Takshashila Scholar toolkit runs as a [Claude Code](https://github.com/anthropics/claude-code) plugin in your terminal and includes:

- Parliament search across all 24 standing committees
- Zotero and Obsidian integration
- Voice calibration for op-ed drafts (reads your previous writing)
- Grant proposal scaffolding
- Full skill files with examples and Indian institutional knowledge

**→ [github.com/pranaykotas/takshashila-scholar](https://github.com/pranaykotas/takshashila-scholar)**

The web app is for researchers and students who do not work in a terminal. The CLI plugin is for those who want the full depth.

---

## Methodology

The workflows distil these Takshashila analytical practices:

- **Reverse Bollywood Format (RBF)** — lead with the conclusion
- **Bardach's Eightfold Path** — with India-specific state capacity and federalism lenses
- **Sagan's Method** — multiple hypotheses, quantify, Occam's Razor, falsifiability
- **Baloney Detection** — source reliability, independent verification, alignment with known facts
- **Causal Loop Analysis** — feedback loops and Donella Meadows' leverage points
- **Interest × Power Stakeholder Matrix** — veto players and coalition mapping
- **21st Century Realities** — climate, energy transition, information age, complexity

Read the longer explanation in the [About page](https://takshashilainst.github.io/scholar-web/about.html).

---

## Local development

Static site, no build step.

```bash
git clone https://github.com/TakshashilaInst/scholar-web.git
cd scholar-web
python3 -m http.server 8000
# Visit http://localhost:8000
```

---

## Limitations

- Condensed system prompts. Full skill files with examples and institutional knowledge are in the [CLI plugin](https://github.com/pranaykotas/takshashila-scholar).
- No web search, no file uploads, no Obsidian or Zotero integration. Use the CLI for those.
- The app reminds you to consult [Standing Committee reports](https://parliamentcommittee.streamlit.app/) at the evidence stage and asks you to paste findings back in.
- AI output should be verified — especially citations, statistics, and claims about specific institutions.

---

## Contributing

PRs welcome. Especially:
- Improved system prompts that better capture Takshashila methodology
- New workflows
- Accessibility improvements
- Better markdown rendering

---

## License

MIT. Use it, fork it, adapt it. Attribution to the Takshashila Institution appreciated but not required.

---

Built by the [Takshashila Institution](https://takshashila.org.in). Questions or feedback? Open an issue or write to [info@takshashila.org.in](mailto:info@takshashila.org.in).
