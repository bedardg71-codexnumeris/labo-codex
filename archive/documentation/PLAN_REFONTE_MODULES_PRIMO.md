# Plan de refonte : Modules 1 et 2 de Primo

**Date** : 26 décembre 2025
**Version** : Beta 95
**Auteur** : Grégoire Bédard (Labo Codex) avec Claude
**Contexte** : Alignement des wizards Primo avec l'architecture multi-cours Beta 95

---

## Résumé exécutif

Les modules 1 (Créer un groupe-cours) et 2 (Évaluer une production) de l'assistant Primo présentent des incohérences architecturales critiques avec le système multi-trimestres/multi-cours implémenté dans Beta 95. Ce document détaille les problèmes identifiés et propose un plan de correction complet.

---

## Table des matières

1. [Analyse du Module 1](#module-1--créer-un-groupe-cours)
2. [Analyse du Module 2](#module-2--évaluer-une-production)
3. [Architecture cible](#architecture-cible-beta-95)
4. [Plan d'implémentation](#plan-dimplémentation)
5. [Questions à ajouter/modifier](#questions-à-ajoutermodifier)
6. [Transformations de données](#transformations-de-données)
7. [Tests de validation](#tests-de-validation)

---

## Module 1 : Créer un groupe-cours

### Problèmes identifiés

#### 1. Informations manquantes sur le cours

**Situation actuelle** (primo-questions.js:94-145) :
- Question `titre-cours` : demande le titre du cours
- Question `trimestre` : demande la session (Hiver/Été/Automne)
- Question `annee` : demande l'année

**Manquant** :
- ❌ Code du cours (ex: 601-101-MQ)
- ❌ Numéro de groupe (ex: 00094)

**Impact** : Impossible de générer un `coursId` valide selon le format Beta 95.

#### 2. Format de la liste des étudiants

**Situation actuelle** (primo-questions.js:1239-1276) :
```javascript
{
    id: 'etudiants-liste',
    texte: '...DA, Nom, Prénom, Programme par ligne...',
    placeholder: 'Ex:\n1234567,Tremblay,Sophie,506.A0\n2345678,Gagnon,Marc,200.B1',
    transformation: function(valeur) {
        // ...
        etudiants.push({
            da: parts[0],
            nom: parts[1],
            prenom: parts[2],
            programme: parts[3] || '',
            courriel: parts[4] || ''
            // ❌ MANQUANT : groupe
            // ❌ MANQUANT : coursId
        });
    }
}
```

**Format attendu** : DA, Nom, Prénom, Groupe, Programme, Courriel

#### 3. Stockage des données dans le mauvais endroit

**Situation actuelle** :
- Données stockées dans `infoCours` (singleton)
- Questions liées à `{ cle: 'infoCours', champ: 'xxx' }`

**Architecture Beta 95** :
- `listeCours` : Array de tous les cours (multi-cours)
- `infoCours` : Cours actuellement sélectionné (temporaire)

**Format coursId attendu** : `{code}-{session}{annee}-{groupe}`
- Exemple : `601-101-h2026-94`

#### 4. Absence de trimestreId

**Situation actuelle** : Pas de génération automatique de `trimestreId`

**Architecture Beta 95** :
- Format : `{session.toLowerCase()}{annee}`
- Exemple : `h2026` pour Hiver 2026

#### 5. Pas de création dans listeCours

**Situation actuelle** : Les données vont dans `infoCours` directement

**Attendu** : Création d'une entrée dans `listeCours[]` avec :
```javascript
{
    id: "601-101-h2026-94",
    code: "601-101-MQ",           // Nouveau champ
    titre: "Écriture et littérature",
    session: "H",
    annee: "2026",
    trimestreId: "h2026",         // Nouveau champ
    groupe: "00094",              // Nouveau champ
    enseignant: "Prénom",
    courriel: "prenom@cegep.qc.ca",
    actif: true
}
```

---

## Module 2 : Évaluer une production

### Problèmes identifiés

#### 1. Références à des fichiers potentiellement inexistants

**Situation actuelle** (primo-questions.js:1353-1365) :
```javascript
{
    id: 'importer-echelle-idme',
    texte: '...Sélectionne le fichier **test-echelle-idme.json** dans le dossier **materiel-demo**...'
}
```

**Problème** : Les fichiers `test-echelle-idme.json` et `test-grille-srpnf.json` peuvent ne pas exister ou avoir des noms différents.

**Fichiers réels dans materiel-demo/** :
- `echelle-idme.json`
- `grille-srpnf.json`
- `cartouches-srpnf.json`

#### 2. Pas de vérification des prérequis

**Situation actuelle** : Le Module 2 suppose que le Module 1 a été complété

**Problème** : Si l'utilisateur commence directement par le Module 2 :
- Pas de groupe-cours créé
- Pas d'étudiants disponibles
- L'évaluation échouera

#### 3. Dépendance au mode notification sans vérification

**Situation actuelle** (primo-questions.js:1340-1347) :
```javascript
{
    id: 'transition-mode-guide',
    texte: '...Je vais me transformer en **assistant discret**...',
    type: 'action',
    action: 'passerEnModeNotification'
}
```

**Risque** : La fonction `demarrerModeNotification` peut échouer si les données requises ne sont pas présentes.

---

## Architecture cible Beta 95

### Structure des données

```
TRIMESTRE (h2026)
    ├─ id: "h2026"
    ├─ nom: "Hiver 2026"
    ├─ session: "H"
    └─ annee: "2026"
        │
        ↓
COURS (601-101-h2026-94)
    ├─ id: "601-101-h2026-94"
    ├─ code: "601-101-MQ"
    ├─ titre: "Écriture et littérature"
    ├─ groupe: "00094"
    ├─ trimestreId: "h2026"
    └─ enseignant: "Prénom"
        │
        ↓
ÉTUDIANTS (groupeEtudiants[])
    ├─ da: "1234567"
    ├─ nom: "Tremblay"
    ├─ prenom: "Sophie"
    ├─ groupe: "00094"
    ├─ programme: "506.A0"
    └─ coursId: "601-101-h2026-94"
```

### Clés localStorage concernées

| Clé | Type | Description |
|-----|------|-------------|
| `trimestres` | Array | Registre des trimestres |
| `listeCours` | Array | Tous les cours créés |
| `infoCours` | Object | Cours actuellement actif |
| `groupeEtudiants` | Array | Tous les étudiants |

---

## Plan d'implémentation

### Phase 1 : Ajout des questions manquantes (Module 1)

**Fichier** : `js/primo-questions.js`

#### 1.1 Ajouter la question "Code du cours"

**Position** : Après `titre-cours` (ligne 106), avant `trimestre`

```javascript
{
    id: 'code-cours',
    texte: 'Quel est le code du cours ?',
    type: 'text',
    placeholder: 'Ex: 601-101-MQ',
    champsCibles: [
        { cle: 'infoCours', champ: 'code' }
    ],
    validation: {
        requis: true,
        pattern: /^\d{3}-\d{3}(-[A-Z]{2})?$/,
        messageErreur: 'Format attendu : 601-101 ou 601-101-MQ'
    },
    aide: 'Le code officiel du cours tel qu\'il apparaît dans ton horaire.'
}
```

#### 1.2 Ajouter la question "Numéro de groupe"

**Position** : Après `annee` (ligne 145), avant `pratique-notation`

```javascript
{
    id: 'numero-groupe',
    texte: 'Quel est le numéro de ton groupe ?',
    type: 'text',
    placeholder: 'Ex: 00094 ou 94',
    champsCibles: [
        { cle: 'infoCours', champ: 'groupe' }
    ],
    validation: {
        requis: true,
        pattern: /^\d{1,5}$/,
        messageErreur: 'Entrer un numéro de groupe (1 à 5 chiffres)'
    },
    aide: 'Le numéro de groupe tel qu\'il apparaît dans Clara ou ton système de gestion.',
    transformation: function(valeur) {
        // Normaliser en format 5 chiffres avec zéros
        return valeur.padStart(5, '0');
    }
}
```

### Phase 2 : Correction du format liste étudiants

**Fichier** : `js/primo-questions.js`

#### 2.1 Modifier la question `etudiants-methode`

**Lignes** : 1230-1236

```javascript
{
    id: 'etudiants-methode',
    texte: '**Ajout des étudiants**\n\nConsulte le système de gestion des apprentissages de ton établissement pour récupérer la liste de tes élèves.\n\nLe format attendu est : **DA, Nom, Prénom, Groupe, Programme** (séparés par virgules ou tabulations).\n\nSi tu préfères utiliser une liste fictive, tu trouveras un fichier **etudiants-demo.csv** dans le dossier **materiel-demo/**.',
    type: 'instruction',
    champsCibles: [],
    validation: { requis: false }
}
```

#### 2.2 Modifier la question `etudiants-liste`

**Lignes** : 1238-1276

```javascript
{
    id: 'etudiants-liste',
    texte: 'Parfait ! Colle ta liste ici (DA, Nom, Prénom, Groupe, Programme par ligne).',
    type: 'textarea',
    placeholder: 'Ex:\n1234567,Tremblay,Sophie,00094,506.A0\n2345678,Gagnon,Marc,00094,200.B1',
    champsCibles: [
        { cle: 'groupeEtudiants', champ: null }
    ],
    validation: {
        requis: true
    },
    transformation: function(valeur) {
        if (!valeur || valeur.trim() === '') return [];

        const lignes = valeur.split('\n');
        const etudiants = [];

        // Récupérer le coursId depuis infoCours
        const infoCours = db.getSync('infoCours', {});
        const coursId = infoCours.id || null;

        lignes.forEach(ligne => {
            ligne = ligne.trim();
            if (ligne === '') return;

            // Support virgules ou tabulations
            const separateur = ligne.includes('\t') ? '\t' : ',';
            const parts = ligne.split(separateur).map(p => p.trim());

            if (parts.length >= 3) {
                etudiants.push({
                    da: parts[0],
                    nom: parts[1],
                    prenom: parts[2],
                    groupe: parts[3] ? parts[3].padStart(5, '0') : (infoCours.groupe || ''),
                    programme: parts[4] || '',
                    courriel: parts[5] || '',
                    coursId: coursId  // Lien vers le cours
                });
            }
        });

        return etudiants;
    }
}
```

### Phase 3 : Création du cours dans listeCours

**Fichier** : `js/primo-modal.js`

#### 3.1 Ajouter une actionApres pour créer le cours

Après la question `numero-groupe`, ajouter une logique pour créer le cours complet :

```javascript
// Dans la fonction qui traite les réponses après l'étape "numero-groupe"
function creerCoursComplet(reponses) {
    // Générer trimestreId
    const session = reponses['trimestre']; // "Hiver", "Été", "Automne"
    const annee = reponses['annee'];
    const sessionCode = session === 'Hiver' ? 'h' : session === 'Été' ? 'e' : 'a';
    const trimestreId = sessionCode + annee;

    // Générer coursId
    const code = reponses['code-cours'].replace(/-[A-Z]{2}$/, ''); // Retirer suffixe -MQ si présent
    const groupe = reponses['numero-groupe'].padStart(5, '0');
    const coursId = `${code}-${trimestreId}-${groupe.replace(/^0+/, '')}`;

    // Créer l'objet cours
    const nouveauCours = {
        id: coursId,
        code: reponses['code-cours'],
        titre: reponses['titre-cours'],
        session: session.charAt(0).toUpperCase(),
        annee: annee,
        trimestreId: trimestreId,
        groupe: groupe,
        enseignant: reponses['nom-utilisateur'],
        courriel: reponses['courriel-utilisateur'] || '',
        siteWeb: reponses['site-utilisateur'] || '',
        actif: true,
        dateCreation: new Date().toISOString().split('T')[0]
    };

    // Ajouter à listeCours
    const listeCours = db.getSync('listeCours', []);

    // Vérifier si le cours existe déjà
    const index = listeCours.findIndex(c => c.id === coursId);
    if (index >= 0) {
        listeCours[index] = nouveauCours; // Mise à jour
    } else {
        listeCours.push(nouveauCours); // Ajout
    }

    db.setSync('listeCours', listeCours);

    // Définir comme cours actif
    db.setSync('infoCours', nouveauCours);

    // Créer/vérifier le trimestre
    creerTrimestreSiAbsent(trimestreId, session, annee);

    return nouveauCours;
}

function creerTrimestreSiAbsent(trimestreId, session, annee) {
    const trimestres = db.getSync('trimestres', []);

    if (!trimestres.find(t => t.id === trimestreId)) {
        trimestres.push({
            id: trimestreId,
            nom: `${session} ${annee}`,
            session: session.charAt(0).toUpperCase(),
            annee: annee,
            dateCreation: new Date().toISOString().split('T')[0],
            actif: true
        });
        db.setSync('trimestres', trimestres);
    }
}
```

### Phase 4 : Corrections Module 2

**Fichier** : `js/primo-questions.js`

#### 4.1 Corriger les noms de fichiers

**Lignes** : 1353-1365 (importer-echelle-idme)

Remplacer :
- `test-echelle-idme.json` → `echelle-idme.json`
- `test-grille-srpnf.json` → `grille-srpnf.json`

#### 4.2 Ajouter vérification des prérequis

Ajouter une condition `sautSi` pour vérifier que le Module 1 est complété :

```javascript
{
    id: 'transition-mode-guide',
    // ... existing properties ...
    sautSi: function(reponses) {
        // Vérifier si un cours existe
        const infoCours = db.getSync('infoCours', {});
        const etudiants = db.getSync('groupeEtudiants', []);

        if (!infoCours.id || etudiants.length === 0) {
            // Pas de cours/étudiants, afficher message d'erreur
            console.warn('[Primo] Module 2 requiert un groupe-cours configuré');
            return true; // Sauter cette étape
        }
        return false;
    }
}
```

### Phase 5 : Mise à jour de primo-accueil.js

**Fichier** : `js/primo-accueil.js`

#### 5.1 Ajouter avertissement Module 2

Dans `demarrerEvaluation()` (ligne 336), ajouter une vérification :

```javascript
function demarrerEvaluation() {
    // Vérifier prérequis
    const infoCours = db.getSync('infoCours', {});
    const etudiants = db.getSync('groupeEtudiants', []);

    if (!infoCours.id || etudiants.length === 0) {
        alert('Tu dois d\'abord créer un groupe-cours (Module 1) avant de pouvoir évaluer une production.');
        return;
    }

    fermerModalAccueil();
    // ... reste du code
}
```

---

## Questions à ajouter/modifier

### Nouvelles questions (Module 1)

| ID | Position | Type | Description |
|----|----------|------|-------------|
| `code-cours` | Après `titre-cours` | text | Code du cours (601-101-MQ) |
| `numero-groupe` | Après `annee` | text | Numéro de groupe (00094) |

### Questions modifiées (Module 1)

| ID | Modification |
|----|--------------|
| `etudiants-methode` | Texte mis à jour avec nouveau format |
| `etudiants-liste` | Placeholder et transformation mis à jour |

### Questions modifiées (Module 2)

| ID | Modification |
|----|--------------|
| `importer-echelle-idme` | Nom fichier corrigé |
| `importer-grille-srpnf` | Nom fichier corrigé |
| `transition-mode-guide` | Ajout vérification prérequis |

---

## Transformations de données

### Format liste étudiants

**Entrée utilisateur** :
```
1234567,Tremblay,Sophie,00094,506.A0,sophie@email.com
2345678,Gagnon,Marc,00094,200.B1
```

**Sortie transformation** :
```javascript
[
    {
        da: "1234567",
        nom: "Tremblay",
        prenom: "Sophie",
        groupe: "00094",
        programme: "506.A0",
        courriel: "sophie@email.com",
        coursId: "601-101-h2026-94"
    },
    {
        da: "2345678",
        nom: "Gagnon",
        prenom: "Marc",
        groupe: "00094",
        programme: "200.B1",
        courriel: "",
        coursId: "601-101-h2026-94"
    }
]
```

### Génération coursId

**Entrée** :
- Code cours : `601-101-MQ`
- Session : `Hiver`
- Année : `2026`
- Groupe : `94`

**Sortie** : `601-101-h2026-94`

---

## Tests de validation

### Module 1

1. [ ] Question code du cours apparaît après titre
2. [ ] Validation format code (601-101 ou 601-101-MQ)
3. [ ] Question numéro de groupe apparaît après année
4. [ ] Validation format groupe (1-5 chiffres)
5. [ ] Transformation groupe en format 5 chiffres
6. [ ] Liste étudiants avec colonne Groupe
7. [ ] Étudiants créés avec coursId correct
8. [ ] Cours créé dans listeCours
9. [ ] Cours défini comme actif dans infoCours
10. [ ] Trimestre créé si inexistant

### Module 2

1. [ ] Noms de fichiers corrects (sans préfixe test-)
2. [ ] Vérification prérequis bloque si pas de cours
3. [ ] Message d'avertissement approprié
4. [ ] Workflow complet fonctionne après Module 1

---

## Fichiers à modifier

| Fichier | Modifications |
|---------|---------------|
| `js/primo-questions.js` | +2 questions, ~3 questions modifiées |
| `js/primo-modal.js` | Fonction création cours |
| `js/primo-accueil.js` | Vérification prérequis Module 2 |
| `materiel-demo/etudiants-demo.csv` | Ajouter colonne Groupe |

---

## Estimation effort

| Phase | Complexité | Lignes estimées |
|-------|------------|-----------------|
| Phase 1 (questions) | Faible | ~50 lignes |
| Phase 2 (liste étudiants) | Moyenne | ~40 lignes |
| Phase 3 (création cours) | Moyenne | ~80 lignes |
| Phase 4 (corrections Module 2) | Faible | ~30 lignes |
| Phase 5 (prérequis) | Faible | ~20 lignes |
| **Total** | | **~220 lignes** |

---

## Prochaines étapes

1. ✅ Rédiger ce plan de refonte
2. ⏳ Obtenir validation du plan
3. [ ] Implémenter Phase 1 (questions manquantes)
4. [ ] Implémenter Phase 2 (format liste étudiants)
5. [ ] Implémenter Phase 3 (création cours)
6. [ ] Implémenter Phase 4 (corrections Module 2)
7. [ ] Implémenter Phase 5 (vérification prérequis)
8. [ ] Tests de validation
9. [ ] Commit final

---

*Document créé le 26 décembre 2025*
