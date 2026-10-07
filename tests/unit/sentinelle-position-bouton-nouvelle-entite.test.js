import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { tranche, position } from './_helpers/tranche.js';

const lire = (f) => readFileSync(new URL(`../../${f}`, import.meta.url), 'utf-8');

// UNIFORMISATION DU 16 SEPT. 2026 — demandée par Grégoire sur capture d'écran.
//
// Dans les six accordéons du Cadre, le bouton « + Nouveau… » occupe la MÊME
// place : juste sous le menu déroulant de l'entité, avant la carte d'aperçu, à
// 8 px (design-system.html §23).
//
// Avant ce jour-là, trois patrons coexistaient, chacun né d'un lot différent :
//   · Groupe d'étudiant·es : bouton DANS le div du menu, donc collé à 0 px
//     (`.btn-block:first-of-type` battait le `u-mt-10` posé sur le bouton) ;
//   · Horaire              : bouton APRÈS la carte résumé ;
//   · Groupe-cours         : bouton tout en bas du panneau.
//
// Rien ne verrouillait la position : les trois écarts se sont installés sans
// qu'aucun banc ne rougisse. C'est l'objet de cette sentinelle.
//
// La tranche va du menu AU bouton : si un jour le bouton repasse avant le menu,
// `tranche()` jette en nommant le marqueur au lieu de rendre une tranche vide
// qui laisserait les `not.toContain` ci-dessous vrais par construction (#858).

// Les six accordéons, dans l'ordre du document : menu déroulant → bouton.
const ACCORDEONS = [
    { nom: 'Trimestre', menu: 'id="selectTrimestreActif"', action: 'ouvrirCreationTrimestreV2' },
    { nom: 'Cours', menu: 'id="v2-selectCours"', action: 'nouveauCoursV2' },
    { nom: 'Enseignant·e', menu: 'id="v2-selectEnseignant"', action: 'nouveauProfilEnseignantV2' },
    { nom: 'Groupe d\'étudiant·es', menu: 'id="v2-selectGroupe"', action: 'creerNouveauGroupeV2' },
    { nom: 'Horaire', menu: 'id="v2-selectHoraire"', action: 'nouveauHoraireV2' },
    { nom: 'Groupe-cours', menu: 'id="v2-selectGroupeCours"', action: 'nouveauGroupeCoursV2' },
];

// Ce qui, dans un panneau, est un bloc de CONTENU : le bouton passe AVANT eux.
const BLOCS_DE_CONTENU = ['carte-resume-', 'apercu-', 'texte-aide', 'enseignant-carte-resume'];

describe('position du bouton « + Nouveau… » dans le Cadre', () => {
    it('A. les six boutons du Cadre, et eux seuls, portent la marque', () => {
        const html = lire('index.html');
        expect((html.match(/btn-nouvelle-entite/g) || []).length).toBe(ACCORDEONS.length);
        for (const { nom, action } of ACCORDEONS) {
            expect(html, `${nom} : le bouton doit exister`).toContain(`data-action="${action}"`);
        }
    });

    it('B. dans chaque accordéon, le bouton suit le menu et précède la carte d\'aperçu', () => {
        const html = lire('index.html');
        for (const { nom, menu, action } of ACCORDEONS) {
            // Jette si le bouton ne vient pas APRÈS le menu — le banc ne peut pas
            // rester vert en mesurant du vide.
            const duMenuAuBouton = tranche(html, menu, `data-action="${action}"`, { longueurMin: 40 });

            // La marque est ce qui donne au bouton ses 8 px : elle doit se trouver
            // entre le menu et l'action, donc sur la balise de CE bouton.
            expect(duMenuAuBouton, `${nom} : le bouton doit porter btn-nouvelle-entite`)
                .toContain('btn-nouvelle-entite');
            expect(duMenuAuBouton, `${nom} : le bouton doit être hors du div .groupe-form`).toContain('</div>');

            for (const bloc of BLOCS_DE_CONTENU) {
                expect(duMenuAuBouton, `${nom} : « ${bloc} » ne doit pas s'intercaler entre le menu et le bouton`)
                    .not.toContain(bloc);
            }
        }
    });

    it('C. la marque ne vit que sur des balises <button>', () => {
        // Posée sur un div, elle ne produirait pas la marge attendue : `.btn-block`
        // fait partie du sélecteur.
        const html = lire('index.html');
        expect((html.match(/<button[^>]*btn-nouvelle-entite/g) || []).length).toBe(ACCORDEONS.length);
        expect((html.match(/btn-block btn-nouvelle-entite/g) || []).length).toBe(ACCORDEONS.length);
    });

    it('D. la règle CSS vient APRÈS :first-of-type, sinon la marge retombe à 0', () => {
        const css = lire('styles.css');
        const remiseAZero = position(css, '#calendrier-trimestre .btn-block:first-of-type');
        const regle = position(css, '#calendrier-trimestre .btn-block.btn-nouvelle-entite');
        expect(regle, 'à spécificité égale, la dernière déclarée gagne').toBeGreaterThan(remiseAZero);
    });

    it('E. l\'écart sous le menu est celui du design system (8 px)', () => {
        const css = lire('styles.css');
        const regle = tranche(css, '#calendrier-trimestre .btn-block.btn-nouvelle-entite', '}', { longueurMin: 20 });
        expect(regle).toMatch(/margin-top:\s*8px/);
        // Sans cette seconde règle, la marge basse du .groupe-form fusionne avec
        // celle du bouton et impose 20px (--espacement-moyen) au lieu de 8.
        const annulation = tranche(css, '#calendrier-trimestre .groupe-form:has(+ .btn-nouvelle-entite)', '}', { longueurMin: 20 });
        expect(annulation).toMatch(/margin-bottom:\s*0/);
    });
});
