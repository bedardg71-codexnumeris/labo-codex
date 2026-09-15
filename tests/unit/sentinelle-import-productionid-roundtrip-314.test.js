import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// SENTINELLE — #314 — la production choisie à l'import était perdue silencieusement.
// Cause établie (lecture directe) : persisterFileDAttente/restaurerFileDAttente
// (sessionStorage) NE sérialisaient PAS les drapeaux d'intention `productionIdParLea`
// et `estReprise`. Au restore, `productionIdParLea` redevenait `undefined` → la garde
// `else if (!f.productionIdParLea)` de associerProductionGlobale('') (travaux-ui.js)
// effaçait une production détectée par le parse Léa → fichier « Non associé ».
// Le correctif rétablit le round-trip des deux drapeaux. Sentinelle STATIQUE
// (persister/restaurer ne sont pas exportés ; on verrouille la sérialisation).

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = readFileSync(path.resolve(__dirname, '..', '..', 'js/travaux-import.js'), 'utf8');

// Isole le corps de chaque fonction pour des assertions ciblées : jusqu'à la
// fonction SUIVANTE, pas une fenêtre fixe. #876 (15 sept. 2026) — la fenêtre de
// 2 500 caractères perdait `productionIdParLea` dès qu'un commentaire s'ajoutait
// plus haut dans restaurerFileDAttente : un faux rouge, sans rapport avec #314.
function corps(nomFonction) {
    const i = src.indexOf('function ' + nomFonction);
    expect(i, 'fonction ' + nomFonction + ' introuvable').toBeGreaterThan(-1);
    const suivante = src.indexOf('\n    function ', i + 1);
    return src.slice(i, suivante === -1 ? undefined : suivante);
}

describe('#314 — round-trip sessionStorage des drapeaux d\'intention', () => {
    it('persisterFileDAttente sérialise productionIdParLea ET estReprise', () => {
        const c = corps('persisterFileDAttente');
        expect(c).toContain('productionIdParLea: !!f.productionIdParLea');
        expect(c).toContain('estReprise: !!f.estReprise');
        // garde le champ déjà présent (non-régression)
        expect(c).toContain('productionId: f.productionId');
    });

    it('restaurerFileDAttente restaure productionIdParLea ET estReprise', () => {
        const c = corps('restaurerFileDAttente');
        expect(c).toContain('productionIdParLea: !!d.productionIdParLea');
        expect(c).toContain('estReprise: !!d.estReprise');
        expect(c).toContain("productionId: d.productionId || ''");
    });
});
