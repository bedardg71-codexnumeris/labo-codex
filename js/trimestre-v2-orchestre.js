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
   - mettreAJourBarreContexte
   - afficherStatistiquesTrimestreV2
   - allerVersAide
   - mettreAJourOptionsFormatHoraire/mettreAJourFormatHoraire/mettreAJourInfoDuree


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
    dans evaluation.js, pas encore chargées quand ce
    module s'exécute. Consolidation prévue dans un chantier séparé
    post-refactor — voir SESSION.md L78.)
   =============================== */


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

            // Cadrage « Rencontres » : un service n'a pas de code, son nom tient lieu de sigle.
            const sigle = coursInfo?.codeCours || coursInfo?.code || coursInfo?.sigle || (coursInfo?.nature === 'service' ? coursInfo.nomCours : null);
            const groupe = gc.groupeNum || '00001';
            const nomEns = ens.prenom ? `${ens.prenom} ${(ens.nom || '').charAt(0)}.` : '';
            const nomHor = hor.nom || '';

            // 🆕 FIX (9 jan 2026) : Libellé lisible même sans cours
            let label = sigle ? `${sigle} gr.${groupe}` : `Groupe ${groupe}`;
            if (nomEns) label += ` - ${nomEns}`;
            if (nomHor) label += ` (${nomHor})`;

            const selected = gcActif && !gcActif.modeCours && gc.id === gcActif.id ? ' selected' : '';
            options += `<option value="${echapperHtml(gc.id)}"${selected}>${echapperHtml(label)}</option>`;
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
                const sigle = coursInfo?.codeCours || coursInfo?.code || coursInfo?.sigle || (coursInfo?.nature === 'service' ? coursInfo.nomCours : null) || coursId;
                const nbGroupes = gcs.length;
                const label = nbGroupes > 1 ? `${sigle} (${nbGroupes} groupes)` : sigle;
                const selected = gcActif && gcActif.modeCours && gcActif.coursId === coursId ? ' selected' : '';
                options += `<option value="cours:${echapperHtml(coursId)}"${selected}>${echapperHtml(label)}</option>`;
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
        // #446 (10 août 2026) — LE GROUPE MARQUÉ ACTIF D'ABORD, le premier ensuite.
        //
        // Ce bloc prenait `groupesCours[0]`, c'est-à-dire le premier de la
        // LISTE. Chez Grégoire, 00002 précède 00008 : un aller-retour entre
        // trimestres faisait donc basculer son groupe actif de 00008 à 00002
        // EN SILENCE — et tous les écrans de suivi avec lui. Le pointeur
        // `groupeCoursActif` est global (non namespacé) : il devient invalide à
        // chaque changement de trimestre, donc ce chemin s'emprunte à CHAQUE
        // bascule, pas dans un cas rare.
        //
        // La SSOT du groupe actif est l'entrée `actif===true` de la liste du
        // trimestre (#130) : elle porte le choix de l'enseignant, et c'est elle
        // qu'il faut restaurer. Le premier de la liste reste le repli — un
        // trimestre peut n'avoir aucun groupe marqué (import, création neuve).
        const gcMarqueActif = groupesCours.find(gc => gc && gc.actif);
        const cible = gcMarqueActif || groupesCours[0];
        await changerGroupeCoursActifV2(cible.id);
        selectHeader.value = cible.id;
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
    const sigle = coursInfo?.codeCours || coursInfo?.code || coursInfo?.sigle || (coursInfo?.nature === 'service' ? coursInfo.nomCours : null) || coursId;

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
    // Cadrage « Rencontres » (12 sept. 2026) : pour un SERVICE (sans code), `infoCours.codeCours`
    // porte le NOM du service. `infoCours` est un miroir d'affichage, pas la source : tous ses
    // lecteurs (Suivi du groupe, profil, horaire, captures, export, rapport de bug) montrent
    // « le code » — ils montrent donc le nom, sans qu'aucun d'eux ne change.
    const sigleGC = coursInfo?.codeCours || coursInfo?.code || coursInfo?.sigle || (coursInfo?.nature === 'service' ? coursInfo.nomCours : null) || '';

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
            // #464/CT-11 : l'écriture MIROIR dans la clé NUE 'seancesHoraire' est
            // retirée — elle recréait le résidu inter-trimestre que la migration
            // #464 purge (fuite : un trimestre neuf resservait ces séances).
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

    // Trier et prendre le premier (actif).
    // #446 : `nom` peut manquer (import CSV incomplet, fiche à moitié saisie)
    // et ce tri s'exécute JUSTE APRÈS un changement de groupe-cours — donc sur
    // le chemin de la bascule de trimestre. Non gardé, il levait et laissait le
    // profil sur l'étudiant du groupe précédent, sans rien signaler.
    etudiantsNouveauGC.sort((a, b) => String(a.nom || '').localeCompare(String(b.nom || ''), 'fr'));
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
    // #887 : le formulaire d'ajout d'élèves du Cadre nomme le cours actif — il vient de changer.
    if (typeof window.rafraichirRattachementEtudiantsV2 === 'function') window.rafraichirRattachementEtudiantsV2();

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
 * Consigne du 12 sept. 2026 (les étiquettes) — le Cadre comme porte principale.
 * Quand le contexte actif est un service, les mots qui nomment l'enseignant·e dans le Cadre
 * (fil d'Ariane, accordéon, sélecteur de profil, formulaire de groupe-cours) disent
 * « orthopédagogue » ; sur un cours, ils redisent « enseignant·e ». Un mot, pas un champ :
 * chaque élément porte `data-mot-nature="<clé>"`, la clé est lue dans js/mots-nature.js.
 * Appelé par `mettreAJourContexteEntete` (contexte.js) : au démarrage et à chaque activation.
 */
function appliquerMotsNatureCadre() {
    if (typeof document.querySelectorAll !== 'function') return;
    const mots = motsNatureContexteActif();
    document.querySelectorAll('[data-mot-nature]').forEach(el => {
        const cle = el.getAttribute('data-mot-nature');
        if (Object.prototype.hasOwnProperty.call(mots, cle)) el.textContent = mots[cle];
    });
    // L'option vide des menus de personne et de cours suit aussi (le reste des options = les fiches).
    // #841 : chaque menu lit AUSSI le point unique quand il se reconstruit (trimestre-v2-enseignants.js,
    // trimestre-v2.js, trimestre-v2-cours.js) — ici, on re-pose le mot à chaque activation sans repeupler.
    // #846 : le champ 2 du groupe-cours (v2-gc-cours) n'y est plus — il nomme un choix, pas le contexte.
    const OPTIONS_VIDES = { 'v2-selectEnseignant': 'choisirPersonne', 'v2-gc-enseignant': 'choisirPersonneGC',
        'v2-selectCours': 'choisirObjet' };
    Object.entries(OPTIONS_VIDES).forEach(([id, cle]) => {
        const sel = document.getElementById(id);
        const vide = sel && sel.options && Array.from(sel.options).find(o => o.value === '');
        if (vide) vide.textContent = mots[cle];
    });
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
window.appliquerMotsNatureCadre = appliquerMotsNatureCadre; // consigne du 12 sept. 2026 (les étiquettes)
window.changerEnseignantSelectionneV2 = changerEnseignantSelectionneV2;
window.afficherFormGroupeCoursV2 = afficherFormGroupeCoursV2;

})();
