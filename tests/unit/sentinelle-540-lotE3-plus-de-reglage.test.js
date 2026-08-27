import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// =======================================================================
// SENTINELLE #540 LOT E3 — « DURÉE D'UNE PÉRIODE » N'EST PLUS UN RÉGLAGE
// =======================================================================
//
// ▣ LA QUESTION DE GRÉGOIRE, 26 août 2026 : « je me demande si la durée de la période est
//   pertinente et si elle ne crée pas davantage de confusion. »
//
// ▣ CE QUE L'AUDIT A RÉPONDU. Ce champ n'existait que comme PONT entre deux unités :
//   l'horaire se saisissait en heures d'horloge, la présence en périodes. Or un ratio est
//   invariant par unité — présent sur offert donne le même résultat en minutes, en heures
//   ou en périodes, pourvu que les deux soient dans la même. Cette valeur ne servait donc
//   PAS à calculer l'assiduité ; elle réconciliait deux modes de saisie.
//
//   Et elle ne pouvait pas bien le faire : une période comprend sa pause, la correspondance
//   période ↔ minutes n'est pas une conversion mais une convention locale, et un champ
//   unique ne peut pas dire à la fois « 50 minutes d'enseignement » et « 60 minutes à
//   l'horaire » quand les deux sens de conversion ont besoin de grandeurs différentes.
//
// ▣ DÉCISION : le pont disparaît. E1 a fait porter ses périodes à chaque séance, E2 a
//   supprimé les divisions, E3 retire le réglage.
//
// ⮕ CE QUI EST VERROUILLÉ ICI :
//   A. le select a disparu de l'écran, et ses deux handlers avec lui ;
//   B. la clé ne s'ÉCRIT plus nulle part ;
//   C. la saisie n'écrit plus `heures` sur une présence — le champ sérialisé qui
//      justifiait ce diviseur ;
//   D. le select de présence ne promet plus une durée qu'il ne peut pas tenir ;
//   E. la LECTURE subsiste, et son rôle est DIT dans le code — sans quoi elle sera
//      reprise pour un réglage.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const lire = (...p) => readFileSync(path.join(racine, ...p), 'utf8');

/** Voir #540 lot A : un verrou de source lit le CODE, pas les commentaires. */
function sansCommentaires(src) {
    let sortie = '', etat = 'code', delim = null;
    for (let i = 0; i < src.length; i++) {
        const c = src[i], suivant = src[i + 1];
        if (etat === 'code') {
            if (c === '/' && suivant === '/') { etat = 'ligne'; sortie += '  '; i++; continue; }
            if (c === '/' && suivant === '*') { etat = 'bloc'; sortie += '  '; i++; continue; }
            if (c === '"' || c === "'" || c === '`') { etat = 'chaine'; delim = c; }
            sortie += c;
        } else if (etat === 'ligne') {
            if (c === '\n') { etat = 'code'; sortie += c; } else { sortie += ' '; }
        } else if (etat === 'bloc') {
            if (c === '*' && suivant === '/') { etat = 'code'; sortie += '  '; i++; }
            else { sortie += (c === '\n' ? c : ' '); }
        } else {
            if (c === '\\') { sortie += c + (suivant || ''); i++; continue; }
            if (c === delim) { etat = 'code'; delim = null; }
            sortie += c;
        }
    }
    return sortie;
}

const HTML = lire('index.html');
const SRC_HORAIRE = sansCommentaires(lire('js', 'horaire.js'));
const SRC_PRESENCES = sansCommentaires(lire('js', 'saisie-presences.js'));

