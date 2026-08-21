import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// Sentinelle CT-01 (audit Cadre/Trimestre, 20 août 2026) — Bloquant corrigé le 20 août :
// en édition d'horaire, changer « Nombre de séances » ou « Périodes par séance »
// régénérait les lignes de séance aux DÉFAUTS et « Enregistrer » persistait ces
// défauts en silence (perte de la configuration saisie). Le correctif
// (changerFormatSeancesHoraireV2, câblé en data-on-change sur les deux selects)
// photographie les valeurs du DOM avant la régénération et les restitue.
// Ce test passe par de VRAIS événements change : il verrouille le handler ET le
// câblage d'index.html (une régression de l'attribut data-on-change le fait rougir).

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i
];

function brancherEcouteurs(page) {
    const erreurs = [];
    const estAttendue = (m) => patternsAttendus.some((re) => re.test(m));
    page.on('pageerror', (e) => { const m = `pageerror: ${e.message}`; if (!estAttendue(m)) erreurs.push(m); });
    page.on('console', (msg) => { if (msg.type() === 'error') { const m = `console.error: ${msg.text()}`; if (!estAttendue(m)) erreurs.push(m); } });
    page.on('dialog', (d) => d.dismiss());
    return erreurs;
}

const SETUP = () => {
    db.setSync('trimestres', [{ id: 'a2026', nom: 'Automne 2026', annee: 2026, session: 'A', actif: true }]);
    db.setSync('trimestreActif', 'a2026');
    db.setSync('a2026_groupeEtudiants', Array.from({ length: 20 }, (_, i) => ({ da: 'D' + i, groupe: '00001' })));
    const horId = 'HOR_marjeu_ct01';
    db.setSync('a2026_horaires', [{
        id: horId, groupeAssocie: '00001', nom: 'Mar-Jeu', periodesParSeance: 2,
        seances: [{ jour: 'Mardi', heureDebut: '10:00', heureFin: '12:00', local: 'A-101' },
                  { jour: 'Jeudi', heureDebut: '14:00', heureFin: '16:00', local: 'A-101' }]
    }]);
    return horId;
};

const lireLignesDOM = () => {
    const lignes = [];
    for (let i = 0; document.getElementById(`v2-hor-seance-${i}-jour`); i++) {
        lignes.push({
            jour: document.getElementById(`v2-hor-seance-${i}-jour`).value,
            debut: document.getElementById(`v2-hor-seance-${i}-debut`)?.value,
            fin: document.getElementById(`v2-hor-seance-${i}-fin`)?.value,
            local: document.getElementById(`v2-hor-seance-${i}-local`)?.value
        });
    }
    return lignes;
};

