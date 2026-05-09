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

(function() {
'use strict';

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

/**
 * 🆕 FIX #4 (20 jan 2026) : Flag pour bloquer les sauvegardes pendant le remplissage
 * Évite que les fonctions appelées pendant remplirFormulairePratique() écrasent les valeurs
 */
let enChargementFormulaire = false;

/* ===============================
   ✅ AJOUT (28 janvier 2026) : DÉTECTION DES DOUBLONS
   Fonctions pour identifier les pratiques avec des noms similaires
   =============================== */

/**
 * Détecter les doublons potentiels dans les pratiques
 * @param {Array} pratiquesLocales - Pratiques de l'utilisateur
 * @param {Array} pratiquesBibliotheque - Pratiques de la bibliothèque partagée
 * @returns {Array} Liste des doublons {nom, count, ids}
 */
function detecterDoublonsPratiques(pratiquesLocales, pratiquesBibliotheque) {
    const toutesPratiques = [...pratiquesLocales, ...pratiquesBibliotheque];
    const parNom = {};

    toutesPratiques.forEach(pratique => {
        const nom = (pratique.nom || '').trim().toLowerCase();
        if (!nom) return;

        if (!parNom[nom]) {
            parNom[nom] = { nom: pratique.nom, count: 0, ids: [] };
        }
        parNom[nom].count++;
        parNom[nom].ids.push(pratique.id);
    });

    return Object.values(parNom).filter(d => d.count > 1);
}

/**
 * Générer un badge de source pour une pratique
 * @param {Object} pratique - La pratique
 * @param {Array} pratiquesLocales - Pratiques locales pour vérifier la source
 * @returns {string} HTML du badge
 */
function genererBadgeSourcePratique(pratique /*, pratiquesLocales */) {
    // Beta 99.39 (A.2 + A.4 + retrait Locale) : aligné sur BibliothequeUI.
    // Ne reste que `Retirée` (état distinct).
    if (pratique && pratique.dansBibliotheque === false) {
        return '<span class="badge-source badge-source--retiree" style="margin-left: 6px;">Retirée</span>';
    }
    return '';
}

/**
 * Générer un ID court pour affichage
 * @param {string} id - L'ID complet
 * @returns {string} Les 6 derniers caractères
 */
function genererIdCourtPratique(id) {
    if (!id || id.length < 6) return id || '?';
    return id.slice(-6);
}

/* ===============================
   INITIALISATION DU MODULE
   =============================== */

/**
 * Point d'entrée appelé par navigation.js quand on navigue vers conception-pratiques-notation
 * Note: Renommé en "Materiel" pour éviter conflit avec pratiques.js
 */
async function initialiserModulePratiquesMateriel() {

    // Afficher la sidebar avec la liste des pratiques
    await afficherListePratiquesMateriel();

    // Cacher le formulaire d'édition et montrer l'accueil
    const conteneurEdition = document.getElementById('conteneurEditionPratique');
    const accueil = document.getElementById('accueilPratiques');

    if (conteneurEdition) conteneurEdition.classList.add('u-hide');
    if (accueil) accueil.classList.remove('u-hide');

}

/* ===============================
   GESTION DE LA SIDEBAR
   =============================== */

/**
 * Affiche la liste des pratiques dans la sidebar
 * Note: Le bouton "Consulter la bibliothèque" est maintenant dans le HTML statique
 * Renommé avec suffixe "Materiel" pour éviter conflit avec pratiques.js
 */
async function afficherListePratiquesMateriel() {

    const container = document.getElementById('sidebarListePratiques');
    if (!container) {
        console.warn('[pratiques-materiel] ⚠️ Élément sidebarListePratiques introuvable');
        return;
    }

    // 🆕 FIX v3 (20 jan 2026) : Utiliser localStorage (cache synchrone) comme source principale
    // localStorage est toujours à jour grâce à la double écriture (setSync + set)
    const configurations = db.getSync(CLE_PRATIQUES_CONFIGURATIONS, []);

    // Filtrer les pratiques dans la bibliothèque (affichées dans la sidebar)
    // Beta 99.39 (A.0) : masque les items démo en mode normal
    const pratiquesDansBibliotheque = BibliothequeUI.filtrerParModeDemo(
        configurations.filter(p => p.dansBibliotheque !== false)
    );


    // Si aucune pratique, afficher message
    if (pratiquesDansBibliotheque.length === 0) {
        container.innerHTML = '<p class="sidebar-vide">Crée une nouvelle pratique ou puisez dans la bibliothèque</p>';
        return;
    }

    // Générer les items de la sidebar
    const html = pratiquesDansBibliotheque.map(pratique => {
        const nomPratique = pratique.nom || 'Sans titre';
        const badgeType = genererBadgeTypePratique(pratique);
        const badgesCaracteristiques = genererBadgeCaracteristiques(pratique);
        return `
            <div class="sidebar-item" data-id="${pratique.id}" data-action="chargerPratiquePourModif" data-param="${pratique.id}">
                <div class="sidebar-item-titre">${nomPratique}</div>
                <div class="sidebar-item-badges">${badgeType} ${badgesCaracteristiques}</div>
            </div>
        `;
    }).join('');

    container.innerHTML = html;
}

/**
 * Retourne la description courte (taxonomique) d'une pratique pour la sidebar
 * @param {Object} pratique - La configuration de pratique
 * @returns {string} Description courte
 */
function obtenirDescriptionCourtePratique(pratique) {
    if (!pratique) return '';

    // Descriptions taxonomiques complètes selon le type
    const descriptions = {
        'sommative': 'Sommative (Traditional Grading) - Moyenne pondérée des évaluations',
        'pan-standards': 'PAN-Standards (Standards-Based Grading) - Maîtrise de standards/objectifs',
        'pan-specifications': 'PAN-Spécifications (Specifications Grading) - Évaluation dichotomique par forfaits',
        'denombrement': 'Dénombrement (Counting-Based) - Comptage de réussites'
    };

    // Retourner la description personnalisée si disponible, sinon la taxonomique
    if (pratique.description && pratique.description.trim().length > 0) {
        // Tronquer si trop long
        const desc = pratique.description.trim();
        return desc.length > 100 ? desc.substring(0, 97) + '...' : desc;
    }

    return descriptions[pratique.type] || pratique.type || '';
}

/**
 * Génère les badges de caractéristiques basés sur la configuration de la pratique
 * Retourne toutes les caractéristiques formatées en badges (couleur via CSS selon le mode)
 * @param {Object} pratique - La configuration de pratique
 */
function genererBadgeCaracteristiques(pratique) {
    if (!pratique) return '';

    const caracteristiques = [];

    // 1. Mode de calcul par objectifs (variante STD)
    if (pratique.configuration?.varianteCalcul === 'par-objectifs') {
        caracteristiques.push('par objectifs');
    }

    // 2. Portfolio actif (N meilleures, ou hybride N meilleures + M obligatoires)
    if (pratique.configuration?.portfolio && pratique.configuration.varianteCalcul !== 'par-objectifs') {
        const config = pratique.configuration;
        const categoriesActif = config.categories?.actif || config.portfolio?.hybride || false;

        if (categoriesActif && config.categories?.selection) {
            // Mode hybride : N meilleures + M obligatoires
            const nMeilleures = config.categories.selection.nombreARetenir || 0;
            const nTotal = config.portfolio.nombreARetenir || config.portfolio.nbArtefactsRetenus || 0;
            const nObligatoires = nTotal > nMeilleures ? nTotal - nMeilleures : 0;

            if (nMeilleures > 0) {
                let texte = `${nMeilleures} meilleure${nMeilleures > 1 ? 's' : ''}`;
                if (nObligatoires > 0) {
                    texte += ` + ${nObligatoires} oblig.`;
                }
                caracteristiques.push(texte);
            }
        } else {
            // Mode simple : N meilleures
            const n = config.portfolio.nombreARetenir || config.portfolio.nbArtefactsRetenus || 0;
            if (n > 0) {
                caracteristiques.push(`${n} meilleures`);
            }
        }
    }

    // 3. Jetons actifs
    if (pratique.jetons?.actif) {
        const nbJetons = pratique.jetons.nombre || 2;  // 🆕 Beta 95.7 : défaut 2
        caracteristiques.push(`${nbJetons} jetons`);
    }

    // 4. Échelle associée (nom abrégé)
    if (pratique.configuration?.echelleId) {
        const echelles = db.getSync('echellesTemplates', []);
        const echelle = echelles.find(e => e.id === pratique.configuration.echelleId);
        if (echelle) {
            const nomCourt = echelle.code || echelle.nom?.substring(0, 12) || 'échelle';
            caracteristiques.push(nomCourt);
        }
    }

    if (caracteristiques.length === 0) return '';

    // Formater chaque caractéristique en badge (couleur gérée par CSS via var(--accent-primaire))
    return caracteristiques.map(c =>
        `<span class="badge-caracteristique">${c}</span>`
    ).join(' ');
}

/**
 * Génère un badge coloré selon le type de pratique (SOM, STD, SPE, DEN)
 * Utilise les variables CSS définies dans styles.css (03c-barres-gradient)
 */
function genererBadgeTypePratique(pratique) {
    if (!pratique) return '';

    // 🆕 FIX (20 jan 2026) : Chercher le type dans plusieurs sources possibles
    let type = null;

    // Source 1 : pratique.pratiques[0] (format attendu)
    if (pratique.pratiques && Array.isArray(pratique.pratiques) && pratique.pratiques[0]) {
        type = pratique.pratiques[0];
    }
    // Source 2 : pratique.type (format alternatif)
    else if (pratique.type) {
        // Convertir le type en code badge
        const typeMapping = {
            'sommative': 'SOM',
            'pan-standards': 'STD',
            'pan-specifications': 'SPE',
            'pan-maitrise': 'PAN'
        };
        type = typeMapping[pratique.type.toLowerCase()] || pratique.type.toUpperCase().substring(0, 3);
    }

    if (!type) return '';

    const typesValides = ['SOM', 'STD', 'SPE', 'DEN', 'PAN'];
    if (!typesValides.includes(type)) return '';

    // Utilise la classe CSS .badge-type-pratique avec modificateur
    return `<span class="badge-type-pratique badge-type-${type.toLowerCase()}">${type}</span>`;
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
    // 🆕 FIX v3 (20 jan 2026) : localStorage comme source principale (toujours à jour)
    const configurations = db.getSync(CLE_PRATIQUES_CONFIGURATIONS, []);

    // Beta 99.39 (A.0) : masque les items démo en mode normal
    const pratiquesDansBibliotheque = BibliothequeUI.filtrerParModeDemo(
        configurations.filter(p => p.dansBibliotheque !== false)
    );

    // Charger toutes les pratiques disponibles (gabarits + bibliothèque)
    let pratiquesDisponibles = [];
    if (typeof obtenirToutesLesPratiquesBibliotheque === 'function') {
        pratiquesDisponibles = await obtenirToutesLesPratiquesBibliotheque();
    }
    pratiquesDisponibles = BibliothequeUI.filtrerParModeDemo(pratiquesDisponibles);

    // ✅ AJOUT (28 janvier 2026) : Détecter les doublons
    const doublonsDetectes = detecterDoublonsPratiques(pratiquesDansBibliotheque, pratiquesDisponibles);

    // Obtenir les disciplines disponibles
    let disciplines = [];
    if (typeof obtenirDisciplinesDisponiblesPratiques === 'function') {
        disciplines = await obtenirDisciplinesDisponiblesPratiques();
    }

    // Construire le HTML du modal
    let html = `
        <div id="modalBibliothequePratiques" class="modal-js-overlay">
            <div class="modal-js-contenu" style="max-width: 800px;">
                <!-- Bouton X sticky -->
                <button data-action="fermerModalBibliothequePratiques" class="modal-js-fermer">
                    ×
                </button>
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                    <h2 style="margin: 0; color: var(--accent-primaire);">Bibliothèque de pratiques de notation</h2>
                    <button class="btn-aide-contextuelle" data-aide="bibliotheque-fonctionnement" title="Comment fonctionne la bibliothèque">✴️</button>
                </div>
                <p style="color: var(--gris-clair); margin-bottom: 15px;">
                    Gérez les pratiques affichées dans la barre latérale.
                </p>
    `;

    // ✅ AJOUT (28 janvier 2026) : Afficher avertissement doublons
    if (doublonsDetectes.length > 0) {
        html += `
                <div class="info-box info-box--attention" style="margin-bottom: 20px;">
                    <div style="font-weight: bold; color: var(--gris-fonce); margin-bottom: 8px;">
                        ⚠️ ${doublonsDetectes.length} doublon(s) potentiel(s) détecté(s)
                    </div>
                    <p style="color: var(--gris-fonce); font-size: 0.9em; margin: 0 0 10px 0;">
                        Des pratiques avec des noms similaires existent en plusieurs exemplaires.
                    </p>
                    <details style="color: var(--gris-fonce); font-size: 0.85em;">
                        <summary style="cursor: pointer; font-weight: 500;">Voir les détails</summary>
                        <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                            ${doublonsDetectes.map(d => `<li><strong>${d.nom}</strong> : ${d.count} exemplaires (IDs: ${d.ids.map(id => '#' + genererIdCourtPratique(id)).join(', ')})</li>`).join('')}
                        </ul>
                    </details>
                </div>
        `;
    }

    html += `
                <!-- 🆕 Beta 95.7 : Message aide édition -->
                <div style="background: var(--bleu-tres-pale, #e8f4f8); border-left: 3px solid var(--bleu-clair, #5dade2); padding: 10px 15px; margin-bottom: 20px; border-radius: 0 6px 6px 0;">
                    <p style="margin: 0; font-size: 0.9rem; color: var(--texte-secondaire, #555);">
                        💡 <strong>Pour éditer une pratique</strong>, transférez-la d'abord dans la barre latérale en cliquant sur « Ajouter », puis cliquez dessus pour l'ouvrir en mode édition.
                    </p>
                </div>

                <!-- Section 1 : Pratiques dans ta sélection -->
                <h3 style="color: var(--bleu-clair); font-size: 1.1rem; margin-top: 20px; margin-bottom: 15px;">
                    Pratiques dans la barre latérale
                </h3>
                <div style="margin-bottom: 30px;">
                    <div id="listePratiquesDansBibliotheque">
    `;

    if (pratiquesDansBibliotheque.length === 0) {
        html += '<p style="color: var(--gris-clair); font-style: italic;">Aucune pratique dans la barre latérale</p>';
    } else {
        pratiquesDansBibliotheque.forEach(pratique => {
            const badge = genererBadgeTypePratique(pratique);
            // Beta 99.39 (A.3) : strippe les préfixes [STD]/[SPE]/etc. du titre
            const nomPratique = BibliothequeUI.formaterTitre(pratique.nom || 'Sans titre');
            const discipline = pratique.discipline || '';
            // Beta 99.39 (A.2 + A.4) : badge source minimal (Locale/Retirée), pas de Bibliothèque ni Démo
            const badgeSource = genererBadgeSourcePratique(pratique, pratiquesDansBibliotheque);

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
                            <div style="font-weight: bold; color: var(--accent-primaire); margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
                                ${badge}
                                ${nomPratique}
                                ${badgeSource}
                            </div>
                            ${(function(l){return l ? '<div class="biblio-carte-inspire">' + echapperHtml(l) + '</div>' : '';})(BibliothequeUI.formaterInspireDe(pratique))}
                            <div style="color: var(--gris-clair); font-size: 0.9em;">
                                ${pratique.description || ''}${discipline ? ' • ' + discipline : ''}
                            </div>
                        </div>
                        <div style="display: flex; gap: 8px; margin-left: 10px;">
                            <button
                                data-action="dupliquerPratiqueBibliotheque" data-param="${pratique.id}"
                                class="btn btn-confirmer btn-tres-compact"
                                title="Créer une copie">
                                Dupliquer
                            </button>
                            <button
                                data-action="partagerPratiqueMateriel" data-param="${pratique.id}"
                                class="btn btn-secondaire btn-tres-compact"
                                title="Exporter en JSON">
                                Exporter
                            </button>
                            <button
                                data-action="retirerPratiqueDeBibliothequeMateriel" data-param="${pratique.id}"
                                class="btn btn-secondaire btn-tres-compact"
                                title="Retirer de la barre latérale (données conservées)">
                                Retirer
                            </button>
                            <button
                                data-action="supprimerPratiqueDefinitivement" data-param="${pratique.id}"
                                class="btn btn-supprimer btn-tres-compact"
                                title="Supprimer définitivement">
                                Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
    }

    html += `
                    </div>

                    <!-- Boutons Import/Export après la Section 1 -->
                    <div style="margin-top: 15px; display: flex; justify-content: center; gap: 10px;">
                        <button data-action="exporterPratiquesUtilisateur" class="btn btn-secondaire">
                            Exporter toutes mes pratiques
                        </button>
                        <button data-action="ouvrirFilePickerImportPratiques" class="btn btn-secondaire">
                            Importer des pratiques
                        </button>
                        <input type="file" id="fichier-import-pratiques-modal" accept=".json" style="display: none;" data-on-change="importerPratiquesUtilisateur">
                    </div>
                </div>

                <!-- Section 2 : Pratiques disponibles -->
                <h3 style="color: var(--bleu-clair); font-size: 1.1rem; margin-top: 20px; margin-bottom: 15px;">
                    Pratiques disponibles à ajouter à la barre latérale
                </h3>

                <!-- Filtres -->
                <div style="display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 15px;">
                    <!-- Filtre par type -->
                    <div style="flex: 1; min-width: 200px;">
                        <label style="display: block; margin-bottom: 5px; color: var(--gris-moyen); font-weight: 500;">
                            Filtrer par type :
                        </label>
                        <select id="filtreTypePratiques"
                                class="controle-form"
                                data-on-change="filtrerPratiquesBibliotheque"
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
                        <label style="display: block; margin-bottom: 5px; color: var(--gris-moyen); font-weight: 500;">
                            Filtrer par discipline :
                        </label>
                        <select id="filtreDisciplinePratiques"
                                class="controle-form"
                                data-on-change="filtrerPratiquesBibliotheque"
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
        html += '<p style="color: var(--gris-clair); font-style: italic;">Toutes les pratiques sont déjà dans ta sélection</p>';
    } else {
        pratiquesAAfficher.forEach(pratique => {
            const badge = genererBadgeTypePratique(pratique);
            // Beta 99.39 (A.3) : strippe les préfixes [STD]/[SPE]/etc. du titre
            const nomPratique = BibliothequeUI.formaterTitre(pratique.nom || 'Sans titre');
            const estGabarit = pratique.estGabarit;
            const discipline = pratique.discipline || '';
            // Beta 99.39 (A.2 + A.4) : badge source minimal (Locale/Retirée), pas de Bibliothèque ni Démo
            const badgeSource = genererBadgeSourcePratique(pratique, pratiquesDansBibliotheque);

            html += `
                <div class="pratique-dispo-item"
                     data-type="${pratique.type || ''}"
                     data-discipline="${discipline}"
                     style="
                        border: 1px solid var(--bordure-claire);
                        border-radius: 6px;
                        padding: 15px;
                        margin-bottom: 10px;
                        background: ${estGabarit ? 'var(--gris-tres-pale)' : 'white'};
                     ">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div style="flex: 1;">
                            <div style="font-weight: bold; color: var(--accent-primaire); margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
                                ${badge}
                                ${nomPratique}
                                ${badgeSource}
                                ${estGabarit ? '<span class="badge-source badge-source--retiree">Gabarit</span>' : ''}
                            </div>
                            ${(function(l){return l ? '<div class="biblio-carte-inspire">' + echapperHtml(l) + '</div>' : '';})(BibliothequeUI.formaterInspireDe(pratique))}
                            <div style="color: var(--gris-clair); font-size: 0.9em;">
                                ${pratique.description || ''}${discipline ? ' • ' + discipline : ''}
                                ${pratique.auteur ? ' • Par ' + pratique.auteur : ''}
                            </div>
                        </div>
                        <button
                            data-action="ajouterPratiqueALaSelection" data-param="${pratique.id}"
                            class="btn btn-principal btn-tres-compact"
                            title="Ajouter à ta sélection">
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

    // Idempotence : retirer une instance précédente avant d'en injecter une
    // nouvelle. Sinon `appendChild` empile deux modales partageant le même
    // `id`, ce qui double le backdrop et oblige à fermer 2 fois pour que la
    // modale disparaisse. (Cas typique : rafraîchissement après import.)
    var ancien = document.getElementById('modalContainerPratiques');
    if (ancien) ancien.remove();

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

        toggleDisplay(item, matchType && matchDiscipline);
    });
}

/* ===============================
   GESTION DES PRATIQUES (AJOUT/RETRAIT)
   =============================== */

/**
 * Ajoute une pratique de la bibliothèque à la sélection de l'utilisateur
 */
async function ajouterPratiqueALaSelection(pratiqueId) {

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
            alert('Cette pratique est déjà dans ta sélection.');
            return;
        }

        // La pratique existe mais a été retirée - la réactiver
        existante.dansBibliotheque = true;
        existante.dateAjout = new Date().toISOString();
        db.setSync(CLE_PRATIQUES_CONFIGURATIONS, configurations);
    } else {
        // Ajouter avec le flag dansBibliotheque
        const nouvelleConfig = {
            ...configSource,
            dansBibliotheque: true,
            dateAjout: new Date().toISOString()
        };

        configurations.push(nouvelleConfig);
        db.setSync(CLE_PRATIQUES_CONFIGURATIONS, configurations);
    }

    // Rafraîchir la sidebar et fermer le modal
    await afficherListePratiquesMateriel();
    fermerModalBibliothequePratiques();

    if (typeof afficherNotificationSucces === 'function') {
        afficherNotificationSucces(`Pratique "${configSource.nom}" ajoutée`);
    }
}

