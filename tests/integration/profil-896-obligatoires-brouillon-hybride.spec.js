import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');
// PORTE #896 (18 septembre 2026) — NOTE HYBRIDE SANS TERMINALE : LA COLONNE « OBLIGATOIRES » COMPTE CE QUE COMPTE LA NOTE.
//
// Inscrit par lecture le 16 sept. ; EXÉCUTÉ le 18 en WebKit avant correctif : avec un brouillon d'obligatoire (I 20 %),
// la carte écrivait « (70.0% + 20.0%) ÷ 2 = 45.0% × 35% = 15.8 pts », « Note finale = 55.3 pts + 15.8 pts = 71.0 % »
// au-dessus du total du moteur « 79.8% », et « les 2 meilleures sur 1 évaluées ». La colonne lisait `noteFinale != null`
// sans le verrou ; la note, elle, suit `evaluationEntreDansLaNote` (#706 : un brouillon ne compte nulle part).
//
// À la main : sélection (90 + 80) ÷ 2 = 85 × 65 % = 55,25 ; obligatoires 70 ÷ 1 = 70 × 35 % = 24,5 ; total 79,75.

const T = 't896';
const DA = '8960001';

test('#896 · hybride sans terminale : un brouillon d\'obligatoire est nommé sur sa ligne, hors de l\'addition ; la formule de la carte redonne le total du moteur', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    await page.goto(indexHtml);
    await page.waitForFunction(() => typeof window.db !== 'undefined' && typeof window.afficherProfilComplet === 'function'
        && typeof window.calculerDetailsNoteFinale === 'function');
    const r = await page.evaluate(({ T, DA }) => {
        // security-ok: fixtures littérales du banc, aucune source externe.
        const coursId = 'cours-896';
        const categories = { actif: true, selection: { nombreARetenir: 2, ponderation: 65 }, obligatoires: { ponderation: 35 } };
        window.db.setSync('trimestres', [{ id: T, nom: 'Trimestre hybride', annee: 2026, session: 'A', actif: true }]);
        window.db.setSync('cours', [{ id: coursId, codeCours: 'FRA101', titre: 'Écriture et littérature' }]);
        window.db.setSync(T + '_groupesCours', [{ id: 'GC_896', trimestreId: T, coursId, groupeNum: '01', pratiqueId: 'std-896', actif: true }]);
        window.db.setSync(T + '_groupeEtudiants', [{ da: DA, nom: 'Gagnon', prenom: 'Léa', groupe: '01', coursId, groupeCoursId: 'GC_896' }]);
        window.db.setSync(T + '_pratiquesConfigurables', [{
            id: 'std-896', nom: 'hybride du banc', type: 'standards',
            configuration: { type: 'standards', categories, portfolio: { actif: true, methodeSelection: 'meilleurs', nombreARetenir: 2, minimumCompletion: 1, categories } }
        }]);
        const prod = (id, titre, categorie, date) => ({ id, titre, description: titre, type: 'artefact-portfolio', categorie, ponderation: 0, dateEcheance: date, groupeCoursId: 'GC_896' });
        window.db.setSync(T + '_productions', [
            prod('S1', 'Sélection 1', 'selection', '2026-09-01'), prod('S2', 'Sélection 2', 'selection', '2026-09-08'),
            prod('O1', 'Obligatoire 1', 'obligatoire', '2026-09-15'), prod('O2', 'Obligatoire 2', 'obligatoire', '2026-09-22')
        ]);
        const base = { etudiantDA: DA, groupeCoursId: 'GC_896', coursId, statutRemise: 'remis', statutIntegrite: 'recevable', criteres: [] };
        const ev = (id, productionId, noteFinale, niveauFinal, verrouillee) => Object.assign({}, base, { id, productionId, noteFinale, niveauFinal, verrouillee, dateEvaluation: '2026-09-20T12:00:00.000Z' });
        window.db.setSync(T + '_evaluationsSauvegardees', [
            ev('E1', 'S1', 80, 'M', true), ev('E2', 'S2', 90, 'E', true), ev('E3', 'O1', 70, 'D', true), ev('E4', 'O2', 20, 'I', false)
        ]);
        window.trimestreActif = T;
        window.db.setSync('trimestreActif', T);
        window.db.setSync('infoCours', { id: coursId, codeCours: 'FRA101', groupe: '01', _groupeCoursId: 'GC_896' });
        window.db.setSync('groupeCoursActif', { id: 'GC_896', trimestreId: T });

        window.afficherProfilComplet(DA);
        const cont = document.getElementById('contenuProfilEtudiant');
        const carte = cont && cont.querySelector('.note-finale-section');
        const d = window.calculerDetailsNoteFinale(DA) || {};
        // 21 oct. 2026 : la phrase de la note finale, TELLE QU'ELLE EST (le nœud de texte, insécables compris).
        const marcheur = carte ? document.createTreeWalker(carte, NodeFilter.SHOW_TEXT) : null;
        let formule = null;
        while (marcheur && marcheur.nextNode()) { if (marcheur.currentNode.data.trim().startsWith('Note finale = ')) { formule = marcheur.currentNode.data.trim(); break; } }
        return { type: window.obtenirTypePratiqueActive(), carte: carte ? carte.innerText.replace(/\s+/g, ' ').trim() : null, formule,
                 details: { note: d.noteFinale, methode: d.portfolio && d.portfolio.methodeSelection, nb: d.portfolio && d.portfolio.nombreEvalues, erreur: d.erreur, terminal: d.terminal } };
    }, { T, DA });
    expect(r.type).toBe('standards');
    expect(r.details.methode).toContain('hybride');
    expect(r.details.terminal.present).toBe(false);
    expect(r.details.note).toBe(79.75);
    expect(r.carte).toContain('Sélection (les 2 meilleures sur 2 évaluées) (65%)');
    // 21 oct. 2026 : notes à la norme française ; `carte` ramène tout blanc (l'insécable compris) à une espace.
    expect(r.carte).toContain('Obligatoire 1 (D 70 %)');
    expect(r.carte).toContain('Obligatoire 2 (évaluation non verrouillée, non comptée)');
    expect(r.carte).toContain('(70 %) ÷ 1 = 70 % × 35% = 24.5 pts');
    // L'accord qui manquait : la formule écrite et le total du moteur, sur la même carte.
    expect(r.carte).toContain('Note finale = 55,3 pts + 24,5 pts = 79,8 % 79,8 %');
    // 21 oct. 2026 : la phrase à la norme du PDF de l'élève — virgule, insécable devant « pts » et « % ».
    expect(r.formule).toBe('Note finale = 55,3\u00A0pts + 24,5\u00A0pts = 79,8\u00A0%');
    expect(r.carte).not.toContain('20 %');
    expect(erreurs).toEqual([]);
});
