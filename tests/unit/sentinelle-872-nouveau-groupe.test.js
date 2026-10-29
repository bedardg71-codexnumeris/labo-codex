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
    const etat = { prefixe: 'test_', reponsePrompt: null, defautsProposes: [], confirmations: [], affichages: {}, reponseConfirm: true, codexAPart: [], reponseCodexAPart: true };
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
        alert() {}, confirm: (m) => { etat.confirmations.push(m); return etat.reponseConfirm; },
        toggleDisplay(el, montrer) { if (el) etat.affichages[el.id] = Boolean(montrer); },
        // #1007 : le codex à part, avant toute suppression d'élèves par groupe (doublure).
        Codex: { ecrireAPartAvantSuppression: async (phrase) => { etat.codexAPart.push(phrase); return etat.reponseCodexAPart; } },
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

// #872 B (19 sept. 2026) : la valeur d'une entrée du menu est le couple (cours, numéro). Le format
// est REDIT ici, pas emprunté au module : s'il change, les valeurs persistées chez les gens ne se
// relisent plus — ce banc doit rougir.
const V = (coursId, groupe) => encodeURIComponent(coursId) + '|' + encodeURIComponent(groupe);

function storeUnGroupe() {
    return {
        infoCours: { id: 'C1', codeCours: '601-101-MQ', nomCours: 'Écriture et littérature', groupe: '00001' },
        cours: [
            { id: 'C1', codeCours: '601-101-MQ', nomCours: 'Écriture et littérature' },
            { id: 'C2', codeCours: '601-102-MQ', nomCours: 'Littérature et imaginaire' },
        ],
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
        expect(b.select().innerHTML).toContain(`<option value="${V('C1', '00002')}">00002 · 601-101-MQ (vide)</option>`);
        expect(b.select().value).toBe(V('C1', '00002'));
        expect(b.store.test_groupeSelectionne).toBe(V('C1', '00002'));
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
        expect(b.select().innerHTML).toContain(`<option value="${V('C1', '00002')}">00002 · 601-101-MQ</option>`);
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
        b.select().value = V('C1', '00003');
        expect(b.select().value).toBe(V('C1', '00003'));   // l'entrée existe : le faux select l'a gardée
        await b.win.filtrerParGroupeV2();
        expect(b.champ('v2-etudiantGroupe').value).toBe('00003');

        b.win.editerEtudiantV2('1000001');
        expect(b.champ('v2-etudiantGroupe').value).toBe('00001');
        b.select().value = V('C1', '00003');
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
        expect(b.select().options.map(o => o.value)).toEqual(['', V('C1', '00001')]);
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
        expect(b.select().options.map(o => o.value)).toEqual(['', V('C9', '00001')]);
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
        const fiches = b.win.analyserListeEtudiantsCollee('DA,Groupe,Nom,Prénom,Programme,SA\nDEMO004,0demo,Jovial,Castor,310.B1,\n2000001,00002,Caron,Zoé,200.B1,');
        expect(fiches.map(f => f.da)).toEqual(['DEMO004', '2000001']);
        expect(fiches.some(f => f.groupe.toLowerCase().includes('groupe'))).toBe(false);
    });
});

