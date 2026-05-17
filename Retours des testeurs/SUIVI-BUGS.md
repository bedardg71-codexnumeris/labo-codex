# Suivi des bugs testeurs

> **Objectif** : Tracker les bugs rapportés par les testeurs pour éviter le travail en double.
> **Dernière mise à jour** : 17 mai 2026

---

## Ouverts

| # | Testeur | Date | Description | Priorité | Fichier(s) concerné(s) |
|---|---------|------|-------------|----------|------------------------|
| 96 | Claude (audit refactor) | 15 mai 2026 | `importerProductions(eventOuEl)` utilise `event.target.value = ''` à la ligne 2972, mais le paramètre s'appelle `eventOuEl` — la variable `event` n'est pas définie dans le scope IIFE. Probablement masqué par `window.event` (rétro-compat Chrome/Safari) en pratique. Faux-positif possible en delegation pure où `eventOuEl` est un élément. | Basse | js/productions.js |
| 97 | Claude (audit refactor) | 15 mai 2026 | Wrappers en bas de productions.js (lignes 3872-3943) référencent `window.productionEnCoursEdition` (lecture 3883/3938, reset 3916), mais cette variable n'est jamais positionnée à une valeur non-null dans le code (la state du formulaire utilise `productionEnEdition` déclarée dans config.js:133, sans `window.`). Conséquence : `definirProductionActive(id)` après save (ligne 3889) et `annulerFormProduction()` après suppression d'item actif (ligne 3939) ne se déclenchent jamais. Code mort fonctionnel. | Basse | js/productions.js |
| 98 | Claude (refactor étape 4) | 16 mai 2026 | Notification « Production ajoutée » affichée même en modification. Cause : `annulerFormProduction()` (appelée à la fin de `sauvegarderProduction`) met `productionEnEdition` à `null` AVANT que la branche de notification ne lise la variable pour décider entre « ajoutée » et « modifiée ». Pré-existe au refactor du 16 mai (préservation comportementale stricte — bug conservé pour ne pas brouiller la validation comportementale). Correction post-refactor : capturer `productionEnEdition` dans une const locale au début de `sauvegarderProduction` avant l'appel d'annulation, puis lire la const pour la notification. | Basse | js/productions.js (résidu, helper `rafraichirInterfaceApresSauvegarde`) |

---

## Corrigés (4 avril 2026)

| # | Testeur | Date rapport | Corrigé | Build | Description | Correction |
|---|---------|--------------|---------|-------|-------------|------------|
| 95 | Grégoire | 4 avril | 4 avril | 0404-1104 | Cartouche de rétroaction non chargée au premier chargement | Données IDB pas encore en mémoire lors de la sélection. Retry (8×250ms) au lieu d'un seul setTimeout (travaux-ui.js) |
| 94 | Grégoire | 4 avril | 4 avril | 0404-1104 | TypeError `note_algo_*` null dans calculerNoteAlgorithmiqueSimple | Éléments DOM absents quand la fonction est appelée avant le rendu des critères. Guards null ajoutés sur 4 accès (evaluation.js) |
| 93 | Grégoire | 4 avril | 4 avril | 0404-1104 | Toolbar badges (pills étudiants) et sélect production absents | `ouvrirFichier()` créait la visionneuse avec `_htmlBadgesGrille` vide (session restaurée sans passer par `afficherFichiers()`). Génération garantie avant création + régénération défensive au retour (travaux-ui.js) |
| 92 | Grégoire | 4 avril | 4 avril | 0404-1104 | Critères non affichés — palette Évaluation vide malgré grille sélectionnée | Ordre d'exécution : échelle configurée APRÈS `chargerGrilleSelectionnee()`, donc `echelleId` vide → critères non rendus. Échelle déplacée AVANT dans `afficherPalettesEval()` et `chargerProduction()` (travaux-ui.js, evaluation.js) |
| 91 | Grégoire | 4 avril | 4 avril | 0404-1104 | Palettes disparues après Éditer → retour Annoter et évaluer | Cas 1 de `initialiserModuleTravaux()` faisait `return` après `activerAnnotation()` sans restaurer les palettes flottantes. Ajout `afficherPalettesAnnotation()` (travaux-ui.js) |
| 90 | Grégoire | 4 avril | 4 avril | 0404-1104 | Bilan affiche « Ta force : Structure (M) » de l'élève précédent | `evaluationEnCours` jamais réinitialisé au changement d'élève/production → `chargerGrilleSelectionnee()` restaurait les critères par nom. Reset quand DA ou productionId change dans `afficherPalettesEval()` et `basculerMode()` (travaux-ui.js) |
| 89 | Grégoire | 4 avril | 4 avril | 0404-1104 | ReferenceError `_majBtnPause` à chaque sauvegarde d'évaluation | Fonction inexistante appelée dans `arreterChrono()`. Remplacée par `_majAffichageChrono()` (travaux-ui.js) |

