# Plan #328 Lot 2 — Dégonfler le miroir `modalitesEvaluation`

> **Date du cadrage** : 11 juin 2026 (Claude Code, session solo — analyse préparatoire,
> AUCUN code L2 écrit). **Référence** : audit `Rapports/AUDIT-SSOT-MODALITES-EVALUATION-2026-06-10.md`
> §6 Lot 2 ; lots 0/1/3 livrés (L3 le 11 juin, commit `f5730e6c`).
> **Statut** : ⏸ EN ATTENTE DE DÉCISIONS GRÉGOIRE (§4) — ne pas coder avant.

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

## 4. Décisions à trancher AVANT de coder (Grégoire)

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
