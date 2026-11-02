import { test, expect } from '@playwright/test';
import { ouvrirCopie, attendre } from './harness/banc-copie-annotation.js';

// ═══════════════════════════════════════════════════════════════════════════════════════════
// #1216 (1er nov. 2026) — « On dirait que les tampons par défaut ont préséance sur ceux que je viens
// de personnaliser. » Consigne : plans de travail/CONSIGNE-LOT-2026-11-01-tampons-masques-et-bibliotheque.md.
//
// Le vrai index.html, une copie fictive dans Annoter, de vrais chargements. Cible WebKit ; se relance
// dans Chrome (profil neuf) par `channel: 'chrome'` : les deux ne perdent pas la même course :
// WebKit applique avant que la base soit lue, Chrome après.
// Noms fictifs, images fabriquées ici. Contexte Playwright neuf à chaque essai.
//
// BREAK-TESTS : voir plans de travail/RAPPORT-2026-11-01-tampons-masques-et-bibliotheque.md.
// ═══════════════════════════════════════════════════════════════════════════════════════════

const OBS = '[data-action="travauxOutils.ajouterTamponRetroObs"][data-param="observations"]';

// Une image de taille réelle (environ 10 Ko, comme icons8-gears.svg) : au-delà de cinq images, la clé
// `personnalisationObservations` passe le seuil de 25 Ki et ne vit plus que dans IndexedDB.
const svg = (couleur, attributs) => {
    const bourre = Array.from({ length: 170 }, (_, i) =>
        `<path d="M${i % 90} ${(i * 7) % 90} L${(i * 3) % 90} ${(i * 11) % 90}" stroke="${couleur}"/>`).join('');
    return { name: 'tampon.svg', mimeType: 'image/svg+xml', buffer: Buffer.from(
        `<svg xmlns="http://www.w3.org/2000/svg" ${attributs}><rect width="100%" height="100%" fill="${couleur}"/>${bourre}</svg>`) };
};
const AVEC_DIMENSIONS = 'width="96" height="96" viewBox="0 0 96 96"';
const VIEWBOX_SEUL = 'viewBox="0 0 96 96"';
const EN_1EM = 'width="1em" height="1em" viewBox="0 0 24 24"';
const RVB = { '#336699': [51, 102, 153], '#993366': [153, 51, 102], '#118833': [17, 136, 51], '#883311': [136, 51, 17] };

const ouvrirFenetre = (page) => page.evaluate(() => window.travauxOutils.ouvrirEditionRetroObservations());
const enregistrer = (page) => page.evaluate(() => window.travauxOutils.enregistrerRetroObservations());

async function poserImage(page, id, fichier) {
    await page.locator(`input[data-file-id="${id}"]`).setInputFiles(fichier);
    await page.waitForFunction((i) => !!document.querySelector(`img[data-img-id="${i}"]`)?.dataset.base64, id);
}
async function creerTampon(page, bouton, nom, fichier) {
    const avant = await page.locator('#modal-retro-observations .travaux-retro-row[data-custom="true"]').count();
    await page.locator(bouton).click();
    await expect(page.locator('#modal-retro-observations .travaux-retro-row[data-custom="true"]')).toHaveCount(avant + 1);
    const id = await page.locator('#modal-retro-observations .travaux-retro-row[data-custom="true"]').nth(avant).getAttribute('data-obs-id');
    await page.locator(`input[data-nom-id="${id}"]`).fill(nom);
    if (fichier) await poserImage(page, id, fichier);
    await attendre(page, 5);   // l'id d'un tampon créé vient de Date.now()
    return id;
}

/** Sa personnalisation : trois intégrés renommés, deux tampons créés, une catégorie à soi avec trois. */
async function personnaliser(page) {
    await ouvrirFenetre(page);
    for (const [id, nom] of [['obs-hoc', 'HOC'], ['obs-mecanisme', 'Mécanisme'], ['obs-procede', 'Procédé']]) {
        await page.locator(`input[data-nom-id="${id}"]`).fill(nom);
    }
    await creerTampon(page, OBS, 'À réviser', svg('#336699', AVEC_DIMENSIONS));
    await creerTampon(page, OBS, 'Cible', svg('#993366', VIEWBOX_SEUL));
    await page.locator('#travaux-retro-categories [data-action="travauxOutils.ajouterCategorieRetroObs"]').click();
    const cat = await page.evaluate(() => [...document.querySelectorAll('#travaux-retro-categories [data-cat-perso-id]')].pop().dataset.catPersoId);
    await page.locator(`input[data-cat-id="${cat}"]`).fill('Rendu');
    for (const nom of ['Incomplet', 'Incertain', 'Inexact']) {
        await creerTampon(page, `[data-cat-section="${cat}"] + div + button`, nom, svg('#118833', AVEC_DIMENSIONS));
    }
    await enregistrer(page);
    await attendre(page, 300);
}

