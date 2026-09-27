import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// PORTE #921 (18 septembre 2026) — LA NOTE DE SESSION D'UNE PRATIQUE SOMMATIVE SE LIT DANS LE PROFIL.
//
// Rapport de Grégoire, 18 sept. 2026, 15 h 15 (1.146.4), trimestre A2024, pratique « sommative A24 » (une pratique
// CONFIGURABLE, `calcul_note.methode = 'moyenne_ponderee'`) : « Le calcul de la note finale dans une pratique sommative
// n'est pas affiché dans la liste des productions comme il devrait l'être (par exemple dans une PAN STD). »
// Mesuré : `calculerDetailsNoteFinale` rend null hors Standards, et `PratiqueConfigurable.decrireCalcul` rendait null
// pour une sommative — aucune carte, aucun récit. Forme choisie par Grégoire : une carte calquée sur celle de la PAN.
//
// Le banc ouvre le VRAI profil (`afficherProfilComplet`) et lit l'écran ; la note attendue est calculée à la main :
// (67,4 × 40 + 78,3 × 60) ÷ 100 = 73,94 → « 73.9% ». Le brouillon (verrouillee:false) est nommé, non compté.

const T = 't921';
const DA = '9210001';

async function monter(page, { verrou = false } = {}) {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(`pageerror: ${e.message}`));
    page.on('dialog', (d) => { erreurs.push(`dialogue: ${d.message()}`); d.dismiss().catch(() => {}); });
    await page.goto(indexHtml);
    await page.waitForFunction(() => typeof window.db !== 'undefined' && typeof window.afficherProfilComplet === 'function'
        && typeof window.simulerIndices === 'function' && typeof window.obtenirPratiqueParId === 'function');
    await page.evaluate(({ T, DA, verrou }) => {
        // security-ok: fixtures littérales du banc, aucune source externe.
        const coursId = 'cours-921';
        window.db.setSync('trimestres', [{ id: T, nom: 'Trimestre sommatif', annee: 2024, session: 'A', actif: true }]);
        window.db.setSync('cours', [{ id: coursId, codeCours: 'FRA101', titre: 'Écriture et littérature' }]);
        window.db.setSync(T + '_groupesCours', [{ id: 'GC_921', trimestreId: T, coursId, groupeNum: '01', pratiqueId: 'som-921', actif: true }]);
        window.db.setSync(T + '_groupeEtudiants', [{ da: DA, nom: 'Gagnon', prenom: 'Léa', groupe: '01', coursId, groupeCoursId: 'GC_921' }]);
        window.db.setSync(T + '_pratiquesConfigurables', [{
            id: 'som-921', nom: 'sommative du banc', type: 'sommative', calcul_note: { methode: 'moyenne_ponderee' },
            configuration: { type: 'sommative',
                conditions_speciales: verrou ? [{ type: 'double_verrou', condition: { evaluation: 'Analyse terminale', comparateur: '<', seuil: 70 }, consequence: { action: 'echec', note_max: 55 } }] : [] }
        }]);
        window.db.setSync(T + '_productions', [
            { id: 'pA', titre: 'Analyse terminale', description: 'Rédaction', type: 'travail', ponderation: 40, groupeCoursId: 'GC_921' },
            { id: 'pB', titre: 'Portfolio (global)', description: 'portfolio', type: 'travail', ponderation: 60, groupeCoursId: 'GC_921' },
            { id: 'pC', titre: 'Exercice en cours', description: 'brouillon', type: 'travail', ponderation: 10, groupeCoursId: 'GC_921' }
        ]);
        const base = { etudiantDA: DA, groupeCoursId: 'GC_921', coursId, statutRemise: 'remis', statutIntegrite: 'recevable', criteres: [] };
        window.db.setSync(T + '_evaluationsSauvegardees', [
            Object.assign({}, base, { id: 'E921A', productionId: 'pA', noteFinale: 67.4, niveauFinal: 'D', dateEvaluation: '2024-12-10T12:00:00.000Z', verrouillee: true }),
            Object.assign({}, base, { id: 'E921B', productionId: 'pB', noteFinale: 78.3, niveauFinal: 'M', dateEvaluation: '2024-12-15T12:00:00.000Z', verrouillee: true }),
            Object.assign({}, base, { id: 'E921C', productionId: 'pC', noteFinale: 20, niveauFinal: 'I', dateEvaluation: '2024-12-16T12:00:00.000Z', verrouillee: false })
        ]);
        window.trimestreActif = T;
        window.db.setSync('trimestreActif', T);
        window.db.setSync('infoCours', { id: coursId, codeCours: 'FRA101', groupe: '01', _groupeCoursId: 'GC_921' });
        window.db.setSync('groupeCoursActif', { id: 'GC_921', trimestreId: T });
    }, { T, DA, verrou });
    return erreurs;
}

