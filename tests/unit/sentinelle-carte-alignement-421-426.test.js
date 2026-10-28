import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// =======================================================================
// SENTINELLE — #426 le renommage · #421 la conformité du manuel (9 août 2026)
// =======================================================================
//
// #426 : l'onglet « Alignement pédagogique » devient « Carte d'alignement ».
// Un renommage d'onglet ruisselle : le libellé de `config.js`, le titre de la
// sous-section, les chemins de navigation cités en prose dans l'aide, les
// popups et le glossaire. Ce qui n'est PAS renommé — et que ce test protège
// aussi — c'est le CONCEPT « alignement pédagogique » : le terme de glossaire
// et les définitions gardent le mot, seul l'ONGLET change de nom.
//
// #421 : le manuel doit décrire l'interface RÉELLE. Trois défauts de la même
// famille sont verrouillés ici :
//   • un chemin de navigation qui nomme une section disparue (« Planification »
//     n'existe plus depuis la réorganisation du 3 avril 2026) ;
//   • une infobulle qui décrit une commande retirée (les filtres du canevas,
//     partis avec #420) ou qui n'est plus ancrée nulle part ;
//   • un catalogue d'infobulles qui déclare des clés que le DOM n'utilise pas —
//     du contenu mort qui ne peut pas se voir échouer.
//
// ⚠ Le dernier point est le seul qui MORD à l'usage : une clé orpheline ne
// casse rien, elle ment en silence dans un fichier qui sert de référence.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const sourceIndex = readFileSync(path.join(racine, 'index.html'), 'utf8');
const sourceConfig = readFileSync(path.join(racine, 'js', 'config.js'), 'utf8');
const sourceHover = readFileSync(path.join(racine, 'js', 'accompagnement-contenu-hover.js'), 'utf8');
const sourceTerme = readFileSync(path.join(racine, 'js', 'accompagnement-contenu-terme.js'), 'utf8');
const sourcePopup = readFileSync(path.join(racine, 'js', 'accompagnement-contenu-popup.js'), 'utf8');
const sourceTour = readFileSync(path.join(racine, 'js', 'accompagnement.js'), 'utf8');
const sourceCarte = readFileSync(path.join(racine, 'js', 'planification-carte.js'), 'utf8');

