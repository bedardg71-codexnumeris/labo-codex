# AUDIT — Onglet Évaluations : enregistrements, logique, PDF de rétroaction et design

**Date** : 25 août 2026 · **Base auditée** : `main` 1.99.0 (commit `8dfda3ed`, build 0825-1720)
**Périmètre** : les quatre sous-onglets (Préparer et importer, Liste des évaluations, Annoter et évaluer, Exporter et archiver), le pipeline du PDF de rétroaction (`synthese-retroaction-*` + `travaux-export-pdf.js`), et le design des quatre écrans contre `design-system.html` et le skill `design-interface`.
**Mode** : audit tiers (mode B du skill `verification-adverse`), **lecture seule** — aucun correctif appliqué. Tous les verdicts sont **[lecture]** (chemin de code lu, non exécuté) ; aucun Chromium n'a été lancé dans cette session. Les constats critiques et le contournement du garde des modes ont été **contre-vérifiés par une seconde lecture indépendante** dans la session principale.
**Déclencheur** : Grégoire — « vérifier si tout fonctionne bien, notamment les boutons d'enregistrement des paramètres et des données […] la création du PDF de rétroaction ainsi que le design des écrans ».
**Rapport jumeau** : `AUDIT-conception-gabarits-2026-08-25.md` (onglet Conception, même base, branche `claude/audit-conception-tab-lc3ks8`).

---

## Baseline factuelle

