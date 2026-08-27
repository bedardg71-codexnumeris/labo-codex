import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// PORTE NAVIGATEUR #540 LOT D — l'horaire est confronté au devis du cours.
//
// LA DEMANDE D'ORIGINE DE GRÉGOIRE, le 26 août : « il faudrait que le formulaire du cours
// demande la durée et que le tout soit confirmé par l'horaire. Ça nous permettrait de
// vérifier et d'avoir une donnée qui soit valide. »
//
// ⮕ CE QUI REND LE RECOUPEMENT POSSIBLE SANS CONVERSION. La pondération « 2-2-3 » compte
// des heures au sens du réseau collégial — et une « heure de cours », au cégep, EST une
// période : 50 minutes d'enseignement plus 10 de pause. `(théorie + labo)` donne donc
// directement des PÉRIODES par semaine, comparables telles quelles au total de l'horaire.
// C'est le seul endroit du chantier où les deux grandeurs se rencontrent sans traduction.
//
// ⮕ JAMAIS BLOQUANT. Un écart peut être légitime — cours intensif, semaine de reprise,
// horaire en cours de saisie. On informe, on n'interdit pas.

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

/** Pose un trimestre, un cours et un groupe-cours, puis ouvre l'horaire voulu. */
const SETUP = (ponderation, seances) => `
    window.db.setSync('trimestres', [{ id: 'a2026', nom: 'Automne 2026', annee: 2026, session: 'A', actif: true }]);
    window.db.setSync('trimestreActif', 'a2026');
    window.db.setSync('a2026_groupeEtudiants', [{ da: '1', nom: 'X', groupe: '00001' }]);
    window.db.setSync('cours', [{
        id: 'COURS_601_101', codeCours: '601-101-MQ', nomCours: 'Écriture et littérature',
        discipline: '601 Français (langue et littérature)', ponderation: ${JSON.stringify(ponderation)}
    }]);
    window.db.setSync('a2026_groupesCours', [{
        id: 'GC_1', coursId: 'COURS_601_101', groupe: '00001', horaireId: 'HOR_D'
    }]);
    window.db.setSync('a2026_horaires', [{
        id: 'HOR_D', nom: 'Horaire test D', groupeAssocie: '00001',
        seances: ${JSON.stringify(seances)}
    }]);
`;

async function ouvrir(page, ponderation, seances) {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    return page.evaluate(async (setupSrc) => {
        (new Function(setupSrc))();
        if (typeof naviguerVers === 'function') {
            naviguerVers('calendrier', 'trimestre');
            await new Promise((r) => setTimeout(r, 400));
        }
        window.changerHoraireSelectionneV2('HOR_D');
        await new Promise((r) => setTimeout(r, 250));
        const zone = document.getElementById('v2-hor-recoupement');
        return {
            texte: zone ? zone.textContent : null,
            classe: zone ? zone.className : null,
            resume: document.getElementById('v2-hor-formatResume')?.textContent || ''
        };
    }, SETUP(ponderation, seances));
}

