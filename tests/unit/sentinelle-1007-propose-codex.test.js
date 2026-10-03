import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tranche, position } from './_helpers/tranche.js';

// =======================================================================
// #1007, SECOND LOT (2a-1, 3 oct. 2026) — AUCUNE PORTE N'EFFACE SANS LE CODEX PROPOSÉ
// =======================================================================
//
// Les gestes du côté « propose » passent tous par `Codex.proposerAvantSuppression(geste)`
// (js/codex.js) : codex à jour, rien ne change ; sinon, la fenêtre (« Annuler »,
// « Supprimer sans mettre à jour », « Mettre à jour, puis supprimer ») AVANT la question
// habituelle du geste. Le comportement est jugé sur la vraie page par
// tests/integration/1007-propose-codex-avant-suppression.spec.js ; ici, la structure :
//
//  A. chaque porte du registre appelle la fonction commune avec sa clé, juste avant sa
//     question habituelle (rien d'autre entre les deux que des commentaires), et avant
//     la ligne qui efface ;
//  B. chaque clé employée existe dans le registre des mots (`PROPOSITIONS_AVANT_SUPPRESSION`),
//     et chaque clé du registre sert ;
//  C. le compte des appels dans js/ égale le registre : une porte branchée ou débranchée
//     sans que ce banc le sache le fait rougir.

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lire = (f) => fs.readFileSync(path.join(racine, f), 'utf8');

const APPEL = 'Codex.proposerAvantSuppression(';

