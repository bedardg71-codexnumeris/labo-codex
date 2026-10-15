# Consigne de lot – la production diagnostique : la case ne se reporte plus, et un diagnostic ne se lit jamais comme une production ordinaire (#1055)

> Écrite par Cowork le 15 octobre 2026 à 14 h 02 (Toronto, mesurée par `date`).
> Ce fichier ne remplace ni `CONSIGNE-DU-JOUR.md` ni `CONSIGNE-LOT-2026-10-15-mots-equipes-textes.md` : n'y touche pas. Commite-le avec ton lot.

## Où on en est

`main` à `8532dfe0` au moment de l'écriture : le lot des mots, des équipes et des textes est commité et attend la relecture de Cowork, qui se fait en parallèle de ce lot. **Remesure avant de toucher.** Si la relecture du lot des mots demande une correction, elle passe avant la suite de ce lot-ci, dans un commit à part. L'observation s'écrit sous `plans de travail/observation/` : n'y touche pas.

Skills : `labo-codex`, `pratiques-notation` (calcul de la note), `depistage-rai` (la porte 4), `design-interface` (la marque), `verification-adverse`.

## Ce que Grégoire a dit (15 oct. 2026, 14 h 00), ses mots

« Si l'enseignant décide qu'une production est un diagnostic, il ne faudrait pas que les résultats de ce diagnostic apparaissent dans la compilation des notes de l'élève, ou dans les graphiques de complétion, ou dans l'évolution de la progression étudiante dans le profil. Il faut vraiment, si c'est un diagnostic, qu'elle soit vue et lue autrement qu'une production ordinaire. »

C'est la règle du 7 septembre (`js/entites/production-diagnostique.js`, les quatre portes ; `CADRAGE-2026-09-07-depistage-du-francais-semaine-1.md`), redite et élargie : au-delà des quatre portes, AUCUNE surface qui compile, compte ou trace le parcours d'un élève ne lit un diagnostic comme une production ordinaire, l'historique compris. Ce qui ne change pas : « on lui retire son poids, pas son existence ». La copie, l'annotation, la rétroaction et le résultat restent consultables dans le dossier de l'élève, et le signalement « Aide en français recommandée » continue de lire la copie diagnostique (voulu, 7 sept.).

## Partie 1 – la source : la case ne se reporte plus (#1055)

