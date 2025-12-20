/* ===============================
   MODULE: TRIMESTRE V2 (Beta 95)
   Gestion de l'onglet Trimestre restructuré

   Ce module gère la nouvelle interface de l'onglet Trimestre
   avec dropdowns et accordéons, tout en synchronisant avec
   les données existantes (cadreCalendrier, cours, etc.)
   =============================== */

/* ===============================
   INITIALISATION
   =============================== */

/**
 * Initialise l'onglet Trimestre v2
 * Appelé au chargement de la page
 */
function initialiserTrimestreV2() {
    console.log('[Trimestre V2] Initialisation...');

    // Charger le cadre calendrier dans les nouveaux champs
    chargerCadreCalendrierV2();

    // Charger les événements (prévus et imprévus)
    chargerEvenementsPrevusV2();
    chargerEvenementsImprevusV2();

    // Charger la liste des cours dans le dropdown
    chargerDropdownCoursV2();

    // Charger les séances dans l'accordéon Horaire
    chargerSeancesV2();

    // Charger la liste des étudiants dans l'accordéon Groupes
    chargerListeEtudiantsV2();

    // Charger l'état de la checkbox données démo
    chargerEtatDonneesDemoV2();

    // Populer le dropdown trimestre (pour l'instant, un seul trimestre)
    populerDropdownTrimestreV2();

    // Restaurer l'état des accordéons (ouvert/fermé) depuis localStorage
    if (typeof restaurerEtatAccordeons === 'function') {
        restaurerEtatAccordeons();
    }

    console.log('[Trimestre V2] Initialisation terminée');
}

/* ===============================
   CADRE CALENDRIER
   =============================== */

/**
 * Charge les données du cadre calendrier dans les champs v2-
 */
