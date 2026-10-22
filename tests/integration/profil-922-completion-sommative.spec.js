import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// PORTE #922 (18 septembre 2026) — SOUS UNE PRATIQUE SOMMATIVE, LA CARTE « COMPLÉTION » DU PROFIL LISTE CE QUE SA
// FRACTION COMPTE.
//
// Rapport de Grégoire, 18 sept. 2026, 15 h 49 (1.146.4), A2024, pratique « sommative A24 » (configurable) : « Il y a
// un problème avec la complétion. Il y a deux travaux, mais un seul est compté. » Mesuré en WebKit sur la fixture du
// banc #921 : « Productions remises : 2/2 » au-dessus de « 0 production remise — Aucune production remise », et la
// grande valeur de C à « — ». Les pastilles ne retenaient que les productions de type « artefact de portfolio » :
// une sommative n'en a aucune.
//
// Le banc ouvre le VRAI profil, clique « Engagement » dans la barre latérale, et lit la carte à l'écran.

const T = 't922';
const DA = '9220001';

async function monter(page) {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(`pageerror: ${e.message}`));
    page.on('dialog', (d) => { erreurs.push(`dialogue: ${d.message()}`); d.dismiss().catch(() => {}); });
    await page.goto(indexHtml);
    await page.waitForFunction(() => typeof window.db !== 'undefined' && typeof window.afficherProfilComplet === 'function'
        && typeof window.obtenirDetailsCompletion === 'function');
    await page.evaluate(({ T, DA }) => {
        // security-ok: fixtures littérales du banc, aucune source externe.
        const coursId = 'cours-922';
        window.db.setSync('trimestres', [{ id: T, nom: 'Trimestre sommatif', annee: 2024, session: 'A', actif: true }]);
        window.db.setSync('cours', [{ id: coursId, codeCours: 'FRA101', titre: 'Écriture et littérature' }]);
        window.db.setSync(T + '_groupesCours', [{ id: 'GC_922', trimestreId: T, coursId, groupeNum: '01', pratiqueId: 'som-922', actif: true }]);
        window.db.setSync(T + '_groupeEtudiants', [{ da: DA, nom: 'Gagnon', prenom: 'Léa', groupe: '01', coursId, groupeCoursId: 'GC_922' }]);
        window.db.setSync(T + '_pratiquesConfigurables', [{
            id: 'som-922', nom: 'sommative du banc', type: 'sommative', calcul_note: { methode: 'moyenne_ponderee' },
            configuration: { type: 'sommative', conditions_speciales: [] }
        }]);
        window.db.setSync(T + '_productions', [
            { id: 'pA', titre: 'Analyse terminale', description: 'Rédaction', type: 'travail', ponderation: 40, dateEcheance: '2024-12-10', groupeCoursId: 'GC_922' },
            { id: 'pB', titre: 'Dissertation', description: 'Dissertation', type: 'travail', ponderation: 60, dateEcheance: '2024-12-15', groupeCoursId: 'GC_922' },
            { id: 'pC', titre: 'Exercice en cours', description: 'Exercice', type: 'travail', ponderation: 10, dateEcheance: '2024-12-16', groupeCoursId: 'GC_922' }
        ]);
        const base = { etudiantDA: DA, groupeCoursId: 'GC_922', coursId, statutRemise: 'remis', statutIntegrite: 'recevable', criteres: [] };
        window.db.setSync(T + '_evaluationsSauvegardees', [
            Object.assign({}, base, { id: 'E922A', productionId: 'pA', noteFinale: 67.4, niveauFinal: 'D', dateEvaluation: '2024-12-10T12:00:00.000Z', verrouillee: true }),
            Object.assign({}, base, { id: 'E922B', productionId: 'pB', noteFinale: 78.3, niveauFinal: 'M', dateEvaluation: '2024-12-15T12:00:00.000Z', verrouillee: true }),
            Object.assign({}, base, { id: 'E922C', productionId: 'pC', noteFinale: 20, niveauFinal: 'I', dateEvaluation: '2024-12-16T12:00:00.000Z', verrouillee: false })
        ]);
        window.trimestreActif = T;
        window.db.setSync('trimestreActif', T);
        window.db.setSync('infoCours', { id: coursId, codeCours: 'FRA101', groupe: '01', _groupeCoursId: 'GC_922' });
        window.db.setSync('groupeCoursActif', { id: 'GC_922', trimestreId: T });
    }, { T, DA });
    return erreurs;
}

