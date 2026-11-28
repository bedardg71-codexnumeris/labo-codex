import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { attendreApplication } from './harness/attendre-application.js';
import { attendreRepos, suivreLesReactions } from './harness/attendre-repos.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// ═══════════════════════════════════════════════════════════════════════════════════════════
// « RENOMMER » UNE PRATIQUE DEPUIS LA BIBLIOTHÈQUE (28 nov. 2026) — demande de Grégoire (6 h 46) : renommer là où il
// voit toutes ses pratiques d'un coup, sous le même ⋮ que dupliquer, exporter, supprimer.
//
// Ses décisions (6 h 40 à 6 h 47) : seul son geste renomme ; la jumelle de l'autre colonne suit quand les deux sont
// liées ; aucun autre trimestre ne bouge ; un modèle fourni avec l'application ne se renomme pas.
//
// Ce que le banc fixe, dans le vrai index.html, par les vrais gestes :
//   · la place de « Renommer » dans les deux menus, et son absence sur un modèle fourni intact ;
//   · depuis le trimestre, avec un exemplaire à soi : les deux noms s'écrivent, la confirmation le dit ;
//   · depuis la bibliothèque, avec la jumelle du trimestre : idem, et la fiche ouverte suit (titre et champ) ;
//   · RÈGLE c — la pratique adoptée d'un modèle fourni : seule la rangée du trimestre change ; la copie rangée du
//     modèle dans `bibliothequePratiques` n'est PAS réécrite (octet pour octet) et le modèle reste « fourni avec
//     l'application » ;
//   · nom vide : refusé, la fenêtre reste ; nom inchangé : rien n'est écrit ; espaces de bord retirés ;
//   · nom déjà porté : la note, sans blocage ; un nom hostile reste du texte ;
//   · un autre trimestre qui porte la même pratique garde son nom.
// Noms manifestement fictifs. Contexte Playwright neuf à chaque essai.
//
// BREAK-TEST (règle c) : voir plans de travail/RAPPORT-2026-11-28-renommer-pratique-bibliotheque.md.
// ═══════════════════════════════════════════════════════════════════════════════════════════

const SEL = '#modalBibliothequePratiques';
const ID_MODELE = 'SOM-litterature';
const NOM_MODELE = 'Modèle cumulatif';
const ANCIENNE = { nom: 'Modèle sommatif', description: 'Pour débuter avec une pratique sommative' };
const T = {
    titre: 'Renommer la pratique',
    champ: 'Nouveau nom',
    noteExemplaire: 'Son exemplaire de ta bibliothèque portera le même nom.',
    noteTrimestre: 'Elle est aussi dans ce trimestre : elle y portera le même nom.',
    noteFournie: 'Le modèle fourni avec l\'application garde son nom.',
    noteDejaPorte: 'Une autre pratique porte déjà ce nom. Tu peux le garder quand même.',
    refusVide: 'Donne un nom à la pratique.',
    fait: 'Pratique renommée.',
    faitLesDeux: 'Pratique renommée, dans ce trimestre et dans ta bibliothèque.',
    noteBas: 'Tes autres trimestres gardent le nom qu\'elle y porte.'
};
const fictive = (id, nom, extra) => Object.assign({ id, nom, type: 'sommative', pratiques: ['SOM'], auteur: 'Auteur fictif',
    dansBibliotheque: true, configuration: {} }, extra || {});

/**
 * Démo, Conception › Pratiques, puis le décor : `trimestre` et `biblio` (listes fictives ajoutées), `adoptee` (le
 * modèle fourni adopté le 2 sept., resté « Modèle sommatif »), `copieRangee` ('ancienne' | 'identique' | null).
 */
