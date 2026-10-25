import { test, expect } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');
// Captures pour Grégoire (Mac) : CAPTURES_1154=<dossier> pour les écrire ; sans elle, l'essai est sauté.
const dossierCaptures = process.env.CAPTURES_1154 || null;

// ═══════════════════════════════════════════════════════════════════════════════════════════
// #1154 (25 oct. 2026) — LA BIBLIOTHÈQUE DES GRILLES EN DEUX COLONNES (lot 1 du plan du 24 oct.).
// Consigne : plans de travail/CONSIGNE-LOT-2026-10-24-bibliotheques-deux-colonnes-1.md, § 5.
//
// Dans le vrai index.html, depuis la démonstration, par le vrai bouton « Consulter la bibliothèque »
// de Conception › Grilles de critères :
//   · les deux titres de colonne, mot pour mot ; plus aucun des quatre boutons du milieu ;
//     « Importer ou exporter ▾ » et ses entrées, chacune avec son action d'aujourd'hui ;
//   · les trois passages (← Utiliser, Garder →, Tout garder), et l'état calme qui les suit ;
//   · l'aperçu (nom → critères et total, `aria-expanded`) ; ⋮ (libellés → actions) ;
//   · ni puce d'identifiant ni badge de type sans doublon ; avec un doublon semé, la puce sur les
//     rangées que le bandeau nomme, et « Voir » qui y mène ;
//   · 44 px pour toutes les cibles ; le défilement et les aperçus ouverts survivent à un passage ;
//   · à 820 px, les panneaux empilés et les flèches ↓ ↑ ; Échap, menu d'abord, fenêtre ensuite.
// Noms fictifs. Contexte Playwright neuf à chaque essai.
//
// BREAK-TESTS (25 oct. 2026, chacun rougit puis l'original est remis) :
//   · titres : « Dans ta bibliothèque » → « Dans ta biblio » dans grilles.js  → « les deux titres » ROUGIT ;
//   · menu : action « exporterGrilles » → « exporterGrillesX »                 → « Importer ou exporter » ROUGIT ;
//   · passage : `dansBibliotheque: idsBibliotheque.has(...)` → `false`         → « Garder → puis Aussi » ROUGIT ;
//   · aperçu : `apercu.hidden = ouvert` → `apercu.hidden = true`               → « l'aperçu » ROUGIT ;
//   · ⋮ : action « retirerGrilleDeBibliotheque » → « supprimerGrilleDefinitivement » → « ⋮ » ROUGIT ;
//   · puce : `afficherId: idsNommes.has(...)` → `true`                         → « sans doublon » ROUGIT ;
//   · 44 px : `.biblio2-fenetre .biblio-menu-trigger { min-width/min-height }` retiré → « 44 px » ROUGIT ;
//   · défilement : `if (modal.classList.contains('biblio2-voile'))` → `if (false)` dans fermerModal
//     → « le défilement survit » ROUGIT ;
//   · 820 px : `@container biblio2-fenetre (max-width: 760px)` → `(max-width: 700px)` → « 820 » ROUGIT ;
//   · Échap : la branche `_fenetreDeuxColonnesAuPremierPlan` retirée du keydown → « Échap » ROUGIT ;
//   · dossiers : `_appliquerFiltreDossier(modal, select.value)` retiré de `choisirDossier` → « les dossiers » ROUGIT.
// L'essai « mesure : … exemplaire séparé » n'est pas une défense : il établit un fait (§ 1.2 de la consigne).
// ═══════════════════════════════════════════════════════════════════════════════════════════

const pause = (page, ms) => page.waitForTimeout(ms);
const SEL_FENETRE = '#modalBibliothequeGrilles';
const ANCIENS_BOUTONS = [
    'Ajouter mes grilles à la bibliothèque',
    'Exporter toutes mes grilles (JSON)',
    'Importer des grilles (JSON)',
    'Importer un partage (.lcz)'
];

