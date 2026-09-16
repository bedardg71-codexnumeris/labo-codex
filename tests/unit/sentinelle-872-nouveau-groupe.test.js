import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE #872 — CRÉER UN 2e GROUPE D'ÉLÈVES (rapport de Mathieu, 15 sept. 2026)
//
// « J'ai rencontré une difficulté lorsque j'ai voulu ajouter un 2e groupe classe. […] cela ne
// faisait qu'ajouter des élèves à mon premier groupe. »
//
// Mesuré au code le 15 sept. : un groupe n'existe que comme numéro porté par des élèves ; le
// bouton « Nouveau groupe » avait quitté index.html le 9 janv. 2026 (`35e3b17d`) ; et le champ
// Groupe du formulaire, laissé vide ou vidé après chaque ajout, versait l'élève dans le groupe
// du cours actif.
//
// VERROUILLÉ ICI :
//   A. le bouton existe sous le menu Groupe et vise une fonction exportée ;
//   B. le groupe créé RESTE dans le menu (sélectionné, marqué « vide ») — le menu, reconstruit
//      depuis les élèves, le perdait aussitôt ;
//   C. deux ajouts manuels de suite vont dans le nouveau groupe, pas dans le premier ;
//      témoin : sous « Tous les groupes », le champ vide garde l'ancien repli (cours actif) ;
//   D. choisir un groupe dans le menu remplit le champ Groupe — sauf en édition ;
//   E. un numéro non numérique est refusé, rien n'est créé ;
//   F. le groupe vide ne suit pas dans un autre trimestre, et le numéro proposé le saute ;
//   G. l'étape 3 du groupe-cours suit la liste d'élèves (Grégoire, 15 h 50 : après un import,
//      le Cadre voyait le nouveau groupe, l'étape 3 n'offrait que « 00007 (28 étud.) » — et sans
//      groupe à choisir, le groupe-cours ne s'enregistre pas) ; la sélection en cours survit ;
//   H. une ligne d'en-tête n'est pas un élève (réimporter notre export créait le groupe « Groupe »).
//
// ⚠ Le faux <select> est FIDÈLE au DOM sur le point qui compte : une valeur sans option
// correspondante le laisse sur '' (et remplacer ses options le remet sur la première). Un faux
// qui accepterait n'importe quelle valeur rendrait B vert sans le correctif.

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
function selectFidele(id) {
    const el = element(id);
    let html = '';
    let valeur = '';
    const valeursOptions = () => [...html.matchAll(/<option value="([^"]*)"/g)].map(m => m[1])
        .concat(el.children.map(c => String(c.value)));
    Object.defineProperty(el, 'innerHTML', { get() { return html; }, set(v) { html = String(v); el.children = []; valeur = ''; } });
    Object.defineProperty(el, 'options', { get() { return valeursOptions().map(value => ({ value })); } });
    Object.defineProperty(el, 'value', { get() { return valeur; }, set(v) { valeur = valeursOptions().includes(String(v)) ? String(v) : ''; } });
    return el;
}

// La VRAIE normalisation, tirée de modes.js (charger tout modes.js réclame des dizaines de
// globaux sans rapport avec ce lot). Si la fonction change de forme, ce banc rougit ici.
function normaliserNumeroGroupeReel() {
    const m = lire('js/modes.js').match(/function normaliserNumeroGroupe\(g\) \{[\s\S]*?\n\}/);
    if (!m) throw new Error('normaliserNumeroGroupe introuvable dans js/modes.js');
    // eslint-disable-next-line no-new-func
    return new Function(m[0] + '\nreturn normaliserNumeroGroupe;')();
}

function monter(store) {
    const etat = { prefixe: 'test_', reponsePrompt: null, defautsProposes: [] };
    const cle = (k) => etat.prefixe + k;
    const db = {
        getSync: (k, d) => (k in store ? clone(store[k]) : (d !== undefined ? d : null)),
        setSync: (k, v) => { store[k] = clone(v); },
        get: async (k, d) => (k in store ? clone(store[k]) : (d !== undefined ? d : null)),
        set: async (k, v) => { store[k] = clone(v); },
        async modifier(k, mutateur, defaut = null) { const v = await this.get(k, defaut); const r = await mutateur(v); if (r === undefined) return undefined; await this.set(k, r); return r; },
    };
    const elements = {};
    const document = {
        getElementById: (id) => (elements[id] || (elements[id] = ((id === 'v2-selectGroupe' || id === 'v2-gc-groupe') ? selectFidele(id) : element(id)))),
        createElement: () => element(null),
        querySelector: () => null, querySelectorAll: () => [], addEventListener() {},
        documentElement: element('html'), body: element('body'), readyState: 'complete',
    };
    const notifs = [];
    const globaux = {
        document, db, cle, echapperHtml,
        normaliserNumeroGroupe: normaliserNumeroGroupeReel(),
        notifications: { succes(t, m) { notifs.push({ type: 'succes', t, m }); }, erreur(t, m) { notifs.push({ type: 'erreur', t, m }); }, info() {}, warning() {} },
        prompt: (msg, defaut) => { etat.defautsProposes.push(defaut); return etat.reponsePrompt; },
        alert() {}, confirm: () => true, toggleDisplay() {},
    };
    const win = { addEventListener() {}, cle, db };
    chargerScript('js/trimestre-v2-etudiants.js', globaux, win);
    const champ = (id) => document.getElementById(id);
    async function ajouterAuFormulaire(da, nom, prenom) {
        champ('v2-etudiantDA').value = da;
        champ('v2-etudiantNom').value = nom;
        champ('v2-etudiantPrenom').value = prenom;
        await win.soumettreEtudiantV2();
    }
    return { win, store, etat, notifs, champ, ajouterAuFormulaire, document, db, cle, select: () => document.getElementById('v2-selectGroupe') };
}

