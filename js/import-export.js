/* ===============================
   📦 MODULE: IMPORT/EXPORT DE DONNÉES
   Adapté de index 35-M5
   =============================== */

/**
 * MODULE: import-export.js
 *
 * RÔLE:
 * Gère l'exportation et l'importation sélective de données
 * stockées via db.js sous forme de fichiers JSON
 *
 * FONCTIONNALITÉS:
 * - Export sélectif des clés (backup complet)
 * - Import avec aperçu et confirmation
 * - Sélection "Toutes les clés"
 * - Validation des fichiers JSON
 *
 * NOTE TECHNIQUE:
 * Ce module manipule localStorage directement (pas db.js) car il fait
 * des backups complets et manipule des strings JSON brutes pour export/import.
 *
 * ORIGINE:
 * Code extrait et adapté de index 35-M5 10-10-2025a
 */

/* ===============================
   INITIALISATION DU MODULE
   =============================== */

function initialiserModuleImportExport() {
    console.log('Module import-export initialisé');

    const modalExport = document.getElementById('modalExport');
    const modalImport = document.getElementById('modalImport');

    if (modalExport && modalImport) {
        console.log('   Modales import/export détectées');
    } else {
        console.warn('   Modales import/export manquantes');
    }
}

/* ===============================
   DÉTECTION HEURISTIQUE DES DONNÉES DÉMO
   (6 jan 2026) - Pour filtrer à l'export
   =============================== */

/**
 * Détecte si une ressource est du matériel démo basé sur des patterns connus
 * @param {Object} ressource - La ressource à vérifier
 * @param {string} type - Type de ressource ('grille', 'echelle', 'production', 'cartouche', 'pratique', 'etudiant')
 * @returns {boolean} - True si c'est du matériel démo
 */
function estRessourceDemo(ressource, type) {
    if (!ressource) return false;

    // Si explicitement marqué comme démo
    if (ressource.estDemo || ressource.isDemo) return true;

    // Si importé d'un collègue
    if (ressource.auteurOriginal) return true;

    const nom = (ressource.nom || '').toLowerCase();

    // Patterns communs pour les données démo
    const patternsDemo = [
        'démo', 'demo', '(exemple)', 'exemple',
        'primo primavera', // Auteur des données démo
        '[spe] gabarit' // Gabarits SPE
    ];

    // Vérifier les patterns dans le nom
    if (patternsDemo.some(pattern => nom.includes(pattern))) {
        return true;
    }

    // Détection spécifique par type
    switch (type) {
        case 'etudiant':
            // Étudiants démo : groupe 9999 ou DA commençant par 9999
            if (ressource.groupe === '9999' || ressource.groupe === 9999) return true;
            if (ressource.da && ressource.da.toString().startsWith('9999')) return true;
            if (ressource.coursId && ressource.coursId.includes('9999')) return true;
            break;

        case 'grille':
            // Grilles avec noms spécifiques démo
            if (nom.includes('grille générique') || nom.includes('grille démo')) return true;
            break;

        case 'echelle':
            // Échelles avec noms spécifiques démo
            if (nom.includes('échelle générique') || nom.includes('echelle générique')) return true;
            break;

        case 'cours':
            // Cours démo : groupe 9999
            if (ressource.groupe === '9999' || ressource.groupe === 9999) return true;
            break;
    }

    return false;
}

/**
 * Filtre un tableau pour exclure les ressources démo
 * @param {Array} ressources - Tableau de ressources
 * @param {string} type - Type de ressource
 * @returns {Array} - Ressources filtrées (sans démo ni importées)
 */
function filtrerRessourcesNonDemo(ressources, type) {
    if (!Array.isArray(ressources)) return [];
    return ressources.filter(r => !estRessourceDemo(r, type));
}

/* ===============================
   EXPORT DES DONNÉES
   =============================== */

async function ouvrirModalExport() {
    const modal = document.getElementById('modalExport');
    const liste = document.getElementById('listeClesExport');

    // 🆕 Beta 96.2 : Récupérer toutes les clés depuis IndexedDB (pas seulement localStorage)
    // Cela inclut les données volumineuses qui ne tiennent pas dans localStorage
    let cles = [];
    try {
        cles = await db.keys();
        console.log(`[Export] ${cles.length} clés trouvées dans la base de données`);
    } catch (e) {
        // Fallback vers localStorage si erreur
        console.warn('[Export] Erreur lecture IndexedDB, fallback localStorage:', e);
        cles = Object.keys(localStorage);
    }

    // Construire la liste des clés avec leurs tailles
    let html = '';
    for (const cle of cles) {
        let tailleKo = '?';
        try {
            const valeur = await db.get(cle, null);
            if (valeur !== null) {
                const jsonStr = JSON.stringify(valeur);
                tailleKo = ((cle.length + jsonStr.length) / 1024).toFixed(2);
            }
        } catch (e) {
            // Ignorer les erreurs de lecture
        }

        html += `
            <label style="display: flex; align-items: center; padding: 8px;
                   background: var(--bleu-tres-pale); margin-bottom: 5px;
                   border-radius: 4px; border: 1px solid var(--bleu-pale);
                   transition: all 0.2s; cursor: pointer;">
                <input type="checkbox" class="cle-export" value="${cle}"
                       style="margin-right: 10px; transform: scale(1.2);">
                <span style="flex: 1; font-family: monospace; font-size: 0.9rem;">${cle}</span>
                <span style="color: var(--bleu-leger); font-size: 0.85rem;">${tailleKo} Ko</span>
            </label>
        `;
    }

    liste.innerHTML = html;
    document.getElementById('checkToutesLes').checked = false;
    modal.style.display = 'flex';
}

function fermerModalExport() {
    document.getElementById('modalExport').style.display = 'none';
    document.getElementById('checkToutesLes').checked = false;
}

function toggleToutesLesCles() {
    const checkTous = document.getElementById('checkToutesLes').checked;
    document.querySelectorAll('.cle-export').forEach(cb => {
        cb.checked = checkTous;
    });
}

async function executerExport() {
    const clesSelectionnees = [];
    document.querySelectorAll('.cle-export:checked').forEach(cb => {
        clesSelectionnees.push(cb.value);
    });

    if (clesSelectionnees.length === 0) {
        alert('Aucune clé sélectionnée');
        return;
    }

    const donnees = {};
    let nbDemoExclus = 0;

    // 🆕 Beta 96.2 : Utiliser db.get() pour lire depuis IndexedDB (pas seulement localStorage)
    for (const cle of clesSelectionnees) {
        let valeur = null;

        try {
            // Récupérer la valeur depuis IndexedDB (ou localStorage en fallback)
            valeur = await db.get(cle, null);
        } catch (e) {
            console.warn(`[Export] Erreur lecture clé "${cle}":`, e);
            continue;
        }

        // ✅ AJOUTÉ (6 jan 2026) : Filtrer les données démo avant export
        if (valeur !== null) {
            // Filtrer les étudiants démo (groupe 9999)
            if (cle.includes('groupeEtudiants') && Array.isArray(valeur)) {
                const avant = valeur.length;
                valeur = valeur.filter(e => !estRessourceDemo(e, 'etudiant'));
                nbDemoExclus += avant - valeur.length;
            }

            // Filtrer les cours démo (groupe 9999)
            if (cle === 'listeCours' && Array.isArray(valeur)) {
                const avant = valeur.length;
                valeur = valeur.filter(c => !estRessourceDemo(c, 'cours'));
                nbDemoExclus += avant - valeur.length;
            }

            // Filtrer les grilles démo
            if (cle === 'grillesTemplates' && Array.isArray(valeur)) {
                const avant = valeur.length;
                valeur = filtrerRessourcesNonDemo(valeur, 'grille');
                nbDemoExclus += avant - valeur.length;
            }

            // Filtrer les échelles démo
            if (cle === 'echellesTemplates' && Array.isArray(valeur)) {
                const avant = valeur.length;
                valeur = filtrerRessourcesNonDemo(valeur, 'echelle');
                nbDemoExclus += avant - valeur.length;
            }

            // Stocker la valeur sérialisée en JSON
            donnees[cle] = JSON.stringify(valeur);
        }
    }

    if (nbDemoExclus > 0) {
        console.log(`📦 Export: ${nbDemoExclus} élément(s) démo exclu(s)`);
    }

    const json = JSON.stringify(donnees, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    const dateStr = new Date().toISOString().slice(0, 10);

    // Inclure le nom de l'utilisateur dans le fichier
    // ✅ CORRECTION (Beta 95.5) : Vérifier que auteur est une chaîne
    const infoCours = db.getSync ? db.getSync('infoCours', {}) : {};
    const auteurBrut = infoCours?.enseignant;
    const auteur = (typeof auteurBrut === 'string') ? auteurBrut : '';
    const auteurNettoye = auteur ? auteur.replace(/[^a-z0-9]/gi, '-').toLowerCase() : '';
    const nomFichier = auteurNettoye
        ? `sauvegarde-${auteurNettoye}-${dateStr}.json`
        : `sauvegarde-monitorage-${dateStr}.json`;
    a.download = nomFichier;
    a.click();
    URL.revokeObjectURL(url);
    
    fermerModalExport();
    
    if (typeof afficherNotificationSucces === 'function') {
        afficherNotificationSucces(`Export réussi : ${clesSelectionnees.length} clé(s) exportée(s)`);
    } else {
        console.log(`Export réussi: ${clesSelectionnees.length} clés`);
    }
}

/* ===============================
   IMPORT DES DONNÉES
   =============================== */

let donneesImportEnAttente = null;

function ouvrirModalImport() {
    const modal = document.getElementById('modalImport');
    document.getElementById('fichierImport').value = '';
    document.getElementById('apercu-import').style.display = 'none';
    document.getElementById('btnExecuterImport').disabled = true;
    document.getElementById('btnExecuterImport').style.opacity = '0.5';
    donneesImportEnAttente = null;
    modal.style.display = 'flex';
    
    document.getElementById('fichierImport').onchange = previsualiserImport;
}

function fermerModalImport() {
    document.getElementById('modalImport').style.display = 'none';
    donneesImportEnAttente = null;
}

function previsualiserImport(event) {
    const fichier = event.target.files[0];
    if (!fichier) return;

    const nomFichier = fichier.name;

    const lecteur = new FileReader();
    lecteur.onload = function(e) {
        // Étape 1 : Parser le JSON
        let donnees;
        try {
            donnees = JSON.parse(e.target.result);
        } catch (err) {
            alert('Fichier JSON invalide.\n\nVérifiez que le fichier est bien un export Monitorage.');
            console.error('Erreur de parsing JSON:', err);
            return;
        }

        // Étape 2 : Traiter les données (erreurs séparées)
        try {
            // 🆕 BETA 95.1 : Fermer l'ancien modal et ouvrir le nouveau avec analyse
            fermerModalImport();

            // Stocker les données pour l'import
            configCompleteEnAttente = donnees;

            // Détecter le format et afficher le modal approprié
            const format = detecterFormatConfig(donnees);

            if (format === 'configuration-complete') {
                // Format Beta 91+ avec métadonnées
                afficherModalPreviewConfigComplete(donnees);
            } else {
                // Format localStorage brut → nouveau modal avec checkboxes
                configCompleteEnAttente._format = 'localStorage-brut';
                afficherModalPreviewLocalStorageBrut(donnees, nomFichier);
            }
        } catch (err) {
            alert('Erreur lors de l\'analyse du fichier.\n\nDétails dans la console (F12).');
            console.error('Erreur analyse import:', err);
        }
    };
    lecteur.readAsText(fichier);
}

async function executerImport() {
    if (!donneesImportEnAttente) return;

    if (!confirm('Confirmer l\'importation ? Les données existantes seront écrasées pour les clés importées.')) {
        return;
    }

    try {
        // ✅ CORRECTION: Utiliser db.set() (async/IndexedDB) au lieu de db.setSync()
        // Pour éviter QuotaExceededError sur localStorage avec gros fichiers
        const cles = Object.keys(donneesImportEnAttente);
        let nbCles = 0;

        for (const cle of cles) {
            let valeur = donneesImportEnAttente[cle];

            // ✅ CORRECTION: Parser les strings JSON (backups de l'ancienne version localStorage)
            // Si la valeur est une string JSON, la parser avant de stocker
            if (typeof valeur === 'string') {
                try {
                    valeur = JSON.parse(valeur);
                } catch (e) {
                    // Si ce n'est pas du JSON valide, garder la string telle quelle
                    console.log(`[Import] Clé "${cle}" n'est pas du JSON, stockage comme string`);
                }
            }

            await db.set(cle, valeur);
            nbCles++;
        }

        // Détecter si ce sont les données de démo (pour déclencher tutoriel)
        const clesDemoPresentes = ['groupeEtudiants', 'artefacts', 'modalitesEvaluation'].every(cle =>
            donneesImportEnAttente.hasOwnProperty(cle)
        );

        if (clesDemoPresentes && donneesImportEnAttente.groupeEtudiants &&
            Array.isArray(donneesImportEnAttente.groupeEtudiants) &&
            donneesImportEnAttente.groupeEtudiants.length > 0) {
            // Marquer que les données de démo ont été chargées
            await db.set('donnees_demo_chargees', true);
        }

        // ✅ CRITIQUE: Synchroniser le cache localStorage avec IndexedDB
        // Les modules utilisent db.getSync() qui lit depuis le cache localStorage
        console.log('🔄 Synchronisation du cache localStorage...');
        await db.syncToLocalStorageCache();
        console.log('✅ Cache synchronisé');

        fermerModalImport();

        if (typeof afficherNotificationSucces === 'function') {
            afficherNotificationSucces(`Import réussi : ${nbCles} clé(s) importée(s)`);
        } else {
            console.log(`Import réussi: ${nbCles} clés`);
        }

        if (confirm('Import terminé ! Recharger la page pour appliquer les changements ?')) {
            location.reload();
        }
    } catch (erreur) {
        console.error('❌ Erreur lors de l\'import:', erreur);
        alert(`Erreur lors de l'import : ${erreur.message}`);
        fermerModalImport();
    }
}

/* ===============================
   RÉINITIALISATION
   =============================== */

function reinitialiserDonnees() {
    if (!confirm('ATTENTION : Cette action va effacer TOUTES les données de l\'application.\n\nEs-tu sûr de vouloir continuer ?')) {
        return;
    }

    if (!confirm('Cette action est IRRÉVERSIBLE.\n\nAs-tu exporté tes données avant de continuer ?')) {
        return;
    }

    const confirmation = prompt('Pour confirmer, tape "EFFACER" en majuscules :');

    if (confirmation !== 'EFFACER') {
        alert('Réinitialisation annulée');
        return;
    }

    try {
        // Effacer localStorage
        localStorage.clear();

        // Effacer IndexedDB (async)
        if (typeof db !== 'undefined' && typeof db.clear === 'function') {
            db.clear().then(() => {
                alert('Toutes les données ont été effacées.\n\nLa page va se recharger.');
                location.reload();
            }).catch(erreur => {
                console.error('Erreur lors de l\'effacement IndexedDB:', erreur);
                alert('Toutes les données ont été effacées.\n\nLa page va se recharger.');
                location.reload();
            });
        } else {
            alert('Toutes les données ont été effacées.\n\nLa page va se recharger.');
            location.reload();
        }
    } catch (erreur) {
        console.error('Erreur lors de la réinitialisation:', erreur);
        alert('Erreur lors de la réinitialisation.');
    }
}

/* ===============================
   IMPORT CONFIGURATION COMPLÈTE (Beta 91)
   =============================== */

let configCompleteEnAttente = null;

/**
 * Ouvre le sélecteur de fichier pour importer une configuration complète
 */
function ouvrirImportConfigComplete() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = previsualiserConfigComplete;
    input.click();
}

