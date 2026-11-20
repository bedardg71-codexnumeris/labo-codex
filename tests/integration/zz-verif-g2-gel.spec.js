import { test, expect } from '@playwright/test';
import { ouvrirEspaceVide, mettreLeCadreEnPlace, mettreLaClasseEnPlace, ouvrirPanneau, bulle, elevesFictifs } from './harness/classe-de-banc.js';

// =======================================================================
// LE GEL DE L'ÉTAPE 7 (vécu par Grégoire le 15 nov. 2026, iPad Air 5, 1.247.0)
// plans de travail/RAPPORT-2026-11-15-gel-refaire.md
// =======================================================================
// (1) Le placement de la bulle coûtait le cube du nombre de zones : l'étape 7 de « Mettre ta classe en place »
//     déclare une zone par cellule de la saisie, et la page gelait dès une douzaine de personnes (mesuré : 1,1 s
//     par placement à 12, 4,9 s à 24). Le moteur réduit maintenant ce qu'il évite avant de chercher une place.
//     LE PLAFOND : à 24 et à 36 rangées, un placement (`placerLoin`, avec les rectangles que l'étape déclare) et
//     une réponse de la page, chacun sous PLAFOND_MS, aller-retour du banc compris.
// (4) Une étape en lignes traçait une flèche par élément déclaré dans `fleches` : une par rangée de la colonne
//     Présence. Ces cibles sont de nouveau groupées : une seule flèche vers la colonne.
// (2) En visite (« Refaire »), ni contour ni flèche sur un contrôle qui écrit dans les données, et la consigne
//     est remplacée par la phrase de la visite (texte de Grégoire, relais de Cowork du 15 nov.).
// Des noms manifestement fictifs (CLAUDE.md, règle 6).

const PLAFOND_MS = 250;
const PHRASE_VISITE = 'Tu revois ce parcours : rien n\'est à refaire. Lis, puis touche « Continuer ».';

