/* ===============================
   MODULE: TRIMESTRE (REFONTE - INDEX 70)
   
   ⚠️ CHANGEMENT MAJEUR ⚠️
   Ce module devient la SOURCE UNIQUE DE VÉRITÉ pour le calendrier.
   
   PRINCIPE:
   - Collecte les données de l'utilisateur (dates, congés, etc.)
   - TRAITE ces données pour générer un calendrier COMPLET jour par jour
   - STOCKE le calendrier complet dans localStorage
   - Les autres modules LISENT ce calendrier, sans jamais recalculer
   
   CONTENU:
   1. Interface utilisateur (formulaires) - INCHANGÉE
   2. Collecte et sauvegarde des données brutes - INCHANGÉE  
   3. NOUVEAU: Génération du calendrier complet (calendrierComplet)
   4. Affichage des statistiques - AMÉLIORÉ (basé sur calendrierComplet)
   =============================== */

(function() {
'use strict';

/* ===============================
   DÉPENDANCES
   =============================== */
// Modules requis (chargés AVANT):
// - 01-config.js : Variables globales

/* ===============================
   STRUCTURE DES DONNÉES
   =============================== */

/**
 * calendrierComplet (localStorage) - LA SOURCE UNIQUE
 * Structure: Object avec une clé par date
 * 
 * Exemple:
 * {
 *   "2025-08-21": { 
 *     statut: "cours", 
 *     numeroSemaine: 1, 
 *     numeroJour: 1,
 *     jourSemaine: "Jeudi"
 *   },
 *   "2025-08-22": { 
 *     statut: "cours", 
 *     numeroSemaine: 1, 
 *     numeroJour: 2,
 *     jourSemaine: "Vendredi"
 *   },
 *   "2025-08-23": { 
 *     statut: "weekend",
 *     jourSemaine: "Samedi"
 *   },
 *   "2025-09-01": { 
 *     statut: "conge", 
 *     motif: "Fête du travail",
 *     jourSemaine: "Lundi"
 *   },
 *   "2025-09-04": { 
 *     statut: "reprise", 
 *     numeroSemaine: 3, 
 *     numeroJour: 12,
 *     jourSemaine: "Jeudi"
 *   },
 *   "2025-10-13": { 
 *     statut: "semaine-planification",
 *     jourSemaine: "Lundi"
 *   },
 *   "2025-12-15": { 
 *     statut: "semaine-examens",
 *     jourSemaine: "Lundi"
 *   }
 * }
 * 
 * STATUTS POSSIBLES:
 * - "cours" : jour de cours normal
 * - "reprise" : jour de reprise d'un congé
 * - "conge" : congé (avec motif)
 * - "weekend" : samedi ou dimanche
 * - "semaine-planification" : semaine de planification
 * - "semaine-examens" : semaine d'examens
 */

/* ===============================
   🚀 INITIALISATION DU MODULE
   =============================== */

/**
 * Migration : Ajoute des IDs aux événements qui n'en ont pas
 * Nécessaire pour les événements créés avant l'implémentation du système d'ID
 */
function migrerEvenementsAvecIDs() {

    // Migrer les événements prévus
    let evenementsPrevus = db.getSync(cle('evenementsPrevus'), []);
    let nbMigres = 0;

    evenementsPrevus = evenementsPrevus.map((evt, index) => {
        let modifie = false;
        let nouveauEvt = evt;
        // Vérifier si l'ID est manquant ou invalide
        if (!evt.id || evt.id === 'undefined' || evt.id === 'null' || evt.id === '') {
            nouveauEvt = { ...nouveauEvt, id: genererIdUnique('EVT_') };
            modifie = true;
        }
        // Migration categorie : tout événement existant sans champ devient 'institutionnel'
        if (!nouveauEvt.categorie) {
            nouveauEvt = { ...nouveauEvt, categorie: 'institutionnel' };
            modifie = true;
        }
        if (modifie) nbMigres++;
        return nouveauEvt;
    });

    if (nbMigres > 0) {
        db.setSync(cle('evenementsPrevus'), evenementsPrevus);
    }

    // Migrer les événements imprévus
    let evenementsImprevus = db.getSync(cle('evenementsImprevus'), []);
    nbMigres = 0;

    evenementsImprevus = evenementsImprevus.map((evt, index) => {
        let modifie = false;
        let nouveauEvt = evt;
        if (!evt.id || evt.id === 'undefined' || evt.id === 'null' || evt.id === '') {
            nouveauEvt = { ...nouveauEvt, id: genererIdUnique('EVT_') };
            modifie = true;
        }
        if (!nouveauEvt.categorie) {
            nouveauEvt = { ...nouveauEvt, categorie: 'institutionnel' };
            modifie = true;
        }
        if (modifie) nbMigres++;
        return nouveauEvt;
    });

    if (nbMigres > 0) {
        db.setSync(cle('evenementsImprevus'), evenementsImprevus);
    }

}

function initialiserModuleTrimestre() {

    const elementDebut = document.getElementById('debutTrimestre');
    if (!elementDebut) {
        return;
    }

    // Charger d'abord les données pour affichage initial
    chargerCadreCalendrier();
    chargerEvenementsPrevus();
    chargerEvenementsImprevus();

    // Migration : S'assurer que tous les événements ont un ID
    // IMPORTANT : Faire après le premier affichage pour capturer les événements existants
    migrerEvenementsAvecIDs();

    // Recharger l'affichage avec les IDs migrés
    chargerEvenementsPrevus();
    chargerEvenementsImprevus();

    // Générer le calendrier complet
    genererCalendrierComplet();

    // Afficher les statistiques
    afficherStatistiquesTrimestre();

    // ✅ Beta 95 : Synchroniser avec l'interface V2 (trimestre-v2.js)
    // Beta 99.18 (A.9) : appel complet de initialiserTrimestreV2 pour que les
    // sélecteurs groupe-cours/horaires/étudiants reflètent bien l'état courant
    // (sinon, après entrerEnDemo, le dropdown « Choisir pour modifier » reste
    // vide jusqu'à la première écriture dans la bibliothèque groupe-cours).
    if (typeof initialiserTrimestreV2 === 'function') {
        initialiserTrimestreV2();
    } else if (typeof chargerCadreCalendrierV2 === 'function') {
        chargerCadreCalendrierV2();
        chargerEvenementsPrevusV2();
        chargerEvenementsImprevusV2();
    }

}

// [Chantier 1 — 6 fev 2026] chargerEtatCheckboxDemo supprimee (demantelement demo)

/* ===============================
   GESTION DU CADRE CALENDRIER
   =============================== */

function chargerCadreCalendrier() {
    const cadre = db.getSync(cle('cadreCalendrier'), null);
    if (!cadre) return;

    // Remplir les champs du formulaire
    const champs = {
        'debutTrimestre': 'dateDebut',
        'finCours': 'finCours',
        'finTrimestre': 'finTrimestre',
        'remiseNotes': 'remiseNotes',
        'semainePlanificationDebut': 'semainePlanificationDebut',
        'semainePlanificationFin': 'semainePlanificationFin',
        'semaineExamensDebut': 'semaineExamensDebut',
        'semaineExamensFin': 'semaineExamensFin'
    };

    for (const [idElement, cleCadre] of Object.entries(champs)) {
        const element = document.getElementById(idElement);
        if (element && cadre[cleCadre]) {
            element.value = cadre[cleCadre];
        }
    }
}

/* ===============================
   GESTION DES ÉVÉNEMENTS PRÉVUS
   =============================== */

function chargerEvenementsPrevus() {
    const evenements = db.getSync(cle('evenementsPrevus'), []);
    const conteneur = document.getElementById('congesPrevusContainer');

    if (!conteneur) return;

    if (evenements.length === 0) {
        conteneur.innerHTML = '<p style="color: var(--texte-secondaire); font-style: italic;">Aucun événement prévu déclaré.</p>';
        return;
    }

    let html = '';
    evenements.forEach((evt, index) => {
        html += genererCarteEvenementPrevu(evt);
    });

    conteneur.innerHTML = html;
}

/**
 * Génère le HTML d'une carte événement prévu (mode lecture)
 */
function genererCarteEvenementPrevu(evt) {
    const cat = evt.categorie || 'institutionnel';
    const badgeCat = cat === 'personnel'
        ? '<span class="badge-categorie-evenement badge-personnel" title="Absence personnelle — n\'affecte pas la numérotation des semaines du collège">Personnel</span>'
        : '<span class="badge-categorie-evenement badge-institutionnel" title="Événement collège — affecte la numérotation des semaines">Institutionnel</span>';
    return `
<div class="item-carte" id="carte-prevu-${evt.id}">
    <div class="item-carte-header">
        <strong class="item-carte-titre">${evt.description} ${badgeCat}</strong>
        <div class="item-carte-actions">
            <button data-action="modifierEvenementEnPlace" data-param="${evt.id}" data-param2="prevus"
                    class="btn btn-modifier btn-sm"
                    style="padding: 5px 10px; font-size: 0.85rem;">Modifier</button>
            <button data-action="supprimerEvenement" data-param="${evt.id}" data-param2="prevus"
                    class="btn btn-supprimer btn-sm"
                    style="padding: 5px 10px; font-size: 0.85rem;">Supprimer</button>
        </div>
    </div>
    <div class="item-carte-grille ${evt.dateReprise ? 'item-carte-grille-custom' : ''}">
        <div class="item-carte-champ">
            <label class="item-carte-label">Date de l'événement</label>
            <div class="item-carte-valeur">${evt.dateEvenement}</div>
        </div>
        ${evt.dateReprise ? `
        <div class="item-carte-champ">
            <label class="item-carte-label">Horaire remplacé</label>
            <div class="item-carte-valeur ${!evt.horaireReprise ? 'manquant' : ''}">
                ${evt.horaireReprise || 'Non spécifié'}
            </div>
        </div>
        <div class="item-carte-champ">
            <label class="item-carte-label">Date de reprise</label>
            <div class="item-carte-valeur important">${evt.dateReprise}</div>
        </div>
        ` : ''}
    </div>
</div>
`;
}

/**
 * Génère le HTML d'une carte événement prévu en mode édition
 */
function genererCarteEvenementPrevuEdition(evt) {
    const cat = evt.categorie || 'institutionnel';
    const afficheReprise = (cat === 'institutionnel');
    return `
<div class="item-carte" id="carte-prevu-${evt.id}">
    <div class="item-carte-header">
        <strong class="item-carte-titre">
            ${evt.description}
        </strong>
        <div class="item-carte-actions">
            <button class="btn btn-annuler btn-sm" data-action="annulerEditionEnPlace" data-param="${evt.id}" data-param2="prevus"
                    style="padding: 5px 10px; font-size: 0.85rem;">Annuler</button>
            <button class="btn btn-confirmer btn-sm" data-action="sauvegarderEditionEnPlace" data-param="${evt.id}" data-param2="prevus"
                    style="padding: 5px 10px; font-size: 0.85rem;">Sauvegarder</button>
        </div>
    </div>
    <div class="item-carte-champ" style="margin-bottom: 8px;">
        <label class="item-carte-label">Type d'événement</label>
        <select class="controle-form" id="edit-categorie-${evt.id}"
                data-on-change="majAffichageRepriseEditionEnPlace" data-param="${evt.id}" data-param2="prevus"
                style="padding: 4px 8px; font-size: 0.9rem;">
            <option value="institutionnel" ${cat === 'institutionnel' ? 'selected' : ''}>Institutionnel (collège)</option>
            <option value="personnel" ${cat === 'personnel' ? 'selected' : ''}>Personnel (vous seulement)</option>
        </select>
    </div>
    <div class="item-carte-grille ${afficheReprise && evt.dateReprise ? 'item-carte-grille-custom' : ''}">
        <div class="item-carte-champ">
            <label class="item-carte-label">Date de l'événement</label>
            <input type="date" class="controle-form" id="edit-date-${evt.id}" value="${echapperHtml(evt.dateEvenement)}"
                   style="padding: 4px 8px; font-size: 0.9rem;">
        </div>
        <div class="item-carte-champ" id="edit-groupe-horaire-${evt.id}" style="${afficheReprise ? '' : 'display:none;'}">
            <label class="item-carte-label">Horaire remplacé</label>
            <select class="controle-form" id="edit-horaire-${evt.id}"
                    style="padding: 4px 8px; font-size: 0.9rem;">
                <option value="">Pas de reprise</option>
                <option value="Horaire du lundi" ${evt.horaireReprise === 'Horaire du lundi' ? 'selected' : ''}>Horaire du lundi</option>
                <option value="Horaire du mardi" ${evt.horaireReprise === 'Horaire du mardi' ? 'selected' : ''}>Horaire du mardi</option>
                <option value="Horaire du mercredi" ${evt.horaireReprise === 'Horaire du mercredi' ? 'selected' : ''}>Horaire du mercredi</option>
                <option value="Horaire du jeudi" ${evt.horaireReprise === 'Horaire du jeudi' ? 'selected' : ''}>Horaire du jeudi</option>
                <option value="Horaire du vendredi" ${evt.horaireReprise === 'Horaire du vendredi' ? 'selected' : ''}>Horaire du vendredi</option>
            </select>
        </div>
        <div class="item-carte-champ" id="edit-groupe-reprise-${evt.id}" style="${afficheReprise ? '' : 'display:none;'}">
            <label class="item-carte-label">Date de reprise</label>
            <input type="date" class="controle-form" id="edit-reprise-${evt.id}" value="${evt.dateReprise || ''}"
                   style="padding: 4px 8px; font-size: 0.9rem;">
        </div>
    </div>
    <input type="hidden" id="edit-desc-${evt.id}" value="${echapperHtml(evt.description)}">
</div>
`;
}

function supprimerEvenement(id, type) {
    if (!confirm('Supprimer cet événement ?')) return;

    const cleEvt = type === 'prevus' ? cle('evenementsPrevus') : cle('evenementsImprevus');
    let evenements = db.getSync(cleEvt, []);
    evenements = evenements.filter(e => e.id !== id);
    db.setSync(cleEvt, evenements);

    // CRITIQUE: Régénérer le calendrier complet
    genererCalendrierComplet();

    if (type === 'prevus') {
        chargerEvenementsPrevus();
    } else {
        chargerEvenementsImprevus();
    }
    afficherStatistiquesTrimestre();
    notifications.succes('Événement supprimé');
}

/**
 * Passe une carte en mode édition en place
 */
function modifierEvenementEnPlace(id, type) {
    const cleEvt = type === 'prevus' ? cle('evenementsPrevus') : cle('evenementsImprevus');
    const evenements = db.getSync(cleEvt, []);
    const evt = evenements.find(e => e.id === id);

    if (!evt) {
        alert('Événement introuvable');
        return;
    }

    // Remplacer la carte par sa version éditable
    const carte = document.getElementById(`carte-${type === 'prevus' ? 'prevu' : 'imprevu'}-${id}`);
    if (carte) {
        if (type === 'prevus') {
            carte.outerHTML = genererCarteEvenementPrevuEdition(evt);
        } else {
            carte.outerHTML = genererCarteEvenementImprevuEdition(evt);
        }
    }
}

/**
 * Annule l'édition et restaure la carte normale
 */
function annulerEditionEnPlace(id, type) {
    if (type === 'prevus') {
        chargerEvenementsPrevus();
    } else {
        chargerEvenementsImprevus();
    }
}

/**
 * Sauvegarde les modifications faites en place
 */
function sauvegarderEditionEnPlace(id, type) {
    const dateEvenement = document.getElementById(`edit-date-${id}`)?.value;
    const description = document.getElementById(`edit-desc-${id}`)?.value;
    const categorie = document.getElementById(`edit-categorie-${id}`)?.value || 'institutionnel';
    let horaireReprise = document.getElementById(`edit-horaire-${id}`)?.value || '';
    let dateReprise = document.getElementById(`edit-reprise-${id}`)?.value || '';

    // Convention §3.0 : pas de reprise sur événement personnel
    if (categorie === 'personnel') {
        horaireReprise = '';
        dateReprise = '';
    }

    if (!dateEvenement || !description) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
    }

    if (dateReprise && !horaireReprise) {
        alert('Veuillez indiquer quel jour de cours est remplacé (ex: Horaire du lundi)');
        return;
    }

    const cleEvt = type === 'prevus' ? cle('evenementsPrevus') : cle('evenementsImprevus');
    const evenements = db.getSync(cleEvt, []);
    const index = evenements.findIndex(e => e.id === id);

    if (index !== -1) {
        evenements[index] = {
            id: id,
            dateEvenement,
            description,
            categorie,
            horaireReprise,
            dateReprise
        };
        db.setSync(cleEvt, evenements);

        // Régénérer tout
        genererCalendrierComplet();
        if (typeof genererSeancesCompletes === 'function') {
            genererSeancesCompletes();
        }

        if (type === 'prevus') {
            chargerEvenementsPrevus();
        } else {
            chargerEvenementsImprevus();
        }
        afficherStatistiquesTrimestre();
        notifications.succes('Événement modifié');
    }
}


/* ===============================
   GESTION DES ÉVÉNEMENTS IMPRÉVUS
   =============================== */

function chargerEvenementsImprevus() {
    const evenements = db.getSync(cle('evenementsImprevus'), []);
    const conteneur = document.getElementById('congesImprevusContainer');

    if (!conteneur) return;

    if (evenements.length === 0) {
        conteneur.innerHTML = '<p style="color: var(--texte-secondaire); font-style: italic;">Aucun événement imprévu déclaré.</p>';
        return;
    }

    let html = '';
    evenements.forEach((evt, index) => {
        html += genererCarteEvenementImprevu(evt);
    });

    conteneur.innerHTML = html;
}

/**
 * Génère le HTML d'une carte événement imprévu (mode lecture)
 */
function genererCarteEvenementImprevu(evt) {
    const cat = evt.categorie || 'institutionnel';
    const badgeCat = cat === 'personnel'
        ? '<span class="badge-categorie-evenement badge-personnel" title="Absence personnelle — n\'affecte pas la numérotation des semaines du collège">Personnel</span>'
        : '<span class="badge-categorie-evenement badge-institutionnel" title="Événement collège — affecte la numérotation des semaines">Institutionnel</span>';
    return `
<div class="item-carte" id="carte-imprevu-${evt.id}">
    <div class="item-carte-header">
        <strong class="item-carte-titre">${evt.description} ${badgeCat}</strong>
        <div class="item-carte-actions">
            <button data-action="modifierEvenementEnPlace" data-param="${evt.id}" data-param2="imprevus"
                    class="btn btn-modifier btn-sm"
                    style="padding: 5px 10px; font-size: 0.85rem;">Modifier</button>
            <button data-action="supprimerEvenement" data-param="${evt.id}" data-param2="imprevus"
                    class="btn btn-supprimer btn-sm"
                    style="padding: 5px 10px; font-size: 0.85rem;">Supprimer</button>
        </div>
    </div>
    <div class="item-carte-grille ${evt.dateReprise ? 'item-carte-grille-custom' : ''}">
        <div class="item-carte-champ">
            <label class="item-carte-label">Date de l'événement</label>
            <div class="item-carte-valeur">${evt.dateEvenement}</div>
        </div>
        ${evt.dateReprise ? `
        <div class="item-carte-champ">
            <label class="item-carte-label">Horaire remplacé</label>
            <div class="item-carte-valeur ${!evt.horaireReprise ? 'manquant' : ''}">
                ${evt.horaireReprise || 'Non spécifié'}
            </div>
        </div>
        <div class="item-carte-champ">
            <label class="item-carte-label">Date de reprise</label>
            <div class="item-carte-valeur important">${evt.dateReprise}</div>
        </div>
        ` : ''}
    </div>
</div>
`;
}


/* ===============================
   📌 EXPORTS / API PUBLIQUE
   =============================== */

/**
 * Fonction d'accès au calendrier complet
 * TOUTES LES AUTRES MODULES doivent utiliser cette fonction
 * 
 * @returns {Object} Le calendrier complet (dictionnaire date -> infos)
 */
function obtenirCalendrierComplet() {
    return db.getSync(cle('calendrierComplet'), {});
}

/**
 * Obtient les infos d'une date spécifique
 *
 * @param {string} date - Date au format YYYY-MM-DD
 * @returns {Object|null} Infos du jour ou null
 */
function obtenirInfosJour(date) {
    const calendrier = obtenirCalendrierComplet();
    return calendrier[date] || null;
}

// [Chantier 1 — 6 fev 2026] genererPresencesDemo + basculerDonneesDemo supprimees (demantelement demo)
// Voir rapport d'audit : docs/rapport-demo-2026-02-06.md

/* ===============================
   ANCIEN CODE DEMO SUPPRIME
   genererPresencesDemo (~80 lignes)
   basculerDonneesDemo (~360 lignes)
   =============================== */

/* ===============================
   🔁 TOGGLE AFFICHAGE REPRISE SELON CATÉGORIE
   =============================== */

function _toggleGroupesReprise(idHoraire, idDateReprise, afficher) {
    const gh = document.getElementById(idHoraire);
    const gd = document.getElementById(idDateReprise);
    if (gh) gh.style.display = afficher ? '' : 'none';
    if (gd) gd.style.display = afficher ? '' : 'none';
    if (!afficher) {
        const horaireSelect = gh ? gh.querySelector('select') : null;
        const dateInput = gd ? gd.querySelector('input') : null;
        if (horaireSelect) horaireSelect.value = '';
        if (dateInput) dateInput.value = '';
    }
}

function majAffichageRepriseEditionEnPlace(id) {
    const cat = document.getElementById(`edit-categorie-${id}`)?.value || 'institutionnel';
    _toggleGroupesReprise(`edit-groupe-horaire-${id}`, `edit-groupe-reprise-${id}`, cat === 'institutionnel');
}

/* ===============================
   🌐 EXPORTS GLOBAUX
   =============================== */

// Export de la fonction d'initialisation pour main.js
window.initialiserModuleTrimestre = initialiserModuleTrimestre;

// Exports calendrier (utilisés par trimestres.js, calendrier-vue.js, saisie-presences.js, trimestre-v2.js)
window.genererCalendrierComplet = genererCalendrierComplet;
window.obtenirCalendrierComplet = obtenirCalendrierComplet;
window.obtenirInfosJour = obtenirInfosJour;
window.afficherStatistiquesTrimestre = afficherStatistiquesTrimestre;

// Exports cadre calendrier (utilisés par index.html onclick)

// Exports événements (utilisés par index.html onclick et HTML généré)
window.supprimerEvenement = supprimerEvenement;
window.modifierEvenementEnPlace = modifierEvenementEnPlace;
window.sauvegarderEditionEnPlace = sauvegarderEditionEnPlace;
window.annulerEditionEnPlace = annulerEditionEnPlace;

// Exports formulaires (utilisés par index.html onclick)

// Exports toggle catégorie (utilisés par data-on-change dans formulaires)
window.majAffichageRepriseEditionEnPlace = majAffichageRepriseEditionEnPlace;

})();
