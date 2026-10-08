import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// =======================================================================
// #976 (lot 7 du chantier de l'enregistrement, 8 oct. 2026) — « CORRIGER LE DA… », SUR LA VRAIE PAGE
// =======================================================================
//
// Le pack démo (DA manifestement fictifs, « DEMO004 »…), le vrai index.html, les vrais clics :
//  (a) la fiche ouverte montre « Corriger le DA… » ; le codex est proposé d'abord, avec le verbe
//      « corriger » ; la fenêtre dit l'ancien DA, les nombres de la passe à blanc, la portée ;
//  (b) après « Corriger le DA » : mêmes nombres sous le nouveau DA, zéro sous l'ancien, la fiche
//      reste ouverte sous son nouveau DA, le témoin dit « Enregistré » ;
//  (c) les deux refus (sept chiffres ; DA d'une autre fiche) : « Non enregistré », rien n'a bougé ;
//  (d) en anonymisation, le bouton n'est pas offert ;
//  (e) les trois globales (un jeton, un jugement de dénotation, une entrée longitudinale) suivent,
//      et la fenêtre les compte (décision de Grégoire, 8 oct., 14 h 50).
// La mécanique (familles de clés, échec au milieu, reprise, autre trimestre) est éprouvée par
// tests/unit/correction-da-976.test.js.

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i,
    /Failed to load resource/i
];
const NOUVEAU = '7654321';

function brancher(page) {
    const etat = { erreurs: [], dialogues: [] };
    const estAttendue = (m) => patternsAttendus.some((re) => re.test(m));
    page.on('pageerror', (e) => { const m = `pageerror: ${e.message}`; if (!estAttendue(m)) etat.erreurs.push(m); });
    page.on('console', (msg) => { if (msg.type() === 'error') { const m = `console.error: ${msg.text()}`; if (!estAttendue(m)) etat.erreurs.push(m); } });
    page.on('dialog', (d) => { etat.dialogues.push(d.message()); d.dismiss().catch(() => {}); });
    return etat;
}

async function demarrer(page) {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(800);
    await page.evaluate(async () => {
        localStorage.clear();
        sessionStorage.clear();
        if (window.db && db.memoryCache) db.memoryCache.clear();
        await new Promise((res) => {
            const req = indexedDB.deleteDatabase('LaboCodexDB');
            req.onsuccess = req.onerror = req.onblocked = () => res();
            setTimeout(res, 1500);
        });
    });
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
    await page.evaluate(() => activerModeDemo());
    await page.waitForTimeout(3000);
    // L'élève de la démo qui porte le plus d'évaluations ; une copie fictive à son nom (la démo
    // n'a aucune copie importée).
    return page.evaluate(async () => {
        const fiches = db.getSync(cle('groupeEtudiants'), []) || [];
        let choisi = null, max = -1;
        for (const f of fiches) {
            const c = CorrectionDA.passeABlanc(f.da, '').comptes;
            if (c.evaluations + c.presences > max) { max = c.evaluations + c.presences; choisi = f; }
        }
        const cleF = cle('fichiersTravaux');
        db.setSync(cleF, (db.getSync(cleF, []) || []).concat([
            { id: 'FT_BANC_976', etudiantDA: choisi.da, productionId: 'PROD_BANC', groupeDocumentId: choisi.da + '_auto', statut: 'actif' }
        ]));
        // (e) Une donnée dans chacune des trois globales.
        const jetons = db.getSync('jetonsEtudiants', {}) || {};
        jetons[choisi.da] = { JETON_BANC: 1, _historique: [{ jetonId: 'JETON_BANC', action: 'attribue' }] };
        db.setSync('jetonsEtudiants', jetons);
        const cleDen = cle('jugementsDenotation');
        const den = db.getSync(cleDen, {}) || {};
        den.PRAT_BANC_976 = Object.assign({}, den.PRAT_BANC_976, { [choisi.da]: { noteFinale: 80, ciblesAtteintes: {}, justification: '', date: '2026-10-08' } });
        db.setSync(cleDen, den);
        const reg = db.getSync('registreLongitudinal', null) || { format: 'registre-longitudinal', version: 1, eleves: {}, modeles: { grilles: {}, echelles: {} } };
        reg.eleves = reg.eleves || {};
        reg.eleves[choisi.da] = { da: choisi.da, nom: choisi.nom, prenom: choisi.prenom, inscritLe: '2026-10-08', dossiers: [], resultatsUlterieurs: [] };
        db.setSync('registreLongitudinal', reg);
        await db.flush();
        const autre = fiches.find((f) => f.da !== choisi.da);
        return { ancien: choisi.da, nom: choisi.prenom + ' ' + choisi.nom, autre: autre.da };
    });
}