/**
 * Prévisualise une configuration complète avant import
 * Supporte deux formats :
 * - Nouveau format (Beta 91+) : { metadata: { type: 'configuration-complete' }, contenu: {...} }
 * - Ancien format (localStorage brut) : { modalitesEvaluation: ..., bibliothequeGrilles: ..., ... }
 *
 * @param {Event} event - Événement de sélection de fichier
 */
function previsualiserConfigComplete(event) {
    const fichier = event.target.files[0];
    if (!fichier) return;

    const lecteur = new FileReader();
    lecteur.onload = function(e) {
        try {
            const config = JSON.parse(e.target.result);

            // 🆕 BETA 95.1 : Détecter le format du fichier
            const formatDetecte = detecterFormatConfig(config);

            if (formatDetecte === 'configuration-complete') {
                // Nouveau format (Beta 91+)
                if (!config.contenu) {
                    alert('Fichier invalide. La structure de la configuration est incorrecte.');
                    return;
                }
                configCompleteEnAttente = config;
                configCompleteEnAttente._format = 'configuration-complete';
                afficherModalPreviewConfigComplete(config);

            } else if (formatDetecte === 'localStorage-brut') {
                // Ancien format (export localStorage brut)
                configCompleteEnAttente = config;
                configCompleteEnAttente._format = 'localStorage-brut';
                afficherModalPreviewLocalStorageBrut(config, fichier.name);

            } else {
                alert('Fichier non reconnu.\n\nFormats acceptés :\n• Configuration complète (Beta 91+)\n• Export localStorage brut');
            }

        } catch (err) {
            alert('Erreur lors de la lecture du fichier JSON.\n\n' + err.message);
            console.error('Erreur parsing JSON:', err);
        }
    };
    lecteur.readAsText(fichier);
}

/**
 * Détecte le format d'un fichier de configuration
 * @param {Object} config - Objet JSON parsé
 * @returns {string} 'configuration-complete' | 'localStorage-brut' | 'inconnu'
 */
function detecterFormatConfig(config) {
    // Format nouveau (Beta 91+)
    if (config.metadata && config.metadata.type === 'configuration-complete') {
        return 'configuration-complete';
    }

    // Format localStorage brut : contient des clés typiques de l'application
    const clesBrut = ['modalitesEvaluation', 'infoCours', 'bibliothequeGrilles', 'echellesTemplates',
                      'grillesTemplates', 'productionsCours', 'pratiquesConfigurables', 'cadreCalendrier'];
    const clesPresentes = Object.keys(config);
    const nbClesReconnues = clesBrut.filter(cle => clesPresentes.includes(cle)).length;

    if (nbClesReconnues >= 2 || clesPresentes.some(c => c.includes('_') && c.includes('2026'))) {
        return 'localStorage-brut';
    }

    return 'inconnu';
}

/**
 * Affiche le modal de prévisualisation pour un export localStorage brut
 * Propose deux modes : import complet OU fusion avec bibliothèques
 * @param {Object} config - Données brutes localStorage
 * @param {string} nomFichier - Nom du fichier importé
 */
// Variable globale pour stocker l'analyse en cours
let analyseImportEnCours = null;

/**
 * Toggle toutes les checkboxes d'une catégorie
 * @param {string} category - ID de la catégorie (grilles, echelles, etc.)
 * @param {boolean} checked - État à appliquer
 */
function toggleCategoryItems(category, checked) {
    const items = document.querySelectorAll(`.import-item-${category}`);
    items.forEach(cb => {
        cb.checked = checked;
    });
}

// Exposer globalement
window.toggleCategoryItems = toggleCategoryItems;

/**
 * 🆕 Beta 96.2 : Toggle l'affichage des checkboxes données perso quand l'utilisateur confirme
 * @param {boolean} checked - État de la checkbox "C'est ma propre sauvegarde"
 */
function toggleDonneesPersoImport(checked) {
    const container = document.getElementById('checkboxesDonneesPerso');
    if (container) {
        container.style.display = checked ? 'block' : 'none';
    }
    // Stocker dans l'analyse en cours pour utilisation lors de l'import
    if (analyseImportEnCours) {
        analyseImportEnCours.confirmeMaSauvegarde = checked;
    }
}

// Exposer globalement
window.toggleDonneesPersoImport = toggleDonneesPersoImport;

