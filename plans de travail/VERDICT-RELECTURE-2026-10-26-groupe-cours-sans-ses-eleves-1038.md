# Verdict de relecture – Le groupe-cours qui naît sans ses élèves (#1038, la source)

> Relu par Cowork le lundi 26 octobre 2026 à 16 h 39 (Toronto, mesuré par `date`), sur `main` = `3d04343b` (lot : `c12ab9b5`, relais `0ff394bf`, spec acquittée `3d04343b`). Demande : `DEMANDE-RELECTURE-2026-10-26-groupe-cours-sans-ses-eleves-1038.md`.

## Verdict : ACCEPTÉ, une retouche de commentaire (non bloquante)

La mise en ligne du soir (`CONSIGNE-LOT-2026-10-26-mise-en-ligne-du-soir.md`) peut partir. Elle fait d'abord la retouche ci-dessous, en un commit à part.

## Ce qui est relu, et comment

- **Le diff des quatre fichiers `js/`** (`git show c12ab9b5`), ligne à ligne :
  - **A** (`_groupeSansSesElevesAccepteV2`, `trimestre-v2-groupes-cours.js`) : la garde est posée avant CT-15, ne se déclenche en modification que si le cours ou le groupe change, et « Annuler » rend `false` sans écrire (en modification, `_remettreGroupeCoursEnBaseV2`).
  - **Le compte** (`repartitionGroupeParCoursV2`) réutilise `_ficheEstDuGroupeV2` (la règle de #924), sans la dupliquer. Une fiche sans `coursId` fait taire la question. C'est conforme au § 2 A.
  - **B** (`productionsRangeesAilleurs`, `modes.js`) suit la règle du filtre : une production sans `coursId` ou du cours actif fait taire la ligne. Le stock est lu par `cle('productions')`, la même clé que `obtenirDonneesSelonMode` (`modes.js:755`).
  - **Sécurité** : la phrase est passée par `echapperHtml` avant `innerHTML` (règle n° 1). La question A est un `confirm` natif, sans HTML. Aucun `console.log`, aucun handler inline.
  - Les jetons de `index.html` sont mis à jour pour les quatre fichiers.
- **Les mots** : la spec les lit mot pour mot (`groupe-cours-sans-ses-eleves-1038.spec.js`, l. 131-134, 153-154, 175-178, 205-208), y compris le singulier, la modification et le cas de plusieurs cours. Ce sont les mots validés par Grégoire à 15 h 01.
- **Les cas sans question ni ligne** sont couverts par la spec : groupe vide partout, fiches sans cours, deux cours bien rangés.
- **Les fiches inscrites hors du lot** sont présentes au BACKLOG : #1170 et #1171, avec le dernier ID à jour.
- **Non relancé par Cowork** : Vitest et la spec. Je m'en tiens au rapport de Claude Code (Vitest 9 768 verts, spec WebKit verte deux fois, 12 break-tests rouges). Chromium n'a pas été joué, mais le code ne dépend d'aucun moteur (`confirm`, chaînes, `innerHTML` échappé).

## Les trois suppositions de Claude Code : toutes retenues

1. **Le singulier**, « Son étudiant·e est rattaché·e à … », découle directement de la phrase validée. Retenu.
2. **Le cours nommé avec son code et son nom**, comme la zone d'import le nomme, dans A et dans B. Le § 3 A le demandait pour A. Dans B, « codes » ne visait que l'échappement : un même libellé aux deux endroits est préférable. Retenu.
3. **Le stock** : un groupe-cours déjà créé vide ne repose pas la question, mais la ligne B le signale à l'import. C'est assumé et écrit à la ligne #1038. Retenu.

## La retouche (avant la release, un commit `docs(code)`)

- `js/travaux-ui.js`, l. ~1827-1840 : le bloc JSDoc de `genererEtape2Colonnes` (« Genere l'etape 2 en layout 3 colonnes… ») se retrouve AU-DESSUS de celui de la nouvelle `phraseProductionsRangeesAilleurs`. Deux blocs se suivent, et `genererEtape2Colonnes` a perdu le sien. Il faut le remettre juste au-dessus de `genererEtape2Colonnes`. C'est un commentaire seulement, donc ni jeton à changer ni test à relancer.

## Observation, sans suite (issue 3)

- Si une production porte l'id d'un cours qui n'existe plus (ids d'avant la migration, famille #154/#346), la ligne B dit « rangée sous Cours COURS_… ». C'est vrai, mais peu lisible. Aucun symptôme vécu en A2026, donc rien à faire tant qu'un retour ne le montre pas.

## Portes terrain

- **Aucune pour #1038** : la spec lit les mots à l'écran, et rien ne dépend de Safari ni de l'iPad (le Cadre et l'import se font au Mac). Selon la règle de tête du skill `portes-terrain`, il n'y a pas de porte quand une machine peut répondre.
