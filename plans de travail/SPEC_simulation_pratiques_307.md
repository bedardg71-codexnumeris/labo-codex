# SPEC #307 — Simuler et comparer des pratiques de notation (profil étudiant)

> ⚠️ **ORIENTATION DÉPASSÉE — 5 juin 2026.** La forme « panneau dans le profil individuel » décrite ici (en particulier §2 et §4) est **close**. Une session de conception du 5 juin a fait émerger un chantier plus vaste : une **vue dédiée « Comparateur de pratiques »** (échantillon de profils-types du groupe démo, disposition réversible, aide au choix d'une pratique). Le **moteur** construit pour #307 reste valide et sert de base ; seule l'orientation UI change. La réflexion conceptuelle du chantier successeur est menée avec Cowork : voir `plans de travail/NOTE-COWORK-comparateur-pratiques.md`. **Ne pas reprendre l'implémentation du panneau de profil décrite ci-dessous.**

**Date** : 4 juin 2026
**Auteur** : Claude (Cowork) en discussion avec Grégoire
**Destinataire** : Claude Code
**Statut** : ✅ Décisions de design actées par Grégoire (§2). **Mise à jour 5 juin 2026** : verrou technique *en partie* levé (signature paramétrable posée au Lot 2) ; reste à câbler le paramètre jusqu'au calcul de config — c'est le premier travail de #307 (voir l'encadré du §3.1).
**Références** : `BACKLOG.md` #307 et #303 ; `Refactorisations/PLAN_architecture_pratiques_SSOT.md` (§5 et §7 corrigé le 4 juin) ; rapports testeurs #126-128 (31 mai)

---

## 1. Vision et origine

Comportement émergent observé le 31 mai (tests pratiques) : en changeant la pratique active du groupe-cours, le panneau « Note finale de session » du profil recalcule sur les **mêmes artefacts** — même étudiant·e, trois pratiques, trois notes (73,8 % / 75,8 % / 73,1 %). #307 transforme ce comportement en **outil délibéré** : simuler une ou deux pratiques supplémentaires dans le profil, côte à côte avec la pratique active, **sans jamais changer la pratique réellement assignée** au groupe-cours.

Valeur pédagogique : choisir une pratique en connaissance de cause, documenter l'effet d'une pratique sur les notes (recherche), expliquer une pratique aux collègues avec des données réelles.

## 2. Décisions de design actées (4 juin 2026)

| Question | Décision |
|---|---|
| Périmètre d'affichage | **Note finale + décomposition** (artefacts retenus, obligatoires, pondérations, seuils — selon la famille). Pas de graphique d'évolution en phase 1. |
| Emplacement | **Profil individuel d'abord** (panneau « Note finale de session »). La vue groupe (distribution par pratique) = phase ultérieure, hors-périmètre ici. |
| Pratiques candidates | **Bibliothèque du groupe-cours, 2 simulées max** (+ la pratique active = 3 colonnes max). |
| Persistance | **Éphémère + exportable** : rien n'est écrit dans les données du trimestre ; un export CSV horodaté permet la trace de recherche. |

## 3. Dépendances — ce que les Sessions B et C de #303 doivent garantir

Ordre impératif : **Session B (représentations) → Session C (calcul) → #307**. Réf. : `PLAN_architecture_pratiques_SSOT.md` §7 (corrigé 4 juin).

### 3.1 Contrat exigé de la Session C (CONDITION DE FAISABILITÉ de #307)

> **⚠️ MISE À JOUR 5 juin 2026 — verrou EN PARTIE levé (état vérifié dans le code).** Les Lots 0-2 de la Session C sont sur `origin/main` (PR #25), mais le câblage n'est pas complet :
> - **Lot 2** a posé la *signature* `calculerDetailsNoteFinale(da, pratiqueIdDemande = null)` (`js/profil-etudiant-actions.js:401`). **Mais** `pratiqueIdDemande` ne pilote pour l'instant que la résolution du **nom** de la pratique (l. 415-418) ; le **calcul de la note** appelle toujours `_obtenirConfigPortfolioCalcul(modalites)` (l. 423) → `obtenirConfigPratiqueActive()` (l. 200), c.-à-d. la pratique **active**. Passer une autre pratique donne donc son nom mais la note de l'active.
> - **Premier travail de #307** : propager `pratiqueId` jusqu'à la config — `_obtenirConfigPortfolioCalcul(modalites, pratiqueId)` → `obtenirConfigPratiqueActive(pratiqueId)` (résout la config de la pratique demandée, défaut = active). Verrouiller par un test : simuler une pratique ≠ active produit une note distincte sur les mêmes artefacts.
> - **Lot 1** a posé le *seam* `_modalites()` (lit `this.config.modalites` en priorité) dans les instances.
> - **Nuance sur le diagnostic du 4 juin** : la lecture de `modalitesEvaluation` dans `pratique-configurable.js` était du **code mort** (lue puis jamais utilisée — le `switch` branchait déjà sur `this.config`), retirée au Lot 1. La cause réelle du comportement émergent est le **chemin procédural** (`calculerDetailsNoteFinale` → `obtenirConfigPratiqueActive` → pratique active, sans paramètre).
> - **Restent en Session C** (non bloquants pour #307) : Lot 3 (retrait du jeton `SOM|PAN`) et Lot 4 (fold `pan-objectifs ⊂ standards`), prêts sur branches. **Lot 5 = la brique `simulerIndices` = le cœur de #307**, pas encore écrit.
>
> Le texte original ci-dessous est conservé comme trace de l'intention initiale.

**Constat vérifié le 4 juin** : les instances de pratique lisent le **SSOT global** `modalitesEvaluation` à l'intérieur du calcul, au lieu de leur propre config :

- `js/pratiques/pratique-pan-standards.js:69` et `:696` : `db.getSync(cle('modalitesEvaluation'), …)` dans `calculerPerformance`
- `js/pratiques/pratique-configurable.js:199` : idem, **alors que l'instance possède `this.config`** (constructeur l. 24-27)

C'est ce couplage qui a produit le comportement émergent — et c'est lui qui rend la simulation impossible en l'état : instancier une pratique non active et appeler son `calculerPerformance(da)` recalculerait quand même selon la pratique **active**.

La Session C doit donc garantir, en plus du routage par famille déjà spécifié (BACKLOG #303) :

1. **Le calcul lit `this.config`, jamais le SSOT global.** `calculerPerformance(da)` et toute la chaîne de décomposition ne lisent que : (a) la config de l'instance, (b) les données du trimestre (évaluations, productions, jetons — via `obtenirDonneesSelonMode`). La pratique active ne sert qu'à choisir l'instance **par défaut**.
2. **Aucune écriture** dans le calcul (pureté vis-à-vis du stockage).
3. **La note finale du profil** (`calculerDetailsNoteFinale(da)`, `js/profil-etudiant-actions.js:395`) est routée par famille via l'instance — plus de présomption portfolio (`_obtenirConfigPortfolioCalcul`) — et **paramétrable** : signature cible `calculerDetailsNoteFinale(da, pratiqueId = null)` (défaut = pratique active). Le retour inclut la décomposition (la structure existe déjà pour le chemin portfolio, l. 484-533) et le diagnostic d'erreur par pratique (`_diagnostiquerNoteNonCalculable` adapté pour être paramétrable lui aussi).
4. **Invariant de non-régression** (déjà au plan SSOT §6) : pour la pratique active, notes et indices identiques avant/après — tests chiffrés.

> Si la Session C est exécutée sans ces garanties, #307 est bloqué. Les inscrire dans la
> définition de fait de la Session C.

### 3.2 Apport attendu de la Session B

Badges et libellés des colonnes de comparaison lus du registre (`obtenirCode`/`obtenirCouleur`/`obtenirLabelFamille`) — pas de nouvelle table locale dans le module de simulation.

## 4. UI — panneau « Note finale de session » du profil

### 4.1 Déclencheur

Bouton secondaire « Comparer des pratiques » dans l'en-tête du panneau. Visible seulement si la bibliothèque du groupe-cours contient **au moins une** pratique autre que l'active. Au clic : zone de sélection inline (pas de modale — anti-pattern du projet) avec 1 à 2 sélecteurs de pratique + bouton « Simuler ».

### 4.2 Vue comparative

- **Colonnes** (2 ou 3) : la pratique active d'abord, marquée « Pratique active » ; les simulées marquées visuellement **« Simulation »** (accent orange, bordure pointillée — consulter `design-system.html`, variables existantes, pas de nouvelle couleur).
- **Chaque colonne** : nom de la pratique (⚠️ `echapperHtml()` — noms saisis par l'utilisateur), badge famille (registre), **note finale**, **décomposition** selon la famille :
  - PAN – Standards : artefacts retenus / obligatoires, moyennes, pondération portfolio/terminal, plafonnement de conformité s'il s'applique ;
  - Sommative : productions × pondérations, moyenne pondérée ;
  - PAN – Spécifications : seuils atteints/manqués.
- **Pratique non calculable** : afficher le diagnostic par-pratique dans sa colonne (réutiliser le mécanisme #128), pas d'échec global.
- **Écart** : afficher le delta en points de % entre chaque simulation et la pratique active.
- Fermeture de la comparaison = retour au panneau normal. Aucun état persisté entre deux ouvertures du profil (éphémère).

### 4.3 Accessibilité et responsive

Tableau comparatif avec en-têtes de colonnes réels (`<th scope="col">`) ; navigation clavier ; cibles ≥44 px ; iPad (768-1024 px) : 3 colonnes doivent tenir — sinon défilement horizontal du seul tableau, jamais de la page. Deux modes (sombre/clair).

## 5. Export CSV

- Bouton « Exporter la comparaison (CSV) » dans la vue comparative.
- Contenu : horodatage, groupe-cours, étudiant·e, puis par pratique : nom, famille, note finale, n artefacts retenus, détail par artefact (production, note, retenu/obligatoire/exclu).
- **Anonymisation** : si le mode anonymisation est actif, le nom et le DA exportés sont les versions anonymisées — même règle que les exports existants.
- **Sécurité** : charger `SKILL_Securite_donnees.md` (section 9) avant d'implémenter ; passer par les conventions d'export existantes (cf. Défense D — whitelist des exports — et le précédent `bilan-reflexif-csv.js`). Aucune donnée hors du périmètre affiché.

## 6. Invariant central : non-destructif

- Aucune écriture dans `modalitesEvaluation`, `groupesCours`, évaluations, snapshots ou quelque clé namespacée que ce soit. Le seul artefact produit est le fichier CSV téléchargé.
- La pratique active du groupe-cours est **strictement inchangée** après toute simulation (test : snapshot des clés concernées avant/après une session de simulation — égalité stricte).
- Le dépistage (N) et les indices A-C-P affichés ailleurs ne bougent pas pendant une simulation.

## 7. Hors-périmètre (phase ultérieure, décisions déjà orientées)

- **Vue groupe** : distribution des notes du groupe sous 2 pratiques (aide au choix de pratique de trimestre). À spécifier après la phase 1.
- Graphique d'évolution comparée au fil des productions.
- Sauvegarde de comparaisons dans l'app (l'export CSV couvre le besoin de trace).
- Simulation de pratiques **hors** bibliothèque du groupe-cours.

## 8. Tests

1. **Invariant non-destructif** (§6) — test automatisé si possible (Vitest sur les fonctions de calcul paramétrées ; le snapshot avant/après peut être un test Playwright).
2. Trois familles calculables côte à côte sur les données démo (groupe 9999) ; valeurs plausibles et stables.
3. Pratique non calculable → diagnostic dans la colonne, les autres colonnes calculent.
4. Export CSV : contenu conforme, anonymisation respectée, passage par la validation d'export.
5. `cd tests && npm test` — et au moins 1 test ajouté (le calcul touche `indices.js`/modules sensibles via Session C ; l'exigence CLAUDE.md s'applique).
6. Mac + iPad, modes sombre et clair.

## 9. Séquencement et précautions

1. Sessions B puis C (#303) — **sur backup**, fenêtre calme ; C touche le cœur du calcul (`indices.js`), risque le plus élevé du chantier ; réévaluer le nœud 4a en début de B (note du §7 du plan SSOT).
2. Puis #307 phase 1 (la présente spec).
3. Avant de coder : rituel de début de session ; charger `SKILL_labo_codex.md` (indices A-C-P, pratiques) et `SKILL_Securite_donnees.md` (pour l'export) ; corriger au besoin l'inventaire de ce document contre le code réel (les numéros de lignes datent du 4 juin 2026).

---

**Fin de la spec**

*Compagnon de `Refactorisations/PLAN_architecture_pratiques_SSOT.md` (Sessions B-C) et successeur opérationnel de l'entrée BACKLOG #307. La vue groupe fera l'objet d'une spec distincte après livraison de la phase 1.*
