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
    const speechBalloon = document.querySelector('.speech-balloon');
    // const clickSound = new Audio('assets/sounds/collision_sound.wav');
    $('html, body').animate({scrollTop:0}, '300');
    showSpeech('back to top!');
    // clickSound.play();
});

// helper to show speech balloon messages and auto-hide after 3 seconds
let _speechTimeout = null;
function showSpeech(text) {
    const el = document.querySelector('.speech-balloon');
    if (!el) return;
    el.innerText = text;
    el.classList.remove('hidden');
    if (_speechTimeout) {
        clearTimeout(_speechTimeout);
    }
    _speechTimeout = setTimeout(() => {
        el.classList.add('hidden');
        _speechTimeout = null;
    }, 3000);
}


// Play pronunciation audio when the emoji is clicked (guarded)
// var _volumeEmojiEl = document.getElementById('volumeEmoji');
// if (_volumeEmojiEl) {
//     _volumeEmojiEl.addEventListener('click', function() {
//         const pronunicationAudio = new Audio('assets/sounds/khang.mp3');
//         pronunicationAudio.play();
//     });
// }


// Toggle navigation menu bar
function toggleNav() {
    document.querySelector('nav').classList.toggle('animated-menu');
    document.querySelector('.nav-toggle-btn').classList.toggle('active');
}


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
        showSpeech('lights turned on!');
    } else {
        applyTheme('dark-theme');
        showSpeech('lights turned off!');
    }
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

function applySidebarAccessibility() {
    const navActions = document.querySelectorAll('nav ul li .nav-item-button, nav ul li .nav-item-link');

    navActions.forEach(function(actionEl) {
        const labelEl = actionEl.querySelector('.text');
        const label = labelEl ? labelEl.textContent.trim() : actionEl.textContent.trim();
        if (label) {
            actionEl.setAttribute('aria-label', label);
        }
    });
}

// Touch and mouse event listeners
let isDragging = false;
let isMobile = 'ontouchstart' in window;
let startEvent = isMobile ? 'touchstart' : 'mousedown';
let moveEvent = isMobile ? 'touchmove' : 'mousemove';
let endEvent = isMobile ? 'touchend' : 'mouseup';
// popup icon and dismissal area
var popupIconContainer = document.getElementById('popupIconContainer');
var dismissalArea = document.getElementById('dismissalArea');
var startX = 0, startY = 0, originalX = 0, originalY = 0;


// Capture mouse down (desktop) or touch start (mobile) events (guarded)
if (popupIconContainer) {
    popupIconContainer.addEventListener(startEvent, (e) => {
    e.preventDefault();
    isDragging = true;
    let clientX = isMobile ? e.touches[0].clientX : e.clientX;
    let clientY = isMobile ? e.touches[0].clientY : e.clientY;

    startX = clientX;
    startY = clientY;
    originalX = popupIconContainer.getBoundingClientRect().left;
    originalY = popupIconContainer.getBoundingClientRect().top;
    if (dismissalArea) dismissalArea.style.display = 'flex';
    
    // Hide the speech balloon as users start dragging and drag the icon
    document.querySelector('.speech-balloon').classList.add('hidden');
});


    // Capture mouse move (desktop) or touch move (mobile) events
    document.addEventListener(moveEvent, (e) => {
        if (!isDragging) {
            return;
        }
        
        let clientX = isMobile ? e.touches[0].clientX : e.clientX;
        let clientY = isMobile ? e.touches[0].clientY : e.clientY;

        let x = originalX + (clientX - startX);
        let y = originalY + (clientY - startY);
        if (popupIconContainer) {
            popupIconContainer.style.left = `${x}px`;
            popupIconContainer.style.bottom = `calc(100% - ${y}px - ${popupIconContainer.offsetHeight}px)`;
        }
    });
}


// Capture mouse up (desktop) or touch end (mobile) events
document.addEventListener(endEvent, (e) => {
    // const clickSound = new Audio('assets/sounds/disappear_sound.wav');

    if (!isDragging) {
        return;
    }

    let clientX = isMobile ? e.changedTouches[0].clientX : e.clientX;
    let clientY = isMobile ? e.changedTouches[0].clientY : e.clientY;
    let centerX = window.innerWidth / 2;
    let centerY = window.innerHeight;

    // Check if icon is near the middle bottom dismissal area
    if (Math.abs(clientX - centerX) < 50 && Math.abs(clientY - centerY) < 100) {
        if (popupIconContainer) popupIconContainer.classList.add('hidden');
        // clickSound.play();
    }

    if (dismissalArea) dismissalArea.style.display = 'none';
    isDragging = false;
});


