/* ===============================
   MODULE 11: GESTION DU GROUPE D'ÉTUDIANTS
   Index: 50 10-10-2025a → Modularisation
   
   ⚠️ AVERTISSEMENT ⚠️
   Ce module gère la liste complète des étudiants inscrits :
   ajout manuel, import CSV/TSV, modification, suppression, export.
   
   Contenu:
   - Ajout manuel d'étudiants
   - Import par fichier CSV/TSV
   - Import par copier-coller
   - Prévisualisation avant import
   - Modification via modal
   - Suppression avec confirmation
   - Filtrage par groupe
   - Export CSV
   - Réinitialisation complète
   - Statistiques par groupe
   =============================== */

/* ===============================
   DÉPENDANCES
   
   Modules requis (AVANT):
   - 01-config.js : echapperHtml()
   
   Éléments HTML requis:
   - Formulaire ajout: #etudiantDA, #etudiantGroupe, #etudiantNom, 
     #etudiantPrenom, #etudiantProgramme, #etudiantSA, #etudiantCAF
   - Import: #fichierCsvEntree, #donneesCollees, #previewZone, #previewTable
   - Liste: #students-tbody, #students-list-container, #no-students-msg
   - Statistiques: #nbEtudiantsTotal, #nbGroupes, #detailGroupes
   - Filtrage: #filtreGroupe, #compteurFiltres
   
   LocalStorage:
   - 'groupeEtudiants' : Array des étudiants
   =============================== */

/* ===============================
   🚀 INITIALISATION
   =============================== */

/**
 * Notifications temporaires (en attendant module 14-utilitaires.js)
 */
