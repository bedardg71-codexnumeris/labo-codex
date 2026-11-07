# Consigne — lot « Le nouvel en-tête » (7 nov. 2026)

Reçue de Grégoire le 7 novembre 2026, d'après des maquettes arrêtées. Branche `lot/nouvel-en-tete`.
**Pas de fusion vers `main` ni de publication avant son accord sur les captures. Rien au changelog.**

## Ce qui disparaît

- L'ancien sous-titre « Un outil de soutien à l'enseignement et au suivi des apprentissages ».
- La date et l'avis d'horaire qui l'accompagne : retirés, pas déplacés.
- Le bouton « Codex » en haut à gauche (déplacé dans le bloc de droite).
- La bande sombre de la navigation : la navigation monte d'une bande.
- Le nom de l'enseignant·e dans le libellé du groupe affiché dans l'en-tête.
- L'ancienne formule du titre de l'onglet : il devient « Labo Codex ».

## Bande du haut (sombre), trois zones

1. Gauche : `Logo/labo-codex-logo-slogan-cote-blanc.svg`, 96 px de haut (bureau et iPad), sur la marge gauche, ~19 px au-dessus et au-dessous.
2. Centre de la page, dans l'axe de la navigation : le sélecteur du groupe actif (~34 px). Texte en deux tons : cours et groupe en blanc demi-gras (« 601-101-MQ · gr. 00007 »), puis horaire et session plus pâles (« Mar-Ven · A26 », ~#96ACCD). Select natif gardé, affichage à deux tons superposé.
3. Droite : bloc de trois rangées sur la marge droite.
   - Rangée 1 : Signaler, Soutenir, Confidentialité, Thème — dessins actuels, une seule couleur claire (~#C4D0E4).
   - Rangée 2 : Visite guidée (icône « route » de SVG Repo, licence à vérifier), Assistance (bulle avec « i », pleine si activée, contour si désactivée), Aide (« ? » dans un cercle, en trait), Réglages (curseurs actuels) — dans l'orange actuel de l'aide.
   - Icônes ~22 px, sans cadre ni fond, ~37 px d'espacement, 7 px entre les rangées ; fond discret au survol et au focus clavier (focus visible obligatoire) ; infobulles actuelles ; sur écran tactile, 40 × 40 px de toucher par une marge invisible.
   - Rangée 3 : le bouton « Codex », largeur de la grille (~145 px), 28 px de haut, 9 px sous la rangée 2 ; pastille et libellé centrés, libellé à la taille de ceux de la navigation ; comportement inchangé.

## Bande pâle

La navigation principale (Accueil … CoP), centrée, telle qu'aujourd'hui. Hauteur totale visée sur le bureau : ~216 px (260 aujourd'hui).

## Bulles animées

Elles restent (les micro-données), réparties sur les deux bandes, derrière le contenu, jamais par-dessus un texte, le logo ou un bouton. `prefers-reduced-motion` respecté.

## Largeurs

- Bureau : trois zones sur une ligne, groupe centré sur la page.
- Quand le groupe ne tient plus centré sans toucher le logo ou le bloc (seuil à mesurer), il descend dans la bande pâle, au-dessus de la navigation — c'est le cas de l'iPad portrait (820 px, ~265 px d'en-tête).
- iPhone (390 px), sans maquette : logo seul (`Logo/labo-codex-logo-blanc.svg`) si le slogan ne tient pas ; groupe pleine largeur dans la bande pâle ; navigation inchangée. Proposition jugée sur capture.

## Thèmes

Sombre et clair. Contraste minimal 4,5:1 (textes), 3:1 (icônes).

## Avant de coder

Vérifier ce que contient un codex (tous les groupes et cours, ou le groupe actif), proposer le texte de l'infobulle du bouton « Codex » — Grégoire tranche. Ne modifier aucun autre texte lu par l'utilisateur.

## Livraison

Captures Playwright WebKit, sombre et clair, à 1440, 1280, 1180, 820 et 390 px, un fichier par capture ; adresse d'aperçu de branche s'il y en a ; seuil mesuré, licence de l'icône route, infobulle proposée, vérifications habituelles (sentinelles, Vitest, verdict).
