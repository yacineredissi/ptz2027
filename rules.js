/*
 * Barème du prêt à taux zéro (PTZ) — règles en vigueur pour les offres émises
 * depuis le 1er avril 2025, dispositif prorogé jusqu'au 31 décembre 2027
 * (article 90 de la loi de finances 2025). Barème inchangé en 2026.
 *
 * Sources : service-public.gouv.fr (fiche F10871, vérifiée le 15/09/2026),
 * articles D31-10-2 et suivants du Code de la construction et de l'habitation.
 *
 * Pour mettre à jour le barème, ne modifier que ce fichier.
 */
const PTZ_RULES = {
  version: "Barème 2026 — offres émises depuis le 1er avril 2025",
  finDispositif: "31 décembre 2027",

  zones: ["A", "B1", "B2", "C"], // la zone A bis suit le barème de la zone A

  // Recherche de la zone par code postal (APIs publiques de l'État) :
  // - communes d'un code postal : geo.api.gouv.fr
  // - zonage ABC officiel par commune : jeu de données data.gouv.fr
  //   « Liste des communes selon le zonage ABC » (version en vigueur au 26 juin 2026).
  //   Quand une nouvelle version est publiée, remplacer l'identifiant de ressource.
  zonageResourceId: "13f7282b-8a25-43ab-9713-8bb4e476df55",

  // Plafonds de ressources (revenu retenu) par zone et nombre de personnes (1 à 8+)
  plafondsRessources: {
    A:  [49000, 73500, 88200, 102900, 117600, 132300, 147000, 161700],
    B1: [34500, 51750, 62100, 72450, 82800, 93150, 103500, 113850],
    B2: [31500, 47250, 56700, 66150, 75600, 85050, 94500, 103950],
    C:  [28500, 42750, 51300, 59850, 68400, 76950, 85500, 94050],
  },

  // Coefficient familial (1 à 5+ personnes)
  coefficientFamilial: [1, 1.5, 1.8, 2.1, 2.4],

  // Bornes hautes des tranches 1 à 3 (revenu retenu ÷ coefficient familial).
  // Au-delà, et tant que le plafond de ressources est respecté : tranche 4.
  tranches: {
    A:  [25000, 31000, 37000],
    B1: [21500, 26000, 30000],
    B2: [18000, 22500, 27000],
    C:  [15000, 19500, 24000],
  },

  // Plafond du coût de l'opération pris en compte (1 à 5+ personnes)
  plafondsOperation: {
    A:  [150000, 225000, 270000, 315000, 360000],
    B1: [135000, 202500, 243000, 283500, 324000],
    B2: [110000, 165000, 198000, 231000, 264000],
    C:  [100000, 150000, 180000, 210000, 240000],
  },

  // Quotités par tranche (1 à 4)
  quotites: {
    neuf_collectif:   [0.50, 0.40, 0.40, 0.20],
    neuf_individuel:  [0.30, 0.20, 0.20, 0.10],
    ancien_travaux:   [0.50, 0.40, 0.40, 0.20],
    social:           [0.50, 0.40, 0.40, 0.20], // PSLA, BRS, accession sociale
  },

  // Durées en années par tranche : différé (0 € à rembourser) puis remboursement
  durees: [
    { differe: 10, remboursement: 15 },
    { differe: 8,  remboursement: 12 },
    { differe: 2,  remboursement: 13 },
    { differe: 0,  remboursement: 10 },
  ],

  // Revenu retenu = max(revenu fiscal de référence N-2, coût total ÷ 9)
  diviseurCout: 9,

  // Ancien : zones admises et part minimale des travaux dans le coût total
  ancienZones: ["B2", "C"],
  ancienPartTravauxMin: 0.25,

  // Le PTZ ne peut dépasser le montant des autres prêts de plus de 2 ans
  // (majoré de 25 % en tranche 1)
  majorationTranche1: 1.25,
};

if (typeof module !== "undefined") module.exports = PTZ_RULES;
