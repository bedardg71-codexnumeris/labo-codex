import { test, expect } from '@playwright/test';
import { releverLaBulle } from './harness/releve-bulle.js';
// La bulle ne couvre jamais ses zones quand une place les laisse libres (Grégoire, 11 nov. 2026) : relevé à chaque essai.
releverLaBulle(test);
import { ouvrirPanneau, bulle } from './harness/classe-de-banc.js';
import { leNousFaisonsEntier, bulleDit, lire, item, ctx, MOTS } from './harness/nous-faisons-evaluer-de-banc.js';

// =======================================================================
// « ÉVALUER UNE PREMIÈRE PRODUCTION », « NOUS FAISONS » — LES DIX BULLES DU 20 NOVEMBRE 2026
// =======================================================================
// Consigne : plans de travail/CONSIGNE-2026-11-20-essai-parcours.md, section D (et H). Les mots sont jugés par
// tests/unit/sentinelle-parcours-evaluer-2026-11-09.test.js ; ce banc juge, au navigateur, en faisant les gestes, depuis
// un espace où le deuxième parcours est fait, de bout en bout :
//   1. LES DEUX VOIES de la bulle 2 (« Partir d'un modèle », avec la question de l'échelle ; « Décrire ma pratique »,
//      que la bulle ne suit pas écran par écran) et de la bulle 5 (« Mon matériel », l'étiquetage ; « Je la compose
//      ici », l'onglet « Grilles ») ; l'échelle gardée (« Je garde celle-ci ») ou neuve (« + Nouvelle échelle ») ;
//   2. L'ORDRE : la pratique, son application, l'échelle, la grille, la cartouche, la production, ses consignes,
//      l'évaluation, le point ; chaque bulle avance sur ce qui NAÎT, pas sur un toucher ;
//   3. LA FORME : l'entrée de la première bulle (A1, A2), la confirmation au-dessus du titre, la phrase du lieu, les
//      explications sans marque, la flèche des gestes, leur crochet, la consigne en dernier, les secondes formes ;
//   4. CE QUE GRÉGOIRE A VÉCU LE 20 NOV. : les trois menus de la production visibles à côté de la bulle ; le halo de
//      « Consignes transmises » à la largeur de la case ; pas d'avis jaune pendant le parcours (A6) ;
//   5. LA MESURE DEMANDÉE (bulle 9) : la Liste montre d'elle-même la production qui vient d'être créée ;
//   6. LA FIN (A3) : « Voir le parcours 4 » ne lance rien ; le panneau s'ouvre devant « Recevoir » ;
//   7. LA REPRISE : « Plus tard », puis « Nous faisons » : la bulle où l'on reprend n'a pas de confirmation.
// Deux tailles, l'iPad couché et debout : 1180 × 820, 820 × 1180.
// Break-test (20 nov.) : voir le rapport du lot (plans de travail/RAPPORT-2026-11-20-essai-parcours.md).

const TAILLES = [[1180, 820], [820, 1180]];
const VOIES = [
    { nom: '« Partir d’un modèle », « Mon matériel », l’échelle gardée', voiePratique: 'modele', voieGrille: 'materiel', echelleNeuve: false },
    { nom: '« Décrire ma pratique », « Je la compose ici », une échelle neuve', voiePratique: 'decrire', voieGrille: 'composer', echelleNeuve: true }
];

