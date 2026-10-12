# ÉTAT DU PROJET — Labo Codex

> **Nature** : document de référence interne. Il dit **où en est le projet** par rapport à ses
> objectifs de **stabilité, pérennité et qualité du code**, et par rapport aux **plans** issus
> de l'audit annuel. Il se consulte pour se situer sans avoir à refouiller les documents source.
>
> **Ce qu'il n'est PAS** : un backlog. La liste des tâches à faire vit dans `BACKLOG.md` ;
> le contexte de la session courante dans `SESSION.md` ; la version publique de l'audit dans
> `AUDIT.md`. Ce document agrège et **situe** — il pointe vers ces sources, il ne les duplique pas.
>
> **Entretien** : à relire/mettre à jour en fin de chantier significatif et au moins à chaque
> bascule de session importante. Le §11 (journal) trace les révisions. Chaque ligne d'état porte
> idéalement sa source et sa date de vérification, pour éviter de propager un état périmé.
>
> **Dernière mise à jour** : 12 octobre 2026 (Claude Code), bêta publique **1.199.0** en ligne. Le §00 a
> été mesuré le 11 au soir sur **1.198.0** / build `1011-1014` ; le chantier « contenir » y est renvoyé à son plan.
> **Nouveau §00 : la grille des 25 sous-audits de mai remesurée au code, barème strict**, et le
> **tableau de bord de la complexité** qui sert de ligne de départ à l'objectif fixé par Grégoire
> le 11 octobre (contrôler la complexité). Le §00 est la seule section revue ce jour-là : tout le
> reste garde sa date et sa réserve ci-dessous.
>
> *Mise à jour précédente* : 9 août 2026, PM (Claude Code) — bêta publique **1.65.2** / build `0809-1101`.
> Repère au **§0** (8 août) ; audit du répertoire `plans de travail/` au **§4bis** (8 août) ;
> **vérification au code des 43 plans non tranchés au §4ter (9 août matin)** ;
> **audit de `Plan Accompagnement/`, le dernier angle mort, au §4quater (9 août PM)**.
> *(L'en-tête était resté à 1.64.0 / `0809-0906` alors que `main` portait 1.65.1 : les deux
> sessions parallèles du 9 août ont fusionné sans repasser ici. Corrigé.)*
> Les sections **1 à 11** datent du 28 juin et n'ont **pas** été revues, à deux exceptions
> corrigées le 9 août : la ligne #328 du **§2** et le premier point du **§5.3** (voir §4ter).
> Les lire avec cette réserve pour tout le reste.
> *(Repère précédent : 28 juin 2026 (Cowork) — 1.26.0 / build `0628-2126`, `origin/main` `72478557`,
> PR #74 et #72 mergées. Dépôt **privatisé le 23 juin 2026**.)*

---

## Légende des statuts

| Symbole | Sens |
|---|---|
| **Fait** | Livré et présent sur `main` (vérifié) |
| **En cours** | Chantier actif, partiellement livré |
| **À faire** | Identifié, non démarré |
| **Optionnel** | Utile mais non requis ; n'engage pas la stabilité |
| **Long terme** | Reporté explicitement (Q3 2026+ ou audit dédié requis) |

---

## 00. Grille d'audit remesurée (11 octobre 2026)

> **Demande de Grégoire (11 oct.)** : pilotage interne, **barème strict**. Son objectif à ce
> moment-ci du développement : **contrôler la complexité de l'application** et laisser le code
> dans le meilleur état possible. Simplifier, assainir, rendre plus robuste : ce sont les chantiers
> candidats des prochains mois (§00.6), **non lancés**. La question d'une relève humaine
> (documentation à jour) est traitée dans une autre session : l'axe 4 ci-dessous la mesure, sans
> plus.
>
> **Code mesuré** : `304c3b58` (= `origin/main`, 1.198.0). Le lot 8 (branche `lot8-cadre`, absente
> d'`origin` le 11 oct.) **n'est pas vu**.
> **1.199.0 (lots 8 à 19) est sortie après cette mesure** (11 oct., 22 h 11) : elle n'est pas remesurée.
> *(Corrigé le 12 oct. : ce §00 était daté du 12, en heure UTC ; à Toronto, la mesure date du 11 au soir.)*
>
> **Méthode** : les 25 sous-audits d'`AUDIT.md`, avec les outils et réglages de mai (§00.5),
> **étalonnés** : rejoués sur le commit audité en mai (`9cd3e0e`), ils redonnent exactement les
> chiffres publiés (136 432 LOC, cyc max 118, 1,44 % de duplication, 10 443 alertes de lint ;
> 677 symboles inutilisés, 6 cycles, 47 sites `modalitesEvaluation`). Les écarts ci-dessous
> viennent donc du code, pas des outils.
>
> **Barème** : celui du protocole (`audit annuel/audit/`), appliqué à la lettre. Ce n'est pas une
> re-certification : l'audit formel reste prévu en mai 2027 (ADR-012). `AUDIT.md`, public, n'est
> pas touché.

### 00.1 Distribution

| Date | 🟢 | 🟡 | 🔴 | Non mesuré / partiel |
|---|:-:|:-:|:-:|:-:|
| 14 mai 2026 (audit) | 5 | 10 | 8 | 2 |
| 25 mai 2026 (tableau détaillé d'`AUDIT.md`) | 13 | 9 | 1 | 2 |
| **11 oct. 2026 (barème strict)** | **5** | **12** | **6** | **2** |

⚠ Le résumé d'`AUDIT.md` annonce « ~14 / 6 / 3 / 2 » pour le 25 mai ; ses propres lignes donnent
13 / 9 / 1 / 2. C'est le tableau détaillé qui sert de référence ici.

**La baisse a trois causes, à ne pas confondre :**

1. **Régressions réelles.** CodeQL retiré le 28 juin (`fa94f5ee`, dépôt privé sans Advanced
   Security) ; protection de branche inactive ; 6 PR Dependabot ouvertes depuis mai-août. Fonctions
   à cyc > 30 : 80 le 25 mai, **91** aujourd'hui. Deux modules ont presque doublé
   (`planification-carte.js`, `grilles.js`).
2. **Barème réappliqué.** 2.1 (rouge dès qu'un fichier dépasse 1 000 LOC) et 2.2 (rouge dès qu'une
   fonction dépasse cyc 15) n'ont jamais été jaunes au sens du protocole ; le 25 mai les jugeait sur
   une liste de 14 fonctions.
3. **Croissance.** 129 → 209 fichiers JS, lignes physiques 194 732 → 237 396 (+22 %). Sur les 37
   cycles, 19 sont internes à une famille découpée en mai (`evaluation-*`, `trimestre-v2-*`,
   `reserve-*`) : des appels internes devenus des liens entre fichiers (inféré).

**Progrès réels depuis mai** : #328 (`modalitesEvaluation` : 14 écrivains → 1, sentinelles L0-L3) ;
duplication 1,44 % → 1,12 % ; écart T3 et tables IDME en dur corrigés (#823, #529, #575) ; décision
SPDX (ADR-013) ; doc opérationnelle obsolète retirée (`22dcbfb`) ; `DEPLOY.md` v1.10 couvre le régime
Access du 1er sept.

### 00.2 Les 25 sous-audits

M = mesuré (commande au §00.5), I = inféré.

| SA | 14 mai | 25 mai | 11 oct. | Constat |
|---|:-:|:-:|:-:|---|
| 1.1 Traçabilité | 🟡 | 🟢 | 🟡 | Une seule définition par fonction de la chaîne (`calculerIPB`, `diagnostiquerSuiviApprentissage`, `determinerNiveauRaiPedagogique`, `calculerAssiduite`) (M). Mais `docs/modules/depistage-et-suivi.md` renvoie à `profil-etudiant.js`, disparu, et les seuils du pattern individuel ont une deuxième source dans `pratique-pan-standards.js:983` (M) |
| 1.2 Calculs | 🟢 | 🟢 | 🟢 | 14 fichiers Vitest des bancs de septembre, 307/307 verts (M). Trou : 5 des 8 libellés du diagnostic n'ont pas d'essai de comportement (Difficulté résolue, Progression, Plateau, Difficulté constante, Progression lente) (M). Les 156 cas de mai (snippets console) ne sont pas dans le dépôt et ne se rejouent pas |
| 1.3 Lexique | 🟡 | 🟢 | 🟡 | L'interface est nettoyée (M). L'Aide décrit encore l'indice R retiré : `index.html` « RISQUE D'ÉCHEC (1-A×C×P) », « Échec probable », « prédictions de risque », R=(2A+C+P)/4 (M) |
| 2.1 LOC | 🔴 | 🟡 | 🔴 | 36 fichiers > 1 000 LOC sur 209 (mai : 35 sur 130) (M) |
| 2.2 Complexité | 🔴 | 🟡 | 🔴 | cyc > 15 : 387 → 465 ; cyc > 30 : 97 → 91 (80 le 25 mai) ; max 118 → 130 (M) |
| 2.3 Duplication | 🟡 | 🟡 | 🟡 | 1,44 % → 1,12 % ; à couverture totale 2,57 % → 1,74 % (M) |
| 2.4 Code mort | 🟢 | 🟢 | 🟢 | 0 fichier orphelin ; 3 non cités dans `index.html`, tous chargés à la demande ou documentaires (M) |
| 2.5 Lint / SAST | 🔴 | 🟢 | 🔴 | Le vert reposait sur CodeQL, retiré le 28 juin. Aucune config ESLint projet, aucun ESLint en CI ; le seul garde statique est le cliquet `innerHTML` de `lint-securite.test.js` (Vitest, à chaque push). RegExp non littérales 14 → 29 ; `no-eval` 1 → 0 (M) |
| 3.1 SSOT | 🔴 | 🟡 | 🟡 | `modalitesEvaluation` : 1 écrivain (M). 14 clés sur 32 encore à ≥ 2 écrivains ; accès `localStorage` hors `db.js` : 23 fichiers / 95 lignes → 17 / 69 (M) |
| 3.2 Modularité | 🔴 | 🟡 | 🔴 | Modules > 20 symboles publics 26 → 31 ; maximum `grilles.js` (140) ; symboles inutilisés 677 → 810 ; `<script src>` dans `index.html` : 126 → 213 (M) |
| 3.3 Isolation | 🔴 | 🔴 | 🔴 | Cycles 6 → 37 ; `reserve.js` 2 034 lignes, **pas** découpé en 3 couches ; fan-in max 59 (`modes.js`), fan-out max 24 (`codex.js`) (M) |
| 4.1 Documentation | 🟡 | 🟢 | 🟡 | Liens relatifs du README vivants ; chiffres périmés (« 97/97 tests », « 12 ADRs ») ; liens GitHub inaccessibles au public depuis la privatisation (M) |
| 4.2 Bus factor | 🟡 | 🟡 | 🟡 | Un seul humain depuis le 14 mai ; aucun co-mainteneur (M) |
| 4.3 Onboarding | 🟢 | 🟢 | 🟢 | Pas retesté ; test annuel dû en mai 2027 (I) |
| 4.4 Déploiement | 🔴 | 🟢 | 🟢 | `DEPLOY.md` v1.10 à jour ; trois passages périmés (§2.4, §8.2, 2FA « [À COMPLÉTER] ») (M) |
| 4.5 Licences | 🟡 | 🟡 | 🟡 | `libs/VERSIONS.md` sans `libheif-bundle.js` (ajouté le 30 août) ; `LICENSE.md` titre « CC BY-SA » puis écrit NC-SA (M) |
| 4.6 Scorecard | 🟡 | 🟢 | 🔴 | CodeQL retiré ; protection de branche inactive ; Dependabot non traité ; Playwright CI à la demande depuis le 10 oct. (`fd1338a1`, #1048) (M) |
| 5.1 OWASP | 🟡 | 🟡 | 🟡 | 0 `eval` ; `console.log` 21 → 36 ; `netlify.toml` ne pose **aucun** en-tête de sécurité HTTP (cache seulement), donc pas de `frame-ancestors` (M). pdf.js 3.11.174 (CVE-2024-4367) probablement neutralisé par la CSP sans `unsafe-eval` (I) |
| 5.2 Veracode | 🟢 | 🟢 | 🟢 | Pas de backend ; contexte inchangé (I) |
| 5.3 Inventaire | 🟡 | 🟢 | 🟡 | Des renseignements personnels restent dans l'historique git ; la purge #781 est préparée, non exécutée (M) |
| 5.4 Loi 25 | 🟡 | 🟡 | 🟡 | Avis PRP non reçu ; ÉFVP non faite ; `PRIVACY.md` écrit « dépôt public » (faux depuis le 23 juin) ; `INFO-ELEVES.md` renvoie vers un dépôt privé (M) |
| 5.5 Lighthouse BP | 🟢 | 🟢 | non mesuré | Aucune mesure depuis mai |
| 6.1 axe / Lighthouse | 🔴 | 🟢 | 🟡 | axe-core : 1 règle violée (contraste, 5 nœuds, `.accueil-section-label`, `.accueil-pied-*`) ; Lighthouse a11y 97 (M, accueil seulement) |
| 6.2 Clavier / VoiceOver | ⏳ | ⏳ | non mesuré | Section C toujours « reportée » depuis le 23 mai (M) |
| 6.3 iPad réel | ⏳ | ⏳ | 🟡 | Usage réel quotidien et portes terrain sur iPad (M) ; le protocole d'accessibilité (section D) n'a jamais été passé |

### 00.3 Tableau de bord de la complexité (ligne de départ)

Ce sont les chiffres que l'objectif du 11 octobre doit faire baisser, ou au moins empêcher de
monter. Toute session qui les remesure écrit la date, le commit et la commande (§00.5).

| Indicateur | 14 mai | 11 oct. |
|---|--:|--:|
| Lignes de code JS (`cloc`, colonne *code*, `js/`) | 136 432 | 151 094 |
| Fichiers JS | 130 | 209 |
| Fichiers > 1 000 lignes de code | 35 | 36 |
| Fonctions cyc > 15 | 387 | 465 |
| Fonctions cyc > 30 | 97 | 91 |
| cyc maximale | 118 | 130 |
| Duplication jscpd, réglages de mai / couverture totale | 1,44 % / 2,57 % | 1,12 % / 1,74 % |
| Cycles directs entre modules | 6 | 37 |
| Modules > 20 symboles publics | 26 | 31 |
| Symboles publics inutilisés | 677 (41 %) | 810 (36 %) |
| Fichiers qui touchent `localStorage` hors `db.js` | 23 | 17 |
| Clés à ≥ 2 écrivains (sur 32) | 15 | 14 |

⚠ **Défaut connu du script de mai** (`analyse-fan-in-out.py`) : son `DEFINE_RE` compte
`typeof window.X === 'function'` comme une définition. Corrigé (`=(?!=)`), mai → oct. donne : globaux
multi-définis 39 → 28 (bruts : 85 → 162), cycles 8 → 40, modules > 20 symboles 26 → 30. Le verdict
ne change pas ; les chiffres bruts restent ceux du tableau pour rester comparables à mai.

**Les dix fonctions les plus complexes** : `executerImportSelectif` 130 (`import-export.js`),
`calculerCorrelationsLongitudinales` 101, `creerPratiqueV2` 86, `creerGraphiqueTrajectoiresProduction`
84, `chargerCodex` 83, `emprunter` 83, `auDbReady` 70, `genererSectionProductions` 66,
`remplirFormulairePratique` 64, `genererSectionMobilisationEngagement` 64.

### 00.4 Où la complexité se concentre

| Module | Constat (M) |
|---|---|
| `planification-carte.js` | Premier module de code : 4 536 → 8 267 LOC (12 640 lignes physiques) ; 7 fonctions cyc > 30 (`gererKeydown` 60, `ouvrirPanneau` 59) ; 231 lignes dupliquées à l'intérieur du fichier |
| `grilles.js` | 2 363 → 3 696 LOC (6 343 physiques) ; 140 symboles publics, le plus large du dépôt |
| `import-export.js` | `executerImportSelectif` 118 → 130, première fonction du dépôt |
| `reserve.js` + famille `reserve-*` | `reserve.js` 2 034 lignes, FSAPI, métier et dialogue toujours mêlés ; `emprunter` 83, `verifierArchive` 59, `faireRevenir` 51 ; deux premières paires de duplication du dépôt (`reserve-copies` ↔ `reserve-renvoyer` 119 lignes, `reserve-emprunter` ↔ `reserve-revenir` 84) ; 7 cycles passent par `reserve.js`. Le découpage en 3 couches n'a **aucun** item au BACKLOG |
| `codex.js` | 1 935 → 2 980 LOC ; `chargerCodex` 22 → 83 ; fan-out maximal (24) |
| `main.js` | `auDbReady` 70 |
| `modes.js` | Fan-in 59 : le module dont dépendent le plus d'autres |
| `profil-etudiant-sections-affichage.js` | 3 074 LOC ; `genererSectionMobilisationEngagement` 43 → 64, alors que le §5.1 l'actait comme héritage « sous N=50 » |
| `evaluation-sauvegarde.js` ↔ `evaluation.js` | 104 lignes dupliquées : l'ancien code est resté à côté du nouveau, ce que la règle zéro-dette exclut |

### 00.5 Rejouer la mesure

Les outils s'installent hors du dépôt (`npx` dans un répertoire de travail). Versions du 11 oct. :
cloc 1.96, ESLint 8.57 + `eslint-plugin-security` 3.0.1, jscpd 4.1.1, axe-core 4.11.4,
Lighthouse 13.3.0.

- **2.1** : `npx --yes cloc --by-file --json js/` (colonne *code*).
- **2.2 et 2.5** : `eslint --no-eslintrc -c "audit annuel/audit/.eslintrc.audit.json" --format json js/`.
- **2.3** : `npx --yes jscpd@4 --min-tokens 50 --min-lines 5 --threshold 3 --max-lines 30000 --ignore
  "**/*.min.js,**/vendor/**,**/node_modules/**,**/_archives/**,js/pack-demo-20.js" js/` (commande de
  mai, `02-3-duplication.md`). Ajouter `--max-size 5mb` pour la couverture totale : par défaut, jscpd
  ignore les fichiers de plus de 100 Ko (27 écartés en octobre, 24 en mai).
- **3.x** : scripts `audit/reports/03-architecture/{ecrivains-par-cle,analyse-isolation,analyse-fan-in-out}.py`
  de la branche `audit/2026-mai` (`git show origin/audit/2026-mai:<chemin>`), constantes `ROOT` et
  `REPORTS` à adapter, `python3 -I`. Recoupement possible avec `scripts/audit-ssot.py`.
- **6.1** : axe-core injecté par Playwright (Chromium) sur `index.html` servi en local, page
  d'accueil seulement.

### 00.6 Dispositions des constats

Règle de `CLAUDE.md` : un audit n'est terminé que lorsque chaque constat porte une disposition. Les
constats de dette structurelle n'ont aucun symptôme vécu : ils **n'entrent pas au BACKLOG** (règle du
24 août) et sont versés aux **candidats du chantier complexité**, à arbitrer par Grégoire.

| Constat | Disposition |
|---|---|
| Renseignements personnels dans l'historique git (5.3) | **Inscrit : #781**, préparé, attend le signal de Grégoire |
| `PRIVACY.md` « dépôt public », `INFO-ELEVES.md`, `SECURITY.md`, liens GitHub du README (4.1, 4.6, 5.4) | **Remonte à Grégoire** : textes publics, catégorie 4 de `CLAUDE.md`. Non inscrit en attendant sa décision |
| L'Aide décrit l'indice R retiré (1.3) | **Remonte à Grégoire** : prose lue par les utilisateurs |
| Contradictions d'`AUDIT.md` (résumé ≠ tableau ; « dépôt volontairement public ») | **Remonte à Grégoire** : document public, à revoir au plus tard à l'audit de mai 2027 |
| `libs/VERSIONS.md` sans libheif ; titre de `LICENSE.md` ; renvois périmés de `depistage-et-suivi.md` ; table « Violations connues » de `docs/DATA-OWNERSHIP.md` qui donne encore #328 ouvert | **Session documentation** (en cours en parallèle, 11 oct.) |
| Playwright CI à la demande | **Refusé** : décision du 10 oct. (`fd1338a1`, #1048) ; le verdict local fait foi (`PROTOCOLE.md`, règle 7) |
| 6.2 VoiceOver, 6.3 protocole iPad (section D) | **Refusé** : reportés par décision de Grégoire le 23 mai ; restent « non mesurés » |
| Points chauds du §00.4 ; complexité (2.1, 2.2) ; cycles et `reserve.js` (3.3) ; doublon `evaluation-sauvegarde` ↔ `evaluation` ; seuils du pattern en double (1.1) | **Candidat « simplifier »** |
| Aucun SAST depuis CodeQL ; pas d'ESLint projet ; en-têtes de sécurité absents de `netlify.toml` ; pdf.js 3.11.174 ; 6 PR Dependabot ; `console.log` 21 → 36 ; 29 RegExp non littérales (`cartouches.js:869/2174` à trier) ; 5 libellés du diagnostic sans essai ; 5 nœuds de contraste ; lien d'aide `details-calculs-risque-…` sans cible (`profil-etudiant-sections-affichage.js:2700`) | **Candidat « assainir / robustesse »** |
| Défaut `DEFINE_RE` du script de mai ; mesure non versionnée dans le dépôt | **Candidat « contenir »** (outil de mesure) |

**Les trois familles de candidats** (non lancées, ni découpées, ni chiffrées) :
- **Contenir** : empêcher la complexité de remonter pendant qu'on la réduit. Développé le 12 oct. :
  `plans de travail/PLAN-contenir-la-complexite.md` (proposé, non lancé).
- **Simplifier** : réduire les points chauds du §00.4.
- **Assainir / robustesse** : rendre au filet de sécurité ce que la privatisation lui a retiré, et
  fermer les petits écarts.

---

## 0. Repère rapide (8 août 2026)

> Ce repère REMPLACE celui du 28 juin (conservé juste en dessous comme trace).
> ⚠ Les sections **1 à 11** datent toujours du 28 juin et n'ont **pas** été
> revues : les lire avec cette réserve, sauf §4bis (8 août).

- **Version** : **1.60.0** (build `0808-1836`). `origin/main` = `858e126a`.
  Vitest **1960/1960** (227 fichiers). Arbre propre, aucun travail en avance.
- **Semaine du 6-8 août — ce qui a été livré** : le **portage des exports**
  vers la Carte d'alignement (#424, lots A→G : générateur unique 3 niveaux ×
  3 formats, rétroaction formative dans l'Inspecteur, **page « Plan de la
  leçon » supprimée**) · l'**export personnalisé** (#431, cases + ordre +
  aperçu vivant, modale) · l'**harmonisation des guides** (#432, une seule
  échelle typographique pour les deux familles) · la **corbeille de la
  palette** (#433, supprimer au doigt) · les correctifs #152, #414-#419, #429,
  et le canevas passé en Pointer Events (#148, iPad).
- **Ce qui reste dû, et qui n'est pas du code** : les **portes terrain** de
  1.57 → 1.60 chez Grégoire (dont l'iPad), jamais passées. Elles sont la
  condition de confiance de tout ce qui précède.
- **Horizon courant** : la **cohorte CoP** — Rencontre 1 « Outiller son
  regard » **mi à fin septembre**, à communiquer **4 semaines à l'avance**
  (donc date à arrêter maintenant). Référence : `docs/CALENDRIER.md` §6.
- **Décision de calendrier (8 août, précisée le 26, tranchée le 27)** : #427
  **réactiver Cloudflare Access le 1er septembre 2026**, avec une **policy
  ouverte** (`Everyone`) + OTP par courriel et une session d'un mois. **Aucune
  liste blanche** : le motif est de savoir **qui** utilise l'application, pour
  bâtir une liste de personnes joignables — pas de filtrer l'entrée. Effet
  favorable du report initial : le geste quitte la semaine de rentrée, que
  `DEPLOY.md` désigne comme le pire moment. ⚠ Les décisions du 26 août
  (liste blanche, quota « saturé », mesure d'usage abandonnée) ont été
  **renversées le 27** sur constat de trois faits erronés — voir #427 au
  backlog et ADR-008, révision du 27 août.

### ⚠ Tension à regarder en face

Le calendrier d'août (`docs/CALENDRIER.md` §6) prévoit **pilote Voûte +
outil de modération + tests cross-browser + matériel Rencontre 1**, et il
reste trois semaines. Relevé au code : la Voûte a `signature.js`,
`trust-tofu.js` et six `partage-*.js`, mais **`gestion-cles.js` et
`trust-wot.js` n'existent pas** ; l'outil de modération non plus. Par
ailleurs **#353 chiffre le budget localStorage à 173 %** (8882 Ko / 5120 Ko,
456 clés) — une cohorte qui produit des données réelles arrive sur une
saturation déjà constatée.

⮕ Ordre proposé (non tranché par Grégoire) : **1.** date de R1 + son matériel
(seuls vrais irréversibles — une date ne se rattrape pas) ; **2.** #353
(risque de données pendant la cohorte) ; **3.** le pilote Voûte se décale
s'il le faut — il sert la Rencontre 5, pas la 1.

---

## 0bis. Repère précédent (28 juin 2026)

État sain, dépôt très actif. Repères pour se situer en un coup d'œil :

- **Version** : 1.26.0 (build `0628-2126`). ~20 releases depuis le 10 juin (1.6.1).
- **Horizon courant** : **« app stable pour la CoP / expérimentateurs » à la mi-août 2026** ; pilote
  restreint de la Voûte fin août. Cadrage priorisé et autoportant : **`plans de travail/PLAN-mi-aout-2026.md`**
  (3 paliers, porteurs Claude Code vs Grégoire, décisions à trancher). Exclu de cet horizon par décision
  Grégoire : l'**article longitudinal avec Steve Bissonnette** (#35/#36).
- **Grands chantiers récents LIVRÉS** : #358 namespacing par trimestre (migration **live validée**, 1.25.0) ;
  #353 durabilité IndexedDB (**risque de perte fermé**, 1.24.2) ; #360 prévention des doublons d'évals (1.24.0) ;
  #326 comparateur de pratiques **réactivé** (1.26.0) ; #328 SSOT `modalitesEvaluation` (1.22.0, « fin de #328 »
  — *case BACKLOG à recouper*, voir §5.3) ; Voûte Phase 1 avant-pilote code-complet (1.11.0).
- **En cours (Claude Code)** : palier 1 du plan mi-août — #362 (grilles h2026 désappariées, fix `f9c824af`),
  puis #350/#346/#342.
- **Contexte humain** : Grégoire passe du Plan Max 20x au **Plan Pro** et prend **congé en juillet** →
  reprise visée **1er août**. Conséquence : privilégier la structure (rituel début-de-session + plan) plutôt
  que la mémoire personnelle ; défaut Sonnet pour le codage afin d'étirer le budget Pro.

---

## 1. Objectifs directeurs

Le cadre est posé par `CLAUDE.md` (principe **« stabilité zéro-dette »**, 21 avril 2026) et l'audit
annuel (`AUDIT.md`, ADR-012). Trois objectifs orientent toute décision de développement :

- **Stabilité** — l'application ne régresse pas. Tout fix défensif critique est verrouillé par un
  test/sentinelle ; tout refactoring préserve le comportement ; les données personnelles de Grégoire
  (trimestres réels, grilles, évaluations) survivent à chaque changement.
- **Pérennité** — le projet reste maintenable et adoptable par des tiers : licences propres,
  documentation publique de conformité, hygiène GitHub, audit annuel rejoué (ADR-012).
- **Qualité du code** — pas de dette empilée. Un nouveau système retire l'ancien (pas d'alias « au
  cas où ») ; complexité cyclomatique maîtrisée ; SSOT par donnée ; CSP stricte (`script-src 'self'`,
  zéro inline) ; sécurité non négociable (échappement HTML, validation imports).

---

## 2. Tableau de bord synthétique

| Axe | État global | Détail |
|---|---|---|
| **Grille d'audit remesurée au code (11 oct., barème strict)** | **5 🟢 / 12 🟡 / 6 🔴 / 2 non mesurés** (25 mai : 13 / 9 / 1 / 2) ; ligne de départ de l'objectif « contrôler la complexité » | §00 |
| Audit annuel 2026 — Phase 1 (corrections) | **Fait** | §3 |
| Audit annuel 2026 — Phase 2 (refactoring god modules + transverse) | **Fait** | §3, §5 |
| Lancement public (bêta 1.0.0, AQPC 3 juin) | **Fait** | §8 |
| SSOT `modalitesEvaluation` (#328, Tier 6.5 — dernière violation SSOT de l'audit) | **Fait** — recoupé au code le 9 août (sentinelles L2-b2 et L2-c) ; case BACKLOG cochée depuis le 3 juillet | §5.3, §4ter |
| Namespacing par trimestre (#358) — modèles namespacés, migration **live** | **Fait** (1.25.0, 28 juin) | §6.3 |
| Durabilité IndexedDB (#353) — risque de perte de données | **Fait** (1.24.2 ; risque de perte **fermé**) | §6.2 |
| Prévention des doublons d'évals note-égale (#360) | **Fait** (1.24.0) | §6.2 |
| Comparateur de pratiques (#326, axe D) | **Fait** — **réactivé** (1.26.0, `COMPARATEUR_VISIBLE=true`) | §8 |
| Voûte Phase 1 (#329) — partage de ressources signées | **En cours** (avant-pilote code-complet 1.11.0 ; reste revue format + terrain iPad → pilote fin août) | §8 |
| Grilles h2026 désappariées des évals (#362) | **En cours** (Claude Code, fix `f9c824af` ; séance dédiée backup + L0) | §6.2 |
| Documentation publique de conformité | **Fait** (révision Loi 25 en attente, #298) | §7 |
| Hygiène GitHub / OpenSSF | **Fait** (CodeQL + protection de branche **suspendus** depuis la privatisation du 23 juin) | §7.2 |
| Accessibilité (WCAG AA) | **En cours** | §7.4 |
| Branche `audit/2026-mai` (archivage doc) | **À faire** (divergence accrue) | §4 |
| Refactoring résiduel (Track 3 ph.2, Track H) | **Optionnel** | §5.2 |
| Plans + chantiers long terme | **Long terme** | §4, §5.3 |

---

## 3. Audit annuel 2026 — état

Audit conduit du 12 au 14 mai 2026 (`AUDIT.md`, version publique v1.1 du 25 mai ; ADR-012 : rejoué chaque année).

**Fait :**
- **Phase 1 (corrections)** close 14-15 mai : 45 corrections dans 8 fichiers, bug `evaluation.js:4193`
  confirmé et traité.
- **Phase 2 — refactoring des 5 god modules** : tous livrés et mergés sur `main` (15-21 mai). Détail métrique en §5.
- **Phase 2 — transverse** :
  - Consolidation des notifications : `js/utils-notifications.js`, ~525 appelants migrés dans 39 modules,
    ≈469 LOC nettes retirées, 3 bugs latents corrigés (#111 XSS, #112, #113). Sentinelle Vitest stricte. (21 mai)
  - Nettoyage du vocabulaire alarmiste : 8 chaînes UI reformulées, code mort prédictif retiré
    (`calculerRisqueEchec`, `obtenirClasseRisque`), tokens CSS `--risque-*` → `--niveau-attention-*`. (21 mai)
  - Cycle « Catégorie B » (dette des 5 refactors) : **10/10 critères atteints**, clos 21 mai (Tracks 1-2-3-4).

**Suite (juin) :** la dernière grande violation SSOT identifiée par l'audit — `modalitesEvaluation` (#328) —
a été traitée en juin (voir §5.3). Reste à faire issu de l'audit : §7 (accessibilité, révision Loi 25),
§5.2 (dette de refactoring optionnelle), §4 (archivage de la branche d'audit).

> **Écart documentaire à connaître** : les plans Phase 2 (rédigés le 15 mai) listent comme « à faire »
> plusieurs éléments **déjà livrés depuis** sur `main`. Ne pas s'y fier sans recouper avec l'état réel.
> C'est l'une des raisons d'être de ce document.

---

## 4. Plans Phase 2 et branche d'audit

Les plans d'action vivent dans `audit/` (branche `audit/2026-mai`, documentaire). Statut au 31 mai :

| Plan | Objet | État |
|---|---|---|
| `audit/PLAN-PHASE-2-OVERVIEW.md` | Vue d'ensemble, traces Cowork (12 décisions D-COW) | À jour ; manque « bilans » de fin + relais Phase 3 |
| `audit/PLAN-COURT-TERME.md` | Sécurité, doc, a11y, vocabulaire (échéance 3 juin) | Majorité livrée ; reste a11y + révision Loi 25 |
| `audit/PLAN-MOYEN-TERME.md` | Refactoring god modules + hygiène structurelle | Refactorings **faits** ; hygiène GitHub **faite** (plan périmé) |
| `audit/refactoring-prep/PLAN-CAT-B-POST-MERGE.md` | Dette des 5 refactors (4 tracks) | Tracks 1-2-3-4 livrés ; reste Track 3 ph.2 + Track H (optionnels) |
| `PLAN-LONG-TERME.md` | À rédiger après validation court/moyen terme | **À faire** (post-AQPC) |

**Branche `audit/2026-mai`** (HEAD `097ce88`, inchangée depuis le 21 mai) : **purement documentaire**
(rapports + plans + traces Cowork, **aucun code applicatif**). La divergence avec `main` s'est **fortement
accrue** depuis le 10 juin (526 commits de retard à l'époque ; ~20 releases livrées depuis). Le **merge
d'archivage** vers `main` n'est **toujours pas fait**. Conflits attendus seulement sur `SESSION.md`/`BACKLOG.md`
(réconciliation manuelle) ; **zéro conflit de code**. Archivage à faible risque, pas une migration de données.
Candidat naturel pour une séance « hygiène » à la reprise d'août.

---

## 4bis. Répertoire `plans de travail/` — point du 8 août 2026

> **Origine** : question de Grégoire — « y en a-t-il qui n'ont pas encore été
> amorcés ? ». Méthode : croisement des 91 documents avec `BACKLOG.md`,
> `SESSION.md` et `BACKLOG-ARCHIVE.md`, puis **vérification au code** des
> 15 documents qu'aucun de ces fichiers ne citait.

**Le résultat qui compte** : « jamais cité » ne veut pas dire « jamais fait ».
Sur ces 15, **cinq étaient livrés** — le plan dormait, le travail était en
production. Un plan ne dit pas son propre état ; seul le code le dit.

### Jamais amorcés et encore pertinents — quatre

| Plan | Item | Échéance |
|---|---|---|
| `REFERMAGE-2026-09-01-cloudflare-access.md` | #427 | **1er septembre 2026** — fiche opératoire réécrite le 27 août pour la policy ouverte. ⚠ Ne pas suivre `Checklist Levée Cloudflare Access .txt` : c'est la checklist de la **levée** de mai, l'opération inverse |
| `PLAN_sessionC_calcul_303.md` | #303 Session C | non datée ; Sessions A et B livrées, débloque #307 |
| `Plan - Désaturation localStorage (analyse).md` | #353 | reportée (session dédiée) ; Option 1 livrée le 3 juillet, options 2/3/4 en attente de **mesures** |
| `PLAN_recadrage_skill_ecosysteme.md` | — | reporté explicitement par Grégoire (5 juin) |

### Archivés le 8 août — 11 documents

Déplacés sous `plans de travail/_archives/` (`git mv`, rien de supprimé) :
cinq **livrés** (bilan réflexif, nettoyage wizard V1, audit Phase 5 démo,
Rythme, ménage du root) et six **périmés ou clos par décision** (RELAIS #326,
validation #367, reprise août, brouillon Session B #303, carrousel de
séquences, refonte import/export de janvier). Le détail et les **preuves
relevées au code** sont dans `plans de travail/_archives/README.md`.

### Second passage — les 76 plans cités (même jour, en soirée)

Ce qui a tranché le tri : **un document de passation cadre UNE session, qui a
eu lieu**. Relais, consignes d'audit et protocoles citent des items encore
ouverts parce qu'ils listent des SUITES — pas parce qu'ils restent à faire.

**12 documents archivés de plus** : 2 périmés vérifiés (`PLAN-ORGANISATEUR-LAYOUT`
— la page est supprimée ; `PLAN_chrome_unifie` — livré le 24 mai alors qu'il
portait encore « à exécuter ») et 10 documents de passation consommés (5 relais,
le protocole #358 exécuté le 28 juin, 2 consignes d'audit versées en #379-#393
et #394-#402, la consigne de correctifs livrée en 1.31.14→22, le plan du
planificateur en grille). Les 5 fichiers qui les référençaient ont été
**recâblés** — aucun lien mort.

**Bilan du répertoire** : 91 documents au départ → **69 à la racine, 24 en
archives**.

**Laissés en place par jugement** (nommés dans `_archives/README.md`) : le
**dossier #307** — sept documents de spec et de conception pour un chantier
jamais fait, c'est de la matière vivante ; les plans du 6-8 août (portes
terrain ouvertes) ; les protocoles encore à dérouler ;
`RELAIS-326-refonte-banc-decision`, désigné **source unique** par un skill ; et
quatre documents dont les items (#336, #283, #297) sont ouverts.

⚠ **Limite de la méthode** : ce tri classe par **nature** et par **état des
items cités**, pas par lecture intégrale. Les seize documents laissés sont
précisément ceux dont le statut demandait un jugement — ils sont nommés, donc
contestables un par un.

---

## 4ter. Les 43 plans non tranchés — vérification au code (9 août 2026)

> **Origine** : demande de Grégoire — le §4bis avait classé les 91 documents par
> **nature** et par **état des items cités**, et déclarait lui-même sa limite. Il
> nommait 25 documents (4 jamais amorcés + 16 laissés par jugement + les plans du
> 6-8 août). Les **43 autres** n'avaient jamais reçu de verdict de complétion.
>
> **Méthode** : lecture de l'en-tête de chacun, puis **vérification au code** —
> présence du module, de la sentinelle, ou de la clé attendue. Ce qui suit dit
> pour chacun *terminé / partiel / non amorcé*, avec la preuve relevée.
>
> ⚠ **Ce qui distingue ce passage du §4bis** : il ne demande pas au plan ce qu'il
> pense de lui-même. Un plan qui porte « implémentation non démarrée » depuis
> avril peut avoir été livré par un autre chemin — c'est arrivé cinq fois au
> premier passage.

### A. Terminés — le travail est fait, le plan peut être archivé (15)

| Plan | Preuve relevée au code |
|---|---|
| `AUDIT-COULEURS-SECTIONS.md` | les 5 hex de la palette auditée sont dans `styles.css` |
| `CADRAGE-320-repertoires-bibliotheques.md` | `js/repertoires-bibliotheque.js` (#320, 1.5.0) |
| `CADRAGE-327-classement-transversal-biblios.md` | #327 en 1.6.0 ; specs Playwright T1/T2/T3 + L1/L2 |
| `CADRAGE-briques-C-D-namespacing.md` | #358 migration live validée (1.25.0) ; #359 livré le 26 juin |
| `CADRAGE-premier-essai-verification-adverse-338.md` | #338 clos le 14 juin (~1987 lignes mortes retirées) |
| `CONSIGNE-renommage-eleves-demo.md` | #351 livré le 29 juin |
| `NOTE-COWORK-integration-guides-som-pan.md` | `guides-pedagogiques.js` porte bien les clés `som:` et `pan:` |
| `PLAN-328-L2-degonfler-miroir.md` | **L2-b2 ET L2-c livrés** — voir la note ci-dessous |
| `PLAN-358-migration-modeles.md` | migration exécutée et validée le 28 juin (1.25.0) |
| `PLAN-360-prevention-doublons-evals.md` | #360 livré en 1.24.0 |
| `PLAN-AUTONOMISATION-UTILISATEUR.md` | Plan 1 livré (Beta 99.24) — attesté par `HOOKS-PLAN2.md` §1 |
| `PLAN-namespacing-par-trimestre.md` | briques A/B/C/D toutes livrées |
| `PLAN-passage-1.0-AQPC.md` | 1.0.0 lancée le 3 juin |
| `PLAN-UNIFORMISATION-ASSEMBLAGE-GROUPE-COURS.md` | #306 lots 1-2-3 livrés le 3 juillet |
| `PLAN_sessionB_representations_303.md` | Session B livrée le 4 juin |

▣ **#328 est clos, et le recoupement demandé depuis le 28 juin est fait.**
Vérification au code : `sentinelle-mode-affichage-tableau-bord-2026-06-02.js`
affirme « L2-b2 : le miroir `config.pratique` n'est PLUS lu — la SSOT prime »,
et deux sentinelles `…-L2c` verrouillent la dérivation des jetons plus son
cliquet. La dernière grande violation SSOT de l'audit annuel est close.

⮕ **Et la désync n'était pas où ce document la plaçait.** Le §2 et le §5.3
ci-dessous annoncent « case `BACKLOG.md` non cochée → à recouper ». **C'est
faux depuis le 3 juillet** : la case y est `[x]`, avec la trace « l'item n'avait
pas suivi les livraisons L2-b2/L2-c ». Le retard était **ici**, dans les
sections 1 à 11 gelées au 28 juin. Corrigé au §2 et au §5.3. Leçon à retenir
telle quelle : *un document qui surveille les désyncs des autres trackers en
produit aussi.*

### B. Documents de passation et artefacts consommés (6)

`PLAN-TRAVAIL-26-MAI.md` (⚠ cité par la légende de `BACKLOG.md` — recâbler avant
d'archiver) · `PLAN-prevalidation-visuelle-chromium-2026-07.md` ·
`VALIDATION-C0-2026-06-06.md` · `audit-358-v2-sites.json` ·
`campagne-C0-diagnostic.js` · `inventaire-D1-activites-organisateur.js`
(l'Organisateur qu'il inventoriait est supprimé).

### C. Partiels — commencés, pas finis (8)

| Plan | Ce qui est fait | Ce qui reste |
|---|---|---|
| `CADRAGE-guides-pedagogiques-post-AQPC.md` | **5 guides sur 7** : `solo`, `acp`, `rai`, `som`, `pan` | **« Enseignement explicite » (4 p.) et `pan-rrec`** (cadre réglementaire) — jamais écrits |
| `PLAN-refonte-note-finale-portfolio.md` | Phases A, E, F, G1, G2-a **et — vérifié le 9 août — B et C** (voir le rectificatif ci-dessous) | **Phase D** (retrait du champ legacy `mat-variante-calcul`, avec une question ouverte : où migrer la bascule Portfolio ↔ Par-Objectifs) · **G2-b** (~30 lecteurs legacy de `configPAN.portfolio`) |
| `PLAN-MIGRATION-ICONES-SVG.md` | `icons/` est passé de 70 à **134 SVG** | **277 emojis dans `index.html`, ~2400 dans `js/`** — le gros du chantier |
| `PLAN-VOUTE-PHASES-1-8.md` | Phase 1 avant-pilote code-complet (`signature.js`, `trust-tofu.js`, 6 `partage-*.js`) | `gestion-cles.js` et `trust-wot.js` **n'existent pas** ; outil de modération non plus |
| `PLAN-export-resultats-finaux.md` (#333) | `js/export-resultats-finaux.js` existe ; Lot 2 (CSV synthèse) livré le 19 juin | le volet **PDF** et la présentation de la pratique en vigueur |
| `PLAN-restauration-longitudinale-A25.md` | pilote A25 engagé, §8.4 livré | **réplication A24 / H24** (§7) |
| `SPEC_D_exploration_pratiques.md` + `NOTE-CONCEPTION-D-…` | #326 réactivé (1.26.0) ; `js/comparateur-pratiques.js` et `pratiques-exploration.js` en place | l'**axe D** proprement dit — variantes et parenté arborescente |
| `SPEC_DEN_couche2.md` + `NOTE-COWORK-modele-DEN.md` | #318 parcours créable livré (1.21.0) | modes « différée » / « réduite » et le **câblage DEN dans `calculerDetailsNoteFinale`** |

▣ **RECTIFICATIF, 9 août en fin de journée — je m'étais trompé sur une ligne.**
Ce tableau annonçait que les **phases B et C** de
`PLAN-refonte-note-finale-portfolio.md` restaient à faire, et qu'elles venaient
d'être débloquées par la clôture de #328. **Les deux sont livrées** — vérifié au
code : la carte de la terminale est conditionnée à `terminal.present`, la formule
et la grille s'adaptent, le mode hybride sans terminale a sa branche ; côté PDF,
`selection` et `obligatoires` sont strictement séparés, les pondérations par bloc
sont rendues, et le titre suit le réglage `notesFinales` de l'enseignant.
Reste **Phase D** et **G2-b**.

⮕ **La cause de l'erreur mérite d'être notée, parce que c'est celle que ce §4ter
dénonce.** J'ai lu les titres du §3 du plan (« Phase B — **À FAIRE** après Phase
E ») au lieu d'aller au code. Le plan se contredit d'ailleurs lui-même : son §3
porte la Phase E « EN COURS », son §5 la donne « livrée ». *Un plan ne dit pas
son propre état* — la phrase est écrite en tête de cette section, et je l'ai
enfreinte sur la ligne où elle comptait le plus.

⮕ **Ce qui en sort de bon** : B et C étaient livrées **sans aucun filet**, et ce
sont des défauts d'AFFICHAGE — ils ne cassent aucun calcul, aucun test ne les
voit, et ils sortent chez l'élève dans un PDF. `tests/unit/sentinelle-note-finale-portfolio-BC.test.js`
(11 cas, 11 break-tests ROUGE) les verrouille désormais, avec les trois
garde-fous du calcul (§4-1, §4-2, §4-3 du plan).

### D. Jamais amorcés (4, en plus des 4 déjà connus du §4bis)

| Plan | État | Ce qui bloque |
|---|---|---|
| `PLAN-339-config-portfolio-explicite.md` (#339) | plan + audit prêts, **aucun code** | trois verrous §1, dont un **changement de format de données ⇒ version MAJEURE** ; décisions de Grégoire en attente (§7) |
| `PLAN-PARTAGE-RESSOURCES.md` (Plan 2) | **plan source de la Voûte** (cité en préséance « Base » par `PLAN-VOUTE-PHASES-1-8.md`) | rien — il vit tant que la Voûte n'est pas finie |
| `HOOKS-PLAN2.md` | cadrage des points d'extension de Plan 2 | la session de cadrage Plan 2 n'a jamais eu lieu |
| `Plan - Archivage et stockage inter-trimestres.md` | réflexion du **5 avril**, « à reprendre post-AQPC » | jamais repris. Recoupe #353 (budget de stockage) |

### E. Vivants — cadres de référence, pas des files de tâches (4)

`PLAN-mi-aout-2026.md` (⚠ **son horizon est atteint** — à requalifier ou verser
dans le suivant) · `PLAN-reconstruction-trimestres.md` (feuille de route, horizon
automne 2026) · `RAPPORT-353-saturation-localstorage.md` (rapport de décision,
en attente de **mesures**) · `INVENTAIRE-worktrees-2026-07.md` (triage dû à
Grégoire, sur le Mac).

### F. Un angle mort du §4bis, et une limite de celui-ci

⮕ **`Plan Accompagnement/` n'a jamais été audité.** Le §4bis portait sur
`plans de travail/` seul. Ce dossier contient **14 documents**, dont au moins
trois désignent du travail non fait : `PLAN_guide_PAN_refonte_RREC.md`,
`PLAN_decouvrabilite_guides.md`, `SPEC_mini-guide_cours_balises.md`. Le compte
réel de plans ouverts du projet est donc supérieur à ce que le §4bis laissait
croire.

⚠ **Limite déclarée de ce passage-ci** : la preuve relevée est la **présence**
d'un module, d'une sentinelle ou d'une clé — elle établit qu'un chantier a été
mené, pas qu'il a été mené *complètement*. `PLAN-briqueA-ecrans-analyse-namespacing.md`
est le cas le plus fragile : classé **terminé avec #358**, sur la foi de
`cle()` désormais présent dans `profil-etudiant-helpers.js` et
`profil-etudiant-sections-affichage.js` — pas d'une relecture de ses §3 site par site.

---

## 4quater. `Plan Accompagnement/` — l'angle mort comblé (9 août 2026, PM)

> **Origine** : le §4ter ci-dessus désigne ce dossier comme le trou de l'audit —
> **14 documents jamais passés au crible**, « dont au moins trois désignent du
> travail non fait ». Ce passage les traite un par un, avec la même méthode :
> lire l'en-tête, puis **aller au code** chercher la preuve.
>
> ⚠ **Résultat inattendu, et c'est le point à retenir** : sur les trois documents
> que le §4ter accusait, **deux étaient intégralement livrés**. Le compte de plans
> ouverts du projet n'est pas *supérieur* à ce qu'on croyait de ce côté — il est
> **inférieur**. La règle « un plan ne dit pas son propre état » vaut dans les
> deux sens, et on ne l'applique spontanément que dans celui qui inquiète.

### A. Terminés — vérifiés au code (7)

| Document | Preuve relevée |
|---|---|
| `SPEC_mini-guide_cours_balises.md` | popup `cadre-cours-balises` (`accompagnement-contenu-popup.js:28` + `index.html:6457`), bulle `reglages-cours-ponderation-heures` (`…-hover.js:68` + `index.html:6455`), **et** le renommage OQLF : `index.html:6462` dit « Heures d'enseignement », `v2-heuresContact` n'existe plus |
| `PLAN_decouvrabilite_guides.md` | les **5 lots** : `data-param` sur `case 'action'` (`accompagnement.js:779`), bannière (`accueil.js:72`+`79`), 7e étape `id: 6` « Labo (optionnel) » (`accompagnement.js:1112`), 5 boutons « Ouvrir le guide » au catalogue popup, champ `guide:` sur 8 termes + son rendu (`accompagnement.js:1429`, `:1570`) |
| `CONTENU_apropos_sources-remerciements.md` | #325 — `index.html:9724`, verrouillé par `sentinelle-apropos-sources-325.test.js` |
| `REVISION_contenu_guides_SOLO-ACP-RAI.md` | les **7 corrections** au code : seuil « 64 % » (et non 65), chemins `autocollants/solo/comprehension-*.svg`, « étudiant·e » (40 occurrences contre 2 « élève »), « PAN – Standards » |
| `CONTENU_guides_som-pan_2026-06-06.md` | clés `som` et `pan` dans `GUIDES_PEDAGOGIQUES` |
| `PLAN_chrome_unifie_Labo_Codex.md` | livré le 24 mai (SESSION.md §1quinquies) — bouton `⋯` et popover utilitaires, `index.html:3931` et `:3949` |
| `PLAN_guide_RaI.md` | clé `rai`, 4 pages — **livré par un autre chemin que celui du plan** : le plan prévoyait un module `js/guide-rai.js` dédié, le guide vit dans le module unifié. Meilleure décision, prise après coup |

### B. Documents consommés — à archiver, pas à exécuter (3)

- `LISEZ-MOI_orchestration_chantiers.md` — coordination des cinq plans de mai ; tous soldés ou tranchés.
- `CDC_guides_pratiques_notation_2026-06-06.md` — cahier des charges dont le livrable (`CONTENU_guides_som-pan`) est intégré.
- `PLAN_guide_PAN_pedagogique_CSE.md` — « spec finalisée » du 29 mai, **explicitement périmée** par le CDC du 6 juin (recadrage PRÉN ≠ PAN, Girouard-Gagné et al. 2024). Le guide `pan` livré suit le CDC. ⮕ À garder comme **trace datée**, pas à réécrire.

### C. Partiels (2)

| Document | Fait | Reste |
|---|---|---|
| `PLAN_taxonomie_SOLO.md` | chantiers **1** (4 tampons SOLO, `travaux-outils.js:304-307`, catégorie conditionnée à la préférence) et **2** (guide `solo`, 5 pages) | **chantier 3 jamais amorcé** : l'association d'un niveau SOLO *déclarée par l'enseignant* dans l'éditeur d'échelle. `echelles.js` n'a ni sélecteur ni pictogramme. ⚠ Ne pas confondre avec `critere.niveauSOLO` de `grilles.js`, qui existe et porte sur les **critères de grille** — autre objet |
| `PLAN_uniformisation_Accompagnement.md` | l'intention est livrée : hiérarchie revue, paramètres avancés repliables (`parametres-avances-pliable`), guide ACP | **livré par un autre patron** — la page a été refondue en cartes-accordéon le 26 mai (PM2). Le patron `.option-accompagnement` du §2 a donc été remplacé sans être retiré (voir le nettoyage ci-dessous) |

### D. Le maître, et ce qu'il porte encore (1)

`PLAN_guides_pedagogiques.md` — **architecture livrée** (module unifié, structure
`GUIDES_PEDAGOGIQUES`, panneau générique, styles partagés). Restent trois choses,
de trois natures différentes :

1. **§4 — le guide « Enseignement explicite » n'a jamais été écrit.** Aucune clé au
   module, et la préférence `enseignementExpliciteDefaut` du §4.1 n'existe nulle part.
   ⚠ Son gabarit HTML (§4.1) est **bâti sur le patron `.option-accompagnement` retiré
   aujourd'hui** : à écrire un jour sur le patron accordéon réel, pas sur celui-là.
2. **§3.4 — la migration du guide Alignement n'a pas été faite.** Les deux moteurs
   coexistent toujours (`GUIDE_PAGES` de `planification-carte.js` d'un côté,
   `guides-pedagogiques.js` de l'autre) — constat déjà posé le 8 août (#432), qui les
   a harmonisés **visuellement** sans les fusionner. Le plan disait « à migrer ou
   laisser » : c'est « laisser », et personne ne l'a jamais tranché explicitement.
3. **§7 — le signalement SRPNF n'a jamais atteint le BACKLOG.** Le plan écrivait
   « signalé pour le backlog » le 23 mai ; `grep SRPNF BACKLOG.md` rend **zéro
   occurrence** au 9 août. Deux mois et demi. Versé aujourd'hui (#440).

### E. Le guide `pan-rrec` — jamais amorcé, et le seul du lot (1)

`PLAN_guide_PAN_refonte_RREC.md` : `GUIDES_PEDAGOGIQUES` porte **cinq** clés
(`solo`, `acp`, `rai`, `som`, `pan`) — pas `pan-rrec`. Le §4ter avait raison sur
celui-ci. ⮕ Particularité qui change son coût : **les 4 pages sont intégralement
rédigées** au §3 du plan, prêtes à coller. Ce n'est pas un chantier de conception,
c'est une intégration. Versé avec le guide « Enseignement explicite » en **#439**.

### F. Ce que l'audit a trouvé au passage, et qui est corrigé le jour même

▣ **Du code mort, exactement là où le remplacement n'avait pas retiré le remplacé.**
Le patron `.option-accompagnement` (le bloc, sa tête, sa checkbox, son titre, sa
description, ses sous-options et les deux règles `:has()` qui les masquaient) vivait
encore dans `styles.css` — **~51 lignes, zéro porteur** dans `index.html`, `js/`,
`tests/` ou `design-system.html`. Seul `.option-accompagnement-guide-btn` sert
encore, sur les cinq en-têtes de carte. Retiré, avec un cliquet
(`sentinelle-patron-option-accompagnement.test.js`).

⮕ **Le cliquet ne liste pas les classes mortes d'aujourd'hui** — il vérifie que
*toute* classe `.option-accompagnement*` déclarée a un porteur réel. Une liste
figée n'aurait rien dit de la prochaine.

⚠ **Et une leçon de méthode, payée sur ce test même.** Le break-test « je renomme
la classe du bouton » est resté **VERT** au premier essai : l'assertion comptait
la sous-chaîne `option-accompagnement-guide-btn`, que `…-guide-btnX` contient
encore. Elle a été resserrée sur l'attribut entier (`class="…"`). *Une assertion
en sous-chaîne ne prouve pas une classe* — et celle-là aurait couvert cinq boutons
sans style.

### G. Bilan de l'angle mort

| Verdict | Documents |
|---|---|
| Terminés | **7** |
| Consommés / à archiver | **3** |
| Partiels | **2** |
| Jamais amorcé | **1** (+ le §4 du maître) |
| **Ouvert pour de bon** | **`pan-rrec`, le guide « Enseignement explicite », le chantier 3 de SOLO, et le SRPNF codé en dur** |

⮕ **Le compte de plans ouverts du projet BAISSE.** Le §4ter annonçait au moins
trois chantiers non faits dans ce dossier ; il y en a un (`pan-rrec`), plus deux
que le §4ter ne connaissait pas (le §4 et le §7 du plan maître). Les deux autres
accusés étaient livrés depuis des semaines.

⚠ **Limite déclarée, la même qu'au §4ter** : la preuve relevée reste une
**présence** au code. Pour les documents de contenu (`REVISION_…`,
`CONTENU_guides_som-pan`), j'ai vérifié un échantillon de corrections nommées,
pas la totalité du texte rédigé contre la totalité du texte livré.

---

## 5. Qualité du code

### 5.1 Refactoring des god modules (Phase 2) — Fait

Les cinq modules à forte complexité ont été éclatés en sous-modules et mergés. Source : `audit/PLAN-MOYEN-TERME.md`.

| Module | LOC avant → résidu | Complexité (cyc) | Statut |
|---|---|---|---|
| `bilan-reflexif.js` | 4 716 → 955 | 63 → 27 | Fait (15 mai) |
| `productions.js` | 3 995 → ≈2 211 | 80 → ≤30 | Fait (17 mai) |
| `trimestre-v2.js` | 6 584 → 599 | 94 → ≤30 | Fait (17 mai) |
| `profil-etudiant.js` | 8 818 → 4 654 | 58 → ≤30 (1 héritage cyc 48 acté N=50) | Fait (18-21 mai) |
| `evaluation.js` | 7 321 → 3 984 | 78 → 42 | Fait (21 mai) |

### 5.2 Dette résiduelle de refactoring — Optionnel, post-AQPC

- **Track 3 phase 2** : 6 fonctions de `profil-etudiant-sections-affichage.js` à cyc 31-52 restant à
  éclater (~4-5 h). 1 exception assumée (`genererSectionMobilisationEngagement`, cyc 48, sous N=50).
- **Track H** : sous-découpage des résidus `profil-etudiant-sections-affichage.js` (4 654 LOC) et
  `evaluation.js` (3 984 LOC). Optionnel (~4-6 h).

### 5.3 Dette structurelle

- **Tier 6.5 `modalitesEvaluation` (#328) — Fait, recoupé au code le 9 août** (voir §4ter : sentinelles
  L2-b2 et L2-c en place ; la case `BACKLOG.md` est cochée depuis le 3 juillet — c'est **ce paragraphe**
  qui avait pris du retard, pas le backlog). C'était la dernière grande
  violation SSOT de l'audit annuel (14 écrivains sur la même clé, miroir non déclaré de la SSOT pratiques).
  La consolidation en lots a avancé tout juin (Lot 0/1/3 + L2-0/a/b1 livrés 10-11 juin) et **la release
  1.22.0 du 27 juin est étiquetée « fin de #328 »** (PR #68). **⚠ Désync de tracker** : la case `#328` de
  `BACKLOG.md` reste **ouverte** avec un reste « L2-b2 + L2-c », non mis à jour. À recouper au code
  (`js/pratiques/modalites-evaluation.js`, sentinelles `…-L2*`) avant de s'y fier dans un sens ou l'autre —
  pattern de lag déjà observé sur #326-T1/T2. Plan : `plans de travail/PLAN-328-L2-degonfler-miroir.md`,
  audit `Rapports/AUDIT-SSOT-MODALITES-EVALUATION-2026-06-10.md`.
- **`reserve.js`** : refactoring en 3 couches (FSAPI / métier / UI) — long terme.
- **Dispatcher publish/subscribe** (≈405 actions) — long terme.
- **#297** : duplication de règles CSS entre le `<style>` inline d'`index.html` et `styles.css`
  (tout fix CSS sur une règle dupliquée doit toucher les deux endroits). Audit complet post-AQPC.

---

## 6. Stabilité

### 6.1 Filet de tests
- Suite : **1179 Vitest + 68 Playwright (WebKit) verts** (Vitest recoupé `npx vitest run` le 28 juin,
  après le batch mi-août #350/#362/#342 ; Playwright vert en CI sur PR #74). (Pour mémoire : 436 verts au 10 juin.)
- Couvre : sécurité (CSP, sandbox, sanitisation, imports — Défense I/J), golden masters L0/L2 du calcul de note
  et de l'isolation par trimestre, sentinelles de namespacing (#358, briques A/B/C, special-archive), durabilité
  IDB (#353), prévention des doublons (#360), comparateur/maquettes (#326), DEN, répertoires de classement.
- **Limite connue** : la page d'assemblage (`trimestre-v2-*`) n'a que des sentinelles d'exports,
  aucun test de comportement de sauvegarde (cf. #332 Constat 1, #306).

### 6.2 Bugs de données — état au 28 juin
| Réf | Description | État |
|---|---|---|
| **#300** | désync `getSync("trimestres")` au boot | **CLOS** (10 juin, 1.6.1) |
| **#353** | saturation localStorage → bascule memoryCache/IDB | **Risque de PERTE fermé** (durabilité Option A/B/C, 1.24.1/1.24.2) ; reclassé 🟢, observabilité reportée à une session dédiée |
| **#352** | écrasement `a2025_productions` ← `h2026_productions` | **Réparé en données** (26 juin, console) ; tient après recharge ; cause structurelle adossée à #353 |
| **#360** | doublons d'évals note-égale vs reprises légitimes | **Cœur LIVRÉ** (1.24.0, Option A, vérif adverse 6 agents) |
| **#340** | changement de trimestre écrase les productions cibles | Symptôme réparé + **garde-fou actif** (1.17.7) ; reste **confirmation terrain** |
| **#346** | `coursId` non migré sur les productions | **Réparé en données** (24 juin) ; reste cause de fond (migration d'id + doublons de fiches `cours`) |
| **#362** | 408 évals h2026 → 3 grilles absentes du jeu de travail | **EN COURS** (Claude Code, fix `f9c824af` apparié par couverture scopée + `critereId`) ; séance dédiée backup + L0 |
| **#350** | recalcul FR-algo à l'ouverture d'une éval A25 → note gonflée | Données intactes, L0 vert ; **correctif à faire** + vérifier H26 |
| **#301** | résolution de pratique en **consultation** lit le namespace actif, pas le consulté | **À faire** — la note d'un trimestre archivé dépend du contexte courant |

### 6.3 Préservation des données
- **Namespacing par trimestre (#358) — migration live VALIDÉE (1.25.0, 28 juin)** : les modèles
  (grilles/échelles/cartouches) sont désormais des copies namespacées `<trim>_*` ; le global hérité est vidé
  au boot (orphelins non capturés **conservés** + journalisés, jamais perdus). Filet : golden masters L0/L2,
  sentinelles special-archive. Doc : `plans de travail/CADRAGE-briques-C-D-namespacing.md`,
  `PLAN-358-migration-modeles.md`.
- Migrations destructives : **uniquement en console one-shot sur backup Codex frais**, jamais distribuées.
- Règle d'or des séances « données » : backup Codex → dry-run/preview lecture seule → golden master L0
  avant/après (MAE Omnivox < 0,5 sur a2025 ; h2026 = self-compare) → break-test `--prouver-rougit`.

---

## 7. Pérennité

### 7.1 Documentation publique de conformité — Fait (révision Loi 25 en attente)
Présents et vérifiés sur `main` : `AUDIT.md`, `PRIVACY.md`, `INCIDENTS.md`, `DEPLOY.md`, `README.md`,
`SECURITY.md`, `libs/VERSIONS.md`, ADRs (`docs/adr/`).
- **Reste** : **#298** — réviser `PRIVACY.md` (recadrage Loi 25, alignement sur la fenêtre publique
  3-30 juin). La fenêtre « avant ouverture » est échue ; à requalifier. Dépend de l'analyse des logs Cloudflare.

### 7.2 Hygiène GitHub / OpenSSF — Fait (CodeQL et protection de branche retombés avec la privatisation)
Présents et vérifiés sur `main` : `SECURITY.md`, `.github/dependabot.yml`, workflow CI
`.github/workflows/tests.yml` (Vitest + Playwright, fonctionnel). Livrés le 25 mai.
- **CodeQL retiré le 26 juin 2026** : exige GitHub Advanced Security, indisponible gratuitement sur dépôt
  privé. Depuis la **privatisation du 23 juin**, le job échouait à chaque PR (check rouge trompeur).
  `codeql.yml` supprimé (zéro-dette).
- **Protection de branche `main` inactive** depuis la privatisation (API GitHub `403 — Upgrade to GitHub Pro`).
  `BRANCH-PROTECTION.md` recadré le 26 juin (statut « suspendu »), `DEPLOY.md` §8.3 + checklist Scorecard
  alignés. Référence à réappliquer si le dépôt redevient public ou passe à GitHub Pro.
- **Note** : les plans d'audit (15 mai) listent encore ces éléments « absents » — état périmé.

### 7.3 Licences
- Double licence AGPL v3 + CC BY-NC-SA 4.0. Headers SPDX et `libs/VERSIONS.md` présents.
- **#342** (attribution CC erronée) : **prévention livrée** (1.20.0, défaut « Inconnu ») ; reste la
  réparation des données déjà stampées (script console — palier 1 du plan mi-août).

### 7.4 Accessibilité (WCAG 2.1 AA) — En cours
- **Fait** : labels d'en-tête, #305 (modale d'aide), contraste corbeilles (#323), a11y clavier/focus du
  comparateur et de la bannière d'accueil.
- **À confirmer / compléter** : contraste, `outline:none`, `prefers-reduced-motion`, `prefers-contrast`,
  `aria-live` (audit C.3-C.7, statut partiel — à revérifier sur `main`).
- **À faire (humain, Q3)** : tests manuels VoiceOver (Mac) + iPad réel. #299 (références d'onglets périmées
  dans l'aide) compte aussi pour l'expérience d'un utilisateur frais.

---

## 8. Backlog applicatif — vue par horizon

Détail et contexte complet dans **`BACKLOG.md`** (dernier ID : la ligne « Dernier ID utilisé » de son en-tête, seule à faire foi depuis le 12 sept. 2026). La priorisation vers la mi-août vit
dans **`plans de travail/PLAN-mi-aout-2026.md`** (3 paliers, porteurs, décisions). Ce document ne duplique
pas le backlog ; il situe.

**Livré depuis le 10 juin (≈20 releases, 1.7.0 → 1.26.0), points saillants :**
- **Voûte Phase 1** (#329) : lots P1→P4, signature ECDSA + TOFU, format `.lcz` (1.7.0 → 1.11.0). Avant-pilote
  code-complet ; reste revue du format + re-passe iPad → **pilote restreint fin août**.
- **Import codex iPad** (#334 A-D) + garde-fous inter-appareils (#335, 1.16.0) + purge espace précédent
  (#336, preview/manuel). Restent des validations **terrain iPad**.
- **Comparateur de pratiques** (#326/#307) : banc de décision (1.19.0), `noteConstructible` (1.20.0),
  masquage réversible (#345, 1.21.0), **réactivation (1.26.0)**.
- **Dénotation** : DEN éditable inline + créable de 1er rang (1.21.0).
- **Namespacing par trimestre** (#358 + briques A/B/C, #357) : 1.21.1 → 1.23.0, migration **live** 1.25.0.
- **SSOT `modalitesEvaluation`** (#328) : « fin de #328 » 1.22.0 (à recouper, §5.3).
- **Intégrité** : #360 doublons (1.24.0), #353 durabilité (1.24.2), #350/#346/#352 réparés en données.

**Horizon mi-août — paliers (détail dans le plan) :**
- **Palier 1 (bloquant-confiance)** : finir #326 (fait), #362, #350, #346, #342 (réparation données), #332
  Constat 1 ; côté terrain Grégoire : #334, #336, #340, re-passe iPad #329.
- **Palier 2 (polish)** : #299, #313/#279 (décisions UX), #291, #286, #273.
- **Palier 3 (reportable / automne)** : 🟢 et 📦 du backlog ; **exclu : article #35/#36** (Steve Bissonnette).

---

## 9. Décisions en attente

Les décisions structurantes pour l'horizon mi-août sont rassemblées au **§9 de `PLAN-mi-aout-2026.md`**.
Synthèse :

| Réf | Décision | État |
|---|---|---|
| Arbitrage de volume | Quels 🟡 sont vraiment « confiance externe » (palier 1) vs polish ? ~14 🟡 ouverts + #358 en parallèle, 7 semaines | **Ouverte** — appartient à Grégoire |
| #328 dans la fenêtre mi-août | Si du reste subsiste (L2-b2/L2-c), entre-t-il avant l'automne ? | **À recouper** d'abord (§5.3) |
| #313 / #279 (UX) | Dédup sélecteurs Production / 3 champs au formulaire de production | **Ouverte** (📐, à trancher avant de coder) |
| Voûte #329 — format | Taille max (50 Mo) + champs exclus à confirmer avant le lot final | **Ouverte** |
| #336 — purge espace précédent | Exécuter ou non la purge auto sur les vraies données | **Ouverte** |
| Comparateur — « STD = 0 » | 0 légitime vs `null` | **TRANCHÉE (28 juin)** : STD non bâtie → `null` (« non constructible »). Vu en 1.26.0 |
| Reliquats vocabulaire (`v2-seuil-fragile`, `interpreterMobilisation`) | Libellés à conserver/atténuer | Ouvertes (audit D.1/D.3) |
| Règle IDME stricte niveau global | Override moyenne pondérée | Reportée par Grégoire (14 mai) |

---

## 10. Points de vigilance

- **⚠ UNE SEULE ADRESSE porte ses données réelles : `https://app.codexnumeris.org`** (arrêté par
  Grégoire le 8 septembre 2026 ; règle complète dans `PROTOCOLE.md`, « L'application : UNE SEULE
  ADRESSE porte ses données réelles »). Son clone `~/Documents/GitHub/Monitorage_v6` reste l'arbre de
  travail des sessions ; il n'alimente plus son écran. **Deux conséquences pour toute session** :
  (a) devant un symptôme de données qui manquent ou qui reviennent, la première question est
  « quelle instance ? », pas « quel bug ? » — l'avoir omise a coûté deux sessions à #785/#542 ;
  (b) **un lot seulement commité n'est pas encore chez lui** : rien ne se vérifie à l'écran avant le
  push sur `main` et le déploiement (30-60 s, `DEPLOY.md` §2). Sonde de mesure, sans écriture :
  `scripts/diagnostic-785-presences-deux-instances.js`.
- **Reprise d'août sur Plan Pro, après un congé de juillet.** Mémoire personnelle dégradée + budget réduit
  (Pro ≪ Max 20x, usage partagé Cowork + Claude Code). Mitigations : s'appuyer sur le rituel
  `.claude/skills/debut-de-session-labo-codex/SKILL.md` et sur `PLAN-mi-aout-2026.md` plutôt que sur la mémoire ; défaut **Sonnet**
  pour le codage ; viser un dépôt **propre et poussé** avant le départ (cf. §10 bis).
- **Multi-agents.** Plusieurs agents (Cowork + Claude Code) opèrent sur le même dépôt ; une collision de
  rebase a déjà eu lieu le 28 juin (résolue en merge, sans perte). Vérifier `git status` / verrous `.git/*.lock`
  avant toute opération d'écriture.
- **Désyncs de tracker.** `BACKLOG.md` / `SUIVI-BUGS.md` peuvent retarder sur le code (vu #326-T1/T2, #328).
  Toujours recouper un statut au code avant de s'y fier — c'est le rôle de ce document.
- **Bêta publique en cours.** Des expérimentateurs réels utilisent l'app depuis le 3 juin. Les retours
  testeurs interrompent le plan (règle CLAUDE.md) ; aucune migration destructive distribuée — fixes de
  données en console one-shot chez Grégoire seulement.
- **Cache Safari `file://`** : après un bump de build, hard refresh `Cmd+Option+R` obligatoire ; suspecter
  le cache avant le code en cas de faux bug.
- **Refactoring d'extraction** : un guard `typeof === 'function'` ne signifie pas qu'une fonction est morte ;
  tout fix défensif critique doit être verrouillé par une sentinelle sous peine de disparaître silencieusement.

### 10 bis. À faire avant le congé de juillet (pour une reprise nette au 1er août)
1. **Dépôt propre et poussé** : laisser Claude Code finir/committer/pousser le palier 1 en cours ; nettoyer
   les `.git/*.lock` résiduels (depuis le Terminal Mac) ; aligner `origin/main` sur le local.
2. **Trancher ou parquer explicitement les décisions ouvertes du §9** (sinon une session fraîche stagne).
3. Optionnel : une note `REPRISE-2026-08-01.md` (état git, décisions §9, items « mains dans les données »,
   première tâche recommandée).

---

## 11. Journal des mises à jour

| Date | Build | Révision |
|---|---|---|
| 2026-05-31 | 0531-0840 | Création du document. État consolidé après audit du backlog et des plans Phase 2. |
| 2026-05-31 (PM) | 0531-1409 | #294 fait (déploiement lancé). UI : bandeau orange, thème clair, anti-flash. « wizard » → « assistant ». Plan « Bêta publique 1.0.0 » prêt. |
| 2026-06-10 | 0610-0512 | Rattrapage de 10 jours (124 commits, 1.0.0 → 1.6.1). Lancement public fait. #303 clos, #307/#318/#319/#320/#327 livrés, #300 clos. Tests 436 verts. Audit SSOT `modalitesEvaluation` livré (plan 4 lots). |
| 2026-06-28 | 0628-2126 | **Rafraîchissement Cowork** (1.6.1 → 1.26.0, ~20 releases). Ajout §0 repère rapide + §10 bis. LIVRÉS : Voûte avant-pilote (1.11.0), comparateur réactivé (#326, 1.26.0), namespacing par trimestre + migration live (#358, 1.25.0), durabilité IDB (#353, 1.24.2), doublons (#360, 1.24.0), « fin de #328 » (1.22.0, **à recouper** — case BACKLOG ouverte). EN COURS : palier 1 mi-août (#362 fix `f9c824af`). Horizon **mi-août** cadré (`PLAN-mi-aout-2026.md`). Privatisation du dépôt (23 juin) → CodeQL/branch-protection suspendus. Contexte : passage Max 20x → Pro + congé juillet, reprise 1er août. Tests **1179** Vitest + 68 Playwright (Vitest recoupé 28 juin). État vérifié au code/git. |
| 2026-06-28 (nuit, Claude Code) | 0628-2126 | Merge de PR #74 (batch mi-août #346/#350/#362/#342) et #72 (untrack symlinks `node_modules`) sur `main`. Dé-hardcodage des docs d'entrée (CLAUDE.md / 00-START-HERE / README → pointent `version.json`/`ETAT-PROJET.md`). Correction des lignes périmées de ce document (1142→1179, en-tête « non poussé »). Réorg `Rapports/audit-developpement/`. Outils #362/#342 prêts (dry-run/audit, revue adverse), run live reporté à une séance de jour sur backup. |
| 2026-08-08 (soir, Claude Code) | 0808-1836 | **Rafraîchissement 1.26.0 → 1.60.0** (34 releases). Nouveau §0 (repère du 8 août : semaine du portage des exports #424, export personnalisé #431, guides harmonisés #432, corbeille #433 ; portes terrain dues ; **tension du calendrier d'août** face à la Rencontre 1 de la CoP) ; ancien §0 conservé en §0bis. Nouveau **§4bis** : audit complet du répertoire `plans de travail/` (91 documents → 69 + 24 archivés), deux passages, méthode et limites déclarées. #427 reporté à septembre. ⚠ **Sections 1 à 11 NON revues** — elles datent du 28 juin. |
| 2026-08-09 (Claude Code) | 0809-0733 | **1.60.0 → 1.61.0.** #426 (l'onglet devient « Carte d'alignement ») et #421 (conformité du manuel, 4 surfaces) livrés — sentinelle 14 cas, 10 break-tests ROUGE, Vitest 1974/1974. Nouveau **§4ter** : vérification AU CODE des **43 plans** que le §4bis n'avait pas tranchés — 15 terminés, 6 documents de passation consommés, 8 partiels, 4 jamais amorcés, 4 vivants. Deux constats qui changent la lecture du reste : (1) le §4bis n'a **jamais audité `Plan Accompagnement/`** (14 documents, dont 3 au moins non faits) — le compte de plans ouverts est plus élevé qu'annoncé ; (2) les **phases B et C de `PLAN-refonte-note-finale-portfolio.md` sont débloquées** — leur préalable était #328, clos. Corrigé : la ligne #328 du §2 et le §5.3 annonçaient une case BACKLOG non cochée, fausse depuis le 3 juillet. |
| 2026-08-09 (suite, Claude Code) | 0809-0835 | **1.61.0 → 1.63.0.** Phases B/C de la note finale : constatées LIVRÉES (verrou 11 break-tests) + rectificatif du §4ter (je les avais annoncées « à faire » en lisant les titres du plan au lieu du code). #434 Phase D (sélecteur unique). Puis **#435 sur question de Grégoire** : #434 avait rendu atteignable le mode STD « par-objectifs » que la décision #396 condamnait — même défaut de naissance (`objectifId` sans écrivain), panneau jamais affiché, 4 gabarits sans aucun objectif. **Ablation complète** (moteur 4 modes, panneau, 10 fonctions, 4 gabarits, projections), pratiques legacy normalisées en lecture seule, dépendances DEN préservées et break-testées. Leçon consignée : vérifier l'HISTORIQUE avant de rendre disponible, pas seulement le code. 1.62 consolidée dans 1.63 (jamais déployée). Vitest 1998/1998. |
| 2026-08-09 (PM, Claude Code) | 0809-1101 | **1.65.1 → 1.65.2.** Nouveau **§4quater** : audit de `Plan Accompagnement/`, le dernier angle mort désigné par le §4ter — 14 documents traités au code. **7 terminés, 3 consommés, 2 partiels, 1 jamais amorcé.** ⚠ **Le compte de plans ouverts BAISSE** : sur les trois documents que le §4ter accusait, **deux étaient intégralement livrés** — `SPEC_mini-guide_cours_balises` (popup, bulle de survol ET le renommage OQLF « heures d'enseignement ») et `PLAN_decouvrabilite_guides` (les cinq lots). *La règle « un plan ne dit pas son propre état » vaut dans les deux sens ; on ne l'applique spontanément que dans celui qui inquiète.* Reste ouvert : `pan-rrec` (4 pages déjà rédigées), le guide « Enseignement explicite », le chantier 3 de SOLO, et le SRPNF codé en dur — versés en **#439/#440/📐#441**. Le §7 du plan maître disait « signalé pour le backlog » le 23 mai : il n'y était **jamais arrivé**. **Nettoyage zéro-dette du jour même** : patron `.option-accompagnement` (~51 lignes de `styles.css`) sans porteur depuis la refonte en accordéons du 26 mai, retiré, cliquet générique posé, **4 break-tests ROUGE** — dont un qui a d'abord été VERT et a révélé une assertion en sous-chaîne dans ma propre sentinelle. Vitest 2062/2062. En-tête du document recalé (il annonçait 1.64.0 alors que `main` portait 1.65.1). |
| 2026-08-09 (fin, Claude Code) | 0809-0906 | **1.63.1 → 1.64.0.** Correctif du badge « par objectifs » survivant à #435 (il lisait un champ que les pratiques STOCKÉES portent encore, et masquait le badge portfolio de ces mêmes pratiques). Puis **#436 Phase G2-b** : fin du miroir `configPAN` — 9 lectures d'affichage migrées (chiffre rectifié au rituel de fin — annoncé 7), les 2 écrivains de `pratiques.js` retirés (dont une migration qui tournait à chaque boot), l'îlot multi-objectifs supprimé. **Le plan de refonte de la note finale est CLOS** (A, E, F, G1, G2-a, B, C, D, G2-b). ⚠ Deux valeurs affichées GELÉES en constantes explicites, décision en attente (dénominateur de l'indice C ; quota des jetons) — les brancher sur la SSOT changerait ce que l'utilisateur voit. Deux survivants légitimes break-testés. Le miroir stocké subsiste dans les données (purge = migration destructive, à décider ; recoupe #353). Vitest 2018/2018. |
| 2026-10-11 (soir, Claude Code) | 1011-1014 | **1.198.0, documentaire.** Nouveau **§00** : les 25 sous-audits de mai remesurés au code (`304c3b58`), outils de mai étalonnés sur le commit audité, barème strict à la demande de Grégoire : **5 🟢 / 12 🟡 / 6 🔴 / 2 non mesurés** (25 mai : 13 / 9 / 1 / 2). La baisse mêle régressions réelles (CodeQL retiré, complexité remontée), barème réappliqué (2.1, 2.2) et croissance (+22 %). Tableau de bord de la complexité (§00.3), points chauds (§00.4), commandes pour rejouer (§00.5), dispositions de chaque constat (§00.6). Objectif fixé par Grégoire : contrôler la complexité ; candidats « contenir / simplifier / assainir » non lancés. Le lot 8 (`lot8-cadre`, absent d'`origin`) n'est pas vu. ⚠ Sections 0 à 11 **non revues**. |
| 2026-10-12 (Claude Code) | 1011-1808 | **1.199.0, documentaire.** §00 : dates corrigées (le §00 portait le 12 en heure UTC ; mesure du 11 au soir, Toronto) ; note que 1.199.0 est sortie après la mesure ; ligne 2.5 précisée (le cliquet `innerHTML` de `lint-securite.test.js` est un garde statique en CI). Le chantier « contenir » est développé dans `plans de travail/PLAN-contenir-la-complexite.md` : proposé, non lancé. |
