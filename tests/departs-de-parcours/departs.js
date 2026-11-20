// =======================================================================
// LES CODEX DE DÉPART DES PARCOURS (20 nov. 2026)
// =======================================================================
// plans de travail/CONSIGNE-2026-11-19-codex-de-depart.md, point 4. Un codex de départ s'arrête exactement là où
// un parcours commence, avec ce que les parcours d'avant auraient laissé : Grégoire ouvre le fichier dans un espace
// vide et lance le parcours, sans refaire les précédents.
//
// UNE ENTRÉE PAR PARCOURS. Pour en ajouter un (les parcours 7, 8 et 9) : mesurer ce que son code exige au départ
// (son `refus`, ce que sa première bulle suppose), écrire la préparation dans `PREPARATIONS` de
// fabriquer-codex-de-depart.spec.js si aucune ne convient, puis une entrée ici. Le banc
// tests/integration/codex-de-depart-2026-11-20.spec.js les ouvre toutes une à une.
//
// Les préparations rejouent les parcours par LEURS GESTES, avec les aides des bancs (tests/integration/harness/) :
// les noms sont ceux des bancs, manifestement fictifs (CLAUDE.md, règle 6). Aucune donnée de Grégoire.
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const RACINE = path.resolve(__dirname, '..', '..');

/** Où vivent les fichiers fabriqués (DEPARTS_DOSSIER pour un autre dossier : un essai, un break-test). */
export const DOSSIER_DES_DEPARTS = process.env.DEPARTS_DOSSIER || path.join(RACINE, 'departs');

/**
 * - `parcours` : l'identifiant du parcours (js/parcours-*.js, `Assistance.enregistrer`) ;
 * - `titre` : ce que Grégoire lit (departs.html, le nom du codex) ;
 * - `fichier` : le nom du fichier, sous DOSSIER_DES_DEPARTS ;
 * - `preparation` : la clé de la préparation (fabriquer-codex-de-depart.spec.js) ;
 * - `premiereBulle` : ce que le banc attend de la première bulle, lu dans le code le 20 nov. 2026.
 */
export const DEPARTS = [
    {
        parcours: 'recevoir',
        titre: 'Recevoir les productions',
        fichier: 'depart-recevoir-les-productions.zip',
        preparation: 'classe-et-evaluer',
        premiereBulle: { total: 9, titre: 'Leurs productions' }
    },
    {
        parcours: 'monter',
        titre: 'Monter ton cours',
        fichier: 'depart-monter-ton-cours.zip',
        preparation: 'classe-et-evaluer',
        premiereBulle: { total: 7, titre: 'Ta compétence' }
    },
    {
        parcours: 'donnees',
        titre: "Mettre tes données à l'abri",
        fichier: 'depart-mettre-tes-donnees-a-l-abri.zip',
        preparation: 'classe-et-evaluer',
        premiereBulle: { total: 4, titre: 'Pourquoi un codex' }
    }
];

/** Le nom du codex, lu à l'ouverture (« Codex ouvert : … ») et repris dans le nom d'un fichier mis à jour. */
export const nomDuCodex = (d) => 'Départ, ' + d.titre;
