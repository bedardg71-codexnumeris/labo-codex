# Plan de réorganisation de la navigation

> **Référence** : `architecture-navigation-actuelle (2 avril 2026).txt`
> **Date** : 2 avril 2026, 21h30
> **Version de départ** : Beta 99.02 (Build 0402-1655)
> **Statut** : Plan validé, implémentation à venir
> **Mise à jour 21h30** : Ajout inventaire réel des références, Phase 2.5 (CSS), stratégie de commits, règles de faux positifs, estimation d'effort révisée. Issue de l'audit de faisabilité par Claude Code.

---

## Principe

Le mécanisme de navigation ne change PAS :
`config.js` (données) → `navigation.js` (logique) → `index.html` (rendu)

On modifie uniquement les **données** (IDs, libellés, regroupements) et on **déplace des blocs HTML** d'une section-conteneur à une autre.

---

## Sessions prévues

| Session | Phases | Contenu | Effort estimé |
|---------|--------|---------|---------------|
| **Session 1** | 1 → 3 | Fondations : config.js, HTML, CSS, navigation.js | ~4-5h |
| **Session 2** | 4 → 6 | Références JS (~28 fichiers), noms_stables.json, boutons nav | ~3-4h |
| **Session 3** | 7 | Validation exhaustive + corrections | ~2-3h |

**Effort total estimé** : 9-12h de travail effectif, réparties sur 3 sessions.

**Stratégie de commits** : Un commit par phase terminée (pas par session). Permet de revenir en arrière phase par phase si un problème est détecté. Chaque commit est testable indépendamment sauf la Phase 1 (config.js seul casse la nav — committer avec Phase 2).

---

## Phase 0 — Cartographie des IDs

### Sections principales

| # | Actuel | Nouveau | Action |
|---|--------|---------|--------|
| 1 | `accueil` | `accueil` | + 3 sous-sections |
| 2 | `tableau-bord` | `apercu` | Renommé, section plate (sans sous-nav) |
| 3 | *(nouveau)* | `structure` | Créé (absorbe planification + matériel pédagogique) |
| 4 | *(nouveau)* | `contexte` | Créé (absorbe trimestre + calendrier + pratiques + bilan) |
| 5 | `presences` | `suivi` | Renommé + réorganisé |
| 6 | `evaluations` | `evaluations` | Aperçu retiré, sinon inchangé |
| 7 | `construction` | *(supprimé)* | Contenu → Structure + Contexte |
| 8 | `planification` | *(supprimé)* | Contenu → Structure |
| 9 | `boite-outils` | `boite-outils` | Allégé (perd Bilan) |
| 10 | `aide` | `aide` | Inchangé |
| 11 | `reglages` | `reglages` | Allégé (perd Trimestre) |

### Sous-sections — Correspondances complètes

| Ancien ID complet | Nouveau ID complet | Type de changement |
|---|---|---|
| *(vide)* | `accueil-decouvrir` | **Nouveau** |
| *(vide)* | `accueil-parcourir` | **Nouveau** |
| *(vide)* | `accueil-piloter` | **Nouveau** |
| `tableau-bord-apercu` | *(section plate `apercu`)* | Contenu absorbé dans la section |
| `tableau-bord-liste` | `suivi-liste` | Déplacé + renommé |
| `tableau-bord-profil` | `suivi-profil` | Déplacé + renommé |
| `tableau-bord-interventions` | `suivi-interventions` | Déplacé + renommé |
| `presences-apercu` | *(supprimé)* | Retiré |
| `presences-calendrier` | `contexte-calendrier` | Déplacé |
| `presences-saisie` | `suivi-saisie` | Déplacé |
| `evaluations-apercu` | *(supprimé)* | Retiré |
| `evaluations-importer` | `evaluations-importer` | **Inchangé** |
| `evaluations-liste` | `evaluations-liste` | **Inchangé** |
| `evaluations-annoter` | `evaluations-annoter` | **Inchangé** |
| `evaluations-exporter` | `evaluations-exporter` | **Inchangé** |
| `construction-apercu` | *(supprimé)* | Retiré |
| `construction-productions` | `structure-productions` | Déplacé |
| `construction-grille-criteres` | `structure-grille-criteres` | Déplacé |
| `construction-echelle-performance` | `structure-echelle-performance` | Déplacé |
| `construction-retroactions` | `structure-retroactions` | Déplacé |
| `construction-pratiques-notation` | `contexte-pratiques-notation` | Déplacé |
| `planification-carte` | `structure-carte` | Déplacé |
| `planification-organisateur` | `structure-organisateur` | Déplacé |
| `boite-outils-tirage` | `boite-outils-tirage` | **Inchangé** |
| `boite-outils-modelisation` | `boite-outils-modelisation` | **Inchangé** |
| `boite-outils-bilan` | `contexte-bilan` | Déplacé |
| `aide-*` | `aide-*` | **Inchangé** (6 sous-sections) |
| `reglages-trimestre` | `contexte-trimestre` | Déplacé |
| `reglages-preferences` | `reglages-preferences` | **Inchangé** |
| `reglages-depistage` | `reglages-depistage` | **Inchangé** |
| `reglages-donnees` | `reglages-donnees` | **Inchangé** |
| `reglages-a-propos` | `reglages-a-propos` | **Inchangé** |

