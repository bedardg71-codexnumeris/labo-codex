import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// PORTE CT-15 — LES GARDES DU CADRE PARLENT VRAIMENT DANS LA PAGE.
//
// Les sentinelles unitaires prouvent que la garde EXISTE et que sa logique est
// juste. Elles ne prouvent pas qu'elle s'exécute : `identite-naturelle.js`
// pourrait être absent d'index.html, chargé APRÈS ses consommateurs, ou
// écrasé par un autre module — et chaque enregistrement de cours lèverait
// alors une ReferenceError silencieuse pour l'utilisateur, bruyante en console.
//
// C'est le mode d'échec du 23 août transposé : 2983 tests unitaires verts
// pendant que l'application servait autre chose. Cette porte mesure la page.

test('CT-15 · les fonctions d\'identité naturelle sont chargées et pures', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push('pageerror: ' + e.message));

    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(900);

    const r = await page.evaluate(() => {
        const noms = ['cleNaturelle', 'cleNaturelleCours', 'cleNaturelleEnseignant',
            'cleNaturelleGroupeCours', 'trouverDoublonNaturel'];
        const absentes = noms.filter((n) => typeof window[n] !== 'function');

        return {
            absentes,
            // La règle #455 telle qu'elle s'applique RÉELLEMENT dans la page.
            memeCoursMalgreLaCasse:
                window.cleNaturelleCours({ codeCours: '  601-101-mq ' }) ===
                window.cleNaturelleCours({ codeCours: '601-101-MQ', session: 'A', annee: 2026 }),
            // Le cas-témoin #450 transposé : deux homonymes restent deux
            // personnes tant que leurs courriels diffèrent.
            homonymesDistincts:
                window.cleNaturelleEnseignant({ prenom: 'Jean', nom: 'Tremblay', courriel: 'a@x.ca' }) !==
                window.cleNaturelleEnseignant({ prenom: 'Jean', nom: 'Tremblay', courriel: 'b@x.ca' }),
            // Le module doit rester PUR : appelé mille fois, il n'écrit rien.
            entiteExpose: typeof window.CoursEntite?.chercherDoublonCode === 'function'
        };
    });

    expect(r.absentes, `Fonctions absentes de la page : ${r.absentes.join(', ')} — ` +
        'js/identite-naturelle.js n\'est pas chargé, ou l\'est après ses consommateurs')
        .toEqual([]);
    expect(r.memeCoursMalgreLaCasse, '« 601-101-mq » et « 601-101-MQ » doivent être le même cours (#455)').toBe(true);
    expect(r.homonymesDistincts, 'deux homonymes à courriels différents sont deux personnes (#450)').toBe(true);
    expect(r.entiteExpose, 'CoursEntite.chercherDoublonCode doit être exposé').toBe(true);

    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

test('CT-15 · un second cours au même code est REFUSÉ au point d\'écriture', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push('pageerror: ' + e.message));

    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(900);

    const r = await page.evaluate(async () => {
        // security-ok: jeu d'essai littéral d'un test, aucune source externe.
        await db.set('cours', [
            { id: 'COURS_TEMOIN', codeCours: '000-TEST-ZZ', nomCours: 'Témoin', dansBibliotheque: true }
        ]);

        // 1. Sans confirmation : la garde refuse, et le magasin ne bouge pas.
        const refus = await CoursEntite.creer({ codeCours: '000-test-zz', nomCours: 'Jumeau' });
        const apresRefus = (await db.get('cours') || []).length;

        // 2. Avec confirmation : le geste reste POSSIBLE — décision #455,
        //    on avertit, on n'interdit pas.
        const assume = await CoursEntite.creer(
            { codeCours: '000-TEST-ZZ', nomCours: 'Jumeau assumé' }, { doublonAssume: true });
        const apresAssume = (await db.get('cours') || []).length;

        // 3. Un code neuf passe toujours : la garde ne mord pas le légitime.
        const neuf = await CoursEntite.creer({ codeCours: '000-TEST-YY', nomCours: 'Autre' });

        await db.set('cours', []);
        return {
            refuse: refus === null, apresRefus,
            assumeCree: !!assume, apresAssume,
            neufCree: !!neuf
        };
    });

    expect(r.refuse, 'un second cours au même code doit être refusé sans confirmation').toBe(true);
    expect(r.apresRefus, 'le magasin `cours` ne doit pas avoir bougé après le refus').toBe(1);
    expect(r.assumeCree, 'avec `doublonAssume`, le geste reste possible (#455)').toBe(true);
    expect(r.apresAssume).toBe(2);
    expect(r.neufCree, 'un code neuf doit toujours passer').toBe(true);

    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});
