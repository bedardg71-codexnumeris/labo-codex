import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #871, volet complétion (17 sept. 2026) — LA FRACTION COMPTE CE QUE COMPTE L'INDICE C, DANS LE VRAI PROFIL.
//
// Mesuré sur le pack démo en 1.142.21 : quatre élèves sur dix lisaient un pourcentage et une fraction qui se
// contredisaient (DEMO004 « 90% » et « 8 / 9 » ; DEMO006 et DEMO020 « 90% » et « 9 / 9 » ; DEMO015 « 80% » et
// « 7 / 9 »), au rapport, à la « Méthodologie de calcul » et à la ligne de la carte Complétion. L'indice compte
// l'évaluation terminale (dix productions), les fractions ne comptaient que les neuf artefacts du portfolio.
// Tranché par Grégoire le 17 sept. : la terminale est une remise que la complétion suit ; l'indice ne bouge pas.
//
// Ce banc lit les TROIS sites pour les DIX élèves : la fraction a pour quotient l'indice affiché, l'indice est
// celui d'avant le lot (valeurs de ae7ad6f7, figées), et le dénominateur est dix.
//
// ⚠ Stockage vidé UNE fois, avant le reload (pas en addInitScript : il se rejouerait au reload).

const C_AVANT = { DEMO004: 90, DEMO006: 90, DEMO007: 100, DEMO010: 100, DEMO011: 100, DEMO015: 80, DEMO016: 100, DEMO017: 100, DEMO019: 100, DEMO020: 90 };

test('profil · la fraction de complétion a pour quotient l\'indice C, aux trois sites, pour les dix élèves de la démo', async ({ page }) => {
    test.setTimeout(180000);
    page.on('dialog', (d) => d.dismiss());
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(800);
    await page.evaluate(async () => {
        localStorage.clear();
        if (window.db && db.memoryCache) db.memoryCache.clear();
        await new Promise((res) => {
            const req = indexedDB.deleteDatabase('LaboCodexDB');
            req.onsuccess = req.onerror = req.onblocked = () => res();
            setTimeout(res, 1500);
        });
    });
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1200);

    const eleves = await page.evaluate(async () => {
        const pause = (ms) => new Promise((res) => setTimeout(res, ms));
        await window.activerModeDemo();
        await pause(1500);
        const texte = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');
        const out = [];
        for (const e of obtenirDonneesSelonMode('groupeEtudiants')) {
            afficherProfilComplet(e.da); await pause(400);
            changerSectionProfil('mobilisation'); await pause(400);
            const racine = document.getElementById('contenuProfilEtudiant') || document.body;
            const rapport = String(genererRapportAPI(e.da, { completion: true })).split('\n').find(l => l.startsWith('Complétion')) || '';
            const methodo = texte(document.getElementById('details-calculs-mobilisation-' + e.da));
            const carte = Array.from(racine.querySelectorAll('li')).map(texte).find(t => /remis\S* : \d+\/\d+/.test(t)) || '';
            out.push({ da: e.da, C: calculerTousLesIndices(e.da).C,
                rapport: (rapport.match(/^Complétion : (\d+)% \((\d+) remises \/ (\d+) productions\)$/) || []).slice(1).map(Number),
                methodo: (methodo.match(/Indice C = (\d+)% — (\d+) \S+ \S+ \/ (\d+) /) || []).slice(1).map(Number),
                carte: (carte.match(/: (\d+)\/(\d+)$/) || []).slice(1).map(Number) });
        }
        return out;
    });

    expect(eleves.map(e => e.da).sort()).toEqual(Object.keys(C_AVANT).sort());
    for (const e of eleves) {
        const attenduC = C_AVANT[e.da];
        expect([e.da, e.C]).toEqual([e.da, attenduC]);                                  // l'indice n'a bougé pour personne
        const remis = attenduC / 10;                                                      // dix productions comptées, terminale comprise
        expect([e.da, 'rapport', ...e.rapport]).toEqual([e.da, 'rapport', attenduC, remis, 10]);
        expect([e.da, 'méthodologie', ...e.methodo]).toEqual([e.da, 'méthodologie', attenduC, remis, 10]);
        expect([e.da, 'carte', ...e.carte]).toEqual([e.da, 'carte', remis, 10]);
        expect(Math.round(e.carte[0] / e.carte[1] * 100)).toBe(e.C);
    }
    // Les quatre élèves qui divergeaient sont bien dans le lot, et ne sont pas à 100 % (le banc mesure quelque chose).
    expect(eleves.filter(e => e.C < 100).map(e => e.da).sort()).toEqual(['DEMO004', 'DEMO006', 'DEMO015', 'DEMO020']);
});
