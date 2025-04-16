// animation.js
// Simple fade-in animation for weather results and forecast

document.addEventListener('DOMContentLoaded', () => {
    const weatherResult = document.getElementById('weatherResult');
    const forecastDiv = document.getElementById('forecast');

    function fadeIn(element) {
        element.style.opacity = 0;
        element.style.display = 'block';
        let last = +new Date();
        const tick = function() {
            element.style.opacity = +element.style.opacity + (new Date() - last) / 300;
            last = +new Date();
            if (+element.style.opacity < 1) {
                requestAnimationFrame(tick);
            }
        };
        tick();
    }

    // Observe changes to weatherResult and forecastDiv
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.addedNodes.length > 0) {
                fadeIn(mutation.target);
            }
        });
    });

    observer.observe(weatherResult, { childList: true });
    observer.observe(forecastDiv, { childList: true });
});
