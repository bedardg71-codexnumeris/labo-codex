# Consigne du jour – les mots du chantier du codex, et sa clôture (#1012)

> Écrite par Cowork le 2 octobre 2026, de 13 h 58 à 15 h 08 (Toronto, mesurée par `date`), décision par décision, sous le nom `CONSIGNE-SUIVANTE-2026-10-02-1012-mots.md` ; ouverte à 15 h 08, 1.174.4 étant en ligne (`main` = `5cc24c7f`). Remplace la consigne de mise en ligne de 12 h 54, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-02-1012-release-1.174.4.md`. Commite d'abord, tels quels, les fichiers de Cowork qui traînent dans l'arbre.

C'est le **dernier lot du chantier du codex**. Grégoire a décidé, à 15 h 08, que le chantier sera **clos** dès que ce lot sera en ligne.

## Ce que Grégoire a décidé, point par point

## 1. La fenêtre d'une ouverture complète (`js/codex.js`, `msgReload`, l. 3164 à 3167 sur `main` à `5cc24c7f`)

Accepté par Grégoire (« oui », 13 h 58). Le conseil de supprimer le fichier d'origine est **retiré** (ce fichier est son codex, sa seule copie hors de l'application ; sa limite du 20 septembre). « Le fichier ZIP d'origine reste dans Fichiers — tu peux le supprimer pour récupérer de l'espace. » devient :

> Ton fichier de codex n'a pas changé : garde-le, c'est ta copie hors de l'application.

Le reste de la fenêtre ne change pas (« Codex chargé depuis « … » (taille). » ; « Recharger la page pour appliquer les données ? »). Le commentaire du code au-dessus (« le rappel « tu peux supprimer le ZIP » ») est à réécrire en conséquence. L'ancienne ligne des Nouvelles (`changelog-data.js`, l. 1818) est de l'histoire : n'y touche pas.

## 2. La copie vraiment perdue — pas dans ce lot

Décidé par Grégoire (« oui », 14 h 38), sur la recommandation de Cowork : pas de geste ni de mots maintenant. Chez lui, aucune copie ne manque (mesuré le 1er octobre à 17 h 03), personne ne l'a vécu, et sa règle veut qu'une fiche n'entre au travail que sur un symptôme vécu. **Écris-le sous #1012 : en attente d'un cas réel ; n'empêche pas de clore le chantier.** Rien à coder.

## 3. « N date(s) de présences » : le nombre change, pas les mots

Décidé par Grégoire (« oui », 15 h 05), sur la recommandation de Cowork : les mots restent ; **le nombre compte des dates distinctes** (une date de cours, tous élèves confondus), et non plus des fiches (une par élève et par jour). Au bilan de l'import comme à son aperçu. Aucun mot neuf. Un banc : un fichier de 3 dates × 10 élèves dit « 3 date(s) de présences » aux deux endroits ; au bilan, seules les dates d'au moins une fiche entrée comptent.

## 4. Une ligne au bilan pour les élèves écartés

Accepté par Grégoire (« oui », 15 h 07). Quand l'import par cases écarte au moins un élève supprimé (la trace de 1.174.4), le bilan ajoute une ligne, mot pour mot :

> 1 élève que tu avais supprimé n'a pas été ramené.
> 2 élèves que tu avais supprimés n'ont pas été ramenés.

Le nombre compte des élèves (DA distincts écartés, toutes familles confondues), pas des entrées. Aucune ligne s'il n'y en a aucun. Si rien d'autre n'entre, la ligne doit quand même paraître (par exemple sous « Aucune nouvelle donnée à importer. ») ; la forme, à toi, sans autre mot neuf.

## 5. Les deux relevés de mots du bilan de la case — pas dans ce lot

Décidé par Grégoire (« oui », 15 h 08), sur la recommandation de Cowork : l'aperçu qui compte les copies du fichier quand le bilan compte celles qui sont entrées, et « 0 fichier(s) travaux + 1 PDF restauré(s) », restent inscrits sous #1012, sans lot (rares, non vécus, lus par l'enseignant seul). Rien à coder.


## 6. Ce qui reste visible d'un élève supprimé — un lot à part, hors du chantier

Décidé par Grégoire (« oui », 15 h 08), sur la recommandation de Cowork : **en faire un lot**, qui masque partout ce qui reste d'un élève supprimé (ses copies en « Fichier non associé » dans la Liste des évaluations et dans son compte, « Inconnu » dans Travaux, le PDF d'une copie), **sans rien effacer** (sa limite du 20 septembre). Ce lot sort du chantier du codex : il rejoint les lots isolés de l'ordre (point 2). **Inscris-le au BACKLOG comme une fiche à part**, avec ton relevé de la demande de l'élève désinscrit (§ 5) comme périmètre lu. Ne le code pas ici.

## Ce que tu fais, sur une branche

1. Remesure chaque point avant d'y toucher.
2. Code les points 1, 3 et 4 ; inscris les points 2, 5 et 6. Aucun autre mot neuf.
3. La preuve : un banc ou un essai par point codé (les mots exacts, accords compris ; le compte des dates ; la ligne des élèves écartés, présente et absente), des mutations rouges, Vitest complet.
4. **Pas de relecture croisée** (décision de Cowork) : ce lot change des mots et un compte, il n'écrit rien dans les données de l'usager. Arrête-toi quand même avant la release pour proposer à Grégoire une ligne des Nouvelles.
5. Puis, sur son accord : release (patch), verdict Playwright complet, push, fusion, mesure chez Netlify.
6. **`RELAIS.md`, `OU-EN-EST-ON.md` et le BACKLOG** : une fois en ligne, **le chantier du codex est clos** (décision de Grégoire). Écris ce qui reste inscrit sans lot : la copie vraiment perdue (en attente d'un cas réel), les deux relevés de mots du bilan, les autres cases qui remplacent, la porte de 1.174.1 (en attente d'un ancien `.zip`).

## Ce que tu rends

À Grégoire, trois lignes : ce qui est codé, en gestes ; la ligne des Nouvelles proposée ; ce que tu as supposé, en une ligne.
