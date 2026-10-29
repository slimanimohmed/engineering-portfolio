# Mohamed Slimani — Engineering Portfolio

Mechanical engineering portfolio with 13 case studies, 52 captioned evidence images, interactive skill exploration, searchable project filters and accessible image galleries.

## Run locally

This is a buildless static website. From the repository root, run:

```sh
python3 -m http.server 8000
```

Open http://localhost:8000. All images, scripts, styles and the CV are included in the repository.

## Publish

Enable GitHub Pages from the main branch and the repository root. The `.nojekyll` file preserves the static site as authored.

## Content

- `index.html`: homepage and interactive skills explorer
- `projects/`: all 13 case studies and searchable project index
- `evidence/`: captioned evidence index
- `about/`, `resume/`, `contact/`: profile, CV and contact actions
- `portfolio-data.js`: project, skill and evidence data
- `assets/`: selected photographs, project figures and CV

No build step, analytics or external executable dependencies are required. The contact form prepares an email draft locally and does not send messages. Reference images retain their attribution in the site.
