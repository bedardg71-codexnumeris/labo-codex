# Consigne suivante – les règles spéciales de la sommative s'appliquent, et quatre phrases de l'Aide disent vrai (lot 29 : A-1, A-2, C-1, C-2, C-3, C-6 de l'audit du 16 sept.)

> Écrite le 17 septembre 2026, 8 h 48 (Toronto), pendant le lot 28 (pratiques de notation, `1.142.24`).
> **À n'exécuter qu'après le push du lot 28** : mêmes fichiers. Au démarrage, `git log` doit montrer `1.142.24` ; sinon, arrête-toi et signale-le. Puis archive `plans de travail/CONSIGNE-DU-JOUR.md` sous `_ancienne-CONSIGNE-DU-JOUR-2026-09-17-pratiques-de-notation.md` et renomme ce fichier en `CONSIGNE-DU-JOUR.md`.

Mandat : **tranché par Grégoire le 17 sept. vers 8 h 45 : « brancher »** les règles spéciales que l'assistant promet pour une pratique sommative (constat A-1 de `Rapports/AUDIT-pratiques-notation-configuration-et-discours-2026-09-16.md`), **à la condition que A-2 parte dans le même lot**. Le lot 28 les a inscrits : A-1 est **#897** (à cocher à la livraison) ; A-2 est rangé sous #854 (à cocher ou à annoter, selon ce qui y reste).

## 1 · Brancher (A-1)

- L'assistant écrit `configuration.conditions_speciales` (verrou « doit être réussie », plafonnement), `configuration.remplacement` et `configuration.reprises` ; le moteur ne lit que `calcul_note.conditions_speciales` (4 sites de `pratique-configurable.js`). **Fais lire au moteur ce que l'assistant écrit**, `construireConfigComplete` d'abord (`pratique-registre.js`).
- Preuve de l'audit : verrou « Dissertation < 90 → max 50 », Dissertation à 84 → la note passe de 87,43 à 50, au profil ET à l'export (celui-ci disait « 88 final »).
- Mesure les trois règles (verrou, plafonnement, remplacement), et les reprises. Celle que le moteur ne sait pas appliquer : ne l'invente pas, *inscris-la*, et nomme ce que l'assistant en promet encore.

## 2 · La condition de Grégoire : rouvrir ne change pas une règle (A-2)

