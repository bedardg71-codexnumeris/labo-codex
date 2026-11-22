import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// 21 nov. 2026 — LOT pratique-std-voyage (#1164) : UNE PRATIQUE « PAR STANDARDS » VOYAGE AVEC SES CIBLES, dans
// l'application réelle. Rapport : plans de travail/RAPPORT-2026-11-21-pratique-std-voyage.md.
//
// AVANT LE LOT (mesuré sur main, 16360f43c, même décor) : aucune rangée de « Dans ce trimestre » n'offrait « Garder dans
// ma bibliothèque » ; importée d'un autre trimestre, la pratique affichait « Les cibles de cette pratique sont
// introuvables dans ce trimestre », son ensemble et son échelle restés dans le trimestre source.
//
// CE QUE CE BANC JUGE, par les gestes de l'écran :
//   1. trimestre → bibliothèque → autre trimestre : le bouton, l'état « ✓ Aussi dans ta bibliothèque », l'ensemble recréé
//      (identité neuve, mêmes cibles et critères), l'échelle recréée, le tableau des cibles qui montre les cibles ;
//   2. « Importer depuis un autre trimestre » : même arrivée ;
//   3. rien d'un·e étudiant·e ne voyage ; le trimestre source reste octet pour octet ;
//   4. une échelle et un ensemble déjà présents à l'arrivée ne sont pas réécrits ;
//   5. une pratique d'une autre famille : le bouton, et elle arrive telle qu'elle est partie (jetons compris) ;
//   6. « Exporter (JSON) » emporte les cibles, aucune inscription.
// L'unitaire (sentinelle-pratique-std-voyage) juge les fonctions et porte les break-tests. Noms fictifs.

const S = 'a2026';
const D = 'h2027';
const ZOE = '2100001';
const NIVEAUX = [['0', 'Données insuffisantes', 0], ['1', 'En apprentissage', 25], ['2', 'Ça y est presque', 50], ['3', 'Acquis', 75], ['4', 'Avancé', 100]]
    .map(([code, nom, v], i) => ({ code, nom, valeurCalcul: v, min: i * 20, max: i * 20 + 19, couleur: 'var(--gris-moyen)' }));
const ECHELLE = { id: 'ECH_VOY', nom: 'Échelle fictive du voyage', niveaux: NIVEAUX, dansBibliotheque: true, verrouille: true };
const ENSEMBLE = { id: 'ENSC_VOY', coursId: 'cours-voy', cibles: [
    { id: 'cible_a', etiquette: 'Analyser un texte', enonce: 'Analyser un texte littéraire.', poids: 1, terminale: false,
        criteres: [{ id: 'crit_a1', texte: 'Relève trois procédés', essentiel: true }, { id: 'crit_a2', texte: 'Cite le texte', essentiel: false }] },
    { id: 'cible_b', etiquette: 'Rédiger une dissertation', enonce: 'Rédiger une dissertation complète.', poids: 2, terminale: true, criteres: [] }] };
const STD = { id: 'cib-voy', nom: 'Par standards fictive', type: 'cibles', pratiques: ['CIB'], calcul_note: { methode: 'niveaux_par_cible' }, dansBibliotheque: true,
    jetons: { actif: false },
    configuration: { type: 'cibles', ensembleCiblesId: ENSEMBLE.id, echelleId: ECHELLE.id, niveauSansDonnee: '0' } };
const SOM = { id: 'som-voy', nom: 'Sommative fictive', type: 'sommative', pratiques: ['SOM'], calcul_note: { methode: 'moyenne_ponderee' }, dansBibliotheque: true,
    jetons: { actif: false }, configuration: { seuilReussite: 60 } };
const INSCRIPTIONS = [{ id: 'INS_1', type: 'inscription', da: ZOE, ensembleId: ENSEMBLE.id, cibleId: 'cible_a', niveau: '3', echelleId: ECHELLE.id,
    date: '2026-11-10', horodatage: '2026-11-10T10:00:00.000Z', productionId: null, noteBreve: 'Remarque fictive', criteres: [] }];

