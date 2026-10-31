/**
 * SENTINELLE — LES BARRES DE L'APERÇU (décisions de Grégoire du 30 oct. 2026, 15 h 37 et 15 h 38).
 *
 *   · Entre deux zones, un passage centré sur le seuil : la couleur AU seuil est le mélange à parts égales, pour A, C et P,
 *     dans les deux axes, et même là où deux seuils se touchent presque.
 *   · Le voile reste.
 *   · À la cassure seulement, le passage se mesure à l'écran : même largeur des deux côtés (22 h 29).
 *   · L'axe de A et de C : proportionnel par défaut, deux segments au choix, cassé au seuil le plus bas lu à sa source.
 *     P reste proportionnel. Points, moyenne, courbe, traits et graduations lisent la même fonction.
 *
 * Ce que la sauvegarde écrit ou n'écrit pas se joue dans un vrai navigateur : tests/integration/barres-apercu-axe.spec.js.
 *
 *   cd tests && npx vitest run unit/sentinelle-barres-apercu-2026-10-30.test.js
 *
 * Break-tests : journal en fin de fichier.
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { monter, storeBase, echelleAReperes, RACINE } from './_helpers/bac-suivi.js';
import { tranche } from './_helpers/tranche.js';

const INTERNES = ['fondDeLaBarre', 'positionDansSaZone', 'positionSurEchelleDistribution', 'valeurSurEchelleDistribution', 'cassureDeLaBarre', 'genererSvgGauss', 'genererBarreDistribution'];
const SEUILS = (acceptable, bon, excellent) => ({ interpretation: { acceptable, bon, excellent } });

function banc({ prefs = {}, seuils, echelles = [] } = {}) {
    const store = storeBase();
    store.test_echellesTemplates = JSON.parse(JSON.stringify(echelles));
    if (seuils) store.seuilsInterpretation = seuils;
    const b = monter(store, {
        prefs,
        modules: ['js/contexte-qualification.js', 'js/profil-etudiant-calculs.js', { chemin: 'js/tableau-bord-apercu.js', internes: INTERNES }],
        globaux: { designerPratiqueActive: () => ({ etat: 'ok', famille: 'standards' }), obtenirTypePratiqueActive: () => 'standards' }
    });
    return { win: b.win, i: b.interne['tableau-bord-apercu.js'] };
}

/** Lit un fond CSS comme le navigateur : ses arrêts, puis la couleur à une position. Aucune connaissance du code. */
function lireFond(fond) {
    const corps = fond.replace(/^linear-gradient\(to right, /, '').replace(/\)$/, '');
    return corps.match(/(#[0-9a-fA-F]{6}|rgb\([^)]*\)) [\d.e-]+%/g).map((a) => {
        const [couleur, position] = [a.slice(0, a.lastIndexOf(' ')), parseFloat(a.slice(a.lastIndexOf(' ') + 1))];
        const canaux = couleur.startsWith('#')
            ? [1, 3, 5].map((d) => parseInt(couleur.slice(d, d + 2), 16))
            : couleur.match(/\d+/g).map(Number);
        return { canaux, position };
    });
}
function couleurA(arrets, position) {
    const apres = arrets.findIndex((a) => a.position >= position);
    if (apres <= 0) return arrets[Math.max(apres, 0)].canaux;
    const [g, d] = [arrets[apres - 1], arrets[apres]];
    const t = d.position === g.position ? 0 : (position - g.position) / (d.position - g.position);
    return g.canaux.map((c, k) => c + (d.canaux[k] - c) * t);
}
const canauxDe = (hex) => [1, 3, 5].map((d) => parseInt(hex.slice(d, d + 2), 16));

function verifierLeMilieuDeChaquePassage(i, zones, cassure) {
    const arrets = lireFond(i.fondDeLaBarre(zones, cassure));
    for (let k = 1; k < arrets.length; k++) expect(arrets[k].position).toBeGreaterThanOrEqual(arrets[k - 1].position);
    expect(arrets[0].position).toBe(0);
    expect(arrets[arrets.length - 1].position).toBe(100);
    zones.slice(0, -1).forEach((z, k) => {
        const position = i.positionSurEchelleDistribution(z.a, cassure);
        const attendu = canauxDe(z.couleur).map((c, n) => (c + canauxDe(zones[k + 1].couleur)[n]) / 2);
        couleurA(arrets, position).forEach((c, n) => expect(Math.abs(c - attendu[n]), `seuil ${z.a}, canal ${n}`).toBeLessThanOrEqual(0.5));
    });
    return arrets;
}

