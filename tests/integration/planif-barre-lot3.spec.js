import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// BARRE DE LA CARTE D'ALIGNEMENT — lot 3 du chantier de la carte, 9 oct. 2026
// (décisions de Grégoire, une icône à la fois : `PLAN-2026-10-08-chantier-carte-
// alignement.md`, section « Lot 3 »).
//
// Ce que ce banc tient :
//   1. la barre : plus aucune icône seule ; « Consulter la bibliothèque » à
//      gauche ; « Actions ▾ » réduit à ses huit commandes ;
//   2. chaque commande déplacée marche à son nouvel endroit et n'existe plus à
//      l'ancien (Bibliothèque : importer un fichier, importer d'un autre
//      trimestre, exporter, dupliquer, supprimer ; « Vue » : longue-vue, zoom) ;
//   3. « Inspecteur » sans sélection dit sa phrase ;
//   4. « Rétablir » grisé, puis actif après « Annuler » ;
//   5. la longue-vue est ronde, ouverte par le menu et par L.
//
// Noms fictifs : « Bloc Alpha », « Carte Zêta »… aucun élève.

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource/i
];
const estErreurAttendue = (msg) => patternsAttendus.some((re) => re.test(msg));

async function ouvrirCarte(page, { reponsePrompt = null } = {}) {
    const erreurs = [];
    page.on('pageerror', (e) => {
        const m = `pageerror: ${e.message}`;
        if (!estErreurAttendue(m)) erreurs.push(m);
    });
    page.on('dialog', (d) => {
        if (d.type() === 'prompt' && reponsePrompt !== null) d.accept(reponsePrompt).catch(() => {});
        else d.dismiss().catch(() => {});
    });
    page.setDefaultTimeout(15000);

    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => window.dbReady === true, null, { timeout: 20000 });
    await page.waitForTimeout(800);
    await page.evaluate(() => window.naviguerVers('conception', 'carte'));
    await page.waitForTimeout(1200);

    await page.evaluate(() => {
        window.planificationCarte.injecterNoeuds([
            { id: 'b3_a', type: 'activite', titre: 'Bloc Alpha', x: 600, y: 300 },
            { id: 'b3_b', type: 'activite', titre: 'Bloc Bêta', x: 900, y: 300 },
            { id: 'b3_c', type: 'activite', titre: 'Bloc Gamma', x: 1200, y: 600 }
        ]);
    });
    await page.waitForTimeout(500);
    await page.evaluate(() => { document.getElementById('transition-bandeau')?.remove(); });
    return erreurs;
}

const etat = (page, fn) => page.evaluate(fn);
const nbNoeuds = (page) => etat(page, () => window.planificationCarte.etat.noeuds.size);
const indexCartes = (page) => etat(page, () => JSON.parse(JSON.stringify(window.planificationDonnees.getIndex())));

async function selectionner(page, id) {
    await page.evaluate((nid) => {
        const api = window.planificationCarte;
        api.etat.multiSelection.clear();
        api.etat.selection = nid;
        document.getElementById(nid)?.classList.add('selected');
        document.activeElement && document.activeElement.blur && document.activeElement.blur();
    }, id);
}

/** Ouvre le menu « ⋮ » d'une carte de la Bibliothèque et rend ses libellés. */
async function ouvrirMenuCarte(page, carteId) {
    const declencheur = page.locator(`.biblio-menu-trigger[data-param="biblio-menu-${carteId}"]`);
    await declencheur.click();
    const menu = page.locator(`#biblio-menu-${carteId}`);
    await expect(menu).toBeVisible();
    return menu;
}

// ─── 1. La barre ─────────────────────────────────────────────────────────

