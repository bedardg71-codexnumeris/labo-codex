import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #830 (23 sept. 2026) — LA BARRE « ASSIDUITÉ (A) » DU SUIVI DU GROUPE DIT POURQUOI ELLE EST VIDE.
//
// Symptôme vécu par Grégoire le 11 sept. : ses groupes H2026 n'affichaient aucun A, sans un mot ; il a fallu
// quatre sondes pour trouver ce qu'une phrase aurait dit. Phrase validée par Grégoire le 23 sept., mot pour mot.
//
// Montage sur le pack démo (horaire HOR_DEMO : lundi et mercredi, deux périodes chacune, `periodesParSeance: 2`) :
//   · témoin  — horaire intact : la barre porte une moyenne, pas de phrase ;
//   · cas (b) — le mercredi perd ses périodes : la barre se calcule sur les lundis, pas de phrase (hors lot, relevé) ;
//   · cas (c) — aucune séance ne porte de périodes : la phrase, mot pour mot ;
//   · cas (a) — même horaire, AUCUNE présence : pas la phrase (le « 1 séance en attente » d'avant reste).
// Le cache `seancesCompletes` est retiré à chaque montage : il se régénère depuis l'horaire, comme après une édition.
// ⚠ Stockage vidé UNE fois, avant le reload (pas en addInitScript : il se rejouerait au reload).

const PHRASE = 'Assiduité non calculée : aucune séance de l\'horaire ne porte son nombre de périodes. Tu peux le saisir dans Cadre › Trimestre › Horaire.';

test('#830 · la barre A dit pourquoi elle est vide quand aucune séance de l\'horaire ne porte de périodes', async ({ page }) => {
    test.setTimeout(180000);
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(String(e)));
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

    const m = await page.evaluate(async () => {
        const pause = (ms) => new Promise((res) => setTimeout(res, ms));
        const texte = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');
        await window.activerModeDemo();
        await pause(1500);

        const horaireOrigine = JSON.parse(JSON.stringify(db.getSync(cle('horaires'), [])));
        const presencesOrigine = JSON.parse(JSON.stringify(obtenirDonneesSelonMode('presences') || []));

        // La barre A : de son libellé à celui de la barre C.
        const barreA = () => {
            const carte = texte(document.getElementById('carte-indicateurs-acpe'));
            const debut = carte.indexOf('Assiduité (A)');
            const fin = carte.indexOf('Complétion (C)', debut);
            return debut < 0 ? null : carte.slice(debut, fin < 0 ? undefined : fin);
        };
        const monter = async ({ horaire, presences }) => {
            db.setSync(cle('horaires'), horaire);
            db.removeSync(cleSeancesCompletes());
            sauvegarderDonneesSelonMode('presences', presences);
            calculerEtSauvegarderIndicesAssiduite(); await pause(300);
            chargerTableauBordApercu(); await pause(900);
            return barreA();
        };
        // Retire le nombre de périodes des séances désignées (et le format déclaré, sinon il se projette).
        const sansPeriodes = (jours) => horaireOrigine.map(h => {
            const c = JSON.parse(JSON.stringify(h));
            delete c.periodesParSeance;
            c.seances = c.seances.map(s => (jours.includes(s.jour) ? (delete s.nombrePeriodes, delete s.duree, s) : s));
            return c;
        });

        const temoin = await monter({ horaire: horaireOrigine, presences: presencesOrigine });
        const casB = await monter({ horaire: sansPeriodes(['Mercredi']), presences: presencesOrigine });
        const casC = await monter({ horaire: sansPeriodes(['Lundi', 'Mercredi']), presences: presencesOrigine });
        const casA = await monter({ horaire: sansPeriodes(['Lundi', 'Mercredi']), presences: [] });

        return { nbPresences: presencesOrigine.length, nbSeancesHoraire: horaireOrigine[0].seances.length, temoin, casB, casC, casA };
    });

    expect(erreurs).toEqual([]);
    expect(m.nbPresences).toBeGreaterThan(0);
    expect(m.nbSeancesHoraire).toBe(2);

    // Témoin : une moyenne, pas de phrase — sinon le montage ne jugerait rien.
    expect(m.temoin).toMatch(/μ=\d+\s*%/);
    expect(m.temoin).not.toContain('Assiduité non calculée');

    // (b) hors lot, relevé : la barre se calcule sur les lundis ; pas de phrase.
    expect(m.casB).toMatch(/μ=\d+\s*%/);
    expect(m.casB).not.toContain('Assiduité non calculée');

    // (c) la phrase, mot pour mot, et plus de moyenne.
    expect(m.casC).toContain(PHRASE);
    expect(m.casC).not.toMatch(/μ=\d+\s*%/);

    // (a) aucune présence : pas la phrase ; le texte d'attente d'avant reste.
    expect(m.casA).not.toContain('Assiduité non calculée');
    expect(m.casA).toContain('1 séance en attente');
});
