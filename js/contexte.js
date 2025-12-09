/* ===============================
   MODULE: INFORMATIONS CONTEXTUELLES
   Gère l'affichage des informations contextuelles dans l'en-tête principal
   - Nom du cours
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
 */
function mettreAJourContexteEntete() {
    const conteneur = document.getElementById('info-contextuelles-centre');
    if (!conteneur) return;

    try {
        // Obtenir les informations du cours actif
        const listeCours = db.getSync('listeCours', []);
        const coursActif = listeCours.find(c => c.actif === true) || listeCours[0] || null;
        const nomCours = coursActif ? (coursActif.nomCours || coursActif.codeCours || '') : '';

        console.log('[Contexte] Liste cours:', listeCours);
        console.log('[Contexte] Cours actif:', coursActif);
        console.log('[Contexte] Nom cours:', nomCours);

        // Obtenir la pratique active
        const modalites = db.getSync('modalitesEvaluation', {});
        const pratiqueId = modalites.pratique || 'pan-maitrise';

        console.log('[Contexte] modalitesEvaluation:', modalites);

        // ✅ AMÉLIORATION (9 décembre 2025) : Obtenir le nom de la pratique depuis le registre
        let pratiqueName = 'Chargement...';

        // Essayer d'obtenir le nom depuis le registre de pratiques
        try {
            console.log('[Contexte] Pratique ID:', pratiqueId);

            // Lire directement depuis pratiquesConfigurables et pratiques codées
            const pratiquesConfig = db.getSync('pratiquesConfigurables', []);
            console.log('[Contexte] Pratiques configurables:', pratiquesConfig);

            let pratiqueTrouvee = pratiquesConfig.find(p => p.id === pratiqueId);

            // Si pas trouvée dans configurables, chercher dans les pratiques codées
            if (!pratiqueTrouvee) {
                // Noms des pratiques codées en dur
                const pratiquesCodées = {
                    'pan-maitrise': 'PAN-Maîtrise (IDME + SRPNF)',
                    'pan-maitrise-json': 'PAN-Maîtrise (IDME + SRPNF)',
                    'sommative': 'Sommative (moyenne pondérée)'
                };
                pratiqueName = pratiquesCodées[pratiqueId] || pratiqueId;
                console.log('[Contexte] Pratique codée trouvée:', pratiqueName);
            } else {
                pratiqueName = pratiqueTrouvee.nom || pratiqueId;
                console.log('[Contexte] Pratique configurable trouvée:', pratiqueName);
            }
        } catch (err) {
            console.warn('Erreur lors de la lecture du nom de pratique:', err);
            pratiqueName = pratiqueId;
        }

        console.log('[Contexte] Nom final de la pratique:', pratiqueName);

        // Obtenir la date actuelle
        const aujourdhui = new Date();
        const dateStr = `${aujourdhui.getFullYear()}-${String(aujourdhui.getMonth() + 1).padStart(2, '0')}-${String(aujourdhui.getDate()).padStart(2, '0')}`;

        // Obtenir les informations du calendrier
        const calendrier = db.getSync('calendrierComplet', {});
        const infoJour = calendrier[dateStr];

        // Construire le contexte sur deux lignes
        let ligne1 = []; // Cours + Pratique
        let ligne2 = []; // Date

        // 1. Nom du cours
        if (nomCours) {
            ligne1.push(echapperHtml(nomCours));
        }

        // 2. Pratique
        ligne1.push(`Pratique : ${echapperHtml(pratiqueName)}`);

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

            // ✅ AMÉLIORATION (9 décembre 2025) : N'afficher le numéro de semaine que pendant le trimestre actif (semaines 1-15)
            let dateComplete = '';

            // Vérifier si on est dans le trimestre actif (semaines 1 à 15)
            const numeroSemaine = infoJour.numeroSemaine;
            const dansTrimestre = numeroSemaine >= 1 && numeroSemaine <= 15;

            if (dansTrimestre) {
                // Pendant le trimestre : afficher "Semaine X · Date"
                dateComplete = `Semaine ${numeroSemaine} · ${jourSemainenom} ${jour} ${moisNom} ${annee}`;
            } else {
                // Avant/après trimestre ou pendant congés : afficher seulement la date
                dateComplete = `${jourSemainenom} ${jour} ${moisNom} ${annee}`;
            }

            // ✅ AMÉLIORATION (9 décembre 2025) : N'afficher le rang de séance que les jours de cours effectifs
            // Calculer le rang de la séance (source unique: horaire.js)
            const rangSeance = obtenirRangSeanceDansSemaine(dateStr);

            // Ajouter le rang de la séance seulement si :
            // 1. rangSeance existe
            // 2. Le numéro de séance est > 0 (évite "0ème séance")
            // 3. C'est un jour de cours effectif (cours ou reprise)
            if (rangSeance && rangSeance.numero > 0 && (infoJour.statut === 'cours' || infoJour.statut === 'reprise')) {
                dateComplete += ` · ${rangSeance.ordinal} séance`;
            }

            ligne2.push(dateComplete);
        }
        // Sinon, afficher juste la date
        else {
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            const dateFr = aujourdhui.toLocaleDateString('fr-CA', options);
            ligne2.push(dateFr);
        }

        // Assembler les deux lignes avec des séparateurs
        // Ligne 1 : Cours + Pratique (horizontale avec séparateurs)
        const htmlLigne1 = ligne1.map((partie, index) => {
            const separateur = index < ligne1.length - 1 ? '<span class="separateur-contexte">•</span>' : '';
            return `<span class="info-contexte-item">${partie}</span>${separateur}`;
        }).join('');

        // Ligne 2 : Date (simple, sans séparateur)
        const htmlLigne2 = ligne2.map(partie => {
            return `<span class="info-contexte-item">${partie}</span>`;
        }).join('');

        // Combiner les deux lignes avec un div pour chaque ligne
        const htmlFinal = `
            <div class="info-contexte-ligne">${htmlLigne1}</div>
            <div class="info-contexte-ligne">${htmlLigne2}</div>
        `;

        console.log('[Contexte] Ligne 1:', ligne1);
        console.log('[Contexte] Ligne 2:', ligne2);
        console.log('[Contexte] HTML généré:', htmlFinal);

        conteneur.innerHTML = htmlFinal;

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
