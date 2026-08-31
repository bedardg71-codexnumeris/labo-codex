# Audit ciblé Z3 — le legacy vivant des quatre sections

**Date** : 30 août 2026, soirée. **Session** : `kuekatsheu-bc`. **Item** : #621 (S3 du plan Conception).
**Source des constats amont** : `Rapports/AUDIT-modele-objets-conception-2026-08-30.md` §3-Z3 (constats S4, S5, S9).
**Nature** : lecture de code et analyse d'atteignabilité. **Aucune exécution dans un navigateur.**
**Écritures** : aucune. Aucun fichier `js/`, `index.html` ou `tests/` n'a été modifié.

---

## 1. Synthèse — la prémisse du plan est fausse, et il faut le dire avant S10

Le plan et l'audit parent traitent les stubs cachés des quatre sections comme du **legacy inerte à
retirer en bloc**. La mesure dit le contraire.

> **Les 26 identifiants des quatre blocs de stubs sont lus par du code ATTEIGNABLE. Aucun bloc n'est mort.**

Ce ne sont pas des vestiges. Ce sont deux choses, et il faut les distinguer parce qu'elles ne se
retirent pas de la même façon :

| Famille | Ce que c'est | Comment ça se retire |
|---|---|---|
| **A — le DOM tenu lieu de variable** | Du code vivant écrit puis relit `.value` sur un `<div>` vide et caché. L'état vit dans le DOM. | **Relocaliser l'état dans une vraie variable de module D'ABORD.** Un retrait direct casse la section, silencieusement. |
| **B — l'ombrage d'identifiant** | Un identifiant existe DEUX fois dans `index.html` : le stub caché, puis le vrai champ. `getElementById` rend le premier. Le code lit le stub et croit lire le champ. | **Retirer le stub RÉPARE le code** — c'est le seul cas où la suppression est le correctif. |

⚠ **Un constat de la famille B écrit en base.** Voir §2.1. C'est le seul BLOQUANT de cet audit.

**Ce qui est confirmé retirable sans risque**, en revanche, et c'est mesuré : le bloc mort de
`identifierTemplatesUtilises` (#630 rend `apportDuBlocMortEchelles: 0` sur les trois trimestres, et
`tailleCleNueGrillesTemplates: 0` — la clé globale nue est vide), et **cinq fonctions sans aucun appelant**
(§2.4).

---

## 2. Constats

### 2.1 BLOQUANT — deux identifiants en double : le code lit un `<div>` vide et sauvegarde le résultat

**Certitude : VÉRIFIÉ** (statique ; l'effet à l'écran reste à observer — voir §5).

`index.html` porte **deux fois** `typeEchelle` et **deux fois** `seuilReussite` :

```
5130:   <div id="typeEchelle"></div>            <-- stub caché, bloc « compatibilité »
5131:   <div id="seuilReussite"></div>          <-- idem
...
5194:   <select id="typeEchelle" class="controle-form" data-on-change="changerTypeEchelle">
5202:   <input type="number" id="seuilReussite" class="controle-form" value="60" min="0"
```

`document.getElementById` rend **le premier élément du document** portant l'identifiant, donc **le div
caché**, jamais le champ réel. Or `sauvegarderConfigEchelle` (`echelles.js:1044-1053`) lit ces
identifiants **sans garde de nullité** et écrit le résultat :

```js
async function sauvegarderConfigEchelle() {
    const config = {
        typeEchelle: document.getElementById('typeEchelle').value,          // <div> -> undefined
        seuilReussite: parseInt(document.getElementById('seuilReussite').value) || 60,
        notePassage: document.getElementById('notePassage')?.value || '',
        codesPersonnalises: document.getElementById('codesPersonnalises')?.value || ''
    };
    await db.set('configEchelle',  config);
}
```

