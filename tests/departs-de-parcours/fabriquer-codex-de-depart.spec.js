import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import JSZip from 'jszip';
import { leTroisiemeParcoursFait, dossierDesCaptures } from '../integration/harness/nous-faisons-evaluer-de-banc.js';
import { DEPARTS, DOSSIER_DES_DEPARTS, nomDuCodex } from './departs.js';

// =======================================================================
// FABRIQUER LES CODEX DE DÉPART (20 nov. 2026)
// =======================================================================
// plans de travail/CONSIGNE-2026-11-19-codex-de-depart.md, point 4. Ce n'est pas un banc : il FABRIQUE des fichiers.
// Il vit hors de tests/integration pour que la suite ne le lance pas ; on le lance à la main, depuis tests/ :
//     npm run departs                                              (le Mac : WebKit)
//     PLAYWRIGHT_CHROMIUM=/opt/pw-browsers/chromium npm run departs   (une session cloud)
// Il écrit un fichier par entrée de DEPARTS (departs.js) dans DOSSIER_DES_DEPARTS (`departs/` à la racine, ou
// DEPARTS_DOSSIER). Le banc tests/integration/codex-de-depart-2026-11-20.spec.js ouvre ensuite chaque fichier.
//
// Chaque préparation rejoue les parcours d'avant par leurs gestes, puis le vrai `Codex.generer` écrit le fichier,
// comme « Mettre à jour le codex » : la démo n'y entre pas (T2), les clés `_…` non plus.

/**
 * Les préparations : un espace où les parcours d'avant sont faits. Mesuré dans le code le 20 nov. 2026 :
 *  - « Recevoir » refuse sans groupe-cours actif ni production qui nomme sa grille, son échelle et sa cartouche
 *    (js/parcours-recevoir.js, `condition`) ;
 *  - « Monter ton cours » refuse sans production dans la bibliothèque (js/parcours-cours.js, `condition`) ; sa
 *    première bulle ouvre « Conception › Alignement » et part de la carte active, quelle qu'elle soit ;
 *  - « Mettre tes données à l'abri » refuse sans trimestre réel (js/parcours-donnees.js, `aUnTrimestreReel`).
 * Les trois partent donc d'un même état : « Mettre ta classe en place » et « Évaluer une première production » faits
 * par leurs gestes (le départ des bancs du « Nous faisons » des parcours 4 et 5).
 */
const PREPARATIONS = {
    'classe-et-evaluer': async (page) => {
        // 20 nov. 2026 (plans de travail/CONSIGNE-2026-11-20-essai-parcours.md, D) : le « Nous faisons » neuf d'« Évaluer »
        // sort sans bulle ni panneau ouvert (avant, le panneau restait ouvert et la fabrique le fermait par Échap).
        await leTroisiemeParcoursFait(page, { cap: 'p3' });
        await expect(page.locator('#panneau-assistance'), 'le troisième parcours fait : aucun panneau ouvert').toHaveCount(0);
    }
};

/** Ce que les bancs posent pour eux-mêmes et qui ne doit pas voyager : l'aide dans les pages, coupée à l'ouverture. */
async function retirerLesReglagesDuBanc(page) {
    await page.evaluate(() => { definirPreference('modeClair', true); });
}

/**
 * Le rappel « Mets ton codex à jour » (js/modal-backup-reminder.js) s'ouvre dans tout espace qui a des données et pas
 * encore de date de rappel : à la fin de « Mettre ta classe en place », une personne l'a devant elle et y répond. Sans
 * réponse dans le fichier, il couvre le menu après chaque ouverture (mesuré le 20 nov., tests/mesures/
 * codex-de-depart-touchers.mjs). La réponse jouée : « Plus tard », « Dans 30 jours » (le 10 déc., à l'horloge des bancs),
 * pour qu'il ne revienne pas pendant les essais de la semaine.
 */
async function repondreAuRappel(page) {
    await page.evaluate(() => window.backupReminder.verifierEtAfficher());
    const rappel = page.locator('#overlay-backup-reminder.actif');
    await expect(rappel, 'le rappel est dû dans cet espace').toHaveCount(1);
    await page.selectOption('#select-rappel-backup', '30');
    await rappel.getByRole('button', { name: 'Plus tard', exact: true }).click();
    await expect(rappel).toHaveCount(0);
}

/** Le vrai `Codex.generer`, l'aperçu « voici ce qui part » accepté d'office (comme aux bancs du codex). */
async function genererLeCodex(page, nom) {
    const b64 = await page.evaluate(async (n) => {
        await db.flush();
        window.SecuriteExportPreview.previewZipEtConfirmer = async () => true;
        const rendu = await Codex.generer({ nom: n });
        const o = new Uint8Array(await rendu.blob.arrayBuffer());
        let binaire = '';
        for (let i = 0; i < o.length; i += 0x8000) binaire += String.fromCharCode.apply(null, o.subarray(i, i + 0x8000));
        return btoa(binaire);
    }, nom);
    return Buffer.from(b64, 'base64');
}

/** Témoin : le fichier porte ce que le parcours exige au départ (lu dans le zip, pas dans la page). */
async function temoins(octets) {
    const zip = await JSZip.loadAsync(octets);
    const donnees = JSON.parse(await zip.file('donnees.json').async('string'));
    const trimestres = (donnees.trimestres || []).filter((t) => t && t.id && t.id !== 'demo');
    const t = trimestres[0] && trimestres[0].id;
    const prods = (t && donnees[t + '_productions']) || [];
    return {
        trimestreReel: trimestres.length,
        groupeCoursActif: !!(donnees.groupeCoursActif && donnees.groupeCoursActif.id),
        productionPrete: prods.some((p) => p && p.grilleId && p.echelleId && p.cartoucheId),
        rappelRepondu: !!donnees.backupProchainRappel,
        sansLaDemo: Object.keys(donnees).filter((k) => /^demo_/.test(k)).length
    };
}

const parPreparation = DEPARTS.reduce((acc, d) => { (acc[d.preparation] = acc[d.preparation] || []).push(d); return acc; }, {});

for (const [cle, departs] of Object.entries(parPreparation)) {
    test(`fabriquer : ${departs.map((d) => d.titre).join(' ; ')}`, async ({ page }) => {
        test.setTimeout(420000);
        dossierDesCaptures('');
        await PREPARATIONS[cle](page);
        await retirerLesReglagesDuBanc(page);
        await repondreAuRappel(page);
        fs.mkdirSync(DOSSIER_DES_DEPARTS, { recursive: true });
        for (const d of departs) {
            const octets = await genererLeCodex(page, nomDuCodex(d));
            const t = await temoins(octets);
            expect(t, `${d.fichier} : ce que le parcours exige au départ`).toEqual({
                trimestreReel: 1, groupeCoursActif: true, productionPrete: true, rappelRepondu: true, sansLaDemo: 0
            });
            fs.writeFileSync(path.join(DOSSIER_DES_DEPARTS, d.fichier), octets);
        }
    });
}
