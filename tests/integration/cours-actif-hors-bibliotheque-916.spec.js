import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.resolve(__dirname, '../../index.html');

// #916 (rapport de Grégoire, 18 sept. 2026, 1.144.0) — le symptôme VÉCU, sur la vraie page :
// trimestre actif archivé dont le groupe-cours pointe un cours absent de la bibliothèque
// globale `cours`. Avant : RangeError au démarrage (changerCoursSelectionneV2 ⇄
// chargerDropdownCoursV2), toast « Cours introuvable », et #selectTrimestreActif resté sur
// « Chargement... » — impossible de changer de trimestre. Le mécanisme est verrouillé en
// Vitest (sentinelle-cours-actif-hors-bibliotheque-916) ; ce banc verrouille l'ÉCRAN.

const TA = 'a2025';
const TB = 'a2026';
const COURS_ABSENT = 'COURS1766455789356';

test('#916 · cours actif hors bibliothèque : le sélecteur de trimestre se remplit, rien ne boucle', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    await page.goto(indexHtml);
    await page.waitForFunction(() => typeof window.db !== 'undefined' && typeof window.afficherSection === 'function');
    await page.evaluate(({ TA, TB, COURS_ABSENT }) => {
        // security-ok: fixtures littérales du banc, aucune source externe.
        window.db.setSync('trimestres', [
            { id: TA, nom: 'Automne 2025', annee: 2025, session: 'A', actif: true, archive: true },
            { id: TB, nom: 'Automne 2026', annee: 2026, session: 'A', actif: false, archive: false }
        ]);
        // La bibliothèque porte UN cours — pas celui du groupe-cours actif.
        window.db.setSync('cours', [{ id: 'a2026-601-101-MQ', codeCours: '601-101-MQ', nomCours: 'Écriture et littérature' }]);
        window.db.setSync(TA + '_groupesCours', [{ id: 'GC916', trimestreId: TA, coursId: COURS_ABSENT, groupeNum: '00001', pratiqueId: 'sommative', actif: true }]);
        window.db.setSync(TA + '_groupeEtudiants', [{ da: '9160001', nom: 'Gagnon', prenom: 'Léa', groupe: '00001', coursId: COURS_ABSENT, groupeCoursId: 'GC916' }]);
        window.db.setSync('trimestreActif', TA);
        // Le miroir tel que l'orchestre le fabrique pour un cours absent : code et nom vides.
        window.db.setSync('infoCours', { id: COURS_ABSENT, codeCours: '', nomCours: '', groupe: '00001', _modeCours: false, _source: 'groupe-cours', _groupeCoursId: 'GC916' });
        window.db.setSync('groupeCoursActif', { modeCours: false, id: 'GC916', trimestreId: TA, coursId: COURS_ABSENT, groupe: '00001' });
    }, { TA, TB, COURS_ABSENT });
    await page.reload();
    await page.waitForFunction(() => typeof window.db !== 'undefined' && typeof window.afficherSection === 'function');

    // Le trajet du rapport : Cadre › Trimestre.
    await page.evaluate(() => { window.afficherSection('calendrier'); window.afficherSousSection('calendrier-trimestre'); });
    await page.waitForFunction(() => {
        const s = document.getElementById('selectTrimestreActif');
        return !!s && Array.from(s.options).some(o => o.value === 'a2026');
    }, null, { timeout: 10000 });

    const etat = await page.evaluate(() => ({
        options: Array.from(document.getElementById('selectTrimestreActif').options).map(o => o.value),
        toasts: document.body.textContent.includes('Cours introuvable'),
        miroir: (window.db.getSync('infoCours', null) || {}).id
    }));
    expect(etat.options).toEqual(expect.arrayContaining([TA, TB]));
    expect(etat.toasts).toBe(false);
    expect(etat.miroir).toBe(COURS_ABSENT);          // le stock n'est pas touché
    expect(erreurs.filter(e => /call stack/i.test(e))).toEqual([]);
});
