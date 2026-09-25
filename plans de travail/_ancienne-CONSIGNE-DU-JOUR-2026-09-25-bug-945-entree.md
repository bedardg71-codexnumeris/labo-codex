# Consigne du jour – #945 : dans une confirmation « danger », Entrée suit le bouton qui a le focus

> Écrite le 25 septembre 2026, vers 11 h 20 (Toronto), par Cowork, sur `origin/main` = `b1e18ed4` (1.159.4, en ligne chez Netlify depuis 10 h 56, mesuré). **À remesurer avant tout code.**
> La précédente (#946, livrée en 1.159.4) est archivée sous `plans de travail/_ancienne-CONSIGNE-DU-JOUR-2026-09-25-bug-946-cartouche.md` (déplacée par Cowork, à commiter avec ce lot).
> **Deuxième lot du cap du 24 sept. au soir** (« terminer tout ce qui concerne la rétroaction ») : la confirmation « Changer de cartouche » (#944) en est le cas d'entrée. La fiche existe : **#945**. Symptôme non vécu.

## 0 · Ce qui est décidé (technique, par Cowork – aucune question à Grégoire)

**Entrée fait ce que ferait le bouton qui a le focus.** Pour une confirmation `danger`, le focus part sur « Annuler » : Entrée annule. Si l'enseignant·e a déplacé le focus sur le bouton rouge (Tab), Entrée confirme. Si le focus n'est sur aucun des deux boutons, Entrée fait l'action sûre de la variante : `danger` → annuler ; autre variante → confirmer (inchangé). Échap annule toujours ; le clic ne change pas.
Motif : aujourd'hui `surTouche` (`js/ui-dialogues.js` ≈ l. 110-113) répond `true` sur Entrée quelle que soit la variante, alors que la même fonction pose exprès le focus sur Annuler (≈ l. 124-125, et le commentaire d'en-tête ≈ l. 26-28 le promet). Un Entrée réflexe confirme donc la destruction.

## 1 · Ce que Cowork a lu (lecture seule, sur `b1e18ed4` – non exécuté)

- `confirmerAction` (`js/ui-dialogues.js` ≈ l. 81-127) : le seul lieu à corriger pour la variante `danger`.
- **Neuf appels `variante: 'danger'`** dans cinq fichiers (`evaluation-chargement.js`, `planification-bibliotheque.js`, `codex.js`, `comparateur-pratiques.js`, `productions-bibliotheque-ui.js`) : « Changer de cartouche », « Supprimer la carte », « Supprimer de la bibliothèque » (deux), « Modèle antérieur détecté » (deux), « Annuler la fusion », « Jeter la maquette », « Supprimer définitivement ». Remesure le compte ; aucun ne doit avoir besoin d'un changement à l'appel.
- Les trois autres modales du fichier (saisie ≈ l. 144, information ≈ l. 203, choix ≈ l. 254) ont leur propre `surTouche`. Dis en une ligne si l'une porte une action destructive par défaut sur Entrée ; ne les touche que si oui (sinon : commenter, issue 3).
- Banc existant : `tests/unit/ui-dialogues-315.test.js` (« Échap → false ; Entrée → true », sans variante) reste vrai pour la variante ordinaire.

## 2 · Limites

- Rien d'autre ne change : libellés, couleurs, ordre des boutons, clic sur l'overlay.
- Aucune donnée touchée.
- #947 est le lot suivant, pas celui-ci.
- Aucun nom d'élève réel dans les bancs ni dans le rapport (règle 6).

## 3 · Preuve attendue

- Vitest (`ui-dialogues-315` étendu ou banc neuf) : `danger` + Entrée → `false` ; `danger` + focus déplacé sur le bouton rouge + Entrée → `true` ; `danger` + focus hors des boutons + Entrée → `false` ; variante ordinaire + Entrée → `true` (inchangé) ; Échap → `false` partout. Rouges sur `b1e18ed4` là où le comportement change.
- WebKit, par un vrai chemin : la confirmation « Changer de cartouche » (#944) sur une copie évaluée, Entrée → les commentaires ne sont pas remplacés et rien n'est écrit.
- Break-tests de ton choix, chacun rouge ; nomme-les.
- « Nouvelles » : **proposition de Cowork, à soumettre à Grégoire avant le push** : « Confirmations : quand une action efface ou remplace quelque chose, la touche Entrée choisit le bouton sélectionné, « Annuler » au départ. Pour confirmer, clique sur le bouton rouge. »
- Relecture croisée de Cowork avant la fusion (le lot garde les gestes destructifs) : branche, `DEMANDE-RELECTURE-2026-09-25-bug-945.md`, puis verdict, fusion, push.

## 4 · Porte terrain

**Aucune.** Une machine répond. L'iPad sans clavier n'est pas concerné (pas de touche Entrée) : dis-le en une ligne si tu mesures autrement.
