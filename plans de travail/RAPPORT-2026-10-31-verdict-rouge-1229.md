# Rapport – Le verdict de la 1.229 est rouge : aucun lot de la 1.229 n'en est la cause (31 octobre 2026)

> Claude Code, samedi 31 octobre 2026, 16 h 17 (Toronto), pour Cowork. Consigne : `CONSIGNE-LOT-2026-10-31-mise-en-ligne-1229.md`, § 3, branche « Rouge ».
> **Rien n'est poussé. En ligne : 1.228.0.** `main` local porte la release `b554565d` (1.229.0, build `1031-1415`).

## Le verdict

`node scripts/verdict-en-morceaux.mjs` sur `b554565d`, sans refus de garde : **code 1**. 1 220 essais, 1 215 verts, 0 au second essai, 5 rouges dont 4 connus, 23 sautés. Tout fermé (dit par Grégoire, confirmé aux processus), secteur, aucune veille, pression mémoire 1.

La rougeur nouvelle : `presences-lot-d-enregistrement.spec.js`, essai (g), « un échec d'écriture : « Non enregistré – Enregistrement des présences : … », aucun succès ». Le témoin d'échec reste vide (`Received string: ""`, ligne 290).

## Le lot fautif : aucun, mesuré

| Mesure | Résultat |
|---|---|
| La spec dans le lot `eb08f1af..b554565d` | non touchée |
| `js/saisie-presences.js`, `js/modes.js`, `js/presences.js` dans le lot | aucun commit |
| (g) seul, 20 répétitions sans reprise, sur `b554565d` | **3 rouges sur 20** |
| (g) seul, 20 répétitions sans reprise, sur `eb08f1af` (la 1.228 en ligne) | **3 rouges sur 20** |
| La spec entière, 3 répétitions, sur `b554565d` | 1 rouge sur 39, c'est (g) |

Inférence : la rougeur est intermittente et précède le lot. Avec une reprise (`retries: 1`), elle n'a besoin que de deux échecs de suite pour bloquer un verdict : c'est tombé ce soir. Mon échantillon est petit : 3 sur 20 des deux côtés ne prouve pas un taux identique.

## Ce que j'ai mesuré de la cause (copie jetable, retirée depuis)

- **Ce n'est pas un délai trop court** : attente portée de 1,9 s à 6 s, 5 rouges sur 20.
- **Ce n'est pas la valeur du champ** : il vaut 2 avant le geste dans les 20 essais, et le geste écrit 1.
- **Le témoin n'est pas en cause** : sur 20 essais instrumentés, **les 11 où l'écriture est tentée affichent l'échec ; les 9 où elle ne l'est pas restent vides.** Dans ces 9, le `db.setSync` refusé n'est jamais appelé, 3 s après le geste.

Mon écouteur `change` n'a pas départagé : il compte 0 aussi dans 5 des essais verts. Je ne sais donc pas où le geste se perd.

**Non prouvé, et c'est ce qui compte** : soit le geste du banc (`fill` puis `blur`) ne déclenche pas toujours la sauvegarde dans WebKit, soit l'application laisse parfois passer une modification de périodes sans l'enregistrer. Le second cas serait une saisie perdue, déjà présent en 1.228. Aucune de ces deux lectures n'est démontrée, et personne n'a signalé ce symptôme.

## Ce que je n'ai pas fait, et pourquoi

Pas de push, pas de `--no-verify`. Pas d'inscription de (g) dans `playwright-baseline.json` : ce serait retirer la garde d'un défaut dont la cause est inconnue. Pas de second verdict : un vert obtenu par relance ne dirait rien du défaut, et la consigne ne le prévoit pas.

## Le reste du rituel