async function ouvrirDemo(page, largeur, hauteur) {
    page.on('dialog', async (d) => { await d.accept(); });
    await page.setViewportSize({ width: largeur, height: hauteur });
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await pause(page, 1200);
    await page.evaluate(async () => { await window.activerModeDemo(); });
    await pause(page, 1500);
    await page.evaluate(() => naviguerVers('conception', 'grille-criteres'));
    await pause(page, 900);
}

/** Le geste réel : le bouton « Consulter la bibliothèque » de l'écran des grilles. */
async function ouvrirBibliotheque(page) {
    await page.locator('#conception-grille-criteres button[data-action="afficherBibliothequeGrilles"]').click();
    await expect(page.locator(SEL_FENETRE + ' .biblio2-fenetre')).toBeVisible();
}

const colonne = (page, cle) => page.locator(SEL_FENETRE + ' .biblio2-panneau--' + cle);
/** La rangée d'une colonne, par son nom (liste principale, hors « Partagés par des collègues »). */
const rangee = (page, cle, nom) => colonne(page, cle).locator('.biblio2-liste').first()
    .locator(':scope > .biblio2-rangee', { has: page.locator('.biblio2-rangee-nom', { hasText: nom }) });
const texteVisible = (loc) => loc.evaluate(e => e.innerText.replace(/\s+/g, ' ').trim());

test('les deux titres, mot pour mot ; les quatre boutons du milieu partis ; « Importer ou exporter ▾ » et ses actions', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirDemo(page, 1440, 900);
    await ouvrirBibliotheque(page);

    await expect(colonne(page, 'trimestre').locator('h3')).toHaveText(/^Dans ce trimestre \(\d+\)$/);
    await expect(colonne(page, 'bibliotheque').locator('h3')).toHaveText(/^Dans ta bibliothèque \(\d+\)$/);

    const libelles = await page.locator(SEL_FENETRE + ' button').evaluateAll(bs => bs.map(b => b.textContent.trim()));
    expect(libelles.length, 'la tranche des boutons n’est pas vide').toBeGreaterThan(10);
    for (const ancien of ANCIENS_BOUTONS) expect(libelles, ancien).not.toContain(ancien);

    // Le menu : ses entrées, dans l'ordre, et l'action que chacune porte.
    const declencheur = page.locator(SEL_FENETRE + ' .biblio2-btn-fichiers');
    await expect(declencheur).toHaveText('Importer ou exporter ▾');
    await declencheur.click();
    await expect(declencheur).toHaveAttribute('aria-expanded', 'true');
    const menu = page.locator(SEL_FENETRE + ' .biblio-menu-popover.actif');
    await expect(menu.locator('.biblio-menu-item')).toHaveText([
        'Importer des grilles',
        'Importer le partage d\'une ou d\'un collègue',
        'Exporter les grilles de ce trimestre'
    ]);
    await expect(menu.locator('.biblio-menu-separateur')).toHaveCount(1);
    await expect(menu.locator('.biblio-menu-note')).toHaveText('Fichiers .json et .lcz');

    // « Importer des grilles » : le sélecteur de fichier de l'import JSON d'aujourd'hui.
    const [selecteur] = await Promise.all([
        page.waitForEvent('filechooser'),
        menu.getByRole('menuitem', { name: 'Importer des grilles' }).click()
    ]);
    expect(await selecteur.element().getAttribute('id')).toBe('fichier-import-grilles-modal');
    expect(await selecteur.element().getAttribute('data-on-change')).toBe('importerGrilles');

    // Les deux autres : l'action d'aujourd'hui est appelée (témoins posés à la place).
    await page.evaluate(() => {
        window.__appels = [];
        window.partageImport.ouvrirSelecteurFichier = () => window.__appels.push('partageImport.ouvrirSelecteurFichier');
        window.exporterGrilles = () => window.__appels.push('exporterGrilles');
    });
    await declencheur.click();
    await menu.getByRole('menuitem', { name: /Importer le partage/ }).click();
    await declencheur.click();
    await menu.getByRole('menuitem', { name: 'Exporter les grilles de ce trimestre' }).click();
    expect(await page.evaluate(() => window.__appels)).toEqual(['partageImport.ouvrirSelecteurFichier', 'exporterGrilles']);
});

