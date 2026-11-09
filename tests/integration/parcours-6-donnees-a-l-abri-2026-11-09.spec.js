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
//     fenêtres qui suivent. À partir de 1180 px (corrections du 9 nov., question 8), elle se pose
//     à DROITE de l'aperçu et n'en couvre rien ; le « i » de l'aperçu ouvre son aide au-dessus
//     de lui (question 1) ;
//   · le menu Codex dit « Partage un nouveau fichier » ou « Télécharge un nouveau fichier » selon
//     le chemin (question 5) ;
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
            && a.effect.target.closest('#panneau-assistance, #parcours-voile, #parcours-bulle, .aide-contextuelle-modal, .aide-contextuelle-overlay'))
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

/**
 * La bulle 3 est au-dessus de l'aperçu, et ne couvre ni « Mettre à jour » ni « Annuler ».
 * À partir de 1180 px (question 8, 9 nov.), elle est à DROITE de l'aperçu et n'en couvre rien :
 * ni la mise en garde, ni la liste des fichiers, ni le « i », ni les boutons ; elle tient dans
 * la fenêtre, sans chevaucher la barre de défilement. Sous 1180 px, la place d'avant.
 */
async function bulleSurLApercuSansCouvrirSesBoutons(page) {
    const largeur = page.viewportSize().width;
    // La sonde du moteur (120 ms) pose la place : on attend qu'elle soit prise.
    await expect.poll(() => page.evaluate(() => document.getElementById('parcours-bulle')
        .classList.contains('parcours--a-droite-de-l-apercu')), { message: 'la bulle à droite de l’aperçu', timeout: 3000 })
        .toBe(largeur >= 1180);
    const g = await page.evaluate(() => {
        const r = (s) => document.querySelector(s).getBoundingClientRect();
        const b = r('#parcours-bulle');
        const touche = (x) => !(x.right <= b.left || b.right <= x.left || x.bottom <= b.top || b.bottom <= x.top);
        const centre = document.elementFromPoint((b.left + b.right) / 2, (b.top + b.bottom) / 2);
        return {
            dessus: !!(centre && centre.closest('#parcours-bulle')),
            couvreMettreAJour: touche(r('.export-preview-modal .btn-confirmer')),
            couvreAnnuler: touche(r('.export-preview-modal .btn-annuler')),
            couvreMiseEnGarde: touche(r('.export-preview-modal .export-preview-note')),
            couvreListe: touche(r('.export-preview-modal .export-preview-liste')),
            couvreI: touche(r('.export-preview-modal .btn-aide-contextuelle')),
            aDroite: b.left >= r('.export-preview-modal').right,
            dansLaFenetre: b.left >= 0 && b.top >= 0 && b.right <= document.documentElement.clientWidth && b.bottom <= window.innerHeight
        };
    });
    expect(g.dessus, 'la bulle au-dessus de l’aperçu').toBe(true);
    expect(g.dansLaFenetre, 'la bulle dans la fenêtre').toBe(true);
    expect({ couvreMettreAJour: g.couvreMettreAJour, couvreAnnuler: g.couvreAnnuler })
        .toEqual({ couvreMettreAJour: false, couvreAnnuler: false });
    if (largeur >= 1180) {
        expect({ aDroite: g.aDroite, couvreMiseEnGarde: g.couvreMiseEnGarde, couvreListe: g.couvreListe, couvreI: g.couvreI })
            .toEqual({ aDroite: true, couvreMiseEnGarde: false, couvreListe: false, couvreI: false });
        // Ce qui est couvert se voit aussi au toucher : le milieu de chacun répond, pas la bulle.
        const libres = await page.evaluate(() => ['.export-preview-note', '.export-preview-liste', '.btn-confirmer', '.btn-annuler']
            .map((s) => {
                const el = document.querySelector('.export-preview-modal ' + s);
                const r = el.getBoundingClientRect();
                const dessus = document.elementFromPoint((r.left + r.right) / 2, (r.top + r.bottom) / 2);
                return !!(dessus && el.contains(dessus));
            }));
        expect(libres).toEqual([true, true, true, true]);
    } else {
        // Sous 1180 px, la place d'avant : au-dessus de « Mettre à jour », à la largeur ordinaire.
        expect(g.aDroite).toBe(false);
    }
}

