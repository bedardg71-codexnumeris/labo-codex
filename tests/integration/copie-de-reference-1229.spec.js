import { test, expect } from '@playwright/test';
import { ouvrirCopie, attendre } from './harness/banc-copie-annotation.js';

// #1229 — LA COPIE DE RÉFÉRENCE (demande de Grégoire du 4 nov. 2026) : « Quand je fais l'évaluation d'un jeton, j'ai
// parfois besoin de comparer avec le travail original » ; « J'ai besoin de pouvoir zoomer dans les deux écrans. »
//
// Le banc : la copie FT651 du banc d'annotation (blanche) devient l'ORIGINAL ; on lui ajoute une REPRISE du même élève
// (FT652, grise), la copie d'un autre élève (FT653, bleue) et une copie sans fichier (FT654). Élèves fictifs.
//
// ⚠ CE BANC NE PROUVE PAS LE PINCEMENT RÉEL : les gestes sont fabriqués (molette avec Ctrl, événements tactiles). Le
// geste sur l'iPad passe par la porte terrain.

const BLANC = [255, 255, 255];
const GRIS = [128, 128, 128];
const BLEU = [120, 170, 230];

async function monterLeBanc(page) {
    const suivi = await ouvrirCopie(page);
    await page.evaluate(({ GRIS, BLEU }) => {
        const image = (rgb) => {
            const cv = document.createElement('canvas'); cv.width = 400; cv.height = 600;
            const cx = cv.getContext('2d'); cx.fillStyle = `rgb(${rgb.join(',')})`; cx.fillRect(0, 0, 400, 600);
            const octets = Uint8Array.from(atob(cv.toDataURL('image/png').split(',')[1]), (c) => c.charCodeAt(0));
            return new Blob([octets], { type: 'image/png' });
        };
        const blobs = { FT652: image(GRIS), FT653: image(BLEU), FT654: null };
        const lire = window.travauxStockage.recupererBlob;
        window.travauxStockage.recupererBlob = async function (id) {
            return id in blobs ? blobs[id] : lire.apply(this, arguments);
        };
        const eleves = window.db.getSync(window.cle('groupeEtudiants'));
        eleves.push({ da: 'TEST1210', nom: 'Hardie', prenom: 'Hirondelle', groupe: '01', coursId: 'cours-651' }); // security-ok: fixture de test
        eleves.push({ da: 'TEST1211', nom: 'Absente', prenom: 'Alouette', groupe: '01', coursId: 'cours-651' }); // security-ok: fixture de test
        window.db.setSync(window.cle('groupeEtudiants'), eleves);
        const base = window.db.getSync(window.cle('fichiersTravaux'))[0];
        const fichiers = [
            base,
            { ...base, id: 'FT652', nomFichier: 'COURAGEUX_Analyse1_reprise.png', estReprise: true },
            { ...base, id: 'FT653', etudiantDA: 'TEST1210', nomFichier: 'HARDIE_Analyse1.png' },
            { ...base, id: 'FT654', etudiantDA: 'TEST1211', nomFichier: 'ABSENTE_Analyse1.png', blobStatut: 'manquant' }
        ];
        window.db.setSync(window.cle('fichiersTravaux'), fichiers); // security-ok: fixture de test
        // L'annotation de la première évaluation : un trait rouge en travers du milieu de l'original.
        window.db.setSync(window.cle('annotationsTravaux'), [{ // security-ok: fixture de test
            id: 'ANN651', fichierId: 'FT651',
            pages: { 0: { strokes: [{ tool: 'stylo', color: '#ff0000', lineWidth: 60, opacity: 1,
                points: [{ x: 0.1, y: 0.5, pressure: 1 }, { x: 0.9, y: 0.5, pressure: 1 }] }], shapes: [], textAnnotations: [], stickers: [] } }
        }]);
    }, { GRIS, BLEU });
    return suivi;
}

