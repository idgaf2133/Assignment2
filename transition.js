function fadeIn() {
    document.body.style.opacity = 1;
}

function fadeOutAndRedirect(url) {
    document.body.style.opacity = 0;
    setTimeout(function() {
        window.location.href = url;
    }, 500); // Match the duration of the transition in CSS
}