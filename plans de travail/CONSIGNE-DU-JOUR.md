# Consigne du jour – les cartouches arrivent entières : partage (#643), import (#654), archive (#637)

> Écrite le 26 septembre 2026, vers 8 h 15 (Toronto), par Cowork, sur `main` = `origin/main` = `ac24acb7` (1.159.10). **À remesurer avant tout code** : ce que Cowork a lu est du texte, pas une exécution.
> La précédente (#888, livrée en 1.159.10) est archivée sous `plans de travail/_ancienne-CONSIGNE-DU-JOUR-2026-09-25-bug-888-per.md` (déplacée par Cowork, à commiter avec ce lot).
> Lot choisi par Grégoire le 26 sept. à 8 h 10, dans son cap du 24 au soir : « Je voudrais qu'on termine tout ce qui concerne la rétroaction dans les prochains lots. » Trois fiches laborieuses, aucune n'attend d'arbitrage.

## 0 · Ce que Grégoire verra, en une phrase

Une cartouche ne se perd plus en chemin : le fichier de partage dit de quel trimestre viennent ses cartouches, une production importée retrouve sa cartouche, et une archive rouverte montre toutes ses cartouches.

## 1 · Ordre, et une seule session

Une seule session écrit (les trois touchent `js/`). Trois commits, dans cet ordre, sur une branche :

1. **#643** d'abord : le patron vient d'être posé par #583 (1.159.9), et c'est le seul qui porte un texte à faire valider par Grégoire – autant le lui soumettre tôt.
2. **#654** ensuite.
3. **#637** en dernier : il commence par une confirmation à l'exécution, et il peut sortir du lot (§ 4).

`js/reserve-ouvrir.js` est touché par #654 ET #637 : ne pas les mener en parallèle.

## 2 · #643 – le fichier de partage dit de quel trimestre viennent les cartouches

**Décisions de Grégoire, elles font foi** :
- 31 août : une grille qui vit dans deux trimestres envoie les cartouches du **trimestre ACTIF**, et l'export **doit le dire**. La moitié « écran » est livrée (`confirmerExport`, `js/partage-export.js`, phrase affichée seulement si la grille existe dans plusieurs trimestres).
- 25 sept., 15 h 40 : **on prolonge le format `v1`**, pas de `v2` avant juin 2027.

**Ce que Cowork a lu (non exécuté)** : `js/partage-schemas.js` déclare toujours des schémas fermés (l. 2, l. 22 : « champ inconnu = rejet ») et `FORMAT = 'labo-codex-partage-v1'` (l. 42). Le commit `659cd0d9` (#583) a montré le chemin : champ déclaré au schéma `v1`, et une version plus ancienne qui reçoit le fichier refuse avec « Ce fichier vient d'une version plus récente… » (`js/partage-import.js`). Les champs LOCAUX au trimestre de l'auteur sont interdits au partage (l. 496-499, `coursId`, `dateEcheance`).

**Attendu** :
1. Le paquet porte le **nom lisible** du trimestre d'où viennent les cartouches (par ex. « Automne 2026 »), jamais son identifiant interne : un id de trimestre est local et ne dit rien à la destinataire. Où le poser (manifeste ou entité grille), et s'il part toujours ou seulement quand la grille vit dans plusieurs trimestres : ton choix, dis-le en une ligne. Préférence de Cowork : toujours, pour que la destinataire ne dépende pas d'une condition qu'elle ne voit pas.
2. À la réception, la prévisualisation le dit. **Texte proposé par Cowork, à soumettre à Grégoire avant le push** : « Cartouches tirées du trimestre : Automne 2026 ». Un fichier sans ce champ (émis avant cette version) ne dit rien : pas de phrase inventée.
3. Le champ entre au registre de transport comme ceux de #680 (déclaré ou exclu avec sa raison), pour que la sentinelle de transport continue de protéger.

**Preuves** : Vitest à l'envoi et à la réception ; banc WebKit à deux contextes (le patron `partage-echelle-reperes-583.spec.js`) – rouge avant, vert après ; **un fichier signé en juin se vérifie encore** (le vecteur signé du lot F, inchangé) ; mutation : retirer le champ du schéma → rouge.

## 3 · #654 – une production importée retrouve sa cartouche

**Le constat (fiche, mesuré le 31 août ; remesuré par Cowork ce matin, lignes conformes)** : aucun des quatre chemins d'import ne retient l'id neuf d'une cartouche en collision ; `production.cartoucheId` n'est remappé nulle part.
- `js/reserve-ouvrir.js` : `_preparerEtCollecter(items, prefix, table)` (l. 1043) mémorise ; `_preparerEtPatcher(items, prefix, type)` (l. 1079) n'a pas de table. Passes l. 1094-1098.
- `js/import-export.js` : le mint est dans `fusionnerParIdentite` (définition l. 134, **neuf sites d'appel** – remesuré, conforme).

⚠ **Ce que Cowork a vu en lisant, et que la fiche ne dit pas** : à `reserve-ouvrir.js` l. 1096-1097, les productions sont patchées AVANT que les cartouches soient préparées. Ajouter une table aux cartouches ne suffit donc pas : il faut qu'elle soit remplie avant le patch des productions. Vérifie-le à l'exécution avant de réordonner, et dis si le réordonnancement change autre chose.

⚠⚠ **La bascule armée (fiche, § parenté #649)** : peupler `ctx.cartouches` active le remap de `production.cartoucheId` sur les QUATRE chemins d'un coup. Le cas de la sentinelle de #627 qui fige la table vide **doit rougir** ce jour-là : c'est le signal, pas une régression. Mets-le à jour délibérément, en disant ce qu'il protège désormais ; ne le « répare » pas.

**Périmètre** : les **cartouches** seulement. Si `fusionnerParIdentite` rend ses renommages pour les cinq collections, ce lot n'en consomme que celui des cartouches ; pour les autres familles (échelles, grilles, productions, pratiques), mesure s'il manque un remap et **inscris** (issue 2), sans corriger ici. L'écart de comptage 16 / 18 de la fiche reste hors lot.

**Stock** : les productions déjà importées qui pointent vers une cartouche disparue ne sont pas réparées ; rien n'est réécrit dans les données de Grégoire.

**Preuves** : reproduire d'abord au navigateur (import d'une production dont la cartouche entre en collision → la production pointe vers une cartouche absente) ; rouge avant, vert après, sur chaque chemin touché ; mutations sur le remap et sur l'ordre des passes.

## 4 · #637 – une archive rouverte montre toutes ses cartouches

**La fiche l'a mesuré STATIQUEMENT seulement** : « à confirmer avant d'y croire ». Lignes remesurées ce matin par Cowork :
- `js/reserve.js` l. 660 écrit la clé COMPLÈTE `<trim>_cartouches_<id>` ; l. 694 et suivantes écrivent en plus la clé NUE.
- `js/reserve-ouvrir.js` l. 265 ne retient que la forme NUE (`k.indexOf('cartouches_') !== 0` → `return`).
- Ce qui rend le défaut plausible : l'évaluation lit les cartouches par `` cle(`cartouches_${grilleId}`) ``, donc sous la forme namespacée (`evaluation-chargement.js` l. 848, 1033, 1424 ; `evaluation.js` l. 1324 ; `evaluation-retroaction.js` l. 299).

**Attendu** :
1. **Confirmer à l'exécution d'abord** (WebKit) : archiver un trimestre dont les cartouches vivent sous la clé namespacée, rouvrir l'archive, constater qu'elles manquent à la liste. **Si ça ne se confirme pas : arrête #637**, inscris la mesure dans la fiche, et le lot se livre avec #643 et #654.
2. Si confirmé : la liste de réouverture reconnaît les deux formes. Quand les deux existent pour une même grille, **la forme namespacée l'emporte** (c'est celle que les évaluations de ce trimestre ont lue – « ce qui est enregistré fait foi ») ; la forme nue ne sert que si la namespacée manque. Supposition de Cowork : si la mesure la dément, dis-le.
3. **Ne touche pas `js/codex-data.js`** : l. 240 et 261 ratent ensemble et se compensent (écart de classement, pas une perte – fiche). Si ton correctif les désaccorde, arrête-toi et dis-le.

**Rien n'est effacé** : ni dans l'archive, ni dans le trimestre (limite de Grégoire du 20 sept.).

**Preuves** : rouge avant, vert après ; un cas où les deux formes coexistent ; mutation : retirer la reconnaissance de la forme complète → rouge.

## 5 · Hors lot, à ne pas toucher

- L'unification des quatre imports (#627, laborieuse à elle seule).
- `js/codex-data.js` (§ 4.3).
- Les remaps des autres familles (§ 3, à inscrire s'ils manquent).
- La réparation du stock.

## 6 · Livraison

- **Relecture croisée de Cowork OBLIGATOIRE** : échange entre enseignants, import, réouverture d'archive – rien de cela ne se reprend proprement. Ordre du `PROTOCOLE.md` : commit sur la branche → `DEMANDE-RELECTURE-2026-09-26-lot-cartouches.md` → relecture → corrections → verdict → fusion et push.
- Une seule release à la fin du lot (le skill `release-et-changelog` décide patch ou mineure).
- **Deux textes à soumettre à Grégoire avant le push** : la phrase de la prévisualisation (§ 2.2) et la ligne des « Nouvelles ». Proposition de Cowork, à ajuster à ce qui part réellement : « Partage et archives : les cartouches arrivent entières. Un fichier partagé dit de quel trimestre viennent ses cartouches, une production importée retrouve sa cartouche, et une archive rouverte les montre toutes. »
- **Pas de porte terrain** : Grégoire ne fabrique pas de données fictives, et les bancs à deux contextes font la preuve. Ce qui attend un cas réel : la prochaine grille qu'une collègue lui partage.
- Fin de lot : sortir le lot de `FILE-DES-LOTS.md`, cocher les fiches livrées, et **cocher aussi #583 et #680** au `BACKLOG.md`, livrées en 1.159.9 et restées non cochées (remesuré par Cowork ce matin).
