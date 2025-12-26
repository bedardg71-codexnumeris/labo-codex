/* ===============================
   MODULE: INFORMATIONS CONTEXTUELLES
   Gère l'affichage des informations contextuelles dans l'en-tête principal
   - Dropdown de sélection de cours (Beta 95)
   - Pratique de notation
   - Date actuelle et numéro de semaine
   - Rang de la séance dans la semaine
   =============================== */

/**
 * Échappe les caractères HTML pour éviter les injections
 * @param {string} texte - Texte à échapper
 * @returns {string} Texte échappé
 */
function echapperHtml(texte) {
    if (!texte) return '';
    const div = document.createElement('div');
    div.textContent = texte;
    return div.innerHTML;
}

/**
 * Met à jour l'affichage des informations contextuelles dans l'en-tête principal
 * ✅ BETA 95 : Dropdown de sélection de cours pour multi-cours
 */
function mettreAJourContexteEntete() {
    const conteneur = document.getElementById('info-contextuelles-centre');
    if (!conteneur) return;

    try {
        // Obtenir les trimestres pour filtrer les cours
        const trimestres = db.getSync('trimestres', []);
        const trimestreActif = trimestres.find(t => t.actif);
        const trimestreActifId = trimestreActif ? trimestreActif.id : null;

        // Obtenir les cours du trimestre actif
        const listeCours = db.getSync('listeCours', []);
        const coursTrimestreActif = trimestreActifId
            ? listeCours.filter(c => c.trimestreId === trimestreActifId)
            : listeCours;

        // Obtenir le cours actif (depuis infoCours ou le premier cours actif)
        const infoCours = db.getSync('infoCours', null);
        let coursActif = infoCours || coursTrimestreActif.find(c => c.actif) || coursTrimestreActif[0] || null;

        // Vérifier que le cours actif est bien dans le trimestre actif
        if (coursActif && trimestreActifId && coursActif.trimestreId !== trimestreActifId) {
            coursActif = coursTrimestreActif[0] || null;
        }

        console.log('[Contexte] Cours trimestre actif:', coursTrimestreActif.length);
        console.log('[Contexte] Cours actif:', coursActif);

        // Obtenir la pratique du cours actif
        let pratiqueName = '';
        if (coursActif && coursActif.pratiqueId) {
            const pratiquesCodées = {
                'pan-standards': 'PAN-Standards',
                'pan-maitrise': 'PAN-Standards', // Rétrocompatibilité
                'pan-specifications': 'PAN-Spécifications',
                'pan-denotation': 'PAN-Dénotation',
                'sommative': 'Sommative'
            };
            pratiqueName = pratiquesCodées[coursActif.pratiqueId] || coursActif.pratiqueId;
        }

        // Obtenir la date actuelle
        const aujourdhui = new Date();
        const dateStr = `${aujourdhui.getFullYear()}-${String(aujourdhui.getMonth() + 1).padStart(2, '0')}-${String(aujourdhui.getDate()).padStart(2, '0')}`;

        // Obtenir les informations du calendrier
        const calendrier = db.getSync(cle('calendrierComplet'), {});
        const infoJour = calendrier[dateStr];

        // ========================================
        // LIGNE 1 : Dropdown cours + Pratique
        // ========================================
        let htmlLigne1 = '';

        // Générer le dropdown de cours si plusieurs cours disponibles
        if (coursTrimestreActif.length > 1) {
            // Trier par sigle de cours, puis par groupe
            const coursTries = coursTrimestreActif.slice().sort(function(a, b) {
                const sigleA = (a.sigle || a.codeCours || '').toLowerCase();
                const sigleB = (b.sigle || b.codeCours || '').toLowerCase();
                if (sigleA !== sigleB) {
                    return sigleA.localeCompare(sigleB);
                }
                // Même sigle : trier par groupe
                const groupeA = a.groupe || '';
                const groupeB = b.groupe || '';
                return groupeA.localeCompare(groupeB);
            });

            htmlLigne1 += '<select id="dropdown-cours-entete" onchange="changerCoursDepuisEntete(this.value)" class="dropdown-cours-entete">';
            coursTries.forEach(c => {
                const selected = coursActif && c.id === coursActif.id ? ' selected' : '';
                const sigle = c.sigle || c.codeCours || 'Sans code';
                const titre = c.titre || c.nomCours || '';
                const groupe = c.groupe || '';
                const label = groupe ? `${sigle} (${groupe})` : sigle;
                htmlLigne1 += `<option value="${c.id}"${selected}>${echapperHtml(label)}</option>`;
            });
            htmlLigne1 += '</select>';
        } else if (coursActif) {
            // Un seul cours : afficher en texte simple
            const sigle = coursActif.sigle || coursActif.codeCours || '';
            const titre = coursActif.titre || coursActif.nomCours || '';
            htmlLigne1 += `<span class="info-contexte-item">${echapperHtml(titre || sigle)}</span>`;
        }

        // Ajouter la pratique
        if (pratiqueName) {
            if (htmlLigne1) {
                htmlLigne1 += '<span class="separateur-contexte">•</span>';
            }
            htmlLigne1 += `<span class="info-contexte-item">Pratique : ${echapperHtml(pratiqueName)}</span>`;
        }

        // ========================================
        // LIGNE 2 : Date et semaine
        // ========================================
        let htmlLigne2 = '';

        if (infoJour && (infoJour.statut === 'cours' || infoJour.statut === 'reprise')) {
            const mois = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
                         'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
            const joursComplets = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

            const jourSemaineNum = aujourdhui.getDay();
            const jour = aujourdhui.getDate();
            const moisNom = mois[aujourdhui.getMonth()];
            const annee = aujourdhui.getFullYear();
            const jourSemainenom = joursComplets[jourSemaineNum];

            let dateComplete = '';
            const numeroSemaine = infoJour.numeroSemaine;
            const dansTrimestre = numeroSemaine >= 1 && numeroSemaine <= 15;

            if (dansTrimestre) {
                dateComplete = `Semaine ${numeroSemaine} · ${jourSemainenom} ${jour} ${moisNom} ${annee}`;
            } else {
                dateComplete = `${jourSemainenom} ${jour} ${moisNom} ${annee}`;
            }

            // Rang de la séance
            if (typeof obtenirRangSeanceDansSemaine === 'function') {
                const rangSeance = obtenirRangSeanceDansSemaine(dateStr);
                if (rangSeance && rangSeance.numero > 0) {
                    dateComplete += ` · ${rangSeance.ordinal} séance`;
                }
            }

            htmlLigne2 = `<span class="info-contexte-item">${dateComplete}</span>`;
        } else {
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            const dateFr = aujourdhui.toLocaleDateString('fr-CA', options);
            htmlLigne2 = `<span class="info-contexte-item">${dateFr}</span>`;
        }

        // ========================================
        // Assembler le HTML final
        // ========================================
        const htmlFinal = `
            <div class="info-contexte-ligne">${htmlLigne1}</div>
            <div class="info-contexte-ligne">${htmlLigne2}</div>
        `;

        conteneur.innerHTML = htmlFinal;

    } catch (error) {
        console.warn('⚠️ Erreur mise à jour contexte en-tête:', error);
        conteneur.innerHTML = '';
    }
}

