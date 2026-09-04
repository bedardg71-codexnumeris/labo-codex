# Ébauche de consigne — les suppressions disent vrai *(énoncé 8)*

> **Écrite le 2 septembre 2026 en soirée, par Cowork, à la demande de Grégoire.**
>
> ⚠⚠ **C'EST UNE ÉBAUCHE, PAS UNE CONSIGNE.** Elle n'est pas exécutable telle quelle : **un des
> quatre volets attend une décision de Grégoire** (volet B), et les numéros de ligne viennent de
> fiches du 31 août — **ils ont bougé ailleurs, ils ont sûrement bougé ici. À rejouer.**
>
> ⮕ **À finir avec lui avant de la donner à Claude Code.**

---

## L'énoncé, et les quatre choses qu'il recouvre

*« Ce qu'un utilisateur détruit, il l'a voulu ; ce qu'il garde, il le retrouve. Les messages de
suppression disent vrai, et la portée d'une suppression est celle qu'on annonce. »*

⚠ **Quatre fiches, et elles ne parlent PAS de la même suppression.** C'est la première chose à
tenir droit :

| | Ce qu'on supprime | État |
|---|---|---|
| **#560** résiduel | **la copie d'un élève** — le couple (DA, production) | ↻ **tranché le 2 sept.** |
| **#647** | une **cartouche** de la bibliothèque | remède retenu |
| **#648** | une **échelle** depuis l'onglet Données | ⚠ **arbitrage dû** |
| **#649** | une **production** de la bibliothèque | constat, aucun symptôme |

---

## Volet A — la copie d'un élève *(#560 résiduel)*

↻ **TRANCHÉ PAR GRÉGOIRE, 2 septembre 2026.** Question posée : quand on supprime définitivement
la copie d'un élève, qu'est-ce qui part avec ? Trois issues rendues (le fichier seul ; le fichier
et son évaluation ; tout ce qui touche le couple).
⮕ **Sa réponse : TOUT CE QUI TOUCHE LE COUPLE** — originale, reprises, évaluation d'un fichier
réimporté.

▣ **Donc le comportement actuel du code est le BON.** Le constat **B5** de l'audit du 25 août
décrivait cette portée comme « trop large » : **elle ne l'est pas.** Ce qui est fautif, c'est que
l'écran ne l'annonce pas.
⮕ **Le travail : que la modale dise la portée réelle**, en français d'utilisateur, avant que le
geste soit fait.
⚠ **N'ÉLARGIS NI NE RESTREINS LE COMPORTEMENT.** Ce volet ne touche pas au modèle de données.

## Volet B — l'échelle *(#648)* ⚠ **BLOQUÉ : ARBITRAGE DÛ PAR GRÉGOIRE**

`verifierDependancesEchelle` (`js/donnees-v2.js:1146`, à rejouer) :
· **compte les pratiques seulement**, puis **désactive le bouton de confirmation sans aucune
  issue** — un troisième régime, après « refuser avec porte de sortie » et « cascader » ;
· **ne compte pas les évaluations**, alors qu'elles dépendent bien de l'échelle : le champ
  `echelleId` est peuplé, relu à quatre endroits, et `supprimerEchelleDepuisSidebar` sait
  précisément **les migrer**. Elles sont orphelinées **sans blocage ni avertissement** ;
· **ne regarde qu'un seul trimestre** — elle lit `cle('pratiquesConfigurables')`, et `cle()`
  préfixe par le trimestre **actif**. ▣ **C'est le seul des cinq gardes à être monotrimestre** ;
  les quatre autres énumèrent tous les trimestres. Une pratique d'un autre trimestre ne bloque rien.

⛔ **CE QUI MANQUE POUR ÉCRIRE CE VOLET, ET C'EST À GRÉGOIRE :**
**Que doit-il se passer quand on supprime une échelle dont des évaluations dépendent ?**
Trois régimes existent déjà dans l'application — refuser avec une porte de sortie · cascader ·
migrer (le code sait le faire). **Le choix est pédagogique avant d'être technique** : une
évaluation dont l'échelle disparaît, est-ce une note à conserver, à migrer, ou une suppression
qu'on refuse ?
⮕ **Ne tranche pas à sa place. Pose-lui la question avec les trois régimes et leurs
contreparties.**

