# Consigne du jour – mettre en ligne l'élève désinscrit (#1012)

> Écrite par Cowork le 2 octobre 2026 à 12 h 54 (Toronto, mesurée par `date`). Remplace la consigne de l'élève désinscrit, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-02-1012-eleve-desinscrit.md`. L'ordre des chantiers du 1er octobre ne change pas.

## Où on en est

Ton commit `8985dd12` (branche locale `fix/1012-eleve-desinscrit`) est relu : **vert, aucune correction**. Lis `plans de travail/VERDICT-RELECTURE-2026-10-02-1012-eleve-desinscrit.md` en entier : ta supposition sur la réinscription est retenue. Grégoire a accepté la ligne des Nouvelles, **dans la version retouchée par Cowork** (« oui », à 12 h 54).

## Ce que tu fais, dans cet ordre

1. **Commite et pousse les commits de documents de `main`**, avec les fichiers de Cowork qui traînent dans l'arbre, tels quels : le verdict, cette consigne, l'ancienne archivée.
2. **Inscris sous #1012** les deux relevés du verdict, sans rien corriger : l'ancienne valeur qui n'est pas une liste, non filtrée (issue 2) ; et ton relevé du § 5 (ce qui reste d'un élève supprimé, encore visible), **comme décision de Grégoire** : en faire un lot ou non.
3. **La release** (skill `release-et-changelog`, `scripts/release.mjs`) : patch, 1.174.4, la ligne dans l'entrée 1.174, son titre en tête, telle quelle :
   - Titre : « Un élève que tu supprimes ne revient plus par un ancien fichier. »
   - Texte : « Quand tu ouvres un ancien fichier par « Ouvrir un Codex… », rien de lui n'entre : ni sa fiche, ni ses copies, ni ses notes, ni ses présences, ni ses annotations. Cela vaut pour les élèves supprimés à partir de cette version ; un élève en décrochage n'est pas touché. »
4. **Verdict Playwright complet, puis push, puis fusion vers `main`** (règle 2). Si le verdict demande une correction de code, arrête-toi et rends-la à Cowork avant de pousser.
5. **Constate la mise en ligne chez Netlify**, et dis l'heure mesurée.
6. **Pas de porte terrain** : elle demanderait un ancien `.zip` que Grégoire n'a pas ; le banc juge par le geste. Écris-le dans `RELAIS.md`.
7. **`RELAIS.md` et `OU-EN-EST-ON.md` à jour.** Le chantier du codex n'a plus de lot de code. Il lui reste, tous à Grégoire : la copie vraiment perdue (des mots), « fichier ZIP » dans la fenêtre d'une ouverture complète (des mots), les mots du bilan de l'import (« N date(s) », et s'il veut une ligne pour les élèves écartés), et ce qui reste visible d'un élève supprimé (une décision). C'est Grégoire qui dira si le chantier est clos.

## Ce que tu rends

À Grégoire, trois lignes : le numéro en ligne et l'heure constatée ; le résultat du verdict complet (instables compris) ; ce qui reste au chantier du codex, en gestes. Ce que tu as supposé, en une ligne.
