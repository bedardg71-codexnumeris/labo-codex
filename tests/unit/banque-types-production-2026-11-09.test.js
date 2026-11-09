/**
 * LA BANQUE DE TYPES DE PRODUCTION — lot « Production plutôt que copie », étape 2 (9 nov. 2026)
 *
 * Ce que la consigne exige (§ Livraison, étape 2) : « un type créé revient dans un autre
 * trimestre, et une production qui le porte garde son nom après qu'on l'a retiré de la
 * banque ». Et les deux décisions de Grégoire (9 nov. 2026, 10 h 14 à 10 h 17) :
 *   (8) une production partagée ou importée emporte son nom de type, qui ne va que sur la
 *       production, jamais dans la banque de la personne qui la reçoit ;
 *   (9) renommer ou retirer un type de la banque ne réécrit aucune production, et le menu
 *       d'une production garde son type actuel, même retiré, même « Autre ».
 * Plus la règle de sécurité 1 : un type devient un texte libre, il passe par
 * `echapperHtml()` partout où il entre dans un `innerHTML`.
 *
 * ⮕ CHEMINS RÉELS : `js/productions.js` chargé dans le bac à sable, sur un vrai DOM (jsdom) ;
 * le menu est lu tel que le navigateur le montrerait (optgroup, option, valeur, texte).
 *
 * BREAK-TESTS (9 nov. 2026) : voir le rapport de l'étape 2 ; chaque essai « B » rougit
 * quand on retire la ligne de code qu'il garde.
 *
 * ⚠ Aucune donnée réelle : productions et noms fictifs.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import { chargerScript } from './_helpers/charger-script.js';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

function monter({ productions = [], banque = null, trimestre = 'a2026' } = {}) {
    const dom = new JSDOM('<!doctype html><body>'
        + '<select id="productionType"><option value="">— Sélectionner —</option></select>'
        + '<div id="tableauEvaluationsContainer"></div><div id="typesEvaluations"></div><div id="nombreEvaluations"></div>'
        + '</body>');
    const store = {};
    const etat = { trimestre };
    const ecritures = [];
    const db = {
        getSync: (k, d) => (k in store ? JSON.parse(JSON.stringify(store[k])) : (d !== undefined ? d : null)),
        setSync: (k, v) => { ecritures.push(k); store[k] = JSON.parse(JSON.stringify(v)); },
        get: async (k, d) => (k in store ? JSON.parse(JSON.stringify(store[k])) : (d !== undefined ? d : null)),
        set: async (k, v) => { ecritures.push(k); store[k] = JSON.parse(JSON.stringify(v)); }
    };
    const echapperHtml = (t) => (t == null ? '' : String(t)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;'));
    const globaux = {
        db,
        cle: (k) => `${etat.trimestre}_${k}`,
        echapperHtml,
        document: dom.window.document,
        Event: dom.window.Event,
        obtenirCoursActifId: () => null,
        GabaritsUtils: { lirePratiquesSelectionnees: () => [] },
        alert: () => {},
        requestAnimationFrame: (fn) => { fn(); return 0; }
    };
    const win = chargerScript('js/productions.js', globaux);
    store[`${trimestre}_productions`] = productions;
    if (banque) store.banqueTypesProduction = banque;
    const select = dom.window.document.getElementById('productionType');
    /** Le menu tel qu'il se lit : [{ groupe, valeur, texte }]. */
    const menu = () => Array.from(select.options).map(o => ({
        groupe: o.parentElement && o.parentElement.tagName === 'OPTGROUP' ? o.parentElement.label : null,
        valeur: o.value,
        texte: o.textContent
    }));
    return { win, dom, store, etat, ecritures, select, menu };
}

const prod = (id, titre, type) => ({ id, titre, type, ponderation: 10, dansBibliotheque: true, grilleId: '' });

describe('Banque · B1 — un type créé revient dans un autre trimestre', () => {
    it('« Prise de sang » s\'écrit dans la clé GLOBALE, et le menu d\'un autre trimestre l\'offre', () => {
        const m = monter({ trimestre: 'a2026' });
        const r = m.win.ajouterTypeBanqueProduction('Prise de sang');
        expect(r).toEqual({ statut: 'nouveau', valeur: 'Prise de sang' });
        expect(m.ecritures).toEqual(['banqueTypesProduction']);
        expect(Object.keys(m.store).filter(k => /banqueTypes/.test(k))).toEqual(['banqueTypesProduction']);

        m.etat.trimestre = 'h2027';                     // un autre trimestre
        expect(m.win.lireBanqueTypesProduction().types).toEqual(['Prise de sang']);
        m.win.remplirMenuTypesProduction(m.select, '');
        expect(m.menu()).toContainEqual({ groupe: 'Mes types', valeur: 'Prise de sang', texte: 'Prise de sang' });
    });
});