// { geste de l'inventaire, fichier, signature, cle (l'argument tel qu'écrit), question
//   (ce qui suit l'appel : la question habituelle, ou le premier pas du geste), efface }
const PORTES = [
    { g: 'P1',  f: 'js/cours.js', sig: 'async function supprimerFicheCoursAvecGarde(', cle: "'cours'", question: "if (!confirm('Supprimer la fiche « '", efface: "db.setSync('cours', magasin.filter" },
    { g: 'P2',  f: 'js/trimestre-v2-etudiants.js', sig: 'async function supprimerEtudiantV2(', cle: "'eleve'", question: 'if (index === -1 || !confirm(', efface: 'await modifierEtAnnoncer(cleEtud' },
    { g: 'P3',  f: 'js/trimestre-v2-enseignants.js', sig: 'async function supprimerProfilEnseignantV2(', cle: "'enseignant'", question: 'const confirme = confirm(', efface: "sauvegarderDonneesSelonMode('enseignants', nouvellesListe" },
    { g: 'P4',  f: 'js/trimestre-v2-horaires.js', sig: 'async function supprimerHoraireV2(', cle: "'horaire'", question: "if (!confirm(`Supprimer l'horaire", efface: 'db.setSync(cleHoraires, horaires)' },
    { g: 'P7a', f: 'js/productions-liste.js', sig: 'async function supprimerProductionActive(', cle: "'production'", question: "if (!confirm('Es-tu sûr de vouloir supprimer cette production ?'))", efface: 'db.modifier(getCleProductions()' },
    { g: 'P7b', f: 'js/productions.js', sig: 'async function supprimerProduction(id)', cle: "'production'", question: "if (!confirm('Supprimer cette production ?'))", efface: 'db.modifier(getCleProductions()' },
    { g: 'P8',  f: 'js/liste-evaluations.js', sig: 'async function supprimerEvaluation(', cle: "'evaluation'", question: 'if (!confirm(`Veux-tu vraiment supprimer ${quoi}', efface: "sauvegarderDonneesSelonMode('evaluationsSauvegardees', evaluationsFiltered" },
    { g: 'P9',  f: 'js/travaux-ui.js', sig: 'async function proposerNettoyage(', cle: "'copiesExportees'", question: "afficherModalePipeline('Libérer de l\\'espace'", efface: 'nettoyerFichiersArchives(ids)' },
    { g: 'P15', f: 'js/interventions.js', sig: 'async function supprimerInterventionEtRafraichir(', cle: "_enVueRencontres() ? 'rencontre' : 'intervention'", question: 'if (confirm(V().supprimer))', efface: 'supprimerIntervention(interventionId);' },
    { g: 'P17a', f: 'js/bilan-reflexif-editeur.js', sig: 'async function reinitialiserDemo(', cle: "'questionnaire'", question: "if (!confirm('Remplacer le questionnaire actuel", efface: 'sauvegarderQuestionnaire(' },
    { g: 'P17b', f: 'js/bilan-reflexif-import-export-texte.js', sig: 'async function appliquerImport(', cle: "'questionnaire'", question: 'if (!confirm(msg)) return;', efface: 'sauvegarderQuestionnaire(' },
    { g: 'P18-19 (cartouches à déplacer)', f: 'js/grilles.js', sig: 'async function supprimerGrilleAvecPorteDeSortie(', cle: "'grille'", question: 'if (!confirm(message)) {', efface: 'await deplacerCartouchesVersAutreGrille(grilleId' },
    { g: 'P18-19', f: 'js/grilles.js', sig: 'async function supprimerGrilleAvecPorteDeSortie(', cle: "'grille'", question: 'if (!confirm(`Supprimer la grille « ${nomGrille} » ?`))', efface: 'const supprimee = await _retirerGrilleDeLaListe(grilleId, options);\n    if (supprimee) {\n        if (typeof options.apres === \'function\') await options.apres();\n        notifications.succes(`Grille « ${nomGrille} » supprimée`);' },
    { g: 'P20', f: 'js/grilles.js', sig: 'async function supprimerGrilleDeBibliothequePartagee(', cle: "'grilleBibliotheque'", question: 'if (!confirm(`Supprimer définitivement «', efface: 'await retirerGrilleDeLaBibliotheque(id)' },
    { g: 'P22', f: 'js/grilles.js', sig: 'async function supprimerCollectionProjection(', cle: "'collection'", question: 'if (!confirm(`Supprimer la collection', efface: 'collectionsProjection.supprimer(id)' },
    { g: 'P23-24 (sans porteur)', f: 'js/echelles.js', sig: 'async function supprimerOuRemplacerEchelle(', cle: "'echelle'", question: "if (!confirm(options.questionSimple || 'Supprimer cette échelle ?'))", efface: 'modifierEtAnnoncer(cle(\'echellesTemplates\')' },
    { g: 'P23-24 (remplacée)', f: 'js/echelles.js', sig: 'async function supprimerOuRemplacerEchelle(', cle: "'echelle'", question: 'const choix = prompt(question', efface: 'await remplacerEchellePartout(id' },
    { g: 'P25', f: 'js/echelles.js', sig: 'async function supprimerEchelleDeBibliothequePartagee(', cle: "'echelleBibliotheque'", question: 'if (!confirm(`Supprimer définitivement «', efface: 'await retirerEchelleDeLaBibliotheque(id)' },
    { g: 'P26', f: 'js/cartouches.js', sig: 'async function supprimerCartoucheConfirm(', cle: "'cartouche'", question: 'if (confirm(`Supprimer la cartouche «', efface: 'modifierEtAnnoncer(cle(`cartouches_${grilleId}`)' },
    { g: 'P27', f: 'js/cartouches.js', sig: 'async function supprimerCartoucheDefinitivement(', cle: "'cartouche'", question: 'if (!confirm(`Supprimer définitivement la cartouche', efface: 'retirerCartoucheDeLaBibliotheque(' },
    { g: 'P28', f: 'js/cartouches.js', sig: 'async function supprimerCartoucheDeBibliothequePartagee(', cle: "'cartoucheBibliotheque'", question: 'if (!confirm(question)) return;', efface: 'retirerCartoucheDeLaBibliotheque(' },
    { g: 'P29', f: 'js/pratiques-gestion.js', sig: 'async function supprimerPratiqueMateriel(', cle: "'pratique'", question: "if (!confirm('Es-tu sûr de vouloir supprimer cette pratique ?'))", efface: "'pratiquesConfigurables'" },
    { g: 'P30', f: 'js/pratiques-gestion.js', sig: 'async function supprimerPratiqueDefinitivement(', cle: "'pratique'", question: 'if (!confirm(`Supprimer définitivement la pratique', efface: "'pratiquesConfigurables'" },
    { g: 'P31', f: 'js/pratiques-gestion.js', sig: 'async function supprimerPratiqueDeBibliothequePartagee(', cle: "'pratiqueBibliotheque'", question: "if (!confirm('Supprimer définitivement la pratique « '", efface: 'await retirerPratiqueDeLaBibliotheque(pratiqueId)' },
    { g: 'P32', f: 'js/comparateur-pratiques.js', sig: 'async function _jeterMaquette(', cle: "'maquette'", question: "var ok = (typeof uiDialogues !== 'undefined'", efface: 'PratiqueManager.supprimerPratique(id)' },
    { g: 'P33', f: 'js/donnees-v2.js', sig: 'async function ouvrirModalSuppressionRessource(', cle: "'ressource'", question: 'ressourceASupprimer = {', efface: "modal.classList" },
    { g: 'P34', f: 'js/productions-bibliotheque-ui.js', sig: 'async function supprimerProductionDefinitivement(', cle: "'production'", question: 'const okSuppr = await uiDialogues.confirmerAction(', efface: 'db.modifier(getCleProductions()' },
    { g: 'P35', f: 'js/productions-bibliotheque-ui.js', sig: 'async function supprimerProductionDeBibliothequePartagee(', cle: "'productionBibliotheque'", question: 'const okSuppr = await uiDialogues.confirmerAction(', efface: 'retirerDeLaBibliotheque(' },
    { g: 'P36', f: 'js/tampons-bibliotheque.js', sig: 'async function supprimerDeBibliotheque(', cle: "'tampon'", question: 'await retirerDeLaBibliotheque(tamponId)', efface: 'await retirerDeLaBibliotheque(tamponId)' },
    { g: 'P37a', f: 'js/planification-carte.js', sig: 'async function supprimerCarteActive(', cle: "'carte'", question: "if (!confirm('Supprimer la carte « '", efface: 'planificationDonnees.supprimerCarte(' },
    { g: 'P37b', f: 'js/planification-bibliotheque.js', sig: 'async function supprimerAlignementDuTrimestre(', cle: "'carte'", question: 'const okSuppr = await uiDialogues.confirmerAction(', efface: 'planificationDonnees.supprimerCarte(' },
    { g: 'P38', f: 'js/planification-bibliotheque.js', sig: 'async function supprimerAlignementDeBibliotheque(', cle: "'carteBibliotheque'", question: 'const okSuppr = await uiDialogues.confirmerAction(', efface: 'await retirerAlignementDeLaBibliotheque(id)' },
    { g: 'G1', f: 'js/liste-evaluations.js', sig: 'async function supprimerFichierDefinitivement(', cle: "'copieCorbeille'", question: 'const fichierCible = travauxStockage.obtenirCorbeille()', efface: 'await travauxStockage.supprimerDefinitivement(id)' },
    { g: 'G2', f: 'js/liste-evaluations.js', sig: 'async function viderTouteCorbeille(', cle: "'corbeille'", question: 'const nbEvalsLiees = db.getSync(', efface: 'await travauxStockage.viderCorbeille(' },
    { g: 'G3', f: 'js/modelisation.js', sig: 'async function supprimerFichierModelisation(', cle: "'fichierModelisation'", question: "if (!confirm('Supprimer ce fichier et ses annotations ?'))", efface: 'supprimerBlob(id)' },
    { g: 'Configuration', f: 'js/donnees-v2.js', sig: 'async function supprimerParametreConfig(', cle: "'parametre'", question: "if (!confirm('Supprimer le paramètre « '", efface: 'db.setSync(cle, null)' },
    // Lot 2a-2 (3 oct. 2026). `cles` : les clés d'un argument calculé (P10-P11).
    { g: 'P10-P11', f: 'js/travaux-ui.js', sig: 'async function sauvegarderEdition(', cle: 'efface', cles: ['fusionCopies', 'pages'], question: 'if (!editionFichierId || editionPages.length === 0) return;\n\n        const fichier = travauxStockage.obtenirFichierParId(editionFichierId);', efface: 'await travauxStockage.stockerBlob(editionFichierId' },
    { g: 'Copie importée', f: 'js/travaux-ui.js', sig: 'async function supprimerFichierImporte(', cle: "'copieImportee'", question: 'if (evalAssociee) {\n            const choix = confirm(', efface: 'await travauxStockage.supprimerFichierTravail(fichierId)' },
    { g: 'P12', f: 'js/evaluation-jetons.js', sig: 'async function appliquerJetonReprise(', cle: "'repriseOriginale'", question: 'return appliquerJetonReprise(evaluationOriginaleId, archiverOriginale,', efface: 'evaluations.splice(indexOriginal, 1)' },
    { g: 'P13 (sur l\'originale)', f: 'js/evaluation-jetons.js', sig: 'async function retirerJetonReprise(', cle: "'reprise'", question: "return retirerJetonReprise(evaluationId, { codexPropose: true });\n        }\n        const confirmer = confirm(\n            'Cette évaluation est l\\'ORIGINALE", efface: 'evaluations.splice(indexRepriseLiee, 1)' },
    { g: 'P13 (sur la reprise)', f: 'js/evaluation-jetons.js', sig: 'async function retirerJetonReprise(', cle: "'reprise'", question: "return retirerJetonReprise(evaluationId, { codexPropose: true });\n        }\n        const confirmer = confirm(\n            `Retirer le jeton de reprise", efface: 'evaluations.splice(indexReprise, 1)' },
    { g: 'P21', f: 'js/modal-doublon.js', sig: 'async function verifierEtGererDoublon(', cle: "'remplacement'", question: 'return resultat;', efface: 'return resultat;' },
    { g: 'P5', f: 'js/saisie-presences.js', sig: 'async function reinitialiserSaisie(', cle: "'seance'", question: 'const ok = await uiDialogues.confirmerAction({', efface: '_armerEnregistrementPresences(dateStr, touches)' },
    { g: 'P14', f: 'js/travaux-annotation.js', sig: 'async function effacerPage(', cle: "'annotationsPage'", question: 'if (fichierId !== fichierAvant', efface: '_viderPageCourante();' },
    { g: 'P6', f: 'js/registre-longitudinal.js', sig: 'async function retirerEleveLongitudinal(', cle: "'registreLongitudinal'", question: 'if (el && el.dataset && el.dataset.question && !confirm(el.dataset.question))', efface: 'await retirerDuRegistre(da)' },
    { g: 'P16', f: 'js/bilan-reflexif-rapport.js', sig: 'async function supprimerResultats(', cle: "'resultatsBilan'", question: "if (!confirm('Supprimer les r\\u00e9sultats import\\u00e9s ?')) return;", efface: 'db.removeSync(CLE_RESULTATS())' }
];

