import { test, expect } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');
// Captures pour Grégoire (Mac) : CAPTURES_1158=<dossier> pour les écrire ; sans elle, l'essai est sauté.
const dossierCaptures = process.env.CAPTURES_1158 || null;

// ═══════════════════════════════════════════════════════════════════════════════════════════
// #1158 (25 oct. 2026) — LA BIBLIOTHÈQUE DES TAMPONS EN DEUX COLONNES (lot 5 du plan du 24 oct.).
// Consigne : plans de travail/CONSIGNE-LOT-2026-10-25-bibliotheques-deux-colonnes-5.md (et celles des
// lots 1 à 4).
//
// Dans le vrai index.html, depuis la démonstration, avec une copie fictive ouverte dans Annoter, par le
// vrai bouton de la bibliothèque au bas de la palette :
//   · « Dans ta palette » | « Dans ta bibliothèque », leurs phrases mot pour mot ; « Partager »,
//     « Ajouter », « Importer un fichier JSON », « Exporter la bibliothèque » et le sous-titre partis ;
//     « Importer ou exporter ▾ » : ses deux gestes, ses deux notes ;
//   · regroupés par catégorie dans les deux colonnes, sous l'intertitre de la catégorie ; ni anciens
//     tampons ni jetons dans la palette ;
//   · « Garder → » met le tampon dans la bibliothèque, sa rangée dit « ✓ Aussi dans ta bibliothèque » ;
//     un tampon intégré gardé dit « ✓ Déjà dans ta palette » dans la bibliothèque (§ 1.4) ;
//   · « ← Utiliser » le remet dans la palette : la colonne et la palette d'Annoter le montrent ;
//   · la ligne en clair (« Intégré », « par <auteur> ») ; l'aperçu (l'image du tampon, sinon sa
//     description ; une source étrangère n'affiche rien) ;
//   · ⋮ des rangées ; ⋮ de l'intertitre d'une catégorie : « Tout garder dans ma bibliothèque », « Exporter » ;
//   · à 820 px, empilées, ↓ et ↑, 44 px ;
//   · la gestion des tampons : la phrase de Grégoire sous « + Ajouter une catégorie », et ce bouton
//     ajoute une catégorie (il levait une erreur depuis #267).
// Noms fictifs. Contexte Playwright neuf à chaque essai.
//
// BREAK-TESTS (25 oct. 2026, chacun rougit puis l'original est remis) :
//   · titres : 'Dans ta palette' → 'Dans ce trimestre' → « les deux titres » ROUGIT ;
//   · regroupement : `groupe:` retiré des rangées de la bibliothèque → « regroupés » ROUGIT ;
//   · jetons : `&& a.categorie !== 'jeton'` retiré → « regroupés » ROUGIT ;
//   · état calme : `if (idsBiblio.has(t.id))` → `if (false)` → « Garder → » ROUGIT ;
//   · § 1.4 : `autocollants.forEach(… ids.add …)` retiré de `_idsPalette` → « Garder → » ROUGIT ;
//   · recharge : l'appel de `rechargerTamponsPersonnalises` retiré → « ← Utiliser » ROUGIT ;
//   · aperçu : `MOTIF_IMAGE_TAMPON.test(src) &&` → `true &&` → « la ligne en clair, l'aperçu » ROUGIT ;
//   · ⋮ de catégorie : `menusGroupe: data.menusGroupe` retiré → « ⋮ » ROUGIT ;
//   · gestion : la phrase retirée → « la gestion » ROUGIT ; l'ancien `querySelector('button')` remis →
//     « la gestion » ROUGIT.
// ═══════════════════════════════════════════════════════════════════════════════════════════

const pause = (page, ms) => page.waitForTimeout(ms);
const SEL = '#modalBibliothequeTampons';

