import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// #1214 (1er nov. 2026) — LA PALETTE ÉVALUATION N'A QU'UNE BARRE DE DÉFILEMENT.
//
// Retour de Grégoire (iPad, 1.229.0, mode Évaluer) : un double défilement rend l'affichage et le
// geste difficiles. Mesuré avant le correctif, à 1180 × 820, grille de 10 critères et 1 algorithmique :
// cinq éléments pouvaient défiler (palette, contenu, panneau, corps, liste). Celui qui défile changeait
// avec la disposition : le panneau sans hauteur posée, la palette avec. Et le plafond de 750 px de la
// liste écrasait les cartes : 63 px montrés sur 131, et sur 287 pour le critère algorithmique.
//
// ⚠ COMPTER CE QUI PEUT DÉFILER, PAS SEULEMENT CE QUI DÉBORDE : un `overflow-y: auto` remis sur le corps
// du panneau ne déborde pas tant que son parent suit sa hauteur, mais c'est le défaut qui revient.
//
// Aucun `page.click` ni `waitForTimeout` (règle du 4 septembre). Noms fictifs (règle 6).

const EVALUATION = 'travaux-palette-eval-droite';
const PARAMETRES = 'travaux-palette-eval-gauche';
const RETROACTION = 'travaux-palette-eval-retro';
const CONTENU = '.palette-flottante-contenu';
const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i,
    /The operation is insecure/
];

