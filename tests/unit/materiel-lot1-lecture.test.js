/**
 * « APPORTER MON MATÉRIEL », LOT 1 — la lecture d'une grille collée, et le champ des
 * descripteurs qui doit voyager.
 *
 * Consigne : plans de travail/CONSIGNE-LOT-2026-10-16-apporter-mon-materiel-1.md (« Les bancs »).
 *
 * Ce que ce banc verrouille :
 *   L — LIRE : le HTML d'un collage Word (paragraphes MsoNormal, tableau, paragraphe après),
 *       le texte à tabulations, rien ne disparaît en silence.
 *   I — INTERPRÉTER : nom tiré de la ligne avant, plages lues dans l'en-tête, colonne de
 *       pondération, parts égales, nature proposée, cases fusionnées → À classer, inversion.
 *   P — PLAGES : des entiers contigus s'enregistrent contigus (max = min suivant − 0,01).
 *   S — SÉCURITÉ : un <script>, un onerror collés ne sont pas retenus ; l'aperçu échappe tout.
 *   T — TRANSPORT : `descripteurs` traverse le partage et l'import, schéma fermé et borné ;
 *       son échelle suit au partage ; une grille sans descripteurs ne change pas d'un octet.
 *
 * `DOMParser` vient de jsdom (dépendance de développement des bancs seulement, ajoutée par
 * ce lot) : Vitest tourne en environnement `node`, sans analyseur HTML. Ce que jsdom ne
 * prouve PAS : qu'un navigateur n'exécute pas le script collé (jsdom n'exécute jamais rien
 * sans qu'on le lui demande). Ce point-là est éprouvé dans WebKit, par la spec Playwright
 * `materiel-lot1-onglet.spec.js`.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');

const fenetreDom = new JSDOM('<!doctype html><html><body></body></html>').window;

/** Le VRAI echapperHtml de config.js (zone protégée : extrait, pas modifié), sur le document de jsdom. */
function vraiEchapperHtml() {
    const src = readFileSync(path.join(racine, 'js', 'config.js'), 'utf8');
    const fabriquer = new Function('window', 'document', 'console', 'localStorage', 'sessionStorage',
        '"use strict";\n' + src + '\nreturn echapperHtml;');
    const stockage = { getItem: () => null, setItem() {}, removeItem() {}, clear() {} };
    return fabriquer({ addEventListener() {}, removeEventListener() {} }, fenetreDom.document, console, stockage, stockage);
}

let L;
let materiel;
beforeAll(() => {
    const w = chargerScript('js/materiel-lecture.js', { DOMParser: fenetreDom.DOMParser });
    L = w.materielLecture;
    chargerScript('js/materiel.js', { echapperHtml: vraiEchapperHtml() }, w);
    materiel = w.materiel;
});

/** Ce que Word met réellement au presse-papiers, en plus court. */
const HTML_WORD =
    '<html xmlns:o="urn:schemas-microsoft-com:office:office"><head><meta charset="utf-8">' +
    '<style>p.MsoNormal{margin:0cm;font-family:"Calibri"}</style></head><body lang=FR-CA>' +
    '<!--StartFragment--><div class=WordSection1>' +
    '<p class=MsoNormal><b>Dissertation critique</b> : grille<o:p></o:p></p>' +
    '<p class=MsoNormal><o:p>&nbsp;</o:p></p>' +
    '<table class=MsoTableGrid border=1 cellspacing=0 cellpadding=0>' +
    '<tr><td><p class=MsoNormal>Critères<o:p></o:p></p></td>' +
    '<td><p class=MsoNormal>Pondération<o:p></o:p></p></td>' +
    '<td><p class=MsoNormal>Très bien (85-100 %)<o:p></o:p></p></td>' +
    '<td><p class=MsoNormal>Bien (70 à 84)<o:p></o:p></p></td>' +
    '<td><p class=MsoNormal>Insuffisant (0-69 %)<o:p></o:p></p></td></tr>' +
    '<tr><td><p class=MsoNormal>Thèse<o:p></o:p></p></td><td><p class=MsoNormal>40 %</p></td>' +
    '<td><p class=MsoNormal>La thèse est claire.</p><p class=MsoNormal>Elle est nuancée.</p></td>' +
    '<td><p class=MsoNormal>La thèse est claire.</p></td><td><p class=MsoNormal>Aucune thèse.</p></td></tr>' +
    '<tr><td><p class=MsoNormal>Arguments</p></td><td><p class=MsoNormal>60</p></td>' +
    '<td><p class=MsoNormal>Arguments solides<br>et variés.</p></td><td><p class=MsoNormal>Arguments présents.</p></td>' +
    '<td><p class=MsoNormal></p></td></tr>' +
    '</table>' +
    '<p class=MsoNormal>La langue est évaluée à part.<o:p></o:p></p>' +
    '</div><!--EndFragment--></body></html>';

