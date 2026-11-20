# Rapport : la 1.251.0 en ligne (nuit du 19 au 20 nov. 2026)

**Dernier relais.** `main` porte la 1.251.0 et elle est en ligne. Rien n'attend sur une branche. Fait dans l'arbre
`../labo-codex-fusion`, sur le secteur, Cowork, Safari et Chrome fermés.

## Pour Grégoire

- **Version** : 1.251.0, build 1119-2216.
- **Préparée** le 19 nov. à 22 h 16 ; **en ligne** le 20 nov. à 0 h 12.
- **Verdict complet du Mac : vert.** 1 781 essais, 1 761 verts au premier essai, 20 au second, aucun rouge, 68 sautés.

**Ce que tu peux aller voir.**

1. À l'accueil, ouvre les Nouvelles : l'entrée « La grille d'autoévaluation dans les consignes » est en tête, avec ses
   quatre lignes.
2. Dans Conception › Grilles, ouvre une grille dont l'échelle a ses deux seuils : la case du niveau qui porte un seuil
   montre son nom (« Seuil minimal de réussite », « Seuil de maîtrise »), et chaque critère a une case « Pour vérifier ».
3. Écris une question dans « Pour vérifier », puis demande le PDF des consignes d'une production qui emploie cette
   grille : coche la grille d'autoévaluation et regarde la page jointe.
4. Dans Conception, touche « Dupliquer » sur une grille, change un texte dans la copie, rouvre l'original : il n'a pas
   changé.
5. Dans Alignement pédagogique, glisse vite une activité dans une leçon, à la souris puis au doigt sur l'iPad : elle
   s'y range.
6. Dans Réglages › Données › Maintenance, « Vérifier les copies liées » : c'est la mesure, en lecture seule, des
   copies faites AVANT cette version et encore liées à leur source. Elle n'écrit rien.

## 1. Ce qui est parti