async function ouvrirEnModeEvaluer(page) {
    const erreurs = [];
    const estAttendue = (m) => patternsAttendus.some((re) => re.test(m));
    page.on('pageerror', (e) => { if (!estAttendue(e.message)) erreurs.push(`pageerror: ${e.message}`); });
    page.on('console', (m) => { if (m.type() === 'error' && !estAttendue(m.text())) erreurs.push(`console.error: ${m.text()}`); });
    page.on('dialog', (d) => { erreurs.push(`dialogue: ${d.message()}`); d.dismiss().catch(() => {}); });

    await page.setViewportSize({ width: 1180, height: 820 });
    await page.goto(indexHtml);
    await page.waitForFunction(() => typeof window.db !== 'undefined' && window.db.ready && window.travauxUI && window.travauxStockage
        && typeof window.executerActionEval === 'function', null, { timeout: 30000 });
    await page.evaluate((png) => {
        // security-ok: fixtures littérales du banc, aucune source externe.
        const T = 'tdefil', coursId = 'cours-defil';
        const description = 'Une description assez longue pour occuper plusieurs lignes dans une palette étroite, comme dans une vraie grille.';
        const criteres = ['Contenu', 'Structure', 'Rigueur', 'Plausibilité', 'Nuance', 'Cohérence', 'Fidélité', 'Pertinence', 'Clarté', 'Précision']
            .map((nom, i) => ({ id: 'c' + i, nom, ponderation: 8, type: 'holistique', description }));
        criteres.push({ id: 'cA', nom: 'Français écrit', ponderation: 20, type: 'algorithmique', formule: "nombre d'erreurs / nombre de mots" });
        const niveaux = [
            { code: 'I', nom: 'Insuffisant', min: 0, max: 54, valeurCalcul: 40 },
            { code: 'D', nom: 'En développement', min: 55, max: 74, valeurCalcul: 65 },
            { code: 'M', nom: 'Maîtrisé', min: 75, max: 89, valeurCalcul: 80 },
            { code: 'E', nom: 'Étendu', min: 90, max: 100, valeurCalcul: 95 }
        ];
        window.db.setSync('trimestres', [{ id: T, nom: 'Trimestre témoin', annee: 2026, session: 'A', actif: true }]);
        window.db.setSync('cours', [{ id: coursId, codeCours: 'FRA101', titre: 'Écriture et littérature' }]);
        window.db.setSync(T + '_groupesCours', [{ id: 'GCD', trimestreId: T, coursId, groupeNum: '01', pratiqueId: 'sommative', actif: true }]);
        window.db.setSync(T + '_groupeEtudiants', [{ da: 'TESTDEFIL', nom: 'Fictif', prenom: 'Alpha', groupe: '01', coursId, groupeCoursId: 'GCD' }]);
        window.db.setSync(T + '_productions', [{ id: 'pD', titre: 'Analyse', type: 'travail', ponderation: 60, grilleId: 'GD', echelleId: 'ED', groupeCoursId: 'GCD' }]);
        window.db.setSync(T + '_grillesTemplates', [{ id: 'GD', nom: 'Grille témoin', type: 'holistique', criteres }]);
        window.db.setSync(T + '_echellesTemplates', [{ id: 'ED', nom: 'IDME', niveaux }]);
        window.db.setSync(T + '_evaluationsSauvegardees', [{
            id: 'EVD', etudiantDA: 'TESTDEFIL', productionId: 'pD', groupeCoursId: 'GCD', coursId, fichierId: 'FTD',
            grilleId: 'GD', echelleId: 'ED', statutRemise: 'evalue', statutIntegrite: 'recevable',
            dateEvaluation: '2026-10-15T08:00:00.000Z', noteFinale: 80, niveauFinal: 'M', verrouillee: false,
            criteres: criteres.map((c) => ({ critereId: c.id, critereNom: c.nom, niveauSelectionne: 'M', ponderation: c.ponderation, retroaction: '' })),
            donneesAlgorithmiques: { cA: { erreurs: 2, mots: 600, noteCalculee: 0, pourcentage: 90, niveau: 'E', retroaction: '' } },
            retroactionFinale: '', retroactionReecrite: false, pointsAnalytiques: {},
            optionsAffichage: { description: true, objectif: false, tache: false, adresse: false, contexte: false, affichageNote: 'complet' }
        }]);
        window.db.setSync(T + '_fichiersTravaux', [{
            id: 'FTD', etudiantDA: 'TESTDEFIL', productionId: 'pD', coursId, groupeCoursId: 'GCD',
            nomFichier: 'FICTIF_Analyse.png', typeMIME: 'image/png', tailleFichier: 70, nombrePages: 1,
            stockage: 'indexeddb', thumbnailDataUrl: '', dateImport: '2026-10-01T12:00:00.000Z', dateModification: '2026-10-01T12:00:00.000Z',
            source: 'import-local', importePar: 'single', statut: 'present'
        }]);
        window.trimestreActif = T;
        window.db.setSync('trimestreActif', T);
        window.db.setSync('infoCours', { id: coursId, codeCours: 'FRA101', groupe: '01', _groupeCoursId: 'GCD' });
        window.db.setSync('groupeCoursActif', { id: 'GCD', trimestreId: T });
        const octets = Uint8Array.from(atob(png), (c) => c.charCodeAt(0));
        const copie = new Blob([octets], { type: 'image/png' });
        const original = window.travauxStockage.recupererBlob;
        window.travauxStockage.recupererBlob = async function (id) { return id === 'FTD' ? copie : original.apply(this, arguments); };
    }, PNG);
    await page.evaluate(() => window.afficherSection('evaluations'));
    await page.waitForFunction(() => !!document.querySelector('#section-evaluations.active') && window.travauxUI.getModeCourant() === 'annoter', null, { timeout: 10000 });
    await page.evaluate(() => new Promise((r) => setTimeout(r, 400)));
    await page.evaluate(() => window.executerActionEval({ value: 'consulter|EVD' }));
    await page.waitForFunction(() => {
        const fa = window.travauxVisionneuse?.getFichierActuel?.();
        return fa && fa.id === 'FTD' && window.travauxUI.getModeCourant() === 'evaluer'
            && !!document.querySelector('#travaux-palette-eval-droite .eval-badge-algo') && window._modifierEvaluationEnCours === false;
    }, null, { timeout: 15000 });
    await page.evaluate(() => { const o = document.getElementById('overlay-backup-reminder'); if (o) o.remove(); });
    return erreurs;
}

/** Tout ce qui, dans la palette, PEUT défiler (visible, overflow-y auto ou scroll) ; les champs de texte à part. */
const quiPeutDefiler = (page, id) => page.evaluate((id) => {
    const p = document.getElementById(id);
    return [p, ...p.querySelectorAll('*')]
        .filter((el) => el.offsetParent !== null && el.tagName !== 'TEXTAREA' && ['auto', 'scroll'].includes(getComputedStyle(el).overflowY))
        .map((el) => el.id || el.className);
}, id);