### Résumé quantitatif

- Sous-sections **inchangées** : 16 (évaluations 4, boîte-outils 2, aide 6, réglages 4)
- Sous-sections **déplacées/renommées** : 12
- Sous-sections **supprimées** (Aperçus) : 4
- Sous-sections **nouvelles** : 3 (Accueil)

---

## Inventaire des références à modifier (audit du 2 avril 21h30)

Comptage exhaustif par grep dans tout le codebase :

| ID à renommer | JS (fichiers) | index.html | styles.css | **Total** |
|---|---|---|---|---|
| `tableau-bord*` | 72 (22 fichiers) | 23 | 1 | **96** |
| `construction-*` | 53 (12 fichiers) | 13 | 0 | **66** |
| `presences-*` | 38 (11 fichiers) | 12 | 0 | **50** |
| `reglages-trimestre` | 28 (10 fichiers) | 4 | **82** | **114** |
| `planification-*` | 20 (10 fichiers) | 8 | 6 | **34** |
| `boite-outils-bilan` | 1 (1 fichier) | 1 | 0 | **2** |
| **TOTAL** | **212** | **61** | **89** | **~362** |

### Fichiers les plus touchés (top 10)

| Fichier | Occurrences | Commentaire |
|---|---|---|
| `styles.css` | ~89 | Dont **82 pour `reglages-trimestre`** — angle mort du plan initial |
| `navigation.js` | ~44 | Couvert par Phase 3 |
| `aide-contextuelle-contenu.js` | ~33 | Mappings clé→contenu |
| `index.html` | ~61 | Couvert par Phase 2 |
| `profil-etudiant.js` | ~9 | Dont anti-réentrance profil |
| `parcours-apprentissage.js` | ~14 | Jalons de navigation |
| `guidage-demo.js` | ~14 | Séquences de guidage |
| `saisie-presences.js` | ~11 | Références croisées |
| `trimestre-v2.js` | ~7 | `reglages-trimestre` → `contexte-trimestre` |
| `primo-validation-champs.js` | ~8 | Dont 6 `reglages-trimestre` |

---

## Phase 1 — `config.js` : nouveau `configurationsOnglets`

**Fichier** : `js/config.js`

Remplacer l'objet `configurationsOnglets` par :

