import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');

// Sentinelles des reliquats DEN #343 (tests Mac 21 juin, SUIVI-BUGS) :
//   T3  — infobulle au survol du tag de famille dans la bibliothèque.
//   T4a — au récapitulatif du wizard, on n'affiche PAS la « variante » pour DEN
//         (mode technique eliminee/reduite/differee, redondant avec la description).
// (T4b est couvert par sentinelle-wizard-golden-creation-319.test.js ; T4c était
//  déjà résolu ; T5 reporté à une session Mac.)

const globaux = {
    db: { getSync: (k, def) => (def !== undefined ? def : null), setSync: () => {} },
    cle: (k) => k,
    notifications: { erreur: () => {}, succes: () => {} },
    normaliserIdPratique: (t) => t,
    genererIdUnique: () => 'id',
    echapperHtml: (s) => String(s == null ? '' : s)
};

describe('#343-T3 — infobulle des tags de famille (bibliothèque)', () => {
    // genererBadgeTypePratique est interne à l'IIFE pratiques-gestion.js (non exporté) :
    // sentinelle au niveau source (pattern déjà utilisé pour le lien-action voie-rapide).
    const src = readFileSync(path.join(racineProjet, 'js/pratiques-gestion.js'), 'utf8');

    it('le badge de famille émet un attribut title (infobulle)', () => {
        // ↻ 28 nov. 2026 (familles par réglages) : le badge et son `title` sont rendus au registre
        // (`genererBadgeFamilleDeduiteHTML`), qui reçoit de la fiche la bulle des PAN.
        expect(src).toMatch(/return genererBadgeFamilleDeduiteHTML\(famille, TOOLTIPS_PAN\[famille\.code\] \|\| ''\);/);
        const registre = readFileSync(path.join(racineProjet, 'js/pratiques/pratique-registre.js'), 'utf8');
        expect(registre).toMatch(/<span class="badge-type-pratique ' \+ famille\.classe \+ '"' \+ \(survol \? ' title="' \+ survol \+ '"' : ''\)/);
    });

    it('les quatre familles + PAN ont un texte d\'infobulle', () => {
        // ↻ 28 nov. 2026 : les bulles CUM et HYB disent le MOTIF et vivent au registre (`SURVOLS_FAMILLE_DEDUITE`) ; la fiche
        // garde celles des PAN, et le badge « PAN » d'une forme ancienne garde la sienne.
        ['SPE:', 'DEN:', 'CIB:'].forEach((cle) => {
            expect(src).toContain(cle);
        });
        expect(src).toMatch(/TOOLTIPS_PAN/);
        expect(src).toContain('title="Pratique alternative de notation.">PAN</span>');
        const registre = readFileSync(path.join(racineProjet, 'js/pratiques/pratique-registre.js'), 'utf8');
        ["'tout-compte':", "'retenu':", "'reprise':", "'retenu-et-reprise':"].forEach((cle) => expect(registre).toContain(cle));
        expect(src).toMatch(/DEN: 'PAN – Dénotation/);
    });
});

describe('#343-T4d — terme unique « statistique » pour la suggestion DEN', () => {
    // Décision Grégoire : un seul terme côté enseignant, « statistique » (rassurant,
    // ancré dans les niveaux de la grille). Le banc disait « holistique » → unifié.
    const banc = readFileSync(path.join(racineProjet, 'js/pratiques/construction-attributs.js'), 'utf8');
    const explo = readFileSync(path.join(racineProjet, 'js/pratiques/pratiques-exploration.js'), 'utf8');

    it('le banc affiche « Suggestion statistique » (plus « holistique »)', () => {
        expect(banc).toContain("'Suggestion statistique'");
        expect(banc).not.toContain('Suggestion holistique');
    });

    it('le diff d\'exploration DEN parle de « suggestion statistique »', () => {
        expect(explo).toContain('suggestion statistique');
        expect(explo).not.toContain('suggestion holistique');
    });
});

describe('#343-T4a — récapitulatif : pas de ligne « Variante » pour DEN', () => {
    const win = chargerScript('js/pratiques/modalites-evaluation.js', globaux);
    chargerScript('js/wizard-pratique-v2.js', globaux, win);

    it('DEN : la ligne « Variante » est masquée', () => {
        win.wizardState.reponses = { calcNoteFinale: 'jugement', ciblesDenotation: [{ id: 'c_a', nom: 'Cible 1' }, { id: 'c_b', nom: 'Cible 2' }] };
        const html = win.genererRecapitulatif();
        expect(html).not.toContain('Variante');
        expect(html).not.toContain('eliminee'); // jamais le brut technique
    });

    it('SOM : la ligne « Variante » reste présente (non-régression)', () => {
        win.wizardState.reponses = { calcNoteFinale: 'moyenne' };
        const html = win.genererRecapitulatif();
        expect(html).toContain('Variante');
    });
});
