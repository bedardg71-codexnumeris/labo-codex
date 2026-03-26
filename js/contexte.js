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
    const conteneur = document.getElementById('info-contextuelles-centre');
    if (!conteneur) return;

    try {
        // Obtenir les trimestres pour filtrer les cours
        const trimestres = db.getSync('trimestres', []);
        const trimestreActif = trimestres.find(t => t.actif);
        const trimestreActifId = trimestreActif ? trimestreActif.id : null;

        // 🆕 BETA 95.2 : Essayer d'abord les groupe-cours entities
        let groupesCours = [];
        let coursActif = null;
        let utilisationGroupeCours = false;

        if (trimestreActifId) {
            const cleGC = `${trimestreActifId.toLowerCase()}_groupesCours`;
            groupesCours = db.getSync(cleGC, []);

            if (groupesCours.length > 0) {
                utilisationGroupeCours = true;

                // Hydrater les groupe-cours avec les entités
                const cours = db.getSync('cours', []);
                const enseignants = db.getSync('enseignants', []);

                groupesCours = groupesCours.map(gc => {
                    const coursInfo = cours.find(c => c.id === gc.coursId) || {};
                    const enseignant = enseignants.find(e => e.id === gc.enseignantId) || {};
                    return {
                        ...gc,
                        sigle: coursInfo.codeCours || '',
                        nomCours: coursInfo.nomCours || '',
                        prenom: enseignant.prenom || '',
                        nom: enseignant.nom || '',
                        pratiqueId: gc.pratiqueId
                    };
                });

                // Trouver le groupe-cours actif
                const gcActif = db.getSync('groupeCoursActif', null);
                coursActif = gcActif ? groupesCours.find(gc => gc.id === gcActif.id) : groupesCours.find(gc => gc.actif) || groupesCours[0];
            }
        }

        // Fallback : utiliser listeCours (format legacy)
        if (!utilisationGroupeCours) {
            const listeCours = db.getSync('listeCours', []);
            const coursTrimestreActif = trimestreActifId
                ? listeCours.filter(c => c.trimestreId === trimestreActifId)
                : listeCours;

            // 🆕 FIX (4 fév 2026) : Priorité codeCours, ajouter code pour Primo
            groupesCours = coursTrimestreActif.map(c => ({
                id: c.id,
                sigle: c.codeCours || c.sigle || c.code || '',
                nomCours: c.nomCours || c.titre || '',
                groupe: c.groupe || '',
                pratiqueId: c.pratiqueId,
                actif: c.actif
            }));

            // Obtenir le cours actif (depuis infoCours ou le premier cours actif)
            const infoCours = db.getSync('infoCours', null);
            coursActif = infoCours ? groupesCours.find(gc => gc.id === infoCours.id) : groupesCours.find(gc => gc.actif) || groupesCours[0];

        }


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
            // D'abord vérifier les pratiques codées
            if (pratiquesCodées[coursActif.pratiqueId]) {
                pratiqueName = pratiquesCodées[coursActif.pratiqueId];
            } else {
                // Sinon chercher dans les pratiques configurables pour obtenir le nom
                // 🆕 FIX (22 jan 2026) : Utiliser db.get() async car getSync peut retourner [] si pas encore synchronisé
                const pratiquesConfigurables = db.getSync('pratiquesConfigurables', []);
                const pratiqueTrouvee = pratiquesConfigurables.find(p => p.id === coursActif.pratiqueId);

                if (pratiqueTrouvee) {
                    pratiqueName = pratiqueTrouvee.nom;
                } else {
                    // Fallback : afficher l'ID pour l'instant, puis charger async et mettre à jour
                    pratiqueName = coursActif.pratiqueId;

                    // Charger async depuis IndexedDB et mettre à jour si trouvé
                    const pratiqueIdCapture = coursActif.pratiqueId;
                    db.get('pratiquesConfigurables').then(pratiques => {
                        if (pratiques && Array.isArray(pratiques)) {
                            const pratique = pratiques.find(p => p.id === pratiqueIdCapture);
                            if (pratique && pratique.nom) {
                                const spanPratique = document.getElementById('contexte-pratique-nom');
                                if (spanPratique) {
                                    spanPratique.textContent = `Pratique : ${pratique.nom}`;
                                }
                            }
                        }
                    }).catch(function(e) {
                        console.warn('[Contexte] Erreur lecture async pratiquesConfigurables:', e);
                    });
                }
            }
        }

        // Obtenir la date actuelle
        const aujourdhui = new Date();
        const dateStr = `${aujourdhui.getFullYear()}-${String(aujourdhui.getMonth() + 1).padStart(2, '0')}-${String(aujourdhui.getDate()).padStart(2, '0')}`;

        // Obtenir les informations du calendrier
        const calendrier = db.getSync(cle('calendrierComplet'), {});
        const infoJour = calendrier[dateStr];

        // ========================================
        // LIGNE 1 : Pratique seulement (le dropdown groupe-cours est dans le bandeau dédié)
        // ========================================
        let htmlLigne1 = '';

        // Ajouter la pratique
        if (pratiqueName) {
            if (htmlLigne1) {
                htmlLigne1 += '<span class="separateur-contexte">•</span>';
            }
            htmlLigne1 += `<span class="info-contexte-item" id="contexte-pratique-nom" data-tooltip="entete-pratique">Pratique : ${echapperHtml(pratiqueName)}</span>`;
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
            <div class="info-contexte-ligne" data-tooltip="entete-semaine">${htmlLigne2}</div>
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
            groupe: gcSelectionne.groupe
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
                sigle: coursInfo.codeCours || '',
                codeCours: coursInfo.codeCours || '',
                titre: coursInfo.nomCours || '',
                nomCours: coursInfo.nomCours || '',
                groupe: gcSelectionne.groupeNum || gcSelectionne.groupe || '00001',
                prenomEnseignant: enseignant.prenom || '',
                nomEnseignant: enseignant.nom || '',
                pratiqueId: gcSelectionne.pratiqueId
            };
            db.setSync('infoCours', infoCours);
        }


    } else {
        // Mode legacy (listeCours)
        const listeCours = db.getSync('listeCours', []);
        const coursSelectionne = listeCours.find(c => c.id === id);

        if (!coursSelectionne) {
            console.warn('[Contexte] Cours non trouvé:', id);
            return;
        }

        // Mettre à jour infoCours
        db.setSync('infoCours', coursSelectionne);

        // Mettre à jour le flag actif dans listeCours
        listeCours.forEach(c => c.actif = (c.id === id));
        db.setSync('listeCours', listeCours);

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

    // Rafraîchir les statistiques du groupe
    if (typeof mettreAJourStatistiquesGroupes === 'function') {
        try {
            mettreAJourStatistiquesGroupes();
        } catch (e) {
            console.warn('   ⚠️ Erreur rafraîchissement statistiques:', e);
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
    mettreAJourContexteEntete();
}

// Exporter les fonctions
window.mettreAJourContexteEntete = mettreAJourContexteEntete;
window.initialiserModuleContexte = initialiserModuleContexte;
window.changerCoursDepuisEntete = changerCoursDepuisEntete;
window.rafraichirVuesApresCours = rafraichirVuesApresCours;


})();
