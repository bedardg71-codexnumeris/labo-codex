import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE #555 LOT 2 — LA ZONE D'UN NIVEAU SE LIT DANS SES REPÈRES.
//
// `zoneDuNiveau` remplace les trente-deux comparaisons en toutes lettres
// (`=== 'I' || === 'D'`, `=== 'M' || === 'E'`) réparties entre le PDF remis à
// l'élève et le bilan à l'écran. Les trois zones sont celles que Grégoire a
// choisies le 28 août, et elles viennent de sa pratique PAN-Standards :
// insuffisant / réel mais non durable / acquis.
//
// ⮕ CE QUI EST ÉPROUVÉ ICI, ET QUI COMPTE PLUS QUE LES CAS NOMINAUX : les trois
// façons de ne PAS pouvoir répondre. `null` n'est pas une quatrième zone, c'est
// un refus — et un appelant qui le traiterait comme « priorité » rangerait des
// élèves dans une case au hasard.

function monter(echelles) {
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

// Les lettres de Grégoire, mais dans un AUTRE ordre : « E » (Émergent) est le
// plus faible, « I » (Intégré) le plus fort. Une table en dur et une lecture de
// repères donnent ici des réponses OPPOSÉES — c'est le seul montage qui prouve
// que la réponse vient bien des repères.
const RENVERSEE = (reperes = {}) => [Object.assign({
    id: 'ECH_RENV', nom: 'Émergent → Intégré',
    niveaux: [
        { code: 'E', nom: 'Émergent',  min: 0,  max: 59,  valeurCalcul: 40 },
        { code: 'M', nom: 'Mobilisé',  min: 60, max: 74,  valeurCalcul: 67 },
        { code: 'D', nom: 'Développé', min: 75, max: 84,  valeurCalcul: 80 },
        { code: 'I', nom: 'Intégré',   min: 85, max: 100, valeurCalcul: 95 }
    ]
}, reperes)];

describe('#555 lot 2 · la zone d\'un niveau vient de SES repères', () => {

    it('les trois zones, sur une échelle dont les lettres contredisent IDME', () => {
        // Repères : suffisant à partir de M (rang 2), maîtrisé à partir de D (rang 3).
        const w = monter(RENVERSEE({ seuilSuffisance: 'M', seuilMaitrise: 'D' }));
        expect(w.zoneDuNiveau('E', 'ECH_RENV')).toBe('priorite');  // IDME dirait « acquis »
        expect(w.zoneDuNiveau('M', 'ECH_RENV')).toBe('signale');   // IDME dirait « acquis »
        expect(w.zoneDuNiveau('D', 'ECH_RENV')).toBe('acquis');    // IDME dirait « défi »
        expect(w.zoneDuNiveau('I', 'ECH_RENV')).toBe('acquis');    // IDME dirait « défi »
    });

    it('les deux repères sur le MÊME niveau : plus de zone intermédiaire', () => {
        const w = monter(RENVERSEE({ seuilSuffisance: 'D', seuilMaitrise: 'D' }));
        expect(w.zoneDuNiveau('M', 'ECH_RENV')).toBe('priorite');
        expect(w.zoneDuNiveau('D', 'ECH_RENV')).toBe('acquis');
    });

    // ── LES TROIS REFUS ──────────────────────────────────────────────────────

    it('AUCUN repère ⇒ null, et surtout pas une zone devinée', () => {
        // Le cas de toute échelle antérieure au lot 1. Rien n'est déduit des
        // lettres, ni d'une position, ni d'un pourcentage.
        const w = monter(RENVERSEE());
        expect(w.zoneDuNiveau('E', 'ECH_RENV')).toBeNull();
        expect(w.zoneDuNiveau('I', 'ECH_RENV')).toBeNull();
    });

    it('code étranger à l\'échelle ⇒ null', () => {
        const w = monter(RENVERSEE({ seuilMaitrise: 'D' }));
        expect(w.zoneDuNiveau('ZZZ', 'ECH_RENV')).toBeNull();
        expect(w.zoneDuNiveau('', 'ECH_RENV')).toBeNull();
    });

    it('échelle introuvable ⇒ null', () => {
        const w = monter(RENVERSEE({ seuilMaitrise: 'D' }));
        expect(w.zoneDuNiveau('D', 'ECH_DISPARUE')).toBeNull();
    });

    // ── UN SEUL REPÈRE ───────────────────────────────────────────────────────

    it('maîtrise SEULE ⇒ acquis au-dessus, priorité en dessous', () => {
        const w = monter(RENVERSEE({ seuilMaitrise: 'D' }));
        expect(w.zoneDuNiveau('M', 'ECH_RENV')).toBe('priorite');
        expect(w.zoneDuNiveau('D', 'ECH_RENV')).toBe('acquis');
        expect(w.zoneDuNiveau('I', 'ECH_RENV')).toBe('acquis');
    });

    it('suffisance SEULE ⇒ jamais « acquis » : on ne sait pas où il commence', () => {
        const w = monter(RENVERSEE({ seuilSuffisance: 'M' }));
        expect(w.zoneDuNiveau('E', 'ECH_RENV')).toBe('priorite');
        expect(w.zoneDuNiveau('M', 'ECH_RENV')).toBe('signale');
        expect(w.zoneDuNiveau('I', 'ECH_RENV')).toBe('signale');
    });

    it('un repère qui désigne un niveau ABSENT est ignoré, pas deviné', () => {
        // Une échelle dont on a supprimé le niveau que le repère désignait.
        const w = monter(RENVERSEE({ seuilSuffisance: 'DISPARU', seuilMaitrise: 'D' }));
        expect(w.zoneDuNiveau('M', 'ECH_RENV')).toBe('priorite');
        expect(w.zoneDuNiveau('D', 'ECH_RENV')).toBe('acquis');
    });

    it('les deux repères illisibles ⇒ null, comme s\'il n\'y en avait aucun', () => {
        const w = monter(RENVERSEE({ seuilSuffisance: 'XX', seuilMaitrise: 'YY' }));
        expect(w.zoneDuNiveau('D', 'ECH_RENV')).toBeNull();
    });

    it('l\'ordre vient des PLAGES, pas de la saisie', () => {
        // Niveaux saisis du plus fort au plus faible : si l'ordre de saisie
        // tranchait, « acquis » et « priorité » seraient inversés.
        const w = monter([{
            id: 'ECH_DESORDRE', nom: 'Saisie à l\'envers',
            seuilMaitrise: 'HAUT',
            niveaux: [
                { code: 'HAUT', nom: 'Haut', min: 80, max: 100, valeurCalcul: 90 },
                { code: 'BAS',  nom: 'Bas',  min: 0,  max: 79,  valeurCalcul: 40 }
            ]
        }]);
        expect(w.zoneDuNiveau('BAS', 'ECH_DESORDRE')).toBe('priorite');
        expect(w.zoneDuNiveau('HAUT', 'ECH_DESORDRE')).toBe('acquis');
    });
});
