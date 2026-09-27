# Carte d'alignement, lot 2 – « Mes badges suivent mes objectifs »

> Consigne de lot rédigée par Grégoire et Cowork (projet claude.ai), validée par Grégoire le 27 sept. 2026 ; déposée dans le dépôt par Cowork le 27 sept. 2026. Texte reproduit tel quel sous la ligne.
> Fiche : **#964** (proposée ; voir `CARTE-ALIGNEMENT-2026-09-27-0-plan-des-lots.md`, § « À inscrire au BACKLOG »). Ordre et garde-fous communs : même fichier.

---

Lot « Mes badges suivent mes objectifs » (carte d'alignement). À faire après le lot « Je fais relire ma carte par une IA ». Décision didactique de Grégoire (27 sept. 2026) : une évaluation se relie uniquement à des objectifs ; un seul geste, un seul signal. Appuie-toi sur ton fichier mesure-carte-alignement.md.

1. NOUVEAU CALCUL DES BADGES (evaluerBadge et fonctions associées).
- Évaluation, badge amont : ✓ dès qu'elle vérifie au moins un objectif (objectifs cochés dans son Inspecteur). Badge aval inchangé.
- Idée maîtresse et compétence, ⚠ : le signe se lève aussi quand une leçon reliée à l'idée maîtresse (lien « se concrétise dans ») a au moins un objectif vérifié par une évaluation, où qu'elle soit sur la carte.
- Pastilles des objectifs (evaluerObjectif) : un objectif est vérifié dès qu'une évaluation, dans n'importe quelle leçon, le coche. On garde la règle actuelle : sans bloc servant, la pastille reste « ! ». La semaine n'est pas lue dans ce lot (elle viendra avec le lot suivant).

2. COMPATIBILITÉ, NON NÉGOCIABLE. Les liens « se vérifie par » déjà tracés (et les anciens verbes lus comme tels) restent stockés, affichés et comptés comme aujourd'hui. Ne retire pas l'entrée se_verifie_par de TYPES_LIENS ni ses correspondances de compatibilité. Aucune donnée d'utilisateur supprimée ou réécrite. Une carte existante ne doit changer d'état que par les deux effets voulus : les évaluations qui cochent un objectif gagnent leur ✓, et l'Exposé (point 4).

3. RETRAIT DU GESTE. Retire seulement les paires automatiques …>evaluation de VERBES_AUTO. Vérifie que le message affiché quand on tente de tracer un lien vers une évaluation oriente vers le bon geste (cocher les objectifs dans l'Inspecteur) plutôt que de dire seulement que le lien n'est pas possible ; propose le texte à Grégoire.

4. EXPOSÉ. Il rejoint le calcul des activités dans evaluerBadge (aujourd'hui il tombe dans le cas par défaut, ✓/✓ sans condition).

5. À VÉRIFIER. Grégoire dit que l'Inspecteur d'une évaluation permet de cocher les objectifs de sa leçon ou d'une leçon précédente. Mesure-le. Si seule la leçon parente est proposée, signale-le avant de coder : le guide validé promet les leçons précédentes.

TESTS. Au minimum : (a) une carte fictive qui n'utilise que des liens « se vérifie par » : mêmes états avant et après, Exposé mis à part ; (b) une carte fictive qui n'utilise que des objectifs cochés sur les évaluations : les badges des évaluations et les ⚠ se lèvent ; (c) un objectif coché par une évaluation d'une autre leçon. Noms manifestement fictifs.

LIVRAISON. Rends-moi ce qui a changé à l'écran, les résultats des tests et le texte proposé pour le message du point 3. Ne touche pas au guide dans ce lot. Pas de version publique sans l'accord de Grégoire.