async function ouvrir(page, { trimestre = [], biblio = [], adoptee = false, copieRangee = null, dossier = false } = {}) {
    await page.setViewportSize({ width: 1440, height: 900 });
    await suivreLesReactions(page);
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await attendreApplication(page);
    await page.evaluate(async () => { await window.activerModeDemo(); });
    await attendreRepos(page);
    await page.evaluate(() => naviguerVers('conception', 'pratiques-notation'));
    await attendreRepos(page);
    await page.evaluate(async ({ trimestre, biblio, adoptee, copieRangee, dossier, idModele, ancienne }) => {
        window.__succes = [];
        window.__erreurs = [];
        notifications.succes = (...a) => { window.__succes.push(a[0]); };
        notifications.erreur = (...a) => { window.__erreurs.push(a[0]); };
        const modele = () => JSON.parse(JSON.stringify(window.MODELES_PRATIQUES_PREDEFINIS[idModele]));

        const rangees = [];
        if (copieRangee) {
            const copie = Object.assign(modele(), { dansBibliotheque: true, dateAjoutBiblio: '2026-09-02T12:00:00.000Z',
                metadata_cc: { licence: 'CC BY-NC-SA 4.0', auteur_original: 'Gabarit Labo Codex' } });
            if (copieRangee === 'ancienne') Object.assign(copie, ancienne);
            rangees.push(copie);
        }
        await db.set('bibliothequePratiques', rangees.concat(biblio));   // security-ok: fixture littérale écrite par le banc, aucune source externe
        const lues = db.getSync(cle('pratiquesConfigurables'), []) || [];
        if (adoptee) lues.push(Object.assign(modele(), ancienne, { dansBibliotheque: true, dateAjout: '2026-09-02T12:00:00.000Z' }));
        await db.set(cle('pratiquesConfigurables'), lues.concat(trimestre));   // security-ok: fixture littérale écrite par le banc, aucune source externe
        if (dossier) window.repertoiresBibliotheque.creer('Dossier fictif', 'pratiques');
        await afficherListePratiquesMateriel();
    }, { trimestre, biblio, adoptee, copieRangee, dossier, idModele: ID_MODELE, ancienne: ANCIENNE });
    await page.locator('#conception-pratiques-notation button[data-action="afficherBibliothequePratiques"]').click();
    await expect(page.locator(SEL + ' .biblio2-fenetre')).toBeVisible();
}

const rangee = (page, cote, nom) => page.locator(SEL + ' .biblio2-panneau--' + cote + ' .biblio2-liste').first()
    .locator(':scope > .biblio2-rangee', { has: page.locator('.biblio2-rangee-nom', { hasText: nom }) });
const menuOuvert = (page) => page.locator(SEL + ' .biblio-menu-popover.actif');
const dialogue = (page) => page.locator('#overlay-ui-dialogue');
const notes = (page) => dialogue(page).locator('.ui-dialogue-note:visible');
const nomsTrimestre = (page) => page.evaluate(() => (db.getSync(cle('pratiquesConfigurables'), []) || [])
    .filter(p => /^(BANC_|SOM-litterature$)/.test(p.id)).map(p => [p.id, p.nom]));
const bibliothequeBrute = (page) => page.evaluate(() => JSON.stringify(db.getSync('bibliothequePratiques', [])));

async function ouvrirRenommer(page, cote, nom) {
    await rangee(page, cote, nom).locator('.biblio2-kebab').click();
    await menuOuvert(page).getByRole('menuitem', { name: 'Renommer', exact: true }).click();
    await expect(dialogue(page).locator('#ui-dialogue-titre')).toHaveText(T.titre);
    await expect(dialogue(page).locator('label[for="ui-dialogue-saisie"]')).toHaveText(T.champ);
}
async function saisirEtRenommer(page, nom) {
    await dialogue(page).locator('#ui-dialogue-saisie').fill(nom);
    await dialogue(page).getByRole('button', { name: 'Renommer', exact: true }).click();
}

