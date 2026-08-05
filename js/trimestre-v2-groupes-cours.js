/* ===============================
   MODULE: TRIMESTRE V2 — GROUPES-COURS
   Refactor étape 3 session B (17 mai 2026) : extrait depuis trimestre-v2.js
   zone 6 MODULES-MAP §2.4 (assemblage final des entités).

   Périmètre : CRUD groupes-cours + bibliothèque + helpers de nom/format,
   formulaire d'assemblage et carte résumé, masquer/afficher/activer/supprimer
   depuis la bibliothèque modale.

   Variable module-scope `groupeCoursEnEditionId` migrée ici.

   IMPORTANT — Le hub `populerDropdownsAssemblageV2` reste dans le résidu
   trimestre-v2.js (Écart #4 MODULES-MAP §2.4 + anti-pattern §5.6) car il est
   appelé 10× cross-zones. Accédé depuis ce sous-module via
   `window.populerDropdownsAssemblageV2`.

   Dépendances cross-module accédées via `window.X` (résidu trimestre-v2.js
   chargé AVANT ce fichier dans index.html) :
   - `window.populerDropdownsAssemblageV2` (hub résiduel)
   - `window.mettreAJourGuideGroupeCours` (helper transversal résiduel)
   - `window.peuplerDropdownGroupeCoursActif` (zone 8 orchestre, encore résidu)

   Bug latent préservé : `supprimerGroupeCoursV2` était exporté deux fois dans
   le résidu (lignes 1203 et 2114 pré-session-B). La deuxième occurrence
   `window.supprimerGroupeCoursV2 = supprimerGroupeCoursV2` (zone 8 bloc exports)
   est supprimée car elle référence une variable hors-scope après extraction.
   La seule exportation valide est celle de ce sous-module en bas.
   =============================== */

