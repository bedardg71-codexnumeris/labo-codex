import { test, expect } from '@playwright/test';
import { releverLaBulle } from './harness/releve-bulle.js';
// La bulle ne couvre jamais ses zones quand une place les laisse libres (Grégoire, 11 nov. 2026) : relevé à chaque essai.
releverLaBulle(test);
import {
    ouvrirEspaceVide, ouvrirPanneau, boutonModele, bulle, enDemo, attendreEtape, contourSur, releve, ecarts, horsDeLaDemo,
    peuplerUnTrimestreReel
} from './harness/deux-temps-de-banc.js';
import { flecheVers } from './harness/fleches-de-banc.js';
import { bulleDit, lireToute, aPlat } from './harness/bulle-du-22-nov.js';

// =======================================================================
// PARCOURS 6, « METTRE TES DONNÉES À L'ABRI », « JE REGARDE » (22 NOVEMBRE 2026) : LA VISITE DU MENU « CODEX »
// =======================================================================
// plans de travail/CONSIGNE-2026-11-22-echelle-de-depart-et-parcours-6-7-8.md, § 5, et la suite (15 h), point 7. Lancé
// sous le Chromium du nuage (le verdict WebKit et l'iPad viendront de la porte terrain). Aux deux tailles de l'iPad :
//   · les cinq bulles, mot pour mot (les textes du module, que la sentinelle confronte à la consigne) ;
//   · la personne ne touche que « Codex » (bulle 1), puis « Continuer » ; des bulles 2 à 5, le menu reste ouvert, même
//     quand on touche la bulle, sa poignée ou « Continuer » ;
//   · RIEN ne répond dans le menu : « Mettre à jour le codex », « Mettre à jour dans un autre fichier… », « Ouvrir un
//     codex… », « Nouveau codex », le renommage (820 × 1180 : un codex existe, son nom est en haut du menu) ; aucune
//     action du codex n'est atteinte, aucun fichier ne s'écrit ;
//   · les flèches : bulles 2 et 3 à « Mettre à jour le codex », 4 au haut du menu, 5 à « Ouvrir un codex… » ; aucune
//     pulsation ;
//   · le confinement (aucune clé hors de la démo ne change) ; « Refaire » relance sans rien remettre à neuf.
// Break-tests (22 nov.) : au rapport du lot (plans de travail/RAPPORT-2026-11-22-parcours-6-7-8-suite.md).

const TOTAL = 5;
const etape = (page, n) => attendreEtape(page, n, TOTAL);
const boutonDeBulle = (page, nom) => bulle(page).getByRole('button', { name: nom, exact: true });
const ITEM = (action) => `#codex-menu .codex-menu-item:not(.codex-menu-item--simple)[data-action="Codex.${action}"]`;
const ACTIONS = ['actionEnregistrer', 'actionEnregistrerSous', 'actionOuvrir', 'actionNouveau', 'actionRenommer', 'actionDetails', 'actionFermer'];
const menuOuvert = (page) => page.evaluate(() => { const m = document.getElementById('codex-menu'); return !!m && !m.classList.contains('u-hide'); });
const pulsation = (page) => page.evaluate(() => { const c = document.getElementById('parcours-contour'); return !!c && !c.hidden; });

/** Les écritures et les ouvertures de fichiers piégées ; chaque action du codex comptée (sans être faite) dès maintenant. */
async function pieger(page) {
    await page.evaluate((actions) => {
        window.__ecritures = 0;
        window.__atteintes = {};
        window.showSaveFilePicker = async () => ({ createWritable: async () => ({ write: async () => {}, close: async () => { window.__ecritures++; }, abort: async () => {} }) });
        window.showOpenFilePicker = async () => { window.__ecritures++; return []; };
        navigator.share = async () => { window.__ecritures++; };
        actions.forEach((a) => { window.__atteintes[a] = 0; Codex[a] = function () { window.__atteintes[a]++; }; });
    }, ACTIONS);
}
const atteintes = (page) => page.evaluate(() => ({ actions: window.__atteintes, ecritures: window.__ecritures }));

/** Un codex réel, écrit hors de la démo par le vrai geste (« Mettre à jour le codex », puis l'aperçu), avant la visite. */
async function ecrireUnCodex(page) {
    await page.evaluate(() => {
        window.showSaveFilePicker = async () => ({ createWritable: async () => ({ write: async () => {}, close: async () => {}, abort: async () => {} }) });
    });
    await page.click('#btn-codex');
    await page.click(ITEM('actionEnregistrer'));
    await page.click('.export-preview-modal .btn-confirmer');
    await expect.poll(() => page.evaluate(() => !!(Codex.etat() || {}).actif), { timeout: 30000 }).toBe(true);
    if (await menuOuvert(page)) await page.click('#btn-codex');
}

