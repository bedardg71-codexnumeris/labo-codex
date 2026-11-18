# Rapport du lot — « Je regarde » de « Recevoir les productions, rendre tes rétroactions » (17 nov. 2026)

**Dernier relais (18 nov. 2026, nuit)** : branche `claude/ecstatic-brown-urn6v8` (PR n° 28), avec `materiel/recevoir-dix-bulles`
(`16044f3`) et `lot/perspective-coins` (`dd4bf10`, PR n° 29) fusionnées. **Fait** : la consigne
`plans de travail/CONSIGNE-LOT-2026-11-17-recevoir-dix-bulles.md` en entier (A à E). **Reste** : la porte terrain
(`plans de travail/PORTES-TERRAIN-2026-11-17-recevoir-dix-bulles.md`, Cowork la mène) ; le verdict WebKit à la fusion,
sur le Mac ; **défaire le commit « BRANCHE SEULEMENT » (`4c36db4`) avant toute fusion**. Ni fusion, ni release, ni
Nouvelles. Chromium seulement.

---

## Retouches de Cowork (18 nov. 2026, 7 h 40), appliquées

1. Bulles 1, 5, 6 et 10 : « à l'onglet « X » », posé par le moteur avec le halo du menu (`lieu`, `lieuSuite`) ; la suite
   de chaque phrase reste mot pour mot. Le moteur le permet : aucune phrase entière à garder. Effet de bord mesuré et
   réglé : le lieu remonte la page en haut, la ligne de Loutre (étape 5) sortait de l'écran en paysage ; les étapes à
   lieu déclarent `amener` (le moteur ramène ce qu'elles désignent), et le menu « Actions » est ramené de côté.
2. Bulle 4 : « la mention « Spécifique », suivie de « Perspective » ».
La sentinelle accepte ces deux retouches, nommées et datées, et refuse toute phrase « à la section ». Banc B : sept passes,
six vertes ; une rouge, une fois, au relevé automatique de la bulle (portrait), non reproduite en trois passes suivantes.
Le banc attend aussi que l'engrenage porte la copie de Tapir avant de le toucher (une course du banc, pas de l'application).

## Pour la conversation du Projet (quinze lignes, 18 nov., nuit)

