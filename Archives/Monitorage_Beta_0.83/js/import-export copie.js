/* ===============================
   📦 MODULE: IMPORT/EXPORT DE DONNÉES
   Adapté de index 35-M5
   =============================== */

/**
 * MODULE: import-export.js
 * 
 * RÔLE:
 * Gère l'exportation et l'importation sélective de données
 * stockées dans localStorage sous forme de fichiers JSON
 * 
 * FONCTIONNALITÉS:
 * - Export sélectif des clés localStorage
 * - Import avec aperçu et confirmation
 * - Sélection "Toutes les clés"
 * - Validation des fichiers JSON
 * 
 * ORIGINE:
 * Code extrait et adapté de index 35-M5 10-10-2025a
 * 
 * ORDRE DE CHARGEMENT:
 * 1. Charger config.js (variables globales)
 * 2. Charger navigation.js (gestion sections)
 * 3. Charger ce module
 * 4. Appeler initialiserModuleImportExport() depuis main.js
 * 
 * DÉPENDANCES:
 * - Classes CSS depuis styles.css
 * - localStorage (API navigateur)
 * - Modales HTML (modalExport, modalImport)
 * 
 * ÉVÉNEMENTS:
 * Les événements sont gérés via HTML (onclick, onchange)
 * 
 * COMPATIBILITÉ:
 * - Nécessite API File, FileReader, Blob
 * - Download attribute (HTML5)
 * - Tous navigateurs modernes (Chrome, Firefox, Safari, Edge)
 */

/* ===============================
   🔧 INITIALISATION DU MODULE
   =============================== */

/**
 * Initialise le module import/export
 * Vérifie la présence des modales
 * 
 * APPELÉE PAR:
 * - main.js au chargement de la page
 * 
 * FONCTIONNEMENT:
 * Vérifie que les éléments DOM existent (modales, boutons)
 */
function initialiserModuleImportExport() {
    console.log('📦 Module import-export initialisé');
    
    // Vérifier les modales
    const modalExport = document.getElementById('modalExport');
    const modalImport = document.getElementById('modalImport');
    
    if (modalExport && modalImport) {
        console.log('   ✓ Modales import/export détectées');
    } else {
        console.warn('   ⚠️ Modales import/export manquantes');
    }
}

/* ===============================
   📤 EXPORT DES DONNÉES
   =============================== */

/**
 * Exporte toutes les données localStorage en fichier JSON
 * 
 * FONCTIONNEMENT:
 * 1. Parcourt toutes les clés localStorage
 * 2. Crée un objet avec métadonnées + données
 * 3. Convertit en JSON
 * 4. Crée un Blob téléchargeable
 * 5. Déclenche le téléchargement
 * 
 * APPELÉE PAR:
 * - Bouton «Exporter toutes les données»
 * 
 * NOM FICHIER:
 * codex-numeris-backup-YYYYMMDD-HHMMSS.json
 * 
 * RETOUR:
 * - Téléchargement automatique du fichier
 * - Notification de succès
 */
function exporterDonnees() {
    try {
        // Préparer l'objet d'export
        const donnees = {};
        
        // Parcourir toutes les clés du localStorage
        for (let i = 0; i < localStorage.length; i++) {
            const cle = localStorage.key(i);
            donnees[cle] = localStorage.getItem(cle);
        }
        
        // Créer l'objet final avec métadonnées
        const exportComplet = {
            metadata: {
                version: '1.0',
                application: 'Codex Numeris',
                dateExport: new Date().toISOString(),
                nbCles: Object.keys(donnees).length
            },
            donnees: donnees
        };
        
        // Convertir en JSON
        const jsonString = JSON.stringify(exportComplet, null, 2);
        
        // Créer un Blob
        const blob = new Blob([jsonString], { type: 'application/json' });
        
        // Créer un lien de téléchargement
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        // Nom du fichier avec date/heure
        const maintenant = new Date();
        const dateStr = maintenant.toISOString().slice(0, 10).replace(/-/g, '');
        const heureStr = maintenant.toTimeString().slice(0, 8).replace(/:/g, '');
        a.download = `codex-numeris-backup-${dateStr}-${heureStr}.json`;
        
        // Déclencher le téléchargement
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Notification de succès
        afficherNotificationSucces(
            `Export réussi : ${Object.keys(donnees).length} clé(s) exportée(s)`
        );
        
        console.log('✓ Export réussi:', Object.keys(donnees).length, 'clés');
        
    } catch (erreur) {
        console.error('Erreur lors de l\'export:', erreur);
        alert('Erreur lors de l\'export des données. Consulte la console pour plus de détails.');
    }
}

/* ===============================
   📥 IMPORT DES DONNÉES
   =============================== */

/**
 * Variable globale pour stocker les données en attente d'import
 * Permet l'aperçu avant confirmation
 */
let donneesImportEnAttente = null;

/**
 * Ouvre la boîte de dialogue d'import
 * 
 * FONCTIONNEMENT:
 * Déclenche le clic sur l'input file caché
 * 
 * APPELÉE PAR:
 * - Bouton «Importer des données»
 */
