/* ===============================
   MODULE: BOÎTE À OUTILS
   Beta 96.1 - Janvier 2026

   Mini-applications pédagogiques pour l'animation en classe
   - Tirage au sort d'étudiants
   - (Futur) Questions flash
   - (Futur) Ordonnancement
   =============================== */

/* ===============================
   TIRAGE AU SORT
   =============================== */

// État du tirage (persisté dans localStorage)
let etatTirage = {
    pool: [],              // Étudiants disponibles pour le tirage
    exclus: [],            // DA des étudiants exclus manuellement
    dejaTires: [],         // DA des étudiants déjà tirés (mode sans remise)
    avecRemise: false,     // Mode avec remise
    nombreATirer: 1,       // Nombre d'étudiants à tirer
    animationEnCours: false,
    coursId: null          // Pour détecter le changement de groupe
};

/**
 * Sauvegarde l'état du tirage dans localStorage
 */
function sauvegarderEtatTirage() {
    const etatASauvegarder = {
        exclus: etatTirage.exclus,
        dejaTires: etatTirage.dejaTires,
        avecRemise: etatTirage.avecRemise,
        nombreATirer: etatTirage.nombreATirer,
        coursId: etatTirage.coursId
    };
    localStorage.setItem('etatTirage', JSON.stringify(etatASauvegarder));
}

/**
 * Restaure l'état du tirage depuis localStorage
 */
function restaurerEtatTirage() {
    try {
        const sauvegarde = localStorage.getItem('etatTirage');
        if (sauvegarde) {
            const etat = JSON.parse(sauvegarde);
            etatTirage.exclus = etat.exclus || [];
            etatTirage.dejaTires = etat.dejaTires || [];
            etatTirage.avecRemise = etat.avecRemise || false;
            etatTirage.nombreATirer = etat.nombreATirer || 1;
            etatTirage.coursId = etat.coursId || null;
            return true;
        }
    } catch (e) {
        console.warn('[Tirage] Erreur restauration état:', e);
    }
    return false;
}

/**
 * Initialise le tirage au sort avec les étudiants du groupe actif
 */
function initialiserTirage() {
    // Obtenir l'ID du cours actif
    const infoCours = db.getSync('infoCours', null);
    const coursActuelId = infoCours?.id || null;

    // Sauvegarder l'ancien coursId AVANT toute restauration
    const ancienCoursId = etatTirage.coursId;

    console.log(`[Tirage] ===== INITIALISATION =====`);
    console.log(`[Tirage] infoCours:`, infoCours);
    console.log(`[Tirage] coursActuelId: ${coursActuelId}`);
    console.log(`[Tirage] ancienCoursId (mémoire): ${ancienCoursId}`);

    // Vérifier si la section tirage est visible (DOM existe)
    const container = document.getElementById('tirage-container');
    if (!container) {
        console.log('[Tirage] Section non active, mise à jour état seulement');
        // Mettre à jour le coursId même si la section n'est pas visible
        etatTirage.coursId = coursActuelId;
        sauvegarderEtatTirage();
        return;
    }

    // Restaurer l'état précédent (sauf coursId qu'on gère manuellement)
    restaurerEtatTirage();

    // Détecter le changement de groupe-cours
    const groupeAChange = ancienCoursId !== null && ancienCoursId !== coursActuelId;
    console.log(`[Tirage] groupeAChange: ${groupeAChange} (ancien=${ancienCoursId}, actuel=${coursActuelId})`);
    if (groupeAChange) {
        console.log(`[Tirage] ⚠️ CHANGEMENT DE GROUPE - Reset tirés/exclus`);
        etatTirage.dejaTires = [];
        etatTirage.exclus = [];
        reinitialiserAffichage();
    }
    etatTirage.coursId = coursActuelId;

    // Utiliser la fonction existante qui gère correctement le filtrage
    let etudiants = [];
    if (typeof obtenirEtudiantsCoursActif === 'function') {
        etudiants = obtenirEtudiantsCoursActif();
        console.log(`[Tirage] Étudiants obtenus: ${etudiants.length}`);
        if (etudiants.length > 0) {
            console.log(`[Tirage] Premier étudiant: ${etudiants[0].prenom} ${etudiants[0].nom}`);
        }
    } else {
        // Fallback
        const cleEtudiants = (typeof cle === 'function') ? cle('groupeEtudiants') : 'groupeEtudiants';
        etudiants = db.getSync(cleEtudiants, []);
        console.warn('[Tirage] Fallback vers groupeEtudiants complet:', etudiants.length);
    }

    if (!etudiants || etudiants.length === 0) {
        console.warn('[Tirage] Aucun étudiant trouvé');
        etatTirage.pool = [];
        mettreAJourCompteur();
        reinitialiserAffichage();
        afficherMessageTirage('Aucun étudiant dans le groupe actif', 'vide');
        return;
    }

    // Initialiser le pool avec les étudiants actifs
    etatTirage.pool = etudiants
        .filter(e => e.statut !== 'inactif')
        .map(e => ({
            da: e.da,
            nom: e.nom,
            prenom: e.prenom
        }));

    // Trier par nom
    etatTirage.pool.sort((a, b) => a.nom.localeCompare(b.nom));

    // Nettoyer les exclus/tirés qui ne sont plus dans le pool
    const dasPool = new Set(etatTirage.pool.map(e => e.da));
    etatTirage.exclus = etatTirage.exclus.filter(da => dasPool.has(da));
    etatTirage.dejaTires = etatTirage.dejaTires.filter(da => dasPool.has(da));

    sauvegarderEtatTirage();
    mettreAJourCompteur();

    // Réinitialiser l'affichage si le groupe a changé
    if (groupeAChange) {
        reinitialiserAffichage();
    }

    console.log(`[Tirage] Initialisé avec ${etatTirage.pool.length} étudiants`);
}