/**
 * Retire une pratique de la sélection (mais pas de la bibliothèque globale)
 */
async function retirerPratiqueDeLaSelection(pratiqueId) {

    // Utiliser getSync/setSync pour cohérence avec afficherListePratiquesMateriel
    const configurations = db.getSync(CLE_PRATIQUES_CONFIGURATIONS, []);

    // Marquer comme retirée (au lieu de supprimer complètement)
    const index = configurations.findIndex(p => p.id === pratiqueId);
    if (index !== -1) {
        configurations[index].dansBibliotheque = false;
        db.setSync(CLE_PRATIQUES_CONFIGURATIONS, configurations);

        // Rafraîchir la sidebar AVANT de réouvrir le modal
        await afficherListePratiquesMateriel();

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

/**
 * ✅ AJOUT (28 janvier 2026) : Supprimer définitivement une pratique (hard delete)
 * @param {string} pratiqueId - ID de la pratique à supprimer
 */
async function supprimerPratiqueDefinitivement(pratiqueId) {
    const configurations = db.getSync(CLE_PRATIQUES_CONFIGURATIONS, []);
    const pratique = configurations.find(p => p.id === pratiqueId);

    if (!pratique) return;

    // Confirmation
    if (!confirm(`Supprimer définitivement la pratique «${pratique.nom}» ?\n\nCette action est irréversible.`)) {
        return;
    }

    // Suppression définitive
    const nouvellesConfigurations = configurations.filter(p => p.id !== pratiqueId);
    db.setSync(CLE_PRATIQUES_CONFIGURATIONS, nouvellesConfigurations);

    // Rafraîchir UI
    fermerModalBibliothequePratiques();
    await afficherListePratiques();
    await afficherBibliothequePratiques();

}

/**
 * ✅ AJOUT (28 janvier 2026) : Dupliquer une pratique dans la bibliothèque
 * @param {string} pratiqueId - ID de la pratique à dupliquer
 */
async function dupliquerPratiqueBibliotheque(pratiqueId) {
    const configurations = db.getSync(CLE_PRATIQUES_CONFIGURATIONS, []);
    const pratique = configurations.find(p => p.id === pratiqueId);

    if (!pratique) {
        alert('Pratique introuvable');
        return;
    }

    // Créer une copie avec un nouvel ID. La copie devient un nouvel original
    // de l'utilisateur ; trace d'origine `inspireDe` (respect CC BY). Si la
    // source était une démo, la copie perd le flag isDemo.
    const nouvellePratique = {
        ...pratique,
        id: genererIdUnique('pratique_'),
        nom: `${pratique.nom} (copie)`,
        auteur: BibliothequeUI.obtenirAuteurActif(),
        isDemo: false,
        inspireDe: BibliothequeUI.forgerInspireDe(pratique),
        dansBibliotheque: true,
        dateCreation: new Date().toISOString()
    };

    // Supprimer les métadonnées de partage
    delete nouvellePratique.metadata_cc;
    delete nouvellePratique.auteurOriginal;
    delete nouvellePratique.estGabarit; // Ce n'est plus un gabarit

    // Ajouter à la liste
    configurations.push(nouvellePratique);
    db.setSync(CLE_PRATIQUES_CONFIGURATIONS, configurations);

    // Rafraîchir UI
    fermerModalBibliothequePratiques();
    await afficherListePratiques();
    await afficherBibliothequePratiques();

}

/* ===============================
   ÉDITION DES PRATIQUES
   =============================== */

/**
 * Charge une pratique pour modification dans la zone principale
 * Utilise le formulaire HTML statique (IDs préfixés mat-)
 */
async function chargerPratiquePourModif(pratiqueId) {

    pratiqueEnEditionMateriel = pratiqueId;

    // Charger la configuration
    let pratique = null;

    // 🆕 FIX v3 (20 jan 2026) : localStorage comme source principale
    const configurations = db.getSync(CLE_PRATIQUES_CONFIGURATIONS, []);
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

    if (accueil) accueil.classList.add('u-hide');
    if (conteneurEdition) conteneurEdition.classList.remove('u-hide');

    // ✅ FIX (10 jan 2026) : Charger le dropdown des échelles AVANT de remplir le formulaire
    // Sinon la valeur de l'échelle ne peut pas être appliquée car le dropdown est vide
    await chargerDropdownEchellesMat();

    // Remplir les champs du formulaire (incluant l'échelle)
    remplirFormulairePratique(pratique);

    // Marquer l'item actif dans la sidebar
    document.querySelectorAll('#sidebarListePratiques .sidebar-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.id === pratiqueId) {
            item.classList.add('active');
        }
    });

    // Phase 4.B : mode lecture seule si item démo
    if (conteneurEdition && typeof BibliothequeUI !== 'undefined' && BibliothequeUI.appliquerModeLectureSeuleDemo) {
        BibliothequeUI.appliquerModeLectureSeuleDemo(conteneurEdition, pratique, 'dupliquerEtEditerPratique', 'Dupliquer pour créer ma pratique');
    }
}