function lireWord() { return L.interpreter(L.lireHtml(HTML_WORD), 'colle'); }

/* ================================================================ L — LIRE */

describe('lot 1 · L — lire ce qu’on colle', () => {
    it('L.a un collage Word : la 1re table, le texte des cases, les paragraphes avant et après', () => {
        const lu = L.lireHtml(HTML_WORD);
        expect(lu.rangees).toHaveLength(3);
        expect(lu.rangees[0].map(c => c.t)).toEqual(['Critères', 'Pondération', 'Très bien (85-100 %)', 'Bien (70 à 84)', 'Insuffisant (0-69 %)']);
        expect(lu.avant).toEqual(['Dissertation critique : grille']);
        expect(lu.apres).toEqual(['La langue est évaluée à part.']);
    });

    it('L.b deux paragraphes ou un <br> dans une case ne se soudent pas', () => {
        const lu = L.lireHtml(HTML_WORD);
        expect(lu.rangees[1][2].t).toBe('La thèse est claire. Elle est nuancée.');
        expect(lu.rangees[2][2].t).toBe('Arguments solides et variés.');
    });

    it('L.c le <style> que Word colle avec le tableau n’entre nulle part', () => {
        expect(JSON.stringify(L.lireHtml(HTML_WORD))).not.toContain('MsoNormal');
    });

    it('L.d un texte nu ou un <span> hors bloc, avant le tableau, n’est pas perdu', () => {
        const lu = L.lireHtml('<span>Grille de labo</span><table><tr><td>C</td><td>A</td><td>B</td></tr><tr><td>X</td><td>1</td><td>2</td></tr></table>après');
        expect(lu.avant).toEqual(['Grille de labo']);
        expect(lu.apres).toEqual(['après']);
    });

    it('L.e du texte à tabulations : rangées, puis texte avant et après', () => {
        const lu = L.lireTexte('Ma grille\nCritère\tExcellent\tFaible\nClarté\tTrès clair\tConfus\nNote finale sur 100');
        expect(lu.rangees.map(r => r.map(c => c.t))).toEqual([['Critère', 'Excellent', 'Faible'], ['Clarté', 'Très clair', 'Confus']]);
        expect(lu.avant).toEqual(['Ma grille']);
        expect(lu.apres).toEqual(['Note finale sur 100']);
    });

    it('L.f du HTML sans tableau retombe sur le texte à tabulations ; sans l’un ni l’autre, un message', () => {
        const lu = L.lirePressePapiers({ html: '<p>prose</p>', texte: 'C\tA\tB\nX\t1\t2' });
        expect(lu.rangees).toHaveLength(2);
        const r = L.charger(L.lirePressePapiers({ html: '<p>Un texte en prose.</p>', texte: 'Un texte en prose.' }), 'colle');
        expect(r.erreur).toBe(L.MESSAGE_SANS_TABLEAU);
    });

    it('L.g un tableau d’un seul niveau n’est pas une grille : message, jamais d’échec muet', () => {
        const r = L.charger(L.lireTexte('Critère\tNiveau\nClarté\tTexte'), 'colle');
        expect(r.erreur).toBe(L.MESSAGE_INCOMPLET);
    });
});

/* ========================================================== I — INTERPRÉTER */

