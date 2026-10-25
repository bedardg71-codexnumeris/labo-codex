# Consigne de lot – retirer des fichiers actuels deux noms d'étudiant·es réel·les (samedi 24 octobre 2026)

> ⚠ **Correction du 24 oct. 2026, 19 h 18 : la prémisse de ce lot était fausse.** Grégoire : « Je n'ai ni élève [nom 1] ni [nom 2] ». Les deux noms n'étaient pas ceux d'étudiant·es réel·les ; Cowork avait cru le commentaire de tête de `sentinelle-603-604` (« Mesuré sur l'import réel de Grégoire […] Deux élèves — … ») sans le lui demander. Aucune donnée n'était exposée. Le remplacement par des noms fictifs reste (sans effet) ; la sentinelle qui les interdit est retirée (`CONSIGNE-LOT-2026-10-24-correction-noms-fictifs.md`).


> Écrite par Cowork (session dans le nuage) le samedi 24 octobre 2026 à 19 h 08 (Toronto), sur `main` = `c320a977`. Ce fichier ne remplace aucune autre consigne.
> **Pourquoi maintenant.** Règle n° 6 de `CLAUDE.md` (aucun nom d'élève réel dans le code, les tests, les rapports, les plans) ; décision de Grégoire du 22 sept. 2026 de retirer du dépôt les noms réels déjà présents (fichiers actuels) ; **le dépôt est public**. Trouvé par la relecture du lot 1 de l'Aide (`VERDICT-RELECTURE-2026-10-24-aide-lot-1.md`).
> ⚠ **Ne recopie jamais ces noms** : ni dans un commit, ni dans un rapport, ni dans la demande de relecture, ni dans un test (une empreinte sha256 si un test doit les reconnaître). Ce fichier ne les écrit pas non plus.

## Quels noms

Le commentaire de tête de `tests/unit/sentinelle-603-604-import-pages-et-remplacement.test.js` (l. ~8-9) nomme **deux élèves** de l'import réel du 30 août (601-101, gr. 00007, « Portrait de lecteur »). Appelle-les ici « nom 1 » (le premier cité) et « nom 2 » (le second).

⚠ **Un homonyme du nom 2 est une autrice publiée** : le rapport « Laissons-les se tromper » (Cégep André-Laurendeau, 2026), cité dans `index.html` (Ressources), `js/pratiques/construction-attributs.js`, `BACKLOG.md` et `OU-EN-EST-ON.md`. **Ces quatre citations restent telles quelles.**

## Le mandat

1. **Mesure** (`git grep -i`, fichiers suivis, hors `node_modules`) : où paraissent le nom 1 et le nom 2 dans les fichiers actuels. Mesuré par Cowork à 19 h 02 : nom 1 dans neuf fichiers (huit fichiers de tests, dont 33 fois dans `sentinelle-603-604`, et une ligne de `RELAIS.md`) ; nom 2 dans six fichiers, dont les quatre citations à garder.
2. **Remplace** chaque occurrence qui désigne une personne étudiante par un nom manifestement fictif (par ex. « Exemple », « Essai », déjà employés au lot 1), dans le commentaire, les noms de fichiers des fixtures et les assertions. Garde la même forme de nom de fichier (les tests vérifient le découpage DA, production, pages). Si un nom fictif change ce qu'un test mesure (longueur, tri alphabétique), ajuste l'attendu et dis-le.
3. **`RELAIS.md`** : la ligne qui nomme le fichier HEIC d'une élève ; retire le nom, garde le reste.
4. **Une sentinelle** (par empreintes sha256 des deux noms en minuscules, jamais en clair) : aucun fichier suivi ne porte le nom 1 ; le nom 2 n'y paraît que dans les quatre citations du rapport (fichiers nommés). Break-test.
5. **L'historique** : ne réécris rien. Compte seulement, pour Grégoire, combien de commits portent chacun des deux noms (`git log --oneline -S… --all | wc -l`) et depuis quelle date. Mesuré par Cowork : 9 et 4 commits. Cette décision lui revient.

## Clôture

- Vitest depuis `tests/` ; jetons d'`index.html` seulement si un fichier `js/` change (il ne devrait pas).
- Un commit, message sans les noms : « fix(confidentialité) : deux noms d'étudiant·es réel·les retirés des tests et du relais (règle 6) ».
- Pas de release, ni verdict, ni push : ce lot rejoint la version du soir.
- Demande de relecture : `DEMANDE-RELECTURE-2026-10-24-noms-reels-tests.md` (sans les noms).
