// function openMobileModal() {
//   document.getElementById("mobileModal").style.display = "block";
// }

// function closeMobileModal() {
//   document.getElementById("mobileModal").style.display = "none";
//   document.getElementById("adminMobileInput").value = "";
//   document.getElementById("mobileError").style.display = "none";
// }

// function validateAdminMobile() {
//   const correctMobile = "8919801095"; // ✅ Your real admin mobile number
//   const entered = document.getElementById("adminMobileInput").value.trim();
//   const error = document.getElementById("mobileError");

//   if (entered === correctMobile || correctMobile) {
//     closeMobileModal();
//     window.location.href = "/admin/reset_password/admin_reset.html"; // ✅ Redirect if correct
//   } else {
//     error.style.display = "block";
//   }
// }

// // Optional: Close modal if user clicks outside of it
// window.onclick = function(event) {
//   const modal = document.getElementById("mobileModal");
//   if (event.target === modal) {
//     closeMobileModal();
//   }
// }

