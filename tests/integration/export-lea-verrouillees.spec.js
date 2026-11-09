import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { attendreRepos, suivreLesReactions } from './harness/attendre-repos.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// LOT « EXPORTER POUR LÉA N'ENVOIE QUE LES ÉVALUATIONS VERROUILLÉES » (consigne du 9 nov. 2026, décidée avec Grégoire).
//
// AVANT : une évaluation non verrouillée partait dans le ZIP pour Léa (mesuré : DEMO006), et le compteur n'en disait rien.
// MAINTENANT : seules les verrouillées partent, avec ou sans copie (synthèse seule comprise) ; le compteur dit celles
// laissées de côté, au singulier et au pluriel (texte validé par Grégoire mot pour mot). Noms fictifs.
//
// Trois évaluations : verrouillée avec copie (TESTL1), NON verrouillée avec copie (TESTL2), verrouillée sur papier (TESTL3).
// Le pluriel ajoute une quatrième, non verrouillée, sur papier (TESTL4).

const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const T = 'tlea';

async function monter(page, { quatrieme = false, tousVerrouilles = false } = {}) {
    const erreurs = [];
    page.on('console', (m) => { if (m.type() === 'error') erreurs.push(m.text()); });
    page.on('pageerror', (e) => erreurs.push(`pageerror: ${e.message}`));
    page.on('dialog', (d) => { erreurs.push(`dialogue: ${d.message()}`); d.dismiss().catch(() => {}); });
    await suivreLesReactions(page);
    await page.goto(indexHtml);
    await page.waitForFunction(() => typeof window.db !== 'undefined' && window.travauxUI && window.travauxStockage
        && window.travauxArchivage && typeof window.JSZip !== 'undefined');
    await page.evaluate(({ png, T, quatrieme, tousVerrouilles }) => {
        // security-ok: fixtures littérales du banc, aucune source externe.
        const coursId = 'cours-lea';
        const crit = [{ id: 'c1', nom: 'Contenu', ponderation: 60, type: 'holistique' }, { id: 'c2', nom: 'Structure', ponderation: 40, type: 'holistique' }];
        const niveaux = [
            { code: 'I', nom: 'Insuffisant', min: 0, max: 54, valeurCalcul: 40 },
            { code: 'D', nom: 'En développement', min: 55, max: 74, valeurCalcul: 65 },
            { code: 'M', nom: 'Maîtrisé', min: 75, max: 89, valeurCalcul: 80 },
            { code: 'E', nom: 'Étendu', min: 90, max: 100, valeurCalcul: 95 }
        ];
        const commentaires = {};
        ['I', 'D', 'M', 'E'].forEach((n) => { commentaires['c1_' + n] = 'CARTOUCHE c1_' + n; commentaires['c2_' + n] = 'CARTOUCHE c2_' + n; });
        const eleves = ['TESTL1', 'TESTL2', 'TESTL3'].concat(quatrieme ? ['TESTL4'] : []);
        window.db.setSync('trimestres', [{ id: T, nom: 'Trimestre témoin', annee: 2026, session: 'A', actif: true }]);
        window.db.setSync('cours', [{ id: coursId, codeCours: 'FRA101', titre: 'Écriture et littérature' }]);
        window.db.setSync(T + '_groupesCours', [{ id: 'GCLEA', trimestreId: T, coursId, groupeNum: '01', pratiqueId: 'sommative', actif: true }]);
        window.db.setSync(T + '_groupeEtudiants', eleves.map((da, i) => ({ da, nom: 'Fictif', prenom: 'Élève ' + (i + 1), groupe: '01', coursId, groupeCoursId: 'GCLEA' })));
        window.db.setSync(T + '_productions', [
            { id: 'plea', titre: 'Analyse', type: 'travail', ponderation: 60, grilleId: 'GLEA', echelleId: 'ELEA', cartoucheId: 'CTLEA', groupeCoursId: 'GCLEA' }
        ]);
        window.db.setSync(T + '_grillesTemplates', [{ id: 'GLEA', nom: 'Grille témoin', type: 'holistique', criteres: crit }]);
        window.db.setSync(T + '_echellesTemplates', [{ id: 'ELEA', nom: 'IDME', niveaux }]);
        window.db.setSync(T + '_cartouches_GLEA', [
            { id: 'CTLEA', nom: 'Cartouche témoin', grilleId: 'GLEA', contexte: '', criteres: [{ id: 'c1', nom: 'Contenu' }, { id: 'c2', nom: 'Structure' }], commentaires }
        ]);
        const verrou = { TESTL1: true, TESTL2: tousVerrouilles, TESTL3: true, TESTL4: false };
        window.db.setSync(T + '_evaluationsSauvegardees', eleves.map((da, i) => ({
            id: 'EV' + da, etudiantDA: da, etudiantNom: 'Élève ' + (i + 1) + ' Fictif', productionId: 'plea', productionNom: 'Analyse',
            groupeCoursId: 'GCLEA', coursId, grilleId: 'GLEA', echelleId: 'ELEA', cartoucheId: 'CTLEA',
            statutRemise: 'evalue', statutIntegrite: 'recevable', dateEvaluation: '2026-11-05T08:00:00.000Z',
            noteFinale: 74, niveauFinal: 'D', verrouillee: verrou[da],
            criteres: [
                { critereId: 'c1', critereNom: 'Contenu', niveauSelectionne: 'M', ponderation: 60, retroaction: 'CARTOUCHE c1_M' },
                { critereId: 'c2', critereNom: 'Structure', niveauSelectionne: 'D', ponderation: 40, retroaction: 'CARTOUCHE c2_D' }
            ],
            retroactionFinale: 'Rétroaction générée témoin.', retroactionReecrite: false
        })));
        // Une copie importée pour TESTL1 et TESTL2 ; TESTL3 (et TESTL4) sur papier.
        const fichier = (da) => ({
            id: 'FT' + da, etudiantDA: da, productionId: 'plea', coursId, groupeCoursId: 'GCLEA',
            nomFichier: 'FICTIF_' + da + '_Analyse.png', typeMIME: 'image/png', tailleFichier: 70, nombrePages: 1,
            stockage: 'indexeddb', thumbnailDataUrl: '', dateImport: '2026-11-01T12:00:00.000Z', dateModification: '2026-11-01T12:00:00.000Z',
            source: 'import-local', importePar: 'single', statut: 'present'
        });
        window.db.setSync(T + '_fichiersTravaux', [fichier('TESTL1'), fichier('TESTL2')]);
        window.trimestreActif = T;
        window.db.setSync('trimestreActif', T);
        window.db.setSync('infoCours', { id: coursId, codeCours: 'FRA101', groupe: '01', _groupeCoursId: 'GCLEA' });
        window.db.setSync('groupeCoursActif', { id: 'GCLEA', trimestreId: T });

        const octets = Uint8Array.from(atob(png), (c) => c.charCodeAt(0));
        const copie = new Blob([octets], { type: 'image/png' });
        const original = window.travauxStockage.recupererBlob;
        window.travauxStockage.recupererBlob = async function (id) { return /^FTTESTL/.test(id) ? copie : original.apply(this, arguments); };

        // Ce qui est téléchargé : le blob que reçoit le lien de téléchargement.
        window._telecharges = [];
        const creer = URL.createObjectURL.bind(URL);
        URL.createObjectURL = function (blob) { window._telecharges.push(blob); return creer(blob); };
    }, { png: PNG, T, quatrieme, tousVerrouilles });
    return erreurs;
}

