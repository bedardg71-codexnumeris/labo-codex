# Consigne du jour – #888 : le mot « pér. » reste visible à côté d'une case Périodes remplie (Cadre › Horaire)

> Écrite le 25 septembre 2026, vers 17 h 55 (Toronto), par Cowork, sur `origin/main` = `37baafa1` (1.159.9 en ligne, constatée chez Netlify). **À remesurer avant tout code.**
> La précédente (#583 + #680, livrée en 1.159.9) est archivée sous `plans de travail/_ancienne-CONSIGNE-DU-JOUR-2026-09-25-lot-583-680-partage-echelle.md` (déplacée par Cowork, à commiter avec ce lot).
> Lot choisi par Grégoire le 25 sept., 17 h 53. Au passage : **F4-2 est tranchée** (« laisser tel quel », 25 sept., 17 h 50), consignée par Cowork dans `FILE-DES-LOTS.md` ; aucun lot.

## 0 · La décision de Grégoire (17 sept. 2026, 13 h 32) – elle fait foi

Source : `plans de travail/DECISIONS-2026-09-17-apres-midi.md`, et la ligne « TRANCHÉ » sous #888 dans `BACKLOG.md`.

- **Le mot « pér. » reste affiché à côté de la case**, en gris, hors du champ, une fois le nombre saisi. La rangée se lit « 08:00 à 10:00 · 2 pér. · Local ».
- Écartés : une ligne d'en-têtes au-dessus des séances ; l'étiquette complète « Périodes » dans la rangée.
- Critère retenu par lui : **n'ajouter ni rangée ni largeur**, donc aucune porte terrain.

Pourquoi ça compte : ce nombre est le dénominateur de l'assiduité. Aujourd'hui, une fois rempli, rien à l'écran ne dit ce qu'est ce « 2 » ; seul un `title` au survol le dit, et il n'existe pas sur iPad.

## 1 · Ce que Cowork a lu (lecture seule, sur `37baafa1` – non exécuté)

- Gabarit : `js/trimestre-v2-horaires.js` ≈ l. 1091-1102, `.seance-horaire-ligne`. La case est `<input type="number" id="v2-hor-seance-${i}-periodes" … placeholder="pér." title="Nombre de périodes de cette séance">`, enfant direct de la rangée.
- Grille : `styles.css` ≈ l. 10234, sept colonnes, **72 px** pour les périodes (`auto minmax(110px,1fr) 124px auto 124px 72px minmax(90px,130px)`), champs à 44 px de haut (minimum tactile). Sous 720 px : deux colonnes, et une règle vise `.seance-horaire-ligne > span` (le « à », masqué).
- Sentinelle : `tests/unit/sentinelle-ui-rapport-et-seances.test.js` compte les champs du gabarit.

## 2 · Ce qui est attendu

1. Le mot « pér. » visible en permanence à droite de la case, en gris (couleur atténuée existante, pas de couleur neuve), **dans la colonne actuelle**. À toi de trancher si 72 px suffisent pour la case (valeur 1 à 8, lisible, 44 px de haut) et le mot ; s'ils ne suffisent pas, dis-le avant d'élargir quoi que ce soit : la décision de Grégoire exclut une largeur ajoutée, et c'est à lui de la rouvrir.
2. Si tu enveloppes la case et le mot dans un conteneur : attention à la règle `> span` sous 720 px (ne pas masquer le mot) et à la sentinelle (ajuste-la pour qu'elle continue de protéger ce qu'elle protège, sans la desserrer).
3. Le `placeholder` « pér. » devient redondant à côté du mot visible : garde-le ou retire-le, à ton choix, et dis-le en une ligne. Le `title` reste.
4. Le mot est associé à la case pour un lecteur d'écran (le `aria-describedby`, ou un `<label>` englobant – ton choix).

## 3 · Preuves attendues

- Un banc WebKit : rangée remplie (« 2 »), le mot « pér. » visible (rectangle non nul, à droite de la case, dans la rangée), à 1180 px et à 820 px de large (iPad Air paysage et portrait), et sous 720 px. Le local reste sur la même rangée à 1180 px (régression de #886 / #540).
- Mutation : retirer le mot → le banc rougit.
- Suite complète Vitest ; captures avant / après jointes au rapport.

## 4 · Hors lot, à ne pas toucher

- Le calcul des périodes et de l'assiduité.
- Les six boutons « + Nouveau… » du Cadre (#879).

## 5 · Livraison

- Correctif (patch). **Pas de relecture croisée obligatoire** : rien ici ne se reprend mal (aucune donnée, aucun calcul, aucun échange entre enseignants). Commit, verdict, push dans l'ordre habituel.
- **Nouvelles, proposition de Cowork, à soumettre à Grégoire avant le push** : « Horaire : dans une séance, le mot «&nbsp;pér.&nbsp;» reste affiché à côté du nombre de périodes, même une fois la case remplie. »
- **Pas de porte terrain** (critère de Grégoire du 17 sept.). Un coup d'œil de Grégoire à l'écran, en ligne, suffit : Cadre › Horaire, une séance remplie.
- Fin de lot : sortir #888 de `FILE-DES-LOTS.md` (ligne 1 du haut) et cocher la fiche.
