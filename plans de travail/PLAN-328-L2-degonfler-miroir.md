# Plan #328 Lot 2 — Dégonfler le miroir `modalitesEvaluation`

> **Date du cadrage** : 11 juin 2026 (Claude Code, session solo — analyse préparatoire,
> AUCUN code L2 écrit). **Référence** : audit `Rapports/AUDIT-SSOT-MODALITES-EVALUATION-2026-06-10.md`
> §6 Lot 2 ; lots 0/1/3 livrés (L3 le 11 juin, commit `f5730e6c`, release 1.15.1).
> **Statut** : ✅ DÉCISIONS ACTÉES (Grégoire, 11 juin 2026 — voir §4 bis). Prêt à coder,
> dans l'ordre du §4 bis (L2-0 d'abord).

## 4 bis. DÉCISIONS ACTÉES (Grégoire, 11 juin 2026)

- **D1 = (a) PARTOUT, en deux temps** : suppression pure des champs miroirs, chaque
  lecteur dérive via helper unique. Chemin de calcul d'abord (L2-b1), affichage ensuite
  (L2-b2) ; les écritures miroirs ne tombent qu'à la toute fin.
- **D2 = #301 ABSORBÉ** : le helper de dérivation prend un contexte EXPLICITE
  (groupe-cours + trimestre consultés), jamais de globaux implicites. La signature du
  helper est la pièce maîtresse du lot.
