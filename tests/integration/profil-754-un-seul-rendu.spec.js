import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// SENTINELLE #754 (lot 4 du cadrage 11, 11 septembre 2026) — OUVRIR UN PROFIL LE REND UNE FOIS.
//
// Mesuré le 5-6 septembre (sonde 2 de l'audit) : quatre insertions dans `#contenuProfilEtudiant` à
// l'ouverture — l'appel direct, le crochet de navigation.js (T+100 ms), le MutationObserver du module
// profil (T+100 ms) et le rebouclage afficherProfilComplet → afficherSousSection('suivi-profil') →
// crochet. Chaque rendu recrée la section affichée : un texte tapé dans la zone de texte du rapport
// est effacé, une note DEN non enregistrée aussi, et trois clés d'indices sont réécrites.
//
// Ce que cette spec compte : les remplacements du CONTENU du conteneur (childList sur le conteneur
// lui-même, sans sous-arbre) — un par `container.innerHTML = …` d'afficherProfilComplet, quel que soit
// l'appelant (le compteur ne dépend pas d'un wrapper sur window, qu'un appel interne à l'IIFE
// contournerait). Quatre chemins réels : la ligne de la Liste (son onclick), le sélecteur du profil
// (data-on-change), le Suivi du groupe (tbNavigerVersProfil, data-action), l'onglet Profil
// (afficherSousSection, le crochet de navigation.js — zone protégée, non touchée).
//
// AVANT le correctif : 3 à 4 rendus par chemin ; le texte tapé est effacé. APRÈS : 1, et il reste.
// Aucun clic souris simulé : les gestes passent par les fonctions que les gestes appellent.

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i
];

async function monter(page) {
    await page.goto(indexHtml);
    await page.waitForFunction(() => typeof window.afficherProfilComplet === 'function' && typeof window.changerSectionProfil === 'function'
        && typeof window.tbNavigerVersProfil === 'function' && typeof window.rechargerListeEtudiants === 'function' && typeof window.db !== 'undefined');
    const montage = await page.evaluate(() => {
        const trimestreId = 'test754';
        window.db.setSync('trimestres', [{ id: trimestreId, nom: 'Trimestre test', actif: true }]);
        window.db.setSync('trimestreActif', trimestreId);
        const coursId = 'cours-754';
        window.db.setSync('infoCours', { id: coursId, codeCours: 'FRA101', groupe: '01', _groupeCoursId: 'GC_754' }); // security-ok: fixture de test, littéral du fichier
        window.db.setSync('groupeCoursActif', { id: 'GC_754', trimestreId });
        window.db.setSync(trimestreId + '_groupesCours', [{ id: 'GC_754', trimestreId, coursId, groupeNum: '01', pratiqueId: 'sommative', actif: true }]);
        window.db.setSync(window.cle('groupeEtudiants'), [ // security-ok: fixture de test
            { da: 'TEST754A', nom: 'Roy', prenom: 'Camille', groupe: '01', coursId },
            { da: 'TEST754B', nom: 'Tremblay', prenom: 'Alex', groupe: '01', coursId }
        ]);
        window.db.setSync(window.cle('productions'), [{ id: 'p754-1', titre: 'Analyse 1', type: 'travail', ponderation: 100, dateEcheance: '2026-02-01' }]); // security-ok: fixture de test
        window.db.setSync(window.cle('echellesTemplates'), [{ id: 'E754', nom: 'IDME test', seuilMaitrise: 'M', niveaux: [ // security-ok: fixture de test
            { code: 'I', nom: 'Insuffisant', min: 0, max: 64, valeurCalcul: 40 }, { code: 'D', nom: 'En développement', min: 65, max: 74, valeurCalcul: 65 },
            { code: 'M', nom: 'Maîtrisé', min: 75, max: 84, valeurCalcul: 75 }, { code: 'E', nom: 'Étendu', min: 85, max: 100, valeurCalcul: 100 } ] }]);
        window.db.setSync(window.cle('evaluationsSauvegardees'), [ // security-ok: fixture de test
            { id: 'ev754-1', etudiantDA: 'TEST754A', productionId: 'p754-1', echelleId: 'E754', noteFinale: 80, niveauFinal: 'M', ponderationCouverte: 100, verrouillee: true, groupe: '01',
              dateEvaluation: '2026-02-01T12:00:00.000Z', retroactionFinale: 'Rétroaction.', criteres: [{ critereId: 'c1', critereNom: 'Structure', niveauSelectionne: 'M', ponderation: 100 }] }
        ]);
        // Le compteur : un remplacement du contenu du conteneur = un rendu complet du profil.
        const container = document.getElementById('contenuProfilEtudiant');
        if (!container) return { erreur: '#contenuProfilEtudiant absent' };
        window.__rendus754 = 0;
        new MutationObserver((mutations) => {
            mutations.forEach((m) => { if (m.type === 'childList' && m.addedNodes.length > 0) window.__rendus754 += 1; });
        }).observe(container, { childList: true });
        window.afficherSection('suivi');
        return { ok: true };
    });
    expect(montage.erreur, `Erreur de montage : ${montage.erreur}`).toBeUndefined();
}

