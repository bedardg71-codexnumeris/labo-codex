import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// PORTE #763 — LA PRATIQUE APPLIQUÉE DANS CONCEPTION SE VOIT DANS LE CADRE, AU RETOUR SUR LE FORMULAIRE.
//
// Demande de Grégoire, 6 septembre 2026, 8 h 30 (après 1.123.3, deux captures) : « Quand j'active la
// pratique dans Conception › Pratiques de notation, je voudrais que le dropdown dans Cadre se mette à
// jour et affiche l'activation. » Son champ 6 (« Pratique de notation ») disait encore « — À compléter
// quand configurée — » après l'application.
//
// CE QUI SE PASSAIT. Le formulaire du groupe-cours (section Calendrier › « Cadre », sous-section
// `calendrier-trimestre`) est rempli par `initialiserTrimestreV2` UNE fois, au chargement de la page.
// L'initialisateur que navigation.js appelle à chaque affichage de cette sous-section s'appelle
// `initialiserModuleTrimestre` — un nom que plus rien ne définit depuis le retrait du code mort de
// trimestre.js (5ccb3063, 22 mai 2026) : `typeof … === 'function'` le taisait. Le Cadre montrait donc
// l'état du stockage AU CHARGEMENT, pas celui du moment. Les modules ne se parlent pas directement :
// c'est le Cadre qui relit le stockage quand on l'affiche.
//
// Aucun `page.click` ni `waitForTimeout` : les gestes sont ceux que les `data-action` appellent, et on
// attend des rendus.

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i
];

test('Porte #763 · appliquer la pratique dans Conception, revenir au Cadre : le champ « Pratique de notation » la montre', async ({ page }) => {
    const erreurs = [];
    const estAttendue = (m) => patternsAttendus.some((re) => re.test(m));
    page.on('pageerror', (e) => { const m = `pageerror: ${e.message}`; if (!estAttendue(m)) erreurs.push(m); });
    page.on('console', (msg) => {
        if (msg.type() === 'error') { const m = `console.error: ${msg.text()}`; if (!estAttendue(m)) erreurs.push(m); }
    });
    page.on('dialog', (d) => d.accept().catch(() => {}));

    await page.goto(indexHtml);
    await page.waitForFunction(() => typeof window.afficherSection === 'function' && typeof window.chargerPratiquePourModif === 'function'
        && typeof window.appliquerPratiqueAuCoursActive === 'function' && typeof window.db !== 'undefined');

    const PAN_STD_ID = 'pratique_1787056354696_6_21166f8ca720';
    const GC_ID = 'GC_1786388814118_2_3068cb8e2a5b';
    const montage = await page.evaluate(({ PAN_STD_ID, GC_ID }) => {
        const trimestreId = 'test763';
        window.db.setSync('trimestres', [{ id: trimestreId, nom: 'Trimestre test', session: 'A', annee: 2026, actif: true }]);
        window.db.setSync('trimestreActif', trimestreId);
        const coursId = 'cours-763';
        window.db.setSync('cours', [{ id: coursId, codeCours: 'FRA101', nomCours: 'Écriture', dansBibliotheque: true }]);
        window.db.setSync('infoCours', { id: coursId, codeCours: 'FRA101', groupe: '00007', _groupeCoursId: GC_ID }); // security-ok: fixture de test, littéral du fichier
        window.db.setSync('groupeCoursActif', { id: GC_ID, trimestreId });
        window.db.setSync(trimestreId + '_groupesCours', [{ id: GC_ID, trimestreId, coursId, groupeNum: '00007', pratiqueId: null, actif: true }]);
        window.db.setSync(window.cle('echellesTemplates'), [{ id: 'ECH_1', nom: 'IDME', niveaux: [ // security-ok: fixture de test
            { code: 'I', nom: 'Insuffisant', min: 0, max: 64, valeurCalcul: 40 }, { code: 'M', nom: 'Maîtrisé', min: 65, max: 100, valeurCalcul: 80 } ] }]);
        window.db.setSync(window.cle('pratiquesConfigurables'), [{ id: PAN_STD_ID, nom: 'PAN-SDT-Litt A26', type: 'standards', dansBibliotheque: true, // security-ok: fixture de test
            calcul_note: { methode: 'conversion_niveaux' }, configuration: { echelleId: 'ECH_1', varianteCalcul: 'n-meilleurs', portfolio: { nombreARetenir: 4 } } }]);
        try {
            // 1. Le Cadre d'abord : le formulaire du groupe-cours actif s'affiche, champ 6 vide.
            window.afficherSection('calendrier');
            window.afficherSousSection('calendrier-trimestre');
        } catch (e) {
            return { erreur: 'montage planté : ' + e.message };
        }
        return { ok: true };
    }, { PAN_STD_ID, GC_ID });
    expect(montage.erreur, `Erreur de montage : ${montage.erreur}`).toBeUndefined();

    // Le champ 6 existe, porte la PAN-STD parmi ses options, et vaut « » (rien d'assigné).
    await page.waitForFunction((id) => {
        const s = document.getElementById('v2-gc-pratique');
        return !!(s && Array.from(s.options).some(o => o.value === id));
    }, PAN_STD_ID, { timeout: 10000 });
    expect(await page.evaluate(() => document.getElementById('v2-gc-pratique').value)).toBe('');

    // 2. Conception › Pratiques : ouvrir la PAN-STD, « Appliquer au cours actif » (le bouton réel).
    await page.evaluate((id) => {
        window.afficherSection('conception');
        window.afficherSousSection('conception-pratiques-notation');
        window.chargerPratiquePourModif(id);
        document.querySelector('button[data-action="appliquerPratiqueAuCoursActive"]').click();
    }, PAN_STD_ID);
    await page.waitForFunction((GC_ID) => {
        const gc = (window.db.getSync(window.cle('groupesCours'), []) || []).find(g => g && g.id === GC_ID);
        return !!(gc && gc.pratiqueId);
    }, GC_ID, { timeout: 10000 });

    // 3. Retour au Cadre : AVANT le correctif, le champ 6 gardait sa valeur du chargement (« »).
    await page.evaluate(() => {
        window.afficherSection('calendrier');
        window.afficherSousSection('calendrier-trimestre');
    });
    const valeur = await (await page.waitForFunction((id) => {
        const s = document.getElementById('v2-gc-pratique');
        return (s && s.value === id) ? s.value : null;
    }, PAN_STD_ID, { timeout: 10000 })).jsonValue();
    expect(valeur).toBe(PAN_STD_ID);
    // Et le libellé que l'enseignant lit dans le menu est le nom de sa pratique.
    const libelle = await page.evaluate(() => { const s = document.getElementById('v2-gc-pratique'); return s.options[s.selectedIndex].textContent; });
    expect(libelle).toBe('PAN-SDT-Litt A26');
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});
