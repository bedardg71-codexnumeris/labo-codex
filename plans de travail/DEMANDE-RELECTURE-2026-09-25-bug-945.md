# Demande de relecture croisée – #945 (1.159.5)

> Écrite le 25 septembre 2026 (Toronto) par Claude Code. Branche `fix/945-entree-confirmation-danger` (arbre principal, non poussée) : `165ffa3f` (correctif, bancs et release), puis le commit de cette demande. Base : `b1e18ed4`.
> Règle 2 de `PROTOCOLE.md` : une release qui garde les gestes destructifs. Verdict attendu dans `plans de travail/RELECTURE-2026-09-25-bug-945.md`.

## Ce que le lot fait

`confirmerAction` (`js/ui-dialogues.js`), `surTouche` : sur Entrée, focus sur le bouton d'action → `true` ; sur « Annuler » → `false` ; ailleurs → `!estDanger`. Échap, clic, libellés, couleurs et ordre des boutons sont inchangés. Seul l'en-tête du fichier a été retouché en plus (la promesse d'a11y, et une ligne sur les trois autres modales).

**Un effet de bord voulu, à confirmer** : dans une confirmation *ordinaire*, si l'enseignant·e a déplacé le focus sur « Annuler » (Tab), Entrée annule désormais. Avant, cette touche confirmait. C'est la lecture de ton § 0 (« Entrée fait ce que ferait le bouton qui a le focus ») ; l'essai « ordinaire + focus déplacé sur Annuler » le fige. Si tu voulais limiter le changement à `danger`, dis-le.

## Mesures (remesurées sur `b1e18ed4`)

- **Neuf** appels `variante: 'danger'` dans cinq fichiers, comme tu l'avais compté. Aucun ne change.
- **Les trois autres modales** n'ont aucune action destructive par défaut sur Entrée. `demanderSaisie` renvoie la chaîne tapée, `informer` ferme, `demanderChoix` ne répond qu'après une option cochée à la main. Disposition : commentées dans l'en-tête (issue 3), sans autre changement.
- **Bancs Playwright qui pressent Entrée dans une confirmation** : un seul, celui que j'ai étendu.
- **iPad** : sans clavier, pas de touche Entrée, donc rien ne change. Avec un clavier physique, la règle est la même que sur Mac. Je ne l'ai pas mesuré sur un appareil.

## Preuves

- Vitest, `tests/unit/ui-dialogues-315.test.js`, bloc #945, 7 essais : danger + Entrée → `false` ; danger + focus sur le bouton rouge → `true` ; danger + focus hors des boutons → `false` ; ordinaire → `true` (focus de départ, et focus hors des boutons) ; ordinaire + focus sur Annuler → `false` ; Échap → `false` partout. **3 rouges sur `b1e18ed4`**, les 3 où le comportement change.
- WebKit, `tests/integration/cartouche-changee-copie-evaluee-944.spec.js`, essai #945, avec une vraie frappe `page.keyboard.press('Enter')`. Dans « Changer de cartouche », sur une copie évaluée, le focus est sur « Garder les commentaires actuels » ; Entrée ne remplace rien et n'écrit rien en base. Puis focus sur « Remplacer » et Entrée : le remplacement a lieu. **Rouge avec le `ui-dialogues.js` de `b1e18ed4`** : le menu passait à `CT939R`. Le banc entier fait 4 essais sur 4 verts.
- Break-tests, chacun rouge, fichier restauré par copie (même empreinte) :
  - B1, repli `repondre(true)` : 1 rouge (danger, focus hors des boutons) ;
  - B2, clause « Annuler » retirée : 1 rouge (ordinaire, focus sur Annuler) ;
  - B3, clause « bouton rouge » retirée : 1 rouge (danger, focus sur le bouton rouge).
- Vitest complet : 634 fichiers, 7371 essais verts.

## Nouvelles

Le texte proposé par Cowork a été versé tel quel, **à valider par Grégoire avant le push**.