// Relecture de Cowork (3 oct. 2026, 7 h 55) : la fenêtre peut attendre des minutes (une mise
// à jour du codex), et la page vit pendant ce temps. Ces six portes écrivaient à partir
// d'une lecture faite AVANT l'attente ; elles relisent désormais APRÈS la question, avant
// d'écrire. Les trente autres relisaient déjà (file, `db.modifier`, fonction par id) ou
// détruisent exprès la liste capturée à l'affichage (#556) : tableau dans la release.
const RELECTURES = [
    { g: 'P1', relit: 'plan = await recenserDependancesCours(coursId);' },
    { g: 'P3', relit: "db.getSync('enseignants', [])" },
    { g: 'P4', relit: 'db.getSync(cleHoraires, [])' },
    { g: 'P8', relit: "evaluations = db.getSync(cle('evaluationsSauvegardees'), []);" },
    { g: 'P37a', relit: 'index = window.planificationDonnees.getIndex();' },
    { g: 'P37b', relit: 'index = window.planificationDonnees.getIndex();' },
    // Lot 2a-2 : la séance affichée a changé pendant l'attente → rien n'est réinitialisé.
    { g: 'P5', relit: "document.getElementById('date-cours').value !== dateStr" }
];

/** Le corps d'une fonction : de sa signature à l'accolade fermante posée à la même indentation. */
function corps(source, sig) {
    const i = position(source, sig);
    const debutLigne = source.lastIndexOf('\n', i) + 1;
    const indentation = source.slice(debutLigne, i).match(/^[ ]*/)[0];
    return tranche(source, sig, '\n' + indentation + '}\n', { longueurMin: 60 });
}

