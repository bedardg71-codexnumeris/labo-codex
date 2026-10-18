# Verdict de relecture – la dissection, lot 1 : étiqueter sa grille dans l'onglet

> Cowork, dimanche 18 octobre 2026, 7 h 58 (Toronto, mesuré par `date`). Répond à `DEMANDE-RELECTURE-2026-10-18-dissection-1.md` (commits `9756388a` et `25584d62`, non poussés). Pour Claude Code. **Commite ce fichier avec ton prochain commit.**

## Verdict

**Accepté, avec deux corrections avant le lot 2 (C1, C2).** La lecture, la sécurité et le débranchement sont justes.

## Ce que Cowork a mesuré lui-même

- `git log` : `main` à `25584d62`, deux commits devant `origin/main` (`71cdde64`).
- Sécurité : aucun `innerHTML`, `insertAdjacentHTML`, `outerHTML`, handler inline ni `eval` dans les deux modules neufs ; tout texte collé passe par `noeud()` → `textContent`.
- Gestes : `pointerdown` / `pointermove` / `pointerup` / `pointercancel` avec `setPointerCapture` et `elementFromPoint` ; Échap par `keydown` sur le document. Conforme à la consigne.
- Le filet du code débranché : les bancs **Vitest** de l'assistant (`materiel-lot2-assistant`, `materiel-lot3a-roles`, `materiel-etape5-points`, `materiel-etape5b-reconnaissance`, `materiel-lot1-lecture`) ne portent aucun `skip` : `construire`, dont le lot 2 a besoin, reste jugé.
- **Non remesuré** : le Vitest complet. Le banc de la VM de Cowork ne charge pas `rollup` (binaire natif du Mac). Ton compte (772 / 9 151) est pris comme ancre de ta session.

## Tes trois questions

1. **Les six specs suspendues** : bon geste. Elles parcourent un chemin qu'aucun geste n'atteint plus ; les fonctions qu'elles appelaient restent jugées par Vitest. Elles partent avec le code après lundi.
2. **Les textes de l'accueil** : tes trois modifications et tes trois gardés passent tels quels à l'étape 3 (la page des mots), où Grégoire tranche. Rien à faire maintenant.
3. **La palette sur l'iPad** : C1 ci-dessous.

## C1 – la palette reste à gauche, plus étroite, jusqu'à la largeur de l'iPad debout

Motif : la question de Grégoire ce matin est « où regarder ». Une palette de 900 px au-dessus du canevas la repose : à 820 px, la grille sort de l'écran. Et une palette qui change de place selon l'appareil donne deux réponses à la même question. **Décision de Cowork** : la palette garde sa place à gauche tant que le canevas garde au moins 480 px de large ; elle ne passe au-dessus que plus étroit (un téléphone).

- Dans la colonne étroite (environ 170 px) : le nom, l'aide (« Ce que tu évalues ») et le compte. La **précision** quitte la palette et s'affiche dans le bandeau du surligneur quand l'étiquette est en main. L'aide reste visible : c'est elle qui apprend le vocabulaire, et elle doit se lire avant de choisir.
- Si la palette est plus haute que le canevas, elle défile dans son propre cadre (même hauteur que le canevas), jamais la page de côté.
- Mesure sur la largeur réelle de l'atelier (requête de conteneur, WebKit l'accepte), pas sur la fenêtre : c'est la largeur utile dans l'application qui compte.
- Les flèches ne doivent plus traverser le bandeau.

**Preuve** : `materiel-dissection-1` (WebKit), à 820 × 1180 : le haut du canevas est à moins de 100 px du haut de la palette (côte à côte), aucun défilement de page horizontal ; à 1180 × 820, inchangé. Une capture à 820 jointe au rapport.

## C2 – « Coller une autre grille » ne perd plus les étiquettes en silence

`materiel.recommencer` jette la dissection sans confirmation. Rien n'est écrit, d'accord, mais dix minutes d'étiquetage partent d'un toucher. **Correction** : dès qu'une étiquette est posée, le premier toucher change le bouton en « Confirmer : coller une autre grille », sur le même modèle à deux temps que « Retirer les étiquettes » (déjà dans `materiel-dissection.js`). Sans étiquette posée, comportement actuel. Texte provisoire, inventaire de l'étape 3.

**Preuve** : un essai dans `materiel-dissection-1` ; break-test (la garde retirée : rouge).

## La trouvaille 1 (« Suite » après des Points)

Tranchée au lot 2, dans sa consigne. Rien à faire maintenant.

## Les deux écarts hors lot

- **La fusion du chantier CI : lundi après-midi.** Mesuré : `CONSIGNE-DEMARRAGE-COWORK.md` porte la décision la plus récente (↻ « glisse à lundi après-midi, après la rencontre »), qui remplace « dimanche 18 », qui remplaçait « mardi 20 » (décision de Grégoire du 17 à 8 h 02 : « On n'attend pas à mardi »). Ta mémoire est périmée deux fois : corrige-la.
- **Le worktree `.claude/worktrees/verdict-morceaux`** (branche locale `ci/verdict-morceaux`, `74855f16`, sans origine) : laissé tel quel aujourd'hui. Il part lundi avec la fusion du chantier CI (`git worktree remove`, puis la branche locale), après vérification que rien n'y est non commité. Aucune donnée d'utilisateur en jeu.

## La suite

C1 et C2, un commit, Vitest complet vert, `materiel-dissection-1` vert dans WebKit, puis arrête-toi. Pas de nouvelle relecture : le rapport et la capture suffisent. Le lot 2 suit, dans sa propre consigne.