// SENTINELLE #885 — SUPPRIMER UN GROUPE ENTIER (suite de #872, réponse de Mathieu, 16 sept. 2026)
//
// « J'ai ensuite supprimé tous les élèves pour réessayer, mais je n'ai pas trouvé d'autres options
// que de les supprimer un par un. » Le bouton « Supprimer ce groupe » existait depuis Beta 95.3,
// mais n'apparaissait que si un groupe précis était choisi dans le menu — or le menu s'ouvre sur
// « Tous les groupes ». VERROUILLÉ ICI :
//   J. sous « Tous les groupes », le bouton est visible et renvoie au menu, sans rien supprimer ;
//   K. un groupe choisi : le bouton le nomme, et le supprime lui seul ;
//   L. un numéro partagé par deux cours : depuis #872 B (19 sept.), ce sont DEUX groupes — la
//      suppression n'emporte que celui du cours choisi, et « répartis dans N cours » a disparu.
describe('#885 — supprimer un groupe entier sans passer élève par élève', () => {
    function storeDeuxGroupes() {
        const store = storeUnGroupe();
        store.test_groupeEtudiants.push({ da: '2000001', nom: 'Caron', prenom: 'Zoé', groupe: '00002', coursId: 'C2' });
        return store;
    }

    it('J. sous « Tous les groupes », le bouton est visible ; cliqué, il renvoie au menu et ne supprime rien', async () => {
        const b = monter(storeDeuxGroupes());
        await b.win.chargerListeEtudiantsV2();
        expect(b.select().value).toBe('');
        expect(b.etat.affichages['v2-btnSupprimerGroupe']).toBe(true);
        expect(b.champ('v2-btnSupprimerGroupe').textContent).toBe('Supprimer un groupe…');
        await b.win.supprimerGroupeSelectionneV2();
        expect(b.notifs.at(-1)).toMatchObject({ type: 'erreur', t: 'Choisis d\'abord un groupe' });
        expect(b.etat.codexAPart).toEqual([]);
        expect(b.etat.confirmations).toEqual([]);
        expect(b.store.test_groupeEtudiants).toHaveLength(3);
    });

    it('K. un groupe choisi : le bouton le nomme, et la suppression n\'emporte que lui', async () => {
        const b = monter(storeDeuxGroupes());
        await b.win.chargerListeEtudiantsV2();
        b.select().value = V('C1', '00001');
        await b.win.filtrerParGroupeV2();
        expect(b.etat.affichages['v2-btnSupprimerGroupe']).toBe(true);
        expect(b.champ('v2-btnSupprimerGroupe').textContent).toBe('Supprimer le groupe 00001 · 601-101-MQ');
        await b.win.supprimerGroupeSelectionneV2();
        expect(b.etat.codexAPart).toEqual(['Supprimer le groupe « 00001 · 601-101-MQ » efface pour de bon ses 2 étudiant·es.']);
        expect(b.etat.confirmations.at(-1)).toBe('Supprimer les 2 étudiant(s) du groupe 00001 · 601-101-MQ ? Cette action est irréversible.');
        expect(b.store.test_groupeEtudiants.map(e => e.da)).toEqual(['2000001']);
    });

    it('K (#1007). le codex à part non écrit : ni question, ni suppression', async () => {
        const b = monter(storeDeuxGroupes());
        await b.win.chargerListeEtudiantsV2();
        b.select().value = V('C1', '00001');
        await b.win.filtrerParGroupeV2();
        b.etat.reponseCodexAPart = false;
        await b.win.supprimerGroupeSelectionneV2();
        expect(b.etat.codexAPart).toHaveLength(1);   // le parcours a bien atteint le codex à part
        expect(b.etat.confirmations).toEqual([]);
        expect(b.store.test_groupeEtudiants).toHaveLength(3);
    });

    it('K (témoin). refuser la question ne supprime rien', async () => {
        const b = monter(storeDeuxGroupes());
        await b.win.chargerListeEtudiantsV2();
        b.select().value = V('C1', '00001');
        await b.win.filtrerParGroupeV2();
        b.etat.reponseConfirm = false;
        await b.win.supprimerGroupeSelectionneV2();
        // La question A ÉTÉ posée : sans ça, l'essai serait vert sur un menu resté à « Tous les groupes ».
        expect(b.etat.confirmations).toHaveLength(1);
        expect(b.store.test_groupeEtudiants).toHaveLength(3);
    });

    it('L. un même numéro porté dans deux cours : la suppression n\'emporte que le groupe du cours choisi', async () => {
        const b = monter(storeDeuxCours());
        await b.win.chargerListeEtudiantsV2();
        b.select().value = V('C1', '00001');
        await b.win.filtrerParGroupeV2();
        await b.win.supprimerGroupeSelectionneV2();
        expect(b.etat.confirmations.at(-1)).toBe('Supprimer les 2 étudiant(s) du groupe 00001 · 601-101-MQ ? Cette action est irréversible.');
        expect(b.etat.confirmations.at(-1)).not.toContain('répartis');
        expect(b.store.test_groupeEtudiants.map(e => e.da)).toEqual(['2000001', '2000002']);
        expect(b.notifs.at(-1)).toMatchObject({ type: 'succes', t: 'Groupe 00001 · 601-101-MQ supprimé (2 étudiant(s))' });
    });
});

