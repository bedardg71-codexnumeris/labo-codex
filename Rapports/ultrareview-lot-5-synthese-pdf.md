# Rapport `/ultrareview` — Lot 5 (Synthèse de rétroaction PDF + export)

**PR auditée** : [#8](https://github.com/bedardg71-codexnumeris/Monitorage_v6/pull/8) — branche `review/lot-5-synthese-pdf`
**Date** : 29 avril 2026
**Lignes auditées** : 5 606 sur 4 modules (`synthese-retroaction-data.js`, `synthese-retroaction-rendu.js`, `travaux-export-pdf.js`, `export-pdf.js`)
**Statut du run** : ✅ Pipeline complet sans crash. 9 findings retournés (4 normal + 5 nit).

---

## 🔴 Normal — bugs user-facing affectant l'élève (4)

Ces bugs créent une **contradiction directe** entre ce que l'élève voit dans son PDF de synthèse et la réalité de son évaluation. Priorité de correctif élevée.

### N1 — Mauvaise date d'échéance affichée à l'élève

**Fichier** : `js/synthese-retroaction-data.js:698-708`
**Fonction** : `obtenirEcheance(prod)`

`echeancesParGroupe` est indexé par groupe-cours id (chaque section d'un même cours peut avoir sa propre échéance). Le helper itère `for...in` et retourne le **premier hit**, ignorant le groupe-cours de l'élève. Résultat : la date affichée est celle d'un groupe arbitraire (ordre d'insertion JS).

**Manifestation concrète** :
- Production X : `echeancesParGroupe = { gc_A: '2026-05-01', gc_B: '2026-05-15' }` (pas de `dateEcheance` global)
- Élève S dans groupe `gc_B` exporte son PDF
- Si `gc_A` a été inséré en premier dans l'objet → l'élève voit `(échéance : 1 mai)` alors que sa vraie date est le 15 mai
- L'élève soumet **2 semaines en retard**

**Lieux affectés** : sections « Artefacts à venir » (l. 726) et « Artefacts obligatoires » (l. 736) de la synthèse.

**Correctif** : utiliser `obtenirEcheanceEffective(prod, gcId)` (déjà utilisé dans `export-pdf.js:554, 654, 1113` pour exactement ce cas).

```js
const obtenirEcheance = (prod) => {
    if (typeof obtenirEcheanceEffective === 'function') {
        return obtenirEcheanceEffective(prod, gcIdEleve).date || null;
    }
    if (prod.dateEcheance) return prod.dateEcheance;
    if (prod.echeancesParGroupe && gcIdEleve) {
        const e = prod.echeancesParGroupe[gcIdEleve];
        return (e && e.date) || null;
    }
    return null;
};
```

---

### N2 — Message pédagogique inversé : « Tous les critères maîtrisés » sur travail Non recevable

**Fichier** : `js/synthese-retroaction-data.js:455-484`
**Fonction** : `construireConcentration`

Deux défauts indépendants qui produisent des messages faussement positifs :

**Défaut 1** : le filtre `defis = criteres.filter(c => c.niveauSelectionne === 'I' || c.niveauSelectionne === 'D')` exclut le niveau `'0'` (Non recevable, pourtant défini dans `SCALE_FALLBACK` avec ORDRE_NIV=0). Une évaluation entièrement marquée Non recevable produit `defis.length === 0`, donc `tousMaitrises = true`, donc le message :

> « Tous les critères sont maîtrisés. Continue sur cette lancée ! »

…s'affiche à un élève dont le travail est jugé non recevable. **Inversion totale du message pédagogique.**

**Défaut 2** : `historique[0].criteres.every(...)` retourne `true` sur un tableau vide (vacuité standard JS). Une évaluation antérieure sans critères enregistrés (donnée legacy, grille changée) déclenche faussement :

> « Tous les critères sont maîtrisés depuis plus d'un artefact. Tu peux aider tes collègues — c'est une excellente façon d'étendre tes compétences vers le niveau É »

**Correctifs** :

```js
// L. 455 — explicit M/E check + non-empty guard
const tousMaitrises = criteres.length > 0 &&
    criteres.every(c => c.niveauSelectionne === 'M' || c.niveauSelectionne === 'E');

// L. 471-472 — non-empty guard sur historique
const maitriseLongtemps = historique[0] && Array.isArray(historique[0].criteres) &&
    historique[0].criteres.length > 0 &&
    historique[0].criteres.every(c => c.niveauSelectionne === 'M' || c.niveauSelectionne === 'E');
```

---

### N3 — Décalage d'une journée sur les dates ISO date-only

**Fichier** : `js/synthese-retroaction-rendu.js:628-638`
**Fonction** : `formaterDateCourte(iso)`

Asymétrie avec sa fonction sœur `formaterDateLongue` (l. 596) qui applique correctement `iso + 'T00:00:00'` pour parser en heure locale. La version courte appelle directement `new Date(iso)` qui interprète une chaîne `'2026-04-29'` comme **minuit UTC** → rendu en heure de Montréal (UTC-4) → **« 28 avr. »** au lieu de « 29 avr. ».

**Manifestation** : les dates d'échéance sous les cases `todo` du TrimestreBar apparaissent en avance d'une journée. Le PDF peut afficher des dates incohérentes sur la même page (la date longue dans la rangée Note provisoire est correcte parce qu'elle utilise l'autre fonction).

**Correctif** : copier le pattern de `formaterDateLongue` :

```js
function formaterDateCourte(iso) {
    if (!iso) return '';
    try {
        const d = new Date(String(iso).indexOf('T') >= 0 ? iso : iso + 'T00:00:00');
        if (isNaN(d.getTime())) return iso;
        return d.toLocaleDateString('fr-CA', { day: 'numeric', month: 'short' }).replace('.', '');
    } catch (e) {
        return iso;
    }
}
```

---

### N4 — PDF de synthèse mélange contenu de différents artefacts

**Fichier** : `js/travaux-export-pdf.js:705-723`
**Fonctions** : `exporterDossierComplet` + `trouverEvaluationPourSynthese`

Deux failles cumulatives :

**Faille 1** : `exporterDossierComplet` (l. 771) appelle `ajouterPageSynthese(doc, fichier)` **sans propager** le `productionId` qu'il reçoit, alors que la signature accepte `productionIdOverride` (cf. `genererDocPDF:50` qui le transmet correctement).

**Faille 2** : `trouverEvaluationPourSynthese` (l. 723) fait `.filter(e => !productionId || e.productionId === productionId)` — si `productionId` est falsy (override absent ET `fichier.productionId` absent), le filtre court-circuite et retourne **la dernière évaluation de l'élève toutes productions confondues**.

**Manifestation** : un fichier annoté non encore associé à une production (cas orphelin légitime) → PDF avec titre/critères/rétroactions/cartouche d'un autre artefact. Difficile à détecter pour l'enseignant car la mise en page paraît cohérente.

**Correctifs** :

```js
// (a) exporterDossierComplet — propager productionId
await ajouterPageSynthese(doc, fichier, productionId);

// (b) trouverEvaluationPourSynthese — refuser le mode permissif
function trouverEvaluationPourSynthese(fichier, productionIdOverride) {
    if (!fichier || !fichier.etudiantDA) return null;
    const productionId = productionIdOverride || fichier.productionId;
    if (!productionId) return null;  // ← pas de production résolue → pas de synthèse
    ...
    const candidates = evaluations
        .filter(e => e.etudiantDA === fichier.etudiantDA && !e.remplaceeParId)
        .filter(e => e.productionId === productionId);  // ← strict
    ...
}
```

---

## 🟡 Nits — défense en profondeur ou cosmétique (5)

| # | Fichier:ligne | Description |
|---|---|---|
| nit1 | `js/travaux-export-pdf.js:1095` | Modal de révision affiche `Autocollants : N (0 qualite, N diagnostic)` car la classification utilise les catégories legacy `qualite`/`diagnostic` au lieu de `action`/`observations`/`comprehension`. PDF correct, modal trompeur. |
| nit2 | `js/travaux-export-pdf.js:1050` | `fermerPreviewPDF` ne détruit pas le `pdfDoc` PDF.js → fuite mémoire cumulative dans le worker. Une session de correction de 30 PDF peut accumuler plusieurs centaines de Mo. Fix : `state.pdfDoc.destroy().catch(() => {})` avant `state = null`. |
| nit3 | `js/synthese-retroaction-rendu.js:91` | `esc()` retourne `String(s ?? '')` (pas d'échappement) si `echapperHtml` est absent. Latent en l'état (la fonction est toujours bundlée), mais désarme la garantie de SKILL_Securite §9.1.1 dans un futur refactor. Fix : mini replace fallback ou `throw`. |
| nit4 | `js/synthese-retroaction-data.js:99` | Quand `etudiantNom` est mononyme (ex. « Madonna ») et que l'étudiant n'est plus dans `groupeEtudiants`, le fallback assigne le même token à `prenom` ET `nom` → header PDF affiche « Madonna Madonna ». Fix : `if (parts.length === 1) nom = parts[0]` séparé du cas multi-token. |
| nit5 | `js/synthese-retroaction-rendu.js:185` | Pour les cases `todo` du TrimestreBar, le numéro de production est rendu deux fois (dans la boîte 22×22 ET dans la légende dessous). Pour les cases `active`/`done` la boîte montre l'IDME, donc la duplication n'apparaît que sur les `todo`. Fix : skip `numero` quand `status === 'todo'` ou laisser `contenu` vide pour `todo`. |

---

## Observations méta

- **Pipeline `/ultrareview` complet sans crash** sur ce lot (5 606 lignes vs 11 900 pour le Lot 1 qui a planté à la déduplication). Probable corrélation taille → risque de crash.
- **Les 4 bugs normaux sont user-facing et pédagogiques** — chacun crée une contradiction entre le PDF remis à l'élève et la réalité de son évaluation. Plus impactants que les 11 critiques défensifs du Lot 1, qui sont surtout des fortifications manquantes.
- **N2 est particulièrement préoccupant** : un message d'éloge envoyé à un élève dont le travail est non recevable peut être contre-productif au plan pédagogique.

## Plan de remédiation suggéré

1. **N3** (décalage de date) — fix trivial 5 minutes, déployable en isolation
2. **N2** (message inversé) — fix 10 minutes, déployable en isolation
3. **N1** (mauvaise échéance) — 30 minutes, nécessite de récupérer `gcIdEleve` à travers le pipeline data
4. **N4** (mauvaise évaluation) — 30 minutes, deux call-sites à corriger
5. **nit1** + **nit2** + **nit3** + **nit4** + **nit5** — bundle « finitions », 1 heure