/**
 * Phase 4.B : fork une pratique démo et charge la copie en édition.
 */
async function dupliquerEtEditerPratique(id) {
    const configurations = db.getSync(CLE_PRATIQUES_CONFIGURATIONS, []);
    let pratique = configurations.find(p => p.id === id);
    if (!pratique && typeof obtenirConfigurationPratiqueParId === 'function') {
        pratique = await obtenirConfigurationPratiqueParId(id);
    }
    if (!pratique) return;

    const copie = BibliothequeUI.forkerItem(pratique, 'pratique_');
    configurations.push(copie);
    db.setSync(CLE_PRATIQUES_CONFIGURATIONS, configurations);

    if (typeof afficherListePratiquesSidebar === 'function') {
        await afficherListePratiquesSidebar();
    }
    await chargerPratiquePourModif(copie.id);

    const nomField = document.getElementById('mat-pratique-nom');
    if (nomField) {
        nomField.focus();
        nomField.select();
    }
}

/**
 * Remplit tous les champs du formulaire avec les données de la pratique
 */
function remplirFormulairePratique(pratique) {
    // 🆕 FIX #4 (20 jan 2026) : Bloquer les sauvegardes pendant le remplissage
    enChargementFormulaire = true;

    // En-tête
    const titrePratique = document.getElementById('mat-titre-pratique');
    const badgePratique = document.getElementById('mat-badge-pratique');
    const descriptionPratique = document.getElementById('mat-description-pratique');

    if (titrePratique) titrePratique.textContent = pratique.nom || 'Sans titre';
    if (badgePratique) badgePratique.innerHTML = genererBadgeTypePratique(pratique);
    // Ligne 2 : description personnalisée ou description taxonomique
    if (descriptionPratique) {
        descriptionPratique.textContent = pratique.description || obtenirDescriptionCourtePratique(pratique);
    }

    // Informations de base
    setValeurChamp('mat-pratique-nom', pratique.nom || '');
    setValeurChamp('mat-pratique-type', pratique.type || '');
    setValeurChamp('mat-pratique-description', pratique.description || '');
    setValeurChamp('mat-pratique-discipline', pratique.discipline || '');

    // Affichage note
    const affNote = pratique.affichageNote || pratique.configuration?.affichageNote || 'complet';
    const radioComplet = document.getElementById('mat-affichage-note-complet');
    const radioLettre = document.getElementById('mat-affichage-note-lettre');
    if (affNote === 'lettre' && radioLettre) radioLettre.checked = true;
    else if (radioComplet) radioComplet.checked = true;

    // Afficher la description taxonomique selon le type
    afficherDescriptionTaxonomiqueMat(pratique.type);

    // Afficher les sections de configuration selon le type
    afficherConfigurationTypeMat(pratique.type);

    // Remplir les champs selon le type
    if (pratique.type === 'pan-standards') {
        const config = pratique.configuration || {};

        // 🆕 #24 : Déterminer le mode de sélection (hybride a priorité)
        const estHybride = config.portfolio?.hybride || config.categories?.actif || false;
        let modeSelection = config.portfolio?.methodeSelection || 'meilleurs';
        if (estHybride) modeSelection = 'hybride';

        // Variante de calcul - 🆕 #24 : Déduire depuis portfolio si non défini
        let varianteCalcul = config.varianteCalcul || '';
        if (!varianteCalcul && config.portfolio) {
            // Mapper methodeSelection vers varianteCalcul
            if (estHybride) {
                varianteCalcul = 'hybride';
            } else if (modeSelection === 'meilleurs' || modeSelection === 'n_meilleurs') {
                varianteCalcul = 'n-meilleurs';
            } else if (modeSelection === 'derniers') {
                varianteCalcul = 'n-recents';
            }
        }
        setValeurChamp('mat-variante-calcul', varianteCalcul);
        changerVariantePANStandardsMat();

        // Portfolio
        // 🆕 Beta 95.7 : Accepter noms wizard (nbArtefacts*) ET noms legacy (nombreARetenir/nombreTotal) (#4)
        if (config.portfolio) {
            const valNombre = config.portfolio.nbArtefactsRetenus || config.portfolio.nombreARetenir || 5;

            // 🆕 #24 : Utiliser le mode calculé (avec hybride si applicable)
            setValeurChamp('mat-portfolio-selection', modeSelection);
            setValeurChamp('mat-portfolio-nombre', valNombre);
            setValeurChamp('mat-portfolio-minimum', config.portfolio.minAvantCalculFormatif || config.portfolio.minimumCompletion || 7);
            setValeurChamp('mat-portfolio-total', config.portfolio.nbArtefactsSoumis || config.portfolio.nombreTotal || 10);
            setCheckbox('mat-decoupler-pr', config.portfolio.decouplerPR || false);
        }

        // 🆕 Beta 95.4 : Catégories Sélection/Obligatoires
        // 🆕 #24 : Support du flag hybride depuis le wizard
        const categoriesActif = config.categories?.actif || config.portfolio?.hybride || false;
        if (config.categories || categoriesActif) {
            setCheckbox('mat-categories-actif', categoriesActif);
            setValeurChamp('mat-selection-nombre', config.categories?.selection?.nombreARetenir || 4);
            setValeurChamp('mat-selection-ponderation', config.categories?.selection?.ponderation || 65);
            setValeurChamp('mat-obligatoires-ponderation', config.categories?.obligatoires?.ponderation || 35);
            toggleCategoriesMat(); // Afficher/masquer les détails
        }

    }
    // Note : sommative n'a pas de section ici — aucune configuration spécifique requise
    //        (utilise uniquement les pondérations des productions)

    if (pratique.type === 'pan-specifications') {
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
        peuplerDropdownNoteMaximaleMat(); // 🆕 Beta 95.7 : Peupler dropdown note maximale
    }

    // Système de jetons
    const jetons = pratique.jetons || {};
    setCheckbox('mat-jetons-actif', jetons.actif || false);
    toggleSystemeJetonsMat(); // Afficher/masquer le contenu
    setValeurChamp('mat-jetons-nombre', jetons.nombre || 2);  // 🆕 Beta 95.7 : défaut 2
    setCheckbox('mat-jeton-delai-actif', jetons.delaiActif !== false);
    setValeurChamp('mat-delai-duree', jetons.delaiDuree || 2);  // 🆕 Beta 95.7 : défaut 2 jours
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
    setValeurChamp('mat-ciblee-plafond', jetons.cibleePlafond || ''); // 🆕 Beta 95.7 : Pas de défaut, l'utilisateur doit choisir

    // 🆕 Beta 95.4 : Afficher le panneau métadonnées CC
    const panneauMeta = document.getElementById('panneauMetadonneesPratique');
    if (panneauMeta && typeof genererPanneauMetadonnees === 'function') {
        panneauMeta.innerHTML = genererPanneauMetadonnees(pratique, 'pratique');
    }

    // 🆕 FIX #4 (20 jan 2026) : Débloquer les sauvegardes après le remplissage
    enChargementFormulaire = false;
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
 * Note: Carte retirée du formulaire - info maintenant dans la sidebar
 * Fonction conservée pour compatibilité mais ne fait plus rien
 */
function afficherDescriptionTaxonomiqueMat(type) {
    // Description taxonomique maintenant affichée dans la sidebar
    // Cette fonction est conservée pour éviter les erreurs d'appel
    return;
}

/**
 * Affiche les sections de configuration selon le type
 */
function afficherConfigurationTypeMat(type) {
    // Cacher toutes les sections (style.display pour surcharger le style inline du HTML)
    const sections = ['mat-config-pan-standards', 'mat-config-sommative', 'mat-config-pan-specifications', 'mat-config-defaut'];
    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });

    // Variante PAN-Standards
    const variantePAN = document.getElementById('mat-variante-pan-standards');
    toggleDisplay(variantePAN, type === 'pan-standards');

    // Afficher la section appropriée
    let configId = 'mat-config-defaut';
    if (type === 'pan-standards' || type === 'pan-maitrise') {
        configId = 'mat-config-pan-standards';
    } else if (type === 'sommative') {
        configId = 'mat-config-sommative';
    } else if (type === 'pan-specifications' || type === 'specifications') {
        configId = 'mat-config-pan-specifications';
    }

    const config = document.getElementById(configId);
    if (config) config.style.display = '';
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

    // Mettre à jour la description (ligne 2)
    const descriptionPratique = document.getElementById('mat-description-pratique');
    if (descriptionPratique) {
        // Utiliser la description personnalisée si disponible, sinon la taxonomique
        const descCustom = getValeurChamp('mat-pratique-description');
        descriptionPratique.textContent = descCustom || obtenirDescriptionCourtePratique({ type });
    }

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
        descriptionDiv.classList.remove('u-hide');
    } else {
        descriptionDiv.classList.add('u-hide');
    }

    // Basculer entre Portfolio et Par-Objectifs
    if (variante === 'par-objectifs') {
        if (configPortfolio) configPortfolio.classList.add('u-hide');
        if (configParObjectifs) {
            configParObjectifs.classList.remove('u-hide');
            // Charger les données (changerModeCalculObjectifsMat est appelé à la fin)
            chargerConfigParObjectifsMat();
        }
    } else {
        if (configPortfolio) configPortfolio.classList.remove('u-hide');
        if (configParObjectifs) configParObjectifs.classList.add('u-hide');
    }

    sauvegarderConfigPratiqueMat();
}

