# Consigne – la dissection, lot 2b : créer sa grille en niveaux

> Écrite par Cowork le dimanche 18 octobre 2026 à 8 h 44 (Toronto, mesuré par `date`). Plan : `PLAN-2026-10-18-la-dissection-pour-lundi.md`, étape 2, seconde moitié. Le lot 2a (`903e7706`, corrigé en `0ba1be2d`) est relu et accepté. Règles 2 et 7 de `PROTOCOLE.md`.

## Ce que l'enseignant fait à la fin de ce lot

Sa grille porte des niveaux nommés. Sous la lecture, un petit tableau « ce que vaut chaque niveau », une rangée par niveau : son nom, tel qu'il l'a écrit, puis trois champs vides, « de … à … % » et « note retenue … % ». Il les remplit, nomme sa grille, touche « Créer ma grille » : son échelle et sa grille sont rangées, et la confirmation qu'il connaît s'affiche. Si sa grille a aussi des points, rien ne change pour lui par défaut (points, lot 2a) ; un choix lui permet de compter par niveaux, et alors seulement le tableau paraît.

## Les décisions de Grégoire qui gouvernent ce lot

- 7 h 31 : quand la grille a des points, le résultat d'une copie vient **des points, par défaut** ; l'enseignant peut choisir les niveaux, et seulement alors l'application lui demande une valeur par niveau. Ses noms de niveaux restent les titres des descripteurs.
- **8 h 43** : pour chaque niveau, l'application demande **la plage de pourcentages et la note retenue, champs vides, rien de proposé** (sa règle du 17 pour l'assistant, étendue à la plage). Motif : la plage situe un résultat dans un niveau et s'imprime sur le PDF des étudiant·es (`export-pdf.js`) ; aucune borne que l'enseignant n'a pas choisie.
- L'application ne convertit jamais une logique en l'autre sans l'enseignant.

## Ce que Cowork a mesuré (à remesurer)

- `construire` sait déjà écrire une grille en niveaux : `construireEchelle` (niveaux `code`, `nom`, `min`, `max` rendus contigus par `plagesContigues`, `valeurCalcul` = la note SAISIE, couleurs de l'éditeur), `construireGrille` (critères holistiques, descripteurs `{ echelleId, parNiveau }` aux codes), pas de cartouche hors rétroactions. `creer` écrit l'échelle puis la grille, et défait en cas d'échec.
- `calculs(m).manquants` dit déjà, en mots, une plage invalide, une note retenue absente, un code fautif, plus de 20 niveaux ; `avertissementPlages` dit des plages qui se chevauchent ou laissent un trou. Réutilise-les tels quels.
- `materielLecture.coder` tire des codes uniques des noms de niveaux : réutilise-le (les codes se corrigent ensuite dans Échelles).
- La confirmation existante d'une grille en niveaux liste les niveaux avec leurs plages (`resumer`).

## Ce qu'il faut

1. **Le choix, seulement pour la logique « les deux »** : « Le résultat d'une copie viendrait : des points / des niveaux », « des points » coché. Une grille seulement en niveaux n'a pas de choix : le tableau paraît d'emblée, et la ligne « arrive bientôt » du lot 2a disparaît. Textes provisoires.
2. **Le tableau des niveaux** : une rangée par niveau, dans l'ordre lu, le nom tel qu'étiqueté ; trois champs **vides**, aucune valeur proposée ni calculée, même quand des points sont écrits par niveau. Saisie décimale (`inputmode="decimal"`, virgule acceptée comme `materielAssistant.nombre`), cibles d'au moins 44 px, texte d'au moins 16 px, `id` stables. Ce qui est saisi vit dans la page, avec les étiquettes : « Coller une autre grille » le perd avec la même confirmation (C2 du lot 1).
3. **Le modèle** : la lecture et le tableau donnent le modèle non-points de `construire`. Descripteurs par niveau, joints comme au lot 2a ; s'il y a des points écrits par niveau, la ligne des points sous le descripteur reste (rien ne disparaît) ; nature « descripteurs », donc ni cartouche ni rétroaction. Sections, critères à nommer, sous-critères, descriptions, nom de la grille : comme au lot 2a.
4. **La pondération en niveaux** : la pondération écrite, sinon celle tirée des points, sinon les parts égales de `materielLecture.partsEgales` (la règle de la 1.203). **Mesure d'abord** comment `evaluation-calcul.js` compose la note d'une grille en niveaux dont les pondérations ne totalisent pas 100 : si la note les rapporte à leur somme, reprends-les telles quelles ; sinon, n'écris pas ce cas, arrête-toi sur ce point et rapporte la mesure. Aucune conversion de points en pourcentages décidée par toi.
5. **Les refus**, à côté du bouton, comme au lot 2a : les `manquants` (plage, note retenue, codes, nombre de niveaux), les avertissements de plages tels quels, et ceux du lot 2a (nom, morceaux sans place).
6. **Les bancs.** Vitest : (a) en niveaux, avec plages et notes saisies → l'échelle (niveaux, codes, plages contiguës, `valeurCalcul` saisies) et la grille (descripteurs aux codes, `echelleId`) ; (a) reste en points par défaut ; une grille fictive seulement en niveaux (forme neuve, sans points) ; (c) en texte brut avec niveaux ; chaque refus ; aucun champ prérempli. WebKit : l'exemple, « des niveaux » choisi, le tableau rempli par les événements DOM, créé, puis l'échelle retrouvée dans Échelles et la grille dans Grilles de critères ; à 820 px, pas de défilement de côté. Break-tests : un champ prérempli, le choix ignoré (les niveaux créés alors que « des points » est coché).

## Ce qu'il ne faut pas

- Proposer ou calculer une plage ou une note retenue (décision de 8 h 43).
- Modifier un objet existant ; rien n'est effacé.
- Une cartouche : plus tard. Aucune zone protégée ; pas de numéro de version (étape 4).

## Livrer

Un commit sur `main` ; Vitest complet vert ; les specs `materiel-*` et celles touchées vertes dans WebKit ; la demande de relecture courte `plans de travail/DEMANDE-RELECTURE-2026-10-18-dissection-2b.md` : la mesure du point 4, ce que tu as réutilisé, les textes d'écran neufs (inventaire de l'étape 3), ce que tu as supposé. **Puis arrête-toi.**
