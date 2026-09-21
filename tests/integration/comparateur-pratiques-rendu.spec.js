import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// Comparateur de pratiques — BANC DE DÉCISION (#326 R4→R6). Le comparateur est une
// sous-section pérenne du Labo. Depuis R4, il s'appuie sur des PROFILS FICTIFS GÉNÉRÉS
// depuis l'échelle (R2) injectés en lecture seule — plus de garde « mode démo ».
// activerModeDemo() sert ici UNIQUEMENT à semer une échelle + des pratiques réelles
// (le banc génère ensuite ses propres profils SIM00xx).
//
// Ouverture commune : afficherSection('labo') + afficherSousSection('labo-comparateur')
// → initialiseur 'labo-comparateur' (setTimeout 100 ms) → rendu dans #labo-comparateur.

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i
];
const estErreurAttendue = (msg) => patternsAttendus.some((re) => re.test(msg));

function brancherErreurs(page, erreurs) {
    page.on('pageerror', (e) => {
        const m = `pageerror: ${e.message}`;
        if (!estErreurAttendue(m)) erreurs.push(m);
    });
    page.on('console', (msg) => {
        if (msg.type() === 'error') {
            const m = `console.error: ${msg.text()}`;
            if (!estErreurAttendue(m)) erreurs.push(m);
        }
    });
}

// Ouvre le banc après seed démo (échelle + pratiques). Retourne le handle d'éval.
async function ouvrirBanc(page) {
    return page.evaluate(async () => {
        if (typeof window.activerModeDemo !== 'function') return { erreur: 'activerModeDemo absent' };
        if (typeof window.initialiserComparateurPratiques !== 'function') return { erreur: 'initialiserComparateurPratiques absent' };
        await window.activerModeDemo();           // sème échelle + pratiques réelles
        window.afficherSection('labo');
        window.afficherSousSection('labo-comparateur');
        await new Promise((r) => setTimeout(r, 300));
        return { ok: true };
    });
}

