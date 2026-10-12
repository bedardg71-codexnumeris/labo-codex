# Demande de relecture – lot 18 : le code mort, la suite

> Claude Code, 11 octobre 2026, 17 h 09 (mesuré par `date`). Consigne : `CONSIGNE-DU-JOUR.md`, série des lots 14 à 19.
> Sur `main`, **non poussé, pas de release, pas de verdict Playwright**. Vitest complet vert (740 fichiers, 8 658 essais).

## 1 · Ce qui change pour l'usager

Rien à l'écran. Environ 1 700 lignes de code que rien n'atteignait sont retirées ; deux fonctions changent de nom.

## 2 · Fiche par fiche

| Fiche | Commit | Remesure sur main | Geste |
|---|---|---|---|
| #469 | `200cf365` | `pratique-notation-v2.js` (1 098 lignes) : ses 14 cibles `getElementById` absentes d'`index.html` ; ses trois appelants gardés (appliquer une config SPE, `pratiques-bibliotheque.js`) sortaient sans rien faire ; ses 31 noms exportés, cités nulle part ailleurs (js, index, `noms_stables.json`, specs) | fichier, balise, trois appels ; huit bancs ajustés ; l'exception nommée de la sentinelle #555 (#592) tombe avec lui |
| #469 | `46f5301b` | grappe `calculerNoteFinale` de `PratiqueConfigurable` : aucun appelant ; ses cinq méthodes n'étaient appelées que par elle | 250 lignes ; `appliquerDoubleVerrou` reste (réemployé par #897) ; un commentaire d'`evaluation-calcul.js` qui citait la méthode retirée, corrigé |
| #469 | `918a3736` | `initialiserPratiquesPredefines` : aucun appelant | retirée |
| #722 | `1cb11ad8` | `chargerPortfolioEleveDetail`, `toggleArtefactPortfolio`, `toggleArtefactPortfolioFromEl` : conteneur absent | 316 lignes ; deux commentaires qui y renvoyaient |
| #689 | `24d2a421` | deux fonctions « Générique » | `assurerGrilleDeDepart`, `assurerCartoucheDeDepart` (code, six bancs, deux specs) ; les identifiants de données `GRILLE_GENERIQUE` et `CART_GENERIQUE` ne changent pas |
| #587 (en partie) | `a0672025` | `fermerModalBibliothequePratiques` : deux corps identiques, celui de `pratiques.js` (chargé après) gagnait ; `export-pdf.js` posait deux fois deux noms | une définition, une pose ; cliquet #557 abaissé à quatre |
| #791 | — | **se ferme sur la mesure** : `groupe.js` est parti au lot 12 (`ee9a0e1d`) | aucun |

Vérifications : chaque retrait prouvé par `grep` d'appelants et Vitest complet ; une mutation rouge par sentinelle neuve (#469 grappe, #722, #587) ; #689 verrouillé par l'absence des anciens noms.

## 3 · Coupé, avec la mesure

- **L'îlot de `pratiques.js`** : 40 fonctions n'ont aucune référence hors du fichier, mais plusieurs sont appelées par des fonctions vivantes du même fichier (`_normPratique` × 9, …). Il faut le graphe d'appels interne : un lot à part.
- **Le trio « modèles de pratiques »** de `pratiques-bibliotheque.js` (`chargerDropdownModelesPratiques`, `appliquerModeleSelectionne`, `ouvrirModaleSauvegardeConfig`) : cible `v2-spec-dropdown-modeles` absente, aucun appelant ; ce qu'il entraîne (`genererSelecteurModelesPratiques`, peut-être `appliquerConfigurationPratique` et `sauvegarderConfigurationActuelle`) reste à mesurer. Trouvé en retirant `pratique-notation-v2.js`.
- **L'ancienne génération des grilles, échelles et cartouches** et **l'outil de diagnostic (I14)** : pas ouverts.
- **#628** : `#selectGrilleTemplate` (un `<div>` vide) est lu par huit sites de `grilles.js`, et `chargerGrilleTemplate` est inscrite à `noms_stables.json` (zone protégée). Lot à part, et une décision sur le nom protégé.
- **#587, le reste** : `afficherSection` (trois fichiers), `afficherSousSection`, `afficherTableauProductions`, `_apresOuvertureFichier` (le cliquet #557 les nomme) ; les autres noms définis dans plusieurs fichiers sont presque tous privés à des IIFE.

## 4 · Ce qui revient à Grégoire

**#722 – `selectionnerArtefactsSelonModalite` n'a plus d'appelant**, mais elle porte la règle « Hybride » qu'il a tranchée le 10 sept. (les N meilleures de la Sélection plus toutes les Obligatoires ; banc #816). Gardée. La retirer avec son banc, ou la garder pour un futur panneau, lui revient. La clé `portfoliosEleves` n'a plus d'écrivain : son stock reste tel quel.

## 5 · Ce que j'ai supposé – une ligne chacune

- #469 : un fichier dont toutes les cibles DOM sont absentes et dont aucun nom n'est cité ailleurs est mort, même chargé.
- #469 : la fiche BACKLOG #592 (l'exception de la sentinelle #555) est réglée par ce retrait.
- #689 : « de départ » est le mot de l'écran (« Grille de départ ») ; le nom suit.
- #587 : les deux corps de `fermerModalBibliothequePratiques` font la même chose (`BibliothequeUI.fermerModal` retire la modale) : rien ne change.
- Les specs Playwright touchées par #689 (deux) n'ont pas été relancées ; le changement y est un renommage.

## 6 · Item de Nouvelles proposé

Aucun : rien ne change à l'écran.
