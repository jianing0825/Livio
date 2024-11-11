// navbar.js
export function initNavbar() {
    // Check if logged in and has submitted
    const hasSubmitted = localStorage.getItem("hasSubmitted") === "true";
    
    // Get dropdown menu
    const dropdownMenu = document.querySelector('[aria-labelledby="expensesDropdown"]');
    
    // Only show dropdown items if user has submitted
    if (hasSubmitted) {
        if (dropdownMenu) {
            dropdownMenu.style.display = 'block';
        }
    } else {
        if (dropdownMenu) {
            dropdownMenu.style.display = 'none';
        }
    }

    // Add active class to current page link
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll(".navbar-nav .nav-link, .dropdown-menu .dropdown-item");

    navLinks.forEach(link => {
        if (link.getAttribute("href") === currentPath) {
            link.classList.add("active");

            // If this link is part of a dropdown, also activate the main dropdown toggle
            const dropdownMenu = link.closest(".dropdown-menu");
            if (dropdownMenu) {
                const parentDropdownLink = dropdownMenu
                    .closest(".dropdown")
                    .querySelector(".dropdown-toggle");
                if (parentDropdownLink) {
                    parentDropdownLink.classList.add("active");
                }
            }
        }
    });
}