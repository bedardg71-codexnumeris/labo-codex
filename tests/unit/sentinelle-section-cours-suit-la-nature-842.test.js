import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE — LA SECTION COURS DU CADRE PARLE LES DEUX MÉTIERS, SANS SE CONTREDIRE
// (#841 et #842 ; consigne du 12 septembre 2026, 8 h 55 — décision 3.4 de la porte des étiquettes).
//
// Grégoire : « On devrait peut-être renommer cette section "cours/service" et l'adapter selon le
// choix qui est fait par l'utilisateur. » Comme la veille : aucun comportement, aucune donnée,
// aucune règle ne change — des mots, et un point unique (js/mots-nature.js).
//
// VERROUILLÉ ICI (les quatre de la consigne § 4, puis le reste du lot) :
//   1. #841 — l'option vide de chaque menu de personne vient du point unique AU MOMENT où le menu
//      se reconstruit (le défaut : appliquerMotsNatureCadre posait le mot, puis
//      populerDropdownEnseignantsV2 le réécrivait « — Sélectionner — » en dur : le dernier qui
//      écrit gagnait) ; et « le dernier qui écrit » dit maintenant le même mot, dans les deux ordres ;
//   2. verrou structurel étendu — aucune option vide nommant une personne n'est écrite en dur, ni
//      dans js/, ni dans index.html (sauf portée par data-mot-nature) ; les trois reconstructions
//      lisent le point unique ;
//   3. la phrase des éléments obligatoires suit la nature, et n'annonce plus l'horaire comme
//      obligatoire sur un service (la contradiction de l'écran du 12 sept.) ;
//   4. hors service, tous les mots de la section Cours sont ceux de 1.136.0 — mesurés au harnais
//      du pack démo AVANT le lot — SAUF deux, nommés : le titre de la section (« Cours et services »,
//      mot proposé, décision 3.4) et l'option vide du sélecteur de profil (« — Sélectionner — » →
//      « Sélectionner un enseignant·e », le mot que le point unique portait déjà depuis 1.136.0) ;
//   5. #842 — le TITRE du formulaire et le bandeau suivent la FICHE (menu Nature) : « Nouveau cours »
//      / « Nouveau service », « Modifier le service », « Dupliquer le service », bandeau « Service » ;
//      la synthèse vide et le menu Cours suivent le CONTEXTE ACTIF ;
//   6. l'infobulle du groupe-cours nomme les deux natures.
//
// LAISSÉ EXPRÈS, et verrouillé tel quel : « + Nouveau cours » et « … ou crée un nouveau cours » —
// liés au DÉFAUT du menu Nature (un formulaire neuf s'ouvre sur « Enseignement ») : faire suivre le
// bouton sans faire suivre le défaut contredirait l'écran ; faire suivre le défaut est un
// comportement (consigne § 5 : arrêter, inscrire, remonter).
//
// BREAK-TESTS VÉRIFIÉS le 12 septembre 2026 — journal en fin de fichier.

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lire = (rel) => readFileSync(path.join(RACINE, rel), 'utf8');
const clone = (x) => JSON.parse(JSON.stringify(x));
const cle = (k) => (String(k).startsWith('test_') ? k : 'test_' + k);
const sansCommentaires = (code) => code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