/** Rien ne répond : chaque article touché du menu, aucune action atteinte, aucun fichier écrit, la bulle et le menu là. */
async function rienNeRepond(page, n, selecteurs) {
    for (const s of selecteurs) {
        await page.locator(s).click();
        expect(await menuOuvert(page), `bulle ${n} : le menu reste ouvert après « ${s} »`).toBe(true);
        await expect(bulle(page).locator('.parcours-bulle-rang')).toHaveText(`${n} sur ${TOTAL}`);
    }
    const a = await atteintes(page);
    expect(a.ecritures, `bulle ${n} : aucun fichier écrit`).toBe(0);
    expect(Object.entries(a.actions).filter(([, v]) => v > 0), `bulle ${n} : aucune action du codex atteinte`).toEqual([]);
    await expect(page.locator('.export-preview-modal')).toHaveCount(0);
    await expect(page.locator('#overlay-ui-dialogue .modal-contenu:visible')).toHaveCount(0);
}

/** Le menu reste ouvert quand on touche la bulle (son texte) et sa poignée. */
async function toucherLaBulle(page, n) {
    await bulle(page).locator('.parcours-bulle-lignes').click({ position: { x: 10, y: 10 } });
    expect(await menuOuvert(page), `bulle ${n} : le menu reste ouvert, la bulle touchée`).toBe(true);
    await bulle(page).locator('.parcours-bulle-poignee').click();
    expect(await menuOuvert(page), `bulle ${n} : le menu reste ouvert, la poignée touchée`).toBe(true);
}

