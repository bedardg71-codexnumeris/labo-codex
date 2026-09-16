import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// PORTE #652 (16 septembre 2026) — UNE ÉVALUATION DONT LE PREMIER CRITÈRE A QUITTÉ SA GRILLE S'OUVRE, LE SIGNALE, LE GARDE.
//
// Rapport de Grégoire, 31 août 2026, 13 h 57 (1.106.13) : « Timeout génération selects critères » alors que
// `listeCriteresGrille1` contenait des cartes. L'attente guette `eval_<criteres[0].critereId>` ; chaque carte
// rendue porte son `eval_<id>`. Hypothèse : le premier critère ENREGISTRÉ n'est plus parmi les critères RENDUS.
//
// Deux renderers : avec cartouche (itère `cartouche.criteres`), sans (itère `grille.criteres`). On sonde les deux,
// plus un témoin où le premier critère est bien dans la grille. Aucune donnée réelle lue ni écrite.
//
// AVANT le correctif (mesuré le 16 sept. sur 1.142.15, les deux renderers) : cartes c1 et c2 rendues, niveaux
// null, notification « erreur: Erreur de chargement ». Arrêté par Grégoire le même jour : CONSERVER et
// SIGNALER le critère sorti de la grille — les collecteurs de `criteres[]` parcouraient la grille et
// l'auraient effacé à la première réécriture.

async function monter(page, { avecCartouche, premierCritere }) {
    const erreurs = [];
    page.on('console', (m) => { if (m.type() === 'error') erreurs.push(m.text()); });
    page.on('pageerror', (e) => erreurs.push(`pageerror: ${e.message}`));
    await page.goto(indexHtml);
    await page.waitForFunction(() => typeof window.modifierEvaluationParId === 'function' && typeof window.db !== 'undefined'
        && typeof window.afficherCriteresDepuisGrille === 'function');
    await page.evaluate(({ avecCartouche, premierCritere }) => {
        const k = (b) => window.cle(b);
        // security-ok: fixtures littérales du banc, aucune source externe.
        window.db.setSync('trimestres', [{ id: 'a2026', nom: 'Automne 2026', annee: 2026, session: 'A', actif: true }]);
        window.db.setSync('trimestreActif', 'a2026');
        window.db.setSync('groupeCoursActif', { id: 'GC1', trimestreId: 'a2026', nom: 'Groupe 00007' });
        window.db.setSync(k('groupeEtudiants'), [{ da: '1234567', prenom: 'Daniel', nom: 'Témoin', groupe: '00007', groupeCoursId: 'GC1' }]);
        // La grille ACTUELLE : c1 et c2. Un critère `c0` y figurait quand l'évaluation a été faite ; il a été retiré.
        window.db.setSync(k('grillesTemplates'), [{ id: 'G652', nom: 'Grille témoin', type: 'holistique', criteres: [
            { id: 'c1', nom: 'Contenu', ponderation: 60, type: 'holistique' },
            { id: 'c2', nom: 'Structure', ponderation: 40, type: 'holistique' }
        ] }]);
        window.db.setSync(k('echellesTemplates'), [{ id: 'E652', nom: 'IDME témoin', niveaux: [
            { code: 'I', nom: 'Insuffisant', min: 0, max: 54, valeurCalcul: 40 },
            { code: 'D', nom: 'En développement', min: 55, max: 74, valeurCalcul: 65 },
            { code: 'M', nom: 'Maîtrisé', min: 75, max: 89, valeurCalcul: 80 },
            { code: 'E', nom: 'Étendu', min: 90, max: 100, valeurCalcul: 95 }
        ] }]);
        window.db.setSync(k('cartouches_G652'), avecCartouche ? [{ id: 'CT652', nom: 'Cartouche témoin', grilleId: 'G652',
            criteres: [{ id: 'c1', nom: 'Contenu' }, { id: 'c2', nom: 'Structure' }],
            niveaux: [{ code: 'I', nom: 'Insuffisant' }, { code: 'D', nom: 'En développement' }, { code: 'M', nom: 'Maîtrisé' }, { code: 'E', nom: 'Étendu' }],
            commentaires: {} }] : []);
        window.db.setSync(k('productions'), [{ id: 'P652', titre: 'Analyse témoin', grilleId: 'G652', echelleId: 'E652', groupeCoursId: 'GC1', cartoucheId: avecCartouche ? 'CT652' : '' }]);
        const criteres = [
            { critereId: 'c1', niveauSelectionne: 'M' },
            { critereId: 'c2', niveauSelectionne: 'D' }
        ];
        if (premierCritere === 'c0') criteres.unshift({ critereId: 'c0', critereNom: 'Ancien critère', niveauSelectionne: 'E', ponderation: 20 });
        window.db.setSync(k('evaluationsSauvegardees'), [{
            id: 'EVAL652', etudiantDA: '1234567', productionId: 'P652', grilleId: 'G652', echelleId: 'E652',
            cartoucheId: avecCartouche ? 'CT652' : '', statutRemise: 'remis', statutIntegrite: 'recevable',
            criteres, noteFinale: 74, dateEvaluation: '2026-08-20T12:00:00.000Z', verrouillee: false
        }]);
        window.chargerListeEtudiantsEval();
        window.chargerGroupesEval();
        window.chargerProductionsDansSelect();
        window.chargerGrillesDansSelect();
        window.chargerEchellePerformance();
    }, { avecCartouche, premierCritere });
    return erreurs;
}

