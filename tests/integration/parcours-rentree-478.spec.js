import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// =======================================================================
// #478 — LE PARCOURS DE RENTRÉE : DEUX MURS SANS PORTE (CT-28 b et c)
// =======================================================================
//
// La communauté de pratique ouvre l'application le 15 sept. 2026 et fera ce
// parcours sur des postes vierges. Mesuré le 13 sept. dans WebKit :
//
// (c) « Veuillez sélectionner un trimestre » sur l'unique trimestre existant.
//     Le formulaire du groupe-cours présélectionne DÉJÀ le trimestre actif ; le
//     mur n'apparaît que si ce trimestre a été créé en refusant « Veux-tu
//     l'activer immédiatement ? » — il n'y a alors AUCUN trimestre actif, et
//     tout le Cadre écrit sans préfixe (un groupe-cours partait dans la clé nue).
//     ⮕ Correctif à la SOURCE : sans trimestre actif, la création active.
//     ⚠ Le montage qui prouve quelque chose est un poste à UN SEUL trimestre :
//     c'est là que présélection et absence de présélection divergent.
//
// (b) « Veuillez sélectionner un groupe associé » ne disait pas où naît un
//     groupe. Et, trouvé en chemin : le menu ne se rafraîchissait JAMAIS après
//     un ajout d'étudiant·e (typeof sur un nom privé d'une autre IIFE) — le
//     message aurait envoyé les gens vers un menu resté vide au retour.
//
// ⚠ Chaque essai part d'un stockage VIDÉ (les specs partagent l'origine file://).

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i,
    /Failed to load resource/i
];

function brancherErreurs(page) {
    const erreurs = [];
    const estAttendue = (m) => patternsAttendus.some((re) => re.test(m));
    page.on('pageerror', (e) => { const m = `pageerror: ${e.message}`; if (!estAttendue(m)) erreurs.push(m); });
    page.on('console', (msg) => { if (msg.type() === 'error') { const m = `console.error: ${msg.text()}`; if (!estAttendue(m)) erreurs.push(m); } });
    return erreurs;
}

/** Répond aux dialogues natifs dans l'ordre ; un confirm imprévu est REFUSÉ et journalisé. */
function repondreAuxDialogues(page, reponses) {
    const journal = [];
    page.on('dialog', async (d) => {
        journal.push(d.type());
        if (d.type() === 'prompt') return d.accept(reponses.shift());
        if (d.type() === 'confirm') return reponses.confirmer ? d.accept() : d.dismiss();
        return d.accept();
    });
    return journal;
}

/**
 * #975 (7 oct. 2026) — « + Nouveau trimestre » ouvre la fiche d'identification du Cadre en
 * création (chemin du lot E2) : plus de `prompt`, plus d'`alert`. Le geste réel : le bouton,
 * la session et l'année, puis « Créer le trimestre ».
 */
async function creerParLaFiche(page, session, annee) {
    await page.evaluate(async ({ session, annee }) => {
        const pause = (ms) => new Promise((res) => setTimeout(res, ms));
        naviguerVers('calendrier', 'trimestre');
        await pause(600);
        document.querySelector('[data-action="ouvrirCreationTrimestreV2"]').click();
        const champSession = document.getElementById('v2-sessionTrimestre');
        champSession.value = session;
        champSession.dispatchEvent(new Event('change', { bubbles: true }));
        const champAnnee = document.getElementById('v2-anneeTrimestre');
        champAnnee.value = annee;
        champAnnee.dispatchEvent(new Event('change', { bubbles: true }));
        document.getElementById('v2-btnCreerTrimestre').click();
        await pause(800);
    }, { session, annee });
}

async function posteVierge(page) {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(800);
    await page.evaluate(async () => {
        localStorage.clear();
        if (window.db && db.memoryCache) db.memoryCache.clear();
        await new Promise((res) => {
            const req = indexedDB.deleteDatabase('LaboCodexDB');
            req.onsuccess = req.onerror = req.onblocked = () => res();
            setTimeout(res, 1500);
        });
    });
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1200);
}

