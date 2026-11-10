# Consigne : « Les flèches des parcours »

Décidé avec Grégoire le 9 nov. 2026, de 21 h 48 à 21 h 55, dans une instance de Cowork de conception. Le relais passe par l'instance de Cowork qui pilote la file des sessions.

## Le problème vécu

Captures de Grégoire, 9 nov., 21 h 40, mode démo, Mac, parcours « Découvrir », étapes 3, 5, 6 et 7 :

- Dans la bulle, tout ce qui est orange (le contour, la ligne du geste « Touche… ») désigne la section SUIVANTE. La section dont parle la bulle n'a que le soulignement ordinaire du menu, dans le même orange.
- La bulle est posée juste sous le prochain bouton : « Évaluer » (6 sur 8) sous « Conception », « Concevoir » (7 sur 8) sous « Cadre ». On la lit comme si elle décrivait la section suivante.
- Sur iPad, les zones claires ne tombent pas sur les boutons et les menus qu'elles désignent.

**Cause probable du décalage sur iPad** (inférence de Cowork, lue dans le code, non mesurée sur l'appareil) : `.parcours-voile` a `width: 100vw; height: 100vh` (`css/parcours.css`), alors que son `viewBox` et ses trous sont calculés sur `innerWidth × innerHeight` (`sonder()`, `js/parcours-moteur.js`). Sous Safari iPad, barre d'adresse visible, 100vh dépasse innerHeight ; le `preserveAspectRatio` par défaut recentre le dessin, et les trous glissent vers le bas d'environ la moitié de l'écart. Le contour (une div posée en px depuis `getBoundingClientRect`) n'a pas ce défaut. Le lot retire le voile ; la règle à tenir pour les flèches : le même système de coordonnées que le contour.

## Branche

`lot/parcours-fleches`, partie de `origin/main` APRÈS la publication du groupe 3 (1.241.x), qui porte les neuf parcours. Ne pas partir avant : le groupe 3 corrige encore `js/parcours-moteur.js` sous WebKit.

## Mesurer d'abord

Les étapes dont le déroulement comptait sur le voile pour retenir le toucher hors des zones (un geste qu'on voulait empêcher pendant l'étape). Les nommer dans le rapport. Si l'une casse sans voile, la protéger par une garde dans la définition de l'étape (comme `js/parcours-donnees.js` le fait déjà), jamais en réintroduisant un voile.

## Ce que le lot fait

Tout se fait dans le moteur (`js/parcours-moteur.js`, `css/parcours.css`). Aucun texte de parcours ne change. Les neuf définitions ne perdent que leur propriété `voile`.

1. **Le voile disparaît.** Plus d'assombrissement ni de trous, dans les quatre variantes (`normal`, `leger`, `dense`, `aucun`). La propriété `voile` sort des neuf définitions, ses règles sortent de `css/parcours.css`, `fusionnerTrous` et `trouRect` partent s'ils n'ont plus d'usage (zéro dette : ni alias ni code mort). La page reste lisible et touchable partout, comme aux étapes qui étaient déjà sans voile ; l'étape avance toujours sur l'état atteint, quel que soit le chemin.

2. **Ce dont parle la bulle : une flèche manuscrite.** Du bord de la bulle le plus proche vers chaque zone de l'étape (`zones()`), une flèche courbe d'allure tracée à la main : courbe de Bézier légèrement bombée, extrémités arrondies, pointe en deux traits ouverts (pas de triangle plein). Son encre est neutre (la couleur du texte principal, en clair et en sombre), PAS l'orange de l'aide : l'orange reste réservé au geste (point 3). Règles :
   - forme déterministe : aucun aléa d'un passage de la sonde à l'autre (elle tourne toutes les 120 ms), la flèche ne frémit pas ;
   - des zones qui se touchent reçoivent une seule flèche ; au-delà de trois zones, une seule flèche vers leur union ;
   - une étape sans zone mais avec un contour : la flèche va au contour ; une étape `centre` sans rien de désigné : pas de flèche ;
   - la pointe s'arrête à quelques px du bord de la cible, sans la couvrir ;
   - une cible sortie de l'écran (défilement) : la flèche va au bord de l'écran, du côté de la cible ; une cible cachée sous la bulle (après un déplacement) : pas de flèche ;
   - **coordonnées** : la couche des flèches est fixée, dimensionnée en px sur `innerWidth × innerHeight` à chaque passage, sans `viewBox` qui la mette à l'échelle (ou un `viewBox` identique avec `preserveAspectRatio="none"`). Une sentinelle Vitest l'exige ;
   - la flèche suit le défilement, le redimensionnement, `visualViewport`, le déplacement de la bulle (à chaque image pendant le glissement) et le changement d'étape ;
   - `aria-hidden="true"` : la bulle reste ce qu'entend le lecteur d'écran ;
   - préfixe `parcours-fleche` ; ne pas réutiliser les classes `.fleche-didactique*` de `js/accompagnement.js`, qui désignent un autre objet.

3. **Le prochain geste : une pulsation.** Le contour orange plein devient un halo orange qui pulse doucement (lent, faible amplitude) autour de ce qu'il faut toucher. Sous `prefers-reduced-motion` : un contour pointillé fixe, sans animation. La ligne du geste de la bulle (« Touche… ») garde son orange : dans un parcours, l'orange veut dire « ce que tu toucheras ».

4. **La section actuelle, mise en évidence.** Dans le menu ou la barre d'onglets qui contient le contour, l'élément actif (`.actif`, `.active`, `[aria-current]` ou `[aria-selected="true"]`) reçoit, le temps de l'étape, une mise en évidence franche (fond éclairci, texte plein), plus visible que son soulignement ordinaire, sans pulsation. La classe est posée et retirée par le moteur : **`js/navigation.js` et `js/config.js` ne sont pas touchés**. Aucun élément actif trouvé : rien.

5. **La bulle se déplace avec une poignée.** Une poignée ⠿ dans la tête de la bulle, zone tactile d'au moins 44 × 44 px mesurée sous WebKit (cf. le correctif de la poignée de la carte, 9 nov.). Glisser à la souris, au doigt ou au stylet (Pointer Events). La bulle reste dans l'écran utile : sous l'en-tête, au-dessus du bandeau de la démo et du clavier. Sa position est gardée pour l'étape ; l'étape suivante reprend le placement automatique. Au clavier, la poignée prend le focus et les flèches la déplacent par pas de 16 px, sans changer de page de bulle (l'événement ne remonte pas à la bulle). Sur téléphone (500 px et moins), pas de poignée : la bulle garde sa forme rangée, repliable.