test('les passages : ← Utiliser, Garder →, Tout garder, et l’état calme qui les suit ; le défilement et les aperçus survivent', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirDemo(page, 1440, 760);
    await ouvrirBibliotheque(page);

    const nbTrimestre = await colonne(page, 'trimestre').locator('.biblio2-liste > .biblio2-rangee').count();
    expect(nbTrimestre).toBeGreaterThanOrEqual(3);

    // Des aperçus ouverts dans les deux colonnes, puis la dernière rangée de la bibliothèque sous les
    // yeux : la fenêtre a défilé.
    await rangee(page, 'trimestre', 'Grille-5 FR-HOLIS-20 H26').locator('.biblio2-rangee-nom').click();
    await rangee(page, 'trimestre', 'Grille-4').locator('.biblio2-rangee-nom').click();
    await rangee(page, 'bibliotheque', 'Grille analytique').locator('.biblio2-rangee-nom').click();
    await rangee(page, 'bibliotheque', 'Checklist de spécifications').locator('.biblio2-rangee-nom').click();
    const cible = rangee(page, 'bibliotheque', 'Grille par objectifs');
    await cible.locator('.biblio2-passage').scrollIntoViewIfNeeded();
    const avant = await page.locator(SEL_FENETRE + ' .biblio2-fenetre').evaluate(f => f.scrollTop);
    expect(avant, 'la fenêtre a défilé avant le passage').toBeGreaterThan(50);

    // ← Utiliser dans ce trimestre
    await expect(cible.locator('.biblio2-passage')).toHaveText('← Utiliser dans ce trimestre', { useInnerText: true });
    await cible.locator('.biblio2-passage').click();
    await expect(rangee(page, 'trimestre', 'Grille par objectifs')).toHaveCount(1);
    await expect(rangee(page, 'bibliotheque', 'Grille par objectifs').locator('.biblio2-etat')).toHaveText('✓ Déjà dans ce trimestre');
    await expect(rangee(page, 'bibliotheque', 'Grille par objectifs').locator('.biblio2-passage')).toHaveCount(0);
    const apres = await page.locator(SEL_FENETRE + ' .biblio2-fenetre').evaluate(f => f.scrollTop);
    expect(Math.abs(apres - avant), `le défilement survit (${avant} → ${apres})`).toBeLessThanOrEqual(2);
    await expect(rangee(page, 'trimestre', 'Grille-4').locator('.biblio2-rangee-nom')).toHaveAttribute('aria-expanded', 'true');
    await expect(rangee(page, 'trimestre', 'Grille-5 FR-HOLIS-20 H26').locator('.biblio2-apercu')).toBeVisible();
    await expect(rangee(page, 'bibliotheque', 'Grille analytique').locator('.biblio2-apercu')).toBeVisible();

    // Garder dans ma bibliothèque →
    const g4 = rangee(page, 'trimestre', 'Grille-4');
    await expect(g4.locator('.biblio2-passage')).toHaveText('Garder dans ma bibliothèque →', { useInnerText: true });
    await g4.locator('.biblio2-passage').click();
    await expect(rangee(page, 'trimestre', 'Grille-4').locator('.biblio2-etat')).toHaveText('✓ Aussi dans ta bibliothèque');
    await expect(rangee(page, 'bibliotheque', 'Grille-4').locator('.biblio2-etat')).toHaveText('✓ Déjà dans ce trimestre');
    const ecrite = await page.evaluate(() => (db.getSync('bibliothequeGrilles', []) || []).some(g => g.nom === 'Grille-4'));
    expect(ecrite, 'la grille est écrite dans la bibliothèque').toBe(true);

    // Tout garder dans ma bibliothèque : affiché tant qu'au moins deux grilles n'y sont pas.
    const toutGarder = colonne(page, 'trimestre').getByRole('button', { name: 'Tout garder dans ma bibliothèque' });
    await expect(toutGarder).toBeVisible();
    await toutGarder.click();
    await expect(colonne(page, 'trimestre').locator('.biblio2-liste > .biblio2-rangee .biblio2-passage')).toHaveCount(0);
    const etats = await colonne(page, 'trimestre').locator('.biblio2-liste > .biblio2-rangee .biblio2-etat').allTextContents();
    expect(etats.length).toBe(nbTrimestre + 1);
    for (const e of etats) expect(e).toBe('✓ Aussi dans ta bibliothèque');
    await expect(toutGarder).toHaveCount(0);
});