/**
 * Handler : Mise à jour du nom
 */
async function mettreAJourNomPratiqueMat() {
    const nouveauNom = getValeurChamp('mat-pratique-nom');
    if (!pratiqueEnEditionMateriel) return;

    let configurations = db.getSync(CLE_PRATIQUES_CONFIGURATIONS, []);
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

    const nouvelleDescription = getValeurChamp('mat-pratique-description');

    let configurations = db.getSync(CLE_PRATIQUES_CONFIGURATIONS, []);
    const index = configurations.findIndex(p => p.id === pratiqueEnEditionMateriel);

    if (index !== -1) {
        configurations[index].description = nouvelleDescription;
        await db.set(CLE_PRATIQUES_CONFIGURATIONS, configurations);

        // Mettre à jour l'en-tête
        const descriptionPratique = document.getElementById('mat-description-pratique');
        if (descriptionPratique) {
            descriptionPratique.textContent = nouvelleDescription || obtenirDescriptionCourtePratique(configurations[index]);
        }
    }
}

/**
 * Handler : Mise à jour de la discipline
 */
async function mettreAJourDisciplinePratiqueMat() {
    if (!pratiqueEnEditionMateriel) return;

    let configurations = db.getSync(CLE_PRATIQUES_CONFIGURATIONS, []);
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

    // 🆕 FIX #4 (20 jan 2026) : Ne pas sauvegarder pendant le remplissage du formulaire
    if (enChargementFormulaire) {
        return;
    }

    // Phase 4.C : interdire références à des items démo (Plan §3.4)
    const echelleIdCourante = getValeurChamp('mat-echelle-id');
    if (echelleIdCourante && typeof BibliothequeUI !== 'undefined' && BibliothequeUI.verifierReferencesPasDemo) {
        const violationDemo = BibliothequeUI.verifierReferencesPasDemo([
            { id: echelleIdCourante, collection: 'echellesTemplates', labelType: 'échelle' }
        ]);
        if (violationDemo) {
            if (typeof afficherNotificationErreur === 'function') {
                afficherNotificationErreur('Référence démo non autorisée', violationDemo.message);
            }
            // Revert le champ pour que l'utilisateur ne soit pas bloqué
            setValeurChamp('mat-echelle-id', '');
            return;
        }
    }

    // 🆕 FIX v3 (20 jan 2026) : localStorage comme source principale
    let configurations = db.getSync(CLE_PRATIQUES_CONFIGURATIONS, []);
    const index = configurations.findIndex(p => p.id === pratiqueEnEditionMateriel);

    if (index === -1) {
        console.warn('[pratiques-materiel] ⚠️ Pratique en édition introuvable:', pratiqueEnEditionMateriel);
        return;
    }

    const type = getValeurChamp('mat-pratique-type');
    configurations[index].type = type;

    // Affichage note
    configurations[index].affichageNote =
        document.querySelector('input[name="mat-affichage-note"]:checked')?.value || 'complet';

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

            // 🆕 Beta 95.4 : Configuration Catégories Sélection/Obligatoires
            const categoriesActif = getCheckbox('mat-categories-actif');
            configurations[index].configuration.categories = {
                actif: categoriesActif,
                selection: {
                    nombreARetenir: parseInt(getValeurChamp('mat-selection-nombre')) || 4,
                    ponderation: parseInt(getValeurChamp('mat-selection-ponderation')) || 65
                },
                obligatoires: {
                    ponderation: parseInt(getValeurChamp('mat-obligatoires-ponderation')) || 35
                }
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
                // ✅ CORRECTION (4 jan 2026) : Harmoniser avec les noms des formulaires Trimestre
                configurations[index].configuration.parObjectifs.seuilsCritiques = {
                    seuilReussite: parseInt(getValeurChamp('mat-seuils-niveau-reussite')) || 3,
                    noteBaseReussite: parseInt(getValeurChamp('mat-seuils-note-base')) || 80,
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
        nombre: parseInt(getValeurChamp('mat-jetons-nombre')) || 2,  // 🆕 Beta 95.7 : défaut 2
        delaiActif: getCheckbox('mat-jeton-delai-actif'),
        delaiDuree: parseInt(getValeurChamp('mat-delai-duree')) || 2,  // 🆕 Beta 95.7 : défaut 2 jours
        repriseActif: getCheckbox('mat-jeton-reprise-actif'),
        repriseOriginale: repriseOriginale ? repriseOriginale.value : 'archiver',
        cibleeActif: getCheckbox('mat-jeton-ciblee-actif'),
        cibleePlafond: getValeurChamp('mat-ciblee-plafond') || ''  // 🆕 Beta 95.7 : pas de défaut
    };

    // 🆕 Beta 95.4 : Ajouter contributeur si l'utilisateur actif n'est pas l'auteur
    if (typeof ajouterContributeurSiNecessaire === 'function') {
        configurations[index] = ajouterContributeurSiNecessaire(configurations[index]);
    }

    // Sauvegarde IndexedDB + localStorage (db.set écrit dans les deux stores)
    try {
        await db.set(CLE_PRATIQUES_CONFIGURATIONS, configurations);
    } catch (e) {
        console.warn('[pratiques-materiel] Erreur db.set, fallback setSync:', e);
        db.setSync(CLE_PRATIQUES_CONFIGURATIONS, configurations);
    }
}

/**
 * Sauvegarde complète avec notification et vérification
 */
async function sauvegarderPratiqueMaterielComplet() {
    try {
        await sauvegarderConfigPratiqueMat();
        await mettreAJourNomPratiqueMat();
        await mettreAJourDescriptionPratiqueMat();
        await mettreAJourDisciplinePratiqueMat();

        // Vérification que la pratique existe toujours
        const verification = db.getSync(CLE_PRATIQUES_CONFIGURATIONS, []);
        const pratiqueTrouvee = verification.find(p => p.id === pratiqueEnEditionMateriel);

        if (pratiqueTrouvee) {
            if (typeof afficherNotificationSucces === 'function') {
                afficherNotificationSucces('Pratique enregistrée');
            }
        } else {
            throw new Error('Pratique introuvable après sauvegarde');
        }
    } catch (erreur) {
        console.error('[pratiques-materiel] ❌ Erreur sauvegarde complète:', erreur);
        if (typeof afficherNotificationErreur === 'function') {
            afficherNotificationErreur('Erreur lors de la sauvegarde. Vérifie la console.');
        } else {
            alert('Erreur lors de la sauvegarde. Vérifie la console.');
        }
    }
}

/* ===============================
   ÉCHELLES DE PERFORMANCE
   =============================== */

/**
 * Charge le dropdown des échelles
 * ✅ FIX (10 jan 2026) : N'affiche que les échelles dans la sidebar (dansBibliotheque !== false)
 */
async function chargerDropdownEchellesMat() {
    const select = document.getElementById('mat-echelle-id');
    if (!select) return;

    let echelles = [];
    try {
        const toutesEchelles = await db.get('echellesTemplates') || [];
        // Filtrer pour n'afficher que les échelles dans la sidebar
        echelles = toutesEchelles.filter(e => e.dansBibliotheque !== false);
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
        preview.classList.add('u-hide');
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
        preview.classList.add('u-hide');
        return;
    }

    let html = '';
    echelle.niveaux.forEach(n => {
        html += `<div style="margin-bottom: 4px;"><span style="font-weight: 600;">${n.code || n.nom}</span>: ${n.nom}</div>`;
    });

    contenu.innerHTML = html;
    preview.classList.remove('u-hide');

    // 🆕 FIX #4 (20 jan 2026) : NE PAS sauvegarder ici !
    // Cette fonction est appelée pendant remplirFormulairePratique()
    // Sauvegarder à ce moment écrase les valeurs avec les défauts du formulaire
    // La sauvegarde se fait via les onchange des champs individuels
}

/**
 * 🆕 Beta 95.7 : Peuple le dropdown "Note maximale" avec les niveaux de l'échelle sélectionnée
 * Utilise db.getSync() pour être synchrone (compatible avec remplirFormulairePratique)
 */
function peuplerDropdownNoteMaximaleMat() {
    const select = document.getElementById('mat-ciblee-plafond');
    if (!select) return;

    const echelleId = getValeurChamp('mat-echelle-id');

    if (!echelleId) {
        select.innerHTML = '<option value="">— Sélectionner l\'échelle d\'abord —</option>';
        return;
    }

    const echelles = db.getSync('echellesTemplates', []);
    const echelle = echelles.find(e => e.id === echelleId);

    if (!echelle || !echelle.niveaux) {
        select.innerHTML = '<option value="">— Échelle sans niveaux —</option>';
        return;
    }

    // Construire les options avec code et nom
    let html = '<option value="">— Sélectionner —</option>';
    echelle.niveaux.forEach(n => {
        const label = n.code ? `${n.code} (${n.nom})` : n.nom;
        const value = n.code || n.nom;
        html += `<option value="${value}">${label}</option>`;
    });

    select.innerHTML = html;
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
        conteneur.innerHTML = '<p style="color: var(--gris-clair); font-style: italic;">Aucun type de production défini</p>';
        return;
    }

    let html = '<table class="table-bordures" style="width: 100%;">';
    html += '<thead><tr><th>Nom</th><th>Description</th><th style="width: 80px;">Actions</th></tr></thead>';
    html += '<tbody>';

    typesTravaux.forEach((t, index) => {
        html += `
            <tr>
                <td><input type="text" class="controle-form" value="${t.nom || ''}" data-on-change="modifierTypeTravailMatHandler" data-mat-index="${index}" data-champ="nom"></td>
                <td><input type="text" class="controle-form" value="${t.description || ''}" data-on-change="modifierTypeTravailMatHandler" data-mat-index="${index}" data-champ="description"></td>
                <td style="text-align: center;">
                    <button data-action="supprimerTypeTravailMat" data-param="${index}" class="btn btn-supprimer btn-tres-compact"><img src="icons/icon-trash.svg" alt="" class="btn-delete-icon"></button>
                </td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    conteneur.innerHTML = html;
}

async function ajouterTypeTravailMat() {
    if (!pratiqueEnEditionMateriel) return;

    let configurations = db.getSync(CLE_PRATIQUES_CONFIGURATIONS, []);
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

    let configurations = db.getSync(CLE_PRATIQUES_CONFIGURATIONS, []);
    const index = configurations.findIndex(p => p.id === pratiqueEnEditionMateriel);

    if (index === -1 || !configurations[index].configuration?.typesTravaux) return;

    configurations[index].configuration.typesTravaux[indexType][propriete] = valeur;
    await db.set(CLE_PRATIQUES_CONFIGURATIONS, configurations);
}

async function supprimerTypeTravailMat(indexType) {
    if (!pratiqueEnEditionMateriel) return;

    let configurations = db.getSync(CLE_PRATIQUES_CONFIGURATIONS, []);
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
        conteneur.innerHTML = '<p style="color: var(--gris-clair); font-style: italic;">Aucun forfait défini</p>';
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
            <td><input type="text" class="controle-form" value="${f.lettre || ''}" style="width: 50px;" data-on-change="modifierForfaitMatHandler" data-mat-index="${index}" data-champ="lettre"></td>
            <td><input type="number" class="controle-form" value="${f.note || 0}" style="width: 60px;" data-on-change="modifierForfaitMatHandler" data-mat-index="${index}" data-champ="note"></td>`;

        typesTravaux.forEach(t => {
            const quantite = f.travaux?.[t.id] || 0;
            html += `<td><input type="number" class="controle-form" value="${quantite}" style="width: 50px;" min="0" data-on-change="modifierTravailForfaitMatHandler" data-mat-index="${index}" data-type-id="${t.id}"></td>`;
        });

        html += `<td style="text-align: center;"><button data-action="supprimerForfaitMat" data-param="${index}" class="btn btn-supprimer btn-tres-compact"><img src="icons/icon-trash.svg" alt="" class="btn-delete-icon"></button></td></tr>`;
    });

    html += '</tbody></table>';
    conteneur.innerHTML = html;
}

