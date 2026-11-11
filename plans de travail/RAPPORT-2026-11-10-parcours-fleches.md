# Rapport : « Les flèches des parcours »

10 nov. 2026. Session du cloud (Claude Code), **Chromium seulement**. Branche `lot/parcours-fleches`, partie de
`origin/main` à `77679dd` (1.241.0), poussée, non fusionnée. Consigne :
`plans de travail/CONSIGNE-LOT-2026-11-09-parcours-fleches.md`, avec les trois ajouts de Cowork du 10 nov., 11 h 30.

**Dernier relais : 11 nov., nuit, Mac, WebKit** — relance des rouges de `lot/parcours-fleches-apercu` après la
fusion de la 1.242.1 (`91968b201`). Section « Relance WebKit de nuit » juste dessous. **Arrêtée** : le système a
coupé la reprise des deux derniers rouges (mémoire basse). Deux rouges du lot corrigés (`ee0dace27`) ; deux autres
sans explication (`parcours-8` l. 557, `parcours-fleches` l. 321). **Branche non poussée.**

---

## Relance WebKit de nuit (11 nov. 2026)

Mac seul, aucune autre application. **Pression mémoire avant de lancer** (`memory_pressure`) : *System-wide memory
free percentage: 78 %*. Toutes les courses : `--project=webkit --workers=1 --reporter=list
--trace=retain-on-failure`, sous `caffeinate -i`, sortie copiée par `tee`.

### Les trois rouges de la course coupée, rejoués seuls (sur `91968b201`, après fusion)

| Essai | Course coupée (10 nov., 23 h) | Seul, cette nuit |
|---|---|---|
| `parcours-fleches`, l. 134, « étapes 3, 6 et 7 de « Découvrir »… (1180 px) » | rouge : `étape 3 : nombre de flèches` — attendu 2, reçu 1 (`expect.poll`, 5 000 ms) | **rouge**, retry compris, même message |
| `parcours-fleches`, l. 225, « la poignée : 46 px… l'étape suivante replace la bulle » | rouge : `étape 3, avant de déplacer la bulle : nombre de flèches` — attendu 2, reçu 1 | **rouge**, retry compris, même message (l. 300) |
| `parcours-6`, l. 465, « 1440 px, copies-manquantes : la bulle 3… ni « Annuler » » | rouge : `page.goto: Test timeout of 30000ms exceeded` (navigation vers `index.html`, jamais `load`) | **vert** (les deux chemins de la l. 465) |

### Les deux rouges de `parcours-fleches` : c'est le lot, pas la fusion

Rejoués dans un worktree détaché sur `902d01774` (la branche avant la fusion de la 1.242.1) : **rouges aussi**,
retry compris, mêmes messages (`étape 3 : nombre de flèches`, attendu 2, reçu 1). Rouges des deux côtés.

**Cause, mesurée** (essai de diagnostic temporaire, retiré) : à 1180 px sous WebKit, les cartes Assiduité
(50 → 397) et Complétion (417 → 764) sont bien là, séparées de 20 px. La bulle (380 px) n'a pas la place à
`ECART_FLECHE` (32 px) à droite de leur union : 764 + 32 + 380 = 1 176 > 1 180 − 8. `placePresDe` se rabat sur
`ECART` (12 px) ; le tracé direct vers Complétion fait alors 6 px, sous `FLECHE_MIN` (24), et `tracerFleche`
rendait `null` sans essayer d'autre bord. Sous Chromium, la barre de défilement (15 px) rétrécit les cartes et
la place à 32 px y est : d'où le vert de la session du cloud. **WebKit a des barres superposées, comme l'iPad à
1 180 px en paysage : Grégoire aurait vu une seule flèche à l'étape 3.**

**Correctif (le lot, sur la branche)** : quand le tracé direct est trop court pour se lire, `tracerFleche` essaie
les autres bords de la cible, comme il le faisait déjà devant un obstacle ; aucun bord assez loin : `null`. Une
cible dont le centre est sous la bulle reste sans flèche (garde explicite, elle ne dépend plus du seuil). Aucune
flèche sous 24 px n'est tracée. À 1 180 px, la flèche de Complétion fait ~28 px et arrive par le haut de la carte,
près de son coin droit. Jeton du moteur : `20261111a`.

**Supposition nommée** : la consigne dit « une flèche vers chaque zone » ; la sentinelle « collée à la bulle »
disait « pas de flèche » pour une cible à 12 px. J'ai suivi la consigne, et récrit la sentinelle sur son intention
(« jamais de flèche illisible, moins de 24 px ») : une cible plus large que la bulle, collée dessous, reste sans
flèche ; une cible de la largeur de la bulle reçoit une flèche par le côté ; le cas de l'iPad à 1 180 px est
ajouté. **L'apparence de cette flèche courte qui passe le coin se juge sur capture (Cowork).** Break-tests :
rétablir `if (!direct) return null` → rouge ; retirer le seuil de 24 px dans `courbe` → rouge. Les deux essais
WebKit : verts (`5-fleches-apres-correctif.log`).

