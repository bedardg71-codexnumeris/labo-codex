import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import JSZip from 'jszip';
import { ouvrirEspaceVide, mettreLeCadreEnPlace, elevesFictifs, attendreEtape, bulle } from '../integration/harness/classe-de-banc.js';
import { DOSSIER_DES_DEPARTS } from './departs.js';
import { FICHIER_ESSAI, NOM_ESSAI, PRATIQUE, CIBLES, CAT_OBSERVATION, CAT_AUTRE, TAMPONS, PRODUCTIONS, NB_PERSONNES, NB_AVEC_IMAGES } from './essai-tampons-observation.js';

// =======================================================================
// ⚠ ESSAI SEULEMENT — FABRIQUER LE FICHIER D'ESSAI DES TAMPONS D'OBSERVATION, ÉTAPE 3 (25 nov. 2026, consigne de 9 h 45)
// =======================================================================
// À RETIRER AVANT LA FUSION, avec departs/ESSAI-tampons-observation-lot-3.zip, sa section de departs.html et son banc
// tests/integration/essai-tampons-observation-depart.spec.js (rapport du lot 3, § 9 et § 10).
//
// Ce n'est pas un banc : il FABRIQUE un fichier, comme fabriquer-codex-de-depart.spec.js, et se lance de même :
//     PLAYWRIGHT_CHROMIUM=/opt/pw-browsers/chromium npx playwright test -c playwright.departs.config.js essai-tampons-observation
// Ce que le fichier porte, pour poser un tampon d'observation tout de suite dans l'aperçu :
//   · une classe en place par les gestes de « Mettre ta classe en place », QUATRE personnes manifestement fictives ;
//   · une pratique « Par standards » pour ce groupe, écrite dans l'ordre et la forme de `creerParStandards`
//     (js/vue-simple.js) : l'échelle de départ, l'ensemble de cibles par `EnsemblesCibles.enregistrer`, la pratique,
//     `PratiqueManager.changerPratiqueActive`. Deux cibles, deux critères chacune, tous de textes différents ;
//   · les tampons, dans la forme que « Tampons et rétroactions » enregistre (js/travaux-outils.js,
//     `enregistrerRetroObservations`) : une catégorie cochée « D'observation » et ses trois tampons, dont le premier
//     déclare le premier critère de la cible A ; une autre catégorie, non cochée, et son tampon ;
//   · trois productions (une cible, deux cibles, aucune cible déclarée) par `construireProductionData` ;
//   · pour les deux premières personnes, une image fictive DESSINÉE ICI (son texte dit ce qu'elle est) pour chacune des
//     trois productions, importée par le vrai chemin d'import (magic bytes, miniature, stockage).
// AUCUN tampon posé, RIEN d'inscrit au tableau des cibles : ce sont les gestes de l'essai.
// ⛔ Aucune donnée réelle.

/** Le rappel « Mets ton codex à jour » répondu (comme la fabrique des départs) : il ne couvre pas l'essai. */
async function repondreAuRappel(page) {
    await page.evaluate(() => window.backupReminder.verifierEtAfficher());
    const rappel = page.locator('#overlay-backup-reminder.actif');
    if (await rappel.count()) {
        await page.selectOption('#select-rappel-backup', '30');
        await rappel.getByRole('button', { name: 'Plus tard', exact: true }).click();
        await expect(rappel).toHaveCount(0);
    }
}

