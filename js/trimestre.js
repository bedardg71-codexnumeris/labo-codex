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

function sauvegarderCadreCalendrier() {
    const cadre = {
        dateDebut: document.getElementById('debutTrimestre')?.value || '',
        finCours: document.getElementById('finCours')?.value || '',
        finTrimestre: document.getElementById('finTrimestre')?.value || '',
        remiseNotes: document.getElementById('remiseNotes')?.value || '',
        semainePlanificationDebut: document.getElementById('semainePlanificationDebut')?.value || '',
        semainePlanificationFin: document.getElementById('semainePlanificationFin')?.value || '',
        semaineExamensDebut: document.getElementById('semaineExamensDebut')?.value || '',
        semaineExamensFin: document.getElementById('semaineExamensFin')?.value || ''
    };

    // VALIDATION : vérifier que les dates essentielles sont présentes
    if (!cadre.dateDebut || !cadre.finCours || !cadre.finTrimestre) {
        alert('Veuillez renseigner au minimum : début du trimestre, fin des cours et fin du trimestre');
        return;
    }

    db.setSync(cle('cadreCalendrier'), cadre);

    // CRITIQUE: Régénérer le calendrier complet après modification
    genererCalendrierComplet();
    afficherStatistiquesTrimestre();

    afficherNotification('Bornes du trimestre sauvegardées');
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
            <input type="date" class="controle-form" id="edit-date-${evt.id}" value="${evt.dateEvenement}"
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
    <input type="hidden" id="edit-desc-${evt.id}" value="${evt.description}">
</div>
`;
}

function confirmerAjoutEvenement() {
    const dateEvenement = document.getElementById('dateEvenementPrevu')?.value;
    const description = document.getElementById('descriptionEvenementPrevu')?.value;
    const categorie = document.getElementById('categorieEvenementPrevu')?.value || 'institutionnel';
    let horaireReprise = document.getElementById('horaireReprisePrevu')?.value || '';
    let dateReprise = document.getElementById('dateReprisePrevu')?.value || '';

    // Convention §3.0 : pas de reprise sur événement personnel
    if (categorie === 'personnel') {
        horaireReprise = '';
        dateReprise = '';
    }

    const form = document.getElementById('formEvenementPrevu');
    const editId = form.getAttribute('data-edit-id');

    if (!dateEvenement || !description) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
    }

    if (dateReprise && !horaireReprise) {
        alert('Veuillez indiquer quel jour de cours est remplacé (ex: Horaire du lundi)');
        return;
    }

    const evenements = db.getSync(cle('evenementsPrevus'), []);

    if (editId) {
        // MODE ÉDITION : Remplacer l'événement existant
        const index = evenements.findIndex(e => e.id === editId);
        if (index !== -1) {
            evenements[index] = {
                id: editId,
                dateEvenement,
                description,
                categorie,
                horaireReprise,
                dateReprise
            };
        }
        form.removeAttribute('data-edit-id');
    } else {
        // MODE AJOUT : Créer un nouvel événement
        evenements.push({
            id: genererIdUnique('EVT_'),
            dateEvenement,
            description,
            categorie,
            horaireReprise,
            dateReprise
        });
    }

    db.setSync(cle('evenementsPrevus'), evenements);

    // Régénérer tout
    genererCalendrierComplet();
    if (typeof genererSeancesCompletes === 'function') {
        genererSeancesCompletes();
    }

    chargerEvenementsPrevus();
    afficherStatistiquesTrimestre();
    annulerFormEvenement();
    afficherNotification(editId ? 'Événement modifié' : 'Événement ajouté');
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
    afficherNotification('Événement supprimé');
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
        afficherNotification('Événement modifié');
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

/**
 * Génère le HTML d'une carte événement imprévu en mode édition
 */
function genererCarteEvenementImprevuEdition(evt) {
    const cat = evt.categorie || 'institutionnel';
    const afficheReprise = (cat === 'institutionnel');
    return `
<div class="item-carte" id="carte-imprevu-${evt.id}">
    <div class="item-carte-header">
        <strong class="item-carte-titre">
            ${evt.description}
        </strong>
        <div class="item-carte-actions">
            <button class="btn btn-annuler btn-sm" data-action="annulerEditionEnPlace" data-param="${evt.id}" data-param2="imprevus"
                    style="padding: 5px 10px; font-size: 0.85rem;">Annuler</button>
            <button class="btn btn-confirmer btn-sm" data-action="sauvegarderEditionEnPlace" data-param="${evt.id}" data-param2="imprevus"
                    style="padding: 5px 10px; font-size: 0.85rem;">Sauvegarder</button>
        </div>
    </div>
    <div class="item-carte-champ" style="margin-bottom: 8px;">
        <label class="item-carte-label">Type d'événement</label>
        <select class="controle-form" id="edit-categorie-${evt.id}"
                data-on-change="majAffichageRepriseEditionEnPlace" data-param="${evt.id}" data-param2="imprevus"
                style="padding: 4px 8px; font-size: 0.9rem;">
            <option value="institutionnel" ${cat === 'institutionnel' ? 'selected' : ''}>Institutionnel (collège)</option>
            <option value="personnel" ${cat === 'personnel' ? 'selected' : ''}>Personnel (vous seulement)</option>
        </select>
    </div>
    <div class="item-carte-grille ${afficheReprise && evt.dateReprise ? 'item-carte-grille-custom' : ''}">
        <div class="item-carte-champ">
            <label class="item-carte-label">Date de l'événement</label>
            <input type="date" class="controle-form" id="edit-date-${evt.id}" value="${evt.dateEvenement}"
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
    <input type="hidden" id="edit-desc-${evt.id}" value="${evt.description}">
</div>
`;
}

function confirmerAjoutEvenementImprevu() {
    const dateEvenement = document.getElementById('dateEvenementImprevu')?.value;
    const description = document.getElementById('descriptionEvenementImprevu')?.value;
    const categorie = document.getElementById('categorieEvenementImprevu')?.value || 'institutionnel';
    let horaireReprise = document.getElementById('horaireRepriseImprevu')?.value || '';
    let dateReprise = document.getElementById('dateRepriseImprevu')?.value || '';

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

    const form = document.getElementById('formEvenementImprevu');
    const editId = form.getAttribute('data-edit-id');

    const evenements = db.getSync(cle('evenementsImprevus'), []);

    if (editId) {
        // MODE ÉDITION : Remplacer l'événement existant
        const index = evenements.findIndex(e => e.id === editId);
        if (index !== -1) {
            evenements[index] = {
                id: editId,
                dateEvenement,
                description,
                categorie,
                horaireReprise,
                dateReprise
            };
        }
        form.removeAttribute('data-edit-id');
    } else {
        // MODE AJOUT : Créer un nouvel événement
        evenements.push({
            id: genererIdUnique('EVT_'),
            dateEvenement,
            description,
            categorie,
            horaireReprise,
            dateReprise
        });
    }

    db.setSync(cle('evenementsImprevus'), evenements);

    // CRITIQUE: Régénérer le calendrier complet
    genererCalendrierComplet();

    chargerEvenementsImprevus();
    afficherStatistiquesTrimestre();
    annulerFormEvenementImprevu();
    afficherNotification(editId ? 'Événement imprévu modifié' : 'Événement imprévu ajouté');
}

/* ===============================
   🏭 GÉNÉRATION DU CALENDRIER COMPLET
   ⚠️ COEUR DU MODULE - SOURCE UNIQUE ⚠️
   =============================== */

/**
 * Génère le calendrier complet jour par jour
 * C'est LA fonction centrale qui crée la source unique de vérité
 * 
 * APPELÉE:
 * - À l'initialisation
 * - Après chaque modification des réglages
 * - Après ajout/suppression de congés
 */
function genererCalendrierComplet() {

    const cadre = db.getSync(cle('cadreCalendrier'), {});
    const evenementsPrevus = db.getSync(cle('evenementsPrevus'), []);
    const evenementsImprevus = db.getSync(cle('evenementsImprevus'), []);

    // 🆕 FIX (16 fév 2026) : Synchroniser horaireHebdo depuis TOUTES les entités horaire
    // avant de générer le calendrier. Garantit que le calendrier reflète tous les groupes-cours.
    const horairesEntites = db.getSync(cle('horaires'), []);
    if (horairesEntites.length > 0) {
        const toutesSeances = [];
        const joursDejaVus = new Set();
        horairesEntites.forEach(h => {
            if (h.seances && Array.isArray(h.seances)) {
                h.seances.forEach(s => {
                    const jourNormalise = s.jour.toLowerCase();
                    if (!joursDejaVus.has(jourNormalise)) {
                        joursDejaVus.add(jourNormalise);
                        toutesSeances.push(s);
                    }
                });
            }
        });
        if (toutesSeances.length > 0) {
            db.setSync(cle('horaireHebdo'), toutesSeances);
        }
    }

    const horaireHebdo = db.getSync(cle('horaireHebdo'), null);
    let joursAvecCours = null;
    if (horaireHebdo && Array.isArray(horaireHebdo) && horaireHebdo.length > 0) {
        joursAvecCours = new Set(horaireHebdo.map(s => s.jour.toLowerCase()));
    }

    const dateDebut = cadre.dateDebut || cadre.debutTrimestre || '2025-08-21';
    const finCours = cadre.finCours || '2025-12-12';
    const finTrimestre = cadre.finTrimestre || '2025-12-22';

    if (!dateDebut || !finCours || !finTrimestre) {
        console.warn('⚠️ Dates du trimestre manquantes, calendrier non généré');
        return {};
    }

    // Construction des maps. Convention §3.0 : un événement personnel n'a pas de reprise.
    // Si une dateReprise est saisie sur un événement personnel, on l'ignore et on warn.
    const tousEvenements = [...evenementsPrevus, ...evenementsImprevus];
    const mapConges = {};
    const mapReprises = {};
    tousEvenements.forEach(evt => {
        mapConges[evt.dateEvenement] = evt;
        const cat = evt.categorie || 'institutionnel';
        if (evt.dateReprise) {
            if (cat === 'personnel') {
                console.warn('Événement personnel "' + evt.description + '" (' + evt.dateEvenement + ') a une dateReprise — ignorée par convention §3.0');
            } else {
                mapReprises[evt.dateReprise] = evt;
            }
        }
    });

    // ============================================================
    // PASSE 1 — Séquence des jours pédagogiques avec rôle effectif
    // ============================================================
    // Pour chaque jour entre dateDebut et finCours, déterminer si c'est un jour
    // pédagogique du collège et quel rôle (Lundi/Mardi/...) il joue.
    // Le n-ième jour d'un rôle reçoit numeroSemaine = n (cf. plan §3.2 passe 2).
    //
    // Règles :
    //  - Weekend / semaine planif / semaine examens → ignoré
    //  - Férié institutionnel sans reprise → ignoré (jour pédagogique perdu)
    //  - Férié institutionnel avec reprise → ignoré ici (la date de reprise prend le rôle)
    //  - Férié personnel → inclus, rôle = jour calendaire (le collège n'a rien annulé)
    //  - Jour de reprise institutionnelle → rôle = jour cible
    //  - Jour normal → rôle = jour calendaire
    const compteursRoles = { Lundi: 0, Mardi: 0, Mercredi: 0, Jeudi: 0, Vendredi: 0 };
    const numSemParDate = {};
    const roleParDate = {};

    let curseur = creerDateLocale(dateDebut);
    const finCoursDate = creerDateLocale(finCours);
    let limitePasse1 = 0;
    while (curseur <= finCoursDate && limitePasse1 < 1000) {
        limitePasse1++;
        const dateStr = formaterDateTrimestreYMD(curseur);
        const jourCalendaire = obtenirNomJour(curseur);

        let roleEffectif = null;

        if (estWeekend(curseur)) {
            // ignoré
        } else if (estDansPlage(dateStr, cadre.semainePlanificationDebut, cadre.semainePlanificationFin)
                || estDansPlage(dateStr, cadre.semaineExamensDebut, cadre.semaineExamensFin)) {
            // ignoré
        } else if (mapConges[dateStr]) {
            const evt = mapConges[dateStr];
            const cat = evt.categorie || 'institutionnel';
            if (cat === 'personnel') {
                roleEffectif = jourCalendaire;
            }
            // institutionnel : ignoré (la reprise éventuelle prendra le rôle ailleurs)
        } else if (mapReprises[dateStr]) {
            const evt = mapReprises[dateStr];
            const jourRemplace = (evt.horaireReprise || '').replace('Horaire du ', '');
            roleEffectif = jourRemplace.charAt(0).toUpperCase() + jourRemplace.slice(1);
        } else {
            roleEffectif = jourCalendaire;
        }

        if (roleEffectif && Object.prototype.hasOwnProperty.call(compteursRoles, roleEffectif)) {
            compteursRoles[roleEffectif]++;
            numSemParDate[dateStr] = compteursRoles[roleEffectif];
            roleParDate[dateStr] = roleEffectif;
        }

        curseur.setDate(curseur.getDate() + 1);
    }

    // ============================================================
    // PASSE 2 — Construction du calendrier complet
    // ============================================================
    const calendrier = {};
    let dateActuelle = creerDateLocale(dateDebut);
    const dateFin = creerDateLocale(finTrimestre);
    let compteurJoursCours = 0;
    let limitePasse2 = 0;

    while (dateActuelle <= dateFin && limitePasse2 < 1000) {
        limitePasse2++;
        const dateStr = formaterDateTrimestreYMD(dateActuelle);
        const jourSemaine = obtenirNomJour(dateActuelle);

        let infosJour = { jourSemaine };

        if (estWeekend(dateActuelle)) {
            infosJour.statut = 'weekend';
        } else if (estDansPlage(dateStr, cadre.semainePlanificationDebut, cadre.semainePlanificationFin)) {
            infosJour.statut = 'semaine-planification';
        } else if (estDansPlage(dateStr, cadre.semaineExamensDebut, cadre.semaineExamensFin)) {
            infosJour.statut = 'semaine-examens';
        } else if (mapConges[dateStr]) {
            const evt = mapConges[dateStr];
            const cat = evt.categorie || 'institutionnel';
            infosJour.statut = 'conge';
            infosJour.motif = evt.description;
            infosJour.categorieEvenement = cat;
            // Personnel : afficher le numéro de semaine (le rôle compte normalement)
            if (cat === 'personnel' && numSemParDate[dateStr]) {
                infosJour.numeroSemaine = numSemParDate[dateStr];
            }
        } else if (mapReprises[dateStr]) {
            infosJour.statut = 'reprise';
            const evt = mapReprises[dateStr];
            if (evt && evt.horaireReprise) {
                const jourRemplace = evt.horaireReprise.replace('Horaire du ', '');
                infosJour.jourRemplace = jourRemplace.charAt(0).toUpperCase() + jourRemplace.slice(1);
            }
            if (numSemParDate[dateStr]) {
                infosJour.numeroSemaine = numSemParDate[dateStr];
            }
            compteurJoursCours++;
            infosJour.numeroJour = compteurJoursCours;
        } else if (dateStr <= finCours && (joursAvecCours === null || joursAvecCours.has(jourSemaine.toLowerCase()))) {
            infosJour.statut = 'cours';
            if (numSemParDate[dateStr]) {
                infosJour.numeroSemaine = numSemParDate[dateStr];
            }
            compteurJoursCours++;
            infosJour.numeroJour = compteurJoursCours;
        } else if (dateStr <= finCours) {
            // Jour ouvrable hors horaire du groupe : afficher quand même le numéro de semaine
            // du collège (plan §3.4) pour les utilisateurs avec horaire 3 jours/sem.
            infosJour.statut = 'jour-ouvrable';
            if (numSemParDate[dateStr]) {
                infosJour.numeroSemaine = numSemParDate[dateStr];
            }
        } else {
            infosJour.statut = 'hors-cours';
        }

        calendrier[dateStr] = infosJour;
        dateActuelle.setDate(dateActuelle.getDate() + 1);
    }

    // STOCKER dans localStorage - LA SOURCE UNIQUE
    db.setSync(cle('calendrierComplet'), calendrier);

    return calendrier;
}

/* ===============================
   STATISTIQUES DU TRIMESTRE
   =============================== */

function afficherStatistiquesTrimestre() {
    const calendrier = db.getSync(cle('calendrierComplet'), {});

    if (Object.keys(calendrier).length === 0) {
        console.warn('⚠️ Calendrier complet non généré');
        return;
    }

    // Calculer les statistiques à partir du calendrier complet
    let nbSemaines = 0;
    let nbJoursCours = 0;
    let nbConges = 0;

    const semainesVues = new Set();

    for (const [date, infos] of Object.entries(calendrier)) {
        if (infos.statut === 'cours' || infos.statut === 'reprise') {
            nbJoursCours++;
            if (infos.numeroSemaine) {
                semainesVues.add(infos.numeroSemaine);
            }
        }
        if (infos.statut === 'conge') {
            nbConges++;
        }
    }

    nbSemaines = semainesVues.size;

    // Afficher dans les cartes
    const elemSemaines = document.getElementById('nombreSemaines');
    const elemJours = document.getElementById('nombreJoursCours');
    const elemConges = document.getElementById('totalConges');

    if (elemSemaines) elemSemaines.textContent = nbSemaines;
    if (elemJours) elemJours.textContent = nbJoursCours;
    if (elemConges) elemConges.textContent = nbConges;


    // Synchroniser avec trimestre-v2.js (interface V2)
    if (typeof afficherStatistiquesTrimestreV2 === 'function') {
        afficherStatistiquesTrimestreV2();
    }
}

/* ===============================
   FONCTIONS UTILITAIRES
   =============================== */

function creerDateLocale(dateStr) {
    const [annee, mois, jour] = dateStr.split('-').map(Number);
    return new Date(annee, mois - 1, jour);
}

function formaterDateTrimestreYMD(date) {
    const annee = date.getFullYear();
    const mois = String(date.getMonth() + 1).padStart(2, '0');
    const jour = String(date.getDate()).padStart(2, '0');
    return `${annee}-${mois}-${jour}`;
}

function estWeekend(date) {
    const jour = date.getDay();
    return jour === 0 || jour === 6;
}

function obtenirNomJour(date) {
    const jours = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    return jours[date.getDay()];
}

function estDansPlage(date, debut, fin) {
    if (!debut || !fin) return false;
    return date >= debut && date <= fin;
}

function afficherNotification(message, details = '') {

    // Créer l'élément de notification
    const notification = document.createElement('div');
    notification.className = 'notification-succes';
    notification.innerHTML = `
        <div>${message}</div>
        ${details ? `<div class="notification-details">${details}</div>` : ''}
    `;

    // Ajouter au body
    document.body.appendChild(notification);

    // Supprimer après 3 secondes
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/* ===============================
   FONCTIONS UI (formulaires)
   =============================== */

function afficherFormEvenement() {
    const form = document.getElementById('formEvenementPrevu');
    if (form) {
        form.classList.remove('u-hide');
        // S'assurer qu'on est en mode création (pas édition)
        if (!form.getAttribute('data-edit-id')) {
            document.getElementById('texteFormPrevu').textContent = 'Nouvel événement prévu';
            document.getElementById('btnConfirmerPrevu').textContent = 'Ajouter';
        }
    }
}

function annulerFormEvenement() {
    const form = document.getElementById('formEvenementPrevu');
    if (form) {
        form.classList.add('u-hide');
        form.removeAttribute('data-edit-id');
        document.getElementById('dateEvenementPrevu').value = '';
        document.getElementById('descriptionEvenementPrevu').value = '';
        const cat = document.getElementById('categorieEvenementPrevu');
        if (cat) cat.value = 'institutionnel';
        document.getElementById('horaireReprisePrevu').value = '';
        document.getElementById('dateReprisePrevu').value = '';
        majAffichageRepriseFormPrevu();

        // Réinitialiser le titre et le bouton en mode création
        document.getElementById('texteFormPrevu').textContent = 'Nouvel événement prévu';
        document.getElementById('btnConfirmerPrevu').textContent = 'Ajouter';
    }
}

function afficherFormEvenementImprevu() {
    const form = document.getElementById('formEvenementImprevu');
    if (form) {
        form.classList.remove('u-hide');
        // S'assurer qu'on est en mode création (pas édition)
        if (!form.getAttribute('data-edit-id')) {
            document.getElementById('texteFormImprevu').textContent = 'Nouvel événement imprévu';
            document.getElementById('btnConfirmerImprevu').textContent = 'Ajouter';
        }
    }
}

function annulerFormEvenementImprevu() {
    const form = document.getElementById('formEvenementImprevu');
    if (form) {
        form.classList.add('u-hide');
        form.removeAttribute('data-edit-id');
        document.getElementById('dateEvenementImprevu').value = '';
        document.getElementById('descriptionEvenementImprevu').value = '';
        const cat = document.getElementById('categorieEvenementImprevu');
        if (cat) cat.value = 'institutionnel';
        document.getElementById('horaireRepriseImprevu').value = '';
        document.getElementById('dateRepriseImprevu').value = '';
        majAffichageRepriseFormImprevu();

        // Réinitialiser le titre et le bouton en mode création
        document.getElementById('texteFormImprevu').textContent = 'Nouvel événement imprévu';
        document.getElementById('btnConfirmerImprevu').textContent = 'Ajouter';
    }
}

function modifierEvenement(id, type) {
    const cleEvt = type === 'prevus' ? cle('evenementsPrevus') : cle('evenementsImprevus');
    const evenements = db.getSync(cleEvt, []);
    const evt = evenements.find(e => e.id === id);

    if (!evt) {
        alert('Événement introuvable');
        return;
    }

    // Afficher le formulaire approprié avec les données
    if (type === 'prevus') {
        // Pré-remplir le formulaire
        document.getElementById('dateEvenementPrevu').value = evt.dateEvenement;
        document.getElementById('descriptionEvenementPrevu').value = evt.description;
        const catSel = document.getElementById('categorieEvenementPrevu');
        if (catSel) catSel.value = evt.categorie || 'institutionnel';
        document.getElementById('horaireReprisePrevu').value = evt.horaireReprise || '';
        document.getElementById('dateReprisePrevu').value = evt.dateReprise || '';
        majAffichageRepriseFormPrevu();

        // Stocker l'ID en mode édition
        const form = document.getElementById('formEvenementPrevu');
        form.setAttribute('data-edit-id', id);

        // Changer le titre et le bouton en mode édition
        document.getElementById('texteFormPrevu').textContent = 'Modifier l\'événement';
        document.getElementById('btnConfirmerPrevu').textContent = 'Sauvegarder les modifications';

        // Afficher le formulaire
        afficherFormEvenement();
    } else {
        // Pré-remplir le formulaire
        document.getElementById('dateEvenementImprevu').value = evt.dateEvenement;
        document.getElementById('descriptionEvenementImprevu').value = evt.description;
        const catSel = document.getElementById('categorieEvenementImprevu');
        if (catSel) catSel.value = evt.categorie || 'institutionnel';
        document.getElementById('horaireRepriseImprevu').value = evt.horaireReprise || '';
        document.getElementById('dateRepriseImprevu').value = evt.dateReprise || '';
        majAffichageRepriseFormImprevu();

        // Stocker l'ID en mode édition
        const form = document.getElementById('formEvenementImprevu');
        form.setAttribute('data-edit-id', id);

        // Changer le titre et le bouton en mode édition
        document.getElementById('texteFormImprevu').textContent = 'Modifier l\'événement';
        document.getElementById('btnConfirmerImprevu').textContent = 'Sauvegarder les modifications';

        // Afficher le formulaire
        afficherFormEvenementImprevu();
    }
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

function majAffichageRepriseFormPrevu() {
    const cat = document.getElementById('categorieEvenementPrevu')?.value || 'institutionnel';
    _toggleGroupesReprise('groupeHoraireReprisePrevu', 'groupeDateReprisePrevu', cat === 'institutionnel');
}

function majAffichageRepriseFormImprevu() {
    const cat = document.getElementById('categorieEvenementImprevu')?.value || 'institutionnel';
    _toggleGroupesReprise('groupeHoraireRepriseImprevu', 'groupeDateRepriseImprevu', cat === 'institutionnel');
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
window.sauvegarderCadreCalendrier = sauvegarderCadreCalendrier;

// Exports événements (utilisés par index.html onclick et HTML généré)
window.confirmerAjoutEvenement = confirmerAjoutEvenement;
window.confirmerAjoutEvenementImprevu = confirmerAjoutEvenementImprevu;
window.supprimerEvenement = supprimerEvenement;
window.modifierEvenement = modifierEvenement;
window.modifierEvenementEnPlace = modifierEvenementEnPlace;
window.sauvegarderEditionEnPlace = sauvegarderEditionEnPlace;
window.annulerEditionEnPlace = annulerEditionEnPlace;

// Exports formulaires (utilisés par index.html onclick)
window.afficherFormEvenement = afficherFormEvenement;
window.annulerFormEvenement = annulerFormEvenement;
window.afficherFormEvenementImprevu = afficherFormEvenementImprevu;
window.annulerFormEvenementImprevu = annulerFormEvenementImprevu;

// Exports toggle catégorie (utilisés par data-on-change dans formulaires)
window.majAffichageRepriseFormPrevu = majAffichageRepriseFormPrevu;
window.majAffichageRepriseFormImprevu = majAffichageRepriseFormImprevu;
window.majAffichageRepriseEditionEnPlace = majAffichageRepriseEditionEnPlace;

// Exports utilitaires (utilisés par d'autres modules)
window.afficherNotification = afficherNotification;


})();