/** La démonstration, puis une copie fictive ouverte dans Annoter (la démo n'en a pas) : la palette paraît. */
async function ouvrirAnnoter(page, largeur, hauteur) {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    page.on('dialog', async (d) => { await d.accept(); });
    await page.setViewportSize({ width: largeur, height: hauteur });
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await pause(page, 1200);
    await page.evaluate(async () => { await window.activerModeDemo(); });
    await pause(page, 1500);
    const productionId = await page.evaluate(() => {
        const etudiant = (db.getSync(cle('groupeEtudiants'), []) || [])[0];
        const production = (db.getSync(cle('productions'), []) || [])[0];
        const groupe = db.getSync('groupeCoursActif', null);
        const cours = db.getSync('infoCours', null);
        db.setSync(cle('fichiersTravaux'), [{ // security-ok: fixture littérale écrite par le banc, aucune source externe
            id: 'FT_BANC_1158', etudiantDA: etudiant.da, productionId: production.id, coursId: cours && cours.id,
            groupeCoursId: groupe && groupe.id, nomFichier: 'BANC_copie.png', typeMIME: 'image/png', tailleFichier: 70,
            nombrePages: 1, stockage: 'indexeddb', thumbnailDataUrl: '', dateImport: '2026-10-25T12:00:00.000Z',
            dateModification: '2026-10-25T12:00:00.000Z', source: 'import-local', importePar: 'single', statut: 'present'
        }]);
        const toile = document.createElement('canvas'); toile.width = 400; toile.height = 600;
        const ctx = toile.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 400, 600);
        const octets = Uint8Array.from(atob(toile.toDataURL('image/png').split(',')[1]), (c) => c.charCodeAt(0));
        const copie = new Blob([octets], { type: 'image/png' });
        const original = window.travauxStockage.recupererBlob;
        window.travauxStockage.recupererBlob = async function (id) { return id === 'FT_BANC_1158' ? copie : original.apply(this, arguments); };
        Codex.proposerAvantSuppression = async () => true;   // la fenêtre du codex (#1007) a ses propres bancs
        return production.id;
    });
    await page.evaluate(() => window.afficherSection('evaluations'));
    await pause(page, 1200);
    await page.evaluate((p) => window.executerActionEval({ value: 'annoter|FT_BANC_1158|' + p }), productionId);
    await expect(page.locator('#evaluations-annoter.sous-section.active')).toHaveCount(1);
    await expect(page.locator('[data-action="tamponsBibliotheque.afficherBibliothequeTampons"]')).toBeVisible();
    await page.evaluate(() => { document.getElementById('overlay-backup-reminder')?.remove(); document.getElementById('transition-bandeau')?.remove(); });
    return erreurs;
}

/** Le geste réel : le bouton de la bibliothèque, au bas de la palette d'Annoter. */
async function ouvrirBibliotheque(page) {
    await page.locator('[data-action="tamponsBibliotheque.afficherBibliothequeTampons"]').click();
    await expect(page.locator(SEL + ' .biblio2-fenetre')).toBeVisible();
    await page.mouse.move(5, 5);
}

const colonne = (page, cle) => page.locator(SEL + ' .biblio2-panneau--' + cle);
const rangees = (page, cle) => colonne(page, cle).locator('.biblio2-liste').first().locator(':scope > .biblio2-rangee');
// Le nom d'une rangée à aperçu commence par son chevron (▶).
const rangee = (page, cle, nom) => rangees(page, cle).filter({ has: page.locator('.biblio2-rangee-nom', { hasText: new RegExp('^▶?\\s*' + nom + '$') }) });
const nomSansChevron = (t) => t.replace(/^▶/, '').trim();
const intertitres = (page, cle) => colonne(page, cle).locator('.biblio2-groupe .biblio2-intertitre').allTextContents();
const texteVisible = (loc) => loc.evaluate(e => e.innerText.replace(/\s+/g, ' ').trim());
const ouvrirMenu = async (loc) => { await loc.locator('.biblio2-kebab').first().click(); return loc.locator('.biblio-menu-popover.actif'); };
const biblio = (page) => page.evaluate(() => db.getSync('bibliothequeTampons', []) || []);

