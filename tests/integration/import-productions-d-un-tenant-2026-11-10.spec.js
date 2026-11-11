import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ouvrirEspaceVide, mettreLaClasseEnPlace, capture } from './harness/classe-de-banc.js';

// =======================================================================
// LES PAGES D'UNE PRODUCTION SE SUIVENT, À L'IMPORT (10 nov. 2026)
// =======================================================================
//
// Vécu par Grégoire (1.241.0, iPad puis Mac), étape « Optimisation » de Préparer : les
// remises Léa d'un groupe, déposées d'un coup, gardaient l'ordre du dépôt ; les cadres de
// « Originaux » s'emboîtaient en escalier ; « Réunir » sur deux pages d'une production ne
// faisait rien. Ce banc juge la page réelle sous WebKit, à 820 px (iPad en portrait) et à
// 1180 px, en mode sombre : aucun cadre dans un autre, chaque cadre ne contient que les
// lignes de sa clé ; les homonymes « Nom, Prénom » dans l'Aperçu ; « Réunir » qui détache,
// et qui dit quand il n'y a rien à faire. La logique est tenue par
// tests/unit/import-productions-d-un-tenant.test.js.
//
// Données manifestement fictives (règle 6) : la classe du deuxième parcours (classe-de-banc.js),
// plus deux personnes au même nom de famille, « Nomfictif Alice » et « Nomfictif Bruno ».
// Captures : CAPTURES_PARCOURS=1 les écrit dans « plans de travail/captures-2026-11-10-import-productions-d-un-tenant/ ».

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOSSIER = process.env.CAPTURES_PARCOURS
    ? path.resolve(__dirname, '..', '..', 'plans de travail', 'captures-2026-11-10-import-productions-d-un-tenant')
    : '';

const HOMONYMES = [
    { da: '2412345', nom: 'Nomfictif', prenom: 'Alice' },
    { da: '2498765', nom: 'Nomfictif', prenom: 'Bruno' }
];
// Le dépôt entrelacé : les pages d'Alice, de Bruno et de Cléo Cormoran (classe du banc), dans le désordre.
const DEPOT = [
    ['Nomfictif_Alice', '2412345', 2, '09h00m10s'],
    ['Nomfictif_Bruno', '2498765', 1, '09h05m00s'],
    ['Nomfictif_Alice', '2412345', 1, '09h00m00s'],
    ['Cormoran_Cleo', '2390003', 1, '09h07m00s'],
    ['Nomfictif_Bruno', '2498765', 2, '09h05m10s'],
    ['Nomfictif_Alice', '2412345', 3, '09h00m20s']
];

async function deposer(page) {
    const dt = await page.evaluateHandle(async (depot) => {
        const d = new DataTransfer();
        for (const [nom, da, p, heure] of depot) {
            const c = document.createElement('canvas');
            c.width = 300; c.height = 390;
            const ctx = c.getContext('2d');
            ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, 300, 390);
            ctx.fillStyle = '#202020'; ctx.font = 'bold 34px sans-serif';
            ctx.fillText(nom.split('_')[1] + ' p' + p, 30, 80);
            const blob = await new Promise((r) => c.toBlob(r, 'image/png'));
            d.items.add(new File([blob], `${nom}_${da}_Journal-3-p${p}_Remis_le_2026-11-03_${heure}.png`, { type: 'image/png', lastModified: Date.UTC(2026, 10, 3, 14) }));
        }
        return d;
    }, DEPOT);
    await page.dispatchEvent('#travaux-drop-zone', 'drop', { dataTransfer: dt });
    await expect(page.locator('.pipeline-col-originaux .pipeline-fichier-ligne')).toHaveCount(DEPOT.length);
}

/** Les cadres de « Originaux » et les clés de la file, lus dans la page. */
function lireLesCadres(page) {
    return page.evaluate(() => {
        const file = travauxImport.obtenirFileDAttente();
        return {
            emboites: document.querySelectorAll('.pipeline-col-originaux .pipeline-groupe-encadre .pipeline-groupe-encadre').length,
            cadres: [...document.querySelectorAll('.pipeline-col-originaux .pipeline-groupe-encadre')].map((c) => ({
                cle: c.getAttribute('data-groupe-id'),
                lignes: [...c.querySelectorAll('.pipeline-fichier-ligne')].map((l) => Number(l.getAttribute('data-param')))
            })),
            cles: file.map((f) => f.groupeDocumentId),
            ordre: file.map((f) => f.nomFichier.split('_')[1] + ' ' + f.nomFichier.match(/-(p\d)_/)[1])
        };
    });
}

/** Une capture de l'étape Optimisation : l'avis de transition retiré (il n'est pas ce qu'on juge), la colonne en haut. */
async function captureOptimisation(page, nom) {
    if (!DOSSIER) return;
    await page.evaluate(() => {
        document.querySelectorAll('.transition-bandeau').forEach((b) => b.remove());
        document.querySelector('.pipeline-col-originaux').scrollIntoView({ block: 'start' });
    });
    if (nom.startsWith('02-')) {
        fs.mkdirSync(DOSSIER, { recursive: true });
        await page.waitForFunction(() => document.getAnimations()
            .filter((a) => a.effect && a.effect.target && a.effect.target.closest && a.effect.target.closest('.notifications-pile'))
            .every((a) => a.playState !== 'running'));
        await page.screenshot({ path: path.join(DOSSIER, nom + '.png') });   // la notification fait partie de ce qu'on montre
    } else {
        await capture(page, DOSSIER, nom);
    }
}

