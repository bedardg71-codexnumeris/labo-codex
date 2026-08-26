import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// PORTE NAVIGATEUR #540 LOT A — la pondération est requise, et la saisie se normalise.
//
// La sentinelle unitaire vérifie la FORME du source et les fonctions pures. Ici on
// vérifie le COMPORTEMENT dans le vrai navigateur : le refus refuse-t-il vraiment,
// la normalisation se déclenche-t-elle sur un VRAI événement, et le handler
// `data-on-input` — qui n'a jamais fonctionné faute d'export — fonctionne-t-il enfin ?
//
// ⚠ Le dernier point est le cœur : un export manquant ne casse rien de visible dans
// un test de source. Il faut le dispatcher réel de main.js pour le voir.

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
    // Un alert() bloquerait Playwright. Il ne doit plus y en avoir sur ce chemin :
    // on les COMPTE pour pouvoir l'affirmer, au lieu de les congédier en silence.
    const dialogues = [];
    page.on('dialog', (d) => { dialogues.push(d.message()); d.dismiss(); });
    return { erreurs, dialogues };
}

async function preparer(page) {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
}

test('#540-A · sans pondération, la fiche ne s\'enregistre pas', async ({ page }) => {
    const { erreurs, dialogues } = brancherEcouteurs(page);
    await preparer(page);

    const r = await page.evaluate(async () => {
        for (const dep of ['CoursEntite', 'sauvegarderCoursV2', 'nouveauCoursV2', 'db']) {
            if (typeof window[dep] === 'undefined') return { erreur: `window.${dep} absent` };
        }
        window.db.setSync('cours', []);
        await window.nouveauCoursV2();

        const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
        const sel = document.getElementById('v2-disciplineCours');
        if (sel && sel.options.length > 1) sel.value = sel.options[1].value;
        set('v2-codeCours', 'TEST-540-VIDE');
        set('v2-nomCours', 'Sans pondération');
        set('v2-ponderation', '');            // ← le point du test

        await window.sauvegarderCoursV2();

        const tous = await window.CoursEntite.obtenirTous();
        return { cree: tous.some(c => c.codeCours === 'TEST-540-VIDE'), nb: tous.length };
    });

    expect(r.erreur, `Erreur eval : ${r.erreur}`).toBeUndefined();
    expect(r.cree, 'une fiche sans pondération a été enregistrée').toBe(false);
    expect(dialogues, `refus par dialogue natif : ${dialogues.join(' | ')}`).toEqual([]);
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

test('#540-B · une pondération illisible est refusée elle aussi', async ({ page }) => {
    const { erreurs, dialogues } = brancherEcouteurs(page);
    await preparer(page);

    const r = await page.evaluate(async () => {
        window.db.setSync('cours', []);
        await window.nouveauCoursV2();
        const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
        const sel = document.getElementById('v2-disciplineCours');
        if (sel && sel.options.length > 1) sel.value = sel.options[1].value;
        set('v2-codeCours', 'TEST-540-ILLISIBLE');
        set('v2-ponderation', 'deux-deux-trois');

        await window.sauvegarderCoursV2();
        const tous = await window.CoursEntite.obtenirTous();
        return { cree: tous.some(c => c.codeCours === 'TEST-540-ILLISIBLE') };
    });

    expect(r.cree, 'une pondération illisible a été acceptée').toBe(false);
    expect(dialogues).toEqual([]);
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

test('#540-C · un VRAI événement change ramène la saisie à la forme du devis', async ({ page }) => {
    const { erreurs } = brancherEcouteurs(page);
    await preparer(page);

    const r = await page.evaluate(async () => {
        await window.nouveauCoursV2();
        const champ = document.getElementById('v2-ponderation');
        if (!champ) return { erreur: 'champ pondération absent' };

        const essai = (saisie) => {
            champ.value = saisie;
            // Événement RÉEL : c'est le dispatcher de main.js qui doit répondre,
            // pas un appel direct à la fonction.
            champ.dispatchEvent(new Event('change', { bubbles: true }));
            return champ.value;
        };

        return {
            espaces: essai('2 2 3'),
            compacte: essai('323'),
            tiretUnicode: essai('2–2–3'),
            decimale: essai('1,5-1,5-3'),
            illisibleIntacte: essai('pas une pondération')
        };
    });

    expect(r.erreur, `Erreur eval : ${r.erreur}`).toBeUndefined();
    expect(r.espaces).toBe('2-2-3');
    expect(r.compacte).toBe('3-2-3');
    expect(r.tiretUnicode).toBe('2-2-3');
    expect(r.decimale).toBe('1.5-1.5-3');
    // On n'efface JAMAIS sous les doigts : c'est l'enregistrement qui refusera.
    expect(r.illisibleIntacte).toBe('pas une pondération');
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

test('#540-D · enregistrer sans quitter le champ normalise quand même', async ({ page }) => {
    const { erreurs } = brancherEcouteurs(page);
    await preparer(page);

    const r = await page.evaluate(async () => {
        window.db.setSync('cours', []);
        await window.nouveauCoursV2();
        const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
        const sel = document.getElementById('v2-disciplineCours');
        if (sel && sel.options.length > 1) sel.value = sel.options[1].value;
        set('v2-codeCours', 'TEST-540-SANS-BLUR');
        // Saisie compacte, et on clique « Enregistrer » sans jamais quitter le champ :
        // aucun `change` n'a eu lieu.
        set('v2-ponderation', '223');

        await window.sauvegarderCoursV2();
        const tous = await window.CoursEntite.obtenirTous();
        const cree = tous.find(c => c.codeCours === 'TEST-540-SANS-BLUR');
        return { ponderation: cree ? cree.ponderation : null };
    });

    expect(r.ponderation, 'la fiche devait être créée, pondération normalisée').toBe('2-2-3');
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

test('#540-E · RÈGLE UNIQUE — une fiche ANCIENNE sans pondération ne se ré-enregistre pas', async ({ page }) => {
    const { erreurs } = brancherEcouteurs(page);
    await preparer(page);

    const r = await page.evaluate(async () => {
        // Une fiche telle qu'elle existe déjà chez un utilisateur : pas de pondération.
        window.db.setSync('cours', [{
            id: 'COURS_ANCIENNE_540', codeCours: 'TEST-540-ANCIENNE',
            nomCours: 'Fiche d\'avant', discipline: '601 Français (langue et littérature)',
            ponderation: '', heuresContact: 60
        }]);

        if (typeof window.modifierCoursSelectionneV2 !== 'function') {
            return { erreur: 'modifierCoursSelectionneV2 absent' };
        }
        // On se place en ÉDITION de cette fiche, puis on tente d'enregistrer tel quel.
        const select = document.getElementById('v2-selectCours');
        if (typeof window.chargerDropdownCoursV2 === 'function') await window.chargerDropdownCoursV2();
        if (select) select.value = 'COURS_ANCIENNE_540';
        await window.modifierCoursSelectionneV2();

        const champ = document.getElementById('v2-ponderation');
        const ponderationAffichee = champ ? champ.value : null;

        // On change juste le nom — le geste anodin qui doit malgré tout buter.
        const nom = document.getElementById('v2-nomCours');
        if (nom) nom.value = 'Nom corrigé';
        await window.sauvegarderCoursV2();

        const tous = await window.CoursEntite.obtenirTous();
        const fiche = tous.find(c => c.id === 'COURS_ANCIENNE_540');
        return {
            ponderationAffichee,
            nomApres: fiche ? fiche.nomCours : null
        };
    });

    expect(r.erreur, `Erreur eval : ${r.erreur}`).toBeUndefined();
    expect(r.ponderationAffichee, 'la fiche de test doit bien être sans pondération').toBe('');
    // La règle est unique : l'ancienneté n'exempte pas. La modification est refusée.
    expect(r.nomApres, 'une fiche ancienne sans pondération a été ré-enregistrée').toBe('Fiche d\'avant');
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

test('#540-F · le handler data-on-input fonctionne enfin (export manquant corrigé)', async ({ page }) => {
    const { erreurs } = brancherEcouteurs(page);
    const avertissements = [];
    page.on('console', (msg) => {
        if (msg.type() === 'warning' && /data-on-input|data-on-change/.test(msg.text())) {
            avertissements.push(msg.text());
        }
    });
    await preparer(page);

    const r = await page.evaluate(async () => {
        await window.nouveauCoursV2();
        const pond = document.getElementById('v2-ponderation');
        const heures = document.getElementById('v2-heuresEnseignement');
        const repere = document.getElementById('v2-repereUnites');
        if (!pond || !heures) return { erreur: 'champs absents' };

        heures.value = '';                 // champ vide : la proposition doit le remplir
        pond.value = '3-2-3';              // chimie, 5 h/semaine
        pond.dispatchEvent(new Event('input', { bubbles: true }));

        return {
            heuresProposees: heures.value,
            repere: repere ? repere.textContent : null,
            handlerJoignable: typeof window.proposerHeuresEnseignementDepuisPonderation
        };
    });

    expect(r.erreur, `Erreur eval : ${r.erreur}`).toBeUndefined();
    expect(r.handlerJoignable, 'le handler doit être sur window (le dispatcher l\'y cherche)').toBe('function');
    // (3 + 2) × 15 = 75. Avant le lot A, ce champ restait VIDE : le dispatcher ne
    // trouvait pas la fonction et rendait la main en silence.
    expect(r.heuresProposees, 'la proposition automatique ne s\'est pas déclenchée').toBe('75');
    expect(r.repere, 'le repère d\'unités doit suivre la frappe').toContain('unités');
    expect(avertissements, `handler introuvable : ${avertissements.join(' | ')}`).toEqual([]);
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});
