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
 * @param {Event} event - Événement de sélection de fichier
 */
function previsualiserConfigComplete(event) {
    const fichier = event.target.files[0];
    if (!fichier) return;

    const lecteur = new FileReader();
    lecteur.onload = function(e) {
        try {
            const config = JSON.parse(e.target.result);

            // Validation: vérifier que c'est bien une configuration complète
            if (!config.metadata || config.metadata.type !== 'configuration-complete') {
                alert('Fichier invalide. Ce n\'est pas une configuration complète exportée par Monitorage.');
                return;
            }

            if (!config.contenu) {
                alert('Fichier invalide. La structure de la configuration est incorrecte.');
                return;
            }

            // Stocker la configuration en attente
            configCompleteEnAttente = config;

            // Afficher le modal de prévisualisation
            afficherModalPreviewConfigComplete(config);

        } catch (err) {
            alert('Erreur lors de la lecture du fichier JSON.\n\n' + err.message);
            console.error('Erreur parsing JSON:', err);
        }
    };
    lecteur.readAsText(fichier);
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

    // Créer le modal
    const modalHTML = `
        <div id="modalPreviewConfigComplete" style="display: flex; position: fixed; top: 0; left: 0;
             width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 10000;
             align-items: center; justify-content: center;">
            <div style="background: white; border-radius: 8px; padding: 30px; max-width: 600px;
                 width: 90%; max-height: 80vh; overflow-y: auto;">

                <h2 style="margin-top: 0; color: var(--bleu-moyen); border-bottom: 2px solid var(--bleu-pale);
                     padding-bottom: 10px;">
                    Aperçu de la configuration
                </h2>

                <!-- Métadonnées -->
                <div style="background: var(--bleu-tres-pale); border-left: 4px solid var(--bleu-moyen);
                     padding: 15px; margin-bottom: 20px; border-radius: 4px;">
                    <h3 style="margin-top: 0; font-size: 1.1rem;">📋 ${meta.nom}</h3>
                    <p style="margin: 5px 0;"><strong>Auteur :</strong> ${meta.auteur}</p>
                    ${meta.discipline && meta.discipline.length > 0
                        ? `<p style="margin: 5px 0;"><strong>Discipline :</strong> ${meta.discipline.join(', ')}</p>`
                        : ''}
                    ${meta.niveau ? `<p style="margin: 5px 0;"><strong>Niveau :</strong> ${meta.niveau}</p>` : ''}
                    ${meta.description
                        ? `<p style="margin: 10px 0 5px 0; font-style: italic; color: var(--gris-fonce);">${meta.description}</p>`
                        : ''}
                    <p style="margin: 10px 0 0 0; font-size: 0.85rem; color: var(--gris-moyen);">
                        Version ${meta.version} • Exportée le ${meta.date_export}
                    </p>
                </div>

                <!-- Contenu -->
                <div style="background: white; border: 1px solid var(--bleu-pale); padding: 15px;
                     margin-bottom: 20px; border-radius: 4px;">
                    <h3 style="margin-top: 0; font-size: 1rem; color: var(--bleu-moyen);">📦 Contenu de la configuration</h3>
                    <ul style="list-style: none; padding-left: 0; margin: 10px 0;">
                        <li style="padding: 5px 0; border-bottom: 1px solid var(--bleu-tres-pale);">
                            ✓ ${nbEchelles} échelle(s) de performance
                        </li>
                        <li style="padding: 5px 0; border-bottom: 1px solid var(--bleu-tres-pale);">
                            ✓ ${nbGrilles} grille(s) de critères
                        </li>
                        <li style="padding: 5px 0; border-bottom: 1px solid var(--bleu-tres-pale);">
                            ✓ ${nbProductions} production(s) pédagogique(s)
                        </li>
                        <li style="padding: 5px 0; border-bottom: 1px solid var(--bleu-tres-pale);">
                            ✓ ${nbCartouches} cartouche(s) de rétroaction
                        </li>
                        <li style="padding: 5px 0;">
                            ✓ Paramètres du cours (jetons, reprises, etc.)
                        </li>
                    </ul>
                </div>

                <!-- Avertissement -->
                <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px;
                     margin-bottom: 20px; border-radius: 4px;">
                    <p style="margin: 0; font-size: 0.9rem; color: #856404;">
                        <strong>⚠️ Attention :</strong> Cette action va importer toutes les ressources de cette configuration.
                        Les ressources existantes avec les mêmes identifiants seront écrasées.
                    </p>
                </div>

                <!-- Boutons -->
                <div style="display: flex; gap: 10px; justify-content: flex-end;">
                    <button onclick="fermerModalPreviewConfigComplete()"
                            style="padding: 10px 20px; background: var(--gris-clair); color: var(--gris-fonce);
                                   border: none; border-radius: 4px; cursor: pointer; font-size: 0.95rem;">
                        Annuler
                    </button>
                    <button onclick="executerImportConfigComplete()"
                            style="padding: 10px 20px; background: var(--bleu-moyen); color: white;
                                   border: none; border-radius: 4px; cursor: pointer; font-size: 0.95rem;
                                   font-weight: 500;">
                        Importer cette configuration
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
 */
function executerImportConfigComplete() {
    if (!configCompleteEnAttente) {
        alert('Aucune configuration en attente d\'importation.');
        return;
    }

    const config = configCompleteEnAttente;
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