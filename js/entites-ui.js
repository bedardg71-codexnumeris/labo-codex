/* ===============================
   ENTITÉS UI - Interface utilisateur
   Beta 95.2 - Refactoring Trimestre

   Gestion de l'interface pour les entités :
   - Cours (simplifié)
   - Enseignant·e
   - Horaire
   - Groupe-cours

   Dépend de: cours-entite.js, enseignants.js, horaires.js, groupe-cours.js
   =============================== */

// ============================================
// VARIABLES D'ÉTAT
// ============================================

let enseignantEnEdition = null;
let horaireEnEdition = null;
let seancesTemp = [];

// ============================================
// INITIALISATION
// ============================================

/**
 * Initialise les interfaces des entités au chargement
 */
async function initialiserEntitesUI() {
    console.log('[Entités UI] Initialisation...');

    // Peupler les dropdowns
    await peuplerDropdownEnseignants();
    await peuplerDropdownHoraires();
    await peuplerDropdownGroupeCours();
    await peuplerDropdownGroupeCoursActif();

    console.log('[Entités UI] Initialisé');
}

// ============================================
// GROUPE-COURS ACTIF - DROPDOWN GLOBAL
// ============================================

/**
 * Peuple le dropdown "Groupe-cours actif" dans l'entête
 * 🆕 BETA 95.2
 */
async function peuplerDropdownGroupeCoursActif() {
    const selectHeader = document.getElementById('selectGroupeCoursHeader');

    if (!selectHeader) return;

    // Obtenir le trimestre actif
    const trimestres = db.getSync('trimestres', []);
    const trimestreActif = trimestres.find(t => t.actif);

    if (!trimestreActif) {
        selectHeader.innerHTML = '<option value="">-- Sélectionnez un trimestre --</option>';
        return;
    }

    // Obtenir les groupe-cours du trimestre
    const cleGC = `${trimestreActif.id.toLowerCase()}_groupesCours`;
    const groupesCours = db.getSync(cleGC, []);

    let options = '<option value="">-- Sélectionner un groupe-cours --</option>';

    if (groupesCours.length > 0) {
        // Hydrater les groupe-cours pour l'affichage
        const cours = db.getSync('cours', []);
        const listeCours = db.getSync('listeCours', []);  // Beta 95.2: aussi chercher dans listeCours (Primo)
        const enseignants = db.getSync('enseignants', []);
        const horaires = db.getSync('horaires', []);

        // Trouver le groupe-cours actif
        const gcActif = db.getSync('groupeCoursActif', null);

        groupesCours.forEach(gc => {
            // Beta 95.2: Chercher dans cours (nouveau) ou listeCours (Primo legacy)
            let coursInfo = cours.find(c => c.id === gc.coursId);
            if (!coursInfo) {
                coursInfo = listeCours.find(c => c.id === gc.coursId || c.sigle === gc.coursId);
            }
            coursInfo = coursInfo || {};

            const ens = enseignants.find(e => e.id === gc.enseignantId) || {};
            const hor = horaires.find(h => h.id === gc.horaireId) || {};

            const sigle = coursInfo.codeCours || coursInfo.code || coursInfo.sigle || null;
            const groupe = gc.groupeNum || gc.groupe || '00001';
            const nomEns = ens.prenom ? `${ens.prenom} ${(ens.nom || '').charAt(0)}.` : '';
            const nomHor = hor.nom || '';

            // 🆕 FIX (9 jan 2026) : Libellé lisible même sans cours
            let label = sigle ? `${sigle} gr.${groupe}` : `Groupe ${groupe}`;
            if (nomEns) label += ` - ${nomEns}`;
            if (nomHor) label += ` (${nomHor})`;

            const selected = gcActif && gc.id === gcActif.id ? ' selected' : '';
            options += `<option value="${gc.id}"${selected}>${label}</option>`;
        });
    }

    // Mettre à jour le dropdown header
    selectHeader.innerHTML = options;

    console.log('[Entités UI] Dropdown groupe-cours actif peuplé:', groupesCours.length, 'options');
}

/**
 * Change le groupe-cours actif depuis le header
 * 🆕 BETA 95.2
 */
async function changerGroupeCoursDepuisHeader(groupeCoursId) {
    await changerGroupeCoursActifV2(groupeCoursId);
}

/**
 * Change le groupe-cours actif depuis le dropdown
 * 🆕 BETA 95.2
 */
