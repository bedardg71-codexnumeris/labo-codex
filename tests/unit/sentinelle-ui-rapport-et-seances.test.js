import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tranche } from './_helpers/tranche.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const lire = (rel) => readFileSync(path.join(racineProjet, rel), 'utf8');

// =======================================================================
// SENTINELLE UI — deux demandes de Grégoire du 22 août 2026 (captures)
// =======================================================================
//
// 1. « Je voudrais plus d'espace pour le champ Heure et que tous les champs
//    soient sur une même ligne. » La grille CSS déclarait CINQ colonnes pour
//    SIX champs (Séance N · jour · début · « à » · fin · local) : le local
//    était rejeté sur une deuxième rangée implicite. Et les 80 px des heures
//    tronquaient la valeur — « 08:0 » au lieu de « 08:00 ».
//
// 2. « Changer les termes "Grille imprimable" par "Rapport" et que le bouton
//    soit dans l'encadré bleu à gauche du bouton "Enregistrer". » Le bouton
//    vivait dans l'en-tête foncé « Enregistrement ».

describe('UI · la rangée de séance tient sur une seule ligne', () => {
    const css = lire('styles.css');
    const bloc = tranche(css, '.seance-horaire-ligne {');
    const regle = bloc.slice(0, bloc.indexOf('}'));

    // #540 lot E1 a ajouté le champ Périodes sans sa colonne, et ce banc, qui comptait
    // « 6 » en dur, est resté vert (capture de Grégoire, 16 sept. 2026). Le compte
    // attendu se lit maintenant dans le gabarit de la rangée.
    it('la grille déclare autant de colonnes que la rangée a de champs', () => {
        const js = lire('js/trimestre-v2-horaires.js');
        const debut = js.indexOf('<div class="seance-horaire-ligne">');
        expect(debut).toBeGreaterThan(-1);
        // #888 : la case Périodes et son mot « pér. » vivent dans un conteneur, qui occupe
        // UNE colonne. On compte donc les enfants DIRECTS de la rangée, en suivant la
        // profondeur des balises, jusqu'à sa fermeture.
        const balises = js.slice(debut).matchAll(/<(\/?)([a-z]+)\b[^>]*>/g);
        const VIDES = new Set(['input', 'br', 'img']);
        let profondeur = 0;
        let nbChamps = 0;
        for (const [, fermante, nom] of balises) {
            if (fermante) { profondeur--; if (profondeur === 0) break; continue; }
            if (profondeur === 1) nbChamps++;
            if (!VIDES.has(nom)) profondeur++;
        }
        expect(profondeur, 'la rangée ne se referme pas dans le gabarit').toBe(0);
        expect(nbChamps).toBeGreaterThanOrEqual(7);

        const m = regle.match(/grid-template-columns:\s*([^;]+);/);
        expect(m, 'grid-template-columns introuvable').not.toBeNull();

        // compter les pistes sans se faire piéger par les espaces des minmax()
        const pistes = m[1].replace(/minmax\([^)]*\)/g, 'X').trim().split(/\s+/);
        expect(
            pistes.length,
            `${nbChamps} champs, ${pistes.length} colonne(s) : le dernier retombe sur une 2e rangée.`
        ).toBe(nbChamps);
    });

    it('les champs atteignent la cible tactile iPad de 44 px — Périodes compris', () => {
        const zone = css.slice(css.indexOf('.seance-horaire-ligne select,'));
        const regleChamps = zone.slice(0, zone.indexOf('}'));
        expect(regleChamps).toMatch(/min-height:\s*44px/);
        expect(regleChamps).toContain('.seance-horaire-ligne input[type="number"]');
    });

    it('la largeur du champ Local n\'est plus imposée en style en ligne', () => {
        // 80 px en dur se battaient avec la colonne de grille
        const js = lire('js/trimestre-v2-horaires.js');
        expect(js).toContain('id="v2-hor-seance-${i}-local"');
        expect(js).not.toMatch(/id="v2-hor-seance-\$\{i\}-local"[^>]*style="width/);
    });
});

describe('UI · le bouton « Rapport » vit dans la barre d\'actions', () => {
    const html = lire('index.html');

    // Lot D (27 sept. 2026) : « Enregistrer » est devenu « Confirmer la séance ». La barre porte
    // désormais un <span> d'état : on la borne à son </div>, plus au premier </span>.
    it('il est dans la barre bleue, À GAUCHE de « Confirmer la séance »', () => {
        const barre = html.slice(html.indexOf('id="actions-presences-bar"'));
        const fin = barre.indexOf('</div>');
        const contenu = barre.slice(0, fin);

        const posRapport = contenu.indexOf('>Rapport<');
        const posConfirmer = contenu.indexOf('>Confirmer la séance<');

        expect(posRapport, '« Rapport » absent de la barre d\'actions').toBeGreaterThan(-1);
        expect(posConfirmer, '« Confirmer la séance » absent de la barre d\'actions').toBeGreaterThan(-1);
        expect(posRapport, '« Rapport » doit précéder « Confirmer la séance »').toBeLessThan(posConfirmer);
    });

    it('il a quitté l\'en-tête foncé « Enregistrement »', () => {
        const entete = tranche(html, 'data-tooltip="presences-saisie"');
        expect(entete.slice(0, 600)).not.toContain('ouvrirModaleRapportPresences');
    });

    it('plus aucun libellé « Grille imprimable » à l\'écran', () => {
        // le changelog garde sa formulation d'époque : c'est une archive de ce
        // qui a été annoncé en 1.90, pas un libellé vivant.
        expect(html).not.toContain('Grille imprimable');
    });
});