### `parcours-6`, bulle 3 à 1440 px

Vert seul, puis **18 verts sur 18** (`--repeat-each=6 --retries=0` : trois chemins × six). Le rouge de la course
coupée était un `page.goto` jamais chargé en 30 s : un délai, pas une assertion. Rien contre l'essai.

### Les 179, sur `ee0dace27` (après le correctif)

Les 19 specs de la course coupée du 10 nov. (liste reconstituée depuis son journal : 179 essais, compte vérifié par
`--list`). **14,3 min, 157 verts, 1 rouge, 1 instable, 20 sautés** (captures). Mémoire libre relevée chaque minute :
76 % au départ, puis 75, 65, 59, 50, 43, 44, 41, 34, 31, 32, 36, 32, 32, 32 % — **la course WebKit seule fait
descendre la mémoire libre de 76 à 31 %**, sans autre application ouverte.

| Essai | Message | Seul, ensuite |
|---|---|---|
| `parcours-8`, l. 557, « 1180 × 820 : aucun avis ne couvre la bulle… » | **rouge**. 1er essai : `aucun avis n'a couvert la bulle` — reçu « Tes productions : Grille enregistrée : ses critères totali… » (l. 181, `afterEach`). Retry : autre échec, `toContainText("Code 1")`, chaîne vide, 5 000 ms (l. 494, `finirLeCheminAvecFichier`) | vert, vert ; puis rouge en 2,4 min et 6,0 min |
| `parcours-fleches`, l. 321, « la poignée au clavier… » | **instable** : `[32, 16]` attendu, `[32, 15]` reçu (l. 339) ; vert au retry | vert, vert ; puis rouge en 2,5 min et 1,8 min |

**Coupé par le système** (mémoire basse) pendant la reprise `--repeat-each=6 --retries=0` de ces deux essais, à
l'essai 8 sur 12. Conformément au mandat : arrêt, pas de relance. Les essais 5 à 8 durent des minutes au lieu de
2 à 15 s : ils ont tourné sous pression mémoire et **ne prouvent rien contre les essais**. Les messages des rouges 5
à 8 ne sont pas au journal (course tuée avant le résumé).

