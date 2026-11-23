import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// SENTINELLE — 23 NOV. 2026 · LE PREMIER DU MOIS S'ÉCRIT « 1er ».
//
// LA MESURE (22 nov., Cowork) : `toLocaleDateString('fr-CA', { day: 'numeric', month: 'long', … })` écrit
// « 1 octobre ». Neuf modules le faisaient (diagnostic-copies-liees, init-inline, modes, reserve-copies,
// reserve-renvoyer, saisie-presences, synthese-retroaction-rendu, tableau-cibles, travaux-ui), et onze de plus
// sous la même forme ou sous une autre (main.js, export-pdf, codex, cartouches, cc-license, partage-import,
// reserve-verifier, trust-tofu, graphiques-progression ; des tableaux de mois dans presences-rapport,
// planification-export et planification-carte, la dernière écrivant déjà « 1er » à sa façon).
//
// LA RÈGLE VERROUILLÉE ICI : un seul formateur, `js/date-en-lettres.js` (`window.dateEnLettres`), écrit une date dont
// le mois est en lettres, et c'est lui seul qui écrit « 1er ». Tout appel de `toLocaleDateString`,
// `toLocaleString` ou `Intl.DateTimeFormat` qui demande le mois en toutes lettres (`month: 'long'`) est refusé
// ailleurs ; un tableau des noms de mois ne vit que dans un fichier qui passe son jour par `jourEnLettres`.
// Les mois abrégés (`month: 'short'`, « 6 fév. ») restent hors de la règle : ce ne sont pas des dates en toutes lettres.
//
// BREAK-TESTS (23 nov. 2026), chacun rouge puis remis à l'identique :
//   BT1. dans date-en-lettres.js, `n === 1 ? '1er'` devient `n === 0 ? '1er'` → A (deux essais) et C (quatre) rouges.
//   BT2. tableau-cibles.js : `dateLisible` rendu à `d.toLocaleDateString('fr-CA', { day: 'numeric', month: 'long',
//        year: 'numeric' })` → B (le fichier est nommé) et C (« 1 octobre 2025 ») rouges.
//   BT3. presences-rapport.js : `jourEnLettres(morceaux[2])` rendu à `parseInt(morceaux[2], 10)` → B (le tableau des
//        mois sans jourEnLettres) et C rouges.
//   BT4. index.html : la balise de date-en-lettres.js déplacée après main.js → D rouge.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(__dirname, '..', '..');
const lire = (rel) => readFileSync(path.join(RACINE, rel), 'utf8');

function charger() {
    const win = {};
    new Function('window', '"use strict";\n' + lire('js/date-en-lettres.js'))(win);
    return win;
}

function fichiersJs(dossier) {
    const out = [];
    for (const nom of readdirSync(path.join(RACINE, dossier))) {
        const rel = dossier + '/' + nom;
        if (nom === 'libs' || nom === 'vendor') continue;
        const st = statSync(path.join(RACINE, rel));
        if (st.isDirectory()) out.push(...fichiersJs(rel));
        else if (nom.endsWith('.js')) out.push(rel);
    }
    return out;
}

/** Le texte d'un appel, de sa parenthèse ouvrante à la fermante qui lui répond (chaînes ignorées grossièrement). */
function argumentsDeLAppel(src, debut) {
    let i = src.indexOf('(', debut), prof = 0;
    for (let j = i; j < src.length; j++) {
        if (src[j] === '(') prof++;
        else if (src[j] === ')' && --prof === 0) return src.slice(i, j + 1);
    }
    return src.slice(i);
}

describe('A · le formateur : « 1er » le premier du mois, le nombre sinon', () => {
    const { dateEnLettres } = charger();

    it('jour, mois en lettres, année (le défaut) ; avec le jour de la semaine ; sans l’année ; avec l’heure', () => {
        const premier = new Date('2025-10-01T12:00:00');
        expect(dateEnLettres(premier)).toBe('1er octobre 2025');
        expect(dateEnLettres(premier, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })).toBe('mercredi 1er octobre 2025');
        expect(dateEnLettres(premier, { day: 'numeric', month: 'long' })).toBe('1er octobre');
        expect(dateEnLettres(premier, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })).toMatch(/^1er octobre 2025\D/);
    });

    it('les autres jours ne changent pas : « 2 octobre 2025 », « 17 septembre 2025 », « 11 septembre »', () => {
        expect(dateEnLettres(new Date('2025-10-02T12:00:00'))).toBe('2 octobre 2025');
        expect(dateEnLettres(new Date('2025-09-17T12:00:00'))).toBe('17 septembre 2025');
        expect(dateEnLettres('2025-09-11T12:00:00', { day: 'numeric', month: 'long' })).toBe('11 septembre');
    });

    it('le mois en chiffres n’est pas touché ; une date illisible rend « » (l’appelant garde son repli)', () => {
        expect(dateEnLettres(new Date('2025-10-01T12:00:00'), { day: 'numeric', month: 'numeric' })).not.toMatch(/1er/);
        expect(dateEnLettres('pas une date')).toBe('');
        expect(dateEnLettres.jourEnLettres('01')).toBe('1er');
        expect(dateEnLettres.jourEnLettres(21)).toBe('21');
    });
});