/**
 * Réinitialise la zone d'affichage au message par défaut
 */
function reinitialiserAffichage() {
    const affichage = document.getElementById('tirage-affichage');
    if (affichage) {
        affichage.innerHTML = '<span class="tirage-placeholder">Cliquez sur "Tirer !" pour commencer</span>';
    }
}

/**
 * Obtient les étudiants disponibles pour le tirage
 * (exclut les exclus manuellement et les déjà tirés en mode sans remise)
 */
function obtenirEtudiantsDisponibles() {
    return etatTirage.pool.filter(e => {
        // Exclure les exclus manuellement
        if (etatTirage.exclus.includes(e.da)) return false;
        // Exclure les déjà tirés (mode sans remise)
        if (!etatTirage.avecRemise && etatTirage.dejaTires.includes(e.da)) return false;
        return true;
    });
}

/**
 * Met à jour le compteur d'étudiants disponibles
 */
function mettreAJourCompteur() {
    const disponibles = obtenirEtudiantsDisponibles();
    const compteurEl = document.getElementById('tirage-nb-restants');
    if (compteurEl) {
        compteurEl.textContent = disponibles.length;
    }

    // Désactiver le bouton si aucun étudiant disponible
    const btnTirer = document.getElementById('btn-tirer');
    if (btnTirer) {
        btnTirer.disabled = disponibles.length === 0 || etatTirage.animationEnCours;
    }
}

/**
 * Lance le tirage avec animation roulette
 */
function lancerTirage() {
    if (etatTirage.animationEnCours) return;

    const disponibles = obtenirEtudiantsDisponibles();
    if (disponibles.length === 0) {
        afficherMessageTirage('Aucun étudiant disponible', 'vide');
        return;
    }

    const nombreATirer = Math.min(etatTirage.nombreATirer, disponibles.length);
    etatTirage.animationEnCours = true;
    mettreAJourCompteur();

    // Sélectionner les étudiants à tirer
    const tires = [];
    const disponiblesCopie = [...disponibles];

    for (let i = 0; i < nombreATirer; i++) {
        const index = Math.floor(Math.random() * disponiblesCopie.length);
        tires.push(disponiblesCopie[index]);
        disponiblesCopie.splice(index, 1);
    }

    // Lancer l'animation
    animerRoulette(disponibles, tires);
}

/**
 * Animation roulette
 * @param {Array} pool - Liste complète pour l'animation
 * @param {Array} resultats - Étudiants tirés (résultat final)
 */
