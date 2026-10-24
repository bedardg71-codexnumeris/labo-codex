import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// SENTINELLE — règle n° 6 de CLAUDE.md : aucun nom d'élève réel dans le code, les tests, les rapports, les plans.
// Consigne de Cowork du 24 oct. 2026 (`CONSIGNE-LOT-2026-10-24-noms-reels-tests.md`), après la relecture du
// lot 1 de l'Aide : deux noms de famille d'élèves de l'import réel du 30 août vivaient dans huit fichiers de
// tests et une ligne du relais ; ils y sont remplacés par « Exemple » et « Essai ». Le dépôt est public.
//
// Les noms ne s'écrivent nulle part : seule leur empreinte sha256 (en minuscules) l'est. Le banc parcourt
// TOUS les fichiers suivis par git (sauf les binaires) et hache chaque mot de la longueur d'un des deux noms.
//
// Le nom 2 a une homonyme publiée : l'autrice d'un rapport cité dans quatre fichiers (Ressources de l'Aide,
// le commentaire de tête de construction-attributs.js, BACKLOG.md, OU-EN-EST-ON.md). Ces citations restent :
// il n'est permis QUE là, une fois par fichier.
//
// L'historique git n'est pas réécrit (décision qui revient à Grégoire) : ce banc ne juge que l'arbre actuel.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');

const NOM_1 = { longueur: 9, empreinte: '020ea0d6b78c6d05cb49ea272c540a6dd23c1f24da0152bde6f70d18d7516b06' };
const NOM_2 = { longueur: 8, empreinte: 'd3ae712cef2e8a52121e98f3867c310795e1f6e86afa80456ec06b0a24db8af3' };
const CITATIONS_NOM_2 = ['BACKLOG.md', 'OU-EN-EST-ON.md', 'index.html', 'js/pratiques/construction-attributs.js'];

const empreinte = (mot) => createHash('sha256').update(mot).digest('hex');

/** Pour chaque fichier suivi (texte), le nombre de mots dont l'empreinte vaut celle de `nom`. */
function occurrences(fichiers, nom) {
    const parFichier = {};
    for (const [chemin, contenu] of fichiers) {
        let n = 0;
        for (const m of contenu.matchAll(/\p{L}+/gu)) {
            if (m[0].length === nom.longueur && empreinte(m[0].toLowerCase()) === nom.empreinte) n++;
        }
        if (n) parFichier[chemin] = n;
    }
    return parFichier;
}

const lsFiles = spawnSync('git', ['ls-files', '-z'], { cwd: racine, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
const FICHIERS = (lsFiles.stdout || '').split('\0').filter(Boolean).map((chemin) => {
    let tampon;
    try { tampon = readFileSync(path.join(racine, chemin)); } catch { return null; } // suivi mais supprimé de l'arbre
    if (tampon.subarray(0, 8000).includes(0)) return null; // binaire
    return [chemin, tampon.toString('utf8').normalize('NFC')];
}).filter(Boolean);

describe('Règle 6 · deux noms d\'élèves réel·les retirés des fichiers actuels (24 oct. 2026)', () => {
    it('git liste les fichiers suivis, et le banc en lit assez pour juger', () => {
        expect(lsFiles.status).toBe(0);
        expect(FICHIERS.length).toBeGreaterThan(1000);
        expect(FICHIERS.some(([c]) => c === 'tests/unit/sentinelle-603-604-import-pages-et-remplacement.test.js')).toBe(true);
    });

    it('aucun fichier suivi ne porte le nom 1', () => {
        expect(occurrences(FICHIERS, NOM_1)).toEqual({});
    }, 60000);

    it('le nom 2 ne paraît que dans les quatre citations du rapport, une fois chacune', () => {
        expect(occurrences(FICHIERS, NOM_2)).toEqual(Object.fromEntries(CITATIONS_NOM_2.map((c) => [c, 1])));
    }, 60000);
});
