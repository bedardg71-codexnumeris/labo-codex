# Consigne du jour – chantier des archives, lot A2 : vérifier une archive

> Écrite le 30 septembre 2026 à 16 h 24 (Toronto) par Cowork. Deuxième lot de `PLAN-2026-09-30-chantier-archives.md`. Lis d'abord la fin de `PORTES-TERRAIN-2026-09-30-lot-A1-archive.md` (les deux ajouts de Cowork) : la porte du lot A1 est passée **dans Chrome, en mode dossier**, et Cowork a recalculé à la main 205 empreintes sur 205.
> **Condition de départ** : `main` à `2ca29f83` ou plus récent (1.171.1 en ligne). Branche neuve `lot-a2-verifier-archive`. **Ni release ni push avant la relecture de Cowork.**

## 1 · Ce que le lot doit produire, en gestes

Dans Réglages › Données › Archives, sur la ligne d'un groupe archivé, un bouton « Vérifier ». L'application relit l'archive, copie par copie, et dit ce qu'elle a trouvé. Une archive vérifiée le reste affiché, avec sa date. C'est la condition que Grégoire a posée pour qu'une copie puisse un jour quitter l'application (« relue et vérifiée par l'application »).

**Tes données, Grégoire** : rien n'est écrit dans tes trimestres ni dans l'archive. Seule la liste des archives note « vérifiée ».

## 2 · Ce que tu fais

1. **La vérification, dans les deux modes.**
   - Mode dossier (Chrome, Edge) : depuis le dossier des archives.
   - Mode fichier (Safari) : l'usager désigne le fichier `.zip` de l'archive.
   - Pour chaque copie déclarée dans `meta.json` (`integrite.travaux_sha256`) : présente, de la bonne taille, et son empreinte recalculée égale l'empreinte déclarée. L'empreinte de `donnees.json` aussi. Un fichier présent dans `travaux/` mais absent de la liste est signalé.
   - **Couverture** : chaque fiche de copie du groupe, telle qu'elle est aujourd'hui dans l'application, a sa copie dans l'archive. Le compte des fiches non couvertes est dit.
2. **La mémoire ne dépend pas du poids de l'archive.** En mode fichier, pas de `JSZip.loadAsync` sur le fichier entier (800 Mo mesurés pour 608 Mo) : lis le répertoire du ZIP par tranches du fichier, puis chaque copie une à la fois. La borne de 2 Go de `validerZipSecurite` ne doit pas s'appliquer à ce geste ; dis comment tu gardes la défense contre un ZIP hostile. Le moyen est à toi.
3. **Une archive sans empreintes** (faite avant 1.171.1) : elle n'est pas « vérifiée ». L'écran dit qu'elle est à refaire ; le compte et la taille peuvent être donnés, sans valoir vérification.
4. **Le résultat est retenu** dans la liste locale des archives : date, version, nombre de copies, et de quoi savoir que c'est **cette** archive qui a été vérifiée (son identifiant unique, et une empreinte de son `meta.json` ou l'équivalent). Un nouvel archivage du même groupe remet l'état à « non vérifiée ». Le lot A4 lira cet état.
5. **Le dossier que Chrome ne retient pas** (trouvailles de la porte, à inscrire de toute façon) : mesure pourquoi l'écran dit « Aucun dossier d'archives n'est actuellement lié » après un archivage réussi, et pourquoi Chrome a redemandé le dossier deux fois. Si la cause est petite, corrige-la ici, parce que « Vérifier » en a besoin ; sinon inscris-la et fais redemander le dossier au moment de vérifier. Même règle pour le garde-fou du mauvais niveau (le dossier `trimestres` choisi à la place de sa racine, ce qui a laissé un `manifeste-archives.json` isolé à 16 h 17). Dis ce que tu as retenu.
6. **L'autre trouvaille de la porte** : Chrome servait 1.170.2 à 15 h 04 alors que 1.171.0 était en ligne depuis 11 h 45. Mesure ce qui peut l'expliquer (cache, service worker, jetons) ; inscris, ne corrige pas dans ce lot.

## 3 · Les mots

**Acceptés par Grégoire le 30 sept. à 16 h 26 (« j'accepte »), à ne pas modifier.** Range-les en un seul endroit du code :

- Bouton : « Vérifier »
- Pendant : « Vérification de l'archive… », « N copies sur M »
- Réussite : titre « Archive vérifiée » ; texte « Les M copies sont présentes et intactes, et les données concordent. »
- Échec : titre « Archive incomplète » ; texte « N copies sur M manquent ou ne concordent pas. Archive de nouveau ce groupe. »
- Sans empreintes : titre « Archive à refaire » ; texte « Cette archive date d'avant les empreintes : elle ne peut pas être vérifiée copie par copie. Archive de nouveau ce groupe. »
- Dans la liste : « Vérifiée le JOUR » ou « Non vérifiée »

## 4 · La preuve attendue

- Banc : une archive saine → vérifiée ; une copie tronquée, une copie altérée d'un octet à taille égale, une copie absente, un fichier en trop, un `donnees.json` altéré, une fiche non couverte → chacune dite, aucune ne passe pour « vérifiée ». Dans les deux modes. Une archive d'avant 1.171.1 → « à refaire ».
- La mesure de mémoire de la vérification en mode fichier, à 607 Mo, au banc du lot A1.
- L'état retenu survit à un rechargement ; un nouvel archivage le remet à zéro.
- Mutations, chacune rouge. Vitest complet ; Playwright ciblé ; le verdict complet est dû sur le commit de release.

## 5 · Ce que tu ne fais pas

Aucun retour de copies, aucun retrait, aucun changement du mot « archivé » (lots A3 à A5). « Ouvrir une archive… » n'est pas touché, sauf si tu dois en partager la lecture : dis-le.

## 6 · Ce que tu rends

- `DEMANDE-RELECTURE-2026-09-30-lot-A2-verifier.md`, avec une ligne des Nouvelles proposée (version mineure : le geste est neuf, et la ligne couvre aussi le lot A1).
- `PORTES-TERRAIN-2026-09-30-lot-A2-verifier.md` : **dans Chrome, sur le Mac**, première rangée par un rechargement forcé ; vérifier l'archive du groupe 00008 de l'hiver 2026 (attendu : 205 sur 205). Cowork publie l'artefact.
- À Grégoire, trois lignes : ce qui change à l'écran, la preuve, ce qui lui revient.
