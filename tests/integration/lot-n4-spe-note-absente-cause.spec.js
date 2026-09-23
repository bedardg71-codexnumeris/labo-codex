import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// LOT N4 (#713, 23 sept. 2026) — UNE NOTE ABSENTE S'ÉCRIT « — », AVEC SA CAUSE, SUR CHAQUE ÉCRAN QUI LA MONTRE.
// Décision de Grégoire (réponse A) : sans forfait atteint et sans palier d'échec créé par le collègue, aucune note ;
// la cause est « Ta pratique ne dit pas quelle note donner quand aucun forfait n'est atteint. »
// Le banc Vitest (audit-pratiques-notation-config-2026-09-16, « lot N4 ») juge le moteur, la simulation et l'export
// construits en bac à sable ; CETTE spec juge ce que la vraie page écrit : le profil (carte Performance, ligne
// « Performance globale (P) »), le rapport, la bulle du Suivi, et le fichier d'export téléchargé par le bouton réel.
// Le « Modèle simple » est semé tel que le gabarit l'écrit (pratiques-bibliotheque.js, 'SPE-simple') ; noms fictifs.

const patternsAttendus = [/version\.json.*access control/i, /Cross origin requests are only supported/i, /Not allowed to load local resource.*\.(svg|png)/i];
const CAUSE = 'Ta pratique ne dit pas quelle note donner quand aucun forfait n\'est atteint.';
const DA_SANS = '1000011';   // projet 60 (< 75) + examen 90 → aucun forfait → aucune note
const DA_AVEC = '1000012';   // projet 80 + examen 90 → Réussite → 70
const MODELE_SIMPLE = { id: 'SPE_N4', nom: 'Modèle simple', type: 'specifications', pratiques: ['SPE'], dansBibliotheque: true,
    dateCreation: '2026-09-23T12:00:00.000Z',
    configuration: { seuilAcceptable: 75,
        typesTravaux: [{ id: 1, nom: 'Projet', description: 'Travail pratique ou créatif' }, { id: 2, nom: 'Examen', description: 'Évaluation sommative' }],
        forfaits: [{ id: 1, lettre: 'Excellence', note: 90, travaux: { 1: 2, 2: 1 } }, { id: 2, lettre: 'Réussite', note: 70, travaux: { 1: 1, 2: 1 } }] } };
function ev(id, da, productionId, noteFinale, niveauFinal) {
    return { id, etudiantDA: da, productionId, noteFinale, niveauFinal, ponderationCouverte: 100, verrouillee: true,
        dateEvaluation: '2026-02-01T12:00:00.000Z', statutIntegrite: 'recevable', statutRemise: 'remis' };
}

