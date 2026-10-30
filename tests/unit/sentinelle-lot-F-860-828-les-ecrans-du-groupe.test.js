/**
 * SENTINELLE LOT F — « Les écrans du groupe » (#860, #828), cadrage « Les règles du dépistage »
 * du 16 septembre 2026, tranché par Grégoire à 17 h 18.
 *
 * #828, ↻ 30 oct. 2026 — le filtre du Suivi du groupe › Détails retient l'élève dont l'assiduité OU la
 * complétion est au palier le plus bas (`borneBasseAssiduiteCompletion`, contexte-qualification.js),
 * lu à l'appel aux champs de Labo › Outils d'observation : le libellé du bouton et la règle suivent le
 * réglage. Un A ou un C absent (null) n'est pas sous la borne (G-4, #749 : on filtre sur ce qui est
 * MONTRÉ). Avant le 16 sept. : la moyenne M = (A + C) / 2 < 65, un nombre qu'aucun écran n'affichait.
 *
 * #860 — plus aucune zone de niveaux (lignes de seuil, lettres de la marge) sur les courbes du
 * groupe (indice P compris) ni sur les trajectoires en mode Note finale : un pourcentage agrégé
 * ne se situe pas dans une échelle de performance (décision du 13 sept., septième site de #575).
 * Le mode Habiletés des trajectoires les GARDE : ses points sont des niveaux d'évaluations (#752).
 * Le repli sur « la première échelle du trimestre » et la table `ZONES_IDME` sont partis avec.
 *
 * Le dessin est REJOUÉ (chaque crochet de chaque plugin, sur un contexte qui enregistre) — et le
 * mode Habiletés sert de témoin : le même enregistreur VOIT les lettres quand le plugin est monté.
 *
 *   cd tests && npx vitest run unit/sentinelle-lot-F-860-828-les-ecrans-du-groupe.test.js
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { monter, storeBase, elementDom, RACINE } from './_helpers/bac-suivi.js';

const lire = (f) => readFileSync(path.join(RACINE, f), 'utf8');
const sansCommentaires = (code) => code.replace(/\/\*[\s\S]*?\*\//g, '').split('\n').filter((l) => !/^\s*\/\//.test(l)).join('\n');

/* =============================================================================================
   A · #828 — le filtre « A ou C < … », ici réglé à 70 pour lire ses cas
   ============================================================================================= */
