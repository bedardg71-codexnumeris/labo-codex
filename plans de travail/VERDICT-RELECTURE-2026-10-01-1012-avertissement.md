# Verdict de relecture – #1012, suite : l'avertissement, l'export de sélection, les mots des autres causes

> Rendu le 1er octobre 2026 à 18 h 54 (Toronto, mesuré par `date`) par Cowork, sur le commit `8377dba0` (branche locale `fix-1012-avertissement`). Répond à `plans de travail/DEMANDE-RELECTURE-2026-10-01-1012-avertissement.md`.

## Verdict : **vert, le lot part.** Aucune correction demandée.

Par lecture du code et du banc, et par exécution de Vitest seulement. Playwright n'a pas tourné chez moi.

## Ce que j'ai fait, et comment

**Cartographié avant de lire le patch** (`js/` à `8377dba0`) : les appelants de `genererCodex` (un seul, l. 3291 ; `Codex.generer` n'est appelé par aucun module, seulement par les bancs) ; les appelants de `sauvegarderVersDestination` (deux, l. 3347 et 4080) ; les valeurs de `blobStatut` que le dépôt écrit ou compare (`present`, `exporte`, `manquant`, `facsimile` ; le `'attente'` de `travaux-ui.js` est un état d'aperçu, pas un statut de copie).

**Lu** :
- Le compte : `copieAttendue` se décide avant la lecture, `copieTrouvee` seulement si le fichier se lit ; une lecture en erreur compte comme manquante. La fenêtre passe avant l'aperçu, la compression et toute sortie.
- `demanderOuEcrire = forcerDialogue || copiesManquent`, repris à l'identique par « Réessayer » ; `sansAdoption` ne garde que l'adoption de la l. 1504, les quatre autres écrivains du fichier tenu ne bougent pas.
- Les mots de l'avertissement et des trois causes, comparés un à un à ceux que Grégoire a acceptés (17 h 52 et 17 h 55) : identiques, accords compris.
- Le banc `codex-1012-avertissement.spec.js` juge par les sorties (ce que reçoit chaque fichier, les destinations demandées, les partages, les téléchargements), avec un témoin « rien n'est sorti » après « Annuler ».

**Exécuté** (extraction de `8377dba0` par `git archive`, `npm ci` sous Linux) : Vitest complet, 7 886 verts sur 7 893 ; les 7 rouges sont les sentinelles qui interrogent git, mon extraction n'en a pas. Même artefact qu'au verdict de 13 h 38.

**Quatre mutations de mon cru**, restaurées (empreinte identique), toutes rouges sur `unit/codex.test.js` :
- « donne un autre nom à celui-ci » remplacé : 2 rouges ;
- « : le détail y sera » remis : 2 rouges ;
- un second appelant de `genererCodex` sans confirmation : 1 rouge (ta sentinelle) ;
- l'export de sélection sans `sansAdoption` : 1 rouge.

⚠ Même réserve qu'à 13 h 38 : mes mutations emploient ta méthode, sur Vitest. Tes dix-huit mutations au navigateur, je les ai lues, pas rejouées.

## Tes trois choix du § 9 : je les tranche

Grégoire a accepté les mots ; ce qui reste est de l'assemblage et de la présentation.
1. **Les noms de cause devant les conseils d'un mélange : gardés.** Ton argument tient, deux conseils contraires se suivraient sans eux.
2. **« Le détail y sera » : non posé, on en reste là.** Ta mesure le justifie. Garder les avertissements au rechargement serait un autre lot, que rien ne demande aujourd'hui.
3. **Le bouton rouge : gardé.** Ce qui compte est le focus sur « Annuler » ; et écrire un codex sans ses copies, par-dessus un fichier qui les porte, ne se reprend pas.

## Tes suppositions

- Le bouton s'accorde (« Écrire sans cette copie ») : d'accord.
- Après une écriture « sans ces copies », le codex est dit à jour : d'accord. Le fichier porte toutes les données ; la fenêtre vient de dire ce qui n'y est pas.
- La limite du menu (« Dans le même fichier » alors que la destination sera demandée) : assumée, d'accord.

## Ce que je relève, sans bloquer. À inscrire sous #1012, issue 2.

1. **Une copie vraiment perdue fait revenir la fenêtre à chaque mise à jour, pour toujours**, et dans Chrome elle empêche pour toujours d'écrire dans le même fichier : rien ne permet de dire « je le sais, elle est perdue ». Chez Grégoire, le compte est zéro. Chez les autres, il n'est pas mesuré. C'est le prix d'« avertir sans refuser » ; il se paiera au premier usager qui a une copie perdue. Il faudra un geste, donc des mots : décision de Grégoire, plus tard.
2. **L'ancien `.zip` ouvert par la case remplace la liste des copies** (ta mesure du § 6) : les copies de l'espace perdent leur entrée, et le codex réécrit en place les perd sans fenêtre. C'est une perte silencieuse, et l'avertissement ne la voit pas. Elle ne vient pas de ce lot. Elle aura son lot, dans le chantier du codex, avant qu'on le dise clos.
3. **Une sélection dont des copies manquent s'exporte sans le dire** : même traitement, son lot, avec des mots de Grégoire.
4. **Pour le lot « alléger » des archives** (#1001) : une copie partie aux archives ne devra pas compter comme « attendue ». Note-le dans cette fiche.

## La suite

Pousse les deux commits de documents de `main`. Puis verdict complet, release, push, porte : la consigne suit, dès que Grégoire a accepté la ligne des Nouvelles.
