# Consigne suivante – une sélection exportée dit quand des copies lui manquent (#1012, dernier lot du codex)

> Écrite par Cowork le 2 octobre 2026 à 7 h 22 (Toronto, mesurée par `date`), pendant que le lot de la case est en cours. **Ne s'ouvre qu'une fois le lot de la case fusionné sur `main`** : une seule session écrit dans `js/`. Elle deviendra alors `CONSIGNE-DU-JOUR.md`. L'ordre des chantiers du 1er octobre ne change pas : c'est le dernier lot du point 1 (le codex, jusqu'à « clos »).

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
