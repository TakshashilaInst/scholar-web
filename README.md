# Takshashila Scholar — Web

Open-source policy reasoning tools built on the [Takshashila Institution's](https://takshashila.org.in) research methodology. Bring your own API key — your conversations stay in your browser.

**Live site:** [takshashilainst.github.io/scholar-web](https://takshashilainst.github.io/scholar-web/)

---

## What This Is

Thirteen Takshashila research workflows behind a single browser interface, organised as a research lifecycle:

**Frame & analyse**
- **Hypothesis Development** — Turn an intuition into a testable, falsifiable claim. Produces a Research Brief.
- **Find a Framework** — Match a policy problem to the right analytical lens, drawn from the Takshashila framework library.
- **Policy Analysis (Bardach)** — Systematic 8-step framework with India-specific state-capacity and federalism lenses.

**Map & trace**
- **Stakeholder Analysis** — Interest × Power matrix, coalitions, veto players.
- **Causal Loop Analysis** — Named reinforcing and balancing loops, leverage points.

**Draft**
- **Op-ed** — 600–900 words in Takshashila voice, with RBF and a concrete recommendation.
- **Policy Brief** — Executive summary leads with the recommendation; evidence both sides; status-quo option included.
- **Discussion Document** — 2000–6000 words; maps a problem and opens debate.

**Review & finalise**
- **Draft Review** — Pre-submission review on Takshashila standards: RBF, 21st-century realities, voice, structure.
- **Values Review** — Read through the five commitments (Freedom, Pluralism, Citizenship, Realism, 21st-century realities). Tensions surfaced as questions, not verdicts.
- **21st-Century Realities Check** — Quick four-lens pass: climate, energy transition, information age, complexity.
- **Argument Critique** — Adversarial review using Baloney Detection and Sagan's method, with the fallacy taxonomy.
- **Citation Formatter** — Reformat references to Takshashila house style. Used at the very end.

A guided router groups these into three starting paths — *I have a hypothesis*, *I have a policy problem*, *I have a draft* — and walks the researcher through the right sequence with context carrying forward from one stage to the next. A separate on-ramp helps students who do not know where to start.

"Takshashila in a box" — the same analytical methodology used internally, made available to any researcher who wants structured policy reasoning support.

---

## How It Works

- **Zero backend.** Static HTML, CSS, and JS hosted on GitHub Pages. No server code.
- **Bring your own API key.** Stored only in your browser's `localStorage`. Sent only to the provider you choose.
- **No data stored.** Conversations live only in your browser tab. Refresh and they are gone.
- **No accounts, no tracking, no analytics.**

### Two backends, your choice

| Provider | Best for | What you pay |
|---|---|---|
| **Anthropic** (default) | Lowest latency; calls go directly from your browser to Anthropic. | Anthropic API rates — you pay Anthropic directly. Get a key at [console.anthropic.com](https://console.anthropic.com). |
| **OpenRouter** | Access to many models — DeepSeek, Kimi, Gemini, GPT, Llama, Qwen, Claude — through one key. Much cheaper options for students and researchers without US billing. | OpenRouter rates (often a small fraction of frontier-model costs). Get a key at [openrouter.ai/keys](https://openrouter.ai/keys). Note: OpenRouter is a third party that sees your requests in transit. |

Switch providers in Settings. Each provider's key and chosen model are stored separately, so toggling does not lose either.

---

## Local Development

This is a static site with no build step.

```bash
git clone https://github.com/TakshashilaInst/scholar-web.git
cd scholar-web
# Open index.html in a browser, or:
python3 -m http.server 8000
# Visit http://localhost:8000
```

---

## Deployment (GitHub Pages)

1. Push to the `main` branch.
2. In repo Settings → Pages, set source to "Deploy from a branch", branch `main` / root.
3. Site goes live at `https://takshashilainst.github.io/scholar-web/`.

---

## Files

```
index.html        — UI structure
about.html        — About page (the methodology, in plain language)
styles.css        — Styling
prompts.js        — System prompts and the lifecycle path definitions
app.js            — UI logic, provider dispatch, SSE streaming
```

---

## Why "Takshashila in a Box"?

The Takshashila Institution has spent over a decade developing a codified research methodology: a specific way of framing policy questions, mapping stakeholders, surfacing causal mechanisms, and writing for impact. Most of it lives in the heads of senior researchers and in internal training material.

**Takshashila Scholar makes that methodology available to anyone with an API key.** It walks a researcher through the institutional process step by step, from a question, through stakeholder mapping and causal analysis, to drafting and pre-submission review.

The full methodology is documented in the [Scholar Claude Code plugin](https://github.com/pranaykotas/takshashila-scholar). This web app is a simpler, browser-based subset for users who do not work in a terminal.

---

## Methodology Sources

The workflows in this app distil the following Takshashila practices:

- **Reverse Bollywood Format (RBF)** — Lead with the conclusion.
- **Sagan's Method** — Multiple hypotheses, quantify, Occam's Razor, falsifiability.
- **Baloney Detection (Shermer)** — Source reliability, independent verification.
- **21st Century Realities Framework** — Climate, energy transition, information age, complexity.
- **Bardach's Eightfold Path** — With India-specific state capacity and federalism lenses.
- **Causal Loop Analysis** — Feedback loops and Donella Meadows' leverage points.
- **Interest × Power Stakeholder Matrix** — Veto players and coalition mapping.

Read the longer explanation in the [About page](https://takshashilainst.github.io/scholar-web/about.html).

---

## Limitations

- The web app uses condensed system prompts. The full skill files, with examples and Indian institutional knowledge, are in the [Claude Code plugin](https://github.com/pranaykotas/takshashila-scholar).
- No web search, no file uploads, no Obsidian integration, no Standing Committee report search. Use the CLI plugin for those. The web app reminds you to consult [Standing Committee reports](https://parliamentcommittee.streamlit.app/) at the relevant stage and asks you to paste findings back.
- AI output should be verified — especially citations, statistics, and claims about specific institutions.

---

## License

MIT. Use it, fork it, adapt it. Attribution to the Takshashila Institution appreciated but not required.

---

## Contributing

PRs welcome. Especially:
- Improved system prompts that better capture Takshashila methodology
- New workflows
- Better markdown rendering
- Accessibility improvements

---

Built by the Takshashila Institution. Questions? Open an issue or write to [info@takshashila.org.in](mailto:info@takshashila.org.in).
