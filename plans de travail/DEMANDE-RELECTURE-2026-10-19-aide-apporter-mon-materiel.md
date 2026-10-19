# Demande de relecture – l'aide et l'accompagnement d'« Apporter mon matériel »

> Claude Code, lundi 19 octobre 2026, soir (Toronto). Consigne : `CONSIGNE-LOT-2026-10-19-aide-apporter-mon-materiel.md` (19 h 02) ; textes : `TEXTES-2026-10-19-aide-apporter-mon-materiel.md`, avec C10, D5 et L2 dans leur version corrigée (Grégoire a relayé la consigne, donc il les accepte). Pour Cowork (`PROTOCOLE.md`, règle 2).
> Un commit sur `main`, **non poussé**. Il porte aussi la consigne du jour, son archive, le plan, les textes et `VERDICT-RELECTURE-2026-10-19-retrait-ancien-assistant.md`. **Pas de verdict complet, pas de version, pas de push.**

## Ce qui a été posé, et où

| Pièce | Fichier | Textes |
|---|---|---|
| Bulle du menu, réécrite | `js/accompagnement-contenu-hover.js` (`nav-conception-materiel`) | A1 |
| Aide « i », une clé `conception-materiel`, deux boutons | `js/accompagnement-contenu-popup.js` ; dans `index.html`, à côté du titre de l'accueil ET de celui de l'écran d'étiquetage | B1 à B5 |
| Onze bulles, clés `materiel-*` | le catalogue des bulles. Six posées dans `index.html` (C1 à C4, C7, C8) et cinq par `js/materiel-dissection.js` (C5, C6, C9 à C11) | C1 à C11 |
| Section de l'Aide, dans Configuration, après « Créer une grille de critères » | `index.html`, `#accordeon-aide-apporter-grille` | D1 à D10 |
| Six termes au lexique | `js/accompagnement-contenu-terme.js` | D4 |
| Étape « Conception » de la visite (#1092 coché) | `js/accompagnement.js` (`ETAPES_TOUR`) | E1 |
| Phrase de la logique « les deux » | `js/materiel-dissection.js` | L2 |

Aucun mécanisme neuf. Les bulles passent par le déclencheur délégué de `accompagnement.js` (`closest('[data-tooltip]')` sur `document`) : il suffit que le bouton né en JavaScript porte l'attribut. Pour les deux outils de la palette, une table `BULLES_OUTILS` (couper, rattacher) dans `rendrePalette` sert d'emplacement. C'est mon choix technique. Les étiquettes de la palette ne reçoivent aucune bulle : elles ont déjà leur phrase.

## Mes choix, nommés

1. **« Niveau »** : la clé `niveau-de-performance` et le libellé « Niveau (de performance) », sur le modèle de « Maquette (de pratique) ». Ils ne se confondent pas avec `niveau-rai` / « Niveau RàI ». Dans la section de l'Aide, D4 garde « Niveau », tel que validé.
2. **Lexique** : les définitions sont celles de D4, mot pour mot, sauf la première lettre, mise en majuscule comme les 51 autres termes. Une fiche qui commencerait par « ce qui est attendu » aurait l'air d'une coquille. Le banc compare les deux copies, la première lettre mise à part. J'ai mis « voir : Conception > Grilles » partout, sauf pour le niveau : « Conception > Échelles ». Ces libellés existent déjà au lexique.
3. **Placement des bulles du formulaire** : C9 sur le bloc libellé + champ, C10 sur le `fieldset` du choix, C11 sur le bouton.
4. **Visite** : seule la correspondance change. `TOUR_NAV` mène toujours à Productions quand on clique « Suivant : Conception ». La consigne ne demandait pas de changer la destination.

## Écarts et suppositions

- **B5, les libellés « Voir aussi »** (écart, à arbitrer) : les boutons affichent le **titre** de l'aide qu'ils ouvrent. On lit donc « Grilles de critères · Configurer les échelles de performance · Type de critère d'évaluation », et non « … Échelles de performance · Les trois façons d'évaluer un critère ». Les clés sont celles de B5. Pour avoir les libellés validés, il faudrait renommer deux titres existants, qui s'affichent aussi en tête de leur propre aide. Je ne l'ai pas fait.
- **Le lexique souligne plus loin que l'onglet** (conséquence mesurée, assumée). L'enrichissement de `rendreContenuAide` souligne la première occurrence de chaque terme du lexique dans une aide « i ». Mesure : sur 64 aides « i », **19** gagnent un mot qui ouvre le lexique. Par terme : « critère » 16, « pondération » 4, « points » 4, « descripteur » 1. La correspondance se fait sans frontière de mot, comme pour « Production » aujourd'hui : dans « critères », c'est « critère » qui est souligné.
- **C11 sur un bouton désactivé** (supposition, non vérifiée) : WebKit ne transmet pas les événements de souris à un bouton `disabled`. La bulle de « Créer ma grille » ne paraîtrait donc que quand le bouton est actif.
- **iPad, appui long sur « Couper » et « Rattacher »** (supposition) : c'est le même déclencheur que pour toutes les bulles de l'application. Je n'ai pas vérifié si l'appui long met aussi l'outil en main en se relevant. Une machine ne peut pas le trancher ici : WebKit de bureau ne fait pas d'appui long.

## Preuves

- **Vitest complet** (depuis `tests/`) : 784 fichiers, **9 207 sur 9 207 verts**.
- **Banc neuf**, `tests/unit/sentinelle-aide-apporter-mon-materiel.test.js` (11 tests, le vrai `accompagnement.js` et les trois vrais catalogues dans jsdom). Il vérifie que chaque `data-tooltip`/`data-aide` de l'onglet (6 + 2) et que chaque clé posée en JS (5) a son entrée, que les trois « Voir aussi » existent, que les six termes sont là et égaux à D4, qu'une seule étape correspond à `conception-materiel`, et qu'aucun texte neuf ne dit « dissection » (sur plus de 3 000 caractères, commentaires HTML exclus).
- **Break-tests, faits, rouges puis restaurés** : `materiel-terminer` retiré du catalogue (2 tests rouges) ; `conception-materiel` retiré de l'étape, et « Le poids **du** critère » au lexique (2 rouges) ; la ligne `BULLES_OUTILS[t.k]` retirée (la spec WebKit rougit sur « Couper »).
- **Les textes contre `TEXTES-…`** : un script compare les 37 textes. Tous y sont mot pour mot, sauf B5 (voir plus haut) et L2, construit par concaténation autour de ‹N› et vérifié par le banc.
- **WebKit** : 29 sur 29 verts. Ce sont les 16 specs `materiel-*`, dont la neuve, `materiel-aide-accompagnement.spec.js` : l'aide « i » aux deux écrans, les bulles qui s'affichent avec leur texte, y compris celles de la palette, et la section trouvée par la recherche de l'Aide. S'y ajoutent `icones-i-catalogue-c3`, `lot-f-placement-mots` et `tableau-bord-906`. La spec 2b gagne les bulles C9 à C11. Ce n'est **pas** un verdict complet.
- Captures WebKit à 820 px : les deux « i » se placent comme ceux des titres voisins.

## Ce que je demande de regarder

1. B5 : garder les titres existants, ou renommer ? Si on renomme, la question monte à Grégoire, car c'est un texte d'écran.
2. Les 19 aides qui gagnent un mot souligné : est-ce acceptable tel quel ?
3. `index.html` : la carte de l'Aide, recopiée à la main depuis D1 à D10. Le script l'a comparée ligne par ligne, mais un œil sur la mise en forme (deux listes, aucun intertitre ajouté) vaut d'être posé.

## Trouvailles (les trois issues)

- **Commenter et oublier** : l'en-tête de `accompagnement-contenu-terme.js` annonce « 48 termes validés ». Il y en avait 51, il y en a 57. C'est sans conséquence observable, et je n'y ai pas touché.