- **Mesuré par Cowork à 14 h 01.** `js/productions-liste.js` ne contient aucune occurrence de `productionDiagnostique`. `creerNouvelleProduction` (~225) remet les champs un par un sans toucher la case et n'appelle pas `reinitialiserFormulaireProduction` (`js/productions.js` ~1584), où vit la remise à zéro de #790 (~1609-1611) : seul un commentaire l'y nomme (~260, ~288).
- **À faire.** Qu'il n'existe plus deux listes de champs à remettre à zéro : « + Nouvelle production » passe par la remise à zéro commune, ou les deux chemins partagent une seule fonction. Le choix est technique : tranche, et dis-le. Vérifie aussi les autres chemins qui ouvrent une fiche neuve (duplication, depuis la carte d'alignement, depuis une bibliothèque) : aucune case héritée.
- **Source ou stock** : source seulement ici. Le stock est la partie 3.

## Partie 2 – partout, un diagnostic se lit autrement (décision de Grégoire de 14 h 00)

- **Inventaire, d'abord.** Chaque surface qui compile, compte ou trace des productions ou des évaluations : la note finale et son détail ; le portfolio ; les indices C et P du jour ET leur historique (captures hebdomadaires, courbes de progression, graphiques de complétion) ; le profil de l'élève (sections, graphiques, le « sur N » de l'Accompagnement) ; le Suivi du groupe ; la Liste des étudiant·es ; les exports (résultats finaux pour Léa, recherche, synthèse de rétroaction). Range chacune : passe par `ProductionDiagnostique`, l'exclut en amont (dis par où), ou la compte.
- **Mesuré par Cowork à 14 h 01, à confirmer par toi** : `ProductionDiagnostique` est appelé par les trois familles de pratiques (`pratique-sommative.js`, `pratique-pan-standards.js`, `pratique-pan-specifications.js`), `profil-etudiant-helpers.js`, `profil-etudiant-actions.js` et `synthese-retroaction-data.js` ; aucun appel dans `snapshots.js`, `portfolio.js`, `tableau-bord-apercu.js`, `export-resultats-finaux.js` ni `pratiques/pratique-registre.js`. Ces modules l'excluent peut-être en amont, peut-être pas : c'est à mesurer, pas à supposer.
- **Une fuite déjà connue** : le « sur N » de la section Accompagnement compte le travail diagnostique (`evaluationEntreDansLaNote`, `js/pratiques/pratique-registre.js` ~842 ; entrée 6.65 de #1083). Corrige-la ici et note-le sous #1083.
- **Toute surface qui compte un diagnostic comme une production ordinaire est corrigée**, en passant par l'entité, pas par un filtre local. La sentinelle de l'entité s'élargit aux nouveaux sites.
- **« Vue autrement »** : là où une production diagnostique s'affiche parmi les autres (la liste de Conception › Productions, la Liste des évaluations, le dossier et le profil de l'élève), elle porte une marque visible « Diagnostique », le mot même de la case (pas de mot neuf). Pas de nouvelle section ni de nouveau graphique : si une surface semble en demander un, remonte à Cowork sans le construire.
- ⛔ Ne bouge pas : le signalement « Aide en français recommandée » et sa règle ; les seuils ; le palier RàI hors de la porte 4.
- **Ce qui peut changer à l'écran** : si une surface comptait un diagnostic, un chiffre de l'automne 2026 change (un taux, une courbe, un « sur N »). Liste chaque chiffre qui bouge, avec son avant et son après sur la démo, dans la demande de relecture. Rien n'est écrit dans les données : c'est la lecture qui change.

## Partie 3 – le stock : mesurer, ne rien écrire

- Chez Grégoire et chez les collègues, des productions créées après une production diagnostique ont pu hériter de la case sans l'avoir voulu ; elles sont hors de la note depuis. Grégoire a fait écrire un diagnostic en semaine 1 (7 sept.) : chez lui, c'est probable, pas mesuré.
- **Rien n'est réécrit.** La marque de la partie 2 suffit à les voir dans Conception › Productions ; c'est l'enseignant qui décoche lui-même ce qui n'est pas un diagnostic.
- **Porte terrain, une rangée, après la version du soir** : ouvrir Conception › Productions de l'automne 2026 et dire lesquelles portent « Diagnostique » ; décocher soi-même celles qui n'en sont pas. Écris le markdown (skill `portes-terrain`) ; Cowork publie l'artefact.
- **Ligne des Nouvelles** : propose une phrase qui invite les collègues à regarder leurs productions marquées. Elle sera soumise à Grégoire avec la version du soir.

## Les bancs

- Vitest : la fiche neuve sans case héritée, par chaque chemin ; chaque surface corrigée de la partie 2 ; la sentinelle élargie.
- Playwright, écrit et non lancé : un groupe avec une production diagnostique évaluée et une ordinaire. La note, C, l'historique de P et les graphiques du profil ne lisent que l'ordinaire ; la diagnostique paraît dans les listes avec sa marque ; « + Nouvelle production » après une diagnostique donne une case décochée.
- Break-test pour chaque essai neuf. ⚠ Leçon de 11 h 27 : avant de toucher, cherche aussi le champ `diagnostique` dans `tests/integration` ; Vitest ne lance pas ces bancs.

## La méthode

Commit, Vitest complet (depuis `tests/`), demande `plans de travail/DEMANDE-RELECTURE-2026-10-15-diagnostique.md` : l'inventaire de la partie 2 (surface, disposition), le choix de la partie 1, les chiffres qui bougent, la ligne des Nouvelles, le markdown de la porte. **Aucun push, aucune release, aucun verdict Playwright avant son signal du soir.** Rapport court à Grégoire, en gestes d'utilisateur.
