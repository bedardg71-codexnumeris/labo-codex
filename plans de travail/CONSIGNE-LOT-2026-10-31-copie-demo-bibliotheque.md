# Consigne – Une copie faite pendant la démo rejoint ta bibliothèque

> Cowork, samedi 31 octobre 2026, 10 h 05 (Toronto). Décision de Grégoire du 29 oct., 8 h 00 (`TEXTES-2026-10-28-guidage-demo.md`, fin : « qu'une copie faite pendant la démo puisse rejoindre la bibliothèque de l'enseignant·e »), et de ce matin, 10 h 03 (« oui ») : **rendre visible et prouvé le chemin qui existe, pas en construire un second.**

## Ce que Cowork a mesuré (lecture du code, rien exécuté)

- « Dupliquer pour créer ma … » (cinq familles : `js/grilles.js:5647`, `js/echelles.js:2177`, `js/cartouches.js:1612`, `js/productions-liste.js:192`, `js/pratiques-gestion.js:1074`) passe par `BibliothequeUI.dupliquerEtEditerItem` → `forkerItem` (`js/bibliotheque-ui.js`) : la copie porte l'auteur de l'utilisateur, `isDemo: false`, `inspireDe`, et s'écrit dans `cle('<famille>Templates')`, donc `demo_*` pendant la démo.
- Dans la fenêtre de bibliothèque, cette copie a « Garder dans ma bibliothèque » (`garderGrilleDansBibliotheque` → `importerGrillesDansBibliotheque` → `ajouterGrilleALaBibliotheque`, clé GLOBALE `bibliothequeGrilles`). Aucune garde de démo trouvée sur ce chemin. `retirerItemsDemoDesGlobaux` et le pack ne touchent pas `bibliotheque*`.
- Donc, en lecture : copie en démo → « Garder dans ma bibliothèque » → hors démo, « Utiliser dans ce trimestre ». **À prouver à l'exécution** (étape 0).

## 0. Mesurer d'abord, avant d'écrire une ligne d'application

1. **Le parcours existe-t-il vraiment ?** Spec WebKit, pour la grille d'abord : démo active, « Dupliquer pour créer ma grille », « Garder dans ma bibliothèque », sortie de la démo, réinstallation du pack (version changée), un vrai trimestre, « Utiliser dans ce trimestre » : la copie est là, avec « Inspiré de … par Labo Codex ». Puis les quatre autres familles si leur chemin diffère.
2. **Ce qu'une copie emporte.** Pour chaque famille, ce que la copie référence par identifiant (une cartouche et sa grille, une production et sa grille, son échelle, sa cartouche, une pratique et ses productions…) et ce que ces références deviennent dans un vrai trimestre où la source de démo n'existe pas.
3. **Si une famille arrive inutilisable ou incohérente** (référence morte qui casse un écran ou un calcul) : NE PAS corriger dans ce lot. L'écrire au rapport et s'arrêter pour cette famille ; Cowork le soumet à Grégoire. Les autres familles continuent.

## 1. Le geste, là où l'on vient de dupliquer

En démo seulement, après « Dupliquer pour créer ma … », à l'endroit même où la copie s'ouvre en édition : une ligne et le bouton « Garder dans ma bibliothèque », qui appelle **la même fonction** que la fenêtre de bibliothèque (`garder<Famille>DansBibliotheque`), pas une copie de son code. Une fois gardée, l'état calme existant : « Aussi dans ta bibliothèque ». Hors démo, rien ne change.

Mots proposés par Cowork, **à valider par Grégoire avant la release** (le rapport les liste) :
- La ligne : « Cette copie reste dans la démo. Garde-la dans ta bibliothèque pour la retrouver dans tes vrais trimestres. »
- Le bouton : « Garder dans ma bibliothèque » (le libellé existant).

## 2. Le guidage dit la vérité

`js/accompagnement-contenu-popup.js`, « Autonomie » : « … et renomme la copie. Elle reste dans la démo : une nouvelle version du pack l'efface. » devient (proposition, à valider) : « … et renomme la copie. Elle reste dans la démo, sauf si tu la gardes dans ta bibliothèque : tu la retrouves alors dans tes vrais trimestres. »

## 3. Contraintes

- **Rien ne s'écrit dans les vraies données sans le geste de l'enseignant·e** : pas de copie automatique, ni à la duplication, ni à la sortie de la démo.
- Un seul chemin d'écriture vers la bibliothèque (zéro dette) : le bouton neuf appelle l'existant.
- Skill `integrite-globaux` : `bibliotheque*` sont des clés globales.
- Aucune suppression de donnée.

## 4. Fin

Gardes et break-tests (le parcours de l'étape 0 devient une garde ; le bouton n'apparaît qu'en démo ; il appelle la fonction existante). Commit avec cette consigne, Vitest entier, specs WebKit touchées ; pas de release, pas de push. Rapport `RAPPORT-2026-10-31-copie-demo-bibliotheque.md` : l'étape 0 en tête, famille par famille. Relecture de Cowork.
