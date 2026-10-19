/**
 * Les modèles figés de l'assistant en sept étapes (retiré le 19 oct. 2026).
 *
 * L'assistant lisait une grille collée et en préparait un MODÈLE, que la logique commune reçoit encore
 * (`materielAssistant.calculs`, `construire`, `materielCreation.creer`, la confirmation de `materiel.js`) :
 * la dissection lui en donne un de la même forme. Les bancs qui éprouvent cette logique prennent les
 * modèles que l'assistant produisait, figés avant son retrait (`tests/fixtures/materiel/modeles-assistant-figes.json`).
 * Le code qui les fabriquait est parti : ne pas les régénérer.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const fichier = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'fixtures', 'materiel', 'modeles-assistant-figes.json');
const MODELES = JSON.parse(readFileSync(fichier, 'utf8')).modeles;

/** Une copie neuve du modèle figé `nom` : chaque essai peut la modifier sans toucher aux autres. */
export function fige(nom) {
    if (!Object.prototype.hasOwnProperty.call(MODELES, nom)) throw new Error('modèle figé inconnu : ' + nom);
    return JSON.parse(JSON.stringify(MODELES[nom]));
}