describe('lot 1 · I — interpréter le tableau', () => {
    it('I.a le nom est tiré de la ligne avant le tableau, « repris »', () => {
        expect(lireWord().nom).toEqual({ valeur: 'Dissertation critique : grille', etat: 'repris' });
    });

    it('I.b une ligne avant de plus de 120 caractères n’est pas un nom : elle va à classer', () => {
        const long = 'x'.repeat(121);
        const m = L.interpreter(L.lireTexte(long + '\nC\tA\tB\nX\t1\t2'), 'colle');
        expect(m.nom.etat).toBe('remplir');
        expect(m.aClasser[0]).toMatchObject({ texte: long, raison: 'Texte avant le tableau' });
    });

    it('I.c les plages sont lues dans l’en-tête (« 85-100 % », « 70 à 84 »), le titre sans elles', () => {
        const n = lireWord().niveaux;
        expect(n.map(x => x.titre.valeur)).toEqual(['Très bien', 'Bien', 'Insuffisant']);
        expect(n.map(x => [x.min.valeur, x.max.valeur])).toEqual([['85', '100'], ['70', '84'], ['0', '69']]);
        expect(n.every(x => x.min.etat === 'repris' && x.max.etat === 'repris')).toBe(true);
    });

    it('I.d un niveau sans plage dans l’en-tête : plage « à remplir », aucune proposée', () => {
        const m = L.interpreter(L.lireTexte('C\tExcellent\tFaible\nX\t1\t2'), 'colle');
        expect(m.niveaux[0].min).toEqual({ valeur: '', etat: 'remplir' });
        expect(m.niveaux[0].max).toEqual({ valeur: '', etat: 'remplir' });
    });

    it('I.e la colonne de pondération est reconnue à son en-tête et n’est pas un niveau', () => {
        const m = lireWord();
        expect(m.niveaux).toHaveLength(3);
        expect(m.criteres.map(c => c.ponderation)).toEqual([{ valeur: '40', etat: 'repris' }, { valeur: '60', etat: 'repris' }]);
        ['Points', 'pts', 'Total', '/20', '%'].forEach((h) => {
            const x = L.interpreter(L.lireTexte('C\t' + h + '\tA\tB\nX\t10\t1\t2'), 'colle');
            expect(x.niveaux.map(n => n.titre.valeur), h).toEqual(['A', 'B']);
        });
    });

    it('I.f sans aucune pondération : parts égales qui totalisent 100, marquées « complété »', () => {
        const m = L.interpreter(L.lireTexte('C\tA\tB\nX\t1\t2\nY\t1\t2\nZ\t1\t2'), 'colle');
        expect(m.criteres.map(c => c.ponderation)).toEqual([
            { valeur: '34', etat: 'complete' }, { valeur: '33', etat: 'complete' }, { valeur: '33', etat: 'complete' }]);
    });

    it('I.g une pondération partielle n’est pas complétée : le manque reste « à remplir »', () => {
        const m = L.interpreter(L.lireTexte('C\tPondération\tA\tB\nX\t50\t1\t2\nY\t\t1\t2'), 'colle');
        expect(m.criteres[1].ponderation).toEqual({ valeur: '', etat: 'remplir' });
    });

    it('I.h les cases : reprises, ou « vide » (facultatives) — jamais « à remplir »', () => {
        const c = lireWord().criteres[1].cases;
        expect(c.map(x => x.etat)).toEqual(['repris', 'repris', 'vide']);
    });

    it('I.i une ligne à cases fusionnées, une ligne sans nom, une ligne de pondération, le texte après : À classer, avec leur raison', () => {
        const html = '<table>' +
            '<tr><td>C</td><td>A</td><td>B</td></tr>' +
            '<tr><td>X</td><td>1</td><td>2</td></tr>' +
            '<tr><td colspan="3">Remarque fusionnée</td></tr>' +
            '<tr><td></td><td>orphelin</td><td></td></tr>' +
            '<tr><td>Pondération</td><td>50</td><td>50</td></tr>' +
            '</table><p>Fin.</p>';
        const m = L.interpreter(L.lireHtml(html), 'colle');
        expect(m.criteres.map(c => c.nom.valeur)).toEqual(['X']);
        expect(m.aClasser.map(a => [a.texte, a.raison])).toEqual([
            ['Remarque fusionnée', 'Ligne d’une autre forme que le tableau (cases fusionnées ?)'],
            ['orphelin', 'Ligne sans nom de critère'],
            ['Pondération · 50 · 50', 'Ligne de pondération, à reporter sur les critères'],
            ['Fin.', 'Texte après le tableau']
        ]);
        expect(m.aClasser.every(a => a.statut === 'attente')).toBe(true);
    });

    it('I.j une case fusionnée sur deux LIGNES (rowspan) envoie aussi sa ligne à classer', () => {
        const html = '<table><tr><td>C</td><td>A</td><td>B</td></tr>' +
            '<tr><td rowspan="2">X</td><td>1</td><td>2</td></tr><tr><td>3</td><td>4</td></tr></table>';
        const m = L.interpreter(L.lireHtml(html), 'colle');
        expect(m.criteres).toHaveLength(0);
        expect(m.aClasser).toHaveLength(2);
    });

    it('I.k la nature est PROPOSÉE d’après le tutoiement (seuil 30 %), jamais décidée', () => {
        const descr = lireWord();
        expect(descr.nature).toEqual({ valeur: 'descripteurs', etat: 'propose' });
        const retro = L.interpreter(L.lireTexte('C\tA\tB\nX\tTu as bien cerné la thèse.\tRevois ton plan.\nY\tBien.\tPeu clair.'), 'colle');
        expect(retro.nature).toEqual({ valeur: 'retroactions', etat: 'propose' });
        // L'élision « t' » : le motif du prototype ne la reconnaissait jamais.
        const elision = L.interpreter(L.lireTexte('C\tA\tB\nX\tT’es sur la bonne voie.\tIl faut t’appuyer sur le texte.'), 'colle');
        expect(elision.nature.valeur).toBe('retroactions');
        // Sous le seuil : 1 case sur 4.
        const sous = L.interpreter(L.lireTexte('C\tA\tB\nX\tTu y es.\tClair.\nY\tNet.\tFlou.'), 'colle');
        expect(sous.nature.valeur).toBe('descripteurs');
    });

    it('I.l aucune case de texte : rien à proposer', () => {
        expect(L.interpreter(L.lireTexte('C\tA\tB\nX\t\t'), 'colle').nature).toBeNull();
    });

    it('I.m les codes de niveau sont uniques, tirés des titres, « complété »', () => {
        const m = L.interpreter(L.lireTexte('C\tExcellent\tÉmergent\tEn cours\tE\nX\t1\t2\t3\t4'), 'colle');
        const codes = m.niveaux.map(n => n.code.valeur);
        expect(new Set(codes).size).toBe(4);
        expect(codes[0]).toBe('E');
        expect(m.niveaux.every(n => n.code.etat === 'complete')).toBe(true);
    });

    it('I.n l’exemple du prototype : 3 critères, 4 niveaux, 1 passage à classer', () => {
        const r = L.charger(L.lireHtml(L.exempleHtml()), 'exemple');
        expect(r.modele.criteres).toHaveLength(3);
        expect(r.modele.niveaux).toHaveLength(4);
        expect(r.modele.aClasser).toHaveLength(1);
        expect(r.modele.nom.valeur).toBe('Exposé oral : grille d’évaluation');
    });
});

