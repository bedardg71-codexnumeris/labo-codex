import { describe, it, expect } from 'vitest';

// Test trivial de validation du setup Vitest. À conserver — sert de canari
// pour vérifier qu'un changement de config ne casse pas le runner lui-même.
describe('Setup Vitest', () => {
    it('exécute les assertions de base', () => {
        expect(2 + 2).toBe(4);
    });

    it('confirme l\'environnement Node', () => {
        expect(typeof process).toBe('object');
        expect(typeof process.versions.node).toBe('string');
    });
});