const ouvrirLaCopie = async (page, id) => {
    await page.evaluate((id) => window.travauxUI.ouvrirFichier(id), id);
    await page.waitForFunction((id) => (window.travauxVisionneuse.getFichierActuel() || {}).id === id, id);
    await attendre(page, 800);
};

const ouvrirLaReference = async (page) => {
    await page.evaluate(() => window.travauxReference.ouvrir());
    await attendre(page, 800);
};

/** La couleur d'un point de la référence, en fractions de son canevas. */
const pixelReference = (page, fx, fy) => page.evaluate(([fx, fy]) => {
    const cv = document.getElementById('travaux-reference-canvas');
    const d = cv.getContext('2d').getImageData(Math.floor(cv.width * fx), Math.floor(cv.height * fy), 1, 1).data;
    return [d[0], d[1], d[2]];
}, [fx, fy]);

const proche = (a, b) => a.every((v, i) => Math.abs(v - b[i]) < 12);

/** Ctrl + molette (le pincement du trackpad du Mac), au milieu du cadre visé. */
const pincerTrackpad = async (page, idCadre, deltaY) => {
    await page.evaluate(({ idCadre, deltaY }) => {
        const c = document.getElementById(idCadre);
        const r = c.getBoundingClientRect();
        for (let i = 0; i < 4; i++) {
            c.dispatchEvent(new WheelEvent('wheel', { deltaY, ctrlKey: true, bubbles: true, cancelable: true,
                clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 }));
        }
    }, { idCadre, deltaY });
    await attendre(page, 500);
};

/** Deux doigts posés sur un élément, glissés de (dx, dy), levés. */
const glisserDeuxDoigts = async (page, idCible, dx, dy) => {
    const toucher = (nom, doigts, leves = []) => page.evaluate(({ nom, doigts, leves, idCible }) => {
        const liste = (l) => l.map((d) => ({ clientX: d.x, clientY: d.y, touchType: 'direct' }));
        const ev = new Event(nom, { bubbles: true, cancelable: true });
        ev.touches = liste(doigts);
        ev.changedTouches = liste(leves);
        document.getElementById(idCible).dispatchEvent(ev);
    }, { nom, doigts, leves, idCible });
    await toucher('touchstart', [{ x: 300, y: 300 }, { x: 400, y: 300 }]);
    await toucher('touchmove', [{ x: 300 + dx, y: 300 + dy }, { x: 400 + dx, y: 300 + dy }]);
    await toucher('touchend', [], [{ x: 300 + dx, y: 300 + dy }, { x: 400 + dx, y: 300 + dy }]);
};

const defilement = (page, id) => page.evaluate((id) => {
    const c = document.getElementById(id);
    return { x: c.scrollLeft, y: c.scrollTop };
}, id);

const poserDefilement = (page, id) => page.evaluate((id) => {
    const c = document.getElementById(id);
    c.scrollLeft = 200; c.scrollTop = 100;
}, id);

