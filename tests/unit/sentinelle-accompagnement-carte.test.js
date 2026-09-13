import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tranche } from './_helpers/tranche.js';

// ═══════════════════════════════════════════════════════════════════════════
// L'ACCOMPAGNEMENT DOIT DIRE CE QUE L'APP FAIT (16 août 2026)
//
// ⚠⚠ CE FICHIER NAÎT D'UNE INFOBULLE QUI DISAIT L'INVERSE DU BOUTON.
// `planif-cloner` affirmait « Crée un clone de ce nœud. Les modifications se
// propagent à toutes les copies. » — sur un bouton devenu « Copier », qui
// produit précisément une copie INDÉPENDANTE. Elle est restée fausse le temps
// d'un cycle, et RIEN ne pouvait la faire rougir : le contenu d'accompagnement
// n'est adossé à aucun test.
//
// ⮕ Une infobulle fausse est pire qu'une infobulle absente : elle est CRUE.
// Les cas ci-dessous n'essaient pas de valider la prose — ils verrouillent les
// quelques COUPLAGES qui, s'ils se défont, transforment l'accompagnement en
// affirmation contraire au produit.
// ═══════════════════════════════════════════════════════════════════════════

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const hover = readFileSync(path.join(racine, 'js', 'accompagnement-contenu-hover.js'), 'utf8');
const popup = readFileSync(path.join(racine, 'js', 'accompagnement-contenu-popup.js'), 'utf8');
const html = readFileSync(path.join(racine, 'index.html'), 'utf8');
const carte = readFileSync(path.join(racine, 'js', 'planification-carte.js'), 'utf8');

/** Le texte d'une entrée du catalogue hover, ou null. */
function entree(cle) {
    const m = hover.match(new RegExp("'" + cle + "':\\s*\\n\\s*('(?:[^'\\\\]|\\\\.)*')", 'm'));
    return m ? m[1] : null;
}

describe('Accompagnement de la carte · il doit dire ce que l’app FAIT', () => {

    it('⚠⚠ « Copier » ne promet PAS une propagation — c’est l’erreur fondatrice', () => {
        const t = entree('planif-cloner');
        expect(t, 'l’infobulle du bouton Copier a disparu').toBeTruthy();
        // Le bouton fait une copie indépendante : le texte doit le dire…
        expect(t).toMatch(/ind[ée]pendante/i);
        // …et surtout ne PAS promettre l'inverse.
        expect(t, 'l’infobulle promet une propagation sur un bouton qui copie')
            .not.toMatch(/se propagent|propagation/i);
    });

    it('« Cloner (lié) », lui, DOIT annoncer la propagation', () => {
        const t = entree('planif-cloner-lie');
        expect(t, 'l’infobulle du clonage lié a disparu').toBeTruthy();
        expect(t).toMatch(/propagent/i);
    });

    it('⚠ chaque infobulle neuve a un PORTEUR dans le HTML', () => {
        // Une entrée sans `data-tooltip` correspondant ne s'affiche jamais :
        // elle est écrite, chargée, et invisible. Le défaut ne se voit qu'à
        // l'usage, c'est-à-dire chez Grégoire.
        for (const cle of ['planif-cloner', 'planif-cloner-lie', 'planif-detacher-clone']) {
            expect(entree(cle), 'contenu manquant : ' + cle).toBeTruthy();
            expect(html, 'aucun élément ne porte data-tooltip="' + cle + '"')
                .toMatch(new RegExp('data-tooltip="' + cle + '"'));
        }
    });

    it('⚠ et réciproquement : tout data-tooltip « planif- » du HTML a un contenu', () => {
        // Le sens inverse du cas précédent. Un porteur sans contenu ouvre une
        // bulle vide — même symptôme muet, autre cause.
        const portes = [...html.matchAll(/data-tooltip="(planif-[a-z0-9-]+)"/g)].map((m) => m[1]);
        expect(portes.length, 'plus aucun data-tooltip planif- dans le HTML').toBeGreaterThan(5);
        const sansContenu = [...new Set(portes)].filter((c) => !entree(c));
        expect(sansContenu, 'ces infobulles s’ouvriraient vides').toEqual([]);
    });

    it('l’infobulle du menu Actions cite le déclonage qu’il contient', () => {
        // « Décloner » depuis le 3 septembre 2026 — le mot que Grégoire cherche.
        expect(entree('planif-boutons-action')).toMatch(/d[ée]cloner/i);
    });

    it('⚠ l’Inspecteur ne prétend plus régler le TYPE — il a déménagé dans l’en-tête', () => {
        const t = entree('planif-panneau-proprietes');
        expect(t, 'l’infobulle de l’Inspecteur a disparu').toBeTruthy();
        expect(t, 'elle doit renvoyer vers l’en-tête pour le type').toMatch(/en-t[êe]te/i);
    });

    it('« Vérification » a remplacé « Preuve de réussite » partout dans l’accompagnement', () => {
        expect(hover, 'l’ancien nom de famille traîne encore').not.toMatch(/Preuve de réussite/);
        expect(entree('planif-design-apprentissages')).toMatch(/V[ée]rification/);
    });

    it('la visée est expliquée AVEC sa réserve — les exports ne bougent pas sans choix', () => {
        // La réserve compte autant que la fonctionnalité : sans elle, Grégoire
        // croirait que ses plans de cours ont changé de libellé tout seuls.
        const t = entree('planif-design-apprentissages');
        expect(t).toMatch(/formative/i);
        expect(t).toMatch(/certificative/i);
        expect(t, 'la réserve sur les exports a disparu').toMatch(/[ÉE]valuation\s*»|comme avant/i);
    });

    it('le guide long de la carte couvre copie / clone et le menu d’en-tête', () => {
        const guide = popup.slice(popup.indexOf("'planification-alignement'"),
            popup.indexOf("'labo-etudes'"));
        expect(guide, 'le guide ne distingue pas copie et clone').toMatch(/clone/i);
        expect(guide, 'le guide n’explique pas le menu d’en-tête').toMatch(/même famille|m[êe]me famille/i);
        expect(guide, 'le guide n’indique pas comment décloner').toMatch(/D[ée]cloner/);
    });

    it('⚠ les deux menus d’en-tête gardent un `title` qui DIT quelque chose', () => {
        // Ils n'ont volontairement pas de `data-tooltip` (deux bulles sur un
        // <select> qu'on ouvre). Leur `title` est donc leur seul accompagnement :
        // s'il retombe à un libellé nu, il ne reste plus rien.
        // ⚠⚠ COMMENTAIRES DÉPOUILLÉS — troisième fois de la journée que la PROSE
        // casse un oracle qui lit du source. Le commentaire qui explique
        // pourquoi il n'y a pas de `data-tooltip` ici contient forcément le mot
        // `data-tooltip`, et l'assertion d'absence le trouvait. Documenter une
        // décision ne doit jamais faire rougir le test qui la protège.
        const brut = tranche(carte, 'function enTeteIdentiteHTML', 'function contenuNoeudHTML');
        const bloc = brut.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
        expect(bloc).toMatch(/famille/);
        expect(bloc).toMatch(/formative ou certificative/);
        // Et surtout : pas de data-tooltip ici, sinon la bulle se double.
        expect(bloc, 'un data-tooltip doublerait le title natif du select')
            .not.toMatch(/data-tooltip/);
    });
});
