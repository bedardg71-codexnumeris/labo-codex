# PLAN COMPLET - REFACTORISATION WIZARD
**Date** : 25 novembre 2025
**Statut** : En cours
**Objectif** : Intégrer le matériel pédagogique existant des Réglages dans le wizard

---

## 🎯 PHILOSOPHIE

Le wizard doit **assembler** le matériel existant des Réglages, pas le **recréer**.

**Workflow utilisateur** :
1. **Configuration initiale** (une fois) : Créer/configurer le matériel dans Réglages
2. **Création de pratiques** (plusieurs fois) : Assembler des combinaisons via le wizard

**Message à afficher au début du wizard** :
> Du matériel pédagogique vous est proposé comme point de départ dans votre configuration, mais vous pourrez l'ajuster à votre guise selon vos besoins dans les réglages. Ce matériel a été créé par d'autres utilisateurs et utilisatrices et il vous est proposé gracieusement. N'hésitez pas à faire de même et à partager votre travail !

---

## ✅ ÉTAPE 1 - Informations de base

**Statut** : ⚠️ À modifier

### Changements nécessaires

**AJOUTER** : Champ "Établissement"
```html
<div class="groupe-form">
    <label>Établissement</label>
    <input type="text" id="wizard-etablissement" class="controle-form"
           placeholder="Ex: Cégep de Drummondville">
</div>
```

**Champs finaux** :
- Nom de la pratique *
- Auteur
- Établissement (nouveau)
- Description
- Discipline

---

## ✅ ÉTAPE 2 - Échelle d'évaluation

**Statut** : ✅ COMPLÉTÉE

### Améliorations à ajouter

**Message explicatif à ajouter** :
```html
<div class="aide-box" style="margin-bottom: 15px;">
    <h4>À quoi servent ces valeurs ?</h4>
    <ul style="margin: 8px 0; padding-left: 20px;">
        <li><strong>Plage (min-max)</strong> : Détermine à quel niveau appartient un pourcentage.
            Par exemple, un étudiant avec 72% obtient le niveau "D" (plage 65-74%).</li>
        <li><strong>Valeur de calcul</strong> : Valeur ponctuelle utilisée dans les moyennes.
            Quand un étudiant obtient "D", on compte 70% (pas toute la plage) dans sa moyenne.</li>
    </ul>
    <p style="margin: 8px 0 0 0; font-style: italic; color: var(--gris-moyen);">
        Ces valeurs par défaut sont ajustables dans
        <strong>Réglages → Matériel pédagogique → Niveaux de performance</strong>.
    </p>
</div>
```

---

## 🔄 ÉTAPE 3 - Structure des évaluations

**Statut** : ⚠️ À refactoriser

### Changements nécessaires

**Terminologie française** :
- ❌ "Standards-Based Grading (SBG)"
- ✅ "Notation par maîtrise (Standards-Based Grading)"

- ❌ "Spécifications"
- ✅ "Notation par contrat (Specification Grading)"

**Option 1 : Portfolio**
```html
<p class="aide-texte">
    Les portfolios sont fréquents en littérature avec l'approche ELLAC.
    Chaque artefact (ou exercice) qui le compose n'a pas de pondération propre.
    C'est le portfolio conteneur qui a une pondération dans la note finale de l'élève.
</p>

<div class="groupe-form">
    <label>Mode de sélection</label>
    <select id="wizard-portfolio-selection" class="controle-form">
        <option value="n_meilleurs">N meilleurs artefacts</option>
        <option value="tous">Tous les artefacts</option>
        <option value="derniers">N derniers artefacts</option>
    </select>
</div>

<div class="groupe-form">
    <label>Nombre d'artefacts à considérer (N)</label>
    <input type="number" id="wizard-portfolio-n" class="controle-form" min="1" max="20">
    <small>⚠️ Pas de valeur par défaut - à définir par l'enseignant</small>
</div>
```

**Option 2 : Notation par maîtrise**
```html
<div class="groupe-form">
    <label>Nombre de standards</label>
    <input type="number" id="wizard-nb-standards" class="controle-form" min="1" max="20" value="10">
</div>

<div class="groupe-form">
    <label>Standards terminaux (séparés par virgules)</label>
    <input type="text" id="wizard-standards-terminaux" class="controle-form"
           placeholder="Ex: 7, 8, 9, 10">
</div>
```

