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
    { g: 'Configuration', f: 'js/donnees-v2.js', sig: 'async function supprimerParametreConfig(', cle: "'parametre'", question: "if (!confirm('Supprimer le paramètre « '", efface: 'db.setSync(cle, null)' }
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

    it('chaque clé employée est dans le registre des mots, et chaque clé du registre sert', () => {
        const codex = lire('js/codex.js');
        const registre = tranche(codex, 'var PROPOSITIONS_AVANT_SUPPRESSION = {', '\n};', { longueurMin: 500 });
        const cles = [...registre.matchAll(/^\s+(\w+):\s+\{ premiere: '/gm)].map((m) => m[1]);
        expect(cles.length).toBeGreaterThan(20);
        const employees = new Set(PORTES.flatMap((p) => [...p.cle.matchAll(/'(\w+)'/g)].map((m) => m[1])));
        for (const k of employees) expect(cles, `clé « ${k} » absente du registre`).toContain(k);
        for (const k of cles) expect([...employees], `clé « ${k} » du registre sans porte`).toContain(k);
        // la phrase : la variante, puis la seconde phrase acceptée le 2 oct.
        const fn = corps(codex, 'function messageDeLaProposition(');
        expect(fn).toContain("' Ton codex à jour pourra te ' + v.pronom + ' rendre, jusqu\\'à ta mise à jour suivante.'");
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
