/* ===============================
   MODULE : PRATIQUES DE NOTATION (Section Construction)
   (c) 2 janvier 2026 - Beta 95

   Interface sidebar + bibliothèque pour les pratiques de notation.
   Suit le même pattern que echelles.js (sidebar gauche, zone principale, modal bibliothèque)

   Dépendances:
   - pratiques-bibliotheque.js (gabarits et fonctions de bibliothèque)
   - pratique-notation-v2.js (fonctions de configuration détaillée)
   - db.js (stockage IndexedDB/localStorage)
   =============================== */

/**
 * Clé de stockage pour les configurations de pratiques de l'utilisateur
 * IMPORTANT: Doit être identique à celle utilisée dans pratiques.js
 * NON namespacée = partagée entre trimestres (comme echellesTemplates)
 */
const CLE_PRATIQUES_CONFIGURATIONS = 'pratiquesConfigurables';

/**
 * ID de la pratique actuellement en édition
 */
let pratiqueEnEditionMateriel = null;

/* ===============================
   INITIALISATION DU MODULE
   =============================== */

/**
 * Point d'entrée appelé par navigation.js quand on navigue vers construction-pratiques-notation
 * Note: Renommé en "Materiel" pour éviter conflit avec pratiques.js
 */
function initialiserModulePratiquesMateriel() {
    console.log('[pratiques-materiel] Initialisation du module Pratiques (Construction)');

    // Afficher la sidebar avec la liste des pratiques
    afficherListePratiquesMateriel();

    // Cacher le formulaire d'édition et montrer l'accueil
    const conteneurEdition = document.getElementById('conteneurEditionPratique');
    const accueil = document.getElementById('accueilPratiques');

    if (conteneurEdition) conteneurEdition.style.display = 'none';
    if (accueil) accueil.style.display = 'block';

    console.log('   ✅ Module Pratiques initialisé');
}

/* ===============================
   GESTION DE LA SIDEBAR
   =============================== */

/**
 * Affiche la liste des pratiques dans la sidebar
 * Note: Le bouton "Consulter la bibliothèque" est maintenant dans le HTML statique
 * Renommé avec suffixe "Materiel" pour éviter conflit avec pratiques.js
 */
function afficherListePratiquesMateriel() {
    console.log('[pratiques-materiel] afficherListePratiquesMateriel() appelé');

    const container = document.getElementById('sidebarListePratiques');
    if (!container) {
        console.warn('[pratiques-materiel] ⚠️ Élément sidebarListePratiques introuvable');
        return;
    }
    console.log('[pratiques-materiel] Container trouvé:', container);

    // Charger les configurations de l'utilisateur (utiliser getSync comme pratiques.js)
    const configurations = db.getSync(CLE_PRATIQUES_CONFIGURATIONS, []);
    console.log('[pratiques-materiel] Configurations chargées (getSync):', configurations.length, configurations);

    // Filtrer les pratiques dans la bibliothèque (affichées dans la sidebar)
    const pratiquesDansBibliotheque = configurations.filter(p => p.dansBibliotheque !== false);

    console.log('[pratiques-materiel] Pratiques filtrées (dansBibliotheque):', pratiquesDansBibliotheque.length, pratiquesDansBibliotheque);

    // Si aucune pratique, afficher message
    if (pratiquesDansBibliotheque.length === 0) {
        container.innerHTML = '<p class="sidebar-vide">Créez une nouvelle pratique ou puisez dans la bibliothèque</p>';
        return;
    }

    // Générer les items de la sidebar
    const html = pratiquesDansBibliotheque.map(pratique => {
        const nomPratique = pratique.nom || 'Sans titre';
        const badge = genererBadgeTypePratique(pratique);
        return `
            <div class="sidebar-item" data-id="${pratique.id}" onclick="chargerPratiquePourModif('${pratique.id}')">
                <div class="sidebar-item-titre">${badge} ${nomPratique}</div>
                <div class="sidebar-item-badge">${pratique.type || 'Non défini'}</div>
            </div>
        `;
    }).join('');

    container.innerHTML = html;
}

/**
 * Génère un badge coloré selon le type de pratique (SOM, STD, SPE, DEN)
 */
function genererBadgeTypePratique(pratique) {
    if (!pratique || !pratique.pratiques) return '';

    const type = pratique.pratiques[0]; // Prendre le premier type
    const couleurs = {
        'SOM': 'background: #9b59b6; color: white;',
        'STD': 'background: #3498db; color: white;',
        'SPE': 'background: #27ae60; color: white;',
        'DEN': 'background: #e67e22; color: white;'
    };

    if (!type || !couleurs[type]) return '';

    return `<span style="${couleurs[type]} padding: 2px 6px; border-radius: 3px; font-size: 0.75em; font-weight: bold;">${type}</span>`;
}

/* ===============================
   MODAL BIBLIOTHÈQUE
   =============================== */

/**
 * Affiche le modal de gestion de la bibliothèque de pratiques
 * Section 1: Pratiques dans la sélection (avec boutons Partager/Retirer)
 * Section 2: Pratiques disponibles avec filtres
 */
