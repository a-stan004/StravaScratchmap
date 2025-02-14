var newWindow = window.open('https://www.example.com', '_blank');

// Function to track the URL the user navigates to next
function trackNavigation() {
    if (newWindow) {
        newWindow.onbeforeunload = function() {
            console.log('User navigated to: ' + newWindow.location.href);
        };
    }
}

// Call the function to start tracking
trackNavigation();