**Ce qui n'est PAS établi** : ni l'un ni l'autre de ces deux rouges n'a d'explication. Pistes, non mesurées :
`parcours-8` — un avis « Grille enregistrée » qui passe sur la bulle à « Tes productions » (lot ou `main` ? à
rejouer sur `902d01774` et sur `origin/main`, `parcours-8` n'est pas un fichier du lot) ; `parcours-fleches` l. 321
— 1 px de moins en vertical : soit la bulle bornée par le bas de l'écran utile, soit `b0` mesuré avant que la sonde
ait fini de placer la bulle (le banc lui-même).

**Non poussé** : le mandat dit de pousser quand chaque rouge a une explication ; deux n'en ont pas.
Journaux (dossier temporaire de la session `22c598c4`, effacé au redémarrage) : `1-trois-rouges-apres-fusion.log`,
`2-fleches-avant-fusion-902d01774.log`, `3-parcours-6-l465-x6.log`, `4-diag-webkit.log`,
`5-fleches-apres-correctif.log`, `6-les-179.log`, `6-memoire-pendant.log`, `7-deux-seuls-x6.log`.


## En tête : ce qu'il faut savoir avant de lire le reste

1. **Rien n'a été vu sous WebKit ni sur iPad.** Tout ce qui suit est mesuré sous Chromium. Le défaut vécu par
   Grégoire est sur iPad : ce lot ne peut pas dire qu'il est corrigé, seulement que la couche soupçonnée est retirée.
2. **Deux étapes de « Découvrir » ont changé de `zones`** (6 et 7), contre la lettre de la consigne (« les neuf
   définitions ne perdent que leur propriété `voile` »). Sans ce changement, le point 6 de la consigne ne pouvait pas
   produire son effet sur les captures de Grégoire. C'est la supposition la plus lourde du lot ; elle est détaillée
   plus bas et attend son verdict.
3. **Le voile retenait trois gestes qui cassent une étape.** Ils sont maintenant retenus par une garde dans la
   définition de l'étape, comme la consigne le demande.
4. **Passe finale des bancs des parcours sous Chromium : 87 verts, 10 rouges, 18 sautés** (les sautés sont des
   essais de captures). Neuf des dix rouges sont rouges aussi sur `main` sous Chromium ; le dixième est passé deux
   fois sur deux une fois rejoué seul. Détail plus bas. **Aucun de ces chiffres ne vaut verdict : la cible est WebKit.**

---

## Ce qui est fait, en gestes

Dans un parcours, sur un écran de plus de 500 px de large :

- **Le voile a disparu.** La page n'est plus assombrie, et tout se touche, à toutes les étapes.
- **Une flèche tracée à la main part de la bulle** et va vers ce dont la bulle parle. Elle est à l'encre du texte
  (claire en sombre, foncée en clair), jamais orange. Deux zones séparées reçoivent deux flèches ; des zones qui se
  touchent, une seule ; plus de trois, une seule vers l'ensemble. Une flèche qui passerait sur une autre zone, ou
  sur le bouton à toucher, arrive par un autre bord quand un chemin libre existe.
- **Ce qu'il faut toucher pulse en orange**, doucement. Si l'appareil demande moins de mouvement, c'est un cadre
  pointillé fixe.
- **La section où l'on est est encadrée** dans le menu ou la barre d'onglets qui porte le bouton à toucher.
- **La bulle a une poignée ⠿**, en haut à droite. On la glisse à la souris ou au doigt ; au clavier, les flèches la
  déplacent de 16 px. Elle reste sous l'en-tête et au-dessus du bandeau de la démo. À l'étape suivante, elle
  retourne se placer toute seule.
- **La bulle se pose près de ce dont elle parle**, à 32 px quand la place y est (la longueur d'une flèche), et ne
  couvre pas le bouton à toucher.
- Aux étapes 6 et 7 de « Découvrir » (les captures du 9 nov.) : la bulle « Évaluer » est sous « Évaluation », sa
  flèche y va, « Évaluation » est encadré, et « Conception » pulse à côté. Même chose à l'étape 7.

Sur téléphone (500 px et moins) : rien ne change, sauf le voile retiré. Pas de poignée.

Ce qui n'a pas changé : les textes, les pages de bulle, la bulle sur téléphone, le filet, l'avance sur l'état
atteint, la sortie, l'annonce au lecteur d'écran.

---

## Mesurer d'abord : les étapes qui comptaient sur le voile

Mesure faite par lecture du code des neuf définitions (un agent de lecture, puis vérification des trois cas
retenus dans le code et par un banc). **Presque toutes les étapes se rattrapent** comme le font déjà les étapes
sans voile (les sept de « Monter ton cours », plusieurs des parcours 3 et 4) : si la personne s'égare, elle revient
par le menu, ou « Plus tard » puis « Reprendre » la replace. Ce risque existait déjà ; il s'étend.

Trois étapes cassaient, et deux autres étaient volontairement masquées. Chacune a sa garde, dans sa définition :

| Parcours, étape | Ce que le voile retenait | La garde |
|---|---|---|
| Lire ta classe, 3 « Ce qui l'écarte » | Les pastilles d'absence et de production : touchées, elles quittent le profil | Elles ne répondent pas le temps de l'étape |
| Lire ta classe, 4 « De quoi il ou elle a besoin » | Les liens des deux cartes : ils quittent la page | Ils ne répondent pas le temps de l'étape |
| Lire ta classe, 6 « Ouvrir l'intervention » | « Consulter » dans l'historique ouvrait une intervention déjà enregistrée ; l'étape la prenait pour la fiche neuve et sautait à l'étape 8 | Une intervention déjà enregistrée ne fait plus avancer l'étape |
| Lire ta classe, 8 « Après l'intervention » | Le choix du statut : il écrirait sur l'intervention qui vient d'être créée | Il ne répond pas, à la souris, au doigt ni au clavier |
| Tes commentaires, 1 « Ta grille » | Le « Type » d'un critère déjà là : changé, il s'écrivait dans la grille enregistrée et faisait avancer l'étape | Le menu reprend sa valeur, rien ne s'écrit ; le « Type » du critère ajouté répond |

Pour que ces gardes ne débordent pas (une garde restée active pendant un autre parcours), le moteur dit maintenant
quel parcours il joue (`ParcoursMoteur.joue(def)`).

À l'étape 8 de « Lire ta classe », le statut gardé **ne pulse plus** : rien n'est à toucher là, et l'orange veut
dire « ce que tu toucheras ». C'est maintenant ce dont parle la bulle : la flèche y va. (Constat de la relecture
neuve.)

Non protégé, et dit ici plutôt que découvert plus tard : dans « Mettre tes données à l'abri », étapes 2 et 4, les
voisins de « Ouvrir un codex… » dans le menu (fusionner, ouvrir une archive, charger, nouveau codex) se touchent
maintenant. Chacun demande un second geste (un fichier ou un nom) avant d'écrire quoi que ce soit ; seul « Ouvrir »
était gardé avant ce lot, et il l'est toujours. Issue : **inscrire et continuer** (voir « Trouvailles »).

---

## Ce que j'ai supposé

Chaque ligne se corrige en une phrase si elle est fausse.

1. **Les `zones` des étapes 6 et 7 de « Découvrir » désignent maintenant la section dont la bulle parle**
   (« Évaluation », puis « Conception »), et non plus le prochain bouton. Avant, la zone et le bouton à toucher
   étaient le même élément : il fallait bien percer le voile là où toucher. La consigne écrite (point 6 : « la bulle
   prend pour cible l'union des zones ») aurait donc laissé la bulle sous le prochain bouton, avec une flèche vers
   lui : exactement le problème des captures. Deux lignes de `js/parcours-decouvrir.js`, aucun texte touché. Le
   relecteur neuf juge ce choix « cohérent, et nécessaire ». Pour revenir à la lettre : remettre `zonesNav('conception')`
   et `zonesNav('calendrier')`.
2. **Une zone qui EST le bouton à toucher n'est pas « ce dont parle la bulle ».** Elle a sa pulsation, pas une
   flèche de plus. Sans autre zone, la flèche va quand même au bouton (la consigne : « une étape sans zone mais avec
   un contour : la flèche va au contour »). C'est le cas de l'étape 5 de « Découvrir » : voir « Ce qui attend
   Grégoire ».
3. **Sur téléphone, la bulle rangée évite toujours les zones ET le bouton**, comme avant. Le point 6 de la consigne
   n'est appliqué qu'au-dessus de 500 px (« la bulle sur téléphone » fait partie de ce qui ne change pas).
4. **La bulle se pose à 32 px de sa cible** quand la place y est, à 12 px sinon (l'écart d'avant). À 12 px, une
   flèche ferait 6 px : elle n'est pas tracée (minimum : 24 px). Conséquence assumée : une bulle collée à sa zone
   n'a pas de flèche.
5. **« Cachée sous la bulle »** : le centre de la partie visible de la cible est sous la bulle.
6. **La « section actuelle »** est cherchée dans le parent du bouton à toucher, ou le parent de celui-ci, et
   seulement parmi les boutons, liens et onglets (`.active` marque aussi les sections de page). Jugé sur
   « Découvrir » et sur le septième parcours, pas sur les sept autres.
7. **Le fond de la flèche** : un liseré de la couleur de la bulle court sous le trait, pour qu'elle se lise sur
   n'importe quelle page. La consigne ne le demandait pas.
8. **La zone tactile de la poignée fait 46 × 46 px** (l'ajout de Cowork), pas 44.
9. **`fusionnerTrous` est devenu `fondreCibles`** (il fond les zones qui se touchent, pour une seule flèche) ;
   `trouRect` est parti, avec sa sentinelle `sentinelle-trou-du-voile-petite-cible-2026-11-09.test.js`, qui jugeait un
   tracé qui n'existe plus.
10. **Les fonctions `poserVoile`** des parcours 3, 4 et 9, et les masques du parcours 7, sont partis avec le voile
    (zéro dette), au-delà de la seule propriété `voile`.
11. **Le build est passé à `1110-1200`**, la version reste 1.241.0. Les sentinelles du dépôt exigent des jetons
    anti-cache du jour ; `node scripts/release.mjs --build-only` les a refaits pour tous les fichiers changés depuis
    la release, pas seulement les miens. **À la fusion, `index.html` sera en conflit avec le `main` du Mac : relancer
    `--build-only` après la fusion.**
12. **`OU-EN-EST-ON.md` n'est pas touché** : le lot n'est pas en ligne, et le fichier vit sur le `main` du Mac. À
    écrire à la mise en ligne.

---

## Ce qui attend Grégoire

1. **Les étapes 6 et 7 de « Découvrir »** (supposition 1) : est-ce bien ce que tu voulais ?
2. **L'étape 5 de « Découvrir »** (« D'où viennent ces signaux », bulle au centre). La flèche va à « Évaluation »,
   le bouton à toucher, parce que l'étape n'a aucune autre zone. La bulle parle pourtant des signaux, qui sont dans
   « Suivi ». Trois issues : laisser ainsi (la consigne à la lettre) ; aucune flèche à cette étape ; la flèche vers
   « Suivi ». C'est une des quatre captures du 9 nov. Je n'ai pas tranché : c'est le sens de la bulle.
3. **Un mot neuf, PROPOSÉ : « Déplacer la bulle »**, le nom de la poignée pour le lecteur d'écran. C'est le seul
   texte ajouté. Aucun texte de parcours n'a changé (vérifié par le relecteur et par les sentinelles des textes).
4. **Une ligne pour les Nouvelles, PROPOSÉE** (non écrite dans `js/changelog-data.js`) :
   « Dans les parcours, la page n'est plus assombrie : une flèche montre ce dont parle la bulle, ce qu'il faut
   toucher pulse en orange, et tu peux déplacer la bulle par sa poignée. »
5. **La porte terrain iPad** : `plans de travail/PORTES-TERRAIN-2026-11-10-parcours-fleches.md`, cinq portes et
   trois décisions. Elle attend la fusion et la mise en ligne. Cowork publie l'artefact jumeau.

---

## Ce que je n'ai pas pu vérifier

- **WebKit et l'iPad**, entièrement. Les bancs sont écrits pour WebKit (aucune mesure pendant un défilement ou une
  transition : tout est lu par `expect.poll` ; aucun rechargement ni « Retour arrière » dans les essais neufs ;
  cible tactile à 46 px), mais ils n'y ont pas tourné.
- **La cause du décalage sur iPad reste une inférence.** Lue dans le code par Cowork : l'ancien voile était
  dimensionné en hauteur de fenêtre des feuilles de style, ses trous calculés sur la hauteur intérieure. Jamais
  mesurée. Le lot retire le voile, et la couche des flèches est posée en px, sans mise à l'échelle (une sentinelle
  l'exige). Sous Chromium, les deux hauteurs sont égales : **aucun banc d'ici ne peut voir ce défaut**, seule la
  sentinelle statique le tient.
- **Le doigt** : les essais envoient des événements de pointeur de type « toucher » sur la poignée. Ce n'est pas un
  doigt. Le stylet n'a pas été essayé.
- **Le zoom au pincement** (constat du relecteur, probable) : sous WebKit, la taille intérieure de la fenêtre
  rétrécit pendant un zoom ; une cible visible pourrait être jugée « sortie de l'écran », et sa flèche aller vers un
  bord. Non corrigé à l'aveugle : à mesurer.
- **La poignée au clavier sous Safari Mac** : Safari ne donne pas le focus aux boutons par Tab sans réglage
  (Option-Tab). Le chemin au clavier peut y être inatteignable par défaut.
- **Les captures à 820 px en clair du neuvième parcours** : le banc de ce parcours ne produit pas cette variante.
  Trois captures de « Ta notation alternative » sont au dossier (1180 sombre, 1180 clair, 820 sombre), plus une de
  l'étape 3 à 820 px.
- **Les sept parcours autres que « Découvrir » et « Lire ta classe »** n'ont pas été regardés un par un à l'œil
  avec leurs flèches. Leurs bancs passent ; l'apparence de chaque étape n'a pas été jugée.

### La mesure à faire sur le Mac, en gestes

Avant l'assemblage (leçon du groupe 3) :

1. Fermer GitHub Desktop. Se placer sur `lot/parcours-fleches`.
2. Lancer, **un navigateur à la fois**, sous WebKit : `parcours-fleches-2026-11-10.spec.js`, puis les neuf bancs
   `parcours-*`, puis `bulle-sur-telephone`, `bulles-en-pages`, `registre-des-parcours`, `bulles-au-doigt-540`.
3. Refaire les captures à 820 px sous WebKit : `CAPTURES_PARCOURS=<dossier> npx playwright test parcours-fleches -g captures`.
4. **Mesurer la cause du décalage**, sur l'iPad lui-même (Safari, barre d'adresse visible), dans la console
   (inspecteur web du Mac branché à l'iPad), pendant une étape de parcours :
   `[innerHeight, document.documentElement.clientHeight, getComputedStyle(document.documentElement).height, visualViewport.height]`,
   puis, sur `main` (avant ce lot), la hauteur de `#parcours-voile` (`getBoundingClientRect().height`). Si cette
   hauteur dépasse `innerHeight`, l'inférence est confirmée. Si elle lui est égale, la cause était ailleurs, et la
   porte 2.1 le dira.
5. Sur l'iPad, zoomer au pincement pendant une étape : la flèche reste-t-elle sur sa cible ?

---

## Les lignes du moteur touchées (pour préparer la fusion avec `d2d52fddd`)

**`suivreAtteint` n'est pas touché** (ses six lignes sont celles de `main`, aux lignes 1097 à 1102 de la branche).
Il appelle toujours `placerSelonEtape(etape, zones, contourEl)`, dont le nom et la signature sont gardés : un
replacement ajouté par le Mac quand la hauteur change y trouvera sa fonction, et elle redessine aussi les flèches.

Par rapport au `js/parcours-moteur.js` de `main` (893 lignes ; 1 234 sur la branche) :

| Lignes de `main` | Ce qui change |
|---|---|
| 5 à 24 | L'en-tête : le voile décrit devient flèche, pulsation, section actuelle, poignée ; `.joue(def)` à l'API |
| 60 à 68 | Cinq constantes de plus (`ECART_FLECHE`, `FLECHE_MIN`, `FLECHE_RETRAIT`, `FLECHES_MAX`, `PAS_CLAVIER`), `LIBELLE_POIGNEE` |
| 158 à 198 | `creerElements`, `retirerElements` : la couche `#parcours-fleches` remplace `#parcours-voile` |
| 452 à 462 | `rendreBulle` : la poignée dans la tête, hors téléphone |
| 547 à 588 | `trouRect` et `fusionnerTrous` retirés ; à leur place la géométrie pure (`fondreCibles`, `grouperCibles`, `courbe`, `tracerFleche`, `bornerDeplacement`, `seCroisent`) |
| 672 à 716 | `placerBulle` réécrit et scindé (`cadreUtile`, `poserDeplacee`, `placePresDe`) ; puis, neufs : la poignée (`deplacerBulle`, `debutGlisser`, `surGlisser`, `finGlisser`, `surTouchePoignee`), les flèches (`sujets`, `ciblesDesFleches`, `dessinerFleches`, `effacerFleches`), la section actuelle (`sectionActuelleDe`, `marquerSectionActuelle`) |
| 730 à 767 | `sonder` (le tracé du voile devient la mise à la taille de la couche et la section actuelle) et `placerSelonEtape` (réécrit, même signature) |
| 808 à 809 | `allerA` : la classe du voile retirée ; la place déplacée, les flèches et la section actuelle remises à zéro |
| 839 à 863 | `lancer`, `fermer` : quatre champs d'état de plus ; l'écouteur de défilement en capture ; `visualViewport` écoute aussi `scroll` |
| 876 à 890 | L'API : `joue(def)` et `geometrie` |

`placerBulleTelephone`, `coteTelephone`, `reglerDefilement`, `choisirCote`, les pages de bulle, `preparer`,
`elementsVises`, `surTouche`, `quitter` : inchangés.

Les autres fichiers de code : `css/parcours.css` ; les neuf définitions (`voile` retiré partout ; `poserVoile` retiré
de `parcours-evaluer`, `parcours-recevoir`, `parcours-notation-alternative` ; masques devenus gardes dans
`parcours-lire-ta-classe` ; `garderLeType` dans `parcours-commentaires` ; deux `zones` dans `parcours-decouvrir` ;
la couche des flèches ajoutée aux éléments passés au-dessus des fenêtres dans `parcours-donnees`).
**`js/navigation.js` et `js/config.js` ne sont pas touchés.**

---

## La preuve

### Vitest

`tests/unit/sentinelle-parcours-fleches-2026-11-10.test.js`, 22 essais : la géométrie de la flèche (bord de la
bulle, pointe à 6 px, forme, déterminisme, cible sortie de l'écran, à moitié sortie, sous la bulle, collée,
détour autour d'une autre cible, tracé gardé dans l'écran, petite cible), les cibles groupées, le bornage du
déplacement, la sentinelle des coordonnées, le retrait du voile dans le moteur, la feuille de style et les neuf
définitions, le pointillé fixe.

Suite complète : 912 fichiers, 11 289 essais, tous verts au dernier lancement complet que j'ai lu (après le
scindage de `placerBulle`). Les pushs suivants sont passés par le hook de pré-push, qui relance la suite et
refuse un rouge ; je n'ai pas relu son compte.

