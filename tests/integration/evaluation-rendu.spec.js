import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// Chantier I (Cat-B Track 4) — Tests Playwright rendu DOM evaluation.
// 2 tests :
//   1. Palette critères — afficherCriteresDepuisGrille rend chaque critère
//      avec son select de niveaux IDME.
//   2. Rétroaction Bilan — basculerVueRetroaction('bilan') déclenche
//      genererRetroactionBilan() qui rend les défis prioritaires +
//      les forces dans #contenuRetroBilan.

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i
];
const estErreurAttendue = (msg) => patternsAttendus.some((re) => re.test(msg));

function attacherCaptureErreurs(page, erreurs) {
    page.on('pageerror', (e) => {
        const m = `pageerror: ${e.message}`;
        if (!estErreurAttendue(m)) erreurs.push(m);
    });
    page.on('console', (msg) => {
        if (msg.type() === 'error') {
            const m = `console.error: ${msg.text()}`;
            if (!estErreurAttendue(m)) erreurs.push(m);
        }
    });
    page.on('dialog', (d) => d.dismiss().catch(() => {}));
}

test('Chantier I · evaluation rend la palette critères (cartes + niveaux IDME)', async ({ page }) => {
    const erreurs = [];
    attacherCaptureErreurs(page, erreurs);

    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const resultat = await page.evaluate(() => {
        if (typeof window.afficherCriteresDepuisGrille !== 'function') {
            return { erreur: 'window.afficherCriteresDepuisGrille absent' };
        }
        if (typeof window.db === 'undefined') return { erreur: 'window.db absent' };

        // Fixtures : 1 grille (2 critères) + 1 échelle IDME standard
        const grille = {
            id: 'grille-test-chantierI',
            nom: 'Grille test',
            criteres: [
                { id: 'c1', nom: 'Idéation', ponderation: 40 },
                { id: 'c2', nom: 'Structure du texte', ponderation: 60 }
            ]
        };
        const echelle = {
            id: 'echelle-test-chantierI',
            nom: 'IDME standard',
            niveaux: [
                { code: 'I', nom: 'Incomplet' },
                { code: 'D', nom: 'en Développement' },
                { code: 'M', nom: 'Maîtrisé' },
                { code: 'E', nom: 'Étendu' }
            ]
        };
        window.db.setSync('grillesTemplates', [grille]);
        window.db.setSync('echellesTemplates', [echelle]);

        // Initialiser le pivot minimal (consulté par afficherCriteresDepuisGrille
        // dans sa logique de pré-cochage)
        window.evaluationEnCours = window.evaluationEnCours || { criteres: {} };

        try {
            window.afficherCriteresDepuisGrille(grille.id, echelle.id);
        } catch (e) {
            return { erreur: 'afficherCriteresDepuisGrille a planté : ' + e.message };
        }

        const liste = document.getElementById('listeCriteresGrille1');
        if (!liste) return { erreur: '#listeCriteresGrille1 absent du DOM' };

        const html = liste.innerHTML;
        return {
            longueur: html.length,
            aIdeation: html.includes('Idéation'),
            aStructure: html.includes('Structure du texte'),
            aPonderation40: html.includes('(40%)'),
            aPonderation60: html.includes('(60%)'),
            nbCartesCriteres: liste.querySelectorAll('.eval-critere-carte').length,
            nbSelectsNiveaux: liste.querySelectorAll('select.eval-select-niveau').length,
            aSelectC1: !!liste.querySelector('#eval_c1'),
            aSelectC2: !!liste.querySelector('#eval_c2'),
            // Chaque select doit contenir 4 options IDME (+ option vide)
            nbOptionsC1: liste.querySelector('#eval_c1')?.options.length || 0,
            aOptionI: html.includes('>I - Incomplet<'),
            aOptionD: html.includes('>D - en Développement<'),
            aOptionM: html.includes('>M - Maîtrisé<'),
            aOptionE: html.includes('>E - Étendu<')
        };
    });

    expect(resultat.erreur, `Erreur eval : ${resultat.erreur}`).toBeUndefined();
    expect(resultat.longueur).toBeGreaterThan(500);
    expect(resultat.aIdeation).toBe(true);
    expect(resultat.aStructure).toBe(true);
    expect(resultat.aPonderation40).toBe(true);
    expect(resultat.aPonderation60).toBe(true);
    expect(resultat.nbCartesCriteres).toBe(2);
    expect(resultat.nbSelectsNiveaux).toBe(2);
    expect(resultat.aSelectC1).toBe(true);
    expect(resultat.aSelectC2).toBe(true);
    expect(resultat.nbOptionsC1).toBe(5); // 4 niveaux + 1 option vide
    expect(resultat.aOptionI).toBe(true);
    expect(resultat.aOptionD).toBe(true);
    expect(resultat.aOptionM).toBe(true);
    expect(resultat.aOptionE).toBe(true);

    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

test('Chantier I · evaluation rend la rétroaction Bilan (défis prioritaires + forces)', async ({ page }) => {
    const erreurs = [];
    attacherCaptureErreurs(page, erreurs);

    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const resultat = await page.evaluate(() => {
        if (typeof window.basculerVueRetroaction !== 'function') {
            return { erreur: 'window.basculerVueRetroaction absent' };
        }
        if (typeof window.db === 'undefined') return { erreur: 'window.db absent' };

        // Fixtures : étudiant + grille + critères + evaluationEnCours
        const grille = {
            id: 'grille-bilan-chantierI',
            nom: 'Grille bilan',
            criteres: [
                { id: 'c1', nom: 'Idéation', ponderation: 40 },
                { id: 'c2', nom: 'Structure', ponderation: 30 },
                { id: 'c3', nom: 'Langue', ponderation: 30 }
            ]
        };
        window.db.setSync('grillesTemplates', [grille]);
        window.db.setSync(window.cle('evaluationsSauvegardees'), []);

        // Pivot evaluationEnCours minimal avec 1 défi 'I' et 2 forces 'M'
        // pour que le bilan rende défis + forces
        window.evaluationEnCours = {
            etudiantDA: 'TEST001',
            grilleId: grille.id,
            productionId: 'prod-test',
            criteres: { c1: 'I', c2: 'M', c3: 'M' }
        };

        // Basculer vers la vue bilan → déclenche genererRetroactionBilan()
        try {
            window.basculerVueRetroaction('bilan');
        } catch (e) {
            return { erreur: 'basculerVueRetroaction a planté : ' + e.message };
        }

        const conteneur = document.getElementById('contenuRetroBilan');
        if (!conteneur) return { erreur: '#contenuRetroBilan absent du DOM' };

        const vueBilan = document.getElementById('vueRetroBilan');
        const visible = vueBilan && !vueBilan.classList.contains('u-hide');

        const html = conteneur.innerHTML;
        const texte = conteneur.textContent || '';
        return {
            longueur: html.length,
            vueVisible: visible,
            // Phrase d'introduction du bilan
            aPhrasePreambule: texte.includes('standards sont très élevés'),
            // Titre « Présentement, il faut se concentrer sur »
            aTitrePresentement: texte.includes('Présentement, il faut se concentrer'),
            // Le défi 'Idéation' (niveau I) doit être présent
            aDefi: texte.includes('Idéation'),
            // Section forces doit présenter les critères 'M'
            aMentionForce: texte.includes('Structure') || texte.includes('Langue')
        };
    });

    expect(resultat.erreur, `Erreur eval : ${resultat.erreur}`).toBeUndefined();
    expect(resultat.vueVisible).toBe(true);
    expect(resultat.longueur).toBeGreaterThan(200);
    expect(resultat.aPhrasePreambule).toBe(true);
    expect(resultat.aTitrePresentement).toBe(true);
    expect(resultat.aDefi).toBe(true);
    expect(resultat.aMentionForce).toBe(true);

    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});