const lireCompletion = (page) => page.evaluate((da) => {
    window.afficherProfilComplet(da);
    const item = document.querySelector('[data-action="changerSectionProfil"][data-param="mobilisation"]');
    if (item) item.click();
    const cont = document.getElementById('contenuProfilEtudiant');
    const carte = [...cont.querySelectorAll('.profil-grid-3col .profil-carte')]
        .find((c) => (c.querySelector('h3') || {}).textContent.trim() === 'Complétion');
    if (!carte) return { presente: false };
    const net = (el) => el.textContent.replace(/\s+/g, ' ').trim();
    return {
        presente: true,
        fraction: net(carte.querySelector('.profil-liste-simple li')),
        titres: [...carte.querySelectorAll('h4')].map(net),
        remises: [...carte.querySelectorAll('.badge-completion-remis')].map((b) => net(b.querySelector('.badge-completion-titre')) + ' ' + net(b.querySelector('.badge-completion-numero'))),
        nonRemises: [...carte.querySelectorAll('.badge-completion-non-remis, .badge-completion-non-recevable')].map((b) => net(b.querySelector('.badge-completion-titre'))),
        videsEtMessages: [...carte.querySelectorAll('.profil-message-vide, .profil-message-tous-remis')].map(net),
        valeurEnTete: net(carte.querySelector('.u-flex-between-mb15')).replace(/^Complétion\s*/, ''),
        // Le témoin : ce que la pratique compte, par la porte que lit la fraction.
        details: (() => { const d = window.obtenirDetailsCompletion(da) || {}; return { remis: d.remis, total: d.total }; })()
    };
}, DA);

test('#922 · sommative : « 2/2 » et les DEUX productions en pastilles, à leur rang ; le brouillon n\'y est pas ; la valeur de C n\'est plus « — »', async ({ page }) => {
    const erreurs = await monter(page);
    const c = await lireCompletion(page);

    expect(c.presente, 'la carte Complétion de la section Engagement').toBe(true);
    expect(c.details).toEqual({ remis: 2, total: 2 });
    expect(c.fraction).toBe('• Productions remises : 2/2');
    expect(c.titres[0]).toBe('2 productions remises');
    expect(c.remises).toEqual(['Rédaction P1', 'Dissertation P2']);
    expect(c.remises.join(' '), 'un brouillon ne compte nulle part').not.toContain('Exercice');
    expect(c.videsEtMessages).toEqual(['Toutes les productions sont remises !']);
    expect(c.valeurEnTete, 'la grande valeur de C suit la fraction').not.toBe('—');
    expect(erreurs).toEqual([]);
});

test('#922 · sommative : une production « non remise » quitte les pastilles des remises et paraît dans l\'autre liste — la carte ne se contredit plus', async ({ page }) => {
    const erreurs = await monter(page);
    await page.evaluate((T) => {
        const ev = window.db.getSync(T + '_evaluationsSauvegardees').map((e) => e.id === 'E922B'
            ? Object.assign({}, e, { statutRemise: 'non-remis', noteFinale: 0, niveauFinal: null }) : e);
        window.db.setSync(T + '_evaluationsSauvegardees', ev);
    }, T);
    const c = await lireCompletion(page);

    // Le cas du rapport, au chiffre près : « 1/2 ». Le banc juge l'ACCORD entre la fraction et les deux listes.
    expect(c.details).toEqual({ remis: 1, total: 2 });
    expect(c.fraction).toBe('• Productions remises : 1/2');
    expect(c.titres).toEqual(['1 production remise', '1 production non remise ou non recevable']);
    expect(c.remises).toEqual(['Rédaction P1']);
    expect(c.nonRemises).toEqual(['Dissertation']);
    expect(c.videsEtMessages, 'ni « Aucune production remise », ni « Toutes les productions sont remises ! »').toEqual([]);
    expect(c.valeurEnTete).toBe('50 %');
    expect(erreurs).toEqual([]);
});

