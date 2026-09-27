import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// LOT D DE L'ENREGISTREMENT — LES PRÉSENCES (D2, D2 bis ; Grégoire, 26 et 27 sept. 2026)
//
// Les preuves par comportement de la consigne (§ 5), dans le vrai index.html, sur le pack démo :
//   (a) une absence marquée, puis « Suivant » sans autre geste : l'absence est en base, le témoin a
//       dit « Enregistré », les autres élèves sont présents ; idem une note tapée puis rechargement
//       dans la seconde et demie ; idem par changement d'onglet ;
//   (b) une séance jamais saisie : aucune présence écrite, « Séance non saisie », l'assiduité ne la
//       compte pas ;
//   (c) « Confirmer la séance » : tous présents en base, « Séance saisie » ;
//   (d) verrouiller une séance non saisie : saisie et verrouillée, un seul message ;
//   (e) « Réinitialiser » sur une séance saisie : confirmation ; « Annuler » et Entrée sur
//       « Annuler » ne changent rien ;
//   (f) une absence motivée RàI survit à « Tous présents » et à l'enregistrement automatique ;
//   (g) un échec d'écriture : « Non enregistré – Enregistrement des présences : … », aucun succès.
// Plus D2 bis (b) à l'écran, et la barre à 360, 768, 1024 et 1180 px.
//
// ⚠ Chaque essai part d'un stockage vidé (les specs partagent l'origine file://, workers: 1).

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i,
    /Failed to load resource/i,
    /Erreur sauvegarde presences/i   // (g) : l'échec simulé est journalisé par modes.js
];

function brancherEcouteurs(page) {
    const erreurs = [];
    const estAttendue = (m) => patternsAttendus.some((re) => re.test(m));
    page.on('pageerror', (e) => { const m = `pageerror: ${e.message}`; if (!estAttendue(m)) erreurs.push(m); });
    page.on('console', (msg) => { if (msg.type() === 'error') { const m = `console.error: ${msg.text()}`; if (!estAttendue(m)) erreurs.push(m); } });
    return erreurs;
}

async function ouvrirSaisieDemo(page) {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(800);
    await page.evaluate(async () => {
        localStorage.clear();
        if (window.db && db.memoryCache) db.memoryCache.clear();
        await new Promise((res) => {
            const req = indexedDB.deleteDatabase('LaboCodexDB');
            req.onsuccess = req.onerror = req.onblocked = () => res();
            setTimeout(res, 1500);
        });
    });
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1200);
    await page.evaluate(() => activerModeDemo());
    await page.waitForTimeout(1200);
    await page.evaluate(() => naviguerVers('suivi', 'saisie'));
    await expect(page.locator('#tbody-saisie-presences input[id^="periodes_"]').first()).toBeAttached({ timeout: 8000 });
    await poserOutils(page);
}

async function poserOutils(page) {
    await page.evaluate(() => {
        window.__toasts = [];
        new MutationObserver((muts) => muts.forEach((m) => m.addedNodes.forEach((n) => {
            if (n.nodeType === 1 && n.classList.contains('notification-avec-icone')) window.__toasts.push(n.textContent.trim());
        }))).observe(document.body, { childList: true });
        // Le témoin « Enregistré » s'efface en 2 s : on garde trace de chaque apparition.
        window.__enregistre = 0;
        const guetter = () => {
            const s = document.querySelector('#temoin-enregistrement .temoin-enregistrement-succes');
            if (!s) return false;
            new MutationObserver(() => { if (s.classList.contains('visible') && s.textContent === 'Enregistré') window.__enregistre++; })
                .observe(s, { attributes: true, attributeFilter: ['class'], childList: true });
            return true;
        };
        if (!guetter()) {
            const o = new MutationObserver(() => { if (guetter()) { o.disconnect(); window.__enregistre++; } });
            o.observe(document.body, { childList: true });
        }
        window.__fiches = (date) => (db.getSync(cle('presences'), []) || []).filter((p) => p.date === date);
        window.__ouvrir = (date) => {
            const el = document.getElementById('date-cours');
            el.value = date;
            el.dispatchEvent(new Event('change', { bubbles: true }));
        };
        // Les séances passées du groupe, jamais saisies.
        window.__seancesNonSaisies = () => {
            const saisies = new Set((db.getSync(cle('presences'), []) || []).map((p) => p.date));
            const auj = window.dateLocaleYMD();
            return Object.keys(obtenirSeancesCompletes()).sort().filter((d) => d < auj && !saisies.has(d));
        };
        window.__etat = () => ({
            etat: document.getElementById('etat-seance-presences').textContent,
            confirmerVisible: !document.querySelector('[data-action="confirmerSeancePresences"]').classList.contains('u-hide')
        });
    });
}

