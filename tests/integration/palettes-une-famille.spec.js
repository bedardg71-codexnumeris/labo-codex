import { test, expect } from '@playwright/test';
import { ouvrirCopie, attendre, pointCanevas } from './harness/banc-copie-annotation.js';

// LES PALETTES D'ANNOTER ET D'ÉVALUER, UNE MÊME FAMILLE (consigne du 2 nov. 2026).
// « L'idée, c'est de pouvoir utiliser le plus d'espace pour les palettes sur la hauteur et de laisser de l'espace pour la
// copie à annoter sur la largeur. » Même en-tête, un seul bouton de version, aucun nom coupé, un seul verrou.
// Aux deux formats de la consigne. Noms fictifs (règle 6).

const FORMATS = [{ width: 1180, height: 820 }, { width: 1280, height: 720 }];
const ANNOTER = ['travaux-palette-flottante', 'travaux-palette-erreurs-fr', 'travaux-palette-tampons'];
const EVALUER = ['travaux-palette-eval-gauche', 'travaux-palette-eval-droite', 'travaux-palette-eval-retro'];
const CODES = 'travaux-palette-erreurs-fr';

/** Les trois palettes d'Annoter ouvertes. */
async function ouvrirAnnoter(page, avant) {
    await ouvrirCopie(page);
    if (avant) await page.evaluate(avant);
    await page.evaluate(() => {
        if (!document.getElementById('travaux-palette-tampons')) window.travauxOutils.togglePaletteAutocollants();
        if (!document.getElementById('travaux-palette-erreurs-fr')) window.travauxOutils.togglePaletteErreursFrancais();
    });
    await page.waitForSelector('#travaux-palette-erreurs-fr .travaux-errfr-item');
}

/** Les palettes d'Évaluer, sur la même copie. */
async function ouvrirEvaluer(page) {
    await page.evaluate(() => window.travauxUI.basculerMode('evaluer'));
    await page.waitForFunction(() => window.travauxUI.getModeCourant() === 'evaluer' && !!document.getElementById('travaux-palette-eval-retro'), null, { timeout: 10000 });
    await attendre(page, 300);
}

/** Les boutons de droite de l'en-tête : ce que dit chacun (texte, sinon son aria-label). */
const entete = (page, id) => page.evaluate((id) => {
    const b = document.querySelector(`#${id} > .palette-flottante-barre .palette-barre-droite`);
    return [...b.querySelectorAll('button')].filter((x) => x.offsetParent).map((x) => x.classList.contains('palette-bouton-version') ? 'version' : (x.textContent.trim() || x.getAttribute('aria-label') || x.title));
}, id);

