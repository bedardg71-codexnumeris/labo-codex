import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE DU PINCEMENT DE LA CARTE D'ALIGNEMENT (7 septembre 2026).
//
// Le retour de Grégoire, depuis l'iPad : « les zoom in et out dans le canevas
// de la carte d'alignement ne sont pas fluides comme ceux des pages Annoter et
// Évaluer ». Trois causes mesurées à la lecture du code, toutes absentes de la
// visionneuse qui, elle, est jugée fluide :
//
//   1. Les DEUX chemins de pincement — `gesturestart`/`gesturechange` (Safari)
//      et `touchstart`/`touchmove` (générique) — étaient branchés sur la même
//      zone, sans exclusion. Safari émet les deux familles pendant un seul
//      pincement : chacun réécrivait `etat.zoom` depuis sa propre base et
//      recentrait sur son propre point — le centre de la zone pour l'un, le
//      milieu des doigts pour l'autre. Deux zooms contradictoires par image.
//   2. Chaque événement refaisait le cycle complet : redimensionner l'enveloppe
//      de 10 000 × 6 000 px, lire `getBoundingClientRect()`, réécrire
//      `scrollLeft`/`scrollTop`. Une écriture de mise en page, une lecture qui
//      la force, une écriture encore — par événement, et Safari en émet plus
//      qu'il n'y a d'images.
//   3. La molette avançait d'un pas FIXE de ±5 % par événement : le zoom suit
//      alors la cadence des événements, pas l'amplitude du geste. C'est le
//      défaut corrigé sur la visionneuse en #660, resté ici.
//
// Ce que cette sentinelle tient :
//   S1 — LE POINT DÉCISIF : le point de carte sous les doigts ne bouge pas,
//        pendant l'aperçu comme après le geste, et les deux coïncident — donc
//        rien ne saute à la levée des doigts.
//   S2 — un seul chemin de pincement peut être branché à la fois.
//   S3 — la boucle d'aperçu ne remet pas la page en page : ni redimensionnement
//        de l'enveloppe, ni écriture du défilement.
//   S4 — la molette suit l'amplitude du geste, pas la cadence des événements.
//
// ⚠ Ce que cette sentinelle NE tient PAS : que ce soit fluide. La fluidité se
// juge au doigt sur l'iPad — WebKit est absent des conteneurs (#456) et aucun
// banc ici ne mesure une image par seconde. Elle tient l'arithmétique et la
// forme, qui sont les causes ; le verdict reste à Grégoire.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const source = readFileSync(path.join(racine, 'js', 'planification-carte.js'), 'utf8');

function chargerCarte() {
    const store = {};
    const globaux = {
        db: {
            getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
            setSync: (k, v) => { store[k] = v; },
            get: async (k, d) => (k in store ? store[k] : d),
            set: async (k, v) => { store[k] = v; }
        },
        cle: (k) => `a2026_${k}`,
        echapperHtml: (t) => (t == null ? '' : String(t)),
        obtenirCoursActifId: () => null,
        alert: () => {},
        requestAnimationFrame: (fn) => { fn(); return 0; },
        cancelAnimationFrame: () => {}
    };
    return chargerScript('js/planification-carte.js', globaux);
}

/* --------------------------------------------------------------- S1 : le point */