function afficherNotificationSucces(titre, details = '') {
    const notification = document.createElement('div');
    notification.className = 'notification-succes';
    notification.innerHTML = `
        <div style="font-weight: 600; margin-bottom: 5px;">${echapperHtml(titre)}</div>
        ${details ? `<div class="notification-details">${echapperHtml(details)}</div>` : ''}
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

function afficherNotificationErreur(titre, details = '') {
    const notification = document.createElement('div');
    notification.className = 'notification-succes';
    notification.style.background = '#dc3545';
    notification.innerHTML = `
        <div style="font-weight: 600; margin-bottom: 5px;">${echapperHtml(titre)}</div>
        ${details ? `<div class="notification-details">${echapperHtml(details)}</div>` : ''}
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

/**
 * Variable globale pour l'import temporaire
 */
let tempImportData = [];

/**
 * SUPPRIMÉ : Cette fonction écrasait celle de modes.js et empêchait l'anonymisation
 * La vraie fonction obtenirDonneesSelonMode() est définie dans modes.js
 * et gère correctement les modes Normal/Simulation/Anonymisation
 */
// function obtenirDonneesSelonMode(cle) - SUPPRIMÉE, utiliser celle de modes.js

/**
 * sauvegarderDonneesSelonMode() - SUPPRIMÉE, utiliser celle de modes.js
 * La vraie fonction est définie dans modes.js et gère correctement :
 * - Le blocage en mode Anonymisation
 * - Les erreurs de quota (QuotaExceededError)
 */
// function sauvegarderDonneesSelonMode(cle, donnees) - SUPPRIMÉE

/**
 * Filtre les étudiants selon le mode (exclut le groupe 9999 par défaut)
 * @param {Array} etudiants - Tableau des étudiants
 * @returns {Array} - Étudiants filtrés
 */
function filtrerEtudiantsParMode(etudiants) {
    // Exclure le groupe 9999 (groupe de démonstration/anonyme)
    return etudiants.filter(e => e.groupe !== '9999');
}

/**
 * ✅ CORRECTION CRITIQUE (Beta 95 - 2 jan 2026)
 * Obtient TOUS les étudiants sans filtrage par coursId
 * (pour sauvegarder correctement sans perdre les autres cours)
 */
function obtenirTousLesEtudiants() {
    const cleEffective = (typeof window.cle === 'function') ? window.cle('groupeEtudiants') : 'groupeEtudiants';
    return db.getSync(cleEffective, []);
}

/**
 * ✅ CORRECTION CRITIQUE (Beta 95 - 2 jan 2026)
 * Sauvegarde TOUS les étudiants vers la clé namespacée
 * Préserve les étudiants des autres cours
 */
function sauvegarderTousLesEtudiants(etudiants) {
    const cleEffective = (typeof window.cle === 'function') ? window.cle('groupeEtudiants') : 'groupeEtudiants';
    db.setSync(cleEffective, etudiants);
    console.log(`💾 Sauvegarde ${etudiants.length} étudiants dans ${cleEffective}`);
}

/**
 * Initialise le module
 */
function initialiserModuleGroupe() {
    console.log('👥 Initialisation du module Groupe');

    const tbody = document.getElementById('students-tbody');
    if (!tbody) {
        console.log('   ⚠️  Section groupe non active - tbody introuvable');
        return;
    }

    // DEBUG: Vérifier les données
    const donnees = obtenirDonneesSelonMode('groupeEtudiants');
    console.log(`   📊 Nombre d'étudiants dans localStorage: ${donnees.length}`);
    if (donnees.length > 0) {
        console.log(`   👤 Premier étudiant:`, donnees[0]);
    }

    afficherListeEtudiants();
    remplirSelectFiltreGroupe();

    console.log('   ✅ Module Groupe initialisé');
}

/* ===============================
   ➕ AJOUT MANUEL
   =============================== */

/**
 * Ajoute un étudiant manuellement via le formulaire
 */
function addStudent() {
    // DEBUG : Logs pour identifier le problème
    console.log('🔍 DEBUG addStudent appelée');

    // ============================================
    // VÉRIFIER SI ON EST EN MODE MODIFICATION
    // ============================================
    const daEnModification = sessionStorage.getItem('etudiantEnModification');
    let modeModification = false;

    if (daEnModification) {
        console.log('🔄 Mode modification détecté pour DA:', daEnModification);
        modeModification = true;
    }

    const champNom = document.getElementById('etudiantNom');
    const champPrenom = document.getElementById('etudiantPrenom');

    console.log('Champ nom trouvé ?', champNom);
    console.log('Champ prénom trouvé ?', champPrenom);

    if (!champNom || !champPrenom) {
        afficherNotificationErreur('Erreur technique', 'Les champs du formulaire sont introuvables. Vérifiez les IDs.');
        return;
    }

    const nom = champNom.value.trim();
    const prenom = champPrenom.value.trim();

    console.log('Valeur nom:', nom);
    console.log('Valeur prénom:', prenom);

    if (!nom || !prenom) {
        afficherNotificationErreur('Informations manquantes', 'Le nom et le prénom sont obligatoires');
        return;
    }

    try {
        // ✅ CORRECTION CRITIQUE (Beta 95 - 27 déc 2025) : Ajouter coursId
        const coursId = typeof obtenirCoursActifId === 'function' ? obtenirCoursActifId() : null;

        const student = {
            id: Date.now(),
            da: document.getElementById('etudiantDA').value.trim() || `AUTO-${Date.now()}`,
            groupe: document.getElementById('etudiantGroupe').value.trim() || '1',
            nom: nom,
            prenom: prenom,
            programme: document.getElementById('etudiantProgramme').value.trim() || '---',
            sa: document.getElementById('etudiantSA').value || '',
            caf: document.getElementById('etudiantCAF').value || '',
            coursId: coursId  // ✅ Lier l'étudiant au cours actif
        };

        // ✅ CORRECTION CRITIQUE (Beta 95 - 2 jan 2026)
        // Utiliser obtenirTousLesEtudiants() pour ne pas perdre les autres cours
        let tousLesEtudiants = obtenirTousLesEtudiants();

        // Pour les vérifications, utiliser la liste du cours actif
        let studentsCours = tousLesEtudiants.filter(s => s.coursId === coursId);

        // ============================================
        // SI MODE MODIFICATION : SUPPRIMER L'ANCIEN
        // ============================================
        if (modeModification) {
            console.log('Suppression de l\'ancien étudiant avec DA:', daEnModification);
            // Supprimer de la liste complète (pas seulement du cours)
            tousLesEtudiants = tousLesEtudiants.filter(s => s.da !== daEnModification);
        }

        // Vérifier doublons DA dans le cours actif (sauf si c'est le même DA en modification)
        if (student.da !== '' && !student.da.startsWith('AUTO-')) {
            const existe = studentsCours.find(s => s.da === student.da);
            if (existe && (!modeModification || student.da !== daEnModification)) {
                if (!confirm(`Un·e étudiant·e avec le DA ${student.da} existe déjà dans ce cours.\nContinuer quand même ?`)) {
                    return;
                }
            }
        }

        tousLesEtudiants.push(student);
        sauvegarderTousLesEtudiants(tousLesEtudiants);

        // Prévisualisation
        const actionTexte = modeModification ? 'Étudiant·e modifié·e' : 'Étudiant·e ajouté·e';
        afficherPrevisualisation([student], actionTexte);

        // Réinitialiser formulaire
        document.getElementById('etudiantDA').value = '';
        document.getElementById('etudiantGroupe').value = '';
        document.getElementById('etudiantNom').value = '';
        document.getElementById('etudiantPrenom').value = '';
        document.getElementById('etudiantProgramme').value = '';
        document.getElementById('etudiantSA').value = '';
        document.getElementById('etudiantCAF').value = '';

        // ============================================
        // NETTOYER LE MODE MODIFICATION
        // ============================================
        if (modeModification) {
            sessionStorage.removeItem('etudiantEnModification');

            // Réinitialiser le bouton - chercher d'abord dans l'accordéon V2
            const accordeonGroupe = document.getElementById('accordeon-groupe');
            let btnAjouter = null;
            if (accordeonGroupe) {
                btnAjouter = accordeonGroupe.querySelector('button[onclick*="addStudent"]');
            }
            if (!btnAjouter) {
                btnAjouter = document.querySelector('button[onclick*="addStudent"]');
            }
            if (btnAjouter) {
                btnAjouter.textContent = 'Ajouter';
                btnAjouter.style.background = '';
            }
        }

        const details = `${student.nom}, ${student.prenom} (DA: ${student.da})`;
        const messageSucces = modeModification ? 'Étudiant·e modifié·e avec succès !' : 'Étudiant·e ajouté·e avec succès !';
        afficherNotificationSucces(messageSucces, details);

        afficherListeEtudiants();
        remplirSelectFiltreGroupe();

    } catch (error) {
        afficherNotificationErreur('Erreur lors de l\'ajout', error.message);
        console.error('Erreur ajout:', error);
    }
}

/* ===============================
   IMPORT CSV/TSV
   =============================== */

/**
 * Gère l'import depuis un fichier
 */
function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const content = e.target.result;
        parseAndPreview(content);
    };
    reader.readAsText(file);
}

