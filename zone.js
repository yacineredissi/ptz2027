/* Code postal → commune(s) → zone ABC, via les APIs publiques de l'État. */
(function () {
  const cp = document.getElementById("cp");
  const communeSel = document.getElementById("cp-commune");
  const status = document.getElementById("cp-status");
  const zoneSel = document.getElementById("zone");
  const DEFAULT_MSG = "La zone se remplit automatiquement.";
  const cache = {};
  let requestId = 0;

  const say = (msg, kind) => {
    status.textContent = msg;
    status.dataset.kind = kind || "";
  };

  async function zoneDe(codeInsee) {
    if (cache[codeInsee]) return cache[codeInsee];
    const url =
      `https://tabular-api.data.gouv.fr/api/resources/${PTZ_RULES.zonageResourceId}/data/?CODGEO__exact=${codeInsee}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("zonage");
    const row = (await res.json()).data[0];
    if (!row) return null;
    const key = Object.keys(row).find((k) => k.toLowerCase().startsWith("zonage"));
    const brut = String(row[key] || "").replace(/\s/g, "").toUpperCase();
    const zone = brut.startsWith("A") ? "A" : brut;
    cache[codeInsee] = { brut: brut === "ABIS" ? "A bis" : brut, zone };
    return cache[codeInsee];
  }

  async function appliquer(commune, id) {
    say(`Recherche de la zone de ${commune.nom}…`);
    try {
      const z = await zoneDe(commune.code);
      if (id !== requestId) return;
      if (!z || !PTZ_RULES.zones.includes(z.zone)) {
        say(`Zone introuvable pour ${commune.nom}. Choisissez-la ci-dessous.`, "warn");
        return;
      }
      zoneSel.value = z.zone;
      zoneSel.dispatchEvent(new Event("change", { bubbles: true }));
      say(`${commune.nom} est en zone ${z.brut}.`, "ok");
    } catch (e) {
      if (id === requestId)
        say("Recherche indisponible pour le moment. Choisissez la zone ci-dessous.", "warn");
    }
  }

  async function chercher() {
    const code = cp.value.replace(/\D/g, "").slice(0, 5);
    cp.value = code;
    const id = ++requestId;
    communeSel.hidden = true;
    if (code.length < 5) {
      say(DEFAULT_MSG);
      return;
    }
    say("Recherche de la commune…");
    try {
      const res = await fetch(
        `https://geo.api.gouv.fr/communes?codePostal=${code}&fields=nom,code&format=json`
      );
      const communes = res.ok ? await res.json() : [];
      if (id !== requestId) return;
      if (!communes.length) {
        say("Code postal inconnu. Vérifiez-le ou choisissez la zone ci-dessous.", "warn");
        return;
      }
      communes.sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
      if (communes.length > 1) {
        communeSel.innerHTML =
          `<option value="" selected disabled>Choisissez votre commune</option>` +
          communes.map((c) => `<option value="${c.code}">${c.nom}</option>`).join("");
        communeSel.hidden = false;
        communeSel.onchange = () =>
          appliquer(communes.find((c) => c.code === communeSel.value), ++requestId);
        say(`${communes.length} communes ont ce code postal : choisissez la vôtre.`);
        return;
      }
      appliquer(communes[0], id);
    } catch (e) {
      if (id === requestId)
        say("Recherche indisponible pour le moment. Choisissez la zone ci-dessous.", "warn");
    }
  }

  cp.addEventListener("input", chercher);
  // Choix manuel : on n'affiche plus de zone trouvée qui serait contredite
  zoneSel.addEventListener("input", () => {
    if (status.dataset.kind === "ok") say("Zone choisie manuellement.");
  });
})();