test('#540-D · un horaire qui CONCORDE avec le devis est confirmé', async ({ page }) => {
    const erreurs = brancherEcouteurs(page);
    // 2-2-3 → 4 périodes. Deux séances de 2 : le cas de Grégoire en littérature.
    const r = await ouvrir(page, '2-2-3', [
        { jour: 'Mardi', heureDebut: '08:00', heureFin: '10:00', nombrePeriodes: 2, local: 'A-101' },
        { jour: 'Jeudi', heureDebut: '08:00', heureFin: '10:00', nombrePeriodes: 2, local: 'A-101' }
    ]);

    expect(r.texte).toContain('Concorde');
    expect(r.texte).toContain('601-101-MQ');
    expect(r.texte).toContain('4 périodes');
    expect(r.classe).toContain('recoupement-concorde');
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

test('#540-D · le BLOC UNIQUE de 4 périodes concorde aussi', async ({ page }) => {
    const erreurs = brancherEcouteurs(page);
    // « Les enseignants peuvent donner un bloc de quatre heures ou deux blocs de deux
    // heures » — les deux doivent concorder avec le même devis.
    const r = await ouvrir(page, '2-2-3', [
        { jour: 'Mardi', heureDebut: '08:00', heureFin: '12:00', nombrePeriodes: 4, local: 'A-101' }
    ]);

    expect(r.texte).toContain('Concorde');
    expect(r.classe).toContain('recoupement-concorde');
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

test('#540-D · un ÉCART est dit, chiffré, et ne bloque rien', async ({ page }) => {
    const erreurs = brancherEcouteurs(page);
    // Un horaire de 3 périodes sur un cours 2-2-3 : le cas nommé au backlog.
    const r = await ouvrir(page, '2-2-3', [
        { jour: 'Mardi', heureDebut: '08:00', heureFin: '11:00', nombrePeriodes: 3, local: 'A-101' }
    ]);

    expect(r.texte).toContain('Écart');
    expect(r.texte).toContain('3 périodes');
    expect(r.texte).toContain('4');
    expect(r.texte).toContain('1 de moins');
    expect(r.classe).toContain('recoupement-ecart');
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

test('#540-D · la chimie (3-2-3) attend 5 périodes, pas 4', async ({ page }) => {
    const erreurs = brancherEcouteurs(page);
    // Le cas « durée variable » que Grégoire a décrit pour la philo et la chimie.
    const r = await ouvrir(page, '3-2-3', [
        { jour: 'Mardi', heureDebut: '08:00', heureFin: '11:00', nombrePeriodes: 3, local: 'A-101' },
        { jour: 'Jeudi', heureDebut: '08:00', heureFin: '10:00', nombrePeriodes: 2, local: 'A-101' }
    ]);

    expect(r.texte).toContain('Concorde');
    expect(r.texte).toContain('5 périodes');
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

test('#540-D · on se TAIT quand l\'horaire est incomplet', async ({ page }) => {
    const erreurs = brancherEcouteurs(page);
    // Une séance sans nombre de périodes : rien à confronter. Un signal qui parle sans
    // savoir devient un signal qu'on n'écoute plus.
    const r = await ouvrir(page, '2-2-3', [
        { jour: 'Mardi', heureDebut: '08:00', heureFin: '10:00', nombrePeriodes: 2, local: 'A-101' },
        { jour: 'Jeudi', heureDebut: '08:00', heureFin: '10:00', local: 'A-101' }
    ]);

    expect(r.texte, 'un verdict a été rendu sur un horaire incomplet').toBe('');
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

test('#540-D · on se TAIT quand le cours n\'a AUCUNE pondération', async ({ page }) => {
    const erreurs = brancherEcouteurs(page);
    const r = await ouvrir(page, '', [
        { jour: 'Mardi', heureDebut: '08:00', heureFin: '10:00', nombrePeriodes: 2, local: 'A-101' }
    ]);

    expect(r.texte, 'un verdict a été rendu sans devis à confronter').toBe('');
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

test('#540-D · on se TAIT aussi quand la pondération est ILLISIBLE', async ({ page }) => {
    const erreurs = brancherEcouteurs(page);
    // ⚠ CAS AJOUTÉ APRÈS UN BREAK-TEST QUI N'A PAS ROUGI. Le cas précédent passe une
    // pondération VIDE, écartée par une garde antérieure au parseur : falsifier le
    // parseur ne le faisait donc pas rougir, et ce chemin-là n'était pas couvert.
    // Une chaîne non vide mais non reconnaissable est le seul moyen d'atteindre le
    // parseur et de vérifier qu'un refus de sa part fait bien taire le recoupement.
    const r = await ouvrir(page, 'quatre heures', [
        { jour: 'Mardi', heureDebut: '08:00', heureFin: '10:00', nombrePeriodes: 2, local: 'A-101' }
    ]);

    expect(r.texte, 'un verdict a été rendu sur une pondération que personne ne sait lire').toBe('');
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});
