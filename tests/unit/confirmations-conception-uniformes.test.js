import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');

// Sentinelle — uniformité des confirmations de la section Conception
// (24 août 2026, demande de Grégoire : « la confirmation n'a pas la même forme
// selon qu'il s'agisse d'une production, d'une grille, d'une échelle, d'une
// cartouche »).
//
// RÈGLE : dans les modules de Conception, une action RÉUSSIE se confirme par le
// panneau glissant `notifications.succes()` / `notifications.info()` — jamais par
// `alert()`, qui bloque la page derrière un dialogue natif du navigateur.
//
// Ce que la sentinelle NE dit PAS : les `alert()` de VALIDATION et d'ERREUR
// restent légitimes (« Le nom est obligatoire », « Fichier JSON invalide »).
// Ils interrompent volontairement l'enseignant parce que l'action n'a PAS eu
// lieu et qu'il doit corriger quelque chose. Seules les confirmations migrent.
const MODULES_CONCEPTION = [
    'js/productions.js',
    'js/productions-liste.js',
    'js/productions-import-export.js',
    'js/productions-bibliotheque.js',
    'js/productions-bibliotheque-ui.js',
    'js/grilles.js',
    'js/grilles-bibliotheque.js',
    'js/echelles.js',
    'js/echelles-bibliotheque.js',
    'js/cartouches.js',
    'js/cartouches-bibliotheque.js',
    'js/pratiques.js',
    'js/pratiques-gestion.js',
    'js/pratiques-bibliotheque.js',
    'js/wizard-pratique-v2.js',
    'js/comparateur-pratiques.js',
    'js/planification-carte.js'
];

// Participes passés + marqueurs explicites de réussite : le vocabulaire d'une
// action ACCOMPLIE. Les infinitifs (« à exporter », « avant de le supprimer »)
// et les impératifs (« Crée d'abord une grille ») ne matchent pas — ce sont des
// consignes, pas des confirmations.
const VOCABULAIRE_CONFIRMATION =
    /avec succès|✅|réussi|\b(sauvegard|enregistr|dupliqu|import|export|partag|cré|ajout|supprim|copi|activ|désactiv|migr|assign)(ée?s?)\b/i;

// Le même vocabulaire employé pour dire qu'une action N'A PAS eu lieu : une
// annulation, un refus d'écriture. Ces alertes-là sont légitimes — elles
// signalent un échec que l'enseignant doit voir avant de continuer.
// ⚠ ÉLARGI le 31 août 2026 (#624), sur DEUX ratés mesurés — pas sur un cas gênant.
// 1. L'APOSTROPHE ÉCHAPPÉE. Dans une source JS entre quotes simples, la négation
//    s'écrit `n\'a pas` : le backslash cassait l'appariement, et TOUTE négation
//    ainsi échappée passait à travers. Faiblesse latente, pas propre à une ligne.
// 2. LE GENRE. Le motif n'avait que « annulée ». « Déplacement annulé » au
//    masculin n'était pas reconnu.
// Témoin avant élargissement : sur les 21 alertes du dépôt à vocabulaire de
// confirmation, UNE SEULE bascule de « signalée » à « exemptée ». La sentinelle
// ne perd donc rien d'autre — vérifié, pas supposé.
const NEGATIONS = /n\\?'a (?:pas|PAS)|n\\?'ont pas|annulé(?:e)?/;

// Soupape pour un faux positif que la négation ne couvre pas. Vide à dessein :
// toute entrée ajoutée ici doit être justifiée en commentaire — ce n'est pas un
// endroit où ranger une confirmation qu'on n'a pas voulu migrer.
const FAUX_POSITIFS_CONNUS = [];