describe('#426 · l’onglet porte son nouveau nom, partout où il est nommé', () => {
    it('config.js déclare le libellé « Carte d’alignement »', () => {
        expect(sourceConfig).toMatch(/\{\s*id:\s*'carte',\s*label:\s*"Carte d'alignement"\s*\}/);
    });

    it('le titre de la sous-section suit', () => {
        expect(sourceIndex).toContain("<span>Carte d'alignement</span>");
    });

    it('l’ANCIEN libellé n’est plus déclaré comme nom d’onglet', () => {
        // Scopé : le mot reste légitime partout où il désigne le CONCEPT.
        expect(sourceConfig).not.toContain("label: 'Alignement pédagogique'");
        expect(sourceIndex).not.toContain('<span>Alignement pédagogique</span>');
    });

    it('les chemins de navigation cités en prose mènent au bon onglet', () => {
        // Aide (accordéon « Planifier les leçons ») et popup des verbes actifs.
        expect(sourceIndex).toContain("Conception → Carte d'alignement");
        expect(sourceIndex).not.toContain('Conception → Alignement pédagogique');
        expect(sourcePopup).not.toContain('Conception → Alignement pédagogique');
    });

    it('le glossaire renvoie à Conception, plus à la section « Planification » disparue', () => {
        expect(sourceTerme).not.toContain("voir: 'Planification > Alignement'");
        expect(sourceTerme).not.toContain("voir: 'Planification > Organisateur'");
        // ↻ #1152, lot 3 (28 oct. 2026) : « › » et les libellés de js/config.js (consigne du lot 3, §2.1).
        expect(sourceTerme).toContain("voir: 'Conception › Carte d\\'alignement'");
    });

    it('le CONCEPT « alignement pédagogique » n’a PAS été renommé', () => {
        // Le renommage porte sur l'onglet, pas sur la notion : un test qui ne
        // vérifie que la disparition du mot autoriserait de le supprimer trop
        // largement, et personne ne le verrait.
        expect(sourceTerme).toContain("terme: 'Alignement pédagogique'");
    });

    it('le tour guidé ne promet plus la page « plan de la leçon », supprimée en 1.57.0', () => {
        expect(sourceTour).not.toMatch(/plan de la le\\u00e7on|plan de la leçon/i);
        expect(sourceTour).toMatch(/titre: 'Carte d\\?'alignement \(optionnel\)'/);
    });
});

describe('#421 · le catalogue d’infobulles ne décrit que ce qui existe', () => {
    /** Les clés `planif-*` déclarées par le catalogue de survol. */
    function clesDeclarees() {
        const cles = [];
        const re = /^\s{4}'(planif-[a-z-]+)':/gm;
        let m;
        while ((m = re.exec(sourceHover)) !== null) cles.push(m[1]);
        expect(cles.length).toBeGreaterThan(5);
        return cles;
    }

    /** Les clés `planif-*` réellement ancrées par un `data-tooltip` du DOM. */
    function clesAncrees() {
        const ancres = new Set();
        const re = /data-tooltip="(planif-[a-z-]+)"/g;
        let m;
        while ((m = re.exec(sourceIndex)) !== null) ancres.add(m[1]);
        expect(ancres.size).toBeGreaterThan(5);
        return ancres;
    }

    it('aucune clé `planif-*` déclarée n’est orpheline', () => {
        const ancres = clesAncrees();
        const orphelines = clesDeclarees().filter((c) => !ancres.has(c));
        expect(orphelines, 'clés déclarées sans ancre dans index.html').toEqual([]);
    });

    it('aucune ancre `planif-*` du DOM n’est sans texte', () => {
        const declarees = new Set(clesDeclarees());
        const muettes = [...clesAncrees()].filter((c) => !declarees.has(c));
        expect(muettes, 'ancres du DOM sans entrée au catalogue').toEqual([]);
    });

    it('les quatre clés mortes du 9 août ne reviennent pas', () => {
        // planif-alignement / planif-sous-nav : doublons de `nav-conception-alignement`.
        // planif-barre-outils / planif-filtres : décrivaient les filtres du
        // canevas, retirés par #420.
        // nav-planification : la section « Planification » n'existe plus.
        for (const morte of ['planif-alignement', 'planif-sous-nav', 'planif-barre-outils',
                             'planif-filtres', 'nav-planification']) {
            expect(sourceHover, morte).not.toContain("'" + morte + "':");
        }
    });

    it('la zone « Enseignement explicite » de la palette a enfin son infobulle', () => {
        // Elle était la seule des six zones à ne pas en avoir — ajoutée avec
        // la famille par #422, jamais documentée.
        // ⚠ Retargeté le 10 août 2026 (#444) : l'étiquette de famille est
        // devenue un <button> d'accordéon (la palette dépassait l'écran iPad).
        // L'invariant visé — CETTE zone porte SON infobulle — est inchangé ;
        // seule la balise l'est. Sondé par attribut plutôt que par balisage
        // littéral, pour ne plus casser au prochain changement de conteneur.
        expect(sourceIndex).toMatch(
            /class="planif-palette-zone-label"[^>]*data-tooltip="planif-enseignement-explicite"[^>]*>[\s\S]{0,80}?Enseignement explicite/
        );
    });
});

describe('#421 · le guide intégré couvre l’objectif de leçon', () => {
    /** Le contenu de GUIDE_PAGES, bornes vérifiées avant le slice (leçon #413). */
    function blocGuidePages() {
        const debut = sourceCarte.indexOf('var GUIDE_PAGES = [');
        expect(debut).toBeGreaterThan(-1);
        const fin = sourceCarte.indexOf('\n];\n', debut);
        expect(fin).toBeGreaterThan(debut);
        return sourceCarte.slice(debut, fin);
    }

    it('une page entière est consacrée à ce que la leçon vise', () => {
        const bloc = blocGuidePages();
        expect(bloc).toContain("titre: 'Ce que la leçon vise'");
        // Les trois gestes que la page doit nommer : le badge qui déplie, la
        // saisie, et le rattachement déclaratif côté activité (#403).
        expect(bloc).toContain('🎯');
        expect(bloc.toLowerCase()).toContain('objectifs servis');
    });

    it('le compte d’étapes annoncé en page 1 suit le nombre réel de pages', () => {
        // C'est l'erreur exacte qu'on corrige : le guide annonçait 7 étapes
        // pour 8 pages. L'assertion se calcule, elle ne recopie pas un chiffre.
        const bloc = blocGuidePages();
        const nbPages = (bloc.match(/^\s{8}titre: /gm) || []).length;
        expect(nbPages).toBeGreaterThan(1);
        // ↻ Réancré le 27 sept. 2026 (#966) : le texte validé par Grégoire dit
        // « repères » et non plus « étapes ». Le compte, lui, reste calculé.
        expect(bloc).toContain('propose ' + (nbPages - 1) + '\\u00a0repères');
    });

    it('l’infobulle du bouton Guide annonce le bon nombre de PAGES', () => {
        const bloc = blocGuidePages();
        const nbPages = (bloc.match(/^\s{8}titre: /gm) || []).length;
        expect(sourceHover).toContain('guide de la carte (' + nbPages + ' pages');
    });
});
