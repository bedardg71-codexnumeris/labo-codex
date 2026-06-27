/* ===============================
   MODULE: TRIMESTRE V2 — ZONE 8 ORCHESTRE
   Extrait depuis trimestre-v2.js (résidu post-session-B, lignes 491-1216).
   Refactor étape 3 session C — 17 mai 2026.

   Périmètre : la « zone HIGH 8 orchestre » — chorégraphie de l'onglet Trimestre.
   - Dropdown groupe-cours actif (entête de l'app)
   - Changement de groupe-cours actif (`changerGroupeCoursActifV2` —
     monstre cyc 94 préservé tel quel pour Phase 1, sera éclaté Phase 2
     selon Écart #8 MODULES-MAP §2.4)
   - Dropdown enseignants + UI enseignant
   - UI groupe-cours (form, aperçu)
   - Accès rapide calendrier

   Helpers transversaux RESTÉS au résidu (accédés via window.X depuis ce
   module si jamais besoin) :
   - populerDropdownsAssemblageV2 (hub critique, Écart #4 et #5)
   - mettreAJourGuideGroupeCours
   - mettreAJourBarreContexte
   - afficherStatistiquesTrimestreV2
   - allerVersAide
   - mettreAJourOptionsFormatHoraire/mettreAJourFormatHoraire/mettreAJourInfoDuree

   Variable module-scope migrée : `enseignantEnEditionUI`.

   Atomicité critique préservée (Écart #6) :
   - Le couple `db.setSync('groupeCoursActif', X)` + `db.setSync('infoCours', Y)`
     dans `changerGroupeCoursActifV2` doit rester séquentiel sans
     await/break entre les deux.
   =============================== */

