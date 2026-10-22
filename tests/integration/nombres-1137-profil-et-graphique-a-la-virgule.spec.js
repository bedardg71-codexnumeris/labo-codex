import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');
// #1137 (22 oct. 2026) — TOUT NOMBRE AFFICHÉ, À LA FRANÇAISE : LE PROFIL ET UN GRAPHIQUE DE PROGRESSION, EN WEBKIT.
//
// Décision de Grégoire (22 oct., 6 h 59) : ce qui n'est pas une note suit la norme des notes — virgule décimale,
// espace insécable U+00A0 avant « % » et « pts ». La sentinelle Vitest garde le code ; ce banc garde ce que l'écran
// LIT : les indices du profil, la note finale composée, les pondérations, et la graduation et l'infobulle d'un
// graphique Chart.js.
//
// À la main : sélection (70 + 67) ÷ 2 = 68,5 × 65 % = 44,525 → « 44,5 pts » ; obligatoire 81,2 × 35 % = 28,42
// → « 28,4 pts » ; total 72,945 → « 72,9 % ».

const T = 't1137';
const DA = '1137001';

async function monterProfil(page) {
    await page.goto(indexHtml);
    await page.waitForFunction(() => typeof window.db !== 'undefined' && typeof window.afficherProfilComplet === 'function'
        && typeof window.formaterPourcentage === 'function');
    return page.evaluate(({ T, DA }) => {
        // security-ok: fixtures littérales du banc, aucune source externe.
        const coursId = 'cours-1137';
        const categories = { actif: true, selection: { nombreARetenir: 2, ponderation: 65 }, obligatoires: { ponderation: 35 } };
        window.db.setSync('trimestres', [{ id: T, nom: 'Trimestre virgule', annee: 2026, session: 'A', actif: true }]);
        window.db.setSync('cours', [{ id: coursId, codeCours: 'FRA101', titre: 'Écriture et littérature' }]);
        window.db.setSync(T + '_groupesCours', [{ id: 'GC_1137', trimestreId: T, coursId, groupeNum: '01', pratiqueId: 'std-1137', actif: true }]);
        window.db.setSync(T + '_groupeEtudiants', [{ da: DA, nom: 'Virgule', prenom: 'Camille', groupe: '01', coursId, groupeCoursId: 'GC_1137' }]);
        window.db.setSync(T + '_pratiquesConfigurables', [{
            id: 'std-1137', nom: 'hybride du banc', type: 'standards',
            configuration: { type: 'standards', categories, portfolio: { actif: true, methodeSelection: 'meilleurs', nombreARetenir: 2, minimumCompletion: 1, categories } }
        }]);
        const prod = (id, titre, categorie, date) => ({ id, titre, description: titre, type: 'artefact-portfolio', categorie, ponderation: 0, dateEcheance: date, groupeCoursId: 'GC_1137' });
        window.db.setSync(T + '_productions', [
            prod('S1', 'Sélection 1', 'selection', '2026-09-01'), prod('S2', 'Sélection 2', 'selection', '2026-09-08'),
            prod('O1', 'Obligatoire 1', 'obligatoire', '2026-09-15')
        ]);
        const base = { etudiantDA: DA, groupeCoursId: 'GC_1137', coursId, statutRemise: 'remis', statutIntegrite: 'recevable', criteres: [], verrouillee: true };
        const ev = (id, productionId, noteFinale, niveauFinal) => Object.assign({}, base, { id, productionId, noteFinale, niveauFinal, dateEvaluation: '2026-09-20T12:00:00.000Z' });
        window.db.setSync(T + '_evaluationsSauvegardees', [ev('E1', 'S1', 70, 'D'), ev('E2', 'S2', 67, 'D'), ev('E3', 'O1', 81.2, 'M')]);
        window.trimestreActif = T;
        window.db.setSync('trimestreActif', T);
        window.db.setSync('infoCours', { id: coursId, codeCours: 'FRA101', groupe: '01', _groupeCoursId: 'GC_1137' });
        window.db.setSync('groupeCoursActif', { id: 'GC_1137', trimestreId: T });

        window.afficherProfilComplet(DA);
        const cont = document.getElementById('contenuProfilEtudiant');
        const carte = cont && cont.querySelector('.note-finale-section');
        // La phrase de la note finale TELLE QU'ELLE EST (le nœud de texte, insécables compris).
        const marcheur = carte ? document.createTreeWalker(carte, NodeFilter.SHOW_TEXT) : null;
        let formule = null;
        while (marcheur && marcheur.nextNode()) { if (marcheur.currentNode.data.trim().startsWith('Note finale = ')) { formule = marcheur.currentNode.data.trim(); break; } }
        const texteBrut = cont ? cont.textContent : '';
        return {
            formule,
            carte: carte ? carte.innerText.replace(/\s+/g, ' ').trim() : null,
            insecables: (texteBrut.match(/\d\u00A0(%|pts\b)/g) || []).length,
            // Ce qui reste de l'ancienne forme, dans tout le texte du profil : un « % » ou « pts » collé à un
            // chiffre, une espace ordinaire avant eux, un point décimal devant « % » ou « pts ».
            colle: (texteBrut.match(/\d(%|pts\b)/g) || []),
            espaceOrdinaire: (texteBrut.match(/\d (%|pts\b)/g) || []),
            pointDecimal: (texteBrut.match(/\d\.\d+\s?(%|pts\b)/g) || [])
        };
    }, { T, DA });
}

