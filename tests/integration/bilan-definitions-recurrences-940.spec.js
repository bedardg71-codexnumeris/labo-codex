import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #940 — LE BILAN : LA DÉFINITION DE CHAQUE CRITÈRE À TRAVAILLER, ET DES « POINTS RÉCURRENTS »
// QUI REGARDENT D'UNE COPIE À L'AUTRE (décisions de Grégoire, 24 sept. 2026).
//
// Le « fini quand » de la consigne : une copie Standards à deux copies antérieures → le PDF de
// synthèse et le bilan de l'écran portent les MÊMES lignes. Dans le vrai flux : la copie s'ouvre
// depuis son fichier, les niveaux se choisissent aux menus, le bilan de l'écran se lit AVANT
// l'enregistrement (c'est lui que `copierToutRetroaction` copie), puis la copie s'enregistre et
// le PDF de synthèse se compose sur l'évaluation en base.

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i
];
const estErreurAttendue = (msg) => patternsAttendus.some((re) => re.test(msg));

function attacherCaptureErreurs(page, erreurs) {
    page.on('pageerror', (e) => { const m = `pageerror: ${e.message}`; if (!estErreurAttendue(m)) erreurs.push(m); });
    page.on('console', (msg) => {
        if (msg.type() === 'error') { const m = `console.error: ${msg.text()}`; if (!estErreurAttendue(m)) erreurs.push(m); }
    });
    page.on('dialog', (d) => d.dismiss().catch(() => {}));
}

const PRESENTEMENT = [
    'Rigueur (Insuffisant) : La rigueur de la démonstration',
    'Structure (En développement) : La structure du texte'
];
const RECURRENTS = [
    'Rigueur : prioritaire depuis 3 productions',
    'Structure : à consolider depuis 3 productions'
];