const lireCarte = (page) => page.evaluate((da) => {
    window.afficherProfilComplet(da);
    const cont = document.getElementById('contenuProfilEtudiant');
    const carte = cont && cont.querySelector('.note-finale-section');
    const txt = (sel) => { const el = carte && carte.querySelector(sel); return el ? el.textContent.replace(/\s+/g, ' ').trim() : null; };
    return {
        presente: !!carte,
        titre: txt('.note-finale-titre'),
        composante: txt('.note-finale-composante-titre'),
        lignes: carte ? [...carte.querySelectorAll('.note-finale-liste-artefacts li')].map((li) => li.textContent.replace(/\s+/g, ' ').trim()) : [],
        calcul: txt('.note-finale-calcul-categorie'),
        total: txt('.note-finale-total'),
        message: txt('.note-finale-message-provisoire'),
        // Le témoin : la note que le moteur rend, par la porte que lisent l'indice P et l'export.
        moteur: (() => { const s = window.simulerIndices(da, 'som-921') || {}; return { P: s.P, famille: s.recit && s.recit.famille, note: s.recit && s.recit.synthese.noteFinale }; })()
    };
}, DA);

test('#921 · sommative configurable : la carte « Moyenne pondérée » paraît sous la liste, avec chaque copie, son poids, le calcul et le total du moteur', async ({ page }) => {
    const erreurs = await monter(page);
    const c = await lireCarte(page);

    expect(c.presente, 'une carte de note de session sous la liste des productions').toBe(true);
    expect(c.titre).toContain('Note provisoire de session');
    expect(c.titre).toContain('sommative du banc');
    expect(c.titre).toContain('Réglages de la pratique');
    expect(c.composante).toMatch(/^Moyenne pondérée \(2 /);
    expect(c.lignes).toEqual([
        'Analyse terminale · poids 40 % (D 67.4%)',
        'Portfolio (global) · poids 60 % (M 78.3%)',
        'Exercice en cours · évaluation non verrouillée · non comptée (I 20.0%)'
    ]);
    expect(c.calcul).toBe('(67.4 × 40 + 78.3 × 60) ÷ 100 = 73.9%');
    expect(c.total).toBe('73.9%');
    // Parité : l'écran ne calcule rien, il redit le moteur.
    expect(c.moteur.famille).toBe('SOM');
    expect(Math.abs(c.moteur.note - 73.94)).toBeLessThan(0.001);
    expect(c.moteur.P).toBe(74);
    expect(erreurs).toEqual([]);
});

test('#921 · quand le verrou de la pratique (#897) plafonne la moyenne, la carte montre la moyenne, le plafond, et le total est celui du moteur', async ({ page }) => {
    const erreurs = await monter(page, { verrou: true });
    const c = await lireCarte(page);

    expect(c.calcul).toBe('(67.4 × 40 + 78.3 × 60) ÷ 100 = 73.9%');
    expect(c.total).toBe('55.0%');
    expect(c.message).toBe('Moyenne de 73.9% ramenée à 55.0% par une règle de la pratique.');
    expect(c.moteur.note).toBe(55);
    expect(erreurs).toEqual([]);
});

test('#921 · si la moyenne du moteur ne se retrouve pas par les pondérations affichées, la ligne de calcul se tait et le total reste celui du moteur', async ({ page }) => {
    const erreurs = await monter(page);
    // Un moteur qui rendrait autre chose que la moyenne pondérée simple (une règle future, un arrondi) : l'écran ne doit pas
    // écrire « … = 50.0% » sous une addition qui donne 73.9.
    await page.evaluate(() => { window.PratiqueSommative.prototype.calculerPerformance = function () { return 0.5; }; });
    const c = await lireCarte(page);

    expect(c.presente).toBe(true);
    expect(c.total).toBe('50.0%');
    expect(c.calcul, 'aucune ligne de calcul plutôt qu\'une arithmétique fausse').toBeNull();
    expect(erreurs).toEqual([]);
});
