/**
 * SENTINELLE #913 — LES RÉSULTATS ULTÉRIEURS DANS L'EXPORT DE RECHERCHE, ET LE STOCK QUE #913 A LAISSÉ (17 sept. 2026).
 *
 * ⚠ RÉANCRÉE AU LOT 3 DE #915 (18 sept. 2026). Le bloc « Résultats ultérieurs » du Cadre et son module
 * (l'ancien resultats-ulterieurs.js) sont RETIRÉS : la saisie vit dans le registre longitudinal, et ses essais
 * (forme, note, retrait, rendu) dans sentinelle-915-registre-longitudinal-lot3.test.js. Les essais d'ici qui
 * attendaient l'écriture namespacée `<trim>_resultatsUlterieurs` n'avaient plus d'objet : ce n'est pas une régression,
 * c'est le chantier qui retire ce qu'il remplace. Ce que cette sentinelle tient désormais :
 *   1. l'export : `observations.etudiants[].resultats_ulterieurs`, liste vide quand il n'y a rien, `version_format` 1.2,
 *      AUCUN DA dans le fichier produit (verrou structurel sur le JSON rendu) — le stock de #913 sort toujours, en repli ;
 *   2. lot 3, [A1] du cadrage : l'export porte une note du REGISTRE et une note du stock #913, en union sans doublon ;
 *      une fois le stock repris par le registre (`reprise913`), le registre fait foi seul ;
 *   3. la clé `<trim>_resultatsUlterieurs` reste au registre des clés (le stock existe chez les gens et voyage avec
 *      l'archive), mais PLUS PERSONNE NE L'ÉCRIT ; l'ancien module, sa balise, sa zone du Cadre ont disparu.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { monter, storeBase, RACINE } from './_helpers/bac-suivi.js';

const lire = (f) => readFileSync(path.join(RACINE, f), 'utf8');

/* ---------- L'export de recherche : le VRAI exporterFormatRecherche, et le fichier qu'il fabrique ---------- */

const ELEVES = [
    { da: '2000001', nom: 'Tremblay-Banc', prenom: 'Alice', groupe: '01', coursId: 'GC1', statut: 'actif' },
    { da: '2000002', nom: 'Gagnon-Banc', prenom: 'Bruno', groupe: '01', coursId: 'GC1', statut: 'actif' }
];

async function exporter(resultats, registre) {
    const store = storeBase();
    if (registre) store.registreLongitudinal = registre;
    store.trimestres = [{ id: 'test', nom: 'Automne banc', session: 'A', annee: 2025, actif: true }];
    store.cours = [{ id: 'GC1', sigle: '601-101', titre: 'Cours banc', groupe: '01', actif: true }];
    store.test_groupeEtudiants = ELEVES;
    store.test_snapshots = { hebdomadaires: [], interventions: [] };
    if (resultats) store.test_resultatsUlterieurs = resultats;
    const blobs = [];
    function Blob(parts) { blobs.push(parts.join('')); }
    const b = monter(store, {
        modules: ['js/indices.js', 'js/trimestres.js'],
        globaux: { Blob, URL: { createObjectURL: () => 'blob:banc', revokeObjectURL() {} }, crypto: globalThis.crypto, TextEncoder }
    });
    try {
        const issue = await b.win.exporterFormatRecherche({ cleSecrete: 'CLE-DE-BANC-0123456789abcdefghij' });
        expect(issue, JSON.stringify(issue)).toMatchObject({ success: true });
        const fichier = JSON.parse(blobs[0]);
        const table = JSON.parse(blobs[1]);
        const parDA = Object.fromEntries(fichier.observations.etudiants.map((e) => [table.correspondances[e.id_anonyme], e]));
        return { texte: blobs[0], fichier, table, parDA };
    } finally {
        b.restaurerHorloge();
    }
}

