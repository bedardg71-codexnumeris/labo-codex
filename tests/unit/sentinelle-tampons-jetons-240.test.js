/**
 * Sentinelle #240 — Tampons visuels pour jetons (Délai, Reprise, Reprise ciblée).
 *
 * Couvre les 3 invariants du chantier :
 *   1. Le catalogue AUTOCOLLANTS contient les 3 tampons texte de jeton, au format
 *      attendu (texteTampon ROUGE MAJUSCULE, categorie 'jeton', jetonType valide).
 *   2. La carte jetonType → autocollant (`activerTamponJeton`) est branchée et exportée.
 *   3. Le cochage AUTO de la checkbox du jeton est câblé après apposition du tampon
 *      (poserTamponTexte → cocherCheckboxJeton → handler existant), et le mot du jeton
 *      est rendu cliquable (data-action) dans le formulaire d'évaluation.
 *
 * Les invariants 1-2 sont vérifiés en chargeant le module réel (travaux-outils.js) dans
 * un sandbox ; l'invariant 3 traverse plusieurs modules dépendants du DOM/canvas → vérifié
 * sur la source (sentinelle statique, même patron que d'autres tests du dépôt).
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');

function lireSource(rel) {
    return readFileSync(path.join(racineProjet, rel), 'utf8');
}

// Stub minimal de `db` : ready=false reporte la migration RLO à un db-ready
// (jamais émis dans la sandbox) ; getSync renvoie null (défauts du module).
const dbStub = {
    ready: false,
    getSync: () => null,
    setSync: () => {},
};

// `new Image()` est appelé au top-level (prechargerAutocollants) — stub neutre.
class ImageStub {
    constructor() { this.src = ''; this.complete = false; }
    addEventListener() {}
    removeEventListener() {}
}

function chargerTravauxOutils() {
    // travaux-outils.js fait `window.addEventListener('db-ready', ...)` au top-level :
    // on fournit un window pré-amorcé (sandbox réutilisable de chargerScript).
    const fauxWindow = { addEventListener: () => {}, removeEventListener: () => {} };
    return chargerScript('js/travaux-outils.js', { db: dbStub, Image: ImageStub }, fauxWindow);
}

const TROIS_JETONS = [
    { id: 'jeton-delai',          jetonType: 'delai',         texteTampon: 'JETON DE DÉLAI' },
    { id: 'jeton-reprise',        jetonType: 'reprise',       texteTampon: 'JETON DE REPRISE' },
    { id: 'jeton-reprise-ciblee', jetonType: 'repriseCiblee', texteTampon: 'JETON DE REPRISE CIBLÉE' },
];

describe('#240 — catalogue AUTOCOLLANTS : tampons texte de jeton', () => {
    const outils = chargerTravauxOutils();

    it('expose le module et son catalogue', () => {
        expect(outils.travauxOutils).toBeTruthy();
        expect(Array.isArray(outils.travauxOutils.AUTOCOLLANTS)).toBe(true);
    });

    it.each(TROIS_JETONS)('contient le tampon $id avec le bon format', (attendu) => {
        const cat = outils.travauxOutils.AUTOCOLLANTS;
        const entree = cat.find((a) => a.id === attendu.id);
        expect(entree, `tampon ${attendu.id} absent du catalogue`).toBeTruthy();
        // Tampon TEXTE : pas de fichier image, un texteTampon en MAJUSCULES.
        expect(entree.fichier).toBeUndefined();
        expect(entree.texteTampon).toBe(attendu.texteTampon);
        expect(entree.texteTampon).toBe(entree.texteTampon.toUpperCase());
        // Branché à la bonne checkbox de jeton + hors palette tampons standard.
        expect(entree.jetonType).toBe(attendu.jetonType);
        expect(entree.categorie).toBe('jeton');
    });

    it('expose activerTamponJeton et getAutocollant', () => {
        expect(typeof outils.travauxOutils.activerTamponJeton).toBe('function');
        expect(typeof outils.travauxOutils.getAutocollant).toBe('function');
    });

    it('getAutocollant retrouve chaque tampon de jeton par son id', () => {
        TROIS_JETONS.forEach((j) => {
            const def = outils.travauxOutils.getAutocollant(j.id);
            expect(def).toBeTruthy();
            expect(def.jetonType).toBe(j.jetonType);
        });
    });

    it('activerTamponJeton(jetonType) sélectionne le bon autocollant (mode tampon)', () => {
        TROIS_JETONS.forEach((j) => {
            outils.travauxOutils.activerTamponJeton(j.jetonType);
            expect(outils.travauxOutils.getAutocollantActif()).toBe(j.id);
        });
    });

    it('la catégorie jeton est ABSENTE des catégories rendues par la palette tampons', () => {
        // La palette ne parcourt que CATEGORIES_BUILTIN (action/comprehension/observations)
        // + catégories perso + symboles : la catégorie 'jeton' n'y figure pas → les 3 tampons
        // de jeton ne polluent pas l'espace de travail. Vérification statique sur la source
        // (genererContenuTampons dépend de globaux DOM non stubbés).
        const src = lireSource('js/travaux-outils.js');
        expect(src).toMatch(/CATEGORIES_BUILTIN\s*=\s*\[\s*'action'\s*,\s*'comprehension'\s*,\s*'observations'\s*\]/);
        expect(src).not.toMatch(/CATEGORIES_BUILTIN\s*=\s*\[[^\]]*'jeton'/);
    });
});

describe('#240 — cochage AUTO de la checkbox + mot du jeton cliquable', () => {
    it('poserTamponTexte coche la checkbox du jeton via le handler existant', () => {
        const src = lireSource('js/travaux-annotation.js');
        // Le tampon texte est détecté et routé.
        expect(src).toMatch(/texteTampon/);
        expect(src).toMatch(/function poserTamponTexte/);
        expect(src).toMatch(/function dessinerTamponTexte/);
        // Cochage auto câblé sur les 3 checkboxes + handlers réels.
        expect(src).toMatch(/cocherCheckboxJeton/);
        expect(src).toMatch(/checkboxJetonDelai/);
        expect(src).toMatch(/checkboxJetonReprise/);
        expect(src).toMatch(/checkboxJetonRepriseCiblee/);
        expect(src).toMatch(/gererChangementCheckboxJetonDelai/);
        expect(src).toMatch(/gererChangementCheckboxJetonReprise/);
        expect(src).toMatch(/gererChangementCheckboxJetonRepriseCiblee/);
    });

    it('le tampon texte est rendu en ROUGE par dessinerTamponTexte', () => {
        const src = lireSource('js/travaux-annotation.js');
        // Couleur rouge imposée + texte du sticker.
        expect(src).toMatch(/fillStyle\s*=\s*['"]#d32f2f['"]/);
        expect(src).toMatch(/fillText\(sticker\.texteTampon/);
    });

    it('le mot du jeton porte un data-action vers activerTamponJeton', () => {
        const src = lireSource('js/evaluation-sauvegarde.js');
        expect(src).toMatch(/data-action="travauxOutils\.activerTamponJeton"/);
        // Activable au clavier (role/tabindex) — dispatcher keydown de main.js.
        expect(src).toMatch(/badge-jeton-titre--tampon/);
        expect(src).toMatch(/role="button"/);
    });
});
