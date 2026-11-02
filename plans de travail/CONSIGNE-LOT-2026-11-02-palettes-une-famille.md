# Consigne – Les palettes d'Annoter et d'Évaluer, une même famille (2 novembre 2026)

> Écrite par Cowork le lundi 2 novembre 2026 à 11 h 40 (Toronto, mesuré par `date`), sur `main` = `09bb691d` (`origin/main` = `ffd69a47`, 1.230.1 en ligne ; le lot de la Rétroaction attend la prochaine mise en ligne). **Une seule session à la fois** : si le chantier des tampons dans la bibliothèque (`PLAN-2026-11-02-tampons-tous-dans-la-bibliotheque.md`) est en cours d'écriture, ce lot attend.
> **Décisions de Grégoire**, conversation Cowork de 11 h 16 à 11 h 37, captures iPad (1180 × 820) vues par Cowork, ébauche dessinée et approuvée.

## Le principe

Dans ses mots : « L'idée, c'est de pouvoir utiliser le plus d'espace pour les palettes sur la hauteur et de laisser de l'espace pour la copie à annoter sur la largeur. » Les palettes d'Annoter (Annotation, Codes, Tampons) et d'Évaluer (Paramètres, Évaluation, Rétroaction) sont **une même famille** : même en-tête, mêmes tuiles, mêmes intertitres, aucun nom coupé. Sur l'iPad, la compacte d'Annotation exige un stylet ; l'étendue se manie au doigt. Sur le Mac, la compacte reste utile (souris précise). La préférence est retenue par navigateur, donc par appareil.

## 0. Avant tout