async function ouvrir(page) {
    await page.goto(indexHtml);
    await page.waitForFunction(() => window.dbReady === true && window.TableauCibles && window.EnsemblesCibles && window.garderPratiqueDansBibliotheque, null, { timeout: 20000 });
    await page.evaluate(({ S, D, ZOE, ECHELLE, ENSEMBLE, STD, SOM, INSCRIPTIONS }) => {
        // security-ok: fixtures littérales du banc, aucune source externe.
        window.db.setSync('trimestres', [{ id: S, nom: 'Automne fictif', annee: 2026, session: 'A', actif: true }, { id: D, nom: 'Hiver fictif', annee: 2027, session: 'H' }]);
        window.db.setSync('cours', [{ id: 'cours-voy', codeCours: 'FRA101', titre: 'Cours fictif' }]);
        window.db.setSync(S + '_echellesTemplates', [ECHELLE]);
        window.db.setSync(S + '_ensemblesCibles', [ENSEMBLE]);
        window.db.setSync(S + '_pratiquesConfigurables', [STD, SOM]);
        window.db.setSync(S + '_inscriptionsCibles', INSCRIPTIONS);
        window.db.setSync(S + '_groupeEtudiants', [{ da: ZOE, nom: 'Fictive', prenom: 'Zoé', groupe: '01', coursId: 'cours-voy', groupeCoursId: 'GC_S' }]);
        window.db.setSync(D + '_groupeEtudiants', [{ da: '2100002', nom: 'Inventé', prenom: 'Yan', groupe: '01', coursId: 'cours-voy', groupeCoursId: 'GC_D' }]);
        window.db.setSync(D + '_productions', []);
        window.confirm = () => true;
    }, { S, D, ZOE, ECHELLE, ENSEMBLE, STD, SOM, INSCRIPTIONS });
    await activer(page, S);
}

const activer = (page, t) => page.evaluate((t) => { window.changerTrimestreActif(t); }, t);
const lire = (page, k) => page.evaluate((k) => JSON.stringify(window.db.getSync(k, null)), k);
const source = async (page) => ({ p: await lire(page, S + '_pratiquesConfigurables'), e: await lire(page, S + '_ensemblesCibles'),
    ech: await lire(page, S + '_echellesTemplates'), i: await lire(page, S + '_inscriptionsCibles'), g: await lire(page, S + '_groupeEtudiants') });
const fenetre = async (page) => {
    await page.evaluate(async () => { window.fermerModalBibliothequePratiques(); await window.afficherBibliothequePratiques(); });
    await expect(page.locator('#modalBibliothequePratiques')).toBeVisible();
};
const rangeeTrimestre = (page, nom) => page.locator('#listePratiquesDansBibliotheque .biblio2-rangee', { hasText: nom });
const rangeeBibliotheque = (page, nom) => page.locator('#listePratiquesDisponibles .biblio2-rangee', { hasText: nom });

/** Le tableau des cibles du trimestre d'arrivée, pour la pratique `pratiqueId`. */
async function tableauDArrivee(page, pratiqueId) {
    await page.evaluate(async ({ D, pratiqueId }) => {
        window.fermerModalBibliothequePratiques();
        window.db.setSync(D + '_groupesCours', [{ id: 'GC_D', trimestreId: D, coursId: 'cours-voy', groupeNum: '01', pratiqueId, actif: true }]);
        window.db.setSync('infoCours', { id: 'cours-voy', codeCours: 'FRA101', groupe: '01', _groupeCoursId: 'GC_D' });
        window.db.setSync('groupeCoursActif', { id: 'GC_D', trimestreId: D });
        window.afficherSection('evaluations');
        window.afficherSousSection('evaluations-liste');
        await window.TableauNotation.afficher();
    }, { D, pratiqueId });
}

/** Ce qui est arrivé dans le trimestre d'arrivée. */
const arrivee = (page) => page.evaluate((D) => ({
    pratiques: window.db.getSync(D + '_pratiquesConfigurables', []) || [],
    ensembles: window.db.getSync(D + '_ensemblesCibles', []) || [],
    echelles: window.db.getSync(D + '_echellesTemplates', []) || [],
    inscriptions: window.db.getSync(D + '_inscriptionsCibles', null)
}), D);

