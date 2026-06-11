import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerCodex } from './_helpers/charger-codex.js';

/**
 * #334 session C — snapshot de fusion 3-way en index haché.
 *
 * La fusion 3-way est la fonctionnalité la plus sensible du module codex :
 * un faux positif/négatif de hash produit un faux conflit ou une détection
 * manquée. Exigence du plan §C : résultats IDENTIQUES à l'ancien algorithme
 * (ancêtre = dataset intégral, égalité JSON.stringify) sur jeu synthétique.
 *
 * Couvre :
 *   1. _indexerSnapshot — format codex-snapshot-hash-v1, hash = sha256(JSON),
 *      clés _codex_ exclues, null si entrée invalide
 *   2. _analyserFusion 3 parties — toutes les branches (ajouts 1/2 côtés,
 *      modif/modif, suppressions propres ×2, suppr+modif ×2, suppr 2 côtés,
 *      identiques, égalité JSON stricte ordre des clés inclus)
 *   3. _analyserFusion 2 parties — ancêtre null (snapshot absent ou
 *      crypto.subtle indisponible)
 *   4. Équivalence stricte avec l'ancien algorithme (ancêtre legacy converti
 *      par _indexerSnapshot)
 *   5. Sentinelles de câblage statiques — écritures via _ecrireSnapshotAvant,
 *      lectures via _lireSnapshotAvant, migration one-shot au boot, l'ancien
 *      format (dataset intégral) n'est plus jamais écrit
 */

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

let Codex;
beforeAll(() => {
    const win = chargerCodex();
    Codex = win.Codex;
});

