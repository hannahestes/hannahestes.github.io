// Back-to-top button
var btn = $('#back-to-top-button');

$(window).scroll(function() {
    if ($(window).scrollTop() > 300) {
        btn.addClass('show');
    } else {
        btn.removeClass('show');
    }
});

btn.on('click', function(e) {
    e.preventDefault();
    $('html, body').animate({scrollTop:0}, '300');
});


// Theme state (single source of truth)
const THEME_STORAGE_KEY = 'preferred-theme';

function getCurrentTheme() {
    return document.body.classList.contains('dark-theme') ? 'dark-theme' : 'light-theme';
}

function getPreferredTheme() {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === 'light-theme' || savedTheme === 'dark-theme') {
        return savedTheme;
    }

    const currentHour = new Date().getHours();
    return (currentHour > 19 || currentHour <= 7) ? 'dark-theme' : 'light-theme';
}

function applyTheme(theme) {
    const bodyEl = document.body;
    const buttonEl = document.querySelector('.toggle-theme-button');

    bodyEl.classList.remove('light-theme', 'dark-theme');
    bodyEl.classList.add(theme);

    if (buttonEl) {
        buttonEl.classList.remove('light-theme', 'dark-theme');
        buttonEl.classList.add(theme);
        buttonEl.innerText = theme === 'dark-theme' ? '☀️' : '🌙';
    }

    localStorage.setItem(THEME_STORAGE_KEY, theme);
}

function initializeTheme() {
    applyTheme(getPreferredTheme());
}

function toggleTheme() {
    const isDark = getCurrentTheme() === 'dark-theme';

    if (isDark) {
        applyTheme('light-theme');
    } else {
        applyTheme('dark-theme');
    }
    renderMaps();
}


// Handle scroll event to hide/show back-to-top and toggle theme button
window.addEventListener('scroll', function() {
    const buttonEl = document.querySelector('.toggle-theme-button');
    if (window.scrollY > 0) {
        buttonEl.style.display = 'none';
    } else {
        buttonEl.style.display = 'block';
    }
});


// Owl carousel for updates
function initializeOwlCarousel() {
    const $carousel = $('.owl-carousel').owlCarousel({
        loop: false,
        rewind: false,
        margin: 10,
        nav: true,
        dots: false,
        lazyLoad: false,
        slideBy: 'page',
        responsive: {
            0: {items: 1.75},
            600: {items: 3},
            900: {items: 5},
            1200: {items: 6}
        }
    });

    // Keep carousel controls accessible even as Owl re-renders controls.
    setTimeout(function() {
        applyCarouselAccessibility();
    }, 0);

    $carousel.on('refreshed.owl.carousel initialized.owl.carousel', function() {
        applyCarouselAccessibility();
    });
}

function applyCarouselAccessibility() {
    const carousel = document.querySelector('.owl-carousel');
    if (!carousel) {
        return;
    }

    carousel.setAttribute('role', 'region');
    carousel.setAttribute('aria-label', 'Updates carousel');

    const prevBtn = carousel.querySelector('.owl-prev');
    const nextBtn = carousel.querySelector('.owl-next');

    if (prevBtn) {
        prevBtn.setAttribute('aria-label', 'Previous updates');
        prevBtn.setAttribute('title', 'Previous updates');
    }
    if (nextBtn) {
        nextBtn.setAttribute('aria-label', 'Next updates');
        nextBtn.setAttribute('title', 'Next updates');
    }
}

function initializeUpdatesSection() {
    initializeOwlCarousel();
}

function applyNavAccessibility() {
    const navActions = document.querySelectorAll('nav .nav-item-link');

    navActions.forEach(function(actionEl) {
        const labelEl = actionEl.querySelector('.text');
        const label = labelEl ? labelEl.textContent.trim() : actionEl.textContent.trim();
        if (label) {
            actionEl.setAttribute('aria-label', label);
        }
    });
}

// Update progress bar as user scrolls down
window.onscroll = function() {progressBar()};

function progressBar() {
    var winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    var height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    var scrolled = (winScroll / height) * 100;
    var _progressBarEl = document.getElementById("progressBar");
    if (_progressBarEl) {
        _progressBarEl.style.width = scrolled + "%";
    }
}


// Publications: show only the papers matching the selected topic chip
document.querySelectorAll('#filters-project .filter-button').forEach(function(button) {
    button.addEventListener('click', function() {
        document.querySelectorAll('#filters-project .filter-button').forEach(function(other) {
            other.classList.toggle('active', other === button);
        });
        const filter = button.getAttribute('data-filter');
        document.querySelectorAll('#projects .paper').forEach(function(paper) {
            paper.hidden = filter !== '*' && paper.getAttribute('data-filter') !== filter;
        });
    });
});


$(document).ready(function() {
    initializeUpdatesSection();
});


document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    applyNavAccessibility();
    renderMaps();
});


