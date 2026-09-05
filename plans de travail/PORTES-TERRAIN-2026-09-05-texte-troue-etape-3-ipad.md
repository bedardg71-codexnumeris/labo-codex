# Portes terrain — le texte troué, étape 3 : le badge dans la phrase, sur iPad (5 septembre 2026)

> **Écrit le 5 septembre 2026, 9 h 58 (Toronto — heure lue), par Claude Code, sur le lot D commité en local
> (`main`, non poussé).** L'artefact jumeau (cases, compteur, bouton « Copier mes résultats ») est publié par Cowork.
> **Ce qui échoue devient un item de backlog, pas une note mentale.**
>
> **Règle 1 (aucune machine ne peut répondre)** : tout ce qui suit est du geste au DOIGT et au CLAVIER VIRTUEL de
> l'iPad — WebKit de bureau (Playwright) a déjà répondu au reste : poser un badge au clic, taper autour, Entrée,
> quitter la zone, recharger, retirer par la croix ET par l'effacement arrière (retiré d'un bloc, mesuré), un
> jeton inconnu qui reste du texte, une grille rechargée sans frappe qui ne change pas (14 specs verts, 5173
> cas Vitest). **Quatre rangées, pas plus.**
> **Règle 2** : rien d'irréversible — le format enregistré ne change pas (`{erreurs}` en texte brut), et si la
> vue ne se construit pas, le champ d'avant s'affiche. La porte est due par la consigne du 5 (lot D : « 1.119
> ne part avec D que si la porte iPad est passée »), pas par un risque de données.

## §0 · Préalable

- ↻ **OPTION RETENUE PAR GRÉGOIRE (10 h 05) : L'APERÇU.** Les sept commits du jour sont poussés sur la
  branche `apercu/2026-09-05-journee-A-B-D` (PR #82 vers `main`, à NE PAS fusionner par le bouton — `main`
  recevra les mêmes commits en fast-forward avec 1.119). Netlify publie l'aperçu de PR, non redirigé exprès :
  **https://deploy-preview-82--codexnumeris-051225.netlify.app/**
  ⮕ Ouvre CETTE adresse sur l'iPad. Le numéro en bas de page dit encore **1.118.0** (l'aperçu porte le code
  du jour SANS bump de version) : le geste qui prouve que tu es sur le bon code, c'est **2.1** — la pastille
  dans la phrase. Si un badge posé s'écrit `{projection}` en clair, tu n'es pas sur l'aperçu.
- **Où l'application se charge, sinon.** L'iPad ne lit pas ton clone : il charge le SITE, où le lot D n'est
  pas tant que 1.119 n'est pas poussée.
- Sur l'iPad, **recharge en vidant le cache** si l'application était déjà ouverte (le jeton `?v=` de
  `grilles.js`, `styles.css` et `composeur-badges.js` est bumpé au jour de la release).
- Conception › Grilles › ouvre une grille qui a un **critère algorithmique** (« Rigueur », par exemple), puis
  déplie la carte **« Ce que l'élève lit »**.

## §2 · Interface — ce que tu vérifies sur l'iPad

**2.1 Poser un badge au doigt** `[iPad]`
┌ POURQUOI ─ Depuis l'étape 1, un badge cliqué s'écrivait `{erreurs}` en clair dans la zone. Maintenant il
│ s'affiche comme la pastille de la rangée « Poser : », dans la phrase. C'est ce que le doigt doit obtenir.
└
- Touche la zone « Verdict » du palier 5 (« Risqué ») après le dernier mot, puis touche le badge **projection**.
  ⮕ Attendu : une pastille verte « projection » apparaît dans la phrase, à l'endroit touché ; le clavier
  reste ouvert et le curseur est après la pastille.

**2.2 Taper autour, au clavier virtuel** `[iPad]`
- Tape ` erreurs` (une espace, puis le mot), puis **la touche Retour**, puis `Ligne 2`.
  ⮕ Attendu : le mot vient après la pastille, la ligne se casse, « Ligne 2 » est dessous. Rien ne saute,
  la pastille ne bouge pas.

**2.3 Effacer un badge, deux façons** `[iPad]`
┌ POURQUOI ─ Sur WebKit de bureau, l'effacement arrière retire la pastille d'un bloc, comme un caractère.
│ Le clavier virtuel de l'iPad n'a pas été mesuré : c'est l'angle mort nommé dans la carte.
└
- Place le curseur juste après la pastille, touche **⌫**.
  ⮕ Attendu : la pastille disparaît d'un coup (pas lettre par lettre). **Si elle reste**, note-le ici : ce
  n'est pas un échec de la porte, la croix couvre le cas — c'est une mesure.
  `Mesure : ⌫ retire la pastille ? ______`
- Touche le badge **projection** de nouveau, puis touche la **×** de la pastille.
  ⮕ Attendu : la pastille disparaît ; le texte autour ne bouge pas ; le clavier reste ouvert.

**2.4 Quitter la zone, recharger** `[iPad]`
- Touche ailleurs dans la carte (hors de la zone), puis recharge la page et rouvre la grille.
  ⮕ Attendu : sous le palier, la ligne « L'élève lira : » montre la phrase remplie (avec le nombre à la
  place de « projection » et « Ligne 2 » en dessous) ; après le rechargement, la zone montre encore la
  phrase, « Ligne 2 » compris, et les pastilles que tu as laissées.

## §3 · Décisions — ce n'est pas une vérification

- **La croix sur la pastille** : la garder, ou ne compter que sur ⌫ ? (Sur iPad, ⌫ est le geste naturel ;
  la croix est un repli visible.) `Verdict : ______`
- **Le glissé** (poser un badge en le traînant au doigt jusque dans la phrase) : tu ne l'as pas demandé ; le
  clic au curseur tient. Le veux-tu quand même ? `Verdict : ______`

## §4 · Ce que je n'ai pas pu vérifier

- **Le clavier virtuel de l'iPad** : ⌫ sur une pastille, la touche Retour dans une zone éditable, et le
  curseur posé au doigt entre deux pastilles — WebKit de bureau répond oui aux trois, iPadOS peut différer.
- **Safari de bureau sur Mac** : non joué (Playwright joue WebKit, pas Safari). Si tu l'ouvres sur le Mac,
  la porte 2.1 suffit à voir si la vue s'affiche.
- **Une session déjà ouverte avec l'ancien `grilles.js` en cache** : la vue ne se construirait pas sur le
  vieux code — d'où le vidage de cache du §0.
- **Ce qui est mesuré et dit** : l'effacement arrière retire bien la pastille dans WebKit de bureau (spec
  `texte-troue-badges-dans-la-phrase`, étape 7) ; un jeton `{s}` (le pluriel) reste du texte dans le décompte
  (« erreur{s} »), volontairement — il n'est pas posable, le moteur le remplit quand même.
- **Erreur de session, rattrapée** : l'heure de la carte avait été TAPÉE (« 9 h 35 ») au lieu d'être lue
  (9 h 27) — corrigée à la relecture de Cowork.