- La branche d'assemblage, à la tête attendue, fusionnée sans conflit (`12baa084`, PR n° 41, fusion `a099442f6`).
- `main` avait bougé d'une seule entrée de relais, rien d'autre ; les 490 entrées de `RELAIS.md` sont toutes là (`f343e3bd`).
- `PARCOURS_OUVERTS` est celui de `main` ; aucune des branches exclues n'est ancêtre de `main` (mesuré une à une).
- Fiches : aucun numéro en double de #1294 à #1301 ; #1297, #1299 et #1300 n'ont pas de fiche sur `main`, seulement
  leur mention dans la ligne « Dernier ID ». Sept doublons anciens (#417, #427, #495, #521, #523, #529, #530) existaient
  déjà sur `main` avant la fusion : non touchés.
- Les Nouvelles : le titre et les quatre lignes approuvés à 22 h 09, mot pour mot ; le jeton de cache du fichier suit.
- Release : les quatre points de vérité concordent, vérifiés au diff ; l'ancien build n'y paraît plus (`8a3c73d71`).

## 2. Le rituel avant le verdict

- Audit statique des 964 lignes ajoutées : aucun `console.log`, aucun `eval`, aucun handler inline, aucun `innerHTML`
  neuf, aucune zone protégée touchée. `js/import-export.js` est touché : la suite complète a tourné.
- Vitest sur l'état fusionné : 935 fichiers, 11 976 tests, tous verts.
- Break-tests, tous rouges comme attendu, fichiers restaurés :
  - la détection des copies liées neutralisée : 7 rouges (`diagnostic-copies-liees-1298.test.js`) ;
  - la garde « les deux seuils » de la page d'autoévaluation retirée : 2 rouges (`autoevaluation-consignes.test.js`) ;
  - la copie profonde de « Dupliquer » retirée : 2 rouges sous Safari, paysage et portrait (`dupliquer-copie-profonde-1298.spec.js`).

## 3. Le verdict

40 passages, un à la fois, un worker, sous `caffeinate`, de 22 h 17 à 0 h 06. Mémoire libre entre 79 et 81 % du début
à la fin ; passage le plus long : 283 s ; aucun passage tué, aucun refus des gardes.

**Aucun rouge.** Deux essais sortent même des échecs connus : `pied-de-page-et-assistance`, 820 px, clair et sombre,
verts au premier essai (#1284).

**Ce que le mandat demandait de regarder.**

| Essai | Résultat sous Safari |
|---|---|
| parcours-5, « les sept étapes (1180 px) » | vert au premier essai |
| `dissection-legende` L6 | vert au premier essai (7 sur 7 dans le fichier) |
| `temoin-enregistrement-lot-b`, 768 px | vert au premier essai (13 sur 13) |
| `descripteurs-niveaux-grille`, « iPad en haut » | vert au premier essai |
| Banc du diagnostic « Copies liées à leur source » | 6 sur 6, premier essai : première fois sous Safari |
| Les deux essais du clic de `planif-glisser-relachement-1295` | verts dans les deux fenêtres, premier essai : première fois sous Safari |
| Les bancs neufs des lots (assemblage, autoévaluation, dupliquer, noms des seuils) | tous verts au premier essai |

**Les 20 verts au second essai.** Un seul touche un écran des lots :

- **parcours-5, « capture 25 »** (Alignement). Rejoué seul six fois sans second essai : **6 rouges sur 6**, toujours à
  la ligne 421 (le titre du bloc neuf n'a pas le focus après le toucher de « Compétence »). Rejoué de la même façon sur
  `main` d'avant la fusion, dans un arbre témoin : **6 rouges sur 6, même ligne.** Il est donc antérieur aux lots ;
  c'est la fiche déjà inscrite, qui le mesurait à 4 sur 6. Issue : **inscrit, on continue** (#1296).
  ⚠ Ce que la mesure ajoute : joué seul, il ne passe plus du tout ; dans la suite, il passe au second essai.
  « Intermittent » ne le décrit plus bien.

Les 19 autres ne sont pas des essais des lots et n'ont pas été rejoués : `bulle-largeur-ipad` L2 ;
`codex-1012-avertissement` (2) ; `comptes-erreurs-stock-1142` (trois essais) ; `evaluer-868-avec-ou-sans-copie` ;
`gel-etape-7`, 24 et 36 rangées ; `grilles-sous-criteres-condense` iPad (déjà au second essai au verdict de la
1.247.0) ; `lot-i-bis` (4) ; `palette-evaluation-compacte` (deux essais) ; `palette-retroaction-compacte` ;
`parcours-1-et-2` « panneau » ; `parcours-fleches` « zoom au pincement » ; `presences-lot-d-enregistrement` ;
`registre-longitudinal-915` R5 ; `tampons-masques-bibliotheque-1216` ; `texte-troue-reperes-enonces`.
Issue : nommés ici, non inscrits (non vécus, ne bloquent rien).

## 4. Le push et la mise en ligne

- Poussé à 0 h 12, sans contournement : le hook a lu le verdict vert à jour pour ce commit et relancé Vitest (`8a3c73d71`).
- Netlify : déploiement prêt, publié à 0 h 12 min 50 s, sur le commit poussé (`6affd6be`).
- Le permalien du déploiement rend 1.251.0 et 1119-2216 ; `index.html`, `js/changelog-data.js`, `js/grilles.js`,
  `js/export-pdf.js` et `js/planification-carte.js` servis identiques au commit (`cmp`).
- L'adresse publique est derrière la connexion Cloudflare Access : non lue, comme aux releases précédentes.
- GitHub : le run du push juge au navigateur (le job de décision dit oui) ; il n'avait pas fini à l'écriture de ce
  rapport (run `44679475461`). Le run du push précédent, celui de la 1.250.0, était rouge : non regardé ici.
- Arbres retirés, tous propres et fusionnés : `labo-codex-deux-temps`, `labo-codex-menu-demo`, `labo-codex-bulle-fixe`,
  `labo-codex-non-verrouillees`. Les branches restent.

## 5. Ce que j'ai supposé

1. **La typographie des Nouvelles.** Les mots sont ceux approuvés ; j'ai appliqué la typographie du fichier :
   apostrophe courbe, espaces insécables dans les guillemets et avant « : » et « ; ». Si le « mot pour mot »
   couvrait aussi cela, la retouche tient en quatre lignes.
2. **« Capture 25 » ne retient pas le push.** Le verdict est vert et la mesure sur `main` le dit antérieur aux lots.
   Le mandat demandait de le rejouer et de le nommer, pas de s'arrêter.
3. **Seul « capture 25 » a été rejoué six fois** : je l'ai compté comme essai des lots parce que le glisser touche
   son écran, bien que son banc ne soit pas à eux. Les 19 autres n'en sont pas.
4. **L'arbre témoin de `main`** (`../labo-codex-temoin-main`) : créé pour cette seule mesure, retiré aussitôt.
5. **La date du rapport** est celle de la mise en ligne, le 20 nov.
6. **Cowork fermé** : constaté (aucun processus de l'app Claude avant le verdict), non demandé.

## 6. Ce qui reste à décider

- **Le stock de #1298.** La version tarit la source ; les copies déjà liées chez toi le restent. « Vérifier les copies
  liées » les mesure sur le Mac et sur l'iPad ; la réparation est à te proposer ensuite, pas à faire d'office.
- **Le stock du glisser** : question laissée ouverte par le rapport du lot (#1295).
- **« Capture 25 »** : rouge franc quand il est seul. À corriger, ou à inscrire aux échecs connus de la baseline (#1296).
- **Non vérifié** : Safari à la main et l'iPad ; pas de relecture croisée de cette session ; le run GitHub du push.
