# Portes terrain, 19 nov. 2026 (nuit) : « Nous faisons » de « Monter ton cours »

Lot `lot/nous-faisons-cours`, APERÇU non fusionné. Rapport : `plans de travail/RAPPORT-2026-11-19-nous-faisons-cours.md`. Cowork relit cette liste avant d'en publier l'artefact.

**Une seule porte.** Règle 1 : les bulles, leur confirmation, leurs gestes qui se grisent, les deux formes de la bulle 6 et la fin sont jugés par des bancs (Vitest et navigateur, aux deux tailles de l'iPad). Reste ce qu'aucune machine du nuage ne peut faire : un vrai doigt sur un vrai iPad, dans le « Planificateur ».

## §0 · Préalable

- Ouvre l'aperçu sur l'iPad (`https://deploy-preview-36--codexnumeris-051225.netlify.app`, PR n° 36), recharge, et lis le numéro en bas de page.
  ⮕ Attendu : celui de la 1.250.0 (rien n'est publié par ce lot ; l'aperçu porte en plus le correctif du glisser de la PR n° 34).
- Dans l'aperçu, ouvre la démo seulement si tu veux : ce parcours se fait sur tes vraies données (il referme la démo), mais dans l'aperçu, rien de ce que tu fais n'atteint ton application en ligne.

## §1 · Données

Aucune.

## §2 · Interface

### 2.1 Au doigt, glisser une leçon dans le « Planificateur » change-t-il sa semaine ?   [iPad]

**Pourquoi** : la dernière bulle dit que glisser une leçon dans le « Planificateur » change sa semaine, et donc ses dates. À la souris, c'est vrai. Au doigt, sur un écran tactile simulé, le geste ne prend pas : la palette défile à la place, et la leçon reste où elle était. Ce n'est pas encore vérifié sur un vrai iPad.

- Dans Conception › Alignement, ouvre le « Planificateur ». Pose le doigt sur le nom d'une leçon, puis glisse-la, sans lever le doigt, jusqu'à une autre semaine.
  ⮕ Attendu (ce que dit la bulle) : la leçon passe à cette semaine. Ce que la mesure laisse prévoir : la palette défile, la leçon ne bouge pas.
- Écrire : ce qui s'est passé (la leçon a changé de semaine, ou la palette a défilé, ou autre chose).

## §3 · Décisions (ce ne sont pas des vérifications)

### 3.1 La bulle 7 et le « Planificateur » au doigt   [une réponse écrite]

Si la porte 2.1 confirme que le doigt ne peut pas : garder la phrase telle quelle, la nuancer, ou rendre le geste possible au doigt (un lot à part) ? Cowork tranchera ; la phrase n'a pas été touchée.

## §4 · Ce que je n'ai pas pu vérifier

- Safari et l'iPad : WebKit n'existe pas dans le conteneur. GitHub juge le push sous WebKit Linux.
- Deux traits de la forme ne sont pas là, faute de mécanisme dans le moteur de cette base (au rapport) : la flèche devant un geste qui n'est pas la consigne, et la parenthèse hors du gras d'une consigne.
- La bulle 3 promet une date par groupe : elle tient si la carte est rattachée au cours ; trois cas où elle ne l'est pas sont au rapport (mesure b).
