# Shuka

**One market for Armenian goods — reaching the EU and US.**

Shuka aggregates hundreds of fragmented Armenian producers into a single, trustworthy
supply source. Buyers post a requirement, producers submit offers, and Shuka consolidates
many suppliers and categories into one compliant, escrow-protected container. Demand-led,
not supply-led: producers don't chase buyers — the market finds them.

This repo is the marketing landing page. It's a single self-contained `index.html`
(no build step, no dependencies) serving three audiences — buyers, producers, investors —
with a live audience switcher and an interactive container-packing visual.

## Run locally

Just open the file:

```bash
open index.html
```

Or serve it (any static server works):

```bash
python3 -m http.server 8000   # then visit http://localhost:8000
```

## Deploy to GitHub Pages

1. Create a repo on GitHub and push this folder:

   ```bash
   git remote add origin https://github.com/<you>/shuka.git
   git branch -M main
   git push -u origin main
   ```

2. On GitHub: **Settings → Pages → Build and deployment**
   - **Source:** *Deploy from a branch*
   - **Branch:** `main` / `root`
   - Save.

3. Your site goes live at `https://<you>.github.io/shuka/` within a minute or two.

> `.nojekyll` is included so GitHub Pages serves the files as-is (no Jekyll processing).
> `404.html` redirects unknown paths back to the landing page.

### Custom domain (optional)

Add a `CNAME` file containing your domain (e.g. `shuka.am`), then point a DNS
`CNAME` record at `<you>.github.io`. Enable **Enforce HTTPS** in Pages settings.

## Structure

| File | Purpose |
|------|---------|
| `index.html` | The entire landing page — HTML, CSS, and JS inline |
| `404.html` | Redirects stray paths to the landing page |
| `.nojekyll` | Tells GitHub Pages to skip Jekyll |

## Design system

Palette grounded in the Armenian material world — pomegranate `#A32138`, apricot `#E0862A`,
Yerevan tuff-stone ground `#F6EDE6` — with full light/dark theming and a persisted theme
toggle. Editorial serif display, system sans for UI, monospace for data.
