import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { attendreApplication } from './harness/attendre-application.js';

// =======================================================================
// LE SIXIÈME PARCOURS, « METTRE TES DONNÉES À L'ABRI » — 9 NOVEMBRE 2026
// =======================================================================
// plans de travail/CONSIGNE-LOT-2026-11-08-parcours-6-donnees-a-l-abri.md. Ce banc joue le
// parcours en faisant les gestes, sur le vrai code, et juge :
//   · le panneau : le parcours inscrit, sa ligne ; sans trimestre réel, le bouton ne lance rien
//     et le panneau dit la phrase du refus ; le haut du menu Codex sans codex ;
//   · chaque étape avance sur l'ÉTAT atteint : le menu ouvert, l'aperçu ouvert, le codex écrit ;
//   · l'étape 3 : la bulle est AU-DESSUS de l'aperçu, près de « Mettre à jour » sans le couvrir,
//     et dit la phrase du chemin que prendra l'écriture (fenêtre de choix, partage,
//     téléchargement et « Il y est », fichier tenu, copies manquantes) ; elle cède la place aux
//     fenêtres qui suivent ;
//   · l'étape 4 : le menu rouvert, « Ouvrir un codex… » éclairé mais sans effet ; « Terminer » ;
//   · le rappel « Mets ton codex à jour », dû, ne s'ouvre pas pendant le parcours, et la mise à
//     jour du parcours le repousse.
// Les écritures sont fausses (showSaveFilePicker, navigator.share remplacés) : aucun fichier sur
// le disque, sauf le téléchargement du chemin 3, que Chromium garde à part. Noms fictifs.
// Break-tests (9 nov., Chromium) : la garde de « Ouvrir un codex… » retirée (parcours-donnees.js,
// l'écouteur en capture) → « de bout en bout (1180, sombre) » ROUGE (1 ouverture au lieu de 0) ;
// la bulle laissée sous les fenêtres (`auDessusDesFenetres` toujours faux) → « de bout en bout »
// et « feuille de partage » ROUGES (la bulle n'est plus au-dessus de l'aperçu). Rétablis → verts.
// ⚠ Écrit et joué sous Chromium (session cloud du 9 nov., WebKit absent) : le verdict WebKit
// se prend sur le Mac. L'apparence se juge sur capture :
//   CAPTURES_PARCOURS=<dossier> npx playwright test parcours-6-donnees-a-l-abri

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');
const CAPTURES = process.env.CAPTURES_PARCOURS || '';

test.use({ deviceScaleFactor: CAPTURES ? 2 : 1 });

const BRUITS_ATTENDUS = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource/i,
    /Failed to load resource/i
];

async function capture(page, nom) {
    if (!CAPTURES) return;
    fs.mkdirSync(CAPTURES, { recursive: true });
    await page.mouse.move(2, (page.viewportSize().height / 2) | 0);
    await page.evaluate(() => window.accompagnement && window.accompagnement.masquerHover && window.accompagnement.masquerHover());
    await page.waitForFunction(() => document.getAnimations()
        .filter((a) => a.effect && a.effect.target && a.effect.target.closest
            && a.effect.target.closest('#panneau-assistance, #parcours-voile, #parcours-bulle'))
        .every((a) => a.playState !== 'running'));
    await page.screenshot({ path: path.join(CAPTURES, nom + '.jpg'), type: 'jpeg', quality: 85 });
}

/**
 * Un espace vide, l'aide dans les pages allumée (son défaut : l'effacement du banc la laisse
 * éteinte), un trimestre réel (sauf `trimestre: false`), et le chemin d'écriture voulu.
 */
