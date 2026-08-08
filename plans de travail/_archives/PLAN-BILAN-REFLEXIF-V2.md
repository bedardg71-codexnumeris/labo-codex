# PLAN — Bilan réflexif (plan v09)

> **Date** : 3 mai 2026 (révision après-midi)
> **Auteur·ices** : Grégoire (besoins), Claude Cowork (spec format + composition du questionnaire), Claude Code (analyse code et plan)
> **Origine** : Cible immédiate = importer / éditer / exporter le questionnaire `Bilan-fin-de-trimestre-questionnaire.md` (composition Cowork) dans Labo Codex, en préservant la richesse pédagogique (matrices, choix multiples avec limite, conditionnelles textuelles).
> **Statut** : Plan de travail v09 — révisé après composition du questionnaire de référence et confirmation Grégoire (3 mai après-midi).

---

## 1. Pipeline de référence

```
[Labo Codex]              [Microsoft Forms]          [Labo Codex]
1. Composer ─ texte ───►  2. Distribuer    ◄── CSV ─ 3. Analyser
   (éditeur, types,         (anonyme,                 (mapping,
    préambule, matrices)     MS Forms)                 rapport)
```

**L'app n'a pas de rendu interactif côté élève.** Le questionnaire est composé/édité dans l'éditeur, exporté en texte, recréé manuellement dans Microsoft Forms par l'enseignant·e, puis les résultats CSV reviennent dans l'app pour analyse.

---

## 2. Décisions confirmées avec Grégoire

1. **Format de transfert** : texte uniquement. Pas de génération d'Apps Script.
2. **Outil de distribution cible** : **Microsoft Forms**.
3. **Modèle de données enrichi** : préambule, description de bloc, limites min/max sur CHECKBOX, option avec champ libre (« Autre : ___ »), matrices Likert.
4. **Libellés Likert** : 4 libellés standards. Pas de glose enrichie par échelon.
5. **Conditionnelles** : pas de logique de saut. Consigne textuelle en italique sur une **ligne séparée au-dessus** de la question.
6. **Génération automatique depuis les réglages** : abandonnée pour l'instant. À reconsidérer après plusieurs cycles de validation terrain.
7. **Bibliothèque de questions canoniques** : pas pour l'instant.
8. **Type matrice** : ajouté au scope (les 7 matrices du questionnaire de référence représentent 39 énoncés ; les déplier en 39 Likerts indépendants reproduit le problème initial des 65 items).

---

## 3. Questionnaire de référence

`Bilan-fin-de-trimestre-questionnaire.md` (composition Cowork, racine du projet).
Format texte cible : `Bilan-fin-de-trimestre-questionnaire-format-app.txt` (composé par Claude Code).

**Composition** : 20 questions en 8 sections.

| Type | Quantité | Cas |
|---|---|---|
| `matrix` (Likert 4 partagé) | 7 | Q2 (12 énoncés), Q6 (5), Q7 (2), Q8 (7), Q10 (4), Q11 (5), Q12 (4) — 39 énoncés au total |
| `choix_unique` (RADIO) | 3 | Q1 (parcours, 6 options), Q5 (concept moins utile, 6 options), Q17 (fréquence IA, 4 options) |
| `choix_multiple` (CHECKBOX) | 2 | Q4 (`max=3`, 6 options), Q18 (7 options dont « Autre : ___ ») |
| `ouvert` | 8 | Q3, Q9, Q13, Q14, Q15, Q16, Q19, Q20 |

**Particularités** :
- Préambule de 1 paragraphe (anonymat)
- Description en tête de la Section 8 (cadrage IA)
- Q4 : `[CHECKBOX max=3]`
- Q18 : option « Autre : ___ »
- Q18 : conditionnelle textuelle (« *Si tu as répondu Oui à la question précédente :* ») sur ligne séparée

**Note** : aucune Likert+NA dans cette version. Le type reste prévu dans le modèle pour de futurs questionnaires.

