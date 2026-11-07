# Consigne – la troisième passe de la purge (6 novembre 2026, soir)

> Écrite par Cowork le 6 nov. 2026 à 19 h 36 (Toronto). Même protocole que la seconde passe : `plans de travail/CONSIGNE-LOT-2026-11-06-seconde-purge.md` et les cinq arrêts durs de `plans de travail/CHANTIER-historique-git-donnees-personnelles.md` § 0. Ce fichier ne porte que ce qui diffère.
>
> ⛔ Aucun nom ni aucun DA dans ce fichier, dans un commit, un message ou un rapport.

## 1. D'où viennent les cibles

Après la poussée de la seconde passe, Cowork a balayé l'historique public réécrit avec les dix listes de Grégoire. Restaient : des noms de famille de ses élèves écrits seuls, et des prénoms dans les salutations « Bonjour <prénom> ! » de rétroactions recopiées dans les jeux de démonstration. Grégoire a revu chaque cas dans leur contexte, le 6 nov. à 19 h 34.

**La revue** : `~/Documents/Cowork H26 App Labo Codex/purge-identites/revue/troisieme-passe-a-confirmer.html` (hors dépôt). Chaque carte est un `<section class="carte" data-id="…">` ; le nom est dans son `<strong>` ; pour le groupe G1, les prénoms sont dans le `<div class="el">`, séparés par des virgules. ⚠ Ce sous-dossier `revue/` est dans le dossier des listes : les scripts qui lisent les listes doivent l'ignorer (fichiers `*.txt` du dossier seulement).

**Sa décision** :
- **Ses élèves** : S12 à S36 (noms de famille), B01 à B18 (prénoms après « Bonjour », absents des fichiers actuels), G1 (prénoms après « Bonjour », encore présents dans des fichiers actuels).
- **Coïncidences, à ne pas toucher** : S01 à S11, N1 (les « noms sources » du clonage de la démo, inventés). Sa règle : un nom absent de ses listes est presque toujours fictif ; les noms fictifs ont ensuite été remplacés par des totems scouts.

## 2. Les règles (hors du dépôt, dans `~/purge-seconde/troisieme/`)

1. **S12 à S36** : le nom de famille, en mot entier, dans tout l'historique et les messages, vers un nom de famille fictif stable.
2. **B01 à B18 et G1** : le prénom **après « Bonjour »** (salutations des rétroactions), dans tout l'historique, vers un prénom fictif stable. Pas de remplacement du prénom seul ailleurs : ce sont des prénoms courants, présents légitimement dans la démonstration actuelle.
3. **Exception, supposée par Cowork** : `Rapports/courriels-labo-codex.md` n'est pas touché. Sa salutation s'adresse à une collègue, pas à un élève. Grégoire peut corriger cette supposition.
4. **La correspondance du 22 sept. de la seconde passe, étendue à six chemins** où elle n'a pas été appliquée et où elle laisse encore 5 jetons dans 11 versions : `BACKLOG-ARCHIVE.md`, `js/pack-demarrage.js`, `tests/unit/sentinelle-605-fichier-sous-autre-production.test.js`, `docs/archive/auto-perspective-bilan-session.md`, `donnees-demo.json`, `donnees-demo/donnees-completes-demo.json`.

## 3. L'arbre actuel n'est pas tout à fait propre

Mesuré par Cowork : la règle 2 touche des fichiers ACTUELS, sur `main` : `tests/fixtures/copies-de-secours-1.172.0/copie-de-secours.json` (salutations de rétroactions), `tests/integration/lot-a-anonymisation-enregistre.spec.js` (une attente qui s'ancre sur une de ces salutations), `plans de travail/CONSIGNE-renommage-eleves-demo.md` (un exemple de salutation). **D'abord un commit normal sur `main`** qui applique la règle 2 à ces trois fichiers, la spec et sa donnée changées ensemble, sans changer ce que l'essai vérifie. Ce fichier-ci entre dans le même commit. Ensuite, la réécriture.

## 4. Vérifications : celles de la seconde passe, avec une retouche

- **A** : l'arbre de `HEAD` de la copie réécrite est identique à celui du commit du § 3, et non plus à celui de l'original.
- **B** : 0 occurrence des règles 1, 2 et 4 dans la copie réécrite (blobs et messages), hors de l'exception de la règle 3 ; témoin, le compte non nul de l'original.
- **C** et **D** : inchangées. S01 à S11 et N1 doivent garder exactement leur compte d'avant.

## 5. L'ordre

Commit du § 3 → bundle de sauvegarde (`~/purge-seconde/troisieme/avant.bundle`) → copie → règles → réécriture → A à D → **rapport à Cowork, en comptes seulement, puis arrêt.** Au signal explicite de Grégoire dans ta session : refs locales remplacées, verdict complet (l'arbre a changé), push forcé de `main` et des 22 étiquettes, `git ls-remote`, `RELAIS.md` par un commit normal, rapport. La demande au support de GitHub vient après cette poussée-là, une seule fois.