describe('Pincement de la carte · S1 — le point sous les doigts ne bouge pas', () => {
    const { decalageApercuZoom, defilementApresZoom } = chargerCarte().planificationCarte;

    // Le modèle de rendu est écrit ICI, à partir du CSS, et non emprunté au
    // module : `#planif-espace` porte `transform-origin: 0 0` dans une zone qui
    // défile. Un point d'espace E se pose donc à l'écran en :
    //
    //     E × zoom + décalage du transform − défilement de la zone
    //
    // Sans cette indépendance, le test récrirait la formule qu'il vérifie.
    const positionEcran = (pointEspace, zoom, decalage, defilement) =>
        pointEspace * zoom + decalage - defilement;

    // Le point d'espace visé, tel que le geste le calcule à son départ.
    const pointVise = (focal, defilement, zoom) => (focal + defilement) / zoom;

    const cas = [
        { nom: 'zoom avant depuis 100 %', focal: 300, defilement: 1200, z0: 1, z1: 2.4 },
        { nom: 'zoom arrière depuis 100 %', focal: 300, defilement: 1200, z0: 1, z1: 0.35 },
        { nom: 'doigt au bord gauche', focal: 4, defilement: 0, z0: 0.5, z1: 1.8 },
        { nom: 'carte déjà agrandie', focal: 512, defilement: 8800, z0: 2.5, z1: 0.9 },
        { nom: 'plancher de zoom', focal: 410, defilement: 640, z0: 1, z1: 0.1 },
        { nom: 'zoom inchangé', focal: 77, defilement: 3333, z0: 1.3, z1: 1.3 }
    ];

    for (const c of cas) {
        it(`${c.nom} — l'aperçu garde le point à sa place`, () => {
            const E = pointVise(c.focal, c.defilement, c.z0);
            const t = decalageApercuZoom(c.focal, c.defilement, E, c.z1);
            // Le défilement ne bouge pas pendant l'aperçu : c'est le transform
            // qui porte tout le décalage.
            expect(positionEcran(E, c.z1, t, c.defilement)).toBeCloseTo(c.focal, 9);
        });

        it(`${c.nom} — la finalisation garde le point à la MÊME place`, () => {
            const E = pointVise(c.focal, c.defilement, c.z0);
            const defilementFinal = defilementApresZoom(E, c.z1, c.focal);
            // Après le geste, le transform est nu (décalage zéro) : c'est le
            // défilement qui reprend le décalage à son compte.
            expect(positionEcran(E, c.z1, 0, defilementFinal)).toBeCloseTo(c.focal, 9);
        });

        it(`${c.nom} — rien ne saute entre la dernière image et la levée du doigt`, () => {
            const E = pointVise(c.focal, c.defilement, c.z0);
            const apercu = positionEcran(E, c.z1, decalageApercuZoom(c.focal, c.defilement, E, c.z1), c.defilement);
            const apres = positionEcran(E, c.z1, 0, defilementApresZoom(E, c.z1, c.focal));
            expect(apres).toBeCloseTo(apercu, 9);
        });
    }

    it('l\'aperçu tient même si la zone a glissé sous les doigts pendant le geste', () => {
        // À deux doigts, Safari peut faire défiler la zone PENDANT le pincement.
        // Le décalage se recalcule sur le défilement du moment : c'est pour ça
        // que la boucle le relit au lieu de le figer au départ.
        const E = pointVise(250, 900, 1);
        for (const defilementCourant of [900, 1140, 380, 0]) {
            const t = decalageApercuZoom(250, defilementCourant, E, 1.7);
            expect(positionEcran(E, 1.7, t, defilementCourant)).toBeCloseTo(250, 9);
        }
    });
});

/* ------------------------------------------------- S2 : un seul chemin à la fois */

