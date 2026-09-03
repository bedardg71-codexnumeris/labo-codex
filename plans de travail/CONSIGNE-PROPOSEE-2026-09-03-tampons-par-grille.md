# Consigne proposée — les tampons par grille : la liste existe déjà, c'est celle des sous-critères

> **Écrite le 3 septembre 2026 en après-midi, par Claude Code, en application du cadrage
> `CADRAGE-2026-09-03-tampons-par-grille.md`** (Cowork, 14 h 58). Le cadrage disait « remesure
> tout avant d'en tirer une consigne » : c'est fait, en lecture seule, et **trois lignes du
> cadrage sont corrigées ci-dessous**.
> ↻ **GO DE GRÉGOIRE, 3 septembre en après-midi** — Q1 : (a) les codes sont les sous-critères ;
> Q2 : (a) activation par geste partout ; Q3 : oui aux mots proposés. **Ce fichier est devenu la
> consigne du chantier**, exécutée lot par lot dans l'ordre du §5, un commit par lot (trace :
> bloc SESSION 19 de `SESSION.md`). Deux suppositions nommées à l'exécution : un sous-critère de
> pondération 0 n'est pas un tampon ; « (repli) » sort du titre de l'écran pour aller dans sa
> phrase d'explication.
> ✅ **LES QUATRE LOTS SONT LIVRÉS le 3 septembre en soirée** (commits lot 1 `2a71ee0d`, lot 2
> `2084c20f`, lot 3 `74e22bd0`, lot 4 = le suivant), non poussés, pas de release : Grégoire
> regarde l'écran d'abord. Ce qu'il doit aller voir est au bloc SESSION 19 de `SESSION.md`.
>
> ▣ **État mesuré à l'écriture** : `HEAD` = `43f7a57b` (texte troué, étape 1 : deux commits
> devant `origin/main`, verdict Playwright au jeton VERT sur ce SHA, non poussés — Grégoire
> décide de la release). Application `1.113.0`, build `0903-0906`. Toutes les lignes citées
> ont été relues ce jour.

---

## 1. Ce que la remesure a CORRIGÉ dans le cadrage — trois lignes

**a) Quatre clés globales, pas trois — et les TEXTES n'étaient pas où le cadrage les mettait.**
`personnalisationErreursFr` ne porte que **noms et couleurs** (`js/travaux-outils.js:956-962`,
`:1216-1220`). Les rétroactions personnalisées vivent dans **`retroactionsErreursFr`**
(`:642-644`, `:650-652`), absente du cadrage. Avec `ordreErreursFr` (`:964-972`) et
`errfrModeSynthese` (`:3619`, exportée par `donnees-v2.js:826`), ça fait **quatre clés, toutes
hors `cle()`**, donc globales à tous les trimestres. ⮕ Le travail réel de Grégoire est dans
**quatre** clés à ne pas toucher, pas trois.

**b) Le numéro d'un tampon suit l'ORDRE personnalisé, pas l'identifiant.** Mesuré dans les
quatre lecteurs : le curseur (`travaux-outils.js:1626`), le tampon sur la copie
(`travaux-annotation.js:2799-2805`), le PDF (`travaux-export-pdf.js:587-592`), la rétroaction
texte (`evaluation-retroaction.js:202-206`) ; la palette affiche `idx + 1` (`:1243`).
⮕ **`errfr_N` est déjà opaque à l'écran** : le chiffre que l'élève lit n'est pas le N de
l'identifiant. Ça rend le point ouvert 4 du cadrage plus simple qu'il ne le pensait.

**c) La série Unicode ⑳ n'est PAS une limite.** Les icônes ①–⑩ (`travaux-outils.js:276-285`)
ne servent que de **bouton de secours** ; le curseur (`:1621-1647`), la copie
(`dessinerErreurFrancais`) et le PDF **dessinent le nombre** sur un cercle de couleur. ⮕ Le
point ouvert 3 tombe. Ce qui limite, c'est la lisibilité d'un nombre à deux chiffres dans un
cercle de 24 px, et la longueur de la palette — un choix d'écran, pas de code.

**Confirmé tel quel** : 15 sites `CODES_ERREURS_FR` (10 / 3 / 2), 0 « ajouter un code »,
`errfr_` sur **50 lignes dans 6 fichiers** (le stock et ses lecteurs : `travaux-annotation.js`,
`travaux-export-pdf.js`, `evaluation-retroaction.js`, `evaluation-calcul.js`,
`synthese-retroaction-data.js`, `travaux-outils.js`).