test('la barre : de gauche à droite, des mots seulement ; plus d’icône seule ni d’indicateur « 100% »', async ({ page }) => {
    const erreurs = await ouvrirCarte(page);
    const barre = await page.evaluate(() => {
        const t = document.querySelector('.planif-header-toolbar');
        const visibles = Array.from(t.querySelectorAll('button, select, input'))
            .filter((el) => el.offsetParent !== null && !el.closest('.planif-actions-dropdown'));
        return visibles.map((el) => ({
            id: el.id,
            texte: el.tagName === 'BUTTON' ? el.textContent.trim() : el.tagName
        }));
    });
    expect(barre.map((b) => b.id)).toEqual([
        'planif-btn-bibliotheque', 'planif-liste-cartes', 'planif-btn-actions',
        'planif-btn-annuler', 'planif-btn-retablir', 'planif-recherche-champ',
        'planif-btn-palette-noeuds', 'planif-btn-palette-planificateur', 'planif-btn-vue',
        'planif-palette-inspecteur-btn', 'planif-palette-aide-btn'
    ]);
    // Aucun bouton visible de la barre n'est une image sans mot.
    for (const b of barre) expect(b.texte.length, b.id).toBeGreaterThan(0);
    expect(barre.find((b) => b.id === 'planif-btn-bibliotheque').texte).toBe('Consulter la bibliothèque');
    expect(barre.find((b) => b.id === 'planif-palette-inspecteur-btn').texte).toBe('Inspecteur');
    expect(barre.find((b) => b.id === 'planif-palette-aide-btn').texte).toBe('Guide');
    await expect(page.locator('#planif-palette-inspecteur-btn img, #planif-palette-aide-btn img')).toHaveCount(0);

    for (const ancien of ['#planif-btn-loupe', '#planif-zoom-info-header', '#planif-zoom-info',
        '#planif-palette-bibliotheque-btn', '#planif-fichier-import', '#planif-import-tri-panel']) {
        await expect(page.locator(ancien), ancien).toHaveCount(0);
    }
    expect(erreurs).toEqual([]);
});

test('« Actions ▾ » garde ses huit commandes ; les cinq de gestion des cartes en sont sorties', async ({ page }) => {
    const erreurs = await ouvrirCarte(page);
    await page.click('#planif-btn-actions');
    const items = await page.$$eval('#planif-actions-dropdown .planif-action-item', (els) => els.map((e) => e.textContent.trim()));
    expect(items).toEqual([
        'Nouvelle carte', 'Renommer cette carte', 'Cours rattaché…', 'Nettoyer les repères de semaine…',
        expect.stringMatching(/Liens : contourner les blocs$/), 'Décloner la sélection', 'Exporter le plan…', 'Télécharger un modèle…'
    ]);
    for (const ancien of ['#planif-btn-dupliquer-carte', '#planif-btn-importer-carte', '#planif-btn-import-trimestre',
        '#planif-btn-exporter-carte', '#planif-btn-supprimer-carte']) {
        await expect(page.locator(ancien), ancien).toHaveCount(0);
    }
    expect(erreurs).toEqual([]);
});

// ─── 2. La Bibliothèque, lieu de gestion des cartes ──────────────────────

test('« Consulter la bibliothèque » ouvre la Bibliothèque ; le menu ⋮ d’une carte offre Dupliquer, Exporter, Supprimer', async ({ page }) => {
    const erreurs = await ouvrirCarte(page);
    const actif = (await indexCartes(page)).active;
    await page.click('#planif-btn-bibliotheque');
    await expect(page.locator('#modalBibliothequeAlignements')).toBeVisible();
    const menu = await ouvrirMenuCarte(page, actif);
    await expect(menu.locator('.biblio-menu-item')).toHaveText(['Dupliquer', 'Exporter', 'Supprimer']);
    expect(erreurs).toEqual([]);
});