function classList() { const s = new Set(); return { add(c) { s.add(c); }, remove(c) { s.delete(c); }, contains(c) { return s.has(c); }, toggle(c, f) { const v = f === undefined ? !s.has(c) : !!f; v ? s.add(c) : s.delete(c); return v; } }; }
function elementDom(id) {
    const el = { id, _html: '', textContent: '', value: '', placeholder: '', style: {}, dataset: {}, options: [], _attrs: {},
        get innerHTML() { return this._html; },
        // un select repeuplé : ses options se relisent depuis le HTML écrit (value + texte)
        set innerHTML(v) { this._html = v; this.options = [...String(v).matchAll(/<option value="([^"]*)"[^>]*>([^<]*)<\/option>/g)].map(m => ({ value: m[1], textContent: m[2] })); },
        classList: classList(), querySelector() { return null; }, querySelectorAll() { return []; }, addEventListener() {}, appendChild(c) { return c; },
        setAttribute(k, v) { this._attrs[k] = v; }, getAttribute(k) { return k in this._attrs ? this._attrs[k] : null; }, closest() { return null; }, focus() {}, scrollIntoView() {} };
    return el;
}
function fauxDocument(elements, marques) {
    return { getElementById: (id) => (elements[id] || (elements[id] = elementDom(id))), querySelector: () => null,
        querySelectorAll: (sel) => (sel === '[data-mot-nature]' ? (marques || []) : []),
        createElement: (t) => elementDom(t), addEventListener() {}, body: elementDom('body'), documentElement: { addEventListener() {} }, readyState: 'complete' };
}
function dbBanc(store) {
    return {
        getSync: (k, d) => (k in store ? clone(store[k]) : (d !== undefined ? d : null)),
        setSync: (k, v) => { store[k] = clone(v); }, removeSync: (k) => { delete store[k]; },
        get: async (k, d) => (k in store ? clone(store[k]) : (d !== undefined ? d : null)),
        set: async (k, v) => { store[k] = clone(v); },
        modifier: async (k, f, d) => { store[k] = clone(f(k in store ? clone(store[k]) : d)); },
    };
}
const ech = (s) => String(s == null ? '' : s);
function notifs() { const j = []; return { j, api: { succes(t, m) { j.push({ type: 'succes', t, m }); }, erreur(t, m) { j.push({ type: 'erreur', t, m }); }, info() {}, warning() {} } }; }
function monterMots() { return chargerScript('js/mots-nature.js', {}, { addEventListener() {} }); }

// Les mots de 1.136.0 hors service, tels que le harnais du pack démo les a lus AVANT le lot (12 sept., 9 h) —
// la ligne de contrôle du verrou 4. Ils ne bougent pas : un service actif est le seul cas qui les change.
const MOTS_1_136_0_HORS_SERVICE = {
    // #846 (12 sept., 10 h 25) : `choisirObjetGC` a quitté le point unique — le champ 2 ne suit plus la nature
    // (verrouillé dans sentinelle-accueil-porte-ortho-et-champ2-846.test.js).
    choisirObjet: 'Sélectionner un cours...', choisirPersonneGC: '— Choisir un enseignant —',
    aucunObjet: 'Aucun cours sélectionné', nouveau: 'Nouveau cours', modifier: 'Modifier le cours', dupliquer: 'Dupliquer le cours', Objet: 'Cours', objet: 'cours',
    elementsObligatoires: 'renseigne les 5 éléments obligatoires : trimestre, cours, numéro de groupe, horaire et enseignant·e. La pratique de notation est facultative.',
    nbElementsObligatoires: '5 éléments obligatoires', elementsObligatoiresForm: 'Renseigne les 5 éléments obligatoires (la pratique de notation est facultative).', horaireFacultatif: ''
};

// ─────────────────────────────────────────────────────────────────────────────
describe('1 · #841 — l\'option vide d\'un menu de personne vient du point unique quand le menu se reconstruit', () => {
    function monterEnseignants(etat) {
        const elements = {};
        const document = fauxDocument(elements);
        const win = { addEventListener() {} };
        chargerScript('js/trimestre-v2-enseignants.js', { document, db: dbBanc({ enseignants: [{ id: 'E1', prenom: 'Marie', nom: 'Tremblay' }] }),
            echapperHtml: ech, echapperAttribut: ech, notifications: notifs().api, contexteActifEstService: () => !!etat.service }, win);
        return { win, elements };
    }
    it('v2-selectEnseignant repeuplé : « Sélectionner un·e orthopédagogue » sur un service, « Sélectionner un enseignant·e » sur un cours ; les profils restent', () => {
        const etat = { service: true };
        const b = monterEnseignants(etat);
        b.win.populerDropdownEnseignantsV2();
        expect(b.elements['v2-selectEnseignant'].options.map(o => o.textContent)).toEqual(['Sélectionner un·e orthopédagogue', 'Marie Tremblay']);
        etat.service = false;
        b.win.populerDropdownEnseignantsV2();
        expect(b.elements['v2-selectEnseignant'].options.map(o => o.textContent)).toEqual(['Sélectionner un enseignant·e', 'Marie Tremblay']);
        expect(b.elements['v2-selectEnseignant'].innerHTML).not.toContain('— Sélectionner —');
    });

    it('v2-gc-enseignant repeuplé (populerDropdownsAssemblageV2) : « — Choisir un·e orthopédagogue — » sur un service ; v2-gc-cours ne suit plus (#846)', () => {
        const etat = { service: true };
        const elements = {};
        const document = fauxDocument(elements);
        const store = { trimestres: [], trimestreActif: '', cours: [{ id: 'S1', nature: 'service', nomCours: 'Aide' }], enseignants: [{ id: 'E1', prenom: 'Marie', nom: 'Tremblay' }] };
        const win = chargerScript('js/trimestre-v2.js', { document, db: dbBanc(store), cle, echapperHtml: ech, echapperAttribut: ech, contexteActifEstService: () => !!etat.service });
        win.populerDropdownsAssemblageV2();
        expect(elements['v2-gc-enseignant'].options[0].textContent).toBe('— Choisir un·e orthopédagogue —');
        expect(elements['v2-gc-enseignant'].options[1].textContent).toBe('Marie Tremblay');
        expect(elements['v2-gc-cours'].options[0].textContent, '#846 : le champ 2 nomme un choix, pas le contexte').toBe('— Choisir un cours ou un service —');
        etat.service = false;
        win.populerDropdownsAssemblageV2();
        expect(elements['v2-gc-enseignant'].options[0].textContent).toBe(MOTS_1_136_0_HORS_SERVICE.choisirPersonneGC);
        expect(elements['v2-gc-cours'].options[0].textContent).toBe('— Choisir un cours ou un service —');
    });

    it('le dernier qui écrit dit le même mot : appliquerMotsNatureCadre PUIS le repeuplement, et le repeuplement PUIS appliquerMotsNatureCadre', () => {
        const etat = { service: true };
        const elements = {};
        const document = fauxDocument(elements, []);
        const base = { document, db: dbBanc({ enseignants: [{ id: 'E1', prenom: 'Marie', nom: 'Tremblay' }] }), cle, echapperHtml: ech, echapperAttribut: ech,
            notifications: notifs().api, contexteActifEstService: () => !!etat.service };
        const orchestre = chargerScript('js/trimestre-v2-orchestre.js', base, { addEventListener() {} });
        const enseignants = chargerScript('js/trimestre-v2-enseignants.js', base, { addEventListener() {} });
        document.getElementById('v2-selectEnseignant').innerHTML = '<option value="">x</option>';
        orchestre.appliquerMotsNatureCadre();
        enseignants.populerDropdownEnseignantsV2();
        expect(elements['v2-selectEnseignant'].options[0].textContent, 'repeuplé après la pose des mots (le cas de #841)').toBe('Sélectionner un·e orthopédagogue');
        enseignants.populerDropdownEnseignantsV2();
        orchestre.appliquerMotsNatureCadre();
        expect(elements['v2-selectEnseignant'].options[0].textContent, 'pose des mots après le repeuplement').toBe('Sélectionner un·e orthopédagogue');
        etat.service = false;
        enseignants.populerDropdownEnseignantsV2();
        orchestre.appliquerMotsNatureCadre();
        expect(elements['v2-selectEnseignant'].options[0].textContent).toBe('Sélectionner un enseignant·e');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('2 · verrou structurel étendu — aucune option vide nommant une personne n\'est écrite en dur', () => {
    const NOMME_UNE_PERSONNE = /<option value="">[^<]*(enseignant|orthopédagogue|Sélectionner un·e)[^<]*<\/option>/i;

    it('js/ : aucune option vide nommant une personne ; les modules du Cadre n\'ont plus le « — Sélectionner — » nu des menus de personne', () => {
        const fichiers = readdirSync(path.join(RACINE, 'js')).filter(f => f.endsWith('.js'));
        const fautifs = [];
        for (const f of fichiers) {
            const code = sansCommentaires(lire('js/' + f));
            if (NOMME_UNE_PERSONNE.test(code)) fautifs.push(f);
        }
        expect(fautifs, 'le mot d\'une personne dans une option vide se lit dans js/mots-nature.js').toEqual([]);
        for (const f of ['trimestre-v2-enseignants.js', 'trimestre-v2-orchestre.js', 'trimestre-v2.js']) {
            expect(sansCommentaires(lire('js/' + f)), f).not.toMatch(/<option value="">— Sélectionner —<\/option>/);
        }
    });

    it('les trois reconstructions lisent le contexte actif depuis le point unique, au moment de construire', () => {
        const ens = sansCommentaires(lire('js/trimestre-v2-enseignants.js'));
        const corpsEns = ens.slice(ens.indexOf('function populerDropdownEnseignantsV2()'), ens.indexOf('function chargerEnseignantSelectionneV2()'));
        expect(corpsEns).toMatch(/<option value="">' \+ motsNatureContexteActif\(\)\.choisirPersonne \+ '<\/option>/);
        const tv2 = sansCommentaires(lire('js/trimestre-v2.js'));
        const corpsTv2 = tv2.slice(tv2.indexOf('function populerDropdownsAssemblageV2()'));
        expect(corpsTv2).toMatch(/<option value="">' \+ motsNatureContexteActif\(\)\.choisirPersonneGC \+ '<\/option>/);
        // #846 : le champ 2 ne lit plus le contexte — il nomme un choix (verrou dans la sentinelle 846).
        expect(corpsTv2).toMatch(/<option value="">— Choisir un cours ou un service —<\/option>/);
        const cours = sansCommentaires(lire('js/trimestre-v2-cours.js'));
        expect(cours).toMatch(/<option value="">' \+ echapperHtml\(motsNatureContexteActif\(\)\.choisirObjet\) \+ '<\/option>/);
    });

    it('index.html : une option vide qui nomme une personne porte data-mot-nature (le point unique la re-pose)', () => {
        const html = lire('index.html');
        const options = [...html.matchAll(/<option value=""[^>]*>([^<]*)<\/option>/g)];
        expect(options.length).toBeGreaterThan(10);
        const fautives = options.filter(m => /enseignant|orthopédagogue/i.test(m[1]) && !/data-mot-nature="/.test(m[0]));
        expect(fautives.map(m => m[0])).toEqual([]);
        expect(html).toMatch(/<option value="" data-mot-nature="choisirPersonneGC">— Choisir un enseignant —<\/option>/);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('3 · la phrase des éléments obligatoires suit la nature, et n\'annonce plus l\'horaire comme obligatoire sur un service', () => {
    it('le point unique : 5 éléments et l\'horaire pour un cours ; 4 éléments, l\'horaire facultatif, pour un service', () => {
        const w = monterMots();
        const c = w.motsNature('cours'), s = w.motsNature('service');
        expect(c.elementsObligatoires).toBe(MOTS_1_136_0_HORS_SERVICE.elementsObligatoires);
        expect(s.elementsObligatoires).toMatch(/^renseigne les 4 éléments obligatoires : /);
        expect(s.elementsObligatoires.split(/\. /)[0], 'l\'horaire n\'est pas dans la liste des obligatoires').not.toMatch(/horaire/);
        expect(s.elementsObligatoires).toMatch(/L’horaire et la pratique de notation sont facultatifs\.$/);
        expect(s.elementsObligatoires).toContain('service d’orthopédagogie');
        expect(s.elementsObligatoires).toContain('orthopédagogue');
        expect(s.nbElementsObligatoires).toBe('4 éléments obligatoires');
        expect(s.elementsObligatoiresForm).toMatch(/^Renseigne les 4 éléments obligatoires \(l’horaire et la pratique de notation sont facultatifs\)\.$/);
        expect(s.horaireFacultatif).toBe(' (facultatif)');
        expect(c.horaireFacultatif).toBe('');
    });

    it('appliquerMotsNatureCadre pose la phrase, le compte, le suffixe de l\'horaire et la synthèse vide, dans les deux sens', () => {
        const w = monterMots();
        const cles = ['elementsObligatoires', 'nbElementsObligatoires', 'horaireFacultatif', 'elementsObligatoiresForm', 'aucunObjet', 'Objet', 'objet'];
        const marques = cles.map((k, i) => { const el = elementDom('m' + i); el.setAttribute('data-mot-nature', k); el.textContent = w.MOTS_NATURE.cours[k]; return el; });
        const etat = { service: true };
        const elements = {};
        const win = chargerScript('js/trimestre-v2-orchestre.js', { document: fauxDocument(elements, marques), db: dbBanc({}), cle, echapperHtml: ech, notifications: notifs().api,
            contexteActifEstService: () => !!etat.service }, { addEventListener() {} });
        win.appliquerMotsNatureCadre();
        expect(marques.map(m => m.textContent)).toEqual(cles.map(k => w.MOTS_NATURE.service[k]));
        expect(marques[0].textContent).toMatch(/4 éléments obligatoires/);
        etat.service = false;
        win.appliquerMotsNatureCadre();
        expect(marques.map(m => m.textContent)).toEqual(cles.map(k => MOTS_1_136_0_HORS_SERVICE[k]));
    });

    it('index.html : les quatre sites de l\'accordéon Groupe-cours portent la marque, et aucun « 5 éléments obligatoires » n\'y reste hors marque', () => {
        const html = lire('index.html');
        const gc = html.slice(html.indexOf('id="accordeon-groupe-cours"'), html.indexOf('id="v2-gc-trimestre"'));
        expect(gc).toMatch(/<span data-mot-nature="elementsObligatoires">renseigne les 5 éléments obligatoires/);
        expect(gc).toMatch(/<span data-mot-nature="nbElementsObligatoires">5 éléments obligatoires<\/span>/);
        expect(gc).toMatch(/des séances<span data-mot-nature="horaireFacultatif"><\/span><\/li>/);
        expect(gc).toMatch(/data-mot-nature="elementsObligatoiresForm">Renseigne les 5 éléments obligatoires/);
        const horsMarque = [...gc.matchAll(/5 éléments obligatoires/g)].length;
        expect(horsMarque, 'chaque « 5 éléments obligatoires » est sous une marque').toBe(3);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('4 · hors service, les mots de la section Cours sont ceux de 1.136.0 (verrou de non-régression)', () => {
    it('le point unique, pour \'cours\', porte exactement les mots lus AVANT le lot', () => {
        const w = monterMots();
        for (const [k, v] of Object.entries(MOTS_1_136_0_HORS_SERVICE)) expect(w.MOTS_NATURE.cours[k], k).toBe(v);
        expect(w.motsNatureContexteActif(), 'sans contexte, les mots d\'un cours').toBe(w.MOTS_NATURE.cours);
    });
    it('index.html : le titre proposé « Cours et services » ; « + Nouveau cours » et la phrase du bandeau LAISSÉS (liés au défaut du menu Nature) ; l\'état vide suit sur son premier mot seulement', () => {
        const html = lire('index.html');
        const section = html.slice(html.indexOf('id="accordeon-cours"'), html.indexOf('id="v2-natureCours"'));
        expect(section).toMatch(/<span class="accordeon-chevron">▶<\/span> Cours et services/);
        expect(section).toContain('+ Nouveau cours\n');
        expect(section).toContain('Pour créer un nouveau cours, clique <strong>+ Nouveau cours</strong>.');
        expect(section).toContain('<label class="libelle-selection"><span data-mot-nature="Objet">Cours</span> :</label>');
        expect(section).toContain('<p class="etat-vide-resume" data-mot-nature="aucunObjet">Aucun cours sélectionné</p>');
        expect(section).toContain('<p>Sélectionne un <span data-mot-nature="objet">cours</span> pour l\'éditer ou crée un nouveau cours.</p>');
        expect(section).toContain('<strong>Mode modification</strong> — <span id="v2-bandeauObjet">Cours</span> <strong id="v2-bandeauCodeCours"></strong>.');
        expect(html).toContain('<span class="bc-label" data-mot-nature="Objet">Cours</span>');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('5 · #842 — le titre du formulaire et le bandeau suivent la FICHE ; la synthèse vide et le menu Cours suivent le CONTEXTE', () => {
    function monterForm(etat) {
        const elements = {};
        const document = fauxDocument(elements);
        elements['v2-natureCours'] = Object.assign(elementDom('v2-natureCours'), { options: [Object.assign(elementDom('o1'), { value: 'cours' }), Object.assign(elementDom('o2'), { value: 'service' })] });
        const store = { cours: [{ id: 'S1', nature: 'service', nomCours: 'Aide à la réussite' }, { id: 'C1', nature: 'cours', codeCours: '601-101-MQ', nomCours: 'Écriture' }], infoCours: null };
        const win = chargerScript('js/trimestre-v2-cours.js', { document, db: dbBanc(store), cle, notifications: notifs().api, echapperHtml: ech, echapperAttribut: ech,
            contexteActifEstService: () => !!etat.service, confirm: () => true, alert() {}, toggleDisplay() {}, setTimeout: () => 0 }, { addEventListener() {} });
        return { win, elements, store, document };
    }
    const titre = (b) => b.elements['v2-titreFormCours'].textContent;

    it('« Nouveau cours » ; le menu Nature bascule → « Nouveau service » ; et retour', async () => {
        const b = monterForm({ service: false });
        await b.win.nouveauCoursV2();
        expect(titre(b)).toBe('Nouveau cours');
        b.elements['v2-natureCours'].value = 'service'; b.win.changerNatureCoursV2();
        expect(titre(b)).toBe('Nouveau service');
        b.elements['v2-natureCours'].value = 'cours'; b.win.changerNatureCoursV2();
        expect(titre(b)).toBe('Nouveau cours');
    });

    it('sélectionner un service → « Modifier le service », bandeau « Service » + son nom ; un cours → « Modifier le cours », bandeau « Cours 601-101-MQ »', () => {
        const b = monterForm({ service: false });
        b.win.changerCoursSelectionneV2('S1');
        expect(titre(b)).toBe('Modifier le service');
        expect(b.elements['v2-bandeauObjet'].textContent).toBe('Service');
        expect(b.elements['v2-bandeauCodeCours'].textContent).toBe('Aide à la réussite');
        expect(b.elements['v2-labelNomCours'].innerHTML).toMatch(/^Nom du service/);
        b.win.changerCoursSelectionneV2('C1');
        expect(titre(b)).toBe('Modifier le cours');
        expect(b.elements['v2-bandeauObjet'].textContent).toBe('Cours');
        expect(b.elements['v2-bandeauCodeCours'].textContent).toBe('601-101-MQ');
    });

    it('« Modifier » et « Dupliquer » depuis le menu : « Modifier le service » / « Dupliquer le service » ; Annuler ferme le mode (le menu Nature ne re-titre plus)', async () => {
        const b = monterForm({ service: false });
        b.document.getElementById('v2-selectCours').value = 'S1';
        await b.win.modifierCoursSelectionneV2();
        expect(titre(b)).toBe('Modifier le service');
        b.win.dupliquerCoursSelectionneV2();
        expect(titre(b)).toBe('Dupliquer le service');
        expect(b.elements['v2-nomCours'].value).toBe('Aide à la réussite (copie)');
        await b.win.fermerFicheCoursV2();   // lot E2 : « Annuler » devient « Fermer » (sans saisie en création : aucune question)
        const apres = titre(b);
        b.elements['v2-natureCours'].value = 'service'; b.win.changerNatureCoursV2();
        expect(titre(b), 'formulaire fermé : rien à re-titrer').toBe(apres);
    });

    it('la synthèse vide et l\'option vide du menu Cours suivent le contexte actif : « Aucun service sélectionné », « Sélectionner un service... »', () => {
        const etat = { service: true };
        const b = monterForm(etat);
        b.win.afficherSyntheseCours(null);
        expect(b.elements['v2-apercuCoursSidebar'].innerHTML).toBe('<p class="etat-vide-resume" data-mot-nature="aucunObjet">Aucun service sélectionné</p>');
        b.win.chargerDropdownCoursV2();
        expect(b.elements['v2-selectCours'].options[0].textContent).toBe('Sélectionner un service...');
        etat.service = false;
        b.win.afficherSyntheseCours(null);
        expect(b.elements['v2-apercuCoursSidebar'].innerHTML).toBe('<p class="etat-vide-resume" data-mot-nature="aucunObjet">Aucun cours sélectionné</p>');
        b.win.chargerDropdownCoursV2();
        expect(b.elements['v2-selectCours'].options[0].textContent).toBe('Sélectionner un cours...');
    });

    it('la VALEUR ne bouge pas : ouvrir, re-titrer, enregistrer un service laisse nature \'service\' en base (rien d\'autre que des mots)', async () => {
        const b = monterForm({ service: false });
        const appels = [];
        const win = chargerScript('js/trimestre-v2-cours.js', { document: fauxDocument(b.elements), db: dbBanc(b.store), cle, notifications: notifs().api, echapperHtml: ech, echapperAttribut: ech,
            CoursEntite: { creer: async (d) => d, mettreAJour: async (id, d) => { appels.push({ id, d }); return Object.assign({ id }, d); }, chercherDoublonCode: async () => null },
            confirm: () => true, alert() {}, toggleDisplay() {}, setTimeout: () => 0 }, { addEventListener() {} });
        b.document.getElementById('v2-selectCours').value = 'S1';
        await win.modifierCoursSelectionneV2();
        await win.sauvegarderCoursV2();
        expect(appels.length).toBe(1);
        expect(appels[0].d.nature).toBe('service');
        expect(JSON.stringify(appels[0].d)).not.toMatch(/Modifier le service|Orthopédagogie/);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('6 · l\'infobulle du groupe-cours nomme les deux natures', () => {
    it('« reglages-groupe-cours » : ton cours ou ton service d’orthopédagogie', () => {
        let entrees = null;
        chargerScript('js/accompagnement-contenu-hover.js', {}, { addEventListener() {}, accompagnement: { ajouterEntrees: (e) => { entrees = e; } } });
        expect(entrees['reglages-groupe-cours'].hover).toContain('tu relies ici ton cours ou ton service d’orthopédagogie, ton groupe, ton horaire');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// JOURNAL DES BREAK-TESTS (12 septembre 2026, 9 h 15) — chaque mutation rendue, les trois sentinelles (celle-ci, les
// étiquettes, #306) relancées (36 essais), le code remis (empreinte SHA-256 identique vérifiée) ; témoin : code intact = 0 rouge :
//   1. trimestre-v2-enseignants.js : « — Sélectionner — » remis en dur (le défaut #841) ............ 4 rouges (1a, 1c, 2a, 2b)
//   2. trimestre-v2.js : « — Choisir un enseignant — » remis en dur ................................ 4 rouges (1b, 2a, 2b, 1c)
//   3. mots-nature.js : la phrase du service redit l'horaire obligatoire ............................ 2 rouges (3a, 3b)
//   4. mots-nature.js : « Modifier le service » pour un cours (dérive hors service) ................. 2 rouges (4a, 5b)
//   5. trimestre-v2-cours.js : le titre ignore le menu Nature ....................................... 3 rouges (5a, 5b, 5c)
//   6. trimestre-v2-orchestre.js : le sélecteur de profil retiré de la re-pose ...................... 1 rouge (étiquettes C)
//   7. index.html : option de personne en dur sans data-mot-nature .................................. 1 rouge (2c)
//   8. accompagnement-contenu-hover.js : infobulle du groupe-cours statique ......................... 1 rouge (6)
//   9. trimestre-v2-cours.js : le bandeau dit toujours « Cours » .................................... 1 rouge (5b)
//  10. trimestre-v2-cours.js : bouton de création « Ajouter » (l'ancre adaptée de #306 protège) ..... 1 rouge (#306 statique)
//  11. index.html : la phrase des cinq éléments sans sa marque (l'écran du 12 sept.) ................ 1 rouge (3c)
