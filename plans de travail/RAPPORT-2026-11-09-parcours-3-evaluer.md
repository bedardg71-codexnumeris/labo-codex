# Rapport : le troisième parcours, « Évaluer une première production » (9 nov. 2026)

Consigne : `plans de travail/CONSIGNE-LOT-2026-11-08-parcours-3-evaluer.md` (recopiée de `main`, présente sur la branche).
Décisions de Grégoire du 9 nov., 9 h 27 à 9 h 30, en Cowork (six corrections de textes), puis de 13 h 37 à 13 h 42 (les
quatre questions de ce rapport, tranchées : section « Ce qui attend Grégoire »), puis de 15 h 55 à 16 h 00 (l'étape 8,
sur la question 1 du rapport du quatrième parcours), relayées à une session dans le nuage : ni WebKit ni tes données ici. Branche `lot/parcours-3-evaluer`, partie de `origin/lot/parcours-2-ma-classe`,
dans laquelle sont fusionnées `origin/lot/completion-suit-la-remise` (la complétion suit la remise, étendue aux quatre
familles) puis `origin/main` (1.238.0, « Un mot pour ton étudiant·e »). Non fusionnée, non publiée, rien au changelog.

## En tête

### Ce qui est fait (en gestes d'utilisateur)

- Dans le menu, « Assistance » compte maintenant trois parcours. Le panneau montre « Évaluer une première production »,
  troisième et dernier, avec sa ligne (« De ta grille à ta première rétroaction, réécrite avec tes mots. », validée le
  9 nov. à 13 h 37), son état (À faire, Étape n sur 9, Fait) et son bouton (Commencer, Reprendre, Refaire).
- **À l'étape 2, l'échelle va avec la grille** (ta décision de 13 h 37) : la bulle dit « Puis associe-lui la grille que
  tu viens de créer, et son échelle si elle en a une. » ; une fois la grille choisie, le contour passe au menu
  « Échelle » si la grille en a une (celle que Mon matériel a créée avec elle), puis à « Créer la production ». La
  production porte ensuite l'échelle : à l'étape 4, l'écran ne la redemande plus. Laissée vide quand même, l'écran
  d'évaluation la demande, et le contour se pose sur son menu, sans mot de plus. Sur la fiche, la bulle ne couvre
  jamais les menus « Grille de critères d'évaluation » ni « Échelle de performance » (essayé à chaque champ, à 1180 px ;
  capture `p3-2-fiche` refaite).
- Sans classe en place, « Commencer » ne lance rien : le panneau dit, sous le bouton, « Commence par « Mettre ta
  classe en place » : il faut une classe pour évaluer une production. » La démo ouverte ne compte pas : le parcours la
  referme d'abord, comme le deuxième, et se joue sur tes vraies données.
- **À l'étape 8, la cartouche va dans la production** (ta décision de 15 h 55) : la bulle finit par « Puis, dans la
  fiche de ta production, choisis cette cartouche : elle s'y appliquera à chaque évaluation. » L'étape avance quand la
  cartouche est enregistrée **et** nommée par la production (avant : enregistrée seulement). Une fois la cartouche
  créée, le contour passe à l'onglet « Productions », puis au menu « Cartouche » de la fiche (rouverte d'elle-même par
  l'application ; sinon, « Modifier » sur sa ligne). À la sortie du troisième, la production nomme sa grille, son
  échelle et sa cartouche : le quatrième parcours démarre sans rien préparer (essayé de bout en bout, rapport du
  quatrième).