test('« Renommer » est en tête des deux menus, avec son title ; absent d’un modèle fourni intact', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrir(page, { trimestre: [fictive('BANC_T1', 'Pratique Zébulon du trimestre')],
        biblio: [fictive('BANC_B1', 'Exemplaire Farfadet')], copieRangee: 'identique', dossier: true });

    await rangee(page, 'trimestre', 'Pratique Zébulon du trimestre').locator('.biblio2-kebab').click();
    const gauche = menuOuvert(page).locator('.biblio-menu-item');
    await expect(gauche.nth(0)).toHaveText('Renommer');
    await expect(gauche.nth(0)).toHaveAttribute('title', 'Changer le nom de cette pratique');
    await expect(gauche.nth(1)).toHaveText('Dupliquer');
    await page.keyboard.press('Escape');

    await rangee(page, 'bibliotheque', 'Exemplaire Farfadet').locator('.biblio2-kebab').click();
    await expect(menuOuvert(page).locator('.biblio-menu-item')).toHaveText(
        ['Renommer', 'Classer dans : Dossier fictif', 'Supprimer de ma bibliothèque']);
    await page.keyboard.press('Escape');

    // Le modèle fourni intact : son ⋮ n'offre que le classement.
    await rangee(page, 'bibliotheque', NOM_MODELE).locator('.biblio2-kebab').click();
    await expect(menuOuvert(page).locator('.biblio-menu-item')).toHaveText(['Classer dans : Dossier fictif']);
    // Appelée directement, la fonction n'ouvre rien pour lui.
    await page.evaluate((id) => window.renommerPratiqueDepuisBibliotheque(id, 'bibliotheque'), ID_MODELE);
    await expect(dialogue(page)).toHaveCount(0);
});

test('depuis le trimestre, avec un exemplaire à soi : les deux noms s’écrivent, la confirmation le dit ; l’autre trimestre ne bouge pas', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrir(page, { trimestre: [fictive('BANC_J1', 'Pratique Zébulon')], biblio: [fictive('BANC_J1', 'Pratique Zébulon')] });
    // Un autre trimestre porte la même pratique : décision 3, il garde son nom.
    const cleAutre = await page.evaluate(async () => {
        const autre = cle('pratiquesConfigurables').replace(/^[^_]+_/, 'banc2024_');
        await db.set(autre, [{ id: 'BANC_J1', nom: 'Pratique Zébulon', type: 'sommative', configuration: {} }]);   // security-ok: fixture littérale écrite par le banc, aucune source externe
        return autre;
    });
    expect(cleAutre).not.toBe(await page.evaluate(() => cle('pratiquesConfigurables')));

    await ouvrirRenommer(page, 'trimestre', 'Pratique Zébulon');
    await expect(dialogue(page).locator('#ui-dialogue-saisie')).toHaveValue('Pratique Zébulon');
    await expect(notes(page)).toHaveText([T.noteExemplaire, T.noteBas]);
    await saisirEtRenommer(page, '   Pratique Farfadet   ');
    await attendreRepos(page);

    await expect(dialogue(page)).toHaveCount(0);
    expect(await nomsTrimestre(page)).toEqual([['BANC_J1', 'Pratique Farfadet']]);
    expect(JSON.parse(await bibliothequeBrute(page)).map(p => [p.id, p.nom])).toEqual([['BANC_J1', 'Pratique Farfadet']]);
    expect(await page.evaluate(() => window.__succes)).toEqual([T.faitLesDeux]);
    expect(await page.evaluate((k) => db.getSync(k, []).map(p => p.nom), cleAutre), 'l’autre trimestre garde son nom').toEqual(['Pratique Zébulon']);
    // La fenêtre est redessinée, la liste de la fiche aussi.
    await expect(rangee(page, 'trimestre', 'Pratique Farfadet')).toHaveCount(1);
    await expect(rangee(page, 'bibliotheque', 'Pratique Farfadet')).toHaveCount(1);
    await expect(page.locator(SEL)).not.toContainText('Pratique Zébulon');
    await expect(page.locator('#selectionPratiques')).toContainText('Pratique Farfadet');
});

