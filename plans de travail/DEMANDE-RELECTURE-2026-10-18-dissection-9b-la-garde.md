# Demande de relecture – la dissection, lot 9b : la garde de la note

> Claude Code, dimanche 18 octobre 2026, vers 19 h (Toronto). Consigne : `CONSIGNE-LOT-2026-10-18-dissection-9b-la-garde.md` (18 h 33). Décision de Grégoire, 18 h 32. Pour Cowork (`PROTOCOLE.md`, règle 2).
> Un commit sur `main`, **non poussé**. Il porte aussi le verdict du lot 9, la consigne du lot, la consigne du jour et son archive, et #1108 au BACKLOG. **Pas de version, pas de push.**

## Ce qui est fait

1. **La marque** : `ponderationACompleter: true`, sur le critère.
   - Elle est posée à deux endroits :
     - (a) par la création de la dissection, pour chaque critère sans pondération (`materiel-assistant.js`, `construireGrille`) ;
     - (b) par Grilles de critères quand le champ « Points » est vidé, qui écrit alors `null` et non plus NaN.
   - Elle est retirée dès qu'un nombre est saisi, 0 compris.
   - Pour (b), la règle tient dans une seule fonction, `poserPonderation` (`grilles.js`). Elle est appelée par les deux écrivains, `modifierCritereGrille` et `modifierCritereTemp`, donc par les **trois** gestionnaires du champ : `modifierCritereGrilleHandler`, `modifierCritereTempHandler` et aussi `modifierPonderationCritereTempHandler`, que la consigne ne nommait pas.
   - Aucun autre chemin ne pose la marque.
2. **La garde** (`calculerPortee`) : un critère marqué est hors note, avec le motif `ponderation-a-completer`, **même s'il a un niveau**. Une évaluation commencée est alors incomplète. Elle passe par `portee.incomplete`, que l'écran, le refus d'enregistrer, la synthèse et le PDF lisent déjà : ni plus ni moins que la garde existante.
   - Une évaluation sans aucun niveau reste « vide », pas incomplète, comme aujourd'hui.
   - Un critère non marqué garde le comportement d'aujourd'hui, qu'il soit absent ou à 0.
3. **Le stock, écrit** (commentaire dans `calculerPortee`). Un critère **ancien** sans pondération, non marqué, est calculé comme avant : il sort de la note en silence, et ses voisins font la note. C'est la décision de Grégoire (18 oct., 18 h 32). Aucune note déjà remise ne change, puisqu'aucun code ne pose la marque sur une grille existante.
4. **Le voyage de la marque** (mesuré dans le code et éprouvé en Vitest) :