test('CT-01 · passer de 2 à 3 séances préserve les séances saisies, et Enregistrer les persiste', async ({ page }) => {
    const erreurs = brancherEcouteurs(page);
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const r = await page.evaluate(({ setupSrc, lireSrc }) => {
        const horId = (new Function('db', setupSrc))(window.db);
        const lireLignes = new Function(`return (${lireSrc})()`);

        // Ouvrir l'horaire en édition (remplit les lignes de séance)
        window.changerHoraireSelectionneV2(horId);

        // Geste de l'audit : « Nombre de séances » 2 → 3 via un VRAI événement change
        const selectNb = document.getElementById('v2-hor-nbSeances');
        selectNb.value = '3';
        selectNb.dispatchEvent(new Event('change', { bubbles: true }));
        const lignesApres = lireLignes();

        // « Enregistrer » : les valeurs préservées doivent être persistées
        window.sauvegarderHoraireV2();
        const persiste = window.db.getSync('a2026_horaires', []).find(h => h.id === horId);

        return { lignesApres, seancesPersistees: persiste?.seances };
    }, {
        setupSrc: SETUP.toString().replace(/^[^{]*\{/, '').replace(/\}$/, ''),
        lireSrc: lireLignesDOM.toString()
    });

    // Les deux séances saisies survivent au changement de format
    expect(r.lignesApres.length, '3 lignes après le passage à 3 séances').toBe(3);
    expect(r.lignesApres[0]).toEqual({ jour: 'Mardi', debut: '10:00', fin: '12:00', local: 'A-101' });
    expect(r.lignesApres[1]).toEqual({ jour: 'Jeudi', debut: '14:00', fin: '16:00', local: 'A-101' });
    // La ligne AJOUTÉE prend les défauts (comportement voulu, inchangé)
    expect(r.lignesApres[2].debut).toBe('08:00');

    // Et la persistance reflète les valeurs préservées, pas les défauts
    expect(r.seancesPersistees?.length).toBe(3);
    expect(r.seancesPersistees[0]).toEqual({ jour: 'Mardi', heureDebut: '10:00', heureFin: '12:00', local: 'A-101' });
    expect(r.seancesPersistees[1]).toEqual({ jour: 'Jeudi', heureDebut: '14:00', heureFin: '16:00', local: 'A-101' });
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

test('CT-01 · changer « Périodes par séance » ne touche pas aux séances saisies', async ({ page }) => {
    const erreurs = brancherEcouteurs(page);
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const r = await page.evaluate(({ setupSrc, lireSrc }) => {
        const horId = (new Function('db', setupSrc))(window.db);
        const lireLignes = new Function(`return (${lireSrc})()`);

        window.changerHoraireSelectionneV2(horId);

        const selectPeriodes = document.getElementById('v2-hor-periodesParSeance');
        selectPeriodes.value = '3';
        selectPeriodes.dispatchEvent(new Event('change', { bubbles: true }));

        return { lignes: lireLignes() };
    }, {
        setupSrc: SETUP.toString().replace(/^[^{]*\{/, '').replace(/\}$/, ''),
        lireSrc: lireLignesDOM.toString()
    });

    expect(r.lignes.length).toBe(2);
    expect(r.lignes[0]).toEqual({ jour: 'Mardi', debut: '10:00', fin: '12:00', local: 'A-101' });
    expect(r.lignes[1]).toEqual({ jour: 'Jeudi', debut: '14:00', fin: '16:00', local: 'A-101' });
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

test('CT-01 · réduire 2 → 1 séance garde la première ; « Nouvel horaire » repart des défauts', async ({ page }) => {
    const erreurs = brancherEcouteurs(page);
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const r = await page.evaluate(({ setupSrc, lireSrc }) => {
        const horId = (new Function('db', setupSrc))(window.db);
        const lireLignes = new Function(`return (${lireSrc})()`);

        window.changerHoraireSelectionneV2(horId);
        const selectNb = document.getElementById('v2-hor-nbSeances');
        selectNb.value = '1';
        selectNb.dispatchEvent(new Event('change', { bubbles: true }));
        const lignesReduites = lireLignes();

        // Garde-fou inverse : le formulaire « Nouvel horaire » ne doit PAS hériter
        // des séances de l'horaire précédemment ouvert (régénération aux défauts voulue).
        window.nouveauHoraireV2();
        const lignesNeuves = lireLignes();

        return { lignesReduites, lignesNeuves };
    }, {
        setupSrc: SETUP.toString().replace(/^[^{]*\{/, '').replace(/\}$/, ''),
        lireSrc: lireLignesDOM.toString()
    });

    expect(r.lignesReduites.length).toBe(1);
    expect(r.lignesReduites[0]).toEqual({ jour: 'Mardi', debut: '10:00', fin: '12:00', local: 'A-101' });

    expect(r.lignesNeuves.length).toBe(2);
    expect(r.lignesNeuves[0]).toEqual({ jour: 'Lundi', debut: '08:00', fin: '10:00', local: '' });
    expect(r.lignesNeuves[1]).toEqual({ jour: 'Mardi', debut: '08:00', fin: '10:00', local: '' });
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});