const fenetre = (page) => page.evaluate(() => {
    const o = document.getElementById('overlay-ui-dialogue');
    if (!o || o.getClientRects().length === 0) return null;
    return {
        titre: o.querySelector('.modal-titre').textContent,
        texte: o.querySelector('.modal-section').textContent,
        boutons: Array.from(o.querySelectorAll('.modal-actions button')).map((b) => b.textContent.trim())
    };
});
const attendreFenetre = async (page, titre) => {
    await expect.poll(async () => (await fenetre(page))?.titre ?? null, { timeout: 30000 }).toBe(titre);
    return fenetre(page);
};
const cliquerDansFenetre = (page, texte) => page.locator('#overlay-ui-dialogue .modal-actions button', { hasText: texte }).click();
const temoinSucces = (page) => page.evaluate(() => {
    const el = document.querySelector('#temoin-enregistrement .temoin-enregistrement-succes');
    return !!el && el.classList.contains('visible');
});
const temoinEchec = (page) => page.evaluate(() => {
    const el = document.querySelector('#temoin-enregistrement .temoin-enregistrement-echec');
    return el && el.classList.contains('visible') ? el.querySelector('.temoin-enregistrement-echec-texte').textContent : '';
});

// Ce que le trimestre actif porte sous un DA (la passe à blanc), et le texte brut de ses clés.
const mesurer = (page, da) => page.evaluate((da) => {
    const prefixe = obtenirTrimestreId() + '_';
    const globales = ['registreLongitudinal', 'jetonsEtudiants', cle('jugementsDenotation')];
    let brut = 0;
    for (const k of db.keysSync()) {
        if (!k.startsWith(prefixe) && !globales.includes(k)) continue;
        brut += JSON.stringify(db.getSync(k, null)).split('"' + da + '"').length - 1;
    }
    return { comptes: CorrectionDA.passeABlanc(da, '').comptes, brut };
}, da);

async function ouvrirFiche(page, da) {
    await page.evaluate(() => naviguerVers('calendrier', 'trimestre'));
    await page.waitForTimeout(900);
    await page.evaluate((da) => editerEtudiantV2(da), da);
    await page.waitForTimeout(500);
}

