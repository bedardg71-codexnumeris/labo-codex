import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

// SENTINELLE #834 — LOT C DU CADRAGE « RENCONTRES » (12 sept. 2026) : LES TROIS QUESTIONS.
//
// Lundi 14, l'orthopédagogue ouvre l'application, répond à trois questions, et tient ses
// rencontres dedans. Ce fichier verrouille le chemin qu'elle prendra, sur un poste VIDE :
//   1. la lecture de sa liste d'élèves — « Prénom Nom », « DA ; Nom ; Prénom », « DA Prénom Nom »,
//      la ligne Omnivox collée telle quelle (lecture partagée avec Cadre › Trimestre), les lignes
//      vides ignorées, un DA provisoire à sept chiffres (« 9… ») quand la liste n'en donne pas ;
//   2. « Créer mon service » crée ce que le magasin exige et rien d'autre : un trimestre s'il n'en
//      existe aucun (id dérivé des dates, cadre écrit, calendrier généré), un cours de nature
//      « service » avec le seul nom, les élèves dans la liste du trimestre (un DA déjà présent
//      n'est pas dupliqué), un groupe-cours SANS horaire — puis l'activation du groupe-cours ;
//   3. avec un trimestre actif, aucun trimestre n'est créé ; sans nom ou sans élève, RIEN n'est écrit ;
//   4. `afficherRencontres` montre les trois questions sans trimestre ou sans contexte ; sur un
//      groupe-cours ORDINAIRE, la porte seulement (créer un service, ou activer celui du trimestre —
//      tranché par Grégoire le 12 sept. : « Rencontres » ne liste que les services) ; la liste
//      (vocabulaire « rencontres ») seulement sur un service actif.
//
// BREAK-TESTS VÉRIFIÉS le 11 septembre 2026 au soir — journal en fin de fichier.

const clone = (x) => JSON.parse(JSON.stringify(x));
const cle = (k) => (String(k).startsWith('test_') ? k : 'test_' + k);
function classList() { const s = new Set(); return { add(c) { s.add(c); }, remove(c) { s.delete(c); }, contains(c) { return s.has(c); }, toggle(c, f) { const v = f === undefined ? !s.has(c) : !!f; v ? s.add(c) : s.delete(c); return v; } }; }
function elementDom(id) {
    return { id, _html: '', textContent: '', value: '', style: {}, classList: classList(), get innerHTML() { return this._html; }, set innerHTML(v) { this._html = v; }, focus() {}, querySelector() { return null; }, querySelectorAll() { return []; } };
}
function fauxDocument(elements) {
    return { getElementById: (id) => (elements[id] || (elements[id] = elementDom(id))), querySelector: () => null, querySelectorAll: () => [], addEventListener() {}, body: elementDom('body'), documentElement: {} };
}
function dbBanc(store, journal) {
    return {
        getSync: (k, d) => (k in store ? clone(store[k]) : (d !== undefined ? d : null)),
        setSync: (k, v) => { store[k] = clone(v); journal.push(k); },
        get: async (k, d) => (k in store ? clone(store[k]) : (d !== undefined ? d : null)),
        set: async (k, v) => { store[k] = clone(v); journal.push(k); },
        modifier: async (k, f, d) => { store[k] = clone(f(k in store ? clone(store[k]) : d)); journal.push(k); },
    };
}

