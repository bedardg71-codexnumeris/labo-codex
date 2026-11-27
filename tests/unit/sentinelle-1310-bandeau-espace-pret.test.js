import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// #1310 : « Ton espace de travail est prêt : trimestre, cours, groupe, horaire et pratique sont configurés » paraissait à
// côté de « Ce groupe-cours n'a pas de pratique de notation » : la condition du bandeau (js/transitions.js) ne regardait
// que l'horaire du groupe actif. Décision de Grégoire (27 nov. 2026) : le bandeau ne paraît que si chacun des cinq
// éléments qu'il nomme existe pour le groupe-cours actif ; sinon il ne paraît pas, et aucun mot ne change.
//
// Modules RÉELS : modes.js (le pointeur de pratique du groupe-cours), pratique-configurable.js et pratique-registre.js
// (la résolution de la note, `resoudrePratiqueActive`), transitions.js (la condition et l'affichage du bandeau).
//
// ROUGE AVANT LE CODE (27 nov. 2026, condition d'avant, `groupeActifAUnHoraire`) : huit essais rouges, chacun sur le
// bandeau affiché (sans pratique, pratique supprimée, illisible, horaire disparu, cours disparu, sans trimestre, mode
// « cours, tous groupes », groupe absent de la liste) ; « les cinq éléments », « sans horaire » et « déjà vu » verts.
// BREAK-TEST (27 nov. 2026), une garde retirée à la fois dans `espaceDeTravailEstPret` :
//   M1 pratique non regardée → sans pratique, supprimée, illisible ROUGES ;
//   M2 `designerPratiqueActive` au lieu de la résolution de la note → illisible ROUGE ;
//   M3 cours non regardé → cours disparu ROUGE ; M4 l'id d'horaire suffit → horaire disparu ROUGE ;
//   M5 trimestre non regardé → sans trimestre ROUGE ; M6 groupe introuvable accepté → tous groupes, groupe absent ROUGES.

const MESSAGE = 'Ton espace de travail est prêt : trimestre, cours, groupe, horaire et pratique sont configurés. '
    + 'Tu peux maintenant saisir les présences et évaluer les productions de tes étudiant·es.';

const PRATIQUE = { id: 'p-som', nom: 'Sommative (fictive)', type: 'sommative', calcul_note: { methode: 'moyenne_ponderee' } };
/** Une « Par standards » rangée sans échelle (le stock de #898) : trouvée en bibliothèque, mais la note ne la calcule pas. */
const PRATIQUE_ILLISIBLE = { id: 'p-std', nom: 'Par standards (fictive)', type: 'standards',
    configuration: { type: 'standards', portfolio: { nombreARetenir: 3, minimumCompletion: 3 } } };

/** Un trimestre, un cours, un groupe-cours actif, un horaire et une pratique : les cinq éléments du bandeau. */
function etatComplet() {
    return {
        trimestreId: 'a2026',
        cours: [{ id: 'C1', codeCours: '601-101-MQ', nomCours: 'Écriture et littérature' }],
        groupesCours: [{ id: 'GC1', coursId: 'C1', groupeNum: '00001', horaireId: 'H1', pratiqueId: 'p-som', actif: true }],
        horaires: [{ id: 'H1', nom: 'Mardi matin', seances: [{ id: 'S1', jour: 'Mardi', heureDebut: '08:00', heureFin: '09:50' }] }],
        pratiques: [PRATIQUE],
        actif: { id: 'GC1', coursId: 'C1', horaireId: 'H1', groupe: '00001' },
        prefs: {}
    };
}

function noeud() {
    return {
        id: '', className: '', textContent: '', enfants: [], parentNode: null,
        setAttribute() {}, addEventListener() {},
        classList: { add() {}, remove() {}, contains: () => false },
        appendChild(n) { n.parentNode = this; this.enfants.push(n); return n; }
    };
}
const texteDe = (n) => (n.textContent || '') + n.enfants.map(texteDe).join('');
/** Le message du bandeau : le paragraphe de `.transition-bandeau-texte`, sans le « ✕ » du bouton qui le ferme. */
const messageDe = (el) => texteDe(el.enfants[0].enfants.find((n) => n.className === 'transition-bandeau-texte'));

