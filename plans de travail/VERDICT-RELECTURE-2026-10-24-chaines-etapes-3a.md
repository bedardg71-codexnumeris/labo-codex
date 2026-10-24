# Verdict de relecture – les chaînes d'étapes, lot 3a : le composant, l'option, la chaîne des grilles (#1149)

> Cowork, samedi 24 octobre 2026, 19 h 41 (Toronto). Relu : le rapport de Claude Code relayé par Grégoire, `DEMANDE-RELECTURE-2026-10-24-chaines-etapes-3a.md` (§ 2.6 et décimales), `914a0d31` (`js/chaine-etapes.js` en entier, le CSS ajouté), les captures Grilles à 85 % (1440, clair) et réglée (1440, sombre). Les quatre documents de Cowork touchés par le `git stash` sont présents et non vides.

## Verdict : **accepté**

Un seul composant, un écouteur par conteneur, le clic global du Trimestre retiré, les infos en `textContent` : c'est ce que la consigne demandait. Le § 2.6 est tenu au-delà de la lettre (une seule somme dans `grilles.js`, gardée par un banc), et le vert fantôme du total est corrigé là où le lot passait. Les captures montrent la chaîne lisible dans les deux modes.

## 1. Les deux questions posées à Grégoire

1. **La couleur de « 85 % » en mode clair : tranchée par Cowork.** La teinte des textes d'avertissement de l'app reste. Elle passe 4,5:1 dans les deux modes, elle dit déjà « attention » ailleurs dans l'app, et un orange de plus au design system pour un seul usage ferait un jeton de plus à tenir. Le nœud vide porte aussi l'état : la couleur n'est pas le seul signal.
2. **La ligne d'aide de la case** : « Montre, en haut de chaque outil, les étapes qui le rendent prêt à servir. » **Gardée par Grégoire** (24 oct., 19 h 41 : « oui »). Rien à changer dans le code.

## 2. Les trouvailles

- **Inscrire et continuer** : une pondération décimale perd sa partie décimale. Tapée « 12,5 », elle s'enregistre 12 sans le dire ; importée à 12,5, elle compte pour 12 dans le total et la chaîne (12,5 + 87,5 = 99 %, en orange). Antérieur au lot. À mesurer avant toute décision : ce que le calcul de la note fait de ces mêmes pondérations (s'il lit 12,5, le total et la note ne disent pas la même chose). Fiche à inscrire.
- Le `git stash` pendant l'écriture d'une autre session : sans perte, mesuré. La règle qu'il en tire (plus de `stash` quand une autre session écrit) est juste ; elle a sa place dans `PROTOCOLE.md` si elle sert une deuxième fois.

## 3. Portes terrain

D'accord : aucune porte due. Rien à publier.

## 4. Suite

Le lot 3b (échelles, cartouches, productions, pratiques) attend les étapes de chaque outil, que Cowork propose à Grégoire à corriger. Pas de release, de verdict complet ni de push sans son signal.
