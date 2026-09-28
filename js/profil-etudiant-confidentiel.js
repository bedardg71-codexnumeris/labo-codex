/**
 * profil-etudiant-confidentiel.js
 *
 * Sous-module extrait de profil-etudiant.js (session B refactor, 18 mai 2026).
 *
 * Périmètre : modal d'informations confidentielles (PII : services adaptés,
 * sous-catégories médicales, notes de présences, portraits qualitatifs).
 *
 * Données SENSIBLE §1.2 (SKILL_Securite_donnees.md) — combinables avec DA présents
 * dans la zone pour identifier un étudiant. Préservation comportementale stricte :
 * échappement existant conservé (escapeHtml local L5209-5216 original + echapperHtml
 * pour sous-catégories).
 *
 * 8 fonctions (6 exports window.X existants + 2 promotions session B),
 * 2 variables module-scope (_confidentielDaActuel, SOUS_CATEGORIES_SERVICES)
 * encapsulées dans l'IIFE.
 *
 * @see audit/refactoring-prep/MODULES-MAP.md §2.3
 * @see Skills pour Claude Code/SKILL_Securite_donnees.md §9.1
 */
(function () {
    'use strict';

// =============================================================================
// MODAL INFORMATIONS CONFIDENTIELLES (Beta 96.1)
// Gestion des informations sensibles sur l'étudiant
// =============================================================================

// Variable pour stocker le DA de l'étudiant en cours d'édition
let _confidentielDaActuel = null;
// Lot E3 : un champ a été écrit depuis l'ouverture — « Fermer » rafraîchit alors le profil (la pastille).
let _ecritDepuisOuverture = false;

// Lot E3 (D0 point 2) : le geste nommé par le témoin commun.
const GESTE_CONFIDENTIEL = 'Informations confidentielles';
const GESTE_NOTE_PRESENCE = 'Note de présence';

// Sous-catégories pour les services adaptés
const SOUS_CATEGORIES_SERVICES = {
    'sensorielle': [
        'Déficience visuelle',
        'Déficience auditive',
        'Paralysie cérébrale',
        'Spina-bifida',
        'Dystrophie musculaire'
    ],
    'neurologique': [
        'Trouble du spectre autistique (TSA)',
        'Syndrome Gilles de la Tourette',
        'Traumatisme craniocérébral',
        'Sclérose en plaques',
        'Dysphasie',
        'TDA/H',
        'Fibromyalgie'
    ],
    'organique': [
        'Épilepsie',
        'Maladie de Crohn',
        'Cancer',
        'Diabète'
    ],
    'apprentissage': [
        'Dyslexie',
        'Dysorthographie',
        'Dyscalculie'
    ],
    'sante-mentale': [
        'Trouble d\'anxiété généralisée',
        'Trouble de l\'humeur (bipolarité, dépression)',
        'Trouble de la personnalité',
        'Trouble psychotique (schizophrénie)',
        'Troubles alimentaires'
    ]
};

function _voletMasque() {
    return typeof window.estModeAnonymisation === 'function' && window.estModeAnonymisation();
}

// Les champs gardent la saisie de la dernière ouverture : en anonymisation, rien n'y reste.
function _viderChampsConfidentiel() {
    document.querySelectorAll('#confidentiel-champs input[type="checkbox"]').forEach(c => { c.checked = false; });
    document.querySelectorAll('#confidentiel-champs select, #confidentiel-champs textarea').forEach(c => { c.value = ''; });
    const notesPresences = document.getElementById('confidentiel-notes-presences');
    if (notesPresences) notesPresences.textContent = '';
}

/**
 * Ouvre le modal des informations confidentielles pour un étudiant
 * @param {string} da - Numéro de DA de l'étudiant
 */
function ouvrirModalConfidentiel(da) {
    _confidentielDaActuel = da;
    _ecritDepuisOuverture = false;

    // Récupérer les infos de l'étudiant
    const etudiants = obtenirDonneesSelonMode('groupeEtudiants');
    const etudiant = etudiants.find(e => e.da === da);
    const masquer = _voletMasque();
    const nomComplet = etudiant ? `${etudiant.prenom} ${etudiant.nom}` : (masquer ? '---' : `DA ${da}`);

    // Afficher le nom dans le modal
    document.getElementById('confidentiel-nom-etudiant').textContent = nomComplet;

    // Lot A de l'enregistrement (26 sept. 2026, #751) — en anonymisation, rien d'identifiant à
    // l'écran : parcours, diagnostic, défis, notes libres et notes de présences ne sont ni lus ni
    // affichés, et le volet n'a rien à enregistrer. Avant : il lisait le store brut, sans garde.
    ['confidentiel-champs', 'confidentiel-bloc-notes-presences'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.toggle('u-hide', masquer);
    });
    const mention = document.getElementById('confidentiel-masque');
    if (mention) {
        mention.textContent = masquer ? window.MENTION_MASQUE_ANONYMISATION : '';
        mention.classList.toggle('u-hide', !masquer);
    }
    if (masquer) {
        _viderChampsConfidentiel();
        document.getElementById('modalConfidentiel').classList.add('actif');
        return;
    }

    // Charger les données existantes
    const cleConfidentiel = cle('confidentielEtudiants');
    const donnees = db.getSync(cleConfidentiel, {});
    const infos = donnees[da] || {};

    // Remplir les champs
    document.getElementById('confidentiel-epgc').checked = infos.epgc || false;
    document.getElementById('confidentiel-cours-regulier').checked = infos.coursRegulier || false;
    document.getElementById('confidentiel-cours-echec').checked = infos.coursEchec || false;
    document.getElementById('confidentiel-cours-abandon').checked = infos.coursAbandon || false;
    document.getElementById('confidentiel-cours-decrochage').checked = infos.coursDecrochage || false;
    document.getElementById('confidentiel-cours-renforcement').checked = infos.coursRenforcement || false;

    // D.1 (lot 4 du cadrage 11 — décision de Grégoire du 11 sept. 2026, 17 h 20) :
    // UNE source, la liste des étudiant·es (`etudiant.sa`, Cadre › Trimestre). La
    // case reflète, ne se coche pas ; le second booléen `servicesAdaptes` que ce
    // volet stockait n'est plus lu ni écrit (stock : il tombe au prochain
    // Enregistrer, comme les champs `portrait*`). Catégorie et sous-catégorie ne
    // s'affichent que pour un élève marqué « Oui » — `toggleServicesAdaptes`,
    // exportée depuis mai et jamais appelée, l'est enfin, au rendu.
    const servicesAdaptes = !!etudiant && (etudiant.sa === 'Oui' || etudiant.sa === true);
    const caseServicesAdaptes = document.getElementById('confidentiel-services-adaptes');
    caseServicesAdaptes.checked = servicesAdaptes;
    caseServicesAdaptes.disabled = true;
    toggleServicesAdaptes(servicesAdaptes);

    document.getElementById('confidentiel-categorie').value = infos.categorie || '';
    mettreAJourSousCategories();
    document.getElementById('confidentiel-sous-categorie').value = infos.sousCategorie || '';

    document.getElementById('confidentiel-defi-fls').checked = infos.defiFLS || false;
    document.getElementById('confidentiel-defi-socialisation').checked = infos.defiSocialisation || false;
    document.getElementById('confidentiel-defi-integration').checked = infos.defiIntegration || false;
    document.getElementById('confidentiel-defi-organisation-scolaire').checked = infos.defiOrganisationScolaire || false;
    document.getElementById('confidentiel-defi-organisation-citoyenne').checked = infos.defiOrganisationCitoyenne || false;

    document.getElementById('confidentiel-notes').value = infos.notes || '';

    // D.2 (lot 4 du cadrage 11 — décision de Grégoire du 11 sept. 2026, 17 h 20) : le
    // « Portrait de lecteur » (cinq sélecteurs I/D/M/E, Conception · Rigueur ·
    // Plausibilité · Nuance · Français) est retiré : c'était sa pratique codée en
    // dur dans un volet que d'autres disciplines lisent. STOCK (ses mots, 17 h 24 :
    // « peuvent disparaître complètement ») : aucune purge — `sauvegarderConfidentiel`
    // réécrit l'objet entier depuis le formulaire, les champs `portrait*` tombent
    // d'eux-mêmes au prochain Enregistrer, et personne ne les lit d'ici là.

    // Charger les notes de présences
    chargerNotesPresencesConfidentiel(da);

    // Afficher le modal
    document.getElementById('modalConfidentiel').classList.add('actif');
}

/**
 * Charge et affiche les notes de présences pour un étudiant (trimestre actif)
 * @param {string} da - DA de l'étudiant
 */
function chargerNotesPresencesConfidentiel(da) {
    const container = document.getElementById('confidentiel-notes-presences');
    if (!container) return;

    // Fonction locale d'échappement HTML
    const escapeHtml = (str) => {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    };

    // Obtenir la clé des présences pour le trimestre actif
    const clePresences = cle('presences');
    const presences = db.getSync(clePresences, []);

    // Filtrer les présences de cet étudiant qui ont des notes
    const notesEtudiant = presences
        .filter(p => p.da === da && p.notes && p.notes.trim() !== '')
        .sort((a, b) => new Date(a.date) - new Date(b.date)); // Ordre chronologique

    if (notesEtudiant.length === 0) {
        container.innerHTML = '<p class="text-muted" style="margin: 0; font-style: italic;">Aucune note de présence pour ce trimestre.</p>';
        return;
    }

    // Générer l'affichage
    let html = '<div style="display: flex; flex-direction: column; gap: 8px;">';

    notesEtudiant.forEach(p => {
        const dateObj = new Date(p.date);
        const dateFormatee = dateObj.toLocaleDateString('fr-CA', {
            day: 'numeric',
            month: 'short'
        });

        html += `
            <div style="display: flex; gap: 8px; align-items: flex-start;">
                <span style="min-width: 55px; font-weight: 600; color: var(--accent-primaire); padding-top: 4px;">${dateFormatee}</span>
                <textarea
                    class="controle-form note-presence-editable"
                    data-date="${echapperHtml(p.date)}"
                    data-da="${echapperHtml(da)}"
                    rows="1"
                    style="flex: 1; resize: vertical; font-size: 0.8rem; padding: 4px 8px;"
                >${escapeHtml(p.notes)}</textarea>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
}

/**
 * Lot E3 (D3) — une note de présence modifiée dans le volet s'écrit toute seule, par le témoin
 * (`modifierNotesPresence`, saisie-presences.js). Avant : toutes à la fois, à « Enregistrer », sans
 * rien dire d'un échec.
 * @param {HTMLTextAreaElement} textarea - la note modifiée (`data-da`, `data-date`)
 * @returns {boolean} true si la note a été écrite
 */
function enregistrerNotePresenceConfidentiel(textarea) {
    if (!textarea || _voletMasque() || typeof window.modifierNotesPresence !== 'function') return false;
    const resultat = window.modifierNotesPresence(textarea.dataset.da, textarea.dataset.date, textarea.value.trim());
    if (resultat === null && window.temoinEnregistrement) {
        // La présence de cette date n'existe plus (séance retirée depuis l'ouverture) : rien d'écrit, et on le dit.
        window.temoinEnregistrement.nonEnregistre('la présence de cette date n\'existe plus ; ferme et rouvre le volet.', GESTE_NOTE_PRESENCE, cle('presences'));
    }
    if (resultat === true) _ecritDepuisOuverture = true;
    return resultat === true;
}

/**
 * Lot E3 (D3) — « Fermer » (« Annuler » et × n'annulaient rien : chaque champ est déjà écrit).
 * Le profil se redessine si un champ a été écrit : sa pastille suit.
 */
function fermerModalConfidentiel() {
    // #867 — tenir le DA AVANT de le vider : le rafraîchissement le reçoit.
    const daEnCours = _confidentielDaActuel;
    const rafraichir = _ecritDepuisOuverture;
    document.getElementById('modalConfidentiel').classList.remove('actif');
    _confidentielDaActuel = null;
    _ecritDepuisOuverture = false;
    if (rafraichir && daEnCours && typeof window.afficherProfilComplet === 'function') {
        window.afficherProfilComplet(daEnCours);
    }
}

/**
 * Lot E3 (D3, D0 point 2) — L'ÉCRIVAIN DU VOLET : les informations confidentielles s'enregistrent toutes
 * seules, champ par champ, par le témoin commun. Il relit tout le volet, comme le bouton d'avant.
 * Masqué en anonymisation (lot A) : rien n'est lu, rien ne s'écrit — les champs sont vidés à l'ouverture,
 * les écrire effacerait le volet.
 * @returns {boolean} true si le volet a été écrit
 */
function sauvegarderConfidentiel() {
    if (!_confidentielDaActuel) return false;
    if (_voletMasque()) return false;

    const infos = {
        epgc: document.getElementById('confidentiel-epgc').checked,
        coursRegulier: document.getElementById('confidentiel-cours-regulier').checked,
        coursEchec: document.getElementById('confidentiel-cours-echec').checked,
        coursAbandon: document.getElementById('confidentiel-cours-abandon').checked,
        coursDecrochage: document.getElementById('confidentiel-cours-decrochage').checked,
        coursRenforcement: document.getElementById('confidentiel-cours-renforcement').checked,
        categorie: document.getElementById('confidentiel-categorie').value,
        sousCategorie: document.getElementById('confidentiel-sous-categorie').value,
        defiFLS: document.getElementById('confidentiel-defi-fls').checked,
        defiSocialisation: document.getElementById('confidentiel-defi-socialisation').checked,
        defiIntegration: document.getElementById('confidentiel-defi-integration').checked,
        defiOrganisationScolaire: document.getElementById('confidentiel-defi-organisation-scolaire').checked,
        defiOrganisationCitoyenne: document.getElementById('confidentiel-defi-organisation-citoyenne').checked,
        notes: document.getElementById('confidentiel-notes').value.trim()
        // Ni `servicesAdaptes` (D.1 : la liste des étudiant·es fait foi) ni `portrait*`
        // (D.2 : retirés) — l'objet entier est réécrit, le stock ancien tombe ici.
    };

    // La collection lue est COPIÉE avant d'être modifiée (lot E2, R1) : `db.getSync` peut rendre
    // l'objet de son cache, et une écriture qui échoue le laisserait faux en mémoire.
    const donnees = JSON.parse(JSON.stringify(db.getSync(cle('confidentielEtudiants'), {}) || {}));
    donnees[_confidentielDaActuel] = infos;
    const ecrit = sauvegarderDonneesSelonMode('confidentielEtudiants', donnees, { geste: GESTE_CONFIDENTIEL });
    if (ecrit) _ecritDepuisOuverture = true;
    return ecrit;
}

/**
 * Lot E3 — l'écouteur unique du volet. Les autres écouteurs du même changement agissent d'abord
 * (la catégorie repeuple ses sous-catégories, par le dispatcher du document).
 * @param {Element} champ
 */
async function surChangementConfidentiel(champ) {
    await new Promise(resolve => setTimeout(resolve, 0));
    if (!_confidentielDaActuel || _voletMasque() || !champ) return false;
    if (champ.classList && champ.classList.contains('note-presence-editable')) return enregistrerNotePresenceConfidentiel(champ);
    if (typeof champ.closest === 'function' && champ.closest('#confidentiel-champs')) return sauvegarderConfidentiel();
    return false;
}

// ⚠ Délégué au DOCUMENT : ce script est chargé AVANT le HTML de la fenêtre (index.html), qui
// n'existe donc pas encore ici. Un écouteur posé sur `#modalConfidentiel` au chargement ne voyait
// rien (mesuré en WebKit, banc #867 réaligné).
if (typeof document.addEventListener === 'function') {
    document.addEventListener('change', (e) => {
        const cible = e.target;
        if (cible && typeof cible.closest === 'function' && cible.closest('#modalConfidentiel')) surChangementConfidentiel(cible);
    });
}

/**
 * Affiche/masque les détails des services adaptés
 * @param {boolean} afficher - true pour afficher, false pour masquer
 */
function toggleServicesAdaptes(afficher) {
    const details = document.getElementById('confidentiel-services-details');
    if (details) {
        toggleDisplay(details, afficher);
    }
}

/**
 * Met à jour les sous-catégories selon la catégorie sélectionnée
 */
function mettreAJourSousCategories() {
    const categorie = document.getElementById('confidentiel-categorie').value;
    const selectSousCategorie = document.getElementById('confidentiel-sous-categorie');

    if (!categorie) {
        selectSousCategorie.innerHTML = '<option value="">— Sélectionner une catégorie d\'abord —</option>';
        return;
    }

    const sousCategories = SOUS_CATEGORIES_SERVICES[categorie] || [];
    selectSousCategorie.innerHTML = '<option value="">— Sélectionner —</option>' + // security-ok: valeurs statiques SOUS_CATEGORIES_SERVICES + echapperHtml() défense profondeur (transfert refactor neutre depuis profil-etudiant.js)
        sousCategories.map(sc => `<option value="${echapperHtml(sc)}">${echapperHtml(sc)}</option>`).join('');
}

/**
 * Vérifie si un étudiant a des informations confidentielles enregistrées
 * @param {string} da - Numéro de DA
 * @returns {boolean} - true si des infos existent
 */
function aDesInfosConfidentielles(da) {
    const cleConfidentiel = cle('confidentielEtudiants');
    const donnees = db.getSync(cleConfidentiel, {});
    const infos = donnees[da];
    if (!infos) return false;

    // Vérifier si au moins une info est renseignée
    return infos.epgc || infos.categorie ||
           infos.coursRegulier || infos.coursEchec || infos.coursAbandon ||
           infos.coursDecrochage || infos.coursRenforcement ||
           infos.defiFLS || infos.defiSocialisation || infos.defiIntegration ||
           infos.defiOrganisationScolaire || infos.defiOrganisationCitoyenne ||
           (infos.notes && infos.notes.length > 0);
}


    // === EXPORTS window.X (6 existants + 2 promus session B convention systématique) ===
    window.ouvrirModalConfidentiel               = ouvrirModalConfidentiel;
    window.chargerNotesPresencesConfidentiel     = chargerNotesPresencesConfidentiel;
    window.enregistrerNotePresenceConfidentiel   = enregistrerNotePresenceConfidentiel;   // Lot E3
    window.surChangementConfidentiel             = surChangementConfidentiel;             // Lot E3
    window.fermerModalConfidentiel               = fermerModalConfidentiel;
    window.sauvegarderConfidentiel               = sauvegarderConfidentiel;
    window.toggleServicesAdaptes                 = toggleServicesAdaptes;
    window.mettreAJourSousCategories             = mettreAJourSousCategories;
    window.aDesInfosConfidentielles              = aDesInfosConfidentielles;
})();