- **D3 = les jetons suivent la config VIVANTE** (dérivation à la lecture, pas de
  snapshot) — `_synchroniserJetonsPratique` disparaît. Défaut acté pour le cas limite :
  les consommations passées restent valides (jamais de rétro-annulation d'évaluation),
  le solde peut devenir négatif et l'UI le montre tel quel. À verrouiller par test en L2-c.
- **D4 = séquence confirmée** : L2-0 (golden masters chemin procédural) → L2-a
  (`pratiqueId` + `approcheEvaluation`) → L2-b1 calcul / L2-b2 affichage (`pratique`) →
  L2-c (`configPAN.jetons`). Terrain H2026 après chaque sous-lot ; release minor à la fin.

## 4 ter. Avancement

- **✅ L2-0 LIVRÉ (11 juin 2026)** : `tests/integration/golden-master-procedural-L2-0.spec.js`.
  Fixture synthétique posant SSOT ET miroir de façon cohérente ; chiffres figés sur
  1.15.1 : STD noteFinale **81,5** (meilleurs 2 = 82,5 ; terminale 80 ; pondérations
  60/40 ; exclusion `remplaceeParId` vérifiée ; P=82, C=100) ; parité explicite/active ;
  SOM P=**78** ; SPE P=**80** (palier 2 artefacts + terminale, seuil 70). **Caractéristique
  figée sciemment** : sans entrée `indicesCP[da].actuel`, une pratique CONFIGURABLE rend
  P=0 (garde de `PratiqueConfigurable.calculerPerformance` court-circuite la délégation
  SPE) — si L2 change cette garde, le test le rend visible.
- **✅ L2-a LIVRÉ (11 juin 2026)** : champs miroirs `pratiqueId` et `approcheEvaluation`
  dégonflés. Constat d'inventaire : `approcheEvaluation` n'avait AUCUN lecteur (les ~18
  sites du grep étaient l'état d'édition du wizard, `reponses.*`) ; `pratiqueId` en avait
  2 réels. Livré :
  - `obtenirPratiqueActiveGroupeCours()` (modes.js) résout par la SSOT `groupesCours`
    AVANT les copies (gcActif/infoCours) — patron #332 ; fallback mort « pratiqueNotation »
    retiré. C'est l'embryon du helper D2 (le paramètre de contexte explicite vient en L2-b).
  - wizard `sauvegarderPratique` : garde « est-ce l'active ? » dérivée de la SSOT ;
    n'écrit plus que `m.pratique` (type — encore lu, L2-b). La clause bootstrap « miroir
    vide → le réclamer » est supprimée : une pratique créée sans être assignée ne bascule
    plus le type du trimestre (sémantique SSOT).
  - `trimestres.js` snapshot : pratiques utilisées dérivées de `${id}_groupesCours`
    (TOUTES les pratiques actives du trimestre — le miroir n'en stockait qu'une).
  - `purgerLegacy()` étendue : strip `pratiqueId`/`approcheEvaluation` des données de
    chaque trimestre (sans rapatriement) ; seed démo nettoyé (SSOT démo = `GC_DEMO`).
  - Tests : sentinelle `sentinelle-ssot-modalites-miroir-L2a.test.js` (8 cas, dont
    fonctionnels SSOT-first sur modes.js chargé en sandbox) + 2 cas purgerLegacy au
    contrat L1. Golden master L2-0 inchangé au centième.
- **✅ L2-b1 LIVRÉ (11 juin 2026)** : le chemin de CALCUL dérive le type de la SSOT.
  - **Helper D2 livré** : `obtenirTypePratiqueActive(contexte)` (`pratique-registre.js`,
    exposé window). Chaîne : `groupesCours[].pratiqueId` → type (id canonique du registre,
    ou `configuration.type` d'une configurable lue dans la bibliothèque DU TRIMESTRE DU
    GROUPE-COURS — absorption #301 côté résolution de pratique). Contexte explicite
    `{gcId, trimestreId}` ; copies en dernier recours, JAMAIS sous contexte explicite ;
    `null` si introuvable — chaque appelant garde son défaut historique.
  - **13 sites migrés** (8 fichiers calcul) : indices, evaluation, evaluation-chargement
    (id via `obtenirPratiqueActiveGroupeCours`), statistiques, profil-etudiant-calculs ×2,
    profil-etudiant-actions (garde de `calculerDetailsNoteFinale`), profil-etudiant-helpers
    ×4 (terme/genre/évaluables/instance — résolution du type seulement, classe d'instance
    inchangée), etudiants ×2. `termeProduction` (champ PROPRE, pas un miroir) reste lu
    dans les modalités.
  - **Tests** : `sentinelle-ssot-pratique-type-L2b1.test.js` (8 cas — fonctionnels du
    helper dont le cas #301 bi-trimestre, + RATCHET statique : les 8 fichiers calcul ne
    relisent plus `.pratique` du miroir ; liste qui ne peut que S'ALLONGER en L2-b2).
    Sentinelle #309 adaptée (stub du helper au lieu du miroir). Golden master inchangé.
  - **Note sémantique** : le miroir contenait tantôt un TYPE tantôt un ID de configurable
    selon l'écrivain (`changerPratiqueActive` écrivait l'ID) — la dérivation SSOT élimine
    cette ambiguïté pour le calcul.
- **Prochain sous-lot : L2-b2** (lecteurs AFFICHAGE de `pratique` : tableau-bord ×3,
  graphiques ×1, sections-affichage ×3, travaux-export-pdf, rapport-bug, donnees-v2 +
  domaine pratiques ~36 sites, puis RETRAIT des écritures `m.pratique`).

---

## 1. Le problème, précisément

Quatre champs de `modalitesEvaluation` dupliquent des données dont la SSOT est ailleurs,
maintenus à la main par les écrivains routés au Lot 1 :

| Champ miroir | SSOT réelle | Sites lecteurs (grep 11 juin) |
|---|---|---|
| `pratiqueId` | `groupesCours[id].pratiqueId` | **3** (wizard sync ×1, trimestres snapshot ×2) |
| `pratique` (type) | type de la pratique active (`configuration.type`) | **~59** |
| `approcheEvaluation` | `pratique.configuration.approcheEvaluation` | **~18** |
| `configPAN.jetons` | config jetons de la pratique active | **~31** |

**La découverte structurante du cadrage** : le miroir est de granularité **TRIMESTRE**
(une clé `{trimestre}_modalitesEvaluation`) alors que la SSOT est par **GROUPE-COURS**
(`groupesCours[id].pratiqueId`, décision actée #303). Deux groupes-cours d'un même
trimestre peuvent avoir deux pratiques actives différentes ; le miroir n'en stocke
qu'UNE. Ce n'est pas un simple drift d'implémentation — c'est une **perte d'information
par conception**, et la raison de fond des désynchronisations (cas réel #308, P à 0 %).

**Conséquence** : « dériver de la SSOT » n'est pas mécanique. Chaque site lecteur doit
répondre à « la pratique de QUEL groupe-cours ? » :
- sites du chemin de calcul (indices, portfolio, statistiques, profil) → le groupe-cours
  de l'étudiant traité (souvent = groupe-cours actif, mais pas en consultation — cf. #301) ;
- sites d'affichage (badges, libellés tableau de bord) → le groupe-cours actif ;
- sites « configuration » (éditeur v2, wizard) → la pratique EN ÉDITION, pas l'active.

## 2. Pourquoi pas de tranche détachable

Les ÉCRITURES miroirs ne peuvent pas cesser tant que les LECTEURS ne sont pas migrés —
retirer une écriture casse les ~108 lecteurs restants. Ordre obligatoire : migrer les
lecteurs champ par champ → puis retirer l'écriture du champ → puis sentinelle.
Même `pratiqueId` (3 lecteurs) est entrelacé : son écrivain wizard met à jour
`pratique` et `approcheEvaluation` dans le même mutateur.

## 3. Garde-fous existants — INSUFFISANTS en l'état

- `golden-master-calcul-sessionC.test.js` ne fige que `Sommative.calculerPerformance`
  sur fixture (4 cas). Le chemin procédural (`calculerDetailsNoteFinale`, `simulerIndices`,
  `indices.js`) — là où vivent la majorité des ~59 lecteurs de `.pratique` — n'a PAS de
  golden master.
- **Préalable recommandé (lot L2-0, sans risque, faisable solo)** : golden master
  Playwright du chemin procédural — fixtures contrôlées via `db.setSync` (patron
  chantier I), appeler `simulerIndices(da)` + `calculerDetailsNoteFinale(da)` pour
  STD/SOM/SPE, figer les chiffres exacts AVANT de toucher aux lecteurs.

## 4. Décisions à trancher AVANT de coder (Grégoire) — TRANCHÉES, voir §4 bis

**D1 — Sort du champ `pratique` (type) au niveau trimestre.** Options :
- (a) **Suppression pure** : chaque lecteur dérive du groupe-cours pertinent via un
  helper unique (ex. `obtenirTypePratiqueActive(gcId?)` dans le module propriétaire ou
  `pratique-registre.js`). Le plus propre ; le plus gros diff (~59 sites).
- (b) **Cache dérivé écrit par le SEUL module** au changement de pratique active
  (événement unique, plus de 12 écrivains) : les lecteurs ne changent pas. Reste un
  miroir, mais avec UN écrivain et une source claire. Moins de risque, dette résiduelle.
- Recommandation Claude : (a) pour le chemin de calcul, par helper ; (b) acceptable
  temporairement pour les sites d'affichage purs si on veut découper en deux sessions.

**D2 — Contexte de dérivation en consultation (lien #301).** La résolution actuelle lit
le namespace du trimestre ACTIF même en consultant un trimestre archivé. L2 fige-t-il la
règle « contexte = groupe-cours consulté, namespace du trimestre consulté » (ce qui
absorbe #301), ou reporte-t-on #301 ? Recommandation : l'absorber — sinon on migre deux
fois les mêmes sites.

**D3 — `configPAN.jetons`** (~31 sites, `_synchroniserJetonsPratique` en écrivain) :
dériver à la lecture via la config de la pratique active (supprime le « miroir de
miroir »), ou conserver un cache snapshoté à l'évaluation (sémantique « jetons au moment
de l'éval ») ? **Question sémantique, pas technique** — les jetons consommés doivent-ils
suivre une config de pratique modifiée a posteriori ?

**D4 — Découpage en sessions.** Proposition : L2-0 golden masters (solo, sans risque) →
L2-a `pratiqueId` + `approcheEvaluation` (21 sites) → L2-b `pratique` (~59) →
L2-c `configPAN.jetons` (~31, après D3). Terrain réel (H2026, 2 groupes) après chaque
sous-lot. Release minor à la fin seulement.

## 5. Inventaire de référence (greps reproductibles)

```bash
grep -rnE "(modalites|config|mods|modalitesTab|configBeta)\.pratique\b" js/   # ~59
grep -rn "approcheEvaluation" js/                                             # ~18
grep -rn "configPAN\.jetons" js/                                              # ~31
grep -rnE "(modalites|config)\.pratiqueId" js/                                # 3
grep -rn "modalitesEvaluation\.modifier\|modalitesEvaluation\.remplacer" js/  # 40 écritures
```

Helpers existants à réutiliser (ne pas dupliquer) : `obtenirPratiqueActiveGroupeCours`,
`obtenirConfigPratiqueActive` (portfolio.js), `obtenirPratiqueParId` /
`normaliserIdPratique` / `obtenirRepresentationPratique` (pratique-registre.js).

## 6. Critère de fin (inchangé, audit §6)

Golden masters verts (y compris les nouveaux L2-0) ; plus AUCUNE synchronisation
manuelle des 4 champs ; sentinelle interdisant leur réintroduction dans les mutateurs
du module ; terrain H2026 validé (notes finales identiques avant/après sur les 2 groupes).