test('#326 R4 · le banc s\'ouvre SANS mode démo et rend construction + résultat', async ({ page }) => {
    const erreurs = [];
    brancherErreurs(page, erreurs);
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const r = await ouvrirBanc(page);
    expect(r.erreur, `Erreur ouverture : ${r.erreur}`).toBeUndefined();

    const res = await page.evaluate(() => {
        const panel = document.getElementById('labo-comparateur');
        const matrice = panel ? panel.querySelector('#comparateur-matrice') : null;
        const table = matrice ? matrice.querySelector('table.comparateur-matrice-table') : null;
        const txt = table ? table.textContent : '';
        return {
            aPanneau: !!panel,
            aMatrice: !!matrice,
            aTable: !!table,
            // R5 : plus d'invitation « mode démo »
            aBoutonDemo: !!(panel && panel.querySelector('.comparateur-activer-demo')),
            aSectionConstruction: txt.includes('Construction de la note'),
            aSectionResultat: txt.includes('Résultat'),
            aSelecteurSource: !!(panel && panel.querySelector('.comparateur-source-select')),
            aArbre: !!(panel && panel.querySelector('#exploration-arbre-hote .exploration-arbre')),
            // Note « outil en développement » (#326) : cadre la lecture d'un 0.
            aNoteDev: !!(panel && panel.querySelector('.comparateur-note-dev'))
        };
    });

    expect(res.aPanneau).toBe(true);
    expect(res.aMatrice).toBe(true);
    expect(res.aTable).toBe(true);
    expect(res.aBoutonDemo).toBe(false);                 // garde démo retirée (R5)
    expect(res.aSectionConstruction).toBe(true);
    expect(res.aSectionResultat).toBe(true);
    expect(res.aSelecteurSource).toBe(true);             // source fictif/réel (R4b)
    expect(res.aArbre).toBe(true);
    expect(res.aNoteDev).toBe(true);                     // note « outil en développement »
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

// #326 (fix 17 juin) : le pourcentage d'un niveau d'échelle a 3 noms (valeurCalcul /
// valeur / valeur_pourcentage). Le générateur ne lisait que `valeur_pourcentage` →
// noteFinale null → toutes les notes du banc à 0 (constaté terrain + CI). Corrigé
// (`_pct` robuste). Ce test re-vérifie de bout en bout que les notes calculent (> 0).
test('#326 R2/R4a · les notes du banc sont calculées (> 0) sur les profils générés', async ({ page }) => {
    // Vérification BOUT EN BOUT du fix « DA 7 caractères » : corpus généré → injection
    // → simulerIndices → notes non nulles (le bug terrain affichait 0 partout).
    const erreurs = [];
    brancherErreurs(page, erreurs);
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const r = await ouvrirBanc(page);
    expect(r.erreur, `Erreur ouverture : ${r.erreur}`).toBeUndefined();

    const res = await page.evaluate(() => {
        const panel = document.getElementById('labo-comparateur');
        const lignesProfil = panel.querySelectorAll('#comparateur-matrice .comparateur-ligne-profil');
        const notes = Array.from(panel.querySelectorAll('#comparateur-matrice .comparateur-note'))
            .map(n => parseInt(n.textContent, 10)).filter(v => !isNaN(v));

        // SONDE de diagnostic (remontée dans le message d'échec CI) : pourquoi 0 ?
        let diag = {};
        try {
            const ech = (window.db.getSync('echellesTemplates', []) || [])[0] || null;
            const c = (window.ProfilsTypesGenerateur && ech)
                ? window.ProfilsTypesGenerateur.genererCorpus(ech) : { profils: [], productions: [], evaluations: [] };
            const da0 = c.profils[0] ? c.profils[0].da : null;
            const inj = { evaluationsSauvegardees: c.evaluations, productions: c.productions };
            const som = (da0 && typeof window.simulerIndices === 'function')
                ? window.simulerIndices(da0, 'sommative', inj) : null;
            const actif = (typeof window.obtenirIdPratiqueActive === 'function')
                ? window.obtenirIdPratiqueActive() : null;
            const actRes = (da0 && actif) ? window.simulerIndices(da0, actif, inj) : null;
            diag = {
                echNom: ech && (ech.nom || ech.echelle_nom), echId: ech && ech.id,
                niv0: ech && ech.niveaux && ech.niveaux[0],
                nbProfilsGen: c.profils.length, nbEvals: c.evaluations.length,
                da0, eval0: c.evaluations[0] || null,
                actif, somP: som && som.P, somNote: som && som.noteFinale,
                actP: actRes && actRes.P, actNote: actRes && actRes.noteFinale
            };
        } catch (e) { diag = { erreurDiag: String(e && e.message) }; }

        return {
            nbProfils: lignesProfil.length,
            nbNotes: notes.length,
            maxNote: notes.length ? Math.max.apply(null, notes) : 0,
            toutesZero: notes.length > 0 && notes.every(v => v === 0),
            diag
        };
    });

    expect(res.nbProfils).toBeGreaterThanOrEqual(2);     // profils générés depuis l'échelle
    expect(res.nbNotes).toBeGreaterThanOrEqual(1);       // au moins une note rendue
    expect(res.maxNote, `DIAG notes=0 → ${JSON.stringify(res.diag)}`).toBeGreaterThan(0);
    expect(res.toutesZero).toBe(false);
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

test('#326 R4b · colonnes paires + lignes de construction + lien « Éditer »', async ({ page }) => {
    const erreurs = [];
    brancherErreurs(page, erreurs);
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const r = await ouvrirBanc(page);
    expect(r.erreur, `Erreur ouverture : ${r.erreur}`).toBeUndefined();

    const res = await page.evaluate(() => {
        const panel = document.getElementById('labo-comparateur');
        const selects = panel.querySelectorAll('#comparateur-matrice .comparateur-select');
        const lignesConstr = panel.querySelectorAll('#comparateur-matrice .comparateur-ligne-constr');
        const liens = panel.querySelectorAll('#comparateur-matrice .comparateur-editer-lien');
        const txt = panel.querySelector('#comparateur-matrice').textContent;
        return {
            nbSelects: selects.length,
            selectsDansTete: panel.querySelectorAll('#comparateur-matrice thead .comparateur-select').length,
            nbLignesConstr: lignesConstr.length,
            aLienEditer: liens.length >= 1,
            // ancres de construction présentes (R3)
            aPonderation: txt.includes('Pondération'),
            aReprises: txt.includes('Reprises'),
            // plus de modèle réf privilégiée (R4b)
            aTaPratique: txt.includes('Ta pratique')
        };
    });

    expect(res.nbSelects).toBeGreaterThanOrEqual(2);     // colonnes paires (≥ 2)
    expect(res.selectsDansTete).toBe(res.nbSelects);     // sélecteurs dans l'en-tête
    expect(res.nbLignesConstr).toBeGreaterThanOrEqual(3);// ancres pondération/reprises/nb productions
    expect(res.aLienEditer).toBe(true);                  // lien vers le formulaire #319
    expect(res.aPonderation).toBe(true);
    expect(res.aReprises).toBe(true);
    expect(res.aTaPratique).toBe(false);                 // plus de « Ta pratique »
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

test('#326 R4b · navigation vers la fiche d\'un profil + retour, non-destructif', async ({ page }) => {
    const erreurs = [];
    brancherErreurs(page, erreurs);
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const r = await ouvrirBanc(page);
    expect(r.erreur, `Erreur ouverture : ${r.erreur}`).toBeUndefined();

    const res = await page.evaluate(async () => {
        const panel = document.getElementById('labo-comparateur');
        const snapshot = () => {
            const o = {};
            for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); o[k] = localStorage.getItem(k); }
            return JSON.stringify(o, Object.keys(o).sort());
        };
        const avant = snapshot();

        const tr = panel.querySelector('#comparateur-matrice .comparateur-ligne-profil');
        const ligneActivable = !!(tr && tr.getAttribute('role') === 'button' && tr.getAttribute('tabindex') === '0');
        if (tr) tr.click();
        await new Promise((r) => setTimeout(r, 50));

        const aRetour = !!panel.querySelector('.comparateur-retour');
        const ficheSansMatrice = !panel.querySelector('#comparateur-matrice');
        const ret = panel.querySelector('.comparateur-retour');
        if (ret) ret.click();
        await new Promise((r) => setTimeout(r, 50));
        const retourMatrice = !!panel.querySelector('#comparateur-matrice table.comparateur-matrice-table');

        return { ligneActivable, aRetour, ficheSansMatrice, retourMatrice, nonDestructif: avant === snapshot() };
    });

    expect(res.ligneActivable).toBe(true);
    expect(res.aRetour).toBe(true);
    expect(res.ficheSansMatrice).toBe(true);
    expect(res.retourMatrice).toBe(true);
    expect(res.nonDestructif).toBe(true);                // lecture seule
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

test('#326 R4b · export CSV — BOM, en-têtes, une colonne par pratique', async ({ page }) => {
    const erreurs = [];
    brancherErreurs(page, erreurs);
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const r = await ouvrirBanc(page);
    expect(r.erreur, `Erreur ouverture : ${r.erreur}`).toBeUndefined();

    const res = await page.evaluate(() => {
        const panel = document.getElementById('labo-comparateur');
        const aBouton = !!panel.querySelector('.comparateur-exporter');
        if (typeof window._comparateurGenererCSV !== 'function') return { erreur: '_comparateurGenererCSV absent' };
        const csv = window._comparateurGenererCSV();
        const aBOM = csv.charCodeAt(0) === 0xFEFF;
        const lignes = csv.replace(/^﻿/, '').replace(/\r\n$/, '').split('\r\n');
        const entete = lignes[0] || '';
        return {
            aBouton, aBOM,
            nbLignes: lignes.length,
            aColProfil: entete.includes('Profil'),
            aColDA: entete.includes('DA'),
            aColNiveau: entete.includes('Niveau atteint'),
            nbColonnes: entete.split(',').length
        };
    });

    expect(res.erreur, `Erreur eval : ${res.erreur}`).toBeUndefined();
    expect(res.aBouton).toBe(true);
    expect(res.aBOM).toBe(true);
    expect(res.nbLignes).toBeGreaterThanOrEqual(3);      // en-tête + ≥ 2 profils générés
    expect(res.aColProfil).toBe(true);
    expect(res.aColDA).toBe(true);
    expect(res.aColNiveau).toBe(true);
    expect(res.nbColonnes).toBeGreaterThanOrEqual(5);    // Profil, DA, Niveau, Tendance, ≥ 1 pratique
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

test('#326 R4b · changer une colonne recalcule le banc (lecture seule)', async ({ page }) => {
    const erreurs = [];
    brancherErreurs(page, erreurs);
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const r = await ouvrirBanc(page);
    expect(r.erreur, `Erreur ouverture : ${r.erreur}`).toBeUndefined();

    const res = await page.evaluate(async () => {
        const panel = document.getElementById('labo-comparateur');
        const snapshot = () => {
            const o = {};
            for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); o[k] = localStorage.getItem(k); }
            return JSON.stringify(o, Object.keys(o).sort());
        };
        const avant = snapshot();

        const sel = panel.querySelector('#comparateur-matrice .comparateur-select[data-slot="1"]')
            || panel.querySelector('#comparateur-matrice .comparateur-select');
        const matrice = document.getElementById('comparateur-matrice');
        let recalculOk = false;
        if (sel && matrice) {
            const avantTxt = matrice.textContent;
            const autre = Array.from(sel.options).find(o => o.value !== sel.value);
            if (autre) {
                sel.value = autre.value;
                sel.dispatchEvent(new Event('change', { bubbles: true }));
                await new Promise((r) => setTimeout(r, 50));
                recalculOk = document.getElementById('comparateur-matrice').textContent !== avantTxt;
            }
        }
        return { recalculOk, nonDestructif: avant === snapshot() };
    });

    expect(res.recalculOk).toBe(true);
    expect(res.nonDestructif).toBe(true);
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});
