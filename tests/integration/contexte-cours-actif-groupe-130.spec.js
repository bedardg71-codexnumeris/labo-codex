import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// Bug #130 (terrain lancement, 3 juin 2026) — Le Suivi affichait « 0 personne »
// alors que le groupe-cours était assemblé et actif : `infoCours.groupe` restait
// périmé (« 00001 », hérité d'un write de cours legacy) tandis que le groupe-cours
// actif portait « 00002 » dans `groupeNum`. Le filtre comparait groupe étudiant
// (« 00002 ») au cache périmé (« 00001 ») → personne.
//
// Le correctif (obtenirContexteCoursActif, js/modes.js) dérive le groupe actif
// depuis l'entrée actif===true de cle('groupesCours') (SSOT) quand elle vise le
// même cours, plutôt que depuis le cache infoCours.
//
// Ce test reproduit l'état exact et vérifie que obtenirEtudiantsCoursActif()
// renvoie les étudiants du groupe RÉELLEMENT actif (00002), pas ceux du groupe
// périmé (00001).

test('Bug #130 · groupe résolu depuis le groupe-cours actif, pas le infoCours périmé', async ({ page }) => {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const r = await page.evaluate(() => {
        if (typeof window.obtenirEtudiantsCoursActif !== 'function') {
            return { erreur: 'obtenirEtudiantsCoursActif absent' };
        }
        if (typeof window.cle !== 'function' || typeof window.db === 'undefined') {
            return { erreur: 'cle/db absents' };
        }

        const COURS_ID = 'COURS_TEST_130';

        // infoCours PÉRIMÉ : bon cours, mais groupe resté sur « 00001 ».
        window.db.setSync('infoCours', { id: COURS_ID, codeCours: '601-102', groupe: '00001', _modeCours: false });

        // SSOT : groupe-cours actif visant le même cours, groupe réel « 00002 ».
        window.db.setSync(window.cle('groupesCours'), [
            { id: 'GC_TEST_130', actif: true, coursId: COURS_ID, groupeNum: '00002', modeCours: false }
        ]);

        // Étudiants : 2 dans 00002 (le groupe actif réel), 1 dans 00001 (périmé).
        window.db.setSync(window.cle('groupeEtudiants'), [
            { da: '9000101', groupe: '00002', nom: 'Bélisle', prenom: 'Camille' },
            { da: '9000107', groupe: '00002', nom: 'Bertrand', prenom: 'Yolande' },
            { da: '9990001', groupe: '00001', nom: 'Ancien', prenom: 'Groupe' }
        ]);

        const etudiants = window.obtenirEtudiantsCoursActif();
        const das = etudiants.map((e) => e.da).sort();

        return { nb: etudiants.length, das };
    });

    expect(r.erreur, `Erreur eval : ${r.erreur}`).toBeUndefined();
    // Comportement observable : seuls les 2 étudiants du groupe RÉELLEMENT actif
    // (00002, via le groupe-cours actif) sont retournés — pas celui du groupe
    // périmé (00001) qu'aurait sélectionné le cache infoCours non corrigé.
    expect(r.das).toEqual(['9000101', '9000107']);
    expect(r.nb).toBe(2);
});