- Commit de docs seul : cette consigne.
- Skill `design-interface` ; `design-system.html` reste la source de vérité (y porter la tuile et l'en-tête de la famille).
- **Mesure d'abord**, à 1180 × 820 et 1280 × 720 : largeur de Tampons, hauteur de chaque palette d'Annoter, hauteur de la zone sous la barre d'Annoter. Le tableau en tête du rapport.

## 1. L'en-tête de la famille (Annoter et Évaluer)

- **Retirer ↔ et ↕ partout.** La disposition en bandeau disparaît (`layoutPaletteH`, son CSS, ses essais) : zéro dette. La poignée du coin reste pour élargir ou allonger à la main.
- **Un seul bouton compacte/étendue, seulement sur une palette qui a deux versions** : Annotation, Codes, Tampons, Évaluation. Paramètres et Rétroaction n'en ont pas (pas de compacte sans besoin vécu ; la Rétroaction est faite pour être lue). Son `title` dit ce qu'il fera.
- Ordre : poignée ⠿, titre, compte (Codes), ⚙ s'il y a des réglages ; à droite, le bouton de version et « − ».
- **Codes** : le compte d'erreurs tient sur une ligne, en compacte comme en étendue. Aujourd'hui « (23 erreurs) » passe sur deux lignes, et la pastille « 23 » heurte ⚙.
- **Stock** (décision de Cowork, 11 h 45) : une disposition enregistrée en bandeau (`dispositionPaletteCodes = 'h'`, et l'équivalent des autres palettes) se lit comme l'étendue ; un choix « compacte » enregistré est gardé. **Les positions et dimensions enregistrées avant ce lot sont ignorées une fois** : chaque palette s'ouvre à ses nouvelles valeurs par défaut, puis ce que l'utilisateur pose à la main est gardé comme aujourd'hui. Motif : ↕ était le seul geste qui rendait une palette à sa géométrie d'ouverture, et il part dans la même mise en ligne que la Rétroaction à 360 (`RAPPORT-2026-11-02-retroaction-plus-large.md`, « ce que j'ai supposé ») : sans ce point, une largeur de 200 enregistrée chez Grégoire cacherait les 360 sans aucun moyen de les retrouver, et une géométrie de bandeau (Codes, pleine largeur en bas) donnerait une étendue étalée sur toute la copie. Le moyen est ton choix technique ; **rien n'est effacé ni réécrit chez l'utilisateur**.
- Défaut (décision de Cowork) : l'étendue, pour toute palette sans préférence enregistrée.

## 2. La palette Annotation étendue

Modèle : les tuiles de Tampons (icône, nom dessous, lettre de raccourci en coin). De haut en bas :

- Le verrou (§ 4).
- Une rangée : Déplacer, Sélection, Dupliquer.
- Outils : Stylo, Surligneur, Texte. Formes : Cercle, Rectangle, Polygone. Lignes : Droite, Pointillée, Ondulée. Extrémités : Début, Double, Fin, Aucune (quatre tuiles sur la rangée).
- Couleurs : deux rangées de six. Épaisseur : inchangée.
- **En bas, une seule rangée** : Annuler, Supprimer, Rétablir, Effacer la page (cette tuile en couleur d'alerte ; son comportement ne change pas). Motif de Grégoire : en haut, ces boutons s'accrochent au passage.
- La compacte ne change pas (ses boutons restent en haut), sauf le verrou (§ 4).
- Dimensions (décision de Cowork) : la largeur commune aux palettes d'Annoter, celle de Tampons aujourd'hui ; tuiles de 48 px de haut, jamais sous 44 ; intertitres serrés. La palette tient dans la hauteur de la zone à 1180 × 820, « Annuler » visible. Si les quatre extrémités tombent sous 44 px de large, élargis la famille juste assez, et dis-le.
- Les mêmes actions que la compacte, pas un second jeu ; l'état actif (outil, extrémité, couleur) se lit pareil dans les deux versions.

## 3. Tampons

- **Une compacte**, sur le modèle de celle de Codes : les icônes seules, le nom du tampon touché sous la grille (lignes réservées : la palette ne bouge pas). Nom passé par `echapperHtml()`.
- **Aucun nom coupé, dans toute la famille** : un nom passe sur deux lignes (coupure entre les mots, sinon césure française, `hyphens: auto` sous `lang="fr"`) ; seule la rangée qui en a besoin s'allonge. Même règle pour les titres de catégorie (« Analyse et traitement »). Coupés aujourd'hui : « Identifica… », « Sans pre… », « Soupçon … ».

## 4. Le verrou, une seule forme

- Aujourd'hui : en Annoter, un grand bouton à texte en haut d'Annotation (« Déverrouiller l'évaluation » passe sur deux lignes) ; en Évaluer, un petit cadenas sans texte dans l'en-tête de Paramètres, collé à « − » (`poserBoutonVerrou`, `travaux-ui.js`).
- **Une seule forme** dans les deux modes : un bouton à texte en haut de la palette de gauche (Annotation en Annoter, Paramètres en Évaluer), compacte comme étendue. Icône de cadenas (ouvert, fermé) et texte sur une ligne : **« Verrouiller » / « Déverrouiller »** (mots validés par Grégoire). Le cadenas de l'en-tête de Paramètres disparaît.

## 5. Tests

- Playwright, à 1180 × 820 et 1280 × 720 : aucun ↔ ni ↕ ; le bouton de version sur les quatre palettes, absent de Paramètres et de Rétroaction ; l'Annotation étendue dans la zone, « Annuler » visible ; aucune tuile sous 44 px ; aucun nom tronqué dans Tampons avec les tampons par défaut ; le compte de Codes sur une ligne ; une préférence `'h'` enregistrée ouvre l'étendue ; le verrou à texte en haut de la palette de gauche dans les deux modes.
- Contre-épreuves (skill `verification-adverse`).

## 6. Fin

Un commit par section (1 à 4), Vitest entier, specs touchées. **Pas de release ni de verdict** : le lot part avec la prochaine mise en ligne. Si le contexte manque, arrête après une section complète et dis au rapport où tu en es. Rapport `RAPPORT-2026-11-02-palettes-une-famille.md` à Cowork : l'issue de chaque trouvaille, et le geste à vérifier sur l'iPad.
