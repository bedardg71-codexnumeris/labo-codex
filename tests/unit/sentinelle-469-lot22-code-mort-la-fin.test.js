import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Sentinelle #469, lot 22 (12 oct. 2026) — LE CODE MORT, LA FIN.
//
// Chaque nom ci-dessous a été retiré après une recherche d'appelants dans js/, index.html,
// noms_stables.json et tests/ (aucun appelant vivant), puis Vitest complet. Le banc verrouille
// qu'aucun ne revienne : un nom qui réapparaît doit venir avec son appelant, et sortir d'ici.

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lire = (f) => readFileSync(path.join(RACINE, f), 'utf8');
const sources = () => readdirSync(path.join(RACINE, 'js')).filter((f) => f.endsWith('.js'))
    .map((f) => ['js/' + f, lire('js/' + f)]).concat([['index.html', lire('index.html')]]);

// Un nom cité dans un commentaire (l'histoire d'un correctif) n'est pas un appel : hors compte.
const sansCommentaires = (src) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/<!--[\s\S]*?-->/g, '')
    .split('\n').filter((l) => !/^\s*\/\//.test(l)).join('\n');

function absents(noms) {
    const trouves = [];
    for (const [f, src] of sources()) {
        const code = sansCommentaires(src);
        for (const nom of noms) if (new RegExp('\\b' + nom + '\\b').test(code)) trouves.push(f + ' : ' + nom);
    }
    return trouves;
}

describe('#469 · A — le trio « modèles de pratiques » et ce qu\'il entraînait', () => {
    // pratiques-bibliotheque.js : la cible `v2-spec-dropdown-modeles` n'existait plus, aucun
    // appelant. Entraînées : le générateur du sélecteur et l'enregistrement de la configuration
    // courante (seuls appelants : le trio) ; le compteur `getNombrePratiquesBibliotheque`
    // (aucun appelant). `appliquerConfigurationPratique` reste : pratiques-gestion.js l'appelle.
    const NOMS = ['chargerDropdownModelesPratiques', 'appliquerModeleSelectionne', 'ouvrirModaleSauvegardeConfig',
        'genererSelecteurModelesPratiques', 'sauvegarderConfigurationActuelle', 'getNombrePratiquesBibliotheque',
        'v2-spec-dropdown-modeles'];
    it('aucun des sept noms ne revient dans js/ ni index.html', () => {
        expect(absents(NOMS)).toEqual([]);
    });
    it('témoin : appliquerConfigurationPratique, vivante, est toujours là et appelée', () => {
        expect(lire('js/pratiques-bibliotheque.js')).toMatch(/async function appliquerConfigurationPratique\(/);
        expect(lire('js/pratiques-gestion.js')).toMatch(/await appliquerConfigurationPratique\(/);
    });
});

describe('#469 · B — l\'îlot de pratiques.js', () => {
    // Graphe d'appels interne (12 oct. 2026) : racines = noms cités hors du fichier (js/, index.html,
    // data-action compris) ou par son code de module ; une fonction n'est morte que si aucune
    // fonction vivante ne l'appelle. 54 fonctions, 28 mortes, retirées (1 035 lignes). Après : 26,
    // toutes vivantes au même graphe. Le bouton qui ouvrait l'ancienne « Bibliothèque de
    // pratiques » de ce fichier n'existe plus : la bibliothèque vivante est celle de
    // pratiques-gestion.js.
    const NOMS = ['definirPratiqueParDefaut', 'changerPratiqueParDefaut', 'genererSelecteurPratiqueParDefaut',
        'togglePratique', 'activerPratique', 'editerPratiqueActive', 'activerPratiqueAffichee',
        'exporterPratiqueVersJSON', 'importerPratiqueJSON', 'ouvrirModalBibliothequePratiques',
        'retirerPratiqueDeBibliotheque', 'ajouterPratiqueIndividuelle', 'supprimerPratiqueHorsBibliotheque',
        'partagerPratique', 'exporterPratiqueActive', 'afficherConfigSpecType', 'ajouterTypeTravailSpec',
        'retirerTypeTravailSpec', 'ajouterPalierBundle', 'retirerPalierBundle', 'genererObjectifsSpec',
        'alertFonctionnaliteAVenir', 'listerPratiquesConfigurables', 'supprimerPratiqueParNom',
        'toggleAccordeon', 'onEchelleConformiteChange', 'populerSelecteursAvecEchelle', 'calculerSeuilMaxNiveau'];
    it('aucun des vingt-huit noms ne revient dans js/ ni index.html', () => {
        expect(NOMS.length).toBe(28);
        expect(absents(NOMS)).toEqual([]);
    });
    it('témoin : le flux vivant reste (initialisation, chargement d\'une configuration, règles de conformité)', () => {
        const src = lire('js/pratiques.js');
        for (const nom of ['initialiserModulePratiques', 'chargerConfigurationPratique',
                           'initialiserReglesConformite', 'populerSelecteursNiveaux']) {
            expect(src, nom).toMatch(new RegExp('function ' + nom + '\\('));
        }
    });
});

describe('#469 · C — l\'ancienne génération des grilles, échelles et cartouches (la moitié sûre)', () => {
    // Même graphe d'appels sur grilles.js, echelles.js, cartouches.js et les trois
    // *-bibliotheque.js : 48 fonctions mortes. Retirées ici les 27 sans banc, sans nom
    // protégé (noms_stables.json) et qui ne sont pas des outils de console. Les 21 autres sont
    // mesurées dans la demande de relecture du lot 22.
    const NOMS = ['genererBadgeSourceGrille', 'genererIdCourtGrille', 'exporterGrilleActive', 'ajouterGrillesABibliotheque',
        'genererBadgeSourceEchelle', 'genererIdCourtEchelle', 'mettreAJourOptionsEchelle', 'exporterEchelleActive',
        'ajouterEchellesABibliotheque', 'genererBadgeSourceCartouche', 'genererIdCourtCartouche',
        'afficherImportCommentaires', 'populerDropdownGrilleCartouche', 'importerDepuisMarkdown', 'importerPartiel',
        'ajouterCartouchesABibliotheque', 'obtenirGrillesParDiscipline', 'exporterBibliothequeGrilles',
        'getNombreGrillesBibliotheque', 'obtenirEchellesParDiscipline', 'exporterBibliothequeEchelles',
        'getNombreEchellesBibliotheque', 'obtenirCartouchesParDiscipline', 'obtenirDisciplinesDisponiblesCartouches',
        'importerCartouchesDansBibliotheque', 'exporterBibliothequeCartouches', 'getNombreCartouchesBibliotheque'];
    it('aucun des vingt-sept noms ne revient dans js/ ni index.html', () => {
        expect(NOMS.length).toBe(27);
        expect(absents(NOMS)).toEqual([]);
    });
});