| Chemin | La marque | La pondération |
|---|---|---|
| Duplication, partage vers les grilles actives (`copiePropre`, JSON), codex, export et import « configuration complète » | Gardée (copie telle quelle) | `null` gardé |
| Import sélectif (`assainirObjet`, liste blanche) | **Gardée** : je l'ai ajoutée au schéma `SCHEMAS_IMPORT.grille` | Ramenée à **0** ; la marque reste, et la garde s'applique encore (V.a) |
| Import JSON de la Bibliothèque (`assainirImportJson`) | Gardée | `null` gardé (V.a bis) |
| **Paquet de partage `.lcz`** (`labo-codex-partage-v1`) | **Retirée** : la projection ne copie que les champs déclarés, et le schéma fermé ne la déclare pas | `null` est **refusé** (« null non accepté ») : **l'export s'interrompt**, avec l'alerte « le package généré ne passe pas la validation » |

   **Une décision vous revient**, à Cowork et à Grégoire, parce qu'elle touche le format qui voyage. Une grille de la dissection à compléter **ne peut pas être partagée en `.lcz`** tant que ses points manquent. Avant ce lot, un champ vidé y écrivait NaN, que la validation refusait aussi (« nombre fini attendu ») : rien n'empire pour ce cas-là. Le cas neuf, c'est la grille créée par la dissection. Je n'ai pas touché au schéma de partage : un champ de plus serait refusé par les versions déjà installées (schéma fermé, rejet d'un champ inconnu).

5. **La confirmation** de la dissection redit que, d'ici là, la note d'une copie évaluée avec cette grille affichera « -- ».

## Une limite, à savoir

**Les évaluations qui n'ont pas leur portée déclarée**, c'est-à-dire écrites avant #674 (1er sept.) et sans `ponderationCouverte`, se relisent par `calculerPortee`. Si l'enseignant vide **maintenant** le champ Points d'un critère de leur grille, elles deviennent « incomplètes » à la relecture.
- Les évaluations déclarées ne bougent pas : leur couverture fait foi, et elle reste au moins égale au nouveau total.
- Cela suppose une grille d'avant le 1er septembre dans un trimestre ouvert, et un geste neuf de l'enseignant. A2025 et H2026 sont clos, en lecture seule (inférence : je n'ai pas vérifié que le champ y est bloqué).

## Les bancs

- **Vitest complet** : voir le verdict de `npm test` plus bas. Le banc neuf, `materiel-dissection-9b-la-garde.test.js`, compte 11 essais :
  - la garde (marqué → hors note ; non marqué et absent → comme avant ; 0 → comme avant ; aucun niveau → vide) ;
  - les trois gestionnaires (vidé → `null` et la marque ; un nombre → marque retirée) ;
  - la création de la dissection (seuls les deux critères sans points sont marqués) ;
  - le voyage (import sélectif, Bibliothèque, aller-retour JSON).
- **WebKit** : la spec du lot 9 est prolongée jusqu'à la marque en base, à la portée incomplète calculée sur la grille en base, à la saisie qui retire la marque, et au champ vidé qui la repose.
  - **La note « -- » à l'écran d'évaluation n'est pas conduite.** Il faudrait semer un cours, un élève, une production et une pratique (la spec d'audit du parcours sommatif y consacre environ 400 lignes). La garde ne fait qu'alimenter `portee.incomplete`, que les specs #674 éprouvent à l'écran.
- **Break-tests**, avec le fichier restauré chaque fois :
  - la garde qui ignore la marque : G.a, G.e, V.a, V.a bis et V.b rougissent ;
  - le gestionnaire qui ne pose pas la marque : M.b et M.c rougissent ;
  - la marque retirée du schéma d'import : V.a rougit.
- `import-export.js` est touché : `npm test` complet (Vitest, puis Playwright) a été lancé avant le commit, comme le veut CLAUDE.md. Son résultat est ci-dessous.

## Les textes neufs (provisoires, à ajouter à la liste du lot 9)

| Où | Texte |
|---|---|
| Confirmation (ajout) | « D'ici là, la note d'une copie évaluée avec cette grille affichera « -- ». » |
| Écran d'évaluation, sous la note | « Pas de note tant qu'un critère n'a pas sa pondération — A, B. Donne-leur leurs points dans Conception → Grilles de critères. » (au singulier : « Donne-lui ses points ») |
| Refus d'enregistrer, et synthèse | « sans pondération : A, B » |

## Au BACKLOG

- **#1108** : la « Grille de base » de l'assistant de pratique, sans `ponderation`. Il faut d'abord mesurer si elle est évaluée par `ponderation` ou par `poids`. Non corrigée.

## Le verdict de `npm test`

Lancé sur l'arbre de ce commit (code inchangé depuis le lancement), code de sortie 0.

- **Vitest** : 778 fichiers, **9 251 essais, tous verts**.
- **Playwright (WebKit)** : **796 passées, 0 échouée**, 17 sautées, 9 instables (vertes au second essai), en 1,3 h.
  - Les 9 instables : `carac-476-volet2-duplication`, `clore-et-alleger-un-trimestre`, `codex-1014-codex-complet`, `doublons-lisibilite-291`, `ouverture-sans-geste-981-983`, `planif-menu-vue`, `pratiques-762-appliquer-au-cours-actif`, `registre-longitudinal-915`, `temoin-enregistrement-lot-b`.
  - Aucune ne touche aux grilles, à la portée ni à la dissection (inférence par leur nom et leur sujet ; je ne les ai pas relancées une à une).
- Ce n'est **pas** le verdict du temps B : celui-ci se prendra sur le dernier commit, après la version qui suivra.
