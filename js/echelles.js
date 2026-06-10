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

(function() {
'use strict';

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
        nom: 'Incomplet',
        description: 'Préstructurel, unistructurel',
        min: 0,
        max: 64.99,
        valeurCalcul: 32,
        couleur: 'var(--niveau-attention-critique)'
    },
    {
        code: 'D',
        nom: 'en Développement',
        description: 'Multistructurel',
        min: 65,
        max: 74.99,
        valeurCalcul: 69.5,
        couleur: 'var(--niveau-attention-modere)'
    },
    {
        code: 'M',
        nom: 'Maîtrisé',
        description: 'Relationnel',
        min: 75,
        max: 84.99,
        valeurCalcul: 79.5,
        couleur: 'var(--niveau-attention-minimal)'
    },
    {
        code: 'E',
        nom: 'Étendu',
        description: 'Abstrait étendu',
        min: 85,
        max: 100,
        valeurCalcul: 92.5,
        couleur: 'var(--niveau-attention-nul)'
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
    { nom: 'Rouge critique', valeur: 'var(--niveau-attention-critique)' },
    { nom: 'Rouge foncé', valeur: '#c0392b' },
    { nom: 'Rouge', valeur: '#e74c3c' },
    { nom: 'Orange critique', valeur: 'var(--niveau-attention-eleve)' },
    { nom: 'Orange', valeur: '#e67e22' },
    { nom: 'Orange clair', valeur: '#f39c12' },
    { nom: 'Jaune modéré', valeur: 'var(--niveau-attention-modere)' },
    { nom: 'Jaune', valeur: '#f1c40f' },
    { nom: 'Jaune-vert', valeur: '#9b59b6' },
    { nom: 'Vert minimal', valeur: 'var(--niveau-attention-minimal)' },
    { nom: 'Vert', valeur: '#27ae60' },
    { nom: 'Vert foncé', valeur: '#1e8449' },
    { nom: 'Vert nul', valeur: 'var(--niveau-attention-nul)' },
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
   ✅ AJOUT (28 janvier 2026) : DÉTECTION DES DOUBLONS
   Fonctions pour identifier les échelles avec des noms similaires
   =============================== */

/**
 * Détecter les doublons potentiels dans les échelles
 * @param {Array} echellesLocales - Échelles de l'utilisateur
 * @param {Array} echellesBibliotheque - Échelles de la bibliothèque partagée
 * @returns {Array} Liste des doublons {nom, count, ids}
 */
function detecterDoublonsEchelles(echellesLocales, echellesBibliotheque) {
    const parId = new Map();
    [...echellesLocales, ...echellesBibliotheque].forEach(echelle => {
        if (echelle && echelle.id && !parId.has(echelle.id)) {
            parId.set(echelle.id, echelle);
        }
    });

    const parNom = {};
    parId.forEach(echelle => {
        const nom = (echelle.nom || '').trim().toLowerCase();
        if (!nom) return;
        if (!parNom[nom]) {
            parNom[nom] = { nom: echelle.nom, count: 0, ids: [] };
        }
        parNom[nom].count++;
        parNom[nom].ids.push(echelle.id);
    });

    return Object.values(parNom).filter(d => d.count > 1);
}

/**
 * Générer un badge de source pour une échelle
 * @param {Object} echelle - L'échelle
 * @param {Array} echellesLocales - Échelles locales pour vérifier la source
 * @returns {string} HTML du badge
 */
function genererBadgeSourceEchelle(echelle, echellesLocales) {
    return BibliothequeUI.genererBadgeSource(echelle, echellesLocales);
}

function genererIdCourtEchelle(id) {
    return BibliothequeUI.genererIdCourt(id);
}

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
                <small>Crée une échelle en utilisant le formulaire ci-dessous</small>
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
                        <strong style="font-size: 1.1rem; color: var(--accent-primaire);">${echapperHtml(niveau.code)}</strong>
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
                             border-radius: 4px; border: 1px solid var(--bordure-moyenne); display: inline-block;"></div>
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
                     border-radius: 8px; background: var(--surface-conteneur, #162c36); overflow: hidden;">
                <summary style="padding: 15px; background: linear-gradient(135deg, var(--accent-primaire) 0%, var(--bleu-moyen) 100%);
                         color: white; font-weight: 600; font-size: 1.05rem; cursor: pointer;
                         user-select: none; display: flex; justify-content: space-between; align-items: center;">
                    <span>${echapperHtml(echelle.nom)}</span>
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
                            <strong style="display: block; margin-bottom: 10px; color: var(--accent-primaire);">Aperçu visuel :</strong>
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
                                <div style="display: flex; margin-top: 5px; font-size: 0.7rem; color: var(--gris-moyen); position: relative;">
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

                    <div class="u-flex-gap-10">
                        <button class="btn btn-modifier" data-action="chargerEchelleTemplate" data-param="${echelle.id}">
                            Modifier
                        </button>
                        <button class="btn btn-principal" data-action="dupliquerEchelle" data-param="${echelle.id}">
                            Dupliquer
                        </button>
                        <button class="btn btn-supprimer" data-action="supprimerEchelle" data-param="${echelle.id}">
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
        id: genererIdUnique('ECH_'),
        nom: nouveauNom,
        niveaux: JSON.parse(JSON.stringify(echelle.niveaux || [])), // Copie profonde
        config: JSON.parse(JSON.stringify(echelle.config || {})),
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString(),
        auteur: BibliothequeUI.obtenirAuteurActif(),
        isDemo: false,
        inspireDe: BibliothequeUI.forgerInspireDe(echelle),
        dansBibliotheque: true  // ✅ AJOUT (8 décembre 2025) - Échelle dupliquée dans bibliothèque par défaut
    };

    echelles.push(nouvelleEchelle);
    await db.set('echellesTemplates',  echelles);

    // Mettre à jour l'interface
    await chargerEchellesTemplates();
    await afficherToutesLesEchellesNiveaux();

    // ✅ AJOUT (8 décembre 2025) : Rafraîchir la barre latérale
    await afficherListeEchelles();

    notifications.succes(`Échelle «${nouvelleEchelle.nom}» créée avec succès.`);
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
    }
}

/**
 * Assure la présence de l'échelle générique dans la bibliothèque
 * Facilite la compréhension du système pour les nouveaux utilisateurs
 */
async function assurerEchelleGenerique() {
    const echelles = await db.get('echellesTemplates') || [];

    // Vérifier si l'échelle générique existe déjà ou a été supprimée volontairement
    const existe = echelles.some(e => e.id === 'ECHELLE_GENERIQUE');
    if (existe || window.estRessourceSupprimee('ECHELLE_GENERIQUE')) return;


    const echelleGenerique = {
        id: 'ECHELLE_GENERIQUE',
        nom: 'Échelle générique (exemple)',
        description: 'Échelle 4 niveaux de performance - Modifie ou duplique selon tes besoins',
        niveaux: [
            { code: 'I', nom: 'Incomplet', min: 0, max: 59, valeur: 45, couleur: '#dc3545' },
            { code: 'D', nom: 'en Développement', min: 60, max: 74, valeur: 67, couleur: '#fd7e14' },
            { code: 'M', nom: 'Maîtrisé', min: 75, max: 89, valeur: 82, couleur: '#28a745' },
            { code: 'E', nom: 'Étendu', min: 90, max: 100, valeur: 95, couleur: '#007bff' }
        ],
        verrouille: false,
        dansBibliotheque: true
    };

    echelles.push(echelleGenerique);
    await db.set('echellesTemplates', echelles);
}

/**
 * Assure la présence des échelles personnalisées des enseignants
 * Ces échelles sont identifiées par auteur pour un export futur personnalisé
 * ✅ AJOUT (3 janvier 2026)
 */
