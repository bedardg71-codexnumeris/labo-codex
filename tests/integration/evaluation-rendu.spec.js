import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// Chantier I (Cat-B Track 4) — Tests Playwright rendu DOM evaluation.
// 2 tests :
//   1. Palette critères — afficherCriteresDepuisGrille rend chaque critère
//      avec son select de niveaux IDME.
//   2. Rétroaction Bilan — basculerVueRetroaction('bilan') déclenche
//      genererRetroactionBilan() qui rend les défis prioritaires +
//      les forces dans #contenuRetroBilan.

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i
];
const estErreurAttendue = (msg) => patternsAttendus.some((re) => re.test(msg));

function attacherCaptureErreurs(page, erreurs) {
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
    page.on('dialog', (d) => d.dismiss().catch(() => {}));
}

test('Chantier I · evaluation rend la palette critères (cartes + niveaux IDME)', async ({ page }) => {
    const erreurs = [];
    attacherCaptureErreurs(page, erreurs);

    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const resultat = await page.evaluate(() => {
        if (typeof window.afficherCriteresDepuisGrille !== 'function') {
            return { erreur: 'window.afficherCriteresDepuisGrille absent' };
        }
        if (typeof window.db === 'undefined') return { erreur: 'window.db absent' };

        // Fixtures : 1 grille (2 critères) + 1 échelle IDME standard
        const grille = {
            id: 'grille-test-chantierI',
            nom: 'Grille test',
            criteres: [
                { id: 'c1', nom: 'Idéation', ponderation: 40 },
                { id: 'c2', nom: 'Structure du texte', ponderation: 60 }
            ]
        };
        const echelle = {
            id: 'echelle-test-chantierI',
            nom: 'IDME standard',
            niveaux: [
                { code: 'I', nom: 'Incomplet' },
                { code: 'D', nom: 'en Développement' },
                { code: 'M', nom: 'Maîtrisé' },
                { code: 'E', nom: 'Étendu' }
            ]
        };
        window.db.setSync('grillesTemplates', [grille]);
        window.db.setSync('echellesTemplates', [echelle]);

        // Initialiser le pivot minimal (consulté par afficherCriteresDepuisGrille
        // dans sa logique de pré-cochage)
        window.evaluationEnCours = window.evaluationEnCours || { criteres: {} };

        try {
            window.afficherCriteresDepuisGrille(grille.id, echelle.id);
        } catch (e) {
            return { erreur: 'afficherCriteresDepuisGrille a planté : ' + e.message };
        }

        const liste = document.getElementById('listeCriteresGrille1');
        if (!liste) return { erreur: '#listeCriteresGrille1 absent du DOM' };

        const html = liste.innerHTML;
        return {
            longueur: html.length,
            aIdeation: html.includes('Idéation'),
            aStructure: html.includes('Structure du texte'),
            aPonderation40: html.includes('(40&nbsp;%)'),
            aPonderation60: html.includes('(60&nbsp;%)'),
            nbCartesCriteres: liste.querySelectorAll('.eval-critere-carte').length,
            nbSelectsNiveaux: liste.querySelectorAll('select.eval-select-niveau').length,
            aSelectC1: !!liste.querySelector('#eval_c1'),
            aSelectC2: !!liste.querySelector('#eval_c2'),
            // Chaque select doit contenir 4 options IDME (+ option vide)
            nbOptionsC1: liste.querySelector('#eval_c1')?.options.length || 0,
            aOptionI: html.includes('>I - Incomplet<'),
            aOptionD: html.includes('>D - en Développement<'),
            aOptionM: html.includes('>M - Maîtrisé<'),
            aOptionE: html.includes('>E - Étendu<')
        };
    });

    expect(resultat.erreur, `Erreur eval : ${resultat.erreur}`).toBeUndefined();
    expect(resultat.longueur).toBeGreaterThan(500);
    expect(resultat.aIdeation).toBe(true);
    expect(resultat.aStructure).toBe(true);
    expect(resultat.aPonderation40).toBe(true);
    expect(resultat.aPonderation60).toBe(true);
    expect(resultat.nbCartesCriteres).toBe(2);
    expect(resultat.nbSelectsNiveaux).toBe(2);
    expect(resultat.aSelectC1).toBe(true);
    expect(resultat.aSelectC2).toBe(true);
    expect(resultat.nbOptionsC1).toBe(5); // 4 niveaux + 1 option vide
    expect(resultat.aOptionI).toBe(true);
    expect(resultat.aOptionD).toBe(true);
    expect(resultat.aOptionM).toBe(true);
    expect(resultat.aOptionE).toBe(true);

    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

test('Chantier I · evaluation rend la rétroaction Bilan (défis prioritaires + forces)', async ({ page }) => {
    const erreurs = [];
    attacherCaptureErreurs(page, erreurs);

    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const resultat = await page.evaluate(() => {
        if (typeof window.basculerVueRetroaction !== 'function') {
            return { erreur: 'window.basculerVueRetroaction absent' };
        }
        if (typeof window.db === 'undefined') return { erreur: 'window.db absent' };

        // Fixtures : étudiant + grille + critères + evaluationEnCours
        const grille = {
            id: 'grille-bilan-chantierI',
            nom: 'Grille bilan',
            criteres: [
                { id: 'c1', nom: 'Idéation', ponderation: 40 },
                { id: 'c2', nom: 'Structure', ponderation: 30 },
                { id: 'c3', nom: 'Langue', ponderation: 30 }
            ]
        };
        window.db.setSync('grillesTemplates', [grille]);
        window.db.setSync(window.cle('evaluationsSauvegardees'), []);

        // ⚠⚠ #575 (28 août 2026) — CE MONTAGE NE FOURNISSAIT AUCUNE ÉCHELLE, et
        // la spec passait quand même : le bilan portait alors une table IDME
        // ÉCRITE EN DUR (`_ORDRE_NIV_BILAN`), qui donnait un ordre à tout le
        // monde, y compris à un montage qui n'en désignait aucun. Le vert était
        // obtenu pour la mauvaise raison.
        //
        // Cette table est retirée : l'ordre des niveaux se dérive désormais de
        // l'échelle de l'évaluation. Sans échelle, on ne peut plus dire quel
        // critère est « le meilleur » — et ne rien affirmer vaut mieux que
        // reconduire l'ordre d'un enseignant sur les données d'un autre, ce que
        // le lot 4 du plan SOLO existe précisément pour retirer.
        //
        // ⮕ Le montage désigne donc une échelle, comme le fait toute évaluation
        // réelle. Ses NOMS ne sont pas ceux d'IDME : c'est ce qui prouve que le
        // bilan lit l'échelle et ne connaît pas les libellés par cœur.
        const echelle = {
            id: 'ech-bilan-chantierI',
            nom: 'Échelle du banc',
            // #555 lot 2 — les deux repères. Sans eux, `zoneDuNiveau` rend `null`
            // et le bilan ne conclut plus rien : pas de défi, pas de force.
            // Ces deux lignes sont ce qui a fait rougir cette spec au
            // branchement, alors que Vitest restait vert.
            seuilSuffisance: 'D',
            seuilMaitrise: 'M',
            niveaux: [
                { code: 'I', nom: 'À reprendre',  min: 0,  max: 64,  valeurCalcul: 50 },
                { code: 'D', nom: 'En chemin',    min: 65, max: 74,  valeurCalcul: 70 },
                { code: 'M', nom: 'Solide',       min: 75, max: 84,  valeurCalcul: 80 },
                { code: 'E', nom: 'Au-delà',      min: 85, max: 100, valeurCalcul: 92 }
            ]
        };
        // Les deux clés : le montage seed la grille sans namespace, le code la
        // lit par `cle()`. On ne parie pas sur laquelle des deux répond.
        window.db.setSync('echellesTemplates', [echelle]);
        window.db.setSync(window.cle('echellesTemplates'), [echelle]);

        // Pivot evaluationEnCours minimal avec 1 défi 'I' et 2 forces 'M'
        // pour que le bilan rende défis + forces
        window.evaluationEnCours = {
            etudiantDA: 'TEST001',
            grilleId: grille.id,
            echelleId: echelle.id,
            productionId: 'prod-test',
            criteres: { c1: 'I', c2: 'M', c3: 'M' }
        };

        // Basculer vers la vue bilan → déclenche genererRetroactionBilan()
        try {
            window.basculerVueRetroaction('bilan');
        } catch (e) {
            return { erreur: 'basculerVueRetroaction a planté : ' + e.message };
        }

        const conteneur = document.getElementById('contenuRetroBilan');
        if (!conteneur) return { erreur: '#contenuRetroBilan absent du DOM' };

        const vueBilan = document.getElementById('vueRetroBilan');
        const visible = vueBilan && !vueBilan.classList.contains('u-hide');

        const html = conteneur.innerHTML;
        const texte = conteneur.textContent || '';
        return {
            longueur: html.length,
            vueVisible: visible,
            // Phrase d'introduction du bilan
            aPhrasePreambule: texte.includes('standards sont très élevés'),
            // Titre « Présentement, il faut se concentrer sur »
            aTitrePresentement: texte.includes('Présentement, il faut se concentrer'),
            // Le défi 'Idéation' (niveau I) doit être présent
            aDefi: texte.includes('Idéation'),
            // Section forces doit présenter les critères 'M'
            aMentionForce: texte.includes('Structure') || texte.includes('Langue'),
            // #575 — et le niveau doit porter le NOM DE L'ÉCHELLE, jamais un
            // libellé IDME que le code aurait connu d'avance.
            aNomDeLEchelle: texte.includes('Solide') || texte.includes('À reprendre'),
            aLibelleIDMECodeEnDur: texte.includes('Maîtrisé') || texte.includes('Étendu')
                || texte.includes('En développement') || texte.includes('Incomplet')
        };
    });

    expect(resultat.erreur, `Erreur eval : ${resultat.erreur}`).toBeUndefined();
    expect(resultat.vueVisible).toBe(true);
    expect(resultat.longueur).toBeGreaterThan(200);
    expect(resultat.aPhrasePreambule).toBe(true);
    expect(resultat.aTitrePresentement).toBe(true);
    expect(resultat.aDefi).toBe(true);
    expect(resultat.aMentionForce).toBe(true);
    expect(resultat.aNomDeLEchelle, 'le bilan doit nommer les niveaux avec l\'échelle désignée').toBe(true);
    expect(resultat.aLibelleIDMECodeEnDur, 'aucun libellé IDME ne doit être connu d\'avance par le code').toBe(false);

    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

// ─────────────────────────────────────────────────────────────────────────────
// #576 — LE BILAN QUAND LA GRILLE D'ORIGINE A DISPARU.
//
// Rejoue le cas réel de Grégoire, relevé par la porte terrain 2.6 du 28 août
// 2026 sur ses données d'H2026 (captures des artefacts 8 et 10) : la grille
// n'est plus dans les modèles, et le bilan affichait « Présentement, il faut se
// concentrer sur : » suivi de RIEN.
//
// ⮕ Cette spec REMPLACE une porte terrain. Elle tourne dans WebKit — le moteur
// de Safari — contre le vrai index.html, donc elle répond à la question que la
// porte posait, et Grégoire n'a plus à la refaire à chaque cycle (règle 1 du
// skill `portes-terrain`).
// ─────────────────────────────────────────────────────────────────────────────
test('#576 · le bilan nomme les critères quand la grille d\'origine a disparu', async ({ page }) => {
    const erreurs = [];
    attacherCaptureErreurs(page, erreurs);

    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const resultat = await page.evaluate(() => {
        if (typeof window.basculerVueRetroaction !== 'function') {
            return { erreur: 'window.basculerVueRetroaction absent' };
        }

        // L'échelle de Grégoire, telle que ses captures la montrent.
        const echelle = {
            id: 'ech-idme-niv0-restauree',
            nom: 'IDME et niv 0 (restaurée)',
            seuilSuffisance: 'D',
            seuilMaitrise: 'M',
            niveaux: [
                { code: '0', nom: 'Non recevable',            min: 0,  max: 0,   valeurCalcul: 0  },
                { code: 'I', nom: 'Incomplet ou insuffisant', min: 1,  max: 64,  valeurCalcul: 50 },
                { code: 'D', nom: 'En développement',         min: 65, max: 74,  valeurCalcul: 70 },
                { code: 'M', nom: 'Maîtrisé',                 min: 75, max: 84,  valeurCalcul: 80 },
                { code: 'E', nom: 'Étendu',                   min: 85, max: 100, valeurCalcul: 92 }
            ]
        };
        // ⚠ LA GRILLE `grille-disparue-576` N'EST SEMÉE NULLE PART. C'est tout
        // l'objet du test : les modèles n'en contiennent aucune.
        const evaluation = {
            id: 'eval-576-artefact8',
            etudiantDA: 'TEST576',
            productionId: 'prod-576',
            productionNom: 'Artefact 8',
            grilleId: 'grille-disparue-576',
            echelleId: echelle.id,
            dateEvaluation: '2026-04-10',
            niveauFinal: 'D',
            criteres: [
                { critereId: 'c1', critereNom: 'Structure',    niveauSelectionne: 'M' },
                { critereId: 'c2', critereNom: 'Rigueur',      niveauSelectionne: 'M' },
                { critereId: 'c3', critereNom: 'Plausibilité', niveauSelectionne: 'D' },
                { critereId: 'c4', critereNom: 'Nuance',       niveauSelectionne: 'D' }
            ]
        };
        ['echellesTemplates'].forEach((k) => {
            window.db.setSync(k, [echelle]);
            window.db.setSync(window.cle(k), [echelle]);
        });
        window.db.setSync('grillesTemplates', []);
        window.db.setSync(window.cle('grillesTemplates'), []);
        window.db.setSync('evaluationsSauvegardees', [evaluation]);
        window.db.setSync(window.cle('evaluationsSauvegardees'), [evaluation]);

        window.evaluationEnCours = {
            etudiantDA: 'TEST576',
            grilleId: 'grille-disparue-576',
            echelleId: echelle.id,
            productionId: 'prod-576',
            idModification: 'eval-576-artefact8',
            criteres: { c1: 'M', c2: 'M', c3: 'D', c4: 'D' }
        };

        try {
            window.basculerVueRetroaction('bilan');
        } catch (e) {
            return { erreur: 'basculerVueRetroaction a planté : ' + e.message };
        }

        const conteneur = document.getElementById('contenuRetroBilan');
        if (!conteneur) return { erreur: '#contenuRetroBilan absent du DOM' };
        const texte = conteneur.textContent || '';

        // Ce qui suit le titre, avant le bloc des jetons — la zone qui était vide.
        const titre = 'Présentement, il faut se concentrer sur\u00a0:';
        const titreSimple = 'Présentement, il faut se concentrer sur';
        const debut = texte.indexOf(titre) >= 0 ? texte.indexOf(titre) : texte.indexOf(titreSimple);
        const finJetons = texte.indexOf('Jetons utilisés');
        const corps = debut < 0 ? '' : texte.slice(debut, finJetons > debut ? finJetons : undefined);

        return {
            corpsVide: corps.replace(/[^A-Za-zÀ-ÿ]/g, '').length < 45,
            aDefiNomme: corps.includes('Plausibilité') || corps.includes('Nuance'),
            aNomDeNiveauDeLEchelle: corps.includes('En développement'),
            aForce: texte.includes('Ta force'),
            // Le nom du critère ne doit pas être écrit deux fois de suite.
            nomDouble: /Plausibilité \(Plausibilité/.test(texte) || /Nuance \(Nuance/.test(texte),
            // Aucune note technique : ce bloc est copié dans ce qui va à l'élève.
            aNoteTechnique: /introuvable|grille|sauvegardé|anomalie/i.test(texte)
        };
    });

    expect(resultat.erreur, `Erreur eval : ${resultat.erreur}`).toBeUndefined();
    expect(resultat.corpsVide, 'le titre ne doit plus être suivi du vide (symptôme de la porte 2.6)').toBe(false);
    expect(resultat.aDefiNomme, 'les critères doivent être nommés depuis l\'évaluation enregistrée').toBe(true);
    expect(resultat.aNomDeNiveauDeLEchelle, 'le niveau doit porter le nom de l\'échelle').toBe(true);
    expect(resultat.aForce, 'la mention de force doit apparaître').toBe(true);
    expect(resultat.nomDouble, 'le nom du critère ne doit pas être répété').toBe(false);
    expect(resultat.aNoteTechnique, 'aucune note technique : ce texte part chez l\'élève').toBe(false);

    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});
