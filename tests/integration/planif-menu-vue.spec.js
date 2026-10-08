import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// MENU « VUE » DE LA CARTE D'ALIGNEMENT — lot 1 du chantier de la carte,
// 8 oct. 2026 (décisions de Grégoire : plan `PLAN-2026-10-08-chantier-carte-
// alignement.md`, mesure du lot 0 `MESURE-2026-10-08-barre-carte-alignement.md`).
//
// Deux familles d'essais :
//   1. le menu lui-même : ordre des commandes, commandes qui agissent, fond qui
//      s'applique ET se garde, maniement au clavier ;
//   2. UN ESSAI PAR RACCOURCI AFFICHÉ. La table ESSAIS_RACCOURCIS est tenue
//      contre `RACCOURCIS_CARTE` (la source de la liste affichée) : une ligne
//      ajoutée au menu sans son essai fait échouer « chaque raccourci affiché a
//      son essai ». Demande de Grégoire : « chaque raccourci décrit doit
//      fonctionner ».
//
// ⚠ Ce banc dispatche les touches DANS la page. Il ne voit pas un raccourci
// que le navigateur prend avant elle (⌘1 changeait d'onglet) : c'est la porte
// terrain du lot, dans Chrome et Safari, au vrai clavier.
//
// Noms fictifs : « Bloc Alpha », « Bloc Bêta »… aucun élève.

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource/i
];
const estErreurAttendue = (msg) => patternsAttendus.some((re) => re.test(msg));

async function ouvrirCarte(page) {
    const erreurs = [];
    page.on('pageerror', (e) => {
        const m = `pageerror: ${e.message}`;
        if (!estErreurAttendue(m)) erreurs.push(m);
    });
    page.on('dialog', (d) => d.dismiss().catch(() => {}));
    page.setDefaultTimeout(15000);

    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => window.dbReady === true, null, { timeout: 20000 });
    await page.waitForTimeout(800);
    await page.evaluate(() => window.naviguerVers('conception', 'carte'));
    await page.waitForTimeout(1200);

    await page.evaluate(() => {
        window.planificationCarte.injecterNoeuds([
            { id: 'mv_a', type: 'activite', titre: 'Bloc Alpha', x: 600, y: 300 },
            { id: 'mv_b', type: 'activite', titre: 'Bloc Bêta', x: 900, y: 300 },
            { id: 'mv_c', type: 'activite', titre: 'Bloc Gamma', x: 1200, y: 300 },
            { id: 'mv_l', type: 'lecon', titre: 'Leçon Delta', x: 600, y: 700, enfants: ['mv_e'] },
            { id: 'mv_e', type: 'evaluation', titre: 'Évaluation Epsilon', x: 630, y: 780, parent: 'mv_l' }
        ]);
    });
    await page.waitForTimeout(500);
    // Le popup du mode démo ou un bandeau peuvent couvrir le bas de l'écran.
    await page.evaluate(() => { document.getElementById('transition-bandeau')?.remove(); });
    return erreurs;
}

// Téléporte un nœud (et ses enfants) vers un point VISIBLE de la zone de
// travail — idiome de planif-drag-pointer-148.spec.js.
async function teleporter(page, id, ecranX, ecranY) {
    await page.evaluate((args) => {
        const zone = document.getElementById('planif-zone-travail');
        const el = document.getElementById(args.id);
        const zr = zone.getBoundingClientRect();
        const r = el.getBoundingClientRect();
        const api = window.planificationCarte;
        const zoom = api.etat.zoom || 1;
        const dx = ((zr.x + args.ecranX) - r.x) / zoom;
        const dy = ((zr.y + args.ecranY) - r.y) / zoom;
        const bouger = (nid) => {
            const nd = api.etat.noeuds.get(nid);
            if (!nd) return;
            nd.x += dx; nd.y += dy;
            const nel = document.getElementById(nid);
            if (nel) { nel.style.left = nd.x + 'px'; nel.style.top = nd.y + 'px'; }
            (nd.enfants || []).forEach(bouger);
        };
        bouger(args.id);
    }, { id, ecranX, ecranY });
    await page.waitForTimeout(150);
}