for (const vp of FORMATS) {
    test.describe(`à ${vp.width} × ${vp.height}`, () => {
        test.use({ viewport: vp });

        test('§ 1 — aucun ↔ ni ↕ ; le bouton de version là où il y a deux versions, et nulle part ailleurs', async ({ page }) => {
            await ouvrirAnnoter(page);
            const fleches = (ids) => page.evaluate((ids) => ids.map((id) => document.getElementById(id).querySelector(':scope > .palette-flottante-barre').textContent).join('').match(/[↔↕]/g), ids);
            expect(await fleches(ANNOTER)).toBeNull();
            expect(await entete(page, CODES)).toEqual(['version', '−']);
            expect(await entete(page, 'travaux-palette-flottante')).toEqual(['version', '−']);
            expect(await entete(page, 'travaux-palette-tampons')).toEqual(['version', '−']);
            const titre = await page.evaluate((id) => document.querySelector(`#${id} .palette-bouton-version`).title, CODES);
            expect(titre).toBe('Passer à la version compacte');

            await ouvrirEvaluer(page);
            expect(await fleches(EVALUER)).toBeNull();
            expect(await entete(page, 'travaux-palette-eval-droite')).toEqual(['version', '−']);
            expect(await entete(page, 'travaux-palette-eval-retro')).toEqual(['−']);
            expect((await entete(page, 'travaux-palette-eval-gauche')).includes('version')).toBe(false);
            // Même en-tête qu'en Annoter : la poignée et le nom à gauche, les boutons à droite, collés au bord.
            const forme = await page.evaluate((ids) => ids.map((id) => {
                const b = document.querySelector(`#${id} > .palette-flottante-barre`);
                const d = b.querySelector('.palette-barre-droite');
                return !!b.querySelector('.palette-barre-gauche .palette-grip') && !!d && Math.abs(d.getBoundingClientRect().right - b.getBoundingClientRect().right) < 16;
            }), EVALUER);
            expect(forme).toEqual([true, true, true]);
        });

        test('§ 1 — le compte de Codes tient sur une ligne, en étendue comme en compacte, sans toucher l’engrenage', async ({ page }) => {
            await ouvrirAnnoter(page);
            // 23 codes posés sur la copie.
            await page.evaluate(() => {
                const ids = [...document.querySelectorAll('#travaux-palette-erreurs-fr .travaux-errfr-compteur')].map((b) => b.dataset.erreur);
                const a = window.travauxAnnotation.getAnnotationCourante();
                const pg = Object.values(a.pages)[0];
                pg.shapes = pg.shapes || [];
                for (let i = 0; i < 23; i++) pg.shapes.push({ id: 'fam' + i, type: ids[i % 3], x: 10, y: 10 });
                window.travauxOutils.mettreAJourCompteursErreurs();
            });
            const lire = () => page.evaluate((id) => {
                const b = document.querySelector(`#${id} > .palette-flottante-barre`);
                const r = (sel) => b.querySelector(sel).getBoundingClientRect();
                const titre = r('.palette-flottante-titre'), pastille = r('#travaux-errfr-total-pastille'), roue = r('img[src*="icon-gear"]'), version = r('.palette-bouton-version');
                return {
                    uneLigne: titre.height < 22 && Math.abs(pastille.top - titre.top) < 6,
                    pastille: b.querySelector('#travaux-errfr-total-pastille').textContent,
                    mots: b.querySelector('#travaux-errfr-total-pastille').getAttribute('aria-label'),
                    avantRoue: pastille.right + 2 <= roue.left,
                    roueAvantVersion: roue.right + 2 <= version.left,
                    barreUneLigne: b.getBoundingClientRect().height < 40
                };
            }, CODES);
            const attendu = { uneLigne: true, pastille: '23', mots: '23 erreurs', avantRoue: true, roueAvantVersion: true, barreUneLigne: true };
            expect(await lire(), 'étendue').toEqual(attendu);
            await page.evaluate((id) => document.querySelector(`#${id} .palette-bouton-version`).click(), CODES);
            expect(await page.evaluate((id) => document.getElementById(id).classList.contains('codes-compacte'), CODES)).toBe(true);
            expect(await lire(), 'compacte').toEqual(attendu);
        });
    });
}

/** Les tuiles visibles d'une palette, et leurs dimensions. */
const tuiles = (page, id) => page.evaluate((id) => [...document.querySelectorAll(`#${id} .annot-tuile, #${id} .travaux-autocollant-item`)]
    .filter((t) => t.offsetParent).map((t) => { const r = t.getBoundingClientRect(); return { nom: t.textContent.trim(), l: r.width, h: r.height }; }), id);

/** La palette Annotation dans la zone, et « Annuler » visible dedans. */
const annulerVisible = (page) => page.evaluate(() => {
    const p = document.getElementById('travaux-palette-flottante').getBoundingClientRect();
    const z = document.getElementById('travaux-zone-canvas').getBoundingClientRect();
    const u = document.getElementById('travaux-btn-undo').getBoundingClientRect();
    const touche = document.elementFromPoint(u.left + u.width / 2, u.top + u.height / 2);
    return { dansLaZone: p.top >= z.top - 0.5 && p.bottom <= z.bottom + 0.5, annuler: u.top >= p.top && u.bottom <= p.bottom && !!touche && !!touche.closest('#travaux-btn-undo') };
});

