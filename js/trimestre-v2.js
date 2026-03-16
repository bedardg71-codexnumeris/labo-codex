/* ===============================
   MODULE: TRIMESTRE V2 (Beta 95)
   Gestion de l'onglet Trimestre restructuré

   Ce module gère la nouvelle interface de l'onglet Trimestre
   avec dropdowns et accordéons, tout en synchronisant avec
   les données existantes (cadreCalendrier, cours, etc.)
   =============================== */

(function() {
'use strict';

/* ===============================
   WRAPPERS NOTIFICATIONS
   (les fonctions originales sont dans evaluation.js / groupe.js,
    pas encore chargées quand ce module s'exécute)
   =============================== */

function afficherNotificationSucces(message, details) {
    if (typeof window.afficherNotificationSucces === 'function') {
        window.afficherNotificationSucces(message, details);
    } else {
        console.log('[Trimestre V2] Succès :', message, details || '');
    }
}

function afficherNotificationErreur(message, details) {
    if (typeof window.afficherNotificationErreur === 'function') {
        window.afficherNotificationErreur(message, details);
    } else {
        console.warn('[Trimestre V2] Erreur :', message, details || '');
    }
}

/* ===============================
   INITIALISATION
   =============================== */

/**
 * Initialise l'onglet Trimestre v2
 * Appelé au chargement de la page
 */
function initialiserTrimestreV2() {
    console.log('[Trimestre V2] Initialisation...');

    // Charger l'identification du trimestre (nom, session, année)
    chargerIdentificationTrimestreV2();

    // Charger le cadre calendrier dans les nouveaux champs
    chargerCadreCalendrierV2();

    // Charger les événements (prévus et imprévus)
    chargerEvenementsPrevusV2();
    chargerEvenementsImprevusV2();

    // Charger la liste des cours dans le dropdown
    chargerDropdownCoursV2();

    // Charger le profil enseignant (Beta 95.2)
    chargerProfilEnseignantV2();

    // Charger les séances dans l'accordéon Horaire
    chargerSeancesV2();

    // Charger les horaires (Beta 95.2)
    chargerHorairesV2();

    // Charger les groupe-cours (Beta 95.2)
    chargerGroupeCoursV2();

    // 🆕 BETA 95.1 : Charger la durée de période sauvegardée
    if (typeof chargerDureePeriodeUI === 'function') {
        chargerDureePeriodeUI();
    }

    // Charger la liste des étudiants dans l'accordéon Groupes
    chargerListeEtudiantsV2();

    // Populer le dropdown trimestre et afficher le formulaire
    populerDropdownTrimestreV2();
    afficherFormulaireTrimestreActif();

    // Restaurer l'état des accordéons (ouvert/fermé) depuis localStorage
    if (typeof restaurerEtatAccordeons === 'function') {
        restaurerEtatAccordeons();
    }

    // Mettre à jour le guide groupe-cours (indicateurs d'état)
    mettreAJourGuideGroupeCours();

    console.log('[Trimestre V2] Initialisation terminée');
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
        console.log('[Trimestre V2] Identification incomplète, sauvegarde ignorée');
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

        // Mettre à jour window.trimestreActif
        window.trimestreActif = id;

        // Si l'ID a changé, il faudrait migrer les données (complexe, pour l'instant on log)
        if (ancienId !== id) {
            console.log(`[Trimestre V2] ID changé de ${ancienId} à ${id} - migration manuelle requise`);
        }

        console.log(`[Trimestre V2] Trimestre mis à jour: ${nomTrimestre} (${id})`);
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

        console.log(`[Trimestre V2] Nouveau trimestre créé: ${nomTrimestre} (${id})`);
    }

    // Rafraîchir la liste dans Gestion des trimestres si la fonction existe
    if (typeof afficherListeTrimestreGestion === 'function') {
        afficherListeTrimestreGestion();
    }

    // Rafraîchir le dropdown trimestre
    if (typeof populerDropdownTrimestreV2 === 'function') {
        populerDropdownTrimestreV2();
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
            console.log('[Trimestre V2] Calendrier généré/régénéré (bornes mises à jour)');
        }
    }

    // Mettre à jour les statistiques après un court délai
    setTimeout(() => {
        afficherStatistiquesTrimestreV2();
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

    // Validation
    if (!cadre.dateDebut || !cadre.finCours || !cadre.finTrimestre) {
        alert('Veuillez renseigner au minimum : début du trimestre, fin des cours et fin du trimestre');
        return;
    }

    db.setSync(cle('cadreCalendrier'), cadre);

    // Régénérer le calendrier complet
    if (typeof genererCalendrierComplet === 'function') {
        genererCalendrierComplet();
        console.log('[Trimestre V2] Calendrier régénéré');
    } else {
        console.warn('[Trimestre V2] Fonction genererCalendrierComplet non disponible');
    }

    // Mettre à jour les statistiques après un délai pour laisser le temps à la synchronisation
    setTimeout(() => {
        afficherStatistiquesTrimestreV2();
    }, 300);

    // Notification
    if (typeof afficherNotification === 'function') {
        afficherNotification('Cadre du trimestre sauvegardé');
    }
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
    if (typeof afficherNotification === 'function') {
        afficherNotification('Bornes du trimestre réinitialisées');
    }
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
    if (typeof afficherNotification === 'function') {
        afficherNotification('Semaines spéciales réinitialisées');
    }
}

/**
 * Affiche les statistiques du trimestre dans les spans v2-
 */
function afficherStatistiquesTrimestreV2() {
    // Lire depuis db avec clé namespacée
    let calendrier = null;
    try {
        calendrier = db.getSync(cle('calendrierComplet'), null);
    } catch (e) {
        console.error('[Trimestre V2] Erreur lecture calendrier:', e);
    }

    // Éléments originaux (masqués pour compatibilité)
    const elemSemaines = document.getElementById('v2-nombreSemaines');
    const elemJours = document.getElementById('v2-nombreJoursCours');
    const elemCongesReprises = document.getElementById('v2-statsCongesReprises');

    // Éléments sidebar (Beta 95.2)
    const elemSemainesSidebar = document.getElementById('v2-nombreSemainesSidebar');
    const elemJoursSidebar = document.getElementById('v2-nombreJoursCoursSidebar');
    const elemCongesReprisesSidebar = document.getElementById('v2-statsCongesReprisesSidebar');

    console.log('[Trimestre V2] Calendrier lu:', calendrier ? Object.keys(calendrier).length + ' jours' : 'null');

    // Vérifier si le calendrier existe ET a des données
    if (!calendrier || typeof calendrier !== 'object' || Object.keys(calendrier).length === 0) {
        console.log('[Trimestre V2] Calendrier non disponible ou vide');
        if (elemSemaines) elemSemaines.textContent = '0';
        if (elemJours) elemJours.textContent = '0';
        if (elemCongesReprises) elemCongesReprises.textContent = '';
        if (elemSemainesSidebar) elemSemainesSidebar.textContent = '0';
        if (elemJoursSidebar) elemJoursSidebar.textContent = '0';
        if (elemCongesReprisesSidebar) elemCongesReprisesSidebar.textContent = '';
        return;
    }

    // Compter les jours de cours, congés, reprises et trouver le max de numeroSemaine
    let joursCours = 0;
    let conges = 0;
    let reprises = 0;
    let maxSemaine = 0;

    Object.values(calendrier).forEach(jour => {
        if (jour.statut === 'cours') {
            joursCours++;
            if (jour.numeroSemaine && jour.numeroSemaine > maxSemaine) {
                maxSemaine = jour.numeroSemaine;
            }
        }
        if (jour.statut === 'reprise') {
            joursCours++;  // Les reprises comptent comme jours de cours
            reprises++;
            if (jour.numeroSemaine && jour.numeroSemaine > maxSemaine) {
                maxSemaine = jour.numeroSemaine;
            }
        }
        if (jour.statut === 'conge') conges++;
    });

    // Utiliser le numeroSemaine du calendrier (plus précis que diviser par 5)
    // Fallback sur division par 5 si pas de numeroSemaine
    const semaines = maxSemaine > 0 ? maxSemaine : Math.ceil(joursCours / 5);

    console.log(`[Trimestre V2] Stats: ${semaines} semaines, ${joursCours} jours, ${conges} congés, ${reprises} reprises`);

    // Remplir éléments originaux (masqués)
    if (elemSemaines) elemSemaines.textContent = semaines;
    if (elemJours) elemJours.textContent = joursCours;

    // Remplir éléments sidebar (Beta 95.2)
    if (elemSemainesSidebar) elemSemainesSidebar.textContent = semaines;
    if (elemJoursSidebar) elemJoursSidebar.textContent = joursCours;

    // Générer le texte contextuel pour congés/reprises
    let texte = '';
    if (conges === 0 && reprises === 0) {
        texte = '(aucun congé)';
    } else if (reprises > 0 && conges > 0) {
        // Ex: "(incluant 2 reprises pour 2 congés)"
        const congeText = conges === 1 ? 'congé' : 'congés';
        const repriseText = reprises === 1 ? 'reprise' : 'reprises';
        texte = `(incluant ${reprises} ${repriseText} pour ${conges} ${congeText})`;
    } else if (conges > 0 && reprises === 0) {
        texte = `(${conges} congé${conges > 1 ? 's' : ''} non repris)`;
    } else if (reprises > 0 && conges === 0) {
        texte = `(${reprises} reprise${reprises > 1 ? 's' : ''})`;
    }

    if (elemCongesReprises) elemCongesReprises.textContent = texte;
    if (elemCongesReprisesSidebar) elemCongesReprisesSidebar.textContent = texte;
}

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

    return `
    <div class="item-carte-compact" style="margin-bottom: 12px; padding: 12px 15px; background: var(--bleu-tres-pale); border-radius: 8px; border-left: 4px solid var(--accent-primaire);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 15px;">
            <div style="flex: 1; min-width: 0;">
                <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
                    <strong style="font-size: 1rem;">${evt.description}</strong>
                    <span style="color: var(--accent-primaire); font-weight: 500;">${evt.dateEvenement}</span>
                </div>
                ${repriseInfo}
            </div>
            <div style="display: flex; gap: 8px; flex-shrink: 0;">
                <button onclick="modifierEvenementV2('${evt.id}', '${type}')" class="btn btn-secondaire btn-sm" style="padding: 6px 12px; font-size: 0.85rem;">Modifier</button>
                <button onclick="supprimerEvenementV2('${evt.id}', '${type}')" class="btn btn-supprimer btn-sm" style="padding: 6px 12px; font-size: 0.85rem;">Suppr.</button>
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
            setValue('v2-horaireReprisePrevu', '');
            setValue('v2-dateReprisePrevu', '');

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
            setValue('v2-horaireRepriseImprevu', '');
            setValue('v2-dateRepriseImprevu', '');

            if (titre) titre.textContent = 'Nouvel événement imprévu';
            if (btn) btn.textContent = 'Ajouter';

            form.classList.remove('u-hide');
            // Ne pas faire défiler la page
        }
    }
}

/**
 * Ajoute un bouton pour revenir à la vue v2
 */
function ajouterBoutonRetourV2(sectionLegacy) {
    // Vérifier si le bouton existe déjà
    if (document.getElementById('btnRetourV2')) return;

    const btnRetour = document.createElement('div');
    btnRetour.id = 'btnRetourV2';
    btnRetour.style.cssText = 'position: sticky; top: 60px; z-index: 100; background: var(--orange-accent); color: white; padding: 10px 20px; border-radius: 8px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center;';
    btnRetour.innerHTML = `
        <span>Mode édition (ancienne interface)</span>
        <button class="btn" style="background: var(--surface-conteneur, #162c36); color: var(--orange-accent); padding: 5px 15px;" onclick="retournerVueV2()">
            ← Retour à la nouvelle interface
        </button>
    `;
    sectionLegacy.insertBefore(btnRetour, sectionLegacy.firstChild);
}

/**
 * Retourne à la vue v2
 */
function retournerVueV2() {
    const sectionLegacy = document.getElementById('reglages-trimestre-legacy');
    const sectionV2 = document.getElementById('reglages-trimestre');
    const btnRetour = document.getElementById('btnRetourV2');

    if (sectionLegacy) {
        sectionLegacy.classList.add('legacy-hidden');
        sectionLegacy.style.display = '';
    }
    if (sectionV2) {
        sectionV2.style.display = '';
        sectionV2.scrollIntoView({ behavior: 'smooth' });
    }
    if (btnRetour) {
        btnRetour.remove();
    }

    // Recharger les données dans la vue v2
    chargerEvenementsPrevusV2();
    chargerEvenementsImprevusV2();
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
            setValue('v2-horaireReprisePrevu', evt.horaireReprise || '');
            setValue('v2-dateReprisePrevu', evt.dateReprise || '');

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
            setValue('v2-horaireRepriseImprevu', evt.horaireReprise || '');
            setValue('v2-dateRepriseImprevu', evt.dateReprise || '');

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
    const horaireReprise = document.getElementById('v2-horaireReprisePrevu')?.value;
    const dateReprise = document.getElementById('v2-dateReprisePrevu')?.value;

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
                horaireReprise: horaireReprise || '',
                dateReprise: dateReprise || ''
            };
        }
    } else {
        // Mode ajout
        evenements.push({
            id: genererIdUnique('EVT_'),
            dateEvenement,
            description,
            horaireReprise: horaireReprise || '',
            dateReprise: dateReprise || ''
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
    afficherStatistiquesTrimestreV2();

    if (typeof afficherNotification === 'function') {
        afficherNotification(evenementPrevuEnEditionV2 ? 'Événement modifié' : 'Événement ajouté');
    }
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
    const horaireReprise = document.getElementById('v2-horaireRepriseImprevu')?.value;
    const dateReprise = document.getElementById('v2-dateRepriseImprevu')?.value;

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
                horaireReprise: horaireReprise || '',
                dateReprise: dateReprise || ''
            };
        }
    } else {
        // Mode ajout
        evenements.push({
            id: genererIdUnique('EVT_'),
            dateEvenement,
            description,
            horaireReprise: horaireReprise || '',
            dateReprise: dateReprise || ''
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
    afficherStatistiquesTrimestreV2();

    if (typeof afficherNotification === 'function') {
        afficherNotification(evenementImprevuEnEditionV2 ? 'Événement modifié' : 'Événement ajouté');
    }
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
    afficherStatistiquesTrimestreV2();

    if (typeof afficherNotification === 'function') {
        afficherNotification('Événement supprimé');
    }
}

/* ===============================
   DROPDOWN TRIMESTRE
   =============================== */

/**
 * Popule le dropdown de sélection du trimestre depuis le registre
 */
function populerDropdownTrimestreV2() {
    const select = document.getElementById('selectTrimestreActif');
    if (!select) return;

    // Lire le registre des trimestres (de trimestres.js)
    let trimestres = typeof obtenirTrimestres === 'function' ? obtenirTrimestres() : [];
    const trimestreActif = typeof obtenirTrimestreActif === 'function' ? obtenirTrimestreActif() : null;

    // 🆕 FIX (23 jan 2026): En mode Normal, masquer le trimestre Démonstration
    const modeActuel = typeof window.modeActuel !== 'undefined' ? window.modeActuel : 'normal';
    if (modeActuel === 'normal') {
        trimestres = trimestres.filter(t => t.id !== 'demo');
    }

    console.log('🔄 [Dropdown Trim] Mode:', modeActuel, '- Trimestre actif:', trimestreActif?.id);

    select.innerHTML = '';

    if (trimestres.length === 0) {
        // Aucun trimestre dans le registre - afficher un placeholder
        select.innerHTML = '<option value="">Aucun trimestre configuré</option>';
        return;
    }

    // Ajouter chaque trimestre du registre
    trimestres.forEach(t => {
        const option = document.createElement('option');
        option.value = t.id;
        option.textContent = t.nom;
        option.selected = (trimestreActif && t.id === trimestreActif.id);
        select.appendChild(option);
    });

    // 🆕 FIX (23 jan 2026): Forcer la valeur du select au trimestre actif
    if (trimestreActif) {
        select.value = trimestreActif.id;
    }

    console.log('[Trimestre V2] Dropdown peuplé avec', trimestres.length, 'trimestre(s)');

    // Mettre à jour aussi la liste de gestion des trimestres
    afficherListeTrimestreGestion();
}

/**
 * Affiche la liste des trimestres avec boutons de gestion (archiver, exporter, etc.)
 */
function afficherListeTrimestreGestion() {
    const container = document.getElementById('listeTrimestreGestion');
    if (!container) return;

    const trimestres = typeof obtenirTrimestres === 'function' ? obtenirTrimestres() : [];
    const trimestreActif = typeof obtenirTrimestreActif === 'function' ? obtenirTrimestreActif() : null;

    if (trimestres.length === 0) {
        container.innerHTML = '<p class="texte-muted">Aucun trimestre configuré.</p>';
        return;
    }

    container.innerHTML = trimestres.map(t => {
        const estActif = trimestreActif && t.id === trimestreActif.id;
        const estArchive = t.archive === true;

        // Classes CSS pour l'item
        const itemClasses = ['item-trimestre'];
        if (estActif) itemClasses.push('actif');
        if (estArchive) itemClasses.push('archive');

        // Badge d'état
        let badge = '';
        if (estActif) {
            badge = '<span class="badge-trimestre actif">Actif</span>';
        } else if (estArchive) {
            badge = '<span class="badge-trimestre archive">Archivé</span>';
        }

        // Statistiques si archivé
        let statsInfo = '';
        if (estArchive && t.statistiquesFinales) {
            const stats = t.statistiquesFinales;
            statsInfo = `<div class="item-trimestre-stats">
                ${stats.nbEtudiants || 0} étudiant(s) • Engagement moyen: ${stats.moyenneEngagement || 0}%
                ${t.dateFin ? ` • Archivé le ${t.dateFin}` : ''}
            </div>`;
        }

        // Boutons d'action
        let boutons = '';
        if (estActif) {
            // Le trimestre actif ne peut pas être archivé
            boutons = `<button class="btn btn-secondaire btn-compact" onclick="exporterTrimestreArchive('${t.id}')" title="Exporter les données">
                Exporter
            </button>`;
        } else if (estArchive) {
            // Trimestre archivé : exporter ou désarchiver
            boutons = `
                <button class="btn btn-secondaire btn-compact" onclick="exporterTrimestreArchive('${t.id}')" title="Exporter les données">
                    Exporter
                </button>
                <button class="btn btn-secondaire btn-compact" onclick="confirmerDesarchivage('${t.id}')" title="Désarchiver pour permettre les modifications">
                    Désarchiver
                </button>`;
        } else {
            // Trimestre inactif : peut être archivé ou activé
            boutons = `
                <button class="btn btn-principal btn-compact" onclick="changerTrimestreActifV2('${t.id}')" title="Activer ce trimestre">
                    Activer
                </button>
                <button class="btn btn-secondaire btn-compact" onclick="confirmerArchivage('${t.id}')" title="Archiver ce trimestre (lecture seule)">
                    Archiver
                </button>
                <button class="btn btn-secondaire btn-compact" onclick="exporterTrimestreArchive('${t.id}')" title="Exporter les données">
                    Exporter
                </button>`;
        }

        return `
            <div class="${itemClasses.join(' ')}">
                <div class="item-trimestre-info">
                    <span class="item-trimestre-nom">${t.nom}</span>${badge}
                    ${statsInfo}
                </div>
                <div class="item-trimestre-actions">
                    ${boutons}
                </div>
            </div>`;
    }).join('');

    // Mettre à jour l'info du trimestre ciblé pour l'export
    if (typeof afficherTrimestreCibleExport === 'function') {
        afficherTrimestreCibleExport();
    }
}

/**
 * Confirme et archive un trimestre
 */
function confirmerArchivage(id) {
    const trimestres = typeof obtenirTrimestres === 'function' ? obtenirTrimestres() : [];
    const trimestre = trimestres.find(t => t.id === id);

    if (!trimestre) {
        alert('Trimestre non trouvé');
        return;
    }

    const confirme = confirm(
        `Archiver le trimestre "${trimestre.nom}" ?\n\n` +
        `Un trimestre archivé passe en lecture seule et ne peut plus être modifié.\n` +
        `Un export automatique sera généré.\n\n` +
        `Cette action est réversible via le bouton "Désarchiver".`
    );

    if (confirme) {
        const result = archiverTrimestre(id);
        if (result.success) {
            alert(`Trimestre "${trimestre.nom}" archivé avec succès.\n\nUn fichier d'export a été téléchargé.`);
            afficherListeTrimestreGestion();
        } else {
            alert(`Erreur: ${result.error}`);
        }
    }
}

/**
 * Confirme et désarchive un trimestre
 */
function confirmerDesarchivage(id) {
    const trimestres = typeof obtenirTrimestres === 'function' ? obtenirTrimestres() : [];
    const trimestre = trimestres.find(t => t.id === id);

    if (!trimestre) {
        alert('Trimestre non trouvé');
        return;
    }

    const confirme = confirm(
        `Désarchiver le trimestre "${trimestre.nom}" ?\n\n` +
        `Cela permettra de modifier à nouveau les données de ce trimestre.`
    );

    if (confirme) {
        const result = desarchiverTrimestre(id);
        if (result.success) {
            alert(`Trimestre "${trimestre.nom}" désarchivé.`);
            afficherListeTrimestreGestion();
        } else {
            alert(`Erreur: ${result.error}`);
        }
    }
}

/* ===============================
   GESTION DES TRIMESTRES - NOUVEAU LAYOUT (Beta 95.2)
   Pattern : Bibliothèque + Formulaire
   =============================== */

/**
 * Rafraîchit l'affichage du formulaire trimestre actif
 * Le formulaire utilise les mêmes champs que l'ancien "Cadre régulier"
 * donc les fonctions existantes (chargerIdentificationTrimestreV2, etc.) s'appliquent
 * 🆕 BETA 95.2
 */
function afficherFormulaireTrimestreActif() {
    // Les champs du formulaire sont déjà remplis par les fonctions existantes :
    // - chargerIdentificationTrimestreV2()
    // - chargerCadreCalendrierV2()
    // - chargerEvenementsPrevusV2()
    // - chargerEvenementsImprevusV2()
    // - afficherStatistiquesTrimestreV2()

    // Cette fonction est appelée pour s'assurer que tout est à jour
    console.log('[Trimestre V2] Formulaire trimestre actif rafraîchi');
}

/**
 * Ouvre la bibliothèque des trimestres (modal ou panel)
 * 🆕 BETA 95.2
 */
function ouvrirBibliothequeTrimestreV2() {
    // Pour l'instant, afficher une alerte informative
    // À terme : ouvrir un modal avec la liste complète des trimestres
    const trimestres = typeof obtenirTrimestres === 'function' ? obtenirTrimestres() : [];

    if (trimestres.length === 0) {
        alert('Aucun trimestre dans la bibliothèque.\n\nCliquez sur "+ Nouveau trimestre" pour en créer un.');
        return;
    }

    // Liste simple pour l'instant
    let message = 'Trimestres disponibles :\n\n';
    trimestres.forEach(t => {
        const etat = t.archive ? '📦 Archivé' : (t.actif ? '✅ Actif' : '');
        message += `• ${t.nom} ${etat}\n`;
    });
    message += '\nUtilisez le dropdown "Trimestre actif" pour changer de trimestre.';

    alert(message);
}

/**
 * Archive le trimestre actuellement actif
 * 🆕 BETA 95.2
 */
function archiverTrimestreActif() {
    const trimestreActif = typeof obtenirTrimestreActif === 'function' ? obtenirTrimestreActif() : null;

    if (!trimestreActif) {
        alert('Aucun trimestre actif à archiver.');
        return;
    }

    confirmerArchivage(trimestreActif.id);
}

/**
 * Supprime le trimestre actuellement actif (non implémenté)
 * 🆕 BETA 95.2
 */
function supprimerTrimestreActif() {
    alert('La suppression de trimestre n\'est pas encore disponible.\n\nUtilisez l\'archivage pour conserver les données en lecture seule.');
}

/**
 * Change le trimestre actif et recharge l'interface
 * Délègue à la fonction de trimestres.js
 */
function changerTrimestreActifV2(valeur) {
    console.log('🔄 [Trimestre V2] Changement trimestre demandé:', valeur);

    // Appeler la fonction de trimestres.js
    if (typeof window.changerTrimestreActif === 'function') {
        const success = window.changerTrimestreActif(valeur);
        console.log('🔄 [Trimestre V2] Résultat changerTrimestreActif:', success);
        console.log('🔄 [Trimestre V2] window.trimestreActif après changement:', window.trimestreActif);

        if (success) {
            // Recharger l'interface complète
            chargerIdentificationTrimestreV2();  // 🆕 FIX: Recharger nom, session, année
            chargerCadreCalendrierV2();
            chargerEvenementsPrevusV2();
            chargerEvenementsImprevusV2();
            afficherStatistiquesTrimestreV2();

            // Rafraîchir le dropdown trimestre et le formulaire
            populerDropdownTrimestreV2();
            afficherFormulaireTrimestreActif();

            // Rafraîchir le dropdown des cours (filtré par trimestre)
            chargerDropdownCoursV2();

            // 🆕 BETA 95.2 : Rafraîchir le dropdown groupe-cours actif
            if (typeof peuplerDropdownGroupeCoursActif === 'function') {
                peuplerDropdownGroupeCoursActif();
            }

            // 🆕 BETA 95 FIX : Rafraîchir toutes les vues après changement de cours
            // (la liste d'étudiants, le tableau de bord, etc.)
            if (typeof rafraichirVuesApresCours === 'function') {
                rafraichirVuesApresCours();
                console.log('[Trimestre V2] Vues rafraîchies après changement de cours');
            }

            // Mettre à jour le bandeau d'archivage si applicable
            if (typeof mettreAJourBandeauArchive === 'function') {
                mettreAJourBandeauArchive();
            }

            console.log('[Trimestre V2] Interface rafraîchie après changement');
        }
    } else {
        console.error('[Trimestre V2] Fonction changerTrimestreActif non disponible');
    }
}

/**
 * Ouvre la modal pour créer un nouveau trimestre
 */
function ouvrirModalNouveauTrimestre() {
    // Demander la session
    const sessionChoix = prompt(
        'Créer un nouveau trimestre\n\n' +
        'Quelle session ?\n' +
        '  A = Automne\n' +
        '  H = Hiver\n\n' +
        'Entre A ou H :'
    );

    if (!sessionChoix) return; // Annulé

    const session = sessionChoix.trim().toUpperCase();
    if (session !== 'A' && session !== 'H') {
        alert('Session invalide. Veuillez entrer A (Automne) ou H (Hiver).');
        return;
    }

    // Demander l'année
    const anneeActuelle = new Date().getFullYear();
    const anneeChoix = prompt(
        `Quelle année ?\n\n` +
        `Exemples : ${anneeActuelle}, ${anneeActuelle + 1}\n\n` +
        `Entre l'année (4 chiffres) :`
    );

    if (!anneeChoix) return; // Annulé

    const annee = anneeChoix.trim();
    if (!/^\d{4}$/.test(annee)) {
        alert('Année invalide. Veuillez entrer 4 chiffres (ex: 2026).');
        return;
    }

    // Vérifier si ce trimestre existe déjà
    const trimestres = typeof obtenirTrimestres === 'function' ? obtenirTrimestres() : [];
    const id = `${session.toLowerCase()}${annee}`;
    if (trimestres.find(t => t.id === id)) {
        alert(`Le trimestre ${session === 'H' ? 'Hiver' : 'Automne'} ${annee} existe déjà.`);
        return;
    }

    // Demander si on veut l'activer
    const activer = confirm(
        `Créer le trimestre ${session === 'H' ? 'Hiver' : 'Automne'} ${annee} ?\n\n` +
        `Veux-tu l'activer immédiatement ?\n` +
        `(Le trimestre actuel sera désactivé)`
    );

    // Créer le trimestre
    const result = creerTrimestre(session, annee, activer);

    if (result) {
        alert(`Trimestre "${result.nom}" créé avec succès !`);

        // Rafraîchir l'interface
        populerDropdownTrimestreV2();

        if (activer) {
            // Recharger les données du nouveau trimestre
            chargerCadreCalendrierV2();
            chargerEvenementsPrevusV2();
            chargerEvenementsImprevusV2();
            afficherStatistiquesTrimestreV2();
        }
    } else {
        alert('Erreur lors de la création du trimestre.');
    }
}

