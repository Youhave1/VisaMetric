document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password'); // This gets the password-input-with-toggle custom element

    // --- Data (for demonstration only, should be from a secure backend) ---
    // In a real application, this data would come from a secure database via an API.
    // Storing user data and links directly in client-side JS is highly INSECURE.
    const USERS_DATA = {
        "user1": {
            password: "password123", // In real app, store hashed passwords!
            name: "Alice Smith",
            pages: {
                "info-form": "pages/info-form.html",
                "details": "pages/details.html",
                "case-result": "pages/case-result.html",
                "upload-personal-photo": "pages/upload-personal-photo.html",
                "upload-passport-photo": "pages/upload-passport-photo.html",
                "upload-other-docs": "pages/upload-other-docs.html"
            },
            pdfLink: "pdfs/user1_final_result.pdf" // Example PDF for Case Result
        },
        "user2": {
            password: "password456",
            name: "Bob Johnson",
            pages: {
                "info-form": "pages/info-form.html",
                "details": "pages/details.html",
                "case-result": "pages/case-result.html",
                "upload-personal-photo": "pages/upload-personal-photo.html",
                "upload-passport-photo": "pages/upload-passport-photo.html",
                "upload-other-docs": "pages/upload-other-docs.html"
            },
            pdfLink: "pdfs/user2_final_result.pdf"
        }
        // ... imagine 1000s more users loaded securely from a backend
    };
    // --- End of insecure data for demonstration ---


    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent default form submission

            const username = usernameInput.value;
            // For custom element, access its internal input value
            const password = passwordInput.shadowRoot ? passwordInput.shadowRoot.querySelector('input').value : passwordInput.value;


            // --- Mock Authentication (for demo only) ---
            if (USERS_DATA[username] && USERS_DATA[username].password === password) {
                // Successful login
                sessionStorage.setItem('loggedInUser', username); // Store username in session
                sessionStorage.setItem('userData', JSON.stringify(USERS_DATA[username])); // Store user specific data

                errorMessage.textContent = ''; // Clear any previous error
                window.location.href = 'dashboard.html'; // Redirect to dashboard
            } else {
                // Failed login
                errorMessage.textContent = 'Invalid username or password.';
                errorMessage.style.color = '#dc3545';
            }
        });
    }

    // --- Dashboard Logic ---
    const welcomeMessageElement = document.getElementById('welcomeMessage');
    const contentArea = document.getElementById('contentArea');
    const sidebarNav = document.querySelector('.sidebar-nav ul');
    const logoutButton = document.getElementById('logoutButton');
    let activityTimer; // For automatic logout

    if (welcomeMessageElement && contentArea && sidebarNav) {
        const loggedInUser = sessionStorage.getItem('loggedInUser');
        const userData = JSON.parse(sessionStorage.getItem('userData'));

        if (!loggedInUser || !userData) {
            // If not logged in, redirect to login page
            window.location.href = 'index.html';
            return; // Stop further execution
        }

        // Display welcome message with animation
        welcomeMessageElement.innerHTML = Welcome, ${userData.name}!;
        welcomeMessageElement.style.opacity = 0; // Reset for animation
        welcomeMessageElement.style.animation = 'slideInUp 0.8s forwards 0.5s'; // Re-trigger animation

        // Load default content or based on last visited
        loadContent('defaultWelcomeContent'); // Load the default welcome content initially

        // Set up sidebar navigation
        sidebarNav.addEventListener('click', function(event) {
            event.preventDefault();
            const target = event.target.closest('a'); // Get the anchor tag
            if (target && target.dataset.page) {
                // Remove active class from all links
                sidebarNav.querySelectorAll('a').forEach(link => link.classList.remove('active'));
                // Add active class to the clicked link
                target.classList.add('active');

                loadContent(target.dataset.page);
            }
        });

        // Logout functionality
        logoutButton.addEventListener('click', function() {
            sessionStorage.clear(); // Clear session data
            window.location.href = 'index.html'; // Redirect to login
        });

        // Auto-logout if inactive for 5 minutes
        const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds

        function resetActivityTimer() {
            clearTimeout(activityTimer);
            activityTimer = setTimeout(autoLogout, INACTIVITY_TIMEOUT);
        }

        function autoLogout() {
            alert('You have been logged out due to inactivity.');
            sessionStorage.clear();
            window.location.href = 'index.html';
        }

        // Attach activity listeners
        document.addEventListener('mousemove', resetActivityTimer);
        document.addEventListener('keypress', resetActivityTimer);
        document.addEventListener('click', resetActivityTimer);
        resetActivityTimer(); // Start timer on load


        // --- Function to load content without new tab ---
        async function loadContent(pageKey) {
            let contentHtml = '';
            let downloadLink = '';

            // This is where a real backend would fetch content based on pageKey and user's permissions
            if (pageKey === 'defaultWelcomeContent') {
                contentHtml = document.getElementById('defaultWelcomeContent').innerHTML;
            } else if (userData.pages && userData.pages[pageKey]) {
                // In a real app, this would be an AJAX/Fetch request to your backend API
                // e.g., fetch(/api/user/${loggedInUser}/page/${pageKey})
                // For this demo, we'll just mock the content loading
                try {
                    const response = await fetch(userData.pages[pageKey]);
                    if (response.ok) {
                        contentHtml = await response.text();
                    } else {
                        contentHtml = <p class="error-message">Error loading content for ${pageKey}.</p>;
                    }
                } catch (error) {
                    contentHtml = <p class="error-message">Failed to load content for ${pageKey}: ${error.message}</p>;
                    console.error("Error fetching page content:", error);
                }

                // Special handling for "Case Result" to show PDF download
                if (pageKey === 'case-result' && userData.pdfLink) {
                    contentHtml += `<div class="pdf-download-section">
                                        <p>Your case result is ready for download.</p>
                                        <button id="downloadResultPdf" class="download-button"><i class="fas fa-file-pdf"></i> Download Case Result PDF</button>
                                    </div>`;
                    downloadLink = userData.pdfLink; // Store the link for the button
                }
            } else {
                contentHtml = <p class="error-message">Content for "${pageKey}" not found or unauthorized.</p>;
            }

            contentArea.innerHTML = contentHtml; // Update content area

            // Attach PDF download listener if button exists
            if (pageKey === 'case-result' && document.getElementById('downloadResultPdf')) {
                document.getElementById('downloadResultPdf').addEventListener('click', function() {
                    // In a real scenario, you'd trigger a backend download or a PDF generation here.
                    // For demo, we'll just open the mock PDF link.
                    window.open(downloadLink, '_blank'); // Opens in a new tab for direct file download
                    // Or, if generating PDF from HTML:
                    // generatePdfFromCurrentContent(); // Call a function to generate PDF from displayed content
                });
            }

            // Optional: If you have forms within these loaded pages, you'd attach submit listeners here
            // e.g., if (document.getElementById('uploadForm')) { /* ... attach upload logic ... */ }
        }

        // --- Mock Content Pages (Create these HTML files inside a 'pages' folder) ---
        // Example for pages/info-form.html:
        /*
        <h3>Information Form</h3>
        <p>This is where your detailed information form goes.</p>
        <form>
            <label for="sampleInput">Sample Field:</label>
            <input type="text" id="sampleInput" placeholder="Enter data">
            <button type="submit" class="button-submit">Submit Info</button>
        </form>
        */

        // Example for pages/details.html:
        /*
        <h3>Your Details</h3>
        <p>This section will display your personal details from the database.</p>
        <ul>
            <li>Name: Alice Smith</li>
            <li>Date of Birth: 1990-01-01</li>
        </ul>
        */

        // Example for pages/case-result.html:
        /*
        <h3>Case Result</h3>
        <p>Here you can view the status and result of your application.</p>
        <p>Status: <span style="color: green; font-weight: bold;">Approved</span></p>
        */

        // For upload pages, you'd integrate the Google Drive upload logic here (requires backend)
        // Example for pages/upload-personal-photo.html:
        /*
        <h3>Upload Personal Photo</h3>
        <p>Please upload your personal photo here.</p>
        <input type="file" accept=".jpg,.png">
        <button class="button-submit">Upload Photo</button>
        */
        // And so on for other upload pages.

        // --- Mock PDF Files (Create these PDF files inside a 'pdfs' folder) ---
        // Create dummy PDF files named user1_final_result.pdf, user2_final_result.pdf, etc.
        // These are just placeholders for the demo. In a real system, these would be generated dynamically or stored securely.

    }
});

// For client-side PDF generation from displayed HTML content (advanced, requires html2canvas and jsPDF)
async function generatePdfFromCurrentContent() {
    const { jsPDF } = window.jspdf;
    const element = document.getElementById('contentArea'); // Element containing the content to be printed

    // Temporarily hide elements that shouldn't appear in the PDF if necessary
    // Example: Hide specific buttons or interactive elements

    try {
        const canvas = await html2canvas(element, { scale: 2, logging: false, useCORS: true });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        const imgHeight = canvas.height * imgWidth / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }
        pdf.save('Case_Result.pdf');
    } catch (error) {
        console.error("Error generating PDF:", error);
        alert("Failed to generate PDF. Please try again.");
    } finally {
        // Restore any hidden elements
    }
}