test.describe('#976 — « Corriger le DA… » sur le pack démo', () => {
    test.setTimeout(180000);

    test('le DA corrigé garde tout ; les refus ne touchent à rien', async ({ page }) => {
        const etat = brancher(page);
        const { ancien, nom, autre } = await demarrer(page);
        const avant = await mesurer(page, ancien);
        expect(avant.comptes.evaluations, 'l\'élève choisi porte des évaluations').toBeGreaterThan(0);
        expect(avant.comptes.presences, 'et des présences').toBeGreaterThan(0);
        expect(avant.comptes.copies).toBe(1);
        expect([avant.comptes.jetons, avant.comptes.denotation, avant.comptes.longitudinal]).toEqual([1, 1, 1]);

        // (a) Le bouton, le codex proposé, la fenêtre.
        await ouvrirFiche(page, ancien);
        const bouton = page.locator('#v2-btnCorrigerDA');
        await expect(bouton).toBeVisible();
        await bouton.click();
        const codex = await attendreFenetre(page, 'Écrire un codex avant de corriger ?');
        expect(codex.boutons).toEqual(['Annuler', 'Corriger sans codex', 'Écrire un codex, puis corriger']);
        await cliquerDansFenetre(page, 'Corriger sans codex');
        const f = await attendreFenetre(page, 'Corriger le DA de ' + nom);
        expect(f.texte).toContain('DA actuel : ' + ancien);
        expect(f.texte).toContain(avant.comptes.evaluations + ' évaluation');
        expect(f.texte).toContain(avant.comptes.presences + ' présence');
        expect(f.texte).toContain('1 copie');
        expect(f.texte).toContain('dans ce trimestre seulement');
        expect(f.texte).toContain('Suivent aussi, hors trimestre :\n• 1 jeton\n• 1 jugement de dénotation\n• 1 entrée au suivi longitudinal');
        expect(f.boutons).toEqual(['Annuler', 'Corriger le DA']);

        // (b) La correction.
        await page.locator('#ui-dialogue-saisie').fill(NOUVEAU);
        await cliquerDansFenetre(page, 'Corriger le DA');
        await expect.poll(() => temoinSucces(page), { timeout: 15000 }).toBe(true);
        const apres = await mesurer(page, NOUVEAU);
        expect(apres.comptes).toEqual(avant.comptes);
        expect(apres.brut).toBe(avant.brut);
        expect((await mesurer(page, ancien)).brut).toBe(0);
        const globalesApres = await page.evaluate(({ ancien, nouveau }) => ({
            jeton: Object.keys(db.getSync('jetonsEtudiants', {})).filter((k) => k === ancien || k === nouveau),
            den: Object.keys(db.getSync(cle('jugementsDenotation'), {}).PRAT_BANC_976),
            reg: [db.getSync('registreLongitudinal', {}).eleves[nouveau]?.da, !!db.getSync('registreLongitudinal', {}).eleves[ancien]]
        }), { ancien, nouveau: NOUVEAU });
        expect(globalesApres).toEqual({ jeton: [NOUVEAU], den: [NOUVEAU], reg: [NOUVEAU, false] });
        await expect(page.locator('#v2-etudiantDA')).toHaveValue(NOUVEAU);
        await page.evaluate(() => db.flush());

        // (c) Les refus, sur une autre fiche : sept chiffres, puis le DA déjà pris.
        const instantane = () => page.evaluate(() => {
            const p = obtenirTrimestreId() + '_';
            return JSON.stringify(db.keysSync().filter((k) => k.startsWith(p)).sort().map((k) => [k, db.getSync(k, null)]));
        });
        for (const [saisie, motif] of [['12345', /sept chiffres/], [NOUVEAU, /autre étudiant·e de ce trimestre/]]) {
            await ouvrirFiche(page, autre);
            const base = await instantane();
            await page.locator('#v2-btnCorrigerDA').click();
            await attendreFenetre(page, 'Écrire un codex avant de corriger ?');
            await cliquerDansFenetre(page, 'Corriger sans codex');
            await attendreFenetre(page, 'Corriger le DA de ' + (await page.evaluate((da) => {
                const x = db.getSync(cle('groupeEtudiants'), []).find((e) => e.da === da); return x.prenom + ' ' + x.nom;
            }, autre)));
            await page.locator('#ui-dialogue-saisie').fill(saisie);
            await cliquerDansFenetre(page, 'Corriger le DA');
            await expect.poll(() => temoinEchec(page), { timeout: 15000 }).toMatch(motif);
            expect(await instantane()).toBe(base);
        }

        // (d) En anonymisation, le DA ne se montre pas : le geste n'est pas offert.
        await page.evaluate(() => changerMode('anonymisation'));
        await page.waitForTimeout(800);
        expect(await page.evaluate(() => window.estModeAnonymisation())).toBe(true);
        await ouvrirFiche(page, NOUVEAU);
        await expect(page.locator('#v2-etudiantDAAide')).toBeVisible();   // la fiche est bien ouverte
        await expect(page.locator('#v2-btnCorrigerDA')).toBeHidden();

        expect(etat.dialogues, 'aucune fenêtre native').toEqual([]);
        expect(etat.erreurs).toEqual([]);
    });
});