// Hide speech balloon when scrolling down
window.addEventListener('scroll', function() {
    let scrollPosition = window.scrollY || document.documentElement.scrollTop;
    if (scrollPosition > 300) {
        document.querySelector('.speech-balloon').classList.add('hidden');
    } else {
        document.querySelector('.speech-balloon').classList.remove('hidden');
    }
});


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


// Scripts to activate/deactivate contact info card 
var overlaybg = document.getElementById('overlay-bg');
var contactTrigger = document.getElementById('contact-card-trigger');
if (overlaybg && contactTrigger) {
    contactTrigger.onclick = function() {
        overlaybg.style.display = 'flex';
    };

    overlaybg.addEventListener('click', function(event) {
        if (event.target === overlaybg) {
            overlaybg.style.display = 'none';
        }
    });
}


// Play the flipping-card sound when user flips the contact info card
var frontEndCard = document.getElementById('front_end_card');
if (frontEndCard) {
    frontEndCard.addEventListener('click', function() {
        this.classList.toggle('flip');
        // const flipAudio = new Audio('assets/sounds/flipcard_sound.mp3');
        // flipAudio.play();
    });
}


// Get all filter buttons and change their active status as user clicks
var filterButtonsProject = document.querySelectorAll('#filters-project .filter-button'); 
var filterButtonsPicture = document.querySelectorAll('#filters-pictures .filter-button'); 
var filterButtonsGithub = document.querySelectorAll('#filters-resources .filter-button'); 
var speechBalloon = document.querySelector('.speech-balloon');

filterButtonsProject.forEach(function(filterButtonProject) {
    filterButtonProject.addEventListener('click', function() {
        filterButtonsProject.forEach(function(flrbtn) {
            flrbtn.classList.remove('active');
        });
        this.classList.add('active');
        if (this.textContent === "perception + manipulation") {
            showSpeech('see RoPM projects!');
        } else {
            showSpeech('see ' + this.textContent + ' projects!');
        }
    });
});

filterButtonsPicture.forEach(function(filterButtonPicture) {
    filterButtonPicture.addEventListener('click', function() {
        filterButtonsPicture.forEach(function(flrbtn) {
            flrbtn.classList.remove('active');
        });
        this.classList.add('active');
        if (this.textContent === "national parks") {
            showSpeech('16 / 63 national parks visited!');  //TODO: make sure to update this!
        } else if (this.textContent === "nc state parks") {
            showSpeech('21 / 43 NC state parks visited!') //TODO: make sure to update this!
        } 
        else {
            showSpeech('see ' + this.textContent + ' pictures!');
        }
    });
});

filterButtonsGithub.forEach(function(filterButtonGithub) {
    filterButtonGithub.addEventListener('click', function() {
        filterButtonsGithub.forEach(function(flrbtn) {
            flrbtn.classList.remove('active');
        });
        this.classList.add('active');
        var selected = this.textContent.trim().toLowerCase();
        if (selected === 'all') {
            showSpeech('see all resources!');
        } else {
            showSpeech('see ' + selected + ' resources!');
        }
    });
});


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





// Function load GitHub repositories
let _resourceModalLastFocused = null;
let _resourceModalActiveCard = null;

function getResourceModalFocusableElements(modal) {
    return Array.from(
        modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
    ).filter(function(el) {
        return !el.hasAttribute('disabled') && el.offsetParent !== null;
    });
}

function onResourceModalKeydown(event) {
    const modal = document.getElementById('resource-modal');
    if (!modal || modal.getAttribute('aria-hidden') !== 'false') {
        return;
    }

    if (event.key === 'Escape') {
        event.preventDefault();
        closeResourceModal();
        return;
    }

    if (event.key !== 'Tab') {
        return;
    }

    const focusable = getResourceModalFocusableElements(modal);
    if (focusable.length === 0) {
        event.preventDefault();
        return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
    } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
    }
}

