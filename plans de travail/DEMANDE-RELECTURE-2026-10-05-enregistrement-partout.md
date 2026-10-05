# Demande de relecture – enregistrement, lot 2 : « Enregistré » partout (#982) et les anciens guides rangés (#984)

> Claude Code, 5 octobre 2026, soir (Toronto). Branche `claude/enregistrement-partout`, partie de `main` à `12cc8ac5`. **Ni poussée ni publiée** (consigne de Cowork de 18 h 34, point 5).

## 1 · Ce qui change à l'écran

Les gestes qui enregistraient sans rien dire affichent désormais « Enregistré », comme les autres, avec la règle du lot 1 :
- une grosse donnée attend son commit ;
- un échec dit « Non enregistré » et le message reste ;
- un geste qui écrit plusieurs choses ne dit « Enregistré » qu'une fois.

Le codex est marqué « pas à jour » comme avant, sans délai.

## 2 · Ce que j'ai mesuré avant de coder

Les 101 raccords de la liste figée ont été classés en traçant leurs appelants (grep des noms, `data-action`, `window.X`).

**Écritures de la machine ou mixtes**, qui doivent se taire :

| Site | Appelant de la machine | Traitement |
|---|---|---|
| `cartouches-bibliotheque.js:109` | seul appelant : la migration des cartouches au démarrage (`cartouches.js:147`) | reste `signalerEcritureUsager` (le codex apprend, l'écran se tait) |
| `planification-donnees.js` `setDonnees` | au chargement d'une carte : deux migrations (`migrerObjectifsVersMetadata`, `migrerAncrageTemporelVersLecon`) et la réparation des liens, qui changent le contenu | `_ecritureMachine` dans `planification-carte.js` autour des trois ; `setDonnees({ machine })` prévient le codex sans afficher |
| `travaux-stockage.js` `_signalerSiGeste` | `corrigerGroupeCoursIdFichiers` à l'initialisation des copies, par `mettreAJourFichiersBatch`, qui n'avait pas d'option | `mettreAJourFichiersBatch(modifications, options)` ; l'appel du démarrage passe `{ discret: true }` |
| `echelles-bibliotheque.js:96`, `grilles-bibliotheque.js:105` | une migration au démarrage les appelle sans argument : **rien n'est écrit**, donc le raccord n'est pas atteint | annoncés (seuls les gestes les atteignent) |
| `partage-import.js:109` | `window._testPartageImportP3`, un essai lancé à la main dans la console | annoncé (marginal) |

Tous les autres sont des **gestes**. Les écrivains génériques passaient déjà `{ discret: true }` sur leurs chemins de la machine : questionnaire et parcours du bilan, modalités, pratiques.

**Mesuré, rien à faire** : `interpretation-config.js:175` n'a aucun appelant (`sauvegarderSeuilsInterpretation` est exportée, jamais appelée). Je l'annonce comme les autres. Issue 3 : sans conséquence observable.

**Gestes à plusieurs raccords** (mesurés) : la suppression d'une ressource en déclenche jusqu'à quatre (ressource, corbeille, bibliothèque, dossiers). Tout « retirer de la bibliothèque » en déclenche deux (l'élément et les dossiers). Les imports entre trimestres et « Ajouter mes … à la bibliothèque » en déclenchent N, en boucle. Viennent aussi les tampons partagés par catégorie, les rétroactions personnalisées, la corbeille des copies, les partages, et les cartes d'alignement (nouvelle, importée, dupliquée, supprimée).

## 3 · Les décisions techniques, et ce que j'ai supposé

1. **`annoncerEcritureUsager(cles, { geste })`** (`modes.js`, public) remplace `signalerEcritureUsager` aux gestes. Elle :
   - prévient le codex **tout de suite**, pour chaque clé ;
   - **regroupe** les clés reçues dans une fenêtre de 100 ms, relancée à chaque appel, en un seul lot, puis passe par le point unique du lot 1 (`_annoncerEnregistre`, qui accepte désormais une liste) : un seul « Enregistré », après la dernière clé ;
   - **capture à l'appel** le commit attendu de chaque clé. Un échec survenu pendant la fenêtre ne peut pas être effacé par l'« Enregistré » de la fin.

   Elle accepte aussi une liste de clés.
2. **Un lot attend toujours ses commits** avant « Enregistré », même pour une petite clé. La fenêtre retarde déjà l'annonce de 100 ms, et un commit de petite clé prend environ 1 ms : aucun délai perçu. Sans cela, une petite clé dont le commit échoue dirait « Enregistré » puis « Non enregistré ». Mesuré par Vitest : c'était rouge avant cette règle.
3. **Pourquoi une fenêtre plutôt que de restructurer les gestes** : une vingtaine de gestes déclenchent plusieurs raccords, souvent à travers des fonctions partagées (`retirerItem`, `marquerRessourceSupprimee`) et des boucles. Les réécrire un à un en listes de clés toucherait autant de chemins. La fenêtre les couvre tous au même endroit.
4. **`changerPratiqueActive`** (`pratique-manager.js:85`) annonçait la seule copie du pointeur (`groupeCoursActif`). Il annonce maintenant les deux clés écrites par le geste (`groupesCours` et `groupeCoursActif`), et ne dit qu'un « Enregistré ».
5. **#984** : `git mv` de `docs/utilisateur/DEMARRAGE_RAPIDE.md` et `GUIDE_TESTEURS.md` vers `docs/archive/`. Aucun lien vivant n'y pointait. Restent des mentions historiques (deux rapports de `Rapports/`, une table de `docs/Rapport - Flux de configuration (0207).md`), gardées comme la consigne le permet. Les deux guides se citent par chemin relatif ; ils déménagent ensemble.

**Supposé** : les réglages d'interface de la liste disent aussi « Enregistré ». Ce sont les raccourcis d'annotation, le mode de synthèse des erreurs, les élèves suivis du tableau de bord, la pratique par défaut et les dossiers de classement. Ce sont des choix de l'enseignant qui s'enregistrent, et la règle de Grégoire est « partout, de la même façon ».

## 4 · Les tests

- **Sentinelle** `sentinelle-lot-F-gestes-hors-temoin.test.js`, réécrite en cliquet des **annonces**. Pour chaque fichier, elle compte les annonces et les silences ; les silences sont nommés un à un (SILENCES : 2). Total : 100 annonces, plus le silence de la migration des cartouches, ce qui redonne les 101 raccords d'avant.
- **Vitest** `sentinelle-982-annoncer-ecriture-usager.test.js` (7 essais, `modes.js` réel) :
  - le codex prévenu tout de suite, « Enregistré » après la fenêtre ;
  - quatre raccords → un « Enregistré » sur la dernière clé ; une liste → un ;
  - deux gestes séparés → deux ;
  - grosse clé : rien avant son commit ;
  - échec → « Non enregistré » ;
  - commit capturé à l'appel.
- **WebKit** `lot-f-gestes-hors-temoin.spec.js`, étendu :
  - chaque geste par famille dit « Enregistré » **une fois**, chaque écriture discrète **rien** ;
  - nouveau : « retirer une grille de la bibliothèque » (deux raccords) → **un** « Enregistré » ;
  - un échec provoqué sur un geste de la liste (créer un dossier, commit refusé par quota) → « Non enregistré : la mémoire du navigateur est pleine… », aucun « Enregistré ».
- **Mutations**, toutes rouges, chacune restaurée par copie et contrôlée par empreinte :

| Mutation | Rouge sur |
|---|---|
| Un geste rendu muet (dossiers) | Vitest + WebKit |
| Deux annonces pour un geste (sans fenêtre) | Vitest + WebKit (deux raccords) |
| L'annonce avant le commit d'une grosse clé | Vitest |
| Commit lu à la fin de la fenêtre au lieu de l'appel | Vitest |
| Une écriture de la machine qui parle (carte) | Vitest (sentinelle) |

## 5 · Vérifications

- **Vitest complet** (depuis `tests/`) : 685 fichiers, **8234 essais verts**.
- **Bancs WebKit** du témoin et voisins (962-986, lot B, présences lot D, anonymisation lot A, verrouiller lot C, codex lot G, E1, E2, E3, #1012), plus le lot F et CO-01 (`pratique-edition-preserve-enveloppe`, le spec qui avait trouvé la régression de 1.186.1). Résumé final lu en entier : **« 100 passed (13.5m) »**, sans ligne « failed » ni « flaky ». Total attendu : 95 + 3 + 2 = 100.
- **Suite Playwright complète** : non lancée (consigne : à la livraison).

## 6 · Pour Grégoire : où « Enregistré » apparaît désormais

En gestes d'enseignant :
- **Bibliothèques** (grilles, échelles, cartouches, pratiques, productions, tampons) :
  - ajouter un élément, le retirer, le dupliquer ;
  - l'importer depuis un autre trimestre ;
  - le supprimer pour de bon ;
  - le ranger dans un dossier.
- **Corbeille des ressources** : supprimer définitivement.
- **Pratiques de notation** :
  - copier une pratique d'un autre trimestre, la retirer de la sélection, la supprimer ;
  - la choisir par défaut, adopter une maquette, l'activer pour un groupe ;
  - régler les modalités d'évaluation et les jugements de dénotation.
- **Productions** : dupliquer, monter ou descendre dans la liste, supprimer, importer.
- **Cadre** :
  - ajouter, retirer, supprimer, importer ou déplacer un cours ;
  - supprimer un groupe-cours ou une séance de l'horaire ;
  - supprimer un paramètre.
- **Copies** :
  - importer, renommer, réassigner, mettre à la corbeille, restaurer ;
  - valider un doublon ;
  - dans l'annotation : les raccourcis, les tampons personnalisés, les codes d'erreurs de français et leur mode de synthèse.
- **Présences** : verrouiller une date.
- **Tableau de bord** : choisir les élèves suivis.
- **Profil de l'élève** : les notes du rapport, la sélection du portfolio.
- **Boîte à outils** : ajouter, modifier, supprimer ou reclasser une question du tirage.
- **Bilan réflexif** : le questionnaire et le parcours, l'import des résultats, leur suppression.
- **Suivi longitudinal** : inscrire un·e élève, ajouter ou retirer un résultat, retirer du registre.
- **Carte d'alignement** : chaque modification de la carte, la bibliothèque d'alignements, les objectifs.
- **Partage** : intégrer ou retirer un partage, la licence d'une ressource.
- **Rencontres** : créer une rencontre.
- **Modélisation** : les fichiers.
