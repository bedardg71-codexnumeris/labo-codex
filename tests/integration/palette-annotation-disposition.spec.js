import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ouvrirCopie, compteAnnotations, pointCanevas } from './harness/banc-copie-annotation.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const captures = path.resolve(__dirname, '..', '..', 'plans de travail', 'captures');

// CONSIGNE DU 31 OCT. 2026, PARTIE C — LA PALETTE D'ANNOTATION, À 188 PX.
// Ébauche validée par Grégoire : plans de travail/EBAUCHE-2026-10-31-palette-annotation.dc.html.

const palette = (page) => page.locator('#travaux-palette-flottante');

test.describe('La palette d’annotation', () => {
    test('188 px, tout y tient, en clair et en sombre, avec les badges des dix outils (une installation neuve)', async ({ page }) => {
        const suivi = await ouvrirCopie(page);
        for (const clair of [true, false]) {
            const mesure = await page.evaluate((clair) => {
                document.body.classList.toggle('mode-clair', clair);
                const p = document.getElementById('travaux-palette-flottante');
                const c = p.querySelector('.palette-flottante-contenu');
                const bords = c.getBoundingClientRect();
                const dehors = [...c.querySelectorAll('button, input, .annot-groupe')]
                    .filter((el) => el.offsetParent && el.getBoundingClientRect().right > bords.right + 0.5).length;
                return {
                    largeur: p.getBoundingClientRect().width, deborde: c.scrollWidth > c.clientWidth, dehors,
                    badges: p.querySelectorAll('.annot-bande .raccourci-badge, .annot-bloc .raccourci-badge').length,
                    // Dans son coin : un badge en ligne serait coupé par la largeur fixe du segment.
                    badgesHorsCoin: [...p.querySelectorAll('.annot-bande .raccourci-badge, .annot-bloc .raccourci-badge')]
                        .filter((b) => getComputedStyle(b).position !== 'absolute').length,
                    hauteursBlocs: [...new Set([...p.querySelectorAll('.annot-bande, .annot-bloc')].map((b) => b.getBoundingClientRect().height))]
                };
            }, clair);
            expect(mesure.largeur).toBe(188);
            expect(mesure.deborde).toBe(false);
            expect(mesure.dehors).toBe(0);
            expect(mesure.badgesHorsCoin).toBe(0);
            expect(mesure.badges).toBe(10);        // témoin : le cas le plus large est bien celui qu'on mesure
            expect(mesure.hauteursBlocs).toEqual([27]); // une seule hauteur : aucun bloc n'a passé à la ligne
        }
        expect(suivi.erreurs).toEqual([]);
    });

    test('de haut en bas : les bandes, les rangées, les mots validés', async ({ page }) => {
        await ouvrirCopie(page);
        const d = await page.evaluate(() => {
            const p = document.getElementById('travaux-palette-flottante');
            const ids = (bloc) => [...bloc.querySelectorAll('button')].map((b) => b.id || b.dataset.outil || b.dataset.pointes);
            const bandes = [...p.querySelectorAll('.annot-bande')].map(ids);
            const groupes = [...p.querySelectorAll('.annot-rangee')].map((r) => [...r.querySelectorAll('.annot-groupe')].map((g) => ({
                titre: g.querySelector('.travaux-palette-label').textContent, outils: ids(g)
            })));
            const ordre = [...p.querySelector('.palette-flottante-contenu').children].map((el) => el.className.split(' ')[0] || el.tagName);
            return { bandes, groupes, ordre, effacer: p.querySelector('.annot-effacer').textContent };
        });
        expect(d.bandes).toEqual([
            ['position', 'selection', 'travaux-btn-dupliquer'],
            ['travaux-btn-undo', 'travaux-btn-supprimer', 'travaux-btn-redo']
        ]);
        expect(d.groupes).toEqual([
            [{ titre: 'Outils', outils: ['stylo', 'surligneur', 'texte'] }, { titre: 'Formes', outils: ['cercle', 'rectangle', 'polygone'] }],
            [{ titre: 'Lignes', outils: ['fleche', 'pointille', 'ondule'] }, { titre: 'Extrémités', outils: ['debut', 'double', 'fin', 'aucune'] }]
        ]);
        expect(d.ordre).toEqual(['groupe-boutons-ligne', 'annot-bande', 'annot-bande', 'separateur-horizontal', 'annot-rangee', 'annot-rangee',
            'separateur-horizontal', 'annot-couleurs', 'annot-epaisseur', 'annot-effacer']);
        expect(d.effacer).toBe('Effacer la page');
    });

    test('ce qui a quitté la palette : l’identité, son bouton de profil, l’icône des trois lignes, « Effacer tout »', async ({ page }) => {
        await ouvrirCopie(page);
        const n = await page.evaluate(() => {
            const p = document.getElementById('travaux-palette-flottante');
            return {
                identite: p.querySelectorAll('#travaux-annot-identite, #travaux-annot-label-etudiant, #travaux-annot-label-production, #travaux-annot-btn-profil').length,
                icone: p.querySelectorAll('img[src*="icon-line-width"]').length,
                texte: p.textContent.includes('Effacer tout'),
                boutons: p.querySelectorAll('button').length,   // témoin : la palette n'est pas vide
                jumeau: !!document.querySelector('#travaux-eval-gauche [data-action="ouvrirProfilDepuisAnnotation"], #travaux-palette-eval-gauche [data-action="ouvrirProfilDepuisAnnotation"]')
            };
        });
        expect(n.boutons).toBeGreaterThan(20);
        expect(n).toMatchObject({ identite: 0, icone: 0, texte: false, jumeau: true });
    });

    test('« Effacer la page » se lit à 4,5:1 au moins, en clair et en sombre', async ({ page }) => {
        await ouvrirCopie(page);
        for (const clair of [true, false]) {
            const ratio = await page.evaluate((clair) => {
                document.body.classList.toggle('mode-clair', clair);
                const rgb = (c) => c.match(/[\d.]+/g).slice(0, 3).map(Number);
                const lum = ([r, g, b]) => {
                    const v = [r, g, b].map((x) => { const c = x / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; });
                    return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
                };
                const a = lum(rgb(getComputedStyle(document.querySelector('.annot-effacer')).color));
                const b = lum(rgb(getComputedStyle(document.getElementById('travaux-palette-flottante')).backgroundColor));
                return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
            }, clair);
            expect(ratio).toBeGreaterThanOrEqual(4.5);
        }
    });

    test('douze carrés soudés, la couleur active au double liseré', async ({ page }) => {
        await ouvrirCopie(page);
        const c = await page.evaluate(() => {
            const b = [...document.querySelectorAll('#travaux-palette-flottante .annot-couleurs .travaux-btn-couleur')];
            b[11].click();
            const r = b[0].getBoundingClientRect();
            return {
                n: b.length, lignes: new Set(b.map((x) => x.getBoundingClientRect().top)).size, largeur: r.width, hauteur: r.height, rayon: getComputedStyle(b[0]).borderRadius,
                actif: getComputedStyle(b[11]).boxShadow, inactif: getComputedStyle(b[0]).boxShadow
            };
        });
        expect(c).toMatchObject({ n: 12, lignes: 1, largeur: 13, hauteur: 13, rayon: '0px', inactif: 'none' });
        expect(c.actif).toContain('inset');
    });

    test('la rangée Épaisseur : une seule rangée, le trait et la valeur suivent l’outil, la couleur et la glissière', async ({ page }) => {
        await ouvrirCopie(page);
        const lire = () => page.evaluate(() => {
            const a = document.getElementById('travaux-apercu-trait');
            return { hauteur: a.getBoundingClientRect().height, couleur: a.style.backgroundColor, px: document.getElementById('travaux-epaisseur-px').textContent };
        });
        const rangee = await page.evaluate(() => new Set([...document.querySelector('.annot-epaisseur').children]
            .map((el) => Math.round(el.getBoundingClientRect().top + el.getBoundingClientRect().height / 2))).size);
        expect(rangee).toBe(1);
        await page.evaluate(() => { window.travauxOutils.setOutilActif('stylo'); window.travauxOutils.setCouleurActive('#22c55e'); window.travauxOutils.setEpaisseurActive(6); });
        expect(await lire()).toMatchObject({ hauteur: 6, couleur: 'rgb(34, 197, 94)' });
        expect((await lire()).px).toMatch(/^\d+ px$/);
        // Changer d'outil rend son épaisseur à l'outil : la valeur écrite suit (elle restait figée).
        const avant = (await lire()).px;
        await page.evaluate(() => window.travauxOutils.setOutilActif('surligneur'));
        expect((await lire()).px).not.toBe(avant);
        expect((await lire()).hauteur).toBe(14); // 20 : plafonné à la hauteur de la rangée
    });

    test('une nouvelle ligne n’a pas de pointe ; une ligne posée avant garde la sienne', async ({ page }) => {
        await ouvrirCopie(page);
        expect(await page.evaluate(() => window.travauxOutils.getFlechePointes())).toBe('aucune');
        expect(await page.locator('#travaux-options-fleche .actif').getAttribute('data-pointes')).toBe('aucune');
        await page.evaluate(() => window.travauxOutils.setOutilActif('fleche'));
        const a = await pointCanevas(page, 0.2, 0.5);
        const b = await pointCanevas(page, 0.6, 0.5);
        await page.mouse.move(a.x, a.y);
        await page.mouse.down();
        await page.mouse.move(b.x, b.y, { steps: 3 });
        await page.mouse.up();
        expect((await compteAnnotations(page)).shapes).toBe(1);
        const formes = await page.evaluate(() => {
            const s = window.travauxAnnotation.getAnnotationCourante();
            return Object.values(s.pages).flatMap((p) => p.shapes).map((f) => f.pointes);
        });
        expect(formes).toEqual(['aucune']);
        // Source seulement : ce qui décide d'une ligne d'avant est sa propre valeur, jamais le défaut courant.
        expect(await page.evaluate(() => {
            const s = window.travauxAnnotation.getAnnotationCourante();
            Object.values(s.pages)[0].shapes.push({ id: 'SH_AVANT', type: 'fleche', color: '#000', lineWidth: 2, x1: 0.1, y1: 0.1, x2: 0.3, y2: 0.1, pointes: 'fin' });
            window.travauxAnnotation.reRendreAnnotations && window.travauxAnnotation.reRendreAnnotations();
            return Object.values(s.pages)[0].shapes[1].pointes;
        })).toBe('fin');
    });

    test('une largeur donnée à la poignée (#773) l’emporte', async ({ page }) => {
        await page.addInitScript(() => {
            localStorage.setItem('travaux-palette-flottante-geometrie', JSON.stringify({ left: '12px', right: '', top: '12px', width: '240px', height: '' }));
        });
        await ouvrirCopie(page);
        expect((await palette(page).boundingBox()).width).toBe(240);
    });

    test('captures sur demande (CAPTURES=1), clair et sombre', async ({ page }) => {
        test.skip(!process.env.CAPTURES, 'Captures sur demande.');
        await page.setViewportSize({ width: 1180, height: 820 });
        await ouvrirCopie(page);
        for (const [nom, clair] of [['clair', true], ['sombre', false]]) {
            await page.evaluate((clair) => document.body.classList.toggle('mode-clair', clair), clair);
            await palette(page).screenshot({ path: path.join(captures, `palette-annotation-${nom}.png`) });
        }
    });
});
