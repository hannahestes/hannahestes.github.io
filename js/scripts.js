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


// Change the text interchangably "See More" and "See Less"
function toggleText(linkElement) {
    var collapseId = linkElement.getAttribute('href').substring(1);
    var collapseElement = document.getElementById(collapseId);

    $(collapseElement).on('hidden.bs.collapse', function () {
        linkElement.textContent = '... See More';
    });
    $(collapseElement).on('shown.bs.collapse', function () {
        linkElement.textContent = '... See Less';
    });
}


// Initialize the toggleText function for each link
document.querySelectorAll('[data-toggle="collapse"]').forEach(function (linkElement) {
    toggleText(linkElement);
});


// Scroll to top of a div based on its tag
function scrollToTopDiv(divTag) {
    $(divTag)[0].scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}


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


// Function to update Isotope layout with smooth transitions
function updateLayoutProjects(collapseElement, isExpanding) {
    
    // Initialize Isotope with vertical layout
    var iso = new Isotope('#projects', {
        itemSelector: '.project',
        layoutMode: 'vertical'
    });

    if (isExpanding) {
        $(collapseElement).css('display', 'none');
        iso.arrange();
        setTimeout(function() {
            $(collapseElement).css('display', '');
            iso.arrange();
        }, 300);
    } else {
        iso.arrange();
        setTimeout(function() {
            $(collapseElement).css('display', 'none');
            iso.arrange();
        }, 300);
    }
}


// Bind updateLayout function to the collapsible elements' events
$('.collapse').on('show.bs.collapse', function () {
    updateLayoutProjects(this, true);
}).on('hide.bs.collapse', function () {
    updateLayoutProjects(this, false);
});


// Modified from https://codepen.io/SohRonery/pen/wvvBLyP
var itemsPerPageDefault = 5;
var currentNumberPages = 1;
var currentPage = 1;
var currentFilter = '*';
var filterAtribute = 'data-filter';
var pageAtribute = 'data-page-project';
var pagerClass = 'isotope-pager-project';
var $projects = $('#projects').isotope({
    itemcategory: '.project',
    layoutMode: 'vertical'
});


// Filter based on input category
function filterCategoryProjects(category) {
    $projects.isotope({
        filter: category
    });
}


// Determine items to be categorized and displayed per page
function showPageProjects(n) {
    currentPage = n;
    var category = '.project';
        category += ( currentFilter != '*' ) ? '[' + filterAtribute + '="' + currentFilter + '"]' : '';
        category += '[' + pageAtribute + '="' + currentPage+'"]';
    filterCategoryProjects(category);
}


// Update pager indicator when user clicks previous or next button, and disable buttons as needed
function updatePagerProjects() {
    var $isotopePager = ($('.' + pagerClass).length == 0 ) ? $('<div class="' + pagerClass + '"></div>') : $('.' + pagerClass);
    $isotopePager.html('');

    var $previous = $('<button class="pager" id="previous-page">&#8592; previous</button>');
    $previous.click(function() {
        if (currentPage > 1) {
            showPageProjects(currentPage - 1);
            updatePagerProjects();
            scrollToTopDiv('#research');
        }
    });
    if (currentPage === 1) {
        $previous.prop('disabled', true);
    }
    
    var $next = $('<button class="pager" id="next-page">next &#8594;</button>');
    $next.click(function() {
        if (currentPage < currentNumberPages) {
            showPageProjects(currentPage + 1);
            updatePagerProjects();
            scrollToTopDiv('#research');
        }
    });
    if (currentPage === currentNumberPages) {
        $next.prop('disabled', true);
    }

    var $currentPageIndicator = $('<span class="current-page">&nbsp; page ' + currentPage + ' of ' + currentNumberPages + ' &nbsp; </span>');
    
    $previous.appendTo($isotopePager);
    $currentPageIndicator.appendTo($isotopePager);
    $next.appendTo($isotopePager);
    $projects.after($isotopePager);
}


// Set pagination
function setPaginationProjects() {
    var SettingsPagesOnItems = function() {
        var itemsLength = $projects.children('.project').length;
        var pages = Math.ceil(itemsLength / itemsPerPageDefault);
        var item = 1;
        var page = 1;
        var category = '.project';
            category += ( currentFilter != '*' ) ? '[' + filterAtribute + '="' + currentFilter + '"]' : '';
        
        $projects.children(category).each(function() {
            if (item > itemsPerPageDefault) {
                page++;
                item = 1;
            }
            $(this).attr(pageAtribute, page);
            item++;
        });
        currentNumberPages = page;
    }();

    updatePagerProjects();
}


function initializeIsotopeProjects() {
    // Set number of pages, return to first page,
    setPaginationProjects();
    showPageProjects(1);


    // Filter projects based on category, including change active buttons, filter projects, 
    // set the number of pages, return to the first page, and update the pager indicator 
    $('#filters-project .filter-button').click(function() {
        $('#filters-project .filter-button').removeClass('active');
        $(this).addClass('active');
        var filter = $(this).attr('data-filter');
        currentFilter = filter;
        setPaginationProjects();
        showPageProjects(1);
        updatePagerProjects();
    });
}

