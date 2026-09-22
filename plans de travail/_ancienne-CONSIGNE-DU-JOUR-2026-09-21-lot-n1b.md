# Consigne du jour – Lot N1b : les lecteurs suivent la pratique active, puis N1a + N1b partent ensemble (minor)

> Écrite le 21 septembre 2026, 15 h 40 (Toronto), par Cowork. **Proposée** tant que Grégoire ne l'a pas relayée.
> La précédente (lot N1, devenue N1a) est archivée sous `plans de travail/_ancienne-CONSIGNE-DU-JOUR-2026-09-21-lot-n1a.md` (déplacée par Cowork, à commiter avec ce lot). Elle reste la référence pour la décision de Grégoire (sans pratique assignée, aucune note), les preuves attendues et le stock.
> Base : le bloc de tête de `RELAIS.md` (« lot N1 COUPÉ EN DEUX »), §« CE QUI RESTE ».

## 0 · Conditions de départ

- `origin/main` porte `016be93e` (relais de N1a) ou un commit de journal après ; la branche `lot-n1a` porte `afcc14ef`. Sinon, arrête-toi. Aucune autre session n'écrit dans `js/`.
- **Travaille sur `lot-n1a`** (rebase sur `main` si `main` a avancé). Rien ne se fusionne ni ne se pousse avant la fin de ce lot.
- ⚠ `DEPLOY.md` est modifié et non commité dans l'arbre principal : **pas à toi, pas à Cowork de cette session** ; ne le touche pas, ne le commite pas.

## 1 · Relecture de N1a par Cowork (21 sept., 15 h 40) – ce qui est tranché

- **Vitest complet sur `lot-n1a` (`afcc14ef`), par exécution dans un clone : 614 / 7 010, vert.** Pas de mutations de Cowork à ce stade : la relecture croisée par mutations se fera sur N1a + N1b ensemble, avant le verdict.
- **Les trois suppositions nommées, confirmées par Cowork** (techniques, tranchées sans remonter) :
  1. Un pointeur ancien mène à une configuration **par son id** (brut, puis normalisé), jamais par « la première de la même famille ». ✔
  2. `sommative` nu reste une pratique assignée ; `standards` et `specifications` nus deviennent « introuvable ». ✔
  3. Le stock de #898 (Standards adoptée sans échelle avant le 17 sept.) **garde sa note**. ✔ C'est aussi la limite du 20 sept. : rien de ce que l'élève a déjà ne disparaît.
- **Le constat de didactique (deux échelles pour le niveau de la note globale d'une Standards) n'est PAS dans ce lot** : il part avec N2 (#716) et remontera à Grégoire à ce moment-là. N1b ne change aucune lettre affichée sous STD / SOM / SPE.

## 2 · Ce que fait N1b

1. **Les 53 sites d'`obtenirPratiqueActiveGroupeCours`** (20 fichiers) : relis-les un à un ; chacun passe par la résolution unique ou lit l'état qu'elle rend (aucune / introuvable / illisible / ok). Puis **retire le repli `'sommative'`** de `modes.js`. Rends au rapport le tableau : site → ce qu'il fait quand il n'y a pas de pratique.
2. **Les 13 sites `|| (window.PRATIQUE_DEFAUT || 'standards')`** (8 fichiers) et **les 34 appels d'`obtenirTypePratiqueActive`** : même traitement ; le type ne sert plus à fabriquer une instance.
3. **Sans pratique assignée, C et P sont « — »** (tranché par Cowork : la complétion se calcule par la pratique – la spécification compte autrement –, donc sans pratique il n'y a pas de C non plus). ⚠ **Aucune alerte sur tout le groupe** : la règle du lot 25 tient (« un indice affiché « — » n'est jamais « sous 70 »). Vérifie par exécution le tableau de bord, le filtre « A ou C < 70% », la barre des patterns, la carte RàI et le dépistage avec `C: 0, noteConstructible: false` : aucun élève signalé, aucun compteur d'alerte. **Si un lecteur prend ce C: 0 pour un vrai 0, c'est le défaut à corriger dans ce lot.** Si C sans pratique doit s'écrire autrement que `0` pour que les lecteurs le voient, fais-le (champ additif, comme `noteConstructible`) et dis-le.
4. **Mots** : aucun mot neuf. Les deux phrases existent (« Aucune pratique de notation n'est assignée… », « …introuvable dans la bibliothèque… »). Si un écran doit dire autre chose que « — » et ces deux phrases, arrête-toi et propose-le.
5. **Code mort trouvé en chemin** (`genererCartePratique` / `desactiverPratique` / `getPratiqueParDefaut`, `pratiques.js`, 0 appelant, conteneur absent) : c'est le seul geste qui écrirait encore un pointeur nu → **retire-le dans ce lot** (troisième issue : « retirer dans le lot qui passe là »), après avoir re-grepé par nom ET par `data-action` / `onclick`.

## 3 · Stock – limite du 20 sept.

Rien ne s'efface ni ne se réécrit : pointeurs anciens lus avec tolérance, snapshots déjà écrits gardés, aucune migration. **Pack démo : mesure-le PAR EXÉCUTION** (le relais dit « lu, pas exécuté ») : notes du groupe identiques à l'octet avant/après.

## 4 · Preuves, puis livraison

- Pour chacun des sept montages de N1a (N1 à N7) : **les écrans** (tableau de bord, profil, liste du groupe, dépistage, export) disent la même chose que les écrivains ; aucune alerte sur un groupe sans pratique.
- Parité des quatre familles, valeurs non retouchées.
- Mutations, une à la fois, rouges : repli `'sommative'` remis dans `modes.js` ; un lecteur qui retombe sur `PRATIQUE_DEFAUT` ; un lecteur qui lit `C: 0` comme un vrai 0 (filtre « A ou C < 70% ») ; le type passé au registre.
- Vitest complet vert. **Release : minor**, N1a + N1b dans la même version. **Phrase de « Nouvelles » : à PROPOSER à Grégoire** (question fermée ; ce qu'un collègue sans pratique voit). Fusion de `lot-n1a` dans `main`, puis **relecture croisée de Cowork par exécution**, verdict Playwright, push sur le mot de Grégoire.

## 5 · Ce que Grégoire verra

Rien dans son groupe (sa pratique est assignée). Un collègue sans pratique : « — » pour C et P, aucune alerte, et le profil qui lui dit d'aller choisir sa pratique. Un collègue en dénotation : la note chiffrée de sa pratique, plus de « M ».

## 6 · Fichiers de Cowork à commiter avec ce lot

Cette consigne, l'archive `_ancienne-CONSIGNE-DU-JOUR-2026-09-21-lot-n1a.md`, `plans de travail/FILE-DES-LOTS.md` (N1 en sort une fois poussé).