function animerRoulette(pool, resultats) {
    const affichage = document.getElementById('tirage-affichage');
    if (!affichage) return;

    const dureeAnimation = 2500; // 2.5 secondes
    const intervalleDebut = 50;  // Rapide au début
    const intervalleFin = 300;   // Lent à la fin
    const debut = Date.now();

    let intervalleActuel = intervalleDebut;

    function afficherNomAleatoire() {
        const elapsed = Date.now() - debut;
        const progression = elapsed / dureeAnimation;

        if (progression >= 1) {
            // Animation terminée - afficher le résultat
            afficherResultat(resultats);
            return;
        }

        // Afficher un nom aléatoire
        const etudiant = pool[Math.floor(Math.random() * pool.length)];
        affichage.innerHTML = `<span class="tirage-nom-anime">${etudiant.prenom} ${etudiant.nom}</span>`;

        // Ralentir progressivement (ease-out)
        const easeOut = 1 - Math.pow(1 - progression, 3);
        intervalleActuel = intervalleDebut + (intervalleFin - intervalleDebut) * easeOut;

        setTimeout(afficherNomAleatoire, intervalleActuel);
    }

    afficherNomAleatoire();
}

/**
 * Affiche le résultat final du tirage
 * @param {Array} resultats - Étudiants tirés
 */
