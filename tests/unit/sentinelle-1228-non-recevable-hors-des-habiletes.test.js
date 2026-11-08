/**
 * #1228 (décision de Grégoire, 4 nov. 2026, vers 16 h 55, option 1 « même règle partout ») — « Une copie plagiée ou
 * « IA » ne dit rien des habiletés de l'élève : ses niveaux sortent aussi des moyennes par critère, de l'IPB, du défi
 * spécifique, des directions par critère et du registre longitudinal, comme ils sortent déjà des graphiques. »
 *
 * Un seul prédicat : `evaluationNonRecevable` (pratique-registre.js). La source seulement : rien n'est écrit ; une
 * capture déjà prise garde sa valeur. La NOTE d'une telle copie ne change pas (`noteRetenueParLeCalcul`, hors de ce banc).
 *
 * Mesuré au pack démo (WebKit, 8 nov.) : une seule copie non recevable (DEMO004, « Artefact 9 », plagiat), SANS niveau
 * (`criteres: []`). Aucun niveau RàI ne change ; seules les moyennes récentes de DEMO004 bougent (la copie vide prenait
 * une place dans la fenêtre des six plus récentes). Le cas que la décision vise — une copie évaluée, PUIS marquée
 * plagiat, ses niveaux gardés en base — n'existe pas en démo : ce banc le construit.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';
import { chargerPredicatsCopie } from './_helpers/predicats-copie.js';
import { tranche } from './_helpers/tranche.js';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const source = (rel) => readFileSync(path.join(RACINE, rel), 'utf8');
const clone = (x) => JSON.parse(JSON.stringify(x));
const r3 = (x) => Math.round(x * 1000) / 1000;

// Le montage de sentinelle-1055 (partie F), en sommative.
const DA = '2000007';
const ECHELLE = { id: 'E0', nom: 'IDME0', seuilMaitrise: 'M', niveaux: [
    { code: 'I', nom: 'Insuffisant', min: 0, max: 64, valeurCalcul: 40 }, { code: 'D', nom: 'En développement', min: 65, max: 74, valeurCalcul: 65 },
    { code: 'M', nom: 'Maîtrisé', min: 75, max: 84, valeurCalcul: 75 }, { code: 'E', nom: 'Étendu', min: 85, max: 100, valeurCalcul: 100 } ] };
const GRILLE = { id: 'G1', nom: 'Dépistage', criteres: [
    { id: 'c1', nom: 'Structure', ponderation: 50, niveauSOLO: 'multistructurel' },
    { id: 'c2', nom: 'Nuance', ponderation: 50, niveauSOLO: 'relationnel' }] };
const copie = (id, prod, jour, s, n, extra = {}) => Object.assign({ id, etudiantDA: DA, productionId: prod, noteFinale: 70, niveauFinal: s,
    echelleId: 'E0', grilleId: 'G1', ponderationCouverte: 100, verrouillee: true, dateEvaluation: `2026-03-${jour}T12:00:00.000Z`,
    criteres: [{ critereId: 'c1', critereNom: 'Structure', niveauSelectionne: s, ponderation: 50 },
               { critereId: 'c2', critereNom: 'Nuance', niveauSelectionne: n, ponderation: 50 }] }, extra);
const PRODUCTIONS = ['P1', 'P2', 'P3', 'P4'].map((id, i) => ({ id, titre: 'Analyse ' + (i + 1), type: 'travail' }));
const MODULES = ['js/interpretation-config.js', 'js/profil-etudiant-calculs.js', 'js/profil-etudiant-helpers.js'];
const EXPORTS = (() => { const n = new Set(); for (const f of MODULES) for (const m of source(f).matchAll(/^\s*window\.([A-Za-z_$][\w$]*)\s*=/gm)) n.add(m[1]); return [...n]; })();

function monter(evaluations) {
    const store = { test_evaluationsSauvegardees: evaluations, test_productions: PRODUCTIONS, test_echellesTemplates: [ECHELLE], test_grillesTemplates: [GRILLE] };
    const db = { getSync: (k, d) => (k in store ? clone(store[k]) : (d !== undefined ? d : null)), setSync: (k, v) => { store[k] = clone(v); }, get: async () => null, set: async () => {} };
    const win = { addEventListener() {}, removeEventListener() {}, obtenirTrimestreId: () => 'test', dateLocaleYMD: () => '2026-05-15' };
    new Function('window', source('js/entites/production-diagnostique.js'))(win);
    const fwd = (nom) => (...a) => win[nom](...a);
    const globaux = { db, cle: (k) => (String(k).startsWith('test_') ? k : 'test_' + k),
        obtenirDonneesSelonMode: (k) => clone(store['test_' + String(k).replace(/^test_/, '')] || []),
        obtenirPreference: (n) => (n === 'grilleReferenceDepistage' ? 'G1' : null), definirPreference() {}, echapperHtml: (s) => String(s == null ? '' : s),
        obtenirTypePratiqueActive: () => 'sommative', estEtudiantExclu: () => false,
        resoudreModeleParId: (type, id) => clone((store['test_' + (type === 'echelle' ? 'echellesTemplates' : 'grillesTemplates')] || []).find(m => m.id === id) || null) };
    for (const nom of EXPORTS) if (!(nom in globaux) && !/^[A-Z]/.test(nom)) globaux[nom] = fwd(nom);
    chargerPredicatsCopie(win);
    for (const f of MODULES) chargerScript(f, globaux, win);
    return win;
}

// Trois copies maîtrisées, puis la plus récente : évaluée I partout, et marquée plagiat.
const BASE = [copie('E1', 'P1', '02', 'M', 'M'), copie('E2', 'P2', '09', 'M', 'M'), copie('E3', 'P3', '16', 'M', 'E')];
const PLAGIEE = copie('E4', 'P4', '23', 'I', 'I', { statutIntegrite: 'plagiat' });
const RECEVABLE = copie('E4', 'P4', '23', 'I', 'I', { statutIntegrite: 'recevable' });

describe('#1228 — les niveaux d\'une copie non recevable sortent des calculs du profil', () => {
    it('0. les moyennes par critère : celles des trois autres copies (témoin : recevable, la copie I les tire vers le bas)', () => {
        const avec = monter([...BASE, PLAGIEE]).calculerMoyennesCriteres(DA);
        const sans = monter(BASE).calculerMoyennesCriteres(DA);
        expect(r3(avec.structure)).toBe(r3(sans.structure));
        expect(r3(avec.nuance)).toBe(r3(sans.nuance));
        const temoin = monter([...BASE, RECEVABLE]).calculerMoyennesCriteres(DA);
        expect(temoin.structure, 'témoin : recevable, elle compte').toBeLessThan(sans.structure);
    });

    it('1. les moyennes récentes (standards, PAN) : idem', () => {
        const avec = monter([...BASE, PLAGIEE]).calculerMoyennesCriteresRecents(DA);
        const sans = monter(BASE).calculerMoyennesCriteresRecents(DA);
        expect(r3(avec.structure)).toBe(r3(sans.structure));
        expect(monter([...BASE, RECEVABLE]).calculerMoyennesCriteresRecents(DA).structure, 'témoin').toBeLessThan(sans.structure);
    });

    it('2. le défi spécifique : celui des trois autres copies', () => {
        const avec = monter([...BASE, PLAGIEE]).identifierDefiSpecifique(DA);
        const sans = monter(BASE).identifierDefiSpecifique(DA);
        expect(avec).toEqual(sans);
        expect(monter([...BASE, RECEVABLE]).identifierDefiSpecifique(DA), 'témoin').not.toEqual(sans);
    });

    it('3 bis. l\'IPB : celui des trois autres copies (témoin : recevable, il change)', () => {
        const avec = JSON.stringify(monter([...BASE, PLAGIEE]).calculerIPB(DA));
        const sans = JSON.stringify(monter(BASE).calculerIPB(DA));
        expect(avec).toBe(sans);
        expect(JSON.stringify(monter([...BASE, RECEVABLE]).calculerIPB(DA)), 'témoin').not.toBe(sans);
    });

    it('3. l\'IPB : le prédicat est dans son filtre', () => {
        const f = tranche(source('js/profil-etudiant-calculs.js'), 'function _filtrerEtTrierEvaluationsIPB(', 'filtrees.sort(', { longueurMin: 100 });
        expect(f).toContain('!window.evaluationNonRecevable(e)');
    });

    it('4. les directions par critère et le « (sur N) » qui qualifie les moyennes : le même prédicat', () => {
        const aff = source('js/profil-etudiant-sections-affichage.js');
        const dir = tranche(aff, 'function calculerDirectionsCriteres(da) {', 'const resultatParDefaut', { longueurMin: 200 });
        expect(dir).toContain('!window.evaluationNonRecevable(e)');
        const surN = tranche(aff, 'const copiesSansDiagnostique = ', 'const nbTotalArtefacts', { longueurMin: 100 });
        expect(surN).toContain('!window.evaluationNonRecevable(e)');
    });

    it('5. le registre longitudinal : le libellé à la place de la note et des niveaux, aucun niveau par critère', () => {
        const rendre = tranche(source('js/registre-longitudinal.js'), 'function rendreEvaluation(', 'if (ev.retroactionFinale) {', { longueurMin: 400 });
        expect(rendre, 'le libellé du registre, sans condition ajoutée').toContain("const nonRecevable = (typeof libelleCopieNonRecevable === 'function' && libelleCopieNonRecevable(ev)) || null;");
        expect(rendre).toMatch(/const criteres = nonRecevable \? \[\] :/);
        expect(rendre).toMatch(/if \(nonRecevable\) note\.push\(nonRecevable\);\s*else if \(ev\.noteFinale/);
        expect(rendre).toContain('!enPoints && !nonRecevable');
    });

    it('5 bis. le rapport texte du profil : le libellé à la place du niveau et de la note (relecture neuve du 8 nov.)', () => {
        const perf = tranche(source('js/profil-etudiant-rapport.js'), '// 4. PERFORMANCE', '// 5. GESTION DES JETONS', { longueurMin: 400 });
        expect(perf).toContain("nonRecevable: (typeof libelleCopieNonRecevable === 'function' && libelleCopieNonRecevable(e)) || null,");
        expect(perf).toContain('if (art.nonRecevable) { rapport += `${idx + 1}- ${art.productionNom} : ${art.nonRecevable}\\n`; return; }');
    });

    it('6. un seul prédicat : aucune des fonctions touchées ne relit `statutIntegrite`', () => {
        // Les badges du profil (`profil-etudiant-sections-affichage.js`, « Plagiat détecté ») recopient le prédicat depuis
        // avant #1228 : un affichage, hors de ce lot (commenté au rapport du 8 nov.).
        const calc = source('js/profil-etudiant-calculs.js');
        const aff = source('js/profil-etudiant-sections-affichage.js');
        const corps = [
            tranche(calc, 'function calculerMoyennesCriteres(da) {', 'function calculerMoyennesCriteresRecents(', { longueurMin: 300 }),
            tranche(calc, 'function calculerMoyennesCriteresRecents(', '// [Phase 6]', { longueurMin: 300 }),
            tranche(calc, 'function _filtrerEtTrierEvaluationsIPB(', 'function _calculerScoreMultiArtefactIPB(', { longueurMin: 100 }),
            tranche(calc, 'function identifierDefiSpecifique(da) {', '// Prendre les N plus récents', { longueurMin: 300 }),
            tranche(aff, 'function calculerDirectionsCriteres(da) {', 'const resultatParDefaut', { longueurMin: 200 }),
            tranche(source('js/registre-longitudinal.js'), 'function rendreEvaluation(', 'if (ev.retroactionFinale) {', { longueurMin: 400 })
        ];
        for (const c of corps) expect(c).not.toContain('statutIntegrite');
    });
});

/*
 * BREAK-TESTS (8 nov. 2026) — chaque altération, seule, rend 1 essai rouge, puis retirée : le prédicat retiré des
 * moyennes → 0 ; des moyennes récentes → 1 ; de l'IPB → 3 ; du défi → 2 ; des directions → 4 ; du « (sur N) » → 4 ;
 * le registre qui rend les niveaux par critère → 5 ; le registre qui rend la note au lieu du libellé → 5.
 */
