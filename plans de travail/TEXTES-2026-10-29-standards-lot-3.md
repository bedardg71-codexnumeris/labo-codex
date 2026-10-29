# Textes – Des standards sans portfolio, lot 3 : les Productions ne poussent plus vers une terminale (#1178)

> Proposés par Cowork, validés par Grégoire un à un, le 29 oct. 2026. **À intégrer mot pour mot** par le lot 3 (consigne à venir). Plan : `PLAN-2026-10-28-standards-sans-portfolio.md`, § 3, lot 3, et § 4.

## 1. L'encadré « À vérifier » des Productions, pratique Standards sans aucun artefact

✅ **Validé par Grégoire le 29 oct. 2026 à 8 h 52** (« on garde »). Remplace, quand la pratique n'a aucune production de type « Artefact », les avertissements des règles 3a et 5 de `validerProductionsStd` (`js/productions.js:~368-406` : « … n'entre pas dans le calcul STD : seuls le pool d'artefacts et l'évaluation terminale comptent » ; « Choisis laquelle est l'évaluation terminale… »), devenus faux depuis le lot 1. Une seule ligne. Avec des artefacts, l'encadré ne change pas.

> Sans aucun artefact, la note se calcule à partir de toutes tes productions évaluées, sauf les diagnostiques, quels que soient leur type et leur pondération. Une évaluation terminale est facultative.

Preuve : la première phrase reprend le texte Standards de l'Aide validé le 29 oct. à 5 h 12 (`accordeon-aide-construction-note`) ; le pool sans condition de pondération, `obtenirArtefactsIdsPoolStd` (lot 1).

## 2. La définition du type « Évaluation terminale » (Productions)

✅ **Validé par Grégoire le 29 oct. 2026 à 8 h 53** (« on garde »). Remplace le texte de `'terminale'` dans les définitions des types (`js/productions.js:~2606`), le titre « Évaluation terminale : » en gras inchangé. L'aide est la même pour toutes les pratiques : l'explication du calcul ne vaut que pour les Standards.

> Production qui clôt le trimestre ; une seule par trimestre, et facultative. En PAN – Standards, elle entre dans le calcul avec sa pondération (par exemple 40 %), le reste allant aux artefacts du portfolio ou, sans artefact, aux productions retenues (par exemple 60 %).

Avant : « Production qui clôt la session et qui s'ajoute au portfolio dans le calcul de la note finale. Sa pondération est explicite (par exemple 40 %) et elle se combine au portfolio (par exemple 60 %) pour produire la note finale. Une seule production de ce type par trimestre. » Les « % » prennent l'insécable (#1137).
