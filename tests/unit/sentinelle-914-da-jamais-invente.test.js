import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';
import { tranche } from './_helpers/tranche.js';

// SENTINELLE #914 — L'APPLICATION N'INVENTE PLUS DE DA (règle de Grégoire, 17 sept. 2026 au soir)
//
// « Aucune DA ne devrait être inventé de toute pièce dans l'application. Il n'existe qu'un seul
// format, et c'est celui créé par le collège » : sept chiffres, rien d'autre.
//
// Avant : Cadre › Groupe d'étudiant·es, un DA laissé vide devenait `DA` + horodatage, en silence.
// En édition, un DA effacé à l'écran recevait lui aussi un DA inventé, et la fusion l'écrivait sur
// la fiche : l'élève changeait d'identifiant et perdait ses évaluations et ses présences.
//
// VERROUILLÉ ICI :
//   A. ajout, DA vide → refus nommé, rien d'écrit, aucun succès annoncé ;
//   B. ajout, « 123456 », « 12345678 », « DA1234567 », « 123 4567 » → refus, rien d'écrit ;
//   C. ajout, « 1234567 » → accepté ; les espaces en tête et en fin sont retirés avant de juger ;
//   D. édition d'un élève « DEMO015 » SANS toucher au DA → enregistrée, DA gardé tel quel
//      (le pack démo porte des « DEMO### » : valider à chaque enregistrement les rendrait
//      inmodifiables) ;
//   E. édition qui EFFACE le DA → refusée, fiche intacte ; édition qui le change pour un DA non
//      conforme → refusée ; pour sept chiffres → acceptée ;
//   F. plus aucun repli `Date.now()` dans la fonction ; le champ porte le clavier chiffré ;
//   G. un DA du stock porteur d'une espace, édité sans y toucher, garde son identifiant exact.
//
// BREAK-TESTS — journal en fin de fichier.

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lire = (rel) => readFileSync(path.join(RACINE, rel), 'utf8');
const clone = (x) => JSON.parse(JSON.stringify(x));
const echapperHtml = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function element(id) {
    let html = '';
    return {
        id, children: [], textContent: '', style: {}, dataset: {}, value: '',
        classList: { add() {}, remove() {}, contains() { return false; }, toggle() {} },
        get innerHTML() { return html; }, set innerHTML(v) { html = String(v); this.children = []; },
        appendChild(c) { this.children.push(c); return c; }, focus() {}, addEventListener() {}, scrollIntoView() {},
        setAttribute() {}, querySelector() { return null; }, querySelectorAll() { return []; },
    };
}

// La VRAIE normalisation, tirée de modes.js (même patron que le banc #872).
function normaliserNumeroGroupeReel() {
    const m = lire('js/modes.js').match(/function normaliserNumeroGroupe\(g\) \{[\s\S]*?\n\}/);
    if (!m) throw new Error('normaliserNumeroGroupe introuvable dans js/modes.js');
    // eslint-disable-next-line no-new-func
    return new Function(m[0] + '\nreturn normaliserNumeroGroupe;')();
}

function monter(store) {
    const cle = (k) => 'test_' + k;
    const ecritures = [];
    const db = {
        getSync: (k, d) => (k in store ? clone(store[k]) : (d !== undefined ? d : null)),
        setSync: (k, v) => { store[k] = clone(v); ecritures.push(k); },
        get: async (k, d) => (k in store ? clone(store[k]) : (d !== undefined ? d : null)),
        set: async (k, v) => { store[k] = clone(v); ecritures.push(k); },
        async modifier(k, mutateur, defaut = null) { const v = await this.get(k, defaut); const r = await mutateur(v); if (r === undefined) return undefined; await this.set(k, r); return r; },
    };
    const elements = {};
    const document = {
        getElementById: (id) => (elements[id] || (elements[id] = element(id))),
        createElement: () => element(null),
        querySelector: () => null, querySelectorAll: () => [], addEventListener() {},
        documentElement: element('html'), body: element('body'), readyState: 'complete',
    };
    const notifs = [];
    const globaux = {
        document, db, cle, echapperHtml,
        normaliserNumeroGroupe: normaliserNumeroGroupeReel(),
        notifications: { succes(t, m) { notifs.push({ type: 'succes', t, m }); }, erreur(t, m) { notifs.push({ type: 'erreur', t, m }); }, info() {}, warning() {} },
        prompt: () => null, alert() {}, confirm: () => true, toggleDisplay() {},
    };
    // Lot E2 (28 sept. 2026, D3) : un refus parle par le témoin commun ; rangé avec les notifications.
    const win = { addEventListener() {}, cle, db,
        temoinEnregistrement: { nonEnregistre(raison, geste) { notifs.push({ type: 'nonEnregistre', t: raison, geste }); }, enregistre() {} },
        raisonPourTemoin: (r) => { const t = String(r || '').trim(); const d = t.charAt(0).toLowerCase() + t.slice(1); return /[.!?]$/.test(d) ? d : d + '.'; } };
    chargerScript('js/trimestre-v2-etudiants.js', globaux, win);
    const champ = (id) => document.getElementById(id);
    async function soumettre(da, nom = 'Neuf', prenom = 'Nora') {
        champ('v2-etudiantDA').value = da;
        champ('v2-etudiantNom').value = nom;
        champ('v2-etudiantPrenom').value = prenom;
        await win.soumettreEtudiantV2();
    }
    return { win, store, notifs, ecritures, champ, soumettre };
}