/* ============================================================ I bis — INVERSER */

describe('lot 1 · I bis — inverser lignes et colonnes', () => {
    // Niveaux en LIGNES, critères en COLONNES, plages dans la 1re colonne, pondération en ligne.
    const TRANSPOSEE = 'Niveau\tThèse\tArguments\n' +
        'Pondération\t40\t60\n' +
        'Très bien (85-100)\tThèse nuancée.\tArguments variés.\n' +
        'Insuffisant (0-84)\tAucune thèse.\tAucun argument.';

    it('I.o lue à l’endroit, une grille transposée prend ses critères pour des niveaux', () => {
        const m = L.interpreter(L.lireTexte(TRANSPOSEE), 'colle');
        expect(m.niveaux.map(n => n.titre.valeur)).toEqual(['Thèse', 'Arguments']);
    });

    it('I.p inversée : critères, niveaux, plages et pondération reprennent leur place', () => {
        const inv = L.inverser(L.interpreter(L.lireTexte(TRANSPOSEE), 'colle'));
        expect(inv.critEnColonnes).toBe(true);
        expect(inv.criteres.map(c => c.nom.valeur)).toEqual(['Thèse', 'Arguments']);
        expect(inv.niveaux.map(n => [n.titre.valeur, n.min.valeur, n.max.valeur])).toEqual([['Très bien', '85', '100'], ['Insuffisant', '0', '84']]);
        expect(inv.criteres.map(c => c.ponderation)).toEqual([{ valeur: '40', etat: 'repris' }, { valeur: '60', etat: 'repris' }]);
        expect(inv.criteres[0].cases.map(c => c.valeur)).toEqual(['Thèse nuancée.', 'Aucune thèse.']);
    });

    it('I.q ce que le document ne donne pas retombe : parts égales, plages à remplir', () => {
        const m = L.interpreter(L.lireTexte('C\tA (80-100)\tB (0-79)\nX\t1\t2\nY\t3\t4'), 'colle');
        const inv = L.inverser(m);
        expect(inv.criteres.map(c => c.ponderation.etat)).toEqual(['complete', 'complete']);
        expect(inv.niveaux.every(n => n.min.etat === 'remplir')).toBe(true);
    });

    it('I.r deux inversions rendent la lecture d’origine ; le nom repris et une nature choisie sont gardés', () => {
        const m = lireWord();
        m.nature = { valeur: 'retroactions', etat: 'saisi' };
        const deux = L.inverser(L.inverser(m));
        expect(deux.critEnColonnes).toBe(false);
        expect(deux.criteres).toEqual(m.criteres);
        expect(deux.niveaux).toEqual(m.niveaux);
        expect(deux.nom).toEqual(m.nom);
        expect(deux.nature).toEqual({ valeur: 'retroactions', etat: 'saisi' });
    });

    it('I.s une case fusionnée transposée ne se perd pas : sa ligne va à classer', () => {
        const html = '<table><tr><td>C</td><td>A</td><td>B</td></tr><tr><td>X</td><td colspan="2">fusion</td></tr><tr><td>Y</td><td>1</td><td>2</td></tr></table>';
        const inv = L.inverser(L.interpreter(L.lireHtml(html), 'colle'));
        expect(JSON.stringify(inv.aClasser)).toContain('fusion');
    });
});