async function changerGroupeCoursActifV2(groupeCoursId) {
    if (!groupeCoursId) {
        // Désélectionner le groupe-cours actif
        db.setSync('groupeCoursActif', null);
        console.log('[Entités UI] Groupe-cours désélectionné');
        return;
    }

    console.log('[Entités UI] Changement groupe-cours actif vers:', groupeCoursId);

    // Obtenir le trimestre actif
    const trimestres = db.getSync('trimestres', []);
    const trimestreActif = trimestres.find(t => t.actif);
    if (!trimestreActif) return;

    // Obtenir le groupe-cours
    const cleGC = `${trimestreActif.id.toLowerCase()}_groupesCours`;
    const groupesCours = db.getSync(cleGC, []);
    const gc = groupesCours.find(g => g.id === groupeCoursId);

    if (!gc) {
        console.warn('[Entités UI] Groupe-cours non trouvé:', groupeCoursId);
        return;
    }

    // Mettre à jour le flag actif
    groupesCours.forEach(g => g.actif = (g.id === groupeCoursId));
    db.setSync(cleGC, groupesCours);

    // Stocker groupeCoursActif
    db.setSync('groupeCoursActif', {
        id: gc.id,
        trimestreId: gc.trimestreId || trimestreActif.id,
        coursId: gc.coursId,
        enseignantId: gc.enseignantId,
        horaireId: gc.horaireId,
        groupe: gc.groupe
    });

    // Synchroniser vers infoCours pour compatibilité
    if (typeof GroupeCoursEntite !== 'undefined' && typeof GroupeCoursEntite.synchroniserInfoCours === 'function') {
        await GroupeCoursEntite.synchroniserInfoCours(groupeCoursId);
    }

    // Synchroniser le dropdown header
    const selectHeader = document.getElementById('selectGroupeCoursHeader');
    if (selectHeader) selectHeader.value = groupeCoursId || '';

    // Rafraîchir l'en-tête contextuel
    if (typeof mettreAJourContexteEntete === 'function') {
        mettreAJourContexteEntete();
    }

    // Notification
    if (typeof afficherNotificationSucces === 'function') {
        afficherNotificationSucces('Groupe-cours activé');
    }

    console.log('[Entités UI] Groupe-cours activé:', gc.id);
}

// Initialisation au chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
    // Attendre que les modules d'entités soient chargés
    setTimeout(initialiserEntitesUI, 500);
});

// ============================================
// ENSEIGNANT·E - DROPDOWN
// ============================================

/**
 * Peuple le dropdown des enseignants
 */
async function peuplerDropdownEnseignants() {
    const select = document.getElementById('v2-selectEnseignant');
    const selectGC = document.getElementById('v2-gc-enseignant');

    if (!select) return;

    const enseignants = await EnseignantsEntite.obtenirTous();

    // Construire les options
    let options = '<option value="">Sélectionner un enseignant·e</option>';
    enseignants.forEach(ens => {
        const libelle = EnseignantsEntite.genererLibelle(ens);
        options += `<option value="${ens.id}">${libelle}</option>`;
    });

    // Appliquer aux selects
    select.innerHTML = options;
    if (selectGC) {
        selectGC.innerHTML = options.replace('Sélectionner', '-- Sélectionner');
    }
}

/**
 * Change l'enseignant sélectionné
 */
