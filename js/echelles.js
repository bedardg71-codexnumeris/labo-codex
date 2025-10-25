/* ===============================
   MODULE 06: ÉCHELLES DE PERFORMANCE
   Index: 50 10-10-2025a → Modularisation
   
   ⚠️ AVERTISSEMENT ⚠️
   Ce module gère les échelles de performance pour les pratiques
   alternatives de notation (PAN/SBG).
   
   Contenu de ce module:
   - Définition des niveaux de performance par défaut
   - Gestion des échelles templates (création, édition, suppression)
   - Configuration globale (type d'échelle, seuil de réussite)
   - Affichage du tableau des niveaux
   - Aperçu visuel de l'échelle
   - Conversion notes <-> niveaux
   - Chargement des échelles dans les selects
   =============================== */

/* ===============================
   DÉPENDANCES DE CE MODULE
   
   Modules requis (doivent être chargés AVANT):
   - 01-config.js : Variables globales
   
   Fonctions utilisées:
   - echapperHtml() (depuis 01-config.js)
   
   Éléments HTML requis:
   - #selectEchelleTemplate : Select pour choisir une échelle
   - #nomEchelleContainer : Conteneur du nom de l'échelle
   - #nomEchelleTemplate : Input pour le nom
   - #typeEchelle : Select du type d'échelle
   - #seuilReussite : Input du seuil de réussite
   - #tableauNiveaux : Conteneur du tableau des niveaux
   - #apercuEchelle : Conteneur de l'aperçu visuel
   - #btnDupliquerEchelle : Bouton dupliquer
   - #codesPersonnalises : Input pour codes personnalisés
   
   LocalStorage utilisé:
   - 'echellesTemplates' : Array des échelles sauvegardées
   - 'niveauxEchelle' : Array des niveaux de l'échelle actuelle
   - 'configEchelle' : Objet de configuration globale
   =============================== */

/* ===============================
   NIVEAUX PAR DÉFAUT
   Échelle SOLO (Structure of Observed Learning Outcomes)
   =============================== */

/**
 * Niveaux de performance par défaut
 * Basés sur la taxonomie SOLO adaptée aux PAN
 * 
 * Structure de chaque niveau:
 * - code: Code court (1-3 lettres)
 * - nom: Nom descriptif du niveau
 * - description: Explication du niveau (taxonomie SOLO)
 * - min: Pourcentage minimum
 * - max: Pourcentage maximum
 * - couleur: Variable CSS pour la couleur
 * 
 * ⚠️ NE PAS MODIFIER - Utilisé comme référence par défaut
 */
const niveauxDefaut = [
    {
        code: 'I',
        nom: 'Incomplet ou insuffisant',
        description: 'Préstructurel, unistructurel',
        min: 0,
        max: 64,
        valeurCalcul: 32,
        couleur: 'var(--risque-critique)'
    },
    {
        code: 'D',
        nom: 'En Développement',
        description: 'Multistructurel',
        min: 65,
        max: 74,
        valeurCalcul: 69.5,
        couleur: 'var(--risque-modere)'
    },
    {
        code: 'M',
        nom: 'Maîtrisé',
        description: 'Relationnel',
        min: 75,
        max: 84,
        valeurCalcul: 79.5,
        couleur: 'var(--risque-minimal)'
    },
    {
        code: 'E',
        nom: 'Étendu',
        description: 'Abstrait étendu',
        min: 85,
        max: 100,
        valeurCalcul: 92.5,
        couleur: 'var(--risque-nul)'
    }
];

/* ===============================
   🎨 PALETTE DE COULEURS
   =============================== */

/**
 * Palette de couleurs pour les niveaux
 * 20 couleurs organisées par teintes
 */
const paletteCouleurs = [
    { nom: 'Rouge critique', valeur: 'var(--risque-critique)' },
    { nom: 'Rouge foncé', valeur: '#c0392b' },
    { nom: 'Rouge', valeur: '#e74c3c' },
    { nom: 'Orange critique', valeur: 'var(--risque-eleve)' },
    { nom: 'Orange', valeur: '#e67e22' },
    { nom: 'Orange clair', valeur: '#f39c12' },
    { nom: 'Jaune modéré', valeur: 'var(--risque-modere)' },
    { nom: 'Jaune', valeur: '#f1c40f' },
    { nom: 'Jaune-vert', valeur: '#9b59b6' },
    { nom: 'Vert minimal', valeur: 'var(--risque-minimal)' },
    { nom: 'Vert', valeur: '#27ae60' },
    { nom: 'Vert foncé', valeur: '#1e8449' },
    { nom: 'Vert nul', valeur: 'var(--risque-nul)' },
    { nom: 'Turquoise', valeur: '#16a085' },
    { nom: 'Bleu clair', valeur: '#3498db' },
    { nom: 'Bleu moyen', valeur: 'var(--bleu-moyen)' },
    { nom: 'Bleu foncé', valeur: '#2c3e50' },
    { nom: 'Violet', valeur: '#8e44ad' },
    { nom: 'Gris', valeur: '#7f8c8d' },
    { nom: 'Gris foncé', valeur: '#34495e' }
];

