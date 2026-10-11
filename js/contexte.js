/* ===============================
   MODULE: INFORMATIONS CONTEXTUELLES
   Gère l'affichage des informations contextuelles dans l'en-tête principal
   - Dropdown de sélection de cours (Beta 95)
   - Pratique de notation
   - Date actuelle et numéro de semaine
   - Rang de la séance dans la semaine
   =============================== */

(function() {
'use strict';

/**
 * Met à jour l'affichage des informations contextuelles dans l'en-tête principal
 * ✅ BETA 95 : Dropdown de sélection de cours pour multi-cours
 * ✅ BETA 95.2 : Support groupe-cours entities + fallback legacy
 */
function mettreAJourContexteEntete() {
    // Consigne du 12 sept. 2026 (les étiquettes) : les mots du Cadre qui nomment la personne
    // suivent la nature du contexte actif, au même rythme que l'en-tête — au démarrage
    // (initialiserModuleContexte) et à chaque activation (orchestre, changerCoursActif).
    if (typeof appliquerMotsNatureCadre === 'function') appliquerMotsNatureCadre();
    // Lot E (consigne du 12 sept. 2026, 11 h) : la barre de Suivi suit aussi le contexte (« Interventions » n'a pas
    // d'onglet sur un service) — une bascule de contexte ne repasse pas par afficherSection (navigation.js).
    if (typeof rafraichirSousNavigationSelonContexte === 'function') rafraichirSousNavigationSelonContexte();
    const elDate = document.getElementById('entete-date');
    if (!elDate) return;

    try {
        const aujourdhui = new Date();
        const dateStr = `${aujourdhui.getFullYear()}-${String(aujourdhui.getMonth() + 1).padStart(2, '0')}-${String(aujourdhui.getDate()).padStart(2, '0')}`;
        const calendrier = db.getSync(cle('calendrierComplet'), {});
        const infoJour = calendrier[dateStr];

        let dateTexte = '';

        if (infoJour && (infoJour.statut === 'cours' || infoJour.statut === 'reprise')) {
            const mois = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
                         'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
            const joursComplets = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

            const jourSemaineNum = aujourdhui.getDay();
            const jour = aujourdhui.getDate();
            const moisNom = mois[aujourdhui.getMonth()];
            const annee = aujourdhui.getFullYear();
            const jourSemainenom = joursComplets[jourSemaineNum];

            const numeroSemaine = infoJour.numeroSemaine;
            const dansTrimestre = numeroSemaine >= 1 && numeroSemaine <= 15;

            if (dansTrimestre) {
                dateTexte = `Semaine ${numeroSemaine} · ${jourSemainenom} ${jour} ${moisNom} ${annee}`;
            } else {
                dateTexte = `${jourSemainenom} ${jour} ${moisNom} ${annee}`;
            }

            if (typeof obtenirRangSeanceDansSemaine === 'function') {
                const rangSeance = obtenirRangSeanceDansSemaine(dateStr);
                if (rangSeance && rangSeance.numero > 0) {
                    dateTexte += ` · ${rangSeance.ordinal} séance`;
                }
            }
        } else {
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            dateTexte = aujourdhui.toLocaleDateString('fr-CA', options);
        }

        elDate.textContent = dateTexte;

    } catch (error) {
        console.warn('⚠️ Erreur mise à jour contexte en-tête:', error);
        elDate.textContent = '';
    }
}

/**
 * Change le cours actif depuis le dropdown de l'en-tête
 * ✅ BETA 95 : Nouveau pour supporter multi-cours
 * ✅ BETA 95.2 : Support groupe-cours entities
 *
 * @param {string} id - ID du groupe-cours ou cours à activer
 * @param {boolean} [estGroupeCours=false] - true si c'est un groupe-cours Beta 95.2
 */
function changerCoursDepuisEntete(id, estGroupeCours) {
    if (!id) return;


    if (estGroupeCours) {
        // 🆕 BETA 95.2 : Mode groupe-cours
        const trimestres = db.getSync('trimestres', []);
        const trimestreActif = trimestres.find(t => t.actif);
        if (!trimestreActif) {
            console.warn('[Contexte] Aucun trimestre actif');
            return;
        }

        const cleGC = `${trimestreActif.id.toLowerCase()}_groupesCours`;
        const groupesCours = db.getSync(cleGC, []);
        const gcSelectionne = groupesCours.find(gc => gc.id === id);

        if (!gcSelectionne) {
            console.warn('[Contexte] Groupe-cours non trouvé:', id);
            return;
        }

        // Mettre à jour le flag actif
        groupesCours.forEach(gc => gc.actif = (gc.id === id));
        db.setSync(cleGC, groupesCours);

        // Mettre à jour groupeCoursActif
        db.setSync('groupeCoursActif', {
            id: gcSelectionne.id,
            trimestreId: gcSelectionne.trimestreId,
            coursId: gcSelectionne.coursId,
            enseignantId: gcSelectionne.enseignantId,
            horaireId: gcSelectionne.horaireId,
            groupe: gcSelectionne.groupeNum
        });

        // Synchroniser vers infoCours pour compatibilité
        if (typeof GroupeCoursEntite !== 'undefined' && typeof GroupeCoursEntite.synchroniserInfoCours === 'function') {
            GroupeCoursEntite.synchroniserInfoCours(id).then(() => {
            }).catch(e => {
                console.warn('[Contexte] Erreur sync infoCours:', e);
            });
        } else {
            // Fallback : construire infoCours manuellement
            const cours = db.getSync('cours', []);
            const enseignants = db.getSync('enseignants', []);
            const coursInfo = cours.find(c => c.id === gcSelectionne.coursId) || {};
            const enseignant = enseignants.find(e => e.id === gcSelectionne.enseignantId) || {};

            const infoCours = {
                id: gcSelectionne.id,
                trimestreId: gcSelectionne.trimestreId || trimestreActif.id,
                sigle: coursInfo.codeCours || (coursInfo.nature === 'service' ? coursInfo.nomCours : '') || '',
                codeCours: coursInfo.codeCours || (coursInfo.nature === 'service' ? coursInfo.nomCours : '') || '',
                titre: coursInfo.nomCours || '',
                nomCours: coursInfo.nomCours || '',
                groupe: gcSelectionne.groupeNum || '00001',
                prenomEnseignant: enseignant.prenom || '',
                nomEnseignant: enseignant.nom || '',
                pratiqueId: gcSelectionne.pratiqueId
            };
            db.setSync('infoCours', infoCours);
        }


    } else {
        // Mode legacy (listeCours)
        const listeCours = db.getSync('cours', []);
        const coursSelectionne = listeCours.find(c => c.id === id);

        if (!coursSelectionne) {
            console.warn('[Contexte] Cours non trouvé:', id);
            return;
        }

        // Mettre à jour infoCours
        db.setSync('infoCours', coursSelectionne);

        // Mettre à jour le flag actif dans listeCours
        listeCours.forEach(c => c.actif = (c.id === id));
        db.setSync('cours', listeCours);

    }

    // Mettre à jour l'en-tête (pratique peut changer)
    mettreAJourContexteEntete();

    // Rafraîchir les vues qui dépendent du cours actif
    rafraichirVuesApresCours();
}

/**
 * Rafraîchit les vues après changement de cours
 * ✅ BETA 95 : Nouveau
 * ✅ BETA 95.2 : Rafraîchit aussi la liste groupe-cours
 */
function rafraichirVuesApresCours() {

    // 🆕 BETA 95.2 : Rafraîchir la liste des groupe-cours dans l'UI
    if (typeof chargerListeGroupeCoursV2 === 'function') {
        try {
            chargerListeGroupeCoursV2();
        } catch (e) {
            console.warn('   ⚠️ Erreur rafraîchissement liste groupe-cours:', e);
        }
    }

    // Rafraîchir le tableau de bord aperçu
    if (typeof chargerTableauBordApercu === 'function') {
        try {
            chargerTableauBordApercu();
        } catch (e) {
            console.warn('   ⚠️ Erreur rafraîchissement tableau de bord:', e);
        }
    }

    // Rafraîchir la liste des étudiants (nom correct de la fonction)
    if (typeof rechargerListeEtudiants === 'function') {
        try {
            rechargerListeEtudiants();
        } catch (e) {
            console.warn('   ⚠️ Erreur rafraîchissement liste étudiants:', e);
        }
    }

    // Rafraîchir le dropdown V2 si présent (section Réglages)
    if (typeof chargerDropdownCoursV2 === 'function') {
        try {
            chargerDropdownCoursV2();
        } catch (e) {
            console.warn('   ⚠️ Erreur rafraîchissement dropdown V2:', e);
        }
    }

    // 🆕 BETA 95 : Rafraîchir l'affichage des séances horaire du nouveau cours
    // Interface V2 (trimestre-v2.js) - prioritaire
    if (typeof chargerSeancesV2 === 'function') {
        try {
            chargerSeancesV2();
        } catch (e) {
            console.warn('   ⚠️ Erreur rafraîchissement séances V2:', e);
        }
    }
    // Interface legacy (horaire.js) - fallback
    if (typeof afficherSeancesExistantes === 'function') {
        try {
            afficherSeancesExistantes();
        } catch (e) {
            console.warn('   ⚠️ Erreur rafraîchissement séances horaire:', e);
        }
    }

    // 🆕 BETA 95 : Régénérer les séances complètes pour le nouveau cours
    if (typeof genererSeancesCompletes === 'function') {
        try {
            genererSeancesCompletes(null);
        } catch (e) {
            console.warn('   ⚠️ Erreur régénération séances complètes:', e);
        }
    }

    // 🆕 BETA 95 : Rafraîchir la vue calendrier
    if (typeof afficherCalendrierScolaire === 'function') {
        try {
            afficherCalendrierScolaire();
        } catch (e) {
            console.warn('   ⚠️ Erreur rafraîchissement calendrier:', e);
        }
    }

    // 🆕 BETA 95 : Rafraîchir le cadre calendrier V2
    if (typeof chargerCadreCalendrierV2 === 'function') {
        try {
            chargerCadreCalendrierV2();
        } catch (e) {
            console.warn('   ⚠️ Erreur rafraîchissement cadre calendrier V2:', e);
        }
    }

    // 🆕 BETA 96.1 : Rafraîchir le tirage au sort si actif
    if (typeof window.initialiserTirage === 'function') {
        try {
            window.initialiserTirage();
        } catch (e) {
            console.warn('   ⚠️ Erreur rafraîchissement tirage:', e);
        }
    } else {
    }

    // Notification de succès
    notifications.succes('Cours changé');
}

// Note: calculerRangSeance() a été supprimée.
// Utiliser obtenirRangSeanceDansSemaine() de horaire.js (source unique)

/**
 * Initialise le module de contexte
 * Appelé par main.js au chargement
 */
function initialiserModuleContexte() {
    mettreAJourContexteEntete();
}

// Exporter les fonctions
window.mettreAJourContexteEntete = mettreAJourContexteEntete;
window.initialiserModuleContexte = initialiserModuleContexte;
window.changerCoursDepuisEntete = changerCoursDepuisEntete;
window.rafraichirVuesApresCours = rafraichirVuesApresCours;


})();
