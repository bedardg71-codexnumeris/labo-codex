/* ===============================
   MODULE: TRIMESTRE V2 — INIT
   Refactor étape 3 session A (17 mai 2026) : extrait depuis trimestre-v2.js
   lignes 34-401 + 486-948 (zone 1 MODULES-MAP §2.4 sauf
   `afficherStatistiquesTrimestreV2` qui reste au résidu comme helper
   transversal).

   Périmètre : init + identification + cadre calendrier + journées sans
   cours (fusion #374 du 5 août 2026 : un seul jeu de fonctions événements,
   variable module-scope `evenementEnEditionV2`).

   Dépendances cross-module accédées via `window.X` (résidu chargé AVANT) :
   - `window.chargerDropdownCoursV2` (zone 3)
   - `window.chargerGroupeCoursV2` (zone 6)
   - `window.chargerListeEtudiantsV2` (zone 4)
   - `window.afficherStatistiquesTrimestreV2` (zone 1 mais resté résidu)
   =============================== */

(function() {
'use strict';

/* ===============================
   INITIALISATION
   =============================== */

/**
 * Initialise l'onglet Trimestre v2
 * Appelé au chargement de la page
 */
function initialiserTrimestreV2() {

    // Charger l'identification du trimestre (nom, session, année)
    chargerIdentificationTrimestreV2();

    // Charger le cadre calendrier dans les nouveaux champs
    chargerCadreCalendrierV2();

    // Charger les événements (prévus et imprévus)
    chargerJourneesSansCoursV2();

    // Charger la liste des cours dans le dropdown
    window.chargerDropdownCoursV2();

    // Charger le profil enseignant (Beta 95.2) — extrait dans trimestre-v2-enseignants.js (session A, 17 mai 2026)
    if (typeof window.chargerProfilEnseignantV2 === 'function') {
        window.chargerProfilEnseignantV2();
    }

    // Charger les séances dans l'accordéon Horaire — extrait dans trimestre-v2-horaires.js (session A, 17 mai 2026)
    if (typeof window.chargerSeancesV2 === 'function') {
        window.chargerSeancesV2();
    }

    // Charger les horaires (Beta 95.2) — extrait dans trimestre-v2-horaires.js (session A, 17 mai 2026)
    if (typeof window.chargerHorairesV2 === 'function') {
        window.chargerHorairesV2();
    }

    // Charger les groupe-cours (Beta 95.2)
    window.chargerGroupeCoursV2();

    // Charger la liste des étudiants dans l'accordéon Groupes
    window.chargerListeEtudiantsV2();

    // Populer le dropdown trimestre et afficher le formulaire — extrait dans trimestre-v2-liste.js (session A, 17 mai 2026)
    if (typeof window.populerDropdownTrimestreV2 === 'function') {
        window.populerDropdownTrimestreV2();
    }
    if (typeof window.afficherFormulaireTrimestreActif === 'function') {
        window.afficherFormulaireTrimestreActif();
    }

    // Restaurer l'état des accordéons (ouvert/fermé) depuis localStorage
    if (typeof restaurerEtatAccordeons === 'function') {
        restaurerEtatAccordeons();
    }

}

// #763 (6 sept. 2026) — LE CADRE RELIT LE STOCKAGE À CHAQUE AFFICHAGE.
// navigation.js appelle `initialiserModuleTrimestre()` quand la sous-section
// `calendrier-trimestre` s'affiche ; ce nom n'existait plus depuis le retrait du
// code mort de trimestre.js (5ccb3063, 22 mai 2026), et `typeof … === 'function'`
// le taisait : le formulaire du groupe-cours ne reflétait que l'état du stockage
// AU CHARGEMENT de la page. Une pratique appliquée dans Conception › Pratiques
// (#762) n'y apparaissait pas avant un rechargement — demande de Grégoire,
// 6 sept., deux captures : champ 6 encore « À compléter » après l'application.
// Les modules ne se parlent pas directement : c'est le Cadre qui relit le stockage
// quand il s'affiche, derrière le même portillon qu'au chargement (base prête).
window.initialiserModuleTrimestre = function () {
    if (typeof window.auDbPret === 'function') {
        window.auDbPret(function () { initialiserTrimestreV2(); });
    } else {
        initialiserTrimestreV2();
    }
};

/* ===============================
   IDENTIFICATION DU TRIMESTRE
   =============================== */

/**
 * Charge l'identification du trimestre actif dans les champs v2-
 */
function chargerIdentificationTrimestreV2() {
    // #975 : relire la fiche depuis le stock quitte la création demandée.
    _creationDemandee = false;
    const trimestre = typeof obtenirTrimestreActif === 'function' ? obtenirTrimestreActif() : null;

    const elemNom = document.getElementById('v2-nomTrimestre');
    const elemSession = document.getElementById('v2-sessionTrimestre');
    const elemAnnee = document.getElementById('v2-anneeTrimestre');

    if (trimestre) {
        if (elemNom) elemNom.value = trimestre.nom || '';
        if (elemSession) {
            // Convertir session : H → hiver, A → automne, E → ete
            const sessionMap = { 'H': 'hiver', 'A': 'automne', 'E': 'ete' };
            elemSession.value = sessionMap[trimestre.session] || '';
        }
        if (elemAnnee) elemAnnee.value = trimestre.annee || '';
    } else {
        // Pas de trimestre actif, vider les champs
        if (elemNom) elemNom.value = '';
        if (elemSession) elemSession.value = '';
        if (elemAnnee) elemAnnee.value = '';
    }
    rendreModeFicheTrimestreV2(!trimestre);
}

/**
 * Lot E2 (D3) — un trimestre existant s'enregistre tout seul, champ par champ : la carte
 * n'a plus de bouton. Sans trimestre actif, la fiche CRÉE : « Créer le trimestre » paraît,
 * et rien n'est écrit avant ce clic.
 * @param {boolean} enCreation
 */
function rendreModeFicheTrimestreV2(enCreation) {
    const btn = document.getElementById('v2-btnCreerTrimestre');
    if (btn && btn.classList) btn.classList[enCreation ? 'remove' : 'add']('u-hide');
    // #975 suite (décision de Grégoire, 7 oct. 2026) : « Annuler » seulement s'il y a un trimestre
    // actif à retrouver ; au premier trimestre d'un poste vierge, il n'y a rien à retrouver.
    const annuler = document.getElementById('v2-btnAnnulerCreationTrimestre');
    const avecActif = enCreation && !!_trimestreActifDuRegistre();
    if (annuler && annuler.classList) annuler.classList[avecActif ? 'remove' : 'add']('u-hide');
}

/**
 * #975 (7 oct. 2026) — « + Nouveau trimestre » ouvre CETTE fiche en création, même quand un
 * trimestre est actif : plus de `prompt` ni d'`alert`, le geste est « Créer le trimestre »
 * (lot E2). Tant que la création est demandée, les champs n'écrivent rien dans le trimestre
 * actif ; rien n'est écrit avant le clic. Relire la fiche (bascule, retour au Cadre) la quitte.
 *
 * ⛔ PAS DE QUESTION DE SORTIE DANS L'APPLICATION pour cette fiche (décision de Grégoire,
 * 7 oct. 2026, 9 h 38 : « on s'en passe ») : quitter le Cadre pendant une création perd la
 * saisie, et c'est accepté. Ne pas brancher cette fiche sur `quitterCreationSiConfirme` (ui-dialogues.js).
 * Seule reste la question native du navigateur au rechargement (`declarerFicheEnCreation`,
 * plus bas). Pour quitter sans créer : « Annuler » (`annulerCreationTrimestreV2`).
 */
let _creationDemandee = false;

/** #975 : la fiche crée (aucun trimestre actif, ou « + Nouveau trimestre » demandé). */
function _ficheEnCreation() {
    return _creationDemandee || !_trimestreActifDuRegistre();
}

/** #975 : « + Nouveau trimestre » — la fiche d'identification, vide, en création. */
function ouvrirCreationTrimestreV2() {
    ['v2-nomTrimestre', 'v2-sessionTrimestre', 'v2-anneeTrimestre', 'v2-debutTrimestre',
        'v2-finCours', 'v2-finTrimestre', 'v2-remiseNotes', 'v2-semainePlanificationDebut',
        'v2-semainePlanificationFin', 'v2-semaineExamensDebut', 'v2-semaineExamensFin'].forEach(function(id) {
        const champ = document.getElementById(id);
        if (champ) champ.value = '';
    });
    _creationDemandee = true;
    rendreModeFicheTrimestreV2(true);
    const session = document.getElementById('v2-sessionTrimestre');
    if (session && typeof session.focus === 'function') session.focus();
}

/**
 * #975 suite — « Annuler » : quitte la création demandée sans rien écrire ; la fiche du
 * trimestre actif revient (identification et dates), « Créer le trimestre » disparaît.
 */
function annulerCreationTrimestreV2() {
    if (!_creationDemandee) return false;
    chargerIdentificationTrimestreV2();   // remet _creationDemandee à false, rend le mode fiche
    chargerCadreCalendrierV2();           // les dates vidées par ouvrirCreationTrimestreV2
    return true;
}

/** Lot E2 : le trimestre actif du registre, ou null (lecture synchrone du stock). */
function _trimestreActifDuRegistre() {
    // Une COPIE : le registre lu peut être l'objet du cache de `db` ; le modifier avant une
    // écriture qui échoue le laisserait faux en mémoire.
    const trimestres = JSON.parse(JSON.stringify(db.getSync('trimestres', []) || []));
    return trimestres.find(t => t && t.actif === true) || null;
}

/** Lot E2 : « la fiche est en création et porte une saisie » (ui-dialogues.js, rechargement). */
function trimestreEnCreationSaisi() {
    if (!_ficheEnCreation()) return false;
    const valeur = (id) => (document.getElementById(id)?.value || '').trim();
    return ['v2-nomTrimestre', 'v2-sessionTrimestre', 'v2-anneeTrimestre', 'v2-debutTrimestre',
        'v2-finCours', 'v2-finTrimestre'].some(id => valeur(id));
}
if (window.uiDialogues) window.uiDialogues.declarerFicheEnCreation('trimestre', trimestreEnCreationSaisi);

/**
 * #379 — Détecte si un trimestre possède des données namespacées.
 * Énumère les DEUX couches du stockage hybride (localStorage ET memoryCache) :
 * une clé peut vivre en memoryCache/IndexedDB seulement après une bascule
 * silencieuse sur quota (leçon du 5 août 2026, cf. migrerJourneesSansCours).
 * @param {string} trimestreId - id du trimestre (ex. 'h2026')
 * @returns {boolean} true si au moins une clé `<id>_…` existe
 */
function _trimestreADesDonnees(trimestreId) {
    var prefixe = trimestreId + '_';
    try {
        for (var i = 0; i < localStorage.length; i++) {
            var k = localStorage.key(i);
            if (k && k.indexOf(prefixe) === 0) return true;
        }
    } catch (e) { /* énumération best-effort */ }
    try {
        if (typeof db !== 'undefined' && db.memoryCache && typeof db.memoryCache.keys === 'function') {
            for (var cleCache of db.memoryCache.keys()) {
                if (cleCache && cleCache.indexOf(prefixe) === 0) return true;
            }
        }
    } catch (e2) { /* idem */ }
    return false;
}

const GESTE_IDENTIFICATION = 'Identification du trimestre';
const SESSIONS_CODES = { 'hiver': 'H', 'automne': 'A', 'ete': 'E' };

/**
 * Lot E2 (D3, décisions techniques de Cowork du 28 sept.) — lit l'identification saisie.
 * Rend null tant qu'elle n'est pas COMPLÈTE ET VALIDE : un état intermédiaire (session
 * changée, année pas encore) n'est ni une erreur ni une écriture.
 */
function _identificationSaisieV2() {
    const nom = document.getElementById('v2-nomTrimestre')?.value?.trim() || '';
    const session = document.getElementById('v2-sessionTrimestre')?.value || '';
    const annee = String(document.getElementById('v2-anneeTrimestre')?.value || '').trim();
    if (!SESSIONS_CODES[session] || !/^\d{4}$/.test(annee)) return null;
    const sessionCode = SESSIONS_CODES[session];
    return {
        id: `${sessionCode.toLowerCase()}${annee}`,
        nom: nom || `${session.charAt(0).toUpperCase() + session.slice(1)} ${annee}`,
        session: sessionCode,
        annee: parseInt(annee, 10)
    };
}

/** Lot E2 : un refus d'identification, par le témoin commun ; les champs reviennent au stock. */
function _refuserIdentificationV2(phrase, geste) {
    if (window.temoinEnregistrement) {
        const raison = typeof window.raisonPourTemoin === 'function' ? window.raisonPourTemoin(phrase) : phrase;
        window.temoinEnregistrement.nonEnregistre(raison, geste || GESTE_IDENTIFICATION, 'trimestres');
    }
    // #975 : relire la fiche quitterait la création demandée, et perdrait la saisie.
    if (!_creationDemandee) chargerIdentificationTrimestreV2();
    return false;
}

function _rafraichirListesTrimestresV2() {
    // Rafraîchir le dropdown trimestre
    if (typeof window.populerDropdownTrimestreV2 === 'function') {
        window.populerDropdownTrimestreV2();
    }
}

/**
 * Lot E2 (D3) — le NOM du trimestre actif s'enregistre au changement du champ, seul :
 * il ne touche ni l'id ni le préfixe des clés. Vide : le nom généré (« Automne 2026 »),
 * comme avant. Sans trimestre actif, rien : c'est « Créer le trimestre » qui écrit.
 */
function sauvegarderNomTrimestreV2() {
    if (_ficheEnCreation()) return false;
    const actif = _trimestreActifDuRegistre();
    const champ = document.getElementById('v2-nomTrimestre');
    let nom = champ?.value?.trim() || '';
    if (!nom) {
        const libelles = { H: 'Hiver', A: 'Automne', E: 'Été' };
        nom = `${libelles[actif.session] || ''} ${actif.annee || ''}`.trim();
        if (champ) champ.value = nom;
    }
    if (actif.nom === nom) return true;
    // Une COPIE : le registre lu peut être l'objet du cache de `db` ; le modifier avant une
    // écriture qui échoue le laisserait faux en mémoire.
    const trimestres = JSON.parse(JSON.stringify(db.getSync('trimestres', []) || []));
    const index = trimestres.findIndex(t => t && t.actif === true);
    trimestres[index].nom = nom;
    if (!sauvegarderDonneesSelonMode('trimestres', trimestres, { geste: GESTE_IDENTIFICATION })) return false;
    _rafraichirListesTrimestresV2();
    return true;
}

/**
 * Lot E2 (D3) — la SESSION et l'ANNÉE du trimestre actif s'écrivent ENSEMBLE, au
 * changement de l'un ou l'autre champ, et seulement quand les deux sont valides.
 *
 * ⚠ Elles fixent l'id du trimestre, donc le préfixe de TOUTES ses clés (#379). L'écriture
 * par champ avait été retirée pour cette raison (#306 lot 2) ; elle revient derrière les
 * mêmes gardes, inchangées : la collision, et « Changement bloqué » quand des données vivent
 * sous l'ancien préfixe. AUCUNE migration de clés : un refus remet les champs au stock et
 * le dit par le témoin (« Non enregistré – Identification du trimestre : … »), sans succès.
 * Sans trimestre actif, rien : c'est « Créer le trimestre » qui écrit.
 * @returns {boolean} true si l'identification en base est celle des champs
 */
function sauvegarderIdentificationTrimestreV2() {
    if (_ficheEnCreation()) return false;
    const actif = _trimestreActifDuRegistre();
    const saisie = _identificationSaisieV2();
    if (!saisie) return false;                         // état intermédiaire : ni écriture, ni erreur
    if (saisie.id === actif.id) return true;           // rien ne change (le nom a son propre champ)

    // Une COPIE : le registre lu peut être l'objet du cache de `db` ; le modifier avant une
    // écriture qui échoue le laisserait faux en mémoire.
    const trimestres = JSON.parse(JSON.stringify(db.getSync('trimestres', []) || []));
    const index = trimestres.findIndex(t => t && t.actif === true);
    const ancienId = trimestres[index].id;
    // #379 — deux gardes, inchangées ; leurs phrases sont reprises telles quelles.
    // 1. Collision : l'id cible appartient déjà à un AUTRE trimestre du registre.
    if (trimestres.some(function(t, i) { return i !== index && t.id === saisie.id; })) {
        return _refuserIdentificationV2('Le trimestre « ' + saisie.id + ' » existe déjà dans le registre. Pour y travailler, active-le depuis la bibliothèque des trimestres au lieu de renommer celui-ci.');
    }
    // 2. Orphelinage : des données vivent sous l'ancien préfixe.
    if (_trimestreADesDonnees(ancienId)) {
        return _refuserIdentificationV2('Ce trimestre (« ' + ancienId + ' ») contient des données : changer sa session ou son année les rendrait invisibles. Crée plutôt un nouveau trimestre pour la nouvelle session.');
    }

    trimestres[index].id = saisie.id;
    trimestres[index].session = saisie.session;
    trimestres[index].annee = saisie.annee;
    if (!sauvegarderDonneesSelonMode('trimestres', trimestres, { geste: GESTE_IDENTIFICATION })) {
        chargerIdentificationTrimestreV2();
        return false;
    }
    // Synchroniser les miroirs window.trimestreActif + clé storage
    window.trimestreActif = saisie.id;
    db.setSync('trimestreActif', saisie.id);
    _rafraichirListesTrimestresV2();
    return true;
}

/**
 * Lot E2 (D3) — « Créer le trimestre » : le seul geste qui crée, quand aucun trimestre
 * n'est actif. Rien n'est écrit avant ce clic. L'identification d'abord (elle fixe l'id),
 * PUIS le cadre, sous l'id en vigueur après elle — jamais sous un id intermédiaire.
 */
function creerTrimestreV2() {
    const geste = 'Créer le trimestre';
    if (!_ficheEnCreation()) return false;
    const ancienActif = _trimestreActifDuRegistre();
    const saisie = _identificationSaisieV2();
    if (!saisie) {
        return _refuserIdentificationV2('Choisis la session et l\'année du trimestre ; elles déterminent où ses données sont rangées.', geste);
    }
    // Une COPIE : le registre lu peut être l'objet du cache de `db` ; le modifier avant une
    // écriture qui échoue le laisserait faux en mémoire.
    const trimestres = JSON.parse(JSON.stringify(db.getSync('trimestres', []) || []));
    // #379 — même garde de collision à la création : jamais de doublon d'id dans le registre.
    if (trimestres.some(function(t) { return t.id === saisie.id; })) {
        return _refuserIdentificationV2('Le trimestre « ' + saisie.id + ' » existe déjà ; active-le depuis la bibliothèque des trimestres.', geste);
    }
    trimestres.forEach(t => t.actif = false);
    trimestres.push({
        id: saisie.id,
        nom: saisie.nom,
        session: saisie.session,
        annee: saisie.annee,
        dateCreation: new Date().toISOString().split('T')[0],
        actif: true
    });
    if (!sauvegarderDonneesSelonMode('trimestres', trimestres, { geste })) return false;
    _creationDemandee = false;
    window.trimestreActif = saisie.id;
    db.setSync('trimestreActif', saisie.id);
    // Le cadre, sous l'id qui vient d'être posé (cle() le lit dans trimestreActif).
    sauvegarderCadreCalendrierV2({ discret: true });
    const champNom = document.getElementById('v2-nomTrimestre');
    if (champNom) champNom.value = saisie.nom;
    rendreModeFicheTrimestreV2(false);
    _rafraichirListesTrimestresV2();
    // #975 : un trimestre était actif — le chemin complet de la bascule (#466/CT-05), pour que
    // rien du trimestre quitté ne survive (groupe-cours, éditeurs, miroirs, vues).
    if (ancienActif && typeof window.changerTrimestreActifV2 === 'function') {
        window.changerTrimestreActifV2(saisie.id);
    }
    notifications.succes(`Trimestre «\u00a0${saisie.nom}\u00a0» créé.`);
    return true;
}

/* ===============================
   CADRE CALENDRIER
   =============================== */

/**
 * Charge les données du cadre calendrier dans les champs v2-
 */
function chargerCadreCalendrierV2() {
    const cadre = db.getSync(cle('cadreCalendrier'), null);

    // Mapping des IDs v2 vers les clés du cadre
    const champs = {
        'v2-debutTrimestre': 'dateDebut',
        'v2-finCours': 'finCours',
        'v2-finTrimestre': 'finTrimestre',
        'v2-remiseNotes': 'remiseNotes',
        'v2-semainePlanificationDebut': 'semainePlanificationDebut',
        'v2-semainePlanificationFin': 'semainePlanificationFin',
        'v2-semaineExamensDebut': 'semaineExamensDebut',
        'v2-semaineExamensFin': 'semaineExamensFin'
    };

    // Remplir ou vider les champs selon que le cadre existe ou non
    for (const [idElement, cleCadre] of Object.entries(champs)) {
        const element = document.getElementById(idElement);
        if (element) {
            element.value = (cadre && cadre[cleCadre]) ? cadre[cleCadre] : '';
        }
    }

    // Si pas de cadre, réinitialiser les statistiques et sortir
    if (!cadre) {
        const elemSemaines = document.getElementById('v2-nombreSemaines');
        const elemJours = document.getElementById('v2-nombreJoursCours');
        const elemStats = document.getElementById('v2-statsCongesReprises');
        if (elemSemaines) elemSemaines.textContent = '0';
        if (elemJours) elemJours.textContent = '0';
        if (elemStats) elemStats.textContent = '';
        return;
    }

    // Vérifier si le calendrier existe et correspond aux bornes actuelles
    const calendrier = db.getSync(cle('calendrierComplet'), null);
    const doitRegenerer = !calendrier ||
        (calendrier && cadre.dateDebut && !calendrier[cadre.dateDebut]) ||
        (calendrier && cadre.finTrimestre && !calendrier[cadre.finTrimestre]);

    if (doitRegenerer && cadre.dateDebut && cadre.finCours && cadre.finTrimestre) {
        if (typeof genererCalendrierComplet === 'function') {
            genererCalendrierComplet();
        }
    }

    // Mettre à jour les statistiques après un court délai
    setTimeout(() => {
        window.afficherStatistiquesTrimestreV2();
    }, 100);
}

/**
 * Lot E2 (D3) — le cadre calendaire s'enregistre tout seul, au changement de chaque date ;
 * le bouton « Enregistrer » de la carte est retiré. Le témoin commun le dit.
 *
 * Les trois dates obligatoires (#215 : début, fin des cours, fin du trimestre) ne bloquent
 * plus l'écriture : champ par champ, la première date saisie serait sinon perdue en quittant.
 * Tant qu'il en manque une, le calendrier généré est RETIRÉ (même règle que
 * « Réinitialiser les bornes », #390 B5 : ne pas fabriquer un calendrier sur des bornes
 * vides) ; l'avertissement de cohérence de la carte (#369) le montre. Complet, le
 * calendrier est régénéré.
 * Sans trimestre actif, rien : c'est « Créer le trimestre » qui écrit.
 * @param {{discret?: boolean}} [options] - `discret` : écriture faite par un autre geste
 * @returns {boolean} true si le cadre a été écrit
 */
function sauvegarderCadreCalendrierV2(options) {
    if (_ficheEnCreation()) return false;
    const cadre = {
        dateDebut: document.getElementById('v2-debutTrimestre')?.value || '',
        finCours: document.getElementById('v2-finCours')?.value || '',
        finTrimestre: document.getElementById('v2-finTrimestre')?.value || '',
        remiseNotes: document.getElementById('v2-remiseNotes')?.value || '',
        semainePlanificationDebut: document.getElementById('v2-semainePlanificationDebut')?.value || '',
        semainePlanificationFin: document.getElementById('v2-semainePlanificationFin')?.value || '',
        semaineExamensDebut: document.getElementById('v2-semaineExamensDebut')?.value || '',
        semaineExamensFin: document.getElementById('v2-semaineExamensFin')?.value || ''
    };
    const discret = !!(options && options.discret);
    if (!sauvegarderDonneesSelonMode('cadreCalendrier', cadre, { geste: 'Modifier le cadre du trimestre', discret })) return false;

    if (cadre.dateDebut && cadre.finCours && cadre.finTrimestre) {
        if (typeof genererCalendrierComplet === 'function') {
            genererCalendrierComplet();
        } else {
            console.warn('[Trimestre V2] Fonction genererCalendrierComplet non disponible');
        }
    } else {
        db.removeSync(cle('calendrierComplet'));
    }

    // Rafraîchir la vue calendaire si visible (sinon stale jusqu'au prochain changement d'onglet)
    if (typeof afficherCalendrierScolaire === 'function') {
        afficherCalendrierScolaire();
    }
    // Mettre à jour les statistiques après un délai pour laisser le temps à la synchronisation
    setTimeout(() => {
        window.afficherStatistiquesTrimestreV2();
    }, 300);
    return true;
}

/**
 * Réinitialise les bornes du trimestre aux valeurs vides
 */
function reinitialiserBornesTrimestreV2() {
    if (!confirm('Veux-tu vraiment réinitialiser les bornes du trimestre ?')) {
        return;
    }

    // Vider les champs de bornes
    const champs = [
        'v2-debutTrimestre',
        'v2-finCours',
        'v2-finTrimestre',
        'v2-remiseNotes'
    ];

    champs.forEach(id => {
        const elem = document.getElementById(id);
        if (elem) elem.value = '';
    });

    // Mettre à jour le storage
    let cadre = db.getSync(cle('cadreCalendrier')) || {};
    cadre.dateDebut = '';
    cadre.finCours = '';
    cadre.finTrimestre = '';
    cadre.remiseNotes = '';
    // Lot E2 (D3) : par le témoin commun, qui dit le succès comme l'échec.
    if (!sauvegarderDonneesSelonMode('cadreCalendrier', cadre, { geste: 'Réinitialiser les bornes' })) return;

    // #390 (audit 5 août, rapport B5) : purger le calendrier généré — la
    // sidebar gardait « 15 sem. · 75 jours » après réinitialisation. NE PAS
    // régénérer ici : genererCalendrierComplet a des dates de repli en dur et
    // fabriquerait un calendrier fantôme sur des bornes vides.
    db.removeSync(cle('calendrierComplet'));
    if (typeof afficherCalendrierScolaire === 'function') {
        afficherCalendrierScolaire();
    }
    // Stats + avertissements à l'état vide (source unique #366)
    window.afficherStatistiquesTrimestreV2();
}

/**
 * Réinitialise les semaines spéciales aux valeurs vides
 */
function reinitialiserSemainesSpecialesV2() {
    if (!confirm('Veux-tu vraiment réinitialiser les semaines spéciales ?')) {
        return;
    }

    // Vider les champs de semaines spéciales
    const champs = [
        'v2-semainePlanificationDebut',
        'v2-semainePlanificationFin',
        'v2-semaineExamensDebut',
        'v2-semaineExamensFin'
    ];

    champs.forEach(id => {
        const elem = document.getElementById(id);
        if (elem) elem.value = '';
    });

    // Mettre à jour le storage
    let cadre = db.getSync(cle('cadreCalendrier')) || {};
    cadre.semainePlanificationDebut = '';
    cadre.semainePlanificationFin = '';
    cadre.semaineExamensDebut = '';
    cadre.semaineExamensFin = '';
    // Lot E2 (D3) : par le témoin commun, qui dit le succès comme l'échec.
    if (!sauvegarderDonneesSelonMode('cadreCalendrier', cadre, { geste: 'Réinitialiser les semaines spéciales' })) return;

    // #390 (audit 5 août, rapport B5) : les semaines spéciales influencent le
    // statut des jours — régénérer le calendrier (bornes toujours présentes)
    // et rafraîchir stats + avertissements, comme le fait la sauvegarde.
    if (typeof genererCalendrierComplet === 'function') {
        genererCalendrierComplet();
    }
    if (typeof afficherCalendrierScolaire === 'function') {
        afficherCalendrierScolaire();
    }
    window.afficherStatistiquesTrimestreV2();
}

/**
 * Affiche les statistiques du trimestre dans les spans v2-
 */
/* ===============================
   ÉVÉNEMENTS PRÉVUS/IMPRÉVUS
   =============================== */

/**
 * Charge et affiche les événements prévus
 */
/* ===============================
   JOURNÉES SANS COURS — fusion #374+#373 (relais 4 août 2026)
   Une carte, un formulaire, UNE clé `journeesSansCours` (les anciennes
   clés evenementsPrevus/evenementsImprevus sont fusionnées au boot par
   migrerJourneesSansCours, js/migrations.js). Natures : institutionnel /
   ferie / personnel. Reprise optionnelle, interdite sur personnel
   (convention §3.0).
   =============================== */

function chargerJourneesSansCoursV2() {
    const evenements = db.getSync(cle('journeesSansCours'), []);
    const conteneur = document.getElementById('v2-journeesSansCoursContainer');
    const compteur = document.getElementById('v2-nombreJourneesSansCours');

    if (compteur) compteur.textContent = evenements.length;
    if (!conteneur) return;

    if (evenements.length === 0) {
        conteneur.innerHTML = '';
        return;
    }

    // Tri chronologique : la liste se lit comme le trimestre se déroule
    const tries = [...evenements].sort((a, b) => String(a.dateEvenement).localeCompare(String(b.dateEvenement)));
    let html = '';
    tries.forEach(evt => {
        html += genererCarteEvenementV2(evt);
    });

    conteneur.innerHTML = html;
}

const BADGES_NATURE_V2 = {
    institutionnel: '<span class="badge-categorie-evenement badge-institutionnel">Institutionnel</span>',
    ferie: '<span class="badge-categorie-evenement badge-ferie">Férié</span>',
    personnel: '<span class="badge-categorie-evenement badge-personnel">Personnel</span>'
};

/**
 * Génère le HTML d'une carte journée sans cours (mode compact)
 */
function genererCarteEvenementV2(evt) {
    // #370 (relais 4 août) : « Reprise Lundi le 2026-09-10 » se lisait comme si
    // la reprise avait lieu un lundi — or Lundi désigne l'HORAIRE adopté ce
    // jour-là. Date d'abord, horaire entre parenthèses.
    const horaireRepris = (evt.horaireReprise || '').replace('Horaire du ', '');
    const repriseInfo = evt.dateReprise ?
        `<div style="font-size: 0.85rem; color: var(--gris-moyen); margin-top: 4px;">
            → Reprise le <strong>${echapperHtml(evt.dateReprise)}</strong>${horaireRepris ? ` (horaire du <strong>${echapperHtml(horaireRepris.toLowerCase())}</strong>)` : ''}
        </div>` : '';

    const badgeCat = BADGES_NATURE_V2[evt.categorie] || BADGES_NATURE_V2.institutionnel;

    return `
    <div class="item-carte-compact" style="margin-bottom: 12px; padding: 12px 15px; background: var(--bleu-tres-pale); border-radius: 8px; border-left: 4px solid var(--accent-primaire);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 15px;">
            <div style="flex: 1; min-width: 0;">
                <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
                    <strong style="font-size: 1rem;">${echapperHtml(evt.description || '')}</strong>
                    ${badgeCat}
                    <span style="color: var(--accent-primaire); font-weight: 500;">${echapperHtml(evt.dateEvenement || '')}</span>
                </div>
                ${repriseInfo}
            </div>
            <div style="display: flex; gap: 8px; flex-shrink: 0;">
                <button data-action="modifierEvenementV2" data-param="${echapperHtml(evt.id || '')}" class="btn btn-secondaire btn-sm" style="padding: 6px 12px; font-size: 0.85rem;">Modifier</button>
                <button data-action="supprimerEvenementV2" data-param="${echapperHtml(evt.id || '')}" class="btn btn-supprimer btn-sm" style="padding: 6px 12px; font-size: 0.85rem;">Suppr.</button>
            </div>
        </div>
    </div>`;
}

// ID de la journée en cours d'édition (null = mode ajout)
let evenementEnEditionV2 = null;

/**
 * Affiche le formulaire d'ajout (champs réinitialisés)
 */
function afficherFormEvenementV2() {
    evenementEnEditionV2 = null;
    const form = document.getElementById('v2-formEvenement');
    if (!form) return;

    setValue('v2-dateEvenement', '');
    setValue('v2-descriptionEvenement', '');
    setValue('v2-categorieEvenement', 'institutionnel');
    setValue('v2-horaireReprise', '');
    setValue('v2-dateReprise', '');
    majAffichageRepriseV2();

    const btn = document.getElementById('v2-btnConfirmerEvenement');
    if (btn) btn.textContent = 'Ajouter';

    form.classList.remove('u-hide');
}

function majAffichageRepriseV2() {
    const cat = document.getElementById('v2-categorieEvenement')?.value || 'institutionnel';
    const bloc = document.getElementById('v2-blocReprise');
    if (!bloc) return;
    // Convention §3.0 : pas de reprise sur événement personnel.
    // Férié et institutionnel : reprise optionnelle (grève = institutionnel
    // SANS reprise, ça doit rester exprimable — on n'exige jamais la reprise).
    if (cat === 'personnel') {
        bloc.style.display = 'none';
        setValue('v2-horaireReprise', '');
        setValue('v2-dateReprise', '');
    } else {
        bloc.style.display = 'grid';
    }
}

/**
 * Pré-remplit le formulaire pour modifier une journée existante
 */
function modifierEvenementV2(id) {
    const evenements = db.getSync(cle('journeesSansCours'), []);
    const evt = evenements.find(e => e.id === id);

    if (!evt) {
        notifications.erreur('Journée introuvable');
        return;
    }

    evenementEnEditionV2 = id;
    const form = document.getElementById('v2-formEvenement');
    if (!form) return;

    setValue('v2-dateEvenement', evt.dateEvenement || '');
    setValue('v2-descriptionEvenement', evt.description || '');
    setValue('v2-categorieEvenement', evt.categorie || 'institutionnel');
    setValue('v2-horaireReprise', evt.horaireReprise || '');
    setValue('v2-dateReprise', evt.dateReprise || '');
    majAffichageRepriseV2();

    const btn = document.getElementById('v2-btnConfirmerEvenement');
    if (btn) btn.textContent = 'Sauvegarder';

    form.classList.remove('u-hide');
}

/**
 * Confirme l'ajout ou la modification d'une journée sans cours
 */
function confirmerEvenementV2() {
    const dateEvenement = document.getElementById('v2-dateEvenement')?.value;
    const description = document.getElementById('v2-descriptionEvenement')?.value?.trim();
    const categorie = document.getElementById('v2-categorieEvenement')?.value || 'institutionnel';
    let horaireReprise = document.getElementById('v2-horaireReprise')?.value || '';
    let dateReprise = document.getElementById('v2-dateReprise')?.value || '';

    // Convention §3.0 : pas de reprise sur événement personnel
    if (categorie === 'personnel') {
        horaireReprise = '';
        dateReprise = '';
    }

    if (!dateEvenement || !description) {
        notifications.warning('Remplis la date et la description.');
        return;
    }

    if (dateReprise && !horaireReprise) {
        notifications.warning('Indique quel jour de cours est remplacé.');
        return;
    }

    const evenements = db.getSync(cle('journeesSansCours'), []);

    if (evenementEnEditionV2) {
        const index = evenements.findIndex(e => e.id === evenementEnEditionV2);
        if (index === -1) {
            // 🔧 #466/CT-06 (21 août 2026) : la branche absente avalait tout —
            // l'événement édité n'est pas dans la liste du trimestre ACTIF
            // (édition à cheval sur une bascule) : rien n'était écrit, mais le
            // toast « Journée modifiée » s'affichait quand même. Même sentinelle
            // défensive que l'horaire (29 mai) : refus BRUYANT, pas de faux succès.
            console.warn('[Journées V2] Sauvegarde refusée : journée', evenementEnEditionV2, 'absente du trimestre actif', cle('journeesSansCours'));
            notifications.erreur(
                'Impossible d\'enregistrer cette journée',
                'Elle n\'appartient pas au trimestre actif. Bascule sur son trimestre pour la modifier.'
            );
            annulerFormEvenementV2();
            return;
        }
        evenements[index] = {
            id: evenementEnEditionV2,
            dateEvenement,
            description,
            categorie,
            horaireReprise,
            dateReprise
        };
    } else {
        evenements.push({
            id: genererIdUnique('EVT_'),
            dateEvenement,
            description,
            categorie,
            horaireReprise,
            dateReprise
        });
    }

    // Lot E2 (D3) : par le témoin commun ; le message du geste ne part qu'après une écriture.
    if (!sauvegarderDonneesSelonMode('journeesSansCours', evenements, { geste: evenementEnEditionV2 ? 'Modifier la journée' : 'Ajouter la journée' })) return;
    rafraichirApresChangementEvenementV2(evenementEnEditionV2 ? 'Journée modifiée' : 'Journée ajoutée');
    annulerFormEvenementV2();
}

/**
 * Ferme le formulaire sans sauvegarder
 */
function annulerFormEvenementV2() {
    evenementEnEditionV2 = null;
    const form = document.getElementById('v2-formEvenement');
    if (form) form.classList.add('u-hide');
}

/**
 * Supprime une journée sans cours
 */
function supprimerEvenementV2(id) {
    if (!confirm('Veux-tu vraiment supprimer cette journée sans cours ?')) return;

    let evenements = db.getSync(cle('journeesSansCours'), []);
    evenements = evenements.filter(e => e.id !== id);
    if (!sauvegarderDonneesSelonMode('journeesSansCours', evenements, { geste: 'Supprimer la journée' })) return;

    rafraichirApresChangementEvenementV2('Journée supprimée');
}

/**
 * Régénère calendrier + séances et rafraîchit toutes les vues après un
 * changement dans les journées sans cours (point unique, ex-dupliqué ×3).
 */
function rafraichirApresChangementEvenementV2(messageSucces) {
    if (typeof genererCalendrierComplet === 'function') {
        genererCalendrierComplet();
    }
    if (typeof genererSeancesCompletes === 'function') {
        genererSeancesCompletes();
    }
    if (typeof afficherCalendrierScolaire === 'function') {
        afficherCalendrierScolaire();
    }
    chargerJourneesSansCoursV2();
    window.afficherStatistiquesTrimestreV2();
    notifications.succes(messageSucces);
}

// Exports — 21 fonctions migrées du bloc principal résidu (L4007-4026 originelles
// + L2814 pour sauvegarderIdentificationTrimestreV2 isolé).
window.initialiserTrimestreV2 = initialiserTrimestreV2;
window.chargerIdentificationTrimestreV2 = chargerIdentificationTrimestreV2;
window.sauvegarderIdentificationTrimestreV2 = sauvegarderIdentificationTrimestreV2;
window.chargerCadreCalendrierV2 = chargerCadreCalendrierV2;
window.sauvegarderCadreCalendrierV2 = sauvegarderCadreCalendrierV2;
window.sauvegarderNomTrimestreV2 = sauvegarderNomTrimestreV2;
window.creerTrimestreV2 = creerTrimestreV2;
window.ouvrirCreationTrimestreV2 = ouvrirCreationTrimestreV2;
window.annulerCreationTrimestreV2 = annulerCreationTrimestreV2;
window.rendreModeFicheTrimestreV2 = rendreModeFicheTrimestreV2;
window.reinitialiserBornesTrimestreV2 = reinitialiserBornesTrimestreV2;
window.reinitialiserSemainesSpecialesV2 = reinitialiserSemainesSpecialesV2;
window.chargerJourneesSansCoursV2 = chargerJourneesSansCoursV2;
window.afficherFormEvenementV2 = afficherFormEvenementV2;
window.modifierEvenementV2 = modifierEvenementV2;
window.supprimerEvenementV2 = supprimerEvenementV2;
window.confirmerEvenementV2 = confirmerEvenementV2;
window.annulerFormEvenementV2 = annulerFormEvenementV2;
window.majAffichageRepriseV2 = majAffichageRepriseV2;

})();

