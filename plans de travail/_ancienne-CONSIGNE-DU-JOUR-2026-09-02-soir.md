# Consigne du jour — les suppressions disent vrai *(énoncé 8, volets A · C · D)*

> **Écrite le 2 septembre 2026 en fin de soirée, par Cowork, avec Grégoire, POUR DEMAIN.**
> Elle remplace la consigne du cinquième énoncé, **exécutée, vérifiée à l'écran et publiée**
> (release **1.111.0**, `9fe13749..1402a17c`).
>
> ▣ **État à l'écriture, mesuré** : `HEAD` = `1402a17c`, `git rev-list --count origin/main..HEAD`
> rend **0**. Six notes non suivies dans `plans de travail/` : elles sont à Grégoire, **ne les
> commite pas.**
>
> ⚠ **Ce fichier a été écrit la veille. REMESURE TOUT** (règle 1) : les numéros de ligne
> ci-dessous ont déjà bougé une fois entre le 31 août et ce soir, et le lot du cinquième énoncé a
> touché `js/grilles.js`. ⮕ **Chaque `grep` de cette consigne est à rejouer, pas à croire.**
>
> ⛔ **Le premier geste de la séance n'est pas ce lot** : le rituel d'ouverture doit rendre le
> verdict de GitHub sur `1402a17c`. **Rapporte-le avant tout le reste.**

---

## Le mandat — le dernier énoncé encore ouvert

*« Ce qu'un utilisateur détruit, il l'a voulu ; ce qu'il garde, il le retrouve. Les messages de
suppression disent vrai, et la portée d'une suppression est celle qu'on annonce. »*

▣ **C'est le seul des huit qui reste.** Six sont finis, deux sont éprouvés par Grégoire.

⚠ **Quatre volets, et ils ne parlent PAS de la même suppression.** Trois s'exécutent aujourd'hui ;
**le quatrième attend un arbitrage de Grégoire et n'est PAS dans ce lot.**

---

## Volet A — la copie d'un élève : dire la portée réelle *(#560 résiduel)*

↻ **TRANCHÉ PAR GRÉGOIRE le 2 septembre.** Question posée : quand on supprime définitivement la
copie d'un élève, qu'est-ce qui part avec ? ⮕ **Sa réponse : TOUT ce qui touche le couple**
(cet élève, cette production) — originale, reprises, évaluation d'un fichier réimporté.

▣ **Donc le comportement actuel du code est le BON.** Le constat **B5** de l'audit du 25 août
décrivait cette portée comme « trop large » : **elle ne l'est pas.** ⛔ **N'ÉLARGIS NI NE
RESTREINS RIEN.** Ce volet ne touche pas au modèle de données.

⮕ **Le travail : que la modale annonce la portée réelle, en français d'utilisateur, avant le
geste.** Aujourd'hui elle ne le dit pas.
⚠ **Mesure d'abord ce qu'elle dit**, et cite-le dans ton rapport avant de le remplacer.
⚠ **Les mots sont à Grégoire** — c'est une phrase qu'il lira au moment de détruire quelque chose.
⮕ **Propose-lui deux ou trois formulations exactes, ne compose pas à sa place.**

## Volet C — la cartouche : l'avertissement cesse de mentir *(#647)*

**Remesuré ce soir** (les lignes du 31 août avaient bougé de ~45) :
`verifierDependancesCartouche` → `js/donnees-v2.js:1137` ·
`supprimerCartoucheDefinitivement` → `js/donnees-v2.js:1667`.

▣ **Le mensonge, mesuré le 31 août** : `supprimerCartoucheDefinitivement` n'écrit que
`bibliothequeCartouches`. Elle **ne touche jamais** `cle('cartouches_<grilleId>')`. Or la modale
annonce *« N évaluation(s) — les rétroactions associées seront perdues. »*
▣ **Les évaluations lisent la cartouche depuis l'ANCRAGE, jamais depuis la bibliothèque** — trois
sites indépendants. ⮕ **Aucune rétroaction n'est perdue, et la cartouche SURVIT dans son
ancrage.** L'avertissement annonce une perte qui n'a pas lieu **et** tait une survivance qui a lieu.
▣ **Effet croisé** : `compterCartouchesGrille` continue de la compter — la garde côté grilles
bloque en citant une cartouche que l'enseignant croit supprimée. **Il valide un nombre faux.**