/**
 * Gère l'import par copier-coller
 */
function previewPastedData() {
    const content = document.getElementById('donneesCollees').value;
    if (!content.trim()) {
        afficherNotificationErreur('Aucune donnée', 'Collez des données avant de prévisualiser');
        return;
    }
    parseAndPreview(content);
}

/**
 * Parse et affiche la prévisualisation
 * VERSION TOLÉRANTE : Accepte presque tous les formats
 */
function parseAndPreview(content) {
    try {
        console.log('🧹 Nettoyage automatique des données importées...');

        // ÉTAPE 1 : Normaliser les sauts de ligne
        content = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

        // ÉTAPE 2 : Détecter intelligemment le séparateur
        const detecterSeparateur = (ligne) => {
            const separateurs = ['\t', ';', ',', '|'];
            let meilleurSep = '\t';
            let maxColonnes = 0;

            for (const sep of separateurs) {
                const colonnes = ligne.split(sep).length;
                if (colonnes > maxColonnes) {
                    maxColonnes = colonnes;
                    meilleurSep = sep;
                }
            }
            return meilleurSep;
        };

        const lines = content.trim().split('\n').filter(l => l.trim());
        if (lines.length === 0) {
            afficherNotificationErreur('Fichier vide', 'Le fichier ne contient aucune données.');
            return;
        }

        // Détecter séparateur sur première ligne non-vide
        const separator = detecterSeparateur(lines[0]);
        console.log(`✓ Séparateur détecté: "${separator === '\t' ? 'TAB' : separator}"`);

        tempImportData = [];
        let ligneSautees = 0;

        lines.forEach((line, index) => {
            if (!line.trim()) return;

            // Split avec le séparateur détecté
            let parts = line.split(separator).map(p => {
                // Nettoyer format Excel ="valeur" (préserve zéros en tête)
                let val = p.trim();
                if (val.startsWith('="') && val.endsWith('"')) {
                    val = val.slice(2, -1);
                } else if (val.startsWith('"') && val.endsWith('"')) {
                    val = val.slice(1, -1);
                }
                return val.trim();
            });

            // TOLÉRANCE : Si moins de 4 colonnes, essayer d'autres séparateurs
            if (parts.length < 4) {
                for (const altSep of ['\t', ';', ',']) {
                    const altParts = line.split(altSep).map(p => {
                        let val = p.trim();
                        if (val.startsWith('="') && val.endsWith('"')) {
                            val = val.slice(2, -1);
                        } else if (val.startsWith('"') && val.endsWith('"')) {
                            val = val.slice(1, -1);
                        }
                        return val.trim();
                    });
                    if (altParts.length >= 4) {
                        parts = altParts;
                        break;
                    }
                }
            }

            // TOLÉRANCE : Accepter même avec seulement Nom et Prénom
            if (parts.length >= 2) {
                // ✅ CORRECTION CRITIQUE (Beta 95 - 27 déc 2025) : Ajouter coursId
                const coursId = typeof obtenirCoursActifId === 'function' ? obtenirCoursActifId() : null;

                const student = {
                    id: Date.now() + index + Math.random(),
                    da: parts[0] || `AUTO-${Date.now() + index}`,
                    groupe: parts[1] || '1',
                    nom: parts[2] || parts[0] || '', // Si pas de DA, premier champ = nom
                    prenom: parts[3] || parts[1] || '', // Si pas de groupe, deuxième champ = prénom
                    programme: parts[4] || '---',
                    sa: parts[5] || '',
                    caf: parts[6] || '',
                    coursId: coursId  // ✅ Lier l'étudiant au cours actif
                };

                // Nettoyer le DA (retirer espaces, lettres parasites)
                student.da = student.da.replace(/[^0-9]/g, '');
                if (!student.da) student.da = `AUTO-${Date.now() + index}`;

                // Nettoyer Services adaptés (accepter Oui/O/X/✓)
                if (student.sa && /^(oui|o|x|✓|1)$/i.test(student.sa.trim())) {
                    student.sa = 'Oui';
                }

                // Validation minimale : au moins un nom ou prénom
                if (student.nom || student.prenom) {
                    tempImportData.push(student);
                } else {
                    ligneSautees++;
                }
            } else {
                ligneSautees++;
            }
        });

        console.log(`✅ Import: ${tempImportData.length} étudiant(s), ${ligneSautees} ligne(s) ignorée(s)`);

        if (tempImportData.length === 0) {
            afficherNotificationErreur('Aucune donnée valide',
                'Impossible de trouver des noms d\'étudiants.\n' +
                'Format attendu (flexible) :\n' +
                '- Minimum : Nom, Prénom\n' +
                '- Complet : DA, Groupe, Nom, Prénom, Programme, SA');
            return;
        }

        afficherPrevisualisation(tempImportData, `Import de ${tempImportData.length} étudiant(s)`);

    } catch (error) {
        afficherNotificationErreur('Erreur de parsing', error.message);
        console.error('Erreur parsing:', error);
    }
}