const palette = (page) => page.evaluate(() => {
    if (!document.getElementById('travaux-palette-tampons')) window.travauxOutils.togglePaletteAutocollants();
    const lu = {};
    document.querySelectorAll('#travaux-palette-tampons .travaux-autocollant-item').forEach((t) => {
        const img = t.querySelector('img');
        lu[t.querySelector('span:last-child').textContent] = img ? img.src.slice(0, 18) : null;
    });
    return lu;
});
const nomsFenetre = async (page) => {
    await ouvrirFenetre(page);
    const lu = await page.evaluate(() => ['obs-hoc', 'obs-mecanisme', 'obs-procede'].map((i) => document.querySelector(`input[data-nom-id="${i}"]`).value));
    return lu;
};
const nomsEnBase = (page) => page.evaluate(() => {
    const p = window.db.getSync('personnalisationObservations', null) || {};
    return ['obs-hoc', 'obs-mecanisme', 'obs-procede'].map((i) => p[i] && p[i].nom);
});
const SES_NOMS = ['HOC', 'Mécanisme', 'Procédé'];

/** Sa personnalisation lue : les trois noms, et les cinq tampons créés avec une image. */
function verifierPalette(lu) {
    for (const nom of SES_NOMS) expect(lu, nom).toHaveProperty([nom]);
    for (const defaut of ['Id. directrice', 'Id. principale', 'Id. secondaire']) expect(Object.keys(lu)).not.toContain(defaut);
    for (const nom of ['À réviser', 'Cible', 'Incomplet', 'Incertain', 'Inexact']) expect(lu[nom], nom).toMatch(/^data:image\/svg/);
}

/** La PNG d'une entrée : ses dimensions, et la couleur de son centre (l'image est-elle la sienne ?). */
const lirePng = (page, data) => page.evaluate(async (src) => {
    const i = new Image();
    await new Promise((r) => { i.onload = r; i.onerror = r; i.src = src; });
    const c = document.createElement('canvas'); c.width = i.naturalWidth; c.height = i.naturalHeight;
    const x = c.getContext('2d'); x.drawImage(i, 0, 0);
    const p = x.getImageData(Math.floor(c.width / 2), Math.floor(c.height / 2), 1, 1).data;
    return { l: i.naturalWidth, h: i.naturalHeight, rvb: [p[0], p[1], p[2]] };
}, data);
const garder = (page, id) => page.evaluate(async (i) => {
    window.tamponsBibliotheque.afficherBibliothequeTampons();
    await window.tamponsBibliotheque.partagerTampon(i);
    return (window.db.getSync('bibliothequeTampons', []) || []).find((t) => t.id === i) || null;
}, id);
const apercuDeLaRangee = (page, colonne, nom) => page.evaluate(({ colonne, nom }) => {
    const rangee = [...document.querySelectorAll(`#modalBibliothequeTampons .biblio2-panneau--${colonne} .biblio2-rangee`)]
        .find((r) => r.querySelector('.biblio2-rangee-nom').textContent.replace(/^▶/, '').trim() === nom);
    if (!rangee) return null;
    const img = rangee.querySelector('.biblio2-apercu-image');
    return { bouton: rangee.querySelector('.biblio2-rangee-nom').tagName === 'BUTTON', image: img ? img.getAttribute('src') : null };
}, { colonne, nom });

const masques = (page) => page.evaluate(async () => {
    const idb = await new Promise((res) => { const r = indexedDB.open('MonitoragePedagogique'); r.onsuccess = () => res(r.result); });
    const v = await new Promise((res) => { const q = idb.transaction('keyvalue').objectStore('keyvalue').get('elementsMasques'); q.onsuccess = () => res(q.result); });
    idb.close();
    const enBase = v && v.value !== undefined ? v.value : v;
    const lu = window.db.getSync('elementsMasques', null);
    return { lu: Array.isArray(lu) ? [...lu].sort() : null, enBase: Array.isArray(enBase) ? [...enBase].sort() : null };
});