afterEach(() => vi.restoreAllMocks());

describe('(a) la couleur au seuil est le mélange à parts égales des deux zones', () => {
    const REGLAGES = [undefined, SEUILS(0.7, 0.8, 0.92), SEUILS(0.85, 0.86, 0.95), SEUILS(0.5, 0.99, 1)];

    it('pour A et C, sur des seuils quelconques, dans les deux axes', () => {
        for (const seuils of REGLAGES) {
            for (const indice of ['A', 'C']) {
                const { i, win } = banc({ seuils });
                const zones = win.zonesDeLaBarre(indice).filter((z) => z.a > z.de);
                verifierLeMilieuDeChaquePassage(i, zones, null);
                verifierLeMilieuDeChaquePassage(i, zones, i.cassureDeLaBarre(indice, 'deuxSegments'));
            }
        }
    });

    it('pour P, sur les repères de l’échelle', () => {
        const echelle = echelleAReperes({ id: 'E', plages: [['I', 0, 49], ['D', 50, 71], ['M', 72, 89], ['E', 90, 100]] });
        const { i, win } = banc({ echelles: [echelle] });
        const zones = win.zonesDeLaBarre('P').filter((z) => z.a > z.de);
        expect(zones.length).toBeGreaterThan(1);
        verifierLeMilieuDeChaquePassage(i, zones, null);
    });

    it('une zone sous le début de l’axe ne laisse pas de passage visible : le fond commence à la première zone visible', () => {
        const { i } = banc();
        const zones = [{ de: 0, a: 0.2, zone: 'bas', couleur: '#CC5500' }, { de: 0.2, a: 1, zone: 'acquis', couleur: '#28a745' }];
        const arrets = lireFond(i.fondDeLaBarre(zones));
        expect(arrets.map((a) => a.position)).toEqual([0, 100]);
        expect(arrets[0].canaux).toEqual(canauxDe('#28a745'));
    });
});

describe('(b) la largeur des passages', () => {
    it('la moitié de la plus étroite des deux zones visibles : 2,5 points pour A par défaut', () => {
        const { i, win } = banc();
        const arrets = lireFond(i.fondDeLaBarre(win.zonesDeLaBarre('A')));
        const position = (v) => i.positionSurEchelleDistribution(v);
        expect(arrets.map((a) => a.position)).toEqual([0, 82.5, 85, 87.5, 87.5, 90, 92.5, 92.5, 95, 97.5, 100].map((p) => expect.closeTo(p === 0 ? 0 : p === 100 ? 100 : position(p / 100), 6)));
    });

    it('au moins 1,5 point, sans que deux passages voisins se croisent', () => {
        const { i, win } = banc({ seuils: SEUILS(0.85, 0.86, 0.95) });
        const arrets = verifierLeMilieuDeChaquePassage(i, win.zonesDeLaBarre('A'), null);
        const position = (v) => i.positionSurEchelleDistribution(v);
        expect(arrets[1].position).toBeCloseTo(position(0.835), 6);
        expect(arrets[6].position).toBeCloseTo(position(0.875), 6);
        // Le milieu de la zone 85-86 garde sa couleur pure.
        couleurA(arrets, position(0.855)).forEach((c, n) => expect(c).toBeCloseTo(canauxDe('#ffc107')[n], 0));
    });
});

