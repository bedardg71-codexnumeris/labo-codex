import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE — #366 (relais Cadre→Trimestre, 4 août 2026) — statistiques de
// calendrier : source UNIQUE via la fonction pure calculerStatistiquesCalendrier
// (trimestre-v2.js), partagée avec calendrier-vue.js.
//
// Le bug d'origine : calendrier-vue lisait des ids DOM inexistants
// (`nombreSemaines`/`nombreJoursCours`) et retombait en silence sur les
// constantes 15/75 — plausibles, donc invisibles, mais FAUSSES dès que le
// calendrier réel divergeait (A2026 : 17/80 vs 15/75 affichés côte à côte).

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');

function charger() {
    return chargerScript('js/trimestre-v2.js', {
        db: { getSync: () => null, setSync: () => {}, get: async () => null, set: async () => {} },
        cle: (k) => k
    });
}

describe('#366 — calculerStatistiquesCalendrier (fonction pure partagée)', () => {
    it('compte cours + reprises (incluses), congés, et prend le max de numeroSemaine', () => {
        const win = charger();
        const calendrier = {
            '2026-08-20': { statut: 'cours', numeroSemaine: 1 },
            '2026-08-21': { statut: 'cours', numeroSemaine: 1 },
            '2026-08-24': { statut: 'cours', numeroSemaine: 1 },
            '2026-08-25': { statut: 'conge' },
            '2026-08-26': { statut: 'reprise', numeroSemaine: 1 },
            '2026-08-27': { statut: 'cours', numeroSemaine: 2 },
            '2026-08-28': { statut: 'conge' },
            '2026-10-13': { statut: 'semaine-examens' },
            '2026-08-29': { statut: 'weekend' }
        };
        const stats = win.calculerStatistiquesCalendrier(calendrier);
        expect(stats).toEqual({ semaines: 2, joursCours: 5, conges: 2, reprises: 1 });
    });

    it('sans numeroSemaine : repli ⌈jours ÷ 5⌉', () => {
        const win = charger();
        const calendrier = {};
        for (let i = 1; i <= 12; i++) calendrier['2026-09-' + String(i).padStart(2, '0')] = { statut: 'cours' };
        expect(win.calculerStatistiquesCalendrier(calendrier).semaines).toBe(3);
    });

    it('calendrier absent ou vide → null (état vide explicite, JAMAIS 15/75)', () => {
        const win = charger();
        expect(win.calculerStatistiquesCalendrier(null)).toBeNull();
        expect(win.calculerStatistiquesCalendrier({})).toBeNull();
        expect(win.calculerStatistiquesCalendrier('pas un objet')).toBeNull();
    });
});

describe('#366 — CLIQUET : le repli en dur et la lecture DOM ne reviennent pas', () => {
    const srcCalendrierVue = readFileSync(path.join(racine, 'js/calendrier-vue.js'), 'utf8');

    it('calendrier-vue.js ne contient plus les constantes de repli 15/75', () => {
        expect(srcCalendrierVue).not.toMatch(/nombreSemainesReel\s*=\s*15/);
        expect(srcCalendrierVue).not.toMatch(/nombreJoursReel\s*=\s*75/);
    });

    it('calendrier-vue.js ne lit plus les métriques par le DOM', () => {
        expect(srcCalendrierVue).not.toMatch(/getElementById\(\s*['"]nombreSemaines['"]\s*\)/);
        expect(srcCalendrierVue).not.toMatch(/getElementById\(\s*['"]nombreJoursCours['"]\s*\)/);
        expect(srcCalendrierVue).toMatch(/calculerStatistiquesCalendrier/);
    });

    it('trimestre-v2.js exporte la fonction pure (source unique)', () => {
        const srcV2 = readFileSync(path.join(racine, 'js/trimestre-v2.js'), 'utf8');
        expect(srcV2).toMatch(/window\.calculerStatistiquesCalendrier\s*=\s*calculerStatistiquesCalendrier/);
    });
});
