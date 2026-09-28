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
            // #540 lot E1 : les périodes sont une saisie comme une autre — donc une
            // saisie que la régénération des lignes doit préserver, au même titre que
            // les heures. C'est tout l'objet de CT-01.
            periodes: document.getElementById(`v2-hor-seance-${i}-periodes`)?.value,
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

    const r = await page.evaluate(async ({ setupSrc, lireSrc }) => {
        const horId = (new Function('db', setupSrc))(window.db);
        const lireLignes = new Function(`return (${lireSrc})()`);

        // Ouvrir l'horaire en édition (remplit les lignes de séance)
        window.changerHoraireSelectionneV2(horId);

        // Geste de l'audit : « Nombre de séances » 2 → 3 via un VRAI événement change
        const selectNb = document.getElementById('v2-hor-nbSeances');
        selectNb.value = '3';
        selectNb.dispatchEvent(new Event('change', { bubbles: true }));
        const lignesApres = lireLignes();

        // #540 lot E1 : la ligne AJOUTÉE naît sans nombre de périodes — c'est voulu, cette
        // donnée pilote le dénominateur de l'assiduité et se saisit à l'œil ouvert. Sans
        // elle, l'enregistrement est refusé, et ce cas ne mesurerait plus que ce refus.
        // On la saisit comme l'utilisateur le fera, pour continuer d'éprouver ce que CT-01
        // protège : que les DEUX premières lignes aient survécu au changement de format.
        const p2 = document.getElementById('v2-hor-seance-2-periodes');
        if (p2) p2.value = '2';

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
    expect(r.lignesApres[0]).toEqual({ jour: 'Mardi', debut: '10:00', fin: '12:00', periodes: '2', local: 'A-101' });
    expect(r.lignesApres[1]).toEqual({ jour: 'Jeudi', debut: '14:00', fin: '16:00', periodes: '2', local: 'A-101' });
    // La ligne AJOUTÉE prend les défauts (comportement voulu, inchangé)
    expect(r.lignesApres[2].debut).toBe('08:00');

    // Et la persistance reflète les valeurs préservées, pas les défauts
    expect(r.seancesPersistees?.length).toBe(3);
    expect(r.seancesPersistees[0]).toEqual({ jour: 'Mardi', heureDebut: '10:00', heureFin: '12:00', nombrePeriodes: 2, local: 'A-101' });
    expect(r.seancesPersistees[1]).toEqual({ jour: 'Jeudi', heureDebut: '14:00', heureFin: '16:00', nombrePeriodes: 2, local: 'A-101' });
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

// ⚠ CE CAS A CHANGÉ D'OBJET AU LOT E1 (#540, 26 août 2026), ET C'EST VOULU.
//
// Il éprouvait le champ GLOBAL « Périodes par séance » : en changer la valeur ne devait
// pas écraser les heures déjà saisies. Ce champ n'existe plus — un format ne se déclare
// plus pour tout un horaire, chaque séance porte le sien.
//
// L'invariant qu'il protégeait n'a pas disparu pour autant : modifier le format d'une
// séance ne doit rien faire aux autres. Il est même plus exposé qu'avant, le format étant
// devenu une saisie par ligne. On le porte donc sous sa nouvelle forme, plutôt que de
// supprimer le cas et de perdre la protection avec le champ.
test('CT-01 · modifier les périodes d\'une séance ne touche pas aux autres', async ({ page }) => {
    const erreurs = brancherEcouteurs(page);
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const r = await page.evaluate(async ({ setupSrc, lireSrc }) => {
        const horId = (new Function('db', setupSrc))(window.db);
        const lireLignes = new Function(`return (${lireSrc})()`);

        window.changerHoraireSelectionneV2(horId);
        const avant = lireLignes();

        const p0 = document.getElementById('v2-hor-seance-0-periodes');
        p0.value = '4';
        p0.dispatchEvent(new Event('input', { bubbles: true }));

        return {
            avant,
            apres: lireLignes(),
            resume: document.getElementById('v2-hor-formatResume')?.textContent || ''
        };
    }, {
        setupSrc: SETUP.toString().replace(/^[^{]*\{/, '').replace(/\}$/, ''),
        lireSrc: lireLignesDOM.toString()
    });

    expect(r.avant.length).toBe(2);
    // Les deux séances arrivent à 2, repris de la déclaration de l'horaire.
    expect(r.avant[0].periodes).toBe('2');
    expect(r.avant[1].periodes).toBe('2');

    expect(r.apres[0]).toEqual({ jour: 'Mardi', debut: '10:00', fin: '12:00', periodes: '4', local: 'A-101' });
    // Intacte — heures ET périodes.
    expect(r.apres[1]).toEqual({ jour: 'Jeudi', debut: '14:00', fin: '16:00', periodes: '2', local: 'A-101' });
    // Et le total suit la saisie, sans rien convertir.
    expect(r.resume).toContain('6 périodes/semaine');
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

test('CT-01 · réduire 2 → 1 séance garde la première ; « Nouvel horaire » repart des défauts', async ({ page }) => {
    const erreurs = brancherEcouteurs(page);
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const r = await page.evaluate(async ({ setupSrc, lireSrc }) => {
        const horId = (new Function('db', setupSrc))(window.db);
        const lireLignes = new Function(`return (${lireSrc})()`);

        window.changerHoraireSelectionneV2(horId);
        const selectNb = document.getElementById('v2-hor-nbSeances');
        selectNb.value = '1';
        selectNb.dispatchEvent(new Event('change', { bubbles: true }));
        const lignesReduites = lireLignes();

        // Garde-fou inverse : le formulaire « Nouvel horaire » ne doit PAS hériter
        // des séances de l'horaire précédemment ouvert (régénération aux défauts voulue).
        await window.nouveauHoraireV2();   // lot E2 : async (question de sortie)
        const lignesNeuves = lireLignes();

        return { lignesReduites, lignesNeuves };
    }, {
        setupSrc: SETUP.toString().replace(/^[^{]*\{/, '').replace(/\}$/, ''),
        lireSrc: lireLignesDOM.toString()
    });

    expect(r.lignesReduites.length).toBe(1);
    expect(r.lignesReduites[0]).toEqual({ jour: 'Mardi', debut: '10:00', fin: '12:00', periodes: '2', local: 'A-101' });

    // #540 lot C (26 août 2026) — LA FIN PAR DÉFAUT EST DÉRIVÉE, PLUS ÉCRITE EN DUR.
    // Elle valait « 10:00 » quel que soit le format choisi : le champ « Périodes par
    // séance » n'atteignait pas les lignes, et ce 10:00 supposait de surcroît des
    // périodes de 60 minutes alors que le réglage du projet est à 50 (#538, 22 août).
    // Deux périodes de 50 min à partir de 08:00 finissent à 09:40 — c'est ce que le
    // formulaire propose désormais, et ce que l'assiduité comptera.
    // ⚠ L'INVARIANT DE CT-01 EST INCHANGÉ : « Nouvel horaire » repart bien des défauts
    // et n'hérite pas des séances de l'horaire précédent. Seule la valeur du défaut a
    // bougé, pas ce que ce cas verrouille.
    // #540 lot E1 : la fin par défaut redevient « 10:00 ». Le lot C la dérivait du format
    // déclaré (08:00 + 2 × 50 min = 09:40) ; E1 a retiré la durée de période qui rendait
    // cette dérivation possible — et elle était fausse de toute façon, puisqu'elle
    // ignorait les pauses. Début et fin restent des défauts de formulaire VISIBLES ; les
    // périodes, elles, naissent VIDES : c'est la donnée qui compte au dénominateur.
    expect(r.lignesNeuves.length).toBe(2);
    expect(r.lignesNeuves[0]).toEqual({ jour: 'Lundi', debut: '08:00', fin: '10:00', periodes: '', local: '' });
    expect(r.lignesNeuves[1]).toEqual({ jour: 'Mardi', debut: '08:00', fin: '10:00', periodes: '', local: '' });
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});