```javascript
const configurationsOnglets = {
    'accueil': [
        { id: 'decouvrir', label: 'Découvrir' },
        { id: 'parcourir', label: 'Parcourir' },
        { id: 'piloter', label: 'Piloter' }
    ],
    'apercu': [],
    'structure': [
        { id: 'carte', label: 'Alignement pédagogique' },
        { id: 'organisateur', label: 'Plan de la leçon' },
        { id: 'productions', label: 'Productions étudiantes' },
        { id: 'grille-criteres', label: 'Grilles de critères' },
        { id: 'echelle-performance', label: 'Échelles de performance' },
        { id: 'retroactions', label: 'Cartouches de rétroaction' }
    ],
    'contexte': [
        { id: 'trimestre', label: 'Trimestre' },
        { id: 'calendrier', label: 'Vue calendaire' },
        { id: 'pratiques-notation', label: 'Pratiques de notation' },
        { id: 'bilan', label: 'Bilan réflexif' }
    ],
    'suivi': [
        { id: 'liste', label: 'Liste des élèves' },
        { id: 'saisie', label: 'Saisie des présences' },
        { id: 'profil', label: 'Profils individuels' },
        { id: 'interventions', label: 'Interventions' }
    ],
    'evaluations': [
        { id: 'importer', label: 'Préparer et importer' },
        { id: 'liste', label: 'Liste des évaluations' },
        { id: 'annoter', label: 'Annoter et évaluer' },
        { id: 'exporter', label: 'Exporter et archiver' }
    ],
    'boite-outils': [
        { id: 'tirage', label: 'Tirage au sort' },
        { id: 'modelisation', label: 'Modélisation' }
    ],
    'aide': [
        { id: 'introduction', label: 'Introduction' },
        { id: 'configuration', label: 'Configuration' },
        { id: 'formation', label: 'Formation et démonstration' },
        { id: 'utilisation', label: 'Utilisation hebdomadaire' },
        { id: 'consultation', label: 'Consultation' },
        { id: 'reference', label: 'Référence rapide' }
    ],
    'reglages': [
        { id: 'preferences', label: 'Préférences' },
        { id: 'depistage', label: 'Dépistage' },
        { id: 'donnees', label: 'Données' },
        { id: 'a-propos', label: 'À propos' }
    ]
};
```

**Aussi dans config.js** : changer `let sectionActive = 'tableau-bord';` → `let sectionActive = 'apercu';`

---

## Phase 2 — `index.html` : réorganiser les blocs HTML

### Ordre des opérations

1. **Créer** les nouveaux conteneurs de section :
   - `<div class="section" id="section-apercu">` (reprend le contenu de `tableau-bord-apercu`)
   - `<div class="section" id="section-structure">` (nouveau conteneur)
   - `<div class="section" id="section-contexte">` (nouveau conteneur)
   - `<div class="section" id="section-suivi">` (nouveau conteneur)

2. **Déplacer** les blocs `<div class="sous-section">` :
   - `tableau-bord-apercu` → contenu intégré directement dans `section-apercu` (sans wrapper sous-section)
   - `tableau-bord-liste` → dans `section-suivi`, renommer ID en `suivi-liste`
   - `tableau-bord-profil` → dans `section-suivi`, renommer ID en `suivi-profil`
   - `tableau-bord-interventions` → dans `section-suivi`, renommer ID en `suivi-interventions`
   - `presences-calendrier` → dans `section-contexte`, renommer ID en `contexte-calendrier`
   - `presences-saisie` → dans `section-suivi`, renommer ID en `suivi-saisie`
   - `construction-productions` → dans `section-structure`, renommer ID en `structure-productions`
   - `construction-grille-criteres` → dans `section-structure`, renommer ID en `structure-grille-criteres`
   - `construction-echelle-performance` → dans `section-structure`, renommer ID en `structure-echelle-performance`
   - `construction-retroactions` → dans `section-structure`, renommer ID en `structure-retroactions`
   - `construction-pratiques-notation` → dans `section-contexte`, renommer ID en `contexte-pratiques-notation`
   - `planification-carte` → dans `section-structure`, renommer ID en `structure-carte`
   - `planification-organisateur` → dans `section-structure`, renommer ID en `structure-organisateur`
   - `reglages-trimestre` → dans `section-contexte`, renommer ID en `contexte-trimestre`
   - `boite-outils-bilan` → dans `section-contexte`, renommer ID en `contexte-bilan`

3. **Supprimer** les conteneurs vides :
   - `section-tableau-bord` (vidé de ses sous-sections)
   - `section-presences` (vidé)
   - `section-construction` (vidé)
   - `section-planification` (vidé)

4. **Supprimer** les sous-sections Aperçu :
   - `presences-apercu`
   - `evaluations-apercu`
   - `construction-apercu`

5. **Ajouter** les 3 nouvelles sous-sections dans `section-accueil` :
   - `accueil-decouvrir`
   - `accueil-parcourir`
   - `accueil-piloter`
   (Contenu à fournir par Grégoire — déjà défini selon lui)

6. **Mettre à jour les boutons** de la barre de navigation principale :
   - `data-onglet="tableau-bord"` → `data-onglet="apercu"` + changer libellé
   - Ajouter `data-onglet="structure"` et `data-onglet="contexte"`
   - `data-onglet="presences"` → `data-onglet="suivi"`
   - Retirer les boutons `construction` et `planification`

### Localisation dans index.html (repères actuels)

