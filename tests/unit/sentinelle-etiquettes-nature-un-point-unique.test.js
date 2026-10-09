import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE — LES ÉTIQUETTES : L'ORTHOPÉDAGOGUE ENTRE PAR LE CADRE, COMME TOUT LE MONDE
// (consigne du 12 septembre 2026, lots A à D).
//
// Grégoire, 7 h 05 : « On ne change rien au fonctionnement, on fait juste mettre une étiquette
// (qui pourrait éventuellement changer) pour clarifier comment ça fonctionne. » 7 h 35 :
// « Elle entre par le Cadre, elle aussi. »
//
// VERROUILLÉ ICI :
//   A. le point unique (js/mots-nature.js) rend « Enseignement » pour 'cours' et « Orthopédagogie »
//      pour 'service' ; toute autre valeur est un cours ; et AUCUN site ne réécrit le mot en dur
//      (verrou structurel : ni dans js/, ni dans les options d'index.html) ; les mots par défaut
//      d'index.html sont ceux du point unique pour 'cours' (pas de dérive) ;
//   B. la VALEUR en base reste 'service' après l'aller-retour complet du formulaire du Cadre
//      (création → sélection → modification → relecture) — c'est le verrou qui prouve qu'on n'a
//      changé qu'une étiquette ; et les mots du formulaire viennent du point unique ;
//   C. le libellé de la personne (fil d'Ariane, accordéon, sélecteur, formulaire de groupe-cours)
//      suit la nature du contexte actif, dans les deux sens ;
//   D. la carte résumé d'un groupe-cours dit « Service / Ortho. / — Orthopédagogie » pour un
//      service, « Cours / Enseig. » pour un cours ;
//   E. Rencontres : les trois questions et la porte portent les mots du § 2 B de la consigne ;
//   F. les infobulles du Cadre et du sous-onglet sont bâties sur le point unique.
//
// BREAK-TESTS VÉRIFIÉS le 12 septembre 2026 — journal en fin de fichier.

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lire = (rel) => readFileSync(path.join(RACINE, rel), 'utf8');
const clone = (x) => JSON.parse(JSON.stringify(x));
const cle = (k) => (String(k).startsWith('test_') ? k : 'test_' + k);

function classList() { const s = new Set(); return { add(c) { s.add(c); }, remove(c) { s.delete(c); }, contains(c) { return s.has(c); }, toggle(c, f) { const v = f === undefined ? !s.has(c) : !!f; v ? s.add(c) : s.delete(c); return v; } }; }
function elementDom(id) {
    return { id, _html: '', textContent: '', value: '', placeholder: '', style: {}, dataset: {}, options: [], _attrs: {},
        get innerHTML() { return this._html; }, set innerHTML(v) { this._html = v; },
        classList: classList(), querySelector() { return null; }, querySelectorAll() { return []; }, addEventListener() {}, appendChild(c) { return c; },
        setAttribute(k, v) { this._attrs[k] = v; }, getAttribute(k) { return k in this._attrs ? this._attrs[k] : null; }, closest() { return null; }, focus() {}, scrollIntoView() {} };
}
function fauxDocument(elements, listeAttr) {
    return { getElementById: (id) => (elements[id] || (elements[id] = elementDom(id))), querySelector: () => null,
        querySelectorAll: (sel) => (sel === '[data-mot-nature]' ? (listeAttr || []) : []),
        createElement: (t) => elementDom(t), addEventListener() {}, body: elementDom('body'), documentElement: { addEventListener() {} }, readyState: 'complete' };
}
function dbBanc(store) {
    return {
        getSync: (k, d) => (k in store ? clone(store[k]) : (d !== undefined ? d : null)),
        setSync: (k, v) => { store[k] = clone(v); },
        removeSync: (k) => { delete store[k]; },
        get: async (k, d) => (k in store ? clone(store[k]) : (d !== undefined ? d : null)),
        set: async (k, v) => { store[k] = clone(v); },
        modifier: async (k, f, d) => { store[k] = clone(f(k in store ? clone(store[k]) : d)); },
    };
}
function notifs() { const j = []; return { j, api: { succes(t, m) { j.push({ type: 'succes', t, m }); }, erreur(t, m) { j.push({ type: 'erreur', t, m }); }, info() {}, warning() {} } }; }
function monterMots() { return chargerScript('js/mots-nature.js', {}, { addEventListener() {} }); }
const optionsNature = () => [Object.assign(elementDom('o1'), { value: 'cours' }), Object.assign(elementDom('o2'), { value: 'service' })];

