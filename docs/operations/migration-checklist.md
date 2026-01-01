# Checklist de migration de donnees

**Version** : 1.0
**Date** : 1er janvier 2026

Cette checklist DOIT etre suivie pour toute migration de donnees.

---

## PHASE 0 : PREPARATION (OBLIGATOIRE)

- [ ] **Backup complet**
  - Export via Reglages -> Import/Export
  - Sauvegarder : `backup-pre-[NOM_MIGRATION]-YYYY-MM-DD.json`
  - Verifier taille fichier (> 0 Ko)

- [ ] **Commit Git avec tag**
  ```bash
  git add .
  git commit -m "Etat stable avant migration [NOM]"
  git tag v[VERSION]-pre-[NOM_MIGRATION]
  git push origin main --tags
  ```

- [ ] **Documenter etat actuel**
  - Noter valeurs de reference (3 etudiants minimum)
  - Capturer screenshots (tableau de bord, profil etudiant)
  - Lister fichiers qui seront modifies

- [ ] **Executer validation-architecture.js**
  - Identifier incoherences existantes
  - Noter dans SESSION.md

---

## PHASE 1 : MIGRATION

- [ ] **Lire la documentation de la migration**
  - Comprendre POURQUOI cette migration
  - Identifier les risques
  - Prevoir temps necessaire

- [ ] **Executer script de migration**
  - Copier-coller dans console (pas execution aveugle)
  - Observer chaque etape
  - Noter anomalies dans SESSION.md

- [ ] **Verifier logs console**
  - Aucune erreur rouge
  - Warnings attendus seulement
  - Succes confirme

---

## PHASE 2 : VALIDATION

- [ ] **Validation technique**
  - Application se charge sans erreur
  - Aucun message 404 ou reference manquante
  - localStorage coherent

- [ ] **Validation donnees**
  - Comparer valeurs de reference (Phase 0)
  - Tolerance : +/-0.1% pour arrondis
  - 100% identiques requis

- [ ] **Validation fonctionnelle**
  - Parcours utilisateur complet
  - Tous les workflows testes
  - Aucune regression detectee

- [ ] **Executer validation-architecture.js POST-migration**
  - Comparer rapport PRE vs POST migration
  - Amelioration confirmee
  - Aucune nouvelle incoherence

---

## PHASE 3 : FINALISATION

- [ ] **Documentation**
  - Mettre a jour SESSION.md
  - Ajouter entree dans docs/decisions/
  - Mettre a jour MEMORY-PINS si necessaire

- [ ] **Commit Git**
  - Message detaille avec resultats validation
  - Tag de version
  - Push vers remote

- [ ] **Export post-migration**
  - Backup complet apres migration reussie
  - Comparer taille avec backup pre-migration
  - Archiver les deux versions

---

## PHASE 4 : COMMUNICATION

- [ ] **Testeurs (si applicable)**
  - Notifier du changement
  - Expliquer impact (ou absence d'impact)
  - Demander vigilance sur bugs

- [ ] **Documentation projet**
  - Mettre a jour CHANGELOG
  - Ajouter note dans ARCHITECTURE si changement majeur

---

## EN CAS DE PROBLEME

### Rollback immediat

```bash
# Restaurer le tag pre-migration
git checkout v[VERSION]-pre-[NOM_MIGRATION]

# Verifier que l'application fonctionne
open index.html

# Si OK, creer branche de secours
git checkout -b rollback-[NOM_MIGRATION]
git checkout main
git merge rollback-[NOM_MIGRATION]
```

### Restaurer backup

```bash
# Dans l'application
Reglages -> Import/Export -> Importer
Selectionner : backup-pre-[NOM_MIGRATION]-YYYY-MM-DD.json
```

### Diagnostic

1. Executer `validation-architecture.js`
2. Comparer rapport PRE vs POST migration
3. Identifier exactement ce qui a change
4. Documenter dans SESSION.md section DEVIATIONS
5. Alerter Gregoire immediatement

---

**Ne JAMAIS sauter la Phase 0.**
**Ne JAMAIS ignorer une erreur de validation.**
**En cas de doute, rollback d'abord, investiguer ensuite.**