function monter(store, opts = {}) {
    const journal = []; const appels = { activations: [], notifs: [], vocabulaire: [], listes: 0, trimestresCrees: [], trimestresActives: [], calendriers: 0 };
    const elements = {};
    const document = fauxDocument(elements);
    Object.entries(opts.valeurs || {}).forEach(([id, v]) => { document.getElementById(id).value = v; });
    const db = dbBanc(store, journal);
    let n = 0;
    const win = { addEventListener() {} };
    // La lecture Omnivox partagée : le vrai module, monté à côté.
    const winEtud = { addEventListener() {} };
    chargerScript('js/trimestre-v2-etudiants.js', { document: fauxDocument({}), db, cle, notifications: { succes() {}, erreur() {} }, normaliserNumeroGroupe: (g) => String(g || '').padStart(5, '0'), echapperHtml: (s) => String(s == null ? '' : s), alert() {}, confirm: () => true, setTimeout: () => 0 }, winEtud);
    const base = {
        document, db, cle, echapperHtml: (s) => String(s == null ? '' : s), genererIdUnique: (p) => p + 'X' + (++n),
        notifications: { succes(t, m) { appels.notifs.push({ type: 'succes', t, m }); }, erreur(t, m) { appels.notifs.push({ type: 'erreur', t, m }); } },
        decouperLigneCollee: winEtud.decouperLigneCollee, analyserListeEtudiantsCollee: winEtud.analyserListeEtudiantsCollee,
        obtenirTrimestreActif: () => (store.trimestres || []).find(t => t.actif) || null,
        creerTrimestre: (session, annee, actif) => { const t = { id: session.toLowerCase() + annee, nom: session + ' ' + annee, session, annee, actif: !!actif }; store.trimestres = (store.trimestres || []).map(x => Object.assign({}, x, { actif: false })).concat([t]); appels.trimestresCrees.push(t.id); return t; },
        changerTrimestreActif: (id) => { appels.trimestresActives.push(id); (store.trimestres || []).forEach(t => t.actif = t.id === id); store.trimestreActif = id; return true; },
        genererCalendrierComplet: () => { appels.calendriers++; },
        CoursEntite: { creer: async (d) => { const c = Object.assign({ id: 'COURS_S' + (++n) }, d, { codeCours: '' }); store.cours = (store.cours || []).concat([c]); return c; } },
        changerGroupeCoursActifV2: async (id) => { appels.activations.push(id); const gc = (store.test_groupesCours || []).find(g => g.id === id); if (gc) store.infoCours = { id: gc.coursId, _groupeCoursId: gc.id, groupe: gc.groupeNum }; },
        contexteActifEstService: () => { const info = store.infoCours; const c = info && (store.cours || []).find(x => x.id === info.id); return !!c && c.nature === 'service'; },
        definirVocabulaireInterventions: (v) => { appels.vocabulaire.push(v); },
        afficherListeInterventions: () => { appels.listes++; },
        estEnModeDemo: () => !!opts.demo,
    };
    chargerScript('js/rencontres.js', base, win);
    return { win, store, journal, appels, elements };
}

describe('#834 lot C · la lecture de la liste d\'élèves', () => {
    it('quatre formes de ligne, les vides ignorées, un DA provisoire quand il manque', () => {
        const b = monter({});
        const { fiches } = b.win.analyserListeEleves('Léa Tremblay\n1234567 ; Gagnon ; Noah\n\n2345678\t00001\tRoy\tEmma\t200.B1\n3456789 Marc-Antoine Côté-Lévesque\nDubois, Ali\n   \n');
        expect(fiches.map(f => f.prenom + ' ' + f.nom)).toEqual(['Léa Tremblay', 'Noah Gagnon', 'Emma Roy', 'Marc-Antoine Côté-Lévesque', 'Ali Dubois']);
        expect(fiches.map(f => f.da).slice(1, 4)).toEqual(['1234567', '2345678', '3456789']);
        expect(fiches[0].daProvisoire).toBe(true);
        expect(fiches[0].da).toMatch(/^9\d{6}$/);
        expect(fiches[4].daProvisoire).toBe(true);
        expect(fiches[0].da).not.toBe(fiches[4].da);
        expect(fiches.every(f => f.groupe === '00001')).toBe(true);
        // La ligne Omnivox est lue par la lecture partagée : programme et SA conservés.
        expect(fiches[2].programme).toBe('200.B1');
        expect(fiches[2].daProvisoire).toBe(false);
    });
    it('rien n\'est inventé d\'une ligne sans nom', () => {
        const b = monter({});
        expect(b.win.analyserListeEleves('\n;\n')).toEqual({ fiches: [], refusees: [] });
    });
});

