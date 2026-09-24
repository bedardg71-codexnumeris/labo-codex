# Relecture croisée – #944 (1.159.3)

> Écrite le 24 septembre 2026 (Toronto), par Cowork, sur `bug-944-cartouche-changee` = `7c6e92eb`.

## Verdict : VERT par lecture (pas de navigateur de ce côté ; ta spec 3 / 3, le banc Vitest et tes neuf mutations font foi)

**Cartographie des chargeurs.** Sur `bb790e78`, j'ai compté CINQ `dispatchEvent('change')` sur le menu des cartouches, pas quatre : `evaluation-chargement.js` l. 637 (réapplication du modèle) et l. 766 (`_selectionnerCartoucheProduction`), `evaluation.js` l. 525 (restauration en série) et l. 1426 (`_chargerCartoucheDropdownModif`), `travaux-ui.js` l. 5168 (cache). Les cinq passent maintenant par `poserCartoucheParChargeur`, et il n'en reste aucun hors de lui sur la branche (grep vide). Les deux appels directs à `cartoucheSelectionnee()` (`evaluation-sauvegarde.js` l. 569, `evaluation.js` l. 696) ne passent pas par `choisirCartoucheEval` : ils n'ouvrent donc pas la question. Aucun cinquième chargeur caché : la confirmation ne peut pas s'ouvrir toute seule.

**L'auto-save pendant la question.** Rien de plus à signaler. Le menu revient à l'ancienne cartouche de façon synchrone avant le `await`, `evaluationEnCours.cartoucheId` n'est touché qu'après « Remplacer », et la mémorisation des sélections (écouteur direct sur le menu, qui voit la nouvelle valeur en premier) est ré-écrite avec l'ancienne juste après. Un auto-save armé écrit donc l'état d'avant.

**L'auto-save après « Remplacer ».** Le complément de `7c6e92eb` est juste : `_remplacementConfirmeActif` exige la même copie, la cartouche confirmée au menu et une évaluation enregistrée encore différente. Dès que l'auto-save a écrit la nouvelle cartouche, la condition tombe et #939 protège les nouveaux commentaires. Hors de ce geste, l'auto-save ne touche pas `cartoucheId`.

**Sécurité.** Le nom de la cartouche passe par `confirmerAction`, qui l'écrit en texte (`_creer('p', { texte })`), sans `innerHTML`. Ni handler inline, ni `confirm()` natif. Le focus initial va sur « Garder les commentaires actuels » ; la touche Entrée reste la trouvaille #945, déjà inscrite.

## Ce que j'ai vérifié sur la trouvaille #946 pour ce parcours précis

Grégoire va remplacer la cartouche copie par copie sur une même production. Pendant ce temps, les évaluations de la production portent deux cartouches. `_modeleProductionPourEval` ne retient une cartouche modèle que si TOUTES les évaluations s'accordent (`unique('cartoucheId')`) : en état mixte, il rend `''`, et la réapplication 300 ms après l'ouverture ne se fait pas. #946 ne peut donc pas remettre en silence une cartouche sur une copie pendant ce chantier. Avant le premier remplacement comme après le dernier, elle repose la cartouche que la copie a déjà. Rien à faire dans ce lot.

## Deux observations, sans conséquence sur le verdict (disposition : commentées ici, non inscrites)

1. **Une confirmation par copie et par session de page.** `_remplacementConfirme` n'est pas vidé quand on quitte la copie. Si Grégoire confirme, quitte sans enregistrer (copie verrouillée), rouvre la copie et rechoisit la même cartouche, `dejaConfirme` saute la question. C'est le même geste déjà confirmé sur la même copie : acceptable.
2. **État mixte et nouvelles évaluations.** Tant que les copies d'une production portent deux cartouches, une copie PAS ENCORE évaluée de cette production ne reçoit aucune cartouche pré-sélectionnée : il faut la choisir à la main. Ce n'est pas causé par #944 (règle de `_modeleProductionPourEval`), mais #944 est le premier geste qui produit cet état. À dire à Grégoire, pas à corriger.

## Ligne des Nouvelles

Soumise à Grégoire par Cowork ; sa réponse fait foi.
