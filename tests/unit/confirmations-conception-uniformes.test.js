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
    'js/pratique-notation-v2.js',
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
const NEGATIONS = /n'a (?:pas|PAS)|n'ont pas|annulée/;

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
        // On épingle l'appel exact : si quelqu'un le retire ou le remplace par un
        // alert(), la sentinelle tombe même si le vocabulaire change.
        const confirmations = [
            { fichier: 'js/productions.js',       objet: 'Production', appel: 'notifications.succes(estModification ?' },
            { fichier: 'js/grilles.js',           objet: 'Grille',     appel: 'notifications.succes(`Grille "${nomGrille}" sauvegardée !`);' },
            { fichier: 'js/echelles.js',          objet: 'Échelle',    appel: 'notifications.succes(`Échelle "${nom}" sauvegardée !`);' },
            { fichier: 'js/cartouches.js',        objet: 'Cartouche',  appel: 'notifications.succes(`Cartouche "${nomCartouche}" sauvegardée !`);' },
            { fichier: 'js/pratiques-gestion.js', objet: 'Pratique',   appel: "notifications.succes('Pratique enregistrée');" }
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
        const verdicts = [
            { fichier: 'js/echelles.js',   garde: 'const ecrite = await sauvegarderNomEchelle();' },
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
