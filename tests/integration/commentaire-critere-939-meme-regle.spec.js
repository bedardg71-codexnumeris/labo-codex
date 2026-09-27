import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #939 (24 sept. 2026) — LE COMMENTAIRE D'UN CRITÈRE, DANS LA VRAIE PAGE : celui qui est enregistré
// avec l'évaluation, pas la cartouche d'aujourd'hui (décision de Grégoire).
//
// Une copie évaluée le 15 sept., dont la cartouche a été retouchée depuis (c1_M), et dont un critère
// porte en base le « [Non défini] » que l'écran enregistrait (c2). On rouvre la copie en mode Évaluer
// (`evaluerProduction` → `verifierEtChargerEvaluationExistante`, qui restaure les niveaux AVANT de poser
// `idModification`), on refait écrire la générale, on copie ; on enregistre ; on recopie. Attendu, avant
// ET après l'enregistrement : le commentaire d'alors, jamais la cartouche retouchée, jamais « [Non défini] ».
//
// Copie de banc : `recupererBlob` enveloppé (PNG d'un pixel), comme aux bancs #868, #911, #760.
// Aucun `page.click` : `el.click()` et `change` scriptés. Noms fictifs (règle 6).

const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const T = 't939';
const ENREGISTRE = "ENREGISTRÉ c1_M : ton propos tient, d'un bout à l'autre.";
const RETOUCHEE = "RETOUCHÉE c1_M : la cartouche d'aujourd'hui.";

async function monter(page) {
    const erreurs = [];
    page.on('console', (m) => { if (m.type() === 'error') erreurs.push(m.text()); });
    page.on('pageerror', (e) => erreurs.push(`pageerror: ${e.message}`));
    page.on('dialog', (d) => { erreurs.push(`dialogue: ${d.message()}`); d.dismiss().catch(() => {}); });
    await page.goto(indexHtml);
    await page.waitForFunction(() => typeof window.db !== 'undefined' && window.travauxUI && window.travauxStockage
        && typeof window.evaluerProduction === 'function');
    await page.evaluate(({ png, T, ENREGISTRE, RETOUCHEE }) => {
        // security-ok: fixtures littérales du banc, aucune source externe.
        const coursId = 'cours-939';
        const grille = { id: 'G939', nom: 'Grille témoin', type: 'holistique', criteres: [
            { id: 'c1', nom: 'Contenu', ponderation: 60, type: 'holistique' },
            { id: 'c2', nom: 'Structure', ponderation: 40, type: 'holistique' }
        ] };
        const echelle = { id: 'E939', nom: 'IDME témoin', niveaux: [
            { code: 'I', nom: 'Insuffisant', min: 0, max: 54, valeurCalcul: 40 },
            { code: 'D', nom: 'En développement', min: 55, max: 74, valeurCalcul: 65 },
            { code: 'M', nom: 'Maîtrisé', min: 75, max: 89, valeurCalcul: 80 },
            { code: 'E', nom: 'Étendu', min: 90, max: 100, valeurCalcul: 95 }
        ] };
        window.db.setSync('trimestres', [{ id: T, nom: 'Trimestre témoin', annee: 2026, session: 'A', actif: true }]);
        window.db.setSync('cours', [{ id: coursId, codeCours: 'FRA101', titre: 'Écriture et littérature' }]);
        window.db.setSync(T + '_groupesCours', [{ id: 'GC939', trimestreId: T, coursId, groupeNum: '01', pratiqueId: 'sommative', actif: true }]);
        window.db.setSync(T + '_groupeEtudiants', [{ da: 'TEST939', nom: 'Fictif', prenom: 'Élève', groupe: '01', coursId, groupeCoursId: 'GC939' }]);
        window.db.setSync(T + '_productions', [{ id: 'p939', titre: 'Analyse', type: 'travail', ponderation: 100, grilleId: 'G939', echelleId: 'E939', groupeCoursId: 'GC939' }]);
        window.db.setSync(T + '_grillesTemplates', [grille]);
        window.db.setSync(T + '_echellesTemplates', [echelle]);
        // La cartouche d'AUJOURD'HUI : c1_M retouché depuis l'évaluation, rien pour c2_D.
        window.db.setSync(T + '_cartouches_G939', [{ id: 'CT939', nom: 'Cartouche témoin', grilleId: 'G939', contexte: '', criteres: [{ id: 'c1', nom: 'Contenu' }, { id: 'c2', nom: 'Structure' }],
            commentaires: { c1_M: RETOUCHEE, c1_E: 'VIVANTE c1_E' } }]);
        // L'évaluation du 15 sept., telle que les collecteurs l'ont écrite.
        window.db.setSync(T + '_evaluationsSauvegardees', [{
            id: 'EV939', etudiantDA: 'TEST939', productionId: 'p939', groupeCoursId: 'GC939',
            grilleId: 'G939', echelleId: 'E939', cartoucheId: 'CT939', statutRemise: 'evalue',
            dateEvaluation: '2026-09-15T08:00:00.000Z', noteFinale: 74, niveauFinal: 'D', verrouillee: false,
            criteres: [
                { critereId: 'c1', critereNom: 'Contenu', niveauSelectionne: 'M', ponderation: 60, retroaction: ENREGISTRE },
                { critereId: 'c2', critereNom: 'Structure', niveauSelectionne: 'D', ponderation: 40, retroaction: '[Non défini]' }
            ],
            // #961 R2 — une évaluation d'après D7, qui suit les niveaux : sans la clé, le niveau changé
            // de `regenererEtCopier` poserait la question du stock au lieu de régénérer.
            retroactionReecrite: false,
            retroactionFinale: 'Voici quelques observations :\n\nCritère 1 (Contenu) — M\n' + ENREGISTRE
        }]);
        window.db.setSync(T + '_fichiersTravaux', [{
            id: 'FT939', etudiantDA: 'TEST939', productionId: 'p939', coursId, groupeCoursId: 'GC939',
            nomFichier: 'FICTIF_TEST939_Analyse.png', typeMIME: 'image/png', tailleFichier: 70, nombrePages: 1,
            stockage: 'indexeddb', thumbnailDataUrl: '', dateImport: '2026-09-01T12:00:00.000Z', dateModification: '2026-09-01T12:00:00.000Z',
            source: 'import-local', importePar: 'single', statut: 'present'
        }]);

        window.trimestreActif = T;
        window.db.setSync('trimestreActif', T);
        window.db.setSync('infoCours', { id: coursId, codeCours: 'FRA101', groupe: '01', _groupeCoursId: 'GC939' });
        window.db.setSync('groupeCoursActif', { id: 'GC939', trimestreId: T });

        const octets = Uint8Array.from(atob(png), (c) => c.charCodeAt(0));
        const copie = new Blob([octets], { type: 'image/png' });
        const original = window.travauxStockage.recupererBlob;
        window.travauxStockage.recupererBlob = async function (id) { return id === 'FT939' ? copie : original.apply(this, arguments); };

        window._presse939 = [];
        Object.defineProperty(navigator, 'clipboard', { configurable: true,
            value: { writeText: (t) => { window._presse939.push(t); return Promise.resolve(); } } });
    }, { png: PNG, T, ENREGISTRE, RETOUCHEE });
    return erreurs;
}