| Conteneur | Ligne approx. |
|---|---|
| `section-tableau-bord` | ~3874 |
| `section-presences` | ~4417 |
| `section-evaluations` | ~4550 |
| `section-construction` | ~5107 |
| `section-planification` | ~7059 |
| `section-boite-outils` | (après planification) |
| Boutons navigation principale | (en-tête, avant sections) |

**Commit** : Phases 1+2 ensemble (config.js seul casserait la nav).

---

## Phase 2.5 — `styles.css` : renommage des sélecteurs CSS (Session 1)

**Problème identifié par l'audit** : Le plan initial ne couvrait pas le CSS. Or `styles.css` contient **89 occurrences** d'anciens IDs dans des sélecteurs, dont 82 pour `reglages-trimestre` seul.

### 2.5a. `reglages-trimestre` → `contexte-trimestre` (82 occurrences)

Sélecteurs ciblés : `#reglages-trimestre`, `.reglages-trimestre`, et toute règle CSS contenant cet ID.

**Procédure** :
1. `grep -n 'reglages-trimestre' styles.css` — inventaire complet
2. Remplacement global `reglages-trimestre` → `contexte-trimestre` dans styles.css
3. Vérification visuelle : ouvrir la section Trimestre (qui sera dans Contexte) en mode sombre ET clair

### 2.5b. `planification-` dans CSS (6 occurrences)

**ATTENTION** : Ces 6 occurrences sont probablement des **variables CSS** (`--planification-bg`, `--calendrier-planification-bordure`) et non des sélecteurs d'ID de navigation. Les variables CSS de design **ne doivent PAS être renommées** — elles nomment un concept visuel, pas une section de nav.

**Procédure** :
1. `grep -n 'planification' styles.css` — vérifier chaque occurrence
2. Si c'est un sélecteur d'ID (ex: `#planification-carte`) → renommer
3. Si c'est une variable CSS (ex: `--planification-bg`) → **ne pas toucher**

### 2.5c. `tableau-bord` dans CSS (1 occurrence)

Renommer le sélecteur unique.

### 2.5d. Grep de contrôle

Après tous les remplacements CSS :
```
grep -n 'tableau-bord\|#construction-\|#presences-\|#reglages-trimestre\|#planification-carte\|#planification-organisateur\|#boite-outils-bilan' styles.css
```
Résultat attendu : zéro ligne.

**Commit** : Phase 2.5 seule (CSS pur, testable indépendamment).

---

## Phase 3 — `navigation.js`

### 3a. Mettre à jour `TOOLTIPS_SOUS_NAV`

