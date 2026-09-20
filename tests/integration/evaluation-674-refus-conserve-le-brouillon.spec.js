import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #674 (énoncé 5) — LE REFUS D'ENREGISTRER CONSERVE LE BROUILLON, dans le VRAI flux.
//
// Le 2 septembre 2026 à 17 h 53, Grégoire a fait le geste prévu : ouvrir une copie
// (Annoter et évaluer), laisser un critère sans niveau, cliquer Enregistrer. Le refus
// s'est affiché — puis la copie est restée « Importé », et l'export Léa a rendu
// « Aucune évaluation trouvée ». Un second correctif a fait écrire le brouillon par
// l'auto-save au moment du refus ; à 18 h 04, capture à l'appui : INCHANGÉ.
//
// ⚠ CE QUE LES BANCS UNITAIRES NE POUVAIENT PAS VOIR. Ils posent `evaluationEnCours`
// UNE fois, et le donnent au bac à sable à la fois comme nom nu et comme propriété de
// `window`. Dans l'application, ce sont DEUX emplacements (#646, constat du 31 août) :
// `config.js` déclare `let evaluationEnCours`, qui ne crée aucune propriété sur
// `window`. Le flux Travaux pose `window.evaluationEnCours` (demarrerEvaluationDepuisFichier)
// puis le nom nu (chargerEvaluationsEtudiant) : deux objets. Le choix d'un niveau écrit
// dans le nu (`niveauSelectionne`) ; l'auto-save lit `window` — et n'y trouve aucun
// critère. Il rend la main sans écrire, en silence.
//
// ⮕ CE BANC EST EN PLAYWRIGHT PARCE QU'IL JUGE LA CHAÎNE RÉELLE, avec les deux
// emplacements tels que l'application les crée — pas un bac à sable qui les confond.
// Il rejoue, fonction par fonction, la séquence de `travaux-ui.js` (ouverture d'une
// copie pour évaluation), puis le geste de Grégoire.

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

