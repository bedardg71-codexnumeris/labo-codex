# BACKLOG - Monitorage Pedagogique

> **Pour Claude** : Ce fichier liste les **items ouverts** uniquement. L'historique complet des items livrés (313 items, fév-mai 2026) vit dans `BACKLOG-ARCHIVE.md`.
>
> **Dernière bascule** : 25 mai 2026 fin de journée — extraction des items livrés vers BACKLOG-ARCHIVE.md. 30 items ouverts conservés ici, organisés par thème.
> **État courant** : Beta 99.64-99.65 (Build 0525-1055), HEAD main `0bd482c`. Audit annuel LIVRÉ et largement absorbé sur main. Présentation AQPC le 3 juin 2026 (J−9).
> **Pour ajouter un item** : `- [ ] **#XX** Description courte` + sous-puces de contexte. Dernier ID utilisé : **#285** (livré).

---

## Légende

- 🟡 **Important pour expérimentateurs post-AQPC** (juin-été 2026, première vague d'utilisateurs externes)
- 🟢 **Backlog long terme** (utile mais sans urgence — peut attendre la rentrée d'automne)
- 📦 **Reporté / hors v1.0** (acté explicitement par Grégoire ou par calendrier projet)
- ⚠️ **Priorité haute actée** (à traiter dès que possible — décision Grégoire datée)
- 📐 **Décision UX en attente** (besoin d'un choix Grégoire avant de coder)

Voir le plan de travail détaillé dans `plans de travail/PLAN-TRAVAIL-26-MAI.md` pour la classification en ordre de prise et les estimations d'effort.

---

## A faire

### Bugs UX et cohérence interface

- [ ] 🟡 ⚠️ **#282** Migrer `js/cours.js` de la clé legacy `listeCours` vers la clé V2 `cours`
  - **PRIORITÉ HAUTE** actée par Grégoire 23 mai 2026 PM (« il faudra y revenir absolument »).
  - Modal Bibliothèque cours vide en V2 — 10 sites dans cours.js lisent encore `listeCours`.
  - Effort estimé révisé : 5-7 h (scope réel 93 sites dans 15+ fichiers d'après post-mortem du 23 mai matin, tentative revertée).
  - **Prérequis P1-P4 LIVRÉS** : bandeau mode édition, activation explicite, migration tuple naturel, snippet recovery (cf. BACKLOG-ARCHIVE.md pour le post-mortem et le snippet).

- [ ] 🟡 **#280** Fusionner « Capturer maintenant » et « Reconstruire l'historique » en une seule action
  - Retour Grégoire 22 mai : il utilise toujours « Reconstruire » à chaque fois.
  - Fusion résout le bug #116 (snapshots manuels 4 facettes) en un coup.
  - Effort estimé : 1 h - 1 h 30. Bloqueur amont : confirmer que `reconstruireSnapshotsHistoriques` traite le multi-groupes-cours.
  - Renommer aussi les 3 cartes d'info au-dessus des boutons pour cohérence séance.

- [ ] 🟡 **#281** Migrer les notifications HTML custom résiduelles vers `window.notifications.{succes, erreur, info}`
  - 1 site identifié : `saisie-presences.js:1357-1374` (« ✅ Présences enregistrées avec succès » fond teal, échappé à la migration Cat-B Track 4 E du 21 mai car pattern HTML custom).
  - Audit complémentaire à grepper : `document\.createElement.*notification|innerHTML.*notification`.
  - Effort estimé : ~30 min.

- [ ] 🟡 **#278** Bilan réflexif — scroll reset au top en passant à l'onglet « Importer les résultats »
  - Bug pré-existant confirmé (pas une régression du refactor 15 mai).
  - Cause : `afficherVue` cache vue précédente par `display:none`, contenu suivant plus court → shrink du DOM → Safari reset scrollTop.
  - Piste recommandée : scroll explicite vers le haut du conteneur bilan à chaque `afficherVue` (option a).

- [ ] 🟢 **#283** Harmonisation responsive des pages à sidebar en mobile (<1024 px)
  - Pages : Conception (Productions/Grilles/Échelles/Pratiques/Cartouches), Évaluation (Liste), possiblement Calendrier.
  - Bug pré-existant, pas introduit par chrome unifié. Trois options de fix à arbitrer.
  - Lié à #284.

- [ ] 📐 🟢 **#284** Harmonisation de la structure des pages (titres + sous-titres descriptifs manquants)
  - Pages sans titre : Alignement pédagogique (carte mentale), Tirage au sort (Labo).
  - Décision : ajouter h1 + sous-titre 1-ligne partout, OU décider que certaines pages sont délibérément plein écran.

### Fonctionnalités à compléter

- [ ] 📐 🟡 **#279** Ajouter 3 champs au formulaire de production : DESCRIPTION DÉTAILLÉE des consignes, FORMAT ET MISE EN PAGE, REMISE
  - Refactor `refactor/productions` mergé le 17 mai. Chantier prêt dès qu'une capture de référence est fournie par Grégoire (placement exact, type d'input).
  - Impact : `afficherFormProduction`, `lireDonneesFormulaireProduction`, `construireProductionData`, `prerenseignerFormulaireProduction` + affichage côté consultation.

- [ ] 📐 🟢 **#275** Rétroactions visuelles enrichies dans la synthèse
  - Aujourd'hui : seulement les courts descriptifs de palette. Insuffisant pour rétroaction pédagogique significative.
  - À explorer : phrases complètes par critère/niveau, pistes d'amélioration, forces observées, ou génération assistée depuis le contexte production. Décision conceptuelle à prendre avant code.

- [ ] 🟢 **#240** Tampon visuel pour jetons (Délai, Reprise, Reprise ciblée) sur les travaux annotés
  - Cliquer sur le mot du jeton → curseur tampon → appose « JETON DE DÉLAI/REPRISE/REPRISE CIBLÉE » en rouge majuscule.
  - Une fois tamponné, checkbox du jeton se coche auto. Même mécanisme que les tampons existants. PDF montre clairement le jeton appliqué.

- [ ] 🟢 **#18** Tooltips d'aide au survol — déploiement progressif par zone (chantier continu)
  - Mécanisme : `data-tooltip="cle"` + moteur `tooltips.js` + base `tooltips-contenu.js`.
  - **Complété** : En-tête (10), Réglages Trimestre (29), Préférences (12), Dépistage (14), Données (14), Évaluations (84 clés actives au 13 mai 2026).
  - **Reste** : Planification, Présences, Construction de la note, Tableau de bord, Boîte à outils, Aide.

- [ ] 📦 **#2** Guide PDF pour utilisateurs — reformulé 11 mai 2026
  - Décision : ne PAS produire un guide générique. À fusionner avec le matériel pédagogique de la cohorte CoP (8 rencontres sept 2026 → avril 2027, voir `docs/CALENDRIER.md` §8.3).
  - Version « papier » pour AQPC peut être dérivée de `docs/securite/SECURITE-POUR-ENSEIGNANTS.md` (à écrire post-Défense E).

### Codex / Onboarding

- [ ] 🟢 **#233** Simplifier le flux Codex pour l'utilisateur lambda (Mac + iPad)
  - Concept de fichier ZIP transportable complexe pour non-technicien. Safari sans FSAPI (chaque save = nouveau téléchargement). iPad WebKit imposé.
  - Pistes : assistant premier lancement, détection navigateur + adaptation instructions, guidage remplacement fichier sur clé USB.

### Reserve / Archives — extension

- [ ] 🟢 **#257 v2.B** Ouvrir la réserve v2.B — mode consultation namespace temporaire
  - Suite de #257 v2.A (livré 28 avril). Effort estimé : 5-6 h.
  - Use cases : adapter une grille A2024 pour H2026, démo trimestre passé en formation, récupérer un cartouche bien rédigé retiré de la bibliothèque active.
  - Mécanisme : namespace temporaire `__archive_a2025_*` séparé du trimestre actif, lecture seule. Panneau « Contenu de l'archive » + bouton « Réimporter dans mes bibliothèques actives ».

### Données démo (utiles AQPC et expérimentateurs)

- [ ] 🟡 **#273** Évaluations démo basées sur de vrais travaux d'élèves anonymisés
  - Consentement obtenu de plusieurs élèves H2026. Travaux à anonymiser avant intégration au pack démo.
  - Périmètre : 2-3 dossiers complets (annotation Apple Pencil + évaluation grille + rétroaction structurée).
  - Préfixe `PROD_DEMO_` obligatoire (#86 : `PROD_` seul matche les vraies productions).
  - **Visée double** : valider flux bout-en-bout + servir d'exemples concrets aux nouveaux utilisateurs (AQPC 3 juin et après).

- [ ] 🟢 **#274** Produire des cartes mentales démo pour le matériel pédagogique (été 2026)
  - 2-3 cartes complètes couvrant différentes disciplines. Utile pour la cohorte CoP (Rencontre 5 « Aligner sa pratique », janvier 2027).
  - Période cible : été 2026 (préparation pendant la phase expérimentateurs juin-août).

### Recherche / Analyse longitudinale

- [ ] 🟢 **#35** Import historique H2024 (premier trimestre du portfolio, pratique sommative uniquement)
  - Baseline pour comparaison longitudinale (pas de PAN, pas de RaI).
  - Données disponibles : TSV artefacts, étudiants, évaluations. Même méthode d'import que A2024.

- [ ] 🟢 **#36** Rapport comparatif inter-trimestres (H2024, A2024, A2025, H2026)
  - Variables système (+Portfolio H24, +PAN A25, +RaI A25, +Patterns A25) + variables pratique.
  - **Hypothèse principale** : RaI (A25) → enseignant plus proactif → interventions précoces → moins de décrochages → meilleures moyennes.
  - **Potentiel communication AQPC** si résultats concluants.
  - **Prérequis** : #35.

- [ ] 🟢 **#245** Interventions N3 dans le profil étudiant — progression temporelle
  - Les interventions N3 (individuelles) ne sont pas significatives au niveau du groupe.
  - Approche : marqueur sur la courbe P individuelle + delta P avant/après. Prérequis : graphique de progression individuel existant.

- [ ] 🟢 **#241** Analyser l'impact des jetons de reprise sur P dans les courbes d'intervention
  - Quand un étudiant utilise un jeton, P change rétroactivement → masque l'effet réel d'une intervention.
  - Objectif : marquer les séances avec jetons, ou calculer un P « sans reprises » pour isoler l'effet net.

### Module Travaux — Phase 1 import (mars 2026, en suspens)

- [ ] 🟢 **#177** Import par dossier complet Lea (A1)
  - Lire le dossier téléchargé, parser noms `Nomdefamille_DA_Travail_Date`. Associer auto via DA.
  - Gestion des doublons (garder le dépôt le plus récent).

- [ ] 🟢 **#178** Assemblage multi-images par élève (A3)
  - Détecter fichiers multiples d'un même élève (même DA, même production).
  - Ordonner par nom/horodatage, assembler en document multi-pages. Le groupement existe déjà (`grouperSelection()`) — l'automatiser.

### Module Planification

- [ ] 📦 🟢 **#140** Organisateur — Refonte layout deux colonnes (horizon automne 2026)
  - Layout vertical actuel = trop de scroll. Cible : colonne gauche (vue d'ensemble leçon) + panneau droit (3 modes : Détail / Enseignement explicite / Vue calendrier).
  - Plan complet : `plans de travail/PLAN-ORGANISATEUR-LAYOUT.md`.
  - Inclus dans la complétion du module Alignement à l'automne 2026, pour Rencontre 5 « Aligner sa pratique » (janvier 2027).

### Module Évaluation — refactor architectural

- [ ] 🟢 **#272** Remplacer les 5 flags globaux + setTimeout imbriqués par un module `eval-chargement.js` (machine à états)
  - Coordonne ouverture fichiers et chargement évaluations. 5 flags + chaînes setTimeout (150-800ms) non annulables.
  - Cause race conditions, flags collants, restauration aveugle du mode Évaluer.
  - 5 phases, 6 points d'entrée à migrer. Plans détaillés : `plans de travail/Plan — Machine a etats pour le chargement d'evaluations.txt` + `Contre-expertise — Machine a etats eval-chargement.md`.
  - **Priorité** : moyenne — à planifier quand les correctifs de session ne suffisent plus.

### Rythme Phase 5 — Raffinements

- [ ] 📦 🟢 **#268** Courbe d'apprentissage de l'évaluateur (tendance temporelle par activité)
- [ ] 📦 🟢 **#269** Export du portrait temporel pour réflexion professionnelle
- [ ] 📦 🟢 **#270** Drill-down par activité → détail productions/groupes
- [ ] 📦 🟢 **#271** Planification multi-productions avec priorités

### Sécurité / Modes alternatifs

- [ ] 🟢 **#47** Mot de passe optionnel pour sauvegarde/restauration
  - AES-256 via Web Crypto API. Couvre la protection au repos (fichier exporté en local), distincte de la signature ECDSA prévue pour la Voûte (Défense F, juillet 2026).
  - Décision D3 du 11 mai 2026 a écarté le chiffrement au repos pour la Voûte ; cet item reste pertinent pour les sauvegardes personnelles cloud/USB.
  - À reconsidérer après Voûte Phase 1.

- [ ] 📦 🟢 **#33** Mode Tableur — Saisie directe des résultats (POST v1.0)
  - Utiliser l'app sans créer productions/grilles/échelles. Entrée directe des résultats comme dans un tableur.
  - Public cible : enseignants avec leur propre système d'évaluation ou voulant un outil simple.
  - Prérequis : documenter la logique complète avant codage.

---

## Notes

### Priorités

- **Retours testeurs** passent TOUJOURS AVANT ce backlog (politique CLAUDE.md).
- Items classés par thème, pas par ordre d'exécution. Le plan d'exécution recommandé vit dans `plans de travail/PLAN-TRAVAIL-26-MAI.md`.

### Pour ajouter un item

```markdown
- [ ] [emoji catégorie] **#XX** Description courte
  - Détail 1
  - Détail 2
```

### Pour marquer comme complété

1. Changer `[ ]` en `[x]` et ajouter `✅ LIVRÉ (date, build)`.
2. Déplacer l'item entier (avec son contexte) dans `BACKLOG-ARCHIVE.md`, dans une nouvelle section datée ou en ajoutant à la section existante.
3. Si pertinent : noter dans `SESSION.md` la livraison + référence au commit.

### Historique

Tous les items livrés/abandonnés/obsolètes (313 items au 25 mai 2026) sont consultables dans `BACKLOG-ARCHIVE.md` (2 198 lignes, organisé chronologiquement par beta/session).
