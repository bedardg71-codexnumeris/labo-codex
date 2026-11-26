import { test, expect } from '@playwright/test';
import { ouvrirCopie, attendre } from './harness/banc-copie-annotation.js';

// ═══════════════════════════════════════════════════════════════════════════════════════════
// TAMPONS D'OBSERVATION, LOT 1 : RÉGLER (24 nov. 2026)
// Consigne de lot (Cowork, 24 nov., 13 h 55) ; rapport : plans de travail/RAPPORT-2026-11-24-tampons-observation-lot-1.md.
//
// Le vrai index.html, la vraie fenêtre des tampons, de vrais chargements. Chaque sentinelle recharge TROIS fois et lit
// AUSSI IndexedDB (rapport du 1er nov. : un seul rechargement restait vert alors que WebKit perdait la donnée).
// Cible WebKit ; se relance sous Chromium par une config Chromium (voir le rapport). Contexte neuf à chaque essai.
//
// RIEN EN DUR : les catégories fournies et leurs tampons sont LUS de la fenêtre (la première rangée, le premier
// tampon) ; tout ce qui est nommé ici est créé ici, fictif. BREAK-TESTS : journal au rapport.
// ═══════════════════════════════════════════════════════════════════════════════════════════

const CLE = 'categoriesObservation';
const PERS = 'personnalisationObservations';
const M = '#modal-retro-observations';

const ouvrirFenetre = (page) => page.evaluate(() => window.travauxOutils.ouvrirEditionRetroObservations());
const enregistrer = async (page) => { await page.evaluate(() => window.travauxOutils.enregistrerRetroObservations()); await attendre(page, 300); };

/** Une pratique par cibles existe : un ensemble de cibles fictif dans le trimestre du banc. */
const poserCibles = (page, criteres = ['Critère fictif A', 'Critère fictif B']) => page.evaluate((criteres) => {
    window.db.setSync(window.cle('ensemblesCibles'), [{ id: 'ENSC_BANC', coursId: null, dateCreation: '2031-01-01T00:00:00.000Z', dateModification: '2031-01-01T00:00:00.000Z', // security-ok: fixture de test
        cibles: [{ id: 'cible-banc-1', etiquette: 'Cible fictive', enonce: '', poids: 1, terminale: false,
            criteres: criteres.map((texte, i) => ({ id: 'crit-banc-' + i, texte, essentiel: i === 0 })) }] }]);
}, criteres);

/** Ce qui est rangé pour une clé : lu par l'application, dans IndexedDB et dans localStorage. « (absente) » si rien. */
const range = (page, cle) => page.evaluate(async (cle) => {
    const idb = await new Promise((res) => { const r = indexedDB.open('MonitoragePedagogique'); r.onsuccess = () => res(r.result); });
    const v = await new Promise((res) => { const q = idb.transaction('keyvalue').objectStore('keyvalue').get(cle); q.onsuccess = () => res(q.result); });
    idb.close();
    return { lu: window.db.getSync(cle, '(absente)'), idb: v === undefined ? '(absente)' : (v && v.value !== undefined ? v.value : v),
        ls: localStorage.getItem(cle) === null ? '(absente)' : JSON.parse(localStorage.getItem(cle)) };
}, cle);
/** Les critères rangés, par tampon (les autres champs d'une personnalisation ne sont pas l'objet de ce banc). */
const criteresRanges = async (page) => {
    const r = await range(page, PERS);
    const extraire = (o) => (o && typeof o === 'object'
        ? Object.fromEntries(Object.entries(o).filter(([, p]) => p && p.critere !== undefined).map(([id, p]) => [id, p.critere])) : o);
    return { lu: extraire(r.lu), idb: extraire(r.idb) };
};

/** Ce que la fenêtre offre : une catégorie fournie et son premier tampon, lus (jamais nommés). */
const lireFournis = (page) => page.evaluate(() => {
    const rangee = document.querySelector('#travaux-retro-categories [data-cat-row]:not([data-cat-perso-id])');
    const cat = rangee.dataset.catRow;
    const tampon = document.getElementById('travaux-retro-obs-liste-' + cat).querySelector('.travaux-retro-row:not([data-custom])').dataset.obsId;
    return { cat, tampon };
});
const caseDe = (page, cat) => page.locator(`${M} input[data-cat-observation-id="${cat}"]`);
const critereDe = (page, id) => page.locator(`${M} input[data-critere-id="${id}"]`);

async function creerCategorie(page, nom) {
    await page.locator('#travaux-retro-categories [data-action="travauxOutils.ajouterCategorieRetroObs"]').click();
    const cat = await page.evaluate(() => [...document.querySelectorAll('#travaux-retro-categories [data-cat-perso-id]')].pop().dataset.catPersoId);
    await page.locator(`${M} input[data-cat-id="${cat}"]`).fill(nom);
    await attendre(page, 5);
    return cat;
}
async function creerTampon(page, cat, nom) {
    const rangees = page.locator(`[id="travaux-retro-obs-liste-${cat}"] .travaux-retro-row[data-custom="true"]`);
    const avant = await rangees.count();
    await page.evaluate((c) => window.travauxOutils.ajouterTamponRetroObs(c), cat);
    await expect(rangees).toHaveCount(avant + 1);
    const id = await rangees.nth(avant).getAttribute('data-obs-id');
    await page.locator(`${M} input[data-nom-id="${id}"]`).fill(nom);
    await attendre(page, 5);   // l'identifiant d'un tampon créé vient de l'horloge
    return id;
}