test('Bibliothèque ▸ ⋮ ▸ Dupliquer : une copie, l’original intact', async ({ page }) => {
    const erreurs = await ouvrirCarte(page, { reponsePrompt: 'Carte Zêta (copie)' });
    const avant = await indexCartes(page);
    const original = await etat(page, () => {
        window.planificationCarte.sauvegarder && window.planificationCarte.sauvegarder();
        const id = window.planificationDonnees.getIndex().active;
        return { id, json: JSON.stringify(window.planificationDonnees.chargerCarte(id)) };
    });

    await page.click('#planif-btn-bibliotheque');
    const menu = await ouvrirMenuCarte(page, original.id);
    await menu.locator('.biblio-menu-item', { hasText: 'Dupliquer' }).click();
    await page.waitForTimeout(500);

    const apres = await indexCartes(page);
    expect(apres.cartes.length).toBe(avant.cartes.length + 1);
    const copie = apres.cartes.find((c) => c.id === apres.active);
    expect(copie.id).not.toBe(original.id);
    expect(copie.nom).toBe('Carte Zêta (copie)');
    const contenus = await etat(page, () => {
        const idx = window.planificationDonnees.getIndex();
        return { copie: window.planificationDonnees.chargerCarte(idx.active) };
    });
    expect(contenus.copie.noeuds.map((n) => n.titre)).toEqual(expect.arrayContaining(['Bloc Alpha', 'Bloc Bêta', 'Bloc Gamma']));
    // L'original n'a pas bougé d'un octet.
    expect(await page.evaluate((id) => JSON.stringify(window.planificationDonnees.chargerCarte(id)), original.id)).toBe(original.json);
    // La carte affichée est la copie.
    expect(await page.$eval('#planif-liste-cartes', (s) => s.value)).toBe(copie.id);
    expect(erreurs).toEqual([]);
});

test('Bibliothèque ▸ Importer une carte (JSON) : la carte du fichier entre dans le trimestre actif', async ({ page }) => {
    const erreurs = await ouvrirCarte(page);
    const avant = await indexCartes(page);
    await page.click('#planif-btn-bibliotheque');
    const fichier = {
        nom: 'Carte Êta importée',
        compteur: 2, compteurLiens: 0,
        noeuds: [
            { id: 'planif-imp_1', type: 'activite', titre: 'Bloc Thêta', x: 100, y: 100, enfants: [], parent: null },
            { id: 'planif-imp_2', type: 'connaissance', titre: 'Bloc Iota', x: 300, y: 100, enfants: [], parent: null }
        ],
        liens: []
    };
    await page.setInputFiles('#biblio-alignements-fichier-import', {
        name: 'nom-du-fichier.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(fichier))
    });
    await page.waitForTimeout(600);
    const apres = await indexCartes(page);
    expect(apres.cartes.length).toBe(avant.cartes.length + 1);
    const entree = apres.cartes.find((c) => c.id === apres.active);
    // Le nom inscrit dans le fichier passe avant celui du fichier, comme avant le lot 3.
    expect(entree.nom).toBe('Carte Êta importée');
    const titres = await etat(page, () => Array.from(window.planificationCarte.etat.noeuds.values()).map((n) => n.titre + ':' + n.type));
    // L'ancien type « connaissance » est migré au chargement (factuelle).
    expect(titres.sort()).toEqual(['Bloc Iota:factuelle', 'Bloc Thêta:activite']);
    expect(erreurs).toEqual([]);
});

test('Bibliothèque ▸ ⋮ ▸ Exporter : un fichier JSON de la carte', async ({ page }) => {
    const erreurs = await ouvrirCarte(page);
    await page.evaluate(() => { window.demanderMetadonneesEnrichies = async () => ({ nom: 'Auteur fictif' }); });
    const actif = (await indexCartes(page)).active;
    await page.click('#planif-btn-bibliotheque');
    const menu = await ouvrirMenuCarte(page, actif);
    const [telechargement] = await Promise.all([
        page.waitForEvent('download'),
        menu.locator('.biblio-menu-item', { hasText: 'Exporter' }).click()
    ]);
    expect(telechargement.suggestedFilename()).toMatch(/\.json$/);
    expect(erreurs).toEqual([]);
});

