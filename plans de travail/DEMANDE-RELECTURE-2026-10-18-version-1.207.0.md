# Demande de relecture – la dissection, la version 1.207.0 (« Créer ta grille, même incomplète »)

> Claude Code, dimanche 18 octobre 2026, vers 20 h 20 (Toronto). Consigne : `CONSIGNE-LOT-2026-10-18-dissection-10-version-1.207.md` (20 h 09), **temps A**. Pour Cowork (`PROTOCOLE.md`, règle 2).
> Deux commits sur `main`, **non poussés** : le lot (`a24ace97`), puis la release 1.207.0 (`e76e65fe`) ; ce fichier suit dans un troisième commit. **Pas de verdict Playwright, pas de push** : c'est le temps B.

## Ce qui est fait

1. **Les textes des lots 9 et 9b** : marqués « validé G. 18 oct. 20 h 08 » (`evaluation-calcul.js`, `grilles.js`, `materiel.js`, `materiel-dissection.js`). Les deux qui changent :
   - **Sous la note, à l'évaluation** : « Pas de note tant qu'un critère n'a pas ses points : A, B. Donne-leur leurs points dans Conception → Grilles de critères. » En pourcentages : « …n'a pas sa pondération : A, B. Donne-leur leur pondération… ». Au singulier : « Donne-lui ses points » / « Donne-lui sa pondération ».
   - **Le refus d'enregistrer et la synthèse** : « sans points : A, B » ; en pourcentages, « sans pondération : A, B ».
   - **Comment « en points » est décidé** : par `grilleEntierementEnPoints` (tous les critères analytiques), la règle que Grilles de critères emploie déjà pour « sans points » / « sans pondération ». `calculerPortee` la publie dans la portée (`enPoints`). Une grille mixte dit donc « pondération ».
2. **Le paquet `.lcz`** (`partage-export.js`) : `exporterEntite` refuse une grille qui porte un critère marqué, **avant** la confirmation et le paquet, avec le message tranché (singulier et pluriel). Le schéma de partage ne change pas.
   - **Supposition nommée** : la consigne ne donne le message qu'en points. Pour une grille en pourcentages, j'ai appliqué la même règle que la garde : « 1 critère n'a pas sa pondération (A). Donne-lui sa pondération dans « Grilles de critères », puis partage-la. » Texte pour l'enseignant, pas pour l'élève.
3. **L'entrée 1.207 des Nouvelles**, en tête, mot pour mot. Espaces insécables comme la 1.206. Les apostrophes droites de la consigne y sont typographiques (’), comme dans la 1.206.
4. **La release** : `scripts/release.mjs minor` → **1.207.0** (build 1018-2016). Les quatre points de vérité sont synchrones.
5. **La porte** : le §7 de Cowork, commité tel quel.

## Une limite, à savoir (inscrire et continuer, non corrigée)

Le refus ne vise que le partage **d'une grille**. Une **cartouche** ou une **production** emporte sa grille comme dépendance. Si cette grille porte un critère marqué, son `null` fait encore échouer l'auto-contrôle, avec l'ancienne alerte « le package généré ne passe pas la validation ». Le message « Cette grille… » n'y conviendrait pas tel quel. Je ne l'ai pas inscrit au BACKLOG, puisque personne n'a vécu ce symptôme. La décision vous revient.

## Un incident de procédure, réparé

Le premier commit du lot a été refusé par le garde anti-cache : `grilles.js`, `materiel.js` et `materiel-dissection.js` (commentaires seulement) gardaient leur `?v=`. Ma commande enchaînait la release sur une nouvelle ligne : `release.mjs` a donc tourné sur l'arbre non commité. Je l'ai annulé (`git checkout` des cinq fichiers de version, rien d'autre), j'ai posé les trois jetons, puis j'ai refait le lot et la release dans l'ordre. `version.json` est revenu à 1.206.0 avant la vraie release.

## Les bancs

- **Banc neuf** : `materiel-dissection-10-version-1.207.test.js`, 7 essais.
  - T : les mots de la garde, en points, en pourcentages et en grille mixte, au singulier et au pluriel.
  - P : le message du `.lcz`, et le refus avant tout rassemblement du paquet.
- **Break-tests**, avec les fichiers restaurés chaque fois :
  - `enPoints` toujours faux : T.a et T.b rougissent ;
  - `enPoints` toujours vrai : T.c et T.d rougissent ;
  - le refus retiré d'`exporterEntite` : P.c rougit ;
  - la marque ignorée : P.a, P.b et P.c rougissent.
- `phrasesPorteeIncomplete` est maintenant exposée pour les bancs (même patron que `rendreAttenduCritere`).
- **Vitest complet, avant le commit** : 779 fichiers, **9 258 essais, tous verts**.
- **Vitest complet, après le commit de release** : 779 fichiers, **9 258 essais, tous verts**.
- **WebKit** : non lancé. C'est le verdict du temps B.

## Ce qu'aucune machine n'a éprouvé

- L'écran d'évaluation avec une vraie copie (« -- » et la phrase) : la porte §7 le laisse aussi à un cas réel.
- L'alerte du `.lcz` dans Safari : le geste est éprouvé en Vitest seulement.
