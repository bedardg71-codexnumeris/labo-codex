/**
 * SENTINELLE #575 — septième site (13 septembre 2026) : le graphique des indices A-C-P du
 * profil ne porte AUCUNE zone de niveaux.
 *
 * Décision de Grégoire : une échelle de performance juge UNE production ; les indices sont des
 * mesures agrégées en pourcentage sur un trimestre. Superposer les paliers de l'une aux courbes
 * des autres donnait un repère qui avait l'air de dire quelque chose et ne disait rien.
 *
 * Ce banc prouve que le graphique ne lit plus AUCUNE échelle : un trimestre sans échelle (où
 * l'ancien code retombait sur `ZONES_IDME`) et un trimestre dont l'échelle n'a aucune lettre
 * IDME rendent EXACTEMENT le même graphique, et aucun des deux ne dessine un nom de niveau ni une
 * ligne de seuil. Un montage sur l'échelle de Grégoire ne prouverait rien : c'est celle où la
 * table en dur tombait juste par coïncidence.
 *
 * Le dessin est REJOUÉ (chaque crochet de chaque plugin, sur un contexte qui enregistre ses
 * appels) — et un témoin montre que ce même enregistreur VOIT les noms de niveaux quand on lui
 * redonne le plugin des zones : l'absence mesurée n'est pas une cécité du banc (règle 10).
 *
 * Hors de ce banc, et hors de la décision : le graphique par critère (#752), dont les points sont
 * des niveaux d'évaluations. Les deux graphiques de groupe ont suivi le 16 sept. (#860, lot F) :
 * plus aucun repli sur l'échelle du trimestre ni sur `ZONES_IDME` — le témoin ci-dessous pose donc
 * lui-même les zones de l'échelle sur le canvas, comme le font les graphiques qui en dessinent (#752).
 *
 *   cd tests && npx vitest run unit/sentinelle-575-graphique-indices-sans-zones.test.js
 */
import { describe, it, expect } from 'vitest';
import { monter, storeBase, elementDom } from './_helpers/bac-suivi.js';

const DA = '2000001';
const CANVAS = 'graphique-progression-' + DA;
const ECHELLE_SANS_IDME = { id: 'EWXYZ', nom: 'Quatre saisons', parDefaut: true, niveaux: [
    { code: 'W', nom: 'Hiver', min: 0, max: 49, couleur: '#335577' },
    { code: 'X', nom: 'Printemps', min: 50, max: 69, couleur: '#44aa66' },
    { code: 'Y', nom: 'Été', min: 70, max: 84, couleur: '#ddaa22' },
    { code: 'Z', nom: 'Automne', min: 85, max: 100, couleur: '#cc5522' }
] };
const SNAPSHOTS = [
    { numSemaine: 1, dateSeance: '2026-02-02', dateDebut: '2026-02-02', dateFin: '2026-02-06', A: 90, C: 80, P: 72 },
    { numSemaine: 2, dateSeance: '2026-02-09', dateDebut: '2026-02-09', dateFin: '2026-02-13', A: 85, C: 75, P: 68 },
    { numSemaine: 3, dateSeance: '2026-02-16', dateDebut: '2026-02-16', dateFin: '2026-02-20', A: 88, C: 70, P: 81 }
];
const CROCHETS = ['beforeDraw', 'beforeDatasetsDraw', 'afterDatasetsDraw', 'afterDraw'];

// Un contexte 2D qui enregistre chaque appel et chaque affectation.
function contexteEnregistreur(traces) {
    return new Proxy({ measureText: () => ({ width: 40 }) }, {
        get(cible, cle) { return cle in cible ? cible[cle] : (...a) => { traces.push([String(cle), ...a]); }; },
        set(cible, cle, v) { traces.push(['=' + String(cle), v]); return true; }
    });
}

