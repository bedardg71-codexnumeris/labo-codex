import { test, expect } from '@playwright/test';
import { ouvrirPanneau, bulle } from './harness/classe-de-banc.js';
import { leTroisiemeParcoursFait, bulleDit, ctx, item } from './harness/nous-faisons-evaluer-de-banc.js';

// =======================================================================
// #1273 — « ÉVALUER UNE PREMIÈRE PRODUCTION », « NOUS FAISONS » : CE QUI EXISTE FAIT L'ÉTAPE, AU NAVIGATEUR
// =======================================================================
// Décision de Grégoire (27 nov. 2026, 14 h 41) : une étape est faite dès que ce qu'elle demande existe dans le
// trimestre, peu importe quand ce fut créé, et le parcours passe à la suivante. Le moteur est jugé hors du navigateur
// (tests/unit/parcours-evaluer-ce-qui-existe-1273.test.js) ; ce banc juge, dans le vrai index.html, ce que voit la
// personne qui a déjà tout (l'espace où le troisième parcours est fait) et qui touche « Refaire » :
//   1. le parcours s'ouvre sur la seule étape que « Commencer » remet à faire, l'échelle (une étape par choix) ;
//   2. « Je garde celle-ci » mène DROIT à la première étape qui reste à faire (ici, la dernière bulle), sans ouvrir
//      une à une, avec leur page, les étapes déjà faites d'entre les deux.
// Break-test (27 nov. 2026) : voir le rapport du lot (plans de travail/RAPPORT-2026-11-27-parcours.md).

test('1180 × 820 · « Refaire » quand tout existe : l’échelle, puis « Je garde celle-ci » mène droit au point qui s’allume', async ({ page }) => {
    test.setTimeout(360000);
    await leTroisiemeParcoursFait(page, { largeur: 1180, hauteur: 820 });
    const avant = await ctx(page);
    await ouvrirPanneau(page);
    await item(page).locator('.assistance-parcours-bouton').click();
    await bulleDit(page, { rang: '4 sur 10', titre: 'Ton échelle de performance', confirme: '' }, 'le parcours s’ouvre sur l’échelle');
    // Les étapes montrées, relevées à chaque image, depuis « Je garde celle-ci ».
    await page.evaluate(() => {
        window.__etapesVues = [ParcoursMoteur.etapeCourante()];
        (function relever() {
            const i = ParcoursMoteur.actif() ? ParcoursMoteur.etapeCourante() : null;
            if (window.__etapesVues[window.__etapesVues.length - 1] !== i) window.__etapesVues.push(i);
            requestAnimationFrame(relever);
        })();
    });
    await bulle(page).getByRole('button', { name: 'Je garde celle-ci' }).click();
    await bulleDit(page, { rang: '10 sur 10', titre: "Le point qui s'allume" }, 'la dernière bulle');
    expect(await page.evaluate(() => window.__etapesVues), 'de l’échelle, droit à la dernière bulle').toEqual([3, 9]);
    // Ce que le parcours retient : ce qui existait, rien de neuf.
    const apres = await ctx(page);
    for (const k of ['pratiqueId', 'grilleId', 'cartoucheId', 'productionId']) expect(apres[k], k).toBe(avant[k]);
    expect(apres.echelleId).toBe('ECHELLE_IDME_DEPART');
});