/**
 * Change le cours actif depuis le dropdown de l'en-tête
 * ✅ BETA 95 : Nouveau pour supporter multi-cours
 *
 * @param {string} coursId - ID du cours à activer
 */
function changerCoursDepuisEntete(coursId) {
    if (!coursId) return;

    console.log('[Contexte] Changement de cours vers:', coursId);

    // Récupérer le cours sélectionné
    const listeCours = db.getSync('listeCours', []);
    const coursSelectionne = listeCours.find(c => c.id === coursId);

    if (!coursSelectionne) {
        console.warn('[Contexte] Cours non trouvé:', coursId);
        return;
    }

    // Mettre à jour infoCours
    db.setSync('infoCours', coursSelectionne);

    // Mettre à jour le flag actif dans listeCours
    listeCours.forEach(c => c.actif = (c.id === coursId));
    db.setSync('listeCours', listeCours);

    console.log('[Contexte] Cours activé:', coursSelectionne.sigle || coursSelectionne.codeCours);

    // Mettre à jour l'en-tête (pratique peut changer)
    mettreAJourContexteEntete();

    // Rafraîchir les vues qui dépendent du cours actif
    rafraichirVuesApresCours();
}

/**
 * Rafraîchit les vues après changement de cours
 * ✅ BETA 95 : Nouveau
 */