function afficherModalPreviewLocalStorageBrut(config, nomFichier) {
    const cles = Object.keys(config);
    const nbCles = cles.length;

    // Calculer la taille approximative
    let tailleTotale = 0;
    Object.values(config).forEach(v => {
        tailleTotale += (typeof v === 'string' ? v.length : JSON.stringify(v).length) * 2;
    });
    const tailleKo = (tailleTotale / 1024).toFixed(1);

    // Analyser les ressources en détail
    const analyse = analyserRessourcesDetaillees(config);
    analyseImportEnCours = analyse;

    // ✅ CORRIGÉ (6 jan 2026) : Lire le nom enseignant dans tous les formats possibles
    const extraireNomEnseignant = (infoCours) => {
        if (!infoCours) return '';
        // Format 1: prenomEnseignant + nomEnseignant (champs séparés)
        if (infoCours.prenomEnseignant || infoCours.nomEnseignant) {
            return `${infoCours.prenomEnseignant || ''} ${infoCours.nomEnseignant || ''}`.trim().toLowerCase();
        }
        // Format 2: enseignant comme chaîne
        if (typeof infoCours.enseignant === 'string') {
            return infoCours.enseignant.toLowerCase().trim();
        }
        // Format 3: enseignant.prenom + enseignant.nom (objet)
        if (infoCours.enseignant?.prenom || infoCours.enseignant?.nom) {
            return `${infoCours.enseignant.prenom || ''} ${infoCours.enseignant.nom || ''}`.trim().toLowerCase();
        }
        return '';
    };

    // Détecter si l'import vient d'un collègue ou de soi-même
    const infoCoursActuel = db.getSync('infoCours', {}) || {};
    const utilisateurActuel = extraireNomEnseignant(infoCoursActuel);

    // Chercher l'auteur dans le fichier importé
    let auteurImport = '';
    if (config.infoCours) {
        try {
            const infoCoursImport = typeof config.infoCours === 'string'
                ? JSON.parse(config.infoCours)
                : config.infoCours;
            auteurImport = extraireNomEnseignant(infoCoursImport);
        } catch (e) { /* ignore */ }
    }

    // Déterminer si c'est un collègue (auteurs différents ET non vides)
    const estCollègue = auteurImport && utilisateurActuel && auteurImport !== utilisateurActuel;

    // 🆕 Beta 96.2 : Logique améliorée pour la source
    // - Si auteur identifié dans fichier mais pas de profil local → restauration sur nouvel appareil (OK)
    // - Si profil local mais pas d'auteur dans fichier → fichier ancien ou d'un collègue (blocage)
    // - Si les deux vides → vraiment inconnu (blocage)
    const sourceInconnue = !auteurImport; // Seulement si le FICHIER n'a pas d'auteur
    const restaurationNouvelAppareil = auteurImport && !utilisateurActuel;

    const sourceLabel = estCollègue
        ? `Configuration de ${auteurImport.split(' ')[0] || 'collègue'}`
        : restaurationNouvelAppareil
            ? `Restauration de ${auteurImport.split(' ')[0] || 'ta sauvegarde'}`
            : sourceInconnue
                ? 'Source inconnue'
                : 'Sauvegarde personnelle';

    // Stocker pour utilisation dans executerImportSelectif
    analyseImportEnCours.estCollègue = estCollègue;
    analyseImportEnCours.auteurImport = auteurImport;
    analyseImportEnCours.sourceInconnue = sourceInconnue;
    analyseImportEnCours.restaurationNouvelAppareil = restaurationNouvelAppareil;

    // ✅ MODIFIÉ (6 jan 2026) : Checkbox individuelle par élément
    const genererLigneRessource = (id, label, count, items) => {
        if (count === 0) return '';

        // Générer les checkboxes individuelles pour chaque item
        const itemsHTML = items.map((item, index) => {
            const itemId = item.id || `${id}_${index}`;
            const nomAffiche = item.nom || 'Sans nom';
            // Ajouter l'auteur original si présent
            const auteurInfo = item.auteurOriginal ? ` <span style="color: #999; font-size: 0.75rem;">(${item.auteurOriginal})</span>` : '';

            return `
                <label style="display: flex; align-items: center; gap: 8px; padding: 6px 10px;
                       background: #fafafa; border-radius: 4px; margin: 4px 0; cursor: pointer;
                       border: 1px solid #eee; transition: all 0.15s;"
                       onmouseover="this.style.borderColor='#28a745'; this.style.background='#f0fff4';"
                       onmouseout="this.style.borderColor='#eee'; this.style.background='#fafafa';">
                    <input type="checkbox" class="import-item import-item-${id}" data-category="${id}" data-item-id="${itemId}"
                           style="transform: scale(1.1); accent-color: #28a745;">
                    <span style="font-size: 0.85rem;">${nomAffiche}${auteurInfo}</span>
                </label>
            `;
        }).join('');

        return `
            <div style="background: white; border-radius: 6px; margin-bottom: 12px;
                   border: 1px solid #e0e0e0; overflow: hidden;">
                <!-- En-tête de catégorie avec checkbox "tout sélectionner" -->
                <label style="display: flex; align-items: center; gap: 10px; padding: 12px;
                       background: #f8f9fa; cursor: pointer; border-bottom: 1px solid #e0e0e0;"
                       onmouseover="this.style.background='#e9ecef'" onmouseout="this.style.background='#f8f9fa'">
                    <input type="checkbox" id="import-${id}" class="import-category-toggle"
                           data-category="${id}"
                           onchange="toggleCategoryItems('${id}', this.checked)"
                           style="transform: scale(1.2); accent-color: #28a745;">
                    <div style="flex: 1;">
                        <strong style="font-size: 0.95rem;">${label}</strong>
                        <span style="color: #28a745; font-size: 0.85rem; margin-left: 8px;">(${count})</span>
                        <span style="color: #999; font-size: 0.75rem; margin-left: 8px;">tout cocher/décocher</span>
                    </div>
                </label>
                <!-- Liste des items individuels -->
                <div style="padding: 8px 12px; max-height: 200px; overflow-y: auto;">
                    ${itemsHTML}
                </div>
            </div>
        `;
    };

    // Générer les lignes de données avec checkboxes
    const genererLigneDonnee = (id, label, info) => {
        if (!info) return '';
        return `
            <label style="display: flex; align-items: center; gap: 10px; padding: 10px;
                   background: white; border-radius: 6px; margin-bottom: 8px; cursor: pointer;
                   border: 1px solid #e0e0e0; transition: all 0.2s;"
                   onmouseover="this.style.borderColor='#6c757d'" onmouseout="this.style.borderColor='#e0e0e0'">
                <input type="checkbox" id="import-${id}"
                       style="transform: scale(1.2); accent-color: #6c757d;">
                <div style="flex: 1;">
                    <strong style="font-size: 0.95rem;">${label}</strong>
                    <span style="color: #666; font-size: 0.85rem; margin-left: 8px;">${info}</span>
                </div>
            </label>
        `;
    };

    const modalHTML = `
        <div id="modalPreviewConfigComplete" style="display: flex; position: fixed; top: 0; left: 0;
             width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 10000;
             align-items: center; justify-content: center;">
            <div style="background: white; border-radius: 10px; padding: 30px; max-width: 650px;
                 width: 90%; max-height: 90vh; overflow-y: auto;">

                <h2 style="margin-top: 0; color: var(--bleu-moyen); border-bottom: 2px solid var(--bleu-pale);
                     padding-bottom: 10px;">
                    Contenu du fichier
                </h2>

                <!-- Info fichier + source -->
                <div style="background: #f8f9fa; border-radius: 8px; padding: 12px; margin-bottom: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <strong style="font-size: 0.95rem;">${nomFichier}</strong>
                        <span style="background: ${estCollègue ? '#fff3cd' : sourceInconnue ? '#e9ecef' : '#d4edda'}; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem;">
                            ${sourceLabel}
                        </span>
                    </div>
                    <p style="margin: 4px 0 0 0; font-size: 0.8rem; color: #666;">
                        ${nbCles} éléments · ~${tailleKo} Ko
                    </p>
                </div>

                ${sourceInconnue ? `
                <div style="background: #e9ecef; border-radius: 8px; padding: 12px; margin-bottom: 15px; border-left: 4px solid #6c757d;">
                    <p style="margin: 0; font-size: 0.85rem; color: #495057;">
                        <strong>Auteur non identifié</strong><br>
                        ${!utilisateurActuel
                            ? 'Configure ton nom dans Réglages > Trimestre > Cours pour identifier tes fichiers.'
                            : 'Le fichier importé ne contient pas d\'information sur son auteur.'}
                    </p>
                </div>
                ` : ''}

                <!-- Instruction -->
                <p style="font-size: 0.95rem; color: #333; margin-bottom: 15px;">
                    <strong>Coche ce que tu veux importer :</strong>
                </p>

                <!-- SECTION: Ressources pédagogiques -->
                ${analyse.totalRessources > 0 ? `
                <div style="margin-bottom: 20px;">
                    <h3 style="font-size: 0.9rem; color: #28a745; margin: 0 0 10px 0; display: flex; align-items: center; gap: 8px;">
                        <span style="background: #d4edda; padding: 4px 8px; border-radius: 4px;">Ressources pédagogiques</span>
                        <span style="font-size: 0.8rem; color: #666; font-weight: normal;">Ajoutées à tes bibliothèques</span>
                    </h3>
                    <div style="background: #f0fff4; border-radius: 8px; padding: 12px;">
                        ${genererLigneRessource('pratiques', 'Pratiques de notation', analyse.ressources.pratiques.count, analyse.ressources.pratiques.items)}
                        ${genererLigneRessource('grilles', 'Grilles de critères', analyse.ressources.grilles.count, analyse.ressources.grilles.items)}
                        ${genererLigneRessource('echelles', 'Échelles de performance', analyse.ressources.echelles.count, analyse.ressources.echelles.items)}
                        ${genererLigneRessource('productions', 'Productions', analyse.ressources.productions.count, analyse.ressources.productions.items)}
                        ${analyse.ressources.cartouches.count > 0 ? genererLigneRessource('cartouches', 'Cartouches de rétroaction', analyse.ressources.cartouches.count, analyse.ressources.cartouches.items.map(c => ({nom: c.count + ' pour grille ' + c.grilleId.substring(0,8)}))) : ''}
                    </div>
                </div>
                ` : ''}

                <!-- SECTION: Données du cours -->
                ${analyse.totalDonnees > 0 ? `
                <div style="margin-bottom: 20px;">
                    <h3 style="font-size: 0.9rem; color: #6c757d; margin: 0 0 10px 0; display: flex; align-items: center; gap: 8px;">
                        <span style="background: #e9ecef; padding: 4px 8px; border-radius: 4px;">Données du cours</span>
                        <span style="font-size: 0.8rem; color: #999; font-weight: normal;">Protégées</span>
                    </h3>

                    <!-- 🆕 Beta 96.2 : Données personnelles importables SI c'est sa propre sauvegarde ou restauration -->
                    ${(analyse.donnees.etudiants.count > 0 || analyse.donnees.presences.count > 0 || analyse.donnees.evaluations.count > 0) ? `
                    ${estCollègue ? `
                    <!-- Fichier d'un collègue : bloquer import données perso (pas de bypass possible) -->
                    <div style="background: #f8d7da; border-radius: 8px; padding: 15px; margin-bottom: 10px; border-left: 4px solid #dc3545;">
                        <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 10px;">
                            ${analyse.donnees.etudiants.count > 0 ? `<span style="background: #f5c6cb; padding: 4px 10px; border-radius: 4px; font-size: 0.85rem; color: #721c24;">Étudiants (${analyse.donnees.etudiants.count})</span>` : ''}
                            ${analyse.donnees.presences.count > 0 ? `<span style="background: #f5c6cb; padding: 4px 10px; border-radius: 4px; font-size: 0.85rem; color: #721c24;">Présences (${analyse.donnees.presences.count} dates)</span>` : ''}
                            ${analyse.donnees.evaluations.count > 0 ? `<span style="background: #f5c6cb; padding: 4px 10px; border-radius: 4px; font-size: 0.85rem; color: #721c24;">Notes (${analyse.donnees.evaluations.cles.length} ensemble(s))</span>` : ''}
                        </div>
                        <p style="margin: 0; font-size: 0.85rem; color: #721c24;">
                            <strong>Partage impossible</strong> – Ces données appartiennent à un collègue et ne peuvent pas être importées.
                        </p>
                    </div>
                    ` : (sourceInconnue && !restaurationNouvelAppareil) ? `
                    <!-- Source inconnue : permettre bypass avec confirmation -->
                    <div id="sectionDonneesPerso" style="background: #fff3cd; border-radius: 8px; padding: 15px; margin-bottom: 10px; border-left: 4px solid #ffc107;">
                        <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 10px;">
                            ${analyse.donnees.etudiants.count > 0 ? `<span style="background: #ffeeba; padding: 4px 10px; border-radius: 4px; font-size: 0.85rem; color: #856404;">Étudiants (${analyse.donnees.etudiants.count})</span>` : ''}
                            ${analyse.donnees.presences.count > 0 ? `<span style="background: #ffeeba; padding: 4px 10px; border-radius: 4px; font-size: 0.85rem; color: #856404;">Présences (${analyse.donnees.presences.count} dates)</span>` : ''}
                            ${analyse.donnees.evaluations.count > 0 ? `<span style="background: #ffeeba; padding: 4px 10px; border-radius: 4px; font-size: 0.85rem; color: #856404;">Notes (${analyse.donnees.evaluations.cles.length} ensemble(s))</span>` : ''}
                        </div>
                        <p style="margin: 0 0 12px 0; font-size: 0.85rem; color: #856404;">
                            <strong>Source non identifiée</strong> – Le fichier ne contient pas d'information sur son auteur.
                        </p>
                        <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; padding: 10px; background: white; border-radius: 6px; border: 2px solid #ffc107;">
                            <input type="checkbox" id="confirmMaSauvegarde" onchange="toggleDonneesPersoImport(this.checked)" style="width: 20px; height: 20px;">
                            <span style="font-size: 0.9rem; color: #333;"><strong>C'est ma propre sauvegarde</strong> – Je confirme que ce fichier m'appartient</span>
                        </label>
                        <div id="checkboxesDonneesPerso" style="display: none; margin-top: 12px; padding: 12px; background: #d4edda; border-radius: 6px;">
                            ${analyse.donnees.etudiants.count > 0 ? genererLigneDonnee('etudiants', 'Étudiants', analyse.donnees.etudiants.count + ' étudiant(s)') : ''}
                            ${analyse.donnees.presences.count > 0 ? genererLigneDonnee('presences', 'Présences', analyse.donnees.presences.count + ' date(s)') : ''}
                            ${analyse.donnees.evaluations.count > 0 ? genererLigneDonnee('evaluations', 'Notes', analyse.donnees.evaluations.cles.length + ' ensemble(s)') : ''}
                        </div>
                    </div>
                    ` : `
                    <!-- Sauvegarde personnelle : permettre import données perso -->
                    <div style="background: #d4edda; border-radius: 8px; padding: 12px; margin-bottom: 10px;">
                        ${analyse.donnees.etudiants.count > 0 ? genererLigneDonnee('etudiants', 'Étudiants', analyse.donnees.etudiants.count + ' étudiant(s)') : ''}
                        ${analyse.donnees.presences.count > 0 ? genererLigneDonnee('presences', 'Présences', analyse.donnees.presences.count + ' date(s)') : ''}
                        ${analyse.donnees.evaluations.count > 0 ? genererLigneDonnee('evaluations', 'Notes', analyse.donnees.evaluations.cles.length + ' ensemble(s)') : ''}
                    </div>
                    <p style="font-size: 0.75rem; color: #28a745; margin: 8px 0 0 12px;">
                        ✓ Sauvegarde personnelle détectée – tes données peuvent être restaurées
                    </p>
                    `}
                    ` : ''}

                    <!-- Configuration du cours (importable sauf si collègue) -->
                    ${analyse.donnees.configuration.present && !estCollègue ? `
                    <div style="background: #f8f9fa; border-radius: 8px; padding: 12px;">
                        ${genererLigneDonnee('configuration', 'Configuration du cours', analyse.donnees.configuration.cles.join(', '))}
                    </div>
                    <p style="font-size: 0.75rem; color: #dc3545; margin: 8px 0 0 12px;">
                        Attention : cette option remplacera ta configuration actuelle
                    </p>
                    ` : ''}
                </div>
                ` : ''}

                <!-- 🆕 Beta 96.2 : SECTION: Entités structurelles -->
                ${(analyse.entites?.groupesCours?.count > 0 || analyse.entites?.horaires?.count > 0 || analyse.entites?.enseignants?.present) ? `
                <div style="margin-bottom: 20px;">
                    <h3 style="font-size: 0.9rem; color: #17a2b8; margin: 0 0 10px 0; display: flex; align-items: center; gap: 8px;">
                        <span style="background: #d1ecf1; padding: 4px 8px; border-radius: 4px;">Structure du trimestre</span>
                        <span style="font-size: 0.8rem; color: #666; font-weight: normal;">Groupe-cours, horaires, enseignants</span>
                    </h3>
                    <div style="background: #e8f4f8; border-radius: 8px; padding: 12px;">
                        ${analyse.entites.groupesCours.count > 0 ? genererLigneDonnee('groupesCours', 'Groupe-cours', analyse.entites.groupesCours.count + ' groupe(s) - ' + analyse.entites.groupesCours.cles.join(', ')) : ''}
                        ${analyse.entites.horaires.count > 0 ? genererLigneDonnee('horaires', 'Horaires', analyse.entites.horaires.count + ' horaire(s) - ' + analyse.entites.horaires.cles.join(', ')) : ''}
                        ${analyse.entites.enseignants.present ? genererLigneDonnee('enseignants', 'Enseignants', analyse.entites.enseignants.count + ' profil(s)') : ''}
                    </div>
                    <p style="font-size: 0.75rem; color: #17a2b8; margin: 8px 0 0 12px;">
                        Ces données sont essentielles pour que l'application fonctionne correctement
                    </p>
                </div>
                ` : ''}

                ${analyse.totalRessources === 0 && analyse.totalDonnees === 0 && !(analyse.entites?.groupesCours?.count > 0) ? `
                <div style="background: #fff3cd; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 20px;">
                    <p style="margin: 0; color: #856404;">Aucune ressource reconnue dans ce fichier.</p>
                </div>
                ` : ''}

                <!-- Boutons -->
                <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;
                     padding-top: 15px; border-top: 1px solid #eee;">
                    <button onclick="fermerModalPreviewConfigComplete()"
                            style="padding: 10px 20px; background: white; color: var(--gris-fonce);
                                   border: 1px solid var(--gris-clair); border-radius: 4px;
                                   cursor: pointer; font-size: 0.95rem;">
                        Annuler
                    </button>
                    <button onclick="executerImportSelectif()"
                            style="padding: 10px 24px; background: #28a745; color: white;
                                   border: none; border-radius: 4px; cursor: pointer; font-size: 0.95rem;
                                   font-weight: 500;"
                            ${analyse.totalRessources === 0 && analyse.totalDonnees === 0 && !(analyse.entites?.groupesCours?.count > 0 || analyse.entites?.horaires?.count > 0 || analyse.entites?.enseignants?.present) ? 'disabled style="opacity:0.5"' : ''}>
                        Importer la sélection
                    </button>
                </div>
            </div>
        </div>
    `;

    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer);
}

