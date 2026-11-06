# Portes terrain – la 1.231 (2 novembre 2026)

> **La trace.** L'opération est l'artefact « Portes terrain 1.231 », publié par Cowork après le push de la 1.231.0 (build 1102-1454).
> Consigne : `CONSIGNE-LOT-2026-11-02-mise-en-ligne-1231.md`, § 2. Elle réunit les cinq gestes du § 5 de `RAPPORT-2026-11-02-palettes-une-famille.md` et celui de la Rétroaction plus large (`RAPPORT-2026-11-02-retroaction-plus-large.md`, « Pas encore »).
> Aucune machine ne répond à ceux-ci : le vrai doigt, le vrai Safari, la vraie césure. Tout le reste est mesuré par les specs des deux lots.
> **Elle ne vaut qu'après le push** : tant que le bas de page ne dit pas 1.231.0, elle juge la version d'avant.
> Ce qui échoue devient un item de `Retours des testeurs/SUIVI-BUGS.md`, pas une note mentale.

## §0 · Préalable
- [ ] 0.1 · iPad · Ouvre app.codexnumeris.org, recharge, lis le numéro en bas de page. ⮕ 1.231.0.
- [ ] 0.2 · iPad · Ouvre Annoter : les palettes sont à leur place et à leur taille par défaut, même si tu les avais déplacées avant. ⮕ c'est voulu, une seule fois ; ce que tu poses ensuite à la main est gardé.

## §1 · ⚠⚠ Données : « Effacer la page » a déménagé
Pourquoi : « Effacer la page » est maintenant en bas de la palette Annotation, loin des outils. Avant d'effacer, l'application doit toujours te proposer d'enregistrer ton codex.
- [ ] 1.1 · iPad · Annoter, hors plein écran, sur une page déjà annotée : touche « Effacer la page », près du coin bas-droit. ⮕ la proposition d'enregistrer ton codex paraît, comme avant. Touche « Annuler » : tes annotations restent (ajout de Cowork, 16 h 50, pour ne rien effacer d'une vraie copie).
- [ ] 1.2 · iPad · Au même toucher, regarde la palette. ⮕ elle ne change pas de taille.

## §2 · Interface
### 2.1 · L'Annotation étendue, en tuiles
Pourquoi : la palette Annotation se manie maintenant au doigt, en tuiles nommées.
- [ ] 2.1.1 · iPad · Annoter, hors plein écran : ouvre une copie. ⮕ l'Annotation s'ouvre en tuiles, à sa largeur par défaut.
- [ ] 2.1.2 · iPad · Fais défiler la palette du doigt. ⮕ la rangée « Annuler · Supprimer · Rétablir · Effacer la page » reste collée en bas.

### 2.2 · Le bouton de version, et le choix retenu
Pourquoi : un seul bouton, à gauche du « − », passe de l'étendue à la compacte dans toutes les palettes.
- [ ] 2.2.1 · iPad · Sur Annotation, Codes, Tampons et Évaluation : touche le bouton de version. ⮕ la palette passe en compacte.
- [ ] 2.2.2 · iPad · Touche-le une seconde fois. ⮕ elle revient en étendue.
- [ ] 2.2.3 · iPad · Laisse une palette en compacte, ferme l'application, rouvre-la. ⮕ elle est toujours en compacte.

### 2.3 · Tampons compacte
- [ ] 2.3.1 · iPad · En Tampons compacte, touche un tampon. ⮕ son nom paraît sous la grille.
- [ ] 2.3.2 · iPad · Au même toucher, regarde la palette. ⮕ elle ne saute pas.

### 2.4 · Les noms des tampons
Pourquoi : cinq noms de tampons étaient coupés avant ce lot. La césure française de Safari est celle qu'on veut juger.
- [ ] 2.4.1 · iPad · En Tampons étendue, lis « Multistructurel ». ⮕ en entier, sur deux lignes au besoin, coupé par un trait d'union.
- [ ] 2.4.2 · iPad · Lis « Id. directrice ». ⮕ en entier.

### 2.5 · Le verrou
Pourquoi : un seul bouton de verrou, avec ses mots, en haut de la palette de gauche.
- [ ] 2.5.1 · iPad · Annoter, sur une copie évaluée : regarde en haut d'Annotation. ⮕ « Verrouiller », cadenas ouvert.
- [ ] 2.5.2 · iPad · Touche-le. ⮕ la copie se verrouille, le bouton dit « Déverrouiller », cadenas fermé.
- [ ] 2.5.3 · iPad · Passe en Évaluer : regarde en haut de Paramètres. ⮕ le même bouton.
- [ ] 2.5.4 · iPad · En Évaluer, regarde l'en-tête. ⮕ plus de petit cadenas.

### 2.6 · La Rétroaction plus large
Pourquoi : à 200, une ligne de rétroaction ne portait qu'environ 24 caractères ; elle s'ouvre maintenant à 360.
- [ ] 2.6.1 · iPad · Évaluer : ouvre la Rétroaction d'une copie avec un long texte. ⮕ environ 50 caractères par ligne, le texte se lit d'un trait.
- [ ] 2.6.2 · iPad · Regarde le bas de la Rétroaction. ⮕ ses trois boutons tiennent sur une seule rangée.

## §3 · Décisions
- Aucune.

## §4 · Ce que je n'ai pas pu vérifier
- Le vrai Safari de l'iPad et le vrai doigt : tout est mesuré dans WebKit et Chrome sur le Mac.
- La césure française de Safari sur l'iPad (« Multistructurel ») : le banc vérifie qu'aucun nom n'est coupé, pas la place du trait d'union.
- Hors plein écran à 1180 × 820, l'étendue défile (392 sur 603) : conséquence annoncée à Grégoire le matin du 2 nov. ; la palette Codes ne tient plus dessous.
- L'ancienne géométrie des palettes (`<id>-pos`) reste dans le navigateur, plus rien ne la lit : rien n'est effacé ni réécrit.
- La CI GitHub (WebKit Linux) était rouge sur la 1.230.1 : 13 specs (#833), sans verdict sur leur cause au moment de cette mise en ligne. Le verdict local du Mac juge cette release.
