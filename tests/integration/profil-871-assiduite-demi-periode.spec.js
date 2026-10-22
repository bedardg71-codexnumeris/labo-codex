import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #871, volet assiduité (17 sept. 2026) — LE POURCENTAGE SUIT LA FRACTION, DANS LE VRAI PROFIL.
//
// La sentinelle Vitest (sentinelle-871-…) exécute la chaîne calcul → lecteur → rapport et verrouille
// chaque site par le texte du code. Ce banc joue ce que la machine virtuelle ne monte pas : les deux
// sites HTML de la carte « Assiduité » du profil (la ligne des statistiques et la « Méthodologie de
// calcul »), la pastille d'une présence partielle, et le rapport, dans le vrai index.html, sur le pack
// démo, après qu'UNE présence d'un élève est devenue une demi-période de moins — par la même clé que
// la saisie, puis par le recalcul réel (`calculerEtSauvegarderIndicesAssiduite`).
//
// Avant le correctif : « 55,5 » s'écrivait « 56 » (Math.round), à côté d'un pourcentage calculé sur 55,5.
//
// ⚠ Stockage vidé UNE fois, avant le reload (pas en addInitScript : il se rejouerait au reload).

test('profil · une demi-période saisie se lit telle quelle aux quatre endroits, et le pourcentage en découle', async ({ page }) => {
    test.setTimeout(120000);
    page.on('dialog', (d) => d.dismiss());
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
        const pause = (ms) => new Promise((res) => setTimeout(res, ms));
        await window.activerModeDemo();
        await pause(1500);

        const lire = async (da) => {
            afficherProfilComplet(da); await pause(500);
            changerSectionProfil('mobilisation'); await pause(500);
            const racine = document.getElementById('contenuProfilEtudiant') || document.body;
            const texte = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : null);
            const stats = Array.from(racine.querySelectorAll('li')).map(texte).find(t => /Périodes présentes/.test(t)) || null;
            const methodo = texte(document.getElementById('details-calculs-mobilisation-' + da));
            const pastilles = Array.from(racine.querySelectorAll('.badge-absence-heures')).map(texte);
            const rapport = String(genererRapportAPI(da, { assiduite: true })).split('\n').find(l => l.startsWith('Assiduité'));
            return { A: calculerTousLesIndices(da).A, stats, methodoA: methodo && (methodo.match(/Indice A = .*?périodes offertes/) || [null])[0], pastilles, rapport };
        };

        const da = 'DEMO016';                                  // 56 / 56 sur le pack démo : aucune absence
        const avant = await lire(da);

        // Une présence entière devient une présence d'une demi-période de moins, par la clé de la saisie.
        const k = cle('presences');
        const presences = db.getSync(k, []);
        // Le pack démo écrit ses présences en heures (format d'avant Beta 95.1) : la séance de deux périodes
        // devient ici une présence d'UNE PÉRIODE ET DEMIE, dans le champ que la saisie écrit aujourd'hui.
        const cible = presences.find(p => p.da === da && !p.facultatif);
        cible.periodesPresentes = 1.5;
        delete cible.heures;
        db.setSync(k, presences);
        calculerEtSauvegarderIndicesAssiduite();
        const apres = await lire(da);
        return { avant, apres };
    });

    // AVANT : des entiers, écrits comme des entiers (jamais « 56,0 »).
    expect(r.avant.stats).toBe('• Périodes présentes : 56 / 56');
    expect(r.avant.rapport).toBe('Assiduité : 100\u00A0% (56 / 56 périodes)');

    // APRÈS : 55,5 / 56 partout, avec une virgule, et le pourcentage est celui de CETTE fraction.
    const attendu = Math.round(55.5 / 56 * 100);              // 99
    expect(r.apres.A).toBe(attendu);
    expect(r.apres.stats).toBe('• Périodes présentes : 55,5 / 56');
    expect(r.apres.methodoA).toBe(`Indice A = ${attendu} % — 55,5 périodes présentes / 56 périodes offertes`);
    expect(r.apres.rapport).toBe(`Assiduité : ${attendu}\u00A0% (55,5 / 56 périodes)`);
    // La présence partielle a sa pastille, à la virgule elle aussi (la pastille dit les périodes PRÉSENTES).
    expect(r.apres.pastilles).toEqual(['1,5 pér.']);
    expect(r.apres.pastilles.join(' ')).not.toMatch(/\d\.\d/);
});