/**
 * Analyse détaillée complète d'un export localStorage
 * Retourne les détails pour ressources pédagogiques ET données du cours
 * @param {Object} config - Données brutes localStorage
 * @returns {Object} Détails des ressources et données par type
 */
function analyserRessourcesDetaillees(config) {
    const result = {
        // Ressources pédagogiques (bibliothèques)
        ressources: {
            pratiques: { items: [], count: 0, cle: 'pratiquesConfigurables' },
            grilles: { items: [], count: 0, cles: ['grillesTemplates', 'bibliothequeGrilles'] },
            echelles: { items: [], count: 0, cle: 'echellesTemplates' },
            productions: { items: [], count: 0, cle: 'bibliothequeProductions' },
            cartouches: { items: [], count: 0, cles: [] }
        },
        // Données du cours (troubleshooting)
        donnees: {
            etudiants: { count: 0, cles: [] },
            presences: { count: 0, cles: [] },
            evaluations: { count: 0, cles: [] },
            configuration: { present: false, cles: [] }
        },
        // 🆕 Beta 96.2 : Entités structurelles (groupe-cours, horaires, enseignants)
        entites: {
            groupesCours: { count: 0, cles: [] },
            horaires: { count: 0, cles: [] },
            enseignants: { count: 0, present: false }
        },
        totalRessources: 0,
        totalDonnees: 0
    };

    // Parser les valeurs si elles sont des strings JSON
    const parseValeur = (val) => {
        if (typeof val === 'string') {
            try { return JSON.parse(val); } catch (e) { return val; }
        }
        return val;
    };

    // ========== RESSOURCES PÉDAGOGIQUES ==========

    // Pratiques configurables
    if (config.pratiquesConfigurables) {
        const pratiques = parseValeur(config.pratiquesConfigurables);
        if (Array.isArray(pratiques)) {
            result.ressources.pratiques.items = pratiques.map(p => ({
                id: p.id,
                nom: p.nom || 'Sans nom',
                description: p.description || ''
            }));
            result.ressources.pratiques.count = pratiques.length;
        }
    }

    // Grilles (plusieurs sources possibles)
    let allGrilles = [];
    if (config.bibliothequeGrilles) {
        const grilles = parseValeur(config.bibliothequeGrilles);
        if (Array.isArray(grilles)) allGrilles = allGrilles.concat(grilles);
    }
    if (config.grillesTemplates) {
        const grilles = parseValeur(config.grillesTemplates);
        if (Array.isArray(grilles)) allGrilles = allGrilles.concat(grilles);
    }
    result.ressources.grilles.items = allGrilles.map(g => ({
        id: g.id,
        nom: g.nom || 'Sans nom',
        criteres: g.criteres ? g.criteres.length : 0
    }));
    result.ressources.grilles.count = allGrilles.length;

    // Échelles
    if (config.echellesTemplates) {
        const echelles = parseValeur(config.echellesTemplates);
        if (Array.isArray(echelles)) {
            result.ressources.echelles.items = echelles.map(e => ({
                id: e.id,
                nom: e.nom || 'Sans nom',
                niveaux: e.niveaux ? e.niveaux.length : 0
            }));
            result.ressources.echelles.count = echelles.length;
        }
    }

    // Productions (chercher dans bibliothequeProductions OU productions)
    // Vérifier le contenu, pas juste l'existence de la clé
    let cleProdsAnalyse = null;
    if (config.bibliothequeProductions) {
        const prodsTest = parseValeur(config.bibliothequeProductions);
        if (Array.isArray(prodsTest) && prodsTest.length > 0) {
            cleProdsAnalyse = 'bibliothequeProductions';
        }
    }
    if (!cleProdsAnalyse && config.productions) {
        const prodsTest = parseValeur(config.productions);
        if (Array.isArray(prodsTest) && prodsTest.length > 0) {
            cleProdsAnalyse = 'productions';
        }
    }
    if (cleProdsAnalyse) {
        const prods = parseValeur(config[cleProdsAnalyse]);
        if (Array.isArray(prods)) {
            result.ressources.productions.items = prods.map(p => ({
                id: p.id,
                nom: p.nom || 'Sans nom',
                type: p.type || ''
            }));
            result.ressources.productions.count = prods.length;
        }
    }

    // Cartouches (chercher toutes les clés cartouches_*)
    Object.keys(config).forEach(cle => {
        if (cle.startsWith('cartouches_')) {
            const cartouches = parseValeur(config[cle]);
            if (Array.isArray(cartouches) && cartouches.length > 0) {
                result.ressources.cartouches.cles.push(cle);
                result.ressources.cartouches.items.push({
                    grilleId: cle.replace('cartouches_', ''),
                    count: cartouches.length
                });
                result.ressources.cartouches.count += cartouches.length;
            }
        }
    });

    // ========== DONNÉES DU COURS ==========

    // Étudiants (clés: groupeEtudiants, *_groupeEtudiants)
    Object.keys(config).forEach(cle => {
        if (cle === 'groupeEtudiants' || cle.endsWith('_groupeEtudiants')) {
            const etudiants = parseValeur(config[cle]);
            if (Array.isArray(etudiants) && etudiants.length > 0) {
                result.donnees.etudiants.cles.push(cle);
                result.donnees.etudiants.count += etudiants.length;
            }
        }
    });

    // Présences (clés: presences, *_presences)
    Object.keys(config).forEach(cle => {
        if (cle === 'presences' || cle.endsWith('_presences')) {
            const presences = parseValeur(config[cle]);
            if (presences && typeof presences === 'object') {
                const nbDates = Object.keys(presences).length;
                if (nbDates > 0) {
                    result.donnees.presences.cles.push(cle);
                    result.donnees.presences.count += nbDates;
                }
            }
        }
    });

    // Évaluations/Notes (clés: evaluations, notesEtudiants, *_evaluations, *_notesEtudiants)
    Object.keys(config).forEach(cle => {
        if (cle === 'evaluations' || cle.endsWith('_evaluations') ||
            cle === 'notesEtudiants' || cle.endsWith('_notesEtudiants')) {
            const data = parseValeur(config[cle]);
            if (data && (Array.isArray(data) ? data.length > 0 : Object.keys(data).length > 0)) {
                result.donnees.evaluations.cles.push(cle);
                result.donnees.evaluations.count++;
            }
        }
    });

    // Configuration (modalitesEvaluation, infoCours, listeCours, trimestres)
    ['modalitesEvaluation', 'infoCours', 'listeCours', 'trimestres'].forEach(cle => {
        if (config[cle]) {
            result.donnees.configuration.cles.push(cle);
            result.donnees.configuration.present = true;
        }
    });

    // 🆕 Beta 96.2 : Entités structurelles

    // Groupe-cours (clés: *_groupesCours)
    Object.keys(config).forEach(cle => {
        if (cle.endsWith('_groupesCours')) {
            const groupesCours = parseValeur(config[cle]);
            if (Array.isArray(groupesCours) && groupesCours.length > 0) {
                result.entites.groupesCours.cles.push(cle);
                result.entites.groupesCours.count += groupesCours.length;
            }
        }
    });

    // Horaires (clés: *_horaires)
    Object.keys(config).forEach(cle => {
        if (cle.endsWith('_horaires')) {
            const horaires = parseValeur(config[cle]);
            if (Array.isArray(horaires) && horaires.length > 0) {
                result.entites.horaires.cles.push(cle);
                result.entites.horaires.count += horaires.length;
            }
        }
    });

    // Enseignants (clé globale)
    if (config.enseignants) {
        const enseignants = parseValeur(config.enseignants);
        if (Array.isArray(enseignants) && enseignants.length > 0) {
            result.entites.enseignants.count = enseignants.length;
            result.entites.enseignants.present = true;
        }
    }

    // Totaux
    result.totalRessources = result.ressources.pratiques.count +
                             result.ressources.grilles.count +
                             result.ressources.echelles.count +
                             result.ressources.productions.count +
                             result.ressources.cartouches.count;

    result.totalDonnees = result.donnees.etudiants.count +
                          result.donnees.presences.count +
                          (result.donnees.evaluations.count > 0 ? 1 : 0) +
                          (result.donnees.configuration.present ? 1 : 0);

    return result;
}

/**
 * Version simplifiée pour rétrocompatibilité (retourne juste les comptes)
 */
function analyserRessourcesBibliotheques(config) {
    const details = analyserRessourcesDetaillees(config);
    return {
        pratiques: details.pratiques.count,
        grilles: details.grilles.count,
        echelles: details.echelles.count,
        productions: details.productions.count,
        total: details.total
    };
}

/**
 * Affiche le modal de prévisualisation de la configuration
 * @param {Object} config - Configuration complète à prévisualiser
 */
