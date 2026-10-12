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

## Ajout de Cowork (12 oct., 7 h 59) – lot 24, contenir la complexité

**Décision de Grégoire (7 h 58) : le chantier « contenir » entre dans cette série ; le moment est laissé à Cowork.** Il vient **après le lot 23**, et **l'arrêt unique de la série passe à la fin du lot 24**. Motifs : relevé après le lot 22, il ne fige pas le code mort que ce lot retire ; posé avant les lots qui suivront les décisions de Grégoire (une quarantaine attendent au tri, dont certaines touchent des fonctions déjà très chargées, l'import sélectif, le moteur des pratiques), il contient la croissance au moment où elle peut se produire.

**Le plan** : `plans de travail/PLAN-contenir-la-complexite.md`, écrit par une session du nuage sur la branche `claude/kind-allen-6gw2ik` (`d499ac6d`), absent de `main` au moment où j'écris. S'il n'y est toujours pas : `git fetch origin claude/kind-allen-6gw2ik` puis `git show FETCH_HEAD:"plans de travail/PLAN-contenir-la-complexite.md"`. Ne fusionne pas cette branche : elle porte aussi `ETAT-PROJET.md`, que tu ne touches pas.

**Ce qui change par rapport au plan** (relecture de Cowork, retenue par Grégoire) :
1. **Bloquants** : les règles 1 (aucune fonction neuve au-dessus de 30 ; les existantes figées une à une, elles ne peuvent que descendre) et 2 (le nombre de fonctions au-dessus de 15 ne peut que descendre). La liste suit le code, comme `sentinelle-858` ; une hausse assumée s'écrit, avec sa raison.
2. **La règle 3 (« aucun fichier ne franchit 1 000 lignes de code ») n'est pas bloquante** : mesurée et imprimée seulement. Motif : couper un fichier oblige ici à toucher `index.html` (210 scripts), l'ordre de chargement et les jetons anti-cache.
3. **Le relevé se fait sur `main` à la fin du lot 23**, pas sur les chiffres du plan, pris sur 1.198.0 (il fige encore des rappels de `groupe.js`, retiré au lot 12).
4. **Contre le découpage de façade** : le module imprime aussi, sans bloquer, la somme des complexités des fonctions au-dessus de 15. Si le compte baisse et que la somme ne bouge pas, la complexité a été déplacée, pas réduite ; Cowork le lira à la relecture.
5. **L'option du § 3.2 est retenue** : une ligne « complexité » dans le relais de chaque release (Δ des gros fichiers, Δ au-dessus de 15, Δ au-dessus de 30, Δ de la somme). Inscris-la dans le rituel de release, là où il est écrit (skill `release-et-changelog`), en une ligne.

**Le reste du plan tient** : `acorn` en `devDependency` de `tests/`, verrouillé dans `package-lock.json` ; le module `tests/unit/_helpers/complexite.js` ; la définition d'ESLint 8.57 ; l'exclusion nommée de `pratique-interface.js` ; les garde-fous (plus de 200 fichiers, plus de 10 000 fonctions) ; les trois break-tests. Aucun fichier de `js/`, ni `index.html`, `styles.css`, `docs/`, `ETAT-PROJET.md`. Inscris une fiche au BACKLOG pour le chantier. Dans la demande `DEMANDE-RELECTURE-2026-10-12-lot24-contenir.md` : les chiffres du relevé (au-dessus de 15, au-dessus de 30, maximum, somme, gros fichiers), le coût mesuré sur Vitest, et, sous « Documents à mettre à jour », ce que la session de la relève devrait savoir de ce banc.
