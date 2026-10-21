import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #699 (G-2 de l'audit du moteur, 5 septembre 2026) — L'AUTO-SAVE ÉCRIT CE QUE LE CALCUL A LU.
//
// #646 : `evaluationEnCours` désigne DEUX emplacements — le `let` de config.js (le nom nu),
// que `niveauSelectionne` écrit et que `calculerNote` lit, et `window.evaluationEnCours`, que
// le flux Travaux crée à part et que l'auto-save ET le bilan lisaient. À la réouverture d'une
// évaluation existante, `verifierEtChargerEvaluationExistante` remplit `window` depuis la base
// et rejoue les selects vers le nu : les deux portent les mêmes niveaux. Le premier changement
// les fait diverger.
//
// Mesuré au banc Node du 5 septembre (audit, mesures G2/G3) : après un niveau changé, l'auto-save
// écrivait la note NEUVE avec les critères ANCIENS, et le bilan nommait encore l'ancien défi.
//
// ⮕ CE BANC EST EN PLAYWRIGHT parce que la divergence n'existe que dans l'application telle
// qu'elle crée ses deux emplacements ; un bac à sable les confond. Il rejoue la séquence de
// `travaux-ui.js` (ouverture d'une copie déjà évaluée), change UN niveau, laisse l'auto-save
// écrire, et lit la base. Rouge avant le correctif (c3 = I sous une note de 95), vert après.

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i
];
const estErreurAttendue = (msg) => patternsAttendus.some((re) => re.test(msg));

function attacherCaptureErreurs(page, erreurs) {
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
    page.on('dialog', (d) => d.dismiss().catch(() => {}));
}