6. **La bulle se place près de ce dont elle parle.** `placerBulle` prend pour cible l'union des zones (et non plus celle des zones ET du contour) et traite le contour comme un obstacle à ne pas couvrir. Sans zone, le contour, comme aujourd'hui. C'est ce qui retire la bulle de sous le prochain bouton.

## Ce qui ne change pas

Les textes, les pages de bulle (← 1/3 →), la bulle sur téléphone, le filet, l'avance sur l'état atteint, la sortie, l'annonce au lecteur d'écran.

## Vérification

- Vitest : la géométrie de la flèche en fonction pure (du rectangle de la bulle au rectangle de la cible ; cible hors de l'écran ; cible sous la bulle) ; le bornage du déplacement ; la sentinelle des coordonnées. Break-test pour chacun.
- Playwright : les onze bancs qui lisent `parcours-voile` ou `parcours-contour` sont réécrits pour la flèche, la pulsation, la mise en évidence et la poignée, pas desserrés. Lister ceux qui ont changé et pourquoi.
- Captures Chromium à 1180 et 820 px, en clair et en sombre : les étapes 3, 5, 6 et 7 de « Découvrir » (celles des captures de Grégoire) ; une étape à plusieurs zones ; une bulle déplacée avec sa flèche ; une étape de « Ta notation alternative ». Dans `plans de travail/captures-2026-11-10-parcours-fleches/`.
- **WebKit sur le Mac avant l'assemblage** (leçon du groupe 3) : les bancs des parcours, et les captures à 820 px.
- **Porte terrain iPad** (skill `portes-terrain`) : Safari, barre d'adresse visible puis masquée ; défiler pendant une étape ; déplacer la bulle au doigt ; la flèche touche sa cible ; la pulsation est sur le bon bouton. Claude Code écrit le markdown ; Cowork publie l'artefact.
- Rapport : `plans de travail/RAPPORT-2026-11-10-parcours-fleches.md`. Pousser.
- Nouvelles : une ligne proposée, à soumettre à Grégoire.