const etat = (page, fn) => page.evaluate(fn);
const nbNoeuds = (page) => etat(page, () => window.planificationCarte.etat.noeuds.size);
const zoom = (page) => etat(page, () => window.planificationCarte.etat.zoom);
const idsNoeuds = (page) => etat(page, () => Array.from(window.planificationCarte.etat.noeuds.keys()));

/** Sélection simple posée par l'état (la sélection n'est pas l'objet de l'essai). */
async function selectionner(page, id) {
    await page.evaluate((nid) => {
        const api = window.planificationCarte;
        api.etat.multiSelection.clear();
        api.etat.selection = nid;
        document.getElementById(nid)?.classList.add('selected');
        document.activeElement && document.activeElement.blur && document.activeElement.blur();
    }, id);
}

/** Défile au coin haut gauche ; rend la position obtenue en recentrant par la fonction. */
async function defilementRecentreAttendu(page) {
    return page.evaluate(() => {
        const zone = document.getElementById('planif-zone-travail');
        zone.scrollLeft = 0; zone.scrollTop = 0;
        window.planificationCarte.centrerVueSurContenu();
        const attendu = { x: zone.scrollLeft, y: zone.scrollTop };
        zone.scrollLeft = 0; zone.scrollTop = 0;
        return attendu;
    });
}
const defilement = (page) => page.evaluate(() => {
    const zone = document.getElementById('planif-zone-travail');
    return { x: zone.scrollLeft, y: zone.scrollTop };
});

/** Glisse un bloc par sa prise ⠿, d'un pas de (dx, dy) en dix mouvements. */
async function glisserParLaPrise(page, id, dx, dy) {
    const prise = await page.locator('#' + id + ' .planif-noeud-prise').boundingBox();
    expect(prise, 'prise ⠿ de ' + id).not.toBeNull();
    const px = prise.x + prise.width / 2;
    const py = prise.y + prise.height / 2;
    await page.mouse.move(px, py);
    await page.mouse.down();
    for (let i = 1; i <= 10; i++) {
        await page.mouse.move(px + dx * i / 10, py + dy * i / 10);
        await page.waitForTimeout(30);
    }
    await page.mouse.up();
    await page.waitForTimeout(300);
}

async function centreDe(page, id) {
    const b = await page.locator('#' + id).boundingBox();
    return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
}

/** Point du fond de la zone de travail, loin de tout bloc téléporté. */
async function pointDuFond(page, ecranX, ecranY) {
    const zr = await page.locator('#planif-zone-travail').boundingBox();
    return { x: zr.x + ecranX, y: zr.y + ecranY };
}

async function chercher(page, terme) {
    await page.fill('#planif-recherche-champ', terme);
    await page.waitForTimeout(300);
}
const courantRecherche = (page) => etat(page, () => window.planificationCarte.etatRecherche.courant);

