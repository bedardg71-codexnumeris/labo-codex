import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const dossierJs = path.join(racineProjet, 'js');

// #328 L2-a — dégonflage du miroir, premiers champs (11 juin 2026).
//
// Verrouille :
//  1. Les champs miroirs `pratiqueId` et `approcheEvaluation` ne sont PLUS
//     écrits dans les modalités (zéro lecteur — leur SSOT vit dans
//     groupesCours[].pratiqueId et pratique.configuration). Toute
//     réintroduction = régression du dégonflage.
//  2. Plus aucune lecture de `modalites.pratiqueId` dans js/.
//  3. `obtenirPratiqueActiveGroupeCours` (modes.js) résout par la SSOT
//     `groupesCours` AVANT les copies (gcActif/infoCours.pratiqueId) — même
//     patron que le fix #332 (horaireId). Le fallback mort
//     `modalites.pratiqueNotation` est retiré.

function listerFichiersJs(dossier) {
    const resultats = [];
    for (const entree of fs.readdirSync(dossier, { withFileTypes: true })) {
        const chemin = path.join(dossier, entree.name);
        if (entree.isDirectory()) resultats.push(...listerFichiersJs(chemin));
        else if (entree.name.endsWith('.js')) resultats.push(chemin);
    }
    return resultats;
}

function scanner(motif) {
    const touches = [];
    for (const fichier of listerFichiersJs(dossierJs)) {
        const relatif = path.relative(racineProjet, fichier).split(path.sep).join('/');
        fs.readFileSync(fichier, 'utf8').split('\n').forEach((ligne, i) => {
            if (motif.test(ligne)) touches.push(`${relatif}:${i + 1}`);
        });
    }
    return touches;
}

describe('Sentinelle SSOT · miroir modalitesEvaluation (L2-a, statique)', () => {

    it('plus aucune écriture des champs miroirs pratiqueId / approcheEvaluation dans les mutateurs', () => {
        // m.<champ> = ... est la forme des mutateurs du module propriétaire.
        const ecritures = scanner(/\bm\.(pratiqueId|approcheEvaluation)\s*=/);
        expect(ecritures, 'champs miroirs morts réintroduits').toEqual([]);
    });

    it('plus aucune lecture de modalites.pratiqueId', () => {
        // Lectures sur l'objet modalités, quel que soit le nom de variable usuel.
        const lectures = scanner(/\b(modalites|mods|modalitesTab|configBeta)\.pratiqueId\b/);
        expect(lectures, 'lecture du miroir pratiqueId').toEqual([]);
    });

    it('le fallback mort modalites.pratiqueNotation est purgé', () => {
        const lectures = scanner(/\.pratiqueNotation\b/);
        expect(lectures, 'fallback pratiqueNotation réintroduit').toEqual([]);
    });

    it('le seed démo ne porte plus les champs miroirs morts', () => {
        const seed = fs.readFileSync(path.join(dossierJs, 'pack-demo-10.js'), 'utf8');
        expect(seed.includes('"pratiqueId": "demo-std-litt"')).toBe(false);
        expect(seed.includes('"approcheEvaluation": "par-artefacts"')).toBe(false);
    });

});

describe('lirePointeurPratiqueGroupeCours — priorité SSOT (fonctionnel ; lot N1b, 21 sept. 2026 : obtenirPratiqueActiveGroupeCours et son repli « sommative » sont retirés)', () => {

    // store initialisé AVANT le chargement : modes.js lit db.getSync au load
    // (modeApplication). beforeEach le réinitialise ensuite pour chaque cas.
    let store = {};
    const db = {
        getSync: (k, def) => (k in store ? store[k] : (def !== undefined ? def : null)),
        // #447 : le vrai `db` signale chaque écriture (crochet d'invalidation
        // du cache de lecture #397) — le stub le reproduit pour rester fidèle.
        _surEcriture: null,
        surEcriture(rappel) { this._surEcriture = typeof rappel === 'function' ? rappel : null; },
        setSync(k, v) {
            if (typeof this._surEcriture === 'function') this._surEcriture(k);
            store[k] = v;
        }
    };
    const cle = (k) => 't1_' + k;

    // Stubs des globaux que modes.js touche au chargement (préférences, UI).
    const win = chargerScript('js/modes.js', {
        db, cle,
        obtenirPreference: () => null,
        definirPreference: () => {},
        echapperHtml: (s) => String(s == null ? '' : s),
        notifications: { erreur: () => {}, succes: () => {}, warning: () => {}, info: () => {} }
    });

    beforeEach(() => { store = {}; });

    it('désync copie/SSOT → la SSOT gagne (même patron que #332)', () => {
        store['groupeCoursActif'] = { id: 'GC1', pratiqueId: 'COPIE_PERIMEE' };
        store['t1_groupesCours'] = [{ id: 'GC1', pratiqueId: 'SSOT_A_JOUR' }];
        expect(win.lirePointeurPratiqueGroupeCours()).toBe('SSOT_A_JOUR');
    });

    it('GC trouvé dans la SSOT sans pratiqueId → null (AUCUN repli, lot N1b ; avant : « sommative »), la copie ne contredit pas', () => {
        store['groupeCoursActif'] = { id: 'GC1', pratiqueId: 'COPIE_PERIMEE' };
        store['t1_groupesCours'] = [{ id: 'GC1' }];
        expect(win.lirePointeurPratiqueGroupeCours()).toBeNull();
    });

    it('GC introuvable dans la SSOT → copies en dernier recours (gcActif puis infoCours)', () => {
        store['groupeCoursActif'] = { id: 'GC_FANTOME', pratiqueId: 'P_COPIE' };
        store['t1_groupesCours'] = [{ id: 'GC1', pratiqueId: 'AUTRE' }];
        expect(win.lirePointeurPratiqueGroupeCours()).toBe('P_COPIE');

        store['groupeCoursActif'] = { id: 'GC_FANTOME' };
        store['infoCours'] = { pratiqueId: 'P_INFOCOURS' };
        expect(win.lirePointeurPratiqueGroupeCours()).toBe('P_INFOCOURS');
    });

    it('rien de configuré → null (AUCUN repli, lot N1b ; avant : « sommative ») ; pratiqueNotation du miroir IGNORÉ', () => {
        store['t1_modalitesEvaluation'] = { pratiqueNotation: 'fantome' };
        expect(win.lirePointeurPratiqueGroupeCours()).toBeNull();
    });

});