/* ================================================================ P — PLAGES */

describe('lot 1 · P — des plages entières aux plages contiguës', () => {
    it('P.a 0-64, 65-74, 75-100 → 0-64,99 / 65-74,99 / 75-100, comme l’échelle IDME de départ', () => {
        expect(L.plagesContigues([{ min: 0, max: 64 }, { min: 65, max: 74 }, { min: 75, max: 100 }]))
            .toEqual([{ min: 0, max: 64.99 }, { min: 65, max: 74.99 }, { min: 75, max: 100 }]);
    });

    it('P.b l’ordre d’entrée est gardé (niveaux du plus haut au plus bas)', () => {
        expect(L.plagesContigues([{ min: 85, max: 100 }, { min: 70, max: 84 }]))
            .toEqual([{ min: 85, max: 100 }, { min: 70, max: 84.99 }]);
    });

    it('P.c un chevauchement, un trou ou des décimales ne sont pas « corrigés »', () => {
        expect(L.plagesContigues([{ min: 0, max: 70 }, { min: 70, max: 100 }])[0].max).toBe(70);
        expect(L.plagesContigues([{ min: 0, max: 60 }, { min: 65, max: 100 }])[0].max).toBe(60);
        expect(L.plagesContigues([{ min: 0, max: 64.99 }, { min: 65, max: 100 }])[0].max).toBe(64.99);
    });

    it('P.d aucune note ponctuelle n’est produite', () => {
        L.plagesContigues([{ min: 0, max: 64 }, { min: 65, max: 100 }])
            .forEach(p => expect(Object.keys(p).sort()).toEqual(['max', 'min']));
    });
});

