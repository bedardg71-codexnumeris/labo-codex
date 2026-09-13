import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #749 lot 3 (11 sept. 2026, S-6) — LA DÉMONSTRATION OUVRE UNE SAISIE DES PRÉSENCES
// QUI SE SAISIT : aucun bandeau « Configuration incomplète », une date posée, la
// grille des 10 élèves (20 jusqu'à la réduction du pack, #852).
//
// CE QU'UN COLLÈGUE VOYAIT LE 6 SEPTEMBRE (audit, § 3, S-6, capture
// demo_1024x768_saisie.png) : il activait la démonstration depuis l'Accueil, ouvrait
// Suivi › Saisie des présences, et lisait « Configuration incomplète — Aucune séance
// n'est rattachée à l'horaire de ce cours » devant un horaire à deux séances et
// trente séances complètes ; la date était vide, « (0 étudiant·e) », et « ← Précédent »
// la laissait vide. Cause : le bandeau n'était évalué qu'au démarrage, sur le seul
// horaire, et rien ne réinitialisait la saisie à l'activation de la démo (le mapping
// `suivi-saisie` de modes.js vise une fonction qui n'existe pas — #736, cité).
// Vingt collègues ouvrent la démo le 14.
//
// Ce banc joue le parcours réel dans le vrai index.html : activerModeDemo() puis
// naviguerVers('suivi', 'saisie'), et lit ce que l'écran montre. La sentinelle
// Vitest du lot (sentinelle-749-lot3-…) prouve chaque brique ; celui-ci prouve
// qu'elles s'enchaînent dans le navigateur, depuis un stockage vide.
//
// ⚠ IL PART D'UN STOCKAGE VIDÉ — les specs partagent le localStorage de l'origine
// file:// (workers: 1).

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i,
    /Failed to load resource/i
];

function brancherEcouteurs(page) {
    const erreurs = [];
    const estAttendue = (m) => patternsAttendus.some((re) => re.test(m));
    page.on('pageerror', (e) => { const m = `pageerror: ${e.message}`; if (!estAttendue(m)) erreurs.push(m); });
    page.on('console', (msg) => { if (msg.type() === 'error') { const m = `console.error: ${msg.text()}`; if (!estAttendue(m)) erreurs.push(m); } });
    page.on('dialog', (d) => d.dismiss());
    return erreurs;
}

test('démo · activer, ouvrir Saisie des présences : aucun bandeau, une date posée, dix élèves', async ({ page }) => {
    test.setTimeout(90000);
    const erreurs = brancherEcouteurs(page);

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

    const r = await page.evaluate(async () => {
        const out = {};
        const pause = (ms) => new Promise((res) => setTimeout(res, ms));
        const lire = () => {
            const bandeau = document.getElementById('alerteFormatHoraire');
            const champDate = document.getElementById('date-cours');
            return {
                bandeauVisible: bandeau ? !bandeau.classList.contains('u-hide') : null,
                date: champDate ? champDate.value : null,
                lignes: document.querySelectorAll('#tbody-saisie-presences input[id^="periodes_"]').length,
                messageTableau: (document.getElementById('tbody-saisie-presences')?.textContent || '').trim().slice(0, 80)
            };
        };

        // Avant la démo : un poste vide (aucun trimestre) — ce que le collègue a au départ.
        out.avant = lire();

        await window.activerModeDemo();
        await pause(1200);
        out.demoActif = db.getSync('demo-actif', null);
        out.trimestre = db.getSync('trimestreActif', null);

        // Le parcours du 14 : Accueil → Suivi › Saisie des présences.
        naviguerVers('suivi', 'saisie');
        await pause(800);
        out.apres = lire();
        out.aujourdhui = window.dateLocaleYMD();
        out.datePreferenceDemo = db.getSync('demo_presences_date', null);
        out.verrouNu = db.getSync('datesVerrouillees', null);

        // « ← Précédent » depuis la date posée va à la séance d'avant, jamais au vide.
        window.allerCoursPrecedent();
        await pause(400);
        out.apresPrecedent = lire();
        return out;
    });

    expect(r.demoActif, 'la démonstration ne s\'est pas activée').toBe('true');
    expect(r.trimestre, 'le trimestre actif doit être « demo »').toBe('demo');

    // LE CONSTAT DU 6, RETOURNÉ : pas de bandeau, une date, une grille qui se saisit.
    expect(r.apres.bandeauVisible, 'LE CAS DU 6 SEPTEMBRE : la démo affichait « Configuration incomplète »').toBe(false);
    expect(r.apres.date, 'la date doit être posée (avant : vide, « Sélectionne une date »)').toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(r.apres.date <= r.aujourdhui, 'la date posée est ≤ aujourd\'hui').toBe(true);
    expect(r.apres.lignes, 'la grille doit montrer les 10 élèves de la démo (avant : 0 étudiant·e)').toBe(10);
    // La préférence est celle du trimestre démo, pas une clé nue.
    expect(r.datePreferenceDemo).toBe(r.apres.date);
    expect(r.verrouNu, 'aucune clé nue datesVerrouillees n\'est écrite').toBe(null);

    // « ← Précédent » : une autre date, posée, toujours une grille.
    expect(r.apresPrecedent.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(r.apresPrecedent.date < r.apres.date).toBe(true);
    expect(r.apresPrecedent.lignes).toBe(10);

    expect(erreurs, 'erreurs de page inattendues').toEqual([]);
});