/** sha256 hex de référence, indépendant du code testé */
async function sha256Hex(str) {
    const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return Array.from(new Uint8Array(buffer))
        .map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Ancien algorithme (HEAD avant session C, commit e80722c9), copié verbatim :
 * ancêtre = dataset intégral, comparaisons JSON.stringify. Référence
 * d'équivalence exigée par le plan §C — ne pas « simplifier ».
 */
function analyserFusionAncienne(local, externe, ancetre) {
    var toutesLesCles = new Set(
        Object.keys(local).concat(Object.keys(externe))
    );
    if (ancetre) {
        Object.keys(ancetre).forEach(function(c) { toutesLesCles.add(c); });
    }

    var resultat = {
        ajouteesLocal: [],
        ajouteesExterne: [],
        modifieesLocal: [],
        modifieesExterne: [],
        supprimeesLocal: [],
        supprimeesExterne: [],
        conflits: [],
        identiques: 0
    };

    toutesLesCles.forEach(function(cle) {
        if (cle.startsWith('_codex_')) return;

        var dansLocal = cle in local;
        var dansExterne = cle in externe;
        var dansAncetre = ancetre ? (cle in ancetre) : false;

        var jsonLocal = dansLocal ? JSON.stringify(local[cle]) : undefined;
        var jsonExterne = dansExterne ? JSON.stringify(externe[cle]) : undefined;
        var jsonAncetre = (ancetre && dansAncetre) ? JSON.stringify(ancetre[cle]) : undefined;

        if (dansLocal && dansExterne && jsonLocal === jsonExterne) {
            resultat.identiques++;
            return;
        }

        if (ancetre) {
            var localChange = jsonLocal !== jsonAncetre;
            var externeChange = jsonExterne !== jsonAncetre;

            if (!dansAncetre && dansLocal && !dansExterne) {
                resultat.ajouteesLocal.push(cle);
            } else if (!dansAncetre && !dansLocal && dansExterne) {
                resultat.ajouteesExterne.push(cle);
            } else if (!dansAncetre && dansLocal && dansExterne) {
                resultat.conflits.push(cle);
            } else if (dansAncetre && !dansLocal && dansExterne && !externeChange) {
                resultat.supprimeesLocal.push(cle);
            } else if (dansAncetre && dansLocal && !dansExterne && !localChange) {
                resultat.supprimeesExterne.push(cle);
            } else if (dansAncetre && !dansLocal && dansExterne && externeChange) {
                resultat.conflits.push(cle);
            } else if (dansAncetre && dansLocal && !dansExterne && localChange) {
                resultat.conflits.push(cle);
            } else if (dansAncetre && !dansLocal && !dansExterne) {
                resultat.identiques++;
            } else if (localChange && !externeChange) {
                resultat.modifieesLocal.push(cle);
            } else if (!localChange && externeChange) {
                resultat.modifieesExterne.push(cle);
            } else if (localChange && externeChange) {
                resultat.conflits.push(cle);
            }
        } else {
            if (dansLocal && !dansExterne) {
                resultat.ajouteesLocal.push(cle);
            } else if (!dansLocal && dansExterne) {
                resultat.ajouteesExterne.push(cle);
            } else {
                resultat.conflits.push(cle);
            }
        }
    });

    return resultat;
}

/* ─── Jeu synthétique : chaque clé exerce exactement une branche ─── */

const ANCETRE = {
    inchangee: { a: 1, liste: [1, 2, 3] },
    modifLocale: 'avant',
    modifExterne: { score: 10 },
    modifModifDifferentes: 'origine',
    modifModifMemeValeur: 'origine',
    supprLocalePropre: [1, 2],
    supprExternePropre: 'gardée localement ?  non : supprimée',
    supprLocaleModifExterne: { v: 1 },
    modifLocaleSupprExterne: { v: 1 },
    supprDeuxCotes: 'disparue partout',
    ordreCles: { a: 1, b: 2 },
    _codex_etat: { interne: 'ancetre' }
};

const LOCAL = {
    inchangee: { a: 1, liste: [1, 2, 3] },
    modifLocale: 'après-local',
    modifExterne: { score: 10 },
    modifModifDifferentes: 'version-locale',
    modifModifMemeValeur: 'convergence',
    // supprLocalePropre : absente
    supprExternePropre: 'gardée localement ?  non : supprimée',
    // supprLocaleModifExterne : absente
    modifLocaleSupprExterne: { v: 2 },
    // supprDeuxCotes : absente
    ordreCles: { a: 1, b: 2 },
    ajoutLocal: 'nouveau côté Mac',
    ajoutDeuxDifferentes: 'créée ici',
    ajoutDeuxMemeValeur: { id: 'x' },
    _codex_snapshot_avant: { interne: 'local' }
};

const EXTERNE = {
    inchangee: { a: 1, liste: [1, 2, 3] },
    modifLocale: 'avant',
    modifExterne: { score: 99 },
    modifModifDifferentes: 'version-externe',
    modifModifMemeValeur: 'convergence',
    supprLocalePropre: [1, 2],
    // supprExternePropre : absente
    supprLocaleModifExterne: { v: 7 },
    // modifLocaleSupprExterne : absente
    // supprDeuxCotes : absente
    ordreCles: { b: 2, a: 1 },   // mêmes données, JSON différent → modifiée
    ajoutExterne: 'nouveau côté iPad',
    ajoutDeuxDifferentes: 'créée là-bas',
    ajoutDeuxMemeValeur: { id: 'x' },
    _codex_etat: { interne: 'externe' }
};

describe('prérequis environnement', () => {

    it('crypto.subtle est disponible dans Node/Vitest', () => {
        expect(globalThis.crypto?.subtle).toBeDefined();
    });

    it('codex.js expose les internes de test _analyserFusion et _indexerSnapshot', () => {
        expect(typeof Codex._analyserFusion).toBe('function');
        expect(typeof Codex._indexerSnapshot).toBe('function');
    });

});

describe('_indexerSnapshot — index haché du dataset', () => {

    it('produit le format codex-snapshot-hash-v1 avec un sha256 hex par clé', async () => {
        const index = await Codex._indexerSnapshot(ANCETRE);
        expect(index.__format).toBe('codex-snapshot-hash-v1');
        expect(index.cles).toBeTypeOf('object');
        for (const hash of Object.values(index.cles)) {
            expect(hash).toMatch(/^[0-9a-f]{64}$/);
        }
        // Hash vérifié contre une implémentation de référence indépendante
        expect(index.cles.inchangee)
            .toBe(await sha256Hex(JSON.stringify(ANCETRE.inchangee)));
    });

    it('exclut les clés _codex_* (même périmètre que _analyserFusion)', async () => {
        const index = await Codex._indexerSnapshot(ANCETRE);
        expect(Object.keys(index.cles).some(c => c.startsWith('_codex_'))).toBe(false);
        expect(Object.keys(index.cles).length).toBe(Object.keys(ANCETRE).length - 1);
    });

    it('retourne null sur entrée invalide (null, non-objet)', async () => {
        expect(await Codex._indexerSnapshot(null)).toBeNull();
        expect(await Codex._indexerSnapshot('pas un dataset')).toBeNull();
    });

});

describe('_analyserFusion — diff 3 parties (ancêtre = index haché)', () => {

    let analyse;
    beforeAll(async () => {
        const index = await Codex._indexerSnapshot(ANCETRE);
        analyse = await Codex._analyserFusion(LOCAL, EXTERNE, index);
    });

    it('ajout d\'un seul côté → ajouteesLocal / ajouteesExterne', () => {
        expect(analyse.ajouteesLocal).toEqual(['ajoutLocal']);
        expect(analyse.ajouteesExterne).toEqual(['ajoutExterne']);
    });

    it('modification d\'un seul côté → modifieesLocal / modifieesExterne', () => {
        expect(analyse.modifieesLocal).toEqual(['modifLocale']);
        expect([...analyse.modifieesExterne].sort())
            .toEqual(['modifExterne', 'ordreCles']);
    });

    it('suppression propre d\'un côté, inchangée de l\'autre → suppression gardée', () => {
        expect(analyse.supprimeesLocal).toEqual(['supprLocalePropre']);
        expect(analyse.supprimeesExterne).toEqual(['supprExternePropre']);
    });

    it('conflits : modif/modif différentes, suppr+modif (les 2 sens), ajout 2 côtés différents', () => {
        expect([...analyse.conflits].sort()).toEqual([
            'ajoutDeuxDifferentes',
            'modifLocaleSupprExterne',
            'modifModifDifferentes',
            'supprLocaleModifExterne'
        ]);
    });

    it('identiques : inchangée + convergence modif/modif + ajout 2 côtés même valeur + suppr 2 côtés', () => {
        // inchangee, modifModifMemeValeur, ajoutDeuxMemeValeur, supprDeuxCotes
        expect(analyse.identiques).toBe(4);
    });

    it('l\'égalité est l\'égalité JSON stricte, ordre des clés inclus (comme avant)', () => {
        // {a,b} vs {b,a} : mêmes données, JSON différent → détectée modifiée
        expect(analyse.modifieesExterne).toContain('ordreCles');
    });

    it('les clés _codex_* sont ignorées des trois côtés', () => {
        const toutes = [
            ...analyse.ajouteesLocal, ...analyse.ajouteesExterne,
            ...analyse.modifieesLocal, ...analyse.modifieesExterne,
            ...analyse.supprimeesLocal, ...analyse.supprimeesExterne,
            ...analyse.conflits
        ];
        expect(toutes.some(c => c.startsWith('_codex_'))).toBe(false);
    });

});

describe('_analyserFusion — diff 2 parties (ancêtre null)', () => {

    let analyse;
    beforeAll(async () => {
        analyse = await Codex._analyserFusion(LOCAL, EXTERNE, null);
    });

    it('seul dans local → ajouteesLocal (suppressions indécidables sans ancêtre)', () => {
        expect([...analyse.ajouteesLocal].sort())
            .toEqual(['ajoutLocal', 'modifLocaleSupprExterne', 'supprExternePropre']);
    });

    it('seul dans externe → ajouteesExterne', () => {
        expect([...analyse.ajouteesExterne].sort())
            .toEqual(['ajoutExterne', 'supprLocaleModifExterne', 'supprLocalePropre']);
    });

    it('présent des deux côtés avec valeurs différentes → conflit', () => {
        expect([...analyse.conflits].sort()).toEqual([
            'ajoutDeuxDifferentes', 'modifExterne',
            'modifLocale', 'modifModifDifferentes', 'ordreCles'
        ]);
    });

    it('rien dans modifiees/supprimees (catégories impossibles sans ancêtre)', () => {
        expect(analyse.modifieesLocal).toEqual([]);
        expect(analyse.modifieesExterne).toEqual([]);
        expect(analyse.supprimeesLocal).toEqual([]);
        expect(analyse.supprimeesExterne).toEqual([]);
        // inchangee, modifModifMemeValeur, ajoutDeuxMemeValeur
        expect(analyse.identiques).toBe(3);
    });

});

describe('équivalence stricte avec l\'ancien algorithme (plan §C)', () => {

    it('ancêtre legacy converti par _indexerSnapshot → résultats identiques au dataset intégral', async () => {
        const ancien = analyserFusionAncienne(LOCAL, EXTERNE, ANCETRE);
        const index = await Codex._indexerSnapshot(ANCETRE);
        const nouveau = await Codex._analyserFusion(LOCAL, EXTERNE, index);
        expect(nouveau).toEqual(ancien);
    });

    it('sans ancêtre → résultats identiques à l\'ancien diff 2 parties', async () => {
        const ancien = analyserFusionAncienne(LOCAL, EXTERNE, null);
        const nouveau = await Codex._analyserFusion(LOCAL, EXTERNE, null);
        expect(nouveau).toEqual(ancien);
    });

    it('équivalence sur les cas limites : datasets vides, ancêtre seul peuplé', async () => {
        const ancien = analyserFusionAncienne({}, {}, ANCETRE);
        const nouveau = await Codex._analyserFusion({}, {}, await Codex._indexerSnapshot(ANCETRE));
        expect(nouveau).toEqual(ancien);

        const ancienVide = analyserFusionAncienne({}, {}, null);
        const nouveauVide = await Codex._analyserFusion({}, {}, null);
        expect(nouveauVide).toEqual(ancienVide);
    });

});

describe('sentinelles de câblage — js/codex.js (statique)', () => {

    const src = readFileSync(path.join(racine, 'js/codex.js'), 'utf8');

    it('l\'ancien format n\'est plus jamais écrit : aucun db.set(CLE_SNAPSHOT_AVANT, donnees)', () => {
        expect(src).not.toMatch(/db\.set\(CLE_SNAPSHOT_AVANT,\s*donnees\)/);
    });

    it('toute écriture de CLE_SNAPSHOT_AVANT passe par un index haché (2 sites : helper + migration)', () => {
        const ecritures = src.match(/db\.set\(CLE_SNAPSHOT_AVANT,\s*\w+\)/g) || [];
        expect(ecritures).toEqual([
            'db.set(CLE_SNAPSHOT_AVANT, index)',
            'db.set(CLE_SNAPSHOT_AVANT, index)'
        ]);
    });

    it('genererCodex et chargerCodex écrivent via _ecrireSnapshotAvant', () => {
        const appels = src.match(/await _ecrireSnapshotAvant\(donnees\)/g) || [];
        expect(appels.length).toBe(2);
    });

    it('toute lecture brute de CLE_SNAPSHOT_AVANT vit dans les helpers (2 sites : lecture + migration)', () => {
        const lectures = src.match(/db\.get\(CLE_SNAPSHOT_AVANT/g) || [];
        expect(lectures.length).toBe(2);
    });

    it('actionFusionner et actionComparer lisent l\'ancêtre via _lireSnapshotAvant', () => {
        const appels = src.match(/var ancetre = await _lireSnapshotAvant\(\)/g) || [];
        expect(appels.length).toBe(2);
    });

    it('la migration one-shot du snapshot legacy est câblée au boot (initialiserCodex)', () => {
        expect(src).toMatch(/^\s*_migrerSnapshotVersIndexHash\(\);/m);
    });

});