function monter(etat) {
    const store = {
        cours: etat.cours,
        groupeCoursActif: etat.actif,
        a2026_groupesCours: etat.groupesCours,
        a2026_horaires: etat.horaires,
        a2026_pratiquesConfigurables: etat.pratiques
    };
    const db = {
        getSync: (k, d) => (k in store && store[k] !== undefined ? JSON.parse(JSON.stringify(store[k])) : (d !== undefined ? d : null)),
        setSync: () => true, get: async (k) => (k in store ? store[k] : null), set: async () => {}, removeSync: () => {},
        enregistrerGardeEcriture: () => {}, surEcriture: () => {}, surEchecEcriture: () => {}, commitEnAttente: () => null
    };
    const cle = (k) => 'a2026_' + k;
    const win = {
        addEventListener() {}, removeEventListener() {}, PratiqueManager: {}, cle,
        obtenirTrimestreId: () => etat.trimestreId
    };
    const notifications = { succes() {}, erreur() {}, warning() {}, info() {} };
    chargerScript('js/modes.js', { db, cle, notifications, obtenirPreference: () => null, definirPreference: () => {} }, win);
    chargerScript('js/pratiques/pratique-configurable.js', { db, cle }, win);
    chargerScript('js/pratiques/pratique-registre.js', { db, cle, PratiqueConfigurable: win.PratiqueConfigurable }, win);

    const corps = noeud();
    const document = {
        readyState: 'complete', addEventListener() {},
        createElement: () => noeud(),
        getElementById: (id) => corps.enfants.find((n) => n.id === id) || null,
        body: Object.assign(corps, { removeChild(n) { corps.enfants = corps.enfants.filter((x) => x !== n); } })
    };
    const prefs = etat.prefs;
    chargerScript('js/transitions.js', {
        db, document, sectionActive: 'evaluations',
        obtenirPreference: (p) => prefs[p] === true,
        definirPreference: (p, v) => { prefs[p] = v; },
        estEnModeDemo: () => false,
        requestAnimationFrame: () => {}, setTimeout: () => {}
    }, win);
    return { win, document };
}

/** Le texte du bandeau après une évaluation, ou null s'il ne paraît pas. */
function bandeau(etat) {
    const { win, document } = monter(etat);
    win.transitions.evaluerTransitions();
    const el = document.getElementById('transition-bandeau');
    return el ? messageDe(el) : null;
}

describe('#1310 · le bandeau « Ton espace de travail est prêt » ne paraît que si les cinq éléments existent', () => {
    it('le banc mesure quelque chose : avec les cinq éléments, la pratique se résout comme pour la note', () => {
        const { win } = monter(etatComplet());
        expect(win.resoudrePratiqueActive().etat).toBe('ok');
    });

    it('les cinq éléments : le bandeau paraît, avec ses mots d\'avant', () => {
        expect(bandeau(etatComplet())).toBe(MESSAGE);
    });

    it('un groupe avec horaire et sans pratique : pas de bandeau (le cas vécu)', () => {
        const etat = etatComplet();
        delete etat.groupesCours[0].pratiqueId;
        expect(monter(etat).win.resoudrePratiqueActive().etat).toBe('aucune');
        expect(bandeau(etat)).toBeNull();
    });

    it('une pratique désignée mais supprimée de la bibliothèque : pas de bandeau', () => {
        const etat = etatComplet();
        etat.pratiques = [];
        expect(monter(etat).win.resoudrePratiqueActive().etat).toBe('introuvable');
        expect(bandeau(etat)).toBeNull();
    });

    it('une pratique trouvée mais que la note ne calcule pas (« illisible ») : pas de bandeau', () => {
        const etat = etatComplet();
        etat.pratiques = [PRATIQUE_ILLISIBLE];
        etat.groupesCours[0].pratiqueId = 'p-std';
        expect(monter(etat).win.resoudrePratiqueActive().etat).toBe('illisible');
        expect(bandeau(etat)).toBeNull();
    });

    it('sans horaire : pas de bandeau (comme avant)', () => {
        const etat = etatComplet();
        delete etat.groupesCours[0].horaireId;
        expect(bandeau(etat)).toBeNull();
    });

    it('un horaire désigné qui n\'existe plus : pas de bandeau', () => {
        const etat = etatComplet();
        etat.horaires = [];
        expect(bandeau(etat)).toBeNull();
    });

    it('un cours qui n\'existe plus : pas de bandeau', () => {
        const etat = etatComplet();
        etat.cours = [];
        expect(bandeau(etat)).toBeNull();
    });

    it('sans trimestre actif : pas de bandeau', () => {
        const etat = etatComplet();
        etat.trimestreId = '';
        expect(bandeau(etat)).toBeNull();
    });

    it('le mode « cours, tous groupes » (aucun groupe-cours actif) : pas de bandeau', () => {
        const etat = etatComplet();
        etat.actif = { modeCours: true, id: null, coursId: 'C1', horaireId: null, groupe: null };
        expect(bandeau(etat)).toBeNull();
    });

    it('un groupe-cours actif absent de la liste du trimestre : pas de bandeau', () => {
        const etat = etatComplet();
        etat.groupesCours = [];
        expect(bandeau(etat)).toBeNull();
    });

    it('mesure, sans changement : un bandeau déjà fermé (« vu ») ne reparaît pas, même avec les cinq éléments', () => {
        const etat = etatComplet();
        etat.prefs = { transition_num_crois_vue: true };
        expect(bandeau(etat)).toBeNull();
    });
});