test('Bibliothèque ▸ ⋮ ▸ Supprimer : la carte quitte le trimestre actif', async ({ page }) => {
    const erreurs = await ouvrirCarte(page, { reponsePrompt: 'Carte Kappa à supprimer' });
    // Une seconde carte d'abord : la dernière carte ne se supprime pas.
    await page.evaluate(() => window.planificationCarte.dupliquerCarte(window.planificationDonnees.getIndex().active));
    await page.waitForTimeout(300);
    const avant = await indexCartes(page);
    const cible = avant.cartes.find((c) => c.nom === 'Carte Kappa à supprimer');
    expect(cible).toBeTruthy();
    // Le codex et la question ne sont pas l'objet de l'essai (bancs #1007).
    await page.evaluate(() => {
        if (window.Codex) window.Codex.proposerAvantSuppression = async () => true;
        window.uiDialogues.confirmerAction = async () => true;
    });
    await page.click('#planif-btn-bibliotheque');
    const menu = await ouvrirMenuCarte(page, cible.id);
    await menu.locator('.biblio-menu-item', { hasText: 'Supprimer' }).click();
    await page.waitForTimeout(500);
    const apres = await indexCartes(page);
    expect(apres.cartes.length).toBe(avant.cartes.length - 1);
    expect(apres.cartes.some((c) => c.id === cible.id)).toBe(false);
    expect(erreurs).toEqual([]);
});

// L'import d'un autre trimestre vers le trimestre actif est tenu par
// planif-toolbar.spec.js (« import inter-trimestre »), passé par la Bibliothèque.

// ─── 3. Inspecteur ───────────────────────────────────────────────────────

test('« Inspecteur » sans bloc sélectionné dit « Sélectionne un bloc pour l’inspecter. » ; avec un bloc, il l’ouvre', async ({ page }) => {
    const erreurs = await ouvrirCarte(page);
    await page.evaluate(() => {
        const api = window.planificationCarte;
        api.etat.selection = null;
        api.etat.multiSelection.clear();
    });
    await page.click('#planif-palette-inspecteur-btn');
    await expect(page.locator('.planif-toast-lien').last()).toHaveText('Sélectionne un bloc pour l’inspecter.');
    expect(await etat(page, () => window.planificationCarte.etat.panneauOuvert)).toBeFalsy();

    await selectionner(page, 'b3_a');
    await page.click('#planif-palette-inspecteur-btn');
    await page.waitForTimeout(200);
    expect(await etat(page, () => window.planificationCarte.etat.panneauOuvert)).toBeTruthy();
    expect(erreurs).toEqual([]);
});

// ─── 4. Zoom ─────────────────────────────────────────────────────────────

const NIVEAUX = [['100\u00A0%', 1], ['75\u00A0%', 0.75], ['50\u00A0%', 0.5], ['25\u00A0%', 0.25]];   // #1137 : l'insécable avant « % »

/** Referme le menu « Vue » par son bouton (Échap ne le referme que si le focus y est). */
async function fermerMenuVue(page) {
    if (await page.locator('#planif-vue-dropdown').isVisible()) await page.click('#planif-btn-vue');
    await expect(page.locator('#planif-vue-dropdown')).toBeHidden();
}

/** Le point de carte au centre de la vue, en coordonnées d'espace. */
const centreVue = (page) => page.evaluate(() => {
    const z = document.getElementById('planif-zone-travail');
    const zoom = window.planificationCarte.etat.zoom;
    return { x: (z.clientWidth / 2 + z.scrollLeft) / zoom, y: (z.clientHeight / 2 + z.scrollTop) / zoom };
});