/** Ce qui reste d'un texte une fois retirés les commentaires et les blancs. */
const sansCommentaires = (t) => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '').replace(/\s+/g, '');

describe('#1007, second lot — aucune porte n\'efface sans le codex proposé', () => {
    for (const p of PORTES) {
        it(`${p.g} (${p.f}) : l'appel, juste avant la question, avant l'effacement`, () => {
            const c = corps(lire(p.f), p.sig);
            const appel = APPEL + p.cle + ')';
            const iQuestion = position(c, p.question);
            // l'appel le plus proche AVANT la question
            const iAppel = c.lastIndexOf(appel, iQuestion);
            expect(iAppel, `${p.g} : pas d'appel ${appel} avant « ${p.question} »`).toBeGreaterThan(-1);
            const finLigne = position(c, '\n', iAppel);
            expect(sansCommentaires(c.slice(finLigne, iQuestion)), `${p.g} : du code s'intercale entre l'appel et la question`).toBe('');
            // la ligne de l'appel : sur `false`, l'appelant ne fait rien d'autre que sortir
            const ligne = c.slice(c.lastIndexOf('\n', iAppel) + 1, finLigne);
            expect(ligne).toMatch(/^\s*if \(.*!\(await Codex\.proposerAvantSuppression\(.*\)\)\) return\b[^;]*;$/);
            expect(position(c, p.efface, iAppel)).toBeGreaterThan(iAppel);
        });
    }

    for (const r of RELECTURES) {
        it(`${r.g} : ce qui s'écrit après l'attente est relu après la question`, () => {
            const p = PORTES.find((q) => q.g === r.g);
            const c = corps(lire(p.f), p.sig);
            const iQuestion = position(c, p.question);
            const iRelit = c.indexOf(r.relit, iQuestion);
            expect(iRelit, `${r.g} : aucune relecture « ${r.relit} » après la question`).toBeGreaterThan(iQuestion);
            expect(position(c, p.efface, iQuestion)).toBeGreaterThan(iRelit);
        });
    }

    it('chaque clé employée est dans le registre des mots, et chaque clé du registre sert', () => {
        const codex = lire('js/codex.js');
        const registre = tranche(codex, 'var PROPOSITIONS_AVANT_SUPPRESSION = {', '\n};', { longueurMin: 500 });
        const cles = [...registre.matchAll(/^\s+(\w+):\s+\{ premiere: '/gm)].map((m) => m[1]);
        expect(cles.length).toBeGreaterThan(20);
        const employees = new Set(PORTES.flatMap((p) => p.cles || [...p.cle.matchAll(/'(\w+)'/g)].map((m) => m[1])));
        for (const k of employees) expect(cles, `clé « ${k} » absente du registre`).toContain(k);
        for (const k of cles) expect([...employees], `clé « ${k} » du registre sans porte`).toContain(k);
        // la phrase : la variante, puis la seconde phrase acceptée le 2 oct.
        const fn = corps(codex, 'function messageDeLaProposition(');
        expect(fn).toContain("' Ton codex à jour pourra te ' + v.pronom + ' rendre, jusqu\\'à ta mise à jour suivante.'");
    });

    // Lot 2a-2 : les gestes sans question n'appellent la fenêtre que si quelque chose sera effacé.
    // (Le banc WebKit le démontre sur la fusion et le jeton ; ici, la condition de chacun.)
    it('P10-P11 : la fenêtre seulement si la fusion absorbe une copie ou si une page a été retirée', () => {
        const src = lire('js/travaux-ui.js');
        const c = corps(src, 'async function sauvegarderEdition(');
        expect(sansCommentaires(c)).toContain(sansCommentaires("const efface = (editionModeFusion && editionFichiersASupprimer.length > 0) ? 'fusionCopies' : (editionPageRetiree ? 'pages' : null);"));
        expect(sansCommentaires(corps(src, 'function supprimerPageEditeur('))).toContain('editionPages.splice(index,1);editionPageRetiree=true;');
        // remis à faux partout où l'état de l'éditeur l'est (ouverture, fusion, fermeture, enregistrement)
        expect(src.split('editionPageRetiree = false;').length).toBe(src.split('editionFichiersASupprimer = [];').length + 1);
    });

    it('P12 : la fenêtre seulement pour « supprimer l\'originale », après les gardes', () => {
        const c = corps(lire('js/evaluation-jetons.js'), 'async function appliquerJetonReprise(');
        const iAppel = position(c, APPEL);
        expect(c.lastIndexOf('if (!archiverOriginale && !(options && options.codexPropose)) {', iAppel)).toBeGreaterThan(-1);
        expect(position(c, 'maxParProduction')).toBeLessThan(iAppel);
    });

    it('P12, P13 : devenues async, chaque appel dans js/ attend la promesse (un objet Promise passerait pour un succès)', () => {
        const nonAttendus = [];
        for (const f of fs.readdirSync(path.join(racine, 'js'), { recursive: true })) {
            if (!String(f).endsWith('.js')) continue;
            lire(path.join('js', String(f))).split('\n').forEach((l, i) => {
                const code = l.replace(/\/\/.*$/, '');
                for (const m of code.matchAll(/(\S*\s*)\b(appliquerJetonReprise|retirerJetonReprise)\(/g)) {
                    if (/function\s*$|await\s*$|return\s*$/.test(m[1]) || /^(window\.)?$/.test(m[1].trim()) && /function /.test(code)) continue;
                    nonAttendus.push(`${f}:${i + 1} ${l.trim()}`);
                }
            });
        }
        expect(nonAttendus).toEqual([]);
    });

    it('P5, P14, P13 : rien à effacer, aucune fenêtre', () => {
        const p5 = corps(lire('js/saisie-presences.js'), 'async function reinitialiserSaisie(');
        expect(p5.lastIndexOf('if (seanceSaisie && typeof uiDialogues !== \'undefined\') {', position(p5, APPEL))).toBeGreaterThan(-1);
        const p14 = corps(lire('js/travaux-annotation.js'), 'async function effacerPage(');
        expect(position(p14, 'if (_compterAnnotationsPage() === 0) return;')).toBeLessThan(position(p14, APPEL));
        const p13 = corps(lire('js/evaluation-jetons.js'), 'async function retirerJetonReprise(');
        expect(p13).toContain('if (indexRepriseLiee !== -1 && !codexPropose) {');
    });

    it('P21 : seulement après « Remplacer l\'existante » ; « Annuler » rend null, l\'annulation que lisent les cinq appelants', () => {
        const c = corps(lire('js/modal-doublon.js'), 'async function verifierEtGererDoublon(');
        const ligne = c.split('\n').find((l) => l.includes(APPEL));
        expect(ligne).toMatch(/^\s*if \(resultat && resultat\.action === 'ecraser' && .*\) return null;$/);
        for (const f of ['js/echelles.js', 'js/grilles.js', 'js/cartouches.js', 'js/productions.js']) {
            expect(lire(f), f).toMatch(/await verifierEtGererDoublon\([^\n]*\);\n(?:\s*\/\/[^\n]*\n)*\s*if \(resultat === null\)/);
        }
    });

    it('P6, P16 : la question passe du dispatcher à la fonction, mots inchangés', () => {
        const rapport = lire('js/bilan-reflexif-rapport.js');
        expect(rapport).not.toMatch(/data-action="BilanReflexif\.supprimerResultats"[^>]*data-confirm/);
        const registre = lire('js/registre-longitudinal.js');
        expect(registre).toContain("retrait.setAttribute('data-question', MOTS.confirmerRetrait(");
        expect(registre).not.toContain("retrait.setAttribute('data-confirm'");
    });

    it('le compte des appels dans js/ égale le registre de ce banc', () => {
        let n = 0;
        for (const f of fs.readdirSync(path.join(racine, 'js'), { recursive: true })) {
            if (!String(f).endsWith('.js')) continue;
            n += lire(path.join('js', String(f))).split(APPEL).length - 1;
        }
        expect(n).toBe(PORTES.length);
    });

    it('la fonction commune : à jour, rien ; sinon la fenêtre, puis le chemin de « Mettre à jour le codex »', () => {
        const fn = corps(lire('js/codex.js'), 'async function proposerCodexAvantSuppression(');
        expect(fn).toContain('if (_etat.actif && !_etat.modificationsDepuis) return true;');
        expect(fn).toContain("texteFermer: 'Annuler'");
        expect(fn).not.toContain('principal: true');   // « Annuler » garde le focus
        expect(fn).toContain("if (choix === 'sans') return true;");
        expect(fn).toContain("if (choix !== 'maj') return false;");
        expect(fn).toContain('return (await _mettreAJourLeCodex(false)) === true;');
    });
});
