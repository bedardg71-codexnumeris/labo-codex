import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// ═══════════════════════════════════════════════════════════════════════════════════════════
// #1149, LOT 3b (24 oct. 2026) — LES CHAÎNES DES ÉCHELLES, CARTOUCHES, PRODUCTIONS ET PRATIQUES.
// Consigne : plans de travail/CONSIGNE-LOT-2026-10-24-chaines-etapes-3b.md.
//
// Dans le vrai index.html, pour chaque outil de la Conception :
//   · la chaîne paraît avec la fiche et part avec elle ;
//   · elle suit une saisie (un niveau ajouté, un commentaire écrit, un objectif tapé, une échelle choisie) ;
//   · chacun de ses clics conduit où le § 2.5 le dit, et le stockage est le même avant et après ;
// puis : la case « Afficher les chaînes d'étapes » décochée efface les quatre ; l'étape « Échelle » d'une
// pratique part quand sa méthode n'en consomme plus ; un exemple en lecture seule garde sa chaîne et ses
// clics ; la chaîne des productions à 820 px.
// Noms fictifs. Contexte Playwright neuf à chaque essai.
// ═══════════════════════════════════════════════════════════════════════════════════════════

const pause = (page, ms) => page.waitForTimeout(ms);

async function ouvrir(page) {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push('pageerror: ' + e.message));
    page.on('dialog', async (d) => { await d.accept(); });
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await pause(page, 1200);
    return erreurs;
}

/** Le jeu d'essai : une grille, une échelle IDME à repères, une cartouche à 7 cases sur 8, deux productions, deux pratiques. */
async function semer(page) {
    await page.evaluate(async () => {
        const c = window.cle;
        const IDME = [
            { code: 'I', nom: 'Incomplet', min: 0, max: 64.99, valeurCalcul: 32, couleur: '#c0392b' },
            { code: 'D', nom: 'Développement', min: 65, max: 74.99, valeurCalcul: 70, couleur: '#e67e22' },
            { code: 'M', nom: 'Maîtrise', min: 75, max: 84.99, valeurCalcul: 80, couleur: '#2980b9' },
            { code: 'E', nom: 'Étendu', min: 85, max: 100, valeurCalcul: 92, couleur: '#27ae60' }
        ];
        const commentaires = {};
        ['CR_BANC_A', 'CR_BANC_B'].forEach(cr => ['I', 'D', 'M', 'E'].forEach(n => { commentaires[cr + '_' + n] = 'Commentaire ' + n; }));
        delete commentaires.CR_BANC_B_E;
        // security-ok: jeu d'essai littéral d'un test, aucune source externe.
        await db.set(c('grillesTemplates'), [{ id: 'GRILLE_BANC_3B', nom: 'Grille témoin 3b', type: 'holistique', dansBibliotheque: true,
            criteres: [{ id: 'CR_BANC_A', nom: 'Structure', type: 'holistique', ponderation: 60, description: '' },
                { id: 'CR_BANC_B', nom: 'Langue', type: 'holistique', ponderation: 40, description: '' }] }]);
        // security-ok: jeu d'essai littéral d'un test, aucune source externe.
        await db.set(c('echellesTemplates'), [
            { id: 'ECH_BANC_3B', nom: 'Échelle témoin 3b', niveaux: IDME, seuilSuffisance: 'D', seuilMaitrise: 'M', dansBibliotheque: true },
            { id: 'ECH_BANC_TROU', nom: 'Échelle à trou', dansBibliotheque: true,
              niveaux: [{ code: 'A', nom: 'Atteint', min: 60, max: 100, valeurCalcul: 80, couleur: '#27ae60' },
                  { code: 'B', nom: 'Bientôt', min: 0, max: 58, valeurCalcul: 30, couleur: '#c0392b' }] }]);
        // security-ok: jeu d'essai littéral d'un test, aucune source externe.
        await db.set(c('cartouches_GRILLE_BANC_3B'), [{ id: 'CART_BANC_3B', nom: 'Cartouche témoin 3b', grilleId: 'GRILLE_BANC_3B',
            echelleId: 'ECH_BANC_3B', contexte: '', dansBibliotheque: true,
            criteres: [{ id: 'CR_BANC_A', nom: 'Structure' }, { id: 'CR_BANC_B', nom: 'Langue' }],
            niveaux: IDME.map(n => ({ code: n.code, nom: n.nom })), commentaires }]);
        // security-ok: jeu d'essai littéral d'un test, aucune source externe.
        await db.set(c('productions'), [
            { id: 'PROD_BANC_3B', titre: 'Analyse témoin', type: 'travail', ponderation: 40, dansBibliotheque: true,
              grilleId: 'GRILLE_BANC_3B', echelleId: '', cartoucheId: '', objectif: '', tache: 'Rédiger une analyse' },
            { id: 'PROD_BANC_3B_2', titre: 'Essai témoin', type: 'travail', ponderation: 30, dansBibliotheque: true,
              grilleId: 'GRILLE_BANC_3B', echelleId: 'ECH_BANC_3B', cartoucheId: 'CART_BANC_3B', objectif: 'Argumenter', tache: 'Écrire' }]);
        // security-ok: jeu d'essai littéral d'un test, aucune source externe.
        db.setSync(c('pratiquesConfigurables'), [
            { id: 'pratique_banc_som', nom: 'Sommative témoin', type: 'sommative', pratiques: ['SOM'], dansBibliotheque: true,
              calcul_note: { methode: 'moyenne_ponderee' }, configuration: {} },
            { id: 'pratique_banc_std', nom: 'Standards témoin', type: 'standards', pratiques: ['STD'], dansBibliotheque: true,
              calcul_note: { methode: 'conversion_niveaux' }, configuration: { echelleId: '' } }]);
    });
}

