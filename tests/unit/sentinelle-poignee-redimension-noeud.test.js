import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Poignée de redimensionnement des blocs (exercice d'alignement 601-101,
// 6 août 2026) — OPTION A : sur les FEUILLES uniquement.
//
// Pourquoi pas sur les conteneurs : reLayoutConteneur CALCULE leur largeur et
// leur hauteur à partir des enfants. Une taille posée à la main y serait
// écrasée au prochain ajout d'enfant — l'utilisateur verrait son geste défait
// sans comprendre pourquoi. Les trois autres options (largeur minimale, mode
// manuel avec retour explicite) sont documentées dans
// docs/utilisateur/METHODE-ALIGNEMENT.md ; A est la seule sans dette.
//
// Retrait joint : les boutons « Copier » de la vue calendrier, devenus inutiles
// (Grégoire est le seul utilisateur et ne s'en sert pas — l'export sera
// repensé).

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const carte = readFileSync(path.join(racineProjet, 'js', 'planification-carte.js'), 'utf8');
const organisateur = readFileSync(path.join(racineProjet, 'js', 'organisateur.js'), 'utf8');
const css = readFileSync(path.join(racineProjet, 'styles.css'), 'utf8');

describe('Poignée · rendue sur les feuilles, jamais sur les conteneurs', () => {
    it('la poignée existe dans le rendu et le CSS', () => {
        expect(carte).toContain('planif-noeud-poignee');
        expect(css).toContain('.planif-noeud-poignee');
    });

    it('elle n’est PAS rendue dans les deux branches conteneur', () => {
        // Le rendu a trois branches : compacte, conteneur, feuille. Seule la
        // dernière doit porter la poignée.
        const brancheCompacte = carte.slice(
            carte.indexOf('if (estCompact) {'),
            carte.indexOf('} else if (estConteneur) {')
        );
        const brancheConteneur = carte.slice(
            carte.indexOf('} else if (estConteneur) {'),
            carte.indexOf("'<div class=\"planif-noeud-port planif-port-droite\" data-dir=\"droite\"></div>' +\n                '<div class=\"planif-noeud-port planif-port-gauche\"")
        );
        expect(brancheCompacte).not.toContain('planif-noeud-poignee');
        expect(brancheConteneur).not.toContain('planif-noeud-poignee');
    });

    it('une seule occurrence dans le rendu (la branche feuille)', () => {
        const rendus = carte.match(/'<div class="planif-noeud-poignee"/g) || [];
        expect(rendus).toHaveLength(1);
    });

    it('la taille mémorisée n’est appliquée qu’aux feuilles', () => {
        expect(carte).toMatch(/if \(!estConteneur && n\.metadata\)[\s\S]{0,220}metadata\.largeur/);
    });
});

describe('Poignée · mécanique', () => {
    it('le glissement n’enclenche pas le déplacement du bloc', () => {
        expect(carte).toMatch(/poignee\.addEventListener\('mousedown'[\s\S]{0,120}stopPropagation/);
    });

    it('les deltas sont divisés par le zoom de la carte', () => {
        // Sans ça, la poignée dériverait du curseur dès qu'on n'est plus à 100 %.
        expect(carte).toMatch(/var z = etat\.zoom \|\| 1;/);
        expect(carte).toMatch(/largeurDepart \+ \(ev\.clientX - departX\) \/ z/);
        expect(carte).toMatch(/hauteurDepart \+ \(ev\.clientY - departY\) \/ z/);
    });

    it('la taille est bornée par un minimum', () => {
        expect(carte).toMatch(/Math\.max\(LARGEUR_MIN_NOEUD/);
        expect(carte).toMatch(/Math\.max\(HAUTEUR_MIN_NOEUD/);
    });

    it('la taille est persistée sur le nœud, pas seulement dans le DOM', () => {
        expect(carte).toMatch(/donnees\.metadata\.largeur = Math\.round\(el\.offsetWidth\)/);
        expect(carte).toMatch(/donnees\.metadata\.hauteur = Math\.round\(el\.offsetHeight\)/);
    });

    it('le parent est redisposé après coup (il se dimensionne sur ses enfants)', () => {
        expect(carte).toMatch(/surRelachement[\s\S]{0,600}reLayoutConteneur\(donnees\.parent\)/);
    });

    it('le double-clic rend la main à la taille automatique', () => {
        // Sans retour possible, un bloc retaillé cesserait définitivement de
        // suivre son contenu.
        expect(carte).toMatch(
            /poignee\.addEventListener\('dblclick'[\s\S]{0,400}delete donnees\.metadata\.largeur/
        );
        expect(carte).toMatch(/dblclick[\s\S]{0,500}el\.style\.width = '';/);
    });

    it('les écouteurs de document sont retirés au relâchement', () => {
        expect(carte).toMatch(/removeEventListener\('mousemove', surDeplacement\)/);
        expect(carte).toMatch(/removeEventListener\('mouseup', surRelachement\)/);
    });
});

describe('Vue calendrier · les boutons « Copier » sont retirés partout', () => {
    it('plus aucun bouton ni fonction de copie', () => {
        expect(organisateur).not.toContain('ajouterBoutonsCopier');
        expect(organisateur).not.toContain('org-cal-btn-copier');
        expect(organisateur).not.toContain('copierDansPressePapiers');
    });

    it('les extracteurs de texte qui ne servaient qu’à eux sont retirés aussi', () => {
        expect(organisateur).not.toContain('extraireTexteLecon');
        expect(organisateur).not.toContain('extraireTexteSequence');
    });

    it('le CSS ne garde pas de règle orpheline', () => {
        expect(css).not.toContain('org-cal-btn-copier');
    });

    it('l’export Markdown de la modale, lui, est INTACT (autre fonction)', () => {
        expect(organisateur).toContain('copierExportMD');
    });
});