for (const vp of FORMATS) {
    test.describe(`§ 2 — l’Annotation étendue, à ${vp.width} × ${vp.height}`, () => {
        test.use({ viewport: vp });

        test('par défaut : l’étendue, ses rangées dans l’ordre, aucune tuile sous 44 px, « Annuler » visible hors et en plein écran', async ({ page }) => {
            await ouvrirAnnoter(page);
            const m = await page.evaluate(() => {
                const p = document.getElementById('travaux-palette-flottante');
                const rangee = (sel) => [...p.querySelectorAll(sel)].map((t) => t.querySelector('.annot-tuile-nom').textContent);
                return {
                    compacte: p.classList.contains('annotation-compacte'), largeur: p.getBoundingClientRect().width,
                    intertitres: [...p.querySelectorAll('.travaux-palette-label')].map((l) => l.textContent),
                    actions: rangee('.annot-actions .annot-tuile'),
                    actionsEnBas: (() => { const a = p.querySelector('.annot-actions'); return !a.nextElementSibling; })(),
                    extremites: rangee('#travaux-options-fleche .annot-tuile'),
                    couleursParRangee: new Set([...p.querySelectorAll('.annot-couleurs .travaux-btn-couleur')].map((c) => Math.round(c.getBoundingClientRect().top))).size,
                    vieilleBande: p.querySelectorAll('.annot-bande, .annot-effacer').length
                };
            });
            expect(m).toEqual({
                compacte: false, largeur: 200,
                intertitres: ['Outils', 'Formes', 'Lignes', 'Extrémités', 'Couleurs', 'Épaisseur'],
                actions: ['Annuler', 'Supprimer', 'Rétablir', 'Effacer la page'], actionsEnBas: true,
                extremites: ['Début', 'Double', 'Fin', 'Aucune'], couleursParRangee: 2, vieilleBande: 0
            });
            for (const t of await tuiles(page, 'travaux-palette-flottante')) {
                expect(t.l, t.nom).toBeGreaterThanOrEqual(44);
                expect(t.h, t.nom).toBeGreaterThanOrEqual(44);
            }
            expect(await annulerVisible(page), 'hors plein écran').toEqual({ dansLaZone: true, annuler: true });
            await page.evaluate(() => window.travauxUI.togglePleinEcran());
            await attendre(page, 200);
            expect(await annulerVisible(page), 'en plein écran').toEqual({ dansLaZone: true, annuler: true });
            // En plein écran, elle tient entière : rien ne défile.
            expect(await page.evaluate(() => { const p = document.getElementById('travaux-palette-flottante'); return p.scrollHeight <= p.clientHeight + 1; })).toBe(true);
        });
    });
}

test.describe('§ 2 — les deux versions, un seul jeu d’actions', () => {
    test.use({ viewport: FORMATS[0] });

    test('l’outil, l’extrémité, la couleur et Annuler passent d’une version à l’autre', async ({ page }) => {
        await ouvrirAnnoter(page);
        const tuile = (sel) => page.evaluate((sel) => document.querySelector('#travaux-palette-flottante ' + sel).click(), sel);
        await tuile('[data-outil="stylo"]');
        await tuile('[data-pointes="fin"]');
        await tuile('.travaux-btn-couleur[data-couleur="#22c55e"], .travaux-btn-couleur:nth-child(4)');
        // Un trait à la souris sur la copie : Annuler s'allume.
        const a = await pointCanevas(page, 0.3, 0.3), b = await pointCanevas(page, 0.6, 0.5);
        await page.mouse.move(a.x, a.y);
        await page.mouse.down();
        for (let i = 1; i <= 8; i++) await page.mouse.move(a.x + (b.x - a.x) * i / 8, a.y + (b.y - a.y) * i / 8);
        await page.mouse.up();
        await page.waitForFunction(() => document.getElementById('travaux-btn-undo').disabled === false);
        const etat = () => page.evaluate(() => {
            const p = document.getElementById('travaux-palette-flottante');
            return {
                outil: [...p.querySelectorAll('[data-outil].actif')].map((b) => b.dataset.outil),
                pointe: [...p.querySelectorAll('[data-pointes].actif')].map((b) => b.dataset.pointes),
                couleur: [...p.querySelectorAll('.travaux-btn-couleur.actif')].map((b) => b.dataset.couleur),
                annuler: document.getElementById('travaux-btn-undo').disabled === false,
                ids: ['travaux-btn-undo', 'travaux-btn-redo', 'travaux-btn-supprimer', 'travaux-btn-dupliquer'].map((id) => document.querySelectorAll('#' + id).length)
            };
        });
        const etendue = await etat();
        expect(etendue.outil).toEqual(['stylo']);
        expect(etendue.pointe).toEqual(['fin']);
        expect(etendue.couleur.length).toBe(1);
        expect(etendue.annuler).toBe(true);
        await page.evaluate(() => document.querySelector('#travaux-palette-flottante .palette-bouton-version').click());
        expect(await page.evaluate(() => document.getElementById('travaux-palette-flottante').classList.contains('annotation-compacte'))).toBe(true);
        expect(await etat()).toEqual(etendue);
        // Annuler, dans la compacte, annule le trait posé dans l'étendue.
        await page.evaluate(() => document.getElementById('travaux-btn-undo').click());
        await page.waitForFunction(() => document.getElementById('travaux-btn-undo').disabled === true);
        expect(await page.evaluate(() => window.obtenirPreference('paletteAnnotationCompacte'))).toBe(true);
    });
});

