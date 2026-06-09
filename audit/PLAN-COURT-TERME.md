# Plan court terme — du 15 mai au 2 juin 2026

**Date de rédaction** : 2026-05-15
**Échéance** : 2026-06-03 (accueil des novices, et non plus livraison AQPC)
**Document parent** : `audit/PLAN-PHASE-2-OVERVIEW.md`
**Documents apparentés** : `audit/PLAN-AQPC.md` (archive du plan pré-pivot), `audit/PLAN-MOYEN-TERME.md` (refactoring axes 2/3)
**Source des recommandations** : `audit/reports/SUMMARY-internal.md` section « Recommandations consolidées priorisées »

---

## 1. Objet et périmètre

Ce plan court terme couvre les 19 jours qui séparent la session Cowork du 15 mai et le 3 juin 2026 (date d'arrivée des novices invités). Il poursuit **deux objectifs en parallèle** :

1. **Préserver le fonctionnement quotidien de Labo Codex** pour permettre à Grégoire de boucler son trimestre — annoter 40 productions, évaluer, produire les rétroactions, construire la note finale. L'app doit rester stable jusqu'au 22-23 mai (fin estimée des évaluations).
2. **Préparer l'accueil des novices au 3 juin** — l'app et le dépôt GitHub doivent être présentables et défendables face à des collègues qui débarquent sans contexte préalable.

**Ce qui est dans le périmètre du court terme** :
- Fix du bug fonctionnel actif `evaluation.js:4193` (`eval.productionId` → `evaluation.productionId`).
- Documentation publique manquante : `PRIVACY.md`, `INCIDENTS.md`, `DEPLOY.md`, `INFO-ELEVES.md`, refonte `README.md`.
- Corrections ad hoc d'accessibilité (axe 6 priorité haute) : `aria-label`, `for=`, contraste, `prefers-reduced-motion`, `prefers-contrast`, `aria-live`.
- Alignement du vocabulaire UI sur la posture descriptive (T-L2 à T-L7) + retrait des 4 fonctions de code mort alarmiste.
- Audit de `rapportsBugArchives` (T-D5, ~126 Ko, probable PII).
- Tests manuels d'accessibilité (Grégoire) : 5 parcours clavier + VoiceOver Mac, 7 catégories iPad réel.
- Démarche externe : avis du responsable institutionnel de la protection des renseignements personnels (Loi 25).

**Ce qui est hors périmètre du court terme** (et déplacé vers `PLAN-MOYEN-TERME.md`) :
- Refactoring des 5 god modules (`evaluation.js`, `productions.js`, `profil-etudiant.js`, `trimestre-v2.js`, `bilan-reflexif.js`). Voir `audit/refactoring-prep/MODULES-MAP.md`.
- Hygiène OpenSSF Scorecard étendue (`SECURITY.md`, Dependabot, Branch Protection, GitHub Actions tests + CodeQL).
- Conformité Loi 25 étendue (ÉFVP formalisée, effacement par étudiant, politique de rétention formelle).

**Effort total estimé** : 14 à 19 heures côté Cowork/Claude Code + 3 h 30 de tests manuels Grégoire + démarche externe (délai 2-6 semaines, effort Grégoire ~30 min de rédaction).

---

## 2. Calendrier proposé

Grégoire est disponible à temps plein (cours finis hier, 14 mai). Budget cumulé probable : ~60-80 h sur 19 jours, partagé entre corrections d'étudiants, refactoring moyen terme, court terme, et démarches.

| Période | Travail Grégoire | Travail Cowork / Claude Code | Zone protégée |
|---|---|---|---|
| **15-19 mai** (semaine 1) | Évaluation des 40 productions (~5 h 20 effectives, ~2 h/jour) | Cowork rédige les plans + ce document. Claude Code corrige le bug `eval.productionId`. Ébauche `PRIVACY.md` (rédaction préalable à l'analyse des logs Cloudflare). Refactoring de `bilan-reflexif.js` (couplage faible, module pilote — démarrable en parallèle si tests verts). | `evaluation.js`, `productions.js`, `profil-etudiant.js`, `trimestre-v2.js` — **interdiction de modification sans backup Codex préalable et tests de régression verts**. |
| **19-23 mai** (semaine 2) | Évaluations terminées. Tests manuels d'accessibilité (~3 h 30). Validation des refactorings. | Refactoring intensif des 4 god modules restants (cf. `PLAN-MOYEN-TERME.md`). Documentation publique en finalisation. | Aucune. |
| **23 mai - 2 juin** (semaine 3) | Tests fonctionnels post-refactoring. Préparation présentation 3 juin (hors périmètre Cowork). | Accessibilité, vocabulaire UI, audit `rapportsBugArchives`, finalisation `README.md` et `DEPLOY.md`, dernières corrections issues des tests manuels. | Aucune. |

**Démarche externe à engager immédiatement** : l'avis du responsable institutionnel PRP (Loi 25) a un délai de réponse de 2-6 semaines. Si Grégoire envoie la demande la semaine du 15 mai, la réponse arrive entre mi-juin et fin juin. Hors fenêtre court terme, mais conditionne la version finale de `PRIVACY.md`.

---

## 3. Section A — Sécurité fonctionnelle pendant les évaluations (15-22 mai)

Objectif : aucune régression sur l'usage quotidien de l'app pendant que Grégoire boucle son trimestre.

| # | Action | Acteur | Effort | Critère de validation |
|---|---|---|---:|---|
| A.1 | Corriger `evaluation.js:4193` (`eval.productionId` → `evaluation.productionId`) | Claude Code (session séparée) | 5 min | Le filtre par production dans la liste des évaluations retourne désormais les bons résultats. Test manuel par Grégoire. |
| A.2 | Backup Codex avant A.1 | Grégoire | 2 min | Export Codex data daté avant le commit du fix. |
| A.3 | Pas de merge `audit/2026-mai` ni `ds-update/2026-mai` sur `main` pendant la zone protégée | Grégoire (politique) | — | Vérification hebdomadaire de `git log main`. |
| A.4 | Backups Codex quotidiens pendant la zone protégée | Grégoire | 2 min/jour | 5-7 exports Codex data datés entre le 15 et le 22 mai. |
| A.5 | Vigilance refactoring : pendant 15-19 mai, ne pas refactorer `evaluation.js`, `productions.js`, `profil-etudiant.js`, `trimestre-v2.js` sans backup préalable + tests de régression Vitest verts | Claude Code | — | Cf. `PLAN-MOYEN-TERME.md` §3. |

**Critère d'arrêt** : si Grégoire signale un bug fonctionnel pendant ses corrections (autre que `eval.productionId`), **arrêter tout autre travail** et corriger en priorité. Les retours testeurs (et l'auto-testeur Grégoire) passent avant le backlog.

---

## 4. Section B — Documentation publique (échelonnée du 15 mai au 2 juin)

Objectif : qu'un novice qui découvre le repo GitHub ou l'app le 3 juin trouve une présentation cohérente, à jour, défendable.

### B.1 PRIVACY.md (Loi 25 — Rouge documentaire à fermer)

| # | Action | Acteur | Effort | Critère de validation |
|---|---|---|---:|---|
| B.1.a | Analyse des logs Cloudflare Access — confirmer le chiffre ~50, distribution temporelle, inventaire des données conservées par Cloudflare (emails, IP, horaires) | Grégoire | 30-45 min | Données chiffrées documentées dans une note interne, prêtes à intégrer dans `PRIVACY.md`. |
| B.1.b | Rédiger `PRIVACY.md` à la racine du dépôt | Claude Code (rédige) + Grégoire (valide) | 3 h | Sections : (a) données collectées, (b) mode hors-ligne, (c) anonymisation interne, (d) Cloudflare Access (cookies, OTP, logs), (e) chiffrement au repos (FileVault), (f) durée de conservation, (g) droits Loi 25 (accès, rectification, effacement). Référencé depuis `README.md`. |

### B.2 INCIDENTS.md + Information aux élèves

| # | Action | Acteur | Effort | Critère de validation |
|---|---|---|---:|---|
| B.2 | Créer `INCIDENTS.md` (gabarit registre + procédure) | Claude Code (rédige) + Grégoire (valide) | 1 h | Gabarit : date, nature, données impactées, mesures prises. Procédure de signalement (qui contacter, dans quel délai). Conforme art. 63.5 Loi 25. |
| B.3 | Rédiger texte « Information aux élèves » type | Claude Code (rédige) + Grégoire (valide et adapte) | 30 min | Texte court adaptable aux cégeps. À remettre aux élèves en début de trimestre. Précise : outil de suivi utilisé, données conservées, droit d'effacement. |

### B.3 DEPLOY.md + netlify.toml

| # | Action | Acteur | Effort | Critère de validation |
|---|---|---|---:|---|
| B.4 | Créer `DEPLOY.md` à la racine | Claude Code (rédige) + Grégoire (fournit captures et config Cloudflare) | 2 h | Sections : Netlify + Cloudflare Access + DNS, procédure de déploiement pas-à-pas, config Cloudflare Access, liste utilisateurs autorisés + procédure ajout/retrait, rollback, récupération en cas de perte d'accès. |
| B.5 | Adopter `netlify.toml` versionné | Claude Code | 30 min | Fichier `netlify.toml` à la racine avec `[build]`, `[[redirects]]`, `[[headers]]` (consolide `_headers`). Aucune env var sensible. |

### B.4 README.md refonte

| # | Action | Acteur | Effort | Critère de validation |
|---|---|---|---:|---|
| B.6 | Refondre `README.md` à la racine | Claude Code (rédige) + Grégoire (valide) | 1 h 30 | Sections : version Beta courante, badge double licence (AGPL v3 + CC BY-NC-SA 4.0), statistiques actuelles (129 modules JS, ~175 000 LOC brutes hors démo, ~2 815 commits), retrait des 8 références mortes, pointeurs vers `docs/adr/`, `docs/00-START-HERE.md`, `PRIVACY.md`, `DEPLOY.md`, `AUDIT.md`. |

### B.5 Hygiène documentaire

| # | Action | Acteur | Effort | Critère de validation |
|---|---|---|---:|---|
| B.7 | Mettre à jour la version dans `CLAUDE.md` (Beta 99.11 → version courante post fix `eval.productionId`) | Claude Code | 5 min | `CLAUDE.md` aligné sur `version.json`. |
| B.8 | Ajouter référence à `docs/adr/` dans `docs/00-START-HERE.md` | Claude Code | 5 min | Le routeur d'onboarding pointe vers les 12 ADRs créés en mai 2026. |
| B.9 | Corriger triple décalage « CC BY-SA » → « CC BY-NC-SA » | Claude Code | 10 min | Dans `audit/04-sustainability/README.md`, `audit/package.json` description, libellé d'ADR-009 prescrit. Vérification par `grep -r 'CC BY-SA' --include='*.md'` : zéro occurrence hors contexte historique. |

**Sous-total Section B** : ~9 h.

---

## 5. Section C — Accessibilité ad hoc (axe 6)

Objectif : faire passer l'axe 6 du Rouge léger au Vert ou Jaune solide. Beaucoup de ces actions peuvent être couvertes par la passe 3 du chantier `ds-update/2026-mai` si Grégoire choisit de l'exécuter (cf. `audit/reports/CROSS-REF-ds-update-passe2.md`).

| # | Action | Acteur | Effort | Couvert par ds-update passe 3 ? |
|---|---|---|---:|---|
| C.1 | Corriger T-A1 (`#btn-codex` sans nom accessible) — ajouter `aria-label="Codex"` | Claude Code | 3 min | Non |
| C.2 | Corriger T-A2 (`#selectGroupeCoursHeader` sans label) — ajouter `for="selectGroupeCoursHeader"` | Claude Code | 4 min | Non |
| C.3 | Corriger T-A3 (contraste insuffisant, 17 nodes page d'accueil) — assombrir variable CSS grise | Claude Code ou ds-update | 1-2 h | **Oui** (01a:Q11) |
| C.4 | Auditer les 22 `outline: none` sans alternative `:focus-visible` apparente | Claude Code ou ds-update | 2-3 h | **Oui** (cascade D-D4 + 01a:Q12) |
| C.5 | Ajouter `@media (prefers-reduced-motion: reduce)` global | Claude Code | 1 h | Partiel (2 sites acquis) |
| C.6 | Ajouter `@media (prefers-contrast: more)` | Claude Code | 1 h | Non |
| C.7 | Ajouter `aria-live` / `role="alert"` sur notifications | Claude Code | 30 min | Non |
| C.8 | Tests manuels accessibilité 6.2 (5 parcours clavier + VoiceOver Mac, 8 vérifications globales) | Grégoire | 2 h | — |
| C.9 | Tests manuels 6.3 (7 catégories sur iPad réel : viewport, touch targets, interactions tactiles, clavier externe, performance, stockage IndexedDB Safari, multitâche) | Grégoire | 1 h 30 | — |

**Sous-total Section C** : ~6 à 7 h côté code + 3 h 30 côté Grégoire. Si passe 3 ds-update exécutée, ~3 à 4 h économisées sur C.3 et C.4.

---

## 6. Section D — Vocabulaire UI et hygiène données

Objectif : aligner le vocabulaire UI sur la posture descriptive revendiquée (axe 1.3 Jaune → Vert) et auditer les données sensibles identifiées par l'axe 5.3.

| # | Action | Acteur | Effort | Critère de validation |
|---|---|---|---:|---|
| D.1 | Remplacer les 6 chaînes UI alarmistes / prédictives (T-L2 à T-L7) : « Alerte : Risque de décrochage », « Intelligence prédictive », « Indice R », « Indices prédictifs A-C-P », « Découpler P et R », FAQ obsolète | Claude Code (propose) + Grégoire (valide les substitutions) | 3-5 h | Grep des 6 chaînes sources : zéro occurrence dans le code applicatif. Substitutions cohérentes avec la matrice canonique de `SKILL_RaI.md`. |
| D.2 | Retirer 4 fonctions de code mort alarmiste : `calculerRisqueEchec`, `obtenirClasseRisque`, `calculerNiveauRaI`, `afficherAlertesPrioritaires` | Claude Code (audit call-sites d'abord) | 30 min | Grep de chaque nom : zéro référence avant suppression. Si référence trouvée, refactoring de la référence d'abord. |
| D.3 | Trancher zone grise `interpreterMobilisation` (« Assiduité critique », « Complétion critique ») | Grégoire (décision) + Claude Code (exécution) | 30 min | Soit alignement sur la matrice descriptive, soit conservation documentée par commentaire. |
| D.4 | Auditer `rapportsBugArchives` (clé localStorage 126 Ko, probable PII) | Grégoire (lecture sensible) + Claude Code (audit technique) | 2 h | Identifier (a) volume réel, (b) nature exacte du contenu (captures avec noms d'étudiants ? prénoms testeurs ?), (c) politique de rétention. Documenter le résultat dans `PRIVACY.md`. |

**Sous-total Section D** : ~6 à 8 h.

---

## 7. Section E — Démarches externes (à engager immédiatement)

| # | Action | Acteur | Effort Grégoire | Délai externe |
|---|---|---|---:|---|
| E.1 | Demander un avis au responsable institutionnel de la protection des renseignements personnels du Cégep de Drummondville (Loi 25, art. 8 et suivants) | Grégoire | 30 min de rédaction | 2-6 semaines de délai de réponse |

Effet : sans cet avis, Labo Codex peut être utilisé en pratique individuelle (FileVault + hors-ligne suffit techniquement). L'adoption institutionnelle reste fragilisée tant que l'avis n'est pas obtenu. À engager **maintenant** pour que la réponse arrive avant la rentrée d'automne 2026.

---

## 8. Décisions à trancher par Grégoire avant exécution

| Code | Décision | Effort de la décision | Impact si non tranchée |
|---|---|---:|---|
| D-CT-1 | Quota Cloudflare gratuit saturé. Options : (a) upgrade payant, (b) politique « domaine de confiance » sans liste blanche nominative, (c) garder liste actuelle et purger au cas par cas, (d) limiter prochaine vague à 50 personnes | À tester pendant juin si décision (c) ou (d). Sinon décision en amont du 3 juin | Risque : pas de marge pour les expérimentateurs de juin |
| D-CT-2 | Adresses courriel des testeurs alpha dans `PRIVACY.md` : option nominative (transparence max) ou non-nominative (référence générique) | 10 min de discussion | Recommandation Cowork : non-nominative (les noms restent dans le brouillon non public `docs/MESSAGES_ENSEIGNANTS_H2026.md`) |
| D-CT-3 | Statut des 12 ADRs rétroactifs : (a) « Acté rétroactivement », (b) « Accepted » (Nygard standard), (c) « Accepté (acté rétroactivement le 14 mai 2026 sur la base de l'usage existant) » | 5 min de décision | Recommandation Cowork : option (c) |
| D-CT-4 | Passe 3 ds-update : exécutée avant le 3 juin ou pas ? | Décision à prendre en amont | Si oui, ~3-4 h économisées sur C.3 et C.4 |
| D-CT-5 | Approche de retrait des 4 fonctions de code mort alarmiste (D.2) : suppression simple ou audit cross call-sites obligatoire ? | 5 min de décision | Recommandation Cowork : audit cross call-sites d'abord (cf. CLAUDE.md « audit des régressions latentes ») |

---

## 9. Critères de fin du plan court terme

Le plan court terme est considéré terminé quand les conditions suivantes sont réunies, vérifiables au matin du 3 juin 2026 :

1. `evaluation.js:4193` corrigé, commit poussé sur `main`, validation fonctionnelle par Grégoire (filtre par production opérationnel).
2. `README.md`, `PRIVACY.md`, `INCIDENTS.md`, `DEPLOY.md`, `INFO-ELEVES.md` (ou nom équivalent) existent à la racine du dépôt et sont à jour.
3. `netlify.toml` versionné. `CLAUDE.md` aligné sur la version courante. `docs/00-START-HERE.md` pointe vers `docs/adr/`.
4. Vocabulaire UI aligné sur la posture descriptive : zéro chaîne alarmiste / prédictive dans le code applicatif. Code mort alarmiste retiré (4 fonctions).
5. Accessibilité : 0 violation critical axe-core, focus visible sur chaque vue, `prefers-reduced-motion` et `prefers-contrast` respectées, `aria-live` sur notifications.
6. Tests manuels d'accessibilité 6.2 et 6.3 exécutés par Grégoire, statuts définitifs documentés.
7. Audit de `rapportsBugArchives` complété, politique de rétention documentée dans `PRIVACY.md`.
8. Triple décalage « CC BY-SA » → « CC BY-NC-SA » corrigé.
9. Demande d'avis au responsable institutionnel PRP envoyée (la réponse arrivera après le 3 juin — c'est attendu).
10. `PLAN-PHASE-2-OVERVIEW.md` mis à jour avec une section « Bilan court terme » récapitulant ce qui a été fait, ce qui reste, ce qui est reporté au moyen ou long terme.

**Hors critères de fin** (parce que déplacés vers le moyen terme) : refactoring des god modules. Le plan court terme est considéré terminé indépendamment du statut du refactoring axes 2/3, dont l'avancement sera tracé dans `PLAN-MOYEN-TERME.md`.

---

## 10. Articulation avec les autres documents

- **`audit/PLAN-AQPC.md`** : archive du plan pré-pivot. Contient le cadrage initial qui supposait des livrables AQPC (annexe technique, billet de blog, support de présentation). Conservé comme trace de la phase d'interprétation des livrables Claude Code.
- **`audit/PLAN-MOYEN-TERME.md`** : refactoring des 5 god modules (axes 2 et 3), avec calendrier articulé sur la zone protégée des évaluations Grégoire. Référence `audit/refactoring-prep/MODULES-MAP.md` pour les détails.
- **`audit/PLAN-LONG-TERME.md`** (à rédiger plus tard) : trajectoire v1.0 et commun pédagogique.
- **`audit/PLAN-PHASE-2-OVERVIEW.md`** : doit être mis à jour pour refléter la structure à 4 plans (AQPC archive + court + moyen + long) au lieu de 3.
- **`audit/reports/SUMMARY-internal.md`** : source des constats et des recommandations consolidées.

---

**Fin du plan court terme.** Document à mettre à jour si une décision de Grégoire (section 8) modifie le périmètre, ou si un retour de testeur déclenche une priorité absolue.
