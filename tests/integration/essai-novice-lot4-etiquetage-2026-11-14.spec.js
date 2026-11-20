// =======================================================================
// ESSAI NOVICE DU 14 NOV. 2026, LOT 4 — L'ÉTIQUETAGE DE LA GRILLE, dans un vrai WebKit
// =======================================================================
// plans de travail/CONSIGNE-2026-11-14-essai-novice.md, lot 4. Ce qui en reste sur la PAGE « Mon matériel » :
//   (a) « partie » remplace « morceau » dans ce que l'écran donne à lire ; « Sous-total » : un groupe de critères ;
//   (e) la page ne dit qu'une fois que l'exemple ne s'enregistre pas ; l'exemple n'écrit rien ;
//   (f, premier point) « L'exemple est étiqueté » ne s'affiche jamais tant que des parties restent sans étiquette.
//
// 20 nov. 2026 (plans de travail/CONSIGNE-2026-11-20-essai-parcours.md, section D) : le « Nous faisons » d'« Évaluer une
// première production » est réécrit, et son ancienne étape 1 est RETIRÉE. Sont partis de ce banc, avec elle :
//   · l'essai « (b) et (c) » en entier : les deux bulles d'ouverture (« Pourquoi étiqueter », « Tu apprends aussi ») et
//     la bulle « Ta grille » qui montrait les deux boutons de l'exemple (l'étiquetage est maintenant la bulle 5, que
//     juge `nous-faisons-evaluer-2026-11-20.spec.js`) ;
//   · de l'essai « (d) et (e) » : les deux bulles devant l'exemple (« L'exemple étiqueté », « La grille, comprise par
//     l'application », une flèche par ligne). Ce que l'essai jugeait de la PAGE reste, sans parcours.
// L'essai (f) juge la ligne du geste de `js/materiel-aide.js` : il entre par la carte de la page, « Ta grille, pas à
// pas », qui la porte (la bulle 5 du parcours neuf ne la porte pas).
// Grille de l'exemple : celle de l'application, fictive. Aucun nom d'étudiant·e.
import { test, expect } from '@playwright/test';
import { ouvrirEspaceVide, bulle } from './harness/classe-de-banc.js';
import { boutonExemple, ouvrirLaCarteDeLaPage } from './harness/ouverture-evaluer.js';

const norm = (t) => String(t).replace(/[\u00a0\u202f]/g, ' ');

test('(a) et (e) l’exemple étiqueté, sur la page : ses sections, ses mots, ce qu’il n’écrit pas', async ({ page }) => {
    test.setTimeout(120000);
    await page.addInitScript(() => {
        try { if (!localStorage.getItem('laboCodex.vue')) localStorage.setItem('laboCodex.vue', 'etendue'); } catch (e) { /* rien */ }
    });
    await ouvrirEspaceVide(page, 1180, { hauteur: 820 });
    await page.evaluate(() => naviguerVers('conception', 'materiel'));
    await expect(page.locator('#materiel-accueil')).toBeVisible();
    await expect(bulle(page)).toHaveCount(0);   // l'interrupteur est éteint à la première arrivée : ni carte ni parcours
    const avant = await page.evaluate(() => JSON.stringify([db.getSync(cle('brouillonDissection'), null), db.getSync(cle('grillesTemplates'), [])]));
    await boutonExemple(page, 'complet').click();
    await expect(page.locator('#materiel-dissection')).toBeVisible();

    // Les sections de l'exemple s'appellent « SECTION », comme l'étiquette (elles s'appelaient « PARTIE A », « PARTIE B »).
    await expect(page.locator('#dissection-contenu')).toContainText('SECTION A : COMPRÉHENSION');
    await expect(page.locator('#dissection-contenu')).not.toContainText('PARTIE A');
    expect(await page.evaluate(() => { const e = window.materielDissection.etatCourant(); return Object.keys(e.liens).length === e.morceaux.ordre.length; }), 'tout est étiqueté, sections comprises').toBe(true);
    // Les deux rangées « SECTION » sont lues comme des sections, pas comme des critères (break-test du 14 nov. : la
    // reconnaissance restée sur « PARTIE » donnait six critères).
    expect(await page.evaluate(() => window.materielDissection.comprise().criteres.length)).toBe(4);
    // (a) Ce que l'écran donne à lire ne dit plus « morceau » ; « Sous-total » parle d'un groupe de critères.
    const ecran = await page.evaluate(() => document.getElementById('conception-materiel').innerText + ' ' + [...document.querySelectorAll('#dissection-palette [aria-label]')].map((b) => b.getAttribute('aria-label')).join(' '));
    expect(ecran).not.toMatch(/morceau/i);
    expect(ecran).toContain('Le total d’un groupe de critères');
    // (e) La page ne dit qu'UNE fois que l'exemple ne s'enregistre pas : en bas, près du nom.
    expect((ecran.match(/ne s’enregistre pas/g) || []).length).toBe(0);
    expect((ecran.match(/il ne devient pas une de tes grilles/g) || []).length).toBe(1);

    // (e) La grille comprise par l'application, amenée devant soi : elle et son résumé sont à l'écran.
    await page.evaluate(() => document.querySelector('#materiel-dissection .dissection-resultat').scrollIntoView({ block: 'start' }));
    const cibles = await page.evaluate(() => ['dissection-comprise', 'dissection-constats', 'dissection-creer-choix'].filter((id) => {
        const e = document.getElementById(id), r = e ? e.getBoundingClientRect() : null;
        return !!r && r.height > 0 && r.bottom > 0 && r.top < window.innerHeight;
    }));
    expect(cibles, 'la grille comprise et son résumé sont à l’écran').toEqual(expect.arrayContaining(['dissection-comprise', 'dissection-constats']));
    if (cibles.includes('dissection-creer-choix')) await expect(page.locator('#dissection-creer-choix')).toContainText('des niveaux de performance');

    // Rien n'a été écrit ; « Quitter l'exemple » (sur la page) ramène à l'accueil.
    expect(await page.evaluate(() => JSON.stringify([db.getSync(cle('brouillonDissection'), null), db.getSync(cle('grillesTemplates'), [])]))).toBe(avant);
    await page.locator('#materiel-dissection [data-action="materielDissection.collerAutre"]').click();
    await expect(page.locator('#materiel-accueil')).toBeVisible();
    await expect(page.locator('#materiel-dissection')).toBeHidden();
});