function closeResourceModal() {
    const modal = document.getElementById('resource-modal');
    if (!modal) {
        return;
    }

    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    modal.setAttribute('hidden', 'hidden');
    modal.style.display = 'none';
    document.body.classList.remove('modal-open');

    document.removeEventListener('keydown', onResourceModalKeydown);

    if (_resourceModalActiveCard) {
        _resourceModalActiveCard.setAttribute('aria-expanded', 'false');
    }

    if (_resourceModalLastFocused && typeof _resourceModalLastFocused.focus === 'function') {
        _resourceModalLastFocused.focus();
    }

    _resourceModalLastFocused = null;
    _resourceModalActiveCard = null;
}

function openResourceModalFromCard(card) {
    const modal = document.getElementById('resource-modal');
    const modalTitle = document.getElementById('resource-modal-title');
    const modalBody = document.getElementById('resource-modal-body');
    const modalContent = modal ? modal.querySelector('.resource-modal-content') : null;

    if (!modal || !modalTitle || !modalBody || !card || !modalContent) {
        return;
    }

    const cardTitle = card.querySelector('.resource-entry-title');
    const cardContent = card.querySelector('.resource-entry-content');

    modalTitle.textContent = cardTitle ? cardTitle.textContent : 'Entry';
    modalBody.innerHTML = cardContent ? cardContent.innerHTML : '';

    _resourceModalLastFocused = document.activeElement;
    _resourceModalActiveCard = card;
    card.setAttribute('aria-expanded', 'true');

    modal.removeAttribute('hidden');
    modal.style.display = 'flex';
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');

    document.addEventListener('keydown', onResourceModalKeydown);
    modalContent.focus();
}

document.addEventListener('DOMContentLoaded', () => {

    const container = document.getElementById('github-cards');
    if (!container) {
        return;
    }
    const repoElements = container.querySelectorAll('div[data-url]');

    repoElements.forEach(repoElement => {
        const repoUrl = repoElement.getAttribute('data-url');
        
        axios.get(repoUrl)
            .then(response => {
                const { name, description, html_url, stargazers_count, forks_count, language } = response.data;
                const cardHtml = `
                        <div class="repo-header">
                            <i class="far fa-bookmark bookmark-icon"></i>
                            <a href="${html_url}" target="_blank" class="repo-name">${name}</a>
                        </div>
                        <div class="repo-description">${description || 'No description provided.'}</div>
                        <div class="repo-stats">
                            <i class="fas fa-code language-icon"></i>
                            <span class="language">${language}</span>
                            <div>
                                <i class="fas fa-star star-icon"></i>
                                <span class="stats-number">${stargazers_count}</span>
                            </div>
                            <div>
                                <i class="fas fa-code-branch fork-icon"></i>
                                <span class="stats-number">${forks_count}</span>
                            </div>
                        </div>
                `;

                repoElement.outerHTML = cardHtml;
                
                // Refresh GitHub cards isotope layout
                $cards.isotope('layout');
                
            })
            .catch(error => {
                console.error('Error fetching repository data for', repoUrl, error);
            });
    });

    const modalCloseBtn = document.getElementById('resource-modal-close');
    const modal = document.getElementById('resource-modal');

    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeResourceModal);
    }

    if (modal) {
        modal.addEventListener('click', function(event) {
            if (event.target === modal) {
                closeResourceModal();
            }
        });
    }

});


