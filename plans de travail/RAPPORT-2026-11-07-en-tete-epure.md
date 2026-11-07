# Rapport — lot « L'en-tête épuré » (7 nov. 2026)

Consigne : `plans de travail/CONSIGNE-LOT-2026-11-07-en-tete-epure.md`. Branche `lot/en-tete-epure`, non fusionnée,
rien au changelog. Écrit par Claude Code.

## 1. Les seuils mesurés (WebKit, données de la démo)

| Largeur | Disposition | Mesure |
|---|---|---|
| ≥ 1001 px | bureau et iPad horizontal ; mots à 11 px de marge | navigation centrée sur la page (écart au centre < 1 px à 1440, 1180, 1001) |
| ≤ 1000 px | marges des mots 11 → 7 px | à 820 : mots sur une ligne, 16 px du logo, 16 px de « Codex » |
| ≤ 779 px | variante C (iPhone) | les mots ne tiennent plus sur la ligne du logo sous **780 px** |

Le seuil de 780 px : logo 77 + mots 449 (marges de 7 px) + Codex, thème et menu 167, ou **190 avec la pastille du
Codex** + 2 × 16 px d'écart + 2 × 2,5 vw de marge. Sans pastille, les mots tiennent jusqu'à 757 px ; la bascule est
posée sous 780 pour qu'ils ne touchent jamais « Codex » quand sa pastille paraît. L'iPad vertical (820) garde donc
la disposition du bureau, avec 39 px de reste.

## 2. Le doublon « Mar-Ven A26 · A26 »

**D'où il venait** : le nom d'un horaire est un champ libre (Cadre › Trimestre, exemple affiché « Lun-Mer 10h »). Le
tien s'appelle « Mar-Ven A26 ». Le libellé du groupe lisait ce nom tel quel, puis y ajoutait la session du trimestre
(« A26 », calculée de la session et de l'année) : `joindre(hor.nom, session)` dans `peuplerDropdownGroupeCoursActif`
(`js/trimestre-v2-orchestre.js`). Le doublon est donc la rencontre de ta donnée et d'un ajout du code, pas une
donnée en double.

**Le correctif** : `horaireSansSession(nom, session)` retire, à l'affichage seulement, la session que le nom porte en
tête ou en fin, avec ses séparateurs (« Mar-Ven A26 », « Mar-Ven · A26 », « Mar-Ven (A26) », « A26 Mar-Ven »). Une
session collée à un mot (« Sa26 ») ou un nom sans session restent tels quels. **Aucune donnée n'est écrite** : ton
horaire s'appelle toujours « Mar-Ven A26 » dans Cadre › Trimestre (source tarie à l'affichage ; le stock n'est pas
touché, par décision de la consigne).

## 3. Contrastes (point le plus clair de chaque fond)

| Élément | Sombre | Clair | Seuil |
|---|---|---|---|
| Mots inactifs #AFC0D6 | 6,65:1 | 7,32:1 | 4,5:1 |
| Onglets inactifs #A9BACD | 6,22:1 | 6,84:1 | 4,5:1 |
| Onglet actif, blanc sur blanc 10 % | 9,08:1 | — | 4,5:1 |
| Icônes claires (thème, menu, anonymisation) | 7,92:1 | 8,71:1 | 3:1 |
| Icônes orange du menu | 5,58:1 | 6,79:1 | 3:1 |
| Partie pâle du groupe, au repos / au survol | 5,12 / 4,63:1 | 7,1:1 | 4,5:1 |

Deux corrections faites en cours de lot. (1) Le menu et la liste des sections gardent un fond sombre dans les deux
thèmes : sur le blanc du thème clair, l'orange tombait à 2,44:1. (2) La partie pâle du groupe passe de #A6B8D4 à
#B8C8E0 : posée sur la bande pâle, elle tombait à 4,32:1. Le contour discret de l'anonymisation (2,4:1) n'atteint
pas 3:1 ; l'icône seule, qui suffit à reconnaître le bouton, fait 7,9:1.

## 3 bis. Correction du menu (reçue le 7 nov., fin d'après-midi)

Ordre : Visite guidée, Assistance, Aide, Signaler, Soutenir, Réglages. Panneau de 210 px au total (250 avant). La
ligne Assistance tient : le mot n'est ni coupé ni passé à la ligne, et l'interrupteur reste dans le panneau. Un
essai le vérifie, et il rougit quand on réduit le panneau à 150 px.

## 4. Ce que j'ai décidé seul (à corriger en dix secondes si c'est faux)

