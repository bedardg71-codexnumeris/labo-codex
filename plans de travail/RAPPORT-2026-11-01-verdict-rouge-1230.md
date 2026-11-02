# Rapport pour Cowork – Verdict rouge sur la 1.230.0 (1er novembre 2026)

> Claude Code, dimanche 1er novembre 2026, soir. Consigne : `CONSIGNE-LOT-2026-11-01-mise-en-ligne-1230.md`, § 3, branche « Rouge ». **Rien n'est poussé : en ligne, toujours 1.229.0.**

## Le verdict

`node scripts/verdict-en-morceaux.mjs`, sur `46a0830d`, de 20 h 52 à 22 h 38, sans refus de garde : **code 1**. 1 322 essais, 1 316 verts, 1 au second essai, 5 rouges (4 connus), 23 sautés. Secteur, éveil tenu, 0 veille, pression mémoire 1.

**La seule rougeur nouvelle** : `annotation-deux-doigts-page.spec.js`, « le pincement et le glissé cohabitent », à la ligne 147, le témoin « le zoom a bien eu lieu » : la largeur du document doit dépasser 500 px, elle vaut 318.

**Le vert au second essai**, qui ne bloque pas : `grilles-sous-criteres-condense.spec.js`. Sans lien établi avec le lot.

## Le lot fautif

**La barre d'outils et la palette Codes compactes, partie C : `67e2f649`, « fix(visionneuse) : la zone de travail tient dans l'écran ».**

Mesuré, l'essai seul, sans reprise :

| Commit | Résultat |
|---|---|
| `6ab4f080` (la 1.229.0 en ligne) | vert |
| `5eefed7c`, `e00f9fe9`, `d8ada574` | vert |
| `67e2f649`, `4ed99788`, `6dd40044` | rouge, 318 |
| `46a0830d` (la 1.230.0) | rouge, 5 fois sur 5 |

Ce n'est donc pas de l'instabilité. La spec ne figurait pas parmi celles que le rapport du lot nomme comme rejouées (aucune mention dans `RAPPORT-2026-11-01-barre-outils-et-codes-compacts.md`).

## Le zoom marche : c'est le témoin qui a vieilli

Mesuré dans ce même essai à 1280 × 720, en ajoutant une mesure sur une copie jetable (rien de commité) :

| | `d8ada574` (avant) | `46a0830d` (après) |
|---|---|---|
| Hauteur du cadre de la copie | 557 px | 316 px |
| Largeur du document, avant le pincement | 373 px | 212 px |
| Largeur du document, après le pincement | 560 px | 318 px |
| Rapport du zoom | 1,50 | **1,50** |
| Saut du point fixe, en largeur et en hauteur | 0,0006 et 0,0007 | **0 et 0,0008** (seuil 0,01) |

**Fait** : le zoom vaut toujours 1,5 et le document ne saute pas. Le seuil de 500 px supposait l'ancienne hauteur, que `67e2f649` a retirée. Le recul de 241 px (557 − 316) est celui que le commentaire de son code annonce.

**Fait, second point de la spec** : après le lot, le point visé tombe hors de la page (`fx` = 1,08 ; avant, 0,62), alors que le commentaire de l'essai veut « le document bien dans le cadre ». Le point fixe n'est donc plus jugé là où l'essai le prétend.

**Inférence** : aucun code de l'application n'est en cause, seule la spec est à reprendre. Je ne l'ai pas modifiée : la consigne dit de s'arrêter ici.

## Ce que je propose (à toi de trancher)

Dans la spec seule : le témoin devient un rapport (largeur après > 1,4 × largeur avant), et le point visé revient dans la page, mesuré d'après le document plutôt qu'en pixels fixes. Puis la suite entière.

**Le report ne s'applique pas** : `verdict-en-morceaux.mjs --reporter` exige un jeton en place **vert**, et le jeton de `46a0830d` est rouge. Il faut donc repasser les dix morceaux, soit 1 h 46 ce soir, Cowork, Chrome et Safari fermés.

## À voir à côté, sans rien changer

Le titre validé dit « plus de place pour la copie ». Hors plein écran, sur ce banc, la copie s'ouvre plus étroite : 212 px contre 373. La hauteur courte est déjà assumée (rapport du lot, verdict, question de la porte terrain, 416 px à 1180 × 820) ; la largeur d'ouverture qui en découle n'y est pas nommée. Ce n'est pas un mot faux établi : je n'ai mesuré ni le plein écran ni l'iPad. Je ne touche pas au texte ; la porte terrain tranchera.

## État du dépôt

`main` local : 27 commits d'avance sur `origin/main`, dont ce rapport. Le jeton est rouge : le crochet refuse le push tant que la suite n'est pas repassée au vert. Les trois branches `lot/` attendent toujours, intactes.
