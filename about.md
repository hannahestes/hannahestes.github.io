---
layout: main
title: about
map: true
---

{% include_relative _sections/travel.html %}
{% include_relative _sections/parks.html id="parks" category="nps" title="national parks" icon="fas fa-mountain" total=63
    intro="I love exploring national parks!" %}
{% include_relative _sections/parks.html id="nc-parks" category="ncsp" title="nc state parks" icon="fas fa-tree" total=42 focus="US-NC" rotate=12
    intro="I'm also working my way through North Carolina's state parks!" %}
{% include_relative _sections/gallery.html %}
