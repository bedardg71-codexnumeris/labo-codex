# Consigne – la version 1.209.0 (« Modifier tes réponses, et l'aide d'Apporter mon matériel »), ce soir

> Écrite par Cowork le lundi 19 octobre 2026 à 19 h 29 (Toronto, mesuré par `date`). Elle porte les quatre commits non poussés depuis la 1.208.0, tous relus et acceptés : le lot 13 (`4d029ac1`), la fusion de la vérification sur GitHub (`d55abef4`), le retrait de l'ancien assistant (`d0183549`), l'aide d'« Apporter mon matériel » (`06c21533`), plus le rangement de l'orthopédagogie (`958531e3`). **Textes du lot 13 et entrée des Nouvelles validés par Grégoire à 19 h 29.** **Deux temps, deux relais** : la release, relue par Cowork ; puis, Cowork fermé, le verdict et le push. Règles 2, 7 et 8 de `PROTOCOLE.md` ; skills `fin-de-session-labo-codex` (§4.5) et `release-et-changelog`.

## Temps A — la release

1. **Les textes du lot 13** (`REFUS_REPONSES` et le rendu, `js/grilles.js`) : tous gardés, sauf trois refus qui changent, mot pour mot :
   - « Des points qui ne commencent pas par « _ » » devient « Les points ne peuvent pas commencer par « _ » » ;
   - « Des points de 0 à 100 » devient « Les points vont de 0 à 100 » ;
   - « Des points de 200 caractères au plus » devient « Les points font 200 caractères au plus ».
   Les bancs qui citent les anciens textes suivent. Marque les commentaires de ces textes « validé G. 19 oct. 19 h 29 » ; plus aucun « PROVISOIRE » pour le lot 13.
2. **L'entrée des Nouvelles**, `version: '1.209'`, `couleur: 'vert'`, en tête, mot pour mot, espaces insécables et apostrophes comme la 1.208 :
   - Titre : « Modifier tes réponses, et l'aide d'Apporter mon matériel »
   1. « Dans « Grilles de critères », les réponses d'un critère créé à partir de ta grille se modifient : corrige leur texte, change leurs points, ajoute une réponse ou retire-en une. Tout s'enregistre seul, et aucune note déjà donnée ne change. »
   2. « « Apporter mon matériel » a maintenant son aide : une aide « i » à côté du titre, des bulles sur ses boutons, une section dans Aide › Configuration et une étape de la visite guidée. »
   3. « Six termes s'ajoutent au lexique : critère, élément observable, descripteur, niveau, points et pondération. »
   Les entrées 1.208 et 1.207 restent telles quelles.
3. `/fin-de-session` jusqu'au commit de release **inclus** : intention **minor**, `scripts/release.mjs` → **1.209.0**. La ligne « complexité » du relais : le retrait l'a laissée à 454.
4. Vitest complet **après** le commit de release.
5. Commite avec : `VERDICT-RELECTURE-2026-10-19-ranger-orthopedagogie.md`, cette consigne, la consigne du jour et son archive.
6. Demande courte : `plans de travail/DEMANDE-RELECTURE-2026-10-19-version-1.209.0.md`. **Puis arrête-toi.**

## Temps B — le verdict, le push et la première vérification chez GitHub (second relais de Grégoire)

> Réécrit par Cowork à 19 h 53 : à 19 h 52, une autre session apportait encore des modifications à la page d'accueil (`js/accueil.js` et `index.html` modifiés, non commités). Ce temps B les prend en compte.

**Seulement quand Grégoire dit que sa journée est finie : Chrome, Safari et Claude fermés, Mac sur secteur, sans veille.**

0. **L'arbre de travail doit être propre.** Le travail de la page d'accueil se commite par son propre lot, relu par la session Cowork qui l'a demandé, avant ce temps B. S'il reste un fichier suivi modifié, ou un commit de l'accueil sans sa relecture, **arrête-toi et dis-le** : rien de ce qui suit ne part sur un arbre sale, parce que le verdict lit les fichiers du disque.
1. **L'item 1 des Nouvelles corrigé** (décision de Grégoire, 19 h 50, sur ton signalement), mot pour mot, insécables comme le reste de l'entrée : « Dans « Grilles de critères », les réponses d'un critère créé à partir de ta grille se modifient : corrige leur texte et, dans une grille en points, change leurs points, ajoute une réponse ou retire-en une. Tout s'enregistre seul, et aucune note déjà donnée ne change. »
2. **Si des commits ont touché `js/`, `index.html` ou `styles.css` après `e7d8c1ed`** (l'accueil) : le build affiché doit être celui de ce qui part. Refais-le par `scripts/release.mjs` (même numéro 1.209.0 si le script le permet, sinon 1.209.1 : ton choix technique, dis lequel), et vérifie le jeton de chaque fichier modifié depuis la 1.208.0. N'ajoute une ligne aux Nouvelles pour l'accueil que si la consigne de son lot en porte une, validée par Grégoire.
3. Un commit pour 1 et 2, avec `VERDICT-RELECTURE-2026-10-19-version-1.209.0.md` ; Vitest complet.
4. **Verdict complet du Mac sur le dernier commit.** C'est aussi le contrôle du juge après la fusion (verdict du 19 à 13 h 52) : il doit être vert, sans échec, comme celui de 10 h 25. Rouge : pas de push, nomme le lot en cause, arrête-toi.
5. Vert : **push**.
6. **La première vérification complète chez GitHub**, sur ce même commit : celle que le push déclenche, ou `gh workflow run tests.yml` s'il n'en part aucune. Attends son verdict (`gh run watch`), sans rien pousser d'autre.
7. Le point 5 du mandat du 16 (`CONSIGNE-2026-10-16-verdict-sur-github.md`) : les deux listes de rouges (Mac et GitHub), leurs durées, et ta recommandation. **Le juge du push reste le Mac** (décision de Grégoire du 10 oct.) : un rouge chez GitHub ne défait rien, il s'écrit. Rapport dans `plans de travail/RAPPORT-2026-10-19-premiere-verification-github.md`, non commité ; Cowork le lira demain.
8. Rapport court : vert ou rouge sur le Mac, l'heure du push, vert ou rouge chez GitHub.