/** Le contenu défilé jusqu'en bas : ce que l'œil voit alors (la page ne défile plus, partie C du 1er nov.). */
const auBasDuContenu = (page, id) => page.evaluate((id) => {
    const p = document.getElementById(id);
    const c = p.querySelector(':scope > .palette-flottante-contenu');
    const debordeAvant = c.scrollHeight - c.clientHeight;
    c.scrollTop = c.scrollHeight;
    const barre = p.querySelector(':scope > .palette-flottante-barre').getBoundingClientRect();
    const cadre = c.getBoundingClientRect();
    const cartes = [...p.querySelectorAll('#listeCriteresGrille1 > div')];
    const derniere = cartes.at(-1);
    // Ce qui suit la dernière carte occupe le bas du contenu (98 px, mesuré) : tout en bas d'un cadre de 357 px (hors plein
    // écran, depuis la partie C), une carte de 287 px dépasse par le haut. L'œil la voit entière en la ramenant au haut du
    // cadre : c'est ce geste qu'on mesure. Une carte plus haute que le cadre, ou coupée par lui, reste rouge.
    const dernierCritereEntier = () => {
        if (!derniere) return null;
        c.scrollTop += derniere.getBoundingClientRect().top - cadre.top;
        const r = derniere.getBoundingClientRect();
        return r.top >= cadre.top - 0.5 && r.bottom <= cadre.bottom + 0.5 && r.bottom <= innerHeight;
    };
    const poignee =p.querySelector(':scope > .palette-poignee-redim').getBoundingClientRect();
    const rp = p.getBoundingClientRect();
    const mesure = {
        debordeAvant,
        paletteDefilee: p.scrollTop,
        barreVisible: barre.top >= 0 && barre.bottom <= innerHeight && barre.bottom <= cadre.top + 1,
        poigneeAuCoin: Math.abs(poignee.bottom - rp.bottom) <= 2 && Math.abs(poignee.right - rp.right) <= 2,
        paletteDansSaZone: rp.bottom <= p.parentElement.getBoundingClientRect().bottom + 0.5,
        dernierCritereVisible: dernierCritereEntier(),
        dernierEstAlgo: derniere ? !!derniere.querySelector('.eval-badge-algo') : null,
        cartesCoupees: cartes.filter((x) => x.scrollHeight > x.clientHeight + 1).length,
        nbCartes: cartes.length
    };
    c.scrollTop = 0;
    return mesure;
}, id);

const ATTENDU_EVALUATION = {
    paletteDefilee: 0, barreVisible: true, poigneeAuCoin: true, paletteDansSaZone: true,
    dernierCritereVisible: true, dernierEstAlgo: true, cartesCoupees: 0, nbCartes: 11
};

async function jugerEvaluation(page) {
    expect(await quiPeutDefiler(page, EVALUATION)).toEqual(['palette-flottante-contenu']);
    const { debordeAvant, ...reste } = await auBasDuContenu(page, EVALUATION);
    expect(debordeAvant).toBeGreaterThan(50); // témoin : il y a bien de quoi défiler
    expect(reste).toEqual(ATTENDU_EVALUATION);
}

