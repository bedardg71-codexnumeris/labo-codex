import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE F4-1 (audit du code en dur, 21 sept. 2026) — LE BILAN DE L'ÉLÈVE
// NE PARLE PLUS D'« ARTEFACT » NI DU « NIVEAU É ».
//
// Quand tous les critères sont maîtrisés deux fois de suite, deux sites jumeaux
// écrivaient « depuis plus d'un artefact » (le mot du cours de Grégoire) et
// « vers le niveau É (transfert à d'autres contextes) » — en dur à l'écran,
// dérivé du sommet de l'échelle dans le PDF. Texte validé par Grégoire le
// 21 sept. : une seule phrase, la même aux deux endroits, sans niveau nommé.
//
// ⚠ LES DEUX SITES SONT JOUÉS, pas lus : le vrai bilan d'écran
// (`basculerVueRetroaction('bilan')`) et la vraie synthèse (`construireFeedback`
// puis `rendreSyntheseHTML`), sous DEUX échelles — IDME, et une échelle à quatre
// niveaux qui n'a pas de « É ».
//
// ⚠ `copierToutRetroaction` copie le bilan d'écran dans ce qui est remis à
// l'élève : les deux textes doivent être les MÊMES MOTS, à l'apostrophe près
// (typographique dans `evaluation-retroaction.js`, droite dans le module du PDF).

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');