/** Aller à la sous-section (son module s'initialise 100 ms plus tard et referme toute fiche), puis ouvrir la fiche. */
async function allerPuisOuvrir(page, sousSection, ouvrirFiche, arg) {
    await page.evaluate((s) => naviguerVers('conception', s), sousSection);
    await pause(page, 400);
    await page.evaluate(ouvrirFiche, arg);
    await pause(page, 500);
}

const OUVRIR = {
    echelle: (page, id = 'ECH_BANC_3B') => allerPuisOuvrir(page, 'echelle-performance', async (id) => { await chargerEchellePourModif(id); }, id),
    cartouche: (page) => allerPuisOuvrir(page, 'retroactions', async () => { await chargerCartouchePourModif('CART_BANC_3B', 'GRILLE_BANC_3B'); }),
    production: (page, id = 'PROD_BANC_3B') => allerPuisOuvrir(page, 'productions', async (id) => { await chargerProductionPourModif(id); }, id),
    pratique: (page, id = 'pratique_banc_std') => allerPuisOuvrir(page, 'pratiques-notation', async (id) => { await chargerPratiquePourModif(id); }, id)
};

/** La chaîne lue dans la page : visible, libellé lu, et par étape réglée, ton, info. */
const lireChaine = (page, id) => page.evaluate((id) => {
    const nav = document.getElementById(id);
    const etapes = {};
    nav.querySelectorAll('.bc-etape').forEach((b) => {
        etapes[b.dataset.etape] = {
            reglee: b.classList.contains('bc-complet'),
            attention: b.classList.contains('bc-attention'),
            critique: b.classList.contains('bc-critique'),
            info: b.querySelector('.bc-info').textContent
        };
    });
    return { visible: nav.getClientRects().length > 0, ids: Object.keys(etapes), etapes, aria: nav.getAttribute('aria-label') };
}, id);

/** Tout le stockage lisible de façon synchrone, clé par clé (les données des modules). */
const instantane = (page) => page.evaluate(() =>
    JSON.stringify(db.keysSync().sort().map((k) => [k, db.getSync(k, null)])));

