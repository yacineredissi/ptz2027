/*
 * Moteur de calcul du PTZ. Fonction pure, sans accès au DOM, testable avec Node.
 *
 * Entrée :
 *  operation : "neuf_collectif" | "neuf_individuel" | "ancien_travaux" | "social"
 *  zone      : "A" | "B1" | "B2" | "C"
 *  personnes : nombre de personnes qui vivront dans le logement (≥ 1)
 *  rfr       : somme des revenus fiscaux de référence N-2 du foyer
 *  prix      : prix du logement (ou du terrain + construction), frais inclus
 *  travaux   : montant des travaux (ancien uniquement)
 *  autresPrets : montant des autres prêts de plus de 2 ans (optionnel)
 *  proprietaireRecent : true si propriétaire de sa résidence principale
 *                       dans les 2 dernières années
 */
(function (root) {
  const RULES =
    typeof PTZ_RULES !== "undefined" ? PTZ_RULES : require("./rules.js");

  function idx(personnes, max) {
    return Math.min(Math.max(1, Math.floor(personnes)), max) - 1;
  }

  function calculerPTZ(input) {
    const operation = input.operation;
    const zone = input.zone;
    const personnes = Math.max(1, Math.floor(input.personnes || 1));
    const rfr = Math.max(0, Number(input.rfr) || 0);
    const prix = Math.max(0, Number(input.prix) || 0);
    const travaux =
      operation === "ancien_travaux" ? Math.max(0, Number(input.travaux) || 0) : 0;
    const coutTotal = prix + travaux;

    const res = {
      eligible: false,
      raisons: [],
      coutTotal,
      revenuRetenu: 0,
      revenuParPart: 0,
      coefficient: 0,
      tranche: null,
      plafondRessources: 0,
      assiette: 0,
      quotite: 0,
      montant: 0,
      plafonnePar: null,
      differe: 0,
      remboursement: 0,
      dureeTotale: 0,
      mensualite: 0,
    };

    if (coutTotal <= 0) {
      res.raisons.push("Indiquez le prix du logement.");
      return res;
    }

    if (input.proprietaireRecent) {
      res.raisons.push(
        "Le PTZ est réservé aux personnes qui n'ont pas été propriétaires de leur résidence principale dans les 2 dernières années (sauf cas particuliers : invalidité, catastrophe naturelle, usufruit…)."
      );
    }

    if (operation === "ancien_travaux") {
      if (!RULES.ancienZones.includes(zone)) {
        res.raisons.push(
          "Dans l'ancien, le PTZ n'est accessible qu'en zone B2 ou C."
        );
      }
      if (travaux < coutTotal * RULES.ancienPartTravauxMin) {
        const min = Math.ceil(
          (prix * RULES.ancienPartTravauxMin) / (1 - RULES.ancienPartTravauxMin)
        );
        res.raisons.push(
          `Dans l'ancien, les travaux doivent représenter au moins 25 % du coût total, soit au moins ${min.toLocaleString("fr-FR")} € de travaux pour ce prix.`
        );
      }
    }

    res.revenuRetenu = Math.max(rfr, coutTotal / RULES.diviseurCout);
    res.plafondRessources = RULES.plafondsRessources[zone][idx(personnes, 8)];
    res.coefficient = RULES.coefficientFamilial[idx(personnes, 5)];
    res.revenuParPart = res.revenuRetenu / res.coefficient;

    if (res.revenuRetenu > res.plafondRessources) {
      const parCout = coutTotal / RULES.diviseurCout > rfr;
      res.raisons.push(
        parCout
          ? `Pour ce projet, le revenu pris en compte est le coût total divisé par 9 (${Math.round(res.revenuRetenu).toLocaleString("fr-FR")} €), ce qui dépasse le plafond de ${res.plafondRessources.toLocaleString("fr-FR")} € pour votre foyer dans cette zone.`
          : `Vos revenus dépassent le plafond de ${res.plafondRessources.toLocaleString("fr-FR")} € pour votre foyer dans cette zone.`
      );
    }

    const bornes = RULES.tranches[zone];
    let t = bornes.findIndex((b) => res.revenuParPart <= b);
    if (t === -1) t = 3;
    res.tranche = t + 1;

    const plafondOp = RULES.plafondsOperation[zone][idx(personnes, 5)];
    res.assiette = Math.min(coutTotal, plafondOp);
    res.quotite = RULES.quotites[operation][t];
    let montant = Math.floor(res.assiette * res.quotite);

    const autres = Number(input.autresPrets) || 0;
    if (autres > 0) {
      const cap = Math.floor(autres * (t === 0 ? RULES.majorationTranche1 : 1));
      if (montant > cap) {
        montant = cap;
        res.plafonnePar = "autresPrets";
      }
    }
    if (!res.plafonnePar && coutTotal > plafondOp) res.plafonnePar = "plafondOperation";

    res.montant = montant;
    const d = RULES.durees[t];
    res.differe = d.differe;
    res.remboursement = d.remboursement;
    res.dureeTotale = d.differe + d.remboursement;
    res.mensualite = Math.round(montant / (d.remboursement * 12));

    res.eligible = res.raisons.length === 0 && montant > 0;
    if (!res.eligible) res.montant = 0;
    return res;
  }

  root.calculerPTZ = calculerPTZ;
  if (typeof module !== "undefined") module.exports = calculerPTZ;
})(typeof window !== "undefined" ? window : globalThis);