- **Nouvelles** : `48574920`, texte du § 1 mot pour mot, `vert`. Jeton `changelog-data.js` à `20261031b`.
- **Release** : `b554565d`, quatre points à `1.229.0` / `1031-1415`. Le hook a refusé le premier commit : `release.mjs` reposait `?v=20261031a` sur `travaux-outils.js` et `travaux-annotation.js`, déjà servi avec un autre contenu par `52d5faf3` (#826). J'ai posé `20261031b`, comme proposé par le hook, sans le contourner. **Écart à signaler** : `release.mjs` peut reposer un jeton du jour déjà servi pour ce fichier.
- **Vitest** : 10 615 sur 10 615, avant ces deux jetons ; ensuite, seule `sentinelle-anticache-fichiers-modifies` rejouée (8/8).
- **Audit statique** sur le lot : aucun `eval`, `console.log` ni handler en ligne ; aucune zone protégée. Quatre `innerHTML` ajoutés : relus par Cowork pour les lots concernés, pas repris un à un ici.
- **Contre-épreuves** : 8 changements volontaires, 8 rouges, code restauré. Réponse du groupe, touche du code, formule du profil, ligne de calcul du PDF, ligne de copie de démo, orange des barres (Vitest) ; largeur du bloc de texte, trait des formes fermées au PDF (WebKit).
- **`verification-adverse` chargé seul** : non.
- **Complexité** (1.228.0 `ee9f340a` → 1.229.0) : fichiers de plus de 1 000 lignes 40 → 40, leurs lignes 93 104 → 93 352 (Δ +248) ; au-dessus de 15 : 442 → 440 (Δ −2) ; au-dessus de 30 : 82 → 81 (Δ −1, maximum 130) ; somme au-dessus de 15 : 11 104 → 11 043 (Δ −61).

## Les mots du § 1 : aucun faux, trois tournures à relire

Aucun mot n'est démenti, et je n'en ai changé aucun. Trois formulations compriment ce que fait le code ; je les ai jugées vraies, à Grégoire de dire s'il les veut telles quelles :

1. Item 5, « La palette est plus compacte, et ses catégories de tampons se replient » : les 188 px (au lieu de 200) visent la palette d'annotation ; les catégories sont dans la palette Tampons.
2. Item 6, « l'étiquette de l'élève ouvre son profil » : c'est un bouton posé sur l'étiquette.
3. Item 7, « « Garder dans ma bibliothèque » la ramène dans tes vrais trimestres » : ce bouton la met dans la bibliothèque ; hors démo, « Utiliser dans ce trimestre » la ramène.

« La note du cours ne change pas » : aucun commit dans `js/pratiques/`, et les lignes touchées de `profil-etudiant-calculs.js` concernent le niveau RàI et la réponse du groupe, pas le calcul de la note. C'est une lecture du diff, pas une comparaison de notes sur un vrai codex.

## Trouvailles et leur issue

- **(g) intermittent** : inscrit, #1212 (il bloque la mise en ligne en cours).
- **Le jeton réutilisé par `release.mjs`** : commenter et oublier ; le hook l'attrape.
- **« Note finale de session » reste le titre du profil en cas d'erreur de configuration**, sans ligne de calcul (`js/profil-etudiant-sections-affichage.js:2845`) : commenter et oublier.

## Hors commit, laissés tels quels

`CONSIGNE-DEMARRAGE-COWORK.md`, `REFLEXION-2026-10-30-seuils-normatif-critere-ipsatif.md`, `captures/fenetre-de-fusion-*.png`, et trois pièces de **ce** lot : `VERDICT-RELECTURE-2026-10-31-palettes-annotation.md`, `TEXTES-2026-10-31-palettes-annotation.md`, `TEXTES-2026-10-31-note-actuelle-sommative.md`. Lecture stricte du § 0 (« ce fichier ») : supposition de ma part. Ces trois preuves de relecture ne sont pas au dépôt tant que personne ne les commite.

## Ce qu'il reste à trancher

La suite de la mise en ligne, à Grégoire et Cowork. Ma recommandation : un petit lot qui établit si le geste du banc ou l'application perd la saisie, puis le verdict complet (environ 1 h 35). Tout commit de code ou de spec exige de toute façon une suite entière : le jeton est rouge, `--reporter` serait refusé.