// SENTINELLE #872, MÉCANISME B — UN GROUPE, C'EST UN NUMÉRO DANS UN COURS (19 sept. 2026)
//
// Omnivox numérote les groupes PAR cours. Forme tranchée par Grégoire : le menu Groupe nomme le cours
// (« 00001 · 601-101-MQ », mots validés le 19 sept.) ; deux cours qui portent chacun un « 00001 »
// donnent deux entrées ; la liste, le compte, la suppression (L ci-dessus), « + Nouveau groupe » et le
// formulaire suivent l'entrée choisie. Aucune fiche n'est réécrite. VERROUILLÉ ICI :
//   M. deux entrées, chacune ses élèves, le compte suit ; « sans cours » pour une fiche d'avant ;
//   N. le numéro libre d'un nouveau groupe se juge DANS le cours actif ;
//   O. un ajout à la main rejoint le cours de l'entrée choisie ; une édition garde le cours de la fiche ;
//   P. l'ancienne valeur persistée (numéro seul) reste lue : unique → son entrée, sinon « Tous les groupes » ;
//   Q. deux cours au même code : le nom s'ajoute ;
//   R. (structurel) plus personne ne compare le numéro seul à la sélection.
function storeDeuxCours() {
    const store = storeUnGroupe();
    store.test_groupeEtudiants.push(
        { da: '2000001', nom: 'Caron', prenom: 'Zoé', groupe: '00001', coursId: 'C2' },
        { da: '2000002', nom: 'Dion', prenom: 'Max', groupe: '1', coursId: 'C2' },
    );
    return store;
}

