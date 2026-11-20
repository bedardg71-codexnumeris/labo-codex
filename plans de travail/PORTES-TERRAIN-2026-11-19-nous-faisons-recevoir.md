# PORTES TERRAIN — « Recevoir les productions, rendre tes rétroactions », « Nous faisons » (lot `lot/nous-faisons-recevoir`, 19 au 20 nov. 2026)

> Markdown seul (la trace). **Cowork la relit avant d'en publier l'artefact** (bouton « Copier mes résultats »).
> Règle 1 : une porte n'existe que si aucune machine ne peut répondre. Les mots, la confirmation présente ou absente, le
> genre de chaque ligne, les deux formes des bulles 4 et 6 sans fichier, la fin et ses boutons : jugés sous Chromium, aux
> deux tailles de l'iPad (`tests/integration/nous-faisons-recevoir-2026-11-19.spec.js`,
> `tests/unit/sentinelle-parcours-recevoir-2026-11-09.test.js`). Restent Safari sur l'iPad, et l'œil.
> Règle 2 : rien ici n'écrit dans tes vraies données ; l'aperçu est une adresse à part.
> Ce qui échoue devient un item de backlog, pas une note mentale.

## §0 · Préalable

- [ ] **0.1** Sur l'iPad, ouvre l'adresse de l'aperçu (PR « APERÇU, ne pas fusionner » du lot, lien au rapport, § 7).
      Recharge. ⮕ Attendu : le numéro en bas de page est **1.250.0**.
- [ ] **0.2** Fais d'abord « Mettre ta classe en place » et « Évaluer une première production » dans l'aperçu (le
      parcours en a besoin : une production avec sa grille, son échelle et sa cartouche).
      ⮕ Attendu : dans Assistance, « Recevoir les productions… » offre « Nous faisons ».

## §2 · Interface (iPad, Safari)

### 2.1 La bulle 5 grise ses gestes quand tu annotes

┌ POURQUOI ─────────────────────────────────────────────────────────────
│ Les lignes « Annote la production » et « Pose tes tampons… » se cochent quand la production porte une marque, puis un
│ tampon. Le banc trace à la souris ; au doigt et au stylet, seul l'iPad le dit.
└──────────────────────────────────────────────────────────────────────

- [ ] À la bulle 5, trace un trait au stylet sur la production.
      ⮕ Attendu : « Annote la production » passe de la flèche au crochet.
      `iPad`
- [ ] Pose un tampon.
      ⮕ Attendu : « Pose tes tampons… » passe au crochet.
      `iPad`

### 2.2 La bulle 9 de l'aperçu

┌ POURQUOI ─────────────────────────────────────────────────────────────
│ « Monter ton cours » est fermé dans l'aperçu : la dernière bulle n'offre que « Terminer » (mesuré au banc).
└──────────────────────────────────────────────────────────────────────

- [ ] Va jusqu'à « Remets-les ».
      ⮕ Attendu : un seul bouton, « Terminer », et la dernière ligne « Touche « Terminer » ».
      `iPad`

## §3 · Décisions (ce ne sont pas des vérifications : écris ta réponse)

- **3.0** La bulle 2 (« Vérifie avant d'importer »), plus haute, ne tient plus sous les trois colonnes : elle cache
  « Importer » tant que la production n'est pas choisie. (a) On garde (le contour passe sur « Importer » ensuite) ;
  (b) une bulle plus courte (tes mots) ; (c) une autre place. Réponse : ______________________
- **3.1** #1299 : l'étape « Évaluer » peut avancer seule, un instant après l'ouverture, quand la copie précédente évaluée
  avait déjà ses niveaux (mesuré une fois sur trois au banc). Une garde plus longue (l'étape avance environ une seconde
  après ton dernier niveau), ou ne compter que les niveaux choisis dans l'étape ? Réponse : ______________________
- **3.2** Sans fichier, la bulle « Ta rétroaction » ne peut pas montrer le titre « Rétroaction » (la page le cache) : sa
  flèche va à la section elle-même, qui est plus bas que l'écran à l'ouverture. À garder ? Réponse : ______________________

## §4 · Ce que je n'ai pas pu vérifier

- **Safari (WebKit)** : rien de ce lot n'a tourné sous WebKit dans le conteneur ; GitHub le juge au push (WebKit Linux).
- **Le stylet et le doigt** (2.1) : le banc trace à la souris.
- **La consigne de la bulle 6** paraît cochée moins de 300 ms à l'ouverture (mesuré à 1180 × 820) : à l'œil, on peut le
  voir passer.