test('l’aperçu : le nom déplie les critères et le total ; aria-expanded suit', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirDemo(page, 1440, 900);
    await ouvrirBibliotheque(page);

    const r = rangee(page, 'trimestre', 'Grille-5 FR-HOLIS-20 H26');
    const nom = r.locator('.biblio2-rangee-nom');
    const apercu = r.locator('.biblio2-apercu');
    await expect(nom).toHaveAttribute('aria-expanded', 'false');
    await expect(apercu).toBeHidden();

    await nom.click();
    await expect(nom).toHaveAttribute('aria-expanded', 'true');
    await expect(apercu).toBeVisible();
    const nbCriteres = await page.evaluate(() => (db.getSync(cle('grillesTemplates'), []) || [])
        .find(g => g.nom === 'Grille-5 FR-HOLIS-20 H26').criteres.length);
    await expect(apercu.locator('tr:not(.biblio2-apercu-total)')).toHaveCount(nbCriteres);
    await expect(apercu.locator('tr:not(.biblio2-apercu-total) td.biblio2-apercu-type').first()).toHaveText('Holistique');
    await expect(apercu.locator('.biblio2-apercu-total')).toHaveText(/Total\s*\d+(,\d+)? %/);

    await nom.click();
    await expect(nom).toHaveAttribute('aria-expanded', 'false');
    await expect(apercu).toBeHidden();

    // La ligne en clair : les types en mots, « 5 critères », pas de « (s) ».
    await expect(r.locator('.biblio2-rangee-meta')).toHaveText(/^Holistique · \d+ critères/);
    await expect(rangee(page, 'trimestre', 'Grille-5 FR-ALGO-20 H26').locator('.biblio2-rangee-meta'))
        .toHaveText(/^Holistique et algorithmique · \d+ critères/);
});

test('⋮ : les libellés et leurs actions, rangée du trimestre et rangée de la bibliothèque', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirDemo(page, 1440, 900);
    await ouvrirBibliotheque(page);

    const ouvrirMenu = async (r) => {
        await r.locator('.biblio2-kebab').click();
        return r.locator('.biblio-menu-popover.actif');
    };

    const idG4 = await rangee(page, 'trimestre', 'Grille-4').getAttribute('data-biblio-item-id');
    let menu = await ouvrirMenu(rangee(page, 'trimestre', 'Grille-4'));
    await expect(menu.locator('.biblio-menu-item')).toHaveText(['Dupliquer', 'Exporter pour partager', 'Retirer de ce trimestre', 'Supprimer définitivement']);
    await expect(menu.locator('.biblio-menu-item--danger')).toHaveText(['Retirer de ce trimestre', 'Supprimer définitivement']);
    await page.keyboard.press('Escape');

    // Chaque libellé appelle l'action d'aujourd'hui, avec la bonne grille (témoins).
    await page.evaluate(() => {
        window.__appels = [];
        const temoin = (nom) => (...a) => window.__appels.push([nom, ...a]);
        window.dupliquerGrilleBibliotheque = temoin('dupliquerGrilleBibliotheque');
        window.partageExport.exporterPourPartager = temoin('exporterPourPartager');
        window.supprimerGrilleDefinitivement = temoin('supprimerGrilleDefinitivement');
        window.supprimerGrilleDeBibliothequePartagee = temoin('supprimerGrilleDeBibliothequePartagee');
    });
    for (const libelle of ['Dupliquer', 'Exporter pour partager', 'Supprimer définitivement']) {
        menu = await ouvrirMenu(rangee(page, 'trimestre', 'Grille-4'));
        await menu.getByRole('menuitem', { name: libelle, exact: true }).click();
    }
    const idAnalytique = await rangee(page, 'bibliotheque', 'Grille analytique').getAttribute('data-biblio-item-id');
    menu = await ouvrirMenu(rangee(page, 'bibliotheque', 'Grille analytique'));
    await expect(menu.locator('.biblio-menu-item')).toHaveText(['Supprimer de ma bibliothèque']);
    await expect(menu.locator('.biblio-menu-item--danger')).toHaveCount(1);
    await menu.getByRole('menuitem', { name: 'Supprimer de ma bibliothèque' }).click();
    expect(await page.evaluate(() => window.__appels)).toEqual([
        ['dupliquerGrilleBibliotheque', idG4],
        ['exporterPourPartager', 'grille', idG4],
        ['supprimerGrilleDefinitivement', idG4],
        ['supprimerGrilleDeBibliothequePartagee', idAnalytique]
    ]);

    // « Retirer de ce trimestre », pour de vrai : la grille quitte la colonne, ses données restent.
    menu = await ouvrirMenu(rangee(page, 'trimestre', 'Grille-4'));
    await menu.getByRole('menuitem', { name: 'Retirer de ce trimestre' }).click();
    await expect(rangee(page, 'trimestre', 'Grille-4')).toHaveCount(0);
    const stock = await page.evaluate((id) => (db.getSync(cle('grillesTemplates'), []) || []).find(g => g.id === id), idG4);
    expect(stock, 'les données de la grille restent').toBeTruthy();
    expect(stock.dansBibliotheque).toBe(false);
});