test('Vue ▸ Zoom : les quatre niveaux, le niveau en cours coché, le centre de la vue gardé', async ({ page }) => {
    const erreurs = await ouvrirCarte(page);
    // Un point de départ hors niveau, défilé au milieu de la carte.
    await page.evaluate(() => {
        const api = window.planificationCarte;
        api.zoomerAuNiveau(0.6);
        const z = document.getElementById('planif-zone-travail');
        z.scrollLeft = 900; z.scrollTop = 500;
    });
    await page.click('#planif-btn-vue');
    await expect(page.locator('.planif-vue-zoom[aria-checked="true"]')).toHaveCount(0);
    await fermerMenuVue(page);

    for (const [libelle, valeur] of NIVEAUX) {
        const avant = await centreVue(page);
        await page.click('#planif-btn-vue');
        await page.locator('.planif-vue-zoom', { hasText: libelle }).click();
        await page.waitForTimeout(150);
        expect(await etat(page, () => window.planificationCarte.etat.zoom)).toBeCloseTo(valeur, 6);
        const apres = await centreVue(page);
        // Le centre peut buter sur un bord de défilement ; au milieu de la carte, il tient.
        // L'écart se mesure en pixels d'ÉCRAN : à 25 %, un pixel de défilement arrondi
        // vaut 4 unités de carte.
        expect(Math.abs(apres.x - avant.x) * valeur, libelle + ' x').toBeLessThan(2);
        expect(Math.abs(apres.y - avant.y) * valeur, libelle + ' y').toBeLessThan(2);
        await page.click('#planif-btn-vue');
        const coches = await page.$$eval('.planif-vue-zoom[aria-checked="true"]', (els) => els.map((e) => e.textContent.trim()));
        expect(coches).toEqual([libelle]);
        await fermerMenuVue(page);
    }

    // Entre deux niveaux : aucune coche.
    await page.keyboard.press('ControlOrMeta+Equal');
    await page.waitForTimeout(150);
    await page.click('#planif-btn-vue');
    await expect(page.locator('.planif-vue-zoom[aria-checked="true"]')).toHaveCount(0);
    expect(erreurs).toEqual([]);
});

// ─── 5. Rétablir ─────────────────────────────────────────────────────────

test('« Rétablir » : grisé, actif après « Annuler », il refait le geste, puis se grise', async ({ page }) => {
    const erreurs = await ouvrirCarte(page);
    const retablir = page.locator('#planif-btn-retablir');
    await expect(retablir).toBeDisabled();
    await expect(retablir).toHaveText('Rétablir');

    const n0 = await nbNoeuds(page);
    await selectionner(page, 'b3_a');
    await page.keyboard.press('Delete');
    await page.waitForTimeout(150);
    expect(await nbNoeuds(page)).toBe(n0 - 1);
    await expect(retablir).toBeDisabled();

    await page.click('#planif-btn-annuler');
    await page.waitForTimeout(200);
    expect(await nbNoeuds(page)).toBe(n0);
    await expect(retablir).toBeEnabled();

    await retablir.click();
    await page.waitForTimeout(200);
    expect(await nbNoeuds(page)).toBe(n0 - 1);
    await expect(retablir).toBeDisabled();

    // Un geste neuf après une annulation vide ce qui était à rétablir.
    await page.click('#planif-btn-annuler');
    await page.waitForTimeout(200);
    await expect(retablir).toBeEnabled();
    await selectionner(page, 'b3_b');
    await page.keyboard.press('Delete');
    await page.waitForTimeout(150);
    await expect(retablir).toBeDisabled();
    expect(erreurs).toEqual([]);
});

// ─── 6. Longue-vue ───────────────────────────────────────────────────────

