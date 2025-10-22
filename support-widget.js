/*!
 * Support Widget v1.0
 * Copyright 2025 GAS Customer Support System
 * This script injects a floating support button and modal into the host page.
 */
document.addEventListener('DOMContentLoaded', () => {

    // --- Configuration ---
    // !! IMPORTANT: Change this to your actual API endpoint
    const SUBMIT_API_URL = 'https://support.globalautosystems.co.ug/api/tickets';

    // Get the client name and email from the script tag
    // The client's script tag will look like:
    // <script src="..." data-client-name="YOUR_CLIENT_NAME_HERE" data-client-email="YOUR_CLIENT_EMAIL"></script>
    const scriptTag = document.querySelector('script[data-client-name][data-client-email]');
    const clientName = scriptTag ? scriptTag.dataset.clientName : null;
    const clientEmail = scriptTag ? scriptTag.dataset.clientEmail : null;

    if (!clientName || !clientEmail) {
        console.error('Support Widget: `data-client-name` or `data-client-email` is missing from the script tag.');
        return;
    }

    // --- 1. Create CSS Styles ---
    // We inject this into the <head> to style our widget and avoid conflicts
    const styles = `
        :root {
            --sw-primary-color: #007bff;
            --sw-white-color: #ffffff;
            --sw-text-color: #333;
            --sw-light-gray: #f4f4f4;
            --sw-dark-gray: #555;
            --sw-success-color: #28a745;
            --sw-error-color: #dc3545;
        }

        .sw-fab {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            background-color: var(--sw-primary-color);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 9998;
            transition: transform 0.2s ease-in-out;
        }

        .sw-fab:hover {
            transform: scale(1.1);
        }

        .sw-fab svg {
            width: 28px;
            height: 28px;
            fill: var(--sw-white-color);
        }

        .sw-modal {
            position: fixed;
            bottom: 90px;
            right: 20px;
            width: 320px;
            max-width: 90vw;
            background-color: var(--sw-white-color);
            border-radius: 8px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.2);
            z-index: 9999;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            overflow: hidden;
            display: none;
            flex-direction: column;
            opacity: 0;
            transform: translateY(10px);
            transition: opacity 0.2s ease, transform 0.2s ease;
        }

        .sw-modal.sw-active {
            display: flex;
            opacity: 1;
            transform: translateY(0);
        }

        .sw-header {
            padding: 16px;
            background-color: var(--sw-primary-color);
            color: var(--sw-white-color);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .sw-header h3 {
            margin: 0;
            font-size: 1.1rem;
        }

        .sw-close-btn {
            background: none;
            border: none;
            color: var(--sw-white-color);
            font-size: 24px;
            line-height: 1;
            padding: 0 4px;
            cursor: pointer;
            opacity: 0.8;
        }
        .sw-close-btn:hover {
            opacity: 1;
        }

        .sw-body {
            padding: 16px;
            flex-grow: 1;
            overflow-y: auto;
        }
        
        .sw-form-group {
            margin-bottom: 12px;
        }

        .sw-form-group label {
            display: block;
            margin-bottom: 4px;
            font-size: 0.9rem;
            color: var(--sw-dark-gray);
            font-weight: 500;
        }

        .sw-input,
        .sw-textarea {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 1rem;
            box-sizing: border-box; /* Important for width: 100% */
            font-family: inherit;
        }
        
        .sw-textarea {
            resize: vertical;
            min-height: 80px;
        }
        
        .sw-submit-btn {
            width: 100%;
            padding: 12px;
            background-color: var(--sw-primary-color);
            color: var(--sw-white-color);
            border: none;
            border-radius: 5px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: background-color 0.2s ease;
        }
        
        .sw-submit-btn:hover {
            background-color: #0056b3;
        }

        .sw-submit-btn:disabled {
            background-color: #a0a0a0;
            cursor: not-allowed;
        }

        .sw-footer {
            padding: 12px;
            text-align: center;
            font-size: 0.8rem;
            background-color: var(--sw-light-gray);
            color: #888;
        }

        .sw-footer a {
            color: var(--sw-primary-color);
            text-decoration: none;
        }

        .sw-message {
            padding: 10px;
            border-radius: 5px;
            margin-bottom: 12px;
            font-size: 0.9rem;
            display: none; /* Hidden by default */
        }

        .sw-message.sw-success {
            background-color: #e6f7ec;
            color: var(--sw-success-color);
            border: 1px solid #b7ebc9;
            display: block;
        }

        .sw-message.sw-error {
            background-color: #fbebee;
            color: var(--sw-error-color);
            border: 1px solid #f5c6cb;
            display: block;
        }
    `;

    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);

    // --- 2. Create HTML Elements ---

    // Floating Action Button (FAB)
    const fab = document.createElement('div');
    fab.className = 'sw-fab';
    // Using inline SVG for the icon to keep it self-contained
    fab.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
        </svg>
    `;

    // Support Modal
    const modal = document.createElement('div');
    modal.className = 'sw-modal';
    modal.innerHTML = `
        <div class="sw-header">
            <h3>Support Request</h3>
            <button class="sw-close-btn">&times;</button>
        </div>
        <div class="sw-body">
            <div class="sw-message" id="sw-message-box"></div>
            <form id="sw-support-form">
                <div class="sw-form-group">
                    <label for="sw-category">Category</label>
                    <select id="sw-category" class="sw-input" required>
                        <option value="" disabled selected>Select a category...</option>
                        <option value="general">General Inquiry</option>
                        <option value="technical">Technical Support</option>
                        <option value="billing">Billing Question</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div class="sw-form-group">
                    <label for="sw-title">Subject</label>
                    <input type="text" id="sw-title" class="sw-input" required>
                </div>
                <div class="sw-form-group">
                    <label for="sw-description">Description</label>
                    <textarea id="sw-description" class="sw-textarea" required></textarea>
                </div>
                <button type="submit" class="sw-submit-btn" id="sw-submit-btn">Send Message</button>
            </form>
        </div>
        <div class="sw-footer">
            Powered by <a href="https://globalautosystems.co.ug" target="_blank">Global Auto Systems</a>
        </div>
    `;

    // Append elements to the page
    document.body.appendChild(fab);
    document.body.appendChild(modal);

    // --- 3. Add Event Listeners ---

    const fabButton = document.querySelector('.sw-fab');
    const supportModal = document.querySelector('.sw-modal');
    const closeButton = document.querySelector('.sw-close-btn');
    const supportForm = document.getElementById('sw-support-form');
    const submitButton = document.getElementById('sw-submit-btn');
    const messageBox = document.getElementById('sw-message-box');

    // Toggle modal visibility
    fabButton.addEventListener('click', () => {
        supportModal.classList.toggle('sw-active');
    });

    closeButton.addEventListener('click', () => {
        supportModal.classList.remove('sw-active');
    });

    // Handle form submission
    supportForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent default form submission

        // Get form data
        const category = document.getElementById('sw-category').value;
        const title = document.getElementById('sw-title').value;
        const description = document.getElementById('sw-description').value;

        // Disable button and show loading text
        submitButton.disabled = true;
        submitButton.innerText = 'Sending...';
        hideMessage();

        // --- API Call ---
        fetch(SUBMIT_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                clientName: clientName, // From script tag
                clientEmail: clientEmail, // From script tag
                category: category, // Added category field
                title: title,       // Added title field (from Subject)
                description: description, // Mapped from description textarea
                source: window.location.href // Send the page URL
            })
        })
        .then(response => {
            if (!response.ok) {
                // Handle HTTP errors
                throw new Error(`Server responded with status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Handle success
            showMessage('Message sent! We will get back to you soon.', 'success');
            supportForm.reset(); // Clear the form
            // Optionally close the modal after a delay
            setTimeout(() => {
                supportModal.classList.remove('sw-active');
                hideMessage();
            }, 3000);
        })
        .catch(error => {
            // Handle errors (network or server)
            console.error('Support Widget Error:', error);
            showMessage('An error occurred. Please try again.', 'error');
        })
        .finally(() => {
            // Re-enable the button
            submitButton.disabled = false;
            submitButton.innerText = 'Send Message';
        });
    });

    // --- Helper Functions ---
    function showMessage(text, type) {
        messageBox.innerText = text;
        messageBox.className = `sw-message sw-${type}`;
    }

    function hideMessage() {
        messageBox.innerText = '';
        messageBox.className = 'sw-message';
    }

});