const INTERNES_TB = ['appliquerFiltres', '_filtresActifs', '_tousEtudiantsEnrichis', '_etudiantsPrioritaires', 'genererPanneauSuiviEtudiants'];
const GLOBAUX_TB = {
    calculerTousLesIndices: () => ({ A: 90, C: 100, P: 80, noteConstructible: true }),
    determinerNiveauRaiPedagogique: () => ({ niveau: 1, pattern: 'Stable' }), diagnostiquerSuiviApprentissage: () => null,
    obtenirTypePratiqueActive: () => 'standards', obtenirTermeProduction: () => 'artefact', accordTermeProduction: (n) => n + ' artefact(s)',
    obtenirLabelNoteFinale: () => 'Note', obtenirCodePratique: () => 'STD'
};
const reglage = (acceptable) => ({ interpretation: { excellent: 0.95, bon: 0.90, acceptable } });
// Un élève par cas de la consigne ; P et le reste identiques pour tous, seuls A et C varient.
const eleve = (da, nom, A, C) => ({ da, nom, prenom: 'X', pattern: 'Stable', niveau: 1, A, C, P: 80, noteConstructible: true, scoreMulti: null, suivi: null });
const ELEVES = [
    eleve('3000001', 'A65C90', 65, 90),     // retenu — l'ancienne règle (M = 78 ≥ 65) l'écartait
    eleve('3000002', 'A90C65', 90, 65),     // retenu — idem (M = 78)
    eleve('3000003', 'A72C72', 72, 72),     // écarté — les deux au-dessus de la borne
    eleve('3000004', 'A60C80', 60, 80),     // retenu — l'ancienne règle (M = 70) l'écartait
    eleve('3000005', 'AnulC90', null, 90),  // écarté — A absent n'est pas « sous 70 » (null < 70 est vrai en JS)
    eleve('3000006', 'A90Cnul', 90, null),  // écarté — C absent
    eleve('3000007', 'A100C100', 100, 100), // écarté
    eleve('3000008', 'A55C90', 55, 90),     // retenu
    // Trou de preuve fermé le 17 sept. 2026 (lot 31) : les quatre retenus ci-dessus sortaient AUSSI dans l'ordre
    // alphabétique — un tri par nom passait. Ces deux noms CONTREDISENT l'urgence : « Zed » est le plus urgent
    // (pire indice 40) et sort premier ; « Abel » est le moins urgent (pire indice 69) et sort dernier. Le pire de
    // Zed est sa COMPLÉTION, celui d'Abel son ASSIDUITÉ : « le meilleur au lieu du pire » les écarte tous les deux.
    eleve('3000009', 'Zed', 95, 40),
    eleve('3000010', 'Abel', 69, 95)
];
function monterSuivi() {
    const b = monter(Object.assign(storeBase(), { seuilsInterpretation: reglage(0.70) }), { modules: ['js/contexte-qualification.js', { chemin: 'js/tableau-bord-apercu.js', internes: INTERNES_TB }], globaux: GLOBAUX_TB });
    const i = b.interne['tableau-bord-apercu.js'];
    i._tousEtudiantsEnrichis = ELEVES.map((e) => Object.assign({}, e));
    return { b, i };
}
function filtrer(i, filtres) { i._filtresActifs = filtres; i.appliquerFiltres(); return i._etudiantsPrioritaires.map((e) => e.nom); }
function boutons(b, i) {
    b.document.getElementById('btn-toggle-panneau-prioritaire').classList.add('actif');   // mode Détails
    i.genererPanneauSuiviEtudiants();
    return b.document.getElementById('suivi-tri-boutons').innerHTML;
}