describe('#834 lot C · « Créer mon service » sur un poste vide', () => {
    const valeurs = { 'rencontres-dateDebut': '2026-08-24', 'rencontres-dateFin': '2026-12-18', 'rencontres-nomService': 'Aide à la réussite', 'rencontres-eleves': 'Léa Tremblay\n1234567 ; Gagnon ; Noah\n1234567 ; Gagnon ; Noah' };
    it('trimestre a2026 créé et activé, cadre écrit, calendrier généré ; service ; élèves (DA en double ignoré) ; groupe-cours sans horaire ; activation', async () => {
        const b = monter({ trimestres: [], cours: [], enseignants: [{ id: 'ENS1' }] }, { valeurs });
        await b.win.creerMonService();
        expect(b.appels.notifs.filter(x => x.type === 'erreur')).toEqual([]);
        expect(b.appels.trimestresCrees).toEqual(['a2026']);
        expect(b.appels.trimestresActives).toEqual(['a2026']);
        expect(b.store.test_cadreCalendrier).toMatchObject({ dateDebut: '2026-08-24', finCours: '2026-12-18', finTrimestre: '2026-12-18' });
        expect(b.appels.calendriers).toBe(1);
        expect(b.store.cours.map(c => [c.nature, c.nomCours, c.codeCours])).toEqual([['service', 'Aide à la réussite', '']]);
        const service = b.store.cours[0];
        expect(b.store.test_groupeEtudiants.map(e => e.prenom + ' ' + e.nom)).toEqual(['Léa Tremblay', 'Noah Gagnon']);
        expect(b.store.test_groupeEtudiants.every(e => e.coursId === service.id && e.groupe === '00001')).toBe(true);
        expect(b.store.test_groupesCours.length).toBe(1);
        const gc = b.store.test_groupesCours[0];
        expect(gc.coursId).toBe(service.id);
        expect(gc.horaireId).toBeNull();
        expect(gc.groupeNum).toBe('00001');
        expect(gc.enseignantId).toBe('ENS1');
        expect(gc.trimestreId).toBe('a2026');
        expect(b.appels.activations).toEqual([gc.id]);
        expect(b.appels.notifs.some(x => x.type === 'succes' && /Service d’orthopédagogie créé/.test(x.t) && /1 déjà présent/.test(x.m))).toBe(true);
    });
    it('en DÉMONSTRATION : le service (clé globale `cours`) est marqué pour être retiré à la désactivation ; hors démo, aucun marqueur', async () => {
        const v = { 'rencontres-nomService': 'Aide', 'rencontres-eleves': 'Léa Tremblay' };
        const demo = monter({ trimestres: [{ id: 'demo', nom: 'Démonstration', actif: true, isDemo: true }], cours: [] }, { valeurs: v, demo: true });
        await demo.win.creerMonService();
        expect(demo.store.cours[0]).toMatchObject({ nature: 'service', isDemo: true, creeEnDemonstration: true });
        const reel = monter({ trimestres: [{ id: 'a2026', actif: true }], cours: [] }, { valeurs: v });
        await reel.win.creerMonService();
        expect(reel.store.cours[0].isDemo).toBeUndefined();
        expect(reel.store.cours[0].creeEnDemonstration).toBeUndefined();
        // Et la désactivation de la démo sait retirer ce marqueur (demo-activation.js) — verrou de source.
        const src = readFileSync(path.join(RACINE, 'js', 'demo-activation.js'), 'utf8');
        expect(src).toMatch(/c\.creeEnDemonstration === true\) && estItemDemo\(c\)/);
    });
    it('avec un trimestre actif, aucun trimestre n\'est créé ni activé ; le service y entre', async () => {
        const b = monter({ trimestres: [{ id: 'h2027', nom: 'Hiver 2027', actif: true }], cours: [], enseignants: [] }, { valeurs: { 'rencontres-nomService': 'Aide', 'rencontres-eleves': 'Léa Tremblay' } });
        await b.win.creerMonService();
        expect(b.appels.trimestresCrees).toEqual([]);
        expect(b.appels.trimestresActives).toEqual([]);
        expect(b.store.test_groupesCours[0].trimestreId).toBe('h2027');
        expect(b.store.test_groupesCours[0].enseignantId).toBe('profil');
    });
    it('sans nom, ou sans élève, ou sans dates sur un poste vide : refusé, rien n\'est écrit', async () => {
        for (const v of [
            { 'rencontres-nomService': '', 'rencontres-eleves': 'Léa Tremblay', 'rencontres-dateDebut': '2026-08-24', 'rencontres-dateFin': '2026-12-18' },
            { 'rencontres-nomService': 'Aide', 'rencontres-eleves': '', 'rencontres-dateDebut': '2026-08-24', 'rencontres-dateFin': '2026-12-18' },
            { 'rencontres-nomService': 'Aide', 'rencontres-eleves': 'Léa Tremblay', 'rencontres-dateDebut': '', 'rencontres-dateFin': '' },
            { 'rencontres-nomService': 'Aide', 'rencontres-eleves': 'Léa Tremblay', 'rencontres-dateDebut': '2026-12-18', 'rencontres-dateFin': '2026-08-24' },
        ]) {
            const b = monter({ trimestres: [], cours: [] }, { valeurs: v });
            await b.win.creerMonService();
            expect(b.appels.notifs.some(x => x.type === 'erreur')).toBe(true);
            expect(b.journal).toEqual([]);
            expect(b.store.cours).toEqual([]);
            expect(b.appels.trimestresCrees).toEqual([]);
        }
    });
});

