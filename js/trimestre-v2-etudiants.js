/* ===============================
   MODULE: TRIMESTRE V2 — ÉTUDIANTS
   Refactor étape 3 session B (17 mai 2026) : extrait depuis trimestre-v2.js
   lignes 119-1014 (zone 4 MODULES-MAP §2.4) + handlers wrappers (anciennes
   lignes 3158-3164, déplacés ici car logique étudiants).

   Périmètre : CRUD étudiants + groupes + import/export CSV (TSV/CSV/coller),
   dropdown groupes, dispatch d'actions (Éditer/Supprimer + Inactivité/Décrochage),
   sauvegarde groupe d'étudiants + reset filtre, wrappers handlers dispatcher
   `data-on-change` (Phase 5 Lot 5.12a).

   Variables module-scope migrées : `donneesImportEnAttenteV2` (file d'attente
   import) et `etudiantEnEditionIndex` (index d'édition dans la liste complète).

   Dépendances cross-module accédées via `window.X` (résidu trimestre-v2.js
   chargé AVANT ce fichier dans index.html) :
   - `window.mettreAJourGuideGroupeCours` (helper transversal résiduel,
     appelé après import/reset/suppression/sauvegarde de groupe)

   Note : `peuplerDropdownGroupeCours` (sans `Actif`) avec `typeof === 'function'`
   est défensif (legacy archivé `js/_archives/entites-ui.js`, ne sera jamais
   trouvé en production) — conservé pour préservation comportementale stricte.
   =============================== */

(function() {
'use strict';

// Wrappers défensifs notifications — duplication assumée (consolidation
// `utils-notifications.js` reportée à un chantier post-refactor).
function afficherNotificationSucces(message, details) {
    if (typeof window.afficherNotificationSucces === 'function') {
        window.afficherNotificationSucces(message, details);
    }
}

function afficherNotificationErreur(message, details) {
    if (typeof window.afficherNotificationErreur === 'function') {
        window.afficherNotificationErreur(message, details);
    } else {
        console.warn('[Trimestre V2 Étudiants] Erreur :', message, details || '');
    }
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
        // security-ok: code transféré tel quel depuis trimestre-v2.js (refactor session B) — bug latent pré-existant inscrit SUIVI-BUGS
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
                    <select class="controle-form controle-form-compact" data-on-change="actionEtudiantV2Handler" data-da="${e.da}">
                        <option value="">—</option>
                        <option value="editer">Éditer</option>
                        <option value="supprimer">Supprimer</option>
                    </select>
                </td>
                <td style="text-align: center;">
                    <select class="controle-form controle-form-compact" data-on-change="remarqueEtudiantV2Handler" data-da="${e.da}">
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
            // security-ok: code transféré tel quel depuis trimestre-v2.js (refactor session B) — bug latent pré-existant inscrit SUIVI-BUGS
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

    // Marqueur démo : un groupe est considéré démo si au moins un de ses
    // étudiants a isDemo=true. Cohérent avec le traitement des autres
    // sélecteurs latéraux (horaires, enseignants).
    const estGroupeDemo = (grp) => etudiants.some(e =>
        String(e.groupe || '').padStart(5, '0') === grp && e.isDemo === true
    );

    // Reconstruire les options
    let html = '<option value="">Tous les groupes</option>';
    groupesTries.forEach(grp => {
        const suffixeDemo = estGroupeDemo(grp) ? ' (démo)' : '';
        html += `<option value="${grp}">${grp}${suffixeDemo}</option>`;
    });
    select.innerHTML = html;

    // Restaurer la sélection : en priorité la valeur actuelle du DOM (évite
    // de casser une interaction en cours), sinon la valeur persistée par
    // trimestre (permet à entrerEnDemo de pré-sélectionner '0demo').
    if (valeurActuelle && groupesSet.has(valeurActuelle)) {
        select.value = valeurActuelle;
    } else {
        const groupeSauvegarde = db.getSync(cle('groupeSelectionne'), null);
        if (groupeSauvegarde && groupesSet.has(groupeSauvegarde)) {
            select.value = groupeSauvegarde;
        }
    }
}

/**
 * Filtre la liste des étudiants par groupe sélectionné
 * ✅ CORRECTION (9 jan 2026): Async pour supporter chargerListeEtudiantsV2 async
 */
async function filtrerParGroupeV2() {
    // Persister le choix pour le retour dans la section (pré-sélection démo)
    const select = document.getElementById('v2-selectGroupe');
    if (select) {
        db.setSync(cle('groupeSelectionne'), select.value || '');
    }
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

    if (donneesImportEnAttenteV2.length === 0) {
        console.warn('⚠️ [confirmerImportV2] Aucune donnée en attente !');
        return;
    }

    const coursActif = db.getSync('infoCours', null);
    // ✅ CORRECTION (31 déc 2025): Utiliser namespace
    const cleEtud = cle('groupeEtudiants');

    // ✅ CORRECTION (9 jan 2026): Lire depuis IndexedDB pour avoir les données complètes
    let etudiants = await db.get(cleEtud) || [];

    donneesImportEnAttenteV2.forEach(e => {
        etudiants.push({
            ...e,
            coursId: coursActif?.id || ''
        });
    });

    // ✅ CORRECTION (9 jan 2026): Utiliser db.set (async) pour écriture fiable
    await db.set(cleEtud, etudiants);

    // Vérification immédiate
    const verification = db.getSync(cleEtud, []).length;

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
    if (typeof window.mettreAJourGuideGroupeCours === 'function') {
        window.mettreAJourGuideGroupeCours();
    }
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
    if (typeof window.mettreAJourGuideGroupeCours === 'function') {
        window.mettreAJourGuideGroupeCours();
    }
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
    if (typeof window.mettreAJourGuideGroupeCours === 'function') {
        window.mettreAJourGuideGroupeCours();
    }
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
    if (typeof window.mettreAJourGuideGroupeCours === 'function') {
        window.mettreAJourGuideGroupeCours();
    }

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
   WRAPPERS DELEGATION (Phase 5 — Lot 5.12a)
   Adaptent la signature (el) du dispatcher change
   vers la signature (selectEl, da) des fonctions existantes.
   =============================== */

function actionEtudiantV2Handler(el) {
    actionEtudiantV2(el, el.dataset.da);
}

function remarqueEtudiantV2Handler(el) {
    remarqueEtudiantV2(el, el.dataset.da);
}

// Exports — 25 fonctions migrées du bloc exports résidu L2213-2237 + handlers 2222/2224.
window.chargerGroupesCoursV2 = chargerGroupesCoursV2;
window.activerGroupeV2 = activerGroupeV2;
window.gererEtudiantsGroupeV2 = gererEtudiantsGroupeV2;
window.ouvrirModalNouveauGroupe = ouvrirModalNouveauGroupe;
window.chargerListeEtudiantsV2 = chargerListeEtudiantsV2;
window.ajouterEtudiantV2 = ajouterEtudiantV2;
window.supprimerEtudiantV2 = supprimerEtudiantV2;
window.editerEtudiantV2 = editerEtudiantV2;
window.actionEtudiantV2 = actionEtudiantV2;
window.actionEtudiantV2Handler = actionEtudiantV2Handler;
window.remarqueEtudiantV2 = remarqueEtudiantV2;
window.remarqueEtudiantV2Handler = remarqueEtudiantV2Handler;
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
window.viderListeEtudiantsV2 = viderListeEtudiantsV2;

})();