**Option 3 : Évaluations discrètes**
```html
<div class="groupe-form">
    <label>Sélectionner parmi les productions existantes</label>
    <div id="wizard-productions-checkboxes">
        <!-- Chargé dynamiquement depuis Réglages → Productions -->
    </div>
</div>
```

**Option 4 : Notation par contrat**
```html
<p class="aide-texte">
    La notation par contrat sera configurée via le JSON après création de la pratique.
    Structure de base créée automatiquement.
</p>
```

**Option 5 : Dénotation (Ungrading)**
```html
<p class="aide-texte">
    🚧 La dénotation (Ungrading) sera disponible dans une prochaine version.
</p>
```

---

## 🔄 ÉTAPE 4 - Calcul de la note

**Statut** : ✅ OK (pas de changement)

Méthode :
- Conversion niveaux → pourcentage
- Moyenne pondérée
- Spécifications (notes fixes)

Conditions spéciales : Configuration manuelle JSON

---

## 🔄 ÉTAPE 5 - Système de reprises

**Statut** : ⚠️ À refactoriser majeur

### Changements nécessaires

**Type de reprises** :
```html
<div class="groupe-form">
    <label>Type de reprises *</label>
    <select id="wizard-reprises-type" class="controle-form">
        <option value="">Choisir un type...</option>
        <option value="aucune">Aucune reprise</option>
        <option value="illimitees">Reprises illimitées</option>
        <option value="limitees">Nombre limité de reprises</option>
        <option value="occasions_ponctuelles">Occasions ponctuelles (semaines spécifiques)</option>
    </select>
</div>
```

**Système de jetons** (NOUVEAU) :
```html
<div class="groupe-form" style="margin-top: 20px;">
    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
        <input type="checkbox" id="wizard-utiliser-jetons">
        Utiliser le système de jetons
    </label>
    <small style="color: var(--gris-moyen); margin-top: 6px; display: block;">
        Les jetons permettent aux étudiants d'obtenir des délais ou des reprises
    </small>
</div>

<div id="wizard-resume-jetons" style="display: none; margin-top: 15px; padding: 15px; background: var(--bleu-tres-pale); border-radius: 6px;">
    <h4 style="margin: 0 0 10px 0; font-size: 0.9rem;">Configuration actuelle des jetons</h4>
    <div id="wizard-resume-jetons-contenu">
        <!-- Chargé dynamiquement depuis Réglages -->
    </div>
    <a href="#section-reglages" style="display: inline-block; margin-top: 10px; color: var(--bleu-principal);">
        → Configurer les jetons dans les Réglages
    </a>
</div>
```

**Options supplémentaires** :
```html
<div class="groupe-form">
    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
        <input type="checkbox" id="wizard-reprises-bureau">
        Entrevues individuelles (bureau)
    </label>
</div>

<div class="groupe-form">
    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
        <input type="checkbox" id="wizard-remise-electronique">
        Remise électronique
    </label>
</div>

<div class="groupe-form">
    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
        <input type="checkbox" id="wizard-remise-classe">
        Remise en classe
    </label>
</div>

<div class="groupe-form">
    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
        <input type="checkbox" id="wizard-niveau-retrogradable">
        Le niveau peut être rétrogradé lors d'une reprise
    </label>
</div>
```

**Fonctions JS nécessaires** :
```javascript
// Affiche résumé configuration jetons actuelle
function afficherResumeJetons() {
    const configPAN = db.getSync('configPAN', {});
    const jetons = configPAN.jetons || {};

    if (!jetons.actif) {
        return '<p style="color: var(--gris-moyen);">Système de jetons désactivé</p>';
    }

    let html = '<ul style="margin: 0; padding-left: 20px;">';
    html += `<li><strong>Jetons délai</strong> : ${jetons.delai?.nombre || 0} jetons (${jetons.delai?.dureeJours || 0} jours)</li>`;
    html += `<li><strong>Jetons reprise</strong> : ${jetons.reprise?.nombre || 0} jetons</li>`;
    html += `<li><strong>Par étudiant</strong> : ${jetons.nombreParEleve || 0} jetons</li>`;
    html += '</ul>';

    return html;
}

// Toggle affichage résumé jetons
function toggleResumeJetons() {
    const checkbox = document.getElementById('wizard-utiliser-jetons');
    const resume = document.getElementById('wizard-resume-jetons');

    if (checkbox.checked) {
        const contenu = document.getElementById('wizard-resume-jetons-contenu');
        contenu.innerHTML = afficherResumeJetons();
        resume.style.display = 'block';
    } else {
        resume.style.display = 'none';
    }
}
```

