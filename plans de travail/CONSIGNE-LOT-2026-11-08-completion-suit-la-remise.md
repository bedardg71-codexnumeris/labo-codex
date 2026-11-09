# Consigne : lot « La complétion suit la remise »

**Recopiée par Cowork le 8 nov. 2026 vers 20 h 35 (heure de Montréal), mot pour mot, depuis la page du tri** (« Tri du chantier Labo Codex »), où elle vivait seule. En ligne : 1.237.2. Ce fichier se commite AVEC son lot (PROTOCOLE.md).

**Quand le lancer (page du tri)** : à lancer avant le troisième parcours ; mesure d’abord, sur une branche à part

**Ce que Grégoire verra (page du tri)** : Tes décisions du 8 nov., 7 h 58 et 7 h 59. Aujourd’hui, en sommative, une copie ne compte comme remise qu’une fois évaluée et verrouillée : pendant une correction, chaque étudiant·e pas encore corrigé·e perd de la complétion. Ce que tu verras : une copie importée compte comme remise dès sa réception, et l’évaluation la confirme ou la corrige ; sans import, l’évaluation seule confirme la remise. Claude Code mesure d’abord, et te rend ce qui toucherait une note avant de coder.

**Références (page du tri)** : (carnet de chantier, « Troisième parcours », mesure du 8 nov., 6 h 10)

---

Lot « La complétion suit la remise ». Sur une branche à part, avant le lot du troisième parcours (son étape 7 montre la bande C après une première copie évaluée). Mêmes règles : pas de fusion vers main ni de publication sans l'accord de Grégoire, rien au changelog.

LE CONSTAT (lu dans le code par Cowork le 8 nov., à confirmer par ta mesure)
- En pratique sommative, une copie ne compte comme remise pour C que si elle est évaluée et verrouillée : evaluationCompteCommeRemise passe par evaluationEntreDansLaNote (js/pratiques/pratique-registre.js). Une copie importée et pas encore évaluée n'est pas une remise.
- Le dénominateur (calculerDetailsCompletion, js/pratiques/pratique-sommative.js) réunit les productions dont au moins une copie compte : dès qu'une copie est évaluée et verrouillée, sa production entre au dénominateur de tout le groupe.
- Effet : pendant une correction, chaque étudiant·e dont la copie n'est pas encore corrigée perd de la complétion. Sur un groupe neuf de douze, après une première copie évaluée, onze étudiant·es sont à 0 % (mesuré par Cowork le 8 nov., 6 h 10). Le signal dépend de l'ordre de correction, ce qui va contre le dépistage.

LA RÈGLE, décidée par Grégoire (8 nov., 7 h 58 et 7 h 59)
- Une copie importée compte comme remise dès sa réception. L'évaluation vient la confirmer, ou la corriger (non remise, non recevable).
- Sans import (une copie papier), c'est l'évaluation seule qui confirme la remise, comme aujourd'hui.

À MESURER ET À RENDRE AVANT DE CODER
- Le dénominateur : Grégoire indique que le moment où une production y entre est déjà réglé dans le code. Cowork a lu, dans pratique-sommative.js, que c'est la première copie évaluée qui l'y fait entrer. Mesure ce que fait le code, et dis-le ; ne change pas le dénominateur sans l'accord de Grégoire.
- Les autres familles (spécifications, standards, dénotation, configurable) : ont-elles la même règle ? Dis-le ; n'étends pas la décision sans l'accord de Grégoire.
- Si C entre dans le calcul d'une note quelque part (par exemple un minimum de complétion d'un portfolio), dis-le avant de coder : les notes d'A2025 et d'H2026 ne se rouvrent pas.
- Le stock : les captures du Suivi déjà enregistrées gardent l'ancienne valeur de C. Dis-le dans ton rapport, sans les recalculer.

LIVRAISON
- Un test qui échoue avant ta correction : une production, trois copies importées, une seule évaluée et verrouillée ; les deux autres comptent comme remises. Puis une copie papier non importée et non évaluée : elle ne compte pas.
- Le C de la démo avant et après. Loyal Suricate y est à 80 % et la visite « Découvrir » parle de ses deux productions non remises : si ces chiffres changent, dis-le.
- Ce qui change à l'écran sur le groupe d'A2026 de Grégoire, en lecture seule.
