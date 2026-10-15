# Demande de relecture – décisions des groupes 1 et 2 : ce qui se fait sans Grégoire

> Claude Code, 15 oct. 2026 (consigne de Cowork de 11 h 01). Base : `main` local après fusion de
> `origin/main` (`16a68d79` : trois commits de l'observation, documentation seulement, sans conflit).
> Aucun push, aucune release, aucun verdict Playwright.

## Ce que le lot fait

| Partie | Fait | Où |
|---|---|---|
| 1. Commentaire du verdict de 9 h 46 | Deux lignes à l'endroit où l'erreur du fichier tenu est avalée : issue 3 assumée, la cause du premier échec ne parvient pas au message, le second (fenêtre de choix) porte la sienne. | `js/codex.js`, `sauvegarderVersDestination`, stratégie 1a |
| 2. #489 | Verrou d'une production retiré (fonction, export, en-tête, `noms_stables.json`) ; verrous individuels retirés ; Banque d'évaluations retirée (voir plus bas) ; drapeau `verrouille` des productions plus écrit. | `js/productions.js`, `js/productions-liste.js`, `js/evaluation.js`, `noms_stables.json` |
| 3. BACKLOG | Huit lignes recopiées telles quelles sous #463, #336, #544, #489, #835, #668, #275, #333. Cochées : #544, #489, #275. | `BACKLOG.md` |

## « Les fonctions de la Banque et du verrouillage en lot » : remesuré

Mesure : `git grep -w <nom> -- js '*.html' css tests`. La modale `modalBanqueEvaluations` n'existe
pas dans `index.html` ; aucun `data-action` vers ces fonctions ne se trouve hors du HTML que la
Banque générait elle-même. **Toutes le confirment ; toutes sont retirées :**

- `ouvrirBanqueEvaluations`, `fermerBanqueEvaluations`, `chargerFiltresBanqueEvaluations`,
  `filtrerBanqueEvaluations`, `afficherListeBanqueEvaluations`, `ouvrirBanqueAvecRecherche` ;
- les gestes de sa liste : `chargerEvaluationDepuisBanque`, `appliquerJetonRepriseDepuisBanque`,
  `basculerVerrouillageEvaluation` (son cadenas), `retirerJeton`, `supprimerEvaluationBanque` ;
- le verrouillage en lot : `verrouillerToutesEvaluations` ;
- `appliquerJetonRepriseDepuisSidebar` : sans appelant, et son seul effet passait par
  `appliquerJetonRepriseDepuisBanque`. La garder aurait laissé un appel vers une fonction retirée.

Exports `window.` retirés avec elles (sept). Le commentaire de `basculerVerrouillageEvaluationCourante`
dit maintenant qu'elles sont retirées. 567 lignes en moins dans `evaluation.js`.

## Le drapeau `verrouille` des productions

Lecteurs mesurés : aucun (`git grep -n -E "\.verrouille([^e]|$)"` : les seuls accès restants sont
sur les critères de grille et les présences ; `liste-evaluations.js:1394` lit `ligne.verrouille`,
qui vient de `evaluation.verrouillee`). Créateurs arrêtés : `construireProductionData` (création) ne
l'écrit plus ; la copie depuis la bibliothèque ne le porte plus (`delete copie.verrouille`, la copie
partant d'un spread de sa source). **Source seulement** : le champ déjà écrit reste, inerte. Les
schémas d'import (`import-export.js`, `partage-schemas.js`) le tolèrent toujours.

## Suppositions

1. **Le `delete copie.verrouille`** plutôt que de simplement ôter `verrouille: false` : sans lui, une
   copie d'une production verrouillée en hériterait par le spread. Ce n'est pas écrire dans le stock :
   c'est l'objet neuf.
2. **`appliquerJetonDelaiDepuisSidebar`** est aussi sans appelant (`#boutonJetonDelai` absent
   d'`index.html`), mais n'est ni de la Banque ni un verrou : **issue 3**, commentaire posé dessus,
   non retirée.
3. **Le glossaire** (`docs/guide/03-glossaire.md`) citait `verrouillerEvaluation` comme exemple de nom
   trompeur : remplacé par `descendreEvaluation`.

## Bancs

- **Neuf** : `tests/unit/sentinelle-489-verrou-production-retire.test.js` (7 essais). A : aucun des
  17 symboles retirés dans le code de `js/`, `index.html`, `noms_stables.json`. B : aucun accès ni
  littéral `verrouille` dans `productions.js` et `productions-liste.js` ; la copie retire le champ ;
  témoin des schémas. C : le bouton « Verrouiller l'évaluation » appelle la porte unique, définie et
  exportée, et le cadenas de la palette (`travaux-ui.js`) aussi.
- **Adaptés** : `sentinelle-522-lot3a` (A.a et B.d retirés avec la fonction ; A.b et A.d gardent leur
  course avec un autre geste en face : suppression, déplacement) ; `refactor-productions`,
  `refactor-evaluation`, `evaluation-chargement.spec.js` (exports retirés) ; `sentinelle-468`,
  `sentinelle-790`, `sentinelle-lot-e3` (la création n'écrit plus `verrouille`) ; `sentinelle-567`
  (le cliquet descend : `--violet-pale` n'était utilisé que par la Banque).
- **Break-tests**, chacun restauré par copie (`cmp`) :
  - `window.verrouillerEvaluation` remis → 489·A rouge ;
  - `productionData.verrouille = false;` remis → 489·B, 468·S4 création et lot E3 rouges ;
  - `data-action` du bouton retiré d'`index.html` → 489·C rouge ;
  - `delete copie.verrouille` retiré → 489·B (copie) rouge ;
  - `monterEvaluation` sans `db.modifier` (lecture, attente, écriture) → 522 A.b et A.d rouges, par
    leurs propres assertions.
  - `sentinelle-790` n'est pas rougie par la remise de l'écriture : son assertion sur `verrouille` à
    la création est remplacée par `dansBibliotheque`, le verrou étant gardé par 468 et E3.
- **Le verrou d'une copie, au comportement** : `temoin-enregistrement-lot-b.spec.js` (Playwright),
  au verdict du soir. Non lancé ici.
- **Vitest complet** (depuis `tests/`) : **8 791 sur 8 791**, 753 fichiers, aucune ligne
  « Errors » ni « Unhandled ».

## Hors lot

Rien à l'écran, pas de ligne des Nouvelles, pas de porte terrain. `plans de travail/observation/`
non touché.