function storeBanc() {
    return {
        infoCours: { id: 'C1', nom: 'Cours banc', groupe: '00001' },
        test_groupeEtudiants: [
            { da: '1000001', nom: 'Aubin', prenom: 'Léa', groupe: '00001', coursId: 'C1', statut: 'actif' },
            { da: 'DEMO015', nom: 'Démo', prenom: 'Quinze', groupe: '00001', coursId: 'C1', isDemo: true },
        ],
    };
}

// ↻ Lot E2 : le refus est dit par le témoin (« Non enregistré – ‹geste› : le DA est manquant : c'est celui du
// collège, sept chiffres… ») ; ramené ici à « DA manquant » / « DA invalide », le texte entier en `m`.
const refusDA = (b) => b.notifs
    .filter(n => n.type === 'nonEnregistre' && /^le DA est (manquant|invalide) : /.test(n.t))
    .map(n => ({ t: 'DA ' + n.t.match(/^le DA est (manquant|invalide)/)[1], m: n.t, geste: n.geste }));
const succes = (b) => b.notifs.filter(n => n.type === 'succes');

describe('#914 — l\'application n\'invente plus de DA', () => {
    it('A. ajout, DA vide : refus nommé « DA manquant », rien d\'écrit, aucun succès', async () => {
        const store = storeBanc();
        const avant = clone(store.test_groupeEtudiants);
        const b = monter(store);
        await b.soumettre('');
        expect(store.test_groupeEtudiants).toEqual(avant);
        expect(b.ecritures.filter(k => k === 'test_groupeEtudiants')).toEqual([]);
        expect(refusDA(b).map(n => n.t)).toEqual(['DA manquant']);
        expect(refusDA(b)[0].m).toMatch(/sept chiffres/);
        expect(succes(b)).toEqual([]);
        // Et surtout : aucune fiche ne porte un identifiant fabriqué.
        expect(store.test_groupeEtudiants.some(e => /^DA\d{10,}$/.test(String(e.da)))).toBe(false);
    });

    it('A bis. un DA fait d\'espaces seulement est un DA vide', async () => {
        const store = storeBanc();
        const b = monter(store);
        await b.soumettre('   ');
        expect(store.test_groupeEtudiants.length).toBe(2);
        expect(refusDA(b).map(n => n.t)).toEqual(['DA manquant']);
    });

    for (const da of ['123456', '12345678', 'DA1234567', '123 4567', '12345a7', '١٢٣٤٥٦٧']) {
        it('B. ajout, « ' + da + ' » : refus « DA invalide », rien d\'écrit', async () => {
            const store = storeBanc();
            const avant = clone(store.test_groupeEtudiants);
            const b = monter(store);
            await b.soumettre(da);
            expect(store.test_groupeEtudiants).toEqual(avant);
            expect(b.ecritures.filter(k => k === 'test_groupeEtudiants')).toEqual([]);
            expect(refusDA(b).map(n => n.t)).toEqual(['DA invalide']);
            expect(succes(b)).toEqual([]);
        });
    }

    it('C. ajout, « 1234567 » : accepté ; «  7654321  » : accepté, écrit sans ses espaces', async () => {
        const store = storeBanc();
        const b = monter(store);
        await b.soumettre('1234567');
        await b.soumettre('  7654321  ', 'Autre', 'Omar');
        expect(store.test_groupeEtudiants.map(e => e.da)).toEqual(['1000001', 'DEMO015', '1234567', '7654321']);
        expect(refusDA(b)).toEqual([]);
        expect(succes(b).length).toBe(2);
    });

    it('C bis. la garde du doublon passe APRÈS : un DA conforme déjà présent reçoit son message à elle', async () => {
        const store = storeBanc();
        const b = monter(store);
        await b.soumettre('1000001');
        expect(store.test_groupeEtudiants.length).toBe(2);
        expect(refusDA(b)).toEqual([]);
        expect(b.notifs.some(n => n.type === 'nonEnregistre' && /^ce DA est déjà dans le groupe/.test(n.t))).toBe(true);
    });

    it('D. édition d\'un élève « DEMO015 » sans toucher au DA : enregistrée, DA gardé tel quel', async () => {
        const store = storeBanc();
        const b = monter(store);
        b.win.editerEtudiantV2('DEMO015');
        expect(b.champ('v2-etudiantDA').value).toBe('DEMO015');
        b.champ('v2-etudiantNom').value = 'Démo-corrigé';
        await b.win.soumettreEtudiantV2();
        const fiche = store.test_groupeEtudiants.find(e => e.da === 'DEMO015');
        expect(fiche && fiche.nom).toBe('Démo-corrigé');
        expect(fiche.isDemo).toBe(true);                       // la fusion garde les champs hors formulaire
        expect(store.test_groupeEtudiants.length).toBe(2);
        expect(refusDA(b)).toEqual([]);
        expect(succes(b).length).toBe(0);   // lot E2 : une modification ne dit que « Enregistré » (le témoin)
    });

    // Lot E2 (décision de Grégoire, 28 sept. 2026) : le DA d'une fiche existante ne se modifie plus —
    // champ en lecture seule, et l'écrivain ne le lit pas en édition. Effacé ou changé à l'écran, il ne
    // bouge pas en base ; les autres champs s'écrivent (la fiche « DEMO015 » reste modifiable).
    it('E. édition qui EFFACE le DA : le DA reste, l\'élève garde son identifiant', async () => {
        const store = storeBanc();
        const b = monter(store);
        b.win.editerEtudiantV2('1000001');
        b.champ('v2-etudiantDA').value = '';
        b.champ('v2-etudiantNom').value = 'Nom-corrigé';
        await b.win.soumettreEtudiantV2();
        expect(store.test_groupeEtudiants.map(e => e.da)).toEqual(['1000001', 'DEMO015']);
        expect(store.test_groupeEtudiants[0].nom).toBe('Nom-corrigé');
        expect(refusDA(b)).toEqual([]);
    });

    it('E bis. édition qui CHANGE le DA (non conforme ou sept chiffres) : le DA de la fiche reste', async () => {
        const store = storeBanc();
        const b = monter(store);
        b.win.editerEtudiantV2('DEMO015');
        for (const saisi of ['DEMO016', '2000015']) {
            b.champ('v2-etudiantDA').value = saisi;
            await b.win.soumettreEtudiantV2();
            expect(store.test_groupeEtudiants.map(e => e.da)).toEqual(['1000001', 'DEMO015']);
        }
        expect(refusDA(b)).toEqual([]);
        expect(succes(b).length).toBe(0);   // lot E2 : une modification ne dit que « Enregistré » (le témoin)
    });

    it('G. stock d\'avant : un DA porteur d\'une espace, édité sans y toucher, garde son identifiant EXACT', async () => {
        const store = storeBanc();
        store.test_groupeEtudiants.push({ da: ' 1000003', nom: 'Espace', prenom: 'Eve', groupe: '00001', coursId: 'C1' });
        const b = monter(store);
        b.win.editerEtudiantV2(' 1000003');
        b.champ('v2-etudiantNom').value = 'Espace-corrigé';
        await b.win.soumettreEtudiantV2();
        // Les évaluations et les présences sont rattachées à « ␠1000003 » : le réécrire sans l'espace les orphelinerait.
        expect(store.test_groupeEtudiants.map(e => e.da)).toEqual(['1000001', 'DEMO015', ' 1000003']);
        expect(store.test_groupeEtudiants[2].nom).toBe('Espace-corrigé');
        expect(refusDA(b)).toEqual([]);
    });

    it('F. plus aucun repli sur l\'horloge dans soumettreEtudiantV2 ; le champ porte le clavier chiffré', () => {
        const source = lire('js/trimestre-v2-etudiants.js');
        const fonction = tranche(source, 'async function soumettreEtudiantV2()', 'function editerEtudiantV2(');
        expect(fonction.length).toBeGreaterThan(500);
        expect(fonction).not.toMatch(/Date\.now\(\)/);
        expect(fonction).toMatch(/\\d\{7\}/);
        const html = lire('index.html');
        const champ = html.match(/<input[^>]*id="v2-etudiantDA"[^>]*>/);
        expect(champ).not.toBeNull();
        expect(champ[0]).toMatch(/inputmode="numeric"/);
    });
});

// BREAK-TESTS VÉRIFIÉS le 19 septembre 2026 — une mutation à la fois dans js/trimestre-v2-etudiants.js,
// `node --check` avant lecture, restauration par copie, empreinte vérifiée. 6 mutations / 6 rouges.
//   M1. la garde retirée (`if (false)`) ........................ A, A bis, B ×6, E, E bis, F rouges ; banc WebKit rouge
//   M2. la garde appliquée aussi en édition inchangée .......... D rouge (l'élève « DEMO015 ») ; banc WebKit rouge
//   M3. l'ancien repli `DA${Date.now()}` remis, garde en place . F rouge SEUL : la garde rend le repli inatteignable,
//       il n'y a aucun comportement à observer — F est une preuve textuelle, et c'est dit.
//   M4. en édition inchangée, le DA saisi au lieu du DA d'origine  G rouge
//   M5. `^\d{7}` sans ancre de fin .............................. B « 12345678 » rouge
//   M6. `\d{7}$` sans ancre de tête ............................. B « 12345678 » et « DA1234567 » rouges
// Au premier jet, sur le code d'avant : 11 rouges, 3 verts (C, C bis, D — les témoins, déjà vrais).