---

## 4. Modèle de données cible

```javascript
questionnaire = {
    id, titre,
    preambule: '<texte multi-paragraphe ou null>',
    dateCreation, dateModification,
    blocs: [{
        id, titre, actif,
        description: '<texte ou null>',
        questions: [...]
    }],
    questionsPersonnalisees: [...]
}

question = {
    id, texte, obligatoire, personnalisee,
    type: 'likert4' | 'choix_unique' | 'choix_multiple' | 'matrix' | 'ouvert',
    inclureNA: boolean,                                    // Likert seulement
    options: [{ id, lettre, texte, autreAvecChamp: bool }],// choix_unique / choix_multiple
    enonces: [{ id, texte }],                              // matrix seulement
    minSelection: number | null,                           // choix_multiple
    maxSelection: number | null,                           // choix_multiple
    consigneConditionnelle: '<texte ou null>'              // toute question
}
```

**Type matrix** : un énoncé partage l'échelle Likert 4 (libellés standards toujours, par décision §2.4). Chaque énoncé a un id stable pour le mapping CSV.

---

## 5. Format texte v09 cible

```
=== BILAN RÉFLEXIF — <titre> ===

PRÉAMBULE :
<paragraphes du préambule, jusqu'à la prochaine ligne SECTION ou
la première question numérotée>

SECTION : <titre du bloc>
DESCRIPTION : <description optionnelle, sur une seule ligne>

1. Question Likert standard
a. Tout à fait d'accord
b. Plutôt d'accord
c. Plutôt en désaccord
d. Pas du tout d'accord

2. Question Likert avec Non applicable
a. Tout à fait d'accord
b. Plutôt d'accord
c. Plutôt en désaccord
d. Pas du tout d'accord
e. Non applicable

[RADIO]
3. Question à choix unique non-Likert
a. Aucun
b. Un
c. Deux
d. Plus de deux

[CHECKBOX max=3]
4. Identifie au maximum 3 concepts les plus utiles
a. Stratégies de lecture
b. Stratégies de rédaction
c. Système d'évaluation IDME
d. Activités en classe

[CHECKBOX]
5. Question à réponses multiples avec option Autre
a. Option 1
b. Option 2
c. Option 3
d. Autre : ___

[MATRIX]
6. Approche pédagogique
- Énoncé 1
- Énoncé 2
- Énoncé 3

[OUVERT]
*Si tu as répondu Oui à la question précédente :*
7. Question conditionnelle
```

### Conventions

- **`PRÉAMBULE :`** suivi du texte multi-paragraphe libre. Se termine à la prochaine ligne `SECTION :` ou à la première question numérotée.
- **`DESCRIPTION :`** après une `SECTION :` — sur une seule ligne.
- **`[CHECKBOX max=3]`**, **`[CHECKBOX min=1 max=5]`** pour les limites.
- **`[MATRIX]`** : énoncés en puces `-`. L'échelle Likert 4 standard est implicite.
- **Option avec champ libre** : `e. Autre : ___` (3 underscores au moins).
- **Consigne conditionnelle** : ligne en italique `*<texte>*` sur sa **propre ligne**, juste avant le numéro de la question (et après une éventuelle balise `[CHECKBOX]` etc.).

### Rétrocompatibilité v1

Un questionnaire ancien sans préambule, sans descriptions, sans balises, ne contenant que Likert + ouvert, reste valide à l'import.

---

## 6. Phases — foundation

### Phase A — Format texte étendu + parser

**Scope** :
- Sections : `PRÉAMBULE :`, `DESCRIPTION :`.
- Balises : `[RADIO]`, `[CHECKBOX]`, `[MATRIX]`, `[OUVERT]`.
- Paramètres : `max=` / `min=` sur CHECKBOX.
- Option Likert `e. Non applicable` → flag `inclureNA: true`.
- Options personnalisées (a-h).
- Option « Autre : ___ » → `autreAvecChamp: true`.
- Consigne conditionnelle italique sur ligne séparée.
- Énoncés de matrice en puces `-`.