function jugerArrivee(a, pratique) {
    expect(a.ensembles).toHaveLength(1);
    const ensemble = a.ensembles[0];
    expect(ensemble.id).not.toBe(ENSEMBLE.id);                              // identité NEUVE
    expect(ensemble.cibles).toEqual(ENSEMBLE.cibles);                       // étiquettes, énoncés, critères et essentiels, poids, terminales, identités
    expect(ensemble.coursId).toBe('cours-voy');                             // le cours existe encore : il reste nommé
    expect(pratique.configuration.ensembleCiblesId).toBe(ensemble.id);      // la pratique le nomme
    expect(pratique.configuration.echelleId).toBe(ECHELLE.id);
    expect(pratique.configuration.niveauSansDonnee).toBe('0');
    expect(pratique.configuration).not.toHaveProperty('ciblesEmportees');   // dans un trimestre, plus de bagage
    expect(a.echelles.map(e => e.id)).toEqual([ECHELLE.id]);
    expect(a.echelles[0].niveaux).toEqual(NIVEAUX);
    expect(a.echelles[0].verrouille).toBe(false);                           // le verrou est un état local : il ne voyage pas
    expect(a.inscriptions === null || a.inscriptions.length === 0).toBe(true);   // RIEN d'un·e étudiant·e
    expect(JSON.stringify(a)).not.toContain(ZOE);
}

test('trimestre → bibliothèque → autre trimestre : la pratique « Par standards » arrive avec ses cibles', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    await ouvrir(page);
    const avant = await source(page);
    await fenetre(page);

    // Chaque rangée de « Dans ce trimestre » offre le geste, toutes familles.
    await expect(rangeeTrimestre(page, 'Par standards fictive').locator('[data-action="garderPratiqueDansBibliotheque"]')).toContainText('Garder dans ma bibliothèque');
    await expect(rangeeTrimestre(page, 'Sommative fictive').locator('[data-action="garderPratiqueDansBibliotheque"]')).toContainText('Garder dans ma bibliothèque');
    await expect(page.locator('#listePratiquesDansBibliotheque [onclick]')).toHaveCount(0);

    await rangeeTrimestre(page, 'Par standards fictive').locator('[data-action="garderPratiqueDansBibliotheque"]').click();
    await expect(rangeeTrimestre(page, 'Par standards fictive').locator('.biblio2-etat')).toContainText('Aussi dans ta bibliothèque');
    await expect(rangeeTrimestre(page, 'Par standards fictive').locator('[data-action="garderPratiqueDansBibliotheque"]')).toHaveCount(0);
    await expect(rangeeBibliotheque(page, 'Par standards fictive')).toHaveCount(1);
    await expect(rangeeBibliotheque(page, 'Par standards fictive').locator('.biblio2-etat')).toContainText('Déjà dans ce trimestre');

    // Garder n'enlève ni ne réécrit rien dans le trimestre ; l'exemplaire n'emporte rien d'un·e étudiant·e.
    expect(await source(page)).toEqual(avant);
    const exemplaire = await page.evaluate(async () => (await window.db.get(window.CLE_BIBLIOTHEQUE_PRATIQUES) || []).find(p => p.id === 'cib-voy'));
    expect(exemplaire.configuration.ciblesEmportees.cibles).toEqual(ENSEMBLE.cibles);
    expect(exemplaire.configuration.ciblesEmportees.echelle.niveaux).toEqual(NIVEAUX);
    expect(exemplaire.jetons).toEqual({ actif: false });
    expect(JSON.stringify(exemplaire)).not.toContain(ZOE);
    expect(JSON.stringify(exemplaire)).not.toContain('Remarque fictive');

    // L'hiver : la bibliothèque dit les cibles de l'exemplaire, « ← Utiliser dans ce trimestre » les dépose.
    await activer(page, D);
    await fenetre(page);
    await rangeeBibliotheque(page, 'Par standards fictive').locator('.biblio2-rangee-nom').click();
    await expect(rangeeBibliotheque(page, 'Par standards fictive')).toContainText('Analyser un texte, Rédiger une dissertation');
    await expect(rangeeBibliotheque(page, 'Par standards fictive')).toContainText('Échelle fictive du voyage');
    await rangeeBibliotheque(page, 'Par standards fictive').locator('[data-action="ajouterPratiqueALaSelection"]').click();
    await expect(rangeeTrimestre(page, 'Par standards fictive')).toHaveCount(1);

    const a = await arrivee(page);
    expect(a.pratiques).toHaveLength(1);
    jugerArrivee(a, a.pratiques[0]);
    expect(a.pratiques[0].jetons).toEqual({ actif: false });
    expect(await source(page)).toEqual(avant);                              // le trimestre source : octet pour octet

    await tableauDArrivee(page, a.pratiques[0].id);
    await expect(page.locator('.tc-tableau')).toBeVisible();
    await expect(page.locator('.tc-col-cible .tn-production-titre')).toHaveText(['Analyser un texte', 'Rédiger une dissertation']);
    await expect(page.locator('body')).not.toContainText('introuvables dans ce trimestre');
    expect(erreurs).toEqual([]);
});

