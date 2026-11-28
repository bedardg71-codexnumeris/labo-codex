# Rapport : des mémos dans le canevas de la carte d'alignement (28 novembre 2026)

Branche `claude/memos-canevas-r21btn`, partie de `main` à `574bb60` (la 1.260.0). PR [#68](https://github.com/bedardg71-codexnumeris/labo-codex/pull/68), en brouillon ; aperçu : `https://deploy-preview-68--codexnumeris-051225.netlify.app`. **Aucune fusion vers `main`, aucun bump, rien au changelog.** `js/config.js`, `js/navigation.js`, `noms_stables.json` et `js/pack-demo-10.js` ne sont pas touchés ; rien de ce que touchent les renommages non plus.

**Fait** : les six gestes, sur la branche et joués sur l'aperçu (section 5). Suite Vitest complète verte (986 fichiers) ; `planif-memos-canevas.spec.js` vert sous Chromium (15 essais).

**Reste** : tes trois gestes sur l'iPad pour la palette (section 9) ; le verdict Playwright WebKit du Mac (ici, Chromium seulement) ; le feu vert pour le bump et la fusion.

**Source ou stock** : rien du stock existant n'est touché. Une carte enregistrée avant ce lot s'ouvre et se réenregistre à l'identique, octet pour octet (mesuré). Le seul risque de stock est à l'envers, et il est réel : **une version d'AVANT ce lot qui ouvre une carte avec mémos les efface au premier enregistrement** (section 4).

**Écart d'ouverture** : le mandat nommait `lot/memos-canevas` ; cette session du nuage ne peut pousser que sur `claude/memos-canevas-r21btn`. Même base, même contenu.

**Coordination** : `claude/coordination-2026-11-28.md` vit dans le Projet claude.ai, pas dans le dépôt (précisé par l'amendement de 10 h 25) : rien à y écrire d'ici, ce rapport suffit.

**Amendement du 28 nov., 10 h 25** (section 9) : tes six gestes sur l'iPad sont conformes ; la palette « Nœuds » reçoit une version compacte et une hauteur bornée, « Mémo » passe au pied de la palette, la corbeille dit qu'elle prend aussi un mémo. Les douze mots des mémos sont acceptés tels quels.

## 1. Ce que j'ai tranché

**La troisième collection tient.** Le mémo n'est pas un type de bloc : `etat.memos` dans le canevas, clé `memos` dans le contenu enregistré d'une carte, à côté de `noeuds` et de `liens`. Rien dans le code ne rend ce choix intenable, au contraire : les huit lecteurs des blocs hors du canevas lisent tous `.noeuds` et rien d'autre (section 3), ils ne voient donc pas les mémos sans qu'on ait à les en exclure.

**Un module à part**, `js/planification-memos.js` (≈ 400 lignes) : la collection, ses fonctions pures (`normaliser`, `cloner`, `poserMemos`, `sansMemos`) et son rendu. Le canevas lui prête ce qu'il possède (l'annulation, l'enregistrement, la corbeille) par `brancher()`. `planification-carte.js` ne gagne qu'une cinquantaine de lignes.

**Texte brut par construction.** Le texte vit dans un `<textarea>` et se pose par `.value`. Aucun `innerHTML` ne reçoit ce qui est écrit ou collé ; une sentinelle l'interdit dans le module. Coller un texte mis en forme ne dépose que son texte, retours à la ligne gardés : c'est le comportement natif du champ, je n'ai rien eu à filtrer. La règle 1 est tenue sans `echapperHtml()`, faute de HTML à échapper.

**Une carte sans mémo ne porte pas la clé `memos`.** C'est ce qui évite toute migration.

**Le défaut est le côté sûr.** `exporterCartePourBibliotheque()` rend une copie SANS mémos ; seul « Garder dans ma bibliothèque » passe `{ avecMemos: true }`. Un appelant qui oublierait l'option perd des mémos (visible), il n'en fait pas fuir (invisible).

**Autres décisions techniques**, toutes révisables :
- Pas de compteur enregistré : l'id d'un mémo neuf est le plus haut vivant plus un (`planif-memo_N`).
- Taille par défaut 240 × 180 ; bornes 160 × 110 à 900 × 1200 ; texte borné à 50 000 caractères (au-delà, la fin est coupée et un message le dit).
- Un mémo neuf se pose au centre de ce qu'on voit du canevas, décalé de 28 px si un autre occupe déjà ce coin.
- Écrire : UN pas d'annulation par séance de saisie (du premier caractère à la sortie du champ). ⌘Z DANS le champ reste l'annulation native, lettre à lettre.
- L'enregistrement d'une frappe attend 500 ms de silence ; il part tout de suite à la sortie du champ et quand la page se ferme.
- L'interrupteur est le bouton « Mémos » de la barre d'outils, à côté des deux palettes, hors de leurs segments. Préférence `planifMemosVisibles` (dans `preferencesUtilisateur`, comme l'affichage des palettes). Poser un mémo quand ils sont masqués les remontre : il ne naît pas invisible.
- **La corbeille les prend**, par le même geste qu'un bloc (glisser la barre jusqu'à elle, elle vire au rouge). Le × du mémo supprime aussi. Dans les deux cas, « Annuler » le ramène, à sa place et avec son texte.
- Les mémos sont AU-DESSUS des blocs et des liens.
- La longue-vue ne montre pas les mémos (elle lit la carte). Imprimer la page ou l'enregistrer en PDF ne les sort pas non plus.
- Jetons anti-cache : le hook du dépôt exige le jour du build (27 nov.), pas celui du jour ; les cinq fichiers portent `?v=20261127m` ou `n`. Ce n'est pas un bump.

## 2. Ce que j'ai supposé

- **« L'image ou le PDF de la carte » n'existe pas comme fonction** : aucun export en image ou en PDF du canevas dans le code (`toDataURL`, `print`, `toBlob` : zéro occurrence dans les modules de planification). J'ai couvert le seul chemin réel, l'impression de la page par le navigateur.
- **La Réserve est à toi.** Elle archive la clé des cartes entière, mémos compris. Si une archive de la Réserve se remet à quelqu'un d'autre, les mémos partent avec : dis-le-moi, je les en écarterai.
- **La sauvegarde et la fusion de codex** emportent la clé des cartes entière : les mémos suivent sans code neuf. Je n'ai PAS joué une fusion de deux codex dont les cartes diffèrent (voir section 7).
- **« Tout voir » et le recentrage** se calculent sur les blocs seuls : un mémo posé loin de la carte n'entre pas dans « Tout voir ». C'est cohérent avec « ils n'en font pas partie », mais c'est toi qui le vivras.
- **Un fichier reçu n'apporte pas de mémos**, même retouché à la main pour en contenir.
- **PR en brouillon**, pour qu'elle ne soit pas fusionnée par mégarde avant ton feu vert.

## 3. Les sites de recopie, et les lecteurs vérifiés

Chaque site est joué sur le vrai code par `tests/unit/sentinelle-memos-canevas.test.js`, et **chacun a été cassé à son tour** (seize mutations) : le banc rougit à chaque fois.

| # | Site | Fichier | Mémos | Essai |
|---|---|---|---|---|
| 1 | `clonerEtatPersistant` (instantané de l'annulation) | carte | emportés | « 1 et 2 » |
| 2 | `restaurerSnapshot` (annuler, rétablir) | carte | emportés | « 1 et 2 », « 2 bis » |
| 3 | `sauvegarder` (enregistrement) | carte | emportés | « 3 » |
| 4 | `chargerCarte` (ouverture) | carte | emportés, chargés AVANT tout réenregistrement | « 4 », « chargés AVANT » |
| 4b | `viderCanvas` (changement de carte) | carte | vidés | « une carte NEUVE » |
| 5 | `dupliquerCarte` | carte | emportés | « 5 » |
| 6 | `exporterCartePourBibliotheque({ avecMemos })` puis `importerDepuisBibliotheque` (ma bibliothèque, aller et retour) | données | emportés | « 6 » |
| 7 | `importerCarteDepuisTrimestre` (reprise) | données | emportés | « 7 » |
| 8 | `exporterCarte` (fichier `.json`) | carte | **écartés** | « 8 » |
| 9 | `exporterCartePourBibliotheque()` sans option (le fichier d'« Exporter ») | données, bibliothèque | **écartés** | « 9 », « 9 bis » |
| 10 | import d'un fichier reçu, les deux chemins | bibliothèque | **écartés** | « 10 » |
| 11 | export du plan (trois niveaux, trois formats) | export | jamais lus | « 11 » |

Le mandat en nommait quatre (lignes 6062, 6617, 8856, 8889) ; il y en a sept qui recopient et quatre qui doivent écarter. Deux pièges trouvés en chemin : `chargerCarte` peut réenregistrer la carte pendant qu'il la charge (migration des liens), d'où le chargement des mémos en premier ; et il sort tôt sur une carte neuve, d'où le vidage dans `viderCanvas`, sans quoi les mémos de la carte quittée seraient passés dans la neuve.

**Lecteurs hors du canevas, vérifiés un par un** (une sentinelle interdit à chacun le mot `memos`) : `planification-export.js`, `parcours-cours.js`, `reserve.js`, `donnees-v2.js`, `trimestres.js`, `demo-namespace.js`, `main.js` (deux lectures de la clé au démarrage), `parcours-evaluer.js`. `planification-bibliotheque.js` et `planification-donnees.js` sont des passeurs, pas des lecteurs : ils sont au tableau. `trimestres.js` et `reserve.js` ne font que nommer la clé dans leurs listes ; `main.js` la réécrit entière, mémos compris.

## 4. Source ou stock

- **Stock existant** : intact. Aucune migration, aucune réécriture. Mesuré au navigateur et au banc : ouvrir puis enregistrer une carte d'avant le lot ne change pas un octet.
- **Version antérieure qui ouvre une carte avec mémos** : elle l'ouvre sans erreur et ne montre pas les mémos (son `chargerCarte` ne lit que `noeuds` et `liens`). **Au premier enregistrement, elle les efface** : son `sauvegarder()` réécrit la carte avec quatre clés seulement, et il s'exécute à presque chaque geste, changement de carte compris. *C'est une lecture du code de `main`, pas une exécution.* Cas concrets : un retour en arrière de la release après que tu aies posé des mémos ; un appareil resté sur l'ancienne version (hors ligne, cache) qui ouvre un codex enregistré depuis la nouvelle. Rien dans ce lot ne peut l'empêcher, puisque le code fautif est celui d'avant. À assumer et à savoir : si la release recule, les mémos posés entre-temps sont à risque.

## 5. Les six gestes, joués sur l'aperçu Netlify

Chromium, 1280 × 860, carte de la démo, build de l'aperçu de la PR 68. Captures dans `plans de travail/captures-2026-11-28-memos-canevas/`.

| Geste | Mesuré | Capture |
|---|---|---|
| 1. Créer | « Mémo » sous un filet, hors des familles de blocs ; un clic pose un mémo, aucun bloc créé | `1`, `2` |
| 2. Écrire | trois lignes tapées, enregistrées | `3` |
| 2. Coller un long texte | presse-papiers portant du HTML (titre rouge en 40 px, gras) ET du texte : le mémo reçoit le texte seul, identique au caractère près, 34 lignes, zéro balise | `4` |
| 3. Placer | déplacé de (288, −150), agrandi de 240 × 180 à 410 × 410 ; le texte fait 1 982 px de haut dans un mémo de 180 : il défile, le mémo ne s'étire pas | `4`, `5` |
| 4. Ne se relie à rien | 17 blocs et 12 liens inchangés ; aucun mémo parmi les blocs, ni parent ni enfant, aucun port de lien | — |
| 5. Masquer | zéro mémo visible, deux toujours enregistrés ; le bouton dit « Afficher les mémos » | `6`, `7` |
| 6. Supprimer puis annuler | « Mémo supprimé — le bouton Annuler le ramène. » ; Annuler : deux mémos, le texte collé revenu entier | `8`, `9` |
| Dupliquer la carte | « Écriture et littérature (démo) (copie) » : deux mémos dans la copie, deux dans l'original | `10`, `11` |
| Exporter le plan | onze documents rendus (10 226 caractères) : aucun des trois textes des mémos n'y paraît | `12` |
| Fichier pour un collègue | 17 blocs, pas de clé `memos` | — |
| Recharger la page | deux mémos, 17 blocs | — |

**Un défaut trouvé en jouant, corrigé** (issue 1 : mon lot) : le champ d'un mémo neuf ne prenait le focus qu'après 50 ms. Une frappe immédiate retombait sur le bouton « Mémo », où Espace et Entrée posaient d'autres mémos (cinq d'un coup, vu à l'écran). Le focus est maintenant pris dans le geste, ce que Safari exige de toute façon pour ouvrir le clavier de l'iPad. Un essai le couvre et rougit sans le correctif.

## 6. Le doigt, et tes gestes d'essai sur l'iPad

**Comment je départage les trois gestes** : par la zone où le doigt se pose, jamais par la durée ni par la direction.

| Zone | Taille au doigt | Ce que le doigt y fait |
|---|---|---|
| La barre du haut du mémo | toute la largeur × 44 px | déplace le mémo. Le canevas ne bouge pas. |
| Le × au bout de la barre | 44 × 44 | supprime |
| Le texte | tout le reste | touche : écrire. Glisse : fait défiler le texte ; arrivé au bout, le canevas n'est pas entraîné. |
| Le coin en bas à droite | 44 × 44 | agrandit ou réduit |
| Le canevas autour | — | déplace et zoome la carte, comme avant |

Sous Chromium, en contexte tactile, c'est mesuré : tailles, zones qui gardent le geste, déplacement et agrandissement en pointeur « doigt », canevas immobile pendant ce temps, geste repris par le système qui remet le mémo en place. **Ce que Chromium ne peut pas dire** tient en six gestes. Aucun ne touche tes données réelles si tu les fais dans la démo.

Ouvre l'aperçu sur l'iPad, entre dans la démo, va à la carte d'alignement.

1. Touche « Mémo », au bas de la palette « Nœuds ». **Attendu** : un mémo jaune au milieu de l'écran, et le clavier s'ouvre tout seul.
2. Tape deux lignes. **Attendu** : l'écran ne zoome pas quand le clavier s'ouvre. (S'il zoome, dis-le : c'est la taille du texte, 13 px, que Safari n'aime pas.)
3. Colle un long texte dans un deuxième mémo, puis glisse le doigt sur ce texte, vers le haut. **Attendu** : le texte défile dans le mémo ; la carte derrière ne bouge pas, même arrivé au bout.
4. Pose le doigt sur la barre du haut du mémo et glisse. **Attendu** : le mémo suit le doigt, la carte ne bouge pas. Puis glisse-le jusqu'à la corbeille qui apparaît en bas : elle vire au rouge, le mémo disparaît, et le bouton Annuler le ramène.
5. Glisse le coin en bas à droite. **Attendu** : le mémo s'agrandit sous le doigt.
6. Pince pour zoomer, deux doigts sur le canevas, puis les deux doigts sur un mémo. **Attendu** : la carte zoome dans les deux cas, les mémos avec elle.

Et un regard : le jaune du mémo par-dessus tes blocs, en mode clair et en mode sombre.

## 7. Ce que je n'ai pas pu vérifier

- **WebKit et l'iPad** : tout ce qui précède est Chromium. Le verdict Playwright du Mac reste à prendre.
- **Une fusion de deux codex** dont la même carte porte des mémos différents : non jouée. La clé des cartes se fusionne en bloc, je n'ai pas regardé ce que l'écran de fusion montre alors.
- **L'effacement par une version antérieure** (section 4) : lu, pas exécuté.
- **Le collage sur Safari** : le `<textarea>` ne garde que le texte sur tous les moteurs que je connais ; je ne l'ai mesuré que sous Chromium.

## 8. Trouvailles hors du lot

- `planif-corbeille-fixe-1070.spec.js` est **rouge sous Chromium sur `main`** (vérifié arbre propre) : le bloc glissé de la carte de démo ne se supprime pas. Chromium n'est pas le verdict, et le symptôme n'est pas vécu : **issue 2, dit ici, non inscrit au backlog** (règle du 24 août).
- `je-regarde-cours-2026-11-19.spec.js` (1180 × 820) a rougi **une fois sur quatre** avec le lot, sur une attente de valeur de champ, puis trois fois vert ; vert une fois sur une sur `main`. Je le crois instable plutôt que cassé par le lot, sans pouvoir le prouver sur si peu de passages. À surveiller au verdict du Mac.
- L'infobulle de la corbeille dit « Glisse un bloc ici pour le supprimer » ; un mémo s'y dépose aussi. C'est un mot : il est au fichier TEXTES, à toi de voir.
- `planif-barre-lot3.spec.js` comptait onze commandes dans la barre ; elle en a douze. Mis à jour : c'est mon lot.

## 9. Amendement : la palette compacte (28 nov., 10 h 25)

**Le constat de Grégoire, mesuré ici.** Sur un iPad couché, la zone du canevas fait 616 px de haut et la palette en faisait 852 : « Mémo » tombait 230 px sous le bord, coupé. Debout, elle tenait de justesse.

### Ce que j'ai trouvé dans la palette d'annotation, et ce que j'ai repris

`js/travaux-outils.js` (consigne du 2 nov. 2026, `VERSIONS_PALETTES`) : les quatre palettes d'« Annoter et évaluer » qui ont deux versions portent **un bouton dans leur en-tête**. Son infobulle dit ce qu'il fera (« Passer à la version compacte », « Passer à la version étendue »), son icône montre l'autre version, le choix est une **préférence** du navigateur, donc de l'appareil, et le défaut est l'**étendue**. La palette reçoit une classe, et le bouton revient à la forme longue par le même geste.

Repris tel quel : le bouton dans l'en-tête, les deux infobulles **lettre pour lettre**, les deux icônes, la préférence (`planifPaletteNoeudsCompacte`), l'étendue par défaut, la classe (`planif-palette-compacte`). Une sentinelle compare mes mots à ceux de `travaux-outils.js`. Non repris : la palette d'annotation régénère son contenu en changeant de version ; ici la classe suffit, les mêmes boutons se rangent autrement.

### Ce qui est fait

- **La version compacte** : les nœuds d'une famille côte à côte, sur deux colonnes. La palette passe de 175 à 268 px de large. Titres, couleurs et repli des familles : inchangés (mesuré). Les dix-huit noms sont les mêmes, dans le même ordre, entiers : à cette largeur aucun ne passe sur deux lignes, « Pratique autonome » compris ; si un nom devait un jour dépasser, il irait à la ligne, il ne serait pas coupé.
- **La garantie, dans les deux versions** : la palette a trois étages. L'en-tête (la prise du déplacement), la liste des nœuds, et « Mémo » au pied. **Seule la liste défile.** La hauteur de la palette est bornée à ce qu'on VOIT du canevas sous elle : le bas de la zone, ou le bas de la fenêtre quand la page n'est pas descendue jusqu'au bout, moins 12 px. « Mémo » ne défile pas : il est toujours là, sans rien replier ni faire défiler.
- **La borne suit** : la fenêtre, la rotation, le plein écran, le défilement de la page, le déplacement de la palette, son affichage. Et la fin d'une animation : l'en-tête de l'application se resserre quand la page défile et décale la palette de 13 px sans changer aucune taille (trouvé au banc, 4,6 px de dépassement avant correctif).
- **Au doigt, un nœud de la palette fait 44 px** dans les deux versions. Il en faisait 22 : c'est neuf, et c'est le prix de la demande. La liste étendue est donc plus haute qu'avant sur l'iPad (1 152 px) et y défile toujours.
- **La palette se déplace par sa barre comme avant**, position de départ inchangée (12, 12 ; mesuré). Descendue, elle se raccourcit au lieu de sortir de l'écran.
- **La corbeille** : « Glisse un bloc ou un mémo ici pour le supprimer », à l'infobulle et, par cohérence, dans son nom pour le lecteur d'écran.
- `TEXTES-2026-11-28-memos-canevas.md` : M13 (la corbeille), M14 et M15 (le bouton de version, mots repris, pas neufs). M1 à M12 marqués acceptés.

### Les mesures, à la taille d'un iPad

Chromium en contexte tactile, toutes les familles dépliées. « Couché » : 1180 × 740, soit 820 moins les barres de Safari (**supposé** : je n'ai pas la hauteur exacte que Safari laisse ; à 820 pleins la palette a plus de place, pas moins). « Debout » : 820 × 1106.

| | Liste entière | Liste visible | La palette dépasse ? | « Mémo » se touche ? |
|---|---|---|---|---|
| Couché, étendue | 1 152 px | 486 px, défile | non | oui |
| Couché, compacte | 776 px | 486 px, défile | non | oui |
| Debout, étendue | 1 152 px | 802 px, défile | non | oui |
| Debout, compacte | 776 px | 776 px, **tient entière** | non | oui |

**À dire sans l'arrondir** : couché, même la version compacte défile encore (il manque 290 px). Elle montre quatre familles sur six d'un coup d'œil (capture `palette-couche-compacte`). Ce qui rend « Mémo » atteignable, ce n'est pas la compacte, c'est le pied fixe. La compacte, elle, fait tenir toute la palette quand l'iPad est debout.

### Glisser un nœud, faire défiler la liste : comment je les départage

Je ne les départage pas moi-même, et je n'ai écrit aucun code de geste. Le glisser d'un nœud depuis la palette est le glisser-déposer NATIF du navigateur (`draggable`), inchangé par ce lot. C'est donc le système qui tranche, par le temps :

- le doigt **glisse tout de suite** : la liste défile ;
- le doigt **reste posé un instant, puis glisse** : le nœud se soulève et part vers le canevas ;
- le doigt **touche et relâche** : le nœud se pose à côté du dernier posé.

*Fait mesuré* (Chromium, toucher émulé) : un doigt posé SUR un nœud et remonté de 250 px fait défiler la liste, ne pose aucun nœud, ne déplace ni la palette, ni le canevas, ni la page. *Fait mesuré* (souris) : un nœud de chaque colonne, glissé, se pose là où on le lâche. *Inférence, non mesurée* : l'appui prolongé qui soulève le nœud sur l'iPad. Chromium ne rejoue pas le glisser natif au doigt : c'est ton premier geste d'essai.

### Vérifié

- Vitest : suite complète verte (986 fichiers) ; sept essais de plus dans `sentinelle-memos-canevas`.
- Playwright Chromium : `planif-palette-compacte.spec.js`, onze essais, verts deux fois de suite. Neuf mutations (borne retirée, borne sur la zone seule, liste qui ne défile pas, une colonne, cibles de 22 px, bouton qui laisse partir la palette, préférence non retenue, borne non suivie au déplacement, ancien mot de la corbeille) : le banc rougit à chacune.
- Les douze specs qui se servent de la palette ou de la corbeille (110 essais) : 109 verts ; le seul rouge est `planif-corbeille-fixe-1070`, déjà rouge sur `main` sous Chromium (section 8).
- Captures : `captures-2026-11-28-memos-canevas/`, fichiers `palette-…`.

### Tes gestes d'essai sur l'iPad

Sur l'aperçu, dans la démo, à la carte d'alignement. iPad couché d'abord.

1. Sans rien replier, regarde le bas de la palette « Nœuds ». **Attendu** : « Mémo » est visible, sous un filet. Touche-le : un mémo se pose.
2. Glisse le doigt vers le haut sur la liste des nœuds, en partant d'un nœud. **Attendu** : la liste défile jusqu'à « Clôture » ; aucun bloc ne se pose ; ni la carte ni la page ne bougent ; « Mémo » reste en place.
3. Touche le petit bouton à droite du mot « Nœuds », dans l'en-tête de la palette. **Attendu** : les nœuds passent sur deux colonnes, tous les noms entiers. Puis pose un nœud de CHAQUE colonne par un glisser : laisse le doigt posé un instant sur « Factuelle » (colonne de gauche), glisse-le sur le canevas, lâche ; refais-le avec « Conceptuelle » (colonne de droite). **Attendu** : chaque bloc se pose là où tu lâches. Si le nœud ne se soulève pas, ou si c'est la liste qui part, dis-moi lequel des deux.

Et une fois l'iPad debout, en version compacte : **attendu**, toute la palette tient, sans défiler.

### Ce que je n'ai pas pu vérifier

- Le glisser natif d'un nœud au doigt (geste 3), dans les deux versions.
- La hauteur réelle que Safari laisse sur ton iPad : la borne se calcule sur la fenêtre telle que le navigateur la donne, elle ne dépend pas de mon 740.
- WebKit, comme pour le reste du lot.

