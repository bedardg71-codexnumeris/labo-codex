# Plan de travail — Restauration longitudinale A25 (pilote)

> Créé le 22 juin 2026 (session Cowork). A25 sert de **pilote complet** : on vise la
> reconstruction fidèle du trimestre, on mesure l'effort réel, puis on décide du niveau
> à appliquer à A24 et H24.

---

## 0. Reprise de session (handoff)

> Cette section permet à une **nouvelle session** (Cowork ou Claude Code) de reprendre sans
> le contexte de la conversation d'origine (22 juin 2026). Tout ce qui suit est **établi et
> vérifié** — ne pas re-dériver.

### Acquis verrouillés
**Pratique A25 reconstituée et validée** (MAE **0,203 pt vs Omnivox sur les 30 élèves**, re-vérifié
le 22 juin par recalcul — calage initial 0,26 sur 16 ; cf. §8.1) :
- Échelle holistique : I=40, D=65, M=75, E=100.
- Français : holistique (lettre IDME) sur la plupart des artefacts ; **algorithmique** sur les
  rédactions (artefact 6 + analyse finale) → `note = pondération − (erreurs/mots × 500)`.
- **Français = 30 % en A25** (passé à 20 % seulement à partir d'H26 — ne pas confondre).
- Note d'artefact (grille A25) = 0,15·S + 0,20·R + 0,10·P + 0,25·N + 0,30·Fr.
  ⚠️ **À confirmer avant de recréer la grille (input n°1)** : l'app affiche aujourd'hui
  `20/20/15/25/20` pour A25 (valeurs H26 — contamination probable). Le recalcul moteur tranchera. Cf. §8.3.
- Portfolio = moyenne des **4 meilleurs** des 9 ; **plafond niveau I (64)** si < 7 remises
  (`reglesConformite.plafonds`).
- Note finale = **0,6·portfolio + 0,4·analyse finale** (60/40 porté par les pondérations des
  productions, pas par la pratique).
- Le moteur STD (`calculerDetailsNoteFinale`, `profil-etudiant-actions.js`) consomme la
  `noteFinale` **stockée** de chaque artefact (l'algo français y est déjà cuit).

**Corrections déjà appliquées au codex** (`donnees.json`, backups `.bak` présents dans le dossier) :
- terminale `PROD1765415976749` : `type` `travail` → `terminale` ;
- ajout de la pratique exécutable `pan-litterature-a2025` ; groupe réel `GC_1769182206198`
  `pratiqueId` → `pan-litterature-a2025` ;
- suppression du groupe doublon `GC_…_bc2873192608` (+ clé séances orpheline + config orpheline
  `pan-standards-bedard`) ; `codex-manifeste.json` ré-aligné.

**Reste connu** : voir **§8 (journal du 22 juin — audit Claude Code)** pour l'état vérifié + la
**séquence « recréation propre »** (recréer A25 isolé → intégrer PDF + rétroactions → recalcul
moteur validé vs tableur Numbers et Omnivox → transférer à H24/A24). Question critique en
suspens : **pondération A25** des critères (cf. §8.3).

### Fichiers de référence (dossier « Suivi 101-102-103 »)
- Codex de travail : `codex-Écriture-et-littérature-H2026-A25-…/donnees.json` (+ `.bak`).
- `pratique-A2025-reconstituee.json` (pratique exécutable importable).
- `resultats-conformes-A25.csv` (notes de référence, 30 élèves).
- Tableurs : `601-101-MQ-A2025 partiel (sem 10).numbers`, `…A2024 complet`, `…H2024 complet`.
- Sauvegarde complète A25 : `passage 101-102/sauvegarde-monitorage-2026-02-04-…json`.
- Plan de cours : `Ressources partagées/…Plan de cours … A2025 v3g-190825.pdf`.
- Doc moteur (app) : `Monitorage_v6/Skills pour Claude Code/SKILL_pratiques_notation.md`.

### Comment reprendre
- **Cowork** pour la reconstruction pilotée par documents (PDF des consignes/productions, tableurs,
  présences, jetons) et l'édition du codex.
- **Claude Code** si on touche au **code** de l'app (cause racine de la contamination = grilles
  partagées entre trimestres ; cf. L2 + `SKILL_integrite_globaux`).
- Démarrer par **L0 + L1**.

---

## 1. Finalité

Reconstituer A25 comme **trimestre complet et fidèle** dans le codex, afin de rendre
possible une **étude longitudinale inter-trimestres** (parcours 101→102→103 et comparaison
des pratiques). Le but n'est pas seulement les notes : c'est un trimestre **recalculable et
réutilisable** dans l'app (comparateur, profils, RàI).

## 2. Sources de vérité (par élément)

| Élément | Source de vérité | Secondaire |
|---|---|---|
| Notes finales | **Omnivox** (golden master, décimal) | fichiers reconstruction (Note/100) |
| Détail par critère (IDME + algo) | codex `a2025_evaluationsSauvegardees` | tableurs A25 |
| Présences | tableurs A25 | codex (25 août → 10 déc déjà présent) |
| Jetons | **tableurs de Grégoire** (registre confirmé) | rétroactions (« x/y utilisés ») |
| Productions / pondérations / barèmes | plan de cours A2025 v3g | codex |

## 3. Principes directeurs

1. **Isolation par trimestre (anti-contamination)** — chaque trimestre porte SES grilles /
   échelles / productions. Aucune collection globale mutable partagée entre A25 et H26.
   *C'est la cause racine du problème observé* (grille français passée 30 %→20 % pour H26,
   ayant déteint sur A25). Réf. `SKILL_integrite_globaux`.