test('#940 · une copie Standards à deux copies antérieures : le PDF de synthèse et le bilan de l\'écran portent les mêmes lignes', async ({ page }) => {
    const erreurs = [];
    attacherCaptureErreurs(page, erreurs);
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(700);

    // 1. Le semis : une grille holistique à trois critères (deux définitions), une échelle à repères,
    //    deux copies antérieures en base (Rigueur prioritaire aux deux ; Structure prioritaire puis
    //    à consolider), et la troisième production à évaluer.
    const prep = await page.evaluate(() => {
        const k = (b) => (typeof cle === 'function' ? cle(b) : b);
        // security-ok: fixtures littérales du banc, aucune source externe.
        window.db.setSync('trimestres', [{ id: 'a2026', nom: 'Automne 2026', annee: 2026, session: 'A', actif: true }]);
        window.db.setSync('trimestreActif', 'a2026');
        window.db.setSync('groupeCoursActif', { id: 'GC1', trimestreId: 'a2026', nom: 'Groupe 00007' });
        // security-ok: fixture littérale du banc, aucune source externe.
        window.db.setSync(k('groupeEtudiants'), [{ da: '1234567', prenom: 'Daniel', nom: 'Témoin', groupe: '00007', groupeCoursId: 'GC1' }]);
        // security-ok: fixture littérale du banc, aucune source externe.
        window.db.setSync(k('grillesTemplates'), [{ id: 'G9', nom: 'Analyse', type: 'holistique', criteres: [
            { id: 'c1', nom: 'Structure', ponderation: 30, type: 'holistique', description: 'La structure du texte' },
            { id: 'c2', nom: 'Rigueur', ponderation: 30, type: 'holistique', description: 'La rigueur de la démonstration' },
            { id: 'c3', nom: 'Nuance', ponderation: 40, type: 'holistique', description: '' }
        ] }]);
        // security-ok: fixture littérale du banc, aucune source externe.
        window.db.setSync(k('echellesTemplates'), [{ id: 'E9', nom: 'IDME témoin', niveaux: [
            { code: 'I', nom: 'Insuffisant', min: 0, max: 54, valeurCalcul: 40, couleur: '#aa0000' },
            { code: 'D', nom: 'En développement', min: 55, max: 74, valeurCalcul: 65, couleur: '#aa8800' },
            { code: 'M', nom: 'Maîtrisé', min: 75, max: 89, valeurCalcul: 80, couleur: '#00aa00' },
            { code: 'E', nom: 'Étendu', min: 90, max: 100, valeurCalcul: 95, couleur: '#0000aa' }
        ], seuilSuffisance: 'D', seuilMaitrise: 'M' }]);
        window.db.setSync(k('cartouches_G9'), []);
        // security-ok: fixture littérale du banc, aucune source externe.
        window.db.setSync(k('productions'), ['P1', 'P2', 'P3'].map((id, i) => ({
            id, titre: 'Analyse ' + (i + 1), grilleId: 'G9', echelleId: 'E9', groupeCoursId: 'GC1', cartoucheId: '' })));
        const anterieure = (id, prod, date, niv) => ({
            id, etudiantDA: '1234567', productionId: prod, productionNom: prod, grilleId: 'G9', echelleId: 'E9',
            dateEvaluation: date, noteFinale: 60, niveauFinal: 'D', statutRemise: 'remis',
            criteres: [['c1', 'Structure'], ['c2', 'Rigueur'], ['c3', 'Nuance']].map(([cid, nom], j) =>
                ({ critereId: cid, critereNom: nom, niveauSelectionne: niv[j], ponderation: [30, 30, 40][j] }))
        });
        // security-ok: fixture littérale du banc, aucune source externe.
        window.db.setSync(k('evaluationsSauvegardees'), [
            anterieure('EV_P1', 'P1', '2026-09-01T12:00:00.000Z', ['I', 'I', 'D']),
            anterieure('EV_P2', 'P2', '2026-09-10T12:00:00.000Z', ['D', 'I', 'M'])
        ]);
        window.chargerListeEtudiantsEval();
        window.chargerGroupesEval();
        window.chargerProductionsDansSelect();
        window.chargerGrillesDansSelect();
        window.chargerEchellePerformance();
        return window.demarrerEvaluationDepuisFichier({ id: 'F9', etudiantDA: '1234567', productionId: 'P3', nomFichier: 'analyse3.pdf' });
    });
    expect(prep).toBe('P3');
    await page.waitForTimeout(200);

    // 2. Ouvrir la copie, choisir les niveaux aux menus : Structure D, Rigueur I, Nuance M.
    const ecran = await page.evaluate(async () => {
        const dormir = (ms) => new Promise(r => setTimeout(r, ms));
        const selE = document.getElementById('selectEtudiantEval');
        selE.value = '1234567';
        window.chargerEvaluationsEtudiant();
        const selP = document.getElementById('selectProduction1');
        selP.value = 'P3';
        selP.dispatchEvent(new Event('change', { bubbles: true }));
        await dormir(900);
        const selG = document.getElementById('selectGrille1');
        if (!selG.value) { selG.value = 'G9'; selG.dispatchEvent(new Event('change', { bubbles: true })); }
        const selEch = document.getElementById('selectEchelle1');
        if (!selEch.value) { selEch.value = 'E9'; selEch.dispatchEvent(new Event('change', { bubbles: true })); }
        const selR = document.getElementById('remiseProduction1');
        if (selR) { selR.value = 'importe'; if (typeof window.changerStatutRemise === 'function') window.changerStatutRemise(1); }
        await dormir(400);
        const menus = { c1: 'D', c2: 'I', c3: 'M' };
        Object.keys(menus).forEach((id) => {
            const menu = document.getElementById('eval_' + id);
            menu.value = menus[id];
            menu.dispatchEvent(new Event('change', { bubbles: true }));
        });
        await dormir(300);
        window.basculerVueRetroaction('bilan');
        const html = document.getElementById('contenuRetroBilan').innerHTML;
        const [avant, apres] = html.split('<h5>Points récurrents</h5>');
        const puces = (m) => ((m || '').match(/<p>- (.*?)<\/p>/g) || []).map(p => {
            const t = document.createElement('textarea'); t.innerHTML = p.slice(5, -4); return t.value;
        });
        return { presentement: puces(avant), recurrents: puces(apres), texte: document.getElementById('contenuRetroBilan').textContent };
    });
    console.log('ÉCRAN →', JSON.stringify({ presentement: ecran.presentement, recurrents: ecran.recurrents }));
    expect(ecran.presentement).toEqual(PRESENTEMENT);
    expect(ecran.recurrents).toEqual(RECURRENTS);
    expect(ecran.texte).not.toContain('Cet objectif');

    // 3. Enregistrer, puis composer le PDF de synthèse sur l'évaluation en base.
    const pdf = await page.evaluate(async () => {
        window.sauvegarderEvaluation();
        await new Promise(r => setTimeout(r, 400));
        const evals = window.db.getSync(cle('evaluationsSauvegardees'), []) || [];
        const e = evals.find(x => x.productionId === 'P3');
        if (!e) return { nb: evals.length };
        const fb = window.syntheseRetroactionData.construireFeedback(e, { id: 'F9', etudiantDA: '1234567', productionId: 'P3' }, null);
        const html = window.syntheseRetroactionRendu.rendreSyntheseHTML(fb);
        return {
            nb: evals.length,
            presentement: fb.bilan.concentration.priorites.concat(fb.bilan.concentration.signales),
            recurrents: fb.bilan.recurrents.recurrences,
            dansLaPage: [
                'Rigueur (Insuffisant) : La rigueur de la démonstration',
                'Structure (En développement) : La structure du texte',
                'Rigueur : prioritaire depuis 3 productions',
                'Structure : à consolider depuis 3 productions'
            ].map(l => html.includes(l)),
            suffixe: html.includes('Cet objectif')
        };
    });
    console.log('PDF →', JSON.stringify(pdf));
    expect(pdf.nb).toBe(3);
    expect(pdf.presentement).toEqual(PRESENTEMENT);
    expect(pdf.recurrents).toEqual(RECURRENTS);
    expect(pdf.dansLaPage, 'les quatre lignes sont dans la page de synthèse rendue').toEqual([true, true, true, true]);
    expect(pdf.suffixe).toBe(false);

    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});