/** Le réglage type : une catégorie fournie et une catégorie à soi cochées, un critère sur un tampon de chacune. */
async function regler(page) {
    await ouvrirCopie(page);
    await poserCibles(page);
    await ouvrirFenetre(page);
    const { cat, tampon } = await lireFournis(page);
    const catPerso = await creerCategorie(page, 'Catégorie fictive');
    const cree = await creerTampon(page, catPerso, 'Tampon fictif');
    await caseDe(page, cat).check();
    await caseDe(page, catPerso).check();
    await critereDe(page, tampon).fill('Critère fictif A');
    await critereDe(page, cree).fill('  Un critère   écrit à la main ');
    await enregistrer(page);
    return { cat, tampon, catPerso, cree, attendu: { [tampon]: 'Critère fictif A', [cree]: 'Un critère écrit à la main' } };
}

/** Trois chargements de suite : la liste et les critères sont là, dans l'application comme dans IndexedDB. */
async function troisChargements(page, liste, criteres) {
    for (let i = 1; i <= 3; i++) {
        await ouvrirCopie(page);
        await attendre(page, 300);
        const l = await range(page, CLE);
        expect(l.lu, `chargement ${i}, liste lue`).toEqual(liste);
        expect(l.idb, `chargement ${i}, liste dans IndexedDB`).toEqual(liste);
        const c = await criteresRanges(page);
        expect(c.lu, `chargement ${i}, critères lus`).toEqual(criteres);
        expect(c.idb, `chargement ${i}, critères dans IndexedDB`).toEqual(criteres);
    }
}

/** Le fichier que « Exporter mes tampons » télécharge (la fenêtre des métadonnées est hors de ce banc). */
const exporterJeu = (page) => page.evaluate(async () => {
    const avant = URL.createObjectURL, meta = window.demanderMetadonneesEnrichies;
    let lu = null;
    URL.createObjectURL = (b) => { lu = b; return avant.call(URL, b); };
    window.demanderMetadonneesEnrichies = async (titre) => { window.__titreDemande = titre; return {}; };
    await window.travauxOutils.exporterTampons();
    URL.createObjectURL = avant; window.demanderMetadonneesEnrichies = meta;
    return JSON.parse(await lu.text());
});
const importerJeu = async (page, donnees) => { await page.evaluate((d) => window.travauxOutils.confirmerImportTampons(d), donnees); await attendre(page, 300); };
const contenuDe = (fichier) => fichier.contenu || fichier;
/** La liste a été vidée : rangée à `null` (que l'application lit comme absente), jamais une liste. */
async function listeVide(page) {
    const l = await range(page, CLE);
    expect(['(absente)', null], 'lue').toContainEqual(l.lu);
    expect(l.idb, 'dans IndexedDB').toBeNull();
    expect(await page.evaluate(() => window.db.getSync('categoriesObservation', null))).toBeNull();
}

// 25 nov. 2026 (lot « Opérations ») : dans la démo, la catégorie fournie `action` est d'observation PAR LECTURE. Le
// banc pose le seul drapeau que cette lecture regarde (`demo-actif`) ; la démo entière est jouée par le banc du parcours 9.
test.describe('Tampons d’observation — dans la démo, « Opérations » est d’observation sans que rien soit rangé', () => {
    const drapeau = (page, v) => page.evaluate((v) => { if (v) window.db.setSync('demo-actif', 'true'); else window.db.removeSync('demo-actif'); }, v);

    test('la case d’« Opérations » se montre cochée ; « Enregistrer » ne la range pas ; une autre case cochée dans la démo, elle, est rangée ; hors de la démo, « Opérations » n’est plus cochée', async ({ page }) => {
        await ouvrirCopie(page);
        await poserCibles(page);
        await drapeau(page, true);
        await ouvrirFenetre(page);
        await expect(caseDe(page, 'action')).toBeChecked();
        await expect(caseDe(page, 'observations')).not.toBeChecked();
        await enregistrer(page);
        // Rien n'a jamais été rangé : la clé est absente, dans l'application comme dans IndexedDB.
        expect(await range(page, CLE)).toMatchObject({ lu: '(absente)', idb: '(absente)' });
        expect(await page.evaluate(() => window.travauxOutils.tamponsDObservation().length), 'témoin : la démo offre pourtant les six tampons').toBe(6);
        // Une catégorie que la personne coche elle-même dans la démo est son réglage : elle est rangée, seule.
        await ouvrirFenetre(page);
        await caseDe(page, 'observations').check();
        await enregistrer(page);
        expect((await range(page, CLE)).lu).toEqual(['observations']);
        expect(await page.evaluate(() => window.travauxOutils.tamponsDObservation().map((t) => t.categorieId).filter((c, i, l) => l.indexOf(c) === i).sort())).toEqual(['action', 'observations']);
        // Hors de la démo : « Opérations » n'est pas cochée, ce que la personne a coché le reste.
        await drapeau(page, false);
        await ouvrirFenetre(page);
        await expect(caseDe(page, 'action')).not.toBeChecked();
        await expect(caseDe(page, 'observations')).toBeChecked();
        expect(await page.evaluate(() => window.travauxOutils.tamponsDObservation().every((t) => t.categorieId === 'observations'))).toBe(true);
    });

    test('une personne qui avait coché « Opérations » elle-même la garde rangée après un enregistrement dans la démo', async ({ page }) => {
        await ouvrirCopie(page);
        await poserCibles(page);
        await ouvrirFenetre(page);
        await caseDe(page, 'action').check();
        await enregistrer(page);
        expect((await range(page, CLE)).lu).toEqual(['action']);
        await drapeau(page, true);
        await ouvrirFenetre(page);
        await enregistrer(page);
        expect((await range(page, CLE)).lu).toEqual(['action']);
    });
});

