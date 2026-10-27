# Consigne – La mise en ligne du soir : la table de cas (3a, 3b) et le groupe-cours sans ses élèves (#1038), en 1.220 (26 octobre 2026)

> Écrite par Cowork le lundi 26 octobre 2026 à 15 h 35 (Toronto, mesuré par `date`), sur `main` = `12dc3d9b`. Lots relus et acceptés sans retouche : `VERDICT-RELECTURE-2026-10-26-table-de-cas-3a.md`, `VERDICT-RELECTURE-2026-10-26-table-de-cas-3b.md`. Décision de Grégoire (26 oct., 15 h 29) : **le correctif du groupe-cours (#1038), en cours dans une autre session, part dans cette version.**

## 0. Avant tout

- **Ne commence que si** le lot #1038 (`CONSIGNE-LOT-2026-10-26-groupe-cours-sans-ses-eleves-1038.md`) est **commité sur `main` et accepté par Cowork** (un `VERDICT-RELECTURE-…-1038…` dans `plans de travail/`, ou Grégoire te le dit en te donnant cette consigne). Sinon : arrête-toi et dis-le ; rien ne part sans lui.
- Aucune autre session ne tourne ; `main` à jour ; pas de `git stash`.
- Rituel de début de session. Ce fichier part dans le commit de release.

## 1. Les Nouvelles : une entrée, 1.220

Texte **validé par Grégoire, mot pour mot, le 26 oct. 2026 à 15 h 31**. Insécables en `&nbsp;`, apostrophes typographiques, comme les entrées voisines ; note la validation dans le commentaire de l'entrée. `couleur: 'vert'`.

- Titre : « Des commentaires selon le cas de chaque copie »
1. « Critère algorithmique : l'étape « Paliers » devient « Cas d'interprétation ». Les paliers s'y lisent en table : quand chacun s'applique, son nom court et ce que l'étudiant·e lit. »
2. « Le seuil de chaque palier se règle en pourcentage de la limite. « Voir ce que l'étudiant·e lirait à ce palier » règle la copie fictive sur ce palier. »
3. « « Fixer une limite » et « Retirer la limite » remplacent le menu « Modèle de projection ». Retirer la limite ne fait plus rien perdre : la fixer de nouveau retrouve tes réglages. Tes collections se reprennent depuis l'en-tête des paliers. »
4. « Nouveau : « + Ajouter une table de cas ». Une table choisit le texte que lit l'étudiant·e selon une valeur de sa copie : le compte, la note, la part de la limite, la moyenne ou le code le plus fréquent. Ce texte s'ajoute après les paliers, jusque dans le PDF. Une table neuve est vide : rien ne change tant que tu n'écris rien. »
5. « « Ce que l'application choisit sans toi » montre les textes que le critère écrit seul, et dans quels cas. »
6. « Un critère neuf part de champs vides quand tu fixes sa limite, sans les valeurs de l'épreuve uniforme de français. Ses noms (« unités manquantes », « calculs »…) remplacent « erreur » et « mots » dans toutes ses phrases. Un critère existant dit exactement ce qu'il disait. »
7. « La simulation de ce que l'étudiant·e lirait montre aussi son bilan et le signalement d'un palier. »
8. « Corrigé : quand tu enregistres un groupe-cours dont les étudiant·es sont rattaché·es à un autre cours, l'application te le dit. L'import te le dit aussi quand tes productions appartiennent à un autre cours. »

Si un mot se révèle faux à la mesure (un geste ou un endroit qui n'existe pas comme écrit, dans 3a, 3b ou #1038), **ne le change pas** : arrête-toi et dis-le.

## 2. La version

`node scripts/release.mjs minor` (1.220.0), skill `release-et-changelog`. Les jetons `?v=` des fichiers des trois lots suivent.

## 3. La vérification complète, sur le commit de release

> **Ajout du 27 oct. (fusion de `tri-git`), pour les mises en ligne suivantes** : les gestes ci-dessous sont outillés par `node scripts/verdict-en-morceaux.mjs` (dix morceaux, fusion, jugement, jeton ; `--reporter` pour un commit de tests seulement). La procédure à la main reste le repli : si le script refuse ou casse, on la reprend, et le refus va dans le rapport. Détail : skill `fin-de-session`, § 4.5.

**En dix morceaux**, comme ce matin (`RELAIS.md`, l'entrée du 26 oct. : `scripts/morceau-playwright.mjs`, `caffeinate -d -i -s`, fusion, jugement contre `playwright-baseline.json`). **Avant de lancer** : dis à Grégoire « ferme Cowork, Chrome et Safari, je lance la vérification » ; Mac sur secteur ; regarde la pression mémoire à chaque morceau (le Mac a redémarré la nuit du 25, mémoire saturée). Si elle n'est pas basse, dis-le et attends.

- **Vert** : écris le jeton de verdict au format de `verifier-playwright.mjs` (sa raison le dit), puis `git push`, comme ce matin : `scripts/pousser.sh` relancerait la suite d'un bloc.
- **Rouge** : ne pousse pas ; nomme le lot fautif par ses commits (3a, 3b, #1038) ; le rapport va à Cowork.

## 4. Après le push

- Constater « en ligne » chez Netlify, la 1.220 lue en bas de page.
- Le run GitHub du push : le juger contre la baseline Linux (#1114). Une spec rouge sous Linux et verte sur le Mac suit le tri du 25 oct. ; ne corrige rien ce soir, dis-le.
- `RELAIS.md`, `OU-EN-EST-ON.md`, `CONSIGNE-DEMARRAGE-PROCHAINE-SESSION.md` : la 1.220 en ligne ; la suite (l'étape 4 du plan du 21 oct. attend une décision de Grégoire).
- Portes terrain : aucune pour 3a et 3b (verdicts, § 4) ; pour #1038, ce que dit son verdict.
