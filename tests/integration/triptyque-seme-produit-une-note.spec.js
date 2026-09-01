import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// §1 et §2 du PLAN-2026-09-01 — LA PORTE DU NOUVEL ENSEIGNANT.
//
// La question que ce banc pose est la seule qui compte pour la cohorte 1 :
// **avec ce que l'application sème toute seule, et sans rien créer, une première
// évaluation produit-elle une NOTE ?**
//
// Avant le 1er septembre, la réponse était non, de deux façons : aucune échelle
// n'était semée (#574 avait retiré la seule qui l'était), et les huit échelles
// « disciplinaires » de la bibliothèque — le recours naturel — n'avaient pas de
// `valeurCalcul` et rendaient 0,0 % sans un mot.
//
// ⚠ CE BANC EST EN PLAYWRIGHT PARCE QU'IL JUGE UNE CHAÎNE, pas une fonction :
// semis → sélection → rendu des critères → calcul → affichage. Chaque maillon a
// déjà été rompu séparément dans ce dépôt.

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

async function poserUnTrimestreEtSemer(page) {
    return page.evaluate(async () => {
        // security-ok: fixtures littérales du banc, aucune source externe.
        window.db.setSync('trimestres', [{ id: 'a2026', nom: 'Automne 2026', annee: 2026, session: 'A', actif: true }]);
        // security-ok: fixtures littérales du banc, aucune source externe.
        window.db.setSync('trimestreActif', 'a2026');
        // Repartir d'un espace VIDE : c'est la situation du nouvel enseignant.
        // security-ok: fixtures littérales du banc, aucune source externe.
        window.db.setSync('a2026_echellesTemplates', []);
        // security-ok: fixtures littérales du banc, aucune source externe.
        window.db.setSync('a2026_grillesTemplates', []);

        if (typeof window.assurerEchelleIdmeDeDepart !== 'function') {
            return { erreur: 'window.assurerEchelleIdmeDeDepart absent — le semis du §2 n\'est pas livré' };
        }
        if (typeof window.assurerGrilleGenerique !== 'function') {
            return { erreur: 'window.assurerGrilleGenerique absent' };
        }
        await window.assurerGrilleGenerique();
        await window.assurerEchelleIdmeDeDepart();
        return {
            echelles: (window.db.getSync('a2026_echellesTemplates', []) || []).map(e => ({
                id: e.id, nom: e.nom,
                niveaux: (e.niveaux || []).length,
                niveauxMuets: (e.niveaux || []).filter(n => n.valeurCalcul == null
                    || String(n.valeurCalcul).trim() === '' || isNaN(Number(n.valeurCalcul))).length
            })),
            grilles: (window.db.getSync('a2026_grillesTemplates', []) || []).map(g => ({ id: g.id, criteres: (g.criteres || []).length }))
        };
    });
}

