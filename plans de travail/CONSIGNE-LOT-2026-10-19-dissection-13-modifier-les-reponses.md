# Consigne – lot 13 : modifier les réponses d'un critère dans « Grilles de critères »

> Écrite par Cowork le lundi 19 octobre 2026 à 08 h 38 (Toronto, mesuré par `date`). **Symptôme vécu par Grégoire (8 h 36, capture, 1.207.0)** : dans la grille créée par la dissection à partir de celle d'une collègue, il veut corriger des réponses (« 2 points — L'introduction comporte… ») ; elles sont en lecture seule. C'est voulu provisoirement : `rendreAttenduCritere` (`js/grilles.js`, vers la l. 4477) dit « La modification vient après le 19 oct. ». **Décision de Grégoire, 8 h 37** : en faire le lot suivant. À faire **après** les lots 12 et 11, et leur relecture. Règles 2 et 7 de `PROTOCOLE.md`. Pas de verdict complet, pas de version.

## Ce que l'enseignant fait à la fin de ce lot

Dans « Grilles de critères », sous un critère qui porte des réponses, il corrige le texte d'une réponse, change ses points, en ajoute une, en retire une. Tout s'enregistre tout seul, et le témoin le dit, comme pour le reste de l'éditeur. Il recharge la page : ses corrections sont là.

## Ce qu'il faut, dans cet ordre

0. **Mesurer d'abord, avant tout code** : comment une évaluation enregistre la réponse choisie (la clé de `descripteurs.parNiveau` ? ses points ?) et ce que deviendrait une copie **déjà évaluée** si l'on change les points d'une réponse, ou si on la retire. Écris le résultat dans la demande. **Si une copie déjà évaluée pouvait changer de note ou perdre sa réponse en silence, arrête-toi avant le point 2 et rapporte-le** : c'est à Grégoire de dire ce qu'une note déjà donnée doit devenir.
1. **Le texte d'une réponse** devient modifiable, à sa place, dans le bloc d'aujourd'hui (champ de texte, enregistrement automatique, témoin partagé). Le titre « Ce qui est attendu à chaque niveau » reste (G1, décision du 18 oct.).
2. **Les points d'une réponse** (grille en points, sans échelle) : modifiables ; **ajouter** une réponse (texte vide, points à saisir) ; **retirer** une réponse, sur le modèle de ce que fait déjà l'éditeur pour retirer un critère (même geste, même confirmation). Pour un critère lié à une échelle, les niveaux viennent de l'échelle : seul le texte se modifie, et l'écran le dit.
3. **Les mêmes contraintes que la création** (au plus 20 réponses par critère, points de 0 à 100, une clé qui ne commence pas par « _ », 5 000 caractères au plus) : refusées avec la raison, comme ailleurs dans l'éditeur.
4. **Sécurité** : tout rendu passe par `echapperHtml()` ; aucun gestionnaire en ligne (`data-action`) ; cibles de 44 px sur l'iPad.
5. **Les bancs.** Vitest : les fonctions pures (texte, points, ajout, retrait, refus). WebKit : une grille créée par la dissection (grille fictive en réponses et points) → corriger un texte, changer des points, ajouter, retirer → recharger → tout est là. Break-tests : le texte qui ne s'enregistre pas ; le retrait qui n'en retire pas.

## Les textes

Neufs et provisoires (boutons, confirmation, refus, la mention pour un critère lié à une échelle) : liste-les dans la demande.

## Ce qu'il ne faut pas

- Changer en silence la note d'une copie déjà évaluée.
- Toucher aux sous-critères dans ce lot (même bloc, autre geste) : dis seulement s'ils devraient suivre.
- Le verdict complet, un numéro de version.

## Livrer

Un commit sur `main` (avec cette consigne) ; Vitest complet vert ; `materiel-*` et les specs de Grilles de critères touchées vertes dans WebKit ; la demande courte `plans de travail/DEMANDE-RELECTURE-2026-10-19-lot-13-modifier-les-reponses.md`. **Puis arrête-toi.**