/* ===============================
   VARIABLE GLOBALE D'ÉTAT
   =============================== */

/**
 * Échelle actuellement en cours d'édition
 * null si nouvelle échelle ou aucune échelle sélectionnée
 * 
 * Structure:
 * {
 *   id: string,
 *   nom: string,
 *   niveaux: Array,
 *   config: Object,
 *   dateCreation: string ISO,
 *   dateModification: string ISO
 * }
 */
let echelleTemplateActuelle = null;

/* ===============================
   🚀 INITIALISATION DU MODULE
   =============================== */

/**
 * Initialise le module des échelles de performance
 * Appelée automatiquement par 99-main.js au chargement
 * 
 * FONCTIONNEMENT:
 * 1. Vérifie que les éléments DOM existent (section active)
 * 2. Charge les échelles templates dans le select
 * 3. Charge la configuration globale
 * 4. Affiche les niveaux et l'aperçu
 * 
 * RETOUR:
 * - Sortie silencieuse si les éléments n'existent pas
 */
function initialiserModuleEchelles() {
    console.log('📈 Initialisation du module Échelles de performance');

    // Vérifier que nous sommes dans la bonne section
    const elementTypeEchelle = document.getElementById('typeEchelle');
    if (!elementTypeEchelle) {
        console.log('   ⚠️  Section échelles non active, initialisation reportée');
        return;
    }

    // Charger les échelles templates
    chargerEchellesTemplates();

    // Charger la configuration
    chargerConfigurationEchelle();

    console.log('   ✅ Module Échelles initialisé');
}

/* ===============================
   📂 GESTION DES ÉCHELLES TEMPLATES
   =============================== */

/**
 * Charge la liste des échelles templates dans le select
 * 
 * FONCTIONNEMENT:
 * 1. Récupère les échelles depuis localStorage
 * 2. Construit les options du select
 * 3. Ajoute les options standard (nouvelle, créer)
 * 
 * UTILISÉ PAR:
 * - initialiserModuleEchelles()
 * - enregistrerCommeEchelle()
 */
function chargerEchellesTemplates() {
    const select = document.getElementById('selectEchelleTemplate');
    if (!select) return;

    const echelles = JSON.parse(localStorage.getItem('echellesTemplates') || '[]');

    let options = '<option value="">-- Nouvelle échelle --</option>';
    options += '<option value="new">➕ Créer une nouvelle échelle</option>';

    echelles.forEach(echelle => {
        const nomEchappe = echapperHtml(echelle.nom);
        options += `<option value="${echelle.id}">${nomEchappe}</option>`;
    });

    select.innerHTML = options;
}

/**
 * Charge une échelle template sélectionnée
 * Appelée lors du changement de sélection dans le select
 * 
 * FONCTIONNEMENT:
 * 1. Si "nouvelle" ou vide: réinitialise aux valeurs par défaut
 * 2. Si échelle existante: charge ses données
 * 3. Met à jour l'interface (nom, niveaux, config, aperçu)
 * 4. Affiche/masque le bouton dupliquer selon le cas
 * 
 * GÈRE:
 * - Changement d'événement sur #selectEchelleTemplate
 */
function chargerEchelleTemplate() {
    const selectValue = document.getElementById('selectEchelleTemplate').value;
    const nomContainer = document.getElementById('nomEchelleContainer');
    const btnDupliquer = document.getElementById('btnDupliquerEchelle');

    if (!selectValue || selectValue === 'new') {
        // Nouvelle échelle
        nomContainer.style.display = 'block';
        document.getElementById('nomEchelleTemplate').value = '';

        // Réinitialiser aux valeurs par défaut
        reinitialiserNiveauxDefaut();
        echelleTemplateActuelle = null;

        // Masquer le bouton dupliquer
        if (btnDupliquer) btnDupliquer.style.display = 'none';

    } else {
        // Charger une échelle existante
        const echelles = JSON.parse(localStorage.getItem('echellesTemplates') || '[]');
        const echelle = echelles.find(e => e.id === selectValue);

        if (echelle) {
            nomContainer.style.display = 'block';
            document.getElementById('nomEchelleTemplate').value = echelle.nom;

            // Charger les niveaux
            localStorage.setItem('niveauxEchelle', JSON.stringify(echelle.niveaux));
            afficherTableauNiveaux(echelle.niveaux);
            afficherApercuEchelle(echelle.niveaux);

            // Charger la configuration
            if (echelle.config) {
                localStorage.setItem('configEchelle', JSON.stringify(echelle.config));

                const elementTypeEchelle = document.getElementById('typeEchelle');
                const elementSeuilReussite = document.getElementById('seuilReussite');

                if (echelle.config.typeEchelle && elementTypeEchelle) {
                    elementTypeEchelle.value = echelle.config.typeEchelle;
                }
                if (echelle.config.seuilReussite !== undefined && elementSeuilReussite) {
                    elementSeuilReussite.value = echelle.config.seuilReussite;
                }

                changerTypeEchelle();
            }

            echelleTemplateActuelle = echelle;

            // Afficher le bouton dupliquer
            if (btnDupliquer) btnDupliquer.style.display = 'inline-block';
        }
    }
}

