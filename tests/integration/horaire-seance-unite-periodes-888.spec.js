import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// PORTE NAVIGATEUR #888 — le mot « pér. » reste visible à côté d'une case Périodes remplie.
//
// Le nombre de périodes est le dénominateur de l'assiduité. Tant qu'il n'était annoncé
// que par un placeholder, il disparaissait dès la saisie : la rangée se lisait
// « 08:00 à 10:00 · 2 · Local », et rien ne disait ce qu'était ce « 2 » (le `title` au
// survol n'existe pas sur iPad). Décision de Grégoire (17 sept. 2026) : le mot reste
// affiché, en gris, hors du champ, SANS ajouter ni rangée ni largeur.
//
// Le mot est cherché par son TEXTE dans la rangée, pas par un identifiant : le banc
// mesure ce que l'œil lit, et rougit si le mot disparaît quelle que soit sa balise.

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i
];

function brancherEcouteurs(page) {
    const erreurs = [];
    const estAttendue = (m) => patternsAttendus.some((re) => re.test(m));
    page.on('pageerror', (e) => { const m = `pageerror: ${e.message}`; if (!estAttendue(m)) erreurs.push(m); });
    page.on('console', (msg) => {
        if (msg.type() === 'error') { const m = `console.error: ${msg.text()}`; if (!estAttendue(m)) erreurs.push(m); }
    });
    page.on('dialog', (d) => d.dismiss());
    return erreurs;
}

// iPad Air paysage, iPad Air portrait, et sous la bascule à deux colonnes (720 px).
const LARGEURS = [
    { largeur: 1180, nom: 'iPad paysage', memeRangeeQueLocal: true },
    { largeur: 820, nom: 'iPad portrait', memeRangeeQueLocal: false },
    { largeur: 600, nom: 'sous 720 px', memeRangeeQueLocal: false }
];

for (const { largeur, nom, memeRangeeQueLocal } of LARGEURS) {
    test(`#888 · « pér. » visible à droite d'une case remplie — ${largeur} px (${nom})`, async ({ page }, testInfo) => {
        const erreurs = brancherEcouteurs(page);
        await page.setViewportSize({ width: largeur, height: 900 });
        await page.goto(indexHtml);
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(500);

        // Le geste de l'écran : Cadre › Horaire (accordéon replié au chargement),
        // « Nouvel horaire », puis on tape 2 dans la case de la première séance.
        await page.evaluate(async () => {
            naviguerVers('calendrier', 'trimestre');
            await new Promise((res) => setTimeout(res, 500));
        });
        await page.locator('#accordeon-horaire .accordeon-header h3').click({ position: { x: 5, y: 5 } });
        await page.locator('#accordeon-horaire [data-action="nouveauHoraireV2"]').click();
        await page.locator('#v2-hor-seance-0-periodes').fill('2');

        const r = await page.evaluate(async () => {
            const case_ = document.getElementById('v2-hor-seance-0-periodes');
            if (!case_) return { erreur: 'case Périodes introuvable' };

            const rangee = case_.closest('.seance-horaire-ligne');
            if (!rangee) return { erreur: 'rangée introuvable' };
            rangee.scrollIntoView({ block: 'center' });

            // Le mot tel que l'œil le lit : un élément feuille de la rangée dont le texte
            // est « pér. », hors du champ lui-même (le placeholder ne compte pas).
            const mot = [...rangee.querySelectorAll('*')].find(
                (el) => el.children.length === 0 && el.textContent.trim() === 'pér.'
            );
            const rect = (el) => {
                const b = el.getBoundingClientRect();
                return { gauche: b.left, droite: b.right, haut: b.top, bas: b.bottom, largeur: b.width, hauteur: b.height };
            };
            const local = document.getElementById('v2-hor-seance-0-local');
            const decrits = (case_.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean);
            const texteDecrit = decrits.map((id) => document.getElementById(id)?.textContent.trim() || '').join(' ');
            const labelEnglobant = case_.closest('label')?.textContent.trim() || '';

            return {
                valeur: case_.value,
                mot: mot ? rect(mot) : null,
                styleMot: mot ? (() => {
                    const s = getComputedStyle(mot);
                    return { display: s.display, visibility: s.visibility, opacity: s.opacity };
                })() : null,
                case_: rect(case_),
                rangee: rect(rangee),
                local: rect(local),
                // Ce qui est réellement peint au centre du mot : rien ne le recouvre ni ne
                // le rogne (un accordéon replié laisse au mot une boîte non nulle).
                auCentre: mot ? (() => {
                    const b = mot.getBoundingClientRect();
                    const touche = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2);
                    return touche === mot || mot.contains(touche);
                })() : false,
                accessible: texteDecrit || labelEnglobant,
                debordeRangee: rangee.scrollWidth > rangee.clientWidth + 1
            };
        });

        const capture = testInfo.outputPath(`rangee-${largeur}px.png`);
        await page.locator('.seance-horaire-ligne').first().screenshot({ path: capture });
        await testInfo.attach(`rangee-${largeur}px`, { path: capture, contentType: 'image/png' });

        expect(r.erreur, `Erreur eval : ${r.erreur}`).toBeUndefined();
        expect(r.valeur).toBe('2');

        // Le mot existe et se voit.
        expect(r.mot, 'aucun « pér. » lisible dans la rangée une fois la case remplie').not.toBeNull();
        expect(r.styleMot.display).not.toBe('none');
        expect(r.styleMot.visibility).toBe('visible');
        expect(Number(r.styleMot.opacity)).toBeGreaterThan(0);
        expect(r.mot.largeur).toBeGreaterThan(0);
        expect(r.mot.hauteur).toBeGreaterThan(0);
        expect(r.auCentre, 'le mot est recouvert ou rogné').toBe(true);

        // À droite de la case, sur sa ligne, dans la rangée.
        expect(r.mot.gauche, 'le mot ne se tient pas à droite de la case').toBeGreaterThanOrEqual(r.case_.droite - 0.5);
        expect(r.mot.haut).toBeGreaterThanOrEqual(r.case_.haut - 0.5);
        expect(r.mot.bas).toBeLessThanOrEqual(r.case_.bas + 0.5);
        expect(r.mot.droite, 'le mot déborde de la rangée').toBeLessThanOrEqual(r.rangee.droite + 0.5);
        expect(r.debordeRangee, 'la rangée déborde horizontalement').toBe(false);

        // La case reste une cible tactile lisible.
        expect(Math.round(r.case_.hauteur)).toBeGreaterThanOrEqual(44);
        expect(r.case_.largeur, 'la case est trop étroite pour « 8 »').toBeGreaterThanOrEqual(28);

        // Un lecteur d'écran entend le mot avec la case.
        expect(r.accessible, 'la case n\'est pas associée au mot « pér. »').toContain('pér.');

        // Régression #886 / #540 : à 1180 px, le local reste sur la rangée des périodes.
        if (memeRangeeQueLocal) {
            expect(Math.abs(r.local.haut - r.case_.haut), 'le local est retombé sur une 2e rangée').toBeLessThan(2);
        }

        expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
    });
}
