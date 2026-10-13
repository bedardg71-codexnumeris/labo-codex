import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Volet B étape 2 de #303 (31 mai 2026) — canonisation de la PRODUCTION : les nouvelles
// données naissent en identifiants canoniques (standards/specifications), pour que les
// ~80 expérimentateurs n'héritent pas du problème legacy. Non destructif. Le flux interne
// du wizard reste en legacy (architecture 4e « interne legacy + canonique à la frontière »).

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const lire = (rel) => readFileSync(path.join(racineProjet, rel), 'utf8');

describe('Volet B étape 2 · canonisation de la production', () => {
    const indexHtml = lire('index.html');
    const pratiques = lire('js/pratiques.js');
    const wizard = lire('js/wizard-pratique-v2.js');
    const gestion = lire('js/pratiques-gestion.js');

    it('Unité 2 · le <select> mat-pratique-type a des options canoniques (plus de value legacy)', () => {
        expect(indexHtml).toMatch(/<option value="standards">PAN-Standards<\/option>/);
        expect(indexHtml).toMatch(/<option value="specifications">PAN-Spécifications<\/option>/);
        expect(indexHtml).not.toMatch(/<option value="pan-standards">/);
        expect(indexHtml).not.toMatch(/<option value="pan-specifications">/);
    });

    it('Unité 1 · (le sélecteur « pratique par défaut » est parti avec l\'îlot de pratiques.js, #469, 12 oct. 2026) : aucun identifiant ancien n\'y revient', () => {
        expect(pratiques).not.toMatch(/data-param="pan-standards"/);
        expect(pratiques).not.toMatch(/data-param="pan-specifications"/);
    });

    it('Unité 3 · le wizard normalise le type STOCKÉ au point d\'écriture (production canonique)', () => {
        expect(wizard).toMatch(/type:\s*\(typeof normaliserIdPratique === 'function' \? normaliserIdPratique\(typeFinal\)/);
    });

    it('Unité 2 · le chargement du formulaire matériel normalise pour retrouver l\'option', () => {
        expect(gestion).toMatch(/setValeurChamp\('mat-pratique-type',.*normaliserIdPratique\(pratique\.type\)/);
    });

    it('#319 Lot 1 · le flux interne du wizard est canonique de bout en bout (canonVersInterne retiré)', () => {
        // L'architecture 4e (« interne legacy + canonique à la frontière ») est supprimée :
        // deduireTypePratique et les comparaisons internes travaillent en canonique, la
        // frontière canonVersInterne a disparu. La normalisation défensive à l'écriture/
        // lecture (normaliserIdPratique) reste — voir Unité 3 + Unité 2.
        expect(wizard).not.toMatch(/canonVersInterne/);
        expect(wizard).toMatch(/return \{ type: 'standards'/);          // canonique
        expect(wizard).not.toMatch(/return \{ type: 'pan-standards'/);  // plus de legacy interne
    });
});
