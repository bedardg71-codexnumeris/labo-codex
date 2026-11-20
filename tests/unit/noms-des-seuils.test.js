/**
 * LES NOMS DES DEUX SEUILS — décision de Grégoire, 19 nov. 2026, 17 h 20 à 17 h 24
 * (`plans de travail/CONSIGNE-LOT-2026-11-19-noms-des-seuils.md`).
 *
 * « Seuil minimal de réussite » (`seuilSuffisance`) et « Seuil de maîtrise » (`seuilMaitrise`), partout où une personne
 * les lit. La donnée ne bouge pas : mêmes clés, sur l'échelle, aucune migration.
 *
 * Ce que ce banc verrouille :
 *   N — L'ÉCRAN DE L'ÉCHELLE (`echelles.js`) : le titre, les deux menus, le paragraphe, le refus d'ordre, l'étape de la
 *       chaîne ; les clés inchangées.
 *   E — LES ÉTIQUETTES DE L'ÉDITEUR DE GRILLES (`grilles.js`) : la case du niveau qui porte un seuil de l'échelle montrée
 *       le dit à côté de son nom ; deux seuils sur le même niveau, deux étiquettes ; une échelle sans seuils, aucune
 *       étiquette et la case d'avant ; l'étiquette se lit, elle ne se règle pas.
 *
 * Break-tests : voir `plans de travail/RAPPORT-2026-11-19-noms-des-seuils.md`. Échelles, grilles et textes FICTIFS.
 */
import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const cle = (k) => 'a2032_' + k;
const K = cle('grillesTemplates');

const NIVEAUX = [
    { code: 'I', nom: 'Incomplet', min: 0, max: 59 }, { code: 'D', nom: 'En développement', min: 60, max: 74 },
    { code: 'M', nom: 'Maîtrisé', min: 75, max: 89 }, { code: 'E', nom: 'Étendu', min: 90, max: 100 }];
const echelle = (seuils) => Object.assign({ id: 'ECH_FICTIVE', nom: 'Échelle fictive', niveaux: NIVEAUX }, seuils);

/** `echelles.js` chargé dans un DOM de banc ; l'ordre des plages, celui de `profil-etudiant-calculs.js`, par le min. */
function chargerEchelles() {
    const dom = new JSDOM('<!doctype html><html><body></body></html>');
    const win = { ordonnerNiveauxParPlage: (n) => n.filter(x => x && x.code).map(x => ({ ...x, code: String(x.code).toUpperCase() }))
        .sort((a, b) => a.min - b.min).map((x, rang) => ({ ...x, rang })) };
    return chargerScript('js/echelles.js', {
        db: { getSync: (k, d) => d, get: async () => null, modifier: async () => {} }, cle,
        document: dom.window.document, echapperHtml: (s) => String(s == null ? '' : s)
    }, win);
}
const E = chargerEchelles();

function vraiEchapperHtml(document) {
    const src = readFileSync(path.join(racine, 'js', 'config.js'), 'utf8');
    const fabriquer = new Function('window', 'document', 'console', 'localStorage', 'sessionStorage',
        '"use strict";\n' + src + '\nreturn echapperHtml;');
    const stockage = { getItem: () => null, setItem() {}, removeItem() {}, clear() {} };
    return fabriquer({ addEventListener() {}, removeEventListener() {} }, document, console, stockage, stockage);
}