test('lot N4 · « Modèle simple », un élève sans forfait : « — » et la cause au profil, au rapport, au Suivi et à l\'export', async ({ page }) => {
    test.setTimeout(90000);
    const erreurs = [];
    const estAttendue = (m) => patternsAttendus.some((re) => re.test(m));
    page.on('pageerror', (e) => { const m = `pageerror: ${e.message}`; if (!estAttendue(m)) erreurs.push(m); });
    page.on('console', (msg) => { if (msg.type() === 'error') { const m = `console.error: ${msg.text()}`; if (!estAttendue(m)) erreurs.push(m); } });
    page.on('dialog', (dl) => { dl.accept().catch(() => {}); });
    await page.goto(indexHtml);
    await page.waitForFunction(() => typeof window.afficherProfilComplet === 'function' && typeof window.genererRapportAPI === 'function'
        && typeof window.chargerTableauBordApercu === 'function' && typeof window.db !== 'undefined' && typeof window.calculerEtStockerIndicesCP === 'function');

    await page.evaluate(({ MODELE_SIMPLE, DA_SANS, DA_AVEC, evs }) => {
        const trimestreId = 'testN4'; const coursId = 'cours-N4'; const GC_ID = 'GC_N4';
        window.db.setSync('trimestres', [{ id: trimestreId, nom: 'Trimestre N4', actif: true }]);
        window.db.setSync('trimestreActif', trimestreId);
        window.db.setSync('infoCours', { id: coursId, codeCours: 'FRA101', groupe: '00001', _groupeCoursId: GC_ID }); // security-ok: fixture de test
        window.db.setSync('groupeCoursActif', { id: GC_ID, trimestreId });
        window.db.setSync(trimestreId + '_groupesCours', [{ id: GC_ID, trimestreId, coursId, groupeNum: '00001', pratiqueId: MODELE_SIMPLE.id, actif: true }]);
        window.db.setSync(window.cle('pratiquesConfigurables'), [MODELE_SIMPLE]); // security-ok: fixture de test
        window.db.setSync(window.cle('groupeEtudiants'), [   // security-ok: fixture de test, noms fictifs
            { da: DA_SANS, nom: 'Sansforfait', prenom: 'Alix', groupe: '00001', coursId },
            { da: DA_AVEC, nom: 'Avecforfait', prenom: 'Béa', groupe: '00001', coursId }]);
        window.db.setSync(window.cle('productions'), [ // security-ok: fixture de test
            { id: 'PJ1', titre: 'Projet 1', type: 'projet', dateEcheance: '2026-02-01' },
            { id: 'PJ2', titre: 'Projet 2', type: 'projet', dateEcheance: '2026-03-01' },
            { id: 'EX1', titre: 'Examen', type: 'examen', dateEcheance: '2026-04-01' }]);
        window.db.setSync(window.cle('evaluationsSauvegardees'), evs); // security-ok: fixture de test
        window.calculerEtStockerIndicesCP();
    }, { MODELE_SIMPLE, DA_SANS, DA_AVEC, evs: [ev('N4_S1', DA_SANS, 'PJ1', 60, 'D'), ev('N4_S2', DA_SANS, 'EX1', 90, 'E'),
        ev('N4_A1', DA_AVEC, 'PJ1', 80, 'M'), ev('N4_A2', DA_AVEC, 'EX1', 90, 'E')] });

    // Le stock : non constructible pour l'une, 70 pour l'autre.
    const stock = await page.evaluate(({ DA_SANS, DA_AVEC }) => {
        const i = window.db.getSync(window.cle('indicesCP'), {}) || {};
        return { sans: i[DA_SANS] && i[DA_SANS].actuel, avec: i[DA_AVEC] && i[DA_AVEC].actuel };
    }, { DA_SANS, DA_AVEC });
    expect(stock.sans).toMatchObject({ P: 0, noteConstructible: false });
    expect(stock.avec).toMatchObject({ P: 70, noteConstructible: true });

    // (1) Le profil, par le geste de la liste.
    const profil = async (da) => page.evaluate((da) => {
        window.afficherProfilComplet(da);
        const cont = document.getElementById('contenuProfilEtudiant');
        // Les deux sections qui écrivent P : Accompagnement (ligne « Performance globale (P) ») et Engagement (carte).
        window.changerSectionProfil('accompagnement');
        let texte = cont ? cont.innerText : '';
        window.changerSectionProfil('mobilisation');
        texte += '\n' + (cont ? cont.innerText : '');
        const ligneP = (texte.split('\n').find(l => l.includes('Performance globale (P)')) || null);
        const idx = texte.indexOf('Performance globale (P)');
        const cartes = [...(cont ? cont.querySelectorAll('.profil-carte') : [])];
        const cartePerf = cartes.find(c => (c.querySelector('h3') || {}).textContent === 'Performance');
        // La valeur de la carte : l'élément qui suit le titre « Performance » dans son en-tête.
        const valeur = cartePerf ? cartePerf.querySelector('h3').nextElementSibling : null;
        return { ligneP, apresLigneP: idx >= 0 ? texte.slice(idx, idx + 200) : null,
            cartePerf: valeur ? { texte: valeur.textContent.trim(), bulle: valeur.getAttribute('title') } : null };
    }, da);
    const pSans = await profil(DA_SANS);
    const pAvec = await profil(DA_AVEC);
    console.log('LOT-N4-PROFIL ' + JSON.stringify({ pSans, pAvec }));
    expect(pSans.apresLigneP, 'la ligne « Performance globale (P) » est rendue').not.toBeNull();
    expect(pSans.apresLigneP).toContain('—');
    expect(pSans.apresLigneP).toContain(CAUSE);
    expect(pSans.apresLigneP).not.toMatch(/\b0\s?%/);
    expect(pAvec.apresLigneP).toMatch(/70\s?%/);
    expect(pAvec.apresLigneP).not.toContain(CAUSE);
    expect(pSans.cartePerf, 'la carte Performance est rendue').not.toBeNull();
    expect(pSans.cartePerf).toEqual({ texte: '—', bulle: CAUSE });
    // MESURÉ, HORS LOT (23 sept. 2026) : sous une spécification, cette carte écrit « — » AUSSI pour l'élève qui a 70 — elle
    // compte des artefacts de portfolio, qu'une spécification n'a pas ; c'était déjà le cas avant le lot N4. Figé ici pour
    // qu'on le voie changer ; la ligne « Performance globale (P) » (ci-dessus) dit la vraie note.
    expect(pAvec.cartePerf).toEqual({ texte: '—', bulle: null });

    // (2) Le rapport.
    const rapport = await page.evaluate((da) => window.genererRapportAPI(da), DA_SANS);
    expect(rapport).toContain('Performance : non constructible (' + CAUSE + ')');

    // (3) La bulle du Suivi : le tableau de bord, puis le bouton réel « Détails » (badges A/C/P).
    await page.evaluate(() => { window.afficherSection('tableau-bord'); window.chargerTableauBordApercu(); });
    await page.waitForFunction(() => !!document.getElementById('btn-toggle-panneau-prioritaire'), null, { timeout: 8000 });
    await page.evaluate(() => document.getElementById('btn-toggle-panneau-prioritaire').click());
    await page.waitForFunction(() => !!document.querySelector('#liste-etudiants-suivi .prioritaire-indice'), null, { timeout: 8000 }).catch(() => {});
    const suivi = await page.evaluate(({ DA_SANS, DA_AVEC }) => {
        const btn = document.getElementById('btn-toggle-panneau-prioritaire');
        const liste = document.getElementById('liste-etudiants-suivi');
        const badgeP = (da) => {
            const ligne = liste && [...liste.querySelectorAll('[data-da]')].find(el => el.getAttribute('data-da') === da);
            const b = ligne && [...ligne.querySelectorAll('.prioritaire-indice')].find(s => s.textContent.trim().startsWith('P'));
            return b ? { texte: b.textContent.trim(), bulle: b.getAttribute('title') } : null;
        };
        return { bouton: !!btn, sans: badgeP(DA_SANS), avec: badgeP(DA_AVEC) };
    }, { DA_SANS, DA_AVEC });
    console.log('LOT-N4-SUIVI ' + JSON.stringify(suivi));
    expect(suivi.sans, 'le badge P de l\'élève sans forfait est rendu').not.toBeNull();
    expect(suivi.sans).toEqual({ texte: 'P —', bulle: CAUSE });
    expect(suivi.avec.texte).toBe('P 70%');

    // (4) L'export, par le bouton réel ; le fichier téléchargé est lu.
    await page.evaluate(() => { window.afficherSection('conception'); window.afficherSousSection('conception-pratiques-notation'); });
    const [dl] = await Promise.all([
        page.waitForEvent('download', { timeout: 8000 }),
        page.evaluate(() => document.querySelector('button[data-action="exporterSyntheseResultatsCSV"]').click())
    ]);
    const csv = readFileSync(await dl.path(), 'utf8');
    const ligne = (da) => csv.split(/\r?\n/).find(l => l.startsWith(da));
    expect(ligne(DA_SANS)).toContain(',,non constructible – ' + CAUSE + ',');
    expect(ligne(DA_AVEC)).toMatch(/,70,(final|provisoire),/);

    expect(erreurs, 'aucune erreur de page').toEqual([]);
});