/** Des tampons fictifs dans la bibliothèque. */
async function semerBibliotheque(page, items) {
    await page.evaluate(async (liste) => {
        const lues = db.getSync('bibliothequeTampons', []) || [];
        await db.set('bibliothequeTampons', lues.concat(liste));   // security-ok: fixture littérale écrite par le banc, aucune source externe
    }, items);
}
const tamponFictif = (id, nom, categorie, extra) => Object.assign({
    id, nom, categorie, fichier: '', imageBase64: '', custom: true, dansBibliotheque: true, dateAjoutBiblio: '2026-10-25T12:00:00.000Z'
}, extra || {});
/** Une petite image PNG fictive en base64. */
const pngFictif = (page) => page.evaluate(() => {
    const t = document.createElement('canvas'); t.width = 8; t.height = 8;
    const c = t.getContext('2d'); c.fillStyle = '#c00'; c.fillRect(0, 0, 8, 8);
    return t.toDataURL('image/png');
});

const cibles = (page) => page.evaluate((s) => [...document.querySelector(s).querySelectorAll('button, select, summary, label, input[type="text"]')]
    .filter(e => e.getClientRects().length > 0)
    .map(e => { const b = e.getBoundingClientRect(); return { t: (e.textContent.trim() || e.getAttribute('aria-label') || e.tagName).slice(0, 40), h: Math.round(b.height), w: Math.round(b.width) }; }), SEL);

// ─────────────────────────────────────────── 1 440 PX ───────────────────────────────────────────

test('les deux titres et leurs phrases, les boutons d’avant partis, « Importer ou exporter ▾ » et son action', async ({ page }) => {
    test.setTimeout(90000);
    const erreurs = await ouvrirAnnoter(page, 1440, 900);
    await ouvrirBibliotheque(page);

    const nbPalette = await page.evaluate(() => travauxOutils.obtenirAutocollants().filter(a => !a.legacy && a.categorie !== 'jeton').length);
    expect(nbPalette, 'la palette de la démo a des tampons').toBeGreaterThan(10);
    await expect(colonne(page, 'trimestre').locator('h3')).toHaveText(new RegExp('^Dans ta palette \\(' + nbPalette + '\\)$'));
    await expect(colonne(page, 'bibliotheque').locator('h3')).toHaveText(/^Dans ta bibliothèque \(0\)$/);
    await expect(colonne(page, 'trimestre').locator('.biblio2-phrase').first())
        .toHaveText('Les tampons de ta palette, dans Annoter, pour tous tes trimestres.');
    await expect(colonne(page, 'bibliotheque').locator('.biblio2-phrase').first())
        .toHaveText('Les tampons que tu gardes pour les retrouver ou les partager.');
    await expect(colonne(page, 'bibliotheque').locator('.biblio2-vide'))
        .toHaveText('Ta bibliothèque est vide. Garde-y un tampon de ta palette pour le retrouver plus tard.');

    const libelles = await page.locator(SEL + ' button').evaluateAll(bs => bs.map(b => b.textContent.trim()));
    expect(libelles.length, 'la tranche des boutons n’est pas vide').toBeGreaterThan(20);
    for (const ancien of ['Partager', 'Ajouter', 'Importer un fichier JSON', 'Exporter la bibliothèque']) expect(libelles, ancien).not.toContain(ancien);
    await expect(page.locator(SEL)).not.toContainText('Partagez et réutilisez');
    await expect(page.locator(SEL + ' .badge-source')).toHaveCount(0);

    const declencheur = page.locator(SEL + ' .biblio2-btn-fichiers');
    await expect(declencheur).toHaveText('Importer ou exporter ▾');
    await declencheur.click();
    const menu = page.locator(SEL + ' .biblio-menu-popover.actif');
    await expect(menu.locator('.biblio-menu-item')).toHaveText(['Importer des tampons', 'Exporter ta bibliothèque']);
    await expect(menu.locator('.biblio-menu-note')).toHaveText(['Fichiers .json', 'Assure-toi d\'avoir les droits sur les images importées.']);
    expect(await menu.locator('.biblio-menu-item').evaluateAll(bs => bs.map(b => b.getAttribute('data-action'))))
        .toEqual(['tamponsBiblioClickImport', 'tamponsBibliotheque.exporterBibliotheque']);
    const [selecteur] = await Promise.all([
        page.waitForEvent('filechooser'),
        menu.getByRole('menuitem', { name: 'Importer des tampons', exact: true }).click()
    ]);
    expect(await selecteur.element().getAttribute('id')).toBe('biblio-tampons-fichier-import');
    expect(await selecteur.element().getAttribute('data-on-change')).toBe('tamponsBiblioImporterFichier');
    expect(erreurs).toEqual([]);
});