/** Refait écrire la générale par le geste de l'écran (un niveau re-choisi), puis « Copier tout ». */
async function regenererEtCopier(page) {
    const avant = await page.evaluate(() => window._presse939.length);
    await page.evaluate(() => {
        const s = document.getElementById('eval_c2');
        s.value = 'D';
        s.dispatchEvent(new Event('change', { bubbles: true }));
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent === 'Copier tout');
        btn.click();
    });
    await page.waitForFunction((n) => window._presse939.length > n, avant, { timeout: 10000 });
    return page.evaluate(() => window._presse939[window._presse939.length - 1]);
}

function generale(copie) {
    return copie.split('=== RÉTROACTION SPÉCIFIQUE ===')[0];
}

test('#939 · copie rouverte, cartouche retouchée depuis : « Copier tout » livre le commentaire enregistré, avant et après l\'enregistrement', async ({ page }) => {
    const erreurs = await monter(page);
    await page.evaluate(() => window.evaluerProduction('TEST939', 'p939'));
    // La restauration est finie quand l'identifiant est posé (il l'est APRÈS les niveaux).
    await page.waitForFunction(() => {
        const ec = window.evaluationEnCours;
        return ec && ec.idModification === 'EV939' && document.getElementById('eval_c1')?.value === 'M'
            && !!document.getElementById('retroactionFinale1');
    }, null, { timeout: 15000 });

    // Ce que l'écran a posé dans le div que les collecteurs enregistrent.
    const divs = await page.evaluate(() => ({
        c1: document.getElementById('comm_c1').textContent.trim(),
        c2: document.getElementById('comm_c2').textContent.trim()
    }));
    expect(divs.c1, 'avant : la cartouche retouchée remplaçait le commentaire d\'alors').toBe(ENREGISTRE);
    expect(divs.c2).toBe('');

    // AVANT l'enregistrement.
    const avant = generale(await regenererEtCopier(page));
    expect(avant).toContain('Critère 1 (Contenu) — M\n' + ENREGISTRE);
    expect(avant).toContain('Critère 2 (Structure) — D\n\n');
    expect(avant).not.toContain('RETOUCHÉE');
    expect(avant).not.toContain('[Non défini]');

    // L'ENREGISTREMENT, puis ce que la base garde.
    await page.evaluate(() => window.sauvegarderEvaluationModifiee());
    await page.waitForFunction((T) => {
        const ev = (window.db.getSync(T + '_evaluationsSauvegardees', []) || []).find(e => e.id === 'EV939');
        return ev && ev.criteres.find(c => c.critereId === 'c2')?.retroaction !== '[Non défini]';
    }, T, { timeout: 10000 });
    const enBase = await page.evaluate((T) => {
        const ev = window.db.getSync(T + '_evaluationsSauvegardees', []).find(e => e.id === 'EV939');
        return Object.fromEntries(ev.criteres.map(c => [c.critereId, c.retroaction]));
    }, T);
    expect(enBase.c1).toBe(ENREGISTRE);
    expect(enBase.c2).toBe('');

    // APRÈS l'enregistrement.
    const apres = generale(await regenererEtCopier(page));
    expect(apres).toContain('Critère 1 (Contenu) — M\n' + ENREGISTRE);
    expect(apres).not.toContain('RETOUCHÉE');
    expect(apres).not.toContain('[Non défini]');

    expect(erreurs.filter((m) => !/favicon|ERR_FILE_NOT_FOUND/.test(m))).toEqual([]);
});