function rendre(echelles) {
    const store = storeBase();
    store.test_echellesTemplates = echelles;
    const configs = [];
    const traces = [];
    const ctx = contexteEnregistreur(traces);
    const b = monter(store, {
        prefs: { afficherSeuilsVisuels: true },   // la préférence qui, avant, allumait les zones
        elements: { [CANVAS]: elementDom({ id: CANVAS, parentNode: {}, ownerDocument: {}, getContext: () => ctx }) },
        globaux: {
            obtenirSnapshotsEtudiant: () => JSON.parse(JSON.stringify(SNAPSHOTS)),
            Chart: function (c, config) { configs.push(config); this.destroy = () => {}; }
        },
        modules: [{ chemin: 'js/graphiques-progression.js', internes: ['pluginEtiquettesZones', 'genererZonesDepuisEchelle', '_zonesParCanvas'] }]
    });
    b.win.creerGraphiqueIndividuel(CANVAS, DA);
    const config = configs[0];
    const faux = { ctx, canvas: b.elements[CANVAS], chartArea: { left: 40, right: 500, top: 10, bottom: 310 },
        scales: { x: { getPixelForValue: (i) => 40 + i * 100 }, y: { min: 0, max: 1.1, bottom: 310, getPixelForValue: (v) => 310 - v * 270 } },
        data: config ? config.data : { datasets: [] }, getDatasetMeta: () => ({ hidden: false }) };
    for (const p of (config && config.plugins) || []) for (const h of CROCHETS) if (typeof p[h] === 'function') p[h](faux);
    return { configs, traces, faux, interne: b.interne['graphiques-progression.js'] };
}
const textesDessines = (traces) => traces.filter((t) => t[0] === 'fillText').map((t) => t[1]);

describe('#575 · septième site — le graphique des indices ne porte aucune zone de niveaux', () => {
    const sansEchelle = rendre([]);
    const horsIdme = rendre([ECHELLE_SANS_IDME]);

    it('le graphique est bien construit dans les deux montages — le banc n\'est pas vide', () => {
        for (const r of [sansEchelle, horsIdme]) {
            expect(r.configs).toHaveLength(1);
            expect(r.configs[0].data.datasets.map((d) => d.label)).toEqual(['Assiduité (A)', 'Complétion (C)', 'Performance (P)']);
            expect(r.configs[0].data.datasets[0].data.length).toBe(3);
        }
    });

    it('aucun plugin de zones, préférence « seuils visuels » pourtant allumée', () => {
        for (const r of [sansEchelle, horsIdme]) {
            expect(r.configs[0].plugins.map((p) => p.id)).toEqual(['interventionMarkersIndiv']);
        }
    });

    it('rien n\'est dessiné : ni nom de niveau, ni ligne de seuil — ni `ZONES_IDME`, ni l\'échelle du trimestre', () => {
        for (const r of [sansEchelle, horsIdme]) {
            expect(textesDessines(r.traces)).toEqual([]);
            expect(r.traces.filter((t) => t[0] === 'setLineDash' || t[0] === 'stroke')).toEqual([]);
        }
    });

    it('plus de marge droite réservée à des étiquettes qui n\'existent plus', () => {
        for (const r of [sansEchelle, horsIdme]) expect(r.configs[0].options.layout).toBeUndefined();
    });

    it('les deux montages rendent EXACTEMENT le même graphique : il ne lit plus d\'échelle', () => {
        const forme = (c) => JSON.stringify({ plugins: c.plugins.map((p) => p.id), data: c.data, options: c.options });
        expect(forme(horsIdme.configs[0])).toBe(forme(sansEchelle.configs[0]));
    });

    it('TÉMOIN — le même enregistreur VOIT les zones quand on redonne le plugin : l\'absence n\'est pas une cécité', () => {
        // Ce que le graphique dessinait avant le 13 septembre : les CODES des niveaux dans la marge
        // droite (mesuré : « W X Y Z » sur l'échelle hors IDME). Depuis #860 (16 sept.), le plugin ne
        // lit plus aucun repli : le témoin pose les zones de cette échelle sur le canvas, pour chacun
        // des deux montages, et l'enregistreur les voit.
        for (const r of [horsIdme, sansEchelle]) {
            r.traces.length = 0;
            r.interne._zonesParCanvas.set(r.faux.canvas, r.interne.genererZonesDepuisEchelle(ECHELLE_SANS_IDME));
            r.interne.pluginEtiquettesZones.beforeDatasetsDraw(r.faux);
            expect(textesDessines(r.traces)).toEqual(['W', 'X', 'Y', 'Z']);
            expect(r.traces.some((t) => t[0] === 'setLineDash')).toBe(true);
        }
    });
});