Trois sentinelles du dépôt ont rougi en route, à raison, et ont été satisfaites : la découpe du source par
`indexOf` (passée par `tranche()`), le plafond de complexité (`placerBulle` scindé), les jetons anti-cache.

### Break-tests

Chaque défense a été retirée, l'essai qui la nomme lancé, puis la défense remise.

| N° | Défense retirée | Résultat |
|---|---|---|
| B1 | La pointe s'arrête à 6 px (retrait mis à 0) | 4 rouges |
| B2 | Pas de flèche sous 24 px | 2 rouges (« cachée sous la bulle », « collée à la bulle ») |
| B3 | Cible hors écran non ramenée au bord | 1 rouge |
| B4 | Un aléa dans le bombement | 2 rouges |
| B5 | Pas d'union au-delà de trois cibles | 1 rouge |
| B6 | Déplacement non borné | 2 rouges |
| B7 | Un `viewBox` posé sur la couche | 1 rouge |
| B8 | `height: 100vh` sur la couche | 1 rouge |
| B9 | Obstacles ignorés par la flèche | 1 rouge |
| B10 | La hauteur en px non posée | 1 rouge |
| B11 | `voile: 'dense'` remis dans une définition | 1 rouge |
| B12 | La pulsation gardée sous mouvement réduit | 1 rouge |
| B13 | Point de contrôle non gardé dans l'écran | 1 rouge |
| B14 | Marge de 16 px gardée sur une cible de 10 px | 1 rouge |
| P1 | Garde des pastilles (Lire ta classe, 3) | 1 rouge : le profil se ferme |
| P2 | Garde du « Type » (Tes commentaires, 1) | 1 rouge |
| P3 | Garde de l'étape 6 (Lire ta classe) | 1 rouge |
| P4 | La couche des flèches capte le toucher | 1 rouge |
| P5 | Section actuelle jamais posée | 1 rouge |
| P6 | Le bouton à toucher n'est plus un obstacle | 1 rouge : la bulle revient sous le prochain bouton |
| P7 | Zones de « Découvrir » 6 remises sur le prochain bouton | 1 rouge |
| P8 | Pointillé fixe retiré | 1 rouge |
| P9 | Bulle déplacée non bornée | 1 rouge |
| P10 | Place non gardée pour l'étape | 1 rouge |
| P11 | La poignée laisse remonter les flèches du clavier | 1 rouge |
| P12 | Poignée posée aussi sur téléphone | 1 rouge |
| P13 | Poignée de 30 px | 1 rouge |
| P14 | Flèche à l'encre orange | 1 rouge |
| P15 | Flèches non redessinées | 1 rouge |
| P16 | Un second doigt prend la poignée | 1 rouge |

