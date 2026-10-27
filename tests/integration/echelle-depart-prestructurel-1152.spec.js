import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// =====================================================================
// LE NIVEAU « PS – PRÉSTRUCTUREL » DE L'ÉCHELLE DE DÉPART (27 oct. 2026)
// =====================================================================
//
// Décision de Grégoire (27 oct., 17 h 56-17 h 57 ; le code « PS », 18 h 06) : l'« Échelle de départ (IDME) » gagne
// un niveau en tête, « PS – Préstructurel », 0 à 39,99 %, valeur ponctuelle 0. Le code « 0 » reste au non recevable.
// VERDICT-RELECTURE-2026-10-27-aide-lot-2b.md, § 4.3 et § 4.4 : « elle vaut 0, elle compte, elle s'affiche ».
//
// Le VRAI semis (grille, échelle et cartouche de départ), puis une copie dont tous les critères sont au niveau PS :
//   · à l'évaluation : la note vaut 0 % (un vrai zéro, pas « -- ») et le niveau global est « PS » ;
//   · enregistrée et verrouillée : la Liste des évaluations montre 0 % et PS ; la note sommative (P) la compte pour 0 ;
//     le PDF est construit sur 0 et PS ; et ce que la « Cartouche de départ » donne à lire à ce niveau est relevé
//     (elle n'a aucun commentaire pour PS : ces mots reviennent à Grégoire, rien n'est écrit ici).
//
// Données FICTIVES ; lecture de ce que l'application rend, aucun texte d'élève écrit.

const T = 'a2026';
const DA = '1152001';

const MONTER = `async ({ T, DA }) => {
    window.db.setSync('trimestres', [{ id: T, nom: 'Automne 2026', annee: 2026, session: 'A', actif: true }]);
    window.db.setSync('trimestreActif', T);
    window.trimestreActif = T;
    ['echellesTemplates', 'grillesTemplates'].forEach((k) => window.db.setSync(T + '_' + k, []));   // security-ok: fixture littérale du banc
    await window.assurerGrilleDeDepart();
    await window.assurerEchelleIdmeDeDepart();
    await window.assurerCartoucheDeDepart();
    const coursId = 'cours-1152';
    window.db.setSync('cours', [{ id: coursId, codeCours: 'FIC101', titre: 'Cours fictif' }]);
    window.db.setSync(T + '_groupesCours', [{ id: 'GC1152', trimestreId: T, coursId, groupeNum: '01', pratiqueId: 'sommative', actif: true }]);
    window.db.setSync(T + '_groupeEtudiants', [{ da: DA, nom: 'Fictif', prenom: 'Élève', groupe: '01', coursId, groupeCoursId: 'GC1152' }]);   // security-ok: fixture littérale du banc
    window.db.setSync(T + '_productions', [{ id: 'P1152', titre: 'Travail fictif', type: 'travail', ponderation: 100,
        grilleId: 'GRILLE_GENERIQUE', echelleId: 'ECHELLE_IDME_DEPART', cartoucheId: 'CART_GENERIQUE', groupeCoursId: 'GC1152' }]);   // security-ok: fixture littérale du banc
    window.db.setSync('infoCours', { id: coursId, codeCours: 'FIC101', groupe: '01', _groupeCoursId: 'GC1152' });   // security-ok: fixture littérale du banc
    window.db.setSync('groupeCoursActif', { id: 'GC1152', trimestreId: T });
    const grille = window.db.getSync(T + '_grillesTemplates', []).find((g) => g.id === 'GRILLE_GENERIQUE');
    const echelle = window.db.getSync(T + '_echellesTemplates', []).find((e) => e.id === 'ECHELLE_IDME_DEPART');
    return { codes: echelle.niveaux.map((n) => n.code), criteres: grille.criteres.map((c) => ({ id: c.id, nom: c.nom, ponderation: c.ponderation })) };
}`;

async function monter(page) {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    page.on('dialog', (d) => { erreurs.push('DIALOGUE : ' + d.message()); d.dismiss().catch(() => {}); });
    await page.goto(indexHtml);
    await page.waitForFunction(() => window.dbReady === true && typeof window.assurerEchelleIdmeDeDepart === 'function'
        && window.syntheseRetroactionData && window.travauxExportPDF && window.jspdf, null, { timeout: 20000 });
    const r = await page.evaluate('(' + MONTER + ')(' + JSON.stringify({ T, DA }) + ')');
    return { erreurs, ...r };
}

