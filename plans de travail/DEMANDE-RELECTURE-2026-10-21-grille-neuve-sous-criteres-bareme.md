# Demande de relecture – Une grille neuve se construit entière (#1130, lié à #1120)

> Claude Code, 21 octobre 2026, 8 h 35. Consigne : `CONSIGNE-LOT-2026-10-21-grille-neuve-sous-criteres-bareme.md` (avec son complément de 8 h 11). Un commit sur `main`, non poussé, sans numéro de version ni verdict complet.

## Ce qui a changé

En création, un critère holistique ou analytique montre « Sous-critères » et « + Ajouter un sous-critère », et un critère analytique montre aussi « Barème » et « + Ajouter une tranche ». Textes, bulles, refus et disposition sont ceux de la modification, parce que c'est le même code : `afficherCriteresTemp` appelle `rendreAttenduCritere` avec `{ grilleId: 'temp' }`. Les gestes (ajouter, modifier, retirer ou déplacer un sous-critère ; ajouter, modifier ou retirer une tranche) prennent une **cible**, `temp` ou l'id d'une grille enregistrée. L'écriture passe par une seule fonction, `_modifierCritereCible` : en création, elle modifie `window.tempCriteres` en place ; sinon, elle écrit par la file (#510). C'est le modèle des collections (`_critereCibleCollection` et `_redessinerCibleCollection`, renommées `_critereCible` et `_redessinerCible` puisqu'elles servent maintenant au-delà des collections). Aucun second éditeur n'a été ajouté.

Rien ne s'écrit en base avant « Créer la grille », qui emporte `tempCriteres` tel quel (la branche de création n'a pas changé). Le barème est **sous** les sous-critères, dans les deux modes. Tant que la pondération d'un critère analytique est à 0, la phrase de 8 h 11 s'affiche sous le titre « Barème », dans le style de la mention existante (`grille-attendu-mention`). Elle s'en va et revient avec la pondération, sans redessiner la liste, et ne bloque rien.

## Captures (Mac, 1 440 px, WebKit)

| Création, pondération à 0 | Création, complète | Modification, après rechargement |
|---|---|---|
| `captures-2026-10-21-grille-neuve/phrase-a-0-mac.png` | `captures-2026-10-21-grille-neuve/creation-mac.png` | `captures-2026-10-21-grille-neuve/modification-mac.png` |

## Ce que j'ai supposé (à corriger en dix secondes si c'est faux)

1. **L'apostrophe de la phrase** est typographique (« d’abord »), comme les autres textes de l'éditeur (« d’une tranche »). La consigne écrit « d'abord ».
2. **Une pondération vidée** (`null`, marque « à compléter ») affiche aussi la phrase, puisque « dépasse 0 » n'est pas vrai.
3. **L'ordre complet** est le suivant : textes par niveau (critère holistique, ou analytique lié à une échelle), puis sous-critères, puis barème. Pour un holistique, rien n'a bougé.
4. **Le point 4 (changer le type en création)** : mesuré, il n'y avait rien à changer. Dans les deux modes, le geste pose le type et `avecProjectionNeuve`, et garde barème et sous-critères dans le critère. Le rendu suit le type.
5. **« Fermer » en création** : la question compte maintenant une tranche ou un sous-critère comme une saisie (`grilleEnCreationSaisie`). Sans ce changement, une tranche saisie sans nom de grille se perdait sans question. Le texte de la question n'a pas changé.
6. Ajouter, modifier ou retirer un sous-critère enregistré met maintenant à jour `dateModification`, comme le faisaient déjà ses déplacements et le barème.

## Bancs

- **Vitest** `tests/unit/bareme-grille-neuve-1120.test.js`, 13 essais : les sections et leur ordre ; rien d'écrit avant la création ; sous-critères et tranches écrits dans l'ordre ; un holistique sans barème ; les mêmes refus ; la question de « Fermer » ; la phrase présente à 0 et absente à 5, en création et en modification.
- **Break-tests** (code restauré à l'identique, vérifié par `cmp`) : barème absent en création → 8 rouges ; barème remis au-dessus → 3 rouges (dont G.h de `bareme-1-editeur`) ; phrase retirée → 3 rouges ; prédicat de « Fermer » remis comme avant → Q.a rouge.
- **Bancs mis à jour** (ce lot les déplace) : G.h et D1 suivent le nouvel ordre ; F.b de `materiel-lot3a-roles` lit l'ancre déplacée de `ajouterSousCritere` ; #522 C.b passe de 26 à 22 écritures par la file dans `grilles.js` (cinq écritures fusionnées en une).
- **Vitest complet** : 791 fichiers, 9 314 essais, verts.
- **WebKit** : `bareme-grille-neuve-1120.spec.js` (Mac 1 440 px et iPad 1 024 px au doigt : construire, rien en base, créer, recharger ; « Fermer » sans créer), puis `bareme-1`, `bareme-2-aide`, `grilles-sous-criteres-condense`, `grille-critere-ajoute-enregistrer-957` et `materiel-dissection-2a`. Les 22 sont verts.

## Inscriptions

- **#1130** (BACKLOG, coché, avec « vérifié comment ») et sa ligne aux corrigés de `SUIVI-BUGS.md`. Côté source seulement, aucun stock à réparer : rien n'était écrit.
- **#1131** : les sous-critères d'un critère algorithmique en création (point 5 de la consigne). Les gestes communs acceptent déjà `temp` ; il manque le rendu du gabarit et les sous-critères par défaut.

## Ce que je demande à la relecture

Les suppositions 1, 2 et 5. Ensuite, sur la capture `phrase-a-0-mac.png` : la phrase se lit-elle comme une aide, et pas comme une alerte ?