test('regroupés par catégorie dans les deux colonnes, sous l’intertitre ; ni anciens tampons ni jetons', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirAnnoter(page, 1440, 900);
    await semerBibliotheque(page, [
        tamponFictif('TAMPON_BANC_1', 'Tampon fictif Alpha', 'observations'),
        tamponFictif('TAMPON_BANC_2', 'Tampon fictif Bêta', 'comprehension'),
        tamponFictif('TAMPON_BANC_3', 'Tampon fictif Gamma', 'observations'),
        tamponFictif('TAMPON_BANC_4', 'Tampon fictif Delta', 'categorie-inconnue')
    ]);
    await ouvrirBibliotheque(page);

    // La palette : les catégories dans l'ordre de la palette d'Annoter.
    const attendues = await page.evaluate(() => {
        const noms = travauxOutils.obtenirNomsCategories();
        const presentes = new Set(travauxOutils.obtenirAutocollants().filter(a => !a.legacy && a.categorie !== 'jeton').map(a => a.categorie));
        return travauxOutils.obtenirOrdreCategories().filter(c => presentes.has(c)).map(c => noms[c] || c);
    });
    expect(attendues.length).toBeGreaterThan(1);
    expect(await intertitres(page, 'trimestre')).toEqual(attendues);
    // Chaque rangée suit l'intertitre de sa catégorie (l'ordre du DOM).
    const sequence = await colonne(page, 'trimestre').locator('.biblio2-liste > li').evaluateAll(lis => lis.map(li =>
        li.classList.contains('biblio2-groupe') ? 'G:' + li.querySelector('.biblio2-intertitre').textContent.trim() : 'R:' + li.querySelector('.biblio2-rangee-nom').textContent.replace(/^▶/, '').trim()));
    const parCategorie = await page.evaluate(() => {
        const noms = travauxOutils.obtenirNomsCategories();
        const r = {};
        travauxOutils.obtenirAutocollants().filter(a => !a.legacy && a.categorie !== 'jeton')
            .forEach(a => { (r[noms[a.categorie] || a.categorie] = r[noms[a.categorie] || a.categorie] || []).push(a.nom); });
        return r;
    });
    let courant = null;
    for (const s of sequence) {
        if (s.startsWith('G:')) { courant = s.slice(2); continue; }
        expect(parCategorie[courant], s).toContain(s.slice(2));
    }
    // Ni anciens tampons, ni jetons (que la palette ne montre pas).
    const noms = (await rangees(page, 'trimestre').locator('.biblio2-rangee-nom').allTextContents()).map(nomSansChevron);
    expect(noms).toContain('Attention');
    for (const absent of ['Bien', 'Très bien', 'Jeton de délai', 'Jeton de reprise']) expect(noms, absent).not.toContain(absent);

    // La bibliothèque : groupée aussi, la catégorie inconnue de la palette en dernier.
    expect(await intertitres(page, 'bibliotheque')).toEqual(['Compréhension', 'Observations', 'categorie-inconnue']);
    expect((await rangees(page, 'bibliotheque').locator('.biblio2-rangee-nom').allTextContents()).map(nomSansChevron))
        .toEqual(['Tampon fictif Bêta', 'Tampon fictif Alpha', 'Tampon fictif Gamma', 'Tampon fictif Delta']);
    // Pas de ⋮ sur les intertitres de la bibliothèque.
    await expect(colonne(page, 'bibliotheque').locator('.biblio2-groupe .biblio2-kebab')).toHaveCount(0);
});