async function ouvrirEspace(page, largeur, { clair = false, hauteur = 900, chemin = 'fenetre', trimestre = true } = {}) {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push('pageerror: ' + e.message));
    page.on('console', (m) => {
        if (m.type() === 'error' && !BRUITS_ATTENDUS.some((re) => re.test(m.text()))) erreurs.push('console.error: ' + m.text());
    });
    page.on('dialog', (d) => d.accept().catch(() => {}));
    await page.setViewportSize({ width: largeur, height: hauteur });
    await page.goto(indexHtml);
    await attendreApplication(page);
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
    await attendreApplication(page);
    await page.evaluate(({ clair, trimestre }) => {
        // Le rappel ne vient pas troubler la mise en place : il est éprouvé à part, plus bas.
        const loin = new Date(); loin.setDate(loin.getDate() + 30);
        db.setSync('backupProchainRappel', loin.toISOString());
        definirPreference('modeClair', clair);
        document.body.classList.toggle('mode-clair', clair);
        definirPreference('accompagnementActif', true);
        document.body.classList.add('aide-contextuelle-active');
        if (trimestre) db.setSync('trimestres', [{ id: 'a2026', nom: 'Automne 2026' }]);
        window.__ouvertures = 0;
        Codex.actionOuvrir = function () { window.__ouvertures++; };
    }, { clair, trimestre });
    await poserChemin(page, chemin);
    return erreurs;
}

/** Le chemin que prendra l'écriture : fenêtre de choix, feuille de partage, ou téléchargement. */
async function poserChemin(page, chemin) {
    await page.evaluate((c) => {
        window.__ecritures = 0;
        window.showSaveFilePicker = c === 'fenetre' ? async () => ({
            createWritable: async () => ({
                write: async () => {},
                close: async () => { window.__ecritures++; },
                abort: async () => {}
            })
        }) : undefined;
        navigator.canShare = c === 'partage' ? () => true : undefined;
        navigator.share = async () => { window.__ecritures++; };
    }, chemin);
}

const bulle = (page) => page.locator('#parcours-bulle');
const texteBulle = (page) => page.locator('#parcours-bulle .parcours-bulle-texte');
const P = (page) => page.evaluate(() => ({
    phrases: window.ParcoursDonnees.phrases,
    textes: window.ParcoursDonnees.etapes.map((e) => e.texte)
}));

async function attendreEtape(page, n) {
    await expect(bulle(page).locator('.parcours-bulle-rang')).toHaveText(n + ' sur 4', { timeout: 10000 });
    await expect(bulle(page)).toBeFocused();
}

/** Le contour doit être posé SUR l'élément attendu (la sonde du moteur passe toutes les 120 ms). */
async function contourSur(page, selecteur) {
    await expect.poll(() => page.evaluate((sel) => {
        const c = document.getElementById('parcours-contour');
        const el = document.querySelector(sel);
        if (!c || c.hidden || !el) return 'absent';
        const a = c.getBoundingClientRect(), b = el.getBoundingClientRect();
        const dx = Math.abs((a.left + a.right) / 2 - (b.left + b.right) / 2);
        const dy = Math.abs((a.top + a.bottom) / 2 - (b.top + b.bottom) / 2);
        return dx < 3 && dy < 3 ? 'posé' : 'décalé de ' + Math.round(dx) + ', ' + Math.round(dy);
    }, selecteur), { message: 'contour posé sur ' + selecteur, timeout: 3000 }).toBe('posé');
}

async function lancerLeParcours(page) {
    await page.click('#entete-menu-bouton');
    await page.click('#btn-assistance-menu');
    await expect(page.locator('#panneau-assistance')).toBeVisible();
    await page.click('[data-parcours="donnees"] .assistance-parcours-bouton');
}

/** Étapes 1 et 2 : le menu Codex, puis « Mettre à jour le codex », jusqu'à l'aperçu (étape 3). */
async function jusquALApercu(page, { capturer = '', avantApercu = null } = {}) {
    await attendreEtape(page, 1);
    await contourSur(page, '#btn-codex');
    if (capturer) await capture(page, capturer + '-etape-1');
    await page.click('#btn-codex');
    await attendreEtape(page, 2);
    await contourSur(page, '#codex-menu [data-action="Codex.actionEnregistrer"]');
    if (capturer) await capture(page, capturer + '-etape-2');
    await page.click('#codex-menu [data-action="Codex.actionEnregistrer"]');
    if (avantApercu) await avantApercu();
    await expect(page.locator('.export-preview-modal')).toBeVisible();
    await attendreEtape(page, 3);
    await contourSur(page, '.export-preview-modal .btn-confirmer');
}

