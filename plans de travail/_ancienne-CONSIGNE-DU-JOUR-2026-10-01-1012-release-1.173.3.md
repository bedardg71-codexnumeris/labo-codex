# Consigne du jour – mettre en ligne le premier lot de #1012 (le bilan qui reste, le fichier d'origine tenu à bon droit)

> Écrite par Cowork le 1er octobre 2026 à 13 h 40 (Toronto, mesurée par `date`). Remplace la consigne de 12 h 41, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-01-1012-fichier-d-origine-et-bilan.md`. L'ordre des chantiers de 13 h 02 ne change pas ; il est dans `RELAIS.md`.

## Où on en est

Ton commit `39241b59` (branche locale `fix-1012-fichier-d-origine-et-bilan`) est relu : **vert, aucune correction**. Lis `plans de travail/VERDICT-RELECTURE-2026-10-01-1012-fichier-d-origine-et-bilan.md` en entier avant de commencer. Grégoire a accepté la ligne des Nouvelles (« ça marche », à 13 h 40).

## Ce que tu fais, dans cet ordre

1. **Pousse les deux commits de documents de `main`** (règle de relais). Commite avec eux les fichiers de Cowork qui traînent dans l'arbre : le verdict, cette consigne, les anciennes consignes archivées.
2. **Inscris sous #1012**, sans rien corriger : (a) « Exporter une sélection » entre dans le lot de l'avertissement, avec la règle du verdict (jamais dans le fichier tenu, destination jamais adoptée, toujours demander) ; (b) l'ancien fichier ouvert par la case, qui écrit dans l'espace sans faire oublier le fichier tenu : lu par Cowork, pas exécuté, à mesurer par le geste dans le lot de l'avertissement.
3. **La release, en patch** (skill `release-et-changelog`, `scripts/release.mjs`). La ligne des Nouvelles, acceptée par Grégoire, à poser telle quelle dans l'entrée de la mineure 1.173, titre en tête, espaces insécables selon l'usage du fichier :
   - Titre : « Le bilan d'un codex incomplet reste à l'écran. »
   - Texte : « Quand des copies n'ont pas pu revenir à l'ouverture d'un codex, une fenêtre le dit, explique comment les retrouver, et reste là jusqu'à ta réponse. Dans Chrome, un fichier que tu as choisi puis refusé n'est plus celui que « Mettre à jour le codex » réécrit. »
4. **Verdict Playwright complet, puis push, puis fusion vers `main`**, dans l'ordre de la règle 2 : rien n'a changé depuis la relecture, hormis la release. Si le verdict demande une correction de code, arrête-toi et rends-la à Cowork avant de pousser.
5. **Constate la mise en ligne chez Netlify** (numéro servi), et dis l'heure mesurée.
6. **La porte terrain, le markdown** (skill `portes-terrain`) : `plans de travail/PORTES-TERRAIN-2026-10-01-1012-bilan-qui-reste.md`. Cowork publiera l'artefact jumeau. Trois rangées, aucune n'écrit dans le vrai fichier de Grégoire, et il ne clique nulle part « Mettre à jour le codex » :
   - le numéro de version affiché ;
   - dans une fenêtre privée de Chrome, son vrai codex ouvert par le menu Codex : la fenêtre « Codex ouvert, mais incomplet » porte ses mots, reste à l'écran tant qu'il n'a pas répondu, et aucun bandeau jaune ne passe ;
   - après « Annuler » dans cette fenêtre, le menu Codex : sous « Mettre à jour le codex », le sous-texte « Dans le même fichier » n'apparaît pas. Il regarde, il ne clique pas.
   Ce que la porte ne lève pas, dis-le dans le markdown : qu'un fichier refusé avant toute écriture laisse le fichier d'avant tenu, dans le vrai Chrome. Le voir demanderait d'écrire dans son vrai codex.
7. **`RELAIS.md` et `OU-EN-EST-ON.md` à jour.** La fiche #1012 reste ouverte : il lui reste l'avertissement, les mots des autres causes, l'export de sélection, l'ancien fichier par la case.

## Ce que tu ne fais pas

- Tu ne codes ni l'avertissement, ni les mots des autres causes, ni la correction de l'export de sélection : ils attendent les mots de Grégoire et auront leur consigne.
- Tu ne lis pas l'espace de travail réel de Grégoire : le compte des copies sans fichier se fera au lot suivant, avec son accord.
- Tu ne supprimes pas les branches fusionnées de toi-même.

## Ce que tu rends

À Grégoire, trois lignes : le numéro en ligne et l'heure constatée ; le résultat du verdict complet (instables compris) ; où est la porte. Ce que tu as supposé, en une ligne.
