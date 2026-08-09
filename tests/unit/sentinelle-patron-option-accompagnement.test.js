import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// =======================================================================
// SENTINELLE — le patron `.option-accompagnement` ne survit pas à sa page
// (audit de `Plan Accompagnement/`, 9 août 2026)
// =======================================================================
//
// D'où ça vient. `PLAN_uniformisation_Accompagnement.md` (23 mai 2026) §2
// spécifiait un patron de composant pour les options de Réglages →
// Observation et dépistage : un bloc `.option-accompagnement` avec sa tête,
// sa checkbox, son titre, sa description et ses sous-options conditionnelles.
// Le patron a été livré, puis la page a été REFONDUE en cartes-accordéon le
// 26 mai (PM2). Personne n'a retiré le patron remplacé : ses règles sont
// restées dans `styles.css`, sans un seul porteur dans le HTML, pendant
// deux mois et demi. Seul `.option-accompagnement-guide-btn` a survécu à la
// refonte — c'est le bouton « Guide » des cinq en-têtes de carte.
//
// ⚠ Ce que ce test verrouille n'est PAS « ces classes-là sont absentes ».
// C'est l'invariant général qui les a fait mourir : **toute classe
// `.option-accompagnement*` déclarée au CSS doit avoir un porteur réel**.
// Un cliquet qui listerait les classes mortes d'aujourd'hui ne dirait rien
// de celles de demain ; celui-ci rougit sur la prochaine, sans retouche.
//
// ⮕ Piège à connaître pour qui reprend ce fichier : `PLAN_guides_pedagogiques.md`
// §4.1 (guide « Enseignement explicite », jamais écrit) donne encore un
// gabarit HTML bâti sur `.option-accompagnement`. Ce gabarit est PÉRIMÉ —
// la page qu'il visait n'existe plus sous cette forme. Écrire ce guide un
// jour, c'est suivre le patron accordéon des cinq cartes actuelles, pas
// ressusciter celui-ci. Le test le dira.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const css = readFileSync(path.join(racine, 'styles.css'), 'utf8');
const html = readFileSync(path.join(racine, 'index.html'), 'utf8');

/** Concaténation de tous les .js de `js/` (récursif) — le HTML des modules y vit. */
function sourcesJs() {
    const morceaux = [];
    (function parcourir(dossier) {
        for (const entree of readdirSync(dossier, { withFileTypes: true })) {
            const complet = path.join(dossier, entree.name);
            if (entree.isDirectory()) parcourir(complet);
            else if (entree.name.endsWith('.js')) morceaux.push(readFileSync(complet, 'utf8'));
        }
    })(path.join(racine, 'js'));
    return morceaux.join('\n');
}

/** Les classes `option-accompagnement*` DÉCLARÉES dans styles.css, dédupliquées. */
function classesDeclarees() {
    const trouvees = css.match(/\.option-accompagnement[a-z0-9-]*/g) || [];
    return [...new Set(trouvees.map(c => c.slice(1)))].sort();
}

const js = sourcesJs();
const porteurs = html + '\n' + js;

describe('Patron `.option-accompagnement` — aucune règle sans porteur', () => {
    it('le patron est bien encore déclaré quelque part (le test a un sujet)', () => {
        // Garde-fou de l'assertion elle-même : si le bouton « Guide »
        // disparaissait, les boucles ci-dessous deviendraient vraies par
        // vacuité et ce fichier passerait au vert en ne testant rien.
        expect(classesDeclarees().length).toBeGreaterThan(0);
    });

    it('chaque classe déclarée au CSS a un porteur dans index.html ou js/', () => {
        for (const classe of classesDeclarees()) {
            expect(porteurs.includes(classe), `${classe} n'a aucun porteur — règle morte`).toBe(true);
        }
    });

    it('le patron remplacé (bloc, tête, checkbox, titre, description, sous-options) est parti', () => {
        // Le cas d'espèce, nommé : ces six-là sont ceux que la refonte du
        // 26 mai a rendus inutiles. Redondant avec le test générique tant
        // qu'ils ne reviennent pas — et c'est voulu : il nomme le motif.
        for (const morte of [
            '.option-accompagnement {',
            '.option-accompagnement-tete',
            '.option-accompagnement-checkbox',
            '.option-accompagnement-titre',
            '.option-accompagnement-description',
            '.option-accompagnement-sous-options'
        ]) {
            expect(css.includes(morte), `${morte} est revenu au CSS`).toBe(false);
        }
    });

    it('le bouton « Guide », lui, est VIVANT — cinq en-têtes de carte le portent', () => {
        // L'autre moitié de l'invariant : nettoyer ne doit pas emporter ce
        // qui sert. Cinq guides accessibles (som, pan, solo, acp, rai).
        //
        // ⚠ L'attribut est matché EN ENTIER (`class="…"`), pas en sous-chaîne.
        // Premier jet : /option-accompagnement-guide-btn/g. Le break-test l'a
        // trouvé complaisant — renommer la classe en `…-guide-btnX` laissait
        // les cinq matchs en place, donc le test restait VERT sur cinq boutons
        // qui n'avaient plus de style. Une sous-chaîne ne prouve pas une classe.
        expect(css).toContain('.option-accompagnement-guide-btn');
        const boutons = html.match(/class="option-accompagnement-guide-btn"/g) || [];
        expect(boutons.length).toBe(5);
    });

    it('le mode clair garde ses trois correctifs de contraste sur ce bouton', () => {
        // Le bouton vit sur un en-tête dégradé bleu marine : sans ces règles,
        // le libellé et l'icône rendent sombres sur fond sombre.
        expect(css).toMatch(/\.mode-clair \.option-accompagnement-guide-btn\s*\{/);
        expect(css).toMatch(/\.mode-clair \.option-accompagnement-guide-btn:hover\s*\{/);
        expect(css).toMatch(/\.mode-clair \.option-accompagnement-guide-btn img\.btn-inline-icon\s*\{/);
    });
});
