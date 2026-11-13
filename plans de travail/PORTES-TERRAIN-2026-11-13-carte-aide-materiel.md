# Porte terrain iPad : « La carte d'aide dans Apporter mon matériel »

Lot `lot/carte-aide-materiel`, 13 nov. 2026, partie de `main` (`f9c49ec8c`, la 1.244.0). Mandat : relais de la
conversation du Projet, 12 nov., 19 h 15, repris par la relève du 13 nov., 5 h 05. PR d'aperçu n° 22 (non fusionnée).
Rapport : `plans de travail/RAPPORT-2026-11-13-carte-aide-materiel.md`.

**État : CLOSE.** Passée sur l'iPad le 13 nov. 2026, de 9 h 58 à 10 h 07 : **onze gestes sur onze**, sur l'aperçu n° 22,
build 1113-0737 (relais de Cowork, 10 h 15). Sans artefact jumeau : un geste par tour, dans la conversation du Projet.
Les mots proposés du §3 partent tels quels : aucun n'a heurté Grégoire.

**Après la porte** (Grégoire, 10 h 00, mot pour mot : « Nous allons cependant inverser la position de l'interrupteur et
du paragraphe. Je voudrais que l'interrupteur soit après le paragraphe, à droite. ») : l'interrupteur est passé sous le
paragraphe de l'accueil et sous l'en-tête de l'étiquetage, à droite. Les attendus ci-dessous qui le disent « en haut
de la page » décrivent le build 1113-0737, celui qui a été passé.

Pourquoi une porte : les bancs WebKit du Mac mesurent la carte, l'interrupteur et l'exemple aux deux orientations
(relevé au rapport). Ici, seulement ce qu'un vrai doigt, le clavier de l'iPad et sa rotation tranchent.

Rien de tout cela n'écrit dans tes trimestres : l'aperçu a son propre espace, vide, à part de
`app.codexnumeris.org`. Ce qui échoue devient un item de backlog avec son numéro de porte.

---

## §0 · Préalable

- [x] **0.1** Sur l'iPad, dans Safari, ouvre l'aperçu `https://deploy-preview-22--codexnumeris-051225.netlify.app`.
  Sur un aperçu neuf : ☰ › « Vue étendue ». Lis le numéro au pied de l'accueil.
  ⮕ Attendu : 1.244.0, build 1113-0737 (ou plus récent, si un commit de documents a suivi). Sinon, recharge, ou
  attends que Netlify ait fini de publier.
  `iPad`

---

## §1 · Données

Rien. L'exemple n'écrit rien ; la seule chose que le lot garde est la préférence de l'interrupteur, dans le
navigateur de l'aperçu.

---

## §2 · Interface — un geste par tour

### 2.1 L'interrupteur et la carte, hors parcours

- [x] **2.1 a** iPad à l'horizontale. Va dans Conception › Apporter mon matériel.
  ⮕ Attendu : en haut de la page, l'interrupteur « M'accompagner pour étiqueter ma grille », allumé ; la carte
  « Ta grille, pas à pas » à l'écran ; la page ne porte plus de liste d'étapes.
  `iPad`
- [x] **2.1 b** Du doigt, éteins l'interrupteur, puis rallume-le.
  ⮕ Attendu : il répond au premier toucher, sans viser ; éteint, la carte disparaît et aucune consigne ne reste
  dans la page ; rallumé, la carte revient.
  `iPad`
- [x] **2.1 c** Prends la carte par sa poignée et pose-la ailleurs.
  ⮕ Attendu : elle suit le doigt et reste où tu la poses.
  `iPad`

### 2.2 Le clavier

- [x] **2.2 a** Touche la zone de collage et tape trois mots (« mon brouillon d'essai »).
  ⮕ Attendu : clavier levé, tu vois ce que tu tapes ; la carte n'est ni sous le clavier ni sur la zone.
  `iPad`

### 2.3 L'exemple ne prend plus la place du brouillon

- [x] **2.3 a** Ferme le clavier, puis touche « Voir le travail complet ».
  ⮕ Attendu : l'exemple étiqueté s'ouvre ; la carte ne couvre pas ce qu'elle montre.
  `iPad`
- [x] **2.3 b** Touche « Quitter l'exemple ».
  ⮕ Attendu : aucune confirmation demandée ; tu retrouves « mon brouillon d'essai » dans la zone de collage.
  `iPad`
- [x] **2.3 c** Touche « Faire l'exercice soi-même », choisis une étiquette de la légende, puis touche un morceau du
  tableau.
  ⮕ Attendu : la carte donne les étapes de l'étiquetage et se lit en entier (ses pages se tournent du doigt) ;
  l'étiquette se pose sur le morceau touché, pas sur son voisin.
  `iPad`

### 2.4 La rotation

- [x] **2.4 a** L'exercice ouvert, tourne l'iPad à la verticale, puis reviens à l'horizontale.
  ⮕ Attendu : à chaque rotation la carte se replace seule ; à la verticale, elle ne couvre pas le tableau à
  étiqueter au point de t'empêcher de toucher un morceau.
  `iPad`

### 2.5 La sortie et la préférence

- [x] **2.5 a** Touche « Quitter l'exemple », puis, dans la carte, « Fermer l'accompagnement ».
  ⮕ Attendu : la carte part et l'interrupteur s'éteint.
  `iPad`
- [x] **2.5 b** Recharge la page et reviens dans Conception › Apporter mon matériel.
  ⮕ Attendu : l'interrupteur s'est RALLUMÉ et la carte est revenue ; « mon brouillon d'essai » est toujours là.
  *Attendu corrigé le 13 nov., 10 h 15 : il disait « l'interrupteur est resté éteint », à tort. Tant qu'aucune grille n'a
  été créée par l'étiquetage, l'interrupteur se rallume à chaque arrivée, même éteint la fois d'avant (`aLArrivee`,
  `js/materiel-aide.js`, banc I1) : c'est ce que la consigne demandait, et Grégoire l'a vu se rallumer.*
  `iPad`

---

## §3 · Les mots proposés — vus en contexte pendant les gestes

Ils partent tels quels s'ils ne te heurtent pas ; dis seulement ceux que tu veux changer.

| Mot | Où |
|---|---|
| « M'accompagner pour étiqueter ma grille » | le libellé de l'interrupteur (2.1 a) |
| « Ta grille, pas à pas » | le titre de la carte hors parcours (2.1 a) |
| « Fermer l'accompagnement » | le lien de sortie de la carte (2.5 a) |
| « Voir le travail complet », « Faire l'exercice soi-même » | les deux boutons de l'accueil (2.3) |
| « Quitter l'exemple » | le bouton de l'étiquetage, sur l'exemple (2.3 b) |

Hors de la porte (un parcours demande une classe en place) : le texte de l'étape « Ta grille » lancée depuis
Conception › Grilles (`TEXTE_1_COMPOSER`, `js/parcours-evaluer.js`), listé au rapport.
