# Plan de travail — 26 mai 2026

> **Établi** : 25 mai 2026 fin de journée, par Claude pendant que Grégoire se reposait.
> **Contexte** : Audit annuel LIVRÉ, AQPC 3 juin dans 9 jours, keynote prête + filet captures = pas d'urgence démo. Enjeu réel = solidité de l'app pour les **expérimentateurs post-AQPC**.
> **À valider par Grégoire** au réveil. Plan révisable.

---

## 1. Lecture rapide — les 30 items en un coup d'œil

| Catégorie | Nombre | Items |
|---|---:|---|
| ⚠️ Priorité haute actée par Grégoire | 1 | #282 (modal cours legacy) |
| 🟡 Important pour expérimentateurs post-AQPC | 7 | #278, #280, #281, #282, #283, #279, #273 |
| 🟢 Backlog long terme (utile, pas urgent) | 18 | #2, #18, #33, #35, #36, #47, #140, #177, #178, #233, #240, #241, #245, #257v2.B, #272, #274, #275, #284 |
| 📦 Reporté/calendrier projet acté | 6 | #2, #140 (horizon automne), #268, #269, #270, #271, #33 |
| 📐 Décision UX en attente avant code | 3 | #275, #279, #284 |

(Certains items cumulent plusieurs marqueurs — c'est attendu.)

---

## 2. Classification par état de préparation

### 2.1 Prêts à prendre immédiatement (aucun blocage)

Items où le diagnostic est clair, l'effort estimé, et aucune décision en amont n'est due.

| # | Titre | Effort | Pourquoi maintenant ? |
|---|---|---|---|
| **#278** | Bilan réflexif scroll reset | ~20 min | Bug visible, fix recommandé identifié (scroll explicite dans `afficherVue`). |
| **#281** | Notifications HTML custom → API unifiée | ~30 min | 1 site identifié + audit grep. Cohérence visuelle des toasts. |
| **#280** | Fusion « Capturer maintenant » + « Reconstruire l'historique » | 1 h - 1 h 30 | Résout le bug #116 (snapshots manuels 4 facettes) en un coup. Bloqueur amont : confirmer le multi-groupes-cours. |
| **#282** | Migration `cours.js` legacy → V2 | 5-7 h | **Priorité haute actée.** P1-P4 livrés. Post-mortem du 23 mai donne la marche à suivre. À faire en worktree dédié, pas en bout de session. |

**Stratégie suggérée** : commencer par les trois petits (#278, #281, #280) — environ 2 h cumulées — pour avoir 3 cases cochées rapides et 1 bug utilisateur visible en moins. Garder #282 pour une session dédiée plus reposée.

### 2.2 Demandent une décision UX de Grégoire avant code

| # | Titre | Décision attendue |
|---|---|---|
| **#279** | 3 champs production (description, format, remise) | Capture de référence : placement exact des champs + type d'input (textarea libre ? structurée ?). |
| **#284** | Titres + sous-titres descriptifs des pages | Ajouter h1 partout vs accepter certaines pages plein écran ? |
| **#275** | Rétroactions visuelles enrichies | Choix conceptuel : phrases complètes par critère ? génération assistée depuis contexte ? éditable par production ? |

**Stratégie** : ces 3 items méritent d'être posés dans une session de discussion (pas de code), peut-être avec Cowork. Pas demain matin si la tête est encore lourde.

### 2.3 Chantiers moyens à lourds (à planifier sur plusieurs séances)

| # | Titre | Effort | État |
|---|---|---|---|
| **#272** | Machine à états chargement éval | Plusieurs séances | Plans détaillés existent. Pas urgent tant que les correctifs tactiques tiennent. |
| **#257 v2.B** | Réserve mode consultation namespace | 5-6 h | Utile pour démos passées, adaptation A24→H26. |
| **#273** | Évaluations démo travaux réels anonymisés | 1-2 séances | Consentement obtenu. Visée double : valider flux + exemples concrets pour nouveaux utilisateurs. Pertinent pour expérimentateurs. |
| **#177 + #178** | Import dossier Lea + assemblage multi-images | 1-2 séances | Phase 1 Module Travaux en suspens depuis mars. À reprendre quand Grégoire le veut. |

### 2.4 Items du backlog long terme (utiles, sans urgence)

Listés ici pour mémoire mais à ne pas prendre cette semaine sauf demande explicite.

- **#18** Tooltips déploiement progressif (chantier continu).
- **#283** Harmonisation responsive sidebar mobile (3 options à arbitrer).
- **#240** Tampon visuel pour jetons sur travaux annotés.
- **#233** Simplifier flux Codex Mac+iPad.
- **#47** Mot de passe optionnel sauvegarde (à reconsidérer après Voûte Phase 1).
- **#35** Import historique H2024 + **#36** Rapport comparatif inter-trimestres (potentiel communication AQPC si fait).
- **#245** Interventions N3 progression temporelle + **#241** Impact jetons sur P.

### 2.5 Items actés post-AQPC ou plus tard

- **#274** Cartes mentales démo (été 2026, prép phase expérimentateurs).
- **#140** Organisateur layout 2 colonnes (automne 2026, Rencontre 5 CoP).
- **#268-271** Rythme Phase 5 raffinements (selon usage).
- **#33** Mode Tableur (POST v1.0).
- **#2** Guide PDF (fusionné avec matériel CoP, 8 rencontres sept 2026 → avril 2027).

---

## 3. Recommandation pour la prochaine session

Si tu arrives reposé et que tu veux du fait visible rapidement :

**Option A — 2 h de petits chantiers nets (recommandée)**
- #278 (20 min) → #281 (30 min) → #280 (1 h - 1 h 30).
- Sortie : 3 bugs/incohérences en moins, sentiment de progression, app un poil plus polie pour les expérimentateurs.

**Option B — Session dédiée à #282** (4-7 h)
- Le chantier prioritaire acté. Worktree dédié. Suivre le post-mortem du 23 mai dans BACKLOG-ARCHIVE.md (snippet recovery + P1-P4 prérequis déjà livrés).
- Sortie : modal Bibliothèque cours fonctionnelle, dette legacy `listeCours` éliminée, zéro-dette CLAUDE.md respecté.

**Option C — Session de décisions (sans code)**
- Trancher #279, #284, #275 avec Cowork si besoin. Pose les fondations pour les coder ensuite proprement.
- Sortie : 3 décisions UX consignées dans le BACKLOG, prêtes à être implémentées sans hésitation à la session suivante.

**Option D — Reprendre #273 (évaluations démo anonymisées)**
- Si tu veux préparer du contenu utile pour la démo AQPC et les expérimentateurs.
- Anonymiser 2-3 dossiers complets + intégrer au pack démo. Probablement 1-2 séances.

À toi de choisir selon ton énergie au réveil. Aucune obligation.

---

## 4. Bugs SUIVI-BUGS ouverts non listés ci-dessus

Pour mémoire (ils vivent dans `Retours des testeurs/SUIVI-BUGS.md` selon SESSION.md §3) :
- **#114** CSP Cloudflare prod (app.codexnumeris.org)
- **#115** `icon-files.svg` 404 dans modal « Plusieurs fichiers par étudiant »
- **#116** Snapshots manuels 4 facettes (sera **résolu gratuitement par #280** — voir ci-dessus)
- **#118** Layout overflow Trimestre
- **#121** Bouton fantôme Tirage

Probablement à classer ensemble dans une mini-session « tri bugs ouverts » de 30 min : pour chacun, décider entre `fix maintenant`, `documenter et reporter`, ou `wontfix`.

---

## 5. Ce qui n'est PAS dans ce plan

- Les actions UI GitHub (Allow Auto-merge fait ce matin ✅ ; reste Branch Protection + 4 PRs Dependabot — cf. SESSION.md §3 priorité 1).
- Le chantier zéro-dette CodeQL (~80 alertes) — optionnel, post-AQPC.
- Les 5 chantiers que tu as mentionnés en session aujourd'hui : icônes SVG, badge « expérimental » dans le Labo, hiérarchie outils accompagnement, mise à jour backlog (✅ fait), bugs SUIVI-BUGS (cf. §4 ci-dessus). **À inscrire dans le BACKLOG comme nouveaux items si tu décides de les garder** — j'ai laissé volontairement vide tant que tu n'avais pas tranché.

---

## 6. Note méthodologique

CLAUDE.md du projet pose le principe **« pas de report »** (zéro-dette). Le plan ci-dessus mentionne « post-AQPC » uniquement pour les items DÉJÀ marqués ainsi par Grégoire dans le BACKLOG d'origine ou par calendrier projet (cohorte CoP, calendrier d'automne). Aucun nouveau marquage « à reporter » n'a été créé. Les items « long terme » sont nommés ainsi factuellement (effort important, pas de signal d'urgence), pas comme un report officiel.