**Scénario de défaillance concret.** Grégoire modifie le seuil de réussite dans le champ réel
(`index.html:5202`). L'attribut `data-on-change="sauvegarderConfigEchelle"` (`index.html:5203`, et
`:5223` pour les codes) déclenche la sauvegarde. La fonction lit le `<div>` vide : `.value` vaut
`undefined`. Elle écrit donc en base `typeEchelle: undefined` et `seuilReussite: 60` — **la valeur
saisie n'est jamais lue, et 60 est une valeur métier en dur qui s'écrit silencieusement**. La clé
`configEchelle` est relue en `echelles.js:902` et `:1000`.

⮕ Trois défauts en une fonction : l'ombrage, l'absence de garde sur deux des quatre lectures (les deux
autres ont bien `?.`), et un repli métier arbitraire.
⮕ `changerTypeEchelle` (`echelles.js:1074`) et `chargerConfigurationEchelle` (`:1003`, `:1009`) lisent les
mêmes identifiants ombrés.

### 2.2 SÉRIEUX — le DOM tenu lieu de variable, dans deux sections

**Certitude : VÉRIFIÉ.**

`#selectGrilleTemplate` (`index.html:4986`) et `#selectEchelleTemplate` (`index.html:5128`) sont des
`<div>` **vides et cachés**. Du code atteignable y écrit une propriété expando `.value`, puis la relit :

| Élément | Écritures | Lectures |
|---|---|---|
| `selectGrilleTemplate` | `grilles.js:745, 902, 1040, 1354, 1404` | `grilles.js:146` (+ garde `:105`) |
| `selectEchelleTemplate` | `echelles.js:850, 928` | `echelles.js:668, 700` |

**L'état dupliqué existe déjà en variable de module** — `grilleTemplateActuelle` et
`echelleTemplateActuelle`, dans les mêmes fichiers. Il y a donc **deux sources de vérité pour la même
chose**, dont une est un div caché.

**Scénario de défaillance.** Un retrait du bloc HTML sans relocalisation préalable fait tomber toutes
les écritures dans leur garde `if (select)` — silencieusement — et la lecture de `grilles.js:146` rend
alors la valeur de repli. Vitest ne voit rien : il tourne dans `node`, sans DOM.

⮕ **Défaut latent, certitude INFÉRÉE, non corrigé** (refactor en cours, règle du projet) : la première
lecture de `grilles.js:146` porte sur un div qui n'a pas encore reçu son expando ; elle rend donc
`undefined`, pas `''`. `const selectValue = grilleId || (select ? select.value : '')` produit
`undefined` là où la lecture d'un vrai `<select>` vide aurait produit `''`.

### 2.3 SÉRIEUX — sept écritures d'affichage dans des éléments que personne ne regarde

**Certitude : VÉRIFIÉ pour les écritures ; INFÉRÉ pour « personne ne les lit ».**

Bloc productions (`index.html:4800-4808`), tous dans `<div class="u-hide">` :

| Identifiant | Sites | Nature |
|---|---|---|
| `nombreEvaluations` | `productions.js:266, 333` | ÉCRIT |
| `ponderationTotale` | `productions.js:2574` | ÉCRIT |
| `typesEvaluations` | `productions.js:264, 2618` | ÉCRIT |
| `statutPonderation` | `productions.js:2576` | LU — d'un élément que rien n'écrit |
| `champsPortfolio` | `productions.js:2366` | LU |
| `vueProductionsParType` | `productions.js:2697` | LU |
| `tableauEvaluationsContainer` | `productions.js:260` | LU |

Les fonctions porteuses sont toutes atteignables (`afficherTableauProductions`,
`mettreAJourPonderationTotale`, `mettreAJourResumeTypes`, `gererChangementTypeProduction`,
`afficherToutesLesProductionsParType`). Le travail est réellement fait à chaque affichage ; son
résultat est écrit dans des éléments cachés.

⮕ `statutPonderation` est **lu sans jamais être écrit** : la lecture rend toujours le contenu vide.
C'est la famille « clé lue, jamais écrite » — la garde qui en dépend est toujours vraie.