/** « Exporter pour Léa » comme au bouton (`lancerExportLea`), puis le ZIP téléchargé ouvert : les noms de ses PDF. */
async function exporterEtLireLeZip(page) {
    return page.evaluate(async () => {
        window._telecharges = [];
        await window.travauxArchivage.lancerExportLea('plea', null, false);
        const zip = window._telecharges.find((b) => b && b.type !== 'image/png');
        if (!zip) return null;
        const contenu = await window.JSZip.loadAsync(zip);
        return Object.keys(contenu.files).sort();
    });
}

/** Le compteur de la carte « Export Léa », la production choisie au menu. */
async function compteur(page) {
    await page.evaluate(() => naviguerVers('evaluations', 'exporter'));
    await attendreRepos(page);
    await page.evaluate(() => {
        const sel = document.getElementById('travaux-archivage-lea-production');
        if (!Array.from(sel.options).some((o) => o.value === 'plea')) {
            const o = document.createElement('option'); o.value = 'plea'; o.textContent = 'Analyse'; sel.appendChild(o);
        }
        sel.value = 'plea';
        sel.dispatchEvent(new Event('change', { bubbles: true }));
    });
    return page.locator('#travaux-lea-compteur');
}

const sansBruit = (erreurs) => erreurs.filter((m) => !/favicon|ERR_FILE_NOT_FOUND/.test(m));

test('Léa · trois évaluations, une non verrouillée : deux PDF dans le ZIP, et le compteur le dit (singulier)', async ({ page }) => {
    test.setTimeout(120000);
    const erreurs = await monter(page);
    await expect(await compteur(page))
        .toHaveText('2 PDF pour 2 étudiant·es, dont 1 sur papier (synthèse seule) · 1 évaluation non verrouillée laissée de côté');
    const noms = await exporterEtLireLeZip(page);
    expect(noms, 'un ZIP a été téléchargé').not.toBeNull();
    expect(noms).toHaveLength(2);
    expect(noms.some((n) => n.includes('TESTL1')), 'la verrouillée avec copie').toBe(true);
    expect(noms.some((n) => n.includes('TESTL3')), 'la verrouillée sur papier (synthèse seule)').toBe(true);
    expect(noms.some((n) => n.includes('TESTL2')), 'la non verrouillée n\'y est pas').toBe(false);
    expect(sansBruit(erreurs)).toEqual([]);
});

test('Léa · deux non verrouillées : le compteur au pluriel', async ({ page }) => {
    test.setTimeout(120000);
    await monter(page, { quatrieme: true });
    await expect(await compteur(page))
        .toHaveText('2 PDF pour 2 étudiant·es, dont 1 sur papier (synthèse seule) · 2 évaluations non verrouillées laissées de côté');
});

test('Léa · tout est verrouillé : rien n\'est ajouté au compteur, les trois partent', async ({ page }) => {
    test.setTimeout(120000);
    await monter(page, { tousVerrouilles: true });
    await expect(await compteur(page)).toHaveText('3 PDF pour 3 étudiant·es, dont 1 sur papier (synthèse seule)');
    const noms = await exporterEtLireLeZip(page);
    expect(noms).toHaveLength(3);
});
