# Demande de relecture – lot 4 de la file : rien ne se perd en silence

> Claude Code, 10 octobre 2026, 15 h 40 (mesuré par `date`). Consigne : `plans de travail/CONSIGNE-DU-JOUR.md` (Cowork, 15 h 19).
> Commits locaux, **non poussés, pas de release** : `72479fef` (#845), `ed77035c` (#938), `e02fbe6c` (#522, lot 5b). Le BACKLOG porte l'état des trois fiches (commit de documentation à suivre).

## 1 · Ce qui change pour l'usager

- Une donnée supprimée n'est plus affichée jusqu'au rechargement : après une fusion de codex qui retire une clé, la suppression d'un trimestre ou une purge d'espace, ce qui est parti est parti tout de suite (#845).
- Rouvrir une pratique de notation par l'assistant puis l'enregistrer ne perd plus ce qui avait été réglé au formulaire : les jetons, l'affichage de la note en lettre, le réglage « notes finales » (#938).
- Deux gestes faits coup sur coup ne s'effacent plus l'un l'autre : retirer, ajouter, importer ou déposer un cours ; copier une cartouche d'un autre trimestre ; enregistrer les métadonnées d'une ressource ; capturer une séance ; réimporter des tampons depuis les archives ; fusionner les copies d'un codex (#522).

Aucun mot d'écran n'a changé, aucun n'est ajouté. `partagerCours` réutilise son message existant « Cours introuvable » si le cours a disparu pendant la question.

## 2 · La mesure d'abord

**#845 – les 18 appelants de `db.remove()`.** `[lecture]` (lu dans le code, non rejoué à l'écran). La fenêtre ne concerne que les clés tenues par le cache mémoire (au-delà de 200 Ko, ou après une bascule sur quota).

| Appelant | Relit la clé dans la session ? | Ce que l'usager voyait |
|---|---|---|
| `codex.js:4029` fusion, résolution « supprimer » | oui (`getSync` des modules) | la donnée retirée restait affichée jusqu'au rechargement |
| `codex.js:994` snapshot de référence refusé (#1011) | oui (`_lireSnapshotAvant`) | la fusion suivante se référait au codex précédent — ce que #1011 voulait éviter |
| `codex.js:1592` fermer le codex | oui, si une fusion suit sans rechargement | même chose |
| `trimestres.js:1483` supprimer un trimestre | `keysSync`, `getSync` | ses grosses clés restaient visibles ; son commentaire promettait déjà le retrait du cache |
| `codex.js:2180` purge d'espace | `keysSync` | les clés purgées restaient listées |
| `reserve-copies.js` ×2, `reserve-renvoyer.js` | oui | contourné par un `removeSync` doublé (mesuré le 5 oct. sur 394 copies) — **contournements retirés** |
| les 10 autres (migrations, plan de purge, vignettes, `donnees-v2.js` cartouches d'une grille supprimée, `reserve-emprunter.js`, test de résistance) | non, ou clé qui ne revient pas | rien |

**#938 – tout ce que l'assistant jetait.** Mesuré par le vrai code : une pratique créée par l'assistant, enregistrée par le formulaire de gestion, puis rouverte et enregistrée par l'assistant sans rien toucher, pour chaque famille.

| Champ | Familles | Lu par |
|---|---|---|
| `jetons` (bloc plat du formulaire) | sommative, standards, dénotation | `obtenirConfigJetonsPratique`, en dernier recours |
| `affichageNote` | les quatre | `evaluation.js:97` (note en lettre à l'ouverture d'une évaluation) |
| `configuration.notesFinales` | sommative, standards, dénotation | `calculerDetailsNoteFinale` : les obligatoires non remises valent 0 — **sa perte fait remonter une note** |
| `configuration.categories` inactive | standards | le formulaire (pondérations gardées) |
| `configuration.echelleId` vide | sommative | aucun |

**L'assistant a-t-il ses propres jetons ?** Oui, `configuration.jetons`, et seulement pour une spécification. Le moteur le lit **avant** le bloc plat. Le formulaire n'écrit pas de bloc plat sur une spécification (mesuré : absent). Aucun conflit en pratique : chacun garde le sien, le moteur tranche comme avant.

**#522 – remesure.** `python3 scripts/mesurer-522.py ""` : **30 sites en course** (24 R1, 6 R2), pas 22. ⚠ Sans argument, le script ne mesure que les clés du lot 3 (1 site) alors que son en-tête dit « tout le dépôt » : en-tête corrigé dans `e02fbe6c`. Deux sites de la fiche ne sont plus en course, devenus synchrones (R3) : la suppression définitive de `donnees-v2.js` et la migration d'évaluations d'`echelles.js`. Rien à convertir, donc la condition « la conversion ne change que la sérialisation » de la consigne ne s'est pas posée. Après le lot : **21**.

**Les drapeaux, un par un** :

| Site | Quand il tourne |
|---|---|
| `main.js:690`, `:731` (`auDbReady`) | au démarrage seulement |
| `codex.js:157`, `:199`, `:1918` (`initialiserCodex`) | au chargement de la page |
| `snapshots.js:134` | au démarrage ; écrit une structure vide si absente |
| `travaux-stockage.js:1274` | à la première ouverture de Travaux ou de Modélisation, une fois par poste ; idempotent |
| `migrations.js:810` (`executerMigrationsBeta96`) | jamais : aucun appelant, exportée sur `window` seulement |
| `demo-activation.js:386` | faux positif : écrit la constante `null` au retour arrière |
| ⚠ `cartouches.js:248` (`migrerCartouchesVersBibliotheque`) | **pas au démarrage seulement** : à chaque ouverture de Conception › Rétroactions (`navigation.js:243`), et elle réécrit toutes les `cartouches_<grille>` sans condition. Recoupe #1040 |

## 3 · Ce qui est fait, commit par commit

**`72479fef` – #845.** `remove()` vide `memoryCache` **après** le commit IndexedDB. Les `removeSync` doublés de la Réserve sont retirés, et le faux `db` du banc E3 modélise le nouveau `remove()`.

**`ed77035c` – #938.** Nouvelle `conserverCeQueLAssistantNEditePas` (`wizard-pratique-v2.js`). L'assistant déclare ce qu'il édite : à la racine, et dans la configuration par famille. Tout le reste de la pratique enregistrée passe tel quel. La liste de quatre champs de l'enveloppe (`inspireDe`, `estMaquette`, `metadata_cc`, `isDemo`) est retirée, parce qu'elle est subsumée.

**`e02fbe6c` – #522 lot 5b.** Neuf sites passent par `db.modifier` :
- `cours.js` ×4 ;
- `cartouches.js` (copie entre trimestres) ;
- `cc-license.js` (métadonnées) ;
- `snapshots.js` (capture) ;
- `reserve-ouvrir.js` (tampons) ;
- `codex.js` (`_fusionnerTravaux`).

`partagerCours` lit hors file pour poser la question, puis relit dans la file pour écrire. La garde des doublons de l'import de cours et la garde d'identité #476 de la copie de cartouche vivent dans le mutateur. Six faux `db` de bancs voisins reçoivent `modifier`, au contrat réel.

## 4 · Ce que j'ai supposé

- #845 : le cache est vidé **après** le commit, pas avant. Si IndexedDB refuse, la clé reste lue, comme elle reste sur le disque.
- #845 : retirer les contournements de la Réserve fait partie du lot (zéro-dette). Leur garde `getSync(...) !== null → Abandon` reste en place.
- #938 : ce qui est à la racine (`affichageNote`, `jetons` plats, `metadata`…) passe même quand la famille change. La configuration ne passe que dans la même famille.
- #938 : des catégories **actives** que l'assistant n'écrit plus ont été désactivées par lui (sortie du mode hybride) : elles ne reviennent pas. Des catégories **inactives** restent.
- #938 : `conserverReglagesSansLecteur` (lot N6) recoupe maintenant en partie la règle générale. Je l'ai gardée, parce que deux sentinelles N6 en figent les lignes.
- #522 : les tampons sont réécrits même quand rien n'est ajouté, comme avant.
- #522 : les onze gestes hors de la liste du 30 août ne sont pas convertis (« ne prends pas d'avance »). Ce sont `import-export.js` ×7 et la Réserve ×4. Ils sont inscrits à la fiche avec leur mesure.

## 5 · Ce qui est vérifié, et comment

- #845 : `sentinelle-845-remove-vide-le-cache-memoire`, 2 essais, vraie `db` sous IndexedDB simulée qui clone. **Break-test 2/2** : le correctif retiré, puis le cache vidé avant le commit.
- #938 : banc `audit-pratiques-notation-config-2026-09-16`. L'exclusion de `jetons` est retirée de l'essai « standards · … 80,95 ». S'y ajoutent 5 essais neufs (quatre familles, plus « ce que l'assistant édite l'emporte, la famille changée n'emporte pas la configuration »). **Break-test 5/5** : appel retiré, champs édités ignorés, garde de famille retirée, catégories inactives perdues, catégories actives gardées.
- #522 : `sentinelle-522-lot5b-gestes-serialises`, 15 cas. Ce sont quatre paires d'effets indépendants (cours ×2, cartouche, métadonnées), un refus et un cliquet sur les neuf sites. **Break-test 7/7** : chacun des six fichiers est remis à son état d'avant, et une mutation ciblée fait écrire à `partagerCours` la liste lue avant la question. ⚠ L'import de cours, la capture, le réimport et la fusion de codex ne sont gardés que par le cliquet.
- Chaque mutation a été restaurée par copie, avec l'empreinte vérifiée. Vitest complet : **707 fichiers, 8 492 essais, vert**.
- **Pas de verdict Playwright.** `js/db.js` est sous les règles de sécurité : `cd tests && npm test` est dû sur le commit de release, avec Chrome, Safari et Cowork fermés.

## 6 · Stock

- #845 : aucun. Le cache mémoire disparaît au rechargement. Une clé fantôme relue puis réécrite par un module pendant la session aurait pu ressusciter ; ce n'est pas mesurable, et rien n'est réparé.
- #938 : les pratiques déjà rééditées par l'assistant ont perdu leurs jetons plats, `affichageNote`, `notesFinales` et leurs catégories inactives. Ce n'est pas réparé ; c'est assumé et écrit à la fiche. Pour l'automne 2026, une pratique « notes finales » rééditée par l'assistant calcule en provisoire. Grégoire peut le voir à la puce « notes finalisées » de la carte de la pratique.
- #522 : sans objet. Une perte passée ne se reconstitue pas.

## 7 · Trouvailles

- **Issue 2 (inscrite à #522)** : les onze gestes R1 hors liste (`import-export.js` ×7, la Réserve ×4). Aucun symptôme vécu.
- **Issue 2 (rattachée à #1040, déjà inscrite)** : `migrerCartouchesVersBibliotheque` réécrit toutes les cartouches à chaque ouverture de Conception › Rétroactions. Ne pas écrire quand rien ne change fermerait aussi la course avec une saisie faite à l'ouverture.
- **Issue 3** : `executerMigrationsBeta96` n'a aucun appelant.

## 8 · Proposition pour la release

Mineure. **Titre** : « Rien ne se perd en silence ».
**Ligne des Nouvelles** (à soumettre à Grégoire) : « Rouvrir une pratique de notation par l'assistant garde désormais ses jetons, son affichage de note et son réglage de notes finales ; deux gestes faits coup sur coup (sur les cours, les cartouches, les captures de séance…) ne s'effacent plus l'un l'autre ; et ce qu'on supprime disparaît tout de suite, sans attendre un rechargement. »
