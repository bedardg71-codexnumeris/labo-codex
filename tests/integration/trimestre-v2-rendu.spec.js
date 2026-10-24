import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// Chantier I (Cat-B Track 4) — Test Playwright rendu DOM trimestre-v2.
// Vérifie que chargerHorairesV2() peuple effectivement le dropdown
// d'horaires et ouvre la fiche de l'horaire retenu avec ses séances
// (jour, heure, local). Attrape les régressions silencieuses post-refactor
// où la fonction se charge sans erreur mais produit un DOM vide.
// #1148 (24 oct. 2026) : la carte résumé (#v2-carteResumeHoraire) est partie avec la colonne de gauche
// du Cadre — elle ne paraissait que sans fiche ouverte. Le banc lit maintenant la FICHE, qui montre les
// mêmes séances : c'est ce qui justifie le retrait.

test('Chantier I · trimestre-v2 ouvre la fiche de l\'horaire retenu (jours + heures + local)', async ({ page }) => {
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
            // #540 lot E1/E2 (26 août 2026) : chaque séance porte son nombre de périodes.
            // Sans lui, la carte résumé annonce « durée non déterminée » — ce qui est le
            // comportement voulu, mais ne permet pas d'éprouver ce que ce cas vérifie.
            seances: [
                { jour: 'Lundi', heureDebut: '08:30', heureFin: '10:25', nombrePeriodes: 2, local: 'A-101' },
                { jour: 'Mercredi', heureDebut: '13:00', heureFin: '14:55', nombrePeriodes: 2, local: 'A-101' }
            ]
        };
        window.db.setSync(window.cle('horaires'), [horaire]);
        window.db.setSync(window.cle('horaireSelectionne'), horaire.id);

        window.chargerHorairesV2();

        const fiche = document.getElementById('v2-formulaireHoraire');
        const select = document.getElementById('v2-selectHoraire');
        // Les champs de la fiche, en valeurs : le nom, puis jour, début, fin, local, périodes de chaque séance.
        const valeurs = fiche ? Array.from(fiche.querySelectorAll('input, select')).map((el) => el.value) : [];
        return {
            aFiche: !!fiche,
            ficheOuverte: !!fiche && !fiche.classList.contains('u-hide'),
            aSelect: !!select,
            nbOptionsHoraire: select
                ? Array.from(select.options).filter((o) => o.value === horaire.id).length
                : 0,
            choisi: select ? select.value : null,
            valeurs,
            plusDeCarte: !document.getElementById('v2-carteResumeHoraire')
        };
    });

    expect(resultat.erreur, `Erreur eval : ${resultat.erreur}`).toBeUndefined();
    expect(resultat.aFiche).toBe(true);
    expect(resultat.ficheOuverte, 'l\'horaire retenu s\'ouvre en fiche').toBe(true);
    expect(resultat.aSelect).toBe(true);
    expect(resultat.nbOptionsHoraire).toBe(1);
    expect(resultat.choisi).toBe('test-h1-chantierI');
    expect(resultat.plusDeCarte, '#1148 : la carte résumé est partie').toBe(true);
    for (const attendu of ['Horaire test chantier I', 'Lundi', 'Mercredi', '08:30', '13:00', 'A-101']) {
        expect(resultat.valeurs, attendu).toContain(attendu);
    }

    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});