// ─────────────────────────────────────────────────────────────────────────────
describe('A · le point unique : un mot par nature, et nulle part ailleurs', () => {
    it('« Enseignement » pour \'cours\', « Orthopédagogie » pour \'service\' ; le reste est un cours ; un objet cours passe aussi', () => {
        const w = monterMots();
        expect(w.motNature('cours')).toBe('Enseignement');
        expect(w.motNature('service')).toBe('Orthopédagogie');
        expect(w.motNature(undefined)).toBe('Enseignement');
        expect(w.motNature('autre')).toBe('Enseignement');
        expect(w.motNature({ nature: 'service', nomCours: 'Aide' })).toBe('Orthopédagogie');
        expect(w.motsNature('service').objetLong).toBe('service d’orthopédagogie');
        expect(w.motsNature('service').Personne).toBe('Orthopédagogue');
        expect(w.motsNature('cours').Personne).toBe('Enseignant·e');
        expect(Object.isFrozen(w.MOTS_NATURE.service)).toBe(true);
    });

    it('verrou structurel — aucun module de js/ n\'écrit « Enseignement » / « Orthopédagogie » / « Service » (l\'étiquette) en dur hors du point unique', () => {
        const fichiers = readdirSync(path.join(RACINE, 'js')).filter(f => f.endsWith('.js') && f !== 'mots-nature.js');
        const motifs = [/['"`]Enseignement['"`]/, /['"`]Orthopédagogie['"`]/, />Orthopédagogie</, />Enseignement</,
            /['"]Service['"]/, /— Service[`'"]/, /- Service['"]/, />Service</];
        const fautifs = [];
        for (const f of fichiers) {
            const code = lire('js/' + f).replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
            for (const m of motifs) if (m.test(code)) fautifs.push(f + ' : ' + m.source);
        }
        expect(fautifs, 'le mot d\'une nature ne se recopie pas : il se lit dans js/mots-nature.js').toEqual([]);
    });

    it('verrou structurel — les options du menu Nature d\'index.html sont VIDES (le point unique les libelle), et les sites nommés par la consigne lisent le point unique', () => {
        const html = lire('index.html');
        expect(html).toMatch(/<option value="cours"><\/option>\s*<option value="service"><\/option>/);
        expect(html).not.toMatch(/>Orthopédagogie</);
        expect(html).not.toMatch(/>Enseignement</);
        expect(html).toMatch(/<script src="js\/mots-nature\.js\?v=/);
        // mots-nature.js se charge avant tout module qui l'appelle
        const ordre = (src) => html.indexOf('<script src="js/' + src);
        for (const m of ['modes.js', 'trimestre-v2.js', 'trimestre-v2-enseignants.js', 'trimestre-v2-cours.js', 'trimestre-v2-groupes-cours.js', 'trimestre-v2-orchestre.js', 'rencontres.js', 'accompagnement-contenu-hover.js', 'contexte.js']) {
            expect(ordre('mots-nature.js'), m + ' doit se charger après mots-nature.js').toBeLessThan(ordre(m));
        }
        // cours.js (bibliothèque des cours, deux cartes) : site absent de la liste de la consigne, attrapé par le verrou ci-dessus.
        // #841 / #842 (12 sept.) : trimestre-v2.js et trimestre-v2-enseignants.js lisent le contexte actif quand ils reconstruisent un menu ;
        // l'orchestre ne compte plus qu'un appel (sa fonction morte `peuplerDropdownEnseignants` a été retirée).
        // #846 (12 sept., 10 h 25) : trimestre-v2.js n'en compte plus qu'un — le champ 2 (v2-gc-cours) nomme un choix,
        // il ne lit plus le contexte ; reste le champ 5 (la personne).
        const sites = { 'trimestre-v2-cours.js': 10, 'trimestre-v2-groupes-cours.js': 4, 'trimestre-v2-orchestre.js': 1, 'trimestre-v2.js': 1, 'trimestre-v2-enseignants.js': 1, 'rencontres.js': 3, 'accompagnement-contenu-hover.js': 4, 'cours.js': 2 };
        for (const [f, min] of Object.entries(sites)) {
            const n = (lire('js/' + f).match(/\bmots?Nature(ContexteActif)?\(/g) || []).length;
            expect(n, f + ' lit le point unique').toBeGreaterThanOrEqual(min);
        }
    });

    it('pas de dérive — les mots par défaut d\'index.html (data-mot-nature) sont ceux du point unique pour \'cours\', et il y en a au moins huit', () => {
        const w = monterMots();
        const html = lire('index.html');
        const occurrences = [...html.matchAll(/data-mot-nature="([^"]+)">([^<]*)</g)];
        expect(occurrences.length).toBeGreaterThanOrEqual(8);
        for (const [, k, texte] of occurrences) {
            expect(w.MOTS_NATURE.cours, 'clé inconnue du point unique : ' + k).toHaveProperty(k);
            expect(texte.trim(), 'index.html dérive du point unique sur ' + k).toBe(w.MOTS_NATURE.cours[k]);
        }
    });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('B · le formulaire du Cadre : la VALEUR reste \'service\' après l\'aller-retour complet ; les mots viennent du point unique', () => {
    function monterForm(valeurs) {
        const elements = {};
        const document = fauxDocument(elements);
        elements['v2-natureCours'] = Object.assign(elementDom('v2-natureCours'), { options: optionsNature() });
        Object.entries(valeurs).forEach(([id, v]) => { document.getElementById(id).value = v; });
        const n = notifs();
        const appels = { creer: [], maj: [] };
        const win = { addEventListener() {} };
        const store = { cours: [], infoCours: null };
        const base = { document, db: dbBanc(store), notifications: n.api, echapperHtml: (s) => String(s == null ? '' : s),
            CoursEntite: {
                creer: async (d) => { appels.creer.push(d); const c = Object.assign({ id: 'COURS_X' }, d); store.cours.push(c); return c; },
                mettreAJour: async (id, d) => { appels.maj.push({ id, d }); store.cours = store.cours.map(c => c.id === id ? Object.assign({}, c, d) : c); return store.cours.find(c => c.id === id); },
                chercherDoublonCode: async () => null },
            confirm: () => true, alert() {}, toggleDisplay() {}, setTimeout: () => 0 };
        chargerScript('js/trimestre-v2-cours.js', base, win);
        return { win, n, appels, elements, store };
    }

    it('création (service) → sélection → « Modifier » → Enregistrer : mettreAJour reçoit nature \'service\', le formulaire relit \'service\', la fiche en base dit \'service\'', async () => {
        const b = monterForm({ 'v2-natureCours': 'service', 'v2-nomCours': 'Aide à la réussite' });
        await b.win.sauvegarderCoursV2();
        expect(b.appels.creer[0].nature).toBe('service');
        expect(b.store.cours[0].nature).toBe('service');
        // sélection dans le dropdown, puis Modifier : le formulaire se remplit depuis la fiche
        b.elements['v2-selectCours'].value = 'COURS_X';
        b.elements['v2-natureCours'].value = 'cours'; // un formulaire laissé sur l'autre nature ne doit rien changer
        await b.win.modifierCoursSelectionneV2();
        expect(b.elements['v2-natureCours'].value, 'relecture : la nature relue est celle de la fiche').toBe('service');
        expect(b.elements['v2-labelNomCours'].innerHTML).toMatch(/^Nom du service/);
        b.elements['v2-nomCours'].value = 'Aide à la réussite (revu)';
        await b.win.sauvegarderCoursV2();
        expect(b.appels.maj.length).toBe(1);
        expect(b.appels.maj[0].d.nature).toBe('service');
        expect(b.store.cours[0].nature, 'LA VALEUR EN BASE : \'service\', jamais le mot affiché').toBe('service');
        expect(b.store.cours[0].nomCours).toBe('Aide à la réussite (revu)');
        expect(JSON.stringify(b.store.cours)).not.toMatch(/Orthopédagogie|Enseignement/);
        // ↻ Lot E2 (D3) : une fiche existante s'enregistre toute seule — le témoin commun dit
        // « Enregistré », plus de message « … modifié ». La création garde le sien.
        expect(b.n.j.some(x => x.type === 'succes' && /modifié/.test(x.t))).toBe(false);
        expect(b.n.j.some(x => x.type === 'succes' && /^Service d’orthopédagogie «\u00a0Aide à la réussite\u00a0» créé\.$/.test(x.t))).toBe(true);
    });

    it('le même aller-retour sur un cours ordinaire : \'cours\' reste \'cours\', et « Cours « … » créé. » (lot E2 : plus de « modifié »)', async () => {
        const b = monterForm({ 'v2-natureCours': 'cours', 'v2-nomCours': 'Écriture', 'v2-codeCours': '601-101-MQ', 'v2-disciplineCours': '601 Français', 'v2-ponderation': '2-2-3' });
        await b.win.sauvegarderCoursV2();
        expect(b.store.cours[0].nature).toBe('cours');
        expect(b.n.j.some(x => x.type === 'succes' && /^Cours «\u00a0601-101-MQ\u00a0» créé\.$/.test(x.t))).toBe(true);
        b.elements['v2-selectCours'].value = 'COURS_X';
        await b.win.modifierCoursSelectionneV2();
        expect(b.elements['v2-natureCours'].value).toBe('cours');
        await b.win.sauvegarderCoursV2();
        expect(b.appels.maj[0].d.nature).toBe('cours');
        expect(b.store.cours[0].nature).toBe('cours');
    });

    it('les mots du menu Nature et de ses libellés sont ceux du point unique : « Enseignement » / « Orthopédagogie », « Nom du service », l\'aide nomme le service d\'orthopédagogie', () => {
        const b = monterForm({ 'v2-natureCours': 'service' });
        b.win.changerNatureCoursV2();
        const opts = b.elements['v2-natureCours'].options;
        expect(opts.map(o => o.textContent)).toEqual(['Enseignement', 'Orthopédagogie']);
        expect(b.elements['v2-labelNomCours'].innerHTML).toMatch(/^Nom du service <span/);
        expect(b.elements['v2-aideNatureCours'].textContent).toMatch(/^Un service d’orthopédagogie n'a ni code/);
        b.elements['v2-natureCours'].value = 'cours';
        b.win.changerNatureCoursV2();
        expect(b.elements['v2-labelNomCours'].innerHTML).toBe('Nom du cours');
        expect(opts.map(o => o.textContent)).toEqual(['Enseignement', 'Orthopédagogie']);
    });

    it('la synthèse d\'un service dit « Orthopédagogie »', () => {
        const b = monterForm({});
        b.store.cours = [{ id: 'S1', nature: 'service', nomCours: 'Aide' }, { id: 'C1', nature: 'cours', codeCours: '601-101-MQ', nomCours: 'Écriture' }];
        b.store.infoCours = { id: 'S1' };
        b.win.afficherSyntheseCours(b.store.cours[0]);
        expect(b.elements['v2-apercuCoursSidebar'].innerHTML).toContain('<div class="apercu-code">Orthopédagogie</div>');
        expect(b.elements['v2-apercuCoursSidebar'].innerHTML).toContain('Service d’orthopédagogie actif');
        // #467 (9 oct. 2026) : `afficherDetailsCoursV2` est partie (aucun appelant, et ses
        // champs entraient bruts dans le HTML) ; la synthèse ci-dessus est le seul aperçu.
    });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('C · le libellé de la personne suit la nature du contexte actif, dans les deux sens', () => {
    function monterOrchestre(etat) {
        const w = monterMots();
        // #846 : les deux marques `objetGroupeCours` (champ 2 du groupe-cours) ont quitté index.html — le champ
        // nomme un choix (« Cours ou service »), pas le contexte ; il ne suit plus la nature.
        const cles = ['Personne', 'Personne', 'profil', 'personne', 'personne', 'Personne'];
        const marques = cles.map((k, i) => { const el = elementDom('m' + i); el.setAttribute('data-mot-nature', k); el.textContent = w.MOTS_NATURE.cours[k]; return el; });
        const elements = {};
        const document = fauxDocument(elements, marques);
        for (const id of ['v2-selectEnseignant', 'v2-gc-enseignant']) {
            elements[id] = Object.assign(elementDom(id), { options: [Object.assign(elementDom('vide'), { value: '', textContent: 'x' }), Object.assign(elementDom('p1'), { value: 'E1', textContent: 'Marie Tremblay' })] });
        }
        const win = { addEventListener() {} };
        chargerScript('js/trimestre-v2-orchestre.js', { document, db: dbBanc({}), cle, echapperHtml: (s) => String(s == null ? '' : s), notifications: notifs().api,
            contexteActifEstService: () => !!etat.service }, win);
        return { win, marques, elements };
    }
    it('service actif → « Orthopédagogue », « Profil orthopédagogue », « Service d’orthopédagogie » ; cours actif → tout revient à « Enseignant·e »', async () => {
        const etat = { service: true };
        const b = monterOrchestre(etat);
        b.win.appliquerMotsNatureCadre();
        expect(b.marques.map(m => m.textContent)).toEqual(['Orthopédagogue', 'Orthopédagogue', 'Profil orthopédagogue', 'orthopédagogue', 'orthopédagogue', 'Orthopédagogue']);
        expect(b.elements['v2-selectEnseignant'].options[0].textContent).toBe('Sélectionner un·e orthopédagogue');
        expect(b.elements['v2-gc-enseignant'].options[0].textContent).toBe('— Choisir un·e orthopédagogue —');
        expect(b.elements['v2-gc-enseignant'].options[1].textContent, 'les profils ne bougent pas').toBe('Marie Tremblay');
        etat.service = false;
        b.win.appliquerMotsNatureCadre();
        expect(b.marques.map(m => m.textContent)).toEqual(['Enseignant·e', 'Enseignant·e', 'Profil enseignant', 'enseignant·e', 'enseignant·e', 'Enseignant·e']);
        expect(b.elements['v2-selectEnseignant'].options[0].textContent).toBe('Sélectionner un enseignant·e');
        // Le menu REPEUPLÉ suit aussi : c'est #841, verrouillé dans sentinelle-section-cours-suit-la-nature-842.test.js
        // (la fonction `peuplerDropdownEnseignants` de l'orchestre, sans appelant, a été retirée le 12 sept.).
        expect(b.win.peuplerDropdownEnseignants).toBeUndefined();
    });
    it('contexte.js appelle la pose des mots à chaque mise à jour de l\'en-tête (démarrage et activations)', () => {
        const src = lire('js/contexte.js');
        const corps = src.slice(src.indexOf('function mettreAJourContexteEntete()'), src.indexOf('const elDate'));
        expect(corps).toMatch(/appliquerMotsNatureCadre\(\)/);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('D · la carte résumé d\'un groupe-cours', () => {
    function monterCarte(store) {
        const elements = {};
        const document = fauxDocument(elements);
        const win = { addEventListener() {} };
        chargerScript('js/trimestre-v2-groupes-cours.js', { document, db: dbBanc(store), cle, echapperHtml: (s) => String(s == null ? '' : s), notifications: notifs().api }, win);
        return { win, elements };
    }
    it('service : « Service » / « Aide - Orthopédagogie » / « Ortho. » ; cours : « Cours » / « Enseig. »', () => {
        const store = { cours: [{ id: 'S1', nature: 'service', nomCours: 'Aide' }, { id: 'C1', codeCours: '601-101-MQ', nomCours: 'Écriture' }], test_horaires: [], enseignants: [{ id: 'E1', prenom: 'Marie', nom: 'Tremblay' }] };
        const b = monterCarte(store);
        b.win.mettreAJourCarteResumeGroupeCoursV2({ id: 'GC_S', coursId: 'S1', groupeNum: '00001', enseignantId: 'E1', horaireId: null });
        let html = b.elements['gc-carte-resume'] ? b.elements['gc-carte-resume']._html : Object.values(b.elements).map(e => e._html).join('');
        expect(html).toContain('<span class="label-gc">Service</span><span>Aide - Orthopédagogie</span>');
        expect(html).toContain('<span class="label-gc">Ortho.</span>');
        b.win.mettreAJourCarteResumeGroupeCoursV2({ id: 'GC_C', coursId: 'C1', groupeNum: '00002', enseignantId: 'E1', horaireId: null });
        html = Object.values(b.elements).map(e => e._html).join('');
        expect(html).toContain('<span class="label-gc">Cours</span><span>601-101-MQ - Écriture</span>');
        expect(html).toContain('<span class="label-gc">Enseig.</span>');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('E · Rencontres : les mots du § 2 B', () => {
    function monterRencontres(store) {
        const elements = {};
        const document = fauxDocument(elements);
        const win = { addEventListener() {} };
        chargerScript('js/rencontres.js', { document, db: dbBanc(store), cle, echapperHtml: (s) => String(s == null ? '' : s), notifications: notifs().api,
            obtenirTrimestreActif: () => (store.trimestres || []).find(t => t.actif) || null,
            contexteActifEstService: () => false, estCoursService: (c) => !!c && c.nature === 'service' }, win);
        return { win, elements };
    }
    it('les trois questions : « ton service d’orthopédagogie », « Créer mon service d’orthopédagogie » ; la porte : « Créer un service d’orthopédagogie » et l\'orthopédagogie nommée', () => {
        const b = monterRencontres({ trimestres: [{ id: 'a2026', nom: 'Automne 2026', actif: true }], infoCours: null, cours: [] });
        b.win.afficherRencontres();
        const q = b.elements.conteneurRencontres.innerHTML;
        expect(q).toContain('Elle crée ensuite ton service d’orthopédagogie, visible dans Cadre, tel quel.');
        expect(q).toContain('>Créer mon service d’orthopédagogie</button>');
        expect(q).toContain('2. Le nom de ton service</h4>');
        const c = monterRencontres({ trimestres: [{ id: 'a2026', actif: true }], cours: [{ id: 'C1', codeCours: '601-101-MQ' }], test_groupesCours: [{ id: 'GC1', coursId: 'C1', trimestreId: 'a2026' }], infoCours: { id: 'C1', _groupeCoursId: 'GC1' } });
        c.win.afficherRencontres();
        const p = c.elements.conteneurRencontres.innerHTML;
        expect(p).toContain('>Créer un service d’orthopédagogie</button>');
        expect(p).toMatch(/Les rencontres d'orthopédagogie se tiennent dans un <strong>service d’orthopédagogie<\/strong>/);
        expect(p).toContain('un cours de nature « Orthopédagogie »');
        expect(p).toContain('Tu es orthopédagogue');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('F · les infobulles du Cadre et du sous-onglet sont bâties sur le point unique', () => {
    it('« reglages-cours » nomme les deux natures ; « nav-suivi-rencontres » nomme le service d’orthopédagogie', () => {
        let entrees = null;
        const win = { addEventListener() {}, accompagnement: { ajouterEntrees: (e) => { entrees = e; } } };
        chargerScript('js/accompagnement-contenu-hover.js', {}, win);
        expect(entrees['reglages-cours'].hover).toContain('ton service d’orthopédagogie');
        expect(entrees['reglages-cours'].hover).toContain('Un cours d’enseignement porte les informations du devis ministériel');
        expect(entrees['nav-suivi-rencontres'].hover).toContain('Un service d’orthopédagogie se crée ici en trois questions.');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// JOURNAL DES BREAK-TESTS (12 septembre 2026, 8 h) — chaque mutation rendue, la sentinelle relancée,
// le code remis (empreinte SHA-256 identique vérifiée) ; témoin : code intact = 0 rouge :
//   1. mots-nature.js : nature 'Orthopédagogie' → 'Service' ....................... 5 rouges (A, B ×2, D, E)
//   2. index.html : <option value="service">Service</option> remis en dur ........... 1 rouge (A verrou options)
//   3. trimestre-v2-groupes-cours.js : « - Service » remis en dur ................... 2 rouges (A verrou js, D)
//   4. trimestre-v2-orchestre.js : appliquerMotsNatureCadre ignore le contexte ...... 1 rouge (C)
//   5. trimestre-v2-cours.js : _lireChampsInfosCoursDOM force nature 'cours' ........ 1 rouge (B aller-retour)
//   6. rencontres.js : « Créer mon service » remis en dur ........................... 1 rouge (E)
//   7. accompagnement-contenu-hover.js : infobulle statique ......................... 1 rouge (F)
//   8. index.html : « Enseignant·e » → « Enseignant » sur une marque ................. 1 rouge (A dérive)
// Et une trouvaille du verrou A au premier passage : js/cours.js (bibliothèque des cours) écrivait
// « - Service » à deux endroits — site absent de la liste de la consigne, migré.