test('« Importer depuis un autre trimestre » : l\'ensemble et l\'échelle sont recréés à l\'arrivée, la source n\'est pas écrite', async ({ page }) => {
    await ouvrir(page);
    const avant = await source(page);
    await activer(page, D);
    await fenetre(page);
    await page.locator('details[data-repli="import-trimestre"] summary').click();
    await page.selectOption('#selectTrimestreImportPratiques', S);
    await page.locator('[data-action="afficherPratiquesTrimestreModal"]').click();
    await page.locator('[data-action="importerUnePratiqueTrimestre"][data-param2="cib-voy"]').click();
    await expect(rangeeTrimestre(page, 'Par standards fictive (importée)')).toHaveCount(1);

    const a = await arrivee(page);
    expect(a.pratiques).toHaveLength(1);
    expect(a.pratiques[0].id).not.toBe('cib-voy');
    expect(a.pratiques[0].inspireDeTrimestre).toBe(S);
    jugerArrivee(a, a.pratiques[0]);
    expect(await source(page)).toEqual(avant);

    await tableauDArrivee(page, a.pratiques[0].id);
    await expect(page.locator('.tc-col-cible .tn-production-titre')).toHaveText(['Analyser un texte', 'Rédiger une dissertation']);
});

test('une échelle et un ensemble déjà présents à l\'arrivée ne sont pas réécrits ; un second import a son propre ensemble', async ({ page }) => {
    await ouvrir(page);
    const dejaLa = await page.evaluate(async ({ S, D, ECHELLE }) => {
        window.changerTrimestreActif(D);
        const echelle = Object.assign({}, ECHELLE, { nom: 'Échelle retouchée cet hiver', verrouille: true });
        const ensemble = { id: 'ENSC_VOY', coursId: null, cibles: [{ id: 'cible_z', etiquette: 'Une autre cible', enonce: '', criteres: [], poids: 1, terminale: false }], dateCreation: 'x', dateModification: 'x' };
        window.db.setSync(D + '_echellesTemplates', [echelle]);
        window.db.setSync(D + '_ensemblesCibles', [ensemble]);
        const source = window.db.getSync(S + '_pratiquesConfigurables').find(p => p.id === 'cib-voy');
        const r1 = await window.importerPratiqueDepuisTrimestre(source, S);
        const r2 = await window.importerPratiqueDepuisTrimestre(source, S);
        return { echelle, ensemble, ids: [r1.pratique.configuration.ensembleCiblesId, r2.pratique.configuration.ensembleCiblesId], deps: r1.depsManquantes };
    }, { S, D, ECHELLE });
    const a = await arrivee(page);
    expect(a.echelles).toEqual([dejaLa.echelle]);                           // celle du trimestre sert telle quelle
    expect(a.ensembles).toHaveLength(3);
    expect(a.ensembles[0]).toEqual(dejaLa.ensemble);                        // même identité que la source : pas réécrit
    expect(new Set(dejaLa.ids.concat(['ENSC_VOY'])).size).toBe(3);          // deux pratiques ne partagent jamais un ensemble
    expect(dejaLa.deps).toEqual([]);
});

test('une pratique d\'une autre famille : le bouton, et elle revient telle qu\'elle est partie', async ({ page }) => {
    await ouvrir(page);
    const avant = await source(page);
    await fenetre(page);
    await rangeeTrimestre(page, 'Sommative fictive').locator('[data-action="garderPratiqueDansBibliotheque"]').click();
    await expect(rangeeTrimestre(page, 'Sommative fictive').locator('.biblio2-etat')).toContainText('Aussi dans ta bibliothèque');
    expect(await source(page)).toEqual(avant);

    await activer(page, D);
    await fenetre(page);
    await rangeeBibliotheque(page, 'Sommative fictive').locator('[data-action="ajouterPratiqueALaSelection"]').click();
    await expect(rangeeTrimestre(page, 'Sommative fictive')).toHaveCount(1);
    const a = await arrivee(page);
    expect(a.ensembles).toEqual([]);
    expect(a.echelles).toEqual([]);
    const p = a.pratiques[0];
    for (const champ of ['id', 'nom', 'type', 'pratiques', 'calcul_note', 'configuration', 'jetons']) expect(p[champ]).toEqual(SOM[champ]);
});

