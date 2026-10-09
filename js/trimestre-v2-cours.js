/* ===============================
   MODULE: TRIMESTRE V2 — COURS
   Refactor étape 3 session B (17 mai 2026) : extrait depuis trimestre-v2.js
   lignes 118-1081 (zone 3 MODULES-MAP §2.4).

   Périmètre : CRUD cours + synthèses sidebar (cours, enseignant, groupe-étudiants,
   horaire, groupe-cours), formulaire cours, dropdown pratiques de notation,
   helper `setValue` partagé via `window.setValue` (consommé aussi par
   trimestre-v2-init.js et trimestre-v2-horaires.js — fix régression 22 mai 2026).

   Variable module-scope `coursEnEditionV2` migrée ici (consommée uniquement par
   les fonctions de la zone 3).

   Dépendances cross-module accédées via `window.X` (résidu trimestre-v2.js
   chargé AVANT ce fichier dans index.html) :
   - `window.populerDropdownsAssemblageV2` (hub résiduel)
   - `window.mettreAJourFormatHoraire` (résidu, zone format horaire)
   - `window.chargerGroupesCoursV2` (extrait dans trimestre-v2-etudiants.js
     également en session B, chargé après ce fichier)
   =============================== */

(function() {
'use strict';

/* ===============================
   ACCORDÉON COURS
   =============================== */

/**
 * Charge la liste des cours dans le dropdown
 * Filtre par trimestre actif (Beta 95)
 */
/**
 * #455 (19 août 2026, décision Grégoire) : l'identité naturelle d'un cours est
 * son CODE seul. Le cours est une fiche GLOBALE — le devis ministériel ne
 * change pas d'un trimestre à l'autre, 601-101 est le même objet en hiver
 * comme en automne (doctrine #407, `planification-donnees.js`, ici mise en
 * accord ; la période vit dans le GROUPE-COURS, jamais dans le cours).
 * Un `601-101|A2026` distinct du `601-101|H2026` fabriquait deux fiches pour
 * la même chose : une carte rattachée à l'une ne voyait pas les groupes de
 * l'autre (famille #346/#454).
 * ⚠ `session`/`annee`/`trimestreId` encore portés par des fiches legacy sont
 * HISTORIQUES et non décisionnels — comme le préfixe d'un id (`h2026-…`), qui
 * ressemble à de l'information et n'en est pas.
 *
 * CT-15 (23 août 2026) — `_tupleCoursNaturel` vivait ICI, et deux autres
 * versions de la même idée vivaient ailleurs : l'import de `cours.js`
 * comparait en `===` brut (« 601-101-mq » entrait donc à côté de
 * « 601-101-MQ »), et `creerCours` ne comparait rien du tout. La fonction est
 * désormais unique, dans `js/identite-naturelle.js` — trois réponses possibles
 * à « est-ce le même cours ? », c'était zéro source de vérité.
 */

/**
 * Décide de la fusion `listeCours` (legacy) → `cours` (canonique).
 * FONCTION PURE : ne lit ni n'écrit le stockage, ne mute pas ses arguments.
 * Exportée (`window._fusionnerListeCoursDansCours`) pour être testable
 * directement — la sentinelle #442 s'appuie dessus.
 *
 * #442 (10 août 2026, soir) — DEUX dédoublonnages, dans cet ordre :
 *
 *  1. par IDENTITÉ (`id`) — la règle non négociable des collections
 *     partagées (`SKILL_integrite_globaux` §3.2, patron « push sans
 *     replace » de `fusionnerDemoVersGlobaux`). C'est le garde qui
 *     MANQUAIT : `idsV2` était calculé mais n'était consulté que dans la
 *     branche « pas de tuple ». Un cours legacy au tuple DIFFÉRENT mais à
 *     l'id IDENTIQUE passait donc au travers et s'ajoutait au magasin —
 *     à chaque import qui repeuplait `listeCours`. Constat sur les données
 *     réelles de Grégoire (dry-run `reparer154()`, 9 août) : TROIS entrées
 *     601-102-MQ portant toutes `h2026-601-102-MQ-00001`.
 *     ⮕ Le cas concret : la V2 porte `session`+`annee` (tuple
 *     `601-102-MQ|H2026`), la copie legacy restaurée par un import ancien
 *     ne les porte pas (tuple dégradé `601-102-MQ`). Deux tuples, un seul id.
 *
 *  2. par TUPLE NATUREL — il attrape les doublons qui portent des ids
 *     DIFFÉRENTS, que le point 1 ne peut pas voir. Depuis #455 (19 août
 *     2026), le tuple est le CODE seul : `session`/`annee` n'entrent plus
 *     dans l'identité (le cours est global, cf. `cleNaturelleCours`).
 *
 * ▣ Pourquoi écarter par id ne perd RIEN : tous les lecteurs du magasin
 *   résolvent par `find`/`findIndex`/`some` sur `.id` (cours.js, contexte.js,
 *   modes.js, planification-donnees.js…). Une seconde entrée au même id est
 *   donc INATTEIGNABLE par construction — elle n'ajoute que du poids au
 *   budget de stockage (cf. #353). L'écarter est un no-op fonctionnel ; la
 *   laisser entrer était le défaut.
 *
 * @param {Array} coursExistants - contenu actuel du magasin `cours`
 * @param {Array} anciensListeCours - contenu de la clé legacy `listeCours`
 * @returns {{ajouts: Array, doublonsTuple: Array, collisionsId: Array}}
 */
function _fusionnerListeCoursDansCours(coursExistants, anciensListeCours) {
    const existants = Array.isArray(coursExistants) ? coursExistants : [];
    const legacy = Array.isArray(anciensListeCours) ? anciensListeCours : [];

    const tuples = new Map();
    existants.forEach(c => {
        if (!c) return;
        const t = cleNaturelleCours(c);
        if (t) tuples.set(t, c);
    });
    const ids = new Set(existants.filter(c => c && c.id).map(c => c.id));

    const ajouts = [];
    const doublonsTuple = [];
    const collisionsId = [];

    legacy.forEach(c => {
        if (!c) return;
        const t = cleNaturelleCours(c);

        // 1. Identité d'abord — un id déjà présent n'est JAMAIS réinjecté.
        if (c.id && ids.has(c.id)) {
            collisionsId.push({ id: c.id, tuple: t });
            return;
        }
        // 2. Puis le tuple naturel (doublon à id différent).
        if (t && tuples.has(t)) {
            doublonsTuple.push({ tuple: t, legacyId: c.id, v2Id: tuples.get(t).id });
            return;
        }
        // Ni tuple ni id : rien pour identifier l'entrée, on ne l'ajoute pas.
        if (!t && !c.id) return;

        ajouts.push(c);
        // Refermer les deux portes DANS le lot : deux entrées legacy au même
        // id (ou au même tuple) ne doivent pas entrer toutes les deux.
        if (t) tuples.set(t, c);
        if (c.id) ids.add(c.id);
    });

    return { ajouts, doublonsTuple, collisionsId };
}

function _migrerListeCoursVersCoursV2() {
    const anciensListeCours = db.getSync('listeCours', []);
    if (!Array.isArray(anciensListeCours) || anciensListeCours.length === 0) return;

    const coursExistants = db.getSync('cours', []);
    const { ajouts, doublonsTuple, collisionsId } =
        _fusionnerListeCoursDansCours(coursExistants, anciensListeCours);

    if (ajouts.length > 0) {
        db.setSync('cours', [...coursExistants, ...ajouts]); // security-ok: cours legacy locaux, déjà persistés dans listeCours
        console.info(`[Migration listeCours] ${ajouts.length} cours legacy fusionné(s) dans « cours »`);
    }
    db.setSync('listeCours', []); // security-ok: vidage clé legacy après migration

    if (collisionsId.length > 0) {
        console.warn(
            `[Migration listeCours] #442 — ${collisionsId.length} cours legacy écarté(s) : leur id existe déjà dans « cours » (l'entrée en place est préservée)`,
            collisionsId
        );
    }

    if (doublonsTuple.length > 0) {
        console.warn(
            `[Migration listeCours] ${doublonsTuple.length} doublon(s) détecté(s) et ignoré(s) — V2 préservée`,
            doublonsTuple
        );
        if (typeof notifications !== 'undefined' && notifications.info) {
            notifications.info(
                `Migration cours : ${doublonsTuple.length} doublon(s) ignoré(s)`,
                'La version V2 a été préservée. Détails dans la console.'
            );
        }
    }
}

function chargerDropdownCoursV2() {
    const select = document.getElementById('v2-selectCours');
    if (!select) return;

    // Migration one-shot listeCours (legacy) → cours (canonique V2), fusion par tuple naturel
    _migrerListeCoursVersCoursV2();

    const tousCours = db.getSync('cours', []);
    const coursActif = db.getSync('infoCours', null);

    // Refonte chantier A — bibliothèque globale : plus AUCUN filtre par trimestre.
    // La période d'enseignement vit dans le groupe-cours, jamais dans le cours ;
    // un cours créé sous un trimestre est donc visible sous tous les trimestres.

    // Helper: obtenir le texte d'affichage d'un cours
    // 🆕 BETA 95.2 : Le groupe ne fait plus partie du cours (entité indépendante)
    // 🆕 FIX (4 fév 2026) : Ajouter c.code pour compatibilité Primo
    const obtenirTexteCours = (c) => {
        const sigle = c.codeCours || c.sigle || c.code || c.numero || '';
        const titre = c.nomCours || c.titre || c.nom || '';
        // Un service se distingue par son mot, pas par une couleur (cadrage « Rencontres ») ;
        // le mot vient du point unique (js/mots-nature.js, consigne du 12 sept. 2026).
        const texte = c.nature === 'service' ? `${titre} — ${motNature(c)}`.trim() : `${sigle} ${titre}`.trim();
        return texte || `Cours ${c.id || 'sans identifiant'}`;
    };

    // #842 (12 sept. 2026) : le mot de l'option vide suit le contexte actif, depuis le point unique.
    select.innerHTML = '<option value="">' + echapperHtml(motsNatureContexteActif().choisirObjet) + '</option>';

    // Toutes les descriptions de cours, sans distinction de période.
    let coursAfficher = [...tousCours];
    let coursASelectionner = null;

    if (coursActif) {
        // Conserver le cours actif sélectionné s'il existe encore dans la bibliothèque.
        if (!coursAfficher.find(c => c.id === coursActif.id)) {
            coursAfficher.unshift(coursActif);
        }
        coursASelectionner = coursActif;
    } else if (coursAfficher.length > 0) {
        // Aucun cours actif mémorisé : sélectionner le premier et le mémoriser.
        // CONSERVÉ tel quel pour ne pas casser la bascule de trimestre, qui remet
        // infoCours à null puis s'appuie sur ce dropdown (cf. trimestres.js:364).
        // Le découplage infoCours↔dropdown relève d'un chantier ultérieur (B/C).
        coursASelectionner = coursAfficher[0];
        db.setSync('infoCours', coursASelectionner);
    }

    if (coursAfficher.length === 0) {
        // Aucune description de cours dans la bibliothèque (toutes périodes confondues)
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'Aucun cours — crée ou importe un cours';
        option.disabled = true;
        select.appendChild(option);

        // Aucun cours n'existe : pas de cours actif possible.
        db.setSync('infoCours', null);

        // Vider l'affichage des détails du cours
        viderAffichageCoursV2();

        // Cacher les boutons Modifier et Dupliquer
        const btnModifier = document.getElementById('v2-btnModifierCours');
        const btnDupliquer = document.getElementById('v2-btnDupliquerCours');
        if (btnModifier) btnModifier.classList.add('u-hide');
        if (btnDupliquer) btnDupliquer.classList.add('u-hide');
    } else {
        let coursSelectionne = false;

        coursAfficher.forEach((c, index) => {
            const option = document.createElement('option');
            option.value = c.id || `cours-${index}`;
            const texteBase = obtenirTexteCours(c);
            const estActif = coursActif && c.id === coursActif.id;
            option.textContent = estActif ? `${texteBase} (actif)` : texteBase;

            // Sélectionner le cours déterminé (coursASelectionner)
            if (coursASelectionner && c.id === coursASelectionner.id) {
                option.selected = true;
                coursSelectionne = true;
            }
            select.appendChild(option);
        });

        // Section Démo (Plan 1 Phase 2.4) : cours Labo Codex en lecture seule.
        // Skip en mode démo legacy : les cours démo sont déjà dans la clé globale,
        // pas de section séparée à afficher (sera retiré en Plan 1 Phase 5).
        const enDemoLegacy = typeof estEnModeDemo === 'function' && estEnModeDemo();
        if (!enDemoLegacy && typeof cleDemo === 'function' && typeof BibliothequeUI !== 'undefined') {
            const coursDemo = db.getSync(cleDemo('listeCours'), []) || [];
            BibliothequeUI.ajouterOptgroupDemo(select, coursDemo, obtenirTexteCours);
        }

        // Si aucun cours sélectionné mais qu'il y en a, sélectionner le premier
        if (!coursSelectionne && coursAfficher.length > 0) {
            select.options[1].selected = true;
            coursASelectionner = coursAfficher[0];
            coursSelectionne = true;
        }

        // Afficher le formulaire avec le cours sélectionné (Beta 95.2)
        if (coursSelectionne && coursASelectionner) {
            changerCoursSelectionneV2(coursASelectionner.id);
        }

        // Afficher les boutons Modifier et Dupliquer si un cours est sélectionné
        const btnModifier = document.getElementById('v2-btnModifierCours');
        const btnDupliquer = document.getElementById('v2-btnDupliquerCours');
        toggleDisplay(btnModifier, coursSelectionne);
        toggleDisplay(btnDupliquer, coursSelectionne);
    }
}

/**
 * Change le cours sélectionné
 */
function changerCoursSelectionneV2(coursId) {
    if (typeof coursId === 'object' && coursId && coursId.value !== undefined) coursId = coursId.value;
    const etatVide = document.getElementById('cours-etat-vide');
    const formulaire = document.getElementById('cours-formulaire-edition');
    const listeGroupes = document.getElementById('v2-listeGroupes');
    const btnSupprimer = document.getElementById('v2-btnSupprimerCours');

    if (!coursId) {
        // Afficher l'état vide
        if (etatVide) etatVide.classList.remove('u-hide');
        if (formulaire) formulaire.classList.add('u-hide');
        if (listeGroupes) listeGroupes.innerHTML = '<p class="text-muted">Sélectionne un cours pour voir ses groupes.</p>';
        if (btnSupprimer) btnSupprimer.classList.add('u-hide');
        afficherSyntheseCours(null);  // Beta 95.3 : vider la synthèse
        coursEnEditionV2 = null;
        modeFormCoursV2 = null;
        _cacherBandeauEdition();
        _mettreAJourBoutonActiverCours(null);
        return;
    }

    // Charger les détails du cours
    const cours = db.getSync('cours', []);
    let coursSelectionne = cours.find(c => c.id === coursId);

    // 🔧 #466/CT-17 (21 août 2026) : un id non résolvable laissait le formulaire
    // PRÉCÉDENT affiché sans un mot (option périmée, donnée restaurée/corrompue) —
    // l'utilisateur croyait éditer l'élément cliqué. Patron commun aux 3 accordéons.
    if (!coursSelectionne) {
        // 🔧 #916 (18 sept. 2026) : le cours ACTIF peut être absent de la bibliothèque —
        // `infoCours` est un miroir que l'orchestre fabrique depuis le `coursId` du
        // groupe-cours, sans exiger que la fiche existe. chargerDropdownCoursV2 le garde
        // EXPRÈS dans le menu et le sélectionne : ce n'est pas une option périmée, et le
        // recharger le resélectionnerait — récursion sans sortie, qui tuait
        // initialiserTrimestreV2 avant le sélecteur de trimestre. État vide, sans crier.
        const miroirActif = db.getSync('infoCours', null);
        if (miroirActif && miroirActif.id === coursId) {
            console.warn('[Cours V2] Cours actif absent de la bibliothèque :', coursId);
            changerCoursSelectionneV2(null);
            return;
        }
        console.warn('[Cours V2] Sélection non résolue :', coursId);
        notifications.erreur('Cours introuvable', 'La fiche sélectionnée n\'existe plus. La liste va se rafraîchir.');
        chargerDropdownCoursV2();
        changerCoursSelectionneV2(null); // rejoue la branche « état vide » ci-dessus
        return;
    }

    if (coursSelectionne) {
        // Afficher le formulaire en mode édition
        coursEnEditionV2 = coursId;
        _afficherBandeauEdition(coursSelectionne);
        _mettreAJourBoutonActiverCours(coursId);
        if (etatVide) etatVide.classList.add('u-hide');
        if (formulaire) formulaire.classList.remove('u-hide');
        if (btnSupprimer) btnSupprimer.classList.remove('u-hide');

        // Mettre à jour le titre (#842 : « Modifier le cours » / « Modifier le service », selon la fiche)
        _titrerFormCoursV2('modifier');

        // Remplir le formulaire
        remplirFormCoursV2(coursSelectionne);
        rendreModeFicheCoursV2(false);
        afficherSyntheseCours(coursSelectionne);  // Beta 95.3 : synthèse sidebar
        if (typeof window.chargerGroupesCoursV2 === 'function') {
            window.chargerGroupesCoursV2(coursId);
        }
    }
}

/**
 * Supprime le cours actuellement sélectionné
 * Beta 95.2 (8 jan 2026)
 */
async function supprimerCoursV2() {
    if (!coursEnEditionV2) {
        console.warn('[Trimestre V2] Aucun cours sélectionné pour suppression');
        return;
    }

    // Chercher le cours dans la clé canonique
    let cours = db.getSync('cours', []);
    let coursObj = cours.find(c => c.id === coursEnEditionV2);

    if (!coursObj) {
        console.warn('[Trimestre V2] Cours non trouvé:', coursEnEditionV2);
        return;
    }

    const nomCours = coursObj.codeCours || coursObj.sigle || coursObj.code || coursObj.nomCours || coursObj.id;
    const titreCours = coursObj.nomCours || coursObj.nom || coursObj.titre || '';

    // #449 (19 août 2026) : le Cadre passe par le MÊME garde que la
    // Bibliothèque — recensement, refus si le cours porte des données,
    // confirmation « tous trimestres », exécution. L'ancienne suppression
    // nue laissait orphelins groupes-cours, productions, évaluations et
    // présences (famille #154). Pas de garde `typeof` silencieux (leçon
    // #161/#444) : si la fonction manque, on le DIT et on refuse.
    if (typeof window.supprimerFicheCoursAvecGarde !== 'function') {
        console.error('[Trimestre V2] Garde #449 introuvable (cours.js non chargé ?) — suppression refusée');
        alert('La suppression est indisponible : recharge la page et réessaie.');
        return;
    }
    const supprime = await window.supprimerFicheCoursAvecGarde(coursEnEditionV2);
    if (!supprime) return;

    // Réinitialiser l'interface
    coursEnEditionV2 = null;
    _cacherBandeauEdition();
    _mettreAJourBoutonActiverCours(null);
    chargerDropdownCoursV2();

    // Masquer le bouton supprimer et afficher l'état vide
    const btnSupprimer = document.getElementById('v2-btnSupprimerCours');
    if (btnSupprimer) btnSupprimer.classList.add('u-hide');

    const etatVide = document.getElementById('cours-etat-vide');
    const formulaire = document.getElementById('cours-formulaire-edition');
    if (etatVide) etatVide.classList.remove('u-hide');
    if (formulaire) formulaire.classList.add('u-hide');

    // Notification
    notifications.succes('Cours supprimé', `${nomCours} - ${titreCours}`);

    // Beta 95.2: Rafraîchir le dropdown Cours dans la section Groupe-cours
    if (typeof window.populerDropdownsAssemblageV2 === 'function') {
        window.populerDropdownsAssemblageV2();
    }
}

/**
 * Vide l'affichage du cours et du groupe d'étudiants
 * Appelé quand il n'y a aucun cours pour le trimestre actif
 */
function viderAffichageCoursV2() {

    // Vider l'aperçu du cours
    const apercuCours = document.getElementById('v2-apercuCours');
    if (apercuCours) {
        apercuCours.innerHTML = '<p class="text-muted">Sélectionne un cours pour voir ses détails.</p>';
    }

    // Vider les statistiques du groupe
    const nbEtudiants = document.getElementById('v2-nbEtudiantsTotal');
    if (nbEtudiants) nbEtudiants.textContent = window.formaterNbEtudiants ? window.formaterNbEtudiants(0) : '0';

    const groupeCoursElem = document.getElementById('v2-groupeCours');
    if (groupeCoursElem) groupeCoursElem.textContent = '—';

    // Vider la liste des étudiants
    const listeEtudiants = document.getElementById('v2-listeEtudiants');
    if (listeEtudiants) {
        listeEtudiants.innerHTML = '<p class="text-muted text-italic">Aucun cours sélectionné pour ce trimestre.</p>';
    }

    // Vider la liste des groupes
    const listeGroupes = document.getElementById('v2-listeGroupes');
    if (listeGroupes) {
        listeGroupes.innerHTML = '<p class="text-muted">Aucun cours sélectionné.</p>';
    }

    // Vider l'horaire
    const listeSeances = document.getElementById('v2-listeSeances');
    if (listeSeances) {
        listeSeances.innerHTML = '<p class="text-muted">Aucun cours sélectionné.</p>';
    }
}

// Variable pour stocker l'ID du cours en édition
let coursEnEditionV2 = null;

// #842 (12 sept. 2026) : le mode du formulaire ouvert ('nouveau' | 'modifier' | 'dupliquer' | null).
// Le TITRE du formulaire suit la nature de la FICHE — celle du menu Nature — depuis le point unique
// (js/mots-nature.js) : « Modifier le cours » / « Modifier le service ». Reposé à chaque bascule du menu.
let modeFormCoursV2 = null;

function _titrerFormCoursV2(mode) {
    if (mode !== undefined) modeFormCoursV2 = mode;
    const titre = document.getElementById('v2-titreFormCours');
    if (!titre || !modeFormCoursV2) return;
    const nature = document.getElementById('v2-natureCours')?.value === 'service' ? 'service' : 'cours';
    titre.textContent = motsNature(nature)[modeFormCoursV2];
}

// #842 : le bandeau nomme la fiche par son mot (« Cours 601-101 » / « Service Aide à la réussite »).
function _afficherBandeauEdition(cours) {
    const bandeau = document.getElementById('v2-bandeauModeEdition');
    const codeSpan = document.getElementById('v2-bandeauCodeCours');
    const objetSpan = document.getElementById('v2-bandeauObjet');
    const code = cours ? (cours.codeCours || cours.sigle || cours.code || cours.nomCours) : '';
    if (codeSpan) codeSpan.textContent = code || '(sans code)';
    if (objetSpan) objetSpan.textContent = motsNature(cours).Objet;
    if (bandeau) bandeau.classList.remove('u-hide');
}

function _cacherBandeauEdition() {
    const bandeau = document.getElementById('v2-bandeauModeEdition');
    if (bandeau) bandeau.classList.add('u-hide');
}

function _mettreAJourBoutonActiverCours(coursId) {
    const btn = document.getElementById('v2-btnActiverCours');
    if (!btn) return;
    if (!coursId) {
        btn.classList.add('u-hide');
        return;
    }
    const infoCours = db.getSync('infoCours', null);
    const dejaActif = infoCours && infoCours.id === coursId;
    if (dejaActif) {
        btn.classList.add('u-hide');
    } else {
        btn.classList.remove('u-hide');
    }
}

function activerCoursV2() {
    if (!coursEnEditionV2) {
        console.warn('[Trimestre V2] Aucun cours sélectionné pour activation');
        return;
    }
    let tousLesCours = db.getSync('cours', []);
    const cible = tousLesCours.find(c => c.id === coursEnEditionV2);
    if (!cible) {
        console.warn('[Trimestre V2] Cours non trouvé pour activation:', coursEnEditionV2);
        return;
    }
    // Invariant single-active : ce cours actif, les autres non
    tousLesCours.forEach(c => { c.actif = (c.id === coursEnEditionV2); });
    db.setSync('cours', tousLesCours);
    db.setSync('infoCours', cible);

    notifications.succes(motsNature(cible).ObjetLong + ' activé', cible.codeCours || cible.nomCours || cible.id);

    _mettreAJourBoutonActiverCours(coursEnEditionV2);
    if (typeof chargerDropdownCoursV2 === 'function') chargerDropdownCoursV2();
    if (typeof window.peuplerDropdownGroupeCoursActif === 'function') {
        window.peuplerDropdownGroupeCoursActif();
    }
    // #887 : le formulaire d'ajout d'élèves nomme le cours actif — il vient de changer.
    if (typeof window.rafraichirRattachementEtudiantsV2 === 'function') window.rafraichirRattachementEtudiantsV2();
}

/**
 * Affiche le formulaire pour créer un nouveau cours
 */
async function afficherFormCoursV2() {
    await nouveauCoursV2();
}

/**
 * Crée un nouveau cours (affiche le formulaire vide)
 * 🆕 BETA 95.2
 */
async function nouveauCoursV2() {
    if (!(await _quitterCreationCoursSiConfirme())) return;
    coursEnEditionV2 = null;
    _cacherBandeauEdition();
    _mettreAJourBoutonActiverCours(null);

    const etatVide = document.getElementById('cours-etat-vide');
    const formulaire = document.getElementById('cours-formulaire-edition');
    const selectCours = document.getElementById('v2-selectCours');

    // Désélectionner dans le dropdown
    if (selectCours) selectCours.value = '';

    // Afficher le formulaire
    if (etatVide) etatVide.classList.add('u-hide');
    if (formulaire) formulaire.classList.remove('u-hide');
    _titrerFormCoursV2('nouveau'); // #842 : « Nouveau cours » / « Nouveau service », selon le menu Nature

    // Réinitialiser tous les champs
    reinitialiserFormCoursV2();
    rendreModeFicheCoursV2(true);

    // Masquer le bouton Supprimer (mode création)
    const btnSupprimer = document.getElementById('v2-btnSupprimerCours');
    if (btnSupprimer) btnSupprimer.classList.add('u-hide');

}

/**
 * Modifie le cours actuellement sélectionné
 */
async function modifierCoursSelectionneV2() {
    const selectCours = document.getElementById('v2-selectCours');
    const coursId = selectCours?.value;

    if (!coursId) {
        alert('Veuillez sélectionner un cours à modifier.');
        return;
    }

    // Trouver le cours
    const cours = db.getSync('cours', []);
    const coursSelectionne = cours.find(c => c.id === coursId) || db.getSync('infoCours', null);

    if (!coursSelectionne) {
        alert('Cours non trouvé.');
        return;
    }

    coursEnEditionV2 = coursId;
    _afficherBandeauEdition(coursSelectionne);
    _mettreAJourBoutonActiverCours(coursId);

    const formulaire = document.getElementById('v2-formulaireCours');
    const apercu = document.getElementById('v2-apercuCours');
    const btnTexte = document.getElementById('v2-btnTexteCours');

    if (formulaire) {
        formulaire.classList.remove('u-hide');
        if (apercu) apercu.classList.add('u-hide');
        _titrerFormCoursV2('modifier'); // #842
        if (btnTexte) btnTexte.textContent = 'Enregistrer';

        // Remplir les champs avec les données du cours
        remplirFormCoursV2(coursSelectionne);

        // Afficher le bouton Supprimer (mode édition).
        // Même correctif que son jumeau des groupes-cours (10 août 2026) :
        // `.u-hide` vaut `display: none !important`, donc un style en ligne ne
        // peut pas le contrer. Ici le bouton était DÉJÀ déclassé par
        // `changerCoursSelectionneV2` (l'utilisateur sélectionne le cours avant
        // de cliquer Modifier), donc rien ne se voyait — mais la ligne laissait
        // croire qu'elle révélait, et le jour où l'autre chemin bougerait le
        // bouton disparaîtrait en silence.
        const btnSupprimer = document.getElementById('v2-btnSupprimerCours');
        if (btnSupprimer) btnSupprimer.classList.remove('u-hide');

        formulaire.scrollIntoView({ behavior: 'smooth' });
    }
}

/**
 * Duplique le cours actuellement sélectionné
 * Crée une copie avec un nouvel ID et ouvre le formulaire en mode création
 */
function dupliquerCoursSelectionneV2() {
    const selectCours = document.getElementById('v2-selectCours');
    const coursId = selectCours?.value;

    if (!coursId) {
        alert('Veuillez sélectionner un cours à dupliquer.');
        return;
    }

    // Trouver le cours
    const cours = db.getSync('cours', []);
    const coursSelectionne = cours.find(c => c.id === coursId) || db.getSync('infoCours', null);

    if (!coursSelectionne) {
        alert('Cours non trouvé.');
        return;
    }

    // Ouvrir le formulaire en mode création (pas d'édition)
    coursEnEditionV2 = null;
    _cacherBandeauEdition();
    _mettreAJourBoutonActiverCours(null);

    const formulaire = document.getElementById('v2-formulaireCours');
    const apercu = document.getElementById('v2-apercuCours');
    const btnTexte = document.getElementById('v2-btnTexteCours');

    if (formulaire) {
        formulaire.classList.remove('u-hide');
        if (apercu) apercu.classList.add('u-hide');
        _titrerFormCoursV2('dupliquer'); // #842
        if (btnTexte) btnTexte.textContent = 'Créer la copie';

        // Remplir les champs avec les données du cours existant
        remplirFormCoursV2(coursSelectionne);

        // Modifier le nom pour indiquer que c'est une copie
        const nomCours = document.getElementById('v2-nomCours');
        if (nomCours && nomCours.value) {
            nomCours.value = nomCours.value + ' (copie)';
        }

        formulaire.scrollIntoView({ behavior: 'smooth' });
    }

}

/**
 * Remplit le formulaire avec les données d'un cours
 * Gère différents formats de données (Beta 95)
 */
function _remplirChampsInfosCours(cours) {
    setValue('v2-natureCours', cours.nature === 'service' ? 'service' : 'cours');
    changerNatureCoursV2();
    setValue('v2-codeCours', cours.codeCours || cours.sigle || cours.code || '');
    setValue('v2-nomCours', cours.titre || cours.nomCours || '');
    setValue('v2-numeroCompetence', cours.numeroCompetence || '');
    setValue('v2-competence', cours.competence || '');
    setValue('v2-disciplineCours', cours.discipline || '');
    setValue('v2-elementsCompetence', cours.elementsCompetence || '');
    setValue('v2-heuresEnseignement', (cours.heuresContact === 0 || cours.heuresContact) ? cours.heuresContact : '');
    setValue('v2-ponderation', cours.ponderation || '');
    majRepereUnitesCours();
    majRepereHeuresCours();
}

function remplirFormCoursV2(cours) {
    // Refonte chantier C : le formulaire COURS ne porte plus que les champs
    // ministériels. Enseignant/horaire/pratique/groupe sont édités dans le
    // formulaire de groupe-cours ; la période se dérive du trimestre actif.
    _remplirChampsInfosCours(cours);
}

/* ===============================
   CONFORMITÉ RREC — pondération → heures d'enseignement + repère d'unités (chantier A)
   Heures d'enseignement = source de vérité. Pondération = aide à la saisie.
   Une unité = 45 h d'activités d'apprentissage (RREC, art. 1).
   =============================== */

/**
 * Parse une pondération « théorie-labo-perso » (ex. "2-2-3").
 * Retourne null si le format n'est pas reconnu (3 nombres séparés par tirets).
 *
 * #540 (26 août 2026) : ce parseur reste le SEUL juge du format. `_normaliserPonderation`
 * ci-dessous ne fait qu'AMENER une saisie libre jusqu'à lui — elle ne décide jamais
 * seule qu'une pondération est valide. Un seul arbitre, pas deux règles à tenir
 * d'accord.
 * @returns {{theorie:number, labo:number, perso:number}|null}
 */
function _parserPonderation(str) {
    if (!str) return null;
    const parts = String(str).split('-').map(s => s.trim());
    if (parts.length !== 3) return null;
    const nums = parts.map(parseFloat);
    if (nums.some(n => isNaN(n) || n < 0)) return null;
    return { theorie: nums[0], labo: nums[1], perso: nums[2] };
}

/**
 * Ramène une pondération saisie librement à la forme du devis ministériel : « 2-2-3 ».
 *
 * #540 — Grégoire, 26 août 2026 : « qu'il y ait une transformation automatique 2-2-3,
 * comme ça apparaît sur le devis ministériel ». Un seul champ, pas trois : `ponderation`
 * est stockée en CHAÎNE sur l'entité cours, et trois cases obligeraient soit à recomposer
 * la chaîne (habillage), soit à changer le modèle — ce qui casserait les fiches déjà
 * saisies.
 *
 * Ce qui est accepté, et pourquoi :
 * · tirets Unicode (‐ ‑ ‒ – — ― −) → le copier-coller depuis un devis en PDF n'envoie
 *   presque jamais le tiret ASCII ;
 * · espaces, virgules, barres obliques comme séparateurs ;
 * · forme compacte « 223 » — mais SEULEMENT à exactement trois chiffres. « 1023 » est
 *   ambigu (10-2-3 ? 1-0-23 ?) et on refuse plutôt que de deviner ;
 * · décimales au point ou à la virgule (« 1,5-1,5-3 »), rendues au POINT parce que
 *   `_parserPonderation` lit par `parseFloat`.
 *
 * La virgule est traitée comme séparateur uniquement en l'ABSENCE de tiret — sinon
 * « 1,5-1,5-3 » se disloquerait en cinq morceaux.
 *
 * @param {string} str - Saisie brute de l'utilisateur
 * @returns {string|null} - « t-l-p » normalisée, ou null si non reconnaissable
 */
function _normaliserPonderation(str) {
    if (str === null || str === undefined) return null;
    let brut = String(str).trim();
    if (brut === '') return null;

    // Tirets Unicode → tiret ASCII (copier-coller depuis un devis)
    brut = brut.replace(/[\u2010-\u2015\u2212]/g, '-');

    let parts;
    if (brut.indexOf('-') !== -1) {
        parts = brut.split('-');
    } else if (brut.indexOf('/') !== -1) {
        parts = brut.split('/');
    } else if (brut.indexOf(',') !== -1) {
        parts = brut.split(',');
    } else if (/\s/.test(brut)) {
        parts = brut.split(/\s+/);
    } else if (/^[0-9]{3}$/.test(brut)) {
        // Forme compacte, sans ambiguïté possible à trois chiffres exactement
        parts = brut.split('');
    } else {
        return null;
    }

    // Surtout PAS de `.filter(p => p !== '')` ici : « -2-2-3 » se découpe en
    // ['', '2', '2', '3'], et filtrer les vides ferait disparaître le signe négatif
    // pour rendre un « 2-2-3 » que personne n'a saisi. Un morceau vide est le signe
    // d'une malformation — « 2--2-3 » aussi — et se refuse. (Trouvé par la sentinelle
    // #540 cas B, avant que le code n'atteigne l'application.)
    parts = parts.map(p => p.trim());
    if (parts.length !== 3 || parts.some(p => p === '')) return null;

    const nums = parts.map(p => {
        // Une virgule SUBSISTANTE ici est décimale : les cas où elle séparait
        // ont déjà été découpés plus haut.
        if (!/^[0-9]+([.,][0-9]+)?$/.test(p)) return NaN;
        return parseFloat(p.replace(',', '.'));
    });
    if (nums.some(n => isNaN(n) || !isFinite(n) || n < 0)) return null;

    // `String(2)` → « 2 », `String(1.5)` → « 1.5 » : pas de zéro décoratif.
    const normalisee = nums.map(n => String(n)).join('-');

    // Le parseur reste le juge : si lui ne la reconnaît pas, elle n'est pas valide.
    return _parserPonderation(normalisee) ? normalisee : null;
}

/**
 * Formate un nombre d'unités en tiers exacts (les unités tombent toujours sur
 * des tiers : unités = somme_pondération / 3). Ex. 7 → "2 ⅓", 6 → "2".
 * Si la pondération contient des décimales, repli sur 2 décimales.
 */
function _formaterUnites(theorie, labo, perso) {
    const somme = theorie + labo + perso;
    if ([theorie, labo, perso].every(n => Number.isInteger(n))) {
        const entier = Math.floor(somme / 3);
        const reste = somme % 3;
        const frac = reste === 1 ? ' ⅓' : reste === 2 ? ' ⅔' : '';
        // Cas entier == 0 sans fraction : afficher 0
        return (entier === 0 && frac === '') ? '0' : (entier === 0 ? frac.trim() : entier + frac);
    }
    return (somme / 3).toFixed(2);
}

/**
 * Met à jour le repère d'unités affiché (#v2-repereUnites) à partir de la
 * pondération saisie. Repère descriptif, non normatif. Masqué si pondération
 * absente ou malformée.
 */
function majRepereUnitesCours() {
    const repere = document.getElementById('v2-repereUnites');
    if (!repere) return;
    const pond = _parserPonderation(document.getElementById('v2-ponderation')?.value);
    if (!pond) {
        repere.textContent = '';
        return;
    }
    repere.textContent = '≈ ' + _formaterUnites(pond.theorie, pond.labo, pond.perso) + ' unités';
}

/**
 * Nombre de semaines du trimestre ACTIF, lu au calendrier — jamais supposé.
 *
 * #540 lot B (26 août 2026) : `proposerHeuresEnseignementDepuisPonderation` multipliait
 * par `15` en dur. Or `calculerStatistiquesCalendrier` (`trimestre-v2.js`, #366) compte
 * déjà les semaines réelles, et son en-tête dit pourquoi elle existe : elle « remplace
 * les constantes de repli 15/75 qui affichaient un chiffre inventé ». Cette
 * multiplication-là avait échappé au balayage.
 *
 * Un trimestre ne fait pas toujours quinze semaines — session d'été, calendrier écourté,
 * cours intensif. Et quinze semaines de calendrier ne font pas quinze semaines de cours
 * si des congés tombent dedans : c'est `maxSemaine` du calendrier qui fait foi.
 *
 * @returns {number} le nombre de semaines, ou 0 si le calendrier ne dit rien.
 *          0 est un refus de répondre, PAS une valeur — l'appelant ne propose alors rien.
 */
function _semainesDuTrimestreActif() {
    try {
        if (typeof calculerStatistiquesCalendrier !== 'function') return 0;
        const calendrier = db.getSync(cle('calendrierComplet'), null);
        const stats = calculerStatistiquesCalendrier(calendrier);
        return (stats && stats.semaines > 0) ? stats.semaines : 0;
    } catch (e) {
        return 0;
    }
}

/**
 * Handler live (data-on-input sur #v2-ponderation) : propose les heures d'enseignement
 * dérivées de la pondération — (théorie + labo) × semaines RÉELLES du trimestre — SANS
 * écraser une valeur déjà saisie manuellement (les heures d'enseignement restent la
 * source de vérité de la conformité).
 *
 * #540 lot B : quand le calendrier ne dit rien, on ne propose RIEN et on le DIT sous le
 * champ. Même règle que #538 pour la durée d'une séance : une dérivation est une
 * conséquence logique, un nombre écrit dans le code est un arbitraire.
 */
function proposerHeuresEnseignementDepuisPonderation() {
    const champHeures = document.getElementById('v2-heuresEnseignement');
    const pond = _parserPonderation(document.getElementById('v2-ponderation')?.value);
    const semaines = _semainesDuTrimestreActif();

    if (champHeures && pond && semaines > 0
        && (champHeures.value === '' || champHeures.value === undefined)) {
        // Proposition seulement : ne remplit que si le champ est vide.
        champHeures.value = (pond.theorie + pond.labo) * semaines;
    }
    majRepereUnitesCours();
    majRepereHeuresCours();
}

/**
 * Dit sur quelle base la proposition d'heures a été faite — ou pourquoi elle ne l'a pas
 * été. #540 lot B : sans ce repère, un champ qui reste vide ressemble à une panne.
 * Le calcul devient lisible : « (2 + 2) × 15 semaines = 60 h ».
 */
function majRepereHeuresCours() {
    const repere = document.getElementById('v2-repereHeures');
    if (!repere) return;

    const pond = _parserPonderation(document.getElementById('v2-ponderation')?.value);
    if (!pond) { repere.textContent = ''; return; }

    const semaines = _semainesDuTrimestreActif();
    const heuresSemaine = pond.theorie + pond.labo;

    if (semaines > 0) {
        repere.textContent = '(' + pond.theorie + ' + ' + pond.labo + ') × '
            + semaines + ' semaines = ' + (heuresSemaine * semaines) + ' h';
    } else {
        // On NOMME l'absence plutôt que d'inventer un nombre de semaines.
        repere.textContent = heuresSemaine + ' h par semaine — le calendrier du trimestre '
            + 'ne dit pas encore combien de semaines.';
    }
}

/**
 * Handler `data-on-change` du champ pondération : ramène la saisie à la forme du devis.
 *
 * #540 — `change` se déclenche à la perte de focus quand la valeur a bougé, ce qui est
 * exactement le moment voulu. On ne normalise PAS à chaque frappe (`input`) : « 2-2 » en
 * cours de saisie n'est pas une erreur, c'est un mot inachevé.
 *
 * Une saisie non reconnaissable est laissée TELLE QUELLE — on ne l'efface pas sous les
 * doigts de l'utilisateur. C'est l'enregistrement qui la refuse, en le disant.
 */
function normaliserPonderationCoursV2() {
    const champ = document.getElementById('v2-ponderation');
    if (!champ) return;
    const normalisee = _normaliserPonderation(champ.value);
    if (normalisee && normalisee !== champ.value.trim()) {
        champ.value = normalisee;
    }
    majRepereUnitesCours();
    majRepereHeuresCours();
}

/**
 * Affiche la synthèse du cours dans la sidebar (Beta 95.3)
 * Synthèse concise: nom, discipline, compétence
 */
function afficherSyntheseCours(cours) {
    const sidebar = document.getElementById('v2-apercuCoursSidebar');
    if (!sidebar) return;

    if (!cours) {
        // #842 : « Aucun cours sélectionné » / « Aucun service sélectionné », selon le contexte actif (point unique).
        sidebar.innerHTML = '<p class="etat-vide-resume" data-mot-nature="aucunObjet">' + echapperHtml(motsNatureContexteActif().aucunObjet) + '</p>';
        return;
    }

    // 🆕 FIX (4 fév 2026) : Priorité codeCours
    const code = cours.codeCours || cours.sigle || cours.code || '';
    const nom = cours.nomCours || cours.titre || cours.nom || '';
    const discipline = cours.discipline || '—';
    const competence = cours.numeroCompetence || cours.competence || '—';

    const infoCours = db.getSync('infoCours', null);
    const estActif = infoCours && infoCours.id === cours.id;
    const badgeActif = estActif ? `<div class="apercu-badge-actif">${motsNature(cours).ObjetLong} actif</div>` : '';

    if (cours.nature === 'service') {
        sidebar.innerHTML = `
        ${badgeActif}
        <div class="apercu-titre">${echapperHtml(nom)}</div>
        <div class="apercu-code">${motNature(cours)}</div>
    `;
        return;
    }

    sidebar.innerHTML = `
        ${badgeActif}
        <div class="apercu-titre">${echapperHtml(nom)}</div>
        <div class="apercu-code">${echapperHtml(code)}</div>
        <div class="apercu-detail">Discipline : ${echapperHtml(discipline)}</div>
        <div class="apercu-detail">Compétence : ${echapperHtml(competence)}</div>
    `;
}

/**
 * 🆕 Beta 95.3 : Synthèse Enseignant dans sidebar
 * Affiche : Prénom Nom, Courriel, Institution - Département
 */
function afficherSyntheseEnseignant(enseignant) {
    const elemNom = document.getElementById('enseignant-resume-nom');
    const elemCourriel = document.getElementById('enseignant-resume-courriel');
    const elemInstitution = document.getElementById('enseignant-resume-institution');

    if (!elemNom) return;

    if (!enseignant) {
        if (elemNom) elemNom.textContent = '—';
        if (elemCourriel) elemCourriel.textContent = '';
        if (elemInstitution) elemInstitution.textContent = '';
        return;
    }

    const nom = `${enseignant.prenom || ''} ${enseignant.nom || ''}`.trim() || '—';
    const courriel = enseignant.courriel || '';
    const institution = enseignant.institution || '';
    const departement = enseignant.departement || '';
    const instDept = [institution, departement].filter(Boolean).join(' — ');

    if (elemNom) elemNom.textContent = nom;
    if (elemCourriel) elemCourriel.textContent = courriel;
    if (elemInstitution) elemInstitution.textContent = instDept;
}

/**
 * 🆕 Beta 95.3 : Synthèse Groupe Étudiants dans sidebar
 * Affiche : X étudiants, Y en SA, Top programmes
 */
function afficherSyntheseGroupeEtudiants() {
    const etudiants = obtenirDonneesSelonMode('groupeEtudiants') || [];

    // Mettre à jour les compteurs existants
    const elemTotal = document.getElementById('v2-resumeNbTotal');
    const elemNbTotal = document.getElementById('v2-nbEtudiantsTotal');
    const elemSA = document.getElementById('v2-resumeNbSA');
    const conteneurSA = document.getElementById('v2-resumeSA');
    const elemProgrammes = document.getElementById('v2-topProgrammes');

    const total = etudiants.length;
    const nbSA = etudiants.filter(e => e.sa === true || e.sa === 'oui' || e.sa === 'Oui' || e.SA === true).length;

    // Compter les programmes
    const programmes = {};
    etudiants.forEach(e => {
        const prog = e.programme || e.programmeEtudes || 'Non spécifié';
        programmes[prog] = (programmes[prog] || 0) + 1;
    });
    const topProgrammes = Object.entries(programmes)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

    // Mettre à jour l'affichage
    if (elemTotal) elemTotal.textContent = total;
    const elemLabelEtud = document.getElementById('v2-resumeLabelEtudiants');
    if (elemLabelEtud && window.pluriel) elemLabelEtud.textContent = window.pluriel(total, 'étudiant·e', 'étudiant·es');
    if (elemNbTotal) elemNbTotal.textContent = window.formaterNbEtudiants ? window.formaterNbEtudiants(total) : total;

    if (conteneurSA) {
        toggleDisplay(conteneurSA, nbSA > 0);
        if (elemSA) elemSA.textContent = window.formaterNbEtudiants ? window.formaterNbEtudiants(nbSA) : nbSA;
    }

    if (elemProgrammes) {
        if (topProgrammes.length > 0 && total > 0) {
            elemProgrammes.classList.remove('u-hide');
            elemProgrammes.innerHTML = '<strong style="font-size: 0.75rem;">Programmes :</strong><br>' +
                topProgrammes.map(([prog, nb]) => `<span style="font-size: 0.75rem;">${echapperHtml(prog)} (${nb})</span>`).join('<br>');
        } else {
            elemProgrammes.classList.add('u-hide');
        }
    }
}

/**
 * 🆕 Beta 95.3 : Synthèse Horaire dans sidebar
 * Affiche : X séances/sem, Y heures, Jours
 */
function afficherSyntheseHoraire(horaire) {
    const sidebar = document.getElementById('v2-carteResumeHoraire');
    if (!sidebar) return;

    if (!horaire || !horaire.seances || horaire.seances.length === 0) {
        sidebar.innerHTML = '<p class="etat-vide-resume">Aucun horaire sélectionné</p>';
        return;
    }

    const seances = horaire.seances || [];
    const nbSeances = seances.length;

    // Calculer les heures totales
    let totalMinutes = 0;
    const joursSet = new Set();
    const joursNoms = { 'lundi': 'Lun', 'mardi': 'Mar', 'mercredi': 'Mer', 'jeudi': 'Jeu', 'vendredi': 'Ven', 'samedi': 'Sam' };

    seances.forEach(s => {
        if (s.heureDebut && s.heureFin) {
            const [h1, m1] = s.heureDebut.split(':').map(Number);
            const [h2, m2] = s.heureFin.split(':').map(Number);
            totalMinutes += (h2 * 60 + m2) - (h1 * 60 + m1);
        }
        if (s.jour) {
            joursSet.add(joursNoms[s.jour.toLowerCase()] || s.jour.substring(0, 3));
        }
    });

    const heures = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const heuresStr = minutes > 0 ? `${heures}h${minutes}` : `${heures}h`;
    const joursStr = Array.from(joursSet).join(', ');

    sidebar.innerHTML = `
        <div class="apercu-titre">${echapperHtml(horaire.nom || 'Horaire')}</div>
        <div class="apercu-detail">${nbSeances} séance${nbSeances > 1 ? 's' : ''}/sem. • ${heuresStr}</div>
        <div class="apercu-detail">Jours : ${joursStr || '—'}</div>
    `;
}

/**
 * 🆕 Beta 95.3 : Synthèse Groupe-cours dans sidebar
 * Affiche : Code cours - Groupe, Enseignant, Séances/étudiants, Pratique
 */
function afficherSyntheseGroupeCours(gc) {
    const sidebar = document.getElementById('v2-carteResumeGroupeCours');
    if (!sidebar) return;

    if (!gc) {
        sidebar.innerHTML = '<p class="etat-vide-resume">Aucun groupe-cours sélectionné</p>';
        return;
    }

    // Récupérer les entités liées
    const cours = db.getSync('cours', []);
    const enseignants = db.getSync('enseignants', []);
    // 🆕 FIX (1er fév 2026) : Utiliser cle() pour namespacing (horaires est dans CLES_NAMESPACEES)
    const cleHoraires = cle('horaires');
    const horaires = db.getSync(cleHoraires, []);
    const pratiques = db.getSync(cle('pratiquesConfigurables'), null) || [];

    const coursInfo = cours.find(c => c.id === gc.coursId);
    const ens = enseignants.find(e => e.id === gc.enseignantId);
    const hor = horaires.find(h => h.id === gc.horaireId);
    const prat = pratiques.find(p => p.id === gc.pratiqueId);

    // Construire le libellé
    const codeCours = coursInfo?.codeCours || coursInfo?.sigle || null;
    const groupe = gc.groupeNum || '00001';
    const titre = codeCours ? `${codeCours} — Groupe ${groupe}`
        : (coursInfo?.nature === 'service' ? `${coursInfo.nomCours || motsNature(coursInfo).Objet} — ${motNature(coursInfo)}` : `Groupe ${groupe}`);

    const nomEns = ens ? `${ens.prenom || ''} ${ens.nom || ''}`.trim() : '—';
    const nbSeances = hor?.seances?.length || 0;
    const nomPratique = prat?.nom || gc.pratiqueId || '—';

    // Score de complétude
    const elements = [gc.coursId, gc.enseignantId, gc.horaireId, gc.pratiqueId, gc.groupeNum];
    const complets = elements.filter(Boolean).length;

    sidebar.innerHTML = `
        <div class="apercu-titre">${echapperHtml(titre)}</div>
        <div class="apercu-detail">${echapperHtml(nomEns)}</div>
        <div class="apercu-detail">${nbSeances} séance${nbSeances !== 1 ? 's' : ''}/sem.</div>
        <div class="apercu-detail">Pratique : ${echapperHtml(nomPratique)}</div>
        <div class="apercu-completude" style="font-size: 0.75rem; color: ${complets === 5 ? 'var(--vert-principal)' : 'var(--orange-principal)'}; margin-top: 5px;">
            ${complets}/5 éléments configurés
        </div>
    `;
}

/**
 * Dérive { session, annee } depuis le trimestre actif (SSOT).
 * Source unique : l'ID du trimestre actif (ex. "e2026" → session "E", année 2026),
 * avec repli sur ses propriétés session/annee. Le regex [aeh] couvre Hiver/Été/Automne.
 * Refonte chantier B/C : la période ne vit JAMAIS sur le cours. Ce helper est exporté
 * et consommé par les lecteurs de période (statistiques.js, trimestres.js…) qui
 * dérivent la session/année du trimestre actif plutôt que de l'objet cours.
 * @returns {{session: string, annee: number}}
 */
function _deriverSessionAnneeTrimestreActif() {
    const trimestreActif = typeof obtenirTrimestreActif === 'function' ? obtenirTrimestreActif() : null;
    let session = 'H';
    let annee = new Date().getFullYear();
    if (trimestreActif) {
        const match = trimestreActif.id.match(/^([aeh])(\d{4})$/i);
        if (match) {
            session = match[1].toUpperCase();
            annee = parseInt(match[2]);
        } else if (trimestreActif.session && trimestreActif.annee) {
            session = trimestreActif.session.charAt(0).toUpperCase();
            annee = trimestreActif.annee;
        }
    }
    return { session, annee };
}

function reinitialiserFormCoursV2() {
    // Refonte chantier C : seuls les champs ministériels subsistent dans ce formulaire.
    const champs = [
        'v2-codeCours', 'v2-nomCours', 'v2-numeroCompetence', 'v2-competence', 'v2-disciplineCours',
        'v2-elementsCompetence', 'v2-heuresEnseignement', 'v2-ponderation'
    ];
    champs.forEach(id => setValue(id, ''));
    setValue('v2-natureCours', 'cours');
    changerNatureCoursV2();
    majRepereUnitesCours();
    majRepereHeuresCours();
}

/**
 * Cadrage « Rencontres » (12 sept. 2026) — la nature du cours commande le formulaire.
 * Un service n'a que son nom : les blocs ministériels (code, compétence, pondération,
 * discipline) se cachent, et « Nom du cours » devient « Nom du service », requis.
 * Rien n'est effacé : revenir à « Enseignement » remontre les champs tels qu'ils étaient.
 *
 * Consigne du 12 sept. 2026 (les étiquettes) : les MOTS du menu Nature et des libellés
 * viennent du point unique js/mots-nature.js — posés ici à chaque ouverture du formulaire,
 * jamais écrits en dur dans index.html. Les VALEURS restent 'cours' / 'service'.
 */
function changerNatureCoursV2() {
    const select = document.getElementById('v2-natureCours');
    _libellerMenuNatureCoursV2(select);
    const nature = select?.value === 'service' ? 'service' : 'cours';
    const service = nature === 'service';
    const mots = motsNature(nature);
    ['v2-champCodeCours', 'v2-ligneCompetence', 'v2-lignePonderation', 'v2-ligneDiscipline'].forEach(id => {
        const bloc = document.getElementById(id);
        if (bloc) bloc.classList.toggle('u-hide', service);
    });
    const label = document.getElementById('v2-labelNomCours');
    if (label) {
        // security-ok: `mots.objet` est une constante de js/mots-nature.js, pas une donnée utilisateur
        label.innerHTML = service
            ? 'Nom du ' + mots.objet + ' <span class="champ-requis u-texte-medium" title="Champ obligatoire">*</span>'
            : 'Nom du ' + mots.objet;
    }
    const nom = document.getElementById('v2-nomCours');
    if (nom) nom.placeholder = service ? 'Ex: Aide à la réussite en français' : 'Ex: Écriture et littérature';
    _titrerFormCoursV2(); // #842 : le titre suit la fiche (« Nouveau service » dès que le menu bascule)
    const btnCreer = document.getElementById('v2-btnCreerCours');
    if (btnCreer) btnCreer.textContent = mots.creer;     // lot E2 : « Créer le cours » / « Créer le service »
}

/** Les options du menu Nature et sa phrase d'aide : le mot de chaque nature, depuis le point unique. */
function _libellerMenuNatureCoursV2(select) {
    if (select && select.options) {
        Array.from(select.options).forEach(opt => { opt.textContent = motNature(opt.value); });
    }
    const aide = document.getElementById('v2-aideNatureCours');
    if (aide) {
        const s = motsNature('service');
        aide.textContent = 'Un ' + s.objetLong + ' n\'a ni code, ni discipline, ni compétence : seul son nom est requis.';
    }
}

/**
 * Utilitaire pour définir la valeur d'un champ
 */
function setValue(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value;
}

/**
 * Lot E2 (D3) — une fiche existante s'enregistre toute seule : « Créer le cours » (ou
 * « Créer le service », selon le menu Nature) ne paraît qu'en création.
 */
function rendreModeFicheCoursV2(enCreation) {
    const btn = document.getElementById('v2-btnCreerCours');
    if (btn) btn.classList[enCreation ? 'remove' : 'add']('u-hide');
}

/** Lot E2 : la nature choisie dans le formulaire ('cours' | 'service'). */
function _natureFormCoursV2() {
    return document.getElementById('v2-natureCours')?.value === 'service' ? 'service' : 'cours';
}

/** Lot E2 : « la fiche est en création et porte une saisie » (ui-dialogues.js). */
function coursEnCreationSaisi() {
    const formulaire = document.getElementById('cours-formulaire-edition');
    if (!formulaire || formulaire.classList.contains('u-hide')) return false;
    if (coursEnEditionV2) return false;
    return ['v2-codeCours', 'v2-nomCours', 'v2-numeroCompetence', 'v2-competence', 'v2-disciplineCours',
        'v2-elementsCompetence', 'v2-heuresEnseignement', 'v2-ponderation']
        .some(id => String(document.getElementById(id)?.value || '').trim());
}
if (window.uiDialogues) window.uiDialogues.declarerFicheEnCreation('cours', coursEnCreationSaisi);

/** Lot E2 : la question de sortie, au titre de la fiche (« Ce cours… » / « Ce service… »). */
async function _quitterCreationCoursSiConfirme() {
    if (!window.uiDialogues) return true;
    return window.uiDialogues.quitterCreationSiConfirme('cours', motsNature(_natureFormCoursV2()).pasEncoreCree);
}

/**
 * Lot E2 : choisir une fiche dans le menu. Pendant une création, la question de sortie ;
 * « Rester » garde la création à l'écran.
 */
async function choisirCoursV2(el) {
    const select = document.getElementById('v2-selectCours');
    const coursId = (el && el.value !== undefined) ? el.value : select?.value;
    if (!(await _quitterCreationCoursSiConfirme())) {
        if (select) select.value = '';
        return;
    }
    changerCoursSelectionneV2(coursId);
}

/** Lot E2 (D3) : « Annuler » devient « Fermer » — il n'annulait rien. En création, la question. */
async function fermerFicheCoursV2() {
    if (!(await _quitterCreationCoursSiConfirme())) return;
    _fermerFormCoursV2();
}

/**
 * Lot E2 (D3) — un champ d'une fiche EXISTANTE s'enregistre au changement (par le même
 * écrivain que la création, `sauvegarderCoursV2` : mêmes vérifications, même garde #455).
 * En création, rien : c'est « Créer le cours » qui écrit.
 */
async function sauvegarderChampCoursV2() {
    if (!coursEnEditionV2) return false;
    return sauvegarderCoursV2();
}

/** Lot E2 : la pondération se normalise (#540), puis s'enregistre sur une fiche existante. */
async function changerPonderationCoursV2() {
    normaliserPonderationCoursV2();
    return sauvegarderChampCoursV2();
}

/**
 * Lot E2 : changer la nature. Le formulaire suit (#834), et sur une fiche existante la
 * nature s'enregistre. ⚠ Un cours qui devient service perd en base son code, sa discipline,
 * sa compétence et sa pondération (un service n'en a pas, #834) : quand la fiche en porte,
 * on le demande d'abord ; « Annuler » remet le menu.
 */
async function changerNatureFicheCoursV2() {
    changerNatureCoursV2();
    if (!coursEnEditionV2) return false;
    const enBase = (db.getSync('cours', []) || []).find(c => c.id === coursEnEditionV2);
    if (enBase && enBase.nature !== 'service' && _natureFormCoursV2() === 'service') {
        const porteDesDonnees = ['codeCours', 'discipline', 'ponderation', 'numeroCompetence', 'competence', 'elementsCompetence']
            .some(ch => String(enBase[ch] || '').trim()) || (enBase.heuresContact === 0 || !!enBase.heuresContact);
        if (porteDesDonnees && !confirm(
            'Ce cours deviendra un service : son code, sa discipline, sa compétence et sa pondération seront effacés.\n\nContinuer ?')) {
            setValue('v2-natureCours', 'cours');
            changerNatureCoursV2();
            return false;
        }
    }
    return sauvegarderCoursV2();
}

/**
 * Referme le formulaire et revient à l'état vide (ex-annulerFormCoursV2, sans question).
 */
function _fermerFormCoursV2() {
    coursEnEditionV2 = null;
    modeFormCoursV2 = null;
    _cacherBandeauEdition();
    _mettreAJourBoutonActiverCours(null);

    const etatVide = document.getElementById('cours-etat-vide');
    const formulaire = document.getElementById('cours-formulaire-edition');
    const selectCours = document.getElementById('v2-selectCours');

    // Afficher l'état vide
    if (etatVide) etatVide.classList.remove('u-hide');
    if (formulaire) formulaire.classList.add('u-hide');

    // Désélectionner dans le dropdown
    if (selectCours) selectCours.value = '';

    reinitialiserFormCoursV2();
}

/**
 * Sauvegarde le cours (création ou modification)
 */
function _lireChampsInfosCoursDOM() {
    const heuresBrut = document.getElementById('v2-heuresEnseignement')?.value?.trim();
    return {
        nature: document.getElementById('v2-natureCours')?.value === 'service' ? 'service' : 'cours',
        codeCours: document.getElementById('v2-codeCours')?.value?.trim(),
        nomCours: document.getElementById('v2-nomCours')?.value?.trim(),
        discipline: document.getElementById('v2-disciplineCours')?.value?.trim(),
        numeroCompetence: document.getElementById('v2-numeroCompetence')?.value?.trim() || '',
        competence: document.getElementById('v2-competence')?.value?.trim() || '',
        elementsCompetence: document.getElementById('v2-elementsCompetence')?.value?.trim() || '',
        // Heures d'enseignement = source de vérité de la conformité RREC (chantier A).
        // Vide → null (cours sans exigence saisie), sinon nombre.
        heuresContact: (heuresBrut === '' || heuresBrut === undefined) ? null : (parseFloat(heuresBrut) || null),
        // #540 : on normalise ICI aussi — l'utilisateur peut cliquer « Enregistrer »
        // sans jamais quitter le champ, et `change` ne se serait pas déclenché.
        // Une saisie NON reconnaissable est rendue TELLE QUELLE (et non vidée) pour que
        // `sauvegarderCoursV2` distingue « pas de pondération » de « pondération illisible »
        // et le dise correctement.
        ponderation: (function() {
            const brut = document.getElementById('v2-ponderation')?.value?.trim() || '';
            return _normaliserPonderation(brut) || brut;
        })()
    };
}

function _lireDonneesFormCoursV2() {
    // Refonte chantier C : le cours est une DESCRIPTION ministérielle pure.
    // On ne lit donc que les champs ministériels présents dans le formulaire.
    // Enseignant/horaire/pratique/groupe vivent dans le groupe-cours ; session/année
    // se dérivent du trimestre actif (cf. _deriverSessionAnneeTrimestreActif), jamais
    // du cours.
    return _lireChampsInfosCoursDOM();
}

// Re-synchronise infoCours quand on vient de modifier le cours actuellement actif.
// CoursEntite.mettreAJour préserve les champs non ministériels (legacy : enseignant,
// groupe, session…) tant que le chantier D (re-ID) n'a pas tourné — aucune perte sur
// les cours estampillés réels (601-101).
function _resyncInfoCoursSiActif(coursSauve) {
    const info = db.getSync('infoCours', null);
    if (info && coursSauve && info.id === coursSauve.id) {
        db.setSync('infoCours', coursSauve);
    }
}

// Auto-activation : uniquement le tout PREMIER cours créé. Pour activer un autre
// cours après coup, utiliser le bouton « Activer ce cours ».
function _activerSiPremierCours(coursSauve) {
    const tous = db.getSync('cours', []);
    if (tous.length !== 1) return;
    const majs = tous.map(c => c.id === coursSauve.id ? { ...c, actif: true } : c);
    db.setSync('cours', majs);
    db.setSync('infoCours', { ...coursSauve, actif: true });
}

/**
 * Lot E2 (D3) : un refus de vérification dit « Non enregistré – ‹geste› : ‹raison› » par le
 * témoin commun (avant : un toast d'erreur, à côté d'un message de réussite possible).
 */
function _refuserCoursV2(phrase, geste) {
    if (window.temoinEnregistrement) {
        window.temoinEnregistrement.nonEnregistre(window.raisonPourTemoin(phrase), geste, 'cours');
    }
    return false;
}

/**
 * Après l'écriture. Création : « Cours « … » créé. » (ou « Service d'orthopédagogie « … »
 * créé. »), puis la fiche s'ouvre en modification. Modification : le témoin a dit
 * « Enregistré » ; le formulaire reste ouvert, menus et synthèse relus.
 */
function _apresEcritureCoursV2(cours, creation) {
    chargerDropdownCoursV2();
    const selectCours = document.getElementById('v2-selectCours');
    if (creation) {
        const mots = motsNature(cours);
        notifications.succes(`${mots.ObjetLong} «\u00a0${cours.codeCours || cours.nomCours || ''}\u00a0» créé.`);
        if (selectCours) selectCours.value = cours.id;
        changerCoursSelectionneV2(cours.id);
    } else {
        if (selectCours) selectCours.value = cours.id;
        afficherSyntheseCours(cours);
        _afficherBandeauEdition(cours);
    }
    if (typeof window.populerDropdownsAssemblageV2 === 'function') {
        window.populerDropdownsAssemblageV2();
    }
}

/**
 * L'écrivain unique d'une fiche de cours ou de service : « Créer le cours » en création,
 * chaque champ en modification (lot E2, D3). Mêmes vérifications dans les deux cas.
 * @returns {Promise<boolean>} true si la fiche a été écrite
 */
async function sauvegarderCoursV2() {
    const d = _lireDonneesFormCoursV2();
    const creation = !coursEnEditionV2;
    const motsFiche = motsNature(d.nature);
    const geste = creation ? motsFiche.creer : motsFiche.modifier;

    // Cadrage « Rencontres » (12 sept. 2026) — un SERVICE n'a que son nom. Les trois
    // exigences #540 ci-dessous (code, discipline, pondération) décrivent un devis
    // ministériel ; un service n'en a pas. Ses champs restent vides en base, et la
    // garde de doublon par code (#455) ne le voit pas : son identité n'est pas un code.
    if (d.nature === 'service') {
        if (!d.nomCours) {
            return _refuserCoursV2('Le nom du ' + motsFiche.objet + ' est requis : c\'est le seul champ d\'un ' + motsFiche.objetLong + '.', geste);
        }
        d.codeCours = '';
        d.discipline = '';
        d.ponderation = '';
        d.numeroCompetence = '';
        d.competence = '';
        d.elementsCompetence = '';
        d.heuresContact = null;
        let coursService;
        try {
            coursService = await ecrireEtAnnoncer('cours', () => (creation
                ? CoursEntite.creer(d)
                : CoursEntite.mettreAJour(coursEnEditionV2, d)), { geste });
        } catch (e) { return false; }
        if (!coursService) {
            return _refuserCoursV2(creation
                ? 'Le ' + motsFiche.objet + ' n\'a pas pu être enregistré.'
                : 'La fiche a peut-être été supprimée depuis un autre onglet. Recharge la page.', geste);
        }
        if (creation) _activerSiPremierCours(coursService); else _resyncInfoCoursSiActif(coursService);
        _apresEcritureCoursV2(coursService, creation);
        return true;
    }

    // #540 (26 août 2026) — TROIS champs requis, et tous les trois le DISENT à l'écran
    // (astérisque `champ-requis`, légende sous le formulaire). Lot E2 (D3) : le refus passe
    // par le témoin commun, « Non enregistré – ‹geste› : ‹raison› ».
    if (!d.codeCours) {
        return _refuserCoursV2('Le code du cours est requis : il identifie la fiche pour tous les trimestres. Ex. : 601-101-MQ.', geste);
    }
    if (!d.discipline) {
        return _refuserCoursV2('Choisis la discipline dans la liste.', geste);
    }

    // #540 — La pondération devient la SOURCE de la durée hebdomadaire d'enseignement :
    // `(théorie + labo)` est le nombre d'heures en classe par semaine — 4 h en littérature
    // (2-2-3), 4 h en philosophie (3-1-3), 5 h en chimie (3-2-3). RÈGLE UNIQUE, tranchée par
    // Grégoire le 26 août : la même exigence pour une fiche ancienne et pour une fiche neuve.
    if (!d.ponderation) {
        return _refuserCoursV2('La pondération est requise : elle donne les heures de cours par semaine. Format du devis ministériel : 2-2-3.', geste);
    }
    if (!_parserPonderation(d.ponderation)) {
        return _refuserCoursV2('La pondération n\'est pas reconnue : trois nombres, comme sur le devis ministériel. Ex. : 2-2-3.', geste);
    }

    // #455 : le cours est GLOBAL — une fiche par code, servie à tous les
    // trimestres. Une seconde fiche au même code fabriquerait deux « 601-101 »
    // dont les groupes-cours ne se verraient pas (famille #346/#154).
    // Le geste reste possible (confirm), jamais silencieux.
    //
    // CT-15 (23 août 2026) : la DÉTECTION est passée à `CoursEntite`, qui la
    // refait de son côté au point d'écriture. Ici on ne fait plus que PARLER à
    // Grégoire — et son oui est reporté à l'entité par `doublonAssume`.
    //
    // ⚠ L'ÉDITION EST GARDÉE ELLE AUSSI. Renommer le code d'une fiche pour lui
    // donner celui d'une autre fabrique exactement le doublon que la création
    // refuse. Lot E2 : en modification, « Annuler » remet le code en base dans le champ.
    const dejaLa = await CoursEntite.chercherDoublonCode(
        d, coursEnEditionV2 ? { exclureId: coursEnEditionV2 } : undefined);
    let doublonAssume = false;
    if (dejaLa) {
        const quandMeme = confirm(
            'Une fiche « ' + d.codeCours + ' » existe déjà.\n\n' +
            'Le cours est global : la même fiche sert tous les trimestres — ' +
            'inutile d\'en créer une par session.\n\n' +
            (coursEnEditionV2
                ? 'Donner quand même ce code à cette fiche ?'
                : 'Créer quand même une seconde fiche ?')
        );
        if (!quandMeme) {
            if (!creation) {
                const enBase = (db.getSync('cours', []) || []).find(c => c.id === coursEnEditionV2);
                if (enBase) setValue('v2-codeCours', enBase.codeCours || enBase.sigle || enBase.code || '');
            }
            return false;
        }
        doublonAssume = true;
    }

    // Refonte chantier C : persistance routée par CoursEntite (source unique du modèle
    // cours = description ministérielle pure, ID COURS_*). Édition = ID préservé
    // (coursEnEditionV2), champs legacy conservés par mettreAJour jusqu'au chantier D.
    // Lot E2 : le témoin commun parle après l'écriture de l'entité (ecrireEtAnnoncer).
    let coursSauve;
    try {
        coursSauve = await ecrireEtAnnoncer('cours', () => (creation
            ? CoursEntite.creer(d, { doublonAssume })
            : CoursEntite.mettreAJour(coursEnEditionV2, d, { doublonAssume })), { geste });
    } catch (e) { return false; }
    if (!coursSauve) {
        // La garde de l'entité a refusé alors qu'on venait de demander : état
        // incohérent, on le DIT plutôt que d'annoncer un succès.
        return _refuserCoursV2(creation
            ? 'Une fiche porte déjà ce code.'
            : 'La fiche a peut-être été supprimée depuis un autre onglet. Recharge la page.', geste);
    }
    if (creation) _activerSiPremierCours(coursSauve); else _resyncInfoCoursSiActif(coursSauve);
    _apresEcritureCoursV2(coursSauve, creation);
    return true;
}

/**
 * Ouvre la modal pour créer un nouveau cours
 */
function ouvrirModalNouveauCours() {
    afficherFormCoursV2();
}

// Exports — 18 fonctions migrées du bloc exports résidu L3177-3194.
window.chargerDropdownCoursV2 = chargerDropdownCoursV2;
window.changerCoursSelectionneV2 = changerCoursSelectionneV2;
window.viderAffichageCoursV2 = viderAffichageCoursV2;
window.afficherFormCoursV2 = afficherFormCoursV2;
window.nouveauCoursV2 = nouveauCoursV2;
window.supprimerCoursV2 = supprimerCoursV2;
window.activerCoursV2 = activerCoursV2;
window.modifierCoursSelectionneV2 = modifierCoursSelectionneV2;
window.dupliquerCoursSelectionneV2 = dupliquerCoursSelectionneV2;
window.fermerFicheCoursV2 = fermerFicheCoursV2;
window.choisirCoursV2 = choisirCoursV2;
window.sauvegarderCoursV2 = sauvegarderCoursV2;
window.sauvegarderChampCoursV2 = sauvegarderChampCoursV2;
window.changerPonderationCoursV2 = changerPonderationCoursV2;
window.changerNatureFicheCoursV2 = changerNatureFicheCoursV2;
window.rendreModeFicheCoursV2 = rendreModeFicheCoursV2;
window.afficherSyntheseCours = afficherSyntheseCours;
window.afficherSyntheseEnseignant = afficherSyntheseEnseignant;
window.afficherSyntheseGroupeEtudiants = afficherSyntheseGroupeEtudiants;
window.afficherSyntheseHoraire = afficherSyntheseHoraire;
window.afficherSyntheseGroupeCours = afficherSyntheseGroupeCours;
window.ouvrirModalNouveauCours = ouvrirModalNouveauCours;

// Helper partagé via window pour les autres sous-modules trimestre-v2-*
// (init.js, horaires.js) — sinon ReferenceError cross-IIFE.
// Régression silencieuse du refactor 17 mai 2026 corrigée 22 mai 2026.
window.setValue = setValue;

// Refonte chantier B : SSOT de dérivation de la période depuis le trimestre actif,
// partagé avec les autres modules (statistiques.js, etc.) qui ne doivent plus lire
// la période depuis l'objet cours.
window._deriverSessionAnneeTrimestreActif = _deriverSessionAnneeTrimestreActif;

// #442 — décision de fusion legacy→canonique, pure et exportée pour être
// testée directement (sentinelle `sentinelle-fusion-cours-442`). Vérifier
// l'EXPORT réel, pas la présence de l'appel (leçon du 10 août).
window._fusionnerListeCoursDansCours = _fusionnerListeCoursDansCours;

// #540 (26 août 2026) — EXPORT MANQUANT, trouvé en faisant le lot A.
// `index.html:6535` câble `data-on-input="proposerHeuresEnseignementDepuisPonderation"`,
// et le dispatcher de `main.js` résout ce nom SUR `window`. La fonction vivant dans
// l'IIFE et n'ayant jamais été exportée, le dispatcher ne trouvait rien : il émettait
// un `console.warn` et rendait la main. Conséquence observable depuis toujours — la
// proposition automatique des heures d'enseignement ne se déclenchait pas, et le repère
// « ≈ N unités » ne bougeait pas à la frappe (il n'apparaissait qu'à l'ouverture d'une
// fiche, appelé directement par `afficherFormCoursV2`).
// Famille connue du projet : [[feedback-exports-orphelins-grep-window]].
window.proposerHeuresEnseignementDepuisPonderation = proposerHeuresEnseignementDepuisPonderation;
window.normaliserPonderationCoursV2 = normaliserPonderationCoursV2;
// Cadrage « Rencontres » (12 sept. 2026) : `data-on-change` sur #v2-natureCours, résolu sur window par main.js.
window.changerNatureCoursV2 = changerNatureCoursV2;

// Helpers purs exportés pour être testés DIRECTEMENT par la sentinelle #540 —
// même raison que `_fusionnerListeCoursDansCours` : vérifier l'export réel, pas
// la présence de l'appel.
window._normaliserPonderation = _normaliserPonderation;

// #540 lot B — le repère des heures et sa source de semaines.
window.majRepereHeuresCours = majRepereHeuresCours;
window._semainesDuTrimestreActif = _semainesDuTrimestreActif;
window._parserPonderation = _parserPonderation;

})();