test('PS · à l\'évaluation, une copie au niveau Préstructurel vaut 0 % et se nomme « PS »', async ({ page }) => {
    const { erreurs, codes } = await monter(page);
    expect(codes).toEqual(['PS', 'I', 'D', 'M', 'E']);
    const r = await page.evaluate(() => {
        const grille = window.db.getSync('a2026_grillesTemplates', []).find((g) => g.id === 'GRILLE_GENERIQUE');
        evaluationEnCours = { grilleId: grille.id, echelleId: 'ECHELLE_IDME_DEPART', criteres: {} };
        window.evaluationEnCours = evaluationEnCours;
        const selEch = document.getElementById('selectEchelle1');
        if (selEch) selEch.value = 'ECHELLE_IDME_DEPART';
        window.afficherCriteresDepuisGrille(grille.id, 'ECHELLE_IDME_DEPART');
        const options = [...document.querySelectorAll('#listeCriteresGrille1 select')][0];
        grille.criteres.forEach((c) => { evaluationEnCours.criteres[c.id] = 'PS'; });
        window.calculerNote();
        return {
            option: options ? [...options.options].map((o) => o.textContent.trim()) : null,
            note: document.getElementById('noteProduction1').textContent,
            niveau: document.getElementById('niveauProduction1').textContent,
            courante: window.noteCalculeeCourante
        };
    });
    expect(r.option, 'le menu du critère offre le niveau PS').toContain('PS - Préstructurel');
    expect(r.courante, 'un vrai zéro').toBe(0);
    expect(r.note).toBe('0 %');
    expect(r.niveau).toBe('PS');
    expect(erreurs).toEqual([]);
});

test('PS · enregistrée : la Liste, la note sommative et le PDF lisent 0 et PS ; ce que dit la Cartouche de départ', async ({ page }) => {
    test.setTimeout(90000);
    const { erreurs, criteres } = await monter(page);
    await page.evaluate(({ T, DA, criteres }) => {
        window.db.setSync(T + '_evaluationsSauvegardees', [{
            id: 'EV1152', etudiantDA: DA, productionId: 'P1152', groupeCoursId: 'GC1152', grilleId: 'GRILLE_GENERIQUE',
            echelleId: 'ECHELLE_IDME_DEPART', cartoucheId: 'CART_GENERIQUE', statutRemise: 'evalue', statutIntegrite: 'recevable',
            dateEvaluation: '2026-10-27T08:00:00.000Z', noteFinale: 0, niveauFinal: 'PS', verrouillee: true, ponderationCouverte: 100,
            criteres: criteres.map((c) => ({ critereId: c.id, critereNom: c.nom, niveauSelectionne: 'PS', ponderation: c.ponderation, retroaction: '' })),
            retroactionFinale: '', retroactionReecrite: false
        }]);   // security-ok: fixture littérale du banc
        window._pdf1152 = [];
        window._feedback1152 = [];
        window.jspdf.jsPDF.API.save = function (nom) { window._pdf1152.push(nom); return this; };
        const construire = window.syntheseRetroactionData.construireFeedback;
        window.syntheseRetroactionData.construireFeedback = function (evaluation) {
            const f = construire.apply(this, arguments);
            window._feedback1152.push({ noteFinale: evaluation.noteFinale, niveauFinal: evaluation.niveauFinal, criteres: f && f.criteria });
            return f;
        };
    }, { T, DA, criteres });

    // La note sommative (P) la compte : 0, pas « aucune note ».
    const p = await page.evaluate((DA) => window.obtenirPratiqueParId('sommative').calculerPerformance(DA), DA);
    expect(p, 'P sommative').toBe(0);

    // La Liste des évaluations.
    await page.evaluate(() => { window.afficherSection('evaluations'); window.afficherSousSection('evaluations-liste'); });
    const ligne = page.locator('#corps-tableau-evaluations tr', { hasText: 'Travail fictif' }).first();
    await expect(ligne).toBeVisible({ timeout: 15000 });
    const cellules = (await ligne.locator('td').allTextContents()).map((c) => c.replace(/\s+/g, ' ').trim());
    console.log('1152 · PS · cellules de la Liste :', JSON.stringify(cellules));
    expect(cellules, 'une cellule dit la note, 0 %').toContain('0 %');
    expect(cellules, 'une cellule dit le niveau, PS').toContain('PS');

    // Le PDF.
    await page.evaluate((DA) => window.travauxExportPDF.exporterDossierComplet(DA, 'P1152'), DA);
    await expect.poll(() => page.evaluate(() => window._pdf1152.length)).toBe(1);
    const pdf = await page.evaluate(() => window._feedback1152[window._feedback1152.length - 1]);
    expect([pdf.noteFinale, pdf.niveauFinal]).toEqual([0, 'PS']);
    expect(pdf.criteres.map((c) => c.code)).toEqual(criteres.map(() => 'PS'));
    // Ce que la Cartouche de départ donne à lire au niveau PS (aucun commentaire n'y est écrit pour ce code) :
    // relevé pour la demande de relecture, pas fixé ici — ces mots reviennent à Grégoire.
    console.log('1152 · PS · commentaires de la Cartouche de départ :', JSON.stringify(pdf.criteres.map((c) => c.comment)));
    expect(erreurs).toEqual([]);
});