// Modified from https://codepen.io/SohRonery/pen/wvvBLyP
var itemsPerPageDefault_1 = 6;
var currentNumberPages_1 = 1;
var currentPage_1 = 1;
var currentFilter_1 = '*';
var filterAtribute_1 = 'data-filter';
var pageAtribute_1 = 'data-page-github';
var pagerClass_1 = 'isotope-pager-github';
var $cards = $('#github-cards').isotope({
    itemcategory: '.github-card',
    layoutMode: 'fitRows'
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


// Filter based on input category
function filterCategoryGithub(category) {
    $cards.isotope({
        filter: category
    });
}


// Determine items to be categorized and displayed per page
function showPageGithub(n) {
    currentPage_1 = n;
    var category = '.github-card';
        category += ( currentFilter_1 != '*' ) ? '[' + filterAtribute_1 + '="' + currentFilter_1 + '"]' : '';
        category += '[' + pageAtribute_1 + '="' + currentPage_1+'"]';
    filterCategoryGithub(category);
}


// Update pager indicator when user clicks previous or next button, and disable buttons as needed
function updatePagerGithub() {
    var $isotopePager = ($('.' + pagerClass_1).length == 0 ) ? $('<div class="' + pagerClass_1 + '"></div>') : $('.' + pagerClass_1);
    $isotopePager.html('');

    var $previous = $('<button class="pager" id="previous-page">&#8592; previous</button>');
    $previous.click(function() {
        if (currentPage_1 > 1) {
            showPageGithub(currentPage_1 - 1);
            updatePagerGithub();
            scrollToTopDiv('#resources');
        }
    });
    if (currentPage_1 === 1) {
        $previous.prop('disabled', true);
    }
    
    var $next = $('<button class="pager" id="next-page">next &#8594;</button>');
    $next.click(function() {
        if (currentPage_1 < currentNumberPages_1) {
            showPageGithub(currentPage_1 + 1);
            updatePagerGithub();
            scrollToTopDiv('#resources');
        }
    });
    if (currentPage_1 === currentNumberPages_1) {
        $next.prop('disabled', true);
    }

    var $currentPage_1Indicator = $('<span class="current-page">&nbsp; page ' + currentPage_1 + ' of ' + currentNumberPages_1 + ' &nbsp; </span>');
    
    $previous.appendTo($isotopePager);
    $currentPage_1Indicator.appendTo($isotopePager);
    $next.appendTo($isotopePager);
    $cards.after($isotopePager);
}


// Set pagination
function setPaginationGithub() {
    var SettingsPagesOnItems = function() {
        var itemsLength = $cards.children('.github-card').length;
        var pages = Math.ceil(itemsLength / itemsPerPageDefault_1);
        var item = 1;
        var page = 1;
        var category = '.github-card';
            category += ( currentFilter_1 != '*' ) ? '[' + filterAtribute_1 + '="' + currentFilter_1 + '"]' : '';
        
        $cards.children(category).each(function() {
            if (item > itemsPerPageDefault_1) {
                page++;
                item = 1;
            }
            $(this).attr(pageAtribute_1, page);
            item++;
        });
        currentNumberPages_1 = page;
    }();

    updatePagerGithub();
}


function initializeIsotopeGithub() {
    // Set number of pages, return to first page,
    setPaginationGithub();
    showPageGithub(1);


    // Filter cards based on category, including change active buttons, filter cards, 
    // set the number of pages, return to the first page, and update the pager indicator 
    $('#filters-resources .filter-button').click(function() {
        $('#filters-resources .filter-button').removeClass('active');
        $(this).addClass('active');
        var filter = $(this).attr('data-filter');
        currentFilter_1 = filter;
        setPaginationGithub();
        showPageGithub(1);
        updatePagerGithub();
    });
}


// // Guarantee correct layouts when all web resources are fully loaded 
// This version is slow --> only re-layout when all the gifs are fully loaded
// $(window).on('load', function() {
//     initializeOwlCarousel();
//     initializeIsotopeProjects();
// });
// This version is faster --> re-layout when all the images are fully loaded not neccessarily all the gifs
$(document).ready(function() {
    // Carousel has no images so initialize immediately, not after image load
    initializeOwlCarousel();

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

    Promise.all(imageLoadPromises).then(function() {
        initializeIsotopeProjects();
        initializeIsotopeGithub();
        initializeIsotopePictures();
    });
    // Fallback: if images hang or onerror doesn't fire for some reason, ensure gallery initializes
    setTimeout(function() {
        if (!window._galleryIsotopeInitialized) {
            initializeIsotopePictures();
        }
    }, 2000);
});


// Initialize Isotope for gallery pictures (filter by category)
// (Old initializeIsotopeGallery removed; using project-style initializeIsotopePictures instead.)


document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    applySidebarAccessibility();

    // Default assistant message on load
    showSpeech('hi!');
});


// Automatically update year in footer
var _currentYearEl = document.getElementById("currentYear");
if (_currentYearEl) {
    _currentYearEl.textContent = new Date().getFullYear();
}


// Canvas for particle moves
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const particles = [];


// Resize canvas width and height
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();


// Class for Particle
class Particle {
    
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.color = 'rgba(255, 255, 255, ' + 0.7 + ')';
        this.lifespan = 100;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.color = 'rgba(255, 255, 255, ' + this.lifespan--/100 + ')';

        if (this.lifespan <= 0) {
            this.reset();
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fill();
    }
}


// Initialize 101 particles
for (let i = 0; i < 101; i++) {
    particles.push(new Particle());
}


// Make the particles move
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(particle => {
        particle.update();
        particle.draw(ctx);
    });

    requestAnimationFrame(animate);
}

// Animate the particles
animate();
