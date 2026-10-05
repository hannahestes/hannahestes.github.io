# Academic Website

Source for [my academic website](https://hannahestes.github.io/), built with Jekyll and hosted on GitHub Pages.
Originally based on [Khang Nguyen's template](https://github.com/mkhangg/academic-website/tree/main) ([site](https://mkhangg.com/)).


## Run locally

```
bundle install
bundle exec jekyll serve --livereload --host 127.0.0.1 --port 4000
```

Then open http://127.0.0.1:4000. Changes to `_config.yml` need a server restart; everything else reloads on save.
If `jekyll serve` exits with code `1`, run `pkill -f "jekyll serve"` and try again. If pages look stale,
hard refresh (`Cmd+Shift+R`) or delete `.jekyll-cache`.


## Editing content

Almost everything on the site comes from the YAML files in `_data/`:

| File | What it controls |
|---|---|
| `about.yaml` | name, pronouns, photo, social links, CV, intro paragraphs, research interests |
| `navigation.yaml` | pages in the nav bar |
| `updates.yaml` | the homepage updates timeline (newest first) |
| `research.yaml` | publications and their topic chips |
| `resources.yaml` | random thoughts topics and their categories |
| `travel.yaml` | conference trips: the travel map and the polaroids under it |
| `national_parks.yaml` | all 63 national parks; set `visited: true` when you go |
| `nc_state_parks.yaml` | NC state parks; set `visited: true` when you go |
| `lab.yaml` | Lab Fun polaroids |

Keep photos small (around 1000-1200px wide JPGs); on a Mac, `sips -Z 1200 photo.jpg` shrinks one in place.
For long text in YAML, use a folded block (`>-`).


## Structure

```
_config.yml          site title, tagline, browser-tab icon
_layouts/main.html   page shell: header, nav, footer, and which CSS/JS each page loads
index.md, about.md, publications.md, resources.md
                     the four pages, each a list of sections
_sections/           one file per section (profile header, nav, updates, travel, parks, ...)
_libs/               small repeated pieces (a paper, a polaroid, an update card, ...)
_data/               the content (see above)
styles/styles.css    all styling; theme colors are defined once at the top
js/scripts.js        theme toggle, scroll buttons, publications filter, photo viewer
js/maps.js           the about page's travel and parks maps
assets/              images, papers, slides, CV
```