- `chargerPratiqueExistante` restaure `nbPairesRemplacement`, `nomEvalVerrouillee`, `seuilVerrou`, `plafondVerrou`, `conditionPlafonnement`, `valeurPlafonnement`. Diff de réédition vide, comme STD et DEN (mesure A1 de l'audit : 3 → 2, Dissertation/90/50 → Analyse finale/60/55, « Examen non remis »/50 → ''/55).
- ⛔ **Si A-2 ne part pas, A-1 ne part pas** : une règle appliquée qui change à l'insu de l'enseignant quand il rouvre sa pratique est pire que la promesse non tenue d'aujourd'hui. Rapporte alors à Cowork.

## 3 · Cinq textes choisis par Grégoire (C-1, C-2, C-3, C-6 de l'audit, et #899), le 17 sept. vers 8 h 45 – à poser telles quelles

- **C-1** · récapitulatif de l'assistant, `wizard-pratique-v2.js` (vers 2020) : le libellé de la variante `n-meilleurs` devient **« Par artefacts »** (sans parenthèse). La méthode ne se dit qu'à « Construction de la note ». Vérifie qu'aucun autre lecteur de ce libellé n'attend la parenthèse.
- **C-2** · `guides-pedagogiques.js` : le titre (vers 326) devient **« La dénotation : une PRÉN »** ; l'encadré (vers 329) devient **« <strong>Statut dans Labo Codex.</strong> La dénotation est disponible : l'assistant de création la propose, et le jugement sur chaque cible se saisit dans le profil de l'élève. »** (typographie du fichier : espaces insécables comme ailleurs). Remesure que les deux affirmations sont vraies à la livraison.
- **C-6** · `guides-pedagogiques.js` (vers 140) : la première phrase devient **« L'indice P est la note courante de l'étudiant·e, calculée selon la pratique de notation active (Standards, Spécifications, Dénotation ou Sommative). »** La suite du paragraphe ne change pas.
- **C-3** · glossaire, `accompagnement-contenu-terme.js` (vers 418, terme « PAN — Pratique Alternative de Notation ») : la première phrase de la définition (« Terme générique qui regroupe les pratiques STD, SPE et DEN — toutes les approches… traditionnelle. ») devient **« Terme qui désigne les pratiques Standards (STD) et Spécifications (SPE). La Dénotation (DEN) est une PRÉN ; l'application lui donne aussi le badge « PAN » par commodité. »** La phrase suivante (« Dans le contexte PAN, les productions… ») ne change pas. Choisi par Grégoire vers 8 h 50.
- **#899** · récapitulatif de l'assistant pour une pratique par spécifications (`wizard-pratique-v2.js`, vers 2173, là où s'écrit « Grille : À configurer plus tard ») : ajoute, pour SPE seulement, la ligne **« <strong>Types de productions et forfaits :</strong> à régler après la création, dans Conception › Pratiques de notation (clique sur la pratique). Tant qu'ils manquent, aucune note ne peut être calculée. »** Choisi par Grégoire vers 8 h 55 ; écarté : collecter les tables dans l'assistant (un second écrivain). **Remesure que le chemin est exact** (nom de la section, clic sur la pratique dans la liste, titres « Types de productions » et « Table des forfaits (bundles) ») ; s'il ne l'est pas, rapporte à Cowork au lieu d'ajuster la phrase. Si les types ET les forfaits sont déjà présents (réédition), la ligne ne paraît pas. #899 se coche à la livraison.
- Un banc lit les cinq textes dans le code livré (et l'absence des anciens). **#901** se coche à la livraison : ses quatre phrases sont tranchées.

## 4 · À écrire au backlog, sans code dans ce lot

- Sous **#898**, telle quelle : « ✅ **TRANCHÉ par Grégoire le 17 sept. 2026, vers 8 h 50** : l'adoption d'un modèle Standards sans échelle DEMANDE l'échelle. Texte choisi : **« Ce modèle a besoin d'une échelle de performance pour calculer la note. Choisis-la : »**, suivi de la liste des échelles du trimestre et du bouton **« Adopter »**. Écarté : fixer une échelle dans le gabarit (ne vaut que dans les espaces qui la portent ; choix pédagogique). Lot à part, après le 29 : porte terrain probable (iPad). »

## Preuve

- Une sentinelle : les règles écrites par l'assistant sont relues à l'identique et calculent (verrou, plafonnement, remplacement), au profil et par `simulerIndices` (l'export).
- Break-test : verrou non branché ; chacun des six champs non restauré ; plafonnement lu sous le mauvais nom. Cowork en posera d'autres.
- Le parcours WebKit E-SOM de l'audit : export 50 avec le verrou coché.
- **Aucune autre phrase neuve** que celles de la section 3. Si une phrase de l'assistant ou du Comparateur devient fausse, rapporte-la à Cowork (`construction-attributs.js:251`, « Actif (une évaluation doit être réussie) », devient vraie).
- **Stock** : une pratique sommative déjà créée avec ces règles voit sa note changer à la livraison. Mesure s'il en existe dans les données d'essai ; la phrase de « Nouvelles » proposée à Grégoire le dit.
- Vitest depuis `tests/`, puis le verdict Playwright, Cowork fermé. **Porte terrain : aucune attendue.**

## Livraison

Patch `1.142.25` par `scripts/release.mjs`. Phrase de « Nouvelles » : propose-la à Grégoire avant de la figer. Puis `OU-EN-EST-ON.md`, `RELAIS.md`, les fiches, le markdown du tri. Commite aussi les fichiers de Cowork : la consigne renommée et son archive, `plans de travail/CADRAGE-2026-09-16-regles-du-depistage.md` (tranchages du 17 au matin), `CONSIGNE-DEMARRAGE-COWORK.md`, et les lignes « ✅ MOT(S) CHOISI(S) … 17 sept. » sous #744, #745 et #735 dans `BACKLOG.md` si le lot 28 ne les a pas déjà commitées. Push par `scripts/pousser.sh`, puis signale à Cowork que c'est poussé.