async function ajouterForfaitMat() {
    if (!pratiqueEnEditionMateriel) return;

    let configurations = db.getSync(CLE_PRATIQUES_CONFIGURATIONS, []);
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

    let configurations = db.getSync(CLE_PRATIQUES_CONFIGURATIONS, []);
    const index = configurations.findIndex(p => p.id === pratiqueEnEditionMateriel);

    if (index === -1 || !configurations[index].configuration?.forfaits) return;

    if (propriete === 'note') valeur = parseInt(valeur) || 0;
    configurations[index].configuration.forfaits[indexForfait][propriete] = valeur;
    await db.set(CLE_PRATIQUES_CONFIGURATIONS, configurations);
}

async function modifierTravailForfaitMat(indexForfait, typeTravailId, valeur) {
    if (!pratiqueEnEditionMateriel) return;

    let configurations = db.getSync(CLE_PRATIQUES_CONFIGURATIONS, []);
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

    let configurations = db.getSync(CLE_PRATIQUES_CONFIGURATIONS, []);
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

    // Générer un ID unique
    const nouvelId = genererIdUnique('pratique_');

    // Auteur CC = identité de l'utilisateur (Plan 1 §4.4)
    const identiteUtilisateur = obtenirIdentiteCCUtilisateur();

    const nouvellePratique = {
        id: nouvelId,
        nom: 'Nouvelle pratique',
        description: '',
        type: 'pan-standards',
        pratiques: ['STD'],
        auteur: identiteUtilisateur,
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
        },
        metadata_cc: {
            auteur_original: identiteUtilisateur,
            date_creation: new Date().toISOString().split('T')[0],
            contributeurs: []
        }
    };

    // 🆕 FIX v3 (20 jan 2026) : localStorage comme source principale
    let configurations = db.getSync(CLE_PRATIQUES_CONFIGURATIONS, []);

    configurations.push(nouvellePratique);

    // 🆕 FIX (20 jan 2026) : Sauvegarde avec vérification explicite
    try {
        await db.set(CLE_PRATIQUES_CONFIGURATIONS, configurations);

        // Vérifier que la sauvegarde a réussi en relisant les données
        const verification = db.getSync(CLE_PRATIQUES_CONFIGURATIONS, []);
        const pratiqueTrouvee = verification.find(p => p.id === nouvelId);

        if (!pratiqueTrouvee) {
            // Sauvegarde échouée - essayer localStorage directement
            console.error('[pratiques-materiel] ❌ Vérification échouée, tentative localStorage...');
            db.setSync(CLE_PRATIQUES_CONFIGURATIONS, configurations);

            // Re-vérifier
            const verif2 = db.getSync(CLE_PRATIQUES_CONFIGURATIONS, []);
            if (!verif2.find(p => p.id === nouvelId)) {
                throw new Error('Sauvegarde impossible dans IndexedDB et localStorage');
            }
        }


        // Rafraîchir la sidebar et charger la nouvelle pratique
        await afficherListePratiquesMateriel();
        await chargerPratiquePourModif(nouvelId);

        if (typeof afficherNotificationSucces === 'function') {
            afficherNotificationSucces('Nouvelle pratique créée et sauvegardée');
        }
    } catch (erreur) {
        console.error('[pratiques-materiel] ❌ Erreur sauvegarde pratique:', erreur);
        if (typeof afficherNotificationErreur === 'function') {
            afficherNotificationErreur('Erreur : la pratique n\'a pas pu être sauvegardée. Veuillez réessayer.');
        } else {
            alert('Erreur : la pratique n\'a pas pu être sauvegardée. Veuillez réessayer.');
        }
    }
}