async function afficherBibliothequePratiques() {
    // Charger les configurations de l'utilisateur
    let configurations = [];
    try {
        configurations = await db.get(CLE_PRATIQUES_CONFIGURATIONS) || [];
    } catch (e) {
        configurations = [];
    }

    const pratiquesDansBibliotheque = configurations.filter(p => p.dansBibliotheque !== false);

    // Charger toutes les pratiques disponibles (gabarits + bibliothèque)
    let pratiquesDisponibles = [];
    if (typeof obtenirToutesLesPratiquesBibliotheque === 'function') {
        pratiquesDisponibles = await obtenirToutesLesPratiquesBibliotheque();
    }

    // Obtenir les disciplines disponibles
    let disciplines = [];
    if (typeof obtenirDisciplinesDisponiblesPratiques === 'function') {
        disciplines = await obtenirDisciplinesDisponiblesPratiques();
    }

    // Construire le HTML du modal
    let html = `
        <div id="modalBibliothequePratiques" style="
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
                <button onclick="fermerModalBibliothequePratiques()" style="
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
                <h2 style="margin-top: 0; color: #2c3e50;">Bibliothèque de pratiques de notation</h2>
                <p style="color: #7f8c8d; margin-bottom: 20px;">
                    Gérez les pratiques affichées dans la barre latérale.
                </p>

                <!-- Section 1 : Pratiques dans votre sélection -->
                <h3 style="color: var(--bleu-clair); font-size: 1.1rem; margin-top: 20px; margin-bottom: 15px;">
                    Pratiques dans la barre latérale
                </h3>
                <div style="margin-bottom: 30px;">
                    <div id="listePratiquesDansBibliotheque">
    `;

    if (pratiquesDansBibliotheque.length === 0) {
        html += '<p style="color: #999; font-style: italic;">Aucune pratique dans la barre latérale</p>';
    } else {
        pratiquesDansBibliotheque.forEach(pratique => {
            const badge = genererBadgeTypePratique(pratique);
            const nomPratique = pratique.nom || 'Sans titre';
            const discipline = pratique.discipline || '';

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
                                ${badge}
                                ${nomPratique}
                            </div>
                            <div style="color: #7f8c8d; font-size: 0.9em;">
                                ${pratique.description || ''}${discipline ? ' • ' + discipline : ''}
                            </div>
                        </div>
                        <div style="display: flex; gap: 8px; margin-left: 10px;">
                            <button
                                onclick="partagerPratiqueMateriel('${pratique.id}')"
                                class="btn btn-secondaire btn-tres-compact"
                                title="Partager avec la communauté">
                                Partager
                            </button>
                            <button
                                onclick="retirerPratiqueDeBibliothequeMateriel('${pratique.id}')"
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

                    <!-- Bouton "Partager toutes mes pratiques" après la Section 1 -->
                    <div style="margin-top: 15px; text-align: center;">
                        <button onclick="exporterPratiquesUtilisateur()" class="btn btn-secondaire">
                            Partager toutes mes pratiques
                        </button>
                    </div>
                </div>

                <!-- Section 2 : Pratiques disponibles -->
                <h3 style="color: #3498db; font-size: 1.1rem; margin-top: 20px; margin-bottom: 15px;">
                    Pratiques disponibles à ajouter
                </h3>

                <!-- Filtres -->
                <div style="display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 15px;">
                    <!-- Filtre par type -->
                    <div style="flex: 1; min-width: 200px;">
                        <label style="display: block; margin-bottom: 5px; color: #555; font-weight: 500;">
                            Filtrer par type :
                        </label>
                        <select id="filtreTypePratiques"
                                class="controle-form"
                                onchange="filtrerPratiquesBibliotheque()"
                                style="max-width: 300px;">
                            <option value="">Tous les types</option>
                            <option value="pan-standards">PAN-Standards (STD)</option>
                            <option value="pan-specifications">PAN-Spécifications (SPE)</option>
                            <option value="sommative">Sommative (SOM)</option>
                            <option value="denombrement">Dénombrement (DEN)</option>
                        </select>
                    </div>

                    <!-- Filtre par discipline -->
                    <div style="flex: 1; min-width: 200px;">
                        <label style="display: block; margin-bottom: 5px; color: #555; font-weight: 500;">
                            Filtrer par discipline :
                        </label>
                        <select id="filtreDisciplinePratiques"
                                class="controle-form"
                                onchange="filtrerPratiquesBibliotheque()"
                                style="max-width: 300px;">
                            <option value="">Toutes les disciplines</option>
    `;

    disciplines.forEach(discipline => {
        html += `<option value="${discipline}">${discipline}</option>`;
    });

    html += `
                        </select>
                    </div>
                </div>

                <!-- Liste des pratiques disponibles -->
                <div id="listePratiquesDisponibles">
    `;

    // Filtrer pour ne pas afficher celles déjà dans la sélection
    const idsDejaPresents = new Set(pratiquesDansBibliotheque.map(p => p.id));
    const pratiquesAAfficher = pratiquesDisponibles.filter(p => !idsDejaPresents.has(p.id));

    if (pratiquesAAfficher.length === 0) {
        html += '<p style="color: #999; font-style: italic;">Toutes les pratiques sont déjà dans votre sélection</p>';
    } else {
        pratiquesAAfficher.forEach(pratique => {
            const badge = genererBadgeTypePratique(pratique);
            const nomPratique = pratique.nom || 'Sans titre';
            const estGabarit = pratique.estGabarit;
            const discipline = pratique.discipline || '';

            html += `
                <div class="pratique-dispo-item"
                     data-type="${pratique.type || ''}"
                     data-discipline="${discipline}"
                     style="
                        border: 1px solid #ddd;
                        border-radius: 6px;
                        padding: 15px;
                        margin-bottom: 10px;
                        background: ${estGabarit ? '#f8f9fa' : 'white'};
                     ">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div style="flex: 1;">
                            <div style="font-weight: bold; color: #2c3e50; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
                                ${badge}
                                ${nomPratique}
                                ${estGabarit ? '<span style="background: #f39c12; color: white; padding: 2px 6px; border-radius: 3px; font-size: 0.7em;">Gabarit</span>' : ''}
                            </div>
                            <div style="color: #7f8c8d; font-size: 0.9em;">
                                ${pratique.description || ''}${discipline ? ' • ' + discipline : ''}
                                ${pratique.auteur ? ' • Par ' + pratique.auteur : ''}
                            </div>
                        </div>
                        <button
                            onclick="ajouterPratiqueALaSelection('${pratique.id}')"
                            class="btn btn-principal btn-tres-compact"
                            title="Ajouter à votre sélection">
                            Ajouter
                        </button>
                    </div>
                </div>
            `;
        });
    }

    html += `
                </div>
            </div>
        </div>
    `;

    // Injecter le modal dans le DOM
    const modalContainer = document.createElement('div');
    modalContainer.id = 'modalContainerPratiques';
    modalContainer.innerHTML = html;
    document.body.appendChild(modalContainer);
}

/**
 * Ferme le modal de bibliothèque
 */
function fermerModalBibliothequePratiques() {
    const modal = document.getElementById('modalContainerPratiques');
    if (modal) {
        modal.remove();
    }
}

/**
 * Filtre les pratiques disponibles selon les critères sélectionnés
 */
function filtrerPratiquesBibliotheque() {
    const typeFiltre = document.getElementById('filtreTypePratiques')?.value || '';
    const disciplineFiltre = document.getElementById('filtreDisciplinePratiques')?.value || '';

    const items = document.querySelectorAll('.pratique-dispo-item');

    items.forEach(item => {
        const itemType = item.dataset.type || '';
        const itemDiscipline = item.dataset.discipline || '';

        const matchType = !typeFiltre || itemType === typeFiltre;
        const matchDiscipline = !disciplineFiltre || itemDiscipline.toLowerCase() === disciplineFiltre.toLowerCase();

        item.style.display = (matchType && matchDiscipline) ? 'block' : 'none';
    });
}

/* ===============================
   GESTION DES PRATIQUES (AJOUT/RETRAIT)
   =============================== */

/**
 * Ajoute une pratique de la bibliothèque à la sélection de l'utilisateur
 */
async function ajouterPratiqueALaSelection(pratiqueId) {
    console.log('[pratiques-materiel] Ajout de la pratique:', pratiqueId);

    // Obtenir la configuration depuis la bibliothèque
    let configSource = null;
    if (typeof obtenirConfigurationPratiqueParId === 'function') {
        configSource = await obtenirConfigurationPratiqueParId(pratiqueId);
    }

    if (!configSource) {
        console.error('[pratiques-materiel] Configuration introuvable:', pratiqueId);
        return;
    }

    // Charger les configurations existantes (utiliser getSync pour cohérence)
    const configurations = db.getSync(CLE_PRATIQUES_CONFIGURATIONS, []);

    // Vérifier si déjà présente
    const existante = configurations.find(p => p.id === pratiqueId);

    if (existante) {
        // La pratique existe - vérifier si elle est dans la sélection
        if (existante.dansBibliotheque !== false) {
            alert('Cette pratique est déjà dans votre sélection.');
            return;
        }

        // La pratique existe mais a été retirée - la réactiver
        existante.dansBibliotheque = true;
        existante.dateAjout = new Date().toISOString();
        db.setSync(CLE_PRATIQUES_CONFIGURATIONS, configurations);
        console.log('[pratiques-materiel] Pratique réactivée:', configSource.nom);
    } else {
        // Ajouter avec le flag dansBibliotheque
        const nouvelleConfig = {
            ...configSource,
            dansBibliotheque: true,
            dateAjout: new Date().toISOString()
        };

        configurations.push(nouvelleConfig);
        db.setSync(CLE_PRATIQUES_CONFIGURATIONS, configurations);
        console.log('[pratiques-materiel] Pratique ajoutée:', configSource.nom);
    }

    // Rafraîchir la sidebar et fermer le modal
    afficherListePratiquesMateriel();
    fermerModalBibliothequePratiques();

    if (typeof afficherNotificationSucces === 'function') {
        afficherNotificationSucces(`Pratique "${configSource.nom}" ajoutée`);
    }
}

/**
 * Retire une pratique de la sélection (mais pas de la bibliothèque globale)
 */
async function retirerPratiqueDeLaSelection(pratiqueId) {
    console.log('[pratiques-materiel] Retrait de la pratique:', pratiqueId);

    // Utiliser getSync/setSync pour cohérence avec afficherListePratiquesMateriel
    const configurations = db.getSync(CLE_PRATIQUES_CONFIGURATIONS, []);

    // Marquer comme retirée (au lieu de supprimer complètement)
    const index = configurations.findIndex(p => p.id === pratiqueId);
    if (index !== -1) {
        configurations[index].dansBibliotheque = false;
        db.setSync(CLE_PRATIQUES_CONFIGURATIONS, configurations);

        // Rafraîchir la sidebar AVANT de réouvrir le modal
        afficherListePratiquesMateriel();

        // Rafraîchir le modal
        fermerModalBibliothequePratiques();
        await afficherBibliothequePratiques();

        if (typeof afficherNotificationSucces === 'function') {
            afficherNotificationSucces('Pratique retirée de la sélection');
        }
    }
}

// Alias pour compatibilité - renommé avec suffixe Materiel
async function retirerPratiqueDeBibliothequeMateriel(pratiqueId) {
    await retirerPratiqueDeLaSelection(pratiqueId);
}

/* ===============================
   ÉDITION DES PRATIQUES
   =============================== */

/**
 * Charge une pratique pour modification dans la zone principale
 * Utilise le formulaire HTML statique (IDs préfixés mat-)
 */
async function chargerPratiquePourModif(pratiqueId) {
    console.log('[pratiques-materiel] Chargement de la pratique:', pratiqueId);

    pratiqueEnEditionMateriel = pratiqueId;

    // Charger la configuration
    let pratique = null;

    // D'abord chercher dans les configurations utilisateur
    let configurations = [];
    try {
        configurations = await db.get(CLE_PRATIQUES_CONFIGURATIONS) || [];
    } catch (e) {
        configurations = [];
    }

    pratique = configurations.find(p => p.id === pratiqueId);

    // Si pas trouvée, chercher dans la bibliothèque globale
    if (!pratique && typeof obtenirConfigurationPratiqueParId === 'function') {
        pratique = await obtenirConfigurationPratiqueParId(pratiqueId);
    }

    if (!pratique) {
        console.error('[pratiques-materiel] Pratique introuvable:', pratiqueId);
        return;
    }

    // Afficher le formulaire d'édition
    const conteneurEdition = document.getElementById('conteneurEditionPratique');
    const accueil = document.getElementById('accueilPratiques');

    if (accueil) accueil.style.display = 'none';
    if (conteneurEdition) conteneurEdition.style.display = 'block';

    // Remplir les champs du formulaire
    remplirFormulairePratique(pratique);

    // Charger le dropdown des échelles
    await chargerDropdownEchellesMat();

    // Marquer l'item actif dans la sidebar
    document.querySelectorAll('#sidebarListePratiques .sidebar-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.id === pratiqueId) {
            item.classList.add('active');
        }
    });
}

/**
 * Remplit tous les champs du formulaire avec les données de la pratique
 */
function remplirFormulairePratique(pratique) {
    // En-tête
    const titrePratique = document.getElementById('mat-titre-pratique');
    const badgePratique = document.getElementById('mat-badge-pratique');
    const typeLabel = document.getElementById('mat-type-label');

    if (titrePratique) titrePratique.textContent = pratique.nom || 'Sans titre';
    if (badgePratique) badgePratique.innerHTML = genererBadgeTypePratique(pratique);
    if (typeLabel) typeLabel.textContent = getTypePratiqueLabel(pratique.type);

    // Informations de base
    setValeurChamp('mat-pratique-nom', pratique.nom || '');
    setValeurChamp('mat-pratique-type', pratique.type || '');
    setValeurChamp('mat-pratique-description', pratique.description || '');
    setValeurChamp('mat-pratique-discipline', pratique.discipline || '');

    // Afficher la description taxonomique selon le type
    afficherDescriptionTaxonomiqueMat(pratique.type);

    // Afficher les sections de configuration selon le type
    afficherConfigurationTypeMat(pratique.type);

    // Remplir les champs selon le type
    if (pratique.type === 'pan-standards') {
        const config = pratique.configuration || {};

        // Variante de calcul
        setValeurChamp('mat-variante-calcul', config.varianteCalcul || '');
        changerVariantePANStandardsMat();

        // Portfolio
        if (config.portfolio) {
            setValeurChamp('mat-portfolio-selection', config.portfolio.methodeSelection || 'meilleurs');
            setValeurChamp('mat-portfolio-nombre', config.portfolio.nombreARetenir || 5);
            setValeurChamp('mat-portfolio-minimum', config.portfolio.minimumCompletion || 7);
            setValeurChamp('mat-portfolio-total', config.portfolio.nombreTotal || 10);
            setCheckbox('mat-decoupler-pr', config.portfolio.decouplerPR || false);
        }

    } else if (pratique.type === 'pan-specifications') {
        const config = pratique.configuration || {};

        // Seuil
        setValeurChamp('mat-spec-seuil', config.seuilAcceptable || 75);

        // Types de travaux
        afficherTypesTravauxMat(config.typesTravaux || []);

        // Forfaits
        afficherForfaitsMat(config.forfaits || [], config.typesTravaux || []);
    }

    // Échelle de performance
    if (pratique.configuration?.echelleId) {
        setValeurChamp('mat-echelle-id', pratique.configuration.echelleId);
        afficherPreviewEchelleMat();
    }

    // Système de jetons
    const jetons = pratique.jetons || {};
    setCheckbox('mat-jetons-actif', jetons.actif || false);
    toggleSystemeJetonsMat(); // Afficher/masquer le contenu
    setValeurChamp('mat-jetons-nombre', jetons.nombre || 4);
    setCheckbox('mat-jeton-delai-actif', jetons.delaiActif !== false);
    setValeurChamp('mat-delai-duree', jetons.delaiDuree || 7);
    setCheckbox('mat-jeton-reprise-actif', jetons.repriseActif !== false);
    // Radio pour l'évaluation originale
    const radioArchiver = document.querySelector('input[name="mat-reprise-originale"][value="archiver"]');
    const radioSupprimer = document.querySelector('input[name="mat-reprise-originale"][value="supprimer"]');
    if (jetons.repriseOriginale === 'supprimer' && radioSupprimer) {
        radioSupprimer.checked = true;
    } else if (radioArchiver) {
        radioArchiver.checked = true;
    }
    setCheckbox('mat-jeton-ciblee-actif', jetons.cibleeActif !== false);
    setValeurChamp('mat-ciblee-plafond', jetons.cibleePlafond || 'D (Développement)');
}

/**
 * Utilitaires pour manipuler les champs
 */
function setValeurChamp(id, valeur) {
    const el = document.getElementById(id);
    if (el) el.value = valeur;
}

function setCheckbox(id, valeur) {
    const el = document.getElementById(id);
    if (el) el.checked = valeur;
}

function getValeurChamp(id) {
    const el = document.getElementById(id);
    return el ? el.value : '';
}

function getCheckbox(id) {
    const el = document.getElementById(id);
    return el ? el.checked : false;
}

/**
 * Affiche la description taxonomique selon le type de pratique
 */
function afficherDescriptionTaxonomiqueMat(type) {
    const conteneur = document.getElementById('mat-description-taxonomique');
    const titre = document.getElementById('mat-taxonomie-titre');
    const definition = document.getElementById('mat-taxonomie-definition');

    if (!conteneur || !titre || !definition) return;

    const descriptions = {
        'sommative': {
            titre: 'SOMMATIVE (Traditional Grading)',
            definition: 'Pratique traditionnelle où chaque évaluation a une pondération fixe. La note finale est calculée comme une moyenne pondérée.'
        },
        'pan-standards': {
            titre: 'PAN-STANDARDS (Standards-Based Grading)',
            definition: 'Pratique où les étudiants démontrent leur maîtrise de standards ou objectifs. Le meilleur résultat obtenu pour chaque standard est retenu.'
        },
        'pan-specifications': {
            titre: 'PAN-SPÉCIFICATIONS (Specifications Grading)',
            definition: 'Pratique où les productions sont évaluées de façon dichotomique (conforme/non-conforme selon des spécifications préétablies), et la note finale est déterminée par le forfait (ensemble de travaux conformes) complété.'
        }
    };

    if (descriptions[type]) {
        titre.textContent = descriptions[type].titre;
        definition.textContent = descriptions[type].definition;
        conteneur.style.display = 'block';
    } else {
        conteneur.style.display = 'none';
    }
}

/**
 * Affiche les sections de configuration selon le type
 */
function afficherConfigurationTypeMat(type) {
    // Cacher toutes les sections
    const sections = ['mat-config-pan-standards', 'mat-config-sommative', 'mat-config-pan-specifications', 'mat-config-defaut'];
    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });

    // Variante PAN-Standards
    const variantePAN = document.getElementById('mat-variante-pan-standards');
    if (variantePAN) variantePAN.style.display = type === 'pan-standards' ? 'block' : 'none';

    // Afficher la section appropriée
    if (type === 'pan-standards') {
        const el = document.getElementById('mat-config-pan-standards');
        if (el) el.style.display = 'block';
    } else if (type === 'sommative') {
        const el = document.getElementById('mat-config-sommative');
        if (el) el.style.display = 'block';
    } else if (type === 'pan-specifications') {
        const el = document.getElementById('mat-config-pan-specifications');
        if (el) el.style.display = 'block';
    } else {
        const el = document.getElementById('mat-config-defaut');
        if (el) el.style.display = 'block';
    }
}

/**
 * Retourne le libellé du type de pratique
 */
function getTypePratiqueLabel(type) {
    const labels = {
        'pan-standards': 'PAN-Standards (STD)',
        'pan-specifications': 'PAN-Spécifications (SPE)',
        'sommative': 'Sommative (SOM)',
        'denombrement': 'Dénombrement (DEN)'
    };
    return labels[type] || type || 'Type non défini';
}

/* ===============================
   HANDLERS DU FORMULAIRE (préfixe mat-)
   =============================== */

/**
 * Handler : Changement du type de pratique
 */
function changerTypePratiqueMat() {
    const type = getValeurChamp('mat-pratique-type');
    afficherDescriptionTaxonomiqueMat(type);
    afficherConfigurationTypeMat(type);

    // Mettre à jour le badge
    const badge = document.getElementById('mat-badge-pratique');
    if (badge) {
        const pratiques = type === 'pan-standards' ? ['STD'] :
                         type === 'pan-specifications' ? ['SPE'] :
                         type === 'sommative' ? ['SOM'] : [];
        badge.innerHTML = genererBadgeTypePratique({ pratiques });
    }

    // Mettre à jour le label
    const typeLabel = document.getElementById('mat-type-label');
    if (typeLabel) typeLabel.textContent = getTypePratiqueLabel(type);

    sauvegarderConfigPratiqueMat();
}

/**
 * Handler : Changement de variante PAN-Standards
 * Bascule entre la configuration Portfolio et Par-Objectifs
 */
function changerVariantePANStandardsMat() {
    const variante = getValeurChamp('mat-variante-calcul');
    const descriptionDiv = document.getElementById('mat-variante-description');
    const configPortfolio = document.getElementById('mat-config-portfolio');
    const configParObjectifs = document.getElementById('mat-config-par-objectifs');

    const descriptions = {
        'n-meilleurs': 'Les N meilleures évaluations sont retenues pour calculer la note finale. Valorise le progrès.',
        'n-recents': 'Les N évaluations les plus récentes sont retenues. Valorise l\'état actuel de maîtrise.',
        'grille-profils': 'La note est déterminée selon une grille de profils (ex: 3M + 2M+ → 85%).',
        'par-objectifs': 'Calcul par objectifs avec 4 modes possibles (comptage, moyenne, seuils, holistique).',
        'autre': 'Méthode personnalisée à décrire dans la description.'
    };

    // Afficher la description de la variante
    if (descriptions[variante]) {
        descriptionDiv.textContent = descriptions[variante];
        descriptionDiv.style.display = 'block';
    } else {
        descriptionDiv.style.display = 'none';
    }

    // Basculer entre Portfolio et Par-Objectifs
    if (variante === 'par-objectifs') {
        if (configPortfolio) configPortfolio.style.display = 'none';
        if (configParObjectifs) {
            configParObjectifs.style.display = 'block';
            // Charger les données (changerModeCalculObjectifsMat est appelé à la fin)
            chargerConfigParObjectifsMat();
        }
    } else {
        if (configPortfolio) configPortfolio.style.display = 'block';
        if (configParObjectifs) configParObjectifs.style.display = 'none';
    }

    sauvegarderConfigPratiqueMat();
}

/**
 * Handler : Mise à jour du nom
 */
async function mettreAJourNomPratiqueMat() {
    const nouveauNom = getValeurChamp('mat-pratique-nom');
    if (!pratiqueEnEditionMateriel) return;

    let configurations = await db.get(CLE_PRATIQUES_CONFIGURATIONS) || [];
    const index = configurations.findIndex(p => p.id === pratiqueEnEditionMateriel);

    if (index !== -1) {
        configurations[index].nom = nouveauNom;
        await db.set(CLE_PRATIQUES_CONFIGURATIONS, configurations);

        // Mettre à jour le titre et la sidebar
        const titre = document.getElementById('mat-titre-pratique');
        if (titre) titre.textContent = nouveauNom;
        await afficherListePratiquesMateriel();
    }
}

/**
 * Handler : Mise à jour de la description
 */
async function mettreAJourDescriptionPratiqueMat() {
    if (!pratiqueEnEditionMateriel) return;

    let configurations = await db.get(CLE_PRATIQUES_CONFIGURATIONS) || [];
    const index = configurations.findIndex(p => p.id === pratiqueEnEditionMateriel);

    if (index !== -1) {
        configurations[index].description = getValeurChamp('mat-pratique-description');
        await db.set(CLE_PRATIQUES_CONFIGURATIONS, configurations);
    }
}

/**
 * Handler : Mise à jour de la discipline
 */
async function mettreAJourDisciplinePratiqueMat() {
    if (!pratiqueEnEditionMateriel) return;

    let configurations = await db.get(CLE_PRATIQUES_CONFIGURATIONS) || [];
    const index = configurations.findIndex(p => p.id === pratiqueEnEditionMateriel);

    if (index !== -1) {
        configurations[index].discipline = getValeurChamp('mat-pratique-discipline');
        await db.set(CLE_PRATIQUES_CONFIGURATIONS, configurations);
    }
}

/**
 * Sauvegarde la configuration complète de la pratique
 */
async function sauvegarderConfigPratiqueMat() {
    if (!pratiqueEnEditionMateriel) return;

    let configurations = await db.get(CLE_PRATIQUES_CONFIGURATIONS) || [];
    const index = configurations.findIndex(p => p.id === pratiqueEnEditionMateriel);

    if (index === -1) return;

    const type = getValeurChamp('mat-pratique-type');
    configurations[index].type = type;

    // Mettre à jour pratiques[]
    configurations[index].pratiques = type === 'pan-standards' ? ['STD'] :
                                      type === 'pan-specifications' ? ['SPE'] :
                                      type === 'sommative' ? ['SOM'] : [];

    // Initialiser la configuration si absente
    if (!configurations[index].configuration) {
        configurations[index].configuration = {};
    }

    // Sauvegarder selon le type
    if (type === 'pan-standards') {
        const varianteCalcul = getValeurChamp('mat-variante-calcul');
        configurations[index].configuration.varianteCalcul = varianteCalcul;

        // Configuration Portfolio (pour variantes: n-meilleurs, n-recents, grille-profils, autre)
        if (varianteCalcul !== 'par-objectifs') {
            configurations[index].configuration.portfolio = {
                methodeSelection: getValeurChamp('mat-portfolio-selection') || 'meilleurs',
                nombreARetenir: parseInt(getValeurChamp('mat-portfolio-nombre')) || 5,
                minimumCompletion: parseInt(getValeurChamp('mat-portfolio-minimum')) || 7,
                nombreTotal: parseInt(getValeurChamp('mat-portfolio-total')) || 10,
                decouplerPR: getCheckbox('mat-decoupler-pr')
            };
        }

        // Configuration Par-Objectifs (variante: par-objectifs)
        if (varianteCalcul === 'par-objectifs') {
            // Initialiser parObjectifs si absent
            if (!configurations[index].configuration.parObjectifs) {
                configurations[index].configuration.parObjectifs = { objectifs: [] };
            }

            const modeCalcul = getValeurChamp('mat-objectifs-mode-calcul') || 'comptage';
            configurations[index].configuration.parObjectifs.modeCalcul = modeCalcul;

            // Paramètres selon le mode
            if (modeCalcul === 'comptage') {
                configurations[index].configuration.parObjectifs.comptage = {
                    seuilMaitrise: parseInt(getValeurChamp('mat-comptage-seuil-maitrise')) || 75,
                    plafondEssentiel: parseInt(getValeurChamp('mat-comptage-plafond-essentiel')) || 55,
                    grilleConversion: configurations[index].configuration.parObjectifs.comptage?.grilleConversion || []
                };
            } else if (modeCalcul === 'seuils-critiques') {
                configurations[index].configuration.parObjectifs.seuilsCritiques = {
                    niveauReussite: parseInt(getValeurChamp('mat-seuils-niveau-reussite')) || 3,
                    noteBase: parseInt(getValeurChamp('mat-seuils-note-base')) || 80,
                    bonusNiveau4: parseFloat(getValeurChamp('mat-seuils-bonus-niveau4')) || 3.33
                };
            } else if (modeCalcul === 'holistique') {
                configurations[index].configuration.parObjectifs.holistique = {
                    methode: getValeurChamp('mat-holistique-methode') || 'mode'
                };
            }
            // moyenne-ponderee : les pondérations sont stockées dans les objectifs eux-mêmes
        }
    } else if (type === 'pan-specifications') {
        configurations[index].configuration.seuilAcceptable = parseInt(getValeurChamp('mat-spec-seuil')) || 75;
        // typesTravaux et forfaits sont gérés par leurs propres fonctions
    }

    // Échelle
    configurations[index].configuration.echelleId = getValeurChamp('mat-echelle-id');

    // Système de jetons
    const repriseOriginale = document.querySelector('input[name="mat-reprise-originale"]:checked');
    configurations[index].jetons = {
        actif: getCheckbox('mat-jetons-actif'),
        nombre: parseInt(getValeurChamp('mat-jetons-nombre')) || 4,
        delaiActif: getCheckbox('mat-jeton-delai-actif'),
        delaiDuree: parseInt(getValeurChamp('mat-delai-duree')) || 7,
        repriseActif: getCheckbox('mat-jeton-reprise-actif'),
        repriseOriginale: repriseOriginale ? repriseOriginale.value : 'archiver',
        cibleeActif: getCheckbox('mat-jeton-ciblee-actif'),
        cibleePlafond: getValeurChamp('mat-ciblee-plafond') || 'D (Développement)'
    };

    await db.set(CLE_PRATIQUES_CONFIGURATIONS, configurations);
    console.log('[pratiques-materiel] Configuration sauvegardée');
}

/**
 * Sauvegarde complète avec notification
 */
async function sauvegarderPratiqueMaterielComplet() {
    await sauvegarderConfigPratiqueMat();
    await mettreAJourNomPratiqueMat();
    await mettreAJourDescriptionPratiqueMat();
    await mettreAJourDisciplinePratiqueMat();

    if (typeof afficherNotificationSucces === 'function') {
        afficherNotificationSucces('Pratique enregistrée');
    }
}

/* ===============================
   ÉCHELLES DE PERFORMANCE
   =============================== */

/**
 * Charge le dropdown des échelles
 */
async function chargerDropdownEchellesMat() {
    const select = document.getElementById('mat-echelle-id');
    if (!select) return;

    let echelles = [];
    try {
        echelles = await db.get('echellesTemplates') || [];
    } catch (e) {
        echelles = [];
    }

    let html = '<option value="">-- Sélectionner une échelle --</option>';
    echelles.forEach(e => {
        html += `<option value="${e.id}">${e.nom || 'Sans nom'}</option>`;
    });

    select.innerHTML = html;
}

/**
 * Affiche l'aperçu de l'échelle sélectionnée
 */
async function afficherPreviewEchelleMat() {
    const echelleId = getValeurChamp('mat-echelle-id');
    const preview = document.getElementById('mat-preview-echelle');
    const contenu = document.getElementById('mat-preview-echelle-contenu');

    if (!preview || !contenu) return;

    if (!echelleId) {
        preview.style.display = 'none';
        return;
    }

    let echelles = [];
    try {
        echelles = await db.get('echellesTemplates') || [];
    } catch (e) {
        echelles = [];
    }

    const echelle = echelles.find(e => e.id === echelleId);
    if (!echelle || !echelle.niveaux) {
        preview.style.display = 'none';
        return;
    }

    let html = '';
    echelle.niveaux.forEach(n => {
        html += `<div style="margin-bottom: 4px;"><span style="font-weight: 600;">${n.code || n.nom}</span>: ${n.nom}</div>`;
    });

    contenu.innerHTML = html;
    preview.style.display = 'block';

    sauvegarderConfigPratiqueMat();
}

/* ===============================
   PAN-SPÉCIFICATIONS : Types de travaux
   =============================== */

/**
 * Affiche la liste des types de travaux
 */
function afficherTypesTravauxMat(typesTravaux) {
    const conteneur = document.getElementById('mat-spec-types-travaux-liste');
    if (!conteneur) return;

    if (!typesTravaux || typesTravaux.length === 0) {
        conteneur.innerHTML = '<p style="color: #999; font-style: italic;">Aucun type de production défini</p>';
        return;
    }

    let html = '<table class="table-bordures" style="width: 100%;">';
    html += '<thead><tr><th>Nom</th><th>Description</th><th style="width: 80px;">Actions</th></tr></thead>';
    html += '<tbody>';

    typesTravaux.forEach((t, index) => {
        html += `
            <tr>
                <td><input type="text" class="controle-form" value="${t.nom || ''}" onchange="modifierTypeTravailMat(${index}, 'nom', this.value)"></td>
                <td><input type="text" class="controle-form" value="${t.description || ''}" onchange="modifierTypeTravailMat(${index}, 'description', this.value)"></td>
                <td style="text-align: center;">
                    <button onclick="supprimerTypeTravailMat(${index})" class="btn btn-supprimer btn-tres-compact">×</button>
                </td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    conteneur.innerHTML = html;
}

async function ajouterTypeTravailMat() {
    if (!pratiqueEnEditionMateriel) return;

    let configurations = await db.get(CLE_PRATIQUES_CONFIGURATIONS) || [];
    const index = configurations.findIndex(p => p.id === pratiqueEnEditionMateriel);

    if (index === -1) return;

    if (!configurations[index].configuration) configurations[index].configuration = {};
    if (!configurations[index].configuration.typesTravaux) configurations[index].configuration.typesTravaux = [];

    const nouveauId = configurations[index].configuration.typesTravaux.length + 1;
    configurations[index].configuration.typesTravaux.push({
        id: nouveauId,
        nom: `Type ${nouveauId}`,
        description: ''
    });

    await db.set(CLE_PRATIQUES_CONFIGURATIONS, configurations);
    afficherTypesTravauxMat(configurations[index].configuration.typesTravaux);
}

async function modifierTypeTravailMat(indexType, propriete, valeur) {
    if (!pratiqueEnEditionMateriel) return;

    let configurations = await db.get(CLE_PRATIQUES_CONFIGURATIONS) || [];
    const index = configurations.findIndex(p => p.id === pratiqueEnEditionMateriel);

    if (index === -1 || !configurations[index].configuration?.typesTravaux) return;

    configurations[index].configuration.typesTravaux[indexType][propriete] = valeur;
    await db.set(CLE_PRATIQUES_CONFIGURATIONS, configurations);
}

async function supprimerTypeTravailMat(indexType) {
    if (!pratiqueEnEditionMateriel) return;

    let configurations = await db.get(CLE_PRATIQUES_CONFIGURATIONS) || [];
    const index = configurations.findIndex(p => p.id === pratiqueEnEditionMateriel);

    if (index === -1 || !configurations[index].configuration?.typesTravaux) return;

    configurations[index].configuration.typesTravaux.splice(indexType, 1);
    await db.set(CLE_PRATIQUES_CONFIGURATIONS, configurations);
    afficherTypesTravauxMat(configurations[index].configuration.typesTravaux);
}

/* ===============================
   PAN-SPÉCIFICATIONS : Forfaits
   =============================== */

/**
 * Affiche la table des forfaits
 */
function afficherForfaitsMat(forfaits, typesTravaux) {
    const conteneur = document.getElementById('mat-spec-forfaits-liste');
    if (!conteneur) return;

    if (!forfaits || forfaits.length === 0) {
        conteneur.innerHTML = '<p style="color: #999; font-style: italic;">Aucun forfait défini</p>';
        return;
    }

    let html = '<table class="table-bordures" style="width: 100%;">';
    html += '<thead><tr><th>Lettre</th><th>Note (%)</th>';

    typesTravaux.forEach(t => {
        html += `<th>${t.nom}</th>`;
    });

    html += '<th style="width: 80px;">Actions</th></tr></thead>';
    html += '<tbody>';

    forfaits.forEach((f, index) => {
        html += `<tr>
            <td><input type="text" class="controle-form" value="${f.lettre || ''}" style="width: 50px;" onchange="modifierForfaitMat(${index}, 'lettre', this.value)"></td>
            <td><input type="number" class="controle-form" value="${f.note || 0}" style="width: 60px;" onchange="modifierForfaitMat(${index}, 'note', this.value)"></td>`;

        typesTravaux.forEach(t => {
            const quantite = f.travaux?.[t.id] || 0;
            html += `<td><input type="number" class="controle-form" value="${quantite}" style="width: 50px;" min="0" onchange="modifierTravailForfaitMat(${index}, ${t.id}, this.value)"></td>`;
        });

        html += `<td style="text-align: center;"><button onclick="supprimerForfaitMat(${index})" class="btn btn-supprimer btn-tres-compact">×</button></td></tr>`;
    });

    html += '</tbody></table>';
    conteneur.innerHTML = html;
}

async function ajouterForfaitMat() {
    if (!pratiqueEnEditionMateriel) return;

    let configurations = await db.get(CLE_PRATIQUES_CONFIGURATIONS) || [];
    const index = configurations.findIndex(p => p.id === pratiqueEnEditionMateriel);

    if (index === -1) return;

    if (!configurations[index].configuration) configurations[index].configuration = {};
    if (!configurations[index].configuration.forfaits) configurations[index].configuration.forfaits = [];

    const nouveauId = configurations[index].configuration.forfaits.length + 1;
    configurations[index].configuration.forfaits.push({
        id: nouveauId,
        lettre: String.fromCharCode(64 + nouveauId),
        note: 100 - (nouveauId - 1) * 10,
        travaux: {}
    });

    await db.set(CLE_PRATIQUES_CONFIGURATIONS, configurations);
    afficherForfaitsMat(
        configurations[index].configuration.forfaits,
        configurations[index].configuration.typesTravaux || []
    );
}

async function modifierForfaitMat(indexForfait, propriete, valeur) {
    if (!pratiqueEnEditionMateriel) return;

    let configurations = await db.get(CLE_PRATIQUES_CONFIGURATIONS) || [];
    const index = configurations.findIndex(p => p.id === pratiqueEnEditionMateriel);

    if (index === -1 || !configurations[index].configuration?.forfaits) return;

    if (propriete === 'note') valeur = parseInt(valeur) || 0;
    configurations[index].configuration.forfaits[indexForfait][propriete] = valeur;
    await db.set(CLE_PRATIQUES_CONFIGURATIONS, configurations);
}

async function modifierTravailForfaitMat(indexForfait, typeTravailId, valeur) {
    if (!pratiqueEnEditionMateriel) return;

    let configurations = await db.get(CLE_PRATIQUES_CONFIGURATIONS) || [];
    const index = configurations.findIndex(p => p.id === pratiqueEnEditionMateriel);

    if (index === -1 || !configurations[index].configuration?.forfaits) return;

    if (!configurations[index].configuration.forfaits[indexForfait].travaux) {
        configurations[index].configuration.forfaits[indexForfait].travaux = {};
    }

    configurations[index].configuration.forfaits[indexForfait].travaux[typeTravailId] = parseInt(valeur) || 0;
    await db.set(CLE_PRATIQUES_CONFIGURATIONS, configurations);
}

async function supprimerForfaitMat(indexForfait) {
    if (!pratiqueEnEditionMateriel) return;

    let configurations = await db.get(CLE_PRATIQUES_CONFIGURATIONS) || [];
    const index = configurations.findIndex(p => p.id === pratiqueEnEditionMateriel);

    if (index === -1 || !configurations[index].configuration?.forfaits) return;

    configurations[index].configuration.forfaits.splice(indexForfait, 1);
    await db.set(CLE_PRATIQUES_CONFIGURATIONS, configurations);
    afficherForfaitsMat(
        configurations[index].configuration.forfaits,
        configurations[index].configuration.typesTravaux || []
    );
}

/* ===============================
   CRÉATION DE PRATIQUE
   =============================== */

/**
 * Crée une nouvelle pratique
 */
async function creerNouvellePratique() {
    console.log('[pratiques-materiel] Création d\'une nouvelle pratique');

    // Générer un ID unique
    const nouvelId = `pratique_${Date.now()}`;

    const nouvellePratique = {
        id: nouvelId,
        nom: 'Nouvelle pratique',
        description: '',
        type: 'pan-standards',
        pratiques: ['STD'],
        auteur: 'Utilisateur',
        discipline: '',
        dateCreation: new Date().toISOString(),
        dansBibliotheque: true,
        configuration: {
            varianteCalcul: 'n-meilleurs',
            portfolio: {
                methodeSelection: 'meilleurs',
                nombreARetenir: 5,
                minimumCompletion: 5,
                nombreTotal: 10,
                decouplerPR: false
            }
        }
    };

    // Sauvegarder
    let configurations = [];
    try {
        configurations = await db.get(CLE_PRATIQUES_CONFIGURATIONS) || [];
    } catch (e) {
        configurations = [];
    }

    configurations.push(nouvellePratique);
    await db.set(CLE_PRATIQUES_CONFIGURATIONS, configurations);

    // Rafraîchir la sidebar et charger la nouvelle pratique
    await afficherListePratiquesMateriel();
    await chargerPratiquePourModif(nouvelId);

    if (typeof afficherNotificationSucces === 'function') {
        afficherNotificationSucces('Nouvelle pratique créée');
    }
}

/* ===============================
   MISE À JOUR DES CHAMPS
   =============================== */

async function mettreAJourNomPratique(nouveauNom) {
    if (!pratiqueEnEditionMateriel) return;

    let configurations = await db.get(CLE_PRATIQUES_CONFIGURATIONS) || [];
    const index = configurations.findIndex(p => p.id === pratiqueEnEditionMateriel);

    if (index !== -1) {
        configurations[index].nom = nouveauNom;
        await db.set(CLE_PRATIQUES_CONFIGURATIONS, configurations);

        // Mettre à jour le titre dans l'interface
        const titre = document.getElementById('titreEditionPratique');
        if (titre) titre.textContent = nouveauNom;

        // Rafraîchir la sidebar
        await afficherListePratiquesMateriel();
    }
}

async function mettreAJourDescriptionPratique(nouvelleDescription) {
    if (!pratiqueEnEditionMateriel) return;

    let configurations = await db.get(CLE_PRATIQUES_CONFIGURATIONS) || [];
    const index = configurations.findIndex(p => p.id === pratiqueEnEditionMateriel);

    if (index !== -1) {
        configurations[index].description = nouvelleDescription;
        await db.set(CLE_PRATIQUES_CONFIGURATIONS, configurations);
    }
}

async function mettreAJourDisciplinePratique(nouvelleDiscipline) {
    if (!pratiqueEnEditionMateriel) return;

    let configurations = await db.get(CLE_PRATIQUES_CONFIGURATIONS) || [];
    const index = configurations.findIndex(p => p.id === pratiqueEnEditionMateriel);

    if (index !== -1) {
        configurations[index].discipline = nouvelleDiscipline;
        await db.set(CLE_PRATIQUES_CONFIGURATIONS, configurations);
    }
}

/* ===============================
   ACTIONS SUR LES PRATIQUES
   =============================== */

/**
 * Duplique une pratique existante
 */
async function dupliquerPratiqueMateriel(pratiqueId) {
    let configurations = await db.get(CLE_PRATIQUES_CONFIGURATIONS) || [];
    const original = configurations.find(p => p.id === pratiqueId);

    if (!original) {
        console.error('[pratiques-materiel] Pratique à dupliquer introuvable:', pratiqueId);
        return;
    }

    const copie = JSON.parse(JSON.stringify(original));
    copie.id = `pratique_${Date.now()}`;
    copie.nom = `${original.nom} (copie)`;
    copie.dateCreation = new Date().toISOString();

    configurations.push(copie);
    await db.set(CLE_PRATIQUES_CONFIGURATIONS, configurations);

    await afficherListePratiquesMateriel();
    await chargerPratiquePourModif(copie.id);

    if (typeof afficherNotificationSucces === 'function') {
        afficherNotificationSucces('Pratique dupliquée');
    }
}

/**
 * Supprime une pratique
 */
async function supprimerPratiqueMateriel(pratiqueId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette pratique ?')) {
        return;
    }

    let configurations = await db.get(CLE_PRATIQUES_CONFIGURATIONS) || [];
    configurations = configurations.filter(p => p.id !== pratiqueId);
    await db.set(CLE_PRATIQUES_CONFIGURATIONS, configurations);

    pratiqueEnEditionMateriel = null;

    // Rafraîchir et afficher l'accueil
    await afficherListePratiquesMateriel();

    const conteneurEdition = document.getElementById('conteneurEditionPratique');
    const accueil = document.getElementById('accueilPratiques');

    if (conteneurEdition) conteneurEdition.style.display = 'none';
    if (accueil) accueil.style.display = 'block';

    if (typeof afficherNotificationSucces === 'function') {
        afficherNotificationSucces('Pratique supprimée');
    }
}

/**
 * Applique une pratique au cours actif
 */
async function appliquerPratiqueAuCours(pratiqueId) {
    console.log('[pratiques-materiel] Application de la pratique au cours:', pratiqueId);

    if (typeof appliquerConfigurationPratique === 'function') {
        const succes = await appliquerConfigurationPratique(pratiqueId);
        if (succes) {
            if (typeof afficherNotificationSucces === 'function') {
                afficherNotificationSucces('Configuration appliquée au cours actif');
            }
        } else {
            alert('Erreur lors de l\'application de la configuration.');
        }
    } else {
        alert('Fonction d\'application non disponible.');
    }
}

/**
 * Sauvegarde les modifications de la pratique en cours
 */
async function sauvegarderPratiqueMateriel() {
    if (!pratiqueEnEditionMateriel) {
        console.warn('[pratiques-materiel] Aucune pratique en édition');
        return;
    }

    console.log('[pratiques-materiel] Sauvegarde de la pratique:', pratiqueEnEditionMateriel);

    // Les modifications sont déjà sauvegardées au fur et à mesure
    // Cette fonction sert de confirmation visuelle

    if (typeof afficherNotificationSucces === 'function') {
        afficherNotificationSucces('Pratique enregistrée');
    }
}

/**
 * Partage une pratique (export JSON)
 */
async function partagerPratiqueMateriel(pratiqueId) {
    let configurations = await db.get(CLE_PRATIQUES_CONFIGURATIONS) || [];
    const pratique = configurations.find(p => p.id === pratiqueId);

    if (!pratique) {
        console.error('[pratiques-materiel] Pratique à partager introuvable');
        return;
    }

    const exportData = {
        version: '1.0',
        type: 'configuration-pratique',
        dateExport: new Date().toISOString(),
        configuration: pratique
    };

    // Créer et télécharger le fichier JSON
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pratique-${pratique.nom.replace(/\s+/g, '-').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    if (typeof afficherNotificationSucces === 'function') {
        afficherNotificationSucces('Fichier de partage téléchargé');
    }
}

/**
 * Exporte toutes les pratiques de l'utilisateur
 */
async function exporterPratiquesUtilisateur() {
    const configurations = await db.get(CLE_PRATIQUES_CONFIGURATIONS) || [];

    if (configurations.length === 0) {
        alert('Aucune pratique à exporter.');
        return;
    }

    const exportData = {
        version: '1.0',
        type: 'configurations-pratiques',
        dateExport: new Date().toISOString(),
        nombreConfigurations: configurations.length,
        configurations: configurations
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mes-pratiques-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    if (typeof afficherNotificationSucces === 'function') {
        afficherNotificationSucces('Toutes les pratiques exportées');
    }
}

/* ===============================
   SYSTÈME DE JETONS
   =============================== */

/**
 * Toggle la visibilité du contenu du système de jetons
 */
function toggleSystemeJetonsMat() {
    const checkbox = document.getElementById('mat-jetons-actif');
    const contenu = document.getElementById('mat-contenu-jetons');

    if (contenu) {
        contenu.style.display = checkbox && checkbox.checked ? 'block' : 'none';
    }
}

/* ===============================
   PAR-OBJECTIFS (variante STD)
   =============================== */

/**
 * Descriptions des 4 modes de calcul par-objectifs
 */
const MODES_PAR_OBJECTIFS = {
    'comptage': {
        nom: 'Comptage d\'objectifs',
        auteur: 'Bruno V.',
        description: 'La note finale dépend du nombre d\'objectifs maîtrisés. Les objectifs « essentiels » doivent TOUS être maîtrisés, sinon la note est plafonnée.'
    },
    'moyenne-ponderee': {
        nom: 'Moyenne pondérée',
        auteur: 'Michel B.',
        description: 'La note finale est la moyenne des niveaux atteints, pondérée par l\'importance de chaque objectif.'
    },
    'seuils-critiques': {
        nom: 'Seuils critiques',
        auteur: 'Xavier C.-T.',
        description: 'Tous les objectifs doivent atteindre un niveau minimum. Bonus pour les objectifs au niveau supérieur.'
    },
    'holistique': {
        nom: 'Holistique',
        auteur: 'Isabelle M.',
        description: 'Le système suggère une note basée sur une analyse statistique, mais l\'enseignant·e valide avec son jugement professionnel.'
    }
};

/**
 * Charge la configuration Par-Objectifs depuis la pratique en édition
 */
async function chargerConfigParObjectifsMat() {
    if (!pratiqueEnEditionMateriel) return;

    let configurations = [];
    try {
        configurations = await db.get(CLE_PRATIQUES_CONFIGURATIONS) || [];
    } catch (e) {
        configurations = [];
    }

    const pratique = configurations.find(p => p.id === pratiqueEnEditionMateriel);
    if (!pratique) return;

    const parObjectifs = pratique.configuration?.parObjectifs || {};

    // Mode de calcul
    setValeurChamp('mat-objectifs-mode-calcul', parObjectifs.modeCalcul || 'comptage');

    // Afficher la liste des objectifs
    afficherListeObjectifsMat(parObjectifs.objectifs || []);

    // Paramètres du mode Comptage
    setValeurChamp('mat-comptage-seuil-maitrise', parObjectifs.comptage?.seuilMaitrise || 75);
    setValeurChamp('mat-comptage-plafond-essentiel', parObjectifs.comptage?.plafondEssentiel || 55);

    // Paramètres du mode Seuils critiques
    setValeurChamp('mat-seuils-niveau-reussite', parObjectifs.seuilsCritiques?.niveauReussite || 3);
    setValeurChamp('mat-seuils-note-base', parObjectifs.seuilsCritiques?.noteBase || 80);
    setValeurChamp('mat-seuils-bonus-niveau4', parObjectifs.seuilsCritiques?.bonusNiveau4 || 3.33);

    // Paramètres du mode Holistique
    setValeurChamp('mat-holistique-methode', parObjectifs.holistique?.methode || 'mode');

    // Grille de conversion (mode Comptage)
    if (parObjectifs.comptage?.grilleConversion) {
        afficherGrilleConversionMat(parObjectifs.comptage.grilleConversion);
    }

    // Afficher la bonne section de mode (APRÈS avoir chargé les données)
    changerModeCalculObjectifsMat();
}

/**
 * Handler : Changement du mode de calcul par-objectifs
 */
function changerModeCalculObjectifsMat() {
    const mode = getValeurChamp('mat-objectifs-mode-calcul');
    const descriptionDiv = document.getElementById('mat-objectifs-mode-description');

    // Afficher la description du mode
    const modeInfo = MODES_PAR_OBJECTIFS[mode];
    if (modeInfo && descriptionDiv) {
        descriptionDiv.innerHTML = `<strong>${modeInfo.nom} (${modeInfo.auteur})</strong> : ${modeInfo.description}`;
        descriptionDiv.style.display = 'block';
    } else if (descriptionDiv) {
        descriptionDiv.style.display = 'none';
    }

    // Masquer toutes les sections de mode
    const sections = ['mat-config-mode-comptage', 'mat-config-mode-moyenne-ponderee',
                      'mat-config-mode-seuils-critiques', 'mat-config-mode-holistique'];
    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });

    // Afficher la section correspondante
    const sectionId = `mat-config-mode-${mode}`;
    const section = document.getElementById(sectionId);
    if (section) section.style.display = 'block';

    // Rafraîchir la liste des objectifs (colonnes différentes selon le mode)
    rafraichirListeObjectifsMat();

    sauvegarderConfigPratiqueMat();
}

/**
 * Affiche la liste des objectifs dans le tableau
 */
function afficherListeObjectifsMat(objectifs) {
    const conteneur = document.getElementById('mat-objectifs-liste');
    if (!conteneur) return;

    if (!objectifs || objectifs.length === 0) {
        conteneur.innerHTML = '<p style="color: #999; font-style: italic;">Aucun objectif défini. Cliquez sur "+ Ajouter un objectif".</p>';
        return;
    }

    const mode = getValeurChamp('mat-objectifs-mode-calcul') || 'comptage';

    let html = '<table class="table-bordures" style="width: 100%;">';
    html += '<thead><tr>';
    html += '<th style="width: 40%;">Nom de l\'objectif</th>';

    // Colonnes spécifiques selon le mode
    if (mode === 'comptage') {
        html += '<th style="width: 20%;">Type</th>';
    } else if (mode === 'moyenne-ponderee') {
        html += '<th style="width: 20%;">Pondération (%)</th>';
    }

    html += '<th style="width: 80px;">Actions</th>';
    html += '</tr></thead>';
    html += '<tbody>';

    objectifs.forEach((obj, index) => {
        html += `<tr data-index="${index}">`;
        html += `<td><input type="text" class="controle-form" value="${obj.nom || ''}"
                    onchange="modifierObjectifMat(${index}, 'nom', this.value)"></td>`;

        if (mode === 'comptage') {
            html += `<td>
                <select class="controle-form" onchange="modifierObjectifMat(${index}, 'type', this.value)">
                    <option value="complementaire" ${obj.type !== 'essentiel' ? 'selected' : ''}>Complémentaire</option>
                    <option value="essentiel" ${obj.type === 'essentiel' ? 'selected' : ''}>Essentiel</option>
                </select>
            </td>`;
        } else if (mode === 'moyenne-ponderee') {
            html += `<td><input type="number" class="controle-form" value="${obj.ponderation || 0}"
                        min="0" max="100" style="width: 80px;"
                        onchange="modifierObjectifMat(${index}, 'ponderation', this.value)">%</td>`;
        }

        html += `<td style="text-align: center;">
            <button onclick="supprimerObjectifMat(${index})" class="btn btn-supprimer btn-tres-compact">×</button>
        </td>`;
        html += '</tr>';
    });

    html += '</tbody></table>';

    // Afficher le total des pondérations pour le mode moyenne-ponderee
    if (mode === 'moyenne-ponderee') {
        const total = objectifs.reduce((sum, obj) => sum + (parseInt(obj.ponderation) || 0), 0);
        const couleur = total === 100 ? '#4caf50' : '#f44336';
        html += `<p style="margin-top: 10px; font-weight: 600; color: ${couleur};">
            Total des pondérations : ${total}% ${total !== 100 ? '(devrait être 100%)' : '✓'}
        </p>`;
    }

    conteneur.innerHTML = html;
}

/**
 * Rafraîchit la liste des objectifs (recharge depuis les données en mémoire)
 */
async function rafraichirListeObjectifsMat() {
    if (!pratiqueEnEditionMateriel) return;

    let configurations = [];
    try {
        configurations = await db.get(CLE_PRATIQUES_CONFIGURATIONS) || [];
    } catch (e) {
        configurations = [];
    }

    const pratique = configurations.find(p => p.id === pratiqueEnEditionMateriel);
    if (!pratique) return;

    const objectifs = pratique.configuration?.parObjectifs?.objectifs || [];
    afficherListeObjectifsMat(objectifs);
}

/**
 * Ajoute un nouvel objectif à la liste
 */
async function ajouterObjectifMat() {
    if (!pratiqueEnEditionMateriel) return;

    let configurations = await db.get(CLE_PRATIQUES_CONFIGURATIONS) || [];
    const index = configurations.findIndex(p => p.id === pratiqueEnEditionMateriel);

    if (index === -1) return;

    // Initialiser la structure si nécessaire
    if (!configurations[index].configuration) {
        configurations[index].configuration = {};
    }
    if (!configurations[index].configuration.parObjectifs) {
        configurations[index].configuration.parObjectifs = { objectifs: [] };
    }
    if (!configurations[index].configuration.parObjectifs.objectifs) {
        configurations[index].configuration.parObjectifs.objectifs = [];
    }

    const nbObjectifs = configurations[index].configuration.parObjectifs.objectifs.length;
    configurations[index].configuration.parObjectifs.objectifs.push({
        id: `obj_${Date.now()}`,
        nom: `Objectif ${nbObjectifs + 1}`,
        type: 'complementaire',
        ponderation: 0
    });

    await db.set(CLE_PRATIQUES_CONFIGURATIONS, configurations);
    afficherListeObjectifsMat(configurations[index].configuration.parObjectifs.objectifs);
}

/**
 * Modifie une propriété d'un objectif
 */
async function modifierObjectifMat(indexObjectif, propriete, valeur) {
    if (!pratiqueEnEditionMateriel) return;

    let configurations = await db.get(CLE_PRATIQUES_CONFIGURATIONS) || [];
    const index = configurations.findIndex(p => p.id === pratiqueEnEditionMateriel);

    if (index === -1 || !configurations[index].configuration?.parObjectifs?.objectifs) return;

    if (propriete === 'ponderation') {
        valeur = parseInt(valeur) || 0;
    }

    configurations[index].configuration.parObjectifs.objectifs[indexObjectif][propriete] = valeur;
    await db.set(CLE_PRATIQUES_CONFIGURATIONS, configurations);

    // Rafraîchir si mode moyenne-ponderee (pour mettre à jour le total)
    if (propriete === 'ponderation') {
        afficherListeObjectifsMat(configurations[index].configuration.parObjectifs.objectifs);
    }
}

/**
 * Supprime un objectif de la liste
 */
async function supprimerObjectifMat(indexObjectif) {
    if (!pratiqueEnEditionMateriel) return;

    let configurations = await db.get(CLE_PRATIQUES_CONFIGURATIONS) || [];
    const index = configurations.findIndex(p => p.id === pratiqueEnEditionMateriel);

    if (index === -1 || !configurations[index].configuration?.parObjectifs?.objectifs) return;

    configurations[index].configuration.parObjectifs.objectifs.splice(indexObjectif, 1);
    await db.set(CLE_PRATIQUES_CONFIGURATIONS, configurations);
    afficherListeObjectifsMat(configurations[index].configuration.parObjectifs.objectifs);

    // Regénérer la grille de conversion si mode comptage
    const mode = getValeurChamp('mat-objectifs-mode-calcul');
    if (mode === 'comptage') {
        genererGrilleConversionMat();
    }
}

/**
 * Affiche la grille de conversion (mode Comptage)
 */
function afficherGrilleConversionMat(grille) {
    const conteneur = document.getElementById('mat-comptage-grille-conversion');
    if (!conteneur) return;

    if (!grille || grille.length === 0) {
        conteneur.innerHTML = '<p style="color: #999; font-style: italic;">Ajoutez des objectifs pour générer la grille de conversion.</p>';
        return;
    }

    let html = '<table class="table-bordures" style="width: 100%;">';
    html += '<thead><tr><th>Objectifs maîtrisés</th><th>Note (%)</th></tr></thead>';
    html += '<tbody>';

    grille.forEach((ligne, index) => {
        html += `<tr>
            <td>${ligne.nbObjectifs} objectif(s)</td>
            <td><input type="number" class="controle-form" value="${ligne.note}"
                    min="0" max="100" style="width: 80px;"
                    onchange="modifierGrilleConversionMat(${index}, this.value)">%</td>
        </tr>`;
    });

    html += '</tbody></table>';
    html += `<button type="button" class="btn btn-secondaire btn-compact" style="margin-top: 10px;"
             onclick="genererGrilleConversionMat()">Regénérer la grille</button>`;

    conteneur.innerHTML = html;
}

/**
 * Génère automatiquement la grille de conversion basée sur le nombre d'objectifs
 */
async function genererGrilleConversionMat() {
    if (!pratiqueEnEditionMateriel) return;

    let configurations = await db.get(CLE_PRATIQUES_CONFIGURATIONS) || [];
    const index = configurations.findIndex(p => p.id === pratiqueEnEditionMateriel);

    if (index === -1) return;

    const objectifs = configurations[index].configuration?.parObjectifs?.objectifs || [];
    const nbObjectifs = objectifs.length;

    if (nbObjectifs === 0) {
        afficherGrilleConversionMat([]);
        return;
    }

    // Générer une grille linéaire de base
    const grille = [];
    for (let i = 0; i <= nbObjectifs; i++) {
        const note = Math.round((i / nbObjectifs) * 40 + 60); // De 60% à 100%
        grille.push({ nbObjectifs: i, note: Math.min(note, 100) });
    }

    // Sauvegarder
    if (!configurations[index].configuration.parObjectifs.comptage) {
        configurations[index].configuration.parObjectifs.comptage = {};
    }
    configurations[index].configuration.parObjectifs.comptage.grilleConversion = grille;

    await db.set(CLE_PRATIQUES_CONFIGURATIONS, configurations);
    afficherGrilleConversionMat(grille);
}

/**
 * Modifie une note dans la grille de conversion
 */
async function modifierGrilleConversionMat(indexLigne, valeur) {
    if (!pratiqueEnEditionMateriel) return;

    let configurations = await db.get(CLE_PRATIQUES_CONFIGURATIONS) || [];
    const index = configurations.findIndex(p => p.id === pratiqueEnEditionMateriel);

    if (index === -1) return;

    const grille = configurations[index].configuration?.parObjectifs?.comptage?.grilleConversion;
    if (!grille) return;

    grille[indexLigne].note = parseInt(valeur) || 0;
    await db.set(CLE_PRATIQUES_CONFIGURATIONS, configurations);
}

/* ===============================
   EXPORTS GLOBAUX
   =============================== */

// Module principal
window.initialiserModulePratiquesMateriel = initialiserModulePratiquesMateriel;
window.afficherListePratiquesMateriel = afficherListePratiquesMateriel;
window.afficherBibliothequePratiques = afficherBibliothequePratiques;
window.fermerModalBibliothequePratiques = fermerModalBibliothequePratiques;
window.filtrerPratiquesBibliotheque = filtrerPratiquesBibliotheque;
window.ajouterPratiqueALaSelection = ajouterPratiqueALaSelection;
window.retirerPratiqueDeLaSelection = retirerPratiqueDeLaSelection;
window.retirerPratiqueDeBibliothequeMateriel = retirerPratiqueDeBibliothequeMateriel;

// Édition
window.chargerPratiquePourModif = chargerPratiquePourModif;
window.creerNouvellePratique = creerNouvellePratique;
window.dupliquerPratiqueMateriel = dupliquerPratiqueMateriel;
window.supprimerPratiqueMateriel = supprimerPratiqueMateriel;
window.appliquerPratiqueAuCours = appliquerPratiqueAuCours;
window.sauvegarderPratiqueMateriel = sauvegarderPratiqueMateriel;
window.sauvegarderPratiqueMaterielComplet = sauvegarderPratiqueMaterielComplet;
window.partagerPratiqueMateriel = partagerPratiqueMateriel;
window.exporterPratiquesUtilisateur = exporterPratiquesUtilisateur;

// Handlers formulaire (préfixe mat-)
window.changerTypePratiqueMat = changerTypePratiqueMat;
window.changerVariantePANStandardsMat = changerVariantePANStandardsMat;
window.mettreAJourNomPratiqueMat = mettreAJourNomPratiqueMat;
window.mettreAJourDescriptionPratiqueMat = mettreAJourDescriptionPratiqueMat;
window.mettreAJourDisciplinePratiqueMat = mettreAJourDisciplinePratiqueMat;
window.sauvegarderConfigPratiqueMat = sauvegarderConfigPratiqueMat;
window.toggleSystemeJetonsMat = toggleSystemeJetonsMat;

// Échelles
window.chargerDropdownEchellesMat = chargerDropdownEchellesMat;
window.afficherPreviewEchelleMat = afficherPreviewEchelleMat;

// PAN-Spécifications : Types de travaux
window.afficherTypesTravauxMat = afficherTypesTravauxMat;
window.ajouterTypeTravailMat = ajouterTypeTravailMat;
window.modifierTypeTravailMat = modifierTypeTravailMat;
window.supprimerTypeTravailMat = supprimerTypeTravailMat;

// PAN-Spécifications : Forfaits
window.afficherForfaitsMat = afficherForfaitsMat;
window.ajouterForfaitMat = ajouterForfaitMat;
window.modifierForfaitMat = modifierForfaitMat;
window.modifierTravailForfaitMat = modifierTravailForfaitMat;
window.supprimerForfaitMat = supprimerForfaitMat;

// PAN-Standards : Par-Objectifs (variante STD)
window.chargerConfigParObjectifsMat = chargerConfigParObjectifsMat;
window.changerModeCalculObjectifsMat = changerModeCalculObjectifsMat;
window.afficherListeObjectifsMat = afficherListeObjectifsMat;
window.rafraichirListeObjectifsMat = rafraichirListeObjectifsMat;
window.ajouterObjectifMat = ajouterObjectifMat;
window.modifierObjectifMat = modifierObjectifMat;
window.supprimerObjectifMat = supprimerObjectifMat;
window.afficherGrilleConversionMat = afficherGrilleConversionMat;
window.genererGrilleConversionMat = genererGrilleConversionMat;
window.modifierGrilleConversionMat = modifierGrilleConversionMat;

// Anciennes fonctions (compatibilité)
window.mettreAJourNomPratique = mettreAJourNomPratique;
window.mettreAJourDescriptionPratique = mettreAJourDescriptionPratique;
window.mettreAJourDisciplinePratique = mettreAJourDisciplinePratique;

// Constantes
window.CLE_PRATIQUES_CONFIGURATIONS = CLE_PRATIQUES_CONFIGURATIONS;
window.pratiqueEnEditionMateriel = pratiqueEnEditionMateriel;

console.log('[pratiques-materiel] Module chargé');
