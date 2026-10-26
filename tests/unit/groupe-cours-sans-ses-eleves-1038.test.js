/**
 * #1038 (26 oct. 2026) — LE GROUPE-COURS QUI NAÎT SANS SES ÉLÈVES (la source).
 *
 * Mathieu a créé le groupe-cours « 203-SN4-DM + 00001 » alors que les élèves de 00001 étaient
 * rattachés à 203-GM6-DM : groupe-cours vide, sélecteur « Production » de l'import vide, sans un
 * mot. Deux fonctions pures portent les deux décisions du lot (consigne de Cowork du 26 oct.) :
 *  A. `repartitionGroupeParCoursV2` (trimestre-v2-etudiants.js) — où sont les élèves d'un numéro,
 *     cours par cours, selon la règle de la liste du Cadre (`_ficheEstDuGroupeV2`) ;
 *  B. `productionsRangeesAilleurs` (modes.js) — les productions que le filtre de cours écarte toutes.
 * Les mots de l'écran sont lus par la spec Playwright `groupe-cours-sans-ses-eleves-1038.spec.js`.
 * Noms fictifs.
 */
import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

const normaliserNumeroGroupe = (g) => String(g || '').padStart(5, '0');

function chargerEtudiants() {
    const store = { cours: [{ id: 'C_GM6', codeCours: '203-GM6-DM', nomCours: 'Cours fictif A' }] };
    return chargerScript('js/trimestre-v2-etudiants.js', {
        normaliserNumeroGroupe,
        db: { getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)), setSync() {} },
        document: { getElementById: () => null, addEventListener() {}, querySelectorAll: () => [] }
    }, { addEventListener() {} });
}

function chargerModes() {
    const win = { addEventListener() {}, removeEventListener() {}, obtenirTrimestreId: () => 'test', cle: (k) => 'test_' + k };
    chargerScript('js/modes.js', {
        db: { getSync: (k, d) => d, setSync() {} }, cle: win.cle, obtenirPreference: () => null, definirPreference() {},
        document: { getElementById: () => null, addEventListener() {}, querySelector: () => null, querySelectorAll: () => [], body: { setAttribute() {}, classList: { add() {}, remove() {}, toggle() {} } } },
        doitRegenerer: false
    }, win);
    return win;
}

const eleve = (da, groupe, coursId) => ({ da, groupe, coursId, nom: 'Fictif', prenom: 'Élève' + da });

describe('#1038 A — la répartition d\'un numéro de groupe par cours', () => {
    const { repartitionGroupeParCoursV2: repartir, libelleCoursParIdV2 } = chargerEtudiants();

    it('la séquence de Mathieu : 00001 n\'a personne dans SN4, ses élèves sont dans GM6', () => {
        const eleves = [eleve('1', '00001', 'C_GM6'), eleve('2', '00001', 'C_GM6'), eleve('3', '00001', 'C_GM6')];
        expect(repartir(eleves, 'C_SN4', '00001')).toEqual({ duCours: 0, sansCours: 0, ailleurs: [{ coursId: 'C_GM6', n: 3 }] });
    });

    it('le numéro se compare normalisé (« 1 » est « 00001 »), comme dans la liste du Cadre', () => {
        expect(repartir([eleve('1', '1', 'C_GM6')], 'C_SN4', '00001').ailleurs).toEqual([{ coursId: 'C_GM6', n: 1 }]);
        expect(repartir([eleve('1', '1', 'C_SN4')], 'C_SN4', '00001').duCours).toBe(1);
    });

    it('les élèves d\'un autre numéro ne comptent pas', () => {
        expect(repartir([eleve('1', '00002', 'C_GM6')], 'C_SN4', '00001')).toEqual({ duCours: 0, sansCours: 0, ailleurs: [] });
    });

    it('une fiche sans coursId (stock d\'avant #887) est comptée à part', () => {
        expect(repartir([eleve('1', '00001', undefined), eleve('2', '00001', 'C_GM6')], 'C_SN4', '00001'))
            .toEqual({ duCours: 0, sansCours: 1, ailleurs: [{ coursId: 'C_GM6', n: 1 }] });
    });

    it('plusieurs autres cours : un compte par cours', () => {
        const eleves = [eleve('1', '00001', 'C_GM6'), eleve('2', '00001', 'C_XXX'), eleve('3', '00001', 'C_GM6')];
        expect(repartir(eleves, 'C_SN4', '00001').ailleurs).toEqual([{ coursId: 'C_GM6', n: 2 }, { coursId: 'C_XXX', n: 1 }]);
    });

    it('les deux cours bien rangés : le groupe a ses élèves dans le cours choisi', () => {
        const eleves = [eleve('1', '00001', 'C_GM6'), eleve('2', '00001', 'C_SN4')];
        expect(repartir(eleves, 'C_SN4', '00001')).toEqual({ duCours: 1, sansCours: 0, ailleurs: [{ coursId: 'C_GM6', n: 1 }] });
    });

    it('le libellé d\'un cours est celui de la zone d\'import ; un cours introuvable : « Cours <id> »', () => {
        expect(libelleCoursParIdV2('C_GM6')).toBe('203-GM6-DM Cours fictif A');
        expect(libelleCoursParIdV2('C_INCONNU')).toBe('Cours C_INCONNU');
    });
});

describe('#1038 B — les productions que le filtre de cours écarte toutes', () => {
    const { productionsRangeesAilleurs: ailleurs } = chargerModes();
    const prod = (id, coursId) => ({ id, titre: 'Production fictive ' + id, coursId });

    it('la séquence de Mathieu : la seule production est sous GM6, le cours actif est SN4', () => {
        expect(ailleurs([prod('P1', 'C_GM6')], 'C_SN4')).toEqual([{ coursId: 'C_GM6', n: 1 }]);
    });

    it('rien à dire quand le cours actif a au moins une production', () => {
        expect(ailleurs([prod('P1', 'C_GM6'), prod('P2', 'C_SN4')], 'C_SN4')).toEqual([]);
    });

    it('rien à dire quand une production n\'a pas de cours : le filtre la laisse passer', () => {
        expect(ailleurs([prod('P1', 'C_GM6'), prod('P2', undefined)], 'C_SN4')).toEqual([]);
    });

    it('rien à dire sans production, ni sans cours actif', () => {
        expect(ailleurs([], 'C_SN4')).toEqual([]);
        expect(ailleurs(null, 'C_SN4')).toEqual([]);
        expect(ailleurs([prod('P1', 'C_GM6')], '')).toEqual([]);
    });

    it('plusieurs cours : un compte par cours', () => {
        expect(ailleurs([prod('P1', 'C_GM6'), prod('P2', 'C_XXX'), prod('P3', 'C_GM6')], 'C_SN4'))
            .toEqual([{ coursId: 'C_GM6', n: 2 }, { coursId: 'C_XXX', n: 1 }]);
    });
});
