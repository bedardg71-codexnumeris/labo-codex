import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// =======================================================================
// SENTINELLE #540 LOT E2 — PLUS AUCUNE DURÉE NE DEVIENT UN NOMBRE DE PÉRIODES
// =======================================================================
//
// ▣ LA RÈGLE, EN UNE PHRASE. Une période comprend sa pause. Aucune durée d'horloge ne
//   peut donc rendre un nombre de périodes, quel que soit le diviseur : 50 + 10 ici,
//   55 + 5 ailleurs, et la convention n'est écrite nulle part dans les données.
//
// ▣ LES HUIT SITES DU « GROUPE 1 » (audit du 26 août). Ils partaient tous d'un temps
//   calendaire et divisaient par la durée d'enseignement :
//     · `obtenirNombrePeriodesSeance` (le dénominateur de l'assiduité)
//     · son repli par `obtenirHeuresPrevuesParHoraire`
//     · `periodesDeLaSeance` (l'écran Horaire, unifié au lot C)
//     · `presences-rapport` (la grille imprimable, avec un repli à 2 en prime)
//     · deux migrations qui RÉÉCRIVAIENT `nombrePeriodes` EN BASE, à chaque démarrage
//
// ▣ CE QUI RESTE, ET POURQUOI C'EST LÉGITIME. Le « groupe 2 » fait un ALLER-RETOUR : le
//   champ `heures` d'une présence est écrit par la saisie comme
//   `periodesPresentes × dureePeriode / 60`, puis relu par le même diviseur. On retombe
//   sur la valeur d'origine quel que soit le réglage — ce n'est pas une mesure de temps
//   d'horloge, c'est une sérialisation. Six sites, inchangés.
//
// ⮕ CE QUI EST VERROUILLÉ ICI :
//   A. la chaîne d'assiduité ne divise plus, et le réglage n'y change RIEN ;
//   B. les deux grandeurs restent distinctes — heures d'horloge d'un côté, périodes
//      saisies de l'autre, deux portes séparées vers l'horaire ;
//   C. les migrations ne devinent plus, et n'écrivent plus de périodes en base ;
//   D. les présences FACULTATIVES sont exclues de la conversion — leur champ `heures`
//      porte en réalité des périodes ;
//   E. la grille imprimable n'invente aucune période à cocher.

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

const SRC_PRESENCES = sansCommentaires(lire('js', 'saisie-presences.js'));
const SRC_MIGRATIONS = sansCommentaires(lire('js', 'migrations.js'));
const SRC_RAPPORT = sansCommentaires(lire('js', 'presences-rapport.js'));
const SRC_HORAIRES = sansCommentaires(lire('js', 'trimestre-v2-horaires.js'));

const corpsDe = (src, nom) => {
    const i = src.indexOf(`function ${nom}(`);
    expect(i, `${nom} renommée ou retirée sans mettre à jour cette sentinelle`).toBeGreaterThan(-1);
    return src.slice(i, src.indexOf('\n}', i));
};

/** Monte le module avec un horaire donné. */
function monter({ horaire = [], jour = 'Lundi', dureePeriode = 50 } = {}) {
    return chargerScript('js/saisie-presences.js', {
        db: { getSync: (k, d) => (d !== undefined ? d : null), setSync: () => {} },
        cle: (k) => `a2026_${k}`,
        obtenirSeancesHoraire: () => horaire,
        obtenirSeancesCompletes: () => ({}),
        obtenirDureePeriode: () => dureePeriode,
        obtenirInfosJour: () => ({ statut: 'cours', jourSemaine: jour, numeroSemaine: 3 }),
        dateLocaleYMD: () => '2026-08-26',
        document: {
            getElementById: () => null, querySelector: () => null, querySelectorAll: () => [],
            addEventListener: () => {}, createElement: () => ({ style: {}, classList: { add() {}, remove() {} } })
        }
    });
}

