# Porte terrain iPad : « La dissection sur l'iPad »

Lot `lot/dissection-ipad`, 12 nov. 2026, partie de `main` (`271dc9177`, la 1.243.0). Mandat : relais de la
conversation du Projet, 12 nov., 6 h 35. Rapport : `plans de travail/RAPPORT-2026-11-12-dissection-ipad.md`.

**État : PASSÉE le 12 nov., de 9 h 58 à 11 h 23, menée dans la conversation du Projet, sans artefact** (un geste par
tour). Réussis : 0.1, 0.2, 2.1 a-b, 2.2 a-c, 2.3 a-c, 2.4 a-b, 2.5 a, 2.6 a. Décisions du §3 : 3.1 à 3.3 validées ; 3.4
à 3.7 vues en contexte, sans objection, elles partent telles quelles. Huit corrections demandées (relais de 11 h 25),
faites sur la même branche, puis la section « Après correction » **passée le 12 nov., de 12 h 20 à 13 h 07** (dans la
conversation du Projet, sans artefact) : C.1 à C.8 réussis. Une correction de plus (relais de 13 h 10, la bulle bloquée
aux deux tiers gauches de l'écran) : la section « Après correction 2 » **passée le 12 nov., de 14 h 28 à 14 h 31**
(dans la conversation du Projet, sans artefact) : D.1, D.2 et D.3 (ajouté par la conversation) réussis. **Porte close ;
le lot part dans la release du 12 nov.**

Pourquoi une porte, alors que la règle est de ne pas en faire pour le confort : ce que tu as vécu le 11 nov. (la
liste qui ne montrait pas qu'elle défile, le doigt qui posait des étiquettes en voulant défiler) n'existe que sous
un vrai doigt, sur l'iPad. Les bancs WebKit du Mac mesurent tout le reste (relevé au rapport) ; ici, seulement ce
qu'aucune machine ne peut trancher, **un geste par tour**, comme tu l'as demandé.

Rien de tout cela n'écrit dans tes trimestres : l'aperçu a son propre espace, vide, à part de
`app.codexnumeris.org`. Ce qui échoue devient un item de backlog avec son numéro de porte.

---

## §0 · Préalable

- [x] **0.1** Sur l'iPad, dans Safari, ouvre l'aperçu `https://deploy-preview-21--codexnumeris-051225.netlify.app`,
  recharge, et lis le numéro en bas de l'accueil.
  ⮕ Attendu : 1.243.0, build 1112-0755. Sinon, recharge, ou attends que Netlify ait fini de publier.
  `iPad`
- [x] **0.2** Mets ta classe en place sur l'aperçu (Assistance › « Mettre ta classe en place »), avec des noms
  inventés.
  ⮕ Attendu : « Évaluer une première production » offre « Commencer ».
  `iPad`

---

## §1 · Données

Rien. L'exemple n'écrit rien ; l'aperçu est un espace d'essai.

---

## §2 · Interface — un geste par tour

*Menée dans la conversation du Projet, sans artefact, le 12 nov. de 9 h 58 à 11 h 23 : toutes réussies.*

### 2.1 La liste des étiquettes montre qu'elle défile

> **Pourquoi.** Le 11 nov., la liste commençait à « Code » sans que rien dise qu'il y avait toutes les étiquettes de
> la grille au-dessus.

- [x] **2.1 a** Dans Conception › Apporter mon matériel, touche « Essayer avec un exemple ».
  ⮕ Attendu : la liste commence à « Titre » ; en bas d'elle, une pastille « ▼ N étiquettes plus bas ».
  `iPad`
- [x] **2.1 b** Fais défiler la liste jusqu'en bas, puis touche « Coller une autre grille », puis de nouveau « Essayer
  avec un exemple ».
  ⮕ Attendu : en défilant, « ▲ N étiquettes plus haut » paraît en haut ; rouverte, la liste recommence à « Titre ».
  `iPad`

### 2.2 Défiler au doigt ne pose aucune étiquette

> **Pourquoi.** Le 11 nov., un surligneur en main, un doigt posé sur la grille pour la faire défiler surlignait.

- [x] **2.2 a** Prends « Critère », puis fais défiler la grille d'un glissé du doigt, en partant d'un morceau.
  ⮕ Attendu : la grille défile ; aucun morceau ne se colore.
  `iPad`
- [x] **2.2 b** Touche un morceau (poser, lever, sans glisser).
  ⮕ Attendu : il prend la couleur de « Critère ».
  `iPad`
- [x] **2.2 c** Garde le doigt posé sur un morceau un court instant, puis glisse sur deux autres.
  ⮕ Attendu : les trois se colorent, et la grille ne défile pas pendant ce glisser. (C'est le geste proposé pour
  surligner plusieurs morceaux d'un coup ; ton verdict en §3.1.)
  `iPad`

### 2.3 L'exemple, avant ta grille

> **Pourquoi.** « Un exemple déjà étiqueté » (11 nov., 8 h 47) : voir le travail complet, ou faire l'exercice soi-même.

- [x] **2.3 a** Assistance › « Évaluer une première production » › Commencer, puis « Voir le travail complet ».
  ⮕ Attendu : l'exemple s'ouvre, chaque morceau coloré ; à la place de « Créer ma grille », « C'est l'exemple : il ne
  devient pas une de tes grilles. »
  `iPad`
- [x] **2.3 b** Touche « Faire l'exercice soi-même ».
  ⮕ Attendu : l'exemple se vide ; la ligne orange de la bulle dit de prendre « Titre » ; une flèche et le halo vont à
  « Titre », dans la liste.
  `iPad`
- [x] **2.3 c** Suis la bulle jusqu'au bout de l'exemple, une étiquette à la fois.
  ⮕ Attendu : à chaque manque, la bulle le dit en une phrase et pointe ; à la fin, « L'exemple est étiqueté :
  touche « Passer à ma grille ». »
  `iPad`

### 2.4 L'aide pas à pas sur ta grille

> **Pourquoi.** Le 11 nov., « Poids » posé sur un « / 5 » a fait lire toute la grille comme une liste de codes, et
> l'application réclamait un critère algorithmique.

- [x] **2.4 a** « Passer à ma grille », puis colle une de tes grilles (un tableau de Word ou de Pages) et étiquette
  seulement son titre et ses « / N » en « Pondération ».
  ⮕ Attendu : la bulle dit « « / 5 » n'a aucun critère dans sa rangée : prends « Critère », puis touche
  « … » » (le nom de ta première rangée) ; une flèche vers « Critère », une vers ce morceau ; le halo sur « Critère ».
  `iPad`
- [x] **2.4 b** Pose « Poids » sur un « / N ».
  ⮕ Attendu : la bulle dit que « Poids » sert aux listes de codes, et propose « Pondération » sur ce morceau.
  `iPad`

### 2.5 « Composer ma grille », une sortie toujours visible

- [x] **2.5 a** Dans l'étiquetage, touche « Composer ma grille » (à côté de « Coller une autre grille »).
  ⮕ Attendu : Conception › Grilles ; reviens à Apporter mon matériel : ton étiquetage est là, tel quel.
  `iPad`

### 2.6 Une grille déjà dans l'application

> **Pourquoi.** La capture 35 (11 nov., 15 h 21) : « Test 1 » existait déjà, et l'étape 1 n'avançait pas.

- [x] **2.6 a** Avec une grille déjà créée, lance le parcours, « Passer à ma grille », puis « Prendre une grille déjà
  créée » ; ouvre ta grille dans la liste, puis touche « Prendre cette grille ».
  ⮕ Attendu : le parcours passe à « Ta production ».
  `iPad`

---

## §3 · Décisions — tes verdicts (12 nov., dans la conversation du Projet, sans artefact)

Ce ne sont pas des vérifications : ce sont des choix posés faute de pouvoir les trancher à ta place. Écris ta
réponse, ne coche pas. Tous ces mots sont PROPOSÉS : ils partent tels quels et restent corrigeables.

- **3.1** Le geste au doigt (2.2) : toucher pour poser ; glisser pour défiler ; garder le doigt posé, puis glisser,
  pour surligner plusieurs morceaux. La consigne de l'écran dit encore « glisse dessus pour en surligner plusieurs
  d'un coup » : faut-il la changer pour l'iPad ? Ton verdict : **validé** ; la consigne devient celle de la légende (relais de 11 h 25, point 2), et suit l'appareil
- **3.2** La forme de la liste qui défile : « ▲ N étiquettes plus haut » et « ▼ N étiquettes plus bas », en pastilles
  collées aux bords, qui font défiler la liste quand on les touche. Ton verdict : **validé** ; les pastilles ne couvrent plus aucun nom (point 7)
- **3.3** L'étiquetage complet de l'exemple (« Voir le travail complet ») : la première rangée, Titre puis
  Description ; une rangée de section, Section puis le nom de chaque Niveau (les noms de niveaux répétés de la
  partie B aussi) ; une rangée de critère, le Critère, ses Éléments observables (« · … »), puis dans chaque case la
  réponse en Descripteur et ses points en Points ; la dernière rangée, Total. C'est de la didactique : ton verdict,
  sur capture. **validé**
- **3.4** La bulle de l'exemple : « Avant ta grille, un exemple : une grille fictive, avec deux sections, quatre
  critères et quatre niveaux. Tu peux voir le travail complet, toutes ses étiquettes posées, ou faire l'exercice
  toi-même : la bulle te guide, une étiquette à la fois. Rien ne s'enregistre : l'exemple ne devient pas une de tes
  grilles. Ensuite, tu passes à ta grille. » Ses boutons : « Voir le travail complet », « Faire l'exercice
  soi-même », « Passer à ma grille ». **vue en contexte, sans objection** : part telle quelle
- **3.5** Les phrases de l'aide, une par sorte de manque (liste complète au rapport, « Les phrases de l'aide »).
  **vues en contexte, sans objection** : partent telles quelles (sauf l'ajout du point 3, « Points » sur un « / N »)
- **3.6** Les lignes du geste neuves de « Ta grille » : « Colle ta grille, montre ce qu'est chaque morceau, puis
  touche « Créer ma grille » ; ou touche « Composer ma grille ». » · « Touche « + Nouvelle grille », compose-la, puis
  touche « Créer la grille » ; ou ouvre une de tes grilles. » · « Touche « Prendre cette grille » pour évaluer avec
  la grille ouverte ; ou ouvre-en une autre. » ; et les boutons « Prendre une grille déjà créée », « Prendre cette
  grille ». **vues en contexte, sans objection** : partent telles quelles
- **3.7** La note de l'exemple, à la place de « Créer ma grille » : « C'est l'exemple : il ne devient pas une de tes
  grilles. » ; ses messages : « L'exemple, avec toutes ses étiquettes posées. Il ne s'enregistre pas. » ·
  « L'exemple, sans étiquettes : à toi de les poser. Il ne s'enregistre pas. » **vues en contexte, sans objection** : partent telles quelles

---

## §4 · Ce que la session n'a pas pu vérifier

- **Aucun vrai doigt.** Le banc WebKit simule le doigt (contexte tactile, événements de pointeur « toucher ») : un
  toucher pose, un glisser suivi d'un `pointercancel` ou d'un lever ne pose rien, le maintien puis le glisser
  surligne. Que Safari sur l'iPad fasse réellement défiler la grille au glisser, et la retienne pendant le maintien,
  seule la porte 2.2 le dit.
- **Le maintien puis le glisser (2.2 c)** : si un léger tremblement du doigt pendant le maintien lance le défilement,
  Safari reprend le geste et rien n'est posé. Non mesurable ici.
- **Une vraie grille de Word ou de Pages** : les bancs collent des tableaux fictifs en HTML.
- **Le stylet** suit le geste du doigt ; il n'a pas été essayé.

---

## Après correction — un geste par point, un par tour

**Passée le 12 nov., de 12 h 20 à 13 h 07**, dans la conversation du Projet, sans artefact : C.1 à C.8 réussis. C.6 :
ta grille n'avait encore aucun code, la carte a donc visé « Code » plutôt que « Pondération » ; sa flèche et son halo
sont allés à « ▲ 11 étiquettes plus haut », jamais au-dessus de la légende.

Relais de la conversation du Projet, 12 nov., 11 h 25. Sur l'aperçu `https://deploy-preview-21--codexnumeris-051225.netlify.app`,
rechargé : en bas de l'accueil, 1.243.0, build **1112-1157**. Chaque geste se fait sur l'iPad, en paysage sauf mention.

- [x] **C.1** Conception › Apporter mon matériel : regarde la rangée « Étiqueter le texte ci-dessus · Essayer avec un
  exemple · Composer ma grille ».
  ⮕ Attendu : « Composer ma grille » est un bouton, comme ses deux voisins.
  `iPad`
- [x] **C.2** Touche « Essayer avec un exemple ».
  ⮕ Attendu : au-dessus de la liste des étiquettes, le titre « Légende » ; la consigne dit « Touche une étiquette dans la
  légende. », puis « … garde le doigt posé un instant, puis glisse. » ; nulle part « surligneur » ni « palette ».
  `iPad`
- [x] **C.3** Dans la légende, lis « Pondération » et « Points ».
  ⮕ Attendu : « Sur combien il se note (par ex. « / 10 ») » ; « Ce qu'elle vaut, en chiffres (par ex. « 3 », « 4-5 ») ».
  (Si la légende est trop étroite pour les montrer, choisis l'étiquette : la précision paraît dans le bandeau.)
  `iPad`
- [x] **C.4** Parcours « Évaluer une première production » › « Faire l'exercice soi-même » ; prends « Titre » et touche
  « Journal de lecture », prends « Critère » et touche « L'étudiant·e résume l'œuvre avec justesse », prends « Points »
  et touche « 2 ».
  ⮕ Attendu : la bulle dit de prendre « Descripteur », puis de toucher « Résume quelques événements » (plus
  « · Repérage des événements principaux »).
  `iPad`
- [x] **C.5** Une étiquette posée sur des morceaux (par ex. « Points » sur « 2 »), toujours en main : fais défiler la
  légende du doigt.
  ⮕ Attendu : les flèches de l'étiquette suivent la liste ; sortie du cadre, elles partent de son bord.
  `iPad`
- [x] **C.6** « Passer à ma grille », colle une de tes grilles ; pose « Poids » sur un « / N ». Fais défiler la légende
  jusqu'en bas, reprends « Poids » et touche un autre « / N ».
  ⮕ Attendu : en défilant, la flèche et le halo de la bulle vont à « ▲ … plus haut », jamais au-dessus de la liste ;
  après ton toucher, la légende remonte d'elle-même jusqu'à « Pondération », entière, et la flèche y va.
  `iPad`
- [x] **C.7** Fais défiler la légende de haut en bas, lentement.
  ⮕ Attendu : « ▲ … plus haut » et « ▼ … plus bas » sont au-dessus et au-dessous de la liste ; aucune ne cache le nom
  d'une étiquette ; l'étiquette que la bulle désigne paraît entière, sous la pastille.
  `iPad`
- [x] **C.8** Pose « Points » sur un « / N » de ta grille.
  ⮕ Attendu : la bulle dit que « / N » ressemble au poids d'un critère, et propose « Pondération » sur ce morceau.
  `iPad`

---

## Après correction 2 — un geste par point, un par tour

Relais de la conversation du Projet, 12 nov., 13 h 10 (ton constat de 12 h 54 : « la carte de l'assistance n'est pas
déplaçable vers la droite. Elle semble bloquer au centre. »). Sur l'aperçu
`https://deploy-preview-21--codexnumeris-051225.netlify.app`, rechargé : en bas de l'accueil, 1.243.0, build
**1112-1328**. L'iPad en paysage, posé comme à 12 h 54 ; « Évaluer une première production », étape « Ta grille », une
de tes grilles collée.

**Passée le 12 nov., de 14 h 28 à 14 h 31**, dans la conversation du Projet, sans artefact : D.1 et D.2 réussis, plus
un D.3 ajouté par la conversation, réussi lui aussi. La supposition du rapport (`documentElement.clientWidth` vaut la
largeur de la mise en page sous Safari iPad, zoom ou non) tient donc sur l'iPad de Grégoire.

- [x] **D.1** Regarde où la carte du parcours se pose d'elle-même, sans y toucher.
  ⮕ Attendu : à droite de ta grille, contre le bord droit de l'écran, quand elle y a la place ; elle ne couvre plus le
  milieu de ta grille.
  `iPad`
- [x] **D.2** Glisse la carte par sa poignée (⠿) vers la gauche, puis ramène-la tout à droite.
  ⮕ Attendu : elle va jusqu'au bord droit de l'écran (une marge de quelques pixels), plus seulement jusqu'au milieu.
  `iPad`
- [x] **D.3** *(ajouté par la conversation du Projet)* Pince la grille pour zoomer, la carte à droite, puis reviens à
  la taille normale.
  ⮕ Attendu : la carte ne bouge pas pendant le pincement ; au retour, toujours à droite, et glissable jusqu'au bord.
  `iPad`
