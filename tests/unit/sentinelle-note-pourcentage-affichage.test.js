/**
 * SENTINELLE — LA NOTE EN POURCENTAGE N'A QU'UNE FAÇON DE S'AFFICHER (21 oct. 2026, consigne du jour, lot 2).
 *
 * Bogue vécu par Grégoire (1.212.0, Chrome sur Mac) : « E 89.23679060665361% » dans la Liste des productions du
 * profil. « On avait pourtant réglé ce bug… » : le bogue 123 (24 mai) avait arrondi la seule Liste des
 * évaluations ; depuis #572/#701, `noteFinale` se stocke exacte, délibérément, et tout affichage qui la lit
 * brute montre le bruit.
 *
 * L'INVARIANT (leçon de #768/#782 : garder l'invariant, pas des exemples) : aucun fichier de `js/` n'interpole
 * `noteFinale` suivi de « % » sans passer par `formaterNotePourcentage` (js/note-pourcentage.js). Un affichage
 * ajouté demain est couvert sans que personne touche ce fichier.
 *
 * ↻ 21 oct. 2026, après-midi (décision de Grégoire, 11 h 07) : la NORME FRANÇAISE, « 89,2 % », virgule et espace
 * insécable U+00A0 (le caractère, pas l'entité). B s'étend aux `toFixed(n)` suivis de « % » ou de « ␣% » sur une
 * note ou une moyenne (nom qui dit `note` ou `moyenne`) ; l'exception des `toFixed(1)` du profil disparaît.
 *
 * Break-tests (21 oct.) : la ligne d'origine du profil remise (`${evaluation.noteFinale}%`) → B rougit ; la l. 449
 * d'origine du PDF de l'élève (`Math.round(o.note * 10) / 10) + ' %'`) → B rougit.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lire = (f) => readFileSync(path.join(racine, f), 'utf8');

function fichiersJs(d) {
    return readdirSync(path.join(racine, d)).flatMap((n) => {
        const r = path.join(d, n);
        return statSync(path.join(racine, r)).isDirectory() ? fichiersJs(r) : (r.endsWith('.js') ? [r] : []);
    });
}

/** `noteFinale` puis, sur la même instruction, « % » collé par interpolation (`}%`) ou par concaténation (`+ '%'`). */
const NOTE_PUIS_POURCENT = /noteFinale\b[^;\n]{0,60}?(\}\s*%|\+\s*['"`]\s?%)/;
/**
 * Une note ou une moyenne arrondie À LA MAIN, puis « % » : `note.toFixed(1)}%`, `moyenne.toFixed(1) + ' %'`,
 * `Math.round(o.note * 10) / 10) + ' %'`. Le nom porte `note` ou `moyenne` (casse indifférente) ; un taux, un
 * indice, une pondération n'en sont pas (hors du lot, décision de Grégoire : les notes).
 */
const ARRONDI_DE_NOTE_PUIS_POURCENT = /(note|moyenne)[A-Za-z_.]*(\.toFixed\(\d\)|\s*\*\s*10\)\s*\/\s*10\)?)\s*(\}\s?%|\+\s*['"`]\s?%)/i;
const EXCEPTIONS = [];

describe('A — la fonction : une décimale au plus, sans zéro final', () => {
    const { formaterNotePourcentage: f } = chargerScript('js/note-pourcentage.js');

    it('les valeurs du rapport de bogue, à la norme française : virgule, espace insécable U+00A0', () => {
        expect(f(89.23679060665361)).toBe('89,2\u00A0%');
        expect(f(79.33333333333333)).toBe('79,3\u00A0%');
        expect(f(57.5)).toBe('57,5\u00A0%');
        expect(f(67)).toBe('67\u00A0%');
        expect(f(0)).toBe('0\u00A0%');
        expect(f('72.25')).toBe('72,3\u00A0%');
        // Le caractère, jamais l'entité (`echapperHtml` la doublerait) ni une espace ordinaire.
        expect(f(67)).not.toContain('&nbsp;');
        expect(f(67).charCodeAt(2)).toBe(0xA0);
    });

    it('formaterNoteNombre : le même nombre, sans le signe', () => {
        const { formaterNoteNombre: n } = chargerScript('js/note-pourcentage.js');
        expect(n(89.23679060665361)).toBe('89,2');
        expect(n(75)).toBe('75');
        expect(n(null)).toBe('');
    });

    it('pas un nombre : rien (l’appelant garde son repli)', () => {
        for (const v of [null, undefined, '', 'abc', NaN, Infinity]) expect(f(v), String(v)).toBe('');
    });
});

describe('B — l’invariant : aucun `noteFinale` suivi de « % » hors de la fonction', () => {
    it('dans tout js/ (hors pack démo, une donnée)', () => {
        const fautes = [];
        for (const f of fichiersJs('js')) {
            if (f === path.join('js', 'pack-demo-10.js')) continue;
            lire(f).split('\n').forEach((ligne, i) => {
                if (!NOTE_PUIS_POURCENT.test(ligne) && !ARRONDI_DE_NOTE_PUIS_POURCENT.test(ligne)) return;
                if (ligne.includes('formaterNotePourcentage(')) return;
                if (EXCEPTIONS.some((e) => ligne.includes(e))) return;
                fautes.push(`${f}:${i + 1} : ${ligne.trim().slice(0, 140)}`);
            });
        }
        expect(fautes).toEqual([]);
    });

    it('le motif attrape bien les formes d’hier (sinon B ne garderait rien)', () => {
        for (const l of [
            '            : `${_prefixeNiveau(evaluation)}${evaluation.noteFinale}%`,',
            "const noteTexte = evaluation.noteFinale != null ? evaluation.noteFinale + '%' : '—';",
            "noteElem.textContent = Math.round(evaluation.noteFinale * 10) / 10 + ' %';",
            "? `${(Math.round(evaluation.noteFinale * 10) / 10)}%` : '-';",
            "'Ce fichier a une évaluation associée (' + (evalAssociee.noteFinale || evalAssociee.note || '--') + '%).\\n\\n' +"
        ]) expect(NOTE_PUIS_POURCENT.test(l), l).toBe(true);
        for (const l of [
            "<div>${esc('Note de la copie : ' + (Math.round(o.note * 10) / 10) + ' %')}</div>",
            "? `${r.note.toFixed(1)}%` : '—');",
            "${detailsNoteFinale.noteFinale !== null ? detailsNoteFinale.noteFinale.toFixed(1) + '%' : '—'}",
            "<strong>${calc.moyenne.toFixed(1)} %</strong>",
            "? `Moyenne : ${moyenneAffichee.toFixed(1)}%`"
        ]) expect(ARRONDI_DE_NOTE_PUIS_POURCENT.test(l), l).toBe(true);
        // Ce qui n'est pas une note ne la déclenche pas.
        for (const l of ["callback: value => (value * 100).toFixed(0) + '%',", "`poids ${r.poids.toFixed(0)} %`"])
            expect(ARRONDI_DE_NOTE_PUIS_POURCENT.test(l), l).toBe(false);
    });

    it('la fonction est chargée avant ses lecteurs dans index.html', () => {
        const html = lire('index.html');
        const position = (f) => html.indexOf(`<script src="js/${f}?v=`);
        const elle = position('note-pourcentage.js');
        expect(elle).toBeGreaterThan(-1);
        const lecteurs = fichiersJs('js').filter((f) => lire(f).includes('formaterNotePourcentage(') && !f.endsWith('note-pourcentage.js'));
        expect(lecteurs.length).toBeGreaterThanOrEqual(6);
        for (const f of lecteurs) {
            const p = position(path.basename(f));
            if (p > -1) expect(p, f).toBeGreaterThan(elle);
        }
    });
});