- **Un défaut trouvé sur ce chemin, corrigé** (il cassait l'étape 8) : revenu sur « Productions », le menu
  « Cartouche » d'une fiche restée ouverte gardait la liste du moment où elle s'était ouverte, et n'offrait pas la
  cartouche créée entre-temps (mesuré : « Aucune » seulement). Il se refait maintenant au retour, en gardant le choix
  en cours (`js/productions.js`, `rafraichirCartouchesDeLaFiche`). Vrai aussi hors du parcours.
- Les neuf bulles, avec tes six corrections du 9 nov. posées mot pour mot ; la bulle du choix (« des points / des
  niveaux ») paraît d'elle-même quand Mon matériel pose la question, au même rang (1 sur 9).
- Chaque étape avance quand la donnée est enregistrée : la grille créée, la production enregistrée, « Consignes
  transmises » cochée avec sa date, l'évaluation verrouillée, la pratique créée, puis appliquée au cours actif, la
  cartouche enregistrée. L'étape 7 attend « Continuer », la 9, « Terminer » (sans « Plus tard »).
- « Plus tard » ferme la bulle ; le panneau dit « Étape n sur 9 » et « Reprendre » ; rien ne se rouvre de lui-même, même
  après un rechargement. Ce qui existait déjà à « Commencer » (une grille, une production, une pratique) ne fait pas
  avancer le parcours.
- Dans Mon matériel, « Taper ma grille à la main » s'appelle « Partir de zéro ». Il n'était nommé nulle part ailleurs
  (l'Aide ne le nomme pas ; son infobulle dit « Mène à Grilles… », inchangée).
- **Le défaut de la cartouche en points est corrigé** : sur une grille en points, la cartouche choisie ajoute le
  commentaire de son palier. Le moyen, en une ligne : choisie **au menu, par toi**, une cartouche pose son échelle sur
  l'évaluation quand aucune n'y est choisie (jamais à la place d'une échelle choisie ; jamais à l'ouverture d'une copie).
- **Le rappel « Mets ton codex à jour » ne s'ouvre plus en plein parcours.** Le moyen, en une ligne : s'il est dû, il
  attend la fin du parcours, puis le délai habituel ; c'est le code exact du parcours 6 (même fichier, même texte), pour
  que la fusion n'en garde qu'un.
- **Le premier trimestre sème maintenant le matériel de départ** (la grille, l'échelle et la cartouche de départ), comme
  la bascule d'un trimestre à l'autre le faisait déjà. Avant, sur un espace neuf, l'« Échelle de départ (IDME) »
  n'existait qu'au rechargement suivant : d'une traite, une grille en points n'avait aucune échelle pour sa cartouche, et
  l'étape 8 était bloquée (« Tu dois d'abord créer au moins une échelle… »). Corrigé parce que cela cassait le parcours
  livré (relecture neuve, section 8).
- **Un second défaut, trouvé sur le même chemin, est corrigé** (il cassait l'étape 4) : une grille à niveaux, une
  production qui ne nomme pas d'échelle, deux échelles au trimestre (la tienne et celle de départ) : l'écran
  d'évaluation dit « Choisis maintenant une échelle de performance : sans elle, les critères ne peuvent pas
  apparaître ». Une fois l'échelle choisie, les critères ne paraissaient pas (seul le choix de la grille les dessinait).
  Ils paraissent maintenant.

### Ce qui attend Grégoire (une question par ligne, avec ma recommandation)

**Les quatre sont tranchées** (Grégoire, 9 nov., 13 h 37 à 13 h 42, en Cowork) ; ce qui suit garde la question telle
que posée, puis la décision et ce qui en est fait.

1. **La ligne du panneau sous « Évaluer une première production »** : la consigne n'en donne pas ; je n'en ai posé
   aucune (le panneau n'affiche que le titre). *Proposée :* « De ta grille à ta première rétroaction, réécrite avec tes
   mots. » → **Validée mot pour mot. Posée** ; la sentinelle l'exige.
2. **Étape 4, l'échelle à choisir.** Dans le cas le plus courant (une grille à niveaux, et l'échelle de départ présente
   au trimestre), l'écran d'évaluation demande d'abord une échelle ; la bulle n'en dit rien. Le contour se pose sur le
   menu de l'échelle, mais aucun mot ne l'explique. *Recommandation :* à l'étape 2, faire choisir l'échelle avec la
   grille, la bulle devenant « Puis associe-lui la grille que tu viens de créer, et son échelle si elle en a une. » (la
   production la porte ensuite partout). *À défaut,* à l'étape 4 : « Si l'écran te demande une échelle, choisis celle de
   ta grille. » → **Validé : la phrase de l'étape 2. Posée** ; la sentinelle l'exige. Le contour de la fiche passe par
   le menu « Échelle » quand la grille en a une ; l'étape 4 ne la redemande plus. Laissée vide quand même, le contour
   reste sur le menu de l'échelle de l'évaluation, sans mot de plus. Et la bulle ne couvre jamais les menus « Grille »
   ni « Échelle » de la fiche (section 3).
3. **Étape 8 pour une grille en points, sur un espace neuf** (le cas que la consigne demande de décrire) : **corrigé à
   la source**, plus de question. Mesuré avant le correctif : après le deuxième parcours, il n'existait **aucune**
   échelle ; « + Nouvelle cartouche » ouvrait l'alerte « Tu dois d'abord créer au moins une échelle de performance dans
   la section « Échelles de performance » » et rien d'autre. Le premier trimestre sème maintenant l'échelle de départ :
   la bulle 8 tient d'une traite. Si tu supprimes l'« Échelle de départ (IDME) » toi-même, l'écran redit cette alerte ;
   le chemin est alors Conception › Échelles (aucun texte non validé posé). *Une seule chose à savoir :* ce semis vaut
   pour tout le monde, pas seulement pour le parcours (comme à la bascule). Un collègue qui crée son premier trimestre
   trouve tout de suite la grille, l'échelle et la cartouche de départ, au lieu de les trouver au rechargement.
   → **Accepté** (Cowork) : le semis reste pour tout le monde.
4. **Les écrans pleine largeur, à juger sur les captures.** Sur la fiche de la production, l'écran d'évaluation et la
   fiche de la cartouche, un voile percé laissait la bulle sans place : le moteur la rangeait au bord, et elle couvrait
   « Verrouiller » ou « Consignes transmises » (mesuré). Sur ces écrans, je retire le voile (« aucun », la règle des
   parcours 8 et 9) et la bulle s'accroche au premier champ à remplir, puis au bouton, et le suit au défilement. Elle
   couvre parfois une partie de la fiche (captures `p3-2-fiche`, `p3-8-fiche`). *Recommandation :* garder ainsi ; si
   c'est trop, une option du moteur (une bulle repliable) serait un lot à part. → **Gardé** (Grégoire, sur les
   captures), sauf sur la fiche de la production : la bulle n'y couvre plus les menus « Grille » ni « Échelle ».

### Ce que je n'ai pas pu vérifier

- **WebKit, l'iPad au doigt** : absents du nuage. Les essais et les captures sont sous **Chromium**. Le verdict WebKit se
  prend sur le Mac.
- **Les captures à 390 px** (étapes 1, 4 et 9, et le panneau), que demande la consigne : non faites ; le relais de cette
  session demandait 1180 px en sombre. À prendre sur le Mac, avec le verdict WebKit.
- **Tes données réelles** : sans objet pour ce parcours (il crée ses propres objets), mais la reprise sur un espace où
  grilles, productions et pratiques existent déjà est jugée sur un banc, pas sur le tien.

## 1. Ce qui est fait, en détail

### 1.1 Le parcours (`js/parcours-evaluer.js`, neuf)

Il s'inscrit au panneau après les deux premiers (script chargé après `parcours-classe.js`), sans toucher au moteur.

| Étape | Où | Ce qui la fait avancer | Contour (où toucher) |
|---|---|---|---|
| 1 Ta grille | Conception › Mon matériel | une grille qui n'existait pas à « Commencer » | la zone de collage ; dans la dissection, « Créer ma grille » ; le choix quand il paraît |
| 2 Ta production | Conception › Productions | une production neuve | « + Nouvelle production », puis le premier champ vide (nom, type, activité, pondération, grille), puis « Créer la production » |
| 3 Tes consignes | la même fiche | `echeancesParGroupe[groupe-cours actif]` : `assignee === true` et une date, enregistrés | la ligne « Consignes transmises » |
| 4 Une première production | Évaluation › Liste, puis l'évaluation | une évaluation de cette production, verrouillée | « Actions… » de la ligne ; puis l'échelle si elle est demandée, le premier critère sans niveau ni points, « Verrouiller » |
| 5 Ta pratique | Conception › Pratiques | une pratique neuve | « + Nouvelle pratique », puis la carte « Partir d'un modèle » (la bulle passe au-dessus de l'assistant à partir de 700 px) |
| 6 L'appliquer | la même page | la pratique désignée du groupe-cours actif a changé depuis « Commencer » (lue par `designerPratiqueActive`) | le menu des pratiques, puis « Appliquer au cours actif », amené dans la vue |
| 7 Le point qui s'allume | Suivi › Groupe | « Continuer » | (la bande de performance éclairée) |
| 8 Ta cartouche | Conception › Cartouches | une cartouche neuve sur la grille du parcours | « + Nouvelle cartouche », puis nom, grille, échelle, puis « Créer la cartouche » |
| 9 Ta rétroaction | Évaluation › Liste, puis l'évaluation | « Terminer » | « Actions… » de la ligne ; « Déverrouiller » ; la cartouche ; « Verrouiller » |

Le repère (`parcoursEvaluer`, une préférence ajoutée à `js/preferences.js`) : à « Commencer », les identifiants des
grilles, productions et pratiques existantes, et la pratique appliquée ; puis ce que le parcours a vu naître. Des
identifiants seulement, rien des données de la personne. « Reprendre » le relit.

### 1.2 Le panneau (`js/assistance.js`, deux ajouts)

- La condition d'entrée (`condition`) : le code exact du parcours 6, pour que la fusion n'en garde qu'un. ⚠ Les parcours
  7 et 8 ont chacun la leur, sous un autre nom (`refus`, `.assistance-parcours-refus`) : à unifier à la fusion.
- Une ligne absente n'est pas écrite (`if (def.ligne)`) : la mienne n'est pas validée.
- Aux étapes 4 et 9, la colonne « Actions » de la Liste est amenée dans la vue : à 1180 px, le tableau dépasse l'écran
  (l'application le dit) et le contour restait hors de vue (vu sur les captures, corrigé le soir du 9 nov.).

### 1.3 Les deux défauts corrigés

- **La cartouche en points** (`js/evaluation-chargement.js`, `_adopterEchelleDeLaCartouche`, appelée par
  `cartoucheSelectionnee`). Sans échelle, `calculerNote` ne déduit aucun niveau des points ; la cartouche, elle, est
  écrite sur une échelle (`cartouche.echelleId`). Choisie, elle la pose sur l'évaluation si aucune n'y est choisie et si
  le menu l'offre. Elle ne remplace jamais une échelle choisie. Une évaluation existante ne change qu'au geste de
  choisir la cartouche.
- **L'échelle choisie après la grille** (`js/evaluation.js`, `changerEchelleEvaluation`). Si les critères attendaient
  l'échelle (aucun champ de critère dessiné, une grille choisie), la choisir les dessine (`chargerGrilleSelectionnee`).
  Sinon, rien ne change (le recalcul d'avant).

- **Le matériel de départ du premier trimestre** (`js/trimestre-v2-init.js`, `creerTrimestreV2` ; la fonction de la
  bascule, `semerMaterielDeDepartApresBascule`, exposée par `js/trimestre-v2-liste.js`). Le premier trimestre ne passait
  pas par la bascule ; il reçoit le même semis, sous les mêmes gardes (rien en trimestre archivé).

Issue nommée : **corriger maintenant** (ils cassaient le parcours livré : les étapes 4, 8 et 9). Source seulement :
les évaluations déjà enregistrées ne changent pas ; une copie en points évaluée sans échelle reste sans commentaire de
palier tant qu'on n'y choisit pas la cartouche de nouveau, au menu. Le semis ne touche que les trimestres créés
désormais (les autres l'ont déjà reçu au rechargement).

⚠ **La cartouche en points, ce que tu dois savoir** : l'échelle posée donne à chaque critère en points un niveau déduit
(par les bornes de l'échelle), que la copie garde. Ces niveaux nourrissent le bilan, le dépistage et les pratiques par
standards. C'est le prix du commentaire de palier que la consigne demande ; il ne vient qu'au geste de choisir la
cartouche.

### 1.4 Le reste

- `css/parcours.css` : la phrase du refus (parcours 6), « sans voile » et la bulle au-dessus d'une fenêtre (parcours 9),
  les mêmes règles mot pour mot.
- `js/modal-backup-reminder.js` : le rappel attend la fin d'un parcours (parcours 6, mot pour mot).
- `index.html` : « Partir de zéro », le script du parcours, les jetons anti-cache (le jour du build de `main`, 1109).
- Les bancs des deux premiers parcours lisent le nombre de parcours au registre (la même retouche que le parcours 6
  pour le premier ; la même idée pour le deuxième, dont le dernier rang n'est plus vide : il passe au troisième).

## 2. Les quatre vérifications de la consigne (« À vérifier avant de poser les textes »)

Faites par la session H sous Chromium (`RAPPORT-2026-11-09-verifications-parcours-3-a-5.md`, branche
`mesure/verifications-parcours-3-a-5`) ; tes corrections du 9 nov. y répondent. Ce que ce lot y ajoute :

- **Étape 4** (« chaque critère de ta grille, avec ce que tu lui attribues ») : **tient**, mesuré dans le banc : à
  niveaux, « Critère 1 (…) — S » ; en points, « Critère 1 (…) — 4 / 5 », puis le texte de la tranche.
- **Étape 5** (« + Nouvelle pratique », « Partir d'un modèle », « Modèle sommatif », « la moyenne ») : **tient**, gestes
  faits par le banc ; le modèle s'appelle `SOM-litterature` dans le code et « Modèle sommatif » à l'écran.
- **Étape 6** (« elle n'en calcule aucune ») : **tient** (la session H l'a mesuré ; le banc vérifie qu'aucune pratique
  n'est appliquée avant le geste). Plusieurs cours et le partage : la session H les a mesurés, rien à ajouter.
- **Étape 9** (« Actions › Consulter », « Déverrouiller », la cartouche, « Un mot pour ton étudiant·e », verrouiller) :
  **tient**, chaque geste fait par le banc ; la rétroaction se réécrit au choix de la cartouche, dans les deux variantes
  (en points, grâce au correctif). « Recevra sa rétroaction de la même façon » : tient pour la même production (la
  cartouche est reprise pour l'étudiant·e suivant·e, mesuré par la session H).
- **Trouvée en plus** : la question 2 (l'échelle à l'étape 4) et la question 3 (l'étape 8 sans échelle).

## 3. Les essais

- **Vitest, une sentinelle de la cartouche en points** : `tests/unit/sentinelle-cartouche-pose-son-echelle-2026-11-09.test.js`,
  4 essais : un chargeur ne pose aucune échelle ; le geste pose celle de la cartouche ; jamais à la place d'une échelle
  choisie ; jamais une échelle absente du menu. Break-tests, chacun rouge puis rétabli : la garde du geste, la garde de
  l'échelle choisie, l'appel lui-même.
- **Vitest, une sentinelle neuve** : `tests/unit/sentinelle-parcours-evaluer-2026-11-09.test.js`, 15 essais. Elle
  charge le parcours et lit ses textes **à l'exécution** ; chaque texte est comparé au texte de la consigne auquel on
  applique les six corrections, et chaque correction doit trouver dans la consigne la phrase qu'elle remplace. La bulle
  du choix, la phrase du refus, « Plus tard », « Continuer », « Terminer », la ligne du panneau, « Partir de zéro ».
  Break-test : « la moyenne de tes travaux » remis en « la somme » dans le parcours → rouge (étape 5), rétabli. Après
  les décisions de 13 h 37 : la phrase de l'étape 2 entre dans ses corrections, et la ligne est exigée mot pour mot ;
  break-test, l'une et l'autre retouchées → **rouge** (deux essais), rétablies. Après 15 h 55 : la phrase de l'étape 8
  entre dans ses corrections.
- **Playwright, Chromium, de bout en bout** : `tests/integration/parcours-3-evaluer-2026-11-09.spec.js`, trois essais
  (grille à niveaux ; grille à niveaux, l'échelle laissée vide sur la fiche ; grille en points), chacun depuis un espace vide où le deuxième parcours est joué par ses propres
  gestes (`tests/integration/harness/classe-de-banc.js`, neuf, réutilisable pour les parcours 4 et 5) : le panneau sans
  classe (le refus), à faire, en cours, fait ; les neuf étapes ; la bulle du choix ; la production évaluée sur papier ;
  « Plus tard », un rechargement, « Reprendre » à l'étape 3 (essai à niveaux) ; l'essai en points d'une traite, sans
  rechargement ; à chaque étape, le contour au bon endroit et l'étape qui n'avance pas avant la donnée. **3 sur 3 verts.**
  - Après les décisions de 13 h 37 : à chaque champ de la fiche (titre, type, grille, échelle, « Créer la production »),
    la bulle ne couvre ni le menu « Grille » ni le menu « Échelle » ; à niveaux, le contour passe au menu « Échelle »,
    la production enregistrée porte l'échelle, et l'étape 4 ne la redemande pas ; en points, le contour saute le menu.
    Break-tests : les menus retirés de ce que la bulle doit laisser libre → **rouge** (« la bulle ne couvre pas … la
    grille ») ; le menu « Échelle » retiré du parcours de la fiche → **rouge** ; rétablis.
  - Après 15 h 55, à l'étape 8 : la cartouche créée ne fait pas avancer l'étape (lu après deux passages réels de la
    sonde) ; le contour sur l'onglet « Productions », puis sur le menu « Cartouche », que la bulle ne couvre pas, pas
    plus que les menus « Grille » et « Échelle » ; le menu offre la nouvelle cartouche ; la production la nomme.
    Break-tests : la condition remise à « enregistrée seulement » → **rouge** ; le rafraîchissement du menu retiré →
    **rouge** (le menu n'offre qu'« Aucune »), rétablis. ⚠ Une fois, ce dernier break-test a rougi plus loin (étape 9)
    au lieu du menu : le menu avait été refait par un autre chemin que je n'ai pas identifié ; relancé avec un
    diagnostic, il rougit bien sur le menu. Et une fois, l'essai « en points » a raté avec les captures, sans que je
    voie l'erreur ; non reproduit en dix passages ensuite (quatre « en points », six des trois essais). Cause inconnue :
    à surveiller au Mac.
  - Break-test du semis du premier trimestre : neutralisé → **rouge** (étape 8 en points, aucune échelle), rétabli.
  - Break-test de la cartouche en points : l'appel à `_adopterEchelleDeLaCartouche` retiré → **rouge** (le commentaire
    absent de la rétroaction, essai « en points »), rétabli.
  - Break-test de l'échelle choisie après la grille : le correctif neutralisé → **rouge** (aucun critère, essai
    « échelle laissée vide » : depuis 13 h 37, c'est le seul chemin où l'écran demande l'échelle), rétabli.
- **Les bancs voisins**, Chromium : `parcours-1-et-2`, `parcours-2-ma-classe`, `materiel-dissection-1` : 11 sur 12. Le
  rouge (« panneau : titre, phrase… », largeur 429,99994 px au lieu de 430) l'est aussi **sans ce lot** (mesuré en
  retirant mes changements) : un arrondi de Chromium, sans rapport. À juger sous WebKit au Mac.
- **Vitest entier** (depuis `tests/`) : 898 fichiers, **10 964 essais, tous verts** après les suites de la relecture.
- **Les specs qui créent un trimestre** (le semis), Chromium : 19 sur 19. Celles du semis (`triptyque-seme-produit-une-note`,
  `suppression-par-trimestre-683`, `echelle-depart-prestructurel-1152`) et le banc du deuxième parcours : verts.

## 4. Hypothèses que j'ai prises seul (à corriger en dix secondes si elles sont fausses)

- « Une classe en place » : un groupe-cours actif réel avec au moins un·e étudiant·e ; un service d'orthopédagogie ne
  compte pas (comme aux parcours 8 et 9). Démo ouverte : le pointeur réel gardé par la démo suffit au panneau ; la démo
  se referme au lancement, et sans classe réelle, le panneau se rouvre et dit la phrase du refus.
- L'étape 6 avance quand la pratique appliquée au groupe-cours **change** depuis « Commencer » (n'importe laquelle, pas
  forcément celle créée à l'étape 5).
- L'étape 2 avance sur la production enregistrée, comme le dit la consigne, même sans grille associée (le contour
  désigne la grille avant « Créer la production »).
- « Terminer », à l'étape 9, est offert dès l'arrivée (la consigne : « Bouton « Terminer » »).
- Pas de voile sur les écrans pleine largeur (question 4, gardé le 9 nov.).
- L'échelle d'une grille, c'est celle que portent ses descripteurs (`criteres[].descripteurs.echelleId`, posée par Mon
  matériel quand la grille a des niveaux ; l'éditeur ne pose pas d'`echelleId` sur la grille elle-même). Une grille en
  points n'en a pas : le contour saute le menu « Échelle » (mesuré dans l'essai « en points »). Si le menu n'offre pas
  cette échelle, le contour ne s'y pose pas. ⚠ La sentinelle `bareme-1-editeur` (I.b) liste les modules qui lisent
  `descripteurs` (aucun module de calcul ne doit le faire) : `parcours-evaluer.js` y est inscrit, avec son motif (il
  ne lit que `echelleId`, pour poser un contour, et ne calcule rien).

## 5. À inscrire au BACKLOG

Les trois que la consigne demande d'inscrire, sans les faire :
- La bande C affiche « tendance très forte » avec r(C↔P) = 0,996, calculé sur trois copies (la session H l'a vue à 1,000
  dès une évaluation).
- L'infobulle de l'aperçu de « Préparer le PDF » dit « Choisis la grille et l'échelle, puis prévisualise », alors que
  rien n'est à choisir depuis la fiche d'une production qui a sa grille et son échelle.
- Le PDF exporté avec les consignes s'appelle encore « analyse-1-grille.pdf ».

Vus par ce lot (issue proposée : inscrire et continuer) :
- L'échelle de départ et la grille de départ ne sont pas semées à la création du premier trimestre (déjà relevé par la
  session H ; ici, la conséquence mesurée sur l'étape 8, question 3).
- ~~La bulle couvre une partie des fiches pleine largeur (question 4) : une option « bulle repliable » du moteur.~~
  Gardé tel quel par Grégoire (9 nov., 13 h 37) : rien à inscrire.
- Les conditions d'entrée des parcours 6, 7 et 8 portent trois noms (`condition`, `refus`) : à unifier à la fusion.

## 6. Captures (Chromium, 1180 px, sombre)

`plans de travail/captures-2026-11-09-parcours-3-evaluer/`, prises par le banc (`CAPTURES_PARCOURS=<dossier>`), deux
variantes (`-niveaux`, `-points`), toutes refaites après les décisions de 13 h 37, plus quatre de l'essai « échelle
laissée vide » (`p3-2-fiche-…`, `p3-2-fiche-echelle-…`, `p3-4-…`, `p3-4-evaluation-…`, suffixe `-echelle-vide`) :
- le panneau : `panneau-…-sans-classe` (le refus), `-a-faire`, `-en-cours` (« Étape 3 sur 9 », « Reprendre »), `-fait` ;
- l'étape 8, après 15 h 55 : `p3-8-onglet` (le contour sur « Productions ») et `p3-8-production` (le menu
  « Cartouche » de la fiche, la bulle au-dessus, les trois menus libres) ;
- chaque étape : `p3-1` (l'accueil de Mon matériel), `p3-1-choix` (la bulle du choix), `p3-2`, `p3-2-fiche-echelle`
  (à niveaux : le contour sur le menu « Échelle ») et `p3-2-fiche` (la bulle à gauche des menus « Grille » et
  « Échelle »), `p3-3`,
  `p3-4` (la Liste) et `p3-4-evaluation`, `p3-5` et `p3-5-assistant`, `p3-6` et `p3-6-fiche`, `p3-7`, `p3-8` et
  `p3-8-fiche`, `p3-9` (la Liste) et `p3-9-reecrite` (la rétroaction réécrite, « Un mot » rempli) ;

## 7. Relecture par un agent neuf

Voir la section 8.

## 8. La relecture neuve et ce que chaque réserve est devenue

Un sous-agent qui n'avait vu ni mon raisonnement ni ce rapport a reçu la consigne, les règles et le diff `8dd37fb1..e38b4d0d`.
Verdict, en une ligne : **« À reprendre »** (les textes et la mécanique tiennent ; l'étape 8 en points se bloquait d'une
traite, et le correctif de la cartouche écrivait sans geste). Toutes ses réserves portaient sur mon propre lot : finies,
pas inscrites.

1. **L'étape 8 bloquée en points, sans rechargement** (mon banc rechargeait à l'étape 3 et ne le voyait pas) : vrai. Corrigé
   à la source (le semis du premier trimestre, 1.3) ; l'essai en points se joue d'une traite ; break-test rouge.
2. **Le correctif de la cartouche agissait aussi sans geste** (les chargeurs, `poserCartoucheParChargeur`) : vrai, et grave
   (il écrivait des niveaux dans une copie déjà évaluée, contre #941 D1). Il n'agit plus qu'au geste du menu
   (`choisirCartoucheEval`, hors chargeur). Sentinelle neuve, trois break-tests.
3. **« Reprendre » à l'étape 1 refaisait le repère** : vrai. La reprise se lit sur l'état du parcours (« en cours »), plus
   sur le rang de l'étape.
4. **L'étape 8 pouvait avancer sans cartouche neuve** (le repère ne couvrait que la grille née à l'étape 1) : vrai. Le
   repère couvre maintenant les cartouches de toutes les grilles, à « Commencer ».
5. **Le banc ne prouvait pas assez** :
   - (a) la notification « Cette cartouche n'est pas encore créée » couvrait le bouton du menu (rouge sans captures) : le
     banc les retire avant d'ouvrir le panneau. Elle paraîtra aussi chez une personne qui suit la bulle 8 dans son ordre :
     c'est l'avertissement voulu par le lot E1 (« Ce que tu tapes n'est gardé qu'à l'écran »), sans conséquence ;
   - (b) « pas avant le verrou » : mesuré, une évaluation neuve n'est pas enregistrée avant « Verrouiller » (rien en stock
     après quatre secondes) ; le banc le vérifie. La garde `verrouillee === true` vaut pour une copie déverrouillée ; elle
     n'a pas d'essai à elle ;
   - (c) la garde « jamais à la place d'une échelle choisie » : couverte par la sentinelle neuve ;
   - (d) 390 px : non fait (le relais demandait 1180 px), à prendre sur le Mac.
6. **Démo ouverte, aucune vraie classe** : le panneau se rouvrait sans rien dire. Il se rouvre et dit la phrase du refus.
7. **L'échelle choisie après la grille** pouvait refaire le menu des cartouches d'une copie « Non reçu » : le redessin ne
   vaut plus que si les critères attendent l'échelle (le texte d'attente posé, une copie reçue), et la cartouche choisie
   est gardée.

Les textes : conformes (15 sur 15). Sécurité : aucun `innerHTML`, aucun gestionnaire en ligne, aucun `console.log`.
