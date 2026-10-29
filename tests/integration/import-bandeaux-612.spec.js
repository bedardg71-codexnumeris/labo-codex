import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// PORTE #612 — CE QUE LA MODALE D'IMPORT DIT, VÉRIFIÉ DANS UN VRAI NAVIGATEUR.
//
// Ces quatre cas étaient d'abord un protocole d'essai MANUEL. Grégoire l'a
// refusé, et il avait raison : « dans cet état, ce bandeau apparaît-il, ce texte
// est-il celui-là » ne demande aucun jugement humain. Un essai manuel se dépense
// une fois ; une spec s'accumule. Dans trois semaines, quand quelqu'un touchera
// à cette modale, la vérification d'aujourd'hui ne dira plus rien — celle-ci si.
//
// Vitest couvre déjà les DONNÉES (les lignes de rattrapage, le détecteur, la
// garde). Il ne peut pas dire si le bandeau est réellement DANS le DOM, ni quel
// texte s'affiche une fois la modale rendue. C'est ce que fait ce spec.
//
// ⚠ LE QUATRIÈME CAS EST LE PLUS IMPORTANT DES QUATRE. Un import parfaitement
// normal ne doit afficher AUCUN bandeau. Sans lui, les trois autres ne prouvent
// rien : un avertissement qui se montre toujours ne se lit plus au bout d'une
// semaine, et trois tests « le bandeau apparaît » passeraient au vert sur un
// code qui l'affiche systématiquement.

const ETUDIANT = { da: '1000001', nom: 'Tremblay', prenom: 'Alex', groupe: '00007' };

// `nom` fait plus de trois lettres et ne porte pas d'accent : deux conditions de
// l'appariement par mots entiers de #611. « Roy » ou « Côté » ne seraient pas
// reconnus, et le cas 3 échouerait pour la mauvaise raison.

const SETUP = async () => {
    db.setSync('trimestres', [{ id: 'a2026', nom: 'A2026', annee: 2026, session: 'A', actif: true }]);
    db.setSync('trimestreActif', 'a2026');
    db.setSync('groupeCoursActif', { id: 'GC1', trimestreId: 'a2026', nom: 'Groupe 00007' });
    // security-ok: jeu d'essai littéral d'un test, aucune source externe.
    await db.set(cle('groupesCours'), [{ id: 'GC1', trimestreId: 'a2026', numero: '00007' }]);
    // security-ok: jeu d'essai littéral d'un test, aucune source externe.
    await db.set(cle('groupeEtudiants'), [{ ...window.__ETU, groupeCoursId: 'GC1' }]);
    // security-ok: jeu d'essai littéral d'un test, aucune source externe.
    await db.set(cle('productions'), [{ id: 'p_devoir', titre: 'Devoir 1', type: 'artefact' }]);
};

/** Dépose un fichier dans la VRAIE file d'attente, par la porte réelle. */
const DEPOSER = (nom) => {
    const octets = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]); // %PDF-1.4
    const f = new File([octets], nom, { type: 'application/pdf' });
    window.travauxImport.viderFileDAttente();
    window.travauxImport.ajouterFichiersEnAttente([f]);
    return window.travauxImport.obtenirFileDAttente();
};

/** Ouvre la modale de confirmation et rend ce qu'elle affiche. */
const LIRE_MODALE = async () => {
    await window.travauxUI.appliquerEtImporter();
    await new Promise((r) => setTimeout(r, 400));
    const corps = document.body;
    return {
        sansDA: !!corps.querySelector('.travaux-bandeau-sans-da'),
        daInconnu: !!corps.querySelector('.travaux-bandeau-da-inconnu'),
        texteSansDA: (corps.querySelector('.travaux-bandeau-sans-da') || {}).textContent || '',
        texteDAInconnu: (corps.querySelector('.travaux-bandeau-da-inconnu') || {}).textContent || ''
    };
};

async function preparer(page) {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push('pageerror: ' + e.message));
    page.on('console', (m) => {
        const t = m.text();
        if (m.type() === 'error' && !/version\.json|CORS|Failed to load resource/i.test(t)) erreurs.push(t);
    });
    page.on('dialog', (d) => d.dismiss());
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(900);
    return erreurs;
}

test.beforeEach(async ({ page }) => {
    await page.addInitScript(`
        window.__ETU = ${JSON.stringify(ETUDIANT)};
        window.__setup = ${SETUP.toString()};
        window.__deposer = ${DEPOSER.toString()};
        window.__lireModale = ${LIRE_MODALE.toString()};
    `);
});