/**
 * Sauvegarde le nom de l'échelle actuelle
 * Appelée lors du changement de valeur dans #nomEchelleTemplate
 * 
 * FONCTIONNEMENT:
 * Met à jour le nom de l'échelle en mémoire (pas localStorage)
 * La sauvegarde complète se fait via enregistrerCommeEchelle()
 */
function sauvegarderNomEchelle() {
    const nom = document.getElementById('nomEchelleTemplate').value;
    if (echelleTemplateActuelle && nom) {
        echelleTemplateActuelle.nom = nom;
    }
}

/**
 * Enregistre l'échelle actuelle comme template
 * Sauvegarde complète dans localStorage
 * 
 * FONCTIONNEMENT:
 * 1. Validation du nom (obligatoire)
 * 2. Récupération des niveaux et config actuels
 * 3. Création ou mise à jour de l'échelle
 * 4. Sauvegarde dans localStorage
 * 5. Mise à jour de l'interface
 * 
 * UTILISÉ PAR:
 * - Bouton «Enregistrer comme échelle»
 * 
 * VALIDATION:
 * - Nom obligatoire
 * - Niveaux valides (via localStorage)
 */
function enregistrerCommeEchelle() {
    const nomEchelle = document.getElementById('nomEchelleTemplate')?.value?.trim();

    if (!nomEchelle) {
        alert('Le nom de l\'échelle est obligatoire');
        return;
    }

    const niveaux = JSON.parse(localStorage.getItem('niveauxEchelle') || JSON.stringify(niveauxDefaut));
    const config = JSON.parse(localStorage.getItem('configEchelle') || '{}');

    let echelles = JSON.parse(localStorage.getItem('echellesTemplates') || '[]');

    // Vérifier si on modifie une échelle existante
    if (echelleTemplateActuelle && echelleTemplateActuelle.id) {
        // Mise à jour d'une échelle existante
        const index = echelles.findIndex(e => e.id === echelleTemplateActuelle.id);
        if (index !== -1) {
            echelles[index] = {
                ...echelleTemplateActuelle,
                nom: nomEchelle,
                niveaux: niveaux.map(n => ({ ...n })),
                config: { ...config },
                dateModification: new Date().toISOString()
            };
        }
    } else {
        // Nouvelle échelle
        const nouvelleEchelle = {
            id: 'ECH' + Date.now(),
            nom: nomEchelle,
            niveaux: niveaux.map(n => ({ ...n })),
            config: { ...config },
            dateCreation: new Date().toISOString(),
            dateModification: new Date().toISOString()
        };

        echelles.push(nouvelleEchelle);
        echelleTemplateActuelle = nouvelleEchelle;
    }

    // Sauvegarder
    localStorage.setItem('echellesTemplates', JSON.stringify(echelles));

    // Recharger le select et sélectionner l'échelle actuelle
    chargerEchellesTemplates();
    document.getElementById('selectEchelleTemplate').value = echelleTemplateActuelle.id;

    afficherNotificationSucces(`📑 Échelle «${nomEchelle}» enregistrée avec succès !`);
}

/**
 * Duplique l'échelle actuellement sélectionnée
 * 
 * FONCTIONNEMENT:
 * 1. Vérifie qu'une échelle est sélectionnée
 * 2. Crée une copie complète (niveaux + config)
 * 3. Ajoute «(copie)» au nom
 * 4. Sauvegarde la nouvelle échelle
 * 5. Sélectionne automatiquement la copie
 * 
 * UTILISÉ PAR:
 * - Bouton «Dupliquer» (visible seulement si échelle sélectionnée)
 */
function dupliquerEchelleActuelle() {
    if (!echelleTemplateActuelle) return;

    const nouveauNom = prompt('Nom de la nouvelle échelle :', echelleTemplateActuelle.nom + ' (copie)');
    if (!nouveauNom) return;

    const nouvelleEchelle = {
        id: 'ECH' + Date.now(),
        nom: nouveauNom,
        niveaux: echelleTemplateActuelle.niveaux.map(n => ({ ...n })),
        config: { ...echelleTemplateActuelle.config },
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString(),
        baseSur: echelleTemplateActuelle.nom
    };

    let echelles = JSON.parse(localStorage.getItem('echellesTemplates') || '[]');
    echelles.push(nouvelleEchelle);
    localStorage.setItem('echellesTemplates', JSON.stringify(echelles));

    // Mettre à jour l'interface
    echelleTemplateActuelle = nouvelleEchelle;
    chargerEchellesTemplates();
    document.getElementById('selectEchelleTemplate').value = nouvelleEchelle.id;
    document.getElementById('nomEchelleTemplate').value = nouvelleEchelle.nom;

    afficherNotificationSucces(`📑 Échelle «${nouvelleEchelle.nom}» créée avec succès !`);
}

