# Plan court terme — avant l'AQPC du 3 juin 2026

**Date de rédaction** : 2026-05-15
**Échéance ferme** : 2026-06-03 (présentation AQPC, Cégep de Drummondville)
**Document parent** : `audit/PLAN-PHASE-2-OVERVIEW.md`
**Source des recommandations** : `audit/reports/SUMMARY-internal.md` section « Recommandations consolidées priorisées »

---

## 1. Objectif et périmètre

Faire passer Labo Codex de son état mai 2026 (audit annuel close, 5 Vert / 10 Jaune / 8 Rouge sur 25 sous-audits) à un état **présentable et défendable** pour la présentation AQPC du 3 juin 2026, sans tenter de tout résoudre.

Critère de priorisation appliqué : les actions retenues sont celles qui sont à la fois **bloquantes pour l'amorce de la première vague d'expérimentateurs** prévue après l'AQPC, et **faisables sans refactoring lourd** (typiquement moins de 3 h par action).

**Effort total estimé** : 14 à 19 heures réparties sur 19 jours, soit environ 45 minutes à 1 heure par jour. Réaliste pour un travail à temps partiel.

**Hors périmètre court terme** (reportés en plan moyen terme) :
- Refactorings massifs des axes 2 (santé du code) et 3 (architecture). Concerne les 8-10 god modules et les 387 fonctions au-delà des seuils de complexité. Exige tests de régression préalables et 25-35 heures cumulées sur Q3 2026.
- Hygiène OpenSSF Scorecard étendue (SECURITY.md, Dependabot, Branch Protection, GitHub Actions).
- Conformité Loi 25 étendue (ÉFVP formalisée, fonction d'effacement par étudiant, politique de rétention).
- Recherche de co-mainteneurs.

---

## 2. Distinction des acteurs

Le plan distingue systématiquement trois catégories d'actions, traitées dans des sections distinctes.

### 2.1 Exécutable par Claude Code

Toutes les créations et modifications de fichiers techniques et documentaires. Claude Code travaille en autonomie sur la branche `audit/2026-mai` ou une branche dédiée, et valide chaque livrable avec Grégoire avant commit.

### 2.2 À exécuter par Grégoire

Actions qui exigent un jugement humain direct ou un accès physique aux appareils :
- Tests manuels d'accessibilité (clavier, VoiceOver Mac, iPad réel).
- Lecture du contenu sensible des rapports de bug archivés (avant que Claude Code en fasse l'audit technique).
- Décisions de pratique pédagogique (vocabulaire UI résiduel, zones grises ouvertes).

### 2.3 Démarche externe à engager en parallèle

Une seule démarche en court terme, à engager au plus tôt parce que le délai externe est de 2 à 6 semaines :

- Demander un **avis au responsable institutionnel de la protection des renseignements personnels** du Cégep de Drummondville (Loi 25, art. 8 et suivants). Cet avis conditionne la conformité formelle qui sera affichée publiquement dans `PRIVACY.md`. Sans cet avis, Labo Codex peut être utilisé en pratique individuelle (FileVault + hors-ligne suffit techniquement), mais l'adoption institutionnelle reste fragilisée.

---

## 3. Actions par phase d'exécution

### Phase 1 — Bugs actifs et corrections triviales (~30 min)

Actions indépendantes les unes des autres, à exécuter en premier parce que le coût est faible et l'effet immédiat. Aucune dépendance externe.

| # | Action | Acteur | Effort | Critère de validation |
|---|---|---|---:|---|
| 1.1 | Corriger le typo `evaluation.js:4193` (`eval.productionId` → `evaluation.productionId`) | Claude Code | 5 min | Bug fonctionnel actif : le filtre par production retournait silencieusement aucun résultat. Vérifier en sélectionnant une production et en confirmant que les évaluations associées s'affichent. |
| 1.2 | Corriger T-A1 (`#btn-codex` sans nom accessible) | Claude Code | 3 min | Ajouter `aria-label="Codex"` au bouton. Vérifier avec axe-core que la violation `button-name` disparaît. |
| 1.3 | Corriger T-A2 (`#selectGroupeCoursHeader` sans label associé) | Claude Code | 4 min | Ajouter `for="selectGroupeCoursHeader"` au label adjacent. Vérifier avec axe-core que la violation `select-name` disparaît. |
| 1.4 | Corriger le triple décalage « CC BY-SA » → « CC BY-NC-SA » | Claude Code | 10 min | Dans `audit/04-sustainability/README.md`, `audit/package.json` description, et libellé d'ADR-009 prescrit. Vérifier par grep `CC BY-SA` (sans NC) : zéro occurrence. |
| 1.5 | Mettre à jour la mention de version dans `CLAUDE.md` | Claude Code | 5 min | Remplacer « Beta 99.11 » par la version courante (à confirmer avec Grégoire — actuellement 99.42 selon SUMMARY-internal). |
| 1.6 | Ajouter référence à `docs/adr/` dans `docs/00-START-HERE.md` | Claude Code | 5 min | Section appropriée du routeur d'onboarding pointe vers les 12 ADRs. |

### Phase 2 — Documentation Loi 25 (~4 h 30)

Les trois documents bloqueurs pour la conformité documentaire Loi 25, sans laquelle l'adoption institutionnelle est fragilisée. Aucune dépendance technique, mais `PRIVACY.md` gagne à être rédigé après l'analyse des logs Cloudflare (cf. section 6 ci-dessous, points en suspens).

| # | Action | Acteur | Effort | Critère de validation |
|---|---|---|---:|---|
| 2.1 | Créer `PRIVACY.md` à la racine du dépôt | Claude Code (rédige) + Grégoire (valide) | 3 h | Sections requises : (a) données collectées, (b) mode hors-ligne 100 %, (c) anonymisation interne, (d) Cloudflare Access (cookies, OTP, logs), (e) chiffrement au repos (FileVault macOS), (f) durée de conservation, (g) droits Loi 25 (accès, rectification, effacement). Le document doit être référencé depuis le `README.md`. |
| 2.2 | Créer `INCIDENTS.md` (gabarit registre + procédure) | Claude Code (rédige) + Grégoire (valide) | 1 h | Gabarit de registre des incidents (date, nature, données impactées, mesures prises) + procédure de signalement (qui contacter, dans quel délai). Conforme à l'art. 63.5 Loi 25. |
| 2.3 | Rédiger texte « Information aux élèves » type | Claude Code (rédige) + Grégoire (valide et adapte) | 30 min | Texte court à remettre aux élèves (au début du trimestre) expliquant qu'un outil de suivi est utilisé, quelles données sont conservées, et le droit de demander effacement. Modèle générique adaptable aux cégeps. |

### Phase 3 — Déploiement reproductible (~2 h 30)

Sans ces deux livrables, l'infrastructure publique reste opaque. C'est le seul Rouge structurel de l'axe 4 et le bloqueur le plus visible pour les expérimentateurs de juin.

| # | Action | Acteur | Effort | Critère de validation |
|---|---|---|---:|---|
| 3.1 | Créer `DEPLOY.md` à la racine | Claude Code (rédige) + Grégoire (fournit captures et config Cloudflare) | 2 h | Sections : (a) vue d'ensemble Netlify + Cloudflare Access + DNS, (b) procédure de déploiement (push sur `main` → auto-déploiement), (c) configuration Cloudflare Access pas-à-pas, (d) liste des utilisateurs autorisés et procédure d'ajout / retrait, (e) procédure de rollback, (f) récupération en cas de perte d'accès. |
| 3.2 | Adopter `netlify.toml` versionné | Claude Code | 30 min | Fichier `netlify.toml` à la racine contenant `[build]` settings, `[[redirects]]` si applicable, `[[headers]]` (consolide `_headers`). Pas d'env vars sensibles dans le fichier. |

### Phase 4 — README refonte (~1 h 30)

Premier point de contact d'un tiers GitHub. Massivement obsolète actuellement (Beta 0.93 affichée vs version courante, badge licence incomplet, 8 références mortes).

| # | Action | Acteur | Effort | Critère de validation |
|---|---|---|---:|---|
| 4.1 | Refondre `README.md` à la racine | Claude Code (rédige) + Grégoire (valide) | 1 h 30 | Sections requises : (a) version Beta correcte, (b) badge double licence AGPL v3 + CC BY-NC-SA 4.0 complet, (c) statistiques actuelles (130 fichiers JS, ~117 700 LOC, ~2 791 commits), (d) retrait des 8 références mortes, (e) pointeur vers `docs/adr/` et `docs/00-START-HERE.md`, (f) référence à `PRIVACY.md`, `DEPLOY.md`, `AUDIT.md`. |

### Phase 5 — Accessibilité (~5 à 7 h)

Quatre actions sur les axes 6.1 et 6.2 de l'audit. Plusieurs sont **partiellement résolues par la passe 3 du chantier `ds-update/2026-mai`** si celle-ci est exécutée avant le 3 juin (cf. `audit/reports/CROSS-REF-ds-update-passe2.md`). À coordonner avec ton chantier design system.

| # | Action | Acteur | Effort | Dépend ds-update passe 3 | Critère de validation |
|---|---|---|---:|---|---|
| 5.1 | Corriger T-A3 (contraste insuffisant, 17 nodes page d'accueil) | Claude Code ou ds-update | 1 à 2 h | Oui (01a:Q11) | Lighthouse Accessibility score `color-contrast` ≥ 90. Si passe 3 ds-update exécutée, action automatiquement couverte. |
| 5.2 | Auditer les 22 `outline: none` sans alternative `:focus-visible` | Claude Code ou ds-update | 2 à 3 h | Oui (cascade D-D4 + 01a:Q12 + autres) | Pour chacun des 22 sites, soit `outline` restauré, soit `:focus-visible` avec `box-shadow: var(--focus-ring)`. Test clavier visible sur chaque vue. |
| 5.3 | Ajouter `@media (prefers-reduced-motion: reduce)` global | Claude Code | 1 h | Partiel (2 sites acquis 03c:Q14 + 03d:Q12) | Toutes les animations CSS (`@keyframes`, `transition`, `animation`) protégées par cette media query. Audit transverse de `js/main.js` lignes 128-240 et `styles.css` lignes 9058-9120 (cf. CLAUDE.md). |
| 5.4 | Ajouter `@media (prefers-contrast: more)` | Claude Code | 1 h | Non (hors scope ds-update) | Variables CSS principales (texte, fond, bordures) ajustées pour le mode contraste élevé. Validation visuelle dans Mac System Settings > Accessibility > Display. |
| 5.5 | Ajouter `aria-live` / `role="alert"` sur notifications | Claude Code | 30 min | Non | Sur la fonction `afficherNotification*` et équivalents. Test avec VoiceOver Mac : les notifications sont annoncées. |

### Phase 6 — Alignement UI et données (~5 à 7 h)

Deux chantiers indépendants. Le premier touche au vocabulaire descriptif (axe 1.3), le second à l'inventaire des données personnelles (axe 5.3).

| # | Action | Acteur | Effort | Critère de validation |
|---|---|---|---:|---|
| 6.1 | Aligner le vocabulaire UI sur la posture descriptive (T-L2 à T-L7 + 4 fonctions de code mort alarmiste) | Claude Code | 3 à 5 h | (a) Remplacement des chaînes alarmistes / prédictives identifiées : « Alerte : Risque de décrochage », « Intelligence prédictive », « Indice R », « Indices prédictifs A-C-P », « Découpler P et R », FAQ obsolète. (b) Suppression des 4 fonctions de code mort : `calculerRisqueEchec`, `obtenirClasseRisque`, `calculerNiveauRaI`, `afficherAlertesPrioritaires`. Vérification par grep des 6 chaînes : zéro occurrence en code applicatif. |
| 6.2 | Auditer `rapportsBugArchives` (clé localStorage 126 Ko, probable PII) | Grégoire (lecture sensible) puis Claude Code (audit technique) | 2 h | Identifier (a) le volume réel, (b) la nature exacte du contenu (captures d'écran avec noms d'étudiants ? prénoms testeurs ?), (c) la politique de rétention à appliquer (tronquer après envoi, ou rétention limitée à N jours). Documenter le résultat dans `PRIVACY.md`. |

### Phase 7 — Tests manuels Grégoire (~3 h 30)

Tests qui ne peuvent être faits que sur les appareils réels du mainteneur. Délivrent les statuts définitifs des sous-audits 6.2 et 6.3 (actuellement « Partiel »).

| # | Action | Acteur | Effort | Critère de validation |
|---|---|---|---:|---|
| 7.1 | Tests manuels accessibilité 6.2 (clavier + VoiceOver Mac) | Grégoire | 2 h | Protocole détaillé dans `audit/06-accessibility/manual-tests.md`. 5 parcours principaux (créer élève, ajouter évaluation, consulter profil, déclencher RaI, exporter) + 8 vérifications globales. Statut final 6.2 défini (Vert / Jaune / Rouge). |
| 7.2 | Tests manuels 6.3 (iPad réel) | Grégoire | 1 h 30 | Protocole détaillé dans `audit/06-accessibility/ipad-tests.md`. 7 catégories A à G (viewport, touch targets, interactions tactiles, clavier externe, performance, stockage IndexedDB Safari iPad, multitâche). Statut final 6.3 défini. |

---

## 4. Calendrier proposé

Sur 19 jours du 15 mai au 3 juin 2026, à raison de 45 minutes à 1 heure par jour de travail effectif. Cumul total visé : 14 à 19 heures.

| Semaine | Actions | Cumul effort |
|---|---|---:|
| **Semaine 1 (15-21 mai)** | Phase 1 (bugs et triviaux) + Phase 2 partielle (PRIVACY.md commencé) + démarche externe responsable PRP engagée | ~4 h |
| **Semaine 2 (22-28 mai)** | Phase 2 finie (INCIDENTS.md + Information aux élèves) + Phase 3 (DEPLOY.md + netlify.toml) + Phase 4 (README) | ~7 h |
| **Semaine 3 (29 mai - 3 juin)** | Phase 5 (accessibilité) + Phase 6 (vocabulaire UI + rapportsBugArchives) + Phase 7 (tests manuels Grégoire) | ~7 à 11 h |

**Note sur la coordination avec ds-update passe 3** : si la passe 3 du chantier design system est exécutée pendant la semaine 1 ou 2, les actions 5.1 et 5.2 sont automatiquement couvertes et la semaine 3 se concentre sur 5.3, 5.4, 5.5, 6.1, 6.2 et 7.1, 7.2.

---

## 5. Décisions de Grégoire à trancher avant exécution

Quatre décisions à acter avant que Claude Code commence l'exécution. Sans ces décisions, certaines actions peuvent partir dans la mauvaise direction.

### 5.1 Quota Cloudflare gratuit saturé

Le quota actuel de 50 utilisateurs est atteint. Quatre options à trancher :

- (a) Upgrade vers plan Cloudflare payant (coût mensuel à vérifier).
- (b) Basculer vers une politique « domaine de confiance » qui n'exige pas une liste blanche nominative (typiquement : tout email d'un domaine `.qc.ca` ou `.cegep*.ca`).
- (c) Garder la liste actuelle et purger les accès expirés au cas par cas (manuel).
- (d) Limiter la prochaine vague à 50 personnes maximum.

**À trancher avant l'amorce de la première vague d'expérimentateurs.** Hypothèse de travail pour ce plan : option (c) ou (d), donc pas d'upgrade payant.

### 5.2 Adresses courriel des testeurs alpha

Bruno V., Olivier L., Jordan R., Élise et Stéphane (noms partiels), plus les ~45 autres invités. Ces adresses sont des données personnelles au sens Loi 25.

- Faut-il les lister nominativement dans `PRIVACY.md` (transparence maximale) ?
- Ou indiquer simplement « la liste blanche Cloudflare contient les emails des collègues invités à la phase alpha de janvier-février 2026, plus quelques expérimentateurs en cours » sans nommer ?

**Recommandation Cowork** : option non-nominative dans `PRIVACY.md` (les noms sont déjà publics dans `docs/MESSAGES_ENSEIGNANTS_H2026.md` pour les invités du brouillon, mais on ne reproduit pas cette liste publiquement dans `PRIVACY.md` qui sert de référence formelle).

### 5.3 Statut des 12 ADRs rétroactifs

Les 12 ADRs créés en mai 2026 portent actuellement la mention « Acté rétroactivement » (terme custom). Faut-il :

- (a) Garder « Acté rétroactivement » (mention claire de la datation).
- (b) Aligner sur « Accepted » (terminologie Nygard standard).
- (c) Préciser dans chaque ADR : « Statut : Accepté (acté rétroactivement le 14 mai 2026 sur la base de l'usage existant) ».

**Recommandation Cowork** : option (c) — clarifie la situation sans renoncer au standard Nygard.

### 5.4 Coordination avec ds-update passe 3

La passe 3 du chantier design system est-elle prévue avant le 3 juin 2026 ? Si oui, les actions 5.1 et 5.2 (T-A3 + 22 outline:none) sont couvertes et le plan court terme se libère de ~3 à 5 heures.

**À confirmer avec Grégoire** dès que ce plan est validé.

---

## 6. Points en suspens à traiter au fil de l'eau

- **Analyse des logs Cloudflare Access** (effort 30 à 45 min) : à faire idéalement avant la rédaction de `PRIVACY.md` (action 2.1). Permet de confirmer le chiffre exact (~50), la distribution temporelle des accès, et d'inventorier précisément les données conservées par Cloudflare (emails, horaires d'accès, IP). Action portée par Grégoire (tableau de bord Cloudflare).
- **Préparation matérielle de la présentation AQPC** (hors périmètre Cowork) : Grégoire prépare ses slides, exemples concrets, démonstrations. Indépendant du plan technique ci-dessus.
- **Billet de blog Codex Numeris** (optionnel) : si Grégoire souhaite documenter l'expérience de l'audit dans un billet narratif, prévoir 2 à 4 heures de rédaction. Hors périmètre court terme strict mais signalé pour mémoire.

---

## 7. Critères globaux de fin du plan court terme

Le plan court terme est considéré comme terminé quand les conditions suivantes sont réunies, vérifiables au matin du 3 juin 2026 :

1. `README.md`, `PRIVACY.md`, `INCIDENTS.md`, `DEPLOY.md` existent à la racine du dépôt et sont à jour.
2. `netlify.toml` versionné, `CLAUDE.md` aligné sur la version courante, `docs/00-START-HERE.md` pointe vers `docs/adr/`.
3. Vocabulaire UI aligné sur la posture descriptive (zéro chaîne alarmiste / prédictive identifiée).
4. Accessibilité : 0 violation critical axe-core, focus visible sur chaque vue, préférences `prefers-reduced-motion` et `prefers-contrast` respectées.
5. Bug `evaluation.js:4193` corrigé, tests automatisés Vitest + Playwright passent.
6. Tests manuels accessibilité 6.2 et 6.3 exécutés par Grégoire, statuts définitifs documentés.
7. Demande d'avis du responsable institutionnel PRP du Cégep envoyée (réponse attendue post-3 juin).
8. `audit/PLAN-PHASE-2-OVERVIEW.md` mis à jour avec une section « Bilan court terme ».

---

## 8. Articulation avec les autres documents

- **Référence technique pour les détails** : `audit/reports/SUMMARY-internal.md` section « Recommandations consolidées priorisées ».
- **Référence pour le récit AQPC** : `audit/reports/SUMMARY-aqpc.md` section 10 « Plan de remédiation ».
- **Vue d'ensemble Phase 2** : `audit/PLAN-PHASE-2-OVERVIEW.md`.
- **Plan moyen terme** (Q3 2026) : `audit/PLAN-MOYEN-TERME.md` (à rédiger).
- **Plan long terme** (vers v1.0 et commun) : `audit/PLAN-LONG-TERME.md` (à rédiger).

---

**Fin du plan court terme.** Document à mettre à jour si une décision Grégoire (section 5) modifie le périmètre.
