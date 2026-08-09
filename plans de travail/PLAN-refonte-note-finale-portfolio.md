# Plan — Refonte de la construction de la note finale du portfolio

**Démarré** : 24 mai 2026 matin
**Contexte** : remise des notes en cours. La rétroaction PDF envoyée à l'élève doit expliciter la construction de la note. Plusieurs bugs et incohérences identifiés.
**Principe directeur** : zéro-dette technique. Aucune pondération codée en dur arbitrairement — toutes les pondérations doivent être déterminées par l'utilisateur.

---

## 1. Modèle pédagogique (clarifié avec Grégoire)

Pratique active h2026 (`PAN-SDT-Litt H26`) :

- **10 artefacts** prévus au total dans la session (mais pas tous les élèves les produisent).
- Sur ces 10 : **8 forment le pool « Sélection »** + **2 sont « Obligatoires »** (toujours comptés).
- **Méthode** : Hybride. On retient les **4 meilleures** de la Sélection (16,25% chacune) + les **2 Obligatoires** (17,5% chacune) = **6 productions retenues sur 10**.
- **Pondérations** : 4 × 16,25 + 2 × 17,5 = 65 + 35 = **100%**.
- **Pas d'évaluation terminale séparée** en h2026. Les « Obligatoires » du portfolio ne sont pas une terminale — ce sont des productions du portfolio à pondération rehaussée.

Pratique a2025 (automne, historique) :

- 9 artefacts portfolio + 1 production de type « travail » titrée « Évaluation terminale » (ponderation 40).
- 1 conteneur `type: 'portfolio'` (ponderation 60).
- Méthode probable au moment de la transmission : **4 meilleurs** sur 7 évalués → Léa transmis = 73.2%.

---

## 2. Diagnostic des bugs

### Bug 1 — Fallback 60/40 codé en dur dans `calculerDetailsNoteFinale`

`js/profil-etudiant-actions.js:397-399` (avant correction) :

```js
const ponderationPortfolio = productionPortfolio?.ponderation || 60;
const ponderationTerminale = productionTerminale?.ponderation || 40;
```

Quand `productionPortfolio === null` ET `productionTerminale === null` (cas h2026), le fallback impose 60/40 fantôme. Le profil élève montre « × 60% / × 40% » alors que rien ne dit ça.

### Bug 2 — Heuristique de détection de la terminale fragile

`_identifierProductionTerminale` (avant correction) matchait sur titre/description (`titreLC.includes('terminal')`) et pondération > 0. Pouvait promouvoir n'importe quel artefact à « terminale » par erreur.

### Bug 3 — Rendu PDF de la note dans la rétroaction

`synthese-retroaction-data.js` + `synthese-retroaction-rendu.js` :
- `note.retenus` contient **les 6 retenus fusionnés** (Sélection + Obligatoires).
- Le titre dit « Voici les 6 meilleurs artefacts » → faux, ils ne sont pas tous meilleurs.
- La colonne droite « Artefacts obligatoires » liste **encore** les 2 obligatoires → doublon visible.
- Les pondérations `pondSel` et `pondObl` sont calculées dans `data.js` mais **jamais utilisées** dans le rendu.
- Le titre est codé en dur en « Note provisoire » — Grégoire veut un toggle manuel Provisoire/Finale.

### Bug 4 — Profil élève affiche un découpage Portfolio/Terminale fantôme

`profil-etudiant-sections-affichage.js:2728-2768` : le bloc Évaluation terminale est toujours rendu, même quand aucune terminale n'existe. La formule « 60% + 40% = 100% » est affichée artificiellement.

### Bug 5 — Champ legacy `mat-variante-calcul` dans le wizard pratique

`index.html:5800-5812` + `pratiques-gestion.js:961-997` : le sélecteur « Comment construis-tu la note finale ? » dédouble le sélecteur « Mode de sélection » plus bas (les deux peuvent être désynchronisés). Crée la confusion observée dans l'UI.

### Bug 6 — `modalitesEvaluation` n'est pas namespacée par trimestre

`js/trimestres.js:62-74` : `modalitesEvaluation` est dans `CLES_GLOBALES` — la pratique active est partagée entre tous les trimestres. Conséquence : quand Grégoire consulte a2025 aujourd'hui, l'app applique la pratique h2026 et **recalcule** différemment de ce qui a été transmis à Léa en décembre. Mismatch 64.0% (app) vs 73.2% (Léa).

---

## 3. Plan de travail — phases

