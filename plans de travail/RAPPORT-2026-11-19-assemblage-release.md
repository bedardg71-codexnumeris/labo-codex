# Rapport — assembler la release d'avant lundi (19 nov. 2026)

**Dernier relais.** Branche `lot/assemblage-release`, partie de `origin/main` à `ade09e93` (la 1.250.0). Consigne :
`plans de travail/CONSIGNE-2026-11-19-assemblage-release.md`. Fait : les trois branches fusionnées en `--no-ff`, dans
l'ordre, aux têtes données (aucune n'avait bougé) ; les conflits réglés ; la retouche des identifiants (1, 2, 3) ; le
banc croisé, avec break-test ; Vitest complet ; les bancs Chromium ; un run WebKit sur GitHub. APERÇU seulement (PR
« APERÇU, ne pas fusionner ») : ni push de `main`, ni release, ni Nouvelles écrites. Reste, sur le Mac : l'accord de
Grégoire sur l'entrée des Nouvelles (§5), puis le verdict complet, `release.mjs` et le push de `main` (§7).

## En bref

- Les quatre lots sont dans la branche : « Dupliquer » en profondeur (#1298), le glisser d'Alignement (#1295),
  la grille d'autoévaluation dans le PDF des consignes, les noms des deux seuils.
- `PARCOURS_OUVERTS` est identique à celui de `main` (`['decouvrir']`, `js/assistance.js` intouché). Aucun commit
  propre aux branches exclues n'est entré (mesuré commit par commit) ; les deux seuls communs avec
  `lot/nous-faisons-cours` et `lot/je-regarde-cours` sont ceux du glisser, que ces branches avaient fusionnés.
- Un numéro de fiche servait deux fois : #1296. La fiche des neuf rouges d'import sous Chromium devient **#1300**.
- `dupliquerGrille` n'est atteignable depuis aucun écran (mesuré au navigateur).
- (En cours : les bancs Chromium et le run WebKit tournent ; cette ligne sera remplacée.)

## 1. Les fusions

| Ordre | Branche | Tête | Conflits |
|---|---|---|---|
| 1 | `origin/lot/dupliquer-copie-profonde` | `145a9b7c` | aucun |
| 2 | `origin/lot/glisser-alignement` | `29e30e49` | `BACKLOG.md` (« Dernier ID ») |
| 3 | `origin/lot/autoevaluation-consignes` | `9fc57473` | `BACKLOG.md` (deux), `index.html` (trois) |

Commits de fusion : `4c03801d`, `0ed55653`, `59beba07`. Aucune tête n'avait bougé depuis la consigne.

**`BACKLOG.md`.** Toutes les fiches gardées. Mesuré sur toutes les branches d'origin : #1296 pris par
`lot/glisser-alignement` (« capture 25 » de parcours-5) ET par `lot/autoevaluation-consignes` (les neuf rouges
d'import sous Chromium) ; #1297 par `lot/nous-faisons-classe` et `lot/nous-faisons-recevoir` ; #1298 par
`lot/dupliquer-copie-profonde` ; #1299 par `lot/nous-faisons-recevoir`. La fiche du glisser garde #1296 : elle a déjà
essaimé sur `lot/nous-faisons-cours` et `lot/je-regarde-cours`, qui l'ont fusionnée. Celle de l'autoévaluation devient
**#1300**, premier numéro libre sur toutes les branches ; son intertitre dit d'où elle vient. « Dernier ID utilisé :
#1300 », avec la trace. Aucun numéro de fiche ne sert deux fois parmi #1290 à #1300 (le double #716 est antérieur, il
est déjà sur `main`). Les deux rapports de l'autoévaluation qui citaient #1296 portent une parenthèse vers #1300.

**`index.html`.** Trois blocs, tous des jetons de cache, comme mesuré par Cowork :

| Fichier | Touché par | Jeton retenu | Descriptions |
|---|---|---|---|
| `styles.css` | dupliquer, autoévaluation | `20261119f` (au-dessus de `e` et `d`) | les deux gardées |
| `js/grilles.js` | dupliquer, autoévaluation | `20261119f` (au-dessus de `c` et `d`) | les deux gardées |
| `js/echelles.js` | dupliquer, autoévaluation | `20261119f` (au-dessus de `a` et `d`) | celle de #1298 (l'autre lot n'en avait pas ajouté) |
| `js/pratiques.js` | dupliquer seul | `20261119a` (le sien) | la sienne |
| `js/wizard-pratique-v2.js` | autoévaluation seule | `20261119d` (le sien) | la sienne |

Ensuite, par mes retouches : `js/grilles.js` à `20261119g`, `js/cartouches.js` à `20261119b`,
`js/cartouches-decalees.js` à `20261119a` (le hook anti-cache exige un jeton neuf même pour un commentaire).

**`js/grilles.js`, `js/echelles.js`, `styles.css`** (fusion automatique), relus hunk par hunk : les deux lots touchent
des fonctions disjointes. Dans `grilles.js`, #1298 change les trois gestes de copie (`dupliquerGrille`,
`ajouterGrilleIndividuelle`, `dupliquerGrilleDepuisSidebar`) ; l'autoévaluation, le rendu des descripteurs
(`rendreDescripteursNiveaux`, la case « Pour vérifier », les étiquettes de seuil). Le point de rencontre est la
donnée : `pourVerifier` vit dans `critere.descripteurs`, que la copie profonde de #1298 emporte. C'est ce que le banc
croisé juge (§3). Dans `echelles.js`, la copie profonde de deux gestes d'un côté, les mots des seuils de l'autre. Dans
`styles.css`, deux blocs neufs éloignés (l. 22 897 et 30 065 de la base).