// ── La carte PERFORMANCE de la même section (second volet du rapport : « le calcul de la performance renvoie à des
// notions PAN »). Mots choisis avec Grégoire le 18 sept. ; sa précision : « la moyenne pondérée doit reprendre la
// pondération affectée à chaque travail, pas 50-50 ».

const lirePerformance = (page) => page.evaluate((da) => {
    window.afficherProfilComplet(da);
    const item = document.querySelector('[data-action="changerSectionProfil"][data-param="mobilisation"]');
    if (item) item.click();
    const cont = document.getElementById('contenuProfilEtudiant');
    const carte = [...cont.querySelectorAll('.profil-grid-3col .profil-carte')]
        .find((c) => (c.querySelector('h3') || {}).textContent.trim() === 'Performance');
    if (!carte) return { presente: false };
    const net = (el) => el.textContent.replace(/\s+/g, ' ').trim();
    const methodo = cont.querySelector('[id^="details-calculs-mobilisation"]');
    return {
        presente: true,
        valeurEnTete: net(carte.querySelector('.u-flex-between-mb15')).replace(/^Performance\s*/, ''),
        methode: net(carte.querySelector('.profil-liste-simple li')),
        titre: net(carte.querySelector('h4')),
        pastilles: [...carte.querySelectorAll('.badge-artefact')].map((b) => net(b) + ' → ' + b.getAttribute('data-param2')),
        jetons: !!carte.querySelector('.profil-encadre-jetons'),
        texte: net(carte),
        methodologieP: net(methodo).split('Performance (P) :')[1].trim(),
        // Le témoin : le P du moteur, par la porte que lisent l'indice et l'export.
        moteurP: (window.simulerIndices(da, 'som-922') || {}).P
    };
}, DA);

test('#922 · sommative : la carte Performance redit le moteur — P 74 (40/60, pas 73 en moyenne simple), chaque copie avec SON poids, aucun mot de portfolio, pas de jetons', async ({ page }) => {
    const erreurs = await monter(page);
    const p = await lirePerformance(page);

    expect(p.presente).toBe(true);
    // (67,4 × 40 + 78,3 × 60) ÷ 100 = 73,94 → 74 ; la moyenne simple (67,4 + 78,3) ÷ 2 = 72,85 → 73.
    expect(p.moteurP).toBe(74);
    expect(p.valeurEnTete).toBe('74 %');
    expect(p.methode).toBe('• Moyenne pondérée des productions évaluées');
    expect(p.titre).toBe('2 productions évaluées');
    expect(p.pastilles).toEqual(['P1 D (67,4) · poids 40 % → pA', 'P2 M (78,3) · poids 60 % → pB']);
    expect(p.texte).not.toMatch(/portfolio|meilleur|standards|artefact/i);
    expect(p.jetons, 'aucun jeton appliqué : le bloc ne paraît pas').toBe(false);
    expect(p.methodologieP).toBe('Indice P = 74 % — Moyenne pondérée des 2 productions évaluées, chacune à son poids');
    expect(erreurs).toEqual([]);
});

test('#922 · sommative : un jeton appliqué à une copie fait paraître le bloc des jetons — rien ne se perd', async ({ page }) => {
    const erreurs = await monter(page);
    await page.evaluate((T) => {
        const ev = window.db.getSync(T + '_evaluationsSauvegardees').map((e) => e.id === 'E922A'
            ? Object.assign({}, e, { jetonDelaiApplique: true }) : e);
        window.db.setSync(T + '_evaluationsSauvegardees', ev);
    }, T);
    const p = await lirePerformance(page);

    expect(p.jetons).toBe(true);
    expect(p.valeurEnTete).toBe('74 %');
    expect(erreurs).toEqual([]);
});
