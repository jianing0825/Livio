// logout.js
export function initLogout() {
    // Check if not logged in and redirect
    if (localStorage.getItem("isLoggedIn") === null) {
        window.location.href = "loginpage.html";
        return;
    }

    // Add logout functionality to logout button
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function () {
            // Clear all localStorage items
            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("userId");
            localStorage.removeItem("userEmail");
            localStorage.removeItem("userFirstName");
            localStorage.removeItem("userLastName");
            localStorage.removeItem("hasSubmitted");
            
            // Redirect to login page
            window.location.href = "loginpage.html";
        });
    }
}