describe('Banque · B2 — retirer un type ne touche aucune production (décision 9)', () => {
    it('la production garde son nom de type, et son menu le garde aussi', () => {
        const productions = [prod('P1', 'Bilan sanguin', 'Prise de sang')];
        const m = monter({ productions, banque: { types: ['Prise de sang'], exemplesMasques: [] } });
        const avant = JSON.stringify(m.store.a2026_productions);

        expect(m.win.retirerTypeBanqueProduction('Prise de sang')).toBe(true);
        expect(JSON.stringify(m.store.a2026_productions)).toBe(avant);
        expect(m.ecritures).toEqual(['banqueTypesProduction']);
        expect(m.win.lireBanqueTypesProduction().types).toEqual([]);
        expect(m.win.getTypeLabel('Prise de sang')).toBe('Prise de sang');

        // Le menu de CETTE production garde son type, choisi.
        m.win.remplirMenuTypesProduction(m.select, 'Prise de sang');
        expect(m.select.value).toBe('Prise de sang');
        expect(m.menu()).toContainEqual({ groupe: 'Mes types', valeur: 'Prise de sang', texte: 'Prise de sang' });
        // Celui d'une production neuve ne l'offre plus.
        m.win.remplirMenuTypesProduction(m.select, '');
        expect(m.menu().map(o => o.valeur)).not.toContain('Prise de sang');
    });

    it('renommer vaut pour la suite : la production garde l\'ancien nom, le menu offre les deux', () => {
        const productions = [prod('P1', 'Bilan sanguin', 'Prise de sang')];
        const m = monter({ productions, banque: { types: ['Prise de sang'], exemplesMasques: [] } });
        const avant = JSON.stringify(m.store.a2026_productions);
        expect(m.win.renommerTypeBanqueProduction('Prise de sang', 'Prélèvement')).toEqual({ statut: 'ok', valeur: 'Prélèvement' });
        expect(JSON.stringify(m.store.a2026_productions)).toBe(avant);
        m.win.remplirMenuTypesProduction(m.select, 'Prise de sang');
        const mes = m.menu().filter(o => o.groupe === 'Mes types').map(o => o.valeur);
        expect(mes).toEqual(['Prélèvement', 'Prise de sang']);
        expect(m.select.value).toBe('Prise de sang');
    });

    it('une production « Autre » garde « Autre », absent du menu d\'une production neuve', () => {
        const m = monter();
        m.win.remplirMenuTypesProduction(m.select, 'autre');
        expect(m.select.value).toBe('autre');
        expect(m.menu()).toContainEqual({ groupe: 'Productions', valeur: 'autre', texte: 'Autre' });
        expect(m.win.getTypeLabel('autre')).toBe('Autre');
        m.win.remplirMenuTypesProduction(m.select, '');
        expect(m.menu().map(o => o.valeur)).not.toContain('autre');
    });

    it('un type venu d\'un·e collègue (absent de la banque) reste choisi, sans entrer dans la banque (décision 8)', () => {
        const m = monter({ productions: [prod('P9', 'Reçue', 'Entrevue filmée')] });
        m.win.remplirMenuTypesProduction(m.select, 'Entrevue filmée');
        expect(m.select.value).toBe('Entrevue filmée');
        expect(m.win.lireBanqueTypesProduction().types).toEqual([]);
        expect(m.ecritures).toEqual([]);
    });
});

