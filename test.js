const assert = require("assert");
const calc = require("./calcul.js");
const t = (input, montant, tranche) => {
  const r = calc(input);
  assert.strictEqual(r.montant, montant, JSON.stringify(input) + " → " + r.montant);
  if (tranche) assert.strictEqual(r.tranche, tranche);
};
t({ operation: "neuf_collectif", zone: "A", personnes: 2, rfr: 40000, prix: 300000 }, 90000, 2);
t({ operation: "neuf_individuel", zone: "B1", personnes: 4, rfr: 55000, prix: 280000 }, 56000, 3);
t({ operation: "ancien_travaux", zone: "C", personnes: 1, rfr: 20000, prix: 120000, travaux: 40000 }, 40000, 3);
t({ operation: "ancien_travaux", zone: "A", personnes: 1, rfr: 20000, prix: 120000, travaux: 40000 }, 0);
t({ operation: "neuf_collectif", zone: "A", personnes: 1, rfr: 20000, prix: 500000 }, 0);
t({ operation: "neuf_collectif", zone: "B1", personnes: 2, rfr: 20000, prix: 200000, autresPrets: 50000 }, 62500, 1);
console.log("Tous les tests passent.");
