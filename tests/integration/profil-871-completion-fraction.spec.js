import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #871, volet complétion (17 sept. 2026) — LA FRACTION COMPTE CE QUE COMPTE L'INDICE C, DANS LE VRAI PROFIL.
//
// Mesuré sur le pack démo en 1.142.21 : quatre élèves sur dix lisaient un pourcentage et une fraction qui se
// contredisaient (DEMO004 « 90% » et « 8 / 9 » ; DEMO006 et DEMO020 « 90% » et « 9 / 9 » ; DEMO015 « 80% » et
// « 7 / 9 »), au rapport, à la « Méthodologie de calcul » et à la ligne de la carte Complétion. L'indice compte
// l'évaluation terminale (dix productions), les fractions ne comptaient que les neuf artefacts du portfolio.
// Tranché par Grégoire le 17 sept. : la terminale est une remise que la complétion suit ; l'indice ne bouge pas.
//
// Ce banc lit les TROIS sites pour les DIX élèves : la fraction a pour quotient l'indice affiché, l'indice est
// celui d'avant le lot (valeurs de ae7ad6f7, figées), et le dénominateur est dix.
//
// ⚠ Stockage vidé UNE fois, avant le reload (pas en addInitScript : il se rejouerait au reload).

// ⚠ DEMO004 : 90 → 80 au lot 30 (17 sept. 2026). Sa copie « plagiat » (Artefact 9) n'est plus une remise — tranché par Grégoire,
// chiffres en main. C'est le SEUL indice que le lot déplace ; les neuf autres restent ceux de ae7ad6f7.
const C_AVANT = { DEMO004: 80, DEMO006: 90, DEMO007: 100, DEMO010: 100, DEMO011: 100, DEMO015: 80, DEMO016: 100, DEMO017: 100, DEMO019: 100, DEMO020: 90 };

test('profil · la fraction de complétion a pour quotient l\'indice C, aux trois sites, pour les dix élèves de la démo', async ({ page }) => {
    test.setTimeout(180000);
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

    const eleves = await page.evaluate(async () => {
        const pause = (ms) => new Promise((res) => setTimeout(res, ms));
        await window.activerModeDemo();
        await pause(1500);
        const texte = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');
        const out = [];
        for (const e of obtenirDonneesSelonMode('groupeEtudiants')) {
            afficherProfilComplet(e.da); await pause(400);
            changerSectionProfil('mobilisation'); await pause(400);
            const racine = document.getElementById('contenuProfilEtudiant') || document.body;
            const rapport = String(genererRapportAPI(e.da, { completion: true })).split('\n').find(l => l.startsWith('Complétion')) || '';
            const methodo = texte(document.getElementById('details-calculs-mobilisation-' + e.da));
            const carte = Array.from(racine.querySelectorAll('li')).map(texte).find(t => /remis\S* : \d+\/\d+/.test(t)) || '';
            out.push({ da: e.da, C: calculerTousLesIndices(e.da).C,
                rapport: (rapport.match(/^Complétion : (\d+)\u00A0% \((\d+) remises \/ (\d+) productions\)$/) || []).slice(1).map(Number),
                methodo: (methodo.match(/Indice C = (\d+) % — (\d+) \S+ \S+ \/ (\d+) /) || []).slice(1).map(Number),
                carte: (carte.match(/: (\d+)\/(\d+)$/) || []).slice(1).map(Number),
                // Lot 30 (17 sept. 2026) — la carte dit ce que dit sa fraction : la ligne, l'intitulé, la liste, le message.
                ligne: carte,
                intitule: Array.from(racine.querySelectorAll('h4.profil-section-titre')).map(texte).find(t => /non remises? ou non recevables?/.test(t)) || '',
                // chaque pastille des non-remises : le TYPE de la production derrière elle (la pastille affiche sa description)
                nonRemises: Array.from(racine.querySelectorAll('.badge-completion-non-remis, .badge-completion-non-recevable')).map(b => {
                    const p = (obtenirDonneesSelonMode('productions') || []).find(x => x.id === b.getAttribute('data-param2'));
                    return (p ? p.type : '?') + ' · ' + texte(b.querySelector('.badge-completion-titre'));
                }),
                nonRecevables: racine.querySelectorAll('.badge-completion-non-recevable').length,
                message: Array.from(racine.querySelectorAll('.profil-message-tous-remis')).map(texte).filter(t => /remis/.test(t)) });
        }
        return out;
    });

    expect(eleves.map(e => e.da).sort()).toEqual(Object.keys(C_AVANT).sort());
    for (const e of eleves) {
        const attenduC = C_AVANT[e.da];
        expect([e.da, e.C]).toEqual([e.da, attenduC]);                                  // l'indice n'a bougé pour personne
        const remis = attenduC / 10;                                                      // dix productions comptées, terminale comprise
        expect([e.da, 'rapport', ...e.rapport]).toEqual([e.da, 'rapport', attenduC, remis, 10]);
        expect([e.da, 'méthodologie', ...e.methodo]).toEqual([e.da, 'méthodologie', attenduC, remis, 10]);
        expect([e.da, 'carte', ...e.carte]).toEqual([e.da, 'carte', remis, 10]);
        expect(Math.round(e.carte[0] / e.carte[1] * 100)).toBe(e.C);
    }
    // Lot 30 — DEMO006 (aucune copie de la terminale) et DEMO020 (sa terminale n'est qu'un brouillon) lisaient « 9/10 » à
    // côté de « 0 artefact non remis ou non recevable … Tous les artefacts remis ! ». La terminale est maintenant DANS la liste.
    const parDa = Object.fromEntries(eleves.map(e => [e.da, e]));
    for (const da of ['DEMO006', 'DEMO020']) {
        expect([da, parDa[da].ligne]).toEqual([da, '• Productions remises : 9/10']);
        expect([da, parDa[da].intitule]).toEqual([da, '1 production non remise ou non recevable']);
        expect([da, parDa[da].nonRemises]).toEqual([da, ['terminale · Rédaction finale']]);
        expect([da, parDa[da].message]).toEqual([da, []]);
    }
    // DEMO004 : son Artefact 7 n'est qu'un BROUILLON et son Artefact 9 est marqué « plagiat » — ni l'un ni l'autre n'est une
    // remise. Les deux sont dans la liste, le second avec sa pastille d'alerte ; aucun des deux parmi les pastilles des remis.
    expect(parDa.DEMO004.ligne).toBe('• Productions remises : 8/10');
    expect(parDa.DEMO004.nonRemises.length).toBe(2);
    expect(parDa.DEMO004.nonRecevables).toBe(1);
    // Pour TOUS : l'intitulé compte ce que la fraction laisse (total − remis), la liste a cette longueur, et le message
    // ne paraît que si rien ne manque.
    for (const e of eleves) {
        const manquantes = e.carte[1] - e.carte[0];
        expect([e.da, e.nonRemises.length]).toEqual([e.da, manquantes]);
        expect([e.da, e.intitule]).toEqual([e.da, manquantes + (manquantes > 1 ? ' productions non remises ou non recevables' : ' production non remise ou non recevable')]);
        expect([e.da, e.message]).toEqual([e.da, manquantes === 0 ? ['Toutes les productions sont remises !'] : []]);
    }
    // Les quatre élèves qui divergeaient sont bien dans le lot, et ne sont pas à 100 % (le banc mesure quelque chose).
    expect(eleves.filter(e => e.C < 100).map(e => e.da).sort()).toEqual(['DEMO004', 'DEMO006', 'DEMO015', 'DEMO020']);
});
