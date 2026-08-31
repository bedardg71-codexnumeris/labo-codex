import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// Bandeaux de jalon (transitions.js) : depuis le ciblage par section, chaque
// bandeau ne s'affiche que dans sa/ses section(s) pertinente(s). Régression
// visée : le message « signaux qui méritent attention » débordait sur l'accueil
// (il relève du Suivi). Le test seede la démo (évaluations présentes), puis
// vérifie : aucun bandeau sur l'accueil, un bandeau sur le Suivi.

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i
];
const estErreurAttendue = (msg) => patternsAttendus.some((re) => re.test(msg));

function brancherErreurs(page, erreurs) {
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
}

test('transitions — bandeau de jalon ciblé par section (accueil propre, Suivi le montre)', async ({ page }) => {
    const erreurs = [];
    brancherErreurs(page, erreurs);

    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const resultat = await page.evaluate(async () => {
        if (typeof window.activerModeDemo !== 'function') return { erreur: 'activerModeDemo absent' };
        if (!window.transitions || typeof window.transitions.fermerBandeau !== 'function') {
            return { erreur: 'window.transitions absent' };
        }

        // Seed démo : groupe-cours actif + évaluations enregistrées → conditions
        // des bandeaux remplies.
        await window.activerModeDemo();

        // État déterministe : marquer les 3 jalons « non vus » (clés démo).
        if (typeof window.definirPreference === 'function') {
            ['transition_num_crois_vue', 'transition_crois_obs_vue', 'transition_obs_comp_vue']
                .forEach((p) => window.definirPreference(p + '_demo', false));
        }
        // Aucune neutralisation à poser ici : depuis le retrait de l'avis daté
        // (#639, 31 août 2026), TOUTES les entrées de transitions.js sont des
        // jalons ciblés par section. Si une entrée SANS `sections` réapparaît un
        // jour, ce test rougira sur l'accueil — et c'est exactement ce qu'on veut
        // qu'il fasse, plutôt que de la neutraliser d'avance.

        const attendre = (ms) => new Promise((r) => setTimeout(r, ms));

        // 1) Accueil : tous les bandeaux ciblent Suivi/Évaluations → aucun ne doit
        //    apparaître ici (c'était la régression).
        window.transitions.fermerBandeau();
        window.afficherSection('accueil');
        await attendre(900);   // event sectionAffichee + setTimeout(500) interne
        const surAccueil = !!document.getElementById('transition-bandeau');

        // 2) Suivi : un bandeau de jalon doit apparaître (réf au tableau de bord).
        window.transitions.fermerBandeau();
        window.afficherSection('suivi');
        await attendre(900);
        const el = document.getElementById('transition-bandeau');
        const texteSuivi = el ? el.textContent : '';

        // Métadonnées de ciblage exposées (verrou de structure).
        const T = window.transitions.TRANSITIONS || [];
        const mapping = {};
        T.forEach((t) => { mapping[t.id] = t.sections; });

        return {
            surAccueil,
            aBanniereSuivi: !!el,
            texteSuivi,
            mapping
        };
    });

    expect(resultat.erreur, `Erreur eval : ${resultat.erreur}`).toBeUndefined();

    // Ciblage : rien sur l'accueil, un bandeau sur le Suivi (réf au tableau de bord).
    expect(resultat.surAccueil).toBe(false);
    expect(resultat.aBanniereSuivi).toBe(true);
    expect(resultat.texteSuivi).toContain('tableau de bord');

    // Verrou de structure : le mapping section reste explicite.
    // L'avis daté #508 n'a volontairement PAS de champ `sections` (il doit être vu
    // partout) : il est absent de ces assertions, pas oublié.
    expect(resultat.mapping['observation-competence']).toEqual(['suivi']);
    expect(resultat.mapping['croisement-observation']).toEqual(['suivi']);
    expect(resultat.mapping['numerisation-croisement']).toEqual(['evaluations']);

    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});
