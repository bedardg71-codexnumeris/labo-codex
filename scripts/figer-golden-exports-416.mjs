// Fige les douze sorties génériques comme références bit-à-bit (#416 lot G).
//
// ⚠ À NE LANCER QUE DÉLIBÉRÉMENT. Ce script ÉCRASE les références. Le lot G
// fond les préréglages dans les gabarits ; sa preuve est que les quatre
// sorties génériques ne bougent pas d'un octet. Régénérer les références pendant
// le refactor reviendrait à valider le résultat avec lui-même.
//
// Usage : node scripts/figer-golden-exports-416.mjs
//         node scripts/figer-golden-exports-416.mjs --verifier   (ne rien écrire)
import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { monterExportSandbox, SORTIES_GENERIQUES } from '../tests/unit/_helpers/carte-essai-exports.js';

const racine = path.resolve(import.meta.dirname, '..');
const dossier = path.join(racine, 'tests', 'fixtures', 'golden-exports-416');
const verifierSeulement = process.argv.includes('--verifier');

if (!verifierSeulement) mkdirSync(dossier, { recursive: true });

const { exporteur } = monterExportSandbox();

let ecrits = 0, identiques = 0, differents = [];

for (const { niveau, format } of SORTIES_GENERIQUES) {
    const nom = `${niveau}.${format}.txt`;
    const chemin = path.join(dossier, nom);
    const sortie = exporteur.genererExport(niveau, format);

    if (typeof sortie !== 'string' || sortie.length === 0) {
        console.log(`⛔ SORTIE VIDE — ${nom}`);
        process.exit(1);
    }

    if (existsSync(chemin)) {
        const reference = readFileSync(chemin, 'utf8');
        if (reference === sortie) { identiques++; continue; }
        differents.push(nom);
    }

    if (verifierSeulement) continue;
    writeFileSync(chemin, sortie, 'utf8');
    ecrits++;
}

if (verifierSeulement) {
    console.log(`${identiques}/${SORTIES_GENERIQUES.length} identiques.`);
    if (differents.length) {
        console.log('DIFFÈRENT : ' + differents.join(' · '));
        process.exit(1);
    }
} else {
    console.log(`${ecrits} référence(s) écrite(s), ${identiques} inchangée(s).`);
    if (differents.length) console.log('⚠ RÉÉCRITES (elles avaient changé) : ' + differents.join(' · '));
}