test('#699 · rouvrir une évaluation, changer UN niveau : l\'auto-save écrit la note ET les critères du calcul, et le bilan les lit aussi', async ({ page }) => {
    const erreurs = [];
    attacherCaptureErreurs(page, erreurs);
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(700);

    // 1. Le semis (celui de la spec #674), plus UNE évaluation existante en brouillon :
    //    c1 E · c2 E · c3 I → 84 %, non verrouillée (l'auto-save ne touche jamais une verrouillée).
    const prep = await page.evaluate(() => {
        const k = (b) => (typeof cle === 'function' ? cle(b) : b);
        // security-ok: fixtures littérales du banc, aucune source externe.
        window.db.setSync('trimestres', [{ id: 'a2026', nom: 'Automne 2026', annee: 2026, session: 'A', actif: true }]);
        // security-ok: fixture littérale du banc.
        window.db.setSync('trimestreActif', 'a2026');
        // security-ok: fixture littérale du banc.
        window.db.setSync('groupeCoursActif', { id: 'GC1', trimestreId: 'a2026', nom: 'Groupe 00007' });
        // security-ok: fixture littérale du banc.
        window.db.setSync(k('groupeEtudiants'), [{ da: '1234567', prenom: 'Daniel', nom: 'Témoin', groupe: '00007', groupeCoursId: 'GC1' }]);
        // security-ok: fixture littérale du banc.
        window.db.setSync(k('grillesTemplates'), [{ id: 'G699', nom: 'Grille témoin 50/30/20', criteres: [
            { id: 'c1', nom: 'Contenu', ponderation: 50, description: 'Le fond.' },
            { id: 'c2', nom: 'Organisation', ponderation: 30, description: 'La structure.' },
            { id: 'c3', nom: 'Langue', ponderation: 20, description: 'La forme.' }
        ] }]);
        // security-ok: fixture littérale du banc.
        window.db.setSync(k('echellesTemplates'), [{ id: 'E699', nom: 'IDME témoin', niveaux: [
            { code: 'I', nom: 'Insuffisant', min: 0, max: 54, valeurCalcul: 40 },
            { code: 'D', nom: 'En développement', min: 55, max: 74, valeurCalcul: 65 },
            { code: 'M', nom: 'Maîtrisé', min: 75, max: 89, valeurCalcul: 82 },
            { code: 'E', nom: 'Étendu', min: 90, max: 100, valeurCalcul: 95 }
        ] }]);
        // security-ok: fixture littérale du banc.
        window.db.setSync(k('productions'), [{ id: 'P699', titre: 'Portrait témoin', grilleId: 'G699', echelleId: 'E699', groupeCoursId: 'GC1' }]);
        // security-ok: fixture littérale du banc.
        window.db.setSync(k('evaluationsSauvegardees'), [{
            id: 'EV699', etudiantDA: '1234567', etudiantNom: 'Daniel Témoin', groupe: '00007', groupeCoursId: 'GC1',
            productionId: 'P699', productionNom: 'Portrait témoin', grilleId: 'G699', grilleNom: 'Grille témoin 50/30/20',
            echelleId: 'E699', cartoucheId: '', statutRemise: 'evalue', statutIntegrite: 'recevable',
            dateEvaluation: '2026-09-04T10:00:00.000Z', verrouillee: false,
            criteres: [
                { critereId: 'c1', critereNom: 'Contenu', niveauSelectionne: 'E', retroaction: '', ponderation: 50 },
                { critereId: 'c2', critereNom: 'Organisation', niveauSelectionne: 'E', retroaction: '', ponderation: 30 },
                { critereId: 'c3', critereNom: 'Langue', niveauSelectionne: 'I', retroaction: '', ponderation: 20 }
            ],
            noteFinale: 84, ponderationCouverte: 100, niveauFinal: 'M', retroactionFinale: '',
            donneesAlgorithmiques: {}, pointsAnalytiques: {}
        }]);

        // 2. La séquence de travaux-ui.js à l'ouverture d'une copie pour évaluation.
        window.chargerListeEtudiantsEval();
        window.chargerGroupesEval();
        window.chargerProductionsDansSelect();
        window.chargerGrillesDansSelect();
        window.chargerEchellePerformance();
        const fichier = { id: 'F699', etudiantDA: '1234567', productionId: 'P699', nomFichier: 'copie.pdf' };
        return { prodEff: window.demarrerEvaluationDepuisFichier(fichier) };
    });
    expect(prep.prodEff).toBe('P699');

    // 3. `preRemplirEvaluation` rejoué : l'évaluation existante est détectée et RESTAURÉE
    //    (window depuis la base, le nu par les selects rejoués).
    await page.waitForTimeout(200);
    const restaure = await page.evaluate(async () => {
        const dormir = (ms) => new Promise(r => setTimeout(r, ms));
        const selE = document.getElementById('selectEtudiantEval');
        selE.value = '1234567';
        window.chargerEvaluationsEtudiant();
        const selP = document.getElementById('selectProduction1');
        selP.value = 'P699';
        selP.dispatchEvent(new Event('change', { bubbles: true }));
        await dormir(2500);   // détection de l'existante, rendu des critères, rejeu des selects, fin de la suspension d'auto-save
        const v = (id) => (document.getElementById(id) || {}).value;
        const nu = (typeof evaluationEnCours !== 'undefined') ? evaluationEnCours : null;
        const w = window.evaluationEnCours;
        return {
            selects: { c1: v('eval_c1'), c2: v('eval_c2'), c3: v('eval_c3') },
            memeObjet: nu === w,
            critNu: nu ? Object.assign({}, nu.criteres) : null,
            critWindow: w ? Object.assign({}, w.criteres) : null,
            idModification: w ? w.idModification : null,
            note: document.getElementById('noteProduction1').textContent
        };
    });
    expect(restaure.selects, 'les trois niveaux enregistrés doivent être revenus dans les selects').toEqual({ c1: 'E', c2: 'E', c3: 'I' });
    expect(restaure.idModification, 'la réouverture doit désigner l\'existante').toBe('EV699');
    expect(restaure.note).toBe('84\u00A0%');
    test.info().annotations.push({
        type: '#646 · deux emplacements, après réouverture',
        description: `nu === window : ${restaure.memeObjet} · nu ${JSON.stringify(restaure.critNu)} · window ${JSON.stringify(restaure.critWindow)}`
    });

    // 4. LE GESTE : Langue passe de I à E (comme à la souris), puis l'auto-save écrit (1,5 s).
    const apres = await page.evaluate(async () => {
        const dormir = (ms) => new Promise(r => setTimeout(r, ms));
        const s = document.getElementById('eval_c3');
        s.value = 'E';
        window.niveauSelectionne('c3');
        const ecranNote = document.getElementById('noteProduction1').textContent;
        const ecranNiveau = document.getElementById('niveauProduction1').textContent;
        await dormir(2200);
        const nu = (typeof evaluationEnCours !== 'undefined') ? evaluationEnCours : null;
        const w = window.evaluationEnCours;
        const ev = (window.db.getSync(cle('evaluationsSauvegardees'), []) || []).find(e => e.id === 'EV699');
        // Le bilan, tel que l'enseignant·e l'ouvre (et le copie sous « === BILAN === »).
        window.basculerVueRetroaction('bilan');
        const bilan = (document.getElementById('contenuRetroBilan') || {}).textContent || '';
        return {
            ecranNote, ecranNiveau,
            critNu: nu ? Object.assign({}, nu.criteres) : null,
            critWindow: w ? Object.assign({}, w.criteres) : null,
            base: ev ? {
                noteFinale: ev.noteFinale, niveauFinal: ev.niveauFinal, ponderationCouverte: ev.ponderationCouverte, verrouillee: ev.verrouillee,
                c3: (ev.criteres.find(c => c.critereId === 'c3') || {}).niveauSelectionne
            } : null,
            bilan: bilan.replace(/\s+/g, ' ').trim()
        };
    });
    test.info().annotations.push({
        type: '#646 · après le changement',
        description: `nu ${JSON.stringify(apres.critNu)} · window ${JSON.stringify(apres.critWindow)} · base ${JSON.stringify(apres.base)}`
    });
    expect(apres.ecranNote, 'l\'écran du calcul').toBe('95\u00A0%');
    expect(apres.ecranNiveau).toBe('E');
    expect(apres.base, 'l\'auto-save doit avoir réécrit EV699').not.toBeNull();
    // ⚠ LE CŒUR DU BANC : la base doit porter la note ET les critères que le calcul a lus.
    expect(apres.base).toMatchObject({ noteFinale: 95, niveauFinal: 'E', ponderationCouverte: 100, verrouillee: false, c3: 'E' });
    // Et le bilan ne nomme plus Langue comme défi : c'est le même écran, la même source.
    expect(apres.bilan, 'le bilan lit la même source que le calcul').not.toContain('Langue (Insuffisant)');
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});