test('« Garder → » met le tampon dans la bibliothèque : « ✓ Aussi dans ta bibliothèque », et « ✓ Déjà dans ta palette » pour un tampon intégré', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirAnnoter(page, 1440, 900);
    await ouvrirBibliotheque(page);

    const cible = rangee(page, 'trimestre', 'Attention');
    await expect(cible).toHaveCount(1);
    expect(await texteVisible(cible.locator('.biblio2-passage'))).toBe('Garder dans ma bibliothèque →');
    await cible.locator('.biblio2-passage').click();

    await expect(rangee(page, 'trimestre', 'Attention').locator('.biblio2-etat')).toHaveText('✓ Aussi dans ta bibliothèque');
    await expect(rangee(page, 'trimestre', 'Attention').locator('.biblio2-passage')).toHaveCount(0);
    const gardes = await biblio(page);
    expect(gardes.map(t => t.id)).toEqual(['obs-attention']);
    // § 1.4 : un tampon intégré gardé est reconnu dans la palette, « ← Utiliser » n'est pas offert.
    await expect(rangee(page, 'bibliotheque', 'Attention').locator('.biblio2-etat')).toHaveText('✓ Déjà dans ta palette');
    await expect(rangee(page, 'bibliotheque', 'Attention').locator('.biblio2-passage')).toHaveCount(0);
    // Les autres rangées de la palette gardent leur passage.
    expect(await rangees(page, 'trimestre').locator('.biblio2-passage').count()).toBe(await rangees(page, 'trimestre').count() - 1);
});

test('« ← Utiliser » le remet dans la palette : la colonne et la palette d’Annoter le montrent', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirAnnoter(page, 1440, 900);
    await semerBibliotheque(page, [tamponFictif('TAMPON_BANC_1', 'Tampon fictif Alpha', 'observations')]);
    await ouvrirBibliotheque(page);

    await expect(rangee(page, 'trimestre', 'Tampon fictif Alpha')).toHaveCount(0);
    const passage = rangee(page, 'bibliotheque', 'Tampon fictif Alpha').locator('.biblio2-passage');
    expect(await texteVisible(passage)).toBe('← Utiliser dans ma palette');
    await passage.click();

    await expect(rangee(page, 'bibliotheque', 'Tampon fictif Alpha').locator('.biblio2-etat')).toHaveText('✓ Déjà dans ta palette');
    const dansPalette = rangee(page, 'trimestre', 'Tampon fictif Alpha');
    await expect(dansPalette).toHaveCount(1);
    await expect(dansPalette.locator('.biblio2-etat')).toHaveText('✓ Aussi dans ta bibliothèque');
    expect(await page.evaluate(() => (db.getSync('tamponsPersonnalises', []) || []).map(t => t.id))).toContain('TAMPON_BANC_1');
    // La palette d'Annoter, derrière la fenêtre, le porte aussi (sans recharger la page).
    expect(await page.evaluate(() => travauxOutils.obtenirAutocollants().some(a => a.id === 'TAMPON_BANC_1'))).toBe(true);
    const tamponDansAnnoter = (id) => page.locator('#annot-tampons-contenu, #travaux-palette-tampons')
        .locator('[data-action="travauxOutils.setAutocollantActif"][data-param="' + id + '"]');
    await expect(tamponDansAnnoter('obs-attention'), 'la palette des tampons d’Annoter est là').toHaveCount(1);
    await expect(tamponDansAnnoter('TAMPON_BANC_1')).toHaveCount(1);
});