test('sans doublon, ni puce d’identifiant ni badge de type ; un doublon semé : la puce sur les rangées nommées, « Voir » y mène ; 44 px partout', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirDemo(page, 1440, 900);
    await ouvrirBibliotheque(page);

    const fen = page.locator(SEL_FENETRE);
    expect(await fen.locator('.biblio2-rangee').count(), 'la tranche des rangées n’est pas vide').toBeGreaterThanOrEqual(6);
    await expect(fen.locator('.biblio-doublons')).toHaveCount(0);
    await expect(fen.locator('.biblio-id-court')).toHaveCount(0);
    await expect(fen.locator('.badge-composition, .badge-type-pratique')).toHaveCount(0);
    // Les noms fictifs de la démo portent eux-mêmes « HOLIS » ou « ALGO » : on lit les lignes en clair.
    const lignes = await fen.locator('.biblio2-rangee-meta').allTextContents();
    expect(lignes.length).toBeGreaterThanOrEqual(6);
    for (const l of lignes) expect(l).not.toMatch(/\b(HOLIS|MIXTE|ALGO|ANALY)\b|\(s\)/);

    // Un homonyme fictif semé dans la bibliothèque, puis la fenêtre redessinée.
    await page.evaluate(async () => {
        const biblio = db.getSync('bibliothequeGrilles', []) || [];
        await db.set('bibliothequeGrilles', biblio.concat([{ id: 'GRILLE_HOMONYME_BANC', nom: 'Grille-4',
            criteres: [{ id: 'c1', nom: 'Critère fictif', type: 'holistique', ponderation: 100 }] }]));
        await afficherBibliothequeGrilles();
    });
    await expect(fen.locator('.biblio-doublons')).toHaveCount(1);
    const nommes = await fen.locator('.biblio-doublons .biblio-id-court').evaluateAll(cs => cs.map(c => c.getAttribute('title').replace('Identifiant complet : ', '')));
    expect(nommes.length).toBeGreaterThanOrEqual(2);
    const porteurs = await fen.locator('.biblio2-rangee .biblio-id-court').evaluateAll(cs => cs.map(c => c.closest('.biblio2-rangee').getAttribute('data-biblio-item-id')));
    expect(porteurs.length, 'la puce apparaît sur les rangées nommées').toBeGreaterThanOrEqual(2);
    for (const id of porteurs) expect(nommes).toContain(id);

    await fen.locator('.biblio-doublons [data-action="BibliothequeUI.voirItemDoublon"][data-param="GRILLE_HOMONYME_BANC"]').click();
    const visee = fen.locator('.biblio2-rangee[data-biblio-item-id="GRILLE_HOMONYME_BANC"]');
    await expect(visee).toHaveClass(/biblio-carte--pointee/);
    await expect(visee).toBeInViewport();

    // Toutes les cibles de la fenêtre (bandeau compris), puis celles d'un menu ouvert : 44 px au moins.
    const mesurer = () => page.evaluate((sel) => {
        const m = document.querySelector(sel);
        return [...m.querySelectorAll('button, select, summary, label, input[type="text"]')]
            .filter(e => e.getClientRects().length > 0)
            .map(e => {
                const b = e.getBoundingClientRect();
                return { t: (e.textContent.trim() || e.getAttribute('aria-label') || e.tagName).slice(0, 40), h: Math.round(b.height), w: Math.round(b.width) };
            });
    }, SEL_FENETRE);
    let cibles = await mesurer();
    expect(cibles.length, 'la tranche des cibles n’est pas vide').toBeGreaterThan(20);
    expect(cibles.filter(c => c.h < 44 || c.w < 44)).toEqual([]);
    await rangee(page, 'trimestre', 'Grille-4').locator('.biblio2-kebab').click();
    cibles = await mesurer();
    const items = cibles.filter(c => ['Dupliquer', 'Exporter pour partager'].includes(c.t));
    expect(items.length).toBe(2);
    expect(cibles.filter(c => c.h < 44 || c.w < 44)).toEqual([]);
});

