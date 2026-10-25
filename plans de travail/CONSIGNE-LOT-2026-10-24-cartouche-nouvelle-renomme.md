# Consigne – « + Nouvelle cartouche » renomme la cartouche ouverte ; changer la grille d'une cartouche la dédouble (source de #1144)

> Écrite par Cowork le samedi 24 octobre 2026 à 20 h 57 (Toronto, mesuré par `date`), sur `main` = `998e73c1`. Décision de Grégoire, 20 h 55 : « on corrige ». Origine : § 5 de `DEMANDE-RELECTURE-2026-10-24-chaines-etapes-3b.md` (mesuré par Claude Code) et § 2 de `VERDICT-RELECTURE-2026-10-24-chaines-etapes-3b.md` (l'hypothèse de Cowork). Bug de testeur (Grégoire) : **priorité sur le reste du plan**.

## 0. Avant tout

- D'autres sessions peuvent travailler en même temps : ne commence qu'une fois le lot en cours commité, sur un `main` à jour, sans suite qui tourne. Fichiers du § 3 modifiés par une autre session et non commités : arrête et dis-le. Pas de `git stash`.
- Rituel de début de session.
- Un commit de docs seul, fichiers nommés : ce fichier, `VERDICT-RELECTURE-2026-10-24-chaines-etapes-3b.md`, la ligne du plan.
- Le numéro : une fiche neuve au compteur commun (BACKLOG et `SUIVI-BUGS.md`), qui **nomme #1144** (règle du lien).

## 1. Ce qui est cassé (lu par Cowork dans `js/cartouches.js`, à reproduire avant tout correctif)

`initialiserNouveauCartoucheAvecEchelle` (l. ~3461) reprend `id: cartoucheActuel?.id || genererIdUnique('CART_')` (l. ~3494) et `cartoucheActuel?.commentaires`, avec le `grilleId` du formulaire. `sauvegarderCartouche` (l. ~1108) écrit dans `cartouches_{grilleId}` de la grille du moment et **ne retire rien de la clé d'une autre grille**. Deux gestes en sortent :

- **(a) « + Nouvelle cartouche » après une cartouche ouverte** : `creerNouvelleCartouche` (l. ~3516) ne remet pas `cartoucheActuel` à zéro. Même grille : la cartouche ouverte est renommée (mesuré par toi au lot 3b). **Autre grille choisie** : l'id de la cartouche ouverte s'écrit sous la clé de l'autre grille, avec ses commentaires (indexés par les ids de critères de l'ancienne grille), et l'originale reste sous la sienne.
- **(b) Changer la grille d'une cartouche ouverte** (`onChangeSelectionCartouche`, l. ~3411, après le `confirm` « Changer de grille va reconfigurer la matrice… »), puis enregistrer : même résultat, l'id sous deux clés.

**Hypothèse à éprouver** : (a)-autre grille ou (b) produit exactement le mécanisme (1) de #1144 (la ligne #1144 de `Retours des testeurs/SUIVI-BUGS.md` : « même id sous deux clés de grille, `grilleId` changé, critères non remappés, sans retrait de la source »). **Écris d'abord les essais qui reproduisent les trois cas** (a-même grille, a-autre grille, b) **et montre-les rouges.** Dis, pour chacun, s'il reproduit les deux copies.

## 2. Ce qu'on fait (décidé par Cowork ; si la mesure le contredit, dis-le)

1. **(a) « + Nouvelle cartouche » crée une cartouche neuve** : un id neuf, aucun commentaire repris, quelle que soit la fiche ouverte avant. La matrice s'ouvre vide (aujourd'hui, elle montre déjà le texte de l'ancienne).
2. **(b) Changer la grille d'une cartouche déjà enregistrée en fait une copie pour la grille choisie** : un id neuf, sous la clé de la nouvelle grille ; les commentaires passent par `cartoucheCorrespondance.rattacher` (`js/cartouche-correspondance.js` : par id puis par nom, rien de jeté) ; **l'originale reste intacte**, sous sa grille, pour les évaluations et les productions qui la portent. Motif : un déplacement retirerait la cartouche de la clé que lisent les évaluations déjà faites (elles cherchent la cartouche sous leur grille), et Grégoire ne veut aucune disparition de données ; une copie ne perd rien. Une cartouche **en création** (jamais enregistrée) change simplement de grille, comme aujourd'hui.
3. **Les mots du `confirm` de (b)** (mots d'interface, Cowork) : « Changer de grille crée une copie de cette cartouche pour la grille choisie. L'originale reste telle quelle. Les commentaires des critères communs passent dans la copie. Continuer ? » Après la copie, la fiche ouverte est la copie, et le menu la montre.
4. Mesuré par Cowork : `?.id || genererIdUnique` n'existe qu'à cet endroit de `js/` ; les quatre autres éditeurs n'ont pas ce défaut. Revérifie d'un `grep`.

## 3. Où

`js/cartouches.js` (`creerNouvelleCartouche`, `onChangeSelectionCartouche`, `initialiserNouveauCartoucheAvecEchelle`, `sauvegarderCartouche`) ; `js/cartouche-correspondance.js` en lecture (`rattacher`) ; les bancs de #1144 (`tests/unit/cartouche-criteres-grille-1144.test.js`) à garder verts.

## 4. Pièges

1. **Stock** : chez Grégoire, la copie du mécanisme (1) est déjà rangée (console `CartouchesDecalees`, 24 oct. au matin). Rien à réparer d'office : dis-le.
2. Le dialogue de doublon de nom (`sauvegarderCartouche`) : une copie qui garde le nom de l'originale sous une autre grille ne doit pas déclencher un écrasement. Mesure-le.
3. Le lot 3b vient de poser la chaîne de la cartouche : elle suit la fiche neuve et la copie.
4. Les productions qui portent l'originale gardent l'originale (aucune référence réécrite).
5. Sécurité : règles 1 et 2.

## 5. Preuve exigée

- Les trois essais du § 1, rouges avant, verts après (WebKit, noms fictifs). Plus : la copie de (b) a un id neuf, l'originale est identique octet pour octet avant et après, les commentaires des critères communs sont dans la copie ; « + Nouvelle » ouvre une matrice vide.
- Vitest pour la logique extraite (s'il y en a une). Break-test.
- La ligne #1144 de `SUIVI-BUGS.md` : la source fermée **si** un essai reproduit les deux copies ; sinon, dis ce qui manque.

## 6. Clôture

- Demande de relecture : `DEMANDE-RELECTURE-2026-10-24-cartouche-nouvelle-renomme.md`.
- Pas de release, de verdict ni de push sans le signal de Grégoire.
