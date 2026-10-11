import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';
import { tranche } from './_helpers/tranche.js';

// =====================================================================
// #1040 — UNE CLÉ NE SE RÉÉCRIT PLUS À L'IDENTIQUE À CHAQUE OUVERTURE (11 oct. 2026)
// =====================================================================
//
// Mesuré le 7 oct. (sonde WebKit, deux ouvertures) : `indicesCP` et `indicesAssiduite` écrits 5 à
// 7 fois par ouverture, `indicesPatternsRaI` une fois, avec un contenu qui ne change que par
// l'horodatage ; `trimestreActif`, `horaireHebdo`, `calendrierComplet`, `seancesCompletes_…`,
// `presences_date/groupe/tri` et, en démo, les `cartouches_…` réécrits à l'identique.
//   A — `db.setSyncSiChange` (le VRAI db.js) : n'écrit pas une valeur égale, ni un écart limité
//       aux champs ignorés (à toute profondeur) ; écrit tout autre écart, et une clé absente ;
//   B — chaque site mesuré passe par lui (ou par la même comparaison pour `indicesAssiduite`,
//       écrit par `sauvegarderDonneesSelonMode`, et par un drapeau pour la migration des cartouches).
// Aucun lecteur des horodatages : `grep "actuel.date|.dateCalcul"` ne rend que les écrivains.

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const src = (f) => readFileSync(path.join(racine, 'js', f), 'utf8');

function fauxLocalStorage() {
    const ls = {};
    return {
        ls,
        get length() { return Object.keys(ls).length; },
        key: (i) => Object.keys(ls)[i] ?? null,
        getItem: (k) => (k in ls ? ls[k] : null),
        setItem: (k, v) => { ls[k] = String(v); },
        removeItem: (k) => { delete ls[k]; }
    };
}

function monterDb() {
    const localStorage = fauxLocalStorage();
    const fenetre = { addEventListener() {}, removeEventListener() {}, dispatchEvent: () => true };
    chargerScript('js/db.js', { localStorage }, fenetre);
    const db = fenetre.db;
    const ecritures = [];
    const setSync = db.setSync.bind(db);
    db.setSync = (k, v) => { ecritures.push(k); return setSync(k, v); };
    return { db, ecritures };
}

describe('#1040 · A — db.setSyncSiChange', () => {
    it('A.a une clé absente est écrite', () => {
        const { db, ecritures } = monterDb();
        expect(db.setSyncSiChange('k', { a: 1 })).toBe(true);
        expect(ecritures).toEqual(['k']);
        expect(db.getSync('k')).toEqual({ a: 1 });
    });

    it('A.a2 une clé absente reçoit même un objet vide (l\'absence n\'est pas une valeur)', () => {
        const { db, ecritures } = monterDb();
        expect(db.setSyncSiChange('k', {})).toBe(true);
        expect(ecritures).toEqual(['k']);
    });

    it('A.b la même valeur n\'est pas réécrite', () => {
        const { db, ecritures } = monterDb();
        db.setSyncSiChange('k', { a: 1, b: [1, 2] });
        expect(db.setSyncSiChange('k', { a: 1, b: [1, 2] })).toBe('inchange');
        expect(ecritures).toEqual(['k']);
    });

    it('A.c un horodatage ignoré, même imbriqué, ne réécrit pas ; l\'ancien est gardé', () => {
        const { db, ecritures } = monterDb();
        db.setSyncSiChange('k', { dateCalcul: 'T1', X: { actuel: { date: 'T1', P: 70 } } }, ['dateCalcul', 'date']);
        expect(db.setSyncSiChange('k', { dateCalcul: 'T2', X: { actuel: { date: 'T2', P: 70 } } }, ['dateCalcul', 'date'])).toBe('inchange');
        expect(ecritures).toEqual(['k']);
        expect(db.getSync('k').dateCalcul).toBe('T1');
    });

    it('A.d un vrai changement, à côté de l\'horodatage, est écrit', () => {
        const { db, ecritures } = monterDb();
        db.setSyncSiChange('k', { dateCalcul: 'T1', X: { actuel: { date: 'T1', P: 70 } } }, ['dateCalcul', 'date']);
        db.setSyncSiChange('k', { dateCalcul: 'T2', X: { actuel: { date: 'T2', P: 71 } } }, ['dateCalcul', 'date']);
        expect(ecritures).toEqual(['k', 'k']);
        expect(db.getSync('k').X.actuel.P).toBe(71);
    });

    it('A.e sans liste d\'ignorés, un horodatage différent est un changement', () => {
        const { db, ecritures } = monterDb();
        db.setSyncSiChange('k', { dateCalcul: 'T1' });
        db.setSyncSiChange('k', { dateCalcul: 'T2' });
        expect(ecritures).toEqual(['k', 'k']);
    });
});

describe('#1040 · B — les sites mesurés', () => {
    const SITES = [
        ['trimestres.js', "db.setSyncSiChange('trimestreActif', actif.id)"],
        ['trimestre.js', "db.setSyncSiChange(cle('horaireHebdo'), toutesSeances)"],
        ['trimestre.js', "db.setSyncSiChange(cle('calendrierComplet'), calendrier)"],
        ['horaire.js', 'db.setSyncSiChange(cleOutput, seancesCompletes)'],
        ['saisie-presences.js', "db.setSyncSiChange(cle('presences_date'), dateInput.value)"],
        ['saisie-presences.js', "db.setSyncSiChange(cle('presences_groupe'), selectGroupe.value)"],
        ['saisie-presences.js', "db.setSyncSiChange(cle('presences_tri'), selectTri.value)"],
        ['profil-etudiant-actions.js', "db.setSyncSiChange(cle('indicesPatternsRaI'), patternsGroupe, ['dateCalcul'])"]
    ];
    SITES.forEach(([f, appel]) => {
        it(`B · ${f} : ${appel.slice(0, 50)}`, () => { expect(src(f)).toContain(appel); });
    });

    it('B · portfolio.js : les deux écritures d\'indicesCP ignorent les horodatages, aucune n\'écrit sans comparer', () => {
        const s = src('portfolio.js');
        expect(s.match(/db\.setSyncSiChange\(cleIndices, indicesCP, \['dateCalcul', 'date'\]\)/g) || []).toHaveLength(2);
        expect(s).not.toContain('db.setSync(cleIndices, indicesCP)');
    });

    it('B · indices.js : indicesAssiduite n\'est sauvegardé que si autre chose que dateCalcul change', () => {
        const bloc = tranche(src('indices.js'), 'function calculerEtSauvegarderIndicesAssiduite', "sauvegarderDonneesSelonMode('indicesAssiduite'");
        expect(bloc).toMatch(/JSON\.stringify\(stockees, sansDate\) !== JSON\.stringify\(indices, sansDate\)/);
    });

    it('B · cartouches.js : la migration vers la bibliothèque n\'écrit que si elle a changé quelque chose', () => {
        const bloc = tranche(src('cartouches.js'), 'async function migrerCartouchesVersBibliotheque', 'if (nbMigrees > 0)');
        expect(bloc).toContain('if (aChange && cartouches.length > 0)');
    });
});