test.describe('Tampons d’observation, lot 1 — la fenêtre sans pratique par cibles', () => {
    test('rien de neuf ne s’y montre, et « Enregistrer » n’écrit ni la liste ni un critère', async ({ page }) => {
        await ouvrirCopie(page);
        await ouvrirFenetre(page);
        for (const neuf of ['[data-cat-observation-id]', '.travaux-retro-critere', '[data-critere-id]', '[data-observation-aide]',
            '[data-observation-aide-categories]', '#travaux-retro-observation-annonce', 'datalist']) {
            await expect(page.locator(`${M} ${neuf}`), neuf).toHaveCount(0);
        }
        expect(await page.locator(M).innerHTML()).not.toMatch(/observation-|critere/i);
        // Un tampon et une catégorie ajoutés à l'instant n'en portent pas davantage.
        const cat = await creerCategorie(page, 'Catégorie fictive');
        await creerTampon(page, cat, 'Tampon fictif');
        await expect(page.locator(`${M} [data-cat-observation-id], ${M} .travaux-retro-critere, ${M} [data-observation-aide]`)).toHaveCount(0);
        await enregistrer(page);
        await troisChargements(page, '(absente)', {});
        expect((await range(page, CLE)).ls).toBe('(absente)');
    });

    test('une liste et un critère déjà rangés ne sont ni montrés ni perdus quand on enregistre sans pratique par cibles', async ({ page }) => {
        const r = await regler(page);
        await page.evaluate(() => window.db.setSync(window.cle('ensemblesCibles'), []));   // security-ok: fixture de test (la pratique par cibles n'existe plus)
        await ouvrirCopie(page);
        await ouvrirFenetre(page);
        await expect(page.locator(`${M} [data-cat-observation-id], ${M} .travaux-retro-critere`)).toHaveCount(0);
        await enregistrer(page);
        await troisChargements(page, [r.cat, r.catPerso], r.attendu);
    });
});