// ─────────────────────────────────────────────────────────────────────────
// UN ESSAI PAR RACCOURCI — clé = `id` de RACCOURCIS_CARTE.
// ─────────────────────────────────────────────────────────────────────────
const ESSAIS_RACCOURCIS = {
    'recentrer': async (page) => {
        const attendu = await defilementRecentreAttendu(page);
        expect(attendu.x + attendu.y, 'la carte doit pouvoir défiler').toBeGreaterThan(0);
        await page.keyboard.press('r');
        await page.waitForTimeout(150);
        expect(await defilement(page)).toEqual(attendu);
        // Clause par clause : R majuscule (verrou des majuscules) recentre aussi.
        await page.evaluate(() => { const z = document.getElementById('planif-zone-travail'); z.scrollLeft = 0; z.scrollTop = 0; });
        await page.keyboard.press('R');
        await page.waitForTimeout(150);
        expect(await defilement(page)).toEqual(attendu);
    },
    'loupe': async (page) => {
        await page.keyboard.press('l');
        await page.waitForTimeout(200);
        expect(await etat(page, () => window.planificationCarte.etat.loupeActive)).toBe(true);
        await page.keyboard.press('Escape');
    },
    'zoom-avant-arriere': async (page) => {
        const z0 = await zoom(page);
        await page.keyboard.press('ControlOrMeta+Equal');
        await page.waitForTimeout(150);
        const z1 = await zoom(page);
        expect(z1).toBeGreaterThan(z0);
        await page.keyboard.press('ControlOrMeta+Minus');
        await page.keyboard.press('ControlOrMeta+Minus');
        await page.waitForTimeout(150);
        expect(await zoom(page)).toBeLessThan(z0);
    },
    'zoom-100': async (page) => {
        await page.keyboard.press('ControlOrMeta+Minus');
        await page.waitForTimeout(150);
        expect(await zoom(page)).not.toBe(1);
        await page.keyboard.press('ControlOrMeta+0');
        await page.waitForTimeout(150);
        expect(await zoom(page)).toBe(1);
        // « carte recentrée » : la position est celle du recentrage.
        const apres = await defilement(page);
        const attendu = await page.evaluate(() => {
            const zone = document.getElementById('planif-zone-travail');
            window.planificationCarte.centrerVueSurContenu();
            return { x: zone.scrollLeft, y: zone.scrollTop };
        });
        expect(apres).toEqual(attendu);
    },
    'zoom-molette': async (page) => {
        const z0 = await zoom(page);
        const p = await pointDuFond(page, 200, 200);
        await page.mouse.move(p.x, p.y);
        await page.keyboard.down('Control');
        await page.mouse.wheel(0, -200);
        await page.keyboard.up('Control');
        await page.waitForTimeout(300);
        expect(await zoom(page)).toBeGreaterThan(z0);
    },
    'tout-selectionner': async (page) => {
        await page.keyboard.press('ControlOrMeta+a');
        await page.waitForTimeout(100);
        const r = await etat(page, () => ({
            sel: window.planificationCarte.etat.multiSelection.size,
            tous: window.planificationCarte.etat.noeuds.size
        }));
        expect(r.sel).toBe(r.tous);
        expect(r.tous).toBeGreaterThan(1);
    },
    'multi-selection': async (page) => {
        await teleporter(page, 'mv_a', 200, 120);
        await teleporter(page, 'mv_b', 480, 120);
        const a = await page.locator('#mv_a .planif-noeud-prise').boundingBox();
        const b = await page.locator('#mv_b .planif-noeud-prise').boundingBox();
        await page.mouse.click(a.x + a.width / 2, a.y + a.height / 2);
        await page.keyboard.down('Meta');
        await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
        await page.keyboard.up('Meta');
        await page.waitForTimeout(150);
        const sel = await etat(page, () => Array.from(window.planificationCarte.etat.multiSelection).sort());
        expect(sel).toEqual(['mv_a', 'mv_b']);
    },
    'selection-zone': async (page) => {
        // Le lasso part du FOND, à droite de la palette « Nœuds » (≈ 12-193 px).
        await teleporter(page, 'mv_a', 300, 140);
        await teleporter(page, 'mv_b', 520, 140);
        const debut = await pointDuFond(page, 260, 90);
        const ca = await centreDe(page, 'mv_b');
        await page.mouse.move(debut.x, debut.y);
        await page.mouse.down();
        for (let i = 1; i <= 8; i++) {
            await page.mouse.move(debut.x + (ca.x + 120 - debut.x) * i / 8, debut.y + (ca.y + 60 - debut.y) * i / 8);
            await page.waitForTimeout(20);
        }
        await page.mouse.up();
        await page.waitForTimeout(150);
        const sel = await etat(page, () => Array.from(window.planificationCarte.etat.multiSelection));
        expect(sel).toEqual(expect.arrayContaining(['mv_a', 'mv_b']));
    },
    'glisser': async (page) => {
        // Un bloc seul.
        await teleporter(page, 'mv_c', 700, 150);
        const xc = await etat(page, () => window.planificationCarte.etat.noeuds.get('mv_c').x);
        await glisserParLaPrise(page, 'mv_c', 120, 0);
        expect(await etat(page, () => window.planificationCarte.etat.noeuds.get('mv_c').x)).toBeGreaterThan(xc + 60);
        // Le cadre d'une leçon emporte son contenu.
        // ⚠ La zone commence vers 490 px dans une fenêtre de 720 : tout se
        // joue dans les 230 px du haut, hors de la palette « Nœuds » (≈ 12-193 px).
        await teleporter(page, 'mv_l', 300, 10);
        const avant = await etat(page, () => ({
            l: window.planificationCarte.etat.noeuds.get('mv_l').x,
            e: window.planificationCarte.etat.noeuds.get('mv_e').x
        }));
        await glisserParLaPrise(page, 'mv_l', 120, 0);
        const apres = await etat(page, () => ({
            l: window.planificationCarte.etat.noeuds.get('mv_l').x,
            e: window.planificationCarte.etat.noeuds.get('mv_e').x
        }));
        expect(apres.l).toBeGreaterThan(avant.l + 60);
        expect(apres.e - avant.e).toBeCloseTo(apres.l - avant.l, 0);
    },
    'dupliquer': async (page) => {
        const avant = await idsNoeuds(page);
        await selectionner(page, 'mv_a');
        await page.keyboard.press('ControlOrMeta+d');
        await page.waitForTimeout(200);
        const nouveaux = (await idsNoeuds(page)).filter((i) => !avant.includes(i));
        expect(nouveaux.length).toBe(1);
        const src = await page.evaluate((id) => window.planificationCarte.etat.noeuds.get(id).cloneSourceId, nouveaux[0]);
        expect(src).toBeNull();
    },
    'dupliquer-clone': async (page) => {
        const avant = await idsNoeuds(page);
        await selectionner(page, 'mv_a');
        await page.keyboard.press('ControlOrMeta+Shift+d');
        await page.waitForTimeout(200);
        const nouveaux = (await idsNoeuds(page)).filter((i) => !avant.includes(i));
        expect(nouveaux.length).toBe(1);
        const src = await page.evaluate((id) => window.planificationCarte.etat.noeuds.get(id).cloneSourceId, nouveaux[0]);
        expect(src).toBe('mv_a');
    },
    'alt-glisser': async (page) => {
        await teleporter(page, 'mv_a', 200, 120);
        const avant = await idsNoeuds(page);
        await page.keyboard.down('Alt');
        await glisserParLaPrise(page, 'mv_a', 200, 0);
        await page.keyboard.up('Alt');
        const nouveaux = (await idsNoeuds(page)).filter((i) => !avant.includes(i));
        expect(nouveaux.length).toBe(1);
        const src = await page.evaluate((id) => window.planificationCarte.etat.noeuds.get(id).cloneSourceId, nouveaux[0]);
        expect(src).toBeNull();
    },
    'alt-glisser-clone': async (page) => {
        await teleporter(page, 'mv_a', 200, 120);
        const avant = await idsNoeuds(page);
        await page.keyboard.down('Shift');
        await page.keyboard.down('Alt');
        await glisserParLaPrise(page, 'mv_a', 200, 0);
        await page.keyboard.up('Alt');
        await page.keyboard.up('Shift');
        const nouveaux = (await idsNoeuds(page)).filter((i) => !avant.includes(i));
        expect(nouveaux.length).toBe(1);
        const src = await page.evaluate((id) => window.planificationCarte.etat.noeuds.get(id).cloneSourceId, nouveaux[0]);
        expect(src).toBe('mv_a');
    },
    'supprimer': async (page) => {
        const n0 = await nbNoeuds(page);
        await selectionner(page, 'mv_a');
        await page.keyboard.press('Delete');
        await page.waitForTimeout(150);
        expect(await nbNoeuds(page)).toBe(n0 - 1);
        await selectionner(page, 'mv_b');
        await page.keyboard.press('Backspace');
        await page.waitForTimeout(150);
        expect(await nbNoeuds(page)).toBe(n0 - 2);
    },
    'annuler': async (page) => {
        const n0 = await nbNoeuds(page);
        await selectionner(page, 'mv_a');
        await page.keyboard.press('Delete');
        await page.waitForTimeout(150);
        expect(await nbNoeuds(page)).toBe(n0 - 1);
        await page.keyboard.press('ControlOrMeta+z');
        await page.waitForTimeout(200);
        expect(await nbNoeuds(page)).toBe(n0);
    },
    'retablir': async (page) => {
        const n0 = await nbNoeuds(page);
        await selectionner(page, 'mv_a');
        await page.keyboard.press('Delete');
        await page.waitForTimeout(150);
        await page.keyboard.press('ControlOrMeta+z');
        await page.waitForTimeout(200);
        expect(await nbNoeuds(page)).toBe(n0);
        await page.keyboard.press('ControlOrMeta+Shift+z');
        await page.waitForTimeout(200);
        expect(await nbNoeuds(page)).toBe(n0 - 1);
        // Clause par clause : avec ⇧, un navigateur peut rendre 'Z' majuscule.
        await page.keyboard.press('ControlOrMeta+z');
        await page.waitForTimeout(200);
        expect(await nbNoeuds(page)).toBe(n0);
        await page.keyboard.press('ControlOrMeta+Shift+Z');
        await page.waitForTimeout(200);
        expect(await nbNoeuds(page)).toBe(n0 - 1);
    },
    'recherche-entree': async (page) => {
        await chercher(page, 'Bloc');
        expect(await etat(page, () => window.planificationCarte.etatRecherche.resultats.length)).toBe(3);
        await page.keyboard.press('Enter');
        expect(await courantRecherche(page)).toBe(0);
        await page.keyboard.press('Enter');
        expect(await courantRecherche(page)).toBe(1);
        await page.keyboard.press('Shift+Enter');
        expect(await courantRecherche(page)).toBe(0);
    },
    'recherche-fleches': async (page) => {
        await chercher(page, 'Bloc');
        await page.keyboard.press('ArrowDown');
        expect(await courantRecherche(page)).toBe(0);
        await page.keyboard.press('ArrowDown');
        expect(await courantRecherche(page)).toBe(1);
        await page.keyboard.press('ArrowUp');
        expect(await courantRecherche(page)).toBe(0);
    },
    'recherche-echap': async (page) => {
        await chercher(page, 'Bloc');
        await expect(page.locator('#planif-recherche-resultats')).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(page.locator('#planif-recherche-resultats')).toBeHidden();
        await expect(page.locator('#planif-recherche-champ')).toHaveValue('Bloc');
        await page.keyboard.press('Escape');
        await expect(page.locator('#planif-recherche-champ')).toHaveValue('');
    },
    'echap': async (page) => {
        // Loupe.
        await page.keyboard.press('l');
        await page.waitForTimeout(150);
        expect(await etat(page, () => window.planificationCarte.etat.loupeActive)).toBe(true);
        await page.keyboard.press('Escape');
        expect(await etat(page, () => window.planificationCarte.etat.loupeActive)).toBe(false);
        // Plein écran.
        await page.evaluate(() => window.planificationCarte.togglePleinEcran());
        await expect(page.locator('body')).toHaveClass(/planif-plein-ecran-actif/);
        await page.keyboard.press('Escape');
        await expect(page.locator('body')).not.toHaveClass(/planif-plein-ecran-actif/);
        // Désélection.
        await selectionner(page, 'mv_a');
        await page.keyboard.press('Escape');
        expect(await etat(page, () => window.planificationCarte.etat.selection)).toBeNull();
    }
};