const dansLaVue = (page, selecteur) => page.evaluate((s) => {
    const el = document.querySelector(s);
    if (!el) return 'absent';
    const b = el.getBoundingClientRect();
    return b.top >= 0 && b.bottom <= innerHeight;
}, selecteur);
const sousSectionVisible = (page, id) => page.evaluate((id) => document.getElementById(id).offsetParent !== null, id);

/** Un clic sur une étape : on remonte, on photographie le stockage, on clique, on attend, on compare. */
async function cliquerSansEcrire(page, chaine, etape) {
    await page.evaluate(() => window.scrollTo(0, 0));
    await pause(page, 200);
    const avant = await instantane(page);
    await page.locator('#' + chaine + ' [data-etape="' + etape + '"]').click();
    await pause(page, 900);
    expect(await instantane(page), chaine + ' › ' + etape + ' : le clic n\'écrit rien').toBe(avant);
}

test('Échelles : la chaîne paraît et part avec la fiche ; un trou en attention ; un niveau ajouté la change ; ses clics conduisent sans écrire', async ({ page }) => {
    test.setTimeout(90000);
    const erreurs = await ouvrir(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    await semer(page);
    await page.evaluate(() => naviguerVers('conception', 'echelle-performance'));
    await pause(page, 500);
    expect((await lireChaine(page, 'chaineEchelle')).visible, 'aucune échelle ouverte, aucune chaîne').toBe(false);

    await OUVRIR.echelle(page);
    let c = await lireChaine(page, 'chaineEchelle');
    expect(c.visible).toBe(true);
    expect(c.aria).toBe('Étapes de l\'échelle');
    expect(c.ids).toEqual(['niveaux', 'pourcentages', 'reperes', 'production']);
    expect(c.etapes.niveaux).toMatchObject({ reglee: true, info: '4 niveaux' });
    expect(c.etapes.pourcentages).toMatchObject({ reglee: true, info: '0 à 100 %' });
    expect(c.etapes.reperes).toMatchObject({ reglee: true, info: 'D · M' });
    expect(c.etapes.production).toMatchObject({ reglee: true, info: '1 prod.' });

    // L'échelle à trou : « trou à 59 % », en attention.
    await OUVRIR.echelle(page, 'ECH_BANC_TROU');
    c = await lireChaine(page, 'chaineEchelle');
    expect(c.etapes.pourcentages).toMatchObject({ reglee: false, attention: true, info: 'trou à 59 %' });
    expect(c.etapes.reperes).toMatchObject({ reglee: false, attention: false, info: 'à poser' });
    expect(c.etapes.production).toMatchObject({ reglee: false, info: 'aucune' });

    // Un niveau ajouté puis rempli (code, nom) : le compte suit.
    await page.locator('#tableauNiveauxEchelle [data-action="ajouterNiveauEchelle"]').click();
    await pause(page, 400);
    c = await lireChaine(page, 'chaineEchelle');
    expect(c.etapes.niveaux.info, 'le niveau en attente n\'est pas encore écrit').toBe('2 niveaux');

    // Les clics, sur l'échelle témoin.
    await OUVRIR.echelle(page);
    await cliquerSansEcrire(page, 'chaineEchelle', 'niveaux');
    expect(await page.evaluate(() => document.getElementById('tableauNiveauxEchelle').getBoundingClientRect().top < innerHeight)).toBe(true);
    await cliquerSansEcrire(page, 'chaineEchelle', 'pourcentages');
    expect(await dansLaVue(page, '#tableauNiveauxEchelle [data-champ="min"]')).toBe(true);
    await cliquerSansEcrire(page, 'chaineEchelle', 'reperes');
    expect(await dansLaVue(page, '#tableauNiveauxEchelle .echelle-reperes-grille')).toBe(true);
    await cliquerSansEcrire(page, 'chaineEchelle', 'production');
    expect(await sousSectionVisible(page, 'conception-productions')).toBe(true);

    // Fermer la fiche emporte la chaîne.
    await OUVRIR.echelle(page);
    await page.evaluate(() => annulerFormEchelle());
    await pause(page, 300);
    expect((await lireChaine(page, 'chaineEchelle')).visible).toBe(false);
    expect(erreurs, erreurs.join(' | ')).toEqual([]);
});

test('Échelles : en création, la chaîne lit le tampon et suit la saisie', async ({ page }) => {
    test.setTimeout(60000);
    const erreurs = await ouvrir(page);
    await page.evaluate(() => naviguerVers('conception', 'echelle-performance'));
    await pause(page, 500);
    await page.evaluate(async () => { await creerNouvelleEchelle(); });
    await pause(page, 400);
    let c = await lireChaine(page, 'chaineEchelle');
    expect(c.visible).toBe(true);
    // Les quatre niveaux du gabarit de création, sans code ni nom.
    expect(c.etapes.niveaux).toMatchObject({ reglee: false, info: '4 niveaux' });
    expect(c.etapes.reperes).toMatchObject({ reglee: false, info: 'à poser' });
    expect(c.etapes.production).toMatchObject({ reglee: false, info: 'aucune' });
    const avant = await instantane(page);
    for (let i = 0; i < 4; i++) {
        for (const [champ, valeur] of [['code', 'ABCD'[i]], ['nom', 'Niveau ' + i]]) {
            const el = page.locator('#tableauNiveauxEchelle [data-champ="' + champ + '"]').nth(i);
            await el.fill(valeur);
            await el.press('Tab');
            await pause(page, 150);
        }
    }
    c = await lireChaine(page, 'chaineEchelle');
    expect(c.etapes.niveaux).toMatchObject({ reglee: true, info: '4 niveaux' });
    expect(await instantane(page), 'en création, rien n\'est écrit avant « Créer l\'échelle »').toBe(avant);
    expect(erreurs, erreurs.join(' | ')).toEqual([]);
});

test('Cartouches : la chaîne paraît et part avec la fiche ; un commentaire écrit la règle ; ses clics conduisent sans écrire', async ({ page }) => {
    test.setTimeout(90000);
    const erreurs = await ouvrir(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    await semer(page);
    await page.evaluate(() => naviguerVers('conception', 'retroactions'));
    await pause(page, 500);
    expect((await lireChaine(page, 'chaineCartouche')).visible).toBe(false);

    await OUVRIR.cartouche(page);
    let c = await lireChaine(page, 'chaineCartouche');
    expect(c.visible).toBe(true);
    expect(c.aria).toBe('Étapes de la cartouche');
    expect(c.ids).toEqual(['grille', 'echelle', 'commentaires', 'production']);
    expect(c.etapes.grille).toMatchObject({ reglee: true, info: '2 critères' });
    expect(c.etapes.echelle).toMatchObject({ reglee: true, info: '4 niveaux' });
    expect(c.etapes.commentaires).toMatchObject({ reglee: false, attention: false, critique: false, info: '7 sur 8' });
    expect(c.etapes.production).toMatchObject({ reglee: true, info: '1 prod.' });

    // Les clics, avant de remplir la case vide (« Commentaires » y descend).
    await cliquerSansEcrire(page, 'chaineCartouche', 'commentaires');
    expect(await dansLaVue(page, '#comm_CR_BANC_B_E')).toBe(true);
    await cliquerSansEcrire(page, 'chaineCartouche', 'echelle');
    expect(await dansLaVue(page, '#selectEchelleCartouche')).toBe(true);
    await cliquerSansEcrire(page, 'chaineCartouche', 'grille');
    expect(await sousSectionVisible(page, 'conception-grille-criteres')).toBe(true);
    await OUVRIR.cartouche(page);
    await cliquerSansEcrire(page, 'chaineCartouche', 'production');
    expect(await sousSectionVisible(page, 'conception-productions')).toBe(true);

    // Le commentaire qui manquait : 8 sur 8, réglée.
    await OUVRIR.cartouche(page);
    const caseVide = page.locator('#comm_CR_BANC_B_E');
    await caseVide.fill('Un commentaire pour le niveau étendu.');
    await caseVide.press('Tab');
    await pause(page, 500);
    c = await lireChaine(page, 'chaineCartouche');
    expect(c.etapes.commentaires).toMatchObject({ reglee: true, info: '8 sur 8' });

    await page.evaluate(() => annulerFormCartouche());
    await pause(page, 300);
    expect((await lireChaine(page, 'chaineCartouche')).visible).toBe(false);
    expect(erreurs, erreurs.join(' | ')).toEqual([]);
});

test('Cartouches : en création après une cartouche ouverte, la chaîne lit les menus, pas la cartouche d\'avant', async ({ page }) => {
    test.setTimeout(60000);
    const erreurs = await ouvrir(page);
    await semer(page);
    await OUVRIR.cartouche(page);
    await page.evaluate(async () => { await creerNouvelleCartouche(); });
    await pause(page, 500);
    let c = await lireChaine(page, 'chaineCartouche');
    expect(c.visible).toBe(true);
    expect(c.etapes.grille).toMatchObject({ reglee: false, info: 'aucun' });
    expect(c.etapes.echelle).toMatchObject({ reglee: false, info: 'à choisir' });
    expect(c.etapes.commentaires).toMatchObject({ reglee: false, info: 'aucune case' });
    expect(c.etapes.production).toMatchObject({ reglee: false, info: 'aucune' });
    // La grille choisie seule compte déjà.
    await page.locator('#selectGrilleCartouche').selectOption('GRILLE_BANC_3B');
    await pause(page, 400);
    c = await lireChaine(page, 'chaineCartouche');
    expect(c.etapes.grille).toMatchObject({ reglee: true, info: '2 critères' });
    expect(c.etapes.echelle).toMatchObject({ reglee: false, info: 'à choisir' });
    expect(erreurs, erreurs.join(' | ')).toEqual([]);
});

test('Productions : la chaîne paraît et part avec la fiche ; un objectif tapé, une échelle choisie la changent ; ses clics conduisent sans écrire', async ({ page }) => {
    test.setTimeout(90000);
    const erreurs = await ouvrir(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    await semer(page);
    await page.evaluate(() => naviguerVers('conception', 'productions'));
    await pause(page, 500);
    expect((await lireChaine(page, 'chaineProduction')).visible).toBe(false);

    await OUVRIR.production(page);
    let c = await lireChaine(page, 'chaineProduction');
    expect(c.visible).toBe(true);
    expect(c.aria).toBe('Étapes de la production');
    expect(c.ids).toEqual(['objectif', 'tache', 'grille', 'echelle', 'cartouche', 'echeance']);
    expect(c.etapes.objectif).toMatchObject({ reglee: false, info: 'à écrire' });
    expect(c.etapes.tache).toMatchObject({ reglee: true, info: 'écrite' });
    expect(c.etapes.grille).toMatchObject({ reglee: true, info: 'choisie' });
    expect(c.etapes.echelle).toMatchObject({ reglee: false, info: 'à choisir' });
    expect(c.etapes.cartouche).toMatchObject({ reglee: false, info: 'aucune' });
    expect(c.etapes.echeance).toMatchObject({ reglee: false, attention: false, info: 'à planifier' });

    // Les clics : chacun descend à son champ, dans la fiche.
    for (const [etape, cible] of [['objectif', '#productionObjectif'], ['tache', '#productionTache'], ['grille', '#productionGrille'],
        ['echelle', '#productionEchelle'], ['cartouche', '#productionCartouche'], ['echeance', '#sectionPlanification']]) {
        await cliquerSansEcrire(page, 'chaineProduction', etape);
        expect(await dansLaVue(page, cible), etape).toBe(true);
    }

    // Un objectif tapé : la chaîne suit la frappe, avant même la sortie du champ.
    await page.locator('#productionObjectif').pressSequentially('Comprendre');
    await pause(page, 300);
    c = await lireChaine(page, 'chaineProduction');
    expect(c.etapes.objectif).toMatchObject({ reglee: true, info: 'écrit' });
    // Une échelle choisie.
    await page.locator('#productionEchelle').selectOption('ECH_BANC_3B');
    await pause(page, 500);
    c = await lireChaine(page, 'chaineProduction');
    expect(c.etapes.echelle).toMatchObject({ reglee: true, info: 'choisie' });

    await page.evaluate(() => annulerFormProduction());
    await pause(page, 300);
    expect((await lireChaine(page, 'chaineProduction')).visible).toBe(false);
    expect(erreurs, erreurs.join(' | ')).toEqual([]);
});

test('Pratiques : sommative (Pondération à 70 %, puis 110 % critique) ; standards (une échelle choisie) ; l\'étape Échelle part avec sa méthode ; ses clics conduisent sans écrire', async ({ page }) => {
    test.setTimeout(120000);
    const erreurs = await ouvrir(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    await semer(page);
    await page.evaluate(() => naviguerVers('conception', 'pratiques-notation'));
    await pause(page, 500);
    expect((await lireChaine(page, 'chainePratique')).visible).toBe(false);

    // Sommative : 40 + 30 = 70 %, à régler sans couleur.
    await OUVRIR.pratique(page, 'pratique_banc_som');
    let c = await lireChaine(page, 'chainePratique');
    expect(c.visible).toBe(true);
    expect(c.aria).toBe('Étapes de la pratique');
    expect(c.ids).toEqual(['methode', 'ponderation', 'groupe-cours']);
    expect(c.etapes.methode).toMatchObject({ reglee: true, info: 'Sommative' });
    expect(c.etapes.ponderation).toMatchObject({ reglee: false, attention: false, critique: false, info: '70 %' });
    expect(c.etapes['groupe-cours']).toMatchObject({ reglee: false, info: 'à activer' });
    // 110 % : critique.
    await page.evaluate(async () => {
        await db.modifier(window.cle('productions'), (l) => { l[0].ponderation = 80; return l; }, []); // security-ok: jeu d'essai d'un test
    });
    await OUVRIR.pratique(page, 'pratique_banc_som');
    c = await lireChaine(page, 'chainePratique');
    expect(c.etapes.ponderation).toMatchObject({ reglee: false, critique: true, info: '110 %' });

    // Les clics de la sommative.
    await cliquerSansEcrire(page, 'chainePratique', 'groupe-cours');
    expect(await dansLaVue(page, '#conteneurEditionPratique [data-action="appliquerPratiqueAuCoursActive"]')).toBe(true);
    await cliquerSansEcrire(page, 'chainePratique', 'methode');
    expect(await page.evaluate(() => document.getElementById('modalWizardPratiqueV2').classList.contains('actif')), 'l\'assistant s\'ouvre').toBe(true);
    await page.evaluate(() => fermerWizardV2());
    await pause(page, 300);
    await cliquerSansEcrire(page, 'chainePratique', 'ponderation');
    expect(await sousSectionVisible(page, 'conception-productions')).toBe(true);

    // Standards : l'échelle paraît ; la choisir la règle.
    await OUVRIR.pratique(page, 'pratique_banc_std');
    c = await lireChaine(page, 'chainePratique');
    expect(c.ids).toEqual(['methode', 'echelle', 'groupe-cours']);
    expect(c.etapes.methode.info).toBe('PAN-Standards');
    expect(c.etapes.echelle).toMatchObject({ reglee: false, info: 'à choisir' });
    await cliquerSansEcrire(page, 'chainePratique', 'echelle');
    expect(await dansLaVue(page, '#mat-echelle-id')).toBe(true);
    await page.locator('#mat-echelle-id').selectOption('ECH_BANC_3B');
    await pause(page, 600);
    c = await lireChaine(page, 'chainePratique');
    expect(c.etapes.echelle).toMatchObject({ reglee: true, info: 'choisie' });

    // Sa méthode change (le retour de l'assistant redessine le menu) : l'étape Échelle part, les nœuds sont rebâtis.
    const avant = await page.evaluate(() => document.querySelector('#chainePratique [data-etape="methode"]'));
    await page.evaluate(async () => {
        await db.modifier(window.cle('pratiquesConfigurables'), (l) => { // security-ok: jeu d'essai d'un test
            const p = l.find(x => x.id === 'pratique_banc_std'); p.calcul_note = { methode: 'specifications' }; p.type = 'specifications'; return l;
        }, []);
        await afficherListePratiquesMateriel();
    });
    await pause(page, 400);
    c = await lireChaine(page, 'chainePratique');
    expect(c.ids).toEqual(['methode', 'groupe-cours']);
    expect(c.etapes.methode.info).toBe('PAN-Spécifications');
    expect(await page.evaluate((a) => document.querySelector('#chainePratique [data-etape="methode"]') !== a, avant)).toBe(true);

    await page.evaluate(() => initialiserModulePratiquesMateriel());
    await pause(page, 300);
    expect((await lireChaine(page, 'chainePratique')).visible).toBe(false);
    expect(erreurs, erreurs.join(' | ')).toEqual([]);
});

test('Préférences : la case décochée efface les quatre chaînes', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrir(page);
    await semer(page);
    await page.evaluate(() => naviguerVers('reglages', 'preferences'));
    await pause(page, 500);
    await page.locator('#v2-pref-chaines-etapes').uncheck();
    await pause(page, 400);
    for (const [outil, id] of [['echelle', 'chaineEchelle'], ['cartouche', 'chaineCartouche'], ['production', 'chaineProduction'], ['pratique', 'chainePratique']]) {
        await OUVRIR[outil](page);
        const etat = await page.evaluate((id) => {
            const nav = document.getElementById(id);
            return { etapes: nav.querySelectorAll('.bc-etape').length, visible: nav.getClientRects().length > 0 };
        }, id);
        expect(etat.etapes, id + ' est dessinée').toBeGreaterThan(0);
        expect(etat.visible, id + ' est masquée').toBe(false);
    }
});

test('Exemples en lecture seule : la chaîne d\'une échelle et d\'une production paraît, ses clics conduisent', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrir(page);
    await page.evaluate(async () => { await window.activerModeDemo(); });
    await pause(page, 1200);
    const ids = await page.evaluate(async () => {
        const demo = (l) => (l || []).find(x => BibliothequeUI.estItemDemo(x));
        const e = demo(await db.get(window.cle('echellesTemplates')));
        // Le portfolio conteneur n'a pas de chaîne : un exemple qui en a une.
        const p = (await db.get(window.cle('productions')) || []).find(x => BibliothequeUI.estItemDemo(x) && x.type !== 'portfolio');
        return { echelle: e && e.id, production: p && p.id };
    });
    expect(ids.echelle).toBeTruthy();
    expect(ids.production).toBeTruthy();
    await OUVRIR.echelle(page, ids.echelle);
    expect(await page.evaluate(() => document.getElementById('nomEchelleTemplate').disabled), 'l\'échelle est en lecture seule').toBe(true);
    expect((await lireChaine(page, 'chaineEchelle')).visible).toBe(true);
    await cliquerSansEcrire(page, 'chaineEchelle', 'niveaux');
    expect(await page.evaluate(() => document.getElementById('tableauNiveauxEchelle').getBoundingClientRect().top < innerHeight)).toBe(true);
    await OUVRIR.production(page, ids.production);
    expect(await page.evaluate(() => document.getElementById('productionTitre').disabled), 'la production est en lecture seule').toBe(true);
    expect((await lireChaine(page, 'chaineProduction')).visible).toBe(true);
    await cliquerSansEcrire(page, 'chaineProduction', 'echeance');
    expect(await dansLaVue(page, '#sectionPlanification')).toBe(true);
});

test('Productions, iPad 820 px : les six étapes tiennent ou défilent, la page ne déborde pas, 44 px au doigt', async ({ page }) => {
    test.setTimeout(60000);
    await ouvrir(page);
    await page.setViewportSize({ width: 820, height: 1180 });
    await semer(page);
    await OUVRIR.production(page);
    const m = await page.evaluate(() => {
        const nav = document.getElementById('chaineProduction');
        const boutons = [...nav.querySelectorAll('.bc-etape')].map(b => b.getBoundingClientRect());
        return {
            nb: boutons.length,
            debordePage: document.documentElement.scrollWidth > innerWidth,
            defile: getComputedStyle(nav).overflowX,
            hauteurMin: Math.min(...boutons.map(b => Math.round(b.height))),
            largeurMin: Math.min(...boutons.map(b => Math.round(b.width)))
        };
    });
    expect(m.nb).toBe(6);
    expect(m.debordePage, 'la page ne défile pas à l\'horizontale').toBe(false);
    expect(m.defile).toBe('auto');
    expect(m.hauteurMin).toBeGreaterThanOrEqual(44);
    expect(m.largeurMin).toBeGreaterThanOrEqual(44);
});

// Les captures de la demande de relecture : seulement quand CAPTURES_CHAINES nomme leur dossier.
test('captures (CAPTURES_CHAINES)', async ({ page }) => {
    test.skip(!process.env.CAPTURES_CHAINES, 'captures seulement sur demande');
    test.setTimeout(400000);
    const dossier = process.env.CAPTURES_CHAINES;
    await ouvrir(page);
    await semer(page);
    const fiches = [
        ['echelles-reglee', 'chaineEchelle', (p) => OUVRIR.echelle(p)],
        ['echelles-a-regler', 'chaineEchelle', (p) => OUVRIR.echelle(p, 'ECH_BANC_TROU')],
        ['cartouches-a-regler', 'chaineCartouche', (p) => OUVRIR.cartouche(p)],
        ['productions-reglee', 'chaineProduction', (p) => OUVRIR.production(p, 'PROD_BANC_3B_2')],
        ['productions-a-regler', 'chaineProduction', (p) => OUVRIR.production(p)],
        ['pratiques-reglee', 'chainePratique', (p) => OUVRIR.pratique(p, 'pratique_banc_std')],
        ['pratiques-a-regler', 'chainePratique', (p) => OUVRIR.pratique(p, 'pratique_banc_som')]
    ];
    for (const sombre of [false, true]) {
        const mode = sombre ? 'sombre' : 'clair';
        for (const largeur of [1440, 820]) {
            await page.setViewportSize({ width: largeur, height: 1000 });
            for (const [nom, chaine, ouvrirFiche] of fiches) {
                await ouvrirFiche(page);
                await page.evaluate((s) => document.body.classList.toggle('mode-clair', !s), sombre);
                await page.locator('#' + chaine).scrollIntoViewIfNeeded();
                await pause(page, 400);
                const b = await page.locator('#' + chaine).boundingBox();
                await page.screenshot({ path: path.join(dossier, `${nom}-${largeur}-${mode}.png`),
                    clip: { x: 0, y: Math.max(0, b.y - 140), width: largeur, height: Math.min(560, b.height + 420) } });
            }
            // La cartouche réglée : la case qui manquait, remplie.
            await OUVRIR.cartouche(page);
            await page.locator('#comm_CR_BANC_B_E').fill('Un commentaire pour le niveau étendu.');
            await page.locator('#comm_CR_BANC_B_E').press('Tab');
            await page.evaluate((s) => document.body.classList.toggle('mode-clair', !s), sombre);
            await page.locator('#chaineCartouche').scrollIntoViewIfNeeded();
            await pause(page, 400);
            const b = await page.locator('#chaineCartouche').boundingBox();
            await page.screenshot({ path: path.join(dossier, `cartouches-reglee-${largeur}-${mode}.png`),
                clip: { x: 0, y: Math.max(0, b.y - 140), width: largeur, height: Math.min(560, b.height + 420) } });
            await page.evaluate(async () => {
                await db.modifier(window.cle('cartouches_GRILLE_BANC_3B'), (l) => { delete l[0].commentaires.CR_BANC_B_E; return l; }, []); // security-ok: jeu d'essai d'un test
            });
        }
    }
});