/* ============================================================== S — SÉCURITÉ */

describe('lot 1 · S — ce qu’on colle n’entre pas dans la page', () => {
    const PIEGE = '<p>Titre</p><script>window.__pirate = 1;</script>' +
        '<table><tr><td>C</td><td>A<script>window.__pirate = 2;</script></td><td>B</td></tr>' +
        '<tr><td>X<img src="x" onerror="window.__pirate = 3"></td><td>1</td><td>2</td></tr></table>' +
        '<style>body{display:none}</style><noscript>bruit</noscript>';

    it('S.a ni le texte d’un <script>, ni un onerror, ni un <style> ne sont retenus', () => {
        const json = JSON.stringify(L.lireHtml(PIEGE));
        expect(json).not.toContain('__pirate');
        expect(json).not.toContain('onerror');
        expect(json).not.toContain('display:none');
        expect(json).not.toContain('bruit');
        expect(L.lireHtml(PIEGE).rangees[0].map(c => c.t)).toEqual(['C', 'A', 'B']);
    });

    it('S.b l’aperçu échappe tout texte venu du document (ici, du texte à tabulations)', () => {
        const m = L.interpreter(L.lireTexte('<b>Nom</b>\nC\t<img src=x onerror=alert(1)>\tB\n"><svg onload=alert(2)>\t1\t2\nY\t<iframe src=x></iframe>\tok\n<object data=x></object> sous le tableau'), 'colle');
        const html = materiel.apercuHtml(m);
        expect(html).not.toContain('<img');
        expect(html).not.toContain('<svg');
        expect(html).not.toContain('<b>Nom');
        expect(html).not.toContain('<iframe');   // une CASE, pas seulement l'en-tête
        expect(m.aClasser.map(x => x.texte)).toContain('<object data=x></object> sous le tableau');
        expect(html).not.toContain('<object');   // un passage « À classer » (relecture de Cowork)
        expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
    });

    it('S.c l’aperçu montre l’exemple : 3 rangées de critères, 4 niveaux, 1 passage à classer', () => {
        const dom = new JSDOM('<div id="z"></div>');
        const z = dom.window.document.getElementById('z');
        z.innerHTML = materiel.apercuHtml(L.charger(L.lireHtml(L.exempleHtml()), 'exemple').modele);
        expect(z.querySelectorAll('tbody tr')).toHaveLength(3);
        expect(z.querySelectorAll('thead th.materiel-col-niveau')).toHaveLength(4);
        expect(z.querySelectorAll('.materiel-a-classer li')).toHaveLength(1);
        // Les états se lisent sans la couleur : « à remplir » est écrit (plages absentes de l'exemple).
        expect(z.querySelectorAll('thead .materiel-etat-remplir')).toHaveLength(4);
    });
});

/* ============================================================= T — TRANSPORT */