test('#674 · Annoter et évaluer — un critère sans niveau, Enregistrer refusé : le BROUILLON est en base, la copie reste exportable', async ({ page }) => {
    const erreurs = [];
    attacherCaptureErreurs(page, erreurs);
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(700);

    // 1. Le semis : un trimestre, un groupe-cours, un élève, une grille 50/30/20, une
    //    échelle à valeurs ponctuelles, une production qui les désigne. Espace vide sinon.
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
        window.db.setSync(k('grillesTemplates'), [{ id: 'G674', nom: 'Grille témoin 50/30/20', criteres: [
            { id: 'c1', nom: 'Contenu', ponderation: 50, description: 'Le fond.' },
            { id: 'c2', nom: 'Organisation', ponderation: 30, description: 'La structure.' },
            { id: 'c3', nom: 'Langue', ponderation: 20, description: 'La forme.' }
        ] }]);
        // security-ok: fixture littérale du banc.
        window.db.setSync(k('echellesTemplates'), [{ id: 'E674', nom: 'IDME témoin', niveaux: [
            { code: 'I', nom: 'Insuffisant', min: 0, max: 54, valeurCalcul: 40 },
            { code: 'D', nom: 'En développement', min: 55, max: 74, valeurCalcul: 65 },
            { code: 'M', nom: 'Maîtrisé', min: 75, max: 89, valeurCalcul: 82 },
            { code: 'E', nom: 'Étendu', min: 90, max: 100, valeurCalcul: 95 }
        ] }]);
        // security-ok: fixture littérale du banc.
        window.db.setSync(k('productions'), [{ id: 'P674', titre: 'Portrait témoin', grilleId: 'G674', echelleId: 'E674', groupeCoursId: 'GC1' }]);
        // security-ok: fixture littérale du banc.
        window.db.setSync(k('evaluationsSauvegardees'), []);

        // 2. La séquence de travaux-ui.js à l'ouverture d'une copie pour évaluation.
        window.chargerListeEtudiantsEval();
        window.chargerGroupesEval();
        window.chargerProductionsDansSelect();
        window.chargerGrillesDansSelect();
        window.chargerEchellePerformance();
        const fichier = { id: 'F674', etudiantDA: '1234567', productionId: 'P674', nomFichier: 'copie.pdf' };
        const prodEff = window.demarrerEvaluationDepuisFichier(fichier);
        const opts = (id) => Array.from((document.getElementById(id) || { options: [] }).options).map(o => o.value);
        return { prodEff, optEtud: opts('selectEtudiantEval'), optProd: opts('selectProduction1'), optGrille: opts('selectGrille1'), optEch: opts('selectEchelle1') };
    });
    expect(prep.prodEff).toBe('P674');
    expect(prep.optEtud, 'l\'élève doit être offert par la liste (sinon le banc ne rejoue pas le flux réel)').toContain('1234567');
    expect(prep.optProd).toContain('P674');
    expect(prep.optGrille).toContain('G674');
    expect(prep.optEch).toContain('E674');

    // 3. `preRemplirEvaluation` (travaux-ui, asynchrone) — rejoué pas à pas, puis le geste.
    await page.waitForTimeout(200);
    const etat = await page.evaluate(async () => {
        const dormir = (ms) => new Promise(r => setTimeout(r, ms));
        const selE = document.getElementById('selectEtudiantEval');
        selE.value = '1234567';
        window.chargerEvaluationsEtudiant();
        const selP = document.getElementById('selectProduction1');
        selP.value = 'P674';
        selP.dispatchEvent(new Event('change', { bubbles: true }));
        await dormir(900);   // suspension de l'auto-save (500 ms) + relais de la cartouche

        // Si le modèle de la production n'a pas posé grille et échelle, l'enseignant les choisit.
        const selG = document.getElementById('selectGrille1');
        if (!selG.value) { selG.value = 'G674'; selG.dispatchEvent(new Event('change', { bubbles: true })); }
        const selEch = document.getElementById('selectEchelle1');
        if (!selEch.value) { selEch.value = 'E674'; selEch.dispatchEvent(new Event('change', { bubbles: true })); }
        await dormir(300);

        // Les niveaux, comme à la souris : deux critères sur trois. Langue reste sans niveau.
        const choisir = (id, code) => {
            const s = document.getElementById('eval_' + id);
            if (!s) return false;
            s.value = code;
            window.niveauSelectionne(id);
            return true;
        };
        const ok1 = choisir('c1', 'E');
        const ok2 = choisir('c2', 'E');

        const nu = (typeof evaluationEnCours !== 'undefined') ? evaluationEnCours : null;
        const w = window.evaluationEnCours;
        const nb = () => (window.db.getSync(cle('evaluationsSauvegardees'), []) || []).length;
        const avantDebounce = nb();
        await dormir(2200);   // au-delà du débounce de l'auto-save (1,5 s)
        return {
            ok1, ok2,
            memeObjet: nu === w,
            critNu: nu ? Object.keys(nu.criteres || {}) : null,
            critWindow: w ? Object.keys(w.criteres || {}) : null,
            note: document.getElementById('noteProduction1').textContent,
            portee: document.getElementById('porteeNote1').textContent,
            avantDebounce, apresDebounce: nb()
        };
    });
    expect(etat.ok1 && etat.ok2, 'les critères doivent être rendus à l\'écran').toBe(true);
    expect(etat.note, 'l\'écran retient la note').toBe('--');
    expect(etat.portee).toContain('Langue');
    // Le constat #646, mesuré ici pour le rapport, sans le juger : ce n'est pas l'objet du banc.
    test.info().annotations.push({
        type: '#646 · deux emplacements',
        description: `nu === window : ${etat.memeObjet} · critères nu ${JSON.stringify(etat.critNu)} · critères window ${JSON.stringify(etat.critWindow)} · brouillons écrits par l'auto-save débouncé : ${etat.apresDebounce}`
    });

    // 4. LE GESTE DE GRÉGOIRE : Enregistrer, avec Langue sans niveau.
    const apres = await page.evaluate(async () => {
        const notifs = [];
        const orig = window.notifications.erreur;
        window.notifications.erreur = (t, m) => { notifs.push({ t, m }); return orig.call(window.notifications, t, m); };
        window.sauvegarderEvaluation();
        await new Promise(r => setTimeout(r, 300));
        window.notifications.erreur = orig;
        const evals = window.db.getSync(cle('evaluationsSauvegardees'), []) || [];
        return {
            notifs,
            evals: evals.map(e => ({
                etudiantDA: e.etudiantDA, productionId: e.productionId, grilleId: e.grilleId,
                noteFinale: e.noteFinale, ponderationCouverte: e.ponderationCouverte,
                verrouillee: e.verrouillee, nbCriteres: (e.criteres || []).length
            }))
        };
    });
    expect(apres.notifs.map(n => n.t)).toEqual(['Évaluation incomplète']);
    expect(apres.notifs[0].m).toContain('l\'évaluation n\'est pas enregistrée');
    // ⚠ LE CŒUR DU BANC : ce que le refus laisse en base. Zéro = le travail n'est nulle part,
    // la copie reste « Importé », l'export Léa ne trouve rien (17 h 53, 18 h 04).
    expect(apres.evals, 'le refus doit conserver UN brouillon en base').toHaveLength(1);
    expect(apres.evals[0]).toMatchObject({
        etudiantDA: '1234567', productionId: 'P674', grilleId: 'G674',
        noteFinale: 95, ponderationCouverte: 80, verrouillee: false, nbCriteres: 2
    });
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});