---

## 🔄 ÉTAPE 6 - Gestion des critères

**Statut** : ⚠️ À refactoriser majeur

### Changements nécessaires

**Type de gestion** :
```html
<div class="groupe-form">
    <label>Type de gestion des critères *</label>
    <select id="wizard-criteres-type" class="controle-form" onchange="afficherConfigCriteres()">
        <option value="">Choisir un type...</option>
        <option value="fixes">Critères fixes pour toutes les évaluations</option>
        <option value="par_standard">Critères par standard (SBG)</option>
        <option value="par_evaluation">Critères par évaluation</option>
    </select>
</div>

<div class="aide-box" style="margin-top: 15px;">
    <strong>⚠️ Important pour le suivi des apprentissages</strong>
    <p style="margin: 8px 0 0 0;">
        Pour détecter les patterns et les défis récurrents, l'utilisateur doit avoir
        <strong>les mêmes critères dans tous les travaux, durant toute la session</strong>.
        C'est également le cas avec la taxonomie SOLO et les niveaux RàI.
    </p>
</div>
```

**Option 1 : Critères fixes**
```html
<div id="wizard-config-criteres-fixes" style="display: none;">
    <p class="aide-texte">
        Choisissez une grille de critères existante (ex: SRPNF holistique inspirée de ELLAC).
    </p>

    <div class="groupe-form">
        <label>Grille de critères à utiliser *</label>
        <select id="wizard-grille-id" class="controle-form" onchange="afficherPreviewGrilleWizard()">
            <option value="">Choisir une grille...</option>
            <!-- Options chargées dynamiquement depuis grillesTemplates -->
        </select>
        <p style="color: var(--gris-moyen); font-size: 0.85rem; margin-top: 6px;">
            Vous pouvez créer ou modifier vos grilles dans
            <strong>Réglages → Matériel pédagogique → Critères d'évaluation</strong>
        </p>
    </div>

    <!-- Prévisualisation de la grille -->
    <div id="wizard-preview-grille" style="display: none; margin-top: 20px; padding: 15px; background: var(--bleu-tres-pale); border-radius: 6px; border-left: 4px solid var(--bleu-principal);">
        <h4 style="margin: 0 0 12px 0; font-size: 0.95rem; color: var(--bleu-principal);">
            Aperçu de la grille
        </h4>
        <div id="wizard-preview-grille-contenu">
            <!-- Critères + pondérations affichés ici -->
        </div>
    </div>
</div>
```

**Option 2 : Par standard**
```html
<div id="wizard-config-criteres-standard" style="display: none;">
    <p class="aide-texte">
        Les critères seront définis individuellement pour chaque standard.
    </p>
</div>
```

**Option 3 : Par évaluation**
```html
<div id="wizard-config-criteres-evaluation" style="display: none;">
    <p class="aide-texte">
        Les critères seront définis individuellement pour chaque évaluation.
    </p>
</div>
```

