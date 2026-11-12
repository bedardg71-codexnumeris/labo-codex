# Porte terrain iPad : « La dissection sur l'iPad »

Lot `lot/dissection-ipad`, 12 nov. 2026, partie de `main` (`271dc9177`, la 1.243.0). Mandat : relais de la
conversation du Projet, 12 nov., 6 h 35. Rapport : `plans de travail/RAPPORT-2026-11-12-dissection-ipad.md`.

**État : OUVERTE, sur l'aperçu de la branche** (pas de fusion avant ton essai sur l'iPad). Cowork publie l'artefact
jumeau, avec son bouton « Copier mes résultats ».

Pourquoi une porte, alors que la règle est de ne pas en faire pour le confort : ce que tu as vécu le 11 nov. (la
liste qui ne montrait pas qu'elle défile, le doigt qui posait des étiquettes en voulant défiler) n'existe que sous
un vrai doigt, sur l'iPad. Les bancs WebKit du Mac mesurent tout le reste (relevé au rapport) ; ici, seulement ce
qu'aucune machine ne peut trancher, **un geste par tour**, comme tu l'as demandé.

Rien de tout cela n'écrit dans tes trimestres : l'aperçu a son propre espace, vide, à part de
`app.codexnumeris.org`. Ce qui échoue devient un item de backlog avec son numéro de porte.

---

## §0 · Préalable

- [ ] **0.1** Sur l'iPad, dans Safari, ouvre l'aperçu `https://deploy-preview-21--codexnumeris-051225.netlify.app`,
  recharge, et lis le numéro en bas de l'accueil.
  ⮕ Attendu : 1.243.0, build 1112-0755. Sinon, recharge, ou attends que Netlify ait fini de publier.
  `iPad`
- [ ] **0.2** Mets ta classe en place sur l'aperçu (Assistance › « Mettre ta classe en place »), avec des noms
  inventés.
  ⮕ Attendu : « Évaluer une première production » offre « Commencer ».
  `iPad`

---

## §1 · Données

Rien. L'exemple n'écrit rien ; l'aperçu est un espace d'essai.

---

## §2 · Interface — un geste par tour

### 2.1 La liste des étiquettes montre qu'elle défile

> **Pourquoi.** Le 11 nov., la liste commençait à « Code » sans que rien dise qu'il y avait toutes les étiquettes de
> la grille au-dessus.

- [ ] **2.1 a** Dans Conception › Apporter mon matériel, touche « Essayer avec un exemple ».
  ⮕ Attendu : la liste commence à « Titre » ; en bas d'elle, une pastille « ▼ N étiquettes plus bas ».
  `iPad`
- [ ] **2.1 b** Fais défiler la liste jusqu'en bas, puis touche « Coller une autre grille », puis de nouveau « Essayer
  avec un exemple ».
  ⮕ Attendu : en défilant, « ▲ N étiquettes plus haut » paraît en haut ; rouverte, la liste recommence à « Titre ».
  `iPad`

### 2.2 Défiler au doigt ne pose aucune étiquette

> **Pourquoi.** Le 11 nov., un surligneur en main, un doigt posé sur la grille pour la faire défiler surlignait.

- [ ] **2.2 a** Prends « Critère », puis fais défiler la grille d'un glissé du doigt, en partant d'un morceau.
  ⮕ Attendu : la grille défile ; aucun morceau ne se colore.
  `iPad`
- [ ] **2.2 b** Touche un morceau (poser, lever, sans glisser).
  ⮕ Attendu : il prend la couleur de « Critère ».
  `iPad`
- [ ] **2.2 c** Garde le doigt posé sur un morceau un court instant, puis glisse sur deux autres.
  ⮕ Attendu : les trois se colorent, et la grille ne défile pas pendant ce glisser. (C'est le geste proposé pour
  surligner plusieurs morceaux d'un coup ; ton verdict en §3.1.)
  `iPad`

### 2.3 L'exemple, avant ta grille

> **Pourquoi.** « Un exemple déjà étiqueté » (11 nov., 8 h 47) : voir le travail complet, ou faire l'exercice soi-même.

- [ ] **2.3 a** Assistance › « Évaluer une première production » › Commencer, puis « Voir le travail complet ».
  ⮕ Attendu : l'exemple s'ouvre, chaque morceau coloré ; à la place de « Créer ma grille », « C'est l'exemple : il ne
  devient pas une de tes grilles. »
  `iPad`
- [ ] **2.3 b** Touche « Faire l'exercice soi-même ».
  ⮕ Attendu : l'exemple se vide ; la ligne orange de la bulle dit de prendre « Titre » ; une flèche et le halo vont à
  « Titre », dans la liste.
  `iPad`
- [ ] **2.3 c** Suis la bulle jusqu'au bout de l'exemple, une étiquette à la fois.
  ⮕ Attendu : à chaque manque, la bulle le dit en une phrase et pointe ; à la fin, « L'exemple est étiqueté :
  touche « Passer à ma grille ». »
  `iPad`

### 2.4 L'aide pas à pas sur ta grille

> **Pourquoi.** Le 11 nov., « Poids » posé sur un « / 5 » a fait lire toute la grille comme une liste de codes, et
> l'application réclamait un critère algorithmique.

- [ ] **2.4 a** « Passer à ma grille », puis colle une de tes grilles (un tableau de Word ou de Pages) et étiquette
  seulement son titre et ses « / N » en « Pondération ».
  ⮕ Attendu : la bulle dit « « / 5 » n'a aucun critère dans sa rangée : prends « Critère », puis touche
  « … » » (le nom de ta première rangée) ; une flèche vers « Critère », une vers ce morceau ; le halo sur « Critère ».
  `iPad`
- [ ] **2.4 b** Pose « Poids » sur un « / N ».
  ⮕ Attendu : la bulle dit que « Poids » sert aux listes de codes, et propose « Pondération » sur ce morceau.
  `iPad`

### 2.5 « Composer ma grille », une sortie toujours visible

- [ ] **2.5 a** Dans l'étiquetage, touche « Composer ma grille » (à côté de « Coller une autre grille »).
  ⮕ Attendu : Conception › Grilles ; reviens à Apporter mon matériel : ton étiquetage est là, tel quel.
  `iPad`

### 2.6 Une grille déjà dans l'application

> **Pourquoi.** La capture 35 (11 nov., 15 h 21) : « Test 1 » existait déjà, et l'étape 1 n'avançait pas.

- [ ] **2.6 a** Avec une grille déjà créée, lance le parcours, « Passer à ma grille », puis « Prendre une grille déjà
  créée » ; ouvre ta grille dans la liste, puis touche « Prendre cette grille ».
  ⮕ Attendu : le parcours passe à « Ta production ».
  `iPad`

---

## §3 · Décisions — ce qui attend ton verdict

Ce ne sont pas des vérifications : ce sont des choix posés faute de pouvoir les trancher à ta place. Écris ta
réponse, ne coche pas. Tous ces mots sont PROPOSÉS : ils partent tels quels et restent corrigeables.

- **3.1** Le geste au doigt (2.2) : toucher pour poser ; glisser pour défiler ; garder le doigt posé, puis glisser,
  pour surligner plusieurs morceaux. La consigne de l'écran dit encore « glisse dessus pour en surligner plusieurs
  d'un coup » : faut-il la changer pour l'iPad ? Ton verdict : `__________`
- **3.2** La forme de la liste qui défile : « ▲ N étiquettes plus haut » et « ▼ N étiquettes plus bas », en pastilles
  collées aux bords, qui font défiler la liste quand on les touche. Ton verdict : `__________`
- **3.3** L'étiquetage complet de l'exemple (« Voir le travail complet ») : la première rangée, Titre puis
  Description ; une rangée de section, Section puis le nom de chaque Niveau (les noms de niveaux répétés de la
  partie B aussi) ; une rangée de critère, le Critère, ses Éléments observables (« · … »), puis dans chaque case la
  réponse en Descripteur et ses points en Points ; la dernière rangée, Total. C'est de la didactique : ton verdict,
  sur capture. `__________`
- **3.4** La bulle de l'exemple : « Avant ta grille, un exemple : une grille fictive, avec deux sections, quatre
  critères et quatre niveaux. Tu peux voir le travail complet, toutes ses étiquettes posées, ou faire l'exercice
  toi-même : la bulle te guide, une étiquette à la fois. Rien ne s'enregistre : l'exemple ne devient pas une de tes
  grilles. Ensuite, tu passes à ta grille. » Ses boutons : « Voir le travail complet », « Faire l'exercice
  soi-même », « Passer à ma grille ». `__________`
- **3.5** Les phrases de l'aide, une par sorte de manque (liste complète au rapport, « Les phrases de l'aide »).
  `__________`
- **3.6** Les lignes du geste neuves de « Ta grille » : « Colle ta grille, montre ce qu'est chaque morceau, puis
  touche « Créer ma grille » ; ou touche « Composer ma grille ». » · « Touche « + Nouvelle grille », compose-la, puis
  touche « Créer la grille » ; ou ouvre une de tes grilles. » · « Touche « Prendre cette grille » pour évaluer avec
  la grille ouverte ; ou ouvre-en une autre. » ; et les boutons « Prendre une grille déjà créée », « Prendre cette
  grille ». `__________`
- **3.7** La note de l'exemple, à la place de « Créer ma grille » : « C'est l'exemple : il ne devient pas une de tes
  grilles. » ; ses messages : « L'exemple, avec toutes ses étiquettes posées. Il ne s'enregistre pas. » ·
  « L'exemple, sans étiquettes : à toi de les poser. Il ne s'enregistre pas. » `__________`

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