/* ===============================
   MISE À JOUR DES CHAMPS
   =============================== */

async function mettreAJourNomPratique(nouveauNom) {
    if (!pratiqueEnEditionMateriel) return;

    let configurations = db.getSync(CLE_PRATIQUES_CONFIGURATIONS, []);
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

    let configurations = db.getSync(CLE_PRATIQUES_CONFIGURATIONS, []);
    const index = configurations.findIndex(p => p.id === pratiqueEnEditionMateriel);

    if (index !== -1) {
        configurations[index].description = nouvelleDescription;
        await db.set(CLE_PRATIQUES_CONFIGURATIONS, configurations);
    }
}

async function mettreAJourDisciplinePratique(nouvelleDiscipline) {
    if (!pratiqueEnEditionMateriel) return;

    let configurations = db.getSync(CLE_PRATIQUES_CONFIGURATIONS, []);
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
    let configurations = db.getSync(CLE_PRATIQUES_CONFIGURATIONS, []);
    const original = configurations.find(p => p.id === pratiqueId);

    if (!original) {
        console.error('[pratiques-materiel] Pratique à dupliquer introuvable:', pratiqueId);
        return;
    }

    const copie = JSON.parse(JSON.stringify(original));
    copie.id = genererIdUnique('pratique_');
    copie.nom = `${original.nom} (copie)`;
    copie.auteur = BibliothequeUI.obtenirAuteurActif();
    copie.isDemo = false;
    copie.inspireDe = BibliothequeUI.forgerInspireDe(original);
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
    if (!confirm('Es-tu sûr de vouloir supprimer cette pratique ?')) {
        return;
    }

    let configurations = db.getSync(CLE_PRATIQUES_CONFIGURATIONS, []);
    configurations = configurations.filter(p => p.id !== pratiqueId);
    await db.set(CLE_PRATIQUES_CONFIGURATIONS, configurations);

    pratiqueEnEditionMateriel = null;

    // Rafraîchir et afficher l'accueil
    await afficherListePratiquesMateriel();

    const conteneurEdition = document.getElementById('conteneurEditionPratique');
    const accueil = document.getElementById('accueilPratiques');

    if (conteneurEdition) conteneurEdition.classList.add('u-hide');
    if (accueil) accueil.classList.remove('u-hide');

    if (typeof afficherNotificationSucces === 'function') {
        afficherNotificationSucces('Pratique supprimée');
    }
}

/**
 * Applique une pratique au cours actif
 */
async function appliquerPratiqueAuCours(pratiqueId) {

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
    let configurations = db.getSync(CLE_PRATIQUES_CONFIGURATIONS, []);
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

    // Beta 99.39 : Nommage standardisé via helper unifié (#262 Phase 2)
    const nomFichier = genererNomFichierExport('pratique', {
        nom: pratique.nom,
        inclureLicence: true,
        precisionDate: 'minute'
    });

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nomFichier;
    a.click();
    URL.revokeObjectURL(url);

    if (typeof afficherNotificationSucces === 'function') {
        afficherNotificationSucces('Fichier de partage téléchargé');
    }
}

/**
 * Exporte toutes les pratiques de l'utilisateur
 * MODIFIÉ (8 jan 2026) : Support métadonnées CC comme les autres modules
 */