function ouvrirImport() {
    document.getElementById('fichierImport').click();
}

/**
 * Traite le fichier sélectionné pour l'import
 * 
 * FONCTIONNEMENT:
 * 1. Lit le fichier JSON
 * 2. Parse et valide la structure
 * 3. Affiche un aperçu
 * 4. Demande confirmation
 * 
 * PARAMÈTRES:
 * @param {Event} event - Événement du changement de fichier
 * 
 * APPELÉE PAR:
 * - Input file (onchange)
 * 
 * VALIDATION:
 * - Fichier existe
 * - Extension .json
 * - Structure valide
 * - Contient des données
 */
function traiterFichierImport(event) {
    const fichier = event.target.files[0];
    
    if (!fichier) {
        return;
    }
    
    // Vérifier l'extension
    if (!fichier.name.endsWith('.json')) {
        alert('Erreur : Le fichier doit être au format .json');
        return;
    }
    
    // Lire le fichier
    const lecteur = new FileReader();
    
    lecteur.onload = function(e) {
        try {
            // Parser le JSON
            const contenu = JSON.parse(e.target.result);
            
            // Valider la structure
            if (!contenu.donnees) {
                alert('Erreur : Structure de fichier invalide (clé "donnees" manquante)');
                return;
            }
            
            // Stocker les données en attente
            donneesImportEnAttente = contenu.donnees;
            
            // Afficher l'aperçu
            afficherApercuImport(contenu);
            
        } catch (erreur) {
            console.error('Erreur lors de la lecture du fichier:', erreur);
            alert('Erreur : Impossible de lire le fichier JSON. Vérifie qu\'il est bien formaté.');
        }
    };
    
    lecteur.onerror = function() {
        alert('Erreur lors de la lecture du fichier');
    };
    
    lecteur.readAsText(fichier);
}

/**
 * Affiche un aperçu des données à importer
 * 
 * FONCTIONNEMENT:
 * Crée une modal avec résumé des données
 * 
 * PARAMÈTRES:
 * @param {Object} contenu - Objet complet avec metadata et donnees
 * 
 * APPELÉE PAR:
 * - traiterFichierImport() après validation
 * 
 * AFFICHAGE:
 * - Date d'export
 * - Nombre de clés
 * - Liste des clés principales
 * - Boutons Importer/Annuler
 */
function afficherApercuImport(contenu) {
    const metadata = contenu.metadata || {};
    const donnees = contenu.donnees || {};
    const nbCles = Object.keys(donnees).length;
    
    // Créer la modal
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-contenu" style="max-width: 600px;">
            <h3>📥 Aperçu de l'import</h3>
            
            <div class="carte" style="margin: 20px 0;">
                <h4>Informations du fichier</h4>
                <p><strong>Date d'export :</strong> ${metadata.dateExport ? new Date(metadata.dateExport).toLocaleString('fr-CA') : 'Non spécifiée'}</p>
                <p><strong>Nombre de clés :</strong> ${nbCles}</p>
            </div>
            
            <div class="carte" style="margin: 20px 0;">
                <h4>Clés à importer</h4>
                <div style="max-height: 200px; overflow-y: auto; font-family: monospace; font-size: 0.9rem;">
                    ${Object.keys(donnees).map(cle => `<div>• ${echapperHtml(cle)}</div>`).join('')}
                </div>
            </div>
            
            <div class="badge-alerte" style="margin: 20px 0;">
                ⚠️ <strong>Attention :</strong> L'import écrasera les données existantes pour les clés importées.
                Il est recommandé d'exporter tes données actuelles avant d'importer.
            </div>
            
            <div class="btn-groupe">
                <button class="btn btn-principal" onclick="confirmerImport()">
                    ✓ Confirmer l'import
                </button>
                <button class="btn btn-secondaire" onclick="annulerImport()">
                    ✖ Annuler
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

/**
 * Confirme et exécute l'import des données
 * 
 * FONCTIONNEMENT:
 * 1. Vérifie les données en attente
 * 2. Écrase localStorage avec nouvelles données
 * 3. Ferme la modal
 * 4. Rafraîchit l'interface
 * 
 * APPELÉE PAR:
 * - Bouton «Confirmer l'import» dans la modal
 * 
 * SÉCURITÉ:
 * - Double confirmation
 * - Notification du nombre de clés
 */
function confirmerImport() {
    if (!donneesImportEnAttente) {
        alert('Erreur : Aucune donnée en attente d\'import');
        return;
    }
    
    // Dernière confirmation
    if (!confirm('Confirmes-tu l\'import ? Les données actuelles seront écrasées pour les clés importées.')) {
        return;
    }
    
    try {
        // Importer les données
        let nbCles = 0;
        Object.keys(donneesImportEnAttente).forEach(cle => {
            localStorage.setItem(cle, donneesImportEnAttente[cle]);
            nbCles++;
        });
        
        // Nettoyer
        annulerImport();
        
        // Notification
        afficherNotificationSucces(`Import réussi : ${nbCles} clé(s) importée(s)`);
        
        // Recharger la page pour rafraîchir l'interface
        if (confirm('Import terminé ! Recharger la page pour appliquer les changements ?')) {
            location.reload();
        }
        
        console.log('✓ Import réussi:', nbCles, 'clés');
        
    } catch (erreur) {
        console.error('Erreur lors de l\'import:', erreur);
        alert('Erreur lors de l\'import des données. Consulte la console pour plus de détails.');
    }
}

/**
 * Annule l'import et ferme la modal
 * 
 * APPELÉE PAR:
 * - Bouton «Annuler» dans la modal
 * - confirmerImport() après succès
 */
function annulerImport() {
    // Réinitialiser les données en attente
    donneesImportEnAttente = null;
    
    // Réinitialiser l'input file
    const inputFile = document.getElementById('fichierImport');
    if (inputFile) {
        inputFile.value = '';
    }
    
    // Fermer la modal
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.remove();
    }
}

