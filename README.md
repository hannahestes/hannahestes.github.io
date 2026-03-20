# Academic Website

This repository contains source code of [my academic website](https://hannahestes.github.io/) using Jekyll as a static website generator. Feel free to clone this code for your personal use!


## Template from Khang Nguyen
Thanks for the great template and here is what I have done to make it my own! :)

[Orginal Reference Repo](https://github.com/mkhangg/academic-website/tree/main)
[Actual Website](https://mkhangg.com/)


## Local Run

```
bundle install
bundle exec jekyll serve --livereload --host 127.0.0.1 --port 4000
```

Open http://127.0.0.1:4000 in your browser.


## Troubleshooting

- If `jekyll serve` exits with code `1`, kill stale server processes and retry:

```bash
pkill -f "jekyll serve" || true
bundle exec jekyll serve --livereload --host 127.0.0.1 --port 4000
```

- If styles or content look stale, do a hard refresh (`Cmd+Shift+R`).
- If stale generated content persists, delete `.jekyll-cache` and run again.


## Content Authoring Notes

- Most website content is data-driven via files in `_data/`.
- For long text values in YAML, prefer multiline block style (`>-`) for readability.
- Key editable files:
    - `_data/updates.yaml` for update cards.
    - `_data/resources.yaml` for resources/random thoughts cards and modal content.
    - `_data/gallery.yaml` for gallery images/captions/categories.



## File Structure**

```
.
├───assets                      # folder including your images, files, etc
├───js                  
    └───scripts.js              # the JS file for functional buttons
├───styles              
    └───styles.css              # the CSS file for colors and stuffs 
├───_data               
    ├───about.yaml              # data file for About section
    ├───footer.yaml             # data file for Footer section
    ├───gallery.yaml            # data file for Gallery section
    ├───research.yaml           # data file for Research section
    ├───resources.yaml          # data file for Resources/Random Thoughts section
    └───updates.yaml            # data file for Updates section
├───_layouts      
    └───main.html               # the HTML layout for the webpage 
├───_libs      
    ├───about_widget.html       # html file for About widget
    ├───footer_widget.html      # html file for Footer widget
    ├───gallery_widget.html     # html file for Gallery widget
    ├───research_widget.html    # html file for Research widget
    ├───resources_widget.html   # html file for Resources widget
    └───updates_widget.html     # html file for Updates widget
├───_sections           
    ├───about.html              # html file for About section
    ├───footer.html             # html file for Footer section
    ├───gallery.html            # html file for Gallery section
    ├───research.html           # html file for Research section
    ├───resources.html          # html file for Resources/Random Thoughts section
    └───updates.html            # html file for Updates section
├───_site                       # all contents for deployable version here!
    ├───assets
    ├───js
    ├───styles
    └───index.html              # the generated HTML file
├───index.md                    # markdown file that uses main.html as layout
└───_config.yml                 # information for webpage title and favicon
```