function afficherModalPreviewConfigComplete(config) {
    const meta = config.metadata;
    const contenu = config.contenu;

    // Compter les ressources
    const nbEchelles = contenu.echelles ? contenu.echelles.length : 0;
    const nbGrilles = contenu.grilles ? contenu.grilles.length : 0;
    const nbProductions = contenu.productions ? contenu.productions.length : 0;
    const nbCartouches = contenu.cartouches
        ? Object.keys(contenu.cartouches).reduce((total, grilleId) => {
            return total + (contenu.cartouches[grilleId] ? contenu.cartouches[grilleId].length : 0);
          }, 0)
        : 0;
    const totalRessources = nbEchelles + nbGrilles + nbProductions + nbCartouches;

    // Créer le modal
    const modalHTML = `
        <div id="modalPreviewConfigComplete" style="display: flex; position: fixed; top: 0; left: 0;
             width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 10000;
             align-items: center; justify-content: center;">
            <div style="background: white; border-radius: 10px; padding: 30px; max-width: 600px;
                 width: 90%; max-height: 85vh; overflow-y: auto;">

                <h2 style="margin-top: 0; color: var(--bleu-moyen); border-bottom: 2px solid var(--bleu-pale);
                     padding-bottom: 10px;">
                    Fichier analysé
                </h2>

                <!-- Type détecté -->
                <div style="background: #e8f5e9; border: 1px solid #81c784; border-radius: 8px;
                     padding: 15px; margin-bottom: 20px;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span style="font-size: 2rem;">📚</span>
                        <div>
                            <strong style="color: #2e7d32; font-size: 1.1rem;">Configuration pédagogique partagée</strong>
                            <p style="margin: 4px 0 0 0; font-size: 0.9rem; color: #666;">
                                Ce fichier contient des ressources pédagogiques prêtes à utiliser.
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Infos auteur -->
                <div style="background: var(--bleu-tres-pale); border-radius: 8px;
                     padding: 15px; margin-bottom: 20px;">
                    <h3 style="margin: 0 0 8px 0; font-size: 1.05rem; color: var(--bleu-moyen);">
                        ${meta.nom}
                    </h3>
                    <p style="margin: 0; font-size: 0.9rem; color: #555;">
                        Par <strong>${meta.auteur}</strong>
                        ${meta.discipline && meta.discipline.length > 0 ? ` · ${meta.discipline.join(', ')}` : ''}
                        ${meta.niveau ? ` · ${meta.niveau}` : ''}
                    </p>
                    ${meta.description
                        ? `<p style="margin: 10px 0 0 0; font-size: 0.9rem; font-style: italic; color: #666;">${meta.description}</p>`
                        : ''}
                </div>

                <!-- Contenu -->
                <div style="background: #f8f9fa; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
                    <p style="margin: 0 0 10px 0; font-size: 0.95rem; font-weight: 500;">
                        Ressources incluses (${totalRessources}) :
                    </p>
                    <div style="display: flex; flex-wrap: wrap; gap: 8px; font-size: 0.9rem;">
                        ${nbEchelles > 0 ? `<span style="background: white; padding: 4px 10px; border-radius: 4px; border: 1px solid #ddd;">✓ ${nbEchelles} échelle(s)</span>` : ''}
                        ${nbGrilles > 0 ? `<span style="background: white; padding: 4px 10px; border-radius: 4px; border: 1px solid #ddd;">✓ ${nbGrilles} grille(s)</span>` : ''}
                        ${nbProductions > 0 ? `<span style="background: white; padding: 4px 10px; border-radius: 4px; border: 1px solid #ddd;">✓ ${nbProductions} production(s)</span>` : ''}
                        ${nbCartouches > 0 ? `<span style="background: white; padding: 4px 10px; border-radius: 4px; border: 1px solid #ddd;">✓ ${nbCartouches} cartouche(s)</span>` : ''}
                    </div>
                </div>

                <!-- Info CC -->
                <div style="background: #e3f2fd; border-radius: 8px; padding: 12px; margin-bottom: 20px;">
                    <p style="margin: 0; font-size: 0.85rem; color: #1565c0;">
                        📄 Licence <strong>CC BY-NC-SA 4.0</strong> — Tu peux utiliser et adapter ces ressources
                        en citant l'auteur.
                    </p>
                </div>

                <!-- Boutons -->
                <div style="display: flex; gap: 10px; justify-content: flex-end;">
                    <button onclick="fermerModalPreviewConfigComplete()"
                            style="padding: 10px 20px; background: white; color: var(--gris-fonce);
                                   border: 1px solid var(--gris-clair); border-radius: 4px;
                                   cursor: pointer; font-size: 0.95rem;">
                        Annuler
                    </button>
                    <button onclick="executerImportConfigComplete()"
                            style="padding: 10px 20px; background: #28a745; color: white;
                                   border: none; border-radius: 4px; cursor: pointer; font-size: 0.95rem;
                                   font-weight: 500;">
                        Ajouter à mes bibliothèques
                    </button>
                </div>
            </div>
        </div>
    `;

    // Insérer le modal dans le DOM
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer);
}

/**
 * Ferme le modal de prévisualisation
 */
function fermerModalPreviewConfigComplete() {
    const modal = document.getElementById('modalPreviewConfigComplete');
    if (modal) {
        modal.parentElement.remove();
    }
    configCompleteEnAttente = null;
}

/**
 * Exécute l'import de la configuration complète avec gestion des conflits d'ID
 * Supporte deux formats : configuration-complete (Beta 91+) et localStorage-brut
 */
async function executerImportConfigComplete() {
    if (!configCompleteEnAttente) {
        alert('Aucune configuration en attente d\'importation.');
        return;
    }

    const config = configCompleteEnAttente;

    // 🆕 BETA 95.1 : Gérer les deux formats
    if (config._format === 'localStorage-brut') {
        await executerImportLocalStorageBrut(config);
        return;
    }

    // Format configuration-complete (Beta 91+)
    const contenu = config.contenu;

    try {
        // Table de remapping: oldId → newId
        const remapEchelles = {};
        const remapGrilles = {};

        // Récupérer les ressources existantes
        const echellesExistantes = db.getSync('echellesTemplates', []);
        const grillesExistantes = db.getSync('grillesTemplates', []);

        // Créer des Sets d'IDs existants pour recherche rapide
        const idsEchellesExistants = new Set(echellesExistantes.map(e => e.id));
        const idsGrillesExistants = new Set(grillesExistantes.map(g => g.id));

        // 1. Importer les échelles avec détection de conflits
        if (contenu.echelles && contenu.echelles.length > 0) {
            const echellesAImporter = contenu.echelles.map(echelle => {
                // Vérifier si l'ID existe déjà
                if (idsEchellesExistants.has(echelle.id)) {
                    // Conflit détecté: générer un nouvel ID
                    const ancienId = echelle.id;
                    const nouvelId = 'ECH' + Date.now() + Math.floor(Math.random() * 1000);

                    // Enregistrer le remapping
                    remapEchelles[ancienId] = nouvelId;

                    console.log(`⚠️ Conflit d'ID échelle: ${ancienId} → ${nouvelId}`);

                    // Retourner échelle avec nouvel ID
                    return { ...echelle, id: nouvelId };
                }
                // Pas de conflit, retourner tel quel
                return echelle;
            });

            // Fusionner avec échelles existantes
            const echellesFusionnees = [...echellesExistantes, ...echellesAImporter];
            db.setSync('echellesTemplates', echellesFusionnees);
            console.log(`✅ ${echellesAImporter.length} échelle(s) importée(s)`);
        }

        // 2. Importer les grilles avec détection de conflits
        if (contenu.grilles && contenu.grilles.length > 0) {
            const grillesAImporter = contenu.grilles.map(grille => {
                // Vérifier si l'ID existe déjà
                if (idsGrillesExistants.has(grille.id)) {
                    // Conflit détecté: générer un nouvel ID
                    const ancienId = grille.id;
                    const nouvelId = 'GRILLE' + Date.now() + Math.floor(Math.random() * 1000);

                    // Enregistrer le remapping
                    remapGrilles[ancienId] = nouvelId;

                    console.log(`⚠️ Conflit d'ID grille: ${ancienId} → ${nouvelId}`);

                    // Retourner grille avec nouvel ID
                    return { ...grille, id: nouvelId };
                }
                // Pas de conflit, retourner tel quel
                return grille;
            });

            // Fusionner avec grilles existantes
            const grillesFusionnees = [...grillesExistantes, ...grillesAImporter];
            db.setSync('grillesTemplates', grillesFusionnees);
            console.log(`✅ ${grillesAImporter.length} grille(s) importée(s)`);
        }

        // 3. Importer les productions avec mise à jour des références aux grilles
        // ✅ CORRECTION (Beta 95 - 2 jan 2026) : Utiliser clé namespacée
        if (contenu.productions && contenu.productions.length > 0) {
            const cleProductions = (typeof window.cle === 'function') ? window.cle('productions') : 'productions';
            const productionsExistantes = db.getSync(cleProductions, []);

            const productionsAImporter = contenu.productions.map(production => {
                // Créer une copie de la production
                const prod = { ...production };

                // Générer un nouvel ID pour éviter les conflits
                prod.id = 'PROD' + Date.now() + Math.floor(Math.random() * 1000);

                // Mettre à jour la référence à la grille si elle a été remappée
                if (prod.grilleId && remapGrilles[prod.grilleId]) {
                    console.log(`🔗 Mise à jour référence grille dans production: ${prod.grilleId} → ${remapGrilles[prod.grilleId]}`);
                    prod.grilleId = remapGrilles[prod.grilleId];
                }

                return prod;
            });

            // Fusionner avec productions existantes
            const productionsFusionnees = [...productionsExistantes, ...productionsAImporter];
            db.setSync(cleProductions, productionsFusionnees);
            console.log(`✅ ${productionsAImporter.length} production(s) importée(s) (clé: ${cleProductions})`);
        }

        // 4. Importer les cartouches avec mise à jour des clés (grilleId)
        if (contenu.cartouches) {
            let nbCartouchesTotal = 0;

            Object.keys(contenu.cartouches).forEach(ancienGrilleId => {
                const cartouchesGrille = contenu.cartouches[ancienGrilleId];
                if (!cartouchesGrille || cartouchesGrille.length === 0) return;

                // Déterminer la bonne clé à utiliser (remappée ou originale)
                const grilleIdFinal = remapGrilles[ancienGrilleId] || ancienGrilleId;

                if (remapGrilles[ancienGrilleId]) {
                    console.log(`🔗 Mise à jour clé cartouches: cartouches_${ancienGrilleId} → cartouches_${grilleIdFinal}`);
                }

                // Récupérer les cartouches existantes pour cette grille
                const cartouchesExistantes = db.getSync(`cartouches_${grilleIdFinal}`, []);

                // Fusionner (ajouter les nouvelles cartouches)
                const cartouchesFusionnees = [...cartouchesExistantes, ...cartouchesGrille];
                db.setSync(`cartouches_${grilleIdFinal}`, cartouchesFusionnees);

                nbCartouchesTotal += cartouchesGrille.length;
            });

            console.log(`✅ ${nbCartouchesTotal} cartouche(s) importée(s)`);
        }

        // 5. Importer les paramètres du cours (fusion avec paramètres existants)
        if (contenu.parametres) {
            const modalitesActuelles = db.getSync('modalitesEvaluation', {});
            const modalitesFusionnees = {
                ...modalitesActuelles,
                systemeJetons: contenu.parametres.systeme_jetons,
                reprisesAutorisees: contenu.parametres.reprises_autorisees,
                nombreArtefacts: contenu.parametres.nombre_artefacts,
                pratiqueActive: contenu.parametres.pratique_active,
                modeComparatif: contenu.parametres.mode_comparatif
            };
            db.setSync('modalitesEvaluation', modalitesFusionnees);
            console.log('✅ Paramètres du cours importés');
        }

        // Afficher résumé des remappages si nécessaire
        const nbRemapEchelles = Object.keys(remapEchelles).length;
        const nbRemapGrilles = Object.keys(remapGrilles).length;

        if (nbRemapEchelles > 0 || nbRemapGrilles > 0) {
            console.log('\n📊 Résumé des conflits d\'ID résolus:');
            if (nbRemapEchelles > 0) {
                console.log(`   - ${nbRemapEchelles} échelle(s) remappée(s)`);
            }
            if (nbRemapGrilles > 0) {
                console.log(`   - ${nbRemapGrilles} grille(s) remappée(s)`);
            }
        }

        // Fermer le modal
        fermerModalPreviewConfigComplete();

        // Notification de succès
        let messageSucces = `Configuration «${config.metadata.nom}» importée avec succès!`;
        if (nbRemapEchelles > 0 || nbRemapGrilles > 0) {
            messageSucces += `\n\n${nbRemapEchelles + nbRemapGrilles} conflit(s) d'ID résolu(s) automatiquement.`;
        }

        if (typeof afficherNotificationSucces === 'function') {
            afficherNotificationSucces(messageSucces);
        }

        // Proposer de recharger la page
        if (confirm('Import terminé!\n\nRecharger la page pour appliquer les changements?')) {
            location.reload();
        }

    } catch (erreur) {
        console.error('Erreur lors de l\'import de la configuration:', erreur);
        alert('Erreur lors de l\'import de la configuration.\n\n' + erreur.message);
    }
}