async function changerPeriodes(page, da, valeur) {
    const champ = page.locator(`#periodes_${da}`);
    await champ.fill(String(valeur));
    await champ.blur();   // le `change` d'un champ numérique part au blur
}

test('(b)(a) séance jamais saisie : rien d’écrit ; une absence puis « Suivant » : en base, témoin, les autres présents', async ({ page }) => {
    test.setTimeout(90000);
    const erreurs = brancherEcouteurs(page);
    await ouvrirSaisieDemo(page);

    const [date] = await page.evaluate(() => window.__seancesNonSaisies());
    expect(date, 'le pack démo doit offrir une séance passée jamais saisie').toBeTruthy();
    await page.evaluate((d) => window.__ouvrir(d), date);
    await page.waitForTimeout(2500);   // plus que le délai : un chargement n'arme rien

    // (b)
    const b = await page.evaluate((d) => ({
        fiches: window.__fiches(d).length,
        etat: window.__etat(),
        assiduite: construireDatesSaisiesGroupe('DEMO004', obtenirDonneesSelonMode('presences')).has(d)
    }), date);
    expect(b.fiches).toBe(0);
    expect(b.etat).toEqual({ etat: 'Séance non saisie', confirmerVisible: true });
    expect(b.assiduite, 'l’assiduité ne compte pas une séance non saisie').toBe(false);

    // (a) une absence, puis « Suivant » tout de suite.
    const das = await page.evaluate(() => [...document.querySelectorAll('#tbody-saisie-presences input[id^="periodes_"]')].map((i) => i.id.slice(9)));
    await page.evaluate(() => { window.__enregistre = 0; });
    await changerPeriodes(page, das[0], 0);
    await page.click('#btn-cours-suivant');
    const a = await page.evaluate((d) => ({ fiches: window.__fiches(d), temoin: window.__enregistre }), date);
    expect(a.fiches.find((p) => p.da === das[0])?.periodesPresentes).toBe(0);
    expect(a.fiches.length).toBe(das.length);
    expect(a.fiches.filter((p) => p.da !== das[0]).every((p) => p.periodesPresentes > 0)).toBe(true);
    expect(a.temoin, 'le témoin a dit « Enregistré »').toBeGreaterThan(0);

    // Retour : l'écran relit la base.
    await page.click('#btn-cours-precedent');
    await expect(page.locator(`#periodes_${das[0]}`)).toHaveValue('0');
    expect(await page.evaluate(() => window.__etat().etat)).toBe('Séance saisie');
    expect(erreurs).toEqual([]);
});

