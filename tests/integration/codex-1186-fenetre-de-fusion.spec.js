import { test, expect } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #1186 (29 oct. 2026) — LA FENÊTRE DE FUSION EN DEUX COLONNES.
//
// Avant : « Entrer 1, 2, 3 ou 4 », puis un chiffre par conflit, et « Objet {24 propriétés} » des
// deux côtés. Les règles de Grégoire (29 oct.) : rien de choisi d'office ; « La plus récente » est
// une mention, « Prendre les plus récentes » un raccourci ; « Fusionner » attend un choix par rangée.
//
// CE QUE CE BANC JUGE, par le vrai geste (menu Codex › « Fusionner avec un codex… ») : un codex
// « de l'autre appareil » fabriqué par le vrai `Codex.generer` ; deux conflits (une évaluation
// datée des deux côtés, la date objectif du rythme, sans date) et une évaluation qui vient sans
// question. Noms fictifs.
//
// CE QU'IL NE JUGE PAS : les copies (leurs fichiers ne se stockent pas dans le contexte éphémère
// de WebKit) ; Chrome ; le vrai corpus. Deux captures (1 280 et 820 px) sont écrites dans
// `plans de travail/captures/` pour la comparaison à l'ébauche.

const T = 'a2031';
const EVALS = T + '_evaluationsSauvegardees';
const ev = (id, note, date) => ({ id, etudiantDA: '9001186', etudiantNom: 'Alix Fictif', productionId: 'PROD_banc', productionNom: 'Dissertation inventée', noteFinale: note, dateModification: date });
const ICI = {
    [EVALS]: [ev('EV_1', 70, '2031-09-01T14:00:00Z'), ev('EV_2', 80, '2031-09-01T15:00:00Z')],
    preferencesRythme: { heuresJour: 6, dateObjectif: '2031-10-30' }
};
const AUTRE = {
    [EVALS]: [ev('EV_1', 74, '2031-09-03T14:00:00Z'), ev('EV_2', 80, '2031-09-01T15:00:00Z'), ev('EV_3', 66, '2031-09-04T09:00:00Z')],
    preferencesRythme: { heuresJour: 6, dateObjectif: '2031-10-02' }
};

/** Démarre l'application et attend que le stockage soit prêt (un événement, pas un délai). */
async function demarrer(page) {
    page.setDefaultTimeout(15000);
    await page.goto(indexHtml);
    await page.waitForFunction(() => typeof window.auDbPret === 'function' && !!window.Codex && !!window.CodexFusionFenetre);
    await page.evaluate(() => new Promise((r) => window.auDbPret(r)));
}

/** L'espace (hors clés internes) : le point de départ commun des deux appareils. */
function lireLEspace(page) {
    return page.evaluate(async () => {
        const etat = {};
        for (const k of await db.keys()) {
            if (k.charAt(0) === '_') continue;
            const v = await db.get(k, null);
            if (v !== null) etat[k] = v;
        }
        return etat;
    });
}

/** Le codex de l'autre appareil, par le vrai `Codex.generer`, dans un contexte à part. */
async function fabriquerLAutreCodex(browser, chemin, depart) {
    const contexte = await browser.newContext();
    const page = await contexte.newPage();
    await demarrer(page);
    const b64 = await page.evaluate(async ({ depart, donnees }) => {
        Object.keys(depart).forEach((k) => db.setSync(k, depart[k]));
        Object.keys(donnees).forEach((k) => db.setSync(k, donnees[k]));
        await db.flush();
        window.SecuriteExportPreview.previewZipEtConfirmer = async () => true;
        const rendu = await Codex.generer({ nom: 'Codex de l\'autre appareil' });
        const o = new Uint8Array(await rendu.blob.arrayBuffer());
        let binaire = '';
        for (let i = 0; i < o.length; i += 0x8000) binaire += String.fromCharCode.apply(null, o.subarray(i, i + 0x8000));
        return btoa(binaire);
    }, { depart, donnees: AUTRE });
    fs.writeFileSync(chemin, Buffer.from(b64, 'base64'));
    await contexte.close();
}

/** L'espace d'ici, un codex actif (le menu ne propose « Fusionner » qu'alors), puis la fenêtre ouverte. */
async function preparerEtOuvrir(page, browser, fichier) {
    await demarrer(page);
    await fabriquerLAutreCodex(browser, fichier, await lireLEspace(page));
    await page.evaluate(async (donnees) => {
        Object.keys(donnees).forEach((k) => db.setSync(k, donnees[k]));
        db.setSync('_codex_etat', { actif: true, nom: 'Codex d\'ici', derniereSauvegarde: new Date().toISOString(), modificationsDepuis: null, manifeste: null, temoinFiable: true });
        await db.flush();
    }, ICI);
    await page.reload();
    await page.waitForFunction(() => typeof window.auDbPret === 'function' && !!window.Codex && !!window.CodexFusionFenetre);
    await page.evaluate(() => new Promise((r) => window.auDbPret(r)));
    await ouvrirLaFenetre(page, fichier);
}

async function ouvrirLaFenetre(page, fichier) {
    await page.locator('#btn-codex').click();
    const item = page.locator('#codex-menu-fusionner');
    await expect(item, 'témoin : le codex est actif, « Fusionner » est proposé').toBeVisible();
    const [choix] = await Promise.all([page.waitForEvent('filechooser'), item.click()]);
    await choix.setFiles(fichier);
    await expect(page.locator('#fusion-codex-fenetre .fusion2-fenetre')).toBeVisible({ timeout: 30000 });
}

