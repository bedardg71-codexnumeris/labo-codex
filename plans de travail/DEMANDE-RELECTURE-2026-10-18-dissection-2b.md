# Demande de relecture – la dissection, lot 2b : créer sa grille en niveaux

> Claude Code, dimanche 18 octobre 2026, vers 9 h (Toronto). Consigne : `CONSIGNE-LOT-2026-10-18-dissection-2b-creer-en-niveaux.md` (8 h 44). Pour Cowork (`PROTOCOLE.md`, règle 2).
> Un commit local sur `main`, **non poussé** ; il porte aussi la consigne du jour, son archive et la consigne du lot. **Pas de version, pas de verdict, pas de push.**

## État mesuré

- **Vitest complet** (depuis `tests/`) : **774 fichiers, 9 188 essais, verts** (avant : 773 et 9 171). Banc neuf : `materiel-dissection-2b-niveaux.test.js`, 18 essais. Au banc 2a, le R.f (« bientôt ») est retiré et le R.c suit le nouveau texte.
- **WebKit, specs touchées** (ce n'est pas le verdict) : `materiel-*`, plus `type-grille-lot1`, `grille-critere-ajoute-enregistrer-957` et `evaluation-grille-sans-echelle-le-dit`. Résultat : **21 verts, 0 rouge**, et 17 essais ignorés, ceux de l'assistant débranché (déjà ignorés avant ce lot). La spec neuve `materiel-dissection-2b` compte 2 essais ; le test « bientôt » de la spec 2a est retiré.
- **Break-tests** (restaurés depuis une copie) :
  - **Un champ prérempli** (une note retenue de 50 proposée dans `champNiveau`) : la spec WebKit rougit à la ligne 194 (les champs vides).
  - **Le choix ignoré** (`enNiveaux` vrai dès que des valeurs existent, coché ou non) : rouge en Vitest P.b et V.a, et en WebKit à la ligne 97 (le tableau paraît alors que « des points » est coché).
- La sentinelle #642 a d'abord rougi : mon paramètre `cle` masquait `window.cle()`. Je l'ai renommé `cleNiv`, et elle est verte.

## La mesure du point 4

`calculerNote` (`js/evaluation-calcul.js`, l. 1543-1555) calcule Σ (valeur × p/100) ÷ Σ (p/100), sur les critères comptés. **La note rapporte donc les pondérations à leur somme.** Avec 5 + 5 + 10 + 10 = 30, elle est la moyenne pondérée, sans écart avec une grille sur 100. Les pondérations sont reprises **telles quelles** : celle qui est écrite, sinon celle tirée des points, sinon des parts égales (`materielLecture.partsEgales`), et ce dernier cas seulement si aucun critère n'a de pondération. Si un critère en a une et un autre non, la création est refusée : « la pondération d'un critère ». Aucune conversion. L'avertissement « total ≠ 100 » de `calculs` n'est pas affiché, puisque la mesure montre qu'il ne dirait rien de vrai sur la note.

## Ce que j'ai réutilisé

- `materielAssistant.construire` sans aucun changement de logique : `construireEchelle` (avec `plagesContigues`, `valeurCalcul` = la note saisie, les couleurs) et `construireGrille`. Seul changement : la description de la grille passe de `construireGrilleEnPoints` à `construireGrille`, pour qu'elle suive aussi en niveaux. Les modèles de l'assistant n'en ont pas.
- `calculs(m)` : les `manquants` (plage, note retenue, codes, plus de 20 niveaux, pondération entière) et les avertissements `avertPlages` **et** `avertNotes`, tels quels.
- `materielLecture.coder`, `partsEgales`, `materielAssistant.etatSaisi` et `nombre` (la virgule et le « % » sont acceptés).
- `materielCreation.creer`, puis la confirmation existante d'une grille en niveaux (`confirmationHtml`, qui liste les niveaux avec leurs plages).

## Textes d'écran neufs (inventaire de l'étape 3)

| Où | Texte |
|---|---|
| Choix (logique « les deux ») | « Le résultat d'une copie viendrait : » · « des points » · « des niveaux » |
| Tableau | « Ce que vaut chaque niveau » · « Pour chaque niveau : la plage de notes qu'il couvre, et la note qu'une copie reçoit à ce niveau. » · « de … à … % » · « note retenue … % » |
| Refus (remplace celui du lot 2a) | « des points ou des niveaux : surligne ce que vaut chaque réponse avec l'étiquette « Points », ou le nom de chaque niveau avec l'étiquette « Niveau » » |
| Confirmation en niveaux venue de la dissection | « Coller une autre grille » au lieu de « Apporter autre chose », comme au lot 2a en points |
| Retiré | la ligne « La création des grilles en niveaux arrive bientôt… » et sa règle CSS |

## Ce que j'ai supposé

1. **La saisie suit son niveau par son nom**, pas par son rang (`clesNiveaux` : le nom, puis son rang parmi les niveaux du même nom). Ainsi, un niveau étiqueté plus tard avant les autres ne déplace pas les valeurs (V.b).
2. **« Retirer les étiquettes » vide aussi ce qui était saisi** et remet le choix à « des points ». Le nom tapé, lui, reste, comme au lot 2a.
3. **L'avertissement « note retenue hors de sa plage »** (`avertNotes`) est affiché avec ceux des plages. La consigne ne nommait que les plages ; il est du même ordre et ne bloque rien.
4. **Le choix n'est pas redessiné quand on le touche.** WebKit ne donne pas le focus à un bouton radio touché, donc la spec vérifie que c'est le même nœud, pas le focus.
5. La grille fictive neuve (n), seulement en niveaux, est rangée dans les grilles partagées : `GRILLE_N`, trois critères pondérés 40/35/25 en %.

## Trouvailles (code étranger)

- **Grilles de critères affiche une grille en niveaux sur 30 comme « 30 % »**, et le geste « Sauvegarder » y dit « pas 100 % » (`grilles.js`, l. 830). D'après la mesure du point 4, ce n'est pas faux pour la note, mais c'est trompeur. Je l'ai lu dans le code, pas vu à l'écran. Issue proposée : **2, inscrire**. Je ne l'ai pas inscrite : aucun symptôme vécu (règle du 24 août). C'est à Cowork de trancher.
- `plageValide` (`materiel-assistant.js`) accepte une plage hors de 0 à 100, par exemple « de 0 à 150 ». L'assistant fait de même. Issue proposée : **3, rien**, puisqu'aucune conséquence n'est observée.
