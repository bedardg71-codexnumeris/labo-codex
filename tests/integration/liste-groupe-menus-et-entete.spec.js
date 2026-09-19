import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// CADRE › GROUPE D'ÉTUDIANT·ES — deux défauts vus par Grégoire sur iPad (19 sept. 2026, 12 h 01), 1.147.1.
//
//   · Les deux menus de ligne affichaient « — », qui ne dit rien. Mots de Grégoire : « Choisir… » (Action),
//     « Aucune » (Remarque). SEUL LE LIBELLÉ change : les deux valeurs restent vides (Action : option neutre,
//     sinon « Modifier » choisi d'avance ne déclencherait plus `change` ; Remarque : vide = aucune remarque).
//   · L'en-tête était blanc sur bleu pâle en mode clair : le fond foncé vivait sur le THEAD, masqué par le fond
//     pâle que `.conteneur-liste-etudiants th` peint (en-tête collant). Mesuré 1,13 avant ; exigé ≥ 4,5 ici,
//     dans les deux modes, sur le STYLE CALCULÉ (pas sur la lecture de la feuille).
// ⚠ Stockage vidé UNE fois, avant le reload (pas en addInitScript : il se rejouerait au reload).

test('liste du groupe · options vides « Choisir… » / « Aucune », en-tête lisible dans les deux modes', async ({ page }) => {
    test.setTimeout(120000);
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(String(e)));
    await page.setViewportSize({ width: 1024, height: 768 });
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
        await window.activerModeDemo();
        await pause(1500);
        naviguerVers('calendrier', 'trimestre');
        await pause(1200);

        // Contraste WCAG 2.1 entre deux couleurs calculées « rgb(r, g, b) ».
        const luminance = (rgb) => {
            const [r, g, b] = rgb.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
            return 0.2126 * r + 0.7152 * g + 0.0722 * b;
        };
        const contraste = (a, b) => { const la = luminance(a), lb = luminance(b); return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05); };
        const entete = () => Array.from(document.querySelectorAll('#v2-listeEtudiants thead th')).map(th => {
            const cs = getComputedStyle(th);
            return { mot: th.textContent.trim(), texte: cs.color, fond: cs.backgroundColor, contraste: Math.round(contraste(cs.color, cs.backgroundColor) * 100) / 100 };
        });

        const ligne = document.querySelector('#v2-listeEtudiants tbody tr');
        const menu = (handler) => { const s = ligne.querySelector('select[data-on-change="' + handler + '"]'); return s ? Array.from(s.options).map(o => ({ valeur: o.value, mot: o.textContent.trim() })) : null; };
        const menus = { action: menu('actionEtudiantV2Handler'), remarque: menu('remarqueEtudiantV2Handler') };
        const cellulesTiret = Array.from(document.querySelectorAll('#v2-listeEtudiants option')).filter(o => o.textContent.trim() === '—').length;

        const clair = { classe: document.body.classList.contains('mode-clair'), entete: entete() };
        definirTheme(false); await pause(400);
        const sombre = { classe: document.body.classList.contains('mode-clair'), entete: entete() };
        definirTheme(true);
        return { menus, cellulesTiret, clair, sombre };
    });

    expect(erreurs).toEqual([]);

    // (1) Les mots de Grégoire, au caractère près ; les deux valeurs restent vides.
    expect(m.menus.action).toEqual([{ valeur: '', mot: 'Choisir…' }, { valeur: 'editer', mot: 'Modifier' }, { valeur: 'supprimer', mot: 'Supprimer' }]);
    expect(m.menus.remarque).toEqual([{ valeur: '', mot: 'Aucune' }, { valeur: 'inactif', mot: 'Inactivité' }, { valeur: 'décrochage', mot: 'Décrochage' }]);
    expect(m.cellulesTiret).toBe(0);

    // (2) L'en-tête : sept colonnes, contraste calculé ≥ 4,5 dans les deux modes (témoin : le mode a bien basculé).
    expect(m.clair.classe).toBe(true);
    expect(m.sombre.classe).toBe(false);
    for (const mode of [m.clair, m.sombre]) {
        expect(mode.entete.map(c => c.mot)).toEqual(['DA', 'Grp', 'Nom', 'Prénom', 'SA', 'Action', 'Remarque']);
        for (const c of mode.entete) expect(c.contraste, JSON.stringify(c)).toBeGreaterThanOrEqual(4.5);
    }
});