test('§2 · un espace vide reçoit une échelle SEMÉE, et tous ses niveaux savent calculer', async ({ page }) => {
    const erreurs = [];
    attacherCaptureErreurs(page, erreurs);
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(700);

    const r = await poserUnTrimestreEtSemer(page);

    expect(r.erreur, `Erreur : ${r.erreur}`).toBeUndefined();
    expect(r.echelles.map(e => e.id), 'aucune échelle semée — le trou du §2 est revenu').toEqual(['ECHELLE_IDME_DEPART']);
    expect(r.echelles[0].niveaux).toBe(4);
    // LA condition de #574 : une échelle semée qui ne calcule pas est pire que
    // pas d'échelle du tout, parce qu'elle rend 0,0 % au lieu de « -- ».
    expect(r.echelles[0].niveauxMuets, 'des niveaux semés sans `valeurCalcul`').toBe(0);
    expect(r.grilles.map(g => g.id)).toEqual(['GRILLE_GENERIQUE']);
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

test('§1+§2 · BOUT EN BOUT — sans rien créer, une première évaluation produit une VRAIE note', async ({ page }) => {
    const erreurs = [];
    attacherCaptureErreurs(page, erreurs);
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(700);

    const prep = await poserUnTrimestreEtSemer(page);
    expect(prep.erreur, `Erreur : ${prep.erreur}`).toBeUndefined();

    const r = await page.evaluate(() => {
        const grille = window.db.getSync('a2026_grillesTemplates', [])[0];
        const echelle = window.db.getSync('a2026_echellesTemplates', [])[0];

        // Les lecteurs du calcul lisent la clé du trimestre ACTIF via `cle()`.
        evaluationEnCours = { grilleId: grille.id, echelleId: echelle.id, criteres: {} };
        window.evaluationEnCours = evaluationEnCours;
        const selEch = document.getElementById('selectEchelle1');
        if (selEch) selEch.value = echelle.id;

        window.afficherCriteresDepuisGrille(grille.id, echelle.id);
        // L'enseignant coche « Maîtrisé » partout — le geste le plus banal.
        grille.criteres.forEach(c => { evaluationEnCours.criteres[c.id] = 'M'; });
        window.calculerNote();

        return {
            nbCriteres: grille.criteres.length,
            note: document.getElementById('noteProduction1').textContent,
            niveau: document.getElementById('niveauProduction1').textContent,
            noteCalculee: window.noteCalculeeCourante,
            valeurM: (echelle.niveaux.find(n => n.code === 'M') || {}).valeurCalcul
        };
    });

    expect(r.nbCriteres, 'la grille générique porte quatre critères').toBe(4);
    // ⚠ LE CŒUR DU BANC. « 0.0 % » est ce que rendait une échelle sans
    // `valeurCalcul` : un CHIFFRE qui se lit comme un résultat. On exige donc la
    // valeur exacte du niveau coché, pas seulement « quelque chose de non nul ».
    expect(r.noteCalculee, 'la note ne vaut pas la valeur ponctuelle de « M »').toBe(r.valeurM);
    expect(r.note).toBe(r.valeurM.toFixed(1) + ' %');
    expect(r.niveau, 'le niveau global doit être nommé, pas « -- »').toBe('M');
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

test('§1 · TÉMOIN NÉGATIF — la même chaîne sur une échelle SANS `valeurCalcul` rend 0,0 % muet', async ({ page }) => {
    const erreurs = [];
    attacherCaptureErreurs(page, erreurs);
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(700);

    await poserUnTrimestreEtSemer(page);

    const r = await page.evaluate(() => {
        const grille = window.db.getSync('a2026_grillesTemplates', [])[0];
        // La forme EXACTE des huit échelles disciplinaires retirées le 1er sept. :
        // `valeur:` et jamais `valeurCalcul:`.
        const echelleCassee = {
            id: 'ECHELLE_TEMOIN_VALEUR',
            nom: 'Témoin — niveaux en `valeur`',
            niveaux: [
                { code: 'I', nom: 'Incomplet', min: 0, max: 54, valeur: 40 },
                { code: 'M', nom: 'Maîtrisé', min: 75, max: 89, valeur: 82 }
            ]
        };
        // security-ok: fixture littérale du banc, aucune source externe.
        window.db.setSync('a2026_echellesTemplates', [echelleCassee]);

        evaluationEnCours = { grilleId: grille.id, echelleId: echelleCassee.id, criteres: {} };
        window.evaluationEnCours = evaluationEnCours;
        const selEch = document.getElementById('selectEchelle1');
        if (selEch) selEch.value = echelleCassee.id;
        grille.criteres.forEach(c => { evaluationEnCours.criteres[c.id] = 'M'; });
        window.calculerNote();

        return {
            note: document.getElementById('noteProduction1').textContent,
            niveau: document.getElementById('niveauProduction1').textContent
        };
    });

    // ⚠ CE BANC DOCUMENTE UN DÉFAUT QUI EXISTE ENCORE — il n'est pas une
    // aspiration. Le silence du 0,0 % est #674, laissé hors du lot du 1er
    // septembre par décision de Grégoire. Ce témoin est ici pour que le test
    // précédent EXCLUE quelque chose : sans lui, un « 79.5 % » pourrait venir
    // de n'importe où. Le jour où #674 est livré, CE test rougira — et ce sera
    // la bonne nouvelle, pas une régression. Le corriger alors, ne pas le
    // « réparer » en élargissant sa tolérance.
    expect(r.note, 'l\'écran ne rend plus 0.0 % : #674 est peut-être livré — voir le commentaire').toBe('0.0 %');
    expect(r.niveau).toBe('--');
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});
