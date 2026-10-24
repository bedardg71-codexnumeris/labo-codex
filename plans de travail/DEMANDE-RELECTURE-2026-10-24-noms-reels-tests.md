# Demande de relecture – deux noms d'étudiant·es réel·les retirés des fichiers actuels (24 octobre 2026)

> Écrite par Claude Code le samedi 24 octobre 2026 au soir, sur `main` après `c320a977`. Consigne : `CONSIGNE-LOT-2026-10-24-noms-reels-tests.md`. Les deux noms n'apparaissent nulle part dans ce fichier, dans le commit ni dans les tests : ils sont désignés par « nom 1 » et « nom 2 », comme dans la consigne. Pas de release, ni verdict, ni push.

## En bref

Le nom 1 n'apparaît plus dans aucun fichier suivi. Le nom 2 n'apparaît plus que dans les quatre citations du rapport de l'autrice homonyme. Une sentinelle le verrouille par empreintes sha256. L'historique n'est pas réécrit : les chiffres à soumettre à Grégoire sont plus bas.

## La mesure (avant)

`git grep -i`, sur les fichiers suivis : le nom 1 apparaît dans **9 fichiers** (huit fichiers de tests, dont 33 occurrences dans `sentinelle-603-604`, et une ligne de `RELAIS.md`) ; le nom 2 dans **6 fichiers** (les quatre citations, plus `export-resultats-finaux-333.test.js` (3) et `sentinelle-603-604` (3)). C'est la mesure de Cowork.

## Ce qui a changé

| Fichier | Changement |
|---|---|
| 8 fichiers de tests : `integration/corbeille-entete-606.spec.js` ; `unit/sentinelle-597-heic-decode-avant-pipeline`, `-597-heic-dit-son-impossibilite`, `-603-604-import-pages-et-remplacement`, `-605-fichier-sous-autre-production`, `-878-aide-nommer-les-pages`, `-880-fusion-pdf-meme-eleve`, `-t1-da-demo-import` ; `unit/export-resultats-finaux-333` | Le nom 1 devient « Exemple » et le nom 2 « Essai », partout où ils désignent une personne étudiante : commentaires, données de fixtures, noms de fichiers, assertions (52 lignes). La forme des noms de fichiers ne change pas (`Exemple_9000058_Portrait_de_lecteur-p1__Remis_le_…`). |
| `RELAIS.md` | « le vrai `IMG_2179.HEIC` d'une élève (nom retiré le 24 oct. 2026, règle 6), 2 909 950 octets ». Le reste de la ligne est inchangé. |
| `tests/unit/sentinelle-noms-reels-retires-2026-10-24.test.js` | Neuf. Voir plus bas. |

**Aucun attendu n'a eu à bouger.** Les huit fichiers de tests touchés étaient verts avant le remplacement (83 essais) et le sont restés après. Aucun ne mesure une longueur ni un ordre alphabétique qui dépende du nom. Le spec Playwright `corbeille-entete-606` passe (3 essais). Aucun fichier `js/` n'a changé, donc pas de jeton à mettre à jour.

**Les quatre citations sont intactes** : `index.html` (Ressources), `js/pratiques/construction-attributs.js`, `BACKLOG.md` et `OU-EN-EST-ON.md`. Chacune contient le nom 2 une fois, dans la référence du rapport « Laissons-les se tromper ».

## La sentinelle

`git ls-files` liste tous les fichiers suivis. Le banc lit chacun d'eux (les binaires sont écartés), coupe le texte en mots et hache en minuscules chaque mot de la longueur d'un des deux noms. Il exige deux choses : **aucun** mot ne doit avoir l'empreinte du nom 1, et l'empreinte du nom 2 ne doit apparaître **qu'une fois dans chacun des quatre fichiers de citation**, nulle part ailleurs. Il tourne en 2,7 s.

**Break-test : 4 mutations sur 4 font échouer l'essai visé**, et l'arbre est restauré (sha256 avant et après identiques) :
- le nom 1 remis dans les données d'un test ;
- le nom 1 en majuscules dans `RELAIS.md` ;
- le nom 2 comme nom d'étudiant·e dans un test ;
- une citation du nom 2 retirée de `BACKLOG.md` (l'égalité est stricte : une citation de plus ou de moins se voit).

⚠ **Limite** : `plans de travail/**` est dans le `paths-ignore` de la CI. Un commit qui n'ajouterait un des noms que dans ce dossier ne lancerait pas la CI. Le banc rougirait au prochain Vitest, dans le crochet pre-push, au Mac ou au commit de code suivant, mais pas sur ce commit-là. Je n'ai pas touché au cliquet : il examine ce que les tests lisent par chemin écrit en dur, et ce banc passe par `git ls-files`.

**Vitest complet** : 9 610 essais sur 9 610, 815 fichiers.

## L'historique, pour Grégoire

Rien n'est réécrit. Les chiffres viennent de `git log --oneline -S<nom> --all` :

| | Commits qui ajoutent ou retirent le nom | Premier | Dernier |
|---|---|---|---|
| Nom 1 | **9** | 7 sept. 2026 | 6 oct. 2026 |
| Nom 2 | **4** (dont des commits sur les citations de l'autrice homonyme, et `c320a977`, le lot 1 de l'Aide, qui l'a retiré de la popup « Formats de noms reconnus ») | 7 sept. 2026 | 24 oct. 2026 |

Ce commit-ci s'ajoutera à chaque compte, puisqu'il retire les noms. **Messages de commit** : aucun ne contient le nom 1. Un seul contient le nom 2 (`7e3a5222`, 9 sept.), et c'est la citation du rapport de l'autrice. Le dépôt est public : faire disparaître les noms des anciens commits demanderait de réécrire l'historique (et de forcer le push). Cette décision revient à Grégoire.

## Constat en passant (issue nommée)

`unit/export-resultats-finaux-333.test.js` contient d'autres noms de famille dans ses données (`nom: …`, l. 45-52), et je ne sais pas s'ils sont fictifs. Ils ne sont pas visés par la consigne et je n'y ai pas touché. Issue : *inscrire*, à faire vérifier par Grégoire, qui seul peut reconnaître un nom de ses groupes.
