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

    // Charger l'état de la checkbox données démo
    chargerEtatDonneesDemoV2();

    // Populer le dropdown trimestre (pour l'instant, un seul trimestre)
    populerDropdownTrimestreV2();

    console.log('[Trimestre V2] Initialisation terminée');
}

/* ===============================
   CADRE CALENDRIER
   =============================== */

/**
 * Charge les données du cadre calendrier dans les champs v2-
 */
function chargerCadreCalendrierV2() {
    const cadre = db.getSync('cadreCalendrier', null);
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

    // Mettre à jour les statistiques
    afficherStatistiquesTrimestreV2();
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

    db.setSync('cadreCalendrier', cadre);

    // Régénérer le calendrier complet
    if (typeof genererCalendrierComplet === 'function') {
        genererCalendrierComplet();
    }

    // Mettre à jour les statistiques
    afficherStatistiquesTrimestreV2();

    // Notification
    if (typeof afficherNotification === 'function') {
        afficherNotification('Cadre du trimestre sauvegardé');
    }
}

/**
 * Affiche les statistiques du trimestre dans les spans v2-
 */
function afficherStatistiquesTrimestreV2() {
    const calendrier = db.getSync('calendrierComplet', null);

    if (!calendrier) {
        document.getElementById('v2-nombreSemaines').textContent = '0';
        document.getElementById('v2-nombreJoursCours').textContent = '0';
        document.getElementById('v2-totalConges').textContent = '0';
        return;
    }

    // Compter les jours de cours et congés
    let joursCours = 0;
    let conges = 0;

    Object.values(calendrier).forEach(jour => {
        if (jour.type === 'cours') joursCours++;
        if (jour.type === 'conge' || jour.type === 'ferie') conges++;
    });

    // Calculer les semaines (approximation : 5 jours = 1 semaine)
    const semaines = Math.ceil(joursCours / 5);

    document.getElementById('v2-nombreSemaines').textContent = semaines;
    document.getElementById('v2-nombreJoursCours').textContent = joursCours;
    document.getElementById('v2-totalConges').textContent = conges;
}

/* ===============================
   ÉVÉNEMENTS PRÉVUS/IMPRÉVUS
   =============================== */

/**
 * Charge et affiche les événements prévus
 */
