import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #508 — Avis daté « identification à l'entrée au 1er septembre 2026 ».
//
// L'avis est une entrée de transitions.js, mais il ne se comporte PAS comme un
// jalon de parcours, et c'est exactement ce que ce test verrouille :
//   1. il s'affiche sur l'ACCUEIL (les jalons, eux, sont ciblés par section) ;
//   2. il passe DEVANT les jalons (première entrée du tableau) ;
//   3. sa clé de mémorisation est UNIQUE, sans suffixe `_demo` ;
//   4. sa condition est DATÉE : il s'éteint seul le 1er septembre 2026.
//
// Le point 4 est le plus important. L'avis annonce un futur ; passé la date, il
// annonce un futur révolu, et un avis périmé apprend au lecteur à ne plus lire
// cette zone de l'écran — celle où vivent aussi les jalons du parcours.

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

test('#508 — avis daté : visible sur l\'accueil, clé unique, et s\'éteint le 1er septembre', async ({ page }) => {
    const erreurs = [];
    brancherErreurs(page, erreurs);

    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const resultat = await page.evaluate(async () => {
        if (!window.transitions || typeof window.transitions.fermerBandeau !== 'function') {
            return { erreur: 'window.transitions absent' };
        }
        if (typeof window.definirPreference !== 'function') {
            return { erreur: 'definirPreference absent' };
        }
        const attendre = (ms) => new Promise((r) => setTimeout(r, ms));

        const T = window.transitions.TRANSITIONS || [];
        const avis = T[0];
        const structure = {
            estPremier: !!avis && avis.id === 'avis-identification-2026-09-01',
            sansCiblageSection: !!avis && !avis.sections,
            ignorerModeDemo: !!avis && avis.ignorerModeDemo === true,
            pref: avis ? avis.dejaVuePref : null,
            variante: avis ? avis.variante : null
        };

        // --- Condition datée -------------------------------------------------
        // On substitue Date le temps de deux appels : `new Date()` (sans
        // argument) renvoie la date simulée, tandis que `new Date(2026, 8, 1…)`
        // (avec arguments) garde son comportement normal. La condition compare
        // précisément ces deux formes.
        const VraiDate = Date;
        function simulerDate(y, m, d) {
            window.Date = class extends VraiDate {
                constructor(...args) {
                    if (args.length === 0) super(y, m, d, 12, 0, 0);
                    else super(...args);
                }
            };
        }
        let avant31aout = null, le1erSeptembre = null, apres = null;
        try {
            simulerDate(2026, 7, 31);  // 31 août
            avant31aout = avis.condition();
            simulerDate(2026, 8, 1);   // 1er septembre, midi
            le1erSeptembre = avis.condition();
            simulerDate(2026, 9, 15);  // 15 octobre
            apres = avis.condition();
        } finally {
            window.Date = VraiDate;
        }

        // --- Affichage sur l'accueil ----------------------------------------
        window.definirPreference(avis.dejaVuePref, false);
        window.transitions.fermerBandeau();
        window.afficherSection('accueil');
        await attendre(900);   // sectionAffichee + setTimeout(500) interne

        const el = document.getElementById('transition-bandeau');
        const affiche = !!el;
        const porteLaVariante = affiche && el.classList.contains('transition-bandeau--avis');
        const role = affiche ? el.getAttribute('role') : null;
        const aUnTitre = affiche && !!el.querySelector('.transition-bandeau-titre');
        const texte = affiche ? el.textContent : '';

        // --- Fermeture : mémorisation sous la clé unique ---------------------
        let prefApresFermeture = null, disparu = null;
        if (affiche) {
            el.querySelector('.transition-bandeau-fermer').click();
            await attendre(100);
            disparu = !document.getElementById('transition-bandeau');
            prefApresFermeture = window.obtenirPreference(avis.dejaVuePref);
        }

        // Remettre l'état par défaut pour ne pas polluer les specs suivants
        // (workers:1, localStorage partagé sur l'origine file://).
        window.definirPreference(avis.dejaVuePref, false);

        return {
            structure, avant31aout, le1erSeptembre, apres,
            affiche, porteLaVariante, role, aUnTitre, texte,
            disparu, prefApresFermeture
        };
    });

    expect(resultat.erreur, `Erreur eval : ${resultat.erreur}`).toBeUndefined();

    // 1) Structure : première entrée, sans ciblage de section, clé unique.
    expect(resultat.structure.estPremier).toBe(true);
    expect(resultat.structure.sansCiblageSection).toBe(true);
    expect(resultat.structure.ignorerModeDemo).toBe(true);
    expect(resultat.structure.pref).toBe('avis_identification_2026_09_vue');
    expect(resultat.structure.variante).toBe('avis');

    // 2) Condition datée : vraie avant, fausse le jour même et après.
    //    C'est le verrou anti-avis-périmé.
    expect(resultat.avant31aout).toBe(true);
    expect(resultat.le1erSeptembre).toBe(false);
    expect(resultat.apres).toBe(false);

    // 3) Affichage sur l'accueil, avec sa variante visuelle et son rôle ARIA.
    expect(resultat.affiche).toBe(true);
    expect(resultat.porteLaVariante).toBe(true);
    expect(resultat.role).toBe('alert');
    expect(resultat.aUnTitre).toBe(true);
    expect(resultat.texte).toContain('septembre');
    expect(resultat.texte).toContain('identification');

    // 4) Fermeture : le bandeau disparaît ET la préférence est écrite.
    expect(resultat.disparu).toBe(true);
    expect(resultat.prefApresFermeture).toBe(true);

    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});