function storeUnGroupe() {
    return {
        infoCours: { id: 'C1', nom: 'Cours banc', groupe: '00001' },
        test_groupeEtudiants: [
            { da: '1000001', nom: 'Aubin', prenom: 'Léa', groupe: '00001', coursId: 'C1' },
            { da: '1000002', nom: 'Bélanger', prenom: 'Tom', groupe: '00001', coursId: 'C1' },
        ],
    };
}

describe('#872 — créer un 2e groupe d\'élèves', () => {
    it('A. le bouton « + Nouveau groupe » est sous le menu Groupe et vise une fonction exportée', () => {
        const html = lire('index.html');
        const i = html.indexOf('id="v2-selectGroupe"');
        expect(i).toBeGreaterThan(-1);
        // Borné par la carte résumé, pas par le premier `</div>` : le 16 sept. 2026, le
        // bouton est sorti du .groupe-form pour prendre la position commune aux six
        // accordéons du Cadre (juste sous le menu, avant la carte). La fenêtre fixe
        // serait devenue aveugle au bouton sans rien signaler ; ces deux bornes
        // verrouillent l'ordre voulu : menu, puis bouton, puis carte.
        const fin = html.indexOf('carte-resume-etudiants', i);
        expect(fin).toBeGreaterThan(i);
        const bloc = html.slice(i, fin);
        expect(bloc).toMatch(/data-action="creerNouveauGroupeV2"/);
        expect(lire('js/trimestre-v2-etudiants.js')).toMatch(/^window\.creerNouveauGroupeV2 = creerNouveauGroupeV2;/m);
    });

    it('B. le groupe créé reste dans le menu, sélectionné et marqué « vide »', async () => {
        const b = monter(storeUnGroupe());
        await b.win.chargerListeEtudiantsV2();
        b.etat.reponsePrompt = '2';
        await b.win.creerNouveauGroupeV2();
        expect(b.select().innerHTML).toContain('<option value="00002">00002 (vide)</option>');
        expect(b.select().value).toBe('00002');
        expect(b.champ('v2-etudiantGroupe').value).toBe('00002');
        expect(b.notifs.at(-1)).toMatchObject({ type: 'succes' });
    });

    it('C. deux ajouts manuels de suite vont dans le nouveau groupe, pas dans le premier', async () => {
        const b = monter(storeUnGroupe());
        await b.win.chargerListeEtudiantsV2();
        b.etat.reponsePrompt = '2';
        await b.win.creerNouveauGroupeV2();
        await b.ajouterAuFormulaire('2000001', 'Caron', 'Zoé');
        await b.ajouterAuFormulaire('2000002', 'Dion', 'Max');
        const groupeDe = (da) => b.store.test_groupeEtudiants.find(e => e.da === da)?.groupe;
        expect(groupeDe('2000001')).toBe('00002');
        expect(groupeDe('2000002')).toBe('00002');
        // Le groupe a maintenant des élèves : il n'est plus marqué vide.
        await b.win.chargerListeEtudiantsV2();
        expect(b.select().innerHTML).toContain('<option value="00002">00002</option>');
    });

    it('C (témoin). sous « Tous les groupes », un champ vide garde l\'ancien repli : le groupe du cours actif', async () => {
        const b = monter(storeUnGroupe());
        await b.win.chargerListeEtudiantsV2();
        expect(b.select().value).toBe('');
        await b.ajouterAuFormulaire('3000001', 'Émond', 'Rose');
        expect(b.store.test_groupeEtudiants.find(e => e.da === '3000001').groupe).toBe('00001');
    });

    it('D. choisir un groupe dans le menu remplit le champ Groupe — mais pas en édition', async () => {
        const store = storeUnGroupe();
        store.test_groupeEtudiants.push({ da: '1000003', nom: 'Côté', prenom: 'Ana', groupe: '00003', coursId: 'C1' });
        const b = monter(store);
        await b.win.chargerListeEtudiantsV2();
        b.select().value = '00003';
        await b.win.filtrerParGroupeV2();
        expect(b.champ('v2-etudiantGroupe').value).toBe('00003');

        b.win.editerEtudiantV2('1000001');
        expect(b.champ('v2-etudiantGroupe').value).toBe('00001');
        b.select().value = '00003';
        await b.win.filtrerParGroupeV2();
        expect(b.champ('v2-etudiantGroupe').value).toBe('00001');
    });

    it('E. un numéro non numérique est refusé, rien n\'est créé', async () => {
        const b = monter(storeUnGroupe());
        await b.win.chargerListeEtudiantsV2();
        b.etat.reponsePrompt = 'Gr 2';
        await b.win.creerNouveauGroupeV2();
        expect(b.notifs.at(-1)).toMatchObject({ type: 'erreur', t: 'Numéro de groupe invalide' });
        await b.win.chargerListeEtudiantsV2();
        expect(b.select().innerHTML).not.toMatch(/Gr 2/);
        expect(b.select().options.map(o => o.value)).toEqual(['', '00001']);
    });

    it('F. le groupe vide ne suit pas dans un autre trimestre, et le numéro proposé le saute', async () => {
        const store = storeUnGroupe();
        store.autre_groupeEtudiants = [{ da: '9000001', nom: 'Fortin', prenom: 'Léo', groupe: '00001', coursId: 'C9' }];
        const b = monter(store);
        await b.win.chargerListeEtudiantsV2();
        b.etat.reponsePrompt = '2';
        await b.win.creerNouveauGroupeV2();
        b.etat.reponsePrompt = '3';
        await b.win.creerNouveauGroupeV2();
        expect(b.etat.defautsProposes).toEqual(['00002', '00003']);

        b.etat.prefixe = 'autre_';
        await b.win.chargerListeEtudiantsV2();
        expect(b.select().options.map(o => o.value)).toEqual(['', '00001']);
    });

    it('G. un import rafraîchit l\'étape 3 du groupe-cours (appel par la liste d\'élèves)', async () => {
        const b = monter(storeUnGroupe());
        let appels = 0;
        b.win.populerDropdownGroupesAssemblageV2 = () => { appels++; };
        // Le geste réel : coller, « Prévisualiser », « Confirmer ».
        b.champ('v2-donneesCollees').value = '2000001\t00002\tCaron\tZoé\t200.B1';
        b.win.previsualiserDonneesV2();
        await b.win.confirmerImportV2();
        expect(b.store.test_groupeEtudiants.find(e => e.da === '2000001')?.groupe).toBe('00002');
        expect(appels).toBeGreaterThan(0);
    });

    it('G. l\'étape 3 offre le nouveau groupe et garde le groupe déjà choisi (fonction réelle de trimestre-v2.js)', () => {
        const store = storeUnGroupe();
        store.test_groupeEtudiants.push({ da: '2000001', nom: 'Caron', prenom: 'Zoé', groupe: '00002', coursId: 'C1' });
        const b = monter(store);
        const selectGC = b.document.getElementById('v2-gc-groupe');
        selectGC.innerHTML = '<option value="">— Choisir un groupe —</option><option value="00001">00001 (2 étud.)</option>';
        selectGC.value = '00001';
        const winTv2 = {};
        chargerScript('js/trimestre-v2.js', { document: b.document, db: b.db, cle: b.cle, echapperHtml, echapperAttribut: echapperHtml }, winTv2);
        winTv2.populerDropdownGroupesAssemblageV2();
        expect(selectGC.options.map(o => o.value)).toEqual(['', '00001', '00002']);
        expect(selectGC.innerHTML).toContain('00002 (1 étud.)');
        expect(selectGC.value).toBe('00001');
    });

    it('I. un groupe importé qui porte du HTML est échappé dans le menu du Cadre (règle de sécurité n° 1)', async () => {
        const store = storeUnGroupe();
        store.test_groupeEtudiants.push({ da: '5000001', nom: 'X', prenom: 'Y', groupe: '"><img src=x>', coursId: 'C1' });
        const b = monter(store);
        await b.win.chargerListeEtudiantsV2();
        expect(b.select().innerHTML).not.toContain('<img');
        expect(b.select().innerHTML).toContain('&lt;img src=x&gt;');
    });

    it('H. une ligne d\'en-tête n\'est pas un élève ; une vraie ligne l\'est', () => {
        const b = monter(storeUnGroupe());
        const fiches = b.win.analyserListeEtudiantsCollee('DA,Groupe,Nom,Prénom,Programme,SA\nDEMO004,0demo,Césaire,Aimé,310.B1,\n2000001,00002,Caron,Zoé,200.B1,');
        expect(fiches.map(f => f.da)).toEqual(['DEMO004', '2000001']);
        expect(fiches.some(f => f.groupe.toLowerCase().includes('groupe'))).toBe(false);
    });
});
