# Phase 5 — Parcours utilisateur & tests d'acceptation

**Statut** : à valider par Grégoire avant l'implémentation (sous-phase 5.A).
**Document directeur** : `plans de travail/PLAN-AUDIT-PHASE5-DEMO.md` §5.
**Dépend de** : `docs/AUDIT-PHASE5-PRE-TENTATIVE-2.md` (audits complets, Option A recommandée).
**Date** : 24 avril 2026.

---

## 1. Cadrage

Après les 3 audits, **Option A** est retenue (reproduction des étapes legacy via toggle rééécrit + retrait de `donnees-demo.js`). Pré-requis confirmés :

- **P1** — Latence `reconstruireSnapshotsHistoriques` au toggle ON acceptée (le legacy la fait déjà aujourd'hui sans gêner l'usage).
- **P2** — Pollution des 6 clés globales (`grillesTemplates`, `echellesTemplates`, `modalitesEvaluation`, `cours`, `listeCours`, `cartouches_*`) acceptée en statu quo — Phase 4.B filtre déjà l'affichage.
- **P3** — Bug cartouches (3 `cartouches_GRILLE1759*` orphelines après `quitterDemo`) accepté tant que le legacy n'est pas retiré. Il disparaît naturellement avec 5.D.

Ce document formalise **ce que l'utilisateur doit voir** à chaque clic, et **les critères d'acceptation** qui serviront de checklist manuelle à chaque sous-phase (5.A → 5.E).

Le parallèle avec le 22 avril : cette étape manquait — l'intention pédagogique (modélisation → aperçu peuplé) n'était pas explicitée, donc la tentative 5.A-5.B ne faisait que cacher/montrer des optgroups sans servir la modélisation. Ici on l'écrit noir sur blanc avant de coder.

---

## 2. Parcours utilisateur — clic par clic

### Parcours 1 — Entrée en démo depuis un état utilisateur réel (cas le plus courant)

**État initial** : Grégoire ouvre l'app. Trimestre actif = `h2026`. Un GC réel est actif (ex. 601-101-MQ-00001). Case « Données démo » sur l'accueil = décochée. Aperçu = peuplé avec ses vraies données A-C-P.

**Actions** :

1. Grégoire clique sur la case **« Données démo »** de l'accueil → case cochée visuellement.
2. (Côté code 5.B) :
   - `sauvegarderEtatAvantDemo()` → snapshot `demo-etat-precedent` = `{infoCours, groupeCoursActif, modeApplication, modalitesEvaluation, trimestres, listeCours, grillesTemplates, echellesTemplates, trimestreActifId:'h2026'}`
   - Pose flag `demo-actif='true'`
   - Upsert `{id:'demo', actif:true, isDemo:true}` dans `trimestres` global (toutes les autres entrées passent à `actif:false`)
   - Pose `trimestreActif='demo'` et `window.trimestreActif='demo'`
   - Lit `demo_listeCours` puis pose `infoCours = coursDemo`
   - Lit `demo_groupesCours` puis pose `groupeCoursActif = GC_DEMO`
   - Pose `demo_horaireSelectionne='HOR_DEMO'` et `demo_groupeSelectionne='0demo'`
   - Pose `modeApplication='normal'`
   - Appelle `genererCalendrierComplet()` (écrit `demo_calendrierComplet`)
   - Appelle `await reconstruireSnapshotsHistoriques()` (écrit `demo_snapshots_<coursId>`)
   - Appelle `calculerTousLesIndices()` si disponible (écrit `demo_indicesCP` + `demo_indicesAssiduite`)
   - Affiche bandeau vert « Mode démonstration » en bas d'écran
   - Appelle `peuplerDropdownGroupeCoursActif()` pour rafraîchir le header
   - Navigate `afficherSection('apercu')`
   - Appelle `rafraichirContenuSelonMode()` pour re-render la section visible
