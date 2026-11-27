# Rapport : Conception, deux fiches décidées par Grégoire (27 novembre 2026)

Session Claude Code dans le nuage. Branche `lot/conception-2026-11-27`, partie de `lot/file-sans-gregoire-2026-11-27` à `951de3f8`. **Aucune fusion, aucun bump, rien au changelog.** Aucun texte lu par l'utilisateur ou l'élève n'a changé.

- `6b8fc792` : **#1090**, une grille partagée emporte son échelle.
- `805e1d12` : **#1097**, une grille collée en plusieurs tableaux se lit en entier.
- Reste : le verdict au navigateur (Mac ou GitHub) avant toute fusion et ce qui est listé sous « Pas vérifié ».

## Fiche 1 : une grille partagée emporte son échelle (#1090)

### Ce que la mesure a montré avant d'écrire

**Ce que voit aujourd'hui la destinataire, une fois la grille copiée dans ses documents** (code lu, pas vu à l'écran : le conteneur n'a pas de navigateur). Ses descripteurs désignent l'échelle de l'émettrice, absente du trimestre (`rendreDescripteursNiveaux`, `js/grilles.js` ~5306, qui ne lit que `cle('echellesTemplates')`).
- Si elle a au moins une échelle, elle voit le menu « Niveaux de l'échelle », placé sur « Échelle introuvable » et aucune case de niveau. Les textes passent sous « Textes gardés d'une autre échelle », avec « L'échelle de ces textes n'est plus dans ce trimestre. Choisis-en une… ». Choisir une échelle est un geste qui écrit `descripteurs.echelleId`. Les textes dont le code existe dans cette échelle reprennent alors leur place.
- Si elle n'a aucune échelle, elle voit « Aucune échelle dans ce trimestre : crée-en une… » et les textes restent gardés.
- Pour un critère en points qui porte des textes liés à une échelle, ces textes s'affichent sous leur code, sans le nom du niveau.

**Le PDF des consignes ne lit pas `descripteurs.echelleId`.** C'est un fait, lu dans `pageAutoevaluation` (`js/export-pdf.js` ~1807). La page d'autoévaluation lit `parNiveau` aux codes des deux repères de l'échelle **de la production**, ou de celle choisie dans la fenêtre (~1643-1648). Chez la destinataire, avant comme après ce lot, cela donne trois cas :
- son échelle a des repères dont les codes sont des clés de `parNiveau` (par exemple D et M des deux côtés) : la page s'imprime ;
- les codes ne correspondent pas : la page manque ;
- son échelle n'a pas ses deux repères : l'aperçu le dit (`autoevaluationSansReperes`).

⮕ Inférence : le lot change le PDF seulement si elle choisit, pour la production, l'échelle reçue, désormais présente dans son trimestre.

**Les chemins qui portent une grille.** Aucun n'emportait l'échelle des descripteurs. Mesure d'un sous-agent, en lecture seule, avec fichier:ligne. J'ai vérifié moi-même l'ordre de l'import complet.

| Chemin | Porte la grille | Porte l'échelle | Suit un renommage dans `descripteurs` |
|---|---|---|---|
| Partage entre collègues (`.lcz`) | oui | **non → oui (ce lot)** | oui à l'import (`rebrancherReferences`), mais sans objet avant ce lot |
| « Garder dans ma bibliothèque », puis « ← Utiliser dans ce trimestre » | oui (`bibliothequeGrilles`) | non (`ajouterGrilleIndividuelle`, `js/grilles.js` ~2637, ne lit aucune échelle) | sans objet |
| Import complet | oui | oui, les échelles du trimestre sauf la démo et les importées | **non** ; ordre : échelles puis grilles (~3113, ~3137) |
| Import sélectif | oui | seulement si elle est cochée | non (#1096) |
| Réouverture d'archive | oui | oui, proposée une à une | non ; renommage seulement en « copie en double » |
| Codex | oui (clé par clé) | oui, avec son trimestre | aucun renommage, sauf doublon interne |
| Copie depuis un autre trimestre | oui (`dupliquerGrillePartagee`) | non | non |

Ce lot ne touche que la première ligne, la seule que vise la décision. Les lignes 3 à 5 relèvent de #1096 : je l'ai complétée au BACKLOG, sans numéro neuf. Le commentaire de `rebrancherReferences` y est faux pour l'import complet (il dit « les grilles AVANT les échelles »). Aucun symptôme vécu : rien de corrigé.

### Ce qui est fait

- **À l'export** (`js/partage-format.js`), `rassemblerDependances` ajoute l'échelle que nomment les descripteurs, une fois par échelle, avec la référence grille → échelle. Cela vaut pour une grille, pour la grille d'une production et pour celle d'une cartouche. Tous les critères comptent, y compris un critère en points qui porte des textes liés à une échelle : c'est ce que l'import rebranche.
- **Une garde** (`echellePeutVoyager`) laisse l'échelle chez l'émettrice et la grille part comme avant, dans deux cas :
  - une échelle de démonstration, par la même règle que l'export d'un item seul ;
  - une échelle qui, seule, ne passerait pas la validation d'import (par exemple onze niveaux : l'éditeur ne les borne pas et le schéma en accepte dix).
  
  Motif : l'auto-contrôle de l'export refuse le paquet ENTIER. Sans cette garde, une grille qui se partageait la veille ne se partagerait plus. La validation est appelée telle quelle, aucune règle n'est recopiée.
