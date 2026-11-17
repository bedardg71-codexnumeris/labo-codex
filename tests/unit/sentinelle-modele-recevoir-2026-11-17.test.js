import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

// =====================================================================
// LE MODÈLE DE « RECEVOIR » (« JE REGARDE », 17 NOV. 2026) — LE MATÉRIEL CONFRONTÉ À LA CONSIGNE
// =====================================================================
// plans de travail/CONSIGNE-LOT-2026-11-17-je-regarde-recevoir.md, décisions 3, 5 et 7 :
//   · le tableau des sept évaluations de l'exemple (niveaux validés par Grégoire) ;
//   · les trois copies : leurs noms (la date ramenée en 2025, mesure 3.4), et leurs octets, ceux des PDF du matériel ;
//   · la copie travaillée (Loutre Enjouée) ; la personne évaluée au modèle d'« Évaluer » (Yack Amical, décision du
//     17 nov.) n'est pas une des trois copies.
// Break-tests (17 nov. 2026) : le niveau Nuance de Caribou Attentionné passé de I à D dans
// js/parcours-recevoir-modele.js → ROUGE (« le tableau ») ; un octet changé dans la base64 de la copie de Tapir Doux →
// ROUGE (« octet pour octet »). Rétablis → vert.

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lire = (f) => readFileSync(path.join(RACINE, f), 'utf8');
const CONSIGNE = lire('plans de travail/CONSIGNE-LOT-2026-11-17-je-regarde-recevoir.md');
const DOSSIER = 'plans de travail/materiel-2026-11-17-copies-deux-rives/';

function charger(fichier) {
    const window = {};
    vm.runInNewContext(lire(fichier), { window, document: {}, Object, Promise });
    return window;
}

const modele = charger('js/parcours-recevoir-modele.js').ParcoursRecevoirModele;
const copies = charger('js/materiel-copies-deux-rives.js').MaterielCopiesDeuxRives;

/** Les rangées du tableau de la décision 7 : « | Toucan Souriante (9900010) | E | E | M | M | ». */
function tableauDeLaConsigne() {
    return [...CONSIGNE.matchAll(/^\s*\| ([^|(]+?) \((\d{7})\) \| ([0IDME]) \| ([0IDME]) \| ([0IDME]) \| ([0IDME]) \|$/gm)]
        .map((m) => [m[2], m[1].trim(), [m[3], m[4], m[5], m[6]]]);
}

/** Les trois noms de fichiers de la décision 3. */
function nomsDeLaConsigne() {
    return [...CONSIGNE.matchAll(/`(\w+_\d{7}_Artefact-1_Remis_le_\d{4}-\d{2}-\d{2}_\d{2}h\d{2}m\d{2}s\.pdf)`/g)].map((m) => m[1]);
}

describe('Le modèle de « Recevoir » : le matériel de la consigne', () => {
    it('le tableau des sept évaluations, rangée pour rangée', () => {
        const attendu = tableauDeLaConsigne();
        expect(attendu).toHaveLength(7);
        expect(JSON.parse(JSON.stringify(modele.materiel.evaluations))).toEqual(attendu);
        expect([...modele.materiel.criteres]).toEqual(['Structure', 'Rigueur', 'Plausibilité', 'Nuance']);
        expect(CONSIGNE).toMatch(/\| \| Structure \| Rigueur \| Plausibilité \| Nuance \|/);
    });

    it('aucune des sept évaluations ne porte sur les trois copies', () => {
        const das = modele.materiel.evaluations.map((x) => x[0]);
        for (const da of modele.materiel.copies) expect(das).not.toContain(da);
    });

    it('les trois copies : les noms de la consigne, la date ramenée en 2025, dans le même ordre de DA', () => {
        const consigne = nomsDeLaConsigne();
        expect(consigne).toHaveLength(3);
        const attendus = consigne.map((n) => n.replace('_Remis_le_2026-', '_Remis_le_2025-')).sort();
        expect(copies.map((c) => c.nom).sort()).toEqual(attendus);
        expect(copies.map((c) => c.nom.split('_')[1]).sort()).toEqual([...modele.materiel.copies].sort());
        for (const c of copies) expect(c.type).toBe('application/pdf');
    });

    it('les trois copies, octet pour octet, celles du matériel', () => {
        for (const n of nomsDeLaConsigne()) {
            const livree = copies.find((c) => c.nom === n.replace('_Remis_le_2026-', '_Remis_le_2025-'));
            expect(Buffer.from(livree.base64, 'base64').equals(readFileSync(path.join(RACINE, DOSSIER, n))), n).toBe(true);
        }
    });

    it('la copie travaillée est celle de Loutre Enjouée ; Yack Amical, évalué au modèle d’« Évaluer », n’a pas de copie', () => {
        expect({ ...modele.materiel.copieTravaillee }).toEqual({ da: '9900002', nom: 'Loutre Enjouée' });
        expect(CONSIGNE).toMatch(/Une seule copie est travaillée\*\* : celle de Loutre Enjouée/);
        const evaluer = lire('js/parcours-evaluer.js');
        expect(evaluer).toMatch(/etudiantEvalue: Object\.freeze\(\{ da: '9900007', nom: 'Yack Amical' \}\)/);
        expect(modele.materiel.copies).not.toContain('9900007');
    });

    it('les textes des bulles sont marqués provisoires, et regroupés en un seul objet', () => {
        const src = lire('js/parcours-recevoir-modele.js');
        expect(src).toMatch(/LES TEXTES — PROVISOIRES/);
        expect(src.match(/var TEXTES = \{/g)).toHaveLength(1);
        // Les lignes des étapes viennent de TEXTES : aucune chaîne « Touche … » écrite ailleurs dans la mécanique.
        const mecanique = src.slice(src.indexOf('// LES OUTILS'));
        expect(mecanique).not.toMatch(/["']Touche « /);
        for (const k of ['etape1', 'etape2', 'etape3', 'etape4', 'etape5', 'etape6', 'etape7', 'etape8', 'etape9']) expect(modele.textes).toHaveProperty(k);
    });
});