describe('lot 1 · T — les descripteurs voyagent, et rien d’autre ne bouge', () => {
    let wp, wie;
    const DESCR = { echelleId: 'ECH_1', parNiveau: { E: 'La thèse est nuancée.', I: '' } };
    function grille(avecDescr) {
        const c = { id: 'CR_1', nom: 'Thèse', ponderation: 100, type: 'holistique', description: 'd' };
        if (avecDescr) c.descripteurs = JSON.parse(JSON.stringify(DESCR));
        return {
            id: 'GR_1', nom: 'Dissertation', criteres: [c], dansBibliotheque: true,
            metadata_cc: { auteur_original: 'Auteur fictif', licence: 'CC BY-NC-SA 4.0', contributeurs: [] }
        };
    }
    beforeAll(() => {
        const db = { getSync: (cle, defaut) => (defaut !== undefined ? defaut : null), setSync() {} };
        wp = chargerScript('js/partage-schemas.js');
        chargerScript('js/partage-validation.js', { db }, wp);
        chargerScript('js/partage-format.js', { db }, wp);
        chargerScript('js/trust-tofu.js', { db }, wp);
        chargerScript('js/partage-import.js', { db }, wp);
        chargerScript('js/import-export.js', { db }, wp);
        wie = chargerScript('js/import-export.js');
    });

    it('T.a le PARTAGE projette le champ, chaîne vide comprise', () => {
        const c = wp.partageFormat.projeterEntite(grille(true), 'grille').criteres[0];
        expect(c.descripteurs).toEqual(DESCR);
    });

    it('T.b l’IMPORT le garde', () => {
        const c = wie.assainirObjet(grille(true), wie.SCHEMAS_IMPORT.grille).criteres[0];
        expect(c.descripteurs).toEqual(DESCR);
    });

    it('T.c les deux schémas restent FERMÉS : une clé étrangère sous `descripteurs` n’entre pas', () => {
        const g = grille(true);
        g.criteres[0].descripteurs.charge = '<script>x</script>';
        expect(wp.partageFormat.projeterEntite(g, 'grille').criteres[0].descripteurs).not.toHaveProperty('charge');
        expect(wie.assainirObjet(g, wie.SCHEMAS_IMPORT.grille).criteres[0].descripteurs).not.toHaveProperty('charge');
    });

    it('T.d bornes : un descripteur de plus de 5000 caractères, plus de 20 niveaux → paquet refusé ; l’import tronque', () => {
        const declare = wp.partageSchemas.SCHEMA_ENTITE.grille.champs.criteres.schema.descripteurs.schema.parNiveau;
        expect(declare).toMatchObject({ type: 'dictionnaire-chaines', maxLongueurElement: 5000, maxCles: 20 });
        const paquet = (g) => wp.partageFormat.construirePackage(g, { type: 'grille', identiteAuteur: 'Auteur fictif' });

        expect(wp.partageValidation.validerPackage(paquet(grille(true))).erreurs).toEqual([]);

        const longue = grille(true);
        longue.criteres[0].descripteurs.parNiveau.E = 'x'.repeat(5001);
        expect(wp.partageValidation.validerPackage(paquet(longue)).valide).toBe(false);

        const nombreuse = grille(true);
        for (let i = 0; i < 21; i++) nombreuse.criteres[0].descripteurs.parNiveau['N' + i] = 't';
        expect(wp.partageValidation.validerPackage(paquet(nombreuse)).valide).toBe(false);

        const imp = grille(true);
        imp.criteres[0].descripteurs.parNiveau.E = 'x'.repeat(6000);
        expect(wie.assainirObjet(imp, wie.SCHEMAS_IMPORT.grille).criteres[0].descripteurs.parNiveau.E).toHaveLength(5000);
    });

    it('T.e au partage, l’échelle du paquet change d’id : les descripteurs la suivent', () => {
        const pkg = {
            manifest: { dateExport: '2026-10-16T12:00:00Z', auteur: { nom: 'Auteur fictif' }, item_principal: { type: 'grille', id: 'GR_1' } },
            entites: { grilles: [grille(true)], echelles: [{ id: 'ECH_1', nom: 'É', niveaux: [] }], cartouches: [], productions: [], pratiques: [] }
        };
        const r = wp.partageImport.prefixerEntites(pkg, 'IMP_ab12cd34');
        const ech = r.parType.echelle[0].id;
        expect(ech).toMatch(/^PARTAGE_/);
        expect(r.parType.grille[0].criteres[0].descripteurs.echelleId).toBe(ech);
    });

    it('T.f une échelle hors du paquet : l’id ne bouge pas', () => {
        const g = grille(true);
        expect(wie.rebrancherReferences(g, 'grille', { echelles: { AUTRE: 'X' } })).toBe(0);
        expect(g.criteres[0].descripteurs.echelleId).toBe('ECH_1');
    });

    /**
     * Relecture de Cowork (16 oct.) : la première version comparait le code à lui-même privé de
     * l'entrée `descripteurs`, ce qui ne pouvait pas échouer (un champ absent est sauté de toute
     * façon). Ces deux chaînes ont été PRODUITES par le code de `eb6dd86e` (le commit d'avant ce
     * lot : partage-schemas, partage-validation, partage-format, import-export de ce commit,
     * chargés dans le même harnais) sur la grille ci-dessous. Elles ne se régénèrent pas : si le
     * code d'aujourd'hui en diffère, c'est qu'une grille sans descripteurs ne voyage plus comme hier.
     * Break-test : retirer `enonces` du schéma d'import, ou faire émettre un `descripteurs` vide
     * par la projection → rouge.
     */
    const GRILLE_SANS = {
        id: 'GR_SANS', nom: 'Dissertation', type: 'analytique', dansBibliotheque: true,
        metadata_cc: { auteur_original: 'Auteur fictif', licence: 'CC BY-NC-SA 4.0', contributeurs: [] },
        criteres: [
            { id: 'CR_1', nom: 'Thèse', description: 'La thèse', ponderation: 60, type: 'analytique', niveauSOLO: 'relationnel', verrouille: false },
            { id: 'CR_2', nom: 'Langue', ponderation: 40, type: 'algorithmique', formule: 'x', modeleEnonces: 'generique',
              enonces: { decompte: '', concentre: 'Revois.' },
              sousCriteres: [{ id: 'S1', code: '1', nom: 'Syntaxe', ponderation: 1, retroaction: 'Vérifie.' }] }
        ]
    };
    const PARTAGE_EB6DD86E = '{"id":"GR_SANS","nom":"Dissertation","type":"analytique","criteres":[{"id":"CR_1","nom":"Thèse","description":"La thèse","ponderation":60,"type":"analytique","niveauSOLO":"relationnel","verrouille":false},{"id":"CR_2","nom":"Langue","ponderation":40,"type":"algorithmique","formule":"x","modeleEnonces":"generique","enonces":{"decompte":"","concentre":"Revois."},"sousCriteres":[{"id":"S1","code":"1","nom":"Syntaxe","ponderation":1,"retroaction":"Vérifie."}]}],"dansBibliotheque":true,"metadata_cc":{"licence":"CC BY-NC-SA 4.0","auteur_original":"Auteur fictif","contributeurs":[]}}';
    const IMPORT_EB6DD86E = '{"id":"GR_SANS","nom":"Dissertation","criteres":[{"id":"CR_1","nom":"Thèse","description":"La thèse","ponderation":60,"type":"analytique","niveauSOLO":"relationnel","verrouille":false},{"id":"CR_2","nom":"Langue","ponderation":40,"type":"algorithmique","formule":"x","modeleEnonces":"generique","enonces":{"decompte":"","concentre":"Revois."},"sousCriteres":[{"id":"S1","code":"1","nom":"Syntaxe","ponderation":1,"retroaction":"Vérifie."}]}],"type":"analytique","dansBibliotheque":true,"metadata_cc":{"licence":"CC BY-NC-SA 4.0","auteur_original":"Auteur fictif","contributeurs":[]}}';
    const copie = () => JSON.parse(JSON.stringify(GRILLE_SANS));

    it('T.g une grille SANS descripteurs ressort du PARTAGE à l’octet près comme sur eb6dd86e', () => {
        expect(JSON.stringify(wp.partageFormat.projeterEntite(copie(), 'grille'))).toBe(PARTAGE_EB6DD86E);
    });

    it('T.h … et de l’IMPORT à l’octet près comme sur eb6dd86e', () => {
        expect(JSON.stringify(wie.assainirObjet(copie(), wie.SCHEMAS_IMPORT.grille))).toBe(IMPORT_EB6DD86E);
    });

    it('T.i … et le rebranchement ne la touche pas', () => {
        const g = copie();
        expect(wie.rebrancherReferences(g, 'grille', { echelles: { ECH_1: 'X' } })).toBe(0);
        expect(g).toEqual(GRILLE_SANS);
    });
});