Trois de ces break-tests ont d'abord laissé l'essai vert, et ont fait corriger quelque chose : B2 a montré une
ligne redondante dans le moteur (retirée) ; P11 et B14, des essais trop lâches (resserrés, puis rejoués rouges).

P1 à P15 ont été joués avant les corrections de la relecture, et pas rejoués après. Ajouté ensuite : **P16**, un
second doigt prend la poignée (la garde `etat.glisse` retirée) : 1 rouge. Les essais ajoutés pour les gardes de
l'étape 4 et pour le clavier sur le statut de l'étape 8 **n'ont pas leur propre break-test** : ils passent par la
même garde que P1, jouée sur la pastille de l'étape 3.

### Playwright (Chromium)

Banc neuf : `tests/integration/parcours-fleches-2026-11-10.spec.js`, 6 essais et 4 de captures ; aides :
`tests/integration/harness/fleches-de-banc.js`.

Passe finale, 14 fichiers, 15 minutes, sur le code de `c99e872d` : **87 verts, 10 rouges, 18 sautés**.

- Le banc neuf des flèches : 6 verts sur 6 (ses 4 essais de captures sont sautés hors captures).
- Les bancs des parcours 3, 4, 5, 6, 7 et 9, `bulles-en-pages`, `registre-des-parcours` : tout vert.
- Les 10 rouges : 9 sont dans le tableau « Les rouges qui ne viennent pas du lot » ; le dixième est
  `parcours-8-commentaires`, « sans fichier, sur une grille déjà employée » (la rétroaction attendue n'était pas
  encore écrite). Il était vert à la première passe ; rejoué seul, vert deux fois sur deux. **Un rouge sur quatre
  lancements, non élucidé.** Il a rougi pendant que la suite Vitest du pré-push tournait sur la même machine :
  c'est une circonstance, pas une cause établie. À rejouer sous WebKit, seul.

