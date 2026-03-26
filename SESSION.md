# SESSION ACTIVE — BETA 98.9

**Date** : 26 mars 2026
**Version** : Beta 98.9 (Build 0326-0750)
**Statut** : Assainissement sécurité terminé. Réparation données EN COURS.

---

## URGENT — Réparation données (prochaine session)

### Situation
Les données sont réparties entre Safari et Chrome avec des références incohérentes.
Safari = données les plus complètes (présences correctes, trimestres passés).
Chrome = corrections de code appliquées mais données corrompues par import Safari.

### Marche à suivre (dans Safari)
1. Ouvrir l'app dans **Safari** (navigateur de travail quotidien)
2. Ouvrir la console Safari (Cmd+Option+C)
3. Coller le script `fix-data.js` (fichier à la racine du projet)
4. Recharger la page
5. Vérifier : 25 personnes gr.00002, 24 personnes gr.00008
6. Vérifier : graphiques de présences corrects
7. Supprimer le cours XSS s'il est encore là (Réglages → Cours)
8. Sauvegarder un **Codex depuis Safari** → ce codex devient la référence unique
9. NE PAS importer de Codex dans Chrome tant que les données Safari ne sont pas validées

### Script de correction (fix-data.js à la racine)
Corrige en une passe : groupesCours, étudiants (coursId + groupeCoursId),
productions, évaluations, présences, suppression cours XSS, reconstruction snapshots.

### Attention
- Ne PAS ouvrir un Codex Safari dans Chrome (ça écrase les corrections)
- Les cache busters `?v=` sont INOPÉRANTS en file:// — quitter le navigateur pour forcer le rechargement
- Les DA sont des strings — le dispatcher ne les convertit plus en nombre (fix < 10000)

---

## Chantier terminé : Assainissement sécurité + Audit (25-26 mars 2026)

### Résumé
- ~1302 handlers inline → 0 (Phases 0-6)
- CSP `script-src 'self'` active
- Audit lots A-H complet (imports ZIP, catch vides, innerHTML XSS, FSAPI, architecture)
- 5 règles sécurité non négociables dans CLAUDE.md
- Bug navigation profil Préc./Suiv. corrigé (DA auto-conversion < 10000)
- Bug Chart.js canvas reuse corrigé (destroy avant recréation)

### Commits de la session
Voir `git log --oneline` pour la liste complète (~32 commits).

---

## Pour reprendre
1. Lire ce fichier
2. Appliquer le script fix-data.js **dans Safari**
3. Valider les données
4. Sauvegarder un Codex de référence
5. Puis continuer le backlog normal
