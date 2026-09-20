import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// =======================================================================
// SENTINELLE #928 — le menu des trimestres suit le calendrier
// =======================================================================
//
// Demande de Grégoire, 20 sept. 2026, 8 h 30, capture du Cadre › Trimestre : le menu lisait « Automne 2025,
// Hiver 2026, Automne 2026, Automne 2024 » — l'ordre de CRÉATION du registre, A2024 ayant été reconstruit le
// 18 sept. Ordre voulu : celui du calendrier. Un tri alphabétique du nom ne le donne pas (« Hiver 2026 »
// passerait après « Automne 2026 »), ni un tri de l'id (`a2026` avant `h2026`).

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const source = readFileSync(path.join(racine, 'js/trimestre-v2-liste.js'), 'utf8');

function trier(trimestres) {
    const win = chargerScript('js/trimestre-v2-liste.js', {
        db: { getSync: (k, d) => d, setSync: () => {} },
        cle: (n) => 'a2026_' + n
    });
    return win.trierTrimestresChronologique(trimestres);
}
const ids = (liste) => liste.map((t) => t.id);

describe('#928 · les trimestres se lisent dans l\'ordre du calendrier', () => {
    const DE_LA_CAPTURE = [
        { id: 'a2025', nom: 'Automne 2025', annee: 2025, session: 'A' },
        { id: 'h2026', nom: 'Hiver 2026', annee: 2026, session: 'H' },
        { id: 'a2026', nom: 'Automne 2026', annee: 2026, session: 'A' },
        { id: 'a2024', nom: 'Automne 2024', annee: 2024, session: 'A' }
    ];

    it('le registre de la capture : A2024, A2025, H2026, A2026 — l\'hiver AVANT l\'automne de la même année', () => {
        expect(ids(trier(DE_LA_CAPTURE))).toEqual(['a2024', 'a2025', 'h2026', 'a2026']);
    });

    it('l\'été se place entre l\'hiver et l\'automne ; sans `annee` ni `session`, l\'id suffit', () => {
        expect(ids(trier([{ id: 'a2026' }, { id: 'e2026' }, { id: 'h2026' }, { id: 'a2025' }])))
            .toEqual(['a2025', 'h2026', 'e2026', 'a2026']);
    });

    it('la démonstration, sans année lisible, va à la fin ; le registre reçu n\'est pas réordonné', () => {
        const registre = [{ id: 'demo', nom: 'Démonstration' }, ...DE_LA_CAPTURE];
        const avant = ids(registre);
        expect(ids(trier(registre))).toEqual(['a2024', 'a2025', 'h2026', 'a2026', 'demo']);
        expect(ids(registre), 'une copie, jamais le tableau du registre').toEqual(avant);
    });

    it('les deux listes de l\'écran passent par ce tri : le menu et la liste de gestion', () => {
        expect(source).toContain('trierTrimestresChronologique(trimestres).forEach(');
        expect(source).toContain('container.innerHTML = trierTrimestresChronologique(trimestres).map(');
    });
});
