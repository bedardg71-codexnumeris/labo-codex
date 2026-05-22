import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// Chantier I (Cat-B Track 4) — Test Playwright rendu DOM trimestre-v2.
// Vérifie que chargerHorairesV2() peuple effectivement le dropdown
// d'horaires + la carte résumé (#v2-carteResumeHoraire) avec les séances
// (jour, heure, local). Attrape les régressions silencieuses post-refactor
// où la fonction se charge sans erreur mais produit un DOM vide.

test('Chantier I · trimestre-v2 rend la carte résumé horaires (jours + heures + local)', async ({ page }) => {
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
        if (typeof window.chargerHorairesV2 !== 'function') {
            return { erreur: 'window.chargerHorairesV2 absent' };
        }
        if (typeof window.cle !== 'function') {
            return { erreur: 'window.cle absent' };
        }
        if (typeof window.db === 'undefined') {
            return { erreur: 'window.db absent' };
        }

        // Fixture horaire minimal (2 séances Lundi + Mercredi, 2 périodes chacune)
        const horaire = {
            id: 'test-h1-chantierI',
            nom: 'Horaire test chantier I',
            groupeAssocie: '01',
            periodesParSeance: 2,
            seances: [
                { jour: 'Lundi', heureDebut: '08:30', heureFin: '10:25', local: 'A-101' },
                { jour: 'Mercredi', heureDebut: '13:00', heureFin: '14:55', local: 'A-101' }
            ]
        };
        window.db.setSync(window.cle('horaires'), [horaire]);
        window.db.setSync(window.cle('horaireSelectionne'), horaire.id);

        window.chargerHorairesV2();

        const carte = document.getElementById('v2-carteResumeHoraire');
        const select = document.getElementById('v2-selectHoraire');

        const htmlCarte = carte ? carte.innerHTML : '';
        return {
            aCarte: !!carte,
            aSelect: !!select,
            nbOptionsHoraire: select
                ? Array.from(select.options).filter((o) => o.value === horaire.id).length
                : 0,
            longueurCarte: htmlCarte.length,
            aNomHoraire: htmlCarte.includes('Horaire test chantier I'),
            aLundi: htmlCarte.includes('Lundi'),
            aMercredi: htmlCarte.includes('Mercredi'),
            aHeureLundi: htmlCarte.includes('08:30'),
            aHeureMercredi: htmlCarte.includes('13:00'),
            aLocal: htmlCarte.includes('A-101'),
            aFormat: htmlCarte.includes('2×2') || htmlCarte.includes('Format'),
            aPeriodes: htmlCarte.includes('périodes')
        };
    });

    expect(resultat.erreur, `Erreur eval : ${resultat.erreur}`).toBeUndefined();
    expect(resultat.aCarte).toBe(true);
    expect(resultat.aSelect).toBe(true);
    expect(resultat.nbOptionsHoraire).toBe(1);
    expect(resultat.longueurCarte).toBeGreaterThan(50);
    expect(resultat.aNomHoraire).toBe(true);
    expect(resultat.aLundi).toBe(true);
    expect(resultat.aMercredi).toBe(true);
    expect(resultat.aHeureLundi).toBe(true);
    expect(resultat.aHeureMercredi).toBe(true);
    expect(resultat.aLocal).toBe(true);
    expect(resultat.aFormat).toBe(true);
    expect(resultat.aPeriodes).toBe(true);

    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});