- Vitest : **3262/3262 verts** (309 fichiers, 46,7 s), re-roulés dans cette session depuis `tests/`.
- Arbre propre avant et après audit ; branche `claude/audit-evaluation-tab-txocw7` partie de `origin/main`.
- Croisements backlog déjà ouverts qui touchent ce périmètre (non re-démontrés ici) : **#483** (pondérations ≠ 100 % non bloquantes), **#465** (DEN « configuré ≠ calculé »), **#482** (snapshot d'archivage lisant les pratiques du trimestre actif), **#440** (SRPNF en dur dans les diagnostics), et le bug testeur **#340-T3** (résolution échelle/cartouche en consultation d'un trimestre archivé lue dans le namespace du trimestre actif — `evaluation-calcul.js:546`, `evaluation.js:71/2120`).
- La branche `claude/fusion-24-fonctions-dupliquer-qrop3b` (#476/#291, non fusionnée) porte du travail sur les doublons/duplication : les constats « code mort » de l'import sont à relire après sa fusion.

## Verdict d'ensemble sur les boutons d'enregistrement

**Aucun bouton visible n'est mort sur les quatre sous-onglets.** Les inventaires complets (≈ 45 contrôles : pipeline d'import, 13 actions du menu de la Liste, 13 contrôles du panneau Annoter, 6 boutons d'export) résolvent tous vers un handler existant via le dispatcher `data-action`/`data-on-change` de `main.js`, et les écritures persistantes passent par des clés namespacées `cle()`. Le symptôme « données pas enregistrées » ne vient donc pas de câblage cassé, mais de **quatre familles de causes réelles** : des choix d'interface jamais persistés (A3, B1), des écritures qui contournent le garde des modes (A2, B5), des suppressions plus larges que ce que l'écran annonce (A1, B4), et des échecs avalés sans avertissement (B2, B3).

---

## A. Constats critiques

### A1 · « Vider la corbeille » détruit au-delà du périmètre annoncé — [lecture, contre-vérifié]

La modale compte les fichiers de la corbeille **filtrée par groupe-cours actif** (`liste-evaluations.js:2759` → `obtenirCorbeille()`, filtre `travaux-stockage.js:942-947`), mais le bouton « Tout supprimer » appelle `travauxStockage.viderCorbeille()` (`travaux-stockage.js:1064-1080`) qui itère `obtenirCorbeilleComplete()` et termine par `sauvegarderCorbeille([])` : **blobs et métadonnées de tous les groupes-cours du trimestre sont détruits**, alors que l'écran n'annonçait que ceux du groupe actif. Le nettoyage des évaluations liées (`liste-evaluations.js:2791-2812`) ne couvre, lui, que le groupe actif. Perte définitive et silencieuse pour les autres groupes.
**Piste** : `viderCorbeille()` doit accepter la liste à détruire (celle qui a été affichée), ou filtrer par `groupeCoursId` ; sentinelle sur « la modale et la destruction comptent le même ensemble ».

### A2 · `supprimerEvaluation` existe en double — la version corrigée est inatteignable — [lecture, contre-vérifié]

`liste-evaluations.js:1996` définit la version **avec** `restaurerOriginaleSiReprise` (restauration de l'originale quand on supprime une reprise, correctif du 8 juin) ; `evaluation.js:2710` en définit une **sans**. Ordre de chargement (`index.html:14558` vs `14573`) : l'export `window.supprimerEvaluation` d'`evaluation.js:3861` **écrase** celui de `liste-evaluations.js:2834`. Tous les appels externes — `data-action` (`evaluation.js:656`), profil étudiant (`profil-etudiant-actions.js:157`) — exécutent donc la version sans restauration : supprimer une reprise depuis le profil laisse l'originale « remplacée » à jamais. Seule la Liste, qui appelle sa version locale via `executerActionEval`, est épargnée. Même mécanique pour `rechargerFiltreProduction` (`evaluation.js:798` gagne sur `liste-evaluations.js:397-422` — sans exclusion portfolio ni préservation de la sélection), alors que `productions-liste.js:355` croit appeler la version corrigée.
**Piste** : une seule définition par identifiant global (zéro-dette) ; sentinelle statique « aucun doublon de `function X` exportée sur `window` entre modules » — ce motif est la réintroduction silencieuse d'un bug déjà corrigé.

---

## B. Constats majeurs

### Préparer et importer (code livré le jour même, #496-#507 — jamais éprouvé au terrain)

- **B1 · La file d'attente n'est pas re-persistée après import** (`travaux-import.js:719` filtre sans `persisterFileDAttente()`) : au rechargement, `restaurerFileDAttente()` (l.791) ressuscite les fichiers déjà importés (blob nul) → fantômes « à re-déposer », risque de ré-import en doublon. Aggravé : les doublons résolus restent dans la file (`travaux-ui.js:3887-3949`), et le cas « remplacer » met l'ancien fichier en corbeille **avant** l'`await importerFichier` — si l'import échoue, l'erreur n'est que `console.error`, aucune notification.
- **B2 · Le réglage « Rés. max. » (DPI) revient à 250 à chaque re-render** (`travaux-ui.js:1712`, `selected` codé en dur ; `_rafraichirPipelineUIImpl` l.1883 ne préserve que le scroll ; l'arrivée différée des thumbnails re-rend tout). Valeur ensuite réellement utilisée par l'import (l.1290, l.3723) — un choix de 400 dpi peut être silencieusement perdu.
- **B3 · Les choix par fichier ne survivent pas à la restauration** : `persisterFileDAttente` (`travaux-import.js:757-779`) n'enregistre ni `productionIdParFichier`, ni `modeImport`/`dateFichier`/`nomDocumentLibre`/`operations`/`skipBalance` ; la protection #313 (« le global n'écrase pas un choix par-fichier ») est inopérante après reload. Le sélecteur de production peut afficher (via sessionStorage non namespacé) une production que les nouveaux dépôts ne recevront pas.
- **B4 · Poste de préparation en mode ad-hoc** : `changerOptBalance`/`changerOptResolution` (`travaux-preparation.js:2246-2262`) écrivent `queue[indexActuel + queueOffset]` ; avec `queueOffset === -1` (« Ajouter des pages ») et une file d'import non vide, la case cochée marque **un fichier étranger** de la file.

### Liste des évaluations

- **B5 · Suppressions par couple (DA, production) trop larges + contournement du garde des modes** : `supprimerFichierDefinitivement` (`liste-evaluations.js:2725-2739`) et le nettoyage de « Vider la corbeille » (2795-2812) suppriment **toutes** les évaluations du couple (originales, reprises, et l'évaluation active d'un fichier réimporté), et écrivent par `db.setSync(cle(...))` direct — esquivant le blocage du mode anonymisation que `supprimerEvaluation` respecte (`modes.js:754-758`).
- **B6 · Réassociation avec jeton de reprise** : `associerProductionDepuisListe` (1627-1641) n'attend pas `travauxUI.changerProductionFichier` (async, peut avorter sur `confirm()` refusé, `travaux-ui.js:4301-4313`) mais marque quand même `estReprise:true` et consomme le jeton → reprise créée sur l'ancienne production.
- **B7 · Échappement incomplet** : `${ligne.da}`/`${daAffiche}` et `${ligne.niveauFinal}` injectés sans `echapperHtml` (`liste-evaluations.js:1067, 1120-1121, 1135, 1189-1263`). Le DA est nettoyé à l'import CSV, pas garanti sur les autres chemins d'entrée — violation de la règle 1 (« sans exception »).

### Annoter et évaluer

- **B8 · Le jeton personnalisé contourne le garde des modes** (`evaluation.js:3702-3729`) : lecture via `obtenirDonneesSelonMode` puis écriture via `db.setSync(cle(...))` direct. En mode anonymisation, le garde est esquivé ; pire, avec un contexte de simulation posé (#326 R2, `modes.js:626-633`), la lecture peut renvoyer le **corpus injecté**, que l'écriture directe reverserait dans la clé réelle. Toutes les fonctions sœurs passent par `sauvegarderDonneesSelonMode`.
- **B9 · Décocher « Reprise ciblée » ne retire rien** : la branche est un TODO vide (`evaluation-sauvegarde.js:973-975`) — la case se décoche, le jeton reste appliqué. Et les écritures d'`evaluation-jetons.js` (274, 326, 467, 592, 885, 921) n'examinent jamais le retour de `sauvegarderDonneesSelonMode` : en mode anonymisation, l'échec est silencieux pendant que l'UI se met à jour.
- **B10 · L'auto-save ne couvre que les critères** : son unique déclencheur est la sélection d'un niveau (`evaluation-chargement.js:1198`). Modifier **seulement** la rétroaction finale ou un commentaire (sans toucher un critère dans la même session de formulaire) ne crée aucun snapshot → le flush au changement de fichier ne sauve rien ; seul le bouton « Enregistrer » (`index.html:8383`) persiste. Risque réel de perte de texte en navigation rapide entre copies. (Le reste de la chaîne est sain — voir §E.)

### Exporter et archiver + PDF de rétroaction

- **B11 · Un étudiant en échec avorte tout le lot** : les boucles de l'export Léa (`travaux-archivage.js:340-352`) et du trimestre complet (223-252) n'ont aucun try/catch par item ; une exception (blob manquant, PDF corrompu) remonte au catch global → **zéro PDF livré**, même pour les N−1 étudiants valides, un seul `alert`.
- **B12 · L'échec de la page de synthèse est invisible** : `ajouterPageSynthese` avale l'échec de rasterisation (`travaux-export-pdf.js:723-724`, `console.error` seul) et l'absence de lib (672-676, `console.warn`). L'enseignant peut téléverser sur Léa des PDF **sans la page de rétroaction sans jamais le savoir** — alors que c'est la promesse du bouton.
- **B13 · Écart d'anonymisation** : le modal de révision anonymise les rétroactions (`travaux-export-pdf.js:882-884`), la synthèse rasterisée jamais (`synthese-retroaction-data.js:339-343`) — en mode anonymisé, un prénom tapé dans une rétroaction sort dans le PDF. Et le compteur « N évaluations prêtes » (`travaux-ui.js:3374-3391`) peut dépasser le nombre de PDF réellement produits (évaluations sans fichier résolu ignorées en silence, `travaux-archivage.js:325-330`).

---

## C. Design — écarts prouvés à la norme du projet

- **C1 · Variables CSS fantômes** : `var(--attention)` n'existe nulle part (`liste-evaluations.js:1128-1131, 2703, 2775` ; `travaux-ui.js:3841`) ; idem `--orange`, `--orange-pale`, `--radius` (`travaux-ui.js:1717-1718`) et `--couleur-attention`/`--couleur-texte-sombre` (l.796, retombant sur des hex Bootstrap hors palette). Conséquence : les avertissements (« Non associé », modales de suppression, alerte « à re-déposer ») **perdent leur couleur d'alerte dans les deux modes**.
- **C2 · Cibles tactiles < 44 px sur l'écran le plus utilisé au doigt** : `.travaux-btn-nav` et `.travaux-fond-swatch` 28×28 px (`styles.css:17576-17581, 17831-17833`), `.eval-actions-select` ≈ 24 px (`styles.css:2814`) — la norme est déjà appliquée ailleurs (`css/accompagnement.css:490-492`).
- **C3 · Écran Exporter hors design system** : 8 selects `class="form-select"` (`travaux-ui.js:1177-1234, 1686, 1700`) — classe quasi inexistante dans `styles.css`, rendu natif sans jetons de surface/focus ; la classe canonique est `.controle-form`. Titre « Archivage des travaux » ≠ libellé de navigation « Exporter et archiver » ; aucun état vide (`genererGrilleFichiers` → `''`, pas d'entrée `evaluations-exporter` dans `etats-vides.js:98-139`).
- **C4 · Mode clair cassé sur les flèches de tri de la Liste** : `var(--gris-clair)` (famille fond-clair, `#777788` en clair) posé sur l'en-tête bleu fixe (`index.html:8296-8317` sur `index.html:3479-3485`) ≈ 2,0:1 de contraste.
- **C5 · PDF de rétroaction** : le mode fixe inline (hex/px) est **volontaire et documenté** (`synthese-retroaction-rendu.js:6-8`) — correct. Mais la densité dessert l'usage cible cellulaire : base 10 px avec des dates à 6 px (l.204), numéros 6,5 px, pied 7 px — rasterisé, c'est du bitmap à zoomer. Et le texte `PAPER` est posé sur les couleurs d'échelle de l'utilisateur sans garde de luminance (l.179, 300, 313-317, 365-366) : un niveau jaune rend le code IDME illisible. Une date non échappée (`rendu.js:135`, seul oubli du fichier).
- Mineurs : hiérarchie h2/h3 incohérente entre écrans (`travaux-ui.js:865, 1162` en h3 ; les autres en h2), un « Cliquez » vouvoyé (`travaux-ui.js:798`), badges jetons en hex dur alors que les variables existent (`styles.css:9528-9629` vs `76-80`), pas de `:focus-visible` sur la toolbar d'annotation, `aria-label` remplacés par `title` sur les boutons-icônes de la visionneuse (`travaux-ui.js:1077-1106`).

---

## D. Mineurs (condensé)

- Import : ~25 `console.log` dans `travaux-resolution.js` (outils diagnostics, mais la règle dit zéro) ; fuite de `setInterval` à chaque ouverture du poste de préparation (`travaux-preparation.js:2648`, aucun `clearInterval`) ; clés sessionStorage non namespacées (`travaux-pipeline-production`, `travaux-jeton-production`) ; `new Date('AAAA-MM-JJ')` parsé UTC (décalage d'un jour possible, `travaux-ui.js:1744`) ; `appliquerJetonsReprisePostImport` (l.3961) balaie sans filtre groupe-cours.
- Liste : handlers orphelins (`toggleVerrouillerEvaluation` l.2113 sans appelant ; branches groupe/note de filtres dont les selects n'existent plus ; `attacherEvenementsActions` no-op au commentaire mensonger) ; double rendu par changement de filtre + accumulation de listeners à chaque visite (492-499) ; `production.nom` au lieu de `titre` → colonne vide en vue corbeille (2640) ; `reprise-ciblee` absent du tri jetons (2397-2405) ; annotations jamais purgées à la suppression définitive d'un fichier ni à la purge 30 jours ; propriétés du fichier sauvegardées sans rafraîchir la liste (1507-1536).
- Annoter : deux blocs `if` vides (`evaluation-sauvegarde.js:629-630, 858-859`) ; note finale lue depuis le DOM (`parseFloat(...textContent)`) plutôt que depuis le SSOT de calcul.
- Export : barres de progression jamais remises à zéro (`travaux-archivage.js:566-572, 596-602`) ; noms de dossiers ZIP non assainis (un « / » dans un nom crée des sous-dossiers ; fichier sans extension → la version annotée écrase l'original dans le ZIP) ; code mort `lancerAllegement` (652-681) ; `echapperHtml` n'échappe pas les guillemets (`config.js:281-286`) — tient uniquement parce que les IDs sont machine ; couleurs utilisateur interpolées dans des attributs `style` sans échappement (`rendu.js:179` et 7 autres).

---

## E. Ce qui fonctionne bien

- **Chaîne de sauvegarde de l'évaluation** : auto-save par snapshot (debounce 1,5 s) avec suspension pendant le chargement, flush avant changement d'étudiant (`evaluation-chargement.js:328`), avant fermeture de fichier (`travaux-annotation.js:105-118`) et au `beforeunload` (121-133) ; garde absolue « jamais réécrire une évaluation verrouillée » (l.1395, sentinelle dédiée) ; réconciliation #360 des doublons note-égale aux deux chemins ; échecs de persistance **notifiés** avec cause (quota / mode anonymisé / autre, `evaluation-sauvegarde.js:289-306`).
- **Annotations** : debounce 2 s, flush systématique à la désactivation (`travaux-annotation.js:256-266`), read-modify-write sur `cle('annotationsTravaux')`.
- **Sécurité import** : `validerMagicBytes` sur chaque fichier avec rejet par défaut, `echapperHtml` systématique sur les chemins vivants, rollback des métadonnées si le blob échoue, garde anti-réentrance.
- **Pipeline PDF** : nettoyage DOM garanti par `finally`, `pdfDoc.destroy()` discipliné, résolution évaluation↔fichier volontairement stricte (#145), sections sans donnée réellement masquées, principe « reformatage, pas production » respecté.
- **Hygiène** : zéro `console.log` dans les 8 modules d'évaluation/annotation, zéro handler inline dans tout le HTML généré audité, dispatch `data-action` complet.

---

## F. Corrections au meilleur ratio impact/effort

1. **A1** — faire détruire à `viderCorbeille()` exactement l'ensemble affiché (perte de données réelles, correctif local).
2. **A2** — supprimer les définitions perdantes de `supprimerEvaluation` et `rechargerFiltreProduction` (zéro-dette) + sentinelle anti-doublons de globaux.
3. **B11+B12** — try/catch par étudiant dans les deux boucles d'export avec bilan final (« 23 réussis, 2 échoués : … »), et remonter l'omission de la page de synthèse dans ce bilan.
4. **C1** — définir les alias `--attention`/`--orange`/`--orange-pale`/`--radius` (ou substituer les ~12 usages) : restaure d'un coup la couleur d'alerte des deux modes.
5. **B1+B2** — re-persister la file après import et relire la valeur DPI courante au re-render.
6. **B8+B5** — router les trois écritures directes restantes par `sauvegarderDonneesSelonMode` (ou un garde équivalent documenté pour les RMW de suppression).
