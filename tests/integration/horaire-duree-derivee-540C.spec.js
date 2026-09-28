import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// PORTE NAVIGATEUR #540 LOT C — l'écran Horaire affiche ce que l'assiduité compte.
//
// La sentinelle unitaire éprouve les fonctions de mesure. Ici on vérifie que les DEUX
// chaînes tombent sur le même nombre dans le vrai navigateur : celle de l'affichage
// (`periodesParSemaine`) et celle du calcul d'assiduité (`obtenirNombrePeriodesSeance`).
// C'est la divergence de l'audit du 26 août, et c'est le seul endroit où on peut la voir.

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i
];

function brancherEcouteurs(page) {
    const erreurs = [];
    const estAttendue = (m) => patternsAttendus.some((re) => re.test(m));
    page.on('pageerror', (e) => { const m = `pageerror: ${e.message}`; if (!estAttendue(m)) erreurs.push(m); });
    page.on('console', (msg) => {
        if (msg.type() === 'error') { const m = `console.error: ${msg.text()}`; if (!estAttendue(m)) erreurs.push(m); }
    });
    page.on('dialog', (d) => d.dismiss());
    return erreurs;
}

async function preparer(page) {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
}

test('#540-C · affichage et assiduité tombent sur le MÊME nombre de périodes', async ({ page }) => {
    const erreurs = brancherEcouteurs(page);
    await preparer(page);

    const r = await page.evaluate(async () => {
        for (const dep of ['periodesParSemaine', 'obtenirNombrePeriodesSeance', 'mesurerDureeSeance']) {
            if (typeof window[dep] !== 'function') return { erreur: `window.${dep} absent` };
        }

        // La séance telle que `sauvegarderHoraireV2` l'écrit : ni `duree`, ni
        // `nombrePeriodes`. C'est le cas courant, celui qui tombait sur le repli à 2.
        const seance3h = { jour: 'Lundi', heureDebut: '08:00', heureFin: '11:00', local: '' };

        // Chaîne AFFICHAGE
        const cotéEcran = window.periodesParSemaine([seance3h]);

        // Chaîne ASSIDUITÉ : on pose la séance au cache et on demande à la fonction qui
        // alimente le dénominateur. ⚠ La clé se DEMANDE à `cleSeancesCompletes()` : elle
        // est namespacée par groupe-cours, et `cle('seancesCompletes')` n'est que son
        // dernier repli — écrire là ne serait pas lu.
        if (typeof window.cleSeancesCompletes !== 'function') return { erreur: 'cleSeancesCompletes absent' };
        window.db.setSync(window.cleSeancesCompletes(), { '2026-01-19': [seance3h] });
        const cotéCalcul = window.obtenirNombrePeriodesSeance('2026-01-19');

        return { cotéEcran, cotéCalcul };
    });

    expect(r.erreur, `Erreur eval : ${r.erreur}`).toBeUndefined();
    // ⚠ CAS RETOURNÉ PAR LE LOT E2, ET C'EST LE POINT. Il attendait 4 des deux côtés :
    // 180 min / 50 = 3,6 → 4. Les deux chaînes s'accordaient, mais sur un faux — la
    // réponse est 3, une période comprenant sa pause. E2 a supprimé la division : une
    // séance qui ne DÉCLARE pas ses périodes n'en vaut aucune.
    //
    // Ce que ce cas verrouille n'a pas changé : affichage et calcul tombent sur le même
    // nombre. Ils s'accordent désormais aussi sur ce qu'ils ignorent, ce qui est la
    // seule forme d'accord qui vaille quand la donnée manque.
    expect(r.cotéEcran).toBe(0);
    expect(r.cotéCalcul).toBe(0);
    expect(r.cotéEcran, 'affichage et calcul divergent — la panne que le lot C ferme')
        .toBe(r.cotéCalcul);
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

// ⚠ DEUX CAS RETIRÉS ICI PAR LE LOT E1 (#540, le même soir), ET C'EST VOULU.
//
// Ils éprouvaient le champ GLOBAL « Périodes par séance » que le lot C venait de rendre
// effectif : qu'il pilote l'heure de fin proposée, et que le résumé se lise aux heures
// plutôt qu'au produit de deux déclarations.
//
// Grégoire a ensuite montré qu'une période comprend sa PAUSE — 50 + 10 ici, 55 + 5
// ailleurs. La dérivation « début + N × durée de période » était donc fausse dès la
// troisième période, et le champ global n'avait plus de raison d'être : chaque séance
// porte désormais son nombre de périodes, saisi et jamais déduit.
//
// Ce que ces deux cas protégeaient est repris, sous la forme que le modèle a prise, par
// `horaire-seance-porte-periodes-540E1.spec.js` — dont le dernier cas vérifie que le
// résumé suit la saisie et DIT ce qui manque. Rien n'est perdu ; on ne garde simplement
// pas un verrou sur un champ qui n'existe plus.

test('#540-C · un horaire ne s\'enregistre plus avec des heures fabriquées', async ({ page }) => {
    const erreurs = brancherEcouteurs(page);
    await preparer(page);

    const r = await page.evaluate(async () => {
        await window.nouveauHoraireV2();   // lot E2 : async (question de sortie)
        const nom = document.getElementById('v2-hor-nom');
        if (nom) nom.value = 'Horaire de test 540C';

        // L'utilisateur vide l'heure de début : avant, `|| '08:00'` fabriquait une
        // séance de deux heures qui entrait ensuite au dénominateur de l'assiduité.
        const debut0 = document.getElementById('v2-hor-seance-0-debut');
        debut0.value = '';

        const avant = (window.db.getSync(window.cle('horaires'), []) || []).length;
        await window.sauvegarderHoraireV2();
        const apres = (window.db.getSync(window.cle('horaires'), []) || []).length;

        return { avant, apres };
    });

    expect(r.erreur, `Erreur eval : ${r.erreur}`).toBeUndefined();
    expect(r.apres, 'un horaire aux heures incomplètes a été enregistré').toBe(r.avant);
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});
