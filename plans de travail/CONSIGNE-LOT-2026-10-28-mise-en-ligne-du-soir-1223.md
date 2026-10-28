# Consigne – La mise en ligne du soir, en 1.223 (28 octobre 2026)

> Écrite par Cowork le mercredi 28 octobre 2026 à 15 h 47 (Toronto, mesuré par `date`), sur `main` = `96750af7` (37 commits d'avance sur `origin/main` = `ac71f50b`). **À lancer au signal de Grégoire.** Tous les lots qui partent sont relus et acceptés : l'Aide, lots 2c (l'Évaluation), 2c bis (le Suivi), 2d (Labo, codex, Référence) et 3 (un seul glossaire), avec leurs retouches ; la copie non recevable (#1175, quatre retouches) ; les correctifs de la note E1-E4, E7 (`19db734c`) et leur retouche E14-E16 (`96750af7`, #1177) ; l'accueil, trois portes d'entrée (`d5aef7d3`, relu par une autre session Cowork ; vu par Grégoire sur l'iPad). Les verdicts : `plans de travail/VERDICT-RELECTURE-2026-10-28-*.md`.

## 0. Avant tout

- Aucune autre session ne tourne ; `main` à jour ; pas de `git stash`.
- Les deux icônes non suivies (`icons/icons8-circle-80.png`, `icons/icons8-inactive-state-80.png`) ne sont pas de ce lot : mets-les de côté le temps du verdict (hors de l'arbre, sans les supprimer), puis remets-les ; ne les commite pas. `CONSIGNE-DEMARRAGE-COWORK.md` est un document de Cowork : il part dans le commit de docs, sans que tu y touches.
- **Commit de docs seul d'abord**, fichiers nommés : ce fichier, `VERDICT-RELECTURE-2026-10-28-construction-de-la-note-correctifs-retouche.md`, `CONSIGNE-LOT-2026-10-28-standards-sans-portfolio-plan.md`, `CONSIGNE-LOT-2026-10-28-aide-lot-4-les-trous.md`, `CONSIGNE-LOT-2026-10-28-aide-lot-5-textes-d-ecran.md` (le § 1.4, ajout de Cowork), `CONSIGNE-LOT-2026-10-28-construction-de-la-note-correctifs.md`, `CONSIGNE-DEMARRAGE-COWORK.md` (à la racine, modifié par Cowork à 15 h 50). Rien d'autre.
- **Le rituel `/fin-de-session`**, dont `OU-EN-EST-ON.md`. Ce fichier part dans le commit de release.

## 1. Les Nouvelles : une entrée, 1.223

Texte **validé par Grégoire, mot pour mot, le 28 oct. 2026 à 15 h 45** (« c'est bon ! »). Insécables en `&nbsp;` (devant « : », « ? », « % », et à l'intérieur des guillemets), apostrophes typographiques, comme les entrées voisines ; note la validation dans le commentaire de l'entrée. `couleur: 'vert'`.

- Titre : « Toute l'Aide à jour, et la note revue pratique par pratique »
1. « Accueil : trois portes d'entrée remplacent la bannière : « Tu enseignes ? », « Tu es orthopédagogue ? » et « Tu es conseiller·ère pédagogique ? ». »
2. « Aide : l'Évaluation, le Suivi, le Labo, le codex et la Référence décrivent l'écran d'aujourd'hui, en moins de mots. Il n'y a plus qu'un seul glossaire, et « En savoir plus » mène à la fiche du terme. »
3. « Une copie non recevable montre « Non recevable (Plagiat) » ou « Non recevable (IA non autorisée) » à la place de sa note et de ses niveaux, sur le formulaire, le PDF et la Liste ; ton évaluation est gardée. Elle vaut 0 en sommative et dans une évaluation terminale de standards, et n'est pas satisfaisante en spécifications : des notes changent. »
4. « Pendant une reprise, la copie originale compte dans la note, et comme remise, jusqu'à ce que la reprise soit évaluée et verrouillée. Dans la Liste, elle porte « Compte jusqu'à sa reprise ». Des notes changent. »
5. « Sommative : une production à pondération 0, comme un artefact de portfolio, n'entre plus dans la moyenne. Si toutes sont à 0, il n'y a pas de note, plutôt qu'un 0. »
6. « L'export des Résultats finaux dit « provisoire » tant que « Notes finalisées » n'est pas cochée dans ta pratique : coche-la avant de reporter tes notes dans Léa. »
7. « Assistant de pratique : « Portfolio de progression », qui ne changeait pas la note, est retiré. En « Hybride », le nombre que tu donnes à la création est celui des meilleures productions, auxquelles s'ajoutent les obligatoires. »
8. « Corrigé : en dénotation, un jugement enregistré sans note n'est plus compté comme un 0. »

Si un mot se révèle faux à la mesure (un geste, un nom ou un endroit qui n'existe pas comme écrit), **ne le change pas** : arrête-toi et dis-le.

## 2. La version

`node scripts/release.mjs minor` (1.223.0), skill `release-et-changelog`. Les jetons `?v=` suivent.

## 3. La vérification complète, sur le commit de release

`node scripts/verdict-en-morceaux.mjs` (skill `fin-de-session`, § 4.5). **Avant de lancer** : dis à Grégoire « ferme Cowork, Chrome et Safari, je lance la vérification » ; Mac sur secteur, sans veille. Si le script refuse ou casse, reprends la procédure à la main (`CONSIGNE-LOT-2026-10-26-mise-en-ligne-du-soir.md`, § 3) et mets le refus dans le rapport. **Le SSH rétabli avant le push** (vérifie-le avant de lancer le verdict, pas après).

- **Vert** : `git push`.
- **Rouge** : ne pousse pas ; nomme le lot fautif par ses commits ; le rapport va à Cowork. Un test périmé par un lot (une spec de l'Aide qui cherche l'ancien texte, un badge « Remplacée » attendu pendant une reprise) se recale, se rejoue seul, et le verdict se reporte par `--reporter` aux trois conditions. L'instable connu (`presences-lot-d-enregistrement`, trois soirs de suite) : dis s'il revient, ne le corrige pas.

## 4. Après le push

- Constater « en ligne » chez Netlify, la 1.223 lue en bas de page.
- Le run GitHub du push : dis s'il va au bout (seize rapports), et le juge contre la baseline Linux. Ne corrige rien ce soir.
- `BACKLOG.md` : #1152 reste ouverte (lots 4 et 5 de l'Aide, l'intégration du trou 2) ; #1175 et #1177 en ligne en 1.223 ; la fiche du chantier « standards sans portfolio » est écrite par son lot 1, pas ce soir.
- `RELAIS.md` (dont les commits poussés), `OU-EN-EST-ON.md`, `CONSIGNE-DEMARRAGE-PROCHAINE-SESSION.md` : la 1.223 en ligne ; la suite : le lot 1 du chantier « standards sans portfolio » (`PLAN-2026-10-28-standards-sans-portfolio.md` ; décisions au `DECISIONS-…`, §§ Q1 à Q6), dont Cowork écrit la consigne ; puis les lots 4 et 5 de l'Aide.
- Portes terrain : aucune due (décision de Cowork : textes d'Aide, calculs éprouvés au banc, accueil vu par Grégoire sur l'iPad ; aucun raté irréversible).
