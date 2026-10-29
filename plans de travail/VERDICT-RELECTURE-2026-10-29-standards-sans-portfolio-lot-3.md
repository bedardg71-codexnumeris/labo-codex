# Verdict de relecture – Des standards sans portfolio, lot 3 : les Productions ne poussent plus vers une terminale (#1178)

> Cowork, jeudi 29 octobre 2026, 9 h 20 (Toronto, mesuré par `date`), sur `main` = `c2c79fe2`. Lu : le rapport de Claude Code ; `js/productions.js` (règles de `validerProductionsStd`, `raisonChampsObligatoiresProduction`). Vitest et Playwright non rejoués.

## Verdict

**Accepté, avec une retouche (décision de Cowork).**

- **La mesure du point 2.2** : l'avertissement de la terminale sans pondération reste, sous le texte 1 ; juste.
- **La supposition 1 est retenue** : dans une Standards sans artefact, le texte 1 s'affiche toujours, même quand l'ancien encadré se taisait. C'est ce que le plan voulait (l'encadré dit ce que le calcul fera) ; une enseignante sans artefact y lit d'où vient sa note.
- **La supposition 2** (les tests lisent TEXTES comme `bareme-2`) : acceptée ; le crochet avant push lance Vitest en entier, ce qui couvre un commit qui ne toucherait que TEXTES.
- **La trouvaille 1** (l'astérisque) : au lot 5, juste. **La trouvaille 3** (« utilisez une pondération de 0 % ») : inscrite ; la phrase est fausse hors Standards et vouvoie ; au lot 5 avec les autres mots.

## La retouche (Claude Code) : la trouvaille 2

« Quel que soit le type » allait trop loin, et c'est la consigne de Cowork qui le disait. En Standards, **la pondération reste exigée (plus de 0 %) pour les deux types dont le calcul lit la pondération** : l'« Évaluation terminale » (sa part de la note) et le « Portfolio (conteneur) » (la part du pool). Une terminale à 0 % ne compterait pour rien ; avec un conteneur à 0 %, la note devient « Pondérations nulles ». Pour tous les autres types, la levée du lot 3 tient. Les autres familles ne changent pas. Le message de refus est celui d'aujourd'hui (« la pondération est requise : plus de 0 % »), aucun mot neuf.

Tests : en Standards, une terminale à 0 % et un conteneur à 0 % refusés ; un laboratoire à 0 % accepté ; en Sommative, tout reste refusé à 0 % comme avant. Break-test (arbre restauré par sha256). Vitest depuis `tests/`. Un commit pour la retouche, un pour les docs (ce fichier) ; demande de relecture courte : `plans de travail/DEMANDE-RELECTURE-2026-10-29-standards-sans-portfolio-lot-3-retouche.md`. Pas de release, de verdict ni de push sans le signal de Grégoire.
