# Consigne — lot « L'en-tête épuré » (7 nov. 2026)

Reçue de Grégoire le 7 novembre 2026, après-midi, d'après des maquettes arrêtées (toile « En-tête et accueil »,
esquisse 60 pour le bureau et l'iPad, esquisse 61 variante C pour l'iPhone). Remplace la partie droite et la
navigation du lot « Le nouvel en-tête » (`CONSIGNE-LOT-2026-11-07-nouvel-en-tete.md`), déjà en ligne.
Branche `lot/en-tete-epure`. **Pas de fusion vers `main` ni de publication avant son accord sur les captures.
Rien au changelog.** Ne modifier aucun texte lu par l'utilisateur autre que ceux nommés ici.

**Correction reçue en cours de session** : pendant les allers-retours sur les captures, seuls Vitest, les
sentinelles et les specs Playwright de l'en-tête et de la navigation tournent. Le verdict complet se lance UNE
fois, quand Grégoire a approuvé les captures, avant la fusion.

## Ce qui disparaît

- Le slogan à côté du logo (il ira plus tard dans « À propos » ; ici, on le retire seulement).
- Le bloc de droite à trois rangées (huit icônes et « Codex »). Les icônes passent dans un menu, sauf le thème
  et l'anonymisation, qui restent en un clic.
- Les tuiles et les icônes de la navigation principale : elle devient du texte seul.

## Bande du haut (84 px, bureau et iPad)

- Gauche : le logo seul, `Logo/labo-codex-logo-blanc.svg`, 60 px de haut.
- Centre : la navigation principale en mots (Accueil, Cadre, Conception, Évaluation, Suivi, Labo, CoP), 15 px
  demi-gras, sans icône ni cadre. Inactive ~#AFC0D6 ; active blanche, soulignée de 2 px dans l'orange de l'aide
  (variable existante). Zone de toucher ≥ 44 px de haut.
- Droite, dans l'ordre : « Codex » (mot et pastille, comportement et états inchangés, largeur au contenu), le
  thème (un clic, icône actuelle, sans cadre), un bouton de menu à trois traits (aria-label « Menu »,
  aria-expanded).

## Le menu

- Une liste, sans titres : Visite guidée, Assistance, Aide, Réglages, Signaler, Soutenir. Icône actuelle dans
  l'orange de l'aide, puis le mot. Actions des boutons actuels. Assistance garde un interrupteur qui montre son état.
- Panneau ~250 px, aligné à droite sous le bouton. Fermeture : Échap, clic à l'extérieur, après un choix. Focus
  visible ; le focus revient au bouton à la fermeture.

## Navigation secondaire

- Sous la bande du haut, même fond, centrée, 48 px. Onglets 14 px ; actif blanc demi-gras sur blanc ~10 %, les
  autres ~#A9BACD. Pas de bande pour une section sans navigation secondaire.
- Libellés courts (onglets seulement ; les titres des pages gardent leur libellé long) :
  Cadre : Trimestre → Trimestre ; Calendrier scolaire → Calendrier.
  Conception : Apporter mon matériel → Mon matériel ; Carte d'alignement → Alignement ; Productions étudiantes →
  Productions ; Grilles de critères → Grilles ; Échelles de performance → Échelles ; Cartouches de rétroaction →
  Cartouches ; Pratiques de notation → Pratiques.
  Évaluation : Préparer et importer → Préparer ; Liste des évaluations → Liste ; Annoter et évaluer → Annoter ;
  Exporter les travaux → Exporter.
  Suivi : Suivi du groupe → Groupe ; Liste des étudiant·es → Étudiant·es ; Saisie des présences → Présences ;
  Profils individuels → Profils ; Interventions, Rencontres, Animation inchangés.
  Labo : Outils d'observation → Observation ; Exploration des pratiques → Exploration ; Rythme de travail →
  Rythme ; Bilan réflexif → Bilan ; Modélisation, Études, Suivi longitudinal inchangés.
- Libellés lus le 30 oct. ; s'il en existe d'autres aujourd'hui, les signaler sans les renommer.
- Une rangée qui déborde défile à l'horizontale avec un fondu au bord.

## Bande pâle (56 px)

- Le sélecteur du groupe actif, centré sur la page. Texte en deux tons.
- Doublon « Mar-Ven A26 · A26 » : la session une seule fois. Affichage seulement, aucune donnée modifiée. Dire
  d'où venait le doublon.
- Collé à droite, à 8 px : l'anonymisation (icône actuelle, hauteur du sélecteur, contour discret ; activée :
  contour orange, fond orange léger, icône blanche, aria-pressed). Comportement inchangé.
- Rien d'autre.

## Bulles animées

Derrière le contenu, jamais sur un texte, le logo ou un bouton ; `prefers-reduced-motion` respecté.

## Largeurs

- Bureau et iPad horizontal : ci-dessus.
- iPad vertical (820 px) : même disposition ; marges des mots de la navigation 11 → 7 px. Mesurer le seuil où
  la navigation ne tient plus sur la ligne du logo.
- Sous ce seuil (iPhone, 390 px), variante C : bande du haut 56 px, logo 40 px, puis Codex, thème, menu ; pas de
  navigation en mots. Rangée de 44 px : un bouton qui nomme la section active (nom et chevron, souligné
  d'orange) et ouvre la liste des sept sections, l'active marquée ; à sa droite, après un filet vertical, les
  onglets de la navigation secondaire, défilant avec un fondu. Puis la bande du groupe, 52 px : cours et groupe
  seulement (horaire et session restent dans la liste déroulante), anonymisation collée à droite.

## Thèmes

Sombre et clair. Contraste : 4,5:1 (textes), 3:1 (icônes).

## Backlog (inscrire, sans coder)

- Déplacer la page Modélisation de Labo vers Suivi › Animation (idée de Grégoire, 7 nov.), après ce lot.
- Le slogan dans « À propos ».
- L'en-tête compacté au défilement.

## Livraison

Captures Playwright WebKit, sombre et clair, à 1440, 1180, 820, 390 px, Accueil et Suivi ; plus : menu ouvert à
1180, anonymisation activée à 820, liste des sections ouverte à 390. Un fichier par capture (écran, largeur,
thème). Adresse d'aperçu de branche si elle existe. Seuils mesurés, cause du doublon, vérifications habituelles.
