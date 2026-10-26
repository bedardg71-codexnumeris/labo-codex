// LE RELEVÉ DU STOCK — lot 3a de la table de cas (26 oct. 2026), piège 1 de la consigne : ce qu'un critère
// EXISTANT (sans la marque des noms) fait lire à l'étudiant·e, sur une grille de copies — la phrase de projection
// (préfixe, verdict, recommandation), les quatre énoncés, la ligne de la limite, la ligne « principalement » de
// « Points récurrents » (égalités comprises). Le relevé d'AVANT le lot est figé dans
// `tests/fixtures/table-de-cas-3a-avant.json`, produit par ce module sur les registres de `c07270a6` (le `main`
// d'avant le lot) : `node tests/unit/_helpers/releve-table-de-cas.js <dossier js d'avant> > fixture`.
// Le banc `critere-algorithmique-table-de-cas` le refait sur les registres d'aujourd'hui, et compare à l'octet.
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const MODULES = ['note-pourcentage', 'evaluation-enonces', 'evaluation-projection', 'codes-annotation', 'synthese-retroaction-data'];

/** Les registres d'un dossier `js/`, dans un contexte neuf (un `window` à eux). */
export function chargerRegistres(dossierJs) {
    const win = {};
    const ctx = { window: win, require: createRequire(path.join(dossierJs, 'x.js')), console };
    vm.createContext(ctx);
    for (const f of MODULES) vm.runInContext(readFileSync(path.join(dossierJs, f + '.js'), 'utf8'), ctx, { filename: f + '.js' });
    return win;
}

const PALIERS_PERSO = [
    { cle: 'sans_erreur', libelle: 'Parfait', sansErreur: true, ratioMax: null, texte: 'Aucune faute : bravo.', texteAide: '' },
    { cle: 'ok', libelle: 'Correct', ratioMax: 0.6, texte: 'Ton rythme : {moyenne} mots par erreur, palier {palier}.', texteAide: '' },
    { cle: 'limite', libelle: 'Limite', ratioMax: 1, texte: 'Attention.', texteAide: 'Va au {service}.' },
    { cle: 'fin', libelle: 'Trop', ratioMax: null, texte: 'Trop d’erreurs.', texteAide: 'Inscris-toi : {service}.' }
];
const SC = [{ id: 's1', code: '1', nom: 'Syntaxe', ponderation: 1 }, { id: 's2', code: '2', nom: 'Ponctuation', ponderation: 1 }, { id: 's3', code: '3', nom: 'Lexique', ponderation: 1 }];

/** Des critères EXISTANTS : aucun ne porte la marque des noms (`nomsAttendus`). Noms fictifs. */
export const CRITERES_STOCK = {
    francaisSansChamp: { id: 'S1', nom: 'Français écrit', type: 'algorithmique', ponderation: 20 },
    philoEuf: { id: 'S2', nom: 'Rigueur', type: 'algorithmique', ponderation: 30, modeleProjection: 'norme_externe',
        paramsProjection: { motsReference: 600, erreursTolerees: 20, nomServiceAide: 'Atelier fictif', libelleSignalement: 'À revoir', lienServiceAide: '' } },
    paliersPerso: { id: 'S3', nom: 'Langue', type: 'algorithmique', ponderation: 20, modeleProjection: 'norme_externe',
        paramsProjection: { motsReference: 900, erreursTolerees: 30, nomServiceAide: '' }, paliersProjection: PALIERS_PERSO,
        enonces: { concentre: 'Continue : {critere}' } },
    marqueDesCodes: { id: 'S4', nom: 'Précision', type: 'algorithmique', ponderation: 20, codesSousCriteresSeulement: true, sousCriteres: SC,
        modeleProjection: 'norme_externe', paramsProjection: { motsReference: 300, erreursTolerees: 12, nomServiceAide: 'Service fictif' } },
    drapeau: { id: 'S5', nom: 'Rédaction', type: 'algorithmique', ponderation: 20, codesDepuisSousCriteres: true, sousCriteres: SC },
    sansProjection: { id: 'S6', nom: 'Calculs', type: 'algorithmique', ponderation: 20, modeleProjection: 'aucune', paramsProjection: {} }
};

// Les comptes de codes de « Points récurrents » : l'ordre des clés est l'ordre où les codes ont été comptés.
const STATS = [
    { erreursFr: { errfr_2: 2, errfr_1: 2 } },
    { erreursFr: { errfr_1: 1, errfr_3: 3, errfr_2: 3 } },
    { erreursFr: { errfr_3: 1 } },
    { erreursFr: { errfr_10: 4, errfr_9: 4, errfr_1: 1 } }
].map((s) => Object.assign(s, { totalErreursFr: Object.values(s.erreursFr).reduce((a, b) => a + b, 0) }));

/** Ce que chaque critère existant fait lire, sur la grille de copies. */
export function relever(win) {
    const E = win.enoncesAlgo, P = win.projectionAlgo, S = win.syntheseRetroactionData;
    const sortie = {};
    for (const [nom, c] of Object.entries(CRITERES_STOCK)) {
        const critere = JSON.parse(JSON.stringify(c));
        const r = { libelleSeuil: P.libelleSeuil(critere), enonces: {}, projection: {}, principal: [] };
        for (const cle of ['decompte', 'priorite', 'concentre', 'aucune']) r.enonces[cle] = E.enonce(critere, cle, { erreurs: 7, mots: 450 });
        for (const mots of [0, 120, 450, 600, 900, 1300]) {
            for (const erreurs of [0, 1, 2, 3, 5, 8, 12, 17, 20, 30, 45]) {
                const x = P.calculer(critere, { erreurs, mots });
                r.projection[erreurs + '/' + mots] = x.applicable ? [x.palier.cle, x.texte] : ['—', x.raison];
            }
        }
        const grille = { id: 'G-' + nom, criteres: [critere] };
        for (const st of STATS) r.principal.push(S.construireFrancaisResume(JSON.parse(JSON.stringify(st)), grille, null));
        sortie[nom] = r;
    }
    return sortie;
}

// En ligne de commande : le relevé d'un dossier `js/`.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    process.stdout.write(JSON.stringify(relever(chargerRegistres(path.resolve(process.argv[2]))), null, 1) + '\n');
}