/**
 * Supprime une échelle template
 * 
 * FONCTIONNEMENT:
 * 1. Demande confirmation
 * 2. Retire l'échelle du localStorage
 * 3. Met à jour l'affichage
 * 
 * UTILISÉ PAR:
 * - Bouton supprimer dans la liste des échelles (modal)
 * - Paramètre echelleId: ID de l'échelle à supprimer
 * 
 * SÉCURITÉ:
 * - Confirmation obligatoire avant suppression
 */
function supprimerEchelle(echelleId) {
    if (!confirm('Supprimer cette échelle ?')) return;

    let echelles = JSON.parse(localStorage.getItem('echellesTemplates') || '[]');
    echelles = echelles.filter(e => e.id !== echelleId);
    localStorage.setItem('echellesTemplates', JSON.stringify(echelles));

    afficherEchellesPerformance();
    afficherNotificationSucces('Échelle supprimée');
}

/* ===============================
   CONFIGURATION GLOBALE
   =============================== */

/**
 * Charge la configuration globale depuis localStorage
 * 
 * FONCTIONNEMENT:
 * 1. Récupère la config depuis localStorage
 * 2. Applique les valeurs aux champs du formulaire
 * 3. Charge les niveaux et l'aperçu
 * 
 * UTILISÉ PAR:
 * - initialiserModuleEchelles()
 * 
 * CONFIG CHARGÉE:
 * - typeEchelle: lettres/pourcentage/autre
 * - seuilReussite: pourcentage (défaut: 60)
 * - codesPersonnalises: string (optionnel)
 */
function chargerConfigurationEchelle() {
    const config = JSON.parse(localStorage.getItem('configEchelle') || '{}');

    // Charger le type d'échelle
    const elementTypeEchelle = document.getElementById('typeEchelle');
    if (config.typeEchelle && elementTypeEchelle) {
        elementTypeEchelle.value = config.typeEchelle;
    }

    // Charger le seuil de réussite
    const elementSeuilReussite = document.getElementById('seuilReussite');
    if (config.seuilReussite !== undefined && elementSeuilReussite) {
        elementSeuilReussite.value = config.seuilReussite;
    }

    // Charger les codes personnalisés
    const elementCodesPersonnalises = document.getElementById('codesPersonnalises');
    if (config.codesPersonnalises && elementCodesPersonnalises) {
        elementCodesPersonnalises.value = config.codesPersonnalises;
    }

    changerTypeEchelle();

    // Charger les niveaux
    const niveaux = JSON.parse(localStorage.getItem('niveauxEchelle') || JSON.stringify(niveauxDefaut));
    afficherTableauNiveaux(niveaux);
    afficherApercuEchelle(niveaux);
}

/**
 * Sauvegarde la configuration globale dans localStorage
 * 
 * FONCTIONNEMENT:
 * Récupère les valeurs des champs et les sauvegarde
 * 
 * APPELÉE PAR:
 * - Changement dans les champs de configuration
 * - enregistrerCommeEchelle()
 * 
 * CONFIG SAUVEGARDÉE:
 * - typeEchelle
 * - seuilReussite
 * - notePassage (optionnel)
 * - codesPersonnalises (optionnel)
 */
function sauvegarderConfigEchelle() {
    const config = {
        typeEchelle: document.getElementById('typeEchelle').value,
        seuilReussite: parseInt(document.getElementById('seuilReussite').value) || 60,
        notePassage: document.getElementById('notePassage')?.value || '',
        codesPersonnalises: document.getElementById('codesPersonnalises')?.value || ''
    };

    localStorage.setItem('configEchelle', JSON.stringify(config));
}

/**
 * Gère le changement de type d'échelle
 * Adapte l'interface selon le type sélectionné
 * 
 * FONCTIONNEMENT:
 * 1. Récupère le type sélectionné
 * 2. Affiche/masque les champs conditionnels
 * 3. Si type «autre»: affiche champ personnalisé
 * 4. Sauvegarde la configuration
 * 
 * TYPES D'ÉCHELLE:
 * - lettres: A, B, C, D, E, F
 * - pourcentage: 0-100%
 * - autre: personnalisé
 * 
 * APPELÉE PAR:
 * - Changement dans #typeEchelle
 */