/**
 * 🆕 BETA 95.1 : Exécute l'import d'un export localStorage brut
 * Réutilise la logique de executerImport() mais via le modal unifié
 * @param {Object} config - Données brutes localStorage
 */
async function executerImportLocalStorageBrut(config) {
    // Retirer la propriété interne _format avant import
    const donnees = { ...config };
    delete donnees._format;

    try {
        const cles = Object.keys(donnees);
        let nbCles = 0;

        for (const cle of cles) {
            let valeur = donnees[cle];

            // Parser les strings JSON (backups de l'ancienne version localStorage)
            if (typeof valeur === 'string') {
                try {
                    valeur = JSON.parse(valeur);
                } catch (e) {
                    // Garder comme string si ce n'est pas du JSON valide
                }
            }

            // Utiliser db.set (async/IndexedDB)
            await db.set(cle, valeur);
            nbCles++;
        }

        // Fermer le modal
        fermerModalPreviewConfigComplete();

        console.log(`✅ Import localStorage brut: ${nbCles} clé(s) importée(s)`);

        // Notification et rechargement
        alert(`Import réussi !\n\n${nbCles} clé(s) de données importée(s).`);

        if (confirm('Recharger la page pour appliquer les changements ?')) {
            location.reload();
        }

    } catch (erreur) {
        console.error('Erreur lors de l\'import localStorage brut:', erreur);
        alert('Erreur lors de l\'import.\n\n' + erreur.message);
    }
}

/**
 * 🆕 BETA 95.1 : Import fusionné vers les bibliothèques
 * Extrait uniquement les ressources (pratiques, grilles, échelles, productions)
 * et les ajoute aux bibliothèques existantes SANS écraser les données du cours
 */
async function executerImportVersBibliotheques() {
    if (!configCompleteEnAttente) {
        alert('Aucune configuration en attente d\'importation.');
        return;
    }

    const config = configCompleteEnAttente;

    // Retirer la propriété interne _format
    const donnees = { ...config };
    delete donnees._format;

    // Helper pour parser les valeurs JSON
    const parseValeur = (val) => {
        if (typeof val === 'string') {
            try { return JSON.parse(val); } catch (e) { return val; }
        }
        return val;
    };

    try {
        let compteurs = { pratiques: 0, grilles: 0, echelles: 0, productions: 0 };

        // 1. PRATIQUES CONFIGURABLES
        if (donnees.pratiquesConfigurables) {
            const pratiquesImport = parseValeur(donnees.pratiquesConfigurables);
            if (Array.isArray(pratiquesImport) && pratiquesImport.length > 0) {
                const pratiquesExistantes = db.getSync('pratiquesConfigurables', []);
                const idsPratiquesExistants = new Set(pratiquesExistantes.map(p => p.id));

                const pratiquesNouvelles = pratiquesImport.filter(p => {
                    // Éviter les doublons par ID ou par nom
                    if (idsPratiquesExistants.has(p.id)) return false;
                    if (pratiquesExistantes.some(pe => pe.nom === p.nom)) return false;
                    return true;
                }).map(p => ({
                    ...p,
                    id: 'PRATIQUE_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
                    dateImport: new Date().toISOString()
                }));

                if (pratiquesNouvelles.length > 0) {
                    const pratiquesFusionnees = [...pratiquesExistantes, ...pratiquesNouvelles];
                    db.setSync('pratiquesConfigurables', pratiquesFusionnees);
                    compteurs.pratiques = pratiquesNouvelles.length;
                    console.log(`✅ ${pratiquesNouvelles.length} pratique(s) ajoutée(s)`);
                }
            }
        }

        // 2. GRILLES (depuis grillesTemplates et bibliothequeGrilles)
        // ✅ MODIFIÉ (6 jan 2026) : Gestion des doublons avec modal
        let grillesExistantes = db.getSync('grillesTemplates', []);
        const idsGrillesExistants = new Set(grillesExistantes.map(g => g.id));
        let grillesNouvelles = [];

        // Collecter toutes les grilles à importer
        let toutesGrillesImport = [];
        if (donnees.grillesTemplates) {
            const grillesImport = parseValeur(donnees.grillesTemplates);
            if (Array.isArray(grillesImport)) {
                toutesGrillesImport = toutesGrillesImport.concat(grillesImport);
            }
        }
        if (donnees.bibliothequeGrilles) {
            const grillesImport = parseValeur(donnees.bibliothequeGrilles);
            if (Array.isArray(grillesImport)) {
                toutesGrillesImport = toutesGrillesImport.concat(grillesImport);
            }
        }

        // Traiter chaque grille avec gestion des doublons
        for (const g of toutesGrillesImport) {
            // Vérifier si déjà dans la liste des nouvelles
            if (grillesNouvelles.some(gn => gn.nom === g.nom)) continue;

            // Vérifier doublon par ID ou nom
            const existeParId = idsGrillesExistants.has(g.id);
            const existeParNom = grillesExistantes.some(ge => ge.nom === g.nom);

            if (!existeParId && !existeParNom) {
                // Pas de doublon - ajouter directement
                grillesNouvelles.push({
                    ...g,
                    id: 'GRILLE_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
                    dateImport: new Date().toISOString()
                });
            } else if (existeParNom && typeof afficherModalDoublon === 'function') {
                // Doublon détecté - demander à l'utilisateur
                const resultat = await afficherModalDoublon('grille', g.nom, { estImport: true });

                if (resultat && resultat.action === 'renommer') {
                    grillesNouvelles.push({
                        ...g,
                        nom: resultat.nouveauNom,
                        id: 'GRILLE_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
                        dateImport: new Date().toISOString()
                    });
                } else if (resultat && resultat.action === 'ecraser') {
                    // Supprimer l'existante et ajouter la nouvelle
                    grillesExistantes = grillesExistantes.filter(ge => ge.nom !== g.nom);
                    grillesNouvelles.push({
                        ...g,
                        id: 'GRILLE_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
                        dateImport: new Date().toISOString()
                    });
                }
                // Si ignorer ou annuler, on ne fait rien
            }
        }

        if (grillesNouvelles.length > 0 || grillesExistantes.length !== db.getSync('grillesTemplates', []).length) {
            const grillesFusionnees = [...grillesExistantes, ...grillesNouvelles];
            db.setSync('grillesTemplates', grillesFusionnees);
            compteurs.grilles = grillesNouvelles.length;
            console.log(`✅ ${grillesNouvelles.length} grille(s) ajoutée(s)`);
        }

        // 3. ÉCHELLES
        // ✅ MODIFIÉ (6 jan 2026) : Gestion des doublons avec modal
        if (donnees.echellesTemplates) {
            const echellesImport = parseValeur(donnees.echellesTemplates);
            if (Array.isArray(echellesImport) && echellesImport.length > 0) {
                let echellesExistantes = db.getSync('echellesTemplates', []);
                const idsEchellesExistants = new Set(echellesExistantes.map(e => e.id));
                let echellesNouvelles = [];

                for (const e of echellesImport) {
                    const existeParId = idsEchellesExistants.has(e.id);
                    const existeParNom = echellesExistantes.some(ee => ee.nom === e.nom);

                    if (!existeParId && !existeParNom && !echellesNouvelles.some(en => en.nom === e.nom)) {
                        echellesNouvelles.push({
                            ...e,
                            id: 'ECH_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
                            dateImport: new Date().toISOString()
                        });
                    } else if (existeParNom && typeof afficherModalDoublon === 'function') {
                        const resultat = await afficherModalDoublon('echelle', e.nom, { estImport: true });

                        if (resultat && resultat.action === 'renommer') {
                            echellesNouvelles.push({
                                ...e,
                                nom: resultat.nouveauNom,
                                id: 'ECH_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
                                dateImport: new Date().toISOString()
                            });
                        } else if (resultat && resultat.action === 'ecraser') {
                            echellesExistantes = echellesExistantes.filter(ee => ee.nom !== e.nom);
                            echellesNouvelles.push({
                                ...e,
                                id: 'ECH_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
                                dateImport: new Date().toISOString()
                            });
                        }
                    }
                }

                if (echellesNouvelles.length > 0 || echellesExistantes.length !== db.getSync('echellesTemplates', []).length) {
                    const echellesFusionnees = [...echellesExistantes, ...echellesNouvelles];
                    db.setSync('echellesTemplates', echellesFusionnees);
                    compteurs.echelles = echellesNouvelles.length;
                    console.log(`✅ ${echellesNouvelles.length} échelle(s) ajoutée(s)`);
                }
            }
        }

        // 4. PRODUCTIONS (depuis bibliothequeProductions OU productions)
        let cleProdsVersBibl = null;
        if (donnees.bibliothequeProductions) {
            const prodsTest = parseValeur(donnees.bibliothequeProductions);
            if (Array.isArray(prodsTest) && prodsTest.length > 0) {
                cleProdsVersBibl = 'bibliothequeProductions';
            }
        }
        if (!cleProdsVersBibl && donnees.productions) {
            const prodsTest = parseValeur(donnees.productions);
            if (Array.isArray(prodsTest) && prodsTest.length > 0) {
                cleProdsVersBibl = 'productions';
            }
        }
        // ✅ MODIFIÉ (6 jan 2026) : Gestion des doublons avec modal
        if (cleProdsVersBibl) {
            const prodsImport = parseValeur(donnees[cleProdsVersBibl]);
            if (Array.isArray(prodsImport) && prodsImport.length > 0) {
                const cleProductions = (typeof window.cle === 'function') ? window.cle('productions') : 'productions';
                let prodsExistantes = db.getSync(cleProductions, []);
                const idsProdsExistants = new Set(prodsExistantes.map(p => p.id));
                let prodsNouvelles = [];

                // Productions utilisent 'titre' comme nom
                const getNomProd = (p) => p.titre || p.nom || '';

                for (const p of prodsImport) {
                    const nomProd = getNomProd(p);
                    const existeParId = idsProdsExistants.has(p.id);
                    const existeParNom = prodsExistantes.some(pe => getNomProd(pe) === nomProd);

                    if (!existeParId && !existeParNom && !prodsNouvelles.some(pn => getNomProd(pn) === nomProd)) {
                        prodsNouvelles.push({
                            ...p,
                            id: 'PROD_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
                            dateImport: new Date().toISOString()
                        });
                    } else if (existeParNom && typeof afficherModalDoublon === 'function') {
                        const resultat = await afficherModalDoublon('production', nomProd, { estImport: true });

                        if (resultat && resultat.action === 'renommer') {
                            prodsNouvelles.push({
                                ...p,
                                titre: resultat.nouveauNom,
                                id: 'PROD_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
                                dateImport: new Date().toISOString()
                            });
                        } else if (resultat && resultat.action === 'ecraser') {
                            prodsExistantes = prodsExistantes.filter(pe => getNomProd(pe) !== nomProd);
                            prodsNouvelles.push({
                                ...p,
                                id: 'PROD_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
                                dateImport: new Date().toISOString()
                            });
                        }
                    }
                }

                if (prodsNouvelles.length > 0 || prodsExistantes.length !== db.getSync(cleProductions, []).length) {
                    const prodsFusionnees = [...prodsExistantes, ...prodsNouvelles];
                    db.setSync(cleProductions, prodsFusionnees);
                    compteurs.productions = prodsNouvelles.length;
                    console.log(`✅ ${prodsNouvelles.length} production(s) ajoutée(s)`);
                }
            }
        }

        // Fermer le modal
        fermerModalPreviewConfigComplete();

        // Message de résumé
        const total = compteurs.pratiques + compteurs.grilles + compteurs.echelles + compteurs.productions;

        if (total === 0) {
            alert('Aucune nouvelle ressource à ajouter.\n\nToutes les ressources du fichier existent déjà dans vos bibliothèques.');
        } else {
            let details = [];
            if (compteurs.pratiques > 0) details.push(`${compteurs.pratiques} pratique(s)`);
            if (compteurs.grilles > 0) details.push(`${compteurs.grilles} grille(s)`);
            if (compteurs.echelles > 0) details.push(`${compteurs.echelles} échelle(s)`);
            if (compteurs.productions > 0) details.push(`${compteurs.productions} production(s)`);

            const message = `Fusion réussie !\n\n${details.join(', ')} ajoutée(s) à vos bibliothèques.\n\nVos données existantes ont été préservées.`;

            if (typeof afficherNotificationSucces === 'function') {
                afficherNotificationSucces(message);
            }
            alert(message);

            if (confirm('Recharger la page pour voir les nouvelles ressources ?')) {
                location.reload();
            }
        }

        console.log('📊 Résumé import fusionné:', compteurs);

    } catch (erreur) {
        console.error('Erreur lors de l\'import vers bibliothèques:', erreur);
        alert('Erreur lors de la fusion.\n\n' + erreur.message);
    }
}

