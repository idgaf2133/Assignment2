// Function to fade in the body content
function fadeIn() {
    document.body.style.opacity = 1; // Set the opacity of the body to 1 (fully visible)
}

// Function to fade out the body content and redirect to a new URL
function fadeOutAndRedirect(url) {
    document.body.style.opacity = 0; // Set the opacity of the body to 0 (fully transparent)
    setTimeout(function() {
        window.location.href = url; // Redirect to the specified URL after the fade-out transition
    }, 500); // Match the duration of the transition in CSS (500 milliseconds)
}
