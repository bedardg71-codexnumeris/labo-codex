import { test, expect } from '@playwright/test';
import { ouvrirEspaceVide, mettreLeCadreEnPlace, attendreEtape, bulle } from './harness/classe-de-banc.js';
import { lire, bulleDit } from './harness/nous-faisons-evaluer-de-banc.js';
import {
    ouvrirEspaceVide as ouvrirPourLaDemo, peuplerUnTrimestreReel, ouvrirPanneau as ouvrirLePanneau, boutonModele, faireLaModelisation, enDemo
} from './harness/deux-temps-de-banc.js';

// =======================================================================
// LA FIN D'UN PARCOURS NE LANCE PLUS RIEN D'OFFICE — 20 NOVEMBRE 2026 (A3)
// =======================================================================
// Consigne : plans de travail/CONSIGNE-2026-11-20-essai-parcours.md, A3 et H (« un banc de A3 : rien n'est lancé
// d'office, avec break-test »). Vécu par Grégoire sur l'iPad le 20 nov. : « Parcours suivant » (ou « Voir le parcours
// suivant ») lançait un parcours. Ce banc juge, au navigateur, aux deux tailles de l'iPad :
//   1. « NOUS FAISONS » (la Pratique guidée) : à la fin de « Mettre ta classe en place », la bulle nomme la suite
//      (« Suite suggérée : le parcours 3, « Évaluer une première production ». », après « Chaque parcours a son
//      objectif… »), offre « Voir le parcours 3 » et « Terminer », de même poids, et sa consigne suit ses boutons ;
//      « Voir le parcours 3 » termine le parcours, ferme la bulle et ouvre le panneau « Assistance » DEVANT ce
//      parcours, ses deux boutons « Je regarde » et « Nous faisons » ; RIEN N'EST LANCÉ ;
//   2. LE DERNIER PARCOURS : ni ligne ni bouton de suite ; « Terminer » seul, et sa consigne le dit ;
//   3. « JE REGARDE » (la Modélisation) : « Le refaire avec ma classe », « Voir le parcours 3 », « Terminer » ; « Voir
//      le parcours 3 » ne lance pas le modèle suivant (avant : « Voir le parcours suivant » le lançait) ; la démo
//      reste ouverte, le panneau s'ouvre devant le parcours.
// La fin d'« Évaluer » (« Voir le parcours 4 ») est jugée dans nous-faisons-evaluer-2026-11-20.spec.js.
// Break-test (20 nov. 2026) : voir le rapport du lot (plans de travail/RAPPORT-2026-11-20-essai-parcours.md, § H).

const TAILLES = [[1180, 820], [820, 1180]];

/** « Mettre ta classe en place », « Nous faisons », joué jusqu'à sa dernière bulle (sans la quitter). */
async function jusquALaFinDeLaClasse(page) {
    await mettreLeCadreEnPlace(page);
    await attendreEtape(page, 7, 8, 'Prendre les présences', { focus: false });
    await page.click('#btnVerrouillerSaisiePresences');
    await attendreEtape(page, 8, 8, "Ta classe d'un coup d'œil", { focus: false });
}

/** Rien n'est lancé : ni bulle, ni parcours actif ; le panneau est ouvert devant le parcours `id`, le focus sur son premier bouton. */
async function rienNEstLance(page, id, { premierBouton }) {
    await expect(bulle(page)).toHaveCount(0);
    await expect(page.locator('#panneau-assistance')).toBeVisible();
    expect(await page.evaluate(() => ParcoursMoteur.actif()), 'aucun parcours n’est lancé').toBe(false);
    const carte = page.locator(`#panneau-assistance [data-parcours="${id}"]`);
    await expect(carte).toHaveClass(/assistance-parcours-item--suggere/);
    await expect(page.locator('#panneau-assistance .assistance-parcours-item--suggere')).toHaveCount(1);
    await expect(carte.locator('.assistance-modele-bouton')).toHaveText('Je regarde');
    await expect(carte.locator('.assistance-parcours-bouton')).toHaveText('Nous faisons');
    await expect(carte.locator(premierBouton)).toBeFocused();
    // LA MESURE DEMANDÉE (A3) : le panneau s'ouvre POSITIONNÉ sur le parcours, sa carte entière dans la vue du panneau.
    const vue = await page.evaluate((x) => {
        const p = document.getElementById('panneau-assistance').getBoundingClientRect();
        const r = document.querySelector('#panneau-assistance [data-parcours="' + x + '"]').getBoundingClientRect();
        return { haut: Math.round(r.top - p.top), bas: Math.round(Math.min(p.bottom, innerHeight) - r.bottom) };
    }, id);
    expect(vue.haut, 'le haut de la carte est dans le panneau').toBeGreaterThanOrEqual(0);
    expect(vue.bas, 'le bas de la carte est dans le panneau').toBeGreaterThanOrEqual(0);
}