test.describe('#1216 — les masques survivent au chargement', () => {
    for (const n of [1, 11, 20]) {
        test(`${n} tampon(s) intégré(s) retiré(s) restent retirés, trois chargements de suite`, async ({ page }) => {
            await ouvrirCopie(page);
            await ouvrirFenetre(page);
            await creerTampon(page, OBS, 'Tampon à moi');
            const retires = await page.evaluate((n) => {
                const lignes = [...document.querySelectorAll('#modal-retro-observations .travaux-retro-draggable:not([data-custom])')]
                    .filter((r) => r.dataset.obsId && !r.dataset.symCustom);
                const ids = lignes.slice(0, n).map((r) => r.dataset.obsId);
                ids.forEach((i) => window.travauxOutils.supprimerTamponRetroObs(i));
                return ids;
            }, n);
            expect(retires).toHaveLength(n);
            await enregistrer(page);
            await attendre(page, 300);
            const attendus = await masques(page);
            for (const id of retires) expect(attendus.lu).toContain(id);

            for (let i = 0; i < 3; i++) {
                await ouvrirCopie(page);
                await attendre(page, 300);
                const lus = await masques(page);
                expect(lus.lu, `chargement ${i + 1}, lu`).toEqual(attendus.lu);
                expect(lus.enBase, `chargement ${i + 1}, IndexedDB`).toEqual(attendus.lu);
            }
            // Le tampon retiré n'est pas revenu dans la fenêtre.
            await ouvrirFenetre(page);
            for (const id of retires) await expect(page.locator(`#modal-retro-observations [data-obs-id="${id}"]`)).toHaveCount(0);
        });
    }

    test('« Réinitialiser » efface encore les masques : le geste de l’usager reste', async ({ page }) => {
        await ouvrirCopie(page);
        page.removeAllListeners('dialog');
        page.on('dialog', (d) => d.accept().catch(() => {}));
        await ouvrirFenetre(page);
        await page.evaluate(() => window.travauxOutils.supprimerTamponRetroObs('obs-hoc'));
        await enregistrer(page);
        expect((await masques(page)).lu).toContain('obs-hoc');
        await ouvrirFenetre(page);
        await page.locator('#modal-retro-observations [data-action="travauxOutils.reinitialiserRetroObservations"]').click();
        await expect(page.locator('#modal-retro-observations input[data-nom-id="obs-hoc"]')).toHaveCount(1);
        expect((await masques(page)).lu).toBeNull();
    });
});

test.describe('#1216 — sa personnalisation survit au chargement', () => {
    test('le cycle : enregistrer, recharger, relire, réenregistrer, recharger', async ({ page }) => {
        await ouvrirCopie(page);
        await personnaliser(page);
        // Le préalable de l'essai : la clé est bien lourde, et ne vit bien que dans IndexedDB.
        const ou = await page.evaluate(() => ({
            ls: localStorage.getItem('personnalisationObservations'),
            cache: window.db.memoryCache.has('personnalisationObservations')
        }));
        expect(ou).toEqual({ ls: null, cache: true });
        verifierPalette(await palette(page));

        await ouvrirCopie(page);
        await attendre(page, 300);
        verifierPalette(await palette(page));
        expect(await nomsFenetre(page)).toEqual(SES_NOMS);

        // « Enregistrer », sans rien changer : les noms par défaut s'écrivaient en base ici.
        await enregistrer(page);
        await attendre(page, 300);
        expect(await nomsEnBase(page)).toEqual(SES_NOMS);
        verifierPalette(await palette(page));

        await ouvrirCopie(page);
        await attendre(page, 300);
        verifierPalette(await palette(page));
        expect(await nomsEnBase(page)).toEqual(SES_NOMS);
    });

    test('un `db-ready` réémis (un import) relit les personnalisations', async ({ page }) => {
        await ouvrirCopie(page);
        await palette(page);
        await page.evaluate(() => {
            window.db.setSync('personnalisationObservations', { 'obs-hoc': { nom: 'Nom importé' } });
            window.dispatchEvent(new CustomEvent('db-ready', { detail: {} }));
        });
        expect(await palette(page)).toHaveProperty(['Nom importé']);
    });

    test('un tampon de catégorie masquée ou inconnue ne sort pas à l’enregistrement', async ({ page }) => {
        await ouvrirCopie(page);
        await page.evaluate(() => {
            window.db.setSync('tamponsPersonnalises', [
                { id: 'custom-cache', nom: 'Dans masquée', categorie: 'comprehension' },
                { id: 'custom-inconnu', nom: 'Sans catégorie connue', categorie: 'diagnostic' },
                { id: 'custom-visible', nom: 'Visible', categorie: 'observations' }
            ]);
            window.db.setSync('categoriesMasquees', ['comprehension']);
        });
        await ouvrirCopie(page);
        await ouvrirFenetre(page);
        await page.evaluate(() => window.travauxOutils.supprimerTamponRetroObs('custom-visible'));
        await enregistrer(page);
        const ids = await page.evaluate(() => window.db.getSync('tamponsPersonnalises', []).map((t) => t.id));
        expect(ids.sort()).toEqual(['custom-cache', 'custom-inconnu']);
        // … mais supprimer une catégorie montrée emporte toujours ses tampons.
        await page.evaluate(() => window.db.setSync('categoriesMasquees', null));
        await ouvrirCopie(page);
        await ouvrirFenetre(page);
        await page.evaluate(() => window.travauxOutils.supprimerCategorieRetroObs('comprehension'));
        await enregistrer(page);
        const reste = await page.evaluate(() => window.db.getSync('tamponsPersonnalises', []).map((t) => t.id));
        expect(reste).toEqual(['custom-inconnu']);
    });
});