/** La bulle 3 est au-dessus de l'aperçu, et ne couvre ni « Mettre à jour » ni « Annuler ». */
async function bulleSurLApercuSansCouvrirSesBoutons(page) {
    const g = await page.evaluate(() => {
        const r = (s) => document.querySelector(s).getBoundingClientRect();
        const b = r('#parcours-bulle');
        const touche = (x) => !(x.right <= b.left || b.right <= x.left || x.bottom <= b.top || b.bottom <= x.top);
        const centre = document.elementFromPoint((b.left + b.right) / 2, (b.top + b.bottom) / 2);
        return {
            dessus: !!(centre && centre.closest('#parcours-bulle')),
            couvreMettreAJour: touche(r('.export-preview-modal .btn-confirmer')),
            couvreAnnuler: touche(r('.export-preview-modal .btn-annuler'))
        };
    });
    expect(g).toEqual({ dessus: true, couvreMettreAJour: false, couvreAnnuler: false });
}

async function ecrireEtAttendreEtape4(page, { ilYEst = false, capturer = '' } = {}) {
    await page.click('.export-preview-modal .btn-confirmer');
    if (ilYEst) {
        const fenetre = page.locator('#overlay-ui-dialogue');
        await expect(fenetre).toContainText('Téléchargement lancé');
        // La bulle cède la place : « Il y est » reste touchable.
        await expect.poll(() => page.evaluate(() => {
            const btn = [...document.querySelectorAll('#overlay-ui-dialogue button')].find((x) => x.textContent.trim() === 'Il y est');
            const r = btn.getBoundingClientRect();
            return document.elementFromPoint((r.left + r.right) / 2, (r.top + r.bottom) / 2) === btn;
        })).toBe(true);
        if (capturer) await capture(page, capturer);
        await fenetre.getByRole('button', { name: 'Il y est' }).click();
    }
    await attendreEtape(page, 4);
    await expect(page.locator('#codex-menu-statut-haut')).toContainText('Ton codex est à jour');
    await contourSur(page, '#codex-menu [data-action="Codex.actionOuvrir"]');
}

test('panneau : le parcours inscrit ; sans trimestre réel, « Commencer » ne lance rien et le panneau dit pourquoi ; le haut du menu sans codex', async ({ page }) => {
    const erreurs = await ouvrirEspace(page, 1180, { trimestre: false });
    await page.click('#btn-codex');
    await expect(page.locator('#codex-menu-statut-haut')).toHaveText('Pas encore de codex : « Mettre à jour le codex » en crée un avec tes données.');
    await page.click('#btn-codex');

    await page.click('#entete-menu-bouton');
    await page.click('#btn-assistance-menu');
    const item = page.locator('[data-parcours="donnees"]');
    await expect(item.locator('.assistance-parcours-titre')).toHaveText("Mettre tes données à l'abri");
    await expect(item.locator('.assistance-parcours-ligne')).toHaveText('Une copie complète de ton travail, hors du navigateur et rangée dans un lieu protégé : ton codex.');
    await expect(item.locator('.assistance-parcours-etat')).toHaveText('À faire');
    // Le compteur suit le registre : six avec les parcours 3 à 5, trois sur cette branche.
    const n = await page.evaluate(() => window.Assistance.parcours().length);
    await expect(page.locator('#assistance-menu-rang')).toHaveText('1 sur ' + n);

    // La démo ouverte ne compte pas : le codex l'exclut.
    await page.evaluate(() => db.setSync('trimestres', [{ id: 'demo', nom: 'Démo' }]));
    await item.locator('.assistance-parcours-bouton').click();
    await expect(item.locator('.assistance-parcours-condition')).toHaveText('Commence par « Mettre ta classe en place » : ton codex gardera ce que tu y auras mis.');
    await expect(item.locator('.assistance-parcours-condition')).toHaveAttribute('role', 'status');
    await expect(page.locator('#panneau-assistance')).toBeVisible();
    await expect(bulle(page)).toHaveCount(0);
    expect(await page.evaluate(() => window.Assistance.etatDe('donnees').etat)).toBe('a-faire');
    await capture(page, 'panneau-1180-sombre-sans-trimestre');
    expect(erreurs).toEqual([]);
});