test('chaque raccourci affiché a son essai, et chaque essai son raccourci affiché', async ({ page }) => {
    const erreurs = await ouvrirCarte(page);
    await page.click('#planif-btn-vue');
    const affiches = await page.$$eval('#planif-vue-raccourcis tr', (trs) => trs.map((t) => t.dataset.raccourci));
    const source = await etat(page, () => window.planificationCarte.RACCOURCIS_CARTE.map((r) => r.id));
    expect(affiches).toEqual(source);
    expect(affiches.length).toBeGreaterThan(0);
    expect([...affiches].sort()).toEqual(Object.keys(ESSAIS_RACCOURCIS).sort());
    // Sur Mac (la cible WebKit est « Desktop Safari ») : ⌘, et plus ⌘1.
    const touches = await page.$$eval('#planif-vue-raccourcis kbd', (ks) => ks.map((k) => k.textContent));
    expect(touches).toContain('⌘A');
    expect(touches.join(' ')).not.toContain('⌘1');
    expect(erreurs).toEqual([]);
});

for (const id of Object.keys(ESSAIS_RACCOURCIS)) {
    test(`raccourci « ${id} » : il fait ce que le menu « Vue » annonce`, async ({ page }) => {
        const erreurs = await ouvrirCarte(page);
        await ESSAIS_RACCOURCIS[id](page);
        expect(erreurs).toEqual([]);
    });
}

