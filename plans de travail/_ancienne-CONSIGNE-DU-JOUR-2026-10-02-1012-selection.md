# Consigne du jour – une sélection exportée dit quand des copies lui manquent (#1012, dernier lot du codex avant les quatre cases)

> Écrite par Cowork le 2 octobre 2026 à 7 h 22, pendant le lot de la case, sous le nom `CONSIGNE-SUIVANTE-2026-10-02-1012-selection.md` (commitée dans `8278669b`) ; **ouverte à 8 h 51** (Toronto, mesurée par `date`), le lot de la case étant en ligne et fusionné (1.174.1, `main` = `a64d976a`). Remplace la consigne de mise en ligne de 7 h 50, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-02-1012-release-1.174.1.md`. Le fichier `CONSIGNE-SUIVANTE-…` n'existe plus : il est devenu celui-ci. L'ordre des chantiers du 1er octobre ne change pas.

## D'abord

**La porte de 1.174.1 attend un cas réel** : Grégoire n'a pas d'ancien `.zip` avec copies (sa réponse à la rangée 0.1, 8 h 50). La porte n'a pas échoué ; il ne fabrique pas de fichier pour elle. Inscris-le dans `PORTES-TERRAIN-2026-10-02-1012-ancien-zip-par-la-case.md`, `RELAIS.md` et `OU-EN-EST-ON.md`, et commite avec eux les fichiers de Cowork qui traînent dans l'arbre, tels quels.

## Le défaut, lu par Cowork ce matin

Sur `main` (`js/codex.js`, `actionExporterSelection`, l. 4006 à 4035 environ) : la boucle des copies saute en silence toute copie dont `travauxStockage.recupererBlob` ne rend rien, puis l'écran dit « Export sélectif terminé », sans compte de copies. Mesuré par le geste par Claude Code le 1er octobre (BACKLOG, sous #1012) : après une ouverture où deux copies sur trois sont refusées, le fichier porte 1 copie sur 3. **Remesure avant d'ouvrir** : vérifie que le défaut vit encore là.

## La règle (technique, tranchée par Cowork)

La même fenêtre que l'avertissement de 1.174.0, posée avant d'écrire, « Annuler » ayant le focus, « Annuler » n'écrit rien. Elle compte les copies **attendues** de la sélection comme l'avertissement les compte (statut déclaré autre que « exporte ») : une copie « exporte » sans fichier n'est pas manquante. Aucune copie attendue ne manque : aucune fenêtre, rien ne change.

## Les mots, acceptés par Grégoire le 2 octobre à 7 h 21

- Titre : « Cette sélection n'aura pas toutes ses copies »
- Message : « N copies sur M ne sont pas dans l'application. Le fichier que tu vas écrire ne les contiendra pas. » (accord au singulier : « 1 copie sur M n'est pas… ne la contiendra pas », comme pour l'avertissement)
- Bouton : « Écrire sans ces copies » / « Écrire sans cette copie »

Pas de seconde phrase (« ne le remplace pas… ») : une sélection demande toujours où écrire et ne s'écrit jamais dans le fichier tenu (règle du 1er octobre). Aucun autre mot neuf.

## Ce que tu fais, sur une branche

1. Reproduis par le geste avant de corriger.
2. Corrige : de préférence une fonction de mots sœur de `construireAvertissementCopiesManquantes`, et le compte des attendues partagé avec l'avertissement plutôt que recopié.
3. La preuve : un banc par le geste (fenêtre, « Annuler » n'écrit rien, « Écrire sans ces copies » écrit le fichier), un témoin (une sélection complète ne montre aucune fenêtre ; une copie « exporte » sans fichier ne déclenche rien), des mutations rouges, Vitest complet.
4. Hors du lot : #991 (la sélection fabrique encore son fichier à l'ancienne, tout en mémoire). Même fonction, mais aucun symptôme vécu : issue 2, déjà inscrite. Ne le corrige pas.
5. Ce chemin n'écrit rien dans les données de l'usager : il écrit un fichier neuf, et l'avertissement ajoute un arrêt. Pas de relecture croisée obligatoire ; arrête-toi quand même avant la release pour une ligne des Nouvelles, proposée à Grégoire.

## Ce que tu rends

À Grégoire, trois lignes en gestes : ce qui est codé ; ce qui l'attend ; ce que tu as supposé, en une ligne. Une fois ce lot en ligne, il ne restera au chantier du codex que deux affaires de mots (la copie vraiment perdue, la fenêtre d'une ouverture complète qui dit « fichier ZIP ») ; c'est Grégoire qui dira si le chantier est « clos ».
