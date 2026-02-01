# Suivi des bugs testeurs

> **Objectif** : Tracker les bugs rapportés par les testeurs pour éviter le travail en double.
> **Dernière mise à jour** : 1er février 2026 (Build 0201-0808)

---

## Ouverts

| # | Testeur | Date | Description | Priorité | Fichier(s) concerné(s) |
|---|---------|------|-------------|----------|------------------------|
| 49 | Jordan | 18 jan | Import CSV Omnivox : colonne SA non reconnue + accents mal gérés | Moyenne | js/trimestre-v2.js |
| 50 | Bruno, Olivier | 5-6 jan | Primo : configuration incomplète après wizard | Moyenne | js/primo-modal.js |
| 51 | Bruno | 5 jan | Création horaire : permettre heures non piles (8h55) | Moyenne | js/trimestre-v2.js |
| 53 | Olivier | 6 jan | Menu "Format horaire" ne se met pas à jour automatiquement | Basse | js/trimestre-v2.js |

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
2. Assigner un numéro séquentiel (prochain : **#64**)
3. Documenter dans le sous-dossier du testeur si fichiers/screenshots fournis

### Pour marquer comme corrigé
1. Déplacer la ligne vers "Corrigés"
2. Ajouter la date de correction et le build
3. Résumer brièvement la correction