function chargerCadreCalendrierV2() {
    const cadre = db.getSync(cle('cadreCalendrier'), null);
    if (!cadre) return;

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

    for (const [idElement, cleCadre] of Object.entries(champs)) {
        const element = document.getElementById(idElement);
        if (element && cadre[cleCadre]) {
            element.value = cadre[cleCadre];
        }
    }

    // Vérifier si le calendrier existe, sinon le générer
    const calendrier = db.getSync(cle('calendrierComplet'), null);
    if (!calendrier && cadre.dateDebut && cadre.finCours && cadre.finTrimestre) {
        if (typeof genererCalendrierComplet === 'function') {
            genererCalendrierComplet();
            console.log('[Trimestre V2] Calendrier généré à l\'initialisation');
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
    if (!confirm('Voulez-vous vraiment réinitialiser les bornes du trimestre ?')) {
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
    if (!confirm('Voulez-vous vraiment réinitialiser les semaines spéciales ?')) {
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

    const elemSemaines = document.getElementById('v2-nombreSemaines');
    const elemJours = document.getElementById('v2-nombreJoursCours');
    const elemCongesReprises = document.getElementById('v2-statsCongesReprises');

    console.log('[Trimestre V2] Calendrier lu:', calendrier ? Object.keys(calendrier).length + ' jours' : 'null');

    // Vérifier si le calendrier existe ET a des données
    if (!calendrier || typeof calendrier !== 'object' || Object.keys(calendrier).length === 0) {
        console.log('[Trimestre V2] Calendrier non disponible ou vide');
        if (elemSemaines) elemSemaines.textContent = '0';
        if (elemJours) elemJours.textContent = '0';
        if (elemCongesReprises) elemCongesReprises.textContent = '';
        return;
    }

    // Compter les jours de cours, congés et reprises
    let joursCours = 0;
    let conges = 0;
    let reprises = 0;

    Object.values(calendrier).forEach(jour => {
        if (jour.statut === 'cours') joursCours++;
        if (jour.statut === 'reprise') {
            joursCours++;  // Les reprises comptent comme jours de cours
            reprises++;
        }
        if (jour.statut === 'conge') conges++;
    });

    // Total jours de cours = cours normaux + reprises
    // Les congés sont déjà exclus (statut différent de 'cours')

    // Calculer les semaines (approximation : 5 jours = 1 semaine)
    const semaines = Math.ceil(joursCours / 5);

    console.log(`[Trimestre V2] Stats: ${semaines} semaines, ${joursCours} jours, ${conges} congés, ${reprises} reprises`);

    if (elemSemaines) elemSemaines.textContent = semaines;
    if (elemJours) elemJours.textContent = joursCours;

    // Générer le texte contextuel pour congés/reprises
    if (elemCongesReprises) {
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
        elemCongesReprises.textContent = texte;
    }
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
    const couleurBadge = type === 'prevu' ? 'var(--vert-confirmer)' : 'var(--orange-accent)';
    const repriseInfo = evt.dateReprise ?
        ` → Reprise ${evt.horaireReprise || ''} le ${evt.dateReprise}` : '';

    return `
    <div class="item-carte-compact" style="margin-bottom: 8px; padding: 10px; background: var(--bleu-tres-pale); border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">
        <div>
            <strong style="color: ${couleurBadge};">${evt.description}</strong>
            <span class="text-muted" style="margin-left: 10px;">${evt.dateEvenement}${repriseInfo}</span>
        </div>
        <div>
            <button onclick="modifierEvenementV2('${evt.id}', '${type}')" class="btn btn-secondaire btn-sm" style="padding: 4px 8px; font-size: 0.8rem;">Modifier</button>
            <button onclick="supprimerEvenementV2('${evt.id}', '${type}')" class="btn btn-supprimer btn-sm" style="padding: 4px 8px; font-size: 0.8rem;">Suppr.</button>
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

            form.style.display = 'block';
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

            form.style.display = 'block';
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
        <button class="btn" style="background: white; color: var(--orange-accent); padding: 5px 15px;" onclick="retournerVueV2()">
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
    const evenements = db.getSync(typeStorage, []);
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

            form.style.display = 'block';
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

            form.style.display = 'block';
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
            id: Date.now().toString(),
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
    if (form) form.style.display = 'none';
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
            id: Date.now().toString(),
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
    if (form) form.style.display = 'none';
}

/**
 * Supprime un événement
 */
function supprimerEvenementV2(id, type) {
    if (!confirm('Voulez-vous vraiment supprimer cet événement ?')) return;

    const typeStorage = type === 'prevu' ? 'evenementsPrevus' : 'evenementsImprevus';
    let evenements = db.getSync(typeStorage, []);

    evenements = evenements.filter(e => e.id !== id);
    db.setSync(typeStorage, evenements);

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
    const trimestres = typeof obtenirTrimestres === 'function' ? obtenirTrimestres() : [];
    const trimestreActif = typeof obtenirTrimestreActif === 'function' ? obtenirTrimestreActif() : null;

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

    console.log('[Trimestre V2] Dropdown peuplé avec', trimestres.length, 'trimestre(s)');
}

/**
 * Change le trimestre actif et recharge l'interface
 * Délègue à la fonction de trimestres.js
 */
function changerTrimestreActifV2(valeur) {
    console.log('[Trimestre V2] Changement trimestre:', valeur);

    // Appeler la fonction de trimestres.js
    if (typeof window.changerTrimestreActif === 'function') {
        const success = window.changerTrimestreActif(valeur);
        if (success) {
            // Recharger l'interface
            chargerCadreCalendrierV2();
            chargerEvenementsPrevusV2();
            chargerEvenementsImprevusV2();
            afficherStatistiquesTrimestreV2();
        }
    } else {
        console.error('[Trimestre V2] Fonction changerTrimestreActif non disponible');
    }
}

/**
 * Ouvre la modal pour créer un nouveau trimestre
 */
function ouvrirModalNouveauTrimestre() {
    alert('Fonctionnalité "Nouveau trimestre" en cours de développement.\n\nPour l\'instant, configurez le trimestre via les champs ci-dessous.');
}

/* ===============================
   ACCORDÉON COURS
   =============================== */

/**
 * Charge la liste des cours dans le dropdown
 */
function chargerDropdownCoursV2() {
    const select = document.getElementById('v2-selectCours');
    if (!select) return;

    // Récupérer les cours depuis le stockage
    const cours = db.getSync('listeCours', []);
    const coursActif = db.getSync('infoCours', null);

    select.innerHTML = '<option value="">Sélectionner un cours...</option>';

    if (cours.length === 0 && coursActif) {
        // Si pas de liste mais un cours actif, l'ajouter
        const option = document.createElement('option');
        option.value = coursActif.id || 'actuel';
        option.textContent = `${coursActif.sigle || ''} ${coursActif.titre || 'Cours actuel'}`.trim();
        option.selected = true;
        select.appendChild(option);

        // Afficher les détails
        afficherDetailsCoursV2(coursActif);
    } else {
        cours.forEach(c => {
            const option = document.createElement('option');
            option.value = c.id;
            option.textContent = `${c.sigle || ''} ${c.titre || ''}`.trim();
            if (coursActif && c.id === coursActif.id) {
                option.selected = true;
                afficherDetailsCoursV2(c);
            }
            select.appendChild(option);
        });
    }
}

/**
 * Change le cours sélectionné
 */
function changerCoursSelectionneV2(coursId) {
    const apercuCours = document.getElementById('v2-apercuCours');
    const btnModifier = document.getElementById('v2-btnModifierCours');
    const formulaire = document.getElementById('v2-formulaireCours');
    const listeGroupes = document.getElementById('v2-listeGroupes');

    // Masquer le formulaire si affiché
    if (formulaire) formulaire.style.display = 'none';
    if (apercuCours) apercuCours.style.display = 'block';

    if (!coursId) {
        if (apercuCours) apercuCours.innerHTML = '<p class="text-muted">Sélectionnez un cours pour voir ses détails.</p>';
        if (listeGroupes) listeGroupes.innerHTML = '<p class="text-muted">Sélectionnez un cours pour voir ses groupes.</p>';
        if (btnModifier) btnModifier.style.display = 'none';
        return;
    }

    // Charger les détails du cours
    const cours = db.getSync('listeCours', []);
    const coursSelectionne = cours.find(c => c.id === coursId) || db.getSync('infoCours', null);

    if (coursSelectionne) {
        afficherDetailsCoursV2(coursSelectionne);
        chargerGroupesCoursV2(coursId);
        if (btnModifier) btnModifier.style.display = '';
    }
}

/**
 * Affiche les détails d'un cours (aperçu)
 */
function afficherDetailsCoursV2(cours) {
    const conteneur = document.getElementById('v2-apercuCours');
    if (!conteneur) return;

    const enseignant = cours.enseignant || {};
    const nomEnseignant = `${enseignant.prenom || ''} ${enseignant.nom || ''}`.trim() || '—';

    conteneur.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
            <div>
                <label class="text-muted" style="font-size: 0.85rem;">Sigle</label>
                <div style="font-weight: 600;">${cours.sigle || cours.codeCours || '—'}</div>
            </div>
            <div>
                <label class="text-muted" style="font-size: 0.85rem;">Titre</label>
                <div style="font-weight: 600;">${cours.titre || cours.nomCours || '—'}</div>
            </div>
            <div>
                <label class="text-muted" style="font-size: 0.85rem;">Session</label>
                <div>${cours.session || '—'} ${cours.annee || ''}</div>
            </div>
            <div>
                <label class="text-muted" style="font-size: 0.85rem;">Enseignant·e</label>
                <div>${nomEnseignant}</div>
            </div>
            <div>
                <label class="text-muted" style="font-size: 0.85rem;">Format horaire</label>
                <div>${cours.formatHoraire || '—'} (${cours.heuresParSemaine || '—'}h/sem)</div>
            </div>
            <div>
                <label class="text-muted" style="font-size: 0.85rem;">Groupe</label>
                <div>${cours.groupe || '—'}</div>
            </div>
        </div>
    `;
}

// Variable pour stocker l'ID du cours en édition
let coursEnEditionV2 = null;

/**
 * Affiche le formulaire pour créer un nouveau cours
 */
function afficherFormCoursV2() {
    coursEnEditionV2 = null;

    const formulaire = document.getElementById('v2-formulaireCours');
    const apercu = document.getElementById('v2-apercuCours');
    const titre = document.getElementById('v2-titreFormCours');
    const btnTexte = document.getElementById('v2-btnTexteCours');

    if (formulaire) {
        formulaire.style.display = 'block';
        if (apercu) apercu.style.display = 'none';
        if (titre) titre.textContent = 'Nouvelle configuration de cours';
        if (btnTexte) btnTexte.textContent = 'Ajouter';

        // Réinitialiser tous les champs
        reinitialiserFormCoursV2();

        // Mettre l'année courante par défaut
        const anneeInput = document.getElementById('v2-annee');
        if (anneeInput) anneeInput.value = new Date().getFullYear();

        formulaire.scrollIntoView({ behavior: 'smooth' });
    }
}

/**
 * Modifie le cours actuellement sélectionné
 */
function modifierCoursSelectionneV2() {
    const selectCours = document.getElementById('v2-selectCours');
    const coursId = selectCours?.value;

    if (!coursId) {
        alert('Veuillez sélectionner un cours à modifier.');
        return;
    }

    // Trouver le cours
    const cours = db.getSync('listeCours', []);
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
        formulaire.style.display = 'block';
        if (apercu) apercu.style.display = 'none';
        if (titre) titre.textContent = 'Modifier le cours';
        if (btnTexte) btnTexte.textContent = 'Enregistrer';

        // Remplir les champs avec les données du cours
        remplirFormCoursV2(coursSelectionne);

        formulaire.scrollIntoView({ behavior: 'smooth' });
    }
}

/**
 * Remplit le formulaire avec les données d'un cours
 */
function remplirFormCoursV2(cours) {
    const enseignant = cours.enseignant || {};

    setValue('v2-codeCours', cours.sigle || cours.codeCours || '');
    setValue('v2-nomCours', cours.titre || cours.nomCours || '');
    setValue('v2-numeroCompetence', cours.numeroCompetence || '');
    setValue('v2-competence', cours.competence || '');
    setValue('v2-elementsCompetence', cours.elementsCompetence || '');

    setValue('v2-prenomEnseignant', enseignant.prenom || '');
    setValue('v2-nomEnseignant', enseignant.nom || '');
    setValue('v2-courrielEnseignant', enseignant.courriel || '');
    setValue('v2-disciplineEnseignant', enseignant.discipline || '');
    setValue('v2-departement', enseignant.departement || '');
    setValue('v2-institutionEnseignant', enseignant.institution || '');

    setValue('v2-session', cours.session || 'H');
    setValue('v2-annee', cours.annee || new Date().getFullYear());
    setValue('v2-heuresParSemaine', cours.heuresParSemaine || 4);
    setValue('v2-formatHoraire', cours.formatHoraire || '2x2');
    setValue('v2-numeroGroupe', cours.groupe || '01');
    setValue('v2-localCours', cours.local || '');
}

/**
 * Réinitialise le formulaire cours
 */
function reinitialiserFormCoursV2() {
    const champs = [
        'v2-codeCours', 'v2-nomCours', 'v2-numeroCompetence', 'v2-competence', 'v2-elementsCompetence',
        'v2-prenomEnseignant', 'v2-nomEnseignant', 'v2-courrielEnseignant', 'v2-disciplineEnseignant',
        'v2-departement', 'v2-institutionEnseignant', 'v2-localCours'
    ];
    champs.forEach(id => setValue(id, ''));

    setValue('v2-session', 'H');
    setValue('v2-heuresParSemaine', 4);
    setValue('v2-formatHoraire', '2x2');
    setValue('v2-numeroGroupe', '01');
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

    const formulaire = document.getElementById('v2-formulaireCours');
    const apercu = document.getElementById('v2-apercuCours');

    if (formulaire) formulaire.style.display = 'none';
    if (apercu) apercu.style.display = 'block';

    reinitialiserFormCoursV2();
}

/**
 * Sauvegarde le cours (création ou modification)
 */
function sauvegarderCoursV2() {
    // Récupérer les valeurs
    const codeCours = document.getElementById('v2-codeCours')?.value?.trim();
    const nomCours = document.getElementById('v2-nomCours')?.value?.trim();
    const discipline = document.getElementById('v2-disciplineEnseignant')?.value?.trim();

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
    const groupe = document.getElementById('v2-numeroGroupe')?.value || '01';

    const cours = {
        id: coursEnEditionV2 || `${codeCours}-${session.toLowerCase()}${annee}-${groupe}`,
        sigle: codeCours,
        codeCours: codeCours,
        titre: nomCours,
        nomCours: nomCours,
        numeroCompetence: document.getElementById('v2-numeroCompetence')?.value?.trim() || '',
        competence: document.getElementById('v2-competence')?.value?.trim() || '',
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
        heuresParSemaine: parseInt(document.getElementById('v2-heuresParSemaine')?.value) || 4,
        formatHoraire: document.getElementById('v2-formatHoraire')?.value || '2x2',
        groupe: groupe,
        local: document.getElementById('v2-localCours')?.value?.trim() || '',
        actif: true
    };

    // Sauvegarder dans la liste des cours
    let listeCours = db.getSync('listeCours', []);

    if (coursEnEditionV2) {
        // Modification
        const index = listeCours.findIndex(c => c.id === coursEnEditionV2);
        if (index >= 0) {
            listeCours[index] = { ...listeCours[index], ...cours };
        } else {
            listeCours.push(cours);
        }
    } else {
        // Création
        listeCours.push(cours);
    }

    db.setSync('listeCours', listeCours);

    // Si c'est le seul cours ou le cours actif, mettre à jour infoCours aussi
    if (listeCours.length === 1 || cours.actif) {
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
 */
function chargerListeEtudiantsV2() {
    const conteneur = document.getElementById('v2-listeEtudiants');
    const nbTotal = document.getElementById('v2-nbEtudiantsTotal');
    const groupeActifElem = document.getElementById('v2-groupeActif');
    const actionsEtudiants = document.getElementById('v2-actionsEtudiants');

    if (!conteneur) return;

    const etudiants = db.getSync('groupeEtudiants', []);
    const coursActif = db.getSync('infoCours', null);
    const groupeActif = coursActif?.groupe || '01';

    // Mettre à jour les compteurs
    if (nbTotal) nbTotal.textContent = etudiants.length;
    if (groupeActifElem) groupeActifElem.textContent = groupeActif;

    if (etudiants.length === 0) {
        conteneur.innerHTML = '<p class="text-muted text-italic">Aucun étudiant dans ce groupe. Utilisez le formulaire ou l\'import ci-dessus.</p>';
        if (actionsEtudiants) actionsEtudiants.style.display = 'none';
        return;
    }

    if (actionsEtudiants) actionsEtudiants.style.display = 'block';

    // Trier par nom
    etudiants.sort((a, b) => {
        const nomA = `${a.nom || ''} ${a.prenom || ''}`.toLowerCase();
        const nomB = `${b.nom || ''} ${b.prenom || ''}`.toLowerCase();
        return nomA.localeCompare(nomB);
    });

    let html = `
        <table class="tableau-blanc" style="width: 100%; font-size: 0.9rem;">
            <thead class="thead-bleu-moyen">
                <tr>
                    <th style="text-align: left; padding: 8px;">DA</th>
                    <th style="text-align: left; padding: 8px;">Nom</th>
                    <th style="text-align: left; padding: 8px;">Prénom</th>
                    <th style="text-align: left; padding: 8px;">Programme</th>
                    <th style="text-align: center; padding: 8px;">SA</th>
                    <th style="text-align: center; padding: 8px; width: 100px;">Actions</th>
                </tr>
            </thead>
            <tbody>
    `;

    etudiants.forEach((e, index) => {
        const sa = e.sa === 'Oui' || e.sa === true ? '✓' : '';
        html += `
            <tr>
                <td style="padding: 6px 8px;">${e.da || '—'}</td>
                <td style="padding: 6px 8px;">${e.nom || '—'}</td>
                <td style="padding: 6px 8px;">${e.prenom || '—'}</td>
                <td style="padding: 6px 8px;">${e.programme || '—'}</td>
                <td style="padding: 6px 8px; text-align: center;">${sa}</td>
                <td style="padding: 6px 8px; text-align: center;">
                    <button class="btn btn-annuler btn-sm" onclick="supprimerEtudiantV2(${index})" title="Supprimer" style="padding: 3px 8px;">✕</button>
                </td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    conteneur.innerHTML = html;
}

/**
 * Charge les groupes d'un cours (ancien comportement, maintenant charge la liste)
 */
function chargerGroupesCoursV2(coursId) {
    chargerListeEtudiantsV2();
}

/**
 * Ajoute un étudiant manuellement
 */
function ajouterEtudiantV2() {
    const da = document.getElementById('v2-etudiantDA')?.value?.trim();
    const nom = document.getElementById('v2-etudiantNom')?.value?.trim();
    const prenom = document.getElementById('v2-etudiantPrenom')?.value?.trim();
    const programme = document.getElementById('v2-etudiantProgramme')?.value?.trim();
    const sa = document.getElementById('v2-etudiantSA')?.value;

    if (!nom || !prenom) {
        alert('Le nom et le prénom sont obligatoires.');
        return;
    }

    const coursActif = db.getSync('infoCours', null);
    const groupe = coursActif?.groupe || '01';

    const nouvelEtudiant = {
        da: da || `DA${Date.now()}`,
        nom: nom,
        prenom: prenom,
        groupe: groupe,
        programme: programme || '',
        sa: sa || '',
        coursId: coursActif?.id || ''
    };

    let etudiants = db.getSync('groupeEtudiants', []);
    etudiants.push(nouvelEtudiant);
    db.setSync('groupeEtudiants', etudiants);

    // Vider les champs
    setValue('v2-etudiantDA', '');
    setValue('v2-etudiantNom', '');
    setValue('v2-etudiantPrenom', '');
    setValue('v2-etudiantProgramme', '');
    setValue('v2-etudiantSA', '');

    // Recharger la liste
    chargerListeEtudiantsV2();

    if (typeof afficherNotificationSucces === 'function') {
        afficherNotificationSucces(`${prenom} ${nom} ajouté`);
    }
}

/**
 * Supprime un étudiant
 */
function supprimerEtudiantV2(index) {
    let etudiants = db.getSync('groupeEtudiants', []);
    const etudiant = etudiants[index];

    if (!confirm(`Supprimer ${etudiant?.prenom || ''} ${etudiant?.nom || ''} ?`)) return;

    etudiants.splice(index, 1);
    db.setSync('groupeEtudiants', etudiants);

    chargerListeEtudiantsV2();

    if (typeof afficherNotificationSucces === 'function') {
        afficherNotificationSucces('Étudiant supprimé');
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
    reader.readAsText(fichier);
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
        // Détecter le séparateur (tab ou virgule)
        const separateur = ligne.includes('\t') ? '\t' : ',';
        const colonnes = ligne.split(separateur).map(c => c.trim());

        if (colonnes.length >= 4) {
            donneesImportEnAttenteV2.push({
                da: colonnes[0] || '',
                groupe: colonnes[1] || '01',
                nom: colonnes[2] || '',
                prenom: colonnes[3] || '',
                programme: colonnes[4] || '',
                sa: colonnes[6] || ''
            });
        }
    });

    if (donneesImportEnAttenteV2.length === 0) {
        alert('Aucune donnée valide trouvée. Vérifiez le format.');
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
                        <th>DA</th><th>Nom</th><th>Prénom</th><th>Programme</th><th>SA</th>
                    </tr>
                </thead>
                <tbody>
        `;

        donneesImportEnAttenteV2.forEach(e => {
            html += `
                <tr>
                    <td>${e.da}</td><td>${e.nom}</td><td>${e.prenom}</td><td>${e.programme}</td><td>${e.sa}</td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        previewTable.innerHTML = html;
        previewZone.style.display = 'block';
    }
}

/**
 * Confirme l'import des données
 */
function confirmerImportV2() {
    if (donneesImportEnAttenteV2.length === 0) return;

    const coursActif = db.getSync('infoCours', null);
    let etudiants = db.getSync('groupeEtudiants', []);

    donneesImportEnAttenteV2.forEach(e => {
        etudiants.push({
            ...e,
            coursId: coursActif?.id || ''
        });
    });

    db.setSync('groupeEtudiants', etudiants);

    // Nettoyer
    donneesImportEnAttenteV2 = [];
    document.getElementById('v2-previewZone').style.display = 'none';
    document.getElementById('v2-donneesCollees').value = '';
    document.getElementById('v2-fichierCsvEntree').value = '';

    chargerListeEtudiantsV2();

    if (typeof afficherNotificationSucces === 'function') {
        afficherNotificationSucces(`${etudiants.length} étudiant(s) importé(s)`);
    }
}

/**
 * Annule l'import en cours
 */
function annulerImportV2() {
    donneesImportEnAttenteV2 = [];
    document.getElementById('v2-previewZone').style.display = 'none';
}

/**
 * Exporte les étudiants en CSV
 */
function exporterEtudiantsV2() {
    const etudiants = db.getSync('groupeEtudiants', []);
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
function reinitialiserEtudiantsV2() {
    const etudiants = db.getSync('groupeEtudiants', []);
    if (!confirm(`Supprimer les ${etudiants.length} étudiant(s) ? Cette action est irréversible.`)) return;

    db.setSync('groupeEtudiants', []);
    chargerListeEtudiantsV2();

    if (typeof afficherNotificationSucces === 'function') {
        afficherNotificationSucces('Liste réinitialisée');
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
 */
function chargerSeancesV2() {
    const conteneur = document.getElementById('v2-seancesContainer');
    if (!conteneur) return;

    const horaire = db.getSync(cle('horaireHebdo'), []);

    if (horaire.length === 0) {
        conteneur.innerHTML = '<p class="text-muted text-italic">Aucune séance configurée. Cliquez sur « + Ajouter une séance » pour commencer.</p>';
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

    let html = `
        <div style="margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
            <span class="text-muted"><strong>${horaire.length}</strong> séance(s) • <strong>${totalHeures}h</strong>/semaine</span>
        </div>
        <div style="display: grid; gap: 8px;">
    `;

    horaire.forEach((s, index) => {
        const jourNom = s.jour || joursInverse[s.jourNum] || '?';
        const heureDebut = s.heureDebut || s.debut || '?';
        const duree = parseFloat(s.duree) || 2;
        const local = s.local || '';

        html += `
            <div class="item-carte-compact" style="display: flex; align-items: center; padding: 10px 15px; background: var(--bleu-tres-pale); border-radius: 6px;">
                <span style="width: 90px; font-weight: 600; color: var(--bleu-principal);">${jourNom}</span>
                <span style="flex: 1;">${heureDebut} (${duree}h)</span>
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
        formulaire.style.display = 'block';
        if (titre) titre.textContent = 'Nouvelle séance';
        if (btnTexte) btnTexte.textContent = 'Ajouter';

        // Réinitialiser les champs
        setValue('v2-jourSeance', '');
        setValue('v2-debutSeance', '');
        setValue('v2-dureeSeance', '2.0');
        setValue('v2-localSeance', '');

        formulaire.scrollIntoView({ behavior: 'smooth' });
    }
}

/**
 * Modifie une séance existante
 */
function modifierSeanceV2(index) {
    const horaire = db.getSync(cle('horaireHebdo'), []);
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
        formulaire.style.display = 'block';
        if (titre) titre.textContent = 'Modifier la séance';
        if (btnTexte) btnTexte.textContent = 'Enregistrer';

        // Remplir les champs
        setValue('v2-jourSeance', seance.jour || '');
        setValue('v2-debutSeance', seance.heureDebut || seance.debut || '');
        setValue('v2-dureeSeance', seance.duree || '2.0');
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
    if (formulaire) formulaire.style.display = 'none';
}

/**
 * Confirme l'ajout ou la modification d'une séance
 */
function confirmerSeanceV2() {
    const jour = document.getElementById('v2-jourSeance')?.value;
    const debut = document.getElementById('v2-debutSeance')?.value;
    const duree = document.getElementById('v2-dureeSeance')?.value;
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
    if (!duree) {
        alert('Veuillez sélectionner une durée.');
        return;
    }

    // Calculer l'heure de fin
    const [heures, minutes] = debut.split(':').map(Number);
    const dureeFloat = parseFloat(duree);
    const finHeures = heures + Math.floor(dureeFloat);
    const finMinutes = minutes + (dureeFloat % 1) * 60;
    const heureFin = `${String(finHeures + Math.floor(finMinutes / 60)).padStart(2, '0')}:${String(finMinutes % 60).padStart(2, '0')}`;

    const seance = {
        jour: jour,
        heureDebut: debut,
        heureFin: heureFin,
        duree: duree,
        local: local
    };

    let horaire = db.getSync(cle('horaireHebdo'), []);

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

    db.setSync(cle('horaireHebdo'), horaire);

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
}

/**
 * Supprime une séance
 */
function supprimerSeanceV2(index) {
    if (!confirm('Supprimer cette séance ?')) return;

    let horaire = db.getSync(cle('horaireHebdo'), []);
    horaire.splice(index, 1);
    db.setSync(cle('horaireHebdo'), horaire);

    if (typeof afficherNotificationSucces === 'function') {
        afficherNotificationSucces('Séance supprimée');
    }

    chargerSeancesV2();

    // Régénérer les séances complètes si la fonction existe
    if (typeof genererSeancesCompletes === 'function') {
        genererSeancesCompletes();
    }
}

/**
 * Charge l'horaire du groupe actif (compat avec ancien code)
 */
function chargerHoraireGroupeActifV2(numeroGroupe) {
    chargerSeancesV2();
}

/* ===============================
   DONNÉES DE DÉMONSTRATION
   =============================== */

/**
 * Charge l'état de la checkbox données démo
 */
function chargerEtatDonneesDemoV2() {
    const checkbox = document.getElementById('v2-checkboxDonneesDemo');
    if (!checkbox) return;

    // Vérifier si le groupe 9999 existe
    const etudiants = db.getSync('groupeEtudiants', []);
    const groupeDemoExiste = etudiants.some(e => e.groupe === '9999');

    checkbox.checked = groupeDemoExiste;
}

/**
 * Bascule les données de démonstration
 */
function basculerDonneesDemoV2(activer) {
    // Réutiliser la fonction existante si disponible
    if (typeof basculerDonneesDemo === 'function') {
        basculerDonneesDemo(activer);
    } else {
        console.warn('[Trimestre V2] Fonction basculerDonneesDemo non disponible');
    }
}

/* ===============================
   EXPORTS WINDOW
   =============================== */

// Exposer les fonctions au scope global
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
window.chargerDropdownCoursV2 = chargerDropdownCoursV2;
window.changerCoursSelectionneV2 = changerCoursSelectionneV2;
window.afficherDetailsCoursV2 = afficherDetailsCoursV2;
window.afficherFormCoursV2 = afficherFormCoursV2;
window.modifierCoursSelectionneV2 = modifierCoursSelectionneV2;
window.annulerFormCoursV2 = annulerFormCoursV2;
window.sauvegarderCoursV2 = sauvegarderCoursV2;
window.ouvrirModalNouveauCours = ouvrirModalNouveauCours;
window.chargerGroupesCoursV2 = chargerGroupesCoursV2;
window.activerGroupeV2 = activerGroupeV2;
window.gererEtudiantsGroupeV2 = gererEtudiantsGroupeV2;
window.ouvrirModalNouveauGroupe = ouvrirModalNouveauGroupe;
window.chargerListeEtudiantsV2 = chargerListeEtudiantsV2;
window.ajouterEtudiantV2 = ajouterEtudiantV2;
window.supprimerEtudiantV2 = supprimerEtudiantV2;
window.importerFichierEtudiantsV2 = importerFichierEtudiantsV2;
window.previsualiserDonneesV2 = previsualiserDonneesV2;
window.confirmerImportV2 = confirmerImportV2;
window.annulerImportV2 = annulerImportV2;
window.exporterEtudiantsV2 = exporterEtudiantsV2;
window.reinitialiserEtudiantsV2 = reinitialiserEtudiantsV2;
window.chargerHoraireGroupeActifV2 = chargerHoraireGroupeActifV2;
window.chargerSeancesV2 = chargerSeancesV2;
window.afficherFormSeanceV2 = afficherFormSeanceV2;
window.modifierSeanceV2 = modifierSeanceV2;
window.annulerFormSeanceV2 = annulerFormSeanceV2;
window.confirmerSeanceV2 = confirmerSeanceV2;
window.supprimerSeanceV2 = supprimerSeanceV2;
window.chargerEtatDonneesDemoV2 = chargerEtatDonneesDemoV2;
window.basculerDonneesDemoV2 = basculerDonneesDemoV2;

/* ===============================
   INITIALISATION AUTOMATIQUE
   =============================== */

// Initialiser quand le DOM est prêt et que db est disponible
document.addEventListener('DOMContentLoaded', function() {
    // Attendre que db soit prêt
    if (typeof db !== 'undefined' && db.getSync) {
        initialiserTrimestreV2();
    } else {
        // Attendre l'événement db-ready
        document.addEventListener('db-ready', function() {
            initialiserTrimestreV2();
        });
    }
});