## 2. La retouche des identifiants

**(1) `CartouchesDecalees` ne conclut plus sur une copie** (`js/cartouches-decalees.js`). Dans `_ligneRanger`, si
une grille trouvée (qui porte tous les critères de la cartouche) est parente par la copie de la grille de la
cartouche, la ligne est listée avec `ambigue: true`, `proposition: false` et un `pourquoi` qui nomme la parenté
(« ambiguë : « X » est une copie de « Y » ; leurs critères portent les mêmes identifiants, qui ne disent pas à
laquelle la cartouche appartient »). Rien n'est proposé, ni rangement ni rattachement, et la réparation n'écrit rien.
La parenté se lit par `inspireDe.sourceId`, dans un sens ou dans l'autre, en remontant la chaîne dans les grilles du
trimestre (`_ancetres`, `_parente`).
Tests : quatre essais dans `tests/unit/cartouche-criteres-grille-1144.test.js` (copie, sens inverse, sœurs et
`idOriginal`, témoin sans parenté qui range comme #1145). Break-test : le contrôle neutralisé, trois rouges ; le témoin
reste vert. Fichier restauré, 24 verts.

**(2) `dupliquerGrille` (`js/grilles.js`, l. 1105) : AUCUN ÉCRAN NE L'ATTEINT.** Mesuré au navigateur (Chromium,
1 180 × 820), après les quatre sous-sections de Conception (grilles, échelles, rétroactions, productions) : ses deux
boutons (`data-action="dupliquerGrille"`) ne s'écrivent que dans `#vueGrillesCriteres`, rangé sous un
`<div class="u-hide">` (« Conteneurs cachés pour compatibilité », `display: none !important`) : `checkVisibility()`
faux, boîte de 0 × 0. L'autre conteneur, `#listeGrilles`, n'existe pas dans `index.html` : `afficherGrillesCriteres`
rend la main sans rien écrire. Aucun autre appelant (`grep` sur `js/`, `index.html`). Seule la console y mène
(`window.dupliquerGrille`). Rien d'aligné ; un commentaire dans son en-tête le dit, et demande de ne pas le rebrancher
sans l'aligner sur `dupliquerGrilleDepuisSidebar`.