test.describe('#1229 — la copie de référence', () => {
    test('une reprise ouverte : la référence montre l’original et ses annotations', async ({ page }) => {
        const suivi = await monterLeBanc(page);
        await ouvrirLaCopie(page, 'FT652');
        await ouvrirLaReference(page);

        expect(await page.evaluate(() => window.travauxReference.getFichier().id)).toBe('FT651');
        expect(await page.evaluate(() => window.travauxVisionneuse.getFichierActuel().id)).toBe('FT652');
        // L'original vient d'abord, nommé comme tel ; la copie annotée n'est pas proposée.
        const options = await page.evaluate(() => Array.from(document.querySelectorAll('#travaux-reference-choix option'))
            .map((o) => ({ v: o.value, t: o.textContent, s: o.selected })));
        expect(options.map((o) => o.v)).toEqual(['FT651', 'FT654', 'FT653']);
        expect(options[0].s).toBe(true);
        expect(options[0].t).toBe('Courageux, Condor (original)');
        // La copie de l'original (blanche, et non la grise de la reprise), et le trait rouge de son annotation.
        expect(proche(await pixelReference(page, 0.5, 0.2), BLANC)).toBe(true);
        const milieu = await pixelReference(page, 0.5, 0.5);
        expect(milieu[0]).toBeGreaterThan(200);
        expect(milieu[1]).toBeLessThan(80);
        // Le témoin : la copie annotée est bien la grise.
        expect(await page.evaluate(() => {
            const cv = document.getElementById('travaux-canvas-document');
            const d = cv.getContext('2d').getImageData(Math.floor(cv.width / 2), Math.floor(cv.height / 5), 1, 1).data;
            return [d[0], d[1], d[2]];
        }).then((c) => proche(c, GRIS))).toBe(true);
        expect(suivi.erreurs).toEqual([]);
    });

    // Retour de Grégoire du 5 nov. 2026, 8 h 41, sur l'iPad : « Le Split Screen n'affiche que la première page du travail
    // original, même s'il est composé de plusieurs pages. » L'indicateur disait « 1/1 » et « page suivante » restait
    // grisé : `_message('')`, appelé APRÈS le chargement, remettait le compte des pages à 1. Le banc d'origine n'avait
    // que des images d'une page : il ne pouvait pas le voir.
    test('un original de plusieurs pages : la référence les compte et les parcourt toutes', async ({ page }) => {
        const suivi = await monterLeBanc(page);
        await page.evaluate(async ({ BLEU, GRIS }) => {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({ unit: 'pt', format: [400, 600] });
            [[255, 255, 255], BLEU, GRIS].forEach((rgb, i) => {
                if (i) doc.addPage([400, 600]);
                doc.setFillColor(rgb[0], rgb[1], rgb[2]);
                doc.rect(0, 0, 400, 600, 'F');
            });
            const pdf = doc.output('blob');
            const lire = window.travauxStockage.recupererBlob;
            window.travauxStockage.recupererBlob = async function (id) {
                return id === 'FT651' ? pdf : lire.apply(this, arguments);
            };
            const fichiers = window.db.getSync(window.cle('fichiersTravaux'))
                .map((f) => f.id === 'FT651' ? { ...f, typeMIME: 'application/pdf', nomFichier: 'COURAGEUX_Analyse1.pdf' } : f);
            window.db.setSync(window.cle('fichiersTravaux'), fichiers); // security-ok: fixture de test
        }, { BLEU, GRIS });
        await ouvrirLaCopie(page, 'FT652');
        await ouvrirLaReference(page);

        expect(await page.evaluate(() => window.travauxReference.getFichier().id)).toBe('FT651');
        const indicateur = page.locator('#travaux-reference-indicateur');
        const suivante = page.locator('#travaux-reference-page-suiv');
        expect(await indicateur.textContent()).toBe('1/3');
        expect(await suivante.isDisabled()).toBe(false);
        expect(proche(await pixelReference(page, 0.5, 0.2), BLANC)).toBe(true);

        await suivante.click();
        await attendre(page, 500);
        expect(await indicateur.textContent()).toBe('2/3');
        expect(proche(await pixelReference(page, 0.5, 0.2), BLEU)).toBe(true);

        await suivante.click();
        await attendre(page, 500);
        expect(await indicateur.textContent()).toBe('3/3');
        expect(proche(await pixelReference(page, 0.5, 0.2), GRIS)).toBe(true);
        expect(await suivante.isDisabled()).toBe(true);
        expect(await page.locator('#travaux-reference-page-prec').isDisabled()).toBe(false);
        expect(suivi.erreurs).toEqual([]);
    });

    // Les mots validés par Grégoire le 4 nov. 2026 au soir, écrits en toutes lettres : l'essai ne relit pas MOTS, il
    // rougit si une phrase bouge.
    test('les mots d’écran, tels que Grégoire les a validés', async ({ page }) => {
        const suivi = await monterLeBanc(page);
        await ouvrirLaCopie(page, 'FT653');
        expect((await page.locator('#travaux-btn-reference').textContent()).trim()).toBe('Copie de référence');
        await ouvrirLaReference(page);
        expect(await page.locator('#travaux-reference .travaux-reference-etiquette').textContent()).toBe('Référence');
        expect(await page.locator('#travaux-reference-message').textContent()).toBe('Choisis la copie à mettre en regard.');
        const textes = await page.evaluate(() => Array.from(document.querySelectorAll('#travaux-reference-choix option'))
            .map((o) => ({ v: o.value, t: o.textContent })));
        expect(textes[0]).toEqual({ v: '', t: 'Choisir une copie…' });
        const texteDe = (id) => textes.find((o) => o.v === id).t;
        // Vue depuis la copie d'Hardie : la copie de Courageux n'est pas SON original, seule la reprise est précisée.
        expect(texteDe('FT651')).toBe('Courageux, Condor');
        expect(texteDe('FT652')).toBe('Courageux, Condor (reprise)');
        expect(texteDe('FT654')).toBe('Absente, Alouette');
        expect(await page.locator('#travaux-reference [data-action="travauxReference.fermer"]').getAttribute('title')).toBe('Fermer la copie de référence');
        expect(await page.locator('#travaux-reference-axe').textContent()).toBe('Côte à côte');
        await page.click('#travaux-reference-axe');
        await attendre(page, 400);
        expect(await page.locator('#travaux-reference-axe').textContent()).toBe('L’une sous l’autre');

        // Une copie aux archives dit la phrase de la Réserve ; une copie introuvable, la sienne.
        const message = page.locator('#travaux-reference-message');
        await page.evaluate(async () => {
            const RC = window.ReserveCopies;
            const estAuxArchives = RC.estAuxArchives;
            RC.estAuxArchives = (id) => id === 'FT654' || estAuxArchives(id);
            await window.travauxReference.afficherCopie('FT654');
        });
        expect(await message.textContent()).toBe('Cette copie est aux archives.');
        await page.evaluate(() => window.travauxReference.afficherCopie('FT999'));
        expect(await message.textContent()).toBe('Cette copie ne s’ouvre pas ici.');

        // Une production à une seule copie.
        await page.evaluate(() => window.travauxReference.fermer());
        await page.evaluate(() => {
            const seule = window.db.getSync(window.cle('fichiersTravaux')).filter((f) => f.id === 'FT653');
            window.db.setSync(window.cle('fichiersTravaux'), seule); // security-ok: fixture de test
        });
        await ouvrirLaReference(page);
        expect(await message.textContent()).toBe('Aucune autre copie de cette production.');
        expect(suivi.erreurs).toEqual([]);
    });

    test('une copie qui n’est pas une reprise : la référence invite à choisir, puis montre la copie choisie', async ({ page }) => {
        const suivi = await monterLeBanc(page);
        await ouvrirLaCopie(page, 'FT653');
        await ouvrirLaReference(page);
        expect(await page.evaluate(() => window.travauxReference.getFichier())).toBe(null);
        expect(await page.locator('#travaux-reference-message').textContent()).toBe('Choisis la copie à mettre en regard.');
        await page.selectOption('#travaux-reference-choix', 'FT652');
        await attendre(page, 600);
        expect(await page.evaluate(() => window.travauxReference.getFichier().id)).toBe('FT652');
        expect(proche(await pixelReference(page, 0.5, 0.2), GRIS)).toBe(true);
        expect(suivi.erreurs).toEqual([]);
    });

    test('une copie sans fichier : la référence le dit, sans planter', async ({ page }) => {
        const suivi = await monterLeBanc(page);
        await ouvrirLaCopie(page, 'FT652');
        await ouvrirLaReference(page);
        await page.selectOption('#travaux-reference-choix', 'FT654');
        await attendre(page, 600);
        const message = page.locator('#travaux-reference-message');
        await expect(message).toBeVisible();
        expect(await message.textContent()).toBe(await page.evaluate(() => window.travauxVisionneuse.MOTS_SANS_FICHIER.manquant));
        expect(await page.locator('#travaux-reference-feuille').isVisible()).toBe(false);
        expect(suivi.erreurs).toEqual([]);
    });

    test('zoomer dans l’une ne change pas le zoom de l’autre', async ({ page }) => {
        await monterLeBanc(page);
        await ouvrirLaCopie(page, 'FT652');
        await ouvrirLaReference(page);
        const zooms = () => page.evaluate(() => ({ ref: window.travauxReference.getZoom(), annotee: window.travauxVisionneuse.getZoomActuel() }));

        const z0 = await zooms();
        await pincerTrackpad(page, 'travaux-reference-cadre', -20);
        const z1 = await zooms();
        expect(z1.ref).toBeGreaterThan(z0.ref * 1.2);           // témoin : la référence a zoomé
        expect(z1.annotee).toBe(z0.annotee);

        await pincerTrackpad(page, 'travaux-canvas-container', -20);
        const z2 = await zooms();
        expect(z2.annotee).toBeGreaterThan(z1.annotee * 1.2);   // témoin : la copie annotée a zoomé
        expect(z2.ref).toBe(z1.ref);

        // Les boutons de la référence ne touchent que la référence.
        await page.click('#travaux-reference [data-action="travauxReference.zoomArriere"]');
        await attendre(page, 300);
        const z3 = await zooms();
        expect(z3.ref).toBeLessThan(z2.ref);
        expect(z3.annotee).toBe(z2.annotee);
    });

    test('deux doigts font défiler chaque copie dans son cadre, et la fermeture rend ses gestes à Annoter', async ({ page }) => {
        await monterLeBanc(page);
        await ouvrirLaCopie(page, 'FT652');
        await ouvrirLaReference(page);
        // La référence zoomée, pour qu'elle ait de quoi défiler.
        await page.evaluate(async () => { for (let i = 0; i < 10; i++) await window.travauxReference.zoomAvant(); });

        await poserDefilement(page, 'travaux-reference-cadre');
        await poserDefilement(page, 'travaux-canvas-container');
        await glisserDeuxDoigts(page, 'travaux-reference-canvas', -40, -30);
        expect(await defilement(page, 'travaux-reference-cadre')).toEqual({ x: 240, y: 130 });
        expect(await defilement(page, 'travaux-canvas-container')).toEqual({ x: 200, y: 100 });

        await glisserDeuxDoigts(page, 'travaux-canvas-annotation', -40, -30);
        expect(await defilement(page, 'travaux-canvas-container')).toEqual({ x: 240, y: 130 });
        expect(await defilement(page, 'travaux-reference-cadre')).toEqual({ x: 240, y: 130 });

        await page.click('#travaux-reference [data-action="travauxReference.fermer"]');
        await attendre(page, 300);
        expect(await page.locator('#travaux-reference').count()).toBe(0);
        expect(await page.evaluate(() => document.getElementById('travaux-zone-canvas').className)).toBe('travaux-zone-canvas');
        await poserDefilement(page, 'travaux-canvas-container');
        await glisserDeuxDoigts(page, 'travaux-canvas-annotation', 40, 30);
        expect(await defilement(page, 'travaux-canvas-container')).toEqual({ x: 160, y: 70 });
        // Et le pincement du trackpad zoome toujours la copie annotée.
        const avant = await page.evaluate(() => window.travauxVisionneuse.getZoomActuel());
        await pincerTrackpad(page, 'travaux-canvas-container', -20);
        expect(await page.evaluate(() => window.travauxVisionneuse.getZoomActuel())).toBeGreaterThan(avant * 1.2);
    });

    test('en Évaluer aussi : la référence s’ouvre, et deux doigts font toujours défiler la copie évaluée', async ({ page }) => {
        const suivi = await monterLeBanc(page);
        await ouvrirLaCopie(page, 'FT652');
        await page.evaluate(() => window.travauxUI.basculerMode('evaluer'));
        await page.waitForFunction(() => window.travauxUI.getModeCourant() === 'evaluer');
        await attendre(page, 600);
        await ouvrirLaReference(page);
        expect(await page.evaluate(() => window.travauxReference.getFichier().id)).toBe('FT651');
        await poserDefilement(page, 'travaux-canvas-container');
        await glisserDeuxDoigts(page, 'travaux-canvas-annotation', -40, -30);
        expect(await defilement(page, 'travaux-canvas-container')).toEqual({ x: 240, y: 130 });
        expect(suivi.erreurs).toEqual([]);
    });

    test('la bascule d’axe : l’une sous l’autre, puis côte à côte, retenu à la réouverture ; la copie annotée retrouve son zoom', async ({ page }) => {
        await monterLeBanc(page);
        await ouvrirLaCopie(page, 'FT652');
        const zoomAnnoteAvant = await page.evaluate(() => window.travauxVisionneuse.getZoomActuel());
        await ouvrirLaReference(page);
        const positions = () => page.evaluate(() => {
            const a = document.getElementById('travaux-canvas-container').getBoundingClientRect();
            const r = document.getElementById('travaux-reference').getBoundingClientRect();
            return { aBas: a.bottom, aDroite: a.right, aLargeur: a.width, rHaut: r.top, rGauche: r.left };
        });
        let p = await positions();
        expect(p.rHaut).toBeGreaterThanOrEqual(p.aBas - 1);     // l'une sous l'autre, par défaut
        expect(await page.locator('#travaux-reference-axe').textContent()).toBe('Côte à côte');
        // L'une sous l'autre, la copie annotée garde sa largeur : on n'y touche pas.
        expect(await page.evaluate(() => window.travauxVisionneuse.getZoomActuel())).toBe(zoomAnnoteAvant);

        await page.click('#travaux-reference-axe');
        await attendre(page, 600);
        p = await positions();
        expect(p.rGauche).toBeGreaterThanOrEqual(p.aDroite - 1);
        expect(await page.evaluate(() => window.obtenirPreference('axeCopieReference'))).toBe('cote');
        // Côte à côte, la copie annotée tient dans sa moitié.
        const largeurCopie = await page.evaluate(() => document.getElementById('travaux-canvas-document').getBoundingClientRect().width);
        expect(largeurCopie).toBeLessThanOrEqual(p.aLargeur);

        await page.evaluate(() => window.travauxReference.fermer());
        await attendre(page, 600);
        expect(await page.evaluate(() => window.travauxVisionneuse.getZoomActuel())).toBeCloseTo(zoomAnnoteAvant, 5);
        await ouvrirLaReference(page);
        p = await positions();
        expect(p.rGauche).toBeGreaterThanOrEqual(p.aDroite - 1);  // retenu
        await page.click('#travaux-reference-axe');
        await attendre(page, 600);
        p = await positions();
        expect(p.rHaut).toBeGreaterThanOrEqual(p.aBas - 1);
        expect(await page.evaluate(() => window.obtenirPreference('axeCopieReference'))).toBe('pile');
    });

    // #1234, retour de Grégoire du 5 nov. 2026, 10 h 13, sur l'iPad : « L'anonymisation dans le Split Screen
    // ne s'opère pas dans l'identification de l'élève et de la copie originale. » La référence ouverte, puis
    // le mode changé sans changer de copie : le menu gardait le vrai nom. Il suit désormais le mode, dans les
    // deux sens, sans recharger la copie de référence.
    test('#1234 — le mode anonymisé change, la référence ouverte : son menu suit, sans recharger la copie', async ({ page }) => {
        const suivi = await monterLeBanc(page);
        await ouvrirLaCopie(page, 'FT652');
        await ouvrirLaReference(page);
        const choisie = () => page.evaluate(() => {
            const o = document.querySelector('#travaux-reference-choix option:checked');
            return { v: o.value, t: o.textContent };
        });
        expect(await choisie()).toEqual({ v: 'FT651', t: 'Courageux, Condor (original)' });
        // Le témoin du « sans recharger » : un zoom posé AVANT la bascule. `afficherCopie` le remet à la
        // pleine largeur ; s'il survit aux deux bascules, la copie de référence n'a pas été rechargée.
        const zoomInitial = await page.evaluate(() => window.travauxReference.getZoom());
        await page.evaluate(() => window.travauxReference.zoomAvant());
        await attendre(page, 400);
        const zoomPose = await page.evaluate(() => window.travauxReference.getZoom());
        expect(zoomPose).not.toBe(zoomInitial);

        await page.evaluate(() => basculerModeAnonymisation());
        await attendre(page, 800);
        const anonyme = await page.evaluate(() => String(anonymiserNom(window.travauxStockage.obtenirFichierParId('FT651').etudiantDA)));
        expect(anonyme).not.toContain('Courageux');
        expect(await choisie()).toEqual({ v: 'FT651', t: anonyme + ' (original)' });
        const tous = await page.evaluate(() => Array.from(document.querySelectorAll('#travaux-reference-choix option')).map((o) => o.textContent).join(' | '));
        expect(tous).not.toMatch(/Courageux|Condor|Hardie|Hirondelle|Absente|Alouette/);

        await page.evaluate(() => basculerModeAnonymisation());
        await attendre(page, 800);
        expect(await choisie()).toEqual({ v: 'FT651', t: 'Courageux, Condor (original)' });
        expect(await page.evaluate(() => window.travauxReference.getZoom())).toBe(zoomPose);
        expect(await page.evaluate(() => window.travauxReference.getFichier().id)).toBe('FT651');
        expect(suivi.erreurs).toEqual([]);
    });

    test('aucune donnée écrite : ouvrir, zoomer, changer de copie, fermer laissent le stockage identique', async ({ page }) => {
        await monterLeBanc(page);
        await ouvrirLaCopie(page, 'FT652');
        await attendre(page, 1500);   // les écritures de l'ouverture de la copie annotée sont passées
        await page.evaluate(() => {
            window.__ecritures1229 = [];
            const setSync = window.db.setSync.bind(window.db);
            window.db.setSync = function (cle, v) { window.__ecritures1229.push('db:' + cle); return setSync(cle, v); };
            const setItem = Storage.prototype.setItem;
            Storage.prototype.setItem = function (cle, v) { window.__ecritures1229.push('ls:' + cle); return setItem.call(this, cle, v); };
            const photo = () => {
                const o = {};
                for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); o['ls:' + k] = localStorage.getItem(k); }
                for (const k of ['annotationsTravaux', 'fichiersTravaux', 'evaluationsSauvegardees']) o['db:' + k] = JSON.stringify(window.db.getSync(window.cle(k)));
                return o;
            };
            window.__photo1229 = photo;
            window.__avant1229 = photo();
        });
        await ouvrirLaReference(page);
        await pincerTrackpad(page, 'travaux-reference-cadre', -20);
        await page.click('#travaux-reference [data-action="travauxReference.zoomAvant"]');
        await page.click('#travaux-reference [data-action="travauxReference.zoomLargeur"]');
        await page.selectOption('#travaux-reference-choix', 'FT653');
        await attendre(page, 500);
        await page.selectOption('#travaux-reference-choix', 'FT654');
        await attendre(page, 500);
        await page.click('#travaux-reference [data-action="travauxReference.fermer"]');
        await attendre(page, 500);
        const bilan = await page.evaluate(() => ({ ecritures: window.__ecritures1229, egal: JSON.stringify(window.__photo1229()) === JSON.stringify(window.__avant1229) }));
        expect(bilan.ecritures).toEqual([]);
        expect(bilan.egal).toBe(true);

        // Témoin : l'espion voit bien une écriture, celle de la bascule d'axe (la préférence, et elle seule).
        await ouvrirLaReference(page);
        await page.click('#travaux-reference-axe');
        await attendre(page, 300);
        const ecrites = await page.evaluate(() => window.__ecritures1229);
        expect(ecrites.length).toBeGreaterThan(0);
        expect(ecrites.every((k) => /preferencesUtilisateur/.test(k))).toBe(true);
    });
});