/** L'éditeur de grilles, une grille composée à la main, l'échelle donnée ; les noms des seuils viennent d'`echelles.js`. */
function monterEditeur(ech, { sansNoms = false, noms = null } = {}) {
    const dom = new JSDOM('<!doctype html><html><body><div id="listeCriteres"></div></body></html>');
    const document = dom.window.document;
    const grille = { id: 'GR_F', nom: 'Grille fictive', criteres: [
        { id: 'C1', nom: 'Repérage fictif', type: 'holistique', ponderation: 60,
            descripteurs: { echelleId: ech.id, parNiveau: { D: 'Texte D fictif.', M: 'Texte M fictif.', Z: 'Texte d’un niveau hors échelle.' } } },
        { id: 'C2', nom: 'Points fictifs', type: 'analytique', ponderation: 40,
            bareme: [{ id: 'T1', nom: 'Juste', pointsMin: 4, pointsMax: 4, texte: 'Tout est juste.' }] }] };
    const store = { [K]: [grille], [cle('echellesTemplates')]: [ech] };
    const db = {
        get: async (k) => (k in store ? JSON.parse(JSON.stringify(store[k])) : null),
        getSync: (k, d) => (k in store ? JSON.parse(JSON.stringify(store[k])) : d),
        set: async (k, v) => { store[k] = v; }, setSync: (k, v) => { store[k] = v; },
        modifier: async (k, m, d) => { const r = await m(k in store ? JSON.parse(JSON.stringify(store[k])) : d); if (r !== undefined) store[k] = r; return r; }
    };
    const echapperHtml = vraiEchapperHtml(document);
    const win = { echapperHtml };
    if (!sansNoms) win.REPERES_ECHELLE = noms || E.REPERES_ECHELLE;
    chargerScript('js/temoin-enregistrement.js', { document }, win);
    win.temoinEnregistrement = { enregistre() {}, fermer() {}, nonEnregistre() {} };
    chargerScript('js/ui-blocs.js', { document }, win);
    chargerScript('js/bareme.js', {}, win);
    let n = 0;
    chargerScript('js/grilles.js', { db, cle, document, echapperHtml, confirm: () => true, genererIdUnique: (p) => p + (++n),
        notifications: { succes() {}, erreur() {}, info() {} }, grilleTemplateActuelle: null }, win);
    win.afficherCriteresGrille(JSON.parse(JSON.stringify(grille)));
    const carte = (i) => document.querySelectorAll('#listeCriteres .item-liste')[i];
    const cases = () => [...carte(0).querySelectorAll('.grille-attendu > .grille-attendu-niveaux .grille-attendu-niveau')];
    /** [nom du niveau, étiquettes] pour chaque case de niveau, dans l'ordre de l'échelle. */
    const lu = () => cases().map(c => [c.querySelector('strong').textContent, [...c.querySelectorAll('.grille-attendu-seuil')].map(s => s.textContent)]);
    return { win, document, carte, cases, lu };
}

/* ============================================================ N — l'écran de l'échelle */

describe('noms des seuils · N — l’écran de l’échelle', () => {
    it('N.a les deux menus prennent les nouveaux noms ; les clés ne bougent pas', () => {
        expect(E.REPERES_ECHELLE).toEqual({ seuilSuffisance: 'Seuil minimal de réussite', seuilMaitrise: 'Seuil de maîtrise' });
    });

    it('N.b le titre, les menus et le paragraphe, mot pour mot ; plus aucun ancien mot', () => {
        const html = E.blocReperesEchelle(echelle({ seuilSuffisance: 'D', seuilMaitrise: 'M' }));
        const div = new JSDOM(`<div>${html}</div>`).window.document.querySelector('div');
        expect(div.querySelector('h4').textContent).toBe('Seuils de réussite et de maîtrise');
        expect([...div.querySelectorAll('label')].map(l => l.textContent)).toEqual(['Seuil minimal de réussite', 'Seuil de maîtrise']);
        expect(div.querySelector('p').textContent.replace(/\s+/g, ' ').trim()).toBe('Ces deux seuils disent à l\'application où commence '
            + 'l\'apprentissage suffisant, et où il est acquis. Sans eux, elle ne peut pas savoir quels critères présenter à l\'élève '
            + 'comme des priorités. Les poser sur le même niveau revient à n\'en avoir qu\'un.');
        expect(div.textContent).not.toMatch(/Repère|Suffisant à partir|Maîtrisé à partir/);
        // Les menus écrivent toujours les mêmes champs.
        expect([...div.querySelectorAll('select')].map(s => s.dataset.champ)).toEqual(['seuilSuffisance', 'seuilMaitrise']);
    });

    it('N.c le refus d’un ordre inversé, et l’étape de la chaîne, disent « seuil »', () => {
        expect(E.refusRepereEchelle(echelle({ seuilMaitrise: 'D' }), 'seuilSuffisance', 'M'))
            .toBe('Le seuil minimal de réussite ne peut pas être plus haut que le seuil de maîtrise.');
        const etape = E.etapesChaineEchelle(echelle({ seuilSuffisance: 'D', seuilMaitrise: 'M' }), []).find(x => x.id === 'reperes');
        expect([etape.libelle, etape.info]).toEqual(['Seuils', 'D · M']);
    });
});

/* ============================================================ E — les étiquettes de l'éditeur de grilles */

