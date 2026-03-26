# SESSION ACTIVE — BETA 98.9

**Date** : 26 mars 2026
**Version** : Beta 98.9 (Build 0326-0750)
**Statut** : Assainissement sécurité + audit terminés. Données réparées.

---

## Chantier terminé : Assainissement sécurité + Audit (25-26 mars 2026)

### Phases 0-6 — Migration handlers inline (~1302 handlers → 0)
- Dispatcher `data-action` / `data-on-change` / `data-on-input` / etc. dans main.js
- CSP `script-src 'self'` active, 9 blocs script externalisés dans `init-inline.js`
- Zéro handler inline exécutable dans tout le projet

### Audit sécurité (Lots A-H)
- **A** : `validerZipSecurite()` centralisée + `validerMagicBytes()` pour images/PDF
- **B** : 62 catch vides → `console.warn` contextualisé
- **D1-D2** : 27 `echapperHtml()` ajoutés sur innerHTML vulnérables (7 fichiers)
- **E** : FSAPI abort/error dans codex.js, décisions architecturales documentées (db.js)
- **F** : Stratégie cache indices documentée (indices.js), fichiers protégés intacts
- **H** : 5 règles de sécurité non négociables ajoutées dans CLAUDE.md

### Réparation des données
- Cours XSS de test (`601-XSS <img src=x...>`) supprimé (résidu sprint 22 mars)
- Groupe-cours 00002 reconfiguré (était lié au cours XSS)
- `coursId` corrigé sur 51 étudiants + 10 productions + 180 évaluations + 927 présences
  (`COURS1766455789356` → `h2026-601-101-MQ-00001`)
- `groupeCoursId` ajouté aux 51 étudiants (champ manquant)
- Snapshots historiques reconstruits pour groupe 00002 (17 semaines)

### Corrections techniques connexes
- `chargerVersionJSON()` et `verifierMiseAJourDistante()` : guard `file://` (CORS Chrome)
- `chargerResolutions()` : guard `file://`
- Cache busters mis à jour sur 7 scripts modifiés
- `groupe.js` : sélecteurs `[onclick*=...]` → `[data-action=...]`

---

## Pour la prochaine session
1. Lire ce fichier → `docs/00-START-HERE.md`
2. Plan d'audit : `plans de travail/Plan - Audit sécurité et dette technique.md`
3. Lot G (console.log cleanup) est optionnel — 2781 occurrences dans 102 fichiers
4. Les données sont réparées et fonctionnelles pour les deux groupes

## Architecture de délégation (référence)
```
Dispatcher click : data-action, data-param/2/3, data-stop, data-prevent, data-close-on-bg
Dispatcher change/input/keyup/mousedown/focusin : data-on-change, etc. + data-param/2
Dispatcher dragstart : data-drag-data="type:value"
CSP : script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:
```
