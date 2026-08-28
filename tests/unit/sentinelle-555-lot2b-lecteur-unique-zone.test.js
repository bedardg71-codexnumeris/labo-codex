import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE #555 LOT 2 (b) — LA RÈGLE DES ZONES N'EST ÉCRITE QU'UNE FOIS.
//
// Elle l'était deux fois : dans `zoneDuNiveau` (`profil-etudiant-calculs.js`)
// et dans l'aperçu de l'éditeur d'échelle (`echelles.js`), qui la recopiait
// sous un autre vocabulaire — « maîtrisé », « suffisant », « à travailler ».
// Deux copies d'une même règle finissent par diverger : c'est le patron des
// replis `|| 0.70` / `|| 0.75` que ce même item a défait le 28 août.
//
// ⮕ CE QUI EST ÉPROUVÉ ICI, ET QUI NE L'ÉTAIT PAR AUCUN AUTRE BANC :
//   1. le lecteur nu répond sur une échelle que le RÉSOLVEUR ne trouve pas —
//      c'est le seul montage qui distingue la règle de son résolveur, et c'est
//      exactement le besoin de l'éditeur (une échelle en cours de saisie) ;
//   2. les deux points d'entrée rendent la MÊME zone sur la même échelle ;
//   3. l'aperçu ne recopie plus la comparaison de rangs (assertion statique).

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

// Les mêmes lettres que Grégoire, dans l'ordre INVERSE : une table en dur et une
// lecture de repères donnent ici des réponses opposées.
const NIVEAUX_RENVERSES = [
    { code: 'E', nom: 'Émergent',  min: 0,  max: 59,  valeurCalcul: 40 },
    { code: 'M', nom: 'Mobilisé',  min: 60, max: 74,  valeurCalcul: 67 },
    { code: 'D', nom: 'Développé', min: 75, max: 84,  valeurCalcul: 80 },
    { code: 'I', nom: 'Intégré',   min: 85, max: 100, valeurCalcul: 95 }
];

const ECHELLE_ENREGISTREE = [{
    id: 'ECH_RENV', nom: 'Émergent → Intégré',
    seuilSuffisance: 'M', seuilMaitrise: 'D',
    niveaux: NIVEAUX_RENVERSES
}];

