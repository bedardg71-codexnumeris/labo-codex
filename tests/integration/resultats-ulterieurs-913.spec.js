import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// PORTE #913 (17 septembre 2026) — SAISIR UN RÉSULTAT OBTENU APRÈS LE TRIMESTRE, SUR LE VRAI ÉCRAN.
//
// L'écran retenu est la liste du Cadre (Calendrier › Trimestre › accordéon des étudiant·es), mesuré le 17 sept. :
// il rend les élèves ligne par ligne sur un trimestre archivé, tient à 768 px et n'écrit aucune donnée du
// trimestre à l'ouverture. Le verrou du mode archive n'est qu'une garde CSS : ce banc juge donc la garde
// posée DANS l'écriture, par le chemin que le CSS ne ferme pas — Entrée dans un champ (soumission implicite).
//
// Aucun `page.click` (budget du runner) : `el.click()`, et le clavier pour Entrée.

const T = 't913';
const DA1 = '9130001';
const DA2 = '9130002';

async function monter(page, { archive }) {
    await page.setViewportSize({ width: 768, height: 1024 });
    const erreurs = [];
    page.on('console', (m) => { if (m.type() === 'error') erreurs.push(m.text()); });
    page.on('pageerror', (e) => erreurs.push(`pageerror: ${e.message}`));
    page.on('dialog', (d) => { erreurs.push(`dialogue: ${d.message()}`); d.dismiss().catch(() => {}); });
    await page.goto(indexHtml);
    await page.waitForFunction(() => typeof window.db !== 'undefined' && typeof window.afficherSection === 'function');
    await page.evaluate(({ T, DA1, DA2, archive }) => {
        // security-ok: fixtures littérales du banc, aucune source externe.
        const coursId = 'cours-913';
        window.db.setSync('trimestres', [{ id: T, nom: 'Automne passé', annee: 2025, session: 'A', actif: true, archive }]);
        window.db.setSync('cours', [{ id: coursId, codeCours: 'FRA101', titre: 'Écriture et littérature' }]);
        window.db.setSync(T + '_groupesCours', [{ id: 'GC913', trimestreId: T, coursId, groupeNum: '01', pratiqueId: 'sommative', actif: true }]);
        window.db.setSync(T + '_groupeEtudiants', [
            { da: DA1, nom: 'Gagnon', prenom: 'Léa', groupe: '01', coursId, groupeCoursId: 'GC913' },
            { da: DA2, nom: 'Roy', prenom: 'Max', groupe: '01', coursId, groupeCoursId: 'GC913' }
        ]);
        window.db.setSync('trimestreActif', T);
        window.db.setSync('infoCours', { id: coursId, codeCours: 'FRA101', groupe: '01', _groupeCoursId: 'GC913' });
        window.db.setSync('groupeCoursActif', { id: 'GC913', trimestreId: T });
    }, { T, DA1, DA2, archive });
    // Le mode archive se pose au démarrage : on recharge sur le stock semé (une seule fois, sans `clear`).
    await page.reload();
    await page.waitForFunction(() => typeof window.db !== 'undefined' && typeof window.afficherSection === 'function'
        && typeof window.afficherResultatsUlterieurs === 'function');
    return erreurs;
}

/** Le chemin de Grégoire : Calendrier › Trimestre › accordéon des étudiant·es › « Résultats ultérieurs ». */
async function ouvrirLaZone(page) {
    await page.evaluate(() => { window.afficherSection('calendrier'); window.afficherSousSection('calendrier-trimestre'); });
    await page.waitForFunction(() => document.querySelectorAll('#resultats-ulterieurs-liste .ru-eleve').length === 2, null, { timeout: 10000 });
    await page.evaluate(() => {
        const accordeon = document.getElementById('accordeon-groupe-etudiants');
        if (accordeon.classList.contains('ferme')) accordeon.querySelector('.accordeon-header').click();
        document.querySelector('#resultats-ulterieurs-zone details').open = true;
    });
    await page.waitForFunction(() => {
        const champ = document.querySelector('#resultats-ulterieurs-liste input[name="note"]');
        return !!champ && champ.offsetParent !== null;
    }, null, { timeout: 10000 });
}

