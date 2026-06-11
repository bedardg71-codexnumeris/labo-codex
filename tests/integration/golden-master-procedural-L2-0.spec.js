import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #328 L2-0 — GOLDEN MASTER du chemin PROCÉDURAL de la note (11 juin 2026).
//
// Fige les chiffres produits par le code ACTUEL (1.15.1) sur une fixture
// synthétique contrôlée, AVANT le dégonflage du miroir modalitesEvaluation
// (L2-a → L2-c, plan PLAN-328-L2-degonfler-miroir.md). La fixture pose à la
// fois la SSOT (groupesCours[].pratiqueId + pratiquesConfigurables) ET le
// miroir (modalitesEvaluation.pratique/pratiqueId) de façon COHÉRENTE, comme
// l'app les maintient aujourd'hui : quand L2 fera dériver les lecteurs de la
// SSOT, ces chiffres ne doivent PAS bouger.
//
// Couvre les trois familles simulables + la résolution « pratique active » :
//   - STD : calculerDetailsNoteFinale (portfolio meilleurs-N + terminale,
//     exclusion remplaceeParId) — explicite ET via la pratique active
//   - SOM : moyenne pondérée par production.ponderation (via simulerIndices)
//   - SPE : paliers tout-ou-rien par seuil d'acceptabilité (via simulerIndices)
// Complète le golden master Vitest (Sommative seule, #303 Session C Lot 0).

const DA = '9990001';

// Valeurs FIGÉES sur 1.15.1 (build 0611-0818). Ne JAMAIS les ajuster pour
// faire passer un refactoring sans diagnostic : un écart = le calcul a bougé.
const GOLDEN = {
    std: {
        C: 100,
        P: 82,
        noteFinale: 81.5,
        portfolioMoyenne: 82.5,        // meilleurs 2 de {60, 75, 90} = (90+75)/2
        artefactsRetenus: ['GM_A3', 'GM_A2'],
        noteTerminale: 80,
        ponderations: { portfolio: 60, terminale: 40 }
    },
    stdActive: { noteFinale: 81.5 },   // sans pratiqueId → pratique active (parité)
    som: { C: 100, P: 78, noteFinale: null },  // (60+75+90)×10 + 80×40 / 70 = 77,86
    spe: { C: 100, P: 80, noteFinale: null },  // seuil 70 : 2 artefacts + terminale → palier 80
    // Caractéristique du code actuel (garde de PratiqueConfigurable.calculerPerformance) :
    // sans entrée indicesCP[da].actuel, une pratique CONFIGURABLE rend P=0 — la
    // délégation aux paliers SPE n'est même pas tentée. Figé sciemment : si un
    // refactoring change cette garde, ce test doit le rendre VISIBLE, pas le masquer.
    speSansIndicesCP: { C: 100, P: 0, noteFinale: null }
};

// Erreurs attendues en contexte file:// (mêmes patterns que les autres specs)
const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource/i
];
const estErreurAttendue = (msg) => patternsAttendus.some((re) => re.test(msg));

