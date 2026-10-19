(function () {
  const form = document.getElementById("ptz-form");
  const $ = (id) => document.getElementById(id);
  const fmt = (n) => Math.round(n).toLocaleString("fr-FR");
  const TOTAL_ANNEES = 25;

  // Champs monétaires : chiffres seuls, espaces des milliers à la saisie
  const parse = (v) => Number(String(v).replace(/[^\d]/g, "")) || 0;
  form.querySelectorAll(".money input").forEach((input) => {
    input.addEventListener("input", () => {
      const pos = input.value.length - input.selectionStart;
      const n = parse(input.value);
      input.value = n ? n.toLocaleString("fr-FR") : "";
      const p = Math.max(0, input.value.length - pos);
      input.setSelectionRange(p, p);
    });
  });

  form.querySelectorAll(".stepper button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = $("personnes");
      const v = Math.min(12, Math.max(1, (Number(input.value) || 1) + Number(btn.dataset.step)));
      input.value = v;
      update();
    });
  });

  let lastKey = "";

  function renderTimeline(r) {
    const bar = $("r-bar");
    const key = `${r.differe}-${r.remboursement}`;
    if (key === lastKey) return;
    lastKey = key;
    bar.innerHTML = "";
    for (let y = 0; y < TOTAL_ANNEES; y++) {
      const i = document.createElement("i");
      if (y < r.differe) i.className = "d";
      else if (y >= r.dureeTotale) i.className = "off";
      i.style.animationDelay = `${y * 14}ms`;
      bar.appendChild(i);
    }
    bar.classList.remove("animate");
    void bar.offsetWidth;
    bar.classList.add("animate");
  }

  function update() {
    const data = new FormData(form);
    const operation = data.get("operation");
    $("field-travaux").hidden = operation !== "ancien_travaux";

    const input = {
      operation,
      zone: data.get("zone"),
      personnes: Number(data.get("personnes")) || 1,
      rfr: parse(data.get("rfr")),
      prix: parse(data.get("prix")),
      travaux: parse(data.get("travaux")),
      autresPrets: parse(data.get("autres")),
      proprietaireRecent: data.get("proprietaire") === "oui",
    };
    const r = window.calculerPTZ(input);

    $("result-ok").hidden = !r.eligible;
    $("result-ko").hidden = r.eligible;

    if (r.eligible) {
      $("r-montant").textContent = fmt(r.montant);
      $("r-sub").textContent = `soit ${Math.round((r.montant / r.coutTotal) * 100)} % de votre projet de ${fmt(r.coutTotal)} €, sans intérêts`;
      $("r-tranche").textContent = `Tranche ${r.tranche} sur 4`;
      $("r-differe").textContent = r.differe ? `${r.differe} ans à 0 €` : "Aucun";
      $("r-mensualite").textContent = `${fmt(r.mensualite)} € pendant ${r.remboursement} ans`;
      $("r-duree").textContent = `${r.dureeTotale} ans`;
      const notes = [];
      if (r.plafonnePar === "plafondOperation")
        notes.push(`Le calcul est limité au plafond de ${fmt(r.assiette)} € pour votre zone et votre foyer.`);
      if (r.plafonnePar === "autresPrets")
        notes.push("Le montant est limité par celui de votre prêt principal.");
      notes.push(`Quotité appliquée : ${Math.round(r.quotite * 100)} %.`);
      $("r-note").textContent = notes.join(" ");
      renderTimeline(r);
    } else {
      $("r-raisons").innerHTML = "";
      r.raisons.forEach((t) => {
        const li = document.createElement("li");
        li.textContent = t;
        $("r-raisons").appendChild(li);
      });
      lastKey = "";
    }

    // E-mail de rappel pré-rempli avec la simulation
    const types = {
      neuf_collectif: "Appartement neuf",
      neuf_individuel: "Maison neuve",
      ancien_travaux: "Ancien avec travaux",
      social: "Accession sociale",
    };
    const body = [
      "Bonjour,",
      "",
      "Je souhaite être rappelé(e) au sujet de mon projet.",
      "",
      `Logement : ${types[operation]}, zone ${input.zone}`,
      `Coût du projet : ${fmt(r.coutTotal)} €`,
      `Foyer : ${input.personnes} personne(s), revenu fiscal ${fmt(input.rfr)} €`,
      r.eligible ? `PTZ estimé : ${fmt(r.montant)} € (tranche ${r.tranche})` : "PTZ : non éligible selon le simulateur",
      "",
      "Mon numéro de téléphone : ",
    ].join("\n");
    $("cta-mail").href =
      "mailto:contact@ptz2027.fr?subject=" +
      encodeURIComponent("Simulation PTZ : demande de rappel") +
      "&body=" + encodeURIComponent(body);
  }

  form.addEventListener("input", update);
  form.addEventListener("change", update);
  update();
})();
