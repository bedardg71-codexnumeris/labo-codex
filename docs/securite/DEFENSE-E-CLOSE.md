# Défense E — Phase 1 close (12 mai 2026)

> Document de clôture de la « Phase 1 pragmatique » de la Défense E
> (migration `innerHTML` vers échappement défensif). Position défendable
> pré-colloque AQPC du 3 juin 2026.
>
> Approche choisie : **substitution mécanique uniforme `value="${X}"` →
> `value="${echapperHtml(X)}"`** sur tous les fichiers JS en production,
> plutôt qu'une migration exhaustive vers `textContent` ou construction
> DOM (1-2 semaines, REJETÉE pour pré-colloque).
>
> Référence amont : `docs/securite/MODELE-MENACES.md` §8.2 défense E,
> §I-01 (mécanique XSS). Stratégie actée le 11 mai 2026
> (cf. `SESSION.md` du 11 mai et `docs/CALENDRIER.md` §3).

---

## 1. Synthèse

| Élément | Valeur |
|---|---|
| Date de fermeture Phase 1 | 12 mai 2026 |
| Version | Beta 99.42, builds 0512-0641 → 0512-XXXX |
| Branche | `main` (commits directs, pas de PR) |
| **Occurrences `value="${X.Y}"` non échappées avant** | **~105 sur 20 fichiers** |
| **Occurrences `value="${X.Y}"` non échappées après** | **0 hors `js/_archives/`** |
| Effort réel | ~3 h (substitution mécanique seule) |
| Tests post-fermeture | 24 Vitest + 6 Playwright = 30 verts |
| Compteur `audit-innerhtml.sh` | 119 → 112 suspects (-7) |

---

## 2. Ce qui a été fait

### 2.1 Amélioration `echapperHtml` (commit `e97cf71`)

`js/config.js` — fonction `echapperHtml` corrigée pour gérer les types
primitifs non-string :

```diff
 function echapperHtml(texte) {
-    if (!texte) return '';
+    if (texte == null) return '';
     const div = document.createElement('div');
-    div.textContent = texte;
+    div.textContent = String(texte);
     return div.innerHTML;
 }
```

**Comportement modifié** :
- `echapperHtml(0)` : `''` → `'0'`
- `echapperHtml(false)` : `''` → `'false'`
- `echapperHtml(NaN)` : `''` → `'NaN'`

**Comportement inchangé** :
- `echapperHtml(null|undefined)` → `''`
- `echapperHtml('')` → `''`
- `echapperHtml('texte')` → `'texte'`
- `echapperHtml('<>')` → `'&lt;&gt;'`

Prérequis pour que la substitution mécanique sur `value="${X.Y}"` soit
sans risque pour les attributs numériques (ex. seuil de niveau à 0%,
pondération à 0).

### 2.2 Substitution mécanique (20 commits)

Pattern uniforme appliqué partout :

```js
// Avant
`<option value="${X.id}">...`
`<input value="${X.nom}">`

// Après
`<option value="${echapperHtml(X.id)}">...`
`<input value="${echapperHtml(X.nom)}">`
```

Pour `js/export-pdf.js`, utilisation de la variante anglaise locale
`escapeHtml()` (équivalente, implémentée L628). Sinon `echapperHtml()`
de `js/config.js`.

#### Fichiers couverts (20)