/**
 * Affiche la prévisualisation
 */
function afficherPrevisualisation(data, titre) {
    const previewZone = document.getElementById('previewZone');
    const previewTable = document.getElementById('previewTable');

    if (!previewZone || !previewTable) return;

    const tableHtml = `
        <table class="tableau-blanc">
            <thead>
                <tr>
                    <th>DA</th>
                    <th style="text-align: center;">Groupe</th>
                    <th>Nom</th>
                    <th>Prénom</th>
                    <th>Programme</th>
                    <th style="text-align: center;">SA</th>
                </tr>
            </thead>
            <tbody>
                ${data.map((s, index) => `
                    <tr>
                        <td>${echapperHtml(s.da)}</td>
                        <td style="text-align: center;">${echapperHtml(s.groupe)}</td>
                        <td>${echapperHtml(s.nom)}</td>
                        <td>${echapperHtml(s.prenom)}</td>
                        <td>${echapperHtml(s.programme || '---')}</td>
                        <td style="text-align: center;">${s.sa === 'Oui' ? '✓' : ''}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    previewTable.innerHTML = tableHtml;
    previewZone.style.display = 'block';
}

/**
 * Confirme et effectue l'import
 */
function confirmImport() {
    if (tempImportData.length === 0) {
        afficherNotificationErreur('Aucune donnée', 'Aucune donnée à importer');
        return;
    }

    try {
        // 🔧 CORRECTION CRITIQUE (9 janvier 2026) : Lire TOUTES les données sans filtrage
        // obtenirDonneesSelonMode filtre par coursId, ce qui causait la perte des étudiants d'autres cours
        const cleEtudiants = (typeof cle === 'function') ? cle('groupeEtudiants') : 'groupeEtudiants';
        let students = db.getSync(cleEtudiants, []);
        const ancienTotal = students.length;

        // Vérifier mode anonymisation
        const modeActuel = db.getSync('modeApplication', 'normal');
        if (modeActuel === 'anonymisation') {
            afficherNotificationErreur('Modification impossible', 'Impossible d\'importer en mode anonymisation');
            return;
        }

        // Vérifier doublons DA
        const dasExistants = students.map(s => s.da);
        const nouveauxDAs = tempImportData.map(s => s.da);
        const doublons = nouveauxDAs.filter(da => dasExistants.includes(da) && !da.startsWith('AUTO-'));

        if (doublons.length > 0) {
            if (!confirm(`${doublons.length} DA en double détecté(s).\nContinuer ?`)) {
                return;
            }
        }

        students = students.concat(tempImportData);
        db.setSync(cleEtudiants, students);
        console.log(`✅ [confirmerImport] Sauvegarde dans ${cleEtudiants}: ${students.length} étudiants`);

        const details = `Groupe : ${ancienTotal} → ${students.length} étudiant·es (+ ${tempImportData.length})`;
        afficherNotificationSucces('Importation réussie !', details);

        // Nettoyer
        tempImportData = [];
        document.getElementById('previewZone').style.display = 'none';
        document.getElementById('donneesCollees').value = '';
        document.getElementById('fichierCsvEntree').value = '';

        afficherListeEtudiants();
        remplirSelectFiltreGroupe();

    } catch (error) {
        afficherNotificationErreur('Erreur lors de l\'importation', error.message);
        console.error('Erreur importation:', error);
    }
}

/**
 * Annule l'import
 */
function cancelImport() {
    tempImportData = [];
    document.getElementById('previewZone').style.display = 'none';
    document.getElementById('donneesCollees').value = '';
    document.getElementById('fichierCsvEntree').value = '';
}

/* ===============================
   AFFICHAGE ET FILTRAGE
   =============================== */

/**
 * Affiche la liste des étudiants
 */