describe('Banque · B3 — le menu « Type », tel que Grégoire l\'a arrêté (8 nov. 2026)', () => {
    const EXEMPLES = ['Examen', 'Travail écrit', 'Quiz/Test', 'Présentation', 'Entrevue', 'Laboratoire',
        'Démonstration pratique', 'Stage', 'Projet', 'Œuvre', 'Maquette', 'Photographie', 'Film', 'Enregistrement'];

    it('les exemples dans l\'ordre, puis Portfolio, puis Épreuve terminale, puis la banque, puis les deux gestes', () => {
        const m = monter({ banque: { types: ['Prise de sang'], exemplesMasques: [] } });
        m.win.remplirMenuTypesProduction(m.select, '');
        const lu = m.menu();
        expect(lu[0]).toEqual({ groupe: null, valeur: '', texte: '— Sélectionner —' });
        expect(lu.filter(o => o.groupe === 'Productions').map(o => o.texte)).toEqual(EXEMPLES);
        expect(lu.filter(o => o.groupe === 'Portfolio').map(o => o.texte)).toEqual(['Portfolio (conteneur)', 'Artefact']);
        expect(lu.filter(o => o.groupe === 'Épreuve terminale')).toEqual([{ groupe: 'Épreuve terminale', valeur: 'terminale', texte: 'Épreuve terminale' }]);
        expect(lu.slice(-3)).toEqual([
            { groupe: 'Mes types', valeur: 'Prise de sang', texte: 'Prise de sang' },
            { groupe: null, valeur: '__nouveau-type__', texte: '+ Nouveau type…' },
            { groupe: null, valeur: '__gerer-types__', texte: 'Gérer mes types…' }
        ]);
        const groupes = Array.from(m.select.querySelectorAll('optgroup')).map(g => g.label);
        expect(groupes).toEqual(['Productions', 'Portfolio', 'Épreuve terminale', 'Mes types']);
        expect(lu.map(o => o.texte)).not.toContain('Évaluation terminale');
        expect(groupes).not.toContain('Évaluations');
    });

    it('les identifiants des types existants ne changent pas', () => {
        const m = monter();
        const ids = m.win.TYPES_PRODUCTION.map(t => t.id);
        for (const id of ['examen', 'travail', 'quiz', 'laboratoire', 'presentation', 'entrevue', 'projet', 'stage', 'autre', 'portfolio', 'artefact-portfolio', 'terminale']) {
            expect(ids, id).toContain(id);
        }
    });

    it('un exemple retiré de la vue sort du menu, sauf pour la production qui le porte', () => {
        const m = monter();
        expect(m.win.basculerExempleTypeProduction('film', false)).toBe(true);
        m.win.remplirMenuTypesProduction(m.select, '');
        expect(m.menu().map(o => o.valeur)).not.toContain('film');
        m.win.remplirMenuTypesProduction(m.select, 'film');
        expect(m.select.value).toBe('film');
        // L'écrire dans « + Nouveau type… » le fait revenir, sans créer de doublon.
        expect(m.win.ajouterTypeBanqueProduction('film ')).toEqual({ statut: 'exemple', valeur: 'film' });
        expect(m.win.lireBanqueTypesProduction()).toEqual({ types: [], exemplesMasques: [] });
    });

    it('le portfolio, l\'artefact et l\'épreuve terminale ne se retirent pas de la vue', () => {
        const m = monter();
        for (const id of ['portfolio', 'artefact-portfolio', 'terminale', 'autre']) {
            expect(m.win.basculerExempleTypeProduction(id, false), id).toBe(false);
        }
    });
});

describe('Banque · B4 — les noms qu\'on ne peut pas prendre', () => {
    it('vide, réservé, déjà là', () => {
        const m = monter({ banque: { types: ['Prise de sang'], exemplesMasques: [] } });
        const a = (n) => m.win.analyserNomTypeProduction(n);
        expect(a('   ').statut).toBe('vide');
        for (const n of ['Portfolio', 'portfolio (conteneur)', 'Artefact', 'Artefact d\'un portfolio', 'Épreuve terminale', 'terminale', 'Autre', 'examen-formatif', '__gerer-types__']) {
            expect(a(n).statut, n).toBe('reserve');
        }
        expect(a('Quiz/test')).toEqual({ statut: 'exemple', valeur: 'quiz' });
        expect(a('  prise   de SANG ')).toEqual({ statut: 'banque', valeur: 'Prise de sang' });
        expect(a('x'.repeat(80)).valeur).toHaveLength(50);
        expect(m.win.renommerTypeBanqueProduction('Prise de sang', 'Stage').statut).toBe('pris');
        expect(m.win.renommerTypeBanqueProduction('Prise de sang', 'Portfolio').statut).toBe('reserve');
        expect(m.win.lireBanqueTypesProduction().types).toEqual(['Prise de sang']);
    });
});