| # | Fichier | Occurrences | Commit | Notes |
|---|---|---:|---|---|
| 1 | `js/travaux-ui.js` | 16 | `1aa7a15` | Le plus dense, ID prods/étudiants/fichiers/groupes-cours |
| 2 | `js/echelles.js` | 14 | `a93ba25` | Inclut nombres `niveau.min/max/valeurCalcul` |
| 3 | `js/evaluation.js` | 9 | `2f1125c` | Codes niveaux SOLO, échelles, productions |
| 4 | `js/wizard-pratique-v2.js` | 5 | `201e0c7` | Options wizard + sélecteurs grilles/échelles |
| 5 | `js/grilles.js` | 3 | `498ef8a` | Grilles + pondération critères |
| 6 | `js/cartouches.js` | 4 | `b7561ee` | Grilles + cartouches + échelles |
| 7 | `js/objectifs.js` | 4 | `d43ce00` | Inclut `obj.nom` (donnée utilisateur, RISQUE RÉEL) |
| 8 | `js/boite-outils.js` | 4 | `d6b4625` | **+2 vrais bugs XSS** `${cat.nom}` brut corrigés |
| 9 | `js/spe-specifications.js` | 1 | `26d4c16` | **+1 vrai bug XSS** `${type.nom}` brut |
| 10 | `js/pratiques-bibliotheque.js` | 2 | `cc8e48a` | **+2 vrais bugs XSS** `${config.nom}` bruts |
| 11 | `js/profil-etudiant.js` | 1 | `0d4bb45` | Sélecteur étudiants |
| 12 | `js/trimestre.js` | 4 | `adb7425` | Inclut `evt.description` (donnée utilisateur) |
| 13 | `js/trimestre-v2.js` | 11 | `10d3a9f` | 7 patterns distincts. Textes interpolés bruts à auditer plus tard. |
| 14 | `js/productions.js` | 6 | `fd5c8b6` | **+4 vrais bugs XSS** `${g.nom}/${e.nom}/${t.nom}` bruts |
| 15 | `js/export-pdf.js` | 12 | `bf43ed6` | Utilise `escapeHtml()`. **+4 vrais bugs XSS** textes bruts |
| 16 | `js/interventions.js` | 3 | `61abc89` | Inclut `intervention.titre/date` (donnée utilisateur) |
| 17 | `js/travaux-import.js` | 1 | `e2dd2b1` | Sélecteur association étudiants |
| 18 | `js/pratiques-gestion.js` | 2 | `776bba4` | **+1 vrai bug XSS** `${e.nom}` brut |
| 19 | `js/gabarits-utils.js` | 2 | `f62eb30` | **+1 vrai bug XSS** `${p.nom}` brut |
| 20 | `js/portfolio.js` | 1 | `aec30cc` | Checkbox artefact retenu |
| | **Total** | **~105** | | |

#### Vrais bugs XSS latents corrigés en passant (15+)

Plusieurs commits ont aussi corrigé des cas de **texte interpolé brut**
dans les mêmes options/inputs, ce qui constituait un vrai vecteur XSS
si les noms (`cat.nom`, `type.nom`, `g.nom`, etc.) pouvaient contenir
du HTML. Détaillés dans les commits correspondants ci-dessus.

### 2.3 Sentinelle anti-régression (commit `381259a`)

`tests/unit/lint-securite.test.js` — nouveau test F.16 :

```js
it('F.16 · Défense E · zero value="${X.Y}" non échappé hors _archives/', () => {
    const sortieGrep = execFileSync('bash', ['-c',
        'grep -rEn \'value="\\$\\{[a-zA-Z_]+\\.[a-zA-Z_]+\\}"\' js/ --include="*.js" | grep -v "_archives" || true'
    ], ...);
    expect(sortieGrep).toBe('');
});
```

Bloque la régression future. Si un commit ajoute un `value="${X.Y}"`
sans échappement, le test échoue avec la liste des lignes concernées.

Baseline F.15 (compteur global `audit-innerhtml.sh`) abaissée
de 120 → 115.

---

## 3. Ce qui reste

### 3.1 Hors scope Phase 1 close

**Textes interpolés bruts** dans le HTML généré (pas dans `value=`).
Exemples vus en route :
- `trimestre-v2.js` lignes 4194, 4218, 4262, 4281, 4305, 5514, 5810,
  6165 : `${nomComplet}`, `${label}`, `${labelEns(e)}`, `${nom}`.
