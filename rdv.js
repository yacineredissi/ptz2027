/* Prise de rendez-vous : ouvre Calendly dans une fenêtre sur le site.
   Si le widget ne charge pas, le lien s'ouvre normalement dans un nouvel onglet. */
(function () {
  const links = document.querySelectorAll("a[data-calendly]");
  if (!links.length) return;
  const css = document.createElement("link");
  css.rel = "stylesheet";
  css.href = "https://assets.calendly.com/assets/external/widget.css";
  document.head.appendChild(css);
  const js = document.createElement("script");
  js.src = "https://assets.calendly.com/assets/external/widget.js";
  js.async = true;
  document.head.appendChild(js);
  const base = links[0].href.split("?")[0];
  // a1 = première question du rendez-vous (« Votre projet »)
  const urlAvecSimulation = () =>
    window.ptzResume ? `${base}?a1=${encodeURIComponent(window.ptzResume)}` : base;

  links.forEach((a) =>
    a.addEventListener("click", (e) => {
      a.href = urlAvecSimulation();
      if (window.Calendly && window.Calendly.initPopupWidget) {
        e.preventDefault();
        window.Calendly.initPopupWidget({ url: a.href });
      }
    })
  );
})();