for (const clair of [false, true]) {
    const theme = clair ? 'clair' : 'sombre';
    test(`de bout en bout, fenêtre de choix (1180, ${theme}) : chaque étape sur l'état atteint ; « Ouvrir un codex… » sans effet ; le rappel attend ; « Refaire » dit le fichier tenu`, async ({ page }) => {
        const erreurs = await ouvrirEspace(page, 1180, { clair });
        const { phrases, textes } = await P(page);
        // Des évaluations réelles : le rappel aurait de quoi s'ouvrir.
        await page.evaluate(() => db.setSync(cle('evaluationsSauvegardees'), [{ id: 'eval-fictive-1' }]));   // security-ok: banc, donnée fictive créée ici
        await lancerLeParcours(page);
        await attendreEtape(page, 1);
        await expect(texteBulle(page)).toHaveText(textes[0]);

        // Le rappel devient dû en plein parcours : il ne s'ouvre pas.
        await page.evaluate(() => {
            db.setSync('backupProchainRappel', new Date(Date.now() - 1000).toISOString());
            window.backupReminder.verifierEtAfficher();
        });

        await jusquALApercu(page, { capturer: `1180-${theme}` });
        await expect(page.locator('#overlay-backup-reminder')).toHaveCount(0);
        await expect(texteBulle(page)).toHaveText(
            textes[2].split(phrases.fenetre1)[0] + phrases.fenetre1 + ' ' + phrases.fenetre2 + ' ' +
            'Quand le menu affiche « Ton codex est à jour », ta copie est faite.');
        await bulleSurLApercuSansCouvrirSesBoutons(page);
        // Le « i » de l'aperçu (bulle 2) : présent, l'aide dans les pages allumée (son défaut),
        // et pas couvert par la bulle 3 à cette largeur. À 390 px, la bulle le couvre (rapport).
        await expect(page.locator('.export-preview-modal .btn-aide-contextuelle')).toBeVisible();
        expect(await page.evaluate(() => {
            const i = document.querySelector('.export-preview-modal .btn-aide-contextuelle');
            const r = i.getBoundingClientRect();
            const dessus = document.elementFromPoint((r.left + r.right) / 2, (r.top + r.bottom) / 2);
            return !!(dessus && i.contains(dessus));
        }), 'le « i » n’est pas couvert par la bulle').toBe(true);
        await capture(page, `1180-${theme}-etape-3-fenetre-de-choix`);

        await ecrireEtAttendreEtape4(page);
        expect(await page.evaluate(() => window.__ecritures)).toBe(1);
        await expect(texteBulle(page)).toHaveText(textes[3]);
        await expect(bulle(page).locator('.parcours-bulle-sortie')).toHaveCount(0);
        await capture(page, `1180-${theme}-etape-4`);

        // « Ouvrir un codex… » est éclairé, mais ne fait rien pendant le parcours.
        // Le répartiteur des data-action (main.js) répond dans le clic même : rien à attendre.
        await page.click('#codex-menu [data-action="Codex.actionOuvrir"]');
        expect(await page.evaluate(() => window.__ouvertures)).toBe(0);
        // Le toucher a pris le focus : la bulle reste, à la même étape.
        await expect(bulle(page).locator('.parcours-bulle-rang')).toHaveText('4 sur 4');

        await bulle(page).getByRole('button', { name: 'Terminer' }).click();
        await expect(bulle(page)).toHaveCount(0);
        expect(await page.evaluate(() => window.Assistance.etatDe('donnees').etat)).toBe('fait');

        // La mise à jour du parcours a repoussé le rappel : hors parcours, il n'est plus dû.
        // (L'attente de la fin du parcours, minutée, est éprouvée dans Vitest.)
        await page.evaluate(() => window.backupReminder.verifierEtAfficher());
        await expect(page.locator('#overlay-backup-reminder')).toHaveCount(0);
        const jours = await page.evaluate(() => (new Date(db.getSync('backupProchainRappel', null)) - Date.now()) / 864e5);
        expect(jours).toBeGreaterThan(13);
        // Hors parcours, « Ouvrir un codex… » répond de nouveau.
        await page.click('#btn-codex');
        await page.click('#codex-menu [data-action="Codex.actionOuvrir"]');
        expect(await page.evaluate(() => window.__ouvertures)).toBe(1);

        if (clair) { expect(erreurs).toEqual([]); return; }

        // « Refaire » : le fichier est tenu, il sera réécrit sans question.
        await lancerLeParcours(page);
        await jusquALApercu(page);
        await expect(texteBulle(page)).toContainText(phrases.fenetre2);
        await expect(texteBulle(page)).not.toContainText(phrases.fenetre1);
        await capture(page, '1180-sombre-etape-3-fichier-tenu');
        await ecrireEtAttendreEtape4(page);
        expect(await page.evaluate(() => window.__ecritures)).toBe(2);
        expect(erreurs).toEqual([]);
    });
}