test.describe('#1216 — la bibliothèque garde l’image SVG, en PNG', () => {
    /** a et b : deux créés, deux intégrés remplacés ; avec dimensions, puis viewBox seul. */
    async function preparer(page) {
        await ouvrirCopie(page);
        await ouvrirFenetre(page);
        const a1 = await creerTampon(page, OBS, 'Créé avec dimensions', svg('#336699', AVEC_DIMENSIONS));
        const a2 = await creerTampon(page, OBS, 'Créé viewBox seul', svg('#993366', VIEWBOX_SEUL));
        await poserImage(page, 'obs-mecanisme', svg('#118833', AVEC_DIMENSIONS));
        await poserImage(page, 'obs-procede', svg('#883311', VIEWBOX_SEUL));
        await enregistrer(page);
        return { a1, a2 };
    }
    const verifierEntree = async (page, entree, couleur) => {
        expect(entree.imageBase64).toMatch(/^data:image\/png;base64,/);
        expect(entree.imageBase64).not.toContain('svg');
        const png = await lirePng(page, entree.imageBase64);
        expect(png.rvb, 'la couleur de SON image').toEqual(RVB[couleur]);
        expect(png.l).toBeGreaterThanOrEqual(96);
        expect(png.h).toBe(png.l);
    };

    test('a et b : « Garder », avec dimensions puis viewBox seul', async ({ page }) => {
        const { a1, a2 } = await preparer(page);
        await verifierEntree(page, await garder(page, a1), '#336699');
        await verifierEntree(page, await garder(page, a2), '#993366');
        await verifierEntree(page, await garder(page, 'obs-mecanisme'), '#118833');
        await verifierEntree(page, await garder(page, 'obs-procede'), '#883311');
        // L'aperçu de la colonne bibliothèque montre sa PNG, pas le fichier par défaut.
        const b = await apercuDeLaRangee(page, 'bibliotheque', 'Id. principale');
        expect(b.image).toMatch(/^data:image\/png/);
    });

    // Une image en data: est prête tout de suite au banc (`complete` vrai dans le même geste, mesuré dans
    // WebKit et Chrome) : l'essai retarde donc lui-même le chargement, faute de le perdre autrement.
    test('la capture attend une image encore en chargement, et survit à une image illisible', async ({ page }) => {
        await ouvrirCopie(page);
        await ouvrirFenetre(page);
        const id = await creerTampon(page, OBS, 'Image lente', svg('#336699', AVEC_DIMENSIONS));
        const illisible = await creerTampon(page, OBS, 'Image illisible');
        await enregistrer(page);
        const r = await page.evaluate(async ({ id, illisible }) => {
            const t = window.travauxOutils;
            const lente = new Image();
            const prete = new Promise((res) => {
                lente.onload = () => res(lente);
                setTimeout(() => { lente.src = 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8"><rect width="8" height="8" fill="#336699"/></svg>'); }, 60);
            });
            const brisee = new Image();
            const refus = new Promise((_, rej) => { brisee.onerror = () => rej(new Error('illisible')); brisee.src = 'data:image/png;base64,AAAA'; });
            const lireImage = t.obtenirImageAutocollant, lirePromesse = t.getPromesseAutocollant;
            t.obtenirImageAutocollant = (i) => (i === id ? lente : i === illisible ? brisee : lireImage(i));
            t.getPromesseAutocollant = (i) => (i === id ? prete : i === illisible ? refus : lirePromesse(i));
            window.tamponsBibliotheque.afficherBibliothequeTampons();
            await window.tamponsBibliotheque.partagerTampon(id);
            await window.tamponsBibliotheque.partagerTampon(illisible);
            t.obtenirImageAutocollant = lireImage; t.getPromesseAutocollant = lirePromesse;
            const biblio = window.db.getSync('bibliothequeTampons', []);
            return { lente: biblio.find((x) => x.id === id), illisible: biblio.find((x) => x.id === illisible) };
        }, { id, illisible });
        await verifierEntree(page, r.lente, '#336699');
        expect(r.illisible).toBeTruthy();
        expect(r.illisible.imageBase64 || '').toBe('');
    });

    test('b après un rechargement : son image, pas celle par défaut', async ({ page }) => {
        await preparer(page);
        await ouvrirCopie(page);
        await attendre(page, 300);
        await verifierEntree(page, await garder(page, 'obs-mecanisme'), '#118833');
        await verifierEntree(page, await garder(page, 'obs-procede'), '#883311');
    });

    test('« Dans ta palette » montre l’image SVG en PNG, sans jamais l’image par défaut', async ({ page }) => {
        const { a1 } = await preparer(page);
        await attendre(page, 300);
        await page.evaluate(() => window.tamponsBibliotheque.afficherBibliothequeTampons());
        for (const nom of ['Créé avec dimensions', 'Créé viewBox seul', 'Id. principale', 'Id. secondaire']) {
            const r = await apercuDeLaRangee(page, 'trimestre', nom);
            expect(r, nom).not.toBeNull();
            expect(r.bouton, nom + ' : le nom ouvre son aperçu').toBe(true);
            expect(r.image, nom).toMatch(/^data:image\/png/);
        }
        expect(a1).toMatch(/^custom-/);
    });

    test('un SVG de 1em ne devient pas une vignette de 16 px, et un SVG sans image n’écrit rien de faux', async ({ page }) => {
        await ouvrirCopie(page);
        await ouvrirFenetre(page);
        const id = await creerTampon(page, OBS, 'Très petit', svg('#336699', EN_1EM));
        const vide = await creerTampon(page, OBS, 'Sans image');
        await enregistrer(page);
        const entree = await garder(page, id);
        const png = await lirePng(page, entree.imageBase64);
        expect(png).toMatchObject({ l: 256, h: 256, rvb: RVB['#336699'] });
        expect((await garder(page, vide)).imageBase64 || '').toBe('');
    });

    test('sans dimensions du tout : un SVG est dessiné carré, une autre image n’est pas lue', async ({ page }) => {
        await ouvrirCopie(page);
        const r = await page.evaluate(async () => {
            const charger = async (src) => {
                const i = new Image();
                await new Promise((res) => { i.onload = res; i.onerror = res; i.src = src; });
                Object.defineProperty(i, 'naturalWidth', { value: 0 });
                Object.defineProperty(i, 'naturalHeight', { value: 0 });
                return i;
            };
            const toile = document.createElement('canvas'); toile.width = 4; toile.height = 4;
            const svg = await charger('data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8"><rect width="8" height="8" fill="#336699"/></svg>'));
            const png = await charger(toile.toDataURL('image/png'));
            return { svg: window.travauxOutils.imageVersBase64(svg), png: window.travauxOutils.imageVersBase64(png), rien: window.travauxOutils.imageVersBase64(null) };
        });
        expect(await lirePng(page, r.svg)).toMatchObject({ l: 256, h: 256, rvb: RVB['#336699'] });
        expect(r.png).toBeNull();
        expect(r.rien).toBeNull();
    });

    test('l’export d’un tampon et d’une catégorie portent la même PNG', async ({ page }) => {
        const { a2 } = await preparer(page);
        const exporte = (appel) => page.evaluate(async ({ appel }) => {
            const avant = URL.createObjectURL;
            let lu = null;
            URL.createObjectURL = (b) => { lu = b; return avant.call(URL, b); };
            const [nomFn, arg] = appel;
            await window.tamponsBibliotheque[nomFn](arg);
            URL.createObjectURL = avant;
            return JSON.parse(await lu.text());
        }, { appel });
        const un = await exporte(['exporterUnTampon', a2]);
        await verifierEntree(page, un.tampons[0], '#993366');
        const cat = await exporte(['exporterCategorie', 'observations']);
        await verifierEntree(page, cat.tampons.find((t) => t.id === a2), '#993366');
    });
});
