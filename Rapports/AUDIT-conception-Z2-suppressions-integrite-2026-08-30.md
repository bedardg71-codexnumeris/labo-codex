# Audit ciblé Z2 — politique de suppression et intégrité référentielle (Labo Codex)

Date : 2026-08-30 (soirée). Dépôt : `~/Documents/GitHub/Monitorage_v6`, branche `main` au commit `3b5ffd96` (docs, S0 livrée). **Aucun fichier de `js/`, `index.html` ou `tests/` ne porte de modification non commitée** : le code audité est exactement celui de l'audit de carte du 30 août (`Rapports/AUDIT-modele-objets-conception-2026-08-30.md`, commit du même jour) — les six commits intermédiaires sont documentaires. **Aucun fichier du dépôt n'a été modifié par cet audit**, hors ce rapport.

Session `kuekatsheu-82`, item **#620** (S2 du plan `plans de travail/PLAN-modele-objets-conception-2026-08-30.md`). Constats couverts : **S1, S2, S6, M7** de l'audit de carte. Livre les diffs de **S6 (#624)** et **S9 (#627)**.

Élargissements de périmètre, annoncés : `js/reserve-ouvrir.js` (il porte un **quatrième** remap d'import, non recensé par l'audit de carte, et c'est le plus complet des quatre — l'ignorer aurait fait unifier les trois autres sur une référence moins bonne) ; `js/planification-donnees.js` et `js/planification-carte.js` (constat M7 : le sort des références `carteId::leconId` et de `metadata.productionId`) ; `js/cours.js` (lecture seule — c'est le seul écrivain de `cours[].pratiqueId`, le champ sur lequel repose un garde de suppression) ; `js/partage-section.js` et `js/partage-import.js` (lecture seule, remaps).

Convention de certitude, reprise de `AUDIT-chaine-importation-travaux-2026-08-30.md` : **VÉRIFIÉ** = lu dans le code, extrait cité ; **INFÉRÉ** = conséquence déduite du code, sans exécution ; **SUPPOSÉ** = demande un test réel. Quand une atteignabilité n'est pas établie, c'est écrit **non établi** — pas arrondi vers le haut.

---

## 1. Synthèse

Trois choses, dans l'ordre où elles comptent.

**1. Un chemin détruit des données réelles aujourd'hui, en silence.** `donnees-v2.js:1571` (Réglages › Données, « Supprimer » une grille) exécute `db.remove('cartouches_' + grilleId)` sur une clé **globale**, alors que le commentaire trois lignes plus bas annonce l'intention inverse et que la grille, elle, n'est retirée que du trimestre actif. Depuis #358, le même `grilleId` dans deux trimestres est le cas *nominal* : supprimer une grille pendant que H2026 est actif efface les cartouches de la grille homonyme d'A2025, dont la grille survit. C'est le seul constat de ce périmètre qui perd des données sans que rien ne le dise. (Constat croisé indépendamment par la session Z1 ; ordonnancement recommandé en §3.)

**2. La politique D3-A est déjà écrite — dans un chemin sur cinq, et seulement dans le DOM.** La modale de Réglages › Données bloque réellement : `btnConfirmer.disabled = true`, libellé « Suppression impossible » (`donnees-v2.js:1445-1448`). **L'audit de carte se trompe sur ce point** (constat S1 : « affiche les dépendances… mais n'en bloque aucune »). Ce qui manque n'est donc pas la décision, c'est trois choses : la généraliser aux quatre autres chemins, la **descendre dans la fonction de suppression** (aujourd'hui `confirmerSuppressionRessource` ne revérifie rien — le garde est un attribut DOM), et **réparer les scanners**, dont deux mesurent un champ que personne n'écrit.

**3. Les gardes existants mentent, et ils mentent dans les deux sens.** `verifierDependancesEchelle` et `calculerUsagesEchelles` lisent `pratique.echelleId` ; le seul écrivain du dépôt écrit `pratique.configuration.echelleId` (`pratiques-gestion.js:1619`). Résultat mesurable : dans Réglages › Données, **toute** échelle est affichée « Non utilisée » et **aucune** n'est jamais bloquée — y compris une échelle portant 339 évaluations. Symétriquement, le garde « cours utilisant cette pratique » (`pratiques.js:1129`) lit `cours[].pratiqueId`, dont l'unique écrivain est une migration de boot qui écrit toujours `'pan-standards'` : il bloque toutes les pratiques normalisées vers `pan-standards` même inutilisées, et n'en protège aucune autre. Deux gardes qui ne gardent rien, et un qui interdit à tort.

**Sur #542, une correction de prémisse — et une précaution sur le statut de cette correction.** L'incident est **rapporté comme réparé le 26 août 2026 au soir** : le script existe (`scripts/reparation-542-echelle-orpheline.js`), et le relevé de l'époque donne `echelleId` introuvable 383 → 44, niveaux convertibles 1277 → 2807, aucune note touchée. ⚠ Ces chiffres sont **rapportés, pas mesurés aujourd'hui** : l'existence d'un script ne prouve pas qu'il a tourné sur les données réelles, et un commit ultérieur (`e3d5af34`) indique que la réparation elle-même a dû être corrigée — « la reparation disait l'inverse de son effet, et propageait `parDefaut` ». Le chiffre du jour est précisément ce que mesure le diagnostic du §4. La consigne de session et l'audit de carte, eux, décrivent l'incident comme actuel (« 339 évaluations »). Ce qui reste ouvert de #542 est (a) 44 évaluations `ECHELLE_DEMO` en h2026 et (b) **la cause, inconnue**. Le périmètre de S6 doit donc être reformulé : non pas « absorber la réparation #542 », mais **refermer les chemins qui la reproduisent**. Ce rapport en nomme deux, vivants, atteignables en trois clics (§2.3-S1 et §2.3-S2).

Ce qui tient : la discipline `db.modifier` est appliquée sur la quasi-totalité des chemins de suppression (relecture dans la file, index recalculé après la confirmation) ; le pipeline de partage vide bruyamment une référence de grille plutôt que de la laisser pendante ; `reserve-ouvrir.js` est la seule implémentation d'import qui garde la clé de stockage des cartouches et le champ `grilleId` cohérents. Détail complet en §2.5.

---

## 2. Constats

### 2.1 La carte des chemins de suppression (repères)

> Autoportante : peut être collée dans la documentation. Chaque ligne a été ouverte et lue.

| Objet | Chemin | Garde référentiel | Écriture | Atteignable ? |
|---|---|---|---|---|
| **Grille** | `supprimerGrille` grilles.js:929 | **aucun** | `db.modifier` | **OUI** — vue hiérarchique `#vueGrillesCriteres` (grilles.js:1330) |
| | ⤷ même fonction, second bouton grilles.js:826 | aucun | — | **NON** — `afficherGrillesCriteres` sort sur `#listeGrilles`, absent d'index.html (M5) |
| | `supprimerGrilleActive` grilles.js:3933 | **aucun** | `db.modifier` | **OUI** — bouton `#btnSupprimerGrille` (index.html:4872) |
| | `supprimerGrilleDepuisSidebar` grilles.js:3841 | cartouches (bloque, **nomme** jusqu'à 5 noms) | `db.modifier` | OUI — corbeille de la barre latérale |
| | `supprimerGrilleDefinitivement` grilles.js:2667 | cartouches (bloque, compte) | `db.modifier` | OUI — bibliothèque |
| | `supprimerGrilleDefinitivement` **donnees-v2.js:1564** | aucun ; **détruit** `cartouches_<id>` | `db.remove` + `db.modifier` | OUI — Réglages › Données |
| | `supprimerGrilleDeBibliothequePartagee` grilles.js:2714 | aucun (pool seul) | `retirerGrilleDeLaBibliotheque` | OUI |
| **Échelle** | `supprimerEchelle` echelles.js:953 | **aucun** | `db.modifier` | **OUI** — vue `#vueEchellesNiveaux` (echelles.js:330) |
| | `supprimerEchelleDepuisSidebar` echelles.js:4309 | évaluations du **trimestre actif seulement** ; propose une migration | `db.modifier` | OUI |
| | `supprimerEchelleActive` echelles.js:4426 | délègue au précédent — **gardé** | — | OUI — `#btnSupprimerEchelle` (index.html:5052) |
| | `supprimerEchelleDefinitivement` echelles.js:2610 | aucun (pool + templates) | — | OUI — bibliothèque |
| | `supprimerEchelleDefinitivement` **donnees-v2.js:1624** | scanner **toujours vide** (§2.3-S2) | `db.modifier` | OUI — Réglages › Données |
| **Cartouche** | `supprimerCartoucheConfirm` cartouches.js:1807 | `cartouche.verrouille` uniquement | `db.modifier` | OUI |
| | `supprimerCartoucheActive` / `supprimerCartouche` | délèguent au précédent | — | OUI |
| | `supprimerCartoucheDefinitivement` cartouches.js:4734 | aucun | `db.modifier` | OUI — bibliothèque |
| | `supprimerCartoucheDefinitivement` **donnees-v2.js:1608** | dépendances en **avertissement**, jamais bloquantes (par conception, l.1121) | pool seul | OUI |
| **Production** | `window.supprimerProduction` productions.js:3240 (wrapper) | aucun | `db.modifier` | OUI — sidebar |
| | `supprimerProductionActive` productions-liste.js:403 | aucun | `db.modifier` | OUI |
| | `supprimerProduction` productions.js:2150 | aucun | `db.modifier` | **NON** — écrasée par le wrapper (M4 de l'audit de carte) |
| | `supprimerProductionDefinitivement` **productions-bibliotheque-ui.js:693** | **aucun** — et il retire de la collection de TRAVAIL, pas seulement du pool | `db.modifier` + pool | OUI — bibliothèque |
| | `supprimerProductionDefinitivement` donnees-v2.js:1657 | modale amont **bloquante** (évaluations, tous trimestres) | pool seul | OUI — Réglages › Données |
| **Pratique** | `supprimerPratique` pratiques.js:1115 | « active » (SSOT) + `getCoursUtilisantPratique` **faux dans les deux sens** (§2.3-S3) | via PratiqueManager | OUI |
| | `PratiqueManager.supprimerPratique` pratique-manager.js:224 | « active » seulement | **`db.setSync` hors file** | OUI — appelé aussi par comparateur-pratiques.js:609 |
| | `supprimerPratiqueDefinitivement` donnees-v2.js:1543 | modale amont **bloquante** (tous trimestres, nomme le trimestre) | **`db.setSync` hors file** | OUI |
| **Carte** | `supprimerCarteActive` planification-carte.js:7965 · `supprimerAlignementDuTrimestre` planification-bibliotheque.js:400 | aucun ; ne purge pas `planification_seances` | `planificationDonnees` | OUI |

**Ce que les référents traversent.** Aucun chemin du tableau, sur aucun objet, ne contrôle : `production.grilleId/echelleId/cartoucheId`, `evaluation.grilleId/echelleId/cartoucheId/productionId` (sauf le cas partiel des échelles en sidebar), `cartouche.echelleId`, `carte.metadata.productionId`, `planification_seances[carteId::leconId]`. Le seul endroit du dépôt où un scan **multi-trimestres** existe est `donnees-v2.js:899-1185` — et il n'est câblé qu'à un chemin sur cinq.

### 2.2 BLOQUANT

#### B1 — Supprimer une grille depuis Réglages › Données efface les cartouches d'un AUTRE trimestre

`js/donnees-v2.js:1564-1601`. **VÉRIFIÉ** (code, portée de la clé), **INFÉRÉ** (l'effet inter-trimestre : il suppose deux trimestres portant le même `grilleId`, ce que la migration #358 rend nominal).

```js
// :1571
await db.remove(`cartouches_${grilleId}`);
…
// :1582-1584 — l'intention, énoncée pour les GRILLES, démentie une ligne plus haut
// pour les cartouches :
// « On ne purge QUE le trimestre actif — les copies archivées d'autres trimestres
//   sont des enregistrements figés (reproductibilité des notes), on n'y touche pas. »
await db.modifier(cle('grillesTemplates'), …)   // trimestre actif : correct
```

`cle('grillesTemplates')` rend `<trim>_grillesTemplates` ; `cartouches_<grilleId>` est la clé **nue**, globale (audit de carte §2.1). Le geste est donc à moitié namespacé : la grille part du trimestre actif, ses cartouches partent de **partout**.

Scénario de défaillance : H2026 est actif. Grégoire ouvre Réglages › Données › Grilles et supprime « Grille de rédaction » — un doublon qu'il ne veut plus dans H2026. La grille homonyme d'A2025 reste dans `a2025_grillesTemplates`, ses trois cartouches sont effacées. Rien ne le signale : la modale affichait « 3 cartouche(s) associée(s) seront aussi supprimées » (`donnees-v2.js:1110`) — un avertissement exact sur le nombre, faux sur le trimestre. Il bascule sur A2025 la semaine suivante : la grille est là, ses cartouches ont disparu. C'est le symptôme du 24 août, produit par un autre chemin.

Effet miroir sur les deux chemins qui, eux, **bloquent** sur la même clé nue (`grilles.js:2677`, `grilles.js:3858`) : des cartouches appartenant à la grille homonyme d'un autre trimestre empêchent la suppression dans le trimestre actif, et le message de `grilles.js:3859-3866` **nomme** ces cartouches. Grégoire lit les noms de cartouches qu'il jurerait avoir supprimées.

⮕ Trois chemins, deux politiques opposées, une seule cause : **la clé n'a pas la portée que ses appelants croient**. La correction de fond appartient à D2/S5 (régime des cartouches), pas à D3/S6. Conséquence sur l'ordre des sessions : §3, en tête.

### 2.3 SÉRIEUX

#### S1 — Grilles : cinq chemins vivants, trois politiques, et le bouton principal de l'éditeur n'a aucun garde

`js/grilles.js:929, 3933, 3841, 2667` ; `js/donnees-v2.js:1564`. **VÉRIFIÉ.**

L'audit de carte annonce « quatre chemins ». Comptage exact : **cinq chemins atteignables retirent une grille d'une collection de travail** (grilles.js:929, 2667, 3841, 3933 et donnees-v2.js:1564), un sixième ne touche que le pool partagé (grilles.js:2714), un septième est mort (grilles.js:826 — M5). Et le plus exposé des cinq n'est pas cité : `supprimerGrilleActive`, le bouton « Supprimer cette grille » de l'éditeur ouvert (`index.html:4872`).

```js
// grilles.js:3933-3966 — le bouton de l'éditeur
async function supprimerGrilleActive() {
    if (!grilleTemplateActuelle) { … }
    if (!confirm('Es-tu sûr de vouloir supprimer cette grille ?')) return;
    await db.modifier(cle('grillesTemplates'), (lues) => { … splice … }, []);
    if (supprimee) {
        // :3959 — tombstone posé SANS condition, contrairement aux quatre autres chemins
        window.marquerRessourceSupprimee(grilleTemplateActuelle.id);
```

Deux écarts, dans la même fonction. **Le garde cartouches est absent**, alors que la fonction sœur `dupliquerGrilleActive` (l.3919, six lignes plus haut) délègue, elle, à `dupliquerGrilleDepuisSidebar`. Et **le tombstone est inconditionnel** : les quatre autres chemins n'appellent `marquerRessourceSupprimee` que si l'id est dans `IDS_GABARITS_HARDCODES` ; celui-ci l'appelle pour n'importe quelle grille — donc pour des ids que rien ne re-sème, ce qui fait grossir `ressourcesSupprimees` sans effet (bénin, mais c'est la trace d'une écriture non revue).

Comparaison qui rend la chose lisible : **le même bouton, côté échelles, est gardé.** `supprimerEchelleActive` (echelles.js:4426) fait `await supprimerEchelleDepuisSidebar(echelleTemplateActuelle.id)` — deux lignes, et il hérite du garde. Côté grilles, la logique a été réécrite au lieu d'être déléguée, et le garde de 2026-08-24 n'y est jamais descendu.

Scénario de défaillance : Grégoire ouvre « Grille de rédaction » dans l'éditeur, décide qu'elle est de trop, clique « Supprimer cette grille » dans l'écran où il travaille déjà. Ses quatre cartouches restent dans `cartouches_GRILLE_…`, plus aucune interface ne les énumère (la barre latérale et la bibliothèque n'énumèrent que les cartouches des grilles présentes). Le même geste, deux boutons plus loin dans la barre latérale, aurait été refusé avec la liste de leurs noms.

#### S2 — Les deux gardes d'échelle sont aveugles, et l'un d'eux lit un champ que personne n'écrit

`js/donnees-v2.js:997-1013` et `:1145-1160` ; `js/echelles.js:4269-4286`. **VÉRIFIÉ** (les deux, par grep exhaustif des écritures).

```js
// donnees-v2.js:1007 — calculerUsagesEchelles
if (p.echelleId && usages[p.echelleId]) { usages[p.echelleId].pratiquesCount++; }
// donnees-v2.js:1153 — verifierDependancesEchelle
const pratiquesUtilisant = pratiques.filter(p => p.echelleId === echelleId);
```

Mesure : `grep -rn "\.echelleId *=" js/` rend **un seul** écrivain d'un `echelleId` sur une pratique stockée — `pratiques-gestion.js:1619`, `configurations[index].configuration.echelleId = …`. Aucun site du dépôt n'écrit `pratique.echelleId` à la racine. Les deux fonctions lisent donc une propriété toujours `undefined`.

Conséquences, toutes deux visibles à l'écran :
- le tableau des échelles de Réglages › Données affiche **« Non utilisée » sur toutes les lignes, toujours** ;
- `verifierDependancesEchelle` rend toujours `dependances: []`, donc la modale ne bloque **jamais** une échelle — y compris une échelle portant 339 évaluations.

Le second garde, celui du chemin de la barre latérale, est réel mais borné :

```js
// echelles.js:4271-4279 — verifierUtilisationEchelle
let evaluations = await db.get(cle('evaluationsSauvegardees'));   // trimestre ACTIF seulement
const evaluationsUtilisant = evaluations.filter(e => e.echelleId === echelleId);
```

Il ignore les autres trimestres, `production.echelleId`, `cartouche.echelleId` et `pratique.configuration.echelleId`. Et les autres chemins n'ont aucun garde du tout : `supprimerEchelle` (echelles.js:953, vue `#vueEchellesNiveaux`) n'en a pas, et `supprimerEchelleDefinitivement` (echelles.js:2610) porte à sa place une affirmation, fausse :

```js
// echelles.js:2620
// Pas de dépendances directes pour les échelles
```

Quatre types d'objets pointent vers une échelle (audit de carte §2.1 : productions, cartouches, évaluations, pratiques). Le commentaire n'est pas un raccourci d'écriture : c'est la raison pour laquelle le garde n'a jamais été écrit ici.

Scénario de défaillance — et c'est le patron exact de #542 : une échelle de H2026 est référencée par les évaluations de H2026 mais Grégoire travaille dans A2026. Depuis la vue « toutes les échelles », il supprime celle qui fait doublon : aucun contrôle. Ou bien depuis Réglages › Données, où l'écran lui affiche noir sur blanc « Non utilisée » : la modale s'ouvre, la confirmation par saisie du nom passe, l'échelle part. Les évaluations de H2026 pointent un id qui n'existe plus. **Ce sont les deux chemins qui peuvent reproduire #542 aujourd'hui.** La cause de #542 restant inconnue (mémoire de projet, 26 août), ce rapport ne prétend pas qu'elle est là — il établit que ces chemins **suffisent** à produire l'effet.

#### S3 — Le garde « cours utilisant cette pratique » lit une clé écrite par une seule migration, avec une valeur constante

`js/pratiques.js:1128-1135` et `:282-298` ; `js/cours.js:63-79`. **VÉRIFIÉ.**

```js
// pratiques.js:298 — getCoursUtilisantPratique
return cours.filter(c => _normPratique(c.pratiqueId) === _normPratique(pratiqueId));
```

`cours` est la collection **globale**. Mesure des écrivains de `c.pratiqueId` : un seul, `cours.js:69`, dans `migrerCoursVersPratiques`, appelée à chaque boot (`main.js:1051` → `initialiserModuleCours`) :

```js
// cours.js:67-71
cours.forEach(c => { if (!c.pratiqueId) { c.pratiqueId = 'pan-standards'; nbMigres++; } });
```

Donc, après un boot, tout cours sans valeur porte `'pan-standards'`. Le garde est faux dans les deux sens :
- pour une pratique personnalisée créée au wizard, il rend **toujours** une liste vide — il ne protège rien ;
- pour toute pratique qui normalise vers `pan-standards`, il rend **tous** les cours — il refuse une suppression même si aucun groupe-cours ne l'utilise.

Et il ne lit jamais la SSOT. L'activation vit dans `groupesCours[id].pratiqueId` (`pratique-manager.js:91-96`, zone déclarée solide) et cette collection est **namespacée par trimestre** : la seule lecture correcte du dépôt est `calculerUsagesPratiques` / `verifierDependancesPratique` de `donnees-v2.js:899-926` et `:1048-1074`, qui balaient `<trim>_groupesCours` sur tous les trimestres et **nomment le trimestre**. Ce scanner-là est le bon ; il n'est câblé qu'à un chemin.

Scénario de défaillance : Grégoire supprime, depuis la sidebar des pratiques, une maquette qu'il a assignée au groupe 02 de l'automne pendant que H2026 est actif. Le garde « active » ne se déclenche pas (elle n'est pas active dans H2026), le garde « cours » rend une liste vide. `a2026_groupesCours[1].pratiqueId` devient un id mort ; à la bascule, le groupe 02 n'a plus de pratique.

#### S4 — La politique D3-A existe déjà, mais c'est un attribut DOM, pas un garde

`js/donnees-v2.js:1437-1456` et `:1489-1533`. **VÉRIFIÉ.**

```js
// :1444-1448 — l'ouverture de la modale
if (dependances.length > 0) {
    divConfirmation.classList.add('u-hide');
    btnConfirmer.disabled = true;
    btnConfirmer.textContent = 'Suppression impossible';
}
```

Ce chemin **implémente D3-A** : il bloque, et il affiche la liste des dépendances (`:1420-1424`). Pour la pratique, il nomme même le trimestre (`donnees-v2.js:1068`). L'audit de carte affirme l'inverse (constat S1 : « n'en bloque aucune ») ; sur la lecture du code, c'est inexact — et c'est une bonne nouvelle pour S6, qui hérite d'un patron plutôt que de partir de zéro.

Ce qui manque tient en trois points :
1. **Le garde est dans l'ouverture de la modale, pas dans la suppression.** `confirmerSuppressionRessource` (`:1489`) relit `ressourceASupprimer` et appelle directement `supprimerXDefinitivement` : aucune revérification. Un bouton réactivé, un appel programmatique, un `data-action` déclenché autrement, et la suppression passe. Les cinq fonctions `supprimerXDefinitivement` de ce module n'ont, elles, **aucun** garde.
2. **Deux objets sont exclus par conception.** `verifierDependancesCartouche` (`:1121`) commence par `const dependances = []; // Les cartouches n'ont pas de dépendances bloquantes` et range les évaluations concernées en simple avertissement. Sous D3-A, c'est un choix à trancher explicitement, pas un oubli à corriger en passant.
3. **Les messages ne nomment pas.** « Utilisée par 12 évaluation(s) » ne dit ni lesquelles ni dans quel trimestre — alors que le scanner connaît le trimestre au moment où il compte. D3-A exige de nommer ; le matériau est déjà dans la boucle.

Contradiction interne à signaler, parce qu'elle sera lue comme un bug pendant S6 : `verifierDependancesGrille` (`:1109-1112`) range les cartouches en **avertissement** — « seront aussi supprimées » — pendant que `grilles.js` les traite en **blocage**. Les deux messages sont exacts pour leur propre chemin (donnees-v2 les supprime vraiment, cf. B1). Les unifier suppose de trancher B1 d'abord.

#### S5 — Cartouches, productions, cartes : aucune référence entrante n'est contrôlée nulle part

`js/cartouches.js:1807-1849` ; `js/productions-liste.js:403-438` ; `js/productions.js:3240-3268` ; `js/planification-carte.js:7965-7980` ; `js/planification-bibliotheque.js:400-424`. **VÉRIFIÉ.**

Le seul garde de la suppression d'une cartouche est `cartouche.verrouille` (`cartouches.js:1811`) — une propriété métier, pas référentielle. Les productions n'ont aucun garde sur leurs **trois chemins vivants**, dont `supprimerProductionDefinitivement` (`productions-bibliotheque-ui.js:693-728`) qui, malgré son nom de fonction « de bibliothèque », retire aussi de la collection de travail (`db.modifier(getCleProductions(), …)`, l.714-716) : c'est une suppression pleine, sans contrôle. La suppression d'une carte ne purge pas `planification_seances` (clés composites `carteId::leconId`, `planification-donnees.js:576`) et ne contrôle rien.

Les références qui restent pendantes après ces gestes : `evaluation.cartoucheId`, `production.cartoucheId`, `evaluation.productionId`, `carte.metadata.productionId`, `planification_seances[carteId::*]`.

Sur les notes de séance orphelines, l'audit de carte les dit « inoffensives tant que `compteurCartes` n'est jamais décrémenté » (M7, INFÉRÉ). Mesure : le compteur n'est jamais décrémenté, mais il est **réinitialisé à 0 en deux points** — `planification-carte.js:7879` et `:7932`, `if (!index) index = { active: null, compteurCartes: 0, cartes: [] }`. Si l'index est absent, le prochain id est `carte_1`, et les notes de séance de l'ancienne `carte_1` se rattachent à la nouvelle. La condition « index absent » est justement celle des incidents de la famille #340/#542. L'inoffensivité tient donc à une hypothèse qui a déjà été fausse au moins deux fois sur ce dépôt. **INFÉRÉ**, atteignabilité **non établie** (angle mort n° 4).

#### S6 — Deux chemins de suppression de pratique écrivent hors de la file

`js/pratiques/pratique-manager.js:239` ; `js/donnees-v2.js:1550`. **VÉRIFIÉ** (forme).

```js
// pratique-manager.js:225-240
const pratiques = db.getSync(cle('pratiquesConfigurables'), null) || [];
const index = pratiques.findIndex(p => p.id === pratiqueId);
…
pratiques.splice(index, 1);
db.setSync(cle('pratiquesConfigurables'), pratiques);
```

C'est la forme lire → muter → écrire hors `db.modifier`, sur une clé namespacée, dans le module qui est par ailleurs l'**écrivain de référence** de l'activation (`changerPratiqueActive`, zone solide de l'audit de carte). Deux chemins sur trois aboutissent ici (`pratiques.js:1140`, `comparateur-pratiques.js:609`) ; le troisième (`donnees-v2.js:1547-1552`) porte la même forme, en plus enveloppée d'un `try/catch` dont le message d'erreur parle de « calcul usages ». Risque plus faible que S8 de l'audit de carte (pas d'`await` entre la lecture et l'écriture ici, donc pas de fenêtre d'attente utilisateur), mais `db.setSync` n'est pas atomique vis-à-vis d'IndexedDB (`db.js`, note R2 citée dans `donnees-v2.js:1585-1588`) et la clé n'est pas figée par la file.

Note de méthode pour la sentinelle de S6 : sous Node, `db.set` est **synchrone** faute d'IndexedDB, et une course d'écriture y devient invisible. Toute sentinelle sur ce site doit forcer `useIndexedDB` avec une fausse connexion — patron `tests/unit/sentinelle-522-pratiques-serialisees.test.js` (règle 6 du cadre).

#### S7 — Il y a quatre implémentations du remap d'import, pas trois — et la plus complète n'est pas celle que le plan désigne

`js/import-export.js:2429-2570` (codex) et `:2750-2870` (sélectif) ; `js/partage-import.js:146-202` ; **`js/reserve-ouvrir.js:1036-1099`** (non recensé). **VÉRIFIÉ.**

Le quatrième, `reserve-ouvrir.js`, traite explicitement ce que #448 laisse de côté :

```js
// reserve-ouvrir.js:1057-1076 — _patcherReferences
} else if (type === 'cartouche') {
    if (item.grilleId && remapGrilles[item.grilleId]) { item.grilleId = remapGrilles[item.grilleId]; … }
} else if (type === 'pratique') {
    if (item.config && item.config.echelleId && remapEchelles[item.config.echelleId]) { … }
}
```

Et le champ qu'il réécrit **commande la clé de stockage** : `importerCartouchesExternes` (`cartouches.js:4982`) construit `'cartouches_' + c.grilleId`. Clé et champ restent donc cohérents — c'est exactement le trou n° 3 de l'import codex (`import-export.js:2504-2563`, où la clé est remappée et le champ ne l'est pas).

État des quatre, mesuré :

| | `production.grilleId` | `production.echelleId` | `production.cartoucheId` | `cartouche.grilleId` (champ) | clé `cartouches_*` | `cartouche.echelleId` | `pratique.*.echelleId` |
|---|---|---|---|---|---|---|---|
| import codex (2429) | oui | oui | **non** | **non** | oui | **non** | **non** |
| import sélectif (2750) | **aucune table de remap** | — | — | — | — | — | — |
| partage `prefixerEntites` | oui | **non** | **non** | oui | s.o. | **non** (report assumé, D-C4) | **non** |
| **reserve-ouvrir (1036)** | oui | oui | **non** | oui | **oui, par le champ** | **non** | `config.echelleId` — **mauvais champ** |

Le dernier écart est un vrai défaut, pas une lacune : `reserve-ouvrir.js:1073` patche `item.config.echelleId` alors que l'unique écrivain du dépôt écrit `configuration.echelleId` (`pratiques-gestion.js:1619`, mesure de S2). Le double format de configuration (constat S7 de l'audit de carte) frappe donc ici sous forme de remap silencieusement inopérant.

Scénario de défaillance : Grégoire réimporte depuis les Archives une grille et une production qui existent déjà, en demandant la copie en double. La grille reçoit un id neuf, la production suit — mais son `cartoucheId` pointe encore la cartouche de l'original, qui vit maintenant dans un autre magasin. L'écran affiche « 2 référence(s) rebranchée(s) », ce qui est vrai et incomplet.

#### S8 — La duplication d'une ressource partagée laisse deux références dans le namespace `partage_*`

`js/partage-section.js:240-278` et `:119-131`. **VÉRIFIÉ.**

```js
// :252-258 — le garde, pour la grille SEULEMENT
} else if (copieP.grilleId.indexOf('PARTAGE_') === 0) {
    console.warn('[partage-section] Grille partagée introuvable pour la production', id, '— référence vidée');
    copieP.grilleId = '';
    complement = ' (sa grille n\'était plus disponible : à réassocier)';
}
```

`copiePropre` (`:119-131`) ne touche ni `echelleId` ni `cartoucheId`. La copie déposée dans les collections de travail peut donc porter `echelleId: 'PARTAGE_…'` et `cartoucheId: 'PARTAGE_…'` — des ids qui, par construction du pipeline #329, n'existent **jamais** dans les collections utilisateur. Le garde bruyant existe, il a été écrit, il n'a été branché que sur un champ sur trois.

C'est une classe d'orphelins **créée par un geste courant et documenté** (« Dupliquer dans mes documents »), pas par une suppression. Elle appartient à ce rapport parce que S6 devra décider si la garde de suppression doit aussi refuser… ce qu'un import a fabriqué. Réponse proposée en §3 : non — c'est le producteur qu'on répare, pas le consommateur.

### 2.4 MINEUR

- **M1 [INCOHÉRENCE]** — Trois paires d'homonymes, toutes en portées disjointes, aucune n'écrase l'autre (vérifié : `donnees-v2.js` est une IIFE, `head -20` l.16, et n'exporte sur `window` que `supprimerParametreConfig`, l.1733) : `supprimerGrilleDefinitivement` (grilles.js:2667 bloque / donnees-v2.js:1564 détruit), `supprimerCartoucheDefinitivement` (cartouches.js:4734, **deux** paramètres / donnees-v2.js:1608, **un**), `verifierDependancesPratique` (pratiques-gestion.js:602 = dépendances *sortantes*, lit `pratique.configuration` / donnees-v2.js:1048 = usages *entrants*, tous trimestres). Aucun bug ; un coût de lecture réel entre sessions. VÉRIFIÉ.
- **M2 [RÉSIDU]** — Quatre blocs conditionnels **vides** dans `import-export.js` (`:2548-2549`, `:2591-2596`) : `if (remapGrilles[ancienGrilleId]) { }`, `if (nbRemapEchelles > 0) { }`. La journalisation a été retirée, la condition est restée. À supprimer avec S9. VÉRIFIÉ.
- **M3 [piège de refactor, à lire avant S9]** — `import-export.js:2786` et `:2861` nomment leur variable de boucle `cle` : `['grillesTemplates','bibliothequeGrilles'].forEach(cle => {…})`. Dans ces deux blocs, la fonction globale `cle()` est **shadowée**. Aucun appel n'y est fait aujourd'hui, donc aucun bug ; ajouter un `cle('…')` à l'intérieur lèverait un `TypeError` que la relecture ne verrait pas. Renommer avant de toucher à ce code. VÉRIFIÉ.
- **M4 [INCOHÉRENCE — M7 de l'audit de carte]** — Duplications divergentes, confirmées : `dupliquerGrille` (grilles.js:979) régénère les ids `CR_` et ne copie pas les cartouches ; `forkerItem` (bibliotheque-ui.js:421) conserve les ids ; `dupliquerGrillePartagee` (partage-section.js:180) copie et ré-ancre les cartouches. `dupliquerCarteActive` (planification-carte.js:7982-8003) n'appelle pas `copierSeancesLecons` alors que l'import inter-trimestre le fait (planification-donnees.js:527) : la copie perd ses notes de séance, sans message. VÉRIFIÉ.
- **M5 [RÉSIDU]** — `afficherGrillesCriteres` (grilles.js:794) sort immédiatement : son conteneur `#listeGrilles` **n'existe pas** dans `index.html` (mesure : `grep -n 'id="listeGrilles"' index.html` → aucun résultat). Son bouton « Supprimer » (l.826) est donc mort, et l'appel que `supprimerGrille` lui fait (l.944) est un no-op. C'est l'un des « quatre chemins » de l'audit de carte : il n'en reste que la fonction. À retirer avec S8/S10, pas ici. VÉRIFIÉ.
- **M6 [INCOHÉRENCE]** — `importerCartouchesExternes` (cartouches.js:4965-5013) et `importerGrillesExternes`/`importerProductionsExternes` (cités par l'audit de carte, S8) écrivent en `db.getSync`/`db.setSync` hors file, contrairement au reste de leurs modules. Même famille que S6 ci-dessus ; ce sont les puits d'écriture de `reserve-ouvrir.js`. VÉRIFIÉ.

### 2.5 Ce qui est solide

Même niveau de preuve que les constats. **Ne rien « corriger » ici pendant S6 ou S9.**

- **La discipline `db.modifier` sur les chemins de suppression.** Comptage : sur les **seize** chemins qui retirent un objet d'une collection de travail, **quatorze** passent par `db.modifier` — ils relisent la collection **dans** la file et recalculent l'index **après** la confirmation, avec le commentaire qui l'explique (`grilles.js:3874-3888`, `echelles.js:4353-4366`, `cartouches.js:1820-1824`, `productions.js:3245-3255`, `productions-liste.js:414-417`). Les **deux** exceptions sont les deux chemins de suppression de pratique (`pratique-manager.js:239`, `donnees-v2.js:1550`), nommées en S6. VÉRIFIÉ (comptage refait chemin par chemin, pas repris de l'audit de carte).
- **Le garde d'orphelinage des cartouches du 24 août** (`grilles.js:3841-3869`) : il bloque, il **nomme jusqu'à cinq cartouches**, il dit quoi faire (« supprime-les d'abord, ou déplace-les »). C'est déjà le message que D3-A demande — il servira de gabarit aux autres. Son défaut n'est pas sa forme, c'est la portée de la clé qu'il interroge (B1). VÉRIFIÉ.
- **Le scanner multi-trimestres de `donnees-v2.js`** (`:899-926`, `:1048-1074`, `:1090-1107`, `:1163-1185`) : il énumère les trimestres, lit `<trim>_groupesCours` et `<trim>_evaluationsSauvegardees`, et nomme le trimestre dans son message. C'est l'unique implémentation correcte du dépôt, et la base du diff de S6. VÉRIFIÉ.
- **Le blocage de la modale de Réglages › Données** (`:1444-1448`) : politique D3-A réalisée, bouton désactivé, libellé explicite. VÉRIFIÉ.
- **`enumererTrimestres`** (`trimestres.js:235-239`) : lecture seule, sans effet de bord — corrigé en #300, et c'est ce qui rend les scanners multi-trimestres sûrs à appeler depuis un garde. VÉRIFIÉ.
- **`supprimerEchelleDepuisSidebar` offre une porte de sortie** (`echelles.js:4340-4375`) : quand l'échelle est utilisée, il propose de **migrer** les évaluations vers une autre échelle avant de supprimer. C'est le seul chemin du périmètre qui ne laisse pas l'utilisateur dans une impasse. À conserver et à généraliser, pas à remplacer par un refus sec (§3, note sur D3-A). VÉRIFIÉ.
- **Le vidage bruyant de `grilleId` à la duplication partagée** (`partage-section.js:252-258`) : refus explicite de laisser une copie utilisateur pointer dans `partage_*`, avec message à l'utilisateur. Le bon patron ; il manque seulement sur deux champs (S8). VÉRIFIÉ.
- **`reserve-ouvrir.js` garde la clé de cartouches cohérente avec le champ** (`:1065-1069` + `cartouches.js:4982`). VÉRIFIÉ.
- **Le couple `IDS_GABARITS_HARDCODES` + `marquerRessourceSupprimee`** est appelé **avant** le retrait sur les chemins de bibliothèque (`grilles.js:2726-2729`, `cartouches.js:4786-4789`, commentaire #468/CO-25) : la leçon du 21 août a bien été appliquée là où elle avait été apprise. VÉRIFIÉ.

---

## 3. Correctifs proposés — NON APPLIQUÉS

Chaque diff dit ce qu'il **retire**. Ils sont indépendants et s'appliquent un fichier à la fois.

### Note préalable sur D3-A, à lire avant d'écrire une ligne

D3-A (« bloquer tant que l'objet est référencé, message qui nomme les référents ») n'est **pas** contredite par cette mesure : elle est confirmée, et déjà réalisée dans un chemin sur cinq (§2.3-S4). Un point demande cependant d'être qualifié, et il est remonté à `kuekatsheu-bc` pour arbitrage.

**Un refus qui ne se défait pas est une impasse, pas une garde.** Aujourd'hui, quand une échelle est utilisée, `supprimerEchelleDepuisSidebar` ne refuse pas : il **propose de migrer** les évaluations vers une autre échelle, puis supprime (`echelles.js:4340-4375`). Appliquer D3-A à la lettre sur ce chemin remplacerait une porte de sortie qui fonctionne par un refus sec — et laisserait Grégoire devant 339 évaluations à rouvrir une à une. Les diffs ci-dessous lisent donc D3-A ainsi :

> **bloquer + nommer les référents (trimestre compris) + offrir l'action qui défait**, c'est-à-dire réassigner vers un autre objet là où la réassignation a un sens (échelles, grilles, cartouches, productions) et pointer l'écran où défaire le lien là où elle n'en a pas (pratiques → l'écran des groupes-cours).

**Cette lecture a été retenue par la session de coordination le 30 août 2026 au soir**, comme *qualification* de D3-A et non comme décision neuve ; elle est portée à Grégoire à ce titre. Motif consigné : un blocage qui laisse Grégoire devant 339 évaluations à rouvrir une à une n'est pas une garde, c'est une panne polie — et le principe du projet est que **le code qui ne peut pas faire ce qu'on lui demande le DIT**, il ne se contente pas de refuser.

Si Grégoire tranche pour la version stricte sans porte de sortie, seul le diff **S6-c** change : le bloc de migration disparaît au lieu d'être généralisé, et il faut alors une procédure de réassignation en masse ailleurs — sinon la garde crée le problème qu'elle prévient.

**Ordre imposé.** Le plan fixe S4 → S5 → S6. Le diff **S6-f** est donc écrit **en supposant D2-A livrée** (cartouches namespacées par trimestre) : c'est ce qui rend `db.remove` correct sans garde inter-trimestres jetable. Si S6 devait passer avant S5 — ce qui n'est pas le plan — ce diff ne s'applique pas tel quel.

---

### S6-a — Un point unique de vérité pour les références entrantes (nouveau fichier)

Le scanner correct existe déjà : il est dans `donnees-v2.js`, il énumère les trimestres, et il nomme le trimestre. Le diff le **déplace** vers un module dédié — il ne le duplique pas — et le complète des références qu'aucun scanner ne regarde aujourd'hui (`production.cartoucheId`, `cartouche.echelleId`, `carte.metadata.productionId`, `pratique.configuration.*`).

```diff
--- /dev/null
+++ b/js/integrite-references.js
+/* ============================================================================
+   INTÉGRITÉ RÉFÉRENTIELLE — point unique de vérité (#624, D3-A)
+   ----------------------------------------------------------------------------
+   Répond à UNE question : « qui pointe vers cet objet, et où ? »
+   LECTURE SEULE. Ne supprime rien, ne répare rien.
+
+   Ce module REMPLACE quatre implémentations divergentes, retirées par les
+   diffs S6-b à S6-f :
+     · donnees-v2.js:899-1185  — calculerUsages* / verifierDependances* (DÉPLACÉ ici,
+       et corrigé : il lisait `pratique.echelleId`, que personne n'écrit)
+     · pratiques.js:282-298    — getCoursUtilisantPratique (lisait `cours[].pratiqueId`,
+       alimenté par une seule migration à valeur constante)
+     · echelles.js:4269-4286   — verifierUtilisationEchelle (trimestre actif seulement)
+     · grilles.js:3858, 2677   — le comptage local de `cartouches_<id>`
+   ========================================================================= */
+(function () {
+    'use strict';
+
+    function trimestres() {
+        // enumererTrimestres est en LECTURE SEULE depuis #300 : sûr dans un garde.
+        return (typeof enumererTrimestres === 'function') ? enumererTrimestres() : [];
+    }
+
+    function nomTrimestre(t) { return t.nom || t.id; }
+
+    /**
+     * @returns {Array<{quoi, combien, ou, exemples:Array<string>}>}
+     *   `ou` porte TOUJOURS le nom du trimestre : c'est ce que D3-A exige de nommer.
+     */
+    function referentsDe(type, id) {
+        var refs = [];
+        var ts = trimestres();
+
+        function scanner(collection, champ, quoi, t) {
+            var touches = (collection || []).filter(function (o) { return o && o[champ] === id; });
+            if (touches.length === 0) return;
+            refs.push({
+                quoi: quoi,
+                combien: touches.length,
+                ou: nomTrimestre(t),
+                exemples: touches.slice(0, 3).map(function (o) {
+                    return o.nom || o.titre || o.id || '(sans nom)';
+                })
+            });
+        }
+
+        for (var i = 0; i < ts.length; i++) {
+            var t = ts[i];
+            var prods = db.getSync(t.id + '_productions', []) || [];
+            var evals = db.getSync(t.id + '_evaluationsSauvegardees', []) || [];
+            var prats = db.getSync(t.id + '_pratiquesConfigurables', []) || [];
+            var gcs   = db.getSync(t.id + '_groupesCours', []) || [];
+
+            if (type === 'grille') {
+                scanner(prods, 'grilleId', 'production(s)', t);
+                scanner(evals, 'grilleId', 'évaluation(s)', t);
+                scannerPratiques(prats, 'grilleId', t, refs);
+            } else if (type === 'echelle') {
+                scanner(prods, 'echelleId', 'production(s)', t);
+                scanner(evals, 'echelleId', 'évaluation(s)', t);
+                scannerPratiques(prats, 'echelleId', t, refs);
+            } else if (type === 'cartouche') {
+                scanner(prods, 'cartoucheId', 'production(s)', t);
+                scanner(evals, 'cartoucheId', 'évaluation(s)', t);
+            } else if (type === 'production') {
+                scanner(evals, 'productionId', 'évaluation(s)', t);
+                scannerCarte(t, id, refs);
+            } else if (type === 'pratique') {
+                scanner(gcs, 'pratiqueId', 'groupe(s)-cours', t);
+            }
+        }
+
+        // Cartouches : clé GLOBALE aujourd'hui, namespacée après D2-A (S5).
+        // Ce site est le SEUL du module à dépendre du régime de portée ; il suit
+        // ce que `cle()` répond, donc il n'aura pas à être retouché en S5.
+        if (type === 'grille') {
+            var carts = db.getSync(cleCartouches(id), []) || [];
+            if (carts.length > 0) {
+                refs.push({
+                    quoi: 'cartouche(s) de rétroaction', combien: carts.length,
+                    ou: 'rattachée(s) à cette grille',
+                    exemples: carts.slice(0, 3).map(function (c) { return (c && c.nom) || '(sans nom)'; })
+                });
+            }
+        }
+        if (type === 'echelle') scannerCartouchesParEchelle(id, refs);
+        return refs;
+    }
+
+    /** Message D3-A : nomme QUI, COMBIEN, OÙ, et QUOI FAIRE. */
+    function messageRefus(nomObjet, refs, actionPossible) {
+        var lignes = refs.map(function (r) {
+            return '· ' + r.combien + ' ' + r.quoi + ' — ' + r.ou +
+                   ' (' + r.exemples.join(', ') + (r.combien > 3 ? '…' : '') + ')';
+        });
+        return 'Impossible de supprimer « ' + nomObjet +' ».\n\n' +
+               'Ce qui l\'utilise encore :\n' + lignes.join('\n') + '\n\n' +
+               (actionPossible || 'Défais ces liens d\'abord, puis reviens supprimer.');
+    }
+
+    window.IntegriteReferences = { referentsDe: referentsDe, messageRefus: messageRefus };
+})();
```

```diff
--- a/index.html
+++ b/index.html
@@ avant js/donnees-v2.js (l.14476) — aucun autre module ne doit le précéder
+    <script src="js/integrite-references.js?v=AAAAMMJJx"></script>
```

**Interaction avec S5, à ne pas manquer.** Le rapport Z1 mesure **quinze sites, dans neuf fichiers, qui énumèrent les clés par le préfixe `cartouches_`** et qui cesseraient de trouver quoi que ce soit — en silence — le jour où la clé devient `<trim>_cartouches_<grilleId>`. `scannerCartouchesParEchelle`, ci-dessus, en serait un seizième : il doit donc être écrit d'emblée sur la forme que rend `cle()`, comme l'est déjà `cleCartouches(id)`. Même remarque pour le **diagnostic console du §4**, qui balaie lui aussi par préfixe : après S5, sa ligne `k.indexOf('cartouches_') === 0` devra accepter les deux formes, sans quoi il rendra « zéro magasin fantôme » et ce zéro sera faux.

**À retirer** (dans les diffs suivants) : `donnees-v2.js:899-1185` (les cinq `calculerUsages*` et les cinq `verifierDependances*`), `pratiques.js:282-298`, `echelles.js:4269-4286`, et les deux comptages locaux de cartouches de `grilles.js`. **À écrire ensuite** : les trois fonctions internes laissées en appel ci-dessus (`scannerPratiques` — qui lit `configuration.*` **et** `config.*`, cf. le double format S7 de l'audit de carte ; `scannerCarte` — `metadata.productionId` dans `<trim>_planification_mindmap`; `scannerCartouchesParEchelle` — balayage des clés `cartouches_*`).

**Sentinelle exigée** (règle 4 du cadre) : un cas où l'objet est référencé **dans un autre trimestre que l'actif** doit rendre un référent non vide. Break-test : muter `t.id + '_evaluationsSauvegardees'` en `cle('evaluationsSauvegardees')` → ROUGE obtenu, remettre → VERT. Muter aussi le second membre du `&&` de `scannerPratiques` (`configuration` / `config`) : les deux côtés doivent rougir séparément.

### S6-b — Grilles : trois chemins branchés sur le point unique, un chemin mort retiré

```diff
--- a/js/grilles.js
+++ b/js/grilles.js
@@ supprimerGrille (l.929)
 async function supprimerGrille(grilleId) {
-    if (!confirm('Es-tu sûr de vouloir supprimer cette grille ?')) {
-        return;
-    }
+    // D3-A (#624) : aucun chemin ne supprime un objet référencé. Le refus NOMME.
+    var grille = ((await db.get(cle('grillesTemplates'))) || []).find(function (g) { return g.id === grilleId; });
+    var refs = window.IntegriteReferences.referentsDe('grille', grilleId);
+    if (refs.length > 0) {
+        alert(window.IntegriteReferences.messageRefus(
+            (grille && grille.nom) || 'cette grille', refs,
+            'Ouvre chaque production ou évaluation et choisis une autre grille, ' +
+            'ou supprime d\'abord les cartouches rattachées.'));
+        return;
+    }
+    if (!confirm('Es-tu sûr de vouloir supprimer cette grille ?')) return;
@@ supprimerGrilleActive (l.3933) — le bouton de l'éditeur ouvert
 async function supprimerGrilleActive() {
     if (!grilleTemplateActuelle) {
         alert('Aucune grille en cours d\'édition');
         return;
     }
-
-    if (!confirm('Es-tu sûr de vouloir supprimer cette grille ?')) {
-        return;
-    }
-
-    let supprimee = false;
-    await db.modifier(cle('grillesTemplates'), (lues) => {
-        const grilles = lues || [];
-        const i = grilles.findIndex(g => g.id === grilleTemplateActuelle.id);
-        if (i === -1) return undefined;
-        grilles.splice(i, 1);
-        supprimee = true;
-        return grilles;
-    }, []);
-
-    if (supprimee) {
-        const nomGrille = grilleTemplateActuelle.nom || 'Grille';
-        window.marquerRessourceSupprimee(grilleTemplateActuelle.id);
-        annulerFormGrille();
-        await afficherListeGrilles();
-        notifications.succes(`Grille "${nomGrille}" supprimée`);
-    }
+    // Délégation, comme `dupliquerGrilleActive` six lignes plus haut et comme
+    // `supprimerEchelleActive` (echelles.js:4426). Deux boutons, un seul geste.
+    await supprimerGrilleDepuisSidebar(grilleTemplateActuelle.id);
 }
@@ supprimerGrilleDepuisSidebar (l.3858) — le garde local cède la place au point unique
-    const cartouchesLiees = await db.get(`cartouches_${id}`) || [];
-    if (cartouchesLiees.length > 0) {
-        const noms = cartouchesLiees.slice(0, 5).map(c => (c && c.nom) || 'sans nom').join(', ');
-        const reste = cartouchesLiees.length > 5 ? `, et ${cartouchesLiees.length - 5} autre(s)` : '';
-        alert( … );
-        return;
-    }
+    var grilleS = ((await db.get(cle('grillesTemplates'))) || []).find(function (g) { return g.id === id; });
+    var refsS = window.IntegriteReferences.referentsDe('grille', id);
+    if (refsS.length > 0) {
+        alert(window.IntegriteReferences.messageRefus(
+            (grilleS && grilleS.nom) || 'cette grille', refsS,
+            'Supprime-les d\'abord, ou déplace-les vers une autre grille — sinon elles deviendraient introuvables.'));
+        return;
+    }
@@ supprimerGrilleDefinitivement (l.2677) — idem
-    const cartouches = await db.get(`cartouches_${id}`) || [];
-    if (cartouches.length > 0) {
-        alert(`Impossible de supprimer cette grille.\n\n${cartouches.length} cartouche(s) y sont associée(s).\nSupprimez d'abord les cartouches.`);
-        return;
-    }
+    var refsD = window.IntegriteReferences.referentsDe('grille', id);
+    if (refsD.length > 0) { alert(window.IntegriteReferences.messageRefus(grille.nom, refsD)); return; }
```

**À retirer** : le corps dupliqué de `supprimerGrilleActive` (l.3937-3966, y compris son `marquerRessourceSupprimee` **inconditionnel** — le chemin délégué ne pose le tombstone que pour un gabarit, ce qui est la règle des quatre autres chemins) ; les deux comptages locaux de `cartouches_<id>` (l.2677-2682 et l.3858-3869) ; **le message de la l.3859-3866 n'est pas perdu** — il devient le paramètre `actionPossible`, c'est le meilleur des cinq et il sert de gabarit. À retirer aussi, hors périmètre de garde mais dans le même fichier : `afficherGrillesCriteres` (l.794-870) et son bouton mort (M5) — à faire en S8, pas ici, pour ne pas mêler retrait et garde dans une même sentinelle.

### S6-c — Échelles : la porte de sortie devient la règle, et elle voit tous les trimestres

```diff
--- a/js/echelles.js
+++ b/js/echelles.js
@@ supprimerEchelle (l.953) — aucun garde aujourd'hui
 async function supprimerEchelle(echelleId) {
+    var ech = ((await db.get(cle('echellesTemplates'))) || []).find(function (e) { return e.id === echelleId; });
+    var refs = window.IntegriteReferences.referentsDe('echelle', echelleId);
+    if (refs.length > 0) {
+        // Même politique que la barre latérale : on refuse, on nomme, et on
+        // renvoie vers le seul geste qui défait — la réassignation.
+        alert(window.IntegriteReferences.messageRefus((ech && ech.nom) || 'cette échelle', refs,
+            'Passe par la barre latérale pour réassigner ces évaluations à une autre échelle avant de supprimer.'));
+        return;
+    }
     if (!confirm('Supprimer cette échelle ?')) return;
@@ verifierUtilisationEchelle (l.4269-4286) — RETIRÉE, remplacée par le point unique
-async function verifierUtilisationEchelle(echelleId) {
-    let evaluations = await db.get(cle('evaluationsSauvegardees'));
-    …
-}
@@ supprimerEchelleDepuisSidebar (l.4309)
-    const utilisation = await verifierUtilisationEchelle(id);
-    if (utilisation.utilisee) {
+    var refs = window.IntegriteReferences.referentsDe('echelle', id);
+    if (refs.length > 0) {
@@ le message d'ouverture
-        let message = `⚠️ ATTENTION : L'échelle "${nomEchelle}" est utilisée par ${utilisation.nbEvaluations} évaluation(s) existante(s).\n\n`;
+        // D3-A : le message NOMME les référents et leur trimestre. Le compte seul
+        // ne dit pas à Grégoire où aller défaire le lien.
+        var message = window.IntegriteReferences.messageRefus(nomEchelle, refs, '') + '\n\n';
@@ après la migration (l.4353)
-                    const nbMigrees = await migrerEvaluationsVersNouvelleEchelle(id, nouvelleEchelle.id);
+                    // #624 : la migration ne couvre QUE les évaluations. Tant que des
+                    // productions, des cartouches ou des pratiques pointent l'échelle,
+                    // on ne supprime pas — on le dit, on ne le devine pas.
+                    const nbMigrees = await migrerEvaluationsVersNouvelleEchelle(id, nouvelleEchelle.id);
+                    var restants = window.IntegriteReferences.referentsDe('echelle', id);
+                    if (restants.length > 0) {
+                        alert(window.IntegriteReferences.messageRefus(nomEchelle, restants,
+                            nbMigrees + ' évaluation(s) ont bien été migrées. L\'échelle est conservée : ' +
+                            'ce qui reste ci-dessus doit être réassigné à la main.'));
+                        await afficherListeEchelles();
+                        return;
+                    }
```

**À retirer** : `verifierUtilisationEchelle` en entier (l.4269-4286) et ses deux appels. **Non retiré, et c'est délibéré** : `migrerEvaluationsVersNouvelleEchelle` (l.4294-4306) reste — c'est la porte de sortie. Sa forme (read-modify-write asynchrone hors file, constat S8 de l'audit de carte) est un **défaut distinct**, à corriger dans le même passage puisqu'on y touche : `await db.modifier(cle('evaluationsSauvegardees'), …)` à la place du couple `db.get`/`db.set`, ce qui fige la clé et sérialise l'écriture. C'est un ajout au périmètre de S6 par rapport au plan — il est signalé plutôt que fait en douce.

**Sentinelle** : une échelle référencée par une **production** (et par aucune évaluation) doit être refusée. Break-test : retirer la ligne `scanner(prods, 'echelleId', …)` du module → ROUGE ; remettre → VERT. C'est le cas exact que les deux gardes d'aujourd'hui laissent passer.

### S6-d — Cartouches et productions : la garde qui n'existait nulle part

```diff
--- a/js/cartouches.js
+++ b/js/cartouches.js
@@ supprimerCartoucheConfirm (l.1807)
     if (cartouche && cartouche.verrouille) { … }
+    var refs = window.IntegriteReferences.referentsDe('cartouche', cartoucheId);
+    if (refs.length > 0) {
+        alert(window.IntegriteReferences.messageRefus((cartouche && cartouche.nom) || 'cette cartouche', refs,
+            'Les rétroactions déjà écrites avec cette cartouche resteraient sans modèle. ' +
+            'Ouvre ces évaluations et choisis une autre cartouche avant de supprimer.'));
+        return;
+    }
     if (confirm(`Es-tu sûr de vouloir supprimer la cartouche «${cartouche?.nom}» ?`)) {
```

```diff
--- a/js/productions-liste.js
+++ b/js/productions-liste.js
@@ supprimerProductionActive (l.403)
-    if (!confirm('Es-tu sûr de vouloir supprimer cette production ?')) {
-        return;
-    }
+    var refs = window.IntegriteReferences.referentsDe('production', productionEnEdition);
+    if (refs.length > 0) {
+        alert(window.IntegriteReferences.messageRefus(nomProductionEnEdition(), refs,
+            'Les évaluations déjà faites perdraient leur production, et les blocs ' +
+            'de la carte mentale qui la désignent deviendraient muets.'));
+        return;
+    }
+    if (!confirm('Es-tu sûr de vouloir supprimer cette production ?')) return;
```

```diff
--- a/js/productions.js
+++ b/js/productions.js
@@ le wrapper window.supprimerProduction (l.3240)
-window.supprimerProduction = async function(id) {
-    if (!confirm('Supprimer cette production ?')) return;
+window.supprimerProduction = async function(id) {
+    var refs = window.IntegriteReferences.referentsDe('production', id);
+    if (refs.length > 0) { alert(window.IntegriteReferences.messageRefus(nomProduction(id), refs)); return; }
+    if (!confirm('Supprimer cette production ?')) return;
```

```diff
--- a/js/productions-bibliotheque-ui.js
+++ b/js/productions-bibliotheque-ui.js
@@ supprimerProductionDefinitivement (l.693) — le nom dit « bibliothèque », le code retire du TRAVAIL
     if (!production) return;
+    var refs = window.IntegriteReferences.referentsDe('production', id);
+    if (refs.length > 0) {
+        alert(window.IntegriteReferences.messageRefus(production.titre, refs));
+        return;
+    }
     const okSuppr = await uiDialogues.confirmerAction({ … });
```

**À retirer** : `supprimerProduction` (productions.js:2150-2159), morte depuis que le wrapper de la l.3240 l'écrase (M4 de l'audit de carte) — la retirer ici évite d'y poser un garde qui ne s'exécutera jamais, et de laisser croire à un chemin protégé. Vérifier avant retrait : `grep -n "supprimerProduction" js/ index.html` (y compris `data-action`), puis `grep -n "window.supprimerProduction" js/` dans le résidu.

**Décision à consigner, pas à improviser** : `verifierDependancesCartouche` (donnees-v2.js:1121) pose aujourd'hui, en toutes lettres, que « les cartouches n'ont pas de dépendances bloquantes ». Le diff ci-dessus **renverse** ce choix. C'est cohérent avec D3-A, mais c'est un renversement — à porter dans le message de commit et dans `SESSION.md`, pas à laisser se découvrir plus tard.

### S6-e — Pratiques : lire la SSOT, et rien d'autre

```diff
--- a/js/pratiques.js
+++ b/js/pratiques.js
@@ getCoursUtilisantPratique (l.282-298) — RETIRÉE
-function getCoursUtilisantPratique(pratiqueId) {
-    const cours = db.getSync('cours', []);
-    …
-    return cours.filter(c => _normPratique(c.pratiqueId) === _normPratique(pratiqueId));
-}
@@ supprimerPratique (l.1128)
-    const coursUtilisant = getCoursUtilisantPratique(id);
-    if (coursUtilisant.length > 0) {
-        const listeCours = coursUtilisant.map(c => c.sigle).join(', ');
-        alert(`❌ Impossible de supprimer cette pratique\n\nElle est actuellement utilisée par ${coursUtilisant.length} cours :\n${listeCours}\n\nVous devez d'abord modifier ces cours pour utiliser une autre pratique.`);
-        return;
-    }
+    // La SSOT d'activation est `groupesCours[].pratiqueId`, NAMESPACÉE par trimestre
+    // (pratique-manager.js:91). `cours[].pratiqueId` ne l'est pas : son seul écrivain
+    // est une migration de boot qui écrit toujours 'pan-standards' (cours.js:69).
+    var refs = window.IntegriteReferences.referentsDe('pratique', id);
+    if (refs.length > 0) {
+        alert(window.IntegriteReferences.messageRefus((pratique && pratique.nom) || 'cette pratique', refs,
+            'Ouvre chaque groupe-cours nommé ci-dessus et choisis-y une autre pratique avant de supprimer.'));
+        return;
+    }
```

```diff
--- a/js/pratiques/pratique-manager.js
+++ b/js/pratiques/pratique-manager.js
@@ supprimerPratique (l.224)
+        // Garde EN PROFONDEUR : ce point est atteint par trois chemins d'interface
+        // (pratiques.js, comparateur-pratiques.js, et tout appel programmatique).
+        // Le refus vit ici, pas seulement dans l'écran qui l'a demandé.
+        var refs = window.IntegriteReferences.referentsDe('pratique', pratiqueId);
+        if (refs.length > 0) {
+            throw new Error(window.IntegriteReferences.messageRefus(
+                pratiques[index].nom || pratiqueId, refs));
+        }
-        pratiques.splice(index, 1);
-        db.setSync(cle('pratiquesConfigurables'), pratiques);
+        // #522 : l'index est recalculé DANS la file ; celui d'avant le garde ne vaut plus rien.
+        await db.modifier(cle('pratiquesConfigurables'), function (lues) {
+            var liste = lues || [];
+            var i = liste.findIndex(function (p) { return p.id === pratiqueId; });
+            if (i === -1) return undefined;
+            liste.splice(i, 1);
+            return liste;
+        }, []);
```

**À retirer** : `getCoursUtilisantPratique` (pratiques.js:282-298) et ses appels ; le couple `getSync`/`splice`/`setSync` de pratique-manager.js:225-239. Avant de retirer `getCoursUtilisantPratique`, grep dans tout `js/` — elle porte un nom générique et peut avoir des appelants hors du chemin de suppression.

**Sentinelle Node** : `db.set` est synchrone sous Node, une course d'écriture y est invisible. Forcer `useIndexedDB` avec une fausse connexion (patron `tests/unit/sentinelle-522-pratiques-serialisees.test.js`), sinon le test passe au vert sur le code **non** corrigé.

### S6-f — Réglages › Données : refermer B1, et faire descendre le garde dans la fonction

Ce diff suppose **D2-A livrée** (S5) : `cle('cartouches_' + grilleId)` rend alors une clé namespacée.

```diff
--- a/js/donnees-v2.js
+++ b/js/donnees-v2.js
@@ supprimerGrilleDefinitivement (l.1564)
 async function supprimerGrilleDefinitivement(grilleId) {
+    // GARDE EN PROFONDEUR (#624) : la modale peut être contournée — bouton réactivé,
+    // appel programmatique, data-action déclenché autrement. Le refus vit ICI.
+    var refs = window.IntegriteReferences.referentsDe('grille', grilleId);
+    if (refs.length > 0) { console.warn('[donnees-v2] suppression refusée :', refs); return false; }
     if (window.IDS_GABARITS_HARDCODES && window.IDS_GABARITS_HARDCODES.includes(grilleId)) {
         window.marquerRessourceSupprimee(grilleId);
     }
-    // Supprimer les cartouches associées à cette grille
     try {
-        await db.remove(`cartouches_${grilleId}`);
+        // ⚠ B1 (#620) : la clé NUE est GLOBALE. Ce `remove` effaçait les cartouches
+        // de la grille homonyme des AUTRES trimestres, alors que le commentaire
+        // ci-dessous annonce l'inverse. Sous D2-A la clé est namespacée : le geste
+        // redevient ce que son commentaire promet.
+        await db.remove(cle('cartouches_' + grilleId));
     } catch (e) { … }
@@ les quatre autres supprimerXDefinitivement (l.1543, 1608, 1624, 1657)
+    // même garde en tête, même forme, même `return false`
@@ confirmerSuppressionRessource (l.1489)
     const { type, id, nom } = ressourceASupprimer;
+    // Le bouton était désactivé à l'ouverture (l.1444-1448) ; on revérifie avant
+    // d'écrire. Un attribut DOM n'est pas une garde.
+    if (window.IntegriteReferences.referentsDe(type, id).length > 0) {
+        alert(window.IntegriteReferences.messageRefus(nom, window.IntegriteReferences.referentsDe(type, id)));
+        fermerModalSuppressionRessource();
+        return;
+    }
@@ ouvrirModalSuppressionRessource (l.1352-1387) — les cinq verifierDependances* cèdent la place
-        const deps = verifierDependancesGrille(id);
-        dependances = deps.dependances;
-        avertissements = deps.avertissements;
+        dependances = window.IntegriteReferences.referentsDe('grille', id).map(function (r) {
+            return r.combien + ' ' + r.quoi + ' — ' + r.ou + ' (' + r.exemples.join(', ') + ')';
+        });
@@ supprimerPratiqueDefinitivement (l.1547)
-        let configurables = db.getSync(cle('pratiquesConfigurables')) || [];
-        configurables = configurables.filter(p => p.id !== pratiqueId);
-        db.setSync(cle('pratiquesConfigurables'), configurables);
+        await db.modifier(cle('pratiquesConfigurables'), function (lues) {
+            var liste = (lues || []).filter(function (p) { return p.id !== pratiqueId; });
+            return liste.length === (lues || []).length ? undefined : liste;
+        }, []);
```

**À retirer** : les cinq `verifierDependancesX` (l.1076-1185) et les cinq `calculerUsagesX` (l.899-1039) — **déplacés** en S6-a, pas dupliqués ; le couple `getSync`/`setSync` de l.1547-1551 et son `catch` dont le message parle de « calcul usages » alors qu'il enveloppe une écriture. Les tableaux de `afficherTableauXV2` (l.721-790) appellent `calculerUsagesX` : ils doivent basculer sur `referentsDe` dans le même passage, sinon ils cassent — **c'est le point de rupture de ce diff, à traiter en premier**, et c'est aussi lui qui fait disparaître le « Non utilisée » systématique des échelles (§2.3-S2).

### S9-a — Unifier les quatre remaps sur `reserve-ouvrir`, pas sur #448 seul

Le plan (T2.4) prescrit d'unifier sur l'implémentation #448 (`import-export.js:2429`). La mesure conduit à corriger cette cible : **`reserve-ouvrir.js:1057-1076` est plus complet** — il réécrit `cartouche.grilleId`, ce qui suffit à déplacer la clé de stockage, alors que #448 remappe la clé et laisse le champ divergent (§2.3-S7). La règle unique doit donc être extraite de `reserve-ouvrir`, complétée des deux trous qu'il partage avec les autres, puis appelée par les quatre.

```diff
--- /dev/null
+++ b/js/import-remap.js
+/* ============================================================================
+   REMAP DE RÉFÉRENCES À L'IMPORT — règle unique (#627)
+   Remplace QUATRE implémentations : import-export.js:2429 (codex),
+   import-export.js:2750 (sélectif, qui n'en avait aucune), partage-import.js:146,
+   reserve-ouvrir.js:1057 (la plus complète, dont ce module est extrait).
+   ========================================================================= */
+(function () {
+    'use strict';
+    function patcher(item, type, remapGrilles, remapEchelles, remapCartouches) {
+        if (!item) return item;
+        if (type === 'production' || type === 'cartouche') {
+            if (item.grilleId && remapGrilles[item.grilleId]) item.grilleId = remapGrilles[item.grilleId];
+        }
+        if (type === 'production' || type === 'cartouche') {
+            // TROU COMMUN AUX QUATRE : `cartouche.echelleId` n'était remappé nulle part.
+            if (item.echelleId && remapEchelles[item.echelleId]) item.echelleId = remapEchelles[item.echelleId];
+        }
+        if (type === 'production') {
+            // TROU COMMUN AUX QUATRE : `production.cartoucheId` n'était remappé nulle part.
+            if (item.cartoucheId && remapCartouches[item.cartoucheId]) item.cartoucheId = remapCartouches[item.cartoucheId];
+        }
+        if (type === 'pratique') {
+            // Les DEUX formats. reserve-ouvrir.js ne patchait que `config`, alors que
+            // le seul écrivain du dépôt écrit `configuration` (pratiques-gestion.js:1619) :
+            // le remap des pratiques y était inopérant.
+            ['configuration', 'config'].forEach(function (porte) {
+                var c = item[porte];
+                if (!c) return;
+                if (c.echelleId && remapEchelles[c.echelleId]) c.echelleId = remapEchelles[c.echelleId];
+                if (c.grilleId && remapGrilles[c.grilleId]) c.grilleId = remapGrilles[c.grilleId];
+            });
+        }
+        return item;
+    }
+    window.ImportRemap = { patcher: patcher };
+})();
```

```diff
--- a/js/import-export.js
+++ b/js/import-export.js
@@ import codex, après la boucle des productions (l.2516-2527)
-                if (prod.grilleId && remapGrilles[prod.grilleId]) { prod.grilleId = remapGrilles[prod.grilleId]; }
-                if (prod.echelleId && remapEchelles[prod.echelleId]) { prod.echelleId = remapEchelles[prod.echelleId]; }
+                window.ImportRemap.patcher(prod, 'production', remapGrilles, remapEchelles, remapCartouches);
@@ import codex, cartouches (l.2545-2563) — la clé ET le champ
                 const grilleIdFinal = remapGrilles[ancienGrilleId] || ancienGrilleId;
-                if (remapGrilles[ancienGrilleId]) {
-                }
+                // La clé de stockage DÉRIVE du champ : les réécrire ensemble, sinon
+                // `cartouche.grilleId` désigne une grille qui n'existe plus (#448).
                 const cartouchesAssainis = cartouchesGrille.map(c =>
-                    assainirObjet(c, SCHEMAS_IMPORT.cartouche));
+                    window.ImportRemap.patcher(assainirObjet(c, SCHEMAS_IMPORT.cartouche),
+                                               'cartouche', remapGrilles, remapEchelles, remapCartouches));
@@ résumé des remappages (l.2591-2596)
-        if (nbRemapEchelles > 0 || nbRemapGrilles > 0) {
-            if (nbRemapEchelles > 0) {
-            }
-            if (nbRemapGrilles > 0) {
-            }
-        }
@@ import sélectif (l.2782-2870) — il n'a AUCUNE table ; en construire une
-                                const idExiste = grillesExistantes.some(ge => ge.id === g.id);
-                                grillesNouvelles.push({ … ...(idExiste ? { id: genererIdUnique('GRILLE_') } : {}), … });
+                                const idExiste = grillesExistantes.some(ge => ge.id === g.id);
+                                var idNeuf = idExiste ? genererIdUnique('GRILLE_') : g.id;
+                                if (idExiste) remapGrilles[g.id] = idNeuf;   // ← la table qui manquait
+                                grillesNouvelles.push({ …, id: idNeuf, … });
```

**À retirer** : les deux blocs conditionnels vides de `import-export.js` (M2) ; les patchs de référence en ligne de `reserve-ouvrir.js:1056-1078` (`_patcherReferences`, remplacée par l'appel au module) ; le remap partiel de `partage-import.js:172-178`, remplacé par le même appel.

**Piège à traiter AVANT ce diff** (M3) : `import-export.js:2786` et `:2861` nomment leur variable de boucle `cle`, ce qui shadowe la fonction globale `cle()` dans ces deux blocs. Renommer d'abord (`cleSource`), sinon le premier `cle('…')` ajouté à l'intérieur lèvera un `TypeError` invisible à la relecture.

**Ce que ce diff ne fait pas, et qui doit être dit** : il ne crée pas de `remapCartouches`. Les quatre implémentations attribuent aujourd'hui un id neuf à une cartouche sans le mémoriser. Construire cette table est le vrai travail de S9 ; le module ci-dessus en prépare seulement la place. Tant qu'elle est vide, `production.cartoucheId` reste non remappé — le trou est nommé, pas encore fermé.

##### Recomptage du 31 août 2026 — correction additive (#638)

*Ajouté par `kuekatsheu-67`, mandatée par `kuekatsheu-c8`. Le paragraphe ci-dessus reste lisible tel qu'écrit le 30 août. Un constat retiré en silence redevient une source qu'on ne peut plus recouper.*

**« Les quatre implémentations attribuent aujourd'hui un id neuf à une cartouche sans le mémoriser » est faux pour trois d'entre elles**, et pour deux il désigne le mauvais endroit du code.

| Implémentation | Id neuf frappé ? | Mémorisé ? |
|---|---|---|
| import codex #448 (`import-export.js:2429`) | oui — `fusionnerParIdentite:169-170`, appelée `:2562` | **non** : la paire part en `console.warn` `:173`, le retour `:187` ne rend que des compteurs |
| import sélectif (`:2750`) | oui — même helper, appelé `:2933` | **non** : idem, l'appelant ne lit que `.liste` |
| partage `prefixerEntites` (`partage-import.js:146`) | oui — `:152-158` | **OUI, table complète** : `correspondance.cartouche[ancien] = prefixe + ancien` |
| reserve-ouvrir (`:1036`) | oui — `_faireCopie:983` via `_preparerEtPatcher` `:1097` | **non, par asymétrie** (voir ci-dessous) |

**Le remède change de place pour les deux chemins de `import-export.js`.** Le mint n'est pas dans la branche cartouches : il est dans `fusionnerParIdentite`, helper **partagé par cinq collections** — échelles (`:2463`, `:2842`), grilles (`:2489`, `:2814`), productions (`:2533`, `:2904`), cartouches (`:2562`, `:2933`) et **pratiques** (`:2775`), soit **neuf sites d'appel** — `grep -n "fusionnerParIdentite(" js/import-export.js` en rend dix lignes, la dixième étant la définition `:134`. Faire rendre au helper ses renommages couvre les cinq d'un seul geste — et referme un trou que ce rapport ne nomme pas : les mints du helper pour **échelles, grilles, productions et pratiques** n'entrent pas non plus dans `remapEchelles`/`remapGrilles`. Quatre familles oubliées en plus des cartouches.

**`partage-import.js` n'a rien à construire.** La table existe, et l'id neuf y est une fonction PURE de l'ancien (`prefixe + item.id`, `:156`) : recalculable même sans table. Seule l'APPLICATION manque — `:174-178` ne patche que `grilleId`, alors que `correspondance.cartouche` et `correspondance.echelle` sont remplies à côté.

**`reserve-ouvrir.js` a déjà le patron, huit lignes plus haut.** `_preparerEtCollecter(items, prefix, table)` mémorise (`:1048`, `if (table && item.id) table[item.id] = copie.id;`) ; son jumeau `_preparerEtPatcher` n'a pas de paramètre `table`. Les deux passes « collecter » (grilles `:1094`, échelles `:1095`) mémorisent ; les trois passes « patcher » (productions `:1096`, cartouches `:1097`, pratiques `:1098`) non. Ajouter le troisième paramètre suffit.

⮕ **S9 / #627 est donc plus petit qu'annoncé sur trois implémentations sur quatre.** Un diff d'audit est une esquisse, jamais une spécification : le grepper avant de le chiffrer.

**Le piège M3 ne s'étend pas à `partage-import.js`.** Un seul masquage (`:245`, `var cle = CLES_STOCKAGE[type]`), et le fichier ne fait AUCUN appel à `cle()` — le masquage y est inoffensif. Témoin du zéro : `grep -c "window\.cle(\|[^.a-zA-Z]cle(" js/partage-import.js` rend 0, la même commande sur `js/import-export.js` rend 16 ; la commande sait trouver des appels, le zéro est donc un vrai zéro. Le sous-comptage du shadowing reste un motif à surveiller (`import-export.js` : 2 annoncés / 20 mesurés · `cartouches.js` : 1 / 4), pas une loi vérifiée partout — forcer le troisième cas aurait été fabriquer la régularité qu'on prétend mesurer.

**Datation.** `git log -S` sur `fusionnerParIdentite` (`js/import-export.js`), `_preparerEtPatcher` (`js/reserve-ouvrir.js`) et `prefixerEntites` (`js/partage-import.js`). Le plus récent des trois : **`6006474e`** (2026-08-18) ; `prefixerEntites` et sa table datent de `d09100e5` (2026-06-10), `_preparerEtPatcher` de `4949b2e6` (2026-04-28). **Hash de péremption : `6006474e`** — rejouer les trois commandes avant de se servir du tableau ci-dessus.

**Ce que cette correction n'établit pas.** Tout ci-dessus est statique : aucun import n'a été exécuté. « La paire est jetée » est une lecture du retour de la fonction (`:187`), pas l'observation d'une référence pendante en base. Et le `console.warn` de `:173` n'a pas été cherché récursivement du côté d'un éventuel lecteur.

### S8-a — Duplication partagée : le garde bruyant sur les trois champs, pas sur un

```diff
--- a/js/partage-section.js
+++ b/js/partage-section.js
@@ duplication d'une production (l.259)
+            // Le garde de `grilleId` (l.252-258) existait déjà : une copie utilisateur
+            // ne doit JAMAIS pointer dans le namespace partage_*. Il manquait sur les
+            // deux autres champs, qui produisaient des références pendantes muettes.
+            ['echelleId', 'cartoucheId'].forEach(function (champ) {
+                if (copieP[champ] && String(copieP[champ]).indexOf('PARTAGE_') === 0) {
+                    console.warn('[partage-section] ' + champ + ' partagé non résolu pour la production', id, '— référence vidée');
+                    copieP[champ] = '';
+                    complement += ' (son ' + (champ === 'echelleId' ? 'échelle' : 'cartouche') + ' n\'était pas dans le paquet : à réassocier)';
+                }
+            });
             ajouterACollection(cleProductions(), copieP);
```

**À retirer** : rien. C'est une extension d'un garde existant à deux champs qu'il ignorait. Hors périmètre de S6 : à faire en S9 avec les remaps, dont il est le symétrique côté partage.

---

## 4. Inventaire des orphelins (T2.2) — à remplir par Grégoire

Le diagnostic est **en lecture seule** : il n'écrit rien, ne répare rien. Il se colle en une fois dans la console de l'onglet de l'application (Safari), rend un objet et le dépose dans `window._diag620`. Il a été validé sur un corpus de test monté hors du dépôt (code de sortie 0 ; les huit familles de références pendantes sortent, y compris la colonne « ailleurs »).

Il compte, **par trimestre et par type**, les références qui ne résolvent plus, et pour chaque id mort il dit **s'il survit dans un autre trimestre** — c'est ce qui distingue une réparation par re-pointage (patron #542) d'une recréation. Il recense aussi les magasins `cartouches_*` dont plus aucune grille ne porte l'id, et les cartouches dont l'`echelleId` est introuvable.

> Le code du diagnostic est transmis à `kuekatsheu-bc` (session de coordination) pour remise à Grégoire ; il est reproduit ici en une seule ligne pour être recollé sans altération.

```js
await (async function(){var R={trimestres:[],pendantes:{},magasinsFantomes:[],cartouchesEchelleMorte:[],total:0};var T=(db.getSync('trimestres',[])||[]).filter(function(t){return t&&t.id;});var K=db.keysSync().filter(function(k){return k.indexOf('cartouches_')===0;});var CART={},GRILLES_TOUS={},ECH_TOUS={},PROD_TOUS={},PRAT_TOUS={};for(var i=0;i<K.length;i++){var lot=await db.get(K[i])||[];if(!Array.isArray(lot))lot=[];CART[K[i].slice(11)]=lot;}for(var t=0;t<T.length;t++){var id=T[t].id;var G=await db.get(id+'_grillesTemplates')||[];var E=await db.get(id+'_echellesTemplates')||[];var P0=await db.get(id+'_productions')||[];var A0=await db.get(id+'_pratiquesConfigurables')||[];for(var a=0;a<G.length;a++)if(G[a]&&G[a].id)GRILLES_TOUS[G[a].id]=T[t].nom||id;for(var b=0;b<E.length;b++)if(E[b]&&E[b].id)ECH_TOUS[E[b].id]=T[t].nom||id;for(var c0=0;c0<P0.length;c0++)if(P0[c0]&&P0[c0].id)PROD_TOUS[P0[c0].id]=T[t].nom||id;for(var d0=0;d0<A0.length;d0++)if(A0[d0]&&A0[d0].id)PRAT_TOUS[A0[d0].id]=T[t].nom||id;}var CART_IDS={};for(var gk in CART){for(var ci=0;ci<CART[gk].length;ci++){var cc=CART[gk][ci];if(cc&&cc.id)CART_IDS[cc.id]=gk;if(cc&&cc.echelleId&&!ECH_TOUS[cc.echelleId])R.cartouchesEchelleMorte.push({magasin:gk,cartouche:cc.id,nom:cc.nom||'',echelleId:cc.echelleId});}}for(var gk2 in CART)if(!GRILLES_TOUS[gk2])R.magasinsFantomes.push({cle:'cartouches_'+gk2,cartouches:CART[gk2].length,noms:CART[gk2].slice(0,5).map(function(x){return (x&&x.nom)||'sans nom';})});for(var t2=0;t2<T.length;t2++){var tid=T[t2].id,tnom=T[t2].nom||tid;var GR=await db.get(tid+'_grillesTemplates')||[];var EC=await db.get(tid+'_echellesTemplates')||[];var PR=await db.get(tid+'_productions')||[];var EV=await db.get(tid+'_evaluationsSauvegardees')||[];var PA=await db.get(tid+'_pratiquesConfigurables')||[];var GC=await db.get(tid+'_groupesCours')||[];var MM=await db.get(tid+'_planification_mindmap')||null;var gi={},ei={},pi={},ai={};for(var x1=0;x1<GR.length;x1++)if(GR[x1]&&GR[x1].id)gi[GR[x1].id]=1;for(var x2=0;x2<EC.length;x2++)if(EC[x2]&&EC[x2].id)ei[EC[x2].id]=1;for(var x3=0;x3<PR.length;x3++)if(PR[x3]&&PR[x3].id)pi[PR[x3].id]=1;for(var x4=0;x4<PA.length;x4++)if(PA[x4]&&PA[x4].id)ai[PA[x4].id]=1;function pend(liste,champ,univers,etiquette,global){var m={};for(var q=0;q<liste.length;q++){var o=liste[q];if(!o)continue;var v=o[champ];if(v&&!univers[v]){if(!m[v])m[v]={id:v,n:0,ailleurs:(global&&typeof global[v]==='string')?global[v]:'nulle part',exemples:[]};m[v].n++;if(m[v].exemples.length<3)m[v].exemples.push(o.id||o.titre||o.nom||('#'+q));}}var res=[];for(var w in m)res.push(m[w]);res.sort(function(p,r){return r.n-p.n;});if(res.length){R.pendantes[tnom+' · '+etiquette]=res;for(var z=0;z<res.length;z++)R.total+=res[z].n;}}pend(PR,'grilleId',gi,'production.grilleId',GRILLES_TOUS);pend(PR,'echelleId',ei,'production.echelleId',ECH_TOUS);pend(PR,'cartoucheId',CART_IDS,'production.cartoucheId');pend(EV,'grilleId',gi,'evaluation.grilleId',GRILLES_TOUS);pend(EV,'echelleId',ei,'evaluation.echelleId',ECH_TOUS);pend(EV,'cartoucheId',CART_IDS,'evaluation.cartoucheId');pend(EV,'productionId',pi,'evaluation.productionId',PROD_TOUS);pend(GC,'pratiqueId',ai,'groupesCours.pratiqueId',PRAT_TOUS);var noeudsMorts=[];if(MM&&MM.cartes)for(var ck in MM.cartes){var nds=(MM.cartes[ck]||{}).noeuds||[];for(var n1=0;n1<nds.length;n1++){var nd=nds[n1];if(nd&&nd.metadata&&nd.metadata.productionId&&!pi[nd.metadata.productionId])noeudsMorts.push({carte:ck,noeud:nd.id,productionId:nd.metadata.productionId});}}if(noeudsMorts.length){R.pendantes[tnom+' · carte.metadata.productionId']=noeudsMorts;R.total+=noeudsMorts.length;}var pratEch=[];for(var p1=0;p1<PA.length;p1++){var pp=PA[p1];if(!pp)continue;var ve=(pp.configuration&&pp.configuration.echelleId)||(pp.config&&pp.config.echelleId)||null;var vg=(pp.configuration&&pp.configuration.grilleId)||(pp.config&&pp.config.grilleId)||null;if(ve&&!ei[ve])pratEch.push({pratique:pp.id,nom:pp.nom||'',champ:'echelleId',valeur:ve});if(vg&&!gi[vg])pratEch.push({pratique:pp.id,nom:pp.nom||'',champ:'grilleId',valeur:vg});}if(pratEch.length){R.pendantes[tnom+' · pratique.configuration.*']=pratEch;R.total+=pratEch.length;}R.trimestres.push({trimestre:tnom,id:tid,grilles:GR.length,echelles:EC.length,productions:PR.length,evaluations:EV.length,pratiques:PA.length,groupesCours:GC.length});}console.log('==== #620 · references pendantes · LECTURE SEULE ====');console.table(R.trimestres);console.log('TOTAL references pendantes :',R.total);for(var k2 in R.pendantes){console.log('--- '+k2+' ---');console.table(R.pendantes[k2]);}console.log('--- magasins de cartouches sans grille vivante ('+R.magasinsFantomes.length+') ---');console.table(R.magasinsFantomes);console.log('--- cartouches dont echelleId est introuvable ('+R.cartouchesEchelleMorte.length+') ---');console.table(R.cartouchesEchelleMorte);window._diag620=R;return R;})();
```

**Angle mort du diagnostic, à ne pas taire** : les clés `cartouches_*` sont énumérées par `db.keysSync()`, qui couvre `localStorage` et le cache mémoire mais **pas** IndexedDB seul (`db.js:946-956`). Un magasin de cartouches qui n'existerait qu'en IndexedDB serait absent du recensement des magasins fantômes. Les *lectures*, elles, passent par `db.get` et vont partout. Le chiffre des magasins fantômes est donc un **plancher**, pas un total.

**Relevé — à remplir après exécution** :

| Mesure | Attendu / à observer | Relevé |
|---|---|---|
| Total des références pendantes, tous trimestres | — | ______ |
| `evaluation.echelleId` en h2026 | **44** (`ECHELLE_DEMO`) — chiffre **rapporté** au 26 août, à confirmer par cette mesure | ______ |
| `evaluation.echelleId` — autre id que `ECHELLE_DEMO` | **0** attendu ; toute valeur > 0 signifie que la réparation de #542 n'a pas tenu — ou n'a jamais tourné | ______ |
| `evaluation.productionId` pendantes | inconnu — c'est la classe que S5 ci-dessus n'a jamais gardée | ______ |
| `production.cartoucheId` pendantes | inconnu — trou commun aux quatre remaps (S7) | ______ |
| `cartouche.echelleId` introuvable | inconnu — jamais remappé, jamais gardé | ______ |
| Magasins `cartouches_*` sans grille vivante | > 0 attendu (symptôme du 24 août, chemins S1) — **ce ne sont PAS des déchets, voir l'encadré ci-dessous** | ______ |
| `groupesCours[].pratiqueId` pendantes | inconnu — le garde qui devait l'empêcher lit la mauvaise clé (S3) | ______ |
| `carte.metadata.productionId` pendantes | inconnu ; le contrôle #425 n'existe que sur le chemin inter-trimestre | ______ |

> ### ⚠ Les magasins de cartouches sans grille vivante ne sont PAS des déchets à nettoyer
>
> Le libellé « magasin fantôme » invite à purger. **Il ne faut pas.** Le croisement des sorties du 30 août au soir (mesuré par la session de coordination sur les données réelles) établit que **trois des grilles disparues de Hiver 2026 ont chacune un magasin de cartouches survivant** — `cartouches_grille_1770742838756_23q82vbsk` (5 cartouches), `cartouches_grille_1772187755149_uq1oiiafa` (4), `cartouches_GRILLE1759529438501` (2). Onze cartouches, pour trois grilles qui portent **408 évaluations**.
>
> Les commentaires d'une cartouche sont indexés par des clés `<critereId>_<code>` : **les identifiants de critères des grilles mortes y sont encodés**. Ces onze magasins sont donc, avec les évaluations elles-mêmes, la matière première d'une reconstruction. **Statut : à conserver, source de reconstruction potentielle.** Aucun diff de S6 ne les purge, et aucun ne doit le faire avant que #632 ait tranché.

**Ce que le relevé décide.** Si `evaluation.echelleId` fait apparaître un id autre que `ECHELLE_DEMO`, la réparation de #542 s'est défaite une seconde fois et S6 devient urgent plutôt qu'important — c'est le seul chiffre de ce tableau qui change l'ordonnancement. Les autres alimentent le périmètre de réparation de S6 : pour chaque famille, la colonne « ailleurs » dit si la réparation est un re-pointage (l'id survit dans un autre trimestre) ou une recréation (« nulle part »).

**Sur #340** (résurrection IndexedDB, productions A25 écrites sous clé H2026, réparation en attente) : il **croise** ce périmètre par un seul point. Une production ressuscitée sous le namespace d'un autre trimestre est, pour les évaluations de son trimestre d'origine, une `productionId` pendante — elle apparaîtra dans la ligne `evaluation.productionId` avec la mention « ailleurs : <l'autre trimestre> ». C'est le signe distinctif : une production pendante dont l'id **survit dans un autre trimestre** relève de #340, pas d'une suppression. Le diagnostic ne les répare pas et ne les distingue pas automatiquement ; il donne la colonne qui permet de le faire à la lecture.

---

## 5. Angles morts — à tester en conditions réelles

Ce que le code seul n'établit pas. Mac et iPad séparément quand la mention le précise.

⛔ **MORATOIRE ACTIF, ÉLARGI LE 30 AOÛT 2026 AU SOIR (décision de Grégoire, relayée par la coordination).** Trois gestes de l'écran Trimestres sont interdits jusqu'à la livraison de S4 : **« Archiver »**, **« Supprimer… » un trimestre**, et **« Exporter » sur une ligne NON ACTIVE**. Aucun d'eux, même sur un trimestre jetable. **Aucun test ci-dessous ne les emploie** — c'est vérifié geste par geste : les tests 1 et 4 créent un trimestre jetable et y travaillent, ils ne l'archivent pas, ne le suppriment pas et n'exportent rien. Si un test futur en avait besoin, il attend S4.

1. **B1, l'effet inter-trimestre.** Sur un trimestre jetable — **et non sur A2025/H2026** : créer deux trimestres portant une grille de même id (le cas nominal depuis #358), y créer une cartouche dans chacun, supprimer la grille depuis Réglages › Données dans l'un. Les cartouches de l'autre survivent-elles ? Observé : ______
   ⚠ Ce test **n'archive rien** : il reste compatible avec le moratoire D1-A.
2. **S1, le bouton de l'éditeur.** Ouvrir une grille qui porte des cartouches, cliquer « Supprimer cette grille » dans l'éditeur (`#btnSupprimerGrille`). Attendu : la suppression passe sans avertissement, alors que le même geste depuis la corbeille de la barre latérale est refusé en nommant les cartouches. Observé : ______
3. **S2, l'échelle « Non utilisée ».** Réglages › Données › Échelles : la colonne « Usage » affiche-t-elle « Non utilisée » sur **toutes** les lignes, y compris pour une échelle dont on sait qu'elle porte des évaluations ? Observé : ______
4. **S5, la réattribution d'un id de carte.** Vider `<trim>_planification_mindmap.index` sur un trimestre jetable en laissant `cartes` peuplé, recharger, créer une carte : reçoit-elle l'id `carte_1` d'une carte existante, et hérite-t-elle de ses notes de séance ? Ce test dit aussi si `initialiserSiNecessaire` (`planification-donnees.js:212-220`) **écrase** `donnees.cartes` en reconstruisant l'index — la lecture du code le suggère, l'atteignabilité n'est pas établie. Observé : ______
   ⚠ À faire sur un trimestre jetable **exclusivement**, avec sauvegarde Codex préalable **par copie**.
5. **S3, la pratique d'un autre trimestre.** Assigner une pratique personnalisée à un groupe-cours de A2026, basculer sur H2026, la supprimer depuis la barre latérale : le garde se déclenche-t-il ? (attendu : non). Rebasculer : le groupe-cours a-t-il perdu sa pratique ? Observé : ______
6. **S3 bis, le faux positif.** Tenter de supprimer une pratique normalisée vers `pan-standards` qu'aucun groupe-cours n'utilise : est-elle refusée en nommant « tous les cours » ? Observé : ______
7. **S7, le remap des Archives.** Réimporter depuis les Archives une grille + une production déjà présentes, en demandant la copie en double : la copie de la production pointe-t-elle la cartouche de l'original ? Le compteur « N référence(s) rebranchée(s) » couvre-t-il ce cas ? Observé : ______
8. **S8, la duplication partagée.** Dupliquer une production partagée dont l'`echelleId` et le `cartoucheId` sont étrangers au paquet : les champs sont-ils vidés bruyamment (comme `grilleId`) ou recopiés tels quels ? Observé : ______ *(angle mort n° 9 de l'audit de carte, précisé)*
9. **S4, le garde contournable.** Dans Réglages › Données, ouvrir la modale sur une ressource **bloquée**, réactiver le bouton par la console (`document.getElementById('btn-confirmer-suppression').disabled = false`), saisir le nom, confirmer : la suppression a-t-elle lieu ? Attendu : oui — c'est ce que le diff S6-f referme. Observé : ______
   ⚠ **Sur trimestre jetable uniquement.**
10. **S6, iPad lent.** Supprimer une pratique pendant une bascule de trimestre (iPad) : `pratiquesConfigurables` de quel namespace perd la pratique ? Observé : ______

---

## 6. Addendum du 30 août au soir — #631 (constat) et #632 (correctif)

Après l'exécution des trois diagnostics par Grégoire, la session de coordination a inscrit **#631** : dans **Hiver 2026**, `evaluation.grilleId` porte **408** références sur **trois** identifiants introuvables — `grille_1770742838756_23q82vbsk` (225), `grille_1772187755149_uq1oiiafa` (94), `GRILLE1759529438501` (89) — tous « nulle part », y compris dans la clé globale nue `grillesTemplates`, mesurée vide par #630. Quatre pratiques pointent en outre `GRILLE1759529438501` par `configuration.grilleId`. C'est la même famille que #542, sur l'autre champ, et plus gros. **#632** porte le correctif.

**Ce que la prédiction posée d'avance a permis de trancher** : le §4 de ce rapport disait qu'un seul chiffre changerait l'ordonnancement — un id autre que `ECHELLE_DEMO` dans `evaluation.echelleId`. La mesure a rendu `ECHELLE_DEMO` **seul**, 44 fois. **La réparation de #542 a tenu.** S6 reste importante, elle ne devient pas urgente.

### 6.1 Mesure — ce que l'application fait aujourd'hui d'une évaluation dont le `grilleId` est introuvable

**VÉRIFIÉ** (lecture des trois chemins d'écriture et des trois chemins de lecture), **SUPPOSÉ** (le rendu à l'écran et l'export PDF, non exécutés).

**Une hypothèse envisagée, puis RÉFUTÉE — et il faut le dire avant le reste.** J'ai d'abord suspecté le patron de #453 : le vide de l'affichage qui devient le vide du disque. `_collecterCriteresSauv(grille)` rend un tableau vide quand la grille manque (`evaluation-sauvegarde.js:185`), `calculerNote()` sort par `return` **avant** de toucher `window.noteCalculeeCourante` (`evaluation-calcul.js:514`), cette variable n'est réinitialisée nulle part entre deux évaluations, et deux des trois sites d'écriture retombent sur `: 0`. La chaîne semblait complète : re-sauvegarder aurait écrit `criteres: []` et une note fausse — 0, ou la note de l'évaluation ouverte juste avant.

**Les trois chemins d'écriture refusent.** Mesuré un par un :

| Chemin | Garde | Effet |
|---|---|---|
| Auto-save silencieux — `_autoSauvegarderCriteres` (evaluation-chargement.js:1376) | `if (!grille \|\| !grille.criteres) return;` (l.1387) **et** `if (evaluations[idx].verrouillee === true) return;` (l.1420) | ne fait rien, deux fois |
| Sauvegarde explicite — `sauvegarderEvaluation` (evaluation-sauvegarde.js:363) | `_validerReferencesSauv` (l.162-165) | refuse **bruyamment** : « Grille introuvable — La grille de critères sélectionnée n'existe plus » |
| Modification — `sauvegarderEvaluationModifiee` (evaluation.js:1896) | garde verrouillage (l.1918) puis `_validerReferencesMod` (l.1930) | refuse deux fois |

⮕ **Aucune note n'est écrasée. #631 n'est pas une perte en cours ; c'est un gel.** Le repli `: 0` de `evaluation-sauvegarde.js:209` et `evaluation-chargement.js:1327` reste un défaut de forme — le troisième site, corrigé par #572, retombe correctement sur `evalExistante.noteFinale` (evaluation-chargement.js:1303) — mais il est aujourd'hui **inatteignable** sur ce chemin. À aligner en S6 par cohérence, pas en urgence.

**Les lectures dégradent proprement, et c'était déjà su.** Trois replis existent, écrits à trois dates différentes :
- `_appliquerFallbackGrilleManquanteModif` (evaluation.js:1512-1528) : réaffiche les critères **depuis l'évaluation enregistrée** et remet à l'écran `noteFinale` et `niveauFinal` sauvegardés ;
- le bilan de l'élève : `_chargerGrilleDefBilan` rend `null` sans lever, et `_collecterCriteresBilan(grilleDef, ec, evalEnregistree)` prend l'évaluation enregistrée en source de secours — le commentaire le dit en toutes lettres (« #576 — la source de secours des NOMS de critères quand la grille a disparu ») ;
- `calculerNote()` sort silencieusement, et la branche jumelle « échelle absente » (l.548-556) affiche `--` plutôt que de crier (#348-résiduel).

⮕ **Le symptôme réel pour Grégoire n'est donc ni une erreur ni une note fausse : c'est qu'il ne peut plus modifier aucune de ces 408 évaluations.** Le message qu'il reçoit — « La grille de critères sélectionnée n'existe plus » — ne dit pas laquelle, ne dit pas qu'elles sont 408, et ne propose rien.

**Reste à mesurer (non fait, non commencé)** : l'export PDF. `export-pdf.js:1588-1640` lit `exportPDF-grille` et `cartouches_<grilleId>` ; le comportement quand la grille manque n'a pas été établi. À faire en tête de #632.

### 6.2 Réparation — ce qui est spécifiable ce soir, et ce qui ne l'est pas

**Deux cas, à ne pas confondre.**
- **Re-pointage** — une grille équivalente existe sous un autre id. C'est le patron #542 : les valeurs survivent, seul l'identifiant a disparu. La colonne « ailleurs » du diagnostic du §4 est faite pour ça ; ici elle dit « nulle part » pour les trois grilles, donc **le re-pointage n'est pas disponible en l'état** — sauf si une grille de contenu équivalent existe sous un id que le diagnostic ne rapproche pas (il compare des ids, pas des contenus). Un oracle de contenu reste à écrire.
- **Reconstruction** — recréer la grille sous son id d'origine à partir des traces. C'est la voie qui reste.

**Ce que je NE spécifie pas ce soir, et pourquoi.** La qualité de toute la réparation dépend d'une question qui n'est pas encore tranchée sur les données. Elle est inscrite ici telle qu'elle a été posée, pour survivre à la nuit :

> **Première question de #632** : les évaluations portent-elles une copie des critères ? Les clés de commentaires d'une cartouche donnent les ids de critères, pas leurs libellés ni leurs pondérations. Il faut regarder si les évaluations elles-mêmes portent une copie des critères — si oui, la reconstruction est bien meilleure que par les cartouches seules. *Je te le dis quand je l'aurai mesuré, pas avant.*

**Ce que la lecture du code établit déjà** (VÉRIFIÉ ; ce n'est pas la réponse, c'en est la moitié) : la **structure** existe et elle est riche. Chaque évaluation enregistre `grilleNom` (`evaluation-sauvegarde.js:238`) et `criteres: [{critereId, critereNom, niveauSelectionne, retroaction, ponderation}]` (l.190-196, structure documentée l.134). Nom de la grille, id **et** nom **et** pondération de chaque critère : de quoi reconstruire une grille utilisable, pas seulement une coquille d'ids.

**Ce qui reste ouvert, et que seule une mesure sur les données peut dire** : combien des **408** évaluations portent effectivement un `criteres[]` **non vide**. Deux raisons de ne pas le supposer — `_collecterCriteresSauv` rend `[]` si la grille manquait déjà à l'enregistrement, et un repli d'extraction depuis la rétroaction (evaluation.js:1464-1475) ne s'active que si la grille est présente. Une évaluation enregistrée **après** la disparition de la grille peut donc porter un tableau vide. **Tant que ce chiffre n'est pas mesuré, aucun diff de reconstruction ne doit être écrit** : il porterait sur un matériau dont on ignore s'il existe.

⮕ **Le diagnostic de #632 s'écrit avant son correctif.** Il doit rendre, pour chacun des trois ids morts : le nombre d'évaluations, combien portent un `criteres[]` non vide, l'union des `critereId` rencontrés avec leurs `critereNom` et `ponderation` (et signaler les divergences entre évaluations — deux noms pour un même id est un signal, pas un détail), le `grilleNom` porté par les évaluations, et le recoupement avec les ids de critères encodés dans les clés de commentaires des onze cartouches survivantes. C'est ce croisement qui décide si la reconstruction est fidèle ou approximative — et Grégoire doit le savoir avant qu'on écrive quoi que ce soit dans ses données.

**Périmètre confirmé de #632, en plus des évaluations** : `pratique.configuration.grilleId` — quatre pratiques pointent `GRILLE1759529438501`. La réparation traite les **deux** champs, sur le même id, dans le même passage ; sinon la grille reconstruite est vue par les évaluations et pas par les pratiques.

**Deux préalables non négociables**, du même patron que #542 et #448 : sauvegarde Codex préalable **par copie** (jamais un `git checkout`), et **dry-run relu** avant toute écriture.

---

## Ce que ce rapport ne couvre pas

- **La portée et l'archivage des cartouches** (B2, M1 de l'audit de carte) : périmètre Z1. Le constat B1 ci-dessus y touche par sa cause ; il a été transmis à la session de coordination pour recoupement, et l'ordre S5 → S6 en découle.
- **La cause de #542** : non établie, et ce rapport ne prétend pas la trouver. Il établit que deux chemins vivants **suffisent** à produire l'effet, ce qui est une condition nécessaire, pas une preuve d'origine.
- **Les états d'édition transitoires** (S3 de l'audit de carte, `tempCriteres`) : périmètre S7.
- **Le legacy des quatre sections** (S4, S5, S9 de l'audit de carte) : périmètre Z3. Le shadowing de `cle` (M3) y touche et lui est signalé.
- **L'export PDF face à une grille disparue** (§6.1) : non mesuré, non commencé. Première tâche de #632 avec la question ouverte du §6.2.
- **Aucun diff n'a été appliqué.** Aucun fichier de `js/`, `index.html` ou `tests/` n'a été ouvert en écriture pendant cet audit.
