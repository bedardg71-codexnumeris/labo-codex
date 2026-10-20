# Consigne – SOLO suit le réglage, les corrections de la relecture (#1117, suite)

> Écrite par Cowork le mardi 20 octobre 2026 à 6 h 50 (Toronto, mesuré par `date`), sur `main` à `e47c6e50` (non poussé). Répond au verdict `VERDICT-RELECTURE-2026-10-19-solo-suit-le-reglage.md` : C1, C2, C3. Décisions de Grégoire : 19 oct., 22 h 21 (C1) ; 20 oct., 6 h 48 (C2). **Aucune porte terrain** : une machine répond à tout ce qui suit.

## Ce que l'enseignant voit à la fin de ce lot

RàI activé, observation SOLO désactivée, une grille de dépistage faite par « Apporter mon matériel » (tous ses critères à « Aucun ») :
- au tableau de bord, la barre du suivi des fondations surveille **tous** les critères de la grille, et le dit : « Observation SOLO désactivée : tous les critères sont surveillés (Analyse, Rédaction, Langue). » (texte provisoire ; seule la phrase est fixe, les noms entre parenthèses sont ceux des critères de la grille, échappés, comme aujourd'hui) ;
- le profil d'un élève lui trouve ses défis, comme avant la dissection en « Aucun » ;
- au survol du niveau atteint, plus aucun palier SOLO ni invitation à en poser.

Observation SOLO **activée** : rien ne change, à la lettre. C'est le cas de Grégoire.

## Ce qu'il faut

**C1 – Les défis (décision de 22 h 21).** SOLO désactivé, le dépistage examine tous les critères sans lire leur étiquette ; « Aucun » n'exclut que si SOLO est activé. Le lieu : `estCritereSurveilleParDepistage` (`profil-etudiant-helpers.js`, l. 905), la règle unique, que lisent `criteresSurveillesParDepistage` et `trouverCritereDepistage` (`profil-etudiant-calculs.js`, l. 879). Elle reste unique : pas de garde par site.

**C2 – Le suivi des fondations (décision de 6 h 48 : A, « mais l'application doit le dire quelque part »).**
1. `calculerIPB` (`profil-etudiant-calculs.js`, l. 1146) : SOLO désactivé, tous les critères ; activé, les multistructurels seulement, comme aujourd'hui.
2. Le sous-titre de la barre (`libelleCriteresMultiSurveilles`, `tableau-bord-apercu.js`, l. 2299-2304) recopie aujourd'hui le filtre de `calculerIPB`. Les deux lisent désormais **la même règle** : ce que la barre annonce est ce que le calcul lit. SOLO désactivé, il rend : « Observation SOLO désactivée : tous les critères sont surveillés (…). »
3. La phrase du bilan (l. 1448, « maîtrise les fondamentaux multistructurels ») perd « multistructurels » SOLO désactivé. Tout autre texte du tableau de bord ou du profil qui nomme « multistructurel » et s'affiche case décochée suit la même règle (`grep -n -i multistructurel js/`).
4. Textes provisoires, listés dans la demande : Grégoire les verra avec la version.

**C3 – Les survols du profil.** `lireNiveauNoteGlobale` (`profil-etudiant-helpers.js`, l. 645-660) compose le survol du niveau atteint avec `interpreterNiveauAtteint` ; même lecture par critère (`profil-etudiant-sections-affichage.js`, l. 1242). Rendus hors de la carte SOLO, ils ne lisent pas la préférence. Case décochée : pas de palier SOLO, et pas non plus le message « Pour obtenir une interprétation en termes de taxonomie SOLO, associe une étiquette SOLO… » (l. 372-374) : il renvoie à un champ que #1117 vient de masquer. Le survol porte le nom du niveau.

**La sentinelle #1117.** Son cas « `calculerIPB` ne lit pas le réglage » gardait la consigne d'hier ; la décision de 6 h 48 la renverse. Adapte-le et dis-le dans la demande.

**Le stock.** Les patterns sont enregistrés par élève (`indicesPatternsRaI`, lu par `obtenirPatternEtudiant`, `profil-etudiant-actions.js`, l. 752). Mesure s'ils sont recalculés au prochain affichage ou s'ils gardent l'ancienne lecture, et dis-le. N'y écris rien toi-même (`CLAUDE.md`, « tarir n'est pas réparer »).

## Les bancs

- **Vitest** : la règle des défis dans les deux états ; `calculerIPB` dans les deux états, SOLO activé **identique à avant** ; le sous-titre et la phrase du bilan dans les deux états ; les deux survols dans les deux états ; une grille tout « Aucun » choisie pour le dépistage, SOLO désactivé → des défis trouvés et un IPB calculé.
- **WebKit**, un cas : RàI activé, SOLO désactivé, grille de dépistage tout « Aucun » → la barre affiche la phrase et les critères.
- **Break-test** : la lecture de la préférence retirée de la règle des défis, puis de celle de l'IPB → rouge chaque fois. Code restauré.
- Vitest complet vert. Le verdict complet tourne ce soir.

## Ce qu'il ne faut pas

- Écrire dans un `niveauSOLO`, dans `indicesPatternsRaI`, ou dans aucune donnée.
- Changer quoi que ce soit quand SOLO est activé.
- Toucher la note finale.
- Le verdict complet, un numéro de version, le push.

## Livrer

1. **D'abord, un commit de documentation**, par chemin : `plans de travail/VERDICT-RELECTURE-2026-10-19-solo-suit-le-reglage.md`, `plans de travail/PLAN-2026-10-19-bareme.md`, `plans de travail/RAPPORT-2026-10-19-premiere-verification-github.md`.
2. **Puis le lot** : un commit sur `main`, non poussé, avec cette consigne, le BACKLOG (fiche #1117 : la suite livrée et sa phrase « vérifié comment »), les bancs, et la demande courte `plans de travail/DEMANDE-RELECTURE-2026-10-20-solo-suit-le-reglage-corrections.md`. Ajoute les fichiers par leur chemin, jamais `git add -A` : d'autres fichiers non suivis dorment dans `plans de travail/`.

**Puis arrête-toi.**