- **À l'import**, rien ne change : `prefixerEntites` range l'échelle dans `partage_echelles` et rebranche déjà la grille (#627).
- **À la copie, « Dupliquer vers mes documents »** (`js/partage-section.js`, `rapporterEchellesDeGrille`) :
  1. l'échelle est cherchée dans le trimestre actif, là où l'écran la lit ;
  2. si une échelle locale a la même identité (`memeIdentite`, `js/identite-item.js`), elle est réemployée et rien n'est écrit ;
  3. sinon, l'échelle est copiée comme par « Dupliquer » sur une échelle partagée ;
  4. la copie de la grille la désigne alors par la règle commune `rebrancherReferences`.
- **La copie depuis un autre trimestre** passe par la même fonction. Elle ne change pas : l'option n'est donnée que par les trois appels du partage.

### Ce qui arrive quand la destinataire a déjà l'échelle

- Elle a la même lignée (son id, ou un `idOriginal` ou un `inspireDe` qui y mène) : l'échelle est réemployée et aucun doublon n'est créé. Si elle reçoit et copie deux fois la même grille, elle n'a qu'une échelle.
- **Supposé** : une échelle de même nom mais d'une autre lignée n'est pas réemployée et la copie s'ajoute à côté. C'est la règle #450 (deux échelles homonymes peuvent être toutes deux en usage) et la consigne demandait la règle d'identité. Si tu veux qu'un même nom aux mêmes codes suffise (la règle #952 des cartouches), c'est une ligne à changer.

### Une grille à barème

Elle n'a pas de descripteurs, donc aucune échelle ne part. Son paquet est le même qu'avant (essai E.c).

### Le format d'échange

- **Version** : inchangée, `labo-codex-partage-v1`. Aucun champ neuf : l'échelle voyage déjà dans le paquet d'une pratique depuis #1075 (22 oct.) et la validation accepte une référence entre deux types quelconques présents dans le paquet.
- **Un ancien fichier, sans échelle**, s'ouvre comme avant (essai A.a) : validé, copié, l'id de l'émettrice gardé, aucune échelle écrite.
- **Un fichier neuf lu par la version en ligne (1.259.0)** passe. Mesure : `js/partage-schemas.js`, `js/partage-validation.js`, `js/partage-import.js` et `js/import-export.js` sont identiques entre `main` et ma base (`git diff` vide). Le paquet émis passe la validation de cette même version (essai E.b).
- **Un fichier neuf lu par une version plus ancienne** (inférence, aucune vieille version éprouvée) :
  - avant le 25 sept., l'échelle porte des champs que cette version ne connaît pas (repères, description). Le paquet est alors refusé avec le message « version plus récente » de #583, là où la grille seule serait passée ;
  - entre le 25 sept. et le 16 oct., le paquet passe, mais les descripteurs ne sont pas rebranchés : c'est sans dommage.
- **Ce que la personne voit de neuf, avec les mots d'avant** :
  - la prévisualisation de l'import compte « 1 échelle » ;
  - l'échelle paraît dans « Partagés par des collègues » des échelles ;
  - à l'export, « Le package embarque aussi N ressource(s) liée(s) (grille et cartouches associées) » compte l'échelle sans la nommer. **À Grégoire, si tu veux que la phrase la nomme** : je n'ai pas touché au texte.

### Source et stock

Source seulement. Les grilles déjà reçues et copiées gardent leur id d'échelle de l'émettrice et rien n'est réécrit. Les recevoir de nouveau, depuis un fichier émis après ce lot, crée une copie neuve qui porte son échelle, comme avant pour la grille.

Trouvaille sans suite (niveau 3) : supprimer une grille de « Partagés » n'emporte pas l'échelle venue avec elle, car la cascade ne couvre que les cartouches et les productions. Elle reste supprimable seule, ou avec le paquet par « Retirer ». Rien d'inscrit.

## Fiche 2 : une grille collée en plusieurs tableaux (#1097)

### Ce que la mesure a montré

- `lireHtml` vit dans `js/materiel-lecture.js`, pas dans `js/materiel-dissection-lecture.js`, qui est son seul appelant (`docDepuisPressePapiers`). J'ai touché les deux.
- **Avant**, le texte des tableaux 2 et suivants passait après tout le reste, hors tableau. Quand les cases portent des paragraphes (Word), chaque paragraphe devenait une rangée pleine largeur. Quand elles n'en portent pas, tout un tableau devenait une seule rangée. Le texte venait dans le bon ordre, mais sans ses colonnes. Sur la grille fictive de l'essai, les niveaux étaient lus « Excellent, Excellent, Faible » (M.a rouge sur le code d'avant).
- `parcours-evaluer.js` appelle aussi `docDepuisPressePapiers`, avec du texte seulement : il n'est pas concerné et je n'y ai pas touché.

### Ce qui est fait

- Tous les tableaux de premier rang sont lus à la suite, dans l'ordre du collage (`lireTableaux`) et leurs rangées se suivent.
- **Le texte entre deux tableaux** (un titre de partie, une consigne) devient une rangée pleine largeur, à sa place (`entre`, posé par `docDuTableau`). Il s'étiquette comme le reste : « Section » sur un titre de partie ouvre la partie (essai M.b).
- La légende d'un tableau passe en tête du texte qui le précède, comme celle d'un tableau seul passe en tête de ce qui est avant lui.
- Une case fusionnée au bas d'un tableau ne déborde pas sur le suivant : `rowSpan` est borné à son tableau.
- Un tableau pris dans la case d'un autre reste le texte de cette case, comme avant.
- **Un collage d'un seul tableau suit le chemin d'avant, inchangé.** Les essais U.a et U.b sont relevés sur le code d'avant et passent sur les deux.

### Supposé et ce que ça laisse

- « Chacun pouvant ouvrir une partie » : rien n'est étiqueté d'office et c'est l'enseignant·e qui pose « Section ». Aucun mot nouveau.
- Les niveaux restent nommés par colonne pour tout le document (`lireNiveaux`, inchangé) : le premier « Niveau » posé dans une colonne la nomme. Un deuxième tableau aux mêmes colonnes reprend ces niveaux. Un tableau dont les colonnes portent d'autres niveaux verrait ceux-ci ignorés, mais une grille créée n'a de toute façon qu'une échelle. Aucun symptôme vécu : rien d'inscrit.
- Comportement nouveau voulu : un premier tableau d'une seule rangée (un titre en encadré) suivi de la grille faisait tomber tout le collage en texte brut. Il est désormais lu avec les autres.
- Les dissections enregistrées ne sont pas relues : le brouillon garde le document déjà lu (`lireBrouillon`).

## Vérifié et pas vérifié

**Vérifié (conteneur, Vitest depuis `tests/`)**
- `tests/unit/partage-grille-echelle-1090.test.js` : 14 essais, avec l'émettrice et la destinataire dans deux espaces distincts. 7 sont rouges sur le code d'avant ; les 7 autres tiennent le « comme avant ». Break-tests :
  - garde de voyage retirée → E.d, E.e ;
  - identité retirée → D.a, D.b ;
  - option du partage ignorée → T.a ;
  - rebranchement de la copie retiré → V.a, V.b, D.a, D.b ;
  - échelle source absente non gardée → A.a.
- `tests/unit/materiel-plusieurs-tableaux-1097.test.js` : 7 essais. M.a à M.d sont rouges sur le code d'avant ; U.a et U.b sont relevés sur lui. Break-tests :
  - borne des fusions retirée → M.d ;
  - `entre` ignoré → M.b, M.c ;
  - tableaux imbriqués comptés → M.e ;
  - un seul tableau par le nouveau chemin → U.a, M.e.
- Suite Vitest complète, premier passage : 966 fichiers, 1 rouge, `bareme-1-editeur.test.js` I.b. Cette sentinelle liste les modules qui lisent `descripteurs`. `partage-format.js` y entre désormais : il lit `descripteurs.echelleId` pour emporter l'échelle, comme `import-export.js` pour la rebrancher, et ne calcule ni note ni bilan. Ajouté à sa liste avec ce motif, replié dans le commit de #1090. Second passage (27 nov., conteneur) : 966 fichiers, 12 500 essais, tous verts.
- Jetons anti-cache des quatre fichiers touchés : `20261126d`, le jour du build en ligne (`version.json` : `1126-0653`).

**Pas vérifié : aucun navigateur dans le conteneur**
- Une grille reçue puis copiée, dans Conception › Grilles, en WebKit : la section « Ce qui est attendu à chaque niveau » doit montrer les cases de niveau de l'échelle copiée. Playwright peut le dire.
- La prévisualisation de l'import, avec l'échelle comptée.
- Un vrai collage de Word et de Pages en plusieurs tableaux, sur le Mac et sur l'iPad. Le HTML réel du presse-papiers peut envelopper les tableaux autrement que l'essai (jsdom n'est pas WebKit). C'est le seul point qui demande une personne.
- Le PDF des consignes d'une production qui utilise l'échelle reçue.

## Numéros

Aucun de #1330 à #1334 n'a servi. #1090 et #1097 sont cochés avec leur preuve ; #1096 est complétée de la mesure de l'import complet.
