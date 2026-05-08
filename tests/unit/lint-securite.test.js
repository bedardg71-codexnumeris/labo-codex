import { describe, it, expect, beforeAll } from 'vitest';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const scriptAudit = path.join(racineProjet, 'scripts', 'audit-innerhtml.sh');

// Test F.15 du plan Défense I — lint sécurité statique.
//
// Cible : la dette `innerHTML` sans `echapperHtml` (cf. PLAN §2.F +
// MODELE-MENACES §I-01 + Défense E). Le script d'audit produit un
// compteur global de cas suspects ; le test vérifie que ce compteur
// ne DÉPASSE PAS la baseline. Si un commit ajoute un nouveau cas non
// échappé, le test échoue et bloque la régression.
//
// Procédure pour bumper la baseline (uniquement vers le bas, après
// migration `textContent`/`echapperHtml` ou retrait de code) :
// 1. Lancer `bash scripts/audit-innerhtml.sh` localement
// 2. Relever la nouvelle valeur « Suspect »
// 3. Mettre à jour SEUIL_SUSPECTS_MAX ci-dessous
// 4. Documenter dans le commit

// Baseline figée le 8 mai 2026 (post Défense A, Défense E-α/E-β).
// Snapshot de référence : docs/securite/audits/AUDIT-INNERHTML-2026-05-06.md
// (125 suspects au 6 mai → 120 au 8 mai après E-α/E-β).
const SEUIL_SUSPECTS_MAX = 120;

describe('Défense I · F · lint sécurité statique', () => {
    // Le script audite ~112 fichiers .js (~8 s sur Mac M3). On invoque
    // une seule fois et on partage la sortie entre les assertions.
    let sortie;
    beforeAll(() => {
        sortie = execFileSync('bash', [scriptAudit], { encoding: 'utf8' });
    });

    it('F.15 · audit-innerhtml.sh · nombre de cas suspects ≤ baseline', () => {
        // Parse la ligne « ⚠ Suspect (interpolation sans echapperHtml) : N »
        const match = sortie.match(/Suspect\s+\(interpolation sans echapperHtml\)\s*:\s*(\d+)/);
        expect(match, 'Format de sortie de audit-innerhtml.sh inattendu').not.toBeNull();
        const nbSuspects = parseInt(match[1], 10);

        expect(
            nbSuspects,
            `Régression détectée : ${nbSuspects} cas suspects (baseline ${SEUIL_SUSPECTS_MAX}). ` +
            `Soit (a) le nouveau code introduit un innerHTML sans echapperHtml — corrigez-le, ` +
            `soit (b) la baseline doit être abaissée si vous avez nettoyé du code (mettre à jour SEUIL_SUSPECTS_MAX).`
        ).toBeLessThanOrEqual(SEUIL_SUSPECTS_MAX);
    });

    it('F · audit-innerhtml.sh · invariant total = sécurisé + statique + suspect', () => {
        const totalMatch = sortie.match(/Total \.innerHTML\s*:\s*(\d+)/);
        const secMatch = sortie.match(/Sécurisé \(echapperHtml\)\s*:\s*(\d+)/);
        const statMatch = sortie.match(/Statique \(sans interpolation\)\s*:\s*(\d+)/);
        const suspMatch = sortie.match(/Suspect \(interpolation sans echapperHtml\)\s*:\s*(\d+)/);

        expect(totalMatch).not.toBeNull();
        expect(secMatch).not.toBeNull();
        expect(statMatch).not.toBeNull();
        expect(suspMatch).not.toBeNull();

        const total = parseInt(totalMatch[1], 10);
        const somme = parseInt(secMatch[1], 10) + parseInt(statMatch[1], 10) + parseInt(suspMatch[1], 10);
        expect(somme).toBe(total);
    });

});
