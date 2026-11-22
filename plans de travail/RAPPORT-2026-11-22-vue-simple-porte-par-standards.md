# Rapport – « Par standards » trouvable en vue simple (22 nov. 2026)

**Dernier relais** : branche `lot/vue-simple-porte-standards`, partie de `origin/main` `78e952293` (1.254.0). Arbre :
`../labo-codex-porte-standards`. Fait : les trois gestes, textes acceptés à 9 h 12 posés mot pour mot ; release 1.255.0
préparée (build `1122-0932`), ligne de Nouvelles PROPOSÉE. **Non fusionné, non poussé** : attend le feu vert de Grégoire
pour la ligne de Nouvelles et pour la mise en ligne, et sa décision sur les trois textes « ni… ni… » (§ 3).

## 1. Ce qui change à l'écran

- Accueil, étapes 2 et 3 : les textes acceptés (`TEXTES-2026-11-22-vue-simple-porte-par-standards.md`, V1 et E3).
- « Ta pratique », groupe dont le modèle ne change plus (des productions ; par standards : un niveau inscrit) : la phrase
  F1 sous la ligne « Modèle », puis « Nouveau groupe », qui ouvre l'écran Classe, formulaire de création ouvert. Pendant la
  démonstration, le bouton manque (comme à l'écran Classe : la création y est refusée) ; la phrase reste.
- La garde n'a pas bougé (`_modeleChangeable`).

## 2. Le chemin du groupe d'essai, mesuré (WebKit)

« Nouveau groupe » → Classe, formulaire ouvert → coller une liste → « Classe créée » → « Choisir ma pratique » → trois
cartes, « Par standards » comprise → le champ « Tes cibles, une par ligne ». Il ne casse pas. **Une marche** : la même
liste que le premier groupe est refusée en entier (« Toutes ces personnes sont déjà inscrites ce trimestre : le groupe
n'a pas été créé. »), règle de la vue étendue. Un groupe d'essai demande d'autres numéros de DA. Inscrit au rapport,
rien changé (issue 2, « inscrire et continuer » ; aucun symptôme vécu encore).

## 3. Les textes « ni… ni… », mesurés

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
