/* ===============================
   MODULE: BILAN RÉFLEXIF — CORE
   État partagé, clés de stockage, persistance, finders, styles CSS,
   utilitaires sans état. Chargé avant tous les autres sous-modules.

   Sous-modules qui dépendent du core (PLAN-MOYEN-TERME §4.1) :
   - bilan-reflexif-editeur.js (§4.1.d)
   - bilan-reflexif-parcours.js (§4.1.e)
   - bilan-reflexif-reflexion.js (§4.1.e)
   - bilan-reflexif-import-export-texte.js (§4.1.f)
   - bilan-reflexif-csv.js (§4.1.f)
   - bilan-reflexif-rapport.js (§4.1.g)
   - bilan-reflexif.js (résidu : init + navigation, pour l'instant)
   =============================== */

(function() {
'use strict';

/* ===============================
   SECTION 0 : STYLES CSS
   =============================== */

var stylesInjectes = false;

function injecterStyles() {
    if (stylesInjectes) return;
    stylesInjectes = true;
    var style = document.createElement('style');
    style.textContent = [
        /* Navigation interne */
        '.bilan-nav{display:flex;gap:4px;margin-bottom:20px;padding:4px;background:var(--bleu-tres-pale,#142428);border-radius:var(--radius-grand,12px);flex-wrap:wrap}',
        '.bilan-nav-btn{padding:10px 16px;border:none;background:transparent;color:var(--texte-secondaire,#8aa4b0);border-radius:var(--radius-moyen,6px);cursor:pointer;font-size:14px;transition:all .2s;font-family:inherit}',
        '.bilan-nav-btn:hover{background:var(--bleu-pale,#1a3040);color:var(--texte-principal,#d0e0e4)}',
        '.bilan-nav-btn.actif{background:var(--bleu-carte,#1a3a48);color:var(--texte-principal,#d0e0e4);box-shadow:var(--shadow-subtil)}',
        '.bilan-nav-btn:disabled{opacity:.4;cursor:not-allowed}',
        '.bilan-vue{display:none}',
        '.bilan-vue.visible{display:block}',

        /* Barre d'actions éditeur */
        '.bilan-actions{display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap}',

        /* Titre du questionnaire */
        '.bilan-titre-input{width:100%;padding:10px 14px;font-size:16px;font-weight:600;border:1px solid rgba(106,172,184,.15);border-radius:var(--radius-moyen,6px);background:var(--bleu-tres-pale,#142428);color:var(--texte-principal,#d0e0e4);font-family:inherit;margin-bottom:8px}',
        '.bilan-titre-input:focus{outline:none;border-color:var(--bleu-clair,#6aacb8)}',
        '.bilan-preambule-input{width:100%;padding:10px 14px;font-size:13px;border:1px solid rgba(106,172,184,.15);border-radius:var(--radius-moyen,6px);background:var(--bleu-tres-pale,#142428);color:var(--texte-principal,#d0e0e4);font-family:inherit;margin-bottom:16px;line-height:1.5;resize:vertical;min-height:48px}',
        '.bilan-preambule-input:focus{outline:none;border-color:var(--bleu-clair,#6aacb8)}',
        '.bilan-preambule-input::placeholder{color:var(--texte-secondaire,#8aa4b0);font-style:italic}',
        '.bilan-bloc-description-zone{padding:8px 16px 0;border-top:1px solid rgba(106,172,184,.05)}',
        '.bilan-bloc-description-input{width:100%;padding:6px 10px;font-size:12px;border:1px solid rgba(106,172,184,.1);border-radius:var(--radius-petit,5px);background:var(--bleu-tres-pale,#142428);color:var(--texte-secondaire,#8aa4b0);font-family:inherit;line-height:1.4;resize:vertical;min-height:28px;font-style:italic}',
        '.bilan-bloc-description-input:focus{outline:none;border-color:var(--bleu-clair,#6aacb8);color:var(--texte-principal,#d0e0e4);font-style:normal}',
        '.bilan-bloc-description-input::placeholder{color:var(--texte-secondaire,#8aa4b0);opacity:.5}',
        '.bilan-question-details{padding:6px 0 10px 28px;font-size:12px;color:var(--texte-secondaire,#8aa4b0);border-bottom:1px solid rgba(106,172,184,.08)}',
        '.bilan-question-consigne{font-style:italic;margin-bottom:6px;color:var(--orange-accent,#c8a060);font-size:11px}',
        '.bilan-question-options{list-style:none;margin:0;padding:0}',
        '.bilan-question-options li{padding:2px 0;color:var(--texte-principal,#d0e0e4)}',
        '.bilan-question-options li em{color:var(--texte-secondaire,#8aa4b0);font-style:italic;font-size:11px;margin-left:4px}',
        '.bilan-question-options-limite{font-size:11px;color:var(--bleu-clair,#6aacb8);margin-top:4px;font-style:italic}',
        '.bilan-question-enonces{list-style:none;margin:0;padding:0}',
        '.bilan-question-enonces li{padding:2px 0 2px 14px;position:relative;color:var(--texte-principal,#d0e0e4)}',
        '.bilan-question-enonces li::before{content:"—";position:absolute;left:0;color:var(--bleu-clair,#6aacb8)}',
        '.bilan-question-na-badge{display:inline-block;font-size:10px;padding:1px 6px;border-radius:var(--radius-pill,20px);background:rgba(106,172,184,.15);color:var(--bleu-clair,#6aacb8);margin-left:4px;font-style:italic}',
        '.bilan-question-meta{margin-bottom:8px}',
        '.bilan-question-consigne-input{width:100%;padding:5px 9px;font-size:11px;border:1px dashed rgba(200,160,96,.3);border-radius:var(--radius-petit,5px);background:transparent;color:var(--orange-accent,#c8a060);font-family:inherit;font-style:italic}',
        '.bilan-question-consigne-input:focus{outline:none;border-color:var(--orange-accent,#c8a060);border-style:solid}',
        '.bilan-question-consigne-input::placeholder{color:var(--texte-secondaire,#8aa4b0);opacity:.5;font-style:italic}',
        '.bilan-question-na-toggle{display:inline-flex;align-items:center;gap:6px;font-size:11px;color:var(--texte-secondaire,#8aa4b0);cursor:pointer;margin-top:4px}',
        '.bilan-question-na-toggle input{margin:0}',
        '.bilan-question-limites{display:flex;gap:14px;font-size:11px;color:var(--texte-secondaire,#8aa4b0);margin-bottom:8px;align-items:center}',
        '.bilan-question-limites label{display:inline-flex;align-items:center;gap:4px}',
        '.bilan-mini-num{width:48px;padding:3px 6px;font-size:11px;border:1px solid rgba(106,172,184,.15);border-radius:var(--radius-petit,5px);background:var(--bleu-tres-pale,#142428);color:var(--texte-principal,#d0e0e4);font-family:inherit;text-align:center}',
        '.bilan-mini-num:focus{outline:none;border-color:var(--bleu-clair,#6aacb8)}',
        '.bilan-question-options-list,.bilan-question-enonces-list{margin:0;padding:0}',
        '.bilan-option-row,.bilan-enonce-row{display:flex;align-items:center;gap:6px;padding:3px 0}',
        '.bilan-option-lettre{font-size:12px;color:var(--texte-secondaire,#8aa4b0);min-width:18px;font-weight:600}',
        '.bilan-enonce-puce{color:var(--bleu-clair,#6aacb8);min-width:14px}',
        '.bilan-option-input,.bilan-enonce-input{flex:1;padding:4px 8px;font-size:12px;border:1px solid rgba(106,172,184,.1);border-radius:var(--radius-petit,5px);background:var(--bleu-tres-pale,#142428);color:var(--texte-principal,#d0e0e4);font-family:inherit}',
        '.bilan-option-input:focus,.bilan-enonce-input:focus{outline:none;border-color:var(--bleu-clair,#6aacb8)}',
        '.bilan-option-autre{display:inline-flex;align-items:center;gap:3px;font-size:10px;color:var(--texte-secondaire,#8aa4b0);cursor:pointer;white-space:nowrap}',
        '.bilan-option-autre input{margin:0}',
        '.bilan-add-mini{padding:3px 10px;font-size:11px;margin-top:4px}',
        /* Rapport — rendus par type */
        '.bilan-question-rep{margin:14px 0 18px;padding:10px 12px;background:var(--bleu-tres-pale,#142428);border-radius:var(--radius-moyen,6px);border-left:3px solid var(--bleu-clair,#6aacb8)}',
        '.bilan-rep-titre{font-size:13px;font-weight:600;color:var(--texte-principal,#d0e0e4);margin-bottom:8px;display:flex;justify-content:space-between;align-items:baseline;gap:10px}',
        '.bilan-rep-meta{font-size:11px;font-weight:400;color:var(--texte-secondaire,#8aa4b0);font-style:italic;flex-shrink:0}',
        '.bilan-rep-na{font-size:11px;color:var(--texte-secondaire,#8aa4b0);font-style:italic;margin-bottom:6px}',
        '.bilan-rep-likert-bar{display:flex;height:20px;border-radius:4px;overflow:hidden;margin:4px 0}',
        '.bilan-rep-likert-bar > div{transition:width .3s;display:flex;align-items:center;justify-content:center;font-size:10px;color:#fff;font-weight:600;text-shadow:0 1px 1px rgba(0,0,0,.3)}',
        '.bilan-rep-likert-segment-4{background:var(--vert-succes,#34c759)}',
        '.bilan-rep-likert-segment-3{background:var(--vert-leger,#3aaa8a)}',
        '.bilan-rep-likert-segment-2{background:var(--orange-accent,#c8a060)}',
        '.bilan-rep-likert-segment-1{background:var(--rouge-erreur,#e84057)}',
        '.bilan-rep-likert-legende{font-size:10px;color:var(--texte-secondaire,#8aa4b0);margin-top:4px}',
        '.bilan-rep-options{margin-top:6px}',
        '.bilan-rep-row{display:flex;align-items:center;gap:8px;margin:3px 0;font-size:12px}',
        '.bilan-rep-label{flex:0 0 220px;color:var(--texte-principal,#d0e0e4);font-size:11px}',
        '.bilan-rep-bar{flex:1;height:10px;background:rgba(106,172,184,.1);border-radius:5px;overflow:hidden;min-width:60px}',
        '.bilan-rep-bar > div{height:100%;background:var(--bleu-clair,#6aacb8);transition:width .3s}',
        '.bilan-rep-bar.dominante > div{background:var(--vert-succes,#34c759)}',
        '.bilan-rep-pct{flex:0 0 60px;text-align:right;color:var(--texte-secondaire,#8aa4b0);font-size:11px;font-weight:600}',
        '.bilan-rep-pct strong{color:var(--texte-principal,#d0e0e4)}',
        '.bilan-rep-matrix{width:100%;border-collapse:collapse;font-size:11px;margin-top:6px}',
        '.bilan-rep-matrix th{padding:4px 6px;text-align:left;color:var(--texte-secondaire,#8aa4b0);font-weight:600;text-transform:uppercase;font-size:10px;border-bottom:1px solid rgba(106,172,184,.15)}',
        '.bilan-rep-matrix td{padding:6px;border-bottom:1px solid rgba(106,172,184,.06);vertical-align:middle;color:var(--texte-principal,#d0e0e4)}',
        '.bilan-rep-matrix td:first-child{font-size:11px;max-width:300px;line-height:1.3}',
        '.bilan-rep-matrix td:last-child{text-align:right;font-weight:600;width:42px}',
        '.bilan-rep-autres{margin-top:10px;padding-top:8px;border-top:1px dashed rgba(106,172,184,.15)}',
        '.bilan-rep-autres-titre{font-size:11px;color:var(--texte-secondaire,#8aa4b0);font-style:italic;margin-bottom:4px}',
        '.bilan-rep-vide{font-size:11px;color:var(--texte-secondaire,#8aa4b0);font-style:italic}',
        '.bilan-rep-limite{font-size:10px;color:var(--bleu-clair,#6aacb8);margin-left:6px}',

        /* Bloc thématique */
        '.bilan-bloc{margin-bottom:12px;border:1px solid rgba(106,172,184,.15);border-radius:var(--radius-grand,12px);overflow:hidden;transition:opacity .2s}',
        '.bilan-bloc.inactif{opacity:.45}',
        '.bilan-bloc-header{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:var(--bleu-tres-pale,#142428);cursor:pointer;user-select:none;gap:8px}',
        '.bilan-bloc-gauche{display:flex;align-items:center;gap:10px;flex:1;min-width:0}',
        '.bilan-bloc-titre{font-size:15px;font-weight:600;color:var(--texte-principal,#d0e0e4)}',
        '.bilan-bloc-badge{font-size:11px;color:var(--texte-secondaire,#8aa4b0);white-space:nowrap}',
        '.bilan-toggle{position:relative;width:40px;height:22px;background:rgba(106,172,184,.2);border-radius:11px;cursor:pointer;transition:background .2s;flex-shrink:0;border:none}',
        '.bilan-toggle.actif{background:var(--vert-succes,#34c759)}',
        '.bilan-toggle::after{content:"";position:absolute;top:2px;left:2px;width:18px;height:18px;background:#fff;border-radius:50%;transition:transform .2s}',
        '.bilan-toggle.actif::after{transform:translateX(18px)}',
        '.bilan-bloc-body{padding:8px 16px 12px;display:none}',
        '.bilan-bloc.ouvert .bilan-bloc-body{display:block}',

        /* Question */
        '.bilan-question{display:flex;align-items:flex-start;gap:8px;padding:8px 0;border-bottom:1px solid rgba(106,172,184,.08)}',
        '.bilan-question:last-child{border-bottom:none}',
        '.bilan-question-num{font-size:12px;color:var(--texte-secondaire,#8aa4b0);min-width:20px;padding-top:2px}',
        '.bilan-question-texte{flex:1;font-size:14px;color:var(--texte-principal,#d0e0e4);line-height:1.4}',
        '.bilan-question-type{font-size:11px;color:var(--texte-secondaire,#8aa4b0);padding:2px 8px;background:var(--bleu-pale,#1a3040);border-radius:var(--radius-petit,5px);white-space:nowrap;align-self:center}',
        '.bilan-question-actions{display:flex;gap:2px;align-self:center}',
        '.bilan-btn-mini{padding:4px 6px;border:none;background:transparent;cursor:pointer;color:var(--texte-secondaire,#8aa4b0);border-radius:var(--radius-petit,5px);font-size:13px;line-height:1}',
        '.bilan-btn-mini:hover{background:var(--bleu-pale,#1a3040);color:var(--texte-principal,#d0e0e4)}',

        /* Édition inline */
        '.bilan-edit-input{width:100%;padding:6px 10px;font-size:14px;border:1px solid var(--bleu-clair,#6aacb8);border-radius:var(--radius-petit,5px);background:var(--bleu-tres-pale,#142428);color:var(--texte-principal,#d0e0e4);font-family:inherit}',

        /* Section questions personnalisées */
        '.bilan-perso-section{margin-top:16px;padding:16px;border:1px dashed rgba(106,172,184,.2);border-radius:var(--radius-grand,12px)}',
        '.bilan-perso-titre{font-size:14px;font-weight:600;color:var(--texte-secondaire,#8aa4b0);margin-bottom:8px}',

        /* Ajout question */
        '.bilan-ajout-form{display:flex;gap:8px;margin-top:8px;flex-wrap:wrap}',
        '.bilan-ajout-input{flex:1;min-width:200px;padding:8px 12px;font-size:14px;border:1px solid rgba(106,172,184,.15);border-radius:var(--radius-moyen,6px);background:var(--bleu-tres-pale,#142428);color:var(--texte-principal,#d0e0e4);font-family:inherit}',
        '.bilan-ajout-select{padding:8px 12px;font-size:13px;border:1px solid rgba(106,172,184,.15);border-radius:var(--radius-moyen,6px);background:var(--bleu-tres-pale,#142428);color:var(--texte-principal,#d0e0e4);font-family:inherit}',

        /* Import */
        '.bilan-import-zone{border:2px dashed rgba(106,172,184,.25);border-radius:var(--radius-grand,12px);padding:40px 20px;text-align:center;cursor:pointer;transition:all .2s;margin-bottom:20px}',
        '.bilan-import-zone:hover{border-color:var(--bleu-clair,#6aacb8);background:var(--bleu-tres-pale,#142428)}',
        '.bilan-import-icone{font-size:40px;margin-bottom:10px;opacity:.6}',
        '.bilan-import-texte{font-size:14px;color:var(--texte-secondaire,#8aa4b0)}',
        '.bilan-import-texte strong{color:var(--texte-principal,#d0e0e4)}',
        '.bilan-mapping-table{width:100%;border-collapse:collapse;margin:16px 0}',
        '.bilan-mapping-table th{padding:8px 12px;text-align:left;font-weight:600;color:var(--texte-secondaire,#8aa4b0);font-size:12px;text-transform:uppercase;border-bottom:2px solid rgba(106,172,184,.15)}',
        '.bilan-mapping-table td{padding:8px 12px;border-bottom:1px solid rgba(106,172,184,.08);font-size:13px;color:var(--texte-principal,#d0e0e4)}',
        '.bilan-mapping-match{color:var(--vert-succes,#34c759)}',
        '.bilan-mapping-ignore{color:var(--texte-secondaire,#8aa4b0);font-style:italic}',
        '.bilan-mapping-select{padding:4px 8px;font-size:12px;border:1px solid rgba(106,172,184,.15);border-radius:var(--radius-petit,5px);background:var(--bleu-tres-pale,#142428);color:var(--texte-principal,#d0e0e4);font-family:inherit;max-width:300px}',

        /* Rapport */
        '.bilan-rapport-section{margin-bottom:28px}',
        '.bilan-rapport-titre{font-size:16px;font-weight:600;color:var(--texte-principal,#d0e0e4);margin-bottom:12px;padding-bottom:8px;border-bottom:2px solid var(--bleu-clair,#6aacb8)}',
        '.bilan-stat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-bottom:20px}',
        '.bilan-stat-carte{padding:16px;background:var(--bleu-tres-pale,#142428);border-radius:var(--radius-grand,12px);text-align:center;border:1px solid rgba(106,172,184,.1)}',
        '.bilan-stat-valeur{font-size:28px;font-weight:700;color:var(--bleu-clair,#6aacb8)}',
        '.bilan-stat-label{font-size:12px;color:var(--texte-secondaire,#8aa4b0);margin-top:4px}',
        '.bilan-canvas-wrapper{position:relative;width:100%;margin:12px 0}',
        '.bilan-signal{display:inline-block;padding:4px 10px;border-radius:var(--radius-pill,20px);font-size:12px;font-weight:600;margin:4px}',
        '.bilan-signal-fort{background:rgba(52,199,89,.15);color:var(--vert-succes,#34c759)}',
        '.bilan-signal-faible{background:rgba(232,64,87,.15);color:var(--rouge-erreur,#e84057)}',
        '.bilan-reponse-ouverte{padding:10px 14px;margin:6px 0;background:var(--bleu-tres-pale,#142428);border-radius:var(--radius-moyen,6px);font-size:13px;color:var(--texte-principal,#d0e0e4);border-left:3px solid var(--bleu-clair,#6aacb8);line-height:1.4}',
        '.bilan-synthese-item{padding:12px 16px;margin:8px 0;border-radius:var(--radius-moyen,6px)}',
        '.bilan-synthese-force{background:rgba(52,199,89,.08);border-left:4px solid var(--vert-succes,#34c759)}',
        '.bilan-synthese-vigilance{background:rgba(232,64,87,.08);border-left:4px solid var(--rouge-erreur,#e84057)}',
        '.bilan-synthese-titre{font-weight:600;font-size:14px;margin-bottom:4px}',
        '.bilan-synthese-detail{font-size:13px;color:var(--texte-secondaire,#8aa4b0)}',
        '.bilan-vide{text-align:center;padding:40px 20px;color:var(--texte-secondaire,#8aa4b0)}',
        '.bilan-vide-icone{font-size:40px;margin-bottom:10px;opacity:.5}',

        /* Boutons */
        '.bilan-btn{padding:8px 16px;border:none;border-radius:var(--radius-moyen,6px);cursor:pointer;font-size:13px;font-weight:600;font-family:inherit;transition:all .2s}',
        '.bilan-btn-principal{background:var(--bleu-clair,#6aacb8);color:#fff}',
        '.bilan-btn-principal:hover{filter:brightness(1.1)}',
        '.bilan-btn-secondaire{background:var(--bleu-pale,#1a3040);color:var(--texte-principal,#d0e0e4)}',
        '.bilan-btn-secondaire:hover{background:var(--bleu-carte,#1a3a48)}',
        '.bilan-btn-danger{background:transparent;color:var(--rouge-erreur,#e84057);border:1px solid var(--rouge-erreur,#e84057)}',
        '.bilan-btn-danger:hover{background:var(--rouge-erreur,#e84057);color:#fff}',

        /* Confirmation toast */
        '.bilan-toast{position:fixed;bottom:20px;right:20px;padding:12px 20px;background:var(--vert-succes,#34c759);color:#fff;border-radius:var(--radius-moyen,6px);font-size:14px;z-index:9999;opacity:0;transform:translateY(10px);transition:all .3s;pointer-events:none}',
        '.bilan-toast.visible{opacity:1;transform:translateY(0)}',

        /* Parcours — Activités */
        '.bilan-activite{display:flex;align-items:center;gap:10px;padding:10px 14px;margin-bottom:8px;background:var(--bleu-tres-pale,#142428);border:1px solid rgba(106,172,184,.12);border-radius:var(--radius-moyen,6px);transition:background .15s}',
        '.bilan-activite:hover{background:var(--bleu-pale,#1a3040)}',
        '.bilan-activite-num{font-size:12px;font-weight:700;color:var(--texte-secondaire,#8aa4b0);min-width:22px}',
        '.bilan-activite-titre{flex:1;font-size:14px;color:var(--texte-principal,#d0e0e4);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
        '.bilan-activite-type{font-size:11px;padding:2px 8px;border-radius:var(--radius-petit,5px);white-space:nowrap}',
        '.bilan-type-production{background:rgba(106,172,184,.15);color:var(--bleu-clair,#6aacb8)}',
        '.bilan-type-cours{background:rgba(200,160,96,.15);color:var(--orange-accent,#c8a060)}',
        '.bilan-type-evenement{background:rgba(58,170,138,.15);color:var(--vert-leger,#3aaa8a)}',

        /* Parcours — Émotions (chips) */
        '.bilan-emotions-list{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}',
        '.bilan-emotion-tag{display:inline-flex;align-items:center;gap:4px;padding:5px 10px;background:var(--bleu-pale,#1a3040);border:1px solid rgba(106,172,184,.12);border-radius:var(--radius-pill,20px);font-size:13px;color:var(--texte-principal,#d0e0e4)}',
        '.bilan-emotion-tag .bilan-btn-mini{font-size:11px;padding:1px 3px;margin-left:2px}',

        /* Parcours — Questions transversales */
        '.bilan-transversale{display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-bottom:1px solid rgba(106,172,184,.08)}',
        '.bilan-transversale:last-child{border-bottom:none}',
        '.bilan-transversale-texte{flex:1;font-size:13px;color:var(--texte-principal,#d0e0e4);line-height:1.4}',

        /* Parcours — Bannière info */
        '.bilan-info{padding:12px 16px;background:rgba(106,172,184,.08);border-left:3px solid var(--bleu-clair,#6aacb8);border-radius:0 var(--radius-moyen,6px) var(--radius-moyen,6px) 0;margin-bottom:16px;font-size:13px;color:var(--texte-secondaire,#8aa4b0);line-height:1.5}',

        /* Panneau d'aide repliable */
        '.bilan-info-aide{padding:0;border:1px solid rgba(106,172,184,.12);border-left:3px solid var(--bleu-clair,#6aacb8);border-radius:0 var(--radius-moyen,6px) var(--radius-moyen,6px) 0;margin-bottom:16px;overflow:hidden;background:rgba(106,172,184,.05)}',
        '.bilan-aide-header{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;cursor:pointer;user-select:none}',
        '.bilan-aide-header:hover{background:rgba(106,172,184,.06)}',
        '.bilan-aide-titre{font-size:13px;font-weight:600;color:var(--texte-secondaire,#8aa4b0);display:flex;align-items:center;gap:6px}',
        '.bilan-aide-chevron{font-size:11px;color:var(--texte-secondaire,#8aa4b0);transition:transform .2s}',
        '.bilan-aide-body{padding:0 14px 14px;font-size:13px;color:var(--texte-secondaire,#8aa4b0);line-height:1.6}',
        '.bilan-aide-body ol{margin:6px 0 10px;padding-left:20px}',
        '.bilan-aide-body li{margin-bottom:4px}',
        '.bilan-aide-body li strong{color:var(--texte-principal,#d0e0e4)}',
        '.bilan-aide-astuce{margin-top:10px;padding:8px 12px;background:rgba(106,172,184,.06);border-radius:var(--radius-petit,5px);font-size:12px;font-style:italic}',
        '.bilan-info-aide.replie .bilan-aide-body{display:none}',
        '.bilan-info-aide.replie .bilan-aide-chevron{transform:rotate(-90deg)}',

        /* Prévisualisation formulaire élève */
        '.bilan-preview{margin-top:24px;padding:16px;border:2px dashed rgba(106,172,184,.2);border-radius:var(--radius-grand,12px);background:rgba(106,172,184,.03)}',
        '.bilan-preview-titre{font-size:14px;font-weight:600;color:var(--texte-secondaire,#8aa4b0);margin-bottom:12px;display:flex;align-items:center;gap:6px}',
        '.bilan-preview-activite{margin-bottom:16px;padding:12px 14px;background:var(--bleu-tres-pale,#142428);border-radius:var(--radius-moyen,6px);border-left:3px solid var(--bleu-clair,#6aacb8)}',
        '.bilan-preview-act-titre{font-size:14px;font-weight:600;color:var(--texte-principal,#d0e0e4);margin-bottom:10px}',
        '.bilan-preview-question{margin-bottom:8px;font-size:13px;color:var(--texte-principal,#d0e0e4);line-height:1.5}',
        '.bilan-preview-question strong{color:var(--texte-secondaire,#8aa4b0);font-weight:600}',
        '.bilan-preview-choix{display:flex;flex-wrap:wrap;gap:6px;margin:4px 0 0 16px}',
        '.bilan-preview-option{padding:3px 10px;font-size:12px;border:1px solid rgba(106,172,184,.15);border-radius:var(--radius-pill,20px);color:var(--texte-secondaire,#8aa4b0);background:transparent}',
        '.bilan-preview-libre{margin:4px 0 0 16px;padding:6px 10px;font-size:12px;color:var(--texte-secondaire,#8aa4b0);font-style:italic;border:1px dashed rgba(106,172,184,.15);border-radius:var(--radius-petit,5px);display:inline-block}',
        '.bilan-preview-section{margin-top:14px;padding-top:12px;border-top:1px solid rgba(106,172,184,.1)}',
        '.bilan-preview-section-titre{font-size:13px;font-weight:600;color:var(--texte-secondaire,#8aa4b0);margin-bottom:8px}',

        /* Parcours — Sous-sections */
        '.bilan-sous-titre{font-size:14px;font-weight:600;color:var(--texte-principal,#d0e0e4);margin:20px 0 8px;padding-bottom:6px;border-bottom:1px solid rgba(106,172,184,.1)}'
    ].join('\n');
    document.head.appendChild(style);
}

/* ===============================
   SECTION 1 : UTILITAIRES SANS ÉTAT
   =============================== */

function genId() {
    return Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6);
}

function afficherToast(message) {
    var toast = document.getElementById('bilan-toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('visible');
    setTimeout(function() { toast.classList.remove('visible'); }, 2500);
}

function libelleTypeQuestion(type, q) {
    switch (type) {
        case 'likert4': return 'Likert (1 énoncé)' + ((q && q.inclureNA) ? ' + NA' : '');
        case 'choix_unique': return 'Choix unique';
        case 'choix_multiple':
            var maxStr = (q && q.maxSelection) ? ' max ' + q.maxSelection : '';
            return 'Choix multiple' + maxStr;
        case 'matrix':
            var nb = (q && q.enonces && q.enonces.length) ? q.enonces.length : 0;
            return 'Likert matriciel (' + nb + ' énoncé' + (nb > 1 ? 's' : '') + ')';
        case 'ouvert': return 'Ouvert';
        default: return type || 'Type inconnu';
    }
}

function tronquer(texte, max) {
    if (!texte || texte.length <= max) return texte || '';
    return texte.substring(0, max - 1) + '…';
}

/* ===============================
   SECTION 2 : ÉTAT PARTAGÉ
   ===============================
   Cet objet est mutable par référence : tous les sous-modules font
   `var etat = BilanReflexifCore.etat;` en alias et mutent ses propriétés.
   Jamais réassigné. */

var etat = {
    vue: 'editeur',
    questionnaire: null,
    parcours: null,
    reflexion: null,
    resultats: null,
    graphiques: {},
    blocOuvert: null,
    questionEnEdition: null,
    activiteEnEdition: null,
    mappingImport: null,
    donneesCSVParsees: null
};

/* ===============================
   SECTION 3 : CLÉS DE STOCKAGE (namespacées par trimestre via window.cle)
   =============================== */

function CLE_QUESTIONNAIRE() { return window.cle ? window.cle('questionnaireBilan') : 'questionnaireBilan'; }
function CLE_RESULTATS()     { return window.cle ? window.cle('resultatsBilan') : 'resultatsBilan'; }
function CLE_PARCOURS()      { return window.cle ? window.cle('parcoursBilan') : 'parcoursBilan'; }
function CLE_REFLEXION()     { return window.cle ? window.cle('autoreflexionBilan') : 'autoreflexionBilan'; }

/* ===============================
   SECTION 4 : PERSISTANCE (couche db)
   =============================== */

// Lot F (D4) : l'éditeur et le parcours écrivent ici, hors du témoin commun ; ce point le
// dit au codex. L'initialisation (questionnaire de démo, parcours vide, migration) passe
// `{ discret: true }`.
function sauvegarderQuestionnaire(options) {
    db.setSync(CLE_QUESTIONNAIRE(), etat.questionnaire);
    if (!(options && options.discret)) if (window.annoncerEcritureUsager) window.annoncerEcritureUsager(CLE_QUESTIONNAIRE());
}

function sauvegarderParcours(options) {
    db.setSync(CLE_PARCOURS(), etat.parcours);
    if (!(options && options.discret)) if (window.annoncerEcritureUsager) window.annoncerEcritureUsager(CLE_PARCOURS());
}

// Lot E3 (D0 point 2, 28 sept. 2026) : l'auto-réflexion s'écrit par le témoin commun (même clé :
// `autoreflexionBilan`, namespacée). Ses écrivains sont des gestes (réponse, bascule, sortie d'un champ).
function sauvegarderReflexion() {
    return sauvegarderDonneesSelonMode('autoreflexionBilan', etat.reflexion, { geste: 'Auto-réflexion' });
}

/* ===============================
   SECTION 5 : FINDERS (lecture seule sur etat.questionnaire)
   =============================== */

function trouverBloc(blocId) {
    for (var i = 0; i < etat.questionnaire.blocs.length; i++) {
        if (etat.questionnaire.blocs[i].id === blocId) return etat.questionnaire.blocs[i];
    }
    return null;
}

function trouverQuestion(blocId, questionId) {
    var bloc = trouverBloc(blocId);
    if (!bloc) return null;
    for (var i = 0; i < bloc.questions.length; i++) {
        if (bloc.questions[i].id === questionId) return bloc.questions[i];
    }
    return null;
}

function trouverQuestionPerso(questionId) {
    var perso = etat.questionnaire.questionsPersonnalisees;
    if (!perso) return null;
    for (var i = 0; i < perso.length; i++) {
        if (perso[i].id === questionId) return perso[i];
    }
    return null;
}

/* ===============================
   SECTION 6 : PANNEAU D'AIDE REPLIABLE (helper UI générique)
   =============================== */

function rendreAideHTML(cle, titre, contenu) {
    var lsKey = 'bilan_aide_' + cle;
    var replie = false;
    try { replie = localStorage.getItem(lsKey) === '1'; } catch (e) { /* ignore */ }

    var html = [];
    html.push('<div class="bilan-info-aide' + (replie ? ' replie' : '') + '" id="bilan-aide-' + cle + '">');
    html.push('<div class="bilan-aide-header" data-action="BilanReflexif.toggleAide" data-param="' + cle + '">');
    html.push('<span class="bilan-aide-titre">' + titre + '</span>');
    html.push('<span class="bilan-aide-chevron">▼</span>');
    html.push('</div>');
    html.push('<div class="bilan-aide-body">' + contenu + '</div>');
    html.push('</div>');
    return html.join('');
}

function toggleAide(cle) {
    var panneau = document.getElementById('bilan-aide-' + cle);
    if (!panneau) return;
    var lsKey = 'bilan_aide_' + cle;
    var estReplie = panneau.classList.contains('replie');
    panneau.classList.toggle('replie');
    try { localStorage.setItem(lsKey, estReplie ? '0' : '1'); } catch (e) { /* ignore */ }
}

/* ===============================
   API publique
   =============================== */

window.BilanReflexifCore = {
    // Utilitaires sans état
    injecterStyles: injecterStyles,
    genId: genId,
    afficherToast: afficherToast,
    libelleTypeQuestion: libelleTypeQuestion,
    tronquer: tronquer,

    // État partagé (mutable par référence)
    etat: etat,

    // Clés de stockage (fonctions paresseuses → window.cle)
    CLE_QUESTIONNAIRE: CLE_QUESTIONNAIRE,
    CLE_RESULTATS: CLE_RESULTATS,
    CLE_PARCOURS: CLE_PARCOURS,
    CLE_REFLEXION: CLE_REFLEXION,

    // Persistance
    sauvegarderQuestionnaire: sauvegarderQuestionnaire,
    sauvegarderParcours: sauvegarderParcours,
    sauvegarderReflexion: sauvegarderReflexion,

    // Finders
    trouverBloc: trouverBloc,
    trouverQuestion: trouverQuestion,
    trouverQuestionPerso: trouverQuestionPerso,

    // Panneau d'aide repliable
    rendreAideHTML: rendreAideHTML,
    toggleAide: toggleAide
};

})();
