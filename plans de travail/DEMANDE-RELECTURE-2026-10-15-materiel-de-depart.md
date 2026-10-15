# Demande de relecture – le matériel de départ : sa suppression vaut pour son trimestre, ses anciens noms se rattrapent (#683, #684)

> Claude Code, 15 oct. 2026, 13 h 07 (Toronto, mesuré par `date`), consigne de Cowork de 11 h 36.
> Base : `main` local après fusion de `origin/main` (`53791155`, l'observation `d5c03cd0`, sans
> conflit). Lot : `128d338e`. Aucun push, aucune release, aucun verdict Playwright.

## Ce que le lot fait

| Partie | Fait | Où |
|---|---|---|
| 1. #683 | La marque d'une suppression se pose dans `<trim>_ressourcesSupprimeesTrimestre` ; l'ancienne `ressourcesSupprimees` est lue en plus, jamais réécrite ni vidée. Les `GABARIT_*` gardent une marque globale. La bascule sème grille, échelle, cartouche. | `js/main.js`, `js/trimestres.js`, `js/trimestre-v2-liste.js`, `js/cartouches.js` (export du semeur), `js/reserve.js`, `docs/DATA-OWNERSHIP.md` |
| 2. #684 | Migration au démarrage, une fois (drapeau daté `migration_noms_materiel_depart_684_20261015_done`, valeur : la date du passage), égalité stricte revérifiée dans le mutateur. Le drapeau suit le codex. | `js/main.js`, `js/codex.js` |
| 3. BACKLOG | Sept lignes recopiées telles quelles sous #683, #684, #622, #546, #450, #279, #274. Cochées : #683, #684, #546, #450, #279. Ouvertes : #622, #274. Ligne de la question 4 sous D4 et sous C4 de `PLAN-SOLO-echelle-et-depistage.md`. | `BACKLOG.md`, `plans de travail/` |

`index.html` : six jetons anti-cache relevés (garde du pré-commit).

## #683 — les décisions prises en chemin

