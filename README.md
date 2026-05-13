# Takshashila Scholar — Web

Open-source policy reasoning tools built on the [Takshashila Institution's](https://takshashila.org.in) research methodology. Bring your own Anthropic API key — your conversations stay in your browser.

**Live site:** [takshashilainst.github.io/scholar-web](https://takshashilainst.github.io/scholar-web) *(once deployed)*

---

## What This Is

A simple web app that puts six core Takshashila research workflows behind a clean form-based interface:

- **Hypothesis Development** — Turn an intuition into a testable, falsifiable claim
- **Stakeholder Analysis** — Interest × Power matrix, coalitions, veto players
- **Policy Analysis (Bardach)** — Systematic 8-step framework with India-specific lenses
- **Causal Loop Analysis** — Named feedback loops, leverage points
- **Draft Review** — Pre-submission review with RBF, 21st century realities, Takshashila voice
- **Argument Critique** — Adversarial review using Baloney Detection and Sagan's method

It is "Takshashila in a box" — the same analytical methodology used internally, made available to any researcher who wants structured policy reasoning support.

---

## How It Works

- **Zero backend.** Static HTML/CSS/JS hosted on GitHub Pages.
- **Bring your own API key.** Your Anthropic API key is stored only in your browser's `localStorage`. It is never sent to any server other than Anthropic's API.
- **No data stored.** Conversations exist only in your browser tab. Refresh and they're gone.
- **No accounts.** No tracking. No analytics.

You pay Anthropic directly for API usage. Get a key at [console.anthropic.com](https://console.anthropic.com).

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

1. Push to the `main` branch
2. In repo Settings → Pages, set source to "Deploy from a branch", branch `main` / root
3. Site goes live at `https://takshashilainst.github.io/scholar-web/`

---

## Files

```
index.html        — UI structure
styles.css        — Styling
prompts.js        — System prompts for each workflow (distilled from the full Scholar plugin skills)
app.js            — UI logic and Anthropic API calls
```

---

## Why "Takshashila in a Box"?

The Takshashila Institution has spent over a decade developing a codified research methodology — a specific way of framing policy questions, mapping stakeholders, surfacing causal mechanisms, and writing for impact. This methodology lives in the heads of senior researchers and in internal training material.

**Takshashila Scholar makes that methodology available to anyone with an Anthropic API key.** It is not a chatbot that answers questions about policy. It is a structured workflow tool that walks a researcher through the institutional process: from a question through stakeholder mapping, causal analysis, drafting, and pre-submission review.

The full methodology is documented in the [Scholar Claude Code plugin](https://github.com/TakshashilaInst/scholar). This web app is a simpler, browser-based subset for non-technical users.

---

## Methodology Sources

The workflows in this app distil the following Takshashila practices:

- **Reverse Bollywood Format (RBF)** — Lead with the conclusion
- **Sagan's Method** — Multiple hypotheses, quantify, Occam's Razor, falsifiability
- **Baloney Detection (Shermer)** — Source reliability, independent verification
- **21st Century Realities Framework** — Climate, Energy Transition, Information Age, Complexity
- **Bardach's Eightfold Path** — With India-specific state capacity and federalism lenses
- **Causal Loop Analysis** — Feedback loops and Donella Meadows' leverage points
- **Interest × Power Stakeholder Matrix** — Veto players and coalition mapping

---

## Limitations

- The web app uses condensed system prompts. The full skill files (with examples, edge cases, and Indian institutional knowledge) are in the [Claude Code plugin](https://github.com/TakshashilaInst/scholar).
- No web search, no file uploads, no Obsidian integration. Use the Claude Code plugin for those.
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