/* ===============================
   ACCORDÉON COURS
   =============================== */

/**
 * Charge la liste des cours dans le dropdown
 * Filtre par trimestre actif (Beta 95)
 */
function chargerDropdownCoursV2() {
    const select = document.getElementById('v2-selectCours');
    if (!select) return;

    // Récupérer les cours depuis le stockage
    // Migration one-shot : fusionner listeCours → cours (clé canonique)
    const anciensListeCours = db.getSync('listeCours', []);
    if (anciensListeCours.length > 0) {
        const coursExistants = db.getSync('cours', []);
        const coursMap = new Map(coursExistants.map(c => [c.id, c]));
        anciensListeCours.forEach(c => { if (c.id && !coursMap.has(c.id)) coursMap.set(c.id, c); });
        db.setSync('cours', Array.from(coursMap.values()));
        db.setSync('listeCours', []);
        console.log('[Trimestre V2] Migration listeCours → cours effectuée');
    }
    const tousCours = db.getSync('cours', []);
    const coursActif = db.getSync('infoCours', null);

    console.log('[Trimestre V2] Chargement dropdown cours...');
    console.log('[Trimestre V2] cours:', tousCours.length, 'cours');
    console.log('[Trimestre V2] infoCours:', coursActif);

    // Obtenir le trimestre actif
    const trimestreActifId = typeof obtenirTrimestreId === 'function' ? obtenirTrimestreId() : '';

    // Helper: dériver trimestreId depuis session+annee
    const deriverTrimestreId = (cours) => {
        if (!cours) return null;
        if (cours.trimestreId) return cours.trimestreId;
        if (cours.session && cours.annee) {
            // Gère les cas où session est "H" ou "A" (1 lettre)
            const s = cours.session.length === 1 ? cours.session.toLowerCase() : cours.session.charAt(0).toLowerCase();
            return s + cours.annee;
        }
        // Essayer de parser session combinée (ex: "H2026", "A2025")
        if (cours.session && /^[AH]\d{4}$/i.test(cours.session)) {
            return cours.session.toLowerCase();
        }
        return null;
    };

    // Helper: obtenir le texte d'affichage d'un cours
    // 🆕 BETA 95.2 : Le groupe ne fait plus partie du cours (entité indépendante)
    // 🆕 FIX (4 fév 2026) : Ajouter c.code pour compatibilité Primo
    const obtenirTexteCours = (c) => {
        const sigle = c.codeCours || c.sigle || c.code || c.numero || '';
        const titre = c.nomCours || c.titre || c.nom || '';
        const texte = `${sigle} ${titre}`.trim();
        return texte || `Cours ${c.id || 'sans identifiant'}`;
    };

    // Filtrer les cours par trimestre actif
    // Critères d'inclusion:
    // 1. trimestreId correspond exactement
    // 2. trimestreId dérivé (session+annee) correspond
    // 3. Pas de trimestreId ni session/annee (rétrocompatibilité)
    const coursFiltres = trimestreActifId
        ? tousCours.filter(c => {
            const trimestreDerive = deriverTrimestreId(c);
            const inclus = trimestreDerive === trimestreActifId || trimestreDerive === null;
            if (!inclus) {
                console.log(`[Trimestre V2] Cours exclu: ${obtenirTexteCours(c)} (trimestre: ${trimestreDerive})`);
            }
            return inclus;
        })
        : tousCours;

    console.log(`[Trimestre V2] Dropdown cours: ${coursFiltres.length}/${tousCours.length} cours pour trimestre ${trimestreActifId || '(aucun)'}`);

    select.innerHTML = '<option value="">Sélectionner un cours...</option>';

    // Déterminer le cours à sélectionner
    let coursAfficher = [...coursFiltres];
    let coursASelectionner = null;

    // Vérifier si infoCours correspond au trimestre actif
    const trimestreInfoCours = coursActif ? deriverTrimestreId(coursActif) : null;
    const infoCoursDansTrimestre = !trimestreActifId || trimestreInfoCours === trimestreActifId || trimestreInfoCours === null;

    if (coursActif && infoCoursDansTrimestre) {
        // infoCours est dans le bon trimestre
        if (!coursAfficher.find(c => c.id === coursActif.id)) {
            // Pas dans la liste, l'ajouter
            coursAfficher.unshift(coursActif);
            console.log('[Trimestre V2] Cours actif (infoCours) ajouté:', obtenirTexteCours(coursActif));
        }
        coursASelectionner = coursActif;
    } else if (coursFiltres.length > 0) {
        // infoCours n'est pas dans le bon trimestre, utiliser le premier cours filtré
        coursASelectionner = coursFiltres[0];
        console.log('[Trimestre V2] infoCours hors trimestre, sélection:', obtenirTexteCours(coursASelectionner));

        // Mettre à jour infoCours avec le bon cours
        db.setSync('infoCours', coursASelectionner);
        console.log('[Trimestre V2] infoCours mis à jour avec le cours du trimestre actif');
    }

    if (coursAfficher.length === 0) {
        // Aucun cours disponible pour ce trimestre
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'Aucun cours pour ce trimestre';
        option.disabled = true;
        select.appendChild(option);

        // IMPORTANT: Réinitialiser infoCours pour éviter d'afficher des données d'un autre trimestre
        db.setSync('infoCours', null);
        console.log('[Trimestre V2] infoCours réinitialisé (aucun cours pour ce trimestre)');

        // Vider l'affichage des détails du cours
        viderAffichageCoursV2();

        // Cacher les boutons Modifier et Dupliquer
        const btnModifier = document.getElementById('v2-btnModifierCours');
        const btnDupliquer = document.getElementById('v2-btnDupliquerCours');
        if (btnModifier) btnModifier.classList.add('u-hide');
        if (btnDupliquer) btnDupliquer.classList.add('u-hide');
    } else {
        let coursSelectionne = false;

        coursAfficher.forEach((c, index) => {
            const option = document.createElement('option');
            option.value = c.id || `cours-${index}`;
            option.textContent = obtenirTexteCours(c);

            // Sélectionner le cours déterminé (coursASelectionner)
            if (coursASelectionner && c.id === coursASelectionner.id) {
                option.selected = true;
                coursSelectionne = true;
            }
            select.appendChild(option);
        });

        // Si aucun cours sélectionné mais qu'il y en a, sélectionner le premier
        if (!coursSelectionne && coursAfficher.length > 0) {
            select.options[1].selected = true;
            coursASelectionner = coursAfficher[0];
            coursSelectionne = true;
        }

        // Afficher le formulaire avec le cours sélectionné (Beta 95.2)
        if (coursSelectionne && coursASelectionner) {
            changerCoursSelectionneV2(coursASelectionner.id);
        }

        // Afficher les boutons Modifier et Dupliquer si un cours est sélectionné
        const btnModifier = document.getElementById('v2-btnModifierCours');
        const btnDupliquer = document.getElementById('v2-btnDupliquerCours');
        toggleDisplay(btnModifier, coursSelectionne);
        toggleDisplay(btnDupliquer, coursSelectionne);
    }
}

/**
 * Change le cours sélectionné
 */
function changerCoursSelectionneV2(coursId) {
    const etatVide = document.getElementById('cours-etat-vide');
    const formulaire = document.getElementById('cours-formulaire-edition');
    const listeGroupes = document.getElementById('v2-listeGroupes');
    const btnSupprimer = document.getElementById('v2-btnSupprimerCours');

    if (!coursId) {
        // Afficher l'état vide
        if (etatVide) etatVide.classList.remove('u-hide');
        if (formulaire) formulaire.classList.add('u-hide');
        if (listeGroupes) listeGroupes.innerHTML = '<p class="text-muted">Sélectionne un cours pour voir ses groupes.</p>';
        if (btnSupprimer) btnSupprimer.classList.add('u-hide');
        afficherSyntheseCours(null);  // Beta 95.3 : vider la synthèse
        coursEnEditionV2 = null;
        return;
    }

    // Charger les détails du cours
    const cours = db.getSync('cours', []);
    let coursSelectionne = cours.find(c => c.id === coursId);

    if (coursSelectionne) {
        // Afficher le formulaire en mode édition
        coursEnEditionV2 = coursId;
        if (etatVide) etatVide.classList.add('u-hide');
        if (formulaire) formulaire.classList.remove('u-hide');
        if (btnSupprimer) btnSupprimer.classList.remove('u-hide');

        // Mettre à jour le titre
        const titre = document.getElementById('v2-titreFormCours');
        const btnTexte = document.getElementById('v2-btnTexteCours');
        if (titre) titre.textContent = 'Modifier le cours';
        if (btnTexte) btnTexte.textContent = 'Enregistrer';

        // Remplir le formulaire
        remplirFormCoursV2(coursSelectionne);
        afficherSyntheseCours(coursSelectionne);  // Beta 95.3 : synthèse sidebar
        chargerGroupesCoursV2(coursId);
    }
}

/**
 * Supprime le cours actuellement sélectionné
 * Beta 95.2 (8 jan 2026)
 */
function supprimerCoursV2() {
    if (!coursEnEditionV2) {
        console.warn('[Trimestre V2] Aucun cours sélectionné pour suppression');
        return;
    }

    // Chercher le cours dans la clé canonique
    let cours = db.getSync('cours', []);
    let coursObj = cours.find(c => c.id === coursEnEditionV2);

    if (!coursObj) {
        console.warn('[Trimestre V2] Cours non trouvé:', coursEnEditionV2);
        return;
    }

    // Confirmation
    // 🆕 FIX (4 fév 2026) : Priorité codeCours
    const nomCours = coursObj.codeCours || coursObj.sigle || coursObj.code || coursObj.id;
    const titreCours = coursObj.nomCours || coursObj.nom || coursObj.titre || '';
    if (!confirm(`Supprimer le cours "${nomCours} - ${titreCours}" ?\n\nCette action est irréversible.`)) {
        return;
    }

    // Supprimer de la liste
    const coursFiltres = cours.filter(c => c.id !== coursEnEditionV2);
    db.setSync('cours', coursFiltres);

    // Nettoyer infoCours si le cours supprimé était le cours actif
    const coursActif = db.getSync('infoCours', null);
    if (coursActif && coursActif.id === coursEnEditionV2) {
        db.setSync('infoCours', null);
    }

    console.log('[Trimestre V2] Cours supprimé:', coursEnEditionV2);

    // Réinitialiser l'interface
    coursEnEditionV2 = null;
    chargerDropdownCoursV2();

    // Masquer le bouton supprimer et afficher l'état vide
    const btnSupprimer = document.getElementById('v2-btnSupprimerCours');
    if (btnSupprimer) btnSupprimer.classList.add('u-hide');

    const etatVide = document.getElementById('cours-etat-vide');
    const formulaire = document.getElementById('cours-formulaire-edition');
    if (etatVide) etatVide.classList.remove('u-hide');
    if (formulaire) formulaire.classList.add('u-hide');

    // Notification
    if (typeof afficherNotificationSucces === 'function') {
        afficherNotificationSucces('Cours supprimé', `${nomCours} - ${titreCours}`);
    }

    // Beta 95.2: Rafraîchir le dropdown Cours dans la section Groupe-cours
    populerDropdownsAssemblageV2();
}

/**
 * Vide l'affichage du cours et du groupe d'étudiants
 * Appelé quand il n'y a aucun cours pour le trimestre actif
 */
function viderAffichageCoursV2() {
    console.log('[Trimestre V2] Vidage de l\'affichage cours et étudiants');

    // Vider l'aperçu du cours
    const apercuCours = document.getElementById('v2-apercuCours');
    if (apercuCours) {
        apercuCours.innerHTML = '<p class="text-muted">Sélectionne un cours pour voir ses détails.</p>';
    }

    // Vider les statistiques du groupe
    const nbEtudiants = document.getElementById('v2-nbEtudiantsTotal');
    if (nbEtudiants) nbEtudiants.textContent = '0';

    const groupeCoursElem = document.getElementById('v2-groupeCours');
    if (groupeCoursElem) groupeCoursElem.textContent = '—';

    // Vider la liste des étudiants
    const listeEtudiants = document.getElementById('v2-listeEtudiants');
    if (listeEtudiants) {
        listeEtudiants.innerHTML = '<p class="text-muted text-italic">Aucun cours sélectionné pour ce trimestre.</p>';
    }

    // Vider la liste des groupes
    const listeGroupes = document.getElementById('v2-listeGroupes');
    if (listeGroupes) {
        listeGroupes.innerHTML = '<p class="text-muted">Aucun cours sélectionné.</p>';
    }

    // Vider l'horaire
    const listeSeances = document.getElementById('v2-listeSeances');
    if (listeSeances) {
        listeSeances.innerHTML = '<p class="text-muted">Aucun cours sélectionné.</p>';
    }
}

/**
 * Affiche les détails d'un cours (aperçu)
 * 🆕 BETA 95.2 : Simplifié - affiche uniquement les informations du cours
 * (Enseignant, Horaire, Session sont dans leurs sections respectives)
 */
