# Plan — Archivage et stockage inter-trimestres

**Date** : 5 avril 2026
**Statut** : Réflexion initiale — à reprendre post-colloque AQPC (juin 2026)
**Priorité** : Post-trimestre

---

## Problématique

Les fichiers originaux (images des travaux d'élèves) s'accumulent dans IndexedDB :
- ~100 Mo par production (25 élèves)
- 10 productions = ~1 Go par groupe
- Plusieurs groupes = plusieurs Go
- Safari file:// a des limites de stockage non documentées
- Les trimestres passés restent chargés inutilement

## Contraintes identifiées

1. **Qualité** : les originaux doivent rester exploitables (exemples en classe, relecture)
2. **Comparaison inter-trimestres** : la progression temporelle et les indices A-C-P nécessitent un accès aux données passées
3. **Pas de serveur** : l'application fonctionne 100% hors-ligne (file://)
4. **Allégement actuel (NdG 800px)** : trop destructif — perte de couleur + résolution insuffisante pour relecture

## Piste retenue : archivage deux niveaux

### Trimestre actif
Tout en mémoire : originaux, annotations, évaluations. Aucun changement.

### Trimestre terminé
1. **Exporter les fichiers images** sur disque (ZIP via Codex — déjà en place)
2. **Purger les fichiers images** de l'application (IndexedDB)
3. **Conserver les données structurées** : évaluations, indices, notes, annotations, snapshots (~Ko)
4. Les données structurées suffisent pour la comparaison inter-trimestres
5. Pour revoir un original → ouvrir le ZIP sur disque

## Options abandonnées

- **Compression PDF** : jsPDF côté client ne permet pas de compression sans perte significative
- **Réduction EXPORT_SCALE** : baisse de qualité visible, inutile pour l'archivage
- **Allégement systématique** : perte de couleur et de résolution, inutilisable comme exemple

## Chantier technique (à planifier)

- Modifier `db.js` : fonction de purge sélective par trimestre (fichiers seulement)
- Modifier le flux Codex : intégrer l'export ZIP comme prérequis à la purge
- UI : section « Fin de trimestre » avec workflow guidé (exporter → confirmer → purger)
- Vérifier : quelles données structurées sont nécessaires pour la progression inter-trimestres
- Tester : limites réelles d'IndexedDB dans Safari file:// sur MacBook et iPad

## Décisions à prendre (post-colloque)

- Seuil de déclenchement : purge automatique vs manuelle ?
- Granularité : par trimestre, par groupe, par production ?
- Réversibilité : peut-on ré-importer un ZIP purgé ?
