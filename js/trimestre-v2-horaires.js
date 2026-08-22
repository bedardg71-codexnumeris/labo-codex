/* ===============================
   MODULE: TRIMESTRE V2 — HORAIRES
   Refactor étape 3 session A (17 mai 2026) : extrait depuis trimestre-v2.js
   lignes 3252-4073 (zone 5 MODULES-MAP §2.4).

   Périmètre : CRUD séances + horaires + format horaire (20 fonctions,
   2 variables module-scope `seanceEnEditionV2` et `horaireEnEditionId`).

   Dépendances cross-module accédées via `window.X` :
   - `window.populerDropdownsAssemblageV2` (hub résiduel)
   - `window.afficherStatistiquesTrimestreV2` (helper transversal résiduel)
   =============================== */

(function() {
'use strict';

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
                // CT-09 : infoCours vient d'un import (ZIP, collage CSV,
                // restauration Codex) et atterrit en innerHTML plus bas.
                const sigle = echapperHtml(infoCours.codeCours || infoCours.sigle || infoCours.code || '');
                const groupe = echapperHtml(infoCours.groupe || '');
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
                <span style="width: 90px; font-weight: 600; color: var(--accent-primaire);">${echapperHtml(jourNom)}</span>
                <span style="flex: 1;">${echapperHtml(heureDebut)} (${periodes} pér.)</span>
                <span class="text-muted" style="width: 80px;">${echapperHtml(local)}</span>
                <div style="display: flex; gap: 5px;">
                    <button class="btn btn-modifier btn-sm" data-action="modifierSeanceV2" data-param="${index}" title="Modifier">Modifier</button>
                    <button class="btn btn-annuler btn-sm" data-action="supprimerSeanceV2" data-param="${index}" title="Supprimer">Suppr.</button>
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
    notifications.succes(seanceEnEditionV2 !== null ? 'Séance modifiée' : 'Séance ajoutée');

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

    // 🆕 BETA 95 : Utiliser les fonctions multi-cours
    let horaire = typeof obtenirSeancesHoraire === 'function'
        ? obtenirSeancesHoraire().slice() // Copie pour modification
        : db.getSync(cle('horaireHebdo'), []);
    horaire.splice(index, 1);
    const cleSauvegarde = typeof cleHoraire === 'function' ? cleHoraire() : cle('horaireHebdo');
    db.setSync(cleSauvegarde, horaire);

    notifications.succes('Séance supprimée');

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

    // Modèle « horaire propre au trimestre » (décision 29 mai 2026) : on ne lit QUE la
    // sélection namespacée du trimestre actif — plus de fallback non-namespacé qui pouvait
    // ramener un horaire d'un autre trimestre. Si aucun horaire valide pour ce trimestre,
    // on réinitialise FRANCHEMENT l'éditeur (état vide) au lieu de laisser un formulaire
    // périmé — sinon une sauvegarde ultérieure viserait le mauvais namespace (no-op
    // silencieux + perte de la modif).
    const horaireIdSauvegarde = db.getSync(cle('horaireSelectionne'), null);
    const horaires = db.getSync(cle('horaires'), []);
    const horaire = horaireIdSauvegarde ? horaires.find(h => h.id === horaireIdSauvegarde) : null;

    if (horaire) {
        const select = document.getElementById('v2-selectHoraire');
        if (select) select.value = horaire.id;
        mettreAJourCarteResumeHoraireV2(horaire);
        editerHoraireV2(horaire);
    } else {
        // Aucun horaire pour ce trimestre (ou sélection orpheline d'un autre trimestre) :
        // nettoyer la sélection et réinitialiser l'éditeur (afficherEtatVideHoraireV2 remet
        // horaireEnEditionId à null). On n'éditera jamais un horaire hors trimestre actif.
        if (horaireIdSauvegarde) db.setSync(cle('horaireSelectionne'), null);
        mettreAJourCarteResumeHoraireV2(null);
        afficherEtatVideHoraireV2();
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

    // En mode démo legacy, pas de séparation (comportement préservé).
    const enDemoLegacy = typeof estEnModeDemo === 'function' && estEnModeDemo();
    const reels = enDemoLegacy ? horaires : horaires.filter(h => !h.isDemo);

    let html = '<option value="">Sélectionner...</option>';
    reels.forEach(h => {
        // CT-09 : l'id était échappé, pas le nom — asymétrie sur la même ligne.
        html += `<option value="${echapperAttribut(h.id)}">${echapperHtml(h.nom || 'Sans nom')}</option>`;
    });
    select.innerHTML = html;

    // Section Démo (Plan 1 Phase 2.4) : seulement en mode normal
    if (!enDemoLegacy && typeof cleDemo === 'function' && typeof BibliothequeUI !== 'undefined') {
        const horairesDemo = db.getSync(cleDemo('horaires'), []) || [];
        BibliothequeUI.ajouterOptgroupDemo(select, horairesDemo, h => h.nom || 'Sans nom');
    }

    // Restaurer la sélection
    if (valeurActuelle) {
        select.value = valeurActuelle;
    }
}

/**
 * Appelé quand on change l'horaire sélectionné dans le dropdown
 */
function changerHoraireSelectionneV2(horaireId) {
    if (typeof horaireId === 'object' && horaireId && horaireId.value !== undefined) horaireId = horaireId.value;
    if (!horaireId) {
        // Aucun horaire sélectionné - afficher état vide
        db.setSync(cle('horaireSelectionne'), null);
        mettreAJourCarteResumeHoraireV2(null);
        afficherEtatVideHoraireV2();
        return;
    }

    const cleHoraires = cle('horaires');
    const horaires = db.getSync(cleHoraires, []);
    const horaire = horaires.find(h => h.id === horaireId);

    if (horaire) {
        // Sauvegarder la sélection pour persistance (Beta 95.2)
        db.setSync(cle('horaireSelectionne'), horaireId);
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
            const localInfo = localSeance ? ` (${echapperHtml(localSeance)})` : '';
            seancesHtml += `<li>${echapperHtml(s.jour)} ${echapperHtml(s.heureDebut)} - ${echapperHtml(heureFin)}${localInfo}</li>`;
        });
        seancesHtml += '</ul>';
    }

    carte.innerHTML = `
        <div class="resume-horaire-nom">${echapperHtml(horaire.nom || 'Sans nom')}</div>
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
function populerDropdownGroupesHoraireV2(etudiantsOpt) {
    const select = document.getElementById('v2-hor-groupeAssocie');
    if (!select) return;

    // Utiliser les données fraîches si fournies (par chargerListeEtudiantsV2,
    // lues en async fiable), sinon relire en getSync.
    const etudiants = Array.isArray(etudiantsOpt) ? etudiantsOpt : db.getSync(cle('groupeEtudiants'), []);

    // Préserver la sélection en cours pour ne pas la perdre lors d'un
    // rafraîchissement (ex. import d'étudiants pendant l'édition d'un horaire).
    const valeurCourante = select.value;

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
        // CT-09 : grp vient du collage CSV des étudiants.
        html += `<option value="${echapperAttribut(grp)}">${echapperHtml(grp)} (${nbEtudiants} étud.)</option>`;
    });
    select.innerHTML = html;

    if (valeurCourante && groupesTries.indexOf(valeurCourante) !== -1) {
        select.value = valeurCourante;
    }
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
    // #306 Lot 1 : libellé canonique « Créer » en création (« Enregistrer » en édition)
    if (btnTexte) btnTexte.textContent = 'Créer';

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
        notifications.erreur('Veuillez sélectionner un groupe associé');
        return;
    }

    if (!nom) {
        notifications.erreur('Le nom de l\'horaire est requis');
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
        if (index < 0) {
            // Sentinelle défensive (modèle « horaire propre au trimestre », 29 mai 2026) :
            // l'horaire édité n'est pas dans le trimestre actif. Ne devrait plus arriver
            // depuis que l'éditeur est réinitialisé au changement de trimestre
            // (changerTrimestreActifV2 + chargerHorairesV2). Sans ce garde, la branche ne
            // faisait RIEN tout en affichant « modifié » → modification silencieusement perdue.
            console.warn('[Horaire V2] Sauvegarde refusée : horaire', horaireEnEditionId, 'absent du trimestre actif', cleHoraires);
            notifications.erreur(
                'Impossible d\'enregistrer cet horaire',
                'Il n\'appartient pas au trimestre actif. Bascule sur son trimestre pour le modifier.'
            );
            return;
        }
        horaires[index] = {
            ...horaires[index],
            groupeAssocie,
            nom,
            periodesParSeance,
            seances
        };
        // Supprimer l'ancien champ local global s'il existe (migration)
        delete horaires[index].local;
        notifications.succes(`Horaire "${nom}" modifié`);
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
        notifications.succes(`Horaire "${nom}" créé`);
    }

    db.setSync(cleHoraires, horaires);

    // 🆕 FIX (22 jan 2026) : Synchroniser horaireHebdo pour que le calendrier reconnaisse les jours de cours
    // Fusionner les séances de TOUS les horaires pour couvrir tous les groupes-cours
    // CT-04 (21 août 2026) : dédup par (jour, heure) via la source unique
    // fusionnerSeancesHoraires — la dédup par jour seul perdait la 2e séance
    // d'un même jour (deux groupes, deux heures).
    const toutesSeances = fusionnerSeancesHoraires(horaires);
    const cleHoraireHebdo = cle('horaireHebdo');
    db.setSync(cleHoraireHebdo, toutesSeances);

    // Regénérer le calendrier avec les nouveaux jours de cours
    if (typeof genererCalendrierComplet === 'function') {
        genererCalendrierComplet();
    }

    // Rafraîchir l'interface
    populerDropdownHorairesV2();
    const select = document.getElementById('v2-selectHoraire');
    if (select) select.value = horaireEnEditionId;

    const horaire = horaires.find(h => h.id === horaireEnEditionId);
    mettreAJourCarteResumeHoraireV2(horaire);

    // Porte terrain 2.4 (21 août 2026) : apres une CREATION, le formulaire
    // restait en mode creation — titre « Nouvel horaire », bouton « Creer », et
    // surtout AUCUN bouton Supprimer. Poser `select.value` par code ne declenche
    // pas l'evenement `change`, donc `changerHoraireSelectionneV2` ne passait
    // jamais le formulaire en mode edition : l'horaire qu'on venait de creer
    // etait insupprimable tant qu'on n'avait pas selectionne un AUTRE horaire
    // puis fait demi-tour. Signale au terrain : « il n'y a pas de possibilite de
    // supprimer l'horaire ». On bascule donc explicitement en mode edition, par
    // la meme fonction que le dropdown (source unique, pas de logique doublee).
    if (horaire) editerHoraireV2(horaire);

    // 🆕 (10 jan 2026) : Rafraîchir le dropdown horaires dans Groupe-cours
    window.populerDropdownsAssemblageV2();

}

/**
 * Supprime l'horaire en cours d'édition
 * Beta 95.2 - Les horaires changent à chaque trimestre, pas de banque nécessaire
 */
function supprimerHoraireV2() {
    if (!horaireEnEditionId) {
        notifications.erreur('Aucun horaire sélectionné');
        return;
    }

    const cleHoraires = cle('horaires');
    let horaires = db.getSync(cleHoraires, []);
    const horaire = horaires.find(h => h.id === horaireEnEditionId);

    if (!horaire) {
        notifications.erreur('Horaire introuvable');
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
    // CT-04 : même source unique qu'à la sauvegarde.
    const toutesSeances = fusionnerSeancesHoraires(horaires);
    const cleHoraireHebdo = cle('horaireHebdo');
    db.setSync(cleHoraireHebdo, toutesSeances);
    if (typeof genererCalendrierComplet === 'function') {
        genererCalendrierComplet();
    }

    // Effacer la sélection sauvegardée
    db.setSync(cle('horaireSelectionne'), null);

    // Réinitialiser l'interface
    horaireEnEditionId = null;
    afficherEtatVideHoraireV2();
    populerDropdownHorairesV2();
    mettreAJourCarteResumeHoraireV2(null);

    // 🆕 (10 jan 2026) : Rafraîchir le dropdown horaires dans Groupe-cours
    window.populerDropdownsAssemblageV2();


    notifications.succes(`Horaire "${nomHoraire}" supprimé`);
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
 * Handler des selects « Nombre de séances » et « Périodes par séance » (CT-01).
 * La régénération des lignes repart des défauts : sans capture préalable, un
 * simple changement de format écrasait les séances déjà saisies et
 * « Enregistrer » persistait les défauts en silence. On photographie donc les
 * valeurs du DOM avant la régénération, puis on les restitue ligne à ligne ;
 * seules les lignes ajoutées prennent les défauts.
 */
function changerFormatSeancesHoraireV2() {
    const saisies = [];
    for (let i = 0; document.getElementById(`v2-hor-seance-${i}-jour`); i++) {
        saisies.push({
            jour: document.getElementById(`v2-hor-seance-${i}-jour`).value,
            heureDebut: document.getElementById(`v2-hor-seance-${i}-debut`)?.value || '',
            heureFin: document.getElementById(`v2-hor-seance-${i}-fin`)?.value || '',
            local: document.getElementById(`v2-hor-seance-${i}-local`)?.value || ''
        });
    }

    mettreAJourSeancesHoraireV2();

    saisies.forEach((s, i) => {
        const selectJour = document.getElementById(`v2-hor-seance-${i}-jour`);
        if (!selectJour) return; // ligne retirée par la réduction du nombre de séances
        selectJour.value = s.jour;
        const inputDebut = document.getElementById(`v2-hor-seance-${i}-debut`);
        const inputFin = document.getElementById(`v2-hor-seance-${i}-fin`);
        const inputLocal = document.getElementById(`v2-hor-seance-${i}-local`);
        if (inputDebut) inputDebut.value = s.heureDebut;
        if (inputFin) inputFin.value = s.heureFin;
        if (inputLocal) inputLocal.value = s.local;
    });
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
window.changerFormatSeancesHoraireV2 = changerFormatSeancesHoraireV2;
window.chargerHorairesV2 = chargerHorairesV2;
// Exports migrés du bloc principal résidu (lignes 4524-4530 originelles).
window.chargerHoraireGroupeActifV2 = chargerHoraireGroupeActifV2;
window.chargerSeancesV2 = chargerSeancesV2;
window.afficherFormSeanceV2 = afficherFormSeanceV2;
window.modifierSeanceV2 = modifierSeanceV2;
window.annulerFormSeanceV2 = annulerFormSeanceV2;
window.confirmerSeanceV2 = confirmerSeanceV2;
window.supprimerSeanceV2 = supprimerSeanceV2;

})();
