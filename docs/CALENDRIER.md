# Calendrier de pilotage — Labo Codex

> **Type de document** : calendrier de référence temporel.
>
> **Première version** : 11 mai 2026.
>
> **Acteur principal** : Grégoire Bédard. Mises à jour par Claude au besoin lors des sessions.
>
> **Rôle de ce document** : répondre à la question « quand » pour les chantiers Labo Codex sur la période mai 2026 → avril 2027. Complète `BACKLOG.md` (qui répond à « quoi faire ») et `DECISIONS-ARCHITECTURALES-2026-05-11.md` (qui répond à « pourquoi tel choix »). Sert de **point d'ancrage** quand Grégoire reprend Labo Codex après une période sur autre chose, et de référence pour les sessions IA qui doivent situer leur travail dans le temps.
>
> **Granularité** : vue mensuelle pour l'ensemble de la période, vue hebdomadaire détaillée pour le mois en cours. À mettre à jour hebdomadairement sur la zone active.

---

## Table des matières

1. [Vue d'ensemble (haut niveau)](#1-vue-densemble-haut-niveau)
2. [Jalons fermes](#2-jalons-fermes)
3. [Mai 2026 — Sprint pré-colloque (zone active hebdomadaire)](#3-mai-2026--sprint-pré-colloque-zone-active-hebdomadaire)
4. [Juin 2026 — Colloque et bascule](#4-juin-2026--colloque-et-bascule)
5. [Juillet 2026 — Phase expérimentateurs + préparation cohorte](#5-juillet-2026--phase-expérimentateurs--préparation-cohorte)
6. [Août 2026 — Préparation finale cohorte](#6-août-2026--préparation-finale-cohorte)
7. [Septembre 2026 → Avril 2027 — Cohorte CoP, 8 rencontres mensuelles](#7-septembre-2026--avril-2027--cohorte-cop-8-rencontres-mensuelles)
8. [Suivi des chantiers transversaux](#8-suivi-des-chantiers-transversaux)
9. [Risques et points d'attention](#9-risques-et-points-dattention)
10. [Procédure de mise à jour du calendrier](#10-procédure-de-mise-à-jour-du-calendrier)
11. [Annexes](#11-annexes)

---

## 1. Vue d'ensemble (haut niveau)

| Mois | Phase principale | Priorités | Jalons |
|---|---|---|---|
| **Mai 2026** | Sprint pré-colloque | Stabilité, sécurité, ergonomie, on-boarding, ultrareviews | Démarches G1-G6 initiées. Décisions architecturales actées. |
| **Juin 2026** | Colloque + bascule | Présentation AQPC, puis congé | 🟥 **Atelier AQPC le 3 juin 13h45**. Congé semaine du 8 juin. |
| **Juillet 2026** | Expérimentateurs (libre) + préparation | Publication infrastructure publique. Préparation matériel pédagogique. Code Voûte Phase 1 démarre. | Cloudflare/Netlify en ligne. Discussions CoP avancent. |
| **Août 2026** | Préparation finale cohorte + pilote Voûte | Confirmation cohorte. Finalisation matériel. Recettes finales. Test Voûte signature+TOFU avec 2-3 collègues. | Composition cohorte arrêtée. Date Rencontre 1 fixée. 🟦 Ouverture pilote restreinte Voûte. |
| **Sept 2026** | Rencontre 1 — Outiller son regard | Animation + observation | 🟦 Rencontre 1 |
| **Oct 2026** | Rencontre 2 — Évaluer et donner de la rétroaction | Animation + observation | 🟦 Rencontre 2 |
| **Nov 2026** | Rencontre 3 — Lire les données et dépister | Animation + observation | 🟦 Rencontre 3 |
| **Déc 2026** | Rencontre 4 — S'évaluer comme enseignant | Animation + bilan trimestre 1 | 🟦 Rencontre 4. Bilan automne. |
| **Jan 2027** | Rencontre 5 — Aligner sa pratique | Bascule vers « Transformer » | 🟦 Rencontre 5 |
| **Fév 2027** | Rencontre 6 — Construire la note autrement | Animation + observation + première utilisation pédagogique Voûte | 🟦 Rencontre 6. Première utilisation Voûte par la cohorte (partage PAN). |
| **Mars 2027** | Rencontre 7 — Appliquer le modèle RàI | Animation + observation | 🟦 Rencontre 7 |
| **Avril 2027** | Rencontre 8 — Évaluer sa pratique et le laboratoire | Bilan cycle complet + bilan Voûte cohorte | 🟦 Rencontre 8. Bilan formation. Bilan usage Voûte. |

**Légende des couleurs** :
- 🟥 Jalon ferme externe (date imposée, ne se déplace pas)
- 🟦 Jalon ferme interne (date prévue, peut bouger de quelques jours)
- 🟨 Échéance interne flexible
- 🟪 Jalon conditionné (date non fixée, dépend d'une décision externe)

---

## 2. Jalons fermes

Événements à dates fixes ou quasi-fixes. Tout le calendrier s'articule autour de ces points.

### 🟥 Jalons externes (dates imposées)

- **Mardi 2 juin 2026 19h30 → Vendredi 5 juin 2026 12h15** — Colloque AQPC 2026, 45e édition. Centrexpo Promutuel Assurance, Drummondville. 1750 congressistes attendus.
- **Mercredi 3 juin 2026, 13h45-14h45** — **Atelier Grégoire** : « Des micro-données pour éclairer l'intervention — une application de suivi des apprentissages ». Salle D. 33 places. **C'est le jalon le plus structurant du semestre.**

### 🟦 Jalons internes (dates prévues, à confirmer)

- **Semaine du 8 juin 2026** — Congé de Grégoire (1 semaine, immédiatement après le colloque).
- **Mi-juin 2026** — Reprise temps partiel. Démarrage phase expérimentateurs.
- **Mi à fin août 2026** — Confirmation finale de la composition de la cohorte. Date Rencontre 1 arrêtée.
- **Fin août 2026** — **Ouverture pilote restreinte Voûte** : Grégoire + 2-3 collègues de confiance, partage par fichier signé (signature ECDSA + TOFU testés en grandeur nature). Pas de serveur encore (D1 toujours en attente). Test du parcours utilisateur complet : génération paire de clés, signature, export `.lcz`, import, vérification, modération manuelle.
- **Février 2027 — Rencontre 6** — Première utilisation pédagogique de la Voûte par la cohorte (partage de PAN entre participants).
- **Avril 2027 — Rencontre 8** — Bilan d'usage Voûte par la cohorte sur le cycle complet.
- **Septembre 2026 → Avril 2027** — 8 rencontres CoP, une par mois. Dates précises à fixer par les organisateurs de la CoP (en discussion en mai 2026).

### 🟪 Jalons conditionnés (dates non fixées, dépendent de décisions externes)

- **Ouverture multi-cégep Voûte** — conditionnée par décision D1 (architecture infrastructure) + démarches G4 (hébergement) et G6 (continuité). Probablement automne 2026 ou hiver 2027 si les consultations avancent. À matérialiser quand les conditions seront réunies.
- **Publication codex data anonymisé** — conditionnée par démarches G1 (avis Loi 25) et G2 (CER consentement étudiant). Probablement après le cycle pédagogique complet (printemps-été 2027) si les avis sont favorables.

### 🟨 Échéances internes (objectifs Grégoire)

- **Avant le 3 juin** — App stable, sécurisée, ergonomique, on-boarding fonctionnel. Présentable à l'AQPC.
- **Avant fin juin** — Infrastructure publique Cloudflare/Netlify opérationnelle pour la phase expérimentateurs.
- **Avant fin juillet** — Matériel pédagogique Rencontre 1 ébauché.
- **Avant fin août** — Matériel pédagogique Rencontre 1 finalisé. Matériel Rencontre 2 ébauché.
- **Avant chaque rencontre mensuelle** — Matériel pédagogique finalisé 1 semaine avant. Rencontre du mois suivant ébauchée.

---

## 3. Mai 2026 — Sprint pré-colloque (zone active hebdomadaire)

**Période** : 11 mai → 1er juin 2026.
**Priorités** : stabilité, sécurité (intégration décisions 11 mai), ergonomie, on-boarding, ultrareviews.
**Objectif** : présenter une app solide au colloque AQPC.

### Stratégie ultrareviews pré-colloque (plan acté 11 mai 2026, fin de journée)

**Constat** : le Lot 4a sur `evaluation-jetons.js` (11 findings réels, 1-2 j de fix) est représentatif. Un ultrareview = 1-2 jours de fix derrière. Cibler 2 modules max avant colloque pour rester focus sur Défense E + présentation AQPC.

**Critères de sélection** :
1. Modules **démontrés au colloque** (forte exposition publique)
2. Modules **récemment refactorés** ou **jamais audités**
3. **Safe-trimestre** : audit n'impacte pas les notes actives (sinon reporter post-trimestre)

**2 ultrareviews planifiés pré-colloque** :

| Module | Lignes | Pourquoi | Semaine |
|---|---|---|---|
| `js/codex.js` | 2662 | Démo Codex au colloque, jamais audité, format auto-descriptif crucial pour Voûte | 12-17 mai |
| `js/travaux-export-pdf.js` + `js/travaux-annotation.js` | 1207 + 3144 | Démo annotation/PDF AQPC, pipeline fragile, jamais audité ensemble | 18-24 mai |

**Reporté post-trimestre** (touchent notes en cours, risque de bloquer l'utilisateur) :
- `js/indices.js` (Lot 3 déjà planifié — `Rapports/ultrareview-lot-3-indices.md`)
- `js/evaluation.js` (~3000 l., module central des notes)
- `js/pratiques-gestion.js` (refactorisé 11 mai, laisser décanter)
- `js/interventions.js` (refonte 11 avril, peut être audité plus tard sans urgence)

**Pratique organisationnelle pour chaque ultrareview** :
1. **Lancer lundi/mardi** — laisse 3-4 jours pour fixer dans la semaine.
2. **Toujours sur branche dédiée** (`feature/ultrareview-<module>-<date>`) — pattern Lot 4a.
3. **Rapport dans `Rapports/ultrareview-<module>-<date>.md`** — findings classés Critical / High / Medium / Low / Nit.
4. **Trier les findings selon risque trimestre** :
   - **Fixe maintenant** : échappement HTML, code mort, refactors sans changement de comportement, garde-fous null, console.log de debug.
   - **Diffère après trimestre** : changements d'algorithme, enforcement de quota nouveau, modification de format de stockage.
5. **Merger seulement après bac à sable** si fix de comportement.
6. **Ajouter un test automatisé** pour chaque vrai bug trouvé — Défense I (29 tests) n'attrape pas tout. Convention : `tests/unit/<module>.test.js`.

**Garde-fous** :
- **N'aborder qu'1 ultrareview à la fois** — sinon les branches divergent.
- **Pas d'ultrareview semaine 25-31 mai** — gel des développements lourds avant colloque, concentration sur bac à sable Lot 4a + finalisation présentation.
- **`/ultrareview` est payant et user-triggered** — Grégoire le lance depuis son terminal, vérifie le coût/budget avant d'engager 2 audits.
- **Validation Safari post-merge** — tester en Safari Cmd+Q chaque ultrareview mergé sur main avant de passer au suivant.

### Semaine du 11 au 17 mai (semaine en cours)

#### Décisions architecturales et documentation

- [x] **D1-D7 tranchées** le 11 mai (cf. `DECISIONS-ARCHITECTURALES-2026-05-11.md`).
- [x] **Document `DECISIONS-ARCHITECTURALES-2026-05-11.md` produit** le 11 mai.
- [x] **Document `CALENDRIER.md` produit** le 11 mai (ce document).
- [ ] **Marquer `PROTECTION-DONNEES-CHIFFREMENT-REPOS.md` comme abandonné** (bandeau d'en-tête « décision : non retenu »). Effort : 5 min.
- [ ] **Fermeture écarts E1** de l'audit du 11 mai (désynchros internes `MODELE-MENACES.md` : CSP, statuts X-02 et I-03, lignes citées). Effort : 30 min.
- [ ] **Fermeture écart E2** — mention « codex data non implémenté » dans 4 documents. Effort : 15 min.
- [ ] **Mise à jour `PLAN2-PHASE1-SPEC.md`** — signature ECDSA obligatoire (D2), préfixage IDs (D7), champ `inspireDe.idOriginal`. Effort : 1h.

#### Démarches institutionnelles (G1-G6) à initier

- [ ] **G1** — Contact responsable protection des renseignements personnels du cégep (avis Loi 25 sur pseudonymisation vs anonymisation).
- [ ] **G2** — Contact CER du cégep (consentement étudiant pour recherche).
- [ ] **G3** — Contact syndicat enseignant (propriété intellectuelle des grilles).
- [ ] **G4** — Premier contact AQPC ou TI cégep sur hébergement potentiel Voûte.
- [ ] **G5** — Initier réflexion modération formelle (à documenter dans le futur `MODELE-CONFIANCE.md`).
- [ ] **G6** — Discuter institution garante potentielle pour continuité.

Ces six démarches sont à **initier cette semaine** (pas à conclure). Délais de réponse incompressibles : G1 et G3 typiquement 2-6 semaines, G4 et G6 plusieurs mois.

#### Développement applicatif (priorité Grégoire)

- [ ] **Ultrareview 1 : `js/codex.js`** — démo Codex au colloque, jamais audité, format auto-descriptif crucial. Branche `feature/ultrareview-codex-<date>`. Rapport `Rapports/ultrareview-codex-<date>.md`. Voir « Stratégie ultrareviews pré-colloque » ci-dessus pour la méthode complète.
- [x] **Lot 4a ultrareview jetons** (11 mai) — 11 findings corrigés sur 4 axes (symétrie, validation, config canonique, SSOT) + migration namespace `jetonsEtudiants`. Travail isolé sur branche `feature/lot-4a-jetons` (commit `e4c348d`). **Pas mergé sur main** : le fix N1 (enforcement quota reprise ciblée) deviendrait soudain bloquant si le quota a été dépassé sur le trimestre actif. Test bac à sable prévu semaine 25-31 mai.
- [x] **Chantier C — #264 barre de progression sur tous les exports** (livré 11 mai, commits `72d4533` + `0e70935` + `d9bc666`). Module `progression.js` (#229) branché sur 6 nouveaux modules.
- [x] **Chantier H — #256-bis aide aux 10 modales** (livré 11 mai, commits `853c1a0` + `b101b56`). 10 popups. Validation Safari à faire avant de marquer `[x]` au BACKLOG.
- [/] **Chantier E — Défense E pragmatique « Phase 1 close »** — démarré 11 mai (commit `dc8e3e3` : audit suite + 3 correctifs ponctuels + pattern systémique identifié). **Décision actée le 11 mai** : approche « lecture A pragmatique » (substitution mécanique `value="${X.id}"`, ~20 occurrences, ~5-8 h cumulé sur 2-3 sessions) plutôt que migration exhaustive. Objectif : **position défendable au colloque le 3 juin**. La migration EXHAUSTIVE innerHTML → textContent (1-2 sem) est REJETÉE pour pré-colloque.
- [ ] **Ménage du backlog** (15-30 min prochaine session) — plusieurs items marqués `[ ]` sont en réalité livrés (ex. #160 UX biblios). À dépoussiérer.
- [ ] **Items modulaires au fil de l'eau** — pioche dans : #240 tampon visuel jetons sur travaux annotés, #243 rapport comparaison Codex exportable, #244 navigateur source manifeste, #233 UX flux Codex simplifié, #215 dates trimestre obligatoires, #216 tooltips échéances. *(#266 livré 11 mai 2026 : pratiques-materiel.js → pratiques-gestion.js)*
- [ ] **Page utilisateur « Sécurité accessible »** — `docs/securite/SECURITE-POUR-ENSEIGNANTS.md` (1-2 pages, langage accessible). Présente sceau SHA-256 + aperçu K-β + sandbox iframe. À écrire après Défense E close. Visée colloque (printout + intégration Réglages > À propos potentielle).
- [ ] **Stabilité** — corrections selon résultats ultrareview.
- [ ] **Sécurité** — application des défenses prioritaires non encore livrées (C wrapper destructif, finalisation H sceau SHA-256 sur les 4 types restants).
- [ ] **Ergonomie + on-boarding** — chantier propre, à découper en sous-tâches selon BACKLOG.md.

**Reportés post-trimestre** (touchent le flux d'évaluation ou le storage — à ne pas livrer pendant que des notes sont actives) :
- Lot 3 ultrareview indices (~3-5 h, plan dans `Rapports/ultrareview-lot-3-indices.md`)
- Phase 5 Démo (~1 j, déjà reverté le 22 avril)
- #207 unifier `travaux-stockage.js` dans `db.js` (~1-2 j)
- #272 machine à états chargement évaluation (~1 j, anciennement #239)
- Défense E migration EXHAUSTIVE (~1-2 sem) — considérée post-colloque seulement si pertinente. La fermeture pragmatique de mai devrait suffire.

### Semaine du 18 au 24 mai

- [ ] **Audit fallbacks Safari** — confirmer que `travaux-stockage.js` et `reserve.js` ont des fallbacks fonctionnels sur Safari (décision D6). Si cassé, corriger.
- [ ] **Suivi démarches G1-G6** — relances éventuelles. Centraliser les réponses reçues.
- [ ] **Ultrareview 2 : `js/travaux-export-pdf.js` + `js/travaux-annotation.js`** — démo annotation/PDF AQPC, pipeline fragile, jamais audité ensemble. Branche `feature/ultrareview-travaux-export-<date>`. Voir « Stratégie ultrareviews pré-colloque » §3 pour la méthode.
- [ ] **Poursuite Défense E pragmatique** (substitution mécanique `value="${X.id}"` + audit cas restants) — viser fermeture « Phase 1 close » avant le colloque.
- [ ] **Page Sécurité-pour-enseignants** (1-2 pages accessibles) si Défense E close.
- [ ] **Préparation présentation AQPC** — diapositives, démo, scénario de l'atelier. Effort : 1-2 jours.

### Semaine du 25 au 31 mai

- [ ] **Bac à sable Lot 4a jetons** (post-remise notes) — créer un trimestre "Bac à sable" via Réglages, 3-4 élèves fictifs, une PAN, quelques évaluations. Checkout `feature/lot-4a-jetons`, dérouler la checklist de tests (jetons délai, reprise archive/supprime, reprise ciblée quota, retire reprise garde/restaure, mode anonymisation). Si vert : merge sur main + push. Si rouge : debug avant le 3 juin.
- [ ] **Gel des développements lourds** vers le milieu de semaine pour éviter d'introduire des bugs juste avant le colloque.
- [ ] **PAS d'ultrareview cette semaine** — concentration sur stabilité, bac à sable, présentation. Les ultrareviews #1 et #2 doivent être mergés au plus tard le 24 mai.
- [ ] **Tests finaux** sur Safari et Chrome (cross-browser D6).
- [ ] **Finalisation présentation AQPC**.
- [ ] **Préparation de l'infrastructure publique** pour la phase expérimentateurs (Cloudflare ou Netlify — à choisir). Déploiement à finaliser dans la semaine post-colloque ou pendant le colloque.
- [ ] **Préparer une page de capture des intentions** pour les visiteurs intéressés à devenir expérimentateurs (formulaire ou contact direct ?).

### Lundi 1er juin

- [ ] **Veille colloque** — répétition de l'atelier, finalisation diapositives, anticipation des questions.
- [ ] **Sac du colloque** — appareils, câbles, cartes de visite, version sur clé USB de secours en cas de problème de connexion.

---

## 4. Juin 2026 — Colloque et bascule

**Période** : 2 → 30 juin 2026.
**Priorités** : colloque, congé, démarrage phase expérimentateurs.

### Mardi 2 juin — Jour 1 du colloque

- [ ] 19h30 — Ouverture colloque AQPC à Drummondville.

### 🟥 Mercredi 3 juin — Jour de l'atelier Grégoire

- [ ] 13h45 - 14h45 — **Atelier « Des micro-données pour éclairer l'intervention »**. Salle D. 33 places.
- [ ] Après l'atelier — recueil des contacts des personnes intéressées par la phase expérimentateurs.

### Jeudi 4 - Vendredi 5 juin — Fin du colloque

- [ ] Participation aux autres ateliers, réseautage.
- [ ] Discussions avec les organisateurs de la CoP (s'ils sont présents).

### Semaine du 8 au 14 juin — CONGÉ

- [x] **Congé complet pour Grégoire.** Aucune action Labo Codex prévue.

### Semaine du 15 au 21 juin — Reprise temps partiel

- [ ] **Bilan post-colloque** — notes sur l'atelier, retours reçus, intérêts manifestés.
- [ ] **Déploiement infrastructure publique** Cloudflare ou Netlify (si pas fait avant le colloque).
- [ ] **Communication aux personnes intéressées** — accès à l'app, instructions pour la phase libre.
- [ ] **Préparation matérielle de la phase expérimentateurs** : page d'accueil claire, documentation utilisateur de base, formulaire de retour optionnel.
- [ ] **Reprise du suivi des démarches G1-G6** — relances et compilation des réponses reçues pendant le colloque ou peu après.

### Semaine du 22 au 28 juin

- [ ] **Phase expérimentateurs ouverte** — observation passive de l'usage (statistiques Cloudflare/Netlify si possible, retours spontanés).
- [ ] **Démarrage code Voûte Phase 1** : module `js/signature.js` (1 semaine de code). Préparation Web Crypto API ECDSA P-256.

### 29-30 juin

- [ ] **Bilan fin de mois** — mise à jour de ce calendrier, ajustement des actions de juillet.

---

## 5. Juillet 2026 — Phase expérimentateurs + préparation cohorte

**Période** : 1er juillet → 31 juillet 2026.
**Priorités** : poursuite expérimentateurs, début préparation matériel pédagogique, code Voûte Phase 1.

### Vue d'ensemble du mois

| Bloc | Effort | Détail |
|---|---|---|
| Suivi expérimentateurs | continu, léger | Réponse aux retours, observation usage |
| Préparation Rencontre 1 (sept) | 2-3 jours répartis | Matériel pédagogique pour « Outiller son regard » |
| Code Voûte Phase 1 | 2 semaines | Modules `signature.js`, `gestion-cles.js`, `trust-tofu.js` |
| Discussions CoP | continu | Avancées sur la structure des rencontres |
| Suivi G1-G6 | continu, léger | Relances et intégration des réponses |

### Actions concrètes

- [ ] **Suivi des expérimentateurs** — encourager les retours, identifier les blocages d'usage, mesurer le nombre d'utilisateurs actifs.
- [ ] **Démarches CoP** — discussions avec les organisateurs pour avancer sur la structure des 8 rencontres (lieu, format, modalité distance/présence, dates précises).
- [ ] **Préparation matériel Rencontre 1 « Outiller son regard »** :
  - Document d'accueil pour la rencontre.
  - Guide d'activité (« configurer un trimestre, importer les élèves, saisir présences »).
  - Préparation données démo pour exercice.
  - Diaporama d'introduction (CoP, Labo Codex, posture).
- [ ] **Code Voûte Phase 1** :
  - Module `js/signature.js` (génération ECDSA P-256, signature, vérification). ~1 semaine.
  - Module `js/gestion-cles.js` (sauvegarde, phrase de récupération). ~1 semaine.
  - Début module `js/trust-tofu.js`. ~3-4 jours.
- [ ] **Défense B-β — passage obligé `ajouter*ALaBibliotheque`** : à finaliser après que `pratique.configuration` ait été modélisée (pré-requis). 1-2 jours d'effort. Couvre la dernière surface d'ingestion sans `assainirObjet`.
- [ ] **Finalisation Défense H** — sceau SHA-256 sur les 4 types d'exports restants (grilles individuelles, échelles, cartouches, productions). 1 jour. Pré-requis pour interopérabilité Voûte.
- [ ] **Suivi G1-G6** — compilation des réponses reçues. Si G1 (avis Loi 25) est reçu et impose des contraintes, mise à jour des documents sécurité concernés.

### Échéance fin juillet

- [ ] **Composition cohorte cible identifiée** — les expérimentateurs qui ont manifesté un intérêt sérieux. Pas encore engagement formel, mais liste claire.

---

## 6. Août 2026 — Préparation finale cohorte

**Période** : 1er août → 31 août 2026.
**Priorités** : finalisation cohorte, finalisation matériel Rencontre 1, ébauche Rencontre 2.

### Vue d'ensemble

| Bloc | Effort | Détail |
|---|---|---|
| Engagement cohorte formel | 1 semaine | Confirmation, calendrier figé, premier contact officiel |
| Finalisation Rencontre 1 | 1 semaine | Matériel pédagogique complet, répétition |
| Ébauche Rencontre 2 | 2-3 jours | « Évaluer et donner de la rétroaction » |
| Code Voûte Phase 1 | 1-2 semaines | Finalisation modules `trust-tofu.js` + `trust-wot.js` |
| Modération humaine | 1 semaine | Outil de modération (D4) |

### Actions concrètes

- [ ] **Engagement formel cohorte** — invitations officielles, confirmation des participants, calendrier des 8 rencontres arrêté.
- [ ] **Date Rencontre 1 fixée** — typiquement mi à fin septembre. À communiquer 4 semaines à l'avance minimum.
- [ ] **Matériel Rencontre 1 finalisé** :
  - Document final aux participants.
  - Diaporama final.
  - Données démo testées.
  - Plan B en cas de problème technique.
- [ ] **Matériel Rencontre 2 ébauché** — pour avoir une longueur d'avance.
- [ ] **Code Voûte Phase 1 continué** :
  - Finalisation `trust-tofu.js`.
  - Début `trust-wot.js` (signatures manuelles entre utilisateurs, graphe local).
  - Modules `partage-*.js` selon `PLAN2-PHASE1-SPEC.md` mise à jour.
- [ ] **Outil de modération humaine (D4)** — interface Grégoire-modérateur. 1 semaine.
- [ ] **Tests cross-browser** — Suite Playwright étendue à Safari, Chrome, Firefox. 1 semaine.
- [ ] **Recettes finales** — tester de bout en bout les workflows clés que la Rencontre 1 utilisera.

### 🟦 Ouverture pilote restreinte Voûte (fin août)

Test grandeur nature du dispositif Voûte avec un cercle minimal avant la rentrée.

- [ ] **Identification des 2-3 collègues de confiance** qui acceptent de participer au pilote.
- [ ] **Génération des paires de clés ECDSA** pour Grégoire et les pilotes (via le module `js/gestion-cles.js` livré).
- [ ] **Échange initial des clés publiques** par canal hors-app (courriel ou rencontre physique avec empreinte vocale/QR). Marque le bootstrap TOFU.
- [ ] **Test de partage signé** : Grégoire publie une grille au format `.lcz` signée, les pilotes l'importent et vérifient la signature.
- [ ] **Test de modération humaine** : Grégoire utilise l'outil de modération pour approuver/refuser des dépôts.
- [ ] **Test de signature manuelle WoT** (mode avancé) : Grégoire signe la clé publique d'un pilote, vérifier l'effet sur la confiance.
- [ ] **Test de détection de tentative d'usurpation** : tenter de re-publier avec une clé différente sous le même nom d'auteur — vérifier l'alerte TOFU.
- [ ] **Notes d'usage** : ergonomie, points de friction, suggestions des pilotes.
- [ ] **Ajustements éventuels** avant la cohorte de septembre.

### Échéance fin août

- [ ] **App prête pour la première rencontre.**
- [ ] **Matériel Rencontre 1 prêt à imprimer/distribuer.**
- [ ] **Date Rencontre 1 confirmée à tous les participants.**
- [ ] **Pilote Voûte fonctionnel** (signature + TOFU + WoT + modération validés sur cas réel).

---

## 7. Septembre 2026 → Avril 2027 — Cohorte CoP, 8 rencontres mensuelles

**Période** : septembre 2026 → avril 2027.
**Posture** : « pas d'expert qui forme des novices » — Grégoire anime, la cohorte co-développe.

### Trimestre 1 — Observer sa pratique (sept-déc 2026)

#### 🟦 Septembre 2026 — Rencontre 1 « Outiller son regard »

- **Question directrice** : « Que puis-je observer avant la note ? »
- **Compétence** : configurer un trimestre, un cours, un groupe-cours, importer la liste d'élèves, saisir les présences, consulter les premiers indices.
- **Préparation 1 semaine avant** :
  - [ ] Confirmation logistique (lieu, horaire, matériel).
  - [ ] Distribution document préparatoire aux participants.
  - [ ] Test final environnement technique.
- **Animation** :
  - [ ] Accueil + introduction CoP.
  - [ ] Présentation du vocabulaire (indices, échelles, patterns).
  - [ ] Atelier pratique : chaque participant configure son trimestre.
- **Après la rencontre** :
  - [ ] Notes de séance.
  - [ ] Identification des difficultés rencontrées.
  - [ ] Ajustement matériel Rencontre 2 selon ce qu'on a appris.
  - [ ] Finalisation Rencontre 2.
  - [ ] Ébauche Rencontre 3.

#### 🟦 Octobre 2026 — Rencontre 2 « Évaluer et donner de la rétroaction »

- **Question directrice** : « Qu'est-ce que j'évalue quand j'évalue ? »
- **Compétence** : adapter une grille critériée, annoter et évaluer une production étudiante, composer une rétroaction structurée.
- **Préparation 1 semaine avant + Animation + Après-rencontre** — mêmes étapes que Rencontre 1.

#### 🟦 Novembre 2026 — Rencontre 3 « Lire les données et dépister »

- **Question directrice** : « Qu'est-ce que les données me disent que je ne savais pas ? »
- **Compétence** : lire un tableau de bord, reconnaître les niveaux SOLO, identifier forces et défis.

#### 🟦 Décembre 2026 — Rencontre 4 « S'évaluer soi-même comme enseignant »

- **Question directrice** : « Et si je faisais autrement ? »
- **Compétence** : analyser les données longitudinales d'un trimestre, identifier un décalage intention/résultat.
- **Bilan trimestre 1** : un temps de récapitulation collective de ce qu'on a observé en automne. Préparation à la bascule « Transformer ».

### 🟨 Pause hivernale (mi-déc 2026 → début janvier 2027)

- **Période de repos** pour la cohorte (correspond aux vacances scolaires).
- **Pour Grégoire** : préparation Rencontre 5, intégration retours trimestre 1, ajustements éventuels du matériel trimestre 2.

### Trimestre 2 — Transformer sa pratique (jan-avril 2027)

#### 🟦 Janvier 2027 — Rencontre 5 « Aligner sa pratique »

- **Question directrice** : « Comment consolider ce que je fais ? »
- **Compétence** : produire une carte mentale ou un plan de leçon articulant objectifs/activités/évaluations.
- **Bascule pédagogique** : on passe de l'observation à la transformation.

#### 🟦 Février 2027 — Rencontre 6 « Construire la note autrement »

- **Question directrice** : « Comment expérimenter pour atteindre mes objectifs ? »
- **Compétence** : configurer une PAN (Pratique Alternative de Notation) cohérente avec l'alignement de janvier.
- **Première utilisation pédagogique de la Voûte par la cohorte** : les participants partagent entre eux leurs configurations de PAN via la Voûte. Première occasion pour la cohorte d'expérimenter signature + TOFU + WoT dans le contexte pédagogique réel. Prérequis : pilote Voûte d'août validé, ouverture multi-cégep ou ouverture cohorte fermée fonctionnelle.

#### 🟦 Mars 2027 — Rencontre 7 « Appliquer le modèle RàI »

- **Question directrice** : « Comment infléchir des trajectoires ? »
- **Compétence** : planifier une intervention de niveau 2 ou 3 pour un étudiant ciblé, documenter, évaluer.

#### 🟦 Avril 2027 — Rencontre 8 « Évaluer sa pratique et le laboratoire »

- **Question directrice** : « Qu'est-ce qu'on fait ensemble ? »
- **Compétence** : comparer les données avant-après l'hiver, formuler un constat pour le cycle suivant.
- **Bilan du cycle complet** : récapitulation des 8 rencontres, identification des acquis, formulation d'orientations pour le cycle 2027-2028 ou l'ouverture multi-cohorte.
- **Bilan Voûte cohorte** : retours d'usage sur les 2-3 mois d'utilisation pédagogique (février-avril). Quels partages ont émergé, quelle confiance s'est construite, quels points de friction. Données pour décider de l'ouverture multi-cégep et des défenses Phase 2 (G, M, N, O) à activer ou non.

---

## 8. Suivi des chantiers transversaux

Chantiers qui s'étalent sur plusieurs mois et qui demandent un suivi régulier.

### 8.1 Démarches institutionnelles (G1-G6)

| Démarche | Statut | Action attendue | Échéance souhaitée |
|---|---|---|---|
| G1 — Avis Loi 25 | À initier | Contacter responsable protection RP | Réponse fin juin / début juillet idéal |
| G2 — CER consentement étudiant | À initier | Contacter CER cégep | Réponse fin août idéal (préparation cohorte) |
| G3 — Propriété intellectuelle | À initier | Contacter syndicat | Réponse avant ouverture Voûte (automne 2026+) |
| G4 — Hébergement Voûte | À initier | AQPC, TI cégep, ministère | Discussions ouvertes, décision automne 2026 |
| G5 — Modération formelle | À initier | Réflexion + premiers contacts | À documenter dans `MODELE-CONFIANCE.md` |
| G6 — Continuité institutionnelle | À initier | Plan documenté | À discuter en parallèle G4 |

**Suivi à effectuer mensuellement.** Mettre à jour le statut dans ce tableau.

### 8.2 Chantiers code (sécurité Voûte)

**Défenses du `MODELE-MENACES.md` déjà livrées (acquis)** :

| Défense | Description | Date livraison | Référence |
|---|---|---|---|
| **A** | Sandbox iframe pour aperçu d'imports | 8 mai 2026 | `feature/securite-defense-a-sandbox`, 5 commits, 9 vecteurs d'évasion bloqués |
| **B-α** | Sanitisation profonde imports (6 bibliothèques) | 6 mai 2026 | commit `f9f6865` |
| **D** | Révocation FSAPI par défaut + opt-in | 6 mai 2026 | commit `d0a0903`, toggle UI Réglages › Sécurité |
| **H** | Sceau SHA-256 sur exports (partielle, 2/6 types) | 6 mai 2026 | commit `404b924`, config-complète + tampons. Reste : grilles, échelles, cartouches, productions individuels |
| **I** | Suite de tests automatisés (29 tests) | 8 mai 2026 | `feature/securite-defense-i-tests`, branche fusionnée |
| **J** | Hook pré-commit (`innerHTML`, `db.set` sensibles) | 6 mai 2026 | commit `48c1a2d`, `scripts/hooks/pre-commit` ~165 l. |
| **K** | Whitelist structure ZIP/JSON sortants | 6 mai 2026 | commit `0218d07`, 4 pipelines branchés |
| **P-α** | Sanitisation tampons (canal isolé) | 6 mai 2026 | commit `a9eadae` |

**Chantiers code restants à mener (Phase 1 Voûte)** :

| Module | Effort | Cible | Statut | Couvre défense |
|---|---|---|---|---|
| `js/signature.js` | 1 sem | Juillet 2026 | À démarrer | F |
| `js/gestion-cles.js` | 1 sem | Juillet-août | À démarrer | F |
| `js/trust-tofu.js` | 1 sem | Juillet-août | À démarrer | F + D3 |
| `js/trust-wot.js` | 1-2 sem | Août | À démarrer | F + D3 (WoT B) |
| `js/trust-ui.js` | 1-2 sem | Août | À démarrer | F + D3 (WoT B) |
| Modules `partage-*.js` | 1 sem | Août | À démarrer | Format Voûte + D7 préfixage |
| Outil modération (D4) | 1 sem | Août | À démarrer | L + D4 |
| Fallbacks Safari FSAPI | 2-3 jours | Juin (post-colloque) | À auditer d'abord | D6 |
| Tests cross-browser | 1 sem | Août | À démarrer | D6 |
| Finalisation Défense H (4 types restants) | 1 jour | Juin-juillet | À démarrer | H complète |
| Défense B-β (passage obligé `ajouter*ALaBibliotheque`) | 1-2 jours | Juillet | En suspens (pré-requis : modéliser `pratique.configuration`) | B-β |
| Défense E (migration `innerHTML → textContent` ciblée) | 1-2 sem | Mai-juin | Partielle | E |

**Défenses non priorisées Phase 1 (à reconsidérer selon évolution)** :

| Défense | Description | Conditions de déclenchement |
|---|---|---|
| **G** | Kill list + quarantaine + audit rétroactif | Phase 2. Déclenchement après premiers incidents Voûte ou retours communauté. Maintenance continue requise. |
| **M** | Diff visuel à l'import (collisions par contenu) | Phase 2. Déclenchement après que la Voûte soit en service avec des cas d'usage réels. |
| **N** | Renforcement CSP avec nonces (`script-src-attr`) | Phase 2. Test compatibilité Safari M3 + iPad M1 requis avant. Si tests positifs, planifiable juillet-août 2026. Effort : 1-2 sem. |
| **O** | Re-encodage images au canvas à l'import | Phase 2. Priorité faible — à considérer si scénario I-02 (polyglotte) devient une menace observée. |

Décision implicite : on n'attend pas que ces défenses soient livrées pour ouvrir la Voûte pilote restreinte. La sandbox iframe (A) + sanitisation (B-α) + signature (F à venir) couvrent l'essentiel. G, M, N, O sont des défenses en profondeur additionnelles qui peuvent attendre les retours d'usage réel.

### 8.3 Documentation à produire

| Document | Échéance | Statut |
|---|---|---|
| `MODELE-CONFIANCE.md` | Avant ouverture Voûte (automne 2026) | À produire |
| `PLAN2-PHASE1-SPEC.md` mise à jour (D2, D7) | Cette semaine (15 mai) | À faire |
| Marquage `PROTECTION-DONNEES-CHIFFREMENT-REPOS.md` abandonné | Cette semaine | À faire |
| Fermeture écarts E1, E2 audit | Cette semaine | À faire |
| Scénario I-04 (import MD planification) ajout au MODELE-MENACES | Avant Voûte | À produire |
| Matériel pédagogique Rencontre 1 | Fin août | À produire |
| Matériel pédagogique Rencontres 2-4 | Trimestre 1 (sept-déc) | À produire au fil |
| Matériel pédagogique Rencontres 5-8 | Trimestre 2 (jan-avril) | À produire au fil |

### 8.4 Préparation pédagogique

Pour chaque rencontre mensuelle, calendrier indicatif de préparation :

- **J-4 semaines** : ébauche du matériel pédagogique. Définition du déroulement.
- **J-2 semaines** : finalisation matériel. Test des activités sur ta propre app.
- **J-1 semaine** : distribution document préparatoire aux participants. Confirmation logistique.
- **J-3 jours** : répétition mentale du déroulement. Préparation matériel matériel (papier, projection, etc.).
- **Jour J** : animation.
- **J+1 à J+3** : notes de séance, ajustements pour Rencontre suivante.

### 8.5 Suivi de l'expérience utilisateur

Une fois la phase expérimentateurs lancée (mi-juin 2026) :

- **Mensuel** : export CSV de la liste des identités Cloudflare
  (`My Team → Users`), déposé dans `Cowork A26 CoP Labo Codex/` et comparé au
  précédent. *Précisé le 27 août 2026 : cette ligne disait « hebdomadaire :
  consultation des statistiques d'usage (si Cloudflare/Netlify les exposent) ».
  À partir de la réactivation d'Access du 1er septembre 2026, le geste est
  défini et la cadence mensuelle suffit. Procédure : `DEPLOY.md` §4.4. À noter que l'export
  dit qui est entré, jamais qui s'est servi de l'application — celle-ci est
  locale et hors ligne.*
- **Sur retour spontané** : suivi individualisé.
- **Mensuel** : compilation des retours, identification de tendances, mise à jour BACKLOG.md.

---

## 9. Risques et points d'attention

### 9.1 Risques temporels identifiés

**R1 — Délai des démarches institutionnelles (G1-G6)** : risque que les avis Loi 25 ou les décisions d'hébergement arrivent trop tard pour conditionner correctement la Voûte. Mitigation : **les initier dès la semaine du 11 mai** (en parallèle du code), accepter des décisions partielles si nécessaire.

**R2 — Sprint pré-colloque trop chargé** : risque de fatigue et d'introduire des bugs juste avant l'AQPC. Mitigation : **gel des développements lourds vers le milieu de semaine 4 de mai**, focus sur stabilité dans les derniers jours.

**R3 — Phase expérimentateurs sans structure** : l'accès libre sans accompagnement structuré peut produire peu de retours utilisables. Mitigation : **prévoir un formulaire de retour simple**, peut-être proposer une session de débriefing en juillet.

**R4 — Composition cohorte tardive** : si la cohorte n'est pas figée fin août, la Rencontre 1 de septembre risque d'être bricolée. Mitigation : **fixer une date butoir pour la confirmation cohorte (par exemple 15 août)**.

**R5 — Cumul code + pédagogie pendant les rencontres** : à partir de septembre, animer une rencontre par mois **et** continuer le développement de l'app. Charge soutenue. Mitigation : **prévoir le matériel des rencontres en avance pendant l'été**, garder les sessions de septembre-décembre comme « observation » plutôt que « nouvelle fonctionnalité ».

### 9.2 Dépendances bloquantes

- **D1 (architecture Voûte)** bloque l'ouverture publique Voûte. Mais le code applicatif peut avancer sans (cf. `DECISIONS-ARCHITECTURALES-2026-05-11.md` §2.4).
- **G1 (avis Loi 25)** conditionne l'ouverture de la fonctionnalité « partage codex data anonymisé ». Ne bloque pas la cohorte ni les fonctionnalités personnelles de Labo Codex.
- **G2 (CER)** conditionne l'usage des données de cohorte pour de la recherche publiée.

### 9.3 Marges de manœuvre

- La cohorte d'**août 2026** peut glisser à septembre si nécessaire (mais pas plus tard, sinon l'année scolaire commence sans cadre).
- Les **8 rencontres** sont mensuelles, donc 4 semaines de battement chaque mois — marge si une rencontre doit être déplacée d'une semaine.
- Le **code Voûte Phase 1** peut être livré progressivement, pas nécessairement tout en même temps. Les utilisateurs cohorte n'auront pas besoin de la Voûte avant le trimestre 2 (probablement, à confirmer selon la pédagogie).

---

## 10. Procédure de mise à jour du calendrier

Pour que ce calendrier reste un outil utile et pas un musée :

### 10.1 Quand mettre à jour

- **Hebdomadairement** sur la zone active (mois en cours) — chaque vendredi ou lundi, revue rapide.
- **Mensuellement** sur la vue d'ensemble — premier jour du mois, ajustement des prévisions.
- **À chaque décision structurelle** — quand une décision est prise (ex. date Rencontre 1 fixée), mettre à jour immédiatement.
- **Après chaque rencontre** — bilan court, ajustements pour le mois suivant.

### 10.2 Qui peut mettre à jour

- **Grégoire** directement, à tout moment.
- **Claude** quand sollicité dans une session — en intégrant les retours et nouvelles décisions.

### 10.3 Comment mettre à jour

- Cocher les actions complétées avec `[x]`.
- Ajouter des notes courtes en italique quand pertinent (ex. *« Reporté à juillet : G1 toujours en attente de réponse »*).
- Ne pas effacer le passé — c'est une trace. Marquer comme `[ANNULÉ]` ou `[REPORTÉ]` plutôt que supprimer.
- Mettre à jour l'historique en fin de document.

### 10.4 Méthode de relecture rapide à la reprise

Quand Grégoire reprend Labo Codex après une coupure (vacances, autre projet) :

1. Lire le §1 (vue d'ensemble) pour situer la période actuelle.
2. Lire la zone du mois en cours pour identifier les actions en attente.
3. Vérifier le §8 (chantiers transversaux) pour le statut des démarches longues.
4. Vérifier le §9 (risques) pour les points d'attention actifs.

---

## 11. Annexes

### A. Documents de référence

**Pilotage** :
- `CALENDRIER.md` — ce document.
- `BACKLOG.md` (racine projet) — tâches à faire (le « quoi »).
- `SESSION.md` (racine projet, mis à jour à chaque session) — contexte courant.

**Décisions** :
- `docs/securite/DECISIONS-ARCHITECTURALES-2026-05-11.md` — 7 décisions architecturales sécurité.
- `docs/securite/AUDIT-ETAT-REFLEXION-2026-05-11.md` — audit qui a déclenché la session de décision.

**Sécurité (référence)** :
- `docs/securite/MODELE-MENACES.md`
- `docs/securite/PROTECTION-FICHIERS-EXPORT.md`
- `docs/securite/PROTECTION-DONNEES-VERSIONING-RESILIENCE.md`
- `docs/securite/PROTECTION-DONNEES-ANONYMISATION.md`
- `docs/securite/BENCHMARK-OBSIDIAN.md`
- `docs/securite/PROTECTION-DONNEES-CHIFFREMENT-REPOS.md` (décision : non retenu)

**Spec Voûte** :
- `docs/architecture/PLAN2-PHASE1-SPEC.md` (à mettre à jour cette semaine selon D2 et D7).

**Formation** :
- `docs/formation/Plan de formation — Labo Codex Claude Design.pdf` — référence des 8 rencontres.

**Skills métier** :
- `.claude/skills/*/SKILL.md`

### B. Glossaire

**AQPC** — Association québécoise de pédagogie collégiale.

**CER** — Comité d'éthique de la recherche (au cégep).

**CoP** — Communauté de pratique. Cadre d'organisation de la cohorte d'enseignants Labo Codex.

**Cohorte fermée** — groupe de participants engagé pour les deux trimestres consécutifs (automne 2026 + hiver 2027), pas d'ajouts en cours.

**Expérimentateur** — utilisateur de la phase libre (post-colloque, juin-août 2026). Pas encore membre de la cohorte, mais candidat potentiel.

**PAN** — Pratique Alternative de Notation. Rencontre 6 du plan de formation.

**RàI** — Réponse à l'Intervention. Modèle de soutien éducatif. Rencontre 7.

**SOLO** — Taxonomie SOLO (Structure of Observed Learning Outcomes). Niveaux cognitifs reconnaissables dans les productions étudiantes. Rencontre 3.

**Voûte** — bibliothèque partagée de ressources pédagogiques (grilles, échelles, cartouches) entre enseignants Labo Codex. En cours de conception. Ouverture prévue selon avancement décisions D1-D4 et démarches G4-G6.

### C. Historique

| Date | Version | Changement |
|---|---|---|
| 2026-05-11 | 1.0 | Création. Vue d'ensemble + zone active mai 2026 hebdomadaire + mois suivants mensuels. Intègre les 7 décisions architecturales du 11 mai, le plan de formation des 8 rencontres (sept 2026 - avril 2027), le colloque AQPC 2-5 juin 2026 avec atelier Grégoire le 3 juin. |
| 2026-05-11 | 1.1 | Ajout Lot 4a ultrareview jetons livré sur branche `feature/lot-4a-jetons` (commit `e4c348d`) — non mergé pour ne pas perturber le trimestre actif. Inscription chantiers C, E, H (safes trimestre actif) en semaine 11-17 et 18-24 mai. Bac à sable Lot 4a planifié semaine 25-31 mai. Liste des chantiers reportés post-trimestre actualisée (B, D, F, G). |
| 2026-05-11 | 1.2 | Mise à jour fin de journée : #264 (C) et #256-bis (H) livrés. Défense E démarrage (commit `dc8e3e3`). **Décision actée** : Défense E approche pragmatique « lecture A » (substitution mécanique `value="${X.id}"`, ~5-8 h cumulé) pour atteindre une « Phase 1 close » défendable avant le colloque du 3 juin. Migration exhaustive innerHTML → textContent REPORTÉE post-colloque. Ajout chantier « Page Sécurité-pour-enseignants » + liste d'items modulaires « au fil de l'eau » + tâche de ménage backlog en début de prochaine session. |
| 2026-05-11 | 1.2 | Trois ajouts de cohérence sécurité/Voûte suite à analyse de couverture. (1) §8.2 enrichi avec tableau des 8 défenses livrées (A, B-α, D, H partielle, I, J, K, P-α) + tableau des défenses non priorisées Phase 1 (G, M, N, O) avec conditions de réévaluation. Inscription B-β, finalisation Défense H et Défense E dans le tableau des chantiers code restants. (2) Jalons d'ouverture Voûte ajoutés : pilote restreinte fin août 2026 (2-3 collègues, signature+TOFU+WoT+modération en cas réel) ; multi-cégep conditionné par D1+G4+G6 ; codex data anonymisé conditionné par G1+G2. Nouvelle catégorie 🟪 « jalon conditionné ». (3) Rencontre 6 (février 2027) enrichie comme première utilisation pédagogique Voûte par la cohorte. Rencontre 8 (avril 2027) enrichie comme bilan d'usage Voûte. Section dédiée pilote Voûte en §6 août avec checklist de tests. Défense B-β et finalisation H inscrites en juillet (timeline mensuelle). |
| 2026-05-11 | 1.3 | Stratégie ultrareviews pré-colloque actée en fin de journée. Nouvelle sous-section au début du §3 « Mai 2026 » qui (1) limite à **2 ultrareviews max** avant colloque (`codex.js` semaine 12-17, `travaux-export-pdf.js`+`travaux-annotation.js` semaine 18-24), (2) reporte 4 modules post-trimestre (`indices.js` Lot 3, `evaluation.js`, `pratiques-gestion.js` qui vient d'être refactoré, `interventions.js`), (3) documente la pratique organisationnelle (branche dédiée, rapport `Rapports/ultrareview-<module>-<date>.md`, tri findings selon risque trimestre, validation Safari post-merge), (4) interdit explicitement les ultrareviews semaine 25-31 mai (gel). Inscription concrète dans les 3 semaines actives. Remplace la mention vague « Ultrareviews Claude Code » L121 par référence au plan §3. |

---

**Fin du calendrier. Document vivant — à mettre à jour régulièrement.**