test('« Exporter (JSON) » emporte les cibles et l\'échelle, aucune inscription', async ({ page }) => {
    await ouvrir(page);
    const [telechargement] = await Promise.all([
        page.waitForEvent('download'),
        page.evaluate(() => window.partagerPratiqueMateriel('cib-voy'))
    ]);
    const fs = await import('node:fs');
    const contenu = JSON.parse(fs.readFileSync(await telechargement.path(), 'utf8'));
    expect(contenu.configuration.configuration.ciblesEmportees.cibles).toEqual(ENSEMBLE.cibles);
    expect(contenu.configuration.configuration.ciblesEmportees.echelle.id).toBe(ECHELLE.id);
    expect(JSON.stringify(contenu)).not.toContain(ZOE);
    expect(JSON.stringify(contenu)).not.toContain('INS_1');
    // Le partage .lcz : la projection de la pratique porte le même bagage, et le schéma fermé le laisse passer.
    const lcz = await page.evaluate(() => {
        const p = window.db.getSync('a2026_pratiquesConfigurables').find(x => x.id === 'cib-voy');
        return window.partageFormat.projeterEntite(window.EnsemblesCibles.emporter(p), 'pratique');
    });
    expect(lcz.configuration.ciblesEmportees.cibles).toHaveLength(2);
});

/* ------------------------------------------------------------------ Complément du 21 nov. 2026, 22 h : l'arrivée PAR FICHIER */
// Mandat de Cowork (21 h) : « exporter la pratique, l'importer dans un autre trimestre ; ses cibles, leurs critères et son
// échelle sont là, et la note se calcule ». Mesuré avant : le fichier groupé arrivait bien ; « Exporter (JSON) » était
// refusé (« Format invalide ») ; le partage .lcz écrivait la pratique sans déposer ses cibles.

const lireFichier = async (telechargement) => (await import('node:fs')).readFileSync(await telechargement.path());

/** Importe un fichier .json par « Importer des pratiques », dans le trimestre actif, et confirme. */
async function importerJson(page, nom, texte) {
    await fenetre(page);
    await page.setInputFiles('#fichier-import-pratiques-modal', { name: nom, mimeType: 'application/json', buffer: Buffer.from(texte) });
    await page.locator('.modal-import-pratiques .btn-confirmer').click();
    await expect(page.locator('.modal-import-pratiques')).toHaveCount(0);
}
const utiliser = async (page, nom) => {
    await fenetre(page);
    await rangeeBibliotheque(page, nom).locator('[data-action="ajouterPratiqueALaSelection"]').click();
    await expect(rangeeTrimestre(page, nom)).toHaveCount(1);
};
const avis = (page) => page.locator('.notification-info .notification-texte');

test('fichier « Exporter les pratiques de ce trimestre » → autre trimestre : les cibles, l\'échelle, et la note se calcule', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    await ouvrir(page);
    const avant = await source(page);
    const [t] = await Promise.all([page.waitForEvent('download'),
        page.evaluate(() => { window.demanderMetadonneesEnrichies = async () => ({ description: 'Fichier fictif' }); window.exporterPratiquesUtilisateur(); })]);
    const texte = (await lireFichier(t)).toString('utf8');
    expect(texte).not.toContain(ZOE);
    expect(await source(page)).toEqual(avant);

    await activer(page, D);
    await importerJson(page, 'pratiques.json', texte);
    await utiliser(page, 'Par standards fictive');
    const a = await arrivee(page);
    const pratique = a.pratiques.find(p => p.nom === 'Par standards fictive');
    jugerArrivee(a, pratique);
    await expect(avis(page).filter({ hasText: 'sans ses cibles' })).toHaveCount(0);

    // La note se calcule : Yan, « Avancé » (100) sur la cible de poids 1, « Ça y est presque » (50) sur celle de poids 2.
    const note = await page.evaluate(({ D, pratiqueId }) => {
        const p = window.db.getSync(D + '_pratiquesConfigurables').find(x => x.id === pratiqueId);
        const I = (id, cibleId, niveau) => ({ id, type: 'inscription', da: '2100002', ensembleId: p.configuration.ensembleCiblesId, cibleId, niveau,
            echelleId: p.configuration.echelleId, date: '2027-02-01', horodatage: '2027-02-01T10:00:00.000Z', productionId: null, noteBreve: '', criteres: [] });
        // security-ok: fixtures littérales du banc.
        window.db.setSync(D + '_inscriptionsCibles', [I('N1', 'cible_a', '4'), I('N2', 'cible_b', '2')]);
        const n = window.NoteCibles.lireEleve(p.configuration, '2100002').note;
        return { etat: n.etat, note: Math.round(n.note * 100) / 100 };
    }, { D, pratiqueId: pratique.id });
    expect(note).toEqual({ etat: 'note', note: 66.67 });
    expect(await source(page)).toEqual(avant);
    expect(erreurs).toEqual([]);
});