function afficherDetailsCoursV2(cours) {
    const conteneur = document.getElementById('v2-apercuCours');
    if (!conteneur) return;

    console.log('[Trimestre V2] Affichage détails cours:', cours);

    // Normaliser le sigle (codeCours, sigle, code ou numero)
    // 🆕 FIX (4 fév 2026) : Priorité codeCours, ajouter code pour Primo
    const sigle = cours.codeCours || cours.sigle || cours.code || cours.numero || '—';

    // Normaliser le nom du cours
    const nomCours = cours.titre || cours.nomCours || '—';

    // Discipline
    const discipline = cours.discipline || '—';

    // Compétence
    const competence = cours.competence || '—';
    const numeroCompetence = cours.numeroCompetence || '';

    // Éléments de compétence (afficher seulement si présents)
    const elementsCompetence = cours.elementsCompetence || '';

    conteneur.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
            <div>
                <label class="text-muted" style="font-size: 0.85rem;">Code du cours</label>
                <div style="font-weight: 600; font-size: 1.1rem; color: var(--accent-primaire);">${sigle}</div>
            </div>
            <div>
                <label class="text-muted" style="font-size: 0.85rem;">Nom du cours</label>
                <div style="font-weight: 600;">${nomCours}</div>
            </div>
            <div>
                <label class="text-muted" style="font-size: 0.85rem;">Discipline</label>
                <div>${discipline}</div>
            </div>
            <div>
                <label class="text-muted" style="font-size: 0.85rem;">Compétence${numeroCompetence ? ` (${numeroCompetence})` : ''}</label>
                <div>${competence}</div>
            </div>
        </div>
        ${elementsCompetence ? `
        <div style="margin-top: 15px;">
            <label class="text-muted" style="font-size: 0.85rem;">Éléments de compétence</label>
            <div style="font-size: 0.9rem; white-space: pre-line;">${elementsCompetence}</div>
        </div>
        ` : ''}
    `;
}

// Variable pour stocker l'ID du cours en édition
let coursEnEditionV2 = null;

/**
 * Affiche le formulaire pour créer un nouveau cours
 */
async function afficherFormCoursV2() {
    await nouveauCoursV2();
}

/**
 * Crée un nouveau cours (affiche le formulaire vide)
 * 🆕 BETA 95.2
 */
async function nouveauCoursV2() {
    coursEnEditionV2 = null;

    const etatVide = document.getElementById('cours-etat-vide');
    const formulaire = document.getElementById('cours-formulaire-edition');
    const titre = document.getElementById('v2-titreFormCours');
    const btnTexte = document.getElementById('v2-btnTexteCours');
    const selectCours = document.getElementById('v2-selectCours');

    // Désélectionner dans le dropdown
    if (selectCours) selectCours.value = '';

    // Afficher le formulaire
    if (etatVide) etatVide.classList.add('u-hide');
    if (formulaire) formulaire.classList.remove('u-hide');
    if (titre) titre.textContent = 'Nouveau cours';
    if (btnTexte) btnTexte.textContent = 'Enregistrer';

    // Réinitialiser tous les champs
    reinitialiserFormCoursV2();

    // Masquer le bouton Supprimer (mode création)
    const btnSupprimer = document.getElementById('v2-btnSupprimerCours');
    if (btnSupprimer) btnSupprimer.classList.add('u-hide');

    console.log('[Trimestre V2] Formulaire nouveau cours affiché');
}

/**
 * Modifie le cours actuellement sélectionné
 */
async function modifierCoursSelectionneV2() {
    const selectCours = document.getElementById('v2-selectCours');
    const coursId = selectCours?.value;

    if (!coursId) {
        alert('Veuillez sélectionner un cours à modifier.');
        return;
    }

    // Trouver le cours
    const cours = db.getSync('cours', []);
    const coursSelectionne = cours.find(c => c.id === coursId) || db.getSync('infoCours', null);

    if (!coursSelectionne) {
        alert('Cours non trouvé.');
        return;
    }

    coursEnEditionV2 = coursId;

    const formulaire = document.getElementById('v2-formulaireCours');
    const apercu = document.getElementById('v2-apercuCours');
    const titre = document.getElementById('v2-titreFormCours');
    const btnTexte = document.getElementById('v2-btnTexteCours');

    if (formulaire) {
        formulaire.classList.remove('u-hide');
        if (apercu) apercu.classList.add('u-hide');
        if (titre) titre.textContent = 'Modifier le cours';
        if (btnTexte) btnTexte.textContent = 'Enregistrer';

        // ✅ AJOUT (2 jan 2026) : Charger le dropdown des pratiques AVANT de remplir
        await chargerDropdownPratiquesCours();

        // Remplir les champs avec les données du cours
        remplirFormCoursV2(coursSelectionne);

        // Afficher le bouton Supprimer (mode édition)
        const btnSupprimer = document.getElementById('v2-btnSupprimerCours');
        if (btnSupprimer) btnSupprimer.style.display = '';

        formulaire.scrollIntoView({ behavior: 'smooth' });
    }
}

/**
 * Duplique le cours actuellement sélectionné
 * Crée une copie avec un nouvel ID et ouvre le formulaire en mode création
 */
function dupliquerCoursSelectionneV2() {
    const selectCours = document.getElementById('v2-selectCours');
    const coursId = selectCours?.value;

    if (!coursId) {
        alert('Veuillez sélectionner un cours à dupliquer.');
        return;
    }

    // Trouver le cours
    const cours = db.getSync('cours', []);
    const coursSelectionne = cours.find(c => c.id === coursId) || db.getSync('infoCours', null);

    if (!coursSelectionne) {
        alert('Cours non trouvé.');
        return;
    }

    // Ouvrir le formulaire en mode création (pas d'édition)
    coursEnEditionV2 = null;

    const formulaire = document.getElementById('v2-formulaireCours');
    const apercu = document.getElementById('v2-apercuCours');
    const titre = document.getElementById('v2-titreFormCours');
    const btnTexte = document.getElementById('v2-btnTexteCours');

    if (formulaire) {
        formulaire.classList.remove('u-hide');
        if (apercu) apercu.classList.add('u-hide');
        if (titre) titre.textContent = 'Dupliquer le cours';
        if (btnTexte) btnTexte.textContent = 'Créer la copie';

        // Remplir les champs avec les données du cours existant
        remplirFormCoursV2(coursSelectionne);

        // Modifier le nom pour indiquer que c'est une copie
        const nomCours = document.getElementById('v2-nomCours');
        if (nomCours && nomCours.value) {
            nomCours.value = nomCours.value + ' (copie)';
        }

        formulaire.scrollIntoView({ behavior: 'smooth' });
    }

    console.log('[Trimestre V2] Duplication du cours:', coursSelectionne.codeCours || coursSelectionne.sigle || coursSelectionne.code);
}

/**
 * Remplit le formulaire avec les données d'un cours
 * Gère différents formats de données (Beta 95)
 */
function remplirFormCoursV2(cours) {
    console.log('[Trimestre V2] Remplissage formulaire avec:', cours);

    // Informations générales du cours
    // 🆕 FIX (4 fév 2026) : Priorité codeCours, ajouter code pour Primo
    setValue('v2-codeCours', cours.codeCours || cours.sigle || cours.code || '');
    setValue('v2-nomCours', cours.titre || cours.nomCours || '');
    setValue('v2-numeroCompetence', cours.numeroCompetence || '');
    setValue('v2-competence', cours.competence || '');
    setValue('v2-disciplineCours', cours.discipline || '');  // Beta 95.2: Discipline du cours
    setValue('v2-elementsCompetence', cours.elementsCompetence || '');

    // Enseignant - gère deux formats:
    // 1. Champs directs: prenomEnseignant, nomEnseignant, courriel, etc.
    // 2. Objet enseignant: enseignant.prenom, enseignant.nom, etc.
    const enseignant = cours.enseignant || {};
    setValue('v2-prenomEnseignant', cours.prenomEnseignant || enseignant.prenom || '');
    setValue('v2-nomEnseignant', cours.nomEnseignant || enseignant.nom || '');
    setValue('v2-courrielEnseignant', cours.courriel || enseignant.courriel || '');
    setValue('v2-disciplineEnseignant', cours.discipline || enseignant.discipline || '');
    setValue('v2-departement', cours.departement || enseignant.departement || '');
    setValue('v2-institutionEnseignant', cours.institution || enseignant.institution || '');

    // Session et horaire
    setValue('v2-session', cours.session || 'H');
    setValue('v2-annee', cours.annee || new Date().getFullYear());
    // ✅ MODIFIÉ (6 jan 2026) : Périodes au lieu d'heures
    const periodes = cours.periodesParSemaine || cours.heuresParSemaine || cours.heuresHebdo || 4;
    setValue('v2-periodesParSemaine', periodes);
    mettreAJourFormatHoraire(); // Générer les options dynamiquement
    setValue('v2-formatHoraire', cours.formatHoraire || '2x2');
    // Groupe géré via le groupe-cours (Beta 95)

    // ✅ AJOUT (2 jan 2026) : Pratique de notation
    setValue('v2-pratiqueIdCours', cours.pratiqueId || 'pan-standards');
}

/**
 * Affiche la synthèse du cours dans la sidebar (Beta 95.3)
 * Synthèse concise: nom, discipline, compétence
 */
function afficherSyntheseCours(cours) {
    const sidebar = document.getElementById('v2-apercuCoursSidebar');
    if (!sidebar) return;

    if (!cours) {
        sidebar.innerHTML = '<p class="etat-vide-resume">Aucun cours sélectionné</p>';
        return;
    }

    // 🆕 FIX (4 fév 2026) : Priorité codeCours
    const code = cours.codeCours || cours.sigle || cours.code || '';
    const nom = cours.nomCours || cours.titre || cours.nom || '';
    const discipline = cours.discipline || '—';
    const competence = cours.numeroCompetence || cours.competence || '—';

    sidebar.innerHTML = `
        <div class="apercu-titre">${nom}</div>
        <div class="apercu-code">${code}</div>
        <div class="apercu-detail">Discipline : ${discipline}</div>
        <div class="apercu-detail">Compétence : ${competence}</div>
    `;
}

/**
 * 🆕 Beta 95.3 : Synthèse Enseignant dans sidebar
 * Affiche : Prénom Nom, Courriel, Institution - Département
 */
function afficherSyntheseEnseignant(enseignant) {
    const elemNom = document.getElementById('enseignant-resume-nom');
    const elemCourriel = document.getElementById('enseignant-resume-courriel');
    const elemInstitution = document.getElementById('enseignant-resume-institution');

    if (!elemNom) return;

    if (!enseignant) {
        if (elemNom) elemNom.textContent = '—';
        if (elemCourriel) elemCourriel.textContent = '';
        if (elemInstitution) elemInstitution.textContent = '';
        return;
    }

    const nom = `${enseignant.prenom || ''} ${enseignant.nom || ''}`.trim() || '—';
    const courriel = enseignant.courriel || '';
    const institution = enseignant.institution || '';
    const departement = enseignant.departement || '';
    const instDept = [institution, departement].filter(Boolean).join(' — ');

    if (elemNom) elemNom.textContent = nom;
    if (elemCourriel) elemCourriel.textContent = courriel;
    if (elemInstitution) elemInstitution.textContent = instDept;
}

/**
 * 🆕 Beta 95.3 : Synthèse Groupe Étudiants dans sidebar
 * Affiche : X étudiants, Y en SA, Top programmes
 */
function afficherSyntheseGroupeEtudiants() {
    const etudiants = obtenirDonneesSelonMode('groupeEtudiants') || [];

    // Mettre à jour les compteurs existants
    const elemTotal = document.getElementById('v2-resumeNbTotal');
    const elemNbTotal = document.getElementById('v2-nbEtudiantsTotal');
    const elemSA = document.getElementById('v2-resumeNbSA');
    const conteneurSA = document.getElementById('v2-resumeSA');
    const elemProgrammes = document.getElementById('v2-topProgrammes');

    const total = etudiants.length;
    const nbSA = etudiants.filter(e => e.sa === true || e.sa === 'oui' || e.sa === 'Oui' || e.SA === true).length;

    // Compter les programmes
    const programmes = {};
    etudiants.forEach(e => {
        const prog = e.programme || e.programmeEtudes || 'Non spécifié';
        programmes[prog] = (programmes[prog] || 0) + 1;
    });
    const topProgrammes = Object.entries(programmes)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

    // Mettre à jour l'affichage
    if (elemTotal) elemTotal.textContent = total;
    if (elemNbTotal) elemNbTotal.textContent = total;

    if (conteneurSA) {
        toggleDisplay(conteneurSA, nbSA > 0);
        if (elemSA) elemSA.textContent = nbSA;
    }

    if (elemProgrammes) {
        if (topProgrammes.length > 0 && total > 0) {
            elemProgrammes.classList.remove('u-hide');
            elemProgrammes.innerHTML = '<strong style="font-size: 0.75rem;">Programmes :</strong><br>' +
                topProgrammes.map(([prog, nb]) => `<span style="font-size: 0.75rem;">${prog} (${nb})</span>`).join('<br>');
        } else {
            elemProgrammes.classList.add('u-hide');
        }
    }
}

/**
 * 🆕 Beta 95.3 : Synthèse Horaire dans sidebar
 * Affiche : X séances/sem, Y heures, Jours
 */
function afficherSyntheseHoraire(horaire) {
    const sidebar = document.getElementById('v2-carteResumeHoraire');
    if (!sidebar) return;

    if (!horaire || !horaire.seances || horaire.seances.length === 0) {
        sidebar.innerHTML = '<p class="etat-vide-resume">Aucun horaire sélectionné</p>';
        return;
    }

    const seances = horaire.seances || [];
    const nbSeances = seances.length;

    // Calculer les heures totales
    let totalMinutes = 0;
    const joursSet = new Set();
    const joursNoms = { 'lundi': 'Lun', 'mardi': 'Mar', 'mercredi': 'Mer', 'jeudi': 'Jeu', 'vendredi': 'Ven', 'samedi': 'Sam' };

    seances.forEach(s => {
        if (s.heureDebut && s.heureFin) {
            const [h1, m1] = s.heureDebut.split(':').map(Number);
            const [h2, m2] = s.heureFin.split(':').map(Number);
            totalMinutes += (h2 * 60 + m2) - (h1 * 60 + m1);
        }
        if (s.jour) {
            joursSet.add(joursNoms[s.jour.toLowerCase()] || s.jour.substring(0, 3));
        }
    });

    const heures = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const heuresStr = minutes > 0 ? `${heures}h${minutes}` : `${heures}h`;
    const joursStr = Array.from(joursSet).join(', ');

    sidebar.innerHTML = `
        <div class="apercu-titre">${horaire.nom || 'Horaire'}</div>
        <div class="apercu-detail">${nbSeances} séance${nbSeances > 1 ? 's' : ''}/sem. • ${heuresStr}</div>
        <div class="apercu-detail">Jours : ${joursStr || '—'}</div>
    `;
}

/**
 * 🆕 Beta 95.3 : Synthèse Groupe-cours dans sidebar
 * Affiche : Code cours - Groupe, Enseignant, Séances/étudiants, Pratique
 */
function afficherSyntheseGroupeCours(gc) {
    const sidebar = document.getElementById('v2-carteResumeGroupeCours');
    if (!sidebar) return;

    if (!gc) {
        sidebar.innerHTML = '<p class="etat-vide-resume">Aucun groupe-cours sélectionné</p>';
        return;
    }

    // Récupérer les entités liées
    const cours = db.getSync('cours', []);
    const enseignants = db.getSync('enseignants', []);
    // 🆕 FIX (1er fév 2026) : Utiliser cle() pour namespacing (horaires est dans CLES_NAMESPACEES)
    const cleHoraires = cle('horaires');
    const horaires = db.getSync(cleHoraires, []);
    const pratiques = db.getSync('pratiquesConfigurables', []);

    const coursInfo = cours.find(c => c.id === gc.coursId);
    const ens = enseignants.find(e => e.id === gc.enseignantId);
    const hor = horaires.find(h => h.id === gc.horaireId);
    const prat = pratiques.find(p => p.id === gc.pratiqueId);

    // Construire le libellé
    const codeCours = coursInfo?.codeCours || coursInfo?.sigle || null;
    const groupe = gc.groupe || gc.groupeNum || '00001';
    const titre = codeCours ? `${codeCours} — Groupe ${groupe}` : `Groupe ${groupe}`;

    const nomEns = ens ? `${ens.prenom || ''} ${ens.nom || ''}`.trim() : '—';
    const nbSeances = hor?.seances?.length || 0;
    const nomPratique = prat?.nom || gc.pratiqueId || '—';

    // Score de complétude
    const elements = [gc.coursId, gc.enseignantId, gc.horaireId, gc.pratiqueId, gc.groupe];
    const complets = elements.filter(Boolean).length;

    sidebar.innerHTML = `
        <div class="apercu-titre">${titre}</div>
        <div class="apercu-detail">${nomEns}</div>
        <div class="apercu-detail">${nbSeances} séance${nbSeances !== 1 ? 's' : ''}/sem.</div>
        <div class="apercu-detail">Pratique : ${nomPratique}</div>
        <div class="apercu-completude" style="font-size: 0.75rem; color: ${complets === 5 ? 'var(--vert-principal)' : 'var(--orange-principal)'}; margin-top: 5px;">
            ${complets}/5 éléments configurés
        </div>
    `;
}

/**
 * Réinitialise le formulaire cours
 * 🆕 FIX (1er fév 2026) : Utilise le trimestre actif pour session et année
 */
function reinitialiserFormCoursV2() {
    const champs = [
        'v2-codeCours', 'v2-nomCours', 'v2-numeroCompetence', 'v2-competence', 'v2-disciplineCours',
        'v2-elementsCompetence', 'v2-prenomEnseignant', 'v2-nomEnseignant', 'v2-courrielEnseignant',
        'v2-disciplineEnseignant', 'v2-departement', 'v2-institutionEnseignant'
    ];
    champs.forEach(id => setValue(id, ''));

    // 🆕 FIX (1er fév 2026) : Session et année depuis le trimestre actif
    // Corrige le bug où un cours pour A2025 était sauvegardé comme H2026
    const trimestreActif = typeof obtenirTrimestreActif === 'function' ? obtenirTrimestreActif() : null;
    let session = 'H';
    let annee = new Date().getFullYear();

    if (trimestreActif) {
        // Extraire session et année depuis l'ID du trimestre (ex: "a2025" → session="A", année=2025)
        const match = trimestreActif.id.match(/^([ah])(\d{4})$/i);
        if (match) {
            session = match[1].toUpperCase();
            annee = parseInt(match[2]);
        } else if (trimestreActif.session && trimestreActif.annee) {
            // Fallback sur les propriétés du trimestre
            session = trimestreActif.session.charAt(0).toUpperCase();
            annee = trimestreActif.annee;
        }
    }

    setValue('v2-session', session);
    setValue('v2-annee', annee);
    // ✅ MODIFIÉ (6 jan 2026) : Périodes au lieu d'heures
    setValue('v2-periodesParSemaine', 4);
    mettreAJourFormatHoraire();
    setValue('v2-formatHoraire', '2x2');
    // ✅ AJOUT (2 jan 2026) : Pratique par défaut
    setValue('v2-pratiqueIdCours', 'pan-standards');
}

/**
 * ✅ AJOUT (2 jan 2026) : Charge le dropdown des pratiques depuis la sidebar
 * Affiche les pratiques de pratiquesConfigurables (celles dans la sidebar)
 */
async function chargerDropdownPratiquesCours() {
    const select = document.getElementById('v2-pratiqueIdCours');
    if (!select) return;

    // Valeur actuelle pour la restaurer après le rechargement
    const valeurActuelle = select.value;

    // Option par défaut
    let html = '<option value="">-- Sélectionner une pratique --</option>';

    // Charger les pratiques depuis pratiquesConfigurables (même source que la sidebar)
    let pratiques = [];
    try {
        pratiques = db.getSync('pratiquesConfigurables', []);
        // Filtrer les pratiques dans la bibliothèque (affichées dans la sidebar)
        pratiques = pratiques.filter(p => p.dansBibliotheque !== false);
    } catch (e) {
        console.warn('[trimestre-v2] Erreur chargement pratiques:', e);
    }

    // Ajouter les pratiques disponibles
    if (pratiques.length > 0) {
        pratiques.forEach(p => {
            const badge = p.pratiques?.[0] || p.type || '';
            const badgeHtml = badge ? `[${badge}] ` : '';
            html += `<option value="${p.id}">${badgeHtml}${p.nom || 'Sans titre'}</option>`;
        });
    } else {
        html += '<option value="" disabled>Aucune pratique configurée</option>';
        html += '<option value="" disabled>→ Ajouter via Construction > Pratiques de notation</option>';
    }

    select.innerHTML = html;

    // Restaurer la valeur précédente si elle existe encore
    if (valeurActuelle) {
        const optionExiste = Array.from(select.options).some(o => o.value === valeurActuelle);
        if (optionExiste) {
            select.value = valeurActuelle;
        }
    }

    console.log('[trimestre-v2] Dropdown pratiques chargé:', pratiques.length, 'pratiques');
}

/**
 * Utilitaire pour définir la valeur d'un champ
 */
function setValue(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value;
}

/**
 * Annule le formulaire et revient à l'aperçu
 */
function annulerFormCoursV2() {
    coursEnEditionV2 = null;

    const etatVide = document.getElementById('cours-etat-vide');
    const formulaire = document.getElementById('cours-formulaire-edition');
    const selectCours = document.getElementById('v2-selectCours');

    // Afficher l'état vide
    if (etatVide) etatVide.classList.remove('u-hide');
    if (formulaire) formulaire.classList.add('u-hide');

    // Désélectionner dans le dropdown
    if (selectCours) selectCours.value = '';

    reinitialiserFormCoursV2();
    console.log('[Trimestre V2] Formulaire cours annulé');
}

/**
 * Sauvegarde le cours (création ou modification)
 */
function sauvegarderCoursV2() {
    // Récupérer les valeurs
    const codeCours = document.getElementById('v2-codeCours')?.value?.trim();
    const nomCours = document.getElementById('v2-nomCours')?.value?.trim();
    const discipline = document.getElementById('v2-disciplineCours')?.value?.trim();

    // Validation
    if (!codeCours) {
        alert('Veuillez renseigner le code du cours.');
        return;
    }
    if (!discipline) {
        alert('Veuillez renseigner la discipline.');
        return;
    }

    const session = document.getElementById('v2-session')?.value || 'H';
    const annee = document.getElementById('v2-annee')?.value || new Date().getFullYear();

    // Récupérer le groupe depuis le cours existant ou utiliser la valeur par défaut
    let groupe = '00001';
    if (coursEnEditionV2) {
        const coursListe = db.getSync('cours', []);
        const coursExistant = coursListe.find(c => c.id === coursEnEditionV2);
        if (coursExistant?.groupe) {
            groupe = String(coursExistant.groupe).padStart(5, '0');
        }
    }

    // Construire l'identifiant groupe-cours (ex: a2025-601-101-MQ-00001)
    const trimestreId = `${session.toLowerCase()}${annee}`;

    const cours = {
        id: coursEnEditionV2 || `${trimestreId}-${codeCours}-${groupe}`,
        sigle: codeCours,
        codeCours: codeCours,
        titre: nomCours,
        nomCours: nomCours,
        numeroCompetence: document.getElementById('v2-numeroCompetence')?.value?.trim() || '',
        competence: document.getElementById('v2-competence')?.value?.trim() || '',
        discipline: discipline,  // Beta 95.2: Discipline du cours (top-level)
        elementsCompetence: document.getElementById('v2-elementsCompetence')?.value?.trim() || '',
        enseignant: {
            prenom: document.getElementById('v2-prenomEnseignant')?.value?.trim() || '',
            nom: document.getElementById('v2-nomEnseignant')?.value?.trim() || '',
            courriel: document.getElementById('v2-courrielEnseignant')?.value?.trim() || '',
            discipline: discipline,
            departement: document.getElementById('v2-departement')?.value?.trim() || '',
            institution: document.getElementById('v2-institutionEnseignant')?.value?.trim() || ''
        },
        session: session,
        annee: annee,
        // ✅ MODIFIÉ (6 jan 2026) : Périodes au lieu d'heures
        periodesParSemaine: parseInt(document.getElementById('v2-periodesParSemaine')?.value) || 4,
        formatHoraire: document.getElementById('v2-formatHoraire')?.value || '2x2',
        groupe: groupe,
        actif: true,
        // ✅ AJOUT (2 jan 2026) : Pratique de notation associée au cours
        pratiqueId: document.getElementById('v2-pratiqueIdCours')?.value || 'pan-standards'
    };

    // Sauvegarder dans la liste des cours (clé canonique 'cours')
    let tousLesCours = db.getSync('cours', []);

    if (coursEnEditionV2) {
        // Modification
        const index = tousLesCours.findIndex(c => c.id === coursEnEditionV2);
        if (index >= 0) {
            tousLesCours[index] = { ...tousLesCours[index], ...cours };
        } else {
            tousLesCours.push(cours);
        }
    } else {
        // Création
        tousLesCours.push(cours);
    }

    db.setSync('cours', tousLesCours);

    // Si c'est le seul cours ou le cours actif, mettre à jour infoCours aussi
    if (tousLesCours.length === 1 || cours.actif) {
        db.setSync('infoCours', cours);
    }

    // Notifier
    if (typeof afficherNotificationSucces === 'function') {
        afficherNotificationSucces(coursEnEditionV2 ? 'Cours modifié avec succès' : 'Cours créé avec succès');
    }

    // Fermer le formulaire et recharger
    annulerFormCoursV2();
    chargerDropdownCoursV2();

    // Sélectionner le cours nouvellement créé/modifié
    const selectCours = document.getElementById('v2-selectCours');
    if (selectCours) {
        selectCours.value = cours.id;
        changerCoursSelectionneV2(cours.id);
    }

    // Beta 95.2: Rafraîchir le dropdown Cours dans la section Groupe-cours
    populerDropdownsAssemblageV2();

    // Mettre à jour le guide groupe-cours
    mettreAJourGuideGroupeCours();
}

/**
 * Ouvre la modal pour créer un nouveau cours
 */
function ouvrirModalNouveauCours() {
    afficherFormCoursV2();
}

/* ===============================
   ACCORDÉON GROUPES / ÉTUDIANTS
   =============================== */

// Variable pour stocker les données en attente d'import
let donneesImportEnAttenteV2 = [];

/**
 * Charge et affiche la liste des étudiants dans l'accordéon v2
 * ✅ CORRECTION (9 jan 2026): Converti en async pour lire depuis IndexedDB (source de vérité)
 */
async function chargerListeEtudiantsV2() {
    const conteneur = document.getElementById('v2-listeEtudiants');
    const nbTotal = document.getElementById('v2-nbEtudiantsTotal');
    const actionsEtudiants = document.getElementById('v2-actionsEtudiants');

    if (!conteneur) return;

    // Utiliser namespace cle() pour lire les données du trimestre actif
    const cleEtudiants = cle('groupeEtudiants');

    // ✅ CORRECTION (9 jan 2026): Lire depuis IndexedDB pour éviter les données obsolètes de localStorage
    const tousLesEtudiants = await db.get(cleEtudiants) || [];

    // 🔍 DEBUG (9 jan 2026): Tracer la source des données
    console.log(`🔍 [chargerListeEtudiantsV2] Clé: ${cleEtudiants}, Nb étudiants: ${tousLesEtudiants.length} (depuis IndexedDB)`);

    // Mettre à jour le dropdown des groupes (avec tous les étudiants)
    populerDropdownGroupesV2(tousLesEtudiants);

    // Filtrer par groupe si sélectionné
    const groupeFiltre = getGroupeSelectionneV2();
    const etudiants = groupeFiltre
        ? tousLesEtudiants.filter(e => String(e.groupe).padStart(5, '0') === groupeFiltre)
        : tousLesEtudiants;

    // Mettre à jour le compteur dans l'en-tête (total, pas filtré)
    if (nbTotal) nbTotal.textContent = tousLesEtudiants.length;

    // Mettre à jour la carte résumé (avec les étudiants filtrés)
    mettreAJourResumeEtudiantsV2(etudiants);

    if (etudiants.length === 0) {
        const message = groupeFiltre
            ? `Aucun étudiant dans le groupe ${groupeFiltre}.`
            : 'Aucun étudiant. Utilise l\'import à gauche ou le formulaire ci-dessous.';
        conteneur.innerHTML = `<p class="etat-vide-liste">${message}</p>`;
        toggleDisplay(actionsEtudiants, tousLesEtudiants.length > 0);
        // Masquer le bouton supprimer groupe si pas d'étudiants
        const btnSupprimerGroupe = document.getElementById('v2-btnSupprimerGroupe');
        if (btnSupprimerGroupe) btnSupprimerGroupe.classList.add('u-hide');
        return;
    }

    if (actionsEtudiants) actionsEtudiants.classList.remove('u-hide');

    // 🆕 Beta 95.3: Afficher/masquer le bouton "Supprimer ce groupe"
    const btnSupprimerGroupe = document.getElementById('v2-btnSupprimerGroupe');
    toggleDisplay(btnSupprimerGroupe, groupeFiltre);

    // Trier par nom
    etudiants.sort((a, b) => {
        const nomA = `${a.nom || ''} ${a.prenom || ''}`.toLowerCase();
        const nomB = `${b.nom || ''} ${b.prenom || ''}`.toLowerCase();
        return nomA.localeCompare(nomB);
    });

    let html = `
        <table>
            <thead>
                <tr>
                    <th>DA</th>
                    <th>Grp</th>
                    <th>Nom</th>
                    <th>Prénom</th>
                    <th>SA</th>
                    <th>Action</th>
                    <th>Remarque</th>
                </tr>
            </thead>
            <tbody>
    `;

    etudiants.forEach((e, index) => {
        const sa = e.sa === 'Oui' || e.sa === true ? '✓' : '';
        // Formater le groupe sur 5 chiffres (ex: 00001)
        const groupe = e.groupe ? String(e.groupe).padStart(5, '0') : '—';
        const statut = e.statut || '';
        const classeStatut = statut === 'inactif' || statut === 'décrochage' ? ' etudiant-inactif' : '';
        html += `
            <tr class="${classeStatut}">
                <td>${e.da || '—'}</td>
                <td style="text-align: center;">${groupe}</td>
                <td>${e.nom || '—'}</td>
                <td>${e.prenom || '—'}</td>
                <td style="text-align: center;">${sa}</td>
                <td style="text-align: center;">
                    <select class="controle-form controle-form-compact" onchange="actionEtudiantV2(this, '${e.da}')">
                        <option value="">—</option>
                        <option value="editer">Éditer</option>
                        <option value="supprimer">Supprimer</option>
                    </select>
                </td>
                <td style="text-align: center;">
                    <select class="controle-form controle-form-compact" onchange="remarqueEtudiantV2(this, '${e.da}')">
                        <option value=""${!statut ? ' selected' : ''}>—</option>
                        <option value="inactif"${statut === 'inactif' ? ' selected' : ''}>Inactivité</option>
                        <option value="décrochage"${statut === 'décrochage' ? ' selected' : ''}>Décrochage</option>
                    </select>
                </td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    conteneur.innerHTML = html;
}

/**
 * Met à jour la carte résumé des étudiants (Beta 95.2)
 * @param {Array} etudiants - Liste des étudiants
 */
function mettreAJourResumeEtudiantsV2(etudiants) {
    const elemNbTotal = document.getElementById('v2-resumeNbTotal');
    const elemGroupes = document.getElementById('v2-resumeGroupes');
    const elemSA = document.getElementById('v2-resumeSA');
    const elemNbSA = document.getElementById('v2-resumeNbSA');

    // Nombre total
    if (elemNbTotal) elemNbTotal.textContent = etudiants.length;

    // Répartition par groupe
    if (elemGroupes) {
        const groupesMap = {};
        etudiants.forEach(e => {
            const grp = e.groupe ? String(e.groupe).padStart(5, '0') : 'Sans groupe';
            groupesMap[grp] = (groupesMap[grp] || 0) + 1;
        });

        const groupesTries = Object.entries(groupesMap).sort((a, b) => a[0].localeCompare(b[0]));

        if (groupesTries.length === 0) {
            elemGroupes.innerHTML = '';
        } else if (groupesTries.length === 1) {
            elemGroupes.innerHTML = `<div class="resume-details-ligne"><span>Groupe ${groupesTries[0][0]}</span></div>`;
        } else {
            let html = '';
            groupesTries.forEach(([grp, nb]) => {
                html += `<div class="resume-details-ligne"><span>Grp ${grp}</span><span>${nb}</span></div>`;
            });
            elemGroupes.innerHTML = html;
        }
    }

    // Services adaptés (SA)
    const nbSA = etudiants.filter(e => e.sa === 'Oui' || e.sa === true).length;
    toggleDisplay(elemSA, nbSA > 0);
    if (elemNbSA) {
        elemNbSA.textContent = nbSA;
    }

    // Beta 95.3 : Top programmes (2-3 plus fréquents)
    const elemTopProgrammes = document.getElementById('v2-topProgrammes');
    if (elemTopProgrammes) {
        const programmesMap = {};
        etudiants.forEach(e => {
            const prog = e.programme ? String(e.programme).trim() : '';
            if (prog) {
                programmesMap[prog] = (programmesMap[prog] || 0) + 1;
            }
        });

        // Trier par fréquence décroissante, garder top 3
        const topProgrammes = Object.entries(programmesMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);

        if (topProgrammes.length === 0) {
            elemTopProgrammes.classList.add('u-hide');
        } else {
            elemTopProgrammes.classList.remove('u-hide');
            let html = '<div class="label-top">Programmes :</div>';
            topProgrammes.forEach(([prog, nb]) => {
                html += `<div class="programme-item"><span>${prog}</span><span>${nb}</span></div>`;
            });
            elemTopProgrammes.innerHTML = html;
        }
    }
}

/**
 * Peuple le dropdown de sélection des groupes
 * @param {Array} etudiants - Liste complète des étudiants
 */
function populerDropdownGroupesV2(etudiants) {
    const select = document.getElementById('v2-selectGroupe');
    if (!select) return;

    const valeurActuelle = select.value;

    // Extraire les groupes uniques
    const groupesSet = new Set();
    etudiants.forEach(e => {
        if (e.groupe) {
            groupesSet.add(String(e.groupe).padStart(5, '0'));
        }
    });

    const groupesTries = Array.from(groupesSet).sort();

    // Reconstruire les options
    let html = '<option value="">Tous les groupes</option>';
    groupesTries.forEach(grp => {
        html += `<option value="${grp}">${grp}</option>`;
    });
    select.innerHTML = html;

    // Restaurer la sélection si elle existe encore
    if (valeurActuelle && groupesSet.has(valeurActuelle)) {
        select.value = valeurActuelle;
    }
}

/**
 * Filtre la liste des étudiants par groupe sélectionné
 * ✅ CORRECTION (9 jan 2026): Async pour supporter chargerListeEtudiantsV2 async
 */
async function filtrerParGroupeV2() {
    await chargerListeEtudiantsV2();
}

/**
 * Retourne le groupe actuellement sélectionné dans le dropdown
 */
function getGroupeSelectionneV2() {
    return document.getElementById('v2-selectGroupe')?.value || '';
}

/**
 * Charge les groupes d'un cours (ancien comportement, maintenant charge la liste)
 */
async function chargerGroupesCoursV2(coursId) {
    await chargerListeEtudiantsV2();
}

// Variable pour tracker l'index en cours d'édition (-1 = mode ajout)
let etudiantEnEditionIndex = -1;

/**
 * Soumet le formulaire étudiant (ajout ou modification)
 */
async function soumettreEtudiantV2() {
    const da = document.getElementById('v2-etudiantDA')?.value?.trim();
    const nom = document.getElementById('v2-etudiantNom')?.value?.trim();
    const prenom = document.getElementById('v2-etudiantPrenom')?.value?.trim();
    const programme = document.getElementById('v2-etudiantProgramme')?.value?.trim();
    const sa = document.getElementById('v2-etudiantSA')?.value;
    const groupeInput = document.getElementById('v2-etudiantGroupe')?.value?.trim();

    if (!nom || !prenom) {
        afficherNotificationErreur('Le nom et le prénom sont obligatoires.');
        return;
    }

    const coursActif = db.getSync('infoCours', null);
    const groupe = groupeInput || coursActif?.groupe || '00001';

    const etudiant = {
        da: da || `DA${Date.now()}`,
        nom: nom,
        prenom: prenom,
        groupe: groupe,
        programme: programme || '',
        sa: sa || '',
        coursId: coursActif?.id || ''
    };

    const cleEtud = cle('groupeEtudiants');

    // ✅ CORRECTION (9 jan 2026): Utiliser async pour persistance fiable
    let etudiants = await db.get(cleEtud) || [];

    if (etudiantEnEditionIndex >= 0) {
        // Mode édition : mettre à jour l'étudiant existant
        etudiants[etudiantEnEditionIndex] = etudiant;
        await db.set(cleEtud, etudiants);
        afficherNotificationSucces(`${prenom} ${nom} modifié`);
    } else {
        // Mode ajout : ajouter un nouvel étudiant
        etudiants.push(etudiant);
        await db.set(cleEtud, etudiants);
        afficherNotificationSucces(`${prenom} ${nom} ajouté`);
    }

    // Réinitialiser le formulaire et le mode
    reinitialiserFormEtudiantV2();
    chargerListeEtudiantsV2();
}

/**
 * Passe en mode édition pour un étudiant
 * 🆕 FIX (4 fév 2026) : Utiliser DA au lieu de l'index pour éviter décalage avec liste filtrée
 */
function editerEtudiantV2(da) {
    const cleEtud = cle('groupeEtudiants');
    const etudiants = db.getSync(cleEtud, []);
    const index = etudiants.findIndex(e => e.da === da);
    const etudiant = etudiants[index];

    if (!etudiant || index === -1) return;

    // Stocker l'index en édition (index dans la liste complète)
    etudiantEnEditionIndex = index;

    // Remplir le formulaire
    document.getElementById('v2-etudiantDA').value = etudiant.da || '';
    document.getElementById('v2-etudiantNom').value = etudiant.nom || '';
    document.getElementById('v2-etudiantPrenom').value = etudiant.prenom || '';
    document.getElementById('v2-etudiantGroupe').value = etudiant.groupe || '';
    document.getElementById('v2-etudiantProgramme').value = etudiant.programme || '';
    document.getElementById('v2-etudiantSA').value = etudiant.sa || '';

    // Changer l'apparence du formulaire
    const titre = document.getElementById('v2-formEtudiantTitre');
    const btnSoumettre = document.getElementById('v2-btnSoumettreEtudiant');
    const btnAnnuler = document.getElementById('v2-btnAnnulerEdition');
    const formContainer = document.getElementById('v2-formEtudiant');

    if (titre) titre.textContent = 'Modifier l\'étudiant';
    if (btnSoumettre) btnSoumettre.textContent = 'Enregistrer les modifications';
    if (btnAnnuler) btnAnnuler.classList.remove('u-hide');
    if (formContainer) formContainer.classList.add('mode-edition');

    // Scroller vers le formulaire
    formContainer?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/**
 * Annule l'édition et revient au mode ajout
 */
function annulerEditionEtudiantV2() {
    reinitialiserFormEtudiantV2();
}

/**
 * Réinitialise le formulaire en mode ajout
 */
function reinitialiserFormEtudiantV2() {
    etudiantEnEditionIndex = -1;

    // Vider les champs
    document.getElementById('v2-etudiantDA').value = '';
    document.getElementById('v2-etudiantNom').value = '';
    document.getElementById('v2-etudiantPrenom').value = '';
    document.getElementById('v2-etudiantGroupe').value = '';
    document.getElementById('v2-etudiantProgramme').value = '';
    document.getElementById('v2-etudiantSA').value = '';

    // Remettre l'apparence normale
    const titre = document.getElementById('v2-formEtudiantTitre');
    const btnSoumettre = document.getElementById('v2-btnSoumettreEtudiant');
    const btnAnnuler = document.getElementById('v2-btnAnnulerEdition');
    const formContainer = document.getElementById('v2-formEtudiant');

    if (titre) titre.textContent = 'Ajouter un étudiant';
    if (btnSoumettre) btnSoumettre.textContent = 'Ajouter l\'étudiant';
    if (btnAnnuler) btnAnnuler.classList.add('u-hide');
    if (formContainer) formContainer.classList.remove('mode-edition');
}

/**
 * Ajoute un étudiant (alias pour compatibilité)
 */
function ajouterEtudiantV2() {
    soumettreEtudiantV2();
}

/**
 * Crée un nouveau groupe (calcule le prochain numéro disponible)
 */
function creerNouveauGroupeV2() {
    const cleEtud = cle('groupeEtudiants');
    const etudiants = db.getSync(cleEtud, []);

    // Trouver tous les numéros de groupe existants
    const groupesExistants = new Set();
    etudiants.forEach(e => {
        if (e.groupe) {
            const num = parseInt(e.groupe, 10);
            if (!isNaN(num)) groupesExistants.add(num);
        }
    });

    // Calculer le prochain numéro disponible
    let prochainNumero = 1;
    while (groupesExistants.has(prochainNumero)) {
        prochainNumero++;
    }

    const nouveauGroupe = String(prochainNumero).padStart(5, '0');

    // Demander confirmation ou personnalisation
    const groupeSaisi = prompt(`Numéro du nouveau groupe :`, nouveauGroupe);
    if (!groupeSaisi) return; // Annulé

    const groupeFinal = String(groupeSaisi).padStart(5, '0');

    // Réinitialiser le formulaire et pré-remplir le groupe
    reinitialiserFormEtudiantV2();
    document.getElementById('v2-etudiantGroupe').value = groupeFinal;

    // Ajouter l'option au dropdown si elle n'existe pas et la sélectionner
    const select = document.getElementById('v2-selectGroupe');
    if (select) {
        // Vérifier si l'option existe déjà
        let optionExiste = false;
        for (let opt of select.options) {
            if (opt.value === groupeFinal) {
                optionExiste = true;
                break;
            }
        }
        if (!optionExiste) {
            const newOption = document.createElement('option');
            newOption.value = groupeFinal;
            newOption.textContent = groupeFinal;
            select.appendChild(newOption);
        }
        select.value = groupeFinal;
        // Rafraîchir l'affichage pour montrer le groupe vide
        chargerListeEtudiantsV2();
    }

    // Focus sur le premier champ
    document.getElementById('v2-etudiantDA')?.focus();

    afficherNotificationSucces(`Groupe ${groupeFinal} prêt. Ajoute des étudiants.`);
}

/**
 * Supprime un étudiant
 * 🆕 FIX (4 fév 2026) : Utiliser DA au lieu de l'index pour éviter décalage avec liste filtrée
 */
async function supprimerEtudiantV2(da) {
    // ✅ CORRECTION (31 déc 2025): Utiliser namespace
    const cleEtud = cle('groupeEtudiants');

    // ✅ CORRECTION (9 jan 2026): Utiliser async pour persistance fiable
    let etudiants = await db.get(cleEtud) || [];
    const index = etudiants.findIndex(e => e.da === da);
    const etudiant = etudiants[index];

    if (index === -1 || !confirm(`Supprimer ${etudiant?.prenom || ''} ${etudiant?.nom || ''} ?`)) return;

    etudiants.splice(index, 1);
    await db.set(cleEtud, etudiants);

    chargerListeEtudiantsV2();

    if (typeof afficherNotificationSucces === 'function') {
        afficherNotificationSucces('Étudiant supprimé');
    }
}

/**
 * Dispatch des actions du select étudiant (Éditer, Supprimer, Inactivité, Décrochage, Réactiver)
 */
function actionEtudiantV2(selectElement, da) {
    var action = selectElement.value;
    selectElement.value = ''; // Réinitialiser le select

    if (!action) return;

    switch (action) {
        case 'editer':
            editerEtudiantV2(da);
            break;
        case 'supprimer':
            supprimerEtudiantV2(da);
            break;
    }
}

/**
 * Gère le changement de remarque (Inactivité / Décrochage) via le select Remarque
 */
async function remarqueEtudiantV2(selectElement, da) {
    var nouveauStatut = selectElement.value;
    await changerStatutEtudiantV2(da, nouveauStatut);
}

/**
 * Change le statut d'un étudiant (inactif, decrochage, ou '' pour réactiver)
 * - Inactivité : signalée par le registrariat, l'étudiant est absent de plusieurs cours
 * - Décrochage : constat de l'enseignant, officieux, peut-être seulement dans ce cours
 * Dans les deux cas : résultats affichés jusqu'à la dernière présence,
 * mais évaluations et absences exclues des calculs du groupe.
 */
async function changerStatutEtudiantV2(da, nouveauStatut) {
    var cleEtud = cle('groupeEtudiants');
    var etudiants = await db.get(cleEtud) || [];
    var index = etudiants.findIndex(function(e) { return e.da === da; });

    if (index === -1) return;

    var etudiant = etudiants[index];
    var nomComplet = (etudiant.prenom || '') + ' ' + (etudiant.nom || '');

    if (nouveauStatut === 'inactif') {
        if (!confirm('Marquer ' + nomComplet.trim() + ' comme inactif ?\n\nSes résultats seront affichés jusqu\'à sa dernière présence, mais ne seront plus comptés dans les calculs du groupe.')) return;
    } else if (nouveauStatut === 'décrochage') {
        if (!confirm('Marquer ' + nomComplet.trim() + ' en décrochage ?\n\nSes résultats seront affichés jusqu\'à sa dernière présence, mais ne seront plus comptés dans les calculs du groupe.')) return;
    }

    etudiants[index].statut = nouveauStatut;
    await db.set(cleEtud, etudiants);

    chargerListeEtudiantsV2();

    if (typeof afficherNotificationSucces === 'function') {
        if (nouveauStatut === 'inactif') {
            afficherNotificationSucces(nomComplet.trim() + ' marqué inactif');
        } else if (nouveauStatut === 'décrochage') {
            afficherNotificationSucces(nomComplet.trim() + ' marqué en décrochage');
        } else {
            afficherNotificationSucces(nomComplet.trim() + ' réactivé');
        }
    }
}

/**
 * Importe un fichier CSV/TSV
 */
function importerFichierEtudiantsV2(event) {
    const fichier = event.target.files[0];
    if (!fichier) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const contenu = e.target.result;
        traiterDonneesImportV2(contenu);
    };
    // FIX #49 (1er fév 2026) : Omnivox exporte en Windows-1252, pas UTF-8
    reader.readAsText(fichier, 'windows-1252');
}