(function() {
'use strict';

/* ===============================
   WRAPPERS NOTIFICATIONS
   (dupliqués des autres sous-modules — les fonctions originales sont
    dans evaluation.js / groupe.js, pas encore chargées quand ce
    module s'exécute. Consolidation prévue dans un chantier séparé
    post-refactor — voir SESSION.md L78.)
   =============================== */

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

    if (!trimestreActif) {
        selectHeader.innerHTML = '<option value="">-- Sélectionne un trimestre --</option>';
        return;
    }

    // Utiliser cle() pour cohérence avec sauvegarderGroupeCoursV2
    const cleGC = cle('groupesCours');
    const tousGroupesCours = db.getSync(cleGC, []);

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
            const groupe = gc.groupeNum || '00001';
            const nomEns = ens.prenom ? `${ens.prenom} ${(ens.nom || '').charAt(0)}.` : '';
            const nomHor = hor.nom || '';

            // 🆕 FIX (9 jan 2026) : Libellé lisible même sans cours
            let label = sigle ? `${sigle} gr.${groupe}` : `Groupe ${groupe}`;
            if (nomEns) label += ` - ${nomEns}`;
            if (nomHor) label += ` (${nomHor})`;

            const selected = gcActif && !gcActif.modeCours && gc.id === gcActif.id ? ' selected' : '';
            options += `<option value="${echapperHtml(gc.id)}"${selected}>${label}</option>`;
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

    // 🆕 BETA 95.5 : Auto-sélection si aucun groupe-cours actif
    // Vérifie si le groupe-cours actuellement actif appartient au trimestre actif
    // 🔧 FIX (24 fév 2026) : Valider contre TOUS les groupe-cours, pas seulement ceux visibles dans la sidebar
    // Sinon un groupe masqué (dansSidebar=false) est considéré invalide et remplacé silencieusement
    const gcActif = db.getSync('groupeCoursActif', null);
    const gcActifValide = gcActif && tousGroupesCours.some(gc => gc.id === gcActif.id);

    if (!gcActifValide && groupesCours.length > 0) {
        // Sélectionner le premier groupe-cours du trimestre
        const premierGC = groupesCours[0];
        await changerGroupeCoursActifV2(premierGC.id);
        selectHeader.value = premierGC.id;
    } else if (gcActifValide) {
        // S'assurer que le dropdown reflète la sélection actuelle
        selectHeader.value = gcActif.modeCours ? `cours:${gcActif.coursId}` : gcActif.id;
    }
}

/**
 * Change le groupe-cours actif depuis le header
 */
async function changerGroupeCoursDepuisHeader(groupeCoursId) {
    if (typeof groupeCoursId === 'object' && groupeCoursId !== null) groupeCoursId = groupeCoursId.value;
    await changerGroupeCoursActifV2(groupeCoursId);
}

/**
 * (Helper privé) Définit groupeCoursActif + infoCours pour le mode COURS
 * (tous les groupes-cours d'un cours fusionnés). Atomicité critique
 * préservée — les 2 setSync sont consécutifs sans await ni break.
 *
 * Extrait du monstre `changerGroupeCoursActifV2` en Phase 2 session C
 * (17 mai 2026) selon Écart #8 MODULES-MAP §2.4.
 */
function _definirInfoCoursModeCours(coursId, trimestreActif) {
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
}

/**
 * (Helper privé) Définit groupeCoursActif + infoCours pour le mode
 * GROUPE-COURS (un seul groupe). Synchronise aussi horaireHebdo avec le
 * groupe actif AVANT toute régénération de calendrier (FIX 30 mars 2026).
 * Atomicité critique préservée — les 2 setSync sont consécutifs.
 *
 * Extrait du monstre `changerGroupeCoursActifV2` en Phase 2 session C
 * (17 mai 2026) selon Écart #8 MODULES-MAP §2.4.
 */
async function _definirInfoCoursModeGroupeCours(gc, trimestreActif, groupesCours, cleGC) {
    groupesCours.forEach(g => g.actif = (g.id === gc.id));
    // ✅ CORRIGÉ (11 jan 2026) : Utiliser db.set pour synchroniser IndexedDB avant synchroniserInfoCours
    await db.set(cleGC, groupesCours);

    db.setSync('groupeCoursActif', {
        modeCours: false,
        id: gc.id,
        trimestreId: gc.trimestreId || trimestreActif.id,
        coursId: gc.coursId,
        enseignantId: gc.enseignantId,
        horaireId: gc.horaireId,
        groupe: gc.groupeNum
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
        groupe: gc.groupeNum,
        _modeCours: false,
        _source: 'groupe-cours',
        _groupeCoursId: gc.id  // ID du groupe-cours
    });

    // 🔧 FIX (30 mars 2026) : Synchroniser horaireHebdo avec le groupe actif
    // AVANT de regénérer le calendrier (sinon il utilise les horaires fusionnés)
    if (gc.horaireId) {
        var horaires = db.getSync(cle('horaires'), []);
        var horaireGC = horaires.find(function(h) { return h.id === gc.horaireId; });
        if (horaireGC && horaireGC.seances && horaireGC.seances.length > 0) {
            db.setSync(cle('horaireHebdo'), horaireGC.seances);
            db.setSync(cle('seancesHoraire'), horaireGC.seances);
            db.setSync('seancesHoraire', horaireGC.seances);
        }
    }
}

/**
 * (Helper privé) Rafraîchit le profil étudiant affiché si la sous-section
 * est active et qu'un DA est mémorisé. Si l'étudiant actuel n'est pas dans
 * le nouveau groupe-cours, affiche le premier de la liste.
 *
 * Extrait de `_rafraichirVuesContextDependantes` pour respecter la cible
 * dure cyc ≤ 30 (Phase 2 session C — 17 mai 2026).
 */
function _rafraichirProfilEtudiantSiVisible() {
    // 🆕 BETA 95.6 : Vérifie si la sous-section profil est active et si un DA est mémorisé
    const sousSectionProfil = document.getElementById('suivi-profil');
    if (!sousSectionProfil || sousSectionProfil.classList.contains('u-hide') || !window.profilActuelDA) {
        return;
    }
    if (typeof afficherProfilComplet !== 'function') return;

    // Récupérer la liste des étudiants du nouveau groupe-cours
    const etudiantsNouveauGC = typeof obtenirEtudiantsCoursActif === 'function'
        ? obtenirEtudiantsCoursActif()
        : [];

    // Si l'étudiant actuel n'est pas dans le nouveau groupe, afficher le premier de la liste
    const etudiantExiste = etudiantsNouveauGC.find(e => e.da === window.profilActuelDA);
    if (etudiantExiste) {
        afficherProfilComplet(window.profilActuelDA);
        return;
    }
    if (etudiantsNouveauGC.length === 0) return;

    // Trier et prendre le premier (actif)
    etudiantsNouveauGC.sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
    const premierActif = etudiantsNouveauGC.find(e => !estEtudiantExclu(e));
    if (premierActif) {
        afficherProfilComplet(premierActif.da);
    }
}

/**
 * (Helper privé) Rafraîchit toutes les vues dépendantes du contexte
 * groupe-cours/cours actif : entête, calendrier, étudiants, tableau de
 * bord, profil étudiant, boîte à outils, saisie présences, évaluations,
 * travaux. Factorisation des 2 branches ~90 % dupliquées du monstre
 * original (Mode COURS vs Mode GROUPE-COURS) — seules différences :
 * la valeur du selectHeader, le message de notification, et la
 * régénération du calendrier (uniquement en mode GROUPE-COURS).
 *
 * Extrait du monstre `changerGroupeCoursActifV2` en Phase 2 session C
 * (17 mai 2026) selon Écart #8 MODULES-MAP §2.4.
 *
 * @param {string} valeurHeader Valeur à mettre dans selectGroupeCoursHeader.value
 * @param {string} messageNotification Texte passé à notifications.succes
 * @param {boolean} regenererCalendrier true en mode GROUPE-COURS (regen
 *   calendrier complet pour les bons jours), false en mode COURS.
 */
function _rafraichirVuesContextDependantes(valeurHeader, messageNotification, regenererCalendrier) {
    const selectHeader = document.getElementById('selectGroupeCoursHeader');
    if (selectHeader) selectHeader.value = valeurHeader || '';

    if (typeof mettreAJourContexteEntete === 'function') {
        mettreAJourContexteEntete();
    }

    notifications.succes(messageNotification);

    // Mode GROUPE-COURS uniquement : régénérer le calendrier avec les bons jours
    if (regenererCalendrier && typeof genererCalendrierComplet === 'function') {
        genererCalendrierComplet();
    }

    // 🆕 BETA 95.2 : Rafraîchir le calendrier si visible
    if (typeof afficherCalendrierScolaire === 'function') {
        afficherCalendrierScolaire();
    }

    // 🆕 BETA 95.3 : Rafraîchir la liste des étudiants si visible
    // Réinitialiser le filtre groupe local (redondant avec le dropdown entête)
    const filtreGroupe = document.getElementById('filtre-groupe-liste');
    if (filtreGroupe) filtreGroupe.value = '';
    if (typeof afficherListeEtudiantsConsultation === 'function') {
        afficherListeEtudiantsConsultation();
    }

    // 🆕 BETA 95.6 : Rafraîchir le tableau de bord aperçu (badges nb étudiants)
    if (typeof chargerTableauBordApercu === 'function') {
        chargerTableauBordApercu();
    }

    // 🆕 BETA 95.6 : Rafraîchir le profil étudiant si affiché
    _rafraichirProfilEtudiantSiVisible();

    // 🆕 BETA 96.1 : Rafraîchir la boîte à outils si visible
    if (typeof window.initialiserTirage === 'function') {
        window.initialiserTirage();
    }
    if (typeof window.initialiserQuestions === 'function') {
        window.initialiserQuestions();
    }

    // 🆕 FIX (3 fév 2026) : Rafraîchir le module de saisie des présences si visible
    // Les dates de séances dépendent de l'horaire du groupe-cours actif
    const sectionSaisie = document.getElementById('suivi-saisie');
    if (sectionSaisie && !sectionSaisie.classList.contains('u-hide')) {
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

    // Rafraîchir le bandeau contextuel du panneau Captures de progression (groupe-cours actif)
    if (typeof afficherStatutSnapshots === 'function') {
        afficherStatutSnapshots();
    }

    // Rafraîchir le module travaux si visible
    if (typeof travauxUI !== 'undefined') {
        var si = document.getElementById('evaluations-contenu-import');
        if (si && !si.classList.contains('u-hide') && typeof travauxUI.afficherImport === 'function') travauxUI.afficherImport();
        var sf = document.getElementById('evaluations-contenu-fichiers');
        if (sf && !sf.classList.contains('u-hide') && typeof travauxUI.afficherFichiers === 'function') travauxUI.afficherFichiers();
        var sa = document.getElementById('evaluations-contenu-archivage');
        if (sa && !sa.classList.contains('u-hide') && typeof travauxUI.afficherArchivage === 'function') travauxUI.afficherArchivage();
    }
}

/**
 * Change le groupe-cours actif
 * 🆕 BETA 95.3 (10 jan 2026) : Supporte le mode "cours" (tous groupes fusionnés)
 *
 * Phase 2 session C (17 mai 2026) — éclatée de cyc 94 / 282 LOC en 4
 * fonctions selon Écart #8 MODULES-MAP §2.4. Cible cyc ≤ 30 atteinte.
 * Atomicité du couple `groupeCoursActif`/`infoCours` préservée dans
 * chaque helper (les 2 setSync restent consécutifs sans await entre).
 */
async function changerGroupeCoursActifV2(valeur) {
    if (!valeur) {
        db.setSync('groupeCoursActif', null);
        db.setSync('infoCours', null);
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
        _definirInfoCoursModeCours(coursId, trimestreActif);
        _rafraichirVuesContextDependantes(valeur, 'Cours activé (tous groupes)', false);
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

    await _definirInfoCoursModeGroupeCours(gc, trimestreActif, groupesCours, cleGC);
    _rafraichirVuesContextDependantes(groupeCoursId, 'Groupe-cours activé', true);
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
        options += `<option value="${echapperHtml(ens.id)}">${libelle}</option>`;
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
                    <div><strong>Nom :</strong> ${echapperHtml(ens.prenom)} ${echapperHtml(ens.nom)}</div>
                    <div><strong>Courriel :</strong> ${echapperHtml(ens.courriel || '-')}</div>
                    <div><strong>Institution :</strong> ${echapperHtml(ens.institution || '-')}</div>
                    <div><strong>Département :</strong> ${echapperHtml(ens.departement || '-')}</div>
                    <div><strong>Discipline :</strong> ${echapperHtml(ens.discipline || '-')}</div>
                    <div><strong>Site web :</strong> ${ens.siteWeb ? `<a href="${echapperHtml(ens.siteWeb)}" target="_blank">${echapperHtml(ens.siteWeb)}</a>` : '-'}</div>
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

    if (typeof window.afficherTrimestreGroupeCoursV2 === 'function') {
        window.afficherTrimestreGroupeCoursV2();
    }

    const form = document.getElementById('v2-formulaireGroupeCours');
    if (form) form.classList.remove('u-hide');
}

/**
 * Supprime un groupe-cours (ancienne version - redirige vers la nouvelle)
 * @deprecated Utiliser supprimerGroupeCoursV2() sans paramètre
 */
async function _supprimerGroupeCoursV2_legacy(groupeCoursId) {
    // Redirige vers la nouvelle fonction qui utilise groupeCoursEnEditionId.
    // Post-session-B (17 mai 2026) : `supprimerGroupeCoursV2` extraite vers
    // trimestre-v2-groupes-cours.js, appel via `window.X`.
    if (typeof window.supprimerGroupeCoursV2 === 'function') {
        window.supprimerGroupeCoursV2();
    }
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
    // Naviguer vers la section Contexte (calendrier)
    if (typeof afficherSection === 'function') {
        afficherSection('calendrier');
    }
    // Puis vers la sous-section Calendrier (avec délai pour laisser le DOM se mettre à jour)
    setTimeout(() => {
        if (typeof afficherSousSection === 'function') {
            afficherSousSection('calendrier-vue');
        }
    }, 100);
}

// Exports des fonctions migrées (transférés du résidu, lignes 1203-1216)
window.accederCalendrierRapide = accederCalendrierRapide;
window.peuplerDropdownGroupeCoursActif = peuplerDropdownGroupeCoursActif;
window.changerGroupeCoursDepuisHeader = changerGroupeCoursDepuisHeader;
window.changerGroupeCoursActifV2 = changerGroupeCoursActifV2;
window.peuplerDropdownEnseignants = peuplerDropdownEnseignants;
window.changerEnseignantSelectionneV2 = changerEnseignantSelectionneV2;
window.afficherFormEnseignantV2 = afficherFormEnseignantV2;
window.modifierEnseignantSelectionneV2 = modifierEnseignantSelectionneV2;
window.afficherFormGroupeCoursV2 = afficherFormGroupeCoursV2;
window.mettreAJourApercuGroupeCours = mettreAJourApercuGroupeCours;

})();
