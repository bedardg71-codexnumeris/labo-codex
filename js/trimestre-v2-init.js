/* ===============================
   MODULE: TRIMESTRE V2 — INIT
   Refactor étape 3 session A (17 mai 2026) : extrait depuis trimestre-v2.js
   lignes 34-401 + 486-948 (zone 1 MODULES-MAP §2.4 sauf
   `afficherStatistiquesTrimestreV2` qui reste au résidu comme helper
   transversal).

   Périmètre : init + identification + cadre calendrier + événements
   prévus/imprévus (21 fonctions + 2 variables module-scope
   `evenementPrevuEnEditionV2`, `evenementImprevuEnEditionV2`).

   Dépendances cross-module accédées via `window.X` (résidu chargé AVANT) :
   - `window.chargerDropdownCoursV2` (zone 3)
   - `window.chargerGroupeCoursV2` (zone 6)
   - `window.chargerListeEtudiantsV2` (zone 4)
   - `window.mettreAJourGuideGroupeCours` (helper transversal résidu)
   - `window.afficherStatistiquesTrimestreV2` (zone 1 mais resté résidu)
   =============================== */

(function() {
'use strict';

/* ===============================
   INITIALISATION
   =============================== */

/**
 * Initialise l'onglet Trimestre v2
 * Appelé au chargement de la page
 */
function initialiserTrimestreV2() {

    // Charger l'identification du trimestre (nom, session, année)
    chargerIdentificationTrimestreV2();

    // Charger le cadre calendrier dans les nouveaux champs
    chargerCadreCalendrierV2();

    // Charger les événements (prévus et imprévus)
    chargerEvenementsPrevusV2();
    chargerEvenementsImprevusV2();

    // Charger la liste des cours dans le dropdown
    window.chargerDropdownCoursV2();

    // Charger le profil enseignant (Beta 95.2) — extrait dans trimestre-v2-enseignants.js (session A, 17 mai 2026)
    if (typeof window.chargerProfilEnseignantV2 === 'function') {
        window.chargerProfilEnseignantV2();
    }

    // Charger les séances dans l'accordéon Horaire — extrait dans trimestre-v2-horaires.js (session A, 17 mai 2026)
    if (typeof window.chargerSeancesV2 === 'function') {
        window.chargerSeancesV2();
    }

    // Charger les horaires (Beta 95.2) — extrait dans trimestre-v2-horaires.js (session A, 17 mai 2026)
    if (typeof window.chargerHorairesV2 === 'function') {
        window.chargerHorairesV2();
    }

    // Charger les groupe-cours (Beta 95.2)
    window.chargerGroupeCoursV2();

    // 🆕 BETA 95.1 : Charger la durée de période sauvegardée
    if (typeof chargerDureePeriodeUI === 'function') {
        chargerDureePeriodeUI();
    }

    // Charger la liste des étudiants dans l'accordéon Groupes
    window.chargerListeEtudiantsV2();

    // Populer le dropdown trimestre et afficher le formulaire — extrait dans trimestre-v2-liste.js (session A, 17 mai 2026)
    if (typeof window.populerDropdownTrimestreV2 === 'function') {
        window.populerDropdownTrimestreV2();
    }
    if (typeof window.afficherFormulaireTrimestreActif === 'function') {
        window.afficherFormulaireTrimestreActif();
    }

    // Restaurer l'état des accordéons (ouvert/fermé) depuis localStorage
    if (typeof restaurerEtatAccordeons === 'function') {
        restaurerEtatAccordeons();
    }

    // Mettre à jour le guide groupe-cours (indicateurs d'état)
    window.mettreAJourGuideGroupeCours();

}

/* ===============================
   IDENTIFICATION DU TRIMESTRE
   =============================== */

/**
 * Charge l'identification du trimestre actif dans les champs v2-
 */
function chargerIdentificationTrimestreV2() {
    const trimestre = typeof obtenirTrimestreActif === 'function' ? obtenirTrimestreActif() : null;

    const elemNom = document.getElementById('v2-nomTrimestre');
    const elemSession = document.getElementById('v2-sessionTrimestre');
    const elemAnnee = document.getElementById('v2-anneeTrimestre');

    if (trimestre) {
        if (elemNom) elemNom.value = trimestre.nom || '';
        if (elemSession) {
            // Convertir session : H → hiver, A → automne, E → ete
            const sessionMap = { 'H': 'hiver', 'A': 'automne', 'E': 'ete' };
            elemSession.value = sessionMap[trimestre.session] || '';
        }
        if (elemAnnee) elemAnnee.value = trimestre.annee || '';
    } else {
        // Pas de trimestre actif, vider les champs
        if (elemNom) elemNom.value = '';
        if (elemSession) elemSession.value = '';
        if (elemAnnee) elemAnnee.value = '';
    }
}

/**
 * Sauvegarde l'identification du trimestre depuis les champs v2-
 * Crée un nouveau trimestre si nécessaire ou met à jour l'existant
 */
function sauvegarderIdentificationTrimestreV2() {
    const nom = document.getElementById('v2-nomTrimestre')?.value?.trim() || '';
    const session = document.getElementById('v2-sessionTrimestre')?.value || '';
    const annee = document.getElementById('v2-anneeTrimestre')?.value || '';

    // Validation minimale
    if (!session || !annee) {
        return;
    }

    // Convertir session : hiver → H, automne → A, ete → E
    const sessionMap = { 'hiver': 'H', 'automne': 'A', 'ete': 'E' };
    const sessionCode = sessionMap[session] || 'H';
    const id = `${sessionCode.toLowerCase()}${annee}`;

    // Générer le nom si vide
    const nomTrimestre = nom || `${session.charAt(0).toUpperCase() + session.slice(1)} ${annee}`;

    // Récupérer les trimestres existants
    const trimestres = db.getSync('trimestres', []);
    const index = trimestres.findIndex(t => t.actif === true);

    if (index >= 0) {
        // Mettre à jour le trimestre actif
        const ancienId = trimestres[index].id;
        trimestres[index].id = id;
        trimestres[index].nom = nomTrimestre;
        trimestres[index].session = sessionCode;
        trimestres[index].annee = parseInt(annee);

        db.setSync('trimestres', trimestres);

        // Synchroniser les miroirs window.trimestreActif + clé storage
        window.trimestreActif = id;
        db.setSync('trimestreActif', id);

        // Si l'ID a changé, il faudrait migrer les données (complexe, pour l'instant on log)
        if (ancienId !== id) {
        }

    } else {
        // Créer un nouveau trimestre
        const nouveauTrimestre = {
            id: id,
            nom: nomTrimestre,
            session: sessionCode,
            annee: parseInt(annee),
            dateCreation: new Date().toISOString().split('T')[0],
            actif: true
        };

        // Désactiver les autres trimestres
        trimestres.forEach(t => t.actif = false);
        trimestres.push(nouveauTrimestre);

        db.setSync('trimestres', trimestres);
        window.trimestreActif = id;
        db.setSync('trimestreActif', id);

    }

    // Rafraîchir la liste dans Gestion des trimestres (extrait dans trimestre-v2-liste.js — session A, 17 mai 2026)
    if (typeof window.afficherListeTrimestreGestion === 'function') {
        window.afficherListeTrimestreGestion();
    }

    // Rafraîchir le dropdown trimestre
    if (typeof window.populerDropdownTrimestreV2 === 'function') {
        window.populerDropdownTrimestreV2();
    }
}

/* ===============================
   CADRE CALENDRIER
   =============================== */

/**
 * Charge les données du cadre calendrier dans les champs v2-
 */
function chargerCadreCalendrierV2() {
    const cadre = db.getSync(cle('cadreCalendrier'), null);

    // Mapping des IDs v2 vers les clés du cadre
    const champs = {
        'v2-debutTrimestre': 'dateDebut',
        'v2-finCours': 'finCours',
        'v2-finTrimestre': 'finTrimestre',
        'v2-remiseNotes': 'remiseNotes',
        'v2-semainePlanificationDebut': 'semainePlanificationDebut',
        'v2-semainePlanificationFin': 'semainePlanificationFin',
        'v2-semaineExamensDebut': 'semaineExamensDebut',
        'v2-semaineExamensFin': 'semaineExamensFin'
    };

    // Remplir ou vider les champs selon que le cadre existe ou non
    for (const [idElement, cleCadre] of Object.entries(champs)) {
        const element = document.getElementById(idElement);
        if (element) {
            element.value = (cadre && cadre[cleCadre]) ? cadre[cleCadre] : '';
        }
    }

    // Si pas de cadre, réinitialiser les statistiques et sortir
    if (!cadre) {
        const elemSemaines = document.getElementById('v2-nombreSemaines');
        const elemJours = document.getElementById('v2-nombreJoursCours');
        const elemStats = document.getElementById('v2-statsCongesReprises');
        if (elemSemaines) elemSemaines.textContent = '0';
        if (elemJours) elemJours.textContent = '0';
        if (elemStats) elemStats.textContent = '';
        return;
    }

    // Vérifier si le calendrier existe et correspond aux bornes actuelles
    const calendrier = db.getSync(cle('calendrierComplet'), null);
    const doitRegenerer = !calendrier ||
        (calendrier && cadre.dateDebut && !calendrier[cadre.dateDebut]) ||
        (calendrier && cadre.finTrimestre && !calendrier[cadre.finTrimestre]);

    if (doitRegenerer && cadre.dateDebut && cadre.finCours && cadre.finTrimestre) {
        if (typeof genererCalendrierComplet === 'function') {
            genererCalendrierComplet();
        }
    }

    // Mettre à jour les statistiques après un court délai
    setTimeout(() => {
        window.afficherStatistiquesTrimestreV2();
    }, 100);
}

/**
 * Sauvegarde le cadre calendrier depuis les champs v2-
 */
function sauvegarderCadreCalendrierV2() {
    const cadre = {
        dateDebut: document.getElementById('v2-debutTrimestre')?.value || '',
        finCours: document.getElementById('v2-finCours')?.value || '',
        finTrimestre: document.getElementById('v2-finTrimestre')?.value || '',
        remiseNotes: document.getElementById('v2-remiseNotes')?.value || '',
        semainePlanificationDebut: document.getElementById('v2-semainePlanificationDebut')?.value || '',
        semainePlanificationFin: document.getElementById('v2-semainePlanificationFin')?.value || '',
        semaineExamensDebut: document.getElementById('v2-semaineExamensDebut')?.value || '',
        semaineExamensFin: document.getElementById('v2-semaineExamensFin')?.value || ''
    };

    // Validation #215 : dateDebut + finCours + finTrimestre sont obligatoires.
    // Sans ces dates, les fonctions de semaine, échéances et snapshots cassent.
    const manquants = [];
    if (!cadre.dateDebut) manquants.push({ id: 'v2-debutTrimestre', label: 'Début du trimestre' });
    if (!cadre.finCours) manquants.push({ id: 'v2-finCours', label: 'Fin des cours réguliers' });
    if (!cadre.finTrimestre) manquants.push({ id: 'v2-finTrimestre', label: 'Fin du trimestre' });

    if (manquants.length > 0) {
        const details = manquants.map(c => '• ' + c.label).join('\n');
        notifications.erreur(
            'Dates obligatoires manquantes',
            'Renseigne ces champs avant de continuer :\n' + details
        );
        // Focus sur le premier champ vide
        const premier = document.getElementById(manquants[0].id);
        if (premier) premier.focus();
        return;
    }

    db.setSync(cle('cadreCalendrier'), cadre);

    // Régénérer le calendrier complet
    if (typeof genererCalendrierComplet === 'function') {
        genererCalendrierComplet();
    } else {
        console.warn('[Trimestre V2] Fonction genererCalendrierComplet non disponible');
    }

    // Mettre à jour les statistiques après un délai pour laisser le temps à la synchronisation
    setTimeout(() => {
        window.afficherStatistiquesTrimestreV2();
    }, 300);

    // Notification
    notifications.succes('Cadre du trimestre sauvegardé');
}

/**
 * Réinitialise les bornes du trimestre aux valeurs vides
 */
function reinitialiserBornesTrimestreV2() {
    if (!confirm('Veux-tu vraiment réinitialiser les bornes du trimestre ?')) {
        return;
    }

    // Vider les champs de bornes
    const champs = [
        'v2-debutTrimestre',
        'v2-finCours',
        'v2-finTrimestre',
        'v2-remiseNotes'
    ];

    champs.forEach(id => {
        const elem = document.getElementById(id);
        if (elem) elem.value = '';
    });

    // Mettre à jour le storage
    let cadre = db.getSync(cle('cadreCalendrier')) || {};
    cadre.dateDebut = '';
    cadre.finCours = '';
    cadre.finTrimestre = '';
    cadre.remiseNotes = '';
    db.setSync(cle('cadreCalendrier'), cadre);

    // Réinitialiser les statistiques
    const elemSemaines = document.getElementById('v2-nombreSemaines');
    const elemJours = document.getElementById('v2-nombreJoursCours');
    const elemConges = document.getElementById('v2-totalConges');

    if (elemSemaines) elemSemaines.textContent = '0';
    if (elemJours) elemJours.textContent = '0';
    if (elemConges) elemConges.textContent = '0';

    // Notification
    notifications.succes('Bornes du trimestre réinitialisées');
}

/**
 * Réinitialise les semaines spéciales aux valeurs vides
 */
function reinitialiserSemainesSpecialesV2() {
    if (!confirm('Veux-tu vraiment réinitialiser les semaines spéciales ?')) {
        return;
    }

    // Vider les champs de semaines spéciales
    const champs = [
        'v2-semainePlanificationDebut',
        'v2-semainePlanificationFin',
        'v2-semaineExamensDebut',
        'v2-semaineExamensFin'
    ];

    champs.forEach(id => {
        const elem = document.getElementById(id);
        if (elem) elem.value = '';
    });

    // Mettre à jour le storage
    let cadre = db.getSync(cle('cadreCalendrier')) || {};
    cadre.semainePlanificationDebut = '';
    cadre.semainePlanificationFin = '';
    cadre.semaineExamensDebut = '';
    cadre.semaineExamensFin = '';
    db.setSync(cle('cadreCalendrier'), cadre);

    // Notification
    notifications.succes('Semaines spéciales réinitialisées');
}

/**
 * Affiche les statistiques du trimestre dans les spans v2-
 */
/* ===============================
   ÉVÉNEMENTS PRÉVUS/IMPRÉVUS
   =============================== */

/**
 * Charge et affiche les événements prévus
 */
function chargerEvenementsPrevusV2() {
    const evenements = db.getSync(cle('evenementsPrevus'), []);
    const conteneur = document.getElementById('v2-congesPrevusContainer');
    const compteur = document.getElementById('v2-nombreEvenementsPrevus');

    // Mettre à jour le compteur
    if (compteur) compteur.textContent = evenements.length;

    if (!conteneur) return;

    if (evenements.length === 0) {
        conteneur.innerHTML = '';
        return;
    }

    let html = '';
    evenements.forEach(evt => {
        html += genererCarteEvenementV2(evt, 'prevu');
    });

    conteneur.innerHTML = html;
}

/**
 * Charge et affiche les événements imprévus
 */
function chargerEvenementsImprevusV2() {
    const evenements = db.getSync(cle('evenementsImprevus'), []);
    const conteneur = document.getElementById('v2-congesImprevusContainer');
    const compteur = document.getElementById('v2-nombreEvenementsImprevus');

    // Mettre à jour le compteur
    if (compteur) compteur.textContent = evenements.length;

    if (!conteneur) return;

    if (evenements.length === 0) {
        conteneur.innerHTML = '';
        return;
    }

    let html = '';
    evenements.forEach(evt => {
        html += genererCarteEvenementV2(evt, 'imprevu');
    });

    conteneur.innerHTML = html;
}

/**
 * Génère le HTML d'une carte événement (mode compact)
 */
function genererCarteEvenementV2(evt, type) {
    const repriseInfo = evt.dateReprise ?
        `<div style="font-size: 0.85rem; color: var(--gris-moyen); margin-top: 4px;">
            → Reprise <strong>${evt.horaireReprise || ''}</strong> le <strong>${evt.dateReprise}</strong>
        </div>` : '';

    const cat = evt.categorie || 'institutionnel';
    const badgeCat = cat === 'personnel'
        ? '<span class="badge-categorie-evenement badge-personnel">Personnel</span>'
        : '<span class="badge-categorie-evenement badge-institutionnel">Institutionnel</span>';

    return `
    <div class="item-carte-compact" style="margin-bottom: 12px; padding: 12px 15px; background: var(--bleu-tres-pale); border-radius: 8px; border-left: 4px solid var(--accent-primaire);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 15px;">
            <div style="flex: 1; min-width: 0;">
                <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
                    <strong style="font-size: 1rem;">${evt.description}</strong>
                    ${badgeCat}
                    <span style="color: var(--accent-primaire); font-weight: 500;">${evt.dateEvenement}</span>
                </div>
                ${repriseInfo}
            </div>
            <div style="display: flex; gap: 8px; flex-shrink: 0;">
                <button data-action="modifierEvenementV2" data-param="${evt.id}" data-param2="${type}" class="btn btn-secondaire btn-sm" style="padding: 6px 12px; font-size: 0.85rem;">Modifier</button>
                <button data-action="supprimerEvenementV2" data-param="${evt.id}" data-param2="${type}" class="btn btn-supprimer btn-sm" style="padding: 6px 12px; font-size: 0.85rem;">Suppr.</button>
            </div>
        </div>
    </div>`;
}

// Variables pour stocker l'ID de l'événement en édition
let evenementPrevuEnEditionV2 = null;
let evenementImprevuEnEditionV2 = null;

/**
 * Affiche le formulaire d'ajout d'événement (intégré dans v2)
 */
function afficherFormEvenementV2(type) {
    if (type === 'prevu') {
        evenementPrevuEnEditionV2 = null;
        const form = document.getElementById('v2-formEvenementPrevu');
        const titre = document.getElementById('v2-titreFormPrevu');
        const btn = document.getElementById('v2-btnConfirmerPrevu');

        if (form) {
            // Réinitialiser les champs
            setValue('v2-dateEvenementPrevu', '');
            setValue('v2-descriptionPrevu', '');
            setValue('v2-categorieEvenementPrevu', 'institutionnel');
            setValue('v2-horaireReprisePrevu', '');
            setValue('v2-dateReprisePrevu', '');
            majAffichageRepriseV2Prevu();

            if (titre) titre.textContent = 'Nouvel événement prévu';
            if (btn) btn.textContent = 'Ajouter';

            form.classList.remove('u-hide');
            // Ne pas faire défiler la page
        }
    } else if (type === 'imprevu') {
        evenementImprevuEnEditionV2 = null;
        const form = document.getElementById('v2-formEvenementImprevu');
        const titre = document.getElementById('v2-titreFormImprevu');
        const btn = document.getElementById('v2-btnConfirmerImprevu');

        if (form) {
            // Réinitialiser les champs
            setValue('v2-dateEvenementImprevu', '');
            setValue('v2-descriptionImprevu', '');
            setValue('v2-categorieEvenementImprevu', 'institutionnel');
            setValue('v2-horaireRepriseImprevu', '');
            setValue('v2-dateRepriseImprevu', '');
            majAffichageRepriseV2Imprevu();

            if (titre) titre.textContent = 'Nouvel événement imprévu';
            if (btn) btn.textContent = 'Ajouter';

            form.classList.remove('u-hide');
            // Ne pas faire défiler la page
        }
    }
}

function majAffichageRepriseV2Prevu() {
    const cat = document.getElementById('v2-categorieEvenementPrevu')?.value || 'institutionnel';
    const bloc = document.getElementById('v2-blocReprisePrevu');
    if (!bloc) return;
    if (cat === 'personnel') {
        bloc.style.display = 'none';
        setValue('v2-horaireReprisePrevu', '');
        setValue('v2-dateReprisePrevu', '');
    } else {
        bloc.style.display = 'grid';
    }
}

function majAffichageRepriseV2Imprevu() {
    const cat = document.getElementById('v2-categorieEvenementImprevu')?.value || 'institutionnel';
    const bloc = document.getElementById('v2-blocRepriseImprevu');
    if (!bloc) return;
    if (cat === 'personnel') {
        bloc.style.display = 'none';
        setValue('v2-horaireRepriseImprevu', '');
        setValue('v2-dateRepriseImprevu', '');
    } else {
        bloc.style.display = 'grid';
    }
}

/**
 * Modifie un événement (pré-remplit le formulaire v2)
 */
function modifierEvenementV2(id, type) {
    const typeStorage = type === 'prevu' ? 'evenementsPrevus' : 'evenementsImprevus';
    const evenements = db.getSync(cle(typeStorage), []);
    const evt = evenements.find(e => e.id === id);

    if (!evt) {
        alert('Événement introuvable');
        return;
    }

    if (type === 'prevu') {
        evenementPrevuEnEditionV2 = id;
        const form = document.getElementById('v2-formEvenementPrevu');
        const titre = document.getElementById('v2-titreFormPrevu');
        const btn = document.getElementById('v2-btnConfirmerPrevu');

        if (form) {
            setValue('v2-dateEvenementPrevu', evt.dateEvenement || '');
            setValue('v2-descriptionPrevu', evt.description || '');
            setValue('v2-categorieEvenementPrevu', evt.categorie || 'institutionnel');
            setValue('v2-horaireReprisePrevu', evt.horaireReprise || '');
            setValue('v2-dateReprisePrevu', evt.dateReprise || '');
            majAffichageRepriseV2Prevu();

            if (titre) titre.textContent = 'Modifier l\'événement';
            if (btn) btn.textContent = 'Sauvegarder';

            form.classList.remove('u-hide');
            // Ne pas faire défiler la page
        }
    } else {
        evenementImprevuEnEditionV2 = id;
        const form = document.getElementById('v2-formEvenementImprevu');
        const titre = document.getElementById('v2-titreFormImprevu');
        const btn = document.getElementById('v2-btnConfirmerImprevu');

        if (form) {
            setValue('v2-dateEvenementImprevu', evt.dateEvenement || '');
            setValue('v2-descriptionImprevu', evt.description || '');
            setValue('v2-categorieEvenementImprevu', evt.categorie || 'institutionnel');
            setValue('v2-horaireRepriseImprevu', evt.horaireReprise || '');
            setValue('v2-dateRepriseImprevu', evt.dateReprise || '');
            majAffichageRepriseV2Imprevu();

            if (titre) titre.textContent = 'Modifier l\'événement';
            if (btn) btn.textContent = 'Sauvegarder';

            form.classList.remove('u-hide');
            // Ne pas faire défiler la page
        }
    }
}

/**
 * Confirme l'ajout ou la modification d'un événement prévu
 */
function confirmerEvenementPrevuV2() {
    const dateEvenement = document.getElementById('v2-dateEvenementPrevu')?.value;
    const description = document.getElementById('v2-descriptionPrevu')?.value?.trim();
    const categorie = document.getElementById('v2-categorieEvenementPrevu')?.value || 'institutionnel';
    let horaireReprise = document.getElementById('v2-horaireReprisePrevu')?.value || '';
    let dateReprise = document.getElementById('v2-dateReprisePrevu')?.value || '';

    // Convention §3.0 : pas de reprise sur événement personnel
    if (categorie === 'personnel') {
        horaireReprise = '';
        dateReprise = '';
    }

    if (!dateEvenement || !description) {
        alert('Veuillez remplir la date et la description.');
        return;
    }

    if (dateReprise && !horaireReprise) {
        alert('Veuillez indiquer quel jour de cours est remplacé.');
        return;
    }

    const evenements = db.getSync(cle('evenementsPrevus'), []);

    if (evenementPrevuEnEditionV2) {
        // Mode édition
        const index = evenements.findIndex(e => e.id === evenementPrevuEnEditionV2);
        if (index !== -1) {
            evenements[index] = {
                id: evenementPrevuEnEditionV2,
                dateEvenement,
                description,
                categorie,
                horaireReprise,
                dateReprise
            };
        }
    } else {
        // Mode ajout
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

    // Régénérer le calendrier
    if (typeof genererCalendrierComplet === 'function') {
        genererCalendrierComplet();
    }
    if (typeof genererSeancesCompletes === 'function') {
        genererSeancesCompletes();
    }

    annulerFormEvenementPrevuV2();
    chargerEvenementsPrevusV2();
    window.afficherStatistiquesTrimestreV2();

    notifications.succes(evenementPrevuEnEditionV2 ? 'Événement modifié' : 'Événement ajouté');
    evenementPrevuEnEditionV2 = null;
}

/**
 * Annule le formulaire d'événement prévu
 */
function annulerFormEvenementPrevuV2() {
    evenementPrevuEnEditionV2 = null;
    const form = document.getElementById('v2-formEvenementPrevu');
    if (form) form.classList.add('u-hide');
}

/**
 * Confirme l'ajout ou la modification d'un événement imprévu
 */
function confirmerEvenementImprevuV2() {
    const dateEvenement = document.getElementById('v2-dateEvenementImprevu')?.value;
    const description = document.getElementById('v2-descriptionImprevu')?.value?.trim();
    const categorie = document.getElementById('v2-categorieEvenementImprevu')?.value || 'institutionnel';
    let horaireReprise = document.getElementById('v2-horaireRepriseImprevu')?.value || '';
    let dateReprise = document.getElementById('v2-dateRepriseImprevu')?.value || '';

    // Convention §3.0 : pas de reprise sur événement personnel
    if (categorie === 'personnel') {
        horaireReprise = '';
        dateReprise = '';
    }

    if (!dateEvenement || !description) {
        alert('Veuillez remplir la date et la description.');
        return;
    }

    if (dateReprise && !horaireReprise) {
        alert('Veuillez indiquer quel jour de cours est remplacé.');
        return;
    }

    const evenements = db.getSync(cle('evenementsImprevus'), []);

    if (evenementImprevuEnEditionV2) {
        // Mode édition
        const index = evenements.findIndex(e => e.id === evenementImprevuEnEditionV2);
        if (index !== -1) {
            evenements[index] = {
                id: evenementImprevuEnEditionV2,
                dateEvenement,
                description,
                categorie,
                horaireReprise,
                dateReprise
            };
        }
    } else {
        // Mode ajout
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

    // Régénérer le calendrier
    if (typeof genererCalendrierComplet === 'function') {
        genererCalendrierComplet();
    }
    if (typeof genererSeancesCompletes === 'function') {
        genererSeancesCompletes();
    }

    annulerFormEvenementImprevuV2();
    chargerEvenementsImprevusV2();
    window.afficherStatistiquesTrimestreV2();

    notifications.succes(evenementImprevuEnEditionV2 ? 'Événement modifié' : 'Événement ajouté');
    evenementImprevuEnEditionV2 = null;
}

/**
 * Annule le formulaire d'événement imprévu
 */
function annulerFormEvenementImprevuV2() {
    evenementImprevuEnEditionV2 = null;
    const form = document.getElementById('v2-formEvenementImprevu');
    if (form) form.classList.add('u-hide');
}

/**
 * Supprime un événement
 */
function supprimerEvenementV2(id, type) {
    if (!confirm('Veux-tu vraiment supprimer cet événement ?')) return;

    const typeStorage = type === 'prevu' ? 'evenementsPrevus' : 'evenementsImprevus';
    let evenements = db.getSync(cle(typeStorage), []);

    evenements = evenements.filter(e => e.id !== id);
    db.setSync(cle(typeStorage), evenements);

    // Régénérer le calendrier
    if (typeof genererCalendrierComplet === 'function') {
        genererCalendrierComplet();
    }

    // Recharger l'affichage
    if (type === 'prevu') {
        chargerEvenementsPrevusV2();
    } else {
        chargerEvenementsImprevusV2();
    }

    // Mettre à jour les statistiques du trimestre
    window.afficherStatistiquesTrimestreV2();

    notifications.succes('Événement supprimé');
}

// Exports — 21 fonctions migrées du bloc principal résidu (L4007-4026 originelles
// + L2814 pour sauvegarderIdentificationTrimestreV2 isolé).
window.initialiserTrimestreV2 = initialiserTrimestreV2;
window.chargerIdentificationTrimestreV2 = chargerIdentificationTrimestreV2;
window.sauvegarderIdentificationTrimestreV2 = sauvegarderIdentificationTrimestreV2;
window.chargerCadreCalendrierV2 = chargerCadreCalendrierV2;
window.sauvegarderCadreCalendrierV2 = sauvegarderCadreCalendrierV2;
window.reinitialiserBornesTrimestreV2 = reinitialiserBornesTrimestreV2;
window.reinitialiserSemainesSpecialesV2 = reinitialiserSemainesSpecialesV2;
window.chargerEvenementsPrevusV2 = chargerEvenementsPrevusV2;
window.chargerEvenementsImprevusV2 = chargerEvenementsImprevusV2;
window.afficherFormEvenementV2 = afficherFormEvenementV2;
window.modifierEvenementV2 = modifierEvenementV2;
window.supprimerEvenementV2 = supprimerEvenementV2;
window.confirmerEvenementPrevuV2 = confirmerEvenementPrevuV2;
window.annulerFormEvenementPrevuV2 = annulerFormEvenementPrevuV2;
window.confirmerEvenementImprevuV2 = confirmerEvenementImprevuV2;
window.annulerFormEvenementImprevuV2 = annulerFormEvenementImprevuV2;
window.majAffichageRepriseV2Prevu = majAffichageRepriseV2Prevu;
window.majAffichageRepriseV2Imprevu = majAffichageRepriseV2Imprevu;

})();