test('#478 (c) · poste vierge, UN trimestre créé : actif sans question, présélectionné, le mur ne se lève plus', async ({ page }) => {
    test.setTimeout(60000);
    const erreurs = brancherErreurs(page);
    await posteVierge(page);
    const reponses = [];
    reponses.confirmer = false; // un confirm résiduel serait REFUSÉ : l'ancien comportement laisserait le trimestre inactif
    const journal = repondreAuxDialogues(page, reponses);

    await creerParLaFiche(page, 'automne', '2026');

    const etat = await page.evaluate(async () => {
        const pause = (ms) => new Promise((res) => setTimeout(res, ms));
        naviguerVers('calendrier', 'trimestre');
        await pause(600);
        await window.nouveauGroupeCoursV2();   // lot E2 : async (question de sortie)
        await pause(300);
        const out = {
            registre: db.getSync('trimestres', []).map((t) => ({ id: t.id, actif: t.actif })),
            cleTrimestreActif: db.getSync('trimestreActif', null),
            valeurTrimestre: document.getElementById('v2-gc-trimestre').value,
            cleGroupesCours: cle('groupesCours')
        };
        // ↻ Lot E2 (28 sept. 2026, D3) : le refus parle par le témoin commun ; on lit son texte.
        window.sauvegarderGroupeCoursV2(); // rien d'autre de rempli : le PREMIER refus dit ce qui manque
        const echec = document.querySelector('#temoin-enregistrement .temoin-enregistrement-echec');
        out.premierRefus = echec && echec.classList.contains('visible') ? echec.querySelector('.temoin-enregistrement-echec-texte').textContent : null;
        return out;
    });

    expect(journal, 'sans trimestre actif, la création ne passe par aucun dialogue natif (#975)').toEqual([]);
    expect(etat.registre).toEqual([{ id: 'a2026', actif: true }]);
    expect(etat.cleTrimestreActif).toBe('a2026');
    expect(etat.cleGroupesCours, 'le Cadre doit écrire sous le préfixe du trimestre').toBe('a2026_groupesCours');
    expect(etat.valeurTrimestre, 'LE CAS DE CT-28 : l\'unique trimestre est présélectionné').toBe('a2026');
    expect(etat.premierRefus, 'le mur « trimestre » ne se lève plus ; le premier manque est le cours').toBe('Non enregistré – Créer le groupe-cours : choisis le cours.');
    expect(erreurs, 'erreurs console').toEqual([]);
});

// ↻ #975 (7 oct. 2026) : la question native « Veux-tu l'activer immédiatement ? » est retirée
// avec l'ancien chemin. « Créer le trimestre » (lot E2) crée ET active, sans dialogue ; pendant la
// saisie, les champs n'écrivent rien dans le trimestre actif.
test('#478 (c) · un trimestre ACTIF existe déjà : la fiche crée et active le nouveau, sans dialogue, sans toucher l\'ancien', async ({ page }) => {
    test.setTimeout(60000);
    const erreurs = brancherErreurs(page);
    await posteVierge(page);
    await page.evaluate(() => {
        db.setSync('trimestres', [{ id: 'h2026', nom: 'Hiver 2026', annee: 2026, session: 'H', actif: true }]);
        db.setSync('trimestreActif', 'h2026');
    });
    const reponses = [];
    const journal = repondreAuxDialogues(page, reponses);

    await creerParLaFiche(page, 'automne', '2026');

    const etat = await page.evaluate(() => ({
        registre: db.getSync('trimestres', []).map((t) => ({ id: t.id, nom: t.nom, session: t.session, actif: t.actif })),
        cleTrimestreActif: db.getSync('trimestreActif', null),
        boutonCreerMasque: document.getElementById('v2-btnCreerTrimestre').classList.contains('u-hide'),
        nomAffiche: document.getElementById('v2-nomTrimestre').value
    }));

    expect(journal, 'aucun prompt, alert ni confirm (#975)').toEqual([]);
    expect(etat.registre, 'l\'ancien garde son identification ; le nouveau est actif').toEqual([
        { id: 'h2026', nom: 'Hiver 2026', session: 'H', actif: false },
        { id: 'a2026', nom: 'Automne 2026', session: 'A', actif: true }
    ]);
    expect(etat.cleTrimestreActif).toBe('a2026');
    expect(etat.boutonCreerMasque, 'la fiche quitte la création').toBe(true);
    expect(etat.nomAffiche).toBe('Automne 2026');
    expect(erreurs, 'erreurs console').toEqual([]);
});