for (const [largeur, hauteur] of TAILLES) {
    for (const v of VOIES) {
        test(`${largeur} × ${hauteur} · ${v.nom} : de la pratique au point qui s’allume, puis la fin`, async ({ page }) => {
            await leNousFaisonsEntier(page, { largeur, hauteur, voiePratique: v.voiePratique, voieGrille: v.voieGrille, echelleNeuve: v.echelleNeuve });
            // Ce qui est né pendant le parcours, et rien que cela, a fait avancer les bulles.
            const c = await ctx(page);
            for (const k of ['pratiqueId', 'echelleId', 'grilleId', 'cartoucheId', 'productionId', 'evaluationId']) expect(c[k], k + ' est retenu').toBeTruthy();
            expect(c.voiePratique).toBe(v.voiePratique);
            expect(c.echelleId === 'ECHELLE_IDME_DEPART', 'l’échelle retenue : celle de départ, ou la neuve').toBe(!v.echelleNeuve);
            // La pratique née dans le parcours est celle du cours ; la production porte la grille et la cartouche.
            const etat = await page.evaluate((x) => {
                const p = (db.getSync(cle('productions'), []) || []).find((y) => y.id === x.productionId);
                return { appliquee: window.designerPratiqueActive().idBrut, grille: p.grilleId, cartouche: p.cartoucheId };
            }, c);
            expect(etat.appliquee).toBe(c.pratiqueId);
            expect(etat.grille).toBe(c.grilleId);
            expect(etat.cartouche).toBe(c.cartoucheId);
            // « L'étudiant·e que tu viens d'évaluer a maintenant son point » : il est sur la bande « Performance (P) ».
            // (La bande se dessine un instant après l'arrivée dans « Suivi » : on attend le point.)
            await expect.poll(() => page.evaluate(() => [...document.querySelector('#section-suivi h4[data-tooltip="tdb-performance"]').parentElement
                .querySelectorAll('.barre-indicateur .barre-etudiant[data-da]')].map((e) => e.getAttribute('data-da'))),
            { message: 'le point de l’étudiant·e évalué·e est sur la bande', timeout: 10000 }).toContain(String(c.evaluationDA));

            // LA FIN (A3) : « Voir le parcours 4 » termine ce parcours, ferme la bulle et ouvre le panneau devant
            // « Recevoir », ses deux boutons ; RIEN N'EST LANCÉ.
            await bulle(page).getByRole('button', { name: 'Voir le parcours 4' }).click();
            await expect(bulle(page)).toHaveCount(0);
            await expect(page.locator('#panneau-assistance')).toBeVisible();
            expect(await page.evaluate(() => ({ actif: ParcoursMoteur.actif(), demo: estEnModeDemo(), fait: Assistance.etatDe('evaluer').etat, suivant: Assistance.etatDe('recevoir').etat, modele: Assistance.etatModeleDe('recevoir').etat })))
                .toEqual({ actif: false, demo: false, fait: 'fait', suivant: 'a-faire', modele: 'a-faire' });
            const carte = page.locator('#panneau-assistance [data-parcours="recevoir"]');
            await expect(carte).toHaveClass(/assistance-parcours-item--suggere/);
            await expect(carte.locator('.assistance-modele-bouton')).toBeFocused();
            await expect(carte.locator('.assistance-modele-bouton')).toHaveText('Je regarde');
            await expect(carte.locator('.assistance-parcours-bouton')).toHaveText('Nous faisons');
            // LA MESURE DEMANDÉE (A3) : le panneau s'ouvre POSITIONNÉ sur le parcours (sa carte entière dans la vue du panneau).
            const vue = await page.evaluate(() => {
                const p = document.getElementById('panneau-assistance').getBoundingClientRect();
                const r = document.querySelector('#panneau-assistance [data-parcours="recevoir"]').getBoundingClientRect();
                return r.top >= p.top - 1 && r.bottom <= Math.min(p.bottom, innerHeight) + 1;
            });
            expect(vue, 'la carte de « Recevoir » est entière dans le panneau').toBe(true);
        });
    }
}

test('1180 × 820 · la reprise : « Plus tard » à la bulle 3, puis « Nous faisons » : pas de confirmation à la bulle où l’on reprend ; faite, la suivante en a une', async ({ page }) => {
    const { ouvrirEspaceVide, mettreLaClasseEnPlace } = await import('./harness/classe-de-banc.js');
    const { bulle1, bulle2Modele, bulle3 } = await import('./harness/nous-faisons-evaluer-de-banc.js');
    test.setTimeout(240000);
    await ouvrirEspaceVide(page, 1180, { hauteur: 820 });
    await mettreLaClasseEnPlace(page);
    await ouvrirPanneau(page);
    await item(page).locator('.assistance-parcours-bouton').click();
    await bulleDit(page, { rang: '1 sur 10' }, 'le parcours est lancé');
    await bulle1(page, { voie: 'modele', cap: 'reprise' });
    await bulle2Modele(page, { modele: 'SOM-litterature', cap: 'reprise' });
    await bulleDit(page, { rang: '3 sur 10', confirme: "C'est fait : ta pratique est créée." }, 'la bulle 3, dans le passage où la pratique est née');
    await bulle(page).getByRole('button', { name: 'Plus tard' }).click();
    await expect(bulle(page)).toHaveCount(0);
    // Le panneau dit où l'on est rendu ; « Nous faisons » reprend à la bulle 3, sans confirmation.
    await ouvrirPanneau(page);
    await expect(item(page).locator('.assistance-parcours-etat')).toHaveText('Étape 3 sur 10');
    await item(page).locator('.assistance-parcours-bouton').click();
    await bulleDit(page, { rang: '3 sur 10', titre: "L'appliquer à ton cours", confirme: '', identite: '', aide: '' }, 'la reprise à la bulle 3');
    // Le repère est relu, pas refait : la pratique née avant « Plus tard » compte toujours.
    await bulle3(page, { cap: 'reprise' }).catch(async () => {
        // `bulle3` attend la confirmation du premier passage : à la reprise, elle n'y est pas (c'est ce qu'on juge).
        const id = (await ctx(page)).pratiqueId;
        await page.selectOption('#menuPratiques', id);
        await page.evaluate(() => document.querySelectorAll('.notifications-pile > *').forEach((n) => n.remove()));
        await page.click('#conteneurEditionPratique [data-action="appliquerPratiqueAuCoursActive"]');
    });
    await bulleDit(page, { rang: '4 sur 10', confirme: "C'est fait : ta pratique s'applique à ton cours.", lieu: MOTS.lieu[4] }, 'la bulle 4 après la reprise');
    expect((await lire(page)).boutons).toEqual(['Je garde celle-ci']);
});