⚠⚠ **CIBLE, ET C'EST UN PIÈGE NOMMÉ** : le remède va dans **`js/donnees-v2.js:1624`**, l'ombre
locale — **PAS** dans `js/echelles.js:2610`. **Deux corps distincts, même nom, deux fichiers.**
N'en corriger qu'un refermerait une porte en laissant l'autre ouverte.

## Volet C — la cartouche *(#647)* · exécutable

`supprimerCartoucheDefinitivement` (`js/donnees-v2.js:1608`) n'écrit que `bibliothequeCartouches`.
Elle **ne touche jamais** `cle('cartouches_<grilleId>')`.
⮕ Or la modale annonce : *« N évaluation(s) — les rétroactions associées seront perdues. »*

▣ **Les évaluations lisent la cartouche depuis l'ANCRAGE, jamais depuis la bibliothèque** — trois
sites indépendants, tous sur `cle('cartouches_<grilleId>')`.
⮕ **Donc : aucune rétroaction n'est perdue, et la cartouche SURVIT dans son ancrage.** L'avertissement
annonce une perte qui n'a pas lieu **et** tait une survivance qui a lieu.

▣ **Effet croisé mesuré** : `compterCartouchesGrille` continue de la compter. La garde côté grilles
bloque donc en citant une cartouche que l'enseignant croit supprimée, et l'avertissement de cascade
l'inclut dans son N. **L'enseignant valide un nombre faux.**

↻ **REMÈDE RETENU — option 2 : l'avertissement cesse de mentir** (`verifierDependancesCartouche:1121`
décrit ce qui se passe réellement).
▣ **Motif de l'arbitrage, et il est décisif** : *l'option 2 est vraie quel que soit le choix produit
futur.* Tant que le comportement est celui qu'il est, l'avertissement ment ; le corriger n'engage
aucun futur.

## Volet D — la production *(#649)* · un garde mort, zéro symptôme

`js/donnees-v2.js:1659` teste `typeof retirerProductionDeLaBibliotheque === 'function'`.
▣ **Le symbole ne rend que deux occurrences dans tout le dépôt** : le garde et son propre appel.
**Aucune déclaration. La fonction n'existe pas.**
▣ **Témoin — le motif trouve bien ce qui existe** : `retirerPratiqueDeLaBibliotheque`,
`retirerGrilleDeLaBibliotheque`, `retirerCartoucheDeLaBibliotheque`, `retirerEchelleDeLaBibliotheque`
sont tous déclarés. Le zéro mesure donc quelque chose.

⮕ **Rassurant** : le « repli » écrit `'bibliothequeProductions'`, qui est bien la clé canonique.
**Aucun décalage aujourd'hui.**
⚠ **Latent** : le jour où quelqu'un déclare une fonction de ce nom, le chemin bascule **en silence**
vers une sémantique que personne n'a comparée. **Un garde mort est une bascule armée.**

⮕ **Proposition de Cowork, à valider** : retirer le branchement mort et appeler directement le
chemin réel. ⚠ **C'est un changement à zéro symptôme** — donc **le dernier de la liste**, et il ne
justifie pas à lui seul une séance.

---

## Ce que cette ébauche NE dit pas

⛔ **Aucun ordre entre les volets n'est arrêté.** ⮕ Suggestion de Cowork : **C** (la cartouche, le
seul mensonge actif dont le remède est déjà tranché), puis **A** (dire la portée réelle), puis **B**
une fois l'arbitrage rendu, et **D** en dernier.
⛔ **Aucune estimation d'effort**, aucune n'a été mesurée.
⚠ **Tous les numéros de ligne viennent de fiches du 31 août.** Ils ont bougé ailleurs dans le dépôt
depuis. **Rejoue chaque `grep` avant de coder** — et si un écart apparaît, **dis-le plutôt que de
l'ajuster en silence.**

## Ce qui est dû par Grégoire avant que ceci devienne une consigne

1. **L'arbitrage du volet B** : refuser, cascader, ou migrer ?
2. **Les mots des modales** — volets A et C. Ce sont des phrases qu'il lira lui-même au moment de
   détruire quelque chose. **Proposer, ne pas composer à sa place.**
