// footer.js
function createFooter() {
    // Create style element
    const style = document.createElement('style');
    style.textContent = `
        .footer {
            background-color: #001F3F;
            color: white;
            padding: 20px 0;
            text-align: center;
        }

        .footer .social {
            margin-top: 15px;
        }

        .footer .social a {
            color: white;
            margin: 0 10px;
            font-size: 18px;
            text-decoration: none;
            transition: color 0.3s ease;
        }

        .footer .social a:hover {
            color: #ccc;
        }
    `;
    document.head.appendChild(style);

    // Create footer element
    const footer = document.createElement('footer');
    footer.className = 'footer';
    footer.innerHTML = `
        <div>&copy; ${new Date().getFullYear()} Livio. All Rights Reserved.</div>
        <div class="social mt-3">
            <a href="#" class="fab fa-facebook-f"></a>
            <a href="#" class="fab fa-twitter"></a>
            <a href="#" class="fab fa-instagram"></a>
            <a href="#" class="fab fa-linkedin"></a>
        </div>
    `;

    // Add footer to the page
    document.body.appendChild(footer);
}

// Check if Font Awesome is loaded, if not, load it
function loadFontAwesome() {
    if (!document.querySelector('link[href*="font-awesome"]')) {
        const fontAwesomeLink = document.createElement('link');
        fontAwesomeLink.rel = 'stylesheet';
        fontAwesomeLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css';
        document.head.appendChild(fontAwesomeLink);
    }
}

// Export the initialization function
export function initFooter() {
    loadFontAwesome();
    createFooter();
}