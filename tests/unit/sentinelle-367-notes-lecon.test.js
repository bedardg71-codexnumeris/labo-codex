import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { suitDansLaFonction } from './_helpers/tranche.js';

// #367 (7 août 2026) — LES NOTES DE LEÇON : NAMESPACER **ET** COMPOSER.
//
// Deux défauts qui demandaient la même migration :
//  1. `planification_seances` n'était pas dans CLES_NAMESPACEES : `cle()` la
//     retournait NUE, donc les notes étaient partagées entre TOUS les
//     trimestres — et la démo y écrivait aussi (sonde Chromium, 4 août).
//  2. Le dictionnaire était PLAT par id de leçon, alors que ces ids
//     (`planif-noeud_N`) viennent d'un compteur PAR CARTE : deux cartes ont
//     chacune leur `planif-noeud_3`. Les notes étaient donc déjà aliassées
//     ENTRE CARTES d'un même trimestre (rouge D1, audit du 5 août).
//
// SÉMANTIQUE VERROUILLÉE ICI — chaque carte GARDE CE QU'ELLE AFFICHE. Toutes
// les cartes lisant aujourd'hui le même dictionnaire plat, une carte qui montre
// la note X pour `planif-noeud_3` doit continuer de la montrer. La migration
// FIGE l'état visible : elle ne propage rien de neuf et ne retire rien.
//
// C'est le seul chantier de la journée qui touche les données réelles de
// Grégoire. Ce qui est verrouillé en priorité : aucune perte, et l'idempotence
// (un boot répété ne doit pas réécrire par-dessus une note retouchée depuis).

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const sourceMain = readFileSync(path.join(racineProjet, 'js', 'main.js'), 'utf8');
const sourceTrimestres = readFileSync(path.join(racineProjet, 'js', 'trimestres.js'), 'utf8');
const sourceCarte = readFileSync(path.join(racineProjet, 'js', 'planification-carte.js'), 'utf8');

// --- Rejeu de la migration du boot -------------------------------------
// Le bloc vit dans main.js, hors de toute fonction exportable. On l'EXTRAIT et
// on l'exécute sur un faux stockage : ainsi le test rejoue le code réel, et non
// une réimplémentation qui divergerait en silence.
function extraireMigration() {
    const debut = sourceMain.indexOf("if (!db.getSync('migration_planification_seances_done', false)) {");
    expect(debut).toBeGreaterThan(-1);
    let profondeur = 0;
    let i = sourceMain.indexOf('{', debut);
    const depart = debut;
    for (; i < sourceMain.length; i++) {
        if (sourceMain[i] === '{') profondeur++;
        else if (sourceMain[i] === '}') { profondeur--; if (profondeur === 0) break; }
    }
    return sourceMain.slice(depart, i + 1);
}

const CODE_MIGRATION = extraireMigration();

// --- Extraction de la purge #409 ----------------------------------------
// La purge de l'archive vit HORS du bloc de migration (elle est sans drapeau,
// pour rattraper un backup réimporté). Elle a donc son propre extracteur.
// ⚠ Bornes vérifiées AVANT le slice : c'est le défaut trouvé le 8 août sur la
// sentinelle de #413 — un `indexOf` devenu -1 y découpait tout le reste du
// fichier, et l'assertion restait VERTE en ayant cessé de viser sa cible.
function finDeBloc(depuis) {
    let profondeur = 0;
    let i = sourceMain.indexOf('{', depuis);
    expect(i).toBeGreaterThan(-1);
    for (; i < sourceMain.length; i++) {
        if (sourceMain[i] === '{') profondeur++;
        else if (sourceMain[i] === '}') { profondeur--; if (profondeur === 0) return i; }
    }
    throw new Error('accolade fermante introuvable');
}

function extrairePurge409() {
    const ancre = sourceMain.indexOf('#409 (8 août 2026) — retrait de');
    expect(ancre).toBeGreaterThan(-1);
    const debut = sourceMain.indexOf('try {', ancre);
    expect(debut).toBeGreaterThan(ancre);

    // Le `catch` doit être emporté avec le `try`, sinon le fragment extrait
    // n'est pas du JS valide (« Missing catch or finally after try »).
    const finTry = finDeBloc(debut);
    const ouvertureCatch = sourceMain.indexOf('catch', finTry);
    expect(ouvertureCatch).toBeGreaterThan(finTry);
    const finCatch = finDeBloc(ouvertureCatch);
    return sourceMain.slice(debut, finCatch + 1);
}