function rafraichirVuesApresCours() {
    console.log('[Contexte] Rafraîchissement des vues après changement de cours...');

    // Rafraîchir le tableau de bord aperçu
    if (typeof afficherTableauBordApercu === 'function') {
        try {
            afficherTableauBordApercu();
            console.log('   ✅ Tableau de bord rafraîchi');
        } catch (e) {
            console.warn('   ⚠️ Erreur rafraîchissement tableau de bord:', e);
        }
    }

    // Rafraîchir la liste des étudiants (nom correct de la fonction)
    if (typeof rechargerListeEtudiants === 'function') {
        try {
            rechargerListeEtudiants();
            console.log('   ✅ Liste étudiants rafraîchie');
        } catch (e) {
            console.warn('   ⚠️ Erreur rafraîchissement liste étudiants:', e);
        }
    }

    // Rafraîchir les statistiques du groupe
    if (typeof mettreAJourStatistiquesGroupes === 'function') {
        try {
            mettreAJourStatistiquesGroupes();
            console.log('   ✅ Statistiques groupe rafraîchies');
        } catch (e) {
            console.warn('   ⚠️ Erreur rafraîchissement statistiques:', e);
        }
    }

    // Rafraîchir le dropdown V2 si présent (section Réglages)
    if (typeof chargerDropdownCoursV2 === 'function') {
        try {
            chargerDropdownCoursV2();
            console.log('   ✅ Dropdown V2 rafraîchi');
        } catch (e) {
            console.warn('   ⚠️ Erreur rafraîchissement dropdown V2:', e);
        }
    }

    // 🆕 BETA 95 : Rafraîchir l'affichage des séances horaire du nouveau cours
    // Interface V2 (trimestre-v2.js) - prioritaire
    if (typeof chargerSeancesV2 === 'function') {
        try {
            chargerSeancesV2();
            console.log('   ✅ Séances horaire V2 rafraîchies');
        } catch (e) {
            console.warn('   ⚠️ Erreur rafraîchissement séances V2:', e);
        }
    }
    // Interface legacy (horaire.js) - fallback
    if (typeof afficherSeancesExistantes === 'function') {
        try {
            afficherSeancesExistantes();
            console.log('   ✅ Séances horaire rafraîchies');
        } catch (e) {
            console.warn('   ⚠️ Erreur rafraîchissement séances horaire:', e);
        }
    }

    // 🆕 BETA 95 : Régénérer les séances complètes pour le nouveau cours
    if (typeof genererSeancesCompletes === 'function') {
        try {
            genererSeancesCompletes(null);
            console.log('   ✅ Séances complètes régénérées');
        } catch (e) {
            console.warn('   ⚠️ Erreur régénération séances complètes:', e);
        }
    }

    // 🆕 BETA 95 : Rafraîchir la vue calendrier
    if (typeof afficherCalendrierScolaire === 'function') {
        try {
            afficherCalendrierScolaire();
            console.log('   ✅ Vue calendrier rafraîchie');
        } catch (e) {
            console.warn('   ⚠️ Erreur rafraîchissement calendrier:', e);
        }
    }

    // 🆕 BETA 95 : Rafraîchir le cadre calendrier V2
    if (typeof chargerCadreCalendrierV2 === 'function') {
        try {
            chargerCadreCalendrierV2();
            console.log('   ✅ Cadre calendrier V2 rafraîchi');
        } catch (e) {
            console.warn('   ⚠️ Erreur rafraîchissement cadre calendrier V2:', e);
        }
    }

    // Notification de succès
    if (typeof afficherNotificationSucces === 'function') {
        afficherNotificationSucces('Cours changé');
    }
}

// Note: calculerRangSeance() a été supprimée.
// Utiliser obtenirRangSeanceDansSemaine() de horaire.js (source unique)

/**
 * Initialise le module de contexte
 * Appelé par main.js au chargement
 */
function initialiserModuleContexte() {
    console.log('🔄 Initialisation du module Contexte');
    mettreAJourContexteEntete();
    console.log('   ✅ Module Contexte initialisé');
}

// Exporter les fonctions
window.mettreAJourContexteEntete = mettreAJourContexteEntete;
window.initialiserModuleContexte = initialiserModuleContexte;
window.changerCoursDepuisEntete = changerCoursDepuisEntete;
window.rafraichirVuesApresCours = rafraichirVuesApresCours;
