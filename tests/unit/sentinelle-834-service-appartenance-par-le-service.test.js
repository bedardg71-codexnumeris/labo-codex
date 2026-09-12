import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE #834, correctif du 12 sept. 2026 (consigne du jour, lots A et B) — DANS UN SERVICE,
// UN ÉLÈVE APPARTIENT PAR SON SERVICE, PAS PAR UN NUMÉRO DE GROUPE.
//
// Mesuré sur la porte terrain (rangée 9, 1.135.0, démo) : trois élèves écrits dans un service,
// DEUX rendus par `Suivi › Liste`. La fiche collée d'Omnivox portait le groupe d'origine du
// collège (« 00007 ») ; le groupe-cours du service porte « 00001 » ; `obtenirEtudiantsCoursActif`
// exigeait l'égalité des deux. (La consigne annonçait le même défaut dans
// `obtenirDonneesSelonMode` : mesuré FAUX — ce site ne compare le groupe qu'aux fiches SANS
// coursId ; le harnais démo AVANT rendait bien 3/3 par ce chemin et 2/3 par le goulot.)
//
// VERROUILLÉ ICI :
//   A. dans un SERVICE, des élèves à groupes hétérogènes (00001, 00007, vide) sont TOUS rendus,
//      par `obtenirEtudiantsCoursActif` et par `obtenirDonneesSelonMode('groupeEtudiants')` ;
//      une fiche sans coursId n'est pas la sienne, même au groupe du service (décision : un
//      service n'a pas d'historique) ;
//   B. sur un groupe-cours ORDINAIRE à deux groupes, le filtre par groupe mord EXACTEMENT comme
//      avant (valeurs de 1.135.0 figées) — c'est le verrou de non-régression, il compte plus
//      que A ; le mode cours (tous groupes) aussi ;
//   C. un service et un cours ordinaire dans le même trimestre : les élèves de l'un ne sont pas
//      dans l'autre ;
//   D. à l'écriture (rencontres.js), toute fiche d'un service porte le groupe du service, quel que
//      soit le numéro lu dans la ligne Omnivox ; le groupe-cours aussi ;
//   E. lot B — une ligne de quatre colonnes ou plus qui ne commence pas par un DA est REFUSÉE et
//      NOMMÉE ; le service se crée avec les lignes valides, ou pas du tout (rien n'est écrit) ;
//      jamais un élève fantôme.
//
// BREAK-TESTS VÉRIFIÉS le 12 septembre 2026 — journal en fin de fichier.

const clone = (x) => JSON.parse(JSON.stringify(x));
const cle = (k) => (String(k).startsWith('test_') ? k : 'test_' + k);

function dbBanc(store, journal = []) {
    return {
        getSync: (k, d) => (k in store ? clone(store[k]) : (d !== undefined ? d : null)),
        setSync: (k, v) => { store[k] = clone(v); journal.push(k); },
        removeSync: (k) => { delete store[k]; },
        get: async (k, d) => (k in store ? clone(store[k]) : (d !== undefined ? d : null)),
        set: async (k, v) => { store[k] = clone(v); journal.push(k); },
        modifier: async (k, f, d) => { store[k] = clone(f(k in store ? clone(store[k]) : d)); journal.push(k); },
    };
}
function classList() { const s = new Set(); return { add(c) { s.add(c); }, remove(c) { s.delete(c); }, contains(c) { return s.has(c); }, toggle(c, f) { const v = f === undefined ? !s.has(c) : !!f; v ? s.add(c) : s.delete(c); return v; } }; }
function elementDom(id) {
    return { id, _html: '', textContent: '', value: '', placeholder: '', style: {}, dataset: {}, options: [],
        get innerHTML() { return this._html; }, set innerHTML(v) { this._html = v; },
        classList: classList(), querySelector() { return null; }, querySelectorAll() { return []; }, addEventListener() {}, appendChild(c) { return c; },
        setAttribute() {}, getAttribute() { return null; }, closest() { return null; }, focus() {} };
}
function fauxDocument(elements) {
    return { getElementById: (id) => (elements[id] || (elements[id] = elementDom(id))), querySelector: () => null, querySelectorAll: () => [],
        createElement: (t) => elementDom(t), addEventListener() {}, body: elementDom('body'), documentElement: { addEventListener() {} }, readyState: 'complete' };
}

// ─── modes.js réel, stubs inertes (patron des sentinelles #749 lot 2 et #834 service) ───
function monterModes(store) {
    const win = { addEventListener() {}, obtenirTrimestreId: () => 'test', cle };
    const base = { db: dbBanc(store), cle, document: fauxDocument({}), estEnModeDemo: () => false, obtenirTrimestreId: () => 'test',
        toggleDisplay() {}, afficherSousSection() {}, naviguerVers() {}, notifications: { succes() {}, erreur() {}, info() {}, warning() {} }, setTimeout: () => 0, clearTimeout() {},
        MutationObserver: function () { return { observe() {}, disconnect() {} }; }, obtenirPreference: () => null, definirPreference() {} };
    chargerScript('js/modes.js', base, win);
    return win;
}
const das = (liste) => liste.map(e => e.da).sort();