test('fichier « Exporter (JSON) » d\'une pratique → autre trimestre : il a un lecteur, et la pratique arrive avec ses cibles', async ({ page }) => {
    const alertes = [];
    page.on('dialog', async (d) => { alertes.push(d.message()); await d.accept(); });
    await ouvrir(page);
    const [t] = await Promise.all([page.waitForEvent('download'), page.evaluate(() => window.partagerPratiqueMateriel('cib-voy'))]);
    const texte = (await lireFichier(t)).toString('utf8');
    await activer(page, D);
    await importerJson(page, 'une-pratique.json', texte);
    expect(alertes).toEqual([]);                                    // avant : « Format invalide: pratiques ou configurations non trouvées »
    await utiliser(page, 'Par standards fictive');
    const a = await arrivee(page);
    jugerArrivee(a, a.pratiques.find(p => p.nom === 'Par standards fictive'));
    await tableauDArrivee(page, a.pratiques[0].id);
    await expect(page.locator('.tc-col-cible .tn-production-titre')).toHaveText(['Analyser un texte', 'Rédiger une dissertation']);
});

test('un ANCIEN fichier, sans cibles embarquées : l\'import le dit, « Utiliser » le redit, rien n\'est inventé', async ({ page }) => {
    await ouvrir(page);
    // Le fichier tel qu'il sortait avant le lot : la pratique nomme son ensemble et son échelle, sans les porter.
    const ancien = JSON.stringify({ version: '1.0', type: 'configuration-pratique', dateExport: '2026-11-21T20:00:00.000Z', configuration: STD });
    await activer(page, D);
    await importerJson(page, 'ancien.json', ancien);
    await expect(avis(page).filter({ hasText: '« Par standards fictive » arrive sans ses cibles.' })).toHaveCount(1);
    await expect(avis(page).filter({ hasText: 'arrive sans ses cibles' }).first())
        .toContainText('Ce fichier ne les contient pas. Rouvre la pratique dans l\'assistant pour les dire.');
    await page.evaluate(() => document.querySelectorAll('.notification-info').forEach(n => n.remove()));

    await utiliser(page, 'Par standards fictive');
    await expect(avis(page).filter({ hasText: '« Par standards fictive » arrive sans ses cibles.' })).toHaveCount(1);
    const a = await arrivee(page);
    expect(a.ensembles).toEqual([]);                                // aucun ensemble inventé
    expect(a.echelles).toEqual([]);
    expect(a.pratiques).toHaveLength(1);
    expect(a.pratiques[0].configuration.ensembleCiblesId).toBe(ENSEMBLE.id);
    // Une pratique d'une autre famille, par le même fichier : aucun avis.
    await page.evaluate(() => document.querySelectorAll('.notification-info').forEach(n => n.remove()));
    await importerJson(page, 'sommative.json', JSON.stringify({ version: '1.0', type: 'configuration-pratique', configuration: SOM }));
    await expect(avis(page).filter({ hasText: 'sans ses cibles' })).toHaveCount(0);
});