async function exporterPratiquesUtilisateur() {
    const toutesConfigurations = db.getSync(CLE_PRATIQUES_CONFIGURATIONS, []);

    // ✅ MODIFIÉ (8 jan 2026) : Utiliser détection heuristique pour filtrer démo + importées
    const configurations = typeof filtrerRessourcesNonDemo === 'function'
        ? filtrerRessourcesNonDemo(toutesConfigurations, 'pratique')
        : toutesConfigurations.filter(c => !c.estDemo && !c.auteurOriginal);
    const nbExclues = toutesConfigurations.length - configurations.length;

    if (configurations.length === 0) {
        if (nbExclues > 0) {
            alert(`Aucune pratique personnelle à exporter.\n\n${nbExclues} pratique(s) exclue(s) car elles proviennent du matériel démo ou d'imports de collègues.`);
        } else {
            alert('Aucune pratique à exporter.');
        }
        return;
    }

    // Informer si des pratiques ont été exclues
    let infoExclusion = '';
    if (nbExclues > 0) {
        infoExclusion = ` (${nbExclues} exclue(s) : démo/importées)`;
    }

    // ✅ AJOUTÉ (8 jan 2026) : Demander métadonnées enrichies CC
    const metaEnrichies = await demanderMetadonneesEnrichies(
        'Pratiques de notation',
        `${configurations.length} pratique(s)${infoExclusion}`
    );

    if (!metaEnrichies) {
        return;
    }

    // Emballer avec métadonnées CC enrichies
    const donnees = ajouterMetadonnéesCC(
        { pratiques: configurations },
        'pratiques',
        'Pratiques de notation',
        metaEnrichies
    );

    // Beta 95.3 : Nommage standardisé via helper unifié (horodaté pour éviter écrasement)
    const nomFichier = genererNomFichierExport('pratiques', { inclureLicence: true, precisionDate: 'minute' });

    const blob = new Blob([JSON.stringify(donnees, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nomFichier;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    if (typeof afficherNotificationSucces === 'function') {
        afficherNotificationSucces(`${configurations.length} pratique(s) exportée(s) avec succès`);
    }
}

/**
 * Importer des pratiques depuis un fichier JSON
 * MODIFIÉ (8 jan 2026) : Support métadonnées CC comme les autres modules
 * @param {Event} event - Événement du changement de fichier
 */
async function importerPratiquesUtilisateur(eventOuEl) {
    var target = eventOuEl.target || eventOuEl;
    const file = target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const donnees = JSON.parse(e.target.result);

            // Stocker temporairement dans une variable globale
            window._pratiquesImportEnAttente = donnees;

            // Vérifier licence CC et afficher badge
            const estCC = typeof verifierLicenceCC === 'function' && verifierLicenceCC(donnees);

            // Défense A : badge CC rendu dans une iframe sandbox isolée.
            // Voir js/securite-apercu-sandbox.js et MODELE-MENACES.md §D-01.
            // La classe `modal-import-pratiques` cible la fermeture sans
            // impacter la bibliothèque ouverte en arrière-plan.
            const modal = document.createElement('div');
            modal.classList.add('modal-import-pratiques');
            modal.innerHTML = `
                <div class="modal-js-overlay" style="z-index: 10001;">
                    <div class="modal-js-contenu" style="max-width: 600px; padding: 20px;">
                        <div data-apercu-cc-slot style="margin-bottom: 15px;"></div>
                        <p><strong>Veux-tu importer ces pratiques de notation ?</strong></p>
                        <div style="display: flex; gap: 10px; margin-top: 15px; justify-content: flex-end;">
                            <button class="btn btn-annuler" data-action="fermerModalImportPratiques">Annuler</button>
                            <button class="btn btn-confirmer" data-action="confirmerEtFermerImportPratiques">Importer</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            if (estCC && window.ApercuSandbox && typeof genererBadgeCC === 'function') {
                const slot = modal.querySelector('[data-apercu-cc-slot]');
                if (slot) {
                    window.ApercuSandbox.afficher(slot, genererBadgeCC(donnees.metadata), {
                        hauteurMin: 120,
                        hauteurMax: 500
                    });
                }
            } else if (!estCC && typeof avertirSansLicence === 'function') {
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
 * Confirme l'import et fusionne les pratiques
 * AJOUTÉ (8 jan 2026) : Fonction helper appelée depuis le modal de confirmation
 */
window.confirmerImportPratiques = async function(donnees) {
    try {
        let pratiquesImportees;

        // Extraire le contenu (supporter ancien format et nouveau format CC)
        if (donnees.contenu && donnees.contenu.pratiques) {
            // Nouveau format CC: { metadata, contenu: { pratiques: [...] } }
            pratiquesImportees = donnees.contenu.pratiques;
        } else if (donnees.configurations) {
            // Ancien format: { configurations: [...] }
            pratiquesImportees = donnees.configurations;
        } else {
            throw new Error('Format invalide: pratiques ou configurations non trouvées');
        }

        if (!Array.isArray(pratiquesImportees)) {
            throw new Error('Format invalide: les pratiques doivent être un tableau');
        }

        // ✅ CORRIGÉ (8 janvier 2026) : Ajouter UNIQUEMENT dans bibliothequePratiques
        // L'utilisateur consulte puis choisit lesquelles ajouter à sa barre latérale
        const CLE_BIBLIOTHEQUE = window.CLE_BIBLIOTHEQUE_PRATIQUES || 'bibliothequePratiques';
        let bibliotheque = await db.get(CLE_BIBLIOTHEQUE) || [];

        let nbAjoutees = 0;
        let nbMisesAJour = 0;

        for (const config of pratiquesImportees) {
            // Ajouter avec un nouvel ID si nécessaire
            if (!config.id) {
                config.id = genererIdUnique('PRAT_');
            }

            const indexBiblio = bibliotheque.findIndex(c => c.id === config.id);
            if (indexBiblio >= 0) {
                bibliotheque[indexBiblio] = { ...config, dateAjoutBiblio: bibliotheque[indexBiblio].dateAjoutBiblio };
                nbMisesAJour++;
            } else {
                bibliotheque.push({ ...config, dateAjoutBiblio: new Date().toISOString() });
                nbAjoutees++;
            }
        }

        // Sauvegarder uniquement la bibliothèque
        await db.set(CLE_BIBLIOTHEQUE, bibliotheque);

        // Rafraîchir le modal de bibliothèque s'il est ouvert
        if (document.getElementById('modalBibliothequePratiques')) {
            if (typeof afficherBibliothequePratiques === 'function') {
                await afficherBibliothequePratiques();
            }
        }

        let message = `✅ Import réussi !\n\n`;
        if (nbAjoutees > 0) message += `${nbAjoutees} nouvelle(s) pratique(s) ajoutée(s).\n`;
        if (nbMisesAJour > 0) message += `${nbMisesAJour} pratique(s) mise(s) à jour.\n`;
        message += `\nConsulte « Pratiques disponibles » pour les ajouter à ta barre latérale.`;
        alert(message);

    } catch (error) {
        console.error('Erreur lors de l\'import:', error);
        alert('❌ Erreur lors de l\'import.\n' + error.message);
    }
};

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
        toggleDisplay(contenu, checkbox && checkbox.checked);
    }
}

/**
 * 🆕 #24 : Gère le changement du mode de sélection portfolio
 * Active automatiquement les catégories si "hybride" est sélectionné
 */
function onPortfolioSelectionChangeMat() {
    const select = document.getElementById('mat-portfolio-selection');
    const checkbox = document.getElementById('mat-categories-actif');

    if (select && select.value === 'hybride' && checkbox && !checkbox.checked) {
        checkbox.checked = true;
        toggleCategoriesMat();
    }

    sauvegarderConfigPratiqueMat();
}

/**
 * 🆕 Beta 95.4 : Toggle la visibilité des catégories Sélection/Obligatoires
 */
function toggleCategoriesMat() {
    const checkbox = document.getElementById('mat-categories-actif');
    const details = document.getElementById('mat-categories-details');

    if (details) {
        toggleDisplay(details, checkbox && checkbox.checked);
    }

    // Valider que les pondérations = 100%
    if (checkbox && checkbox.checked) {
        validerPonderationsCategoriesMat();
        // Charger la liste des productions avec checkboxes
        chargerProductionsPourCategories();
        // Calculer les pondérations unitaires
        recalculerPonderationsUnitaires();
    }

    // Sauvegarder automatiquement
    sauvegarderConfigPratiqueMat();
}

/**
 * 🆕 Beta 95.4 : Valide que les pondérations Sélection + Obligatoires = 100%
 */
function validerPonderationsCategoriesMat() {
    const pondSelection = parseInt(document.getElementById('mat-selection-ponderation')?.value) || 0;
    const pondOblig = parseInt(document.getElementById('mat-obligatoires-ponderation')?.value) || 0;
    const total = pondSelection + pondOblig;
    const validation = document.getElementById('mat-categories-validation');

    if (validation) {
        if (total === 100) {
            validation.innerHTML = `<span style="color: var(--vert-principal);">✓ Total : ${total}%</span>`;
        } else if (total < 100) {
            validation.innerHTML = `<span style="color: var(--orange-principal);">⚠ Total : ${total}% (il manque ${100 - total}%)</span>`;
        } else {
            validation.innerHTML = `<span style="color: var(--rouge-principal);">⚠ Total : ${total}% (dépasse de ${total - 100}%)</span>`;
        }
    }
}

/**
 * 🆕 Beta 95.4 : Charge et affiche les listes de checkboxes pour les deux catégories
 */
async function chargerProductionsPourCategories() {
    const listeSelection = document.getElementById('mat-selection-liste');
    const listeObligatoires = document.getElementById('mat-obligatoires-liste');

    if (!listeSelection || !listeObligatoires) return;

    // Charger les productions avec la bonne clé namespacée
    const cleProductions = cle('productions');
    const productions = await db.get(cleProductions) || [];

    // Filtrer : exclure portfolio conteneur et formatifs
    const productionsFiltrables = productions.filter(p =>
        p.type !== 'portfolio' &&
        !p.type?.endsWith('-formatif')
    );

    // Générer HTML pour chaque liste
    listeSelection.innerHTML = genererCheckboxesCategorie(productionsFiltrables, 'selection');
    listeObligatoires.innerHTML = genererCheckboxesCategorie(productionsFiltrables, 'obligatoire');

    // Recalculer les pondérations unitaires
    recalculerPonderationsUnitaires();
}

/**
 * 🆕 Beta 95.4 : Génère le HTML des checkboxes pour une catégorie
 */
function genererCheckboxesCategorie(productions, categorie) {
    if (productions.length === 0) {
        return '<p style="padding: 15px; color: var(--gris-moyen); text-align: center;">Aucune production</p>';
    }

    return productions.map(prod => {
        const checked = prod.categorie === categorie ? 'checked' : '';
        const estDansAutre = prod.categorie && prod.categorie !== categorie;
        const opacite = estDansAutre ? '0.4' : '1';
        const colorCategorie = categorie === 'selection' ? 'var(--accent-primaire)' : 'var(--orange-principal, #e67e22)';

        return `
            <label style="display: flex; align-items: center; gap: 10px; padding: 8px 12px;
                         border-bottom: 1px solid var(--gris-tres-clair); cursor: ${estDansAutre ? 'not-allowed' : 'pointer'};
                         opacity: ${opacite}; transition: background 0.15s;"
                   class="hover-fond-subtil"
                <input type="checkbox" ${checked}
                       data-on-change="toggleProductionCategorieHandler" data-prod-id="${prod.id}" data-categorie="${categorie}"
                       style="width: 16px; height: 16px; accent-color: ${colorCategorie};"
                       ${estDansAutre ? 'disabled' : ''}>
                <span style="flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.9rem;">
                    ${echapperHtml(prod.titre || 'Sans titre')}
                </span>
                ${estDansAutre ? `<small style="color: var(--gris-moyen); white-space: nowrap;">(${prod.categorie === 'selection' ? 'Sélection' : 'Obligatoire'})</small>` : ''}
            </label>
        `;
    }).join('');
}

/**
 * 🆕 Beta 95.4 : Toggle une production dans une catégorie (exclusif)
 */
async function toggleProductionCategorie(prodId, categorie, checked) {
    const cleProductions = cle('productions');
    const productions = await db.get(cleProductions) || [];
    const prod = productions.find(p => p.id === prodId);

    if (prod) {
        prod.categorie = checked ? categorie : null;
        await db.set(cleProductions, productions);

        // Rafraîchir les deux listes (pour gérer l'exclusivité)
        chargerProductionsPourCategories();
    }
}

/**
 * 🆕 Beta 95.4 : Recalcule et affiche les pondérations unitaires
 */
async function recalculerPonderationsUnitaires() {
    // Charger les productions avec la bonne clé namespacée
    const cleProductions = cle('productions');
    const productions = await db.get(cleProductions) || [];

    // Compter productions par catégorie (hors portfolio et formatifs)
    const productionsFiltrables = productions.filter(p =>
        p.type !== 'portfolio' &&
        !p.type?.endsWith('-formatif')
    );
    const nbSelection = productionsFiltrables.filter(p => p.categorie === 'selection').length;
    const nbObligatoires = productionsFiltrables.filter(p => p.categorie === 'obligatoire').length;

    // Lire pondérations globales
    const pondSelection = parseInt(document.getElementById('mat-selection-ponderation')?.value) || 0;
    const pondObligatoires = parseInt(document.getElementById('mat-obligatoires-ponderation')?.value) || 0;
    const nombreARetenir = parseInt(document.getElementById('mat-selection-nombre')?.value) || 1;

    // Calculer pondérations unitaires
    const unitaireSelection = nombreARetenir > 0 ? (pondSelection / nombreARetenir).toFixed(2) : 0;
    const unitaireObligatoires = nbObligatoires > 0 ? (pondObligatoires / nbObligatoires).toFixed(2) : 0;

    // Afficher
    const divSelection = document.getElementById('mat-selection-unitaire');
    const divObligatoires = document.getElementById('mat-obligatoires-unitaire');

    if (divSelection) {
        const infoNb = nbSelection > 0 ? ` (${nbSelection} dans le pool)` : '';
        divSelection.innerHTML = `Pondération unitaire : <strong>${unitaireSelection}%</strong> par production retenue${infoNb}`;
    }
    if (divObligatoires) {
        const infoNb = nbObligatoires > 0 ? ` (${nbObligatoires} cochée${nbObligatoires > 1 ? 's' : ''})` : ' (aucune cochée)';
        divObligatoires.innerHTML = `Pondération unitaire : <strong>${unitaireObligatoires}%</strong> par production${infoNb}`;
    }

    // 🆕 Beta 95.7 : Mise à jour du résumé construction de la note
    const resumeContenu = document.getElementById('mat-categories-resume-contenu');
    if (resumeContenu) {
        const totalProductions = nombreARetenir + nbObligatoires;
        const totalPond = pondSelection + pondObligatoires;

        let html = `<div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">`;
        html += `<span style="color: var(--accent-primaire);"><strong>${nombreARetenir}</strong> meilleure${nombreARetenir > 1 ? 's' : ''}</span>`;
        html += `<span style="color: var(--gris-moyen);">+</span>`;
        html += `<span style="color: var(--orange-principal);"><strong>${nbObligatoires}</strong> obligatoire${nbObligatoires > 1 ? 's' : ''}</span>`;
        html += `<span style="color: var(--gris-moyen);">=</span>`;
        html += `<span style="font-weight: 700; font-size: 1.1rem;"><strong>${totalProductions}</strong> production${totalProductions > 1 ? 's' : ''}</span>`;
        html += `</div>`;

        html += `<div style="margin-top: 8px; font-size: 0.85rem; color: var(--gris-fonce);">`;
        html += `(${pondSelection}% + ${pondObligatoires}% = ${totalPond}%)`;
        if (totalPond !== 100) {
            html += ` <span style="color: var(--orange-principal);">⚠️ ≠ 100%</span>`;
        }
        html += `</div>`;

        resumeContenu.innerHTML = html;
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
        auteur: 'Labo Codex',
        description: 'La note finale dépend du nombre d\'objectifs maîtrisés. Les objectifs « essentiels » doivent TOUS être maîtrisés, sinon la note est plafonnée.'
    },
    'moyenne-ponderee': {
        nom: 'Moyenne pondérée',
        auteur: 'Labo Codex',
        description: 'La note finale est la moyenne des niveaux atteints, pondérée par l\'importance de chaque objectif.'
    },
    'seuils-critiques': {
        nom: 'Seuils critiques',
        auteur: 'Labo Codex',
        description: 'Tous les objectifs doivent atteindre un niveau minimum. Bonus pour les objectifs au niveau supérieur.'
    },
    'holistique': {
        nom: 'Holistique',
        auteur: 'Labo Codex',
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
        configurations = db.getSync(CLE_PRATIQUES_CONFIGURATIONS, []);
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
    // ✅ CORRECTION (4 jan 2026) : Harmoniser avec les noms des formulaires Trimestre
    setValeurChamp('mat-seuils-niveau-reussite', parObjectifs.seuilsCritiques?.seuilReussite || 3);
    setValeurChamp('mat-seuils-note-base', parObjectifs.seuilsCritiques?.noteBaseReussite || 80);
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
        descriptionDiv.classList.remove('u-hide');
    } else if (descriptionDiv) {
        descriptionDiv.classList.add('u-hide');
    }

    // Masquer toutes les sections de mode
    const sections = ['mat-config-mode-comptage', 'mat-config-mode-moyenne-ponderee',
                      'mat-config-mode-seuils-critiques', 'mat-config-mode-holistique'];
    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('u-hide');
    });

    // Afficher la section correspondante
    const sectionId = `mat-config-mode-${mode}`;
    const section = document.getElementById(sectionId);
    if (section) section.classList.remove('u-hide');

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
        conteneur.innerHTML = '<p style="color: var(--gris-clair); font-style: italic;">Aucun objectif défini. Clique sur "+ Ajouter un objectif".</p>';
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
                    data-on-change="modifierObjectifMatHandler" data-mat-index="${index}" data-champ="nom"></td>`;

        if (mode === 'comptage') {
            html += `<td>
                <select class="controle-form" data-on-change="modifierObjectifMatHandler" data-mat-index="${index}" data-champ="type">
                    <option value="complementaire" ${obj.type !== 'essentiel' ? 'selected' : ''}>Complémentaire</option>
                    <option value="essentiel" ${obj.type === 'essentiel' ? 'selected' : ''}>Essentiel</option>
                </select>
            </td>`;
        } else if (mode === 'moyenne-ponderee') {
            html += `<td><input type="number" class="controle-form" value="${obj.ponderation || 0}"
                        min="0" max="100" style="width: 80px;"
                        data-on-change="modifierObjectifMatHandler" data-mat-index="${index}" data-champ="ponderation">%</td>`;
        }

        html += `<td style="text-align: center;">
            <button data-action="supprimerObjectifMat" data-param="${index}" class="btn btn-supprimer btn-tres-compact"><img src="icons/icon-trash.svg" alt="" class="btn-delete-icon"></button>
        </td>`;
        html += '</tr>';
    });

    html += '</tbody></table>';

    // Afficher le total des pondérations pour le mode moyenne-ponderee
    if (mode === 'moyenne-ponderee') {
        const total = objectifs.reduce((sum, obj) => sum + (parseInt(obj.ponderation) || 0), 0);
        const couleur = total === 100 ? 'var(--vert-succes)' : 'var(--rouge-erreur)';
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
        configurations = db.getSync(CLE_PRATIQUES_CONFIGURATIONS, []);
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

    let configurations = db.getSync(CLE_PRATIQUES_CONFIGURATIONS, []);
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
        id: genererIdUnique('obj_'),
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

    let configurations = db.getSync(CLE_PRATIQUES_CONFIGURATIONS, []);
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

    let configurations = db.getSync(CLE_PRATIQUES_CONFIGURATIONS, []);
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
        conteneur.innerHTML = '<p style="color: var(--gris-clair); font-style: italic;">Ajoute des objectifs pour générer la grille de conversion.</p>';
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
                    data-on-change="modifierGrilleConversionMatHandler" data-mat-index="${index}">%</td>
        </tr>`;
    });

    html += '</tbody></table>';
    html += `<button type="button" class="btn btn-secondaire btn-compact" style="margin-top: 10px;"
             data-action="genererGrilleConversionMat">Regénérer la grille</button>`;

    conteneur.innerHTML = html;
}