/** Remplit la ligne d'un élève, pose le curseur dans « Note finale » et tape Entrée. */
async function saisir(page, da, { cours, trimestre, note }) {
    await page.evaluate(({ da, cours, trimestre, note }) => {
        const ligne = Array.from(document.querySelectorAll('.ru-eleve')).find((li) => li.dataset.da === da);
        const f = ligne.querySelector('form');
        if (cours !== undefined) f.elements.cours.value = cours;
        if (trimestre !== undefined) f.elements.trimestre.value = trimestre;
        f.elements.note.value = note;
        f.elements.note.focus();
    }, { da, cours, trimestre, note });
    await page.keyboard.press('Enter');
}

const stockDuTrimestre = (page) => page.evaluate((T) => {
    const o = {};
    for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k.startsWith(T + '_')) o[k] = localStorage.getItem(k); }
    return o;
}, T);

const ranges = (page) => page.evaluate((T) => window.db.getSync(T + '_resultatsUlterieurs', null), T);

test.describe('#913 — résultats ultérieurs, liste du Cadre, 768 px', () => {
    test('R1 · trimestre archivé SANS permission d\'écriture : octet pour octet, et l\'écran dit quoi faire', async ({ page }) => {
        const erreurs = await monter(page, { archive: true });
        const avant = await stockDuTrimestre(page);
        expect(Object.keys(avant).length).toBeGreaterThan(0);
        await ouvrirLaZone(page);
        expect(await page.evaluate(() => document.body.classList.contains('mode-archive') && !document.body.classList.contains('mode-ecriture-temp'))).toBe(true);
        // La phrase du verrou est visible ; elle nomme la case du bandeau, qui est visible elle aussi.
        const verrou = await page.evaluate(() => {
            const p = document.querySelector('.ru-verrou');
            const c = document.getElementById('checkbox-ecriture-temp');
            return { phrase: p.offsetParent !== null ? p.textContent : null, caseVisible: c.offsetParent !== null };
        });
        expect(verrou.phrase).toContain('Permission d\'écriture');
        expect(verrou.caseVisible).toBe(true);
        // Le chemin que le CSS ne ferme pas : Entrée dans un champ.
        await saisir(page, DA1, { cours: '601-102-MQ', trimestre: 'H2026', note: '78' });
        await page.waitForFunction(() => Array.from(document.querySelectorAll('.ru-refus')).some((p) => p.textContent.includes('Permission')), null, { timeout: 5000 });
        expect(await ranges(page)).toBeNull();
        expect(await stockDuTrimestre(page)).toEqual(avant);
        expect(erreurs).toEqual([]);
    });

    test('R2 · avec la permission d\'écriture : deux résultats ajoutés, un retiré ; cibles à 44 px ; rien ne déborde', async ({ page }) => {
        const erreurs = await monter(page, { archive: true });
        await ouvrirLaZone(page);
        await page.evaluate(() => document.getElementById('checkbox-ecriture-temp').click());
        await page.waitForFunction(() => document.body.classList.contains('mode-ecriture-temp'));
        expect(await page.evaluate(() => document.querySelector('.ru-verrou').offsetParent)).toBeNull();

        await saisir(page, DA1, { cours: '601-102-MQ', trimestre: 'H2026', note: '78,5' });
        await page.waitForFunction(() => document.querySelectorAll('.ru-resultat').length === 1, null, { timeout: 5000 });
        // La saisie suivante : le curseur est dans la note de l'élève d'après, cours et trimestre déjà là.
        const suite = await page.evaluate(() => {
            const a = document.activeElement;
            const f = a && a.closest('form');
            return { champ: a && a.name, da: a && a.closest('.ru-eleve').dataset.da, cours: f && f.elements.cours.value, trimestre: f && f.elements.trimestre.value };
        });
        expect(suite).toEqual({ champ: 'note', da: DA2, cours: '601-102-MQ', trimestre: 'H2026' });

        await saisir(page, DA1, { cours: '601-103-MQ', trimestre: 'A2026', note: '64' });
        await page.waitForFunction(() => document.querySelectorAll('.ru-resultat').length === 2, null, { timeout: 5000 });
        expect(await ranges(page)).toEqual({ [DA1]: [
            { cours: '601-102-MQ', trimestre: 'H2026', note: 78.5 },
            { cours: '601-103-MQ', trimestre: 'A2026', note: 64 }
        ] });

        const mesures = await page.evaluate(() => {
            const zone = document.querySelector('#resultats-ulterieurs-zone details').getBoundingClientRect();
            const cibles = Array.from(document.querySelectorAll('#resultats-ulterieurs-zone .ru-cible')).filter((el) => el.offsetParent !== null);
            return {
                nbCibles: cibles.length,
                hauteurMin: Math.min(...cibles.map((el) => el.getBoundingClientRect().height)),
                largeurMin: Math.min(...cibles.filter((el) => el.tagName !== 'SUMMARY').map((el) => el.getBoundingClientRect().width)),
                horsZone: cibles.filter((el) => { const r = el.getBoundingClientRect(); return r.left < zone.left - 1 || r.right > zone.right + 1; }).length,
                debordePage: document.documentElement.scrollWidth > window.innerWidth
            };
        });
        // 2 élèves × (3 champs + Ajouter) + 2 « Retirer » + le titre repliable.
        expect(mesures.nbCibles).toBe(11);
        expect(mesures.hauteurMin).toBeGreaterThanOrEqual(44);
        expect(mesures.largeurMin).toBeGreaterThanOrEqual(44);
        expect(mesures.horsZone).toBe(0);
        expect(mesures.debordePage).toBe(false);

        await page.evaluate(() => document.querySelector('.ru-resultat [data-action="retirerResultatUlterieur"][data-index="0"]').click());
        await page.waitForFunction(() => document.querySelectorAll('.ru-resultat').length === 1, null, { timeout: 5000 });
        expect(await ranges(page)).toEqual({ [DA1]: [{ cours: '601-103-MQ', trimestre: 'A2026', note: 64 }] });
        // La page n'a pas été rechargée par la soumission du formulaire : la case est toujours cochée.
        expect(await page.evaluate(() => document.getElementById('checkbox-ecriture-temp').checked)).toBe(true);
        expect(erreurs).toEqual([]);
    });

    test('R3 · une note hors bornes n\'est pas écrite, et l\'écran le dit sous la ligne de l\'élève', async ({ page }) => {
        const erreurs = await monter(page, { archive: false });
        await ouvrirLaZone(page);
        await saisir(page, DA2, { cours: '601-102-MQ', trimestre: 'H2026', note: '101' });
        await page.waitForFunction(() => Array.from(document.querySelectorAll('.ru-refus')).some((p) => p.textContent.length > 0), null, { timeout: 5000 });
        const refus = await page.evaluate((da) => {
            const ligne = Array.from(document.querySelectorAll('.ru-eleve')).find((li) => li.dataset.da === da);
            const p = ligne.querySelector('.ru-refus');
            return { texte: p.textContent, visible: p.offsetParent !== null, ailleurs: Array.from(document.querySelectorAll('.ru-refus')).filter((x) => x !== p && x.textContent).length };
        }, DA2);
        expect(refus).toEqual({ texte: 'La note doit être un nombre entre 0 et 100.', visible: true, ailleurs: 0 });
        expect(await ranges(page)).toBeNull();
        // Trimestre courant (non archivé) : la saisie passe sans aucune case.
        await saisir(page, DA2, { note: '88' });
        await page.waitForFunction(() => document.querySelectorAll('.ru-resultat').length === 1, null, { timeout: 5000 });
        expect(await ranges(page)).toEqual({ [DA2]: [{ cours: '601-102-MQ', trimestre: 'H2026', note: 88 }] });
        expect(erreurs).toEqual([]);
    });
});