function chargerEvenementsPrevusV2() {
    const evenements = db.getSync('evenementsPrevus', []);
    const conteneur = document.getElementById('v2-congesPrevusContainer');

    if (!conteneur) return;

    if (evenements.length === 0) {
        conteneur.innerHTML = '<p class="text-muted text-italic">Aucun événement prévu déclaré.</p>';
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
    const evenements = db.getSync('evenementsImprevus', []);
    const conteneur = document.getElementById('v2-congesImprevusContainer');

    if (!conteneur) return;

    if (evenements.length === 0) {
        conteneur.innerHTML = '<p class="text-muted text-italic">Aucun événement imprévu déclaré.</p>';
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

/**
 * Affiche le formulaire d'ajout d'événement
 * Redirige vers l'ancienne interface legacy qui a les formulaires complets
 */
function afficherFormEvenementV2(type) {
    // Afficher l'ancienne section legacy temporairement
    const sectionLegacy = document.getElementById('reglages-trimestre-legacy');
    if (sectionLegacy) {
        // Retirer temporairement la classe legacy-hidden
        sectionLegacy.classList.remove('legacy-hidden');
        sectionLegacy.style.display = 'block';

        // Masquer la section v2 temporairement
        const sectionV2 = document.getElementById('reglages-trimestre');
        if (sectionV2) sectionV2.style.display = 'none';

        // Scroller vers la section et déclencher le bon formulaire
        sectionLegacy.scrollIntoView({ behavior: 'smooth' });

        setTimeout(() => {
            if (type === 'prevu' && typeof afficherFormEvenement === 'function') {
                afficherFormEvenement();
            } else if (type === 'imprevu' && typeof afficherFormEvenementImprevu === 'function') {
                afficherFormEvenementImprevu();
            }
        }, 300);

        // Ajouter un bouton pour revenir à la vue v2
        ajouterBoutonRetourV2(sectionLegacy);
    } else {
        alert('Fonctionnalité en cours de développement.');
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
 * Modifie un événement
 * Redirige vers l'ancienne interface
 */
function modifierEvenementV2(id, type) {
    const sectionLegacy = document.getElementById('reglages-trimestre-legacy');
    if (sectionLegacy) {
        sectionLegacy.classList.remove('legacy-hidden');
        sectionLegacy.style.display = 'block';

        const sectionV2 = document.getElementById('reglages-trimestre');
        if (sectionV2) sectionV2.style.display = 'none';

        sectionLegacy.scrollIntoView({ behavior: 'smooth' });

        setTimeout(() => {
            if (typeof modifierEvenementEnPlace === 'function') {
                const typeStorage = type === 'prevu' ? 'prevus' : 'imprevus';
                modifierEvenementEnPlace(id, typeStorage);
            }
        }, 300);

        ajouterBoutonRetourV2(sectionLegacy);
    }
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

    if (typeof afficherNotification === 'function') {
        afficherNotification('Événement supprimé');
    }
}

/* ===============================
   DROPDOWN TRIMESTRE
   =============================== */

/**
 * Popule le dropdown de sélection du trimestre
 */
function populerDropdownTrimestreV2() {
    const select = document.getElementById('selectTrimestreActif');
    if (!select) return;

    // Récupérer les infos du cours actif pour déterminer le trimestre
    const coursActif = db.getSync('infoCours', null);

    let nomTrimestre = 'Trimestre actuel';
    if (coursActif && coursActif.session && coursActif.annee) {
        const sessions = { 'A': 'Automne', 'H': 'Hiver', 'E': 'Été' };
        nomTrimestre = `${sessions[coursActif.session] || coursActif.session} ${coursActif.annee}`;
    }

    select.innerHTML = `<option value="actuel" selected>${nomTrimestre}</option>`;
}

/**
 * Change le trimestre actif
 */
function changerTrimestreActif(valeur) {
    console.log('[Trimestre V2] Changement trimestre:', valeur);
    // Pour l'instant, un seul trimestre supporté
    // Cette fonction sera étendue quand le multi-trimestre sera implémenté
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
    if (!coursId) {
        document.getElementById('v2-detailsCours').innerHTML =
            '<p class="text-muted">Sélectionnez un cours pour voir ses détails.</p>';
        document.getElementById('v2-listeGroupes').innerHTML =
            '<p class="text-muted">Sélectionnez un cours pour voir ses groupes.</p>';
        return;
    }

    // Charger les détails du cours
    const cours = db.getSync('listeCours', []);
    const coursSelectionne = cours.find(c => c.id === coursId) || db.getSync('infoCours', null);

    if (coursSelectionne) {
        afficherDetailsCoursV2(coursSelectionne);
        chargerGroupesCoursV2(coursId);
    }
}

/**
 * Affiche les détails d'un cours
 */
function afficherDetailsCoursV2(cours) {
    const conteneur = document.getElementById('v2-detailsCours');
    if (!conteneur) return;

    conteneur.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
            <div>
                <label class="text-muted" style="font-size: 0.85rem;">Sigle</label>
                <div style="font-weight: 600;">${cours.sigle || '—'}</div>
            </div>
            <div>
                <label class="text-muted" style="font-size: 0.85rem;">Titre</label>
                <div style="font-weight: 600;">${cours.titre || '—'}</div>
            </div>
            <div>
                <label class="text-muted" style="font-size: 0.85rem;">Pondération</label>
                <div>${cours.ponderation || '—'}</div>
            </div>
            <div>
                <label class="text-muted" style="font-size: 0.85rem;">Programme</label>
                <div>${cours.programme || '—'}</div>
            </div>
        </div>
        <div style="margin-top: 15px;">
            <button class="btn btn-secondaire btn-sm" onclick="ouvrirEditionCoursV2('${cours.id || 'actuel'}')">Modifier</button>
        </div>
    `;
}

/**
 * Ouvre l'édition d'un cours
 */
function ouvrirEditionCoursV2(coursId) {
    // Réutiliser la fonction existante si disponible
    if (typeof afficherFormCours === 'function') {
        afficherFormCours(coursId);
    } else {
        alert('Utilisez la section Cours dans l\'ancienne interface pour modifier.');
    }
}

/**
 * Ouvre la modal pour créer un nouveau cours
 */
function ouvrirModalNouveauCours() {
    if (typeof afficherFormCours === 'function') {
        afficherFormCours(null); // null = nouveau cours
    } else {
        alert('Fonctionnalité en cours de développement.');
    }
}

/* ===============================
   ACCORDÉON GROUPES
   =============================== */

/**
 * Charge les groupes d'un cours
 */
function chargerGroupesCoursV2(coursId) {
    const conteneur = document.getElementById('v2-listeGroupes');
    if (!conteneur) return;

    // Récupérer les étudiants pour déterminer les groupes
    const etudiants = db.getSync('groupeEtudiants', []);
    const coursActif = db.getSync('infoCours', null);

    // Grouper les étudiants par numéro de groupe
    const groupes = {};
    etudiants.forEach(e => {
        const g = e.groupe || '01';
        if (!groupes[g]) {
            groupes[g] = { numero: g, etudiants: [], coursId: e.coursId || coursId };
        }
        groupes[g].etudiants.push(e);
    });

    if (Object.keys(groupes).length === 0) {
        conteneur.innerHTML = '<p class="text-muted">Aucun groupe trouvé. Importez des étudiants pour créer un groupe.</p>';
        return;
    }

    // Déterminer le groupe actif
    const groupeActif = coursActif?.groupe || Object.keys(groupes)[0];

    let html = '';
    Object.values(groupes).forEach(g => {
        const isActif = g.numero === groupeActif;
        const badgeActif = isActif ? '<span class="badge" style="background: var(--vert-confirmer); color: white; margin-left: 10px; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem;">ACTIF</span>' : '';

        html += `
        <div class="item-carte-compact" style="margin-bottom: 10px; padding: 15px; background: ${isActif ? 'var(--bleu-tres-pale)' : 'white'}; border: 1px solid ${isActif ? 'var(--bleu-principal)' : '#ddd'}; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong>Groupe ${g.numero}</strong>${badgeActif}
                    <div class="text-muted" style="font-size: 0.85rem; margin-top: 4px;">
                        ${g.etudiants.length} étudiant${g.etudiants.length > 1 ? 's' : ''}
                    </div>
                </div>
                <div>
                    ${!isActif ? `<button class="btn btn-confirmer btn-sm" onclick="activerGroupeV2('${g.numero}')" style="margin-right: 5px;">Activer</button>` : ''}
                    <button class="btn btn-secondaire btn-sm" onclick="gererEtudiantsGroupeV2('${g.numero}')">Gérer</button>
                </div>
            </div>
        </div>`;
    });

    conteneur.innerHTML = html;

    // Charger l'horaire du groupe actif
    chargerHoraireGroupeActifV2(groupeActif);
}

/**
 * Active un groupe
 */
function activerGroupeV2(numeroGroupe) {
    const coursActif = db.getSync('infoCours', {});
    coursActif.groupe = numeroGroupe;
    db.setSync('infoCours', coursActif);

    // Recharger l'affichage
    chargerGroupesCoursV2(coursActif.id);

    if (typeof afficherNotification === 'function') {
        afficherNotification(`Groupe ${numeroGroupe} activé`);
    }
}

/**
 * Ouvre la gestion des étudiants d'un groupe
 */
function gererEtudiantsGroupeV2(numeroGroupe) {
    // Naviguer vers la section groupe legacy ou afficher une modal
    if (typeof afficherSection === 'function' && typeof afficherSousSection === 'function') {
        afficherSection('reglages');
        // Pour l'instant, pointer vers l'ancienne section
        alert(`Pour gérer les étudiants du groupe ${numeroGroupe}, utilisez Réglages > Groupe dans l'ancienne interface.`);
    }
}

/**
 * Ouvre la modal pour créer un nouveau groupe
 */
function ouvrirModalNouveauGroupe() {
    alert('Pour créer un nouveau groupe, importez une liste d\'étudiants avec un numéro de groupe différent.');
}

/* ===============================
   ACCORDÉON HORAIRE
   =============================== */

/**
 * Charge l'horaire du groupe actif
 */
function chargerHoraireGroupeActifV2(numeroGroupe) {
    const conteneur = document.getElementById('v2-horaireGroupeActif');
    if (!conteneur) return;

    const horaire = db.getSync('horaireHebdo', []);

    if (horaire.length === 0) {
        conteneur.innerHTML = `
            <p class="text-muted">Aucun horaire configuré pour le groupe ${numeroGroupe}.</p>
            <button class="btn btn-confirmer" onclick="ouvrirConfigurationHoraireV2()">Configurer l'horaire</button>
        `;
        return;
    }

    // Calculer le total d'heures
    let totalHeures = 0;
    horaire.forEach(s => {
        if (s.heureDebut && s.heureFin) {
            const debut = parseInt(s.heureDebut.split(':')[0]) + parseInt(s.heureDebut.split(':')[1]) / 60;
            const fin = parseInt(s.heureFin.split(':')[0]) + parseInt(s.heureFin.split(':')[1]) / 60;
            totalHeures += (fin - debut);
        }
    });

    const joursNoms = ['', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

    let html = `
        <div style="margin-bottom: 15px;">
            <strong>Horaire du groupe ${numeroGroupe}</strong>
            <span class="text-muted" style="margin-left: 10px;">${totalHeures}h/semaine</span>
        </div>
        <div style="display: grid; gap: 8px;">
    `;

    horaire.forEach(s => {
        const jourNom = joursNoms[s.jour] || `Jour ${s.jour}`;
        html += `
            <div style="display: flex; align-items: center; padding: 8px 12px; background: var(--bleu-tres-pale); border-radius: 6px;">
                <span style="width: 100px; font-weight: 500;">${jourNom}</span>
                <span>${s.heureDebut} - ${s.heureFin}</span>
                <span class="text-muted" style="margin-left: auto;">${s.local || ''}</span>
            </div>
        `;
    });

    html += `
        </div>
        <div style="margin-top: 15px;">
            <button class="btn btn-secondaire btn-sm" onclick="ouvrirConfigurationHoraireV2()">Modifier l'horaire</button>
        </div>
    `;

    conteneur.innerHTML = html;
}

/**
 * Ouvre la configuration de l'horaire
 */
function ouvrirConfigurationHoraireV2() {
    // Pointer vers l'ancienne interface pour l'instant
    alert('Pour modifier l\'horaire, utilisez Réglages > Horaire dans l\'ancienne interface.\n\n(Cette fonctionnalité sera intégrée dans une prochaine version.)');
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
window.afficherStatistiquesTrimestreV2 = afficherStatistiquesTrimestreV2;
window.chargerEvenementsPrevusV2 = chargerEvenementsPrevusV2;
window.chargerEvenementsImprevusV2 = chargerEvenementsImprevusV2;
window.afficherFormEvenementV2 = afficherFormEvenementV2;
window.modifierEvenementV2 = modifierEvenementV2;
window.supprimerEvenementV2 = supprimerEvenementV2;
window.populerDropdownTrimestreV2 = populerDropdownTrimestreV2;
window.changerTrimestreActif = changerTrimestreActif;
window.ouvrirModalNouveauTrimestre = ouvrirModalNouveauTrimestre;
window.chargerDropdownCoursV2 = chargerDropdownCoursV2;
window.changerCoursSelectionneV2 = changerCoursSelectionneV2;
window.afficherDetailsCoursV2 = afficherDetailsCoursV2;
window.ouvrirEditionCoursV2 = ouvrirEditionCoursV2;
window.ouvrirModalNouveauCours = ouvrirModalNouveauCours;
window.chargerGroupesCoursV2 = chargerGroupesCoursV2;
window.activerGroupeV2 = activerGroupeV2;
window.gererEtudiantsGroupeV2 = gererEtudiantsGroupeV2;
window.ouvrirModalNouveauGroupe = ouvrirModalNouveauGroupe;
window.chargerHoraireGroupeActifV2 = chargerHoraireGroupeActifV2;
window.ouvrirConfigurationHoraireV2 = ouvrirConfigurationHoraireV2;
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