/**
 * Question 1 (9 nov.) : toucher le « i » de l'aperçu ouvre son aide au-dessus de lui ; la refermer
 * rend l'aperçu tel quel, et l'aide ouverte ailleurs reste à sa place habituelle.
 * Break-test (9 nov., Chromium) : `placerLEtageDeLAide` sans effet (accompagnement.js) → ROUGE
 * (l'aide sous l'aperçu : le milieu de l'aide répond par l'aperçu). Rétabli → vert.
 */
async function aideDuIAuDessusDeLApercu(page, capturer) {
    await page.click('.export-preview-modal .btn-aide-contextuelle');
    const aide = page.locator('.aide-contextuelle-modal.active');
    await expect(aide).toBeVisible();
    await expect(aide.locator('#aide-ctx-titre')).toContainText('Ce que contient le fichier');
    const g = await page.evaluate(() => {
        const m = document.querySelector('.aide-contextuelle-modal.active');
        const r = m.getBoundingClientRect();
        const points = [[0.5, 0.5], [0.15, 0.15], [0.85, 0.15], [0.15, 0.85], [0.85, 0.85]];
        const dessus = points.every(([fx, fy]) => {
            const el = document.elementFromPoint(r.left + r.width * fx, r.top + r.height * fy);
            return !!(el && m.contains(el));
        });
        // Le micro-popup d'un terme souligné vit au-dessus de l'aide (#1152) : il monte avec elle.
        const micro = document.createElement('div');
        micro.className = 'glossaire-micropopup';
        document.body.appendChild(micro);
        const z = (el) => parseInt(getComputedStyle(el).zIndex, 10);
        const n = { apercu: z(document.querySelector('.export-preview-modal').parentElement), bulle: z(document.getElementById('parcours-bulle')),
            voile: z(document.querySelector('.aide-contextuelle-overlay')), aide: z(m), micro: z(micro) };
        micro.remove();
        return { dessus, ordre: n.voile > n.apercu && n.voile > n.bulle && n.aide > n.voile && n.micro > n.aide };
    });
    expect(g).toEqual({ dessus: true, ordre: true });
    if (capturer) await capture(page, capturer);
    await aide.locator('.primo-popup-fermer').click();
    await expect(page.locator('.aide-contextuelle-modal.active')).toHaveCount(0);
    await expect(page.locator('.export-preview-modal')).toBeVisible();
    expect(await page.evaluate(() => document.body.classList.contains('aide-par-dessus-les-fenetres'))).toBe(false);
    // Ouverte par sa clé (sans déclencheur), ou par un « i » posé dans la page (une couche basse), l'aide
    // reste à sa place habituelle. Le « i » de la page reçoit un vrai clic d'événement : l'aperçu, ouvert,
    // empêcherait le toucher, mais c'est le répartiteur des « i » (accompagnement.js) qui est jugé ici.
    // Break-test (relecture du 9 nov.) : la classe posée dès qu'il y a un déclencheur, le niveau ignoré →
    // ROUGE (« i » de la page : 100011). Rétabli → vert.
    const zAilleurs = await page.evaluate(() => {
        const lire = () => getComputedStyle(document.querySelector('.aide-contextuelle-modal.active')).zIndex;
        window.afficherAideContextuelle('modal-export-preview');
        const parCle = lire();
        window.fermerAideContextuelle();
        const i = document.createElement('button');
        i.className = 'btn-aide-contextuelle';
        i.setAttribute('data-aide', 'modal-export-preview');
        document.querySelector('main, #contenu, body').appendChild(i);
        i.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        const parUnIDeLaPage = lire();
        window.fermerAideContextuelle();
        i.remove();
        return { parCle, parUnIDeLaPage };
    });
    expect(zAilleurs).toEqual({ parCle: '10002', parUnIDeLaPage: '10002' });
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
    await expect(item.locator('.assistance-parcours-refus')).toHaveText('Commence par « Mettre ta classe en place » : ton codex gardera ce que tu y auras mis.');
    await expect(item.locator('.assistance-parcours-refus')).toHaveAttribute('role', 'status');
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

        // Question 1 (9 nov.) : le « i » ouvre « Ce que contient le fichier » AU-DESSUS de l'aperçu
        // (99999) et de la bulle (100002) ; l'étage entier monte, le micro-popup des termes compris.
        await aideDuIAuDessusDeLApercu(page, clair ? '' : '1180-sombre-etape-3-aide-du-i');

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
    await bulleSurLApercuSansCouvrirSesBoutons(page);
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

// Question 8 (décidée par Cowork le 9 nov.) : à 1440 px aussi, la bulle 3 se pose à droite de
// l'aperçu et n'en couvre rien, pour chacun des trois chemins dont Grégoire juge les captures.
// Break-tests (9 nov., Chromium) : `largeurADroiteDeLApercu` rendant toujours 0 → ces trois
// essais ROUGES (la bulle n'est pas à droite) ; le seuil de 1180 retiré → l'essai « 1179 px »
// ROUGE (la bulle étroite à droite). Rétablis → verts.
for (const chemin of ['fenetre', 'partage', 'copies-manquantes']) {
    test(`1440 px, ${chemin} : la bulle 3 à droite de l'aperçu ne couvre ni la mise en garde, ni la liste, ni « Mettre à jour », ni « Annuler »`, async ({ page }) => {
        const erreurs = await ouvrirEspace(page, 1440, { chemin: chemin === 'partage' ? 'partage' : 'fenetre' });
        const { phrases } = await P(page);
        if (chemin === 'copies-manquantes') {
            await page.evaluate(() => db.setSync(cle('fichiersTravaux'), [{ id: 'ft-fictif-1', nomFichier: 'production-fictive.pdf' }]));   // security-ok: banc, donnée fictive créée ici
        }
        await lancerLeParcours(page);
        await jusquALApercu(page, chemin !== 'copies-manquantes' ? {} : {
            avantApercu: async () => {
                const avertissement = page.locator('#overlay-ui-dialogue');
                await expect(avertissement).toBeVisible();
                await avertissement.locator('.btn-supprimer').click();
            }
        });
        await expect(texteBulle(page)).toContainText(chemin === 'partage' ? phrases.partage : phrases.fenetre1);
        await bulleSurLApercuSansCouvrirSesBoutons(page);
        const nom = chemin === 'fenetre' ? 'fenetre-de-choix' : chemin;
        await capture(page, `1440-sombre-etape-3-${nom}`);
        await ecrireEtAttendreEtape4(page);
        expect(erreurs).toEqual([]);
    });
}

// La hauteur de l'iPad à l'horizontale (1180 × 820), que les autres essais ne jouent pas (relecture du 9 nov.).
test('1180 × 820 (iPad à l’horizontale), fenêtre de choix : la bulle 3 à droite de l’aperçu, sans rien en couvrir', async ({ page }) => {
    const erreurs = await ouvrirEspace(page, 1180, { hauteur: 820 });
    await lancerLeParcours(page);
    await jusquALApercu(page);
    await bulleSurLApercuSansCouvrirSesBoutons(page);
    await ecrireEtAttendreEtape4(page);
    expect(erreurs).toEqual([]);
});

test('1179 px : sous 1180, la bulle 3 garde la place d’avant (au-dessus de « Mettre à jour », largeur ordinaire)', async ({ page }) => {
    const erreurs = await ouvrirEspace(page, 1179);
    await lancerLeParcours(page);
    await jusquALApercu(page);
    await bulleSurLApercuSansCouvrirSesBoutons(page);
    const g = await page.evaluate(() => {
        const b = document.getElementById('parcours-bulle');
        const r = b.getBoundingClientRect(), m = document.querySelector('.export-preview-modal .btn-confirmer').getBoundingClientRect();
        return { largeur: Math.round(r.width), auDessus: r.bottom <= m.top, enLigne: b.style.width };
    });
    expect(g).toEqual({ largeur: 380, auDessus: true, enLigne: '' });
    expect(erreurs).toEqual([]);
});

// Question 5 (validée par Grégoire le 9 nov., 9 h 33) : la ligne sous « Mettre à jour le codex »
// dit le chemin. Un essai par cas. Break-tests (9 nov., Chromium) : la ligne remise à
// « Télécharge un nouveau fichier » en dur (codex.js, _actualiserMenu) → « partage » ROUGE ;
// « Partage un nouveau fichier » en dur → « telechargement » ROUGE. Rétablie → verts.
for (const [chemin, ligne] of [['partage', 'Partage un nouveau fichier'], ['telechargement', 'Télécharge un nouveau fichier']]) {
    test(`menu Codex, ${chemin} : sous « Mettre à jour le codex », « ${ligne} »`, async ({ page }) => {
        const erreurs = await ouvrirEspace(page, 1180, { chemin });
        await page.click('#btn-codex');
        await expect(page.locator('#codex-menu-enreg-label')).toHaveText('Mettre à jour le codex');
        await expect(page.locator('#codex-menu-enreg-info')).toBeVisible();
        await expect(page.locator('#codex-menu-enreg-info')).toHaveText(ligne);
        expect(erreurs).toEqual([]);
    });
}
