# Rapport – « Par standards » trouvable en vue simple (22 nov. 2026)

**Dernier relais** : branche `lot/vue-simple-porte-standards`, partie de `origin/main` `78e952293` (1.254.0), à jour
avec `main` (aucun commit de `main` depuis). Arbre : `../labo-codex-porte-standards`. **LOT COMPLET, PRÊT POUR LA MISE EN
LIGNE** : release 1.255.0, build `1122-0956`. Tous les mots affichés sont acceptés par Grégoire (9 h 12, 9 h 39, 9 h 54 ;
fichier `TEXTES-2026-11-22-vue-simple-porte-par-standards.md`), sauf le TITRE de l'entrée de Nouvelles (« « Par
standards », trouvable en vue simple »), proposé. **Reste, avant le push** : le verdict complet WebKit sur le Mac
(`node scripts/verdict-en-morceaux.mjs`, Cowork, Chrome et Safari fermés, secteur), puis fusion en avance rapide dans
`main` et push, sur le feu vert de Grégoire. Le mandat des critères part d'ici, sur une branche à part.
## 1. Ce qui change à l'écran

- Accueil, étapes 2 et 3 : les textes acceptés (`TEXTES-2026-11-22-vue-simple-porte-par-standards.md`, V1 et E3).
- « Ta pratique », groupe dont le modèle ne change plus (des productions ; par standards : un niveau inscrit) : la phrase
  F1 (« des productions ou des résultats », 9 h 54) sous la ligne « Modèle », puis « Nouveau groupe », qui ouvre l'écran Classe, formulaire de création ouvert. Pendant la
  démonstration, le bouton manque (comme à l'écran Classe : la création y est refusée) ; la phrase reste.
- La garde n'a pas bougé (`_modeleChangeable`).

## 2. Le chemin du groupe d'essai, mesuré (WebKit)

« Nouveau groupe » → Classe, formulaire ouvert → coller une liste → « Classe créée » → « Choisir ma pratique » → trois
cartes, « Par standards » comprise → le champ « Tes cibles, une par ligne ». Il ne casse pas. **Une marche** : la même
liste que le premier groupe est refusée en entier (« Toutes ces personnes sont déjà inscrites ce trimestre : le groupe
n'a pas été créé. »), règle de la vue étendue. Un groupe d'essai demande d'autres numéros de DA. Inscrit au rapport,
rien changé (issue 2, « inscrire et continuer » ; aucun symptôme vécu encore).

## 3. Les textes « ni… ni… », mesurés — ACCEPTÉS (décision A, 22 nov.), posés

Ils ne s'affichent que pour une pratique qui n'est d'aucune des trois familles (`familleDeLaPratique` rend `autre`) :
une pratique « Par standards » ne les déclenche jamais. Vrais pour ce qu'ils montrent, ils sont devenus incomplets : ils
laissent entendre que la vue simple ne suit que deux modèles. Propositions, à valider :

| Repère | Aujourd'hui | Proposé |
|---|---|---|
| `groupeMotAutres` | Un groupe dont la pratique n'est ni par sélection de productions ni par spécifications se suit en vue étendue. | Un groupe dont la pratique n'est ni par standards, ni par spécifications, ni par sélection de productions se suit en vue étendue. |
| `pratiqueAutre` | La pratique de ce groupe n'est ni par sélection de productions ni par spécifications : elle se règle en vue étendue. | La pratique de ce groupe n'est ni par standards, ni par spécifications, ni par sélection de productions : elle se règle en vue étendue. |
| `tableau.autreFamille` | Le tableau sert aux pratiques par sélection de productions et par spécifications. La pratique de ce groupe se suit en vue étendue. | Le tableau sert aux pratiques par standards, par spécifications et par sélection de productions. La pratique de ce groupe se suit en vue étendue. |

## 4. Preuves

- Banc `vue-simple.spec.js`, bloc « « Par standards » trouvable » : 4 essais neufs. Break-test : phrase retirée → 2 rouges ;
  navigation de « Nouveau groupe » retirée → 1 rouge à l'étape 2. Restauré.
- `vue-simple.spec.js` complet, WebKit : 56 verts. Voisins (épinglage des modèles actuels, à l'essai, modèle par standards,
  inscrire) : 15 verts. Vitest complet : 948 fichiers, 12 304 verts.
- Référence épinglée des modèles actuels : seuls les deux textes de l'accueil changent (voulu).
- Sentinelle du renommage du 20 nov. : V1 lu dans le fichier du 22 nov., qui le remplace.

## 5. « Créer un groupe d'essai » (décision de Grégoire, 22 nov., 9 h 39)

- **Où** : à l'écran Classe, dans le formulaire de « Nouveau groupe » (y compris quand on y vient de « Ta pratique »).
  Pas à la création d'une toute première classe (le mandat parle de créer un AUTRE groupe), ni pendant la démonstration.
- **Ce qu'il crée** : un cours « Cours d'essai » (puis « Cours d'essai 2 »… par la règle des noms par défaut), son groupe,
  quatre personnes fictives : Agile Renard, Curieuse Loutre, Patient Hibou, Tenace Tortue (la façon de la démo, animal et
  qualité, sans ses noms). Puis l'écran Classe avec l'avis et « Choisir ma pratique », comme après « Classe créée ».
- **DA** : `ESSAI-<série>-<rang>` (ex. `ESSAI-1-01`). Un vrai DA a sept chiffres ; une liste collée refuse ce format, donc
  il ne peut venir que du bouton. Pas le préfixe `DEMO` de la démo : `parcours-classe.js` le lit comme « venu du pack ».
- **Deux groupes d'essai** : la série est la plus petite dont aucun DA n'est pris ce trimestre (série 2 au second groupe ;
  la série d'un groupe retiré redevient libre).
- **Rien d'existant n'est touché** : le geste lit seulement les DA pris ; il écrit un cours neuf, un groupe neuf, quatre
  fiches ajoutées. Mesuré par le banc : l'empreinte du premier groupe (étudiant·es, productions, résultats, pratique)
  identique avant et après deux groupes d'essai et un retrait.
- **Retrait** : celui de tout groupe (« Retirer ce groupe », tant qu'il ne porte aucun résultat). Rien d'ajouté.

**Mots proposés** : nom du cours « Cours d'essai » (affiché « Cours d'essai · groupe 1 ») ; aide « Pour essayer un modèle
sans toucher à tes groupes : un groupe de quatre personnes fictives, rien à coller. » ; avis « Groupe d'essai créé, avec
4 personnes fictives. » ; refus de la liste, retouche NON posée : « Toutes ces personnes sont déjà inscrites ce trimestre :
le groupe n'a pas été créé. Pour essayer un modèle, utilise « Créer un groupe d'essai ». »

**La colonne vide (signalé, rien changé)** : en vue simple, « + Production », un nom, « Ajouter » crée une colonne sans
aucun résultat ; c'est le premier geste de l'écran Résultats. Le cas « a déjà des résultats » sans résultat est donc
probable chez quiconque ouvre le tableau avant de régler son modèle. Sortie existante : « Retirer la colonne » (offert
tant qu'elle ne porte rien) rend « Changer de modèle ».

**Preuves** : Vitest `elevesDEssai` (séries, format refusé à la liste collée) ; banc « Créer un groupe d'essai », 2 essais.
Break-tests : série figée à 1 → unitaire et parcours rouges ; garde de la démo retirée → essai de la démo rouge. Banc
de la vue simple et voisins : 63 verts (WebKit). Vitest complet : 948 fichiers, 12 305 verts.

## 6. Clôture (22 nov., 9 h 56 à 10 h 05)

- Décisions de 9 h 54 posées : nom du cours, aide, avis, refus de la liste (qui nomme le bouton, interpolé) ; phrase F1
  changée ; ligne 1 de Nouvelles ajustée (« des productions ou des résultats »).
- Audit statique contre `main` : aucun `innerHTML` neuf hors `_ecrire`, aucun handler inline, aucun `eval`, aucun
  `console.log` ; aucune zone protégée ni module sensible touché. Specs : aucun `page.click`/`waitForTimeout` ajouté.
- Bancs (WebKit, Mac) : vue simple, épinglage des modèles actuels, « à l'essai » : 63 verts. Vitest complet : 948 fichiers,
  12 305 verts. Version : quatre points synchrones, 1.255.0 / `1122-0956`.
- Complexité (par rapport à la 1.254.0) : au-dessus de 15 : 434 → 434 ; somme 10 950 → 10 950 ; au-dessus de 30 : 75 → 75.
- **Non pris** : le verdict complet WebKit (Cowork ouvert : règle 8 de `PROTOCOLE.md`). Rien poussé sur `main`.