/** Remet le compteur à zéro, joue le geste, laisse passer tous les relanceurs (T+100 ms, débounce), lit. */
async function compterRendus(page, geste) {
    await page.evaluate(() => { window.__rendus754 = 0; });
    await page.evaluate(geste);
    await page.waitForTimeout(1000);
    return page.evaluate(() => ({ rendus: window.__rendus754, sousSection: (document.querySelector('.sous-section.active') || {}).id || null, da: window.profilActuelDA }));
}

test('Porte #754 · ouvrir un profil le rend UNE fois, par les quatre chemins', async ({ page }) => {
    const erreurs = [];
    const estAttendue = (m) => patternsAttendus.some((re) => re.test(m));
    page.on('pageerror', (e) => { const m = `pageerror: ${e.message}`; if (!estAttendue(m)) erreurs.push(m); });
    page.on('console', (msg) => { if (msg.type() === 'error') { const m = `console.error: ${msg.text()}`; if (!estAttendue(m)) erreurs.push(m); } });
    page.on('dialog', (d) => d.dismiss().catch(() => {}));
    await monter(page);

    // 1. Depuis la Liste : la ligne de l'élève (son onclick, posé par etudiants.js).
    await page.evaluate(() => { window.afficherSousSection('suivi-liste'); window.rechargerListeEtudiants(); });
    await page.waitForFunction(() => document.querySelectorAll('#tbody-suivi-liste tr').length >= 2, null, { timeout: 10000 });
    const depuisListe = await compterRendus(page, () => {
        const ligne = Array.from(document.querySelectorAll('#tbody-suivi-liste tr')).find((tr) => tr.textContent.includes('Roy'));
        ligne.onclick();
    });
    expect(depuisListe, 'depuis la Liste').toEqual({ rendus: 1, sousSection: 'suivi-profil', da: 'TEST754A' });

    // 2. Le sélecteur du profil (data-on-change → afficherProfilComplet(select)).
    const depuisSelecteur = await compterRendus(page, () => {
        const select = document.getElementById('selecteurEtudiantProfil');
        select.value = 'TEST754B';
        select.dispatchEvent(new Event('change', { bubbles: true }));
    });
    expect(depuisSelecteur, 'depuis le sélecteur').toEqual({ rendus: 1, sousSection: 'suivi-profil', da: 'TEST754B' });

    // 3. Depuis le Suivi du groupe (data-action="tbNavigerVersProfil"), en partant d'une autre sous-section.
    await page.evaluate(() => { window.afficherSousSection('suivi-liste'); });
    await page.waitForTimeout(300);
    const depuisSuivi = await compterRendus(page, () => { window.tbNavigerVersProfil('TEST754A'); });
    expect(depuisSuivi, 'depuis le Suivi du groupe').toEqual({ rendus: 1, sousSection: 'suivi-profil', da: 'TEST754A' });

    // 4. L'onglet Profil, un profil déjà ouvert : le crochet de navigation.js recharge — une fois.
    await page.evaluate(() => { window.afficherSousSection('suivi-liste'); });
    await page.waitForTimeout(300);
    const depuisOnglet = await compterRendus(page, () => { window.afficherSousSection('suivi-profil'); });
    expect(depuisOnglet, 'depuis l\'onglet Profil').toEqual({ rendus: 1, sousSection: 'suivi-profil', da: 'TEST754A' });

    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

test('Porte #754 · un texte tapé dans la zone de texte du rapport survit à l\'ouverture', async ({ page }) => {
    page.on('dialog', (d) => d.dismiss().catch(() => {}));
    await monter(page);
    await page.evaluate(() => { window.afficherSousSection('suivi-liste'); });
    await page.waitForTimeout(300);
    // Le geste : ouvrir le profil depuis la Liste, aller à « Rapport », taper dès que le rapport est là.
    await page.evaluate(() => { window.afficherProfilComplet('TEST754A'); window.changerSectionProfil('rapport'); });
    await page.waitForFunction(() => { const t = document.getElementById('textarea-rapport-TEST754A'); return !!(t && t.value && t.value.length > 0); }, null, { timeout: 10000 });
    await page.evaluate(() => { document.getElementById('textarea-rapport-TEST754A').value += '\nTROIS MOTS TAPÉS'; });
    await page.waitForTimeout(600);
    const texte = await page.evaluate(() => (document.getElementById('textarea-rapport-TEST754A') || {}).value || '');
    // AVANT : la zone de texte est recréée à 212 ms et remplie à 317 ms — les mots tapés ont disparu.
    expect(texte).toContain('TROIS MOTS TAPÉS');
});