test('à 820 px : les panneaux l’un sous l’autre, les flèches ↓ et ↑, 44 px', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirDemo(page, 820, 1180);
    await ouvrirBibliotheque(page);

    const bt = await colonne(page, 'trimestre').boundingBox();
    const bb = await colonne(page, 'bibliotheque').boundingBox();
    expect(bt.y + bt.height, '« Dans ce trimestre » d’abord').toBeLessThanOrEqual(bb.y + 1);
    expect(Math.abs(bt.x - bb.x)).toBeLessThanOrEqual(2);
    expect(Math.abs(bt.width - bb.width)).toBeLessThanOrEqual(2);

    expect(await texteVisible(rangee(page, 'trimestre', 'Grille-4').locator('.biblio2-passage'))).toBe('Garder dans ma bibliothèque ↓');
    expect(await texteVisible(rangee(page, 'bibliotheque', 'Grille analytique').locator('.biblio2-passage'))).toBe('↑ Utiliser dans ce trimestre');

    const petites = await page.evaluate((sel) => [...document.querySelector(sel).querySelectorAll('button, select, summary, label')]
        .filter(e => e.getClientRects().length > 0)
        .map(e => { const b = e.getBoundingClientRect(); return { t: e.textContent.trim().slice(0, 40), h: Math.round(b.height), w: Math.round(b.width) }; })
        .filter(c => c.h < 44 || c.w < 44), SEL_FENETRE);
    expect(petites).toEqual([]);
});

test('Échap ferme d’abord le menu ouvert, puis la fenêtre', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirDemo(page, 1440, 900);
    await ouvrirBibliotheque(page);

    await rangee(page, 'trimestre', 'Grille-4').locator('.biblio2-kebab').click();
    await expect(page.locator(SEL_FENETRE + ' .biblio-menu-popover.actif')).toHaveCount(1);
    await page.keyboard.press('Escape');
    await expect(page.locator(SEL_FENETRE + ' .biblio-menu-popover.actif')).toHaveCount(0);
    await expect(page.locator(SEL_FENETRE)).toHaveCount(1);
    await page.keyboard.press('Escape');
    await expect(page.locator(SEL_FENETRE)).toHaveCount(0);
});

