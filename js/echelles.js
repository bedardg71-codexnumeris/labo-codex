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
        max: 64.99,
        valeurCalcul: 32,
        couleur: 'var(--risque-critique)'
    },
    {
        code: 'D',
        nom: 'En Développement',
        description: 'Multistructurel',
        min: 65,
        max: 74.99,
        valeurCalcul: 69.5,
        couleur: 'var(--risque-modere)'
    },
    {
        code: 'M',
        nom: 'Maîtrisé',
        description: 'Relationnel',
        min: 75,
        max: 84.99,
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
   NOUVELLE VUE HIÉRARCHIQUE
   Affichage toutes les échelles avec leurs niveaux
   =============================== */

/**
 * Affiche toutes les échelles avec leurs niveaux
 *
 * FONCTIONNEMENT:
 * - Utilise <details> pour sections repliables
 * - Chaque échelle montre ses niveaux
 * - Bouton contextuel pour ajouter un niveau à l'échelle
 * - Affiche aperçu visuel de l'échelle
 */
async function afficherToutesLesEchellesNiveaux() {
    const container = document.getElementById('vueEchellesNiveaux');
    if (!container) return;

    const echelles = await db.get('echellesTemplates') ||  [];

    if (echelles.length === 0) {
        container.innerHTML = `
            <div class="echelle-zone-bleu-pale">
                <p style="color: var(--bleu-leger);">Aucune échelle définie</p>
                <small>Créez une échelle en utilisant le formulaire ci-dessous</small>
            </div>
        `;
        return;
    }

    /**
     * Fonction helper pour générer le HTML d'un niveau
     */
    function genererHtmlNiveau(niveau, echelleId) {
        return `
            <div class="item-liste" style="margin-bottom: 10px;">
                <div class="echelle-grid-niveaux">
                    <div>
                        <label class="echelle-texte-mini-bleu">Code</label>
                        <strong style="font-size: 1.1rem; color: var(--bleu-principal);">${echapperHtml(niveau.code)}</strong>
                    </div>
                    <div>
                        <label class="echelle-texte-mini-bleu">Nom</label>
                        <span class="u-texte-09">${echapperHtml(niveau.nom)}</span>
                    </div>
                    <div>
                        <label class="echelle-texte-mini-bleu">Description</label>
                        <span class="echelle-texte-detail">${echapperHtml(niveau.description || '')}</span>
                    </div>
                    <div>
                        <label class="echelle-texte-mini-bleu">Min</label>
                        <span class="u-texte-09">${niveau.min}%</span>
                    </div>
                    <div>
                        <label class="echelle-texte-mini-bleu">Max</label>
                        <span class="u-texte-09">${niveau.max}%</span>
                    </div>
                    <div class="echelle-text-center">
                        <div style="width: 30px; height: 30px; background: ${niveau.couleur};
                             border-radius: 4px; border: 1px solid #ccc; display: inline-block;"></div>
                    </div>
                </div>
            </div>
        `;
    }

    // Construire le HTML
    const html = echelles.map(echelle => {
        const niveaux = echelle.niveaux || [];

        return `
            <details class="echelle-section" open style="margin-bottom: 20px; border: 2px solid var(--bleu-moyen);
                     border-radius: 8px; background: white; overflow: hidden;">
                <summary style="padding: 15px; background: linear-gradient(135deg, var(--bleu-principal) 0%, var(--bleu-moyen) 100%);
                         color: white; font-weight: 600; font-size: 1.05rem; cursor: pointer;
                         user-select: none; display: flex; justify-content: space-between; align-items: center;">
                    <span>📊 ${echapperHtml(echelle.nom)}</span>
                    <span style="font-size: 0.9rem; font-weight: normal; opacity: 0.9;">
                        ${niveaux.length} niveau${niveaux.length > 1 ? 'x' : ''}
                    </span>
                </summary>
                <div class="echelle-p-15">
                    ${niveaux.length > 0 ? `
                        <div class="u-mb-15">
                            ${niveaux.map(n => genererHtmlNiveau(n, echelle.id)).join('')}
                        </div>

                        <!-- Aperçu visuel de l'échelle -->
                        <div style="margin-bottom: 15px; padding: 15px; background: var(--bleu-tres-pale); border-radius: 6px;">
                            <strong style="display: block; margin-bottom: 10px; color: var(--bleu-principal);">Aperçu visuel :</strong>
                            <div class="echelle-relative">
                                <div class="echelle-flex-seuils">
                                    ${niveaux.map(n => {
                                        const largeur = n.max - n.min + 1;
                                        return `
                                            <div style="flex: ${largeur}; background: ${n.couleur};
                                                 border-radius: 4px; display: flex; align-items: center; justify-content: center;
                                                 color: white; font-weight: bold; font-size: 0.9rem; text-shadow: 0 1px 2px rgba(0,0,0,0.5);">
                                                ${n.code}
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                                <div style="display: flex; margin-top: 5px; font-size: 0.7rem; color: #666; position: relative;">
                                    <span class="echelle-position-left">0%</span>
                                    ${niveaux.map((n, idx) => {
                                        // Calculer la position de chaque séparateur
                                        const position = ((n.max + 1) / 100) * 100; // Position en %
                                        return idx < niveaux.length - 1 ? `
                                            <span style="position: absolute; left: ${position}%; transform: translateX(-50%);">
                                                ${n.max}% | ${n.max + 1}%
                                            </span>
                                        ` : '';
                                    }).join('')}
                                    <span class="echelle-position-right">100%</span>
                                </div>
                            </div>
                        </div>
                    ` : `
                        <p style="color: var(--bleu-leger); font-style: italic; margin-bottom: 15px;">
                            Aucun niveau pour cette échelle
                        </p>
                    `}

                    <div style="display: flex; gap: 10px;">
                        <button class="btn btn-modifier" onclick="(async () => { await chargerEchelleTemplate('${echelle.id}'); })()">
                            Modifier
                        </button>
                        <button class="btn btn-principal" onclick="(async () => { await dupliquerEchelle('${echelle.id}'); })()">
                            Dupliquer
                        </button>
                        <button class="btn btn-supprimer" onclick="(async () => { await supprimerEchelle('${echelle.id}'); })()">
                            Supprimer
                        </button>
                    </div>
                </div>
            </details>
        `;
    }).join('');

    container.innerHTML = html;
}

/**
 * Ajoute un niveau à une échelle spécifique
 *
 * @param {string} echelleId - ID de l'échelle
 *
 * FONCTIONNEMENT:
 * 1. Charge l'échelle dans le select
 * 2. Affiche le formulaire de niveau
 * 3. Scroll vers le formulaire
 */
async function ajouterNiveauAEchelle(echelleId) {
    // Charger l'échelle dans le select
    const select = document.getElementById('selectEchelleTemplate');
    if (select) {
        select.value = echelleId;
        await chargerEchelleTemplate();
    }

    // Scroll vers le tableau des niveaux
    const tableau = document.getElementById('tableauNiveaux');
    if (tableau) {
        tableau.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

/**
 * Duplique une échelle spécifique par son ID
 *
 * @param {string} echelleId - ID de l'échelle à dupliquer
 *
 * FONCTIONNEMENT:
 * 1. Trouve l'échelle dans localStorage
 * 2. Crée une copie avec un nouveau nom
 * 3. Sauvegarde la copie
 * 4. Rafraîchit l'affichage
 */
async function dupliquerEchelle(echelleId) {
    const echelles = await db.get('echellesTemplates') ||  [];
    const echelle = echelles.find(e => e.id === echelleId);

    if (!echelle) {
        console.error('Échelle introuvable:', echelleId);
        return;
    }

    const nouveauNom = prompt('Nom de la nouvelle échelle :', echelle.nom + ' (copie)');
    if (!nouveauNom) return;

    const nouvelleEchelle = {
        id: 'ECH' + Date.now(),
        nom: nouveauNom,
        niveaux: JSON.parse(JSON.stringify(echelle.niveaux || [])), // Copie profonde
        config: JSON.parse(JSON.stringify(echelle.config || {})),
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString(),
        baseSur: echelle.nom,
        dansBibliotheque: true  // ✅ AJOUT (8 décembre 2025) - Échelle dupliquée dans bibliothèque par défaut
    };

    echelles.push(nouvelleEchelle);
    await db.set('echellesTemplates',  echelles);

    // Mettre à jour l'interface
    await chargerEchellesTemplates();
    await afficherToutesLesEchellesNiveaux();

    // ✅ AJOUT (8 décembre 2025) : Rafraîchir la barre latérale
    await afficherListeEchelles();

    afficherNotificationSucces(`📑 Échelle «${nouvelleEchelle.nom}» créée avec succès !`);
}

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
/**
 * ✅ AJOUT (8 décembre 2025) : Migration des échelles existantes vers le système de bibliothèque
 * Ajoute le flag dansBibliotheque=true à toutes les échelles existantes qui n'ont pas ce flag
 */
async function migrerEchellesVersBibliotheque() {
    const echelles = await db.get('echellesTemplates') || [];

    let nbMigrees = 0;
    echelles.forEach(echelle => {
        if (echelle.dansBibliotheque === undefined) {
            echelle.dansBibliotheque = true;
            nbMigrees++;
        }
    });

    if (nbMigrees > 0) {
        await db.set('echellesTemplates', echelles);
        console.log(`✅ Migration bibliothèque: ${nbMigrees} échelle(s) ajoutée(s) à la bibliothèque`);
    }
}

async function initialiserModuleEchelles() {
    console.log('📈 Initialisation du module Échelles de performance');

    // ✅ AJOUT (8 décembre 2025) : Migration vers système de bibliothèque
    await migrerEchellesVersBibliotheque();

    // Afficher la sidebar avec la liste des échelles (Beta 80.5+)
    if (typeof afficherListeEchelles === 'function') {
        await afficherListeEchelles();
    }

    // Vérifier que nous sommes dans la bonne section
    const elementTypeEchelle = document.getElementById('typeEchelle');
    if (!elementTypeEchelle) {
        console.log('   ⚠️  Section échelles non active (layout sidebar actif)');
        return;
    }

    // Charger les échelles templates
    await chargerEchellesTemplates();

    // Afficher la nouvelle vue hiérarchique
    await afficherToutesLesEchellesNiveaux();

    // Charger la configuration
    await chargerConfigurationEchelle();

    console.log('   ✅ Module Échelles initialisé avec nouvelle vue hiérarchique');
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
 * - await enregistrerCommeEchelle()
 */
async function chargerEchellesTemplates() {
    const select = document.getElementById('selectEchelleTemplate');
    if (!select) return;

    const echelles = await db.get('echellesTemplates') ||  [];

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
 * @param {string} echelleId - ID optionnel de l'échelle à charger
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
async function chargerEchelleTemplate(echelleId) {
    const select = document.getElementById('selectEchelleTemplate');
    const selectValue = echelleId || (select ? select.value : '');
    const nomContainer = document.getElementById('nomEchelleContainer');
    const btnDupliquer = document.getElementById('btnDupliquerEchelle');
    const btnSupprimer = document.getElementById('btnSupprimerEchelle');

    if (!selectValue || selectValue === 'new') {
        // Nouvelle échelle
        nomContainer.style.display = 'block';
        document.getElementById('nomEchelleTemplate').value = '';

        // Réinitialiser aux valeurs par défaut
        await reinitialiserNiveauxDefaut();
        echelleTemplateActuelle = null;

        // Note: Export/Import se font maintenant via la bibliothèque
        // Masquer les boutons dupliquer et supprimer
        if (btnDupliquer) btnDupliquer.style.display = 'none';
        if (btnSupprimer) btnSupprimer.style.display = 'none';

    } else {
        // Charger une échelle existante
        const echelles = await db.get('echellesTemplates') ||  [];
        const echelle = echelles.find(e => e.id === selectValue);

        if (echelle) {
            // Mettre à jour le select si un ID a été passé en paramètre
            if (echelleId && select) {
                select.value = echelleId;
            }

            nomContainer.style.display = 'block';
            document.getElementById('nomEchelleTemplate').value = echelle.nom;

            // Charger les niveaux
            await db.set('niveauxEchelle',  echelle.niveaux);
            afficherTableauNiveaux(echelle.niveaux);
            afficherApercuEchelle(echelle.niveaux);

            // Charger la configuration
            if (echelle.config) {
                await db.set('configEchelle',  echelle.config);

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

            // Afficher les boutons dupliquer, exporter, importer et supprimer
            if (btnDupliquer) btnDupliquer.style.display = 'inline-block';
            if (btnExporter) btnExporter.style.display = 'inline-block';
            if (btnImporter) btnImporter.style.display = 'inline-block';
            if (btnSupprimer) btnSupprimer.style.display = 'inline-block';

            // Scroll vers le formulaire pour que l'utilisateur voie le changement
            const formulaire = document.getElementById('formEchelle');
            if (formulaire) {
                formulaire.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }
}

/**
 * Sauvegarde le nom de l'échelle actuelle
 * Appelée lors du changement de valeur dans #nomEchelleTemplate
 *
 * FONCTIONNEMENT:
 * Met à jour le nom de l'échelle en mémoire ET dans localStorage
 */
async function sauvegarderNomEchelle() {
    const nom = document.getElementById('nomEchelleTemplate')?.value?.trim();
    if (echelleTemplateActuelle && echelleTemplateActuelle.id && nom) {
        // CRITIQUE: Vérifier la synchronisation avec localStorage pour éviter perte de données
        const echellesActuelles = await db.get('echellesTemplates') ||  [];
        const echelleActuelleEnStorage = echellesActuelles.find(e => e.id === echelleTemplateActuelle.id);

        // Protection: Si désynchronisation détectée, resynchroniser depuis localStorage
        if (echelleActuelleEnStorage &&
            echelleActuelleEnStorage.niveaux?.length !== echelleTemplateActuelle.niveaux?.length) {
            console.warn('⚠️ Désynchronisation détectée - Resynchronisation depuis localStorage');
            echelleTemplateActuelle = { ...echelleActuelleEnStorage };
        }

        // Lire les pratiques compatibles sélectionnées
        const pratiquesCompatibles = typeof GabaritsUtils !== 'undefined'
            ? GabaritsUtils.lirePratiquesSelectionnees('echelle')
            : [];

        // Mettre à jour en mémoire
        echelleTemplateActuelle.nom = nom;
        echelleTemplateActuelle.pratiquesCompatibles = pratiquesCompatibles;
        echelleTemplateActuelle.dateModification = new Date().toISOString();

        // Mettre à jour dans localStorage - SAUVEGARDER TOUTE L'ÉCHELLE (y compris les niveaux)
        let echelles = await db.get('echellesTemplates') ||  [];
        const index = echelles.findIndex(e => e.id === echelleTemplateActuelle.id);
        if (index !== -1) {
            echelles[index] = { ...echelleTemplateActuelle };
            await db.set('echellesTemplates',  echelles);

            // Recharger la sidebar ET le select pour afficher le nouveau nom
            await afficherListeEchelles();
            await definirEchelleActive(echelleTemplateActuelle.id);
            await chargerEchellesTemplates();
            document.getElementById('selectEchelleTemplate').value = echelleTemplateActuelle.id;
        }
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
async function enregistrerCommeEchelle() {
    const nomEchelle = document.getElementById('nomEchelleTemplate')?.value?.trim();

    if (!nomEchelle) {
        alert('Le nom de l\'échelle est obligatoire');
        return;
    }

    let echelles = await db.get('echellesTemplates') ||  [];

    // Vérifier si on modifie une échelle existante
    if (echelleTemplateActuelle && echelleTemplateActuelle.id) {
        // Mise à jour d'une échelle existante
        const index = echelles.findIndex(e => e.id === echelleTemplateActuelle.id);
        if (index !== -1) {
            // CRITIQUE: Utiliser echelleTemplateActuelle.niveaux (version à jour avec modifications récentes)
            // au lieu de db.getSync('niveauxEchelle') (ancienne version obsolète)
            echelles[index] = {
                ...echelleTemplateActuelle,
                nom: nomEchelle,
                niveaux: echelleTemplateActuelle.niveaux.map(n => ({ ...n })),
                dateModification: new Date().toISOString()
            };
        }
    } else {
        // Nouvelle échelle - utiliser niveauxEchelle de localStorage (comportement normal pour création)
        const niveaux = await db.get('niveauxEchelle') ||  niveauxDefaut;
        const config = await db.get('configEchelle') ||  {};

        const nouvelleEchelle = {
            id: 'ECH' + Date.now(),
            nom: nomEchelle,
            niveaux: niveaux.map(n => ({ ...n })),
            config: { ...config },
            dateCreation: new Date().toISOString(),
            dateModification: new Date().toISOString(),
            dansBibliotheque: true  // ✅ AJOUT (8 décembre 2025) - Nouvelle échelle dans bibliothèque par défaut
        };

        echelles.push(nouvelleEchelle);
        echelleTemplateActuelle = nouvelleEchelle;
    }

    // Sauvegarder
    await db.set('echellesTemplates',  echelles);

    // Recharger le select et sélectionner l'échelle actuelle
    await chargerEchellesTemplates();
    await afficherToutesLesEchellesNiveaux();

    // ✅ AJOUT (8 décembre 2025) : Rafraîchir la barre latérale
    await afficherListeEchelles();

    document.getElementById('selectEchelleTemplate').value = echelleTemplateActuelle.id;

    afficherNotificationSucces(`Échelle «${nomEchelle}» enregistrée avec succès !`);

    // Retourner à l'accueil après la sauvegarde
    setTimeout(() => {
        annulerEditionEchelle();
    }, 1500); // Attendre 1.5s pour que l'utilisateur voie la notification
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
async function dupliquerEchelleActuelle() {
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

    let echelles = await db.get('echellesTemplates') ||  [];
    echelles.push(nouvelleEchelle);
    await db.set('echellesTemplates',  echelles);

    // Mettre à jour l'interface
    echelleTemplateActuelle = nouvelleEchelle;
    await chargerEchellesTemplates();
    await afficherToutesLesEchellesNiveaux();
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
async function supprimerEchelle(echelleId) {
    if (!confirm('Supprimer cette échelle ?')) return;

    let echelles = await db.get('echellesTemplates') ||  [];
    echelles = echelles.filter(e => e.id !== echelleId);
    await db.set('echellesTemplates',  echelles);

    await chargerEchellesTemplates();
    await afficherToutesLesEchellesNiveaux();

    // ✅ AJOUT (8 décembre 2025) : Rafraîchir la barre latérale
    await afficherListeEchelles();

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
async function chargerConfigurationEchelle() {
    const config = await db.get('configEchelle') ||  {};

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
    const niveaux = await db.get('niveauxEchelle') ||  niveauxDefaut;
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
 * - await enregistrerCommeEchelle()
 * 
 * CONFIG SAUVEGARDÉE:
 * - typeEchelle
 * - seuilReussite
 * - notePassage (optionnel)
 * - codesPersonnalises (optionnel)
 */
async function sauvegarderConfigEchelle() {
    const config = {
        typeEchelle: document.getElementById('typeEchelle').value,
        seuilReussite: parseInt(document.getElementById('seuilReussite').value) || 60,
        notePassage: document.getElementById('notePassage')?.value || '',
        codesPersonnalises: document.getElementById('codesPersonnalises')?.value || ''
    };

    await db.set('configEchelle',  config);
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
async function changerTypeEchelle() {
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

    await sauvegarderConfigEchelle();
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
 * - await chargerConfigurationEchelle()
 * - await chargerEchelleTemplate()
 * - await modifierNiveau()
 * - await ajouterNiveau()
 * - await supprimerNiveau()
 * - await reinitialiserNiveauxDefaut()
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
        <th class="echelle-w-80">Ordre</th>
        <th class="echelle-w-80">Code</th>
        <th class="echelle-w-180">Nom</th>
        <th>Description</th>
        <th class="echelle-w-80">Min (%)</th>
        <th class="echelle-w-80">Max (%)</th>
        <th class="echelle-w-100">Valeur ponctuelle</th>
        <th class="echelle-w-150">Couleur</th>
        <th class="echelle-w-120">Actions</th>
    </tr>
</thead>
            <tbody>
                ${niveaux.map((niveau, index) => `
                    <tr style="opacity: ${niveau.verrouille ? '0.7' : '1'};">
                        <td class="echelle-text-center">
                            <div style="display: flex; gap: 4px; justify-content: center;">
                                <button onclick="(async () => { await deplacerNiveauHaut(${index}); })()"
                                        class="btn btn-compact"
                                        ${index === 0 ? 'disabled' : ''}
                                        title="Déplacer vers le haut"
                                        class="echelle-padding-compact">
                                    ↑
                                </button>
                                <button onclick="(async () => { await deplacerNiveauBas(${index}); })()"
                                        class="btn btn-compact"
                                        ${index === niveaux.length - 1 ? 'disabled' : ''}
                                        title="Déplacer vers le bas"
                                        class="echelle-padding-compact">
                                    ↓
                                </button>
                            </div>
                        </td>
                        <td>
                            <input type="text"
                                   value="${echapperHtml(niveau.code)}"
                                   onchange="modifierNiveau(${index}, 'code', this.value)"
                                   class="controle-form"
                                   class="echelle-w-60-p4"
                                   >
                        </td>
                        <td>
                            <input type="text"
                                   value="${echapperHtml(niveau.nom)}"
                                   onchange="modifierNiveau(${index}, 'nom', this.value)"
                                   class="controle-form"
                                   class="echelle-w-full-p4"
                                   >
                        </td>
                        <td>
                            <input type="text"
                                   value="${echapperHtml(niveau.description || '')}"
                                   onchange="modifierNiveau(${index}, 'description', this.value)"
                                   class="controle-form"
                                   class="echelle-w-full-p4"
                                   >
                        </td>
                        <td>
                            <input type="number"
                                   value="${niveau.min}"
                                   onchange="modifierNiveau(${index}, 'min', this.value)"
                                   class="controle-form"
                                   class="echelle-w-60-p4"
                                   min="0" max="100"
                                   >
                        </td>
<td>
    <input type="number"
           value="${niveau.max}"
           onchange="modifierNiveau(${index}, 'max', this.value)"
           class="echelle-w-60" min="0" max="100"
           >
</td>
<td>
                            <input type="number"
                                   value="${niveau.valeurCalcul || ''}"
                                   onchange="modifierNiveau(${index}, 'valeurCalcul', this.value)"
                                   class="echelle-w-80" min="0" max="100" step="0.1"
                                   placeholder="Ex: 32"
                                   >
                        </td>
                        <td>
    <select onchange="modifierNiveau(${index}, 'couleur', this.value)"
            class="echelle-input-full"
            >
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
                        <td class="echelle-text-center">
                            ${niveaux.length > 1 ?
            `<button onclick="(async () => { await supprimerNiveau(${index}); })()"
                                         class="btn btn-supprimer btn-compact"
                                         ${niveau.verrouille ? 'disabled' : ''}
                                         title="${niveau.verrouille ? 'Déverrouillez d\'abord pour supprimer' : 'Supprimer ce niveau'}">
                                    Supprimer
                                </button>`
            : ''}
                            <span id="cadenas-niveau-${index}"
                                  onclick="(async () => { await basculerVerrouillageNiveau(${index}); })()"
                                  style="font-size: 1.2rem; cursor: pointer; user-select: none; margin-left: 8px;"
                                  title="${niveau.verrouille ? 'Verrouillé - Cliquez pour déverrouiller' : 'Modifiable - Cliquez pour verrouiller'}">
                                ${niveau.verrouille ? '🔒' : '🔓'}
                            </span>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        <button class="btn btn-confirmer mt-2" onclick="(async () => { await ajouterNiveau(); })()">
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
async function modifierNiveau(index, champ, valeur) {
    let niveaux = await db.get('niveauxEchelle') ||  niveauxDefaut;
    niveaux[index][champ] = valeur;
    await db.set('niveauxEchelle',  niveaux);
    
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
async function ajouterNiveau() {
    // ⚠️ REDIRECTION : Cette fonction est obsolète, utiliser await ajouterNiveauEchelle() à la place
    console.warn('⚠️ await ajouterNiveau() est obsolète. Utilisez await ajouterNiveauEchelle() à la place.');

    // Si on est dans le contexte d'une échelle de la sidebar, rediriger vers la nouvelle fonction
    if (echelleTemplateActuelle && echelleTemplateActuelle.id) {
        console.log('🔄 Redirection vers await ajouterNiveauEchelle()');
        await ajouterNiveauEchelle(echelleTemplateActuelle.id);
        return;
    }

    // Sinon, comportement ancien (pour compatibilité)
    let niveaux = await db.get('niveauxEchelle') ||  niveauxDefaut;

    niveaux.push({
        code: 'N',
        nom: 'Nouveau niveau',
        description: '',
        min: 0,
        max: 100,
        valeurCalcul: 50,
        couleur: 'var(--bleu-moyen)'
    });

    await db.set('niveauxEchelle',  niveaux);
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
async function supprimerNiveau(index) {
    if (!confirm('Supprimer ce niveau ?')) return;

    let niveaux = await db.get('niveauxEchelle') ||  niveauxDefaut;
    niveaux.splice(index, 1);
    await db.set('niveauxEchelle',  niveaux);
    afficherTableauNiveaux(niveaux);
    afficherApercuEchelle(niveaux);
}

/**
 * Déplace un niveau vers le haut dans la liste
 *
 * FONCTIONNEMENT:
 * 1. Récupère les niveaux depuis localStorage
 * 2. Échange le niveau avec celui du dessus
 * 3. Sauvegarde et met à jour l'affichage
 *
 * PARAMÈTRES:
 * @param {number} index - Index du niveau à déplacer
 *
 * UTILISÉ PAR:
 * - Bouton ↑ dans la colonne Ordre
 *
 * SÉCURITÉ:
 * - Désactivé pour le premier niveau (index 0)
 */
async function deplacerNiveauHaut(index) {
    if (index === 0) return;

    let niveaux = await db.get('niveauxEchelle') ||  niveauxDefaut;

    // Échanger avec le niveau précédent
    [niveaux[index - 1], niveaux[index]] = [niveaux[index], niveaux[index - 1]];

    await db.set('niveauxEchelle',  niveaux);
    afficherTableauNiveaux(niveaux);
    afficherApercuEchelle(niveaux);
}

/**
 * Déplace un niveau vers le bas dans la liste
 *
 * FONCTIONNEMENT:
 * 1. Récupère les niveaux depuis localStorage
 * 2. Échange le niveau avec celui du dessous
 * 3. Sauvegarde et met à jour l'affichage
 *
 * PARAMÈTRES:
 * @param {number} index - Index du niveau à déplacer
 *
 * UTILISÉ PAR:
 * - Bouton ↓ dans la colonne Ordre
 *
 * SÉCURITÉ:
 * - Désactivé pour le dernier niveau
 */
async function deplacerNiveauBas(index) {
    let niveaux = await db.get('niveauxEchelle') ||  niveauxDefaut;

    if (index === niveaux.length - 1) return;

    // Échanger avec le niveau suivant
    [niveaux[index], niveaux[index + 1]] = [niveaux[index + 1], niveaux[index]];

    await db.set('niveauxEchelle',  niveaux);
    afficherTableauNiveaux(niveaux);
    afficherApercuEchelle(niveaux);
}

/**
 * Bascule le verrouillage d'un niveau
 *
 * FONCTIONNEMENT:
 * 1. Récupère les niveaux depuis localStorage
 * 2. Toggle la propriété verrouille du niveau
 * 3. Sauvegarde dans localStorage
 * 4. Met à jour le cadenas immédiatement dans le DOM
 * 5. Rafraîchit le tableau pour mettre à jour l'état disabled
 *
 * PARAMÈTRES:
 * @param {number} index - Index du niveau à verrouiller/déverrouiller
 *
 * UTILISÉ PAR:
 * - Clic sur le cadenas dans la colonne Actions
 *
 * EFFET VISUEL:
 * - Cadenas 🔓 → 🔒 (ou inverse)
 * - Inputs disabled si verrouillé
 * - Opacité réduite si verrouillé
 */
async function basculerVerrouillageNiveau(index) {
    let niveaux = await db.get('niveauxEchelle') ||  niveauxDefaut;

    // Toggle le verrouillage
    niveaux[index].verrouille = !niveaux[index].verrouille;
    const estVerrouille = niveaux[index].verrouille;

    // Sauvegarder dans localStorage
    await db.set('niveauxEchelle',  niveaux);

    // Mettre à jour le cadenas dans le DOM immédiatement
    const cadenasElement = document.getElementById(`cadenas-niveau-${index}`);
    if (cadenasElement) {
        cadenasElement.textContent = estVerrouille ? '🔒' : '🔓';
        cadenasElement.title = estVerrouille ? 'Verrouillé - Cliquez pour déverrouiller' : 'Modifiable - Cliquez pour verrouiller';
    }

    // Rafraîchir le tableau pour mettre à jour l'état disabled et l'opacité
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
 * - await chargerEchelleTemplate() (nouvelle échelle)
 *
 * SÉCURITÉ:
 * - Confirmation obligatoire
 * - Perte des modifications actuelles
 */
async function reinitialiserNiveauxDefaut() {
    if (!confirm('Réinitialiser aux niveaux par défaut ? Les modifications seront perdues.')) return;

    await db.set('niveauxEchelle',  niveauxDefaut);
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
async function sauvegarderNiveaux() {
    const niveaux = await db.get('niveauxEchelle') ||  niveauxDefaut;

    // Vérifier la cohérence
    let erreurs = [];
    niveaux.forEach((niveau, i) => {
        if (!niveau.code || !niveau.nom) {
            erreurs.push(`Niveau ${i + 1}: Code et nom obligatoires`);
        }
        // Permettre min === max seulement pour le niveau 0 (min=0, max=0)
        if (niveau.min > niveau.max || (niveau.min === niveau.max && niveau.min !== 0)) {
            erreurs.push(`Niveau ${i + 1}: Min doit être < Max (sauf pour niveau 0: min=0, max=0)`);
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
 * - await chargerConfigurationEchelle()
 * - await chargerEchelleTemplate()
 * - await modifierNiveau()
 * - await ajouterNiveau()
 * - await supprimerNiveau()
 * - await reinitialiserNiveauxDefaut()
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
            <div class="echelle-texte-petit-mt5">${niveau.min}%-${niveau.max}%</div>
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
async function genererNiveauxPersonnalises() {
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

    await db.set('niveauxEchelle',  niveaux);
    afficherTableauNiveaux(niveaux);
    afficherApercuEchelle(niveaux);
    await sauvegarderConfigEchelle();
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
async function chargerEchellePerformance() {
    const echelles = await db.get('echellesTemplates') ||  [];
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

/* ===============================
   EXPORT/IMPORT AVEC LICENCE CC
   =============================== */

/**
 * Exporte les échelles de performance avec métadonnées Creative Commons
 * Les exports incluent uniquement la structure des échelles et niveaux,
 * JAMAIS les données d'étudiants ou les évaluations
 *
 * FONCTIONNEMENT:
 * 1. Charge toutes les échelles depuis localStorage
 * 2. Ajoute métadonnées CC BY-NC-SA 4.0 (auteur, licence, version)
 * 3. Génère nom de fichier avec watermark CC
 * 4. Télécharge le fichier JSON
 *
 * FORMAT EXPORT:
 * {
 *   metadata: { licence, auteur_original, version, date, ... },
 *   contenu: { echelles: [...] }
 * }
 */
async function exporterEchelles() {
    const echelles = await db.get('echellesTemplates') ||  [];

    if (echelles.length === 0) {
        alert('Aucune échelle à exporter.');
        return;
    }

    // NOUVEAU (Beta 91): Demander métadonnées enrichies
    const metaEnrichies = await demanderMetadonneesEnrichies(
        'Échelles de performance',
        `${echelles.length} échelle(s)`
    );

    if (!metaEnrichies) {
        console.log('Export annulé par l\'utilisateur');
        return;
    }

    // Emballer avec métadonnées CC enrichies
    const donnees = ajouterMetadonnéesCC(
        { echelles: echelles },
        'echelles',
        'Échelles de performance',
        metaEnrichies
    );

    // Générer nom de fichier avec watermark CC
    const nomFichier = genererNomFichierCC(
        'echelles',
        'Echelles-performance',
        donnees.metadata.version
    );

    // Télécharger
    const blob = new Blob([JSON.stringify(donnees, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nomFichier;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('✅ Échelles exportées avec licence CC BY-NC-SA 4.0');
    if (typeof afficherNotificationSucces === 'function') {
        afficherNotificationSucces(`${echelles.length} échelle(s) exportée(s) avec succès`);
    }
}

/**
 * Exporte l'échelle actuellement en cours d'édition
 * Avec support des métadonnées CC et suivi des contributeurs
 */
async function exporterEchelleActive() {
    if (!echelleTemplateActuelle) {
        alert('Aucune échelle sélectionnée à exporter.');
        return;
    }

    const echelles = await db.get('echellesTemplates') ||  [];
    const echelle = echelles.find(e => e.id === echelleTemplateActuelle.id);

    if (!echelle) {
        alert('Échelle introuvable.');
        return;
    }

    // NOUVEAU (Beta 91): Demander métadonnées enrichies
    const metaEnrichies = await demanderMetadonneesEnrichies(
        'Échelle de performance',
        echelle.nom
    );

    if (!metaEnrichies) {
        console.log('Export annulé par l\'utilisateur');
        return;
    }

    // Préparer le contenu pour l'export
    let contenuExport = { ...echelle };

    // Si l'échelle a été importée avec des métadonnées CC, ajouter l'utilisateur actuel comme contributeur
    if (echelle.metadata_cc) {
        // Demander le nom de l'utilisateur s'il modifie le matériel
        const nomUtilisateur = prompt(
            'Vous allez exporter un matériel créé par ' + echelle.metadata_cc.auteur_original + '.\n\n' +
            'Entrez votre nom pour être crédité comme contributeur :\n' +
            '(Laissez vide si vous n\'avez fait aucune modification)'
        );

        if (nomUtilisateur && nomUtilisateur.trim()) {
            // Ajouter le contributeur
            const contributeurs = echelle.metadata_cc.contributeurs || [];
            contributeurs.push({
                nom: nomUtilisateur.trim(),
                date: new Date().toISOString().split('T')[0],
                modifications: 'Modifications et adaptations'
            });

            // Créer les métadonnées enrichies
            contenuExport.metadata_cc = {
                ...echelle.metadata_cc,
                contributeurs: contributeurs
            };
        }
    }

    // Ajouter les métadonnées CC enrichies
    const exportAvecCC = ajouterMetadonnéesCC(contenuExport, 'echelle-performance', echelle.nom, metaEnrichies);

    const json = JSON.stringify(exportAvecCC, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const nomFichier = (echelle.nom || 'echelle').replace(/[^a-z0-9]/gi, '-').toLowerCase();
    a.download = `echelle-${nomFichier}-CC-BY-SA-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    console.log('✅ Échelle exportée avec licence CC BY-NC-SA 4.0');
    if (typeof afficherNotificationSucces === 'function') {
        afficherNotificationSucces(`Échelle "${echelle.nom}" exportée avec succès`);
    }
}

/**
 * Importe un fichier JSON pour remplacer l'échelle actuellement en cours d'édition
 * NOUVEAU (Beta 92): Support métadonnées Creative Commons
 */
async function importerDansEchelleActive(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Récupérer l'ID de l'échelle active
    if (!echelleTemplateActuelle || !echelleTemplateActuelle.id) {
        alert('Aucune échelle sélectionnée. Veuillez d\'abord sélectionner une échelle à remplacer.');
        event.target.value = ''; // Reset input
        return;
    }

    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            const donnees = JSON.parse(e.target.result);

            // Valider que c'est bien une échelle
            if (!donnees || typeof donnees !== 'object') {
                alert('Le fichier JSON n\'est pas valide.');
                event.target.value = '';
                return;
            }

            // Extraire le contenu (supporter ancien format direct et nouveau format avec metadata CC)
            let echelleImportee;
            let metadata = null;

            if (donnees.contenu) {
                // Nouveau format avec CC metadata
                metadata = donnees.metadata;
                echelleImportee = donnees.contenu;
            } else {
                // Ancien format direct
                echelleImportee = donnees;
            }

            // Afficher badge CC si présent
            let messageConfirmation = '';
            if (metadata && metadata.licence && metadata.licence.includes("CC")) {
                messageConfirmation = `📋 Matériel sous licence ${metadata.licence}\n` +
                    `👤 Auteur: ${metadata.auteur_original}\n` +
                    `📅 Créé le: ${metadata.date_creation}\n\n`;
            }

            // Confirmer le remplacement
            const confirmation = confirm(
                messageConfirmation +
                `⚠️ ATTENTION: Cette action va remplacer l'échelle actuelle.\n\n` +
                `Voulez-vous continuer ?`
            );

            if (!confirmation) {
                console.log('Import annulé par l\'utilisateur');
                event.target.value = '';
                return;
            }

            // Récupérer les échelles
            const echelles = await db.get('echellesTemplates') ||  [];
            const index = echelles.findIndex(e => e.id === echelleTemplateActuelle.id);

            if (index === -1) {
                alert('Échelle introuvable.');
                event.target.value = '';
                return;
            }

            // Préserver l'ID original et remplacer les données
            const echelleMiseAJour = {
                ...echelleImportee,
                id: echelleTemplateActuelle.id // Garder l'ID original
            };

            // Préserver les métadonnées CC si présentes
            if (metadata) {
                echelleMiseAJour.metadata_cc = metadata;
            }

            // Remplacer dans le tableau
            echelles[index] = echelleMiseAJour;

            // Sauvegarder
            await db.set('echellesTemplates',  echelles);

            // Recharger l'échelle dans le formulaire
            await chargerEchellePourModif(echelleTemplateActuelle.id);

            // Rafraîchir la liste
            afficherEchellesExistantes();

            console.log('✅ Échelle importée et remplacée avec succès');
            if (typeof afficherNotificationSucces === 'function') {
                afficherNotificationSucces('Échelle importée et remplacée avec succès');
            } else {
                alert('Échelle importée et remplacée avec succès !');
            }

        } catch (error) {
            console.error('Erreur lors de l\'import:', error);
            alert('Erreur lors de la lecture du fichier JSON. Assurez-vous qu\'il s\'agit d\'un fichier valide.');
        } finally {
            event.target.value = ''; // Reset input
        }
    };

    reader.readAsText(file);
}

/**
 * Importe des échelles depuis un fichier JSON avec gestion CC
 *
 * FONCTIONNEMENT:
 * 1. Lit le fichier JSON sélectionné
 * 2. Vérifie et affiche la licence CC (si présente)
 * 3. Valide la structure des données
 * 4. Fusionne avec échelles existantes
 * 5. Rafraîchit l'interface
 *
 * GESTION LICENCE:
 * - Affiche badge CC si licence présente
 * - Avertit si pas de licence (droit d'auteur classique)
 * - Demande confirmation avant import
 *
 * @param {Event} event - Événement de changement du file input
 */
async function importerEchelles(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const donnees = JSON.parse(e.target.result);

            // Stocker temporairement dans une variable globale pour éviter problèmes sérialisation
            window._echellesImportEnAttente = donnees;

            // Vérifier licence CC et afficher badge
            const estCC = verifierLicenceCC(donnees);

            let message = estCC ?
                '<div style="margin-bottom: 15px;">' + genererBadgeCC(donnees.metadata) + '</div>' :
                '';

            message += '<p><strong>Voulez-vous importer ces échelles ?</strong></p>';

            // Créer modal avec badge CC
            const modal = document.createElement('div');
            modal.innerHTML = `
                <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 10001; display: flex; align-items: center; justify-content: center;">
                    <div style="background: white; padding: 20px; border-radius: 8px; max-width: 600px; max-height: 80vh; overflow-y: auto;">
                        ${message}
                        <div style="display: flex; gap: 10px; margin-top: 15px; justify-content: flex-end;">
                            <button class="btn" onclick="this.closest('div[style*=fixed]').parentElement.remove(); delete window._echellesImportEnAttente;">Annuler</button>
                            <button class="btn btn-confirmer" onclick="window.confirmerImportEchelles(window._echellesImportEnAttente); this.closest('div[style*=fixed]').parentElement.remove(); delete window._echellesImportEnAttente;">Importer</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            // Avertir si pas de licence CC
            if (!estCC) {
                avertirSansLicence(donnees);
            }

        } catch (error) {
            console.error('Erreur lors de l\'import:', error);
            alert('❌ Erreur lors de la lecture du fichier.\n' + error.message);
        }
    };
    reader.readAsText(file);

    // Réinitialiser l'input pour permettre le même fichier
    event.target.value = '';
}

/**
 * Confirme l'import et fusionne les échelles
 * Fonction helper appelée depuis le modal de confirmation
 */
window.confirmerImportEchelles = async function(donnees) {
    try {
        // Extraire le contenu (supporter ancien format direct et nouveau format avec metadata)
        let echellesImportees;

        if (donnees.contenu) {
            // Nouveau format avec CC metadata
            if (donnees.contenu.echelles) {
                // Batch export: { metadata, contenu: { echelles: [...] } }
                echellesImportees = donnees.contenu.echelles;
            } else {
                // Individual export: { metadata, contenu: { ...échelle... } }
                // Préserver metadata_cc dans l'échelle
                const echelle = { ...donnees.contenu };
                echelle.metadata_cc = donnees.metadata;
                echellesImportees = [echelle];
            }
        } else {
            // Ancien format direct
            echellesImportees = donnees.echelles || [donnees];
        }

        if (!Array.isArray(echellesImportees)) {
            throw new Error('Format invalide: échelles doit être un tableau');
        }

        // Charger échelles existantes
        const echellesExistantes = await db.get('echellesTemplates') ||  [];

        // Fusionner (remplacer si même ID, sinon ajouter)
        echellesImportees.forEach(echelle => {
            // ✅ AJOUT (8 décembre 2025) : Les échelles importées ne sont pas automatiquement dans la bibliothèque
            // L'utilisateur doit utiliser "Gérer la bibliothèque" pour les ajouter à la barre latérale
            echelle.dansBibliotheque = false;

            const index = echellesExistantes.findIndex(e => e.id === echelle.id);
            if (index >= 0) {
                echellesExistantes[index] = echelle;
            } else {
                echellesExistantes.push(echelle);
            }
        });

        // Sauvegarder
        await db.set('echellesTemplates',  echellesExistantes);

        // Rafraîchir l'affichage
        if (typeof afficherToutesLesEchellesNiveaux === 'function') {
            await afficherToutesLesEchellesNiveaux();
        }

        // ✅ AJOUT (8 décembre 2025) : Mention de la bibliothèque dans le message de succès
        alert(`✅ Import réussi !\n\n${echellesImportees.length} échelle(s) importée(s).\n\nUtilisez "Consulter la bibliothèque" pour les ajouter à la barre latérale.`);
        console.log('✅ Échelles importées:', echellesImportees.length);

    } catch (error) {
        console.error('Erreur lors de l\'import:', error);
        alert('❌ Erreur lors de l\'import.\n' + error.message);
    }
};

/* ===============================
   EXPORTS GLOBAUX
   =============================== */

// Exports des nouvelles fonctions hiérarchiques
window.afficherToutesLesEchellesNiveaux = afficherToutesLesEchellesNiveaux;
window.ajouterNiveauAEchelle = ajouterNiveauAEchelle;
window.dupliquerEchelle = dupliquerEchelle;

// Exports des fonctions existantes (pour compatibilité)
window.initialiserModuleEchelles = initialiserModuleEchelles;
window.chargerEchellesTemplates = chargerEchellesTemplates;
window.chargerEchelleTemplate = chargerEchelleTemplate;
window.supprimerEchelle = supprimerEchelle;
window.dupliquerEchelleActuelle = dupliquerEchelleActuelle;
window.enregistrerCommeEchelle = enregistrerCommeEchelle;
window.sauvegarderNomEchelle = sauvegarderNomEchelle;
window.sauvegarderConfigEchelle = sauvegarderConfigEchelle;
window.changerTypeEchelle = changerTypeEchelle;
window.afficherTableauNiveaux = afficherTableauNiveaux;
window.afficherApercuEchelle = afficherApercuEchelle;
window.ajouterNiveau = ajouterNiveau;
window.modifierNiveau = modifierNiveau;
window.supprimerNiveau = supprimerNiveau;
window.basculerVerrouillageNiveau = basculerVerrouillageNiveau;
window.reinitialiserNiveauxDefaut = reinitialiserNiveauxDefaut;
// window.afficherEchellesPerformance = afficherEchellesPerformance; // FIXME: fonction n'existe pas
// window.fermerModalEchelles = fermerModalEchelles; // FIXME: fonction n'existe pas
// window.convertirNiveauVersNote = convertirNiveauVersNote; // FIXME: fonction n'existe pas - utiliser convertirNiveauEnPourcentage() dans portfolio.js
// window.convertirNoteVersNiveau = convertirNoteVersNiveau; // FIXME: fonction n'existe pas

// Export/Import avec licence CC
window.exporterEchelles = exporterEchelles;
window.exporterEchelleActive = exporterEchelleActive;
window.importerDansEchelleActive = importerDansEchelleActive;
window.importerEchelles = importerEchelles;

/* ===============================
   FONCTIONS SIDEBAR (Beta 80.5+)
   Layout 2 colonnes - Stubs minimaux
   =============================== */

async function afficherListeEchelles() {
    const echelles = await db.get('echellesTemplates') ||  [];
    console.log('📊 afficherListeEchelles - Nombre d\'échelles:', echelles.length);

    const container = document.getElementById('sidebarListeEchelles');
    if (!container) {
        console.warn('   ⚠️ Élément sidebarListeEchelles introuvable');
        return;
    }

    // ✅ AJOUT (8 décembre 2025) : Filtrer uniquement les échelles dans la bibliothèque
    const echellesDansBibliotheque = echelles.filter(e => e.dansBibliotheque !== false);

    // ✅ AJOUT (8 décembre 2025) : Bouton "Consulter la bibliothèque" en en-tête
    let html = `
        <div style="margin-bottom: 15px;">
            <button onclick="afficherBibliothequeEchelles()" class="btn btn-principal" style="width: 100%; font-size: 0.9rem;">
                Consulter la bibliothèque
            </button>
        </div>
    `;

    if (echellesDansBibliotheque.length === 0) {
        html += '<p class="sidebar-vide">Créez une nouvelle échelle ou puisez dans la bibliothèque</p>';
        container.innerHTML = html;
        return;
    }

    console.log('   ✅ Affichage de', echellesDansBibliotheque.length, 'échelle(s) dans la bibliothèque');

    html += echellesDansBibliotheque.map(echelle => {
        const nomEchelle = echelle.nom || 'Sans titre';
        const nbNiveaux = echelle.niveaux?.length || 0;
        // Générer badges pratiques compatibles (utilise gabarits-utils.js)
        const badgesPratiques = typeof GabaritsUtils !== 'undefined'
            ? GabaritsUtils.genererBadgesPratiques(echelle)
            : '';
        return `
            <div class="sidebar-item" data-id="${echelle.id}" onclick="(async () => { await chargerEchellePourModif('${echelle.id}'); })()">
                <div class="sidebar-item-titre">${nomEchelle}</div>
                <div class="sidebar-item-badges">${badgesPratiques} <span class="badge-caracteristique">${nbNiveaux} niveaux</span></div>
            </div>
        `;
    }).join('');

    container.innerHTML = html;
}

/**
 * ✅ AJOUT (8 décembre 2025) : Afficher le modal de gestion de la bibliothèque d'échelles
 * Permet d'ajouter/retirer des échelles de la barre latérale
 * Avec filtre par discipline
 */
async function afficherBibliothequeEchelles() {
    const echelles = await db.get('echellesTemplates') || [];

    // Séparer échelles dans la bibliothèque vs disponibles
    const echellesDansBibliotheque = echelles.filter(e => e.dansBibliotheque !== false);
    const echellesDisponibles = await obtenirToutesLesEchellesBibliotheque();

    // Obtenir les disciplines disponibles
    const disciplines = obtenirDisciplinesDisponiblesEchelles();

    let html = `
        <div id="modalBibliothequeEchelles" style="
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        ">
            <div style="
                background: white;
                border-radius: 8px;
                padding: 30px;
                max-width: 800px;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                position: relative;
            ">
                <!-- Bouton X sticky -->
                <button onclick="fermerModalBibliothequeEchelles()" style="
                    position: sticky;
                    top: 0;
                    right: 0;
                    float: right;
                    background: transparent;
                    border: none;
                    font-size: 28px;
                    color: #999;
                    cursor: pointer;
                    padding: 0;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1;
                " onmouseover="this.style.color='#333'" onmouseout="this.style.color='#999'">
                    ×
                </button>
                <h2 style="margin-top: 0; color: #2c3e50;">Bibliothèque d'échelles de performance</h2>
                <p style="color: #7f8c8d; margin-bottom: 20px;">
                    Gérez les échelles de performance affichées dans la barre latérale.
                </p>

                <!-- Section 1 : Échelles dans votre sélection -->
                <h3 style="color: var(--bleu-clair); font-size: 1.1rem; margin-top: 20px; margin-bottom: 15px;">
                    Échelles dans la barre latérale
                </h3>
                <div style="margin-bottom: 30px;">
                    <div id="listeEchellesDansBibliotheque">
    `;

    if (echellesDansBibliotheque.length === 0) {
        html += '<p style="color: #999; font-style: italic;">Aucune échelle dans la barre latérale</p>';
    } else {
        echellesDansBibliotheque.forEach(echelle => {
            const nomEchelle = echelle.nom || 'Sans titre';
            const nbNiveaux = echelle.niveaux?.length || 0;
            const discipline = echelle.discipline || '';

            html += `
                <div style="
                    border: 1px solid var(--bleu-clair);
                    border-radius: 6px;
                    padding: 15px;
                    margin-bottom: 10px;
                    background: var(--bleu-tres-pale);
                ">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div style="flex: 1;">
                            <div style="font-weight: bold; color: #2c3e50; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
                                ${typeof GabaritsUtils !== 'undefined' ? GabaritsUtils.genererBadgesPratiques(echelle) : ''}
                                ${nomEchelle}
                            </div>
                            <div style="color: #7f8c8d; font-size: 0.9em;">
                                ${nbNiveaux} niveau(x)${discipline ? ' • ' + discipline : ''}
                            </div>
                        </div>
                        <div style="display: flex; gap: 8px; margin-left: 10px;">
                            <button
                                onclick="partagerEchelle('${echelle.id}')"
                                class="btn btn-secondaire btn-tres-compact"
                                title="Partager avec la communauté">
                                Partager
                            </button>
                            <button
                                onclick="retirerEchelleDeBibliotheque('${echelle.id}')"
                                class="btn btn-supprimer btn-tres-compact"
                                title="Retirer de votre sélection">
                                Retirer
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
    }

    html += `
                    </div>

                    <!-- Bouton "Partager toutes mes échelles" après la Section 1 -->
                    <div style="margin-top: 15px; text-align: center;">
                        <button onclick="exporterEchelles()" class="btn btn-secondaire">
                            Partager toutes mes échelles
                        </button>
                    </div>
                </div>

                <!-- Section 2 : Échelles disponibles -->
                <h3 style="color: #3498db; font-size: 1.1rem; margin-top: 20px; margin-bottom: 15px;">
                    Échelles disponibles à ajouter
                </h3>

                <!-- Filtres -->
                <div style="display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 15px;">
                    <!-- Filtre par discipline -->
                    <div style="flex: 1; min-width: 200px;">
                        <label style="display: block; margin-bottom: 5px; color: #555; font-weight: 500;">
                            Filtrer par discipline :
                        </label>
                        <select id="filtreDisciplineEchelles"
                                class="controle-form"
                                onchange="filtrerEchellesBibliotheque()"
                                style="max-width: 300px;">
                            <option value="">Toutes les disciplines</option>
    `;

    disciplines.forEach(discipline => {
        html += `<option value="${discipline}">${discipline}</option>`;
    });

    html += `
                        </select>
                    </div>

                    <!-- Filtre par pratique -->
                    <div style="flex: 1; min-width: 200px;">
                        <label style="display: block; margin-bottom: 5px; color: #555; font-weight: 500;">
                            Filtrer par pratique :
                        </label>
                        <select id="filtrePratiqueEchelles"
                                class="controle-form"
                                onchange="filtrerEchellesBibliotheque()"
                                style="max-width: 300px;">
                            <option value="">Toutes les pratiques</option>
                            <option value="SOM">Sommative</option>
                            <option value="STD">PAN-Standards</option>
                            <option value="SPE">PAN-Spécifications</option>
                            <option value="DEN">PAN-Dénotation</option>
                            <option value="all">Multi-pratiques</option>
                        </select>
                    </div>
                </div>

                    <div id="listeEchellesDisponibles">
    `;

    // Organiser par discipline
    const echellesParDiscipline = {};
    echellesDisponibles.forEach(echelle => {
        const disc = echelle.discipline || 'Autre';
        if (!echellesParDiscipline[disc]) {
            echellesParDiscipline[disc] = [];
        }
        echellesParDiscipline[disc].push(echelle);
    });

    // Afficher par discipline
    Object.keys(echellesParDiscipline).sort().forEach(discipline => {
        html += `<h4 style="margin-top: 20px; margin-bottom: 10px; color: #666;">${discipline}</h4>`;

        echellesParDiscipline[discipline].forEach(echelle => {
            const nomEchelle = echelle.nom || 'Sans titre';
            const nbNiveaux = echelle.niveaux?.length || 0;
            const description = echelle.description || '';
            const auteur = echelle.auteur || '';

            // Obtenir les pratiques de l'échelle
            const pratiques = echelle.pratiques || (echelle.gabaritType ? [echelle.gabaritType] : ['all']);
            const pratiquesStr = pratiques.join(',');

            // Générer les badges de pratique
            let badgesPratiques = '';
            if (window.GabaritsUtils) {
                badgesPratiques = window.GabaritsUtils.genererBadgesPratiques(echelle);
            } else {
                // Fallback sans le module
                pratiques.forEach(p => {
                    const label = p === 'all' ? 'Multi' : p;
                    const classeCSS = p === 'all' ? '' : p.toLowerCase();
                    badgesPratiques += `<span class="badge-pratique-compact ${classeCSS}">${label}</span>`;
                });
            }

            // Vérifier si déjà dans la bibliothèque
            const dejaPresent = echelles.some(e => e.id === echelle.id && e.dansBibliotheque !== false);

            // Style spécial si c'est un gabarit
            const estGabarit = echelle.estGabarit === true;
            const styleGabarit = estGabarit ? 'border-left: 4px solid #6f42c1; background: linear-gradient(135deg, #f8f4ff 0%, #fff 100%);' : '';

            html += `
                <div class="echelle-disponible-item" data-discipline="${discipline}" data-pratiques="${pratiquesStr}" style="
                    padding: 12px;
                    background: white;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    margin-bottom: 10px;
                    display: flex;
                    justify-content: space-between;
                    align-items: start;
                    gap: 12px;
                    ${dejaPresent ? 'opacity: 0.5;' : ''}
                    ${styleGabarit}
                ">
                    <div style="flex: 1;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                            ${badgesPratiques}
                            <span style="font-weight: 500;">${nomEchelle}</span>
                            ${estGabarit ? '<span style="font-size: 0.7rem; color: #6f42c1; font-weight: 500;">(gabarit)</span>' : ''}
                        </div>
                        <div style="font-size: 0.85rem; color: #666; margin-bottom: 4px;">
                            ${nbNiveaux} niveau(x)${auteur ? ' • ' + auteur : ''}
                        </div>
                        ${description ? `<div style="font-size: 0.85rem; color: #888;">${description}</div>` : ''}
                        ${dejaPresent ? '<div style="font-size: 0.8rem; color: var(--bleu-clair); font-style: italic; margin-top: 4px;">Déjà dans la barre latérale</div>' : ''}
                    </div>
                    ${!dejaPresent ? `
                        <button
                            onclick="ajouterEchelleIndividuelle('${echelle.id}')"
                            class="btn btn-confirmer btn-tres-compact"
                            title="Ajouter cette échelle à votre sélection">
                            Ajouter à ma sélection
                        </button>
                    ` : ''}
                </div>
            `;
        });
    });

    html += `
                    </div>

                    <!-- Bouton "Ajouter des échelles" après la Section 2 -->
                    <div style="margin-top: 15px; text-align: center;">
                        <button onclick="document.getElementById('fichier-import-echelles-modal').click()" class="btn btn-secondaire">
                            Ajouter des échelles
                        </button>
                        <input type="file" id="fichier-import-echelles-modal" accept=".json" style="display: none;" onchange="importerEchelles(event)">
                    </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', html);
}

/**
 * ✅ AJOUT (8 décembre 2025) : Retirer une échelle de la bibliothèque (soft delete)
 * @param {string} id - ID de l'échelle à retirer
 */
/**
 * ✅ AJOUT (8 décembre 2025) : Ajoute une échelle individuelle à la bibliothèque
 */
async function ajouterEchelleIndividuelle(id) {
    try {
        const echelles = await db.get('echellesTemplates') || [];
        let echelle = echelles.find(e => e.id === id);

        if (!echelle) {
            const toutesEchelles = await obtenirToutesLesEchellesBibliotheque();
            const echelleSource = toutesEchelles.find(e => e.id === id);
            if (echelleSource) {
                echelle = { ...echelleSource };
                echelle.dansBibliotheque = true;
                echelles.push(echelle);
            } else {
                alert('Échelle introuvable');
                return;
            }
        } else {
            echelle.dansBibliotheque = true;
        }

        await db.set('echellesTemplates', echelles);
        fermerModalBibliothequeEchelles();
        await afficherListeEchelles();
        await afficherBibliothequeEchelles();
        alert('Échelle ajoutée à votre sélection avec succès !');
    } catch (error) {
        console.error('Erreur lors de l\'ajout:', error);
        alert('Erreur lors de l\'ajout de l\'échelle');
    }
}

/**
 * ✅ AJOUT (8 décembre 2025) : Partage une échelle avec la communauté
 */
async function partagerEchelle(id) {
    try {
        const echelles = await db.get('echellesTemplates') || [];
        const echelle = echelles.find(e => e.id === id);

        if (!echelle) {
            alert('Échelle introuvable');
            return;
        }

        const metadata = await demanderMetadonneesEnrichies('echelle', echelle.nom);
        if (!metadata) return;

        echelle.dansBibliotheque = false;
        echelle.metadata_cc = metadata;

        await db.set('echellesTemplates', echelles);
        fermerModalBibliothequeEchelles();
        await afficherListeEchelles();
        await afficherBibliothequeEchelles();

        alert('Échelle partagée avec succès !\n\nElle est maintenant disponible dans la section "Échelles disponibles à ajouter".');
    } catch (error) {
        console.error('Erreur lors du partage:', error);
        alert('Erreur lors du partage de l\'échelle');
    }
}

async function retirerEchelleDeBibliotheque(id) {
    const echelles = await db.get('echellesTemplates') || [];
    const echelle = echelles.find(e => e.id === id);

    if (!echelle) return;

    // Soft delete : marquer comme non présente dans la bibliothèque
    echelle.dansBibliotheque = false;

    await db.set('echellesTemplates', echelles);

    // Rafraîchir les affichages
    await afficherListeEchelles();
    fermerModalBibliothequeEchelles();
    await afficherBibliothequeEchelles();

    console.log(`Échelle "${echelle.nom}" retirée de la barre latérale`);
}

/**
 * ✅ AJOUT (8 décembre 2025) : Ajouter les échelles sélectionnées à la bibliothèque
 */
async function ajouterEchellesABibliotheque() {
    const checkboxes = document.querySelectorAll('#listeEchellesDisponibles input[type="checkbox"]:checked');

    if (checkboxes.length === 0) {
        alert('Veuillez sélectionner au moins une échelle à ajouter');
        return;
    }

    const echelles = await db.get('echellesTemplates') || [];
    const echellesBibliotheque = obtenirToutesLesEchellesBibliotheque();

    let nbAjoutees = 0;

    checkboxes.forEach(checkbox => {
        const echelleId = checkbox.value;

        // Trouver l'échelle dans la bibliothèque
        const echelleBiblio = echellesBibliotheque.find(e => e.id === echelleId);
        if (!echelleBiblio) return;

        // Vérifier si déjà présente
        const echelleExistante = echelles.find(e => e.id === echelleId);

        if (echelleExistante) {
            // Réactiver une échelle retirée
            echelleExistante.dansBibliotheque = true;
            nbAjoutees++;
        } else {
            // Ajouter nouvelle échelle
            const nouvelleEchelle = {
                ...echelleBiblio,
                id: echelleId + '-local',  // Ajouter suffix pour éviter conflits
                dansBibliotheque: true
            };
            echelles.push(nouvelleEchelle);
            nbAjoutees++;
        }
    });

    await db.set('echellesTemplates', echelles);

    // Rafraîchir les affichages
    await afficherListeEchelles();
    fermerModalBibliothequeEchelles();

    if (nbAjoutees > 0) {
        alert(`${nbAjoutees} échelle(s) ajoutée(s) à la barre latérale`);
    }
}

/**
 * ✅ AJOUT (8 décembre 2025) : Filtrer les échelles disponibles par discipline
 */
function filtrerEchellesParDiscipline() {
    // Rétrocompatibilité - appeler la nouvelle fonction
    filtrerEchellesBibliotheque();
}

/**
 * Filtre les échelles par discipline ET par pratique
 * Utilise le module GabaritsUtils pour le filtrage par pratique
 */
function filtrerEchellesBibliotheque() {
    const selectDiscipline = document.getElementById('filtreDisciplineEchelles');
    const selectPratique = document.getElementById('filtrePratiqueEchelles');

    const disciplineSelectionnee = selectDiscipline ? selectDiscipline.value : '';
    const pratiqueSelectionnee = selectPratique ? selectPratique.value : '';

    const items = document.querySelectorAll('.echelle-disponible-item');
    const titresDisciplines = document.querySelectorAll('#listeEchellesDisponibles h4');

    // Filtrer chaque item
    items.forEach(item => {
        const discipline = item.dataset.discipline || '';
        const pratiques = (item.dataset.pratiques || 'all').split(',');

        // Vérifier filtre discipline
        const matchDiscipline = !disciplineSelectionnee || discipline === disciplineSelectionnee;

        // Vérifier filtre pratique (utiliser GabaritsUtils si disponible)
        let matchPratique = true;
        if (pratiqueSelectionnee) {
            if (pratiqueSelectionnee === 'all') {
                // Chercher les multi-pratiques
                matchPratique = pratiques.includes('all');
            } else {
                matchPratique = pratiques.includes('all') || pratiques.includes(pratiqueSelectionnee);
            }
        }

        item.style.display = (matchDiscipline && matchPratique) ? 'flex' : 'none';
    });

    // Masquer les titres de discipline si aucun item visible
    titresDisciplines.forEach(titre => {
        const disciplineTitre = titre.textContent.trim();

        if (!disciplineSelectionnee) {
            // Vérifier si au moins un item de cette discipline est visible
            let hasVisibleItem = false;
            items.forEach(item => {
                if (item.dataset.discipline === disciplineTitre && item.style.display !== 'none') {
                    hasVisibleItem = true;
                }
            });
            titre.style.display = hasVisibleItem ? 'block' : 'none';
        } else {
            titre.style.display = disciplineTitre === disciplineSelectionnee ? 'block' : 'none';
        }
    });
}

/**
 * ✅ AJOUT (8 décembre 2025) : Fermer le modal de bibliothèque
 */
function fermerModalBibliothequeEchelles() {
    const modal = document.getElementById('modalBibliothequeEchelles');
    if (modal) {
        modal.remove();
    }
}

async function creerNouvelleEchelle() {
    document.getElementById('accueilEchelles').style.display = 'none';
    document.getElementById('conteneurEditionEchelle').style.display = 'block';

    // Note: Section optionsImportExportEchelles supprimée (Beta 92)
    // Les boutons Import/Export sont maintenant dans l'en-tête

    // Masquer les boutons Exporter, Importer, Dupliquer et Supprimer (mode création)
    // Note: Export/Import se font maintenant via la bibliothèque
    const btnDupliquer = document.getElementById('btnDupliquerEchelle');
    const btnSupprimer = document.getElementById('btnSupprimerEchelle');
    if (btnDupliquer) btnDupliquer.style.display = 'none';
    if (btnSupprimer) btnSupprimer.style.display = 'none';

    // Réinitialiser le formulaire
    document.getElementById('nomEchelleTemplate').value = '';

    // Initialiser avec 4 niveaux vides par défaut (structure typique)
    window._niveauxNouvelleEchelle = [
        { code: '', nom: '', min: 90, max: 100, valeurCalcul: 95, couleur: '#27ae60' },
        { code: '', nom: '', min: 75, max: 89, valeurCalcul: 82, couleur: '#3498db' },
        { code: '', nom: '', min: 60, max: 74, valeurCalcul: 67, couleur: '#f39c12' },
        { code: '', nom: '', min: 0, max: 59, valeurCalcul: 30, couleur: '#e74c3c' }
    ];

    // Afficher les niveaux avec placeholders
    afficherNiveauxNouvelleEchelle();

    // Réinitialiser la référence à l'échelle actuelle
    echelleTemplateActuelle = null;

    console.log('Création nouvelle échelle - Interface prête');
}

/**
 * Ajoute le premier niveau lors de la création d'une nouvelle échelle
 * Cette fonction est utilisée quand echelleTemplateActuelle est null
 */
function ajouterPremierNiveau() {
    // Créer une structure temporaire pour la nouvelle échelle
    const niveauxTemp = [
        {
            code: 'N1',
            nom: 'Nouveau niveau',
            min: 0,
            max: 100,
            valeurCalcul: 50,
            couleur: '#3498db'
        }
    ];

    // Stocker temporairement les niveaux
    window._niveauxNouvelleEchelle = niveauxTemp;

    // Afficher le tableau des niveaux avec le bouton pour en ajouter d'autres
    afficherNiveauxNouvelleEchelle();
}

/**
 * Affiche les niveaux pour une nouvelle échelle (pas encore sauvegardée)
 * Format identique aux échelles existantes avec placeholders
 */
function afficherNiveauxNouvelleEchelle() {
    const container = document.getElementById('tableauNiveauxEchelle');
    const apercuContainer = document.getElementById('apercuEchelleNiveaux');
    const niveaux = window._niveauxNouvelleEchelle || [];

    if (niveaux.length === 0) {
        container.innerHTML = `
            <div style="padding: 20px; background: var(--bleu-tres-pale); border-radius: 8px; text-align: center; margin-bottom: 15px;">
                <p style="color: #666; margin-bottom: 15px;">Aucun niveau défini.</p>
                <button class="btn btn-confirmer" onclick="ajouterPremierNiveau()">
                    + Ajouter un niveau
                </button>
            </div>
        `;
        if (apercuContainer) apercuContainer.innerHTML = '';
        return;
    }

    // Placeholders pour guider l'utilisateur
    const placeholders = [
        { code: 'A', nom: 'Excellent' },
        { code: 'B', nom: 'Très bien' },
        { code: 'C', nom: 'Satisfaisant' },
        { code: 'D', nom: 'En développement' },
        { code: 'E', nom: 'Insuffisant' }
    ];

    const html = niveaux.map((niveau, index) => {
        const ph = placeholders[index] || { code: 'X', nom: 'Niveau' };
        return `
        <div class="item-liste" style="padding: 15px; background: white; margin-bottom: 10px;">
            <div style="display: grid; grid-template-columns: 60px 60px 2fr 80px 80px 100px 80px 100px; gap: 12px; align-items: end;">
                <div class="groupe-form echelle-text-center">
                    <label class="echelle-texte-detail">Ordre</label>
                    <div style="display: flex; flex-direction: column; gap: 4px;">
                        <button onclick="deplacerNiveauTempHaut(${index})"
                                class="btn btn-compact"
                                ${index === 0 ? 'disabled' : ''}
                                title="Déplacer vers le haut">
                            ↑
                        </button>
                        <button onclick="deplacerNiveauTempBas(${index})"
                                class="btn btn-compact"
                                ${index === niveaux.length - 1 ? 'disabled' : ''}
                                title="Déplacer vers le bas">
                            ↓
                        </button>
                    </div>
                </div>
                <div class="groupe-form">
                    <label class="echelle-texte-detail">Code</label>
                    <input type="text"
                           class="controle-form"
                           value="${niveau.code}"
                           placeholder="Ex: ${ph.code}"
                           maxlength="3"
                           onchange="modifierNiveauTemp(${index}, 'code', this.value)"
                           style="font-weight: 600; text-align: center;">
                </div>
                <div class="groupe-form">
                    <label class="echelle-texte-detail">Nom du niveau</label>
                    <input type="text"
                           class="controle-form"
                           value="${niveau.nom}"
                           placeholder="Ex: ${ph.nom}"
                           onchange="modifierNiveauTemp(${index}, 'nom', this.value)"
                           style="font-weight: 500;">
                </div>
                <div class="groupe-form">
                    <label class="echelle-texte-detail">Min (%)</label>
                    <input type="number"
                           class="controle-form"
                           value="${niveau.min}"
                           min="0"
                           max="100"
                           onchange="modifierNiveauTemp(${index}, 'min', parseFloat(this.value))">
                </div>
                <div class="groupe-form">
                    <label class="echelle-texte-detail">Max (%)</label>
                    <input type="number"
                           class="controle-form"
                           value="${niveau.max}"
                           min="0"
                           max="100"
                           onchange="modifierNiveauTemp(${index}, 'max', parseFloat(this.value))">
                </div>
                <div class="groupe-form">
                    <label class="echelle-texte-detail">Valeur calc (%)</label>
                    <input type="number"
                           class="controle-form"
                           value="${niveau.valeurCalcul}"
                           min="0"
                           max="100"
                           step="0.01"
                           onchange="modifierNiveauTemp(${index}, 'valeurCalcul', parseFloat(this.value))">
                </div>
                <div class="groupe-form">
                    <label class="echelle-texte-detail">Couleur</label>
                    <input type="color"
                           class="controle-form"
                           value="${niveau.couleur}"
                           onchange="modifierNiveauTemp(${index}, 'couleur', this.value)"
                           style="height: 38px; cursor: pointer;">
                </div>
                <div class="groupe-form">
                    <label class="echelle-texte-detail">Actions</label>
                    ${niveaux.length > 1 ? `
                        <button onclick="supprimerNiveauTemp(${index})"
                                class="btn btn-supprimer btn-compact"
                                title="Supprimer ce niveau">
                            Supprimer
                        </button>
                    ` : `
                        <div style="font-size: 0.75rem; color: #999; text-align: center; font-style: italic;">
                            (minimum 1)
                        </div>
                    `}
                </div>
            </div>
        </div>
    `}).join('');

    // Bouton ajouter niveau
    const btnAjouterNiveau = `
        <button class="sidebar-btn-ajouter" onclick="ajouterNiveauTemp()">
            + Ajouter un niveau
        </button>
    `;

    container.innerHTML = html + btnAjouterNiveau;

    // Afficher l'aperçu visuel
    if (apercuContainer) {
        const apercuHtml = niveaux.map(niveau => `
            <div style="text-align: center; flex: 1; padding: 10px; background: ${niveau.couleur}20; border-radius: 4px; margin: 0 2px;">
                <strong style="font-size: 1.2rem; color: ${niveau.couleur};">${niveau.code || '?'}</strong>
                <div class="echelle-texte-petit-mt5">${niveau.min}%-${niveau.max}%</div>
            </div>
        `).join('');
        apercuContainer.innerHTML = apercuHtml;
    }
}

/**
 * Modifie un niveau temporaire
 */
function modifierNiveauTemp(index, champ, valeur) {
    if (!window._niveauxNouvelleEchelle) return;
    window._niveauxNouvelleEchelle[index][champ] = valeur;
    afficherNiveauxNouvelleEchelle();
}

/**
 * Ajoute un niveau temporaire (vide avec couleur aléatoire)
 */
function ajouterNiveauTemp() {
    if (!window._niveauxNouvelleEchelle) {
        window._niveauxNouvelleEchelle = [];
    }
    // Couleurs prédéfinies pour les niveaux
    const couleurs = ['#27ae60', '#3498db', '#f39c12', '#e74c3c', '#9b59b6', '#1abc9c'];
    const nbNiveaux = window._niveauxNouvelleEchelle.length;
    const couleur = couleurs[nbNiveaux % couleurs.length];

    window._niveauxNouvelleEchelle.push({
        code: '',
        nom: '',
        min: 0,
        max: 100,
        valeurCalcul: 50,
        couleur: couleur
    });
    afficherNiveauxNouvelleEchelle();
}

/**
 * Supprime un niveau temporaire
 */
function supprimerNiveauTemp(index) {
    if (!window._niveauxNouvelleEchelle) return;
    window._niveauxNouvelleEchelle.splice(index, 1);
    afficherNiveauxNouvelleEchelle();
}

/**
 * Déplace un niveau temporaire vers le haut
 */
function deplacerNiveauTempHaut(index) {
    if (!window._niveauxNouvelleEchelle || index <= 0) return;
    const niveaux = window._niveauxNouvelleEchelle;
    [niveaux[index - 1], niveaux[index]] = [niveaux[index], niveaux[index - 1]];
    afficherNiveauxNouvelleEchelle();
}

/**
 * Déplace un niveau temporaire vers le bas
 */
function deplacerNiveauTempBas(index) {
    if (!window._niveauxNouvelleEchelle) return;
    const niveaux = window._niveauxNouvelleEchelle;
    if (index >= niveaux.length - 1) return;
    [niveaux[index], niveaux[index + 1]] = [niveaux[index + 1], niveaux[index]];
    afficherNiveauxNouvelleEchelle();
}

/**
 * Annule l'édition d'une échelle et retourne à l'accueil
 */
function annulerFormEchelle() {
    // Nettoyer les niveaux temporaires
    window._niveauxNouvelleEchelle = null;
    // Masquer l'éditeur et réafficher l'accueil
    document.getElementById('conteneurEditionEchelle').style.display = 'none';
    // Note: Section optionsImportExportEchelles supprimée (Beta 92)
    document.getElementById('accueilEchelles').style.display = 'block';

    // Réinitialiser les champs
    document.getElementById('nomEchelleTemplate').value = '';
    document.getElementById('tableauNiveauxEchelle').innerHTML = '';

    // Réinitialiser la référence à l'échelle actuelle
    echelleTemplateActuelle = null;

    console.log('Édition annulée - Retour à l\'accueil');
}

async function chargerEchellePourModif(id) {
    const echelles = await db.get('echellesTemplates') ||  [];
    const echelle = echelles.find(e => e.id === id);

    if (!echelle) return;

    // Définir l'échelle comme échelle actuelle pour permettre les modifications
    echelleTemplateActuelle = echelle;

    document.getElementById('accueilEchelles').style.display = 'none';
    document.getElementById('conteneurEditionEchelle').style.display = 'block';

    // Note: Section optionsImportExportEchelles supprimée (Beta 92)
    // Les boutons Import/Export sont maintenant dans l'en-tête

    // Note: Export/Import se font maintenant via la bibliothèque
    // Afficher les boutons Dupliquer et Supprimer (mode édition)
    const btnDupliquer = document.getElementById('btnDupliquerEchelle');
    const btnSupprimer = document.getElementById('btnSupprimerEchelle');
    if (btnDupliquer) btnDupliquer.style.display = 'inline-block';
    if (btnSupprimer) btnSupprimer.style.display = 'inline-block';

    // Remplir le formulaire
    document.getElementById('nomEchelleTemplate').value = echelle.nom || '';

    // Afficher les checkboxes pratiques compatibles
    const containerPratiques = document.getElementById('checkboxesPratiquesEchelle');
    if (containerPratiques && typeof GabaritsUtils !== 'undefined') {
        const pratiquesActuelles = echelle.pratiquesCompatibles || [];
        containerPratiques.innerHTML = GabaritsUtils.genererCheckboxesPratiques('echelle', pratiquesActuelles);
    }

    // Afficher les niveaux
    afficherNiveauxEchelle(echelle);

    // Mettre le highlight et rafraîchir la sidebar
    await definirEchelleActive(id);
    await afficherListeEchelles();
}

function afficherNiveauxEchelle(echelle) {
    const container = document.getElementById('tableauNiveauxEchelle');
    const apercuContainer = document.getElementById('apercuEchelleNiveaux');

    console.log('📊 afficherNiveauxEchelle appelée:', {
        echelleNom: echelle?.nom,
        nbNiveaux: echelle?.niveaux?.length,
        niveaux: echelle?.niveaux,
        containerExiste: !!container
    });

    if (!container) {
        console.error('❌ Container tableauNiveauxEchelle introuvable');
        return;
    }

    if (!echelle.niveaux || echelle.niveaux.length === 0) {
        console.warn('⚠️ Aucun niveau défini pour cette échelle');
        container.innerHTML = '<p style="color: #999; font-style: italic;">Aucun niveau défini</p>';
        if (apercuContainer) apercuContainer.innerHTML = '';
        return;
    }

    // Afficher le tableau des niveaux en mode édition
    const html = echelle.niveaux.map((niveau, index) => `
        <div class="item-liste" style="padding: 15px; background: white; margin-bottom: 10px;">
            <div style="display: grid; grid-template-columns: 60px 60px 2fr 80px 80px 100px 80px 100px; gap: 12px; align-items: end;">
                <div class="groupe-form echelle-text-center">
                    <label class="echelle-texte-detail">Ordre</label>
                    <div style="display: flex; flex-direction: column; gap: 4px;">
                        <button onclick="(async () => { await deplacerNiveauEchelleHaut('${echelle.id}', ${index}); })()"
                                class="btn btn-compact"
                                ${index === 0 ? 'disabled' : ''}
                                title="Déplacer vers le haut"
                                class="echelle-padding-compact">
                            ↑
                        </button>
                        <button onclick="(async () => { await deplacerNiveauEchelleBas('${echelle.id}', ${index}); })()"
                                class="btn btn-compact"
                                ${index === echelle.niveaux.length - 1 ? 'disabled' : ''}
                                title="Déplacer vers le bas"
                                class="echelle-padding-compact">
                            ↓
                        </button>
                    </div>
                </div>
                <div class="groupe-form">
                    <label class="echelle-texte-detail">Code</label>
                    <input type="text"
                           class="controle-form"
                           value="${niveau.code}"
                           maxlength="3"
                           onchange="modifierNiveauEchelle('${echelle.id}', ${index}, 'code', this.value)"
                           style="font-weight: 600; text-align: center;">
                </div>
                <div class="groupe-form">
                    <label class="echelle-texte-detail">Nom du niveau</label>
                    <input type="text"
                           class="controle-form"
                           value="${niveau.nom}"
                           onchange="modifierNiveauEchelle('${echelle.id}', ${index}, 'nom', this.value)"
                           style="font-weight: 500;">
                </div>
                <div class="groupe-form">
                    <label class="echelle-texte-detail">Min (%)</label>
                    <input type="number"
                           class="controle-form"
                           value="${niveau.min}"
                           min="0"
                           max="100"
                           onchange="modifierNiveauEchelle('${echelle.id}', ${index}, 'min', parseFloat(this.value))">
                </div>
                <div class="groupe-form">
                    <label class="echelle-texte-detail">Max (%)</label>
                    <input type="number"
                           class="controle-form"
                           value="${niveau.max}"
                           min="0"
                           max="100"
                           onchange="modifierNiveauEchelle('${echelle.id}', ${index}, 'max', parseFloat(this.value))">
                </div>
                <div class="groupe-form">
                    <label class="echelle-texte-detail">Valeur calc (%)</label>
                    <input type="number"
                           class="controle-form"
                           value="${niveau.valeurCalcul}"
                           min="0"
                           max="100"
                           step="0.01"
                           onchange="modifierNiveauEchelle('${echelle.id}', ${index}, 'valeurCalcul', parseFloat(this.value))">
                </div>
                <div class="groupe-form">
                    <label class="echelle-texte-detail">Couleur</label>
                    <input type="color"
                           class="controle-form"
                           value="${niveau.couleur}"
                           onchange="modifierNiveauEchelle('${echelle.id}', ${index}, 'couleur', this.value)"
                           style="height: 38px; cursor: pointer;">
                </div>
                <div class="groupe-form">
                    <label class="echelle-texte-detail">Actions</label>
                    ${echelle.niveaux.length > 1 ? `
                        <button onclick="(async () => { await supprimerNiveauEchelle('${echelle.id}', ${index}); })()"
                                class="btn btn-supprimer btn-compact"
                                title="Supprimer ce niveau"
                                class="u-w-100">
                            Supprimer
                        </button>
                    ` : `
                        <div style="font-size: 0.75rem; color: #999; text-align: center; font-style: italic;">
                            (minimum 1)
                        </div>
                    `}
                </div>
            </div>
        </div>
    `).join('');

    // Ajouter un bouton pour ajouter un nouveau niveau
    const btnAjouterNiveau = `
        <button class="sidebar-btn-ajouter" onclick="(async () => { await ajouterNiveauEchelle('${echelle.id}'); })()">
            + Ajouter un niveau
        </button>
    `;

    container.innerHTML = html + btnAjouterNiveau;

    // Afficher l'aperçu visuel
    if (apercuContainer) {
        const apercuHtml = echelle.niveaux.map(niveau => `
            <div style="text-align: center; flex: 1; padding: 10px; background: ${niveau.couleur}20; border-radius: 4px; margin: 0 2px;">
                <strong style="font-size: 1.2rem; color: ${niveau.couleur};">${niveau.code}</strong>
                <div class="echelle-texte-petit-mt5">${niveau.min}%-${niveau.max}%</div>
            </div>
        `).join('');
        apercuContainer.innerHTML = apercuHtml;
    }
}

/**
 * Modifie un champ d'un niveau d'échelle
 * @param {string} echelleId - ID de l'échelle
 * @param {number} niveauIndex - Index du niveau à modifier
 * @param {string} champ - Nom du champ à modifier
 * @param {any} valeur - Nouvelle valeur
 */
async function modifierNiveauEchelle(echelleId, niveauIndex, champ, valeur) {
    const echelles = await db.get('echellesTemplates') ||  [];
    const echelleIndex = echelles.findIndex(e => e.id === echelleId);

    if (echelleIndex === -1) {
        console.error('❌ Échelle non trouvée pour modification:', echelleId);
        return;
    }

    const echelle = echelles[echelleIndex];

    if (!echelle.niveaux || !echelle.niveaux[niveauIndex]) {
        console.error('❌ Niveau introuvable à l\'index:', niveauIndex);
        return;
    }

    // Mettre à jour le champ
    echelle.niveaux[niveauIndex][champ] = valeur;

    // Remettre l'échelle modifiée dans le tableau
    echelles[echelleIndex] = echelle;

    // Sauvegarder dans localStorage
    await db.set('echellesTemplates',  echelles);

    // CRITIQUE: Recharger echelleTemplateActuelle depuis localStorage (évite références obsolètes)
    const echellesRecharge = await db.get('echellesTemplates') ||  [];
    echelleTemplateActuelle = echellesRecharge.find(e => e.id === echelleId);

    // Mettre à jour db.setSync('niveauxEchelle') si c'est l'échelle active (compatibilité ancienne logique)
    const niveauxEchelle = await db.get('niveauxEchelle') ||  [];
    if (niveauxEchelle.length > 0 && niveauxEchelle[0].echelleId === echelleId) {
        await db.set('niveauxEchelle',  echelleTemplateActuelle.niveaux);
    }

    // Réafficher pour mettre à jour l'aperçu visuel et les bordures colorées
    afficherNiveauxEchelle(echelleTemplateActuelle);
}

/**
 * Ajoute un nouveau niveau à une échelle
 * @param {string} echelleId - ID de l'échelle
 */
async function ajouterNiveauEchelle(echelleId) {
    let echelles = await db.get('echellesTemplates') ||  [];
    const index = echelles.findIndex(e => e.id === echelleId);

    if (index === -1) {
        console.error('❌ Échelle non trouvée:', echelleId);
        alert('Erreur: Échelle non trouvée');
        return;
    }

    const echelle = echelles[index];

    // Initialiser le tableau de niveaux si nécessaire
    if (!echelle.niveaux) {
        echelle.niveaux = [];
    }

    // Créer un nouveau niveau avec des valeurs par défaut
    const nouveauNiveau = {
        code: 'N',
        nom: 'Nouveau niveau',
        min: 0,
        max: 100,
        valeurCalcul: 50,
        couleur: '#cccccc'
    };

    // Ajouter le niveau à l'échelle
    echelle.niveaux.push(nouveauNiveau);

    // IMPORTANT: Mettre à jour l'échelle dans le tableau AVANT de sauvegarder
    echelles[index] = echelle;

    // Sauvegarder dans localStorage
    await db.set('echellesTemplates',  echelles);

    // Recharger l'échelle depuis localStorage pour avoir la bonne référence
    const echellesRecharge = await db.get('echellesTemplates') ||  [];
    echelleTemplateActuelle = echellesRecharge.find(e => e.id === echelleId);

    // Réafficher la liste des niveaux
    afficherNiveauxEchelle(echelleTemplateActuelle);

    // Mettre à jour les métriques et la sidebar
    document.getElementById('nbNiveauxEchelle').textContent = echelleTemplateActuelle.niveaux.length;
    await afficherListeEchelles();

    // Notification de succès
    alert(`✅ Niveau ajouté avec succès !\n\nL'échelle contient maintenant ${echelleTemplateActuelle.niveaux.length} niveau(x).\nModifiez les propriétés du niveau (code, nom, min, max, etc.) puis continuez votre travail.`);
}

/**
 * Supprime un niveau d'une échelle
 * @param {string} echelleId - ID de l'échelle
 * @param {number} index - Index du niveau à supprimer
 */
async function supprimerNiveauEchelle(echelleId, index) {
    if (!confirm('Supprimer ce niveau ?')) return;

    let echelles = await db.get('echellesTemplates') ||  [];
    const echelleIndex = echelles.findIndex(e => e.id === echelleId);

    if (echelleIndex === -1 || !echelles[echelleIndex].niveaux) return;

    const echelle = echelles[echelleIndex];

    // Sécurité : ne pas supprimer s'il ne reste qu'un seul niveau
    if (echelle.niveaux.length <= 1) {
        alert('Impossible de supprimer : une échelle doit avoir au moins 1 niveau.');
        return;
    }

    // Supprimer le niveau
    echelle.niveaux.splice(index, 1);

    // Remettre l'échelle modifiée dans le tableau
    echelles[echelleIndex] = echelle;

    // Sauvegarder dans localStorage
    await db.set('echellesTemplates',  echelles);

    // Recharger echelleTemplateActuelle depuis localStorage
    const echellesRecharge = await db.get('echellesTemplates') ||  [];
    echelleTemplateActuelle = echellesRecharge.find(e => e.id === echelleId);

    // Réafficher la liste des niveaux
    afficherNiveauxEchelle(echelleTemplateActuelle);

    // Mettre à jour les métriques et la sidebar
    document.getElementById('nbNiveauxEchelle').textContent = echelleTemplateActuelle.niveaux.length;
    await afficherListeEchelles();
}

/**
 * Déplace un niveau vers le haut dans l'échelle
 * @param {string} echelleId - ID de l'échelle
 * @param {number} index - Index du niveau à déplacer
 */
async function deplacerNiveauEchelleHaut(echelleId, index) {
    if (index === 0) return;

    let echelles = await db.get('echellesTemplates') ||  [];
    const echelleIndex = echelles.findIndex(e => e.id === echelleId);

    if (echelleIndex === -1 || !echelles[echelleIndex].niveaux) return;

    const echelle = echelles[echelleIndex];

    // Échanger avec le niveau précédent
    [echelle.niveaux[index - 1], echelle.niveaux[index]] = [echelle.niveaux[index], echelle.niveaux[index - 1]];

    // Remettre l'échelle modifiée dans le tableau
    echelles[echelleIndex] = echelle;

    // Sauvegarder dans localStorage
    await db.set('echellesTemplates',  echelles);

    // Recharger echelleTemplateActuelle depuis localStorage
    const echellesRecharge = await db.get('echellesTemplates') ||  [];
    echelleTemplateActuelle = echellesRecharge.find(e => e.id === echelleId);

    // Réafficher
    afficherNiveauxEchelle(echelleTemplateActuelle);

    console.log('Niveau déplacé vers le haut');
}

/**
 * Déplace un niveau vers le bas dans l'échelle
 * @param {string} echelleId - ID de l'échelle
 * @param {number} index - Index du niveau à déplacer
 */
async function deplacerNiveauEchelleBas(echelleId, index) {
    let echelles = await db.get('echellesTemplates') ||  [];
    const echelleIndex = echelles.findIndex(e => e.id === echelleId);

    if (echelleIndex === -1 || !echelles[echelleIndex].niveaux) return;

    const echelle = echelles[echelleIndex];

    if (index === echelle.niveaux.length - 1) return;

    // Échanger avec le niveau suivant
    [echelle.niveaux[index], echelle.niveaux[index + 1]] = [echelle.niveaux[index + 1], echelle.niveaux[index]];

    // Remettre l'échelle modifiée dans le tableau
    echelles[echelleIndex] = echelle;

    // Sauvegarder dans localStorage
    await db.set('echellesTemplates',  echelles);

    // Recharger echelleTemplateActuelle depuis localStorage
    const echellesRecharge = await db.get('echellesTemplates') ||  [];
    echelleTemplateActuelle = echellesRecharge.find(e => e.id === echelleId);

    // Réafficher
    afficherNiveauxEchelle(echelleTemplateActuelle);

    console.log('Niveau déplacé vers le bas');
}

async function definirEchelleActive(id) {
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.classList.remove('active');
    });

    const itemActif = document.querySelector(`.sidebar-item[data-id="${id}"]`);
    if (itemActif) {
        itemActif.classList.add('active');
    }
}

async function dupliquerEchelleDepuisSidebar(id) {
    const echelles = await db.get('echellesTemplates') ||  [];
    const echelle = echelles.find(e => e.id === id);

    if (!echelle) return;

    const copie = {
        ...echelle,
        id: Date.now().toString(),
        nom: echelle.nom + ' (copie)',
        verrouille: false
    };

    echelles.push(copie);
    await db.set('echellesTemplates',  echelles);

    await afficherListeEchelles();
    await chargerEchellePourModif(copie.id);

    alert('Échelle "' + copie.nom + '" dupliquée avec succès');
}

/**
 * Vérifie si une échelle est utilisée par des évaluations existantes
 * @param {string} echelleId - ID de l'échelle à vérifier
 * @returns {Object} {utilisee: boolean, nbEvaluations: number, evaluations: Array}
 */
async function verifierUtilisationEchelle(echelleId) {
    // Récupérer toutes les évaluations (essayer avec et sans namespace)
    let evaluations = await db.get('evaluations');

    // Si pas trouvé, essayer avec la clé namespacée
    if (!evaluations && typeof window.cle === 'function') {
        evaluations = await db.get(window.cle('evaluations'));
    }

    // S'assurer que c'est un tableau
    if (!Array.isArray(evaluations)) {
        evaluations = [];
    }

    // Filtrer les évaluations qui utilisent cette échelle
    const evaluationsUtilisant = evaluations.filter(e => e.echelleId === echelleId);

    return {
        utilisee: evaluationsUtilisant.length > 0,
        nbEvaluations: evaluationsUtilisant.length,
        evaluations: evaluationsUtilisant
    };
}

/**
 * Migre les évaluations d'une échelle vers une autre
 * @param {string} ancienneEchelleId - ID de l'échelle à remplacer
 * @param {string} nouvelleEchelleId - ID de la nouvelle échelle
 * @returns {number} Nombre d'évaluations migrées
 */
async function migrerEvaluationsVersNouvelleEchelle(ancienneEchelleId, nouvelleEchelleId) {
    const evaluations = await db.get('evaluations') ||  [];
    let nbMigrees = 0;

    evaluations.forEach(eval => {
        if (eval.echelleId === ancienneEchelleId) {
            eval.echelleId = nouvelleEchelleId;
            nbMigrees++;
        }
    });

    await db.set('evaluations',  evaluations);
    return nbMigrees;
}

async function supprimerEchelleDepuisSidebar(id) {
    // Vérifier si l'échelle est utilisée
    const utilisation = await verifierUtilisationEchelle(id);

    if (utilisation.utilisee) {
        // L'échelle est utilisée, offrir des choix à l'utilisateur
        const echelles = await db.get('echellesTemplates') ||  [];
        const echelle = echelles.find(e => e.id === id);
        const nomEchelle = echelle?.nom || 'cette échelle';

        // Créer une liste des autres échelles disponibles pour la migration
        const autresEchelles = echelles.filter(e => e.id !== id);

        let message = `⚠️ ATTENTION : L'échelle "${nomEchelle}" est utilisée par ${utilisation.nbEvaluations} évaluation(s) existante(s).\n\n`;

        if (autresEchelles.length > 0) {
            message += 'Options:\n';
            message += '1. Migrer ces évaluations vers une autre échelle\n';
            message += '2. Annuler la suppression\n\n';
            message += `Voulez-vous migrer les évaluations vers une autre échelle ?`;

            const choixMigration = confirm(message);

            if (choixMigration) {
                // Afficher un sélecteur d'échelle de remplacement
                let listeEchelles = 'Sélectionnez l\'échelle de remplacement:\n\n';
                autresEchelles.forEach((e, idx) => {
                    listeEchelles += `${idx + 1}. ${e.nom} (${e.niveaux?.length || 0} niveaux)\n`;
                });

                const choixNumero = prompt(listeEchelles + '\nEntrez le numéro de l\'échelle:');
                const numeroChoisi = parseInt(choixNumero);

                if (numeroChoisi && numeroChoisi >= 1 && numeroChoisi <= autresEchelles.length) {
                    const nouvelleEchelle = autresEchelles[numeroChoisi - 1];
                    const nbMigrees = await migrerEvaluationsVersNouvelleEchelle(id, nouvelleEchelle.id);

                    // Maintenant supprimer l'échelle
                    const index = echelles.findIndex(e => e.id === id);
                    if (index !== -1) {
                        echelles.splice(index, 1);
                        await db.set('echellesTemplates',  echelles);
                        await afficherListeEchelles();
                        document.getElementById('conteneurEditionEchelle').style.display = 'none';
                        // Note: Section optionsImportExportEchelles supprimée (Beta 92)
                        document.getElementById('accueilEchelles').style.display = 'block';
                        alert(`✅ Échelle supprimée avec succès !\n${nbMigrees} évaluation(s) ont été migrées vers "${nouvelleEchelle.nom}".`);
                    }
                } else {
                    alert('Migration annulée. L\'échelle n\'a pas été supprimée.');
                }
            } else {
                alert('Suppression annulée. Les évaluations existantes sont préservées.');
            }
        } else {
            // Pas d'autres échelles disponibles
            message += '⚠️ Impossible de supprimer : il n\'y a aucune autre échelle vers laquelle migrer les évaluations.\n\n';
            message += 'Vous devez d\'abord créer une nouvelle échelle ou supprimer les évaluations existantes.';
            alert(message);
        }
    } else {
        // L'échelle n'est pas utilisée, suppression directe
        if (!confirm('Supprimer cette échelle ?')) return;

        const echelles = await db.get('echellesTemplates') ||  [];
        const index = echelles.findIndex(e => e.id === id);

        if (index !== -1) {
            echelles.splice(index, 1);
            await db.set('echellesTemplates',  echelles);
            await afficherListeEchelles();
            document.getElementById('conteneurEditionEchelle').style.display = 'none';
            // Note: Section optionsImportExportEchelles supprimée (Beta 92)
            document.getElementById('accueilEchelles').style.display = 'block';
            alert('Échelle supprimée avec succès !');
        }
    }
}

/**
 * Duplique l'échelle actuellement en cours d'édition
 */
async function dupliquerEchelleActive() {
    if (!echelleTemplateActuelle) {
        alert('Aucune échelle à dupliquer');
        return;
    }
    await dupliquerEchelleDepuisSidebar(echelleTemplateActuelle.id);
}

/**
 * Supprime l'échelle actuellement en cours d'édition
 */
async function supprimerEchelleActive() {
    if (!echelleTemplateActuelle) {
        alert('Aucune échelle à supprimer');
        return;
    }
    await supprimerEchelleDepuisSidebar(echelleTemplateActuelle.id);
}

/**
 * Sauvegarde complète de l'échelle en cours d'édition
 */
async function sauvegarderEchelleComplete() {
    const nom = document.getElementById('nomEchelleTemplate').value.trim();

    // Vérifier le nom
    if (!nom) {
        alert('Veuillez entrer un nom pour l\'échelle');
        return;
    }

    // Cas 1: Création d'une nouvelle échelle (echelleTemplateActuelle est null)
    if (!echelleTemplateActuelle && window._niveauxNouvelleEchelle) {
        const niveaux = window._niveauxNouvelleEchelle;

        if (niveaux.length === 0) {
            alert('Veuillez ajouter au moins un niveau de performance');
            return;
        }

        // Lire les pratiques compatibles sélectionnées
        const pratiquesCompatibles = typeof GabaritsUtils !== 'undefined'
            ? GabaritsUtils.lirePratiquesSelectionnees('echelle')
            : [];

        // Créer la nouvelle échelle
        const nouvelleEchelle = {
            id: 'echelle_' + Date.now(),
            nom: nom,
            niveaux: niveaux,
            pratiquesCompatibles: pratiquesCompatibles,
            dansBibliotheque: true,
            dateCreation: new Date().toISOString()
        };

        // Sauvegarder dans la base
        let echelles = await db.get('echellesTemplates') || [];
        echelles.push(nouvelleEchelle);
        await db.set('echellesTemplates', echelles);

        // Nettoyer les niveaux temporaires
        window._niveauxNouvelleEchelle = null;

        // Définir comme échelle actuelle
        echelleTemplateActuelle = nouvelleEchelle;

        // Message de confirmation
        alert('Nouvelle échelle créée avec succès !');
    } else {
        // Cas 2: Modification d'une échelle existante
        await sauvegarderNomEchelle();
        alert('Échelle sauvegardée avec succès');
    }

    // Recharger la liste pour refléter les changements
    await afficherListeEchelles();

    // Retourner à l'accueil
    document.getElementById('conteneurEditionEchelle').style.display = 'none';
    document.getElementById('accueilEchelles').style.display = 'block';
}

// Export global
window.afficherListeEchelles = afficherListeEchelles;
window.creerNouvelleEchelle = creerNouvelleEchelle;
window.annulerFormEchelle = annulerFormEchelle;
window.chargerEchellePourModif = chargerEchellePourModif;
window.dupliquerEchelleDepuisSidebar = dupliquerEchelleDepuisSidebar;
window.supprimerEchelleDepuisSidebar = supprimerEchelleDepuisSidebar;
window.dupliquerEchelleActive = dupliquerEchelleActive;
window.supprimerEchelleActive = supprimerEchelleActive;
window.sauvegarderEchelleComplete = sauvegarderEchelleComplete;
window.deplacerNiveauHaut = deplacerNiveauHaut;
window.deplacerNiveauBas = deplacerNiveauBas;
window.deplacerNiveauEchelleHaut = deplacerNiveauEchelleHaut;
window.deplacerNiveauEchelleBas = deplacerNiveauEchelleBas;
window.ajouterNiveauEchelle = ajouterNiveauEchelle;
window.ajouterPremierNiveau = ajouterPremierNiveau;
window.afficherNiveauxNouvelleEchelle = afficherNiveauxNouvelleEchelle;
window.modifierNiveauTemp = modifierNiveauTemp;
window.ajouterNiveauTemp = ajouterNiveauTemp;
window.supprimerNiveauTemp = supprimerNiveauTemp;
window.deplacerNiveauTempHaut = deplacerNiveauTempHaut;
window.deplacerNiveauTempBas = deplacerNiveauTempBas;
window.supprimerNiveauEchelle = supprimerNiveauEchelle;
window.modifierNiveauEchelle = modifierNiveauEchelle;
window.verifierUtilisationEchelle = verifierUtilisationEchelle;
window.migrerEvaluationsVersNouvelleEchelle = migrerEvaluationsVersNouvelleEchelle;

// ✅ AJOUT (8 décembre 2025) : Exports fonctions bibliothèque
window.afficherBibliothequeEchelles = afficherBibliothequeEchelles;
window.retirerEchelleDeBibliotheque = retirerEchelleDeBibliotheque;
window.ajouterEchellesABibliotheque = ajouterEchellesABibliotheque;
window.filtrerEchellesParDiscipline = filtrerEchellesParDiscipline;
window.filtrerEchellesBibliotheque = filtrerEchellesBibliotheque;
window.fermerModalBibliothequeEchelles = fermerModalBibliothequeEchelles;