test('la ligne en clair, l’aperçu : l’image du tampon, sinon sa description ; une source étrangère n’affiche rien', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirAnnoter(page, 1440, 900);
    const png = await pngFictif(page);
    const auteurActif = await page.evaluate(() => BibliothequeUI.obtenirAuteurActif());
    await semerBibliotheque(page, [
        tamponFictif('TAMPON_BANC_1', 'Tampon fictif Alpha', 'observations', { imageBase64: png, metadata_cc: { auteur_original: 'Autrice fictive' } }),
        tamponFictif('TAMPON_BANC_2', 'Tampon fictif Bêta', 'observations', { metadata_cc: { description_courte: 'Description fictive du tampon.', auteur_original: auteurActif } }),
        tamponFictif('TAMPON_BANC_3', 'Tampon fictif Gamma', 'observations', { imageBase64: 'https://exemple.invalid/tampon.png', metadata_cc: { description_courte: 'Tampon fictif Gamma' } }),
        tamponFictif('TAMPON_BANC_4', 'Tampon fictif Delta', 'observations', { custom: false, fichier: '../../index.html' })
    ]);
    await ouvrirBibliotheque(page);

    // La palette : « Intégré » pour un tampon de l'application ; son aperçu, l'image de la palette.
    const integre = rangee(page, 'trimestre', 'Attention');
    await expect(integre.locator('.biblio2-rangee-meta')).toHaveText('Intégré');
    await integre.locator('button.biblio2-rangee-nom').click();
    const image = integre.locator('.biblio2-apercu-image');
    await expect(image).toBeVisible();
    expect(await image.getAttribute('src')).toBe('autocollants/icons8-high-risk.svg');
    expect(await image.getAttribute('alt')).toBe('Attention');
    expect(await image.evaluate(i => i.complete && i.naturalWidth > 0), 'l’image est chargée').toBe(true);

    // La bibliothèque : « par <auteur> » sauf soi-même ; « Intégré » pour un tampon de l'application.
    await expect(rangee(page, 'bibliotheque', 'Tampon fictif Alpha').locator('.biblio2-rangee-meta')).toHaveText('par Autrice fictive');
    await expect(rangee(page, 'bibliotheque', 'Tampon fictif Bêta').locator('.biblio2-rangee-meta')).toHaveText('');
    await expect(rangee(page, 'bibliotheque', 'Tampon fictif Delta').locator('.biblio2-rangee-meta')).toHaveText('Intégré');
    // L'image en base64 ; sinon la description ; une source étrangère et une description qui répète le
    // nom : rien, le nom n'est pas un bouton.
    const alpha = rangee(page, 'bibliotheque', 'Tampon fictif Alpha');
    await alpha.locator('button.biblio2-rangee-nom').click();
    expect(await alpha.locator('.biblio2-apercu-image').getAttribute('src')).toBe(png);
    const beta = rangee(page, 'bibliotheque', 'Tampon fictif Bêta');
    await beta.locator('button.biblio2-rangee-nom').click();
    await expect(beta.locator('.biblio2-apercu-texte')).toHaveText('Description fictive du tampon.');
    await expect(beta.locator('.biblio2-apercu-image')).toHaveCount(0);
    for (const nom of ['Tampon fictif Gamma', 'Tampon fictif Delta']) {
        await expect(rangee(page, 'bibliotheque', nom).locator('p.biblio2-rangee-nom--fixe'), nom).toHaveCount(1);
        await expect(rangee(page, 'bibliotheque', nom).locator('.biblio2-apercu, img'), nom).toHaveCount(0);
    }
});