test('les dossiers : « Gérer les dossiers… » ouvre la gestion, « Classer dans » range, le menu filtre', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirDemo(page, 1440, 900);
    await ouvrirBibliotheque(page);

    const zone = page.locator(SEL_FENETRE + ' .biblio2-dossiers');
    const menuDossiers = page.locator(SEL_FENETRE + ' .biblio2-barre select');
    await expect(zone).toBeHidden();
    await expect(page.locator(SEL_FENETRE + ' .biblio2-barre label')).toHaveText('Masquer ce qui est déjà dans ce trimestre');
    await menuDossiers.selectOption('__gerer__');
    await expect(zone).toBeVisible();
    await expect(menuDossiers).toHaveValue('__tous__');
    await zone.locator('#rep-grilles-nouveau-nom').fill('Dossier fictif');
    await zone.getByRole('button', { name: 'Créer le dossier' }).click();
    await expect(page.locator(SEL_FENETRE + ' .biblio2-barre select option', { hasText: 'Dossier fictif' })).toHaveCount(1);
    await expect(page.locator(SEL_FENETRE + ' .biblio2-dossiers')).toBeVisible();

    const r = rangee(page, 'bibliotheque', 'Grille analytique');
    await r.locator('.biblio2-kebab').click();
    await r.getByRole('menuitem', { name: 'Classer dans : Dossier fictif' }).click();
    await expect(rangee(page, 'bibliotheque', 'Grille analytique')).not.toHaveAttribute('data-dossier', '__nonclasse__');

    const idDossier = await page.evaluate(() => window.repertoiresBibliotheque.obtenir('grilles')[0].id);
    await page.locator(SEL_FENETRE + ' .biblio2-barre select').selectOption(idDossier);
    const visibles = () => colonne(page, 'bibliotheque').locator('.biblio2-liste').first().locator(':scope > .biblio2-rangee:visible .biblio2-rangee-nom');
    await expect(visibles()).toHaveText([/Grille analytique/]);
    await page.locator(SEL_FENETRE + ' .biblio2-barre select').selectOption('__nonclasse__');
    const restants = await visibles().allTextContents();
    expect(restants.length).toBeGreaterThanOrEqual(2);
    expect(restants.join('|')).not.toContain('Grille analytique');
});

test('mesure : garder une grille crée un exemplaire séparé (la phrase « Ce que tu y modifies… » dit vrai)', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirDemo(page, 1440, 900);
    await ouvrirBibliotheque(page);

    await rangee(page, 'trimestre', 'Grille-4').locator('.biblio2-passage').click();
    await expect(rangee(page, 'trimestre', 'Grille-4').locator('.biblio2-etat')).toHaveCount(1);
    const mesure = await page.evaluate(async () => {
        const id = (db.getSync(cle('grillesTemplates'), []) || []).find(g => g.nom === 'Grille-4').id;
        await db.modifier(cle('grillesTemplates'), (lues) => {
            const g = lues.find(x => x.id === id);
            g.nom = 'Grille-4 modifiée';
            g.criteres[0].nom = 'Critère modifié';
            return lues;
        }, []);
        const exemplaire = (db.getSync('bibliothequeGrilles', []) || []).find(g => g.id === id);
        return { nom: exemplaire.nom, critere: exemplaire.criteres[0].nom };
    });
    expect(mesure.nom).toBe('Grille-4');
    expect(mesure.critere).not.toBe('Critère modifié');
});

test('captures pour Grégoire : Mac 1440 clair et sombre (un aperçu et un ⋮ ouverts), iPad 820 clair', async ({ page }) => {
    test.skip(!dossierCaptures, 'CAPTURES_1154 non posée');
    test.setTimeout(120000);
    fs.mkdirSync(dossierCaptures, { recursive: true });
    await ouvrirDemo(page, 1440, 900);
    await ouvrirBibliotheque(page);
    await rangee(page, 'trimestre', 'Grille-5 FR-ALGO-20 H26').locator('.biblio2-rangee-nom').click();

    for (const sombre of [false, true]) {
        await page.evaluate((s) => document.body.classList.toggle('mode-clair', !s), sombre);
        await rangee(page, 'trimestre', 'Grille-4').locator('.biblio2-kebab').click();
        await pause(page, 300);
        await page.screenshot({ path: path.join(dossierCaptures, `mac-1440-${sombre ? 'sombre' : 'clair'}.png`) });
        await page.keyboard.press('Escape');
    }

    await page.evaluate(() => document.body.classList.toggle('mode-clair', true));
    await page.setViewportSize({ width: 820, height: 1180 });
    await pause(page, 400);
    await page.screenshot({ path: path.join(dossierCaptures, 'ipad-820-clair.png') });
});