const CODE_PURGE_409 = extrairePurge409();

function rejouerPurge409(store) {
    // ⚠ `setSync` est indispensable ICI alors que la purge ne l'appelle pas.
    // Sans lui, une purge mise SOUS DRAPEAU par mégarde poserait son drapeau via
    // un `setSync` inexistant → TypeError → avalé par le `catch` de la purge →
    // le drapeau ne serait jamais posé et le test « sans drapeau » resterait
    // VERT devant la régression même qu'il surveille. Constaté au break-test du
    // 8 août : le stub incomplet rendait la moitié comportementale aveugle.
    const db = {
        getSync: (k, d) => (k in store ? JSON.parse(JSON.stringify(store[k])) : (d !== undefined ? d : null)),
        setSync: (k, v) => { store[k] = JSON.parse(JSON.stringify(v)); },
        removeSync: (k) => { delete store[k]; }
    };
    new Function('db', 'console', '"use strict";\n' + CODE_PURGE_409)(db, console);
}

/**
 * @param {boolean} parReference Modélise le chemin `memoryCache` de `db.js`,
 *   qui garde l'objet tel quel au lieu de le sérialiser comme localStorage.
 *   C'est le SEUL harnais où le deep-copy de la migration peut manquer : un
 *   stub sérialisant recasse les références tout seul et rend le test
 *   complaisant (break-test D : retirer le clone ne rougissait rien).
 */
function rejouerMigration(store, { parReference = false } = {}) {
    const copie = (v) => (parReference ? v : JSON.parse(JSON.stringify(v)));
    const db = {
        getSync: (k, d) => (k in store ? copie(store[k]) : (d !== undefined ? d : null)),
        setSync: (k, v) => { store[k] = copie(v); }
    };
    new Function('db', 'console', '"use strict";\n' + CODE_MIGRATION)(db, console);
}

/** Un trimestre avec ses cartes et les leçons de chacune. */
function poserTrimestre(store, tid, cartes) {
    const contenu = {};
    Object.keys(cartes).forEach(cid => {
        contenu[cid] = { noeuds: cartes[cid].map(lid => ({ id: lid, type: 'lecon' })) };
    });
    store[`${tid}_planification_mindmap`] = { index: { active: Object.keys(cartes)[0], cartes: [] }, cartes: contenu };
}

let store;
beforeEach(() => {
    store = { trimestres: [{ id: 'h2026' }, { id: 'a2026' }] };
});

describe('#367 · le registre et les portes', () => {
    it('la clé est enfin déclarée namespacée', () => {
        expect(sourceTrimestres).toMatch(/CLES_NAMESPACEES[\s\S]*?'planification_seances'/);
    });

    it('plus AUCUN accès plat par id de leçon ne subsiste', () => {
        // C'est la régression à empêcher : un seul `seances[leconId]` réintroduit
        // l'aliasing entre cartes que ce chantier retire.
        expect(sourceCarte).not.toMatch(/seances\[leconId\]/);
        expect(sourceCarte).not.toMatch(/seances\[n\.id\]/);
    });

    // (Le cas « l’organisateur passe par la porte du module carte » est parti
    // avec la page « Plan de la leçon », #424 Lot G. Les cas de la migration
    // #367 ci-dessous restent entiers.)

    it('supprimer une leçon purge sa note', () => {
        expect(suitDansLaFonction(sourceCarte, /donnees\.type === 'lecon'/, /delete notes\[cleNotePurge\]/)).toBe(true);   // #616 : ordre dans la fonction, plus une distance
    });
});

