# Audit des 11 sélecteurs — Phase 2.0 du chantier d'autonomisation

**Date** : 21 avril 2026
**Build de référence** : 0421-1500 · Beta 99.21
**Livrable** : Phase 2.0 de `plans de travail/PLAN-AUTONOMISATION-UTILISATEUR.md`
**Statut** : document temporaire, à retirer en Phase 6 documentation

Ce document cartographie les 11 sélecteurs d'entités à adapter pour exposer la
section « Démo » à côté de « Mes documents ». Il identifie un POC (Grille),
le pattern existant déjà extensible (`BibliothequeUI`), et une stratégie
de propagation.

---

## 0. Distinction conceptuelle importante (à valider avec Grégoire)

Le plan d'autonomisation parle de « sélecteurs à 2 sections ». Or il existe
**deux concepts distincts** dans le codebase actuel :

1. **Bibliothèque/gestionnaire** (modale `BibliothequeUI.creerModal`) : permet
   à l'utilisateur de **curater** ce qui apparaît dans sa barre latérale.
   Exemple : « Bibliothèque de grilles » qui distingue les grilles affichées
   (« dans la barre latérale ») des grilles disponibles à ajouter.

2. **Sélecteur d'usage** (dropdown `<select>`, ou liste de cartes au moment
   de l'attribution) : permet de **choisir** une entité existante au moment
   d'un assemblage (ex. attribuer une grille à une production, sélectionner
   un cours pour créer un groupe-cours).

**Question pour Grégoire** : la Phase 2 doit-elle adapter :
- A) **Les bibliothèques/gestionnaires** (modales) ? L'utilisateur curate les
  démos qu'il veut voir dans sa barre latérale — risque que des items démo
  s'y mélangent visuellement avec les locaux ;
- B) **Les sélecteurs d'usage** (dropdowns) ? L'utilisateur voit ses propres
  items + section démo à chaque sélection. Plus cohérent avec le mockup
  du plan §3.1 ;
- C) **Les deux** ? Plus de travail mais plus complet.

L'audit ci-dessous traite les deux, en marquant pour chaque entité son type
de sélecteur. La décision oriente l'attaque de Phase 2.1 (POC).

---

## 1. Tableau récapitulatif des 11 entités

| # | Entité | Module(s) principal | Clé localStorage | Type de sélecteur actuel | Module `*-bibliotheque.js` ? |
|---|---|---|---|---|---|
| 1 | Trimestre | `js/trimestres.js` (1912 l.) + `js/trimestre-v2.js` | `trimestres` (global) | `<select id="selectTrimestreActif">` | ❌ |
| 2 | Cours | `js/entites/cours-entite.js` | `cours` (global) | `<select id="v2-selectCours">` | ❌ |
| 3 | Enseignant | `js/entites/enseignants.js` | `enseignants` (global) | `<select id="v2-selectEnseignant">` | ❌ |
| 4 | Groupe d'étudiants | `js/etudiants.js` (1619 l.) + sélecteur dans `js/evaluation.js` | `cle('groupeEtudiants')` (namespacé) | `<select id="selectGroupeEval">` | ❌ |
| 5 | Horaire | `js/entites/horaires.js` | `horaires` (global) | `<select id="v2-selectHoraire">` | ❌ |
| 6 | Groupe-cours | `js/entites/groupe-cours.js` | `cle('groupesCours')` (namespacé) | `<select id="v2-selectGroupeCours">` | ❌ |
| 7 | **Grille** | `js/grilles.js` (3940 l.) | `bibliothequeGrilles` (global) | Modale `BibliothequeUI` | ✅ `grilles-bibliotheque.js` (273 l.) |
| 8 | Échelle | `js/echelles.js` (4121 l.) | `bibliothequeEchelles` (global) | Modale `BibliothequeUI` | ✅ `echelles-bibliotheque.js` (273 l.) |
| 9 | Cartouche | `js/cartouches.js` (3770 l.) | `bibliothequeCartouches` (global) | Modale `BibliothequeUI` | ✅ `cartouches-bibliotheque.js` (273 l.) |
| 10 | Production | `js/productions.js` (3918 l.) | `cle('productions')` (namespacé) | Modale `BibliothequeUI` + dropdown | ✅ `productions-bibliotheque.js` (298 l.) |
| 11 | Pratique | `js/pratiques.js` (5408 l.) + `pratique-notation-v2.js` | `pratiquesConfigurables` (global) | Sélection en config (pas dropdown) | ✅ `pratiques-bibliotheque.js` (1158 l.) |

**Observations** :
- **5 entités globales non namespacées** (Trimestre, Cours, Enseignant, Horaire,
  Pratique) — leur démo vit dans `demo_trimestres`, `demo_listeCours`,
  `demo_enseignants`, `demo_horaires`, `demo_pratiquesConfigurables`.