async function assurerEchellesPersonnalisees() {
    const echelles = await db.get('echellesTemplates') || [];
    const supprimees = await db.get('ressourcesSupprimees') || [];
    let nbAjoutees = 0;

    // ============================================================================
    // ÉCHELLE BRUNO V. (Chimie organique)
    // Standards avec comptage, seuil maîtrise 75%
    // ============================================================================
    if (!echelles.some(e => e.id === 'ECHELLE_BRUNO_CHIMIE') && !supprimees.includes('ECHELLE_BRUNO_CHIMIE')) {
        echelles.push({
            id: 'ECHELLE_BRUNO_CHIMIE',
            nom: 'Échelle Chimie organique',
            description: 'Échelle 4 niveaux pour standards. Seuil maîtrise: 75%.',
            auteur: 'Labo Codex',
            discipline: 'Chimie',
            niveaux: [
                { code: 'I', nom: 'Incomplet', min: 0, max: 54, valeur: 40, couleur: '#dc3545' },
                { code: 'D', nom: 'en Développement', min: 55, max: 74, valeur: 65, couleur: '#fd7e14' },
                { code: 'M', nom: 'Maîtrisé', min: 75, max: 89, valeur: 82, couleur: '#28a745' },
                { code: 'E', nom: 'Étendu', min: 90, max: 100, valeur: 95, couleur: '#007bff' }
            ],
            verrouille: false,
            dansBibliotheque: true,
            dateCreation: new Date().toISOString()
        });
        nbAjoutees++;
    }

    // ============================================================================
    // ÉCHELLE XAVIER C.-T. (Informatique)
    // STD+SPE hybride, 4 niveaux numériques (1-4), seuil niveau 3
    // ============================================================================
    if (!echelles.some(e => e.id === 'ECHELLE_XAVIER_INFO') && !supprimees.includes('ECHELLE_XAVIER_INFO')) {
        echelles.push({
            id: 'ECHELLE_XAVIER_INFO',
            nom: 'Échelle Interfaces/BD',
            description: 'Échelle 4 niveaux numériques. Niveau 3 = seuil passage, niveau 4 = bonus.',
            auteur: 'Labo Codex',
            discipline: 'Informatique',
            niveaux: [
                { code: '1', nom: 'Non atteint', min: 0, max: 49, valeur: 40, couleur: '#dc3545' },
                { code: '2', nom: 'En développement', min: 50, max: 64, valeur: 55, couleur: '#fd7e14' },
                { code: '3', nom: 'Maîtrisé', min: 65, max: 84, valeur: 80, couleur: '#28a745' },
                { code: '4', nom: 'Excellence', min: 85, max: 100, valeur: 95, couleur: '#007bff' }
            ],
            verrouille: false,
            dansBibliotheque: true,
            dateCreation: new Date().toISOString()
        });
        nbAjoutees++;
    }

    // ============================================================================
    // ÉCHELLE ISABELLE M. (Biologie)
    // PAN-Standards holistique, 4 niveaux IDME qualitatifs
    // ============================================================================
    if (!echelles.some(e => e.id === 'ECHELLE_ISABELLE_BIO') && !supprimees.includes('ECHELLE_ISABELLE_BIO')) {
        echelles.push({
            id: 'ECHELLE_ISABELLE_BIO',
            nom: 'Échelle Anatomie',
            description: 'Échelle IDME qualitative pour jugement global. Pas de seuils chiffrés stricts.',
            auteur: 'Labo Codex',
            discipline: 'Biologie',
            niveaux: [
                { code: 'I', nom: 'Incomplet', min: 0, max: 49, valeur: 40, couleur: '#dc3545' },
                { code: 'D', nom: 'en Développement', min: 50, max: 64, valeur: 57, couleur: '#fd7e14' },
                { code: 'M', nom: 'Maîtrisé', min: 65, max: 84, valeur: 75, couleur: '#28a745' },
                { code: 'E', nom: 'Étendu', min: 85, max: 100, valeur: 92, couleur: '#007bff' }
            ],
            verrouille: false,
            dansBibliotheque: true,
            dateCreation: new Date().toISOString(),
            avertissement: 'Échelle pour jugement professionnel - les seuils sont indicatifs'
        });
        nbAjoutees++;
    }

    // ============================================================================
    // ÉCHELLE HÉLÈNE C. (Philosophie)
    // Sommative avec portfolio, échelle pourcentages standard
    // ============================================================================
    if (!echelles.some(e => e.id === 'ECHELLE_HELENE_PHILO') && !supprimees.includes('ECHELLE_HELENE_PHILO')) {
        echelles.push({
            id: 'ECHELLE_HELENE_PHILO',
            nom: 'Échelle Philosophie',
            description: 'Échelle 4 niveaux pour cours de philosophie. Seuils: 70/60/50.',
            auteur: 'Labo Codex',
            discipline: 'Philosophie',
            niveaux: [
                { code: 'I', nom: 'Incomplet', min: 0, max: 49, valeur: 35, couleur: '#dc3545' },
                { code: 'D', nom: 'en Développement', min: 50, max: 59, valeur: 55, couleur: '#fd7e14' },
                { code: 'M', nom: 'Maîtrisé', min: 60, max: 79, valeur: 70, couleur: '#28a745' },
                { code: 'E', nom: 'Étendu', min: 80, max: 100, valeur: 90, couleur: '#007bff' }
            ],
            verrouille: false,
            dansBibliotheque: true,
            dateCreation: new Date().toISOString()
        });
        nbAjoutees++;
    }

    // ============================================================================
    // ÉCHELLE MARIE-HÉLÈNE L. (Littérature)
    // Sommative avec critères fixes, échelle pourcentages
    // ============================================================================
    if (!echelles.some(e => e.id === 'ECHELLE_MARIEHELENE_LITT') && !supprimees.includes('ECHELLE_MARIEHELENE_LITT')) {
        echelles.push({
            id: 'ECHELLE_MARIEHELENE_LITT',
            nom: 'Échelle Littérature',
            description: 'Échelle 4 niveaux pour cours de littérature. Seuils: 75/65/55.',
            auteur: 'Labo Codex',
            discipline: 'Littérature',
            niveaux: [
                { code: 'I', nom: 'Incomplet', min: 0, max: 54, valeur: 40, couleur: '#dc3545' },
                { code: 'D', nom: 'en Développement', min: 55, max: 64, valeur: 60, couleur: '#fd7e14' },
                { code: 'M', nom: 'Maîtrisé', min: 65, max: 84, valeur: 75, couleur: '#28a745' },
                { code: 'E', nom: 'Étendu', min: 85, max: 100, valeur: 92, couleur: '#007bff' }
            ],
            verrouille: false,
            dansBibliotheque: true,
            dateCreation: new Date().toISOString()
        });
        nbAjoutees++;
    }

    // ============================================================================
    // ÉCHELLE ÉTIENNE L. (Administration)
    // Sommative traditionnelle, échelle pourcentages
    // ============================================================================
    if (!echelles.some(e => e.id === 'ECHELLE_ETIENNE_ADMIN') && !supprimees.includes('ECHELLE_ETIENNE_ADMIN')) {
        echelles.push({
            id: 'ECHELLE_ETIENNE_ADMIN',
            nom: 'Échelle Comptabilité',
            description: 'Échelle 4 niveaux pour cours d\'administration. Seuils: 80/70/60.',
            auteur: 'Labo Codex',
            discipline: 'Administration',
            niveaux: [
                { code: 'I', nom: 'Incomplet', min: 0, max: 59, valeur: 45, couleur: '#dc3545' },
                { code: 'D', nom: 'en Développement', min: 60, max: 69, valeur: 65, couleur: '#fd7e14' },
                { code: 'M', nom: 'Maîtrisé', min: 70, max: 89, valeur: 80, couleur: '#28a745' },
                { code: 'E', nom: 'Étendu', min: 90, max: 100, valeur: 95, couleur: '#007bff' }
            ],
            verrouille: false,
            dansBibliotheque: true,
            dateCreation: new Date().toISOString()
        });
        nbAjoutees++;
    }

    // ============================================================================
    // ÉCHELLE OLIVIER L. (Géographie)
    // Sommative traditionnelle, échelle pourcentages
    // ============================================================================
    if (!echelles.some(e => e.id === 'ECHELLE_OLIVIER_GEO') && !supprimees.includes('ECHELLE_OLIVIER_GEO')) {
        echelles.push({
            id: 'ECHELLE_OLIVIER_GEO',
            nom: 'Échelle Géographie',
            description: 'Échelle 4 niveaux pour cours de géographie. Seuils: 70/65/55.',
            auteur: 'Labo Codex',
            discipline: 'Géographie',
            niveaux: [
                { code: 'I', nom: 'Incomplet', min: 0, max: 54, valeur: 40, couleur: '#dc3545' },
                { code: 'D', nom: 'en Développement', min: 55, max: 64, valeur: 60, couleur: '#fd7e14' },
                { code: 'M', nom: 'Maîtrisé', min: 65, max: 79, valeur: 72, couleur: '#28a745' },
                { code: 'E', nom: 'Étendu', min: 80, max: 100, valeur: 90, couleur: '#007bff' }
            ],
            verrouille: false,
            dansBibliotheque: true,
            dateCreation: new Date().toISOString()
        });
        nbAjoutees++;
    }

    // ============================================================================
    // ÉCHELLE JORDAN R. (Philosophie)
    // Sommative avec remplacement, échelle pourcentages
    // ============================================================================
    if (!echelles.some(e => e.id === 'ECHELLE_JORDAN_PHILO') && !supprimees.includes('ECHELLE_JORDAN_PHILO')) {
        echelles.push({
            id: 'ECHELLE_JORDAN_PHILO',
            nom: 'Échelle Philosophie 101',
            description: 'Échelle 4 niveaux pour cours de philosophie. Seuils: 80/60/50.',
            auteur: 'Labo Codex',
            discipline: 'Philosophie',
            niveaux: [
                { code: 'I', nom: 'Incomplet', min: 0, max: 49, valeur: 35, couleur: '#dc3545' },
                { code: 'D', nom: 'en Développement', min: 50, max: 59, valeur: 55, couleur: '#fd7e14' },
                { code: 'M', nom: 'Maîtrisé', min: 60, max: 79, valeur: 70, couleur: '#28a745' },
                { code: 'E', nom: 'Étendu', min: 80, max: 100, valeur: 90, couleur: '#007bff' }
            ],
            verrouille: false,
            dansBibliotheque: true,
            dateCreation: new Date().toISOString()
        });
        nbAjoutees++;
    }

    if (nbAjoutees > 0) {
        await db.set('echellesTemplates', echelles);
    }
}

