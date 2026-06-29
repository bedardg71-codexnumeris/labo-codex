import { describe, it, expect } from 'vitest';
import {
    classerAuteur,
    detecterClesPratiques,
    detecterClesPorteusesMetadataCc,
    auditerAttributions
} from '../../scripts/audit-attribution-cc.mjs';

/**
 * Sentinelle #342 — audit attribution CC (LECTURE SEULE).
 * Verrouille la logique de classification « auteur suspect » et la construction
 * du plan. Chaque invariant est BREAK-TESTÉ : un assert prouve que la règle peut
 * ROUGIR si la logique casse (l'attestation n'est pas la preuve).
 */

describe('classerAuteur — classification d\'un auteur_original', () => {
    it('repère le repli historique (cas « Bruno Voisard »)', () => {
        expect(classerAuteur('Bruno Voisard')).toBe('suspect-repli');
        expect(classerAuteur('bruno voisard')).toBe('suspect-repli'); // case-insensible
        expect(classerAuteur('Primo Primavera')).toBe('suspect-repli'); // prof démo
    });

    it('traite les valeurs non attribuées comme légitimes (jamais « erroné »)', () => {
        for (const v of ['', 'Inconnu', 'Anonyme', 'Non spécifié', 'Unknown']) {
            expect(classerAuteur(v)).toBe('non-attribue');
        }
    });

    it('sans auteur attendu, un nom ordinaire non-repli est « ok »', () => {
        expect(classerAuteur('Grégoire Bédard')).toBe('ok');
    });

    it('avec auteur attendu, un nom différent (et non-repli) est « suspect-divergent »', () => {
        const opts = { auteurAttendu: 'Grégoire Bédard' };
        expect(classerAuteur('Quelqu\'un D\'Autre', opts)).toBe('suspect-divergent');
        // ... mais l'auteur attendu lui-même reste « ok »
        expect(classerAuteur('Grégoire Bédard', opts)).toBe('ok');
        // ... et un non-attribué reste « non-attribue », pas « divergent »
        expect(classerAuteur('Inconnu', opts)).toBe('non-attribue');
    });

    it('le repli prime sur le divergent (motif le plus précis)', () => {
        const opts = { auteurAttendu: 'Grégoire Bédard' };
        expect(classerAuteur('Bruno Voisard', opts)).toBe('suspect-repli');
    });

    // BREAK-TEST : la classification doit DISTINGUER repli et ok. Si la règle
    // « repli » disparaissait, ce cas tomberait à 'ok' et l'assert rougirait.
    it('break-test : un repli ne doit JAMAIS être classé « ok »', () => {
        expect(classerAuteur('Bruno Voisard')).not.toBe('ok');
    });
});

describe('détection des clés porteuses', () => {
    const codex = {
        'h2026_pratiquesConfigurables': [{ id: 'p1' }],
        'a2025_pratiquesConfigurables': [{ id: 'p2' }],
        'pratiques_configurations': [{ id: 'p3' }],     // fallback historique
        'h2026_grillesTemplates': [{ id: 'g1', metadata_cc: { auteur_original: 'X' } }],
        'h2026_groupeEtudiants': [{ id: 'e1' }],         // non porteuse, à ignorer
        'trimestreActif': 'h2026'                         // non-tableau, à ignorer
    };

    it('detecterClesPratiques trouve namespacées + fallback, exclut le reste', () => {
        expect(detecterClesPratiques(codex)).toEqual([
            'a2025_pratiquesConfigurables',
            'h2026_pratiquesConfigurables',
            'pratiques_configurations'
        ]);
    });

    it('detecterClesPorteusesMetadataCc trouve toute collection avec metadata_cc.auteur_original', () => {
        const cles = detecterClesPorteusesMetadataCc(codex);
        expect(cles).toContain('h2026_grillesTemplates');
        expect(cles).not.toContain('h2026_groupeEtudiants');
        expect(cles).not.toContain('trimestreActif');
    });

    // BREAK-TEST : une clé sans metadata_cc.auteur_original ne doit PAS être ramassée
    // par le scan métadonnées (sinon faux positifs partout).
    it('break-test : collection sans auteur_original n\'est pas porteuse', () => {
        expect(detecterClesPorteusesMetadataCc({ x: [{ id: 'a' }] })).toEqual([]);
    });
});

describe('auditerAttributions — plan d\'audit complet', () => {
    const codex = {
        'h2026_pratiquesConfigurables': [
            { id: 'p1', nom: 'Littérature', metadata_cc: { auteur_original: 'Bruno Voisard' } }, // suspect repli
            { id: 'p2', nom: 'Philo', metadata_cc: { auteur_original: 'Grégoire Bédard' } },     // ok
            { id: 'p3', nom: 'Brouillon', metadata_cc: { auteur_original: 'Inconnu' } }          // non-attribue
        ]
    };

    it('liste les suspects, suggère l\'auteur majoritaire, ignore les « ok »', () => {
        const { lignes, auteurMajoritaire } = auditerAttributions(codex);
        const suspects = lignes.filter(l => l.classe.startsWith('suspect'));
        expect(suspects).toHaveLength(1);
        expect(suspects[0].id).toBe('p1');
        // majoritaire « ok » = Grégoire Bédard → cible suggérée pour le suspect
        expect(auteurMajoritaire).toBe('Grégoire Bédard');
        expect(suspects[0].cibleSuggeree).toBe('Grégoire Bédard');
        // le non-attribué est listé mais sans cible imposée
        const na = lignes.find(l => l.id === 'p3');
        expect(na.classe).toBe('non-attribue');
        expect(na.cibleSuggeree).toBe('');
    });

    it('--auteur-attendu prime sur le majoritaire pour la cible suggérée', () => {
        const { lignes } = auditerAttributions(codex, { auteurAttendu: 'G. Bédard' });
        const p1 = lignes.find(l => l.id === 'p1');
        expect(p1.cibleSuggeree).toBe('G. Bédard');
    });

    it('lit auteur_original via metadata, metadata_cc, ou champ plat `auteur`', () => {
        const c = {
            'h2026_pratiquesConfigurables': [
                { id: 'a', auteur: 'Bruno Voisard' },                       // champ plat
                { id: 'b', metadata: { auteur_original: 'Primo Primavera' } } // metadata legacy
            ]
        };
        const { lignes } = auditerAttributions(c);
        const ids = lignes.filter(l => l.classe === 'suspect-repli').map(l => l.id).sort();
        expect(ids).toEqual(['a', 'b']);
    });

    // BREAK-TEST : une pratique « ok » ne doit JAMAIS apparaître dans le plan.
    // Si la garde `if (classe === 'ok') return` sautait, p2 surgirait et la longueur
    // changerait → rouge.
    it('break-test : aucune ligne pour une pratique légitime', () => {
        const { lignes } = auditerAttributions({
            'h2026_pratiquesConfigurables': [
                { id: 'ok1', metadata_cc: { auteur_original: 'Grégoire Bédard' } }
            ]
        });
        expect(lignes).toHaveLength(0);
    });

    // BREAK-TEST : le scan ne doit RIEN muter (lecture seule). On compare une copie
    // profonde avant/après ; toute écriture rougirait.
    it('break-test : le codex n\'est pas muté (lecture seule)', () => {
        const avant = JSON.stringify(codex);
        auditerAttributions(codex, { auteurAttendu: 'Z' });
        expect(JSON.stringify(codex)).toBe(avant);
    });
});