describe('(b bis) le passage à la cassure : symétrique à l’écran (Grégoire, 30 oct. 2026, 22 h 29)', () => {
    const SEUILS_ESSAYES = [undefined, SEUILS(0.7, 0.8, 0.92), SEUILS(0.85, 0.86, 0.95), SEUILS(0.5, 0.99, 1), SEUILS(0.35, 0.8, 0.9)];

    it('les deux demi-passages ont la même largeur à l’écran : la moitié de la plus étroite des deux zones', () => {
        for (const seuils of SEUILS_ESSAYES) {
            const { i, win } = banc({ seuils });
            const zones = win.zonesDeLaBarre('A').filter((z) => z.a > z.de);
            const cassure = i.cassureDeLaBarre('A', 'deuxSegments');
            const arrets = verifierLeMilieuDeChaquePassage(i, zones, cassure);
            // Le deuxième arrêt ouvre le passage de la cassure, le troisième porte le seuil au quart de la barre, le quatrième le ferme.
            const [avant, seuil, apres] = [arrets[1], arrets[2], arrets[3]];
            expect(seuil.position).toBe(25);
            expect(seuil.position - avant.position, `seuils ${cassure}`).toBeCloseTo(apres.position - seuil.position, 10);
            // La zone du dessus, lue sur l'axe attendu, écrit ici sans passer par le code.
            const largeurDessus = (zones[1].a - cassure) / (1 - cassure) * 75;
            expect(seuil.position - avant.position, `seuils ${cassure}`).toBeCloseTo(Math.min(25, largeurDessus) / 2, 10);
            expect(avant.canaux).toEqual(canauxDe(zones[0].couleur));
            expect(apres.canaux).toEqual(canauxDe(zones[1].couleur));
        }
    });

    it('les autres seuils gardent leur passage en points, et le proportionnel ne change pas', () => {
        const { i, win } = banc();
        const zones = win.zonesDeLaBarre('A');
        const arrets = lireFond(i.fondDeLaBarre(zones, 0.85));
        expect(arrets.map((a) => a.position)).toEqual([0, 12.5, 25, 37.5, 37.5, 50, 62.5, 62.5, 75, 87.5, 100].map((p) => expect.closeTo(p, 6)));
        // Une zone étroite au-dessus de la cassure : 85-86 fait 5 % de la barre ; le seuil suivant garde son minimum en points.
        const serres = banc({ seuils: SEUILS(0.85, 0.86, 0.95) });
        const positionsSerrees = lireFond(serres.i.fondDeLaBarre(serres.win.zonesDeLaBarre('A'), 0.85)).map((a) => a.position);
        expect(positionsSerrees).toEqual([0, 22.5, 25, 27.5, 27.5, 30, 37.5, 62.5, 75, 87.5, 100].map((p) => expect.closeTo(p, 6)));
        // Sans cassure, 85 % garde son passage de 2,5 points de chaque côté.
        const proportionnel = lireFond(i.fondDeLaBarre(zones)).map((a) => a.position);
        expect(proportionnel.slice(1, 4)).toEqual([0.825, 0.85, 0.875].map((v) => expect.closeTo((v - 0.3) / 0.7 * 100, 6)));
    });
});

describe('(c) l’axe', () => {
    it('proportionnel sans choix, et pour toute valeur inconnue', () => {
        for (const prefs of [{}, { axeBarresApercu: 'proportionnel' }, { axeBarresApercu: 'n’importe quoi' }]) {
            const { i } = banc({ prefs });
            expect(i.cassureDeLaBarre('A')).toBeNull();
            expect(i.cassureDeLaBarre('C')).toBeNull();
        }
    });

    it('proportionnel : la formule d’avant, à l’identique', () => {
        const { i } = banc();
        for (const v of [0, 0.3, 0.5, 0.65, 0.85, 1, 1.2]) {
            expect(i.positionSurEchelleDistribution(v)).toBe(Math.max(0, Math.min((v - 0.3) / (1 - 0.3) * 100, 100)));
        }
    });

    it('deux segments : le seuil le plus bas tombe au quart, 30 au bord gauche, 100 au bord droit', () => {
        const { i } = banc({ prefs: { axeBarresApercu: 'deuxSegments' } });
        const cassure = i.cassureDeLaBarre('A');
        expect(cassure).toBe(0.85);
        expect(i.positionSurEchelleDistribution(0.3, cassure)).toBe(0);
        expect(i.positionSurEchelleDistribution(0.85, cassure)).toBe(25);
        expect(i.positionSurEchelleDistribution(1, cassure)).toBe(100);
        expect(i.positionSurEchelleDistribution(0.1, cassure)).toBe(0);
    });

    it('le seuil est lu aux trois champs : le changer déplace la cassure', () => {
        const { i } = banc({ prefs: { axeBarresApercu: 'deuxSegments' }, seuils: SEUILS(0.7, 0.8, 0.92) });
        expect(i.cassureDeLaBarre('C')).toBe(0.7);
        expect(i.positionSurEchelleDistribution(0.7, 0.7)).toBe(25);
    });

    it('P garde l’axe proportionnel, quel que soit le choix', () => {
        const { i } = banc({ prefs: { axeBarresApercu: 'deuxSegments' } });
        expect(i.cassureDeLaBarre('P')).toBeNull();
    });

    it('un seuil sans rien à casser laisse l’axe proportionnel', () => {
        expect(banc({ prefs: { axeBarresApercu: 'deuxSegments' }, seuils: SEUILS(0.3, 0.8, 0.92) }).i.cassureDeLaBarre('A')).toBeNull();
    });

    it('l’inverse rend la valeur, de part et d’autre de la cassure', () => {
        const { i } = banc();
        for (const cassure of [null, 0.85, 0.5]) {
            for (const v of [0.3, 0.4, 0.5, 0.84, 0.85, 0.9, 1]) {
                expect(i.valeurSurEchelleDistribution(i.positionSurEchelleDistribution(v, cassure), cassure)).toBeCloseTo(v, 10);
            }
        }
    });

    it('un point reste dans la zone de son palier, dans les deux axes', () => {
        const { i, win } = banc();
        const zones = win.zonesDeLaBarre('A');
        for (const cassure of [null, 0.85]) {
            for (const v of [0.4, 0.84, 0.85, 0.89, 0.9, 0.94, 0.95, 1]) {
                const borne = zones.find((z) => v >= z.de && v < z.a) || zones[zones.length - 1];
                for (const decalage of [-3, 3]) {
                    const p = i.positionDansSaZone(i.positionSurEchelleDistribution(v, cassure) + decalage, v, zones, cassure);
                    expect(p).toBeGreaterThanOrEqual(i.positionSurEchelleDistribution(borne.de, cassure));
                    expect(p).toBeLessThanOrEqual(i.positionSurEchelleDistribution(borne.a, cassure));
                }
            }
        }
    });
});

