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
   EXPORT DES DONNÉES
   =============================== */

function ouvrirModalExport() {
    const modal = document.getElementById('modalExport');
    const liste = document.getElementById('listeClesExport');

    // Récupérer toutes les clés localStorage (pour export complet)
    const cles = Object.keys(localStorage);

    let html = cles.map(cle => {
        // KEPT: localStorage.getItem() pour obtenir la string JSON brute (calcul taille)
        const valeur = localStorage.getItem(cle);
        const tailleKo = ((cle.length + valeur.length) / 1024).toFixed(2);
        
        return `
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
    }).join('');
    
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

function executerExport() {
    const clesSelectionnees = [];
    document.querySelectorAll('.cle-export:checked').forEach(cb => {
        clesSelectionnees.push(cb.value);
    });
    
    if (clesSelectionnees.length === 0) {
        alert('Aucune clé sélectionnée');
        return;
    }
    
    const donnees = {};
    clesSelectionnees.forEach(cle => {
        // KEPT: localStorage.getItem() pour obtenir la string JSON brute (export)
        donnees[cle] = localStorage.getItem(cle);
    });

    const json = JSON.stringify(donnees, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    const dateStr = new Date().toISOString().slice(0, 10);
    a.download = `export-monitorage-${dateStr}.json`;
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
    
    const lecteur = new FileReader();
    lecteur.onload = function(e) {
        try {
            const donnees = JSON.parse(e.target.result);
            donneesImportEnAttente = donnees;
            
            const nbCles = Object.keys(donnees).length;
            let tailleTotale = 0;
            Object.values(donnees).forEach(v => {
                tailleTotale += v.length * 2;
            });
            const tailleKo = (tailleTotale / 1024).toFixed(2);
            
            const apercu = document.getElementById('apercu-import');
            apercu.innerHTML = `
                <strong>Fichier valide</strong><br>
                <span style="color: var(--bleu-leger); font-size: 0.9rem;">
                    ${nbCles} clé(s) · ${tailleKo} Ko
                </span>
            `;
            apercu.style.display = 'block';
            
            document.getElementById('btnExecuterImport').disabled = false;
            document.getElementById('btnExecuterImport').style.opacity = '1';
            
        } catch (err) {
            alert('Fichier JSON invalide');
            console.error('Erreur de parsing JSON:', err);
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
function afficherModalPreviewLocalStorageBrut(config, nomFichier) {
    const cles = Object.keys(config);
    const nbCles = cles.length;

    // Calculer la taille approximative
    let tailleTotale = 0;
    Object.values(config).forEach(v => {
        tailleTotale += (typeof v === 'string' ? v.length : JSON.stringify(v).length) * 2;
    });
    const tailleKo = (tailleTotale / 1024).toFixed(1);

    // Analyser les ressources disponibles pour les bibliothèques
    const ressourcesBiblio = analyserRessourcesBibliotheques(config);

    const modalHTML = `
        <div id="modalPreviewConfigComplete" style="display: flex; position: fixed; top: 0; left: 0;
             width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 10000;
             align-items: center; justify-content: center;">
            <div style="background: white; border-radius: 10px; padding: 30px; max-width: 620px;
                 width: 90%; max-height: 85vh; overflow-y: auto;">

                <h2 style="margin-top: 0; color: var(--bleu-moyen); border-bottom: 2px solid var(--bleu-pale);
                     padding-bottom: 10px;">
                    Fichier analysé
                </h2>

                <!-- Type détecté -->
                <div style="background: #fff8e6; border: 1px solid #f0c36d; border-radius: 8px;
                     padding: 15px; margin-bottom: 20px;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span style="font-size: 2rem;">💾</span>
                        <div>
                            <strong style="color: #8a6d3b; font-size: 1.1rem;">Sauvegarde personnelle</strong>
                            <p style="margin: 4px 0 0 0; font-size: 0.9rem; color: #666;">
                                Ce fichier contient une sauvegarde complète de données Monitorage.
                            </p>
                            <p style="margin: 4px 0 0 0; font-size: 0.8rem; color: #999;">
                                ${nomFichier} · ${nbCles} éléments · ~${tailleKo} Ko
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Question : que veux-tu faire ? -->
                <p style="font-size: 1rem; color: #333; margin-bottom: 15px; font-weight: 500;">
                    Que souhaites-tu faire avec ce fichier ?
                </p>

                <!-- OPTION 1: Récupérer les ressources (recommandé si collègue) -->
                <div style="background: #d4edda; border: 2px solid #28a745; border-radius: 8px;
                     padding: 18px; margin-bottom: 12px; ${ressourcesBiblio.total === 0 ? 'opacity: 0.5;' : ''}">
                    <h3 style="margin: 0 0 8px 0; color: #155724; font-size: 1rem;">
                        📚 Récupérer les ressources pédagogiques
                        ${ressourcesBiblio.total > 0 ? '<span style="background: #28a745; color: white; font-size: 0.7rem; padding: 2px 8px; border-radius: 10px; margin-left: 8px;">Recommandé</span>' : ''}
                    </h3>
                    <p style="margin: 0 0 10px 0; font-size: 0.9rem; color: #155724;">
                        Ajoute les grilles, échelles et pratiques à tes bibliothèques.
                        <strong>Tes données actuelles sont préservées.</strong>
                    </p>

                    ${ressourcesBiblio.total > 0 ? `
                    <div style="background: white; border-radius: 4px; padding: 10px; margin-bottom: 10px; font-size: 0.85rem;">
                        ${ressourcesBiblio.pratiques > 0 ? `✓ ${ressourcesBiblio.pratiques} pratique(s) · ` : ''}
                        ${ressourcesBiblio.grilles > 0 ? `✓ ${ressourcesBiblio.grilles} grille(s) · ` : ''}
                        ${ressourcesBiblio.echelles > 0 ? `✓ ${ressourcesBiblio.echelles} échelle(s) · ` : ''}
                        ${ressourcesBiblio.productions > 0 ? `✓ ${ressourcesBiblio.productions} production(s)` : ''}
                    </div>
                    ` : '<p style="font-size: 0.85rem; color: #666; margin-bottom: 10px;">Aucune ressource de bibliothèque détectée dans ce fichier.</p>'}

                    <button onclick="executerImportVersBibliotheques()"
                            style="padding: 10px 20px; background: #28a745; color: white;
                                   border: none; border-radius: 4px; cursor: pointer; font-size: 0.95rem;"
                            ${ressourcesBiblio.total === 0 ? 'disabled' : ''}>
                        Ajouter à mes bibliothèques
                    </button>
                </div>

                <!-- OPTION 2: Restaurer (sa propre sauvegarde) -->
                <div style="background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px;
                     padding: 18px; margin-bottom: 20px;">
                    <h3 style="margin: 0 0 8px 0; color: #495057; font-size: 1rem;">
                        🔄 Restaurer cette sauvegarde
                    </h3>
                    <p style="margin: 0 0 10px 0; font-size: 0.9rem; color: #6c757d;">
                        C'est ta propre sauvegarde ? Restaure toutes tes données.
                    </p>

                    <div style="background: #fff3cd; border-left: 3px solid #ffc107; padding: 8px 12px;
                         margin-bottom: 10px; border-radius: 0 4px 4px 0;">
                        <p style="margin: 0; font-size: 0.8rem; color: #856404;">
                            ⚠️ Tes données actuelles seront remplacées
                        </p>
                    </div>

                    <button onclick="executerImportConfigComplete()"
                            style="padding: 10px 20px; background: #6c757d; color: white;
                                   border: none; border-radius: 4px; cursor: pointer; font-size: 0.95rem;">
                        Restaurer mes données
                    </button>
                </div>

                <!-- Bouton Annuler -->
                <div style="text-align: right;">
                    <button onclick="fermerModalPreviewConfigComplete()"
                            style="padding: 10px 20px; background: white; color: var(--gris-fonce);
                                   border: 1px solid var(--gris-clair); border-radius: 4px;
                                   cursor: pointer; font-size: 0.95rem;">
                        Annuler
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
 * Analyse les ressources d'un export localStorage pour les bibliothèques
 * @param {Object} config - Données brutes localStorage
 * @returns {Object} Comptage des ressources par type
 */
function analyserRessourcesBibliotheques(config) {
    const result = { pratiques: 0, grilles: 0, echelles: 0, productions: 0, total: 0 };

    // Parser les valeurs si elles sont des strings JSON
    const parseValeur = (val) => {
        if (typeof val === 'string') {
            try { return JSON.parse(val); } catch (e) { return val; }
        }
        return val;
    };

    // Pratiques configurables
    if (config.pratiquesConfigurables) {
        const pratiques = parseValeur(config.pratiquesConfigurables);
        if (Array.isArray(pratiques)) result.pratiques = pratiques.length;
    }

    // Grilles (plusieurs sources possibles)
    if (config.bibliothequeGrilles) {
        const grilles = parseValeur(config.bibliothequeGrilles);
        if (Array.isArray(grilles)) result.grilles += grilles.length;
    }
    if (config.grillesTemplates) {
        const grilles = parseValeur(config.grillesTemplates);
        if (Array.isArray(grilles)) result.grilles += grilles.length;
    }

    // Échelles
    if (config.echellesTemplates) {
        const echelles = parseValeur(config.echellesTemplates);
        if (Array.isArray(echelles)) result.echelles = echelles.length;
    }

    // Productions (plusieurs sources possibles)
    if (config.bibliothequeProductions) {
        const prods = parseValeur(config.bibliothequeProductions);
        if (Array.isArray(prods)) result.productions += prods.length;
    }

    result.total = result.pratiques + result.grilles + result.echelles + result.productions;
    return result;
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
        const grillesExistantes = db.getSync('grillesTemplates', []);
        const idsGrillesExistants = new Set(grillesExistantes.map(g => g.id));
        let grillesNouvelles = [];

        // Depuis grillesTemplates
        if (donnees.grillesTemplates) {
            const grillesImport = parseValeur(donnees.grillesTemplates);
            if (Array.isArray(grillesImport)) {
                grillesImport.forEach(g => {
                    if (!idsGrillesExistants.has(g.id) &&
                        !grillesExistantes.some(ge => ge.nom === g.nom)) {
                        grillesNouvelles.push({
                            ...g,
                            id: 'GRILLE_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
                            dateImport: new Date().toISOString()
                        });
                    }
                });
            }
        }

        // Depuis bibliothequeGrilles (autre clé possible)
        if (donnees.bibliothequeGrilles) {
            const grillesImport = parseValeur(donnees.bibliothequeGrilles);
            if (Array.isArray(grillesImport)) {
                grillesImport.forEach(g => {
                    if (!idsGrillesExistants.has(g.id) &&
                        !grillesExistantes.some(ge => ge.nom === g.nom) &&
                        !grillesNouvelles.some(gn => gn.nom === g.nom)) {
                        grillesNouvelles.push({
                            ...g,
                            id: 'GRILLE_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
                            dateImport: new Date().toISOString()
                        });
                    }
                });
            }
        }

        if (grillesNouvelles.length > 0) {
            const grillesFusionnees = [...grillesExistantes, ...grillesNouvelles];
            db.setSync('grillesTemplates', grillesFusionnees);
            compteurs.grilles = grillesNouvelles.length;
            console.log(`✅ ${grillesNouvelles.length} grille(s) ajoutée(s)`);
        }

        // 3. ÉCHELLES
        if (donnees.echellesTemplates) {
            const echellesImport = parseValeur(donnees.echellesTemplates);
            if (Array.isArray(echellesImport) && echellesImport.length > 0) {
                const echellesExistantes = db.getSync('echellesTemplates', []);
                const idsEchellesExistants = new Set(echellesExistantes.map(e => e.id));

                const echellesNouvelles = echellesImport.filter(e => {
                    if (idsEchellesExistants.has(e.id)) return false;
                    if (echellesExistantes.some(ee => ee.nom === e.nom)) return false;
                    return true;
                }).map(e => ({
                    ...e,
                    id: 'ECH_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
                    dateImport: new Date().toISOString()
                }));

                if (echellesNouvelles.length > 0) {
                    const echellesFusionnees = [...echellesExistantes, ...echellesNouvelles];
                    db.setSync('echellesTemplates', echellesFusionnees);
                    compteurs.echelles = echellesNouvelles.length;
                    console.log(`✅ ${echellesNouvelles.length} échelle(s) ajoutée(s)`);
                }
            }
        }

        // 4. PRODUCTIONS (depuis bibliothequeProductions)
        if (donnees.bibliothequeProductions) {
            const prodsImport = parseValeur(donnees.bibliothequeProductions);
            if (Array.isArray(prodsImport) && prodsImport.length > 0) {
                const cleProductions = (typeof window.cle === 'function') ? window.cle('productions') : 'productions';
                const prodsExistantes = db.getSync(cleProductions, []);
                const idsProdsExistants = new Set(prodsExistantes.map(p => p.id));

                const prodsNouvelles = prodsImport.filter(p => {
                    if (idsProdsExistants.has(p.id)) return false;
                    if (prodsExistantes.some(pe => pe.nom === p.nom)) return false;
                    return true;
                }).map(p => ({
                    ...p,
                    id: 'PROD_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
                    dateImport: new Date().toISOString()
                }));

                if (prodsNouvelles.length > 0) {
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
    const echelles = db.getSync('echellesTemplates', []);
    const grilles = db.getSync('grillesTemplates', []);
    const productions = db.getSync('productions', []);

    // Cartouches (stockage par grille)
    const cartouches = {};
    const allKeys = Object.keys(localStorage);
    for (let i = 0; i < allKeys.length; i++) {
        const key = allKeys[i];
        if (key && key.startsWith('cartouches_')) {
            const grilleId = key.replace('cartouches_', '');
            cartouches[grilleId] = db.getSync(key, []);
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
    const nbRessources = echelles.length + grilles.length + productions.length + Object.keys(cartouches).length;
    if (nbRessources === 0) {
        alert('Aucune ressource à exporter.\n\nCréez d\'abord des grilles, échelles ou productions.');
        return;
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