Les bancs qui ont changé, et pourquoi (réécrits, pas desserrés) :

| Banc | Ce qui change |
|---|---|
| `parcours-1-et-2` | Les deux attentes sur la classe du voile (dense, léger) deviennent : pulsation, flèche vers la bonne cible, section actuelle, rien ne retient le toucher ; aux étapes 6 et 7, la bulle n'est pas sous le prochain bouton ; à l'étape 8, ni flèche ni contour ; à la sortie, rien ne reste |
| `parcours-7-lire-ta-classe` | « Sous le voile » devient « gardé » : l'essai TOUCHE la pastille, le lien, le statut (souris et clavier), puis juge que rien ne s'est produit. Avant, il lisait seulement qui recevait le toucher. Ajouts : la garde de l'étape 6 ; le statut de l'étape 8 a une flèche et plus de contour |
| `parcours-8-commentaires` | Un essai neuf : la garde du « Type » |
| `parcours-4-recevoir-et-rendre` | L'attente « voile normal » à la reprise de l'étape 4 devient : flèche vers la palette, rien ne retient le toucher |
| `parcours-5-monter-ton-cours`, `harness/classe-de-banc` | `deuxSondes` marquait le tracé du voile ; il marque la largeur de la couche des flèches |
| `bulles-en-pages` | La tête de la bulle porte la poignée : l'essai lit ses enfants un par un (titre, rang, poignée, rien d'autre) au lieu de son texte entier |
| `parcours-2`, `parcours-6`, `parcours-8`, `parcours-9`, `bulle-sur-telephone` | Le voile sort de la liste des éléments dont la capture attend la fin des transitions ; rien d'autre |
| `parcours-3-evaluer`, `registre-des-parcours`, `bulles-au-doigt-540` | Inchangés |

