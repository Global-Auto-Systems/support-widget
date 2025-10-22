# GAS Support Widget

## Overview

This project is a self-contained JavaScript widget that adds a floating support button and ticket submission form to any website. When a user clicks the button, a modal appears, allowing them to submit a support request directly to our support system.

The widget is designed to be embedded on client websites with a single line of code, and it passes unique client identification data along with the user's support request.

## How to Use

To install the widget on a client's website, you must:

1.  **Add the Script Tag:** Ask your client to add the following `<script>` tag to the `<body>` of their HTML, just before the closing `</body>` tag.

    You **must** replace `YOUR_CLIENT_NAME_HERE` and `YOUR_CLIENT_EMAIL_HERE` with the client specific credentials.

    ```html
    <!-- GAS Support Widget -->
    <script 
        src="httpsA://[your-server-or-cdn.com/support-widget.js](https://your-server-or-cdn.com/support-widget.js)" 
        data-client-name="YOUR_CLIENT_NAME_HERE" 
        data-client-email="YOUR_CLIENT_EMAIL_HERE"
        defer
    ></script>
    <!-- End GAS Support Widget -->
    ```

### Script Tag Attributes

* `src`: The full URL to the hosted `support-widget.js` file.
* `data-client-name`: The unique name of your client (e.g., "City Motors"). This is sent to your API to identify which client the ticket came from.
* `data-client-email`: The primary contact email for your client (e.g., "manager@citymotors.com"). This is also sent to your API.
* `defer`: This attribute is recommended to ensure the script loads without blocking the page rendering.

## Backend API

The widget submits a `POST` request with a JSON payload to the API endpoint defined inside the `support-widget.js` file
