document.addEventListener('DOMContentLoaded', function () {
    const contactForm = document.getElementById('contactForm');
    const successMessage = document.getElementById('successMessage');

    if (contactForm) {
        contactForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            // Get field values
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const message = document.getElementById('message').value.trim();

            // Regex validation
            const nameRegex = /^[A-Za-z\s]+$/;  // ✅ only letters + spaces
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;

            // Validation checks
            if (!nameRegex.test(name)) {
                alert("Name must contain only letters and spaces.");
                return;
            }

            if (!emailRegex.test(email)) {
                alert("Please enter a valid email address.");
                return;
            }

            if (message.length < 5) {
                alert("Message must be at least 5 characters long.");
                return;
            }

            // Prepare form data
            let formData = new FormData(contactForm);

            try {
                const response = await fetch(
                    "https://script.google.com/macros/s/AKfycbxeRdc0yGKjEbq8W_wD11iEmwMCwY3hTU0WBu6lwhvlVwTVjhXGoGA4W8vxnO_mMwXt/exec",
                    {
                        method: "POST",
                        body: formData,  // ✅ send directly, works with Google Apps Script
                    }
                );

                // Google Apps Script in no-cors mode doesn’t return JSON, so just show success
                successMessage.style.display = 'block';
                contactForm.reset();
            } catch (error) {
                console.error("Form submission failed", error);
                alert("Something went wrong. Please try again later.");
            }
        });
    }
});