↻ **REMÈDE RETENU — option 2 : l'avertissement décrit ce qui se passe réellement.**
▣ **Motif de l'arbitrage, et il est décisif** : *l'option 2 est vraie quel que soit le choix
produit futur.* Tant que le comportement est celui qu'il est, l'avertissement ment ; le corriger
n'engage aucun futur.

## Volet D — la production : un garde mort *(#649)*

`js/donnees-v2.js:1718` teste `typeof retirerProductionDeLaBibliotheque === 'function'`.
▣ **Le symbole ne rend que deux occurrences dans tout le dépôt** : le garde et son propre appel
(1718-1719). **Aucune déclaration.**
▣ **Témoin — le motif trouve bien ce qui existe** : `retirerPratiqueDeLaBibliotheque`,
`retirerGrilleDeLaBibliotheque`, `retirerCartoucheDeLaBibliotheque`,
`retirerEchelleDeLaBibliotheque` sont tous déclarés.
⮕ **Rassurant** : le repli écrit `'bibliothequeProductions'`, la clé canonique. **Aucun décalage
aujourd'hui.**
⚠ **Latent** : le jour où quelqu'un déclare une fonction de ce nom, le chemin bascule **en
silence**. **Un garde mort est une bascule armée.**
⮕ **Remède** : retirer le branchement mort, appeler directement le chemin réel.
⚠ **Zéro symptôme ⮕ c'est le DERNIER des trois**, et il ne justifie rien à lui seul.

---

## ⛔ CE QUI N'EST PAS DANS CE LOT

**Le volet B — l'échelle *(#648)*.** `verifierDependancesEchelle` (`js/donnees-v2.js:1188`) compte
les pratiques seulement, **désactive le bouton sans issue**, ne compte pas les évaluations qui
dépendent pourtant de l'échelle, et ne lit qu'**un seul trimestre**.
⮕ **Il attend un arbitrage de Grégoire** : quand on supprime une échelle dont des évaluations
dépendent — **refuser, cascader, ou migrer** (le code sait migrer) ? **C'est pédagogique avant
d'être technique.** ⛔ **Ne le tranche pas. Ne le code pas.**

---

## ⚠ CE QUE LA REMESURE DE CE SOIR A TROUVÉ — à vérifier avant de coder

▣ **`supprimerEchelleDefinitivement` existe en DEUX corps** : `js/echelles.js:2730` (exporté sur
`window` à la l. 4866) et `js/donnees-v2.js:1683` (local, dans une IIFE, **non exporté**).
⮕ **Ce ne sont pas deux définitions qui s'écrasent** — chaque fichier appelle la sienne. **Ce sont
deux CHEMINS de suppression indépendants** : l'un depuis l'onglet Données, l'autre depuis
Conception › Échelles.
⚠⚠ **CONSÉQUENCE POUR LES VOLETS A ET C** : **vérifie si la même dualité existe pour les
cartouches et pour les fichiers.** `grep -rn "supprimerCartoucheDefinitivement" js/`.
⮕ **Corriger un message dans un chemin et pas dans l'autre laisserait la moitié du mensonge en
place** — c'est mot pour mot l'avertissement de la fiche #648. **Dis ce que tu trouves.**

---

## Fini quand

**Une modale de suppression annonce ce qui va réellement disparaître, et ce qui va survivre.**

▣ **Le témoin** : pour chacun des trois volets, cite **la phrase AVANT et la phrase APRÈS**, et le
chemin de code qui la produit.
⚠ **Et le témoin négatif, qui compte autant** : une suppression **complète et sans surprise** doit
continuer de se faire **sans un mot de plus**. Un correctif qui avertit partout n'avertit nulle part.

## L'ordre

- ⛔ **Rapporte d'abord le verdict de GitHub sur `1402a17c`** (rituel d'ouverture, §2.1).
- ⚠ Ce lot touche `js/` ⮕ **bump du bloc de jetons d'`index.html`**.
- `cd tests && npm run test:unit` pour travailler ; **`npm test` complet avant de dire que c'est
  prêt** — ce lot touche des chemins de destruction.
- Règle 6 : **tu commites, puis tu t'arrêtes.** Pas de release, pas de push.
- ⮕ **CE QUE GRÉGOIRE DOIT ALLER VOIR, et c'est un vrai geste** : ouvrir la modale de suppression
  d'une cartouche, et **lire ce qu'elle annonce**. Elle doit dire vrai — ni plus, ni moins.
  ⚠ **Qu'il ne confirme pas.** Lire suffit.
- Ce fichier se commite avec ton lot.
