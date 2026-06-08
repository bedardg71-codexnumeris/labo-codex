import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// SENTINELLE — retour terrain 8 juin (iPhone) : des icônes du popover mobile
// s'affichaient en carré noir. Cause : les fichiers SVG référencés en <img src>
// existaient sur le disque du dev mais n'étaient PAS suivis par git → absents du
// déploiement → images cassées. (Le desktop, lui, utilise des masques base64 inlinés,
// donc ne dépend pas du fichier.) Ce test échoue si une icône référencée n'est pas
// suivie par git, AVANT qu'elle ne casse en production.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');

function iconesReferencees() {
    const fichiers = [path.join(racine, 'index.html')];
    const jsDir = path.join(racine, 'js');
    for (const f of readdirSync(jsDir)) {
        if (f.endsWith('.js')) fichiers.push(path.join(jsDir, f));
    }
    const set = new Set();
    const re = /src=["']icons\/([^"']+\.svg)["']/g;
    for (const fichier of fichiers) {
        let contenu;
        try { contenu = readFileSync(fichier, 'utf8'); } catch { continue; }
        let m;
        while ((m = re.exec(contenu)) !== null) set.add(m[1]);
    }
    return [...set];
}

function estSuivieParGit(nom) {
    try {
        execSync(`git ls-files --error-unmatch "icons/${nom}"`, { cwd: racine, stdio: 'ignore' });
        return true;
    } catch {
        return false;
    }
}

describe('icônes référencées en <img src> — suivies par git', () => {
    it('au moins une icône est référencée (sanity)', () => {
        expect(iconesReferencees().length).toBeGreaterThan(0);
    });

    it('aucune icône référencée n\'est untracked (sinon image cassée au déploiement)', () => {
        const untracked = iconesReferencees().filter((nom) => !estSuivieParGit(nom));
        expect(untracked, `Icônes référencées NON suivies par git : ${untracked.join(', ')}`).toEqual([]);
    });
});