test('#478 (b) · un·e étudiant·e ajouté·e fait apparaître son groupe dans « Groupe associé », formulaire ouvert', async ({ page }) => {
    test.setTimeout(60000);
    const erreurs = brancherErreurs(page);
    page.on('dialog', (d) => d.accept());
    await posteVierge(page);
    const r = await page.evaluate(async () => {
        const pause = (ms) => new Promise((res) => setTimeout(res, ms));
        db.setSync('trimestres', [{ id: 'a2026', nom: 'Automne 2026', annee: 2026, session: 'A', actif: true }]);
        db.setSync('trimestreActif', 'a2026');
        naviguerVers('calendrier', 'trimestre');
        await pause(600);
        await window.nouveauHoraireV2();   // lot E2 : async (question de sortie)
        await pause(300);
        const lire = () => Array.from(document.getElementById('v2-hor-groupeAssocie').options).map((o) => o.value);
        const avant = lire();
        document.getElementById('v2-etudiantDA').value = '2600001';   // #914 : sans DA de sept chiffres, l'ajout est refusé
        document.getElementById('v2-etudiantNom').value = 'Tremblay';
        document.getElementById('v2-etudiantPrenom').value = 'Marie';
        document.getElementById('v2-etudiantGroupe').value = '00001';
        document.querySelector('[data-action="soumettreEtudiantV2"]').click();
        for (let i = 0; i < 20 && !lire().includes('00001'); i++) await pause(150);
        return { avant, apres: lire(), etudiants: (db.getSync(cle('groupeEtudiants'), []) || []).length };
    });
    expect(r.avant, 'poste vierge : le menu ne propose aucun groupe').toEqual(['']);
    expect(r.etudiants, 'l\'ajout lui-même doit avoir eu lieu').toBe(1);
    expect(r.apres, 'SANS rouvrir le formulaire, le groupe du nouvel·le étudiant·e est offert').toEqual(['', '00001']);
    expect(erreurs, 'erreurs console').toEqual([]);
});

test('#478 (b) · menu vide : le refus dit OÙ naît un groupe ; menu garni : le refus d\'avant', async ({ page }) => {
    test.setTimeout(60000);
    const erreurs = brancherErreurs(page);
    page.on('dialog', (d) => d.accept());
    await posteVierge(page);
    const r = await page.evaluate(async () => {
        const pause = (ms) => new Promise((res) => setTimeout(res, ms));
        db.setSync('trimestres', [{ id: 'a2026', nom: 'Automne 2026', annee: 2026, session: 'A', actif: true }]);
        db.setSync('trimestreActif', 'a2026');
        naviguerVers('calendrier', 'trimestre');
        await pause(600);
        // ↻ Lot E2 (28 sept. 2026, D3) : le refus parle par le témoin commun (« Non enregistré –
        // Créer l'horaire : … »), qui reste affiché ; on lit son texte.
        const texteTemoin = () => {
            const el = document.querySelector('#temoin-enregistrement .temoin-enregistrement-echec');
            return el && el.classList.contains('visible') ? el.querySelector('.temoin-enregistrement-echec-texte').textContent : '';
        };
        const tenter = async () => {
            // Lot E2 : rouvrir « + Nouvel horaire » sur une saisie pose la question de sortie ;
            // ce banc éprouve le refus, pas la question — on vide la saisie de l'essai d'avant.
            const nom = document.getElementById('v2-hor-nom');
            if (nom) nom.value = '';
            await window.nouveauHoraireV2();   // lot E2 : async (question de sortie)
            await pause(300);
            document.getElementById('v2-hor-nom').value = 'Mardi matin';
            window.temoinEnregistrement.fermer();
            window.sauvegarderHoraireV2();
            return texteTemoin();
        };
        const menuVide = await tenter();
        db.setSync(cle('groupeEtudiants'), [{ da: '2000001', nom: 'Eleve', prenom: 'Test', groupe: '00001' }]); // security-ok: fixture de test locale
        const menuGarni = await tenter();
        return { menuVide, menuGarni, horaires: (db.getSync(cle('horaires'), []) || []).length };
    });
    // Porte 2.3b (13 sept. 2026) : le geste (où aller) avant l'explication — l'ordre tient.
    expect(r.menuVide).toBe(
        'Non enregistré – Créer l\'horaire : aucun groupe d\'étudiant·es pour l\'instant. ' +
        'Ajoute ou importe ta liste dans l\'accordéon « Groupe d\'étudiant·es », juste au-dessus. ' +
        'Un groupe apparaît dans ce menu dès qu\'un·e étudiant·e y est inscrit·e.'
    );
    expect(r.menuGarni, 'des groupes existent, aucun choisi : le refus d\'avant, au tutoiement').toBe('Non enregistré – Créer l\'horaire : choisis le groupe associé.');
    expect(r.horaires, 'les deux refus n\'écrivent rien').toBe(0);
    expect(erreurs, 'erreurs console').toEqual([]);
});
