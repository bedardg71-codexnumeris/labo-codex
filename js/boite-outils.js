/* ===============================
   MODULE: BOÎTE À OUTILS
   Beta 96.1 - Janvier 2026

   Mini-applications pédagogiques pour l'animation en classe
   - Tirage au sort d'étudiants
   - (Futur) Questions flash
   - (Futur) Ordonnancement
   =============================== */

(function() {
'use strict';

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
    db.setSync('etatTirage', etatASauvegarder);
}

/**
 * Restaure l'état du tirage depuis localStorage
 */
function restaurerEtatTirage() {
    try {
        const sauvegarde = db.getSync('etatTirage', null);
        if (sauvegarde) {
            etatTirage.exclus = sauvegarde.exclus || [];
            etatTirage.dejaTires = sauvegarde.dejaTires || [];
            etatTirage.avecRemise = sauvegarde.avecRemise || false;
            etatTirage.nombreATirer = sauvegarde.nombreATirer || 1;
            etatTirage.coursId = sauvegarde.coursId || null;
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

    // Lire l'ancien coursId depuis localStorage (pas la mémoire!)
    let ancienCoursId = null;
    try {
        const sauvegarde = db.getSync('etatTirage', null);
        if (sauvegarde) {
            ancienCoursId = sauvegarde.coursId || null;
        }
    } catch (e) {
        console.warn('[Tirage] Erreur lecture ancien coursId:', e);
    }


    // Vérifier si la section tirage est visible (DOM existe)
    const container = document.getElementById('tirage-container');
    if (!container) {
        // Mettre à jour le coursId même si la section n'est pas visible
        etatTirage.coursId = coursActuelId;
        sauvegarderEtatTirage();
        return;
    }

    // Restaurer l'état précédent (sauf coursId qu'on gère manuellement)
    restaurerEtatTirage();

    // Détecter le changement de groupe-cours
    const groupeAChange = ancienCoursId !== null && ancienCoursId !== coursActuelId;
    if (groupeAChange) {
        etatTirage.dejaTires = [];
        etatTirage.exclus = [];
        reinitialiserAffichage();
    }
    etatTirage.coursId = coursActuelId;

    // Utiliser la fonction existante qui gère correctement le filtrage
    let etudiants = [];
    if (typeof obtenirEtudiantsCoursActif === 'function') {
        etudiants = obtenirEtudiantsCoursActif();
        if (etudiants.length > 0) {
        }
    } else {
        // Fallback
        const cleEtudiants = cle('groupeEtudiants');
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
        .filter(e => !estEtudiantExclu(e))
        .map(e => ({
            da: e.da,
            nom: e.nom,
            prenom: e.prenom
        }));

    // Trier par nom.
    // #446 : un étudiant sans `nom` (import CSV incomplet) faisait lever ce
    // tri — et comme `initialiserTirage` est appelée dans une promesse non
    // attendue, l'erreur partait en « Uncaught (in promise) » : le tirage au
    // sort restait muet, sans trace visible pour l'enseignant.
    etatTirage.pool.sort((a, b) => String(a.nom || '').localeCompare(String(b.nom || '')));

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

}

/**
 * Réinitialise la zone d'affichage au message par défaut
 */
function reinitialiserAffichage() {
    const affichage = document.getElementById('tirage-affichage');
    if (affichage) {
        affichage.innerHTML = '<span class="tirage-placeholder">Clique sur "Tirer !" pour commencer</span>';
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
        affichage.innerHTML = `<span class="tirage-nom-anime">${echapperHtml(etudiant.prenom)} ${echapperHtml(etudiant.nom)}</span>`;

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
                <span class="tirage-nom-complet">${echapperHtml(e.prenom)} ${echapperHtml(e.nom)}</span>
            </div>
        `;
    } else {
        // Plusieurs résultats
        affichage.innerHTML = `
            <div class="tirage-resultats-multiples">
                ${resultats.map((e, i) => `
                    <div class="tirage-resultat-item">
                        <span class="tirage-numero">${i + 1}</span>
                        <span class="tirage-nom-complet">${echapperHtml(e.prenom)} ${echapperHtml(e.nom)}</span>
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

    affichage.innerHTML = `<span class="tirage-message tirage-message-${echapperHtml(type)}">${echapperHtml(message)}</span>`;
}

/* ===============================
   MODAL PARAMÈTRES
   =============================== */

/**
 * Ouvre le modal des paramètres de tirage
 */
function ouvrirModalParamsTirage() {

    const disponibles = obtenirEtudiantsDisponibles();
    const total = etatTirage.pool.length;

    const modalHTML = `
        <div id="modal-params-tirage" class="modal-overlay actif" role="dialog" aria-modal="true" aria-labelledby="titre-modal-params">
            <div class="modal-contenu">
                <div class="modal-entete">
                    <h2 id="titre-modal-params">Paramètres du tirage</h2>
                    <button class="modal-fermer" data-action="fermerModalParamsTirage" aria-label="Fermer"><img src="icons/icon-close-window.svg" alt="" class="modal-close-icon"></button>
                </div>
                <div class="modal-corps">

                    <!-- Nombre à tirer -->
                    <div class="form-groupe">
                        <label for="param-nombre" data-tooltip="outil-tirage-nombre">Nombre d'étudiant·es à tirer</label>
                        <select id="param-nombre" class="form-select">
                            <option value="1" ${etatTirage.nombreATirer === 1 ? 'selected' : ''}>1 étudiant·e</option>
                            <option value="2" ${etatTirage.nombreATirer === 2 ? 'selected' : ''}>2 étudiant·es</option>
                            <option value="3" ${etatTirage.nombreATirer === 3 ? 'selected' : ''}>3 étudiant·es</option>
                            <option value="4" ${etatTirage.nombreATirer === 4 ? 'selected' : ''}>4 étudiant·es</option>
                            <option value="5" ${etatTirage.nombreATirer === 5 ? 'selected' : ''}>5 étudiant·es</option>
                        </select>
                    </div>

                    <!-- Mode avec/sans remise -->
                    <div class="form-groupe">
                        <label class="form-checkbox-label" data-tooltip="outil-tirage-remise">
                            <input type="checkbox" id="param-remise" ${etatTirage.avecRemise ? 'checked' : ''}>
                            <span>Avec remise (un même étudiant peut être tiré plusieurs fois)</span>
                        </label>
                    </div>

                    <hr class="modal-separateur">

                    <!-- Liste des étudiants -->
                    <div class="form-groupe">
                        <label data-tooltip="outil-tirage-exclusion">Étudiants du groupe (${disponibles.length}/${total} disponibles)</label>
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
                                               data-on-change="toggleExclusionEtudiant" data-param="${e.da}">
                                        <span class="tirage-etudiant-nom">${echapperHtml(e.nom)}, ${echapperHtml(e.prenom)}</span>
                                        ${estTire && !etatTirage.avecRemise ? '<span class="tirage-badge-tire">tiré</span>' : ''}
                                    </label>
                                `;
                            }).join('')}
                        </div>
                    </div>

                </div>
                <div class="modal-pied">
                    <button class="btn btn-modifier" data-action="reinitialiserTirageComplet">Réinitialiser</button>
                    <button class="btn btn-annuler" data-action="fermerModalParamsTirage">Annuler</button>
                    <button class="btn btn-principal" data-action="appliquerParamsTirage">Appliquer</button>
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
   QUESTIONS FLASH
   =============================== */

// État des questions (persisté dans localStorage avec clé par coursId)
let etatQuestions = {
    questions: [],          // Liste des questions [{id, texte, categorieId}]
    categories: [],         // Liste des catégories [{id, nom}]
    dejaPositions: [],      // IDs des questions déjà posées (mode sans remise)
    avecRemise: false,      // Mode avec remise
    coursId: null,          // Pour stocker par cours
    animationEnCours: false,
    categorieFiltre: null   // null = toutes, sinon ID de la catégorie sélectionnée
};

/**
 * Obtient la clé de stockage pour les questions du cours actif
 */
function obtenirCleQuestions() {
    const infoCours = db.getSync('infoCours', null);
    const coursId = infoCours?.id || 'global';
    return `questionsFlash_${coursId}`;
}

/**
 * Sauvegarde l'état des questions dans localStorage
 */
function sauvegarderEtatQuestions() {
    const cle = obtenirCleQuestions();
    const etatASauvegarder = {
        questions: etatQuestions.questions,
        categories: etatQuestions.categories,
        dejaPositions: etatQuestions.dejaPositions,
        avecRemise: etatQuestions.avecRemise,
        coursId: etatQuestions.coursId
    };
    db.setSync(cle, etatASauvegarder);
}

/**
 * Restaure l'état des questions depuis localStorage
 */
function restaurerEtatQuestions() {
    const cle = obtenirCleQuestions();
    try {
        const sauvegarde = db.getSync(cle, null);
        if (sauvegarde) {
            etatQuestions.questions = sauvegarde.questions || [];
            etatQuestions.categories = sauvegarde.categories || [];
            etatQuestions.dejaPositions = sauvegarde.dejaPositions || [];
            etatQuestions.avecRemise = sauvegarde.avecRemise || false;
            etatQuestions.coursId = sauvegarde.coursId || null;
            return true;
        }
    } catch (e) {
        console.warn('[Questions] Erreur restauration état:', e);
    }
    return false;
}

/**
 * Initialise les Questions Flash pour le cours actif
 */
function initialiserQuestions() {
    const infoCours = db.getSync('infoCours', null);
    const coursActuelId = infoCours?.id || null;


    // Vérifier si la section questions est visible
    const container = document.getElementById('questions-container');
    if (!container) {
        return;
    }

    // Restaurer l'état pour ce cours
    restaurerEtatQuestions();
    etatQuestions.coursId = coursActuelId;
    etatQuestions.categorieFiltre = null; // Reset du filtre à l'init

    // Mettre à jour le dropdown des catégories
    mettreAJourDropdownCategories();
    mettreAJourCompteurQuestions();
}

/**
 * Met à jour le dropdown des catégories pour le filtre
 */
function mettreAJourDropdownCategories() {
    const select = document.getElementById('questions-filtre-categorie');
    if (!select) return;

    // Sauvegarder la valeur actuelle
    const valeurActuelle = select.value;

    // Reconstruire les options
    let html = '<option value="">Toutes les catégories</option>';
    etatQuestions.categories.forEach(cat => {
        const count = etatQuestions.questions.filter(q => q.categorieId === cat.id).length;
        html += `<option value="${echapperHtml(cat.id)}">${echapperHtml(cat.nom)} (${count})</option>`;
    });

    // Ajouter "Sans catégorie" si des questions n'ont pas de catégorie
    const sansCat = etatQuestions.questions.filter(q => !q.categorieId).length;
    if (sansCat > 0) {
        html += `<option value="__none__">Sans catégorie (${sansCat})</option>`;
    }

    select.innerHTML = html;

    // Restaurer la valeur si elle existe encore
    if (valeurActuelle && select.querySelector(`option[value="${valeurActuelle}"]`)) {
        select.value = valeurActuelle;
    }
}

/**
 * Change le filtre de catégorie
 */
function changerFiltreCategorie(valeur) {
    if (valeur === '') {
        etatQuestions.categorieFiltre = null; // Toutes les catégories
    } else if (valeur === '__none__') {
        etatQuestions.categorieFiltre = ''; // Sans catégorie (categorieId null ou vide)
    } else {
        etatQuestions.categorieFiltre = valeur; // Catégorie spécifique
    }

    mettreAJourCompteurQuestions();
}

/**
 * Obtient les questions disponibles pour le tirage
 * Filtre par catégorie si une catégorie est sélectionnée
 */
function obtenirQuestionsDisponibles() {
    return etatQuestions.questions.filter(q => {
        // Filtre par catégorie
        if (etatQuestions.categorieFiltre !== null) {
            if (etatQuestions.categorieFiltre === '' && q.categorieId) {
                return false; // Filtre "Sans catégorie" mais la question a une catégorie
            }
            if (etatQuestions.categorieFiltre !== '' && q.categorieId !== etatQuestions.categorieFiltre) {
                return false; // Filtre sur une catégorie spécifique
            }
        }
        // Filtre déjà posées (mode sans remise)
        if (!etatQuestions.avecRemise && etatQuestions.dejaPositions.includes(q.id)) {
            return false;
        }
        return true;
    });
}

/**
 * Met à jour le compteur de questions disponibles
 */
function mettreAJourCompteurQuestions() {
    const disponibles = obtenirQuestionsDisponibles();
    const compteurEl = document.getElementById('questions-nb-restantes');
    if (compteurEl) {
        compteurEl.textContent = disponibles.length;
    }

    const btnTirer = document.getElementById('btn-tirer-question');
    if (btnTirer) {
        btnTirer.disabled = disponibles.length === 0 || etatQuestions.animationEnCours;
    }
}

/**
 * Lance le tirage d'une question avec animation
 */
function lancerTirageQuestion() {
    if (etatQuestions.animationEnCours) return;

    const disponibles = obtenirQuestionsDisponibles();
    if (disponibles.length === 0) {
        afficherMessageQuestion('Aucune question disponible', 'vide');
        return;
    }

    etatQuestions.animationEnCours = true;
    mettreAJourCompteurQuestions();

    // Sélectionner une question au hasard
    const index = Math.floor(Math.random() * disponibles.length);
    const questionTiree = disponibles[index];

    // Lancer l'animation
    animerRouletteQuestion(disponibles, questionTiree);
}

/**
 * Animation roulette pour les questions
 */
function animerRouletteQuestion(pool, resultat) {
    const affichage = document.getElementById('questions-affichage');
    if (!affichage) return;

    const dureeAnimation = 2000;
    const intervalleDebut = 50;
    const intervalleFin = 250;
    const debut = Date.now();

    function afficherQuestionAleatoire() {
        const elapsed = Date.now() - debut;
        const progression = elapsed / dureeAnimation;

        if (progression >= 1) {
            afficherResultatQuestion(resultat);
            return;
        }

        // Afficher une question aléatoire
        const q = pool[Math.floor(Math.random() * pool.length)];
        const texteAffiche = q.texte.length > 80 ? q.texte.substring(0, 80) + '…' : q.texte;
        affichage.innerHTML = `<span class="question-texte-anime">${echapperHtml(texteAffiche)}</span>`;

        // Ralentir progressivement
        const easeOut = 1 - Math.pow(1 - progression, 3);
        const intervalle = intervalleDebut + (intervalleFin - intervalleDebut) * easeOut;

        setTimeout(afficherQuestionAleatoire, intervalle);
    }

    afficherQuestionAleatoire();
}

/**
 * Affiche le résultat final du tirage de question
 */
function afficherResultatQuestion(question) {
    const affichage = document.getElementById('questions-affichage');
    if (!affichage) return;

    // Marquer comme posée (mode sans remise)
    if (!etatQuestions.avecRemise) {
        if (!etatQuestions.dejaPositions.includes(question.id)) {
            etatQuestions.dejaPositions.push(question.id);
        }
        sauvegarderEtatQuestions();
    }

    affichage.innerHTML = `
        <div class="question-resultat">
            <span class="question-texte-final">${echapperHtml(question.texte)}</span>
        </div>
    `;

    affichage.classList.add('question-revelee');
    setTimeout(() => affichage.classList.remove('question-revelee'), 500);

    etatQuestions.animationEnCours = false;
    mettreAJourCompteurQuestions();
}

/**
 * Affiche un message dans la zone de questions
 */
function afficherMessageQuestion(message, type = 'info') {
    const affichage = document.getElementById('questions-affichage');
    if (!affichage) return;

    affichage.innerHTML = `<span class="question-message question-message-${echapperHtml(type)}">${echapperHtml(message)}</span>`;
}

/* ===============================
   MODAL GESTION DES QUESTIONS
   =============================== */

/**
 * Ouvre le modal de gestion des questions
 */
function ouvrirModalParamsQuestions() {

    // S'assurer que les questions sont restaurées depuis localStorage
    restaurerEtatQuestions();

    const disponibles = obtenirQuestionsDisponibles();
    const total = etatQuestions.questions.length;

    // Grouper les questions par catégorie
    const questionsSansCategorie = etatQuestions.questions.filter(q => !q.categorieId);
    const questionsParCategorie = {};
    etatQuestions.categories.forEach(c => {
        questionsParCategorie[c.id] = etatQuestions.questions.filter(q => q.categorieId === c.id);
    });

    const modalHTML = `
        <div id="modal-params-questions" class="modal-overlay actif" role="dialog" aria-modal="true" aria-labelledby="titre-modal-questions">
            <div class="modal-contenu modal-large">
                <div class="modal-entete">
                    <h2 id="titre-modal-questions">Gestion des Questions Flash</h2>
                    <button class="modal-fermer" data-action="fermerModalParamsQuestions" aria-label="Fermer"><img src="icons/icon-close-window.svg" alt="" class="modal-close-icon"></button>
                </div>
                <div class="modal-corps">

                    <!-- Options -->
                    <div class="form-groupe">
                        <label class="form-checkbox-label">
                            <input type="checkbox" id="param-remise-questions" ${etatQuestions.avecRemise ? 'checked' : ''} data-on-change="toggleRemiseQuestionsHandler">
                            <span>Avec remise (une même question peut être tirée plusieurs fois)</span>
                        </label>
                    </div>

                    <hr class="modal-separateur">

                    <!-- Gestion des catégories -->
                    <div class="form-groupe">
                        <label>Catégories</label>
                        <div class="questions-categories-gestion">
                            <div class="questions-categories-liste">
                                ${etatQuestions.categories.map(c => `
                                    <span class="questions-categorie-tag">
                                        ${echapperHtml(c.nom)}
                                        <button class="questions-categorie-suppr" data-action="supprimerCategorie" data-param="${c.id}" title="Supprimer"><img src="icons/icons8-trash.svg" alt="" class="btn-delete-icon"></button>
                                    </span>
                                `).join('')}
                            </div>
                            <div class="questions-ajouter-categorie">
                                <input type="text" id="nouvelle-categorie" placeholder="Nouvelle catégorie…" class="form-input">
                                <button class="btn btn-modifier" data-action="ajouterCategorie">Ajouter</button>
                            </div>
                        </div>
                    </div>

                    <hr class="modal-separateur">

                    <!-- Ajouter une question -->
                    <div class="form-groupe">
                        <label>Ajouter une question</label>
                        <div class="questions-ajouter-form">
                            <textarea id="nouvelle-question" placeholder="Tape ta question…" class="form-textarea" rows="2"></textarea>
                            <div class="questions-ajouter-actions">
                                <select id="categorie-nouvelle-question" class="form-select">
                                    <option value="">Sans catégorie</option>
                                    ${etatQuestions.categories.map(c => `
                                        <option value="${echapperHtml(c.id)}">${echapperHtml(c.nom)}</option>
                                    `).join('')}
                                </select>
                                <button class="btn btn-principal" data-action="ajouterQuestion">Ajouter</button>
                            </div>
                        </div>
                    </div>

                    <hr class="modal-separateur">

                    <!-- Liste des questions -->
                    <div class="form-groupe">
                        <label>Questions (${disponibles.length}/${total} disponibles)</label>
                        <div class="questions-liste-container">
                            ${etatQuestions.categories.length === 0 && etatQuestions.questions.length === 0 ? `
                                <p class="questions-vide">Aucune question. Ajoute-en ci-dessus.</p>
                            ` : ''}

                            ${etatQuestions.categories.map(cat => `
                                <div class="questions-groupe-categorie">
                                    <h4 class="questions-categorie-titre">${echapperHtml(cat.nom)} (${questionsParCategorie[cat.id]?.length || 0})</h4>
                                    <div class="questions-liste">
                                        ${(questionsParCategorie[cat.id] || []).map(q => genererHTMLQuestionFlash(q)).join('')}
                                    </div>
                                </div>
                            `).join('')}

                            ${questionsSansCategorie.length > 0 ? `
                                <div class="questions-groupe-categorie">
                                    <h4 class="questions-categorie-titre">Sans catégorie (${questionsSansCategorie.length})</h4>
                                    <div class="questions-liste">
                                        ${questionsSansCategorie.map(q => genererHTMLQuestionFlash(q)).join('')}
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    </div>

                </div>
                <div class="modal-pied">
                    <button class="btn btn-modifier" data-action="reinitialiserQuestionsPositions">Réinitialiser les tirages</button>
                    <button class="btn btn-principal" data-action="fermerModalParamsQuestions">Fermer</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Fermeture par clic sur overlay
    const modal = document.getElementById('modal-params-questions');
    modal.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            fermerModalParamsQuestions();
        }
    });
}

/**
 * Toggle le mode avec remise et sauvegarde
 */
function toggleRemiseQuestions(checked) {
    etatQuestions.avecRemise = checked;
    sauvegarderEtatQuestions();
    mettreAJourCompteurQuestions();
}

/**
 * Génère le HTML d'une question dans la liste
 * Note: Nommé genererHTMLQuestionFlash pour éviter collision avec primo-modal.js
 */
function genererHTMLQuestionFlash(question) {
    const estPosee = etatQuestions.dejaPositions.includes(question.id);

    // Générer les options de catégorie
    let optionsCategorie = `<option value="" ${!question.categorieId ? 'selected' : ''}>Sans catégorie</option>`;
    etatQuestions.categories.forEach(cat => {
        optionsCategorie += `<option value="${echapperHtml(cat.id)}" ${question.categorieId === cat.id ? 'selected' : ''}>${echapperHtml(cat.nom)}</option>`;
    });

    return `
        <div class="question-item ${estPosee && !etatQuestions.avecRemise ? 'question-posee' : ''}">
            <span class="question-item-texte" data-action="modifierQuestion" data-param="${question.id}" title="Clique pour modifier">${echapperHtml(question.texte)}</span>
            <div class="question-item-actions">
                <select class="question-categorie-select" data-on-change="changerCategorieQuestionHandler" data-question-id="${question.id}" title="Changer de catégorie">
                    ${optionsCategorie}
                </select>
                ${estPosee && !etatQuestions.avecRemise ? '<span class="question-badge-posee">posée</span>' : ''}
                <button class="btn-icon" data-action="supprimerQuestion" data-param="${question.id}" title="Supprimer">🗑️</button>
            </div>
        </div>
    `;
}

/**
 * Change la catégorie d'une question
 */
function changerCategorieQuestion(questionId, nouvelleCategorieId) {
    const question = etatQuestions.questions.find(q => q.id === questionId);
    if (!question) return;

    question.categorieId = nouvelleCategorieId || null;
    sauvegarderEtatQuestions();
    if (window.signalerEcritureUsager) window.signalerEcritureUsager(obtenirCleQuestions());   // lot F : geste hors témoin (questions saisies)

    // Rafraîchir la liste (la question va changer de groupe)
    rafraichirListeQuestionsModal();
    mettreAJourCompteurQuestions();

}

/**
 * Ferme le modal de gestion des questions
 */
function fermerModalParamsQuestions() {
    const modal = document.getElementById('modal-params-questions');
    if (modal) modal.remove();
}

/**
 * Rafraîchit uniquement la liste des questions dans le modal (sans fermer/rouvrir)
 */
function rafraichirListeQuestionsModal() {
    const container = document.querySelector('.questions-liste-container');
    if (!container) return;

    const disponibles = obtenirQuestionsDisponibles();
    const total = etatQuestions.questions.length;

    // Grouper les questions par catégorie
    const questionsSansCategorie = etatQuestions.questions.filter(q => !q.categorieId);
    const questionsParCategorie = {};
    etatQuestions.categories.forEach(c => {
        questionsParCategorie[c.id] = etatQuestions.questions.filter(q => q.categorieId === c.id);
    });

    // Mettre à jour le label du compteur
    const labelQuestions = document.querySelector('.form-groupe:has(.questions-liste-container) > label');
    if (labelQuestions) {
        labelQuestions.textContent = `Questions (${disponibles.length}/${total} disponibles)`;
    }

    // Mettre à jour le contenu de la liste
    let html = '';

    if (etatQuestions.categories.length === 0 && etatQuestions.questions.length === 0) {
        html = '<p class="questions-vide">Aucune question. Ajoute-en ci-dessus.</p>';
    } else {
        // Questions par catégorie
        etatQuestions.categories.forEach(cat => {
            const questionsCategorie = questionsParCategorie[cat.id] || [];
            if (questionsCategorie.length > 0 || etatQuestions.categories.length > 0) {
                html += `
                    <div class="questions-groupe-categorie">
                        <h4 class="questions-categorie-titre">${echapperHtml(cat.nom)} (${questionsCategorie.length})</h4>
                        <div class="questions-liste">
                            ${questionsCategorie.map(q => genererHTMLQuestionFlash(q)).join('')}
                        </div>
                    </div>
                `;
            }
        });

        // Questions sans catégorie
        if (questionsSansCategorie.length > 0) {
            html += `
                <div class="questions-groupe-categorie">
                    <h4 class="questions-categorie-titre">Sans catégorie (${questionsSansCategorie.length})</h4>
                    <div class="questions-liste">
                        ${questionsSansCategorie.map(q => genererHTMLQuestionFlash(q)).join('')}
                    </div>
                </div>
            `;
        }
    }

    container.innerHTML = html;

    // Aussi mettre à jour le select des catégories
    const selectCategorie = document.getElementById('categorie-nouvelle-question');
    if (selectCategorie) {
        const valeurActuelle = selectCategorie.value;
        selectCategorie.innerHTML = `
            <option value="">Sans catégorie</option>
            ${etatQuestions.categories.map(c => `
                <option value="${echapperHtml(c.id)}" ${c.id === valeurActuelle ? 'selected' : ''}>${echapperHtml(c.nom)}</option>
            `).join('')}
        `;
    }

    // Mettre à jour la liste des catégories (tags)
    const listeCategories = document.querySelector('.questions-categories-liste');
    if (listeCategories) {
        listeCategories.innerHTML = etatQuestions.categories.map(c => `
            <span class="questions-categorie-tag">
                ${echapperHtml(c.nom)}
                <button class="questions-categorie-suppr" data-action="supprimerCategorie" data-param="${c.id}" title="Supprimer"><img src="icons/icons8-trash.svg" alt="" class="btn-delete-icon"></button>
            </span>
        `).join('');
    }

    // Mettre à jour le dropdown de filtre de la carte principale
    mettreAJourDropdownCategories();
}

/**
 * Applique les paramètres du modal
 */
function appliquerParamsQuestions() {
    const remiseEl = document.getElementById('param-remise-questions');
    if (remiseEl) {
        etatQuestions.avecRemise = remiseEl.checked;
    }

    sauvegarderEtatQuestions();
    mettreAJourCompteurQuestions();
    fermerModalParamsQuestions();
}

/**
 * Ajoute une nouvelle catégorie
 */
function ajouterCategorie() {
    const input = document.getElementById('nouvelle-categorie');
    const nom = input?.value.trim();

    if (!nom) {
        alert('Entre un nom de catégorie.');
        return;
    }

    // Vérifier que le nom n'existe pas déjà
    if (etatQuestions.categories.some(c => c.nom.toLowerCase() === nom.toLowerCase())) {
        alert('Cette catégorie existe déjà.');
        return;
    }

    const nouvelleCategorie = {
        id: genererIdUnique('cat_'),
        nom: nom
    };

    etatQuestions.categories.push(nouvelleCategorie);
    sauvegarderEtatQuestions();
    if (window.signalerEcritureUsager) window.signalerEcritureUsager(obtenirCleQuestions());   // lot F : geste hors témoin (questions saisies)

    // Rafraîchir le modal sans le fermer
    rafraichirListeQuestionsModal();

    // Vider le champ
    if (input) input.value = '';
}

/**
 * Supprime une catégorie
 */
function supprimerCategorie(categorieId) {
    if (!confirm('Supprimer cette catégorie ? Les questions seront déplacées vers «Sans catégorie».')) {
        return;
    }

    // Retirer la catégorie des questions
    etatQuestions.questions.forEach(q => {
        if (q.categorieId === categorieId) {
            q.categorieId = null;
        }
    });

    // Supprimer la catégorie
    etatQuestions.categories = etatQuestions.categories.filter(c => c.id !== categorieId);
    sauvegarderEtatQuestions();
    if (window.signalerEcritureUsager) window.signalerEcritureUsager(obtenirCleQuestions());   // lot F : geste hors témoin (questions saisies)

    // Rafraîchir le modal sans le fermer
    rafraichirListeQuestionsModal();
}

/**
 * Ajoute une nouvelle question
 */
function ajouterQuestion() {
    const texteEl = document.getElementById('nouvelle-question');
    const categorieEl = document.getElementById('categorie-nouvelle-question');

    const texte = texteEl?.value.trim();
    if (!texte) {
        alert('Entre le texte de la question.');
        return;
    }

    const nouvelleQuestion = {
        id: genererIdUnique('q_'),
        texte: texte,
        categorieId: categorieEl?.value || null
    };

    etatQuestions.questions.push(nouvelleQuestion);
    sauvegarderEtatQuestions();
    if (window.signalerEcritureUsager) window.signalerEcritureUsager(obtenirCleQuestions());   // lot F : geste hors témoin (questions saisies)

    // Vider le champ
    if (texteEl) texteEl.value = '';

    // Rafraîchir le modal sans le fermer
    rafraichirListeQuestionsModal();
    mettreAJourCompteurQuestions();
}

/**
 * Modifie une question existante
 */
function modifierQuestion(questionId) {
    const question = etatQuestions.questions.find(q => q.id === questionId);
    if (!question) return;

    const nouveauTexte = prompt('Modifier la question:', question.texte);
    if (nouveauTexte === null) return; // Annulé
    if (!nouveauTexte.trim()) {
        alert('Le texte ne peut pas être vide.');
        return;
    }

    question.texte = nouveauTexte.trim();
    sauvegarderEtatQuestions();
    if (window.signalerEcritureUsager) window.signalerEcritureUsager(obtenirCleQuestions());   // lot F : geste hors témoin (questions saisies)

    // Rafraîchir le modal sans le fermer
    rafraichirListeQuestionsModal();
}

/**
 * Supprime une question
 */
function supprimerQuestion(questionId) {
    if (!confirm('Supprimer cette question ?')) return;

    etatQuestions.questions = etatQuestions.questions.filter(q => q.id !== questionId);
    etatQuestions.dejaPositions = etatQuestions.dejaPositions.filter(id => id !== questionId);
    sauvegarderEtatQuestions();
    if (window.signalerEcritureUsager) window.signalerEcritureUsager(obtenirCleQuestions());   // lot F : geste hors témoin (questions saisies)

    // Rafraîchir le modal sans le fermer
    rafraichirListeQuestionsModal();
    mettreAJourCompteurQuestions();
}

/**
 * Réinitialise les questions posées
 */
function reinitialiserQuestionsPositions() {
    etatQuestions.dejaPositions = [];
    sauvegarderEtatQuestions();

    // Rafraîchir le modal sans le fermer
    rafraichirListeQuestionsModal();
    mettreAJourCompteurQuestions();
}

/* ===============================
   WRAPPERS DELEGATION (Phase 5)
   =============================== */

/** Toggle remise questions depuis checkbox */
function toggleRemiseQuestionsHandler(el) {
    toggleRemiseQuestions(el.checked);
}

/** Changer catégorie question depuis select */
function changerCategorieQuestionHandler(el) {
    changerCategorieQuestion(el.dataset.questionId, el.value);
}

/* ===============================
   INITIALISATION
   =============================== */

// Exposer les fonctions globalement AVANT tout appel
// Tirage au sort
window.lancerTirage = lancerTirage;
window.ouvrirModalParamsTirage = ouvrirModalParamsTirage;
window.fermerModalParamsTirage = fermerModalParamsTirage;
window.toggleExclusionEtudiant = toggleExclusionEtudiant;
window.appliquerParamsTirage = appliquerParamsTirage;
window.reinitialiserTirageComplet = reinitialiserTirageComplet;
window.initialiserTirage = initialiserTirage;

// Questions Flash
window.lancerTirageQuestion = lancerTirageQuestion;
window.ouvrirModalParamsQuestions = ouvrirModalParamsQuestions;
window.fermerModalParamsQuestions = fermerModalParamsQuestions;
window.appliquerParamsQuestions = appliquerParamsQuestions;
window.toggleRemiseQuestions = toggleRemiseQuestions;
window.ajouterCategorie = ajouterCategorie;
window.supprimerCategorie = supprimerCategorie;
window.ajouterQuestion = ajouterQuestion;
window.modifierQuestion = modifierQuestion;
window.supprimerQuestion = supprimerQuestion;
window.changerCategorieQuestion = changerCategorieQuestion;
window.reinitialiserQuestionsPositions = reinitialiserQuestionsPositions;
window.changerFiltreCategorie = changerFiltreCategorie;

// Wrappers délégation (Phase 5)
window.toggleRemiseQuestionsHandler = toggleRemiseQuestionsHandler;
window.changerCategorieQuestionHandler = changerCategorieQuestionHandler;
window.initialiserQuestions = initialiserQuestions;



})();