/* ===============================
   🗑️ RÉINITIALISATION
   =============================== */

/**
 * Efface toutes les données localStorage
 * 
 * FONCTIONNEMENT:
 * 1. Triple confirmation (sécurité)
 * 2. Vide localStorage
 * 3. Recharge la page
 * 
 * APPELÉE PAR:
 * - Bouton «Réinitialiser toutes les données»
 * 
 * SÉCURITÉ:
 * - Triple confirmation explicite
 * - Message d'avertissement clair
 * - Action irréversible
 */
function reinitialiserDonnees() {
    // Première confirmation
    if (!confirm('⚠️ ATTENTION : Cette action va effacer TOUTES les données de l\'application.\n\n' +
                'Es-tu sûr de vouloir continuer ?')) {
        return;
    }
    
    // Deuxième confirmation
    if (!confirm('Cette action est IRRÉVERSIBLE.\n\n' +
                'As-tu exporté tes données avant de continuer ?')) {
        return;
    }
    
    // Troisième confirmation avec saisie
    const confirmation = prompt('Pour confirmer, tape "EFFACER" en majuscules :');
    
    if (confirmation !== 'EFFACER') {
        alert('Réinitialisation annulée');
        return;
    }
    
    try {
        // Effacer toutes les données
        localStorage.clear();
        
        // Notification
        alert('✓ Toutes les données ont été effacées.\n\nLa page va se recharger.');
        
        // Recharger la page
        location.reload();
        
    } catch (erreur) {
        console.error('Erreur lors de la réinitialisation:', erreur);
        alert('Erreur lors de la réinitialisation. Consulte la console pour plus de détails.');
    }
}

/* ===============================
   📊 STATISTIQUES
   =============================== */

/**
 * Affiche les statistiques de stockage
 * 
 * FONCTIONNEMENT:
 * Calcule la taille approximative des données
 * 
 * APPELÉE PAR:
 * - Chargement de la sous-section import-export
 * 
 * AFFICHAGE:
 * - Nombre de clés
 * - Taille approximative en Ko
 * - Liste des clés principales
 */
function afficherStatistiquesStockage() {
    const container = document.getElementById('statistiquesStockage');
    
    if (!container) {
        return;
    }
    
    // Calculer les statistiques
    const nbCles = localStorage.length;
    let tailleApproximative = 0;
    
    for (let i = 0; i < localStorage.length; i++) {
        const cle = localStorage.key(i);
        const valeur = localStorage.getItem(cle);
        tailleApproximative += cle.length + valeur.length;
    }
    
    // Convertir en Ko
    const tailleKo = (tailleApproximative / 1024).toFixed(2);
    
    // Afficher
    container.innerHTML = `
        <div class="carte">
            <h4>📊 Statistiques de stockage</h4>
            <p><strong>Nombre de clés :</strong> ${nbCles}</p>
            <p><strong>Taille approximative :</strong> ${tailleKo} Ko</p>
            <p class="text-muted" style="font-size: 0.9rem; margin-top: 10px;">
                Note : La limite de localStorage varie selon les navigateurs (généralement 5-10 Mo)
            </p>
        </div>
    `;
}

/* ===============================
   📌 NOTES D'UTILISATION
   =============================== */

/*
 * DÉPENDANCES DE CE MODULE:
 * - config.js (fonction echapperHtml)
 * - styles.css (classes modal, carte, btn)
 * 
 * MODULES QUI DÉPENDENT DE CELUI-CI:
 * - Aucun (module autonome)
 * 
 * ORDRE DE CHARGEMENT:
 * Ce module peut être chargé après config.js et navigation.js
 * 
 * LOCALSTORAGE UTILISÉ:
 * - Toutes les clés (lecture/écriture complète)
 * 
 * COMPATIBILITÉ:
 * - Chrome, Firefox, Safari, Edge (dernières versions)
 * - Nécessite support File API et Blob
 * - Nécessite download attribute sur <a>
 * 
 * SÉCURITÉ:
 * - Validation des fichiers JSON
 * - Confirmations multiples pour actions destructives
 * - Gestion des erreurs
 */