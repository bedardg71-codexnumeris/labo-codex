import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// Chantier I (Cat-B Track 4) — Test Playwright rendu DOM profil-etudiant.
// Vérifie que afficherProfilComplet(da) peuple #contenuProfilEtudiant avec
// la section Productions (active par défaut, cf. profil-etudiant-sections-
// affichage.js:1741 `sectionProfilActive = 'productions'`). Attrape les
// régressions silencieuses post-refactor où l'orchestrateur charge sans
// erreur mais produit un DOM cassé ou vide.
//
// Dette résiduelle évoquée dans METHODE §7 profil-etudiant (test Section
// Productions par défaut suggéré comme priorité pour ce module).

test('Chantier I · profil-etudiant rend la Section Productions (rangée + tableau)', async ({ page }) => {
    const erreurs = [];
    const patternsAttendus = [
        /version\.json.*access control/i,
        /Cross origin requests are only supported/i,
        /Not allowed to load local resource.*\.(svg|png)/i
    ];
    const estErreurAttendue = (msg) => patternsAttendus.some((re) => re.test(msg));
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
    // Auto-dismiss alert ('Élève introuvable') sans bloquer le test
    page.on('dialog', (d) => d.dismiss().catch(() => {}));

    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const resultat = await page.evaluate(() => {
        if (typeof window.afficherProfilComplet !== 'function') {
            return { erreur: 'window.afficherProfilComplet absent' };
        }
        if (typeof window.db === 'undefined' || typeof window.cle !== 'function') {
            return { erreur: 'window.db ou window.cle absent' };
        }

        // Fixtures minimales pour permettre le rendu
        // 1. Cours actif (sinon obtenirEtudiantsCoursActif() retourne [])
        window.db.setSync('infoCours', {
            id: 'cours-test-chantierI',
            codeCours: 'FRA101',
            groupe: '01',
            _modeCours: true
        });

        // 2. Étudiant + production fixture
        const etudiants = [
            { da: 'TEST001', nom: 'Tremblay', prenom: 'Alex', groupe: '01', coursId: 'cours-test-chantierI' }
        ];
        const productions = [
            {
                id: 'prod-test-1',
                type: 'production',
                activiteApprentissage: 'Dissertation Hamlet',
                description: 'Production test chantier I',
                dateEcheance: '2026-04-01',
                groupes: ['01']
            }
        ];
        window.db.setSync(window.cle('groupeEtudiants'), etudiants);
        window.db.setSync(window.cle('productions'), productions);
        window.db.setSync(window.cle('evaluationsSauvegardees'), []);

        try {
            window.afficherProfilComplet('TEST001');
        } catch (e) {
            return { erreur: 'afficherProfilComplet a planté : ' + e.message };
        }

        const container = document.getElementById('contenuProfilEtudiant');
        if (!container) return { erreur: '#contenuProfilEtudiant absent du DOM' };

        const html = container.innerHTML;
        return {
            longueur: html.length,
            // #1151 : la rangée de sélection au lieu de la barre latérale ; ‹ et › au lieu de « Préc. » / « Suiv. ».
            aRangee: !!container.querySelector('.rangee-selection-profil'),
            aLayoutSidebar: !!container.querySelector('.layout-sidebar-2col'),
            aSelecteurEtudiant: !!container.querySelector('.rangee-selection-profil #selecteurEtudiantProfil'),
            aBoutonPrec: !!container.querySelector('#profilElevePrecedent[aria-label="Étudiant·e précédent·e"]'),
            aBoutonSuiv: !!container.querySelector('#profilEleveSuivant[aria-label="Étudiant·e suivant·e"]'),
            aNomEtudiant: html.includes('Tremblay') && html.includes('Alex'),
            // Marqueurs Section Productions par défaut
            aSectionProductions:
                html.includes('Productions') ||
                html.includes('Dissertation Hamlet'),
            // Productions configurée doit apparaître
            aActiviteProduction: html.includes('Dissertation Hamlet')
        };
    });

    expect(resultat.erreur, `Erreur eval : ${resultat.erreur}`).toBeUndefined();
    expect(resultat.longueur).toBeGreaterThan(500);
    expect(resultat.aRangee).toBe(true);
    expect(resultat.aLayoutSidebar).toBe(false);
    expect(resultat.aSelecteurEtudiant).toBe(true);
    expect(resultat.aBoutonPrec).toBe(true);
    expect(resultat.aBoutonSuiv).toBe(true);
    expect(resultat.aNomEtudiant).toBe(true);
    expect(resultat.aSectionProductions).toBe(true);
    expect(resultat.aActiviteProduction).toBe(true);

    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});