(function() {
'use strict';

/* ===============================
   GESTION DES GROUPE-COURS (Beta 95.2)
   Assemblage final des entités
   =============================== */

// Variable pour tracker le groupe-cours en édition
let groupeCoursEnEditionId = null;

function _mettreAJourBoutonActiverGroupeCours(gcId) {
    const btn = document.getElementById('v2-btnActiverGroupeCours');
    if (!btn) return;
    if (!gcId) {
        btn.classList.add('u-hide');
        return;
    }
    const gcActif = db.getSync('groupeCoursActif', null);
    const dejaActif = gcActif && gcActif.id === gcId;
    if (dejaActif) {
        btn.classList.add('u-hide');
    } else {
        btn.classList.remove('u-hide');
    }
}

async function activerGroupeCoursV2() {
    if (!groupeCoursEnEditionId) {
        console.warn('[Trimestre V2] Aucun groupe-cours sélectionné pour activation');
        return;
    }
    const cleGC = cle('groupesCours');
    const groupesCours = db.getSync(cleGC, []);
    const cible = groupesCours.find(g => g.id === groupeCoursEnEditionId);
    if (!cible) {
        console.warn('[Trimestre V2] Groupe-cours non trouvé pour activation:', groupeCoursEnEditionId);
        return;
    }
    // #381 (audit 5 août, rapport B3) : déléguer au chemin CANONIQUE, qui écrit
    // le couple groupeCoursActif + infoCours atomiquement (invariant Écart #6,
    // cf. en-tête trimestre-v2-orchestre.js) et rafraîchit toutes les vues.
    // L'écriture directe de groupeCoursActif SEUL laissait infoCours sur
    // l'ancien cours : mauvais groupe actif partout en multi-cours.
    if (typeof window.changerGroupeCoursActifV2 === 'function') {
        await window.changerGroupeCoursActifV2(groupeCoursEnEditionId);
    }

    _mettreAJourBoutonActiverGroupeCours(groupeCoursEnEditionId);
    populerDropdownGroupeCoursV2();
    if (typeof window.peuplerDropdownGroupeCoursActif === 'function') {
        window.peuplerDropdownGroupeCoursActif();
    }
}

/**
 * Charge et initialise l'accordéon Groupe-cours
 */
function chargerGroupeCoursV2() {
    populerDropdownGroupeCoursV2();
    if (typeof window.populerDropdownsAssemblageV2 === 'function') {
        window.populerDropdownsAssemblageV2();
    }
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
    if (typeof window.peuplerDropdownGroupeCoursActif === 'function') {
        window.peuplerDropdownGroupeCoursActif();
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

/**
 * Peuple le dropdown des groupe-cours existants
 */
function populerDropdownGroupeCoursV2() {
    const select = document.getElementById('v2-selectGroupeCours');
    if (!select) {
        return;
    }

    const cleGC = cle('groupesCours');
    const groupesCours = db.getSync(cleGC, []);

    // Sauvegarder la valeur actuelle pour la restaurer après repopulation
    const valeurActuelle = select.value;

    // En mode démo legacy, pas de séparation.
    const enDemoLegacy = typeof estEnModeDemo === 'function' && estEnModeDemo();
    const reels = enDemoLegacy ? groupesCours : groupesCours.filter(gc => !gc.isDemo);

    let html = '<option value="">— Choisir pour modifier —</option>';
    reels.forEach(gc => {
        html += `<option value="${echapperHtml(gc.id)}">${gc.nom || gc.id}</option>`;
    });
    select.innerHTML = html;

    // Section Démo (Plan 1 Phase 2.4) : seulement en mode normal
    if (!enDemoLegacy && typeof cleDemo === 'function' && typeof BibliothequeUI !== 'undefined') {
        const gcDemo = db.getSync(cleDemo('groupesCours'), []) || [];
        BibliothequeUI.ajouterOptgroupDemo(select, gcDemo, gc => gc.nom || gc.id);
    }

    // Restaurer la sélection si elle existait
    if (valeurActuelle) {
        select.value = valeurActuelle;
    }
    // Note: La restauration depuis groupeCoursActif est gérée par chargerGroupeCoursV2()
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
function _obtenirNomTrimestreSelectionne() {
    const trimestreSelectionne = document.getElementById('v2-gc-trimestre')?.value;
    const trimestres = db.getSync('trimestres', []);
    const trimestre = trimestres.find(t => t.id === trimestreSelectionne)
        || (typeof obtenirTrimestreActif === 'function' ? obtenirTrimestreActif() : null);
    if (!trimestre) return '';
    const sessionLettre = { 'hiver': 'H', 'automne': 'A', 'ete': 'E' }[trimestre.session]
        || trimestre.session?.charAt(0)?.toUpperCase() || '';
    return `${sessionLettre}${trimestre.annee}`;
}

function _obtenirCodeCoursSelectionne() {
    const coursId = document.getElementById('v2-gc-cours')?.value;
    if (!coursId) return '';
    const cours = db.getSync('cours', []);
    const coursObj = cours.find(c => c.id === coursId || c.sigle === coursId || c.codeCours === coursId || c.code === coursId);
    return coursObj?.codeCours || coursObj?.sigle || coursObj?.code || '';
}

function _obtenirResumeHoraireSelectionne() {
    const horaireId = document.getElementById('v2-gc-horaire')?.value;
    if (!horaireId) return '';
    const horaires = db.getSync(cle('horaires'), []);
    const horaire = horaires.find(h => h.id === horaireId);
    if (!horaire?.seances || horaire.seances.length === 0) return '';
    return horaire.seances.map(s => `${abrevierJour(s.jour)}-${obtenirPeriodeJournee(s.heureDebut)}`).join(' / ');
}

function genererNomGroupeCoursV2() {
    const trimestreNom = _obtenirNomTrimestreSelectionne();
    const codeCours = _obtenirCodeCoursSelectionne();
    const groupeNum = document.getElementById('v2-gc-groupe')?.value || '';
    const horaireResume = _obtenirResumeHoraireSelectionne();

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
 * Met à jour l'aperçu du nom généré et l'horaire associé.
 * @param {HTMLElement} [triggerEl] - L'élément qui a déclenché le handler
 *   (fourni par le dispatcher data-on-change). Sert à distinguer un changement
 *   du select HORAIRE (choix manuel à respecter) d'un changement de GROUPE
 *   (qui auto-associe l'horaire).
 */
function mettreAJourNomGroupeCoursV2(triggerEl) {
    const groupeNum = document.getElementById('v2-gc-groupe')?.value;
    const horaireHidden = document.getElementById('v2-gc-horaire');
    const horaireNomSpan = document.getElementById('v2-gc-horaireNom');
    const horaireContainer = document.getElementById('v2-gc-horaireInfo');
    const horaires = db.getSync(cle('horaires'), []);

    // #332 constat 1 — mécanisme A : le select horaire porte le même handler que
    // les autres champs. Sans ce garde, choisir un horaire manuellement
    // déclenchait la ré-association depuis le groupe, qui ÉCRASAIT le choix
    // (no-op silencieux). Quand c'est le select horaire lui-même qui déclenche,
    // on respecte sa valeur et on ne met à jour que l'affichage.
    if (triggerEl && triggerEl.id === 'v2-gc-horaire') {
        const choisi = horaires.find(h => h.id === horaireHidden?.value);
        if (horaireNomSpan) horaireNomSpan.textContent = choisi ? (choisi.nom || 'Sans nom') : 'Aucun horaire pour ce groupe';
        if (horaireContainer) horaireContainer.classList.toggle('sans-horaire', !choisi);
    } else if (groupeNum) {
        // #332 piste secondaire : comparer en chaîne — `groupeAssocie` peut être
        // stocké en nombre (saisies anciennes), `groupeNum` est toujours une string.
        const horaireAssocie = horaires.find(h => String(h.groupeAssocie) === String(groupeNum));

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
    if (typeof gcId === 'object' && gcId && gcId.value !== undefined) gcId = gcId.value;
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
function _resoudreCoursPourCarteGC(gc) {
    const cours = db.getSync('cours', []);
    const coursObj = cours.find(c => c.id === gc.coursId || c.sigle === gc.coursId || c.codeCours === gc.coursId || c.code === gc.coursId);
    const coursNom = coursObj
        ? (coursObj.codeCours || coursObj.sigle || coursObj.code || '') + ' - ' + (coursObj.nomCours || coursObj.nom || coursObj.titre || '')
        : '—';
    return { coursObj, coursNom };
}

function _resoudreEnseignantPourCarteGC(gc) {
    if (gc.enseignantId === 'profil' || !gc.enseignantId) {
        const profil = db.getSync('profilEnseignant', {});
        return (profil.prenom && profil.nom) ? `${profil.prenom} ${profil.nom}` : '—';
    }
    const enseignants = db.getSync('enseignants', []);
    const ensObj = enseignants.find(e => e.id === gc.enseignantId);
    return ensObj ? `${ensObj.prenom || ''} ${ensObj.nom || ''}`.trim() : '—';
}

function mettreAJourCarteResumeGroupeCoursV2(gc) {
    const carte = document.getElementById('v2-carteResumeGroupeCours');
    if (!carte) return;

    if (!gc) {
        carte.innerHTML = '<p class="etat-vide-resume">Aucun groupe-cours sélectionné</p>';
        return;
    }

    const { coursObj, coursNom } = _resoudreCoursPourCarteGC(gc);
    const horaires = db.getSync(cle('horaires'), []);
    const horaireObj = horaires.find(h => h.id === gc.horaireId);
    const horaireNom = horaireObj?.nom || '—';
    const enseignantNom = _resoudreEnseignantPourCarteGC(gc);

    let score = 0;
    if (gc.coursId && coursObj) score++;
    if (gc.groupeNum) score++;
    if (gc.horaireId && horaireObj) score++;
    if (gc.enseignantId) score++;
    if (gc.pratiqueId) score++;

    const estComplet = score === 5;
    const classeCompletude = estComplet ? 'complet' : 'incomplet';
    const texteCompletude = estComplet ? 'Complet' : `${score}/5 configurés`;

    const gcActif = db.getSync('groupeCoursActif', null);
    const estActif = gcActif && gcActif.id === gc.id;
    const badgeActif = estActif ? '<div class="apercu-badge-actif">Groupe-cours actif</div>' : '';

    carte.innerHTML = `
        ${badgeActif}
        <div class="resume-gc-nom">${echapperHtml(gc.nom || gc.id)}</div>
        <div class="resume-gc-details">
            <div><span class="label-gc">Cours</span><span>${echapperHtml(coursNom)}</span></div>
            <div><span class="label-gc">Groupe</span><span>${echapperHtml(gc.groupeNum || '—')}</span></div>
            <div><span class="label-gc">Horaire</span><span>${echapperHtml(horaireNom)}</span></div>
            <div><span class="label-gc">Enseig.</span><span>${echapperHtml(enseignantNom)}</span></div>
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
    _mettreAJourBoutonActiverGroupeCours(null);
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
    _mettreAJourBoutonActiverGroupeCours(null);

    // Afficher le trimestre actif
    afficherTrimestreGroupeCoursV2();

    // Rafraîchir les dropdowns
    if (typeof window.populerDropdownsAssemblageV2 === 'function') {
        window.populerDropdownsAssemblageV2();
    }
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

    // A.12 : afficher le message d'aide démo si mode démo actif
    const messageAideDemo = document.getElementById('v2-messageAideDemoGC');
    if (messageAideDemo) {
        const enDemo = typeof estEnModeDemo === 'function' && estEnModeDemo();
        if (enDemo) {
            messageAideDemo.classList.remove('u-hide');
        } else {
            messageAideDemo.classList.add('u-hide');
        }
    }

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
    _mettreAJourBoutonActiverGroupeCours(gc.id);

    // Rafraîchir les dropdowns
    if (typeof window.populerDropdownsAssemblageV2 === 'function') {
        window.populerDropdownsAssemblageV2();
    }

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
    if (selectGroupe) selectGroupe.value = gc.groupeNum || '';
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
    _mettreAJourBoutonActiverGroupeCours(null);

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
        notifications.erreur('Veuillez sélectionner un trimestre');
        return;
    }
    if (!coursId) {
        notifications.erreur('Veuillez sélectionner un cours');
        return;
    }
    if (!groupeNum) {
        notifications.erreur('Veuillez sélectionner un groupe d\'étudiants');
        return;
    }
    if (!horaireId) {
        notifications.erreur('Veuillez sélectionner un horaire');
        return;
    }
    if (!enseignantId) {
        notifications.erreur('Veuillez sélectionner un enseignant');
        return;
    }

    // Phase 4.C : interdire les références à des items démo (Plan §3.4)
    if (typeof BibliothequeUI !== 'undefined' && BibliothequeUI.verifierReferencesPasDemo) {
        const violation = BibliothequeUI.verifierReferencesPasDemo([
            { id: coursId, collection: 'cours', labelType: 'cours' },
            { id: horaireId, collection: cle('horaires'), labelType: 'horaire' },
            { id: enseignantId, collection: 'enseignants', labelType: 'enseignant' },
            { id: pratiqueId, collection: 'pratiquesConfigurables', labelType: 'pratique' }
        ]);
        if (violation) {
            notifications.erreur('Référence démo non autorisée', violation.message);
            return;
        }
    }

    // Générer le nom
    const nom = genererNomGroupeCoursV2();

    const cleGC = cle('groupesCours');
    let groupesCours = db.getSync(cleGC, []);

    if (groupeCoursEnEditionId) {
        // Modification
        const index = groupesCours.findIndex(g => g.id === groupeCoursEnEditionId);
        // #332 constat 1 — mécanisme B : sans cet `else`, un findIndex raté
        // (id d'édition périmé, p. ex. après un changement de trimestre)
        // affichait quand même « Groupe-cours modifié » et réécrivait l'array
        // inchangé → no-op silencieux avec succès trompeur, modif perdue.
        if (index < 0) {
            notifications.erreur('Groupe-cours introuvable', 'Resélectionne-le dans la liste avant d\'enregistrer.');
            return;
        }
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
        notifications.succes('Groupe-cours modifié');
    } else {
        // Ajout : actif = true SEULEMENT si premier groupe-cours créé.
        // Pour activer un autre GC après coup, utiliser le bouton « Activer ce groupe-cours »
        // (formulaire) ou « Activer » (bibliothèque GC).
        const estPremier = groupesCours.length === 0;
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
            actif: estPremier
        };
        groupesCours.push(nouveauGC);
        groupeCoursEnEditionId = nouveauGC.id;
        if (estPremier) {
            db.setSync('groupeCoursActif', nouveauGC);
        }
        notifications.succes('Groupe-cours créé');
    }

    db.setSync(cleGC, groupesCours);

    // Rafraîchir l'interface
    populerDropdownGroupeCoursV2();
    const select = document.getElementById('v2-selectGroupeCours');
    if (select) select.value = groupeCoursEnEditionId;

    const gc = groupesCours.find(g => g.id === groupeCoursEnEditionId);
    mettreAJourCarteResumeGroupeCoursV2(gc);
    _mettreAJourBoutonActiverGroupeCours(groupeCoursEnEditionId);

    // Mettre à jour le dropdown dans l'en-tête de l'application
    if (typeof window.peuplerDropdownGroupeCoursActif === 'function') {
        window.peuplerDropdownGroupeCoursActif();
    }

    // Mettre à jour le guide groupe-cours
    if (typeof window.mettreAJourGuideGroupeCours === 'function') {
        window.mettreAJourGuideGroupeCours();
    }
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

    // Réinitialiser l'interface
    groupeCoursEnEditionId = null;
    _mettreAJourBoutonActiverGroupeCours(null);
    chargerGroupeCoursV2();
    afficherEtatVideGroupeCoursV2();
    mettreAJourCarteResumeGroupeCoursV2(null);

    // Masquer le bouton supprimer
    const btnSupprimer = document.getElementById('v2-btnSupprimerGroupeCours');
    if (btnSupprimer) btnSupprimer.classList.add('u-hide');

    // Rafraîchir le dropdown header
    if (typeof window.peuplerDropdownGroupeCoursActif === 'function') {
        window.peuplerDropdownGroupeCoursActif();
    }

    // Notification
    notifications.succes('Groupe-cours supprimé', nomGC);
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

    // Phase C #267 — migration vers BibliothequeUI (carte + menu ⋮)
    function genererCarteGC(gc, estMasque) {
        const coursInfo = cours.find(c => c.id === gc.coursId);
        const ens = enseignants.find(e => e.id === gc.enseignantId);
        const hor = horaires.find(h => h.id === gc.horaireId);

        const codeCours = coursInfo?.codeCours || coursInfo?.sigle || null;
        const groupe = gc.groupeNum || '00001';
        const titreNu = codeCours ? `${codeCours} — Groupe ${groupe}` : `Groupe ${groupe}`;
        const nomEns = ens ? `${ens.prenom || ''} ${ens.nom || ''}`.trim() : '';
        const nomHor = hor?.nom || '';
        const estActif = gcActif && gc.id === gcActif.id;
        const badgeActif = estActif ? '<span style="background: var(--vert-principal); color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; margin-left: 10px;">Actif</span>' : '';
        const sousInfo = [nomEns, nomHor].filter(Boolean).join(' • ');

        // Bouton primaire :
        // - Masqué : Afficher
        // - Visible non-actif : Activer
        // - Visible actif : pas de primaire (déjà actif)
        let primaire = null;
        if (estMasque) {
            primaire = { label: 'Afficher', action: 'afficherGroupeCoursDepuisBibliotheque', param: gc.id, classe: 'btn-confirmer', title: 'Afficher dans le dropdown' };
        } else if (!estActif) {
            primaire = { label: 'Activer', action: 'activerGroupeCoursDepuisBibliotheque', param: gc.id, classe: 'btn-confirmer', title: 'Activer ce groupe-cours' };
        }

        // Menu ⋮ : Masquer (si visible) ou Afficher déjà en primaire si masqué.
        // Supprimer toujours présent (rouge).
        const actions = [];
        if (!estMasque) {
            actions.push({ label: 'Masquer', action: 'masquerGroupeCoursDepuisBibliotheque', param: gc.id, classe: 'btn-secondaire', title: 'Masquer du dropdown' });
        }
        actions.push({ label: 'Supprimer', action: 'supprimerGroupeCoursDepuisBibliotheque', param: gc.id, param2: titreNu, classe: 'btn-supprimer', title: 'Supprimer définitivement' });

        return BibliothequeUI.renderCarteSelection({
            nom: echapperHtml(titreNu) + badgeActif,
            id: gc.id,
            badgeSource: '',
            metadonnees: sousInfo,
            description: '',
            boutonPrincipal: primaire,
            actionsMenu: actions
        });
    }

    let contenuSection1 = '';
    let titreSection2 = '';
    let contenuSection2 = '';

    if (groupesCours.length === 0) {
        contenuSection1 = '<div style="text-align: center; padding: 40px; color: var(--gris-moyen);">' +
            '<p style="font-size: 1.1rem;">Aucun groupe-cours configuré</p>' +
            '<p>Clique sur « + Nouveau groupe-cours » dans l\'accordéon pour en créer un.</p>' +
            '</div>';
    } else {
        if (gcVisibles.length === 0) {
            contenuSection1 = '<p style="color: var(--gris-clair); font-style: italic;">Aucun groupe-cours visible dans le dropdown</p>';
        } else {
            gcVisibles.forEach(gc => { contenuSection1 += genererCarteGC(gc, false); });
        }
        if (gcMasques.length > 0) {
            titreSection2 = 'Groupe-cours masqués';
            gcMasques.forEach(gc => { contenuSection2 += genererCarteGC(gc, true); });
        }
    }

    BibliothequeUI.creerModal({
        modalId: 'modalBibliothequeGroupeCours',
        titre: 'Bibliothèque groupe-cours',
        sousTitre: 'Gérez les groupe-cours affichés dans le dropdown de l\'en-tête.',
        onFermerAction: 'fermerModalBibliothequeGroupeCours',
        doublonsHTML: '',
        titreSection1: 'Groupe-cours dans le dropdown',
        contenuSection1: contenuSection1,
        boutonsApresSection1: '',
        titreSection2: titreSection2,
        filtresSection2: '',
        contenuSection2: contenuSection2
    });

    // Si pas de section 2, masquer son titre vide (creerModal rend toujours h3)
    if (!titreSection2) {
        const modalEl = document.getElementById('modalBibliothequeGroupeCours');
        if (modalEl) {
            const h3s = modalEl.querySelectorAll('.biblio-section-titre');
            if (h3s.length >= 2 && !h3s[1].textContent.trim()) h3s[1].style.display = 'none';
        }
    }

    document.addEventListener('keydown', fermerModalBibliothequeGroupeCoursEscape);
}

function fermerModalBibliothequeGroupeCoursEscape(e) {
    if (e.key === 'Escape') {
        fermerModalBibliothequeGroupeCours();
    }
}

function fermerModalBibliothequeGroupeCours() {
    BibliothequeUI.fermerModal('modalBibliothequeGroupeCours');
    document.removeEventListener('keydown', fermerModalBibliothequeGroupeCoursEscape);
}

async function activerGroupeCoursDepuisBibliotheque(gcId) {
    // #381 (audit 5 août, rapport B3) : même délégation au chemin canonique
    // que activerGroupeCoursV2 — le couple groupeCoursActif + infoCours doit
    // TOUJOURS s'écrire ensemble (l'écriture directe laissait infoCours sur
    // l'ancien cours). La notification vient du délégué.
    if (typeof window.changerGroupeCoursActifV2 === 'function') {
        await window.changerGroupeCoursActifV2(gcId);
    }

    // Rafraîchir
    chargerGroupeCoursV2();
    if (groupeCoursEnEditionId) {
        _mettreAJourBoutonActiverGroupeCours(groupeCoursEnEditionId);
    }

    // Rafraîchir la modal
    fermerModalBibliothequeGroupeCours();
    ouvrirModalBibliothequeGroupeCours();
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
    if (typeof window.peuplerDropdownGroupeCoursActif === 'function') {
        window.peuplerDropdownGroupeCoursActif();
    }
    chargerGroupeCoursV2();

    // Rafraîchir la modal
    fermerModalBibliothequeGroupeCours();
    if (groupesCours.length > 0) {
        ouvrirModalBibliothequeGroupeCours();
    }

    notifications.succes('Groupe-cours supprimé', nomGC);
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
        if (typeof window.peuplerDropdownGroupeCoursActif === 'function') {
            window.peuplerDropdownGroupeCoursActif();
        }
        chargerGroupeCoursV2();

        // Rafraîchir la modal
        fermerModalBibliothequeGroupeCours();
        ouvrirModalBibliothequeGroupeCours();

        notifications.succes('Groupe-cours masqué');
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
        if (typeof window.peuplerDropdownGroupeCoursActif === 'function') {
            window.peuplerDropdownGroupeCoursActif();
        }
        chargerGroupeCoursV2();

        // Rafraîchir la modal
        fermerModalBibliothequeGroupeCours();
        ouvrirModalBibliothequeGroupeCours();

        notifications.succes('Groupe-cours affiché');
    }
}

// Exports — 14 fonctions migrées du bloc exports résidu L1197-1209 + L181 (ouvrirAideGroupeCours).
window.ouvrirAideGroupeCours = ouvrirAideGroupeCours;
window.chargerGroupeCoursV2 = chargerGroupeCoursV2;
window.populerDropdownGroupeCoursV2 = populerDropdownGroupeCoursV2;
window.nouveauGroupeCoursV2 = nouveauGroupeCoursV2;
window.changerGroupeCoursSelectionneV2 = changerGroupeCoursSelectionneV2;
window.annulerFormGroupeCoursV2 = annulerFormGroupeCoursV2;
window.sauvegarderGroupeCoursV2 = sauvegarderGroupeCoursV2;
window.mettreAJourNomGroupeCoursV2 = mettreAJourNomGroupeCoursV2;
window.supprimerGroupeCoursV2 = supprimerGroupeCoursV2;
window.activerGroupeCoursV2 = activerGroupeCoursV2;
window.ouvrirModalBibliothequeGroupeCours = ouvrirModalBibliothequeGroupeCours;
window.fermerModalBibliothequeGroupeCours = fermerModalBibliothequeGroupeCours;
window.activerGroupeCoursDepuisBibliotheque = activerGroupeCoursDepuisBibliotheque;
window.supprimerGroupeCoursDepuisBibliotheque = supprimerGroupeCoursDepuisBibliotheque;
window.masquerGroupeCoursDepuisBibliotheque = masquerGroupeCoursDepuisBibliotheque;
window.afficherGroupeCoursDepuisBibliotheque = afficherGroupeCoursDepuisBibliotheque;

// Helper appelé depuis le résidu (zone 8 `afficherFormGroupeCoursV2`).
// Promu en `window.X` lors de la session B suite à détection d'appel cross-zone.
window.afficherTrimestreGroupeCoursV2 = afficherTrimestreGroupeCoursV2;

})();