describe('#409 · l’archive est retirée — le filet de #367 n’existe plus', () => {
    // Le filet a été retiré le 8 août : Grégoire a vérifié ses données réelles
    // après le premier démarrage en 1.50.0, la clé nue ne portait que des
    // productions de TEST. L'archive n'a JAMAIS eu de lecteur — c'était une
    // copie morte, sans chemin de restauration.

    it('la migration ne crée PLUS d’archive', () => {
        store['planification_seances'] = { 'planif-noeud_3': { note: 'A' } };
        poserTrimestre(store, 'h2026', { carte_1: ['planif-noeud_3'] });

        rejouerMigration(store);

        expect(store['planification_seances_archive_pre367']).toBeUndefined();
        // ⚠ Et la distribution, elle, doit être INTACTE : retirer le filet ne
        // doit pas avoir touché à ce que la migration fait vraiment.
        expect(store['h2026_planification_seances']['carte_1::planif-noeud_3']).toEqual({ note: 'A' });
    });

    it('une note ORPHELINE est désormais perdue — conséquence assumée du retrait', () => {
        // Ce test disait l'inverse jusqu'au 8 août (« survit dans l'archive »).
        // Il est retourné et NON supprimé : la portée exacte de la décision de
        // Grégoire doit rester lisible et verrouillée, pas disparaître du dépôt.
        // Si quelqu'un rétablit un filet un jour, c'est ICI que ça se discute.
        store['planification_seances'] = { 'planif-noeud_99': { note: 'orpheline' } };
        poserTrimestre(store, 'h2026', { carte_1: ['planif-noeud_3'] });

        rejouerMigration(store);

        expect(store['planification_seances_archive_pre367']).toBeUndefined();
        expect(store['h2026_planification_seances'] || {}).toEqual({});
    });

    it('la purge retire l’archive DÉJÀ stockée (1.50.0-1.55.x)', () => {
        store['planification_seances_archive_pre367'] = { 'planif-noeud_3': { note: 'A' } };

        rejouerPurge409(store);

        expect(store['planification_seances_archive_pre367']).toBeUndefined();
    });

    it('la purge est SANS DRAPEAU — un backup réimporté est rattrapé', () => {
        // C'est la raison d'être du motif : un backup Codex pris dans la fenêtre
        // du 7-8 août porte la clé. Une purge à drapeau ne repasserait jamais.
        store['planification_seances_archive_pre367'] = { 'planif-noeud_3': { note: 'A' } };
        rejouerPurge409(store);

        // Second import, plus tard : la clé revient.
        store['planification_seances_archive_pre367'] = { 'planif-noeud_7': { note: 'revenue' } };
        rejouerPurge409(store);

        expect(store['planification_seances_archive_pre367']).toBeUndefined();
        expect(CODE_PURGE_409).not.toMatch(/getSync\(\s*'migration_/);
    });

    it('la purge ne touche à RIEN d’autre', () => {
        store['planification_seances_archive_pre367'] = { 'planif-noeud_3': { note: 'A' } };
        store['h2026_planification_seances'] = { 'carte_1::planif-noeud_3': { note: 'vivante' } };
        store['planification_seances'] = {};

        rejouerPurge409(store);

        expect(store['h2026_planification_seances']).toEqual({ 'carte_1::planif-noeud_3': { note: 'vivante' } });
        expect(store['planification_seances']).toEqual({});
    });

    it('plus AUCUNE écriture de l’archive ne subsiste dans main.js', () => {
        // La régression à empêcher : réintroduire le filet « au cas où ».
        expect(sourceMain).not.toMatch(/setSync\(\s*'planification_seances_archive_pre367'/);
    });
});

describe('#367 · la migration — aucune perte', () => {
    it('la clé nue est PURGÉE — sinon la démo continuerait d’y écrire', () => {
        store['planification_seances'] = { 'planif-noeud_3': { note: 'A' } };
        poserTrimestre(store, 'h2026', { carte_1: ['planif-noeud_3'] });

        rejouerMigration(store);

        expect(store['planification_seances']).toEqual({});
    });
});

describe('#367 · la migration — chaque carte garde ce qu’elle affiche', () => {
    it('la note va dans CHAQUE carte qui possède cette leçon, sous sa propre clé', () => {
        // Le cœur de la sémantique : aujourd'hui les deux cartes affichent la
        // même note (dictionnaire partagé). Après migration, chacune garde la
        // sienne — et les éditions futures cessent de se mélanger.
        store['planification_seances'] = { 'planif-noeud_3': { note: 'partagée' } };
        poserTrimestre(store, 'h2026', { carte_1: ['planif-noeud_3'], carte_2: ['planif-noeud_3'] });

        rejouerMigration(store);

        const cible = store['h2026_planification_seances'];
        expect(cible['carte_1::planif-noeud_3']).toEqual({ note: 'partagée' });
        expect(cible['carte_2::planif-noeud_3']).toEqual({ note: 'partagée' });
    });

    it('les copies sont INDÉPENDANTES — retoucher l’une ne touche pas l’autre', () => {
        // Harnais PAR RÉFÉRENCE : le seul où l'absence de deep-copy se voit.
        // Sans lui, les deux cartes partageraient le même objet de note et
        // l'aliasing survivrait à la migration censée le supprimer.
        store['planification_seances'] = { 'planif-noeud_3': { note: 'partagée', etapes: { intro: {} } } };
        poserTrimestre(store, 'h2026', { carte_1: ['planif-noeud_3'], carte_2: ['planif-noeud_3'] });

        rejouerMigration(store, { parReference: true });

        const cible = store['h2026_planification_seances'];
        cible['carte_1::planif-noeud_3'].note = 'retouchée';
        cible['carte_1::planif-noeud_3'].etapes.intro.contenu = 'x';

        expect(cible['carte_2::planif-noeud_3'].note).toBe('partagée');
        expect(cible['carte_2::planif-noeud_3'].etapes.intro.contenu).toBeUndefined();
    });

    it('la distribution atteint TOUS les trimestres, pas seulement l’actif', () => {
        // C'est la décision de Grégoire : dupliquer vers tous.
        store['planification_seances'] = { 'planif-noeud_3': { note: 'A' } };
        poserTrimestre(store, 'h2026', { carte_1: ['planif-noeud_3'] });
        poserTrimestre(store, 'a2026', { carte_7: ['planif-noeud_3'] });

        rejouerMigration(store);

        expect(store['h2026_planification_seances']['carte_1::planif-noeud_3']).toEqual({ note: 'A' });
        expect(store['a2026_planification_seances']['carte_7::planif-noeud_3']).toEqual({ note: 'A' });
    });

    it('une leçon SANS note ne fabrique pas d’entrée vide', () => {
        store['planification_seances'] = { 'planif-noeud_3': { note: 'A' } };
        poserTrimestre(store, 'h2026', { carte_1: ['planif-noeud_3', 'planif-noeud_4'] });

        rejouerMigration(store);

        expect(Object.keys(store['h2026_planification_seances'])).toEqual(['carte_1::planif-noeud_3']);
    });

    it('les nœuds qui ne sont pas des leçons sont ignorés', () => {
        store['planification_seances'] = { 'planif-noeud_5': { note: 'A' } };
        store['h2026_planification_mindmap'] = {
            index: { active: 'carte_1', cartes: [] },
            cartes: { carte_1: { noeuds: [{ id: 'planif-noeud_5', type: 'activite' }] } }
        };

        rejouerMigration(store);

        expect(store['h2026_planification_seances']).toBeUndefined();
    });
});

describe('#367 · la migration — idempotence et innocuité', () => {
    it('ne s’exécute qu’UNE fois (drapeau posé)', () => {
        store['planification_seances'] = { 'planif-noeud_3': { note: 'A' } };
        poserTrimestre(store, 'h2026', { carte_1: ['planif-noeud_3'] });

        rejouerMigration(store);
        expect(store['migration_planification_seances_done']).toBe(true);

        // Deuxième boot : la note a été retouchée entre-temps. Rejouer ne doit
        // PAS la réécrire depuis l'archive — c'est ce qui distingue un boot
        // répété d'une restauration.
        store['h2026_planification_seances']['carte_1::planif-noeud_3'] = { note: 'retouchée' };
        rejouerMigration(store);

        expect(store['h2026_planification_seances']['carte_1::planif-noeud_3']).toEqual({ note: 'retouchée' });
    });

    it('n’écrase jamais une entrée composite déjà présente', () => {
        // Idempotence INTERNE au bloc, indépendante du drapeau.
        store['planification_seances'] = { 'planif-noeud_3': { note: 'nue' } };
        store['h2026_planification_seances'] = { 'carte_1::planif-noeud_3': { note: 'déjà là' } };
        poserTrimestre(store, 'h2026', { carte_1: ['planif-noeud_3'] });

        rejouerMigration(store);

        expect(store['h2026_planification_seances']['carte_1::planif-noeud_3']).toEqual({ note: 'déjà là' });
    });

    it('un codex SANS notes ne crée pas de clés vides', () => {
        poserTrimestre(store, 'h2026', { carte_1: ['planif-noeud_3'] });

        rejouerMigration(store);

        expect(store['h2026_planification_seances']).toBeUndefined();
        expect(store['migration_planification_seances_done']).toBe(true);
    });

    it('un trimestre sans carte est traversé sans dommage', () => {
        store['planification_seances'] = { 'planif-noeud_3': { note: 'A' } };
        store['trimestres'] = [{ id: 'h2026' }, { id: 'vide2025' }];
        poserTrimestre(store, 'h2026', { carte_1: ['planif-noeud_3'] });

        expect(() => rejouerMigration(store)).not.toThrow();
        expect(store['vide2025_planification_seances']).toBeUndefined();
        expect(store['h2026_planification_seances']['carte_1::planif-noeud_3']).toEqual({ note: 'A' });
    });
});