test('feuille de partage, puis téléchargement et « Il y est » (1180, sombre) : la phrase du chemin ; la bulle cède la place à « Il y est »', async ({ page }) => {
    const erreurs = await ouvrirEspace(page, 1180, { chemin: 'partage' });
    const { phrases } = await P(page);
    await lancerLeParcours(page);
    await jusquALApercu(page);
    await expect(texteBulle(page)).toContainText(phrases.partage);
    await bulleSurLApercuSansCouvrirSesBoutons(page);
    await capture(page, '1180-sombre-etape-3-partage');
    await ecrireEtAttendreEtape4(page);
    expect(await page.evaluate(() => window.__ecritures)).toBe(1);
    await bulle(page).getByRole('button', { name: 'Terminer' }).click();

    await poserChemin(page, 'telechargement');
    await lancerLeParcours(page);
    await jusquALApercu(page);
    await expect(texteBulle(page)).toContainText(phrases.telechargement);
    await bulleSurLApercuSansCouvrirSesBoutons(page);
    await capture(page, '1180-sombre-etape-3-telechargement');
    await ecrireEtAttendreEtape4(page, { ilYEst: true, capturer: '1180-sombre-etape-3-il-y-est' });
    expect(erreurs).toEqual([]);
});

test('des copies manquent (1180, sombre) : l’avertissement passe pendant l’étape 2, la phrase de la fenêtre perd celle de la réécriture', async ({ page }) => {
    const erreurs = await ouvrirEspace(page, 1180);
    const { phrases } = await P(page);
    // Une production dont le fichier n'est pas dans l'application (nom fictif).
    await page.evaluate(() => db.setSync(cle('fichiersTravaux'), [{ id: 'ft-fictif-1', nomFichier: 'production-fictive.pdf' }]));   // security-ok: banc, donnée fictive créée ici
    await lancerLeParcours(page);
    await jusquALApercu(page, {
        avantApercu: async () => {
            const avertissement = page.locator('#overlay-ui-dialogue');
            await expect(avertissement).toBeVisible();
            await avertissement.locator('.btn-supprimer').click();
        }
    });
    await expect(texteBulle(page)).toContainText(phrases.fenetre1);
    await expect(texteBulle(page)).not.toContainText(phrases.fenetre2);
    await capture(page, '1180-sombre-etape-3-copies-manquantes');
    await ecrireEtAttendreEtape4(page);
    expect(await page.evaluate(() => window.__ecritures)).toBe(1);
    expect(erreurs).toEqual([]);
});

for (const chemin of ['partage', 'telechargement']) {
    test(`390 px, ${chemin} : l'étape 1 et l'étape 3 ; la bulle tient au-dessus de « Mettre à jour » sans le couvrir`, async ({ page }) => {
        const erreurs = await ouvrirEspace(page, 390, { hauteur: 844, chemin });
        const { phrases } = await P(page);
        await lancerLeParcours(page);
        await jusquALApercu(page, { capturer: chemin === 'partage' ? '390-sombre' : '' });
        await expect(texteBulle(page)).toContainText(phrases[chemin]);
        await bulleSurLApercuSansCouvrirSesBoutons(page);
        await capture(page, `390-sombre-etape-3-${chemin}`);
        await ecrireEtAttendreEtape4(page, { ilYEst: chemin === 'telechargement', capturer: chemin === 'telechargement' ? '390-sombre-etape-3-il-y-est' : '' });
        expect(erreurs).toEqual([]);
    });
}