const rangee = (page, titre) => page.locator('#fusion-codex-fenetre .fusion2-rangee', { has: page.locator('.fusion2-rangee-titre', { hasText: titre }) });
const bouton = (r, cote) => r.locator('.fusion2-garder[data-cote="' + cote + '"]');

function lireLesDonnees(page) {
    return page.evaluate(async (cleE) => ({
        evaluations: ((await db.get(cleE, [])) || []).map((e) => e.id + ':' + e.noteFinale).sort(),
        dateObjectif: ((await db.get('preferencesRythme', {})) || {}).dateObjectif
    }), EVALS);
}

test.describe('#1186 — la fenêtre de fusion en deux colonnes', () => {
    test('rien de choisi d\'office ; les plus récentes ; un choix par rangée débloque « Fusionner » ; le résultat suit les choix', async ({ page, browser }) => {
        test.setTimeout(120000);
        const fichier = test.info().outputPath('codex-de-l-autre-appareil.zip');
        await preparerEtOuvrir(page, browser, fichier);
        const fenetre = page.locator('#fusion-codex-fenetre');

        await expect(fenetre.getByText('Viendront de l\'autre codex, sans question : 1 évaluation.')).toBeVisible();
        await expect(fenetre.getByText('Différent des deux côtés (2)')).toBeVisible();
        const ev1 = rangee(page, 'Évaluation d\'« Dissertation inventée »');
        const rythme = rangee(page, 'Date objectif (remise)');
        await expect(ev1).toHaveCount(1);
        await expect(rythme).toHaveCount(1);
        await expect(rythme.locator('.fusion2-cellule[data-cote="local"] .fusion2-texte')).toHaveText('30 octobre 2031');

        // Rien de choisi d'office.
        await expect(fenetre.locator('.fusion2-garder[aria-pressed="true"]')).toHaveCount(0);
        await expect(fenetre.locator('.fusion2-garder')).toHaveCount(4);
        await expect(fenetre.locator('[data-fusion="fusionner"]')).toBeDisabled();
        await expect(fenetre.locator('.fusion2-reste')).toHaveText('Il te reste 2 choix à faire.');
        // « La plus récente » : une mention, du seul côté daté le plus tard, sur la seule rangée datée.
        await expect(fenetre.locator('.fusion2-recente')).toHaveCount(1);
        await expect(ev1.locator('.fusion2-cellule[data-cote="externe"] .fusion2-recente')).toBeVisible();

        // Les captures : la souris hors du bouton Codex (son infobulle couvrirait le titre).
        await page.mouse.move(640, 700);
        await page.setViewportSize({ width: 1280, height: 1100 });
        await page.screenshot({ path: test.info().outputPath('fenetre-de-fusion-1280.png'), fullPage: false });
        await page.setViewportSize({ width: 820, height: 1180 });
        await page.screenshot({ path: test.info().outputPath('fenetre-de-fusion-820.png'), fullPage: false });
        await page.setViewportSize({ width: 1280, height: 720 });

        // « Prendre les plus récentes » ne choisit que la rangée datée.
        await fenetre.getByRole('button', { name: 'Prendre les plus récentes' }).click();
        await expect(bouton(ev1, 'externe')).toHaveAttribute('aria-pressed', 'true');
        await expect(bouton(rythme, 'local')).toHaveAttribute('aria-pressed', 'false');
        await expect(bouton(rythme, 'externe')).toHaveAttribute('aria-pressed', 'false');
        await expect(fenetre.locator('[data-fusion="fusionner"]')).toBeDisabled();
        await expect(fenetre.locator('.fusion2-reste')).toHaveText('Il te reste 1 choix à faire.');

        // Un choix par rangée débloque « Fusionner ».
        await bouton(rythme, 'local').click();
        await expect(bouton(rythme, 'local')).toHaveText('✓ Gardée');
        await expect(fenetre.locator('.fusion2-reste')).toHaveText('Tout est choisi.');
        await expect(fenetre.locator('[data-fusion="fusionner"]')).toBeEnabled();
        await fenetre.locator('[data-fusion="fusionner"]').click();

        // La fin, puis le résultat : EV_1 de l'autre (74), la date d'ici, EV_3 venue sans question.
        await expect(page.getByText('Fusion terminée.', { exact: false })).toBeVisible({ timeout: 30000 });
        const fin = page.locator('#overlay-ui-dialogue');
        await expect(fin.getByRole('button', { name: 'Mettre à jour le codex' })).toBeVisible();
        await fin.getByRole('button', { name: 'Fermer', exact: true }).click();
        await expect(fin).toHaveCount(0);
        expect(await lireLesDonnees(page)).toEqual({ evaluations: ['EV_1:74', 'EV_2:80', 'EV_3:66'], dateObjectif: '2031-10-30' });
    });

    test('« Annuler » n\'écrit rien', async ({ page, browser }) => {
        test.setTimeout(120000);
        const fichier = test.info().outputPath('codex-de-l-autre-appareil.zip');
        await preparerEtOuvrir(page, browser, fichier);
        const avant = await lireLesDonnees(page);
        expect(avant, 'témoin : l\'espace d\'ici').toEqual({ evaluations: ['EV_1:70', 'EV_2:80'], dateObjectif: '2031-10-30' });
        const fenetre = page.locator('#fusion-codex-fenetre');
        await fenetre.getByRole('button', { name: 'Tout prendre de l\'autre codex' }).click();
        await expect(fenetre.locator('[data-fusion="fusionner"]')).toBeEnabled();
        await fenetre.getByRole('button', { name: 'Annuler' }).click();
        await expect(fenetre).toHaveCount(0);
        expect(await lireLesDonnees(page)).toEqual(avant);
    });
});