function afficherResultat(resultats) {
    const affichage = document.getElementById('tirage-affichage');
    if (!affichage) return;

    // Marquer comme tirés (mode sans remise)
    if (!etatTirage.avecRemise) {
        resultats.forEach(e => {
            if (!etatTirage.dejaTires.includes(e.da)) {
                etatTirage.dejaTires.push(e.da);
            }
        });
        sauvegarderEtatTirage();
    }

    // Générer l'affichage
    if (resultats.length === 1) {
        // Un seul résultat - affichage grand sur une ligne
        const e = resultats[0];
        affichage.innerHTML = `
            <div class="tirage-resultat-unique">
                <span class="tirage-nom-complet">${e.prenom} ${e.nom}</span>
            </div>
        `;
    } else {
        // Plusieurs résultats
        affichage.innerHTML = `
            <div class="tirage-resultats-multiples">
                ${resultats.map((e, i) => `
                    <div class="tirage-resultat-item">
                        <span class="tirage-numero">${i + 1}</span>
                        <span class="tirage-nom-complet">${e.prenom} ${e.nom}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Ajouter la classe d'animation finale
    affichage.classList.add('tirage-revele');
    setTimeout(() => affichage.classList.remove('tirage-revele'), 500);

    etatTirage.animationEnCours = false;
    mettreAJourCompteur();
}

/**
 * Affiche un message dans la zone de tirage
 */
function afficherMessageTirage(message, type = 'info') {
    const affichage = document.getElementById('tirage-affichage');
    if (!affichage) return;

    affichage.innerHTML = `<span class="tirage-message tirage-message-${type}">${message}</span>`;
}

/* ===============================
   MODAL PARAMÈTRES
   =============================== */

/**
 * Ouvre le modal des paramètres de tirage
 */
function ouvrirModalParamsTirage() {
    console.log('[Tirage] Ouverture modal paramètres');

    const disponibles = obtenirEtudiantsDisponibles();
    const total = etatTirage.pool.length;

    const modalHTML = `
        <div id="modal-params-tirage" class="modal-overlay actif" role="dialog" aria-modal="true" aria-labelledby="titre-modal-params">
            <div class="modal-contenu">
                <div class="modal-entete">
                    <h2 id="titre-modal-params">Paramètres du tirage</h2>
                    <button class="modal-fermer" onclick="window.fermerModalParamsTirage()" aria-label="Fermer">×</button>
                </div>
                <div class="modal-corps">

                    <!-- Nombre à tirer -->
                    <div class="form-groupe">
                        <label for="param-nombre">Nombre d'étudiants à tirer</label>
                        <select id="param-nombre" class="form-select">
                            <option value="1" ${etatTirage.nombreATirer === 1 ? 'selected' : ''}>1 étudiant</option>
                            <option value="2" ${etatTirage.nombreATirer === 2 ? 'selected' : ''}>2 étudiants</option>
                            <option value="3" ${etatTirage.nombreATirer === 3 ? 'selected' : ''}>3 étudiants</option>
                            <option value="4" ${etatTirage.nombreATirer === 4 ? 'selected' : ''}>4 étudiants</option>
                            <option value="5" ${etatTirage.nombreATirer === 5 ? 'selected' : ''}>5 étudiants</option>
                        </select>
                    </div>

                    <!-- Mode avec/sans remise -->
                    <div class="form-groupe">
                        <label class="form-checkbox-label">
                            <input type="checkbox" id="param-remise" ${etatTirage.avecRemise ? 'checked' : ''}>
                            <span>Avec remise (un même étudiant peut être tiré plusieurs fois)</span>
                        </label>
                    </div>

                    <hr class="modal-separateur">

                    <!-- Liste des étudiants -->
                    <div class="form-groupe">
                        <label>Étudiants du groupe (${disponibles.length}/${total} disponibles)</label>
                        <div class="tirage-liste-etudiants">
                            ${etatTirage.pool.map(e => {
                                const estExclu = etatTirage.exclus.includes(e.da);
                                const estTire = etatTirage.dejaTires.includes(e.da);
                                const classes = [];
                                if (estExclu) classes.push('exclu');
                                if (estTire && !etatTirage.avecRemise) classes.push('deja-tire');

                                return `
                                    <label class="tirage-etudiant-item ${classes.join(' ')}">
                                        <input type="checkbox"
                                               data-da="${e.da}"
                                               ${!estExclu ? 'checked' : ''}
                                               onchange="window.toggleExclusionEtudiant('${e.da}')">
                                        <span class="tirage-etudiant-nom">${e.nom}, ${e.prenom}</span>
                                        ${estTire && !etatTirage.avecRemise ? '<span class="tirage-badge-tire">tiré</span>' : ''}
                                    </label>
                                `;
                            }).join('')}
                        </div>
                    </div>

                </div>
                <div class="modal-pied">
                    <button class="btn btn-modifier" onclick="window.reinitialiserTirageComplet()">Réinitialiser</button>
                    <button class="btn btn-annuler" onclick="window.fermerModalParamsTirage()">Annuler</button>
                    <button class="btn btn-principal" onclick="window.appliquerParamsTirage()">Appliquer</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Fermeture par Escape ou clic sur overlay
    const modal = document.getElementById('modal-params-tirage');
    modal.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            fermerModalParamsTirage();
        }
    });
}

/**
 * Ferme le modal des paramètres
 */
function fermerModalParamsTirage() {
    const modal = document.getElementById('modal-params-tirage');
    if (modal) modal.remove();
}

/**
 * Toggle l'exclusion d'un étudiant
 */
function toggleExclusionEtudiant(da) {
    const index = etatTirage.exclus.indexOf(da);
    if (index > -1) {
        etatTirage.exclus.splice(index, 1);
    } else {
        etatTirage.exclus.push(da);
    }
    sauvegarderEtatTirage();
}

/**
 * Applique les paramètres du modal
 */
function appliquerParamsTirage() {
    // Récupérer les valeurs
    const nombreEl = document.getElementById('param-nombre');
    const remiseEl = document.getElementById('param-remise');

    if (nombreEl) {
        etatTirage.nombreATirer = parseInt(nombreEl.value, 10);
    }
    if (remiseEl) {
        etatTirage.avecRemise = remiseEl.checked;
    }

    sauvegarderEtatTirage();
    mettreAJourCompteur();
    fermerModalParamsTirage();
}

/**
 * Réinitialise le tirage (vide les tirés et exclus)
 */
function reinitialiserTirageComplet() {
    etatTirage.dejaTires = [];
    etatTirage.exclus = [];
    sauvegarderEtatTirage();

    // Rafraîchir le modal si ouvert
    fermerModalParamsTirage();
    ouvrirModalParamsTirage();

    mettreAJourCompteur();
}

/* ===============================
   INITIALISATION
   =============================== */

// Exposer les fonctions globalement AVANT tout appel
window.lancerTirage = lancerTirage;
window.ouvrirModalParamsTirage = ouvrirModalParamsTirage;
window.fermerModalParamsTirage = fermerModalParamsTirage;
window.toggleExclusionEtudiant = toggleExclusionEtudiant;
window.appliquerParamsTirage = appliquerParamsTirage;
window.reinitialiserTirageComplet = reinitialiserTirageComplet;
window.initialiserTirage = initialiserTirage;

console.log('[Boîte à outils] Module chargé');
