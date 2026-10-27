# Consigne – La mise en ligne du soir, en 1.222 (27 octobre 2026)

> Écrite par Cowork le mardi 27 octobre 2026 à 19 h 03 (Toronto, mesuré par `date`), sur `main` = `b9a7d11f`. **À lancer au signal de Grégoire**, sa journée finie. Tous les lots qui partent sont relus et acceptés : l'Aide, lot 2a, Commencer et Cadre (`51081606`, retouche `ad6484ea`) ; l'Aide, lot 2b, la Conception (`434012ce`, `87b35ccf`, `0eff1eaa`, `e316b1bc`, seconde retouche `9b55e8ec`). Leurs verdicts : `plans de travail/VERDICT-RELECTURE-2026-10-27-aide-lot-2*.md`, le dernier étant `…-aide-lot-2b-retouche-2.md`.

## 0. Avant tout

- Aucune autre session ne tourne ; `main` à jour ; pas de `git stash`.
- `CONSIGNE-DEMARRAGE-COWORK.md` est un document de Cowork, et les deux icônes non suivies (`icons/icons8-circle-80.png`, `icons/icons8-inactive-state-80.png`) ne sont pas de ce lot : ne commite ni ne supprime aucun des trois.
- **Le rituel `/fin-de-session`**, dont `OU-EN-EST-ON.md`. Ce fichier part dans le commit de release.

## 1. Les Nouvelles : une entrée, 1.222

Texte **validé par Grégoire, mot pour mot, le 27 oct. 2026 à 19 h 02** (« validé »). Insécables en `&nbsp;` (devant « : », « % », et à l'intérieur des guillemets), apostrophes typographiques, comme les entrées voisines ; note la validation dans le commentaire de l'entrée. `couleur: 'vert'`. Le tiret de « PS – Préstructurel » est le demi-cadratin de l'écran.

- Titre : « Une Aide plus courte, et un niveau sous I »
1. « Aide : Commencer, Cadre et Conception décrivent l'écran d'aujourd'hui, en moins de mots. Deux entrées sont neuves, « La bibliothèque » et « Les chaînes d'étapes », et SOLO et l'échelle de départ se lisent maintenant en une seule entrée. »
2. « Nouveau : dans un trimestre neuf, l'Échelle de départ (IDME) compte cinq niveaux. « PS – Préstructurel » va de 0 à 39,99 %, et « I » commence à 40 %. Les valeurs ponctuelles sont 0, 40, 65, 75 et 100. Le code « 0 » reste celui du non recevable. Tes échelles actuelles ne changent pas. »
3. « La Cartouche de départ d'un trimestre neuf a un commentaire PS pour chaque critère. Au tableau de bord, les étudiant·es au niveau PS comptent parmi ceux « en difficulté ». »
4. « Corrigé : quand tu supprimes une copie notée 0 %, la question dit « 0 % » au lieu de « --% ». »

Si un mot se révèle faux à la mesure (un geste, un nom d'entrée ou un endroit qui n'existe pas comme écrit), **ne le change pas** : arrête-toi et dis-le.

## 2. La version

`node scripts/release.mjs minor` (1.222.0), skill `release-et-changelog`. Les jetons `?v=` suivent.

## 3. La vérification complète, sur le commit de release

`node scripts/verdict-en-morceaux.mjs` (skill `fin-de-session`, § 4.5). **Avant de lancer** : dis à Grégoire « ferme Cowork, Chrome et Safari, je lance la vérification » ; Mac sur secteur, sans veille (elle tourne la nuit, sa cadence du 11 oct.). Si le script refuse ou casse, reprends la procédure à la main (`CONSIGNE-LOT-2026-10-26-mise-en-ligne-du-soir.md`, § 3) et mets le refus dans le rapport.

- **Vert** : `git push`.
- **Rouge** : ne pousse pas ; nomme le lot fautif par ses commits ; le rapport va à Cowork. Un test périmé par un lot (une spec de l'Aide qui cherche l'ancien texte, par exemple) se recale, se rejoue seul, et le verdict se reporte par `--reporter` aux trois conditions.

## 4. Après le push

- Constater « en ligne » chez Netlify, la 1.222 lue en bas de page.
- Le run GitHub du push : dis s'il va au bout (seize rapports), et le juge contre la baseline Linux. Ne corrige rien ce soir.
- `BACKLOG.md` : #1152 reste ouverte (le chantier de l'Aide continue) ; note-y les lots 2a et 2b en ligne en 1.222.
- `RELAIS.md`, `OU-EN-EST-ON.md`, `CONSIGNE-DEMARRAGE-PROCHAINE-SESSION.md` : la 1.222 en ligne ; la suite : le lot 2c de l'Aide (Évaluation, Suivi ; `PLAN-2026-10-24-refonte-de-l-aide.md`), dont Cowork écrit la consigne.
- Portes terrain : aucune due (décision de Cowork : les lots sont du texte d'Aide et le semis d'un trimestre neuf, que les essais éprouvent ; aucun raté irréversible).