/** Ouvre l'évaluation et laisse passer l'attente (3 s) et ses suites. */
async function ouvrir(page) {
    await page.evaluate(() => {
        // Les deux issues du chargement se disent par une notification : succès (étapes 13-14) ou erreur (`catch`).
        window._notif652 = [];
        const n = window.notifications;
        ['succes', 'erreur'].forEach((type) => {
            const orig = n[type];
            n[type] = function (titre) { window._notif652.push(`${type}: ${titre}`); return orig.apply(this, arguments); };
        });
        window.modifierEvaluationParId('EVAL652');
    });
    await page.evaluate(() => new Promise((r) => setTimeout(r, 4500)));
    return page.evaluate(() => ({
        cartesRendues: [...document.querySelectorAll('#listeCriteresGrille1 [id^="eval_"]')].map((el) => el.id).filter((id) => /^eval_c\d$/.test(id)),
        niveauC1: (document.getElementById('eval_c1') || {}).value || null,
        niveauC2: (document.getElementById('eval_c2') || {}).value || null,
        notifications: window._notif652,
        avis: (document.getElementById('avisCriteresHorsGrille') || {}).textContent || null,
        criteresEnBase: window.db.getSync(window.cle('evaluationsSauvegardees'), [])[0].criteres.map((c) => `${c.critereId}:${c.niveauSelectionne}`),
        chargementEnCours: !!window._modifierEvaluationEnCours
    }));
}

for (const avecCartouche of [false, true]) {
    const renderer = avecCartouche ? 'renderer cartouche' : 'renderer grille';

    test(`Porte #652 · ${renderer} · témoin : premier critère dans la grille → l'évaluation s'ouvre, niveaux restaurés`, async ({ page }) => {
        const erreurs = await monter(page, { avecCartouche, premierCritere: 'c1' });
        const etat = await ouvrir(page);
        expect(etat).toEqual({ cartesRendues: ['eval_c1', 'eval_c2'], niveauC1: 'M', niveauC2: 'D', notifications: ['succes: Évaluation chargée - Tu peux maintenant la modifier'], chargementEnCours: false,
            avis: null, criteresEnBase: ['c1:M', 'c2:D'] });
        expect(erreurs.filter((m) => /Timeout|Impossible de charger/.test(m))).toEqual([]);
    });

    test(`Porte #652 · ${renderer} · premier critère retiré de la grille → l'évaluation s'ouvre quand même, niveaux des critères présents restaurés`, async ({ page }) => {
        const erreurs = await monter(page, { avecCartouche, premierCritere: 'c0' });
        const etat = await ouvrir(page);
        // AVANT : niveaux null, « erreur: Erreur de chargement », pas d'avis.
        expect(etat).toEqual({ cartesRendues: ['eval_c1', 'eval_c2'], niveauC1: 'M', niveauC2: 'D', notifications: ['succes: Évaluation chargée - Tu peux maintenant la modifier'], chargementEnCours: false,
            avis: 'Un critère évalué n\'est plus dans la grilleAncien critère (E)L\'évaluation garde ce qui a été enregistré. La note se recalcule sur la grille actuelle dès que tu modifies cette copie.',
            criteresEnBase: ['c0:E', 'c1:M', 'c2:D'] });
        expect(erreurs.filter((m) => /Timeout|Impossible de charger/.test(m))).toEqual([]);
    });

    test(`Porte #652 · ${renderer} · modifier un niveau après l'ouverture : l'auto-save garde le critère sorti de la grille`, async ({ page }) => {
        await monter(page, { avecCartouche, premierCritere: 'c0' });
        await ouvrir(page);
        await page.evaluate(() => {
            const menu = document.getElementById('eval_c1');
            menu.value = 'E';
            menu.dispatchEvent(new Event('change', { bubbles: true }));
        });
        // Débounce de l'auto-save : 1,5 s.
        await page.waitForFunction(() => window.db.getSync(window.cle('evaluationsSauvegardees'), [])[0].criteres
            .some((c) => c.critereId === 'c1' && c.niveauSelectionne === 'E'), null, { timeout: 10000 });
        const enBase = await page.evaluate(() => window.db.getSync(window.cle('evaluationsSauvegardees'), [])[0].criteres.map((c) => `${c.critereId}:${c.niveauSelectionne}`));
        // SANS la garde des collecteurs : ['c1:E', 'c2:D'] — `c0` effacé en silence.
        expect(enBase).toEqual(['c1:E', 'c2:D', 'c0:E']);
    });
}