/**
 * 🆕 BETA 95.1 : Import sélectif basé sur les checkboxes
 * ✅ MODIFIÉ (6 jan 2026) : Support des checkboxes individuelles par élément
 * Importe uniquement les éléments cochés par l'utilisateur
 */
async function executerImportSelectif() {
    if (!configCompleteEnAttente) {
        alert('Aucune configuration en attente d\'importation.');
        return;
    }

    const config = configCompleteEnAttente;

    // Retirer la propriété interne _format
    const donnees = { ...config };
    delete donnees._format;

    // Helper pour parser les valeurs JSON
    const parseValeur = (val) => {
        if (typeof val === 'string') {
            try { return JSON.parse(val); } catch (e) { return val; }
        }
        return val;
    };

    // ✅ NOUVEAU : Récupérer les IDs des items cochés individuellement par catégorie
    const getCheckedItemIds = (category) => {
        const checkboxes = document.querySelectorAll(`.import-item-${category}:checked`);
        return Array.from(checkboxes).map(cb => cb.dataset.itemId);
    };

    // Vérifier si au moins un item est coché dans une catégorie (checkboxes individuelles)
    const hasCheckedItems = (category) => {
        return document.querySelectorAll(`.import-item-${category}:checked`).length > 0;
    };

    // Pour les données du cours (étudiants, présences, etc.) - ancien comportement
    const isChecked = (id) => {
        const cb = document.getElementById(`import-${id}`);
        return cb && cb.checked;
    };

    try {
        let compteurs = { ressources: 0, donnees: 0 };
        let details = [];

        // Auteur source pour marquage des imports
        const auteurSource = analyseImportEnCours?.auteurImport || '';

        // ========== RESSOURCES PÉDAGOGIQUES (fusion avec sélection individuelle) ==========

        // Pratiques - ✅ MODIFIÉ pour import sélectif individuel
        if (hasCheckedItems('pratiques') && donnees.pratiquesConfigurables) {
            const pratiquesImport = parseValeur(donnees.pratiquesConfigurables);
            const selectedIds = getCheckedItemIds('pratiques');

            if (Array.isArray(pratiquesImport) && pratiquesImport.length > 0) {
                const pratiquesExistantes = db.getSync('pratiquesConfigurables', []);
                // Filtrer par les items sélectionnés ET non existants
                const pratiquesNouvelles = pratiquesImport
                    .filter(p => selectedIds.includes(p.id) || selectedIds.includes(p.nom))
                    .filter(p => !pratiquesExistantes.some(pe => pe.nom === p.nom))
                    .map(p => ({
                        ...p,
                        id: 'PRATIQUE_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
                        dateImport: new Date().toISOString(),
                        auteurOriginal: auteurSource || p.auteurOriginal || ''
                    }));
                if (pratiquesNouvelles.length > 0) {
                    db.setSync('pratiquesConfigurables', [...pratiquesExistantes, ...pratiquesNouvelles]);
                    compteurs.ressources += pratiquesNouvelles.length;
                    details.push(`${pratiquesNouvelles.length} pratique(s)`);
                }
            }
        }

        // Grilles - ✅ MODIFIÉ pour import sélectif individuel
        if (hasCheckedItems('grilles')) {
            const grillesExistantes = db.getSync('grillesTemplates', []);
            const selectedIds = getCheckedItemIds('grilles');
            let grillesNouvelles = [];

            ['grillesTemplates', 'bibliothequeGrilles'].forEach(cle => {
                if (donnees[cle]) {
                    const grillesImport = parseValeur(donnees[cle]);
                    if (Array.isArray(grillesImport)) {
                        grillesImport.forEach(g => {
                            // Vérifier si cet item est sélectionné
                            const estSelectionne = selectedIds.includes(g.id) || selectedIds.includes(g.nom);
                            if (estSelectionne &&
                                !grillesExistantes.some(ge => ge.nom === g.nom) &&
                                !grillesNouvelles.some(gn => gn.nom === g.nom)) {
                                grillesNouvelles.push({
                                    ...g,
                                    id: 'GRILLE_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
                                    dateImport: new Date().toISOString(),
                                    auteurOriginal: auteurSource || g.auteurOriginal || ''
                                });
                            }
                        });
                    }
                }
            });

            if (grillesNouvelles.length > 0) {
                db.setSync('grillesTemplates', [...grillesExistantes, ...grillesNouvelles]);
                compteurs.ressources += grillesNouvelles.length;
                details.push(`${grillesNouvelles.length} grille(s)`);
            }
        }

        // Échelles - ✅ MODIFIÉ pour import sélectif individuel
        if (hasCheckedItems('echelles') && donnees.echellesTemplates) {
            const echellesImport = parseValeur(donnees.echellesTemplates);
            const selectedIds = getCheckedItemIds('echelles');

            if (Array.isArray(echellesImport) && echellesImport.length > 0) {
                const echellesExistantes = db.getSync('echellesTemplates', []);
                const echellesNouvelles = echellesImport
                    .filter(e => selectedIds.includes(e.id) || selectedIds.includes(e.nom))
                    .filter(e => !echellesExistantes.some(ee => ee.nom === e.nom))
                    .map(e => ({
                        ...e,
                        id: 'ECH_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
                        dateImport: new Date().toISOString(),
                        auteurOriginal: auteurSource || e.auteurOriginal || ''
                    }));
                if (echellesNouvelles.length > 0) {
                    db.setSync('echellesTemplates', [...echellesExistantes, ...echellesNouvelles]);
                    compteurs.ressources += echellesNouvelles.length;
                    details.push(`${echellesNouvelles.length} échelle(s)`);
                }
            }
        }

        // Productions - ✅ MODIFIÉ pour import sélectif individuel
        let cleProdsSource = null;
        if (donnees.bibliothequeProductions) {
            const prodsTest = parseValeur(donnees.bibliothequeProductions);
            if (Array.isArray(prodsTest) && prodsTest.length > 0) {
                cleProdsSource = 'bibliothequeProductions';
            }
        }
        if (!cleProdsSource && donnees.productions) {
            const prodsTest = parseValeur(donnees.productions);
            if (Array.isArray(prodsTest) && prodsTest.length > 0) {
                cleProdsSource = 'productions';
            }
        }
        if (hasCheckedItems('productions') && cleProdsSource) {
            const prodsImport = parseValeur(donnees[cleProdsSource]);
            const selectedIds = getCheckedItemIds('productions');
            if (Array.isArray(prodsImport) && prodsImport.length > 0) {
                const cleProductions = (typeof window.cle === 'function') ? window.cle('productions') : 'productions';
                const prodsExistantes = db.getSync(cleProductions, []);
                const prodsNouvelles = prodsImport
                    .filter(p => selectedIds.includes(p.id) || selectedIds.includes(p.nom))
                    .filter(p => !prodsExistantes.some(pe => pe.nom === p.nom))
                    .map(p => ({
                        ...p,
                        id: 'PROD_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
                        dateImport: new Date().toISOString(),
                        auteurOriginal: auteurSource || p.auteurOriginal || ''
                    }));
                if (prodsNouvelles.length > 0) {
                    db.setSync(cleProductions, [...prodsExistantes, ...prodsNouvelles]);
                    compteurs.ressources += prodsNouvelles.length;
                    details.push(`${prodsNouvelles.length} production(s)`);
                }
            }
        }

        // Cartouches - ✅ MODIFIÉ pour import sélectif individuel
        if (hasCheckedItems('cartouches')) {
            const selectedIds = getCheckedItemIds('cartouches');
            let nbCartouches = 0;
            Object.keys(donnees).forEach(cle => {
                if (cle.startsWith('cartouches_')) {
                    const cartouches = parseValeur(donnees[cle]);
                    if (Array.isArray(cartouches) && cartouches.length > 0) {
                        const cartouchesExistantes = db.getSync(cle, []);
                        // Filtrer par sélection et ajouter auteurOriginal
                        const cartouchesSelectionnees = cartouches
                            .filter(c => selectedIds.includes(c.id) || selectedIds.includes(c.nom))
                            .map(c => ({
                                ...c,
                                dateImport: new Date().toISOString(),
                                auteurOriginal: auteurSource || c.auteurOriginal || ''
                            }));
                        if (cartouchesSelectionnees.length > 0) {
                            const cartouchesFusionnees = [...cartouchesExistantes, ...cartouchesSelectionnees];
                            db.setSync(cle, cartouchesFusionnees);
                            nbCartouches += cartouchesSelectionnees.length;
                        }
                    }
                }
            });
            if (nbCartouches > 0) {
                compteurs.ressources += nbCartouches;
                details.push(`${nbCartouches} cartouche(s)`);
            }
        }

        // ========== DONNÉES DU COURS (écrasement) ==========
        // 🆕 Beta 96.2 : Bloquer import données perso SEULEMENT si collègue ou source vraiment inconnue
        // Permettre si : sauvegarde personnelle OU restauration sur nouvel appareil OU confirmation utilisateur
        const bloquerDonneesPerso = analyseImportEnCours &&
            (analyseImportEnCours.estCollègue ||
             (analyseImportEnCours.sourceInconnue && !analyseImportEnCours.restaurationNouvelAppareil && !analyseImportEnCours.confirmeMaSauvegarde));

        // Étudiants
        if (isChecked('etudiants') && !bloquerDonneesPerso) {
            let nbEtudiants = 0;
            Object.keys(donnees).forEach(cle => {
                if (cle === 'groupeEtudiants' || cle.endsWith('_groupeEtudiants')) {
                    const etudiants = parseValeur(donnees[cle]);
                    if (Array.isArray(etudiants)) {
                        db.setSync(cle, etudiants);
                        nbEtudiants += etudiants.length;
                    }
                }
            });
            if (nbEtudiants > 0) {
                compteurs.donnees++;
                details.push(`${nbEtudiants} étudiant(s)`);
            }
        }

        // Présences
        if (isChecked('presences') && !bloquerDonneesPerso) {
            let nbDates = 0;
            Object.keys(donnees).forEach(cle => {
                if (cle === 'presences' || cle.endsWith('_presences')) {
                    const presences = parseValeur(donnees[cle]);
                    if (presences && typeof presences === 'object') {
                        db.setSync(cle, presences);
                        nbDates += Object.keys(presences).length;
                    }
                }
            });
            if (nbDates > 0) {
                compteurs.donnees++;
                details.push(`${nbDates} date(s) de présences`);
            }
        }

        // Évaluations
        if (isChecked('evaluations') && !bloquerDonneesPerso) {
            Object.keys(donnees).forEach(cle => {
                if (cle === 'evaluations' || cle.endsWith('_evaluations') ||
                    cle === 'notesEtudiants' || cle.endsWith('_notesEtudiants')) {
                    const data = parseValeur(donnees[cle]);
                    if (data) {
                        db.setSync(cle, data);
                    }
                }
            });
            compteurs.donnees++;
            details.push('Évaluations/Notes');
        }

        // Configuration
        if (isChecked('configuration')) {
            ['modalitesEvaluation', 'infoCours', 'listeCours', 'trimestres'].forEach(cle => {
                if (donnees[cle]) {
                    db.setSync(cle, parseValeur(donnees[cle]));
                }
            });
            compteurs.donnees++;
            details.push('Configuration du cours');
        }

        // 🆕 Beta 96.2 : Entités structurelles (groupe-cours, horaires, enseignants)

        // Groupe-cours (clés: *_groupesCours)
        if (isChecked('groupesCours')) {
            let nbGC = 0;
            Object.keys(donnees).forEach(cle => {
                if (cle.endsWith('_groupesCours')) {
                    const groupesCours = parseValeur(donnees[cle]);
                    if (Array.isArray(groupesCours) && groupesCours.length > 0) {
                        db.setSync(cle, groupesCours);
                        nbGC += groupesCours.length;
                    }
                }
            });
            if (nbGC > 0) {
                compteurs.donnees++;
                details.push(`${nbGC} groupe-cours`);
            }
        }

        // Horaires (clés: *_horaires)
        if (isChecked('horaires')) {
            let nbHoraires = 0;
            Object.keys(donnees).forEach(cle => {
                if (cle.endsWith('_horaires')) {
                    const horaires = parseValeur(donnees[cle]);
                    if (Array.isArray(horaires) && horaires.length > 0) {
                        db.setSync(cle, horaires);
                        nbHoraires += horaires.length;
                    }
                }
            });
            if (nbHoraires > 0) {
                compteurs.donnees++;
                details.push(`${nbHoraires} horaire(s)`);
            }
        }

        // Enseignants (clé globale)
        if (isChecked('enseignants')) {
            if (donnees.enseignants) {
                const enseignants = parseValeur(donnees.enseignants);
                if (Array.isArray(enseignants) && enseignants.length > 0) {
                    db.setSync('enseignants', enseignants);
                    compteurs.donnees++;
                    details.push(`${enseignants.length} enseignant(s)`);
                }
            }
        }

        // 🆕 FIX (31 jan 2026) : Importer les données calendrier (cadreCalendrier, calendrierComplet, etc.)
        // Ces clés sont namespacées et essentielles pour le fonctionnement du trimestre
        const clesCalendrier = ['cadreCalendrier', 'calendrierComplet', 'evenementsPrevus', 'evenementsImprevus', 'seancesCompletes', 'horaireHebdo'];
        let nbCalendrier = 0;
        Object.keys(donnees).forEach(cle => {
            // Importer les clés globales et namespacées
            if (clesCalendrier.includes(cle) || clesCalendrier.some(c => cle.endsWith('_' + c))) {
                const data = parseValeur(donnees[cle]);
                if (data && (Array.isArray(data) ? data.length > 0 : Object.keys(data).length > 0)) {
                    db.setSync(cle, data);
                    nbCalendrier++;
                }
            }
        });
        if (nbCalendrier > 0) {
            details.push(`${nbCalendrier} config(s) calendrier`);
        }

        // ✅ CORRIGÉ (6 jan 2026) : Vérifier les checkboxes AVANT de fermer le modal
        // Pour les ressources, vérifier les checkboxes individuelles; pour les données, l'ancienne méthode
        const quelqueChoseCoche =
            hasCheckedItems('pratiques') || hasCheckedItems('grilles') ||
            hasCheckedItems('echelles') || hasCheckedItems('productions') ||
            hasCheckedItems('cartouches') ||
            isChecked('etudiants') || isChecked('presences') ||
            isChecked('evaluations') || isChecked('configuration') ||
            isChecked('groupesCours') || isChecked('horaires') || isChecked('enseignants');

        // Fermer le modal
        fermerModalPreviewConfigComplete();

        // Message de résumé
        const total = compteurs.ressources + compteurs.donnees;

        if (total === 0) {
            if (!quelqueChoseCoche) {
                alert('Coche au moins un élément à importer.');
            } else {
                alert('Aucune nouvelle donnée à importer.\n\nLes éléments sélectionnés existent déjà (même nom).');
            }
        } else {
            const message = `Import réussi !\n\n${details.join('\n')}\n\nTotal : ${total} élément(s) importé(s).`;

            if (typeof afficherNotificationSucces === 'function') {
                afficherNotificationSucces(message);
            }
            alert(message);

            if (confirm('Recharger la page pour voir les changements ?')) {
                location.reload();
            }
        }

        console.log('📊 Import sélectif terminé:', { compteurs, details });

    } catch (erreur) {
        console.error('Erreur lors de l\'import sélectif:', erreur);
        alert('Erreur lors de l\'import.\n\n' + erreur.message);
    }
}