test.describe('#1214 — la palette Évaluation n’a qu’une barre de défilement', () => {
    test('dans chaque disposition : un seul élément défile, la barre de titre et le dernier critère se voient', async ({ page }) => {
        const erreurs = await ouvrirEnModeEvaluer(page);

        await test.step('à l’ouverture, sans hauteur posée', () => jugerEvaluation(page));

        await test.step('sur toute la hauteur (la capture de Grégoire)', async () => {
            await page.evaluate((id) => {
                const p = document.getElementById(id);
                p.style.width = '320px';
                p.style.height = (p.parentElement.getBoundingClientRect().height - 24) + 'px';
            }, EVALUATION);
            await jugerEvaluation(page);
        });

        await test.step('en plein écran', async () => {
            await page.evaluate(() => window.travauxUI.togglePleinEcran());
            await jugerEvaluation(page);
            await page.evaluate(() => window.travauxUI.togglePleinEcran());
        });

        await test.step('après ↔', async () => {
            await page.evaluate((id) => window.travauxOutils.layoutPaletteH(id), EVALUATION);
            await jugerEvaluation(page);
        });

        await test.step('après ↕', async () => {
            await page.evaluate((id) => window.travauxOutils.layoutPaletteV(id), EVALUATION);
            await jugerEvaluation(page);
        });

        await test.step('repliée, rien ne défile ; dépliée, la même chose qu’avant', async () => {
            await page.evaluate((id) => window.travauxUI.togglePaletteEvalReplie(id), EVALUATION);
            expect(await quiPeutDefiler(page, EVALUATION)).toEqual([]);
            await page.evaluate((id) => window.travauxUI.togglePaletteEvalReplie(id), EVALUATION);
            await jugerEvaluation(page);
        });

        expect(erreurs).toEqual([]);
    });

    test('le geste : la molette fait défiler le contenu, jamais la palette ni la page, même arrivée en bas', async ({ page }) => {
        await ouvrirEnModeEvaluer(page);
        await page.evaluate(() => window.travauxUI.togglePleinEcran());
        const centre = await page.evaluate(({ id, s }) => {
            const r = document.querySelector(`#${id} > ${s}`).getBoundingClientRect();
            return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        }, { id: EVALUATION, s: CONTENU });
        await page.mouse.move(centre.x, centre.y);
        await page.mouse.wheel(0, 200);
        await page.waitForFunction(({ id, s }) => document.querySelector(`#${id} > ${s}`).scrollTop > 0, { id: EVALUATION, s: CONTENU });

        // Arrivé en bas, le geste continue : `overscroll-behavior: contain` le garde dans la palette.
        await page.evaluate(({ id, s }) => {
            const c = document.querySelector(`#${id} > ${s}`);
            c.scrollTop = c.scrollHeight;
        }, { id: EVALUATION, s: CONTENU });
        await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
        await page.mouse.wheel(0, 400);
        await page.evaluate(() => new Promise((r) => setTimeout(r, 300)));
        const etat = await page.evaluate(({ id, s }) => {
            const p = document.getElementById(id);
            const c = p.querySelector(`:scope > ${s}`);
            return {
                auBas: c.scrollTop + c.clientHeight >= c.scrollHeight - 1,
                palette: p.scrollTop,
                page: document.scrollingElement.scrollTop,
                contain: getComputedStyle(c).overscrollBehaviorY
            };
        }, { id: EVALUATION, s: CONTENU });
        expect(etat).toEqual({ auBas: true, palette: 0, page: 0, contain: 'contain' });
    });

    test('la poignée reste au coin, se saisit et redimensionne', async ({ page }) => {
        await ouvrirEnModeEvaluer(page);
        const avant = await page.evaluate((id) => {
            const p = document.getElementById(id);
            const c = p.querySelector(':scope > .palette-flottante-contenu');
            c.scrollTop = c.scrollHeight; // au bas du contenu : la poignée ne doit pas être partie avec
            window.scrollBy(0, Math.max(0, p.getBoundingClientRect().bottom - innerHeight + 4));
            const r = p.getBoundingClientRect();
            const x = r.right - 12, y = r.bottom - 12; // dans le triangle, hors de son coin arrondi
            const sous = document.elementFromPoint(x, y);
            return { x, y, h: r.height, saisie: !!sous && sous.classList.contains('palette-poignee-redim'), sous: sous ? (sous.id || sous.className || sous.tagName) : null, zone: p.parentElement.scrollTop };
        }, EVALUATION);
        expect({ saisie: avant.saisie, sous: avant.sous, zone: avant.zone }).toEqual({ saisie: true, sous: 'palette-poignee-redim', zone: 0 });

        await page.mouse.move(avant.x, avant.y);
        await page.mouse.down();
        await page.mouse.move(avant.x, avant.y - 150, { steps: 4 });
        await page.mouse.up();

        const apres = await page.evaluate((id) => document.getElementById(id).getBoundingClientRect().height, EVALUATION);
        expect(Math.abs(avant.h - 150 - apres)).toBeLessThanOrEqual(2);
        expect(await quiPeutDefiler(page, EVALUATION)).toEqual(['palette-flottante-contenu']);
    });

    test('Paramètres et Rétroaction suivent la même recette (le champ de rétroaction garde son propre défilement)', async ({ page }) => {
        await ouvrirEnModeEvaluer(page);
        expect(await quiPeutDefiler(page, PARAMETRES)).toEqual(['palette-flottante-contenu']);
        expect(await quiPeutDefiler(page, RETROACTION)).toEqual(['palette-flottante-contenu']);

        const parametres = await auBasDuContenu(page, PARAMETRES);
        expect(parametres).toMatchObject({ paletteDefilee: 0, barreVisible: true, poigneeAuCoin: true, paletteDansSaZone: true });

        const retro = await page.evaluate((id) => {
            const p = document.getElementById(id);
            const c = p.querySelector(':scope > .palette-flottante-contenu');
            const s = getComputedStyle(p);
            return {
                display: s.display, overflow: s.overflowY,
                basContenu: Math.round(c.getBoundingClientRect().bottom),
                basPalette: Math.round(p.getBoundingClientRect().bottom),
                hauteurChamp: document.getElementById('retroactionFinale1').clientHeight
            };
        }, RETROACTION);
        expect(retro.display).toBe('flex');
        expect(retro.overflow).toBe('hidden');
        expect(Math.abs(retro.basContenu - retro.basPalette)).toBeLessThanOrEqual(2);
        // Hors plein écran à 820 px (partie C), il ne reste que le plancher du champ, 80 px. La place qui reste se juge où il y en a.
        expect(retro.hauteurChamp).toBeGreaterThanOrEqual(80);
        await page.evaluate(() => window.travauxUI.togglePleinEcran());
        const champPleinEcran = await page.evaluate(() => document.getElementById('retroactionFinale1').clientHeight);
        expect(champPleinEcran).toBeGreaterThan(300); // 441 mesuré : le champ prend toujours la place qui reste
    });
});