3. **Ce que Grégoire voit** :
   - Bandeau vert « Mode démonstration » en bas d'écran.
   - Header : dropdown GC montre `GC_DEMO (DEMO-601-101-MQ-0demo)`.
   - Section Aperçu affiche **20 étudiants démo** avec leurs barres A-C-P peuplées, compteurs d'artefacts/évaluations, indices de risque.
   - Sidebar Horaire : `HOR_DEMO (Lun-AM / Mer-PM)` sélectionné.
   - Sidebar Groupe d'étudiants : `0demo` sélectionné.
4. **Critère pédagogique** : la modélisation fonctionne — Grégoire voit ce que l'outil **produit** avec des données réalistes, pas juste une option cachée.

### Parcours 2 — Navigation pendant la démo

**État** : démo active (Parcours 1 terminé).

- **Contexte** → voit un GC démo actif `GC_DEMO`, cours `Écriture et littérature (Démo)`, enseignant `Primo Primavera`, horaire `HOR_DEMO`. Formulaires en lecture seule (Phase 4.B), bouton « Dupliquer pour créer mon X » visible.
- **Suivi** → voit la liste des 20 étudiants démo, leurs pratiques et évaluations, compteurs d'assiduité.
- **Évaluations** → voit les 200 évaluations démo sauvegardées, saisie fonctionnelle (écriture dans `demo_evaluationsSauvegardees`, pas dans `h2026_*`).
- **Planification** → voit la carte mentale démo « Écriture et littérature » (alimentée par `demo_planification_mindmap`, déplacée depuis `donnees-demo.js` en 5.A).
- **Réglages** → grilles/échelles affichent un optgroup « Démo » en plus de « Mes documents » (Phase 2 déjà livrée). Items démo non modifiables (Phase 4.B).
- **Aide, Accompagnement, Personnalisation** → inchangés, non impactés par le mode démo.

**Critère** : dans **toutes** ces sections, les données affichées sont exclusivement démo (tagged `isDemo`/`estDemo`), aucune donnée réelle `h2026_*` ne fuit.

### Parcours 3 — Sortie de la démo

**État initial** : démo active, Grégoire a exploré l'aperçu et navigué dans Contexte et Planification.

**Actions** :

1. Grégoire clique sur la case **« Données démo »** de l'accueil (ou sur le bouton « Quitter la démo » du bandeau vert) → case décochée.
2. (Côté code 5.C) :
   - Lit `demo-etat-precedent`
   - Filtre les clés globales pour retirer les items marqués `isDemo`/`estDemo` : `listeCours`, `cours`, `enseignants`, `grillesTemplates`, `echellesTemplates`, `cartouches_*` (toutes celles présentes dans le pack, pas hardcodées)
   - Retire `{id:'demo'}` de la liste globale `trimestres`
   - Pose `trimestreActif = etat.trimestreActifId` = `'h2026'` (et `window.trimestreActif`)
   - Active le trimestre restauré dans la liste globale : `trimestres.find(t=>t.id==='h2026').actif = true`
   - Restaure `infoCours = etat.infoCours`, `groupeCoursActif = etat.groupeCoursActif`, `modalitesEvaluation = etat.modalitesEvaluation`, `modeApplication = etat.modeApplication` (ou `'normal'`)
   - Appelle `genererCalendrierComplet()` pour recalculer le calendrier du trimestre restauré (`h2026_calendrierComplet`)
   - Supprime flag `demo-actif` et clé `demo-etat-precedent`
   - **Ne supprime pas** les clés `demo_*` (elles restent permanentes pour Phase 1)
   - Retire bandeau vert + classe `mode-demo` sur body
   - Appelle `peuplerDropdownGroupeCoursActif()` pour rafraîchir le header
   - Navigate `afficherSection('accueil')`
   - Appelle `rafraichirContenuSelonMode()`
3. **Ce que Grégoire voit** :
   - Case décochée, bandeau disparu.
   - Retour sur l'accueil.
   - Si Grégoire navigue à nouveau vers Aperçu : ses vraies données A-C-P sont là, comme avant.
   - Header : dropdown GC montre son vrai GC restauré.
