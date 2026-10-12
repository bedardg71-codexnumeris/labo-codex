# Consigne du jour – lots 20 à 23, une seule vérification le soir

> Écrite par Cowork le 12 octobre 2026 à 7 h 26 (Toronto, mesurée par `date`). L'ancienne consigne est archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-11-lots-8-a-19.md`. Tu peux commiter ce fichier et le déplacement.

## Où on en est

1.199.0 en ligne depuis le 11 oct. à 22 h 11 (lots 8 à 19) ; `main` à `bd533702`, poussé. Les fiches sources de cette série sont les laborieuses gardées le 11 et les restes coupés des lots 14 à 19 : toutes « sans Grégoire ». **Remesure chaque fiche sur `main` avant d'y toucher.**

## Ce qui est nouveau : deux sessions du nuage écrivent en même temps que toi

Elles ne touchent pas au code. L'une écrit la documentation destinée à une éventuelle relève (une personne qui reprendrait le code) ; l'autre remet à jour l'audit de mai. Donc, pour toute la série :

- **Tu ne modifies pas** `docs/`, `ETAT-PROJET.md`, `LICENSE.md`, `libs/VERSIONS.md`. Si un lot rend l'un d'eux faux (une fonction retirée qu'un document nomme, une clé à inscrire au registre `docs/DATA-OWNERSHIP.md`), écris-le dans la demande de relecture du lot, section « Documents à mettre à jour » : Cowork le fera suivre.
- `RELAIS.md` et `BACKLOG.md` restent partagés. Si un push est refusé parce qu'une de ces sessions a poussé entre-temps : fusion, pas rebase, comme le 11 au soir.

## La méthode (inchangée depuis les lots 14 à 19)

Tu enchaînes les quatre lots sans attendre de feu vert entre eux. Pour chacun : remesure d'abord, commits séparés, break-tests, Vitest complet, une demande `plans de travail/DEMANDE-RELECTURE-2026-10-12-lotN-<sujet>.md` déposée avant d'ouvrir le suivant. **Un seul arrêt, à la fin du lot 23**, avec le rapport court à Grégoire en gestes d'utilisateur. Aucun push, aucune release, aucun verdict Playwright avant son signal du soir.

« Sans Grégoire » : aucune décision de pédagogie, aucune écriture dans des données déjà écrites chez l'utilisateur, aucune zone protégée (`js/config.js`, `js/navigation.js`, `noms_stables.json`), aucune suppression de données d'utilisateur. Ce que tu ne tranches pas va dans la demande du lot, et tu continues. Un mot d'écran neuf : écrit dans le code, cité dans la demande. Un lot qui déborde se coupe : la moitié sûre, et la mesure du reste.

## Lot 20 – des écritures qui ne se marchent plus dessus

- **#522**, les dix sites encore en course après le lot 7 (`scripts/mesurer-522.py ""`) : ceux qu'un geste de l'usager atteint passent par `db.modifier` ; les autres, dis pourquoi ils sont sûrs.
- **#596**, six clés `sessionStorage` non namespacées sur cinq fichiers. Ce qu'un onglet ouvert a déjà rangé sous l'ancien nom meurt avec l'onglet : dis-le, ne le recopie pas.
- **#627**, ce qui reste : l'unification des quatre remaps d'import sur l'implémentation de `reserve-ouvrir.js`. Source seulement : les liens déjà écrits ne sont pas réécrits, et c'est dit.

## Lot 21 – le premier contact sans fenêtre qui bloque

- **#678**, les `alert()` du parcours de la première chronique (créer un trimestre, créer un groupe-cours). Motif de Grégoire (1er sept.) : le premier contact d'un nouvel utilisateur qui suit le tutoriel. Même patron que #1037 : fenêtres et notifications de l'application, **mots existants gardés** ; un mot neuf est cité dans la demande. Si les 46 alertes débordent, fais d'abord ce parcours-là et inscris la mesure du reste.

## Lot 22 – le code mort, la fin

- **#469**, le reste : l'îlot de `pratiques.js` (fais d'abord le graphe d'appels interne : une fonction n'est morte que si aucune fonction vivante ne l'appelle), le trio « modèles de pratiques » de `pratiques-bibliotheque.js` et ce qu'il entraîne, l'ancienne génération des grilles, échelles et cartouches, l'outil de diagnostic I14.
- **#587**, le reste : `afficherSection` (trois fichiers), `afficherSousSection`, `afficherTableauProductions`, `_apresOuvertureFichier`. Garde la version qui gagnait.
Chaque retrait prouvé par recherche d'appelants **et** Vitest. Pas `selectionnerArtefactsSelonModalite` (#722, à Grégoire) ni `chargerGrilleTemplate` (nom protégé, #628).

## Lot 23 – l'outillage trié

- **#642, #679, #784** : trier les inventaires figés au lot 19. Voulu : annoté dans le cliquet, avec sa raison. Défaut : corrigé s'il tient en quelques lignes, sinon inscrit avec sa mesure. Le cliquet descend d'autant.
- **#616**, le rebornage des sentinelles « à N caractères », banc par banc (85 lignes dans 44 bancs) ; le cliquet descend à chaque banc reborné.
- **#602**, les trois filets anti-cache ne voient que les fichiers portant une balise `<script src>`.
Rien ne change à l'écran : dis-le si quelque chose change.

## Hors de la série

Les fiches « à Grégoire » (une dizaine, cochées « ⏳ » au BACKLOG le 12 oct.), #465 (le moteur des pratiques touche des notes), #470 (la vitesse, trop large pour une journée de vérification unique), #595 (68 couleurs : un choix de palette par nom, à lui montrer), #598, #584, #738, #615 (peut recouper les candidats de la session d'audit).
