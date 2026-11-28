/**
 * SENTINELLE (28 nov. 2026) — LA FAMILLE D'UNE PRATIQUE SE DÉDUIT DE SES RÉGLAGES.
 *
 * Définition rapportée par Grégoire de la communauté de pratique sur les PAN (rencontre du 27 nov. ; arrêtée le 28 nov.,
 * 7 h 01 à 7 h 12), relayée par Cowork :
 *   - la note ne se construit pas par cumul : PAN (STD, SPE, DEN), rien ne change ;
 *   - cumul, aucune note révisée : CUMULATIVE ; cumul, une note peut être révisée : HYBRIDE.
 * Deux types cumulent (`sommative`, `standards`). Rendent hybride, un seul suffit : un bloc RETENU ; des jetons de REPRISE
 * réellement offerts (le bloc que la pratique DÉCLARE, décision du 28 nov., 8 h 00 : sans réglage, CUM).
 * L'ÉCRAN SEULEMENT : le calcul suit toujours le type. Rapport : plans de travail/RAPPORT-2026-11-28-familles-par-reglages.md.
 *
 * VERROUILLÉ ICI :
 *   A. La table de la règle, cas par cas, pour les deux types qui cumulent ; le motif et le survol.
 *   B. Les trois PAN, inchangées ; le code interne (le calcul) ne suit jamais la famille déduite.
 *   C. Les lecteurs passent par la fonction : fiche, bibliothèque, assistant, ressources, Comparateur, profil, export.
 *   D. Aucun second lecteur de la famille par type (les accesseurs par type ne s'appellent plus hors de leurs places).
 *   E. Les quatorze textes de Grégoire, chacun à sa source (lus au fichier validé, jamais recopiés).
 *   F. Les pratiques fournies et celles de la démo : leur famille avant, leur famille après.
 * BREAK-TESTS : journal en fin de fichier.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { chargerScript } from './_helpers/charger-script.js';
import { RACINE, chargerAvecInterne } from './_helpers/bac-suivi.js';
import { magasinBanc, monterAssistant, recapDuCas } from './_helpers/recap-familles.js';

const lire = (f) => readFileSync(path.join(RACINE, f), 'utf8');
const echapperHtml = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Le vrai registre et le vrai lecteur des jetons, dans une même fenêtre, sur un magasin donné. */
function monterRegistre(magasin = {}) {
    const db = { getSync: (k, d) => (Object.prototype.hasOwnProperty.call(magasin, k) ? magasin[k] : (d !== undefined ? d : null)), setSync() {} };
    const win = chargerScript('js/evaluation-jetons.js', { db, cle: (k) => k });
    chargerScript('js/pratiques/pratique-registre.js', { db, cle: (k) => k }, win);
    return win;
}
const REG = monterRegistre();
const famille = (p) => REG.familleDeduiteDeLaPratique(p);

/* Les réglages de jetons, dans les formes que les pratiques portent. */
const J = {
    refuses: { actif: false },
    delaiSeul: { actif: true, delai: { nombre: 2, dureeJours: 2 }, reprise: { nombre: 0 }, repriseCiblee: { actif: false } },
    uneReprise: { actif: true, delai: { nombre: 0 }, reprise: { nombre: 1 }, repriseCiblee: { actif: false } },
    cibleeSeule: { actif: true, delai: { nombre: 0 }, reprise: { nombre: 0 }, repriseCiblee: { actif: true, nombre: 1 } },
    cibleeANombreNul: { actif: true, delai: { nombre: 2 }, reprise: { nombre: 0 }, repriseCiblee: { actif: true, nombre: 0 } },
    eteintsAvecNombre: { actif: false, delai: { nombre: 2 }, reprise: { nombre: 3 }, repriseCiblee: { actif: true, nombre: 2 } },
    assistantRefuse: { activer: false },
    platActif: { nombre: 2, delaiDuree: 2, repriseOriginale: 'archiver' }
};
const std = (portfolio, extra) => Object.assign({ type: 'standards', configuration: Object.assign({ portfolio }, extra || {}) });
const TOUT = { methodeSelection: 'tous', nombreARetenir: 7 };

/* ================================================================ A. LA TABLE DE LA RÈGLE */
const CUM = { sigle: 'CUM', famille: 'Cumulative', nom: 'Cumulative', cle: 'sommative', couleurVar: '--som-orange', classe: 'badge-type-som', motif: 'tout-compte' };
const HYB = (motif) => ({ sigle: 'HYB', famille: 'Hybride', nom: 'Hybride', cle: 'standards', couleurVar: '--sel-sarcelle', classe: 'badge-type-std', motif });

