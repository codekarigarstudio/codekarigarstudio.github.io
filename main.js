// CodeKarigar site interactions — no backend, no tracking.
(function () {
  "use strict";

  var WA_NUMBER = "923087415185";

  // Mobile nav
  var toggle = document.getElementById("navToggle");
  var links = document.getElementById("navLinks");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.addEventListener("click", function (e) {
      if (e.target.tagName === "A") links.classList.remove("open");
    });
  }

  // Header shadow on scroll
  var header = document.getElementById("siteHeader");
  window.addEventListener("scroll", function () {
    header.style.boxShadow = window.scrollY > 10 ? "0 4px 18px rgba(15,23,42,0.08)" : "none";
  }, { passive: true });

  // Quote form -> WhatsApp (zero backend)
  var form = document.getElementById("quoteForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = document.getElementById("fName").value.trim();
      var need = document.getElementById("fNeed").value;
      var msg = document.getElementById("fMsg").value.trim();
      var text = "Hi CodeKarigar! I'm " + name + ".\nI need: " + need + "\nRequirement: " + msg;
      window.open("https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(text), "_blank");
    });
  }

  // Footer year
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // Subtle reveal on scroll
  var cards = document.querySelectorAll(".card, .step, .about-points li");
  cards.forEach(function (el) { el.classList.add("reveal"); });
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("visible"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    cards.forEach(function (el) { io.observe(el); });
  } else {
    cards.forEach(function (el) { el.classList.add("visible"); });
  }
})();