### Phase A — Type explicite `terminale` + retrait fallbacks 60/40 — **LIVRÉE 24 mai 2026 matin**

| # | Fichier | Changement |
|---|---|---|
| A.0 | `index.html:4878-4880` | Ajout optgroup « Évaluation terminale » avec option `<option value="terminale">` |
| A.0 | `js/productions.js:1631` | `getTypeLabel` étendu : `'terminale': 'Évaluation terminale'` |
| A.0 | `js/productions.js:1322` | Définition explicative ajoutée pour le type `'terminale'` |
| A.1 | `js/profil-etudiant-actions.js:188-189` | `_identifierProductionTerminale` réduit à `find(p => p.type === 'terminale')`. Plus de heuristique. |
| A.2 | `js/profil-etudiant-actions.js:388-416` | Retrait des fallbacks `\|\| 60` / `\|\| 40`. Logique explicite : pas de terminale → portfolio 100% ; terminale présente sans pondération → erreur. |
| A.2 | `js/profil-etudiant-actions.js:428-456` | Helper `normaliser()` (guard div/0) + champs `erreur` + `terminal.present`. |
| A.3 | `js/profil-etudiant-sections-affichage.js:2690-2700` | Branche dédiée pour afficher l'erreur de configuration. |

**Migration manuelle requise** :
- a2025 : Grégoire a re-typé manuellement la production « Évaluation terminale » de `'travail'` à `'terminale'` (confirmé livré).

**Tests** : 85 Vitest + 18 Playwright = 103/103 verts.

### Phase E — Namespacing complet de `modalitesEvaluation` — **LIVRÉE 24 mai 2026**

> ⚠ *Ce titre portait « EN COURS » jusqu'au 9 août 2026 alors que le §5 du même
> document la donnait « livrée » depuis le 24 mai. Le plan se contredisait
> lui-même, et c'est ce titre-là qui a été cru.*

**Décision Grégoire (24 mai matin)** : namespacing complet plutôt qu'archive a2025. Stratégie progressive.

**Approche** :
- Pas de nouveau helper — `cle()` (`js/trimestres.js:211`) fait déjà le travail.
- Suffit de **reclasser** `'modalitesEvaluation'` : retirer de `CLES_GLOBALES` (`trimestres.js:69`) et ajouter à `CLES_NAMESPACEES` (`trimestres.js:~30-60`).
- **Boot migration** dans `js/main.js` : pour chaque trimestre du registre, si `${trimestreId}_modalitesEvaluation` est absent, **copier** le global dedans. Flag `migration_modalites_namespacees_done`.
- **Callers à migrer** : tout `db.getSync('modalitesEvaluation', ...)` devient `db.getSync(cle('modalitesEvaluation'), ...)`. Idem pour setSync.

**Lots de callers** (ordre de migration progressive) :

| Lot | Modules | Sites | Statut |
|---|---|---|---|
| Prérequis | `trimestres.js` (reclassement) + `main.js` (boot migration) | 2 | À faire |
| 1 — Profil | `profil-etudiant-actions.js` (déjà touchée), `profil-etudiant-calculs.js` | 5 | À faire |
| 2 — Évaluation | `evaluation.js`, `evaluation-chargement.js` | 8 | À faire |
| 3 — Pratiques/Wizard | `pratiques.js`, `wizard-pratique-v2.js`, `modes.js` | 8 | À faire |
| 4 — Misc | `travaux-export-pdf.js`, `trimestres.js:1153`, autres | ~5 | À faire |
| Final | Retrait du fallback global (la clé `modalitesEvaluation` non-namespacée) | — | À faire |

**Note importante** : `horaire.js:287, 296, 298` utilise **déjà** `cle('modalitesEvaluation')`. Quand on reclasse la clé, ces sites commenceront automatiquement à lire/écrire la version namespacée. Comportement attendu : aucune régression sur horaires.

**Conséquence pour Grégoire** :
- Après migration boot, `h2026_modalitesEvaluation` et `a2025_modalitesEvaluation` seront initialisés avec la valeur globale actuelle (Hybride h2026).
- Pour retrouver le 71% transmis à Léa : Grégoire bascule sur a2025, édite la pratique pour passer à « 4 meilleurs », sauvegarde → écrit dans `a2025_modalitesEvaluation`. h2026 ne bouge pas.

### Phase B — Refonte section Note finale du PDF rétroaction — **LIVRÉE (constatée au code le 9 août 2026)**