function changerTypeEchelle() {
    const elementType = document.getElementById('typeEchelle');
    if (!elementType) return;

    const type = elementType.value;
    const champAutre = document.getElementById('champAutreEchelle');
    const notePassageContainer = document.getElementById('notePassageContainer');

    if (!champAutre || !notePassageContainer) return;

    if (type === 'autre') {
        champAutre.style.display = 'block';
        notePassageContainer.innerHTML = `
            <input type="text" id="notePassage" class="controle-form" 
                   placeholder="Ex: Compétent" onchange="sauvegarderConfigEchelle()">
        `;
    } else {
        champAutre.style.display = 'none';
        notePassageContainer.innerHTML = '';
    }

    sauvegarderConfigEchelle();
}

/* ===============================
   GESTION DES NIVEAUX
   =============================== */

/**
 * Affiche le tableau des niveaux de performance
 * 
 * FONCTIONNEMENT:
 * 1. Génère un tableau HTML avec les niveaux
 * 2. Chaque ligne est éditable (inputs inline)
 * 3. Boutons de modification/suppression par ligne
 * 4. Bouton d'ajout en bas du tableau
 * 
 * PARAMÈTRES:
 * @param {Array} niveaux - Array d'objets niveau
 * 
 * UTILISÉ PAR:
 * - chargerConfigurationEchelle()
 * - chargerEchelleTemplate()
 * - modifierNiveau()
 * - ajouterNiveau()
 * - supprimerNiveau()
 * - reinitialiserNiveauxDefaut()
 * 
 * STRUCTURE TABLEAU:
 * Code | Nom | Description | Min(%) | Max(%) | Couleur | Actions
 */