**Modifications code** :
- `parserQuestionnaireTexte()` : refonte importante (état machine multi-lignes).
- `formaterQuestionnaireEnTexte()` : sortie qui reflète tous les types et champs.
- `genererModeleTexte()` : modèle inclut un exemple de chaque type + préambule + description + matrice.
- `PROMPT_IA_BILAN` : prompt v3 — explique tous les types et règles de choix du bon type.
- Aide modale : section nouveautés.

**Tests** :
1. Aller-retour modèle démo → identité.
2. Aller-retour `Bilan-fin-de-trimestre-questionnaire-format-app.txt` → identité (test phare).
3. Détection `likert4 + inclureNA`.
4. CHECKBOX avec `max=3` correctement parsé.
5. Option « Autre : ___ » détectée.
6. Préambule multi-paragraphe préservé.
7. Description de bloc préservée (et omise quand absente à l'export).
8. Matrice : N énoncés détectés, chaque énoncé reçoit un id stable.
9. Consigne conditionnelle italique sur ligne séparée → stockée dans `consigneConditionnelle`.
10. Balise inconnue `[FOO]` → erreur précise.

**Effort estimé** : 1.5 jour.

### Phase B — UI éditeur étendue

**Scope** :
- Sélecteur de type étendu : 5 options principales (Likert, Choix unique, Choix multiple, Matrice, Ouvert) + checkbox « Inclure Non applicable » sur Likert.
- Édition des options pour Choix unique / Choix multiple : ajouter, supprimer, réordonner, modifier le texte. Min 2 options, max 8.
- Toggle « Cette option a un champ libre » sur les options.
- Champs `minSelection` / `maxSelection` sur Choix multiple.
- Édition des énoncés pour Matrice : ajouter, supprimer, réordonner.
- Champ `consigneConditionnelle` (textarea optionnelle, en italique sur l'aperçu).
- Édition du **préambule** au niveau du questionnaire (textarea sous le titre).
- Édition de la **description** au niveau de chaque bloc.
- Aperçu visuel par type :
  - Likert : badge bleu (existant)
  - Likert+NA : badge bleu avec « +NA »
  - Choix unique : badge violet, options listées avec pastille radio
  - Choix multiple : badge orange, options + indicateur de limite
  - Matrice : badge teal, énoncés listés avec pastilles Likert sous chacun
  - Ouvert : badge gris

**Tests** :
1. Créer un questionnaire complet via UI uniquement → exporter → réimporter → identité.
2. Préambule modifiable et préservé.
3. Description vide sur bloc → omise à l'export.
4. Matrice : ajouter / supprimer / réordonner les énoncés.
5. Limites min/max respectées à l'aperçu.

**Effort estimé** : 2 jours.

### Phase C — Import CSV calibré Microsoft Forms

**Conventions Microsoft Forms** :
- En-têtes standards : `ID`, `Heure de début`, `Heure de fin`, `Adresse e-mail`, `Nom`.
- Une colonne par question dont le nom est le **texte exact de la question**.
- Likert : libellé textuel ou index numérique (selon réglage MS Forms).
- Choix unique : libellé de l'option choisie.
- Choix multiple : libellés concaténés avec `;` ou `,` dans une seule cellule.
- Option « Autre : ___ » : MS Forms ajoute une **colonne sœur** « Autres : <texte de la question> » avec la valeur libre.
- **Matrice** : MS Forms exporte une colonne par énoncé. Le nom de colonne est typiquement `<question> - <énoncé>` ou similaire (à valider avec un export réel).
- Ouvert : texte brut.

**Scope** :
- Mapping auto Jaccard étendu pour matcher :
  - Préfixe « Autres : » sur les colonnes complémentaires des options « Autre : ___ ».
  - Colonnes sœurs d'une matrice (préfixe = texte de la question, suffixe après séparateur = énoncé).
- Pour Choix multiple : split sur `;` puis `,`. Trim. Match Jaccard contre `options[].texte`.
- Pour Choix unique : match unique sur `options[].texte`. Si non trouvé, avertissement.
- Pour Likert + NA : table de mapping étendue (« Non applicable » / « N/A » → null).
- Pour matrice : chaque colonne sœur est mappée à un énoncé via `enonces[].texte`. Valeur convertie comme un Likert standard.
- Pour les champs libres « Autres : ___ » : associer à `reponses[questionId].autres[]`.

**Format de stockage des résultats** :
```javascript
reponses[questionId] = {
    type: 'matrix',
    nbReponses: 42,
    parEnonce: {                         // pour matrix seulement
        'enonce_id_1': { distribution: [1→3, 2→8, 3→18, 4→13], scoreMoyen: 3.0, nbReponses: 42 },
        ...
    },
    distribution: { 'opt_a': 28, ... },  // pour choix_unique / choix_multiple
    nbNA: 0,                             // pour likert4_na
    autres: ['Réponse libre 1', ...],    // pour options autreAvecChamp
    reponses: ['Texte 1', ...]           // pour ouvert
}
```

**Tests** :
1. CSV MS Forms d'un questionnaire complet (5-10 répondants, mélange des 5 types) → import sans erreur.
2. Détection auto des colonnes sœurs « Autres : ... ».
3. Détection auto des colonnes sœurs d'une matrice.
4. Choix multiple avec `;` ou `,` → distribution correcte.
5. Mapping ambigu → message d'erreur précis avec choix manuel.
6. Likert + NA → comptage NA séparé.

**Effort estimé** : 2 jours (les colonnes sœurs MS Forms — matrices et « Autres » — sont les pièces les plus fragiles).

### Phase D — Rapport étendu

**Scope** : agrégations par type.

| Type | Stats produites |
|---|---|
| `likert4` | Moyenne, distribution 1-4, taux favorable, signal Fort/Faible (existant) |
| `likert4 + inclureNA` | Idem mais moyenne sur les *applicables* + comptage NA en bandeau |
| `choix_unique` | Distribution % par option, option dominante mise en avant |
| `choix_multiple` | Taux de sélection par option, top-3, indicateur de respect du `maxSelection` |
| `matrix` | Tableau compact : 1 ligne par énoncé, 4 colonnes Likert + colonne moyenne. Signaux Fort/Faible par énoncé. |
| `ouvert` | Liste des réponses (existant) |
| Avec `autreAvecChamp` | Liste des réponses libres saisies dans la colonne sœur |

**Graphiques** :
- `choix_unique` : barres horizontales avec %.
- `choix_multiple` : barres horizontales, ligne « max » indiquée si défini.
- `likert4 + NA` : empilée 4 niveaux + segment gris « NA ».
- `matrix` : barres empilées horizontales, une par énoncé (réutilise le pattern Likert existant en boucle).

**Synthèse** : adapter `rendreSynthese()` pour signaler :
- Options dominantes en `choix_unique`.
- Options les plus citées en `choix_multiple`.
- Énoncés à signal Fort/Faible dans une matrice.

**Tests** :
1. Rapport complet sur 30+ répondants → stats correctes pour chaque type.
2. Likert + NA : moyenne sur applicables uniquement.
3. Matrice : tableau lisible, signaux par énoncé.
4. Choix multiple > 100 % cumulé : pas de bug d'affichage.
5. Réponses « Autre : ___ » listées sous la question.

**Effort estimé** : 1.5 jours.

---

## 7. Phases reportées (sans engagement de timing)

### Phase E — Génération automatique depuis les réglages

Reportée. À reconsidérer après plusieurs cycles de passation et d'analyse réussis avec le pipeline manuel.

### Phase F — Bibliothèque de questions canoniques

Reportée.

---

## 8. Hors scope (confirmé)

- Apps Script Google
- Glose libellé Likert (« Tout à fait d'accord (charge appropriée) »)
- RANK (classement ordinal)
- Conditionnelles avec logique de saut
- Migration des données stockées (les `resultatsBilan` v1 restent compatibles)

---

## 9. Tests d'acceptation globaux

Le pipeline complet doit fonctionner sur **`Bilan-fin-de-trimestre-questionnaire-format-app.txt`** :

1. **Composer** : importer le texte dans l'app sans perte (préambule, 8 sections, description Section 8, types mixtes, options personnalisées, limite max=3, option « Autre : ___ », conditionnelle textuelle, 7 matrices avec leurs énoncés).
2. **Exporter** : « Copier les questions » produit un texte fidèle (round-trip identique).
3. **Recréer** dans MS Forms manuellement (action enseignant, hors app).
4. **Distribuer** (action enseignant, hors app).
5. **Importer le CSV** MS Forms : mapping auto correct sur ≥ 90 % des colonnes (y compris colonnes sœurs des matrices et « Autres : »). Correction manuelle pour les 10 % restants.
6. **Analyser** : rapport généré avec stats correctes pour chaque type (incluant tableau matriciel). Réponses libres listées.

---

## 10. Effort total révisé

| Phase | Effort |
|---|---|
| A — Format texte + parser étendus (5 types, préambule, descriptions, options, limites, matrices, conditionnelles) | 1.5 j |
| B — UI éditeur étendue (5 types, préambule, descriptions, options, énoncés, limites) | 2 j |
| C — Import CSV MS Forms (avec colonnes sœurs matrices et « Autres ») | 2 j |
| D — Rapport étendu (matrices, NA, autreAvecChamp) | 1.5 j |
| **Foundation cumulée** | **7 j** |

À étaler sur 2-3 semaines de sessions Claude Code, avec validation terrain entre chaque phase.

---

## 11. Risques et mitigations

| Risque | Mitigation |
|---|---|
| Le format CSV des matrices MS Forms varie (séparateur `<question> - <énoncé>` vs autre convention) | Tester avec un export réel d'un compte Microsoft 365 dès Phase C. Documenter les variantes observées. Permettre la correction manuelle des mappings. |
| Les colonnes « Autres : <question> » n'apparaissent pas si aucun élève n'a saisi de texte libre | Tolérer leur absence sans erreur. |
| Le parser de matrice peine sur les énoncés multi-lignes | Imposer 1 ligne par énoncé dans le format texte. Erreur explicite si une ligne `-` est suivie d'une ligne sans `-` qui n'est pas une nouvelle balise/section. |
| Le préambule fait plusieurs paragraphes et les lignes vides cassent la délimitation | Délimitation stricte : `PRÉAMBULE :` jusqu'à la prochaine ligne `SECTION :` ou à la première question numérotée. |
| L'éditeur UI devient lourd avec 5 types à supporter | Découper Phase B en sous-phases : B1 = Likert±NA + Ouvert + Choix unique/multiple. B2 = Matrices. Permet une livraison progressive. |
| L'enseignant·e doit recopier 7 matrices (39 énoncés) à la main dans MS Forms | Friction acceptée pour cette version. À réévaluer si Apps Script ou un autre chemin devient utile. |

---

## 12. Questions ouvertes pour Cowork

1. La syntaxe `[MATRIX]` avec énoncés en puces `-` (sans numérotation) est-elle conforme à l'esprit de la spec Cowork (où le type matrice était hors scope) ? Si une autre forme est préférée, laquelle ?
2. La consigne conditionnelle sur **ligne séparée** au-dessus du numéro de question (vs en préfixe sur la même ligne) est cohérente avec la spec ?
3. Le report indéfini de la génération depuis les réglages est-il prudent ?