---

## Corrigés (16 mars 2026)

| # | Testeur | Date rapport | Corrigé | Build | Description | Correction |
|---|---------|--------------|---------|-------|-------------|------------|
| 87 | Grégoire | 16 mars | 16 mars | 0316-0825 | Suppression définitive dans la corbeille ne supprime pas l'évaluation liée | 2.7 Fallback silencieux : `supprimerDefinitivement()` ne supprimait que le fichier (blob), pas l'évaluation dans `evaluationsSauvegardees`. Ajout nettoyage par (etudiantDA, productionId) dans suppression unitaire et vider corbeille (liste-evaluations.js) |
| 86 | Grégoire | 16 mars | 16 mars | 0316-0825 | Renommage du codex perdu au rechargement — export utilise l'ancien nom | 2.6 Concurrence : `actionRenommer()` écrivait en IDB via fire-and-forget. `syncToLocalStorageCache` au démarrage écrasait avec l'ancien état IDB. Ajout `await db.set()` explicite (codex.js) |
| 85 | Grégoire | 16 mars | 16 mars | 0316-0825 | Format rétroaction « Code » ignoré — toujours « Note chiffrée » par défaut | 2.7 Fallback silencieux : `cocherOptionsParDefaut()` cherchait par `p.id` uniquement, échouait quand `pratiqueId` est un type (`pan-standards`). Ajout fallback par `p.type` (evaluation.js) |
| 84 | Grégoire | 16 mars | 16 mars | 0316-0825 | Grille générique revient après suppression via bouton édition | 2.5 État résiduel : `supprimerGrilleActive()` ne marquait pas l'ID dans `ressourcesSupprimees` — 4e chemin de suppression manqué par le fix #83 (grilles.js) |
| 83 | Grégoire | 16 mars | 16 mars | 0316-0825 | Ressources supprimées (échelles, grilles, cartouches) réapparaissent au chargement | 2.5 État résiduel : `assurer*()` réinjectaient les gabarits hardcodés à chaque init. Ajout clé IDB `ressourcesSupprimees` consultée avant réinjection (main.js, echelles.js, grilles.js, cartouches.js, donnees-v2.js) |
| 82 | Grégoire | 16 mars | 16 mars | 0316-0825 | Modal preview config bloqué — bouton Fermer inopérant (ReferenceError) | 2.4 Export window manquant : `fermerModalPreviewConfigComplete` non exposée sur `window` (import-export.js) |
| 81 | Grégoire | 16 mars | 16 mars | 0316-0825 | Bouton « Dupliquer » ne fonctionne pas dans les grilles de critères | 2.7 Mismatch type : `dupliquerGrilleActive()` passait l'objet complet au lieu de `.id` à `dupliquerGrilleDepuisSidebar()` (grilles.js) |

## Corrigés (24 février 2026)