describe('(d) tout ce que la barre dessine lit le même axe', () => {
    const ETUDIANTS = [0.7, 0.84, 0.86, 0.9, 0.92, 0.95, 0.98, 1].map((valeur, n) => ({ da: '20000' + n, nom: 'Fictif', prenom: 'Élève' + n, valeur }));
    const rendre = (i, type) => {
        vi.spyOn(Math, 'random').mockReturnValue(0.5);   // Sans décalage : les points tombent à leur valeur.
        return i.genererBarreDistribution('Essai', ETUDIANTS, [], type, true, false);
    };
    // La place attendue d'un point : sa valeur sur l'axe attendu, retenue dans sa zone (la marge de 0,5 de `positionDansSaZone`).
    const placesAttendues = (i, win, position, cassure) => ETUDIANTS
        .map((e) => i.positionDansSaZone(position(e.valeur), e.valeur, win.zonesDeLaBarre('A'), cassure))
        .sort((a, b) => a - b)
        .map((p) => expect.closeTo(p, 6));
    const lefts = (html) => [...html.matchAll(/class="barre-etudiant [^"]*"\s+style="left: ([\d.]+)%/g)].map((m) => parseFloat(m[1]));

    it('deux segments : les points, la moyenne, la courbe et les traits sont sur l’axe cassé', () => {
        const { i, win } = banc({ prefs: { axeBarresApercu: 'deuxSegments' } });
        const html = rendre(i, 'A');
        // L'axe attendu est écrit ici, sans passer par le code : 30-85 dans le premier quart, 85-100 dans le reste.
        const position = (v) => (v <= 0.85 ? (v - 0.3) / (0.85 - 0.3) * 25 : 25 + (v - 0.85) / (1 - 0.85) * 75);
        expect(lefts(html).sort((a, b) => a - b)).toEqual(placesAttendues(i, win, position, 0.85));
        // Le fond : le seuil le plus bas tombe au quart de la barre, là où la graduation le dit.
        const fond = html.match(/class="barre-indicateur" style="background: ([^;]+);/)[1];
        expect(fond).toContain(' 25%');
        // La moyenne affichée (arrondie, comme à l'écran) : 89 %.
        const moyenne = Math.round(ETUDIANTS.reduce((s, e) => s + e.valeur, 0) / ETUDIANTS.length * 100);
        const gauche = (motif) => parseFloat(html.match(motif)[1]);
        expect(gauche(/left: ([\d.]+)%; transform: translateX\(-50%\); z-index: 10/)).toBeCloseTo(position(moyenne / 100), 6);
        const vraie = ETUDIANTS.reduce((s, e) => s + e.valeur, 0) / ETUDIANTS.length;
        expect(gauche(/<line class="ligne-mu" x1="([\d.]+)"/)).toBeCloseTo(position(vraie), 6);
        const ecart = Math.sqrt(ETUDIANTS.reduce((s, e) => s + (e.valeur - vraie) ** 2, 0) / ETUDIANTS.length);
        expect(gauche(/<line class="ligne-sigma" x1="([\d.]+)"/)).toBeCloseTo(position(vraie - ecart), 6);
        // La courbe : son sommet tombe sur la moyenne, à l'échantillonnage près (50 pas de 2 % de la barre).
        const sommets = [...html.match(/<path d="M ([^"]+)"/)[1].matchAll(/([\d.]+),([\d.]+)/g)].map((m) => [parseFloat(m[1]), parseFloat(m[2])]);
        const sommet = sommets.reduce((h, p) => (p[1] < h[1] ? p : h));
        expect(Math.abs(sommet[0] - position(vraie))).toBeLessThanOrEqual(1);
    });

    it('deux segments : les graduations disent la cassure sous A et C, pas sous P', () => {
        const { i } = banc({ prefs: { axeBarresApercu: 'deuxSegments' } });
        const html = rendre(i, 'A');
        const cassure = html.match(/<span class="barre-graduation barre-graduation-cassure"[^>]* style="left: ([\d.]+)%;">([^<]+)</);
        expect(parseFloat(cassure[1])).toBe(25);
        expect(cassure[2]).toContain('85');
        expect(html.match(/class="barre-graduation[ "]/g)).toHaveLength(5);
        // P : l'axe ne casse pas, donc rien sous la barre (#821, bloc 6b).
        expect(rendre(i, 'P')).not.toContain('barre-graduation');
    });

    it('deux graduations ne se touchent jamais, quels que soient les seuils', () => {
        for (const seuils of [undefined, SEUILS(0.7, 0.8, 0.92), SEUILS(0.85, 0.86, 0.95), SEUILS(0.97, 0.98, 0.99), SEUILS(0.5, 0.99, 1)]) {
            const { win } = banc({ seuils });
            for (const mode of ['proportionnel', 'deuxSegments']) {
                const places = [...win.genererExempleAxeBarre(mode).matchAll(/class="barre-graduation[^>]*left: ([\d.]+)%/g)].map((m) => parseFloat(m[1]));
                expect(places[0]).toBe(0);
                expect(places[places.length - 1]).toBe(100);
                for (let k = 1; k < places.length; k++) expect(places[k] - places[k - 1], `${mode}`).toBeGreaterThanOrEqual(10);
            }
        }
    });

    it('proportionnel : rien sous les barres, et le voile reste', () => {
        const { i, win } = banc();
        const html = rendre(i, 'A');
        expect(html).not.toContain('barre-graduation');
        expect(html).toContain('<div class="barre-indicateur-overlay"></div>');
        const position = (v) => (v - 0.3) / (1 - 0.3) * 100;
        expect(lefts(html).sort((a, b) => a - b)).toEqual(placesAttendues(i, win, position, null));
    });

    it('le voile n’a pas changé dans la feuille de style', () => {
        const css = readFileSync(path.join(RACINE, 'styles.css'), 'utf8');
        expect(css).toMatch(/\.barre-indicateur-overlay \{[^}]*background: rgba\(15, 30, 58, 0\.2\);/);
        expect(css).toMatch(/\.mode-clair \.barre-indicateur-overlay \{\s*background: rgba\(3, 46, 92, 0\.12\);/);
    });
});

describe('(e) le réglage', () => {
    it('le défaut est proportionnel, et `sauvegarderPreferencesV2` ne touche pas au choix', () => {
        const prefs = readFileSync(path.join(RACINE, 'js/preferences.js'), 'utf8');
        expect(prefs).toContain("axeBarresApercu: 'proportionnel'");
        const panneau = readFileSync(path.join(RACINE, 'js/preferences-v2.js'), 'utf8');
        const corps = tranche(panneau, 'async function sauvegarderPreferencesV2', 'function sauvegarderSeuilsV2');
        expect(corps).not.toContain('axeBarresApercu');
    });

    it('les deux choix, et seulement deux, sont offerts, chacun avec son exemple', () => {
        const html = readFileSync(path.join(RACINE, 'index.html'), 'utf8');
        const valeurs = [...html.matchAll(/name="v2-axe-barres"[^>]*value="([^"]+)"/g)].map((m) => m[1]);
        expect(valeurs).toEqual(['proportionnel', 'deuxSegments']);
        expect([...html.matchAll(/data-exemple-axe="([^"]+)"/g)].map((m) => m[1])).toEqual(valeurs);
    });

    it('l’exemple de chaque choix passe par les mêmes fonctions que l’Aperçu, sur les seuils enregistrés', () => {
        const { win } = banc({ seuils: SEUILS(0.7, 0.8, 0.92) });
        const deux = win.genererExempleAxeBarre('deuxSegments');
        expect(deux).toMatch(/barre-graduation-cassure"[^>]*style="left: 25%;">70/);
        expect(deux).toContain('barre-indicateur-overlay');
        const prop = win.genererExempleAxeBarre('proportionnel');
        expect(prop).not.toContain('barre-graduation-cassure');
        expect(prop.match(/barre-exemple-point/g)).toHaveLength(20);
    });

    it('aucun seuil écrit en dur dans le code de l’axe', () => {
        const tdb = readFileSync(path.join(RACINE, 'js/tableau-bord-apercu.js'), 'utf8');
        const axe = tranche(tdb, 'function cassureDeLaBarre', 'function valeurSurEchelleDistribution');
        expect(axe).not.toMatch(/\b0?\.85\b|\b85\b/);
    });
});

// JOURNAL DES BREAK-TESTS — 30 oct. 2026, dans un banc jetable (copie de js/, index.html, styles.css et tests/ hors integration), une mutation à la fois :
//   M1  l'arrêt du seuil retiré ............................ 3 rouges (a, b)
//   M2  la couleur du seuil : celle de la zone du bas ...... 3 rouges (a, b)
//   M3  la plus large des deux zones ....................... 2 rouges (b)
//   M4  le minimum de 1,5 point retiré ..................... 1 rouge  (b)
//   M5  deux passages voisins peuvent se croiser ........... 2 rouges (a, b)
//   M6  la zone sous l'axe compte en entier ................ 1 rouge  (a)
//   M7  P casse aussi ...................................... 2 rouges (c, d)
//   M8  une valeur inconnue casse l'axe .................... 1 rouge  (c)
//   M9  le seuil en dur à 85 ............................... 4 rouges (c, e)
//   M10 un seuil hors de l'axe casse quand même ............ 1 rouge  (c)
//   M11 le premier segment à 30 % de la barre .............. 5 rouges (c, d, e)
//   M12 la courbe garde l'inverse proportionnel ............ 1 rouge  (d)
//   M13 les traits ignorent la cassure ..................... 1 rouge  (d)
//   M14 la moyenne ignore la cassure ....................... 1 rouge  (d)
//   M15 les points ignorent la cassure ..................... 1 rouge  (d)
//   M16 la zone d'un point ignore la cassure ............... 1 rouge  (c)
//   M17 le fond ignore la cassure .......................... 1 rouge  (d), garde ajoutée : la première passe rendait 0 rouge
//   M18 des graduations aussi en proportionnel ............. 2 rouges (d)
//   M19 la cassure n'est plus marquée ...................... 2 rouges (d, e)
//   M20 les graduations se touchent ........................ 1 rouge  (d)
//   M21 le voile retiré de la barre ........................ 1 rouge  (d)
//   M22 le voile retiré de la feuille de style ............. 1 rouge  (d)
//   M23 l'exemple ignore le choix .......................... 1 rouge  (e)
//   M24 le défaut devient deux segments .................... 1 rouge  (e)
//   M25 le panneau écrit aussi le choix .................... 1 rouge  (e)
//   M26 un troisième choix ................................. 1 rouge  (e)
// Dans la spec WebKit (tests/integration/barres-apercu-axe.spec.js), mêmes conditions :
//   M27 le choix relié à la sauvegarde du panneau .......... 1 rouge  (deux segments)
//   M28 le chargement écrit le défaut ...................... 1 rouge  (sans choix)
//   M29 les exemples ne suivent pas les seuils ............. 1 rouge  (deux segments)
// 22/22 verts sans mutation ; 2/2 dans la spec.
// Le passage symétrique à la cassure (décision du 30 oct., 22 h 29), mêmes conditions :
//   M11 le passage reste en points à la cassure ............ 2 rouges (b bis)
//   M12 la plus large des deux zones ....................... 3 rouges (b bis)
//   M13 le demi-passage droit deux fois plus large ......... 3 rouges (b bis)
//   M14 tous les seuils se mesurent à l'écran .............. 1 rouge  (b bis), garde ajoutée : le cas de la zone étroite
//   M15 le seuil perd sa couleur exacte .................... 2 rouges (a, b bis)
