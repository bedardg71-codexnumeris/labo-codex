import { describe, it, expect, beforeEach } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE — #319 Lot 4 (a8) — exemple de conséquence « ordre de grandeur ».
//
// Contrat (décision Grégoire 7 juin 2026) : au récap, l'exemple chiffré reflète le
// TYPE de notation (famille générique), PAS les réglages fins de l'utilisateur.
// calculerExempleConsequence :
//   - ne s'active qu'en MODE DÉMO (les profils-types DEMO0xx y vivent) ;
//   - simule la FAMILLE générique (id de pratique enregistré par défaut) sur deux
//     profils démo contrastés (Fort DEMO010, En difficulté DEMO004) ;
//   - est en LECTURE SEULE absolue (aucune écriture) ;
//   - n'interroge JAMAIS un DA réel ni la pratique personnelle de l'enseignant.
// Le rendu a8/a9 dans le récap est couvert en terrain (Playwright, mode démo).

let modeDemo = true;
const appelsSimul = [];
let ecritures = 0;

const db = {
    getSync: (k, def) => (def !== undefined ? def : null),
    setSync: () => { ecritures++; }   // espion : toute écriture incrémente le compteur
};

const globaux = {
    db,
    cle: (k) => k,
    notifications: { erreur: () => {}, succes: () => {} },
    echapperHtml: (s) => String(s == null ? '' : s),
    estEnModeDemo: () => modeDemo,
    simulerIndices: (da, id) => {
        appelsSimul.push({ da, id });
        // P fictif déterministe : Fort plus haut que En difficulté.
        const P = da === 'DEMO010' ? 88 : 57;
        return { pratique: id, C: 100, P, noteFinale: P, details: null, recit: null };
    }
};

const win = chargerScript('js/wizard-pratique-v2.js', globaux);

describe('#319 Lot 4 a8 — calculerExempleConsequence', () => {
    beforeEach(() => { modeDemo = true; appelsSimul.length = 0; ecritures = 0; });

    it('en démo : simule la famille sur Fort + En difficulté et expose les deux %', () => {
        const ex = win.calculerExempleConsequence('standards');
        expect(ex.disponible).toBe(true);
        expect(ex.idSimulation).toBe('standards');
        expect(ex.fortP).toBe(88);
        expect(ex.difficulteP).toBe(57);
    });

    it('simule UNIQUEMENT des profils démo (DEMO0xx), jamais un DA réel', () => {
        win.calculerExempleConsequence('sommative');
        expect(appelsSimul).toEqual([
            { da: 'DEMO010', id: 'sommative' },
            { da: 'DEMO004', id: 'sommative' }
        ]);
    });

    it('lecture seule : aucune écriture pendant le calcul', () => {
        win.calculerExempleConsequence('specifications');
        expect(ecritures).toBe(0);
    });

    it('hors démo : indisponible (repli), aucune simulation lancée', () => {
        modeDemo = false;
        const ex = win.calculerExempleConsequence('standards');
        expect(ex.disponible).toBe(false);
        expect(appelsSimul.length).toBe(0);
    });

    it('famille non simulable (denotation) : indisponible, aucune simulation', () => {
        const ex = win.calculerExempleConsequence('denotation');
        expect(ex.disponible).toBe(false);
        expect(appelsSimul.length).toBe(0);
    });

    it('id de simulation = famille générique (≠ pratique personnelle de l\'enseignant)', () => {
        // Les ids génériques sont les pratiques par défaut du registre, pas un id
        // configurable personnel : la config réelle de l'enseignant n'est jamais lue.
        expect(win.calculerExempleConsequence('sommative').idSimulation).toBe('sommative');
        expect(win.calculerExempleConsequence('standards').idSimulation).toBe('standards');
        expect(win.calculerExempleConsequence('specifications').idSimulation).toBe('specifications');
    });
});

describe('#319 Lot 4 — rendu du récap (a8 chiffré + a9 conditionnel)', () => {
    beforeEach(() => { modeDemo = true; appelsSimul.length = 0; ecritures = 0; });

    function recap({ modeEdition }) {
        win.wizardState.reponses = { calcNoteFinale: 'moyenne' };   // → famille sommative
        win.wizardState.modeEdition = modeEdition;
        return win.genererRecapitulatif();
    }

    it('a8 : en démo, le récap affiche les deux % d\'ordre de grandeur', () => {
        const html = recap({ modeEdition: false });
        expect(html).toContain('Ce que ça donnerait');
        expect(html).toContain('~88');   // % précédé d'un espace insécable (typo FR)
        expect(html).toContain('~57');
    });

    it('a8 : hors démo, repli qualitatif sans chiffre fabriqué', () => {
        modeDemo = false;
        const html = recap({ modeEdition: false });
        expect(html).toContain('Ce que ça donnerait');
        expect(html).toContain('moyenne pondérée');
        expect(html).not.toContain('~88');
    });

    it('a9 : la réassurance apparaît en CRÉATION', () => {
        const html = recap({ modeEdition: false });
        expect(html).toContain('Ta pratique active n\'est pas modifiée');
    });

    it('a9 : la réassurance est ABSENTE en ÉDITION', () => {
        const html = recap({ modeEdition: true });
        expect(html).not.toContain('Ta pratique active n\'est pas modifiée');
    });
});
