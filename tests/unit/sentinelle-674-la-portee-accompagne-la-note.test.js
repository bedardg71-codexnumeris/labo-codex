/**
 * #674 · AUCUN CHEMIN N'ÉCRIT `noteFinale` SANS SA PORTÉE — sentinelle DÉDUITE du dépôt
 *
 * La forme du correctif (énoncé 5) : la portée d'une note (`ponderationCouverte`) est
 * écrite en base À CÔTÉ de la note, par le MÊME chemin. Si un chemin écrivait la note
 * sans sa portée, c'est exactement là qu'elle manquerait — et le lot #572 a montré, le
 * 2 septembre 2026, qu'un quatrième chemin avait été oublié pendant que la sentinelle
 * restait verte : elle vérifiait une LISTE DE FICHIERS TAPÉE À LA MAIN.
 *
 * ⮕ Ici, le périmètre n'est pas tapé : il est DÉDUIT. Tout fichier de `js/` (récursif),
 * lu à chaque exécution. Un chemin qui écrit `noteFinale` depuis la valeur calculée
 * (`window.noteCalculeeCourante`, la source depuis #572) doit écrire `ponderationCouverte`
 * depuis `window.porteeCalculeeCourante` à quelques lignes de là. Un cinquième chemin
 * ajouté demain dans n'importe quel fichier sera vu sans que personne ne mette ce test
 * à jour.
 *
 * Deux témoins, pour qu'un zéro ne puisse pas mentir :
 *   · le détecteur trouve AU MOINS les quatre chemins connus (sinon c'est lui qui est
 *     aveugle, pas le dépôt qui est propre) ;
 *   · un break-test intégré lui soumet un extrait SANS portée et exige qu'il rougisse.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');

function tousLesJs(dossier) {
    const sortie = [];
    for (const nom of readdirSync(dossier)) {
        const chemin = path.join(dossier, nom);
        if (statSync(chemin).isDirectory()) sortie.push(...tousLesJs(chemin));
        else if (nom.endsWith('.js')) sortie.push(chemin);
    }
    return sortie;
}

// Une ligne qui ÉCRIT noteFinale (affectation ou propriété d'objet) depuis la valeur
// calculée. `(?!=)` écarte les comparaisons `===`.
const ECRIT_NOTE_DEPUIS_CALCUL = /\bnoteFinale\s*[:=](?!=)[^\n]*noteCalculeeCourante/;
const ECRIT_PORTEE_DEPUIS_CALCUL = /\bponderationCouverte\s*[:=](?!=)[^\n]*porteeCalculeeCourante/;
const FENETRE = 6; // lignes, de part et d'autre

/** Les lignes (1-indexées) qui écrivent la note sans sa portée à moins de FENETRE lignes. */
export function chemins_sans_portee(contenu, fenetre = FENETRE) {
    const lignes = contenu.split('\n');
    const orphelines = [];
    lignes.forEach((ligne, i) => {
        if (!ECRIT_NOTE_DEPUIS_CALCUL.test(ligne)) return;
        const debut = Math.max(0, i - fenetre);
        const fin = Math.min(lignes.length - 1, i + fenetre);
        let accompagnee = false;
        for (let j = debut; j <= fin; j++) {
            if (ECRIT_PORTEE_DEPUIS_CALCUL.test(lignes[j])) { accompagnee = true; break; }
        }
        if (!accompagnee) orphelines.push(i + 1);
    });
    return orphelines;
}

function compter(contenu) {
    return contenu.split('\n').filter((l) => ECRIT_NOTE_DEPUIS_CALCUL.test(l)).length;
}

const fichiers = tousLesJs(path.join(racine, 'js'));
const lus = fichiers.map((f) => ({ chemin: path.relative(racine, f), contenu: readFileSync(f, 'utf8') }));

describe('#674 · aucun chemin n\'écrit noteFinale sans sa portée (périmètre déduit de js/)', () => {
    it('témoin — le détecteur voit les chemins qui écrivent la note depuis la valeur calculée (≥ 4, sinon il est aveugle)', () => {
        const trouves = lus.filter((f) => compter(f.contenu) > 0)
            .map((f) => `${f.chemin} ×${compter(f.contenu)}`);
        const total = lus.reduce((n, f) => n + compter(f.contenu), 0);
        expect(total, 'chemins trouvés : ' + trouves.join(', ')).toBeGreaterThanOrEqual(4);
        // Les quatre connus le 2 septembre 2026 — un TÉMOIN du détecteur, pas son périmètre.
        expect(trouves.join(' ')).toContain('js/evaluation-sauvegarde.js');
        expect(trouves.join(' ')).toContain('js/evaluation.js');
        expect(trouves.join(' ')).toContain('js/evaluation-chargement.js ×2');
    });

    it('chaque écriture de noteFinale depuis la valeur calculée écrit ponderationCouverte à côté — dans TOUT js/', () => {
        const orphelins = [];
        for (const f of lus) {
            for (const l of chemins_sans_portee(f.contenu)) orphelins.push(`${f.chemin}:${l}`);
        }
        expect(orphelins, 'noteFinale écrite SANS sa portée à : ' + orphelins.join(', ')).toEqual([]);
    });

    it('témoin — le périmètre est bien récursif : js/ contient des sous-dossiers, et ils sont lus', () => {
        expect(lus.some((f) => f.chemin.split(path.sep).length > 2)).toBe(true);
    });

    it('break-test intégré — un chemin qui écrit la note sans la portée fait rougir la garde', () => {
        const sansPortee = [
            'return {',
            "    noteFinale: (typeof window.noteCalculeeCourante === 'number') ? window.noteCalculeeCourante : 0,",
            "    niveauFinal: document.getElementById('niveauProduction1').textContent",
            '};'
        ].join('\n');
        expect(chemins_sans_portee(sansPortee)).toEqual([2]);

        const avecPortee = [
            'return {',
            "    noteFinale: (typeof window.noteCalculeeCourante === 'number') ? window.noteCalculeeCourante : 0,",
            "    ponderationCouverte: (window.porteeCalculeeCourante && typeof window.porteeCalculeeCourante.ponderationCouverte === 'number') ? window.porteeCalculeeCourante.ponderationCouverte : null,",
            "    niveauFinal: document.getElementById('niveauProduction1').textContent",
            '};'
        ].join('\n');
        expect(chemins_sans_portee(avecPortee)).toEqual([]);

        // Une portée trop LOIN (hors fenêtre) ne compte pas : elle n'est pas « à côté ».
        const porteeLoin = sansPortee + '\n'.repeat(FENETRE + 2)
            + "x.ponderationCouverte = window.porteeCalculeeCourante.ponderationCouverte;";
        expect(chemins_sans_portee(porteeLoin)).toEqual([2]);

        // Une COMPARAISON n'est pas une écriture : `noteFinale === noteCalculeeCourante` ne déclenche rien.
        expect(chemins_sans_portee("if (e.noteFinale === window.noteCalculeeCourante) return;")).toEqual([]);
    });
});