La consigne parlait de onze bancs : neuf fichiers d'essais et deux aides lisaient `parcours-voile` ou
`parcours-contour`. Tous sont dans ce tableau.

### Les rouges qui ne viennent pas du lot

Rejoués sur une copie de `main` (`77679dd`), sous Chromium, pour les départager :

| Essai | Sur `main` | Cause apparente |
|---|---|---|
| `parcours-1-et-2`, « panneau : titre, phrase… » | rouge | Une largeur de 430,00006 px attendue à 430 |
| `bulle-sur-telephone`, « 390 px : Découvrir, étapes 1, 5 et 8 » | rouge | Bord droit à 372 au lieu de 382 : la barre de défilement de Chromium |
| `bulle-sur-telephone`, « un parcours pour grand écran… » | instable (1 rouge sur 2) | « Element is outside of the viewport » |
| `parcours-2-ma-classe`, « de Découvrir à sa propre classe » | rouge | Délai dépassé |
| `parcours-2-ma-classe`, « une flèche didactique ouverte… » | rouge | Délai dépassé |
| `parcours-9`, « captures : standards, 390 px » | rouge | Ne tourne qu'avec les captures |
| `bulle-sur-telephone`, « le refus suit la largeur » | instable (rouge 2 fois, vert 2 fois, sur les deux arbres) | « Element is outside of the viewport » |
| `bulles-au-doigt-540`, trois essais | rouge | Hors parcours ; le toucher simulé de Chromium |