### 2.4 MINEUR — cinq fonctions exportées sur `window` que rien n'appelle

**Certitude : VÉRIFIÉ.** Aucun `data-action` (ni dans `index.html`, ni dans le HTML généré par le JS),
aucun appel interne, aucun appel depuis un autre fichier.

| Fonction | Fichier | Note |
|---|---|---|
| `ajouterCritereAGrille` | `grilles.js` (export `:2037`) | son bouton est généré en `grilles.js:1321`, **dans une fonction elle-même morte** |
| `retourVueHierarchique` | `grilles.js` (export `:2038`) | — |
| `ajouterNiveauAEchelle` | `echelles.js` | seul lecteur de `selectEchelleTemplate:354` et `tableauNiveaux:361` |
| `afficherApercuCartoucheSelectionnee` | `export-pdf.js:1466` | lit les stubs `selectGrilleRetroaction` / `selectCartouche` |
| `ouvrirModalExportPDFDepuisCartouche` | `export-pdf.js:2703` | idem |
| `afficherFormulairePDFDepuisCartouche` | `export-pdf.js:3314` | idem |

⚠ **`export-pdf.js` n'est PAS dans le périmètre Z3 défini par l'audit parent.** Il faut l'y ajouter :
ces trois fonctions sont la seule raison pour laquelle les stubs `selectGrilleRetroaction` et
`selectCartouche` paraissaient vivants côté export.

⮕ Le quatrième lecteur, `exporterCartoucheSelectionneeEnPDF` (`export-pdf.js:1325`), est **atteint**
(bouton `index.html:5374`, démasqué par `cartouches.js:1755`) — mais il lit le stub **en repli**, après
la source moderne `window.cartoucheActuel`, et le repli aboutit toujours à un message d'erreur.
Fail-closed, sans danger.

### 2.5 Ce qui est solide

- **Le bloc mort de `identifierTemplatesUtilises` est confirmé mort, sur données réelles** : #630 rend
  `apportDuBlocMortEchelles: 0` sur les trois trimestres et `tailleCleNueGrillesTemplates: 0`. Le témoin
  du diagnostic (ce compteur passe à 1 si la clé nue est repeuplée) rend ce zéro interprétable.
- **`cartouches.js` ne présente aucun ombrage** : ses trois identifiants (`selectGrilleRetroaction`,
  `selectCartouche`, `aucuneEvalRetroaction`) n'existent qu'une fois dans `index.html`. Les douze sites
  sont des lectures, dans des fonctions atteignables — famille A, pas B.
- Le chemin moderne d'évaluation ignore explicitement l'ancien système (`evaluation-calcul.js:520/715`).

---

## 3. Correctifs proposés — NON APPLIQUÉS, et dans cet ordre

### D1 — Retirer les deux identifiants en double (répare 2.1)

**Ce qu'il RETIRE** : les lignes `index.html:5130` et `:5131` (`<div id="typeEchelle">`,
`<div id="seuilReussite">`), et rien d'autre. Les vrais champs `:5194` et `:5202` deviennent alors les
seuls porteurs de ces identifiants, et `getElementById` les atteint.

**Ce qu'il faut ajouter dans le même geste** : la garde de nullité manquante sur les deux premières
lectures de `sauvegarderConfigEchelle`, et le retrait du repli `|| 60` — une valeur métier en dur n'a
pas sa place là (règle du projet). Si le champ est vide, la fonction doit le DIRE, pas inventer 60.

**Sentinelle exigée** : un cas qui monte les deux éléments dans l'ordre du document et vérifie que
`sauvegarderConfigEchelle` écrit la valeur du CHAMP. **Break-test** : remettre le div en tête → ROUGE.
⚠ Vitest ne voit pas le DOM d'`index.html` : cette sentinelle doit être **Playwright/WebKit**, ou un
banc jsdom qui reproduit l'ordre du document.