for (const [largeur, hauteur] of TAILLES) {
    test(`${largeur} × ${hauteur} · « Nous faisons » : la fin nomme la suite ; « Voir le parcours 3 » ouvre le panneau devant « Évaluer » et ne lance rien`, async ({ page }) => {
        test.setTimeout(240000);
        await ouvrirEspaceVide(page, largeur, { hauteur });
        await jusquALaFinDeLaClasse(page);
        await bulleDit(page, {
            boutons: ['Voir le parcours 3', 'Terminer'], principaux: [],
            suite: ['Chaque parcours a son objectif. C\'est toi qui choisis la suite.', 'Suite suggérée : le parcours 3, « Évaluer une première production ».'],
            revue: 'Pour revoir une étape, touche « 8 sur 8 ».',
            consignes: ['Touche « Voir le parcours 3 », ou « Terminer »']
        }, 'la dernière bulle de « Mettre ta classe en place »');
        // Les deux boutons ont le même poids : la même classe, aucun mis en avant.
        const classes = await bulle(page).locator('.parcours-bulle-boutons button').evaluateAll((bs) => bs.map((b) => b.className));
        expect(new Set(classes).size, 'les deux boutons ont la même forme').toBe(1);
        // « Voir le parcours 3 » : le parcours est fait, la bulle fermée, le panneau devant « Évaluer » ; rien n'est lancé.
        await bulle(page).getByRole('button', { name: 'Voir le parcours 3', exact: true }).click();
        await rienNEstLance(page, 'evaluer', { premierBouton: '.assistance-modele-bouton' });
        expect(await page.evaluate(() => ({
            classe: Assistance.etatDe('classe').etat, evaluer: Assistance.etatDe('evaluer').etat, modele: Assistance.etatModeleDe('evaluer').etat,
            demo: estEnModeDemo(), contexte: Object.keys(ParcoursEvaluer.contexte()).length
        })), 'le parcours quitté est fait ; le suivant n’a pas commencé, dans aucun de ses deux temps').toEqual({ classe: 'fait', evaluer: 'a-faire', modele: 'a-faire', demo: false, contexte: 0 });
        // La personne choisit : « Nous faisons », touché dans le panneau, lance le parcours 3 (sa première bulle).
        await page.locator('#panneau-assistance [data-parcours="evaluer"] .assistance-parcours-bouton').click();
        await bulleDit(page, { rang: '1 sur 10', titre: 'Ta pratique de notation', identite: 'Parcours 3 · Évaluer une première production · Nous faisons' }, 'le parcours 3, lancé par la personne');
    });
}

test('1180 × 820 · le dernier parcours : ni ligne ni bouton de suite ; « Terminer » seul, et sa consigne le dit', async ({ page }) => {
    test.setTimeout(240000);
    await ouvrirEspaceVide(page, 1180, { hauteur: 820 });
    // Deux parcours ouverts seulement : « Mettre ta classe en place » est le dernier du panneau.
    await page.evaluate(() => Assistance.ouvrirLesParcours(['decouvrir', 'classe']));
    await jusquALaFinDeLaClasse(page);
    await bulleDit(page, {
        boutons: ['Terminer'], suite: ['Chaque parcours a son objectif. C\'est toi qui choisis la suite.'],
        revue: 'Pour revoir une étape, touche « 8 sur 8 ».', consignes: ['Touche « Terminer »']
    }, 'la dernière bulle du dernier parcours');
    expect((await lire(page)).suite.join(' ')).not.toContain('Suite suggérée');
    await bulle(page).getByRole('button', { name: 'Terminer', exact: true }).click();
    await expect(bulle(page)).toHaveCount(0);
    await expect(page.locator('#panneau-assistance')).toHaveCount(0);
});

test('820 × 1180 · « Je regarde » : « Voir le parcours 3 » ne lance pas le modèle suivant ; la démo reste ouverte, le panneau s’ouvre devant « Évaluer »', async ({ page }) => {
    test.setTimeout(360000);
    await ouvrirPourLaDemo(page, 820, 1180);
    await peuplerUnTrimestreReel(page);
    await ouvrirLePanneau(page);
    await boutonModele(page, 'classe').click();
    await faireLaModelisation(page);
    await bulleDit(page, {
        boutons: ['Le refaire avec ma classe', 'Voir le parcours 3', 'Terminer'], principaux: [],
        suite: ['Chaque parcours a son objectif. C\'est toi qui choisis la suite.', 'Suite suggérée : le parcours 3, « Évaluer une première production ».'],
        revue: 'Pour revoir une étape, touche « 8 sur 8 ».'
    }, 'la dernière bulle du « Je regarde » de « Mettre ta classe en place »');
    await bulle(page).getByRole('button', { name: 'Voir le parcours 3', exact: true }).click();
    await rienNEstLance(page, 'evaluer', { premierBouton: '.assistance-modele-bouton' });
    expect(await enDemo(page), 'la démo reste ouverte').toBe(true);
    expect(await page.evaluate(() => ({ fait: Assistance.etatModeleDe('classe').etat, suivant: Assistance.etatModeleDe('evaluer').etat })))
        .toEqual({ fait: 'fait', suivant: 'a-faire' });
});