**(3) Le commentaire de `js/cartouches.js`** (l. 4200 de l'assemblage, dans `importerUneCartoucheTrimestre`, chemin 2)
disait qu'une grille dupliquée reçoit des identifiants neufs. Corrigé : « Dupliquer » (éditeur, barre latérale,
bibliothèque) et `copiePropre` (partage, copie d'un autre trimestre, lu dans `js/partage-section.js`) gardent les
identifiants ; ils peuvent différer quand même, par une copie ancienne de `dupliquerGrille` ou des critères refaits,
et le rattachement par id puis par nom reste utile.

## 3. Le banc croisé

`tests/integration/assemblage-dupliquer-descripteurs-seuils.spec.js`. Une grille dont le premier critère porte des
descripteurs (D et M, sur l'échelle de départ) et un « Pour vérifier » ; les deux seuils de l'échelle posés sur D et M
par `ecrireRepereEchelle`. Deux gestes (le bouton « Dupliquer » de l'éditeur, touché ; « Dupliquer » de la
bibliothèque), en paysage (1 180 × 820) et en portrait (820 × 1 180). Chaque essai :

1. duplique ; la copie garde ses descripteurs, sa question, les identifiants de ses critères ; aucun objet partagé avec
   la source, relu dans IndexedDB (`db.get`) ;
2. ouvre la copie : ses textes dans leurs cases, « Seuil minimal de réussite » sur la case D et « Seuil de maîtrise »
   sur la case M ;
3. change un descripteur ET la question dans la copie, par leurs cases ;
4. la source n'a pas bougé, dans IndexedDB comme dans le JSON du `localStorage` ;
5. recharge : toujours pas ; la copie garde ses textes et ses étiquettes ; la source rouverte montre les siens.

Quatre verts sous Chromium. **Break-test** : l'étalement remis dans `dupliquerGrilleDepuisSidebar`, les deux essais de
l'éditeur rougissent et ceux de la bibliothèque restent verts ; l'étalement remis dans
`BibliothequeUI.dupliquerVersBibliotheque`, les deux de la bibliothèque rougissent ; `etiquettesSeuilsDuNiveau`
coupée, les quatre rougissent. Fichiers restaurés après chaque mutation.

## 4. Les tests

(En cours : les bancs Chromium et le run WebKit de GitHub tournent.)

## 5. Les Nouvelles proposées (rien d'écrit dans `js/changelog-data.js`)

Une entrée pour une version mineure (la 1.251, si rien d'autre ne part avant) :

```javascript
{
    version: '1.251',
    couleur: 'vert',
    titre: 'La grille d’autoévaluation dans les consignes',
    items: [
        'Le PDF des consignes peut joindre une grille d’autoévaluation que l’élève coche avant de remettre son travail : pour chaque critère, tes descripteurs aux deux seuils de l’échelle et la question de la nouvelle case «&nbsp;Pour vérifier&nbsp;» de l’éditeur de grilles. Elle paraît quand l’échelle a ses deux seuils.',
        'Les deux seuils de tes échelles s’appellent maintenant «&nbsp;Seuil minimal de réussite&nbsp;» et «&nbsp;Seuil de maîtrise&nbsp;», et l’éditeur de grilles montre ce nom sur la case du niveau qui le porte.',
        'Dans Conception, «&nbsp;Dupliquer&nbsp;» donne maintenant à la copie ses propres critères, niveaux et commentaires : modifier la copie ne modifie plus l’original.',
        'Dans Alignement pédagogique, une activité glissée vite dans une leçon s’y range bien, à la souris comme au doigt ; elle ne reste plus à côté, ni dans une autre leçon.'
    ]
}
```

D'où viennent les lignes : la troisième et la quatrième sont celles des lots, mot pour mot (rapports
`dupliquer-copie-profonde` et `glisser-alignement`, §6). Les deux premières sont de moi. La deuxième part de celle du
lot des seuils (« Les deux repères de tes échelles portent maintenant leur nom… ») : « repères » y est remplacé par
« seuils », le mot que l'écran de l'échelle affiche désormais. La première dit la condition d'apparition parce que
l'échelle de départ que l'application sème n'a pas de seuils (rapport de l'autoévaluation) : sans cette phrase, un
enseignant qui garde l'échelle de départ chercherait la page sans la trouver.

À trancher par Grégoire : le titre (j'ai mis en avant la seule fonctionnalité neuve) ; l'annonce aux testeurs du
diagnostic « Copies liées à leur source » (Réglages › Données › Maintenance), que le lot #1298 laisse ouverte, n'est pas
dans l'entrée.

## 6. Ce que j'ai supposé

1. **La parenté, au-delà de la lettre de la retouche.** La consigne dit « une copie de celle de la cartouche
   (`inspireDe.sourceId`, dans un sens ou dans l'autre) ». J'ai compté aussi deux copies d'une même source, une copie
   de copie (la chaîne remontée dans les grilles du trimestre) et `idOriginal` (la trace d'un ajout depuis la
   bibliothèque, qui garde lui aussi les identifiants). Ce choix ne fait que retirer des propositions ; s'il est de
   trop, le retirer tient en une ligne de `_parente`.
2. **Un commentaire dans `dupliquerGrille`** plutôt que rien : la consigne disait « dis-le ». Disposition « commenter
   et oublier » : vrai, sans conséquence observable aujourd'hui, mais la fonction régénère les identifiants à
   l'inverse de la règle du 19 nov., et un rebranchement la réveillerait.
3. **#1300** pour la fiche des neuf rouges d'import, et non #1296 : celle du glisser est déjà fusionnée ailleurs.
4. **Les jetons de cache** : un jeton neuf (`f`) pour les trois fichiers touchés par deux lots ; pour ceux qu'un seul
   lot touche, le jeton de ce lot, déjà plus récent que celui de `main`.
5. **Les bancs Chromium** : un fichier qui fixe lui-même sa fenêtre tourne une fois (il choisit ses fenêtres) ; les
   autres tournent en paysage (1 180 × 820) ET en portrait (820 × 1 180), par une configuration temporaire non suivie.

## 7. Ce que la session du Mac doit savoir avant le verdict

(En cours.)