describe('Pincement de la carte · S2 — les deux chemins s\'excluent', () => {
    it('le chemin tactile est dans le `else` du chemin Safari', () => {
        const debut = source.indexOf("if ('GestureEvent' in window) {");
        expect(debut, 'le branchement sur GestureEvent doit exister').toBeGreaterThan(-1);

        // Bornes du `if` par comptage d'accolades — le corps contient des
        // fonctions imbriquées, une regex ne suffit pas.
        const ouvrante = source.indexOf('{', debut + 'if (\'GestureEvent\' in window)'.length);
        let profondeur = 0, fin = -1;
        for (let i = ouvrante; i < source.length; i++) {
            if (source[i] === '{') profondeur++;
            else if (source[i] === '}') {
                profondeur--;
                if (profondeur === 0) { fin = i; break; }
            }
        }
        expect(fin, 'le bloc GestureEvent doit se refermer').toBeGreaterThan(-1);

        const brancheSafari = source.slice(ouvrante, fin);
        const apresLeIf = source.slice(fin + 1, fin + 12);

        expect(brancheSafari).toContain("'gesturechange'");
        expect(brancheSafari, 'le chemin tactile ne doit PAS être dans la branche Safari')
            .not.toContain("'touchmove'");
        expect(apresLeIf.trimStart().startsWith('else'),
            'le chemin tactile doit être le `else` du chemin Safari, pas un second branchement inconditionnel')
            .toBe(true);
    });

    it('la zone de travail ne porte qu\'un seul écouteur `touchmove` de zoom', () => {
        const occurrences = source.match(/zoneTravail\.addEventListener\('touchmove'/g) || [];
        expect(occurrences.length).toBe(1);
    });
});

/* ------------------------------------- S3 : la boucle d'aperçu ne remet rien en page */

describe('Pincement de la carte · S3 — l\'aperçu ne remet pas la page en page', () => {
    function corpsDe(nomFonction) {
        const debut = source.indexOf(`function ${nomFonction}(`);
        expect(debut, `${nomFonction} doit exister`).toBeGreaterThan(-1);
        const ouvrante = source.indexOf('{', debut);
        let profondeur = 0, fin = -1;
        for (let i = ouvrante; i < source.length; i++) {
            if (source[i] === '{') profondeur++;
            else if (source[i] === '}') {
                profondeur--;
                if (profondeur === 0) { fin = i; break; }
            }
        }
        return source.slice(ouvrante, fin);
    }

    const boucle = corpsDe('majApercuZoom');

    it('ne redimensionne pas l\'enveloppe de 10 000 × 6 000 px', () => {
        // `appliquerZoom()` écrit `espaceWrapper.style.width/height` : refaire
        // la mise en page de toute la carte à chaque événement tactile est
        // exactement ce qui saccadait.
        expect(boucle).not.toContain('appliquerZoom(');
        expect(boucle).not.toContain('espaceWrapper');
    });

    it('n\'écrit pas le défilement', () => {
        expect(boucle).not.toMatch(/scrollLeft\s*=/);
        expect(boucle).not.toMatch(/scrollTop\s*=/);
    });

    it('ne force pas de calcul de mise en page', () => {
        expect(boucle).not.toContain('getBoundingClientRect');
    });

    it('ne parcourt pas les boutons de préréglage', () => {
        expect(boucle).not.toContain('mettreAJourBoutonsZoomPreset');
        expect(boucle).not.toContain('querySelectorAll');
    });

    it('passe par une image d\'animation, pas par l\'événement brut', () => {
        expect(boucle).toContain('requestAnimationFrame');
    });

    it('la géométrie de la zone se lit UNE fois, au départ du geste', () => {
        expect(corpsDe('demarrerApercuZoom')).toContain('getBoundingClientRect');
    });

    it('la finalisation, elle, repose l\'enveloppe et le défilement', () => {
        const fin = corpsDe('finirApercuZoom');
        expect(fin).toContain('appliquerZoom(');
        expect(fin).toMatch(/scrollLeft\s*=/);
        expect(fin).toMatch(/scrollTop\s*=/);
    });
});

/* ----------------------------------------------- S4 : la molette suit l'amplitude */

describe('Pincement de la carte · S4 — la molette suit l\'amplitude', () => {
    it('le facteur se calcule sur `deltaY`, sans pas fixe', () => {
        const debut = source.indexOf("zoneTravail.addEventListener('wheel'");
        expect(debut).toBeGreaterThan(-1);
        const handler = source.slice(debut, debut + 900);

        expect(handler, 'le facteur doit être exponentiel en deltaY, comme la visionneuse (#660)')
            .toContain('Math.exp(-e.deltaY');
        expect(handler, 'un pas fixe ferait suivre la cadence des événements, pas le geste')
            .not.toMatch(/deltaY\s*<\s*0\s*\?\s*1\.05/);
    });

    it('un deltaY nul ne fait pas avancer le zoom', () => {
        const debut = source.indexOf("zoneTravail.addEventListener('wheel'");
        const handler = source.slice(debut, debut + 900);
        expect(handler).toMatch(/if\s*\(!e\.deltaY\)\s*return;/);
    });

    it('la sensibilité est celle de la visionneuse', () => {
        const ici = source.match(/const ZOOM_SENSIBILITE_MOLETTE = ([\d.]+);/);
        const visionneuse = readFileSync(path.join(racine, 'js', 'travaux-visionneuse.js'), 'utf8')
            .match(/const ZOOM_SENSIBILITE_MOLETTE = ([\d.]+);/);
        expect(ici, 'la carte doit déclarer sa sensibilité').toBeTruthy();
        expect(visionneuse, 'la visionneuse doit déclarer la sienne').toBeTruthy();
        expect(ici[1]).toBe(visionneuse[1]);
    });
});