1. `claude/ecstatic-brown-urn6v8` (PR n° 28) porte les dix bulles ; `lot/perspective-coins` (PR n° 29, `dd4bf10`) y est fusionné. Aperçu : §S.6.
2. A1 : « Perspective » pose les poignées sur les coins trouvés ; photo de Tapir à 1 % au plus des vrais coins (seuil du banc : 2 %), celle de Loutre au repli de 5 %.
3. A1, écart : sur Loutre la détection ne rend pas `null`, elle rend le cadre de l'image (un coin hors d'elle) ; ce cas compte comme « rien trouvé ».
4. A2 : un réglage de couleur ou de lumière remplace la balance automatique ; jugé à l'import et à l'aperçu. Source seulement : la file d'attente.
5. Le badge « Spécifique » dit « Luminosité +20 », « Perspective »… ; il disait le nom anglais.
6. B : `js/materiel-copies-deux-rives.js` refait (deux photos, un PDF, 4,9 Mo) ; sentinelle octet pour octet ; les photos passent `validerMagicBytes` (import au banc).
7. C : dix étapes, les dix textes mot pour mot dans `TEXTES` ; les lignes PROPOSÉES sont marquées (deux, à l'étape 2).
8. Écart : les bulles disent « à la section », le moteur « à l'onglet » ; posées telles quelles, sans le halo du menu (§S.3).
9. Écart : la bulle 4 dit « Spécifique : Perspective » ; l'Aperçu montre « Spécifique », puis « Perspective », sans deux-points.
10. Écart : la fin n'a que deux boutons ; « Voir le parcours suivant » attend un parcours suivant qui ait son « Je regarde ».
11. Étape 3 : à 820 × 1180, aucune place hors de l'image ; la bulle évite les poignées (repères invisibles) et couvre le milieu de l'image.
12. Bancs : A, B (deux orientations, dix étapes, clés et fichiers), C verts ; break-tests rouges, dont les deux gardes neuves.
13. Export : huit PDF, rien d'écrit en base ; le ZIP est nommé `Lea_<production>_<date>.zip` (Chromium le reçoit « download »).
14. Import des trois copies : 4,5 s sous Chromium dans le nuage ; l'étape attend la fin du traitement.
15. Pas vérifié : Safari, l'iPad, le doigt sur les poignées, le nom du ZIP sous Safari : la porte terrain les porte.

---

## S. Le lot du soir (consigne des dix bulles)

### S.1 Ce qui est fait

| Partie | Où | Jugé par |
|---|---|---|
| A1, les coins | `js/travaux-preparation.js` : `activerPerspective` lance `detecterCoinsDocument` sur l'image telle que les poignées la voient (la géométrie appliquée) ; `coinsUtilisables` refuse un coin hors de l'image ou le cadre lui-même ; `detecterCoinsAuto`, sans appelant, retiré ; `coinsDePerspective`, `operationsEnCours` pour les bancs et le modèle | `perspective-coins-2026-11-17.spec.js` A1 ; deux break-tests (détection débranchée ; refus du cadre retiré) |
| A2, la balance | `js/travaux-ui.js` : `balanceActiveePour` rend `false` devant `whiteBalance`, `brightness`, `contrast`, `exposure`, `grayscale` ; la géométrie seule la laisse | A2 (aperçu du centre : son rendu « bal » ou « raw » ; import : un seul appel d'`autoBalanceBlancs`) ; break-test |
| Le badge | `decrireOperation` sur les types écrits ; la virgule par `formaterNombre` (#1137) | A2 (« Perspective », « Luminosité +20 ») |
| B, les copies | `js/materiel-copies-deux-rives.js` refait ; jeton du chargeur `20261117b` | sentinelle (noms de la partie B, deux `image/jpeg` et un `application/pdf`, octet pour octet) ; deux break-tests |
| C, les dix étapes | `js/parcours-recevoir-modele.js` ; `totalModele: 10`, `surModale` exposé (`js/parcours-recevoir.js`) | `je-regarde-recevoir-2026-11-17.spec.js` A, B, C |
| D, la porte | `plans de travail/PORTES-TERRAIN-2026-11-17-recevoir-dix-bulles.md` | — |

**A2, source ou stock** : la source seulement. La décision se lit à l'import et dans les aperçus ; ce qui est déjà importé ne
change pas, et rien d'une évaluation n'est touché. La file d'attente (persistée depuis #884) relit la règle au prochain aperçu.

### S.2 Les bancs (Chromium du nuage)

| Banc | Résultat | Break-test (rouge, puis rétabli) |
|---|---|---|
| A1 · Tapir, les coins ; Loutre, le repli | vert ; coins trouvés (0,049 ; 0,096) (0,852 ; 0,075) (0,946 ; 0,879) (0,068 ; 0,914) | détection débranchée → rouge ; refus du cadre retiré → rouge |
| A2 · balance, aperçu et import ; badge | vert | `balanceActiveePour` sans la garde → rouge |
| Modèle A · le refus | vert | (inchangé) |
| Modèle B · dix étapes, 820 × 1180 et 1180 × 820 | verts | étape 2 sans `posteSurLaPhotoARedresser` → rouge ; étape 3 sans `perspectiveAppliquee` → rouge ; les break-tests du confinement d'hier restent écrits au banc |
| Modèle C · les sept évaluations | vert | (inchangé) |
| Sentinelle du modèle (Vitest) | verte | un octet changé dans la photo de Tapir → rouge ; le type d'une photo changé → rouge |

Les bancs voisins et Vitest sur la branche : §S.7. Sur `lot/perspective-coins` : Vitest vert au push ;
`etats-vides-preparer-copies` vert ; `lot-j0-bis-partage-apres-preparation` : un rouge, **le même sur `main`**
(`navigator.share` absent sous Chromium).

### S.3 Les écarts avec la consigne, et pourquoi

1. **A1, Loutre** : la consigne mesurait `null` ; la détection, sur l'image que voient les poignées, rend le **cadre de
   l'image**, un coin à x = −0,006, impossible à saisir. Refusé : les poignées reviennent à 5 % des bords.
2. **« à la section »** (bulles 1, 5, 6 et 10) : le moteur dirait « à l'onglet » pour ces sous-sections (sa règle, validée
   pour « Découvrir »). Les phrases sont posées mot pour mot, comme des phrases de la bulle ; elles perdent le halo du menu.
3. **Bulle 4, « Spécifique : Perspective »** : l'Aperçu montre « Spécifique », puis « Perspective » à part, sans
   deux-points (relevé au banc : « Spécifique Perspective Doux 2750 x 3667 2,9 Mo »). Texte non changé.
4. **Bulle 10, trois boutons** : « Voir le parcours suivant » n'est offert que si le parcours suivant a son « Je regarde » ;
   aucun ne l'a. La fin offre « Le refaire avec ma classe » et « Terminer ». Non contourné : faire paraître le bouton
   lancerait un modèle qui n'existe pas.
5. **Bulle 10, l'ordre de la fin** : le moteur pose « Pour revoir une étape… » avant « Objectif atteint » (comme dans
   tous les parcours), et l'écrit aussi à la première forme (c'est la dernière bulle).
6. **Les consignes à parenthèse** (bulles 6 et 8) : la parenthèse fait partie de la ligne orange.
7. **Étape 3, la bulle sur l'image** : à 820 × 1180, l'image occupe 579 × 771 px sur 810 × 1180 ; aucune place ne la laisse
   libre. La bulle évite les quatre poignées (des repères invisibles posés dessus) et les boutons à toucher ; elle couvre le
   milieu de l'image. Mesuré aux deux orientations : aucune poignée couverte.

### S.4 Ce que j'ai supposé ou tranché

- Les deux photos du petit lot posées en fixtures (`tests/fixtures/perspective-coins/`), pour que `lot/perspective-coins`
  se juge seul : 2,5 Mo de plus.