Ce sont des écarts de Chromium (le dépôt le dit : la config Chromium est « un outil de reproduction ciblée, pas une
suite verte »). **Ces essais ne prouvent donc rien pour ce lot, ni pour ni contre** : seul WebKit sur le Mac les juge.

### Relecture par un agent neuf

Faite sur le diff, sans navigateur. Ses constats, et leur disposition :

| Constat | Disposition |
|---|---|
| Étape 8 de « Lire ta classe » : la pulsation invitait à toucher ce que la garde retient | **Corrigé** : une zone, plus de contour |
| Étape 5 de « Découvrir » hors de la règle des étapes 6 et 7 | **Remonté à Grégoire** (point 2 de « Ce qui attend ») |
| Section actuelle perdue si un rendu réécrit les classes de l'onglet | **Corrigé** |
| Essai « le tracé reste dans l'écran » trop lâche | **Corrigé**, break-test B13 |
| Essai du second doigt qui n'envoyait pas de second doigt | **Corrigé**, break-test P16 |
| Un glisser sans assertion dans le banc | **Retiré** |
| Gardes des étapes 3 et 4 et clavier sur le statut sans essai | **Corrigé** : essais ajoutés |
| La couche ne peut pas montrer le défaut iPad sous Chromium | **Vrai, assumé** : dit dans « Ce que je n'ai pas pu vérifier » |
| Rapport, liste « Mesurer d'abord », ligne de Nouvelles absents | **Fait** : ce fichier |
| Captures du neuvième parcours incomplètes | **Dit** plus haut |
| Petite cible atteinte par un autre bord : pointe à côté | **Corrigé**, break-test B14 |
| Un second pointeur prenait la poignée | **Corrigé** |
| La place gardée était la visée brute, hors écran | **Corrigé** |
| Flèche en retard dans un conteneur qui défile | **Corrigé** : écouteur en capture |
| Zoom au pincement, poignée au clavier sous Safari, `background-image` de la section actuelle, radio au clavier et menu natif sous WebKit, animation de l'ombre | **Risques WebKit, à mesurer sur le Mac** (liste plus haut) |
| Sans place libre, la bulle peut couvrir le bouton à toucher | **Commenté, assumé** : l'ancien code le faisait aussi quand rien ne tenait ; les bancs existants passent |
| `garderLeType` n'exempte que le dernier critère ajouté | **Assumé** : équivalent à l'ancien voile |
| Étape 6 du septième, une intervention de l'historique ouverte : la bulle reste sans retour | **Assumé** : se rattrape à la main, comme les autres étapes |
| Commentaires périmés (`parcours-donnees`, banc 7) | **Corrigé** ; « zone éclairée » reste dans des commentaires du moteur sur le téléphone, où le mot décrit encore la chose |

### Captures

`plans de travail/captures-2026-11-10-parcours-fleches/`, 24 images, Chromium :

- « Découvrir », étapes 3 (plusieurs zones), 5, 6 et 7, et l'étape 3 avec la bulle déplacée et sa flèche : à
  1180 × 820 et 820 × 1180, en sombre et en clair (20 images) ;
- « Ta notation alternative », étape 5 : 1180 sombre, 1180 clair, 820 sombre ; étape 3 à 820 sombre (4 images).

Les captures de « Découvrir » datent d'avant les corrections de la relecture ; ces corrections ne changent pas ce
qu'elles montrent (aucune ne touche les étapes 3, 5, 6 et 7 à l'œil), mais elles n'ont pas été refaites.

---

## Trouvailles en chemin, et leur issue

1. **Le verdict WebKit de GitHub est rouge sur le dernier push de code de `main`** (`579f6ace`), dont quatre essais
   de parcours (parcours 2, trois essais ; parcours 7, les neuf étapes en sombre). Le RELAIS de 10 h 30 parle d'un
   verdict vert, celui du Mac sur un ancêtre. Trouvé par l'audit de début de session. **Issue : inscrire et
   continuer** ; à inscrire par le pilote, je ne touche pas au BACKLOG depuis cette branche. Ce lot réécrit le moteur
   que ces bancs jugent : le rouge du parcours 7 venait de `trouRect`, qui n'existe plus.
2. **Les voisins de « Ouvrir un codex… »** se touchent maintenant aux étapes 2 et 4 de « Mettre tes données à
   l'abri ». **Issue : inscrire et continuer.** Élargir la garde existante à ces quatre actions serait une ligne ;
   je ne l'ai pas fait parce que rien ne s'écrit sans un second geste, et que le choix de les retenir ou non
   touche à ce que le parcours doit laisser faire.
3. **Parcours 9, étape 3 à 820 px** : la bulle couvre la section qu'elle décrit (pas de place à côté). C'était
   déjà le cas avec le voile. **Issue : commenter et oublier** ; la poignée permet maintenant de la pousser.
4. **Les essais rouges sous Chromium sur `main`** (tableau plus haut). **Issue : commenter et oublier** :
   Chromium n'est pas la cible.