function afficherListeEtudiants() {
    try {
        mettreAJourStatistiquesGroupes();
        remplirSelectFiltreGroupe();
        filtrerParGroupe();

    } catch (error) {
        console.error('Erreur affichage liste:', error);
    }
}

/**
 * Met à jour les statistiques des groupes
 */
function mettreAJourStatistiquesGroupes() {
    try {
        // BETA 95 : Filtrer par cours actif pour éviter contamination entre trimestres
        const students = typeof obtenirEtudiantsCoursActif === 'function'
            ? obtenirEtudiantsCoursActif()
            : filtrerEtudiantsParMode(obtenirDonneesSelonMode('groupeEtudiants') || []);

        // Compteur total
        const compteurTotal = document.getElementById('nbEtudiantsTotal');
        if (compteurTotal) {
            compteurTotal.textContent = students.length;
        }

        // Grouper par groupe
        const groupes = {};
        students.forEach(s => {
            const groupe = s.groupe || 'Sans groupe';
            if (!groupes[groupe]) {
                groupes[groupe] = 0;
            }
            groupes[groupe]++;
        });

        // Trier les groupes
        const groupesTriés = Object.keys(groupes).sort((a, b) => {
            const numA = parseInt(a);
            const numB = parseInt(b);
            if (!isNaN(numA) && !isNaN(numB)) {
                return numA - numB;
            }
            return a.localeCompare(b);
        });

        // Nombre de groupes
        const compteurGroupes = document.getElementById('nbGroupes');
        if (compteurGroupes) {
            compteurGroupes.textContent = groupesTriés.length;
        }

        // Détail par groupe
        const detailGroupes = document.getElementById('detailGroupes');
        if (detailGroupes) {
            if (groupesTriés.length === 0) {
                detailGroupes.innerHTML = '<em>Aucun groupe configuré</em>';
            } else {
                const detailHtml = groupesTriés.map(groupe => {
                    const effectif = groupes[groupe];
                    const pluriel = effectif > 1 ? 's' : '';
                    return `<strong>Groupe ${groupe}</strong> : ${effectif} étudiant·e${pluriel}`;
                }).join(' • ');

                detailGroupes.innerHTML = detailHtml;
            }
        }

    } catch (error) {
        console.error('Erreur statistiques:', error);
    }
}

/**
 * Remplit le select de filtrage
 */
function remplirSelectFiltreGroupe() {
    try {
        // BETA 95 : Filtrer par cours actif pour éviter contamination entre trimestres
        const students = typeof obtenirEtudiantsCoursActif === 'function'
            ? obtenirEtudiantsCoursActif()
            : filtrerEtudiantsParMode(obtenirDonneesSelonMode('groupeEtudiants') || []);
        const selectFiltre = document.getElementById('filtreGroupe');

        if (!selectFiltre) return;

        // Extraire les groupes uniques
        const groupes = new Set();
        students.forEach(s => {
            if (s.groupe && s.groupe.trim() !== '') {
                groupes.add(s.groupe.trim());
            }
        });

        // Trier
        const groupesTriés = Array.from(groupes).sort((a, b) => {
            const numA = parseInt(a);
            const numB = parseInt(b);
            if (!isNaN(numA) && !isNaN(numB)) {
                return numA - numB;
            }
            return a.localeCompare(b);
        });

        // Générer les options
        let optionsHtml = '<option value="">Tous les groupes</option>';
        groupesTriés.forEach(groupe => {
            const count = students.filter(s => s.groupe === groupe).length;
            optionsHtml += `<option value="${echapperHtml(groupe)}">Groupe ${echapperHtml(groupe)} (${count} étudiant·es)</option>`;
        });

        selectFiltre.innerHTML = optionsHtml;

    } catch (error) {
        console.error('Erreur remplissage filtre:', error);
    }
}

/**
 * Filtre l'affichage par groupe
 */
