# Consigne du jour – chantier de l'enregistrement, lots 3 et 5 (1.187.1 ou 1.188.0)

> Écrite par Cowork le 7 octobre 2026 à 7 h 29 (Toronto, mesurée par `date`). Remplace la consigne de 1.187.0, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-07-demo-t3-t6.md`.

## Où on en est

1.187.0 est en ligne (`60e1ad80`, relais `520296ae`) : **chantier du démo clos**. On reprend l'enregistrement, ouvert le 5 octobre (lots 1 et 2 en ligne en 1.186.1 et 1.186.2). Le plan des cinq lots qui restent : `plans de travail/PLAN-2026-10-07-chantier-enregistrement-suite.md`. Lis-le d'abord. Ce lot réunit ses lots **3** et **5**, dont les fichiers ne se croisent pas.

Grégoire t'autorise, en te transmettant cette consigne, à commiter les fichiers de Cowork, à écrire dans `BACKLOG.md` et `SUIVI-BUGS.md`, et à faire la release sur `main` local. **Pas de push avant la relecture de Cowork.**

## Ce que tu fais, dans cet ordre

1. **Commite** cette consigne, son archive et le plan.
2. **Lot 3 – #1030** : un échec de suppression IndexedDB d'arrière-plan (`removeSync`, `_trackOperation`) ne reste plus muet. Même traitement que l'écriture depuis #962/#1029 : le témoin commun dit « Non enregistré » et pourquoi, la donnée n'est pas tenue pour supprimée. Le cas de la connexion fermée est déjà couvert par #1029 : ne le refais pas, couvre le reste (transaction avortée). `js/db.js`, `js/modes.js`. Mots : ceux du témoin existant, rien de neuf.
3. **Lot 3 – #1031** : les opérations du magasin `fichiers` de `js/db.js` passent par `_avecReprise` comme celles du magasin clé-valeur (une copie qui est la première opération après une perte de connexion ne doit plus échouer). Remesure leur nombre et leurs lignes (la fiche en compte sept, au commit du lot 1).
4. **Lot 5 – #975** : vérifie d'abord que le moratoire #622 ne couvre plus `js/trimestre-v2-liste.js` pour la **création** d'un trimestre (les archives sont closes depuis 1.186.0 ; #622 vise l'archivage). S'il la couvre encore, arrête ce volet et dis-le en une ligne. Sinon : « + Nouveau trimestre » de la bibliothèque des trimestres passe par le même chemin que la carte d'identification du Cadre (lot E2) : plus de `prompt`, plus d'`alert` pour la création, témoin commun, question de sortie. **Reprends les mots du chemin E2 tels quels** ; un mot qui n'existe pas encore remonte à Grégoire par Cowork, à part dans ton rapport, sans être écrit. Les autres `alert` du fichier (22 au total, mesuré par Cowork) qui ne touchent pas la création restent hors lot : inscris-les.
5. Tests : bancs avec break-test pour chacune des trois fiches (échec simulé de suppression ; perte de connexion avant une opération du magasin `fichiers` ; création d'un trimestre par la bibliothèque sans `prompt` ni `alert`). Specs voisins, Vitest complet. Noms manifestement fictifs.
6. **Release** par `scripts/release.mjs` (patch si #975 est hors lot ; minor s'il change le geste visible), commits séparés par fiche, relais écrit. Ligne des Nouvelles proposée dans ton rapport, à part, non écrite. Puis arrête-toi : relecture de Cowork, verdict, push.

## Rappel

Avant le verdict complet : Chrome et Safari fermés.

## Ton rapport à Grégoire

En gestes d'utilisateur, numéros entre parenthèses en fin de ligne. Le geste à vérifier à l'écran en une ligne (pour #975 : créer un trimestre depuis la bibliothèque ; #1030 et #1031 n'en ont pas, les bancs suffisent).
