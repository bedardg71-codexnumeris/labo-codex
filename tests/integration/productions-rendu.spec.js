import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// Chantier I (Cat-B Track 4) — Test Playwright rendu DOM productions.
// Vérifie que le badge CC (rendu dans la modale d'aperçu d'import des
// productions, grilles, échelles, cartouches, pratiques) produit le HTML
// structurant attendu + couvre le fix XSS E-β sur metadata.contributeurs[].
// Cf. MODELE-MENACES.md §I-01 + cc-license.js:194.

test('Chantier I · productions — badge CC rend les métadonnées + échappe XSS contributeurs', async ({ page }) => {
    const erreurs = [];
    const patternsAttendus = [
        /version\.json.*access control/i,
        /Cross origin requests are only supported/i,
        /Not allowed to load local resource.*\.(svg|png)/i
    ];
    const estErreurAttendue = (msg) => patternsAttendus.some((re) => re.test(msg));
    page.on('pageerror', (e) => {
        const m = `pageerror: ${e.message}`;
        if (!estErreurAttendue(m)) erreurs.push(m);
    });
    page.on('console', (msg) => {
        if (msg.type() === 'error') {
            const m = `console.error: ${msg.text()}`;
            if (!estErreurAttendue(m)) erreurs.push(m);
        }
    });

    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const resultat = await page.evaluate(() => {
        if (typeof window.genererBadgeCC !== 'function') {
            return { erreur: 'window.genererBadgeCC absent' };
        }

        const metadata = {
            nom: 'Production Test',
            auteur_original: 'Grégoire Bédard',
            version: '1.2',
            licence: 'CC BY-NC-SA 4.0',
            licence_url: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
            date_creation: '2026-05-21',
            date_modification: '2026-05-21',
            contributeurs: [
                { nom: 'Jean Test', date: '2026-05-22', modifications: 'Ajout questions' }
            ]
        };
        const html = window.genererBadgeCC(metadata);

        // Vérifier rendu structurel via un conteneur jetable
        const div = document.createElement('div');
        div.innerHTML = html;
        const badge = div.querySelector('.cc-badge');

        // Test XSS échappement E-β : contributeurs[].modifications doit être échappé
        const payloadXss = {
            licence: 'CC',
            nom: 'P', auteur_original: 'A',
            version: '1', date_creation: '2026', date_modification: '2026',
            licence_url: 'https://example.com',
            contributeurs: [{ nom: 'X', date: '2026', modifications: '<script>alert(1)</script>' }]
        };
        const htmlXss = window.genererBadgeCC(payloadXss);

        return {
            longueur: html.length,
            aBadge: !!badge,
            aTitre: html.includes('Production Test'),
            aAuteur: html.includes('Grégoire Bédard'),
            aLienLicence: html.includes('creativecommons.org/licenses/by-nc-sa/4.0'),
            aConditions:
                html.includes('Attribuer les auteurs originaux') &&
                html.includes('Partager sous la même licence'),
            aContributeur: html.includes('Jean Test') && html.includes('Ajout questions'),
            aVersion: html.includes('1.2'),
            // Vérification fix E-β : balise <script> brute interdite, &lt;script attendu
            xssScriptBrutPresent: htmlXss.includes('<script>alert(1)</script>'),
            xssScriptEchappePresent: htmlXss.includes('&lt;script')
        };
    });

    expect(resultat.erreur, `Erreur eval : ${resultat.erreur}`).toBeUndefined();
    expect(resultat.longueur).toBeGreaterThan(500);
    expect(resultat.aBadge).toBe(true);
    expect(resultat.aTitre).toBe(true);
    expect(resultat.aAuteur).toBe(true);
    expect(resultat.aLienLicence).toBe(true);
    expect(resultat.aConditions).toBe(true);
    expect(resultat.aContributeur).toBe(true);
    expect(resultat.aVersion).toBe(true);
    expect(resultat.xssScriptBrutPresent).toBe(false);
    expect(resultat.xssScriptEchappePresent).toBe(true);

    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});
