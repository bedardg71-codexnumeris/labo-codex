import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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
    const bloc = css.slice(css.indexOf('.seance-horaire-ligne {'));
    const regle = bloc.slice(0, bloc.indexOf('}'));

    it('la grille déclare SIX colonnes, une par champ', () => {
        const m = regle.match(/grid-template-columns:\s*([^;]+);/);
        expect(m, 'grid-template-columns introuvable').not.toBeNull();

        // compter les pistes sans se faire piéger par les espaces des minmax()
        const pistes = m[1].replace(/minmax\([^)]*\)/g, 'X').trim().split(/\s+/);
        expect(
            pistes.length,
            `Six champs, ${pistes.length} colonne(s) : le local retombe sur une 2e rangée.`
        ).toBe(6);
    });

    it('les champs atteignent la cible tactile iPad de 44 px', () => {
        const zone = css.slice(css.indexOf('.seance-horaire-ligne select,'));
        expect(zone.slice(0, 400)).toMatch(/min-height:\s*44px/);
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

    it('il est dans la barre bleue, À GAUCHE d\'« Enregistrer »', () => {
        const barre = html.slice(html.indexOf('id="actions-presences-bar"'));
        const fin = barre.indexOf('</span>');
        const contenu = barre.slice(0, fin);

        const posRapport = contenu.indexOf('>Rapport<');
        const posEnregistrer = contenu.indexOf('>Enregistrer<');

        expect(posRapport, '« Rapport » absent de la barre d\'actions').toBeGreaterThan(-1);
        expect(posEnregistrer, '« Enregistrer » absent de la barre d\'actions').toBeGreaterThan(-1);
        expect(posRapport, '« Rapport » doit précéder « Enregistrer »').toBeLessThan(posEnregistrer);
    });

    it('il a quitté l\'en-tête foncé « Enregistrement »', () => {
        const entete = html.slice(html.indexOf('data-tooltip="presences-saisie"'));
        expect(entete.slice(0, 600)).not.toContain('ouvrirModaleRapportPresences');
    });

    it('plus aucun libellé « Grille imprimable » à l\'écran', () => {
        // le changelog garde sa formulation d'époque : c'est une archive de ce
        // qui a été annoncé en 1.90, pas un libellé vivant.
        expect(html).not.toContain('Grille imprimable');
    });
});