test('menu « Vue » : trois commandes dans l’ordre, puis le fond, puis les raccourcis ; l’ancienne barre a disparu', async ({ page }) => {
    const erreurs = await ouvrirCarte(page);
    const dd = page.locator('#planif-vue-dropdown');
    await expect(dd).toBeHidden();
    await page.click('#planif-btn-vue');
    await expect(dd).toBeVisible();
    await expect(page.locator('#planif-btn-vue')).toHaveAttribute('aria-expanded', 'true');

    const ordre = await page.evaluate(() => {
        const d = document.getElementById('planif-vue-dropdown');
        return Array.from(d.querySelectorAll('.planif-action-item, .actions-sous-titre, #planif-vue-raccourcis'))
            .map((el) => el.id === 'planif-vue-raccourcis' ? '[raccourcis]' : el.childNodes[0].textContent.trim());
    });
    expect(ordre).toEqual(['Vue plein écran', 'Recentrer la carte', 'Tout voir', 'Fond du canevas', 'Raccourcis clavier', '[raccourcis]']);
    await expect(page.locator('#planif-fond-swatches .travaux-fond-swatch')).toHaveCount(12);

    for (const ancien of ['#planif-btn-plein-ecran', '#planif-btn-recentrer', '#planif-btn-tout-voir',
        '#planif-btn-fond', '#planif-fond-dropdown', '#planif-palette-raccourcis-btn', '#planif-raccourcis-panel']) {
        await expect(page.locator(ancien), ancien).toHaveCount(0);
    }
    expect(erreurs).toEqual([]);
});

