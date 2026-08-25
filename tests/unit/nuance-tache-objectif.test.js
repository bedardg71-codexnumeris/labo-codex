import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// Nuance tâche / objectif dans le gabarit des productions (15 août 2026).
//
// Avant : les deux info-bulles disaient la même chose sous deux angles
// (« ce que l'étudiant·e sera capable de faire » / « ce qui est demandé
// concrètement »). Rien n'y opposait la tâche — locale, bornée, cochable — à
// l'objectif — transférable, sans terme, seulement observable. C'est cette
// opposition que la sentinelle protège : si quelqu'un rétablit un texte
// générique, elle rougit.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const indexHtml = readFileSync(path.join(racine, 'index.html'), 'utf8');

describe('nuance tâche/objectif — contenu des info-bulles', () => {
    let captured = null;
    const fauxWin = { accompagnement: { ajouterEntrees: (e) => { captured = e; } } };
    chargerScript('js/accompagnement-contenu-hover.js', {}, fauxWin);

    it('les 3 clés du gabarit sont poussées avec un hover non vide', () => {
        expect(captured, 'ajouterEntrees appelé').toBeTruthy();
        ['cn-prod-objectif', 'cn-prod-tache', 'cn-prod-detail-tache'].forEach((cle) => {
            expect(captured[cle], 'entrée ' + cle).toBeTruthy();
            expect(typeof captured[cle].hover).toBe('string');
            expect(captured[cle].hover.length).toBeGreaterThan(15);
        });
    });

    it('la tâche est dite locale, bornée et cochable', () => {
        const texte = captured['cn-prod-tache'].hover;
        expect(texte, 'caractère local').toMatch(/locale|ici/i);
        expect(texte, 'la tâche se termine').toMatch(/se termine|born/i);
        expect(texte, 'on peut cocher qu\'elle est faite').toMatch(/coch/i);
    });

    it('l\'objectif est dit transférable, sans terme et non cochable', () => {
        const texte = captured['cn-prod-objectif'].hover;
        expect(texte, 'caractère transférable').toMatch(/transf/i);
        expect(texte, 'ne se termine pas').toMatch(/sans terme|ne se termine pas/i);
        expect(texte, 'on ne coche pas un objectif').toMatch(/ne coche pas|pas coch/i);
        expect(texte, 'on en observe la progression').toMatch(/progress/i);
    });

    it('le détail de la tâche avertit du débordement ascendant', () => {
        // Le défaut le plus coûteux pour l'étudiant·e : une exigence qui
        // n'apparaît que dans le détail, découverte après la planification.
        expect(captured['cn-prod-detail-tache'].hover).toMatch(/n['’]annonce pas/i);
    });
});

describe('nuance tâche/objectif — câblage du champ « Détail de la tâche »', () => {
    it('le libellé porte son data-tooltip et son bouton d\'aide', () => {
        // ⚠ DÉPLACÉ, PAS AFFAIBLI (#500, 25 août 2026). Ce libellé vivait dans
        // `index.html` ; depuis que les blocs de consignes sont RENDUS par
        // `productions.js`, c'est là qu'il faut le chercher. Ce que la garde
        // tient n'a pas changé : le tooltip et le bouton d'aide accompagnent le
        // champ, où qu'il soit écrit. L'accompagnement fonctionne par
        // délégation d'événements, donc ces attributs gardent leur effet sur du
        // HTML posé après coup.
        const source = readFileSync(
            path.join(racine, 'js', 'productions.js'), 'utf8');
        const entree = source.match(/champId: 'productionDetailTache'[\s\S]{0,600}?\}/);
        expect(entree, 'bloc ancré productionDetailTache trouvé').toBeTruthy();
        expect(entree[0]).toContain("tooltip: 'cn-prod-detail-tache'");
        expect(entree[0]).toContain("aide: 'detail-tache-qualite'");

        // Et le rendu les pose réellement dans le DOM.
        expect(source).toContain('data-tooltip="${echapperHtml(a.tooltip)}"');
        expect(source).toContain('data-aide="${echapperHtml(a.aide)}"');
    });
});

describe('nuance tâche/objectif — pop-up des critères de qualité', () => {
    let captured = null;
    const fauxWin = { accompagnement: { ajouterEntrees: (e) => { captured = e; } } };
    chargerScript('js/accompagnement-contenu-popup.js', {}, fauxWin);

    it('detail-tache-qualite existe avec un titre et des sections', () => {
        const entree = captured && captured['detail-tache-qualite'];
        expect(entree, 'entrée detail-tache-qualite').toBeTruthy();
        expect(entree.popup.titre.length).toBeGreaterThan(5);
        expect(entree.popup.sections.length).toBeGreaterThan(1);
    });

    it('les 5 critères de qualité sont présents', () => {
        const liste = captured['detail-tache-qualite'].popup.sections
            .find((s) => s.type === 'liste');
        expect(liste, 'section liste').toBeTruthy();
        expect(liste.items.length).toBe(5);
        const joint = liste.items.join(' ');
        expect(joint, 'couverture descendante').toMatch(/laissé de côté/i);
        expect(joint, 'débordement ascendant').toMatch(/surprise/i);
        expect(joint, 'structure').toMatch(/étapes numérotées/i);
        expect(joint, 'simplicité').toMatch(/redite|simple/i);
        expect(joint, 'homogénéité').toMatch(/comparable/i);
    });

    it('les renvois « voir aussi » pointent vers des pop-ups qui existent', () => {
        captured['detail-tache-qualite'].popup.voirAussi.forEach((cle) => {
            expect(captured[cle], 'renvoi ' + cle).toBeTruthy();
        });
    });
});