const PHRASE = "Tous les critères sont maîtrisés depuis plus d'une production. Tu peux aider tes collègues : c'est une excellente façon de transférer tes compétences à d'autres contextes.";
const PHRASE_ECRAN = PHRASE.replace(/'/g, '’');

/* ------------------------------------------------------------------ harnais */

const IDME = {
    id: 'ECH_IDME', nom: 'IDME', seuilSuffisance: 'D', seuilMaitrise: 'M',
    niveaux: [
        { code: 'I', nom: 'Insuffisant',   min: 0,  max: 59,  valeurCalcul: 40 },
        { code: 'D', nom: 'Développement', min: 60, max: 74,  valeurCalcul: 67 },
        { code: 'M', nom: 'Maîtrisé',      min: 75, max: 84,  valeurCalcul: 80 },
        { code: 'E', nom: 'Étendu',        min: 85, max: 100, valeurCalcul: 95 }
    ]
};
// Quatre niveaux, aucune lettre d'IDME, aucun « É ».
const WXYZ = {
    id: 'ECH_WXYZ', nom: 'Cotation W-X-Y-Z', seuilSuffisance: 'X', seuilMaitrise: 'Y',
    niveaux: [
        { code: 'W', nom: 'Amorce',    min: 0,  max: 49,  valeurCalcul: 30 },
        { code: 'X', nom: 'En chemin', min: 50, max: 69,  valeurCalcul: 60 },
        { code: 'Y', nom: 'Consolidé', min: 70, max: 89,  valeurCalcul: 80 },
        { code: 'Z', nom: 'Transféré', min: 90, max: 100, valeurCalcul: 95 }
    ]
};
const MONTAGES = [
    { nom: 'IDME', echelle: IDME, acquis: 'M' },
    { nom: 'quatre niveaux sans É', echelle: WXYZ, acquis: 'Y' }
];

// La règle d'échappement de `config.js`, apostrophe comprise (#572) : c'est
// elle qui décide de ce que le PDF porte vraiment.
const echapper = (t) => (t == null ? '' : String(t)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;'));

// Ce que l'élève LIT : les balises parties, les entités rendues.
const texteLu = (html) => String(html)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#39;/g, "'").replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ');

function chargerCalculs(echelles) {
    return chargerScript('js/profil-etudiant-calculs.js', {
        db: {
            getSync: (k, d) => (String(k).indexOf('echellesTemplates') !== -1 ? echelles : (d !== undefined ? d : null)),
            get: async () => null, set: async () => {}, setSync: () => {}
        },
        cle: (k) => 'test_' + k,
        obtenirDonneesSelonMode: () => [],
        obtenirPreference: () => null, obtenirSeuil: () => null,
        obtenirPratiqueParId: () => null, obtenirTypePratiqueActive: () => 'standards'
    });
}

const GRILLE = {
    id: 'GR1',
    criteres: [
        { id: 'c1', nom: 'Démarche', description: '' },
        { id: 'c2', nom: 'Calculs', description: '' }
    ]
};

/** Le vrai bilan d'écran, rendu par le geste de l'onglet « Bilan ». */
function bilanEcran(echelle, codeCourant, codePrecedent) {
    const boite = () => ({ innerHTML: '', classList: { add: () => {}, remove: () => {}, toggle: () => {} } });
    const elements = {
        contenuRetroBilan: boite(), contenuRetroSpecifique: boite(),
        vueRetroGenerale: boite(), vueRetroSpecifique: boite(), vueRetroBilan: boite(),
        niveauProduction1: { textContent: codeCourant }
    };
    const calculs = chargerCalculs([echelle]);
    const historique = [{
        etudiantDA: 'DA1', grilleId: 'GR1', echelleId: echelle.id,
        dateEvaluation: '2026-04-01', productionNom: 'Labo 1', niveauFinal: codePrecedent,
        criteres: [{ critereNom: 'Démarche', niveauSelectionne: codePrecedent },
                   { critereNom: 'Calculs', niveauSelectionne: codePrecedent }]
    }];
    const fauxDocument = {
        addEventListener: () => {}, removeEventListener: () => {},
        querySelector: () => null, querySelectorAll: () => [],
        getElementById: (id) => elements[id] || null,
        createElement: () => ({ setAttribute: () => {}, appendChild: () => {}, style: {}, classList: { add: () => {}, remove: () => {} } }),
        body: { addEventListener: () => {}, appendChild: () => {}, setAttribute: () => {}, getAttribute: () => null, style: {}, classList: { add: () => {}, remove: () => {} } },
        documentElement: { addEventListener: () => {} }
    };
    const wEnonces = chargerScript('js/evaluation-enonces.js');
    // #940 — le bilan lit sa règle (ligne d'un critère, récurrences, historique) dans le vrai module.
    chargerScript('js/synthese-retroaction-data.js', {}, wEnonces);
    const w = chargerScript('js/evaluation-retroaction.js', {
        document: fauxDocument,
        db: {
            getSync: (k, d) => {
                if (String(k).indexOf('echellesTemplates') !== -1) return [echelle];
                if (String(k).indexOf('grillesTemplates') !== -1) return [GRILLE];
                return d !== undefined ? d : null;
            },
            get: async () => null, set: async () => {}, setSync: () => {}
        },
        cle: (k) => 'test_' + k,
        obtenirDonneesSelonMode: () => historique,
        echapperHtml: echapper,
        niveauxOrdonnesDeLEchelle: calculs.niveauxOrdonnesDeLEchelle,
        niveauDuCodeDansEchelle: calculs.niveauDuCodeDansEchelle,
        zoneDuNiveau: calculs.zoneDuNiveau,
        echellesComparables: calculs.echellesComparables,
        obtenirEchelleResolue: calculs.obtenirEchelleResolue
    }, wEnonces);
    w.evaluationEnCours = {
        etudiantDA: 'DA1', grilleId: 'GR1', echelleId: echelle.id,
        criteres: { c1: codeCourant, c2: codeCourant }
    };
    w.basculerVueRetroaction('bilan');
    return elements.contenuRetroBilan.innerHTML;
}

/** La vraie synthèse : données, puis HTML du PDF. */
function synthese(echelle, codeCourant, codePrecedent, extra) {
    const opts = extra || {};
    const calculs = chargerCalculs([echelle]);
    const critere = (nom, code) => ({ critereId: 'c_' + nom, critereNom: nom, niveauSelectionne: code, ponderation: 50 });
    const precedente = {
        id: 'EV_ANCIENNE', etudiantDA: '111', grilleId: 'G1', echelleId: echelle.id, productionId: 'P0',
        dateEvaluation: '2026-04-01', productionNom: 'Labo 1',
        criteres: [critere('Démarche', codePrecedent), critere('Calculs', codePrecedent)]
    };
    const data = chargerScript('js/synthese-retroaction-data.js', Object.assign({
        db: { getSync: (k, d) => (d !== undefined ? d : null), get: async () => null, set: async () => {}, setSync: () => {} },
        cle: (k) => 'test_' + k,
        obtenirDonneesSelonMode: (k) => (k === 'evaluationsSauvegardees' ? [precedente]
            : k === 'productions' ? (opts.productions || []) : []),
        obtenirTrimestreActif: () => ({ id: 'T1', nom: 'A2026' }),
        obtenirEtudiantsCoursActif: () => [],
        obtenirGroupesCours: () => [],
        travauxStockage: { obtenirAnnotationFichier: () => null },
        travauxOutils: { AUTOCOLLANTS: [] },
        obtenirPreference: () => null,
        obtenirEchelleResolue: calculs.obtenirEchelleResolue,
        niveauDuCodeDansEchelle: calculs.niveauDuCodeDansEchelle,
        niveauxOrdonnesDeLEchelle: calculs.niveauxOrdonnesDeLEchelle,
        echellesComparables: calculs.echellesComparables,
        zoneDuNiveau: calculs.zoneDuNiveau
    }, opts.globaux || {})).syntheseRetroactionData;
    const rendu = chargerScript('js/synthese-retroaction-rendu.js', {
        db: { getSync: (k, d) => (d !== undefined ? d : null) },
        cle: (k) => 'test_' + k,
        echapperHtml: echapper
    }).syntheseRetroactionRendu;
    const feedback = data.construireFeedback({
        id: 'EV_COURANTE', etudiantDA: '111', grilleId: 'G1', echelleId: echelle.id, productionId: 'P1',
        dateEvaluation: '2026-05-10', productionNom: 'Labo 3',
        criteres: [critere('Démarche', codeCourant), critere('Calculs', codeCourant)]
    }, { id: 'F1' }, null);
    return { feedback, html: rendu.rendreSyntheseHTML(feedback) };
}

/* -------------------------------------------------------------------- essais */

describe('F4-1 · maîtrisé deux fois de suite : une seule phrase, sans « artefact » ni niveau nommé', () => {

    MONTAGES.forEach(({ nom, echelle, acquis }) => {

        it(`bilan d'écran, échelle ${nom} : le texte exact`, () => {
            const html = bilanEcran(echelle, acquis, acquis);
            expect(html).toContain('<p class="retro-force">' + PHRASE_ECRAN + '</p>');
            expect(html).not.toMatch(/artefact/i);
            expect(html).not.toContain('niveau É');
            expect(html).not.toContain('vers le niveau');
            expect(html).not.toContain('—');
        });

        it(`synthèse du PDF, échelle ${nom} : le texte exact, jusque dans le HTML rendu`, () => {
            const { feedback, html } = synthese(echelle, acquis, acquis);
            const message = feedback.bilan.concentration.messageGlobal;
            expect(feedback.bilan.concentration.tousMaitrises).toBe(true);
            expect(message).toBe(PHRASE);
            expect(message).not.toMatch(/artefact/i);
            expect(message).not.toContain('—');
            // Aucun niveau de l'échelle n'est nommé — ni son sommet, ni « É ».
            expect(message).not.toContain('niveau');
            echelle.niveaux.forEach((n) => expect(message).not.toContain(n.nom));
            expect(texteLu(html)).toContain(PHRASE);
        });
    });

    it('les deux sites disent les MÊMES MOTS, à l\'apostrophe près', () => {
        const ecran = texteLu(bilanEcran(IDME, 'M', 'M')).replace(/’/g, "'");
        const pdf = synthese(IDME, 'M', 'M').feedback.bilan.concentration.messageGlobal;
        expect(ecran).toContain(pdf);
    });

    it('maîtrisé UNE fois seulement : « Continue sur cette lancée ! » ne change pas', () => {
        // Le passé n'était pas acquis : la phrase longue ne sort pas.
        expect(bilanEcran(IDME, 'M', 'D'))
            .toContain('<p class="retro-force">Tous les critères sont maîtrisés. Continue sur cette lancée !</p>');
        expect(synthese(IDME, 'M', 'D').feedback.bilan.concentration.messageGlobal)
            .toBe('Tous les critères sont maîtrisés. Continue sur cette lancée !');
    });

    it('zéro-dette : le lecteur du « niveau le plus haut » est parti avec la phrase', () => {
        // Il n'avait qu'un appelant. Chaînes découpées pour que ce banc ne se
        // satisfasse pas de lui-même s'il était un jour balayé.
        ['js/synthese-retroaction-data.js', 'js/evaluation-retroaction.js'].forEach((f) => {
            const source = readFileSync(path.join(racine, f), 'utf8');
            expect(source, f).not.toContain('niveauLe' + 'PlusHaut');
            expect(source, f).not.toContain('versLe' + 'Sommet');
        });
    });
});

describe('F4-1 · le titre de repli d\'une production, dans le PDF remis à l\'élève', () => {

    // Trois replis, trois listes du PDF : retenue (production sans titre, et
    // production disparue), obligatoire, à venir.
    const PRODUCTIONS = [
        { id: 'P1', type: 'artefact-portfolio', categorie: 'selection' },
        { id: 'P2', type: 'artefact-portfolio', categorie: 'obligatoire' },
        { id: 'P3', type: 'artefact-portfolio', categorie: 'selection' }
    ];
    const globaux = {
        obtenirConfigPratiqueActive: () => ({
            configuration: { categories: { selection: { ponderation: 65 }, obligatoires: { ponderation: 35 } } }
        }),
        calculerDetailsNoteFinale: () => ({
            portfolio: {
                methodeSelection: 'hybride', moyenne: 80, nombreEvalues: 2,
                artefactsRetenus: [
                    { productionId: 'P1', niveau: 'M', note: 80 },
                    { productionId: 'P_DISPARUE', niveau: 'M', note: 78 }
                ]
            }
        })
    };

    it('une production sans titre se lit « Production », plus « Artefact »', () => {
        const { feedback, html } = synthese(IDME, 'M', 'M', { productions: PRODUCTIONS, globaux });
        const note = feedback.bilan.note;
        expect(note, 'rangée de note absente : le montage ne mesure rien').toBeTruthy();

        const titres = []
            .concat(note.selection || [], note.obligatoires || [], note.avenir || [])
            .map((x) => x.titre);
        // Retenue sans titre, retenue disparue, obligatoire, à venir.
        expect(titres.length).toBeGreaterThanOrEqual(4);
        titres.forEach((t) => expect(t).toBe('Production'));

        // Et dans ce que l'élève lit : une ligne de liste commence par le repli.
        expect(html).toMatch(/<li[^>]*>Production/);
        expect(html).not.toMatch(/<li[^>]*>Artefact/);
    });
});