// ─────────────────────────────────────────────────────────────────────
describe('#540-E2/A — la chaîne d\'assiduité ne divise plus', () => {
    it('le corps de obtenirNombrePeriodesSeance ne contient aucune conversion', () => {
        const corps = corpsDe(SRC_PRESENCES, 'obtenirNombrePeriodesSeance');
        expect(corps).not.toMatch(/\*\s*60\s*\)\s*\//);
        expect(corps).not.toContain('dureePeriode');
        expect(corps).not.toContain('mesurerDureeSeance');
    });

    it('LE CAS DE GRÉGOIRE : un bloc de 4 h déclaré 4 périodes en rend 4, pas 5', () => {
        // L'ancienne chaîne faisait 240 / 50 = 4,8 → 5. Une période de trop, à chaque
        // séance, au dénominateur de son assiduité.
        const win = monter({ horaire: [{ jour: 'Lundi', heureDebut: '08:00', heureFin: '12:00', nombrePeriodes: 4 }] });
        expect(win.obtenirNombrePeriodesSeance('2026-08-24')).toBe(4);
    });

    it('et le réglage de durée n\'y change RIEN (preuve vivante qu\'aucune division ne subsiste)', () => {
        const horaire = [{ jour: 'Lundi', heureDebut: '08:00', heureFin: '11:00', nombrePeriodes: 3 }];
        for (const d of [50, 55, 60, 75, 90]) {
            expect(monter({ horaire, dureePeriode: d }).obtenirNombrePeriodesSeance('2026-08-24'),
                `réglage ${d} min`).toBe(3);
        }
    });
});

describe('#540-E2/B — deux grandeurs, deux portes, aucun pont', () => {
    const horaire = [{ jour: 'Lundi', heureDebut: '08:00', heureFin: '11:00', nombrePeriodes: 3 }];

    it('les périodes se lisent', () => {
        expect(monter({ horaire }).obtenirPeriodesPrevuesParHoraire('2026-08-24')).toBe(3);
    });

    it('les heures se mesurent — et rendent bien 3 h, pas 3 périodes', () => {
        expect(monter({ horaire }).obtenirHeuresPrevuesParHoraire('2026-08-24')).toBe(3);
    });

    it('une séance qui n\'a QUE des heures ne donne aucune période', () => {
        const sansP = [{ jour: 'Lundi', heureDebut: '08:00', heureFin: '11:00' }];
        const win = monter({ horaire: sansP });
        expect(win.obtenirHeuresPrevuesParHoraire('2026-08-24')).toBe(3);
        expect(win.obtenirPeriodesPrevuesParHoraire('2026-08-24')).toBe(0);
    });

    it('la porte des périodes ne convertit rien', () => {
        const corps = corpsDe(SRC_PRESENCES, 'obtenirPeriodesPrevuesParHoraire');
        expect(corps).not.toMatch(/\*\s*60/);
        expect(corps).not.toContain('dureePeriode');
        expect(corps).not.toContain('mesurerDureeSeance');
    });

    it('la règle de la REPRISE est la même des deux côtés (le jour remplacé porte l\'horaire)', () => {
        const corps = corpsDe(SRC_PRESENCES, 'obtenirPeriodesPrevuesParHoraire');
        expect(corps).toContain('jourRemplace');
    });
});

describe('#540-E2/C — les migrations ne devinent plus', () => {
    it('aucune ne convertit une durée de séance en périodes', () => {
        const corps = corpsDe(SRC_MIGRATIONS, 'migrerSeancesVersPeriodes');
        expect(corps).not.toMatch(/nombrePeriodes\s*=\s*Math\.round/);
    });

    it('et rien n\'écrit plus `nombrePeriodes` en base depuis une durée', () => {
        expect(SRC_MIGRATIONS).not.toMatch(/seance\.nombrePeriodes\s*=\s*Math\.round\([^)]*duree/);
    });
});

describe('#540-E2/D — les présences facultatives échappent à la conversion', () => {
    it('la migration des présences les exclut', () => {
        const corps = corpsDe(SRC_MIGRATIONS, 'migrerPresencesVersPeriodes');
        expect(corps).toContain('facultatif');
    });

    it('mais l\'aller-retour légitime subsiste pour les présences régulières', () => {
        // `heures` y est une sérialisation de `periodesPresentes`, pas une mesure : même
        // diviseur à l'écriture et à la lecture, donc valeur d'origine retrouvée.
        const corps = corpsDe(SRC_MIGRATIONS, 'migrerPresencesVersPeriodes');
        expect(corps).toContain('periodesPresentes = Math.round');
    });
});

describe('#540-E2/E — la grille imprimable n\'invente aucune période', () => {
    it('plus de repli à 2 : une case inventée se coche au crayon', () => {
        expect(SRC_RAPPORT).not.toMatch(/periodesAttendues\s*=\s*2/);
    });

    it('et plus de conversion de durée', () => {
        expect(SRC_RAPPORT).not.toMatch(/s\.duree\s*\*\s*60/);
    });
});

describe('#540-E2/F — l\'écran Horaire lit, il ne mesure plus', () => {
    it('periodesDeLaSeance est une lecture', () => {
        const corps = corpsDe(SRC_HORAIRES, 'periodesDeLaSeance');
        expect(corps).toContain('nombrePeriodes');
        expect(corps).not.toContain('dureePeriode');
        expect(corps).not.toContain('mesurerDureeSeance');
    });
});