### D2 — Relocaliser l'état des deux expandos (préalable à tout retrait, 2.2)

**Ce qu'il RETIRE** : les cinq écritures et la lecture de `selectGrilleTemplate` dans `grilles.js`, les
deux écritures et deux lectures de `selectEchelleTemplate` dans `echelles.js`, puis les deux `<div>`.

**Ce qu'il met à la place** : rien de neuf — `grilleTemplateActuelle` et `echelleTemplateActuelle`
existent déjà et portent la même information. Le travail est de vérifier, site par site, que les deux
sources ne divergent jamais, puis de supprimer la seconde.

⚠ **À faire AVANT le retrait du bloc HTML, jamais en même temps.** Deux gestes, deux commits.

### D3 — Retirer les cinq fonctions sans appelant (2.4)

**Ce qu'il RETIRE** : les six fonctions listées au §2.4, leurs exports `window`, et le bouton généré en
`grilles.js:1321`. Suppression **fonction par fonction**, jamais par plage `sed`, bloc JSDoc compris.

### D4 — Trancher le sort des sept écritures d'affichage (2.3)

Deux options, et c'est un arbitrage de Grégoire, pas une évidence :
· **A** — retirer les écritures ET les éléments : le travail cesse d'être fait pour rien.
· **B** — les rendre visibles : si ces compteurs ont une valeur pour lui, ils existent déjà.
⮕ `statutPonderation`, lu sans jamais être écrit, se retire dans les deux cas.

---

## 4. Ce que cet audit change au plan

| Élément du plan | Avant | Après cet audit |
|---|---|---|
| **S10 — « retrait du legacy des quatre sections »** | retrait en bloc après le test de neutralisation Z3 | **le retrait en bloc est impossible tel quel.** Séquence D1 → D2 → D3 → D4, et D2 est un refactor, pas une suppression |
| **D4 (décision de Grégoire, option A)** | « retrait complet, après le test de neutralisation » | **la décision reste valable, sa condition change** : ce n'est pas le test de neutralisation qui l'autorise, c'est la relocalisation de l'état (D2) |
| **Périmètre Z3** | `index.html`, `echelles.js`, `grilles.js`, `productions.js`, `cartouches.js`, `pratiques*.js` | **ajouter `export-pdf.js`** (trois fonctions mortes lisant les stubs) |
| **T3.1 — test de neutralisation** | préalable au retrait | **devenu secondaire.** Il répond à « qu'est-ce qui casse si on éteint le moteur » ; la vraie question était « quel état vit dans ces div », et elle se répond statiquement |

---

## 5. Angles morts — ce que cette lecture n'établit pas

1. **L'effet de 2.1 à l'écran.** Le code écrit `typeEchelle: undefined` ; reste à observer si l'écran de
   configuration d'échelle paraît fonctionner malgré tout. À vérifier sur Mac ET iPad. Observé : ______
2. **Qui lit `configEchelle` en pratique.** Deux lecteurs statiques (`echelles.js:902`, `:1000`) ; leur
   atteignabilité réelle depuis l'interface moderne n'est pas établie. Observé : ______
3. **Les sept écritures d'affichage (2.3)** : « personne ne les lit » est INFÉRÉ d'un grep. Un lecteur
   par `querySelector` sur une classe, ou un test Playwright, échapperait à la mesure.
4. **Ma méthode d'atteignabilité surestime.** Toute occurrence d'un nom comme chaîne dans un autre
   fichier compte comme racine. Conséquence : **un « MORT » est fiable, un « VIVANT » peut être
   généreux.** C'est le sens d'erreur qu'on veut pour décider d'un retrait, mais il faut le savoir.
5. **Le bloc rétroactions n'a pas été passé au crible de l'ombrage** dans les autres fichiers que
   `cartouches.js` et `export-pdf.js`.
6. Aucune exécution navigateur. Vitest ne verrait rien de tout ceci : il tourne dans `node`.
