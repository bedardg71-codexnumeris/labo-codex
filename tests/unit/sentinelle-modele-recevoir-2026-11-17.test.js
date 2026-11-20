import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { tranche } from './_helpers/tranche.js';

// =====================================================================
// LE MODÈLE DE « RECEVOIR » (« JE REGARDE », 17 NOV. 2026) — LE MATÉRIEL CONFRONTÉ À LA CONSIGNE
// =====================================================================
// plans de travail/CONSIGNE-LOT-2026-11-17-je-regarde-recevoir.md, décisions 3, 5 et 7 :
//   · le tableau des sept évaluations de l'exemple (niveaux validés par Grégoire) ;
//   · les trois copies : leurs noms (la date ramenée en 2025, mesure 3.4), et leurs octets, ceux des PDF du matériel ;
//   · la copie travaillée (Loutre Enjouée) ; la personne évaluée au modèle d'« Évaluer » (Yack Amical, décision du
//     17 nov.) n'est pas une des trois copies.
// Break-test des dix textes (17 nov., soir) : « Regarde-les arriver » changé en « Regarde-les venir » → ROUGE, le chemin
// nommé (TEXTES.etape1.consignes[0]). Rétabli → vert.
// Break-tests (17 nov. 2026) : le niveau Nuance de Caribou Attentionné passé de I à D dans
// js/parcours-recevoir-modele.js → ROUGE (« le tableau ») ; un octet changé dans la base64 de la copie de Tapir Doux →
// ROUGE (« octet pour octet »). Rétablis → vert. Refaits sur les nouvelles copies (17 nov., soir) : rouges, puis verts.

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lire = (f) => readFileSync(path.join(RACINE, f), 'utf8');
const CONSIGNE = lire('plans de travail/CONSIGNE-LOT-2026-11-17-je-regarde-recevoir.md');
const DOSSIER = 'plans de travail/materiel-2026-11-17-copies-deux-rives/';
// Les copies refaites le 17 nov. au soir (deux photos, un PDF, en-tête A2025) : leurs noms sont ceux de la partie B.
const CONSIGNE_B = lire('plans de travail/CONSIGNE-LOT-2026-11-17-recevoir-dix-bulles.md');
const TYPES = { jpg: 'image/jpeg', pdf: 'application/pdf' };

function charger(fichier) {
    const window = { addEventListener() {} };
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

/** Les trois noms de fichiers de la partie B de la consigne des dix bulles (sans doublon). */
function nomsDeLaConsigne() {
    return [...new Set([...CONSIGNE_B.matchAll(/`(\w+_\d{7}_Artefact-1_Remis_le_2025-\d{2}-\d{2}_\d{2}h\d{2}m\d{2}s\.(?:jpg|pdf))`/g)].map((m) => m[1]))];
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

    it('les trois copies : les noms de la consigne (en 2025), deux photos et un PDF, les DA du matériel', () => {
        const consigne = nomsDeLaConsigne();
        expect(consigne).toHaveLength(3);
        expect(copies.map((c) => c.nom).sort()).toEqual([...consigne].sort());
        expect(copies.map((c) => c.nom.split('_')[1]).sort()).toEqual([...modele.materiel.copies].sort());
        for (const c of copies) expect(c.type, c.nom).toBe(TYPES[c.nom.split('.').pop()]);
        expect(copies.map((c) => c.type).sort()).toEqual(['application/pdf', 'image/jpeg', 'image/jpeg']);
    });

    it('les trois copies, octet pour octet, celles du matériel', () => {
        for (const n of nomsDeLaConsigne()) {
            const livree = copies.find((c) => c.nom === n);
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

    it('les dix bulles : chaque texte est celui de la consigne, mot pour mot (sauf les lignes PROPOSÉES), dans un seul objet', () => {
        const src = lire('js/parcours-recevoir-modele.js');
        expect(src).toMatch(/LES TEXTES — ÉCRITS PAR GRÉGOIRE AVEC COWORK/);
        expect(src.match(/var TEXTES = \{/g)).toHaveLength(1);
        // Aucune consigne écrite ailleurs que dans TEXTES.
        const mecanique = tranche(src, '// LES OUTILS', 'window.ParcoursRecevoirModele = {', { longueurMin: 2000 });
        expect(mecanique).not.toMatch(/["']Touche « /);
        // La partie C, sans le gras du markdown.
        const partieC = tranche(CONSIGNE_B, '### Les textes, mot pour mot', '## D. Bancs et porte', { longueurMin: 2000 }).replace(/\*\*/g, '');
        const TITRE = 'Appliquer des stratégies de lecture variées (Deux-Rives)';
        const PROPOSES = ['refus', 'choisirLeGroupe', 'autreCopie', 'autrePhoto'];
        const textes = [];
        (function cueillir(o, chemin) {
            for (const [k, v] of Object.entries(o)) {
                if (PROPOSES.includes(k)) continue;
                const ici = chemin + '.' + k;
                if (typeof v === 'string') textes.push([ici, v]);
                else if (typeof v === 'function') textes.push([ici, v(TITRE)]);
                else if (Array.isArray(v)) v.forEach((x, n) => textes.push([ici + '[' + n + ']', x]));
                else if (v && typeof v === 'object') cueillir(v, ici);
            }
        })(modele.textes, 'TEXTES');
        expect(textes.length).toBeGreaterThan(50);
        // Les retouches de Cowork (18 nov. 2026, 7 h 40) : la bulle 4 ; et « à l'onglet », que le moteur pose (`lieuSuite`
        // ne garde que la suite de la phrase, mot pour mot dans la consigne).
        const RETOUCHES = {
            'TEXTES.etape4.lignes[0]': "Sous « Aperçu », sa copie porte maintenant la mention « Spécifique », suivie de « Perspective » : son réglage s'appliquera à l'import",
            // 19 nov. 2026 (Grégoire, relais du « Nous faisons » de « Recevoir », point 3 : le stylet n'écrit pas) ; relue
            // ci-dessous dans la consigne du 19 nov.
            'TEXTES.etape6.lieuSuite': ": c'est là que tu lis la copie et que tu y poses tes marques."
        };
        expect(lire('plans de travail/CONSIGNE-2026-11-19-nous-faisons-recevoir.md'))
            .toContain('devient « ' + RETOUCHES['TEXTES.etape6.lieuSuite'] + ' »');
        for (const [ou, texte] of textes) {
            if (RETOUCHES[ou]) expect(texte, ou).toBe(RETOUCHES[ou]);
            else expect(partieC, ou).toContain(texte);
        }
        for (const k of ['etape1', 'etape5', 'etape6', 'etape10']) {
            expect(modele.textes[k].lieuSuite, k).toMatch(/^: c'est là que /);
            expect(modele.textes[k]).not.toHaveProperty('lieu');
        }
        expect(lire('js/parcours-recevoir-modele.js')).not.toMatch(/à la section «/);
        for (let k = 1; k <= 10; k++) expect(modele.textes).toHaveProperty('etape' + k);
    });
});