// Function to update Isotope layout with smooth transitions
function updateLayoutPictures(collapseElement, isExpanding) {
    
    // Initialize Isotope with vertical layout
    var iso = new Isotope('#gallery-pictures', {
        itemSelector: '.pictures',
        layoutMode: 'vertical'
    });

    if (isExpanding) {
        $(collapseElement).css('display', 'none');
        iso.arrange();
        setTimeout(function() {
            $(collapseElement).css('display', '');
            iso.arrange();
        }, 300);
    } else {
        iso.arrange();
        setTimeout(function() {
            $(collapseElement).css('display', 'none');
            iso.arrange();
        }, 300);
    }
}


// Bind updateLayout function to the collapsible elements' events
$('.collapse').on('show.bs.collapse', function () {
    updateLayoutPictures(this, true);
}).on('hide.bs.collapse', function () {
    updateLayoutPictures(this, false);
});


// Gallery / pictures pagination & filtering (matches projects pattern)
var itemsPerPagePictures = 10;
var currentNumberPagesPictures = 1;
var currentPagePictures = 1;
var currentFilterPictures = '*';
var filterAtributePictures = 'data-filter';
var pageAtributePictures = 'data-page-picture';
var pagerClassPictures = 'isotope-pager-pictures';
var $pictures = $('#gallery-pictures').isotope({
    itemSelector: '.gallery-card',
    layoutMode: 'fitRows'
});

// Load real images for gallery cards on the current page/filter.
// Called after each Isotope arrange so only visible items fetch their images.
function loadVisibleGalleryImages() {
    var selector = '.gallery-card';
    if (currentFilterPictures !== '*') {
        selector += '[' + filterAtributePictures + '="' + currentFilterPictures + '"]';
    }
    selector += '[' + pageAtributePictures + '="' + currentPagePictures + '"]';
    $(selector).find('img[data-src]').each(function() {
        this.src = this.dataset.src;
        this.removeAttribute('data-src');
    });
}


// Filter based on input category for pictures
function filterCategoryPictures(category) {
    $pictures.isotope({
        filter: category
    });
}


// Determine items to be categorized and displayed per page for pictures
function showPagePictures(n) {
    currentPagePictures = n;
    var category = '.gallery-card';
        category += ( currentFilterPictures != '*' ) ? '[' + filterAtributePictures + '="' + currentFilterPictures + '"]' : '';
        category += '[' + pageAtributePictures + '="' + currentPagePictures + '"]';
    filterCategoryPictures(category);
}


// Update pager indicator when user clicks previous or next button (pictures)
function updatePagerPictures() {
    var $isotopePager = ($('.' + pagerClassPictures).length == 0 ) ? $('<div class="' + pagerClassPictures + '"></div>') : $('.' + pagerClassPictures);
    $isotopePager.html('');

    var $previous = $('<button class="pager" id="previous-page">&#8592; previous</button>');
    $previous.click(function() {
        if (currentPagePictures > 1) {
            showPagePictures(currentPagePictures - 1);
            updatePagerPictures();
            scrollToTopDiv('#gallery');
        }
    });
    if (currentPagePictures === 1) {
        $previous.prop('disabled', true);
    }
    
    var $next = $('<button class="pager" id="next-page">next &#8594;</button>');
    $next.click(function() {
        if (currentPagePictures < currentNumberPagesPictures) {
            showPagePictures(currentPagePictures + 1);
            updatePagerPictures();
            scrollToTopDiv('#gallery');
        }
    });
    if (currentPagePictures === currentNumberPagesPictures) {
        $next.prop('disabled', true);
    }

    var $currentPageIndicator = $('<span class="current-page">&nbsp; page ' + currentPagePictures + ' of ' + currentNumberPagesPictures + ' &nbsp; </span>');
    
    $previous.appendTo($isotopePager);
    $currentPageIndicator.appendTo($isotopePager);
    $next.appendTo($isotopePager);
    $pictures.after($isotopePager);
}


// Set pagination for pictures
function setPaginationPictures() {
    var SettingsPagesOnItems = function() {
        var itemsLength = $pictures.children('.gallery-card').length;
        var pages = Math.ceil(itemsLength / itemsPerPagePictures);
        var item = 1;
        var page = 1;
        var category = '.gallery-card';
            category += ( currentFilterPictures != '*' ) ? '[' + filterAtributePictures + '="' + currentFilterPictures + '"]' : '';
        
        $pictures.children(category).each(function() {
            if (item > itemsPerPagePictures) {
                page++;
                item = 1;
            }
            $(this).attr(pageAtributePictures, page);
            item++;
        });
        currentNumberPagesPictures = page;
    }();

    updatePagerPictures();
}


