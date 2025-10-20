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
   📋 DÉPENDANCES
   
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
 * Initialise le module
 */
function initialiserModuleGroupe() {
    console.log('👥 Initialisation du module Groupe');

    const tbody = document.getElementById('students-tbody');
    if (!tbody) {
        console.log('   ⚠️  Section groupe non active');
        return;
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
        const student = {
            id: Date.now(),
            da: document.getElementById('etudiantDA').value.trim() || `AUTO-${Date.now()}`,
            groupe: document.getElementById('etudiantGroupe').value.trim() || '1',
            nom: nom,
            prenom: prenom,
            programme: document.getElementById('etudiantProgramme').value.trim() || '---',
            sa: document.getElementById('etudiantSA').value || '',
            caf: document.getElementById('etudiantCAF').value || ''
        };

        let students = obtenirDonneesSelonMode('groupeEtudiants');

        // ============================================
        // SI MODE MODIFICATION : SUPPRIMER L'ANCIEN
        // ============================================
        if (modeModification) {
            console.log('🗑️ Suppression de l\'ancien étudiant avec DA:', daEnModification);
            students = students.filter(s => s.da !== daEnModification);
        }

        // Vérifier doublons DA (sauf si c'est le même DA en modification)
        if (student.da !== '' && !student.da.startsWith('AUTO-')) {
            const existe = students.find(s => s.da === student.da);
            if (existe && (!modeModification || student.da !== daEnModification)) {
                if (!confirm(`Un·e étudiant·e avec le DA ${student.da} existe déjà.\nContinuer quand même ?`)) {
                    return;
                }
            }
        }

        students.push(student);
        localStorage.setItem('groupeEtudiants', JSON.stringify(students));

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

            // Réinitialiser le bouton
            const btnAjouter = document.querySelector('button[onclick*="addStudent"]');
            if (btnAjouter) {
                btnAjouter.textContent = '➕ Ajouter';
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
   📥 IMPORT CSV/TSV
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
 */
function parseAndPreview(content) {
    try {
        const lines = content.trim().split('\n');
        tempImportData = [];

        lines.forEach((line, index) => {
            if (!line.trim()) return;

            // Détection du séparateur
            const separator = line.includes('\t') ? '\t' : ',';
            const parts = line.split(separator).map(p => p.trim());

            if (parts.length >= 4) {
                const student = {
                    id: Date.now() + index,
                    da: parts[0] || `AUTO-${Date.now() + index}`,
                    groupe: parts[1] || '1',
                    nom: parts[2] || '',
                    prenom: parts[3] || '',
                    programme: parts[4] || '---',
                    sa: parts[5] || '',
                    caf: parts[6] || ''
                };

                if (student.nom && student.prenom) {
                    tempImportData.push(student);
                }
            }
        });

        if (tempImportData.length === 0) {
            afficherNotificationErreur('Aucune donnée valide', 'Format attendu : DA, Groupe, Nom, Prénom, Programme, SA, CAF');
            return;
        }

        afficherPrevisualisation(tempImportData, 'Prévisualisation de l\'import');

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
        <table style="width: 100%; border-collapse: collapse;">
            <thead style="background: var(--bleu-moyen); color: white;">
                <tr>
                    <th style="padding: 8px; text-align: left;">DA</th>
                    <th style="padding: 8px; text-align: center;">Groupe</th>
                    <th style="padding: 8px; text-align: left;">Nom</th>
                    <th style="padding: 8px; text-align: left;">Prénom</th>
                    <th style="padding: 8px; text-align: left;">Programme</th>
                    <th style="padding: 8px; text-align: center;">SA</th>
                    <th style="padding: 8px; text-align: center;">CAF</th>
                </tr>
            </thead>
            <tbody>
                ${data.map((s, index) => `
                    <tr style="background: ${index % 2 === 0 ? 'white' : '#f8f9fa'};">
                        <td style="padding: 8px;">${echapperHtml(s.da)}</td>
                        <td style="padding: 8px; text-align: center;">${echapperHtml(s.groupe)}</td>
                        <td style="padding: 8px;">${echapperHtml(s.nom)}</td>
                        <td style="padding: 8px;">${echapperHtml(s.prenom)}</td>
                        <td style="padding: 8px;">${echapperHtml(s.programme || '---')}</td>
                        <td style="padding: 8px; text-align: center;">${s.sa === 'Oui' ? '✓' : ''}</td>
                        <td style="padding: 8px; text-align: center;">${s.caf === 'Oui' ? '✓' : ''}</td>
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
        const students = obtenirDonneesSelonMode('groupeEtudiants');
        const ancienTotal = students.length;

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
        if (!sauvegarderDonneesSelonMode('groupeEtudiants', students)) {
            afficherNotificationErreur('Modification impossible', 'Impossible d\'importer en mode anonymisation');
            return;
        }

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
   📊 AFFICHAGE ET FILTRAGE
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
        const students = obtenirDonneesSelonMode('groupeEtudiants');

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
        const students = obtenirDonneesSelonMode('groupeEtudiants');
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

        const students = obtenirDonneesSelonMode('groupeEtudiants');
        const tbody = document.getElementById('students-tbody');
        const container = document.getElementById('students-list-container');
        const noMsg = document.getElementById('no-students-msg');
        const compteurFiltres = document.getElementById('compteurFiltres');

        if (!tbody) return;

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

        // Générer le tableau
        tbody.innerHTML = etudiantsFiltres.map(s => {
            const daEchappe = echapperHtml(s.da);
            const groupeEchappe = echapperHtml(s.groupe);
            const nomEchappe = echapperHtml(s.nom);
            const prenomEchappe = echapperHtml(s.prenom);
            const programmeEchappe = echapperHtml(s.programme || '');

            return `
                <tr>
                    <td>${daEchappe}</td>
                    <td style="text-align: center;"><strong>${groupeEchappe}</strong></td>
                    <td>${nomEchappe}</td>
                    <td>${prenomEchappe}</td>
                    <td>${programmeEchappe}</td>
                    <td style="text-align: center;">${s.sa === 'Oui' ? '✓' : ''}</td>
                    <td style="text-align: center;">${s.caf === 'Oui' ? '✓' : ''}</td>
<td style="text-align: center;">
    <button data-action="modifier" data-da="${s.da}" class="btn btn-modifier" 
            style="padding: 5px 10px; margin-right: 5px;">
        ✏️
    </button>
    <button data-action="supprimer" data-da="${s.da}" class="btn btn-supprimer" 
            style="padding: 5px 10px;">
        🗑️
    </button>
</td>
                </tr>
            `;
        }).join('');

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
   ✏️ MODIFICATION
   =============================== */

/**
/**
 * Modifie un étudiant (utilise le DA)
 */
/**
 * Modifie un étudiant (utilise le DA)
 */
function modifierEtudiant(da) {
    const verrouille = JSON.parse(localStorage.getItem('groupeVerrouille') || 'false');
    if (verrouille) {
        alert('Décochez "🔒" avant de modifier');
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
        const formulaire = document.querySelector('details');
        if (formulaire) {
            formulaire.open = true;
            formulaire.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        // Changer le texte du bouton
        const btnAjouter = document.querySelector('button[onclick*="ajouterEtudiant"]');
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
   🗑️ SUPPRESSION
   =============================== */

/**
 * Supprime un étudiant
 */
function deleteStudent(id, silent = false) {
    if (!silent && !confirm('Supprimer cet·te étudiant·e ?')) {
        return;
    }

    try {
        const students = obtenirDonneesSelonMode('groupeEtudiants');
        const student = students.find(s => s.id === id);

        students = students.filter(s => s.id !== id);
        localStorage.setItem('groupeEtudiants', JSON.stringify(students));

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
   📤 EXPORT
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
        localStorage.removeItem('groupeEtudiants');

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
    const verrouille = JSON.parse(localStorage.getItem('groupeVerrouille') || 'false');
    if (verrouille) {
        alert('Décochez "🔒" avant de supprimer');
        return;
    }

    let students = obtenirDonneesSelonMode('groupeEtudiants');
    const etudiantASupprimer = students.find(s => (s.id == id || s.da == id));

    if (!etudiantASupprimer) {
        alert('Étudiant·e non trouvé·e');
        return;
    }

    if (confirm(`Êtes-vous sûr de vouloir supprimer ${etudiantASupprimer.nom}, ${etudiantASupprimer.prenom} ?`)) {
        try {
            students = students.filter(s => !(s.id == id || s.da == id));
            if (!sauvegarderDonneesSelonMode('groupeEtudiants', students)) {
                afficherNotificationErreur('Modification impossible', 'Impossible de supprimer en mode anonymisation');
                return;
            }
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

window.supprimerEtudiant = supprimerEtudiant;
window.modifierEtudiant = modifierEtudiant;
window.ajouterEtudiant = ajouterEtudiant;
window.afficherListeEtudiants = afficherListeEtudiants;
window.basculerVerrouillageGroupe = basculerVerrouillageGroupe;
window.resetStudentsData = resetStudentsData;
window.exportStudentsData = exportStudentsData;
window.deleteStudent = deleteStudent;



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