- L'étape 2 sait quelle photo le poste a ouverte par le nom qu'il affiche (`.prep-mini-nom`) ; sous l'anonymisation, ce nom
  change : à revoir si le modèle doit tourner anonymisé.
- Les lignes PROPOSÉES (étape 2) : « Ce modèle redresse la photo de Tapir Doux : sous « Originaux », touche la sienne. »
  et « Ce n'est pas la photo de Tapir Doux : touche « ← Retour », puis choisis la sienne. » Le refus du panneau inchangé.
- Les secondes formes (étapes 3, 6 et 10) n'ont ni confirmation ni phrase du lieu : « devient » remplace la bulle.
- La garde de l'étape 8 (neuf passages) et « Annuler » à l'étape 6 : maintenues.

### S.5 Ce qui n'est pas vérifié

Safari et l'iPad ; le doigt sur les poignées ; le temps de l'import des deux photos sur l'iPad ; le nom du ZIP sous Safari
(Chromium le reçoit nommé « download », l'application le nomme `Lea_Appliquer-des-stratégies-de-lecture-variées-Deux-Rives_<date>.zip`).
Tout cela est dans la porte terrain.

### S.6 L'aperçu

PR n° 28 : https://github.com/bedardg71-codexnumeris/labo-codex/pull/28 ; aperçu :
https://deploy-preview-28--codexnumeris-051225.netlify.app. Le bas de page dira `1.249.0`, build `1117-0611` : aucune
release, le build ne change pas. L'aperçu de `06bf683` était en construction chez Netlify au push ; il n'a pas été ouvert depuis le conteneur.
PR n° 29 (le petit lot seul) : https://github.com/bedardg71-codexnumeris/labo-codex/pull/29.

### S.7 Les essais de la branche, et le build

| Essai (Chromium) | Résultat |
|---|---|
| Vitest (depuis `tests/`) | vert après trois retouches de mes propres essais : le bac à sable de la sentinelle (`addEventListener`), le repère des poignées sans classe CSS (cliquet #679), une pause fixe remplacée par une attente de la sonde (cliquet des pauses) |
| `je-regarde-recevoir-2026-11-17` | A, B (820 × 1180 et 1180 × 820), C : verts |
| `perspective-coins-2026-11-17` | 2/2 |
| `parcours-4-recevoir-et-rendre-2026-11-09` | 4/4 |
| `parcours-je-regarde-2026-11-16` | 3/3 |
| `registre-des-parcours-2026-11-09` | 1/1 |
| `deux-temps-modeles-2026-11-13` | 4/5 ; B à 1180 × 820 rouge, même signature que sur `main` (#1285) |

La sentinelle du modèle confronte maintenant **chaque texte de `TEXTES` à la partie C de la consigne, mot pour mot** (hors
lignes PROPOSÉES) ; break-test : « Regarde-les venir » → rouge, le chemin nommé. Le build : §S.6.

---

# Le lot de la nuit (17 nov. 2026, avant la consigne des dix bulles)

## 0. Pour la conversation du Projet (quinze lignes)

1. Branche `claude/ecstatic-brown-urn6v8` à `4c36db4`, sur `03dc7d2` ; PR en brouillon n° 28 ; aperçu au §6.
2. 3.1 : le modèle d'« Évaluer » évalue toujours Yack Amical (9900007), quel que soit le tri ; banc et break-test.
3. 3.2 : sept évaluations écrites dans la démo, en ajout ; note par `calculerPortee`, `valeurNumeriqueDuNiveau` et
   `niveauDuPourcentage`. Vérifiée : identique au formulaire pour Yack, et recalculée par lui pour Caribou.
4. 3.3 : les copies en base64 dans `js/materiel-copies-deux-rives.js`, chargé à la demande, jeton en dur. 3.4 : noms en 2025.
5. 3.5 : blobs dans IndexedDB seulement ; la remise à neuf les emporte, vignettes comprises (banc + break-test).
6. 3.6 : l'export fait huit PDF (Loutre avec sa copie, sept synthèses seules) et n'écrit rien en base. Mesuré au banc.
7. Les neuf étapes du parcours réel, voie « avec des fichiers » ; « Remplir » à l'étape 1 dépose les trois copies.
8. Textes provisoires, tous dans `TEXTES` (js/parcours-recevoir-modele.js) ; la section des neuf étapes est au §3.
9. **Écart à la consigne** : à l'étape 4, « Annuler » et non « Enregistrer » ; « Enregistrer » écrit 14 clés globales (§4.1).
10. Bancs : A (refus), B (bout en bout, deux orientations, clés et blobs), C (sept évaluations). Six break-tests rouges.
11. Sentinelle Vitest : le tableau et les trois noms confrontés à la consigne, les copies octet pour octet ; deux break-tests.
12. Bancs existants rejoués (§2.3) ; le seul rouge est celui de `main` (#1285, Chromium en paysage).
13. Supposé : « Je regarde » de « Lire ta classe » posera l'évaluation de Tapir Doux avec la même construction (§4.3).
14. Pas vérifié : Safari et WebKit, l'iPad ; l'aperçu est annoncé prêt par Netlify, mais pas ouvert depuis le nuage.
15. Parcours rouverts sur la branche seulement, par un commit isolé à défaire (`git revert`) avant la fusion.

---

## 1. Ce qui est livré

| Pièce | Où | Jugé par |
|---|---|---|
| Yack Amical, toujours (décision 3.1) | `js/parcours-evaluer.js` : `MATERIEL.etudiantEvalue`, `daDeLaLigne`, `ligneAEvaluer` ; l'étape 4 n'avance que sur son évaluation | `deux-temps-modeles` B : la Liste triée par prénom avant l'étape 4 ; break-test |
| Les crochets du modèle | `js/parcours-recevoir.js` : le repère en mémoire dans le modèle (`enModele`), `totalModele`, `lancerModele`, `refusModele`, `pourLeModele` | bancs A, B, C |
| Le modèle | `js/parcours-recevoir-modele.js` (nouveau) : matériel, `TEXTES`, sept évaluations, dépôt des copies, neuf étapes, reprise | bancs A, B, C ; sentinelle |
| Les trois copies | `js/materiel-copies-deux-rives.js` (nouveau, 1,1 Mo), chargé à la demande | sentinelle (octet pour octet) ; banc B |
| Les essais | `tests/integration/je-regarde-recevoir-2026-11-17.spec.js`, `tests/integration/harness/recevoir-modele-de-banc.js`, `tests/unit/sentinelle-modele-recevoir-2026-11-17.test.js` | — |

**Le préalable** (`refusModele`) : le deuxième groupe, et dans la démo la grille « G4H Sans français », la production qui
la porte avec une échelle et une cartouche, et cette cartouche. Il s'appuie sur ce que produit le modèle d'« Évaluer »,
pas sur l'ordre de ses étapes (relais, point 4). L'évaluation de Yack Amical n'est pas exigée : si elle manque, elle est
posée avec les six autres.

**La reprise** : le repère est refait à chaque lancement. Le modèle repart à l'export si Loutre Enjouée est évaluée, à la
Liste si sa copie est importée, sinon au dépôt.

**Deux resserrements par rapport au parcours réel**, propres au modèle :
- étape 2 : la production choisie doit être celle du modèle, et l'étape attend la **fin** de l'import (le parcours avance
  au premier fichier ; mesuré : à la Liste, la troisième copie restait « Non reçu ») ;
- étape 3 : la copie ouverte doit être celle de Loutre Enjouée ; une autre, la bulle le dit.

## 2. Les bancs (Chromium du nuage)

### 2.1 Les bancs du lot

| Banc | Résultat | Break-test (rouge, puis rétabli) |
|---|---|---|
| A · refus sans le modèle d'« Évaluer » ; pulsation sur sa Modélisation | vert | `refusModele` rendant `null` → rouge |
| B · 820 × 1180, de bout en bout | vert, trois passes sur trois | a. les évaluations écrites aussi sans préfixe → rouge, la clé nommée ; b. la remise à neuf sans le retrait des copies → rouge (vignettes) ; c. le retrait sans la suppression des blobs → rouge, les trois blobs nommés |
| B · 1180 × 820 | vert, deux sur deux | (les mêmes) |
| C · les sept évaluations | vert | le filtre « déjà évalué·e » retiré → rouge (Yack Amical en double) |
| `deux-temps-modeles` B (Yack Amical) | vert à 820 × 1180 | `daDeLaLigne` rendant `undefined` → rouge |
| Sentinelle Vitest | verte | un niveau changé → rouge ; un octet changé → rouge |

**B à 1180 × 820** : les deux modèles préalables se jouent en portrait, puis la fenêtre passe en paysage avant
« Recevoir ». Sous Chromium, en paysage, la Modélisation de « Mettre ta classe en place » rougit sur `main` (#1285).

**Le confinement**, mesuré par B : toutes les clés hors de `demo_*` identiques avant l'entrée et après la sortie, plus un
blob témoin des vraies données et une touche de raccourci personnalisée. Deux nuances :
- les vignettes des trois copies vivent sous `thumbnail_<id>`, sans préfixe. Elles appartiennent à la démo par conception
  (T3 les retire par leurs identifiants), et la remise à neuf les emporte ;
- chez une personne qui n'a jamais annoté, la première annotation pose les raccourcis par défaut (`raccourcisAnnotation`),
  dans la démo comme ailleurs. C'est l'application au premier usage de ses outils, pas le modèle.

### 2.2 La note et la rétroaction des sept évaluations

Banc C, sans rien poser à la main : aux niveaux de Yack Amical, la construction rend **exactement** la note, le niveau, la
portée, la rétroaction et les commentaires par critère que le formulaire a écrits pour lui. L'évaluation de Caribou
Attentionné (deux I), déverrouillée dans le formulaire, est recalculée à la même note, au même niveau et à la même
rétroaction. Les champs sont ceux d'un premier enregistrement (`sauvegarderEvaluation`), relevés le 17 nov.

### 2.3 Les bancs existants, rejoués

| Banc (Chromium) | Branche | `main` | Verdict |
|---|---|---|---|
| `parcours-je-regarde-2026-11-16` | 3/3 | — | vert |
| `parcours-4-recevoir-et-rendre-2026-11-09` | 4/4, après la mise au pas (« Nous faisons ») | — | vert |
| `registre-des-parcours-2026-11-09` | 1/1 | — | vert |
| `parcours-verrou-2026-11-16` | 4/4 avant la réouverture ; retiré ensuite (§5) | — | vert |
| `parcours-3-evaluer-2026-11-09` | 5/5 | — | vert |
| `parcours-3-quatrieme-essai-2026-11-11` | 3/3 | — | vert |
| `deux-temps-modeles-2026-11-13` | 4/5 | B à 1180 × 820 rouge, même signature | rouge de `main` (#1285) |
| `parcours-fleches-2026-11-10` | 7/9 | | deux rouges de `main` : |
| · « sous le zoom au pincement » | rouge | rouge | rouge de `main` |
| · « la poignée : 46 px » | 3 rouges sur 6 | 4 rouges sur 6 | capricieux sur `main` aussi |

Vitest : 932 fichiers, 11 899 essais, verts (le hook de push l'a confirmé), après des retouches d'essais :
`sentinelle-parcours-fleches` compte dix fichiers `parcours-*.js` au lieu de neuf, et le modèle est jugé avec eux ;
`sentinelle-deux-temps-modeles` a un commentaire corrigé (l'assertion, dans son bac à sable, reste vraie).
`deux-temps-modeles` attend maintenant trois boutons à la fin du modèle d'« Évaluer » (« Voir le parcours suivant ») ;
`parcours-4-recevoir-et-rendre` lit « Nous faisons » sur la carte de « Recevoir », qui porte ses deux temps ; la sentinelle
du lot découpe par `tranche()` (cliquet #858).

## 3. Les neuf étapes, pour écrire les vraies bulles

Les textes sont ceux de `TEXTES`, mot pour mot. Tous provisoires. « Confirme » est la première ligne (`confirme`) ; la
ligne orange est la dernière. Tant que le deuxième groupe n'est pas le groupe actif, chaque étape montre le menu des groupes
de l'en-tête et dit : « Choisis le deuxième groupe dans l'en-tête (ce modèle se joue sur lui) ».

**1 · Leurs productions**
- **Écran** : Évaluation › Préparer, la zone de dépôt.
- **Pointé** : rien sur la page, le bouton est dans la bulle ; la bulle évite la zone de dépôt.
- **Geste** : « Remplir », dans la bulle.
- **Avance quand** : la file d'attente n'est plus vide.
- **Vient d'apparaître** : rien encore.
- **Texte** : note « Dans la démo, tu reçois trois copies du deuxième groupe. Rien ne touche à tes données. » ; « Avec ta classe, elles viennent de Léa : tu les télécharges, puis tu les déposes ici » ; consigne « Regarde les copies arriver : touche « Remplir » ».
- **Objectif** (première bulle) : « À la fin de ce parcours, tu seras en mesure de recevoir les productions de tes étudiant·es, de les annoter, de les évaluer et de leur rendre leur rétroaction. »

**2 · Vérifie avant d'importer**
- **Écran** : Évaluation › Préparer, les trois colonnes ; la bulle se pose sous elles.
- **Pointé** : le menu « Production » sous « Inspecteur », puis « Importer », puis « Oui, importer ».
- **Geste** : choisir la production, toucher « Importer », confirmer.
- **Avance quand** : une copie neuve est en stock et l'import est fini.
- **Vient d'apparaître** : les trois copies sous « Originaux » ; sous « Aperçu », chacune avec son étudiant·e trouvé·e par le DA de son nom.
- **Texte** : confirme « C'est fait : les trois copies sont dans la zone. Rien n'est encore importé. » ; « Sous « Originaux », les trois copies, une page chacune » ; « Sous « Aperçu », chaque copie a trouvé son étudiant·e par le DA de son nom » ; consigne « Sous « Inspecteur », choisis la production « Appliquer des stratégies de lecture variées (Deux-Rives) » », puis « Touche « Importer », puis « Oui, importer » ».

**3 · La liste**
- **Écran** : Évaluation › Liste.
- **Pointé** : le menu « Actions… » de la ligne de Loutre Enjouée, amené dans la vue de côté.
- **Geste** : « Actions › Annoter ».
- **Avance quand** : la copie de Loutre Enjouée est ouverte en annotation.
- **Vient d'apparaître** : trois lignes « Importé » (Loutre Enjouée, Tapir Doux, Antilope Vaillante) et sept lignes évaluées.
- **Texte** : confirme « C'est fait : les trois copies sont importées. » ; « Loutre Enjouée, Tapir Doux et Antilope Vaillante : « Importé » » ; « Les sept autres sont déjà évalué·es par l'exemple, sans copie » ; consigne « Sur la ligne de Loutre Enjouée, touche « Actions › Annoter » ». Si une autre copie est ouverte : « Ce modèle travaille la copie de Loutre Enjouée : reviens à la Liste et ouvre la sienne. »

**4 · Tes tampons**
- **Écran** : Évaluation › Annoter, la palette « Tampons », puis la fenêtre « Rétroactions — Observations ».
- **Pointé** : l'engrenage de la palette, puis « Annuler ».
- **Geste** : ouvrir, lire, fermer sans enregistrer (§4.1).
- **Avance quand** : la fenêtre a été ouverte, puis refermée.
- **Vient d'apparaître** : la copie de Loutre Enjouée, une page.
- **Texte** : confirme « C'est fait : la copie de Loutre Enjouée est ouverte. » ; « La palette « Tampons » : chaque tampon posé ajoute sa phrase à la rétroaction » ; consigne « Touche l'engrenage de la palette « Tampons » », puis « Lis les phrases, puis touche « Annuler » (avec ta classe, tu les réécris et tu touches « Enregistrer ») ».

**5 · Annoter**
- **Écran** : Évaluation › Annoter.
- **Pointé** : « Annoter ▾ », puis « Évaluer » dans son menu.
- **Geste** : annoter au choix, puis passer en mode Évaluer.
- **Avance quand** : le mode Évaluer est ouvert.
- **Vient d'apparaître** : rien de neuf.
- **Texte** : confirme « C'est fait : tu as vu tes tampons. » ; « Annote comme tu veux : souligne, écris dans la marge, pose des tampons » ; consigne « Quand tu as fini, touche « Annoter ▾ » », puis « Choisis « Évaluer » ».

**6 · Évaluer**
- **Écran** : Évaluation › Annoter, mode Évaluer, palette « Évaluation ».
- **Pointé** : le premier critère encore sans niveau.
- **Geste** : un niveau par critère, au choix.
- **Avance quand** : chaque critère a son niveau, sans chargement en cours, état tenu environ une seconde (§4.2).
- **Vient d'apparaître** : la grille, l'échelle et la cartouche déjà choisies (celles de la production).
- **Texte** : confirme « C'est fait : tu es en mode Évaluer. » ; « La grille, l'échelle et la cartouche sont celles de la production » ; consigne « Choisis un niveau pour chaque critère, celui que tu veux ».

**7 · Ta rétroaction**
- **Écran** : le même, palette « Rétroaction ».
- **Pointé** : le cadenas « Verrouiller ».
- **Geste** : relire, verrouiller.
- **Avance quand** : une évaluation neuve est verrouillée.
- **Vient d'apparaître** : la rétroaction de Loutre Enjouée, avec les phrases de la cartouche.
- **Texte** : confirme « C'est fait : chaque critère a son niveau. » ; « La palette « Rétroaction » : ce que Loutre Enjouée lira » ; « « Générale » : les phrases de la cartouche ; « Spécifique » : celles de tes tampons » ; consigne « Relis, puis touche le cadenas « Verrouiller » ».

**8 · Rends tes rétroactions**
- **Écran** : Évaluation › Exporter, la carte « Export Léa ».
- **Pointé** : le menu « Production », puis « Exporter pour Léa ».
- **Geste** : choisir la production (« — Tous — » laissé), exporter.
- **Avance quand** : le ZIP est téléchargé.
- **Vient d'apparaître** : la carte d'export ; son compteur.
- **Texte** : confirme « C'est fait : l'évaluation est verrouillée. » ; « Huit évaluations verrouillées : celle de Loutre Enjouée et les sept de l'exemple » ; « Chacun·e reçoit un PDF : sa copie annotée et sa synthèse, ou sa synthèse seule » ; consigne « Choisis la production « … », et laisse « — Tous — » », puis « Touche « Exporter pour Léa » ».

**9 · Remets-les**
- **Écran** : le même ; la bulle au centre.
- **Pointé** : rien.
- **Geste** : une suite.
- **Avance quand** : (fin).
- **Vient d'apparaître** : le ZIP téléchargé (huit PDF).
- **Texte** : confirme « C'est fait : le ZIP est téléchargé. » ; « Avec ta classe, tu déposes ce ZIP dans Léa : chaque PDF rejoint l'étudiant·e dont il porte le DA » ; « Objectif atteint : tu es en mesure de recevoir les productions de tes étudiant·es, de les annoter, de les évaluer et de leur rendre leur rétroaction. » (moteur) ; consigne « Touche « Le refaire avec ma classe », ou « Terminer » ».

Le libellé du bouton de matériel de l'étape 1 est « Remplir » (provisoire, `ParcoursClasse.mots.remplir`). Le refus du
panneau, provisoire aussi : « Commence par la Modélisation d'« Évaluer une première production » : ce modèle reçoit les
copies de la production qu'on y crée. »

## 4. Ce que j'ai décidé ou supposé (à corriger en dix secondes)

1. **Étape 4, « Annuler » au lieu d'« Enregistrer »** (écart à la consigne, §2 étape 4). Mesuré : « Enregistrer », dans la
   fenêtre des tampons, écrit quatorze clés globales (`retroactionsObservations`, `tamponsPersonnalises`,
   `personnalisationObservations`, `ordreAutocollants_*`…). Ce sont les réglages réels de la personne, partagés entre ses
   trimestres, sans espace propre à la démo. La consigne interdit toute écriture hors de `demo_*`. **Question pour
   Grégoire** : garder « Annuler », ou donner aux réglages des tampons un espace de démo pour que le modèle puisse faire
   toucher « Enregistrer » ? Le second est un autre chantier.
2. **Étape 6, plus ferme que le parcours.** Au passage en mode Évaluer, l'évaluation de la copie ouverte garde un temps
   les niveaux de la dernière copie ouverte, ici celle de Yack Amical. Mesuré : de 100 ms à plus de 360 ms ; une passe sur
   trois avançait sans aucun niveau choisi. Le modèle exige aucun chargement en cours et neuf passages de la sonde. **La garde
   du parcours réel** (trois passages, `tenu`) a la même faiblesse quand une autre copie a été ouverte juste avant.
   Disposition : *commenter et continuer* (non vécu, hors du lot ; noté dans `js/parcours-recevoir-modele.js`).
3. **Tapir Doux et « Lire ta classe »** : il reste importé, sans évaluation. Pour poser la sienne (D, I, I, I), le modèle
   suivant peut appeler la même construction : `ParcoursRecevoirModele.evaluationDeLExemple('9900005', ['D', 'I', 'I', 'I'])`
   rend l'évaluation sans l'écrire, avec la même note et la même rétroaction que le formulaire. Il l'ajoute ensuite à la
   démo, sans rien remplacer, comme `poserLesEvaluationsDeLExemple`. Rien dans ce lot ne touche Tapir Doux : l'étape 3
   n'avance que sur la copie de Loutre Enjouée.
4. Les champs `statutRemise: 'recu'` et les options d'affichage toutes cochées : ceux que le formulaire a écrits pour Yack.
5. Les noms de fichiers en 2025 (mesure 3.4) : supposition de la consigne, gardée.

## 5. Les parcours rouverts, sur la branche seulement

Un commit isolé, « BRANCHE SEULEMENT », fait trois choses : `PARCOURS_OUVERTS = ['decouvrir', 'classe', 'evaluer',
'recevoir']` (`js/assistance.js`), et le retrait de la sentinelle et du banc qui jugent le verrou livré
(`sentinelle-parcours-verrou-2026-11-16.test.js`, `parcours-verrou-2026-11-16.spec.js`), comme le lot du 16 nov.
**Avant toute fusion : `git revert` de ce commit**, et rien d'autre. Le harnais des bancs rouvre déjà tout en mémoire.

## 6. L'aperçu

PR en brouillon : https://github.com/bedardg71-codexnumeris/labo-codex/pull/28. Aperçu, annoncé prêt par Netlify (statut
de la PR, 17 nov., 23 h 02 UTC, sur `ec99ac1`) : https://deploy-preview-28--codexnumeris-051225.netlify.app. Non ouvert
depuis le conteneur (Netlify n'y répond pas). CI de la PR : Vitest vert ; Playwright sauté par la décision du workflow.

## 7. Trouvailles

- **`parcours-fleches`, « la poignée »** : capricieux sous Chromium sur `main` aussi (4 rouges sur 6) ; *commenter et
  continuer*, non inscrit.
- **#1285** (inscrit) : sous Chromium, à 1180 × 820, la flèche de l'étape 1 de la Modélisation de « Mettre ta classe en
  place » manque sa cible, sur `main`. Départagé : même signature sur `main` et sur la branche.
- **La fenêtre des tampons en démo** (§4.1) : *question à Grégoire*, non inscrite (non vécue).
- **La garde `tenu` du parcours réel** (§4.2) : *commenter et continuer*.
- **Un nom d'auteur réel sur les copies** (consigne, §6, à Grégoire) : chacune porte « Texte inventé à la manière de
  Sébastien Bérubé, *Rivières-aux-Cartouches* (Perce-neige, 2023) ». Ce n'est pas un nom d'élève, mais la démo est
  publique. Signalé ici, sans y toucher ; à reprendre dans la porte terrain quand elle viendra avec les vrais textes.

---

## Annexe — les six mesures du §3 (avant le code)

Navigateur : Chromium du nuage seulement.

### 3.1 Qui le modèle d'« Évaluer » fait évaluer — ARRÊT

**Mesuré à l'écran** au moyen d'un banc jetable, retiré depuis. Le modèle d'« Évaluer » est joué jusqu'à son étape 4, à 820 × 1180.
`etudiantDeLaLigne()` lit la première ligne visible de la Liste, et la Liste suit son tri.

| Tri de la Liste | Personne désignée |
|---|---|
| par défaut (nom, croissant) | **Yack Amical** (9900007) |
| prénom, croissant | **Antilope Vaillante** (9900006) : l'une des trois copies |
| prénom, décroissant | Yack Amical |
| nom, décroissant | **Antilope Vaillante** |
| DA, croissant | Koala Câlin (9900001) |

Le tri vit en mémoire (`triEvaluationsActuel`, `js/liste-evaluations.js:168`) et revient au tri par nom à chaque
chargement. Il suffit pourtant d'un toucher sur un en-tête de colonne avant l'étape 4 pour que l'évaluation
tombe sur Antilope Vaillante. **L'hypothèse de la consigne (Yack Amical) vaut donc pour le tri par défaut seulement.**

**Proposition (non appliquée)** : le modèle d'« Évaluer » désigne Yack Amical par son DA, quel que soit le tri.
`ligneDeLaListe(productionId, da)` (`js/parcours-evaluer.js:441`) accepte déjà un DA : le changement tient en une ligne
à `etudiantDeLaLigne`. Il touche le modèle d'« Évaluer » : décision de Grégoire.

### 3.2 Comment poser les évaluations fictives

**Mesuré (lecture du code)** : l'application n'offre aucune fonction qui écrive une évaluation hors de l'écran.
`sauvegarderEvaluation` (`js/evaluation-sauvegarde.js:389`) et `sauvegarderEvaluationModifiee` lisent le formulaire :
`_lireChampsDOMSauv` lit les menus, la note affichée (`window.noteCalculeeCourante`), le niveau affiché et la rétroaction
du champ. Les évaluations du pack, elles, s'écrivent directement dans `demo_evaluationsSauvegardees`
(`peuplerNamespace`, `js/demo-namespace.js`).

**Plan retenu, sous réserve de 3.1** : une écriture directe dans `demo_evaluationsSauvegardees`, en démo seulement,
en ajout. Une personne qui a déjà une évaluation pour cette production n'en reçoit pas d'autre. Les champs sont
ceux de `_construireObjetEvaluationSauv`, avec `verrouillee: true`. La rétroaction est assemblée à partir de la
cartouche du modèle. La note doit venir du calcul de l'application et non d'une valeur posée à la main. Ce point
reste à mesurer au moment du code.

### 3.3 Les fichiers dans une page `file://`

**Mesuré (code)** : le pack est déjà livré par une balise de script créée à la demande, avec le jeton du build
(`chargerPackDemarrage`, `js/demo-namespace.js:123`, sentinelle #825). **Choix** : les trois PDF iront dans un script à
part, chargé au bouton de l'étape 1, avec `?v=` + le build et le même patron. Ils ne passeront ni par `index.html` ni
par `fetch`. Poids : 830 Ko, soit environ 1,1 Mo en base64.

### 3.4 Les dates

**Mesuré (code)** : `parserNomFichierLea` (`js/travaux-import.js:128`) lit bien la date du nom de fichier. Elle ne sert
cependant qu'à ordonner les pages d'un même document (`js/travaux-import.js:1380`). Rien ne la conserve, et aucun calcul
de retard ne la consulte. Des noms en 2026 ne causeraient donc aucun retard. **Choix** : déposer quand même les fichiers
sous des noms en 2025 (mêmes jours, mêmes heures), comme la consigne le supposait. C'est cohérent avec la démo A2025 et
ça ne coûte rien. L'image imprimée garde « A2026 ».

**Constaté en chemin** : « Artefact-1 » se normalise en `artefact1` et ne se rattache seul ni à l'« Artefact 1 » du pack
ni à la production du modèle. C'est l'étape 2 qui fait choisir la production, comme prévu.

### 3.5 L'import en démo

**Mesuré (code)** : `validerMagicBytes` s'applique à chaque fichier importé (`js/travaux-import.js:783`). En démo,
les blobs vont dans IndexedDB seulement (T4). « Retirer les copies » (`retirerCopiesDuDemo`) et « Remettre la démo à
neuf » (`remettreDemoANeuf`, qui appelle le retrait) emportent fichiers et vignettes (`thumbnail_<id>`). À vérifier par
le banc de confinement, IndexedDB compris.

### 3.6 « Exporter pour Léa » en démo

**Inférence (lecture du code, pas encore jouée)** : `exporterPourLea` (`js/travaux-archivage.js:490`) produit un PDF
par évaluation verrouillée : la copie annotée suivie de la synthèse pour Loutre Enjouée, la synthèse seule pour les
sept évaluations sans fichier (#1245, « sur papier »). Les huit PDF partent dans un ZIP. Tapir Doux et Antilope
Vaillante, importés sans évaluation, n'en font pas partie. Aucune écriture en base n'apparaît dans `exporterPourLea`.
Le banc de confinement le jugera.

## Trouvaille hors du lot

- Le banc B de `deux-temps-modeles-2026-11-13.spec.js` **rougit sous Chromium, sur `main`, à 1180 × 820**. L'échec se
  produit dans la Modélisation de « Mettre ta classe en place » : `flecheVers`, pointes à plus de 400 px de la cible.
  À 820 × 1180, le même banc est vert. Rien n'a été départagé avec WebKit. **Disposition : inscrire et continuer**,
  noté ici. Ce lot rejouera ce banc, et il faudra départager ce rouge du sien.