// ─────────────────────────────────────────────────────────────────────
describe('#540-E3/A — le réglage a disparu de l\'écran', () => {
    it('plus de select', () => {
        expect(HTML).not.toContain('id="v2-dureePeriode"');
        expect(HTML).not.toContain('Durée d\'une période');
    });

    it('plus de handler pour le servir', () => {
        expect(SRC_HORAIRE).not.toContain('modifierDureePeriodeV2');
        expect(SRC_HORAIRE).not.toContain('chargerDureePeriodeUI');
    });

    it('et personne ne l\'appelle plus depuis l\'initialisation', () => {
        const init = sansCommentaires(lire('js', 'trimestre-v2-init.js'));
        expect(init).not.toContain('chargerDureePeriodeUI');
    });
});

describe('#540-E3/B — la clé ne s\'écrit plus', () => {
    it('le setter est retiré', () => {
        expect(SRC_HORAIRE).not.toMatch(/function\s+definirDureePeriode\s*\(/);
        const win = chargerScript('js/horaire.js', {
            db: { getSync: (k, d) => d, setSync: () => {} },
            cle: (n) => 'a2026_' + n
        });
        expect(typeof win.definirDureePeriode).toBe('undefined');
    });

    it('aucune écriture de la clé ne subsiste dans le dépôt', () => {
        for (const f of ['horaire.js', 'saisie-presences.js', 'trimestre-v2-horaires.js', 'migrations.js']) {
            const src = sansCommentaires(lire('js', f));
            expect(src, `${f} écrit encore dureePeriode`).not.toMatch(/setSync\([^)]*dureePeriode/);
        }
    });
});

describe('#540-E3/C — la saisie n\'écrit plus le champ `heures`', () => {
    it('aucun objet de présence ne le porte à l\'écriture', () => {
        expect(SRC_PRESENCES).not.toMatch(/heures:\s*heures/);
    });

    it('et plus rien ne le calcule depuis les périodes', () => {
        expect(SRC_PRESENCES).not.toMatch(/\(\s*periodesPresentes\s*\*\s*dureePeriode\s*\)\s*\/\s*60/);
    });

    it('mais il reste LU — les présences d\'avant le portent', () => {
        // Le retirer des lectures perdrait les données antérieures à ce lot.
        expect(SRC_PRESENCES).toContain('presenceExistante.heures');
    });
});

describe('#540-E3/D — le select de présence ne promet plus de durée', () => {
    it('plus de parenthèse « (1h40) » calculée depuis un diviseur', () => {
        const i = SRC_PRESENCES.indexOf('function genererOptionsPeriodesPresentes');
        const corps = SRC_PRESENCES.slice(i, SRC_PRESENCES.indexOf('\n}', i));
        expect(corps).not.toContain('dureePeriode');
        expect(corps).not.toMatch(/dureeMinutes/);
    });

    it('« complet » et « Absent » restent — ils ne parlent pas de minutes', () => {
        const i = SRC_PRESENCES.indexOf('function genererOptionsPeriodesPresentes');
        const corps = SRC_PRESENCES.slice(i, SRC_PRESENCES.indexOf('\n}', i));
        expect(corps).toContain('Absent');
        expect(corps).toContain('complet');
    });
});

describe('#540-E3/E — la lecture subsiste, et son rôle est DIT', () => {
    it('obtenirDureePeriode existe encore', () => {
        const win = chargerScript('js/horaire.js', {
            db: { getSync: (k, d) => d, setSync: () => {} },
            cle: (n) => 'a2026_' + n
        });
        expect(typeof win.obtenirDureePeriode).toBe('function');
        expect(win.obtenirDureePeriode()).toBe(50);
    });

    it('son en-tête AVERTIT que ce n\'est plus un réglage', () => {
        // Sans cet avertissement, quelqu'un rebranchera un select dessus — et le pont
        // entre les deux unités reviendra par la porte de derrière.
        const brut = lire('js', 'horaire.js');
        const i = brut.indexOf('function obtenirDureePeriode()');
        const entete = brut.slice(Math.max(0, i - 2000), i);
        expect(entete).toMatch(/N'EST PLUS UN RÉGLAGE|ne plus le remettre|NE PAS LE REMETTRE/i);
        expect(entete).toContain('#540');
    });
});
