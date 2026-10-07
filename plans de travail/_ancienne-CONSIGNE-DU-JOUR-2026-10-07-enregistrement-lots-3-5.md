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


## Suite – relecture de Cowork (7 oct. 2026, 7 h 57, Toronto)

**Relecture faite, rien ne bloque.** Lus : `61129bd3` (#1030), `ae576a70` (#1031), `60c24821` (#975), et le chemin `changerTrimestreActif` que « Créer le trimestre » emprunte quand un trimestre était actif. Tests non relancés par Cowork.

**Ligne des Nouvelles validée par Grégoire** (« oui », 7 h 57). Pose ces trois items tels quels dans l'entrée 1.188 de `js/changelog-data.js` (titre : le tien), avec le commentaire de provenance habituel :

1. Cadre : « + Nouveau trimestre » ouvre maintenant le formulaire du trimestre, comme pour ton premier. « Créer le trimestre » le crée et l'active, sans fenêtre à remplir.
2. Une suppression qui n'a pas pu être enregistrée le dit maintenant (« Non enregistré »), au lieu de réapparaître au rechargement suivant.
3. iPad : une copie importée juste après un retour dans l'application ne se perd plus.

Typographie du fichier : espaces insécables (`&nbsp;`) dans les guillemets et avant le deux-points, comme dans les entrées voisines.

**Les deux mots en attente** (bouton pour quitter la création sans créer, titre de la question de sortie) : ne rien écrire. Note-les dans le relais comme « mots en attente de Grégoire ».

Puis : commit du changelog, Chrome et Safari fermés, verdict complet, push, vérification de la mise en ligne chez Netlify. Rapport en gestes d'utilisateur.


## Suite 2 – le bouton « Annuler » de la création d'un trimestre (7 oct. 2026, 9 h 38, Toronto)

1.188.0 est en ligne (relais `24bf0fda`). Deux décisions de Grégoire, prises ce matin par Cowork :

- **« Annuler »** (« oui », vers 9 h 20) : pendant la création demandée par « + Nouveau trimestre », un bouton « Annuler » à côté de « Créer le trimestre ». Il ne paraît que si un trimestre est actif (au premier trimestre d'un poste vierge, il n'y a rien à retrouver). Au clic : rien n'est écrit, la création demandée est quittée, la fiche du trimestre actif revient (`chargerIdentificationTrimestreV2`) et « Créer le trimestre » disparaît. Style : bouton secondaire, selon `design-system.html`. Mot unique, tel quel.
- **Pas de question de sortie dans l'application** (« on s'en passe », 9 h 38) : quitter le Cadre pendant une création perd la saisie, et c'est accepté ; seule reste la question native du navigateur au rechargement. Écris-le en commentaire là où la question aurait vécu, pour qu'aucune session ne la rajoute.

Fichiers : `js/trimestre-v2-init.js`, `index.html` (et le bloc de jetons). Banc avec break-test : le bouton paraît en création avec un trimestre actif, ne paraît pas sans trimestre actif, et son clic n'écrit rien dans `trimestres` ni dans le cadre du trimestre actif. Specs voisins (#478, #466), Vitest complet. Noms manifestement fictifs.

Release patch par `scripts/release.mjs`. Ligne des Nouvelles proposée dans ton rapport, à part, non écrite. Puis arrête-toi : relecture de Cowork, verdict, push.

Rapport en gestes d'utilisateur. Geste à l'écran, sans rien créer : « + Nouveau trimestre », puis « Annuler » ; la fiche de l'automne 2026 revient. La création elle-même attend sa vraie création de l'hiver 2027, son choix.


## Suite 3 – relecture de 1.188.1 (7 oct. 2026, 10 h 18, Toronto)

**Relecture faite, rien ne bloque.** Lus : `e3e194a5` (« Annuler »), `d595aec2` (release). « Annuler » n'écrit rien et recharge les onze champs vidés par la création. `btn-secondaire` retenu : 23 « Annuler » de l'application le portent, 14 portent `btn-annuler`. Tests non relancés par Cowork.

**Ligne des Nouvelles validée par Grégoire** (« oui », 10 h 18). Ajoute-la telle quelle comme quatrième item de l'entrée 1.188 de `js/changelog-data.js`, avec le commentaire de provenance habituel (1.188.1 consolidé dans 1.188) :

4. Cadre : pendant la création d'un trimestre, « Annuler » ramène la fiche de ton trimestre actif sans rien créer.

Typographie du fichier : espaces insécables (`&nbsp;`) dans les guillemets et avant le deux-points.

Puis : commit du changelog, Chrome et Safari fermés, verdict complet, push, vérification de la mise en ligne chez Netlify. Rapport en gestes d'utilisateur.
