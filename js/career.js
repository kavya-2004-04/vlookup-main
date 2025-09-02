document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("careerForm");

  if (form) {
    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      // ✅ Validation
      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const phone = document.getElementById("phone").value.trim();
      const message = document.getElementById("message").value.trim();

      const nameRegex = /^[A-Za-z\s]+$/;
      if (!nameRegex.test(name)) {
        alert("Name must contain only letters and spaces.");
        return;
      }

      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;
      if (!emailRegex.test(email)) {
        alert("Please enter a valid email address.");
        return;
      }

      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(phone)) {
        alert("Phone number must be exactly 10 digits.");
        return;
      }

      if (message.length < 10) {
        alert("Message must be at least 10 characters long.");
        return;
      }
      let formData = new FormData(form);

      try {
        const response = await fetch(
          "https://script.google.com/macros/s/AKfycbxeRdc0yGKjEbq8W_wD11iEmwMCwY3hTU0WBu6lwhvlVwTVjhXGoGA4W8vxnO_mMwXt/exec",
          {
            method: "POST",
            body: formData, // ✅ send FormData directly, not JSON
          }
        );

        const result = await response.json();

        if (result.result === "success") {
          alert("Application submitted successfully!");
          form.reset(); // clear after success
        } else {
          alert("Error: " + result.message);
        }
      } catch (err) {
        console.error("Form submission failed", err);
        alert("Something went wrong, please try again.");
      }
    });
  }
});