Nouveau mapping (remplace l'existant) :

```javascript
const TOOLTIPS_SOUS_NAV = {
    // Accueil
    'accueil-decouvrir': 'nav-acc-decouvrir',
    'accueil-parcourir': 'nav-acc-parcourir',
    'accueil-piloter': 'nav-acc-piloter',
    // Aperçu : pas de sous-nav
    // Structure
    'structure-carte': 'nav-str-alignement',
    'structure-organisateur': 'nav-str-organisateur',
    'structure-productions': 'nav-str-productions',
    'structure-grille-criteres': 'nav-str-grilles',
    'structure-echelle-performance': 'nav-str-echelles',
    'structure-retroactions': 'nav-str-cartouches',
    // Contexte
    'contexte-trimestre': 'nav-ctx-trimestre',
    'contexte-calendrier': 'nav-ctx-calendrier',
    'contexte-pratiques-notation': 'nav-ctx-pratiques',
    'contexte-bilan': 'nav-ctx-bilan',
    // Suivi
    'suivi-liste': 'nav-suivi-liste',
    'suivi-saisie': 'nav-suivi-saisie',
    'suivi-profil': 'nav-suivi-profil',
    'suivi-interventions': 'nav-suivi-interventions',
    // Évaluations (inchangé sauf retrait aperçu)
    'evaluations-importer': 'nav-eval-importer',
    'evaluations-liste': 'nav-eval-liste',
    'evaluations-annoter': 'nav-eval-annoter',
    'evaluations-exporter': 'nav-eval-exporter',
    // Boîte à outils (inchangé)
    'boite-outils-tirage': 'nav-bao-tirage',
    'boite-outils-modelisation': 'nav-bao-modelisation',
    // Aide (inchangé — ajouter si tooltips manquants)
    // Réglages (inchangé sauf retrait trimestre)
    'reglages-preferences': 'nav-reg-preferences',
    'reglages-depistage': 'nav-reg-depistage',
    'reglages-donnees': 'nav-reg-donnees',
    'reglages-a-propos': 'nav-reg-apropos'
};
```

### 3b. Mettre à jour le `switch` dans `afficherSousSection()`

Renommer chaque `case` selon la cartographie :

| Ancien case | Nouveau case |
|---|---|
| `'tableau-bord-liste'` | `'suivi-liste'` |
| `'tableau-bord-apercu'` | *(retiré — section plate)* |
| `'tableau-bord-profil'` | *(géré hors switch, voir bloc profil)* |
| `'presences-apercu'` | *(retiré)* |
| `'presences-calendrier'` | `'contexte-calendrier'` |
| `'presences-saisie'` | *(pas de case actuellement)* |
| `'construction-apercu'` | *(retiré)* |
| `'construction-productions'` | `'structure-productions'` |
| `'construction-grille-criteres'` | `'structure-grille-criteres'` |
| `'construction-echelle-performance'` | `'structure-echelle-performance'` |
| `'construction-retroactions'` | `'structure-retroactions'` |
| `'construction-pratiques-notation'` | `'contexte-pratiques-notation'` |
| `'planification-carte'` | `'structure-carte'` |
| `'planification-organisateur'` | `'structure-organisateur'` |
| `'reglages-trimestre'` | `'contexte-trimestre'` |
| `'evaluations-apercu'` | *(retiré)* |
| `'reglages-apercu'` | *(retiré si existant)* |
| *(nouveau)* | `'contexte-bilan'` (appel `initialiserBilanReflexif` ou équivalent) |

### 3c. Bloc profil (hors switch, lignes ~587-621)

Changer `idSousSection === 'tableau-bord-profil'` → `idSousSection === 'suivi-profil'`
Changer `idSousSection === 'tableau-bord-liste'` → `idSousSection === 'suivi-liste'`

**Point de vigilance anti-réentrance** : Ce bloc utilise `window._profilAutoChargement` pour empêcher les boucles infinies (`afficherProfilComplet()` rappelle `afficherSousSection()`). Vérifier que `profil-etudiant.js` ne rappelle pas `afficherSousSection('tableau-bord-profil')` avec l'ancien ID — sinon la garde ne matcherait plus et on risque une boucle infinie.

### 3d. Section par défaut dans `afficherSection()`

Si `afficherAccueil` est appelé pour la section `accueil`, vérifier que `apercu` (anciennement `tableau-bord`) reste la section par défaut au chargement.

### 3e. Nettoyage modelisation

Le check `sousSectionActive === 'boite-outils-modelisation'` reste inchangé.

**Commit** : Phase 3 seule.

---

## Phase 4 — Références dans les fichiers JS (Session 2)

### Fichiers à haute priorité (5+ références)

| Fichier | Occurrences | Références principales | Action |
|---|---|---|---|
| `aide-contextuelle-contenu.js` | ~33 | Mappings par sous-section | Renommer les clés |
| `parcours-apprentissage.js` | ~14 | Jalons de navigation | Renommer les cibles |
| `guidage-demo.js` | ~14 | Séquences de guidage | Renommer les étapes |
| `saisie-presences.js` | ~11 | `presences-saisie` → `suivi-saisie` | Renommer |
| `profil-etudiant.js` | ~9 | `tableau-bord-profil` → `suivi-profil` | Renommer (voir vigilance 4a) |
| `primo-validation-champs.js` | ~8 | Check trimestre (6 `reglages-trimestre`) | Renommer |
| `tableau-bord-apercu.js` | ~7 | Références internes `tableau-bord` | Renommer (voir vigilance 4b) |
| `trimestre-v2.js` | ~7 | `reglages-trimestre` → `contexte-trimestre` | Renommer |
| `etudiants.js` | ~7 | Références tableau-bord | Renommer |
| `modes.js` | ~4 | Références aux sections | Renommer |
| `main.js` | ~4 | Initialisation, dispatcher | Renommer |
| `accueil.js` | ~4 | Raccourcis de navigation | Renommer |

### Fichiers à priorité standard (1-4 références)

| Fichier | Références |
|---|---|
| `guidage.js` | Sections de guidage (5 `reglages-trimestre`) |
| `rapport-bug.js` | Section active dans rapport |
| `donnees-v2.js` | Références construction (5 occ.) |
| `donnees-demo.js` | 2 références tableau-bord |
| `productions.js` | Références construction |
| `bilan-reflexif.js` | `boite-outils-bilan` → `contexte-bilan` |
| `planification-carte.js` | `naviguerVers()` call |
| `interventions.js` | 2 références (tableau-bord + presences) |
| `evaluation.js` | 2 références tableau-bord |
| `indices.js` | 2 références tableau-bord |
| `calendrier-vue.js` | Références presences (4 occ.) + planification (1 occ.) |
| `organisateur.js` | 3 références planification |
| `primo-questions.js` | Références construction |
| `cours.js`, `pratiques.js`, `pratiques-materiel.js`, `tooltips-contenu.js`, `presences-apercu.js`, `planification.js`, `planification-bibliotheque.js`, `tampons-bibliotheque.js` | 1-2 références chacun |

### Points de vigilance Phase 4

#### 4a. Anti-réentrance dans `profil-etudiant.js`

`profil-etudiant.js` contient 8 références à `tableau-bord`. Certaines appellent probablement `afficherSousSection('tableau-bord-profil')` ou `naviguerVers('tableau-bord', 'profil')`. Ces appels **doivent** être renommés, sinon la garde anti-réentrance dans `navigation.js` (Phase 3c) ne matchera plus → risque de boucle infinie.

#### 4b. Fichier `tableau-bord-apercu.js`

Le **nom du fichier** ne change pas (on ne renomme pas les fichiers JS). Mais ses 7 références internes à `tableau-bord` (comme ID de section/sous-section) doivent être mises à jour. Vérifier que la fonction d'initialisation qu'il expose est correctement appelée depuis le nouveau `switch` de `afficherSousSection()` (Phase 3b).

### Stratégie de renommage

Pour chaque fichier : rechercher les anciens IDs et les remplacer par les nouveaux. Ordre de remplacement recommandé (du plus spécifique au plus générique pour éviter les faux positifs) :

1. `'tableau-bord-interventions'` → `'suivi-interventions'`
2. `'tableau-bord-profil'` → `'suivi-profil'`
3. `'tableau-bord-liste'` → `'suivi-liste'`
4. `'tableau-bord-apercu'` → *(supprimer la référence ou adapter)*
5. `'construction-pratiques-notation'` → `'contexte-pratiques-notation'`
6. `'construction-echelle-performance'` → `'structure-echelle-performance'`
7. `'construction-grille-criteres'` → `'structure-grille-criteres'`
8. `'construction-productions'` → `'structure-productions'`
9. `'construction-retroactions'` → `'structure-retroactions'`
10. `'construction-apercu'` → *(supprimer ou adapter)*
11. `'planification-carte'` → `'structure-carte'`
12. `'planification-organisateur'` → `'structure-organisateur'`
13. `'presences-calendrier'` → `'contexte-calendrier'`
14. `'presences-saisie'` → `'suivi-saisie'`
15. `'presences-apercu'` → *(supprimer ou adapter)*
16. `'reglages-trimestre'` → `'contexte-trimestre'`
17. `'boite-outils-bilan'` → `'contexte-bilan'`
18. Section `'tableau-bord'` → `'apercu'` (⚠️ attention aux faux positifs)
19. Section `'presences'` → `'suivi'` (⚠️ attention aux faux positifs)
20. Section `'construction'` → redirigé selon contexte
21. Section `'planification'` → redirigé selon contexte

### Règles de faux positifs pour les sections génériques (items 18-21)

Les items 18-21 sont les plus risqués. Voici les contextes **à renommer** vs **à ne pas toucher** :

| Pattern | Renommer ? | Exemple |
|---|---|---|
| `afficherSection('presences')` | OUI — c'est une section nav | → `'suivi'` |
| `naviguerVers('presences', ...)` | OUI — c'est une section nav | → `'suivi'` |
| `data-onglet="presences"` | OUI — c'est un attribut nav | → `'suivi'` |
| `sectionActive === 'presences'` | OUI — c'est l'état nav | → `'suivi'` |
| `cle('presences')` | **NON** — c'est une clé de données | Laisser tel quel |
| `obtenirDonneesSelonMode('presences')` | **NON** — c'est une clé de données | Laisser tel quel |
| `db.getSync(cle('presences'))` | **NON** — c'est du storage | Laisser tel quel |
| `// construction de la grille` | **NON** — c'est un commentaire | Laisser tel quel |
| `'construction'` dans un switch nav | OUI — section nav | Adapter selon contexte |
| `construction` comme nom de variable | **NON** — c'est du code | Laisser tel quel |

**Méthode recommandée** : Ne pas faire de search-and-replace global pour les items 18-21. Procéder fichier par fichier, occurrence par occurrence, en vérifiant le contexte. Les items 1-17 (sous-sections complètes) sont safe pour un remplacement global car ils sont univoques.

**Commit** : Phase 4 seule (après test rapide : navigation entre toutes les sections sans erreur console).

---

## Phase 5 — `noms_stables.json` (Session 2)

Mettre à jour :
- `ids_html.sections` : ajouter `section-apercu`, `section-structure`, `section-contexte`, `section-suivi` ; retirer `section-tableau-bord`, `section-presences` (les anciens)
- `ids_html.sous_sections` : réécrire avec les nouveaux IDs
- `variables_globales` : vérifier que tout est à jour
- `fonctions_javascript` : pas de changement (les fonctions ne sont pas renommées)

**Commit** : Phases 5+6 ensemble (petites modifications couplées).

---

## Phase 6 — Boutons barre principale (Session 2)

### Nouvelle barre (9 boutons, même nombre)

| # | data-onglet | Libellé | Type | Icône |
|---|---|---|---|---|
| 1 | `accueil` | Accueil | Icône | maison (inchangé) |
| 2 | `apercu` | Aperçu | Icône | graphique (reprend celle de Tableau de bord) |
| 3 | `structure` | Structure | Texte | **À définir** |
| 4 | `contexte` | Contexte | Texte | **À définir** |
| 5 | `suivi` | Suivi | Texte | Texte |
| 6 | `evaluations` | Évaluations | Texte | Texte (inchangé) |
| 7 | `boite-outils` | Boîte à outils | Icône | toolbox (inchangé) |
| 8 | `aide` | Aide | Icône | inchangé |
| 9 | `reglages` | Réglages | Icône | inchangé |

**Question ouverte** : Icônes pour Structure et Contexte à déterminer avec Grégoire.

---

## Phase 7 — Validation (Session 3)

Session dédiée à la validation. Prévoir 2-3h — chaque point de la checklist requiert un test manuel dans Safari `file://`.

### 7a. Grep de contrôle (anciens IDs résiduels)

Exécuter **avant** les tests manuels pour attraper les oublis évidents :

```bash
# Sous-sections (doivent retourner zéro — remplacements univoques)
grep -rn "tableau-bord-apercu\|tableau-bord-liste\|tableau-bord-profil\|tableau-bord-interventions" js/*.js index.html
grep -rn "construction-apercu\|construction-productions\|construction-grille\|construction-echelle\|construction-retroactions\|construction-pratiques" js/*.js index.html
grep -rn "planification-carte\|planification-organisateur" js/*.js index.html
grep -rn "presences-apercu\|presences-calendrier\|presences-saisie" js/*.js index.html
grep -rn "reglages-trimestre" js/*.js index.html styles.css
grep -rn "boite-outils-bilan" js/*.js index.html

# Sections (vérification manuelle — faux positifs possibles)
grep -rn "'tableau-bord'" js/*.js index.html
grep -rn "'construction'" js/*.js index.html
grep -rn "'planification'" js/*.js index.html
```

Résultat attendu : zéro pour les sous-sections, et uniquement des faux positifs documentés pour les sections.

### 7b. Checklist fonctionnelle

**Navigation de base** :
- [ ] Chaque section s'affiche correctement (9 sections)
- [ ] Chaque sous-section s'affiche et son module s'initialise (30 sous-sections)
- [ ] La sous-navigation se génère correctement pour chaque section
- [ ] Les sections plates (Accueil quand vide, Aper��u) n'affichent pas de sous-nav
- [ ] `naviguerVers()` fonctionne avec les nouveaux IDs (tester depuis la console)
- [ ] Section par défaut au chargement = `apercu`

**Liens internes et guidage** :
- [ ] Les raccourcis de l'accueil naviguent au bon endroit
- [ ] L'aide contextuelle pointe sur les bonnes sections
- [ ] Le guidage démo fonctionne (séquence complète)
- [ ] Le parcours d'apprentissage fonctionne (tous les jalons)
- [ ] Les boutons « retour » ou liens croisés entre modules arrivent à la bonne sous-section

**Anti-réentrance profil** :
- [ ] Cliquer sur Suivi → Profil charge le dernier profil consulté (ou le premier étudiant)
- [ ] Pas de boucle infinie dans la console (vérifier l'absence de stack overflow)

**Visuel** :
- [ ] Mode sombre : toutes les sections lisibles, pas de style cassé
- [ ] Mode clair : idem
- [ ] Section `contexte-trimestre` (ex `reglages-trimestre`) : rendu CSS identique à avant (82 sélecteurs renommés)

**Stabilité** :
- [ ] Aucune erreur dans la console au chargement
- [ ] Aucune erreur dans la console en naviguant entre TOUTES les sections/sous-sections (parcours exhaustif)
- [ ] `rapport-bug.js` capture la bonne section active dans son rapport

**Commit** : Phase 7 ne génère pas de commit (c'est de la validation). Si des corrections sont nécessaires, les committer avec un message descriptif.

---

## Risques identifiés

| # | Risque | Impact | Probabilité | Mitigation |
|---|---|---|---|---|
| R1 | Faux positif dans le renommage de sections génériques (`presences`, `construction`, `planification`) | Casse une fonctionnalité (clé de données renommée) | **Élevée** | Règles de faux positifs documentées en Phase 4. Ne jamais faire de remplacement global pour les items 18-21. |
| R2 | Bloc HTML mal déplacé (coupé au mauvais endroit dans index.html) | Section cassée | Moyenne | Procéder un bloc à la fois, tester après chaque déplacement. Commit Phase 1+2 comme point de retour. |
| R3 | Référence oubliée dans un fichier JS mineur | Erreur console silencieuse | **Élevée** (362 occurrences) | Grep exhaustif Phase 7a. Commit par phase pour isoler les problèmes. |
| R4 | `reglages-trimestre` dans CSS — 82 sélecteurs à renommer | Style de la section Trimestre cassé | Moyenne | Phase 2.5 dédiée. Vérification visuelle obligatoire mode sombre + clair. |
| R5 | Boucle infinie profil (anti-réentrance cassée) | App figée | Faible | Vigilance 4a documentée. Test dédié Phase 7b. |
| R6 | Variables CSS `--planification-*` renommées par erreur | Couleurs/styles cassés ailleurs | Faible | Règle explicite Phase 2.5b : ne pas toucher les variables CSS de design. |
| R7 | Contenu Accueil (découvrir/parcourir/piloter) pas pr��t | Sous-sections vides | Faible | Grégoire dit que c'est défini. Si pas prêt au moment de Phase 2 : placeholder. Ne pas bloquer les 7 autres phases. |
| R8 | Fichier `presences-apercu.js` qui référence l'ancien ID | Erreur à la suppression de la sous-section | Faible | Vérifier si ce fichier a un rôle résiduel après suppression de `presences-apercu`. |

---

## Décisions prises

1. **Aperçu** = section plate, sans sous-navigation (comme Accueil actuellement)
2. **Aperçus supprimés** (4) = retirés sans migration de contenu
3. **Fichiers protégés** = autorisation donnée par Grégoire pour cette réorganisation
4. **Sous-sections Accueil** = contenu déjà défini par Grégoire (à fournir)
5. **Mécanisme** = aucun changement au moteur de navigation

---

## Résumé des commits prévus

| # | Contenu | Fichiers touchés | Testable seul ? |
|---|---|---|---|
| C1 | Phases 1+2 — config.js + HTML restructuré | `config.js`, `index.html` | Oui (nav fonctionne mais anciens IDs dans JS/CSS) |
| C2 | Phase 2.5 — CSS renommé | `styles.css` | Oui (visuel corrig��) |
| C3 | Phase 3 — navigation.js | `navigation.js` | Oui (nav complète, JS secondaires encore anciens) |
| C4 | Phase 4 — Références JS | ~28 fichiers JS | Oui (tout devrait fonctionner) |
| C5 | Phases 5+6 — noms_stables + boutons | `noms_stables.json`, `index.html` | Oui |
| C6+ | Corrections issues de Phase 7 | Variable | Au besoin |

---

**Dernière mise à jour** : 2 avril 2026, 21h30
