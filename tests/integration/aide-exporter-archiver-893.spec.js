import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// =====================================================================
// #893 — L'AIDE DE « EXPORTER ET ARCHIVER » DIT CE QUE L'ÉCRAN AFFICHE
// =====================================================================
//
// Le pendant OBSERVABLE de `tests/unit/sentinelle-893-aide-exporter-archiver.test.js`.
// Vitest compare des SOURCES ; ici on ouvre la page, on déplie la carte d'aide,
// on lit ses modes, puis on ouvre l'écran lui-même et on lit les titres de ses
// cartes et son bloc d'espace. Les deux listes doivent être la même : un écran
// se nomme par ce qu'il affiche.
//
// Lecture seule : ce fichier ne pose ni ne retire aucune clé de stockage.

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i
];
const estErreurAttendue = (msg) => patternsAttendus.some((re) => re.test(msg));

test('#893 · l\'aide nomme les deux cartes que l\'écran rend, et son bloc d\'espace parle français', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => {
        const m = `pageerror: ${e.message}`;
        if (!estErreurAttendue(m)) erreurs.push(m);
    });

    await page.goto(indexHtml);
    await page.waitForFunction(() => typeof window.naviguerVers === 'function' && typeof window.travauxUI === 'object');

    // 1. L'Aide : déplier la carte et lire ses modes.
    const aide = await page.evaluate(async () => {
        window.naviguerVers('aide', 'utilisation');
        const carte = document.getElementById('accordeon-aide-exporter-archiver');
        if (carte.classList.contains('ferme')) carte.querySelector('.accordeon-header').click();
        await new Promise((r) => setTimeout(r, 450)); // transition d'ouverture : 0,3 s
        const contenu = carte.querySelector('.accordeon-contenu');
        return {
            sousSectionActive: carte.closest('.sous-section').classList.contains('active'),
            ferme: carte.classList.contains('ferme'),
            hauteur: Math.round(contenu.getBoundingClientRect().height),
            modes: [...contenu.querySelectorAll('ol > li > strong')].map((s) => s.textContent.trim()),
            texte: contenu.textContent
        };
    });
    expect(aide.sousSectionActive, 'la sous-section « Utilisation hebdomadaire » est affichée').toBe(true);
    expect(aide.ferme, 'la carte est dépliée').toBe(false);
    expect(aide.hauteur, 'le contenu déplié a une hauteur').toBeGreaterThan(100);
    // #895 : « Trimestre complet » est fondu dans « Exporter des travaux ».
    expect(aide.modes).toEqual(['Exporter des travaux', 'Export Léa']);
    expect(aide.texte).toContain('« Reprises seulement »');
    expect(aide.texte).toContain("« Compresser l'archive »");
    expect(aide.texte).not.toMatch(/Inclure annotés|Inclure évaluations|All[èe]gement|fac-simil/i);

    // 2. L'écran lui-même : ses cartes, ses cases, son bloc d'espace.
    await page.evaluate(() => window.naviguerVers('evaluations', 'exporter'));
    await page.waitForFunction(() => {
        const q = document.getElementById('travaux-quota-info');
        return q && !/Chargement/.test(q.textContent) && q.textContent.trim().length > 0;
    });
    const ecran = await page.evaluate(() => {
        const zone = document.querySelector('.travaux-archivage-options');
        const quota = document.getElementById('travaux-quota-info');
        return {
            titres: [...zone.querySelectorAll('.travaux-archivage-carte > h4')].map((h) => h.textContent.trim()),
            cases: [...zone.querySelectorAll('input[type="checkbox"]')].map((c) => c.closest('label').textContent.trim()),
            quotaApresCartes: !!(zone.compareDocumentPosition(quota) & Node.DOCUMENT_POSITION_FOLLOWING),
            quota: quota.textContent.replace(/\s+/g, ' ').trim()
        };
    });
    expect(ecran.titres, 'l\'aide et l\'écran disent la même chose').toEqual(aide.modes);
    expect(ecran.cases).toEqual(["Compresser l'archive", 'Reprises seulement']);
    expect(ecran.quotaApresCartes, 'le bloc d\'espace est au bas de l\'écran, comme le dit l\'aide').toBe(true);
    expect(ecran.quota).toMatch(/utilisés sur .+ \(\d+\s%\)/);
    expect(ecran.quota).toMatch(/\d+ fichiers? de travaux/);
    expect(ecran.quota).toMatch(/Rangement : (dans le navigateur|fichiers sur ton disque)/);
    expect(ecran.quota).not.toMatch(/utilises|fichier\(s\)|Mode:|IndexedDB|FSAPI/);

    expect(erreurs, 'aucune erreur de page').toEqual([]);
});
