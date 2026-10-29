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
        html += `<option value="${echapperHtml(gc.id)}">${echapperHtml(nomAfficheGroupeCours(gc))}</option>`;   // #472
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

    // Retour testeur du 18 sept. 2026 : « Créer » rejoue ce rendu mais pas le
    // hub — sans cet appel, l'étape Groupe-cours restait vide après la création.
    if (typeof window.mettreAJourBarreContexte === 'function') {
        window.mettreAJourBarreContexte();
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
// #472 (lot 8, 11 oct. 2026, constat CT-03) : le nom se fabrique à partir des IDENTIFIANTS, par une
// seule fonction, qui sert à l'aperçu du formulaire ET à l'affichage. Avant, il était calculé une fois,
// à l'enregistrement, puis figé dans `gc.nom` : renommer un cours ou changer les séances d'un horaire
// laissait l'ancien nom dans le menu et la carte. `gc.nom` s'écrit encore à l'enregistrement (des
// lecteurs comme reserve.js en dépendent) ; il n'est plus lu pour l'affichage, sauf en repli.
function _nomTrimestrePourGC(trimestreId) {
    const trimestres = typeof window.obtenirTrimestres === 'function' ? window.obtenirTrimestres() : db.getSync('trimestres', []);
    const trimestre = trimestres.find(t => t.id === trimestreId)
        || (typeof obtenirTrimestreActif === 'function' ? obtenirTrimestreActif() : null);
    if (!trimestre) return '';
    const sessionLettre = { 'hiver': 'H', 'automne': 'A', 'ete': 'E' }[trimestre.session]
        || trimestre.session?.charAt(0)?.toUpperCase() || '';
    return `${sessionLettre}${trimestre.annee}`;
}

function _codeCoursPourGC(coursId) {
    if (!coursId) return '';
    const cours = db.getSync('cours', []);
    const coursObj = cours.find(c => c.id === coursId || c.sigle === coursId || c.codeCours === coursId || c.code === coursId);
    // Cadrage « Rencontres » : le nom d'un service entre dans le nom du groupe-cours, à la place du code.
    return coursObj?.codeCours || coursObj?.sigle || coursObj?.code || (coursObj?.nature === 'service' ? coursObj.nomCours : '') || '';
}

function _resumeHorairePourGC(horaireId) {
    if (!horaireId) return '';
    const horaires = db.getSync(cle('horaires'), []);
    const horaire = horaires.find(h => h.id === horaireId);
    if (!horaire?.seances || horaire.seances.length === 0) return '';
    return horaire.seances.map(s => `${abrevierJour(s.jour)}-${obtenirPeriodeJournee(s.heureDebut)}`).join(' / ');
}

/**
 * Le nom d'un groupe-cours. Format : H2026-601-101-MQ-00001 (Mer-PM / Ven-AM)
 * @param {{trimestreId?: string, coursId?: string, groupeNum?: string, horaireId?: string}} gc
 * @returns {string} le nom, ou '—' si rien ne le compose
 */
function nomGroupeCours(gc) {
    const trimestreNom = _nomTrimestrePourGC(gc && gc.trimestreId);
    const codeCours = _codeCoursPourGC(gc && gc.coursId);
    const groupeNum = (gc && gc.groupeNum) || '';
    const horaireResume = _resumeHorairePourGC(gc && gc.horaireId);

    let nom = '';
    if (trimestreNom) nom += trimestreNom;
    if (codeCours) nom += (nom ? '-' : '') + codeCours;
    if (groupeNum) nom += (nom ? '-' : '') + groupeNum;
    if (horaireResume) nom += ` (${horaireResume})`;
    return nom || '—';
}

/** Le nom affiché d'un groupe-cours enregistré : recalculé ; le nom stocké en repli seulement. */
function nomAfficheGroupeCours(gc) {
    if (!gc) return '';
    const nom = nomGroupeCours(gc);
    return nom !== '—' ? nom : (gc.nom || gc.id);
}

/**
 * #472 : après l'enregistrement d'une entité qu'un groupe-cours désigne (horaire, cours), son nom
 * et sa carte se refont : le menu des groupes-cours, la carte du groupe-cours ouvert, l'en-tête.
 */
function rafraichirAffichageGroupesCoursV2() {
    populerDropdownGroupeCoursV2();
    const id = groupeCoursEnEditionId || document.getElementById('v2-selectGroupeCours')?.value || '';
    if (id) {
        const gc = (db.getSync(cle('groupesCours'), []) || []).find(g => g && g.id === id);
        if (gc) mettreAJourCarteResumeGroupeCoursV2(gc);
    }
    if (typeof window.peuplerDropdownGroupeCoursActif === 'function') window.peuplerDropdownGroupeCoursActif();
}

/** L'aperçu du formulaire : le même nom, à partir des sélections. */
function genererNomGroupeCoursV2() {
    return nomGroupeCours({
        trimestreId: document.getElementById('v2-gc-trimestre')?.value,
        coursId: document.getElementById('v2-gc-cours')?.value,
        groupeNum: document.getElementById('v2-gc-groupe')?.value || '',
        horaireId: document.getElementById('v2-gc-horaire')?.value
    });
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
/** Cadrage « Rencontres » : le cours choisi dans le formulaire du groupe-cours est-il un service ? */
function _coursSelectionneEstServiceV2() {
    const coursId = document.getElementById('v2-gc-cours')?.value;
    if (!coursId) return false;
    const coursObj = (db.getSync('cours', []) || []).find(c => c && c.id === coursId);
    return !!coursObj && coursObj.nature === 'service';
}

function mettreAJourNomGroupeCoursV2(triggerEl) {
    // Cadrage « Rencontres » (12 sept. 2026) : pour un service, l'horaire est facultatif — le
    // formulaire le dit à la place de l'astérisque, sans attendre le refus à l'enregistrement.
    const estService = _coursSelectionneEstServiceV2();
    const marqueRequis = document.getElementById('v2-gc-horaireRequis');
    const marqueFacultatif = document.getElementById('v2-gc-horaireFacultatif');
    if (marqueRequis) marqueRequis.classList.toggle('u-hide', estService);
    if (marqueFacultatif) marqueFacultatif.classList.toggle('u-hide', !estService);

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

    // 🔧 #466/CT-17 (21 août 2026) : id non résolvable = refus DIT (patron commun
    // aux 3 accordéons — le formulaire précédent restait affiché en silence).
    if (!gc) {
        console.warn('[GC V2] Sélection non résolue :', gcId);
        notifications.erreur('Groupe-cours introuvable', 'Il n\'existe plus dans ce trimestre. La liste va se rafraîchir.');
        if (typeof window.populerDropdownGroupeCoursV2 === 'function') window.populerDropdownGroupeCoursV2();
        afficherEtatVideGroupeCoursV2();
        return;
    }

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
        ? (coursObj.nature === 'service'
            ? (coursObj.nomCours || '') + ' - ' + motNature(coursObj)
            : (coursObj.codeCours || coursObj.sigle || coursObj.code || '') + ' - ' + (coursObj.nomCours || coursObj.nom || coursObj.titre || ''))
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

/** #475 : l'enseignant désigné existe — le profil (`'profil'`) s'il est rempli, sinon une fiche, démo comprise. */
function _enseignantExistePourGC(gc) {
    if (!gc.enseignantId) return false;
    if (gc.enseignantId === 'profil') {
        const profil = db.getSync('profilEnseignant', {}) || {};
        return !!(profil.prenom && profil.nom);
    }
    const listes = [db.getSync('enseignants', []) || []];
    if (typeof cleDemo === 'function') listes.push(db.getSync(cleDemo('enseignants'), []) || []);
    return listes.some(l => Array.isArray(l) && l.some(e => e && e.id === gc.enseignantId));
}

/**
 * #475 : la pratique désignée existe — dans les pratiques du trimestre (avec la normalisation des ids
 * legacy, `trouverPratiqueEnBibliotheque`), dans le registre des pratiques prédéfinies, ou au démo.
 * Aucune instance construite.
 */
function _pratiqueExistePourGC(gc) {
    if (!gc.pratiqueId) return false;
    if (typeof window.trouverPratiqueEnBibliotheque === 'function' && window.trouverPratiqueEnBibliotheque(gc.pratiqueId)) return true;
    if (typeof window.pratiqueEstDisponible === 'function') {
        const canonique = typeof window.normaliserIdPratique === 'function' ? window.normaliserIdPratique(gc.pratiqueId) : gc.pratiqueId;
        if (window.pratiqueEstDisponible(canonique)) return true;
    }
    const listes = [db.getSync(cle('pratiquesConfigurables'), []) || []];
    if (typeof cleDemo === 'function') listes.push(db.getSync(cleDemo('pratiquesConfigurables'), []) || []);
    return listes.some(l => Array.isArray(l) && l.some(p => p && p.id === gc.pratiqueId));
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
    // Cadrage « Rencontres » : un service sans horaire le dit, au lieu d'un tiret qui ressemble à un oubli.
    const horaireNom = horaireObj?.nom || (coursObj?.nature === 'service' && !gc.horaireId ? 'Aucun — la présence se note dans la rencontre' : '—');
    const enseignantNom = _resoudreEnseignantPourCarteGC(gc);

    let score = 0;
    if (gc.coursId && coursObj) score++;
    if (gc.groupeNum) score++;
    // Un service sans horaire est complet : l'horaire n'est pas attendu (cadrage « Rencontres »).
    if ((gc.horaireId && horaireObj) || (coursObj && coursObj.nature === 'service' && !gc.horaireId)) score++;
    // #475 (lot 8, 11 oct. 2026, constat CT-14) : une référence ne compte que si ce qu'elle désigne
    // existe, comme le cours et l'horaire ci-dessus. Avant, un enseignant ou une pratique supprimés
    // comptaient encore : « Complet » pour un groupe-cours qui pointait dans le vide.
    if (_enseignantExistePourGC(gc)) score++;
    if (_pratiqueExistePourGC(gc)) score++;

    const estComplet = score === 5;
    const classeCompletude = estComplet ? 'complet' : 'incomplet';
    const texteCompletude = estComplet ? 'Complet' : `${score}/5 configurés`;

    const gcActif = db.getSync('groupeCoursActif', null);
    const estActif = gcActif && gcActif.id === gc.id;
    const badgeActif = estActif ? '<div class="apercu-badge-actif">Groupe-cours actif</div>' : '';

    carte.innerHTML = `
        ${badgeActif}
        <div class="resume-gc-nom">${echapperHtml(nomAfficheGroupeCours(gc))}</div>
        <div class="resume-gc-details">
            <div><span class="label-gc">${motsNature(coursObj).Objet}</span><span>${echapperHtml(coursNom)}</span></div>
            <div><span class="label-gc">Groupe</span><span>${echapperHtml(gc.groupeNum || '—')}</span></div>
            <div><span class="label-gc">Horaire</span><span>${echapperHtml(horaireNom)}</span></div>
            <div><span class="label-gc">${motsNature(coursObj).personneCourt}</span><span>${echapperHtml(enseignantNom)}</span></div>
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
/** @returns {Promise<boolean>} true si le formulaire s'est ouvert, false sur « Rester » (lot E2). */
async function nouveauGroupeCoursV2() {
    if (window.uiDialogues && !(await window.uiDialogues.quitterCreationSiConfirme('groupeCours'))) return false;
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
    if (titre) titre.textContent = 'Nouveau groupe-cours';
    rendreModeFicheGroupeCoursV2(true);

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
    return true;
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
    // #925 : l'étape 3 a été peuplée avant que le cours soit posé ; son compte suit maintenant ce cours
    // (le numéro choisi est gardé : la liste des numéros ne change pas).
    if (typeof window.populerDropdownGroupesAssemblageV2 === 'function') window.populerDropdownGroupesAssemblageV2();

    // Mettre à jour le titre et bouton
    const titre = document.getElementById('v2-titreFormGroupeCours');
    if (titre) titre.textContent = 'Modifier le groupe-cours';
    rendreModeFicheGroupeCoursV2(false);

    // Mettre à jour l'aperçu du nom
    mettreAJourNomGroupeCoursV2();

    // Afficher le formulaire
    const etatVide = document.getElementById('v2-groupeCoursEtatVide');
    const formulaire = document.getElementById('v2-formulaireGroupeCours');
    if (etatVide) etatVide.classList.add('u-hide');
    if (formulaire) formulaire.classList.remove('u-hide');

    // Afficher le bouton Supprimer (mode édition).
    // ⚠ `classList.remove`, PAS `style.display = ''` : `.u-hide` vaut
    // `display: none !important` (styles.css:654), qu'un style en ligne ne peut
    // pas contrer. Le `style.display` d'origine ne révélait donc RIEN.
    // ⮕ Le défaut n'était visible que par UN chemin : `changerGroupeCours-
    // SelectionneV2` retire la classe lui-même après avoir appelé cette
    // fonction, ce qui masquait le problème dès qu'on touchait au menu. Mais
    // `chargerGroupeCoursV2` (restauration du groupe actif à l'arrivée sur la
    // section) appelle cette fonction SANS ce filet : le formulaire s'ouvrait
    // et le bouton Supprimer restait introuvable. Trouvé le 10 août 2026 en
    // répondant à « je ne trouve pas le bouton Supprimer ».
    const btnSupprimer = document.getElementById('v2-btnSupprimerGroupeCours');
    if (btnSupprimer) btnSupprimer.classList.remove('u-hide');
}

/**
 * Lot E2 (D3) — un groupe-cours existant s'enregistre tout seul : « Créer le groupe-cours »
 * ne paraît qu'en création.
 */
function rendreModeFicheGroupeCoursV2(enCreation) {
    const btn = document.getElementById('v2-btnCreerGroupeCours');
    if (btn) btn.classList[enCreation ? 'remove' : 'add']('u-hide');
}

/**
 * Lot E2 : « la fiche est en création et porte une saisie » (ui-dialogues.js). Le trimestre
 * est prérempli (le trimestre actif) : il ne compte pas.
 */
function groupeCoursEnCreationSaisi() {
    const formulaire = document.getElementById('v2-formulaireGroupeCours');
    if (!formulaire || formulaire.classList.contains('u-hide')) return false;
    if (groupeCoursEnEditionId) return false;
    return ['v2-gc-cours', 'v2-gc-groupe', 'v2-gc-enseignant', 'v2-gc-pratique']
        .some(id => String(document.getElementById(id)?.value || '').trim());
}
if (window.uiDialogues) window.uiDialogues.declarerFicheEnCreation('groupeCours', groupeCoursEnCreationSaisi);

/** Lot E2 : choisir un groupe-cours dans le menu ; pendant une création, la question de sortie. */
async function choisirGroupeCoursV2(el) {
    const select = document.getElementById('v2-selectGroupeCours');
    const gcId = (el && el.value !== undefined) ? el.value : select?.value;
    if (window.uiDialogues && !(await window.uiDialogues.quitterCreationSiConfirme('groupeCours'))) {
        if (select) select.value = '';
        return;
    }
    changerGroupeCoursSelectionneV2(gcId);
}

/** Lot E2 (D3) : « Annuler » devient « Fermer » — il n'annulait rien. En création, la question. */
async function fermerFicheGroupeCoursV2() {
    if (window.uiDialogues && !(await window.uiDialogues.quitterCreationSiConfirme('groupeCours'))) return;
    _fermerFormGroupeCoursV2();
}

/**
 * Lot E2 (D3) — un champ du formulaire change : l'aperçu du nom suit (comme avant), et sur
 * un groupe-cours EXISTANT la fiche s'enregistre, par le même écrivain que la création.
 */
function changerChampGroupeCoursV2(el) {
    // #925 : le compte d'élèves de l'étape 3 suit le cours choisi au champ 2.
    if (el && el.id === 'v2-gc-cours' && typeof window.populerDropdownGroupesAssemblageV2 === 'function') {
        window.populerDropdownGroupesAssemblageV2();
    }
    mettreAJourNomGroupeCoursV2(el);
    if (!groupeCoursEnEditionId) return false;
    return sauvegarderGroupeCoursV2();
}

/** Lot E2 : un refus de vérification, par le témoin commun. */
function _refuserGroupeCoursV2(phrase, geste) {
    if (window.temoinEnregistrement) {
        window.temoinEnregistrement.nonEnregistre(window.raisonPourTemoin(phrase), geste, cle('groupesCours'));
    }
    return false;
}

/** Lot E2 : un refus sur un groupe-cours existant remet ses champs au stock. */
function _remettreGroupeCoursEnBaseV2() {
    const gc = (db.getSync(cle('groupesCours'), []) || []).find(g => g.id === groupeCoursEnEditionId);
    if (gc) editerGroupeCoursV2(gc);
}

/**
 * Referme le formulaire groupe-cours (ex-annulerFormGroupeCoursV2, sans question).
 */
function _fermerFormGroupeCoursV2() {
    afficherEtatVideGroupeCoursV2();
    _mettreAJourBoutonActiverGroupeCours(null);

    const select = document.getElementById('v2-selectGroupeCours');
    if (select) select.value = '';
    mettreAJourCarteResumeGroupeCoursV2(null);
}

/**
 * #1038 — la question posée quand le numéro choisi n'a aucun·e élève dans le cours choisi et en a
 * ailleurs. Mots validés par Grégoire le 26 oct. 2026 (15 h 01). null : rien à dire — le groupe a des
 * élèves dans ce cours, ou des fiches sans cours (elles comptent partout), ou n'en a nulle part.
 */
function _questionGroupeSansSesElevesV2(coursId, groupeNum, creation) {
    if (typeof window.repartitionGroupeParCoursV2 !== 'function') return null;
    const r = window.repartitionGroupeParCoursV2(db.getSync(cle('groupeEtudiants'), []), coursId, groupeNum);
    if (r.duCours > 0 || r.sansCours > 0 || r.ailleurs.length === 0) return null;
    const cours = window.libelleCoursParIdV2(coursId);
    const n = r.ailleurs.reduce((total, a) => total + a.n, 0);
    const ou = r.ailleurs.length === 1
        ? window.libelleCoursParIdV2(r.ailleurs[0].coursId)
        : 'd\'autres cours (' + r.ailleurs.map(a => window.libelleCoursParIdV2(a.coursId)).sort().join(', ') + ')';
    return 'Le groupe ' + groupeNum + ' n\'a aucun·e étudiant·e dans ' + cours + '. '
        + (n === 1 ? 'Son étudiant·e est rattaché·e à ' : 'Ses ' + n + ' étudiant·es sont rattaché·es à ') + ou + '.\n\n'
        + 'Ce groupe-cours restera vide tant qu\'aucun·e étudiant·e n\'est rattaché·e à ' + cours + '.\n\n'
        + (creation ? 'Créer' : 'Modifier') + ' quand même le groupe-cours ?';
}

/**
 * #1038 (26 oct. 2026) — UN GROUPE-COURS QUI NAÎT SANS SES ÉLÈVES. Mathieu a créé « 203-SN4 + 00001 »
 * alors que les élèves de 00001 étaient rattachés à 203-GM6 : groupe-cours vide, import sans
 * production, quatre semaines avant qu'il le signale. ⚠ On ne déplace rien : qui a les MÊMES élèves
 * dans deux cours ne peut les rattacher qu'à un seul (l'import refuse un DA déjà inscrit), et son
 * second groupe-cours est vide sans que rien ne soit mal rangé. Le geste reste possible ; il n'est
 * plus silencieux. En modification, seulement si le cours ou le groupe change ; « Annuler » y remet
 * la fiche, comme le refus de CT-15.
 * @returns {boolean} false : la personne a annulé, rien ne s'écrit
 */
function _groupeSansSesElevesAccepteV2(groupesCours, coursId, groupeNum) {
    const creation = !groupeCoursEnEditionId;
    const avant = creation ? null : groupesCours.find(g => g.id === groupeCoursEnEditionId);
    const change = creation || (avant && (avant.coursId !== coursId || String(avant.groupeNum) !== String(groupeNum)));
    const question = change ? _questionGroupeSansSesElevesV2(coursId, groupeNum, creation) : null;
    if (!question || confirm(question)) return true;
    if (!creation) _remettreGroupeCoursEnBaseV2();
    return false;
}

/**
 * L'écrivain unique d'un groupe-cours : « Créer le groupe-cours » en création, chaque champ
 * en modification (lot E2, D3). Mêmes vérifications dans les deux cas ; un refus dit
 * « Non enregistré – ‹geste› : ‹raison› » par le témoin commun.
 * @returns {boolean} true si le groupe-cours a été écrit
 */
function sauvegarderGroupeCoursV2() {
    const creation = !groupeCoursEnEditionId;
    const geste = creation ? 'Créer le groupe-cours' : 'Modifier le groupe-cours';
    const trimestreId = document.getElementById('v2-gc-trimestre')?.value;  // Beta 95.2
    const coursId = document.getElementById('v2-gc-cours')?.value;
    const groupeNum = document.getElementById('v2-gc-groupe')?.value;
    const horaireId = document.getElementById('v2-gc-horaire')?.value;
    const enseignantId = document.getElementById('v2-gc-enseignant')?.value;
    const pratiqueId = document.getElementById('v2-gc-pratique')?.value || null;  // Beta 95.3

    // Validation (5 éléments requis). Lot E2 : par le témoin, au tutoiement (relevé des mots).
    if (!trimestreId) return _refuserGroupeCoursV2('Choisis le trimestre.', geste);
    if (!coursId) return _refuserGroupeCoursV2('Choisis le cours.', geste);
    if (!groupeNum) return _refuserGroupeCoursV2('Choisis le groupe d\'étudiant·es.', geste);
    // Cadrage « Rencontres » (12 sept. 2026) : un groupe-cours de SERVICE peut n'avoir aucun
    // horaire — ses rencontres ont chacune leur date. Pour un cours ordinaire, rien ne change.
    if (!horaireId && !_coursSelectionneEstServiceV2()) return _refuserGroupeCoursV2('Choisis l\'horaire.', geste);
    if (!enseignantId) {
        return _refuserGroupeCoursV2('Choisis l\'' + motsNature(_coursSelectionneEstServiceV2() ? 'service' : 'cours').personne + '.', geste);
    }

    // Phase 4.C : interdire les références à des items démo (Plan §3.4)
    if (typeof BibliothequeUI !== 'undefined' && BibliothequeUI.verifierReferencesPasDemo) {
        const violation = BibliothequeUI.verifierReferencesPasDemo([
            { id: coursId, collection: 'cours', labelType: 'cours' },
            // Chantier du démo : la collection en nom NU, la garde la passe elle-même par cle().
            { id: horaireId, collection: 'horaires', labelType: 'horaire' },
            { id: enseignantId, collection: 'enseignants', labelType: 'enseignant' },
            { id: pratiqueId, collection: 'pratiquesConfigurables', labelType: 'pratique' }
        ], { cible: cle('groupesCours') });   // écrire dans la démo n'est pas refusé
        if (violation) {
            if (!creation) _remettreGroupeCoursEnBaseV2();
            return _refuserGroupeCoursV2(violation.message, geste);
        }
    }

    // Générer le nom
    const nom = genererNomGroupeCoursV2();

    const cleGC = cle('groupesCours');
    // Une COPIE : modifier l'objet du cache de `db` avant une écriture qui échoue le
    // laisserait faux en mémoire (lot E2).
    let groupesCours = JSON.parse(JSON.stringify(db.getSync(cleGC, []) || []));
    let idEcrit = groupeCoursEnEditionId;
    let premierActif = null;

    // #1038 (26 oct. 2026) : un groupe-cours qui naît sans ses élèves le dit (`_groupeSansSesElevesAccepteV2`).
    if (!_groupeSansSesElevesAccepteV2(groupesCours, coursId, groupeNum)) return false;

    // CT-15 (23 août 2026) — GARDE SUR LE TRIPLET (trimestre, cours, groupe).
    //
    // Ce `push` n'a jamais regardé si le triplet existait déjà. Or le nom d'un
    // groupe-cours est ENGENDRÉ à partir de ce triplet, juste au-dessus : deux
    // jumeaux portent donc LE MÊME LIBELLÉ dans tous les menus. Rien ne les
    // distingue à l'œil, et les présences comme les évaluations se répartissent
    // entre eux au hasard du clic — un demi-groupe dans chacun, sans erreur
    // nulle part.
    //
    // ⚠ ON N'INTERDIT PAS : deux GC de même triplet sont légitimes quand
    // l'horaire ou l'enseignant diffèrent (co-enseignement, horaire scindé) —
    // et ces deux champs sont volontairement HORS du triplet pour cette raison.
    // La règle est celle de #455 : le geste reste possible, jamais silencieux.
    const jumeau = trouverDoublonNaturel(
        groupesCours,
        { trimestreId, coursId, groupeNum },
        cleNaturelleGroupeCours,
        groupeCoursEnEditionId ? { exclureId: groupeCoursEnEditionId } : undefined
    );
    if (jumeau) {
        // `confirm` natif, comme la garde jumelle #455 de `sauvegarderCoursV2` :
        // cette fonction est synchrone, et l'écran n'est pas une modale — donc
        // aucun des empilements de z-index de la famille corrigée le 23 août.
        const quandMeme = confirm(
            'Un groupe-cours identique existe déjà : « ' + (jumeau.nom || jumeau.id) + ' ».\n\n' +
            'Même trimestre, même cours, même groupe d\'étudiants. Les deux ' +
            'porteront le même nom dans les menus, et les présences comme les ' +
            'évaluations pourront se répartir entre les deux sans prévenir.\n\n' +
            (groupeCoursEnEditionId
                ? 'Enregistrer quand même ?'
                : 'Créer quand même un second groupe-cours ?')
        );
        if (!quandMeme) {
            if (!creation) _remettreGroupeCoursEnBaseV2();   // lot E2 : « Annuler » remet la fiche
            return false;
        }
    }

    if (groupeCoursEnEditionId) {
        // Modification
        const index = groupesCours.findIndex(g => g.id === groupeCoursEnEditionId);
        // #332 constat 1 — mécanisme B : sans cet `else`, un findIndex raté
        // (id d'édition périmé, p. ex. après un changement de trimestre)
        // affichait quand même « Groupe-cours modifié » et réécrivait l'array
        // inchangé → no-op silencieux avec succès trompeur, modif perdue.
        if (index < 0) {
            return _refuserGroupeCoursV2('Groupe-cours introuvable : resélectionne-le dans la liste.', geste);
        }
        groupesCours[index] = {
            ...groupesCours[index],
            nom,
            trimestreId,  // Beta 95.2
            coursId,
            groupeNum,
            horaireId: horaireId || null,
            enseignantId,
            pratiqueId,   // Beta 95.3
            dateModification: new Date().toISOString()
        };
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
            horaireId: horaireId || null,
            enseignantId,
            pratiqueId,   // Beta 95.3
            dateCreation: new Date().toISOString(),
            actif: estPremier
        };
        groupesCours.push(nouveauGC);
        idEcrit = nouveauGC.id;
        if (estPremier) premierActif = nouveauGC;
    }

    // Lot E2 (D3) : par le témoin commun ; le message du geste ne part qu'après l'écriture.
    if (!sauvegarderDonneesSelonMode('groupesCours', groupesCours, { geste })) return false;
    groupeCoursEnEditionId = idEcrit;
    if (premierActif) db.setSync('groupeCoursActif', premierActif);
    if (creation) {
        notifications.succes(`Groupe-cours «\u00a0${nom}\u00a0» créé.`);
        rendreModeFicheGroupeCoursV2(false);
        const titre = document.getElementById('v2-titreFormGroupeCours');
        if (titre) titre.textContent = 'Modifier le groupe-cours';
        const btnSupprimer = document.getElementById('v2-btnSupprimerGroupeCours');
        if (btnSupprimer) btnSupprimer.classList.remove('u-hide');
    }

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
    return true;
}

/**
 * #1007 (2 oct. 2026) : avant de supprimer un groupe-cours, par l'une ou l'autre porte, un
 * codex à part (`Codex.ecrireAPartAvantSuppression`). Module du codex absent : false, rien
 * n'est supprimé (dans le doute, on refuse).
 * @returns {Promise<boolean>} true seulement si le codex à part est écrit
 */
async function _codexAPartAvantSuppressionGroupeCours(nomGC) {
    if (typeof Codex === 'undefined' || !Codex || typeof Codex.ecrireAPartAvantSuppression !== 'function') return false;
    return await Codex.ecrireAPartAvantSuppression(`Supprimer le groupe-cours « ${nomGC} » l'efface pour de bon.`);
}

/**
 * Supprime le groupe-cours actuellement sélectionné
 * Beta 95.2 (8 jan 2026)
 */
async function supprimerGroupeCoursV2() {
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

    // #1007 : le codex à part d'abord ; la confirmation ensuite, telle qu'avant.
    const nomGC = gc.nom || gc.id;
    if (!(await _codexAPartAvantSuppressionGroupeCours(nomGC))) return;
    if (!confirm(`Supprimer le groupe-cours "${nomGC}" ?\n\nCette action est irréversible.`)) {
        return;
    }

    // Supprimer de la liste (relue : l'écriture du codex à part a pris du temps)
    const groupesCoursFiltre = db.getSync(cleGC, []).filter(g => g.id !== groupeCoursEnEditionId);
    db.setSync(cleGC, groupesCoursFiltre);
    if (window.annoncerEcritureUsager) window.annoncerEcritureUsager(cleGC);   // lot F : geste hors témoin (supprimer un groupe-cours)

    // Si c'était le groupe-cours actif, le désactiver.
    // #390 (audit 5 août, rapport B6) : groupeCoursActif est un OBJET —
    // l'ancienne comparaison objet === id n'était JAMAIS vraie : supprimer le
    // GC actif laissait groupeCoursActif/infoCours pointer un GC effacé
    // (données fantômes, surtout en supprimant le DERNIER groupe-cours, où
    // l'auto-réparation du dropdown n'a plus de candidat).
    const gcActif = db.getSync('groupeCoursActif', null);
    if (gcActif && gcActif.id === groupeCoursEnEditionId) {
        db.setSync('groupeCoursActif', null);
        db.setSync('infoCours', null); // security-ok: purge locale du couple (aucune donnée externe)
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
 * #1159 (lot 6, 25 oct. 2026) — une seule liste ; les groupes-cours mis de côté
 * (`dansSidebar === false`) en bas, sous « Mis de côté (n) », replié. Mots proposés par Cowork,
 * validés par Grégoire (25 oct., 19 h 06) : plus de « dropdown », ni dans les mots ni dans les
 * bulles.
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

    function rangeeGC(gc, estDeCote) {
        const coursInfo = cours.find(c => c.id === gc.coursId);
        const ens = enseignants.find(e => e.id === gc.enseignantId);
        const hor = horaires.find(h => h.id === gc.horaireId);

        const codeCours = coursInfo?.codeCours || coursInfo?.sigle || null;
        const groupe = gc.groupeNum || '00001';
        const titreNu = codeCours ? `${codeCours} — Groupe ${groupe}`
            : (coursInfo?.nature === 'service' ? `${coursInfo.nomCours || motsNature(coursInfo).Objet} — ${motNature(coursInfo)}` : `Groupe ${groupe}`);
        const nomEns = ens ? `${ens.prenom || ''} ${ens.nom || ''}`.trim() : '';
        const nomHor = hor?.nom || '';
        const estActif = gcActif && gc.id === gcActif.id;

        // Le bouton de la rangée : « Remettre dans le menu » (mis de côté), « Activer » (les
        // autres) ; le groupe actif n'en a pas.
        let passage = null;
        if (estDeCote) {
            passage = { label: 'Remettre dans le menu', action: 'afficherGroupeCoursDepuisBibliotheque', param: gc.id };
        } else if (!estActif) {
            passage = { label: 'Activer', action: 'activerGroupeCoursDepuisBibliotheque', param: gc.id, title: 'Activer ce groupe-cours' };
        }

        const menu = [];
        if (!estDeCote) {
            menu.push({ label: 'Mettre de côté', action: 'masquerGroupeCoursDepuisBibliotheque', param: gc.id });
            menu.push({ separateur: true });
        }
        menu.push({ label: 'Supprimer', action: 'supprimerGroupeCoursDepuisBibliotheque', param: gc.id, param2: titreNu, classe: 'btn-supprimer', title: 'Supprimer définitivement' });

        return {
            id: gc.id,
            nom: titreNu,
            ligne: [estActif ? 'Actif' : '', nomEns, nomHor].filter(Boolean).join(' • '),
            passage: passage,
            menu: menu
        };
    }

    BibliothequeUI.creerFenetreListe({
        modalId: 'modalBibliothequeGroupeCours',
        titre: 'Bibliothèque des groupes-cours',
        phrase: 'Les groupes-cours que le menu de l\'en-tête te propose.',
        liste: {
            vide: 'Aucun groupe-cours pour l\'instant. Crée-en un avec « + Nouveau groupe-cours ».',
            rangees: groupesCours.filter(gc => gc.dansSidebar !== false).map(gc => rangeeGC(gc, false))
        },
        repli: { titre: 'Mis de côté', rangees: groupesCours.filter(gc => gc.dansSidebar === false).map(gc => rangeeGC(gc, true)) }
    });
}

// #1159 — Échap ferme la fenêtre par le composant (`BibliothequeUI.fermerFenetre`) : l'écouteur
// propre à cette bibliothèque est parti avec l'ancienne modale.
function fermerModalBibliothequeGroupeCours() {
    BibliothequeUI.fermerModal('modalBibliothequeGroupeCours');
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

async function supprimerGroupeCoursDepuisBibliotheque(gcId, nomGC) {
    if (!(await _codexAPartAvantSuppressionGroupeCours(nomGC))) return;   // #1007
    if (!confirm(`Supprimer le groupe-cours "${nomGC}" ?\n\nCette action est irréversible.`)) {
        return;
    }

    const cleGC = cle('groupesCours');
    let groupesCours = db.getSync(cleGC, []);

    // Supprimer de la liste
    groupesCours = groupesCours.filter(gc => gc.id !== gcId);
    db.setSync(cleGC, groupesCours);
    if (window.annoncerEcritureUsager) window.annoncerEcritureUsager(cleGC);   // lot F : geste hors témoin (supprimer un groupe-cours depuis la bibliothèque)

    // Si c'était le groupe-cours actif, désactiver.
    // #390 : purger AUSSI infoCours (le couple s'écrit et s'efface ensemble).
    const gcActif = db.getSync('groupeCoursActif', null);
    if (gcActif && gcActif.id === gcId) {
        db.setSync('groupeCoursActif', null);
        db.setSync('infoCours', null); // security-ok: purge locale du couple (aucune donnée externe)
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

        // Si c'était le groupe-cours actif, le désactiver.
        // #390 : purger AUSSI infoCours (le couple s'écrit et s'efface ensemble).
        const gcActif = db.getSync('groupeCoursActif', null);
        if (gcActif && gcActif.id === gcId) {
            db.setSync('groupeCoursActif', null);
            db.setSync('infoCours', null); // security-ok: purge locale du couple (aucune donnée externe)
        }

        // Rafraîchir
        if (typeof window.peuplerDropdownGroupeCoursActif === 'function') {
            window.peuplerDropdownGroupeCoursActif();
        }
        chargerGroupeCoursV2();

        // Rafraîchir la modal
        fermerModalBibliothequeGroupeCours();
        ouvrirModalBibliothequeGroupeCours();

        notifications.succes('Groupe-cours mis de côté.');   // #1159 : mots de Cowork (verdict du lot 6, § 2.1)
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

        notifications.succes('Groupe-cours remis dans le menu.');   // #1159 : mots de Cowork (verdict du lot 6, § 2.1)
    }
}

// Exports — 13 fonctions migrées du bloc exports résidu L1197-1209 (ouvrirAideGroupeCours, sans appelant,
// retiré le 29 oct. 2026 : #1152, lot 5).
window.chargerGroupeCoursV2 = chargerGroupeCoursV2;
window.populerDropdownGroupeCoursV2 = populerDropdownGroupeCoursV2;
// #446 (10 août 2026) — ces deux-là étaient APPELÉES depuis
// `trimestre-v2-liste.js` (bascule de trimestre) sans jamais avoir été
// exportées : ce fichier est une IIFE, donc le `typeof … === 'function'` de
// l'appelant valait FAUX et le bloc ne s'exécutait pas. Le correctif #332,
// qui avait ajouté cet appel pour réinitialiser le formulaire groupe-cours au
// changement de trimestre, n'a donc JAMAIS tourné depuis sa livraison.
window.afficherEtatVideGroupeCoursV2 = afficherEtatVideGroupeCoursV2;
window.mettreAJourCarteResumeGroupeCoursV2 = mettreAJourCarteResumeGroupeCoursV2;
window.rafraichirAffichageGroupesCoursV2 = rafraichirAffichageGroupesCoursV2;   // #472
window.nomGroupeCours = nomGroupeCours;   // #472
window.nouveauGroupeCoursV2 = nouveauGroupeCoursV2;
window.changerGroupeCoursSelectionneV2 = changerGroupeCoursSelectionneV2;
window.fermerFicheGroupeCoursV2 = fermerFicheGroupeCoursV2;
window.choisirGroupeCoursV2 = choisirGroupeCoursV2;
window.changerChampGroupeCoursV2 = changerChampGroupeCoursV2;
window.sauvegarderGroupeCoursV2 = sauvegarderGroupeCoursV2;
window.rendreModeFicheGroupeCoursV2 = rendreModeFicheGroupeCoursV2;
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
