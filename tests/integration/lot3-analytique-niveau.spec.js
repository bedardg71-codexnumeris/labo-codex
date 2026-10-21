import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// LOT 3 · LE CHIFFRE TROUVE SON NIVEAU, ET LE NIVEAU OUVRE LA CARTOUCHE — le « fini quand »,
// dans le VRAI flux Travaux (consigne du 3 septembre 2026 ; consigne du jour du 4 septembre).
//
//   « Grégoire attache une rétroaction de cartouche à un niveau, saisit une note chiffrée qui
//   tombe dans ce niveau, et la rétroaction apparaît — sans qu'il ait choisi de niveau nulle
//   part. » Et l'exigence ajoutée par la relecture croisée du lot 2 : le critère analytique
//   ENTRE dans `evaluation.criteres[]` en base, avec ses points et son niveau déduit ; le PDF
//   de l'élève liste ce critère avec son chiffre — « 24 / 30 » — et rien d'autre.
//
// ⚠ EN PLAYWRIGHT pour la même raison que le lot 2 : la chaîne réelle a DEUX emplacements pour
// l'évaluation en cours (#646), et la cartouche s'ouvre par le dispatcher de main.js, comme à
// la souris. Ce spec rejoue la séquence de `travaux-ui.js`, fonction par fonction.

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

const OUVRIR_LA_COPIE = `async () => {
    const dormir = (ms) => new Promise(r => setTimeout(r, ms));
    const selE = document.getElementById('selectEtudiantEval');
    selE.value = '1234567';
    window.chargerEvaluationsEtudiant();
    const selP = document.getElementById('selectProduction1');
    selP.value = 'P3';
    selP.dispatchEvent(new Event('change', { bubbles: true }));
    await dormir(900);
    const selG = document.getElementById('selectGrille1');
    if (!selG.value) { selG.value = 'G3'; selG.dispatchEvent(new Event('change', { bubbles: true })); }
    const selEch = document.getElementById('selectEchelle1');
    if (!selEch.value) { selEch.value = 'E3'; selEch.dispatchEvent(new Event('change', { bubbles: true })); }
    const selR = document.getElementById('remiseProduction1');
    if (selR) { selR.value = 'importe'; if (typeof window.changerStatutRemise === 'function') window.changerStatutRemise(1); }
    const selC = document.getElementById('selectCartoucheEval');
    if (selC && Array.from(selC.options).some(o => o.value === 'CT3') && selC.value !== 'CT3') { selC.value = 'CT3'; selC.dispatchEvent(new Event('change', { bubbles: true })); }
    await dormir(400);
    return {
        cartouche: (document.getElementById('selectCartoucheEval') || {}).value,
        champPoints: !!document.getElementById('eval_pts_c2'),
        menuLangue: !!document.getElementById('eval_c2'),
        retro: (document.getElementById('retroactionFinale1') || {}).value
    };
}`;

const saisirPoints = (page, valeur) => page.evaluate((v) => {
    const champ = document.getElementById('eval_pts_c2');
    champ.value = v;
    champ.dispatchEvent(new Event('input', { bubbles: true }));
}, valeur);
const choisirContenu = (page, code) => page.evaluate((c) => {
    const menu = document.getElementById('eval_c1');
    menu.value = c;
    menu.dispatchEvent(new Event('change', { bubbles: true }));
}, code);

const LIRE_ECRAN = `() => ({
    note: document.getElementById('noteProduction1').textContent,
    niveau: document.getElementById('niveauProduction1').textContent,
    portee: document.getElementById('porteeNote1').textContent,
    niveauLangue: ((typeof evaluationEnCours !== 'undefined' && evaluationEnCours && evaluationEnCours.criteres) || {}).c2,   // le nom NU : c'est là que le calcul écrit (#646)
    commLangue: (document.getElementById('comm_c2') || {}).textContent,
    retro: (document.getElementById('retroactionFinale1') || {}).value
})`;