test('#1137 · le profil lit la virgule et l’insécable : la note finale composée, les pondérations, les indices', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    await page.setViewportSize({ width: 1440, height: 900 });
    const r = await monterProfil(page);
    expect(r.formule).toBe('Note finale = 44,5\u00A0pts + 28,4\u00A0pts = 72,9\u00A0%');
    // `carte` ramène tout blanc (l'insécable compris) à une espace.
    expect(r.carte).toContain('(65 %)');
    expect(r.carte).toContain('× 35 % = 28,4 pts');
    // Le profil affiche plusieurs nombres suivis de « % » ou de « pts » : tous à l'insécable, aucun à l'ancienne.
    expect(r.insecables).toBeGreaterThanOrEqual(5);
    expect(r.colle).toEqual([]);
    expect(r.espaceOrdinaire).toEqual([]);
    expect(r.pointDecimal).toEqual([]);
    expect(erreurs).toEqual([]);
});

test('#1137 · un graphique de progression : la graduation et l’infobulle lisent « 85 % », « Assiduité (A) : 90 % »', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    await page.setViewportSize({ width: 820, height: 1180 });
    await monterProfil(page);
    const r = await page.evaluate((DA) => {
        // Deux semaines d'instantanés, posées par la fonction que le graphique lit (snapshots.js).
        window.obtenirSnapshotsEtudiant = () => [
            { numSemaine: 2, dateSeance: '2026-09-08', dateDebut: '2026-09-07', dateFin: '2026-09-13', A: 82.5, C: 100, P: 68.5 },
            { numSemaine: 3, dateSeance: '2026-09-15', dateDebut: '2026-09-14', dateFin: '2026-09-20', A: 90, C: 100, P: 72.9 }
        ];
        const boite = document.createElement('div');
        boite.style.cssText = 'width: 760px; height: 360px;';
        const canvas = document.createElement('canvas');
        canvas.id = 'canvas-1137';
        boite.appendChild(canvas);
        document.body.appendChild(boite);
        const chart = window.creerGraphiqueIndividuel('canvas-1137', DA);
        if (!chart) return { chart: false };
        const echelleY = chart.options.scales.y;
        const label = chart.options.plugins.tooltip.callbacks.label;
        return {
            chart: true,
            graduations: [0, 0.5, 0.85, 1].map((v) => echelleY.ticks.callback(v)),
            infobulle: label.call(chart.tooltip, { dataset: { label: 'Assiduité (A)' }, parsed: { y: 0.9 } })
        };
    }, DA);
    expect(r.chart).toBe(true);
    expect(r.graduations).toEqual(['0\u00A0%', '50\u00A0%', '85\u00A0%', '100\u00A0%']);
    expect(r.infobulle).toBe('Assiduité (A)\u00A0: 90\u00A0%');
    expect(erreurs).toEqual([]);
});
