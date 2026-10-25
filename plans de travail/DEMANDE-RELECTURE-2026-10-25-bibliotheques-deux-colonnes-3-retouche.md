# Demande de relecture – Les bibliothèques en deux colonnes, lot 3 : la retouche (#1156)

> Claude Code, dimanche 25 octobre 2026 (Toronto). Verdict : `VERDICT-RELECTURE-2026-10-25-bibliotheques-deux-colonnes-3.md`, § 2. Branche `bibliotheques-deux-colonnes` : la retouche est `6a2bc864` (sur `1c854369`) ; ce document part dans le commit de docs qui la suit.

## En bref

La famille DEN se dit « PAN-Dénotation » dans la fenêtre de bibliothèque et dans l'éditeur ; la phrase de colonne vide des productions et des pratiques nomme son bouton. Pas de nouveau mot.

## 1. § 2.1 – « PAN-Dénotation »

Dans `FAMILLES_TAXONOMIQUES` (`js/pratiques-gestion.js`), l'entrée `denombrement` devient `denotation` : nom « PAN-Dénotation », résumé « Note finale certificative posée (non calculée) selon l'atteinte de cibles d'apprentissage » (les mots du texte existant de l'infobulle DEN, l. 191, tronqués avant « explicites ; abandonne la fonction de tri »). Pas d'`anglais` : aucun libellé anglais n'existe pour DEN dans `js/` ni `index.html` (mesuré). `obtenirDescriptionCourtePratique` omet la parenthèse quand `anglais` manque ; les trois autres familles sont inchangées. `familleDeLaPratique` lit DEN vers `denotation`.

**Un écart avec le § 2.1 : l'ancien `denombrement` n'est pas gardé comme alias.** Mesuré : il n'a jamais été un type de pratique enregistré. Dans l'historique, il n'apparaît que comme valeur du filtre `filtreTypePratiques` (`6b6d4820`, retiré en `abb7ed76`) et comme clé de tables d'affichage (`5f3125d5`, `c3b8929c`). Aucune donnée ne le porte, et le registre ne le normalise pas. Le garder serait un alias « au cas où ».

**Ce qu'affichait l'éditeur avant (§ 2.2 du verdict).** « Modèle de base » a une description : l'éditeur affichait cette description, avant comme après. Pour une pratique DEN **sans** description, il affichait le type brut, **« denotation »** : la table n'avait pas d'entrée `denotation`, et « Dénombrement… » n'était atteignable par aucun type réel. C'est mesuré par le second break-test ci-dessous (« Received: "denotation" »). Dans la fenêtre de bibliothèque, le lot 3 lisait « Dénombrement » (par la correspondance DEN → `denombrement` de `familleDeLaPratique`).

## 2. § 2.2 – la phrase de colonne vide

« …, ou crée-la avec « + Nouvelle production ». » (`js/productions-bibliotheque-ui.js` l. 297) et « …, ou crée-la avec « + Nouvelle pratique ». » (`js/pratiques-gestion.js` l. 451), au patron des grilles, des échelles et des cartouches. Pas de test neuf : aucune des trois phrases sœurs n'en a, et la démo n'a pas de colonne vide.

## 3. Preuve

Banc `bibliotheque-deux-colonnes-1156.spec.js`, WebKit : les six tests « pratiques » verts (une capture sautée, comme avant).

- « Modèle de base » lit `^PAN-Dénotation · par ` dans « Dans ta bibliothèque ».
- Neuf : une pratique DEN fictive sans description, semée dans le trimestre, ouverte par `chargerPratiquePourModif` : `#mat-description-pratique` lit « PAN-Dénotation - Note finale certificative posée (non calculée) selon l'atteinte de cibles d'apprentissage ».

Break-tests (chacun rougit, puis l'original est remis, `cmp` vérifié) :

- `DEN: 'denotation'` → `DEN: 'denombrement'` dans `familleDeLaPratique` → ROUGIT (« par Gabarit Labo Codex », sans la famille) ;
- l'entrée `denotation` retirée de la table → ROUGIT (« denotation »).

Vitest : 9 694 sur 9 695. Le seul rouge reste l'anti-cache pour `gabarits-utils.js` (jeton du lot 1, accepté). Les deux fichiers touchés prennent `pratiques-gestion.js?v=20261024d` et `productions-bibliotheque-ui.js?v=20261024c` (jetons jamais servis, mesuré par `git log -S`) ; ils ne figurent pas dans ce rouge.

## 4. § 2.3 – rendre la copie de travail à `main`

Après le commit de docs sur la branche, la copie de travail revient sur `main`. Les six documents de Cowork non commités parlent tous de `main`, et partent dans un commit de docs seul, avec `RELAIS.md` :

- modifiés : `CONSIGNE-LOT-2026-10-24-noms-reels-tests.md`, `PLAN-2026-10-24-refonte-de-l-aide.md`, `VERDICT-RELECTURE-2026-10-24-aide-lot-1.md` (identiques entre `main` et la branche avant ces modifications : elles s'appliquent sans conflit) ;
- nouveaux : `CONSIGNE-LOT-2026-10-24-correction-noms-fictifs.md`, `VERDICT-RELECTURE-2026-10-24-noms-reels-tests.md`, `VERDICT-RELECTURE-2026-10-25-banc-critere-algo-1131.md`.

Seul le verdict du lot 3 concerne les bibliothèques : il part sur la branche, avec ce document et la ligne du plan. `.claude/worktrees/` n'est pas un document : laissé tel quel. Pas de push.
