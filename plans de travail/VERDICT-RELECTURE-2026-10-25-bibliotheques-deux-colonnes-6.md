# Verdict de relecture – Les bibliothèques en deux colonnes, lot 6 : les trois listes simples, puis le retrait (#1159)

> Cowork, dimanche 25 octobre 2026, 20 h 05 (Toronto). Relu : `DEMANDE-RELECTURE-2026-10-25-bibliotheques-deux-colonnes-6.md` (§ 1, 2, 5 à 8), le rapport de Claude Code relayé par Grégoire, l'emplacement des boutons « Consulter la bibliothèque » des trois listes dans `index.html` (section du Cadre). Pas relancé par Cowork. **À commiter sur la branche `bibliotheques-deux-colonnes`.**

## Verdict : **accepté, avec une retouche** (§ 2)

Les trois listes portent les mots validés ; « Mettre de côté » prend l'action de « Retirer de ma sélection », sans toucher les données écrites ; l'ancien rendu en cartes est retiré, et une sentinelle le garde retiré.

## 1. Mesuré, supposé, écarts

| Point | Cowork |
|---|---|
| Les métadonnées Creative Commons d'un cours ne s'écrivent plus en « Déposant » | **Accepté** : « Exporter » les demande toujours au moment d'exporter ; les fiches qui les portent les gardent. |
| Les deux gestes des cours redessinent la fenêtre | **Accepté.** |
| « Clos » en clair sous un trimestre clos | **Accepté.** |
| La compétence dans l'aperçu | **Accepté.** |
| Les bulles « dropdown » retirées plutôt que réécrites | **Accepté.** |
| Pas de bouton ⓘ sur les trois listes | **Accepté** : une aide fausse est pire que pas d'aide, et une liste simple se lit seule. |
| Le séparateur avant « Supprimer » | **Accepté.** |
| #679 monte de un | **Accepté** : `biblio2-voile` est un crochet du code. |
| « Importer des cours » toujours offert | **Accepté** : un geste caché redevient atteignable. |

## 2. La retouche

1. **Les mots neufs, décidés par Cowork** (des mots lus par l'enseignant·e, dans la suite des mots validés) :
   - la liste des cours vide : « Aucun cours pour l'instant. » (gardé) ;
   - « Mettre de côté » d'un cours : « Cours mis de côté. » ; « Remettre dans mes cours » : « Cours remis dans tes cours. » ;
   - « Mettre de côté » d'un groupe-cours : « Groupe-cours mis de côté. » ; « Remettre dans le menu » : « Groupe-cours remis dans le menu. » ;
   - plus aucune notification de ces trois fenêtres ne dit « ta sélection », « masqué » ni « avec succès ».
2. **Le code mort de l'ancien composant part avec lui** (le mandat du lot est le retrait ; « est-ce que je viens de le rendre orphelin ? ») : `BibliothequeUI.formaterMetadonnees`, la branche `onclick` de `_btnAttrs` (`onclickToDataAttrs`, qui n'échappe pas ses paramètres), et `genererBadgeSourceProduction` (`productions.js`), orphelin depuis les rangées du lot 3. Preuve par `grep` dans `js/`, `index.html`, `design-system.html` et `tests/` ; les essais qui ne lisaient qu'eux partent avec eux, motif écrit.
3. Les trouvailles 1 et 4 (§ 8) : **d'accord, 3**. La 5, le rouge de GitHub : **ce n'est pas une trouvaille**, il est traité sur `main` (`b4e0fd08`, la baseline Linux de #1114, relue ce matin) et disparaît au push de la fusion : rien à inscrire.
4. Ce verdict, dans le même commit.

## 3. La question de la sauvegarde de la branche : **l'option 1, on attend**

- **Pousser la branche** (option 3) passe par le hook, qui lance Vitest : le rouge anti-cache, accepté sur la branche, le refuserait, et on ne le contourne pas.
- **Pousser `main` seul** (option 2) pousserait aussi ses commits non poussés, dont six lots relus que Netlify mettrait en ligne sans version ni vérification complète.
- La fusion, la vérification complète et le push sont les étapes 3 à 5 du plan, ce soir, au signal de Grégoire. Les commits locaux survivent à un redémarrage du Mac.

## 4. Les Nouvelles

Le brouillon du § 7 est soumis à Grégoire. Une correction de Cowork avant soumission : le cinquième item dit « (Réglages › Cadre) » ; les boutons sont dans le Cadre : « dans le Cadre ». **Validé par Grégoire le 25 oct. à 19 h 59**, tel quel, avec cette correction (titre « Les bibliothèques, plus simples », huit items). Le texte validé sera posé par la release (étape 5 du plan), pas par cette retouche.