test('partage .lcz → « Dupliquer » dans un autre trimestre : les cibles et l\'échelle sont déposées, la pratique les nomme', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    await ouvrir(page);
    await fenetre(page);
    const attente = page.waitForEvent('download');
    await page.evaluate(() => { window.partageExport.exporterPourPartager('pratique', 'cib-voy'); });
    await page.getByRole('button', { name: 'Exporter (.lcz)' }).click();
    const octets = [...await lireFichier(await attente)];

    await activer(page, D);
    // La réception, sans la fenêtre de confiance (jugée ailleurs : partage-import-rendu) : lecture, validation, intégration.
    const recu = await page.evaluate(async (octets) => {
        const f = new File([new Uint8Array(octets)], 'pratique.lcz', { type: 'application/zip' });
        const verdict = window.partageValidation.validerPackage(await window.partageImport.lirePackageDepuisFichier(f));
        if (!verdict.valide) return { erreurs: verdict.erreurs };
        window.partageImport.integrerPackage(verdict.packageNettoye, { statutConfiance: 'nouveau' });
        const p = (window.db.getSync('partage_pratiques', []) || [])[0];
        return { id: p.id, echelleId: p.configuration.echelleId, bagage: !!p.configuration.ciblesEmportees };
    }, octets);
    expect(recu.erreurs).toBeUndefined();
    expect(recu.bagage).toBe(true);
    expect(recu.echelleId).not.toBe(ECHELLE.id);                    // l'identité préfixée du paquet

    await page.evaluate((id) => window.partageSection.dupliquer('pratique', id), recu.id);
    await expect.poll(async () => (await arrivee(page)).pratiques.length).toBe(1);
    const a = await arrivee(page);
    jugerArrivee(a, a.pratiques[0]);                                // dont : l'échelle nommée est celle du trimestre, plus de bagage
    expect(a.pratiques[0].id).not.toBe(recu.id);
    await tableauDArrivee(page, a.pratiques[0].id);
    await expect(page.locator('.tc-col-cible .tn-production-titre')).toHaveText(['Analyser un texte', 'Rédiger une dissertation']);
    expect(erreurs).toEqual([]);
});

test('une échelle DIFFÉRENTE porte déjà la même identité à l\'arrivée : elle n\'est pas réécrite, une copie « (importée) » sert', async ({ page }) => {
    await ouvrir(page);
    const autre = { id: ECHELLE.id, nom: 'Échelle fictive du voyage', dansBibliotheque: true,
        niveaux: NIVEAUX.map(n => (n.code === '2' ? Object.assign({}, n, { valeurCalcul: 60 }) : n)) };
    await page.evaluate(({ D, autre }) => { window.db.setSync(D + '_echellesTemplates', [autre]); }, { D, autre });   // security-ok: fixture littérale
    await activer(page, D);
    await page.evaluate(async ({ S }) => { await window.importerUnePratiqueTrimestre(S, 'cib-voy'); }, { S });
    await expect.poll(async () => (await arrivee(page)).pratiques.length).toBe(1);
    const a = await arrivee(page);
    expect(a.echelles).toHaveLength(2);
    expect(a.echelles[0]).toEqual(autre);
    expect(a.echelles[1].nom).toBe('Échelle fictive du voyage (importée)');
    expect(a.echelles[1].niveaux).toEqual(NIVEAUX);
    expect(a.pratiques[0].configuration.echelleId).toBe(a.echelles[1].id);
});

// Les captures du rapport : posées seulement à la demande (CAPTURES_VOYAGE = un dossier). La fenêtre des pratiques après
// « Garder » : une rangée à l'état calme, une rangée qui offre le geste, l'aperçu de l'exemplaire qui dit ses cibles.
test('captures : la fenêtre des pratiques, 1180 × 820 et 820 × 1180, clair et sombre', async ({ page }) => {
    const dossier = process.env.CAPTURES_VOYAGE;
    test.skip(!dossier, 'CAPTURES_VOYAGE non posée');
    const fs = await import('node:fs');
    fs.mkdirSync(dossier, { recursive: true });
    await page.setViewportSize({ width: 1180, height: 820 });
    await ouvrir(page);
    await fenetre(page);
    await rangeeTrimestre(page, 'Par standards fictive').locator('[data-action="garderPratiqueDansBibliotheque"]').click();
    await expect(rangeeTrimestre(page, 'Par standards fictive').locator('.biblio2-etat')).toBeVisible();
    await rangeeBibliotheque(page, 'Par standards fictive').locator('.biblio2-rangee-nom').click();
    for (const [l, h] of [[1180, 820], [820, 1180]]) {
        await page.setViewportSize({ width: l, height: h });
        for (const sombre of [false, true]) {
            await page.evaluate((s) => document.body.classList.toggle('mode-clair', !s), sombre);
            await rangeeBibliotheque(page, 'Par standards fictive').scrollIntoViewIfNeeded();
            await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));   // le thème est peint
            await page.screenshot({ path: path.join(dossier, `pratiques-${l}x${h}-${sombre ? 'sombre' : 'clair'}.png`) });
        }
    }
});
