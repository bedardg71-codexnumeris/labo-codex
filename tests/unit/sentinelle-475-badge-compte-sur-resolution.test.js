import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// #475 (lot 8, consigne de Cowork du 11 oct. 2026, constat CT-14) — LE BADGE « X/5 CONFIGURÉS » NE
// COMPTE UNE RÉFÉRENCE QUE SI CE QU'ELLE DÉSIGNE EXISTE.
//
// Le cours et l'horaire étaient déjà résolus ; l'enseignant et la pratique comptaient sur la seule
// présence de leur id : un enseignant ou une pratique supprimés laissaient « Complet ». Ils sont
// résolus là où le formulaire les propose : `enseignants` (ou le profil, `'profil'`), les pratiques du
// trimestre (ids legacy normalisés), le registre des pratiques prédéfinies, le démo. Le dénominateur
// reste 5. ↻ #1152, lot 5 (29 oct. 2026, mesure du § 1.3 de CONSIGNE-LOT-2026-10-28-aide-lot-5-textes-d-ecran.md) :
// les cinq éléments comptés sont ceux que l'écran dit obligatoires — le TRIMESTRE compte, la pratique (facultative)
// ne compte plus. Noms fictifs.

const echapper = (s) => String(s == null ? '' : s);
function elementDom(id) {
    return { id, _html: '', textContent: '', value: '', style: {}, dataset: {}, options: [], _attrs: {},
        get innerHTML() { return this._html; }, set innerHTML(v) { this._html = v; },
        classList: { add() {}, remove() {}, contains() { return false; }, toggle() {} },
        querySelector() { return null; }, querySelectorAll() { return []; }, addEventListener() {}, appendChild(c) { return c; },
        setAttribute() {}, getAttribute() { return null; }, closest() { return null; }, focus() {} };
}

function badge(gc, { enseignants = [{ id: 'ENS1', prenom: 'Léa', nom: 'Fictive' }], pratiques = [{ id: 'PRAT1', nom: 'Pratique fictive' }],
    profil = {}, registre = [] } = {}) {
    const store = {
        cours: [{ id: 'C1', codeCours: '601-101-MQ', nomCours: 'Cours fictif' }],
        trimestres: [{ id: 'test', session: 'automne', annee: '2031', actif: true }],
        test_horaires: [{ id: 'HOR1', nom: 'Lun', seances: [{ jour: 'Lundi', heureDebut: '08:00' }] }],
        test_pratiquesConfigurables: pratiques, enseignants, profilEnseignant: profil
    };
    const elements = {};
    const document = { getElementById: (id) => (elements[id] || (elements[id] = elementDom(id))), querySelector: () => null, querySelectorAll: () => [],
        createElement: (t) => elementDom(t), addEventListener() {}, body: elementDom('body'), documentElement: { addEventListener() {} }, readyState: 'complete' };
    const win = { addEventListener() {}, temoinEnregistrement: { nonEnregistre() {}, enregistre() {} }, raisonPourTemoin: (r) => r,
        uiDialogues: { declarerFicheEnCreation() {}, quitterCreationSiConfirme: async () => true },
        obtenirTrimestres: () => store.trimestres,
        trouverPratiqueEnBibliotheque: (id) => (store.test_pratiquesConfigurables || []).find((p) => p.id === id) || null,
        pratiqueEstDisponible: (id) => registre.includes(id), normaliserIdPratique: (id) => id };
    chargerScript('js/trimestre-v2-groupes-cours.js', {
        document, cle: (k) => 'test_' + k,
        db: { getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)), setSync: (k, v) => { store[k] = v; } },
        notifications: { succes() {}, erreur() {} }, echapperHtml: echapper, echapperAttribut: echapper,
        obtenirTrimestreActif: () => store.trimestres[0],
        motsNature: () => ({ Objet: 'Cours', personneCourt: 'Enseignant·e' }), motNature: () => 'service'
    }, win);
    win.mettreAJourCarteResumeGroupeCoursV2(Object.assign({ id: 'GC_1', trimestreId: 'test', coursId: 'C1', groupeNum: '00001', horaireId: 'HOR1' }, gc));
    return (document.getElementById('v2-carteResumeGroupeCours').innerHTML.match(/score-valeur">([^<]*)</) || [])[1];
}

describe('#475 — le badge ne compte que ce qui existe', () => {
    it('0. témoin : tout existe → « Complet »', () => {
        expect(badge({ enseignantId: 'ENS1', pratiqueId: 'PRAT1' })).toBe('Complet');
    });
    it('1. un enseignant supprimé ne compte plus (avant : « Complet »)', () => {
        expect(badge({ enseignantId: 'ENS_PARTI', pratiqueId: 'PRAT1' })).toBe('4/5 configurés');
    });
    it('2. ↻ lot 5 : la pratique, facultative, ne compte plus — supprimée ou absente, le badge reste « Complet »', () => {
        expect(badge({ enseignantId: 'ENS1', pratiqueId: 'PRAT_PARTIE' })).toBe('Complet');
        expect(badge({ enseignantId: 'ENS1' })).toBe('Complet');
    });
    it('2 bis. lot 5 : le trimestre compte — absent ou supprimé, il manque (pas de repli sur le trimestre actif)', () => {
        expect(badge({ enseignantId: 'ENS1', trimestreId: undefined })).toBe('4/5 configurés');
        expect(badge({ enseignantId: 'ENS1', trimestreId: 'PARTI' })).toBe('4/5 configurés');
    });
    it('3. le profil (`profil`) compte s\'il est rempli, pas s\'il est vide', () => {
        expect(badge({ enseignantId: 'profil', pratiqueId: 'PRAT1' }, { profil: { prenom: 'Léa', nom: 'Fictive' } })).toBe('Complet');
        expect(badge({ enseignantId: 'profil', pratiqueId: 'PRAT1' }, { profil: {} })).toBe('4/5 configurés');
    });
    it('4. ↻ lot 5 : une pratique prédéfinie ne change rien au compte', () => {
        expect(badge({ enseignantId: 'ENS1', pratiqueId: 'sommative' }, { registre: ['sommative'] })).toBe('Complet');
    });
});