// Initialize isotope for pictures (projects-like behavior)
function initializeIsotopePictures() {
    // Set number of pages, return to first page,
    setPaginationPictures();

    // Load images whenever Isotope finishes arranging (covers initial load, filter, and page changes)
    $pictures.off('arrangeComplete.gallery').on('arrangeComplete.gallery', loadVisibleGalleryImages);

    showPagePictures(1);


    // Filter pictures based on category, including change active buttons, filter pictures,
    // set the number of pages, return to the first page, and update the pager indicator
    $('#filters-pictures .filter-button').off('click').on('click', function() {
        $('#filters-pictures .filter-button').removeClass('active');
        $(this).addClass('active');
        var filter = $(this).attr('data-filter');
        currentFilterPictures = filter;
        setPaginationPictures();
        showPagePictures(1);
        updatePagerPictures();
    });
    // mark as initialized so fallback timer knows it's done
    window._galleryIsotopeInitialized = true;
}


// // Guarantee correct layouts when all web resources are fully loaded 
// This version is slow --> only re-layout when all the gifs are fully loaded
// $(window).on('load', function() {
//     initializeOwlCarousel();
//     initializeIsotopeProjects();
// });
// This version is faster --> re-layout when all the images are fully loaded not neccessarily all the gifs
$(document).ready(function() {
    // Initialize updates before the deferred gallery/photo layouts.
    initializeUpdatesSection();

    // Exclude lazy-loaded images — they don't fire onload until scrolled into view,
    // which would stall Promise.all and prevent Isotope layouts from initializing.
    var Images = $('img[src$=".jpg"], img[src$=".jpeg"], img[src$=".png"]').not('[loading="lazy"]').get();
    var imageLoadPromises = Images.map(function(img) {
        return new Promise(function(resolve) {
            if (img.complete) {
                resolve();
            } else {
                img.onload = resolve;
                img.onerror = resolve;
            }
        });
    });

    // Each page only has some of these sections, so only initialize the ones present.
    Promise.all(imageLoadPromises).then(function() {
        if ($projects.length) initializeIsotopeProjects();
        if ($pictures.length) initializeIsotopePictures();
    });
    // Fallback: if images hang or onerror doesn't fire for some reason, ensure gallery initializes
    setTimeout(function() {
        if ($pictures.length && !window._galleryIsotopeInitialized) {
            initializeIsotopePictures();
        }
    }, 2000);
});


// Initialize Isotope for gallery pictures (filter by category)
// (Old initializeIsotopeGallery removed; using project-style initializeIsotopePictures instead.)


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
        pinStroke: getCurrentTheme() === 'dark-theme' ? '#333333' : '#ffffff'
    };

    renderTravelMap(colors);
    renderParksMaps(colors);
}

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
            selected: { fill: colors.accent }
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

// One pin per park visited. Parks without coords (off the US map, e.g. the Virgin Islands)
// are listed in a small "off the map" box in the corner instead.
// A map with `focus` zooms to that state and hides the others; `rotate` (degrees) straightens
// states far from the map's center, which the US map's projection draws tilted.
function renderParksMaps(colors) {
    (window.parkMaps || []).forEach(function(config) {
        addMap(config.selector, {
            map: 'us_aea_en',
            zoomOnScroll: false,
            zoomButtons: !config.focus,
            draggable: !config.focus,
            focusOn: config.focus ? { region: config.focus, animate: false } : undefined,
            regionStyle: {
                initial: { fill: colors.land, stroke: colors.pinStroke, strokeWidth: 1 },
                hover: { fillOpacity: 0.8, cursor: 'default' }
            },
            markers: config.parks.filter(function(park) {
                return park.coords;
            }).map(function(park) {
                return { name: park.caption, coords: park.coords };
            }),
            markerStyle: {
                initial: { fill: colors.accent, stroke: colors.pinStroke, strokeWidth: 2, r: 6 },
                hover: { fill: colors.accentStrong, cursor: 'default' }
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
            return !park.coords;
        });
        if (offMapParks.length) {
            const box = document.createElement('div');
            box.className = 'parks-offmap';
            box.innerHTML = '<span class="parks-offmap-title">off the map</span>' +
                offMapParks.map(function(park) {
                    return '<span class="parks-offmap-park"><span class="parks-offmap-pin"></span>' + park.caption + '</span>';
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


// Enlarge a travel photo when its polaroid is clicked (about page)
document.addEventListener('DOMContentLoaded', function() {
    const lightbox = document.getElementById('travel-lightbox');
    if (!lightbox) {
        return;
    }
    const lightboxImg = lightbox.querySelector('img');
    const lightboxCaption = lightbox.querySelector('.travel-polaroid-caption');

    document.querySelectorAll('.travel-polaroid').forEach(function(polaroid) {
        polaroid.addEventListener('click', function() {
            lightboxImg.src = polaroid.dataset.src;
            lightboxImg.alt = polaroid.dataset.caption;
            lightboxCaption.textContent = polaroid.dataset.caption;
            lightbox.showModal();
        });
    });

    lightbox.querySelector('.travel-lightbox-close').addEventListener('click', function() {
        lightbox.close();
    });
    // Close when clicking the dark backdrop around the photo
    lightbox.addEventListener('click', function(event) {
        if (event.target === lightbox) {
            lightbox.close();
        }
    });
});
