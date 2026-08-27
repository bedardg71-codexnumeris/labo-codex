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
    // 3 h = 180 min / 50 = 3,6 → 4 périodes. L'affichage disait 2 avant le lot C.
    expect(r.cotéEcran).toBe(4);
    expect(r.cotéCalcul).toBe(4);
    expect(r.cotéEcran, 'affichage et calcul divergent — la panne que le lot C ferme')
        .toBe(r.cotéCalcul);
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

test('#540-C · le champ « Périodes par séance » pilote vraiment l\'heure de fin', async ({ page }) => {
    const erreurs = brancherEcouteurs(page);
    await preparer(page);

    const r = await page.evaluate(async () => {
        const lireFins = () => {
            const fins = [];
            for (let i = 0; document.getElementById(`v2-hor-seance-${i}-fin`); i++) {
                fins.push({
                    debut: document.getElementById(`v2-hor-seance-${i}-debut`).value,
                    fin: document.getElementById(`v2-hor-seance-${i}-fin`).value
                });
            }
            return fins;
        };

        // Un horaire neuf, à 2 périodes par séance.
        window.nouveauHoraireV2();
        const champPeriodes = document.getElementById('v2-hor-periodesParSeance');
        const champNb = document.getElementById('v2-hor-nbSeances');
        champPeriodes.value = '2';
        champPeriodes.dispatchEvent(new Event('change', { bubbles: true }));
        const aDeux = lireFins();

        // On passe à 3 périodes, PUIS on ajoute une séance : la ligne NEUVE doit naître
        // au nouveau format. Les lignes déjà là, elles, ne bougent pas — c'est
        // l'invariant de #460 (changer le format n'écrase pas une saisie).
        champPeriodes.value = '3';
        champPeriodes.dispatchEvent(new Event('change', { bubbles: true }));
        const apresChangementFormat = lireFins();

        champNb.value = String(apresChangementFormat.length + 1);
        champNb.dispatchEvent(new Event('change', { bubbles: true }));
        const avecLigneNeuve = lireFins();

        // Et un horaire entièrement neuf reprend le format courant partout.
        window.nouveauHoraireV2();
        const neufApres = lireFins();

        return { aDeux, apresChangementFormat, avecLigneNeuve, neufApres };
    });

    expect(r.erreur, `Erreur eval : ${r.erreur}`).toBeUndefined();
    // Avant le lot C : « 10:00 » quel que soit le choix — le champ n'atteignait pas les
    // lignes, il ne changeait que le résumé, qui annonçait donc un format faux. Et ce
    // 10:00 supposait des périodes de 60 min alors que le réglage du projet est à 50.
    expect(r.aDeux[0].fin).toBe('09:40');            // 08:00 + 2 × 50 min

    // #460 préservé : les lignes DÉJÀ saisies ne sont pas réécrites.
    expect(r.apresChangementFormat[0].fin).toBe('09:40');

    // Mais la ligne AJOUTÉE naît au format courant : le champ est bien effectif.
    const neuve = r.avecLigneNeuve[r.avecLigneNeuve.length - 1];
    expect(neuve.fin).toBe('10:30');                 // 08:00 + 3 × 50 min
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

test('#540-C · le résumé du formulaire se lit aux heures saisies, pas au format déclaré', async ({ page }) => {
    const erreurs = brancherEcouteurs(page);
    await preparer(page);

    const r = await page.evaluate(async () => {
        window.nouveauHoraireV2();
        const champPeriodes = document.getElementById('v2-hor-periodesParSeance');
        champPeriodes.value = '2';
        champPeriodes.dispatchEvent(new Event('change', { bubbles: true }));

        const resumeDeclare = document.getElementById('v2-hor-formatResume')?.textContent || '';

        // L'utilisateur allonge la première séance à trois heures, sans toucher au format.
        const fin0 = document.getElementById('v2-hor-seance-0-fin');
        fin0.value = '11:00';
        fin0.dispatchEvent(new Event('change', { bubbles: true }));

        return {
            resumeDeclare,
            resumeApresSaisie: document.getElementById('v2-hor-formatResume')?.textContent || ''
        };
    });

    expect(r.erreur, `Erreur eval : ${r.erreur}`).toBeUndefined();
    // 2 séances × 2 périodes tant que les heures le disent.
    expect(r.resumeDeclare).toContain('4 périodes/semaine');
    // Puis 4 + 2 : le résumé SUIT la saisie. Avant, il restait à « 2 × 2 = 4 ».
    expect(r.resumeApresSaisie).toContain('6 périodes/semaine');
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

test('#540-C · un horaire ne s\'enregistre plus avec des heures fabriquées', async ({ page }) => {
    const erreurs = brancherEcouteurs(page);
    await preparer(page);

    const r = await page.evaluate(async () => {
        window.nouveauHoraireV2();
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