describe('B · aucun autre code n’écrit une date dont le mois est en toutes lettres', () => {
    const fichiers = fichiersJs('js').filter(f => f !== 'js/date-en-lettres.js' && f !== 'js/changelog-data.js');

    it('aucun toLocaleDateString / toLocaleString / Intl.DateTimeFormat avec `month: \'long\'` hors du formateur', () => {
        const fautifs = [];
        for (const f of fichiers) {
            const src = lire(f);
            const re = /\.toLocaleDateString\s*\(|\.toLocaleString\s*\(|Intl\.DateTimeFormat\s*\(/g;
            let m;
            while ((m = re.exec(src))) {
                const args = argumentsDeLAppel(src, m.index);
                if (/month\s*:\s*['"]long['"]/.test(args)) fautifs.push(f + ' : ' + args.slice(0, 80));
                // Des options passées par variable : la variable ne doit pas porter le mois en lettres.
                const v = /^\(\s*['"][^'"]*['"]\s*,\s*([A-Za-z_$][\w$]*)\s*\)$/.exec(args);
                if (v && new RegExp('\\b' + v[1] + '\\s*=\\s*\\{[^}]*month\\s*:\\s*[\'"]long').test(src)) fautifs.push(f + ' : ' + args);
            }
        }
        expect(fautifs).toEqual([]);
    });

    it('« 1er » ne s’écrit en dur nulle part ailleurs ; un tableau des noms de mois passe son jour par jourEnLettres', () => {
        const en1er = fichiers.filter(f => /['"`]1er['"`]|\?\s*['"]1er/.test(lire(f)));
        expect(en1er).toEqual([]);
        const avecMois = fichiers.filter(f => /['"]janvier['"]\s*,\s*['"]février['"]/.test(lire(f)));
        expect(avecMois.length, 'les trois tableaux mesurés le 23 nov.').toBeGreaterThanOrEqual(3);
        for (const f of avecMois) expect(lire(f), f).toMatch(/dateEnLettres\.jourEnLettres\(/);
    });
});

/** Extrait une fonction nommée d'un fichier (sa déclaration jusqu'à l'accolade fermante qui lui répond). */
function extraire(rel, nom) {
    const src = lire(rel);
    const debut = src.indexOf('function ' + nom + '(');
    if (debut === -1) throw new Error(nom + ' introuvable dans ' + rel);
    let i = src.indexOf('{', debut), prof = 0;
    for (let j = i; j < src.length; j++) {
        if (src[j] === '{') prof++;
        else if (src[j] === '}' && --prof === 0) return src.slice(debut, j + 1);
    }
    throw new Error('fin de ' + nom);
}

describe('C · les appelants passent par le formateur (leurs vraies fonctions)', () => {
    const win = charger();
    const fabriquer = (rel, nom, extra = '') => new Function('window', extra + extraire(rel, nom) + '\nreturn ' + nom + ';')(win);

    it('tableau-cibles.js, la date d’une inscription : « 1er octobre 2025 »', () => {
        expect(fabriquer('js/tableau-cibles.js', 'dateLisible')('2025-10-01')).toBe('1er octobre 2025');
    });
    it('presences-rapport.js, l’en-tête du rapport : « 1er septembre 2026 »', () => {
        expect(fabriquer('js/presences-rapport.js', 'formaterDateFrancaise')('2026-09-01')).toBe('1er septembre 2026');
    });
    it('planification-export.js, la date d’une leçon : « mardi 1er septembre »', () => {
        const extra = lire('js/planification-export.js').match(/var JOURS_FR = [^;]+;\s*var MOIS_FR = [^;]+;/)[0] + '\n';
        expect(fabriquer('js/planification-export.js', 'formaterJourEtMois', extra)('2026-09-01')).toBe('mardi 1er septembre');
    });
    it('planification-carte.js, les dates du trimestre : « du 1er décembre 2026 au 8 janvier 2027 »', () => {
        const extra = lire('js/planification-carte.js').match(/var MOIS_DATES_TRIMESTRE = [^;]+;/)[0] + '\n';
        expect(fabriquer('js/planification-carte.js', 'formaterDatesTrimestre', extra)('2026-12-01', '2027-01-08')).toBe('du 1er décembre 2026 au 8 janvier 2027');
    });
});

describe('D · index.html charge le formateur avant tout module qui l’appelle', () => {
    it('la balise de date-en-lettres.js précède celle de chaque appelant', () => {
        const html = lire('index.html');
        const pos = (rel) => html.indexOf('src="' + rel + '?v=');
        const p = pos('js/date-en-lettres.js');
        expect(p, 'date-en-lettres.js est chargé').toBeGreaterThan(0);
        const appelants = fichiersJs('js').filter(f => f !== 'js/date-en-lettres.js' && /window\.dateEnLettres/.test(lire(f)));
        expect(appelants.length).toBeGreaterThanOrEqual(20);
        for (const f of appelants) {
            const q = pos(f);
            if (q === -1) continue;   // un module chargé à la demande vient forcément après
            expect(q, f).toBeGreaterThan(p);
        }
    });
});