- **2 entités namespacées par trimestre** (Groupe d'étudiants, Groupe-cours,
  Production) — démo dans `demo_groupeEtudiants`, `demo_groupesCours`,
  `demo_productions`.
- **5 entités ont un module `*-bibliotheque.js`** (Grille, Échelle, Cartouche,
  Production, Pratique) qui consomme `BibliothequeUI` — pattern extensible.
- **6 entités sont des dropdowns natifs** sans bibliothèque — pattern à créer
  ou à adapter via `<optgroup>`.

---

## 2. Sélecteur Grille — analyse approfondie (POC)

### 2.1 État actuel

`js/grilles.js:3940` lignes. Un seul appel à `BibliothequeUI.creerModal()`
(probablement vers la ligne 2263 selon l'audit Explore).

**Pattern actuel** (modale gestionnaire de bibliothèque) :
```js
BibliothequeUI.creerModal({
    modalId: 'modalBibliothequeGrilles',
    titre: 'Bibliothèque de grilles de critères',
    titreSection1: 'Grilles dans la barre latérale',
    contenuSection1: cartesSelectionnees,
    titreSection2: 'Grilles disponibles à ajouter à la barre latérale',
    contenuSection2: cartesDisponibles,
    filtresSection2: filtresHTML
});
```

**Source de données** : `obtenirToutesLesGrillesBibliothequeSync()` lit la clé
`bibliothequeGrilles` (NON namespacée, partagée entre tous les trimestres).

**Filtrage actuel** (Section 2) : par discipline + recherche textuelle.

**Badge visuel** : `BibliothequeUI.genererBadgeSource(item, itemsLocaux)` produit
3 variantes : `Locale` / `Bibliothèque` / `Retirée`. **Point d'extension naturel**
pour ajouter un badge `Démo`.

### 2.2 Comment l'utilisateur sélectionne une grille pour une production

Distinct de la bibliothèque : la sélection au moment d'attribuer une grille à
une production se fait probablement via un **dropdown ou une carte cliquable**
ailleurs dans `productions.js` ou `evaluation.js`. **À auditer en Phase 2.1**
si on adopte l'option B/C ci-dessus.

### 2.3 Extension proposée (POC Phase 2.1)

**Option recommandée** : étendre `BibliothequeUI.creerModal()` pour accepter
une **3e section optionnelle** « Démo », alimentée par
`db.getSync(cleDemo('bibliothequeGrilles'))` ou
`db.getSync(cleDemo('grillesTemplates'))` selon convention.

```js
BibliothequeUI.creerModal({
    modalId: 'modalBibliothequeGrilles',
    titre: 'Bibliothèque de grilles',
    // Sections existantes
    titreSection1: 'Grilles dans la barre latérale',
    titreSection2: 'Grilles disponibles à ajouter',
    // NOUVEAU : section démo, lecture seule
    titreSection3Demo: 'Démo (par Demo Labo Codex)',
    contenuSection3Demo: cartesDemoLectureSeule,
    cartesDemoActions: [
        { label: 'Prendre comme modèle', action: 'forkGrilleDemo', param: '<id>' }
    ]
});
```

Ou, plus minimaliste : ajouter un **filtre source** dans la Section 2
(`Local` / `Démo`) sans nouvelle section.

**Décision Phase 2.1** à prendre avec Grégoire.

---

## 3. Pattern partagé — entités avec module `*-bibliotheque.js`

**Grille, Échelle, Cartouche, Production, Pratique** suivent toutes le même
pattern. Une fois le POC Grille validé, la propagation à Échelle/Cartouche
est triviale (copie de signature).

**Production** est un cas hybride : elle a une modale (comme grille) MAIS
elle est aussi exposée via un `<select id="selectProduction1">` au moment
d'évaluer. Les deux UIs devront afficher la section Démo.

**Pratique** est le cas le plus particulier : sa sélection se fait dans la
config (Réglages › Pratique), pas via un sélecteur classique. À traiter en
dernier.

---

## 4. Pattern à créer — entités sans module `*-bibliotheque.js`

**Trimestre, Cours, Enseignant, Groupe d'étudiants, Horaire, Groupe-cours**
utilisent des `<select>` HTML natifs.

**Option A — `<optgroup>`** (rapide) :
```html
<select id="v2-selectCours">
    <optgroup label="Mes documents">
        <option value="cours-1">601-101-MQ — Écriture et littérature</option>
        <option value="cours-2">601-102-MQ — Littérature et imaginaire</option>
    </optgroup>
    <optgroup label="Démo (par Demo Labo Codex)">
        <option value="demo-cours-1" disabled>Démo : 601-101-MQ — Écriture et littérature</option>
    </optgroup>
</select>
```

L'attribut `disabled` empêche la sélection directe d'un item démo (cohérent
avec l'interdiction des références mixtes, plan §3.4). Au clic ou hover, on
peut afficher un message « Pour utiliser cet exemple, fork-le d'abord ».

**Option B — composant réutilisable** : créer `SelectorAvec2Sections` dans
un nouveau module `js/selecteur-2-sections.js`, plus propre mais plus
de travail.

**Recommandation** : Option A pour Phase 2 (consistant avec l'esprit zéro-dette
— on étend ce qui existe), Option B si patterns convergent à l'usage.

---

## 5. Stratégie de propagation Phase 2

### 5.1 POC Phase 2.1 — Grille seule

1. Décision conceptuelle : étendre `BibliothequeUI` à 3 sections (recommandé)
   ou ajouter filtre source dans Section 2.
2. Implémenter dans `bibliotheque-ui.js` (~50-100 l. ajoutées) + adapter
   `grilles.js` (~20-50 l. modifiées).
3. Étendre `BibliothequeUI.genererBadgeSource()` avec le badge `Démo`.
4. Tester en local : section Démo visible quand toggle « Données démo » coché.

**Critères de validation POC** :
- [ ] Section Démo apparaît dans la modale Bibliothèque grilles avec ≥1 item.
- [ ] Items démo affichent le badge `Démo` distinctif (couleur différente).
- [ ] Bouton « Prendre comme modèle » visible mais non fonctionnel (Phase 3).
- [ ] Mes propres grilles inchangées dans Section 1.

### 5.2 Propagation Phase 2.2 — Échelle + Cartouche (BibliothequeUI)

Après POC validé, propagation triviale aux 2 modules consommateurs identiques.

### 5.3 Propagation Phase 2.3 — Production (BibliothequeUI + dropdown)

Modale identique à grille. Plus dropdown `selectProduction1` à adapter
(option A = optgroup).

### 5.4 Propagation Phase 2.4 — 5 dropdowns natifs (Trimestre, Cours, Enseignant, Horaire, Groupe-cours)

Refactoriser le rendu pour produire `<optgroup>` selon source. Helper commun
recommandé pour éviter la duplication entre 5 modules.

### 5.5 Propagation Phase 2.5 — Groupe d'étudiants

Cas particulier (sélecteur dans `evaluation.js`). À auditer plus en détail
au moment où on l'aborde.

### 5.6 Propagation Phase 2.6 — Pratique

Cas particulier (config). UI dédiée à concevoir.

---

## 6. Risques identifiés

- **Confusion bibliothèque vs sélecteur** : §0 — à clarifier avec Grégoire avant
  Phase 2.1.
- **Données démo invisibles dans 5 entités** : actuellement, `demo-namespace.js`
  initialise `demo_listeCours`, `demo_enseignants`, etc. mais aucun consommateur
  n'expose. Le POC sur Grille ne testera donc qu'une partie du flow — il faudra
  attendre Phase 2.4 pour valider le pattern dropdown.
- **Cohérence visuelle** : 11 sélecteurs avec 2 sections devront avoir la
  MÊME identité visuelle (badge Démo cohérent, espacement, vocabulaire).
  Le design system (`design-system.html`) devra documenter le badge Démo.
- **Performance modale** : 3 sources × N items risque d'allonger le rendu si
  certains datasets démo grossissent. Limite raisonnable : ≤20 items démo
  par entité.

---

## 7. Helpers déjà en place (réutilisables)

- `window.cle('xxx')` — clé namespacée trimestre actif
- `window.cleDemo('xxx')` — clé namespace démo (livré 21 avril matin)
- `BibliothequeUI.creerModal()` — composant générique (à étendre)
- `BibliothequeUI.genererBadgeSource()` — badge source (à étendre avec `Démo`)
- `BibliothequeUI.renderCarteSelection()` / `renderCarteDisponible()` — rendu
  carte (à compléter avec `renderCarteDemo()` lecture seule + bouton « Prendre
  comme modèle »)

---

## 8. Décisions à prendre avant Phase 2.1

| # | Question | Recommandation |
|---|---|---|
| 1 | Adapter bibliothèques (modales) ou sélecteurs d'usage (dropdowns) ou les deux ? | **Les deux**, en commençant par bibliothèque Grille (POC) |
| 2 | Pour bibliothèque : 3e section dédiée ou filtre source dans Section 2 ? | **3e section dédiée** (cohérent avec le mockup du plan §3.1) |
| 3 | Pour dropdowns : `<optgroup>` natif ou composant custom ? | **`<optgroup>`** (Option A, plus simple, zéro nouveau composant) |
| 4 | Badge « Démo » : variante visuelle (couleur) ou texte explicite (« Demo Labo Codex ») ? | **Les deux** : couleur distincte + libellé court (« Démo ») |
| 5 | Bouton « Prendre comme modèle » : visible mais non fonctionnel en Phase 2, ou attendre Phase 3 ? | **Visible** mais avec alert « Phase 3 à venir » — laisse tester l'UI |

---

*Fin de l'audit Phase 2.0. Document à retirer en Phase 6 documentation.*
