/* ===============================
   MODULE: INFORMATIONS CONTEXTUELLES
   Gère l'affichage des informations contextuelles dans l'en-tête principal
   - Nom du cours
   - Date actuelle et numéro de semaine
   - Rang de la séance dans la semaine
   =============================== */

/**
 * Met à jour l'affichage des informations contextuelles dans l'en-tête principal
 */
function mettreAJourContexteEntete() {
    const conteneur = document.getElementById('info-contextuelles-centre');
    if (!conteneur) return;

    try {
        // Obtenir les informations du cours
        const infoCours = db.getSync('infoCours', {});
        const nomCours = infoCours.nomCours || '';

        // Obtenir la pratique active
        const modalites = db.getSync('modalitesEvaluation', {});
        const pratiqueId = modalites.pratique || 'pan-maitrise';

        // ✅ CORRECTION (8 décembre 2025) : Lire le nom depuis PratiqueManager
        let pratiqueName = 'Chargement...';

        // Fonction pour obtenir le nom de la pratique (synchrone avec fallback)
        const obtenirNomPratiqueSync = () => {
            if (typeof PratiqueManager !== 'undefined' && PratiqueManager.listerPratiques) {
                // Utiliser une approche synchrone avec gestion d'erreur
                PratiqueManager.listerPratiques().then(toutesLesPratiques => {
                    let pratiqueTrouvee = toutesLesPratiques.codees?.find(p => p.id === pratiqueId);
                    if (!pratiqueTrouvee) {
                        pratiqueTrouvee = toutesLesPratiques.configurables?.find(p => p.id === pratiqueId);
                    }
                    if (pratiqueTrouvee) {
                        // Mettre à jour l'affichage avec le nom réel
                        const conteneur = document.getElementById('info-contextuelles-centre');
                        if (conteneur) {
                            const ancienTexte = conteneur.innerHTML;
                            const nouveauTexte = ancienTexte.replace(/Pratique : [^•]+/, `Pratique : ${pratiqueTrouvee.nom}`);
                            if (nouveauTexte !== ancienTexte) {
                                conteneur.innerHTML = nouveauTexte;
                            }
                        }
                    }
                }).catch(err => {
                    console.warn('Erreur lors du chargement du nom de pratique:', err);
                });
            }
            // Fallback immédiat pour affichage initial
            return pratiqueId === 'sommative' ? 'Sommative' : 'PAN-Maîtrise';
        };

        pratiqueName = obtenirNomPratiqueSync();

        // Obtenir la date actuelle
        const aujourdhui = new Date();
        const dateStr = `${aujourdhui.getFullYear()}-${String(aujourdhui.getMonth() + 1).padStart(2, '0')}-${String(aujourdhui.getDate()).padStart(2, '0')}`;

        // Obtenir les informations du calendrier
        const calendrier = db.getSync('calendrierComplet', {});
        const infoJour = calendrier[dateStr];

        // Construire le contexte sur une seule ligne
        let parties = [];

        // 1. Nom du cours
        if (nomCours) {
            parties.push(echapperHtml(nomCours));
        }

        // 2. Pratique
        parties.push(`Pratique : ${pratiqueName}`);

        // 3. Date et semaine
        if (infoJour && (infoJour.statut === 'cours' || infoJour.statut === 'reprise')) {
            const mois = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
                         'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
            const joursComplets = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

            const jourSemaineNum = aujourdhui.getDay();
            const jour = aujourdhui.getDate();
            const moisNom = mois[aujourdhui.getMonth()];
            const annee = aujourdhui.getFullYear();
            const jourSemainenom = joursComplets[jourSemaineNum];

            // Calculer le rang de la séance (source unique: horaire.js)
            const rangSeance = obtenirRangSeanceDansSemaine(dateStr);

            let dateComplete = `Semaine ${infoJour.numeroSemaine} · ${jourSemainenom} ${jour} ${moisNom} ${annee}`;

            // Ajouter le rang de la séance
            if (rangSeance) {
                dateComplete += ` · ${rangSeance.ordinal} séance`;
            }

            parties.push(dateComplete);
        }
        // Sinon, afficher juste la date
        else {
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            const dateFr = aujourdhui.toLocaleDateString('fr-CA', options);
            parties.push(dateFr);
        }

        // Assembler toutes les parties avec des séparateurs (le style est géré par CSS)
        conteneur.innerHTML = parties.join(' • ');

    } catch (error) {
        console.warn('⚠️ Erreur mise à jour contexte en-tête:', error);
        conteneur.innerHTML = '';
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