**Fonctions JS nécessaires** :
```javascript
// Charge les grilles depuis localStorage
function chargerGrillesWizard() {
    const select = document.getElementById('wizard-grille-id');
    if (!select) return;

    const grilles = db.getSync('grillesTemplates', []);

    select.innerHTML = '<option value="">Choisir une grille...</option>';

    if (grilles.length === 0) {
        select.innerHTML += '<option value="defaut-srpnf" selected>SRPNF (5 critères) - Grille par défaut</option>';
    } else {
        grilles.forEach(grille => {
            const option = document.createElement('option');
            option.value = grille.id;
            const nbCriteres = grille.criteres ? grille.criteres.length : 0;
            option.textContent = `${grille.nom} (${nbCriteres} critères)`;
            select.appendChild(option);
        });

        if (grilles.length > 0) {
            select.value = grilles[0].id;
            afficherPreviewGrilleWizard();
        }
    }
}

// Affiche prévisualisation grille
function afficherPreviewGrilleWizard() {
    const select = document.getElementById('wizard-grille-id');
    const preview = document.getElementById('wizard-preview-grille');
    const contenu = document.getElementById('wizard-preview-grille-contenu');

    if (!select || !preview || !contenu) return;

    const grilleId = select.value;

    if (!grilleId) {
        preview.style.display = 'none';
        return;
    }

    // Cas spécial : grille par défaut SRPNF
    if (grilleId === 'defaut-srpnf') {
        contenu.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 8px;">
                <div style="display: flex; justify-content: space-between; padding: 8px; background: white; border-radius: 4px;">
                    <strong>Structure</strong>
                    <span style="color: var(--gris-moyen);">15%</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px; background: white; border-radius: 4px;">
                    <strong>Rigueur</strong>
                    <span style="color: var(--gris-moyen);">20%</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px; background: white; border-radius: 4px;">
                    <strong>Plausibilité</strong>
                    <span style="color: var(--gris-moyen);">10%</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px; background: white; border-radius: 4px;">
                    <strong>Nuance</strong>
                    <span style="color: var(--gris-moyen);">25%</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px; background: white; border-radius: 4px;">
                    <strong>Français</strong>
                    <span style="color: var(--gris-moyen);">30%</span>
                </div>
            </div>
        `;
        preview.style.display = 'block';
        return;
    }

    // Charger grille depuis localStorage
    const grilles = db.getSync('grillesTemplates', []);
    const grille = grilles.find(g => g.id === grilleId);

    if (!grille || !grille.criteres) {
        preview.style.display = 'none';
        return;
    }

    // Générer HTML
    let html = '<div style="display: flex; flex-direction: column; gap: 8px;">';

    grille.criteres.forEach(critere => {
        html += `
            <div style="display: flex; justify-content: space-between; padding: 8px; background: white; border-radius: 4px;">
                <strong>${critere.nom}</strong>
                <span style="color: var(--gris-moyen);">${critere.ponderation}%</span>
            </div>
        `;
    });

    html += '</div>';

    contenu.innerHTML = html;
    preview.style.display = 'block';
}
```

---

## 🔄 ÉTAPE 7 - Seuils d'interprétation

**Statut** : ⚠️ À refactoriser moyen

### Changements nécessaires

**Type de seuils** :
```html
<div class="groupe-form">
    <label>Type de seuils *</label>
    <select id="wizard-seuils-type" class="controle-form" onchange="afficherConfigSeuils()">
        <option value="">Choisir un type...</option>
        <option value="pourcentage">Pourcentages (A-C-P)</option>
        <option value="niveau">Niveaux (selon échelle choisie)</option>
    </select>
</div>
```

**Option 1 : Pourcentages**
```html
<div id="wizard-config-seuils-pct" style="display: none;">
    <div class="aide-box" style="margin-bottom: 15px;">
        <h4>Seuils configurés dans les Réglages</h4>
        <div id="wizard-seuils-actuels">
            <!-- Chargé dynamiquement -->
        </div>
        <a href="#section-reglages" style="display: inline-block; margin-top: 10px; color: var(--bleu-principal);">
            → Modifier les seuils dans les Réglages
        </a>
    </div>
</div>
```

**Option 2 : Niveaux**
```html
<div id="wizard-config-seuils-niveau" style="display: none;">
    <div class="groupe-form">
        <label>Niveau acceptable minimum</label>
        <select id="wizard-niveau-acceptable" class="controle-form">
            <!-- Options chargées depuis échelle de l'Étape 2 -->
        </select>
    </div>

    <div id="wizard-preview-niveau-acceptable" style="margin-top: 15px; padding: 12px; background: var(--bleu-tres-pale); border-radius: 4px;">
        <!-- Preview du niveau sélectionné -->
    </div>
