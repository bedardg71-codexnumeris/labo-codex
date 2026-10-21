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
 * Exceptions NOMMÉES : les `toFixed(1)` de la note finale du profil (autre affichage, hors du bogue ; la consigne
 * dit de ne pas y toucher).
 *
 * Break-test (21 oct.) : la ligne d'origine du profil remise (`${evaluation.noteFinale}%`) → B rougit.
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
const EXCEPTIONS = [
    // La note finale du profil, une décimale fixe : hors du bogue (consigne du 21 oct., point 2).
    'detailsNoteFinale.noteFinale.toFixed(1) + \'%\''
];

describe('A — la fonction : une décimale au plus, sans zéro final', () => {
    const { formaterNotePourcentage: f } = chargerScript('js/note-pourcentage.js');

    it('les valeurs du rapport de bogue, et la convention de la Liste des évaluations', () => {
        expect(f(89.23679060665361)).toBe('89.2%');
        expect(f(79.33333333333333)).toBe('79.3%');
        expect(f(57.5)).toBe('57.5%');
        expect(f(67)).toBe('67%');
        expect(f(0)).toBe('0%');
        expect(f('72.25')).toBe('72.3%');
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
                if (!NOTE_PUIS_POURCENT.test(ligne)) return;
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