test('(a) une note tapée puis rechargement dans la seconde et demie ; puis par changement d’onglet', async ({ page }) => {
    test.setTimeout(90000);
    const erreurs = brancherEcouteurs(page);
    await ouvrirSaisieDemo(page);
    const date = await page.evaluate(() => document.getElementById('date-cours').value);
    const da = await page.evaluate(() => document.querySelector('#tbody-saisie-presences input[id^="periodes_"]').id.slice(9));

    await page.locator(`#notes_${da}`).fill('parti à la pause');
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
    expect(await page.evaluate(({ d, da }) => (db.getSync(cle('presences'), []) || [])
        .find((p) => p.date === d && p.da === da)?.notes, { d: date, da })).toBe('parti à la pause');

    await page.evaluate(() => naviguerVers('suivi', 'saisie'));
    await expect(page.locator(`#notes_${da}`)).toHaveValue('parti à la pause');
    await page.locator(`#notes_${da}`).fill('revenu');
    await page.evaluate(() => { naviguerVers('suivi', 'liste'); naviguerVers('suivi', 'saisie'); });
    await expect(page.locator(`#notes_${da}`)).toHaveValue('revenu');
    await page.waitForTimeout(300);
    expect(await page.evaluate(({ d, da }) => (db.getSync(cle('presences'), []) || [])
        .find((p) => p.date === d && p.da === da)?.notes, { d: date, da })).toBe('revenu');
    expect(erreurs).toEqual([]);
});

test('(c)(d) « Confirmer la séance » ; verrouiller une séance non saisie : un seul message', async ({ page }) => {
    test.setTimeout(90000);
    const erreurs = brancherEcouteurs(page);
    await ouvrirSaisieDemo(page);
    const [d1, d2] = await page.evaluate(() => window.__seancesNonSaisies());
    expect(d2, 'deux séances non saisies').toBeTruthy();

    // (c)
    await page.evaluate((d) => window.__ouvrir(d), d1);
    await page.click('[data-action="confirmerSeancePresences"]');
    const c = await page.evaluate((d) => ({ fiches: window.__fiches(d), lignes: document.querySelectorAll('#tbody-saisie-presences input[id^="periodes_"]').length, etat: window.__etat() }), d1);
    expect(c.fiches.length).toBe(c.lignes);
    expect(c.fiches.every((p) => p.periodesPresentes > 0)).toBe(true);
    expect(c.etat).toEqual({ etat: 'Séance saisie', confirmerVisible: false });

    // (d)
    await page.evaluate((d) => window.__ouvrir(d), d2);
    await page.evaluate(() => { window.__toasts = []; });
    await page.click('label[for="checkbox-verrouillage-presences"]');
    await page.waitForTimeout(400);
    const d = await page.evaluate((d) => ({ fiches: window.__fiches(d).length, toasts: window.__toasts.slice(),
        verrou: document.getElementById('checkbox-verrouillage-presences').checked }), d2);
    expect(d.fiches).toBeGreaterThan(0);
    expect(d.verrou).toBe(true);
    expect(d.toasts).toHaveLength(1);
    expect(d.toasts[0]).toContain('Séance saisie et verrouillée : les élèves non marqué·es comptent présent·es.');
    expect(await page.locator('#periodes_' + (await page.evaluate(() => document.querySelector('#tbody-saisie-presences input[id^="periodes_"]').id.slice(9)))).isDisabled()).toBe(true);
    expect(erreurs).toEqual([]);
});

test('(e) « Réinitialiser » sur une séance saisie : confirmation ; « Annuler » et Entrée ne changent rien', async ({ page }) => {
    test.setTimeout(90000);
    const erreurs = brancherEcouteurs(page);
    await ouvrirSaisieDemo(page);
    const [date] = await page.evaluate(() => window.__seancesNonSaisies());
    await page.evaluate((d) => window.__ouvrir(d), date);
    await page.click('[data-action="confirmerSeancePresences"]');
    const avant = await page.evaluate((d) => JSON.stringify(window.__fiches(d)), date);

    await page.click('#colonneHeuresTitre [data-action="reinitialiserSaisie"]');
    const dialogue = page.locator('[role="dialog"]');
    await expect(dialogue).toContainText('Mettre tout le monde absent et vider les notes de cette séance ?');
    await expect(dialogue.getByRole('button', { name: 'Réinitialiser' })).toBeVisible();
    await page.keyboard.press('Enter');   // le focus est sur « Annuler »
    await expect(dialogue).toHaveCount(0);

    await page.click('#colonneHeuresTitre [data-action="reinitialiserSaisie"]');
    await dialogue.getByRole('button', { name: 'Annuler' }).click();
    await page.waitForTimeout(1800);
    expect(await page.evaluate((d) => JSON.stringify(window.__fiches(d)), date)).toBe(avant);
    const valeurs = await page.evaluate(() => [...document.querySelectorAll('#tbody-saisie-presences input[id^="periodes_"]')].map((i) => Number(i.value)));
    expect(valeurs.every((v) => v > 0)).toBe(true);
    expect(erreurs).toEqual([]);
});

