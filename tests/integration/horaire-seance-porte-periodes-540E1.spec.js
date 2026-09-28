import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// PORTE NAVIGATEUR #540 LOT E1 — la séance porte ses périodes, de la saisie au calcul.
//
// Ce que la sentinelle ne peut pas voir : que le nombre saisi à l'écran Horaire arrive
// bien, intact, au dénominateur de l'assiduité. Il traverse `sauvegarderHoraireV2`,
// l'entité horaire, `genererSeancesCompletes`, puis `obtenirNombrePeriodesSeance`.
// Chacun de ces maillons l'a perdu à un moment de l'histoire du projet.

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

test('#540-E1 · le nombre saisi arrive intact au dénominateur de l\'assiduité', async ({ page }) => {
    const erreurs = brancherEcouteurs(page);
    await preparer(page);

    const r = await page.evaluate(async () => {
        const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };

        // Un trimestre et un groupe : `sauvegarderHoraireV2` exige un groupe associé.
        window.db.setSync('trimestres', [{ id: 'a2026', nom: 'Automne 2026', annee: 2026, session: 'A', actif: true }]);
        window.db.setSync('trimestreActif', 'a2026');
        window.db.setSync('a2026_groupeEtudiants', [{ da: '1', nom: 'X', groupe: '00001' }]);
        window.db.setSync('a2026_horaires', []);
        if (typeof naviguerVers === 'function') {
            naviguerVers('calendrier', 'trimestre');
            await new Promise((res) => setTimeout(res, 500));
        }

        await window.nouveauHoraireV2();   // lot E2 : async (question de sortie)
        await new Promise((res) => setTimeout(res, 200));
        set('v2-hor-groupeAssocie', '00001');
        set('v2-hor-nom', 'Bloc de trois heures');
        set('v2-hor-nbSeances', '1');
        window.mettreAJourSeancesHoraireV2();
        await new Promise((res) => setTimeout(res, 150));

        // LE CAS QUI MENTAIT : trois heures d'horloge. L'ancienne conversion en comptait
        // quatre (180 / 50 = 3,6 → 4), parce qu'elle ignorait les pauses. On saisit 3.
        set('v2-hor-seance-0-jour', 'Lundi');
        set('v2-hor-seance-0-debut', '08:00');
        set('v2-hor-seance-0-fin', '11:00');
        set('v2-hor-seance-0-periodes', '3');

        await window.sauvegarderHoraireV2();

        const horaires = window.db.getSync('a2026_horaires', []) || [];
        const cree = horaires.find(h => h.nom === 'Bloc de trois heures');
        if (!cree) return { erreur: 'horaire non créé' };

        const seance = cree.seances[0];

        // Ce que l'écran additionne.
        const cotéEcran = window.periodesParSemaine(cree.seances);

        // Ce que l'assiduité compterait pour une date portant cette séance.
        window.db.setSync(window.cleSeancesCompletes(), { '2026-01-19': [seance] });
        const cotéCalcul = window.obtenirNombrePeriodesSeance('2026-01-19');

        return {
            stockeSurLaSeance: seance.nombrePeriodes,
            cotéEcran,
            cotéCalcul
        };
    });

    expect(r.erreur, `Erreur eval : ${r.erreur}`).toBeUndefined();
    expect(r.stockeSurLaSeance, 'la séance ne porte pas son nombre de périodes').toBe(3);
    expect(r.cotéEcran).toBe(3);
    // Le cœur du lot E : trois, pas quatre. Aucune division n'a eu lieu.
    expect(r.cotéCalcul).toBe(3);
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

test('#540-E1 · une séance sans nombre de périodes ne s\'enregistre pas', async ({ page }) => {
    const erreurs = brancherEcouteurs(page);
    await preparer(page);

    const r = await page.evaluate(async () => {
        const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };

        await window.nouveauHoraireV2();   // lot E2 : async (question de sortie)
        set('v2-hor-nom', 'Horaire incomplet 540E1');
        const grp = document.getElementById('v2-hor-groupeAssocie');
        if (grp && grp.options.length > 1) grp.value = grp.options[1].value;
        // Heures saisies, périodes laissées vides : c'est précisément le cas où l'ancien
        // code aurait divisé pour combler le silence.
        set('v2-hor-seance-0-periodes', '');

        const avant = (window.db.getSync(window.cle('horaires'), []) || []).length;
        await window.sauvegarderHoraireV2();
        const apres = (window.db.getSync(window.cle('horaires'), []) || []).length;

        return { avant, apres };
    });

    expect(r.erreur, `Erreur eval : ${r.erreur}`).toBeUndefined();
    expect(r.apres, 'un horaire sans nombre de périodes a été enregistré').toBe(r.avant);
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

test('#540-E1 · une séance d\'AVANT se complète par reprise de la déclaration', async ({ page }) => {
    const erreurs = brancherEcouteurs(page);
    await preparer(page);

    const r = await page.evaluate(async () => {
        // Un horaire tel qu'il existe déjà chez Grégoire : les séances n'ont que des
        // heures, et le format vit au niveau de l'horaire.
        window.db.setSync(window.cle('horaires'), [{
            id: 'HOR_AVANT_E1',
            nom: 'Horaire d\'avant',
            groupeAssocie: '',
            periodesParSeance: 3,
            seances: [
                { jour: 'Lundi', heureDebut: '08:00', heureFin: '11:00', local: 'B-201' }
            ]
        }]);

        if (typeof window.changerHoraireSelectionneV2 !== 'function') {
            return { erreur: 'changerHoraireSelectionneV2 absent' };
        }
        window.changerHoraireSelectionneV2('HOR_AVANT_E1');

        return {
            periodesAffichees: document.getElementById('v2-hor-seance-0-periodes')?.value,
            debut: document.getElementById('v2-hor-seance-0-debut')?.value,
            fin: document.getElementById('v2-hor-seance-0-fin')?.value,
            resume: document.getElementById('v2-hor-formatResume')?.textContent || ''
        };
    });

    expect(r.erreur, `Erreur eval : ${r.erreur}`).toBeUndefined();
    // Reprise de la DÉCLARATION (3), pas une redivision des heures — qui aurait donné 4.
    expect(r.periodesAffichees, 'la déclaration de l\'horaire n\'a pas été reprise').toBe('3');
    expect(r.debut).toBe('08:00');
    expect(r.fin).toBe('11:00');
    expect(r.resume).toContain('3 période');
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

test('#540-E1 · le résumé DIT ce qui manque au lieu d\'un total partiel', async ({ page }) => {
    const erreurs = brancherEcouteurs(page);
    await preparer(page);

    const r = await page.evaluate(async () => {
        await window.nouveauHoraireV2();   // lot E2 : async (question de sortie)
        const nb = document.getElementById('v2-hor-nbSeances');
        nb.value = '2';
        nb.dispatchEvent(new Event('change', { bubbles: true }));

        const p0 = document.getElementById('v2-hor-seance-0-periodes');
        p0.value = '3';
        p0.dispatchEvent(new Event('input', { bubbles: true }));
        const uneSeuleRemplie = document.getElementById('v2-hor-formatResume')?.textContent || '';

        const p1 = document.getElementById('v2-hor-seance-1-periodes');
        p1.value = '2';
        p1.dispatchEvent(new Event('input', { bubbles: true }));
        const lesDeux = document.getElementById('v2-hor-formatResume')?.textContent || '';

        return { uneSeuleRemplie, lesDeux };
    });

    expect(r.erreur, `Erreur eval : ${r.erreur}`).toBeUndefined();
    // Surtout pas « 3 périodes/semaine » : ce serait un total qui ne compte pas tout.
    expect(r.uneSeuleRemplie).toContain('1 sans nombre de périodes');
    expect(r.uneSeuleRemplie).not.toContain('3 périodes/semaine');
    expect(r.lesDeux).toContain('5 périodes/semaine');
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});