</div>
```

**Fonctions JS nécessaires** :
```javascript
// Affiche seuils actuels depuis Réglages
function afficherSeuilsActuels() {
    const configPAN = db.getSync('configPAN', {});
    const seuils = configPAN.seuils || { fragile: 70, acceptable: 80, bon: 85 };

    return `
        <ul style="margin: 8px 0; padding-left: 20px;">
            <li><strong>Bon</strong> : ≥ ${seuils.bon}%</li>
            <li><strong>Acceptable</strong> : ≥ ${seuils.acceptable}%</li>
            <li><strong>Fragile</strong> : ≥ ${seuils.fragile}%</li>
        </ul>
    `;
}

// Charge niveaux depuis échelle Étape 2
function chargerNiveauxAcceptables() {
    const echelleId = document.getElementById('wizard-echelle-id').value;
    const select = document.getElementById('wizard-niveau-acceptable');

    if (!select || !echelleId) return;

    let niveaux = [];

    if (echelleId === 'defaut-idme') {
        niveaux = [
            { code: 'I', nom: 'Insuffisant' },
            { code: 'D', nom: 'En développement' },
            { code: 'M', nom: 'Maîtrisé' },
            { code: 'E', nom: 'Étendu' }
        ];
    } else {
        const echelles = db.getSync('echellesTemplates', []);
        const echelle = echelles.find(e => e.id === echelleId);
        if (echelle && echelle.niveaux) {
            niveaux = echelle.niveaux.map(n => ({ code: n.code, nom: n.nom }));
        }
    }

    select.innerHTML = '';
    niveaux.forEach(niveau => {
        const option = document.createElement('option');
        option.value = niveau.code;
        option.textContent = `${niveau.code} - ${niveau.nom}`;
        select.appendChild(option);
    });
}
```

---

## ✅ ÉTAPE 8 - Interface et terminologie

**Statut** : ✅ OK (pas de changement)

Options d'affichage :
- Notes chiffrées
- Rang de l'étudiant
- Moyenne du groupe

Terminologie personnalisée :
- Terme pour "Évaluation"
- Terme pour "Critère"
- Terme pour "Note finale"
- Terme pour "Reprise"

---

## 📊 RÉSUMÉ DES TÂCHES

| Étape | Refactorisation | Priorité | Effort |
|-------|----------------|----------|--------|
| 1 | Ajouter champ Établissement | Basse | 15 min |
| 2 | Ajouter explications | Basse | 30 min |
| 3 | Termes français + Portfolio | Moyenne | 1h |
| 4 | Aucune | - | - |
| 5 | **Jetons + Options remise** | **Haute** | **2h** |
| 6 | **Grilles de critères** | **Haute** | **2h** |
| 7 | Seuils + Note patterns | Moyenne | 1h |
| 8 | Aucune | - | - |

**Total estimé** : ~7h de refactorisation

---

## 🎯 ORDRE D'IMPLÉMENTATION SUGGÉRÉ

1. **Étape 1** (15 min) - Champ Établissement (rapide)
2. **Étape 2** (30 min) - Explications (rapide)
3. **Étape 6** (2h) - Grilles de critères (similaire à Étape 2, bon momentum)
4. **Étape 5** (2h) - Jetons (intégration système existant)
5. **Étape 7** (1h) - Seuils (lecture depuis Réglages)
6. **Étape 3** (1h) - Structure (ajustements terminologie)

**Pause de validation** : Tester le wizard complet après chaque étape majeure

---

## 📝 NOTES IMPORTANTES

### Cohérence patterns/RàI
Pour que la détection des patterns et des niveaux RàI fonctionne correctement :
- Les **mêmes critères** doivent être utilisés dans tous les travaux
- La **même taxonomie SOLO** doit être appliquée durant toute la session
- Les **mêmes seuils** d'interprétation doivent rester constants

C'est pourquoi ces éléments sont configurés dans les Réglages et **référencés** (pas dupliqués) par les pratiques.

### Partage de matériel
Le message de bienvenue encourage le partage entre enseignants :
- Utilisation gratuite du matériel proposé
- Encouragement à contribuer et partager son propre matériel
- Création d'une communauté de pratique

---

**Document créé le** : 25 novembre 2025
**Dernière mise à jour** : 25 novembre 2025
**Version** : 1.0