test('(f) une absence motivée RàI survit à « Tous présents » et à l’enregistrement automatique', async ({ page }) => {
    test.setTimeout(90000);
    const erreurs = brancherEcouteurs(page);
    await ouvrirSaisieDemo(page);
    const [date] = await page.evaluate(() => window.__seancesNonSaisies());
    const da = await page.evaluate((d) => {
        const da = document.querySelector('#tbody-saisie-presences input[id^="periodes_"]').id.slice(9);
        const p = db.getSync(cle('presences'), []);
        p.push({ date: d, da, periodesPresentes: 0, notes: '', coursId: obtenirCoursActifId(), facultatif: true });
        db.setSync(cle('presences'), p);   // security-ok: fixture littérale du banc (pack démo)
        return da;
    }, date);
    await page.evaluate((d) => window.__ouvrir(d), date);
    await page.click('#colonneHeuresTitre [data-action="tousPresents"]');
    await page.waitForTimeout(2000);
    const fiche = await page.evaluate(({ d, da }) => window.__fiches(d).filter((p) => p.da === da), { d: date, da });
    expect(fiche).toHaveLength(1);
    expect(fiche[0]).toMatchObject({ periodesPresentes: 0, facultatif: true });
    expect(erreurs).toEqual([]);
});

test('(g) un échec d’écriture : « Non enregistré – Enregistrement des présences : … », aucun succès', async ({ page }) => {
    test.setTimeout(90000);
    const erreurs = brancherEcouteurs(page);
    await ouvrirSaisieDemo(page);
    const date = await page.evaluate(() => document.getElementById('date-cours').value);
    const avant = await page.evaluate((d) => JSON.stringify(window.__fiches(d)), date);
    await page.evaluate(() => {
        window.__toasts = [];
        const orig = db.setSync;
        db.setSync = function (k, v) { if (k === cle('presences')) throw new Error('refus simulé'); return orig.call(this, k, v); };
    });
    const da = await page.evaluate(() => document.querySelector('#tbody-saisie-presences input[id^="periodes_"]').id.slice(9));
    await changerPeriodes(page, da, 1);
    await page.waitForTimeout(1900);
    const r = await page.evaluate((d) => ({
        echec: document.querySelector('#temoin-enregistrement .temoin-enregistrement-echec-texte')?.textContent || '',
        toasts: window.__toasts.slice(), base: JSON.stringify(window.__fiches(d))
    }), date);
    expect(r.echec).toMatch(/^Non enregistré – Enregistrement des présences : /);
    expect(r.toasts.filter((t) => /enregistr/i.test(t) && !/^Non enregistré/.test(t))).toEqual([]);
    expect(r.base).toBe(avant);
    expect(erreurs).toEqual([]);
});