test('« Vue plein écran » entre et sort, la coche dit l’état', async ({ page }) => {
    const erreurs = await ouvrirCarte(page);
    await page.click('#planif-btn-vue');
    await page.click('#planif-vue-plein-ecran');
    await expect(page.locator('body')).toHaveClass(/planif-plein-ecran-actif/);
    await expect(page.locator('#planif-vue-dropdown')).toBeHidden();
    await expect(page.locator('#planif-vue-plein-ecran')).toHaveAttribute('aria-pressed', 'true');
    await page.click('#planif-btn-vue');
    await page.click('#planif-vue-plein-ecran');
    await expect(page.locator('body')).not.toHaveClass(/planif-plein-ecran-actif/);
    await expect(page.locator('#planif-vue-plein-ecran')).toHaveAttribute('aria-pressed', 'false');
    expect(erreurs).toEqual([]);
});

test('« Recentrer la carte » recentre (une fois, sans changer le zoom)', async ({ page }) => {
    const erreurs = await ouvrirCarte(page);
    const z0 = await zoom(page);
    const attendu = await defilementRecentreAttendu(page);
    await page.click('#planif-btn-vue');
    await page.click('#planif-vue-recentrer');
    await page.waitForTimeout(150);
    expect(await defilement(page)).toEqual(attendu);
    expect(await zoom(page)).toBe(z0);
    expect(erreurs).toEqual([]);
});