2. **Vérification systématique (break-test)** — chaque lot livré DOIT reproduire Omnivox
   (MAE < 0,5 pt) ; toute sentinelle doit pouvoir ROUGIR avant qu'on lui fasse confiance.
   Réf. `SKILL_verification_adverse`.
3. **Préservation des données réelles** — travail sur une **copie** de l'export ; backup
   avant chaque écriture ; ne jamais rouvrir+sauver une évaluation dans l'app sans vérifier
   l'impact sur les `noteFinale`.
4. **Zéro-dette** — remplacer proprement (pas d'alias, pas de doublons « au cas où »).

## 4. État des lieux (faits, 22 juin 2026)

| Élément | État | Confiance |
|---|---|---|
| Notes holistiques + algo | présentes, validées (**MAE 0,203 vs Omnivox / 30 él.** — cf. §8.1) | élevée |
| Rétroactions | présentes (par critère + finale) | élevée |
| Présences | codex couvre 25 août → 10 déc (~complet) | à auditer |
| Productions / grilles / échelles | présentes ; grilles **à isoler par trimestre** | moyenne |
| Jetons | structure `jetonsEtudiants` **vide** ; registre dans tableurs | à importer |

## 5. Lots de travail (A25 pilote)

**L0 — Cadre & golden master.** Copie de travail du codex + backup. Construire le golden
master Omnivox (note finale décimale par élève) et le script de validation réutilisable.

**L1 — Cohérence des notes (socle).** Corriger l'évaluation contaminée (terminale d'un
élève → français 30 %). Auditer la cohérence `criteres ↔ noteFinale ↔ grille` sur les
30 élèves ; français = 30 % partout. *Vérif* : recalcul moteur = Omnivox (MAE < 0,5).

**L2 — Isolation grilles / échelles par trimestre (cœur anti-contamination).** Créer les
grilles A25 propres (Global-4 ; Global-5 FR-HOLIS 30 % ; Global-5 FR-CALCUL 30 %) + échelle
IDME A25, **distinctes** d'H26. Re-pointer productions/évaluations A25. *Vérif* : modifier
une grille H26 ne change **aucune** note A25 (test croisé).

**L3 — Formulaires des productions.** Compléter les 9 artefacts + analyse finale : noms,
types (`artefact-portfolio` / `terminale`), pondérations (portfolio 60 / terminale 40),
grille associée, semaine. Source : plan de cours. *Vérif* : portfolio lisible par le moteur.

**L4 — Rétroactions.** Vérifier rétro par critère + finale ; combler depuis Omnivox /
fichiers reconstruction.

