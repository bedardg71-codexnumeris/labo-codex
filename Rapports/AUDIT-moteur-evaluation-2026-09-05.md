# AUDIT – Le moteur d'évaluation : par quels chemins une note ou un niveau atteint le stockage, l'écran ou le PDF sans avoir été calculé, ou calculé sur autre chose que ce que l'enseignant a saisi

**Date** : 5 septembre 2026, 14 h 20 – 15 h 10.
**Cadré par** : `Rapports/prompts-audit/PROMPT-AUDIT-moteur-evaluation-2026-09-05.md` (Cowork, avec Grégoire).
**Base auditée, mesurée** : branche `audit/moteur-evaluation-2026-09-05`, partie de `origin/main` ; `git rev-parse --short HEAD` = `7a40949b` (= `main` = `origin/main` après `git fetch`) ; `cat version.json` = `{"build":"0905-1315","beta":"1.120.0"}`. Arbre du worktree propre avant l'audit ; il porte ensuite un seul fichier neuf, le banc de mesures (ci-dessous). L'arbre principal porte trois fichiers de Cowork modifiés et deux prompts non suivis, qui ne sont pas de cet audit.
**Vitest, depuis `tests/`** (`npm run test:unit`) : 468 fichiers / 5 202 tests verts avant le banc (rituel d'ouverture, 14 h 20) ; **469 fichiers / 5 232 tests verts avec lui**, code 0, 23,1 s.
**Périmètre recompté** (`wc -l`) : les onze fichiers du prompt font **11 539 lignes**, chiffre identique au prompt (1450 · 362 · 887 · 643 · 1237 · 1013 · 1763 · 3219 · 316 · 149 · 500). `js/pratiques/` : 15 fichiers, 8 236 lignes.
**Mode** : lecture seule sur `js/` (**rien d'appliqué**), exécution en bac à sable Vitest. Les modules réels sont chargés dans un faux `window` (patron des sentinelles #674, lot 2 et lot 3) et leurs fonctions publiques sont appelées telles quelles.

**Le banc** : `tests/unit/audit-moteur-evaluation-2026-09-05.test.js`, 30 mesures. Chaque `it` porte le numéro d'une mesure de ce rapport (A1, B2…) et ses `expect` sont les valeurs **obtenues**, pas souhaitées : s'il rougit un jour, c'est que le comportement a changé et que le constat est à remesurer. Il imprime toutes les valeurs sous `AUDIT-MESURES`.

```
cd tests && npx vitest run unit/audit-moteur-evaluation-2026-09-05.test.js
```

**Verdicts** : `[exécuté]` = la fonction réelle a été appelée dans le banc et la valeur citée est celle qu'elle a rendue ; `[lecture]` = chemin de code lu, non exécuté ; `[grep]` = un compte reproductible par la commande citée. Ce que le banc n'est pas : un navigateur. Aucun WebKit n'a tourné ; l'ordre réel des événements (rejeu des `change`, minuteries de `preRemplirEvaluation`, garde #671) n'est pas éprouvé ici.

---

## Vue d'ensemble : la réponse à la question directrice

Quatre chemins font atteindre au stockage, à l'écran ou au PDF une valeur qui n'est pas celle que l'enseignant a saisie. Aucun ne passe par `calculerNote()` lui-même, dont la boucle de somme est saine ; tous passent par ce qui l'encadre.

| n° | Flux | Ce qui arrive | Gravité | Verdict | Disposition proposée |
|---|---|---|---|---|---|
| A-1 | A, B | Échelle non résolue : la porte #674 laisse passer une portée nulle, **`0` est écrit, verrouillé, sans portée** ; en modification, il remplace une vraie note (84 → 0) | majeur | `[exécuté]` A1 A2 A5 | **corriger maintenant** |
| D-2 | D | Codes ou nombre de mots **effacés** : le pourcentage et le niveau d'avant restent en mémoire, la note ne bouge pas, l'enregistrement persiste « 0 erreur → 17,50/20 (87,5 %) » | majeur | `[exécuté]` D2 D3 D4 | **corriger maintenant** |
| G-2 | G, F | #646 mesuré : après réouverture, un niveau changé fait écrire par l'auto-save **la note neuve (95) avec les critères anciens (c3 = I)** ; le bilan nomme encore l'ancien défi | majeur | `[exécuté]` G2 G3 G4 | **corriger maintenant** (périmètre borné) + inscrire la réunification |
| B-1 | B | Trou entre deux bornes entières : le niveau global prend « le plus proche », **74,5 % → M** (M commence à 75), 89,5 → E, 59,5 → D ; l'algorithmique rend « -- », l'analytique rien : trois règles | moyen | `[exécuté]` B1 B2 B3 B4 | inscrire et continuer |
| B-2 | B, F | « -- » entre en base comme `niveauSelectionne` d'un critère algorithmique, et sur le PDF | moyen | `[exécuté]` B2 B5 | inscrire (avec B-1) |
| C-1 | C | Le type **déclaré** à la grille n'est lu ni par le calcul ni par la palette : un critère sans type sous une grille « Analytique » ignore ses points et calcule en holistique | moyen | `[exécuté]` C1 C2 C3, `[grep]` | inscrire et continuer |
| D-1 | D | Mode catégories : **zéro code = pas de note** ; mode simple : zéro erreur = 100 % | moyen | `[exécuté]` D1 | inscrire et continuer (règle pédagogique) |
| E-2 | E, F | Grille rééditée (critère ajouté) : une évaluation d'avant #674 se relit **incomplète**, le PDF refuse de conclure sur une note déjà remise | moyen | `[exécuté]` E2 | inscrire et continuer |
| H-1 | H | `pratiques/` lit `noteFinale` sans `ponderationCouverte` ni `verrouillee` : **un brouillon 95 sur 80 % compte 95 ; un `0` de portée 0 compte 0** (84 → 33,6) | majeur (frontière) | `[exécuté]` H1 H2 H3 H4, `[grep]` | inscrire et continuer (second audit) |
| B-3 | B, F | Bruit flottant dans `donneesAlgorithmiques.pourcentage` (74.49999999999999) ; aperçu enseignant imprime la note brute | mineur | `[exécuté]` B5 F1 | commenter et oublier |
| D-3 | D | Le facteur par défaut est 500 dans les trois sources du code ; la décision 500 → 600 porte sur SA grille, une donnée réelle non mesurée ici | information | `[exécuté]` D5, `[lecture]` | aucune (à vérifier par lui, à l'écran du gabarit) |

Les dispositions sont **proposées** ; Grégoire arbitre. Trois « corriger maintenant » sont proposés parce que dans chacun un élève peut lire un chiffre faux (une note du cours qui compte un `0`, une ligne « 0 erreur → 87,5 % », un bandeau E au-dessus d'un critère « Insuffisant ») ; si Grégoire juge la source assez rare pour la cohorte 1, chacun se rabat sur « inscrire ».

---

## A · Les sites d'écriture de la note

**Carte** `[grep]` : `grep -rn "noteFinale:" js/ --include='*.js'` rend, le 5 septembre, trois sites qui posent `noteCalculeeCourante` ou `0` (`js/evaluation.js:1855`, `js/evaluation-chargement.js:1606`, `js/evaluation-sauvegarde.js:229`), un site qui recopie la valeur venant d'être écrite (`js/evaluation.js:1900`, `_traiterPostRepriseMod`), et des lectures ou recopies hors écran (`journal.js:121,358`, `liste-evaluations.js:755,2192`, `profil-etudiant-actions.js:435,595,630`, `portfolio.js`, `pratiques/`), qui ne réécrivent pas `evaluationsSauvegardees`. Les mutations directes, `grep -rn "\.noteFinale = " js/`, sont deux : `evaluation-chargement.js:1575` (l'auto-save met à jour l'existante) et `evaluation-calcul.js:1337` (`evaluationEnCours.niveauFinal`, en mémoire). Les quatre chemins écrivent `ponderationCouverte` à côté (`grep -rc ponderationCouverte js/` : calcul 11, chargement 2, sauvegarde 1, evaluation 1, synthese-retroaction-data 2, **pratiques 0**).

### A-1 · Une échelle qui ne se résout pas fait écrire `0` – majeur – `[exécuté]`

**Le mécanisme.** Quand `echelleId` ne se trouve ni dans `echellesTemplates` ni dans une pratique (`pratique-<id>`), `calculerNote()` sort tôt : écran « -- », `window.noteCalculeeCourante = null`, `_ecrirePorteeEcran(null)` (`grep -n "noteCalculeeCourante = null" js/evaluation-calcul.js`). La porte `verifierPorteeAvantSauvegarde` fait `if (!portee || !portee.incomplete) return true;` : une portée **nulle** passe. Les trois sites d'écriture font `(typeof window.noteCalculeeCourante === 'number') ? … : 0`, et `ponderationCouverte` devient `null`. Les gardes de références (`_validerReferencesSauv`, `_validerReferencesMod`) vérifient l'étudiant, la production et la grille ; **pas l'échelle**.

**Mesuré** (banc, grille 50/30/20, niveaux E·E·I, `echellesTemplates` vide) :

| mesure | chemin | refus | ce qui est écrit |
|---|---|---|---|
| A1 | `sauvegarderEvaluation()` | aucun, notification de succès | `noteFinale: 0`, `ponderationCouverte: null`, `niveauFinal: '--'`, `verrouillee: true` |
| A2 | `sauvegarderEvaluationModifiee()` sur une évaluation à 84 / portée 100 | aucun | la même, réécrite : `noteFinale: 0`, `ponderationCouverte: null`, `verrouillee: true` |
| A5 | auto-save de création (`niveauSelectionne` puis la minuterie) | – | `noteFinale: 0`, `ponderationCouverte: null`, `verrouillee: false`, 3 critères |
| A3 | témoin, même évaluation avec son échelle | aucun | `noteFinale: 84`, `ponderationCouverte: 100`, `niveauFinal: 'M'` |

**Ce que l'enseignant voit** : « -- » sous la note, puis « Évaluation enregistrée ». Dans la liste des évaluations, un `0` s'affiche « - » (`liste-evaluations.js:946`, reproduit en A4 : `noteFinale !== 0 ? … : '-'`) : le zéro écrit ressemble à une case vide.
**Ce que l'élève lit** : le PDF de synthèse ne conclut pas (la portée relue sur une échelle absente rend tous les critères « niveau-sans-valeur », sentinelle porte 2). Mais **la note provisoire du même PDF** (`synthese-retroaction-data.js:1224`, filtre `noteFinale != null`) et **la note du cours** comptent ce `0` : voir H-2, 84 → 33,6.

**Quand ça arrive** `[lecture]` : une échelle supprimée avant que #648 (1.113, « Supprimer une échelle, c'est la remplacer ») n'existe ; une grille partagée ou importée sans son échelle (l'import de pratiques ne remappe pas `echelleId`, décision d'option A du 26 juin) ; une échelle `pratique-<id>` dont la pratique a disparu ; un trimestre archivé consulté sans copie d'échelle (le commentaire « #348-résiduel » de `calculerNote` nomme ce cas). #648 tarit la source pour la suppression par l'éditeur ; le stock et les autres entrées restent.

**Disposition proposée : corriger maintenant.** C'est le cinquième chemin de « un `0` par-dessus une vraie note », le défaut même que #572 (quatre sites) et #674 ont fermé partout ailleurs ; un élève peut lire un chiffre faux par la note provisoire et par la note du cours. Le correctif tient dans la porte (refuser quand `noteCalculeeCourante === null`, en nommant l'échelle introuvable) et dans l'auto-save de création (ne rien créer sans échelle résolue). **Stock** : un `0` déjà écrit par ce chemin se reconnaît (`noteFinale === 0 && ponderationCouverte === null && niveauFinal === '--'`) ; il se mesure, il ne se répare pas d'office (ses données remontent à lui).

### A-2 · Les autres écritures – fonctionne – `[lecture]`

`_traiterPostRepriseMod` recopie `evaluations[indexEval].noteFinale` juste écrite (journal avant/après). `profil-etudiant-actions.js`, `liste-evaluations.js`, `journal.js` lisent ou recopient dans des objets de récit ou de journal ; aucun n'écrit dans `evaluationsSauvegardees`. L'ordre des gardes est le même sur les deux enregistrements manuels : références → `_forcerRecalculAlgorithmiqueAvantSauvegarde` → porte (qui rappelle `calculerNote()`) → collecte → écriture (`evaluation-sauvegarde.js:410-428`, `evaluation.js:2003-2035`).

---

## B · La résolution de l'échelle

### B-1 · Le trou entre deux bornes entières – moyen – `[exécuté]`

**Le mécanisme.** Le niveau global cherche `pourcentage >= n.min && pourcentage <= n.max` ; s'il ne trouve rien, le repli prend le niveau dont le **milieu de plage** est le plus proche (`grep -n "Fallback niveau" js/evaluation-calcul.js` → l. 1278-1286, avec un `console.warn`). Les quatre échelles par défaut ont des bornes entières (`js/echelles.js:3036-3039` : 0-59, 60-74, 75-89, 90-100) : tout pourcentage à décimale entre deux bornes tombe dans un trou, et le milieu du niveau supérieur est toujours le plus proche.

**Mesuré** (grille 50/50, échelle I 54 · D 65 · M 84 · E 95 aux bornes 0-54, 55-74, 75-89, 90-100) :

| pourcentage | niveau global rendu | plage du niveau rendu |
|---|---|---|
| 74,5 (E + I) | **M** | 75-89 |
| 89,5 (E + M) | **E** | 90-100 |
| 59,5 (D + I) | **D** | 55-74 |
| 89,0 (témoin, dans la plage) | M | 75-89 |

Le même 74,5 % sur un **critère algorithmique** rend « -- » (`_determinerNiveauIDMEAlgo` et ses deux jumeaux en ligne, B2) ; sur un **critère analytique**, `niveauDeduitDesPoints` rend `undefined` et retire l'entrée (B3). Trois règles pour le même trou.

**Ce que l'élève lit** : le niveau global du PDF (`construireOverall`, `evaluation.niveauFinal`), le « Niveau : » de la rétroaction copiée, et ce que PAN-Standards lit de `niveauFinal`. Le chiffre est juste (74,5 %) ; la lettre à côté est celle du niveau qui commence à 75.

**Disposition proposée : inscrire et continuer.** La règle du trou est une décision : arrondir le pourcentage avant la recherche (au dixième ? à l'entier ?) ou imposer des bornes contiguës dans l'éditeur d'échelle (le cadrage du lot 4, §A, posait déjà cette alternative). L'unification des trois règles est technique ; le choix de la règle est pédagogique. Antérieur au chantier des trois types ; A2025 et H2026 ne se rouvrent pas.

### B-2 · « -- » entre en base comme niveau d'un critère – moyen – `[exécuté]`

`_appliquerResultatsAlgoCategories` et le mode simple écrivent `evaluationEnCours.criteres[critereId] = niveauIDME` même quand `niveauIDME === '--'` ; les trois collecteurs poussent `if (niveau)`, et « -- » est vrai. **Mesuré B5** (51 erreurs / 5 000 mots, facteur 500 → 74,5 %) : l'enregistrement passe sans refus, `criteres[]` porte `{ critereId: 'a1', niveauSelectionne: '--', ponderation: 20 }`, `donneesAlgorithmiques.a1.niveau = '--'`, la note compte le critère par son pourcentage exact (82,1 %, niveau global M), la ligne à copier dit `M\t--`. Sur le PDF, `libelleNiveau(echelle, '--')` ne trouve rien et rend le code tel quel (`synthese-retroaction-data.js:740-744`) ; la ligne algorithmique, elle, est juste (« 14.90/20 (74.5 %) »). La clé de cartouche `a1_--` n'existe pas : commentaire vide, en silence.
**Disposition : inscrire**, avec B-1 : même racine, même lot.

### B-3 · Bruit flottant – mineur – `[exécuté]`

`donneesAlgorithmiques.pourcentage` porte `74.49999999999999` pour 20 − 51/5000×500 (B5). Sur cinq combinaisons holistiques de la grille 50/30/20 (F1 : 84,6 · 85,1 · 68,5 · 84 · 82,5), la valeur stockée est propre. L'écran (`toFixed(1)`), la liste (`Math.round(x*10)/10`) et le PDF (`toFixed`) arrondissent ; **l'aperçu enseignant** de l'export (`travaux-export-pdf.js:979`, `${evaluation.noteFinale}%`, marqué « APERÇU ENSEIGNANT, pas le PDF remis » l. 937) imprime la valeur brute (ex. « 79.625% », E1).
**Disposition : commenter et oublier.**

### B-4 · L'échelle remplacée (#648) et l'échelle muette – fonctionne – `[lecture]` et sentinelles

Le remplacement ne propose que des échelles aux mêmes codes (changelog 1.113, l. 121-127) : les `niveauSelectionne` restent résolubles. L'échelle « muette » (`valeur:` sans `valeurCalcul:`) est couverte par la sentinelle #674 C (« 0.0 % » n'est plus un résultat). Ce qui reste hors de ces deux filets est A-1.

---

## C · Les trois types de grille et leurs frontières

### C-1 · Le type déclaré n'est lu que par l'éditeur – moyen – `[exécuté]` `[grep]`

`grep -c "grille\.type\|typeGrille" js/evaluation-calcul.js js/evaluation-chargement.js js/evaluation-sauvegarde.js js/evaluation.js` rend **0, 0, 0, 0**. Le calcul (`_pointsAnalytiquesDe` : `critere.type !== 'analytique'` → `undefined`), la palette (`evaluation-chargement.js:1012-1013` et `:1241`, `critereGrille?.type === 'algorithmique' | 'analytique'`, sinon menu de niveaux) et les collecteurs (`c.type === 'analytique'`) ne lisent que le type du **critère**. Le défaut implicite est holistique.

**Mesuré** (grille `type: 'analytique'`, critère `k` sans type pesant 30, critère `c1` holistique pesant 70, 24 points sur `k`) :

| mesure | état | résultat |
|---|---|---|
| C1 | `k` sans type, points 24, pas de niveau | `k` hors note « sans-niveau », écran « -- », portée « Rédaction (30 %)… 70 % de la grille » |
| C2 | `k` sans type, points 24 **et** niveau M au menu | note **84** : `k` compte comme holistique (M = 84), pas 80 % de ses points |
| C3 | témoin : `k` porte `type: 'analytique'` | note 82,8 (0,7×84 + 0,3×80), niveau M déduit (lot 3) |

**Quand ça arrive** `[lecture]` : une grille d'avant le chantier dont on déclare le type après coup. `modifierTypeGrilleHandler` (`grilles.js:6060-6064`) écrit `grille.type` et **ne touche pas aux critères existants** (« ce sont des données »). Pour ce critère, la palette montre un menu de niveaux (cohérent avec le calcul) ; les points ne peuvent pas y être saisis, donc C1 suppose une évaluation faite quand le critère était analytique puis dé-typé, ou une grille importée dont les critères n'ont pas de type. Le badge de la grille dit ce qui EST (HOLIS ou MIXTE), pas ce qui est déclaré ; rien à l'écran de la palette ne dit que la déclaration est ignorée.

**Disposition proposée : inscrire et continuer.** Deux voies techniques : le calcul et la palette lisent `typeParDefautCritere(grille)` (`grilles.js:3232`, existe) comme repli d'un critère sans type ; ou l'éditeur dit, sous le menu, que les critères existants ne suivent pas la déclaration. Le plan du lot 1 a tranché « on n'écrit rien dans ses données » : le choix entre repli à la lecture et avertissement lui revient.

### C-2 · Grille d'avant le chantier, sans aucun type – fonctionne

Les sentinelles #674 (A) et lot 2 (D) tiennent : un critère sans type calcule comme avant. C1 n'apparaît que si la grille déclare un type.

### C-3 · Points sans niveau déductible – su, mesuré aux lecteurs – `[lecture]`

Le critère compte ses points (portée complète) mais n'entre pas dans `criteres[]` (lot 3, assumé par test). Lecteurs aval lus : le PDF (`construireCriteres` parcourt `evaluation.criteres` : le critère est absent de la liste alors que la note le compte) ; le bilan (`_collecterCriteresBilan` parcourt la grille et lit `ec.criteres[gc.id]` : absent aussi) ; `porteeDepuisEvaluation` lit `evaluation.pointsAnalytiques` : complet. Cohérent avec ce qui est inscrit ; rien de neuf.

---

## D · Le critère algorithmique

### D-1 · Zéro code n'est pas zéro erreur – moyen – `[exécuté]`

Mode catégories : `if (mots === 0 || totalErreurs === 0)` (`evaluation-calcul.js:546`) réinitialise et sort **avant** la formule. Mode simple : `if (motsRequisSimple && mots === 0)` (`:648`) ; zéro erreur passe par la formule.
**Mesuré D1** : catégories, 500 mots, aucun code → critère « sans-niveau », note « -- » ; simple, 0 erreur / 500 mots → E, 100,0 %, note 87,2 %.
**Ce que l'enseignant vit** : une copie sans faute en mode catégories ne peut recevoir sa note qu'en choisissant le niveau au menu « modifiable manuellement » ; la formule ne s'applique jamais à une copie parfaite. Le registre `ratio_cible` sait pourtant le dire (« aucune erreur : la note est complète »).
**Disposition : inscrire et continuer.** « Zéro code = pondération entière » est une règle pédagogique (Grégoire) ; la mécanique est une garde à séparer en deux (`mots === 0` reste, `totalErreurs === 0` calcule).

### D-2 · L'effacement ne tarit pas la mémoire – majeur – `[exécuté]`

**Le mécanisme.** Les deux réinitialisations fusionnent sur l'ancien objet : `Object.assign(evaluationEnCours.donneesAlgorithmiques[critereId] || {}, { erreurs, mots })` (`_viderResultatAlgoSimple`, `evaluation-calcul.js:369`) et `…, { codes, mots, totalErreurs }` (branche catégories, `:552`). Le fix #110 v3 voulait garder erreurs et mots pour que la sauvegarde ne repersiste pas l'ancienne valeur ; il garde aussi `pourcentage`, `noteCalculee` et `niveau`, et `evaluationEnCours.criteres[critereId]` n'est pas touché. Ni l'une ni l'autre n'appelle `calculerNote()` : le total à l'écran ne bouge pas non plus.

**Mesuré** (grille Contenu 80 · Français 20, c1 = M) :

| mesure | geste | écran du critère | mémoire (`donneesAlgorithmiques.a1`) | `criteres.a1` | note |
|---|---|---|---|---|---|
| D2 | codes « 1;4 », 500 mots | 87,5 % · M | pourcentage 87,5 | M | 84,7 % |
| D2 | codes **effacés** | « -- » | **pourcentage 87,5**, codes `[]`, totalErreurs 0 | **M** | **84,7 %**, portée 100 |
| D3 | 4 erreurs / 500 mots, puis mots **effacés** | « -- » | **pourcentage 80**, mots 0 | **M** | **83,2 %** |
| D4 | D2 puis **Enregistrer** | – | persisté : `{codes: [], totalErreurs: 0, pourcentage: 87.5, noteCalculee: 17.5, niveau: 'M'}` | `criteres[].a1 = M` | `noteFinale 84.7` |

`_forcerRecalculAlgorithmiqueAvantSauvegarde` rejoue le calcul avant la porte, mais le calcul sort par la même garde : le périmé est ce qu'il confirme.

**Ce que l'élève lit** : la ligne algorithmique du PDF vient de `donneesAlgorithmiques` (`synthese-retroaction-rendu.js:374-378`) : « **0 erreurs sur 500 mots → 17.50/20 (87.5 %)** », et le critère au niveau M. Deux nombres qui se contredisent sur son document.
**Troisième entrée, non mesurée** `[lecture]` : `travaux-outils.js`, `mettreAJourCompteursErreurs`, ne propage le total des codes d'annotation vers `eval_erreurs_` que `if (total > 0)` (garde délibérée, pour ne pas écraser une saisie manuelle) : retirer toutes les annotations d'une copie laisse l'ancien compte dans le champ.

**Disposition proposée : corriger maintenant** pour les deux réinitialisations : retirer `pourcentage`, `noteCalculee`, `niveau` de l'objet (comme #673 retire déjà `retroaction`), retirer `criteres[critereId]` quand aucun niveau manuel n'est choisi, puis `calculerNote()` ; une sentinelle sur le patron de D2/D3. Motif : un élève peut lire un chiffre faux, et le correctif est local. La troisième entrée (annotations retirées → propager 0 ou non) est une décision : **inscrire**.

### D-3 · Le facteur 500 → 600 – information – `[exécuté]` `[lecture]`

Le défaut est **500** dans les trois sources du code : le registre (`evaluation-formules.js`, `defaut: 500`, mesuré D5 par `normaliser({})`), la palette (`evaluation-chargement.js:1014`, `|| 500`) et le recalcul avant sauvegarde (`|| 500`). La décision du 3 septembre porte sur **sa grille** (*Grille-1 FR-ALGO seul A26*, `plans de travail/CADRAGE-2026-09-01-front-evaluations-et-code-en-dur.md:189`), donc sur une donnée réelle : non mesurée ici. Le gabarit affiche le facteur ; c'est une ligne à lire à l'écran.
**Disposition : aucune.**

### D-4 · La chaîne codes → formule → niveau – fonctionne – `[exécuté]` `[lecture]`

Les codes des sous-critères sont stockés en chaîne (`grilles.js:5023`, `nouveauCode.toString()` ; migration `categoriesErreurs` idem) et parsés en chaîne (`split(';')`) : `find(s => s.code === code)` apparie (D2 : somme pondérée 2,5 = 1 + 1,5). `_forcerRecalculAlgorithmiqueAvantSauvegarde` est appelé par les deux enregistrements manuels avant la porte ; l'auto-save écrit ce que la frappe a posé. Le lot A du 5 septembre (`codes-annotation.js`) ne touche pas la formule : il fournit la liste des codes posables ; un code posé que la grille ne connaît plus garde son numéro (`code()` jamais `null`).

---

## E · La pondération et la portée

### E-1 · Somme ≠ 100 (#483, ouvert) – fonctionne comme tranché – `[exécuté]`

Grille 50/30, E + I : note 79,625 (« 79.6 % », M) ramenée à 100 par `noteTotal / ponderationTotal` ; portée `{ couverte: 80, grille: 80, incomplete: false }`. Rien de neuf : #483 est ouvert et connu.

### E-2 · Grille rééditée après coup – moyen – `[exécuté]`

`porteeDepuisEvaluation` parcourt la grille **courante**. Mesuré E2, grille 50/30/20 devenue 40/30/20 + Sources 10 :

| évaluation relue | `incomplete` | couverte / grille | `criteresHorsNote` |
|---|---|---|---|
| d'avant #674 (sans `ponderationCouverte`), complète sur 3 critères | **true** | 90 / 100 | `[c4]` |
| avec `ponderationCouverte: 100`, grille rééquilibrée à 100 | false | 100 / 100 | `[c4]` (nommé quand même) |
| avec `ponderationCouverte: 100`, grille gonflée à 110 | **true** | 100 / 110 | – |

**Ce que l'élève lit** : pour une évaluation d'avant 1.111 dont la grille a gagné un critère, le PDF refuse de conclure (pas de bandeau) et nomme un critère qui n'existait pas quand il a été noté. Pas un chiffre faux ; une conclusion retirée sur une note déjà remise. Qui : les utilisateurs en place avec des évaluations d'avant #674 ; pas Grégoire (A2025 et H2026 ne se rouvrent pas, A26 commence).
**Disposition : inscrire et continuer.** Décision : la portée d'une évaluation se relit contre **sa** grille (prendre `criteres[]` comme référence quand `ponderationCouverte` manque) ou contre la grille courante.

### E-3 · L'évaluation vide écrit `0` verrouillé – fonctionne comme tranché – `[exécuté]`

Aucun niveau : écran « 0.0 % », enregistrement sans refus, `{ noteFinale: 0, ponderationCouverte: 0, verrouillee: true, niveauFinal: '--' }` (décision du 1er septembre : le zéro d'une évaluation jamais commencée est visible et laisse passer un jeton de délai seul). Le geste « changer la grille d'une copie évaluée puis Enregistrer sans choisir » passe par là : les anciens niveaux portent les identifiants de l'ancienne grille, la nouvelle n'a aucun niveau, rien n'est « commencé ». Nommé ici parce que H-2 montre que ce `0` compte dans la note du cours.

### E-4 · SOLO « Aucun », sous-critères, critère supprimé – fonctionne – `[grep]` `[lecture]`

`grep -c niveauSOLO js/evaluation-calcul.js` → **0** : le niveau SOLO n'entre pas dans la note. Les sous-critères n'entrent que par la somme pondérée des codes (D-4). Un critère supprimé de la grille après des évaluations n'est plus parcouru par `porteeDepuisEvaluation` ; la déclaration écrite fait foi pour le nombre (sentinelle #674 E ter).

### E-5 · Un cinquième chemin qui ignore #674 ? – oui, A-1 et l'auto-save

La règle de #674 est la même aux quatre sites (`ponderationCouverte` écrite par les quatre, `grep -rn ponderationCouverte js/evaluation*.js`). Ce qui la contourne n'est pas un cinquième site : c'est une **portée nulle** (A-1), qui n'est ni complète ni incomplète.

---

## F · Ce que l'élève lit contre ce qui est calculé

### F-1 · Les nombres viennent de la même source – fonctionne – `[exécuté]` `[lecture]`

| ce que l'élève lit | source lue | même source que la note ? |
|---|---|---|
| « 24 / 30 » d'un critère analytique (PDF, bilan) | `criteres[].points` + `ponderation` de l'entrée (`lectureNiveauCritere`, `_lectureNiveauBilan`) | oui : l'entrée est écrite par les collecteurs depuis `pointsAnalytiques`, la source du calcul |
| « 15 erreurs sur 584 mots → 7.16/20 (35.8 %) » | `donneesAlgorithmiques[id]` (`synthese-retroaction-rendu.js:374`) | oui, mais c'est la mémoire de D-2 : juste tant qu'elle est tarie |
| bandeau du niveau général | `evaluation.niveauFinal` (écran `niveauProduction1` au moment de l'écriture) | oui, avec le repli de B-1 |
| « Note finale : 84.6% » de la rétroaction copiée | `noteProduction1.textContent` (`_rendreNoteFinale`) | oui, arrondi au dixième |
| « Tu fais en moyenne 1 erreur à chaque N mots », `{moyenne}`, `{projection}` | `mots / erreurs` sur le compte **brut** des codes, pas la somme pondérée (documenté #668) | oui, par construction du registre |

F1 : cinq combinaisons holistiques, valeur stockée = écran = liste, sans bruit. Un **jeton inconnu** (`{truc}`) est laissé en place dans un palier de projection (« un élève les lirait tels quels », le gabarit le dit sous le palier) et **retiré** dans les énoncés : deux politiques, toutes deux documentées dans le code. Un **palier sans phrase** rend le préfixe seul (`_resultat`). Une **collection** appliquée à une autre grille est une copie dans le critère (`collections-projection.js`, `appliquerCollection`) : le critère reste la seule source ; aucun lien à casser.

### F-2 · Le bilan lit l'autre emplacement – voir G-2

---

## G · Rouvrir, modifier, réenregistrer – et #646

### G-1 · Réenregistrer sans rien changer – fonctionne – `[exécuté]`

Évaluation à 68,5 (M·D·I) rouverte, `sauvegarderEvaluationModifiee()` : `noteFinale` réécrite **68,5**, identique, verrouillée. #572 tient sur le quatrième site.

### G-2 · #646 mesuré : les deux emplacements divergent après un changement – majeur – `[exécuté]`

**La carte** `[grep]`. `let evaluationEnCours = null` (`js/config.js:173`, script classique : aucune propriété `window`). Le nom nu n'a qu'un écrivain, `evaluation-chargement.js:434` (`chargerEvaluationsEtudiant`) ; `window.evaluationEnCours` en a trois (`evaluation-chargement.js:535`, `evaluation.js:143`, `evaluation.js:1417`). Lectures nu / window par fichier : calcul 66 / 5, chargement 70 / 33, retroaction 25 / 2, sauvegarde 14 / 17, evaluation.js 12 / 39, jetons 2 / 10, handlers 0 / 4. Le **calcul** lit le nu ; `niveauSelectionne` et `pointsSaisis` écrivent le nu ; `_collecterCriteres*` lisent le nu ; l'**auto-save** prend son instantané sur `window` (`_debouncerAutoSave`) ; le **bilan** lit `window` (`genererRetroactionBilan`, `var ec = window.evaluationEnCours`).

**L'état de départ**, lu dans `verifierEtChargerEvaluationExistante` (`evaluation.js:560-760`) : à la réouverture d'une évaluation existante, `window.evaluationEnCours.criteres` est rempli depuis la base, et les selects rejouent `change` → `niveauSelectionne` → le nu. Les deux portent alors les mêmes niveaux. La mesure Playwright du 2 septembre (`tests/integration/evaluation-674-refus-conserve-le-brouillon.spec.js`) a établi que nu ≠ window dans le flux réel.

**Mesuré** (banc : deux objets distincts, tous deux à E·E·I, existante EV1 à 84 ; l'enseignant passe c3 de I à E) :

| mesure | ce qui se passe | résultat |
|---|---|---|
| G2 | `niveauSelectionne('c3')` puis la minuterie de l'auto-save | nu `{E,E,E}`, window `{E,E,I}` ; calcul 95 ; **écrit : `noteFinale 95`, `niveauFinal E`, `criteres[].c3 = I`, `ponderationCouverte 100`, non verrouillé** |
| G3 | même geste, puis la vue « Bilan » | l'écran du calcul dit **E** ; le bilan dit « Présentement, il faut se concentrer sur : **Langue (Insuffisant)** » |
| G4 | témoin : les deux noms désignent le même objet | l'auto-save écrit 95 **et** c3 = E |

**Ce que l'élève lit** si l'enseignant se fie à l'auto-save : un PDF avec le bandeau **E** et, dans la liste des critères, « Langue : Insuffisant » ; et le bilan copié sous « === BILAN === » nomme un défi qu'il a levé. L'enregistrement manuel (qui collecte le nu) rétablit la cohérence.
**Réserve de méthode** : le banc Node reproduit la conséquence d'un état construit d'après la lecture du chemin de réouverture et la mesure Playwright du 2 septembre ; une spec WebKit sur le flux réel scellerait le constat.

**Disposition proposée : corriger maintenant, périmètre borné** : l'instantané de `_debouncerAutoSave` prend les critères et les points **là où ils sont, le nu l'emportant**, exactement comme `_instantanePourBrouillon` le fait déjà pour la porte (`evaluation-calcul.js:994`) ; et le bilan lit la même source. La réunification des deux emplacements, qui est le vrai #646, est un lot à part, avec Playwright : **inscrire**.

### G-3 · Retirer un niveau, changer la grille – couverts

Retirer un niveau après réouverture : refus nommé, l'existante devient brouillon non verrouillé (sentinelle « portes », modification incomplète). Changer la grille puis enregistrer sans choisir : E-3.

---

## H · Les lecteurs aval – et la frontière avec la pratique de notation

### H-1 · `pratiques/` lit `noteFinale` sans portée ni verrou – majeur, frontière – `[exécuté]` `[grep]`

`grep -rc ponderationCouverte js/pratiques/` → **0** ; `grep -c verrouillee js/pratiques/*.js js/portfolio.js js/profil-etudiant-calculs.js js/profil-etudiant-actions.js js/indices.js` → **0**. Les filtres sont partout `!e.remplaceeParId && e.noteFinale !== null` (`pratique-sommative.js:105-109`, `pratique-pan-standards.js:184-190`, `pratique-configurable.js:446-448`), et `evaluation.noteFinale >= seuil` pour PAN-Spécifications (`:689`). La note provisoire du PDF de l'élève (`synthese-retroaction-data.js:1224`) filtre de la même façon.

**Mesuré** (Sommative chargée sur `pratique-registre.js`, productions 40 / 60) :

| mesure | jeu d'évaluations | indice P |
|---|---|---|
| H1 | 84 (portée 100, verrouillée) + **brouillon 95 sur 80 %, non verrouillé** | **0,906** : le brouillon compte 95 |
| H2 | 84 + **`0` de portée 0** (évaluation vide, ou A-1) | **0,336** : le zéro compte |
| H3 | 84 + `noteFinale: null` | 0,84 : ignoré |
| H4 | PAN-Standards et PAN-Spécifications se chargent ; STD rend `null` sans sa configuration, SPE rend 0,5 sur le même jeu | non interprétable sans la configuration de la pratique : leurs filtres restent `[lecture]` |

**Les champs neufs, un par un** : `ponderationCouverte` est ignorée, **avec dommage** : « 95 sur 80 % » entre à 95, c'est le défaut de #674 qui survit en aval de l'écran ; `verrouillee` est ignorée : un brouillon d'auto-save compte comme une note remise ; `pointsAnalytiques`, `points`, le niveau déduit : sans effet, les pratiques ne lisent que `noteFinale` et `niveauFinal` ; le critère SOLO « Aucun » : sans effet, il n'entre pas dans `noteFinale`. DEN lit ses propres jugements (`saisie.noteFinale`, `denotation-jugements.js:121`) : hors de cette chaîne.

**Disposition proposée : inscrire et continuer**, comme première question du second audit (`Rapports/prompts-audit/PROMPT-AUDIT-pratique-de-notation-2026-09-05.md`, déposé à 14 h 16). La règle « un brouillon, ou une note de portée incomplète, compte-t-il dans la note du cours ? » est pédagogique ; la mécanique (filtrer sur `verrouillee` ou sur `ponderationCouverte < ponderationGrille`) attend cette règle.

---

## Ce qui fonctionne, avec la preuve

- **La boucle de `calculerNote()`** somme ce que `calculerPortee` retient et rien d'autre ; 84 pour E·E·I sur 50/30/20 (A3, sentinelle #674 A) ; 79,625 pour une grille à 80 (E1).
- **La valeur calculée est la source** sur les quatre sites (#572) : réenregistrer sans changement rend 68,5 exactement (G1) ; `grep -rn "parseFloat(.*noteProduction1" js/` rend zéro (sentinelle #572).
- **La portée voyage avec la note** sur les quatre chemins (`grep -rn ponderationCouverte js/evaluation*.js` : 4 écritures) et la porte refuse l'incomplet (sentinelle « les portes refusent l'incomplet »).
- **Les points analytiques** valent leur pourcentage, le niveau se déduit par les bornes, l'entrée porte `points` (C3 : 82,8 et M ; sentinelles lot 2 et lot 3).
- **Le recalcul algorithmique avant sauvegarde** est appelé par les deux enregistrements manuels, avant la porte (`evaluation-sauvegarde.js:415-421`, `evaluation.js:2008-2013`).
- **Les codes des sous-critères** s'apparient (chaîne contre chaîne) et la somme pondérée est juste (D2 : 2,5).
- **Les nombres du PDF, du bilan et de la rétroaction** viennent de ce que le calcul a écrit (F-1).
- **Le niveau SOLO** n'entre pas dans la note (`grep -c niveauSOLO js/evaluation-calcul.js` → 0).
- **Une valeur ponctuelle de zéro** n'est pas un « absent » (#525/#527, règle unique `valeurNumeriqueDuNiveau`) ; le repli milieu-de-plage de `calculerNote` reste mort tant que `echelles.js` est chargé (su, inscrit).
- **`collections-projection.js`** copie dans le critère et ne laisse aucun lien : corriger une collection ne touche aucune évaluation (lecture ; cohérent avec la décision « la copie »).

## Ce que je n'ai pas regardé

- **Le navigateur.** Aucune spec Playwright n'a tourné. Les mesures A1, A2, A5, B5, D4, G2, G3 reproduisent la chaîne dans un faux DOM ; la garde #671 (identité du panneau), les minuteries de `preRemplirEvaluation`, le rejeu réel des `change` à la réouverture et l'ordre `demarrerEvaluationDepuisFichier` → `chargerEvaluationsEtudiant` n'ont pas été éprouvés. G-2 en dépend pour son état de départ (réserve dite).
- **Les données réelles de Grégoire** (interdit par le prompt) : le facteur 600 sur *Grille-1 FR-ALGO seul A26* ; la présence, dans son stock, d'évaluations `noteFinale 0 / ponderationCouverte null / niveauFinal '--'` (le fossile de A-1) ; A2025 et H2026, non sondées.
- **Les échelles de pratique** (`pratique-<id>`, `config.echelle.niveaux`) : la même branche que les échelles classiques dans `calculerNote`, non exécutée.
- **Le plafond de reprise ciblée** (`plafondNoteCiblee`), **les jetons** (`evaluation-jetons.js`, 10 lectures de `window.evaluationEnCours`), **le statut d'intégrité « 0 »** (non recevable) et `changerStatutIntegrite` / `changerEchelleEvaluation`.
- **`modifierEvaluation` depuis la liste** (`evaluation.js:1184`, `_initEvaluationEnCoursPourModif`) : seul `sauvegarderEvaluationModifiee` a été exécuté ; le chemin d'ouverture est lu, pas rejoué.
- **Le décompte des codes d'annotation** vers `eval_erreurs_` (`travaux-outils.js`, `mettreAJourCompteursErreurs`, `compterErreursFrancais`) : lu, non exécuté (la troisième entrée de D-2).
- **`composeur-badges.js`** (500 lignes) : c'est l'éditeur visuel des jetons dans un `textarea` ; il ne calcule aucun nombre. Lu en surface, non exécuté.
- **Le rendu du PDF** au-delà de `libelleNiveau`, `lectureNiveauCritere`, `construireOverall`, `construirePortee` et la ligne algorithmique : audité le 25 août.
- **L'import et l'export d'une grille ou d'une pratique** (`echelleId` non remappé : su depuis juin, non remesuré) ; **un trimestre archivé** (le cas est nommé dans un commentaire de `calculerNote`, non rejoué) ; **le mécanisme de #648** (lu au changelog).
- **PAN-Standards, PAN-Spécifications, DEN** au-delà de leur chargement et de leurs filtres (H4) : c'est le second audit.
- **`_traiterPostRepriseMod` et la reprise** (jeton de reprise, `remplaceeParId`) : lecture seule.

## Rien d'appliqué

Aucun fichier de `js/` n'est modifié. La branche `audit/moteur-evaluation-2026-09-05` porte ce rapport et le banc `tests/unit/audit-moteur-evaluation-2026-09-05.test.js` ; `main` n'a pas été touché. Le prompt passe à `statut : exécuté` et `OU-EN-EST-ON.md` reçoit une ligne sous « L'ÉVALUATION », dans l'arbre principal, avec les fichiers de Cowork. Les dispositions ci-dessus sont des propositions : Grégoire arbitre avant tout lot, et chaque constat recevra alors, dans ce fichier, *inscrit* (n°), *refusé* (motif) ou *périmé*.
