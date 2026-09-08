/**
 * SENTINELLE #785 — LA SONDE DES DEUX INSTANCES NE SORT AUCUNE DONNÉE PERSONNELLE,
 * ET SA SIGNATURE ARRIVE ENTIÈRE.
 *
 * `scripts/diagnostic-785-presences-deux-instances.js` est fait pour être collé dans la console PUIS COPIÉ dans une
 * conversation : sa sortie voyage. Deux invariants la rendent sûre et utile, et tous deux se cassent en silence.
 *
 * (1) AUCUNE DONNÉE PERSONNELLE. Ni DA, ni nom, ni note de présence — que des comptes, des dates et des sommes.
 *     Motif, mesuré le 7 septembre 2026 : le plan de purge #781 transportait lui-même les 19 DA qu'il devait
 *     effacer. Un rapport ne doit pas porter ce qu'il mesure. Il suffirait d'échanger `s.das.size` contre la liste
 *     des DA pour que la fuite passe inaperçue — la sortie resterait plausible.
 *
 * (2) LA SIGNATURE PART SEULE DANS SON PROPRE `console.log`. C'est le bloc qui sert à comparer les deux instances.
 *     La première version rendait tout en un seul appel : le 8 septembre, Chrome a tronqué les DEUX sorties en plein
 *     `h2026` et la signature n'est jamais arrivée. La sonde a donc échoué à faire la seule chose qu'on lui demandait,
 *     sans qu'aucune erreur ne s'affiche.
 *
 * ⚠ CE QUE CE BANC A APPRIS SUR LUI-MÊME. Sa première version testait que le bloc COMMENÇAIT par « ==== SIGNATURE » :
 * le break-test (2) est passé VERT, parce que la signature ouvrait encore son bloc — tout la suivait simplement
 * dedans. Un test tautologique, trouvé en le cassant. « Seule dans son bloc » veut dire qu'elle l'OUVRE et le FERME.
 *
 * Break-tests, joués le 8 septembre 2026, les trois ROUGES, témoin vert avant et après, source restaurée à
 * empreinte identique :
 *   A · `console.log(texteSignature…)` → `L(texteSignature…)`      → rouge (du texte suit la signature)
 *   B · `s.das.size` → `Array.from(s.das).join('/')`               → rouge (un DA sort)
 *   C · l'écart de `demo` désactivé                                → rouge (demo déroulé sans le dire)
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import vm from 'node:vm';

const CHEMIN = resolve(__dirname, '../../scripts/diagnostic-785-presences-deux-instances.js');

const DA_TEMOIN = '1234567';
const NOTE_TEMOIN = 'NOTE PRIVÉE DE L’ENSEIGNANT';

/** Exécute la sonde dans un bac étanche et rend les blocs qu'elle a émis. */
function jouerLaSonde() {
    const store = {
        a2026_presences: [
            { date: '2026-08-21', da: DA_TEMOIN, periodesPresentes: 2, coursId: 'h2026-x-00001', notes: NOTE_TEMOIN },
            { date: '2026-08-21', da: '7654321', periodesPresentes: 2, coursId: 'h2026-x-00001' },
            { date: '2026-09-01', da: DA_TEMOIN, periodesPresentes: 2, coursId: 'h2026-x-00001', facultatif: true }
        ],
        h2026_presences: [{ date: '2026-01-22', da: '1110000', periodesPresentes: 2, coursId: 'h2026-x-00001' }],
        demo_presences: [{ date: '2025-08-25', da: '9990000', periodesPresentes: 2, coursId: 'demo-cours' }]
    };

    const blocs = [];
    const bac = {
        console: { log: (s) => blocs.push(String(s)) },
        location: { origin: 'https://app.codexnumeris.org', protocol: 'https:', pathname: '/' },
        Date, Map, Set, Array, Object, Math, parseFloat, isFinite, String, RegExp, JSON
    };
    bac.window = bac;
    bac.globalThis = bac;
    bac.VERSION_MAJEURE = '1.124.3';
    bac.BUILD_ID = '0907-1325';
    bac.trimestreActif = 'a2026';
    bac.db = {
        keysSync: () => Object.keys(store),
        getSync: (k, d) => (k in store ? store[k] : d)
    };

    vm.createContext(bac);
    vm.runInContext(readFileSync(CHEMIN, 'utf8'), bac);
    return blocs;
}

describe('#785 · la sonde des deux instances', () => {
    it('ne laisse sortir NI un DA, NI une note de présence', () => {
        const tout = jouerLaSonde().join('\n');
        expect(tout).not.toContain(DA_TEMOIN);
        expect(tout).not.toContain(NOTE_TEMOIN);
        // Et elle rend bien le COMPTE à leur place : deux élèves, quatre périodes.
        expect(tout).toContain('2026-08-21 · h2026…0001 · 2 él · 4 pér');
    });

    it('émet la SIGNATURE seule dans son bloc — elle l’ouvre ET elle la ferme', () => {
        const blocs = jouerLaSonde();
        const sig = blocs.filter((b) => b.includes('==== SIGNATURE'));
        expect(sig).toHaveLength(1);
        expect(sig[0].startsWith('==== SIGNATURE')).toBe(true);
        // Le second test est celui qui a manqué au premier jet : sans lui, remettre
        // la signature dans le flux commun passait pour vert.
        expect(sig[0].trimEnd().endsWith('==== FIN SIGNATURE ====')).toBe(true);
    });

    it('découpe sa sortie en plusieurs blocs, pour qu’aucun ne soit tronqué', () => {
        expect(jouerLaSonde().length).toBeGreaterThanOrEqual(4);
    });

    it('déroule le trimestre ACTIF, résume les autres, et DIT ce qu’elle écarte', () => {
        const tout = jouerLaSonde().join('\n');
        expect(tout).toContain('a2026 · 2026-08-21');        // actif → déroulé
        expect(tout).toContain('h2026 · RÉSUMÉ');            // autre → résumé
        expect(tout).toContain('écartés : demo');            // écarté → et signalé
        expect(tout).not.toContain('demo · 2025-08-25');     // …donc pas déroulé
    });

    it('compte les présences facultatives sans les confondre avec les périodes', () => {
        expect(jouerLaSonde().join('\n')).toContain('2026-09-01 · h2026…0001 · 1 él · 2 pér · 1 fac');
    });

    it('n’écrit RIEN : aucun appel d’écriture n’existe dans la source', () => {
        const src = readFileSync(CHEMIN, 'utf8');
        // Les commentaires expliquent POURQUOI elle n'écrit pas ; on ne cherche
        // donc que du code appelant, pas la mention des mots.
        expect(src).not.toMatch(/\bdb\s*\.\s*(set|setSync|modifier|supprimer|remove|clear)\s*\(/);
        expect(src).not.toMatch(/\blocalStorage\s*\.\s*(setItem|removeItem|clear)\s*\(/);
    });
});
