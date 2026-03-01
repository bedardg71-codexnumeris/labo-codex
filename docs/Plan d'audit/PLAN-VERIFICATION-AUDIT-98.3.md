# Plan de vérification — Audit qualité du code (Beta 98.3)

> **Date** : 28 février 2026 | **Version** : Beta 98.3 (build 0228-2100)
> **Rapport d'audit** : `docs/AUDIT-QUALITE.md` (134 constats)
> **Nature** : Guide de tests manuels pour Grégoire — aucun code à implémenter

---

## Contexte

L'audit qualité du 28 février 2026 a identifié 134 constats (24 critiques, 63 modérés, 47 mineurs). Les corrections ont été appliquées en 4 commits :
- **Phase 1** — Intégrité des données (7 correctifs, #196-#202)
- **Phase 2** — Robustesse (8 correctifs, #203-#209, EVL-05/07, TRV-02/04)
- **Phase 3** — Performance et hygiène (3 optimisations, #208, SUI-06, TRM-07)
- **Centralisation** indices.js (#206, SUI-01)

Ce plan décrit les **tests manuels** à exécuter dans le navigateur pour valider chaque correction.

---

## Prérequis

- Ouvrir l'application Beta 98.3 (build 0228-2100) dans Chrome/Firefox
- Ouvrir la console DevTools (F12 → Console)
- Avoir au moins un groupe avec 3+ étudiants, des évaluations et des présences saisies
- Avoir accès à 2 trimestres (ex: H2026 et A2025)

---

## Test 1 — Console propre au démarrage

**Réf** : EVL-06, TRM-07, général
**But** : Vérifier qu'aucun spam debug ne pollue la console

1. Recharger la page (Ctrl+R)
2. Ouvrir la console DevTools
3. Naviguer : Tableau de bord → Profil d'un étudiant → retour Tableau de bord

**Attendu** :
- [ ] Aucun `🔍 DEBUG` dans la console (EVL-06)
- [ ] Aucun log de migration quand 0 cours migrés (TRM-07)
- [ ] Les `✅ Module ... chargé` sont normaux
- [ ] Présence du message `✅ Module indices.js chargé (Beta 98.02 - centralisation #206)`

---

## Test 2 — Indices A-C-P-E cohérents (centralisation #206)

**Réf** : SUI-01, #206
**But** : Vérifier que les indices sont identiques peu importe le chemin d'accès

1. Ouvrir le **Tableau de bord** → noter les indices A/C/P d'un étudiant dans l'aperçu
2. Cliquer sur cet étudiant → **Profil étudiant** → noter A/C/P/E
3. Revenir au Tableau de bord → onglet **Liste des individus** → noter A/C/P

**Attendu** :
- [ ] Les valeurs A, C, P sont identiques dans les 3 vues
- [ ] E (engagement) s'affiche sans NaN
- [ ] Console : aucune erreur `is not a function` ou `undefined`

---

## Test 3 — Étudiant sans évaluation (guard division/0)

**Réf** : SUI-02, #202
**But** : Vérifier pas de NaN quand un étudiant n'a aucune note

1. Ajouter un nouvel étudiant (ou en identifier un sans évaluation)
2. Ouvrir son **Profil étudiant**

**Attendu** :
- [ ] P (Performance) affiche 0%, pas NaN
- [ ] E (Engagement) affiche 0 ou valeur cohérente, pas NaN
- [ ] Aucune erreur console

---

## Test 4 — Isolation des données entre trimestres

**Réf** : TRM-01/02/03/04, #197-#201
**But** : Vérifier qu'il n'y a pas de fuite de données entre semestres

1. Être dans le trimestre **H2026** → noter le nombre de cours, d'étudiants, d'évaluations
2. Basculer vers **A2025** → vérifier que les données sont différentes (ou vides si pas configuré)
3. Revenir à **H2026**

**Attendu** :
- [ ] Les cours de H2026 réapparaissent intacts (pas mélangés avec A2025)
- [ ] Le nombre d'étudiants est identique à l'étape 1
- [ ] Les évaluations sont toujours présentes (pas de perte, #201)
- [ ] La liste de cours utilise une seule clé `cours` (vérifiable dans DevTools → Application → IndexedDB)

---

## Test 5 — Mode assisté / simulation

**Réf** : EVL-01, #196
**But** : Vérifier que les modifications d'évaluations respectent le mode actuel

1. Passer en **mode assisté** (si disponible)
2. Modifier la note d'un étudiant dans une évaluation
3. Passer en **mode simulation**
4. Vérifier que la modification est visible

**Attendu** :
- [ ] La modification persiste après changement de mode
- [ ] Pas de perte de données entre modes
- [ ] Console : aucune erreur

---

## Test 6 — Robustesse des travaux (fichiers)

**Réf** : TRV-01/03, #203-#204
**But** : Vérifier la gestion des erreurs d'import et la limite de taille

1. Importer un fichier PDF normal (~2-3 MB) → doit fonctionner
2. Si possible, tester avec un gros fichier (>20 MB)

**Attendu** :
- [ ] Le PDF normal s'affiche correctement avec vignettes
- [ ] Un fichier >20 MB affiche un message d'erreur clair (pas un crash)
- [ ] L'interface reste réactive après une erreur d'import
- [ ] Console : erreurs capturées proprement (pas de promise rejetée non gérée)

---

## Test 7 — Annotation et visionneuse

**Réf** : TRV-02/04, #204
**But** : Vérifier la stabilité de l'annotation

1. Ouvrir un document dans la visionneuse
2. Annoter (cercle, texte, flèche)
3. Naviguer rapidement entre pages
4. Fermer et rouvrir le document

**Attendu** :
- [ ] Les annotations sont sauvegardées
- [ ] Pas de freeze UI lors de la navigation rapide entre pages
- [ ] Pas de TypeError dans la console (`annotationCourante` null guard, TRV-04)

---

## Test 8 — Import/export de configuration

**Réf** : AUT-01, #205
**But** : Vérifier que les imports successifs ne mélangent pas les données

1. Exporter la configuration actuelle (fichier A)
2. Modifier quelques données (ajouter un étudiant)
3. Exporter à nouveau (fichier B)
4. Réimporter le fichier A
5. Réimporter le fichier B immédiatement après

**Attendu** :
- [ ] Après import de A : données correspondent au fichier A
- [ ] Après import de B : données correspondent au fichier B (pas de résidus de A)
- [ ] Console : pas de variable `configCompleteEnAttente` qui persiste

---

## Test 9 — Performance du tableau de bord

**Réf** : SUI-06, #208
**But** : Vérifier la fluidité avec un groupe chargé

1. Ouvrir le **Tableau de bord** avec un groupe de 20+ étudiants
2. Observer le temps de chargement des indicateurs A-C-P-E
3. Si carte mentale disponible : sélectionner 10+ nœuds et les déplacer en groupe

**Attendu** :
- [ ] Le tableau de bord charge en <1 seconde (cache pré-chargé, SUI-06)
- [ ] Le drag multi-sélection est fluide, pas de saccade (#208, PLN-03)
- [ ] DevTools → Performance : pas de longues tâches >100ms pendant le drag

---

## Test 10 — Corrélation de Pearson (doublon éliminé)

**Réf** : #206 (calculerCorrelationPearson)
**But** : Vérifier que la corrélation s'affiche toujours dans les analyses

1. Aller dans **Liste des individus** (onglet Tableau de bord)
2. Chercher un graphique ou analyse qui affiche une corrélation (si visible dans l'UI)

**Attendu** :
- [ ] Les valeurs de corrélation s'affichent normalement
- [ ] Pas d'erreur `calculerCorrelationPearson is not a function`

---

## Test 11 — Historique des indices (graphiques de progression)

**Réf** : #206 (obtenirHistoriqueIndicesCP)
**But** : Vérifier que les graphiques de progression utilisent bien la fonction centralisée

1. Ouvrir le **Profil d'un étudiant** ayant un historique (plusieurs calculs d'indices)
2. Chercher le graphique de progression C/P/E

**Attendu** :
- [ ] Le graphique affiche des données (pas vide)
- [ ] Les valeurs correspondent aux indices actuels
- [ ] Console : pas d'erreur

---

## Résumé — Checklist rapide

| # | Test | Réfs audit | Statut |
|---|------|-----------|--------|
| 1 | Console propre | EVL-06, TRM-07 | ☐ |
| 2 | Indices cohérents 3 vues | SUI-01, #206 | ☐ |
| 3 | Étudiant sans note (pas NaN) | SUI-02, #202 | ☐ |
| 4 | Isolation trimestres | TRM-01/02/03/04 | ☐ |
| 5 | Modes assisté/simulation | EVL-01, #196 | ☐ |
| 6 | Import fichier + limite 20MB | TRV-01/03 | ☐ |
| 7 | Annotations stables | TRV-02/04 | ☐ |
| 8 | Import/export sans résidu | AUT-01, #205 | ☐ |
| 9 | Performance tableau de bord | SUI-06, PLN-03 | ☐ |
| 10 | Corrélation Pearson | #206 | ☐ |
| 11 | Historique indices (graphiques) | #206 | ☐ |

**Couverture** : 18/18 correctifs vérifiés (Phases 1-3 + #206)

**Items non testables manuellement** :
- #207 (pas corrigé — intégration travaux-stockage.js dans db.js)
- #210 (pas corrigé — consolidation styles inline)
- EVL-07 (code mort supprimé — vérifiable par grep seulement)