- **Ce qui reste collé en haut** : la bande du haut seule (84 px ; 56 sur l'iPhone), à peu près la hauteur de
  l'ancienne navigation collante. La navigation secondaire et la bande du groupe défilent avec la page. Sur
  l'iPhone, la rangée « Suivi ⌄ » défile donc aussi (avant, les deux menus mobiles restaient collés). Lié à #1239.
- **Le menu se ferme après chaque choix, Assistance compris** (la consigne le dit) : l'interrupteur montre le
  nouvel état à la réouverture, et la notification « Assistance activée/désactivée » le dit sur le moment.
- **Menu et liste sans rôle « menu » ARIA** : un bouton qui déplie une liste de boutons (motif « disclosure »), au
  Tab. Le rôle « menu » exige la navigation aux flèches ; je ne l'ai pas imité à moitié.
- **« Signaler » garde son titre au survol**, « Signaler un bug ou donner ton avis » (texte existant, protégé par
  la sentinelle #801 : la porte doit annoncer les deux modes). Le mot affiché est celui de la consigne.
- **Section Aide ou Réglages sur l'iPhone** : le bouton de section affiche « Aide » ou « Réglages » (le mot du menu).
- **Les séparateurs verticaux** de l'ancienne navigation (après Accueil, avant CoP) et le halo pulsé du CoP sont
  retirés avec les tuiles : « sans icône ni cadre ».
- **Les deux selects mobiles** (navigation et sous-navigation sous 1024 px) sont retirés, remplacés par la
  variante C : entre 780 et 1024 px, la navigation reste désormais en mots.

## 5. Les libellés

Les anciens libellés lus le 30 oct. sont exactement ceux du dépôt aujourd'hui : aucun autre à signaler. Les sections
Aide (huit onglets) et Réglages (trois) ont aussi une navigation secondaire ; la consigne ne les nomme pas, elles
sont inchangées.

**À savoir** : l'Aide, la visite, les guides et les infobulles nomment les pages par leur titre long (« Suivi →
Saisie des présences »), que les pages gardent ; l'onglet, lui, dit « Présences ». Je n'ai touché à aucun de ces
textes (consigne). Le glossaire dit aussi « le bouton « Assistance » de l'en-tête », qui est maintenant une ligne
du menu de l'en-tête. À trancher par toi si ces renvois doivent suivre.

## 6. Trouvailles et leur disposition

1. **Le contenu décalé à droite sur l'iPhone** (`.conteneur` à 95 % de large, collé à gauche sous 1024 px) :
   existait déjà sur `main`, mesuré au pixel près (0 → 370,5 px sur 390). Visible sur les captures à 390. Signalé,
   **non inscrit** (aucun symptôme vécu).
2. **`.dropdown-cours-entete`**, CSS sans élément (thème clair), voisin des règles retirées : **commenté et oublié**
   (sans conséquence).
3. **Les quatre rouges Linux du run 42397000431** : déjà inscrits au RELAIS, hors de ce lot ; l'un d'eux
   (`bibliotheque-liste-1159` à 820 px) est soupçonné d'être lié à l'en-tête précédent (inférence non vérifiée).

4. **À 360 px, le témoin « Non enregistré » couvre les boutons des présences** (#1240, inscrit) :
   `temoin-enregistrement-lot-b.spec.js`, placement 360 px, rouge dans les deux thèmes. Sur `main`, ces boutons
   étaient hors de l'écran au moment de la mesure (815 px pour un écran de 740) : l'essai passait sans les voir.
   L'en-tête plus court (−143 px) les remonte sous le témoin. Le placement du témoin est une décision de la
   relecture de Cowork (R4) : **non corrigé d'office**. Il bloquera le verdict complet tant qu'il n'est pas tranché.

## 7. Vérifications

- **Vitest entier** (depuis `tests/`) : 10 756 sur 10 756 verts. Quatorze sentinelles adaptées : elles posaient
  « chemin cité = libellé de l'onglet », que la consigne change. Elles acceptent désormais le libellé court de
  l'onglet ou le titre long de la page (registre unique : `tests/unit/_helpers/titres-longs.js`, dont chaque titre
  est vérifié présent dans l'application). Une sentinelle neuve, `sentinelle-en-tete-epure-2026-11-07.test.js`,
  remplace celle du lot précédent.
- **Playwright WebKit, les 52 specs qui touchent l'en-tête et la navigation** (331 essais) : 320 verts, 3
  instables (verts au second essai : `bibliotheque-liste-1159` à 1440, `codex-1012-fichier-d-origine` (1),
  `evaluer-relit-la-grille-1215`), 5 rouges. Trois étaient des bancs périmés par le lot (l'ancien libellé
  « Apporter mon matériel », le bouton Soutenir cherché dans l'ancien bloc), corrigés et repassés verts. Les deux
  autres sont le témoin à 360 px (#1240, ci-dessus).
- **Spec du lot**, `en-tete-epure-2026-11-07.spec.js` : 8 essais verts, plus la production des captures.
- **Essais de casse** : la correction du doublon retirée, la sentinelle rougit ; la fermeture par Échap retirée,
  l'essai du menu rougit ; le panneau réduit à 150 px, l'essai de la ligne Assistance rougit.
- **Verdict Playwright complet : PAS pris** (consigne : une fois, après l'accord de Grégoire sur les captures,
  avant la fusion).
