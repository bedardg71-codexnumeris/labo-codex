/* ===============================
   ENTITÉS UI - Interface utilisateur
   Beta 96 - Refactoring Trimestre

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

    console.log('[Entités UI] Initialisé');
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
                <div><strong>Niveau :</strong> ${ens.niveau || '-'}</div>
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
    document.getElementById('v2-ens-niveau').value = 'Collégial';
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
    document.getElementById('v2-ens-niveau').value = ens.niveau || 'Collégial';
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
        niveau: document.getElementById('v2-ens-niveau').value,
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

    // Afficher l'aperçu
    HorairesEntite.obtenirParId(horaireId).then(hor => {
        if (!hor) return;

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
    document.getElementById('v2-hor-format').value = '2x2';
    document.getElementById('v2-hor-local').value = '';

    // Mettre à jour le titre et le bouton
    document.getElementById('v2-titreFormHoraire').textContent = 'Nouvel horaire';
    document.getElementById('v2-btnTexteHoraire').textContent = 'Ajouter';

    // Afficher 2 séances par défaut pour format 2x2
    seancesTemp = [
        { jour: 'lundi', heureDebut: '10:00', heureFin: '12:00' },
        { jour: 'mercredi', heureDebut: '10:00', heureFin: '12:00' }
    ];
    afficherSeancesV2();

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
    document.getElementById('v2-hor-format').value = hor.formatHoraire || '2x2';
    document.getElementById('v2-hor-local').value = hor.local || '';

    // Afficher les séances
    afficherSeancesV2();

    // Mettre à jour le titre et le bouton
    document.getElementById('v2-titreFormHoraire').textContent = 'Modifier l\'horaire';
    document.getElementById('v2-btnTexteHoraire').textContent = 'Enregistrer';

    // Afficher le formulaire
    document.getElementById('v2-formulaireHoraire').style.display = 'block';
    document.getElementById('v2-apercuHoraire').style.display = 'none';
}

/**
 * Affiche les séances dans le formulaire
 */
function afficherSeancesV2() {
    const container = document.getElementById('v2-hor-seances');
    if (!container) return;

    if (seancesTemp.length === 0) {
        container.innerHTML = '<p class="text-muted">Aucune séance. Cliquez sur "+ Ajouter une séance".</p>';
        return;
    }

    const joursOptions = HorairesEntite.JOURS.map(j =>
        `<option value="${j.id}">${j.nom}</option>`
    ).join('');

    container.innerHTML = seancesTemp.map((s, i) => `
        <div class="seance-item" style="display: flex; gap: 10px; align-items: center; margin-bottom: 10px; padding: 10px; background: var(--bleu-tres-pale); border-radius: 5px;">
            <select class="controle-form controle-form-compact" style="width: 140px;" onchange="modifierSeanceV2(${i}, 'jour', this.value)">
                ${joursOptions.replace(`value="${s.jour}"`, `value="${s.jour}" selected`)}
            </select>
            <input type="time" class="controle-form controle-form-compact" style="width: 100px;" value="${s.heureDebut || '10:00'}" onchange="modifierSeanceV2(${i}, 'heureDebut', this.value)">
            <span>à</span>
            <input type="time" class="controle-form controle-form-compact" style="width: 100px;" value="${s.heureFin || '12:00'}" onchange="modifierSeanceV2(${i}, 'heureFin', this.value)">
            <button class="btn btn-annuler btn-sm" onclick="supprimerSeanceV2(${i})" title="Supprimer cette séance">✕</button>
        </div>
    `).join('');
}

/**
 * Ajoute une séance
 */
function ajouterSeanceV2() {
    seancesTemp.push({ jour: 'lundi', heureDebut: '10:00', heureFin: '12:00' });
    afficherSeancesV2();
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
 * Supprime une séance
 */
function supprimerSeanceV2(index) {
    seancesTemp.splice(index, 1);
    afficherSeancesV2();
}

/**
 * Met à jour le format horaire (ajuste le nombre de séances suggérées)
 */
function mettreAJourFormatHoraireV2() {
    const format = document.getElementById('v2-hor-format').value;
    const formatInfo = HorairesEntite.FORMATS.find(f => f.id === format);

    // Si on a moins de séances que le format suggère, ajouter
    if (formatInfo && formatInfo.seances > seancesTemp.length) {
        while (seancesTemp.length < formatInfo.seances) {
            seancesTemp.push({ jour: 'lundi', heureDebut: '10:00', heureFin: '12:00' });
        }
        afficherSeancesV2();
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
 */
async function sauvegarderHoraireV2() {
    const donnees = {
        nom: document.getElementById('v2-hor-nom').value.trim(),
        formatHoraire: document.getElementById('v2-hor-format').value,
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

        // Sélectionner le nouvel/modifié horaire
        document.getElementById('v2-selectHoraire').value = horaireEnEdition;
        changerHoraireSelectionneV2(horaireEnEdition);

        // Fermer le formulaire
        annulerFormHoraireV2();

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
 */
async function peuplerDropdownGroupeCours() {
    // Dropdown Cours
    const selectCours = document.getElementById('v2-gc-cours');
    if (selectCours) {
        const cours = await CoursEntite.obtenirTous();
        let options = '<option value="">-- Sélectionner un cours --</option>';
        cours.forEach(c => {
            options += `<option value="${c.id}">${CoursEntite.genererLibelle(c)}</option>`;
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

    // Dropdown Pratique de notation
    const selectPratique = document.getElementById('v2-gc-pratique');
    if (selectPratique) {
        // Utiliser les pratiques existantes du système
        const pratiques = window.pratiquesDisponibles || [];
        let options = '<option value="">-- Sélectionner une pratique --</option>';
        pratiques.forEach(p => {
            options += `<option value="${p.id}">${p.nom || p.id}</option>`;
        });
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

    // Écouter les changements pour l'aperçu
    ['v2-gc-cours', 'v2-gc-enseignant', 'v2-gc-groupe', 'v2-gc-horaire'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('change', mettreAJourApercuGroupeCours);
        }
    });
    document.getElementById('v2-gc-groupe').addEventListener('input', mettreAJourApercuGroupeCours);
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

        let apercu = `${cours?.codeCours || '???'} gr.${groupe} - ${ens?.prenom || ''} ${ens?.nom?.charAt(0) || ''}.`;
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
    afficherFormGroupeCours: afficherFormGroupeCoursV2
};

console.log('[Entités UI] Module chargé');