describe('noms des seuils · E — les étiquettes dans « Ce qui est attendu à chaque niveau »', () => {
    it('E.a avec ses deux seuils : D dit « Seuil minimal de réussite », M dit « Seuil de maîtrise », les autres rien', () => {
        const m = monterEditeur(echelle({ seuilSuffisance: 'D', seuilMaitrise: 'M' }));
        expect(m.lu()).toEqual([['Incomplet', []], ['En développement', ['Seuil minimal de réussite']], ['Maîtrisé', ['Seuil de maîtrise']], ['Étendu', []]]);
        // L'étiquette est à côté du nom, dans la case du niveau, avant son champ.
        const caseD = m.cases()[1];
        expect(caseD.querySelector('.grille-attendu-niveau-entete strong + .grille-attendu-seuil')).not.toBeNull();
        expect(caseD.firstElementChild.nextElementSibling.tagName).toBe('TEXTAREA');
    });

    it('E.b les deux seuils sur le même niveau : les deux étiquettes, réussite puis maîtrise', () => {
        const m = monterEditeur(echelle({ seuilSuffisance: 'M', seuilMaitrise: 'M' }));
        expect(m.lu()).toEqual([['Incomplet', []], ['En développement', []], ['Maîtrisé', ['Seuil minimal de réussite', 'Seuil de maîtrise']], ['Étendu', []]]);
    });

    it('E.c une échelle sans seuils (ou avec un seul) : aucune étiquette de trop, et la case d’avant, au caractère près', () => {
        const sans = monterEditeur(echelle({}));
        expect(sans.lu().every(([, e]) => e.length === 0)).toBe(true);
        expect(sans.carte(0).querySelector('.grille-attendu-niveau-entete')).toBeNull();
        sans.cases().forEach(c => expect(c.firstElementChild.tagName).toBe('STRONG'));
        // Même HTML que sans aucun nom de seuil chargé : rien d'autre ne change.
        expect(sans.carte(0).innerHTML).toBe(monterEditeur(echelle({}), { sansNoms: true }).carte(0).innerHTML);
        const un = monterEditeur(echelle({ seuilMaitrise: 'E' }));
        expect(un.lu()).toEqual([['Incomplet', []], ['En développement', []], ['Maîtrisé', []], ['Étendu', ['Seuil de maîtrise']]]);
    });

    it('E.d un seuil écrit autrement que le code (casse, espaces) retrouve son niveau ; un seuil vers un niveau absent, rien', () => {
        expect(monterEditeur(echelle({ seuilSuffisance: ' d ', seuilMaitrise: 'm' })).lu().map(([, e]) => e.length)).toEqual([0, 1, 1, 0]);
        expect(monterEditeur(echelle({ seuilSuffisance: 'Q', seuilMaitrise: 'R' })).lu().every(([, e]) => e.length === 0)).toBe(true);
    });

    it('E.e l’étiquette se lit, elle ne se règle pas ; ni les textes gardés, ni le critère en points n’en portent', () => {
        const m = monterEditeur(echelle({ seuilSuffisance: 'D', seuilMaitrise: 'M' }));
        m.carte(0).querySelectorAll('.grille-attendu-niveau-entete').forEach(e => {
            expect(e.querySelectorAll('input, select, textarea, button, [data-action], [data-on-change]')).toHaveLength(0);
        });
        expect(m.carte(0).querySelectorAll('.grille-attendu-hors .grille-attendu-seuil')).toHaveLength(0);
        expect(m.carte(1).querySelectorAll('.grille-attendu-seuil')).toHaveLength(0);
    });

    it('E.f les mots viennent de l’écran de l’échelle, une seule source ; échappés', () => {
        const src = readFileSync(path.join(racine, 'js', 'grilles.js'), 'utf8');
        expect(src).not.toMatch(/['"`]Seuil minimal de réussite['"`]|['"`]Seuil de maîtrise['"`]/);
        const piege = { seuilSuffisance: '<img src=x onerror=alert(1)>', seuilMaitrise: 'Seuil de maîtrise' };
        const m = monterEditeur(echelle({ seuilSuffisance: 'D', seuilMaitrise: 'M' }), { noms: piege });
        expect(m.carte(0).querySelectorAll('img[src="x"], [onerror]').length).toBe(0);
        expect(m.carte(0).querySelector('.grille-attendu-seuil').textContent).toBe(piege.seuilSuffisance);
    });
});