test('D2 bis (b) : dans une séance saisie, l’élève sans fiche le dit, et un geste ailleurs ne l’écrit pas', async ({ page }) => {
    test.setTimeout(90000);
    const erreurs = brancherEcouteurs(page);
    await ouvrirSaisieDemo(page);
    const [date] = await page.evaluate(() => window.__seancesNonSaisies());
    await page.evaluate((d) => window.__ouvrir(d), date);
    await page.click('[data-action="confirmerSeancePresences"]');
    // Un·e élève retiré·e de la séance saisie : le cas « arrivé·e après la saisie ».
    const da = await page.evaluate((d) => {
        const da = document.querySelector('#tbody-saisie-presences input[id^="periodes_"]').id.slice(9);
        db.setSync(cle('presences'), db.getSync(cle('presences'), []).filter((p) => !(p.date === d && p.da === da)));   // security-ok: fixture du banc (pack démo)
        return da;
    }, date);
    await page.evaluate(() => initialiserSaisiePresences());
    await expect(page.locator(`#non-saisi_${da}`)).toHaveText('Non saisi·e : compté·e absent·e');
    await expect(page.locator(`#periodes_${da}`)).toHaveValue('0');

    const autre = await page.evaluate((da) => [...document.querySelectorAll('#tbody-saisie-presences input[id^="periodes_"]')].map((i) => i.id.slice(9)).find((x) => x !== da), da);
    await changerPeriodes(page, autre, 1);
    await page.waitForTimeout(1900);
    expect(await page.evaluate(({ d, da }) => window.__fiches(d).some((p) => p.da === da), { d: date, da })).toBe(false);
    await expect(page.locator(`#non-saisi_${da}`)).toBeVisible();
    expect(erreurs).toEqual([]);
});

for (const largeur of [360, 768, 1024, 1180]) {
    test(`barre des présences à ${largeur} px : « Confirmer la séance » entier, dans l’écran, hors du témoin`, async ({ page }) => {
        test.setTimeout(90000);
        await page.setViewportSize({ width: largeur, height: 900 });
        const erreurs = brancherEcouteurs(page);
        await ouvrirSaisieDemo(page);
        const [date] = await page.evaluate(() => window.__seancesNonSaisies());
        await page.evaluate((d) => window.__ouvrir(d), date);
        // Le témoin affiché, comme juste après une écriture.
        await page.evaluate(() => window.temoinEnregistrement.nonEnregistre('banc de placement.', 'Enregistrement des présences', 'x'));
        const m = await page.evaluate(() => {
            const r = (el) => { const b = el.getBoundingClientRect(); return { l: b.left, r: b.right, t: b.top, b: b.bottom, w: b.width, h: b.height }; };
            const btn = document.querySelector('[data-action="confirmerSeancePresences"]');
            const temoin = document.getElementById('temoin-enregistrement');
            btn.scrollIntoView({ block: 'center' });
            const bb = r(btn), bt = r(temoin);
            const chevauche = !(bb.r <= bt.l || bb.l >= bt.r || bb.b <= bt.t || bb.t >= bt.b);
            // Chaque élément de la barre (boutons, état, verrou) tient dans la carte du compteur :
            // à 360 px, la barre sans retour à la ligne coupait « Fermer » et « Verrouiller ».
            const carte = r(document.getElementById('compteur-presences'));
            const horsCarte = [...document.getElementById('actions-presences-bar').children]
                .filter((el) => !el.classList.contains('u-hide'))
                .map((el) => ({ id: el.id || el.textContent.trim(), b: r(el) }))
                .filter((x) => x.b.l < carte.l - 1 || x.b.r > carte.r + 1)
                .map((x) => x.id);
            return { bouton: bb, chevauche, horsCarte,
                deborde: document.documentElement.scrollWidth > window.innerWidth, texte: btn.textContent.trim(),
                etatVisible: !document.getElementById('etat-seance-presences').classList.contains('u-hide') };
        });
        expect(m.texte).toBe('Confirmer la séance');
        expect(m.bouton.w).toBeGreaterThan(0);
        expect(m.bouton.l).toBeGreaterThanOrEqual(0);
        expect(m.bouton.r).toBeLessThanOrEqual(largeur);
        expect(m.chevauche, 'le bouton ne passe pas sous le témoin').toBe(false);
        expect(m.deborde, 'aucun défilement horizontal').toBe(false);
        expect(m.horsCarte, 'toute la barre tient dans sa carte').toEqual([]);
        expect(m.etatVisible).toBe(true);
        await page.screenshot({ path: path.join(__dirname, '..', 'test-results', `lot-d-barre-${largeur}.png`) });
        expect(erreurs).toEqual([]);
    });
}