// Automatically update year in footer
var _currentYearEl = document.getElementById("currentYear");
if (_currentYearEl) {
    _currentYearEl.textContent = new Date().getFullYear();
}


// Maps on the about page: world map of conference travel and US maps of parks visited.
// They're rebuilt on theme change so their colors follow the theme. jsvectormap's
// destroy() clears event handlers for every map on the page, so both are always rebuilt together.
let _maps = [];

function renderMaps() {
    if (typeof jsVectorMap === 'undefined') {
        return;
    }
    _maps.forEach(function(entry) {
        entry.map.destroy();
        entry.el.innerHTML = '';
    });
    _maps = [];

    const styles = getComputedStyle(document.body);
    const colors = {
        accent: styles.getPropertyValue('--color-accent').trim(),
        accentStrong: styles.getPropertyValue('--color-accent-strong').trim(),
        land: getCurrentTheme() === 'dark-theme' ? '#4a4a4a' : '#e4e4e4',
        pinStroke: getCurrentTheme() === 'dark-theme' ? '#333333' : '#ffffff',
        pinTodo: getCurrentTheme() === 'dark-theme' ? '#9a9a9a' : '#8a8a8a',
        pinTodoFill: getCurrentTheme() === 'dark-theme' ? '#4a4a4a' : '#ffffff'
    };

    renderTravelMap(colors);
    renderParksMaps(colors);
}

// Rebuild the maps after the window is resized (e.g. when the parks maps switch between
// side-by-side and stacked), so the straightened NC map stays centered in its new box.
let _mapResizeTimer = null;
window.addEventListener('resize', function() {
    clearTimeout(_mapResizeTimer);
    _mapResizeTimer = setTimeout(renderMaps, 250);
});

function addMap(selector, options) {
    const el = document.querySelector(selector);
    if (el) {
        _maps.push({ el: el, map: new jsVectorMap(Object.assign({ selector: selector }, options)) });
    }
}

// Countries visited are shaded with the theme accent; each city gets a pin.
function renderTravelMap(colors) {
    if (!window.travelTrips) {
        return;
    }

    // Group trips by country for the region tooltips
    const tripsByCountry = {};
    window.travelTrips.forEach(function(trip) {
        const code = String(trip.country).toUpperCase();
        (tripsByCountry[code] = tripsByCountry[code] || []).push(trip);
    });

    addMap('#travel-map', {
        map: 'world',
        zoomOnScroll: false,
        zoomButtons: true,
        selectedRegions: Object.keys(tripsByCountry),
        regionStyle: {
            initial: { fill: colors.land },
            hover: { fillOpacity: 0.8, cursor: 'default' },
            selected: { fill: colors.accent, fillOpacity: 0.4 } // same tint as the shaded national park states
        },
        markers: window.travelTrips.map(function(trip) {
            return { name: trip.event + ' · ' + trip.city, coords: trip.coords };
        }),
        markerStyle: {
            initial: { fill: colors.accentStrong, stroke: colors.pinStroke, strokeWidth: 2, r: 6 },
            hover: { fill: colors.accentStrong, cursor: 'default' }
        },
        onRegionTooltipShow: function(event, tooltip, code) {
            const trips = tripsByCountry[code];
            if (!trips) {
                return;
            }
            const items = trips.map(function(trip) {
                return '<li>' + trip.event + ' · ' + trip.city + '</li>';
            }).join('');
            tooltip.text('<b>' + tooltip.text() + '</b><ul>' + items + '</ul>', true);
        }
    });
}

// A state is shaded on the national parks map once every park in it is visited. Returns the
// map region codes (e.g. "US-UT") of those states; parks spanning states count for each one.
function completedStates(parks) {
    const total = {}, visited = {};
    parks.forEach(function(park) {
        (park.states || []).forEach(function(state) {
            total[state] = (total[state] || 0) + 1;
            if (park.visited) {
                visited[state] = (visited[state] || 0) + 1;
            }
        });
    });
    return Object.keys(visited).filter(function(state) {
        return visited[state] === total[state] && !['AS', 'VI'].includes(state); // territories aren't on the map
    }).map(function(state) {
        return 'US-' + state;
    });
}