function filtrerParGroupe() {
    try {
        const selectFiltre = document.getElementById('filtreGroupe');
        const groupeSelectionné = selectFiltre ? selectFiltre.value : '';

        // BETA 95 : Filtrer par cours actif pour éviter contamination entre trimestres
        const students = typeof obtenirEtudiantsCoursActif === 'function'
            ? obtenirEtudiantsCoursActif()
            : filtrerEtudiantsParMode(obtenirDonneesSelonMode('groupeEtudiants') || []);
        console.log(`🔍 filtrerParGroupe - Étudiants cours actif: ${students.length}`);

        const tbody = document.getElementById('students-tbody');
        const container = document.getElementById('students-list-container');
        const noMsg = document.getElementById('no-students-msg');
        const compteurFiltres = document.getElementById('compteurFiltres');

        if (!tbody) {
            console.log('⚠️ filtrerParGroupe - tbody introuvable');
            return;
        }

        // Filtrer
        const etudiantsFiltres = groupeSelectionné
            ? students.filter(s => s.groupe === groupeSelectionné)
            : students;

        // Compteur
        if (compteurFiltres) {
            if (groupeSelectionné) {
                compteurFiltres.textContent = `(${etudiantsFiltres.length} sur ${students.length})`;
                compteurFiltres.style.color = 'var(--bleu-principal)';
                compteurFiltres.style.fontWeight = 'bold';
            } else {
                compteurFiltres.textContent = '';
            }
        }

        // Afficher ou masquer
        if (etudiantsFiltres.length === 0) {
            if (container) container.style.display = 'none';
            if (noMsg) {
                noMsg.style.display = 'block';
                if (groupeSelectionné) {
                    noMsg.innerHTML = `
                        <p style="font-size: 1.1rem; margin-bottom: 10px;">🔍 Aucun·e étudiant·e dans le groupe ${echapperHtml(groupeSelectionné)}</p>
                        <p style="font-size: 0.9rem;">
                            <button onclick="resetFiltreGroupe()" class="btn btn-secondaire" style="padding: 8px 15px;">
                                ← Voir tous les groupes
                            </button>
                        </p>
                    `;
                } else {
                    noMsg.innerHTML = `
                        <p style="font-size: 1.1rem; margin-bottom: 10px;">📭 Aucun·e étudiant·e dans le groupe</p>
                        <p style="font-size: 0.9rem;">
                            Utilisez le formulaire ci-dessus ou l'import pour ajouter des étudiant·es
                        </p>
                    `;
                }
            }
            return;
        }

        if (container) container.style.display = 'block';
        if (noMsg) noMsg.style.display = 'none';

        // Trier alphabétiquement par nom, puis par prénom (sauf en mode anonymisation)
        const modeActif = db.getSync('mode_actuel', 'normal');
        if (modeActif !== 'anonymisation') {
            etudiantsFiltres.sort((a, b) => {
                const nomA = a.nom.toLowerCase();
                const nomB = b.nom.toLowerCase();
                if (nomA < nomB) return -1;
                if (nomA > nomB) return 1;
                // Si noms identiques, trier par prénom
                const prenomA = a.prenom.toLowerCase();
                const prenomB = b.prenom.toLowerCase();
                return prenomA.localeCompare(prenomB);
            });
        }

        // Générer le tableau
        tbody.innerHTML = etudiantsFiltres.map(s => {
            // Utiliser daAffichage si disponible (mode anonymisation), sinon DA réel
            const daAfficher = s.daAffichage || s.da;
            const daEchappe = echapperHtml(daAfficher);
            const groupeEchappe = echapperHtml(s.groupe);
            const nomEchappe = echapperHtml(s.nom);
            const prenomEchappe = echapperHtml(s.prenom);
            const programmeEchappe = echapperHtml(s.programme || '');

            return `
                <tr style="cursor: pointer; transition: background-color 0.2s ease;">
                    <td class="td-left-100">${daEchappe}</td>
                    <td class="td-center-80"><strong>${groupeEchappe}</strong></td>
                    <td class="td-left-auto">${nomEchappe}</td>
                    <td class="td-left-auto">${prenomEchappe}</td>
                    <td class="td-left-100">${programmeEchappe}</td>
                    <td class="td-center-60">${s.sa === 'Oui' ? '✓' : ''}</td>
                    <td class="td-center-60">${s.caf === 'Oui' ? '✓' : ''}</td>
                    <td class="td-center-200">
                        <button data-action="modifier" data-da="${s.da}" class="btn btn-modifier btn-tres-compact"
                                style="margin-right: 4px;">
                            Modifier
                        </button>
                        <button data-action="supprimer" data-da="${s.da}" class="btn btn-supprimer btn-tres-compact">
                            Supprimer
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        // Effet de survol géré par CSS (plus fiable pour adaptation par mode)

    } catch (error) {
        console.error('Erreur filtrage:', error);
    }

    // Attacher les event listeners aux boutons
    attacherEventListenersEtudiants();
}

/**
 * Réinitialise le filtre
 */
function resetFiltreGroupe() {
    const selectFiltre = document.getElementById('filtreGroupe');
    if (selectFiltre) {
        selectFiltre.value = '';
    }
    filtrerParGroupe();
}

/* ===============================
   MODIFICATION
   =============================== */

/**
/**
 * Modifie un étudiant (utilise le DA)
 */
/**
 * Modifie un étudiant (utilise le DA)
 */
function modifierEtudiant(da) {
    const verrouille = db.getSync('groupeVerrouille', false);
    if (verrouille) {
        alert('Déverrouillez le groupe (🔓) avant de le modifier');
        return;
    }

    try {
        const students = obtenirDonneesSelonMode('groupeEtudiants');
        const student = students.find(s => s.da === da);

        if (!student) {
            afficherNotificationErreur('Erreur', 'Étudiant·e introuvable');
            return;
        }

        // Stocker le DA de l'étudiant en cours de modification
        sessionStorage.setItem('etudiantEnModification', da);

        // Remplir le formulaire
        document.getElementById('etudiantDA').value = student.da || '';
        document.getElementById('etudiantGroupe').value = student.groupe || '';
        document.getElementById('etudiantNom').value = student.nom || '';
        document.getElementById('etudiantPrenom').value = student.prenom || '';
        document.getElementById('etudiantProgramme').value = student.programme || '';
        document.getElementById('etudiantSA').value = student.sa || '';
        document.getElementById('etudiantCAF').value = student.caf || '';

        // Ouvrir le formulaire et scroller
        // D'abord chercher dans l'accordéon V2 Groupe, sinon dans le legacy
        const accordeonGroupe = document.getElementById('accordeon-groupe');
        let formulaire = null;
        if (accordeonGroupe) {
            formulaire = accordeonGroupe.querySelector('details');
        }
        if (!formulaire) {
            // Fallback legacy
            formulaire = document.querySelector('#reglages-groupe-legacy details');
        }
        if (!formulaire) {
            // Dernier recours - premier details de la page
            formulaire = document.querySelector('details');
        }

        if (formulaire) {
            formulaire.open = true;
            formulaire.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        // Changer le texte du bouton (chercher addStudent ou ajouterEtudiant)
        let btnAjouter = null;
        if (accordeonGroupe) {
            btnAjouter = accordeonGroupe.querySelector('button[onclick*="addStudent"]');
        }
        if (!btnAjouter) {
            btnAjouter = document.querySelector('button[onclick*="ajouterEtudiant"]');
        }
        if (!btnAjouter) {
            btnAjouter = document.querySelector('button[onclick*="addStudent"]');
        }

        if (btnAjouter) {
            btnAjouter.textContent = '✓ Mettre à jour';
            btnAjouter.style.background = 'var(--orange-accent)';
        }

        afficherNotificationSucces('Modification en cours', 'Modifiez les champs et cliquez sur "Mettre à jour"');

    } catch (error) {
        afficherNotificationErreur('Erreur modification', error.message);
        console.error('Erreur modification:', error);
    }
}

/* ===============================
   SUPPRESSION
   =============================== */

/**
 * Supprime un étudiant
 */
function deleteStudent(id, silent = false) {
    if (!silent && !confirm('Supprimer cet·te étudiant·e ?')) {
        return;
    }

    try {
        // ✅ CORRECTION CRITIQUE (Beta 95 - 2 jan 2026)
        // Utiliser obtenirTousLesEtudiants() pour ne pas perdre les autres cours
        let tousLesEtudiants = obtenirTousLesEtudiants();
        const student = tousLesEtudiants.find(s => s.id === id);

        tousLesEtudiants = tousLesEtudiants.filter(s => s.id !== id);
        sauvegarderTousLesEtudiants(tousLesEtudiants);

        if (!silent && student) {
            const details = `${student.nom}, ${student.prenom}`;
            afficherNotificationSucces('Étudiant·e supprimé·e', details);
        }

        afficherListeEtudiants();
        remplirSelectFiltreGroupe();

    } catch (error) {
        afficherNotificationErreur('Erreur suppression', error.message);
        console.error('Erreur delete:', error);
    }
}

/* ===============================
   EXPORT
   =============================== */

/**
 * Exporte les données en CSV
 */
function exportStudentsData() {
    try {
        const students = obtenirDonneesSelonMode('groupeEtudiants');

        if (students.length === 0) {
            afficherNotificationErreur('Aucune donnée', 'Aucun·e étudiant·e à exporter');
            return;
        }

        // Générer CSV
        let csv = 'DA,Groupe,Nom,Prénom,Programme,SA,CAF\n';
        students.forEach(s => {
            csv += `${s.da},${s.groupe},${s.nom},${s.prenom},${s.programme || ''},${s.sa || ''},${s.caf || ''}\n`;
        });

        // Télécharger
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `groupe_etudiants_${Date.now()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        afficherNotificationSucces('Export réussi !', `${students.length} étudiant·es exporté·es`);

    } catch (error) {
        afficherNotificationErreur('Erreur export', error.message);
        console.error('Erreur export:', error);
    }
}

/* ===============================
   🔄 RÉINITIALISATION
   =============================== */

/**
 * Réinitialise toutes les données
 */
function resetStudentsData() {
    if (!confirm('⚠️ ATTENTION !\n\nCette action va supprimer TOUS les étudiants de façon IRRÉVERSIBLE.\n\nVoulez-vous vraiment continuer ?')) {
        return;
    }

    if (!confirm('Dernière confirmation :\nVous allez perdre toutes les données du groupe.\n\nContinuer ?')) {
        return;
    }

    try {
        db.removeSync('groupeEtudiants');

        // Forcer la mise à jour immédiate des statistiques
        mettreAJourStatistiquesGroupes();
        remplirSelectFiltreGroupe();

        // Afficher message vide
        const container = document.getElementById('students-list-container');
        const noMsg = document.getElementById('no-students-msg');
        if (container) container.style.display = 'none';
        if (noMsg) {
            noMsg.style.display = 'block';
            noMsg.innerHTML = `
                <p style="font-size: 1.1rem; margin-bottom: 10px;">📭 Aucun·e étudiant·e dans le groupe</p>
                <p style="font-size: 0.9rem;">
                    Utilisez le formulaire ci-dessus ou l'import pour ajouter des étudiant·es
                </p>
            `;
        }

        afficherNotificationSucces('Groupe réinitialisé', 'Toutes les données ont été supprimées');

    } catch (error) {
        afficherNotificationErreur('Erreur réinitialisation', error.message);
        console.error('Erreur reset:', error);
    }
}

/**
 * Attache les event listeners aux boutons d'actions
 */
function attacherEventListenersEtudiants() {
    const tbody = document.getElementById('students-tbody');
    if (!tbody) return;

    // Délégation d'événements sur le tbody
    tbody.addEventListener('click', function (e) {
        const bouton = e.target.closest('button[data-action]');
        if (!bouton) return;

        const action = bouton.dataset.action;
        const da = bouton.dataset.da;

        if (action === 'modifier') {
            modifierEtudiant(da);
        } else if (action === 'supprimer') {
            supprimerEtudiant(da);
        }
    });
}

/**
 * Supprime un étudiant du groupe
 * @param {string} id - DA ou ID de l'étudiant
 */
function supprimerEtudiant(id) {
    const verrouille = db.getSync('groupeVerrouille', false);
    if (verrouille) {
        alert('Déverrouillez le groupe (🔓) avant de supprimer');
        return;
    }

    // Vérifier mode anonymisation
    const modeActuel = db.getSync('modeApplication', 'normal');
    if (modeActuel === 'anonymisation') {
        afficherNotificationErreur('Modification impossible', 'Impossible de supprimer en mode anonymisation');
        return;
    }

    // 🔧 CORRECTION CRITIQUE (9 janvier 2026) : Lire TOUTES les données sans filtrage
    // obtenirDonneesSelonMode filtre par coursId, ce qui causait la perte des étudiants d'autres cours
    const cleEtudiants = (typeof cle === 'function') ? cle('groupeEtudiants') : 'groupeEtudiants';
    let students = db.getSync(cleEtudiants, []);
    const etudiantASupprimer = students.find(s => (s.id == id || s.da == id));

    if (!etudiantASupprimer) {
        alert('Étudiant·e non trouvé·e');
        return;
    }

    if (confirm(`Êtes-vous sûr de vouloir supprimer ${etudiantASupprimer.nom}, ${etudiantASupprimer.prenom} ?`)) {
        try {
            students = students.filter(s => !(s.id == id || s.da == id));
            db.setSync(cleEtudiants, students);
            console.log(`✅ [supprimerEtudiant] Sauvegarde dans ${cleEtudiants}: ${students.length} étudiants restants`);
            afficherListeEtudiants();

            console.log(`Étudiant·e supprimé·e: ${etudiantASupprimer.nom}, ${etudiantASupprimer.prenom} (DA: ${etudiantASupprimer.da})`);
        } catch (error) {
            alert(`Erreur lors de la suppression: ${error.message}`);
        }
    }
}

/* Alias pour compatibilité
*/
function deleteStudent(id) {
    supprimerEtudiant(id);
}

// ============================================
// EXPORT DES FONCTIONS GLOBALES
// ============================================

window.initialiserModuleGroupe = initialiserModuleGroupe;
window.supprimerEtudiant = supprimerEtudiant;
window.modifierEtudiant = modifierEtudiant;
window.afficherListeEtudiants = afficherListeEtudiants;
window.resetStudentsData = resetStudentsData;
window.exportStudentsData = exportStudentsData;
window.deleteStudent = deleteStudent;

// Fonctions d'import (utilisées par l'accordéon Groupe dans Trimestre V2)
window.handleFileImport = handleFileImport;
window.previewPastedData = previewPastedData;
window.confirmImport = confirmImport;
window.cancelImport = cancelImport;
window.addStudent = addStudent;
window.filtrerParGroupe = filtrerParGroupe;
window.resetFiltreGroupe = resetFiltreGroupe;



/* ===============================
   📌 NOTES D'UTILISATION
   =============================== */

/*
 * DÉPENDANCES:
 * - 01-config.js (echapperHtml)
 * - 14-utilitaires.js (afficherNotificationSucces, afficherNotificationErreur)
 * 
 * MODULES DÉPENDANTS:
 * - 03-etudiants.js : Lit 'groupeEtudiants' pour afficher les profils
 * 
 * ORDRE DE CHARGEMENT:
 * 1. 01-config.js
 * 2. 14-utilitaires.js
 * 3. Ce module (11-groupe.js)
 * 4. 99-main.js (initialisation)
 * 
 * LOCALSTORAGE:
 * - 'groupeEtudiants' : Array [{id, da, groupe, nom, prenom, programme, sa, caf}, ...]
 * 
 * INITIALISATION:
 * Appelée automatiquement par 99-main.js via initialiserModuleGroupe()
 */