function changerEnseignantSelectionneV2(enseignantId) {
    const btnModifier = document.getElementById('v2-btnModifierEnseignant');
    const apercu = document.getElementById('v2-apercuEnseignant');

    if (!enseignantId) {
        if (btnModifier) btnModifier.style.display = 'none';
        if (apercu) apercu.innerHTML = '<p class="text-muted">Sélectionnez un enseignant·e pour voir ses détails.</p>';
        return;
    }

    // Afficher le bouton modifier
    if (btnModifier) btnModifier.style.display = '';

    // Afficher l'aperçu
    EnseignantsEntite.obtenirParId(enseignantId).then(ens => {
        if (!ens) return;

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

// ============================================
// ENSEIGNANT·E - FORMULAIRE
// ============================================

/**
 * Affiche le formulaire d'ajout d'enseignant
 */
function afficherFormEnseignantV2() {
    enseignantEnEdition = null;

    // Réinitialiser le formulaire
    document.getElementById('v2-ens-prenom').value = '';
    document.getElementById('v2-ens-nom').value = '';
    document.getElementById('v2-ens-courriel').value = '';
    document.getElementById('v2-ens-institution').value = '';
    document.getElementById('v2-ens-departement').value = '';
    document.getElementById('v2-ens-discipline').value = '';
    document.getElementById('v2-ens-siteWeb').value = '';

    // Mettre à jour le titre et le bouton
    document.getElementById('v2-titreFormEnseignant').textContent = 'Nouvel enseignant·e';
    document.getElementById('v2-btnTexteEnseignant').textContent = 'Ajouter';

    // Afficher le formulaire
    document.getElementById('v2-formulaireEnseignant').style.display = 'block';
    document.getElementById('v2-apercuEnseignant').style.display = 'none';

    // Ouvrir l'accordéon si fermé
    const accordeon = document.getElementById('accordeon-enseignant');
    const contenu = accordeon.querySelector('.accordeon-contenu');
    if (contenu.style.display === 'none') {
        toggleAccordeonV2(accordeon.querySelector('.accordeon-header'));
    }
}

/**
 * Modifie l'enseignant sélectionné
 */
async function modifierEnseignantSelectionneV2() {
    const enseignantId = document.getElementById('v2-selectEnseignant').value;
    if (!enseignantId) return;

    const ens = await EnseignantsEntite.obtenirParId(enseignantId);
    if (!ens) return;

    enseignantEnEdition = enseignantId;

    // Remplir le formulaire
    document.getElementById('v2-ens-prenom').value = ens.prenom || '';
    document.getElementById('v2-ens-nom').value = ens.nom || '';
    document.getElementById('v2-ens-courriel').value = ens.courriel || '';
    document.getElementById('v2-ens-institution').value = ens.institution || '';
    document.getElementById('v2-ens-departement').value = ens.departement || '';
    document.getElementById('v2-ens-discipline').value = ens.discipline || '';
    document.getElementById('v2-ens-siteWeb').value = ens.siteWeb || '';

    // Mettre à jour le titre et le bouton
    document.getElementById('v2-titreFormEnseignant').textContent = 'Modifier l\'enseignant·e';
    document.getElementById('v2-btnTexteEnseignant').textContent = 'Enregistrer';

    // Afficher le formulaire
    document.getElementById('v2-formulaireEnseignant').style.display = 'block';
    document.getElementById('v2-apercuEnseignant').style.display = 'none';
}

/**
 * Annule le formulaire enseignant
 */
function annulerFormEnseignantV2() {
    enseignantEnEdition = null;
    document.getElementById('v2-formulaireEnseignant').style.display = 'none';
    document.getElementById('v2-apercuEnseignant').style.display = 'block';
}

/**
 * Sauvegarde l'enseignant (création ou modification)
 */
async function sauvegarderEnseignantV2() {
    const donnees = {
        prenom: document.getElementById('v2-ens-prenom').value.trim(),
        nom: document.getElementById('v2-ens-nom').value.trim(),
        courriel: document.getElementById('v2-ens-courriel').value.trim(),
        institution: document.getElementById('v2-ens-institution').value.trim(),
        departement: document.getElementById('v2-ens-departement').value.trim(),
        discipline: document.getElementById('v2-ens-discipline').value.trim(),
        siteWeb: document.getElementById('v2-ens-siteWeb').value.trim()
    };

    // Validation
    const validation = EnseignantsEntite.valider(donnees);
    if (!validation.valide) {
        alert('Erreur de validation :\n' + validation.erreurs.join('\n'));
        return;
    }

    try {
        if (enseignantEnEdition) {
            // Modification
            await EnseignantsEntite.mettreAJour(enseignantEnEdition, donnees);
            console.log('[Entités UI] Enseignant mis à jour');
        } else {
            // Création
            const nouvel = await EnseignantsEntite.creer(donnees);
            enseignantEnEdition = nouvel.id;
            console.log('[Entités UI] Enseignant créé:', nouvel.id);
        }

        // Rafraîchir les dropdowns
        await peuplerDropdownEnseignants();

        // Sélectionner le nouvel/modifié enseignant
        document.getElementById('v2-selectEnseignant').value = enseignantEnEdition;
        changerEnseignantSelectionneV2(enseignantEnEdition);

        // Fermer le formulaire
        annulerFormEnseignantV2();

    } catch (err) {
        console.error('[Entités UI] Erreur sauvegarde enseignant:', err);
        alert('Erreur lors de la sauvegarde');
    }
}

// ============================================
// HORAIRE - DROPDOWN
// ============================================

/**
 * Peuple le dropdown des horaires
 */
async function peuplerDropdownHoraires() {
    const select = document.getElementById('v2-selectHoraire');
    const selectGC = document.getElementById('v2-gc-horaire');

    if (!select) return;

    const horaires = await HorairesEntite.obtenirTous();

    // Construire les options
    let options = '<option value="">Sélectionner un horaire</option>';
    horaires.forEach(hor => {
        const libelle = HorairesEntite.genererLibelle(hor);
        options += `<option value="${hor.id}">${libelle}</option>`;
    });

    // Appliquer aux selects
    select.innerHTML = options;
    if (selectGC) {
        selectGC.innerHTML = options.replace('Sélectionner', '-- Sélectionner');
    }
}

/**
 * Change l'horaire sélectionné
 * NOTE: Cette fonction est un doublon de celle dans trimestre-v2.js
 * Elle est conservée pour compatibilité mais devrait utiliser la version de trimestre-v2.js
 */
function changerHoraireSelectionneV2(horaireId) {
    const btnModifier = document.getElementById('v2-btnModifierHoraire');
    const apercu = document.getElementById('v2-apercuHoraire');

    if (!horaireId) {
        if (btnModifier) btnModifier.style.display = 'none';
        if (apercu) apercu.innerHTML = '<p class="text-muted">Sélectionnez un horaire pour voir ses détails.</p>';
        return;
    }

    // Afficher le bouton modifier
    if (btnModifier) btnModifier.style.display = '';

    // Guard: Si l'élément aperçu n'existe pas, ne pas continuer
    if (!apercu) {
        console.log('[Entités UI] v2-apercuHoraire non trouvé, utilisation interface trimestre-v2.js');
        return;
    }

    // Afficher l'aperçu
    HorairesEntite.obtenirParId(horaireId).then(hor => {
        if (!hor || !apercu) return;

        const seancesHTML = (hor.seances || []).map(s => HorairesEntite.formaterSeance(s)).join('<br>');

        apercu.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
                <div>
                    <strong>Nom :</strong> ${hor.nom || '-'}<br>
                    <strong>Format :</strong> ${hor.formatHoraire || '-'}<br>
                    <strong>Local :</strong> ${hor.local || '-'}
                </div>
                <div>
                    <strong>Séances :</strong><br>
                    ${seancesHTML || '<em>Aucune séance</em>'}
                </div>
            </div>
        `;
    });
}

// ============================================
// HORAIRE - FORMULAIRE
// ============================================

/**
 * Affiche le formulaire d'ajout d'horaire
 */
function afficherFormHoraireV2() {
    horaireEnEdition = null;
    seancesTemp = [];

    // Réinitialiser le formulaire
    document.getElementById('v2-hor-nom').value = '';
    document.getElementById('v2-hor-local').value = '';
    document.getElementById('v2-hor-nbSeances').value = '2';
    document.getElementById('v2-hor-periodesParSeance').value = '2';

    // Mettre à jour le titre et le bouton
    document.getElementById('v2-titreFormHoraire').textContent = 'Nouvel horaire';
    document.getElementById('v2-btnTexteHoraire').textContent = 'Ajouter';

    // Générer les séances selon le format par défaut (2 séances)
    mettreAJourSeancesHoraireV2();

    // Afficher le formulaire
    document.getElementById('v2-formulaireHoraire').style.display = 'block';
    document.getElementById('v2-apercuHoraire').style.display = 'none';

    // Ouvrir l'accordéon si fermé
    const accordeon = document.getElementById('accordeon-horaire');
    const contenu = accordeon.querySelector('.accordeon-contenu');
    if (contenu.style.display === 'none') {
        toggleAccordeonV2(accordeon.querySelector('.accordeon-header'));
    }
}

/**
 * Modifie l'horaire sélectionné
 */
async function modifierHoraireSelectionneV2() {
    const horaireId = document.getElementById('v2-selectHoraire').value;
    if (!horaireId) return;

    const hor = await HorairesEntite.obtenirParId(horaireId);
    if (!hor) return;

    horaireEnEdition = horaireId;
    seancesTemp = [...(hor.seances || [])];

    // Remplir le formulaire
    document.getElementById('v2-hor-nom').value = hor.nom || '';
    document.getElementById('v2-hor-local').value = hor.local || '';

    // Remplir les champs de format (déduire depuis l'ancien format ou les séances)
    const nbSeances = hor.nbSeances || hor.seances?.length || 2;
    const periodesParSeance = hor.periodesParSeance || 2;
    document.getElementById('v2-hor-nbSeances').value = String(nbSeances);
    document.getElementById('v2-hor-periodesParSeance').value = String(periodesParSeance);

    // Afficher les séances et mettre à jour le résumé
    afficherSeancesV2();
    mettreAJourResumeFormatV2();

    // Mettre à jour le titre et le bouton
    document.getElementById('v2-titreFormHoraire').textContent = 'Modifier l\'horaire';
    document.getElementById('v2-btnTexteHoraire').textContent = 'Enregistrer';

    // Afficher le formulaire
    document.getElementById('v2-formulaireHoraire').style.display = 'block';
    document.getElementById('v2-apercuHoraire').style.display = 'none';
}

/**
 * Affiche les séances dans le formulaire
 * 🆕 BETA 95.2 : Sans bouton supprimer (nombre fixé par dropdown)
 */
function afficherSeancesV2() {
    const container = document.getElementById('v2-hor-seances');
    if (!container) return;

    if (seancesTemp.length === 0) {
        container.innerHTML = '<p class="text-muted">Sélectionnez le nombre de séances ci-dessus.</p>';
        return;
    }

    const joursOptions = HorairesEntite.JOURS.map(j =>
        `<option value="${j.id}">${j.nom}</option>`
    ).join('');

    container.innerHTML = seancesTemp.map((s, i) => `
        <div class="seance-item" style="display: flex; gap: 10px; align-items: center; margin-bottom: 10px; padding: 10px; background: var(--bleu-tres-pale); border-radius: 5px;">
            <span style="font-weight: 500; min-width: 70px;">Séance ${i + 1}</span>
            <select class="controle-form controle-form-compact" style="width: 140px;" onchange="modifierSeanceV2(${i}, 'jour', this.value)">
                ${joursOptions.replace(`value="${s.jour}"`, `value="${s.jour}" selected`)}
            </select>
            <input type="time" class="controle-form controle-form-compact" style="width: 100px;" value="${s.heureDebut || '10:00'}" onchange="modifierSeanceV2(${i}, 'heureDebut', this.value)">
            <span>à</span>
            <input type="time" class="controle-form controle-form-compact" style="width: 100px;" value="${s.heureFin || '12:00'}" onchange="modifierSeanceV2(${i}, 'heureFin', this.value)">
        </div>
    `).join('');
}

/**
 * Modifie une propriété d'une séance
 */
function modifierSeanceV2(index, prop, valeur) {
    if (seancesTemp[index]) {
        seancesTemp[index][prop] = valeur;
    }
}

/**
 * Met à jour les séances selon le nombre sélectionné
 * 🆕 BETA 95.2 : Nouvelle logique basée sur nb séances + périodes/séance
 */
function mettreAJourSeancesHoraireV2() {
    const nbSeances = parseInt(document.getElementById('v2-hor-nbSeances').value) || 2;
    const periodesParSeance = parseInt(document.getElementById('v2-hor-periodesParSeance').value) || 2;

    // Jours par défaut pour les séances
    const joursDefaut = ['lundi', 'mercredi', 'vendredi', 'mardi', 'jeudi'];

    // Ajuster le nombre de séances
    while (seancesTemp.length < nbSeances) {
        const jourIndex = seancesTemp.length % joursDefaut.length;
        seancesTemp.push({
            jour: joursDefaut[jourIndex],
            heureDebut: '10:00',
            heureFin: '12:00'
        });
    }
    while (seancesTemp.length > nbSeances) {
        seancesTemp.pop();
    }

    // Mettre à jour l'affichage
    afficherSeancesV2();
    mettreAJourResumeFormatV2();
}

/**
 * Met à jour le résumé du format horaire
 */
function mettreAJourResumeFormatV2() {
    const nbSeances = parseInt(document.getElementById('v2-hor-nbSeances').value) || 2;
    const periodesParSeance = parseInt(document.getElementById('v2-hor-periodesParSeance').value) || 2;
    const totalPeriodes = nbSeances * periodesParSeance;

    const resumeElem = document.getElementById('v2-hor-formatResume');
    if (resumeElem) {
        resumeElem.textContent = `${nbSeances} séance${nbSeances > 1 ? 's' : ''} × ${periodesParSeance} période${periodesParSeance > 1 ? 's' : ''} = ${totalPeriodes} périodes/semaine`;
    }
}

/**
 * Annule le formulaire horaire
 */
function annulerFormHoraireV2() {
    horaireEnEdition = null;
    seancesTemp = [];
    document.getElementById('v2-formulaireHoraire').style.display = 'none';
    document.getElementById('v2-apercuHoraire').style.display = 'block';
}

/**
 * Sauvegarde l'horaire (création ou modification)
 * 🆕 BETA 95.2 : Utilise nbSeances et periodesParSeance
 */
async function sauvegarderHoraireV2() {
    const nbSeances = parseInt(document.getElementById('v2-hor-nbSeances').value) || 2;
    const periodesParSeance = parseInt(document.getElementById('v2-hor-periodesParSeance').value) || 2;

    const donnees = {
        nom: document.getElementById('v2-hor-nom').value.trim(),
        nbSeances: nbSeances,
        periodesParSeance: periodesParSeance,
        formatHoraire: `${nbSeances}x${periodesParSeance}`,  // Format calculé pour compatibilité
        local: document.getElementById('v2-hor-local').value.trim(),
        seances: seancesTemp
    };

    // Générer nom auto si vide
    if (!donnees.nom) {
        donnees.nom = HorairesEntite.genererNomAuto(donnees.seances);
    }

    // Validation
    const validation = HorairesEntite.valider(donnees);
    if (!validation.valide) {
        alert('Erreur de validation :\n' + validation.erreurs.join('\n'));
        return;
    }

    try {
        if (horaireEnEdition) {
            // Modification
            await HorairesEntite.mettreAJour(horaireEnEdition, donnees);
            console.log('[Entités UI] Horaire mis à jour');
        } else {
            // Création
            const nouvel = await HorairesEntite.creer(donnees);
            horaireEnEdition = nouvel.id;
            console.log('[Entités UI] Horaire créé:', nouvel.id);
        }

        // Rafraîchir les dropdowns
        await peuplerDropdownHoraires();

        // Sélectionner le nouvel/modifié horaire (avec guard)
        const selectHoraire = document.getElementById('v2-selectHoraire');
        if (selectHoraire) {
            selectHoraire.value = horaireEnEdition;
            changerHoraireSelectionneV2(horaireEnEdition);
        }

        // Fermer le formulaire (avec guard)
        const formulaire = document.getElementById('v2-formulaireHoraire');
        if (formulaire) {
            formulaire.style.display = 'none';
        }
        const apercuStyle = document.getElementById('v2-apercuHoraire');
        if (apercuStyle) {
            apercuStyle.style.display = 'block';
        }

    } catch (err) {
        console.error('[Entités UI] Erreur sauvegarde horaire:', err);
        alert('Erreur lors de la sauvegarde');
    }
}

// ============================================
// GROUPE-COURS - DROPDOWN & LISTE
// ============================================

/**
 * Peuple les dropdowns du formulaire groupe-cours
 * 🆕 BETA 95.2 : Inclut les cours legacy et les pratiques de bibliothèque
 */
async function peuplerDropdownGroupeCours() {
    // Dropdown Cours - Inclure aussi les cours legacy (listeCours)
    const selectCours = document.getElementById('v2-gc-cours');
    if (selectCours) {
        let options = '<option value="">-- Sélectionner un cours --</option>';

        // 1. Nouveaux cours (entité)
        const coursEntites = await CoursEntite.obtenirTous();
        coursEntites.forEach(c => {
            options += `<option value="${c.id}">${CoursEntite.genererLibelle(c)}</option>`;
        });

        // 2. Cours legacy (listeCours) - pour rétrocompatibilité
        const coursLegacy = db.getSync('listeCours', []);
        coursLegacy.forEach(c => {
            // Ne pas dupliquer si déjà présent comme entité
            const dejaPresent = coursEntites.some(ce => ce.codeCours === c.sigle);
            if (!dejaPresent) {
                const libelle = c.sigle ? `${c.sigle} - ${c.nomCours || 'Sans nom'}` : (c.nomCours || 'Cours sans sigle');
                options += `<option value="legacy_${c.id || c.sigle}">${libelle} (legacy)</option>`;
            }
        });

        selectCours.innerHTML = options;
    }

    // Dropdown Enseignant
    const selectEns = document.getElementById('v2-gc-enseignant');
    if (selectEns) {
        const enseignants = await EnseignantsEntite.obtenirTous();
        let options = '<option value="">-- Sélectionner un enseignant·e --</option>';
        enseignants.forEach(e => {
            options += `<option value="${e.id}">${EnseignantsEntite.genererLibelle(e)}</option>`;
        });
        selectEns.innerHTML = options;
    }

    // Dropdown Horaire
    const selectHor = document.getElementById('v2-gc-horaire');
    if (selectHor) {
        const horaires = await HorairesEntite.obtenirTous();
        let options = '<option value="">-- Sélectionner un horaire --</option>';
        horaires.forEach(h => {
            options += `<option value="${h.id}">${HorairesEntite.genererLibelle(h)}</option>`;
        });
        selectHor.innerHTML = options;
    }

    // 🆕 BETA 95.2 : Dropdown Groupe d'étudiants
    const selectGroupe = document.getElementById('v2-gc-groupe');
    if (selectGroupe) {
        let options = '<option value="">-- Sélectionner un groupe --</option>';

        // Lire les étudiants depuis groupeEtudiants (clé namespacée)
        const cleGroupeEtudiants = typeof cle === 'function' ? cle('groupeEtudiants') : 'groupeEtudiants';
        const listeEtudiants = db.getSync(cleGroupeEtudiants, []);

        // Extraire les groupes uniques depuis les étudiants
        const groupesUniques = new Map();
        listeEtudiants.forEach(e => {
            const groupe = e.groupe || e.numeroGroupe || '00001';
            if (!groupesUniques.has(groupe)) {
                groupesUniques.set(groupe, 0);
            }
            groupesUniques.set(groupe, groupesUniques.get(groupe) + 1);
        });

        // Trier les groupes par numéro
        const groupesTries = Array.from(groupesUniques.entries()).sort((a, b) => a[0].localeCompare(b[0]));

        if (groupesTries.length > 0) {
            groupesTries.forEach(([numero, count]) => {
                const label = `Groupe ${numero} (${count} étudiants)`;
                options += `<option value="${numero}">${label}</option>`;
            });
        }

        selectGroupe.innerHTML = options;
        console.log('[Entités UI] Groupes d\'étudiants trouvés:', groupesTries.length, 'depuis clé:', cleGroupeEtudiants);
    }

    // Dropdown Pratique de notation - Utiliser la bibliothèque de pratiques
    const selectPratique = document.getElementById('v2-gc-pratique');
    if (selectPratique) {
        let options = '<option value="">-- Sélectionner une pratique --</option>';

        // 1. Essayer d'utiliser la bibliothèque de pratiques (async)
        if (typeof obtenirToutesLesPratiquesBibliotheque === 'function') {
            try {
                const pratiques = await obtenirToutesLesPratiquesBibliotheque();
                pratiques.forEach(p => {
                    const nom = p.nom || p.typePratique || p.id;
                    options += `<option value="${p.id}">${nom}</option>`;
                });
            } catch (e) {
                console.warn('[Entités UI] Erreur bibliothèque pratiques:', e);
            }
        }

        // 2. Fallback: lire pratiquesNotation du localStorage
        if (options === '<option value="">-- Sélectionner une pratique --</option>') {
            const pratiquesLocal = db.getSync('pratiquesNotation', []);
            pratiquesLocal.forEach(p => {
                const nom = p.nom || p.typePratique || p.id;
                options += `<option value="${p.id}">${nom}</option>`;
            });
        }

        // 3. Si toujours vide, ajouter des options par défaut
        if (options === '<option value="">-- Sélectionner une pratique --</option>') {
            options += '<option value="sommative_standard">Sommative standard</option>';
            options += '<option value="formative">Formative</option>';
            options += '<option value="auto_evaluation">Auto-évaluation</option>';
        }

        selectPratique.innerHTML = options;
    }

    // Rafraîchir la liste des groupe-cours
    await afficherListeGroupeCoursV2();
}

/**
 * Affiche la liste des groupe-cours du trimestre actif
 */
async function afficherListeGroupeCoursV2() {
    const container = document.getElementById('v2-listeGroupeCours');
    if (!container) return;

    const trimestreActif = window.trimestreActif;
    if (!trimestreActif) {
        container.innerHTML = '<p class="text-muted">Aucun trimestre actif. Sélectionnez un trimestre d\'abord.</p>';
        return;
    }

    const groupesCours = await GroupeCoursEntite.obtenirTousParTrimestre(trimestreActif);

    if (groupesCours.length === 0) {
        container.innerHTML = '<p class="text-muted">Aucun groupe-cours configuré pour ce trimestre.</p>';
        return;
    }

    // Hydrater les groupe-cours pour affichage
    const items = await Promise.all(groupesCours.map(async gc => {
        const hydrate = await GroupeCoursEntite.hydrater(gc);
        const libelle = GroupeCoursEntite.genererLibelle(hydrate);
        const actifBadge = gc.actif ? '<span style="background: var(--vert-accent); color: white; padding: 2px 6px; border-radius: 3px; font-size: 0.75rem; margin-left: 10px;">Actif</span>' : '';

        return `
            <div class="groupe-cours-item" style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: var(--bleu-tres-pale); border-radius: 5px; margin-bottom: 8px;">
                <span>${libelle}${actifBadge}</span>
                <div class="btn-groupe" style="gap: 5px;">
                    ${!gc.actif ? `<button class="btn btn-principal btn-sm" onclick="activerGroupeCoursV2('${gc.id}')">Activer</button>` : ''}
                    <button class="btn btn-annuler btn-sm" onclick="supprimerGroupeCoursV2('${gc.id}')" title="Supprimer">✕</button>
                </div>
            </div>
        `;
    }));

    container.innerHTML = items.join('');
}

// ============================================
// GROUPE-COURS - FORMULAIRE
// ============================================

/**
 * Affiche le formulaire de création de groupe-cours
 */
function afficherFormGroupeCoursV2() {
    // Réinitialiser le formulaire
    document.getElementById('v2-gc-cours').value = '';
    document.getElementById('v2-gc-enseignant').value = '';
    document.getElementById('v2-gc-groupe').value = '';
    document.getElementById('v2-gc-horaire').value = '';
    document.getElementById('v2-gc-pratique').value = '';
    document.getElementById('v2-gc-apercu-texte').textContent = 'Complétez les champs pour voir l\'aperçu';

    // Afficher le formulaire
    document.getElementById('v2-formulaireGroupeCours').style.display = 'block';

    // Ouvrir l'accordéon si fermé
    const accordeon = document.getElementById('accordeon-groupe-cours');
    const contenu = accordeon.querySelector('.accordeon-contenu');
    if (contenu.style.display === 'none') {
        toggleAccordeonV2(accordeon.querySelector('.accordeon-header'));
    }

    // Écouter les changements pour l'aperçu (tous sont des selects maintenant)
    ['v2-gc-cours', 'v2-gc-enseignant', 'v2-gc-groupe', 'v2-gc-horaire', 'v2-gc-pratique'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('change', mettreAJourApercuGroupeCours);
        }
    });
}

/**
 * Met à jour l'aperçu du groupe-cours
 */
async function mettreAJourApercuGroupeCours() {
    const coursId = document.getElementById('v2-gc-cours').value;
    const enseignantId = document.getElementById('v2-gc-enseignant').value;
    const groupe = document.getElementById('v2-gc-groupe').value;
    const horaireId = document.getElementById('v2-gc-horaire').value;

    const apercuSpan = document.getElementById('v2-gc-apercu-texte');

    if (!coursId || !enseignantId || !groupe) {
        apercuSpan.textContent = 'Complétez les champs obligatoires pour voir l\'aperçu';
        apercuSpan.className = 'text-muted';
        return;
    }

    try {
        const cours = await CoursEntite.obtenirParId(coursId);
        const ens = await EnseignantsEntite.obtenirParId(enseignantId);
        const hor = horaireId ? await HorairesEntite.obtenirParId(horaireId) : null;

        // 🆕 FIX (9 jan 2026) : Libellé lisible même sans cours
        const sigleCours = cours?.codeCours || cours?.code || cours?.sigle || null;
        let apercu = sigleCours ? `${sigleCours} gr.${groupe}` : `Groupe ${groupe}`;
        if (ens?.prenom || ens?.nom) apercu += ` - ${ens?.prenom || ''} ${ens?.nom?.charAt(0) || ''}.`;
        if (hor) {
            apercu += ` - ${hor.nom || ''}`;
        }

        apercuSpan.textContent = apercu;
        apercuSpan.className = '';
        apercuSpan.style.color = 'var(--bleu-principal)';
        apercuSpan.style.fontWeight = '500';
    } catch (err) {
        apercuSpan.textContent = 'Erreur lors du chargement de l\'aperçu';
        apercuSpan.className = 'text-muted';
    }
}

/**
 * Annule le formulaire groupe-cours
 */
function annulerFormGroupeCoursV2() {
    document.getElementById('v2-formulaireGroupeCours').style.display = 'none';
}

/**
 * Sauvegarde le groupe-cours
 */
async function sauvegarderGroupeCoursV2() {
    const trimestreActif = window.trimestreActif;
    if (!trimestreActif) {
        alert('Veuillez d\'abord sélectionner un trimestre actif.');
        return;
    }

    const donnees = {
        trimestreId: trimestreActif,
        coursId: document.getElementById('v2-gc-cours').value,
        enseignantId: document.getElementById('v2-gc-enseignant').value,
        groupe: document.getElementById('v2-gc-groupe').value.trim(),
        horaireId: document.getElementById('v2-gc-horaire').value || null,
        pratiqueId: document.getElementById('v2-gc-pratique').value || null
    };

    // Validation
    const validation = GroupeCoursEntite.valider(donnees);
    if (!validation.valide) {
        alert('Erreur de validation :\n' + validation.erreurs.join('\n'));
        return;
    }

    try {
        const nouvelGC = await GroupeCoursEntite.creer(donnees);
        console.log('[Entités UI] Groupe-cours créé:', nouvelGC.id);

        // Synchroniser avec infoCours pour rétrocompatibilité
        await GroupeCoursEntite.synchroniserInfoCours(trimestreActif);

        // Rafraîchir la liste
        await afficherListeGroupeCoursV2();

        // 🆕 BETA 95.2 : Rafraîchir le dropdown groupe-cours actif
        await peuplerDropdownGroupeCoursActif();

        // Fermer le formulaire
        annulerFormGroupeCoursV2();

        // Notification
        if (typeof afficherNotification === 'function') {
            afficherNotification('Groupe-cours créé avec succès', 'succes');
        }

    } catch (err) {
        console.error('[Entités UI] Erreur création groupe-cours:', err);
        alert('Erreur lors de la création : ' + err.message);
    }
}

/**
 * Active un groupe-cours
 */
async function activerGroupeCoursV2(groupeCoursId) {
    const trimestreActif = window.trimestreActif;
    if (!trimestreActif) return;

    try {
        await GroupeCoursEntite.activer(trimestreActif, groupeCoursId);

        // Synchroniser avec infoCours pour rétrocompatibilité
        await GroupeCoursEntite.synchroniserInfoCours(trimestreActif);

        // Rafraîchir la liste
        await afficherListeGroupeCoursV2();

        // Rafraîchir le dropdown des cours dans l'ancien système (rétrocompatibilité)
        if (typeof chargerCoursSelectV2 === 'function') {
            chargerCoursSelectV2();
        }

        console.log('[Entités UI] Groupe-cours activé:', groupeCoursId);

    } catch (err) {
        console.error('[Entités UI] Erreur activation groupe-cours:', err);
        alert('Erreur lors de l\'activation');
    }
}

/**
 * Supprime un groupe-cours
 */
async function supprimerGroupeCoursV2(groupeCoursId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce groupe-cours ?')) {
        return;
    }

    const trimestreActif = window.trimestreActif;
    if (!trimestreActif) return;

    try {
        await GroupeCoursEntite.supprimer(trimestreActif, groupeCoursId);

        // Rafraîchir la liste
        await afficherListeGroupeCoursV2();

        console.log('[Entités UI] Groupe-cours supprimé:', groupeCoursId);

    } catch (err) {
        console.error('[Entités UI] Erreur suppression groupe-cours:', err);
        alert('Erreur lors de la suppression');
    }
}

// ============================================
// EXPORTS GLOBAUX
// ============================================

window.EntitesUI = {
    initialiser: initialiserEntitesUI,

    // Enseignants
    peuplerDropdownEnseignants,
    afficherFormEnseignant: afficherFormEnseignantV2,

    // Horaires
    peuplerDropdownHoraires,
    afficherFormHoraire: afficherFormHoraireV2,

    // Groupe-cours
    peuplerDropdownGroupeCours,
    afficherListeGroupeCours: afficherListeGroupeCoursV2,
    afficherFormGroupeCours: afficherFormGroupeCoursV2,

    // 🆕 BETA 95.2 : Groupe-cours actif
    peuplerDropdownGroupeCoursActif,
    changerGroupeCoursActif: changerGroupeCoursActifV2
};

// Exposer globalement pour les handlers HTML
window.peuplerDropdownGroupeCoursActif = peuplerDropdownGroupeCoursActif;
window.changerGroupeCoursActifV2 = changerGroupeCoursActifV2;
window.changerGroupeCoursDepuisHeader = changerGroupeCoursDepuisHeader;

// Enseignant - fonctions pour les onclick HTML
window.afficherFormEnseignantV2 = afficherFormEnseignantV2;
window.changerEnseignantSelectionneV2 = changerEnseignantSelectionneV2;
window.modifierEnseignantSelectionneV2 = modifierEnseignantSelectionneV2;
// DÉSACTIVÉ (6 jan 2026) - Utilisez versions de trimestre-v2.js
// window.annulerFormEnseignantV2 = annulerFormEnseignantV2;
// window.sauvegarderEnseignantV2 = sauvegarderEnseignantV2;

// Horaire - fonctions pour les onclick HTML
window.afficherFormHoraireV2 = afficherFormHoraireV2;
// DÉSACTIVÉ (6 jan 2026) - Utilisez versions de trimestre-v2.js (avec groupeAssocie)
// window.changerHoraireSelectionneV2 = changerHoraireSelectionneV2;
window.modifierHoraireSelectionneV2 = modifierHoraireSelectionneV2;
// window.annulerFormHoraireV2 = annulerFormHoraireV2;
// window.sauvegarderHoraireV2 = sauvegarderHoraireV2;

// Groupe-cours - fonctions pour les onclick HTML
window.afficherFormGroupeCoursV2 = afficherFormGroupeCoursV2;
// DÉSACTIVÉ (6 jan 2026) - Utilisez versions de trimestre-v2.js
// window.annulerFormGroupeCoursV2 = annulerFormGroupeCoursV2;
// window.sauvegarderGroupeCoursV2 = sauvegarderGroupeCoursV2;
window.activerGroupeCoursV2 = activerGroupeCoursV2;
window.supprimerGroupeCoursV2 = supprimerGroupeCoursV2;
window.mettreAJourApercuGroupeCours = mettreAJourApercuGroupeCours;

console.log('[Entités UI] Module chargé');