test.describe('Tampons d’observation, lot 1 — régler', () => {
    test('avec une pratique par cibles, personne n’a rien réglé : aucune case cochée, et « Enregistrer » n’écrit aucune clé', async ({ page }) => {
        await ouvrirCopie(page);
        await poserCibles(page);
        await ouvrirFenetre(page);
        const cases = page.locator(`${M} input[data-cat-observation-id]`);
        expect(await cases.count()).toBe(await page.locator('#travaux-retro-categories [data-cat-row]').count());
        expect(await cases.count()).toBeGreaterThan(0);
        expect(await cases.evaluateAll((l) => l.filter((c) => c.checked).length), 'aucune ne l’est d’office, pas même une catégorie fournie').toBe(0);
        expect(await page.locator(`${M} .travaux-retro-critere`).evaluateAll((l) => l.filter((b) => !b.hidden).length)).toBe(0);
        await enregistrer(page);
        await troisChargements(page, '(absente)', {});
        expect((await range(page, CLE)).ls).toBe('(absente)');
    });

    test('une catégorie cochée et un critère déclaré tiennent trois chargements, puis un enregistrement sans rien changer', async ({ page }) => {
        const r = await regler(page);
        await troisChargements(page, [r.cat, r.catPerso], r.attendu);

        // La fenêtre les montre : les cases cochées, le critère dans son champ, l'aide acceptée le 22 nov.
        await ouvrirFenetre(page);
        await expect(caseDe(page, r.cat)).toBeChecked();
        await expect(caseDe(page, r.catPerso)).toBeChecked();
        await expect(critereDe(page, r.tampon)).toHaveValue('Critère fictif A');
        await expect(critereDe(page, r.cree)).toHaveValue('Un critère écrit à la main');
        await expect(page.locator(`${M} [data-observation-aide="${r.cat}"]`)).toBeVisible();
        await expect(page.locator(`${M} [data-observation-aide="${r.cat}"] p`).first())
            .toHaveText('Un tampon d’observation nomme ce que tu vois l’étudiant·e faire. La cause, tu la chercheras avec elle ou lui.');

        // « Enregistrer » sans rien changer : ni la propriété ni le critère ne se perdent.
        await enregistrer(page);
        await troisChargements(page, [r.cat, r.catPerso], r.attendu);
    });

    test('les critères des cibles déjà définies sont offerts en suggestion, sans balise', async ({ page }) => {
        await ouvrirCopie(page);
        await poserCibles(page, ['Critère fictif A', 'Critère <b>fictif</b> "B"', 'Critère fictif A']);
        await ouvrirFenetre(page);
        const options = await page.locator(`${M} datalist#travaux-retro-criteres-suggeres option`).evaluateAll((l) => l.map((o) => o.value));
        expect(options).toEqual(['Critère fictif A', 'Critère <b>fictif</b> "B"']);
        await expect(page.locator(`${M} datalist b`)).toHaveCount(0);
        const { tampon } = await lireFournis(page);
        expect(await critereDe(page, tampon).getAttribute('list')).toBe('travaux-retro-criteres-suggeres');
    });

    test('une catégorie décochée : le critère n’est plus montré, il n’est pas effacé ; recochée, il revient', async ({ page }) => {
        const r = await regler(page);
        await ouvrirFenetre(page);
        await caseDe(page, r.cat).uncheck();
        await expect(critereDe(page, r.tampon)).toBeHidden();
        await expect(page.locator(`${M} [data-observation-aide="${r.cat}"]`)).toBeHidden();
        await expect(page.locator(`${M} #travaux-retro-observation-annonce`)).toContainText('n’est plus une catégorie d’observation');
        await enregistrer(page);
        await troisChargements(page, [r.catPerso], r.attendu);

        // Non montré, il voyage quand même (retouche du 24 nov., 15 h 35) : le fichier exporté le porte.
        const fichier = contenuDe(await exporterJeu(page));
        expect(fichier.tampons.find((t) => t.id === r.tampon).critere).toBe(r.attendu[r.tampon]);
        expect(fichier.categories.find((k) => k.id === r.cat).observation, 'et sa catégorie n’est pas dite d’observation').toBeUndefined();
        expect(fichier.tampons.find((t) => t.id === r.cree).critere).toBe(r.attendu[r.cree]);

        await ouvrirFenetre(page);
        await expect(critereDe(page, r.tampon)).toBeHidden();
        await caseDe(page, r.cat).check();
        await expect(critereDe(page, r.tampon)).toBeVisible();
        await expect(critereDe(page, r.tampon)).toHaveValue('Critère fictif A');
        await expect(page.locator(`${M} #travaux-retro-observation-annonce`)).toContainText('est maintenant une catégorie d’observation');
        await enregistrer(page);
        await troisChargements(page, [r.cat, r.catPerso], r.attendu);   // la liste suit l'ordre des rangées de la fenêtre
    });

    test('un critère vidé est retiré ; un critère trop long est borné à 200 caractères', async ({ page }) => {
        const r = await regler(page);
        await ouvrirFenetre(page);
        await critereDe(page, r.tampon).fill('   ');
        expect(await critereDe(page, r.cree).getAttribute('maxlength')).toBe('200');
        await page.evaluate((id) => { document.querySelector(`input[data-critere-id="${id}"]`).value = 'z'.repeat(450); }, r.cree);
        await enregistrer(page);
        await troisChargements(page, [r.cat, r.catPerso], { [r.cree]: 'z'.repeat(200) });
    });

    test('une catégorie à soi supprimée sort de la liste ; son tampon ajouté à l’instant porte le champ du critère', async ({ page }) => {
        const r = await regler(page);
        await ouvrirFenetre(page);
        // Un tampon ajouté dans une catégorie cochée montre tout de suite son champ ; dans une catégorie non cochée, non.
        const neuf = await creerTampon(page, r.catPerso, 'Second tampon fictif');
        await expect(critereDe(page, neuf)).toBeVisible();
        const autreCat = await creerCategorie(page, 'Catégorie non cochée');
        await expect(caseDe(page, autreCat)).not.toBeChecked();
        const cache = await creerTampon(page, autreCat, 'Tampon sans champ montré');
        await expect(critereDe(page, cache)).toBeHidden();
        await caseDe(page, autreCat).check();
        await expect(critereDe(page, cache)).toBeVisible();
        await critereDe(page, cache).fill('Critère fictif B');
        await page.evaluate((c) => window.travauxOutils.supprimerCategorieRetroObs(c), r.catPerso);
        await enregistrer(page);
        const l = await range(page, CLE);
        expect(l.lu).toEqual([r.cat, autreCat]);
        expect((await criteresRanges(page)).lu[cache]).toBe('Critère fictif B');
    });

    test('une catégorie masquée avant l’ouverture garde ce qu’elle était', async ({ page }) => {
        const r = await regler(page);
        await page.evaluate((c) => window.db.setSync('categoriesMasquees', [c]), r.cat);
        await ouvrirCopie(page);
        await ouvrirFenetre(page);
        await expect(caseDe(page, r.cat)).toHaveCount(0);
        await enregistrer(page);
        expect((await range(page, CLE)).lu).toEqual([r.cat, r.catPerso]);
        expect((await criteresRanges(page)).lu).toEqual(r.attendu);
    });

    test('« Réinitialiser » vide aussi la liste', async ({ page }) => {
        const r = await regler(page);
        expect((await range(page, CLE)).lu).toEqual([r.cat, r.catPerso]);
        page.removeAllListeners('dialog');
        page.on('dialog', (d) => d.accept().catch(() => {}));
        await ouvrirFenetre(page);
        await page.locator(`${M} [data-action="travauxOutils.reinitialiserRetroObservations"]`).click();
        await attendre(page, 300);
        await listeVide(page);
        expect(['(absente)', null]).toContainEqual((await range(page, PERS)).lu);
        await expect(page.locator(`${M} input[data-cat-observation-id]:checked`)).toHaveCount(0);
    });

    test('le critère, le nom d’une catégorie et l’annonce sont du texte : aucune balise n’entre, aucun gestionnaire inline', async ({ page }) => {
        const r = await regler(page);
        const PIEGE = '"><img src=x data-piege onerror="window.__piege=1"> <b>gras</b>';
        await ouvrirFenetre(page);
        await critereDe(page, r.tampon).fill(PIEGE);
        await page.locator(`${M} input[data-cat-id="${r.catPerso}"]`).fill('<i>Cat</i> "fictive"');
        await caseDe(page, r.catPerso).uncheck();
        await expect(page.locator(`${M} #travaux-retro-observation-annonce`)).toContainText('<i>Cat</i> "fictive"');
        await expect(page.locator(`${M} #travaux-retro-observation-annonce i`)).toHaveCount(0);
        await caseDe(page, r.catPerso).check();
        await enregistrer(page);
        await ouvrirCopie(page);
        await ouvrirFenetre(page);
        await expect(critereDe(page, r.tampon)).toHaveValue(PIEGE.replace(/\s+/g, ' ').slice(0, 200).trim());
        // Renommée, la catégorie à soi garde son identifiant : elle est toujours d'observation, sous son nouveau nom.
        await expect(caseDe(page, r.catPerso)).toBeChecked();
        await expect(page.locator(`${M} input[data-cat-id="${r.catPerso}"]`)).toHaveValue('<i>Cat</i> "fictive"');
        await expect(page.locator(`${M} [data-piege]`)).toHaveCount(0);
        expect(await page.evaluate(() => window.__piege)).toBeUndefined();
        const inline = await page.locator(`${M} .travaux-retro-cat-observation, ${M} .travaux-retro-cat-observation *, ${M} .travaux-retro-critere, ${M} .travaux-retro-critere *, ${M} .travaux-retro-observation-aide`)
            .evaluateAll((l) => l.flatMap((e) => [...e.attributes].map((a) => a.name)).filter((n) => /^on/i.test(n)));
        expect(inline).toEqual([]);
    });
});