| # | Testeur | Date rapport | Corrigé | Description | Correction |
|---|---------|--------------|---------|-------------|------------|
| 69 | Grégoire | 24 fév | 24 fév | Statuts « Évalué » perdus après navigation Tableau de bord → retour | Namespace manquant `cle()` dans rapport-bug.js ; appel redondant `afficherFichiers()` retiré de navigation.js ; diagnostic console.warn ajouté |
| 70 | Grégoire | 24 fév | 24 fév | Badge étudiant disparu de la toolbar visionneuse | Restauration du `<span#travaux-badge-fichier-actif>` dans la toolbar HTML + peuplement dans `ouvrirFichier()` (travaux-ui.js) |
| 71 | Grégoire | 24 fév | 24 fév | Perte silencieuse de données inter-cours (modifier/verrouiller/supprimer) | 4 fonctions utilisaient `obtenirDonneesSelonMode` (filtré par cours) avant sauvegarde → écrasait les évaluations des autres cours. Remplacé par `db.getSync(cle(...))` dans evaluation.js et liste-evaluations.js |
| 72 | Grégoire | 24 fév | 24 fév | Badge « EN COURS » au lieu de « ÉVALUÉ » + cadenas 🔒 manquant | Fichiers importés sans `productionId` ne matchaient pas les évaluations (correspondance exacte `''` vs `'artefact1'`). Recherche assouplie : si fichier sans productionId, accepter toute évaluation pour l'étudiant. Cadenas ajouté sur badges après auto-verrouillage dans `sauvegarderEvaluationModifiee()` |
| 73 | Grégoire | 24 fév | 24 fév | Bouton « Évaluer » ne fonctionne pas après navigation TB → retour | `modeCourant` restait à `'evaluer'` après navigation (palettes DOM détruites sans appel à `fermerModeEvaluation()`). `basculerMode('evaluer')` retournait immédiatement. Corrigé : reset `modeCourant = 'annoter'` dans `initialiserModuleTravaux()` (travaux-ui.js) |
| 74 | Grégoire | 24 fév | 24 fév | Export affiche le mauvais groupe (gr.2 au lieu de gr.8) | `peuplerDropdownGroupeCoursActif()` validait le groupe actif contre la liste filtrée (`dansSidebar !== false`). Un groupe masqué était considéré invalide → auto-sélection du premier visible. Corrigé : validation contre `tousGroupesCours` (trimestre-v2.js:5652) |
| 75 | Grégoire | 24 fév | 24 fév | Export Lea : compteur « 23 évalué(s) sur 23 » au lieu de 21 (mauvais groupe) | `mettreAJourCompteurLea()` et `exporterPourLea()` utilisaient `obtenirFichiersProduction()` sans filtre groupe. Corrigé : `obtenirFichiersGroupeActif()` + match par `productionId` sélectionnée |
| 76 | Grégoire | 24 fév | 24 fév | Production non identifiée au rechargement (select vide, critères vides) | `fichier.productionId` vide malgré évaluation sauvegardée. Corrigé : propagation productionId/etudiantDA/groupeCoursId vers le fichier dans `sauvegarderEvaluation()` + fallback sécuritaire dans `ouvrirFichier()` (1 seule production → auto-select) |
| 77 | Grégoire | 24 fév | 24 fév | Synthèse rétroaction absente de l'export PDF | `ajouterPageSynthese()` matchait par `fichier.productionId` (vide). Corrigé : paramètre `productionIdOverride` propagé via `exporterPourLea()` → `genererDocPDF()` → `ajouterPageSynthese()` |
| 78 | Grégoire | 24 fév | 24 fév | Note chiffrée affichée malgré « Lettre seulement » dans pratique | Cascade de priorité inversée : évaluation sauvegardée primait sur la pratique. Corrigé dans `travaux-export-pdf.js` et `evaluation.js` : pratique > évaluation > défaut |
| 79 | Grégoire | 24 fév | 24 fév | Compteur « 21 annotés » alors que tous sont évalués | `determinerStatutFichier()` utilisait un matching strict (`productionId === productionId`), échouant pour fichiers sans productionId. Corrigé : même matching souple que `genererBadgeFichierImporte()` |
| 80 | Grégoire | 24 fév | 24 fév | Fichiers « Non associés » malgré évaluations existantes | Rétro-propagation des métadonnées (productionId, groupeCoursId) depuis les évaluations vers les fichiers orphelins à l'initialisation du module |
| 81 | Grégoire | 24 fév | 24 fév | Archivage affiche fichiers du mauvais groupe + compteur « 44 fichiers » | Rétro-propagation `groupeCoursId` basée sur l'appartenance réelle de l'étudiant (groupeEtudiants + groupesCours). Compteur filtré par groupe actif |
| 82 | Grégoire | 24 fév | 24 fév | Archivage ne se rafraîchit pas au changement de groupe | `afficherArchivage()` manquant dans les handlers de changement groupe-cours (trimestre-v2.js) |
| 83 | Grégoire | 24 fév | 24 fév | Checkboxes rétroaction décochées au chargement d'évaluation existante | `verifierEtChargerEvaluationExistante()` restaurait les valeurs sauvegardées (souvent `false`). Remplacé par `cocherOptionsParDefaut()` |
| 84 | Grégoire | 24 fév | 24 fév | Déverrouiller une évaluation déverrouille TOUTES les autres + cadenas disparus | `basculerVerrouillageEvaluationCourante()` utilisait `obtenirDonneesSelonMode` (filtré) → écrasait les données. Corrigé : `db.getSync(cle(...))` + rafraîchissement badges |