for (const [L, H, avecCodex] of [[1180, 820, false], [820, 1180, true]]) {
    test(`${L} × ${H}${avecCodex ? ', un codex déjà écrit' : ', sans codex'} : les cinq bulles de la visite, mot pour mot ; rien ne répond dans le menu ; le menu reste ouvert ; les flèches sans pulsation ; le confinement ; « Refaire »`, async ({ page }) => {
        test.setTimeout(240000);
        page.setDefaultTimeout(20000);
        await ouvrirEspaceVide(page, L, H);
        await peuplerUnTrimestreReel(page);
        if (avecCodex) await ecrireUnCodex(page);
        await pieger(page);
        const avant = await releve(page);
        const { t } = await page.evaluate(() => ({ t: JSON.parse(JSON.stringify(ParcoursDonnees.textesModele)) }));
        const B = t.bulles;

        await ouvrirPanneau(page);
        await boutonModele(page, 'donnees').click();

        // 1. Pourquoi un codex : le seul geste de la visite, « Codex », avec sa pulsation.
        await etape(page, 1);
        expect(await enDemo(page)).toBe(true);
        const v1 = await bulleDit(page, { titre: B[0].titre, lieuSuite: null, lignes: B[0].lignes, objectif: t.objectif }, 'bulle 1');
        expect(v1.entree, 'l’entrée').toBe("Parcours 6 · Mettre tes données à l'abri · Je regarde");
        expect(v1.boutons).toEqual([]);
        expect(await menuOuvert(page)).toBe(false);
        await contourSur(page, '#btn-codex');
        await page.click('#btn-codex');

        // 2. Mettre à jour : la flèche à « Mettre à jour le codex », sans pulsation ; rien ne répond ; « Continuer ».
        await etape(page, 2);
        await bulleDit(page, { titre: B[1].titre, confirme: B[1].confirme, lieuSuite: null, lignes: B[1].lignes }, 'bulle 2');
        expect(await menuOuvert(page)).toBe(true);
        await flecheVers(page, ITEM('actionEnregistrer'), 'bulle 2');
        expect(await pulsation(page), 'bulle 2 : aucune pulsation').toBe(false);
        // Break-test (22 nov.) : `garderLeMenu` retiré → ROUGE ici (l'aperçu s'ouvre, l'action est atteinte).
        const articles = [ITEM('actionEnregistrer'), ITEM('actionEnregistrerSous'), ITEM('actionOuvrir'), ITEM('actionNouveau')];
        if (avecCodex) articles.push('#codex-menu-statut-haut .codex-statut-nom[data-action="Codex.actionRenommer"]');
        await rienNeRepond(page, 2, articles);
        await toucherLaBulle(page, 2);
        await boutonDeBulle(page, 'Continuer').click();

        // 3. Un lieu protégé : la même flèche ; le menu ouvert après « Continuer ».
        await etape(page, 3);
        await bulleDit(page, { titre: B[2].titre, confirme: B[2].confirme, lieuSuite: null, lignes: B[2].lignes }, 'bulle 3');
        expect(await menuOuvert(page), 'bulle 3 : le menu reste ouvert après « Continuer »').toBe(true);
        await flecheVers(page, ITEM('actionEnregistrer'), 'bulle 3');
        expect(await pulsation(page), 'bulle 3 : aucune pulsation').toBe(false);
        await rienNeRepond(page, 3, [ITEM('actionEnregistrer')]);
        await toucherLaBulle(page, 3);
        await boutonDeBulle(page, 'Continuer').click();

        // 4. Où en est ton codex : la flèche au haut du menu ; ce qu'il affiche dans la démo (mesure).
        await etape(page, 4);
        await bulleDit(page, { titre: B[3].titre, confirme: B[3].confirme, lieuSuite: null, lignes: B[3].lignes }, 'bulle 4');
        expect(await menuOuvert(page)).toBe(true);
        await flecheVers(page, '#codex-menu-statut-haut', 'bulle 4');
        expect(await pulsation(page), 'bulle 4 : aucune pulsation').toBe(false);
        const haut = aPlat(await page.locator('#codex-menu-statut-haut').innerText());
        // La pastille de l'en-tête (`#codex-indicateur`, `_mettreAJourIndicateur`, js/codex.js) : verte (`--sauve`) ou orange (`--modifie`).
        const pastille = await page.evaluate(() => { const p = document.getElementById('codex-indicateur'); return p && p.getClientRects().length ? p.className : null; });
        console.warn(`MESURE bulle 4 (${avecCodex ? 'un codex écrit' : 'sans codex'}), dans la démo : le haut du menu dit « ${haut} » ; la pastille de l’en-tête : ${pastille}`);
        if (avecCodex) {
            expect(haut, 'le haut du menu parle du codex de la personne, même dans la démo').toMatch(/Ton codex (est à jour|n'a pas tes derniers changements)/);
            expect(pastille, 'la pastille, à côté du mot « Codex »').toMatch(/codex-indicateur--(sauve|modifie)/);
        } else {
            expect(haut).toMatch(/^Pas encore de codex/);
            expect(pastille, 'sans codex, aucune pastille').toBeNull();
        }
        await rienNeRepond(page, 4, [avecCodex ? '#codex-menu-statut-haut .codex-statut-nom' : '#codex-menu-statut-haut']);
        await boutonDeBulle(page, 'Continuer').click();

        // 5. Quand le rouvrir : la flèche à « Ouvrir un codex… » ; l'objectif atteint, la suite, trois boutons de même poids.
        await etape(page, 5);
        const v5 = await bulleDit(page, { titre: B[4].titre, confirme: B[4].confirme, lieuSuite: null,
            lignes: B[4].lignes.concat([['c', 'Touche « Le refaire avec ma classe », « Voir le parcours 7 », ou « Terminer »']]) }, 'bulle 5');
        expect(v5.lignes.filter((l) => l[0] === 'fin').map((l) => l[1])).toEqual(expect.arrayContaining([aPlat(t.objectifAtteint),
            aPlat('Suite suggérée : le parcours 7, « Lire ta classe et intervenir ».')]));
        expect(v5.boutons).toEqual(['Le refaire avec ma classe', 'Voir le parcours 7', 'Terminer']);
        expect(await bulle(page).locator('.parcours-bulle-boutons button.btn-principal').count(), 'aucun bouton mis en avant').toBe(0);
        expect(await menuOuvert(page)).toBe(true);
        await flecheVers(page, ITEM('actionOuvrir'), 'bulle 5');
        expect(await pulsation(page), 'bulle 5 : aucune pulsation').toBe(false);
        await rienNeRepond(page, 5, [ITEM('actionOuvrir')]);
        await boutonDeBulle(page, 'Terminer').click();
        await expect(bulle(page)).toHaveCount(0);
        expect(await menuOuvert(page), 'la visite finie, le menu se referme').toBe(false);
        expect(await page.evaluate(() => Assistance.etatModeleDe('donnees').etat)).toBe('fait');

        // LE CONFINEMENT : rien hors de la démo n'a changé ; aucune action du codex atteinte, aucun fichier écrit.
        const fin = await atteintes(page);
        expect(fin.ecritures).toBe(0);
        expect(Object.entries(fin.actions).filter(([, v]) => v > 0)).toEqual([]);
        await page.evaluate(() => desactiverModeDemo());
        await expect.poll(() => enDemo(page)).toBe(false);
        const apres = await releve(page);
        expect(ecarts(avant, apres, horsDeLaDemo), 'aucune clé hors de la démo ne change').toEqual([]);

        // « Refaire » : la visite repart de sa première bulle, rien à défaire (la démo n'est pas remise à neuf).
        await ouvrirPanneau(page);
        await boutonModele(page, 'donnees').click();
        await etape(page, 1);
        expect(await page.locator('.modal-overlay.actif').count(), 'aucune question : rien n’est remis à neuf').toBe(0);
        await bulleDit(page, { titre: B[0].titre, lieuSuite: null, lignes: B[0].lignes, objectif: t.objectif }, 'bulle 1, après « Refaire »');
        expect((await lireToute(page)).boutons).toEqual([]);
    });
}
