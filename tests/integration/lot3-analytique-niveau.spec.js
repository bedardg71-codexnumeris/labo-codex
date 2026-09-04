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
        ] }]);
        // security-ok: fixture littérale du banc, aucune source externe.
        window.db.setSync(k('cartouches_G3'), [{ id: 'CT3', nom: 'Cartouche témoin', grilleId: 'G3',
            criteres: [{ id: 'c1', nom: 'Contenu' }, { id: 'c2', nom: 'Langue' }],
            niveaux: [{ code: 'I', nom: 'Insuffisant' }, { code: 'D', nom: 'En développement' }, { code: 'M', nom: 'Maîtrisé' }, { code: 'E', nom: 'Étendu' }],
            commentaires: {
                c1_M: 'Ton propos est solide.', c1_E: 'Ton propos est remarquable.',
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

    // 6. Retour à 24, Contenu à M : 80,0 %, les deux rétroactions.
    await saisirPoints(page, '24');
    await choisirContenu(page, 'M');
    await page.waitForTimeout(150);
    ecran = await page.evaluate(eval(LIRE_ECRAN));
    expect(ecran.note).toBe('80.0 %');
    expect(ecran.niveau).toBe('M');
    expect(ecran.retro).toContain('Ton propos est solide.');
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
    expect(apres.eval).toMatchObject({ noteFinale: 80, ponderationCouverte: 100, verrouillee: true, pointsAnalytiques: { c2: 24 } });
    expect(apres.eval.criteres).toEqual([
        { id: 'c1', niveau: 'M', points: undefined, ponderation: 70, retro: 'Ton propos est solide.' },
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
    expect(rouverte.note).toBe('80.0 %');

    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});