test('Vue ▸ Longue-vue : ronde, cochée ; L la referme et la rouvre', async ({ page }) => {
    const erreurs = await ouvrirCarte(page);
    await page.click('#planif-btn-vue');
    await page.click('#planif-vue-tout-voir');
    await page.waitForTimeout(300);
    await page.click('#planif-btn-vue');
    await expect(page.locator('#planif-vue-longue-vue')).toHaveText(/^Longue-vue/);
    await page.click('#planif-vue-longue-vue');
    expect(await etat(page, () => window.planificationCarte.etat.loupeActive)).toBe(true);
    await expect(page.locator('#planif-vue-longue-vue')).toHaveAttribute('aria-pressed', 'true');

    // Le pointeur dans la carte fait paraître le cadre : un cercle de 300 px.
    const zt = await page.locator('#planif-zone-travail').boundingBox();
    await page.mouse.move(zt.x + zt.width / 2, zt.y + zt.height / 2);
    await page.waitForTimeout(200);
    const cadre = await page.evaluate(() => {
        const el = document.getElementById('planif-loupe');
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return { rayon: cs.borderTopLeftRadius, l: Math.round(r.width), h: Math.round(r.height), affiche: cs.display };
    });
    expect(cadre.affiche).toBe('block');
    expect(cadre.l).toBe(cadre.h);
    expect(cadre.l).toBe(300);
    expect(cadre.rayon).toBe('50%');

    await page.keyboard.press('l');
    expect(await etat(page, () => window.planificationCarte.etat.loupeActive)).toBe(false);
    await expect(page.locator('#planif-vue-longue-vue')).toHaveAttribute('aria-pressed', 'false');
    await page.keyboard.press('L');
    expect(await etat(page, () => window.planificationCarte.etat.loupeActive)).toBe(true);
    await page.keyboard.press('Escape');
    expect(await etat(page, () => window.planificationCarte.etat.loupeActive)).toBe(false);

    // Le mot « loupe » ne nomme plus l'outil nulle part à l'écran.
    const raccourcis = await etat(page, () => window.planificationCarte.RACCOURCIS_CARTE.map((r) => r.libelle).join(' | '));
    expect(raccourcis).toContain('Longue-vue : lire sans changer le zoom');
    expect(raccourcis.toLowerCase()).not.toContain('loupe');
    expect(erreurs).toEqual([]);
});

// ─── 7. Au doigt : toute la barre à 44 px, chaque rangée d'une seule hauteur ─
// Relecture de Cowork du lot 3 (9 oct. 2026) : règle du projet, zones de toucher
// d'au moins 44 px sur l'iPad. Le select natif ignore `min-height` sous WebKit
// (21 px mesurés) : c'est lui que cet essai a d'abord fait rougir.

for (const [nom, viewport] of [['paysage', { width: 1180, height: 820 }], ['portrait', { width: 820, height: 1180 }]]) {
    test.describe(`iPad ${nom}`, () => {
        test.use({ viewport, hasTouch: true, isMobile: true });

        test(`au doigt (${nom}) : chaque commande de la barre fait au moins 44 px, et ses voisins de rangée la même hauteur`, async ({ page }) => {
            const erreurs = await ouvrirCarte(page);
            const mesure = await page.evaluate(() => {
                const t = document.querySelector('.planif-header-toolbar');
                const ctrl = Array.from(t.querySelectorAll('button, select'))
                    .filter((e) => e.offsetParent !== null && !e.hidden && !e.closest('.planif-actions-dropdown')
                        && !e.closest('.planif-recherche-resultats') && !e.closest('.planif-toolbar-recherche'));
                const boites = ctrl.map((e) => { const r = e.getBoundingClientRect(); return { id: e.id, h: Math.round(r.height), centre: (r.top + r.bottom) / 2 }; });
                return {
                    grossier: matchMedia('(pointer: coarse)').matches,
                    petites: boites.filter((b) => b.h < 44).map((b) => b.id + ':' + b.h),
                    hauteurs: [...new Set(boites.map((b) => b.h))],
                    nb: boites.length
                };
            });
            expect(mesure.grossier).toBe(true);
            expect(mesure.nb).toBe(10);
            expect(mesure.petites).toEqual([]);
            expect(mesure.hauteurs).toEqual([44]);
            expect(erreurs).toEqual([]);
        });
    });
}
