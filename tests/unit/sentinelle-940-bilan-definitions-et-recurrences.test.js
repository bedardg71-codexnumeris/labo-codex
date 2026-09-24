import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE #940 — LE BILAN : LA DÉFINITION DE CHAQUE CRITÈRE À TRAVAILLER, ET DES « POINTS
// RÉCURRENTS » QUI REGARDENT D'UNE COPIE À L'AUTRE.
//
// Décisions de Grégoire (24 sept. 2026), forme validée mot pour mot :
//   PRÉSENTEMENT, IL FAUT SE CONCENTRER SUR
//   Acquis en développement, à consolider :
//   • Structure (En développement) : ‹la définition du critère, telle qu'écrite dans la grille›
//   POINTS RÉCURRENTS
//   • Structure : à consolider depuis 2 productions
//   • Rigueur : prioritaire depuis 4 productions
//
// Chaque cas est rendu DEUX fois — le PDF de synthèse (`construireFeedback`) et le bilan de
// l'écran (`basculerVueRetroaction('bilan')`, copié par `copierToutRetroaction` dans ce que
// l'élève reçoit) — et les deux doivent porter les MÊMES lignes (#581). Les lecteurs d'échelle
// sont les vrais (`profil-etudiant-calculs.js`), la règle est la vraie (`synthese-retroaction-data.js`).

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const source = (f) => readFileSync(path.join(racine, f), 'utf8');

const NIVEAUX_IDME = [
    { code: 'I', nom: 'Insuffisant', min: 0, max: 54, valeurCalcul: 40 },
    { code: 'D', nom: 'En développement', min: 55, max: 74, valeurCalcul: 65 },
    { code: 'M', nom: 'Maîtrisé', min: 75, max: 89, valeurCalcul: 80 },
    { code: 'E', nom: 'Étendu', min: 90, max: 100, valeurCalcul: 95 }
];
// L'échelle à repères : I priorité, D à consolider, M et E acquis.
const E_IDME = { id: 'E_IDME', nom: 'IDME', seuilSuffisance: 'D', seuilMaitrise: 'M', niveaux: NIVEAUX_IDME };
// MÊMES CODES, AUTRES REPÈRES : D y est déjà acquis. Le seul montage qui distingue « lu dans
// son échelle » de « lu dans l'échelle courante ».
const E_INDULGENTE = { id: 'E_INDULGENTE', nom: 'IDME indulgente', seuilSuffisance: 'I', seuilMaitrise: 'D', niveaux: NIVEAUX_IDME };
// Une autre échelle à repères, d'autres codes : un historique qui change d'échelle.
const E_TROIS = { id: 'E_TROIS', nom: 'Trois paliers', seuilSuffisance: 'B', seuilMaitrise: 'C', niveaux: [
    { code: 'A', nom: 'Début', min: 0, max: 59, valeurCalcul: 40 },
    { code: 'B', nom: 'Milieu', min: 60, max: 79, valeurCalcul: 70 },
    { code: 'C', nom: 'Fin', min: 80, max: 100, valeurCalcul: 90 }
] };
// Une échelle SANS repères : aucune zone, donc rien à dire.
const E_SANS = { id: 'E_SANS', nom: 'Sans repères', niveaux: NIVEAUX_IDME };
const ECHELLES = [E_IDME, E_INDULGENTE, E_TROIS, E_SANS];

const GRILLE = { id: 'G1', nom: 'Grille', criteres: [
    { id: 'c_Structure', nom: 'Structure', type: 'holistique', ponderation: 25, description: 'La structure du texte' },
    { id: 'c_Rigueur', nom: 'Rigueur', type: 'holistique', ponderation: 25, description: 'La rigueur de la démonstration' },
    { id: 'c_Nuance', nom: 'Nuance', type: 'holistique', ponderation: 20, description: '' },
    { id: 'c_Langue', nom: 'Langue', type: 'analytique', ponderation: 30, description: 'La qualité de la langue' }
] };
const DA = '7654321';

