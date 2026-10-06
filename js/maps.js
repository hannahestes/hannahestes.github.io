// About page maps: a world map of conference travel and US maps of parks visited.
// Data comes from the page: window.travelTrips (travel.html) and window.parkMaps (parks.html).
//
// The maps are rebuilt when the theme changes or the window is resized, so their colors follow
// the theme and the straightened NC map stays centered. jsvectormap's destroy() clears event
// handlers for every map on the page, so all maps are always rebuilt together.

let maps = [];

function renderMaps() {
    maps.forEach(function(entry) {
        entry.map.destroy();
        entry.el.innerHTML = '';
    });
    maps = [];

    const dark = getCurrentTheme() === 'dark-theme';
    const styles = getComputedStyle(document.body);
    const colors = {
        accent: styles.getPropertyValue('--accent').trim(),
        accentStrong: styles.getPropertyValue('--accent-strong').trim(),
        land: dark ? '#4a4a4a' : '#e4e4e4',
        pinStroke: dark ? '#333333' : '#ffffff',
        pinTodo: dark ? '#9a9a9a' : '#8a8a8a',
        pinTodoFill: dark ? '#4a4a4a' : '#ffffff'
    };

    renderTravelMap(colors);
    renderParksMaps(colors);
}

document.addEventListener('DOMContentLoaded', renderMaps);
document.addEventListener('themechange', renderMaps);

let resizeTimer = null;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(renderMaps, 250);
});

function addMap(selector, options) {
    const el = document.querySelector(selector);
    if (el) {
        maps.push({ el: el, map: new jsVectorMap(Object.assign({ selector: selector }, options)) });
    }
    return el;
}


// Travel: countries visited are shaded (hovering lists the trips there); each city gets a pin.
function renderTravelMap(colors) {
    if (!window.travelTrips) {
        return;
    }

    const tripsByCountry = {};
    window.travelTrips.forEach(function(trip) {
        const code = String(trip.country).toUpperCase();
        (tripsByCountry[code] = tripsByCountry[code] || []).push(trip);
    });

    addMap('#travel-map', {
        map: 'world',
        zoomOnScroll: false,
        selectedRegions: Object.keys(tripsByCountry),
        regionStyle: {
            initial: { fill: colors.land },
            hover: { fillOpacity: 0.8, cursor: 'default' },
            selected: { fill: colors.accent, fillOpacity: 0.4 }
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
            if (trips) {
                const items = trips.map(function(trip) {
                    return '<li>' + trip.event + ' · ' + trip.city + '</li>';
                }).join('');
                tooltip.text('<b>' + tooltip.text() + '</b><ul>' + items + '</ul>', true);
            }
        }
    });
}


// Parks: every park gets a pin, solid once visited and small and hollow if not yet.
// Visited parks off the US map (e.g. the Virgin Islands) go in a small box in the map's corner;
// on phones that box is hidden and the park's tag under the map says so instead (parks.html).
// Options per map (set in parks.html): `fillCompleteStates` shades states where every park is
// visited; `focus` zooms to one state and hides the others; `rotate` (degrees) straightens a
// state far from the map's center, which the US map's projection draws tilted.
function renderParksMaps(colors) {
    (window.parkMaps || []).forEach(function(config) {
        const parksPerState = {}, visitedPerState = {};
        config.parks.forEach(function(park) {
            (park.states || []).forEach(function(state) {
                parksPerState[state] = (parksPerState[state] || 0) + 1;
                if (park.visited) {
                    visitedPerState[state] = (visitedPerState[state] || 0) + 1;
                }
            });
        });
        // territories (AS, VI) aren't on the map, so they're never shaded
        const filledStates = !config.fillCompleteStates ? [] : Object.keys(visitedPerState).filter(function(state) {
            return visitedPerState[state] === parksPerState[state] && !['AS', 'VI'].includes(state);
        }).map(function(state) {
            return 'US-' + state;
        });

        // not-yet pins first so the visited ones are drawn on top
        const pinned = config.parks.filter(function(park) {
            return park.coords;
        }).sort(function(a, b) {
            return a.visited - b.visited;
        });

        const el = addMap(config.selector, {
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
                if (filledStates.includes(code)) {
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

        if (config.focus) {
            el.querySelectorAll('.jvm-region').forEach(function(region) {
                if (region.getAttribute('data-code') !== config.focus) {
                    region.style.display = 'none';
                }
            });
            if (config.rotate) {
                rotateAndCenterRegion(el, el.querySelector('[data-code="' + config.focus + '"]'), config.rotate);
            }
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