function aucunCadreFaux(etat) {
    expect(etat.cadres.length, 'garde de non-vide (règle 10)').toBeGreaterThan(0);
    expect(etat.emboites, 'aucun cadre dans un autre').toBe(0);
    for (const c of etat.cadres) {
        expect(c.lignes.length).toBeGreaterThan(1);
        for (const i of c.lignes) expect(etat.cles[i], `ligne ${i + 1} dans le cadre ${c.cle}`).toBe(c.cle);
    }
}

for (const largeur of [820, 1180]) {
    test(`Optimisation à ${largeur} px, mode sombre : d'un seul tenant, sans cadre emboîté ; homonymes nommés ; « Réunir » détache`, async ({ page }) => {
        test.setTimeout(240000);
        const erreurs = [];
        page.on('pageerror', (e) => erreurs.push(e.message));
        await page.emulateMedia({ colorScheme: 'dark' });
        await ouvrirEspaceVide(page, largeur);
        await mettreLaClasseEnPlace(page);
        // Les deux homonymes rejoignent la classe du banc (fiches calquées sur la première), et une production.
        await page.evaluate((homonymes) => {
            const k = cle('groupeEtudiants');
            const classe = db.getSync(k, []);
            db.setSync(k, classe.concat(homonymes.map((h) => Object.assign({}, classe[0], h))));
            const gc = db.getSync('groupeCoursActif', null);
            db.setSync(cle('productions'), [{ id: 'PROD_journal3', titre: 'Journal 3', type: 'travail', ponderation: 100, coursId: gc && gc.coursId, dansBibliotheque: true }]); // security-ok: fixture de test
            if (window.backupReminder) window.backupReminder.reporterApresMiseAJourDuCodex();
            afficherSection('evaluations');
            afficherSousSection('evaluations-importer');
        }, HOMONYMES);
        await page.waitForFunction(() => !!document.getElementById('travaux-drop-zone'));
        expect(await page.evaluate(() => document.body.classList.contains('mode-clair'))).toBe(false);

        // A. Le dépôt entrelacé devient d'un seul tenant, dans l'ordre de remise.
        await deposer(page);
        let etat = await lireLesCadres(page);
        expect(etat.ordre).toEqual(['Alice p1', 'Alice p2', 'Alice p3', 'Bruno p1', 'Bruno p2', 'Cleo p1']);
        aucunCadreFaux(etat);
        expect(etat.cadres.map((c) => c.lignes)).toEqual([[0, 1, 2], [3, 4]]);
        // Les flèches redeviennent utiles : Alice p2 peut monter et descendre dans sa production.
        await expect(page.locator('[data-action="travauxUI.monterFichierPipeline"][data-param="1"]')).toBeEnabled();
        await expect(page.locator('[data-action="travauxUI.descendreFichierPipeline"][data-param="1"]')).toBeEnabled();

        // C. Les homonymes, « Nom, Prénom » dans l'Aperçu ; Cléo, le nom seul.
        const apercu = page.locator('.pipeline-col-confirmes .pipeline-meta-nom');
        await expect(apercu).toHaveText(['Nomfictif, Alice', 'Nomfictif, Alice', 'Nomfictif, Alice', 'Nomfictif, Bruno', 'Nomfictif, Bruno', 'Cormoran']);
        await captureOptimisation(page, `01-depot-d-un-seul-tenant-${largeur}`);

        // B. Cocher les deux pages de Bruno, qui forment déjà sa production : rien ne bouge, un message le dit.
        await page.locator('.pipeline-case-reunir').nth(3).click();
        await page.locator('.pipeline-case-reunir').nth(4).click();
        await expect(page.locator('.pipeline-btn-reunir')).toHaveText('Réunir en une production');
        await expect(page.locator('.pipeline-case-reunir').first()).toHaveAttribute('aria-label', 'Cocher pour réunir en une production');
        await page.locator('.pipeline-btn-reunir').click();
        await expect(page.getByText('Ces pages forment déjà une production.')).toBeVisible();
        expect((await lireLesCadres(page)).cles).toEqual(etat.cles);
        await captureOptimisation(page, `02-deja-une-production-${largeur}`);

        // B. Décocher Bruno ; cocher Alice p2 et p3 : elles se détachent, Alice p1 reste seule dans la sienne.
        await page.locator('.pipeline-case-reunir').nth(3).click();
        await page.locator('.pipeline-case-reunir').nth(4).click();
        await page.locator('.pipeline-case-reunir').nth(1).click();
        await page.locator('.pipeline-case-reunir').nth(2).click();
        await page.locator('.pipeline-btn-reunir').click();
        await expect(page.locator('.pipeline-col-originaux .pipeline-groupe-encadre[data-groupe-id^="copie_"]')).toHaveCount(1);
        etat = await lireLesCadres(page);
        expect(etat.ordre).toEqual(['Alice p1', 'Alice p2', 'Alice p3', 'Bruno p1', 'Bruno p2', 'Cleo p1']);
        expect(etat.cles[0]).toBe('2412345_Journal-3');
        expect(etat.cles[1]).toMatch(/^copie_/);
        aucunCadreFaux(etat);
        expect(etat.cadres.map((c) => c.lignes)).toEqual([[1, 2], [3, 4]]);
        await captureOptimisation(page, `03-reunir-detache-${largeur}`);

        expect(erreurs, erreurs.join(' | ')).toEqual([]);
    });
}
