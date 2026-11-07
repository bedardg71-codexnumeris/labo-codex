# Rapport — lot 3 « Les pages sans doublons », étape 2 (7 nov. 2026)

Consigne et réponses de Cowork : `CONSIGNE-2026-11-07-chaine-des-quatre-lots.md`, § Lot 3. Inventaire approuvé :
`INVENTAIRE-2026-11-07-pages-sans-doublons.md` ; textes décidés par Grégoire : `A-DECIDER-2026-11-07-lot-3-les-textes.md`.
Branche `lot/en-tete-epure`, non fusionnée, rien au changelog. Écrit par Claude Code. Captures WebKit, sombre et
clair, à 1180 et 820 px : `Claude outputs/captures-2026-11-07-pages-sans-doublons/` (la carte, Mon matériel, une page
par section qui a perdu son titre — Cadre › Trimestre, Conception › Productions, Évaluation › Liste, Suivi ›
Présences, Labo › Rythme, Aide › Commencer, Réglages › Préférences — et le témoin, à 390 px).

## 1. Ce qui est fait

| Point | Fait |
|---|---|
| Textes | 160 renvois aux libellés courts (liste fermée, chaque occurrence vérifiée), plus les états vides d'Annoter et d'Exporter ; les 18 phrases, avec tes mots pour 1, 4, 6, 9, 11, 16 et 18 |
| Titres | 31 titres quittent l'écran et restent pour les lecteurs d'écran ; « Rencontres (ortho.) » reste |
| Descriptions | D1, D2, D5 à D10, D13, D16, D19 retirées ; l'avertissement de Mon matériel aussi |
| Bibliothèques | neuf boutons, une classe ; les trois du Trimestre reprennent la taille du modèle (185 → 203 px) |
| Carte | une rangée dans l'ordre de l'esquisse 67 ; la recherche s'ouvre sous la loupe |
| Frises | la frise compacte, dans le composant commun : les sept écrans qui en ont une |
| Témoin | sous 780 px, en tête du contenu sur toutes les pages (présences : au-dessus de « ← Précédent ») |
| Pastille | à côté d'« Accueil », dans la navigation ; retirée du pied de l'accueil |
| Démo | « Explorer » ouvre l'aide « Données démo » à la première entrée seulement |

## 2. Ce que j'ai décidé seul (à corriger en dix secondes si c'est faux)

- **Un titre qui porte des contrôles** (le « i » de l'aide, « Régler les outils d'observation ») : seul son texte
  part ; les contrôles restent sur une ligne compacte, à leur place. Sur Productions, cela laisse deux « i » seuls
  sur leur ligne (capture `conception-productions-*`). À juger.
- **« en vigueur »** : le code n'a aucune notion de carte en vigueur (le mot n'existe que pour les pratiques). Je
  l'affiche pour la carte ouverte, qui est la carte active de l'index. Si tu voulais dire autre chose (la carte
  rattachée au cours du groupe actif, par exemple), c'est une condition à poser.
- **La frise** : environ 38 px à la souris ; **44 px au doigt et jusqu'à 1024 px** (règle des cibles de l'iPad,
  #1172). « Nom, nombre » : quand l'info redit le nom (« 2 leçons », « 10 étud. »), seul le nombre paraît ; le mot
  reste lu par les lecteurs d'écran. Une info d'une autre forme (« 1 GC », « trou à 59 % ») paraît entière.
- **À 820 px**, la frise de la carte (sept étapes nommées) ne tient plus : elle défile à l'horizontale, la page
  jamais. La barre de la carte passe aussi sur deux rangées à 820 (la droite descend) ; une rangée de 1024 à 1440,
  où c'est le nom de la carte qui cède la place (points de suspension).
- **Les icônes seules** : Annuler, Rétablir, Rechercher font 32 px à la souris, 44 au doigt.
- **Le témoin se pose DEVANT la page affichée**, pas dedans : un écran qui redessine son contenu ne l'efface pas.
  Mesuré à 360 et 390 px sur les 44 pages : dans la page et visible partout.
- **La pastille** n'a jamais été dans la navigation : avant l'en-tête épuré, elle était sur l'icône de la carte
  « Nouveautés » de l'accueil. Placée à côté d'« Accueil » comme décidé, dans la navigation en mots et dans la
  liste des sections de l'iPhone.
- **La liaison verte de la frise** (`bc-liaison-ok`) et la liaison finale pointillée partent avec l'ancien dessin.

## 3. Trouvailles et leur disposition

1. **Les encadrés de guidage de la démo** (« Carte d'alignement — La carte relie… », « Productions étudiantes —
   Les productions sont… ») nomment encore les pages par leur titre long. Hors des quatre familles de l'inventaire
   (Aide, visite, infobulles, glossaire) : **signalé, non corrigé** (mots validés de la démo, à toi d'en décider).
2. **Les trois infobulles sans déclencheur** : laissées, sans inscription (Cowork).

## 4. Vérifications

- **Vitest entier** (depuis `tests/`) : 10 765 sur 10 765. Sentinelle neuve `sentinelle-pages-sans-doublons-2026-11-07`
  (titres, descriptions, bibliothèques, barre, frise) ; une vingtaine de sentinelles réalignées, la plupart par un
  seul passage, `auxLibellesCourts`, qui relit les textes validés avant le 7 nov. avec les libellés courts.
- **Casse** : une phrase du glossaire remise à l'ancien texte → rouge ; le renvoi de la carte remis → rouge ; la
  place du témoin retirée → 6 rouges sur 7 ; l'écriture de `aideDemoVue` retirée → rouge.
- **Playwright WebKit** : la spec du lot (5 essais et 4 de captures) et les specs de la carte, des frises, des
  bibliothèques, du témoin, de l'accueil et de l'en-tête (≈ 150 essais) : verts après réalignement.
- **Verdict Playwright complet : PAS pris** (consigne : une fois, après l'accord sur le quatrième lot).