describe('#872 B — un groupe, c\'est un numéro dans un cours', () => {
    const libelles = (b) => [...b.select().innerHTML.matchAll(/<option value="([^"]*)">([^<]*)<\/option>/g)].map(m => ({ v: m[1], t: m[2] }));

    it('M. deux cours portent « 00001 » : deux entrées, chacune ses élèves, le compte suit', async () => {
        const store = storeDeuxCours();
        store.test_groupeEtudiants.push({ da: '3000001', nom: 'Ancienne', prenom: 'Fiche', groupe: '00003' });
        const b = monter(store);
        await b.win.chargerListeEtudiantsV2();
        expect(libelles(b)).toEqual([
            { v: '', t: 'Tous les groupes' },
            { v: V('C1', '00001'), t: '00001 · 601-101-MQ' },
            { v: V('C2', '00001'), t: '00001 · 601-102-MQ' },
            { v: V('', '00003'), t: '00003 · sans cours' },
        ]);
        // Sous « Tous les groupes », la carte nomme le cours des SEULS numéros portés par deux cours.
        expect(b.champ('v2-resumeGroupes').innerHTML).toContain('Grp 00001 · 601-101-MQ</span><span>2');
        expect(b.champ('v2-resumeGroupes').innerHTML).toContain('Grp 00001 · 601-102-MQ</span><span>2');
        expect(b.champ('v2-resumeGroupes').innerHTML).toContain('Grp 00003</span><span>1');

        b.select().value = V('C2', '00001');
        await b.win.filtrerParGroupeV2();
        const liste = b.champ('v2-listeEtudiants').innerHTML;
        expect(liste).toContain('2000001');
        expect(liste).toContain('2000002');   // « 1 » et « 00001 » : le même numéro
        expect(liste).not.toContain('1000001');
        expect(liste).not.toContain('1000002');
        expect(b.champ('v2-resumeNbTotal').textContent).toBe(2);

        b.select().value = V('', '00003');
        await b.win.filtrerParGroupeV2();
        expect(b.champ('v2-listeEtudiants').innerHTML).toContain('3000001');
        expect(b.champ('v2-listeEtudiants').innerHTML).not.toContain('2000001');
    });

    it('N. le numéro libre d\'un nouveau groupe se juge dans le cours actif', async () => {
        const store = storeDeuxCours();
        store.infoCours = { id: 'C3', codeCours: '601-103-MQ', nomCours: 'Littérature québécoise', groupe: '00001' };
        store.cours.push({ id: 'C3', codeCours: '601-103-MQ', nomCours: 'Littérature québécoise' });
        const b = monter(store);
        await b.win.chargerListeEtudiantsV2();
        b.etat.reponsePrompt = '1';
        await b.win.creerNouveauGroupeV2();
        // C1 et C2 portent un « 00001 » : il reste LIBRE dans C3.
        expect(b.etat.defautsProposes).toEqual(['00001']);
        expect(b.select().value).toBe(V('C3', '00001'));
        expect(libelles(b).map(o => o.t)).toContain('00001 · 601-103-MQ (vide)');
        // … et pris, il est sauté : la proposition suivante est « 00002 ».
        b.etat.reponsePrompt = null;
        await b.win.creerNouveauGroupeV2();
        expect(b.etat.defautsProposes).toEqual(['00001', '00002']);
        // L'ajout qui suit rejoint le cours du groupe créé.
        await b.ajouterAuFormulaire('4000001', 'Gagnon', 'Lou');
        expect(b.store.test_groupeEtudiants.find(e => e.da === '4000001')).toMatchObject({ groupe: '00001', coursId: 'C3' });
    });

    it('O. un ajout à la main rejoint le cours de l\'entrée choisie ; une édition garde le cours de la fiche', async () => {
        const store = storeDeuxCours();
        store.test_groupeEtudiants.push({ da: '3000001', nom: 'Ancienne', prenom: 'Fiche', groupe: '00003' });
        const b = monter(store);   // cours actif : C1
        await b.win.chargerListeEtudiantsV2();
        b.select().value = V('C2', '00001');
        await b.win.filtrerParGroupeV2();
        expect(b.champ('v2-ajoutRattachement').textContent).toBe('Sera rattaché·e à : 601-102-MQ Littérature et imaginaire');
        await b.ajouterAuFormulaire('2000009', 'Hamel', 'Noa');
        expect(b.store.test_groupeEtudiants.find(e => e.da === '2000009')).toMatchObject({ groupe: '00001', coursId: 'C2' });

        // Témoin : sous « Tous les groupes », le cours actif, comme avant.
        b.select().value = '';
        await b.win.filtrerParGroupeV2();
        expect(b.champ('v2-ajoutRattachement').textContent).toBe('Sera rattaché·e à : 601-101-MQ Écriture et littérature');
        await b.ajouterAuFormulaire('1000009', 'Imbeault', 'Sam');
        expect(b.store.test_groupeEtudiants.find(e => e.da === '1000009').coursId).toBe('C1');

        // ÉDITION d'une fiche de C2, cours actif C1 : elle reste dans C2, et la phrase le dit.
        b.win.editerEtudiantV2('2000001');
        expect(b.champ('v2-ajoutRattachement').textContent).toBe('Rattaché·e à : 601-102-MQ Littérature et imaginaire');
        b.champ('v2-etudiantPrenom').value = 'Zoé-Anne';
        await b.win.soumettreEtudiantV2();
        expect(b.store.test_groupeEtudiants.find(e => e.da === '2000001')).toMatchObject({ prenom: 'Zoé-Anne', coursId: 'C2' });
        // ↻ Lot E2 (D3) : la fiche s'enregistre champ par champ et RESTE ouverte — la phrase dit
        // toujours son cours ; « Fermer » ramène au formulaire d'ajout, et à la phrase de l'ajout.
        expect(b.champ('v2-ajoutRattachement').textContent).toBe('Rattaché·e à : 601-102-MQ Littérature et imaginaire');
        b.win.fermerFicheEtudiantV2();
        expect(b.champ('v2-ajoutRattachement').textContent).toBe('Sera rattaché·e à : 601-101-MQ Écriture et littérature');

        // Une fiche d'avant, sans `coursId` : l'édition ne lui en donne pas (stock intact).
        b.win.editerEtudiantV2('3000001');
        expect(b.champ('v2-ajoutRattachement').textContent).toBe('Rattaché·e à aucun cours.');
        b.champ('v2-etudiantPrenom').value = 'Fiche-Modifiée';
        await b.win.soumettreEtudiantV2();
        const ancienne = b.store.test_groupeEtudiants.find(e => e.da === '3000001');
        expect(ancienne.prenom).toBe('Fiche-Modifiée');
        expect(Object.prototype.hasOwnProperty.call(ancienne, 'coursId')).toBe(false);
    });

    it('P. l\'ancienne valeur persistée (numéro seul) reste lue : unique → son entrée ; portée par deux cours → « Tous les groupes »', async () => {
        const unique = storeUnGroupe();
        unique.test_groupeSelectionne = '00001';
        const b1 = monter(unique);
        await b1.win.chargerListeEtudiantsV2();
        expect(b1.select().value).toBe(V('C1', '00001'));
        expect(unique.test_groupeSelectionne).toBe('00001');   // rien n'est réécrit à la lecture

        const ambigu = storeDeuxCours();
        ambigu.test_groupeSelectionne = '00001';
        const b2 = monter(ambigu);
        await b2.win.chargerListeEtudiantsV2();
        expect(b2.select().value).toBe('');

        const demo = storeUnGroupe();
        demo.test_groupeEtudiants.push({ da: 'DEMO001', nom: 'Démo', prenom: 'Un', groupe: '0demo', coursId: 'C2', isDemo: true });
        demo.test_groupeSelectionne = '0demo';
        const b3 = monter(demo);
        await b3.win.chargerListeEtudiantsV2();
        expect(b3.select().value).toBe(V('C2', '0demo'));
        expect(b3.select().innerHTML).toContain('0demo · 601-102-MQ (démo)</option>');
    });

    it('Q. deux cours au même code : le nom s\'ajoute ; un cours introuvable est nommé par son identifiant', async () => {
        const store = storeDeuxCours();
        store.cours[1].codeCours = '601-101-MQ';
        store.test_groupeEtudiants.push({ da: '5000001', nom: 'Orpheline', prenom: 'Fiche', groupe: '00004', coursId: 'C-ABSENT' });
        const b = monter(store);
        await b.win.chargerListeEtudiantsV2();
        expect(libelles(b).map(o => o.t)).toEqual([
            'Tous les groupes',
            '00001 · 601-101-MQ Écriture et littérature',
            '00001 · 601-101-MQ Littérature et imaginaire',
            '00004 · Cours C-ABSENT',
        ]);
    });

    it('R. (structurel) la sélection n\'est plus jamais comparée au numéro seul, et le menu n\'a qu\'un lecteur', () => {
        const source = lire('js/trimestre-v2-etudiants.js');
        expect(source).not.toMatch(/normaliserNumeroGroupe\(e\.groupe\)\s*[!=]==\s*(groupeFiltre|groupeSelectionne|grp)\b/);
        // `v2-selectGroupe`.value n'est LU que par getGroupeSelectionneV2 et par le repeuplement du menu.
        const lectures = [...source.matchAll(/getElementById\('v2-selectGroupe'\)\?\.value/g)];
        expect(lectures).toHaveLength(1);
        expect(source).toMatch(/function getGroupeSelectionneV2\(\) \{\s*return _lireValeurGroupeV2\(document\.getElementById\('v2-selectGroupe'\)\?\.value\);/);
    });
});