describe('#555 lot 2 (b) · un seul lecteur pour la zone d\'un code', () => {

    // ── 1. LA RÈGLE RÉPOND SANS SON RÉSOLVEUR ────────────────────────────────

    it('une échelle JAMAIS ENREGISTRÉE reçoit ses zones — le cas de l\'éditeur', () => {
        // Le stockage ne contient RIEN : `obtenirEchelleResolue` ne peut rien
        // résoudre. C'est l'état d'une échelle en cours de saisie, celle que
        // l'utilisateur a sous les yeux dans l'aperçu de l'éditeur.
        const w = monter([]);
        const enSaisie = {
            id: 'PAS_ENCORE_ENREGISTREE', nom: 'En cours de saisie',
            seuilSuffisance: 'M', seuilMaitrise: 'D',
            niveaux: NIVEAUX_RENVERSES
        };
        const ranges = w.ordonnerNiveauxParPlage(enSaisie.niveaux);

        // Le résolveur ne peut pas répondre : il ne trouve pas l'échelle.
        expect(w.zoneDuNiveau('D', 'PAS_ENCORE_ENREGISTREE')).toBeNull();

        // La règle, elle, répond — et c'est TOUT l'intérêt de l'extraction.
        expect(w.zoneDuCodeDansNiveaux('E', ranges, enSaisie)).toBe('priorite');
        expect(w.zoneDuCodeDansNiveaux('M', ranges, enSaisie)).toBe('signale');
        expect(w.zoneDuCodeDansNiveaux('D', ranges, enSaisie)).toBe('acquis');
        expect(w.zoneDuCodeDansNiveaux('I', ranges, enSaisie)).toBe('acquis');
    });

    // ── 2. LES DEUX POINTS D'ENTRÉE S'ACCORDENT ──────────────────────────────

    it('sur la MÊME échelle, le résolveur et la règle nue disent la même chose', () => {
        // Si les deux divergeaient d'un seul cran, l'éditeur montrerait à
        // l'utilisateur des zones que la rétroaction de l'élève contredirait.
        const w = monter(ECHELLE_ENREGISTREE);
        const ranges = w.ordonnerNiveauxParPlage(NIVEAUX_RENVERSES);
        const echelle = ECHELLE_ENREGISTREE[0];

        ['E', 'M', 'D', 'I'].forEach((code) => {
            expect(w.zoneDuCodeDansNiveaux(code, ranges, echelle))
                .toBe(w.zoneDuNiveau(code, 'ECH_RENV'));
        });
    });

    // ── 3. LES REFUS DE LA RÈGLE NUE ─────────────────────────────────────────

    it('sans niveaux rangés, elle refuse au lieu de deviner', () => {
        // L'état d'une échelle neuve dont les bornes « Min » manquent encore :
        // `ordonnerNiveauxParPlage` rend `[]`, et aucune zone n'est affichable.
        const w = monter([]);
        const echelle = { seuilSuffisance: 'M', seuilMaitrise: 'D', niveaux: NIVEAUX_RENVERSES };
        expect(w.zoneDuCodeDansNiveaux('D', [], echelle)).toBeNull();
        expect(w.zoneDuCodeDansNiveaux('D', null, echelle)).toBeNull();
    });

    it('sans échelle, elle refuse — les repères vivent sur l\'échelle, pas sur les niveaux', () => {
        const w = monter([]);
        const ranges = w.ordonnerNiveauxParPlage(NIVEAUX_RENVERSES);
        expect(w.zoneDuCodeDansNiveaux('D', ranges, null)).toBeNull();
        expect(w.zoneDuCodeDansNiveaux('D', ranges, {})).toBeNull();
    });

    it('code vide ou étranger ⇒ null, et aucun repère n\'est consulté', () => {
        const w = monter([]);
        const ranges = w.ordonnerNiveauxParPlage(NIVEAUX_RENVERSES);
        const echelle = { seuilSuffisance: 'M', seuilMaitrise: 'D' };
        expect(w.zoneDuCodeDansNiveaux('ZZZ', ranges, echelle)).toBeNull();
        expect(w.zoneDuCodeDansNiveaux('', ranges, echelle)).toBeNull();
        expect(w.zoneDuCodeDansNiveaux(null, ranges, echelle)).toBeNull();
    });

    it('aucun repère posé ⇒ null, comme pour toute échelle antérieure au lot 1', () => {
        const w = monter([]);
        const ranges = w.ordonnerNiveauxParPlage(NIVEAUX_RENVERSES);
        expect(w.zoneDuCodeDansNiveaux('I', ranges, { niveaux: NIVEAUX_RENVERSES })).toBeNull();
    });

    it('la casse et les espaces d\'un repère ne changent pas la réponse', () => {
        // Les repères sont saisis par l'utilisateur : « d » vaut « D ».
        const w = monter([]);
        const ranges = w.ordonnerNiveauxParPlage(NIVEAUX_RENVERSES);
        expect(w.zoneDuCodeDansNiveaux('D', ranges, { seuilMaitrise: ' d ' })).toBe('acquis');
        expect(w.zoneDuCodeDansNiveaux(' m ', ranges, { seuilMaitrise: 'D' })).toBe('priorite');
    });

    // ── 4. L'APERÇU NE RECOPIE PLUS LA RÈGLE ─────────────────────────────────

    it('`echelles.js` passe par la règle commune et ne compare plus les rangs lui-même', () => {
        // ⚠ Commentaires retirés AVANT d'asserter : ceux que ce chantier a posés
        // citent la règle et le nom de la fonction mot pour mot — sans ce
        // filtrage, l'assertion serait satisfaite par sa propre documentation.
        const source = fs.readFileSync(
            path.resolve(__dirname, '../../js/echelles.js'), 'utf8'
        );
        const code = source
            .replace(/\/\*[\s\S]*?\*\//g, '')
            .split('\n').map((l) => l.replace(/(^|[^:])\/\/.*$/, '$1')).join('\n');

        // L'aperçu délègue.
        expect(code).toContain('zoneDuCodeDansNiveaux');

        // Et il ne refait pas le raisonnement. Ces deux comparaisons SONT le
        // code qui a été retiré ; la validation `refusRepereEchelle`, qui teste
        // `rangSuffisance > rangMaitrise`, reste hors de portée de ce motif —
        // elle refuse une saisie incohérente, elle ne lit pas une zone.
        expect(code).not.toMatch(/>=\s*rangMaitrise/);
        expect(code).not.toMatch(/>=\s*rangSuffisant/);
    });
});