test('#612 · cas 1 — un DA qui n\'existe pas dans le groupe est ANNONCÉ avant l\'import', async ({ page }) => {
    const erreurs = await preparer(page);
    const r = await page.evaluate(async () => {
        await window.__setup();
        const file = window.__deposer('9999999_devoir.pdf');
        const vu = await window.__lireModale();
        return { ...vu, daDetecte: file[0] && file[0].daDetecte, associe: !!(file[0] && file[0].etudiantAssocie) };
    });

    expect(r.daDetecte, 'le DA doit être lu dans le nom du fichier').toBe('9999999');
    expect(r.associe, 'aucun élève ne porte ce DA').toBe(false);
    expect(r.daInconnu, 'le bandeau « DA sans élève » doit être RENDU, pas seulement calculé').toBe(true);
    expect(r.texteDAInconnu).toMatch(/DA sans étudiant·e dans ce groupe/);   // « étudiant·e » : #1152, lot 5
    // La règle de rédaction : la conséquence réelle, puis le geste qui la lève.
    expect(r.texteDAInconnu).toMatch(/non associés/);
    expect(r.texteDAInconnu).toMatch(/Vérifiez le DA|basculez sur le groupe-cours/);
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

test('#612 · cas 2 — sans groupe-cours actif, l\'import est REFUSÉ et rien n\'est écrit', async ({ page }) => {
    const erreurs = await preparer(page);
    const r = await page.evaluate(async () => {
        await window.__setup();
        window.__deposer('1000001_devoir.pdf');
        window.db.setSync('groupeCoursActif', null);

        const dits = [];
        const vrai = window.notifications.erreur;
        window.notifications.erreur = function (m) { dits.push(String(m)); };

        const avant = (window.travauxStockage.obtenirFichiersTravaux() || []).length;

        // ⚠ ON PASSE PAR LE VRAI PARCOURS, et c'est le premier jet de ce banc
        // qui l'a imposé : `executerImportPipeline` n'est PAS exposée sur
        // `travauxUI` — elle n'est atteignable que par le bouton de la modale.
        // Un test qui l'appellerait directement jugerait une porte qui n'existe
        // pas pour l'utilisateur.
        await window.travauxUI.appliquerEtImporter();
        await new Promise((res) => setTimeout(res, 400));
        const bouton = document.querySelector('#pipeline-modal-overlay [data-btn-index="0"]');
        const boutonTrouve = !!bouton;
        if (bouton) bouton.click();
        await new Promise((res) => setTimeout(res, 500));
        const apres = (window.travauxStockage.obtenirFichiersTravaux() || []).length;

        window.notifications.erreur = vrai;
        return { dits, avant, apres, boutonTrouve, libelle: bouton ? bouton.textContent.trim() : '' };
    });

    expect(r.boutonTrouve, 'la modale doit porter son bouton de confirmation').toBe(true);
    expect(r.libelle, 'et ce doit bien être celui qui importe').toMatch(/importer/i);
    expect(r.dits.join(' | '), 'le refus doit être DIT').toMatch(/aucun groupe-cours actif/i);
    expect(r.dits.join(' | '), 'et dire quoi faire').toMatch(/Choisissez un groupe-cours/i);
    expect(r.apres, 'aucun fichier ne doit être écrit').toBe(r.avant);
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

test('#612 · cas 3 — sans DA, l\'élève est trouvé par son NOM et le message dit vrai', async ({ page }) => {
    const erreurs = await preparer(page);
    const r = await page.evaluate(async () => {
        await window.__setup();
        const file = window.__deposer('Tremblay_Alex_devoir.pdf');
        const vu = await window.__lireModale();
        return { ...vu, da: file[0] && file[0].daDetecte, associe: !!(file[0] && file[0].etudiantAssocie) };
    });

    expect(r.da, 'ce fichier ne porte aucun DA').toBeFalsy();
    expect(r.sansDA, 'il doit donc figurer au bandeau « sans DA »').toBe(true);
    // ⚠ LE POINT DE #611, ET LA RAISON DE LA REFORMULATION : le fichier n'a pas
    // de DA, mais son élève EST trouvé. L'ancien message promettait une
    // association manuelle — il annonçait une conséquence disparue.
    expect(r.associe, 'l\'appariement par nom doit trouver l\'élève').toBe(true);
    expect(r.texteSansDA, 'le message ne doit plus promettre une association manuelle')
        .not.toMatch(/association devra être faite manuellement/);
    expect(r.texteSansDA, 'il doit annoncer la perte RÉELLE : le regroupement')
        .toMatch(/ne seront pas regroupées automatiquement/);
    expect(r.texteSansDA, 'et le geste qui la lève').toMatch(/Ajoutez le DA/);
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

test('#612 · cas 4 — LE TÉMOIN : un import normal n\'affiche AUCUN bandeau', async ({ page }) => {
    const erreurs = await preparer(page);
    const r = await page.evaluate(async () => {
        await window.__setup();
        const file = window.__deposer('1000001_devoir.pdf');
        const vu = await window.__lireModale();
        return { ...vu, da: file[0] && file[0].daDetecte, associe: !!(file[0] && file[0].etudiantAssocie) };
    });

    expect(r.da, 'le DA d\'un élève inscrit').toBe('1000001');
    expect(r.associe, 'et il doit être associé').toBe(true);
    expect(r.sansDA, 'le fichier porte un DA : aucun bandeau « sans DA »').toBe(false);
    expect(r.daInconnu, 'le DA existe : aucun bandeau « DA sans élève »').toBe(false);
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});
