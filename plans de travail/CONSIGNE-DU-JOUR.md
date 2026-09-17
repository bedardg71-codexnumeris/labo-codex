# Consigne du jour – la fraction de complétion compte ce que compte l'indice C (#871, volet complétion)

> Écrite le 17 septembre 2026, 7 h 50 (Toronto), sur `ae7ad6f7` (`1.142.22` poussée).
> Elle REMPLACE la précédente, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-09-17-871-assiduite.md`.

Mandat : le volet (b) de #871, **tranché par Grégoire le 17 sept. au matin** (lis la ligne « ✅ VOLET (b) TRANCHÉ » sous la fiche) : **l'évaluation terminale est une remise que la complétion suit.** L'indice C ne change donc pas ; ce sont les fractions affichées à côté qui doivent compter ce qu'il compte. Sur le pack démo, `DEMO015` doit lire « 80 % … 8 / 10 », et les trois autres élèves que tu as mesurés (`DEMO004`, `DEMO006`, `DEMO020`) concorder de même.

## 1 · Une seule règle : le détail de la complétion vient de la pratique

- Aujourd'hui, les quatre `calculerCompletion` (configurable, standards, spécifications, sommative) ne rendent qu'un nombre, et deux compteurs à part refont la fraction : `profil-etudiant-rapport.js` (vers 68-79) et `_construireListeArtefactsMobilisation` (la « Méthodologie » du profil).
- **Décision technique de Cowork** : chaque pratique expose le DÉTAIL de sa complétion (ce qu'elle compte au dénominateur et ce qui est remis), et son `calculerCompletion` en découle – le pourcentage suit la fraction, comme pour l'assiduité. Les deux sites d'affichage lisent ce détail et ne comptent plus rien eux-mêmes. Le nom et la forme du retour te reviennent ; déclare la méthode au registre (`pratique-registre.js`, vers 191) et à `pratique-interface.js`, et donne-la aussi à `pratique-test.js`.
- **L'indice ne doit bouger pour personne** : pour chaque famille, la valeur de C avant et après est la même, élève par élève, sur le pack démo et au banc. Si une famille ne le permet pas, arrête-toi sur cette famille et rapporte à Cowork.
- Les différences entre familles (travaux dus pour les standards, échéance future comprise ; palier le plus haut pour les spécifications) **restent telles quelles** : la fraction les suit, elle ne les corrige pas. Si l'une d'elles écrit à l'écran une fraction qui te paraît fausse pour l'enseignant, *inscris-la* sous #871 et continue.
- Dis si `liste-evaluations.js` (`calculerCompletionSommative`, `calculerCompletionAlternative`, vers 224-262) est un troisième compteur qui affiche une fraction, ou un autre écran. S'il affiche un couple, même règle ; sinon, nomme-le et laisse-le.
- Le libellé de l'élément compté (« artefacts », « productions ») ne change pas dans ce lot.

## Preuve

- Une sentinelle qui exécute les calculs réels des quatre familles : pour chacune, la fraction lue aux deux sites a pour quotient l'indice C arrondi, et C est inchangé par rapport à `ae7ad6f7`. Un cas où la terminale manque (« 8 / 10 », 80 %) ; un cas où tout est remis ; un cas sans aucune production évaluée (garde l'affichage actuel).
- Un banc WebKit sur le pack démo : les quatre élèves qui divergeaient concordent, au rapport ET à la « Méthodologie » du profil.
- Break-test : chaque assertion neuve rougit sous sa mutation (un site qui recompte à part ; la terminale retirée du dénominateur ; C calculé hors du détail ; une famille oubliée au registre). Cowork en posera d'autres à la relecture.
- Au passage, **sans release si c'est seul** : les deux trous de preuve du lot F, si tu passes par ces fichiers (sinon, ne les ouvre pas pour ça).
- Vitest depuis `tests/`, puis le verdict Playwright sur le commit final, Cowork fermé. **Porte terrain : aucune attendue** – la fraction se juge à la machine.
- **Stock** : rien n'est écrit dans les données. Un rapport déjà copié ne se réécrit pas.

## Livraison

Patch `1.142.23` par `scripts/release.mjs`. Phrase de « Nouvelles » : propose-la à Grégoire avant de la figer (un seul message). Puis `OU-EN-EST-ON.md` (phrase « vérifié comment »), `RELAIS.md`, #871 cochée avec sa disposition, le markdown du tri. Toute trouvaille reçoit l'une des trois issues ; « inscrire et continuer » est le défaut. Commite aussi les fichiers de Cowork : `BACKLOG.md` (ligne « VOLET (b) TRANCHÉ » sous #871), `RELAIS.md` (deux ajouts du 17 sept., 7 h 50), `plans de travail/CONSIGNE-DU-JOUR.md` et son archive `plans de travail/_ancienne-CONSIGNE-DU-JOUR-2026-09-17-871-assiduite.md`. Push par `scripts/pousser.sh`, puis signale à Cowork que c'est poussé.