test('⋮ des rangées et de l’intertitre d’une catégorie : libellés et actions', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirAnnoter(page, 1440, 900);
    await semerBibliotheque(page, [tamponFictif('TAMPON_BANC_1', 'Tampon fictif Alpha', 'observations')]);
    await ouvrirBibliotheque(page);

    let menu = await ouvrirMenu(rangee(page, 'trimestre', 'Attention'));
    await expect(menu.locator('.biblio-menu-item')).toHaveText(['Exporter']);
    expect(await menu.locator('.biblio-menu-item').getAttribute('data-action')).toBe('tamponsBibliotheque.exporterUnTampon');
    await page.keyboard.press('Escape');

    menu = await ouvrirMenu(rangee(page, 'bibliotheque', 'Tampon fictif Alpha'));
    await expect(menu.locator('.biblio-menu-item')).toHaveText(['Supprimer de ma bibliothèque']);
    await expect(menu.locator('.biblio-menu-item--danger')).toHaveCount(1);
    await menu.getByRole('menuitem', { name: 'Supprimer de ma bibliothèque' }).click();
    await expect(rangee(page, 'bibliotheque', 'Tampon fictif Alpha')).toHaveCount(0);
    expect((await biblio(page)).some(t => t.id === 'TAMPON_BANC_1')).toBe(false);

    // L'intertitre « Observations » de la palette : « Tout garder » et « Exporter ».
    const intertitre = () => colonne(page, 'trimestre').locator('.biblio2-groupe').filter({ hasText: 'Observations' });
    menu = await ouvrirMenu(intertitre());
    await expect(menu.locator('.biblio-menu-item')).toHaveText(['Tout garder dans ma bibliothèque', 'Exporter']);
    expect(await menu.locator('.biblio-menu-item').evaluateAll(bs => bs.map(b => b.getAttribute('data-action') + '|' + b.getAttribute('data-param'))))
        .toEqual(['tamponsBibliotheque.partagerCategorie|observations', 'tamponsBibliotheque.exporterCategorie|observations']);
    await menu.getByRole('menuitem', { name: 'Tout garder dans ma bibliothèque' }).click();
    const observations = await page.evaluate(() => travauxOutils.obtenirAutocollants().filter(a => !a.legacy && a.categorie === 'observations').map(a => a.id));
    await expect.poll(async () => (await biblio(page)).map(t => t.id).sort()).toEqual(observations.slice().sort());
    // Tout est gardé : il ne reste qu'« Exporter ».
    menu = await ouvrirMenu(intertitre());
    await expect(menu.locator('.biblio-menu-item')).toHaveText(['Exporter']);
});

// ─────────────────────────────────────────── 820 PX ───────────────────────────────────────────

test('à 820 px : les panneaux l’un sous l’autre, les flèches ↓ et ↑, 44 px', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirAnnoter(page, 820, 1180);
    await semerBibliotheque(page, [tamponFictif('TAMPON_BANC_1', 'Tampon fictif Alpha', 'observations')]);
    await ouvrirBibliotheque(page);

    const bt = await colonne(page, 'trimestre').boundingBox();
    const bb = await colonne(page, 'bibliotheque').boundingBox();
    expect(bt.y + bt.height, '« Dans ta palette » d’abord').toBeLessThanOrEqual(bb.y + 1);
    expect(Math.abs(bt.x - bb.x)).toBeLessThanOrEqual(2);
    expect(await texteVisible(rangee(page, 'bibliotheque', 'Tampon fictif Alpha').locator('.biblio2-passage'))).toBe('↑ Utiliser dans ma palette');
    expect(await texteVisible(rangee(page, 'trimestre', 'Attention').locator('.biblio2-passage'))).toBe('Garder dans ma bibliothèque ↓');

    const toutes = await cibles(page);
    expect(toutes.length).toBeGreaterThan(20);
    expect(toutes.filter(c => c.h < 44 || c.w < 44)).toEqual([]);
});

// ─────────────────────────────────── LA GESTION DES TAMPONS ───────────────────────────────────