test('L2-0 · golden master procédural — STD/SOM/SPE + pratique active', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => {
        const m = `pageerror: ${e.message}`;
        if (!estErreurAttendue(m)) erreurs.push(m);
    });

    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const resultat = await page.evaluate(async (DA) => {
        const COURS = 'GM_COURS';

        // ── SSOT : pratique active du groupe-cours + bibliothèque de pratiques ──
        window.db.setSync('demo-actif', null);
        window.db.setSync('infoCours', {
            id: COURS, codeCours: '601-GM', nomCours: 'Golden', groupe: '01',
            _modeCours: false, _source: 'groupe-cours', _groupeCoursId: 'GM_GC'
        });
        window.db.setSync('groupeCoursActif', {
            modeCours: false, id: 'GM_GC', coursId: COURS,
            pratiqueId: 'gm-std', groupe: '01'
        });
        window.db.setSync(window.cle('groupesCours'),
            [{ id: 'GM_GC', coursId: COURS, pratiqueId: 'gm-std', actif: true }]);
        window.db.setSync(window.cle('pratiquesConfigurables'), [
            {
                id: 'gm-std', nom: 'GM Standards',
                calcul_note: { methode: 'conversion_niveaux' },
                echelle: {
                    type: 'niveaux',
                    niveaux: [
                        { code: 'I', label: 'Incomplet', valeur_pourcentage: 50, ordre: 1 },
                        { code: 'D', label: 'Développement', valeur_pourcentage: 65, ordre: 2 },
                        { code: 'M', label: 'Maîtrisé', valeur_pourcentage: 80, ordre: 3 },
                        { code: 'E', label: 'Étendu', valeur_pourcentage: 95, ordre: 4 }
                    ]
                },
                configuration: {
                    type: 'standards',
                    portfolio: {
                        nombreARetenir: 2, minimumCompletion: 3,
                        methodeSelection: 'meilleurs',
                        reglesConformite: { actif: false }
                    },
                    notesFinales: true
                }
            },
            {
                id: 'gm-spe', nom: 'GM Spécifications',
                calcul_note: { methode: 'specifications' },
                configuration: {
                    type: 'specifications',
                    typesTravaux: [
                        { id: 'artefact-portfolio', nom: 'Artefacts', seuilAcceptable: 70 },
                        { id: 'terminale', nom: 'Finale', seuilAcceptable: 70 }
                    ],
                    tableBundles: [
                        { noteFixe: 100, requis: { 'artefact-portfolio': 3, terminale: 1 } },
                        { noteFixe: 80, requis: { 'artefact-portfolio': 2, terminale: 1 } },
                        { noteFixe: 60, requis: { 'artefact-portfolio': 1, terminale: 1 } },
                        { noteFixe: 50, requis: null }
                    ]
                }
            }
        ]);

        // ── Miroir tel que l'app le maintient AUJOURD'HUI (retiré par L2) ──
        window.db.setSync(window.cle('modalitesEvaluation'), {
            pratique: 'standards', pratiqueId: 'gm-std',
            approcheEvaluation: 'par-artefacts'
        });

        // ── Données : 3 artefacts + 1 terminale, 1 reprise remplacée ──
        window.db.setSync(window.cle('groupeEtudiants'),
            [{ da: DA, nom: 'Golden', prenom: 'Test', groupe: '01', coursId: COURS }]);
        window.db.setSync(window.cle('productions'), [
            { id: 'GM_PORT', type: 'portfolio', titre: 'Portfolio', ponderation: 60, coursId: COURS },
            { id: 'GM_A1', type: 'artefact-portfolio', titre: 'A1', ponderation: 10, coursId: COURS },
            { id: 'GM_A2', type: 'artefact-portfolio', titre: 'A2', ponderation: 10, coursId: COURS },
            { id: 'GM_A3', type: 'artefact-portfolio', titre: 'A3', ponderation: 10, coursId: COURS },
            { id: 'GM_TERM', type: 'terminale', titre: 'Terminale', ponderation: 40, coursId: COURS }
        ]);
        const evalBase = { etudiantDA: DA, statutRemise: 'evalue', coursId: COURS, remplaceeParId: null };
        window.db.setSync(window.cle('evaluationsSauvegardees'), [
            { ...evalBase, id: 'GM_E1', productionId: 'GM_A1', noteFinale: 60 },
            { ...evalBase, id: 'GM_E2', productionId: 'GM_A2', noteFinale: 75 },
            { ...evalBase, id: 'GM_E3', productionId: 'GM_A3', noteFinale: 90 },
            // Reprise : l'ancienne tentative de A3 est remplacée → EXCLUE partout
            { ...evalBase, id: 'GM_E3_OLD', productionId: 'GM_A3', noteFinale: 40, remplaceeParId: 'GM_E3' },
            { ...evalBase, id: 'GM_ET', productionId: 'GM_TERM', noteFinale: 80 }
        ]);

        if (typeof window.simulerIndices !== 'function') return { erreur: 'simulerIndices absent' };
        if (typeof window.calculerDetailsNoteFinale !== 'function') return { erreur: 'calculerDetailsNoteFinale absent' };

        const std = window.simulerIndices(DA, 'gm-std');
        const som = window.simulerIndices(DA, 'sommative');
        // SPE configurable AVANT toute entrée indicesCP : la garde de
        // PratiqueConfigurable court-circuite la délégation → P=0 (figé).
        const speSansIndicesCP = window.simulerIndices(DA, 'gm-spe');
        // Avec l'entrée indicesCP présente (état normal d'une app vivante),
        // la délégation aux paliers tout-ou-rien s'exécute réellement.
        window.db.setSync(window.cle('indicesCP'), { [DA]: { actuel: {} } });
        const spe = window.simulerIndices(DA, 'gm-spe');
        const detailsActive = window.calculerDetailsNoteFinale(DA);   // sans arg → pratique active

        return {
            std: std && {
                C: std.C, P: std.P, noteFinale: std.noteFinale,
                portfolioMoyenne: std.details?.portfolio?.moyenne ?? null,
                artefactsRetenus: (std.details?.portfolio?.artefactsRetenus || []).map(a => a.productionId || a.id),
                noteTerminale: std.details?.terminal?.note ?? null,
                ponderations: {
                    portfolio: std.details?.portfolio?.ponderation ?? null,
                    terminale: std.details?.terminal?.ponderation ?? null
                }
            },
            stdActive: { noteFinale: detailsActive ? detailsActive.noteFinale : null },
            som: som && { C: som.C, P: som.P, noteFinale: som.noteFinale },
            spe: spe && { C: spe.C, P: spe.P, noteFinale: spe.noteFinale },
            speSansIndicesCP: speSansIndicesCP && {
                C: speSansIndicesCP.C, P: speSansIndicesCP.P, noteFinale: speSansIndicesCP.noteFinale
            },
            detailsBruts: { std: std?.details ? Object.keys(std.details) : null }
        };
    }, DA);

    expect(resultat.erreur, `Erreur eval : ${resultat.erreur}`).toBeUndefined();
    expect(resultat.std, `détails STD bruts : ${JSON.stringify(resultat.detailsBruts)}`).toEqual(GOLDEN.std);
    expect(resultat.stdActive).toEqual(GOLDEN.stdActive);
    expect(resultat.som).toEqual(GOLDEN.som);
    expect(resultat.spe).toEqual(GOLDEN.spe);
    expect(resultat.speSansIndicesCP).toEqual(GOLDEN.speSansIndicesCP);

    expect(erreurs, `Erreurs page : ${erreurs.join(' | ')}`).toEqual([]);
});
