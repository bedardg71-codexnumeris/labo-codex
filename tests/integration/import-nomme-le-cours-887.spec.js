import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #887 (19 sept. 2026) — L'IMPORT D'ÉLÈVES NOMME LE COURS DE RATTACHEMENT, DANS LA VRAIE PAGE.
//
// Retour de Mathieu (#872, mécanisme A) : « un groupe par cours », il importait son 2e groupe dans son 2e cours,
// les élèves rejoignaient le premier — la zone posait `coursId` depuis le cours actif sans le dire.
// Forme tranchée par Grégoire (17 sept., 13 h 38) : la zone NOMME le cours et laisse en changer sur place.
// Même zone : #923 (l'aperçu n'échappait pas le collage) et la règle des DA à l'import (décision du 19 sept. :
// sept chiffres, espaces retirés, sinon la ligne n'entre pas et elle est nommée).
//
// Le banc FAIT LE GESTE : il colle une liste, clique « Prévisualiser », lit la phrase et le menu, choisit l'autre
// cours AU MENU, clique le bouton de confirmation, puis lit l'écran (notification) et le stock.
// ⚠ Stockage vidé UNE fois, avant le reload (pas en addInitScript : il se rejouerait au reload).

test('#887 · la zone d\'import nomme le cours, le menu vise un autre cours sans changer le cours actif ; #923 ; DA à l\'import', async ({ page }) => {
    test.setTimeout(180000);
    const erreurs = [];
    page.on('dialog', (d) => d.dismiss());
    page.on('pageerror', (e) => erreurs.push(String(e)));
    await page.setViewportSize({ width: 768, height: 1024 });
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
        const texte = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : null);
        await window.activerModeDemo();
        await pause(1500);

        const champ = (id) => document.getElementById(id);
        // La clé BRUTE du trimestre : `obtenirDonneesSelonMode` filtre par cours actif, et les élèves de ce banc
        // partent justement vers l'AUTRE cours (mesuré : il rendait zéro fiche ajoutée).
        const stock = () => JSON.parse(JSON.stringify(db.getSync(cle('groupeEtudiants'), []) || []));
        const vusParLeCoursActif = () => (obtenirDonneesSelonMode('groupeEtudiants') || []).map(e => String(e.da));
        const r = {};

        // Deux cours : celui du pack (actif) et un second, posé dans la bibliothèque — le semis n'est pas le geste éprouvé.
        const biblio = db.getSync('cours', []) || [];
        biblio.push({ id: 'COURS-887-B', codeCours: '601-887', nomCours: 'Second cours du banc', isDemo: true });
        db.setSync('cours', biblio);
        r.actifAvant = JSON.parse(JSON.stringify(db.getSync('infoCours', null)));
        r.stockDepart = stock();

        // LE GESTE : coller, prévisualiser.
        champ('v2-donneesCollees').value = [
            '8870001\t00002\tValide\tVictor\t200.B0',
            '887 0002\t00002\tEspaces\tÉlise\t200.B0',                          // espaces retirés → 8870002
            '8870003\t00002\t<img src=x onerror="window.__xss887=1">\tInjecté\t200.B0',
            '\t00002\tSansda\tSacha\t200.B0',
            'ABC-99\t00002\tInvalide\tInès\t200.B0',
            '8870001\t00002\tDoublon\tDenis\t200.B0',
        ].join('\n');
        document.querySelector('[data-action="previsualiserDonneesV2"]').click();
        await pause(500);

        const menu = champ('v2-importCoursCible');
        r.apercu = {
            zoneVisible: !champ('v2-previewZone').classList.contains('u-hide'),
            libelle: texte(document.querySelector('label[for="v2-importCoursCible"]')),
            blocVisible: !champ('v2-importRattachement').classList.contains('u-hide'),
            sansCoursCache: champ('v2-importSansCours').classList.contains('u-hide'),
            valeurMenu: menu.value,
            optionChoisie: texte(menu.selectedOptions[0]),
            options: [...menu.options].map(o => ({ v: o.value, t: texte(o) })),
            nbImgDansApercu: champ('v2-previewTable').querySelectorAll('img').length,
            texteApercu: texte(champ('v2-previewTable')),
            xss: window.__xss887 === 1,
            rangees: [...champ('v2-previewTable').querySelectorAll('tbody tr')].map(tr => ({ ecartee: tr.classList.contains('ligne-import-ecartee'), da: texte(tr.cells[0]), motif: texte(tr.cells[6]) })),
            bouton: texte(champ('v2-btnConfirmerImport')),
            boutonInactif: champ('v2-btnConfirmerImport').disabled,
            note: texte(champ('v2-importLignesEcartees')),
            noteVisible: !champ('v2-importLignesEcartees').classList.contains('u-hide'),
        };

        // LE GESTE : choisir l'autre cours AU MENU, confirmer.
        menu.value = 'COURS-887-B';
        menu.dispatchEvent(new Event('change', { bubbles: true }));
        await pause(200);
        r.actifApresMenu = JSON.parse(JSON.stringify(db.getSync('infoCours', null)));
        document.querySelectorAll('.notification-succes').forEach(n => n.remove());
        champ('v2-btnConfirmerImport').click();
        await pause(1200);

        r.notifs = [...document.querySelectorAll('.notification-succes')].map(n => ({ classes: n.className, texte: texte(n.querySelector('.notification-texte')) }));
        const apres = stock();
        const dasDepart = new Set(r.stockDepart.map(e => String(e.da)));
        r.ajoutees = apres.filter(e => !dasDepart.has(String(e.da)));
        r.nbApres = apres.length;
        r.vusParLeCoursActif = vusParLeCoursActif().filter(da => /^887/.test(da));
        r.nbDaVides = apres.filter(e => !String(e.da == null ? '' : e.da).trim()).length;
        r.actifApres = JSON.parse(JSON.stringify(db.getSync('infoCours', null)));
        r.phraseAjout = texte(champ('v2-ajoutRattachement'));
        r.zoneRefermee = champ('v2-previewZone').classList.contains('u-hide');
        return r;
    });

    // 1 · La zone NOMME le cours : phrase, menu au cours actif, l'autre cours offert.
    expect(m.actifAvant && m.actifAvant.id).toBeTruthy();
    expect(m.apercu.zoneVisible).toBe(true);
    expect(m.apercu.libelle).toBe('Ces étudiant·es seront rattaché·es à :');
    expect(m.apercu.blocVisible).toBe(true);
    expect(m.apercu.sansCoursCache).toBe(true);
    expect(m.apercu.valeurMenu).toBe(m.actifAvant.id);
    expect(m.apercu.optionChoisie).toContain('(cours actif)');
    expect(m.apercu.options.map(o => o.v)).toContain('COURS-887-B');
    expect(m.apercu.options.find(o => o.v === 'COURS-887-B').t).toBe('601-887 Second cours du banc');

    // 2 · #923 : le nom collé s'affiche en TEXTE ; aucune balise n'entre dans l'aperçu.
    expect(m.apercu.nbImgDansApercu).toBe(0);
    expect(m.apercu.texteApercu).toContain('<img src=x onerror=');
    expect(m.apercu.xss).toBe(false);

    // 3 · DA à l'import : l'aperçu marque, le bouton compte, la note dit la règle.
    expect(m.apercu.rangees.map(x => x.motif)).toEqual(['', '', '', 'DA manquant', 'DA invalide', 'Déjà dans la liste']);
    expect(m.apercu.rangees.map(x => x.ecartee)).toEqual([false, false, false, true, true, true]);
    expect(m.apercu.rangees[1].da).toBe('8870002');
    expect(m.apercu.bouton).toBe('Importer 3 étudiant·es');
    expect(m.apercu.boutonInactif).toBe(false);
    expect(m.apercu.noteVisible).toBe(true);
    expect(m.apercu.note).toContain('3 lignes ne seront pas importées');
    expect(m.apercu.note).toContain('sept chiffres');

    // 4 · Le menu ne change PAS le cours actif ; les élèves portent le cours CHOISI.
    expect(m.actifApresMenu).toEqual(m.actifAvant);
    expect(m.actifApres).toEqual(m.actifAvant);
    expect(m.ajoutees.map(e => e.da).sort()).toEqual(['8870001', '8870002', '8870003']);
    expect(m.ajoutees.map(e => e.coursId)).toEqual(['COURS-887-B', 'COURS-887-B', 'COURS-887-B']);
    expect(m.nbApres).toBe(m.stockDepart.length + 3);
    expect(m.nbDaVides).toBe(0);
    expect(m.vusParLeCoursActif).toEqual([]);           // rattachés à l'AUTRE cours : le cours actif ne les compte pas

    // 5 · L'écran le DIT : le cours visé, et les lignes écartées par leur nom.
    expect(m.notifs.length).toBe(1);
    expect(m.notifs[0].classes).toContain('notification-warning');
    expect(m.notifs[0].texte).toContain('3 étudiant·es ajouté·es à 601-887 Second cours du banc');
    expect(m.notifs[0].texte).toContain('1 déjà présent·e');
    expect(m.notifs[0].texte).toContain('2 lignes écartées');
    expect(m.notifs[0].texte).toContain('Sansda Sacha (DA manquant)');
    expect(m.notifs[0].texte).toContain('Invalide Inès (DA invalide)');
    expect(m.zoneRefermee).toBe(true);

    // 6 · Le formulaire d'ajout nomme le cours ACTIF (pas celui du menu).
    // Même libellé que l'option du menu marquée « (cours actif) » : une seule fonction nomme un cours.
    expect(m.phraseAjout).toBe('Sera rattaché·e à : ' + m.apercu.optionChoisie.replace(' (cours actif)', ''));
    expect(m.phraseAjout.length).toBeGreaterThan('Sera rattaché·e à : '.length + 3);
    expect(m.phraseAjout).not.toContain('601-887');

    expect(erreurs).toEqual([]);
});
