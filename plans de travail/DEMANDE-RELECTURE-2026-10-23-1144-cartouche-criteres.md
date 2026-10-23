# Demande de relecture – #1144 : la cartouche qui remplaçait les critères de la grille

> Claude Code, vendredi 23 octobre 2026, 13 h 55 (Toronto). Pour Cowork (`PROTOCOLE.md`, règle 2 : une écriture possible dans les données réelles, la réparation du stock). Consigne exécutée : `CONSIGNE-DU-JOUR.md` de 13 h 27.
> Commits sur `main`, **non poussés** : `bbb13a5e` (docs de Cowork, seuls), `f39be1bc` (le correctif). Pas de release, ni verdict complet, ni push (consigne § 4).

## 1. L'écran (consigne § 1)

| Quoi | Où |
|---|---|
| `cartoucheSelectionnee` rend `grille.criteres` ; la cartouche ne fournit que ses commentaires, lus par id (`<critereId>_<niveau>`), jamais par nom. Pondération, type, description : ceux de la grille. | `js/evaluation-chargement.js`, vers la l. 1113 |
| Une ligne nomme les critères de la grille que la cartouche ne couvre pas (par id) : « La cartouche n’a pas de commentaires pour « Français écrit ». Ce critère s’évalue quand même. » (au pluriel : « … pour « A », « B ». Ces critères s’évaluent quand même. »). `alerte-information`, posée par `textContent` après chaque rendu, comme les avis #652 et #705. **Texte lu par l'enseignant, posé par Claude Code : à relire.** | `_signalerCriteresNonCouverts`, même fichier |
| Côté élève, **rien de neuf** (mesuré au code) : sans commentaire de cartouche, `commentaireDuCritere` (#939) prend le commentaire enregistré, puis la rétroaction algorithmique, sinon rien ; le critère se dit par son en-tête. À l'écran, le div `comm_` est vidé. | `js/synthese-retroaction-data.js`, l. ~488 |

## 2. La source (consigne § 2)

**Trouvé dans le code, deux chemins, taris** (fait lu) : tous deux rangent une cartouche venue d'ailleurs sous une grille locale sans la rattacher à ses critères.

- `copierCartoucheDepuisTrimestre`, chemin 2 (`js/cartouches.js`, ~l. 4146) : la grille d'accueil est choisie par `memeIdentite`, qui compte `inspireDe.sourceId` (`identite-item.js`, l. 89-103). Une grille issue de `dupliquerGrille` (ids `CR_` neufs, `inspireDe.sourceId` = la source) est donc « la même » : la cartouche y gardait les ids de la source.
- `ajouterCartoucheIndividuelle` (~l. 4376) : bibliothèque → grille locale trouvée par `idOriginal` ; la cartouche gardait ses critères et même le `grilleId` de la source. Elle pointe maintenant la grille locale (`chargerMatriceRetroaction` le recalait déjà à l'ouverture).

Les deux passent par `cartoucheCorrespondance.rattacher` (§ 3). Écartés à la lecture (rapport d'un agent de recherche, revérifié pour les deux chemins ci-dessus) : `deplacerCartouchesVersAutreGrille` (remappe), `initialiserNouveauCartoucheAvecEchelle` (reprend les critères de la grille), le chemin 1 de l'import d'un autre trimestre (grille et cartouche copiées ensemble, cohérentes), l'import complet et sélectif, la Réserve, `materiel-creation`.

⚠ **Le geste exact qui a rangé les deux cartouches de Grégoire n'est PAS identifié** (inscrit à `SUIVI-BUGS.md`, #1144, issue 2 ; je ne devine pas). Inféré : `CART_1787608995681_2` est née le 24 août à 22 h 03 UTC, pendant la porte terrain de l'import d'un autre trimestre (livré ce jour-là, `664e9dc3`), par le chemin 1, cohérente à la naissance (la grille copiée portait les ids de G4H). Son passage sous G5H n'est expliqué par aucun chemin lu ; les modifications du 30 sept. (16 h 12 à 16 h 14) peuvent n'être qu'un renommage. **Deux mesures en lecture seule dans ses données trancheraient** (Cowork, Chrome) : (a) les deux cartouches portent-elles `idOriginal`, `dateImport`, `inspireDeTrimestre` (signature du chemin 2, qui donne aussi un id neuf) ? (b) G5H et G5M portent-elles un `inspireDe.sourceId` vers G4H ou vers la grille absente ?

## 3. Le stock (consigne § 3)

- **La fonction pure partagée** : `js/cartouche-correspondance.js` (chargé avant `grilles.js`). `remapper` est la correspondance extraite de `deplacerCartouchesVersAutreGrille`, à l'identique (id, puis nom ; clés reconnues par préfixe, le plus long gagnant ; jamais découpées) ; ce geste-ci garde sa règle (un critère sans cible part, ses commentaires non vides sont nommés à l'appelant). `rattacher` assemble **sans rien jeter** : un critère sans cible reste, avec ses commentaires. Il rend la cartouche telle quelle (`sur: false`) si deux critères visent la même cible ou si le nombre de commentaires ne se conserve pas (une clé déjà là serait écrasée).
- **La console** : `js/cartouches-decalees.js`. `await CartouchesDecalees.verifier()` parcourt les grilles du trimestre actif et leurs `cartouches_<id>`, liste chaque cartouche dont un critère n'est pas dans sa grille (rattachés, sans critère dans la grille, critères de la grille sans commentaires) et n'écrit rien. `{ reparer: true }` exige `Codex.estAJour()`, réécrit par `modifierEtAnnoncer` les seules cartouches listées et proposées, la mesure refaite sur ce que lit l'écriture. Refus net sous A2025 et H2026. Les clés de grilles absentes sont hors lot (non lues).
- **Attendu sur ses données** (consigne) : « Plan de rédaction (refonte A26) » — Structure, Rigueur, Plausibilité, Nuance rattachés à G5H, « Français écrit » listé sans commentaires ; « Rédaction (refonte A26) » — quatre rattachés à G5M, Français écrit intact (par id). **Non mesuré** : la fonction demande le code déployé.
- ⚠ **Une liberté prise, à relire** : si une cartouche a des commentaires sous une clé orpheline qui porte déjà un id de la grille (`CR_x_M` non revendiqué), le rattachement l'écraserait : elle est alors listée SANS proposition (« le rattachement écraserait un commentaire »), comme pour une collision. La consigne ne le prévoyait pas.

## 4. Les preuves

- **Banc** `tests/unit/cartouche-criteres-grille-1144.test.js` (15 essais, jsdom et vrais fichiers) : A, l'écran (grille de cinq, cartouche de quatre aux ids d'une autre : cinq critères, `(20 %)` partout, aucun « ? », les selects aux ids de la grille, la ligne au pluriel ; rattachée, la ligne au singulier ; couverte, aucune ligne) ; B, `remapper` (nom, id d'abord, préfixe le plus long, non-rattachés rendus, collision) ; C, la console (mesure sans écriture, réparation de la seule décalée, l'autre et la clé orpheline intactes, non-rattaché gardé, collision et écrasement sans proposition, refus sans codex, refus en H2026).
- **`cartouches-import-trimestre.test.js`**, 2b et 2c : les deux chemins taris.
- **Break-tests : 12 mutations, 12 rouges** — l'écran sur `cartouche.criteres`, l'avis retiré, la clé découpée au « _ », la correspondance par id seulement, commentaires puis critères non rattachés jetés, collision ignorée, conservation ignorée, codex non exigé, mesure qui écrit, H2026 accepté, chacun des deux chemins d'import sans `rattacher`. Deux mutations ont d'abord survécu (non-rattachés jetés, collision ignorée) : les essais ont été resserrés jusqu'à les tuer.
- **Vitest complet** depuis `tests/` : 9 561 sur 9 561, 811 fichiers. Trois harnais chargent maintenant `cartouche-correspondance.js` avant `cartouches.js` / `grilles.js`, comme index.html (#522 lot 5b, #624, #656), sans rien relâcher.
- **WebKit du périmètre** : 17 specs (évaluation, parcours sommatif, cartouches, import d'un autre trimestre, partage, réparation des orphelines, #652, #703-705, #944, #946, #959, #961, #1142, analytique), 95 essais verts.
- **Audit statique** des lignes ajoutées dans `js/` : aucun `console.log`, `eval`, handler inline, `innerHTML` ajouté (l'avis passe par `textContent`). Anti-cache : `cartouches.js` `20261023a`, `evaluation-chargement.js` et `grilles.js` `20261023b`, les deux modules neufs `20261023a`.
- **Complexité** (1.216.0 `56f7be93` → `f39be1bc`) : au-dessus de 15 : 453 → 453 ; au-dessus de 30 : 86 → 86 (maximum 130) ; somme au-dessus de 15 : 11 410 → 11 410 ; fichiers de plus de 1 000 lignes 37 → 37, leurs lignes 88 663 → 88 644 (Δ −19 : `grilles.js` −34, `evaluation-chargement.js` +14, `cartouches.js` +1).
- **Non fait** : le verdict Playwright complet, la release, la mesure sur ses données.

## 5. Le geste à vérifier à l'écran, après le push

Annoter › Évaluer, sur une copie de l'Artefact 5 sous « G5H Complète (refonte A26) », cartouche « Plan de rédaction (refonte A26) » : **cinq critères, chacun avec sa pondération, Français écrit compris**, et au-dessus la ligne « La cartouche n’a pas de commentaires pour … » ; changer de grille puis revenir ne les réduit plus à quatre. (Avant la réparation, la ligne nomme les cinq : les ids de la cartouche sont ceux de G4H.)

## 6. Pour Grégoire : le stock

Une fois la version chargée dans ton onglet, ouvre la console et tape `await CartouchesDecalees.verifier()` puis Entrée : la liste des cartouches dont un critère n'est pas dans leur grille, **sans rien écrire**. Si elle montre les deux attendues, mets ton codex à jour, puis `await CartouchesDecalees.verifier({ reparer: true })` les rattache par le nom ; Français écrit restera à écrire dans « Plan de rédaction (refonte A26) ».