// Un trimestre : un service (GC_S, groupe 00001) et un cours ordinaire à deux groupes (GC_7, GC_8).
const ELEVES = [
    { da: 'S1', nom: 'Tremblay', prenom: 'Léa', groupe: '00001', coursId: 'C_SERVICE' },
    { da: 'S7', nom: 'Gagnon', prenom: 'Noah', groupe: '00007', coursId: 'C_SERVICE' },   // ligne Omnivox : groupe du collège
    { da: 'S0', nom: 'Roy', prenom: 'Emma', groupe: '', coursId: 'C_SERVICE' },
    { da: 'A7', nom: 'Côté', prenom: 'Ali', groupe: '00007', coursId: 'C_COURS' },
    { da: 'B8', nom: 'Dubois', prenom: 'Mia', groupe: '00008', coursId: 'C_COURS' },
    { da: 'H7', nom: 'Ancien', prenom: 'Sept', groupe: '00007' },                          // ancien format, sans coursId
    { da: 'H8', nom: 'Ancien', prenom: 'Huit', groupe: '00008' },
    { da: 'H1', nom: 'Ancien', prenom: 'Un', groupe: '00001' },                            // ancien format, AU GROUPE DU SERVICE
    { da: 'H0', nom: 'Ancien', prenom: 'Sans' },                                           // ancien format, sans groupe
];
function trimestre() {
    return {
        cours: [{ id: 'C_SERVICE', nature: 'service', nomCours: 'Aide' }, { id: 'C_COURS', codeCours: '601-101-MQ', nomCours: 'Écriture' }],
        test_groupesCours: [
            { id: 'GC_S', coursId: 'C_SERVICE', groupeNum: '00001', horaireId: null, actif: false },
            { id: 'GC_7', coursId: 'C_COURS', groupeNum: '00007', horaireId: 'HOR1', actif: false },
            { id: 'GC_8', coursId: 'C_COURS', groupeNum: '00008', horaireId: 'HOR1', actif: false },
        ],
        test_groupeEtudiants: clone(ELEVES),
    };
}
function activer(store, gcId, modeCours = false) {
    const gc = store.test_groupesCours.find(g => g.id === gcId);
    store.test_groupesCours.forEach(g => { g.actif = g.id === gcId; });
    gc.modeCours = modeCours;
    store.groupeCoursActif = { id: gc.id, coursId: gc.coursId, horaireId: gc.horaireId };
    store.infoCours = { id: gc.coursId, groupe: modeCours ? null : gc.groupeNum, _groupeCoursId: gc.id };
    return store;
}