**L5 — Présences.** Auditer la complétude (trous éventuels) ; combler depuis les tableurs ;
recalculer l'indice A. *Vérif* : assiduité par élève cohérente avec les tableurs.

**L6 — Jetons.** Importer le registre tableur → `jetonsEtudiants` ; rattacher aux reprises /
artefacts concernés. *Vérif* : usage cohérent ; impact sur les reprises tracé.

**L7 — Validation globale & verrou.** Recalcul complet moteur vs Omnivox ; snapshot de
référence ; réimport dans l'app ; validation terrain Mac + iPad (sombre/clair).
**Décision** : répliquer A24 + H24.

## 5 bis. Documents à rassembler (à fournir au fil des lots)

| Lot | Documents | Statut |
|---|---|---|
| L1 | — (données déjà en main) | prêt |
| L2 | définition des grilles A25 (plan de cours + tableurs) | partiel |
| L3 | **consignes des travaux** + **productions en PDF** (9 artefacts + analyse finale) | à fournir |
| L4 | rétroactions publiées (Omnivox) — seulement si trous | au besoin |
| L5 | tableurs de présences A25 (surtout séances après sem. 10) | à vérifier |
| L6 | **registre d'usage des jetons** (tableurs) | à fournir |
| A24 / H24 | tableurs complets (déjà présents) + Omnivox | prêt |

> Astuce session : fournir les documents **par lot** plutôt que tous d'un coup, pour ménager
> le contexte. L3 (productions/consignes PDF) et L6 (jetons) sont les apports décisifs.

## 5 ter. Données cibles & extraction

> À **figer avant la restauration** : on restaure *en fonction de* ce qu'on devra extraire et
> analyser (éviter de restaurer puis découvrir un champ manquant). Préalable utile à L0.

**Cible d'extraction — par élève × trimestre :**

- *Identité* : DA (clé d'appariement inter-trimestre) + cohorte / trimestre.
- *Carte de maîtrise* : artefact (étape, dans l'ordre du processus) × critère → niveau IDME.
  Objet brut dont tout dérive.
- *Dérivés par critère (PAN, pas SOM)* : niveau **tenu** (récence non rétrogradée), **maîtrise
  atteinte** (M+ tenu, option ≥ 2 démonstrations), **précocité** (étape de franchissement de M),
  **stabilité** (nombre de rétrogradations).
- *Terminale* : niveau par critère + note (démonstration sous contrainte).
- *Engagement* : A-C-P, présences / assiduité, reprises / jetons.
- *Aval* : **réussite/échec 102** (et 103 pour A24) ; note/rang en secondaire.
- *Provenance* : Omnivox vs reconstitué (traçabilité de la fidélité).

**Propriétés exigées de l'extraction :** reproductible (script depuis `donnees.json`), **validée**
(réconcilie avec le golden master Omnivox), **namespacée par trimestre** (aucune fuite
inter-trimestre — dépend de L2).

**Hypothèses qu'elle doit servir :** *H-fondations* (consolider S/R/F avant Plausibilité puis
Nuance), *H-transfert* (la consolidation de la **Nuance** prédit le 102, au-delà du niveau
global), *re-test des seuils SOLO* (0,65 / 0,75 / 0,85) que le skill affiche déjà comme acquis.

**Horizon application :** l'extraction manuelle d'aujourd'hui = **prototype de la future fonction
d'export longitudinal** (inter-cours / inter-trimestre). Briques moteur réutilisables :
`simulerIndices`, snapshots hebdomadaires, `calculerDetailsNoteFinale` ; l'intra-trimestre existe
déjà (`correlations-longitudinales.js`).

## 6. Risques & points ouverts

- **Contamination résiduelle** si une collection globale reste partagée (vigilance L2,
  avant tout réimport).
- **Fidélité des jetons** = qualité du registre tableur.
- **Re-import** : s'assurer que l'app ne recalcule pas les notes A25 sous une grille H26.
- **Volume** : codex ≈ 1,2 Go avec les travaux → zips/imports lents.

## 7. Réplication A24 / H24 (après pilote)

Mêmes lots. Avantage : les tableurs **complets** A24 et H24 sont déjà présents
(`601-101-MQ-A2024 complet`, `601-101-MQ-H2024 complet`) — sources plus riches que le
partiel A25. La décision d'aller jusqu'au complet (vs essentiel-étude) se prend à la fin du
pilote A25, effort réel en main.

---

## 8. Journal de session — 22 juin 2026 (Claude Code : audit lecture seule + cadrage)

> Session de **préparation**, **aucune écriture** dans les données. Tout ci-dessous est vérifié
> sur le codex exporté `…A25-2026-06-22-12h29/donnees.json` (sauf mention « à confirmer »).
> **Complément technique du §5 ter** : ici l'exécution qui produira les données cibles de l'extraction.

### 8.1 Acquis vérifiés (faits)

**Pratique en vigueur.** Le groupe-cours A25 `GC_1769182206198`
(« A2025-601-101-MQ-00001, Lun-AM / Mer-PM ») porte `pratiqueId = pan-litterature-a2025`
(type `standards`). C'est elle qui calcule.

**Calcul de la note finale** (chemin STD `calculerDetailsNoteFinale`, `profil-etudiant-actions.js`) :
portfolio (4 meilleurs des 9 ; **plafond niveau I = 64 si < 7 remises**) + terminale, **agrégés par
les pondérations des productions** — `Portfolio` = 60, `Évaluation terminale` = 40. Le **60/40
n'est PAS dans la pratique** ; il est porté par les productions (confirmé côté Omnivox : en-tête
« Processus 60 % » + « Produit 40 % »). Le moteur **consomme les `noteFinale` d'artefact
stockées** ; le % français par critère n'entre PAS dans cette agrégation.

