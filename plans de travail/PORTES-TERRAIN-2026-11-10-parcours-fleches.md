# Porte terrain iPad : « Les flèches des parcours »

Lot `lot/parcours-fleches`, 10 nov. 2026. Consigne : `plans de travail/CONSIGNE-LOT-2026-11-09-parcours-fleches.md`.
Rapport : `plans de travail/RAPPORT-2026-11-10-parcours-fleches.md`.

**État : EN ATTENTE. Cette porte ne se fait pas avant que le lot soit fusionné dans `main` et en ligne.**
Tant que la branche n'est que poussée, `https://app.codexnumeris.org` montre encore le voile : tu jugerais la
version d'avant. Cowork remplit la ligne « version attendue » ci-dessous au moment de la mise en ligne, et publie
l'artefact jumeau (avec son bouton « Copier mes résultats »).

Pourquoi une porte, alors que la règle est de ne pas en faire pour l'apparence : le défaut que tu as vécu (les
zones qui ne tombent pas sur les boutons) est sur iPad, et aucune machine d'ici ne peut y répondre. La session du
cloud n'a que Chromium ; le Mac a WebKit, mais ni l'un ni l'autre n'a la barre d'adresse de Safari sur iPad, qui est
la cause supposée. Cinq portes, pas plus. Tout le reste est mesuré par les bancs.

Ce qui échoue devient un item de backlog avec son numéro de porte, pas une note mentale.

---

## §0 · Préalable

- [ ] **0.1** Sur l'iPad, dans Safari, ouvre `https://app.codexnumeris.org`, recharge la page, et lis le numéro en
  bas de page.
  ⮕ Attendu : la version que Cowork écrit ici à la mise en ligne : `__________`. Si le numéro est plus petit,
  arrête-toi : le lot n'est pas encore chez toi.
  `iPad`

Aucune sauvegarde à faire : ces portes se jouent sur la démo et n'écrivent rien dans tes trimestres.

---

## §1 · Données

Rien. Ce lot ne touche à aucune donnée.

---

## §2 · Interface

### 2.1 La pulsation tombe sur le bon bouton, barre d'adresse visible

> **Pourquoi.** Le 9 nov., sur ton iPad, les zones claires des parcours ne tombaient pas sur les boutons et les
> menus qu'elles désignaient. Les zones claires n'existent plus ; ce qui désigne maintenant, c'est un halo orange
> qui pulse et une flèche.

- [ ] **2.1 a** iPad à l'horizontale, **barre d'adresse de Safari visible**. Menu ☰ › Assistance › « Découvrir » ›
  Commencer (ou Refaire). Avance jusqu'à la bulle « Évaluer » (6 sur 8) en faisant les gestes demandés.
  ⮕ Attendu : le halo orange entoure exactement le mot « Conception », en haut. Avant : la zone claire était
  décalée vers le bas.
  `iPad`
- [ ] **2.1 b** Sans quitter l'étape, regarde la flèche qui sort de la bulle.
  ⮕ Attendu : sa pointe s'arrête juste sous le mot « Évaluation », qui est encadré. Elle ne pointe ni dans le
  vide, ni vers « Conception ».
  `iPad`

### 2.2 Même chose, barre d'adresse masquée

> **Pourquoi.** La cause supposée du décalage est la hauteur de la barre d'adresse. Il faut donc voir les deux
> états.

- [ ] **2.2** Toujours à l'étape « Évaluer » : fais disparaître la barre d'adresse (bouton « ᴀA » › « Masquer la
  barre d'outils », ou un petit défilement de la page vers le haut).
  ⮕ Attendu : le halo reste sur « Conception », la pointe de la flèche reste sous « Évaluation ». Rien ne glisse.
  `iPad`

### 2.3 La flèche suit quand la page défile

> **Pourquoi.** Une flèche qui reste en place pendant que la page bouge désignerait autre chose que ce dont la
> bulle parle.

- [ ] **2.3** Reviens au début du parcours (« Quitter le parcours », puis Assistance › Reprendre te ramène à ton
  étape ; ou refais-le) et arrête-toi à la bulle « Ce qui le met à l'écart » (3 sur 8). Fais défiler la page d'un
  doigt, lentement, puis lève le doigt.
  ⮕ Attendu : une fois la page arrêtée, les flèches touchent toujours les cartes « Assiduité » et « Complétion ».
  Pendant le défilement, un léger retard est normal ; ce qui compte, c'est l'arrêt.
  `iPad`

### 2.4 Déplacer la bulle au doigt

> **Pourquoi.** La bulle se posait parfois sur ce que tu voulais lire. Elle a maintenant une poignée ⠿, en haut à
> droite, pour la pousser ailleurs.

- [ ] **2.4 a** À la même étape, pose le doigt sur la poignée ⠿ et glisse la bulle vers le bas de l'écran.
  ⮕ Attendu : la bulle suit ton doigt, la page ne défile pas, et les flèches suivent la bulle.
  `iPad`
- [ ] **2.4 b** Essaie de pousser la bulle hors de l'écran, en haut puis en bas.
  ⮕ Attendu : elle s'arrête sous l'en-tête et au-dessus du bandeau vert « Mode démonstration ». Elle ne sort pas.
  `iPad`

---

## §3 · Décisions — ce qui attend ton verdict

Ce ne sont pas des vérifications : ce sont des choix que la session a posés faute de pouvoir les trancher à ta
place. Écris ta réponse, ne coche pas.

- **3.1** Le nom de la poignée pour le lecteur d'écran : « Déplacer la bulle » (PROPOSÉ). Tu ne le vois pas à
  l'écran ; VoiceOver le lit. Ton verdict : `______________________`
- **3.2** Aux étapes 6 et 7 de « Découvrir », la flèche et la bulle vont maintenant à la section dont la bulle
  parle (« Évaluation », puis « Conception »), et non au prochain bouton. C'est la lecture que la session a faite
  de tes captures ; la consigne écrite donnait l'inverse pour ces deux étapes (voir le rapport, « Ce que j'ai
  supposé »). Est-ce bien ce que tu voulais ? `______________________`
- **3.3** La flèche est-elle assez visible, ou trop ? (épaisseur, longueur) `______________________`

---

## §4 · Ce que la session n'a pas pu vérifier

- **Rien n'a été vu sous WebKit ni sur iPad.** La session du cloud n'a que Chromium. Les bancs sont écrits pour
  WebKit (aucune mesure prise pendant un défilement, cibles tactiles à 46 px), mais ils n'y ont pas tourné.
- **La cause du décalage sur iPad reste une inférence.** Elle a été lue dans le code (une couche en hauteur de
  fenêtre des feuilles de style, des trous calculés sur la hauteur intérieure), jamais mesurée sur l'appareil. Le
  lot retire la couche en cause ; si le décalage persiste aux portes 2.1 ou 2.2, la cause était ailleurs.
- **Le doigt est simulé dans les bancs** (des événements de pointeur de type « toucher »), pas un vrai doigt :
  la porte 2.4 est la seule preuve réelle.
- **Le stylet n'a pas été essayé.**