/** Une copie : `niveaux` par nom de critère (ordre de la grille), `points` pour un analytique. */
function copie(id, date, echelleId, niveaux, points) {
    return {
        id, etudiantDA: DA, productionId: 'P_' + id, productionNom: 'Production ' + id, grilleId: 'G1', echelleId,
        dateEvaluation: date, noteFinale: 60, niveauFinal: 'D',
        criteres: GRILLE.criteres.filter(gc => niveaux[gc.nom]).map(gc => Object.assign(
            { critereId: gc.id, critereNom: gc.nom, niveauSelectionne: niveaux[gc.nom], ponderation: gc.ponderation },
            (points && typeof points[gc.nom] === 'number') ? { points: points[gc.nom] } : {}))
    };
}
/** Un historique : les copies ANTÉRIEURES, la plus récente d'abord (une par jour avant le 1er oct.). */
function historique(liste) {
    return liste.map((h, i) => copie('H' + i, `2026-09-${String(28 - i).padStart(2, '0')}T12:00:00.000Z`,
        h.echelleId || 'E_IDME', h.niveaux || h));
}
const DATE_COURANTE = '2026-10-01T12:00:00.000Z';

function chargerCalculs() {
    return chargerScript('js/profil-etudiant-calculs.js', {
        db: { getSync: (k, d) => (String(k).indexOf('echellesTemplates') !== -1 ? ECHELLES : (d !== undefined ? d : null)), get: async () => null, set: async () => {}, setSync() {} },
        cle: (k) => 'test_' + k, obtenirDonneesSelonMode: () => [], obtenirPreference: () => null, obtenirSeuil: () => null,
        obtenirPratiqueParId: () => null, obtenirTypePratiqueActive: () => 'standards'
    });
}
const echapper = (t) => (t == null ? '' : String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'));
const desechapper = (t) => t.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const dbStub = { getSync: (k, d) => (String(k).indexOf('echellesTemplates') !== -1 ? ECHELLES : String(k).indexOf('grillesTemplates') !== -1 ? [GRILLE] : (d !== undefined ? d : null)),
    get: async () => null, set: async () => {}, setSync() {} };

/** Le bilan du PDF de synthèse : les lignes de « Présentement » et de « Points récurrents ». */
function bilanPdf(courante, enBase) {
    const calculs = chargerCalculs();
    const win = chargerScript('js/synthese-retroaction-data.js', {
        db: dbStub, cle: (k) => 'test_' + k,
        obtenirDonneesSelonMode: (quoi) => (quoi === 'evaluationsSauvegardees' ? JSON.parse(JSON.stringify(enBase)) : []),
        obtenirTrimestreActif: () => ({ id: 'T1', nom: 'A2026' }), obtenirEtudiantsCoursActif: () => [], obtenirGroupesCours: () => [],
        travauxStockage: { obtenirAnnotationFichier: () => null }, travauxOutils: { AUTOCOLLANTS: [] }, obtenirPreference: () => null,
        obtenirEchelleResolue: calculs.obtenirEchelleResolue, niveauDuCodeDansEchelle: calculs.niveauDuCodeDansEchelle,
        niveauxOrdonnesDeLEchelle: calculs.niveauxOrdonnesDeLEchelle, echellesComparables: calculs.echellesComparables,
        zoneDuNiveau: calculs.zoneDuNiveau
    });
    const bilan = win.syntheseRetroactionData.construireFeedback(courante, { id: 'F1' }, null).bilan;
    return {
        bilan,
        presentement: bilan.concentration.priorites.concat(bilan.concentration.signales),
        recurrents: bilan.recurrents.recurrences
    };
}

/** Le bilan de l'écran, pour la même copie rouverte (niveaux vivants = ceux de la copie en base). */
function bilanEcran(courante, enBase) {
    const calculs = chargerCalculs();
    const els = {};
    const boite = () => ({ innerHTML: '', classList: { add() {}, remove() {}, toggle() {} } });
    ['contenuRetroBilan', 'contenuRetroSpecifique', 'vueRetroGenerale', 'vueRetroSpecifique', 'vueRetroBilan'].forEach(id => { els[id] = boite(); });
    els.niveauProduction1 = { textContent: 'D' };
    const wEnonces = chargerScript('js/evaluation-enonces.js');
    chargerScript('js/synthese-retroaction-data.js', {}, wEnonces);
    const w = chargerScript('js/evaluation-retroaction.js', {
        document: { addEventListener() {}, removeEventListener() {}, querySelector: () => null, querySelectorAll: () => [],
            getElementById: (id) => els[id] || null, createElement: () => ({ setAttribute() {}, appendChild() {}, style: {}, classList: { add() {}, remove() {} } }),
            body: { addEventListener() {}, appendChild() {}, setAttribute() {}, getAttribute: () => null, style: {}, classList: { add() {}, remove() {} } },
            documentElement: { addEventListener() {} } },
        db: dbStub, cle: (k) => 'test_' + k,
        obtenirDonneesSelonMode: (quoi) => (quoi === 'evaluationsSauvegardees' ? JSON.parse(JSON.stringify(enBase)) : []),
        echapperHtml: echapper,
        niveauxOrdonnesDeLEchelle: calculs.niveauxOrdonnesDeLEchelle, niveauDuCodeDansEchelle: calculs.niveauDuCodeDansEchelle,
        zoneDuNiveau: calculs.zoneDuNiveau, echellesComparables: calculs.echellesComparables, obtenirEchelleResolue: calculs.obtenirEchelleResolue
    }, wEnonces);
    const niveaux = {}; const points = {};
    courante.criteres.forEach(c => { niveaux[c.critereId] = c.niveauSelectionne; if (typeof c.points === 'number') points[c.critereId] = c.points; });
    w.evaluationEnCours = { etudiantDA: DA, productionId: courante.productionId, grilleId: 'G1', echelleId: courante.echelleId,
        idModification: courante.id, criteres: niveaux, pointsAnalytiques: points };
    w.basculerVueRetroaction('bilan');
    const html = els.contenuRetroBilan.innerHTML;
    const [avant, apres] = html.split('<h5>Points récurrents</h5>');
    const puces = (morceau) => (morceau || '').match(/<p>- (.*?)<\/p>/g)?.map(p => desechapper(p.slice(5, -4))) || [];
    return { html, presentement: puces(avant), recurrents: puces(apres) };
}

/** Les deux rendus d'un même cas ; échoue si l'écran et le PDF ne disent pas les mêmes lignes. */
function lesDeux(niveauxCourants, anterieures, { echelleId = 'E_IDME', points, enPlus = [] } = {}) {
    const courante = copie('COURANTE', DATE_COURANTE, echelleId, niveauxCourants, points);
    const enBase = [courante].concat(anterieures, enPlus);
    const pdf = bilanPdf(courante, enBase);
    const ecran = bilanEcran(courante, enBase);
    expect(ecran.presentement, 'écran = PDF, « Présentement »').toEqual(pdf.presentement);
    expect(ecran.recurrents, 'écran = PDF, « Points récurrents »').toEqual(pdf.recurrents);
    return { pdf, ecran };
}

describe('#940 · « Présentement » : chaque critère à travailler porte sa définition', () => {

    it('prioritaires ET à consolider : « Nom (niveau) : définition », la définition telle qu\'écrite', () => {
        const { pdf } = lesDeux({ Structure: 'D', Rigueur: 'I', Nuance: 'M' }, []);
        expect(pdf.presentement).toEqual([
            'Rigueur (Insuffisant) : La rigueur de la démonstration',
            'Structure (En développement) : La structure du texte'
        ]);
    });

    it('sans définition dans la grille : « Nom (niveau) » seul, rien d\'inventé', () => {
        const { pdf } = lesDeux({ Structure: 'M', Rigueur: 'M', Nuance: 'I' }, []);
        expect(pdf.presentement).toEqual(['Nuance (Insuffisant)']);
    });

    it('analytique : le chiffre tient lieu de niveau, et la définition suit', () => {
        const { pdf } = lesDeux({ Structure: 'M', Langue: 'I' }, [], { points: { Langue: 12 } });
        expect(pdf.presentement).toEqual(['Langue (12 / 30) : La qualité de la langue']);
    });

    it('la mention « Cet objectif est prioritaire depuis 3 productions » a quitté « Présentement »', () => {
        const { pdf, ecran } = lesDeux({ Rigueur: 'I', Structure: 'M' }, historique([{ Rigueur: 'I' }, { Rigueur: 'I' }]));
        expect(JSON.stringify(pdf.bilan.concentration)).not.toContain('depuis');
        expect(ecran.presentement.join('|')).not.toContain('depuis');
        expect(ecran.html).not.toContain('Cet objectif');
        // … elle se dit une seule fois, dans « Points récurrents ».
        expect(pdf.recurrents).toEqual(['Rigueur : prioritaire depuis 3 productions']);
    });
});

describe('#940 · « Points récurrents » : ce qui revient d\'une copie à l\'autre', () => {

    it('aucune copie antérieure : aucune récurrence (et la section de l\'écran ne s\'ouvre pas pour rien)', () => {
        const { pdf, ecran } = lesDeux({ Structure: 'D', Rigueur: 'I' }, []);
        expect(pdf.recurrents).toEqual([]);
        expect(ecran.html).not.toContain('Points récurrents');
    });

    it('dès deux productions ; le mot vient de la zone de la copie ACTUELLE', () => {
        // Structure était prioritaire avant, elle est à consolider maintenant.
        const { pdf } = lesDeux({ Structure: 'D', Rigueur: 'I', Nuance: 'M' }, historique([{ Structure: 'I', Rigueur: 'D', Nuance: 'I' }]));
        expect(pdf.recurrents).toEqual([
            'Rigueur : prioritaire depuis 2 productions',
            'Structure : à consolider depuis 2 productions'
        ]);
    });

    it('le nombre RÉEL de productions consécutives, en remontant tout l\'historique', () => {
        const { pdf } = lesDeux({ Rigueur: 'I', Structure: 'M' },
            historique([{ Rigueur: 'D' }, { Rigueur: 'I' }, { Rigueur: 'I' }, { Rigueur: 'D' }]));
        expect(pdf.recurrents).toEqual(['Rigueur : prioritaire depuis 5 productions']);
    });

    it('interrompue par un « acquis » : on ne compte que depuis', () => {
        const { pdf } = lesDeux({ Rigueur: 'I', Structure: 'D' },
            historique([{ Rigueur: 'I', Structure: 'M' }, { Rigueur: 'M', Structure: 'I' }, { Rigueur: 'I', Structure: 'I' }]));
        // Rigueur : actuelle + H0, arrêtée par H1. Structure : arrêtée tout de suite par H0.
        expect(pdf.recurrents).toEqual(['Rigueur : prioritaire depuis 2 productions']);
    });

    it('plus de plafond : huit productions se comptent huit (l\'ancien historique s\'arrêtait à cinq)', () => {
        const { pdf } = lesDeux({ Rigueur: 'I', Structure: 'M' }, historique(Array.from({ length: 7 }, () => ({ Rigueur: 'I' }))));
        expect(pdf.recurrents).toEqual(['Rigueur : prioritaire depuis 8 productions']);
    });

    it('les copies POSTÉRIEURES à celle-ci ne comptent pas (rouvrir une ancienne copie)', () => {
        const posterieure = copie('APRES', '2026-10-15T12:00:00.000Z', 'E_IDME', { Rigueur: 'I', Structure: 'D' });
        const { pdf } = lesDeux({ Rigueur: 'I', Structure: 'D' }, historique([{ Rigueur: 'M', Structure: 'M' }]), { enPlus: [posterieure] });
        expect(pdf.recurrents).toEqual([]);
    });

    it('chaque copie est lue dans SON échelle : un « D » acquis dans son barème arrête la chaîne', () => {
        const { pdf } = lesDeux({ Structure: 'D', Rigueur: 'I' },
            historique([{ echelleId: 'E_INDULGENTE', niveaux: { Structure: 'D', Rigueur: 'I' } }]));
        // Lu dans l'échelle courante, Structure aurait fait « à consolider depuis 2 productions ».
        expect(pdf.recurrents).toEqual(['Rigueur : prioritaire depuis 2 productions']);
    });

    it('un historique qui change d\'échelle : la zone se compare à la zone, pas le code au code', () => {
        const { pdf } = lesDeux({ Rigueur: 'I', Structure: 'D' },
            historique([{ echelleId: 'E_TROIS', niveaux: { Rigueur: 'A', Structure: 'B' } }, { Rigueur: 'I', Structure: 'M' }]));
        expect(pdf.recurrents).toEqual([
            'Rigueur : prioritaire depuis 3 productions',
            'Structure : à consolider depuis 2 productions'
        ]);
    });

    it('une copie antérieure sous une échelle SANS repères ne dit rien : la chaîne s\'y arrête', () => {
        const { pdf } = lesDeux({ Rigueur: 'I', Structure: 'M' },
            historique([{ echelleId: 'E_SANS', niveaux: { Rigueur: 'I' } }]));
        expect(pdf.recurrents).toEqual([]);
    });

    it('un critère absent de la copie antérieure arrête la chaîne (on ne compte que ce qui a été mesuré)', () => {
        const { pdf } = lesDeux({ Rigueur: 'I', Nuance: 'I' }, historique([{ Rigueur: 'I', Structure: 'M' }]));
        expect(pdf.recurrents).toEqual(['Rigueur : prioritaire depuis 2 productions']);
    });

    it('analytique : la zone vient du niveau déduit des points, comme pour « Présentement »', () => {
        const { pdf } = lesDeux({ Structure: 'M', Langue: 'I' }, historique([{ Langue: 'D' }]), { points: { Langue: 12 } });
        expect(pdf.recurrents).toEqual(['Langue : prioritaire depuis 2 productions']);
    });

    it('les tampons de la copie ont quitté « Points récurrents » (ils sont dans « Commentaires ciblés »)', () => {
        const { pdf } = lesDeux({ Rigueur: 'I' }, []);
        expect(pdf.bilan.recurrents).not.toHaveProperty('tampons');
        expect(source('js/synthese-retroaction-rendu.js')).not.toContain('recurrents.tampons');
        expect(source('js/synthese-retroaction-data.js')).not.toContain('construireTamponsRecurrents');
    });
});

describe('#940 · une échelle sans repères : ni « Présentement » ni « Points récurrents » ne disent rien', () => {

    it('copie actuelle sous une échelle sans repères, historique à repères : aucune ligne', () => {
        const { pdf, ecran } = lesDeux({ Rigueur: 'I', Structure: 'D' }, historique([{ Rigueur: 'I', Structure: 'I' }]), { echelleId: 'E_SANS' });
        expect(pdf.presentement).toEqual([]);
        expect(pdf.recurrents).toEqual([]);
        expect(ecran.html).not.toContain('depuis');
    });
});

// La question de Grégoire (consigne §2) : « On parle ici d'une pratique Standards avec échelle de
// performance. C'est sans doute différent avec des critères analytiques et une sommative ? » Le bilan
// ne lit AUCUNE pratique : il lit l'échelle de chaque copie. Trois copies de chaque sorte.
describe('#940 · §2 — trois copies de chaque sorte : ce que lit l\'élève', () => {

    it('holistique, échelle à repères (Standards) : la définition, puis « depuis 3 productions »', () => {
        const { pdf } = lesDeux({ Structure: 'D', Rigueur: 'I', Nuance: 'M' },
            historique([{ Structure: 'D', Rigueur: 'I', Nuance: 'M' }, { Structure: 'I', Rigueur: 'I', Nuance: 'D' }]));
        expect(pdf.presentement).toEqual([
            'Rigueur (Insuffisant) : La rigueur de la démonstration',
            'Structure (En développement) : La structure du texte'
        ]);
        expect(pdf.recurrents).toEqual([
            'Rigueur : prioritaire depuis 3 productions',
            'Structure : à consolider depuis 3 productions'
        ]);
    });

    it('analytique, échelle à repères (sommative) : le chiffre au lieu du niveau, la même récurrence', () => {
        const { pdf } = lesDeux({ Structure: 'M', Langue: 'D' },
            historique([{ Structure: 'M', Langue: 'I' }, { Structure: 'M', Langue: 'D' }]), { points: { Langue: 20 } });
        expect(pdf.presentement).toEqual(['Langue (20 / 30) : La qualité de la langue']);
        expect(pdf.recurrents).toEqual(['Langue : à consolider depuis 3 productions']);
    });

    it('échelle sans repères, trois copies : ni « Présentement » ni « Points récurrents » ne disent rien', () => {
        const sans = { echelleId: 'E_SANS', niveaux: { Structure: 'D', Rigueur: 'I' } };
        const { pdf } = lesDeux({ Structure: 'D', Rigueur: 'I' }, historique([sans, sans]), { echelleId: 'E_SANS' });
        expect(pdf.presentement).toEqual([]);
        expect(pdf.recurrents).toEqual([]);
    });
});

describe('#940 · la règle est UNE, lue par le PDF et par l\'écran', () => {
    it('l\'écran appelle la règle du module de données ; ses anciennes copies sont parties', () => {
        const retro = source('js/evaluation-retroaction.js');
        expect(retro).toContain('window.syntheseRetroactionData.lignesRecurrentes(');
        expect(retro).toContain('window.syntheseRetroactionData.ligneCritereATravailler(');
        expect(retro).toContain('window.syntheseRetroactionData.historiqueAnterieur(');
        expect(retro).not.toContain('function _detecterPatronsRecurrentsBilan');
        expect(retro).not.toContain('.slice(0, 5)');
        expect(source('js/synthese-retroaction-data.js')).not.toContain('function identifierPatrons');
    });
});
