# Carte du volet A (lot 4) — les paliers d'une grille analytique : où le type se lit, où les bornes vivent, ce qui voyage

> **Mesurée et écrite le 4 septembre 2026 par Claude Code**, sur la branche `claude/lot-4-gabarit-algo-paliers`,
> avant d'écrire le volet — ce que la consigne du jour (§3, volet A) demande de rendre à Cowork, pour la
> **relecture croisée obligatoire** (règle 2 : la cartouche est un format qui voyage).
>
> **Décision de Grégoire (4 sept., 7 h) : la voie (a).** L'échelle reste le mécanisme des paliers ; pour une grille
> analytique elle se présente comme des paliers en %, préremplie, et l'éditeur titre ses colonnes par les bornes.

## 1 · Où le formulaire de cartouche lit le type de la grille — mesuré : NULLE PART avant ce volet

`grep -n "\.type\b" js/cartouches.js` sur `e5d9c71f` : **une seule lecture**, `p.type !== 'portfolio'` (`:3605`),
sur une PRODUCTION (le menu « Consignes du travail », #549) — jamais sur une grille. Le formulaire ne savait pas
de quel type était la grille choisie.

**Écrit** : `grilleEstAnalytique(grille)` (cartouches.js) demande à `window.typeGrilleAffiche(grille)` (grilles.js,
lot 1) — **une seule source** : le type DÉCLARÉ (`grille.type`), sinon celui déduit des critères quand ils sont tous
du même type. Rien n'est déduit dans cartouches.js.

**Ce qu'affiche une grille MIXTE** — tranché, et dit : des critères à niveaux ET à points, **sans type déclaré**,
ne sont pas « analytique » (`typeGrilleAffiche` rend `''`) ⮕ **les mots des niveaux**, comme avant. Une grille
**déclarée** analytique dont un critère déroge (holistique) reste analytique : le déclaré l'emporte, comme au menu
du lot 1. Ce cas ne m'a pas paru didactique : les paliers sont ceux de l'échelle, les mêmes pour tous les critères
qui l'utilisent ; seul le MOT change. ⚠ Si Grégoire y voit autre chose, c'est un `if` dans `grilleEstAnalytique`.

## 2 · Où les bornes vivent — mesuré : sur l'échelle, jamais dans la cartouche

| Site | Ce qu'il fait | Bornes ? |
|---|---|---|
| `cartouches.js:471` (`initialiserNouveauCartouche`) et `:3698` (`initialiserNouveauCartoucheAvecEchelle`) | la cartouche **copie** les niveaux de l'échelle : `niveaux.map(n => ({ code: n.code, nom: n.nom }))` | non |
| `:620` (`afficherMatriceRetroaction`) | l'éditeur lit d'abord l'échelle **SOURCE** (par `echelleId`, puis `idOriginal`) — pour ses couleurs | **oui, sur la source** |
| `:630` | repli : la copie de la cartouche (code, nom) quand la source a disparu | non |
| `:1161`, `:2245`, `:3869` | reconnaître un code de niveau dans un texte importé (#531) | pas besoin |
| `:1228`, `:1290` | métriques (nombre de niveaux), complétion | pas besoin |
| `:2769` | le modèle texte et l'export texte (`lignesMatriceCartouche`) : le NOM du niveau | pas touché (texte pour l'assistant / l'enseignant) |

**Tranché** : l'éditeur **relit les bornes sur l'échelle source**, par le chemin qu'il emprunte déjà pour les
couleurs (`min`, `max` ajoutés à `niveauxAffichage`). **La copie que porte la cartouche ne change pas** (code, nom),
**la clé `critereId_niveau` ne change pas**, l'`echelleId` non plus : **rien de ce qui voyage ne bouge** — ni
export, ni partage, ni import n'ont à apprendre un champ. Sans bornes (copie seule, source disparue), le titre de
colonne retombe sur le nom du niveau, et le message « pas encore de paliers » remplace « pas encore d'échelle ».

## 3 · Le préremplissage — mesuré et tranché

L'échelle de départ est `ECHELLE_IDME_DEPART` (`echelles.js:584`, semée par `assurerEchelleIdmeDeDepart`, retirable
par l'utilisateur, cf. `IDS_GABARITS_HARDCODES`). **Règle** : grille analytique choisie ET aucune échelle choisie
ET l'échelle de départ dans la base ET dans la sélection (`dansBibliotheque !== false`) ⮕ elle est choisie dans
le menu et la cartouche s'y lie. **Sinon rien de prérempli** (on n'invente pas une échelle, #578) : l'enseignant
choisit. Une échelle déjà choisie n'est jamais remplacée ; une grille holistique ou mixte n'est jamais préremplie.
Deux chemins : le changement de grille au formulaire (`onChangeSelectionCartouche`) et « ajouter une cartouche à
cette grille » depuis la barre latérale (`initialiserNouveauCartouche`).

## 4 · Ce qui change à l'écran, et les MOTS — ⚠ [EN ATTENTE] proposés à Grégoire, pas arrêtés

Tous dans **un seul endroit** : `LIBELLES_PALIERS` et `libellePalier` (cartouches.js, bloc « LOT 4, VOLET A »).

| Où | Grille analytique | Sinon (inchangé) |
|---|---|---|
| le champ du formulaire (`index.html`, `#motEchelleCartouche`) | **« Paliers (bornes en %) »** | « Échelle (niveaux) » |
| le coin de la matrice | **« Critère / Palier »** | « Critère / Niveau » |
| les titres de colonnes | **« 0–64,99 % », « 65–74,99 % », « 75–84,99 % », « 85–100 % »** (les bornes exactes, en français, tiret demi-cadratin, espace insécable avant %) | « I · Insuffisant »… |
| la case vide | « Commentaire pour Langue - 0–64,99 % » | « … - Insuffisant » |
| sans échelle résolue | « Cette cartouche n'a pas encore de paliers. Choisis-les ci-dessus : leurs bornes deviendront les colonnes de la matrice. » | le message #578 |

⚠ **Décidé seul, dit** : la forme des bornes est **exacte** (« 0–64,99 % »), celle que l'éditeur d'échelles
affiche — le cadrage écrivait « 0–64 % » ; un arrondi cacherait où tombe 64,5 (niveau I par les bornes). Si
Grégoire préfère l'arrondi, c'est `formaterBornePalier`, une ligne.

## 5 · Ce qui ne bouge pas

Le calcul (aucune sentinelle du calcul ne change), la déduction du niveau par les bornes (lot 3), les collecteurs
de `criteres[]`, tout ce que l'élève lit, les données de qui que ce soit, le modèle texte de la cartouche. La
**réserve du lot 3** (points sans niveau déductible : échelle à trous) reste inscrite — ce volet ne touche pas aux
bornes elles-mêmes, il les affiche.

## Témoins

`tests/unit/sentinelle-lot4-A-paliers-analytiques.test.js` (16 cas, grilles.js + cartouches.js dans le même bac à
sable) ; `tests/integration/lot4-paliers-analytiques.spec.js` (WebKit : le formulaire réel, les deux grilles, la
forme de ce qui est enregistré). Le champ garde sa marque « obligatoire » (sentinelle #506 verte).