const ROUVRIR_LA_COPIE = `async () => {
    const dormir = (ms) => new Promise(r => setTimeout(r, ms));
    const selE = document.getElementById('selectEtudiantEval');
    selE.value = '1234567';
    window.chargerEvaluationsEtudiant();
    const selP = document.getElementById('selectProduction1');
    selP.value = 'P3';
    selP.dispatchEvent(new Event('change', { bubbles: true }));
    await dormir(400);
    if (window.evaluationEnCours) delete window.evaluationEnCours.idModification;
    window.verifierEtChargerEvaluationExistante();
    await dormir(1200);
    return {
        valeurPoints: (document.getElementById('eval_pts_c2') || {}).value,
        niveauLangue: ((typeof evaluationEnCours !== 'undefined' && evaluationEnCours && evaluationEnCours.criteres) || {}).c2,   // le nom NU : c'est là que le calcul écrit (#646)
        commLangue: (document.getElementById('comm_c2') || {}).textContent,
        retro: (document.getElementById('retroactionFinale1') || {}).value,
        note: document.getElementById('noteProduction1').textContent
    };
}`;

test('lot 3 · 24 sur 30 ouvre la cartouche de M sans choisir de niveau ; le critère entre en base avec ses points et son niveau ; le PDF dit 24 / 30', async ({ page }) => {
    const erreurs = [];
    attacherCaptureErreurs(page, erreurs);
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(700);

    // 1. Le semis : la grille du lot 2 (Contenu 70 holistique · Langue 30 analytique), une échelle
    //    à plages, et une cartouche qui attache une rétroaction à chaque niveau de Langue.
    const prep = await page.evaluate(() => {
        const k = (b) => (typeof cle === 'function' ? cle(b) : b);
        // security-ok: fixtures littérales du banc, aucune source externe.
        window.db.setSync('trimestres', [{ id: 'a2026', nom: 'Automne 2026', annee: 2026, session: 'A', actif: true }]);
        window.db.setSync('trimestreActif', 'a2026');
        window.db.setSync('groupeCoursActif', { id: 'GC1', trimestreId: 'a2026', nom: 'Groupe 00007' });
        // security-ok: fixture littérale du banc, aucune source externe.
        window.db.setSync(k('groupeEtudiants'), [{ da: '1234567', prenom: 'Daniel', nom: 'Témoin', groupe: '00007', groupeCoursId: 'GC1' }]);
        // security-ok: fixture littérale du banc, aucune source externe.
        window.db.setSync(k('grillesTemplates'), [{ id: 'G3', nom: 'Dissertation', type: 'holistique', criteres: [
            { id: 'c1', nom: 'Contenu', ponderation: 70, type: 'holistique', description: 'Le fond.' },
            { id: 'c2', nom: 'Langue', ponderation: 30, type: 'analytique', description: 'Imposé à 30 par la politique.' }
        ] }]);
        // security-ok: fixture littérale du banc, aucune source externe.
        window.db.setSync(k('echellesTemplates'), [{ id: 'E3', nom: 'IDME témoin', niveaux: [
            { code: 'I', nom: 'Insuffisant', min: 0, max: 54, valeurCalcul: 40, couleur: '#aa0000' },
            { code: 'D', nom: 'En développement', min: 55, max: 74, valeurCalcul: 65, couleur: '#aa8800' },
            { code: 'M', nom: 'Maîtrisé', min: 75, max: 89, valeurCalcul: 80, couleur: '#00aa00' },
            { code: 'E', nom: 'Étendu', min: 90, max: 100, valeurCalcul: 95, couleur: '#0000aa' }
        ], seuilSuffisance: 'D', seuilMaitrise: 'M' }]);   // les repères : le bilan range D en « signalé », M en « acquis »
        // security-ok: fixture littérale du banc, aucune source externe.
        window.db.setSync(k('cartouches_G3'), [{ id: 'CT3', nom: 'Cartouche témoin', grilleId: 'G3',
            criteres: [{ id: 'c1', nom: 'Contenu' }, { id: 'c2', nom: 'Langue' }],
            niveaux: [{ code: 'I', nom: 'Insuffisant' }, { code: 'D', nom: 'En développement' }, { code: 'M', nom: 'Maîtrisé' }, { code: 'E', nom: 'Étendu' }],
            commentaires: {
                c1_D: 'Ton propos se construit.', c1_M: 'Ton propos est solide.', c1_E: 'Ton propos est remarquable.',
                c2_I: 'La langue nuit à la lecture.', c2_D: 'La langue se travaille encore.',
                c2_M: 'Ta langue est maîtrisée.', c2_E: 'Ta langue est irréprochable.'
            } }]);
        // security-ok: fixture littérale du banc, aucune source externe.
        window.db.setSync(k('productions'), [{ id: 'P3', titre: 'Dissertation témoin', grilleId: 'G3', echelleId: 'E3', groupeCoursId: 'GC1', cartoucheId: 'CT3' }]);
        window.db.setSync(k('evaluationsSauvegardees'), []);

        window.chargerListeEtudiantsEval();
        window.chargerGroupesEval();
        window.chargerProductionsDansSelect();
        window.chargerGrillesDansSelect();
        window.chargerEchellePerformance();
        const fichier = { id: 'F3', etudiantDA: '1234567', productionId: 'P3', nomFichier: 'copie.pdf' };
        return window.demarrerEvaluationDepuisFichier(fichier);
    });
    expect(prep).toBe('P3');
    await page.waitForTimeout(200);

    // 2. La copie s'ouvre avec la cartouche ; Langue a son champ de points, aucun menu.
    const ouverture = await page.evaluate(eval(OUVRIR_LA_COPIE));
    console.log('OUVERTURE →', JSON.stringify(ouverture));
    expect(ouverture.cartouche).toBe('CT3');
    expect(ouverture.champPoints).toBe(true);
    expect(ouverture.menuLangue).toBe(false);
    expect(ouverture.retro || '').not.toContain('Ta langue est maîtrisée.');

    // 3. LE « FINI QUAND » : 24 → 80 % → M, et la rétroaction attachée à M apparaît, sans menu.
    await saisirPoints(page, '24');
    await page.waitForTimeout(150);
    let ecran = await page.evaluate(eval(LIRE_ECRAN));
    console.log('24 →', JSON.stringify({ ...ecran, retro: (ecran.retro || '').slice(0, 200) }));
    expect(ecran.niveauLangue, 'le niveau déduit est entré dans l\'évaluation en cours').toBe('M');
    expect(ecran.commLangue).toBe('Ta langue est maîtrisée.');
    expect(ecran.retro).toContain('Ta langue est maîtrisée.');
    // Ce que l'élève lit : le chiffre, pas le niveau.
    expect(ecran.retro).toContain('Critère 2 (Langue) — 24 / 30');
    expect(ecran.retro).not.toContain('(Langue) — M');

    // 4. Un autre chiffre trouve un autre niveau : 20 sur 30 (66,7 %) → D.
    await saisirPoints(page, '20');
    await page.waitForTimeout(150);
    ecran = await page.evaluate(eval(LIRE_ECRAN));
    expect(ecran.niveauLangue).toBe('D');
    expect(ecran.retro).toContain('La langue se travaille encore.');
    expect(ecran.retro).not.toContain('Ta langue est maîtrisée.');

    // 5. Le champ VIDÉ retire le niveau avec les points : plus de rétroaction de Langue.
    await saisirPoints(page, '');
    await page.waitForTimeout(150);
    ecran = await page.evaluate(eval(LIRE_ECRAN));
    console.log('VIDÉ →', JSON.stringify({ ...ecran, retro: (ecran.retro || '').slice(0, 120) }));
    expect(ecran.niveauLangue).toBeUndefined();
    expect(ecran.retro).not.toContain('La langue se travaille encore.');
    expect(ecran.retro).not.toContain('(Langue)');

    // 6. Retour à 24, Contenu à D (65) : 45,5 + 24 = 69,5 %, les deux rétroactions.
    //    (D plutôt que M pour que le bilan de l'étape 9 ait quelque chose à dire : Contenu en
    //    « acquis en développement », Langue en force.)
    await saisirPoints(page, '24');
    await choisirContenu(page, 'D');
    await page.waitForTimeout(150);
    ecran = await page.evaluate(eval(LIRE_ECRAN));
    expect(ecran.note).toBe('69,5\u00A0%');
    expect(ecran.niveau).toBe('D');
    expect(ecran.retro).toContain('Ton propos se construit.');
    expect(ecran.retro).toContain('Ta langue est maîtrisée.');

    // 7. Enregistrer : Langue ENTRE dans criteres[] avec son niveau déduit ET ses points ; la
    //    source des points reste `pointsAnalytiques` ; et le PDF de l'élève dit « 24 / 30 ».
    const apres = await page.evaluate(async () => {
        const notifs = [];
        const orig = window.notifications.erreur;
        window.notifications.erreur = (t, m) => { notifs.push({ t, m }); return orig.call(window.notifications, t, m); };
        window.sauvegarderEvaluation();
        await new Promise(r => setTimeout(r, 400));
        window.notifications.erreur = orig;
        const evals = window.db.getSync(cle('evaluationsSauvegardees'), []) || [];
        const e = evals[0];
        let pdf = null;
        if (e && window.syntheseRetroactionData && window.syntheseRetroactionRendu) {
            const fb = window.syntheseRetroactionData.construireFeedback(e, { id: 'F3', etudiantDA: '1234567', productionId: 'P3' }, null);
            const html = window.syntheseRetroactionRendu.rendreSyntheseHTML(fb);
            pdf = {
                pointsLangue: (fb.criteria.find(c => c.key === 'c2') || {}).points,
                commentaireLangue: (fb.criteria.find(c => c.key === 'c2') || {}).comment,
                ditLeChiffre: html.includes('24 / 30'),
                casesEchelle: (html.match(/flex: 1; height: 18px;[^>]*>[IDME]<\/div>/g) || []).length,
                ditTrentePourcent: html.includes('30%')
            };
        }
        return {
            notifs, nb: evals.length,
            eval: e ? { noteFinale: e.noteFinale, ponderationCouverte: e.ponderationCouverte, verrouillee: e.verrouillee,
                        criteres: (e.criteres || []).map(c => ({ id: c.critereId, niveau: c.niveauSelectionne, points: c.points, ponderation: c.ponderation, retro: c.retroaction })),
                        pointsAnalytiques: e.pointsAnalytiques } : null,
            pdf
        };
    });
    console.log('BASE →', JSON.stringify(apres));
    expect(apres.notifs).toEqual([]);
    expect(apres.nb).toBe(1);
    expect(apres.eval).toMatchObject({ noteFinale: 69.5, ponderationCouverte: 100, verrouillee: true, pointsAnalytiques: { c2: 24 } });
    expect(apres.eval.criteres).toEqual([
        { id: 'c1', niveau: 'D', points: undefined, ponderation: 70, retro: 'Ton propos se construit.' },
        { id: 'c2', niveau: 'M', points: 24, ponderation: 30, retro: 'Ta langue est maîtrisée.' }
    ]);
    expect(apres.pdf, 'les modules de synthèse sont chargés dans la page').not.toBeNull();
    expect(apres.pdf).toEqual({ pointsLangue: 24, commentaireLangue: 'Ta langue est maîtrisée.', ditLeChiffre: true, casesEchelle: 4, ditTrentePourcent: false });

    // 8. Rouvrir la copie : les points reviennent, le niveau se redéduit, la cartouche se rouvre.
    const rouverte = await page.evaluate(eval(ROUVRIR_LA_COPIE));
    console.log('ROUVERTE →', JSON.stringify({ ...rouverte, retro: (rouverte.retro || '').slice(0, 160) }));
    expect(rouverte.valeurPoints).toBe('24');
    expect(rouverte.niveauLangue).toBe('M');
    expect(rouverte.commLangue).toBe('Ta langue est maîtrisée.');
    expect(rouverte.retro).toContain('Ta langue est maîtrisée.');
    expect(rouverte.note).toBe('69,5\u00A0%');

    // 9. LE BILAN (retouche du 4 sept., décision de Grégoire) : copié sous « === BILAN === » dans ce
    //    que l'élève reçoit, il nomme le critère analytique par son chiffre — « Langue (24 / 30) » —
    //    et le holistique par le nom de son niveau. Il lit `window.evaluationEnCours`, que la
    //    réouverture vient de remplir depuis la base (niveaux ET points).
    const leBilan = await page.evaluate(() => {
        window.basculerVueRetroaction('bilan');
        const c = document.getElementById('contenuRetroBilan');
        return c ? c.textContent : null;
    });
    console.log('BILAN →', JSON.stringify(leBilan));
    expect(leBilan).not.toBeNull();
    expect(leBilan).toContain('Ta force : Langue (24 / 30)');
    expect(leBilan).toContain('Contenu (En développement)');
    expect(leBilan).not.toContain('Langue (Maîtrisé)');

    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

// ---------------------------------------------------------------------------------------------
// SECONDE RETOUCHE (§6 de la consigne du jour, 4 sept. 2026, après le coup d'œil de Grégoire) :
// sur une grille ENTIÈREMENT analytique, le PDF de l'élève ne porte plus aucun nom de niveau dans
// son bilan (défis, acquis en développement, force), ni la légende « I · D · M · E » de la section
// « Rétroaction par critère ». Et le champ de points vide montre « – », pas « 0 ».
// C'est le témoin que la première retouche n'avait pas : Grégoire l'a vu sur sa grille « Analyse
// littéraire » (12 critères analytiques).

const saisir = (page, critereId, valeur) => page.evaluate(([id, v]) => {
    const champ = document.getElementById('eval_pts_' + id);
    champ.value = v;
    champ.dispatchEvent(new Event('input', { bubbles: true }));
}, [critereId, valeur]);

test('lot 3 · grille entièrement analytique : le PDF ne nomme aucun niveau (bilan et légende), et le champ vide dit « – »', async ({ page }) => {
    const erreurs = [];
    attacherCaptureErreurs(page, erreurs);
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(700);

    // 1. Le semis : trois critères analytiques (50 · 30 · 20), une échelle avec ses repères, pas de cartouche.
    const prep = await page.evaluate(() => {
        const k = (b) => (typeof cle === 'function' ? cle(b) : b);
        // security-ok: fixtures littérales du banc, aucune source externe.
        window.db.setSync('trimestres', [{ id: 'a2026', nom: 'Automne 2026', annee: 2026, session: 'A', actif: true }]);
        window.db.setSync('trimestreActif', 'a2026');
        window.db.setSync('groupeCoursActif', { id: 'GC1', trimestreId: 'a2026', nom: 'Groupe 00007' });
        // security-ok: fixture littérale du banc, aucune source externe.
        window.db.setSync(k('groupeEtudiants'), [{ da: '1234567', prenom: 'Daniel', nom: 'Témoin', groupe: '00007', groupeCoursId: 'GC1' }]);
        // security-ok: fixture littérale du banc, aucune source externe.
        window.db.setSync(k('grillesTemplates'), [{ id: 'G4', nom: 'Analyse littéraire', type: 'analytique', criteres: [
            { id: 'a1', nom: 'Sujet amené', ponderation: 50, type: 'analytique' },
            { id: 'a2', nom: 'Sujet posé', ponderation: 30, type: 'analytique' },
            { id: 'a3', nom: 'Sujet divisé', ponderation: 20, type: 'analytique', description: 'Pertinent et clair' }
        ] }]);
        // security-ok: fixture littérale du banc, aucune source externe.
        window.db.setSync(k('echellesTemplates'), [{ id: 'E4', nom: 'IDME témoin', niveaux: [
            { code: 'I', nom: 'Insuffisant', min: 0, max: 54, valeurCalcul: 40, couleur: '#aa0000' },
            { code: 'D', nom: 'En développement', min: 55, max: 74, valeurCalcul: 65, couleur: '#aa8800' },
            { code: 'M', nom: 'Maîtrisé', min: 75, max: 89, valeurCalcul: 80, couleur: '#00aa00' },
            { code: 'E', nom: 'Étendu', min: 90, max: 100, valeurCalcul: 95, couleur: '#0000aa' }
        ], seuilSuffisance: 'D', seuilMaitrise: 'M' }]);
        window.db.setSync(k('cartouches_G4'), []);
        // security-ok: fixture littérale du banc, aucune source externe.
        window.db.setSync(k('productions'), [{ id: 'P4', titre: 'Analyse témoin', grilleId: 'G4', echelleId: 'E4', groupeCoursId: 'GC1', cartoucheId: '' }]);
        window.db.setSync(k('evaluationsSauvegardees'), []);
        window.chargerListeEtudiantsEval();
        window.chargerGroupesEval();
        window.chargerProductionsDansSelect();
        window.chargerGrillesDansSelect();
        window.chargerEchellePerformance();
        return window.demarrerEvaluationDepuisFichier({ id: 'F4', etudiantDA: '1234567', productionId: 'P4', nomFichier: 'analyse.pdf' });
    });
    expect(prep).toBe('P4');
    await page.waitForTimeout(200);

    // 2. Ouvrir la copie (même séquence que le premier test, sur P4 / G4 / E4).
    const ouverture = await page.evaluate(async () => {
        const dormir = (ms) => new Promise(r => setTimeout(r, ms));
        const selE = document.getElementById('selectEtudiantEval');
        selE.value = '1234567';
        window.chargerEvaluationsEtudiant();
        const selP = document.getElementById('selectProduction1');
        selP.value = 'P4';
        selP.dispatchEvent(new Event('change', { bubbles: true }));
        await dormir(900);
        const selG = document.getElementById('selectGrille1');
        if (!selG.value) { selG.value = 'G4'; selG.dispatchEvent(new Event('change', { bubbles: true })); }
        const selEch = document.getElementById('selectEchelle1');
        if (!selEch.value) { selEch.value = 'E4'; selEch.dispatchEvent(new Event('change', { bubbles: true })); }
        const selR = document.getElementById('remiseProduction1');
        if (selR) { selR.value = 'importe'; if (typeof window.changerStatutRemise === 'function') window.changerStatutRemise(1); }
        await dormir(400);
        return {
            champs: ['a1', 'a2', 'a3'].map(id => !!document.getElementById('eval_pts_' + id)),
            placeholders: ['a1', 'a2', 'a3'].map(id => (document.getElementById('eval_pts_' + id) || {}).placeholder),
            valeurs: ['a1', 'a2', 'a3'].map(id => (document.getElementById('eval_pts_' + id) || {}).value)
        };
    });
    console.log('OUVERTURE →', JSON.stringify(ouverture));
    expect(ouverture.champs).toEqual([true, true, true]);
    // (d) Le champ vide ne ressemble pas à un zéro : « – », et aucune valeur.
    expect(ouverture.placeholders).toEqual(['–', '–', '–']);
    expect(ouverture.valeurs).toEqual(['', '', '']);

    // 3. 50 / 50 (E), 20 / 30 (D), 8 / 20 (I) → 78,0 % ; Enregistrer.
    await saisir(page, 'a1', '50');
    await saisir(page, 'a2', '20');
    await saisir(page, 'a3', '8');
    await page.waitForTimeout(150);
    const note = await page.evaluate(() => document.getElementById('noteProduction1').textContent);
    expect(note).toBe('78\u00A0%');

    const apres = await page.evaluate(async () => {
        const notifs = [];
        const orig = window.notifications.erreur;
        window.notifications.erreur = (t, m) => { notifs.push({ t, m }); return orig.call(window.notifications, t, m); };
        window.sauvegarderEvaluation();
        await new Promise(r => setTimeout(r, 400));
        window.notifications.erreur = orig;
        const evals = window.db.getSync(cle('evaluationsSauvegardees'), []) || [];
        const e = evals[0];
        if (!e) return { notifs, nb: evals.length };
        const fb = window.syntheseRetroactionData.construireFeedback(e, { id: 'F4', etudiantDA: '1234567', productionId: 'P4' }, null);
        const html = window.syntheseRetroactionRendu.rendreSyntheseHTML(fb);
        // La section des critères et le bilan, SANS le bandeau du niveau GÉNÉRAL (celui de la copie,
        // « M · Maîtrisé », qui reste : l'arrêté 4 porte sur le critère analytique, pas sur la note).
        const debut = html.indexOf('Rétroaction par critère');
        const corps = (debut === -1 ? '' : html.slice(debut))
            .replace(/<section[^>]*>(?:(?!<\/section>)[\s\S])*Niveau général(?:(?!<\/section>)[\s\S])*<\/section>/, '');
        return {
            notifs, nb: evals.length,
            criteres: (e.criteres || []).map(c => c.critereId + ':' + c.niveauSelectionne + ':' + c.points),
            priorites: fb.bilan.concentration.priorites,
            signales: fb.bilan.concentration.signales,
            force: fb.bilan.recurrents.force,
            legende: /<\/b> Insuffisant/.test(html),
            chiffres: ['50 / 50', '20 / 30', '8 / 20'].map(t => html.includes(t)),
            libellesDansLeCorps: ['Insuffisant', 'En développement', 'Maîtrisé', 'Étendu'].filter(l => corps.includes(l))
        };
    });
    console.log('PDF →', JSON.stringify(apres));
    expect(apres.notifs).toEqual([]);
    expect(apres.nb).toBe(1);
    expect(apres.criteres).toEqual(['a1:E:50', 'a2:D:20', 'a3:I:8']);
    // (a) Le bilan du PDF, aux trois endroits : le chiffre, jamais le nom du niveau déduit.
    // #941 lot S2 (D2, 24 sept. 2026) — ATTENTES CHANGÉES, C'EST VOULU : une copie en points se lit à 60 %,
    // même sous une échelle à repères (décision A). Sujet divisé à 40 % reste prioritaire ; Sujet posé (66,7 %,
    // niveau déduit D) n'est plus « à consolider » ; « Ta force » (Sujet amené, 100 %, E) reste vide — 60 %
    // dit où commence l'échec, pas où commence l'acquis. Avant : signales ['Sujet posé (20 / 30)'] et
    // force 'Ta force : Sujet amené (50 / 50)'.
    expect(apres.priorites).toEqual(['Sujet divisé (8 / 20) : Pertinent et clair']);   // #940 : « Nom (niveau) : définition »
    expect(apres.signales).toEqual([]);
    expect(apres.force).toBe('');
    expect(apres.chiffres).toEqual([true, true, true]);
    // (b) Aucune légende d'échelle, et aucun libellé de niveau de la section des critères à la fin.
    expect(apres.legende).toBe(false);
    expect(apres.libellesDansLeCorps).toEqual([]);

    // 4. ROUVRIR LA COPIE ENREGISTRÉE par le chemin que Grégoire a pris (`modifierEvaluationParId`,
    //    troisième retouche, §7) : avant, l'attente du premier critère cherchait un menu de niveaux
    //    que le critère analytique n'a pas → « Impossible de charger l'évaluation : Timeout
    //    génération selects critères », et le cadenas n'apparaissait jamais.
    const rouverte = await page.evaluate(async () => {
        const dormir = (ms) => new Promise(r => setTimeout(r, ms));
        const refus = []; const succes = [];
        const origErreur = window.notifications.erreur; const origSucces = window.notifications.succes;
        window.notifications.erreur = (t, m) => { refus.push(t + ' — ' + m); return origErreur.call(window.notifications, t, m); };
        window.notifications.succes = (m) => { succes.push(String(m)); return origSucces.call(window.notifications, m); };
        // Repartir d'un formulaire vierge, comme au retour dans « Annoter et évaluer ».
        document.getElementById('listeCriteresGrille1').innerHTML = '';
        const e = (window.db.getSync(cle('evaluationsSauvegardees'), []) || [])[0];
        window.modifierEvaluationParId(e.id);
        await dormir(3800);   // 200 ms de mise en place + les attentes de la séquence + 200 ms de recalcul
        window.notifications.erreur = origErreur; window.notifications.succes = origSucces;
        window.basculerVueRetroaction('bilan');
        return {
            refus, succes,
            valeurs: ['a1', 'a2', 'a3'].map(id => (document.getElementById('eval_pts_' + id) || {}).value),
            verrouilles: ['a1', 'a2', 'a3'].map(id => (document.getElementById('eval_pts_' + id) || {}).disabled),
            indicateur: !!document.getElementById('indicateurModeModification'),
            note: document.getElementById('noteProduction1').textContent,
            pointsWindow: window.evaluationEnCours && window.evaluationEnCours.pointsAnalytiques,
            bilan: (document.getElementById('contenuRetroBilan') || {}).textContent
        };
    });
    console.log('ROUVERTE →', JSON.stringify({ ...rouverte, bilan: (rouverte.bilan || '').slice(0, 160) }));
    expect(rouverte.refus, 'aucun bandeau « Impossible de charger l\'évaluation »').toEqual([]);
    expect(rouverte.succes.some(m => m.includes('lecture seule'))).toBe(true);
    expect(rouverte.valeurs, 'les points sont revenus dans leurs champs').toEqual(['50', '20', '8']);
    expect(rouverte.note).toBe('78\u00A0%');
    expect(rouverte.verrouilles, 'le verrouillage a bien été appliqué (étape 14) : les champs de points sont désactivés').toEqual([true, true, true]);
    // (L'indicateur orange de l'étape 13 s'insère dans un conteneur que ce banc sans visionneuse
    // n'a pas : la notification « lecture seule (verrouillée) », émise juste après, prouve que les
    // étapes 13-14 ont tourné — c'est ce que le timeout empêchait.)
    expect(rouverte.pointsWindow).toEqual({ a1: 50, a2: 20, a3: 8 });
    // #941 lot S2 (D2) — attente changée, c'est voulu : plus de « Ta force » pour une copie en points
    // (avant : 'Ta force : Sujet amené (50 / 50)') ; le bilan rouvert nomme la priorité par son chiffre.
    expect(rouverte.bilan).toContain('Sujet divisé (8 / 20) : Pertinent et clair');
    expect(rouverte.bilan).not.toContain('Ta force');
    expect(rouverte.bilan).not.toContain('Étendu');

    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});
