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
        const texte = `${sigle} ${titre}`.trim();
        return texte || `Cours ${c.id || 'sans identifiant'}`;
    };

    select.innerHTML = '<option value="">Sélectionner un cours...</option>';

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
        console.warn('[Cours V2] Sélection non résolue :', coursId);
        notifications.erreur('Cours introuvable', 'La fiche sélectionnée n\'existe plus. La liste va se rafraîchir.');
        chargerDropdownCoursV2();
        changerCoursSelectionneV2(null); // rejoue la branche « état vide » ci-dessus
        return;
    }

    if (coursSelectionne) {
        // Afficher le formulaire en mode édition
        coursEnEditionV2 = coursId;
        _afficherBandeauEdition(coursSelectionne.codeCours || coursSelectionne.sigle || coursSelectionne.code);
        _mettreAJourBoutonActiverCours(coursId);
        if (etatVide) etatVide.classList.add('u-hide');
        if (formulaire) formulaire.classList.remove('u-hide');
        if (btnSupprimer) btnSupprimer.classList.remove('u-hide');

        // Mettre à jour le titre
        const titre = document.getElementById('v2-titreFormCours');
        const btnTexte = document.getElementById('v2-btnTexteCours');
        if (titre) titre.textContent = 'Modifier le cours';
        if (btnTexte) btnTexte.textContent = 'Enregistrer';

        // Remplir le formulaire
        remplirFormCoursV2(coursSelectionne);
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

    const nomCours = coursObj.codeCours || coursObj.sigle || coursObj.code || coursObj.id;
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

/**
 * Affiche les détails d'un cours (aperçu)
 * 🆕 BETA 95.2 : Simplifié - affiche uniquement les informations du cours
 * (Enseignant, Horaire, Session sont dans leurs sections respectives)
 */
function afficherDetailsCoursV2(cours) {
    const conteneur = document.getElementById('v2-apercuCours');
    if (!conteneur) return;

    // Normaliser le sigle (codeCours, sigle, code ou numero)
    // 🆕 FIX (4 fév 2026) : Priorité codeCours, ajouter code pour Primo
    const sigle = cours.codeCours || cours.sigle || cours.code || cours.numero || '—';

    // Normaliser le nom du cours
    const nomCours = cours.titre || cours.nomCours || '—';

    // Discipline
    const discipline = cours.discipline || '—';

    // Compétence
    const competence = cours.competence || '—';
    const numeroCompetence = cours.numeroCompetence || '';

    // Éléments de compétence (afficher seulement si présents)
    const elementsCompetence = cours.elementsCompetence || '';

    conteneur.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
            <div>
                <label class="text-muted">Code du cours</label>
                <div style="font-weight: 600; font-size: 1.1rem; color: var(--accent-primaire);">${sigle}</div>
            </div>
            <div>
                <label class="text-muted">Nom du cours</label>
                <div style="font-weight: 600;">${nomCours}</div>
            </div>
            <div>
                <label class="text-muted">Discipline</label>
                <div>${discipline}</div>
            </div>
            <div>
                <label class="text-muted">Compétence${numeroCompetence ? ` (${numeroCompetence})` : ''}</label>
                <div>${competence}</div>
            </div>
        </div>
        ${elementsCompetence ? `
        <div style="margin-top: 15px;">
            <label class="text-muted">Éléments de compétence</label>
            <div style="font-size: 0.9rem; white-space: pre-line;">${elementsCompetence}</div>
        </div>
        ` : ''}
    `;
}

// Variable pour stocker l'ID du cours en édition
let coursEnEditionV2 = null;

function _afficherBandeauEdition(codeCours) {
    const bandeau = document.getElementById('v2-bandeauModeEdition');
    const codeSpan = document.getElementById('v2-bandeauCodeCours');
    if (codeSpan) codeSpan.textContent = codeCours || '(sans code)';
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

    notifications.succes('Cours activé', cible.codeCours || cible.nomCours || cible.id);

    _mettreAJourBoutonActiverCours(coursEnEditionV2);
    if (typeof chargerDropdownCoursV2 === 'function') chargerDropdownCoursV2();
    if (typeof window.peuplerDropdownGroupeCoursActif === 'function') {
        window.peuplerDropdownGroupeCoursActif();
    }
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
    coursEnEditionV2 = null;
    _cacherBandeauEdition();
    _mettreAJourBoutonActiverCours(null);

    const etatVide = document.getElementById('cours-etat-vide');
    const formulaire = document.getElementById('cours-formulaire-edition');
    const titre = document.getElementById('v2-titreFormCours');
    const btnTexte = document.getElementById('v2-btnTexteCours');
    const selectCours = document.getElementById('v2-selectCours');

    // Désélectionner dans le dropdown
    if (selectCours) selectCours.value = '';

    // Afficher le formulaire
    if (etatVide) etatVide.classList.add('u-hide');
    if (formulaire) formulaire.classList.remove('u-hide');
    if (titre) titre.textContent = 'Nouveau cours';
    // #306 Lot 1 : libellé canonique « Créer » en création (« Enregistrer » en édition)
    if (btnTexte) btnTexte.textContent = 'Créer';

    // Réinitialiser tous les champs
    reinitialiserFormCoursV2();

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
    _afficherBandeauEdition(coursSelectionne.codeCours || coursSelectionne.sigle || coursSelectionne.code);
    _mettreAJourBoutonActiverCours(coursId);

    const formulaire = document.getElementById('v2-formulaireCours');
    const apercu = document.getElementById('v2-apercuCours');
    const titre = document.getElementById('v2-titreFormCours');
    const btnTexte = document.getElementById('v2-btnTexteCours');

    if (formulaire) {
        formulaire.classList.remove('u-hide');
        if (apercu) apercu.classList.add('u-hide');
        if (titre) titre.textContent = 'Modifier le cours';
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
    const titre = document.getElementById('v2-titreFormCours');
    const btnTexte = document.getElementById('v2-btnTexteCours');

    if (formulaire) {
        formulaire.classList.remove('u-hide');
        if (apercu) apercu.classList.add('u-hide');
        if (titre) titre.textContent = 'Dupliquer le cours';
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
    setValue('v2-codeCours', cours.codeCours || cours.sigle || cours.code || '');
    setValue('v2-nomCours', cours.titre || cours.nomCours || '');
    setValue('v2-numeroCompetence', cours.numeroCompetence || '');
    setValue('v2-competence', cours.competence || '');
    setValue('v2-disciplineCours', cours.discipline || '');
    setValue('v2-elementsCompetence', cours.elementsCompetence || '');
    setValue('v2-heuresEnseignement', (cours.heuresContact === 0 || cours.heuresContact) ? cours.heuresContact : '');
    setValue('v2-ponderation', cours.ponderation || '');
    majRepereUnitesCours();
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
 * Tolérant : retourne null si le format n'est pas reconnu (3 nombres séparés
 * par tirets). La saisie reste libre — aucun blocage.
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
 * Handler live (data-on-input sur #v2-ponderation) : propose les heures d'enseignement
 * dérivées de la pondération — (théorie + labo) × 15 semaines — SANS écraser une
 * valeur déjà saisie manuellement (les heures d'enseignement restent la source de vérité).
 * Met aussi à jour le repère d'unités.
 */
function proposerHeuresEnseignementDepuisPonderation() {
    const champHeures = document.getElementById('v2-heuresEnseignement');
    const pond = _parserPonderation(document.getElementById('v2-ponderation')?.value);
    if (champHeures && pond && (champHeures.value === '' || champHeures.value === undefined)) {
        // Proposition seulement : ne remplit que si le champ est vide.
        champHeures.value = (pond.theorie + pond.labo) * 15;
    }
    majRepereUnitesCours();
}

/**
 * Affiche la synthèse du cours dans la sidebar (Beta 95.3)
 * Synthèse concise: nom, discipline, compétence
 */
function afficherSyntheseCours(cours) {
    const sidebar = document.getElementById('v2-apercuCoursSidebar');
    if (!sidebar) return;

    if (!cours) {
        sidebar.innerHTML = '<p class="etat-vide-resume">Aucun cours sélectionné</p>';
        return;
    }

    // 🆕 FIX (4 fév 2026) : Priorité codeCours
    const code = cours.codeCours || cours.sigle || cours.code || '';
    const nom = cours.nomCours || cours.titre || cours.nom || '';
    const discipline = cours.discipline || '—';
    const competence = cours.numeroCompetence || cours.competence || '—';

    const infoCours = db.getSync('infoCours', null);
    const estActif = infoCours && infoCours.id === cours.id;
    const badgeActif = estActif ? '<div class="apercu-badge-actif">Cours actif</div>' : '';

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
        <div class="apercu-titre">${horaire.nom || 'Horaire'}</div>
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
    const titre = codeCours ? `${codeCours} — Groupe ${groupe}` : `Groupe ${groupe}`;

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
    majRepereUnitesCours();
}

/**
 * Utilitaire pour définir la valeur d'un champ
 */
function setValue(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value;
}

/**
 * Annule le formulaire et revient à l'aperçu
 */
function annulerFormCoursV2() {
    coursEnEditionV2 = null;
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
        codeCours: document.getElementById('v2-codeCours')?.value?.trim(),
        nomCours: document.getElementById('v2-nomCours')?.value?.trim(),
        discipline: document.getElementById('v2-disciplineCours')?.value?.trim(),
        numeroCompetence: document.getElementById('v2-numeroCompetence')?.value?.trim() || '',
        competence: document.getElementById('v2-competence')?.value?.trim() || '',
        elementsCompetence: document.getElementById('v2-elementsCompetence')?.value?.trim() || '',
        // Heures d'enseignement = source de vérité de la conformité RREC (chantier A).
        // Vide → null (cours sans exigence saisie), sinon nombre.
        heuresContact: (heuresBrut === '' || heuresBrut === undefined) ? null : (parseFloat(heuresBrut) || null),
        ponderation: document.getElementById('v2-ponderation')?.value?.trim() || ''
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

function _postSauvegardeCoursV2(cours) {
    notifications.succes(coursEnEditionV2 ? 'Cours modifié avec succès' : 'Cours créé avec succès');
    annulerFormCoursV2();
    chargerDropdownCoursV2();
    const selectCours = document.getElementById('v2-selectCours');
    if (selectCours) {
        selectCours.value = cours.id;
        changerCoursSelectionneV2(cours.id);
    }
    if (typeof window.populerDropdownsAssemblageV2 === 'function') {
        window.populerDropdownsAssemblageV2();
    }
}

async function sauvegarderCoursV2() {
    const d = _lireDonneesFormCoursV2();

    if (!d.codeCours) {
        alert('Veuillez renseigner le code du cours.');
        return;
    }
    if (!d.discipline) {
        alert('Veuillez renseigner la discipline.');
        return;
    }

    // #455 : le cours est GLOBAL — une fiche par code, servie à tous les
    // trimestres. Une seconde fiche au même code fabriquerait deux « 601-101 »
    // dont les groupes-cours ne se verraient pas (famille #346/#154).
    // Le geste reste possible (confirm), jamais silencieux.
    //
    // CT-15 (23 août 2026) : la DÉTECTION est passée à `CoursEntite`, qui la
    // refait de son côté au point d'écriture. Ici on ne fait plus que PARLER à
    // Grégoire — et son oui est reporté à l'entité par `doublonAssume`.
    // Deux détections, une seule règle : celle de `cleNaturelleCours`.
    //
    // ⚠ L'ÉDITION EST GARDÉE ELLE AUSSI. Renommer le code d'une fiche pour lui
    // donner celui d'une autre fabrique exactement le doublon que la création
    // refuse, par un chemin que personne ne surveillait avant CT-15.
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
        if (!quandMeme) return;
        doublonAssume = true;
    }

    // Refonte chantier C : persistance routée par CoursEntite (source unique du modèle
    // cours = description ministérielle pure, ID COURS_*). Plus de fabrication d'objet
    // gras ni d'ID embarquant la période. Édition = ID préservé (coursEnEditionV2),
    // champs legacy conservés par mettreAJour jusqu'au chantier D.
    let coursSauve;
    if (coursEnEditionV2) {
        coursSauve = await CoursEntite.mettreAJour(coursEnEditionV2, d, { doublonAssume });
        if (!coursSauve) {
            alert('Cours introuvable pour la mise à jour.');
            return;
        }
        _resyncInfoCoursSiActif(coursSauve);
    } else {
        coursSauve = await CoursEntite.creer(d, { doublonAssume });
        if (!coursSauve) {
            // La garde de l'entité a refusé alors qu'on venait de demander :
            // état incohérent, on le DIT plutôt que d'annoncer un succès.
            alert('Création refusée : une fiche porte déjà ce code.');
            return;
        }
        _activerSiPremierCours(coursSauve);
    }

    _postSauvegardeCoursV2(coursSauve);
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
window.afficherDetailsCoursV2 = afficherDetailsCoursV2;
window.afficherFormCoursV2 = afficherFormCoursV2;
window.nouveauCoursV2 = nouveauCoursV2;
window.supprimerCoursV2 = supprimerCoursV2;
window.activerCoursV2 = activerCoursV2;
window.modifierCoursSelectionneV2 = modifierCoursSelectionneV2;
window.dupliquerCoursSelectionneV2 = dupliquerCoursSelectionneV2;
window.annulerFormCoursV2 = annulerFormCoursV2;
window.sauvegarderCoursV2 = sauvegarderCoursV2;
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

})();