> ⚠ **Livrée sans trace.** Ni le journal du plan ni `BACKLOG.md` ne l'ont
> consignée ; elle a été découverte en vérifiant le code, pas en lisant un
> statut. Verrouillée depuis par `tests/unit/sentinelle-note-finale-portfolio-BC.test.js`.
>
> **Preuves relevées** — `synthese-retroaction-data.js` : `selection` filtre
> `categorie !== 'obligatoire'` et `obligatoiresRetenus` filtre l'inverse (fin
> du doublon) ; `ponderationSelection` / `ponderationObligatoires` exposées ;
> `estFinale` dérivé de `cfgConfiguration.notesFinales`.
> `synthese-retroaction-rendu.js` : titre `estFinale ? 'Note finale' :
> 'Note provisoire'`, `badgePondSel` / `badgePondObl` rendus par bloc, et un
> calcul détaillé par catégorie que le plan ne demandait même pas.
> Le toggle vit sur la case `mat-notes-finales` du formulaire de pratique
> (`pratiques-gestion.js`, lecture `setCheckbox` + écriture `getCheckbox`).

**Objectif** : la rétroaction PDF que l'élève reçoit doit expliciter honnêtement la construction de la note.

**Décisions prises** :
- Titre : **toggle manuel** dans l'app (« Note provisoire » / « Note finale »). Emplacement à définir au début de Phase B.
- Pondération : **par bloc seulement** (« Les 4 meilleurs (65%) », « Obligatoires (35%) »). Pas par artefact individuel.

**Fichiers concernés** :
- `js/synthese-retroaction-data.js:678-779` (`construireNoteProvisoire`) : refonte du data shape — séparer `selection` vs `obligatoires`, exposer pondérations numériques, flag `estHybride`, flag `estFinale` piloté par toggle utilisateur.
- `js/synthese-retroaction-rendu.js:542-605` (`renderRangeeNote`) : refonte du rendu — éliminer doublon, titre dynamique, formule explicite.

### Phase C — Cohérence du panneau Note finale dans le profil — **LIVRÉE (constatée au code le 9 août 2026)**

> ⚠ **Livrée sans trace**, comme la Phase B.
>
> **Preuves relevées** — `profil-etudiant-sections-affichage.js` :
> `const carteTerminale = terminal.present ? …` (plus de bloc fantôme) ;
> `formuleClassique` bascule sur « Note finale (portfolio à 100%) » quand il n'y
> a pas de terminale ; la grille prend `note-finale-grid-single` ; et le mode
> hybride sans terminale a sa **propre branche** (Sélection / Obligatoires),
> ce que le plan n'avait pas prévu.

**Objectif** : ne plus afficher de bloc « Évaluation terminale × 0% » fantôme quand aucune terminale n'existe.

**Fichier** : `js/profil-etudiant-sections-affichage.js:2728-2779`. Conditionner l'affichage du bloc terminale sur `detailsNoteFinale.terminal.present`. Adapter la formule (« 100% » au lieu de « 60% + 40% = 100% » si pas de terminale).

### Phase D — Retrait du champ legacy `mat-variante-calcul` — **LIVRÉE 9 août 2026 (#434), AMENDÉE le jour même (#435, 1.63.0)**