test('fabriquer : ESSAI, tampons d’observation, étape 3', async ({ page }) => {
    test.setTimeout(300000);
    // 1. La classe, par ses gestes : quatre personnes fictives.
    await ouvrirEspaceVide(page, 1180);
    await mettreLeCadreEnPlace(page, elevesFictifs(NB_PERSONNES));
    await attendreEtape(page, 7, 8, 'Prendre les présences', { focus: false });
    await page.click('#btnVerrouillerSaisiePresences');
    await attendreEtape(page, 8, 8, "Ta classe d'un coup d'œil", { focus: false });
    await bulle(page).getByRole('button', { name: 'Terminer' }).click();
    await expect(bulle(page)).toHaveCount(0);

    // 2. La pratique « Par standards », ses cibles et leurs critères ; les tampons ; les trois productions.
    const ids = await page.evaluate(async ({ PRATIQUE, CIBLES, CAT_OBSERVATION, CAT_AUTRE, TAMPONS, PRODUCTIONS }) => {
        // security-ok: données fictives littérales du fichier d'essai, créées sur place, aucune source externe.
        const EC = window.EnsemblesCibles;
        const maintenant = new Date().toISOString();
        const groupe = db.getSync(cle('groupesCours'), []).find((g) => g && g.id === (db.getSync('groupeCoursActif', {}) || {}).id);
        const echelle = EC.echelleDeDepart(genererIdUnique('ECH_'));
        await modifierEtAnnoncer(cle('echellesTemplates'), (lues) => (lues || []).concat([echelle]), [], { geste: 'Fichier d’essai' });
        const ensembleId = genererIdUnique('ENSC_');
        const cibles = CIBLES.map((c) => ({ id: c.id, etiquette: c.etiquette, enonce: '', poids: 1, terminale: false, criteres: c.criteres }));
        if (!(await EC.enregistrer({ id: ensembleId, coursId: groupe.coursId || null, cibles }))) throw new Error('cibles non écrites');
        const pratique = {
            id: genererIdUnique('PRAT_'), nom: PRATIQUE, description: 'Essai seulement.', type: 'cibles', pratiques: ['CIB'],
            dansBibliotheque: true, dateAjout: maintenant, dateCreation: maintenant,
            calcul_note: { methode: 'niveaux_par_cible' },
            configuration: { type: 'cibles', ensembleCiblesId: ensembleId, echelleId: echelle.id, niveauSansDonnee: EC.CODE_SANS_DONNEE_DEPART }
        };
        await modifierEtAnnoncer(cle('pratiquesConfigurables'), (lues) => (lues || []).concat([pratique]), [], { geste: 'Fichier d’essai' });
        await window.PratiqueManager.changerPratiqueActive(pratique.id);

        // Les tampons : un disque noir et sa marque, dessinés ici.
        const image = (marque) => {
            const c = document.createElement('canvas'); c.width = 64; c.height = 64;
            const x = c.getContext('2d'); x.fillStyle = '#000'; x.beginPath(); x.arc(32, 32, 28, 0, 7); x.fill();
            x.fillStyle = '#fff'; x.font = 'bold 30px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(marque, 32, 34);
            return c.toDataURL('image/png');
        };
        const pers = Object.assign({}, db.getSync('personnalisationObservations', null) || {});
        TAMPONS.forEach((t) => { pers[t.id] = { nom: t.nom, imageBase64: image(t.marque) }; if (t.critere) pers[t.id].critere = t.critere; });
        db.setSync('categoriesPerso', [CAT_OBSERVATION, CAT_AUTRE]);
        db.setSync('nomsCategoriesTampons', Object.assign({}, db.getSync('nomsCategoriesTampons', null) || {}, { [CAT_OBSERVATION.id]: CAT_OBSERVATION.nom, [CAT_AUTRE.id]: CAT_AUTRE.nom }));
        db.setSync('tamponsPersonnalises', TAMPONS.map((t) => ({ id: t.id, nom: t.nom, categorie: t.categorie })));
        db.setSync('personnalisationObservations', pers);
        db.setSync('categoriesObservation', [CAT_OBSERVATION.id]);
        window.travauxOutils.rechargerTamponsPersonnalises();

        // Les productions : `ciblesRenseignees` est ce que la fiche écrit quand son bloc est affiché (js/productions.js).
        const productions = (await db.get(cle('productions'))) || [];
        const idsProductions = {};
        PRODUCTIONS.forEach((d) => {
            const p = construireProductionData({
                titre: d.titre, activiteApprentissage: '', type: 'travail', ponderation: 10,
                objectif: '', tache: '', detailTache: '', grilleId: '', echelleId: '', cartoucheId: '', dateEcheance: ''
            }, productions, null);
            p.id = genererIdUnique('PROD_');
            p.ciblesRenseignees = d.cibles.slice();
            p.dateCreation = maintenant;
            p.dateModification = maintenant;
            productions.push(p);
            idsProductions[d.cle] = p.id;
        });
        await db.set(cle('productions'), productions);
        const eleves = db.getSync(cle('groupeEtudiants'), []);
        return { productions: idsProductions, eleves: eleves.map((e) => ({ da: e.da, nom: e.prenom + ' ' + e.nom })), pratiqueId: pratique.id, ensembleId };
    }, { PRATIQUE, CIBLES, CAT_OBSERVATION, CAT_AUTRE, TAMPONS, PRODUCTIONS });
    expect(ids.eleves.length, 'quatre personnes fictives').toBe(NB_PERSONNES);

    // 3. Les images fictives, par le vrai import : une par personne (les deux premières) et par production.
    const importe = await page.evaluate(async ({ ids, PRODUCTIONS, NB_AVEC_IMAGES }) => {
        const dessiner = (lignes) => new Promise((res) => {
            const c = document.createElement('canvas'); c.width = 850; c.height = 1100;
            const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height);
            x.strokeStyle = '#bbb'; x.lineWidth = 2; x.strokeRect(40, 40, c.width - 80, c.height - 80);
            x.fillStyle = '#222'; x.textAlign = 'left';
            lignes.forEach((l, i) => { x.font = (i === 0 ? 'bold 34px' : '26px') + ' sans-serif'; x.fillText(l, 80, 130 + i * 56); });
            x.strokeStyle = '#ddd'; x.lineWidth = 1;
            for (let y = 420; y < 1000; y += 48) { x.beginPath(); x.moveTo(80, y); x.lineTo(c.width - 80, y); x.stroke(); }
            c.toBlob(res, 'image/jpeg', 0.8);
        });
        travauxImport.viderFileDAttente();
        const prevus = [];
        for (const e of ids.eleves.slice(0, NB_AVEC_IMAGES)) {
            for (const d of PRODUCTIONS) {
                const blob = await dessiner(['IMAGE FICTIVE (essai)', d.titre, e.nom, 'Rien de ceci n’est une vraie production.']);
                prevus.push({ fichier: new File([blob], 'image-fictive-' + d.cle + '-' + e.da + '.jpg', { type: 'image/jpeg' }), da: e.da, productionId: ids.productions[d.cle] });
            }
        }
        // Une production à la fois : `importerTous(productionId)` range la file sous cette production.
        for (const d of PRODUCTIONS) {
            const pid = ids.productions[d.cle];
            const lot = prevus.filter((p) => p.productionId === pid);
            travauxImport.viderFileDAttente();
            travauxImport.ajouterFichiersEnAttente(lot.map((p) => p.fichier));
            travauxImport.obtenirFileDAttente().forEach((f, i) => { f.etudiantDA = lot[i].da; f.productionId = pid; });
            await travauxImport.importerTous(pid);
        }
        travauxImport.viderFileDAttente();
        await db.flush();
        return db.getSync(cle('fichiersTravaux'), []).map((x) => x.etudiantDA + '|' + x.productionId).sort();
    }, { ids, PRODUCTIONS, NB_AVEC_IMAGES });
    const attendus = ids.eleves.slice(0, NB_AVEC_IMAGES).flatMap((e) => PRODUCTIONS.map((d) => e.da + '|' + ids.productions[d.cle])).sort();
    expect(importe, 'six images : deux personnes, trois productions').toEqual(attendus);

    // 3 bis. Le jalon « Ton espace de travail est prêt » (js/transitions.js) paraît une fois dans Évaluation et reste à
    // l'écran tant qu'on ne l'a pas fermé : fermé ici par son geste, comme le rappel, pour qu'il ne couvre pas l'essai.
    await page.locator('[data-onglet="evaluations"]').first().click();
    const jalon = page.locator('#transition-bandeau .transition-bandeau-fermer');
    await expect(jalon, 'le jalon est dû dans cet espace').toBeVisible();
    await jalon.click();
    await expect(page.locator('#transition-bandeau')).toHaveCount(0);

    // 4. Le fichier : le vrai `Codex.generer`, l'aperçu « voici ce qui part » accepté d'office.
    await page.evaluate(() => { definirPreference('modeClair', true); });
    await repondreAuRappel(page);
    const b64Codex = await page.evaluate(async (n) => {
        await db.flush();
        window.SecuriteExportPreview.previewZipEtConfirmer = async () => true;
        const rendu = await Codex.generer({ nom: n });
        const o = new Uint8Array(await rendu.blob.arrayBuffer());
        let binaire = '';
        for (let i = 0; i < o.length; i += 0x8000) binaire += String.fromCharCode.apply(null, o.subarray(i, i + 0x8000));
        return btoa(binaire);
    }, NOM_ESSAI);
    const octets = Buffer.from(b64Codex, 'base64');

    // Témoins, lus dans le zip (pas dans la page) : chaque pièce de la consigne.
    const zip = await JSZip.loadAsync(octets);
    const donnees = JSON.parse(await zip.file('donnees.json').async('string'));
    const trimestres = (donnees.trimestres || []).filter((x) => x && x.id && x.id !== 'demo');
    const t = trimestres[0].id;
    const groupes = donnees[t + '_groupesCours'] || [];
    const pratique = (donnees[t + '_pratiquesConfigurables'] || []).find((p) => p.id === ids.pratiqueId);
    const ensemble = (donnees[t + '_ensemblesCibles'] || []).find((e) => e.id === ids.ensembleId);
    const images = Object.keys(zip.files).filter((n) => /^(trimestres\/[^/]+\/)?travaux\/.+\..+$/.test(n));
    const tamponsPoses = (donnees[t + '_annotationsTravaux'] || []).flatMap((a) => Object.values(a.pages || {})).flatMap((p) => p.stickers || []);
    expect({
        trimestres: trimestres.length,
        groupes: groupes.map((g) => g.pratiqueId),
        famille: pratique && pratique.configuration.type,
        cibles: ensemble.cibles.map((c) => ({ etiquette: c.etiquette, criteres: c.criteres.map((k) => k.texte) })),
        eleves: (donnees[t + '_groupeEtudiants'] || []).length,
        categoriesObservation: donnees.categoriesObservation,
        categoriesPerso: (donnees.categoriesPerso || []).map((c) => c.id),
        tampons: (donnees.tamponsPersonnalises || []).map((x) => x.id + '|' + x.categorie),
        criteresDeclares: Object.entries(donnees.personnalisationObservations || {}).filter(([, v]) => v && v.critere).map(([k, v]) => k + '|' + v.critere),
        productions: (donnees[t + '_productions'] || []).map((p) => ({ titre: p.titre, cibles: p.ciblesRenseignees })),
        copies: (donnees[t + '_fichiersTravaux'] || []).length,
        images: images.length,
        tamponsPoses: tamponsPoses.length,
        inscriptions: (donnees[t + '_inscriptionsCibles'] || []).length,
        demoActif: donnees['demo-actif'] === undefined ? 'absent' : donnees['demo-actif'],
        sansLaDemo: Object.keys(donnees).filter((k) => /^demo_/.test(k)).length
    }).toEqual({
        trimestres: 1,
        groupes: [ids.pratiqueId],
        famille: 'cibles',
        cibles: CIBLES.map((c) => ({ etiquette: c.etiquette, criteres: c.criteres.map((k) => k.texte) })),
        eleves: NB_PERSONNES,
        categoriesObservation: [CAT_OBSERVATION.id],
        categoriesPerso: [CAT_OBSERVATION.id, CAT_AUTRE.id],
        tampons: TAMPONS.map((x) => x.id + '|' + x.categorie),
        criteresDeclares: [TAMPONS[0].id + '|' + CIBLES[0].criteres[0].texte],
        productions: PRODUCTIONS.map((d) => ({ titre: d.titre, cibles: d.cibles })),
        copies: NB_AVEC_IMAGES * PRODUCTIONS.length,
        images: NB_AVEC_IMAGES * PRODUCTIONS.length,
        tamponsPoses: 0,
        inscriptions: 0,
        demoActif: 'absent',
        sansLaDemo: 0
    });
    fs.mkdirSync(DOSSIER_DES_DEPARTS, { recursive: true });
    fs.writeFileSync(path.join(DOSSIER_DES_DEPARTS, FICHIER_ESSAI), octets);
});