test.describe('Tampons d’observation, lot 1 — le voyage', () => {
    test('un jeu exporté puis réimporté dans un espace vide rend la propriété et le critère', async ({ page, browser }) => {
        const r = await regler(page);
        const fichier = await exporterJeu(page);
        const c = contenuDe(fichier);
        expect(c.categories.filter((k) => k.observation === true).map((k) => k.id).sort()).toEqual([r.cat, r.catPerso].sort());
        expect(c.categories.filter((k) => k.observation !== true).every((k) => !('observation' in k)), 'une catégorie non cochée ne porte pas le champ').toBe(true);
        expect(Object.fromEntries(c.tampons.filter((t) => t.critere !== undefined).map((t) => [t.id, t.critere]))).toEqual(r.attendu);

        const ailleurs = await browser.newContext();
        const page2 = await ailleurs.newPage();
        await ouvrirCopie(page2);
        expect((await range(page2, CLE)).lu, 'témoin : l’espace est vide').toBe('(absente)');
        await importerJeu(page2, fichier);
        await troisChargements(page2, [r.cat, r.catPerso].filter((k) => c.categories.some((x) => x.id === k)).sort((a, b) =>
            c.categories.findIndex((x) => x.id === a) - c.categories.findIndex((x) => x.id === b)), r.attendu);
        // Et la fenêtre de cet espace les montre, dès qu'une pratique par cibles y existe.
        await poserCibles(page2);
        await ouvrirFenetre(page2);
        await expect(caseDe(page2, r.cat)).toBeChecked();
        await expect(caseDe(page2, r.catPerso)).toBeChecked();
        await expect(critereDe(page2, r.tampon)).toHaveValue(r.attendu[r.tampon]);
        await expect(critereDe(page2, r.cree)).toHaveValue(r.attendu[r.cree]);
        await ailleurs.close();
    });

    test('sans rien de réglé, le fichier exporté ne porte aucun des deux champs', async ({ page }) => {
        await ouvrirCopie(page);
        await poserCibles(page);
        const c = contenuDe(await exporterJeu(page));
        expect(c.categories.length).toBeGreaterThan(0);
        expect(c.tampons.length).toBeGreaterThan(0);
        expect(c.categories.some((k) => 'observation' in k)).toBe(false);
        expect(c.tampons.some((t) => 'critere' in t)).toBe(false);
    });

    test('l’import remplace : la liste suit le fichier ; un fichier sans propriété la vide', async ({ page }) => {
        const r = await regler(page);
        const fichier = await exporterJeu(page);
        const sans = JSON.parse(JSON.stringify(fichier));
        contenuDe(sans).categories.forEach((k) => { delete k.observation; });
        await importerJeu(page, sans);
        await listeVide(page);
        expect((await criteresRanges(page)).lu, 'sans catégorie d’observation dans le fichier, les critères entrent quand même').toEqual(r.attendu);
        await importerJeu(page, fichier);
        expect((await range(page, CLE)).lu.sort()).toEqual([r.cat, r.catPerso].sort());
        expect((await criteresRanges(page)).lu).toEqual(r.attendu);
    });

    test('la liste blanche de l’import : les deux champs neufs, et eux seuls, sans balise, au bon type', async ({ page }) => {
        const r = await regler(page);
        const fichier = await exporterJeu(page);
        const c = contenuDe(fichier);
        const catObs = c.categories.find((k) => k.id === r.cat);
        const catAutre = c.categories.find((k) => k.id === r.catPerso);
        catObs.cible = 'cible-banc-1'; catObs.critereId = 'crit-banc-0';
        catAutre.observation = 'true';                                   // un texte n'est pas « vrai »
        const t1 = c.tampons.find((t) => t.id === r.tampon);
        t1.critere = '<script>window.__piege=1</script>Critère <b>importé</b>   ' + 'w'.repeat(400);
        t1.cibleId = 'cible-banc-1'; t1.observation = true;
        c.tampons.find((t) => t.id === r.cree).critere = '  Critère d’une catégorie que le   fichier ne dit pas d’observation ';
        c.tampons.push({ id: 'custom-banc-objet', nom: 'Tampon au critère mal formé', categorie: r.cat, critere: { texte: 'x' }, custom: true });
        await importerJeu(page, fichier);
        expect((await range(page, CLE)).lu).toEqual([r.cat]);
        const crit = (await criteresRanges(page)).lu;
        expect(Object.keys(crit).sort(), 'le tampon au critère mal formé n’en a pas').toEqual([r.tampon, r.cree].sort());
        expect(crit[r.cree], 'sa catégorie n’est pas d’observation dans le fichier : le critère entre, rogné').toBe('Critère d’une catégorie que le fichier ne dit pas d’observation');
        expect(crit[r.tampon]).not.toMatch(/[<>]/);
        expect(crit[r.tampon], 'les balises sont retirées ; ce qu’elles entouraient reste du texte').toMatch(/Critère importé w+$/);
        expect(crit[r.tampon]).toHaveLength(200);
        const pers = (await range(page, PERS)).lu;
        expect(Object.values(pers).some((p) => 'cibleId' in p || 'observation' in p)).toBe(false);
        expect(await page.evaluate(() => window.__piege)).toBeUndefined();
        const perso = (await range(page, 'categoriesPerso')).lu;
        expect(perso.every((k) => Object.keys(k).sort().join() === 'id,nom')).toBe(true);
    });

    test('la bibliothèque : « Garder » puis « Utiliser » dans un espace vide rend le critère', async ({ page, browser }) => {
        const r = await regler(page);
        const entree = await page.evaluate(async (id) => {
            window.tamponsBibliotheque.afficherBibliothequeTampons();
            await window.tamponsBibliotheque.partagerTampon(id);
            return (window.db.getSync('bibliothequeTampons', []) || []).find((t) => t.id === id) || null;
        }, r.cree);
        expect(entree.critere).toBe(r.attendu[r.cree]);

        // L'entrée passe par l'import de la bibliothèque (sa liste blanche), puis par « Utiliser ».
        const ailleurs = await browser.newContext();
        const page2 = await ailleurs.newPage();
        await ouvrirCopie(page2);
        const garde = await page2.evaluate(async ({ entree }) => {
            await window.tamponsBibliotheque.importerDansBibliotheque([Object.assign({}, entree, { champInconnu: 'x' })]);
            const g = (window.db.getSync('bibliothequeTampons', []) || []).find((t) => t.id === entree.id);
            await window.tamponsBibliotheque.ajouterDepuisBibliotheque(entree.id);
            return g;
        }, { entree });
        expect(garde.critere).toBe(r.attendu[r.cree]);
        expect('champInconnu' in garde).toBe(false);
        await attendre(page2, 300);
        await troisChargements(page2, '(absente)', { [r.cree]: r.attendu[r.cree] });
        await ailleurs.close();
    });

    test('la bibliothèque : « Garder » une catégorie, exporter un tampon, exporter une catégorie emportent le critère ; un tampon sans critère n’a pas le champ', async ({ page }) => {
        const r = await regler(page);
        await ouvrirFenetre(page);
        const sans = await creerTampon(page, r.catPerso, 'Tampon sans critère');
        await enregistrer(page);
        const exporte = (appel) => page.evaluate(async ({ appel }) => {
            const avant = URL.createObjectURL;
            let lu = null;
            URL.createObjectURL = (b) => { lu = b; return avant.call(URL, b); };
            await window.tamponsBibliotheque[appel[0]](appel[1]);
            URL.createObjectURL = avant;
            return JSON.parse(await lu.text());
        }, { appel });
        expect((await exporte(['exporterUnTampon', r.cree])).tampons[0].critere).toBe(r.attendu[r.cree]);
        const cat = await exporte(['exporterCategorie', r.catPerso]);
        expect(cat.tampons.find((t) => t.id === r.cree).critere).toBe(r.attendu[r.cree]);
        expect('critere' in cat.tampons.find((t) => t.id === sans)).toBe(false);
        const gardes = await page.evaluate(async (c) => {
            window.tamponsBibliotheque.afficherBibliothequeTampons();
            await window.tamponsBibliotheque.partagerCategorie(c);
            return window.db.getSync('bibliothequeTampons', []);
        }, r.catPerso);
        expect(gardes.find((t) => t.id === r.cree).critere).toBe(r.attendu[r.cree]);
        expect('critere' in gardes.find((t) => t.id === sans)).toBe(false);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════════════════
// RETOUCHE DU 24 NOV. 2026, 15 h 35 (Cowork, après l'essai de Grégoire sur son iPad)
// 1. Le critère voyage TOUJOURS, que sa catégorie soit cochée ou non : aucune donnée perdue sans retour.
// 3. Deux titres changent (Grégoire, 15 h 33) ; le titre d'un fichier REÇU s'affiche tel qu'il est écrit.
// ═══════════════════════════════════════════════════════════════════════════════════════════
test.describe('Tampons d’observation, lot 1 — retouche : le critère voyage toujours', () => {
    /** Cocher, écrire un critère, enregistrer ; puis décocher, enregistrer. Le critère reste rangé, non montré. */
    async function reglerPuisDecocher(page) {
        const r = await regler(page);
        await ouvrirFenetre(page);
        await caseDe(page, r.cat).uncheck();
        await caseDe(page, r.catPerso).uncheck();
        await enregistrer(page);
        await listeVide(page);
        expect((await criteresRanges(page)).lu, 'témoin : décocher n’efface pas').toEqual(r.attendu);
        return r;
    }

    test('cocher, écrire un critère, décocher, exporter, réimporter dans un espace vide, recocher : le critère est là', async ({ page, browser }) => {
        const r = await reglerPuisDecocher(page);
        const fichier = await exporterJeu(page);
        const c = contenuDe(fichier);
        expect(c.categories.some((k) => 'observation' in k), 'témoin : le fichier ne dit aucune catégorie d’observation').toBe(false);
        expect(Object.fromEntries(c.tampons.filter((t) => t.critere !== undefined).map((t) => [t.id, t.critere]))).toEqual(r.attendu);

        const ailleurs = await browser.newContext();
        const page2 = await ailleurs.newPage();
        await ouvrirCopie(page2);
        expect((await range(page2, PERS)).lu, 'témoin : l’espace est vide').toBe('(absente)');
        await importerJeu(page2, fichier);
        for (let i = 1; i <= 3; i++) {
            await ouvrirCopie(page2);
            await attendre(page2, 300);
            expect(['(absente)', null], `chargement ${i}, aucune catégorie d’observation`).toContainEqual((await range(page2, CLE)).lu);
            const cr = await criteresRanges(page2);
            expect(cr.lu, `chargement ${i}, critères lus`).toEqual(r.attendu);
            expect(cr.idb, `chargement ${i}, critères dans IndexedDB`).toEqual(r.attendu);
        }
        // Non montré tant que la catégorie n'est pas cochée ; recochée, le critère est dans son champ.
        await poserCibles(page2);
        await ouvrirFenetre(page2);
        for (const [cat, tampon] of [[r.cat, r.tampon], [r.catPerso, r.cree]]) {
            await expect(caseDe(page2, cat)).not.toBeChecked();
            await expect(critereDe(page2, tampon)).toBeHidden();
            await caseDe(page2, cat).check();
            await expect(critereDe(page2, tampon)).toBeVisible();
            await expect(critereDe(page2, tampon)).toHaveValue(r.attendu[tampon]);
        }
        await enregistrer(page2);
        await troisChargements(page2, [r.cat, r.catPerso].sort((a, b) => c.categories.findIndex((x) => x.id === a) - c.categories.findIndex((x) => x.id === b)), r.attendu);
        await ailleurs.close();
    });

    test('la bibliothèque, catégorie non cochée : ses cinq gestes emportent le critère', async ({ page, browser }) => {
        const r = await reglerPuisDecocher(page);
        const exporte = (appel) => page.evaluate(async ({ appel }) => {
            const avant = URL.createObjectURL;
            let lu = null;
            URL.createObjectURL = (b) => { lu = b; return avant.call(URL, b); };
            await window.tamponsBibliotheque[appel[0]](appel[1]);
            URL.createObjectURL = avant;
            return JSON.parse(await lu.text());
        }, { appel });
        // 1 et 2 : exporter un tampon, exporter une catégorie.
        expect((await exporte(['exporterUnTampon', r.cree])).tampons[0].critere, 'exporter un tampon').toBe(r.attendu[r.cree]);
        expect((await exporte(['exporterCategorie', r.catPerso])).tampons.find((t) => t.id === r.cree).critere, 'exporter une catégorie').toBe(r.attendu[r.cree]);
        // 3 et 4 : « Garder » un tampon, « Garder » une catégorie.
        const garder = (geste, arg) => page.evaluate(async ({ geste, arg, id }) => {
            window.db.setSync('bibliothequeTampons', []);   // security-ok: fixture de test (chaque geste part d'une bibliothèque vide)
            window.tamponsBibliotheque.afficherBibliothequeTampons();
            await window.tamponsBibliotheque[geste](arg);
            return (window.db.getSync('bibliothequeTampons', []) || []).find((t) => t.id === id) || null;
        }, { geste, arg, id: r.cree });
        expect((await garder('partagerTampon', r.cree)).critere, '« Garder » un tampon').toBe(r.attendu[r.cree]);
        const entree = await garder('partagerCategorie', r.catPerso);
        expect(entree.critere, '« Garder » une catégorie').toBe(r.attendu[r.cree]);
        // 5 : « Utiliser », dans un espace vide où aucune catégorie n'est d'observation.
        const ailleurs = await browser.newContext();
        const page2 = await ailleurs.newPage();
        await ouvrirCopie(page2);
        await page2.evaluate(async ({ entree }) => {
            await window.tamponsBibliotheque.importerDansBibliotheque([entree]);
            await window.tamponsBibliotheque.ajouterDepuisBibliotheque(entree.id);
        }, { entree });
        await attendre(page2, 300);
        await troisChargements(page2, '(absente)', { [r.cree]: r.attendu[r.cree] });
        await ailleurs.close();
    });
});

test.describe('Tampons d’observation, lot 1 — retouche : les deux titres', () => {
    const ANCIEN_TITRE = 'Tampons d’observation';

    test('la fenêtre s’intitule « Tampons et rétroactions », avec ou sans pratique par cibles', async ({ page }) => {
        await ouvrirCopie(page);
        await ouvrirFenetre(page);
        await expect(page.locator(`${M} h2`).first()).toHaveText('Tampons et rétroactions');
        await page.evaluate(() => window.travauxOutils.fermerModalRetroObservations());
        await poserCibles(page);
        await ouvrirFenetre(page);
        await expect(page.locator(`${M} h2`).first()).toHaveText('Tampons et rétroactions');
        expect(await page.locator(M).innerText()).not.toMatch(/Rétroactions\s*[—–-]\s*Observations/);
    });

    test('un jeu exporté s’intitule « Tampons » : c’est le titre demandé et celui que porte le fichier', async ({ page }) => {
        await ouvrirCopie(page);
        const fichier = await exporterJeu(page);
        expect(await page.evaluate(() => window.__titreDemande)).toBe('Tampons');
        expect(fichier.metadata.nom).toBe('Tampons');
        expect(JSON.stringify(fichier.metadata)).not.toContain('observation');
    });

    test('un fichier exporté hier, sous l’ancien titre, s’importe comme avant ; son titre s’affiche tel qu’il est écrit', async ({ page, browser }) => {
        const r = await regler(page);
        const fichier = await exporterJeu(page);
        fichier.metadata.nom = ANCIEN_TITRE;

        const ailleurs = await browser.newContext();
        const page2 = await ailleurs.newPage();
        await ouvrirCopie(page2);
        await ouvrirFenetre(page2);
        await page2.locator('#fichier-import-tampons').setInputFiles({ name: 'tampons-hier.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(fichier)) });
        const apercu = page2.locator('.modal-import-tampons');
        await expect(apercu.locator('.modal-js-contenu')).toBeVisible();   // l'enveloppe n'a pas de taille : c'est son contenu qu'on voit
        const cadre = apercu.locator('[data-apercu-cc-slot] iframe');
        await expect(cadre).toHaveCount(1);
        const srcdoc = await cadre.getAttribute('srcdoc');
        expect(srcdoc, 'le titre du fichier, tel qu’il est écrit').toContain('<p class="cc-badge-titre">' + ANCIEN_TITRE + '</p>');
        await apercu.locator('[data-action="travauxOutils.confirmerEtFermerImportTampons"]').click();
        await attendre(page2, 300);
        await troisChargements(page2, [r.cat, r.catPerso].sort((a, b) => contenuDe(fichier).categories.findIndex((x) => x.id === a) - contenuDe(fichier).categories.findIndex((x) => x.id === b)), r.attendu);
        await ailleurs.close();
    });

    test('la catégorie fournie « Observations » et les noms des tampons ne changent pas', async ({ page }) => {
        await ouvrirCopie(page);
        await ouvrirFenetre(page);
        const noms = await page.locator('#travaux-retro-categories input[data-cat-id]').evaluateAll((l) => l.map((i) => i.value));
        expect(noms).toContain('Observations');
    });
});