describe('#834 lot C · ce que montre le sous-onglet', () => {
    it('sans trimestre : les trois questions, avec les dates ; sans contexte : les trois questions, sans les dates', () => {
        const a = monter({ trimestres: [] });
        a.win.afficherRencontres();
        expect(a.elements.conteneurRencontres.innerHTML).toContain('Créer mon service');
        expect(a.elements.conteneurRencontres.innerHTML).toContain('rencontres-dateDebut');
        const b = monter({ trimestres: [{ id: 'a2026', nom: 'Automne 2026', actif: true }], infoCours: null });
        b.win.afficherRencontres();
        expect(b.elements.conteneurRencontres.innerHTML).toContain('Créer mon service');
        expect(b.elements.conteneurRencontres.innerHTML).not.toContain('rencontres-dateDebut');
        expect(b.appels.listes).toBe(0);
    });
    it('avec un service actif : la liste, vocabulaire « rencontres », sans la porte « Créer un service »', () => {
        const b = monter({ trimestres: [{ id: 'a2026', actif: true }], cours: [{ id: 'S1', nature: 'service', nomCours: 'Aide' }], infoCours: { id: 'S1', _groupeCoursId: 'GC1' } });
        b.win.afficherRencontres();
        expect(b.appels.vocabulaire).toEqual(['rencontres']);
        expect(b.appels.listes).toBe(1);
        expect(b.elements.conteneurRencontres.innerHTML).toContain('id="listeRencontres"');
        expect(b.elements.conteneurRencontres.innerHTML).not.toContain('Créer un service');
    });
    it('avec un groupe-cours ordinaire : la PORTE seulement — aucune liste, aucun vocabulaire posé (tranché le 12 sept.)', () => {
        const b = monter({ trimestres: [{ id: 'a2026', actif: true }], cours: [{ id: 'C1', codeCours: '601-101-MQ' }], test_groupesCours: [{ id: 'GC1', coursId: 'C1', trimestreId: 'a2026' }], infoCours: { id: 'C1', _groupeCoursId: 'GC1' } });
        b.win.afficherRencontres();
        expect(b.appels.vocabulaire).toEqual([]);
        expect(b.appels.listes).toBe(0);
        expect(b.elements.conteneurRencontres.innerHTML).not.toContain('id="listeRencontres"');
        expect(b.elements.conteneurRencontres.innerHTML).toContain('Créer un service');
        expect(b.elements.conteneurRencontres.innerHTML).not.toContain('activerServiceRencontres');
    });
    it('avec un groupe-cours ordinaire et un service déjà dans le trimestre : le lien pour l\'activer, et l\'activation mène à la liste', async () => {
        const b = monter({
            trimestres: [{ id: 'a2026', actif: true }],
            cours: [{ id: 'C1', codeCours: '601-101-MQ' }, { id: 'S1', nature: 'service', nomCours: 'Aide à la réussite' }, { id: 'S2', nature: 'service', nomCours: 'Autre trimestre' }],
            test_groupesCours: [{ id: 'GC1', coursId: 'C1', trimestreId: 'a2026' }, { id: 'GC_S1', coursId: 'S1', trimestreId: 'a2026' }, { id: 'GC_S2', coursId: 'S2', trimestreId: 'h2026' }],
            infoCours: { id: 'C1', _groupeCoursId: 'GC1' }
        });
        b.win.afficherRencontres();
        const html = b.elements.conteneurRencontres.innerHTML;
        expect(html).toContain('data-action="activerServiceRencontres" data-param="GC_S1"');
        expect(html).toContain('Aide à la réussite');
        expect(html).not.toContain('GC_S2'); // un service d'un autre trimestre n'est pas offert
        expect(b.appels.listes).toBe(0);
        await b.win.activerServiceRencontres('GC_S1');
        expect(b.appels.activations).toEqual(['GC_S1']);
        expect(b.appels.vocabulaire).toEqual(['rencontres']);
        expect(b.appels.listes).toBe(1);
        expect(b.elements.conteneurRencontres.innerHTML).toContain('id="listeRencontres"');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// JOURNAL DES BREAK-TESTS — 11 septembre 2026, 21 h 30 (Toronto). Mutations sur js/rencontres.js,
// suite relancée, fichier restauré à empreinte SHA-256 identique.
//   1. le groupe-cours du service reçoit un horaire inventé          → 1 rouge
//   2. un DA déjà présent est dupliqué                                → 1 rouge
//   3. un trimestre est créé même s'il en existe un                   → 1 rouge
//   4. le nom du service n'est plus requis                            → 1 rouge
//   5. la liste s'affiche même sans contexte                          → 1 rouge
//   6. « Prénom Nom » lu à l'envers                                   → 2 rouges
//   7. démo : le service créé n'est plus marqué (22 h)                 → 1 rouge
//   8. demo-activation.js : le marqueur n'est plus retiré (verrou)     → 1 rouge
// 9/9 verts une fois restauré.
//
// 12 septembre 2026 (« Rencontres » ne liste que les services, tranché par Grégoire) — js/rencontres.js :
//   9. la liste s'affiche aussi sur un groupe-cours ordinaire (ancien comportement) → 2 rouges
//  10. un service d'un autre trimestre est offert à l'activation                   → 1 rouge
//  11. l'activation n'active rien                                                   → 1 rouge
// 10/10 verts une fois restauré, empreinte identique.
