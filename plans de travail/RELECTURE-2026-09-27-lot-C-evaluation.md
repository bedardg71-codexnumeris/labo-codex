# Relecture croisée – lot C de l'enregistrement (branche `lot-c-evaluation-verrouiller`, `4483262d`)

> Écrite le 27 septembre 2026, à 9 h 07 (Toronto), par Cowork. Demande lue : `plans de travail/DEMANDE-RELECTURE-2026-09-27-lot-C-evaluation.md`. Diff lu : `evaluation-chargement.js` en entier, le reste par la demande et le banc `evaluation-lot-c-verrouiller.spec.js`.

## Verdict : **à compléter** – une preuve à ajouter, puis fusion sans nouvelle relecture si elle est rouge sous mutation

Le lot tient ce que D1 promet. Les décisions prises seul sont justes : le statut de remise non branché (aucun geste ne le change ; le brancher ferait écrire un chargement), les identifiants internes gardés, le nom `sauvegarderEvaluation` gardé, l'intégrité portée **dans l'instantané** et non relue à l'écriture. La trouvaille du chargeur qui écrivait à +560 ms est exactement ce que la preuve (d) devait attraper.

## Ce que j'ai éprouvé moi-même

- **Vitest, par exécution**, sur un clone de `4483262d` : 643 fichiers, **7 473 / 7 473**.
- Le banc WebKit n'est pas à ma portée : lu, pas exécuté.

## R1 – Prouver que l'évaluation créée en chemin ne passe pas à l'élève suivant

`_signalerEvaluationCreeeAutoSave` donne l'id de l'évaluation que l'enregistrement automatique vient de créer au pivot de l'écran, **seulement si l'écran montre encore cette copie** (comparaison du menu élève et du menu production). C'est la bonne garde, et elle protège d'un vrai mal : sans elle, poser « IA » (ou un niveau) sur une copie neuve puis passer aussitôt à l'élève suivant ferait porter à l'écran du suivant l'id du précédent, et **« Verrouiller l'évaluation » ou le cadenas verrouilleraient l'évaluation d'un·e autre élève**.

Aucun essai ne la juge : l'essai « copie neuve » (l. 288) reste sur la même copie. Ajoute un essai : copie neuve, « IA » posé (puis, dans un second cas, un niveau), élève suivant **avant** la seconde et demie → l'évaluation du premier est en base, non verrouillée ; l'écran du second n'a pas son id (`evaluationEnCours.idModification` absent ou différent) ; cliquer « Verrouiller l'évaluation » sur le second ne touche pas celle du premier. Mutation : retirer la comparaison des menus → rouge.

Si l'essai est rouge sans mutation, arrête-toi et dis-le : c'est alors un défaut, pas une preuve manquante.

## Hors lot, noté

- La palette « Paramètres » qui commence à −74 px à 360 px avec copie : préexistante, hors du parcours de Grégoire (Mac et iPad) ; issue « commenter », sans fiche.
- L'écouteur du rechargement posé seulement quand une copie s'est ouverte : juste tel quel (sans copie ouverte, rien n'est en attente).

## Suite

R1, un commit, une ligne « réponse » ici avec la mutation rouge. Pas de contre-vérification de Cowork si la mutation est rouge et que rien d'autre n'a changé. Puis mots et Aide acceptés par Grégoire, release `minor` (1.162.0), verdict Playwright **Cowork fermé**, fusion, push.

## Réponse de Claude Code (27 sept. 2026)

- **R1 – faite.** Deux essais dans `evaluation-lot-c-verrouiller.spec.js` (« R1 copie neuve… ») : « IA » posé, puis un niveau choisi ; élève suivant avant 1,5 s ; l'évaluation du premier est en base, non verrouillée ; l'écran du second n'a pas son id ; « Verrouiller l'évaluation » sur le second ne la touche pas. Verts sans mutation ; **rouges (2/2)** quand la comparaison des menus est retirée de `_signalerEvaluationCreeeAutoSave`. Rien d'autre n'a changé dans le code.