function afficherTableauNiveaux(niveaux) {
    const container = document.getElementById('tableauNiveaux');
    if (!container) return;

    container.innerHTML = `
        <table class="tableau">
<thead>
    <tr>
        <th style="width: 80px;">Code</th>
        <th style="width: 180px;">Nom</th>
        <th>Description</th>
        <th style="width: 80px;">Min (%)</th>
        <th style="width: 80px;">Max (%)</th>
        <th style="width: 100px;">Valeur ponctuelle</th>
        <th style="width: 150px;">Couleur</th>
        <th style="width: 120px;">Actions</th>
    </tr>
</thead>
            <tbody>
                ${niveaux.map((niveau, index) => `
                    <tr>
                        <td>
                            <input type="text" 
                                   value="${echapperHtml(niveau.code)}" 
                                   onchange="modifierNiveau(${index}, 'code', this.value)"
                                   class="controle-form" 
                                   style="width: 60px; padding: 4px;">
                        </td>
                        <td>
                            <input type="text" 
                                   value="${echapperHtml(niveau.nom)}" 
                                   onchange="modifierNiveau(${index}, 'nom', this.value)"
                                   class="controle-form" 
                                   style="width: 100%; padding: 4px;">
                        </td>
                        <td>
                            <input type="text" 
                                   value="${echapperHtml(niveau.description || '')}" 
                                   onchange="modifierNiveau(${index}, 'description', this.value)"
                                   class="controle-form" 
                                   style="width: 100%; padding: 4px;">
                        </td>
                        <td>
                            <input type="number" 
                                   value="${niveau.min}" 
                                   onchange="modifierNiveau(${index}, 'min', this.value)"
                                   class="controle-form" 
                                   style="width: 60px; padding: 4px;"
                                   min="0" max="100">
                        </td>
<td>
    <input type="number" 
           value="${niveau.max}" 
           onchange="modifierNiveau(${index}, 'max', this.value)"
           style="width: 60px;" min="0" max="100">
</td>
<td>
                            <input type="number" 
                                   value="${niveau.valeurCalcul || ''}" 
                                   onchange="modifierNiveau(${index}, 'valeurCalcul', this.value)"
                                   style="width: 80px;" min="0" max="100" step="0.1"
                                   placeholder="Ex: 32">
                        </td>
                        <td>
    <select onchange="modifierNiveau(${index}, 'couleur', this.value)"
            style="width: 100%; padding: 4px; border: 1px solid #ddd; border-radius: 4px;">
        ${paletteCouleurs.map(c => `
            <option value="${c.valeur}" ${niveau.couleur === c.valeur ? 'selected' : ''}>
                ${c.nom}
            </option>
        `).join('')}
    </select>
    <div id="apercu-couleur-${index}" 
         style="width: 30px; height: 30px; background: ${niveau.couleur}; 
         border-radius: 4px; margin-top: 5px; border: 1px solid #ccc;"></div>
</td>
                        <td style="text-align: center;">
                            ${niveaux.length > 1 ?
            `<button onclick="supprimerNiveau(${index})"
                                         class="btn btn-supprimer btn-compact"
                                         title="Supprimer ce niveau">
                                    Supprimer
                                </button>`
            : ''}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        <button class="btn btn-confirmer mt-2" onclick="ajouterNiveau()">
            + Ajouter un niveau
        </button>
    `;
}

/**
 * Modifie un niveau dans le tableau
 * 
 * FONCTIONNEMENT:
 * 1. Récupère les niveaux actuels depuis localStorage
 * 2. Modifie la valeur du champ spécifié
 * 3. Valide et convertit les types (int pour min/max)
 * 4. Sauvegarde dans localStorage
 * 5. Met à jour l'aperçu
 * 
 * PARAMÈTRES:
 * @param {number} index - Index du niveau à modifier
 * @param {string} champ - Nom du champ (code, nom, description, min, max, couleur)
 * @param {string} valeur - Nouvelle valeur
 * 
 * UTILISÉ PAR:
 * - Inputs dans le tableau des niveaux (onchange)
 * 
 * VALIDATION:
 * - min/max convertis en entiers
 * - Autres champs en string
 */
function modifierNiveau(index, champ, valeur) {
    let niveaux = JSON.parse(localStorage.getItem('niveauxEchelle') || JSON.stringify(niveauxDefaut));
    niveaux[index][champ] = valeur;
    localStorage.setItem('niveauxEchelle', JSON.stringify(niveaux));
    
    // Mise à jour immédiate de l'aperçu de couleur sans recharger tout le tableau
    if (champ === 'couleur') {
        const apercuDiv = document.getElementById(`apercu-couleur-${index}`);
        if (apercuDiv) {
            apercuDiv.style.background = valeur;
        }
    }
    
    // Mettre à jour l'aperçu global de l'échelle
    afficherApercuEchelle(niveaux);
}

/**
 * Ajoute un nouveau niveau à l'échelle
 * 
 * FONCTIONNEMENT:
 * 1. Récupère les niveaux actuels
 * 2. Crée un nouveau niveau avec valeurs par défaut
 * 3. Ajoute à la fin du tableau
 * 4. Sauvegarde et met à jour l'affichage
 * 
 * UTILISÉ PAR:
 * - Bouton «+ Ajouter un niveau»
 * 
 * NIVEAU PAR DÉFAUT:
 * - Code: N1, N2, N3...
 * - Nom: «Nouveau niveau»
 * - Min/Max: 0-100
 * - Couleur: bleu moyen
 */
function ajouterNiveau() {
    let niveaux = JSON.parse(localStorage.getItem('niveauxEchelle') || JSON.stringify(niveauxDefaut));

    niveaux.push({
        code: 'N',
        nom: 'Nouveau niveau',
        description: '',
        min: 0,
        max: 100,
        valeurCalcul: 50,
        couleur: 'var(--bleu-moyen)'
    });

    localStorage.setItem('niveauxEchelle', JSON.stringify(niveaux));
    afficherTableauNiveaux(niveaux);
    afficherApercuEchelle(niveaux);
}

/**
 * Supprime un niveau de l'échelle
 * 
 * FONCTIONNEMENT:
 * 1. Demande confirmation
 * 2. Retire le niveau du tableau
 * 3. Sauvegarde et met à jour
 * 
 * PARAMÈTRES:
 * @param {number} index - Index du niveau à supprimer
 * 
 * UTILISÉ PAR:
 * - Bouton ✖ dans le tableau
 * 
 * SÉCURITÉ:
 * - Confirmation obligatoire
 * - Désactivé s'il reste un seul niveau (minimum requis)
 */
function supprimerNiveau(index) {
    if (!confirm('Supprimer ce niveau ?')) return;

    let niveaux = JSON.parse(localStorage.getItem('niveauxEchelle') || JSON.stringify(niveauxDefaut));
    niveaux.splice(index, 1);
    localStorage.setItem('niveauxEchelle', JSON.stringify(niveaux));
    afficherTableauNiveaux(niveaux);
    afficherApercuEchelle(niveaux);
}

/**
 * Réinitialise l'échelle aux niveaux par défaut
 * 
 * FONCTIONNEMENT:
 * 1. Demande confirmation
 * 2. Restaure les niveaux SOLO par défaut
 * 3. Met à jour l'affichage
 * 
 * UTILISÉ PAR:
 * - Bouton «Réinitialiser»
 * - chargerEchelleTemplate() (nouvelle échelle)
 * 
 * SÉCURITÉ:
 * - Confirmation obligatoire
 * - Perte des modifications actuelles
 */
function reinitialiserNiveauxDefaut() {
    if (!confirm('Réinitialiser aux niveaux par défaut ? Les modifications seront perdues.')) return;

    localStorage.setItem('niveauxEchelle', JSON.stringify(niveauxDefaut));
    afficherTableauNiveaux(niveauxDefaut);
    afficherApercuEchelle(niveauxDefaut);
    afficherNotificationSucces('Échelle réinitialisée aux valeurs par défaut');
}

/**
 * Sauvegarde les niveaux avec validation
 * 
 * FONCTIONNEMENT:
 * 1. Récupère les niveaux depuis localStorage
 * 2. Valide la cohérence (code, nom, min<max)
 * 3. Affiche les erreurs si nécessaire
 * 4. Confirme si valide
 * 
 * UTILISÉ PAR:
 * - Bouton «Sauvegarder les niveaux»
 * 
 * VALIDATION:
 * - Code et nom obligatoires
 * - Min doit être < Max
 * - Tous les niveaux vérifiés
 * 
 * RETOUR:
 * - Alerte avec liste d'erreurs si invalide
 * - Notification de succès si valide
 */
function sauvegarderNiveaux() {
    const niveaux = JSON.parse(localStorage.getItem('niveauxEchelle') || JSON.stringify(niveauxDefaut));

    // Vérifier la cohérence
    let erreurs = [];
    niveaux.forEach((niveau, i) => {
        if (!niveau.code || !niveau.nom) {
            erreurs.push(`Niveau ${i + 1}: Code et nom obligatoires`);
        }
        if (niveau.min >= niveau.max) {
            erreurs.push(`Niveau ${i + 1}: Min doit être < Max`);
        }
    });

    if (erreurs.length > 0) {
        alert('Erreurs à corriger:\n' + erreurs.join('\n'));
        return;
    }

    afficherNotificationSucces('Échelle de performance sauvegardée !');
}

/* ===============================
   🎨 APERÇU VISUEL
   =============================== */

/**
 * Affiche l'aperçu visuel de l'échelle
 * Bandeau horizontal avec les niveaux colorés
 * 
 * FONCTIONNEMENT:
 * 1. Génère une div par niveau
 * 2. Applique la couleur en background
 * 3. Affiche code et plage de pourcentages
 * 4. Mise en page flex horizontale
 * 
 * PARAMÈTRES:
 * @param {Array} niveaux - Array d'objets niveau
 * 
 * UTILISÉ PAR:
 * - chargerConfigurationEchelle()
 * - chargerEchelleTemplate()
 * - modifierNiveau()
 * - ajouterNiveau()
 * - supprimerNiveau()
 * - reinitialiserNiveauxDefaut()
 * 
 * STYLE VISUEL:
 * - Fond semi-transparent (couleur + 20 opacity)
 * - Code en gras et couleur pleine
 * - Plage en petit texte en dessous
 */
function afficherApercuEchelle(niveaux) {
    const container = document.getElementById('apercuEchelle');
    if (!container) return;

    container.innerHTML = niveaux.map(niveau => `
        <div style="text-align: center; flex: 1; padding: 10px; 
             background: ${niveau.couleur}20; border-radius: 4px; margin: 0 2px;">
            <strong style="font-size: 1.2rem; color: ${niveau.couleur};">${echapperHtml(niveau.code)}</strong>
            <div style="font-size: 0.75rem; margin-top: 5px;">${niveau.min}%-${niveau.max}%</div>
        </div>
    `).join('');
}

/* ===============================
   🔄 GÉNÉRATION DE NIVEAUX PERSONNALISÉS
   =============================== */

/**
 * Génère automatiquement des niveaux à partir de codes
 * Permet de créer rapidement une échelle personnalisée
 * 
 * FONCTIONNEMENT:
 * 1. Récupère les codes séparés par virgules
 * 2. Crée un niveau pour chaque code
 * 3. Répartit automatiquement les pourcentages
 * 4. Applique une couleur par défaut
 * 5. Affiche et sauvegarde
 * 
 * UTILISÉ PAR:
 * - Bouton «Générer» après le champ codes personnalisés
 * 
 * FORMAT ATTENDU:
 * - Codes séparés par virgules
 * - Ex: «A, B, C, D, F» ou «Excellent, Bon, Moyen, Faible»
 * 
 * GÉNÉRATION AUTOMATIQUE:
 * - Code: 3 premiers caractères en majuscules
 * - Nom: Code complet
 * - Plage: répartie uniformément sur 0-100%
 * - Couleur: bleu moyen par défaut
 * 
 * EXEMPLE:
 * Input: «Excellent, Bon, Moyen, Faible»
 * Génère:
 * - EXC: Excellent (0-25%)
 * - BON: Bon (25-50%)
 * - MOY: Moyen (50-75%)
 * - FAI: Faible (75-100%)
 */
function genererNiveauxPersonnalises() {
    const codes = document.getElementById('codesPersonnalises').value
        .split(',')
        .map(c => c.trim())
        .filter(c => c);

    if (codes.length === 0) return;

    const niveaux = codes.map((code, i) => {
        const min = Math.floor(i * 100 / codes.length);
        const max = Math.floor((i + 1) * 100 / codes.length);
        const valeurCalcul = (min + max) / 2;

        return {
            code: code.substring(0, 3).toUpperCase(),
            nom: code,
            description: '',
            min: min,
            max: max,
            valeurCalcul: valeurCalcul,
            couleur: 'var(--bleu-moyen)'
        };
    });

    localStorage.setItem('niveauxEchelle', JSON.stringify(niveaux));
    afficherTableauNiveaux(niveaux);
    afficherApercuEchelle(niveaux);
    sauvegarderConfigEchelle();
}

/* ===============================
   CHARGEMENT DANS LES SELECTS
   Pour utilisation dans d'autres modules
   =============================== */

/**
 * Charge les échelles dans un select d'évaluation
 * Utilisé dans le module 04-productions pour sélectionner l'échelle
 * 
 * FONCTIONNEMENT:
 * 1. Récupère les échelles depuis localStorage
 * 2. Remplit le select avec les options
 * 3. Option par défaut «Choisir une échelle»
 * 
 * UTILISÉ PAR:
 * - Module 04-productions (évaluation des productions)
 * - Autres modules nécessitant une sélection d'échelle
 * 
 * ÉLÉMENT REQUIS:
 * - #selectEchelle1 (ou autre numéro selon la production)
 */
function chargerEchellePerformance() {
    const echelles = JSON.parse(localStorage.getItem('echellesTemplates') || '[]');
    const selectEchelle = document.getElementById('selectEchelle1');

    if (!selectEchelle) return;

    selectEchelle.innerHTML = '<option value="">-- Choisir une échelle --</option>';
    echelles.forEach(echelle => {
        const nomEchappe = echapperHtml(echelle.nom || 'Échelle sans nom');
        selectEchelle.innerHTML += `<option value="${echelle.id}">${nomEchappe}</option>`;
    });
}

/**
 * Met à jour les options des selects de critères selon l'échelle
 * Utilisé lors de l'évaluation pour afficher les bons niveaux
 * 
 * FONCTIONNEMENT:
 * 1. Récupère tous les selects de critères
 * 2. Pour chaque select:
 *    - Sauvegarde la valeur actuelle
 *    - Reconstruit les options avec les niveaux
 *    - Restaure la valeur si elle existe toujours
 * 
 * PARAMÈTRES:
 * @param {Array} niveaux - Array d'objets niveau à utiliser
 * 
 * UTILISÉ PAR:
 * - Module 04-productions lors du changement d'échelle
 * - Après le chargement d'une échelle pour une évaluation
 * 
 * FORMAT OPTION:
 * - value: code du niveau
 * - text: code - nom (ex: «E - Étendu»)
 */
function mettreAJourOptionsEchelle(niveaux) {
    const selects = document.querySelectorAll('#listeSelectsCriteres1 select.critere-select');

    selects.forEach(select => {
        const valeurActuelle = select.value;

        // Reconstruire les options avec les niveaux de l'échelle
        let optionsHTML = '<option value="">--</option>';
        niveaux.forEach(niveau => {
            const codeEchappe = echapperHtml(niveau.code);
            const nomEchappe = echapperHtml(niveau.nom);
            optionsHTML += `<option value="${codeEchappe}">${codeEchappe} - ${nomEchappe}</option>`;
        });

        select.innerHTML = optionsHTML;

        // Restaurer la valeur si elle existe toujours
        if (valeurActuelle && niveaux.find(n => n.code === valeurActuelle)) {
            select.value = valeurActuelle;
        }
    });
}

/* ===============================
   🔔 NOTIFICATIONS
   =============================== */

/**
 * Affiche une notification de succès
 * 
 * FONCTIONNEMENT:
 * 1. Crée un div avec le message
 * 2. Ajoute au body avec animation
 * 3. Supprime après 3 secondes
 * 
 * PARAMÈTRES:
 * @param {string} message - Message à afficher
 * 
 * UTILISÉ PAR:
 * - Toutes les fonctions de sauvegarde
 * - Actions de gestion (ajout, suppression, etc.)
 * 
 * STYLE:
 * - Position fixe en haut à droite
 * - Fond vert (succès)
 * - Animation slideIn
 * - Disparaît après 3s
 */
function afficherNotificationSucces(message) {
    const notification = document.createElement('div');
    notification.className = 'notification-succes';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

/* ===============================
   📌 NOTES D'UTILISATION
   =============================== */

/*
 * ORDRE D'INITIALISATION:
 * 1. Charger le module 01-config.js (variables globales)
 * 2. Charger ce module 06-echelles.js
 * 3. Appeler initialiserModuleEchelles() depuis 99-main.js
 * 
 * DÉPENDANCES:
 * - echapperHtml() depuis 01-config.js
 * - Classes CSS depuis styles.css
 * 
 * LOCALSTORAGE:
 * - 'echellesTemplates': Array des échelles sauvegardées
 * - 'niveauxEchelle': Array des niveaux de l'échelle actuelle (temporaire)
 * - 'configEchelle': Objet de configuration globale
 * 
 * MODULES DÉPENDANTS:
 * - 04-productions.js: Utilise les échelles pour l'évaluation
 * - 07-cartouches.js: Utilise les niveaux pour les rétroactions
 * 
 * ÉVÉNEMENTS:
 * Tous les événements sont gérés via attributs HTML (onchange, onclick)
 * Pas d'addEventListener requis dans 99-main.js
 * 
 * COMPATIBILITÉ:
 * - Nécessite ES6+ pour les arrow functions et template literals
 * - Fonctionne avec tous les navigateurs modernes
 * - Pas de dépendances externes
 */