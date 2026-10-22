import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// LOT 2 · L'ANALYTIQUE SE SAISIT EN POINTS — le « fini quand », dans le VRAI flux Travaux
// (consigne du 3 septembre 2026, lots des trois types de grille).
//
//   « Grégoire ouvre une copie, saisit 24 sur un critère qui pèse 30, et lit 80 % en bas de
//   la palette. Un second critère holistique dans la même grille continue de se choisir au
//   menu, et le total tient compte des deux. »
//
// Et autour du geste : sans le second critère, la note se retient et le nomme (#674) ; un
// champ vidé retire les points ; hors bornes, la valeur est ramenée au poids ; Enregistrer
// écrit les points sous leur nom et la base relit le même pourcentage que l'écran (le témoin
// exigé par Cowork) ; rouvrir la copie remet les points dans leur champ.
//
// ⚠ EN PLAYWRIGHT parce que la chaîne réelle a DEUX emplacements pour l'évaluation en cours
// (#646) : le nom nu et `window.evaluationEnCours`. Le banc unitaire les confond ; celui-ci
// rejoue, fonction par fonction, la séquence de `travaux-ui.js` — comme le spec #674.

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
    selP.value = 'P2';
    selP.dispatchEvent(new Event('change', { bubbles: true }));
    await dormir(900);
    const selG = document.getElementById('selectGrille1');
    if (!selG.value) { selG.value = 'G2'; selG.dispatchEvent(new Event('change', { bubbles: true })); }
    const selEch = document.getElementById('selectEchelle1');
    if (!selEch.value) { selEch.value = 'E2'; selEch.dispatchEvent(new Event('change', { bubbles: true })); }
    // Comme preRemplirEvaluation (travaux-ui.js) : la copie est « importee » — le renderer avec
    // cartouche refuse d'evaluer un travail non recu. (Pas d'accent grave ici : gabarit.)
    const selR = document.getElementById('remiseProduction1');
    if (selR) { selR.value = 'importe'; if (typeof window.changerStatutRemise === 'function') window.changerStatutRemise(1); }
    const selC = document.getElementById('selectCartoucheEval');
    if (selC && Array.from(selC.options).some(o => o.value === 'CT2') && selC.value !== 'CT2') { selC.value = 'CT2'; selC.dispatchEvent(new Event('change', { bubbles: true })); }
    await dormir(400);
    return {
        renderer: document.querySelector('#listeCriteresGrille1 [id^="comm_"].u-hide') ? 'grille' : 'cartouche',
        cartouche: (document.getElementById('selectCartoucheEval') || {}).value,
        champPoints: !!document.getElementById('eval_pts_c2'),
        menuLangue: !!document.getElementById('eval_c2'),
        menuContenu: !!document.getElementById('eval_c1'),
        valeurPoints: (document.getElementById('eval_pts_c2') || {}).value,
        note: document.getElementById('noteProduction1').textContent,
        contenu: (document.getElementById('eval_c1') || {}).value
    };
}`;


// La palette flottante n'est pas visible sans la visionneuse : les gestes passent par le script,
// avec l'ÉVÉNEMENT que la frappe ou le menu émettent — c'est le dispatcher de main.js qui
// appelle `pointsSaisis` / `niveauSelectionne`, comme à la souris (patron du spec #674).
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

// Rouvrir une copie déjà évaluée : le restaurateur `verifierEtChargerEvaluationExistante`
// (evaluation.js) remet les niveaux par l'événement `change` et, depuis le lot 2, les points
// par l'événement `input` — le même chemin que la frappe. (`modifierEvaluationParId`, l'autre
// chemin, a besoin de la visionneuse déployée pour rendre les critères : hors de ce banc.)
const ROUVRIR_LA_COPIE = `async () => {
    const dormir = (ms) => new Promise(r => setTimeout(r, ms));
    const selE = document.getElementById('selectEtudiantEval');
    selE.value = '1234567';
    window.chargerEvaluationsEtudiant();
    const selP = document.getElementById('selectProduction1');
    selP.value = 'P2';
    selP.dispatchEvent(new Event('change', { bubbles: true }));
    await dormir(400);
    // Une reouverture repart d'une evaluation en cours NEUVE : celle d'ici porte encore
    // l'identifiant de modification de l'enregistrement, et le restaurateur se garde d'ecraser une
    // modification en cours. On lui rend le point de depart d'une reouverture. (Pas d'accent
    // grave dans ce commentaire : il vit dans un gabarit.)
    if (window.evaluationEnCours) delete window.evaluationEnCours.idModification;
    window.verifierEtChargerEvaluationExistante();
    await dormir(1200);
    return {
        valeurPoints: (document.getElementById('eval_pts_c2') || {}).value,
        contenu: (document.getElementById('eval_c1') || {}).value,
        note: document.getElementById('noteProduction1').textContent
    };
}`;

const LIRE_ECRAN = `() => ({
    note: document.getElementById('noteProduction1').textContent,
    niveau: document.getElementById('niveauProduction1').textContent,
    portee: document.getElementById('porteeNote1').textContent,
    points: document.getElementById('eval_pts_c2').value,
    copier: (document.getElementById('criteresCopier') || {}).textContent
})`;

for (const avecCartouche of [false, true]) {
test(`lot 2 · ${avecCartouche ? 'AVEC cartouche (renderer cartouche)' : 'sans cartouche (renderer grille)'} · 24 sur 30 → 80 % ; le holistique au menu ; la base relit l'écran ; la copie rouverte garde ses points`, async ({ page }) => {
    const erreurs = [];
    attacherCaptureErreurs(page, erreurs);
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(700);

    // 1. Le semis : un élève, une grille Contenu 70 (holistique) · Langue 30 (analytique), une
    //    échelle où M vaut 80, une production qui les désigne.
    const prep = await page.evaluate((avecCartouche) => {
        const k = (b) => (typeof cle === 'function' ? cle(b) : b);
        // security-ok: fixtures littérales du banc, aucune source externe.
        window.db.setSync('trimestres', [{ id: 'a2026', nom: 'Automne 2026', annee: 2026, session: 'A', actif: true }]);
        window.db.setSync('trimestreActif', 'a2026');
        window.db.setSync('groupeCoursActif', { id: 'GC1', trimestreId: 'a2026', nom: 'Groupe 00007' });
        // security-ok: fixture littérale du banc, aucune source externe.
        window.db.setSync(k('groupeEtudiants'), [{ da: '1234567', prenom: 'Daniel', nom: 'Témoin', groupe: '00007', groupeCoursId: 'GC1' }]);
        // security-ok: fixture littérale du banc, aucune source externe.
        window.db.setSync(k('grillesTemplates'), [{ id: 'G2', nom: 'Dissertation', type: 'holistique', criteres: [
            { id: 'c1', nom: 'Contenu', ponderation: 70, type: 'holistique', description: 'Le fond.' },
            { id: 'c2', nom: 'Langue', ponderation: 30, type: 'analytique', description: 'Imposé à 30 par la politique.' }
        ] }]);
        // security-ok: fixture littérale du banc, aucune source externe.
        window.db.setSync(k('echellesTemplates'), [{ id: 'E2', nom: 'IDME témoin', niveaux: [
            { code: 'I', nom: 'Insuffisant', min: 0, max: 54, valeurCalcul: 40 },
            { code: 'D', nom: 'En développement', min: 55, max: 74, valeurCalcul: 65 },
            { code: 'M', nom: 'Maîtrisé', min: 75, max: 89, valeurCalcul: 80 },
            { code: 'E', nom: 'Étendu', min: 90, max: 100, valeurCalcul: 95 }
        ] }]);
        // Avec cartouche : c'est l'autre renderer de la palette (`cartoucheSelectionnee`) — celui
        // des évaluations réelles de Grégoire — qui rend les critères.
        // security-ok: fixture littérale du banc, aucune source externe.
        window.db.setSync(k('cartouches_G2'), avecCartouche ? [{ id: 'CT2', nom: 'Cartouche témoin', grilleId: 'G2',
            criteres: [{ id: 'c1', nom: 'Contenu' }, { id: 'c2', nom: 'Langue' }],
            niveaux: [{ code: 'I', nom: 'Insuffisant' }, { code: 'D', nom: 'En développement' }, { code: 'M', nom: 'Maîtrisé' }, { code: 'E', nom: 'Étendu' }],
            commentaires: {} }] : []);
        // security-ok: fixture littérale du banc, aucune source externe.
        window.db.setSync(k('productions'), [{ id: 'P2', titre: 'Dissertation témoin', grilleId: 'G2', echelleId: 'E2', groupeCoursId: 'GC1', cartoucheId: avecCartouche ? 'CT2' : '' }]);
        window.db.setSync(k('evaluationsSauvegardees'), []);

        window.chargerListeEtudiantsEval();
        window.chargerGroupesEval();
        window.chargerProductionsDansSelect();
        window.chargerGrillesDansSelect();
        window.chargerEchellePerformance();
        const fichier = { id: 'F2', etudiantDA: '1234567', productionId: 'P2', nomFichier: 'copie.pdf' };
        return window.demarrerEvaluationDepuisFichier(fichier);
    }, avecCartouche);
    expect(prep).toBe('P2');
    await page.waitForTimeout(200);

    // 2. La copie s'ouvre : Langue a un champ de points, pas de menu ; Contenu garde son menu.
    const ouverture = await page.evaluate(eval(OUVRIR_LA_COPIE));
    console.log('OUVERTURE →', JSON.stringify(ouverture));
    expect(ouverture.cartouche, avecCartouche ? 'la cartouche est choisie' : 'aucune cartouche').toBe(avecCartouche ? 'CT2' : '');
    expect(ouverture.champPoints, 'le critère analytique rend un champ numérique').toBe(true);
    expect(ouverture.menuLangue, 'et pas un menu de niveaux').toBe(false);
    expect(ouverture.menuContenu, 'le critère holistique garde son menu').toBe(true);
    expect(ouverture.valeurPoints).toBe('');

    // 3. 24 sur 30, Contenu encore sans niveau : la note se retient et NOMME Contenu (#674).
    await saisirPoints(page, '24');
    await page.waitForTimeout(150);
    let ecran = await page.evaluate(eval(LIRE_ECRAN));
    console.log('24 SEUL →', JSON.stringify(ecran));
    expect(ecran.note).toBe('--');
    expect(ecran.portee).toContain('Contenu');
    expect(ecran.portee).toContain('70\u00A0%');

    // 4. LE « FINI QUAND » : Contenu à M (80) au menu → 0,8 × 70 + 24 = 80,0 %.
    await choisirContenu(page, 'M');
    await page.waitForTimeout(150);
    ecran = await page.evaluate(eval(LIRE_ECRAN));
    console.log('FINI QUAND →', JSON.stringify(ecran));
    expect(ecran.note).toBe('80\u00A0%');
    expect(ecran.niveau).toBe('M');
    expect(ecran.portee).toBe('');
    // (`#criteresCopier` n'existe pas dans la visionneuse ; la ligne à copier est jugée par la sentinelle unitaire.)

    // 5. Le total tient compte des deux : Contenu à E (95) → 66,5 + 24 = 90,5 %.
    await choisirContenu(page, 'E');
    await page.waitForTimeout(150);
    ecran = await page.evaluate(eval(LIRE_ECRAN));
    expect(ecran.note).toBe('90,5\u00A0%');

    // 6. Le champ vidé RETIRE les points : Langue redevient hors note, nommée avec son poids.
    await saisirPoints(page, '');
    await page.waitForTimeout(150);
    ecran = await page.evaluate(eval(LIRE_ECRAN));
    console.log('VIDÉ →', JSON.stringify(ecran));
    expect(ecran.note).toBe('--');
    expect(ecran.portee).toContain('Langue');
    expect(ecran.portee).toContain('30\u00A0%');

    // 7. Hors bornes : 40 sur 30 est ramené à 30, et le champ le montre → 66,5 + 30 = 96,5 %.
    await saisirPoints(page, '40');
    await page.waitForTimeout(150);
    ecran = await page.evaluate(eval(LIRE_ECRAN));
    console.log('40 → 30 →', JSON.stringify(ecran));
    expect(ecran.points).toBe('30');
    expect(ecran.note).toBe('96,5\u00A0%');

    // 8. Retour à 24, puis Enregistrer : les points sont en base SOUS LEUR NOM, et la base relit
    //    exactement le pourcentage de l'écran (le témoin exigé par la cartographie de Cowork).
    await saisirPoints(page, '24');
    await page.waitForTimeout(150);
    const apres = await page.evaluate(async () => {
        const notifs = [];
        const orig = window.notifications.erreur;
        window.notifications.erreur = (t, m) => { notifs.push({ t, m }); return orig.call(window.notifications, t, m); };
        window.sauvegarderEvaluation();
        await new Promise(r => setTimeout(r, 400));
        window.notifications.erreur = orig;
        const evals = window.db.getSync(cle('evaluationsSauvegardees'), []) || [];
        const e = evals[0];
        const grille = window.db.getSync(cle('grillesTemplates'), [])[0];
        const echelle = window.db.getSync(cle('echellesTemplates'), [])[0];
        const portee = e ? window.porteeDepuisEvaluation(e, grille, echelle.niveaux) : null;
        return {
            notifs, nb: evals.length,
            eval: e ? { noteFinale: e.noteFinale, ponderationCouverte: e.ponderationCouverte, verrouillee: e.verrouillee,
                        criteres: (e.criteres || []).map(c => c.critereId + ':' + c.niveauSelectionne),
                        pointsAnalytiques: e.pointsAnalytiques, algo: e.donneesAlgorithmiques } : null,
            portee: portee ? { couverte: portee.ponderationCouverte, incomplete: portee.incomplete,
                               langue: (portee.criteresComptes.find(c => c.critere.id === 'c2') || {}).valeur } : null
        };
    });
    console.log('BASE →', JSON.stringify(apres));
    expect(apres.notifs, 'aucun refus : la portée est complète').toEqual([]);
    expect(apres.nb).toBe(1);
    // Lot 3 (4 sept. 2026) — Langue ENTRE maintenant dans criteres[] avec son niveau déduit
    // (24 sur 30 = 80 % → M) : le lot 2 l'en laissait dehors « en attendant son niveau ».
    expect(apres.eval).toMatchObject({ noteFinale: 90.5, ponderationCouverte: 100, verrouillee: true,
                                       criteres: ['c1:E', 'c2:M'], pointsAnalytiques: { c2: 24 } });
    expect(apres.eval.algo, 'les points ne sont PAS logés dans donneesAlgorithmiques').toEqual({});
    expect(apres.portee).toEqual({ couverte: 100, incomplete: false, langue: 80 });

    // 9. Rouvrir la copie : les points reviennent dans leur champ, et la note avec eux.
    const rouverte = await page.evaluate(eval(ROUVRIR_LA_COPIE));
    console.log('ROUVERTE →', JSON.stringify(rouverte));
    expect(rouverte.contenu, 'le niveau du critère holistique revient').toBe('E');
    expect(rouverte.valeurPoints, 'les points reviennent dans leur champ').toBe('24');
    expect(rouverte.note).toBe('90,5\u00A0%');

    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});
}