test('depuis la bibliothèque, avec la jumelle du trimestre ouverte dans la fiche : les deux noms, le titre et le champ de la fiche', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrir(page, { trimestre: [fictive('BANC_J2', 'Nom du trimestre Lutin')], biblio: [fictive('BANC_J2', 'Exemplaire Lutin')] });
    await page.evaluate(async () => { fermerModalBibliothequePratiques(); await chargerPratiquePourModif('BANC_J2'); });
    await attendreRepos(page);
    await expect(page.locator('#mat-titre-pratique')).toHaveText('Nom du trimestre Lutin');
    await page.locator('#conception-pratiques-notation button[data-action="afficherBibliothequePratiques"]').click();

    await ouvrirRenommer(page, 'bibliotheque', 'Exemplaire Lutin');
    await expect(notes(page)).toHaveText([T.noteTrimestre, T.noteBas]);
    await saisirEtRenommer(page, 'Pratique Korrigan');
    await attendreRepos(page);

    expect(await nomsTrimestre(page)).toEqual([['BANC_J2', 'Pratique Korrigan']]);
    expect(JSON.parse(await bibliothequeBrute(page)).map(p => p.nom)).toEqual(['Pratique Korrigan']);
    expect(await page.evaluate(() => window.__succes)).toEqual([T.faitLesDeux]);
    await expect(page.locator('#mat-titre-pratique')).toHaveText('Pratique Korrigan');
    await expect(page.locator('#mat-pratique-nom')).toHaveValue('Pratique Korrigan');
});

for (const copieRangee of ['ancienne', 'identique', null]) {
    test(`RÈGLE c — pratique adoptée d’un modèle fourni (${copieRangee ? 'copie rangée ' + copieRangee : 'sans copie rangée'}) : seule la rangée du trimestre change, rien ne s’écrit dans la bibliothèque`, async ({ page }) => {
        test.setTimeout(90000);
        await ouvrir(page, { adoptee: true, copieRangee });
        const avant = await bibliothequeBrute(page);

        await ouvrirRenommer(page, 'trimestre', ANCIENNE.nom);
        // `soft` : une note fausse ne doit pas empêcher de juger l'écriture, plus bas (break-test du rapport).
        await expect.soft(notes(page)).toHaveText([T.noteFournie, T.noteBas]);
        await saisirEtRenommer(page, 'Ma pratique cumulative fictive');
        await attendreRepos(page);

        expect(await nomsTrimestre(page)).toEqual([[ID_MODELE, 'Ma pratique cumulative fictive']]);
        expect.soft(await page.evaluate(() => window.__succes)).toEqual([T.fait]);
        expect(await bibliothequeBrute(page), 'la copie rangée du modèle fourni n’est pas réécrite').toBe(avant);
        // Le modèle garde son nom et sa mention : il n'est pas passé pour modifié.
        await expect(rangee(page, 'bibliotheque', NOM_MODELE).locator('.biblio2-rangee-meta')).toHaveText('Cumulative · fourni avec l\'application');
        await expect(rangee(page, 'trimestre', 'Ma pratique cumulative fictive')).toHaveCount(1);
    });
}

test('RÈGLE c — l’écrivain de l’exemplaire, appelé directement, refuse la copie rangée intacte d’un modèle fourni', async ({ page }) => {
    test.setTimeout(90000);
    for (const copieRangee of ['ancienne', 'identique']) {
        await ouvrir(page, { copieRangee });
        const avant = await bibliothequeBrute(page);
        expect(JSON.parse(avant).map(p => p.id)).toEqual([ID_MODELE]);
        expect(await page.evaluate((id) => window.renommerExemplairePratique(id, 'Nom imposé au modèle'), ID_MODELE)).toBe(false);
        expect(await bibliothequeBrute(page), 'la copie rangée ' + copieRangee + ' n’est pas réécrite').toBe(avant);
    }
});