describe('#913 — la sortie dans l\'export de recherche', () => {
    const RESULTATS = { '2000001': [
        { cours: '601-102-MQ', trimestre: 'H2026', note: 78.5, intrus: 'ne voyage pas' },
        { cours: '601-103-MQ', trimestre: 'A2026', note: 64 }
    ] };

    it('les résultats sortent sous le BON élève anonymisé, trois champs recopiés, rien d\'autre', async () => {
        const { parDA } = await exporter(RESULTATS);
        expect(parDA['2000001'].resultats_ulterieurs).toEqual([
            { cours: '601-102-MQ', trimestre: 'H2026', note: 78.5 },
            { cours: '601-103-MQ', trimestre: 'A2026', note: 64 }
        ]);
    });

    it('un élève sans résultat sort avec une liste vide, jamais avec un champ absent', async () => {
        const { parDA, fichier } = await exporter(RESULTATS);
        expect(parDA['2000002'].resultats_ulterieurs).toEqual([]);
        const sans = await exporter(null);
        for (const e of sans.fichier.observations.etudiants) expect(e.resultats_ulterieurs).toEqual([]);
        for (const e of fichier.observations.etudiants) expect(Object.keys(e)).toContain('resultats_ulterieurs');
    });

    it('version_format passe à 1.2', async () => {
        expect((await exporter(RESULTATS)).fichier.meta.version_format).toBe('1.2');
    });

    it('VERROU STRUCTUREL : aucun DA, aucun nom dans le fichier produit', async () => {
        const { texte, table } = await exporter(RESULTATS);
        for (const e of ELEVES) {
            expect(texte, 'DA ' + e.da).not.toContain(e.da);
            expect(texte, 'nom ' + e.nom).not.toContain(e.nom);
            expect(texte, 'prénom ' + e.prenom).not.toContain(e.prenom);
        }
        // Aucune clé du fichier ne ressemble à un DA (la forme rangée est { [da]: … } : elle ne doit pas sortir telle quelle).
        expect(texte).not.toMatch(/"\d{7}"\s*:/);
        expect(Object.values(table.correspondances)).toContain('2000001');
    });
});

describe('#915 lot 3 — l\'export lit le registre par DA, et l\'ancienne clé en repli', () => {
    const STOCK_913 = { '2000001': [{ cours: '601-102-MQ', trimestre: 'H2026', note: 78.5 }], '2000002': [{ cours: '601-102-MQ', trimestre: 'H2026', note: 51 }] };
    const registre = (eleve) => ({ format: 'registre-longitudinal', version: 1, modeles: { grilles: {}, echelles: {} },
        eleves: { '2000001': Object.assign({ da: '2000001', nom: 'Tremblay-Banc', prenom: 'Alice', inscritLe: '2026-09-18', dossiers: [] }, eleve) } });

    it('[A1] une note saisie dans le registre ET une note du stock #913 sortent toutes deux, sans doublon, trois champs', async () => {
        const { parDA } = await exporter(STOCK_913, registre({ resultatsUlterieurs: [
            { cours: '601-103-MQ', trimestre: 'A2026', note: 64, intrus: 'ne voyage pas' },
            { cours: '601-102-MQ', trimestre: 'H2026', note: 78.5 } // la même que le stock : UNE sortie
        ] }));
        expect(parDA['2000001'].resultats_ulterieurs).toEqual([
            { cours: '601-103-MQ', trimestre: 'A2026', note: 64 },
            { cours: '601-102-MQ', trimestre: 'H2026', note: 78.5 }
        ]);
        // Un·e élève NON inscrit·e : l'ancienne clé seule, comme avant le lot 3 — sans elle, sa note disparaîtrait en silence.
        expect(parDA['2000002'].resultats_ulterieurs).toEqual([{ cours: '601-102-MQ', trimestre: 'H2026', note: 51 }]);
    });

    it('stock repris (`reprise913`) : le registre fait foi — un résultat retiré là-bas ne revient pas par l\'ancienne clé', async () => {
        const { parDA } = await exporter(STOCK_913, registre({ reprise913: true, resultatsUlterieurs: [{ cours: '601-103-MQ', trimestre: 'A2026', note: 64, origine: 'cadre' }] }));
        expect(parDA['2000001'].resultats_ulterieurs).toEqual([{ cours: '601-103-MQ', trimestre: 'A2026', note: 64 }]);
        expect(parDA['2000002'].resultats_ulterieurs).toEqual([{ cours: '601-102-MQ', trimestre: 'H2026', note: 51 }]);
    });

    it('un registre étranger ou illisible : l\'export retombe sur l\'ancienne clé, sans planter', async () => {
        for (const etranger of [[], { format: 'autre', eleves: {} }, { format: 'registre-longitudinal' }]) {
            const { parDA } = await exporter(STOCK_913, etranger);
            expect(parDA['2000001'].resultats_ulterieurs).toEqual([{ cours: '601-102-MQ', trimestre: 'H2026', note: 78.5 }]);
        }
    });

    it('VERROU STRUCTUREL : le registre (rangé par DA, avec noms) ne fait sortir ni DA ni nom ; version_format reste 1.2', async () => {
        const { texte, fichier } = await exporter(STOCK_913, registre({ resultatsUlterieurs: [{ cours: '601-103-MQ', trimestre: 'A2026', note: 64 }] }));
        for (const e of ELEVES) {
            expect(texte, 'DA ' + e.da).not.toContain(e.da);
            expect(texte, 'nom ' + e.nom).not.toContain(e.nom);
        }
        expect(texte).not.toMatch(/"\d{7}"\s*:/);
        expect(texte).not.toMatch(/reprise913|inscritLe|origine/);
        expect(fichier.meta.version_format).toBe('1.2');
    });
});

