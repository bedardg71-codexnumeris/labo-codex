# Consigne – Mesurer comment chaque pratique construit la note (lecture seule ; trou 2 de l'Aide, #1152)

> Écrite par Cowork le mercredi 28 octobre 2026 à 14 h 28 (Toronto, mesuré par `date`). À lancer **après** la retouche du lot 3 de l'Aide. Ce fichier ne remplace aucune autre consigne : n'y touche pas.
> **Pourquoi** : le trou 2 de l'audit de l'Aide (décision de Grégoire du 24 oct. : « ça dépend de la pratique de notation ; la note n'est pas construite partout de la même façon ») demande d'expliquer, famille par famille, comment la note se construit. Cowork rédigera les textes et Grégoire les corrigera ; mais ils doivent partir d'une **mesure sur banc**, pas d'une lecture : la lecture de Cowork a déjà trouvé deux points douteux (ci-dessous).

## 0. Avant tout

- **Lecture seule** : aucun fichier de `js/`, d'`index.html` ni de `styles.css` ne change. Un banc jetable (`tests/unit/…` ou un script) est permis ; il ne se commite que s'il devient une sentinelle utile (dis-le).
- Commit de docs seul : ce fichier et le rapport.

## 1. Ce qu'il faut mesurer, famille par famille

Sur des données **fictives**, pour chaque famille (Sommative, Sommative configurable, PAN – Spécifications, PAN – Standards, PAN – Dénotation) et chacun de ses modes :

1. **Ce qui entre dans la note** : quelles copies (verrouillées, non remplacées, portée non nulle, hors « Incomplet » : la règle du registre), et quelles productions (facultatives, artefacts d'un portfolio, production « portfolio », terminale, obligatoires).
2. **Comment elles se combinent** : la formule réelle, avec un exemple chiffré qui la vérifie (pondérations, N meilleurs / N derniers / Tous / Hybride, part de la terminale, paliers et forfaits des spécifications, jugement de la dénotation).
3. **Les cas qui changent la note** : non remis ; non recevable (la règle du 28 oct., #1175) ; « Incomplet ; travail en cours » ; jeton de délai ; jeton de reprise (l'originale gardée ou supprimée) ; « Notes finalisées » (hybride) ; une copie en points, en niveaux, algorithmique.
4. **Ce que l'étudiant·e et l'enseignant·e lisent** : note provisoire ou finale, arrondi (profil, PDF, export Léa), « note non constructible » et sa cause.

## 2. Deux points que la lecture de Cowork a trouvés (à trancher par la mesure)

- **Sommative, les artefacts d'un portfolio** : `PratiqueSommative.calculerPerformance` pondère par `production?.ponderation || 1` (`js/pratiques/pratique-sommative.js:~101`) ; une production à pondération 0 y pèserait donc 1. Le glossaire (lot 3) et la FAQ (lot 2d) disent que les artefacts n'ont pas de pondération et que « seul le portfolio compte ». Mesure : un artefact évalué entre-t-il dans la note sommative, et avec quel poids ?
- **Sommative configurable, « Portfolio de progression »** : l'assistant l'offre (« les artefacts contribuent à la note avec prise en compte de la progression », `js/wizard-pratique-v2.js:563`) et l'Aide le nomme (`accordeon-aide-pratique`) ; aucune lecture de cette règle n'a été trouvée dans les calculs (`grep` de `'portfolio'` et `reglesSpeciales` dans `js/pratiques/`). Mesure : la règle change-t-elle la note ? Si non, c'est la famille de #903 (une règle annoncée qu'aucun calcul n'applique).

## 3. Le rapport

`plans de travail/RAPPORT-2026-10-28-construction-de-la-note.md` : un tableau par famille (ce qui entre, la formule, l'exemple chiffré, les cas), puis **chaque écart** entre la mesure et ce que disent l'Aide (`pratique`, `acp`, `irrecevables`, `jetons-reprise`, la FAQ, le glossaire), l'assistant et les écrans, avec sa disposition (corriger maintenant / inscrire / commenter) **proposée, non appliquée** : rien ne se corrige dans ce lot. Preuves `fichier:ligne` et la commande ou le banc de chaque mesure.

Pas de release, de verdict ni de push.