// ↻ 28 nov. 2026, 8 h 00 (décision de Cowork) — LE NOM S'ÉCRIT EN ENTIER. Une pratique née de « Dupliquer » porte son nom
// deux fois (`nom` et `config.nom`), et le moteur lit la seconde d'abord. Le banc passe par la vraie duplication
// (`dupliquerPratique`), active la copie, la renomme par le geste, puis lit les trois écrans de l'enseignant·e.
// BREAK-TEST : retirer la ligne `config.nom = nom` de `poserNomDeLaPratique` (rapport, § 4).
for (const cote of ['trimestre', 'bibliotheque']) {
    test(`la seconde copie du nom (config.nom) suit, geste parti de la colonne ${cote} : le récit du calcul, le CSV des résultats et l’échelle d’Évaluer montrent le nouveau nom`, async ({ page }) => {
        test.setTimeout(120000);
        await ouvrir(page);
        const id = await page.evaluate(async () => {
            fermerModalBibliothequePratiques();
            const avant = new Set((db.getSync(cle('pratiquesConfigurables'), []) || []).map(p => p.id));
            await dupliquerPratique(obtenirIdPratiqueActive(), { nom: 'Copie Banc Dryade' });
            let copie = null;
            await db.modifier(cle('pratiquesConfigurables'), (lues) => {   // security-ok: fixture du banc, aucune source externe
                copie = lues.find(p => !avant.has(p.id));
                delete copie.isDemo;   // une copie de l'enseignant·e : dans la démo, une pratique de la démo ne se renomme pas
                return lues;
            }, []);
            // Son exemplaire, tel quel (même id, même `config`), pour que les deux côtés portent la seconde copie.
            await db.set('bibliothequePratiques', [JSON.parse(JSON.stringify(copie))]);   // security-ok: fixture littérale écrite par le banc, aucune source externe
            await PratiqueManager.changerPratiqueActive(copie.id);
            // Évaluer lit la pratique du COURS (`getPratiqueCours`), pas celle du groupe-cours.
            const cours = db.getSync('cours', []) || [];
            const actif = cours.find(c => c.id === getCoursActifId());
            if (actif) { actif.pratiqueId = copie.id; db.setSync('cours', cours); }   // security-ok: fixture du banc
            await afficherListePratiquesMateriel();
            window.__succes = [];   // la duplication a dit son propre succès
            return copie.id;
        });
        const ecrans = () => page.evaluate(() => {
            const da = obtenirEtudiantsCoursActif()[0].da;
            const details = calculerDetailsNoteFinale(da);
            const contexte = { pratiqueNom: obtenirPratiqueParId(obtenirIdPratiqueActive()).obtenirNom() };
            chargerEchellePerformance();
            return {
                recit: details.recit && details.recit.pratiqueNom,
                detailsNom: details.pratiqueNom,
                csv: contexte.pratiqueNom,
                evaluer: Array.from(document.querySelectorAll('#selectEchelle1 option')).map(o => o.textContent).filter(t => /Pratique active/.test(t))
            };
        });
        const copiesDuNom = (cleStockage) => page.evaluate(({ k, id }) => {
            const p = (db.getSync(k === 'trimestre' ? cle('pratiquesConfigurables') : 'bibliothequePratiques', []) || []).find(x => x.id === id);
            return [p.nom, p.config.nom];
        }, { k: cleStockage, id });
        // Avant le geste : la seconde copie existe, et les trois écrans la lisent.
        expect(await copiesDuNom('trimestre')).toEqual(['Copie Banc Dryade', 'Copie Banc Dryade']);
        const avant = await ecrans();
        expect(avant.recit).toBe('Copie Banc Dryade');
        expect(avant.csv).toBe('Copie Banc Dryade');
        expect(avant.evaluer.length, 'Évaluer offre l’échelle de la pratique active').toBe(1);
        expect(avant.evaluer[0]).toContain('Copie Banc Dryade (Pratique active)');

        await page.locator('#conception-pratiques-notation button[data-action="afficherBibliothequePratiques"]').click();
        await ouvrirRenommer(page, cote, 'Copie Banc Dryade');
        await saisirEtRenommer(page, 'Pratique Banc Naïade');
        await attendreRepos(page);

        expect(await page.evaluate(() => window.__succes)).toEqual([T.faitLesDeux]);
        expect(await copiesDuNom('trimestre'), 'trimestre : nom et config.nom').toEqual(['Pratique Banc Naïade', 'Pratique Banc Naïade']);
        expect(await copiesDuNom('bibliotheque'), 'exemplaire : nom et config.nom').toEqual(['Pratique Banc Naïade', 'Pratique Banc Naïade']);
        const apres = await ecrans();
        expect(apres.recit, 'le récit du calcul').toBe('Pratique Banc Naïade');
        expect(apres.detailsNom).toBe('Pratique Banc Naïade');
        expect(apres.csv, 'la colonne « Pratique (nom) » du CSV').toBe('Pratique Banc Naïade');
        expect(apres.evaluer[0], 'le libellé de l’échelle dans Évaluer').toContain('Pratique Banc Naïade (Pratique active)');
    });
}