/** Les noms de Tampons (tuiles et titres de catégorie) qui débordent de leur boîte : un nom coupé ou qui dépasse. */
const nomsCoupes = (page) => page.evaluate(() => {
    const p = document.getElementById('travaux-palette-tampons');
    return [...p.querySelectorAll('.travaux-autocollant-nom, .tampons-categorie-nom')].filter((s) => s.offsetParent).filter((s) => {
        const boite = s.closest('.travaux-autocollant-item, .tampons-categorie-titre').getBoundingClientRect();
        const r = s.getBoundingClientRect();
        return s.scrollWidth > s.clientWidth + 1 || s.scrollHeight > s.clientHeight + 1 || r.left < boite.left - 0.5 || r.right > boite.right + 0.5
            || getComputedStyle(s).textOverflow === 'ellipsis';
    }).map((s) => s.textContent);
});

for (const vp of FORMATS) {
    test.describe(`§ 3 — Tampons, à ${vp.width} × ${vp.height}`, () => {
        test.use({ viewport: vp });

        test('l’étendue : aucun nom coupé, tuiles et titres de catégorie ; aucune tuile sous 44 px', async ({ page }) => {
            await ouvrirAnnoter(page);
            const m = await page.evaluate(() => {
                const p = document.getElementById('travaux-palette-tampons');
                return { compacte: p.classList.contains('tampons-compacte'), largeur: Math.round(p.getBoundingClientRect().width),
                    noms: p.querySelectorAll('.travaux-autocollant-nom').length, zone: p.querySelector('#travaux-tampons-nom-actif').offsetParent === null };
            });
            expect(m.compacte).toBe(false);
            expect(m.largeur).toBe(200);
            expect(m.noms).toBeGreaterThan(10);
            expect(m.zone, 'la zone du nom ne paraît qu’en compacte').toBe(true);
            expect(await nomsCoupes(page)).toEqual([]);
            for (const t of await tuiles(page, 'travaux-palette-tampons')) expect(t.h, t.nom).toBeGreaterThanOrEqual(44);
        });

        test('la compacte : les icônes seules, le nom du tampon touché sous la grille, la palette ne bouge pas', async ({ page }) => {
            await ouvrirAnnoter(page);
            await page.evaluate(() => document.querySelector('#travaux-palette-tampons .palette-bouton-version').click());
            const lire = () => page.evaluate(() => {
                const p = document.getElementById('travaux-palette-tampons');
                const z = p.querySelector('#travaux-tampons-nom-actif');
                const rp = p.getBoundingClientRect(), rz = z.getBoundingClientRect();
                const sous = document.elementFromPoint(rz.left + 4, rz.top + rz.height / 2);
                return {
                    compacte: p.classList.contains('tampons-compacte'), largeur: Math.round(rp.width), hauteur: Math.round(rp.height),
                    nomsVisibles: [...p.querySelectorAll('.travaux-autocollant-nom')].filter((s) => s.offsetParent).length,
                    zone: z.textContent, zoneVisible: rz.top >= rp.top && rz.bottom <= rp.bottom + 0.5 && !!sous && sous === z,
                    bouton: p.querySelector('.palette-bouton-version').title
                };
            });
            const avant = await lire();
            expect(avant).toMatchObject({ compacte: true, largeur: 188, nomsVisibles: 0, zone: 'Touche un tampon\u00a0: son nom paraît ici.', zoneVisible: true, bouton: 'Passer à la version étendue' });
            for (const t of await tuiles(page, 'travaux-palette-tampons')) {
                expect(t.l, t.nom).toBeGreaterThanOrEqual(40);
                expect(t.h, t.nom).toBeGreaterThanOrEqual(44);
            }
            // Le dernier tampon de la palette : la zone dit son nom, en entier, et la palette garde sa hauteur.
            const nom = await page.evaluate(() => {
                const ts = [...document.querySelectorAll('#travaux-palette-tampons .travaux-autocollant-item[data-action="travauxOutils.setAutocollantActif"]')];
                const t = ts[ts.length - 1];
                t.scrollIntoView({ block: 'nearest' });
                t.click();
                return t.querySelector('.travaux-autocollant-nom').textContent;
            });
            const apres = await lire();
            expect(apres.zone).toBe(nom);
            expect(apres.zoneVisible).toBe(true);
            expect(apres.hauteur).toBe(avant.hauteur);
            expect(await page.evaluate(() => window.obtenirPreference('paletteTamponsCompacte'))).toBe(true);
        });
    });
}