**Le nom de la clé n'est pas `cle('ressourcesSupprimees')`.** Inscrit sous ce nom à
`CLES_NAMESPACEES`, la clé nue `ressourcesSupprimees` (l'ancienne marque globale) devient un
« résidu nu » pour trois boucles de `trimestres.js` (`forcerMigration`, `migrerResidusClesNues`,
`migrerVersMultiTrimestres`), qui la copient vers le seul trimestre actif puis l'effacent. Le
nom distinct `ressourcesSupprimeesTrimestre` laisse l'ancienne clé hors de leur portée.

**Les neuf identifiants d'`IDS_GABARITS_HARDCODES`, rangés par la règle « la portée suit la
collection »** (codée par le préfixe `GABARIT_`) :

| Identifiant | Collection | Semeur | Marque |
|---|---|---|---|
| `GRILLE_GENERIQUE` | `<trim>_grillesTemplates` | vivant (`assurerGrilleDeDepart`) | trimestre |
| `ECHELLE_IDME_DEPART` | `<trim>_echellesTemplates` | vivant (`assurerEchelleIdmeDeDepart`) | trimestre |
| `CART_GENERIQUE` | `<trim>_cartouches_GRILLE_GENERIQUE` | vivant (`assurerCartoucheDeDepart`) | trimestre |
| `ECHELLE_GENERIQUE` | `<trim>_echellesTemplates` | aucun depuis #574 | trimestre (inerte) |
| `GABARIT_GRILLE_ANALYTIQUE` | `bibliothequeGrilles` (globale) | vivant (`ajouterGabaritsDefautSiManquants`) | globale |
| `GABARIT_GRILLE_CHECKLIST_SPE` | `bibliothequeGrilles` (globale) | vivant | globale |
| `GABARIT_GRILLE_STD_OBJECTIFS` | `bibliothequeGrilles` (globale) | vivant | globale |
| `GABARIT_ECHELLE_IDME` | (bibliothèque d'échelles) | aucun depuis #574 | globale (inerte) |
| `GABARIT_ECHELLE_STD_MASTERY` | (bibliothèque d'échelles) | aucun depuis #574 | globale (inerte) |

Tous les appelants de `marquerRessourceSupprimee` (grilles, échelles, cartouches, `donnees-v2.js`)
ne marquent que ces identifiants.

**Garde de boot (#358).** Mesuré : la grille et l'échelle ne se sèment que si `cle()` rend une
clé de trimestre, et la cartouche exige la grille du même trimestre. Les trois pièces n'existent
donc que dans un trimestre, et leur suppression à l'écran suppose un trimestre connu. Si elle
arrivait quand même sans trimestre, la marque va dans la globale **avec un `console.warn`** :
la suppression reste durable, à la portée la plus large, et ça se dit. J'ai préféré cela à un
refus, qui aurait laissé revenir la pièce.

**La bascule.** `changerTrimestreActifV2` appelle `semerMaterielDeDepartApresBascule` en dernier.
Elle sème la grille puis l'échelle sous la même garde d'archive que `initialiserModuleGrilles` et
`initialiserModuleEchelles`, puis la cartouche. **Issue 2, inscrite sous #683** : au chargement,
la cartouche n'a pas la garde d'archive. La bascule fait pareil ; je n'ai rien élargi.

**Ce qui voyage** (mesuré par un sous-agent en lecture seule) :

- **L'ancienne `ressourcesSupprimees`** part dans le codex et l'export sélectif (balayage de toutes
  les clés, `codex.js:456`). À l'ouverture, elle est réécrite en entier (`codex.js:830-845`). Elle
  n'est pas dans la Réserve (liste blanche des globales, `reserve.js:58-75`).
- **La nouvelle clé** voyage aussi dans le codex sans inscription. Pour la Réserve, il fallait la
  classer (`_classerCleTrimestre`) ; sinon la sentinelle #1021 rougissait. Je l'ai classée « sans
  filtre », à côté de `grillesTemplates` : ce ne sont que des identifiants, sans élève.

**Source ou stock** : la source seulement. Les marques globales déjà posées gardent leur portée.
Non mesuré chez Grégoire : si l'absence de la grille de départ dans son automne 2026 vient d'une
marque globale. Si oui, elle reste absente partout, comme la décision le veut.

## #684 — les décisions prises en chemin

**Trois paires, pas cinq.** La consigne et la décision disent « les cinq anciens libellés » ;
`scripts/renommage-682-materiel-seme.js` en porte trois. Ce sont aussi les seuls trois noms
écrits par le code depuis novembre 2025 (`git log -p` sur les trois semeurs) :
« Grille générique (exemple) », « Échelle IDME (point de départ) », « Cartouche générique
(exemple) ». J'ai repris les trois. Le « cinq » vient peut-être des cinq copies renommées chez
Grégoire le 1er sept. ⮕ **À confirmer.**

**Où.** Chaque trimestre du registre `trimestres`, **archivés compris**, puisque les copies y
vivent. La cartouche n'est cherchée que dans `<trim>_cartouches_GRILLE_GENERIQUE`, sa seule
maison depuis S5/#623 ; le script balayait toute clé contenant `cartouches_`. Je n'ai pas couvert
les clés nues : `grillesTemplates` est vidée au démarrage (G4 de #358), et les `cartouches_*` nues
sont retirées par `migration_cartouches_namespacees`. La migration tourne juste après celle-ci.

**L'ancien codex : tranché.** Mesuré : l'ouverture écrit les clés du codex et n'efface jamais les
clés locales absentes du codex. Sans rien faire, un codex d'avant la migration ramènerait les
anciens noms, alors que le drapeau local resterait à « fait » : ils ne seraient jamais rattrapés.
**Le drapeau suit donc le codex** (`_drapeau684SuitLeCodex`). S'il est absent du codex,
l'ouverture le retire et la migration rejoue au démarrage suivant ; l'ouverture propose déjà un
rechargement. S'il est présent, la boucle d'ouverture l'a déjà écrit. Rejouer ne présente aucun
risque : la condition stricte n'atteint que les noms écrits par le code.

**Ligne des Nouvelles proposée** (à soumettre à Grégoire avec la version du soir) :

> Le matériel de départ porte ses nouveaux noms partout : « Grille de départ », « Échelle de
> départ (IDME) », « Cartouche de départ ». Un nom que tu as modifié n'est pas touché.

Et pour #683, qui se voit aussi, si Grégoire le veut :

> Supprimer la grille, l'échelle ou la cartouche de départ ne vaut plus que pour le trimestre où tu
> le fais ; un nouveau trimestre les reçoit dès que tu y passes.

## Suppositions (à corriger en dix secondes si elles sont fausses)

1. Le nom `ressourcesSupprimeesTrimestre` (motif ci-dessus).
2. Sans trimestre connu : une marque globale avec avertissement, plutôt qu'un refus.
3. Trois paires de libellés, pas cinq.
4. Les trimestres archivés sont migrés.
5. Les deux échelles et l'échelle générique sans semeur sont rangées par collection, même si leur
   marque est inerte.

## Bancs

- **Neuf, Vitest** : `tests/unit/sentinelle-683-suppression-par-trimestre.test.js` (8 essais) et
  `tests/unit/sentinelle-684-noms-materiel-de-depart.test.js` (11 essais). Pour les gabarits, le
  vrai `gabarits-utils.js` est chargé : supprimé avant une bascule, le gabarit ne revient pas après,
  et un témoin vérifie que le semeur a bien tourné.
- **Neuf, Playwright, écrit et non lancé** : `tests/integration/suppression-par-trimestre-683.spec.js`
  (2 essais). Supprimée dans a2026, la grille arrive dans h2027 vierge sans rechargement, et reste
  absente d'a2026 au retour. Une ancienne marque globale la garde absente des deux. ⚠ La
  suppression y est rejouée par ses deux écritures (celles de `_retirerGrilleDeLaListe`), pas par
  la fenêtre de confirmation.
- **Break-tests**, 17 mutations, chacune restaurée par copie (`cmp`), toutes rouges sur l'essai visé :
  - #683 (6 mutations) : la marque écrite dans la globale (A), la globale non lue (C et D), la règle
    `GABARIT_` neutralisée (D), l'avertissement retiré (E), la garde d'archive de la bascule retirée
    (F archivé), l'appel retiré de `changerTrimestreActifV2` (F).
  - #684 (11 mutations) :
    - comparaison sans casse ni espaces (B) ;
    - pas de revérification dans le mutateur (C) ;
    - recherche par nom au lieu de l'identifiant (A). Elle **survivait** d'abord : la grille de
      l'usager venait après celle du code dans le jeu. Le jeu est corrigé, et la mutation rejouée
      rougit A ;
    - un ancien libellé faussé (A) ;
    - drapeau ignoré (E) ;
    - drapeau posé sur une erreur (E) ;
    - appel retiré du démarrage (E) ;
    - codex : drapeau toujours retiré (E) ;
    - appel retiré de l'ouverture (E).
- **Bancs Playwright touchés par la bascule qui sème** : `1028-archiver-copies`,
  `e3-renvoyer-trimestre`, `bascule-trimestre-466`, `evaluation-911-relire-sans-copie`. Les deux
  premiers comparent des photos de clés, mais rechargent après chaque bascule, et le chargement
  semait déjà les mêmes pièces : la bascule l'avance seulement. **Le verdict du soir les juge.**
- **Complexité** : `sentinelle-contenir-complexite` refusait `auDbReady` 70 → 76 et `chargerCodex`
  83 → 85. Les deux blocs sont sortis en fonctions (`lancerMigrationNomsMateriel684`,
  `_drapeau684SuitLeCodex`) : aucun seuil relevé.
- **Vitest complet** (depuis `tests/`) : **8 810 sur 8 810**, 755 fichiers, aucune ligne
  « Errors » ni « Unhandled ».

## Hors lot

`plans de travail/observation/` non touché. Non commités, parce qu'arrivés de Cowork pendant le
lot : `CONSIGNE-LOT-2026-10-15-groupe-4.md`, `DECISIONS-2026-10-15-groupe-4.md`,
`DECISIONS-2026-10-15-groupe-5.md`. Pas de porte terrain : la bascule se prouve au banc.
