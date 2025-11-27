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

        // Obtenir la date actuelle
        const aujourdhui = new Date();
        const dateStr = `${aujourdhui.getFullYear()}-${String(aujourdhui.getMonth() + 1).padStart(2, '0')}-${String(aujourdhui.getDate()).padStart(2, '0')}`;

        // Obtenir les informations du calendrier
        const calendrier = db.getSync('calendrierComplet', {});
        const infoJour = calendrier[dateStr];

        // Obtenir les séances
        const seancesCompletes = db.getSync('seancesCompletes', {});

        let html = '';

        // Afficher le nom du cours
        if (nomCours) {
            html += `<div style="font-size: 1.1rem; font-weight: 500; margin-bottom: 4px;">${echapperHtml(nomCours)}</div>`;
        }

        // Si nous sommes dans un jour de cours ou de reprise
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

            let contexte = `Semaine ${infoJour.numeroSemaine} • ${jourSemainenom} ${jour} ${moisNom} ${annee}`;

            // Ajouter le rang de la séance
            if (rangSeance) {
                contexte += ` • ${rangSeance.ordinal} séance`;
            }

            html += `<div style="font-size: 0.9rem; color: rgba(255, 255, 255, 0.9);">${contexte}</div>`;
        }
        // Sinon, afficher juste la date
        else {
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            const dateFr = aujourdhui.toLocaleDateString('fr-CA', options);
            html += `<div style="font-size: 0.9rem; color: rgba(255, 255, 255, 0.9);">${dateFr}</div>`;
        }

        conteneur.innerHTML = html;

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
