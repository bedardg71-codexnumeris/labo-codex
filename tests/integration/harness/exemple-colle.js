/**
 * La grille fictive de l'exemple, ouverte COMME UN COLLAGE : une dissection de la personne, qui écrit son brouillon et
 * peut créer une grille (`materielDissection.ouvrir`, le chemin d'un collage lu).
 *
 * Jusqu'au 13 nov. 2026, les bancs y arrivaient par « Essayer avec un exemple ». Le bouton est parti avec le lot « La
 * carte d'aide dans Apporter mon matériel » : il écrivait l'exemple à la place du brouillon de l'enseignant·e. Les deux
 * boutons qui le remplacent ouvrent l'exemple sans rien écrire, et il ne se crée pas : les bancs qui étiquettent la
 * grille fictive jusqu'à « Créer ma grille » la collent donc, comme une grille à soi.
 */
export async function collerLExemple(page) {
    await page.evaluate(() => window.materielDissection.ouvrir(window.materielDissectionLecture.exempleDoc()));
}