/* ===============================
   EXPORT CONFIGURATION COMPLÈTE (Beta 91)
   =============================== */

/**
 * Exporte une configuration pédagogique complète
 * Rassemble toutes les ressources du cours actif:
 * - Échelles de performance
 * - Grilles de critères
 * - Productions
 * - Cartouches de rétroaction
 * - Paramètres du cours (jetons, reprises, etc.)
 */
async function exporterConfigurationComplete() {
    // 1. Rassembler toutes les ressources
    const toutesEchelles = db.getSync('echellesTemplates', []);
    const toutesGrilles = db.getSync('grillesTemplates', []);
    const toutesProductions = db.getSync('productions', []);

    // ✅ MODIFIÉ (6 jan 2026) : Utiliser détection heuristique pour filtrer démo + importées
    const echelles = filtrerRessourcesNonDemo(toutesEchelles, 'echelle');
    const grilles = filtrerRessourcesNonDemo(toutesGrilles, 'grille');
    const productions = filtrerRessourcesNonDemo(toutesProductions, 'production');

    let nbExclues = (toutesEchelles.length - echelles.length) +
                    (toutesGrilles.length - grilles.length) +
                    (toutesProductions.length - productions.length);

    // Cartouches (stockage par grille) - aussi filtrées avec heuristique
    const cartouches = {};
    const allKeys = Object.keys(localStorage);
    for (let i = 0; i < allKeys.length; i++) {
        const key = allKeys[i];
        if (key && key.startsWith('cartouches_')) {
            const grilleId = key.replace('cartouches_', '');
            const toutesCartouches = db.getSync(key, []);
            const cartouchesFiltrees = filtrerRessourcesNonDemo(toutesCartouches, 'cartouche');
            nbExclues += toutesCartouches.length - cartouchesFiltrees.length;
            if (cartouchesFiltrees.length > 0) {
                cartouches[grilleId] = cartouchesFiltrees;
            }
        }
    }

    // Paramètres du cours
    const modalitesEvaluation = db.getSync('modalitesEvaluation', {});
    const parametres = {
        systeme_jetons: modalitesEvaluation.systemeJetons || false,
        reprises_autorisees: modalitesEvaluation.reprisesAutorisees || false,
        nombre_artefacts: modalitesEvaluation.nombreArtefacts || 0,
        pratique_active: modalitesEvaluation.pratiqueActive || 'sommative',
        mode_comparatif: modalitesEvaluation.modeComparatif || false
    };

    // Vérifier qu'il y a du contenu à exporter
    const nbCartouches = Object.values(cartouches).reduce((total, arr) => total + arr.length, 0);
    const nbRessources = echelles.length + grilles.length + productions.length + nbCartouches;

    if (nbRessources === 0) {
        if (nbExclues > 0) {
            alert(`Aucune ressource personnelle à exporter.\n\n${nbExclues} ressource(s) exclue(s) car elles proviennent du matériel démo ou d'imports de collègues.`);
        } else {
            alert('Aucune ressource à exporter.\n\nCréez d\'abord des grilles, échelles ou productions.');
        }
        return;
    }

    // Informer si des ressources ont été exclues
    if (nbExclues > 0) {
        console.log(`📦 Export: ${nbExclues} ressource(s) exclue(s) (démo/importées)`);
    }

    // 2. Demander les métadonnées enrichies (modal spécial pour config complète)
    const metaEnrichies = await demanderMetadonneesConfigComplete(nbRessources);

    if (!metaEnrichies) {
        console.log('Export annulé par l\'utilisateur');
        return;
    }

    // 3. Construire l'objet de configuration complète
    const configComplete = {
        metadata: {
            type: "configuration-complete",
            nom: metaEnrichies.nom,
            auteur: metaEnrichies.auteur,
            discipline: metaEnrichies.discipline,
            niveau: metaEnrichies.niveau,
            description: metaEnrichies.description,
            licence: "CC BY-NC-SA 4.0",
            licence_url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
            version: "1.0",
            date_creation: new Date().toISOString().split('T')[0],
            date_export: new Date().toISOString().split('T')[0],
            application_version: "Beta 91",
            email_auteur: metaEnrichies.email || "",
            site_auteur: metaEnrichies.site || ""
        },
        contenu: {
            echelles: echelles,
            grilles: grilles,
            productions: productions,
            cartouches: cartouches,
            parametres: parametres
        }
    };

    // 4. Générer nom de fichier
    const nomAuteurSimple = metaEnrichies.auteur.replace(/[^a-z0-9]/gi, '-');
    const dateStr = new Date().toISOString().split('T')[0];
    const nomFichierJSON = `PRATIQUE-COMPLETE-${nomAuteurSimple}-${dateStr}.json`;
    const nomFichierTXT = `LISEZMOI-${nomAuteurSimple}-${dateStr}.txt`;

    // 5. Générer le fichier LISEZMOI.txt
    const contenuLISEZMOI = genererFichierLISEZMOI(configComplete.metadata, {
        nbEchelles: echelles.length,
        nbGrilles: grilles.length,
        nbProductions: productions.length,
        nbCartouches: Object.keys(cartouches).reduce((total, grilleId) => total + cartouches[grilleId].length, 0)
    });

    // 6. Télécharger le JSON
    const blobJSON = new Blob([JSON.stringify(configComplete, null, 2)], { type: 'application/json' });
    const urlJSON = URL.createObjectURL(blobJSON);
    const aJSON = document.createElement('a');
    aJSON.href = urlJSON;
    aJSON.download = nomFichierJSON;
    document.body.appendChild(aJSON);
    aJSON.click();
    document.body.removeChild(aJSON);
    URL.revokeObjectURL(urlJSON);

    // 7. Télécharger le LISEZMOI.txt (avec un petit délai pour éviter le blocage navigateur)
    setTimeout(() => {
        const blobTXT = new Blob([contenuLISEZMOI], { type: 'text/plain;charset=utf-8' });
        const urlTXT = URL.createObjectURL(blobTXT);
        const aTXT = document.createElement('a');
        aTXT.href = urlTXT;
        aTXT.download = nomFichierTXT;
        document.body.appendChild(aTXT);
        aTXT.click();
        document.body.removeChild(aTXT);
        URL.revokeObjectURL(urlTXT);

        // 8. Notification de succès
        if (typeof afficherNotificationSucces === 'function') {
            afficherNotificationSucces('Configuration complète exportée avec succès!\n\n2 fichiers téléchargés: JSON + LISEZMOI.txt');
        }
        console.log('✅ Configuration complète exportée:', nomFichierJSON, '+', nomFichierTXT);
    }, 500);
}

/* ===============================
   EXPORTS VERS WINDOW (ACCESSIBLE DEPUIS HTML)
   =============================== */

// Fonctions appelées depuis le HTML (onclick)
window.executerImport = executerImport;
window.fermerModalImport = fermerModalImport;
// window.exporterDonneesJSON = exporterDonneesJSON; // ❌ Fonction n'existe plus
window.reinitialiserDonnees = reinitialiserDonnees;
// window.importerConfigComplete = importerConfigComplete; // ❌ Fonction n'existe plus
window.executerImportConfigComplete = executerImportConfigComplete;
window.exporterConfigurationComplete = exporterConfigurationComplete;
window.executerImportVersBibliotheques = executerImportVersBibliotheques; // 🆕 BETA 95.1
window.executerImportSelectif = executerImportSelectif; // 🆕 BETA 95.1

// 🆕 Beta 96.2 : Export des fonctions d'export (corrigées pour IndexedDB)
window.ouvrirModalExport = ouvrirModalExport;
window.fermerModalExport = fermerModalExport;
window.toggleToutesLesCles = toggleToutesLesCles;
window.executerExport = executerExport;