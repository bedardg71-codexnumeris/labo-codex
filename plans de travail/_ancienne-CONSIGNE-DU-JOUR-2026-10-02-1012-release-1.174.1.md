# Consigne du jour – mettre en ligne l'ancien `.zip` par la case (#1012, suite)

> Écrite par Cowork le 2 octobre 2026 à 7 h 50 (Toronto, mesurée par `date`). Remplace la consigne de 6 h 54, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-02-1012-ancien-zip-par-la-case.md`. L'ordre des chantiers du 1er octobre, 13 h 02, ne change pas.

## Où on en est

Ton commit `d49e7100` (branche locale `fix-1012-ancien-zip-par-la-case`) est relu : **vert, aucune correction**. Lis `plans de travail/VERDICT-RELECTURE-2026-10-02-1012-ancien-zip-par-la-case.md` en entier avant de commencer : ton exception du § 3 est retenue, tes deux suppositions sont justes. Grégoire a accepté la ligne des Nouvelles (« oui », à 7 h 49).

**`BACKLOG.md` : Grégoire t'autorise à y écrire.** En te transmettant cette consigne, il donne son accord pour les inscriptions ci-dessous. Si le garde de permissions refuse encore, arrête-toi sur ce seul point, n'y touche par aucun détour, et dis-le-lui : il répondra à l'invite.

## Ce que tu fais, dans cet ordre

1. **Commite et pousse les commits de documents de `main`**, avec les fichiers de Cowork qui traînent dans l'arbre, tels quels : le verdict, cette consigne, l'ancienne archivée, et `CONSIGNE-SUIVANTE-2026-10-02-1012-selection.md` (ne l'exécute pas : elle s'ouvre après la fusion de ce lot, sur une consigne de Cowork).
2. **Inscris sous #1012**, sans rien corriger : les sept lignes du § 10 de ta demande, puis les deux relevés du verdict (copies et notes de deux sources ; le coût de la vérification au magasin). Écris aussi que **les quatre cases (« Annotations », « Notes », « Étudiants », « Présences ») forment un lot du chantier du codex**, après la sélection : sans lui, le chantier n'est pas « clos ».
3. **La release** (skill `release-et-changelog`, `scripts/release.mjs`). L'intention, à toi de la juger par le skill : aucun geste nouveau à l'écran, je penche pour un patch. La ligne des Nouvelles, acceptée par Grégoire, à poser telle quelle, espaces insécables selon l'usage du fichier :
   - Titre : « Un ancien fichier ouvert dans Réglages ne fait plus perdre de copies. »
   - Texte : « Quand tu ouvres un ancien fichier .zip par « Ouvrir un Codex… » et que tu coches « Fichiers travaux », ses copies s'ajoutent maintenant aux tiennes au lieu de prendre leur place. Ton codex, à sa prochaine mise à jour, les contient toutes. »
4. **Verdict Playwright complet, puis push, puis fusion vers `main`** (règle 2). Si le verdict demande une correction de code, arrête-toi et rends-la à Cowork avant de pousser.
5. **Constate la mise en ligne chez Netlify**, et dis l'heure mesurée.
6. **La porte terrain, le markdown** : `plans de travail/PORTES-TERRAIN-2026-10-02-1012-ancien-zip-par-la-case.md`. Cowork publiera l'artefact jumeau. Ce qu'elle lève : ton § 9, le vrai magasin de Chrome, que ton banc imite. Les contraintes :
   - **en fenêtre privée de Chrome**, sur le Mac ; **rien n'écrit dans le vrai fichier de codex de Grégoire** : aucune rangée ne clique « Mettre à jour le codex » si l'application tient son fichier ;
   - elle demande **un ancien `.zip` avec copies** que Grégoire a déjà. Première rangée : en a-t-il un ? S'il n'en a pas, la porte attend un cas réel ; il ne fabrique pas de fichier pour elle ;
   - **une seule case cochée, « Fichiers travaux »** : les quatre autres remplacent encore (inscrit, non corrigé), et la porte ne doit pas le montrer comme un échec ;
   - le résultat se lit **à l'écran, en nombres** : combien de copies avant, combien après, à un endroit que tu nommes au mot près (la Liste des évaluations, ou ce que ton banc lit de plus proche) ; le bilan de l'import, son texte attendu.
   Le « si ça finit autrement » : une ouverture de son codex refusée faute d'espace en fenêtre privée n'est pas un échec de la porte.
7. **`RELAIS.md` et `OU-EN-EST-ON.md` à jour.** Le chantier du codex n'est pas clos : il lui reste la sélection exportée sans ses copies (consigne prête) et les quatre cases ; et deux affaires de mots, qui attendent Grégoire (la copie vraiment perdue, « fichier ZIP » dans la fenêtre d'une ouverture complète). Écris-le ainsi.

## Ce que tu ne fais pas

Ni la sélection, ni les quatre cases, ni les mots en attente : chacun a son lot.

## Ce que tu rends

À Grégoire, trois lignes : le numéro en ligne et l'heure constatée ; le résultat du verdict complet (instables compris) ; où est la porte, et si elle attend un ancien `.zip`. Ce que tu as supposé, en une ligne.
