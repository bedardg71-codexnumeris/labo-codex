# Plan Phase 2 — Vue d'ensemble

**Document de trace pour les sessions Cowork**
**Dernière mise à jour** : 2026-05-15 (mise à jour post-pivot du 15 mai)
**Mainteneur** : Grégoire Bédard, Cégep de Drummondville
**Référence Phase 1** : audit annuel 2026, période 12-14 mai 2026

---

## 1. Objet de ce document

Ce document trace la progression du travail Cowork sur l'audit annuel de Labo Codex, et sert de **point de reprise entre sessions**. À lire en début de chaque nouvelle session Cowork si la précédente n'a pas été finalisée.

Le travail Cowork couvre trois phases :

- **Phase 1** — Interprétation et corrections des livrables produits par Claude Code. **Close.**
- **Phase 2** — Plan de travail en quatre horizons (AQPC archive / court terme / moyen terme / long terme). **En cours.**
- **Phase 3** — Passage de relais (document final, suggestions pour la suite). **À venir.**

---

## 2. État au 15 mai 2026

### Phase 1 — close

À la lecture des quatre livrables produits par Claude Code (`SUMMARY-internal.md`, `SUMMARY-institutional.md`, `SUMMARY-aqpc.md`, `AUDIT.md`), une **hallucination factuelle** a été identifiée : Claude Code avait interprété le brouillon `docs/MESSAGES_ENSEIGNANTS_H2026.md` (modèles de courriels d'invitations rédigés en janvier 2026) comme la preuve d'une cohorte active de « 12 enseignants testeurs des Cégeps de la Côte-Est ». Or :

- Le regroupement « Cégeps de la Côte-Est » n'existe pas (entité géographique inventée).
- Le chiffre « 12 » a été inventé (le brouillon visait 10 collègues identifiés).
- L'usage effectif a été limité à quelques contacts ponctuels entre janvier et fin février 2026 ; l'auteur est seul utilisateur actif depuis.

Cette hallucination contaminait les quatre livrables principaux plus deux sous-rapports plus ADR-008. La correction a porté sur **~45 modifications dans 8 fichiers**.

Une **formulation complémentaire** a été ajoutée dans 6 des 8 fichiers, précisant l'usage réel de Cloudflare Access : environ **50 personnes en plus de l'auteur** ont obtenu un accès individuel d'une semaine via Zero Trust (OTP par email) entre janvier et mai 2026 ; aucune n'a renvoyé de feedback ou de rapport de bug, et aucune n'est revenue après l'expiration. Le quota Cloudflare gratuit (50 utilisateurs) est actuellement saturé.

Toutes les corrections ont été vérifiées par grep final : zéro occurrence résiduelle des huit patterns problématiques.

### Phase 2 — pivot du 15 mai

La session Cowork du 15 mai a pivoté le périmètre de la Phase 2 sur deux points :

1. **Pas de livrable pour le colloque AQPC du 3 juin.** Grégoire a confirmé qu'il n'y a rien à livrer (pas d'annexe technique, pas de note institutionnelle, pas de billet de blog) pour la présentation AQPC elle-même. Le contenu du `PLAN-COURT-TERME.md` rédigé pendant la session précédente reposait sur une hypothèse de livraison AQPC qui est invalidée.
2. **L'échéance du 3 juin reste**, mais elle correspond désormais à **l'accueil des novices** post-AQPC (collègues invités à expérimenter l'app), pas à une livraison de documents. Donc l'app et le dépôt GitHub doivent être présentables, mais sans déclinaisons pour AQPC.

Cela a conduit à une restructuration des livrables Phase 2 en **quatre documents** :

| Livrable | Chemin | Statut au 15 mai |
|---|---|---|
| Archive du plan pré-pivot (orienté AQPC) | `audit/PLAN-AQPC.md` | Livré (renommage de l'ex-`PLAN-COURT-TERME.md`) |
| Plan court terme (sécurité fonctionnelle pendant évaluations + accueil novices) | `audit/PLAN-COURT-TERME.md` | Livré le 15 mai |
| Plan moyen terme (refactoring axes 2 et 3) | `audit/PLAN-MOYEN-TERME.md` | Livré le 15 mai |
| Plan long terme (v1.0, commun pédagogique) | `audit/PLAN-LONG-TERME.md` | À rédiger après validation des plans court + moyen |

**Livrable d'annexe technique au moyen terme** : `audit/refactoring-prep/MODULES-MAP.md` cartographie les 5 god modules (`evaluation.js`, `productions.js`, `profil-etudiant.js`, `trimestre-v2.js`, `bilan-reflexif.js`) avec frontières fonctionnelles proposées, fonctions top-complexité, états globaux à protéger, tests de régression à écrire. ~31 460 LOC cumulés → 32-33 sous-modules cibles.

### Vérification des claims d'audit (15 mai)

Pour calibrer la confiance dans les rapports Claude Code après l'hallucination identifiée en Phase 1, Cowork a vérifié par grep et `wc -l` les claims chiffrés rapidement vérifiables :

- **Bug `evaluation.js:4193` confirmé** : la ligne contient bien `eval.productionId === filtreProduction` (au lieu de `evaluation.productionId`). Bug fonctionnel actif sur le filtre par production. Fix d'1 caractère.
- **Date du premier commit** : 20 octobre 2025 (cohérent avec « 7 mois » du SUMMARY ; le « 9 mois » du `CONTEXTE-COWORK` réfère à la phase pré-commit incluant la conversion web démarrée en août 2025).
- **129 modules JS dans `js/`** (cohérent avec le SUMMARY ; les variations 128/130/126 dans le SUMMARY sont des incohérences internes du rapport, pas des hallucinations).
- **2 815 commits par `bedardg71-codexnumeris`** (audit annonçait 2 791 ; +24 commits depuis le 14 mai, cohérent).
- **LOC en `wc -l` plus élevés que SUMMARY** (~30-50 % de plus) — probablement parce que SUMMARY utilise `cloc` qui exclut commentaires et blanks. Cohérent avec le ratio commentaires/code de 25,9 % annoncé.
- **CSP `script-src 'self'`** confirmée dans `index.html`. **0 `eval()` ou `new Function()` réels** dans le code applicatif (le seul hit grep est un commentaire « palettes eval »).
- **Bonnes correspondances ordre de grandeur** : 282 `:hover` (claim 282, exact), 20 `outline: none` (claim 22), 669 `echapperHtml()` (claim 568, +18 %).

**Conclusion** : aucune fabulation factuelle détectée dans le SUMMARY-internal sur les claims vérifiables sans outils dédiés. La confiance dans le rapport est bonne, modulo quelques écarts mineurs explicables.

Claims non vérifiés (outils dédiés requis) : 387 fonctions cyc > 15, 1,44 % duplication jscpd, 13 clés à 2+ écrivains sur 32 mesurées, profondeur graphe 13, Lighthouse 83/100, axe-core 3 règles violées.

### Phase 3 — passage de relais

Document final à produire après les quatre plans Phase 2. Contiendra : liste des fichiers produits, décisions prises, points en suspens, prochaines actions priorisées. Référence attendue : `audit/PASSAGE-RELAIS-COWORK.md` ou équivalent.

---

## 3. Critères de priorisation (révisés post-pivot)

L'ancien critère du court terme (« Rouges et Jaunes bloquants pour l'amorce des expérimentateurs ET faisables sans refactoring lourd ») était cohérent avec une lecture AQPC-livrable. Après pivot, les critères se précisent en deux axes :

> **Court terme (~14-19 h sur 19 jours)** : actions qui (a) **préservent le fonctionnement quotidien** de Labo Codex pendant que Grégoire boucle son trimestre (corriger 40 productions du 15 au ~19 mai) et (b) **rendent l'app et le dépôt présentables** aux novices qui arriveront le 3 juin. Inclut le fix `eval.productionId`, la documentation publique (`PRIVACY.md`, `INCIDENTS.md`, `DEPLOY.md`, `README.md`), les fixes accessibilité ad hoc, l'alignement vocabulaire UI.
>
> **Moyen terme (~27-39 h sur 14 jours après les évaluations)** : refactoring des 5 god modules identifiés par l'audit (axes 2 + 3) + hygiène structurelle (helpers globaux, `DATA-OWNERSHIP.md`, OpenSSF Scorecard). À conduire principalement entre le 19 mai et le 2 juin, avec débordement possible en Q3 2026 pour les ajustements résiduels.

L'ancienne hypothèse « moyen terme = Q3 2026 » a été révisée : Grégoire est disponible à temps plein, et veut entamer le refactoring avant l'arrivée des novices, dans la zone open du 19 au 23 mai principalement. Les chantiers les plus longs peuvent déborder, sans dommage critique pour les expérimentateurs (les god modules tournent — c'est de la dette interne, pas un bloqueur visible).

---

## 4. Acteurs distincts

Le plan distingue systématiquement trois catégories :

1. **Exécutable par Claude Code** (autonomie technique) : créations et modifications de fichiers, refactorings ciblés avec tests de régression, harmonisations terminologiques. Travail dans des sessions séparées, pas dans la session Cowork (consigne `CONTEXTE-COWORK.md` §6 : « Ne pas modifier le code de Labo Codex pendant cette phase »).
2. **À exécuter par Grégoire** : tests manuels (clavier, VoiceOver Mac, iPad réel), audit de données personnelles (`rapportsBugArchives`, etc.), décisions de pratique pédagogique, validation des refactorings avant merge.
3. **Démarches externes** (délai 2-6 semaines, hors périmètre direct) : avis du responsable institutionnel de la protection des renseignements personnels du Cégep de Drummondville, avis juridique AGPL v3, pen-test professionnel, test utilisateur avec personne en situation de handicap.

---

## 5. Décisions actées pendant les sessions Cowork

| Code | Décision | Date |
|---|---|---|
| D-COW-1 | Correction propre des livrables AQPC sans intégrer le récit méta de la double hallucination (Cowork peut documenter cette histoire ailleurs si pertinent, mais pas dans les livrables AQPC) | mai 2026 |
| D-COW-2 | Inclusion de la formulation « ~50 accès Cloudflare sans feedback » dans 6 fichiers (ADR-008, 04-4-deploy, SUMMARY-internal, SUMMARY-aqpc, SUMMARY-institutional, AUDIT.md) | mai 2026 |
| D-COW-3 | Quota Cloudflare gratuit (50 utilisateurs) saturé — décision sur upgrade payant ou changement de politique reportée au plan court terme (cf. D-CT-1) | mai 2026 |
| D-COW-4 | Analyse des logs Cloudflare reportée (utile pour `PRIVACY.md` mais pas critique pour le 3 juin) | mai 2026 |
| D-COW-5 | Plan Phase 2 segmenté en plusieurs livrables plutôt qu'un seul document fleuve | mai 2026 |
| D-COW-6 | Court terme rédigé en priorité 1 (date AQPC du 3 juin = seule échéance ferme) | mai 2026 |
| D-COW-7 | Pas de livrable AQPC. Pivot du périmètre Phase 2 vers (a) sécurité fonctionnelle pendant évaluations Grégoire, (b) accueil novices au 3 juin, (c) refactoring axes 2 et 3 en moyen terme avec déclenchement avant le 3 juin | 15 mai 2026 |
| D-COW-8 | Renommage de l'ancien `PLAN-COURT-TERME.md` en `PLAN-AQPC.md` (archive). Rédaction d'un nouveau `PLAN-COURT-TERME.md` au scope révisé | 15 mai 2026 |
| D-COW-9 | Création de `audit/refactoring-prep/MODULES-MAP.md` comme annexe technique de découpage des 5 god modules | 15 mai 2026 |
| D-COW-10 | Le bug `evaluation.js:4193` est confirmé par vérification grep. Fix exécuté par Claude Code dans une session séparée, sur `main` directement, avec bump de version Beta 99.42 → 99.43 | 15 mai 2026 |
| D-COW-11 | Ordre de refactoring des god modules : `bilan-reflexif.js` (pilote) → `productions.js` → `trimestre-v2.js` → `profil-etudiant.js` → `evaluation.js` (en dernier, plus risqué) | 15 mai 2026 |
| D-COW-12 | Phase 2 = 4 plans au lieu de 3 (AQPC archive + court + moyen + long) | 15 mai 2026 |

---

## 6. Points en suspens à reprendre

- **Analyse des logs Cloudflare Access** : confirmation du chiffre exact (~50), distribution temporelle des accès, inventaire des données pour `PRIVACY.md`. Effort estimé 30-45 min (Grégoire). À faire avant la rédaction de `PRIVACY.md` (action B.1.b du court terme).
- **Démarche externe à engager au plus tôt** : avis du responsable institutionnel de la protection des renseignements personnels du Cégep de Drummondville (Loi 25, délai 2-6 semaines, conditionne la conformité formelle qui sera affichée dans `PRIVACY.md`).
- **Décision sur le quota Cloudflare** (D-CT-1 du court terme) : upgrade payant, politique de domaine de confiance, ou limitation à 50 personnes. À trancher avant le 3 juin.
- **Adresses courriel des testeurs alpha** (Bruno, Olivier, Jordan, Élise, Stéphane) : à classer comme donnée personnelle dans `PRIVACY.md` (recommandation Cowork : référence non-nominative).
- **Coordination passe 3 ds-update** (D-CT-4 du court terme) : passe 3 du chantier design system exécutée avant le 3 juin ou pas ? Si oui, ~3-4 h économisées sur les actions accessibilité C.3 et C.4.
- **Plan long terme à rédiger** après validation des plans court + moyen. Contiendra notamment : plan Tier 6.5 sur `modalitesEvaluation`, refactoring `reserve.js`, publish/subscribe typé, gouvernance du commun, politique de mise à jour de l'audit.

---

## 7. Pour reprendre une session Cowork

À l'ouverture d'une nouvelle session Cowork :

1. Lire ce document pour reprendre le contexte général.
2. Vérifier l'état des fichiers du plan Phase 2 : `audit/PLAN-AQPC.md` (archive), `audit/PLAN-COURT-TERME.md`, `audit/PLAN-MOYEN-TERME.md`, `audit/refactoring-prep/MODULES-MAP.md`, `audit/PLAN-LONG-TERME.md` (à créer si absent).
3. Vérifier l'avancement effectif des actions courtes (a-t-on corrigé `eval.productionId` ? Créé `PRIVACY.md` ? Refactoré `bilan-reflexif.js` ?). `git log main` et `git log refactor/2026-mai` si la branche existe.
4. Consulter le `CONTEXTE-COWORK.md` à `audit/CONTEXTE-COWORK.md` pour relire la posture attendue (factuelle, sans superlatifs, distinguer faits / inférences / extrapolations, signaler les angles morts).
5. Continuer là où la session précédente s'est arrêtée.

---

## 8. Annexe — Trace des tâches Cowork accomplies

**Phase 1** (interprétation et corrections, sessions de mai 2026) :

- Lire le cadre méthodologique de l'audit (README, PROMPT, gabarit)
- Cartographier la complétude des livrables (8 fichiers de référence identifiés)
- Lire les rapports des six axes plus la synthèse globale
- Vérification factuelle systématique des claims (origine de l'hallucination identifiée dans `docs/MESSAGES_ENSEIGNANTS_H2026.md`)
- Corriger ADR-008 (5 modifications plus une note de révision post-audit)
- Corriger `04-4-deploy.md` (4 modifications plus une note de révision en tête)
- Corriger `03-summary.md` et `04-summary.md` (corrections ponctuelles)
- Corriger `SUMMARY-internal.md` (8 modifications dans le socle technique)
- Corriger `SUMMARY-institutional.md` (4 modifications, note 2 pages)
- Corriger `SUMMARY-aqpc.md` (10 modifications, annexe AQPC 3 juin 2026)
- Corriger `AUDIT.md` (8 modifications, version publique GitHub)
- Insérer la formulation « environ 50 accès Cloudflare sans feedback » dans 6 fichiers
- Vérification finale Phase 1 (grep : zéro occurrence résiduelle des huit patterns problématiques)

**Phase 2** (rédaction des plans, sessions de mai 2026) :

- Rédaction du document de trace (présent fichier `PLAN-PHASE-2-OVERVIEW.md`)
- Rédaction de l'ancien `PLAN-COURT-TERME.md` (orienté AQPC) — renommé `PLAN-AQPC.md` le 15 mai après pivot

**Session du 15 mai 2026** :

- Lecture du `PLAN-PHASE-2-OVERVIEW.md` pour reprendre le contexte
- Réception de la consigne de pivot : pas de livrable AQPC, attaque du moyen terme avec maintien de l'échéance du 3 juin pour l'accueil des novices
- Lecture systématique des documents : `CONTEXTE-COWORK.md`, ancien `PLAN-COURT-TERME.md`, `PROCHAINE-SESSION.md`, `SUMMARY-internal.md`, synthèses d'axes 2, 3, 4, 5, 6
- Vérification factuelle des claims chiffrés du SUMMARY-internal (cf. §2 ci-dessus) — bug `evaluation.js:4193` confirmé, claims globalement crédibles, aucune fabulation détectée
- Renommage de l'ancien `PLAN-COURT-TERME.md` en `PLAN-AQPC.md`
- Cadrage temporel : zone protégée pour les évaluations Grégoire jusqu'au ~22 mai, fenêtre refactoring 19-23 mai, finalisation accueil novices 23 mai - 2 juin
- Scan structurel des 5 god modules (fichiers `audit/refactoring-prep/scan-*.txt`)
- Rédaction de `audit/refactoring-prep/MODULES-MAP.md` (~22 Ko) — cartographie complète des 5 god modules avec frontières fonctionnelles proposées, fonctions top-complexité, états globaux, tests de régression à écrire
- Rédaction du nouveau `audit/PLAN-COURT-TERME.md` (~14 Ko) — sécurité fonctionnelle + accueil novices
- Rédaction du `audit/PLAN-MOYEN-TERME.md` (~14 Ko) — refactoring séquencé des 5 god modules + hygiène structurelle
- Mise à jour du présent document `PLAN-PHASE-2-OVERVIEW.md` pour refléter la structure à 4 plans

**À faire dans les prochaines sessions** :

- Rédiger `audit/PLAN-LONG-TERME.md` après validation des plans court + moyen
- Suivre l'exécution effective des actions courtes (Grégoire / Claude Code)
- Préparer le document de passage de relais (Phase 3)

---

**Fin du document de trace.** Mise à jour à chaque fin de session Cowork.
