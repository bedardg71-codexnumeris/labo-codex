import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// =======================================================================
// SENTINELLE #158 — aucun objectif de leçon ne vit sans id
// =======================================================================
//
// Terrain du 10 août 2026 (porte 1.65 §2.2 : « déplacer un objectif, le
// lien doit suivre ») : tout le système de liens #403 (objectifsServis,
// pastilles ✓/!/⚠, cases de l'Inspecteur) résout PAR ID — mais
// `objectifsDeLecon` acceptait des objectifs sans id (import, fusion,
// format intermédiaire d'avant 1.34) et la migration par carte les
// laissait passer. Sans id, chaque édition de la liste re-minte des
// identifiants neufs (passe 3 d'appliquerObjectifs) : les liens existants
// meurent ou glissent d'un cran — le symptôme exact de la porte.
//
// Le colmatage vit dans migrerObjectifsVersMetadata : la branche « déjà au
// format liste » stampe les ids manquants AVANT son continue. Vérifié au
// Chromium : un seed sans ids ressort 3/3 stampés au chargement.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const source = readFileSync(path.join(racine, 'js', 'planification-carte.js'), 'utf8');

function corpsDeFonction(nom) {
    const debut = source.indexOf('function ' + nom + '(');
    expect(debut, 'function ' + nom + ' introuvable').toBeGreaterThan(-1);
    const fin = source.indexOf('\nfunction ', debut + 1);
    return source.slice(debut, fin === -1 ? undefined : fin);
}

describe('#158 · la migration complète les ids manquants du format liste', () => {
    it('la branche « déjà une liste » stampe les ids absents avant de passer', () => {
        const corps = corpsDeFonction('migrerObjectifsVersMetadata');
        // La branche liste ne doit plus être un `continue` sec : elle balaie
        // les objectifs et minte un id quand il manque.
        const brancheListe = corps.indexOf('Array.isArray(n.metadata.objectifs)) {');
        expect(brancheListe,
            'la branche liste est redevenue un continue sec — les objectifs sans id repassent (#158)'
        ).toBeGreaterThan(-1);
        const zone = corps.slice(brancheListe, brancheListe + 1200);
        expect(zone).toContain('!o.id');
        expect(zone).toContain('nouvelIdObjectif()');
    });

    it('le système de liens résout toujours par id (le motif qui rend l\'id vital)', () => {
        expect(source).toContain('objectifsServis');
        const corps = corpsDeFonction('appliquerObjectifs');
        expect(corps).toContain('idDemande');
    });
});