---

## 2. ⚠⚠ LE FAIT QUE LE CADRAGE N'AVAIT PAS VU — la grille porte DÉJÀ une liste par code

**Le critère algorithmique d'une grille porte des SOUS-CRITÈRES** : `{id, code, nom,
ponderation, retroaction}` (`js/grilles.js:4314-4320`), ajoutables et retirables un à un dans le
gabarit (`:3995-4040`), sans plafond dans l'écran, **30 au plus au partage**
(`partage-schemas.js:298`). Les onze par défaut — « vos 11 catégories », `:4198` — sont
**exactement** les dix codes de la palette, plus le code `0` « Aucune erreur » (pondération 0) ;
leurs rétroactions sont, mot pour mot, `RETROACTIONS_ERREURS_FR_DEFAUT` (comparer `grilles.js:4204`
et `travaux-outils.js:621`).

**Et l'évaluation les lit déjà par le code** : en mode « catégories », l'enseignant TAPE les
codes des erreurs (`1;3;3;7`, `evaluation-calcul.js:262-268`), et chaque code est résolu dans
les sous-critères de la grille par `s.code === code` (`:441`, `:591`) pour la pondération et la
rétroaction dominante.

⮕ **Il y a donc DEUX listes, alignées à la main par le numéro** : les tampons (globaux, dix,
dans `travaux-outils.js`) et les sous-critères (par grille, dans le gabarit). C'est ce que
Grégoire décrit — « onze sous-critères dont les codes 0 à 10 reprennent, un par un, les dix
codes » — et **c'est une source dupliquée**, pas une propriété manquante. La demande « la liste
des tampons devient une propriété de la grille » se lit alors : **la liste des tampons EST celle
des sous-critères**, et il n'y a rien à créer, seulement à faire lire.

---

## 3. Point ouvert 1, MESURÉ — le chemin copie → production → grille

| maillon | vrai ? | unique ? | où |
|---|---|---|---|
| copie → production | **pas toujours** : `productionId` peut être vide, la copie est alors `orphelin` | — | `travaux-stockage.js:307`, `:326` |
| production → grille | vrai **par construction** (« une production = une grille pour tous ses élèves »), **pas garanti par la donnée** | source = ses évaluations ; `prod.grilleId` = repli possiblement périmé (#346) ; évals divergentes = « cas anormal, on ne tranche pas » | `evaluation-chargement.js:596-632`, exporté `:1624` |
| l'annotation | ne connaît que `productionId` ; `evaluationEnCours` n'y est pas lu | — | `travaux-annotation.js:318` ; ouverture : `liste-evaluations.js:1387`, `travaux-ui.js:3264`/`:5341` |

⮕ **Réponse : PAR GRILLE, résolue depuis la production au moment d'ouvrir la copie** —
`fichier.productionId` → `_modeleProductionPourEval(prod).grilleId` (fonction existante,
lecture seule) → `enoncesAlgo.critereAlgorithmique(grille)` (existante, #581) → ses
sous-critères. **Copie orpheline, grille introuvable, sans critère algorithmique, ou sans le
geste d'activation (§4) ⮕ repli : les dix d'aujourd'hui, à l'identique.**
« Par pratique » ne tient pas : la pratique de notation ne connaît pas les tampons, et rien
ne relie une pratique à une copie.

---

## 4. La forme proposée — et pourquoi pas celle du cadrage

**Option A — celle du cadrage** : une propriété neuve `grille.tampons`, avec son écran.
⛔ Elle crée une **deuxième** liste par grille, à côté des sous-critères, alignée à la main
comme aujourd'hui : deux écrans pour la même chose, et la règle *Single Source of Truth*
contredite le jour où on la pose.

**Option B — mesurée, recommandée : la liste des tampons d'une grille EST celle des
sous-critères de son critère algorithmique.**

| le tampon | vient de | neuf ? |
|---|---|---|
| son identifiant sur la copie | `errfr_<code>` — le préfixe reste, le code est celui du sous-critère | non — le STOCK se lit tel quel |
| le nombre affiché | `sc.code` (déjà le sens que Grégoire lui donne) | non |
| son nom | `sc.nom` | non |
| sa rétroaction (PDF, synthèse, bilan) | `sc.retroaction` | non |
| sa couleur | `sc.couleur`, champ **NEUF et facultatif** ; défaut = la couleur des dix, par position | oui — un champ, déclaré dans les DEUX schémas (`partage-schemas.js:297`, `import-export.js:702`), sinon il disparaît au transport (test F.d de #581) |
| son raccourci clavier | inchangé, par identifiant (`obtenirRaccourciPourItem`) | non |

↻ **L'activation est un GESTE, par grille — et c'est ce qui rend l'option B acceptable.** Sans
lui, la palette lirait les sous-critères de la grille de Grégoire dès la livraison : ses tampons
prendraient les noms courts des sous-critères (« Syntaxe » pour « Construction syntaxique »),
et ses rétroactions viendraient de la grille au lieu de ses textes personnalisés globaux — **ce
que ses élèves lisent changerait sans qu'il l'ait voulu**. ⮕ Un drapeau sur le critère
algorithmique (`codesDepuisSousCriteres: true`), posé par un bouton du gabarit ; **absent =
repli, exactement comme aujourd'hui.** Pour une grille NEUVE, le défaut se décide (§7, Q2).

**Ce qui ne bouge pas, et c'est mesurable :**
- le format des annotations (`type: 'errfr_<code>'`) — le stock reste lisible sans migration ;
- le préfixe `errfr_` — point 4 du cadrage : **dit, pas renommé** ; il vit dans la donnée ;
- les **quatre** clés globales — zéro écriture, elles restent le repli et l'écran
  Annoter › palette continue de les régler ;
- un tampon posé **ne disparaît jamais** de la copie : un `errfr_7` sur une grille activée qui
  n'a pas de code 7 s'affiche avec son numéro et un nom neutre (« code 7 »), jamais effacé.

**Ce qui change pour un enseignant hors français** : il écrit ses codes dans la grille (déjà
possible : ajouter, retirer, nommer, pondérer, rédiger la rétroaction), active les tampons, et
sa palette les montre dès qu'il ouvre une copie d'une production évaluée avec cette grille.
« Ajouter un onzième code » = ajouter un sous-critère. Le plafond : 30 (schéma), et une
lisibilité qui se dégrade au-delà d'une douzaine — à dire dans l'écran, pas à cacher.

**Bonus qui devient possible, HORS de ce lot** : le champ « catégories » de l'évaluation
(`1;3;3;7`, tapé à la main) pourrait se remplir depuis les tampons posés, puisque les deux
listes n'en font plus qu'une. C'est le vrai gain de la fusion ; il attend son propre cadrage.

---

## 5. Les lots — quatre, dans cet ordre, chacun livrable seul

**Lot 1 — une seule source de lecture, aucun changement visible.** Un module pur
`js/codes-annotation.js` (patron #667/#668/#581 : sans DOM, testable en Node) :
`listeCodes(grille)` rend `[{id, code, nom, couleur, retroaction}]` depuis les sous-critères
si le drapeau est posé, sinon le **REPLI** = les dix + les quatre clés globales (noms, couleurs,
ordre, textes) ; `resoudreGrilleDeCopie(fichier)` (§3). Les 15 sites `CODES_ERREURS_FR`, les
compteurs (`travaux-outils.js:2242-2290`) et `OUTILS.errfr_*` lisent la liste résolue.
▣ **Sentinelle** : sans drapeau, la liste rendue est **identique au caractère près** à
aujourd'hui (dix identifiants, noms, ordre personnalisé respecté, textes, couleurs) — c'est le
témoin du stock. `CODES_ERREURS_FR` quitte `travaux-outils.js` pour devenir le repli déclaré du
module (zéro-dette : on retire, on n'empile pas).

**Lot 2 — l'annotation suit la grille.** À l'ouverture d'un fichier (`travauxUI.ouvrirFichier`),
résoudre la grille, regénérer `OUTILS.errfr_*` sur le patron des symboles personnalisés
(`travaux-outils.js:1186-1199`) et la palette (`rafraichirPalette`, `genererContenuErreursFr`) ;
curseur, dessin, PDF, synthèse et bilan lisent la liste (le nombre = `code` sous le drapeau,
position dans l'ordre pour le repli — **inchangé**). ▣ **Spec WebKit** : copie d'une production
dont la grille activée a 4 sous-critères → 4 tampons nommés, numérotés par leur code, leurs
rétroactions dans la synthèse ; copie orpheline → les dix ; le tampon d'un code absent reste
visible.

**Lot 3 — le gabarit.** Sur le critère algorithmique : le bouton d'activation (mots à Grégoire,
Q3) et le champ couleur du sous-critère (`grilles.js:3995-4040`, mode grille ET mode temp), les
deux schémas. Un bouton « Adopter les dix codes de départ » existe déjà sous une autre forme
(`sousCriteresParDefaut`, `grilles.js:4198`, posé par `:4283`) : le nommer, pas le recréer.
Le titre de l'écran Annoter › palette (« Rétroactions — Erreurs de français »,
`travaux-outils.js:3341`) : mots à Grégoire (Q3).

**Lot 4 — l'aide et la trace.** Aide longue du gabarit et de l'écran Annoter (les deux chemins,
comme pour « Décloner ») ; `docs/modules/pipeline-annotation-evaluation.md` ; changelog.

⚠ Chaque lot bumpe ses jetons `?v=` ; Vitest depuis `tests/` ; `npm test` complet avant
« prêt » ; commit, relecture croisée (règle 2 : **le lot 3 touche un format qui voyage** — les
schémas), verdict au jeton, puis Grégoire.

---

## 6. Garde-fous — ce qui ne doit pas bouger, et comment on le saura

1. **Tarir n'est pas réparer, et ici il n'y a rien à tarir** : zéro écriture dans les quatre
   clés globales, zéro écriture dans une grille sans geste explicite. La sentinelle du lot 1 le
   prouve sur le repli ; la spec du lot 2 le prouve sur une copie orpheline.
2. **Le rendu d'une copie de Grégoire ne change pas d'un pixel** tant qu'il n'active rien :
   même numéro (ordre personnalisé), même nom, même couleur, même texte. ▣ Témoin : les specs
   `retroaction-mode-simple-672`, `grille-changee-donnees-algo-645`,
   `erreurs-saisie-manuelle-preservee` et la sentinelle #581 passent **sans être touchées**.
3. **Un tampon posé ne se perd jamais** : code absent de la grille ⮕ affiché quand même.
4. **Le préfixe `errfr_` reste** — et l'aide le dit une fois, pour que personne ne prétende que
   la discipline a disparu de la donnée.

---

## 7. Ce qui remonte à Grégoire — trois questions fermées, puis le go

**Q1 — La forme (pédagogie : ce qu'un code mesure).** Les tampons d'une grille sont-ils
**(a) ses sous-critères** (option B, recommandée : une seule liste, l'évaluation la lit déjà)
ou **(b) une liste à part** (option A du cadrage : deux listes à aligner) ?

**Q2 — Ses données (ses grilles réelles).** Pour les grilles existantes, l'activation est un
geste explicite — rien ne change tant qu'il n'est pas fait : **(a) oui, opt-in partout**
(recommandé) ; **(b) activé d'office sur les grilles NEUVES seulement**, opt-in sur les
anciennes. Et le sous-critère de **pondération 0** (« 0 — Aucune erreur ») **ne devient pas un
tampon** : à confirmer, c'est un sens pédagogique.

**Q3 — Les mots (ce qu'il lit, et ce qu'un collègue lira).** Le bouton du gabarit — proposition :
« Utiliser ces sous-critères comme tampons d'annotation » — et le titre de l'écran Annoter ›
palette, aujourd'hui « Rétroactions — Erreurs de français » — proposition : « Rétroactions —
Codes d'annotation (repli) ». **Les mots sont à lui.**

⮕ **Et le go** : le cadrage dit que la place de ce chantier lui appartient, avec le
14 septembre en tête. **Rien n'est codé tant qu'il n'a pas répondu.**

---

## 8. Ce que je n'ai PAS mesuré, et le dis

- **Ses données réelles** : a-t-il réordonné les codes (`ordreErreursFr` non nul) ? renommé ?
  Seul son navigateur le sait. Sans conséquence si Q2 = opt-in : le repli les respecte.
- **L'effort en heures** — aucun chiffre. Le compte : 15 sites + 10 entrées `OUTILS` + 3
  lecteurs de dessin + 2 schémas + 1 formulaire + 1 écran ≈ **une trentaine de sites dans
  8 fichiers**, en quatre lots livrables un à un.
- **Le geste `sousCriteresParDefaut`** (`grilles.js:4283`) : quel bouton le déclenche
  aujourd'hui, et dans quel mode — à lire au lot 3, pas supposé ici.
- **Ce fichier n'est pas commité** : il attend les réponses, comme les autres cadrages du jour
  dans `plans de travail/`.