---

## Corrigés (Beta 97.8)

| # | Testeur | Date rapport | Corrigé | Build | Description | Correction |
|---|---------|--------------|---------|-------|-------------|------------|
| 68 | Grégoire | 16 fév | 16 fév | 0216-* | ReferenceError mettreAJourBoutonsNavigation + "Pas de cours pour ce groupe" | Export window.mettreAJourBoutonsNavigation + fallback horaire cours actif dans validerDateSaisie (saisie-presences.js) |

---

## Corrigés (Beta 97.6)

| # | Testeur | Date rapport | Corrigé | Build | Description | Correction |
|---|---------|--------------|---------|-------|-------------|------------|
| 64 | Elise | 13 fév | 13 fév | 0213-1351 | Sauvegardes Réglages impossibles (enseignant, horaire, groupe-cours) | afficherNotificationSucces/Erreur non exportées vers window — wrappers locaux + exports (trimestre-v2.js, evaluation.js, groupe.js) |
| 65 | Elise | 13 fév | 13 fév | 0213-1351 | Erreur console e.target.closest dans tooltips | Guard typeof check avant .closest() (tooltips.js:151,159) |
| 66 | Elise | 13 fév | 13 fév | 0213-1530 | 0 étudiants affichés — filtrage silencieux si champ groupe absent | Inclusion étudiants sans groupe dans obtenirDonneesSelonMode et obtenirEtudiantsCoursActif (modes.js) |
| 67 | Elise | 13 fév | 13 fév | 0213-1530 | Rapport bug affiche "Cours actif: undefined" | Lecture infoCours au lieu de listeCours (rapport-bug.js) |

---

## Corrigés (Beta 96.2)

