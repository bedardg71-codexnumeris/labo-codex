import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// =======================================================================
// SENTINELLE — on ne révèle PAS un `.u-hide` avec `style.display`
// =======================================================================
//
// `.u-hide { display: none !important; }` (styles.css). Un style EN LIGNE ne
// peut pas contrer un `!important` : `element.style.display = ''` sur un
// élément qui porte `u-hide` ne révèle donc RIEN. La ligne a pourtant l'air
// de fonctionner — elle ne lève pas, elle ne prévient pas, elle ne fait rien.
//
// ⮕ TROUVÉ LE 10 AOÛT 2026, en répondant à « je ne trouve pas le bouton
// Supprimer ». `editerGroupeCoursV2` révélait le bouton de suppression du
// groupe-cours par `style.display = ''`. Un seul chemin masquait le défaut :
// `changerGroupeCoursSelectionneV2` retire la classe LUI-MÊME juste après
// avoir appelé cette fonction. Mais `chargerGroupeCoursV2` — la restauration
// du groupe actif à l'arrivée sur la section, donc le cas NORMAL — l'appelle
// SANS ce filet : le formulaire s'ouvrait et le bouton restait introuvable.
// Il n'apparaissait qu'après avoir touché au menu déroulant.
//
// ▣ C'est la famille de la journée : une opération qui a l'air d'agir et
// n'agit pas. Un garde `typeof` sur un nom jamais exporté, une invalidation
// de cache qu'aucune écriture ne déclenche, et maintenant un affichage qui
// n'affiche pas. Aucune ne lève ; toutes se taisent.
//
// Ce qui est verrouillé ici :
//   A. les deux boutons Supprimer du Cadre sont révélés par `classList.remove` ;
//   B. AUCUN `style.display` ne prétend révéler ces boutons ;
//   C. la prémisse elle-même : `.u-hide` porte bien `!important` — sans quoi
//      le raisonnement ci-dessus tomberait et la règle n'aurait plus d'objet.

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lire = (...p) => readFileSync(path.join(racine, ...p), 'utf8');

const BOUTONS = [
    { fichier: ['js', 'trimestre-v2-cours.js'], id: 'v2-btnSupprimerCours' },
    { fichier: ['js', 'trimestre-v2-groupes-cours.js'], id: 'v2-btnSupprimerGroupeCours' }
];

describe('révéler un élément `.u-hide` — classList, jamais style.display', () => {

    it('C · la prémisse tient : `.u-hide` est bien en !important', () => {
        // Si cette règle perdait son `!important`, `style.display` redeviendrait
        // opérant et les deux cas suivants perdraient leur raison d'être. On
        // vérifie donc la prémisse plutôt que de la supposer.
        const css = lire('styles.css');
        expect(css).toMatch(/\.u-hide\s*\{\s*display:\s*none\s*!important;?\s*\}/);
    });

    BOUTONS.forEach(({ fichier, id }) => {
        const nom = fichier[fichier.length - 1];

        it(`A · ${nom} révèle ${id} par classList.remove('u-hide')`, () => {
            const src = lire(...fichier);
            // Au moins un site retire réellement la classe pour ce bouton.
            const motif = new RegExp(
                "getElementById\\('" + id + "'\\)[\\s\\S]{0,600}?classList\\.remove\\('u-hide'\\)"
            );
            expect(src).toMatch(motif);
        });

        it(`B · ${nom} ne prétend PAS révéler ${id} par style.display`, () => {
            const src = lire(...fichier);
            // On retire les commentaires : ils CITENT le défaut corrigé, et une
            // sentinelle qui trouve sa cible dans sa propre explication ne prouve
            // rien (le piège de la sous-chaîne, quatre fois le 10 août).
            const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
            const motif = new RegExp(
                "getElementById\\('" + id + "'\\)[\\s\\S]{0,200}?\\.style\\.display\\s*="
            );
            expect(code).not.toMatch(motif);
        });
    });

    it('D · le chemin de restauration ne dépend plus du filet de son appelant', () => {
        // `chargerGroupeCoursV2` restaure le groupe actif à l'arrivée sur la
        // section et appelle `editerGroupeCoursV2` SANS retirer la classe
        // lui-même. C'est ce chemin-là qui était cassé : la révélation doit
        // donc vivre DANS `editerGroupeCoursV2`, pas chez ses appelants.
        const src = lire('js', 'trimestre-v2-groupes-cours.js');
        const debut = src.indexOf('function editerGroupeCoursV2');
        expect(debut).toBeGreaterThan(-1);
        // Fin de fonction : le prochain `\nfunction ` en début de ligne.
        const suite = src.indexOf('\nfunction ', debut + 10);
        const corps = src.slice(debut, suite === -1 ? undefined : suite);
        // ⚠ Resserrée après break-test : `toContain("classList.remove('u-hide')")`
        // restait VERT quand on cassait le bouton, parce que la même fonction
        // déclasse AUSSI le formulaire (`formulaire.classList.remove(...)`).
        // L'assertion visait la bonne fonction et le mauvais élément.
        expect(corps).toMatch(/btnSupprimer\s*\)?\s*btnSupprimer\.classList\.remove\('u-hide'\)|btnSupprimer\.classList\.remove\('u-hide'\)/);
    });
});
