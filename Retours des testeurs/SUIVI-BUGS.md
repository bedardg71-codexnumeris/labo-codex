# Suivi des bugs testeurs

> **Objectif** : Tracker les bugs rapportés par les testeurs pour éviter le travail en double.
> **Dernière mise à jour** : 24 février 2026

---

## Ouverts

| # | Testeur | Date | Description | Priorité | Fichier(s) concerné(s) |
|---|---------|------|-------------|----------|------------------------|

---

## Corrigés (24 février 2026)

| # | Testeur | Date rapport | Corrigé | Description | Correction |
|---|---------|--------------|---------|-------------|------------|
| 69 | Grégoire | 24 fév | 24 fév | Statuts « Évalué » perdus après navigation Tableau de bord → retour | Namespace manquant `cle()` dans rapport-bug.js ; appel redondant `afficherFichiers()` retiré de navigation.js ; diagnostic console.warn ajouté |
| 70 | Grégoire | 24 fév | 24 fév | Badge étudiant disparu de la toolbar visionneuse | Restauration du `<span#travaux-badge-fichier-actif>` dans la toolbar HTML + peuplement dans `ouvrirFichier()` (travaux-ui.js) |
| 71 | Grégoire | 24 fév | 24 fév | Perte silencieuse de données inter-cours (modifier/verrouiller/supprimer) | 4 fonctions utilisaient `obtenirDonneesSelonMode` (filtré par cours) avant sauvegarde → écrasait les évaluations des autres cours. Remplacé par `db.getSync(cle(...))` dans evaluation.js et liste-evaluations.js |
| 72 | Grégoire | 24 fév | 24 fév | Badge « EN COURS » au lieu de « ÉVALUÉ » + cadenas 🔒 manquant | Fichiers importés sans `productionId` ne matchaient pas les évaluations (correspondance exacte `''` vs `'artefact1'`). Recherche assouplie : si fichier sans productionId, accepter toute évaluation pour l'étudiant. Cadenas ajouté sur badges après auto-verrouillage dans `sauvegarderEvaluationModifiee()` |

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
2. Assigner un numéro séquentiel (prochain : **#73**)
3. Documenter dans le sous-dossier du testeur si fichiers/screenshots fournis

### Pour marquer comme corrigé
1. Déplacer la ligne vers "Corrigés"
2. Ajouter la date de correction et le build
3. Résumer brièvement la correction