describe('Banque · B5 — « formatif » ne touche que les identifiants connus', () => {
    it('« examen-formatif » l\'est ; « Quiz formatif », nommé par la personne, ne l\'est pas', () => {
        const m = monter();
        expect(m.win.estTypeFormatif('examen-formatif')).toBe(true);
        expect(m.win.estTypeFormatif('Quiz formatif')).toBe(false);
        expect(m.win.estTypeFormatif('formatif')).toBe(false);
        expect(m.win.estTypeFormatif('inconnu-formatif')).toBe(false);
        expect(m.win.estTypeFormatif(undefined)).toBe(false);
        // Aucun `includes('formatif')` ne reste dans les modules des productions.
        for (const f of ['js/productions.js', 'js/productions-liste.js']) {
            expect(readFileSync(path.join(racine, f), 'utf8'), f).not.toMatch(/\.includes\('formatif'\)/);
        }
    });
});

describe('Banque · B6 — un type est un texte libre : il est échappé (règle de sécurité 1)', () => {
    const PIEGE = '<img src=x onerror="alert(1)">';

    it('le menu le montre en texte, jamais en HTML', () => {
        const m = monter({ banque: { types: [PIEGE], exemplesMasques: [] } });
        m.win.remplirMenuTypesProduction(m.select, '');
        expect(m.select.querySelector('img')).toBeNull();
        expect(m.menu()).toContainEqual({ groupe: 'Mes types', valeur: PIEGE, texte: PIEGE });
    });

    it('la liste des productions (Conception › Productions) l\'échappe', async () => {
        const m = monter({ productions: [prod('P1', 'Piège', PIEGE)] });
        m.win.boutonsReordonnerBloc = () => '';      // le module de l'ordre des blocs, hors de ce banc
        await m.win.afficherTableauProductions();
        const conteneur = m.dom.window.document.getElementById('tableauEvaluationsContainer');
        expect(conteneur.querySelector('img')).toBeNull();
        expect(conteneur.querySelector('input[readonly]').value).toBe(PIEGE);
    });

    it('les trois endroits du relevé passent par echapperHtml (source)', () => {
        const prods = readFileSync(path.join(racine, 'js/productions.js'), 'utf8');
        const imp = readFileSync(path.join(racine, 'js/productions-import-export.js'), 'utf8');
        expect(prods).toContain('value="${echapperHtml(getTypeLabel(prod.type))}"');
        expect(prods).toMatch(/production-compact-meta">\s*\$\{echapperHtml\(getTypeLabel\(prod\.type\)\)\}/);
        expect(imp).toContain('<td style="text-align: center;">${echapperHtml(getTypeLabel(prod.type))}</td>');
        // Et nulle part un getTypeLabel nu sur une ligne qui bâtit du HTML, dans ces deux fichiers
        // (un message d'avertissement, rendu par `echapperHtml` à l'affichage, ou un `textContent`,
        // peut le garder nu : il n'y a pas de balise sur sa ligne).
        for (const [f, src] of [['productions.js', prods], ['productions-import-export.js', imp]]) {
            const nues = src.split('\n').filter(l => l.includes('${getTypeLabel(') && l.includes('<'));
            expect(nues, f).toEqual([]);
        }
    });
});

describe('Banque · B7 — seule la personne écrit sa banque (décision 8)', () => {
    it('aucun module d\'import, de partage ou de codex n\'écrit `banqueTypesProduction`', () => {
        const fichiers = [];
        const parcourir = (d) => {
            for (const n of readdirSync(d)) {
                const p = path.join(d, n);
                if (statSync(p).isDirectory()) { if (n !== '_archives') parcourir(p); }
                else if (n.endsWith('.js')) fichiers.push(p);
            }
        };
        parcourir(path.join(racine, 'js'));
        const qui = fichiers.filter(f => readFileSync(f, 'utf8').includes('banqueTypesProduction'))
            .map(f => path.relative(racine, f)).sort();
        // productions.js l'écrit ; reserve.js la nomme pour l'archive d'un groupe (lecture).
        expect(qui).toEqual(['js/productions.js', 'js/reserve.js']);
        const reserve = readFileSync(path.join(racine, 'js/reserve.js'), 'utf8');
        expect(reserve).toMatch(/CLES_GLOBALES_INCLUSES = \[[\s\S]*'banqueTypesProduction'[\s\S]*\];/);
    });
});