test('la fiche écrit aussi la seconde copie du nom (même écrivain) ; une pratique sans config.nom n’en reçoit pas', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrir(page, { trimestre: [
        fictive('BANC_C1', 'Pratique Sirène', { config: { id: 'BANC_C1', nom: 'Pratique Sirène' } }),
        fictive('BANC_C2', 'Pratique Triton'),
        fictive('BANC_C3', 'Pratique Kelpie', { config: { id: 'BANC_C3', nom: 'Pratique Kelpie' } })
    ] });
    await page.evaluate(async () => { fermerModalBibliothequePratiques(); await chargerPratiquePourModif('BANC_C1'); });
    await attendreRepos(page);
    await page.locator('#mat-pratique-nom').fill('Pratique Ondin');
    await page.locator('#mat-pratique-nom').dispatchEvent('change');
    await attendreRepos(page);
    await page.evaluate(() => window.renommerPratiqueDepuisBibliotheque('BANC_C2', 'trimestre').catch(() => {}) && undefined);
    await saisirEtRenommer(page, 'Pratique Selkie');
    await attendreRepos(page);
    expect(await page.evaluate(() => (db.getSync(cle('pratiquesConfigurables'), []) || []).filter(p => /^BANC_C/.test(p.id))
        .map(p => [p.id, p.nom, p.config ? p.config.nom : 'sans config']))).toEqual([
        ['BANC_C1', 'Pratique Ondin', 'Pratique Ondin'],
        ['BANC_C2', 'Pratique Selkie', 'sans config'],
        ['BANC_C3', 'Pratique Kelpie', 'Pratique Kelpie']   // non renommée : non touchée
    ]);
});

test('nom vide : refusé, la fenêtre reste ; nom inchangé : rien n’est écrit ; Annuler : rien', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrir(page, { trimestre: [fictive('BANC_V1', 'Pratique Gnome')], biblio: [fictive('BANC_V1', 'Pratique Gnome')] });
    const etat = async () => JSON.stringify([await nomsTrimestre(page), await bibliothequeBrute(page)]);
    const avant = await etat();

    await ouvrirRenommer(page, 'trimestre', 'Pratique Gnome');
    await saisirEtRenommer(page, '    ');
    await expect(dialogue(page).locator('#ui-dialogue-refus')).toHaveText(T.refusVide);
    await expect(dialogue(page), 'la fenêtre reste ouverte').toHaveCount(1);
    await page.keyboard.press('Enter');
    await expect(dialogue(page)).toHaveCount(1);
    // Une frappe efface le refus ; le nom inchangé (aux espaces près) ferme sans rien écrire.
    await saisirEtRenommer(page, '  Pratique Gnome ');
    await attendreRepos(page);
    await expect(dialogue(page)).toHaveCount(0);
    expect(await etat()).toBe(avant);

    await ouvrirRenommer(page, 'trimestre', 'Pratique Gnome');
    await dialogue(page).locator('#ui-dialogue-saisie').fill('Nom jamais écrit');
    await dialogue(page).getByRole('button', { name: 'Annuler', exact: true }).click();
    await attendreRepos(page);
    expect(await etat()).toBe(avant);
    expect(await page.evaluate(() => [window.__succes, window.__erreurs])).toEqual([[], []]);
    // Échap dans la fenêtre de saisie ne ferme pas la bibliothèque.
    await ouvrirRenommer(page, 'trimestre', 'Pratique Gnome');
    await page.keyboard.press('Escape');
    await expect(dialogue(page)).toHaveCount(0);
    await expect(page.locator(SEL + ' .biblio2-fenetre')).toBeVisible();
});