4. **Critère** : zéro trace visible de la démo dans l'UI. Aucun résidu `isDemo` dans les globaux filtrés. Les clés `demo_*` Phase 1 **existent toujours** en storage (point crucial qui corrige le bug question 3).

### Parcours 4 — Premier démarrage utilisateur neuf (pas de trimestre réel)

**État initial** : première ouverture de l'app. `trimestres` global = `[]` (ou n'existe pas). Pas d'`infoCours`, pas de `groupeCoursActif`. Phase 1 a toutefois peuplé `demo_*` au boot (14 clés).

**Actions** :

1. Grégoire clique sur la case **« Données démo »** de l'accueil (pas encore de bannière de bienvenue puisque toggle dispo).
2. Code 5.B (identique au parcours 1) :
   - Snapshot = `{trimestreActifId: null, infoCours: null, groupeCoursActif: null, …}`
   - Upsert `{id:'demo', actif:true}` dans `trimestres` (vide → `[{id:'demo'}]`)
   - Tous les autres effets posés identiquement.
3. **Ce que Grégoire voit** :
   - Aperçu peuplé avec les données démo.
   - Pas besoin d'avoir créé un vrai trimestre préalablement.
4. **Décoche** → snapshot restauré = état vide. `trimestres` redevient `[]` (retrait du trimestre démo). `infoCours`/`groupeCoursActif` = null. Aperçu vide normal.

**Critère** : le toggle fonctionne même sans trimestre réel préalable. Grégoire peut découvrir l'outil en démo avant de créer ses propres données.

### Parcours 5 — Dupliquer un item démo depuis la démo

**État** : démo active, Grégoire regarde une grille démo dans la bibliothèque Réglages.

**Actions** :

1. Grégoire clique sur une carte de grille **démo** → formulaire s'ouvre en **lecture seule** (Phase 4.B).
2. Bouton « Dupliquer pour créer ma grille » visible et actif.
3. Grégoire clique → `BibliothequeUI.forkerItem()` crée un clone avec `inspireDe: {source:'demo', id:<id_demo>, auteur:'Labo Codex'}`, nouveau `id`, sans flag `estDemo`.
4. Redirection vers formulaire d'édition du clone avec focus sur le champ nom.
5. **Point crucial** : le clone est écrit dans **`grillesTemplates` global** (clé globale, pas namespacée), pas dans `demo_grillesTemplates`. Il est donc visible pour tous les trimestres, y compris le trimestre réel après sortie de démo.
6. Grégoire remplit le nom, clique Enregistrer → commit. La grille apparaît désormais dans la section « Mes documents » des sélecteurs (pas sous optgroup Démo).

**Critère** : le fork fonctionne pendant la démo comme hors démo. La grille dupliquée est la propriété de Grégoire (pas un `isDemo`).

### Parcours 6 — Rechargement de page en mode démo

