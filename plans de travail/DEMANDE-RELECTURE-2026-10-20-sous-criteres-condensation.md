# Demande de relecture — Grilles de critères : sous-critères modifiables, espace vertical condensé

**20 oct. 2026, Claude Code, pour Cowork.** Mandat : Grégoire, 20 oct. 13 h 56, sur sa grille « Journal de lecture ».
Branche `feat/sous-criteres-condensation`, un commit. Pas de verdict complet ni de push (cadence de fin de journée).

## 1. Ce qui a changé

**Sous-critères d'un critère non algorithmique (`js/grilles.js`).** `rendreAttenduSousCriteres` (lecture seule, et
seulement si la dissection en avait écrit) est remplacé par `rendreSousCriteresCritere` : une rangée par sous-critère,
le nom seul, modifiable, chevrons et corbeille sur la même ligne, puis « + Ajouter un sous-critère ». La section se
montre même vide. Aucun geste neuf : `ajouterSousCritere`, `modifierSousCritere`, `supprimerSousCritere` (sa garde
codex inchangée), `deplacerSousCritereHaut/Bas` — ceux du gabarit algorithmique, qui écrivent déjà la forme de la
dissection (id, code, nom, ponderation 1.0, retroaction).

**Bornes de l'assistant**, lues chez lui (`materielAssistant.MAX_NOM`, `MAX_SOUS_CRITERES`) : la 31ᵉ est refusée sans
écriture (témoin), un nom de plus de 200 caractères aussi (champ marqué) ; le champ porte `maxlength="200"`.

**Une tranche du barème sur une ligne** : Nom, Points, Texte, marque, corbeille. Le Texte est un `textarea rows="1"`
qui prend la hauteur de son contenu (`ajusterHauteursAuto` : au rendu, à la frappe, et par `ResizeObserver` quand la
liste change de largeur ou passe de cachée à visible). `overflow-y: auto` en filet : si l'ajustement manque, le texte
défile, il n'est jamais coupé. Jusqu'à 1 024 px, le Texte passe sous Nom/Points.

**En-tête de la grille (`index.html`)** : Nom, Type, Description dans la même rangée flex ; `precisionTypeGrille` reste
sous le menu, `avisTypeCriteresGrille` reste sous la rangée.

**Indentation** : `#listeCriteres` 16 px, barème/sous-critères (et le gabarit algorithmique) 16 px de plus ; 8 px +
8 px jusqu'à 1 024 px.

## 2. Ce que j'ai supposé (à corriger en dix secondes si c'est faux)

1. Les bornes valent pour **tout** critère, algorithmique compris (mêmes fonctions, une seule règle).
2. Le focus sur le nom du sous-critère neuf vaut aussi pour le gabarit algorithmique (même fonction).
3. Un critère holistique ou sans type montre lui aussi sa section vide : la demande dit « tout critère non
   algorithmique ». Coût : un titre et un bouton par critère.
4. Le menu de complexité, les codes et la pondération d'un sous-critère restent cachés hors algorithmique ; un critère
   qui passe d'analytique à algorithmique retrouve ses sous-critères comme candidats-codes, comme avant ce lot.

## 3. Textes d'écran nouveaux — de Claude Code, à valider par Grégoire

- `aria-label` de chaque champ : « Nom du sous-critère 1 », « … 2 »…
- Refus : « Au plus 30 sous-critères par critère » ; « Le nom d’un sous-critère fait 200 caractères au plus ».
- Repris tels quels (déjà à l'écran) : « Sous-critères », « + Ajouter un sous-critère », « Supprimer ce sous-critère ? ».

## 4. Preuves

- Vitest (depuis `tests/`) : 789 fichiers, 9 276 tests verts. Nouveau : `sentinelle-sous-criteres-editables.test.js`
  (10 cas : rendu, gestes, bornes, **hypothèse « pas de codes d'annotation »**). Break-tests faits : borne d'ajout
  retirée → G.b rouge ; `codes-annotation` qui lit tout critère porteur du drapeau → A.a et A.b rouges ; section
  cachée sans sous-critère → R.b rouge. Code restauré après chaque essai.
- Révisés (invariants remplacés par la demande) : `materiel-lot3b1-visible` (L.b, L.d, H.a, H.b),
  `bareme-1-editeur` (H.a, portée de l'assertion), `sentinelle-467` (grilles.js 69 → 73, sans désescape, motif écrit),
  cliquet #679 (`gabarit-algo` a maintenant sa règle : retiré de la liste figée).
- Playwright (WebKit, Mac) : 21 specs ciblées (grilles, barème, dissection, aide), **48 verts**. Nouvelle spec
  `grilles-sous-criteres-condense.spec.js` (iPad 820 au doigt et Mac 1440). Elle a trouvé un vrai défaut, corrigé :
  le champ du nom faisait 36 px au doigt. `bareme-1.spec.js` : « tête empilée » remplacée par « nom et points côte à
  côte, texte dessous » (iPad) et « nom, points, texte sur une ligne » (Mac).

## 5. À regarder en particulier

- Le `ResizeObserver` (un par `#listeCriteres`, jamais déconnecté : la liste vit autant que la page).
- Observation hors lot, non inscrite : à 1 440 px, le champ « Nom du critère » de la rangée du critère est étroit
  (« Compréhension fic… ») — grille fixe en style en ligne (`2fr 140px 90px 150px 3fr`), antérieure ; l'indentation lui
  retire 16 px. Inscrire seulement si Grégoire le vit.

## 6. Point 3 du mandat — inscrit, pas corrigé

**#1125** au BACKLOG : les points tombent dans le texte par l'**assemblage** de la dissection pour une grille à niveaux
nommés (`materiel-dissection-lecture.js:740-746`), la clé étant le nom du niveau (`materiel-assistant.js:357`) et le
barème ne lisant les points que dans la clé (`bareme.js:134-143`). Le champ Points accepte « 3-4 ».

## 7. Le geste de Grégoire à l'écran

Grilles de critères → « Journal de lecture ». (1) Au Mac, l'en-tête tient sur une ligne ; chaque tranche aussi, le
texte entier visible. (2) Sous le barème du premier critère, « + Ajouter un sous-critère » : le curseur est dans le
champ ; taper un nom, sortir du champ, recharger la page : il est là. (3) Dans la tranche dont le texte finit par
« 3-4 », effacer « 3-4 » du texte et l'écrire dans Points : « 3 à 4 » s'affiche et « à compléter » disparaît.