test('nom déjà porté par une autre pratique : la note, sans blocage ; un nom hostile reste du texte', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrir(page, { trimestre: [fictive('BANC_H1', 'Pratique Troll'), fictive('BANC_H2', 'Pratique Elfe')] });

    await ouvrirRenommer(page, 'trimestre', 'Pratique Troll');
    await expect(notes(page), 'sans jumelle : la note du bas seulement').toHaveText([T.noteBas]);
    await dialogue(page).locator('#ui-dialogue-saisie').fill('pratique elfe');
    await expect(notes(page)).toHaveText([T.noteDejaPorte, T.noteBas]);
    await dialogue(page).locator('#ui-dialogue-saisie').fill('Pratique Elf');
    await expect(notes(page)).toHaveText([T.noteBas]);
    await saisirEtRenommer(page, 'Pratique Elfe');
    await attendreRepos(page);
    expect(await nomsTrimestre(page)).toEqual([['BANC_H1', 'Pratique Elfe'], ['BANC_H2', 'Pratique Elfe']]);
    expect(await page.evaluate(() => window.__succes)).toEqual([T.fait]);

    // Texte libre : rien ne s'exécute, rien ne s'injecte.
    const hostile = '<img src=x onerror="window.__xss=1"> «Fée» & <b>gras</b>';
    await page.evaluate(() => { window.renommerPratiqueDepuisBibliotheque('BANC_H2', 'trimestre'); });   // sans attendre : la fenêtre de saisie s'ouvre
    await saisirEtRenommer(page, hostile);
    await attendreRepos(page);
    expect((await nomsTrimestre(page))[1]).toEqual(['BANC_H2', hostile]);
    expect(await page.evaluate(() => window.__xss)).toBeUndefined();
    await expect(page.locator(SEL + ' .biblio2-rangee-nom img, ' + SEL + ' .biblio2-rangee-nom b, #selectionPratiques img')).toHaveCount(0);
    await expect(rangee(page, 'trimestre', '«Fée»')).toHaveCount(1);
});

test('règle d — si la seconde écriture échoue, l’écran le dit et ne laisse pas croire que les deux ont changé', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrir(page, { trimestre: [fictive('BANC_E1', 'Pratique Sylphe')], biblio: [fictive('BANC_E1', 'Pratique Sylphe')] });
    await page.evaluate(() => { window.renommerExemplairePratique = async () => { throw new Error('panne fictive du banc'); }; });

    await ouvrirRenommer(page, 'trimestre', 'Pratique Sylphe');
    await saisirEtRenommer(page, 'Pratique Ondine');
    await attendreRepos(page);

    expect(await nomsTrimestre(page)).toEqual([['BANC_E1', 'Pratique Ondine']]);
    expect(JSON.parse(await bibliothequeBrute(page)).map(p => p.nom)).toEqual(['Pratique Sylphe']);
    expect(await page.evaluate(() => [window.__succes, window.__erreurs])).toEqual([[],
        ['Pratique renommée dans ce trimestre seulement. Son exemplaire de ta bibliothèque n\'a pas pu être renommé.']]);
});