**État** : démo active, Grégoire presse F5 ou Cmd+R (ou Safari iPad ferme-rouvre l'onglet).

**Actions attendues au boot** :

1. `demo-actif === 'true'` → l'app reste en mode démo sans repasser par le toggle.
2. `trimestreActif === 'demo'` (déjà en storage) → `cle('X')` route vers `demo_X`.
3. `infoCours` et `groupeCoursActif` déjà posés → les 85 lecteurs directs fonctionnent.
4. `demo_calendrierComplet`, `demo_snapshots_<id>`, `demo_indicesCP` déjà calculés → **pas besoin de recalculer**. L'aperçu s'affiche vite (< 500 ms post-boot).
5. `initialiserDemoNamespace` vérifie le flag de version et s'abstient de re-peupler (les clés `demo_*` sont là).
6. `afficherBandeauDemo(true)` au boot restaure le bandeau vert visible.
7. Grégoire voit l'aperçu peuplé immédiatement, sans re-clic.

**Critère** : le rechargement doit être imperceptible côté UX. Pas de flash d'aperçu vide suivi d'une repopulation. Test **particulièrement critique sur iPad Safari**.

---

## 3. Tests d'acceptation — checklist manuelle

À passer à chaque sous-phase pertinente (colonne « Sous-phase »). Test = ✅ si comportement observé sur Mac **ET** iPad.

| # | Critère | Sous-phase |
|---|---|---|
| C1 | Case « Données démo » cochée au démarrage (après F5) reste cochée, sans redéclenchement du toggle | 5.B + 5.C |
| C2 | Toggle ON pose `demo-actif='true'` en storage (vérifier via console `db.getSync('demo-actif')`) | 5.B |
| C3 | Toggle ON pose bien 5 pointeurs globaux : `trimestres` upsert demo actif, `trimestreActif='demo'`, `infoCours` = cours démo, `groupeCoursActif = GC_DEMO`, `modeApplication='normal'` | 5.B |
| C4 | Toggle ON pose les 2 clés sidebar : `demo_horaireSelectionne='HOR_DEMO'`, `demo_groupeSelectionne='0demo'` | 5.B |
| C5 | Toggle ON déclenche les 3 calculs dérivés : `demo_calendrierComplet`, `demo_snapshots_<coursId>`, `demo_indicesCP` / `demo_indicesAssiduite` existent après le toggle | 5.B |
| C6 | Bandeau vert « Mode démonstration » s'affiche en bas, classe `.mode-demo` sur `<body>` | 5.B |
| C7 | Aperçu peuplé avec **20 étudiants démo**, barres A-C-P non vides, compteurs > 0 | 5.B |
| C8 | Sidebar Horaire pré-sélectionnée sur `HOR_DEMO`, sidebar Groupe sur `0demo` | 5.B |
| C9 | Navigation Contexte → GC démo visible, formulaires en lecture seule (Phase 4.B déjà livrée, régression à surveiller) | 5.B |
| C10 | Navigation Planification → carte mentale démo visible (nécessite 5.A) | 5.A + 5.B |
| C11 | Toggle OFF restaure trimestre précédent, `trimestreActif === trimestreActifId_précédent`, `infoCours` et `groupeCoursActif` identiques à avant toggle ON | 5.C |
| C12 | Toggle OFF filtre les items `isDemo`/`estDemo` des 6 globaux : `listeCours`, `cours`, `enseignants`, `grillesTemplates`, `echellesTemplates`, `cartouches_*` | 5.C |
| C13 | Toggle OFF retire `{id:'demo'}` de la liste globale `trimestres` | 5.C |
| C14 | Toggle OFF ne supprime PAS les clés `demo_*` Phase 1 permanentes (vérifier via console `db.getSync('demo_groupeEtudiants').length === 20`) — **corrige le bug question 3** | 5.C |
| C15 | Toggle OFF retire le bandeau vert + classe `mode-demo` | 5.C |
| C16 | Toggle ON/OFF/ON : aucune donnée réelle (`h2026_*`, `a2025_*`) modifiée entre les deux toggles ON — vérifiable par diff `JSON.stringify(db.getSync('h2026_groupeEtudiants'))` avant/après | 5.B + 5.C |
| C17 | Rechargement F5 en démo : bandeau reste visible, aperçu reste peuplé sans re-calcul perceptible (< 500 ms après `db-ready`) | 5.B |
| C18 | Dupliquer un item démo pendant la démo : le fork atterrit dans `grillesTemplates` (ou autre template global) sans flag `estDemo`, visible après sortie de démo | 5.B (régression Phase 4.B) |
| C19 | Saisie d'une évaluation pendant la démo → écriture dans `demo_evaluationsSauvegardees`, pas dans `h2026_*` | 5.B |
| C20 | Après suppression `donnees-demo.js` en 5.D : aucune erreur console au démarrage, aucune référence à `window.entrerEnDemo` / `window.quitterDemo` / `window.nettoyerResiduDemo` dans le reste du code | 5.D |
| C21 | Après migration 5.E appliquée sur un profil utilisateur ayant des résidus legacy (ex. `isDemo` dans `listeCours`) : les résidus sont nettoyés au 1er boot, flag `migration-phase5-done` posé, 2e boot no-op | 5.E |
| C22 | **iPad Safari spécifique** — toggle cochage persiste après F5 (vérif cache-busters bumpés dans tous les commits concernés) | 5.B dès le premier commit |

### Protocole de test par sous-phase

- **5.A** : C10 seulement (carte mentale démo accessible via Planification sans entrer en démo).
- **5.B** : C1–C10, C17, C18, C19, C22 (le gros de la vérification). **Grégoire teste sur iPad avant d'approuver 5.C.**
- **5.C** : C11–C16 + re-vérification C1, C17. **Grégoire teste sur iPad avant d'approuver 5.D.**
- **5.D** : C20 + re-passage rapide C1–C17 pour s'assurer qu'aucune régression.
- **5.E** : C21.

### Plate-formes de test

- **MacBook Pro M3** (Safari 17+ et Chrome 119+). Mode privé + mode normal.
- **iPad Air M1** (Safari iPadOS 17+). **Test obligatoire dès 5.B**, pas seulement à la fin. Cache-busters bumpés dans chaque commit modifiant un `.js` (règle n°1 du post-mortem).

### Ce que Grégoire valide à chaque pause

Avant d'approuver la sous-phase suivante :

1. La sous-phase courante coche tous ses critères ci-dessus.
2. Pas de régression sur Phase 4.B (formulaires lecture seule + fork).
3. Aucune erreur rouge dans la console Safari iPad ni Mac.
4. Build ID affiché en haut de l'app = celui qui vient d'être commité (prouve que les cache-busters ont fonctionné).

---

## 4. Risques identifiés et mitigations

| Risque | Mitigation |
|---|---|
| `reconstruireSnapshotsHistoriques` lent (> 1 s) au toggle ON → UX dégradée | Aujourd'hui OK dans le legacy. À re-mesurer en 5.B sur les données démo réelles. Si lent, considérer un `setTimeout(0)` pour laisser le bandeau s'afficher avant. |
| `cleSnapshots()` retourne `demo_snapshots_<coursId>` où `coursId` varie (fait `infoCours._groupeCoursId \|\| infoCours.id`). Le cleanup legacy supposait `GC_DEMO` | En 5.C : nettoyer dynamiquement via `db.keys().startsWith('demo_snapshots_')` au lieu de hardcoder. |
| Les 3 `cartouches_GRILLE1759*` du pack non nettoyés au toggle OFF | Accepté en P3. Mais en 5.C : lister dynamiquement les `cartouches_*` présents dans le pack pour filter leurs items `estDemo`, pour ne pas empirer. |
| Résidus `demo-etat-precedent` orphelins si `entrerEnDemo` crashe entre snapshot et chargement | Le `try/catch` legacy rollback déjà. En 5.B : reproduire ce rollback. |
| Cache Safari iPad sert l'ancien code malgré les modifs | Cache-busters `?v=YYYYMMDDNN` bumpés **dans le même commit** que la modif `.js`. Test iPad systématique. |
| Utilisateur toggle ON pendant qu'un trimestre archivé est actif | Le snapshot doit capturer aussi `estTrimestreArchive()`. À tester. |
| Migration 5.E écrase des données utilisateur légitimes | Migration idempotente via flag. Scope strict : retirer uniquement items `isDemo:true` ou `estDemo:true`, jamais toucher aux autres. Test sur un backup Codex avant release. |

---

## 5. Suivi

| Étape | État |
|---|---|
| Parcours 1–6 rédigés | ✅ |
| Tests C1–C22 rédigés | ✅ |
| Validation Grégoire | ⏳ |
| 5.A — `demo_planification_mindmap` | ⏳ |
| 5.B — toggle ON rééécrit | ⏳ |
| 5.C — toggle OFF rééécrit | ⏳ |
| 5.D — retrait `donnees-demo.js` | ⏳ |
| 5.E — migration silencieuse résidus | ⏳ |

Mise à jour : 24 avril 2026 — document rédigé en attente de validation.
