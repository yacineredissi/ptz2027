# ptz2027.fr — simulateur de prêt à taux zéro

Site statique (HTML, CSS, JavaScript), sans serveur ni dépendance.

- `rules.js` : barème officiel du PTZ. C'est le seul fichier à modifier quand les règles changent.
- `calcul.js` : moteur de calcul (testable avec `node test.js`).
- `app.js` : interface du simulateur.
- `index.html`, `styles.css`, `mentions-legales.html` : pages du site.

Hébergement : Cloudflare Pages, déploiement automatique à chaque commit sur `main`.
