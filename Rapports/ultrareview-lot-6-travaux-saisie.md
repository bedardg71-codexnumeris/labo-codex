# Rapport `/ultrareview` — Lot 6 (Travaux et saisie de présences)

**PR auditée** : [#9](https://github.com/bedardg71-codexnumeris/Monitorage_v6/pull/9) — branche `review/lot-6-travaux-saisie`
**Date** : 1er mai 2026
**Lignes auditées** : ~19 490 sur 6 modules (`travaux-ui.js`, `travaux-annotation.js`, `travaux-preparation.js`, `travaux-outils.js`, `travaux-visionneuse.js`, `saisie-presences.js`)
**Statut du run** : ✅ **Pipeline complet sans crash** (1ère fois sur un gros lot >15k lignes).

**Pipeline observé** :
- ✅ Configuration
- ✅ Rechercher — 27 candidats
- ✅ Vérifier — **14 confirmés · 13 réfutés** (taux de réfutation 48 %)
- ✅ Déduplication — 14 → 10 (4 doublons fusionnés proprement)

**Distribution** : `saisie-presences.js` (5 findings) + `travaux-visionneuse.js` (5 findings). Aucun finding sur `travaux-ui.js`, `travaux-annotation.js`, `travaux-preparation.js`, `travaux-outils.js`.

---

## 🔴 Normal — bugs avec impact data ou sécurité (7)

### N1 — `obtenirHeuresSeance` : fallback wipe l'accumulateur

**Fichier** : `js/saisie-presences.js:336-341`

Branche unknown-format utilise `=` au lieu de `+=` :
```js
totalHeures = formatHoraire === '1x4' ? 4 : 2;  // ❌ wipe
```
Sur un jour multi-séances avec une séance de format inconnu, le total accumulé est silencieusement écrasé. Pire : *order-dependent* — si la séance inconnue est la dernière, tout est perdu ; si elle est première, les `+=` suivants surcomptent.

**Fix** : `totalHeures += formatHoraire === '1x4' ? 4 : 2;`

---

### N2 — `obtenirNombrePeriodesSeance` underreporte les jours multi-séances

**Fichier** : `js/saisie-presences.js:405-435`

La fonction retourne uniquement `seancesDuJour[0].nombrePeriodes` au lieu d'agréger. Or `obtenirDureeMaxSeance()` cap chaque séance à 2 périodes — un horaire 1x4 est donc forcément stocké en 2+ séances. Le sibling `obtenirHeuresSeance` agrège correctement avec `forEach`.

**Manifestation** : un jour 1x4 (4 périodes en 2 séances de 2) → l'input rendu a `max="2"`, le bouton « Tous N pér. » cape à 2, l'utilisateur ne peut pas saisir les 4 périodes. **Pollue l'indice d'assiduité** par sous-comptage.

**Fix** :
```js
return seancesDuJour.reduce((acc, s) => {
    if (s.nombrePeriodes) return acc + s.nombrePeriodes;
    if (s.duree) return acc + Math.round((s.duree * 60) / dureePeriode);
    return acc;
}, 0) || 2;
```

Note secondaire (nit) : `seancesCompletes[dateStr]` lit sans null guard, contrairement aux call sites siblings (`obtenirToutesDatesCours:207`, `calculerNombreSeances:371`).

---

### N3 — `appliquerCodeCouleurPeriodes` perd la classe `saisie-absence-motivee`

**Fichier** : `js/saisie-presences.js:1116-1133`

La fonction de mise à jour live des couleurs strip toutes les classes d'état et ne re-ajoute jamais `saisie-absence-motivee` (jaune R∂I) — elle n'a pas accès au flag `estFacultatif`.

**Asymétrie révélatrice** : le helper de rendu initial `obtenirClasseSaisiePeriodes(periodes, max, estFacultatif)` accepte le flag (depuis `chargerTableauPresences` qui lit `presenceExistante.facultatif === true`). Mais `appliquerCodeCouleurPeriodes` n'a aucun moyen de le retrouver lors d'éditions live.

**Manifestation** : étudiant avec absence motivée saved (`facultatif: true`, jaune) → enseignant édite la cellule → couleur passe au rouge silencieusement. Données préservées (le flag est restauré au save), mais le signal visuel R∂I est perdu.

**Fix** : persister `data-facultatif` sur l'input à l'init et le lire dans la fonction de mise à jour. Même fix nécessaire pour `appliquerCodeCouleurSaisie` (path heures legacy).

---

### N4 — `etudiants` peut être null → crash `.sort/.filter`

**Fichier** : `js/saisie-presences.js:611-625`

`chargerTableauPresences:912` et `enregistrerPresences:1252` calculent `etudiants = obtenirEtudiantsCoursActif() ?? obtenirDonneesSelonMode('groupeEtudiants')` sans `|| []` fallback. Le 3e sibling `sauvegarderPresencesSansValidation:616` a déjà ce guard.

**Trigger** : install fraîche, calendrier configuré, mais aucun étudiant pour le cours actif → click sur Saisie → **TypeError: Cannot read properties of null (reading 'sort')**, tab cassé.

**Preuve par cohérence** : 3 sites distincts dans le code défendent contre le même null (l. 114 même fichier, l. 5322 travaux-ui.js, l. 616) — c'est l'invariant codé. Les 2 sites sans guard sont des oublis.

**Fix** : `etudiants = etudiants || [];` à chaque site.

---

### N5 — `modifierNotesPresence` ignore `coursId` → fuite cross-cours

**Fichier** : `js/saisie-presences.js:1909-1936`

`window.modifierNotesPresence(da, date, notes)` matche sur `(da, date)` seulement, ignorant `coursId`. Tous les autres writers (`enregistrerPresences`, `sauvegarderPresencesSansValidation`, `ajouterPresencesIntervention`) filtrent par `coursId`.

**Manifestation** : étudiant DA1 enrôlé dans cours A et B, même jour 2026-04-30 → enseignant ouvre le profil sur cours B et tape une note → le loop hit `presences[0]` (cours A) en premier → la note finit sur cours A. **Fuite de notes confidentielles entre cours.**

**Fix** : accepter (ou lire via `obtenirCoursActifId()`) un paramètre `coursId` et l'inclure dans la condition de match.

---

### N6 — XSS via motif de congé

**Fichier** : `js/saisie-presences.js:1610-1628` (sink ligne 1801)

`afficherMessageCompteurPresences()` interpole `${message}` dans `compteur.innerHTML` sans échappement. Sur la branche `'conge'`, `message = validation.motif + ' — pas de cours'` où `motif` vient de `infoJour.motif` (texte libre saisi par l'utilisateur en config calendrier).

**Manifestation** : motif `<img src=x onerror=alert(1)>` → exécution de script à chaque navigation sur cette date.

Le PR description l'exigeait explicitement (« echapperHtml() sur TOUS les innerHTML »). Le même fichier l. 1013-1021 utilise déjà `echapperHtml()` correctement — c'est une omission.

**Fix** : `${echapperHtml(message)}`.

---

### N7 — Boutons prev/next page de la vue côte-à-côte cassés (ID mismatch)

**Fichier** : `js/travaux-visionneuse.js:437-460` + `js/travaux-ui.js:5014-5016`

`mettreAJourNavigation()` query `travaux-btn-page-prec` / `travaux-btn-page-suiv` (toolbar standard). Le template split-view utilise `travaux-split-btn-page-prec` / `travaux-split-btn-page-suiv` avec `disabled` hardcodé dans le HTML.

**Manifestation** : ouverture d'un PDF multi-pages en vue côte-à-côte → boutons `disabled` à perpétuité. **Navigation impossible via la toolbar split**. (Les raccourcis clavier marchent peut-être, mais l'UI principale ne fonctionne pas.)

**Fix** : faire `mettreAJourNavigation()` query les deux paires d'IDs, OU normaliser sur des classes CSS, OU réutiliser les IDs standard dans le template split.

---

## 🟡 Nit — défense en profondeur (3)

### nit1 — `zoomAvecRecentrage` ignore la marge du wrapper

**Fichier** : `js/travaux-visionneuse.js:480-497`

Calcule la nouvelle position scroll en `cX * ratio - clientWidth/2`, ignorant la marge CSS fixe du wrapper. Les 2 autres paths zoom (`finaliserPinchZoom`, `onWheelZoom`) utilisent correctement `(contentX - margin.left) * ratio + margin.left - viewX` via `getMarginWrapper()`.

**Manifestation** : sur clics +/- de la toolbar (qui passent par `zoomAvecRecentrage`), drift du focal point de `margin × (ratio - 1)` par clic. Sur 10 clics zoom avant à 1.1×, drift cumulé ~100px. Pinch et wheel zoom sont corrects.

Auto-correctible via « Ajuster à la fenêtre » (`zoomAjuster` recentre).

**Fix** : appliquer la formule margin-aware comme les 2 autres paths.

---

### nit2 — `ouvrirPDF` sans try/catch

**Fichier** : `js/travaux-visionneuse.js:117-132`

Le `await pdfjsLib.getDocument(...).promise` peut rejeter (PDF corrompu/chiffré, worker non chargé). Aucun catch → la rejection propage, skip `mettreAJourNavigation()` / `recentrerVue()`. Mais `ouvrirFichier` a déjà mis `pdfDocument = null`, `cachePages.clear()`, `fichierActuel = nouveau` AVANT l'await → état incohérent (claim un fichier ouvert avec `pdfDocument === null`, sans erreur visible).

**Asymétrie** : `ouvrirImage` enveloppe correctement et appelle `afficherErreur('Erreur chargement image')` sur `img.onerror`.

**Fix** : try/catch dans `ouvrirPDF`, reset `fichierActuel = null` et `afficherErreur('Erreur ouverture PDF')` sur catch.

---

### nit3 — `ouvrirDepuisBlob` et `fermerFichier` manquent `pdfDocument.cleanup()`

**Fichier** : `js/travaux-visionneuse.js:1014-1031` + `:1081-1096`

Le 5 mars 2026, un fix avait été ajouté à `ouvrirFichier` : `pdfDocument.cleanup()` + `cachePages.clear()` avant chargement nouveau document. Les 2 siblings ont été oubliés.

**Manifestation** :
- `ouvrirDepuisBlob` (utilisé par module Modélisation pour switch documents) : leak du `PDFDocumentProxy` côté worker. **Plus grave** : `cachePages` est keyed par `numPage` seulement — switch A→B au même `zoomEffectif` peut afficher la page de A à la place de B (cache hit sur mauvaise document).
- `fermerFichier` : worker-side document jamais `destroy()`. Sessions longues accumulent.

**Fix** : appliquer le même pattern que `ouvrirFichier`. Pour `fermerFichier`, `destroy()` est plus approprié que `cleanup()` (full release).

---

## ⚠️ Finding visible en phase Vérifier mais absent du JSON post-déduplication

> `obtenirClasseSaisiePeriodes uses parseInt while step=0.5 allows fractions` — `js/saisie-presences.js:1100`

Confirmé en phase Vérifier (14 confirmés / 13 réfutés visible sur la web UI), mais absent du rapport JSON post-déduplication. La dédup a peut-être fusionné ce finding avec un autre sur la même fonction, ou bug de dédup.

**Mécanique probable** : l'input `step="0.5"` accepte les fractions (0.5, 1.5 périodes), mais `parseInt(input.value)` tronque les décimales avant de calculer la classe couleur. Bug mineur (mauvais code couleur si valeur fractionnaire) mais réel à investiguer manuellement.

---

## Patterns récurrents identifiés

1. **Asymétries internes au module** (typique de refactorings partiels) :
   - N1 : un branch utilise `=`, deux autres utilisent `+=`
   - N4 : 1 sibling a le guard, 2 ne l'ont pas
   - nit1 : 2 paths zoom corrects, 1 oublié
   - nit3 : 1 path cleanup, 2 oubliés
   - nit2 : `ouvrirImage` géré, `ouvrirPDF` non

2. **Données par groupe-cours non propagées** : N5 (même nature que les fixes Phase 1 N1 — échéance par groupe).

3. **XSS via données utilisateur dans innerHTML** : N6 (même nature que les fixes Phase 3 — codex name, thumbnails, versement).

---

## Plan de remédiation suggéré

| Phase | Findings | Effort | Stratégie |
|---|---|---|---|
| 1 — Bugs élève (visibles dans l'UI) | N3, N7, N1, N2 | 2h30 | Fixes ciblés. N3 nécessite ajout de `data-facultatif`. N7 : option « class CSS » (la moins invasive). |
| 2 — Données / fuites | N4, N5 | 1h | Ajout de guards, propagation `coursId`. |
| 3 — Sécurité XSS | N6 | 15min | Un seul `echapperHtml()`. |
| 4 — Défense en profondeur | nit1, nit2, nit3 + finding manquant | 1h30 | Symétrisation des paths zoom/cleanup, try/catch ouvrirPDF, parseInt → parseFloat dans `obtenirClasseSaisiePeriodes`. |

**Effort total estimé** : ~5 heures.

---

## Dispositions — remesurées le 5 septembre 2026 (audit de l'onglet Suivi)

> Écrites par l'audit `Rapports/AUDIT-onglet-suivi-2026-09-05.md` (flux A), sur `7d335a16` (1.122.1), au banc
> `tests/unit/audit-onglet-suivi-2026-09-05.test.js` (mesure A5) et par `grep` sur le source. Une disposition est
> *périmé — corrigé* (le défaut n'est plus là, preuve à côté), *tenu → à inscrire* (encore là), *refusé* (motif),
> ou *hors périmètre* (fichier que cet audit ne couvre pas : la visionneuse est l'onglet Travaux).
> Les corrections ne portent pas de numéro de fiche : elles ont été livrées avec #538 et #540 (26 août 2026)
> et le Tier 6.4 (avril 2026), avant qu'on tienne ce registre.

| # | Constat du 1er mai | Disposition | Preuve, 5 septembre 2026 |
|---|---|---|---|
| N1 | `obtenirHeuresSeance` : `=` qui écrasait l'accumulateur | **périmé — corrigé** (#538) | `[grep]` le corps de la fonction, commentaires retirés : **0** affectation `totalHeures =`, **2** `+=` ; la branche « format inconnu » n'ajoute plus rien (le commentaire l. 435+ dit pourquoi). |
| N2 | `obtenirNombrePeriodesSeance` sous-compte les jours multi-séances | **périmé — corrigé** (#538, #540 E2) | `[exécuté]` un jour à deux séances de 2 périodes rend **4** (`reduce` sur `nombrePeriodes`, `saisie-presences.js:591-595`). |
| N3 | `appliquerCodeCouleurPeriodes` perd `saisie-absence-motivee` | **périmé — corrigé** | `[exécuté]` `dataset.facultatif === 'true'` lu (`:1326`), posé au rendu (`:1208`) ; sur `0` la classe rendue est `saisie-absence-motivee`. |
| N4 | `etudiants` nul → crash `.sort/.filter` | **périmé — corrigé** (99.30) | `[grep]` `etudiants = etudiants \|\| [];` → **2** (`:1111`, `:1462`) ; le troisième site garde son `if (!etudiants …) return` (`:795`). |
| N5 | `modifierNotesPresence` ignore `coursId` | **périmé — corrigé** (Tier 6.4) | `[exécuté]` deux fiches, même DA, même date, GC2 puis GC1 : seule celle du cours actif est modifiée (`:2121-2147`). ⚠ Une fiche legacy SANS `coursId` reste appariée par n'importe quel cours (`!p.coursId` dans `matchCoursId`) — voulu pour la migration progressive, dit ici. |
| N6 | XSS via motif de congé | **périmé — corrigé** | `[grep]` `compteur.innerHTML` interpole `${echapperHtml(message)}` (`:1997-2001`), le commentaire nomme la raison. |
| N7 | boutons prev/next de la vue côte-à-côte | **hors périmètre** (visionneuse, onglet Travaux) | non remesuré ici. |
| nit1-3 | zoom, `ouvrirPDF`, `cleanup()` | **hors périmètre** (visionneuse) | non remesurés ici. |
| finding hors JSON | `obtenirClasseSaisiePeriodes` : `parseInt` avec `step=0.5` | **tenu, mineur → commenter et oublier** (ou une ligne si un lot touche le fichier) | `[exécuté]` `obtenirClasseSaisiePeriodes(0.5, 2)` → `saisie-absence` au rendu initial ; `appliquerCodeCouleurPeriodes` sur `0.5` → `saisie-retard` à l'édition. La même demi-période, deux couleurs selon le moment. |

**Ce que la remesure ajoute au-delà du rapport de mai** (constats A-2, A-5 de l'audit du 5 septembre, proposés à l'inscription) : un élève ajouté en cours de trimestre compte les séances d'avant son arrivée comme des absences (aucune date d'entrée n'existe) ; trois des quatre portes d'écriture des présences (`sauvegarderPresencesSansValidation`, `modifierNotesPresence`, `ajouterPresencesIntervention`) écrivent `db.setSync` directement et ignorent le mode anonymisation, `enregistrerPresences` seule passe par `sauvegarderDonneesSelonMode`.