// ─────────────────────────────────────────────────────────────────────────────
describe('A · dans un service, les élèves appartiennent par le service — quel que soit leur numéro de groupe', () => {
    it('trois groupes hétérogènes (00001, 00007, vide) : les trois sont rendus par obtenirEtudiantsCoursActif', () => {
        const win = monterModes(activer(trimestre(), 'GC_S'));
        expect(das(win.obtenirEtudiantsCoursActif())).toEqual(['S0', 'S1', 'S7']);
    });
    it('et par obtenirDonneesSelonMode(\'groupeEtudiants\') — le second site de la consigne', () => {
        const win = monterModes(activer(trimestre(), 'GC_S'));
        expect(das(win.obtenirDonneesSelonMode('groupeEtudiants'))).toEqual(['S0', 'S1', 'S7']);
    });
    it('une fiche sans coursId n\'est pas celle du service, même au groupe 00001 (un service n\'a pas d\'historique)', () => {
        const win = monterModes(activer(trimestre(), 'GC_S'));
        expect(das(win.obtenirEtudiantsCoursActif())).not.toContain('H1');
        expect(das(win.obtenirDonneesSelonMode('groupeEtudiants'))).not.toContain('H1');
        expect(das(win.obtenirEtudiantsCoursActif())).not.toContain('H0');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('B · hors service, RIEN ne change — valeurs de 1.135.0 figées', () => {
    it('groupe-cours ordinaire 00007 : les deux formats au groupe 00007, plus l\'ancien format sans groupe — pas le 00008', () => {
        const win = monterModes(activer(trimestre(), 'GC_7'));
        expect(das(win.obtenirEtudiantsCoursActif())).toEqual(['A7', 'H0', 'H7']);
        // Le second site : le filtre de groupe ne s'y applique qu'aux fiches SANS coursId (1.135.0 tel quel).
        expect(das(win.obtenirDonneesSelonMode('groupeEtudiants'))).toEqual(['A7', 'B8', 'H0', 'H7']);
    });
    it('groupe-cours ordinaire 00008 : symétrique', () => {
        const win = monterModes(activer(trimestre(), 'GC_8'));
        expect(das(win.obtenirEtudiantsCoursActif())).toEqual(['B8', 'H0', 'H8']);
    });
    it('mode cours (tous groupes) : tous les élèves du cours, et tous les anciens formats', () => {
        const win = monterModes(activer(trimestre(), 'GC_7', true));
        expect(das(win.obtenirEtudiantsCoursActif())).toEqual(['A7', 'B8', 'H0', 'H1', 'H7', 'H8']);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('C · un service et un cours ordinaire dans le même trimestre ne se voient pas', () => {
    it('depuis le cours ordinaire, aucun élève du service ; depuis le service, aucun du cours', () => {
        const ordinaire = das(monterModes(activer(trimestre(), 'GC_7', true)).obtenirEtudiantsCoursActif());
        expect(ordinaire.filter(d => d.startsWith('S'))).toEqual([]);
        const service = das(monterModes(activer(trimestre(), 'GC_S')).obtenirEtudiantsCoursActif());
        expect(service.filter(d => !d.startsWith('S'))).toEqual([]);
    });
});

// ─── rencontres.js réel, lecture Omnivox réelle (patron de la sentinelle #834 trois questions) ───
function monterRencontres(store, opts = {}) {
    const journal = []; const notifs = [];
    const elements = {};
    const document = fauxDocument(elements);
    Object.entries(opts.valeurs || {}).forEach(([id, v]) => { document.getElementById(id).value = v; });
    const db = dbBanc(store, journal);
    let n = 0;
    const win = { addEventListener() {} };
    const winEtud = { addEventListener() {} };
    chargerScript('js/trimestre-v2-etudiants.js', { document: fauxDocument({}), db, cle, notifications: { succes() {}, erreur() {} }, normaliserNumeroGroupe: (g) => String(g || '').padStart(5, '0'), echapperHtml: (s) => String(s == null ? '' : s), alert() {}, confirm: () => true, setTimeout: () => 0 }, winEtud);
    const base = {
        document, db, cle, echapperHtml: (s) => String(s == null ? '' : s), genererIdUnique: (p) => p + 'X' + (++n),
        notifications: { succes(t, m) { notifs.push({ type: 'succes', t, m }); }, erreur(t, m) { notifs.push({ type: 'erreur', t, m }); }, warning(t, m) { notifs.push({ type: 'warning', t, m }); } },
        decouperLigneCollee: winEtud.decouperLigneCollee, analyserListeEtudiantsCollee: winEtud.analyserListeEtudiantsCollee,
        obtenirTrimestreActif: () => (store.trimestres || []).find(t => t.actif) || null,
        genererCalendrierComplet() {},
        CoursEntite: { creer: async (d) => { const c = Object.assign({ id: 'COURS_S' + (++n) }, d, { codeCours: '' }); store.cours = (store.cours || []).concat([c]); return c; } },
        changerGroupeCoursActifV2: async () => {},
        contexteActifEstService: () => true, definirVocabulaireInterventions() {}, afficherListeInterventions() {}, estEnModeDemo: () => false,
    };
    chargerScript('js/rencontres.js', base, win);
    return { win, store, journal, notifs, elements };
}
const OMNIVOX_00007 = '="9800002";="00007";="Gagnon";="Noah";="241.A0";';
const storeTrimestreActif = () => ({ trimestres: [{ id: 'a2026', nom: 'A 2026', actif: true }], test_groupeEtudiants: [], test_groupesCours: [], cours: [] });

describe('D · à l\'écriture, toute fiche d\'un service porte le groupe du service', () => {
    it('la ligne Omnivox lue « 00007 » donne une fiche au groupe 00001, comme les autres formes', () => {
        const b = monterRencontres({});
        const { fiches, refusees } = b.win.analyserListeEleves('9800001 ; Tremblay ; Léa\n' + OMNIVOX_00007 + '\nEmma Roy');
        expect(refusees).toEqual([]);
        expect(fiches.map(f => f.nom + ':' + f.groupe)).toEqual(['Tremblay:00001', 'Gagnon:00001', 'Roy:00001']);
        expect(fiches[1].programme).toBe('241.A0'); // la lecture Omnivox garde le reste
    });
    it('« Créer mon service » écrit 00001 sur les trois fiches et sur le groupe-cours', async () => {
        const b = monterRencontres(storeTrimestreActif(), { valeurs: { 'rencontres-nomService': 'Aide', 'rencontres-eleves': '9800001 ; Tremblay ; Léa\n' + OMNIVOX_00007 + '\nEmma Roy' } });
        await b.win.creerMonService();
        expect(b.store.test_groupeEtudiants.map(e => e.groupe)).toEqual(['00001', '00001', '00001']);
        expect(b.store.test_groupeEtudiants.map(e => e.coursId)).toEqual(['COURS_S1', 'COURS_S1', 'COURS_S1']);
        expect(b.store.test_groupesCours[0].groupeNum).toBe('00001');
        expect(b.notifs.map(n => n.type)).toEqual(['succes']);
    });
});

describe('E · lot B — une ligne illisible est refusée et nommée, jamais un élève fantôme', () => {
    const TROIS_EN_UNE = 'Léa Tremblay, 1234567, Gagnon, 00007, Noah, Emma Roy';
    it('trois lignes collées en une : zéro fiche, un refus qui dit la ligne et le motif', () => {
        const b = monterRencontres({});
        const { fiches, refusees } = b.win.analyserListeEleves(TROIS_EN_UNE);
        expect(fiches).toEqual([]);
        expect(refusees).toEqual([{ numero: 1, texte: TROIS_EN_UNE, motif: 'ne commence pas par un numéro de DA' }]);
    });
    it('une ligne Omnivox sans nom après le DA est refusée aussi ; les lignes valides passent', () => {
        const b = monterRencontres({});
        const { fiches, refusees } = b.win.analyserListeEleves('Emma Roy\n="9800009";="00007";="";="";\n' + TROIS_EN_UNE);
        expect(fiches.map(f => f.nom)).toEqual(['Roy']);
        expect(refusees.map(r => r.numero + ':' + r.motif)).toEqual(['2:aucun nom après le numéro de DA', '3:ne commence pas par un numéro de DA']);
    });
    it('aucune ligne valide : le service ne se crée pas, rien n\'est écrit, la ligne est nommée', async () => {
        const b = monterRencontres(storeTrimestreActif(), { valeurs: { 'rencontres-nomService': 'Aide', 'rencontres-eleves': TROIS_EN_UNE } });
        await b.win.creerMonService();
        expect(b.journal).toEqual([]);
        expect(b.store.cours).toEqual([]);
        expect(b.notifs.length).toBe(1);
        expect(b.notifs[0].type).toBe('erreur');
        expect(b.notifs[0].t).toBe('Une ligne n\'a pas pu être lue');
        expect(b.notifs[0].m).toContain('Ligne 1 (« Léa Tremblay, 1234567, Gagnon, 00007, No… ») : ne commence pas par un numéro de DA.');
        expect(b.notifs[0].m).toContain('Une ligne par élève');
    });
    it('des lignes valides et une illisible : le service se crée avec les valides, et la refusée est nommée en avertissement', async () => {
        const b = monterRencontres(storeTrimestreActif(), { valeurs: { 'rencontres-nomService': 'Aide', 'rencontres-eleves': '9800001 ; Tremblay ; Léa\n' + TROIS_EN_UNE + '\nEmma Roy' } });
        await b.win.creerMonService();
        expect(b.store.test_groupeEtudiants.map(e => e.nom)).toEqual(['Tremblay', 'Roy']);
        expect(b.notifs.map(n => n.type)).toEqual(['succes', 'warning']);
        expect(b.notifs[1].t).toBe('Une ligne n\'a pas pu être lue');
        expect(b.notifs[1].m).toContain('Ligne 2 (');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// JOURNAL DES BREAK-TESTS — 12 septembre 2026 (Toronto). Chaque mutation appliquée au code de
// js/, la suite relancée, le fichier restauré à empreinte SHA-256 identique.
//   1. modes.js : la garde de service retirée du nouveau format (goulot)            → 1 rouge  (A1)
//   2. modes.js : `estService` forcé faux dans le goulot                             → 1 rouge  (A1)
//   3. modes.js : garde d'obtenirDonneesSelonMode retirée (fiche sans coursId admise) → 2 rouges (A2, A3)
//   4. modes.js : `estService` forcé VRAI dans le goulot (tout contexte = service)   → 3 rouges (B1, B2, C) ← le verrou
//   5. rencontres.js : le groupe Omnivox conservé par le lecteur                     → 1 rouge  (D1)
//   6. rencontres.js : la création écrit `f.groupe || '00001'` au lieu du service    → 0 rouge  — D1 le couvre ;
//      doublure d'écriture demandée par la consigne (§ 2, complément), gardée et NOMMÉE ici
//   7. rencontres.js : la ligne sans DA confiée au lecteur Omnivox                    → 4 rouges (E1-E4)
//   8. rencontres.js : refus muet quand des lignes valides existent                  → 1 rouge  (E4)
//   Une garde « fiche sans coursId » posée AUSSI dans le goulot rendait 0 rouge : elle était
//   inatteignable (le goulot lit `obtenirDonneesSelonMode`, qui l'a déjà écartée) — retirée.
// 13/13 verts une fois restauré.
