# Consigne suivante — les deux phrases de l'assiduité inconnue (suite du lot D, patch 1.147.1)

> Écrite le 19 septembre 2026 à 11 h 44 (Toronto), par Cowork. Phrases **validées par Grégoire** (« oui », 11 h 44).
> **Condition de départ** : `origin/main` = `085a14aa` ou plus récent. Archive `plans de travail/CONSIGNE-DU-JOUR.md` sous `_ancienne-CONSIGNE-DU-JOUR-2026-09-19-assiduite-qui-manque.md` et renomme ce fichier en `CONSIGNE-DU-JOUR.md`.
> ⚠ **Arbre partagé** : mêmes quatre fichiers de l'autre travail qu'aux deux lots précédents ; n'y touche pas, jeton d'`interpretation-config.js` à `20260910c`, index par chemins nommés.
> **Identifiant** : « Dernier ID utilisé » = #922 à l'écriture ; relis-le et `grep` les deux registres avant d'inscrire.
> **Ce lot ne demande plus rien à Grégoire**, sauf le « pousse ».

---

## 1 · Poser les deux phrases (mots de Grégoire, à ne pas retoucher)

Référence : §3 de `plans de travail/PORTES-TERRAIN-2026-09-19-date-arrivee-ipad.md`.

- **3.1 · Sous le tiret de la carte « Contexte d'apprentissage »** (copies, aucune assiduité connue) :
  « L'assiduité n'est pas encore connue : le contexte s'affichera dès qu'une séance sera saisie pour cet·te étudiant·e. »
  ⚠ C'est la proposition du §3.1 **avec une retouche** : « se qualifiera » → « s'affichera ».
- **3.2 · Bulle du badge « A — »** dans Suivi du groupe › Détails, telle que proposée :
  « Assiduité inconnue : aucune séance saisie ne compte encore pour cet·te étudiant·e. »

La porte iPad est **passée** (relevé de Grégoire, 12 h 01, 3 / 3, ajouté par Cowork en fin du fichier de la porte) : commite ce relevé avec le lot. Inscris au §3 de la porte les deux verdicts (« validée, retouchée : s'affichera » ; « validée telle quelle »). Preuve : le banc WebKit du lot D lit les deux textes à l'écran ; une mutation par texte, rouge. Patch `1.147.1` ; une ligne de « Nouvelles » n'est pas nécessaire (texte d'aide), c'est à toi de juger, en une ligne.

## 1 bis · Deux défauts de la liste du groupe, vus par Grégoire sur iPad (19 sept., 12 h 01, capture) – même patch

Cadre › Groupe d'étudiant·es, tableau rendu par `js/trimestre-v2-etudiants.js` (≈ l. 146-195), conteneur `#v2-listeEtudiants`.

- **Les deux menus de ligne affichent « — »**, qui ne dit rien. Mots **validés par Grégoire** (« oui », 12 h 10) : l'option vide du menu **Action** devient « Choisir… » ; l'option vide du menu **Remarque** devient « Aucune ». ⚠ Seul le libellé change : les valeurs restent `""` (Action : le menu doit rester sur une option neutre, sinon « Modifier » choisi d'avance ne déclencherait plus `change` ; Remarque : `""` veut dire « aucune remarque » et efface le statut). Le « — » des cellules vides (DA, Nom, groupe) ne change pas. Cherche si le même menu existe ailleurs (liste d'un autre écran, `groupe.js`) : même mot s'il est le même geste, sinon dis-le.
- **L'en-tête du tableau est illisible** : texte blanc sur bleu pâle (DA, Grp, Nom, Prénom, SA, Action, Remarque). Pourtant `styles.css` l. 9699 pose `.conteneur-liste-etudiants th { background: var(--bleu-pale); color: var(--bleu-fonce); }` : une autre règle gagne. **Mesure laquelle** au navigateur (style calculé, pas lecture), dans les deux modes et sous le thème du pack démo ; corrige à la source sans `!important`, avec un contraste d'au moins 4,5 mesuré dans les deux modes. Regarde si la même règle fautive blanchit d'autres en-têtes : si oui, nomme-les ; corrige-les dans ce lot seulement si c'est la même cause en une ligne, sinon inscris.
- Skill `design-interface` à charger. Preuve : un essai WebKit qui lit le libellé des deux options vides et le contraste calculé de l'en-tête ; une mutation par défaut, rouge. Aucune porte (le banc voit le contraste) ; aucune donnée écrite.

## 2 · Trouvailles de la relecture croisée de Cowork sur `7b128a66` — issue 2 (inscrire), sauf avis contraire mesuré

Relecture **verte par exécution** : Vitest 598 / 6 786 sur le clone ; cinq mutations de Cowork, cinq rouges, toutes à la sentinelle du lot D (le magasin d'avant lu comme inconnu ; séance du jour d'arrivée exclue par `<=` ; date ignorée dans la saisie en direct, sur les séances passées puis sur la séance courante ; format de date non validé) ; témoin vert après restauration. Aucun trou de preuve trouvé sur les règles.

Trois trouvailles, sans symptôme vécu :

- **R-a** · `js/graphiques-progression.js` ≈ l. 2670-2680 (distribution du groupe, courbe de Gauss) lit `indicesAssiduite.sommatif[da].indice` **sans passer par `lireIndiceAssiduite`** : une entrée du stock d'avant (`indice: 1, nombreSeances: 0`) y compte comme 100 % jusqu'au prochain recalcul du magasin ; et une entrée `null` rangée ferait `null.indice` (défaut antérieur). Le lot annonçait « tout lecteur du magasin passe par ici » : c'est un lecteur oublié **de ton propre lot** au sens du CLAUDE.md (« est-ce que je viens de l'écrire ? » — la règle, oui). ⮕ Juge toi-même : si le brancher sur `lireIndiceAssiduite` tient en deux lignes et un essai, fais-le dans ce patch ; sinon inscris. Note au passage que ce graphique exclut aussi `A = 0` (l'absent total), contraire à la règle de #750 : dis-le dans la fiche, ne le change pas sans mesurer où il s'affiche.
- **R-b** · `js/trimestres.js` l. 2341, export pour la recherche : la note `unites` dit que seul `P_final` peut valoir `null` ; `A_final` le peut maintenant aussi. Une phrase à compléter pour les chercheurs → même patch si c'est une chaîne, sinon inscrire.
- **R-c** · `js/profil-etudiant-sections-affichage.js`, `genererSectionMobilisation` (≈ l. 1586) : **aucun appelant** ; elle écrirait « null% » et « Assiduité critique » pour un A inconnu. Code mort antérieur au lot → issue 3 ou retrait (zéro-dette), à toi.

Et sur `a260acfc` (1.146.10, #906) : **relecture verte par lecture** – `calculerEtudiantsPrioritaires` ne touche pas au DOM (lu, l. 248-299), un seul appel par rendu, appelé hors de la garde `activerRai` comme avant ; le verdict Playwright du push a couvert le banc neuf. Pas de mutation reposée par Cowork (banc WebKit hors de sa portée).

## 3 · Rapport

Les deux textes vus à l'écran par le banc, la version, les issues données à R-a, R-b, R-c avec leur numéro, et la liste des chemins à commiter. Mets à jour `OU-EN-EST-ON.md` et `RELAIS.md`. Push sur « pousse » de Grégoire.