/**
 * Génère automatiquement la grille de conversion basée sur le nombre d'objectifs
 */
async function genererGrilleConversionMat() {
    if (!pratiqueEnEditionMateriel) return;

    let configurations = db.getSync(CLE_PRATIQUES_CONFIGURATIONS, []);
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

    let configurations = db.getSync(CLE_PRATIQUES_CONFIGURATIONS, []);
    const index = configurations.findIndex(p => p.id === pratiqueEnEditionMateriel);

    if (index === -1) return;

    const grille = configurations[index].configuration?.parObjectifs?.comptage?.grilleConversion;
    if (!grille) return;

    grille[indexLigne].note = parseInt(valeur) || 0;
    await db.set(CLE_PRATIQUES_CONFIGURATIONS, configurations);
}

/* ===============================
   WRAPPERS DELEGATION (Phase 5)
   =============================== */

/** Handler pour modifierTypeTravailMat(index, champ, value) */
function modifierTypeTravailMatHandler(el) {
    var index = parseInt(el.dataset.matIndex);
    var champ = el.dataset.champ;
    modifierTypeTravailMat(index, champ, el.value);
}

/** Handler pour modifierForfaitMat(index, champ, value) */
function modifierForfaitMatHandler(el) {
    var index = parseInt(el.dataset.matIndex);
    var champ = el.dataset.champ;
    modifierForfaitMat(index, champ, el.value);
}

/** Handler pour modifierTravailForfaitMat(index, typeId, value) */
function modifierTravailForfaitMatHandler(el) {
    var index = parseInt(el.dataset.matIndex);
    var typeId = parseInt(el.dataset.typeId);
    modifierTravailForfaitMat(index, typeId, el.value);
}

/** Handler pour modifierObjectifMat(index, champ, value) */
function modifierObjectifMatHandler(el) {
    var index = parseInt(el.dataset.matIndex);
    var champ = el.dataset.champ;
    modifierObjectifMat(index, champ, el.value);
}

/** Handler pour modifierGrilleConversionMat(index, value) */
function modifierGrilleConversionMatHandler(el) {
    var index = parseInt(el.dataset.matIndex);
    modifierGrilleConversionMat(index, el.value);
}

/** Handler pour toggleProductionCategorie(prodId, categorie, checked) */
function toggleProductionCategorieHandler(el) {
    toggleProductionCategorie(el.dataset.prodId, el.dataset.categorie, el.checked);
}

/** Ouvrir le file picker import pratiques */
function ouvrirFilePickerImportPratiques() {
    var input = document.getElementById('fichier-import-pratiques-modal');
    if (input) input.click();
}

/** Fermer modal import pratiques */
function fermerModalImportPratiques() {
    // Cibler le wrapper d'import par sa classe dédiée (pas `.modal-js-overlay`,
    // qui matche aussi la bibliothèque ouverte en arrière-plan dont le parent
    // est `<body>` → `.remove()` effacerait toute l'application).
    var wrapper = document.querySelector('.modal-import-pratiques');
    if (wrapper) wrapper.remove();
    delete window._pratiquesImportEnAttente;
}

/** Confirmer import pratiques + fermer */
function confirmerEtFermerImportPratiques() {
    window.confirmerImportPratiques(window._pratiquesImportEnAttente);
    fermerModalImportPratiques();
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
window.dupliquerEtEditerPratique = dupliquerEtEditerPratique;
window.creerNouvellePratique = creerNouvellePratique;
window.dupliquerPratiqueMateriel = dupliquerPratiqueMateriel;
window.supprimerPratiqueMateriel = supprimerPratiqueMateriel;
window.appliquerPratiqueAuCours = appliquerPratiqueAuCours;
window.sauvegarderPratiqueMateriel = sauvegarderPratiqueMateriel;
window.sauvegarderPratiqueMaterielComplet = sauvegarderPratiqueMaterielComplet;
window.partagerPratiqueMateriel = partagerPratiqueMateriel;
window.exporterPratiquesUtilisateur = exporterPratiquesUtilisateur;
window.importerPratiquesUtilisateur = importerPratiquesUtilisateur;

// Handlers formulaire (préfixe mat-)
window.changerTypePratiqueMat = changerTypePratiqueMat;
window.changerVariantePANStandardsMat = changerVariantePANStandardsMat;
window.mettreAJourNomPratiqueMat = mettreAJourNomPratiqueMat;
window.mettreAJourDescriptionPratiqueMat = mettreAJourDescriptionPratiqueMat;
window.mettreAJourDisciplinePratiqueMat = mettreAJourDisciplinePratiqueMat;
window.sauvegarderConfigPratiqueMat = sauvegarderConfigPratiqueMat;
window.toggleSystemeJetonsMat = toggleSystemeJetonsMat;
window.toggleCategoriesMat = toggleCategoriesMat;  // 🆕 Beta 95.4
window.onPortfolioSelectionChangeMat = onPortfolioSelectionChangeMat;  // 🆕 #24
window.chargerProductionsPourCategories = chargerProductionsPourCategories;  // 🆕 Beta 95.4
window.toggleProductionCategorie = toggleProductionCategorie;  // 🆕 Beta 95.4
window.recalculerPonderationsUnitaires = recalculerPonderationsUnitaires;  // 🆕 Beta 95.4
window.validerPonderationsCategoriesMat = validerPonderationsCategoriesMat;  // 🆕 Beta 95.4

// Échelles
window.chargerDropdownEchellesMat = chargerDropdownEchellesMat;
window.afficherPreviewEchelleMat = afficherPreviewEchelleMat;
window.peuplerDropdownNoteMaximaleMat = peuplerDropdownNoteMaximaleMat;

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

// Fonctions bibliothèque (manquantes avant Phase 5)
window.dupliquerPratiqueBibliotheque = dupliquerPratiqueBibliotheque;
window.supprimerPratiqueDefinitivement = supprimerPratiqueDefinitivement;

// Wrappers délégation (Phase 5)
window.modifierTypeTravailMatHandler = modifierTypeTravailMatHandler;
window.modifierForfaitMatHandler = modifierForfaitMatHandler;
window.modifierTravailForfaitMatHandler = modifierTravailForfaitMatHandler;
window.modifierObjectifMatHandler = modifierObjectifMatHandler;
window.modifierGrilleConversionMatHandler = modifierGrilleConversionMatHandler;
window.toggleProductionCategorieHandler = toggleProductionCategorieHandler;
window.ouvrirFilePickerImportPratiques = ouvrirFilePickerImportPratiques;
window.fermerModalImportPratiques = fermerModalImportPratiques;
window.confirmerEtFermerImportPratiques = confirmerEtFermerImportPratiques;

// Constantes
window.CLE_PRATIQUES_CONFIGURATIONS = CLE_PRATIQUES_CONFIGURATIONS;
window.pratiqueEnEditionMateriel = pratiqueEnEditionMateriel;



})();
