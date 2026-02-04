Payment Modal Widget: 
A lightweight, vanilla JavaScript widget for secure credit card entry, featuring real-time validation and Bootstrap 5 styling.

Features
Smart Formatting: Groups card numbers automatically and handles Amex spacing.

US Zip Validation: Supports 12345 and 12345-6789 formats via Regex.

Expiry Check: Validates MM/YY format and ensures the card is not expired.

Mobile Ready: Uses inputmode to trigger numeric keypads on mobile devices.

Quick Start
Include Dependencies: Add Bootstrap 5 CSS and Icons to your HTML.

Add Container:
HTML
<div id="card-payment-wrapper"></div>

Initialize:
JavaScript
new CardPaymentWidget('card-payment-wrapper', {
    themeColor: '#0d6efd'
});

Configuration
The widget is highly customizable through the options object:
themeColor: Changes the primary button and success icon color.

labels: Allows for full localization of titles, placeholders, and error messages.

File Structure
card-payment-form.js: Contains the core logic, validation, and rendering engine.
card-payment-screen.html: A demo page showing the widget in a responsive layout.
