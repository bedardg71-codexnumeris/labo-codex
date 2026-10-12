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

function absents(noms) {
    const trouves = [];
    for (const [f, src] of sources()) {
        for (const nom of noms) if (new RegExp('\\b' + nom + '\\b').test(src)) trouves.push(f + ' : ' + nom);
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