describe('#913 — ce qui reste du bloc du Cadre : un stock LU, plus aucun écrivain', () => {
    it('la clé est toujours au registre de trimestres.js et à DATA-OWNERSHIP : le stock voyage avec l\'archive du trimestre', () => {
        expect(lire('js/trimestres.js')).toMatch(/'resultatsUlterieurs',/);
        expect(lire('docs/DATA-OWNERSHIP.md')).toMatch(/`<trim>_resultatsUlterieurs`/);
    });

    it('seuls registre-longitudinal.js et trimestres.js nomment la clé, et AUCUN ne l\'écrit', () => {
        const nomment = [];
        const parcourir = (dossier) => {
            for (const f of readdirSync(path.join(RACINE, dossier), { withFileTypes: true })) {
                const chemin = dossier + '/' + f.name;
                if (f.isDirectory()) parcourir(chemin);
                else if (f.name.endsWith('.js') && /['"`]resultatsUlterieurs['"`]/.test(lire(chemin))) nomment.push(chemin);
            }
        };
        parcourir('js');
        // #976 (8 oct. 2026) : « Corriger le DA… » renomme le DA dans ce stock comme dans toute clé du
        // trimestre qui le porte (rien ne reste sous l'ancien DA) ; il n'y ajoute ni n'y retire rien.
        // #1021 (9 oct. 2026) : l'archive d'un groupe la FILTRE par élève (elle partait entière) ;
        // elle y figure une fois, dans la liste des clés par DA, et n'est jamais écrite.
        expect(nomment.sort()).toEqual(['js/correction-da.js', 'js/registre-longitudinal.js', 'js/reserve.js', 'js/trimestres.js']);
        const reserve = lire('js/reserve.js').split('\n').filter((l) => /resultatsUlterieurs/.test(l));
        expect(reserve).toEqual(["    'resultatsUlterieurs',"]);
        const correction = lire('js/correction-da.js').split('\n').filter((l) => /resultatsUlterieurs/.test(l));
        expect(correction).toHaveLength(1);
        expect(correction[0]).toMatch(/^\s*\{ nom: 'resultatsUlterieurs', categorie: 'resultats', deplacer: cleDObjet \},$/);
        expect(lire('js/trimestres.js')).not.toMatch(/(set|setSync|remove|removeSync)\([^)]*resultatsUlterieurs/);
        // Dans le registre, l'ancienne clé ne passe QUE par lireDe (lecture par cleSource) : une déclaration, un usage.
        const module = lire('js/registre-longitudinal.js');
        const usages = module.split('\n').filter((l) => /\bNOM_CLE_913\b/.test(l) && !/^\s*(\/\/|\*)/.test(l));
        expect(usages).toHaveLength(2);
        expect(usages[0]).toMatch(/^\s*const NOM_CLE_913 = 'resultatsUlterieurs';/);
        expect(usages[1]).toMatch(/lireDe\(t\.id, NOM_CLE_913, \{\}\)/);
    });

    it('zéro-dette : l\'ancien module, sa balise, sa zone du Cadre, ses appels et ses styles ont disparu', () => {
        expect(existsSync(path.join(RACINE, 'js/resultats-ulterieurs.js'))).toBe(false);
        expect(existsSync(path.join(RACINE, 'tests/integration/resultats-ulterieurs-913.spec.js'))).toBe(false);
        const index = lire('index.html');
        expect(index).not.toMatch(/resultats-ulterieurs/);
        expect(lire('js/trimestre-v2-etudiants.js')).not.toMatch(/ResultatsUlterieurs|Résultats ultérieurs/);
        expect(lire('styles.css')).not.toMatch(/^\s*\.ru-/m);
        for (const nom of ['afficherResultatsUlterieurs', 'ajouterResultatUlterieur', 'retirerResultatUlterieur', 'obtenirResultatsUlterieurs']) {
            expect(lire('js/registre-longitudinal.js'), nom).not.toContain(nom);
            expect(index, nom).not.toContain(nom);
        }
    });
});
