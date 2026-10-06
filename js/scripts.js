// Site-wide behavior: theme, scroll chrome, publications filter, photo viewer.
// The about page's maps live in maps.js.


// Theme: light/dark, remembered in localStorage (defaults to dark in the evening)
const THEME_STORAGE_KEY = 'preferred-theme';

function getCurrentTheme() {
    return document.body.classList.contains('dark-theme') ? 'dark-theme' : 'light-theme';
}

function getPreferredTheme() {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === 'light-theme' || savedTheme === 'dark-theme') {
        return savedTheme;
    }
    const hour = new Date().getHours();
    return (hour > 19 || hour <= 7) ? 'dark-theme' : 'light-theme';
}

function applyTheme(theme) {
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(theme);
    document.querySelector('.toggle-theme-button').innerText = theme === 'dark-theme' ? '☀️' : '🌙';
    localStorage.setItem(THEME_STORAGE_KEY, theme);
}

function toggleTheme() {
    applyTheme(getCurrentTheme() === 'dark-theme' ? 'light-theme' : 'dark-theme');
    document.dispatchEvent(new Event('themechange'));
}

// this script loads at the end of <body>, so the theme is applied before anything is drawn
applyTheme(getPreferredTheme());


// Scroll chrome: progress bar and the back-to-top button (shown once you've scrolled down)
const progressBar = document.getElementById('progressBar');
const backToTopButton = document.getElementById('back-to-top-button');

window.addEventListener('scroll', function() {
    const scrolled = document.documentElement.scrollTop;
    const scrollable = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    progressBar.style.width = (scrolled / scrollable) * 100 + '%';
    backToTopButton.classList.toggle('show', scrolled > 300);
});

backToTopButton.addEventListener('click', function(event) {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
});


// Footer year
document.getElementById('currentYear').textContent = new Date().getFullYear();


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


// About page: enlarge a photo when its polaroid is clicked
const lightbox = document.getElementById('photo-lightbox');
if (lightbox) {
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
    // close when clicking the dark backdrop around the photo
    lightbox.addEventListener('click', function(event) {
        if (event.target === lightbox) {
            lightbox.close();
        }
    });
}