test('« Tout voir » ajuste le zoom pour tout montrer', async ({ page }) => {
    const erreurs = await ouvrirCarte(page);
    // Un bloc très loin : la carte ne tient plus à 100 %.
    await page.evaluate(() => window.planificationCarte.injecterNoeuds([
        { id: 'mv_loin', type: 'activite', titre: 'Bloc Lointain', x: 6000, y: 4000 }
    ]));
    await page.waitForTimeout(300);
    expect(await zoom(page)).toBe(1);
    await page.click('#planif-btn-vue');
    await page.click('#planif-vue-tout-voir');
    await page.waitForTimeout(200);
    expect(await zoom(page)).toBeLessThan(1);
    expect(erreurs).toEqual([]);
});

test('la couleur de fond choisie dans le menu s’applique et se garde au rechargement', async ({ page }) => {
    const erreurs = await ouvrirCarte(page);
    try {
        await page.click('#planif-btn-vue');
        await page.click('#planif-fond-swatches [data-fond="#1a2744"]');
        await expect(page.locator('#planif-vue-dropdown')).toBeHidden();
        const fond = () => page.evaluate(() => getComputedStyle(document.getElementById('planif-zone-wrapper')).backgroundColor);
        expect(await fond()).toBe('rgb(26, 39, 68)');

        await page.reload();
        await page.waitForFunction(() => window.dbReady === true, null, { timeout: 20000 });
        await page.waitForTimeout(800);
        await page.evaluate(() => window.naviguerVers('conception', 'carte'));
        await page.waitForTimeout(800);
        expect(await fond()).toBe('rgb(26, 39, 68)');
    } finally {
        // L'origine file:// est partagée par tous les specs : rendre le défaut.
        await page.evaluate(() => window.db.setSync('planif-fond-canvas', ''));
    }
    expect(erreurs).toEqual([]);
});

test('au clavier : Entrée ouvre et entre dans le menu, les flèches y circulent, Échap le ferme sans rien désélectionner', async ({ page }) => {
    const erreurs = await ouvrirCarte(page);
    await selectionner(page, 'mv_a');
    await page.focus('#planif-btn-vue');
    await page.keyboard.press('Enter');
    await expect(page.locator('#planif-vue-dropdown')).toBeVisible();
    await expect(page.locator('#planif-vue-plein-ecran')).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(page.locator('#planif-vue-recentrer')).toBeFocused();
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowUp');
    // Le dernier bouton du menu : la dernière pastille.
    await expect(page.locator('#planif-fond-swatches .travaux-fond-swatch').last()).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.locator('#planif-vue-dropdown')).toBeHidden();
    await expect(page.locator('#planif-btn-vue')).toBeFocused();
    await expect(page.locator('#planif-btn-vue')).toHaveAttribute('aria-expanded', 'false');
    expect(await etat(page, () => window.planificationCarte.etat.selection)).toBe('mv_a');
    expect(erreurs).toEqual([]);
});

test('le bouton « Annuler » annonce ⌘Z sur un Mac, plus « Ctrl+Z »', async ({ page }) => {
    const erreurs = await ouvrirCarte(page);
    await expect(page.locator('#planif-btn-annuler')).toHaveAttribute('title', 'Annuler (⌘Z)');
    expect(erreurs).toEqual([]);
});