const chrono = async (f) => { const t = Date.now(); const v = await f(); return [Date.now() - t, v]; };
const rang = (page) => page.locator('#parcours-bulle .parcours-bulle-rang');
const aPlat = (t) => String(t || '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim();

/** Les flèches tracées, et celles dont la cible touche la colonne Présence. */
function fleches(page) {
    return page.evaluate(() => {
        const cases = [...document.querySelectorAll('#tbody-saisie-presences .input-periodes')].map((i) => i.closest('td').getBoundingClientRect());
        const touche = (c) => cases.some((r) => !(c[2] <= r.left || r.right <= c[0] || c[3] <= r.top || r.bottom <= c[1]));
        const cibles = [...document.querySelectorAll('#parcours-fleches g')].map((g) => g.getAttribute('data-cible').split(',').map(Number));
        return { total: cibles.length, versLaColonne: cibles.filter(touche).length };
    });
}

for (const N of [24, 36]) {
    test('premier passage, ' + N + ' rangées : à l\'étape 7, un placement et une réponse de la page sous ' + PLAFOND_MS + ' ms ; une seule flèche vers la colonne Présence', async ({ page }) => {
        test.setTimeout(600000);
        await ouvrirEspaceVide(page, 1180, { hauteur: 820 });
        await mettreLeCadreEnPlace(page, elevesFictifs(N));
        await expect(rang(page)).toHaveText('7 sur 8', { timeout: 300000 });
        await page.waitForFunction(() => !!window.ParcoursMoteur.placement(), null, { timeout: 300000 });
        expect(await page.locator('#tbody-saisie-presences tr').count(), 'la saisie porte la classe entière').toBe(N);

        // Un placement, avec ce que l'étape déclare (les rectangles tels que la sonde les passe).
        const [msPlacement, declares] = await chrono(() => page.evaluate(() => {
            const M = window.ParcoursMoteur, p = M.placement();
            const rects = p.zones.filter(M.visible).map((e) => e.getBoundingClientRect());
            const b = document.getElementById('parcours-bulle');
            M.geometrie.placerLoin(rects, b.offsetWidth, b.offsetHeight, p.cadre);
            return rects.length;
        }));
        // La page répond : cinq allers-retours, le plus long.
        let msReponse = 0;
        for (let k = 0; k < 5; k++) msReponse = Math.max(msReponse, (await chrono(() => page.evaluate(() => 1)))[0]);
        console.log('MESURE ' + JSON.stringify({ N, declares, msPlacement, msReponse }));
        expect(declares, 'l\'étape déclare bien une zone par cellule (sinon ce banc ne mesure plus rien)').toBeGreaterThan(4 * N);
        expect(msPlacement, 'un placement, ' + declares + ' rectangles déclarés').toBeLessThan(PLAFOND_MS);
        expect(msReponse, 'la page répond').toBeLessThan(PLAFOND_MS);

        // Une seule flèche vers la colonne Présence, à l'ouverture comme après un défilement.
        const ouverture = await fleches(page);
        expect(ouverture.versLaColonne, 'flèches vers la colonne Présence, à l\'ouverture').toBe(1);
        await page.evaluate(() => window.scrollBy(0, 240));
        await page.waitForFunction((p) => window.ParcoursMoteur.placement().passages > p + 1, await page.evaluate(() => window.ParcoursMoteur.placement().passages));
        const defilee = await fleches(page);
        expect(defilee.versLaColonne, 'flèches vers la colonne Présence, après 240 px de défilement').toBe(1);
        expect(defilee.total, 'les flèches ne se multiplient pas au défilement').toBeLessThanOrEqual(ouverture.total);
        // Le halo a suivi le bouton.
        const ecart = await page.evaluate(() => {
            const c = document.getElementById('parcours-contour'), b = document.getElementById('btnVerrouillerSaisiePresences');
            if (!c || c.hidden) return 'absent';
            const a = c.getBoundingClientRect(), d = b.getBoundingClientRect();
            return Math.round(Math.abs((a.top + a.bottom) / 2 - (d.top + d.bottom) / 2));
        });
        const suite = [];
        for (let k = 0; k < 12; k++) {
            suite.push(await page.evaluate(() => new Promise((ok) => requestAnimationFrame(() => requestAnimationFrame(() => {
                const c = document.getElementById('parcours-contour'), b = document.getElementById('btnVerrouillerSaisiePresences');
                const a = c.getBoundingClientRect(), d = b.getBoundingClientRect();
                ok([Math.round(a.top * 10) / 10, Math.round(a.bottom * 10) / 10, Math.round(d.top * 10) / 10, Math.round(d.bottom * 10) / 10, Math.round(window.scrollY), window.ParcoursMoteur.placement().passages].join(' '));
            })))));
        }
        console.log('SUITE ecart=' + ecart + ' | ' + suite.join(' | '));
    });
}

test('en visite (« Refaire ») : ni contour ni flèche sur un contrôle qui écrit, la phrase de la visite à la place de la consigne, et un toucher du bouton n\'est plus désigné', async ({ page }) => {
    test.setTimeout(300000);
    await ouvrirEspaceVide(page, 1180, { hauteur: 820 });
    await mettreLaClasseEnPlace(page);
    await ouvrirPanneau(page);
    const bouton = page.locator('#panneau-assistance [data-parcours="classe"] .assistance-parcours-bouton');
    // 16 nov. 2026 : sur une carte à deux temps, le bouton s'appelle « Nous faisons » ; c'est l'état, dessous, qui dit « Fait ».
    await expect(page.locator('#panneau-assistance [data-parcours="classe"] .assistance-parcours-etat')).toHaveText('Fait');
    await expect(bouton).toHaveText('Nous faisons');
    await bouton.click();

    const verrous = () => page.evaluate(() => JSON.stringify(window.lireDatesVerrouilleesSansSemis()));
    const avant = await verrous();
    const TITRES = ['Ton trimestre', 'Ton cours', 'Ton profil', 'Ta classe', 'Ton horaire', 'Ton groupe-cours', 'Prendre les présences'];
    // Une ligne d'explication de chaque étape, qui doit rester.
    const RESTE = ['calendrier scolaire', 'plan de cours', 'Ton prénom et ton nom', 'la liste de ton groupe', 'ton horaire', 'Un groupe-cours, c\'est une classe', 'Note seulement les absences et les retards'];
    for (let k = 0; k < TITRES.length; k++) {
        await expect(rang(page)).toHaveText((k + 1) + ' sur 8', { timeout: 15000 });
        await expect(bulle(page).locator('.parcours-bulle-titre')).toHaveText(TITRES[k]);
        const ou = 'étape ' + (k + 1);
        expect(await page.evaluate(() => window.ParcoursMoteur.enVisite()), ou + ' : en visite').toBe(true);
        // 19 nov. 2026 : une étape qui nomme sa section fait d'abord défiler la page jusqu'à elle, la bulle cachée ; le
        // placement n'existe qu'ensuite. Puis deux passages de la sonde : ce qu'elle pose est posé.
        await page.waitForFunction(() => window.ParcoursMoteur.placement() !== null && !document.getElementById('parcours-bulle').classList.contains('est-en-attente'));
        await page.waitForFunction((p) => window.ParcoursMoteur.placement().passages > p + 1, await page.evaluate(() => window.ParcoursMoteur.placement().passages));
        const vu = await page.evaluate(() => {
            const b = document.getElementById('parcours-bulle');
            const c = document.getElementById('parcours-contour'), c2 = document.getElementById('parcours-contour-date');
            return {
                contour: !!(c && !c.hidden), second: !!(c2 && !c2.hidden),
                fleches: document.querySelectorAll('#parcours-fleches g').length,
                // 19 nov. 2026 (« Nous faisons » réécrit) : les étapes 1 à 6 nomment leur SECTION du Cadre ; en visite, la
                // bulle ne désigne rien d'autre, et le moteur donne au NOM de la section sa flèche (règle c). Ce nom n'est
                // pas un contrôle qui écrit : il est compté à part, et vérifié tel.
                versLaSection: (() => {
                    const nom = document.querySelector('.accordeon-header .parcours-section-actuelle');
                    if (!nom) return { n: 0, controle: false };
                    const r = nom.getBoundingClientRect();
                    const d = (x, y) => Math.hypot(Math.max(r.left - x, 0, x - r.right), Math.max(r.top - y, 0, y - r.bottom));
                    const n = [...document.querySelectorAll('#parcours-fleches g.parcours-fleche')].filter((g) => {
                        const v = g.getAttribute('data-trace').match(/-?\d+(\.\d+)?/g).map(Number);
                        return d(v[4], v[5]) <= 9;
                    }).length;
                    return { n, controle: !!nom.closest('button, input, select, textarea, [data-action], [data-on-change], [role="button"]') };
                })(),
                consignes: [...b.querySelectorAll('.parcours-bulle-ligne--geste')].map((x) => x.textContent),
                lignes: b.querySelector('.parcours-bulle-lignes').textContent,
                boutons: [...b.querySelectorAll('.parcours-bulle-boutons button')].map((x) => x.textContent)
            };
        });
        expect(vu.contour, ou + ' : aucun contour').toBe(false);
        expect(vu.second, ou + ' : aucun second contour').toBe(false);
        expect(vu.fleches - vu.versLaSection.n, ou + ' : aucune flèche, hors du nom de la section').toBe(0);
        expect(vu.versLaSection.n, ou + ' : au plus une flèche, vers le nom de la section').toBeLessThanOrEqual(k < 6 ? 1 : 0);
        expect(vu.versLaSection.controle, ou + ' : le nom de la section n\'est pas un contrôle').toBe(false);
        expect(vu.consignes.map(aPlat), ou + ' : la consigne est la phrase de la visite, seule').toEqual([PHRASE_VISITE]);
        expect(aPlat(vu.lignes), ou + ' : les autres lignes restent').toContain(RESTE[k]);
        expect(aPlat(vu.lignes), ou + ' : plus d\'invitation à toucher le contrôle').not.toMatch(/Touche « (Créer|Importer|Verrouiller)/);
        expect(vu.boutons, ou).toEqual(['Continuer']);
        await bulle(page).getByRole('button', { name: 'Continuer' }).click();
    }
    // La dernière bulle n'est pas une visite d'un geste fait : sa consigne (un bouton de la bulle) reste.
    await expect(rang(page)).toHaveText('8 sur 8');
    // 20 nov. 2026 (plans de travail/CONSIGNE-2026-11-20-essai-parcours.md, A3) : le bouton de la suite s'appelle
    // « Voir le parcours 3 » (plus « Parcours suivant ») ; la consigne suit ses boutons.
    expect(aPlat(await bulle(page).locator('.parcours-bulle-ligne--geste').textContent())).toBe('Touche « Voir le parcours 3 », ou « Terminer »');
    expect(await bulle(page).locator('.parcours-bulle-boutons button').allTextContents()).toEqual(['Voir le parcours 3', 'Terminer']);
    expect(await verrous(), 'la visite n\'a rien déverrouillé').toBe(avant);
    await bulle(page).getByRole('button', { name: 'Terminer' }).click();
});