test('(f) « L’exemple est étiqueté » ne s’affiche jamais tant que des parties restent sans étiquette', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirLaCarteDeLaPage(page, 1180, 820);   // 20 nov. 2026 : par la carte de la page, plus par le parcours
    await boutonExemple(page, 'exercice').click();
    await expect(page.locator('#materiel-dissection')).toBeVisible();
    const geste = async () => norm(await bulle(page).locator('.parcours-bulle-geste').textContent());
    const FAIT = "L'exemple est étiqueté : touche « Quitter l'exemple ».";

    // Ce que Grégoire a fait le 14 nov. : le nom, UN critère, UN descripteur et UNE valeur de points. L'application
    // sait alors lire une grille (l'aide rend « prêt »), et la carte disait déjà « L'exemple est étiqueté ».
    const poser = (type, texte) => page.evaluate(([t, tx]) => {
        const b = document.querySelector('#dissection-palette .dissection-etiquette[data-type="' + t + '"]');
        if (b.getAttribute('aria-pressed') !== 'true') b.click();
        const m = [...document.querySelectorAll('#dissection-contenu .dissection-morceau')].find((x) => x.textContent === tx);
        m.scrollIntoView({ block: 'center', inline: 'center' });
        const r = m.getBoundingClientRect();
        const o = { bubbles: true, cancelable: true, pointerId: 3, pointerType: 'mouse', isPrimary: true, clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 };
        m.dispatchEvent(new PointerEvent('pointerdown', o));
        m.dispatchEvent(new PointerEvent('pointerup', o));
    }, [type, texte]);
    const etatDeLAide = () => page.evaluate(() => ({ sorte: window.materielDissection.aide().sorte, reste: window.materielDissection.comprise().sansEtiquette }));
    expect(await geste()).not.toBe(FAIT);
    await poser('titre', 'Journal de lecture');
    expect(await geste()).not.toBe(FAIT);
    await poser('critere', 'L’étudiant·e résume l’œuvre avec justesse');
    expect(await geste()).not.toBe(FAIT);
    await poser('descripteur', 'Résume quelques événements');
    expect(await geste()).not.toBe(FAIT);
    await poser('points', '2');
    const a = await etatDeLAide();
    expect(a.sorte, 'le cas vécu : après ces quatre étiquettes, l’aide de la lecture rend « prêt »').toMatch(/^pret/);
    expect(a.reste, 'et presque toutes les parties restent sans étiquette').toBeGreaterThan(30);
    await expect.poll(geste).toBe('Il reste ' + a.reste + ' parties sans étiquette : pose une étiquette sur chacune.');
    expect(await geste()).not.toBe(FAIT);
});