| # | Testeur | Date rapport | Corrigé | Build | Description | Correction |
|---|---------|--------------|---------|-------|-------------|------------|
| 57 | Grégoire | 1er fév | 1er fév | 0201-0756 | Suppression grilles impossible | Retrait références #optionsImportExportGrilles (js/grilles.js) |
| 58 | Grégoire | 1er fév | 1er fév | 0201-0756 | Import productions non détectées | Support clés namespacées *_productions (js/import-export.js) |
| 59 | Grégoire | 1er fév | 1er fév | 0201-0756 | Horaires non trouvés - aperçu présences vide | Utilisation cle('horaires') dans 4 fichiers |
| 60 | Grégoire | 1er fév | 1er fév | 0201-0756 | Cours A25 sauvegardé comme H2026 | Fix reinitialiserFormCoursV2() (js/trimestre-v2.js) |
| 61 | Grégoire | 1er fév | 1er fév | 0201-0756 | Section Trimestre tronquée sur iPad | Media queries responsive (styles.css) |
| 62 | Grégoire | 1er fév | 1er fév | 0201-0756 | Erreur "reglages-horaire introuvable" | Références mises à jour vers reglages-trimestre |
| 63 | Grégoire | 1er fév | 1er fév | 0201-0756 | FR: Supprimer pratiques hors-bibliothèque | Nouvelle fonction supprimerPratiqueHorsBibliotheque() |
| 56 | Grégoire | 31 jan | 1er fév | 0201-0808 | Nommage exports sans horodatage complet | Format YYYY-MM-DD-HH-MM-SS (js/import-export.js) |
| 51 | Bruno | 5 jan | 1er fév | 0201-0815 | Horaire heures non piles (8h55) | Input type="time" remplace dropdown (index.html) |
| 49 | Jordan | 18 jan | 1er fév | 0201-0820 | Import CSV Omnivox (SA + accents) | Encodage Windows-1252 + SA flexible col 5/6 |
| 50 | Bruno, Olivier | 5-6 jan | 1er fév | 0201-0825 | Primo config incomplète (jour semaine) | creerHoraireDansBanquePrimo lit horaireHebdo namespacé |
| 53 | Olivier | 6 jan | 1er fév | 0201-0830 | Menu Format horaire ne se met pas à jour | mettreAJourOptionsFormatHoraire() dynamique |
| 52 | Jordan | 18 jan | Beta 95.5 | - | Erreurs null objectifs.js et trimestre-v2.js | Vérifications if (!element) ajoutées |
| 54 | Grégoire | 30 jan | Beta 96.2 | - | Message "Partage impossible" peu visible | Déjà en rouge (fond #f8d7da, bordure #dc3545) |
| 55 | - | 31 jan | 31 jan | 0131-1510 | Pratique configurable non trouvée dans registre | Nouvelle fonction construireConfigComplete() |
| 48 | - | 31 jan | 31 jan | 0131-1510 | Import données personnelles bloqué | Checkbox "C'est ma propre sauvegarde" + préservation IDs |
| 37 | - | 25 jan | 25 jan | - | Incohérence indice P vs Note finale | calculerEtStockerIndicesCP() utilise calculerDetailsNoteFinale() |

---

## Notes

### Priorités
- **Haute** : Bloque une fonctionnalité principale
- **Moyenne** : Gêne l'utilisation mais contournable
- **Basse** : Cosmétique ou cas rare

### Pour ajouter un bug
1. Créer une entrée dans la section "Ouverts"
2. Assigner un numéro séquentiel (prochain : **#89**)
3. Documenter dans le sous-dossier du testeur si fichiers/screenshots fournis

### Pour marquer comme corrigé
1. Déplacer la ligne vers la section "Corrigés" appropriée
2. Ajouter la date de correction
3. Résumer brièvement la correction
4. Optionnel : préfixer la correction par `[VERT]` si testé et confirmé par Grégoire (sinon le statut sera « jaune » = en attente de confirmation testeur)

### resolutions.json — auto-généré

> **Ne jamais éditer `resolutions.json` manuellement.**

Le fichier `resolutions.json` est généré automatiquement par `scripts/generer-resolutions.js` à partir de ce document. Il est regénéré à chaque build.

**Workflow simplifié :**
1. Éditer ce fichier (`SUIVI-BUGS.md`) — c'est la seule source de vérité
2. Lancer un build (`./scripts/update-version.sh build`) ou régénérer seul (`./scripts/update-version.sh resolutions`)
3. Commit + push — les testeurs voient le résultat dans l'app

**Logique des statuts :**
- Section « Ouverts » → 🔴 rouge
- 1re section « Corrigés » (la plus récente) → 🟡 jaune (sauf si `[VERT]` en début de correction → 🟢 vert)
- Sections « Corrigés » plus anciennes → 🟢 vert