describe('A · la table de la règle', () => {
    describe('type sommative (cumule, ne sélectionne jamais)', () => {
        const som = (jetons) => Object.assign({ type: 'sommative' }, jetons === undefined ? {} : { jetons });
        const CAS = [
            ['tout compte, sans réglage de jetons', som(), CUM],
            ['tout compte, jetons refusés', som(J.refuses), CUM],
            ['tout compte, refus de l\'assistant (`activer: false`)', som(J.assistantRefuse), CUM],
            ['tout compte, jetons de délai seuls', som(J.delaiSeul), CUM],
            ['tout compte, un jeton de reprise', som(J.uneReprise), HYB('reprise')],
            ['reprise ciblée seule', som(J.cibleeSeule), HYB('reprise')],
            ['reprise ciblée active à nombre nul', som(J.cibleeANombreNul), CUM],
            ['jetons désactivés avec un nombre non nul', som(J.eteintsAvecNombre), CUM],
            ['bloc plat actif (formulaire) : il offre des reprises', som(J.platActif), HYB('reprise')],
            ['clés retirées seules (remplacement, plafonnement, portfolio)', Object.assign(som(), { configuration: {
                reprises: { type: 'remplacement' }, reglesSpeciales: [{ type: 'plafonnement' }], portfolio: { utiliser: true, nbArtefacts: 7 },
                particularites: { doubleVerrou: true } } }), CUM],
            ['le verrou sur une évaluation', Object.assign(som(J.refuses), { configuration: { reglesSpeciales: [{ type: 'double_verrou', actif: true }] } }), CUM],
            // Amendement du 28 nov., 8 h 40 : ni l'un ni l'autre ne révise une note.
            ['des productions écartées pour tout le groupe (`productionsExclues`)', Object.assign(som(J.refuses), { configuration: { productionsExclues: ['P2', 'P5'] } }), CUM],
            // ↻ 9 h 05 (décision de Grégoire, 8 h 59) : un travail formatif est une production à pondération 0.
            ['une production à pondération 0 (un travail formatif)', Object.assign(som(J.refuses), { configuration: { evaluations: [
                { id: 1, nom: 'Exercice', type: 'travail', ponderation: 0 }, { id: 2, nom: 'Examen', type: 'examen', ponderation: 100 }] } }), CUM]
        ];
        for (const [nom, pratique, attendu] of CAS) {
            it(nom, () => { expect(famille(pratique)).toMatchObject(Object.assign({ type: 'sommative', code: attendu === CUM ? 'SOM' : 'STD' }, attendu)); });
        }
    });

    describe('type standards (cumule, et peut sélectionner)', () => {
        const CAS = [
            ['« Toutes », sans réglage de jetons', std(TOUT), CUM],
            ['« Toutes », jetons refusés', Object.assign(std(TOUT), { jetons: J.refuses }), CUM],
            ['« Toutes », jetons de délai seuls', Object.assign(std(TOUT), { jetons: J.delaiSeul }), CUM],
            ['« Toutes », un jeton de reprise', Object.assign(std(TOUT), { jetons: J.uneReprise }), HYB('reprise')],
            ['« Toutes », reprise ciblée seule', Object.assign(std(TOUT), { jetons: J.cibleeSeule }), HYB('reprise')],
            ['« Toutes », jetons désactivés avec un nombre non nul', Object.assign(std(TOUT), { jetons: J.eteintsAvecNombre }), CUM],
            // Amendement du 28 nov., 8 h 40 : des productions écartées pour tout le groupe ne font pas un bloc retenu.
            ['« Toutes », des productions écartées pour tout le groupe (`productionsExclues`)', std(TOUT, { productionsExclues: ['A3'] }), CUM],
            ['N meilleures', std({ methodeSelection: 'meilleurs', nombreARetenir: 7 }), HYB('retenu')],
            ['N plus récentes', std({ methodeSelection: 'recents', nombreARetenir: 5 }), HYB('retenu')],
            ['N plus récentes, ancien nom (`derniers`)', std({ methodeSelection: 'derniers', nombreARetenir: 5 }), HYB('retenu')],
            ['récentes parmi les meilleures', std({ methodeSelection: 'recents-meilleurs', nombreARetenir: 4 }), HYB('retenu')],
            ['deux blocs (`categories.actif`), même sur « Toutes »', std(TOUT, { categories: { actif: true } }), HYB('retenu')],
            ['deux blocs, ancienne valeur du menu (`hybride`)', std({ methodeSelection: 'hybride' }), HYB('retenu')],
            ['sans méthode : le défaut du moteur, « meilleurs »', std({ nombreARetenir: 3 }), HYB('retenu')],
            ['sans configuration du tout : même défaut', { type: 'standards' }, HYB('retenu')],
            ['N meilleures et un jeton de reprise', Object.assign(std({ methodeSelection: 'meilleurs' }), { jetons: J.uneReprise }), HYB('retenu-et-reprise')],
            ['les jetons de `configuration.jetons` (assistant) comptent aussi', std(TOUT, { jetons: { activer: true, delai: { nombre: 1 }, reprise: { nombre: 2 } } }), HYB('reprise')]
        ];
        for (const [nom, pratique, attendu] of CAS) {
            it(nom, () => { expect(famille(pratique)).toMatchObject(Object.assign({ type: 'standards' }, attendu)); });
        }
    });

    it('des productions à pondération 0 dans le cours (des travaux formatifs) ne changent rien : la règle ne reçoit que la pratique, jamais les productions', () => {
        expect(REG.familleDeduiteDeLaPratique.length).toBe(1);
        const source = lire('js/pratiques/pratique-registre.js');
        const debut = source.indexOf('// LA FAMILLE SE DÉDUIT DES RÉGLAGES');
        const fin = source.indexOf('// ÉTAT DU REGISTRE');
        expect(debut).toBeGreaterThan(-1);
        expect(fin).toBeGreaterThan(debut);
        const regle = source.slice(debut, fin).split('\n').filter(l => !/^\s*(\/\/|\*|\/\*)/.test(l)).join('\n');
        // Elle ne lit ni les productions du cours, ni leurs évaluations, ni les productions écartées, ni un type formatif.
        expect(regle).not.toMatch(/cle\('productions'\)|productionsExclues|formati|ponderation|evaluationsSauvegardees|\.categorie\b/i);
        expect(regle.split('db.getSync').length - 1).toBe(0);   // la bibliothèque se lit par `trouverPratiqueEnBibliotheque`, hors de la règle
    });

    it('les conséquences voulues du mandat, en deux lignes', () => {
        expect(famille({ type: 'sommative', jetons: J.uneReprise }).sigle).toBe('HYB');   // une sommative qui offre des reprises
        expect(famille(std(TOUT)).sigle).toBe('CUM');                                      // une standards « Toutes », sans jeton de reprise
    });

    it('le type se lit dans les quatre formes rangées ; un type inconnu ne rend rien', () => {
        for (const p of [{ pratiques: ['SOM'] }, { type: 'sommative' }, { configuration: { type: 'sommative' } }, { config: { type: 'sommative' } }]) {
            expect(famille(p), JSON.stringify(p)).toMatchObject({ type: 'sommative', sigle: 'CUM' });
        }
        expect(famille({ type: 'pan-standards' })).toMatchObject({ type: 'standards', sigle: 'HYB' });   // un id ancien, normalisé
        expect(famille({ type: 'configurable' })).toBeNull();
        expect(famille({})).toBeNull();
        expect(famille(null)).toBeNull();
    });

    it('le survol dit le motif, mot pour mot (textes 8 et 9)', () => {
        expect(famille({ type: 'sommative' }).survol).toBe('Cumulative : toutes les évaluations sommatives comptent, sans reprise.');
        expect(famille({ type: 'standards' }).survol).toBe('Hybride : cette pratique retient certaines productions.');
        expect(famille({ type: 'sommative', jetons: J.uneReprise }).survol).toBe('Hybride : cette pratique offre des jetons de reprise.');
        expect(famille(Object.assign(std({}), { jetons: J.uneReprise })).survol)
            .toBe('Hybride : cette pratique retient certaines productions et offre des jetons de reprise.');
    });

    it('le badge porte le sigle, la classe de la famille déduite et le survol', () => {
        expect(REG.genererBadgeFamilleDeduiteHTML(famille({ type: 'sommative', jetons: J.uneReprise })))
            .toBe('<span class="badge-type-pratique badge-type-std" title="Hybride : cette pratique offre des jetons de reprise.">HYB</span>');
        expect(REG.genererBadgeFamilleDeduiteHTML(famille(std(TOUT))))
            .toBe('<span class="badge-type-pratique badge-type-som" title="Cumulative : toutes les évaluations sommatives comptent, sans reprise.">CUM</span>');
        expect(REG.genererBadgeFamilleDeduiteHTML(null)).toBe('');
    });

    it('la règle lit les jetons DÉCLARÉS, par le lecteur de `jetonsDeclares` : une seule lecture, pas de défaut du moteur', () => {
        const jetons = lire('js/evaluation-jetons.js');
        expect(jetons).toMatch(/function configJetonsDeclareeDeLaPratique\(pratique\) \{\s*\n\s*return _normaliserConfigJetons\(_jetonsBrutsDeLaPratique\(pratique\)\);/);
        // `obtenirConfigJetonsPratique` (que lit `jetonsDeclares`) et la résolution du formulaire passent par elle.
        expect(jetons.split('configJetonsDeclareeDeLaPratique(pratique)').length - 1).toBe(3);
        expect(jetons.split('_normaliserConfigJetons(_jetonsBrutsDeLaPratique(').length - 1).toBe(1);
        // Le défaut du moteur (2 reprises) existe toujours pour le geste de l'enseignant·e : il ne rend pas hybride.
        expect(REG.configJetonsResolueDeLaPratique({ type: 'sommative' }).reprise.nombre).toBe(2);
        expect(REG.configJetonsDeclareeDeLaPratique({ type: 'sommative' })).toBeNull();
        expect(famille({ type: 'sommative' }).sigle).toBe('CUM');
    });
});

/* ================================================================ B. LES PAN, ET LE CALCUL */
describe('B · les trois PAN ne changent pas ; le calcul suit le type', () => {
    it('STD, SPE, DEN : leur sigle, sans motif, quels que soient leurs jetons', () => {
        for (const jetons of [undefined, J.refuses, J.uneReprise]) {
            const avec = (p) => Object.assign(p, jetons ? { jetons } : {});
            expect(famille(avec({ type: 'cibles' }))).toMatchObject({ sigle: 'STD', famille: 'PAN', nom: 'PAN par standards', cle: 'cibles', motif: null, survol: null });
            expect(famille(avec({ type: 'specifications' }))).toMatchObject({ sigle: 'SPE', famille: 'PAN', nom: 'PAN par spécifications', motif: null });
            expect(famille(avec({ type: 'denotation' }))).toMatchObject({ sigle: 'DEN', famille: 'PAN', nom: 'Dénotation', motif: null });
        }
        expect(famille({ pratiques: ['CIB'] }).sigle).toBe('STD');   // « CIB » ne s'affiche nulle part
    });
    it('le code interne et la méthode de calcul se lisent toujours au TYPE, jamais à la famille déduite', () => {
        const sommativeAReprises = { type: 'sommative', jetons: J.uneReprise };
        const standardsToutes = std(TOUT);
        expect(famille(sommativeAReprises).type).toBe('sommative');
        expect(famille(standardsToutes).type).toBe('standards');
        expect(REG.obtenirCodePratique('sommative')).toBe('SOM');
        expect(REG.obtenirCodePratique('standards')).toBe('STD');
        expect(REG.methodeDeCalculDeLaPratique(sommativeAReprises)).toBe('moyenne_ponderee');
        expect(REG.methodeDeCalculDeLaPratique(standardsToutes)).toBe('conversion_niveaux');
        // La fonction ne mute rien.
        const gelee = Object.freeze({ type: 'standards', configuration: Object.freeze({ portfolio: Object.freeze({ methodeSelection: 'tous' }) }) });
        expect(() => famille(gelee)).not.toThrow();
    });
    it('aucun moteur de note ne lit la famille déduite', () => {
        for (const f of ['js/pratiques/pratique-configurable.js', 'js/pratiques/pratique-sommative.js', 'js/pratiques/pratique-pan-standards.js',
            'js/pratiques/pratique-pan-specifications.js', 'js/pratiques/note-cibles.js', 'js/portfolio.js', 'js/profil-etudiant-actions.js',
            'js/synthese-retroaction-data.js', 'js/synthese-retroaction-rendu.js', 'js/export-pdf.js', 'js/evaluation-retroaction.js']) {
            expect(lire(f), f).not.toMatch(/familleDeduite/);
        }
    });
});

/* ================================================================ C. LES LECTEURS */
function gestion() {
    const win = {};
    const db = { getSync: (k, d) => (d !== undefined ? d : null), setSync() {} };
    chargerAvecInterne('js/pratiques-gestion.js', {
        db, cle: (k) => k, echapperHtml, BibliothequeUI: { formaterInspireDe: () => '' },
        document: { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], addEventListener() {} }
    }, win, ['familleDeLaPratique', 'lignePratiqueBibliotheque', 'lignePratiqueFournie', 'obtenirDescriptionCourtePratique', 'apercuPratiqueBibliotheque', 'genererBadgeTypePratique']);
    return win.__audit['pratiques-gestion.js'];
}

