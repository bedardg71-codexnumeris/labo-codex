import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// PORTE #762 — « APPLIQUER AU COURS ACTIF » ASSIGNE LA PRATIQUE AU GROUPE-COURS, DANS LA PAGE RÉELLE.
//
// Rapport de Grégoire, 6 septembre 2026, 7 h 48 : « la pratique de notation (PAN-STD) est bien
// configurée et activée », et le profil dit « introuvable dans la bibliothèque ». Ses données :
// `groupesCours[0].pratiqueId = null`. Le bouton de Conception › Pratiques (« Appliquer au cours
// actif », `appliquerPratiqueAuCoursActive` dans main.js → `appliquerPratiqueAuCours`) n'écrivait
// que les modalités, et l'activation par la source de vérité n'avait plus de bouton depuis le
// retrait des cartes « Activer » (9 décembre 2025). La sentinelle Vitest éprouve la fonction ;
// cette porte éprouve LE BOUTON tel que la page le câble (dispatcher `data-action`, identifiant
// de la pratique en édition, barre latérale rendue), et le profil qui cesse de dire « introuvable ».
//
// Aucun `page.click` ni `waitForTimeout` : le bouton est cliqué par `el.click()`, et on attend des rendus.

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i
];

test('Porte #762 · le bouton « Appliquer au cours actif » assigne la pratique, la barre latérale le montre, le profil cesse de dire « introuvable »', async ({ page }) => {
    const erreurs = [];
    const estAttendue = (m) => patternsAttendus.some((re) => re.test(m));
    page.on('pageerror', (e) => { const m = `pageerror: ${e.message}`; if (!estAttendue(m)) erreurs.push(m); });
    page.on('console', (msg) => {
        if (msg.type() === 'error') { const m = `console.error: ${msg.text()}`; if (!estAttendue(m)) erreurs.push(m); }
    });
    page.on('dialog', (d) => d.accept().catch(() => {}));

    await page.goto(indexHtml);
    await page.waitForFunction(() => typeof window.afficherSection === 'function' && typeof window.chargerPratiquePourModif === 'function'
        && typeof window.appliquerPratiqueAuCoursActive === 'function' && typeof window._diagnostiquerNoteNonCalculable === 'function' && typeof window.db !== 'undefined');

    const PAN_STD_ID = 'pratique_1787056354696_6_21166f8ca720';
    const GC_ID = 'GC_1786388814118_2_3068cb8e2a5b';
    const montage = await page.evaluate(({ PAN_STD_ID, GC_ID }) => {
        const trimestreId = 'test762';
        window.db.setSync('trimestres', [{ id: trimestreId, nom: 'Trimestre test', actif: true }]);
        window.db.setSync('trimestreActif', trimestreId);
        const coursId = 'cours-762';
        window.db.setSync('infoCours', { id: coursId, codeCours: 'FRA101', groupe: '00007', _groupeCoursId: GC_ID }); // security-ok: fixture de test, littéral du fichier
        window.db.setSync('groupeCoursActif', { id: GC_ID, trimestreId });
        // Les données de Grégoire : un groupe-cours SANS pratique, sa PAN-STD et un « Modèle sommatif » adopté.
        window.db.setSync(trimestreId + '_groupesCours', [{ id: GC_ID, trimestreId, coursId, groupeNum: '00007', pratiqueId: null, actif: true }]);
        window.db.setSync(window.cle('echellesTemplates'), [{ id: 'ECH_1', nom: 'IDME', niveaux: [ // security-ok: fixture de test
            { code: 'I', nom: 'Insuffisant', min: 0, max: 64, valeurCalcul: 40 }, { code: 'D', nom: 'En développement', min: 65, max: 74, valeurCalcul: 65 },
            { code: 'M', nom: 'Maîtrisé', min: 75, max: 84, valeurCalcul: 75 }, { code: 'E', nom: 'Étendu', min: 85, max: 100, valeurCalcul: 100 } ] }]);
        window.db.setSync(window.cle('pratiquesConfigurables'), [ // security-ok: fixture de test
            { id: PAN_STD_ID, nom: 'PAN-SDT-Litt A26', type: 'standards', dansBibliotheque: true, calcul_note: { methode: 'conversion_niveaux' },
              configuration: { echelleId: 'ECH_1', varianteCalcul: 'n-meilleurs', portfolio: { utiliser: true, nombreTotal: 6, nombreARetenir: 4, methodeSelection: 'meilleurs', minimumCompletion: 2 } } },
            { id: 'pratique_1788364991518_1_f79a585f3c32', nom: 'Modèle sommatif', type: 'sommative', dansBibliotheque: true, configuration: { methodeCalcul: 'moyenne-ponderee' } }
        ]);
        try {
            window.afficherSection('conception');
            window.afficherSousSection('conception-pratiques-notation');
            window.chargerPratiquePourModif(PAN_STD_ID);   // ce que le choix de la pratique, dans le menu de la sélection (#1147), appelle
        } catch (e) {
            return { erreur: 'montage planté : ' + e.message };
        }
        return { diagnosticAvant: window._diagnostiquerNoteNonCalculable() };
    }, { PAN_STD_ID, GC_ID });
    expect(montage.erreur, `Erreur de montage : ${montage.erreur}`).toBeUndefined();
    // Le diagnostic, AVANT le geste : il dit que rien n'est assigné (avant le correctif : « introuvable »).
    expect(montage.diagnosticAvant).toMatch(/[Aa]ucune pratique de notation n'est assignée/);

    // Le menu de la sélection (#1147) liste la PAN-STD, et aucun « (active) » nulle part.
    const actives = () => page.evaluate(() => [...(document.getElementById('menuPratiques')?.options || [])]
        .filter(o => o.textContent.endsWith(' (active)')).map(o => o.value));
    await page.waitForFunction((id) => !!document.querySelector(`#menuPratiques option[value="${id}"]`), PAN_STD_ID, { timeout: 10000 });
    expect(await actives()).toEqual([]);

    // Le geste de l'enseignant : le bouton « Appliquer au cours actif », par le dispatcher réel.
    await page.evaluate(() => { document.querySelector('button[data-action="appliquerPratiqueAuCoursActive"]').click(); });

    // AVANT le correctif : `groupesCours[0].pratiqueId` reste null, cette attente expire.
    const apres = await (await page.waitForFunction((GC_ID) => {
        const gcs = window.db.getSync(window.cle('groupesCours'), []) || [];
        const gc = gcs.find(g => g && g.id === GC_ID);
        return (gc && gc.pratiqueId) ? { pratiqueId: gc.pratiqueId, pointeur: (window.db.getSync('groupeCoursActif', {}) || {}).pratiqueId || null } : null;
    }, GC_ID, { timeout: 10000 })).jsonValue();
    expect(apres.pratiqueId).toBe(PAN_STD_ID);
    expect(apres.pointeur).toBe(PAN_STD_ID);

    // Le menu le montre : « (active) » après le nom de la PAN-STD, et d'elle seule.
    await page.waitForFunction((id) => / \(active\)$/.test(document.querySelector(`#menuPratiques option[value="${id}"]`)?.textContent || ''), PAN_STD_ID, { timeout: 10000 });
    expect(await actives()).toEqual([PAN_STD_ID]);

    // Et le profil ne parle plus de pratique introuvable : la pratique est assignée et résolue.
    const diagnosticApres = await page.evaluate(() => ({
        active: window.obtenirIdPratiqueActive(),
        resolue: !!window.obtenirPratiqueParId(window.obtenirIdPratiqueActive())
    }));
    expect(diagnosticApres.active).toBe(PAN_STD_ID);
    expect(diagnosticApres.resolue).toBe(true);
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});