// Every park gets a pin: solid once visited, small and hollow if not yet. Visited parks without
// coords (off the US map, e.g. the Virgin Islands) are listed in a small "off the map" box instead.
// A map with `focus` zooms to that state and hides the others; `rotate` (degrees) straightens
// states far from the map's center, which the US map's projection draws tilted.
function renderParksMaps(colors) {
    (window.parkMaps || []).forEach(function(config) {
        const filledStates = config.fillCompleteStates ? completedStates(config.parks) : [];
        const parksPerState = {};
        config.parks.forEach(function(park) {
            (park.states || []).forEach(function(state) {
                parksPerState[state] = (parksPerState[state] || 0) + 1;
            });
        });
        // not-yet pins first so the visited ones are drawn on top
        const pinned = config.parks.filter(function(park) {
            return park.coords;
        }).sort(function(a, b) {
            return a.visited - b.visited;
        });

        addMap(config.selector, {
            map: 'us_aea_en',
            zoomOnScroll: false,
            zoomButtons: !config.focus,
            draggable: !config.focus,
            focusOn: config.focus ? { region: config.focus, animate: false } : undefined,
            selectedRegions: filledStates,
            regionStyle: {
                initial: { fill: colors.land, stroke: colors.pinStroke, strokeWidth: 1 },
                hover: { fillOpacity: 0.8, cursor: 'default' },
                selected: { fill: colors.accent, fillOpacity: 0.4 }
            },
            onRegionTooltipShow: function(event, tooltip, code) {
                if (filledStates.indexOf(code) !== -1) {
                    const total = parksPerState[code.slice(3)];
                    tooltip.text(tooltip.text() + ' · all ' + total + (total === 1 ? ' park' : ' parks') + ' visited!');
                }
            },
            markers: pinned.map(function(park) {
                return {
                    name: park.visited ? park.name : park.name + ' (not yet!)',
                    coords: park.coords,
                    style: park.visited ? {} : {
                        initial: { fill: colors.pinTodoFill, stroke: colors.pinTodo, strokeWidth: 1.5, r: 4 },
                        hover: { fill: colors.pinTodo }
                    }
                };
            }),
            markerStyle: {
                initial: { fill: colors.accentStrong, stroke: colors.pinStroke, strokeWidth: 2, r: 6 },
                hover: { fill: colors.accent, cursor: 'default' }
            }
        });
        const el = document.querySelector(config.selector);
        if (config.focus) {
            el.querySelectorAll('.jvm-region').forEach(function(region) {
                if (region.getAttribute('data-code') !== config.focus) {
                    region.style.display = 'none';
                }
            });
        }
        if (config.rotate && config.focus) {
            rotateAndCenterRegion(el, el.querySelector('[data-code="' + config.focus + '"]'), config.rotate);
        }

        const offMapParks = config.parks.filter(function(park) {
            return park.visited && !park.coords;
        });
        if (offMapParks.length) {
            const box = document.createElement('div');
            box.className = 'parks-offmap';
            box.innerHTML = '<span class="parks-offmap-title">off the map</span>' +
                offMapParks.map(function(park) {
                    return '<span class="parks-offmap-park"><span class="parks-offmap-pin"></span>' + park.name + '</span>';
                }).join('');
            el.appendChild(box);
        }
    });
}


// Rotate a map's svg, then shift and scale it so the (rotated) region sits centered in the
// container. The region's outline is sampled because bounding boxes ignore the rotation.
function rotateAndCenterRegion(container, region, degrees) {
    const svg = container.querySelector('svg');
    svg.style.transformOrigin = 'center';
    svg.style.transform = 'rotate(' + degrees + 'deg)';

    const box = container.getBoundingClientRect();
    const ctm = region.getScreenCTM();
    const length = region.getTotalLength();
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (let i = 0; i <= 300; i++) {
        const local = region.getPointAtLength(length * i / 300);
        const point = new DOMPoint(local.x, local.y).matrixTransform(ctm);
        minX = Math.min(minX, point.x);
        maxX = Math.max(maxX, point.x);
        minY = Math.min(minY, point.y);
        maxY = Math.max(maxY, point.y);
    }

    const padding = 40;
    const scale = Math.min((box.width - padding) / (maxX - minX), (box.height - padding) / (maxY - minY));
    const offsetX = (minX + maxX) / 2 - (box.left + box.width / 2);
    const offsetY = (minY + maxY) / 2 - (box.top + box.height / 2);
    svg.style.transform = 'translate(' + (-offsetX * scale) + 'px, ' + (-offsetY * scale) + 'px) ' +
        'rotate(' + degrees + 'deg) scale(' + scale + ')';
}


// Enlarge a photo when its polaroid is clicked (travel and lab fun, about page)
document.addEventListener('DOMContentLoaded', function() {
    const lightbox = document.getElementById('photo-lightbox');
    if (!lightbox) {
        return;
    }
    const lightboxImg = lightbox.querySelector('img');
    const lightboxCaption = lightbox.querySelector('.polaroid-caption');

    document.querySelectorAll('.polaroid').forEach(function(polaroid) {
        polaroid.addEventListener('click', function() {
            lightboxImg.src = polaroid.dataset.src;
            lightboxImg.alt = polaroid.dataset.caption;
            lightboxCaption.textContent = polaroid.dataset.caption;
            lightbox.showModal();
        });
    });

    lightbox.querySelector('.photo-lightbox-close').addEventListener('click', function() {
        lightbox.close();
    });
    // Close when clicking the dark backdrop around the photo
    lightbox.addEventListener('click', function(event) {
        if (event.target === lightbox) {
            lightbox.close();
        }
    });
});
