# Consigne – La mise en ligne du soir, en 1.221 (27 octobre 2026)

> Écrite par Cowork le mardi 27 octobre 2026 à 12 h 01 (Toronto, mesuré par `date`), sur `main` = `63494c9a`. **À lancer au signal de Grégoire**, sa journée finie. Tous les lots qui partent sont relus et acceptés : la chaîne d'étapes de la Carte d'alignement (#1172, `970a3b91`) ; le tri de Git (#1114, `29016a13`, `99ac1eaf`) ; les calculs 4a (`537dac28`), 4b (`174806a8`, retouches `fdd705b2`) et 4c (`21cf7a84`) ; la note remise (#1173, `04489237`, retouches `c7a2e7fc`) ; la corbeille de la sélection (#1174, `18bac4c8`) ; le barème à l'évaluation (#1120, `be70a81a`). Leurs verdicts sont dans `plans de travail/VERDICT-RELECTURE-2026-10-2[67]-*.md`.

## 0. Avant tout

- Aucune autre session ne tourne ; `main` à jour ; pas de `git stash`. `CONSIGNE-DEMARRAGE-COWORK.md` est un document de Cowork : ne le commite pas.
- **Le rituel `/fin-de-session`**, dont `OU-EN-EST-ON.md`. Ce fichier part dans le commit de release.

## 1. Les Nouvelles : une entrée, 1.221

Texte **validé par Grégoire, mot pour mot, le 27 oct. 2026 à 12 h 01** (« ça convient »). Insécables en `&nbsp;`, apostrophes typographiques, comme les entrées voisines ; note la validation dans le commentaire de l'entrée. `couleur: 'vert'`.

- Titre : « Tes propres calculs, et le barème à l'évaluation »
1. « Critère algorithmique : l'étape « Note calculée » présente trois calculs tout faits, « Pénalité proportionnelle à la longueur », « Rapport visé » et « Pénalité fixe ». Chacun s'affiche en blocs, avec ce qu'il donne sur la copie fictive. Tu dis aussi ce que vaut la note quand une donnée de la copie vaut 0. Un critère existant donne exactement les mêmes notes. »
2. « Nouveau : « Retoucher ce calcul » part d'un calcul tout fait, et « Composer ton propre calcul » bâtit le tien avec les données de la copie, des nombres et les quatre opérations. Une fois gardé, ton calcul donne la note. »
3. « Nouveau : un calcul peut aussi servir à tes phrases et à tes tables de cas. Il entre dans la palette et dans le menu « Selon », sans toucher la note. »
4. « Une copie verrouillée affiche la note remise. Si le calcul actuel de la grille en donnerait une autre, une ligne te le dit. La copie ne change que si tu la déverrouilles et la modifies. »
5. « Barème : à l'évaluation, les tranches d'un critère analytique se lisent sous lui. Touche une tranche, puis ses points. L'étudiant·e lit le chiffre, et dessous le texte de la tranche. »
6. « Carte d'alignement : une chaîne d'étapes montre ce que ta carte contient déjà, de la compétence aux évaluations. Un clic ouvre le guide à la bonne page. »
7. « Liste des évaluations : « Mettre à la corbeille (N) » envoie d'un coup les copies cochées à la corbeille, où elles restent restaurables pendant 30 jours. »
8. « Corrigé : en plein écran, le guide de la carte s'ouvre au premier plan, et la barre d'espace active les boutons des palettes quand une copie est ouverte. »

Si un mot se révèle faux à la mesure (un geste ou un endroit qui n'existe pas comme écrit), **ne le change pas** : arrête-toi et dis-le.

## 2. La version

`node scripts/release.mjs minor` (1.221.0), skill `release-et-changelog`. Les jetons `?v=` suivent.

## 3. La vérification complète, sur le commit de release

**Pour la première fois par le script** : `node scripts/verdict-en-morceaux.mjs` (dix morceaux, fusion, jugement, jeton ; skill `fin-de-session`, § 4.5). **Avant de lancer** : dis à Grégoire « ferme Cowork, Chrome et Safari, je lance la vérification » ; Mac sur secteur. Si le script refuse ou casse, reprends la procédure à la main (`CONSIGNE-LOT-2026-10-26-mise-en-ligne-du-soir.md`, § 3) et mets le refus dans le rapport : c'est sa première course, son comportement est une mesure.

- **Vert** : `git push`.
- **Rouge** : ne pousse pas ; nomme le lot fautif par ses commits ; le rapport va à Cowork. Un test périmé par un lot (comme la spec du lot C le 26) se recale, se rejoue seul, et le verdict se reporte par `--reporter` aux trois conditions.

## 4. Après le push

- Constater « en ligne » chez Netlify, la 1.221 lue en bas de page.
- **Le run GitHub du push est le premier à traverser l'étape apt bornée** (#1114) : dis combien d'essais elle a pris dans chaque morceau (`::warning::install-deps`), si les seize rapports sont arrivés, et le juge contre la baseline Linux. Ne corrige rien ce soir.
- `BACKLOG.md` : #1120 se coche (les quatre gestes faits, déclarés non éprouvés : le toucher sur l'iPad et le zoom) ; #1172, #1173, #1174, selon leurs verdicts.
- `RELAIS.md`, `OU-EN-EST-ON.md`, `CONSIGNE-DEMARRAGE-PROCHAINE-SESSION.md` : la 1.221 en ligne ; la suite : la refonte de l'Aide (`PLAN-2026-10-24-refonte-de-l-aide.md`, Cowork remesure d'abord).
- Portes terrain : aucune (les verdicts, chacun en § Portes).