/**
 * Prévisualise les données collées
 */
function previsualiserDonneesV2() {
    const donnees = document.getElementById('v2-donneesCollees')?.value?.trim();
    if (!donnees) {
        alert('Veuillez coller des données à importer.');
        return;
    }
    traiterDonneesImportV2(donnees);
}

/**
 * Traite les données importées pour prévisualisation
 */
function traiterDonneesImportV2(contenu) {
    const lignes = contenu.trim().split('\n');
    donneesImportEnAttenteV2 = [];

    lignes.forEach(ligne => {
        // Détecter le séparateur (tab, point-virgule ou virgule)
        const separateur = ligne.includes('\t') ? '\t' : (ligne.includes(';') ? ';' : ',');
        const colonnes = ligne.split(separateur).map(c => {
            // Nettoyer format Excel ="valeur" (préserve zéros en tête)
            let val = c.trim();
            if (val.startsWith('="') && val.endsWith('"')) {
                val = val.slice(2, -1);
            } else if (val.startsWith('"') && val.endsWith('"')) {
                val = val.slice(1, -1);
            }
            return val.trim();
        });

        if (colonnes.length >= 4) {
            // FIX #49 (1er fév 2026) : SA peut être en colonne 5 ou 6 selon le format Omnivox
            const saValue = (colonnes[5]?.trim() || colonnes[6]?.trim() || '').toUpperCase();
            const sa = (saValue === 'OUI' || saValue === 'SA' || saValue === 'X') ? 'Oui' : '';

            donneesImportEnAttenteV2.push({
                da: colonnes[0] || '',
                groupe: colonnes[1] || '00001',
                nom: colonnes[2] || '',
                prenom: colonnes[3] || '',
                programme: colonnes[4] || '',
                sa: sa
            });
        }
    });

    if (donneesImportEnAttenteV2.length === 0) {
        alert('Aucune donnée valide trouvée. Vérifie le format.');
        return;
    }

    // Afficher la prévisualisation
    const previewZone = document.getElementById('v2-previewZone');
    const previewTable = document.getElementById('v2-previewTable');

    if (previewZone && previewTable) {
        let html = `
            <table class="tableau-blanc" style="width: 100%; font-size: 0.85rem;">
                <thead>
                    <tr>
                        <th>DA</th><th>Groupe</th><th>Nom</th><th>Prénom</th><th>Programme</th><th>SA</th>
                    </tr>
                </thead>
                <tbody>
        `;

        donneesImportEnAttenteV2.forEach(e => {
            const groupe = e.groupe ? String(e.groupe).padStart(5, '0') : '—';
            html += `
                <tr>
                    <td>${e.da}</td><td>${groupe}</td><td>${e.nom}</td><td>${e.prenom}</td><td>${e.programme}</td><td>${e.sa}</td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        previewTable.innerHTML = html;
        previewZone.classList.remove('u-hide');
    }
}

/**
 * Confirme l'import des données
 */
async function confirmerImportV2() {
    console.log('📥 [confirmerImportV2] Début - donneesImportEnAttenteV2:', donneesImportEnAttenteV2.length);

    if (donneesImportEnAttenteV2.length === 0) {
        console.warn('⚠️ [confirmerImportV2] Aucune donnée en attente !');
        return;
    }

    const coursActif = db.getSync('infoCours', null);
    // ✅ CORRECTION (31 déc 2025): Utiliser namespace
    const cleEtud = cle('groupeEtudiants');
    console.log('📥 [confirmerImportV2] Clé:', cleEtud);

    // ✅ CORRECTION (9 jan 2026): Lire depuis IndexedDB pour avoir les données complètes
    let etudiants = await db.get(cleEtud) || [];
    console.log('📥 [confirmerImportV2] Étudiants existants:', etudiants.length);

    donneesImportEnAttenteV2.forEach(e => {
        etudiants.push({
            ...e,
            coursId: coursActif?.id || ''
        });
    });

    console.log('📥 [confirmerImportV2] Total après ajout:', etudiants.length);

    // ✅ CORRECTION (9 jan 2026): Utiliser db.set (async) pour écriture fiable
    await db.set(cleEtud, etudiants);

    // Vérification immédiate
    const verification = db.getSync(cleEtud, []).length;
    console.log('📥 [confirmerImportV2] Vérification après save:', verification);

    // Nettoyer
    donneesImportEnAttenteV2 = [];
    document.getElementById('v2-previewZone').classList.add('u-hide');
    document.getElementById('v2-donneesCollees').value = '';
    document.getElementById('v2-fichierCsvEntree').value = '';

    // 🆕 Beta 95.3: Reset le filtre à "Tous les groupes" pour voir les nouveaux étudiants
    const selectGroupe = document.getElementById('v2-selectGroupe');
    if (selectGroupe) selectGroupe.value = '';

    chargerListeEtudiantsV2();

    if (typeof afficherNotificationSucces === 'function') {
        afficherNotificationSucces(`${etudiants.length} étudiant(s) importé(s)`);
    }

    // Mettre à jour le guide groupe-cours
    mettreAJourGuideGroupeCours();
}

/**
 * Annule l'import en cours
 */
function annulerImportV2() {
    donneesImportEnAttenteV2 = [];
    document.getElementById('v2-previewZone').classList.add('u-hide');
}

/**
 * Exporte les étudiants en CSV
 */
function exporterEtudiantsV2() {
    // ✅ CORRECTION (31 déc 2025): Utiliser namespace
    const cleEtud = cle('groupeEtudiants');
    const etudiants = db.getSync(cleEtud, []);
    if (etudiants.length === 0) {
        alert('Aucun étudiant à exporter.');
        return;
    }

    let csv = 'DA,Groupe,Nom,Prénom,Programme,SA\n';
    etudiants.forEach(e => {
        csv += `${e.da || ''},${e.groupe || ''},${e.nom || ''},${e.prenom || ''},${e.programme || ''},${e.sa || ''}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `etudiants-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
}

/**
 * Réinitialise la liste des étudiants
 */
async function reinitialiserEtudiantsV2() {
    // ✅ CORRECTION (31 déc 2025): Utiliser namespace
    const cleEtud = cle('groupeEtudiants');

    // ✅ CORRECTION (9 jan 2026): Utiliser async pour persistance fiable
    const etudiants = await db.get(cleEtud) || [];
    if (!confirm(`Supprimer les ${etudiants.length} étudiant(s) ? Cette action est irréversible.`)) return;

    await db.set(cleEtud, []);
    chargerListeEtudiantsV2();

    if (typeof afficherNotificationSucces === 'function') {
        afficherNotificationSucces('Liste réinitialisée');
    }

    // Mettre à jour le guide groupe-cours
    mettreAJourGuideGroupeCours();
}

/**
 * Vide la liste des étudiants (alias de reinitialiser)
 * 🆕 BETA 95.2 : Fonction ajoutée pour l'accordéon groupe d'étudiants
 */
function viderListeEtudiantsV2() {
    reinitialiserEtudiantsV2();
}

/**
 * Supprime tous les étudiants du groupe sélectionné
 * 🆕 BETA 95.3 : Permet de supprimer un groupe entier
 */
async function supprimerGroupeSelectionneV2() {
    const groupeSelectionne = getGroupeSelectionneV2();
    if (!groupeSelectionne) {
        afficherNotificationErreur('Sélectionne un groupe spécifique à supprimer.');
        return;
    }

    const cleEtud = cle('groupeEtudiants');

    // ✅ CORRECTION (9 jan 2026): Utiliser async pour persistance fiable
    const tousLesEtudiants = await db.get(cleEtud) || [];

    // Compter les étudiants du groupe
    const etudiantsDuGroupe = tousLesEtudiants.filter(e =>
        String(e.groupe).padStart(5, '0') === groupeSelectionne
    );

    if (etudiantsDuGroupe.length === 0) {
        afficherNotificationErreur('Aucun étudiant dans ce groupe.');
        return;
    }

    if (!confirm(`Supprimer les ${etudiantsDuGroupe.length} étudiant(s) du groupe ${groupeSelectionne} ?`)) {
        return;
    }

    // Garder uniquement les étudiants des autres groupes
    const etudiantsRestants = tousLesEtudiants.filter(e =>
        String(e.groupe).padStart(5, '0') !== groupeSelectionne
    );

    await db.set(cleEtud, etudiantsRestants);

    // Reset le dropdown à "Tous les groupes"
    const selectGroupe = document.getElementById('v2-selectGroupe');
    if (selectGroupe) selectGroupe.value = '';

    chargerListeEtudiantsV2();

    if (typeof afficherNotificationSucces === 'function') {
        afficherNotificationSucces(`Groupe ${groupeSelectionne} supprimé (${etudiantsDuGroupe.length} étudiant(s))`);
    }

    // Mettre à jour le guide groupe-cours
    mettreAJourGuideGroupeCours();
}

/**
 * Sauvegarde le groupe d'étudiants et ouvre l'accordéon Horaire
 * 🆕 BETA 95.2 : Workflow groupe → horaire
 */
async function sauvegarderGroupeEtudiantsV2() {
    const cleEtud = cle('groupeEtudiants');

    // ✅ CORRECTION (9 jan 2026): Utiliser async pour persistance fiable
    const etudiants = await db.get(cleEtud) || [];

    if (etudiants.length === 0) {
        alert('Aucun étudiant dans le groupe. Importe d\'abord une liste.');
        return;
    }

    // Récupérer le numéro de groupe
    const coursActif = db.getSync('infoCours', {});
    const numeroGroupe = coursActif?.groupe || '00001';

    // S'assurer que tous les étudiants ont le bon numéro de groupe
    let modifie = false;
    etudiants.forEach(e => {
        if (!e.groupe || e.groupe === '' || e.groupe === '—') {
            e.groupe = numeroGroupe;
            modifie = true;
        }
    });

    if (modifie) {
        await db.set(cleEtud, etudiants);
    }

    // Notification de succès
    if (typeof afficherNotificationSucces === 'function') {
        afficherNotificationSucces(`Groupe ${numeroGroupe} sauvegardé (${etudiants.length} étudiants)`);
    }

    // 🆕 BETA 95.2 : Rafraîchir le dropdown groupe-cours pour inclure ce groupe
    if (typeof peuplerDropdownGroupeCours === 'function') {
        peuplerDropdownGroupeCours();
    }

    // Mettre à jour le guide groupe-cours
    mettreAJourGuideGroupeCours();

    // Ouvrir l'accordéon Horaire pour continuer le workflow
    const accordeonHoraire = document.getElementById('accordeon-horaire');
    if (accordeonHoraire) {
        const contenu = accordeonHoraire.querySelector('.accordeon-contenu');
        const chevron = accordeonHoraire.querySelector('.accordeon-chevron');
        if (contenu && contenu.classList.contains('u-hide')) {
            contenu.classList.remove('u-hide');
            if (chevron) chevron.textContent = '▼';
        }
        // Scroll vers l'accordéon Horaire
        accordeonHoraire.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

/**
 * Active un groupe (compat)
 */
function activerGroupeV2(numeroGroupe) {
    const coursActif = db.getSync('infoCours', {});
    coursActif.groupe = numeroGroupe;
    db.setSync('infoCours', coursActif);
    chargerListeEtudiantsV2();
}

/**
 * Gère les étudiants d'un groupe (compat - charge simplement la liste)
 */
function gererEtudiantsGroupeV2(numeroGroupe) {
    chargerListeEtudiantsV2();
}

/**
 * Ouvre la gestion des étudiants (compat)
 */
function ouvrirModalNouveauGroupe() {
    // L'accordéon groupes est déjà intégré, pas besoin de redirection
    chargerListeEtudiantsV2();
}

/* ===============================
   ACCORDÉON HORAIRE
   =============================== */

/**
 * Charge et affiche les séances dans l'accordéon Horaire v2
 * 🆕 BETA 95 : Affiche le cours actif et utilise obtenirSeancesHoraire()
 */
function chargerSeancesV2() {
    const conteneur = document.getElementById('v2-seancesContainer');
    if (!conteneur) return;

    // 🆕 BETA 95 : Utiliser obtenirSeancesHoraire() qui gère tous les fallbacks
    let horaire = typeof obtenirSeancesHoraire === 'function'
        ? obtenirSeancesHoraire()
        : db.getSync(cle('horaireHebdo'), []);

    // 🆕 BETA 95 : Obtenir les infos du cours actif pour affichage
    let coursActifInfo = '';
    if (typeof obtenirCoursActifId === 'function') {
        const coursId = obtenirCoursActifId();
        if (coursId) {
            const infoCours = db.getSync('infoCours', null);
            if (infoCours) {
                // 🆕 FIX (4 fév 2026) : Priorité codeCours
                const sigle = infoCours.codeCours || infoCours.sigle || infoCours.code || '';
                const groupe = infoCours.groupe || '';
                coursActifInfo = groupe ? `${sigle} (${groupe})` : sigle;
            }
        }
    }

    if (horaire.length === 0) {
        let messageVide = '<p class="text-muted text-italic">Aucune séance configurée. Clique sur « + Ajouter une séance » pour commencer.</p>';
        if (coursActifInfo) {
            messageVide = `<div class="alerte alerte-info" style="margin-bottom: 10px;">
                <strong>Cours actif :</strong> ${coursActifInfo}
            </div>` + messageVide;
        }
        conteneur.innerHTML = messageVide;
        return;
    }

    // Calculer le total d'heures
    let totalHeures = 0;
    horaire.forEach(s => {
        const duree = parseFloat(s.duree) || 0;
        totalHeures += duree;
    });

    const joursNoms = { 'Lundi': 1, 'Mardi': 2, 'Mercredi': 3, 'Jeudi': 4, 'Vendredi': 5 };
    const joursInverse = ['', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];

    // 🆕 BETA 95 : Afficher le cours actif en haut
    let html = '';
    if (coursActifInfo) {
        html += `<div class="alerte alerte-info" style="margin-bottom: 10px;">
            <strong>Horaire pour :</strong> ${coursActifInfo}
        </div>`;
    }

    // 🆕 BETA 95.1 : Calculer le total en périodes
    const totalPeriodes = horaire.reduce((sum, s) => {
        if (s.nombrePeriodes) return sum + s.nombrePeriodes;
        if (s.duree) return sum + Math.round((parseFloat(s.duree) * 60) / 55);
        return sum + 2; // Défaut 2 périodes
    }, 0);

    html += `
        <div style="margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
            <span class="text-muted"><strong>${horaire.length}</strong> séance(s) • <strong>${totalPeriodes}</strong> pér./semaine</span>
        </div>
        <div style="display: grid; gap: 8px;">
    `;

    horaire.forEach((s, index) => {
        const jourNom = s.jour || joursInverse[s.jourNum] || '?';
        const heureDebut = s.heureDebut || s.debut || '?';
        // 🆕 BETA 95.1 : Afficher en périodes
        const periodes = s.nombrePeriodes || (s.duree ? Math.round((parseFloat(s.duree) * 60) / 55) : 2);
        const local = s.local || '';

        html += `
            <div class="item-carte-compact" style="display: flex; align-items: center; padding: 10px 15px; background: var(--bleu-tres-pale); border-radius: 6px;">
                <span style="width: 90px; font-weight: 600; color: var(--accent-primaire);">${jourNom}</span>
                <span style="flex: 1;">${heureDebut} (${periodes} pér.)</span>
                <span class="text-muted" style="width: 80px;">${local}</span>
                <div style="display: flex; gap: 5px;">
                    <button class="btn btn-modifier btn-sm" onclick="modifierSeanceV2(${index})" title="Modifier">Modifier</button>
                    <button class="btn btn-annuler btn-sm" onclick="supprimerSeanceV2(${index})" title="Supprimer">Suppr.</button>
                </div>
            </div>
        `;
    });

    html += '</div>';
    conteneur.innerHTML = html;
}

// Variable pour stocker l'index de la séance en édition
let seanceEnEditionV2 = null;

/**
 * Affiche le formulaire pour ajouter une nouvelle séance
 */
function afficherFormSeanceV2() {
    seanceEnEditionV2 = null;

    const formulaire = document.getElementById('v2-formAjoutSeance');
    const titre = document.getElementById('v2-titreFormSeance');
    const btnTexte = document.getElementById('v2-btnConfirmerSeance');

    if (formulaire) {
        formulaire.classList.remove('u-hide');
        if (titre) titre.textContent = 'Nouvelle séance';
        if (btnTexte) btnTexte.textContent = 'Ajouter';

        // Réinitialiser les champs
        setValue('v2-jourSeance', '');
        setValue('v2-debutSeance', '');
        setValue('v2-periodesSeance', '2');
        setValue('v2-localSeance', '');

        formulaire.scrollIntoView({ behavior: 'smooth' });
    }
}

/**
 * Modifie une séance existante
 * 🆕 BETA 95 : Utilise obtenirSeancesHoraire() pour support multi-cours
 */
function modifierSeanceV2(index) {
    const horaire = typeof obtenirSeancesHoraire === 'function'
        ? obtenirSeancesHoraire()
        : db.getSync(cle('horaireHebdo'), []);
    const seance = horaire[index];

    if (!seance) {
        alert('Séance non trouvée.');
        return;
    }

    seanceEnEditionV2 = index;

    const formulaire = document.getElementById('v2-formAjoutSeance');
    const titre = document.getElementById('v2-titreFormSeance');
    const btnTexte = document.getElementById('v2-btnConfirmerSeance');

    if (formulaire) {
        formulaire.classList.remove('u-hide');
        if (titre) titre.textContent = 'Modifier la séance';
        if (btnTexte) btnTexte.textContent = 'Enregistrer';

        // Remplir les champs
        setValue('v2-jourSeance', seance.jour || '');
        setValue('v2-debutSeance', seance.heureDebut || seance.debut || '');
        // 🆕 BETA 95.1 : Utiliser nombrePeriodes si disponible, sinon convertir depuis duree
        const periodesValue = seance.nombrePeriodes
            || (seance.duree ? Math.round((parseFloat(seance.duree) * 60) / 55) : 2);
        setValue('v2-periodesSeance', String(periodesValue));
        setValue('v2-localSeance', seance.local || '');

        formulaire.scrollIntoView({ behavior: 'smooth' });
    }
}

/**
 * Annule le formulaire de séance
 */
function annulerFormSeanceV2() {
    seanceEnEditionV2 = null;
    const formulaire = document.getElementById('v2-formAjoutSeance');
    if (formulaire) formulaire.classList.add('u-hide');
}

/**
 * Confirme l'ajout ou la modification d'une séance
 * 🆕 BETA 95.1 : Utilise les périodes au lieu des heures
 */
function confirmerSeanceV2() {
    const jour = document.getElementById('v2-jourSeance')?.value;
    const debut = document.getElementById('v2-debutSeance')?.value;
    const periodes = document.getElementById('v2-periodesSeance')?.value;
    const local = document.getElementById('v2-localSeance')?.value?.trim() || '';

    // Validation
    if (!jour) {
        alert('Veuillez sélectionner un jour.');
        return;
    }
    if (!debut) {
        alert('Veuillez sélectionner une heure de début.');
        return;
    }
    if (!periodes) {
        alert('Veuillez sélectionner le nombre de périodes.');
        return;
    }

    // 🆕 BETA 95.1 : Convertir périodes en heures pour rétrocompatibilité
    const nombrePeriodes = parseInt(periodes);
    const dureeHeures = typeof periodesVersHeures === 'function'
        ? periodesVersHeures(nombrePeriodes)
        : (nombrePeriodes * 55) / 60; // Fallback: 55 min par période

    // Calculer l'heure de fin
    const [heures, minutes] = debut.split(':').map(Number);
    const finHeures = heures + Math.floor(dureeHeures);
    const finMinutes = minutes + (dureeHeures % 1) * 60;
    const heureFin = `${String(finHeures + Math.floor(finMinutes / 60)).padStart(2, '0')}:${String(Math.round(finMinutes % 60)).padStart(2, '0')}`;

    const seance = {
        jour: jour,
        heureDebut: debut,
        heureFin: heureFin,
        nombrePeriodes: nombrePeriodes,  // 🆕 BETA 95.1
        duree: dureeHeures,              // Rétrocompatibilité
        local: local
    };

    // 🆕 BETA 95 : Lire l'horaire actuel avec obtenirSeancesHoraire()
    let horaire = typeof obtenirSeancesHoraire === 'function'
        ? obtenirSeancesHoraire().slice() // Copie pour modification
        : db.getSync(cle('horaireHebdo'), []);

    if (seanceEnEditionV2 !== null) {
        // Modification
        horaire[seanceEnEditionV2] = seance;
    } else {
        // Ajout
        horaire.push(seance);
    }

    // Trier par jour puis par heure
    const ordreJours = { 'Lundi': 1, 'Mardi': 2, 'Mercredi': 3, 'Jeudi': 4, 'Vendredi': 5 };
    horaire.sort((a, b) => {
        const jourA = ordreJours[a.jour] || 99;
        const jourB = ordreJours[b.jour] || 99;
        if (jourA !== jourB) return jourA - jourB;
        return (a.heureDebut || '').localeCompare(b.heureDebut || '');
    });

    // 🆕 BETA 95 : Sauvegarder dans la clé spécifique au cours
    const cleSauvegarde = typeof cleHoraire === 'function' ? cleHoraire() : cle('horaireHebdo');
    db.setSync(cleSauvegarde, horaire);

    // Notifier
    if (typeof afficherNotificationSucces === 'function') {
        afficherNotificationSucces(seanceEnEditionV2 !== null ? 'Séance modifiée' : 'Séance ajoutée');
    }

    // Fermer le formulaire et recharger
    annulerFormSeanceV2();
    chargerSeancesV2();

    // Régénérer les séances complètes si la fonction existe
    if (typeof genererSeancesCompletes === 'function') {
        genererSeancesCompletes();
    }

    // Mettre à jour le guide groupe-cours
    mettreAJourGuideGroupeCours();
}

/**
 * Supprime une séance
 */
function supprimerSeanceV2(index) {
    if (!confirm('Supprimer cette séance ?')) return;

    // 🆕 BETA 95 : Utiliser les fonctions multi-cours
    let horaire = typeof obtenirSeancesHoraire === 'function'
        ? obtenirSeancesHoraire().slice() // Copie pour modification
        : db.getSync(cle('horaireHebdo'), []);
    horaire.splice(index, 1);
    const cleSauvegarde = typeof cleHoraire === 'function' ? cleHoraire() : cle('horaireHebdo');
    db.setSync(cleSauvegarde, horaire);

    if (typeof afficherNotificationSucces === 'function') {
        afficherNotificationSucces('Séance supprimée');
    }

    chargerSeancesV2();

    // Régénérer les séances complètes si la fonction existe
    if (typeof genererSeancesCompletes === 'function') {
        genererSeancesCompletes();
    }

    // Mettre à jour le guide groupe-cours
    mettreAJourGuideGroupeCours();
}

/**
 * Charge l'horaire du groupe actif (compat avec ancien code)
 */
function chargerHoraireGroupeActifV2(numeroGroupe) {
    chargerSeancesV2();
}

/* ===============================
   GESTION DES HORAIRES (Beta 95.2)
   =============================== */

// Variable pour tracker l'horaire en édition
let horaireEnEditionId = null;

/**
 * Charge et affiche les horaires dans le dropdown
 * Beta 95.2 : Restaure le dernier horaire sélectionné
 */
function chargerHorairesV2() {
    populerDropdownHorairesV2();

    // ✅ CORRIGÉ (8 janvier 2026) : Restaurer le dernier horaire sélectionné
    const horaireIdSauvegarde = db.getSync('horaireSelectionne', null);
    if (horaireIdSauvegarde) {
        const cleHoraires = cle('horaires');
        const horaires = db.getSync(cleHoraires, []);
        const horaire = horaires.find(h => h.id === horaireIdSauvegarde);

        if (horaire) {
            const select = document.getElementById('v2-selectHoraire');
            if (select) select.value = horaire.id;
            mettreAJourCarteResumeHoraireV2(horaire);
            editerHoraireV2(horaire);
        } else {
            mettreAJourCarteResumeHoraireV2(null);
        }
    } else {
        mettreAJourCarteResumeHoraireV2(null);
    }
}

/**
 * Peuple le dropdown des horaires
 */
function populerDropdownHorairesV2() {
    const select = document.getElementById('v2-selectHoraire');
    if (!select) return;

    const cleHoraires = cle('horaires');
    const horaires = db.getSync(cleHoraires, []);
    const valeurActuelle = select.value;

    let html = '<option value="">Sélectionner...</option>';
    horaires.forEach(h => {
        html += `<option value="${h.id}">${h.nom || 'Sans nom'}</option>`;
    });
    select.innerHTML = html;

    // Restaurer la sélection
    if (valeurActuelle) {
        select.value = valeurActuelle;
    }
}

/**
 * Appelé quand on change l'horaire sélectionné dans le dropdown
 */
function changerHoraireSelectionneV2(horaireId) {
    if (!horaireId) {
        // Aucun horaire sélectionné - afficher état vide
        db.setSync('horaireSelectionne', null);
        mettreAJourCarteResumeHoraireV2(null);
        afficherEtatVideHoraireV2();
        return;
    }

    const cleHoraires = cle('horaires');
    const horaires = db.getSync(cleHoraires, []);
    const horaire = horaires.find(h => h.id === horaireId);

    if (horaire) {
        // Sauvegarder la sélection pour persistance (Beta 95.2)
        db.setSync('horaireSelectionne', horaireId);
        mettreAJourCarteResumeHoraireV2(horaire);
        editerHoraireV2(horaire);
    }
}

/**
 * Met à jour la carte résumé de l'horaire
 * 🆕 (10 jan 2026) : Affiche local par séance
 */
function mettreAJourCarteResumeHoraireV2(horaire) {
    const carte = document.getElementById('v2-carteResumeHoraire');
    if (!carte) return;

    if (!horaire) {
        carte.innerHTML = '<p class="etat-vide-resume">Aucun horaire sélectionné</p>';
        return;
    }

    const nbSeances = horaire.seances?.length || 0;
    const periodesParSeance = horaire.periodesParSeance || 2;
    const totalPeriodes = nbSeances * periodesParSeance;

    let seancesHtml = '';
    if (horaire.seances && horaire.seances.length > 0) {
        seancesHtml = '<ul>';
        horaire.seances.forEach(s => {
            const heureFin = s.heureFin || calculerHeureFin(s.heureDebut, periodesParSeance);
            // Afficher le local par séance (ou fallback vers local global pour anciennes données)
            const localSeance = s.local || horaire.local || '';
            const localInfo = localSeance ? ` (${localSeance})` : '';
            seancesHtml += `<li>${s.jour} ${s.heureDebut} - ${heureFin}${localInfo}</li>`;
        });
        seancesHtml += '</ul>';
    }

    carte.innerHTML = `
        <div class="resume-horaire-nom">${horaire.nom || 'Sans nom'}</div>
        <div class="resume-horaire-details">
            <div>Format : ${nbSeances}×${periodesParSeance}</div>
            <div>${totalPeriodes} périodes/semaine</div>
        </div>
        ${seancesHtml ? `<div class="resume-horaire-seances">${seancesHtml}</div>` : ''}
    `;
}

/**
 * Affiche l'état vide du formulaire
 */
function afficherEtatVideHoraireV2() {
    const etatVide = document.getElementById('v2-horaireEtatVide');
    const formulaire = document.getElementById('v2-formulaireHoraire');
    const carteResume = document.getElementById('v2-carteResumeHoraire');

    if (etatVide) etatVide.classList.remove('u-hide');
    if (formulaire) formulaire.classList.add('u-hide');
    // Afficher la carte résumé seulement en état vide (Beta 95.2)
    if (carteResume) carteResume.classList.remove('u-hide');
    horaireEnEditionId = null;
}

/**
 * Peuple le dropdown des groupes associés dans le formulaire horaire
 */
function populerDropdownGroupesHoraireV2() {
    const select = document.getElementById('v2-hor-groupeAssocie');
    if (!select) return;

    const cleEtud = cle('groupeEtudiants');
    const etudiants = db.getSync(cleEtud, []);

    // Extraire les groupes uniques
    const groupesSet = new Set();
    etudiants.forEach(e => {
        if (e.groupe) {
            groupesSet.add(String(e.groupe).padStart(5, '0'));
        }
    });

    const groupesTries = Array.from(groupesSet).sort();
    let html = '<option value="">— Sélectionner un groupe —</option>';
    groupesTries.forEach(grp => {
        const nbEtudiants = etudiants.filter(e => String(e.groupe).padStart(5, '0') === grp).length;
        html += `<option value="${grp}">${grp} (${nbEtudiants} étud.)</option>`;
    });
    select.innerHTML = html;
}

/**
 * Affiche le formulaire pour un nouvel horaire
 */
function nouveauHoraireV2() {
    horaireEnEditionId = null;

    // Populer le dropdown des groupes
    populerDropdownGroupesHoraireV2();

    // Vider les champs (avec vérifications null pour robustesse)
    const champGroupe = document.getElementById('v2-hor-groupeAssocie');
    const champNom = document.getElementById('v2-hor-nom');
    const champNbSeances = document.getElementById('v2-hor-nbSeances');
    const champPeriodes = document.getElementById('v2-hor-periodesParSeance');

    if (champGroupe) champGroupe.value = '';
    if (champNom) champNom.value = '';
    // Note: v2-hor-local supprimé (Beta 95.5) - le local est maintenant par séance
    if (champNbSeances) champNbSeances.value = '2';
    if (champPeriodes) champPeriodes.value = '2';

    // Mettre à jour le titre
    const titre = document.getElementById('v2-titreFormHoraire');
    const btnTexte = document.getElementById('v2-btnTexteHoraire');
    if (titre) titre.textContent = 'Nouvel horaire';
    if (btnTexte) btnTexte.textContent = 'Ajouter';

    // Masquer le bouton supprimer (mode création)
    const btnSupprimer = document.getElementById('v2-btnSupprimerHoraire');
    if (btnSupprimer) btnSupprimer.classList.add('u-hide');

    // Générer les champs de séances
    mettreAJourSeancesHoraireV2();

    // Afficher le formulaire, masquer carte résumé (évite redondance - Beta 95.2)
    const etatVide = document.getElementById('v2-horaireEtatVide');
    const formulaire = document.getElementById('v2-formulaireHoraire');
    const carteResume = document.getElementById('v2-carteResumeHoraire');
    if (etatVide) etatVide.classList.add('u-hide');
    if (formulaire) formulaire.classList.remove('u-hide');
    if (carteResume) carteResume.classList.add('u-hide');

    // Désélectionner dans le dropdown
    const select = document.getElementById('v2-selectHoraire');
    if (select) select.value = '';
}

/**
 * Charge un horaire existant dans le formulaire pour édition
 * 🆕 (10 jan 2026) : Local par séance au lieu de global
 */
function editerHoraireV2(horaire) {
    horaireEnEditionId = horaire.id;

    // Populer le dropdown des groupes
    populerDropdownGroupesHoraireV2();

    // Remplir les champs
    const selectGroupe = document.getElementById('v2-hor-groupeAssocie');
    if (selectGroupe) selectGroupe.value = horaire.groupeAssocie || '';
    document.getElementById('v2-hor-nom').value = horaire.nom || '';
    document.getElementById('v2-hor-nbSeances').value = String(horaire.seances?.length || 2);
    document.getElementById('v2-hor-periodesParSeance').value = String(horaire.periodesParSeance || 2);

    // Mettre à jour le titre
    const titre = document.getElementById('v2-titreFormHoraire');
    const btnTexte = document.getElementById('v2-btnTexteHoraire');
    if (titre) titre.textContent = 'Modifier l\'horaire';
    if (btnTexte) btnTexte.textContent = 'Enregistrer';

    // Afficher le bouton supprimer (mode édition)
    const btnSupprimer = document.getElementById('v2-btnSupprimerHoraire');
    if (btnSupprimer) btnSupprimer.classList.remove('u-hide');

    // Générer les champs de séances puis les remplir
    mettreAJourSeancesHoraireV2();

    // Remplir les séances existantes (avec local par séance)
    if (horaire.seances) {
        // Migration : si ancien format avec local global, le copier dans chaque séance
        const localGlobal = horaire.local || '';

        horaire.seances.forEach((s, i) => {
            const selectJour = document.getElementById(`v2-hor-seance-${i}-jour`);
            const inputDebut = document.getElementById(`v2-hor-seance-${i}-debut`);
            const inputFin = document.getElementById(`v2-hor-seance-${i}-fin`);
            const inputLocal = document.getElementById(`v2-hor-seance-${i}-local`);

            if (selectJour) selectJour.value = s.jour || 'Lundi';
            if (inputDebut) inputDebut.value = s.heureDebut || '08:00';
            if (inputFin) inputFin.value = s.heureFin || '10:00';
            // Local par séance ou fallback vers local global (migration)
            if (inputLocal) inputLocal.value = s.local || localGlobal;
        });
    }

    // Afficher le formulaire, masquer carte résumé (évite redondance - Beta 95.2)
    const etatVide = document.getElementById('v2-horaireEtatVide');
    const formulaire = document.getElementById('v2-formulaireHoraire');
    const carteResume = document.getElementById('v2-carteResumeHoraire');
    if (etatVide) etatVide.classList.add('u-hide');
    if (formulaire) formulaire.classList.remove('u-hide');
    if (carteResume) carteResume.classList.add('u-hide');
}

/**
 * Annule le formulaire horaire
 */
function annulerFormHoraireV2() {
    afficherEtatVideHoraireV2();

    // Désélectionner dans le dropdown
    const select = document.getElementById('v2-selectHoraire');
    if (select) select.value = '';
    mettreAJourCarteResumeHoraireV2(null);
}

/**
 * Sauvegarde l'horaire (ajout ou modification)
 * 🆕 (10 jan 2026) : Local par séance au lieu de global
 */
function sauvegarderHoraireV2() {
    const groupeAssocie = document.getElementById('v2-hor-groupeAssocie')?.value;
    const nom = document.getElementById('v2-hor-nom')?.value?.trim();
    const nbSeances = parseInt(document.getElementById('v2-hor-nbSeances')?.value) || 2;
    const periodesParSeance = parseInt(document.getElementById('v2-hor-periodesParSeance')?.value) || 2;

    if (!groupeAssocie) {
        afficherNotificationErreur('Veuillez sélectionner un groupe associé');
        return;
    }

    if (!nom) {
        afficherNotificationErreur('Le nom de l\'horaire est requis');
        return;
    }

    // Collecter les séances (avec local par séance)
    const seances = [];
    for (let i = 0; i < nbSeances; i++) {
        const jour = document.getElementById(`v2-hor-seance-${i}-jour`)?.value || 'Lundi';
        const heureDebut = document.getElementById(`v2-hor-seance-${i}-debut`)?.value || '08:00';
        const heureFin = document.getElementById(`v2-hor-seance-${i}-fin`)?.value || '10:00';
        const local = document.getElementById(`v2-hor-seance-${i}-local`)?.value?.trim() || '';
        seances.push({ jour, heureDebut, heureFin, local });
    }

    const cleHoraires = cle('horaires');
    let horaires = db.getSync(cleHoraires, []);

    if (horaireEnEditionId) {
        // Modification
        const index = horaires.findIndex(h => h.id === horaireEnEditionId);
        if (index >= 0) {
            horaires[index] = {
                ...horaires[index],
                groupeAssocie,
                nom,
                periodesParSeance,
                seances
            };
            // Supprimer l'ancien champ local global s'il existe (migration)
            delete horaires[index].local;
        }
        afficherNotificationSucces(`Horaire "${nom}" modifié`);
    } else {
        // Ajout
        const nouvelHoraire = {
            id: genererIdUnique('HOR_'),
            groupeAssocie,
            nom,
            periodesParSeance,
            seances
        };
        horaires.push(nouvelHoraire);
        horaireEnEditionId = nouvelHoraire.id;
        afficherNotificationSucces(`Horaire "${nom}" créé`);
    }

    db.setSync(cleHoraires, horaires);

    // 🆕 FIX (22 jan 2026) : Synchroniser horaireHebdo pour que le calendrier reconnaisse les jours de cours
    // Fusionner les séances de TOUS les horaires pour couvrir tous les groupes-cours
    const toutesSeances = [];
    const joursDejaVus = new Set();
    horaires.forEach(h => {
        if (h.seances && Array.isArray(h.seances)) {
            h.seances.forEach(s => {
                // Éviter les doublons de jours (un seul horaire par jour suffit pour le calendrier)
                const jourNormalise = s.jour.toLowerCase();
                if (!joursDejaVus.has(jourNormalise)) {
                    joursDejaVus.add(jourNormalise);
                    toutesSeances.push(s);
                }
            });
        }
    });
    const cleHoraireHebdo = cle('horaireHebdo');
    db.setSync(cleHoraireHebdo, toutesSeances);
    console.log(`📅 horaireHebdo synchronisé avec ${toutesSeances.length} jour(s):`, toutesSeances.map(s => s.jour).join(', '));

    // Regénérer le calendrier avec les nouveaux jours de cours
    if (typeof genererCalendrierComplet === 'function') {
        genererCalendrierComplet();
        console.log('📅 Calendrier regénéré');
    }

    // Rafraîchir l'interface
    populerDropdownHorairesV2();
    const select = document.getElementById('v2-selectHoraire');
    if (select) select.value = horaireEnEditionId;

    const horaire = horaires.find(h => h.id === horaireEnEditionId);
    mettreAJourCarteResumeHoraireV2(horaire);

    // 🆕 (10 jan 2026) : Rafraîchir le dropdown horaires dans Groupe-cours
    populerDropdownsAssemblageV2();

    // Mettre à jour le guide groupe-cours
    mettreAJourGuideGroupeCours();
}

/**
 * Supprime l'horaire en cours d'édition
 * Beta 95.2 - Les horaires changent à chaque trimestre, pas de banque nécessaire
 */
function supprimerHoraireV2() {
    if (!horaireEnEditionId) {
        afficherNotificationErreur('Aucun horaire sélectionné');
        return;
    }

    const cleHoraires = cle('horaires');
    let horaires = db.getSync(cleHoraires, []);
    const horaire = horaires.find(h => h.id === horaireEnEditionId);

    if (!horaire) {
        afficherNotificationErreur('Horaire introuvable');
        return;
    }

    // Confirmation
    const nomHoraire = horaire.nom || 'cet horaire';
    if (!confirm(`Supprimer l'horaire "${nomHoraire}" ?\n\nCette action est irréversible.`)) {
        return;
    }

    // Supprimer de la liste
    horaires = horaires.filter(h => h.id !== horaireEnEditionId);
    db.setSync(cleHoraires, horaires);

    // 🆕 FIX (22 jan 2026) : Resynchroniser horaireHebdo après suppression
    const toutesSeances = [];
    const joursDejaVus = new Set();
    horaires.forEach(h => {
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
    const cleHoraireHebdo = cle('horaireHebdo');
    db.setSync(cleHoraireHebdo, toutesSeances);
    if (typeof genererCalendrierComplet === 'function') {
        genererCalendrierComplet();
    }

    // Effacer la sélection sauvegardée
    db.setSync('horaireSelectionne', null);

    // Réinitialiser l'interface
    horaireEnEditionId = null;
    afficherEtatVideHoraireV2();
    populerDropdownHorairesV2();
    mettreAJourCarteResumeHoraireV2(null);

    // 🆕 (10 jan 2026) : Rafraîchir le dropdown horaires dans Groupe-cours
    populerDropdownsAssemblageV2();

    // Mettre à jour le guide groupe-cours
    mettreAJourGuideGroupeCours();

    afficherNotificationSucces(`Horaire "${nomHoraire}" supprimé`);
}
window.supprimerHoraireV2 = supprimerHoraireV2;

/**
 * Met à jour les champs de séances selon le nombre sélectionné
 * 🆕 (10 jan 2026) : Ajout du champ Local par séance
 */
function mettreAJourSeancesHoraireV2() {
    const conteneur = document.getElementById('v2-hor-seances');
    const nbSeances = parseInt(document.getElementById('v2-hor-nbSeances')?.value) || 2;
    const periodesParSeance = parseInt(document.getElementById('v2-hor-periodesParSeance')?.value) || 2;

    // Mettre à jour le résumé du format
    const totalPeriodes = nbSeances * periodesParSeance;
    const resumeElem = document.getElementById('v2-hor-formatResume');
    if (resumeElem) {
        resumeElem.textContent = `${nbSeances} séance(s) × ${periodesParSeance} période(s) = ${totalPeriodes} périodes/semaine`;
    }

    if (!conteneur) return;

    const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
    let html = '';

    for (let i = 0; i < nbSeances; i++) {
        const jourDefaut = jours[i % jours.length];
        html += `
            <div class="seance-horaire-ligne">
                <label>Séance ${i + 1}</label>
                <select id="v2-hor-seance-${i}-jour" class="controle-form">
                    ${jours.map(j => `<option value="${j}" ${j === jourDefaut ? 'selected' : ''}>${j}</option>`).join('')}
                </select>
                <input type="time" id="v2-hor-seance-${i}-debut" class="controle-form" value="08:00">
                <span>à</span>
                <input type="time" id="v2-hor-seance-${i}-fin" class="controle-form" value="10:00">
                <input type="text" id="v2-hor-seance-${i}-local" class="controle-form" placeholder="Local" style="width: 80px;">
            </div>
        `;
    }

    conteneur.innerHTML = html;
}

/**
 * Calcule l'heure de fin à partir de l'heure de début et du nombre de périodes
 */
function calculerHeureFin(heureDebut, nbPeriodes) {
    if (!heureDebut) return '';
    const dureePeriode = parseInt(document.getElementById('v2-dureePeriode')?.value) || 55;
    const [h, m] = heureDebut.split(':').map(Number);
    const totalMinutes = h * 60 + m + (nbPeriodes * dureePeriode);
    const heures = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(heures).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

// Exports globaux pour les fonctions horaire
window.nouveauHoraireV2 = nouveauHoraireV2;
window.changerHoraireSelectionneV2 = changerHoraireSelectionneV2;
window.annulerFormHoraireV2 = annulerFormHoraireV2;
window.sauvegarderHoraireV2 = sauvegarderHoraireV2;
window.mettreAJourSeancesHoraireV2 = mettreAJourSeancesHoraireV2;
window.chargerHorairesV2 = chargerHorairesV2;

/* ===============================
   GESTION DES GROUPE-COURS (Beta 95.2)
   Assemblage final des entités
   =============================== */

// Variable pour tracker le groupe-cours en édition
let groupeCoursEnEditionId = null;

/**
 * Charge et initialise l'accordéon Groupe-cours
 */
function chargerGroupeCoursV2() {
    populerDropdownGroupeCoursV2();
    populerDropdownsAssemblageV2();
    afficherEnseignantGroupeCoursV2();

    // ✅ CORRIGÉ (8 janvier 2026) : Restaurer depuis groupeCoursActif au lieu d'afficher vide
    const gcActif = db.getSync('groupeCoursActif', null);
    if (gcActif && gcActif.id) {
        // Trouver le groupe-cours dans la liste pour avoir les données à jour
        const cleGC = cle('groupesCours');
        const groupesCours = db.getSync(cleGC, []);
        const gc = groupesCours.find(g => g.id === gcActif.id);

        if (gc) {
            // Restaurer la sélection et afficher les détails
            const select = document.getElementById('v2-selectGroupeCours');
            if (select) select.value = gc.id;
            mettreAJourCarteResumeGroupeCoursV2(gc);
            editerGroupeCoursV2(gc);
        } else {
            mettreAJourCarteResumeGroupeCoursV2(null);
        }
    } else {
        mettreAJourCarteResumeGroupeCoursV2(null);
    }

    // Synchroniser le dropdown dans l'en-tête de l'application
    if (typeof peuplerDropdownGroupeCoursActif === 'function') {
        peuplerDropdownGroupeCoursActif();
    }
}

/**
 * Affiche l'aide pour la création d'un groupe-cours
 * Beta 95.2 (8 jan 2026)
 */
function ouvrirAideGroupeCours() {
    alert(
        "Comment créer un groupe-cours ?\n\n" +
        "Un groupe-cours associe 4 éléments pour créer une instance d'enseignement :\n\n" +
        "1. COURS : Le cours que tu enseignes (ex: 601-101-MQ)\n" +
        "   → Crée-le d'abord dans la section « Cours »\n\n" +
        "2. GROUPE D'ÉTUDIANTS : Le numéro de groupe (ex: 00001)\n" +
        "   → Importe tes étudiants dans la section « Groupe d'étudiants »\n\n" +
        "3. HORAIRE : Les jours et heures de cours\n" +
        "   → Crée-le dans la section « Horaire »\n\n" +
        "4. ENSEIGNANT·E : Le responsable du cours\n" +
        "   → Configuré dans la section « Enseignant·e »\n\n" +
        "Clique sur « + Nouveau groupe-cours » puis sélectionne chaque élément dans les 4 menus déroulants."
    );
}
window.ouvrirAideGroupeCours = ouvrirAideGroupeCours;

/**
 * Peuple le dropdown des groupe-cours existants
 */
function populerDropdownGroupeCoursV2() {
    const select = document.getElementById('v2-selectGroupeCours');
    if (!select) return;

    const cleGC = cle('groupesCours');
    const groupesCours = db.getSync(cleGC, []);

    // Sauvegarder la valeur actuelle pour la restaurer après repopulation
    const valeurActuelle = select.value;

    let html = '<option value="">— Choisir pour modifier —</option>';
    groupesCours.forEach(gc => {
        html += `<option value="${gc.id}">${gc.nom || gc.id}</option>`;
    });
    select.innerHTML = html;

    // Restaurer la sélection si elle existait
    if (valeurActuelle) {
        select.value = valeurActuelle;
    }
    // Note: La restauration depuis groupeCoursActif est gérée par chargerGroupeCoursV2()
}

/**
 * Peuple les dropdowns du formulaire d'assemblage (5 éléments Beta 95.2)
 */
function populerDropdownsAssemblageV2() {
    // Beta 95.2: Dropdown Trimestres
    const selectTrimestre = document.getElementById('v2-gc-trimestre');
    if (selectTrimestre) {
        const trimestres = db.getSync('trimestres', []);
        const trimestreActif = db.getSync('trimestreActif', '');

        let html = '<option value="">— Choisir un trimestre —</option>';
        trimestres.forEach(t => {
            const nom = t.nom || t.id || 'Sans nom';
            const selected = (t.id === trimestreActif) ? ' selected' : '';
            html += `<option value="${t.id}"${selected}>${nom}</option>`;
        });
        selectTrimestre.innerHTML = html;
    }

    // Dropdown Cours
    const selectCours = document.getElementById('v2-gc-cours');
    if (selectCours) {
        const cours = db.getSync('cours', []);

        let html = '<option value="">— Choisir un cours —</option>';
        cours.forEach(c => {
            const code = c.codeCours || c.sigle || c.code || '';
            const nom = c.nomCours || c.nom || c.titre || '';
            let label = code ? `${code}${nom ? ' - ' + nom : ''}` : nom;
            if (!label) label = `Cours ${c.id || 'inconnu'}`;
            html += `<option value="${c.id}">${label}</option>`;
        });
        selectCours.innerHTML = html;
    }

    // Dropdown Groupes d'étudiants
    const selectGroupe = document.getElementById('v2-gc-groupe');
    if (selectGroupe) {
        const cleEtud = cle('groupeEtudiants');
        const etudiants = db.getSync(cleEtud, []);

        // Extraire les groupes uniques
        const groupesSet = new Set();
        etudiants.forEach(e => {
            if (e.groupe) {
                groupesSet.add(String(e.groupe).padStart(5, '0'));
            }
        });

        const groupesTries = Array.from(groupesSet).sort();
        let html = '<option value="">— Choisir un groupe —</option>';
        groupesTries.forEach(grp => {
            const nbEtudiants = etudiants.filter(e => String(e.groupe).padStart(5, '0') === grp).length;
            html += `<option value="${grp}">${grp} (${nbEtudiants} étud.)</option>`;
        });
        selectGroupe.innerHTML = html;
    }

    // Beta 95.2: Dropdown Horaires
    const selectHoraire = document.getElementById('v2-gc-horaire');
    if (selectHoraire) {
        const cleHoraires = cle('horaires');
        const horaires = db.getSync(cleHoraires, []);
        let html = '<option value="">— Choisir un horaire —</option>';
        horaires.forEach(h => {
            const nom = h.nom || h.id || 'Sans nom';
            html += `<option value="${h.id}">${nom}</option>`;
        });
        selectHoraire.innerHTML = html;
    }

    // Beta 95.2: Dropdown Enseignants (maintenant depuis liste unifiée)
    const selectEnseignant = document.getElementById('v2-gc-enseignant');
    if (selectEnseignant) {
        const enseignants = db.getSync('enseignants', []);

        let html = '<option value="">— Choisir un enseignant —</option>';
        enseignants.forEach(e => {
            const nomComplet = `${e.prenom || ''} ${e.nom || ''}`.trim() || e.id;
            html += `<option value="${e.id}">${nomComplet}</option>`;
        });
        selectEnseignant.innerHTML = html;
    }

    // Beta 95.3: Dropdown Pratiques de notation (alignement Primo)
    // ✅ FIX (10 jan 2026) : N'affiche que les pratiques dans la sidebar (dansBibliotheque !== false)
    const selectPratique = document.getElementById('v2-gc-pratique');
    if (selectPratique) {
        // Les pratiques sont stockées dans 'pratiquesConfigurables' (module pratiques-materiel.js)
        const toutesPratiques = db.getSync('pratiquesConfigurables', []);
        // Filtrer pour n'afficher que les pratiques dans la sidebar
        const pratiques = toutesPratiques.filter(p => p.dansBibliotheque !== false);

        let html = '<option value="">— À compléter quand configurée —</option>';
        pratiques.forEach(p => {
            const nom = p.nom || p.id || 'Sans nom';
            html += `<option value="${p.id}">${nom}</option>`;
        });
        selectPratique.innerHTML = html;
    }
}

/**
 * Affiche le nom de l'enseignant (profil unique)
 */
function afficherEnseignantGroupeCoursV2() {
    const elem = document.getElementById('v2-gc-enseignantNom');
    if (!elem) return;

    const profil = db.getSync('profilEnseignant', {});
    if (profil.prenom && profil.nom) {
        elem.textContent = `${profil.prenom} ${profil.nom}`;
    } else {
        elem.textContent = '(Non configuré)';
    }
}

/**
 * Génère le nom du groupe-cours à partir des sélections
 * Format: H2026-601-101-MQ-00001 (Mer-PM / Ven-AM)
 */
function genererNomGroupeCoursV2() {
    // Beta 95.2: Trimestre sélectionné dans le dropdown (ou actif par défaut)
    const trimestreSelectionne = document.getElementById('v2-gc-trimestre')?.value;
    const trimestres = db.getSync('trimestres', []);
    const trimestre = trimestres.find(t => t.id === trimestreSelectionne)
        || (typeof obtenirTrimestreActif === 'function' ? obtenirTrimestreActif() : null);

    let trimestreNom = '';
    if (trimestre) {
        const sessionLettre = { 'hiver': 'H', 'automne': 'A', 'ete': 'E' }[trimestre.session] || trimestre.session?.charAt(0)?.toUpperCase() || '';
        trimestreNom = `${sessionLettre}${trimestre.annee}`;
    }

    // Cours sélectionné
    const coursId = document.getElementById('v2-gc-cours')?.value;
    let codeCours = '';
    if (coursId) {
        const cours = db.getSync('cours', []);
        const coursObj = cours.find(c => c.id === coursId || c.sigle === coursId || c.codeCours === coursId || c.code === coursId);
        codeCours = coursObj?.codeCours || coursObj?.sigle || coursObj?.code || '';
    }

    // Groupe d'étudiants
    const groupeNum = document.getElementById('v2-gc-groupe')?.value || '';

    // Horaire sélectionné
    const horaireId = document.getElementById('v2-gc-horaire')?.value;
    let horaireResume = '';
    if (horaireId) {
        const cleHoraires = cle('horaires');
        const horaires = db.getSync(cleHoraires, []);
        const horaire = horaires.find(h => h.id === horaireId);

        if (horaire?.seances && horaire.seances.length > 0) {
            const seancesAbregees = horaire.seances.map(s => {
                const jourAbrege = abrevierJour(s.jour);
                const periode = obtenirPeriodeJournee(s.heureDebut);
                return `${jourAbrege}-${periode}`;
            });
            horaireResume = seancesAbregees.join(' / ');
        }
    }

    // Assembler le nom
    let nom = '';
    if (trimestreNom) nom += trimestreNom;
    if (codeCours) nom += (nom ? '-' : '') + codeCours;
    if (groupeNum) nom += (nom ? '-' : '') + groupeNum;
    if (horaireResume) nom += ` (${horaireResume})`;

    return nom || '—';
}

/**
 * Abrège le nom du jour
 */
function abrevierJour(jour) {
    const abreviations = {
        'Lundi': 'Lun', 'Mardi': 'Mar', 'Mercredi': 'Mer',
        'Jeudi': 'Jeu', 'Vendredi': 'Ven', 'Samedi': 'Sam', 'Dimanche': 'Dim'
    };
    return abreviations[jour] || jour?.substring(0, 3) || '';
}

/**
 * Détermine AM ou PM selon l'heure
 */
function obtenirPeriodeJournee(heure) {
    if (!heure) return '';
    const [h] = heure.split(':').map(Number);
    return h < 12 ? 'AM' : 'PM';
}

/**
 * Met à jour l'aperçu du nom généré et l'horaire associé
 */
function mettreAJourNomGroupeCoursV2() {
    // Chercher l'horaire associé au groupe sélectionné
    const groupeNum = document.getElementById('v2-gc-groupe')?.value;
    const horaireHidden = document.getElementById('v2-gc-horaire');
    const horaireNomSpan = document.getElementById('v2-gc-horaireNom');
    const horaireContainer = document.getElementById('v2-gc-horaireInfo');

    if (groupeNum) {
        const cleHoraires = cle('horaires');
        const horaires = db.getSync(cleHoraires, []);
        const horaireAssocie = horaires.find(h => h.groupeAssocie === groupeNum);

        if (horaireAssocie) {
            // Horaire trouvé
            if (horaireHidden) horaireHidden.value = horaireAssocie.id;
            if (horaireNomSpan) horaireNomSpan.textContent = horaireAssocie.nom || 'Sans nom';
            if (horaireContainer) horaireContainer.classList.remove('sans-horaire');
        } else {
            // Aucun horaire pour ce groupe
            if (horaireHidden) horaireHidden.value = '';
            if (horaireNomSpan) horaireNomSpan.textContent = 'Aucun horaire pour ce groupe';
            if (horaireContainer) horaireContainer.classList.add('sans-horaire');
        }
    } else {
        // Aucun groupe sélectionné
        if (horaireHidden) horaireHidden.value = '';
        if (horaireNomSpan) horaireNomSpan.textContent = '— Sélectionne un groupe —';
        if (horaireContainer) horaireContainer.classList.remove('sans-horaire');
    }

    // Mettre à jour le nom généré
    const elem = document.getElementById('v2-nomGroupeCoursGenere');
    if (elem) {
        elem.textContent = genererNomGroupeCoursV2();
    }
}

/**
 * Appelé quand on change le groupe-cours sélectionné
 */
function changerGroupeCoursSelectionneV2(gcId) {
    const btnSupprimer = document.getElementById('v2-btnSupprimerGroupeCours');

    if (!gcId) {
        mettreAJourCarteResumeGroupeCoursV2(null);
        afficherEtatVideGroupeCoursV2();
        if (btnSupprimer) btnSupprimer.classList.add('u-hide');
        return;
    }

    const cleGC = cle('groupesCours');
    const groupesCours = db.getSync(cleGC, []);
    const gc = groupesCours.find(g => g.id === gcId);

    if (gc) {
        mettreAJourCarteResumeGroupeCoursV2(gc);
        editerGroupeCoursV2(gc);
        // Afficher le bouton supprimer quand un groupe-cours est sélectionné
        if (btnSupprimer) btnSupprimer.classList.remove('u-hide');
    }
}

/**
 * Met à jour la carte résumé du groupe-cours
 */
function mettreAJourCarteResumeGroupeCoursV2(gc) {
    const carte = document.getElementById('v2-carteResumeGroupeCours');
    if (!carte) return;

    if (!gc) {
        carte.innerHTML = '<p class="etat-vide-resume">Aucun groupe-cours sélectionné</p>';
        return;
    }

    // Récupérer les infos liées
    const cours = db.getSync('cours', []);
    const coursObj = cours.find(c => c.id === gc.coursId || c.sigle === gc.coursId || c.codeCours === gc.coursId || c.code === gc.coursId);
    const coursNom = coursObj ? (coursObj.codeCours || coursObj.sigle || coursObj.code || '') + ' - ' + (coursObj.nomCours || coursObj.nom || coursObj.titre || '') : '—';

    const cleHoraires = cle('horaires');
    const horaires = db.getSync(cleHoraires, []);
    const horaireObj = horaires.find(h => h.id === gc.horaireId);
    const horaireNom = horaireObj?.nom || '—';

    // Beta 95.2: Récupérer l'enseignant selon enseignantId
    let enseignantNom = '—';
    if (gc.enseignantId === 'profil') {
        const profil = db.getSync('profilEnseignant', {});
        enseignantNom = (profil.prenom && profil.nom) ? `${profil.prenom} ${profil.nom}` : '—';
    } else if (gc.enseignantId) {
        const enseignants = db.getSync('enseignants', []);
        const ensObj = enseignants.find(e => e.id === gc.enseignantId);
        enseignantNom = ensObj ? `${ensObj.prenom || ''} ${ensObj.nom || ''}`.trim() : '—';
    } else {
        // Fallback sur le profil unique si pas d'enseignantId
        const profil = db.getSync('profilEnseignant', {});
        enseignantNom = (profil.prenom && profil.nom) ? `${profil.prenom} ${profil.nom}` : '—';
    }

    // Beta 95.3 : Score de complétude (5 éléments)
    let score = 0;
    if (gc.coursId && coursObj) score++;
    if (gc.groupeNum || gc.groupe) score++;
    if (gc.horaireId && horaireObj) score++;
    if (gc.enseignantId) score++;
    if (gc.pratiqueId) score++;

    const estComplet = score === 5;
    const classeCompletude = estComplet ? 'complet' : 'incomplet';
    const texteCompletude = estComplet ? 'Complet' : `${score}/5 configurés`;

    carte.innerHTML = `
        <div class="resume-gc-nom">${gc.nom || gc.id}</div>
        <div class="resume-gc-details">
            <div><span class="label-gc">Cours</span><span>${coursNom}</span></div>
            <div><span class="label-gc">Groupe</span><span>${gc.groupeNum || gc.groupe || '—'}</span></div>
            <div><span class="label-gc">Horaire</span><span>${horaireNom}</span></div>
            <div><span class="label-gc">Enseig.</span><span>${enseignantNom}</span></div>
        </div>
        <div class="score-completude ${classeCompletude}">
            <span class="score-valeur">${texteCompletude}</span>
        </div>
    `;
}

/**
 * Affiche l'état vide du formulaire
 */
function afficherEtatVideGroupeCoursV2() {
    const etatVide = document.getElementById('v2-groupeCoursEtatVide');
    const formulaire = document.getElementById('v2-formulaireGroupeCours');

    if (etatVide) etatVide.classList.remove('u-hide');
    if (formulaire) formulaire.classList.add('u-hide');
    groupeCoursEnEditionId = null;
}

/**
 * Affiche le trimestre actif dans le formulaire groupe-cours
 */
function afficherTrimestreGroupeCoursV2() {
    const elem = document.getElementById('v2-gc-trimestreNom');
    if (!elem) return;

    const trimestre = typeof obtenirTrimestreActif === 'function' ? obtenirTrimestreActif() : null;

    if (trimestre) {
        const sessionNom = {
            'hiver': 'Hiver',
            'automne': 'Automne',
            'ete': 'Été'
        }[trimestre.session] || trimestre.session || '';

        elem.textContent = `${sessionNom} ${trimestre.annee}`;
    } else {
        elem.textContent = '(Aucun trimestre actif)';
    }
}

/**
 * Affiche le formulaire pour un nouveau groupe-cours
 */
function nouveauGroupeCoursV2() {
    groupeCoursEnEditionId = null;

    // Afficher le trimestre actif
    afficherTrimestreGroupeCoursV2();

    // Rafraîchir les dropdowns
    populerDropdownsAssemblageV2();
    afficherEnseignantGroupeCoursV2();

    // Réinitialiser les sélections
    const selectCours = document.getElementById('v2-gc-cours');
    const selectGroupe = document.getElementById('v2-gc-groupe');
    const horaireHidden = document.getElementById('v2-gc-horaire');
    const horaireNom = document.getElementById('v2-gc-horaireNom');
    const selectPratique = document.getElementById('v2-gc-pratique');  // Beta 95.3

    if (selectCours) selectCours.value = '';
    if (selectGroupe) selectGroupe.value = '';
    if (horaireHidden) horaireHidden.value = '';
    if (horaireNom) horaireNom.textContent = '— Sélectionne un groupe —';
    if (selectPratique) selectPratique.value = '';  // Beta 95.3

    // Mettre à jour le titre et bouton
    const titre = document.getElementById('v2-titreFormGroupeCours');
    const btnTexte = document.getElementById('v2-btnTexteGroupeCours');
    if (titre) titre.textContent = 'Nouveau groupe-cours';
    if (btnTexte) btnTexte.textContent = 'Créer';

    // Mettre à jour l'aperçu du nom
    mettreAJourNomGroupeCoursV2();

    // Afficher le formulaire
    const etatVide = document.getElementById('v2-groupeCoursEtatVide');
    const formulaire = document.getElementById('v2-formulaireGroupeCours');
    if (etatVide) etatVide.classList.add('u-hide');
    if (formulaire) formulaire.classList.remove('u-hide');

    // Masquer le bouton Supprimer (mode création)
    const btnSupprimer = document.getElementById('v2-btnSupprimerGroupeCours');
    if (btnSupprimer) btnSupprimer.classList.add('u-hide');

    // Désélectionner dans le dropdown principal
    const select = document.getElementById('v2-selectGroupeCours');
    if (select) select.value = '';
    mettreAJourCarteResumeGroupeCoursV2(null);
}

/**
 * Charge un groupe-cours dans le formulaire pour édition
 */
function editerGroupeCoursV2(gc) {
    groupeCoursEnEditionId = gc.id;

    // Rafraîchir les dropdowns
    populerDropdownsAssemblageV2();

    // Remplir les 6 sélections (Beta 95.3: +pratique)
    const selectTrimestre = document.getElementById('v2-gc-trimestre');
    const selectCours = document.getElementById('v2-gc-cours');
    const selectGroupe = document.getElementById('v2-gc-groupe');
    const selectHoraire = document.getElementById('v2-gc-horaire');
    const selectEnseignant = document.getElementById('v2-gc-enseignant');
    const selectPratique = document.getElementById('v2-gc-pratique');  // Beta 95.3

    // Trimestre: utiliser celui du groupe-cours ou le trimestre actif par défaut
    if (selectTrimestre) {
        selectTrimestre.value = gc.trimestreId || db.getSync('trimestreActif', '') || '';
    }
    if (selectCours) selectCours.value = gc.coursId || '';
    if (selectGroupe) selectGroupe.value = gc.groupeNum || gc.groupe || '';
    if (selectHoraire) selectHoraire.value = gc.horaireId || '';
    if (selectEnseignant) selectEnseignant.value = gc.enseignantId || '';
    if (selectPratique) selectPratique.value = gc.pratiqueId || '';  // Beta 95.3

    // Mettre à jour le titre et bouton
    const titre = document.getElementById('v2-titreFormGroupeCours');
    const btnTexte = document.getElementById('v2-btnTexteGroupeCours');
    if (titre) titre.textContent = 'Modifier le groupe-cours';
    if (btnTexte) btnTexte.textContent = 'Enregistrer';

    // Mettre à jour l'aperçu du nom
    mettreAJourNomGroupeCoursV2();

    // Afficher le formulaire
    const etatVide = document.getElementById('v2-groupeCoursEtatVide');
    const formulaire = document.getElementById('v2-formulaireGroupeCours');
    if (etatVide) etatVide.classList.add('u-hide');
    if (formulaire) formulaire.classList.remove('u-hide');

    // Afficher le bouton Supprimer (mode édition)
    const btnSupprimer = document.getElementById('v2-btnSupprimerGroupeCours');
    if (btnSupprimer) btnSupprimer.style.display = '';
}

/**
 * Annule le formulaire groupe-cours
 */
function annulerFormGroupeCoursV2() {
    afficherEtatVideGroupeCoursV2();

    const select = document.getElementById('v2-selectGroupeCours');
    if (select) select.value = '';
    mettreAJourCarteResumeGroupeCoursV2(null);
}

/**
 * Sauvegarde le groupe-cours (ajout ou modification)
 */
function sauvegarderGroupeCoursV2() {
    const trimestreId = document.getElementById('v2-gc-trimestre')?.value;  // Beta 95.2
    const coursId = document.getElementById('v2-gc-cours')?.value;
    const groupeNum = document.getElementById('v2-gc-groupe')?.value;
    const horaireId = document.getElementById('v2-gc-horaire')?.value;
    const enseignantId = document.getElementById('v2-gc-enseignant')?.value;
    const pratiqueId = document.getElementById('v2-gc-pratique')?.value || null;  // Beta 95.3

    // Validation (5 éléments requis)
    if (!trimestreId) {
        afficherNotificationErreur('Veuillez sélectionner un trimestre');
        return;
    }
    if (!coursId) {
        afficherNotificationErreur('Veuillez sélectionner un cours');
        return;
    }
    if (!groupeNum) {
        afficherNotificationErreur('Veuillez sélectionner un groupe d\'étudiants');
        return;
    }
    if (!horaireId) {
        afficherNotificationErreur('Veuillez sélectionner un horaire');
        return;
    }
    if (!enseignantId) {
        afficherNotificationErreur('Veuillez sélectionner un enseignant');
        return;
    }

    // Générer le nom
    const nom = genererNomGroupeCoursV2();

    const cleGC = cle('groupesCours');
    let groupesCours = db.getSync(cleGC, []);

    if (groupeCoursEnEditionId) {
        // Modification
        const index = groupesCours.findIndex(g => g.id === groupeCoursEnEditionId);
        if (index >= 0) {
            groupesCours[index] = {
                ...groupesCours[index],
                nom,
                trimestreId,  // Beta 95.2
                coursId,
                groupeNum,
                horaireId,
                enseignantId,
                pratiqueId,   // Beta 95.3
                dateModification: new Date().toISOString()
            };
        }
        afficherNotificationSucces('Groupe-cours modifié');
    } else {
        // Ajout
        const nouveauGC = {
            id: genererIdUnique('GC_'),
            nom,
            trimestreId,  // Beta 95.2
            coursId,
            groupeNum,
            horaireId,
            enseignantId,
            pratiqueId,   // Beta 95.3
            dateCreation: new Date().toISOString(),
            actif: true
        };
        groupesCours.push(nouveauGC);
        groupeCoursEnEditionId = nouveauGC.id;
        afficherNotificationSucces('Groupe-cours créé');
    }

    db.setSync(cleGC, groupesCours);

    // Rafraîchir l'interface
    populerDropdownGroupeCoursV2();
    const select = document.getElementById('v2-selectGroupeCours');
    if (select) select.value = groupeCoursEnEditionId;

    const gc = groupesCours.find(g => g.id === groupeCoursEnEditionId);
    mettreAJourCarteResumeGroupeCoursV2(gc);

    // Mettre à jour le dropdown dans l'en-tête de l'application
    if (typeof peuplerDropdownGroupeCoursActif === 'function') {
        peuplerDropdownGroupeCoursActif();
    }

    // Mettre à jour le guide groupe-cours
    mettreAJourGuideGroupeCours();
}

/**
 * Supprime le groupe-cours actuellement sélectionné
 * Beta 95.2 (8 jan 2026)
 */
function supprimerGroupeCoursV2() {
    if (!groupeCoursEnEditionId) {
        console.warn('[Trimestre V2] Aucun groupe-cours sélectionné pour suppression');
        return;
    }

    const cleGC = cle('groupesCours');
    const groupesCours = db.getSync(cleGC, []);
    const gc = groupesCours.find(g => g.id === groupeCoursEnEditionId);

    if (!gc) {
        console.warn('[Trimestre V2] Groupe-cours non trouvé:', groupeCoursEnEditionId);
        return;
    }

    // Confirmation
    const nomGC = gc.nom || gc.id;
    if (!confirm(`Supprimer le groupe-cours "${nomGC}" ?\n\nCette action est irréversible.`)) {
        return;
    }

    // Supprimer de la liste
    const groupesCoursFiltre = groupesCours.filter(g => g.id !== groupeCoursEnEditionId);
    db.setSync(cleGC, groupesCoursFiltre);

    // Si c'était le groupe-cours actif, le désactiver
    const gcActifId = db.getSync('groupeCoursActif', null);
    if (gcActifId === groupeCoursEnEditionId) {
        db.setSync('groupeCoursActif', null);
    }

    console.log('[Trimestre V2] Groupe-cours supprimé:', groupeCoursEnEditionId);

    // Réinitialiser l'interface
    groupeCoursEnEditionId = null;
    chargerGroupeCoursV2();
    afficherEtatVideGroupeCoursV2();
    mettreAJourCarteResumeGroupeCoursV2(null);

    // Masquer le bouton supprimer
    const btnSupprimer = document.getElementById('v2-btnSupprimerGroupeCours');
    if (btnSupprimer) btnSupprimer.classList.add('u-hide');

    // Rafraîchir le dropdown header
    if (typeof peuplerDropdownGroupeCoursActif === 'function') {
        peuplerDropdownGroupeCoursActif();
    }

    // Notification
    if (typeof afficherNotificationSucces === 'function') {
        afficherNotificationSucces('Groupe-cours supprimé', nomGC);
    }
}

/**
 * 🆕 Beta 95.3 : Modal bibliothèque groupe-cours
 * 🔄 (10 jan 2026) : Refonte avec sections "Dans le dropdown" / "Masqués"
 * Affiche la liste de tous les groupe-cours avec gestion de la visibilité
 */
function ouvrirModalBibliothequeGroupeCours() {
    const cleGC = cle('groupesCours');
    const groupesCours = db.getSync(cleGC, []);
    const gcActif = db.getSync('groupeCoursActif', null);

    // Récupérer les entités liées pour l'affichage
    const cours = db.getSync('cours', []);
    const enseignants = db.getSync('enseignants', []);
    const cleHoraires = cle('horaires');
    const horaires = db.getSync(cleHoraires, []);

    // Séparer les groupe-cours visibles et masqués
    const gcVisibles = groupesCours.filter(gc => gc.dansSidebar !== false);
    const gcMasques = groupesCours.filter(gc => gc.dansSidebar === false);

    // Helper pour générer une carte groupe-cours
    function genererCarteGC(gc, estMasque) {
        const coursInfo = cours.find(c => c.id === gc.coursId);
        const ens = enseignants.find(e => e.id === gc.enseignantId);
        const hor = horaires.find(h => h.id === gc.horaireId);

        const codeCours = coursInfo?.codeCours || coursInfo?.sigle || null;
        const groupe = gc.groupe || gc.groupeNum || '00001';
        const titre = codeCours ? `${codeCours} — Groupe ${groupe}` : `Groupe ${groupe}`;
        const nomEns = ens ? `${ens.prenom || ''} ${ens.nom || ''}`.trim() : '';
        const nomHor = hor?.nom || '';

        const estActif = gcActif && gc.id === gcActif.id;
        const badgeActif = estActif ? '<span style="background: var(--vert-principal); color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; margin-left: 10px;">Actif</span>' : '';

        const borderColor = estActif ? 'var(--vert-principal)' : (estMasque ? '#ccc' : 'var(--bleu-clair)');
        const bgColor = estActif ? 'rgba(76, 175, 80, 0.05)' : (estMasque ? '#f9f9f9' : 'var(--bleu-tres-pale)');

        let sousInfo = [];
        if (nomEns) sousInfo.push(nomEns);
        if (nomHor) sousInfo.push(nomHor);

        return `
            <div style="
                border: 1px solid ${borderColor};
                border-radius: 8px;
                padding: 15px;
                margin-bottom: 10px;
                background: ${bgColor};
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                    <div style="flex: 1; min-width: 200px;">
                        <div style="font-weight: 600; color: var(--accent-primaire);">
                            ${titre}${badgeActif}
                        </div>
                        ${sousInfo.length > 0 ? `
                            <div style="font-size: 0.85rem; color: var(--gris-moyen); margin-top: 3px;">
                                ${sousInfo.join(' • ')}
                            </div>
                        ` : ''}
                    </div>
                    <div style="display: flex; gap: 8px;">
                        ${estMasque ? `
                            <button onclick="afficherGroupeCoursDepuisBibliotheque('${gc.id}')"
                                    class="btn btn-confirmer btn-sm"
                                    title="Afficher dans le dropdown">
                                Afficher
                            </button>
                        ` : `
                            ${!estActif ? `
                                <button onclick="activerGroupeCoursDepuisBibliotheque('${gc.id}')"
                                        class="btn btn-confirmer btn-sm"
                                        title="Activer ce groupe-cours">
                                    Activer
                                </button>
                            ` : ''}
                            <button onclick="masquerGroupeCoursDepuisBibliotheque('${gc.id}')"
                                    class="btn btn-secondaire btn-sm"
                                    title="Masquer du dropdown">
                                Masquer
                            </button>
                        `}
                        <button onclick="supprimerGroupeCoursDepuisBibliotheque('${gc.id}', '${titre.replace(/'/g, "\\'")}')"
                                class="btn btn-supprimer btn-sm"
                                title="Supprimer définitivement">
                                Supprimer
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    let modalHTML = `
        <div id="modalBibliothequeGroupeCours" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        ">
            <div style="
                background: var(--surface-conteneur, #162c36);
                border-radius: 12px;
                width: 90%;
                max-width: 800px;
                max-height: 85vh;
                overflow-y: auto;
                padding: 30px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.3);
                position: relative;
            ">
                <button onclick="fermerModalBibliothequeGroupeCours()" style="
                    position: sticky;
                    top: 0;
                    right: 0;
                    float: right;
                    background: transparent;
                    border: none;
                    font-size: 28px;
                    color: #999;
                    cursor: pointer;
                    padding: 0;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1;
                " onmouseover="this.style.color='#333'" onmouseout="this.style.color='#999'">
                    ×
                </button>
                <h2 style="margin-top: 0; color: var(--accent-primaire);">📚 Bibliothèque groupe-cours</h2>
                <p class="text-muted">Gérez les groupe-cours affichés dans le dropdown de l'en-tête.</p>
    `;

    if (groupesCours.length === 0) {
        modalHTML += `
            <div style="text-align: center; padding: 40px; color: var(--gris-moyen);">
                <p style="font-size: 1.1rem;">Aucun groupe-cours configuré</p>
                <p>Clique sur « + Nouveau groupe-cours » dans l'accordéon pour en créer un.</p>
            </div>
        `;
    } else {
        // Section 1 : Groupe-cours dans le dropdown
        modalHTML += `
            <h3 style="color: var(--bleu-clair); font-size: 1.1rem; margin-top: 20px; margin-bottom: 15px;">
                Groupe-cours dans le dropdown
            </h3>
            <div style="margin-bottom: 30px;">
        `;

        if (gcVisibles.length === 0) {
            modalHTML += `<p style="color: var(--gris-clair); font-style: italic;">Aucun groupe-cours visible dans le dropdown</p>`;
        } else {
            gcVisibles.forEach(gc => {
                modalHTML += genererCarteGC(gc, false);
            });
        }

        modalHTML += `</div>`;

        // Section 2 : Groupe-cours masqués
        if (gcMasques.length > 0) {
            modalHTML += `
                <h3 style="color: #888; font-size: 1.1rem; margin-top: 20px; margin-bottom: 15px;">
                    Groupe-cours masqués
                </h3>
                <div style="margin-bottom: 20px;">
            `;

            gcMasques.forEach(gc => {
                modalHTML += genererCarteGC(gc, true);
            });

            modalHTML += `</div>`;
        }
    }

    modalHTML += `
            </div>
        </div>
    `;

    // Insérer dans le DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Fermer avec Escape
    document.addEventListener('keydown', fermerModalBibliothequeGroupeCoursEscape);
}

function fermerModalBibliothequeGroupeCoursEscape(e) {
    if (e.key === 'Escape') {
        fermerModalBibliothequeGroupeCours();
    }
}

function fermerModalBibliothequeGroupeCours() {
    const modal = document.getElementById('modalBibliothequeGroupeCours');
    if (modal) modal.remove();
    document.removeEventListener('keydown', fermerModalBibliothequeGroupeCoursEscape);
}

function activerGroupeCoursDepuisBibliotheque(gcId) {
    const cleGC = cle('groupesCours');
    const groupesCours = db.getSync(cleGC, []);

    // Désactiver tous les autres
    groupesCours.forEach(gc => gc.actif = (gc.id === gcId));
    db.setSync(cleGC, groupesCours);

    // Sauvegarder comme groupe-cours actif
    const gc = groupesCours.find(g => g.id === gcId);
    if (gc) {
        db.setSync('groupeCoursActif', gc);
    }

    // Rafraîchir
    if (typeof peuplerDropdownGroupeCoursActif === 'function') {
        peuplerDropdownGroupeCoursActif();
    }
    chargerGroupeCoursV2();

    // Rafraîchir la modal
    fermerModalBibliothequeGroupeCours();
    ouvrirModalBibliothequeGroupeCours();

    if (typeof afficherNotificationSucces === 'function') {
        afficherNotificationSucces('Groupe-cours activé');
    }
}

function supprimerGroupeCoursDepuisBibliotheque(gcId, nomGC) {
    if (!confirm(`Supprimer le groupe-cours "${nomGC}" ?\n\nCette action est irréversible.`)) {
        return;
    }

    const cleGC = cle('groupesCours');
    let groupesCours = db.getSync(cleGC, []);

    // Supprimer de la liste
    groupesCours = groupesCours.filter(gc => gc.id !== gcId);
    db.setSync(cleGC, groupesCours);

    // Si c'était le groupe-cours actif, désactiver
    const gcActif = db.getSync('groupeCoursActif', null);
    if (gcActif && gcActif.id === gcId) {
        db.setSync('groupeCoursActif', null);
    }

    // Rafraîchir
    if (typeof peuplerDropdownGroupeCoursActif === 'function') {
        peuplerDropdownGroupeCoursActif();
    }
    chargerGroupeCoursV2();

    // Rafraîchir la modal
    fermerModalBibliothequeGroupeCours();
    if (groupesCours.length > 0) {
        ouvrirModalBibliothequeGroupeCours();
    }

    if (typeof afficherNotificationSucces === 'function') {
        afficherNotificationSucces('Groupe-cours supprimé', nomGC);
    }
}

/**
 * 🆕 (10 jan 2026) : Masquer un groupe-cours du dropdown
 * Le groupe-cours reste dans la base mais n'apparaît plus dans le dropdown
 */
function masquerGroupeCoursDepuisBibliotheque(gcId) {
    const cleGC = cle('groupesCours');
    const groupesCours = db.getSync(cleGC, []);

    const gc = groupesCours.find(g => g.id === gcId);
    if (gc) {
        gc.dansSidebar = false;
        db.setSync(cleGC, groupesCours);

        // Si c'était le groupe-cours actif, le désactiver
        const gcActif = db.getSync('groupeCoursActif', null);
        if (gcActif && gcActif.id === gcId) {
            db.setSync('groupeCoursActif', null);
        }

        // Rafraîchir
        if (typeof peuplerDropdownGroupeCoursActif === 'function') {
            peuplerDropdownGroupeCoursActif();
        }
        chargerGroupeCoursV2();

        // Rafraîchir la modal
        fermerModalBibliothequeGroupeCours();
        ouvrirModalBibliothequeGroupeCours();

        if (typeof afficherNotificationSucces === 'function') {
            afficherNotificationSucces('Groupe-cours masqué');
        }
    }
}

/**
 * 🆕 (10 jan 2026) : Afficher un groupe-cours dans le dropdown
 * Rend visible un groupe-cours précédemment masqué
 */
function afficherGroupeCoursDepuisBibliotheque(gcId) {
    const cleGC = cle('groupesCours');
    const groupesCours = db.getSync(cleGC, []);

    const gc = groupesCours.find(g => g.id === gcId);
    if (gc) {
        gc.dansSidebar = true;
        db.setSync(cleGC, groupesCours);

        // Rafraîchir
        if (typeof peuplerDropdownGroupeCoursActif === 'function') {
            peuplerDropdownGroupeCoursActif();
        }
        chargerGroupeCoursV2();

        // Rafraîchir la modal
        fermerModalBibliothequeGroupeCours();
        ouvrirModalBibliothequeGroupeCours();

        if (typeof afficherNotificationSucces === 'function') {
            afficherNotificationSucces('Groupe-cours affiché');
        }
    }
}

/**
 * FIX #53 (1er fév 2026) : Met à jour les options du dropdown Format horaire
 * en fonction du nombre d'heures/semaine sélectionné
 */
function mettreAJourOptionsFormatHoraire() {
    const inputHeures = document.getElementById('heuresParSemaine');
    const selectFormat = document.getElementById('formatHoraire');

    if (!inputHeures || !selectFormat) return;

    const heures = parseInt(inputHeures.value) || 4;
    const valeurActuelle = selectFormat.value;

    // Trouver tous les diviseurs du nombre d'heures
    const diviseurs = [];
    for (let i = 1; i <= heures; i++) {
        if (heures % i === 0) {
            diviseurs.push(i);
        }
    }

    // Générer les options
    let html = '';
    diviseurs.forEach(d => {
        const periodes = d;
        const heuresParPeriode = heures / d;
        const value = `${periodes}x${heuresParPeriode}`;
        const label = periodes === 1
            ? `1 période de ${heuresParPeriode}h`
            : `${periodes} périodes de ${heuresParPeriode}h`;
        const selected = value === valeurActuelle ? ' selected' : '';
        html += `<option value="${value}"${selected}>${label}</option>`;
    });

    selectFormat.innerHTML = html;

    // Si la valeur actuelle n'existe plus, sélectionner la première option
    if (!selectFormat.value) {
        selectFormat.selectedIndex = 0;
    }

    console.log(`[Trimestre] Format horaire mis à jour pour ${heures}h:`, diviseurs.map(d => `${d}x${heures/d}`));
}

// Export pour le HTML
window.mettreAJourOptionsFormatHoraire = mettreAJourOptionsFormatHoraire;

// Exports globaux pour les fonctions groupe-cours
window.chargerGroupeCoursV2 = chargerGroupeCoursV2;
window.nouveauGroupeCoursV2 = nouveauGroupeCoursV2;
window.changerGroupeCoursSelectionneV2 = changerGroupeCoursSelectionneV2;
window.annulerFormGroupeCoursV2 = annulerFormGroupeCoursV2;
window.sauvegarderGroupeCoursV2 = sauvegarderGroupeCoursV2;
window.mettreAJourNomGroupeCoursV2 = mettreAJourNomGroupeCoursV2;
window.supprimerGroupeCoursV2 = supprimerGroupeCoursV2;
window.ouvrirModalBibliothequeGroupeCours = ouvrirModalBibliothequeGroupeCours; // 🆕 Beta 95.3
window.fermerModalBibliothequeGroupeCours = fermerModalBibliothequeGroupeCours; // 🆕 Beta 95.3
window.activerGroupeCoursDepuisBibliotheque = activerGroupeCoursDepuisBibliotheque; // 🆕 Beta 95.3
window.supprimerGroupeCoursDepuisBibliotheque = supprimerGroupeCoursDepuisBibliotheque; // 🆕 Beta 95.3
window.masquerGroupeCoursDepuisBibliotheque = masquerGroupeCoursDepuisBibliotheque; // 🆕 (10 jan 2026)
window.afficherGroupeCoursDepuisBibliotheque = afficherGroupeCoursDepuisBibliotheque; // 🆕 (10 jan 2026)

// [Chantier 1 — 6 fev 2026] chargerEtatDonneesDemoV2 + basculerDonneesDemoV2 supprimees (demantelement demo)

/* ===============================
   FORMAT HORAIRE DYNAMIQUE (6 jan 2026)
   Génère les options selon le nombre de périodes
   =============================== */

/**
 * Met à jour le dropdown Format horaire selon le nombre de périodes/semaine
 * Génère toutes les combinaisons possibles (diviseurs)
 */
function mettreAJourFormatHoraire() {
    const select = document.getElementById('v2-formatHoraire');
    const info = document.getElementById('v2-formatHoraire-info');
    const inputPeriodes = document.getElementById('v2-periodesParSemaine');

    if (!select || !inputPeriodes) return;

    const totalPeriodes = parseInt(inputPeriodes.value) || 4;
    const valeurActuelle = select.value;

    // Trouver tous les diviseurs du nombre de périodes
    const diviseurs = [];
    for (let i = 1; i <= totalPeriodes; i++) {
        if (totalPeriodes % i === 0) {
            diviseurs.push(i);
        }
    }

    // Générer les options
    let html = '';
    diviseurs.forEach(nbSeances => {
        const periodesParSeance = totalPeriodes / nbSeances;
        const value = `${nbSeances}x${periodesParSeance}`;
        const label = nbSeances === 1
            ? `1 séance de ${periodesParSeance} période${periodesParSeance > 1 ? 's' : ''}`
            : `${nbSeances} séances de ${periodesParSeance} période${periodesParSeance > 1 ? 's' : ''}`;
        html += `<option value="${value}">${label}</option>`;
    });

    select.innerHTML = html;

    // Restaurer la valeur si elle existe toujours
    if ([...select.options].some(opt => opt.value === valeurActuelle)) {
        select.value = valeurActuelle;
    }

    // Afficher la durée en heures/minutes
    mettreAJourInfoDuree();
}

/**
 * Affiche la durée totale en heures/minutes sous le dropdown
 */
function mettreAJourInfoDuree() {
    const info = document.getElementById('v2-formatHoraire-info');
    const inputPeriodes = document.getElementById('v2-periodesParSemaine');

    if (!info || !inputPeriodes) return;

    const totalPeriodes = parseInt(inputPeriodes.value) || 4;

    // Récupérer la durée d'une période (depuis horaire.js ou valeur par défaut)
    const dureePeriode = typeof obtenirDureePeriode === 'function'
        ? obtenirDureePeriode()
        : 55;

    const totalMinutes = totalPeriodes * dureePeriode;
    const heures = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    let texte = `= ${heures}h`;
    if (minutes > 0) texte += `${minutes.toString().padStart(2, '0')}`;
    texte += ` (${totalPeriodes} × ${dureePeriode} min)`;

    info.textContent = texte;
}

/* ===============================
   EXPORTS WINDOW
   =============================== */

// Exposer les fonctions au scope global
window.mettreAJourFormatHoraire = mettreAJourFormatHoraire;
window.mettreAJourInfoDuree = mettreAJourInfoDuree;
window.initialiserTrimestreV2 = initialiserTrimestreV2;
window.chargerCadreCalendrierV2 = chargerCadreCalendrierV2;
window.sauvegarderCadreCalendrierV2 = sauvegarderCadreCalendrierV2;
window.reinitialiserBornesTrimestreV2 = reinitialiserBornesTrimestreV2;
window.reinitialiserSemainesSpecialesV2 = reinitialiserSemainesSpecialesV2;
window.afficherStatistiquesTrimestreV2 = afficherStatistiquesTrimestreV2;
window.chargerEvenementsPrevusV2 = chargerEvenementsPrevusV2;
window.chargerEvenementsImprevusV2 = chargerEvenementsImprevusV2;
window.afficherFormEvenementV2 = afficherFormEvenementV2;
window.modifierEvenementV2 = modifierEvenementV2;
window.supprimerEvenementV2 = supprimerEvenementV2;
window.confirmerEvenementPrevuV2 = confirmerEvenementPrevuV2;
window.annulerFormEvenementPrevuV2 = annulerFormEvenementPrevuV2;
window.confirmerEvenementImprevuV2 = confirmerEvenementImprevuV2;
window.annulerFormEvenementImprevuV2 = annulerFormEvenementImprevuV2;
window.retournerVueV2 = retournerVueV2;
window.populerDropdownTrimestreV2 = populerDropdownTrimestreV2;
window.changerTrimestreActifV2 = changerTrimestreActifV2;
window.ouvrirModalNouveauTrimestre = ouvrirModalNouveauTrimestre;
window.afficherListeTrimestreGestion = afficherListeTrimestreGestion;
window.confirmerArchivage = confirmerArchivage;
window.confirmerDesarchivage = confirmerDesarchivage;
window.afficherFormulaireTrimestreActif = afficherFormulaireTrimestreActif;
window.ouvrirBibliothequeTrimestreV2 = ouvrirBibliothequeTrimestreV2;
window.archiverTrimestreActif = archiverTrimestreActif;
window.supprimerTrimestreActif = supprimerTrimestreActif;
window.chargerDropdownCoursV2 = chargerDropdownCoursV2;
window.changerCoursSelectionneV2 = changerCoursSelectionneV2;
window.viderAffichageCoursV2 = viderAffichageCoursV2;
window.afficherDetailsCoursV2 = afficherDetailsCoursV2;
window.afficherFormCoursV2 = afficherFormCoursV2;
window.nouveauCoursV2 = nouveauCoursV2;
window.supprimerCoursV2 = supprimerCoursV2;
window.modifierCoursSelectionneV2 = modifierCoursSelectionneV2;
window.dupliquerCoursSelectionneV2 = dupliquerCoursSelectionneV2;
window.annulerFormCoursV2 = annulerFormCoursV2;
window.sauvegarderCoursV2 = sauvegarderCoursV2;
window.chargerDropdownPratiquesCours = chargerDropdownPratiquesCours; // ✅ AJOUT (2 jan 2026)
window.afficherSyntheseCours = afficherSyntheseCours; // 🆕 Beta 95.3
window.afficherSyntheseEnseignant = afficherSyntheseEnseignant; // 🆕 Beta 95.3
window.afficherSyntheseGroupeEtudiants = afficherSyntheseGroupeEtudiants; // 🆕 Beta 95.3
window.afficherSyntheseHoraire = afficherSyntheseHoraire; // 🆕 Beta 95.3
window.afficherSyntheseGroupeCours = afficherSyntheseGroupeCours; // 🆕 Beta 95.3
window.ouvrirModalNouveauCours = ouvrirModalNouveauCours;
window.chargerGroupesCoursV2 = chargerGroupesCoursV2;
window.activerGroupeV2 = activerGroupeV2;
window.gererEtudiantsGroupeV2 = gererEtudiantsGroupeV2;
window.ouvrirModalNouveauGroupe = ouvrirModalNouveauGroupe;
window.chargerListeEtudiantsV2 = chargerListeEtudiantsV2;
window.ajouterEtudiantV2 = ajouterEtudiantV2;
window.supprimerEtudiantV2 = supprimerEtudiantV2;
window.editerEtudiantV2 = editerEtudiantV2;
window.actionEtudiantV2 = actionEtudiantV2;
window.remarqueEtudiantV2 = remarqueEtudiantV2;
window.changerStatutEtudiantV2 = changerStatutEtudiantV2;
window.soumettreEtudiantV2 = soumettreEtudiantV2;
window.annulerEditionEtudiantV2 = annulerEditionEtudiantV2;
window.creerNouveauGroupeV2 = creerNouveauGroupeV2;
window.filtrerParGroupeV2 = filtrerParGroupeV2;
window.importerFichierEtudiantsV2 = importerFichierEtudiantsV2;
window.previsualiserDonneesV2 = previsualiserDonneesV2;
window.confirmerImportV2 = confirmerImportV2;
window.annulerImportV2 = annulerImportV2;
window.exporterEtudiantsV2 = exporterEtudiantsV2;
window.reinitialiserEtudiantsV2 = reinitialiserEtudiantsV2;
window.supprimerGroupeSelectionneV2 = supprimerGroupeSelectionneV2;
window.chargerHoraireGroupeActifV2 = chargerHoraireGroupeActifV2;
window.chargerSeancesV2 = chargerSeancesV2;
window.afficherFormSeanceV2 = afficherFormSeanceV2;
window.modifierSeanceV2 = modifierSeanceV2;
window.annulerFormSeanceV2 = annulerFormSeanceV2;
window.confirmerSeanceV2 = confirmerSeanceV2;
window.supprimerSeanceV2 = supprimerSeanceV2;
// [Chantier 1] exports demo supprimes
window.mettreAJourGuideGroupeCours = mettreAJourGuideGroupeCours;

/* ===============================
   GUIDE GROUPE-COURS : INDICATEURS D'ÉTAT
   =============================== */

/**
 * Met à jour les indicateurs d'état du guide groupe-cours
 * Vérifie si chaque étape est complétée : ○ (à faire) → ● (fait)
 */
function mettreAJourGuideGroupeCours() {
    const statusCours = document.getElementById('status-cours');
    const statusGroupe = document.getElementById('status-groupe');
    const statusHoraire = document.getElementById('status-horaire');
    const statusEtudiants = document.getElementById('status-etudiants');

    if (!statusCours) return; // Guide non présent sur la page

    // 1. Cours configuré ?
    const infoCours = db.getSync('infoCours', null);
    const coursOk = infoCours && (infoCours.sigle || infoCours.codeCours);
    statusCours.textContent = coursOk ? '●' : '○';
    statusCours.style.color = coursOk ? 'var(--vert-succes)' : 'var(--gris-moyen)';

    // 2. Groupe configuré ?
    const groupeOk = infoCours && infoCours.groupe;
    statusGroupe.textContent = groupeOk ? '●' : '○';
    statusGroupe.style.color = groupeOk ? 'var(--vert-succes)' : 'var(--gris-moyen)';

    // 3. Horaire configuré ?
    const cleHoraire = infoCours ? `seancesHoraire_${infoCours.id}` : null;
    let horaireOk = false;
    if (cleHoraire) {
        const seances = db.getSync(cleHoraire, []);
        horaireOk = seances && seances.length > 0;
    }
    statusHoraire.textContent = horaireOk ? '●' : '○';
    statusHoraire.style.color = horaireOk ? 'var(--vert-succes)' : 'var(--gris-moyen)';

    // 4. Étudiants importés ?
    const cleEtudiants = cle('groupeEtudiants');
    const etudiants = db.getSync(cleEtudiants, []);
    const etudiantsFiltres = infoCours ? etudiants.filter(e => e.coursId === infoCours.id) : etudiants;
    const etudiantsOk = etudiantsFiltres.length > 0;
    statusEtudiants.textContent = etudiantsOk ? '●' : '○';
    statusEtudiants.style.color = etudiantsOk ? 'var(--vert-succes)' : 'var(--gris-moyen)';

    console.log('[Guide] État:', { coursOk, groupeOk, horaireOk, etudiantsOk });
}

/* ===============================
   NAVIGATION VERS AIDE
   =============================== */

/**
 * Navigue vers la section AIDE et ouvre un accordéon spécifique
 * @param {string} idAccordeon - ID de l'accordéon à ouvrir (ex: 'aide-archivage')
 */
function allerVersAide(idAccordeon) {
    // 1. Naviguer vers la section AIDE
    if (typeof afficherSection === 'function') {
        afficherSection('aide');
    }

    // 2. Attendre un court délai pour que la section soit visible
    setTimeout(() => {
        const accordeon = document.getElementById('accordeon-' + idAccordeon);
        if (accordeon) {
            // 3. Ouvrir l'accordéon s'il est fermé
            const contenu = accordeon.querySelector('.accordeon-contenu');
            const chevron = accordeon.querySelector('.accordeon-chevron');
            if (contenu && contenu.classList.contains('u-hide')) {
                contenu.classList.remove('u-hide');
                if (chevron) chevron.textContent = '▼';
                accordeon.classList.add('ouvert');
            }

            // 4. Scroller vers l'accordéon
            accordeon.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            console.warn('[Trimestre V2] Accordéon non trouvé:', idAccordeon);
        }
    }, 100);
}

/* ===============================
   PROFIL ENSEIGNANT (Beta 95.2)
   =============================== */

/**
 * Charge les profils enseignants au démarrage (Beta 95.2)
 * Migration: si profilEnseignant existe mais pas dans enseignants, l'ajouter
 */
function chargerProfilEnseignantV2() {
    // Migration: copier profilEnseignant vers enseignants si nécessaire
    const profilAncien = db.getSync('profilEnseignant', null);
    let enseignants = db.getSync('enseignants', []);

    if (profilAncien && profilAncien.prenom && profilAncien.nom) {
        // Vérifier si ce profil existe déjà dans la liste (par courriel)
        const existe = enseignants.some(e => e.courriel === profilAncien.courriel);
        if (!existe) {
            const nouveauProfil = {
                id: genererIdUnique('ENS_'),
                ...profilAncien,
                dateCreation: new Date().toISOString()
            };
            enseignants.push(nouveauProfil);
            db.setSync('enseignants', enseignants);
            // Optionnel: nettoyer l'ancien profil
            // db.setSync('profilEnseignant', null);
        }
    }

    // Peupler le dropdown
    populerDropdownEnseignantsV2();

    // Sélectionner le premier enseignant s'il y en a
    if (enseignants.length > 0) {
        const select = document.getElementById('v2-selectEnseignant');
        if (select && !select.value) {
            select.value = enseignants[0].id;
            chargerEnseignantSelectionneV2();
        }
    } else {
        // Aucun enseignant - préparer pour nouveau
        const titre = document.getElementById('v2-titreFormEnseignant');
        if (titre) titre.textContent = 'Nouveau profil';
        mettreAJourCarteEnseignant();
    }
}

/**
 * Met à jour la carte résumé de l'enseignant
 * Appelée à chaque modification des champs du formulaire
 */
function mettreAJourCarteEnseignant() {
    // 🆕 Beta 95.3 : Utilise afficherSyntheseEnseignant() pour unifier la logique
    const enseignant = {
        prenom: document.getElementById('v2-ens-prenom')?.value?.trim() || '',
        nom: document.getElementById('v2-ens-nom')?.value?.trim() || '',
        courriel: document.getElementById('v2-ens-courriel')?.value?.trim() || '',
        institution: document.getElementById('v2-ens-institution')?.value?.trim() || '',
        departement: document.getElementById('v2-ens-departement')?.value?.trim() || ''
    };
    afficherSyntheseEnseignant(enseignant);
}

// Variable pour suivre l'enseignant en édition (Beta 95.2)
let enseignantEnEditionId = null;

/**
 * Peuple le dropdown de sélection des enseignants (Beta 95.2)
 */
function populerDropdownEnseignantsV2() {
    const select = document.getElementById('v2-selectEnseignant');
    if (!select) return;

    const enseignants = db.getSync('enseignants', []);

    let html = '<option value="">— Sélectionner —</option>';
    enseignants.forEach(e => {
        const nomComplet = `${e.prenom || ''} ${e.nom || ''}`.trim() || 'Sans nom';
        const selected = (e.id === enseignantEnEditionId) ? ' selected' : '';
        html += `<option value="${e.id}"${selected}>${nomComplet}</option>`;
    });

    select.innerHTML = html;
}

/**
 * Charge l'enseignant sélectionné dans le formulaire (Beta 95.2)
 */
function chargerEnseignantSelectionneV2() {
    const select = document.getElementById('v2-selectEnseignant');
    const enseignantId = select?.value;

    if (!enseignantId) {
        // Aucune sélection - vider le formulaire
        viderFormulaireEnseignantV2();
        enseignantEnEditionId = null;
        return;
    }

    const enseignants = db.getSync('enseignants', []);
    const enseignant = enseignants.find(e => e.id === enseignantId);

    if (!enseignant) {
        viderFormulaireEnseignantV2();
        enseignantEnEditionId = null;
        return;
    }

    enseignantEnEditionId = enseignantId;

    // Remplir le formulaire
    const setValue = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.value = val || '';
    };

    setValue('v2-ens-prenom', enseignant.prenom);
    setValue('v2-ens-nom', enseignant.nom);
    setValue('v2-ens-courriel', enseignant.courriel);
    setValue('v2-ens-institution', enseignant.institution);
    setValue('v2-ens-departement', enseignant.departement);
    setValue('v2-ens-discipline', enseignant.discipline);
    setValue('v2-ens-siteWeb', enseignant.siteWeb);

    // Mettre à jour le titre et la carte
    const titre = document.getElementById('v2-titreFormEnseignant');
    if (titre) titre.textContent = 'Modifier le profil';

    mettreAJourCarteEnseignant();
}

/**
 * Prépare le formulaire pour un nouveau profil (Beta 95.2)
 */
function nouveauProfilEnseignantV2() {
    enseignantEnEditionId = null;

    // Désélectionner dans le dropdown
    const select = document.getElementById('v2-selectEnseignant');
    if (select) select.value = '';

    // Vider le formulaire
    viderFormulaireEnseignantV2();

    // Mettre à jour le titre
    const titre = document.getElementById('v2-titreFormEnseignant');
    if (titre) titre.textContent = 'Nouveau profil';

    // Focus sur le premier champ
    document.getElementById('v2-ens-prenom')?.focus();
}

/**
 * Vide le formulaire enseignant
 */
function viderFormulaireEnseignantV2() {
    const champs = ['v2-ens-prenom', 'v2-ens-nom', 'v2-ens-courriel', 'v2-ens-institution', 'v2-ens-departement', 'v2-ens-discipline', 'v2-ens-siteWeb'];
    champs.forEach(id => {
        const elem = document.getElementById(id);
        if (elem) elem.value = '';
    });
    mettreAJourCarteEnseignant();
}

/**
 * Sauvegarde le profil enseignant (Beta 95.2 - multi-profils)
 */
async function sauvegarderEnseignantV2() {
    const prenom = document.getElementById('v2-ens-prenom')?.value?.trim() || '';
    const nom = document.getElementById('v2-ens-nom')?.value?.trim() || '';
    const courriel = document.getElementById('v2-ens-courriel')?.value?.trim() || '';
    const institution = document.getElementById('v2-ens-institution')?.value?.trim() || '';

    // Validation
    if (!prenom || !nom) {
        afficherNotificationErreur('Le prénom et le nom sont requis');
        return;
    }
    if (!courriel) {
        afficherNotificationErreur('Le courriel est requis');
        return;
    }
    if (!institution) {
        afficherNotificationErreur('L\'institution est requise');
        return;
    }

    const profil = {
        prenom: prenom,
        nom: nom,
        courriel: courriel,
        institution: institution,
        departement: document.getElementById('v2-ens-departement')?.value?.trim() || '',
        discipline: document.getElementById('v2-ens-discipline')?.value?.trim() || '',
        siteWeb: document.getElementById('v2-ens-siteWeb')?.value?.trim() || ''
    };

    let enseignants = db.getSync('enseignants', []);

    if (enseignantEnEditionId) {
        // Modification d'un profil existant
        const index = enseignants.findIndex(e => e.id === enseignantEnEditionId);
        if (index >= 0) {
            enseignants[index] = { ...enseignants[index], ...profil };
        }
        afficherNotificationSucces('Profil enseignant modifié');
    } else {
        // Nouveau profil
        const nouveauProfil = {
            id: genererIdUnique('ENS_'),
            ...profil,
            dateCreation: new Date().toISOString()
        };
        enseignants.push(nouveauProfil);
        enseignantEnEditionId = nouveauProfil.id;
        afficherNotificationSucces('Profil enseignant créé');
    }

    db.setSync('enseignants', enseignants);

    // Synchroniser profilEnseignant (utilisé en fallback par d'autres modules)
    db.setSync('profilEnseignant', profil);

    // Rafraîchir les dropdowns
    populerDropdownEnseignantsV2();
    populerDropdownsAssemblageV2();

    // Mettre à jour le titre
    const titre = document.getElementById('v2-titreFormEnseignant');
    if (titre) titre.textContent = 'Modifier le profil';
}

/**
 * Annule les modifications et recharge le profil depuis le stockage
 */
function annulerFormEnseignantV2() {
    if (enseignantEnEditionId) {
        chargerEnseignantSelectionneV2();
    } else {
        viderFormulaireEnseignantV2();
    }
    afficherNotificationSucces('Modifications annulées');
}

/**
 * Supprime le profil enseignant sélectionné (Beta 95.2)
 */
async function supprimerProfilEnseignantV2() {
    if (!enseignantEnEditionId) {
        afficherNotificationErreur('Aucun profil sélectionné');
        return;
    }

    const enseignants = db.getSync('enseignants', []);
    const enseignant = enseignants.find(e => e.id === enseignantEnEditionId);

    if (!enseignant) {
        afficherNotificationErreur('Profil non trouvé');
        return;
    }

    // Confirmation
    const nomComplet = `${enseignant.prenom || ''} ${enseignant.nom || ''}`.trim();
    const confirme = confirm(`Veux-tu vraiment supprimer le profil de ${nomComplet} ?\n\nCette action est irréversible.`);

    if (!confirme) {
        return;
    }

    // Supprimer de la liste
    const nouvellesListe = enseignants.filter(e => e.id !== enseignantEnEditionId);
    db.setSync('enseignants', nouvellesListe);

    // Réinitialiser
    enseignantEnEditionId = null;
    viderFormulaireEnseignantV2();

    // Rafraîchir les dropdowns
    populerDropdownEnseignantsV2();
    populerDropdownsAssemblageV2();

    // Mettre à jour le titre
    const titre = document.getElementById('v2-titreFormEnseignant');
    if (titre) titre.textContent = 'Nouveau profil';

    afficherNotificationSucces('Profil enseignant supprimé');
}

// Exports globaux
window.mettreAJourCarteEnseignant = mettreAJourCarteEnseignant;
window.sauvegarderEnseignantV2 = sauvegarderEnseignantV2;
window.annulerFormEnseignantV2 = annulerFormEnseignantV2;
window.chargerProfilEnseignantV2 = chargerProfilEnseignantV2;
window.supprimerProfilEnseignantV2 = supprimerProfilEnseignantV2;
window.populerDropdownEnseignantsV2 = populerDropdownEnseignantsV2;
window.chargerEnseignantSelectionneV2 = chargerEnseignantSelectionneV2;
window.nouveauProfilEnseignantV2 = nouveauProfilEnseignantV2;

/* ===============================
   FONCTIONS MIGRÉES DE entites-ui.js
   (8 janvier 2026 - consolidation)
   =============================== */

// Variables d'état pour entités
let enseignantEnEditionUI = null;

/**
 * Peuple le dropdown "Groupe-cours actif" dans l'entête
 * 🆕 BETA 95.3 (10 jan 2026) : Ajoute section "Cours" pour voir tous les groupes fusionnés
 */
async function peuplerDropdownGroupeCoursActif() {
    const selectHeader = document.getElementById('selectGroupeCoursHeader');
    if (!selectHeader) return;

    const trimestres = db.getSync('trimestres', []);
    const trimestreActif = trimestres.find(t => t.actif);

    console.log('🔄 [GC Dropdown] Trimestre actif:', trimestreActif?.id, trimestreActif?.nom);

    if (!trimestreActif) {
        selectHeader.innerHTML = '<option value="">-- Sélectionne un trimestre --</option>';
        return;
    }

    // Utiliser cle() pour cohérence avec sauvegarderGroupeCoursV2
    const cleGC = cle('groupesCours');
    console.log('🔄 [GC Dropdown] Clé groupesCours:', cleGC);
    const tousGroupesCours = db.getSync(cleGC, []);
    console.log('🔄 [GC Dropdown] Groupe-cours trouvés:', tousGroupesCours.length);

    // 🆕 (10 jan 2026) : Filtrer les groupe-cours masqués (dansSidebar !== false)
    const groupesCours = tousGroupesCours.filter(gc => gc.dansSidebar !== false);

    let options = '<option value="">-- Sélectionner --</option>';

    if (groupesCours.length > 0) {
        const cours = db.getSync('cours', []);
        const enseignants = db.getSync('enseignants', []);
        const cleHoraires = cle('horaires');
        const horaires = db.getSync(cleHoraires, []);
        const gcActif = db.getSync('groupeCoursActif', null);

        // 🆕 BETA 95.3 : Grouper les groupe-cours par coursId pour la section "Cours"
        const coursMap = new Map();
        groupesCours.forEach(gc => {
            if (gc.coursId) {
                if (!coursMap.has(gc.coursId)) {
                    coursMap.set(gc.coursId, []);
                }
                coursMap.get(gc.coursId).push(gc);
            }
        });

        // Section Groupe-cours
        options += '<optgroup label="Groupe-cours">';
        groupesCours.forEach(gc => {
            const coursInfo = cours.find(c => c.id === gc.coursId);
            const ens = enseignants.find(e => e.id === gc.enseignantId) || {};
            const hor = horaires.find(h => h.id === gc.horaireId) || {};

            const sigle = coursInfo?.codeCours || coursInfo?.code || coursInfo?.sigle || null;
            const groupe = gc.groupe || gc.groupeNum || '00001';
            const nomEns = ens.prenom ? `${ens.prenom} ${(ens.nom || '').charAt(0)}.` : '';
            const nomHor = hor.nom || '';

            // 🆕 FIX (9 jan 2026) : Libellé lisible même sans cours
            let label = sigle ? `${sigle} gr.${groupe}` : `Groupe ${groupe}`;
            if (nomEns) label += ` - ${nomEns}`;
            if (nomHor) label += ` (${nomHor})`;

            const selected = gcActif && !gcActif.modeCours && gc.id === gcActif.id ? ' selected' : '';
            options += `<option value="${gc.id}"${selected}>${label}</option>`;
        });
        options += '</optgroup>';

        // 🆕 BETA 95.3 : Section Cours (tous groupes fusionnés)
        // Masquer en mode démo (un seul groupe-cours, pas besoin de la vue fusionnée)
        const trimestreActifDropdown = trimestres.find(t => t.actif);
        const estDemo = trimestreActifDropdown && trimestreActifDropdown.isDemo;
        if (coursMap.size > 0 && !estDemo) {
            options += '<optgroup label="Cours (tous groupes)">';
            coursMap.forEach((gcs, coursId) => {
                const coursInfo = cours.find(c => c.id === coursId);
                const sigle = coursInfo?.codeCours || coursInfo?.code || coursInfo?.sigle || coursId;
                const nbGroupes = gcs.length;
                const label = nbGroupes > 1 ? `${sigle} (${nbGroupes} groupes)` : sigle;
                const selected = gcActif && gcActif.modeCours && gcActif.coursId === coursId ? ' selected' : '';
                options += `<option value="cours:${coursId}"${selected}>${label}</option>`;
            });
            options += '</optgroup>';
        }
    }

    selectHeader.innerHTML = options;
    console.log('[Trimestre V2] Dropdown groupe-cours actif peuplé:', groupesCours.length, 'groupe-cours');

    // 🆕 BETA 95.5 : Auto-sélection si aucun groupe-cours actif
    // Vérifie si le groupe-cours actuellement actif appartient au trimestre actif
    // 🔧 FIX (24 fév 2026) : Valider contre TOUS les groupe-cours, pas seulement ceux visibles dans la sidebar
    // Sinon un groupe masqué (dansSidebar=false) est considéré invalide et remplacé silencieusement
    const gcActif = db.getSync('groupeCoursActif', null);
    const gcActifValide = gcActif && tousGroupesCours.some(gc => gc.id === gcActif.id);

    console.log('🔄 [GC Dropdown] gcActif:', gcActif?.id, '- trimestreId:', gcActif?.trimestreId);
    console.log('🔄 [GC Dropdown] gcActifValide:', gcActifValide);

    if (!gcActifValide && groupesCours.length > 0) {
        // Sélectionner le premier groupe-cours du trimestre
        const premierGC = groupesCours[0];
        console.log('🔄 [GC Dropdown] Auto-sélection du premier groupe-cours:', premierGC.id);
        await changerGroupeCoursActifV2(premierGC.id);
        selectHeader.value = premierGC.id;
    } else if (gcActifValide) {
        // S'assurer que le dropdown reflète la sélection actuelle
        console.log('🔄 [GC Dropdown] Groupe-cours actif valide, sélection:', gcActif.modeCours ? `cours:${gcActif.coursId}` : gcActif.id);
        selectHeader.value = gcActif.modeCours ? `cours:${gcActif.coursId}` : gcActif.id;
    }
}

/**
 * Change le groupe-cours actif depuis le header
 */
async function changerGroupeCoursDepuisHeader(groupeCoursId) {
    await changerGroupeCoursActifV2(groupeCoursId);
}

/**
 * Change le groupe-cours actif
 * 🆕 BETA 95.3 (10 jan 2026) : Supporte le mode "cours" (tous groupes fusionnés)
 */
async function changerGroupeCoursActifV2(valeur) {
    // DEBUG (11 jan 2026)
    console.log('[Trimestre V2] changerGroupeCoursActifV2 appelée avec:', valeur);

    if (!valeur) {
        db.setSync('groupeCoursActif', null);
        db.setSync('infoCours', null);
        console.log('[Trimestre V2] Groupe-cours désélectionné');
        return;
    }

    const trimestres = db.getSync('trimestres', []);
    const trimestreActif = trimestres.find(t => t.actif);
    if (!trimestreActif) return;

    // 🆕 BETA 95.3 : Détecter si c'est un mode cours (tous groupes)
    const estModeCours = valeur.startsWith('cours:');

    if (estModeCours) {
        // Mode COURS : tous les groupes fusionnés
        const coursId = valeur.replace('cours:', '');
        const cours = db.getSync('cours', []);

        const coursInfo = cours.find(c => c.id === coursId);

        const sigle = coursInfo?.codeCours || coursInfo?.code || coursInfo?.sigle || coursId;

        db.setSync('groupeCoursActif', {
            modeCours: true,
            coursId: coursId,
            trimestreId: trimestreActif.id,
            groupe: null,  // null = tous les groupes
            id: null,
            enseignantId: null,
            horaireId: null
        });

        // ✅ CORRIGÉ (11 jan 2026) : Utiliser setSync pour éviter problèmes localStorage saturé
        db.setSync('infoCours', {
            id: coursId,
            codeCours: sigle,
            nomCours: coursInfo?.nomCours || '',
            groupe: null,  // null = tous les groupes
            _modeCours: true
        });

        const selectHeader = document.getElementById('selectGroupeCoursHeader');
        if (selectHeader) selectHeader.value = valeur;

        if (typeof mettreAJourContexteEntete === 'function') {
            mettreAJourContexteEntete();
        }

        if (typeof afficherNotificationSucces === 'function') {
            afficherNotificationSucces('Cours activé (tous groupes)');
        }

        if (typeof afficherCalendrierScolaire === 'function') {
            afficherCalendrierScolaire();
        }

        // 🆕 BETA 95.3 : Rafraîchir la liste des étudiants si visible
        // Réinitialiser le filtre groupe local (redondant avec le dropdown entête)
        const filtreGroupeCours = document.getElementById('filtre-groupe-liste');
        if (filtreGroupeCours) filtreGroupeCours.value = '';
        if (typeof afficherListeEtudiantsConsultation === 'function') {
            afficherListeEtudiantsConsultation();
        }

        // 🆕 BETA 95.6 : Rafraîchir le tableau de bord aperçu (badges nb étudiants)
        if (typeof chargerTableauBordApercu === 'function') {
            chargerTableauBordApercu();
        }

        // 🆕 BETA 95.6 : Rafraîchir le profil étudiant si affiché
        // Vérifie si la sous-section profil est active et si un DA est mémorisé
        const sousSectionProfil = document.getElementById('tableau-bord-profil');
        if (sousSectionProfil && !sousSectionProfil.classList.contains('u-hide') && window.profilActuelDA) {
            if (typeof afficherProfilComplet === 'function') {
                // Récupérer la liste des étudiants du nouveau groupe-cours
                const etudiantsNouveauGC = typeof obtenirEtudiantsCoursActif === 'function'
                    ? obtenirEtudiantsCoursActif()
                    : [];
                // Si l'étudiant actuel n'est pas dans le nouveau groupe, afficher le premier de la liste
                const etudiantExiste = etudiantsNouveauGC.find(e => e.da === window.profilActuelDA);
                if (etudiantExiste) {
                    afficherProfilComplet(window.profilActuelDA);
                } else if (etudiantsNouveauGC.length > 0) {
                    // Trier et prendre le premier
                    etudiantsNouveauGC.sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
                    const premierActif = etudiantsNouveauGC.find(e => !estEtudiantExclu(e));
                    if (premierActif) {
                        afficherProfilComplet(premierActif.da);
                    }
                }
            }
        }

        // 🆕 BETA 96.1 : Rafraîchir la boîte à outils si visible
        if (typeof window.initialiserTirage === 'function') {
            window.initialiserTirage();
        }
        if (typeof window.initialiserQuestions === 'function') {
            window.initialiserQuestions();
        }

        // 🆕 FIX (3 fév 2026) : Rafraîchir le module de saisie des présences si visible
        const sectionSaisiePresencesCours = document.getElementById('presences-saisie');
        if (sectionSaisiePresencesCours && !sectionSaisiePresencesCours.classList.contains('u-hide')) {
            if (typeof initialiserModuleSaisiePresences === 'function') {
                initialiserModuleSaisiePresences();
            }
            if (typeof mettreAJourBoutonsNavigation === 'function') {
                mettreAJourBoutonsNavigation();
            }
        }

        // Rafraîchir la liste des évaluations
        if (typeof initialiserListeEvaluations === 'function') {
            initialiserListeEvaluations();
        }

        // Rafraîchir le module travaux si visible
        if (typeof travauxUI !== 'undefined') {
            var siC = document.getElementById('evaluations-contenu-import');
            if (siC && !siC.classList.contains('u-hide') && typeof travauxUI.afficherImport === 'function') travauxUI.afficherImport();
            var sfC = document.getElementById('evaluations-contenu-fichiers');
            if (sfC && !sfC.classList.contains('u-hide') && typeof travauxUI.afficherFichiers === 'function') travauxUI.afficherFichiers();
            var saC = document.getElementById('evaluations-contenu-archivage');
            if (saC && !saC.classList.contains('u-hide') && typeof travauxUI.afficherArchivage === 'function') travauxUI.afficherArchivage();
        }

        console.log('[Trimestre V2] Mode COURS activé:', coursId, '(tous groupes)');
        return;
    }

    // Mode GROUPE-COURS : un seul groupe
    const groupeCoursId = valeur;

    // ✅ CORRIGÉ (8 janvier 2026) : Utiliser cle() pour cohérence avec les autres fonctions
    const cleGC = cle('groupesCours');
    const groupesCours = db.getSync(cleGC, []);
    const gc = groupesCours.find(g => g.id === groupeCoursId);

    if (!gc) {
        console.warn('[Trimestre V2] Groupe-cours non trouvé:', groupeCoursId);
        return;
    }

    groupesCours.forEach(g => g.actif = (g.id === groupeCoursId));
    // ✅ CORRIGÉ (11 jan 2026) : Utiliser db.set pour synchroniser IndexedDB avant synchroniserInfoCours
    await db.set(cleGC, groupesCours);

    db.setSync('groupeCoursActif', {
        modeCours: false,
        id: gc.id,
        trimestreId: gc.trimestreId || trimestreActif.id,
        coursId: gc.coursId,
        enseignantId: gc.enseignantId,
        horaireId: gc.horaireId,
        groupe: gc.groupe || gc.groupeNum
    });

    // ✅ CORRIGÉ (11 jan 2026) : Mettre à jour infoCours directement (évite problèmes timing IndexedDB)
    const cours = db.getSync('cours', []);
    const coursInfo = cours.find(c => c.id === gc.coursId);
    const sigleGC = coursInfo?.codeCours || coursInfo?.code || coursInfo?.sigle || '';

    // ✅ Utiliser setSync car infoCours doit être lu de manière synchrone par obtenirEtudiantsCoursActif
    db.setSync('infoCours', {
        id: gc.coursId,  // ID du cours (pour compatibilité avec e.coursId des étudiants)
        codeCours: sigleGC,
        nomCours: coursInfo?.nomCours || '',
        groupe: gc.groupe || gc.groupeNum,
        _modeCours: false,
        _source: 'groupe-cours',
        _groupeCoursId: gc.id  // ID du groupe-cours
    });

    console.log('[Trimestre V2] infoCours mis à jour pour groupe:', gc.groupe || gc.groupeNum);

    const selectHeader = document.getElementById('selectGroupeCoursHeader');
    if (selectHeader) selectHeader.value = groupeCoursId || '';

    if (typeof mettreAJourContexteEntete === 'function') {
        mettreAJourContexteEntete();
    }

    if (typeof afficherNotificationSucces === 'function') {
        afficherNotificationSucces('Groupe-cours activé');
    }

    // 🆕 BETA 95.2 : Rafraîchir le calendrier si visible
    if (typeof afficherCalendrierScolaire === 'function') {
        afficherCalendrierScolaire();
    }

    // 🆕 BETA 95.3 : Rafraîchir la liste des étudiants si visible
    // Réinitialiser le filtre groupe local (redondant avec le dropdown entête)
    const filtreGroupeGC = document.getElementById('filtre-groupe-liste');
    if (filtreGroupeGC) filtreGroupeGC.value = '';
    if (typeof afficherListeEtudiantsConsultation === 'function') {
        afficherListeEtudiantsConsultation();
    }

    // 🆕 BETA 95.6 : Rafraîchir le tableau de bord aperçu (badges nb étudiants)
    if (typeof chargerTableauBordApercu === 'function') {
        chargerTableauBordApercu();
    }

    // 🆕 BETA 95.6 : Rafraîchir le profil étudiant si affiché
    // Vérifie si la sous-section profil est active et si un DA est mémorisé
    const sousSectionProfilGC = document.getElementById('tableau-bord-profil');
    if (sousSectionProfilGC && !sousSectionProfilGC.classList.contains('u-hide') && window.profilActuelDA) {
        if (typeof afficherProfilComplet === 'function') {
            // Récupérer la liste des étudiants du nouveau groupe-cours
            const etudiantsNouveauGroupe = typeof obtenirEtudiantsCoursActif === 'function'
                ? obtenirEtudiantsCoursActif()
                : [];
            // Si l'étudiant actuel n'est pas dans le nouveau groupe, afficher le premier de la liste
            const etudiantExisteGC = etudiantsNouveauGroupe.find(e => e.da === window.profilActuelDA);
            if (etudiantExisteGC) {
                afficherProfilComplet(window.profilActuelDA);
            } else if (etudiantsNouveauGroupe.length > 0) {
                // Trier et prendre le premier
                etudiantsNouveauGroupe.sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
                const premierActifGC = etudiantsNouveauGroupe.find(e => !estEtudiantExclu(e));
                if (premierActifGC) {
                    afficherProfilComplet(premierActifGC.da);
                }
            }
        }
    }

    // 🆕 BETA 96.1 : Rafraîchir la boîte à outils si visible
    if (typeof window.initialiserTirage === 'function') {
        window.initialiserTirage();
    }
    if (typeof window.initialiserQuestions === 'function') {
        window.initialiserQuestions();
    }

    // 🆕 FIX (3 fév 2026) : Rafraîchir le module de saisie des présences si visible
    // Les dates de séances dépendent de l'horaire du groupe-cours actif
    const sectionSaisiePresences = document.getElementById('presences-saisie');
    if (sectionSaisiePresences && !sectionSaisiePresences.classList.contains('u-hide')) {
        if (typeof initialiserModuleSaisiePresences === 'function') {
            initialiserModuleSaisiePresences();
        }
        if (typeof mettreAJourBoutonsNavigation === 'function') {
            mettreAJourBoutonsNavigation();
        }
    }

    // Rafraîchir la liste des évaluations
    if (typeof initialiserListeEvaluations === 'function') {
        initialiserListeEvaluations();
    }

    // Rafraîchir le module travaux si visible
    if (typeof travauxUI !== 'undefined') {
        var siGC = document.getElementById('evaluations-contenu-import');
        if (siGC && !siGC.classList.contains('u-hide') && typeof travauxUI.afficherImport === 'function') travauxUI.afficherImport();
        var sfGC = document.getElementById('evaluations-contenu-fichiers');
        if (sfGC && !sfGC.classList.contains('u-hide') && typeof travauxUI.afficherFichiers === 'function') travauxUI.afficherFichiers();
        var saGC = document.getElementById('evaluations-contenu-archivage');
        if (saGC && !saGC.classList.contains('u-hide') && typeof travauxUI.afficherArchivage === 'function') travauxUI.afficherArchivage();
    }

    console.log('[Trimestre V2] Groupe-cours activé:', gc.id);
}

/**
 * Peuple le dropdown des enseignants
 */
async function peuplerDropdownEnseignants() {
    const select = document.getElementById('v2-selectEnseignant');
    const selectGC = document.getElementById('v2-gc-enseignant');
    if (!select) return;

    let enseignants = [];
    if (typeof EnseignantsEntite !== 'undefined') {
        enseignants = await EnseignantsEntite.obtenirTous();
    }

    let options = '<option value="">Sélectionner un enseignant·e</option>';
    enseignants.forEach(ens => {
        const libelle = typeof EnseignantsEntite !== 'undefined'
            ? EnseignantsEntite.genererLibelle(ens)
            : `${ens.prenom} ${ens.nom}`;
        options += `<option value="${ens.id}">${libelle}</option>`;
    });

    select.innerHTML = options;
    if (selectGC) {
        selectGC.innerHTML = options.replace('Sélectionner', '-- Sélectionner');
    }
}

/**
 * Change l'enseignant sélectionné (affiche aperçu)
 */
function changerEnseignantSelectionneV2(enseignantId) {
    const btnModifier = document.getElementById('v2-btnModifierEnseignant');
    const apercu = document.getElementById('v2-apercuEnseignant');

    if (!enseignantId) {
        if (btnModifier) btnModifier.classList.add('u-hide');
        if (apercu) apercu.innerHTML = '<p class="text-muted">Sélectionne un enseignant·e pour voir ses détails.</p>';
        return;
    }

    if (btnModifier) btnModifier.style.display = '';

    if (typeof EnseignantsEntite !== 'undefined') {
        EnseignantsEntite.obtenirParId(enseignantId).then(ens => {
            if (!ens || !apercu) return;
            apercu.innerHTML = `
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
                    <div><strong>Nom :</strong> ${ens.prenom} ${ens.nom}</div>
                    <div><strong>Courriel :</strong> ${ens.courriel || '-'}</div>
                    <div><strong>Institution :</strong> ${ens.institution || '-'}</div>
                    <div><strong>Département :</strong> ${ens.departement || '-'}</div>
                    <div><strong>Discipline :</strong> ${ens.discipline || '-'}</div>
                    <div><strong>Site web :</strong> ${ens.siteWeb ? `<a href="${ens.siteWeb}" target="_blank">${ens.siteWeb}</a>` : '-'}</div>
                </div>
            `;
        });
    }
}

/**
 * Affiche le formulaire d'ajout d'enseignant
 */
function afficherFormEnseignantV2() {
    enseignantEnEditionUI = null;

    const fields = ['v2-ens-prenom', 'v2-ens-nom', 'v2-ens-courriel', 'v2-ens-institution', 'v2-ens-departement', 'v2-ens-discipline', 'v2-ens-siteWeb'];
    fields.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });

    const titre = document.getElementById('v2-titreFormEnseignant');
    const btnTexte = document.getElementById('v2-btnTexteEnseignant');
    if (titre) titre.textContent = 'Nouvel enseignant·e';
    if (btnTexte) btnTexte.textContent = 'Ajouter';

    const form = document.getElementById('v2-formulaireEnseignant');
    const apercu = document.getElementById('v2-apercuEnseignant');
    if (form) form.classList.remove('u-hide');
    if (apercu) apercu.classList.add('u-hide');
}

/**
 * Modifie l'enseignant sélectionné
 */
async function modifierEnseignantSelectionneV2() {
    const enseignantId = document.getElementById('v2-selectEnseignant')?.value;
    if (!enseignantId || typeof EnseignantsEntite === 'undefined') return;

    const ens = await EnseignantsEntite.obtenirParId(enseignantId);
    if (!ens) return;

    enseignantEnEditionUI = enseignantId;

    const mapping = {
        'v2-ens-prenom': ens.prenom,
        'v2-ens-nom': ens.nom,
        'v2-ens-courriel': ens.courriel,
        'v2-ens-institution': ens.institution,
        'v2-ens-departement': ens.departement,
        'v2-ens-discipline': ens.discipline,
        'v2-ens-siteWeb': ens.siteWeb
    };
    Object.entries(mapping).forEach(([id, val]) => {
        const el = document.getElementById(id);
        if (el) el.value = val || '';
    });

    const titre = document.getElementById('v2-titreFormEnseignant');
    const btnTexte = document.getElementById('v2-btnTexteEnseignant');
    if (titre) titre.textContent = 'Modifier l\'enseignant·e';
    if (btnTexte) btnTexte.textContent = 'Enregistrer';

    const form = document.getElementById('v2-formulaireEnseignant');
    const apercu = document.getElementById('v2-apercuEnseignant');
    if (form) form.classList.remove('u-hide');
    if (apercu) apercu.classList.add('u-hide');
}

/**
 * Affiche le formulaire d'ajout d'horaire (version UI)
 */
function afficherFormHoraireV2() {
    horaireEnEditionId = null;
    seancesTempV2 = [];

    const fields = { 'v2-hor-nom': '', 'v2-hor-local': '', 'v2-hor-nbSeances': '2', 'v2-hor-periodesParSeance': '2' };
    Object.entries(fields).forEach(([id, val]) => {
        const el = document.getElementById(id);
        if (el) el.value = val;
    });

    const titre = document.getElementById('v2-titreFormHoraire');
    const btnTexte = document.getElementById('v2-btnTexteHoraire');
    if (titre) titre.textContent = 'Nouvel horaire';
    if (btnTexte) btnTexte.textContent = 'Ajouter';

    // Peupler dropdown groupe associé
    populerDropdownGroupesHoraireV2();

    mettreAJourSeancesHoraireV2();

    const form = document.getElementById('v2-formulaireHoraire');
    if (form) form.classList.remove('u-hide');
}

/**
 * Modifie l'horaire sélectionné
 */
async function modifierHoraireSelectionneV2() {
    const horaireId = document.getElementById('v2-selectHoraire')?.value;
    if (!horaireId || typeof HorairesEntite === 'undefined') return;

    const hor = await HorairesEntite.obtenirParId(horaireId);
    if (!hor) return;

    horaireEnEditionId = horaireId;
    seancesTempV2 = [...(hor.seances || [])];

    document.getElementById('v2-hor-nom').value = hor.nom || '';
    document.getElementById('v2-hor-local').value = hor.local || '';
    document.getElementById('v2-hor-nbSeances').value = String(hor.nbSeances || hor.seances?.length || 2);
    document.getElementById('v2-hor-periodesParSeance').value = String(hor.periodesParSeance || 2);

    // Groupe associé
    const selectGroupe = document.getElementById('v2-hor-groupeAssocie');
    if (selectGroupe) {
        populerDropdownGroupesHoraireV2();
        selectGroupe.value = hor.groupeAssocie || '';
    }

    afficherSeancesHoraireV2();
    mettreAJourResumeFormatHoraireV2();

    const titre = document.getElementById('v2-titreFormHoraire');
    const btnTexte = document.getElementById('v2-btnTexteHoraire');
    if (titre) titre.textContent = 'Modifier l\'horaire';
    if (btnTexte) btnTexte.textContent = 'Enregistrer';

    const form = document.getElementById('v2-formulaireHoraire');
    if (form) form.classList.remove('u-hide');
}

/**
 * Met à jour le résumé du format horaire
 */
function mettreAJourResumeFormatHoraireV2() {
    const nbSeances = parseInt(document.getElementById('v2-hor-nbSeances')?.value) || 2;
    const periodesParSeance = parseInt(document.getElementById('v2-hor-periodesParSeance')?.value) || 2;
    const totalPeriodes = nbSeances * periodesParSeance;

    const resumeElem = document.getElementById('v2-hor-formatResume');
    if (resumeElem) {
        resumeElem.textContent = `${nbSeances} séance${nbSeances > 1 ? 's' : ''} × ${periodesParSeance} période${periodesParSeance > 1 ? 's' : ''} = ${totalPeriodes} périodes/semaine`;
    }
}

/**
 * Affiche le formulaire de création de groupe-cours
 */
function afficherFormGroupeCoursV2() {
    const fields = ['v2-gc-cours', 'v2-gc-groupe'];
    fields.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });

    const titre = document.getElementById('v2-titreFormGroupeCours');
    if (titre) titre.textContent = 'Nouveau groupe-cours';

    afficherTrimestreGroupeCoursV2();

    const form = document.getElementById('v2-formulaireGroupeCours');
    if (form) form.classList.remove('u-hide');
}

/**
 * Active un groupe-cours
 */
async function activerGroupeCoursV2(groupeCoursId) {
    const trimestreActif = window.trimestreActif || obtenirTrimestreActif()?.id;
    if (!trimestreActif) return;

    try {
        if (typeof GroupeCoursEntite !== 'undefined') {
            await GroupeCoursEntite.activer(trimestreActif, groupeCoursId);
            await GroupeCoursEntite.synchroniserInfoCours(trimestreActif);
        }

        rafraichirListeGroupeCoursV2();
        await peuplerDropdownGroupeCoursActif();

        if (typeof chargerCoursSelectV2 === 'function') {
            chargerCoursSelectV2();
        }

        console.log('[Trimestre V2] Groupe-cours activé:', groupeCoursId);

    } catch (err) {
        console.error('[Trimestre V2] Erreur activation groupe-cours:', err);
        alert('Erreur lors de l\'activation');
    }
}

/**
 * Supprime un groupe-cours (ancienne version - redirige vers la nouvelle)
 * @deprecated Utiliser supprimerGroupeCoursV2() sans paramètre
 */
async function _supprimerGroupeCoursV2_legacy(groupeCoursId) {
    // Redirige vers la nouvelle fonction qui utilise groupeCoursEnEditionId
    supprimerGroupeCoursV2();
}

/**
 * Met à jour l'aperçu du groupe-cours
 */
async function mettreAJourApercuGroupeCours() {
    const coursId = document.getElementById('v2-gc-cours')?.value;
    const groupe = document.getElementById('v2-gc-groupe')?.value;
    const apercuSpan = document.getElementById('v2-gc-apercu-texte');

    if (!apercuSpan) return;

    if (!coursId || !groupe) {
        apercuSpan.textContent = 'Complétez les champs obligatoires pour voir l\'aperçu';
        apercuSpan.className = 'text-muted';
        return;
    }

    // Récupérer infos cours
    // 🆕 FIX (4 fév 2026) : Chercher dans toutes les sources, ajouter code pour Primo
    let cours = null;
    if (typeof CoursEntite !== 'undefined') {
        cours = await CoursEntite.obtenirParId(coursId);
    }
    if (!cours) {
        const coursCollection = db.getSync('cours', []);
        cours = coursCollection.find(c => c.id === coursId || c.sigle === coursId || c.code === coursId);
    }

    // 🆕 FIX (9 jan 2026) : Libellé lisible même sans cours
    const sigle = cours?.codeCours || cours?.sigle || cours?.code || null;
    const apercu = sigle ? `${sigle} gr.${groupe}` : `Groupe ${groupe}`;

    apercuSpan.textContent = apercu;
    apercuSpan.className = '';
    apercuSpan.style.color = 'var(--accent-primaire)';
    apercuSpan.style.fontWeight = '500';
}

/**
 * Accès rapide au calendrier depuis le bandeau groupe-cours
 * 🆕 BETA 95.2
 */
function accederCalendrierRapide() {
    // Naviguer vers la section Présences
    if (typeof afficherSection === 'function') {
        afficherSection('presences');
    }
    // Puis vers la sous-section Calendrier (avec délai pour laisser le DOM se mettre à jour)
    setTimeout(() => {
        if (typeof afficherSousSection === 'function') {
            afficherSousSection('presences-calendrier');
        }
    }, 100);
}

// Exports des fonctions migrées
window.accederCalendrierRapide = accederCalendrierRapide;
window.peuplerDropdownGroupeCoursActif = peuplerDropdownGroupeCoursActif;
window.changerGroupeCoursDepuisHeader = changerGroupeCoursDepuisHeader;
window.changerGroupeCoursActifV2 = changerGroupeCoursActifV2;
window.peuplerDropdownEnseignants = peuplerDropdownEnseignants;
window.changerEnseignantSelectionneV2 = changerEnseignantSelectionneV2;
window.afficherFormEnseignantV2 = afficherFormEnseignantV2;
window.modifierEnseignantSelectionneV2 = modifierEnseignantSelectionneV2;
window.afficherFormHoraireV2 = afficherFormHoraireV2;
window.modifierHoraireSelectionneV2 = modifierHoraireSelectionneV2;
window.mettreAJourResumeFormatHoraireV2 = mettreAJourResumeFormatHoraireV2;
window.afficherFormGroupeCoursV2 = afficherFormGroupeCoursV2;
window.activerGroupeCoursV2 = activerGroupeCoursV2;
window.supprimerGroupeCoursV2 = supprimerGroupeCoursV2;
window.mettreAJourApercuGroupeCours = mettreAJourApercuGroupeCours;

/* ===============================
   INITIALISATION AUTOMATIQUE
   =============================== */

// Initialiser quand le DOM est prêt et que db est disponible
document.addEventListener('DOMContentLoaded', function() {
    // ✅ CORRIGÉ (8 janvier 2026) : Attendre window.dbReady (synchronisation IndexedDB → localStorage terminée)
    // Avant, on vérifiait db.getSync qui existe AVANT la fin de la synchronisation
    if (window.dbReady) {
        initialiserTrimestreV2();
    } else {
        // Attendre l'événement db-ready (déclenché après syncToLocalStorageCache)
        window.addEventListener('db-ready', function() {
            initialiserTrimestreV2();
        }, { once: true });
    }
});


})();
