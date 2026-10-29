# Demande de relecture – Des standards sans portfolio, lot 4, la retouche : la liste lit le cours actif (#1178)

> Claude Code, jeudi 29 octobre 2026, 10 h 03, sur `main` = `032c7f91` (code) ; verdict `VERDICT-RELECTURE-2026-10-29-standards-sans-portfolio-lot-4.md` (Cowork, 9 h 59). Rien de poussé, pas de release, pas de verdict.

## En bref

- **Le correctif.** `_etatProductionsQuiComptent` (`js/pratiques-gestion.js`) lit `obtenirDonneesSelonMode('productions')`, la source de `calculerDetailsNoteFinale`, puis le même filtre des diagnostiques. La liste, la garde de la dernière case (qui passe par la même fonction) et `poolStdFaitDArtefacts` voient donc le seul cours actif. Le geste ne touche toujours que l'id coché ou décoché : une exclusion posée sur un autre cours reste intacte. Jeton anti-cache de `pratiques-gestion.js` : `20261028j` → `20261028k`.
- **Supposition de Cowork, reprise** : une pratique éditée alors qu'elle sert à un autre groupe-cours que l'actif montre les productions du cours actif — ce que le profil, ouvert à côté, calcule. Notée dans la docstring.
- **Le commentaire `.config` seul** (#712, #465) est posé à `basculerProductionQuiCompte`, rien de plus.
- **Trois tests, section H** de `tests/unit/sentinelle-standards-sans-portfolio.test.js`, sur un corpus à deux cours (GC1 actif, une production GC2 ajoutée) : la liste ne montre que GC1 ; la dernière case de GC1 est désactivée et le geste refusé malgré la production cochée de GC2 ; un « Artefact » en GC2 ne cache pas la liste.
- **Break-test D8** : la liste rendue à `db.get(cle('productions'))` → les trois rougissent, aucun autre ; arbre restauré, sha256 identique (`76ad6fb2…`). Inscrit au journal du fichier.

## Mesures

- Vitest depuis `tests/` : 10 314 verts, **1 rouge, #825** (`sentinelle-825-ouverture-immuable`, `pack-demo-10.js` changé par `68ce070a` sans release) — antérieur à la retouche, il tombe avec la prochaine release.
- La spec WebKit du lot 4 (`integration/standards-sans-portfolio-lot-4.spec.js`) : 2 sur 2.

## Trouvailles de Cowork

- Les deux listes de l'hybride : **inscrites** au BACKLOG sous #1178, sans correctif.
- Les dispositions sont écrites au pied du verdict.
