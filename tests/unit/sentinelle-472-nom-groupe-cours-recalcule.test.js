import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// #472 (lot 8, consigne de Cowork du 11 oct. 2026, constat CT-03 de l'audit du Cadre) — LE NOM DU
// GROUPE-COURS SE RECALCULE À L'AFFICHAGE.
//
// Le nom était calculé une fois, à l'enregistrement, puis figé dans `gc.nom` : renommer le code d'un
// cours ou changer les séances d'un horaire laissait l'ancien nom dans le menu et la carte. Il se
// calcule désormais par une seule fonction (`nomGroupeCours`), pour l'aperçu du formulaire comme pour
// l'affichage ; et après l'enregistrement d'un horaire ou d'un cours, le menu, la carte du groupe-cours
// ouvert et l'en-tête se refont (`rafraichirAffichageGroupesCoursV2`). `gc.nom` s'écrit encore (des
// lecteurs en dépendent) : il n'est plus qu'un repli. Aucune donnée réécrite. Noms fictifs.

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const echapper = (s) => String(s == null ? '' : s);

function elementDom(id) {
    return { id, _html: '', textContent: '', value: '', style: {}, dataset: {}, options: [], _attrs: {},
        get innerHTML() { return this._html; }, set innerHTML(v) { this._html = v; },
        classList: { add() {}, remove() {}, contains() { return false; }, toggle() {} },
        querySelector() { return null; }, querySelectorAll() { return []; }, addEventListener() {}, appendChild(c) { return c; },
        setAttribute(k, v) { this._attrs[k] = v; }, getAttribute(k) { return k in this._attrs ? this._attrs[k] : null; }, closest() { return null; }, focus() {} };
}

function monter() {
    const store = {
        cours: [{ id: 'C1', codeCours: '601-101-MQ', nomCours: 'Cours fictif' }],
        trimestres: [{ id: 'test', session: 'automne', annee: '2031', actif: true }],
        test_groupesCours: [{ id: 'GC_1', nom: 'ANCIEN NOM FIGÉ', trimestreId: 'test', coursId: 'C1', groupeNum: '00001', horaireId: 'HOR1', enseignantId: 'ENS1', actif: true }],
        test_horaires: [{ id: 'HOR1', nom: 'Lun-Mer', seances: [{ jour: 'Lundi', heureDebut: '08:00' }, { jour: 'Mercredi', heureDebut: '13:00' }] }],
        enseignants: [{ id: 'ENS1', prenom: 'Léa', nom: 'Fictive' }]
    };
    const elements = {};
    const document = { getElementById: (id) => (elements[id] || (elements[id] = elementDom(id))), querySelector: () => null, querySelectorAll: () => [],
        createElement: (t) => elementDom(t), addEventListener() {}, body: elementDom('body'), documentElement: { addEventListener() {} }, readyState: 'complete' };
    const uiDialogues = { declarerFicheEnCreation() {}, quitterCreationSiConfirme: async () => true };
    const win = chargerScript('js/identite-naturelle.js', {}, { addEventListener() {}, temoinEnregistrement: { nonEnregistre() {}, enregistre() {} }, raisonPourTemoin: (r) => r, uiDialogues });
    win.obtenirTrimestres = () => store.trimestres;
    chargerScript('js/trimestre-v2-groupes-cours.js', {
        document, cle: (k) => (String(k).startsWith('test_') ? k : 'test_' + k),
        sauvegarderDonneesSelonMode: (k, v) => { store['test_' + k] = JSON.parse(JSON.stringify(v)); return true; },
        db: { getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)), setSync: (k, v) => { store[k] = v; } },
        notifications: { succes() {}, erreur() {} }, echapperHtml: echapper, echapperAttribut: echapper, genererIdUnique: (p) => p + 'NEUF',
        trouverDoublonNaturel: win.trouverDoublonNaturel, cleNaturelleGroupeCours: win.cleNaturelleGroupeCours,
        obtenirTrimestreActif: () => store.trimestres[0], confirm: () => true,
        motsNature: () => ({ Objet: 'Cours', personneCourt: 'Enseignant·e' }), motNature: () => 'service'
    }, win);
    win.populerDropdownsAssemblageV2 = () => {};
    return { win, store, el: (id) => document.getElementById(id) };
}

describe('#472 — le nom du groupe-cours se recalcule à l\'affichage', () => {
    it('1. le nom vient des identifiants : trimestre, code du cours, groupe, résumé de l\'horaire', () => {
        const { win, store } = monter();
        expect(win.nomGroupeCours(store.test_groupesCours[0])).toBe('A2031-601-101-MQ-00001 (Lun-AM / Mer-PM)');
    });
    it('2. le code du cours change : le menu et la carte disent le nouveau nom ; `gc.nom` n\'est pas réécrit', () => {
        const { win, store, el } = monter();
        store.cours[0].codeCours = '601-102-MQ';
        win.populerDropdownGroupeCoursV2();
        win.mettreAJourCarteResumeGroupeCoursV2(store.test_groupesCours[0]);
        expect(el('v2-selectGroupeCours').innerHTML).toContain('A2031-601-102-MQ-00001');
        expect(el('v2-selectGroupeCours').innerHTML).not.toContain('ANCIEN NOM FIGÉ');
        expect(el('v2-carteResumeGroupeCours').innerHTML).toContain('A2031-601-102-MQ-00001');
        expect(store.test_groupesCours[0].nom, 'aucune donnée réécrite').toBe('ANCIEN NOM FIGÉ');
    });
    it('4. le rafraîchissement refait le menu, la carte du groupe-cours ouvert et l\'en-tête', () => {
        const { win, store, el } = monter();
        win.changerGroupeCoursSelectionneV2('GC_1');
        win.peuplerDropdownGroupeCoursActif = vi.fn();
        store.test_horaires[0].seances = [{ jour: 'Vendredi', heureDebut: '08:00' }];
        win.rafraichirAffichageGroupesCoursV2();
        expect(el('v2-carteResumeGroupeCours').innerHTML).toContain('(Ven-AM)');
        expect(el('v2-selectGroupeCours').innerHTML).toContain('(Ven-AM)');
        expect(win.peuplerDropdownGroupeCoursActif).toHaveBeenCalled();
    });
});

describe('#472 — enregistrer un horaire ou un cours refait l\'affichage des groupes-cours', () => {
    const corps = (fichier, nom) => {
        const src = readFileSync(path.join(RACINE, fichier), 'utf8');
        const d = src.indexOf('function ' + nom + '(');
        expect(d, nom).toBeGreaterThan(-1);
        const f = src.slice(d + 1).search(/\n(async )?function /);
        return src.slice(d, d + 1 + f);
    };
    it('5. sauvegarderHoraireV2, la suppression d\'un horaire, _apresEcritureCoursV2 et la suppression d\'un cours l\'appellent', () => {
        expect(corps('js/trimestre-v2-horaires.js', 'sauvegarderHoraireV2')).toContain('window.rafraichirAffichageGroupesCoursV2()');
        expect(corps('js/trimestre-v2-cours.js', '_apresEcritureCoursV2')).toContain('window.rafraichirAffichageGroupesCoursV2()');
        expect((readFileSync(path.join(RACINE, 'js/trimestre-v2-horaires.js'), 'utf8').match(/window\.rafraichirAffichageGroupesCoursV2\(\)/g) || []).length).toBe(2);
        expect((readFileSync(path.join(RACINE, 'js/trimestre-v2-cours.js'), 'utf8').match(/window\.rafraichirAffichageGroupesCoursV2\(\)/g) || []).length).toBe(2);
    });
});
