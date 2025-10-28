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
    
    const cles = [];
    for (let i = 0; i < localStorage.length; i++) {
        cles.push(localStorage.key(i));
    }
    
    let html = cles.map(cle => {
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

function executerImport() {
    if (!donneesImportEnAttente) return;

    if (!confirm('Confirmer l\'importation ? Les données existantes seront écrasées pour les clés importées.')) {
        return;
    }

    let nbCles = 0;
    Object.keys(donneesImportEnAttente).forEach(cle => {
        // IMPORTANT : Convertir en JSON string avant de sauvegarder dans localStorage
        const valeur = typeof donneesImportEnAttente[cle] === 'string'
            ? donneesImportEnAttente[cle]
            : JSON.stringify(donneesImportEnAttente[cle]);
        localStorage.setItem(cle, valeur);
        nbCles++;
    });
    
    fermerModalImport();
    
    if (typeof afficherNotificationSucces === 'function') {
        afficherNotificationSucces(`Import réussi : ${nbCles} clé(s) importée(s)`);
    } else {
        console.log(`Import réussi: ${nbCles} clés`);
    }
    
    if (confirm('Import terminé ! Recharger la page pour appliquer les changements ?')) {
        location.reload();
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
        localStorage.clear();
        alert('Toutes les données ont été effacées.\n\nLa page va se recharger.');
        location.reload();
    } catch (erreur) {
        console.error('Erreur lors de la réinitialisation:', erreur);
        alert('Erreur lors de la réinitialisation.');
    }
}