async function initialiserModuleEchelles() {

    // ✅ AJOUT (8 décembre 2025) : Migration vers système de bibliothèque
    await migrerEchellesVersBibliotheque();

    // ✅ AJOUT (3 janvier 2026) : Assurer présence de l'échelle générique
    await assurerEchelleGenerique();

    // ✅ AJOUT (3 janvier 2026) : Assurer présence des échelles personnalisées (Bruno, Xavier)
    await assurerEchellesPersonnalisees();

    // Afficher la sidebar avec la liste des échelles (Beta 80.5+)
    if (typeof afficherListeEchelles === 'function') {
        await afficherListeEchelles();
    }

    // Vérifier que nous sommes dans la bonne section
    const elementTypeEchelle = document.getElementById('typeEchelle');
    if (!elementTypeEchelle) {
        return;
    }

    // Charger les échelles templates
    await chargerEchellesTemplates();

    // Afficher la nouvelle vue hiérarchique
    await afficherToutesLesEchellesNiveaux();

    // Charger la configuration
    await chargerConfigurationEchelle();

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
    options += '<option value="new">+ Créer une nouvelle échelle</option>';

    echelles.forEach(echelle => {
        const nomEchappe = echapperHtml(echelle.nom);
        options += `<option value="${echapperHtml(echelle.id)}">${nomEchappe}</option>`;
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
        nomContainer.classList.remove('u-hide');
        document.getElementById('nomEchelleTemplate').value = '';

        // Réinitialiser aux valeurs par défaut
        await reinitialiserNiveauxDefaut();
        echelleTemplateActuelle = null;

        // Note: Export/Import se font maintenant via la bibliothèque
        // Masquer les boutons dupliquer et supprimer
        if (btnDupliquer) btnDupliquer.classList.add('u-hide');
        if (btnSupprimer) btnSupprimer.classList.add('u-hide');

    } else {
        // Charger une échelle existante
        const echelles = await db.get('echellesTemplates') ||  [];
        const echelle = echelles.find(e => e.id === selectValue);

        if (echelle) {
            // Mettre à jour le select si un ID a été passé en paramètre
            if (echelleId && select) {
                select.value = echelleId;
            }

            nomContainer.classList.remove('u-hide');
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
            if (btnDupliquer) btnDupliquer.classList.remove('u-hide');
            if (btnExporter) btnExporter.classList.remove('u-hide');
            if (btnImporter) btnImporter.classList.remove('u-hide');
            if (btnSupprimer) btnSupprimer.classList.remove('u-hide');

            // Scroll vers le formulaire pour que l'utilisateur voie le changement
            const formulaire = document.getElementById('formEchelle');
            if (formulaire) {
                formulaire.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }

            // Afficher l'apercu PDF (Beta 95.7 - #30)
            if (typeof window.afficherApercuEchelleSelectionnee === 'function') {
                window.afficherApercuEchelleSelectionnee();
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
        echelleTemplateActuelle.description = document.getElementById('descriptionEchelle')?.value?.trim() || '';
        echelleTemplateActuelle.pratiquesCompatibles = pratiquesCompatibles;
        echelleTemplateActuelle.dateModification = new Date().toISOString();

        // 🆕 Beta 95.4 : Ajouter contributeur si l'utilisateur actif n'est pas l'auteur
        if (typeof ajouterContributeurSiNecessaire === 'function') {
            echelleTemplateActuelle = ajouterContributeurSiNecessaire(echelleTemplateActuelle);
        }

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
            id: genererIdUnique('ECH_'),
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

    notifications.succes(`Échelle «${nomEchelle}» enregistrée avec succès !`);

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
        id: genererIdUnique('ECH_'),
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

    notifications.succes(`Échelle «${nouvelleEchelle.nom}» créée avec succès.`);
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

    // Marquer comme supprimée si c'est un gabarit hardcodé
    if (window.IDS_GABARITS_HARDCODES && window.IDS_GABARITS_HARDCODES.includes(echelleId)) {
        window.marquerRessourceSupprimee(echelleId);
    }

    let echelles = await db.get('echellesTemplates') ||  [];
    echelles = echelles.filter(e => e.id !== echelleId);
    await db.set('echellesTemplates',  echelles);

    await chargerEchellesTemplates();
    await afficherToutesLesEchellesNiveaux();

    // ✅ AJOUT (8 décembre 2025) : Rafraîchir la barre latérale
    await afficherListeEchelles();

    afficherEchellesPerformance();
    notifications.succes('Échelle supprimée');
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
        champAutre.classList.remove('u-hide');
        notePassageContainer.innerHTML = `
            <input type="text" id="notePassage" class="controle-form"
                   placeholder="Ex: Compétent" data-on-change="sauvegarderConfigEchelle">
        `;
    } else {
        champAutre.classList.add('u-hide');
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
                                <button data-action="deplacerNiveauHaut" data-param="${index}"
                                        class="btn btn-compact"
                                        ${index === 0 ? 'disabled' : ''}
                                        title="Déplacer vers le haut"
                                        class="echelle-padding-compact">
                                    ↑
                                </button>
                                <button data-action="deplacerNiveauBas" data-param="${index}"
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
                                   data-on-change="modifierNiveauHandler" data-niveau-index="${index}" data-champ="code"
                                   class="controle-form"
                                   class="echelle-w-60-p4"
                                   >
                        </td>
                        <td>
                            <input type="text"
                                   value="${echapperHtml(niveau.nom)}"
                                   data-on-change="modifierNiveauHandler" data-niveau-index="${index}" data-champ="nom"
                                   class="controle-form"
                                   class="echelle-w-full-p4"
                                   >
                        </td>
                        <td>
                            <input type="text"
                                   value="${echapperHtml(niveau.description || '')}"
                                   data-on-change="modifierNiveauHandler" data-niveau-index="${index}" data-champ="description"
                                   class="controle-form"
                                   class="echelle-w-full-p4"
                                   >
                        </td>
                        <td>
                            <input type="number"
                                   value="${echapperHtml(niveau.min)}"
                                   data-on-change="modifierNiveauHandler" data-niveau-index="${index}" data-champ="min"
                                   class="controle-form"
                                   class="echelle-w-60-p4"
                                   min="0" max="100"
                                   >
                        </td>
<td>
    <input type="number"
           value="${echapperHtml(niveau.max)}"
           data-on-change="modifierNiveauHandler" data-niveau-index="${index}" data-champ="max"
           class="echelle-w-60" min="0" max="100"
           >
</td>
<td>
                            <input type="number"
                                   value="${niveau.valeurCalcul || ''}"
                                   data-on-change="modifierNiveauHandler" data-niveau-index="${index}" data-champ="valeurCalcul"
                                   class="echelle-w-80" min="0" max="100" step="0.1"
                                   placeholder="Ex: 32"
                                   >
                        </td>
                        <td>
    <select data-on-change="modifierNiveauHandler" data-niveau-index="${index}" data-champ="couleur"
            class="echelle-input-full"
            >
        ${paletteCouleurs.map(c => `
            <option value="${echapperHtml(c.valeur)}" ${niveau.couleur === c.valeur ? 'selected' : ''}>
                ${c.nom}
            </option>
        `).join('')}
    </select>
    <div id="apercu-couleur-${index}" 
         style="width: 30px; height: 30px; background: ${niveau.couleur}; 
         border-radius: 4px; margin-top: 5px; border: 1px solid var(--bordure-moyenne);"></div>
</td>
                        <td class="echelle-text-center">
                            ${niveaux.length > 1 ?
            `<button data-action="supprimerNiveau" data-param="${index}"
                                         class="btn btn-supprimer btn-compact"
                                         ${niveau.verrouille ? 'disabled' : ''}
                                         title="${niveau.verrouille ? 'Déverrouillez d\'abord pour supprimer' : 'Supprimer ce niveau'}">
                                    Supprimer
                                </button>`
            : ''}
                            <span id="cadenas-niveau-${index}"
                                  data-action="basculerVerrouillageNiveau" data-param="${index}"
                                  style="font-size: 1.2rem; cursor: pointer; user-select: none; margin-left: 8px;"
                                  title="${niveau.verrouille ? 'Verrouillé - Clique pour déverrouiller' : 'Modifiable - Clique pour verrouiller'}">
                                ${niveau.verrouille ? '<img src="icons/icon-lock.svg" alt="Verrouillé" class="btn-inline-icon">' : '<img src="icons/icon-open-lock.svg" alt="Modifiable" class="btn-inline-icon">'}
                            </span>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        <button class="btn btn-confirmer mt-2" data-action="ajouterNiveau">
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

    // ✅ FIX (10 jan 2026) : Synchroniser avec echelleTemplateActuelle et echellesTemplates
    if (echelleTemplateActuelle && echelleTemplateActuelle.id) {
        echelleTemplateActuelle.niveaux = niveaux;
        let echelles = await db.get('echellesTemplates') || [];
        const idx = echelles.findIndex(e => e.id === echelleTemplateActuelle.id);
        if (idx !== -1) {
            echelles[idx].niveaux = niveaux;
            echelles[idx].dateModification = new Date().toISOString();
            await db.set('echellesTemplates', echelles);
        }
    }

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
        cadenasElement.innerHTML = estVerrouille ? '<img src="icons/icon-lock.svg" alt="Verrouillé" class="btn-inline-icon">' : '<img src="icons/icon-open-lock.svg" alt="Modifiable" class="btn-inline-icon">';
        cadenasElement.title = estVerrouille ? 'Verrouillé - Clique pour déverrouiller' : 'Modifiable - Clique pour verrouiller';
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
    notifications.succes('Échelle réinitialisée aux valeurs par défaut');
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

    notifications.succes('Échelle de performance sauvegardée !');
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
    const toutesEchelles = await db.get('echellesTemplates') || [];

    // ✅ MODIFIÉ (6 jan 2026) : Utiliser détection heuristique pour filtrer démo + importées
    const echelles = typeof filtrerRessourcesNonDemo === 'function'
        ? filtrerRessourcesNonDemo(toutesEchelles, 'echelle')
        : toutesEchelles.filter(e => !e.estDemo && !e.auteurOriginal);
    const nbExclues = toutesEchelles.length - echelles.length;

    if (echelles.length === 0) {
        if (nbExclues > 0) {
            alert(`Aucune échelle personnelle à exporter.\n\n${nbExclues} échelle(s) exclue(s) car elles proviennent du matériel démo ou d'imports de collègues.`);
        } else {
            alert('Aucune échelle à exporter.');
        }
        return;
    }

    // Informer si des échelles ont été exclues
    let infoExclusion = '';
    if (nbExclues > 0) {
        infoExclusion = ` (${nbExclues} exclue(s) : démo/importées)`;
    }

    // NOUVEAU (Beta 91): Demander métadonnées enrichies
    const metaEnrichies = await demanderMetadonneesEnrichies(
        'Échelles de performance',
        `${echelles.length} échelle(s)${infoExclusion}`
    );

    if (!metaEnrichies) {
        return;
    }

    // Emballer avec métadonnées CC enrichies
    const donnees = ajouterMetadonnéesCC(
        { echelles: echelles },
        'echelles',
        'Échelles de performance',
        metaEnrichies
    );

    // Beta 95.3 : Nommage standardisé via helper unifié (horodaté pour éviter écrasement)
    const nomFichier = genererNomFichierExport('echelles', { inclureLicence: true, precisionDate: 'minute' });

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

    notifications.succes(`${echelles.length} échelle(s) exportée(s) avec succès`);
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
        return;
    }

    // Préparer le contenu pour l'export
    let contenuExport = { ...echelle };

    // Si l'échelle a été importée avec des métadonnées CC, ajouter l'utilisateur actuel comme contributeur
    if (echelle.metadata_cc) {
        // Demander le nom de l'utilisateur s'il modifie le matériel
        const nomUtilisateur = prompt(
            'Tu exportes un matériel créé par ' + echelle.metadata_cc.auteur_original + '.\n\n' +
            'Entre ton nom pour être crédité comme contributeur :\n' +
            '(Laisse vide si tu n\'as fait aucune modification)'
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
    // 🆕 Beta 95.3 : Nommage standardisé
    const nomFichier = typeof genererNomFichierExport === 'function'
        ? genererNomFichierExport('echelle', { nom: echelle.nom, discipline: echelle.discipline, inclureLicence: true })
        : `echelle-${(echelle.nom || 'echelle').replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
    a.download = nomFichier;
    a.click();
    URL.revokeObjectURL(url);

    notifications.succes(`Échelle "${echelle.nom}" exportée avec succès`);
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
                messageConfirmation = `Matériel sous licence ${metadata.licence}\n` +
                    `Auteur: ${metadata.auteur_original}\n` +
                    `Créé le: ${metadata.date_creation}\n\n`;
            }

            // Confirmer le remplacement
            const confirmation = confirm(
                messageConfirmation +
                `ATTENTION : cette action va remplacer l'échelle actuelle.\n\n` +
                `Veux-tu continuer ?`
            );

            if (!confirmation) {
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

            notifications.succes('Échelle importée et remplacée avec succès');

        } catch (error) {
            console.error('Erreur lors de l\'import:', error);
            alert('Erreur lors de la lecture du fichier JSON. Assure-toi qu\'il s\'agit d\'un fichier valide.');
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
async function importerEchelles(eventOuEl) {
    var target = eventOuEl.target || eventOuEl;
    const file = target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const donnees = JSON.parse(e.target.result);

            // Stocker temporairement dans une variable globale pour éviter problèmes sérialisation
            window._echellesImportEnAttente = donnees;

            // Vérifier licence CC et afficher badge
            const estCC = verifierLicenceCC(donnees);

            // Défense A : badge CC rendu dans une iframe sandbox isolée.
            // Voir js/securite-apercu-sandbox.js et MODELE-MENACES.md §D-01.
            // La classe `modal-import-echelles` cible la fermeture sans
            // impacter la bibliothèque ouverte en arrière-plan.
            const modal = document.createElement('div');
            modal.classList.add('modal-import-echelles');
            modal.innerHTML = `
                <div class="modal-js-overlay" style="z-index: 10001;">
                    <div class="modal-js-contenu" style="max-width: 600px;">
                        <div data-apercu-cc-slot class="u-mb-15"></div>
                        <p><strong>Veux-tu importer ces échelles ?</strong></p>
                        <div class="u-flex-gap-10" style="margin-top: 15px; justify-content: flex-end;">
                            <button class="btn btn-annuler" data-action="fermerModalImportEchelles">Annuler</button>
                            <button class="btn btn-confirmer" data-action="confirmerEtFermerImportEchelles">Importer</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            if (estCC && window.ApercuSandbox) {
                const slot = modal.querySelector('[data-apercu-cc-slot]');
                if (slot) {
                    window.ApercuSandbox.afficher(slot, genererBadgeCC(donnees.metadata), {
                        hauteurMin: 120,
                        hauteurMax: 500
                    });
                }
            } else if (!estCC) {
                avertirSansLicence(donnees);
            }

        } catch (error) {
            console.error('Erreur lors de l\'import:', error);
            alert('Erreur lors de la lecture du fichier.\n' + error.message);
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

        // ✅ CORRIGÉ (8 janvier 2026) : Ajouter UNIQUEMENT dans bibliothequeEchelles
        // L'utilisateur consulte puis choisit lesquelles ajouter à sa barre latérale
        const CLE_BIBLIOTHEQUE = window.CLE_BIBLIOTHEQUE_ECHELLES || 'bibliothequeEchelles';
        let bibliotheque = await db.get(CLE_BIBLIOTHEQUE) || [];

        // Fusionner dans la bibliothèque partagée uniquement
        let nbAjoutees = 0;
        let nbMisesAJour = 0;
        echellesImportees.forEach(echelle => {
            const indexBiblio = bibliotheque.findIndex(e => e.id === echelle.id);
            if (indexBiblio >= 0) {
                bibliotheque[indexBiblio] = { ...echelle, dateAjoutBiblio: bibliotheque[indexBiblio].dateAjoutBiblio };
                nbMisesAJour++;
            } else {
                bibliotheque.push({ ...echelle, dateAjoutBiblio: new Date().toISOString() });
                nbAjoutees++;
            }
        });

        // Sauvegarder uniquement la bibliothèque
        await db.set(CLE_BIBLIOTHEQUE, bibliotheque);

        // Rafraîchir le modal de bibliothèque s'il est ouvert
        if (document.getElementById('modalBibliothequeEchelles')) {
            await afficherBibliothequeEchelles();
        }

        let message = `Import réussi.\n\n`;
        if (nbAjoutees > 0) message += `${nbAjoutees} nouvelle(s) échelle(s) ajoutée(s).\n`;
        if (nbMisesAJour > 0) message += `${nbMisesAJour} échelle(s) mise(s) à jour.\n`;
        message += `\nConsultez "Échelles disponibles" pour les ajouter à ta barre latérale.`;
        alert(message);

    } catch (error) {
        console.error('Erreur lors de l\'import:', error);
        alert('Erreur lors de l\'import.\n' + error.message);
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

    const container = document.getElementById('sidebarListeEchelles');
    if (!container) {
        console.warn('   ⚠️ Élément sidebarListeEchelles introuvable');
        return;
    }

    // ✅ AJOUT (8 décembre 2025) : Filtrer uniquement les échelles dans la bibliothèque
    // Beta 99.39 (A.0) : masque les items démo en mode normal
    const echellesDansBibliotheque = BibliothequeUI.filtrerParModeDemo(
        echelles.filter(e => e.dansBibliotheque !== false)
    );

    // ✅ AJOUT (8 décembre 2025) : Bouton "Consulter la bibliothèque" en en-tête
    let html = `
        <div class="u-mb-15">
            <button data-action="afficherBibliothequeEchelles" class="btn btn-principal" style="width: 100%; font-size: 0.9rem;">
                Consulter la bibliothèque
            </button>
        </div>
    `;

    if (echellesDansBibliotheque.length === 0) {
        html += '<p class="sidebar-vide">Crée une nouvelle échelle ou puisez dans la bibliothèque</p>';
        container.innerHTML = html;
        return;
    }


    html += echellesDansBibliotheque.map(echelle => {
        const nomEchelle = echelle.nom || 'Sans titre';
        const nbNiveaux = echelle.niveaux?.length || 0;
        // Générer badges pratiques compatibles (utilise gabarits-utils.js)
        const badgesPratiques = typeof GabaritsUtils !== 'undefined'
            ? GabaritsUtils.genererBadgesPratiques(echelle)
            : '';
        return `
            <div class="sidebar-item" data-id="${echelle.id}" data-action="chargerEchellePourModif" data-param="${echelle.id}">
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
async function preparerDonneesBibliothequeEchelles() {
    const echelles = await db.get('echellesTemplates') || [];
    // Beta 99.39 (A.0) : masque les items démo en mode normal
    const echellesDansBibliotheque = BibliothequeUI.filtrerParModeDemo(
        echelles.filter(e => e.dansBibliotheque !== false)
    );
    const echellesDisponibles = BibliothequeUI.filtrerParModeDemo(
        await obtenirToutesLesEchellesBibliotheque()
    );
    const doublonsDetectes = detecterDoublonsEchelles(echellesDansBibliotheque, echellesDisponibles);

    // #327 — dossiers de classement (couche par-dessus, range par identité).
    const repsEchelles = (window.repertoiresBibliotheque && typeof window.repertoiresBibliotheque.obtenir === 'function')
        ? window.repertoiresBibliotheque.obtenir('echelles')
        : [];
    const repParEchelle = {};
    repsEchelles.forEach(r => (r.itemIds || []).forEach(id => { repParEchelle[id] = r.id; }));

    // Section 1
    const cartesSection1 = echellesDansBibliotheque.map(echelle => ({
        nom: BibliothequeUI.formaterTitreDemo(echelle.nom || 'Sans titre', BibliothequeUI.estItemDemo(echelle)),
        id: echelle.id,
        badgeSource: BibliothequeUI.genererBadgeSource(echelle, echellesDansBibliotheque),
        badgesPratiques: typeof GabaritsUtils !== 'undefined' ? GabaritsUtils.genererBadgesPratiques(echelle) : '',
        metadonnees: BibliothequeUI.formaterMetadonnees(echelle, {
            quantite: `${echelle.niveaux?.length || 0} niveau(x)`,
            discipline: true
        }),
        description: echelle.description || '',
        inspireDe: BibliothequeUI.formaterInspireDe(echelle),
        boutonPrincipal: { label: 'Dupliquer', action: 'dupliquerEchelleBibliotheque', param: echelle.id, classe: 'btn-confirmer', title: 'Créer une copie' },
        actionsMenu: [
            { label: 'Exporter pour partager', action: 'partageExport.exporterPourPartager', param: 'echelle', param2: echelle.id, classe: 'btn-secondaire', title: 'Générer un fichier .lcz signé à transmettre (#329)' },
            { label: 'Retirer', action: 'retirerEchelleDeBibliotheque', param: echelle.id, classe: 'btn-secondaire', title: 'Retirer de la barre latérale (données conservées)' },
            { label: 'Supprimer', action: 'supprimerEchelleDefinitivement', param: echelle.id, classe: 'btn-supprimer', title: 'Supprimer définitivement' }
        ]
    }));

    // Section 2 : #327 — cartes à plat (le groupage par dossier se fait au rendu
    // via repertoiresBibliotheque.grouper). Chaque carte porte au menu ⋮ les
    // actions « Classer dans … » / « Retirer du dossier » selon son dossier courant.
    const cartesSection2 = echellesDisponibles.map(echelle => {
        const pratiques = echelle.pratiques || (echelle.gabaritType ? [echelle.gabaritType] : ['all']);
        let badgesPratiques = '';
        if (window.GabaritsUtils) {
            badgesPratiques = window.GabaritsUtils.genererBadgesPratiques(echelle);
        } else {
            pratiques.forEach(p => {
                const label = p === 'all' ? 'Multi' : p;
                const classeCSS = p === 'all' ? '' : p.toLowerCase();
                badgesPratiques += `<span class="badge-pratique-compact ${classeCSS}">${label}</span>`;
            });
        }

        const dejaPresent = echelles.some(e => (e.id === echelle.id || e.idOriginal === echelle.id) && e.dansBibliotheque !== false);
        const estGabarit = echelle.estGabarit === true;
        const styleGabarit = estGabarit ? 'border-left: 4px solid var(--gabarit-couleur); background: var(--gabarit-fond);' : '';
        const gabaritBadge = estGabarit ? '<span style="font-size: 0.7rem; color: var(--gabarit-couleur); font-weight: 500;">(gabarit)</span>' : '';

        const repCourant = repParEchelle[echelle.id] || null;
        const actionsMenu = [];
        repsEchelles.forEach(r => {
            if (r.id !== repCourant) {
                actionsMenu.push({ label: 'Classer dans : ' + r.nom, action: 'BibliothequeUI.repertoires.classer', param: 'echelles', param2: echelle.id, param3: r.id, classe: 'btn-secondaire', title: 'Ranger dans ce dossier' });
            }
        });
        if (repCourant) {
            actionsMenu.push({ label: 'Retirer du dossier', action: 'BibliothequeUI.repertoires.retirer', param: 'echelles', param2: echelle.id, classe: 'btn-secondaire', title: 'Sortir du dossier (repasse en non classées)' });
        }
        actionsMenu.push({ label: 'Supprimer', action: 'supprimerEchelleDeBibliothequePartagee', param: echelle.id, classe: 'btn-supprimer', title: 'Supprimer définitivement de la bibliothèque', showAlways: true });

        return {
            nom: BibliothequeUI.formaterTitreDemo(echelle.nom || 'Sans titre', BibliothequeUI.estItemDemo(echelle)) + ' ' + gabaritBadge,
            id: echelle.id,
            badgeSource: BibliothequeUI.genererBadgeSource(echelle, echellesDansBibliotheque),
            badgesPratiques: badgesPratiques,
            metadonnees: BibliothequeUI.formaterMetadonnees(echelle, {
                quantite: `${echelle.niveaux?.length || 0} niveau(x)`,
                discipline: true
            }),
            inspireDe: BibliothequeUI.formaterInspireDe(echelle),
            description: echelle.description || '',
            dejaPresent: dejaPresent,
            classeItem: 'echelle-disponible-item',
            styleExtra: styleGabarit,
            boutonPrincipal: { label: 'Ajouter à ma sélection', action: 'ajouterEchelleIndividuelle', param: echelle.id, classe: 'btn-confirmer', title: 'Ajouter cette échelle à ta sélection' },
            actionsMenu: actionsMenu
        };
    });

    // Import trimestre
    const trimestresDisponibles = typeof listerTrimestresAvecEchelles === 'function' ? listerTrimestresAvecEchelles() : [];
    const sectionImportTrimestre = trimestresDisponibles.length > 0 ? { trimestres: trimestresDisponibles } : null;

    return { cartesSection1, cartesSection2, doublonsDetectes, sectionImportTrimestre, repsEchelles };
}

async function afficherBibliothequeEchelles() {
    // #327 — enregistre la biblio « echelles » auprès du helper générique de
    // répertoires (idempotent). Les items de Section 2 sont des cartes-config
    // déjà libellées : labelItem lit leur .nom tel quel.
    BibliothequeUI.repertoires.enregistrer('echelles', {
        rafraichir: afficherBibliothequeEchelles,
        ajouterItem: (id) => ajouterEchelleIndividuelle(id),
        supprimerItem: (id) => supprimerEchelleDeBibliothequePartagee(id),
        labelItem: (c) => c.nom,
        labelPluriel: 'échelles'
    });

    const data = await preparerDonneesBibliothequeEchelles();

    // Section 1
    let contenuSection1 = '';
    if (data.cartesSection1.length === 0) {
        contenuSection1 = '<p style="color: var(--gris-clair); font-style: italic;">Aucune échelle dans la barre latérale</p>';
    } else {
        data.cartesSection1.forEach(carte => {
            contenuSection1 += BibliothequeUI.renderCarteSelection(carte);
        });
    }

    const boutonsApresSection1 = `
        <div style="margin-top: 15px; display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">
            <button data-action="ajouterMesEchellesALaBibliotheque" class="btn btn-principal btn-mini">Ajouter mes échelles à la bibliothèque</button>
            <button data-action="exporterEchelles" class="btn btn-secondaire btn-mini">Exporter toutes mes échelles</button>
            <button data-action="ouvrirFilePickerImportEchelles" class="btn btn-secondaire btn-mini">Importer des échelles</button>
            <input type="file" id="fichier-import-echelles-modal" accept=".json" style="display: none;" data-on-change="importerEchelles">
        </div>`;

    // Section import trimestre
    let sectionImportTrimestre = '';
    if (data.sectionImportTrimestre) {
        const trimestres = data.sectionImportTrimestre.trimestres;
        sectionImportTrimestre = `
            <div style="margin-top: 20px; padding: 15px; background: var(--gris-tres-pale); border-radius: 6px; border: 1px solid var(--bordure-claire);">
                <h4 style="color: var(--accent-primaire); font-size: 1rem; margin: 0 0 10px 0;">Importer depuis un autre trimestre</h4>
                <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                    <select id="selectTrimestreImportEchelles" class="controle-form" style="flex: 1; min-width: 200px;">
                        <option value="">-- Choisir un trimestre --</option>
                        ${trimestres.map(t => `<option value="${echapperHtml(t.cle)}">${t.nom} (${t.nombre} échelle${t.nombre > 1 ? 's' : ''})</option>`).join('')}
                    </select>
                    <button data-action="afficherEchellesTrimestreModal" class="btn btn-secondaire btn-compact">Voir les échelles</button>
                    <button data-action="importerToutEchellesTrimestreModal" class="btn btn-principal btn-compact">Tout importer</button>
                </div>
                <div id="previewEchellesTrimestre" style="margin-top: 10px; display: none;"></div>
            </div>`;
    }

    // Filtres Section 2 : #327 — filtres discipline ET pratique retirés (incohérents
    // avec l'organisation par dossiers). La zone « Mes dossiers » (repliable) tient
    // lieu de tête de section ; le toggle « masquer déjà présents » (#293) est conservé.
    const filtresHTML = BibliothequeUI.repertoires.genererZone('echelles') +
        BibliothequeUI.renderToggleMasquerDejaPresent('afficherBibliothequeEchelles');

    // Section 2 — #293 (masquer déjà présents) puis #327 (groupage par dossier).
    const cartesAffichables = BibliothequeUI.filtrerParDejaPresent(data.cartesSection2);
    const enteteGroupe = (titre) => `<h4 style="margin:18px 0 8px; padding-bottom:4px; border-bottom:1px solid var(--bordure, #ddd); color:var(--texte-secondaire, #555); font-size:0.95rem;">${echapperHtml(titre)}</h4>`;

    let contenuSection2 = '';
    if (cartesAffichables.length === 0) {
        contenuSection2 = '<p style="color: var(--gris-clair); font-style: italic;">Aucune échelle disponible à ajouter</p>';
    } else if (data.repsEchelles && data.repsEchelles.length === 0) {
        // Aucun dossier → liste à plat (comportement d'origine)
        cartesAffichables.forEach(carte => { contenuSection2 += BibliothequeUI.renderCarteDisponible(carte); });
    } else {
        // Dossier → select compact ; « Non classées » → cartes (ce qui reste à ranger).
        const groupes = window.repertoiresBibliotheque.grouper(cartesAffichables, 'echelles');
        groupes.forEach(g => {
            const cleGroupe = g.id || '__nonclasse__';
            contenuSection2 += `<div class="biblio-groupe-repertoire" data-repertoire-id="${echapperHtml(cleGroupe)}">`;
            contenuSection2 += enteteGroupe(g.titre);
            if (g.id) {
                contenuSection2 += BibliothequeUI.repertoires.renderLigneDossierSelect('echelles', g);
            } else {
                g.items.forEach(carte => { contenuSection2 += BibliothequeUI.renderCarteDisponible(carte); });
            }
            contenuSection2 += `</div>`;
        });
    }

    BibliothequeUI.creerModal({
        modalId: 'modalBibliothequeEchelles',
        titre: "Bibliothèque d'échelles de performance",
        sousTitre: 'Gérez les échelles de performance affichées dans la barre latérale.',
        onFermer: 'fermerModalBibliothequeEchelles',
        doublonsHTML: BibliothequeUI.renderAvertissementDoublons(data.doublonsDetectes),
        titreSection1: 'Échelles dans la barre latérale',
        contenuIdListe1: 'listeEchellesDansBibliotheque',
        contenuSection1: contenuSection1,
        boutonsApresSection1: boutonsApresSection1,
        sectionImportTrimestre: sectionImportTrimestre,
        titreSection2: 'Échelles disponibles à ajouter à la barre latérale',
        filtresSection2: filtresHTML,
        contenuIdListe2: 'listeEchellesDisponibles',
        contenuSection2: contenuSection2
    });
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
            echelle = echelles.find(e => e.idOriginal === id);
        }

        if (!echelle) {
            const toutesEchelles = await obtenirToutesLesEchellesBibliotheque();
            const echelleSource = toutesEchelles.find(e => e.id === id);
            if (echelleSource) {
                // Générer un nouvel ID pour éviter les conflits (pattern Productions)
                const nouvelId = genererIdUnique('ECH_');
                echelle = {
                    ...echelleSource,
                    id: nouvelId,
                    idOriginal: echelleSource.id,
                    dansBibliotheque: true,
                    dateImport: new Date().toISOString()
                };
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
        alert('Échelle ajoutée à ta sélection avec succès !');
    } catch (error) {
        console.error('Erreur lors de l\'ajout:', error);
        alert('Erreur lors de l\'ajout de l\'échelle');
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

}

/**
 * ✅ AJOUT (28 janvier 2026) : Supprimer définitivement une échelle (hard delete)
 * @param {string} id - ID de l'échelle à supprimer
 */
async function supprimerEchelleDefinitivement(id) {
    const echelles = await db.get('echellesTemplates') || [];
    const echelle = echelles.find(e => e.id === id);

    if (!echelle) return;

    // Pas de dépendances directes pour les échelles

    // Confirmation
    if (!confirm(`Supprimer définitivement l'échelle «${echelle.nom}» ?\n\nCette action est irréversible.`)) {
        return;
    }

    // Marquer comme supprimée si c'est un gabarit hardcodé
    if (window.IDS_GABARITS_HARDCODES && window.IDS_GABARITS_HARDCODES.includes(id)) {
        window.marquerRessourceSupprimee(id);
    }

    // Suppression définitive du store local
    const nouvellesEchelles = echelles.filter(e => e.id !== id);
    await db.set('echellesTemplates', nouvellesEchelles);

    // Suppression du store partagé
    if (typeof retirerEchelleDeLaBibliotheque === 'function') {
        await retirerEchelleDeLaBibliotheque(id);
    }

    // Rafraîchir UI
    fermerModalBibliothequeEchelles();
    await afficherListeEchelles();
    await afficherBibliothequeEchelles();

}

/**
 * Supprimer une échelle de la bibliothèque partagée uniquement (Section 2)
 * @param {string} id - ID de l'échelle à supprimer
 */
async function supprimerEchelleDeBibliothequePartagee(id) {
    const biblio = typeof obtenirToutesLesEchellesBibliotheque === 'function'
        ? await obtenirToutesLesEchellesBibliotheque()
        : [];
    const echelle = biblio.find(e => e.id === id);
    if (!echelle) return;

    if (!confirm(`Supprimer définitivement «${echelle.nom || 'Sans titre'}» de la bibliothèque partagée ?\n\nCette action est irréversible.`)) return;

    await retirerEchelleDeLaBibliotheque(id);

    fermerModalBibliothequeEchelles();
    await afficherBibliothequeEchelles();
}

/**
 * Ajouter toutes les échelles locales à la bibliothèque partagée
 */
async function ajouterMesEchellesALaBibliotheque() {
    try {
        const echelles = await db.get('echellesTemplates') || [];

        if (echelles.length === 0) {
            alert('Aucune échelle à ajouter.\n\nCréez d\'abord des échelles.');
            return;
        }

        if (!confirm(`Veux-tu ajouter tes ${echelles.length} échelle(s) à la bibliothèque partagée ?\n\nElles seront disponibles dans tous tes trimestres et pourront être partagées avec des collègues.`)) return;

        const resultat = await importerEchellesDansBibliotheque(echelles);

        fermerModalBibliothequeEchelles();
        await afficherBibliothequeEchelles();

        if (resultat.ajoutees > 0) {
            alert(`${resultat.ajoutees} échelle(s) ajoutée(s) à la bibliothèque !` +
                (resultat.existantes > 0 ? `\n${resultat.existantes} étai(en)t déjà présente(s).` : ''));
        } else {
            alert('Toutes tes échelles étaient déjà dans la bibliothèque.');
        }
    } catch (error) {
        console.error('Erreur lors de l\'ajout à la bibliothèque:', error);
        alert('Erreur lors de l\'ajout des échelles à la bibliothèque.');
    }
}

/**
 * ✅ AJOUT (28 janvier 2026) : Dupliquer une échelle dans la bibliothèque
 * @param {string} id - ID de l'échelle à dupliquer
 */
async function dupliquerEchelleBibliotheque(id) {
    const echelles = await db.get('echellesTemplates') || [];
    const echelle = echelles.find(e => e.id === id);

    if (!echelle) {
        alert('Échelle introuvable');
        return;
    }

    // Créer une copie avec un nouvel ID. La copie devient un nouvel original
    // de l'utilisateur ; trace d'origine `inspireDe` (respect CC BY). Si la
    // source était une démo, la copie perd le flag isDemo.
    const nouvelleEchelle = {
        ...echelle,
        id: genererIdUnique('ECH_'),
        nom: `${echelle.nom} (copie)`,
        auteur: BibliothequeUI.obtenirAuteurActif(),
        isDemo: false,
        inspireDe: BibliothequeUI.forgerInspireDe(echelle),
        dansBibliotheque: true,
        dateCreation: new Date().toISOString()
    };

    // Supprimer les métadonnées de partage
    delete nouvelleEchelle.metadata_cc;
    delete nouvelleEchelle.auteurOriginal;

    // Ajouter à la liste
    echelles.push(nouvelleEchelle);
    await db.set('echellesTemplates', echelles);

    // Rafraîchir UI
    fermerModalBibliothequeEchelles();
    await afficherListeEchelles();
    await afficherBibliothequeEchelles();

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

// #327 — filtrerEchellesParDiscipline + filtrerEchellesBibliotheque retirés :
// les filtres discipline/pratique n'existent plus (incohérents avec l'organisation
// par dossiers). Remplacés par la zone « Mes dossiers » + le groupage par dossier
// dans afficherBibliothequeEchelles.

/**
 * ✅ AJOUT (8 décembre 2025) : Fermer le modal de bibliothèque
 */
function fermerModalBibliothequeEchelles() {
    BibliothequeUI.fermerModal('modalBibliothequeEchelles');
}

/**
 * 🆕 Beta 95.3 : Afficher la prévisualisation des échelles d'un trimestre
 */
function afficherEchellesTrimestreModal() {
    const select = document.getElementById('selectTrimestreImportEchelles');
    const preview = document.getElementById('previewEchellesTrimestre');

    if (!select || !preview) return;

    const cleSelectionnee = select.value;
    if (!cleSelectionnee) {
        preview.classList.add('u-hide');
        return;
    }

    const echelles = typeof obtenirEchellesTrimestre === 'function'
        ? obtenirEchellesTrimestre(cleSelectionnee)
        : [];

    if (echelles.length === 0) {
        preview.innerHTML = '<p style="color: var(--gris-clair); font-style: italic;">Aucune échelle trouvée.</p>';
        preview.classList.remove('u-hide');
        return;
    }

    let html = '<div style="max-height: 200px; overflow-y: auto; border: 1px solid var(--bordure-claire); border-radius: 4px; padding: 10px;">';
    echelles.forEach(echelle => {
        const nbNiveaux = echelle.niveaux?.length || 0;
        html += `
            <div style="padding: 8px; border-bottom: 1px solid var(--bordure-claire); display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong>${echelle.nom || 'Sans titre'}</strong>
                    ${echelle.discipline ? ` - ${echelle.discipline}` : ''}
                    <br><small style="color: var(--gris-moyen);">${nbNiveaux} niveau(x)${echelle.auteurOriginal ? ' • ' + echelle.auteurOriginal : ''}</small>
                </div>
                <button data-action="importerUneEchelleTrimestre" data-param="${cleSelectionnee}" data-param2="${echelle.id}" class="btn btn-confirmer btn-tres-compact">
                    Importer
                </button>
            </div>
        `;
    });
    html += '</div>';

    preview.innerHTML = html;
    preview.classList.remove('u-hide');
}

/**
 * 🆕 Beta 95.3 : Importer toutes les échelles d'un trimestre
 */
async function importerToutEchellesTrimestreModal() {
    const select = document.getElementById('selectTrimestreImportEchelles');
    if (!select || !select.value) {
        alert('Veuillez d\'abord sélectionner un trimestre.');
        return;
    }

    const cleSelectionnee = select.value;
    const codeTrimestre = cleSelectionnee.replace('_echelles', '');
    const nomTrimestre = typeof formaterNomTrimestreEchelles === 'function'
        ? formaterNomTrimestreEchelles(codeTrimestre)
        : codeTrimestre;

    const echelles = typeof obtenirEchellesTrimestre === 'function'
        ? obtenirEchellesTrimestre(cleSelectionnee)
        : [];

    if (echelles.length === 0) {
        alert('Aucune échelle à importer dans ce trimestre.');
        return;
    }

    const confirmation = confirm(
        `Veux-tu importer les ${echelles.length} échelle(s) de ${nomTrimestre} dans la bibliothèque partagée ?`
    );

    if (!confirmation) return;

    // Importer chaque échelle
    let ajoutees = 0;
    let existantes = 0;

    for (const echelle of echelles) {
        const resultat = await ajouterEchelleALaBibliotheque(echelle);
        if (resultat) {
            ajoutees++;
        } else {
            existantes++;
        }
    }

    // Rafraîchir l'affichage
    fermerModalBibliothequeEchelles();
    await afficherBibliothequeEchelles();

    alert(`Import terminé.\n\n${ajoutees} échelle(s) ajoutée(s).\n${existantes} déjà présente(s).`);
}

/**
 * 🆕 Beta 95.3 : Importer une seule échelle d'un trimestre
 */
async function importerUneEchelleTrimestre(cleTrimestre, echelleId) {
    const echelles = typeof obtenirEchellesTrimestre === 'function'
        ? obtenirEchellesTrimestre(cleTrimestre)
        : [];
    const echelle = echelles.find(e => e.id === echelleId);

    if (!echelle) {
        alert('Échelle introuvable.');
        return;
    }

    const resultat = await ajouterEchelleALaBibliotheque(echelle);

    if (resultat) {
        // Rafraîchir l'affichage
        fermerModalBibliothequeEchelles();
        await afficherBibliothequeEchelles();
        alert(`"${echelle.nom || 'Échelle'}" ajoutée à la bibliothèque.`);
    } else {
        alert('Cette échelle est déjà dans la bibliothèque.');
    }
}

async function creerNouvelleEchelle() {
    document.getElementById('accueilEchelles').classList.add('u-hide');
    document.getElementById('conteneurEditionEchelle').classList.remove('u-hide');

    // Note: Section optionsImportExportEchelles supprimée (Beta 92)
    // Les boutons Import/Export sont maintenant dans l'en-tête

    // Masquer les boutons Exporter, Importer, Dupliquer et Supprimer (mode création)
    // Note: Export/Import se font maintenant via la bibliothèque
    const btnDupliquer = document.getElementById('btnDupliquerEchelle');
    const btnSupprimer = document.getElementById('btnSupprimerEchelle');
    if (btnDupliquer) btnDupliquer.classList.add('u-hide');
    if (btnSupprimer) btnSupprimer.classList.add('u-hide');

    // Réinitialiser le formulaire
    document.getElementById('nomEchelleTemplate').value = '';
    document.getElementById('descriptionEchelle').value = '';

    // ✅ AJOUT (6 jan 2026) : Vider le panneau métadonnées (mode création)
    const panneauMeta = document.getElementById('panneauMetadonneesEchelle');
    if (panneauMeta) panneauMeta.innerHTML = '';

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
                <p style="color: var(--gris-moyen); margin-bottom: 15px;">Aucun niveau défini.</p>
                <button class="btn btn-confirmer" data-action="ajouterPremierNiveau">
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
        <div class="item-liste" style="position: relative; padding: 15px; background: var(--surface-conteneur, #162c36); margin-bottom: 10px;">
            ${niveaux.length > 1 ? `
                <button data-action="supprimerNiveauTemp" data-param="${index}"
                        class="btn btn-supprimer btn-tres-compact"
                        title="Supprimer ce niveau"
                        style="position: absolute; top: 8px; right: 8px;">
                    ✕
                </button>
            ` : ''}
            <div class="echelle-niveau-grille">
                <div class="groupe-form echelle-text-center">
                    <label class="echelle-texte-detail">Ordre</label>
                    <div style="display: flex; flex-direction: column; gap: 4px;">
                        <button data-action="deplacerNiveauTempHaut" data-param="${index}"
                                class="btn btn-compact"
                                ${index === 0 ? 'disabled' : ''}
                                title="Déplacer vers le haut">
                            ↑
                        </button>
                        <button data-action="deplacerNiveauTempBas" data-param="${index}"
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
                           value="${echapperHtml(niveau.code)}"
                           placeholder="Ex: ${ph.code}"
                           maxlength="3"
                           data-on-change="modifierNiveauTempHandler" data-niveau-index="${index}" data-champ="code"
                           style="font-weight: 600; text-align: center;">
                </div>
                <div class="groupe-form">
                    <label class="echelle-texte-detail" data-tooltip="cn-echelle-niveau">Nom du niveau</label>
                    <input type="text"
                           class="controle-form"
                           value="${echapperHtml(niveau.nom)}"
                           placeholder="Ex: ${ph.nom}"
                           data-on-change="modifierNiveauTempHandler" data-niveau-index="${index}" data-champ="nom"
                           style="font-weight: 500;">
                </div>
                <div class="groupe-form">
                    <label class="echelle-texte-detail">Min (%)
                        <span class="primo-aide" data-target="echelle-plage-notes"><span class="icone-info-aide taille-inline" aria-hidden="true"></span></span>
                    </label>
                    <input type="number"
                           class="controle-form"
                           value="${echapperHtml(niveau.min)}"
                           min="0"
                           max="100"
                           data-on-change="modifierNiveauTempHandler" data-niveau-index="${index}" data-champ="min" data-parse-float>
                </div>
                <div class="groupe-form">
                    <label class="echelle-texte-detail">Max (%)</label>
                    <input type="number"
                           class="controle-form"
                           value="${echapperHtml(niveau.max)}"
                           min="0"
                           max="100"
                           data-on-change="modifierNiveauTempHandler" data-niveau-index="${index}" data-champ="max" data-parse-float>
                </div>
                <div class="groupe-form">
                    <label class="echelle-texte-detail" data-tooltip="cn-echelle-valeur-ponctuelle">Valeur ponctuelle
                        <span class="primo-aide" data-target="echelle-valeur-ponctuelle"><span class="icone-info-aide taille-inline" aria-hidden="true"></span></span>
                    </label>
                    <input type="number"
                           class="controle-form"
                           value="${echapperHtml(niveau.valeurCalcul)}"
                           min="0"
                           max="100"
                           step="0.01"
                           data-on-change="modifierNiveauTempHandler" data-niveau-index="${index}" data-champ="valeurCalcul" data-parse-float>
                </div>
                <div class="groupe-form">
                    <label class="echelle-texte-detail">Couleur</label>
                    ${window.travauxOutils.renderPickerCouleur(niveau.couleur, {
                        dataAttrs: {
                            'on-change': 'modifierNiveauTempHandler',
                            'niveau-index': index,
                            'champ': 'couleur'
                        }
                    })}
                </div>
            </div>
        </div>
    `}).join('');

    // Bouton ajouter niveau
    const btnAjouterNiveau = `
        <button class="sidebar-btn-ajouter" data-action="ajouterNiveauTemp">
            + Ajouter un niveau
        </button>
    `;

    container.innerHTML = html + btnAjouterNiveau;

    // Afficher l'aperçu visuel
    if (apercuContainer) {
        const apercuHtml = niveaux.map(niveau => `
            <div style="text-align: center; flex: 1; padding: 10px; background: ${niveau.couleur}20; border-radius: 4px; margin: 0 2px;">
                <strong style="font-size: 1.2rem; color: ${niveau.couleur};">${echapperHtml(niveau.code || '?')}</strong>
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
    document.getElementById('conteneurEditionEchelle').classList.add('u-hide');
    // Note: Section optionsImportExportEchelles supprimée (Beta 92)
    document.getElementById('accueilEchelles').classList.remove('u-hide');

    // Réinitialiser les champs
    document.getElementById('nomEchelleTemplate').value = '';
    document.getElementById('descriptionEchelle').value = '';
    document.getElementById('tableauNiveauxEchelle').innerHTML = '';

    // Réinitialiser la référence à l'échelle actuelle
    echelleTemplateActuelle = null;

}

async function chargerEchellePourModif(id) {
    const echelles = await db.get('echellesTemplates') ||  [];
    const echelle = echelles.find(e => e.id === id);

    if (!echelle) return;

    // Définir l'échelle comme échelle actuelle pour permettre les modifications
    echelleTemplateActuelle = echelle;

    document.getElementById('accueilEchelles').classList.add('u-hide');
    document.getElementById('conteneurEditionEchelle').classList.remove('u-hide');

    // Note: Section optionsImportExportEchelles supprimée (Beta 92)
    // Les boutons Import/Export sont maintenant dans l'en-tête

    // Note: Export/Import se font maintenant via la bibliothèque
    // Afficher les boutons Dupliquer et Supprimer (mode édition)
    const btnDupliquer = document.getElementById('btnDupliquerEchelle');
    const btnSupprimer = document.getElementById('btnSupprimerEchelle');
    if (btnDupliquer) btnDupliquer.classList.remove('u-hide');
    if (btnSupprimer) btnSupprimer.classList.remove('u-hide');

    // Remplir le formulaire
    document.getElementById('nomEchelleTemplate').value = echelle.nom || '';
    document.getElementById('descriptionEchelle').value = echelle.description || '';

    // Afficher les checkboxes pratiques compatibles
    const containerPratiques = document.getElementById('checkboxesPratiquesEchelle');
    if (containerPratiques && typeof GabaritsUtils !== 'undefined') {
        const pratiquesActuelles = echelle.pratiquesCompatibles || [];
        containerPratiques.innerHTML = GabaritsUtils.genererCheckboxesPratiques('echelle', pratiquesActuelles);
    }

    // ✅ AJOUT (6 jan 2026) : Afficher le panneau métadonnées
    const panneauMeta = document.getElementById('panneauMetadonneesEchelle');
    if (panneauMeta && typeof genererPanneauMetadonnees === 'function') {
        panneauMeta.innerHTML = genererPanneauMetadonnees(echelle, 'echelle');
    }

    // Afficher les niveaux
    afficherNiveauxEchelle(echelle);

    // Phase 4.B : mode lecture seule si item démo
    const conteneur = document.getElementById('conteneurEditionEchelle');
    if (conteneur && typeof BibliothequeUI !== 'undefined' && BibliothequeUI.appliquerModeLectureSeuleDemo) {
        BibliothequeUI.appliquerModeLectureSeuleDemo(conteneur, echelle, 'dupliquerEtEditerEchelle', 'Dupliquer pour créer mon échelle');
    }

    // Mettre le highlight et rafraîchir la sidebar
    await definirEchelleActive(id);
    await afficherListeEchelles();
}

/**
 * Phase 4.B : fork une échelle démo et charge la copie en édition.
 */
async function dupliquerEtEditerEchelle(id) {
    const echelles = await db.get('echellesTemplates') || [];
    const echelle = echelles.find(e => e.id === id);
    if (!echelle) return;

    const copie = BibliothequeUI.forkerItem(echelle, 'ECH_');
    echelles.push(copie);
    await db.set('echellesTemplates', echelles);

    await afficherListeEchelles();
    await chargerEchellePourModif(copie.id);

    const nomField = document.getElementById('nomEchelleTemplate');
    if (nomField) {
        nomField.focus();
        nomField.select();
    }
}

function afficherNiveauxEchelle(echelle) {
    const container = document.getElementById('tableauNiveauxEchelle');
    const apercuContainer = document.getElementById('apercuEchelleNiveaux');


    if (!container) {
        console.error('❌ Container tableauNiveauxEchelle introuvable');
        return;
    }

    if (!echelle.niveaux || echelle.niveaux.length === 0) {
        console.warn('⚠️ Aucun niveau défini pour cette échelle');
        container.innerHTML = '<p style="color: var(--gris-clair); font-style: italic;">Aucun niveau défini</p>';
        if (apercuContainer) apercuContainer.innerHTML = '';
        return;
    }

    // Afficher le tableau des niveaux en mode édition
    const html = echelle.niveaux.map((niveau, index) => `
        <div class="item-liste" style="position: relative; padding: 15px; background: var(--surface-conteneur, #162c36); margin-bottom: 10px;">
            ${echelle.niveaux.length > 1 ? `
                <button data-action="supprimerNiveauEchelle" data-param="${echelle.id}" data-param2="${index}"
                        class="btn btn-supprimer btn-tres-compact"
                        title="Supprimer ce niveau"
                        style="position: absolute; top: 8px; right: 8px;">
                    ✕
                </button>
            ` : ''}
            <div class="echelle-niveau-grille">
                <div class="groupe-form echelle-text-center">
                    <label class="echelle-texte-detail">Ordre</label>
                    <div style="display: flex; flex-direction: column; gap: 4px;">
                        <button data-action="deplacerNiveauEchelleHaut" data-param="${echelle.id}" data-param2="${index}"
                                class="btn btn-compact"
                                ${index === 0 ? 'disabled' : ''}
                                title="Déplacer vers le haut"
                                class="echelle-padding-compact">
                            ↑
                        </button>
                        <button data-action="deplacerNiveauEchelleBas" data-param="${echelle.id}" data-param2="${index}"
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
                           value="${echapperHtml(niveau.code)}"
                           maxlength="3"
                           data-on-change="modifierNiveauEchelleHandler" data-echelle-id="${echelle.id}" data-niveau-index="${index}" data-champ="code"
                           style="font-weight: 600; text-align: center;">
                </div>
                <div class="groupe-form">
                    <label class="echelle-texte-detail" data-tooltip="cn-echelle-niveau">Nom du niveau</label>
                    <input type="text"
                           class="controle-form"
                           value="${echapperHtml(niveau.nom)}"
                           data-on-change="modifierNiveauEchelleHandler" data-echelle-id="${echelle.id}" data-niveau-index="${index}" data-champ="nom"
                           style="font-weight: 500;">
                </div>
                <div class="groupe-form">
                    <label class="echelle-texte-detail">Min (%)
                        <span class="primo-aide" data-target="echelle-plage-notes"><span class="icone-info-aide taille-inline" aria-hidden="true"></span></span>
                    </label>
                    <input type="number"
                           class="controle-form"
                           value="${echapperHtml(niveau.min)}"
                           min="0"
                           max="100"
                           data-on-change="modifierNiveauEchelleHandler" data-echelle-id="${echelle.id}" data-niveau-index="${index}" data-champ="min" data-parse-float>
                </div>
                <div class="groupe-form">
                    <label class="echelle-texte-detail">Max (%)</label>
                    <input type="number"
                           class="controle-form"
                           value="${echapperHtml(niveau.max)}"
                           min="0"
                           max="100"
                           data-on-change="modifierNiveauEchelleHandler" data-echelle-id="${echelle.id}" data-niveau-index="${index}" data-champ="max" data-parse-float>
                </div>
                <div class="groupe-form">
                    <label class="echelle-texte-detail" data-tooltip="cn-echelle-valeur-ponctuelle">Valeur ponctuelle
                        <span class="primo-aide" data-target="echelle-valeur-ponctuelle"><span class="icone-info-aide taille-inline" aria-hidden="true"></span></span>
                    </label>
                    <input type="number"
                           class="controle-form"
                           value="${echapperHtml(niveau.valeurCalcul)}"
                           min="0"
                           max="100"
                           step="0.01"
                           data-on-change="modifierNiveauEchelleHandler" data-echelle-id="${echelle.id}" data-niveau-index="${index}" data-champ="valeurCalcul" data-parse-float>
                </div>
                <div class="groupe-form">
                    <label class="echelle-texte-detail">Couleur</label>
                    ${window.travauxOutils.renderPickerCouleur(niveau.couleur, {
                        dataAttrs: {
                            'on-change': 'modifierNiveauEchelleHandler',
                            'echelle-id': echelle.id,
                            'niveau-index': index,
                            'champ': 'couleur'
                        }
                    })}
                </div>
            </div>
        </div>
    `).join('');

    // Ajouter un bouton pour ajouter un nouveau niveau
    const btnAjouterNiveau = `
        <button class="sidebar-btn-ajouter" data-action="ajouterNiveauEchelle" data-param="${echelle.id}">
            + Ajouter un niveau
        </button>
    `;

    container.innerHTML = html + btnAjouterNiveau;

    // Afficher l'aperçu visuel
    if (apercuContainer) {
        const apercuHtml = echelle.niveaux.map(niveau => `
            <div style="text-align: center; flex: 1; padding: 10px; background: ${niveau.couleur}20; border-radius: 4px; margin: 0 2px;">
                <strong style="font-size: 1.2rem; color: ${niveau.couleur};">${echapperHtml(niveau.code)}</strong>
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
    alert(`✅ Niveau ajouté avec succès !\n\nL'échelle contient maintenant ${echelleTemplateActuelle.niveaux.length} niveau(x).\nModifie les propriétés du niveau (code, nom, min, max, etc.) puis continue ton travail.`);
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
        id: genererIdUnique('ECH_'),
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
    // Récupérer les évaluations du trimestre actif
    let evaluations = await db.get(cle('evaluationsSauvegardees'));

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
    const evaluations = await db.get(cle('evaluationsSauvegardees')) || [];
    let nbMigrees = 0;

    evaluations.forEach(ev => {
        if (ev.echelleId === ancienneEchelleId) {
            ev.echelleId = nouvelleEchelleId;
            nbMigrees++;
        }
    });

    await db.set(cle('evaluationsSauvegardees'), evaluations);
    return nbMigrees;
}

async function supprimerEchelleDepuisSidebar(id) {
    // Marquer comme supprimée si c'est un gabarit hardcodé
    // (placé avant la logique pour couvrir tous les chemins de suppression)
    const _marquerSiGabarit = () => {
        if (window.IDS_GABARITS_HARDCODES && window.IDS_GABARITS_HARDCODES.includes(id)) {
            window.marquerRessourceSupprimee(id);
        }
    };

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
            message += `Veux-tu migrer les évaluations vers une autre échelle ?`;

            const choixMigration = confirm(message);

            if (choixMigration) {
                // Afficher un sélecteur d'échelle de remplacement
                let listeEchelles = 'Sélectionne l\'échelle de remplacement :\n\n';
                autresEchelles.forEach((e, idx) => {
                    listeEchelles += `${idx + 1}. ${e.nom} (${e.niveaux?.length || 0} niveaux)\n`;
                });

                const choixNumero = prompt(listeEchelles + '\nEntre le numéro de l\'échelle :');
                const numeroChoisi = parseInt(choixNumero);

                if (numeroChoisi && numeroChoisi >= 1 && numeroChoisi <= autresEchelles.length) {
                    const nouvelleEchelle = autresEchelles[numeroChoisi - 1];
                    const nbMigrees = await migrerEvaluationsVersNouvelleEchelle(id, nouvelleEchelle.id);

                    // Maintenant supprimer l'échelle
                    const index = echelles.findIndex(e => e.id === id);
                    if (index !== -1) {
                        _marquerSiGabarit();
                        echelles.splice(index, 1);
                        await db.set('echellesTemplates',  echelles);
                        await afficherListeEchelles();
                        document.getElementById('conteneurEditionEchelle').classList.add('u-hide');
                        // Note: Section optionsImportExportEchelles supprimée (Beta 92)
                        document.getElementById('accueilEchelles').classList.remove('u-hide');
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
            message += 'Tu dois d\'abord créer une nouvelle échelle ou supprimer les évaluations existantes.';
            alert(message);
        }
    } else {
        // L'échelle n'est pas utilisée, suppression directe
        if (!confirm('Supprimer cette échelle ?')) return;

        const echelles = await db.get('echellesTemplates') ||  [];
        const index = echelles.findIndex(e => e.id === id);

        if (index !== -1) {
            _marquerSiGabarit();
            echelles.splice(index, 1);
            await db.set('echellesTemplates',  echelles);
            await afficherListeEchelles();
            document.getElementById('conteneurEditionEchelle').classList.add('u-hide');
            // Note: Section optionsImportExportEchelles supprimée (Beta 92)
            document.getElementById('accueilEchelles').classList.remove('u-hide');
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
    let nom = document.getElementById('nomEchelleTemplate').value.trim();

    // Vérifier le nom
    if (!nom) {
        alert('Veuillez entrer un nom pour l\'échelle');
        return;
    }

    // ✅ AJOUT (6 jan 2026) : Vérification des doublons
    let echelles = await db.get('echellesTemplates') || [];
    const idActuel = echelleTemplateActuelle?.id || null;
    const isCreation = !echelleTemplateActuelle;
    const isNameChange = echelleTemplateActuelle && echelleTemplateActuelle.nom !== nom;

    if ((isCreation || isNameChange) && typeof verifierEtGererDoublon === 'function') {
        const resultat = await verifierEtGererDoublon('echelle', nom, echelles, idActuel);

        if (resultat === null) {
            // Utilisateur a annulé
            return;
        }

        if (resultat && resultat.action === 'renommer') {
            nom = resultat.nouveauNom;
            document.getElementById('nomEchelleTemplate').value = nom;
        }

        if (resultat && resultat.action === 'ecraser') {
            // Supprimer l'échelle existante avec le même nom
            echelles = echelles.filter(e => e.nom !== nom);
            await db.set('echellesTemplates', echelles);
        }
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

        // 🆕 Beta 95.3 : Capturer discipline depuis infoCours
        const infoCours = typeof db !== 'undefined' && db.getSync ? db.getSync('infoCours', {}) : {};
        const discipline = infoCours?.discipline || '';

        // Auteur CC = identité de l'utilisateur (Plan 1 §4.4)
        const identiteUtilisateur = obtenirIdentiteCCUtilisateur();

        // Créer la nouvelle échelle
        const nouvelleEchelle = {
            id: genererIdUnique('ECH_'),
            nom: nom,
            niveaux: niveaux,
            description: document.getElementById('descriptionEchelle')?.value?.trim() || '',
            pratiquesCompatibles: pratiquesCompatibles,
            discipline: discipline, // 🆕 Beta 95.3
            dansBibliotheque: true,
            dateCreation: new Date().toISOString(),
            dateModification: new Date().toISOString(),
            metadata_cc: {
                auteur_original: identiteUtilisateur,
                date_creation: new Date().toISOString().split('T')[0],
                contributeurs: []
            }
        };

        // Sauvegarder dans la base (utilise echelles déjà chargé)
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

    // 🆕 BETA 95.1 : Réouvrir l'échelle en mode édition pour qu'elle reste visible
    const idSauvegarde = echelleTemplateActuelle?.id;
    if (idSauvegarde && typeof chargerEchellePourModif === 'function') {
        setTimeout(() => {
            chargerEchellePourModif(idSauvegarde);
        }, 100);
    }
}

/* ===============================
   WRAPPERS DELEGATION (Phase 5)
   =============================== */

/** Handler délégué pour modifierNiveau(index, champ, valeur) */
function modifierNiveauHandler(el) {
    var index = parseInt(el.dataset.niveauIndex);
    var champ = el.dataset.champ;
    var valeur = el.value;
    modifierNiveau(index, champ, valeur);
}

/** Handler délégué pour modifierNiveauTemp(index, champ, valeur) */
function modifierNiveauTempHandler(el) {
    var index = parseInt(el.dataset.niveauIndex);
    var champ = el.dataset.champ;
    var valeur = el.hasAttribute('data-parse-float') ? parseFloat(el.value) : el.value;
    modifierNiveauTemp(index, champ, valeur);
}

/** Handler délégué pour modifierNiveauEchelle(echelleId, index, champ, valeur) */
function modifierNiveauEchelleHandler(el) {
    var echelleId = el.dataset.echelleId;
    var index = parseInt(el.dataset.niveauIndex);
    var champ = el.dataset.champ;
    var valeur = el.hasAttribute('data-parse-float') ? parseFloat(el.value) : el.value;
    modifierNiveauEchelle(echelleId, index, champ, valeur);
}

/** Annuler import échelles (fermer modal + cleanup) */
function fermerModalImportEchelles() {
    // Cibler le wrapper d'import par sa classe dédiée (pas `.modal-js-overlay`,
    // qui matche aussi la bibliothèque ouverte en arrière-plan dont le parent
    // est `<body>` → `.remove()` effacerait toute l'application).
    var wrapper = document.querySelector('.modal-import-echelles');
    if (wrapper) wrapper.remove();
    delete window._echellesImportEnAttente;
}

/** Confirmer import + fermer modal */
function confirmerEtFermerImportEchelles() {
    window.confirmerImportEchelles(window._echellesImportEnAttente);
    fermerModalImportEchelles();
}

/** Ouvrir le file picker pour import échelles */
function ouvrirFilePickerImportEchelles() {
    var input = document.getElementById('fichier-import-echelles-modal');
    if (input) input.click();
}

// Export global
window.afficherListeEchelles = afficherListeEchelles;
window.creerNouvelleEchelle = creerNouvelleEchelle;
window.annulerFormEchelle = annulerFormEchelle;
window.chargerEchellePourModif = chargerEchellePourModif;
window.dupliquerEtEditerEchelle = dupliquerEtEditerEchelle;
window.dupliquerEchelleDepuisSidebar = dupliquerEchelleDepuisSidebar;
window.supprimerEchelleDepuisSidebar = supprimerEchelleDepuisSidebar;
window.dupliquerEchelleActive = dupliquerEchelleActive;
window.supprimerEchelleActive = supprimerEchelleActive;
window.sauvegarderEchelleComplete = sauvegarderEchelleComplete;
window.genererNiveauxPersonnalises = genererNiveauxPersonnalises;
window.sauvegarderNiveaux = sauvegarderNiveaux;
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
window.fermerModalBibliothequeEchelles = fermerModalBibliothequeEchelles;
window.ajouterEchelleIndividuelle = ajouterEchelleIndividuelle;
window.dupliquerEchelleBibliotheque = dupliquerEchelleBibliotheque;
window.supprimerEchelleDefinitivement = supprimerEchelleDefinitivement;
window.supprimerEchelleDeBibliothequePartagee = supprimerEchelleDeBibliothequePartagee;
window.ajouterMesEchellesALaBibliotheque = ajouterMesEchellesALaBibliotheque;

// 🆕 Beta 95.3 : Exports fonctions import depuis trimestre
window.afficherEchellesTrimestreModal = afficherEchellesTrimestreModal;
window.importerToutEchellesTrimestreModal = importerToutEchellesTrimestreModal;
window.importerUneEchelleTrimestre = importerUneEchelleTrimestre;

// Phase 5 : Exports wrappers délégation
window.modifierNiveauHandler = modifierNiveauHandler;
window.modifierNiveauTempHandler = modifierNiveauTempHandler;
window.modifierNiveauEchelleHandler = modifierNiveauEchelleHandler;
window.fermerModalImportEchelles = fermerModalImportEchelles;
window.confirmerEtFermerImportEchelles = confirmerEtFermerImportEchelles;
window.ouvrirFilePickerImportEchelles = ouvrirFilePickerImportEchelles;

// ================================================================
// API SSOT — Point d'écriture centralisé pour `echellesTemplates`
// Tier 6.4 : Les modules externes doivent passer par cette fonction.
// ================================================================

/**
 * Importe des échelles depuis une source externe.
 *
 * @param {Array} nouvellesEchelles - Échelles à importer
 * @param {Object} [options] - Options d'import
 * @param {boolean} [options.remplacer=false] - Remplacer si même ID
 * @param {boolean} [options.silencieux=false] - Ne pas rafraîchir l'UI
 * @returns {number} nombre d'échelles ajoutées/mises à jour
 */
window.importerEchellesExternes = function(nouvellesEchelles, options) {
    if (!nouvellesEchelles || nouvellesEchelles.length === 0) return 0;
    options = options || {};

    var echelles = db.getSync('echellesTemplates', []);
    var compteur = 0;

    for (var i = 0; i < nouvellesEchelles.length; i++) {
        var echelle = nouvellesEchelles[i];
        var index = echelles.findIndex(function(e) { return e.id === echelle.id; });

        if (index >= 0) {
            if (options.remplacer) {
                echelles[index] = echelle;
                compteur++;
            }
        } else {
            echelles.push(echelle);
            compteur++;
        }
    }

    if (compteur > 0) {
        db.setSync('echellesTemplates', echelles);

        if (!options.silencieux) {
            if (typeof chargerEchellesTemplates === 'function') chargerEchellesTemplates();
            if (typeof afficherToutesLesEchellesNiveaux === 'function') afficherToutesLesEchellesNiveaux();
            if (typeof afficherListeEchelles === 'function') afficherListeEchelles();
        }
    }

    return compteur;
};

})();