test.describe('§ 3 — le nom du tampon passe en texte', () => {
    test.use({ viewport: FORMATS[0] });

    test('un nom de tampon balisé s’affiche tel quel, sans devenir du HTML', async ({ page }) => {
        await ouvrirAnnoter(page);
        const m = await page.evaluate(() => {
            const p = document.getElementById('travaux-palette-tampons');
            p.classList.add('tampons-compacte');
            const t = p.querySelector('.travaux-autocollant-item[data-action="travauxOutils.setAutocollantActif"]');
            t.querySelector('.travaux-autocollant-nom').textContent = '<img src=x data-piege="1">Soupçon';
            t.click();
            const z = p.querySelector('#travaux-tampons-nom-actif');
            return { texte: z.textContent, piege: !!z.querySelector('[data-piege]') };
        });
        expect(m).toEqual({ texte: '<img src=x data-piege="1">Soupçon', piege: false });
    });
});

test.describe('§ 1 — le stock d’avant le lot', () => {
    test.use({ viewport: FORMATS[0] });

    test('une disposition en bandeau enregistrée (« h ») ouvre l’étendue, sans être réécrite', async ({ page }) => {
        await ouvrirAnnoter(page, () => {
            document.getElementById('travaux-palette-erreurs-fr')?.remove();
            window.definirPreference('dispositionPaletteCodes', 'h');
        });
        const m = await page.evaluate((id) => ({
            compacte: document.getElementById(id).classList.contains('codes-compacte'),
            noms: document.querySelector(`#${id} .travaux-errfr-nom`).offsetHeight > 0,
            pref: window.obtenirPreference('dispositionPaletteCodes')
        }), CODES);
        expect(m).toEqual({ compacte: false, noms: true, pref: 'h' });
    });

    test('un choix « compacte » enregistré est gardé', async ({ page }) => {
        await ouvrirAnnoter(page, () => {
            document.getElementById('travaux-palette-erreurs-fr')?.remove();
            window.definirPreference('dispositionPaletteCodes', 'compacte');
        });
        expect(await page.evaluate((id) => document.getElementById(id).classList.contains('codes-compacte'), CODES)).toBe(true);
    });

    test('une géométrie de bandeau enregistrée avant le lot est ignorée, et laissée telle quelle', async ({ page }) => {
        const bandeau = JSON.stringify({ left: '12px', right: 'auto', top: '12px', width: '1156px', height: '120px' });
        await ouvrirAnnoter(page);
        await page.evaluate((b) => {
            document.getElementById('travaux-palette-erreurs-fr')?.remove();
            localStorage.setItem('travaux-palette-erreurs-fr-pos', b);
            window.travauxOutils.togglePaletteErreursFrancais();
        }, bandeau);
        await page.waitForSelector('#travaux-palette-erreurs-fr .travaux-errfr-item');
        const m = await page.evaluate((id) => ({ largeur: Math.round(document.getElementById(id).getBoundingClientRect().width), stock: localStorage.getItem(id + '-pos') }), CODES);
        expect(m).toEqual({ largeur: 200, stock: bandeau });
    });
});