describe('C · les lecteurs passent par la famille déduite', () => {
    const G = gestion();
    const sommativeAReprises = { type: 'sommative', pratiques: ['SOM'], jetons: J.uneReprise };
    const standardsToutes = Object.assign(std(TOUT), { pratiques: ['STD'] });

    it('la fiche : le badge et sa bulle', () => {
        expect(G.genererBadgeTypePratique(sommativeAReprises)).toBe('<span class="badge-type-pratique badge-type-std" title="Hybride : cette pratique offre des jetons de reprise.">HYB</span>');
        expect(G.genererBadgeTypePratique(standardsToutes)).toBe('<span class="badge-type-pratique badge-type-som" title="Cumulative : toutes les évaluations sommatives comptent, sans reprise.">CUM</span>');
        expect(G.genererBadgeTypePratique({ type: 'specifications' })).toContain('title="PAN – Spécifications — ');
        expect(G.genererBadgeTypePratique({ type: 'specifications' })).toMatch(/>SPE<\/span>$/);
        expect(G.genererBadgeTypePratique({ type: 'inconnu' })).toBe('');
    });
    it('la fiche redit le badge après chaque enregistrement (un réglage changé peut changer la famille)', () => {
        const src = lire('js/pratiques-gestion.js');
        expect(src).toMatch(/await modifierEtAnnoncer\(cle\('pratiquesConfigurables'\), appliquerFormulaireDansCollection[^\n]*\n\s*rendreChainePratique\(\);[^\n]*\n\s*rafraichirBadgeFamilleMat\(\);/);
    });
    it('la bibliothèque : la ligne, la ligne d\'un modèle fourni, la description courte, l\'aperçu (résumés 6 et 7)', () => {
        expect(G.lignePratiqueBibliotheque(sommativeAReprises, '')).toBe('Hybride');
        expect(G.lignePratiqueBibliotheque(standardsToutes, '')).toBe('Cumulative');
        expect(G.lignePratiqueFournie({ type: 'sommative', jetons: J.refuses })).toBe('Cumulative · fourni avec l\'application');
        expect(G.obtenirDescriptionCourtePratique(sommativeAReprises)).toBe('Hybride - Un cumul où une note peut être révisée');
        expect(G.obtenirDescriptionCourtePratique(standardsToutes)).toBe('Cumulative (Traditional Grading) - Cumul pondéré de toutes les évaluations, sans reprise');
        expect(JSON.stringify(G.apercuPratiqueBibliotheque(standardsToutes, { echelles: [], grilles: [] }))).toContain('Cumulative - Cumul pondéré de toutes les évaluations, sans reprise');
        expect(G.familleDeLaPratique({ type: 'cibles' }).nom).toBe('Par standards');
    });
    it('l\'assistant : le récapitulatif montre la famille déduite des réponses (badge, nom, description, couleur)', () => {
        const BASE = { nom: 'Pratique du banc', typePratique: 'standards', calcNoteFinale: 'niveaux', approcheEvaluation: 'par-artefacts', nbArtefactsRetenus: 5, echelleId: 'E0' };
        const magasin = magasinBanc();
        const win = monterAssistant(magasin);
        const recap = (reponses, modeEdition) => recapDuCas(win, { modeEdition: !!modeEdition, reponses });
        const toutes = recap(Object.assign({}, BASE, { modeSelectionPortfolio: 'tous' }));
        expect(toutes).toContain('wizard-v2-recap-diagnostic--som');
        expect(toutes).toContain('<span class="wizard-v2-recap-badge">CUM</span>');
        expect(toutes).toContain('Ta note finale est le cumul pondéré de toutes tes évaluations, sans reprise.');
        const meilleures = recap(Object.assign({}, BASE, { modeSelectionPortfolio: 'n_meilleurs' }));
        expect(meilleures).toContain('wizard-v2-recap-diagnostic--sel');
        expect(meilleures).toContain('<span class="wizard-v2-recap-badge">HYB</span>');
        expect(meilleures).toContain('Ta note se construit par cumul, mais une note peut être révisée');
        expect(recap(Object.assign({}, BASE, { modeSelectionPortfolio: 'hybride' }))).toContain('<span class="wizard-v2-recap-badge">HYB</span>');
        // Une sommative en création : jetons refusés, CUM. En modification, elle garde les jetons qu'elle porte.
        const somme = { nom: 'S', typePratique: 'sommative', calcNoteFinale: 'moyenne', reglesSommatives: [] };
        expect(recap(somme)).toContain('<span class="wizard-v2-recap-badge">CUM</span>');
        magasin.pratiquesConfigurables = [{ id: 'pratique_banc', type: 'sommative', jetons: J.uneReprise }];
        expect(recap(somme, true)).toContain('<span class="wizard-v2-recap-badge">HYB</span>');
        magasin.pratiquesConfigurables = [{ id: 'pratique_banc', type: 'sommative', jetons: J.delaiSeul }];
        expect(recap(somme, true)).toContain('<span class="wizard-v2-recap-badge">CUM</span>');
        magasin.pratiquesConfigurables = [];
        // « Créer » écrit la configuration que le récapitulatif a lue : une seule lecture des réponses.
        const src = lire('js/wizard-pratique-v2.js');
        expect(src.split('_configurationStandardsDesReponses(r)').length - 1).toBe(3);   // sa déclaration, « Créer », l'aperçu
        expect(src).toContain("pratique.configuration = _configurationStandardsDesReponses(r);");
    });
    it('l\'assistant : « Partir d\'un modèle » montre la famille déduite du modèle', () => {
        const win = monterAssistant(magasinBanc());
        expect(win.libelleFamilleModele({ type: 'sommative', jetons: J.refuses })).toBe('CUM');
        expect(win.libelleFamilleModele({ type: 'sommative', jetons: J.uneReprise })).toBe('HYB');
        expect(win.libelleFamilleModele(std(TOUT))).toBe('CUM');
        expect(win.libelleFamilleModele(std({ methodeSelection: 'meilleurs' }))).toBe('HYB');
        expect(win.libelleFamilleModele({ type: 'cibles' })).toBe('STD');
        expect(win.libelleFamilleModele({ type: 'inconnu' })).toBe('');
    });
    it('les lecteurs par identifiant : la bibliothèque du trimestre, sinon le type ; la pratique active', () => {
        const magasin = { pratiquesConfigurables: [
            { id: 'p-som-reprises', nom: 'A', type: 'sommative', jetons: J.uneReprise },
            { id: 'p-std-toutes', nom: 'B', configuration: { type: 'standards', portfolio: TOUT } }
        ] };
        const R = monterRegistre(magasin);
        expect(R.familleDeduiteParId('p-som-reprises')).toMatchObject({ sigle: 'HYB', motif: 'reprise' });
        expect(R.familleDeduiteParId('p-std-toutes')).toMatchObject({ sigle: 'CUM', motif: 'tout-compte' });
        expect(R.familleDeduiteParId('sommative')).toMatchObject({ sigle: 'CUM' });       // une pratique codée, sans entrée
        expect(R.familleDeduiteParId('standards')).toMatchObject({ sigle: 'HYB', motif: 'retenu' });
        expect(R.familleDeduiteParId('specifications')).toMatchObject({ sigle: 'SPE' });
        expect(R.familleDeduiteParId('')).toBeNull();
        R.lirePointeurPratiqueGroupeCours = () => 'p-som-reprises';
        expect(R.familleDeduiteDeLaPratiqueActive()).toMatchObject({ nom: 'Hybride', sigle: 'HYB' });
        R.lirePointeurPratiqueGroupeCours = () => null;
        expect(R.familleDeduiteDeLaPratiqueActive()).toBeNull();
    });
    it('les autres écrans appellent la fonction : ressources, Comparateur, tableau de notation, profil, aide des indices, export', () => {
        expect(lire('js/donnees-v2.js')).toMatch(/const badgeType = obtenirBadgeTypePratique\(p\);/);
        expect(lire('js/donnees-v2.js')).not.toMatch(/obtenirBadgeTypePratique\(p\.type\)/);
        const comp = lire('js/comparateur-pratiques.js');
        expect(comp).toMatch(/function _famille\(id\) \{\s*\n\s*return \(typeof familleDeduiteParId === 'function'\) \? familleDeduiteParId\(id\) : null;/);
        expect(comp).toMatch(/var f = _famille\(id\);   \/\/ une pratique sans nom : le nom de sa famille déduite/);
        expect(lire('js/tableau-notation.js')).toContain('genererBadgeFamilleDeduiteHTML(familleDeduiteDeLaPratiqueActive())');
        expect(lire('js/profil-etudiant-sections-affichage.js')).toMatch(/function _nomPratiqueActivePanneau\(\) \{[^}]*familleDeduiteDeLaPratiqueActive\(\) : null;\s*\n\s*return \(famille && famille\.nom\) \|\| '—';/);
        expect(lire('js/etudiants.js')).toMatch(/function _nomFamillePratiqueActive\(isPAN\) \{[^}]*familleDeduiteDeLaPratiqueActive\(\)/);
        expect(lire('js/export-resultats-finaux.js')).toContain('pratiqueCode: _siglePratiqueExportee(pratiqueId),');
    });
});

/* ================================================================ C bis. LA PHRASE DE LA FICHE (28 nov. 2026, 10 h 10) */
describe('C bis · la fiche dit quand les jetons de reprise rendent la pratique hybride', () => {
    const condition = (() => {
        const win = {};
        const db = { getSync: (k, d) => (d !== undefined ? d : null), setSync() {} };
        chargerAvecInterne('js/pratiques-gestion.js', { db, cle: (k) => k, echapperHtml, BibliothequeUI: { formaterInspireDe: () => '' },
            document: { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], addEventListener() {} } }, win, ['jetonsRendentHybrideMat']);
        return win.__audit['pratiques-gestion.js'].jetonsRendentHybrideMat;
    })();
    const dit = (pratique) => condition(famille(pratique));
    const plat = (actif) => ({ actif, nombre: 2, delaiDuree: 2, repriseOriginale: 'archiver', cibleeActif: false });

    it('elle paraît pour des jetons de reprise réellement offerts, dans les deux types qui cumulent', () => {
        expect(dit({ type: 'sommative', jetons: plat(true) })).toBe(true);            // la case de la fiche, cochée
        expect(dit({ type: 'sommative', jetons: J.uneReprise })).toBe(true);
        expect(dit({ type: 'sommative', jetons: J.cibleeSeule })).toBe(true);         // la reprise ciblée compte
        expect(dit(Object.assign(std(TOUT), { jetons: plat(true) }))).toBe(true);
        // Déjà hybride par un bloc retenu : la phrase reste, elle est vraie.
        expect(dit(Object.assign(std({ methodeSelection: 'meilleurs' }), { jetons: plat(true) }))).toBe(true);
    });
    it('elle ne paraît pas sans reprise offerte : aucun réglage, jetons éteints, délais seuls, hybride par le seul bloc retenu', () => {
        expect(dit({ type: 'sommative' })).toBe(false);
        expect(dit({ type: 'sommative', jetons: plat(false) })).toBe(false);
        expect(dit({ type: 'sommative', jetons: J.delaiSeul })).toBe(false);
        expect(dit({ type: 'sommative', jetons: J.eteintsAvecNombre })).toBe(false);
        expect(dit(std({ methodeSelection: 'meilleurs' }))).toBe(false);
        expect(condition(null)).toBe(false);
    });
    it('elle ne paraît jamais dans une PAN, même avec des reprises : la famille n\'y change pas', () => {
        for (const type of ['cibles', 'specifications', 'denotation']) expect(dit({ type, jetons: J.uneReprise }), type).toBe(false);
    });
    it('aucune seconde règle : la condition ne lit que le motif de la famille déduite ; la fiche la rafraîchit à l\'ouverture, à la case et après chaque enregistrement', () => {
        const src = lire('js/pratiques-gestion.js');
        expect(src).toMatch(/function jetonsRendentHybrideMat\(famille\) \{\s*\n\s*return !!\(famille && famille\.hybrideParReprises\);/);
        expect(famille({ type: 'sommative', jetons: J.uneReprise }).hybrideParReprises).toBe(true);
        expect(famille({ type: 'specifications', jetons: J.uneReprise }).hybrideParReprises).toBe(false);
        expect(src).toMatch(/familleDeduiteDeLaPratique\(pratique\) : null;\s*\n\s*phrase\.classList\.toggle\('u-hide', !jetonsRendentHybrideMat\(famille\)\);/);
        expect(src.split('rafraichirPhraseJetonsHybrideMat();').length - 1).toBe(3);   // l'ouverture, la case, après l'écriture (avec le badge)
        // Le texte est posé dans index.html, tel quel : aucun `innerHTML`, aucun handler, des classes du design system.
        const html = lire('index.html');
        expect(html).toContain('<p id="mat-jetons-famille-hybride" class="u-hide text-muted u-mb-15 u-texte-09">Avec des jetons de reprise, ta pratique est hybride : une note peut être révisée.</p>');
        expect(html.indexOf('id="mat-jetons-famille-hybride"')).toBeGreaterThan(html.indexOf('id="mat-jetons-actif"'));
        expect(html.indexOf('id="mat-jetons-famille-hybride"')).toBeLessThan(html.indexOf('id="mat-contenu-jetons"'));
    });
});

/* ================================================================ D. AUCUN SECOND LECTEUR PAR TYPE */
describe('D · aucun second lecteur de la famille par type', () => {
    const fichiers = [...new Set(lire('index.html').match(/js\/[\w./-]+\.js/g))];
    const appels = (motif) => {
        const vus = {};
        for (const f of fichiers) {
            let source;
            try { source = lire(f); } catch (e) { continue; }
            const n = source.split('\n').filter(l => !/^\s*(\/\/|\*|\/\*)/.test(l) && motif.test(l)).length;
            if (n) vus[f] = n;
        }
        return vus;
    };
    const REGISTRE = 'js/pratiques/pratique-registre.js';

    it('la règle (les motifs, les survols) n\'est écrite qu\'au registre', () => {
        expect(Object.keys(appels(/'tout-compte'|'retenu-et-reprise'|SURVOLS_FAMILLE_DEDUITE|TYPES_QUI_CUMULENT/))).toEqual([REGISTRE]);
        expect(Object.keys(appels(/function familleDeduite\w*\(/))).toEqual([REGISTRE]);
    });
    it('les accesseurs d\'affichage par type ne s\'appellent plus hors de leurs places mesurées', () => {
        // `sigleDuCode` : le registre, et `genererBadgePratique` de main.js (aucun appelant dans l'application, mesuré le 28 nov.).
        expect(Object.keys(appels(/\bsigleDuCode\(/)).sort()).toEqual(['js/main.js', REGISTRE].sort());
        expect(Object.keys(appels(/\bobtenirSiglePratique\(/))).toEqual([REGISTRE]);
        // `obtenirLabelFamillePratique`, `obtenirCouleurPratique` : le registre, et les méthodes `obtenirLabelFamille` /
        // `obtenirCouleur` des quatre classes de pratique (aucun appelant dans l'application, mesuré le 28 nov.).
        const CLASSES = ['js/pratiques/pratique-configurable.js', 'js/pratiques/pratique-pan-specifications.js',
            'js/pratiques/pratique-pan-standards.js', 'js/pratiques/pratique-sommative.js'];
        expect(Object.keys(appels(/\bobtenirLabelFamillePratique\(/)).sort()).toEqual(CLASSES.concat([REGISTRE]).sort());
        expect(Object.keys(appels(/\bobtenirCouleurPratique\(/)).sort()).toEqual(CLASSES.concat([REGISTRE]).sort());
        expect(appels(/\.obtenirLabelFamille\(\)|\.obtenirCouleur\(\)/)).toEqual({});
        // Le lecteur de nom par type du lot précédent est retiré : la carte du profil lit la famille déduite.
        expect(appels(/obtenirNomTypePratique/)).toEqual({});
        // Le badge par type du registre ne sert plus qu'à une PAN nommée en dur (« Par standards », au tableau des cibles).
        const badges = appels(/\bgenererBadgePratiqueHTML\(/);
        expect(Object.keys(badges).sort()).toEqual([REGISTRE, 'js/tableau-cibles.js'].sort());
        expect(lire('js/tableau-cibles.js')).toContain("genererBadgePratiqueHTML('cibles')");
    });
    it('les tables de mots des familles se lisent par la clé de la famille déduite, jamais par le type', () => {
        const lectures = (f, table) => lire(f).split('\n').filter(l => !/^\s*(\/\/|\*)/.test(l) && l.includes(table + '[')).map(l => l.trim());
        const gestionLit = lectures('js/pratiques-gestion.js', 'FAMILLES_TAXONOMIQUES');
        expect(gestionLit).toEqual(['return famille ? (FAMILLES_TAXONOMIQUES[famille.cle] || null) : null;']);
        const assistantLit = lectures('js/wizard-pratique-v2.js', 'TYPE_BADGES');
        expect(assistantLit).toHaveLength(2);
        for (const l of assistantLit) expect(l).toMatch(/TYPE_BADGES\[famille(Deduite)?\.cle\]/);
    });
    it('aucun écran ne compare le sigle ou le nom de la famille déduite pour router, filtrer ou calculer', () => {
        expect(appels(/famille(Deduite)?\.(sigle|nom|famille|motif|cle)\s*(===|!==)/)).toEqual({});
        expect(appels(/===\s*'(CUM|HYB)'|'(CUM|HYB)'\s*===/)).toEqual({});
    });
});

/* ================================================================ E. LES QUATORZE TEXTES */
describe('E · les quatorze textes de Grégoire, chacun à sa source', () => {
    const TEXTES = lire('plans de travail/TEXTES-2026-11-28-familles-par-reglages.md');
    const sections = TEXTES.split(/^## /m).slice(1).map((s) => {
        const [repere, fichier] = s.split('\n')[0].split(' · ');
        return { repere, fichier, textes: s.split('\n').filter((l) => l.startsWith('> ')).map((l) => l.slice(2).trim()) };
    });
    /** La source, apostrophes désescapées (les textes vivent dans des chaînes JS entre apostrophes). */
    const source = (f) => lire(f).replace(/\\'/g, '\'');

    it('le fichier validé porte R1 à R14 (seize textes : R9 en a trois), plus A1, C1, V1 et V3 pour les bancs du renommage', () => {
        expect(sections.map(s => s.repere)).toEqual(['R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7', 'R8', 'R9', 'R10', 'R11', 'R12', 'R13', 'R14', 'C1', 'A1', 'V1', 'V3', 'V2', 'V5', 'V6', 'V7', 'F1']);
        expect(sections.filter(s => /^R/.test(s.repere)).flatMap(s => s.textes)).toHaveLength(16);
    });
    it('chaque texte se lit à sa source, mot pour mot', () => {
        for (const s of sections) for (const t of s.textes) expect(source(s.fichier), s.repere + ' : ' + t).toContain(t);
    });
    it('chaque texte est à SA place : la bonne entrée, la bonne ligne', () => {
        const t = (repere) => sections.find(s => s.repere === repere).textes;
        const glossaire = source('js/accompagnement-contenu-terme.js');
        expect(glossaire).toMatch(new RegExp(`terme: 'CUM — Cumulative',[^}]*definition: '${t('R1')[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}',`));
        expect(glossaire).toMatch(new RegExp(`terme: 'HYB — Hybride',[^}]*definition: '${t('R2')[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}',`));
        // R3 : une phrase AJOUTÉE ; le reste de la définition de PAN n'a pas bougé.
        expect(glossaire).toContain('definition: \'Terme qui désigne les pratiques Standards (STD) et Spécifications (SPE). La Dénotation (DEN) est une PRÉN ; '
            + 'l\'application lui donne aussi le badge « PAN » par commodité. Dans le contexte PAN, les productions sont d\'abord des occasions '
            + 'd\'apprentissage et de mise en pratique, pas des épreuves évaluatives. ' + t('R3')[0] + '\',');
        const gestionSrc = source('js/pratiques-gestion.js');
        expect(gestionSrc).toContain(`'sommative': { nom: 'Cumulative', anglais: 'Traditional Grading', resume: '${t('R6')[0]}' }`);
        expect(gestionSrc).toContain(`'standards': { nom: 'Hybride', resume: '${t('R7')[0]}' }`);
        const registre = source('js/pratiques/pratique-registre.js');
        expect(registre).toContain(`'tout-compte': '${t('R8')[0]}'`);
        expect(registre).toContain(`'retenu': '${t('R9')[0]}'`);
        expect(registre).toContain(`'reprise': '${t('R9')[1]}'`);
        expect(registre).toContain(`'retenu-et-reprise': '${t('R9')[2]}'`);
        const assistant = source('js/wizard-pratique-v2.js');
        expect(assistant).toContain(`'sommative': { code: 'CUM', classe: 'som', label: 'Cumulative', description: '${t('R10')[0]}' }`);
        expect(assistant).toContain(`'standards': { code: 'HYB', classe: 'sel', label: 'Hybride', description: '${t('R11')[0]}' }`);
        // R12 : le début seulement ; la suite de la bulle (STD, SPE, DEN) est celle d'avant.
        expect(source('js/accompagnement-contenu-hover.js')).toContain(`'cn-pratique-type':\n        '${t('R12')[0]} STD = PAN par standards (un niveau par cible d'apprentissage), `
            + 'SPE = PAN basée sur des spécifications (contrat), DEN = dénotation (pratiques réduisant ou éliminant la notation).');
        const html = lire('index.html');
        expect(html.indexOf(t('R4')[0])).toBeLessThan(html.indexOf(t('R5')[0]));
        // Les deux lignes vivent dans la carte « Note » des pratiques, avant celle de STD.
        const carte = html.indexOf('id="note-pratiques"');
        expect(carte).toBeGreaterThan(-1);
        expect(html.indexOf(t('R4')[0])).toBeGreaterThan(carte);
        expect(html.indexOf(t('R5')[0])).toBeLessThan(html.indexOf('<strong>STD</strong> (Par standards) : '));
    });
    it('aucun des textes remplacés ne reste à l\'écran', () => {
        const tout = ['index.html', 'js/accompagnement-contenu-terme.js', 'js/accompagnement-contenu-hover.js', 'js/accompagnement-contenu-popup.js',
            'js/pratiques-gestion.js', 'js/wizard-pratique-v2.js'].map(source).join('\n');
        for (const ancien of ['utilise une moyenne pondérée habituelle.', 'Chaque production contribue à la note finale selon sa pondération.',
            'calcule une moyenne pondérée habituelle.', 'resume: \'Cumul pondéré des évaluations\'', 'SOM: \'Cumulative — note finale',
            'Ta note finale est le cumul pondéré de tes évaluations.', 'HYB = hybride (des niveaux']) {
            expect(tout, ancien).not.toContain(ancien);
        }
    });
});

/* ================================================================ F. LES PRATIQUES FOURNIES ET LA DÉMO */
describe('F · les pratiques fournies avec l\'application et celles de la démo : avant, après', () => {
    const avant = (p) => REG.obtenirSiglePratique((p.configuration && p.configuration.type) || p.type);
    const apres = (p) => famille(p).sigle;
    it('les modèles fournis : aucun ne change de famille (tous refusent les jetons)', () => {
        const modeles = chargerScript('js/pratiques-bibliotheque.js').MODELES_PRATIQUES_PREDEFINIS;
        const table = Object.values(modeles).map(m => [m.id, avant(m), apres(m), famille(m).motif]);
        expect(table).toEqual([
            ['DEN-base', 'DEN', 'DEN', null],
            ['SPE-simple', 'SPE', 'SPE', null],
            ['SOM-litterature', 'CUM', 'CUM', 'tout-compte'],
            ['STD-n-meilleurs', 'HYB', 'HYB', 'retenu'],
            ['STD-n-recents', 'HYB', 'HYB', 'retenu']
        ]);
        for (const m of Object.values(modeles)) expect(m.jetons, m.id).toEqual({ actif: false });
    });
    it('la démo : aucune ne change de famille ; la pratique « Hybride (démo) » retient 6 meilleures, sans réglage de jetons', () => {
        const win = {};
        new Function('window', lire('js/pack-demo-10.js'))(win);
        const pack = win.PACK_DEMARRAGE;
        const pratiques = [];
        (function chercher(o) {
            if (!o || typeof o !== 'object') return;
            for (const k of Object.keys(o)) {
                if (k === 'pratiquesConfigurables' && Array.isArray(o[k])) pratiques.push(...o[k]);
                else if (!Array.isArray(o[k])) chercher(o[k]);
            }
        })(pack);
        const ligne = (p) => [p.id, avant(p), apres(p), famille(p).motif, REG.configJetonsDeclareeDeLaPratique(p) === null];
        expect(pratiques.map(ligne)).toEqual([
            ['demo-std-litt', 'HYB', 'HYB', 'retenu', true],
            ['demo-spe-litt', 'SPE', 'SPE', null, true]
        ]);
        const cibles = pack.groupeParStandards.pratique || (pack.groupeParStandards.pratiquesConfigurables || [])[0]
            || Object.values(pack.groupeParStandards).find(v => v && v.id === 'demo-cib-litt');
        expect(ligne(cibles).slice(0, 4)).toEqual(['demo-cib-litt', 'STD', 'STD', null]);
        // Compte demandé le 28 nov. (8 h 00) : les pratiques fournies ou de la démo qui s'affichent CUM alors que le moteur
        // laisserait appliquer un jeton de reprise par défaut (sans réglage de jetons) : aucune.
        const modeles = Object.values(chargerScript('js/pratiques-bibliotheque.js').MODELES_PRATIQUES_PREDEFINIS);
        const cumSansReglage = modeles.concat(pratiques, [cibles])
            .filter(p => apres(p) === 'CUM' && REG.configJetonsDeclareeDeLaPratique(p) === null);
        expect(cumSansReglage.map(p => p.id)).toEqual([]);
    });
});

/* ================================================================ JOURNAL DES BREAK-TESTS (28 nov. 2026)
 *
 * Chaque mutation posée dans `js/`, ce fichier lancé seul, le rouge relevé, la mutation retirée (`git diff` vide sur le
 * fichier muté). Le détail et les comptes sont au rapport du lot, § break-tests.
 */