- `profil-etudiant.js`, `productions.js` (couvert), `trimestre.js`
  (couvert).

Ces patterns sont des **vrais vecteurs XSS** si la source de données
contourne `SCHEMAS_IMPORT`. Couverts par le compteur global
`audit-innerhtml.sh` (sentinelle F.15) mais pas par F.16.

**À traiter post-colloque** dans une « Phase 2 » optionnelle.

### 3.2 Pattern `value="${X.Y.Z}"` (2 niveaux)

Le grep F.16 cible uniquement `value="${X.Y}"` (1 niveau de propriété).
Le pattern `value="${X.Y.Z}"` (2 niveaux, ex. `value="${obj.user.id}"`)
n'est pas couvert. Aucun cas réel détecté dans le code en production
au 12 mai 2026, mais à surveiller.

### 3.3 Modules archivés

`js/_archives/entites-ui.js` contient 10 occurrences non échappées.
Ce module n'est plus chargé dans `index.html` (préfixe `_archives`).
Pas de risque réel.

### 3.4 Migration EXHAUSTIVE vers `textContent` / construction DOM

REJETÉE pour pré-colloque (effort 1-2 semaines, décision actée 11 mai
2026). À reconsidérer post-colloque seulement si pertinente — la
sandbox iframe (Défense A livrée 8 mai 2026) neutralise déjà la
mécanique I-01 sous-jacente.

---

## 4. Risque résiduel

**Compteur `audit-innerhtml.sh` : 112 suspects** (vs 120 baseline mai).

La plupart sont des faux positifs de l'heuristique 5-lignes :
- Variables intermédiaires assainies bien avant l'`innerHTML`.
- Nombres ou booléens (`${index}`, `${i}`, `${count}`).
- Sortie de fonctions qui échappent en interne (ex.
  `genererGrilleFichiers`, `genererBadgeCC`).

Cas réels suspectés résiduels : ~5-10 sur l'ensemble du codebase,
principalement dans `trimestre-v2.js` et `accompagnement.js`. À auditer
au cas par cas dans une « Phase 2 » optionnelle post-colloque.

---

## 5. Position défendable au colloque

**Affirmations vérifiables** :

1. ✅ **Zéro `value="${X.Y}"` non échappé** dans le code en production
   au 12 mai 2026 (vérifié par sentinelle F.16).

2. ✅ **`echapperHtml` robuste** sur tous les types primitifs
   (string, number, boolean, null, undefined).

3. ✅ **Sentinelle anti-régression** automatisée (F.15 baseline + F.16
   pattern spécifique). Hook pré-push exécute ces tests.

4. ✅ **Sandbox iframe** (Défense A, livrée 8 mai 2026) en filet de
   sécurité même en cas de XSS résiduel — l'origine opaque empêche
   l'accès au parent.

5. ⚠ **Migration exhaustive `innerHTML` → `textContent`** non réalisée.
   Décision pragmatique pré-colloque assumée — surface XSS résiduelle
   couverte par Défense A en défense en profondeur.

---

## 6. Références

- `docs/securite/MODELE-MENACES.md` §I-01, §8.2 défense E
- `docs/securite/audits/AUDIT-INNERHTML-FINDINGS-2026-05-06.md`
- `docs/securite/audits/AUDIT-INNERHTML-FINDINGS-2026-05-11.md`
- `scripts/audit-innerhtml.sh`
- `tests/unit/lint-securite.test.js` (F.15 baseline + F.16 sentinelle)
- `SESSION.md` 11 mai 2026 (décision pragmatique)
- `docs/CALENDRIER.md` §3 (planning pré-colloque)

---

## 7. Historique

| Date | Version | Changement |
|---|---|---|
| 2026-05-12 | 1.0 | Création. Fermeture Phase 1 pragmatique. 105 occurrences couvertes sur 20 fichiers, 21 commits. Sentinelle F.16 ajoutée. Baseline F.15 abaissée à 115. |