function lignesAlerte(cheminRelatif) {
    const contenu = fs.readFileSync(path.join(racineProjet, cheminRelatif), 'utf8');
    return contenu.split('\n')
        .map((texte, i) => ({ fichier: cheminRelatif, ligne: i + 1, texte: texte.trim() }))
        // Le code seulement : ni commentaires de ligne, ni lignes de bloc JSDoc.
        .filter(l => !l.texte.startsWith('//') && !l.texte.startsWith('*') && !l.texte.startsWith('/*'))
        .filter(l => /\balert\s*\(/.test(l.texte));
}

describe('Conception · uniformité des confirmations (panneau glissant)', () => {
    it('les modules de Conception existent tous', () => {
        for (const module of MODULES_CONCEPTION) {
            expect(
                fs.existsSync(path.join(racineProjet, module)),
                `Module introuvable : ${module}. La liste de la sentinelle a dérivé du dépôt.`
            ).toBe(true);
        }
    });

    it('aucune confirmation de succès ne passe par alert()', () => {
        const fautives = MODULES_CONCEPTION
            .flatMap(lignesAlerte)
            .filter(l => VOCABULAIRE_CONFIRMATION.test(l.texte))
            .filter(l => !NEGATIONS.test(l.texte))
            .filter(l => !FAUX_POSITIFS_CONNUS.includes(l.texte));

        const rapport = fautives
            .map(l => `  ${l.fichier}:${l.ligne}\n      ${l.texte}`)
            .join('\n');

        expect(
            fautives,
            `Confirmation(s) de succès encore en alert() dans la section Conception.\n` +
            `Utilise notifications.succes(message, details) — le panneau glissant en haut à droite :\n${rapport}\n`
        ).toHaveLength(0);
    });

    it('chaque éditeur de Conception confirme sa sauvegarde par notifications.succes', () => {
        // Les cinq boutons « Enregistrer » de la section, un par objet de travail.
        // ↻ Lot E1 (D3, 27 sept. 2026) : pour la grille, l'échelle, la cartouche et la pratique,
        // modifier s'enregistre tout seul (le témoin commun le dit) ; seul le geste de CRÉATION
        // garde son panneau glissant, « … créée. » — celui de la pratique vit dans l'assistant.
        // ↻ Lot E3 (D3, 28 sept. 2026) : la production suit, « Production « … » créée. ».
        // On épingle l'appel exact : si quelqu'un le retire ou le remplace par un
        // alert(), la sentinelle tombe même si le vocabulaire change.
        const confirmations = [
            { fichier: 'js/productions.js',       objet: 'Production', appel: 'notifications.succes(`Production «\\u00a0${productionData.titre}\\u00a0» créée.`);' },
            { fichier: 'js/grilles.js',           objet: 'Grille',     appel: 'notifications.succes(`Grille «\\u00a0${nomGrille}\\u00a0» créée.`);' },
            { fichier: 'js/echelles.js',          objet: 'Échelle',    appel: 'notifications.succes(`Échelle «\\u00a0${nom}\\u00a0» créée.`);' },
            { fichier: 'js/cartouches.js',        objet: 'Cartouche',  appel: 'notifications.succes(`Cartouche «\\u00a0${nomCartouche}\\u00a0» créée.`);' },
            { fichier: 'js/wizard-pratique-v2.js', objet: 'Pratique',  appel: ': `Pratique «\\u00a0${pratique.nom}\\u00a0» créée.`);' }
        ];

        for (const { fichier, objet, appel } of confirmations) {
            const contenu = fs.readFileSync(path.join(racineProjet, fichier), 'utf8');
            expect(
                contenu.includes(appel),
                `${objet} · ${fichier} ne confirme plus sa sauvegarde par le panneau glissant.\n` +
                `      Appel attendu : ${appel}`
            ).toBe(true);
        }
    });

    it('la sauvegarde n\'est annoncée qu\'après une écriture confirmée', () => {
        // #466/CO-16 : grilles.js refusait déjà bruyamment l'écriture d'un objet
        // absent du trimestre actif. Échelles et cartouches annonçaient encore
        // « sauvegardée » après un refus — les deux relaient désormais un verdict.
        // ↻ Lot E1 (D3) : la branche « Enregistrer une échelle existante » est retirée avec son
        // bouton ; la création écrit par `modifierEtAnnoncer`, qui REJETTE sur un échec — le
        // « créée. » qui suit n'est donc jamais atteint après un refus.
        const verdicts = [
            { fichier: 'js/cartouches.js', garde: 'const ecrite = await sauvegarderCartouche();' }
        ];

        for (const { fichier, garde } of verdicts) {
            const contenu = fs.readFileSync(path.join(racineProjet, fichier), 'utf8');
            const i = contenu.indexOf(garde);
            expect(i, `${fichier} ne lit pas le verdict d'écriture : ${garde}`).toBeGreaterThan(-1);
            expect(
                contenu.slice(i, i + 400).includes('if (!ecrite) return;'),
                `${fichier} lit le verdict mais confirme quand même en cas de refus.`
            ).toBe(true);
        }
    });
});
