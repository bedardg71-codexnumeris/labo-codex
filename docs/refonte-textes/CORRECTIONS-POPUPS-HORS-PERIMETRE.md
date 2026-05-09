# Corrections — Popups hors périmètre

**Statut** : Validé (19 avril 2026)  
**Fichier cible** : `js/aide-contextuelle-contenu.js`  
**Contexte** : Ces corrections concernent 4 entrées qui n'étaient pas couvertes par la refonte initiale des textes d'accompagnement. Les formulations ci-dessous ont été validées par Grégoire.

---

## 1. Supprimer `apercu-contenu` (ligne ~223)

Supprimer l'entrée complète `apercu-contenu` (titre : «Comprendre l'aperçu»). Elle est remplacée par `tableau-bord-apercu` (ligne ~650), qui est la version validée (`conseil-apercu`).

**Après suppression** : chercher dans tout le code (`js/`, `index.html`) les références à la clé `'apercu-contenu'` et les remplacer par `'tableau-bord-apercu'`.

---

## 2. Réécrire `interventions-planification` (ligne ~572)

Deux sections à modifier. Le reste de l'entrée (titre, sections texte, liste «Les 3 niveaux RàI», liste «Le formulaire unifié», conseil) reste inchangé.

### 2a. Section `exemple` (ligne ~604-608)

**Texte actuel** :
```javascript
{
    type: 'exemple',
    titre: "Le cycle teach-test-revise-test",
    contenu: "Tu interviens sur Structure et Rigueur (niveau 2). Après quelques artefacts, tu marques l'intervention comme complétée. Le bilan compare les scores avant et après. Si l'objectif n'est pas atteint, tu choisis la suite : reconduire, ajuster ou référer."
}
```

**Remplacer par** :
```javascript
{
    type: 'exemple',
    titre: "Enseigner, \u00e9valuer, ajuster",
    contenu: "Tu interviens sur les crit\u00e8res cibl\u00e9s (niveau 2). Au fil des productions suivantes, tu observes la trajectoire. Quand tu marques l\u2019intervention comme compl\u00e9t\u00e9e, le bilan compare les scores avant et apr\u00e8s sur les crit\u00e8res cibl\u00e9s. Selon le r\u00e9sultat, tu choisis\u00a0: reconduire l\u2019intervention, ajuster la cible, ou r\u00e9f\u00e9rer vers un soutien plus intensif."
}
```

**Changements** :
- Titre «Le cycle teach-test-revise-test» → «Enseigner, évaluer, ajuster»
- Retrait de «Structure et Rigueur» (critères spécifiques à une discipline) → «les critères ciblés» (universel)
- «artefacts» → «productions» (cohérence avec le vocabulaire de planification)
- Ajout de «sur les critères ciblés» après «avant et après»

### 2b. Section `alerte` (ligne ~610-613)

**Texte actuel** :
```javascript
{
    type: 'alerte',
    niveau: 'attention',
    contenu: "Les interventions de niveau 3 impliquent souvent des ressources externes (centre d'aide, API, conseiller pédagogique). Vérifie les ressources disponibles dans ton cégep."
}
```

**Remplacer par** :
```javascript
{
    type: 'alerte',
    niveau: 'attention',
    contenu: "Les interventions de niveau 3 d\u00e9passent parfois ce que l\u2019enseignant\u00b7e peut faire seul. Les services adapt\u00e9s, l\u2019aide p\u00e9dagogique individuelle (API) ou les centres d\u2019aide sont des ressources \u00e0 mobiliser."
}
```

**Changements** :
- «impliquent souvent des ressources externes (centre d'aide, API, conseiller pédagogique). Vérifie les ressources disponibles dans ton cégep.» → formulation plus empathique, «API» contextualisé comme «aide pédagogique individuelle (API)», retrait de «conseiller pédagogique» (redondant avec API)

---

## 3. Harmoniser `profil-etudiant-indicateurs` (ligne ~489)

### 3a. Réécrire la liste A-C-P (ligne ~499-503)

**Texte actuel** :
```javascript
{
    type: 'liste',
    titre: "Les 3 indices A-C-P",
    items: [
        "A (Assiduité) — Taux de présence aux cours. Calculé automatiquement depuis la saisie des présences.",
        "C (Complétion) — Proportion d'artefacts remis par rapport aux artefacts attendus.",
        "P (Performance) — Résultat composite basé sur les meilleurs artefacts évalués (selon la pratique configurée)."
    ]
}
```

**Remplacer par** :
```javascript
{
    type: 'liste',
    titre: "Les 3 indices A-C-P",
    items: [
        "A (Assiduit\u00e9) \u2014 Mesure l\u2019exposition de l\u2019\u00e9tudiant\u00b7e aux situations d\u2019apprentissage\u00a0: sa pr\u00e9sence en classe. Ce n\u2019est pas un jugement sur la qualit\u00e9 de sa participation.",
        "C (Compl\u00e9tion) \u2014 Mesure la r\u00e9gularit\u00e9 de la mise en pratique\u00a0: les artefacts remis par rapport aux artefacts attendus. C\u2019est le constat d\u2019un effort, pas de sa qualit\u00e9.",
        "P (Performance) \u2014 Mesure la comp\u00e9tence d\u00e9montr\u00e9e au moment T, selon la pratique de notation configur\u00e9e. C\u2019est une photographie, pas un pronostic."
    ]
}
```

**Changements** :
- Formulations alignées sur le glossaire validé (`glossaire-bloc6.md`)
- Ajout des gardes-fous : «pas un jugement sur la qualité», «pas de sa qualité», «pas un pronostic»

### 3b. Ajouter une section `conseil` après la dernière section existante (après la liste «Niveaux RàI», ligne ~528)

**Ajouter avant le `voirAussi`** :
```javascript
{
    type: 'conseil',
    contenu: "Ces indices sont des rep\u00e8res, pas des verdicts. Un A faible peut s\u2019expliquer par un contexte personnel d\u00e9favorable sur lequel tu n\u2019as pas de contr\u00f4le. Un P plus faible en d\u00e9but de trimestre est \u00e9galement normal. C\u2019est la trajectoire qui compte, pas l\u2019\u00e9valuation isol\u00e9e."
}
```

---

## 4. Vérifier `suivi-liste` (ligne ~340)

L'entrée `suivi-liste` contient une seule section identique au contenu validé de `conseil-liste-etudiants`.

**Action** : chercher dans le code (`js/aide-contextuelle.js`, `js/primo-tooltips.js`, `index.html`) tous les appels qui ouvrent la popup avec la clé `'suivi-liste'`. Si ces appels peuvent pointer vers `'tableau-bord-apercu'` ou une autre clé validée sans casser la navigation, supprimer `suivi-liste`. Sinon, la garder telle quelle (le texte est correct).

---

## Résumé des modifications

| Entrée | Action | Risque |
|--------|--------|--------|
| `apercu-contenu` | Supprimer + rediriger les références | Faible — vérifier les appels |
| `interventions-planification` | Réécrire 2 sections (exemple + alerte) | Nul — remplacement de texte |
| `profil-etudiant-indicateurs` | Réécrire 1 liste + ajouter 1 conseil | Nul — remplacement de texte |
| `suivi-liste` | Vérifier doublon, supprimer si possible | Faible — vérifier les appels |
