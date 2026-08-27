import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// Refonte cours↔période — chantier C (29 mai 2026).
// Sentinelle de non-régression : le cours est une DESCRIPTION ministérielle pure,
// persistée via CoursEntite.
//   1. Création → ID COURS_* + AUCUN champ période/assemblage (enseignant, session,
//      annee, periodesParSemaine, formatHoraire, groupe, pratiqueId).
//   2. Édition d'un cours legacy estampillé → ID PRÉSERVÉ + champs ministériels mis à
//      jour + champs legacy non ministériels CONSERVÉS (pas de perte avant chantier D).
// Verrouille deux régressions : (a) ré-apparition de la fabrication d'objet gras /
// d'ID embarquant la période ; (b) écrasement destructif des champs legacy à l'édition.

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i
];

function brancherEcouteurs(page) {
    const erreurs = [];
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
    // alert() natif (validations) — auto-dismiss pour ne pas bloquer Playwright.
    page.on('dialog', (d) => d.dismiss());
    return erreurs;
}

test('Chantier C · création route via CoursEntite → ID COURS_* sans période ni assemblage', async ({ page }) => {
    const erreurs = brancherEcouteurs(page);

    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    // #534 — ATTENDRE UN ÉTAT, PAS UNE DURÉE (décision de Grégoire, 27 août 2026).
    // Le `waitForTimeout(500)` qui vivait ici était sans marge par construction :
    // `page.goto` sur `index.html` coûte 400 à 700 ms en régime normal. La spec
    // touchait donc `window.db` et `window.CoursEntite` avant que la base soit
    // prête, une fois sur deux, selon la charge de la machine. La spec voisine
    // `planif-tout-voir-loupe` attendait `dbReady` depuis toujours : l'asymétrie
    // n'était pas un choix, c'était un oubli.
    await page.waitForFunction(() => window.dbReady === true, null, { timeout: 20000 });

    const resultat = await page.evaluate(async () => {
        for (const dep of ['CoursEntite', 'sauvegarderCoursV2', 'nouveauCoursV2', 'db']) {
            if (typeof window[dep] === 'undefined') return { erreur: `window.${dep} absent` };
        }

        // Table rase + mode création (coursEnEditionV2 = null via nouveauCoursV2).
        window.db.setSync('cours', []);
        window.db.setSync('infoCours', null);
        await window.nouveauCoursV2();

        const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
        // Discipline est un <select> : on retient une option réelle (la 1re non vide).
        const selDisc = document.getElementById('v2-disciplineCours');
        const disciplineChoisie = selDisc && selDisc.options.length > 1 ? selDisc.options[1].value : '';
        if (selDisc) selDisc.value = disciplineChoisie;
        set('v2-codeCours', 'TEST-CHANTIER-C');
        set('v2-nomCours', 'Cours refonte pur');
        set('v2-heuresEnseignement', '60');
        set('v2-ponderation', '2-2-3');

        await window.sauvegarderCoursV2();

        const tous = await window.CoursEntite.obtenirTous();
        const cree = tous.find((c) => c.codeCours === 'TEST-CHANTIER-C');
        if (!cree) return { erreur: 'cours créé introuvable', nbCours: tous.length };

        const champsInterdits = ['enseignant', 'session', 'annee', 'periodesParSemaine', 'formatHoraire', 'groupe', 'pratiqueId'];
        return {
            id: cree.id,
            idCommenceParCOURS: cree.id.startsWith('COURS_'),
            champsInterditsPresents: champsInterdits.filter((k) => k in cree),
            heuresContact: cree.heuresContact,
            ponderation: cree.ponderation,
            discipline: cree.discipline,
            disciplineChoisie,
            nomCours: cree.nomCours
        };
    });

    expect(resultat.erreur, `Erreur eval : ${resultat.erreur}`).toBeUndefined();
    expect(resultat.idCommenceParCOURS, `id reçu : ${resultat.id}`).toBe(true);
    expect(resultat.champsInterditsPresents, `champs période/assemblage interdits trouvés : ${resultat.champsInterditsPresents?.join(', ')}`).toEqual([]);
    expect(resultat.nomCours).toBe('Cours refonte pur');
    expect(resultat.heuresContact).toBe(60);
    expect(resultat.ponderation).toBe('2-2-3');
    expect(resultat.discipline).toBe(resultat.disciplineChoisie);

    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

test('Chantier C · édition d\'un cours legacy → ID préservé + champs legacy conservés', async ({ page }) => {
    const erreurs = brancherEcouteurs(page);

    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    // #534 — ATTENDRE UN ÉTAT, PAS UNE DURÉE (décision de Grégoire, 27 août 2026).
    // Le `waitForTimeout(500)` qui vivait ici était sans marge par construction :
    // `page.goto` sur `index.html` coûte 400 à 700 ms en régime normal. La spec
    // touchait donc `window.db` et `window.CoursEntite` avant que la base soit
    // prête, une fois sur deux, selon la charge de la machine. La spec voisine
    // `planif-tout-voir-loupe` attendait `dbReady` depuis toujours : l'asymétrie
    // n'était pas un choix, c'était un oubli.
    await page.waitForFunction(() => window.dbReady === true, null, { timeout: 20000 });

    const resultat = await page.evaluate(async () => {
        for (const dep of ['CoursEntite', 'sauvegarderCoursV2', 'changerCoursSelectionneV2', 'db']) {
            if (typeof window[dep] === 'undefined') return { erreur: `window.${dep} absent` };
        }

        // Cours legacy estampillé (forme grasse pré-refonte) — comme 601-101 réel.
        const legacyId = 'h2026-601-101-MQ-00008';
        const legacy = {
            id: legacyId,
            codeCours: '601-101-MQ',
            nomCours: 'Écriture et littérature',
            discipline: 'Français',
            heuresContact: 60,
            ponderation: '2-2-3',
            enseignant: { prenom: 'Grégoire', nom: 'Tremblay' },
            session: 'H',
            annee: 2026,
            groupe: '00008',
            pratiqueId: 'pan-standards',
            actif: true
        };
        window.db.setSync('cours', [legacy]);
        window.db.setSync('infoCours', legacy);

        // Passe en mode édition (coursEnEditionV2 = legacyId).
        window.changerCoursSelectionneV2(legacyId);

        const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
        set('v2-codeCours', '601-101-MQ');
        set('v2-nomCours', 'Écriture et littérature (révisé)');
        // Discipline est un <select> : on retient une option réelle (la 1re non vide).
        const selDisc = document.getElementById('v2-disciplineCours');
        if (selDisc && selDisc.options.length > 1) selDisc.value = selDisc.options[1].value;

        await window.sauvegarderCoursV2();

        const apres = (await window.CoursEntite.obtenirTous()).find((c) => c.id === legacyId);
        const info = window.db.getSync('infoCours', null);
        if (!apres) return { erreur: 'cours legacy introuvable après édition (ID non préservé ?)' };

        return {
            idPreserve: apres.id === legacyId,
            nombreCours: (await window.CoursEntite.obtenirTous()).length,
            nomMisAJour: apres.nomCours,
            enseignantConserve: !!(apres.enseignant && apres.enseignant.nom === 'Tremblay'),
            groupeConserve: apres.groupe,
            infoCoursResync: info && info.id === legacyId && info.nomCours === apres.nomCours
        };
    });

    expect(resultat.erreur, `Erreur eval : ${resultat.erreur}`).toBeUndefined();
    expect(resultat.idPreserve).toBe(true);
    expect(resultat.nombreCours, 'aucun doublon ne doit être créé à l\'édition').toBe(1);
    expect(resultat.nomMisAJour).toBe('Écriture et littérature (révisé)');
    expect(resultat.enseignantConserve, 'champ legacy enseignant doit survivre jusqu\'au chantier D').toBe(true);
    expect(resultat.groupeConserve).toBe('00008');
    expect(resultat.infoCoursResync, 'infoCours doit être re-synchronisé pour le cours actif').toBe(true);

    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

// Refonte cours↔période — chantier E (29 mai 2026).
// « Reprendre dans ce trimestre » ne duplique JAMAIS la description : aucune écriture
// dans `cours`. Verrouille deux régressions :
//   (a) ré-apparition de l'ancienne duplication (dupliquerCoursPourTrimestreActif) qui
//       créait un doublon de cours à chaque reprise ;
//   (b) création silencieuse d'un groupe-cours en double quand la description est déjà
//       reprise dans le trimestre actif (cas no-op).
test('Chantier E · reprendre une description ne crée aucun doublon de cours (brouillon pré-sélectionné)', async ({ page }) => {
    const erreurs = brancherEcouteurs(page);

    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    // #534 — ATTENDRE UN ÉTAT, PAS UNE DURÉE (décision de Grégoire, 27 août 2026).
    // Le `waitForTimeout(500)` qui vivait ici était sans marge par construction :
    // `page.goto` sur `index.html` coûte 400 à 700 ms en régime normal. La spec
    // touchait donc `window.db` et `window.CoursEntite` avant que la base soit
    // prête, une fois sur deux, selon la charge de la machine. La spec voisine
    // `planif-tout-voir-loupe` attendait `dbReady` depuis toujours : l'asymétrie
    // n'était pas un choix, c'était un oubli.
    await page.waitForFunction(() => window.dbReady === true, null, { timeout: 20000 });

    const resultat = await page.evaluate(async () => {
        for (const dep of ['reprendreCoursDansTrimestreActif', 'GroupeCoursEntite', 'obtenirTrimestreActif', 'db']) {
            if (typeof window[dep] === 'undefined') return { erreur: `window.${dep} absent` };
        }
        // Zéro-dette : l'ancienne duplication doit avoir disparu.
        const ancienneRetiree = typeof window.dupliquerCoursPourTrimestreActif === 'undefined';

        // Trimestre Été actif + table rase.
        window.db.setSync('trimestres', [{ id: 'e2026', nom: 'Été 2026', actif: true }]);
        window.db.setSync('trimestreActif', 'e2026');
        await window.db.set('e2026_groupesCours', []);
        const coursId = 'COURS_REPRISE_E';
        window.db.setSync('cours', [{ id: coursId, codeCours: '601-101-MQ', nomCours: 'Écriture', dansBibliotheque: true, isDemo: false }]);

        const nbCoursAvant = window.db.getSync('cours', []).length;
        await window.reprendreCoursDansTrimestreActif(coursId);

        const coursApres = window.db.getSync('cours', []);
        const gcApres = await window.GroupeCoursEntite.obtenirTous('e2026');
        const selCours = document.getElementById('v2-gc-cours');

        return {
            ancienneRetiree,
            nbCoursAvant,
            nbCoursApres: coursApres.length,
            nbGCApres: gcApres.length,
            coursPreselectionne: selCours ? selCours.value : null
        };
    });

    expect(resultat.erreur, `Erreur eval : ${resultat.erreur}`).toBeUndefined();
    expect(resultat.ancienneRetiree, 'dupliquerCoursPourTrimestreActif doit être retiré (zéro-dette)').toBe(true);
    expect(resultat.nbCoursApres, 'reprendre ne doit créer AUCUN doublon de description').toBe(resultat.nbCoursAvant);
    expect(resultat.nbCoursApres).toBe(1);
    expect(resultat.nbGCApres, 'la reprise ouvre un brouillon, sans écrire de groupe-cours').toBe(0);
    expect(resultat.coursPreselectionne, 'le cours doit être pré-sélectionné dans le formulaire d\'assemblage').toBe('COURS_REPRISE_E');

    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

test('Chantier E · reprendre une description déjà reprise est un no-op (pas de groupe-cours en double)', async ({ page }) => {
    const erreurs = brancherEcouteurs(page);

    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    // #534 — ATTENDRE UN ÉTAT, PAS UNE DURÉE (décision de Grégoire, 27 août 2026).
    // Le `waitForTimeout(500)` qui vivait ici était sans marge par construction :
    // `page.goto` sur `index.html` coûte 400 à 700 ms en régime normal. La spec
    // touchait donc `window.db` et `window.CoursEntite` avant que la base soit
    // prête, une fois sur deux, selon la charge de la machine. La spec voisine
    // `planif-tout-voir-loupe` attendait `dbReady` depuis toujours : l'asymétrie
    // n'était pas un choix, c'était un oubli.
    await page.waitForFunction(() => window.dbReady === true, null, { timeout: 20000 });

    const resultat = await page.evaluate(async () => {
        for (const dep of ['reprendreCoursDansTrimestreActif', 'GroupeCoursEntite', 'db']) {
            if (typeof window[dep] === 'undefined') return { erreur: `window.${dep} absent` };
        }
        window.db.setSync('trimestres', [{ id: 'e2026', nom: 'Été 2026', actif: true }]);
        window.db.setSync('trimestreActif', 'e2026');
        const coursId = 'COURS_REPRISE_E';
        window.db.setSync('cours', [{ id: coursId, codeCours: '601-101-MQ', nomCours: 'Écriture', dansBibliotheque: true, isDemo: false }]);
        // Un groupe-cours pointe DÉJÀ vers cette description dans le trimestre actif.
        await window.db.set('e2026_groupesCours', [
            { id: 'GC_DEJA', trimestreId: 'e2026', coursId, enseignantId: 'E1', horaireId: 'H1', groupe: '00001', actif: true }
        ]);

        const nbCoursAvant = window.db.getSync('cours', []).length;
        await window.reprendreCoursDansTrimestreActif(coursId);

        const gcApres = await window.GroupeCoursEntite.obtenirTous('e2026');
        return {
            nbCoursAvant,
            nbCoursApres: window.db.getSync('cours', []).length,
            nbGCApres: gcApres.length,
            idGC: gcApres.length === 1 ? gcApres[0].id : null
        };
    });

    expect(resultat.erreur, `Erreur eval : ${resultat.erreur}`).toBeUndefined();
    expect(resultat.nbGCApres, 'aucun groupe-cours en double ne doit être créé').toBe(1);
    expect(resultat.idGC, 'le groupe-cours existant doit être préservé tel quel').toBe('GC_DEJA');
    expect(resultat.nbCoursApres, 'aucun doublon de description').toBe(resultat.nbCoursAvant);

    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});