test('la gestion des tampons : la phrase de Grégoire sous « + Ajouter une catégorie », qui ajoute une catégorie', async ({ page }) => {
    test.setTimeout(90000);
    const erreurs = await ouvrirAnnoter(page, 1440, 900);
    await page.locator('[data-action="travauxOutils.ouvrirEditionRetroObservations"]').click();
    const zone = page.locator('#modal-retro-observations #travaux-retro-categories');
    await expect(zone).toBeVisible();

    const bouton = zone.locator('[data-action="travauxOutils.ajouterCategorieRetroObs"]');
    const phrase = zone.locator('.travaux-retro-cat-aide');
    await expect(phrase).toHaveText('Tu enseignes plus d\'un cours ? Crée une catégorie par cours pour y ranger ses tampons.');
    // Juste sous le bouton, en texte d'aide : la couleur secondaire, sans encadré.
    expect(await bouton.evaluate(b => b.nextElementSibling && b.nextElementSibling.classList.contains('travaux-retro-cat-aide'))).toBe(true);
    const style = await phrase.evaluate(p => {
        const c = getComputedStyle(p);
        const t = document.createElement('span'); t.style.color = 'var(--texte-secondaire)'; document.body.appendChild(t);
        const attendue = getComputedStyle(t).color; t.remove();
        return { couleur: c.color, attendue, bordure: c.borderTopWidth, fond: c.backgroundColor };
    });
    expect(style.couleur).toBe(style.attendue);
    expect(style.bordure).toBe('0px');
    expect(style.fond).toBe('rgba(0, 0, 0, 0)');

    // Le bouton ajoute une rangée de catégorie (il levait une erreur depuis le ⋮ de #267).
    const avant = await zone.locator(':scope > .travaux-retro-cat-draggable').count();
    await bouton.click();
    await expect(zone.locator(':scope > .travaux-retro-cat-draggable')).toHaveCount(avant + 1);
    await expect(zone.locator(':scope > .travaux-retro-cat-draggable').last().locator('input.travaux-retro-nom-input')).toHaveValue('Nouvelle catégorie');
    expect(await bouton.evaluate(b => b.nextElementSibling.classList.contains('travaux-retro-cat-aide')), 'la phrase reste sous le bouton').toBe(true);
    expect(erreurs).toEqual([]);
});

test('captures pour Grégoire : les tampons, Mac 1440 clair et sombre (un aperçu et un ⋮ ouverts), iPad 820 clair ; la gestion des tampons', async ({ page }) => {
    test.skip(!dossierCaptures, 'CAPTURES_1158 non posée');
    test.setTimeout(180000);
    fs.mkdirSync(dossierCaptures, { recursive: true });
    await ouvrirAnnoter(page, 1440, 900);
    const png = await pngFictif(page);
    await semerBibliotheque(page, [
        tamponFictif('TAMPON_BANC_1', 'Tampon fictif d’une autrice', 'observations', { imageBase64: png, metadata_cc: { auteur_original: 'Autrice fictive' } }),
        tamponFictif('TAMPON_BANC_2', 'Tampon fictif de compréhension', 'comprehension')
    ]);
    await ouvrirBibliotheque(page);
    await rangee(page, 'trimestre', 'Attention').locator('.biblio2-passage').click();
    await rangee(page, 'bibliotheque', 'Tampon fictif d’une autrice').locator('button.biblio2-rangee-nom').click();
    for (const sombre of [false, true]) {
        await page.evaluate((s) => document.body.classList.toggle('mode-clair', !s), sombre);
        await colonne(page, 'trimestre').locator('.biblio2-groupe').first().locator('.biblio2-kebab').click();
        await pause(page, 300);
        await page.screenshot({ path: path.join(dossierCaptures, `tampons-mac-1440-${sombre ? 'sombre' : 'clair'}.png`) });
        await page.keyboard.press('Escape');
    }
    await page.evaluate(() => document.body.classList.toggle('mode-clair', true));
    await page.setViewportSize({ width: 820, height: 1180 });
    await pause(page, 400);
    await page.screenshot({ path: path.join(dossierCaptures, 'tampons-ipad-820-clair.png') });
    await page.keyboard.press('Escape');
    await expect(page.locator(SEL)).toHaveCount(0);

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.locator('[data-action="travauxOutils.ouvrirEditionRetroObservations"]').click();
    await page.locator('#travaux-retro-categories .travaux-retro-cat-aide').scrollIntoViewIfNeeded();
    await pause(page, 300);
    await page.screenshot({ path: path.join(dossierCaptures, 'gestion-tampons-phrase-mac-1440-clair.png') });
});