**Vérification vs Omnivox** (golden master, **30 élèves**) : **MAE = 0,203 ; 29/30 sous 0,5 pt** ;
Un élève : 73,2 (Omnivox) vs 73,5 (reconstruit) = 0,3. **Seul écart notable : un autre élève, 1,4**
(70,8 vs 69,4) — localisé sur le **français algorithmique** (artefact 6 + terminale).
⚠️ Comparaison faite contre les notes **« conformes »** (reconstruction Cowork) ; reste à
confirmer par **recalcul moteur sur le codex** (break-test complet).

**Outillage** : le `.xls` Omnivox est en réalité du **HTML** (table) — le parser comme HTML
(l'env Python local n'a ni pandas ni xlrd). Colonne utile = « Résultat final » `X/100` décimal
(pas le % « Processus » du portfolio).

### 8.2 Contamination cartographiée (cœur de l'isolation)

A25 et H26 **partagent les 3 mêmes grilles** (`GRILLE1759264206489`, `GRILLE1759243306842`,
`GRILLE1759529438501`), libellées « H26 », dont les définitions vivent dans des clés **globales**
(`cartouches_GRILLE…` + `grillesTemplates`). Vecteur : éditer une grille pour H26 modifie la base
de calcul d'A25 **au recalcul d'une évaluation rouverte** (les notes déjà stockées ne bougent pas
tant qu'on ne rouvre/recalcule pas). D'où la stratégie de **recréation propre** (§8.4) et le
besoin de **namespacer par trimestre** (cf. §5 ter, « aucune fuite inter-trimestre »).

**Champs algo vides** : sur les artefacts à français algorithmique, « nombre d'erreurs » et
« nombre de mots » sont **vides** dans le codex → les notes d'artefact ont été **posées** (calées),
pas calculées. Les **rétroactions algo** (à fournir) portent ces données.

### 8.3 Questions ouvertes (Grégoire tranche — ne pas re-dériver par sonde)

1. **Pondération A25 des critères** — l'app affiche aujourd'hui `S20 · R20 · P15 · N25 · Fr20`
   (valeurs H26) ; le handoff (§0) note `S15 · R20 · P10 · N25 · Fr30` pour A25. **Input critique**
   pour la recréation (§8.4), puisqu'on bascule vers un **recalcul**.
2. Anomalies : `grilleId` vide sur artefacts 2 et 9 ; `jetonsEtudiants` global (53 DA, valeurs
   vides) — jetons à **0 %** dans Omnivox.

### 8.4 Séquence d'exécution révisée (décidée le 22 juin) — « recréation propre »

Au lieu de réparer l'existant contaminé in situ, on **recrée** les objets A25 isolés, puis on
**recalcule** et on **valide**. Bascule majeure : de *notes posées* à *notes calculées par le
moteur* — plus fidèle et défendable pour l'article, mais la **pondération A25 exacte (§8.3)
devient un input critique** et le recalcul est un **test plus exigeant** que le calage (il ne
tombe sur Omnivox que si la vraie pratique A25 est correctement capturée).

1. **Recréer** productions + grilles + échelles + pratique A25 — **propres et isolées** d'H26
   (IDs distincts, libellés A25, pondérations A25 confirmées). [≈ L2 + L3]
2. **Intégrer** les productions PDF (`A25 portfolio et terminale - pdf/`, par artefact) + les
   **rétroactions** (dont erreurs/mots de l'algo français). [≈ L3 + L4]
3. **Valider** : les résultats recalculés doivent correspondre au **tableur Numbers** de Grégoire
   (partiel, sem. 10) **et** aux **résultats finaux Omnivox** (MAE < 0,5 ; cible : faire tomber
   l'écart algo résiduel). [≈ L1 + L7, par recalcul moteur]
4. **Capitaliser** : tirer les conclusions du pilote A25, alimenter l'extraction du **§5 ter**, et
   **appliquer à H24 et A24** (§7).

### 8.5 Sources & outillage (pour la session neuve)

- Codex : `…12h29/donnees.json` (80 Mo, + `.bak` ; les ~1 Go de `travaux/` ne sont pas requis pour
  le recalcul). Artefacts : `A25 portfolio et terminale - pdf/` (par artefact 1-9 + 10 terminal ;
  **ne pas confondre** avec `…/travaux/` = tous trimestres mélangés).
- Golden : `601-101-MQ A2025 groupe 00001.xls` (HTML Omnivox, 30 élèves) ;
  `resultats-conformes-A25.csv` ; `…analyse terminale.txt` (notes de l'analyse finale).
- Break-test moteur : charger le vrai moteur via le helper Vitest `chargerScript()` +
  `simulerIndices(da, pratiqueId, donnees)` (injection de corpus, lecture seule, depuis le 17 juin).
- ⚠️ Le `SKILL_Ecosysteme_classe` décrit une **autre** instanciation (65/35, deux terminaux) —
  **pas** la référence A25 (60/40, une terminale).

### 8.6 L0 exécuté — break-test moteur confirmé (23 juin 2026, Claude Code)

**Livré** : `scripts/valider-golden-master-trimestre.mjs` — golden master générique
(paramétré par chemins/trimestre), réutilisable L1–L7 + A24/H24. Charge le vrai moteur
`calculerDetailsNoteFinale` hors navigateur (helper Vitest `chargerScript`). **Oracle =
Omnivox** (plan §2) ; la reconstruction « conforme » sert de **diagnostic** non bloquant.

**Résultat A25 — ✅ VERT.** Le recalcul moteur **sur le codex** reproduit Omnivox à
**MAE 0,148** (30/30 élèves, max 0,32 ; tout sous 0,5). Confirme et **améliore** l'acquis §8.1
(0,148 < 0,203 ; le §8.1 comparait à la reconstruction, pas au moteur). L'outlier
annoncé à 1,4 tombe à **0,27** côté Omnivox. Rougissement prouvé (`--prouver-rougit` :
+15 sur un artefact → MAE 2,0 → ROUGE).

**Diagnostic — 2 « Note finale conforme » du CSV à REGÉNÉRER** (le codex fait foi, il colle à
Omnivox) : **élève A** 69,4 → moteur 71,1 (Omnivox 70,8) ; **élève B** 77,9 → moteur 77,6
(Omnivox 77,6). À regénérer par Grégoire + Claude Code (le `resultats-conformes-A25.csv`, pas le codex).

**Portée** : L0 agrège les `noteFinale` d'artefact **stockées** (notes posées) → valide
l'agrégation, pas encore le recalcul depuis les grilles (= L2/L3, « recréation propre » §8.4).
Variante d'outillage vs §8.5 : `calculerDetailsNoteFinale` chargé directement (ciblé note
finale STD), même moteur que `simulerIndices`.

### 8.7 L2 audit + sentinelle d'isolation (23 juin 2026, Claude Code)

**Audit (affine le §8.2)** : sur les 3 grilles utilisées par A25, **une seule est
réellement partagée** avec H26 — `GRILLE1759529438501` « Global-5 (FR-ALGO) H26 »
(A25 : 66 évals + H26 : 89 évals ; présente dans la liste active `grillesTemplates`).
Les 2 autres (`GRILLE1759243306842` 121 évals, `GRILLE1759264206489` 118 évals) sont à
usage A25 **exclusif** et hors liste → de fait isolées. A25 n'a aucune copie archivée
(`a2025_grillesTemplates` absent) ; `grillesTemplates`/`echellesTemplates` sont globales
(`CLES_GLOBALES`).

**Livré** : `scripts/sentinelle-isolation-grilles-trimestre.mjs` — verrouille l'invariant
« aucune grille d'un trimestre partagée à l'usage avec un autre ». **Structurel** (pas par
recalcul : la note d'artefact est calculée à la saisie/DOM puis stockée ; le recalcul =
réouverture ; la grille partagée FR-ALGO porte des notes posées). **❌ ROUGE aujourd'hui**
(1 grille partagée, 66 évals A25 exposées) ; `--simuler-isolation` re-pointe A25 vers un id
distinct → **✅ VERT**. Réutilisable A24/H24.

**Cible recréation propre (Grégoire + Claude Code)** : copier `GRILLE1759529438501` vers un
id A25 distinct + re-pointer les 66 évaluations A25. Les 2 autres grilles : déjà isolées à
l'usage (recréation pour propreté/libellé A25 seulement).

> **Révision 23 juin (Grégoire)** : Cowork **n'exécute pas** le plan. Toute la recréation des
> documents (grilles, échelles, productions, re-pointage) est faite par **Grégoire + Claude
> Code**, validée par les oracles L0 (fidélité Omnivox) et L2 (isolation). Le §0 (« Cowork pour
> la reconstruction pilotée par documents ») est amendé en conséquence.

### 8.8 Sonde isolation (23 juin, Claude Code) — cartouche A25 perdue, pondération A25 tranchée

En préparant l'isolation minimale (« pas borné »), l'observation **avant transformation** a révélé :

1. **Cartouche A25 FR-ALGO PERDUE (orpheline)** : les 66 évals A25 de `GRILLE1759529438501`
   référencent `cartoucheId = CART1763652289229`, **introuvable dans toute clé `cartouches_*`**.
   La clé `cartouches_GRILLE1759529438501` ne contient plus que 2 cartouches **H26** (« R-aux-C »,
   « Kanatuut »). La cartouche A25 a été **écrasée** quand H26 a réutilisé le `grilleId` —
   contamination effective. ⇒ **l'isolation par simple copie de cartouche est impossible**
   (pas de source). Les notes restent intactes (`criteres` + `noteFinale` dans chaque éval → L0 vert).

2. **Pondération A25 TRANCHÉE par les données (§8.3 résolu)** : les `criteres` stockés dans les évals
   donnent le profil dominant **S15 · R20 · P10 · N25 · Fr30** (64/66 FR-ALGO ; 113/116 HOLIS) — le
   profil du **handoff A25**, PAS le H26 affiché (`S20·R20·P15·N25·Fr20`). Contamination visible :
   1 éval FR-ALGO porte déjà le profil H26. Grille `1759264206489` (SRPN, sans français) = profil
   distinct **S20 · R30 · P15 · N35**.

3. **Recréation révisée** : *reconstruire* les cartouches A25 depuis les `criteres` (définition
   désormais connue) + ids distincts + re-pointer les évals. Déterministe, mais touche les données
   réelles → à exécuter à froid, sur copie, avec backup, validé par L0 (reste vert) + L2 (verdit).