describe('A · #828 — le filtre retient l\'élève dont l\'assiduité OU la complétion est au palier le plus bas', () => {
    it('A1 · la borne vient du réglage, non recopiée', () => {
        const { b } = monterSuivi();
        expect(b.win.borneBasseAssiduiteCompletion()).toBe(70);
        b.store.seuilsInterpretation = reglage(0.85);
        expect(b.win.borneBasseAssiduiteCompletion()).toBe(85);
    });

    it('A2 · A 65 / C 90 retenu, A 90 / C 65 retenu, A 60 / C 80 retenu ; A 72 / C 72 écarté ; A ou C absent écarté — tri par le pire indice', () => {
        const { i } = monterSuivi();
        expect(filtrer(i, ['M'])).toEqual(['Zed', 'A55C90', 'A60C80', 'A65C90', 'A90C65', 'Abel']);
        expect(filtrer(i, [])).toHaveLength(ELEVES.length);   // sans filtre : tout le monde, le banc n'est pas vide
    });

    it('A3 · le libellé du bouton est lu à la borne : « A ou C < 70% », et il SUIT la borne quand elle change — la règle aussi', () => {
        const { b, i } = monterSuivi();
        expect(boutons(b, i)).toContain('data-tri="M">A ou C < 70\u00A0%<');
        expect(boutons(b, i)).not.toContain('A+C');
        b.store.seuilsInterpretation = reglage(0.60);   // déplace le réglage
        expect(boutons(b, i)).toContain('data-tri="M">A ou C < 60\u00A0%<');
        expect(filtrer(i, ['M'])).toEqual(['Zed', 'A55C90']);   // 60 n'est pas < 60 ; 65 non plus
    });

    it('A4 · le filtre P (G-4, #749) ne dépend pas du réglage de A et C, et le code ne recopie aucune borne', () => {
        const { i } = monterSuivi();
        // Sans échelle, la borne est la note de passage : 59 passe, 60 non (retouche du lot 1 : avec tous les P à 80, ce test ne pouvait pas échouer).
        expect(filtrer(i, ['P'])).toEqual([]);
        i._tousEtudiantsEnrichis[0].P = 59;
        i._tousEtudiantsEnrichis[1].P = 60;
        expect(filtrer(i, ['P'])).toEqual([ELEVES[0].nom]);
        const code = sansCommentaires(lire('js/tableau-bord-apercu.js'));
        expect(code).not.toMatch(/e\.M\b|\b65 - e\.|A\+C < 65|< 70%'|e\.P >= \d/);
        expect(code).toMatch(/window\.borneBasseAssiduiteCompletion\(\)/);
        expect(code).toMatch(/window\.borneBassePerformance\(/);
    });
});

/* =============================================================================================
   B · #860 — plus de zones de niveaux sur les courbes du groupe ni sur la note finale
   ============================================================================================= */
const CROCHETS = ['beforeDraw', 'beforeDatasetsDraw', 'afterDatasetsDraw', 'afterDraw'];
const E_ABC = { id: 'EABC', nom: 'Trois paliers', parDefaut: true, seuilMaitrise: 'B', niveaux: [
    { code: 'A', nom: 'À reprendre', min: 0, max: 59, valeurCalcul: 50, couleur: '#aa0000' },
    { code: 'B', nom: 'Atteint', min: 60, max: 84, valeurCalcul: 70, couleur: '#00aa00' },
    { code: 'C', nom: 'Dépassé', min: 85, max: 100, valeurCalcul: 90, couleur: '#0000aa' }
] };
function contexteEnregistreur(traces) {
    return new Proxy({ measureText: () => ({ width: 40 }) }, {
        get(cible, cle) { return cle in cible ? cible[cle] : (...a) => { traces.push([String(cle), ...a]); }; },
        set(cible, cle, v) { traces.push(['=' + String(cle), v]); return true; }
    });
}
function fauxChart(config, ctx, canvas) {
    return { ctx, canvas, chartArea: { left: 40, right: 500, top: 10, bottom: 310 },
        scales: { x: { getPixelForValue: (i) => 40 + i * 100 }, y: { min: 0, max: 1.1, bottom: 310, getPixelForValue: (v) => 310 - v * 270 } },
        data: config.data, getDatasetMeta: () => ({ hidden: false }) };
}
function rejouer(config, faux) { for (const p of config.plugins || []) for (const h of CROCHETS) if (typeof p[h] === 'function') p[h](faux); }
const textesDessines = (traces) => traces.filter((t) => t[0] === 'fillText').map((t) => t[1]);
const lignesDeSeuil = (traces) => traces.filter((t) => t[0] === 'setLineDash' || t[0] === 'stroke');
function fabriqueChart(configs) { const Chart = function (c, config) { configs.push(config); this.destroy = () => {}; }; Chart.getChart = () => null; return Chart; }
const MODULES_G = ['js/profil-etudiant-calculs.js', 'js/profil-etudiant-rapport.js', 'js/profil-etudiant-confidentiel.js',
    { chemin: 'js/graphiques-progression.js', internes: ['pluginEtiquettesZones', 'genererZonesDepuisEchelle', '_zonesParCanvas'] }];

function storeGroupe() {
    const store = storeBase();
    store.test_echellesTemplates = [E_ABC];   // une échelle bien présente au trimestre : avant, c'est ELLE qu'on dessinait
    store.test_productions = [{ id: 'P1', titre: 'Un', dateEcheance: '2026-02-03' }, { id: 'P2', titre: 'Deux', dateEcheance: '2026-02-10' }];
    return store;
}
const SNAPSHOTS = [
    { numSemaine: 1, dateDebut: '2026-02-02', dateFin: '2026-02-06', etudiants: [{ da: '2000001', A: 90, C: 80, P: 72 }, { da: '2000002', A: 60, C: 50, P: 55 }] },
    { numSemaine: 2, dateDebut: '2026-02-09', dateFin: '2026-02-13', etudiants: [{ da: '2000001', A: 85, C: 75, P: 68 }, { da: '2000002', A: 55, C: 60, P: 58 }] }
];
function rendreCourbesDuGroupe(indice) {
    const CANVAS = 'graphique-groupe-moyennes';
    const configs = [], traces = [], ctx = contexteEnregistreur(traces);
    const b = monter(storeGroupe(), {
        prefs: { afficherSeuilsVisuels: true },   // la préférence qui, avant, allumait les zones sur P
        elements: { [CANVAS]: elementDom({ id: CANVAS, parentNode: {}, ownerDocument: {}, getContext: () => ctx }) },
        globaux: { Chart: fabriqueChart(configs), obtenirSnapshotsHebdomadaires: () => JSON.parse(JSON.stringify(SNAPSHOTS)), obtenirTermeProduction: () => 'artefact', obtenirInterventionsEtudiant: () => [], toggleDisplay() {} },
        modules: MODULES_G, objetsExportes: ['profilActuelDA', 'etudiantsListeCache']
    });
    b.win.creerGraphiqueGroupeSpaghettiACP(CANVAS, indice);
    const config = configs[0];
    const faux = fauxChart(config, ctx, b.elements[CANVAS]);
    rejouer(config, faux);
    return { config, traces, faux, interne: b.interne['graphiques-progression.js'] };
}
const evaluation = (id, da, pid, niveau, note, date) => ({ id, etudiantDA: da, productionId: pid, coursId: 'GC1', echelleId: 'EABC', dateEvaluation: date, noteFinale: note,
    criteres: [{ critereId: 'c1', critereNom: 'Structure', ponderation: 100, niveauSelectionne: niveau }] });
function rendreTrajectoires(options) {
    const CANVAS = 'graphique-trajectoires-production';
    const store = storeGroupe();
    store.test_evaluationsSauvegardees = [
        evaluation('E1', '2000001', 'P1', 'A', 55, '2026-02-03'), evaluation('E2', '2000001', 'P2', 'B', 72, '2026-02-10'),
        evaluation('E3', '2000002', 'P1', 'C', 90, '2026-02-03'), evaluation('E4', '2000002', 'P2', 'B', 80, '2026-02-10')
    ];
    const configs = [], traces = [], ctx = contexteEnregistreur(traces);
    const b = monter(store, {
        prefs: { afficherSeuilsVisuels: true },
        elements: { [CANVAS]: elementDom({ id: CANVAS, parentNode: {}, ownerDocument: {}, getContext: () => ctx }) },
        globaux: { Chart: fabriqueChart(configs), obtenirTermeProduction: (f) => (f === 'pluriel' ? 'Productions' : 'production'), obtenirInterventionsEtudiant: () => [], toggleDisplay() {} },
        modules: MODULES_G, objetsExportes: ['profilActuelDA', 'etudiantsListeCache']
    });
    b.win.creerGraphiqueTrajectoiresProduction(CANVAS, options);
    const config = configs[0];
    const faux = fauxChart(config, ctx, b.elements[CANVAS]);
    rejouer(config, faux);
    return { config, traces, faux, interne: b.interne['graphiques-progression.js'], note: b.elements['trajectoires-note-conversion'] };
}

describe('B · #860 — (a) les courbes du groupe ne portent aucune zone de niveaux, l\'indice P compris', () => {
    for (const indice of ['P', 'A', 'C']) {   // 'C' ajouté le 17 sept. 2026 (lot 31) : la boucle oubliait la complétion
        it('indice ' + indice + ' : graphique construit (deux courbes), aucun plugin de zones, rien de dessiné — préférence « seuils visuels » pourtant allumée', () => {
            const r = rendreCourbesDuGroupe(indice);
            expect(r.config).toBeDefined();
            expect(r.config.data.datasets).toHaveLength(2);
            expect(r.config.data.datasets[0].data.filter((v) => v !== null)).toHaveLength(2);
            expect(r.config.plugins.map((p) => p.id)).toEqual(['gradientFond', 'nomEtudiantSurvolACP']);
            expect(textesDessines(r.traces)).toEqual([]);
            expect(lignesDeSeuil(r.traces)).toEqual([]);
        });
    }
});

describe('B · #860 — (b) les trajectoires : rien en mode Note finale, tout en mode Habiletés', () => {
    it('Note finale : deux trajectoires tracées, aucun plugin de zones, rien de dessiné, plus de marge droite, aucune zone posée pour le canvas', () => {
        const r = rendreTrajectoires({ mesure: 'noteFinale' });
        expect(r.config.data.datasets.filter((d) => !d._isStat)).toHaveLength(2);
        expect(r.config.plugins.map((p) => p.id)).toEqual(['gradientFond']);
        expect(textesDessines(r.traces)).toEqual([]);
        expect(lignesDeSeuil(r.traces)).toEqual([]);
        expect(r.config.options.layout.padding.right).toBe(0);
        expect(r.interne._zonesParCanvas.has(r.faux.canvas)).toBe(false);
        expect(r.note.hidden).toBe(true);
    });

    it('Habiletés (TÉMOIN, hors fiche et gardé) : le plugin est monté, les lettres A B C de l\'échelle des évaluations et les lignes de seuil sont dessinées, marge droite gardée', () => {
        const r = rendreTrajectoires({ mesure: 'habiletes' });
        expect(r.config.plugins.map((p) => p.id)).toEqual(['gradientFond', 'etiquettesZones']);
        expect(textesDessines(r.traces)).toEqual(['A', 'B', 'C']);
        expect(r.traces.some((t) => t[0] === 'setLineDash')).toBe(true);
        expect(r.config.options.layout.padding.right).toBe(120);
        expect(r.interne._zonesParCanvas.get(r.faux.canvas).map((z) => z.code)).toEqual(['A', 'B', 'C']);
    });

    it('le même enregistreur, sur le canvas de la note finale, VOIT les lettres si on lui redonne le plugin : l\'absence mesurée n\'est pas une cécité du banc', () => {
        const r = rendreTrajectoires({ mesure: 'noteFinale' });
        r.interne._zonesParCanvas.set(r.faux.canvas, r.interne.genererZonesDepuisEchelle(E_ABC));
        r.interne.pluginEtiquettesZones.beforeDatasetsDraw(r.faux);
        expect(textesDessines(r.traces)).toEqual(['A', 'B', 'C']);
    });
});

describe('B · #860 — le repli et le code mort sont partis', () => {
    it('sans échelle résolue, aucune zone : ni l\'échelle du trimestre, ni une table en dur', () => {
        const r = rendreTrajectoires({ mesure: 'noteFinale' });   // le trimestre A une échelle (E_ABC) — elle n'est plus lue en repli
        expect(r.interne.genererZonesDepuisEchelle()).toEqual([]);
        expect(r.interne.genererZonesDepuisEchelle(null)).toEqual([]);
        expect(r.interne.genererZonesDepuisEchelle({ niveaux: [] })).toEqual([]);
        expect(r.interne.genererZonesDepuisEchelle(E_ABC).map((z) => [z.code, z.yMin])).toEqual([['A', 0], ['B', 0.6], ['C', 0.85]]);
    });

    it('`ZONES_IDME`, `obtenirEchelleUtilisateur`, `creerAnnotationsZones` et `creerAnnotationsZonesIDME` n\'existent plus dans js/ (commentaires écartés)', () => {
        const fichiers = readdirSync(path.join(RACINE, 'js')).filter((f) => f.endsWith('.js'));
        for (const f of fichiers) {
            expect(sansCommentaires(lire('js/' + f)), f).not.toMatch(/ZONES_IDME|obtenirEchelleUtilisateur|creerAnnotationsZones/);
        }
    });

    it('les mots que les collègues lisent : l\'Aide des trajectoires ne cite plus « 65 % (D) », la préférence ne promet plus les courbes du groupe', () => {
        const html = lire('index.html');
        expect(html).not.toContain('65 % (D)');
        expect(html).toMatch(/Le mode <strong>Note finale<\/strong> n'en affiche pas/);
        expect(html).not.toContain('Suivi du groupe › semaine par semaine, trajectoires');
        expect(lire('js/accompagnement-contenu-hover.js')).not.toContain('et sur les graphiques du Suivi du groupe.');
    });
});