> ⚠⚠ **AMENDEMENT #435 (9 août, après vérification demandée par Grégoire).**
> #434 avait migré la bascule « Par objectifs » vers le mode de sélection — en
> croyant corriger un panneau cassé. Or la famille « par objectifs » avait été
> **condamnée le 5 août** (#396, décision D2 : chemins jamais fonctionnels), et
> le moteur STD visé ici portait le même défaut de naissance (appariement par un
> `objectifId` sans écrivain). Décision Grégoire : **étendre le retrait de #396**.
> Le mode, son moteur (4 modes de calcul), son panneau, ses dix fonctions
> d'édition et ses quatre gabarits sont RETIRÉS. Les pratiques legacy sont
> normalisées en lecture seule (console.warn, aucune réécriture). Détail : #435
> au BACKLOG. Les paragraphes ci-dessous décrivent l'état INTERMÉDIAIRE de
> #434, conservés pour la traçabilité de la journée.

> **Ce n'a pas pu être le « retrait pur » prescrit.** La vérification au code a
> trouvé deux raisons, dont une que le plan ne soupçonnait pas :
>
> 1. **`varianteCalcul` n'est pas un champ d'UI.** `pratique-pan-standards.js`
>    y route `calculerPerformance` vers le calcul par objectifs. C'est un **flag
>    de calcul**, porté par les pratiques déjà enregistrées.
> 2. **Le panneau « Par objectifs » ne pouvait JAMAIS s'afficher.** L'ancien
>    handler ne faisait que `classList.remove('u-hide')`, or
>    `#mat-config-par-objectifs` porte un `style="display: none;"` **inline** et
>    n'a aucune classe. Retirer une classe absente ne lève pas un style inline.
>    Le champ legacy n'était donc pas seulement un doublon : **son unique
>    fonction propre était cassée**, sans erreur ni trace.
>
> **Forme retenue** — le mode de sélection devient l'UNIQUE commande :
> - `mat-portfolio-selection` gagne l'option `par-objectifs` et pilote la
>   bascule des deux panneaux (`appliquerModeSelectionMat`), en levant le style
>   inline ;
> - `varianteCalcul` devient une **projection** du mode
>   (`varianteCalculDepuisMode`) — deux commandes qui pouvaient diverger sont
>   devenues une commande et sa dérivée. C'est la fermeture du Bug 5 ;
> - **reprise des pratiques existantes** : `config.varianteCalcul ===
>   'par-objectifs'` **ou** la présence de `config.parObjectifs` rouvre sur le
>   bon panneau. Sans elle, une pratique par objectifs s'ouvrait sur Portfolio
>   et la première sauvegarde effaçait sa configuration ;
> - le mode se pose **hors** du garde `if (config.portfolio)` — cas exact d'une
>   pratique par objectifs, qui n'a pas de bloc portfolio ;
> - retiré au passage : le bloc de rafraîchissement « interface STD » de
>   `pratiques-bibliotheque.js` (six `getElementById` sur des ids `v2-*`
>   absents du DOM — du code qui ne pouvait ni agir ni échouer).
>
> ⮕ **Ce qui reste dû, et qui appartient à G2-b** : faire lire `methodeSelection`
> au moteur pour que la projection disparaisse. C'est un changement du **contrat
> de calcul**, pas un retrait d'UI — même lot que les autres lecteurs legacy du
> snapshot `modalitesEvaluation`.
>
> Sentinelle : `tests/unit/sentinelle-phase-D-variante-calcul-434.test.js`,
> 13 cas, **12 break-tests ROUGE**. L'un des cas **évalue la vraie fonction de
> projection** extraite du source, plutôt que de redécrire une table parallèle
> qui pourrait diverger.

#### Prescription d'origine (24 mai 2026), conservée

**Décision Grégoire** : retrait pur (option a).

**Fichiers** :
- `index.html:5798-5814` : retrait du bloc `mat-variante-pan-standards`.
- `js/pratiques-gestion.js:961-997` (`changerVariantePANStandardsMat`) + tous les readers de `configuration.varianteCalcul`.
- **Question ouverte** : la bascule entre « Portfolio » et « Par-Objectifs » que pilotait ce champ — où la migrer ? Probablement ajouter une option `par-objectifs` au sélecteur « Mode de sélection » (`mat-portfolio-selection`).

---

## 4. Décisions architecturales prises (à respecter dans toutes les phases)

1. **Zéro fallback arbitraire** : les pondérations 60/40, 65/35, 100/0 etc. viennent toujours de la configuration utilisateur. Le seul cas implicite légitime : « pas de terminale → portfolio = 100% » (conséquence logique, pas un défaut).
2. **Pas d'heuristique fragile** : la production terminale est identifiée **uniquement** par `type === 'terminale'`. Plus de matching sur titre, description, ou pondération.
3. **Erreur visible** : si la configuration est incomplète (terminale présente sans pondération), l'app **refuse de calculer** et affiche un message dans le profil — pas de calcul silencieux trompeur.
4. **Namespacing strict** : la pratique de notation doit suivre le principe de namespacing du projet (par trimestre). Plus de pratique globale qui écrase les trimestres antérieurs.
5. **Toggle manuel Provisoire/Finale** : pas d'inférence automatique du statut de la note. C'est l'enseignant qui décide.
6. **Pondération PDF par bloc** : pas par artefact, pour rester lisible côté élève.

---

## 5. État actuel (24 mai 2026 fin de matinée — bug initial résolu)

- **Phase A** : livrée, tests verts. Validation utilisateur OK pour h2026.
- **Phase E** : livrée. `modalitesEvaluation` namespacée. 175 sites migrés.
- **Phase F** : livrée. `pratiquesConfigurables` namespacée. 69 sites migrés. Isolation a2025/h2026 vérifiée.
- **Phase G1** : livrée. Boot migration qui convertit les `pratiqueId` de type général (ex. `"pan-standards"`) vers des ids configurables réels (ex. `"pan-standards-bedard"`).
- **Phase G2-a** : livrée. Le calculateur (`_obtenirConfigPortfolioCalcul`) lit uniquement la bibliothèque via `obtenirConfigPratiqueActive()`. Si la pratique active est introuvable, erreur explicite affichée dans le profil.
- **Wizard fix (pratiques-gestion.js)** : livré. La constante `CLE_PRATIQUES_CONFIGURATIONS` (67 sites dans ce fichier) écrivait vers la clé globale, masquant Phase F. Maintenant migrée vers `cle()`. C'est ce fix-là qui a finalement débloqué la propagation wizard → calcul.
- **Métadonnées de pratique** : corrigées via snippet. La pratique « PAN-Littérature A25 » est désormais attribuée à Grégoire Bédard (Cégep de Drummondville). Id renommé `pan-standards-bruno` → `pan-standards-bedard` dans toutes les références.
- **Validation arithmétique finale** : a2025 Bermudez Ambriz = 73,5% avec mode « N meilleurs, 4 » — cohérent à 0,3% près avec les 73,2% transmis à Léa en décembre 2025.
- **Phases B et C** : ⚠ **LIVRÉES — constaté au code le 9 août 2026**, jamais consignées.
  Verrouillées depuis par `tests/unit/sentinelle-note-finale-portfolio-BC.test.js`
  (11 cas, 11 break-tests ROUGE), qui couvre aussi les décisions §4-1, §4-2 et §4-3.
- **Phases D et G2-b** : **réellement en attente** (vérifié le 9 août).
  - ~~**Phase D**~~ **LIVRÉE le 9 août 2026** (#434). *État constaté avant travaux, conservé :* le bloc `mat-variante-pan-standards` était toujours dans
    `index.html:5524`, son sélecteur `mat-variante-calcul` et le handler
    `changerVariantePANStandardsMat` aussi. ⚠ **La question ouverte est réelle et
    bloquante** : ce handler est le **seul chemin** qui révèle le panneau
    `mat-config-par-objectifs`. Le retirer sans migrer la bascule rendrait
    « Par objectifs (4 modes de calcul) » **inatteignable**. Le doublon avec
    `mat-portfolio-selection` est confirmé : trois valeurs sur quatre se
    recouvrent, avec deux vocabulaires différents.
  - **G2-b** — `configPAN` est encore lu dans une dizaine de modules.

### Synthèse architecturale (nouvelle conception)

- **Source canonique de la pratique active d'un groupe-cours** : `groupesCours[id].pratiqueId` (un id de pratique configurable, jamais un type général).
- **Source canonique de la config d'une pratique** : `${trim}_pratiquesConfigurables[id].configuration`.
- **Snapshot `modalitesEvaluation.configPAN.portfolio`** : neutralisé pour le calcul de la note (G2-a). Reste utilisé par 30 sites legacy (`pratiques.js`, `pratique-pan-standards.js`) à migrer en G2-b.
- **Namespacing** : chaque trimestre a sa propre bibliothèque locale, ses propres modalités d'évaluation, ses propres groupes-cours. Pratique évolue librement d'un trimestre à l'autre sans contaminer le passé.

## 6. Tâches actives (référence)

> ⚠ **Liste périmée, corrigée le 9 août 2026.** Elle portait encore B, C et E
> comme « pending » alors que les trois sont livrées. Elle est conservée pour
> mémoire, barrée, plutôt que supprimée — c'est elle qui a induit le §4ter de
> `ETAT-PROJET.md` en erreur, et l'effacer effacerait la leçon.

- ~~#3 — Appliquer le modèle aux notes réelles et valider~~ → **porte terrain**, toujours due
- ~~#5 — Phase B~~ → **LIVRÉE** (constatée au code le 9 août)
- ~~#6 — Phase C~~ → **LIVRÉE** (constatée au code le 9 août)
- ~~#7 — Phase D~~ → **LIVRÉE le 9 août 2026** (#434, 1.62.0) — voir le §3 pour ce qui a rendu le « retrait pur » impossible
- ~~#8 — Phase E~~ → **LIVRÉE** le 24 mai
- **G2-b** — migrer les ~30 lecteurs legacy de `configPAN.portfolio`

---

## 7. Fichier de diagnostic console (utile pour reprise)

`audit-productions-console.js` à la racine du repo. Inspecte productions a2025/h2026 et identifie portfolio + terminale (heuristique vs type explicite). À coller dans la console Safari.
