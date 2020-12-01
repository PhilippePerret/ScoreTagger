--
-- TABLE envois
--
-- Pour enregistrer un type d'envoi, c'est-à-dire toutes les données concerant
-- l'envoi d'un projet à une maison d'édition.

use publishing;

DROP TABLE IF EXISTS envois;

CREATE TABLE envois
(
  id            SMALLINT UNSIGNED AUTO_INCREMENT,
  projet_id     SMALLINT UNSIGNED NOT NULL,   -- dans la table 'projets'
  societe_id    SMALLINT UNSIGNED NOT NULL,   -- dans la table 'societes'
  type          INTEGER(1) DEFAULT 1,         -- Type de l'envoi (mail, courrier, main propre)
  step          INTEGER(2) NOT NULL,          -- étape courante. Cf. la données
                                              -- Envoi.STEPS
  version       VARCHAR(15) DEFAULT NULL,     -- Version. Si null, c'est la courante
  document_papier   VARCHAR(255) DEFAULT NULL,    -- path au document papier
  document_numeric  VARCHAR(255) DEFAULT NULL,    -- path au document numérique
  specs         VARCHAR(32),                  -- spécificité de l'envoi (inusité pour le moment)
  note          TEXT,
  data          JSON,                         -- table JSON avec en clé la step et en valeur une table contenant la date
  -- sent_at       INTEGER(10) DEFAULT NULL,  -- Date d'envoi DÉTRUITE
  created_at    INTEGER(10)   NOT NULL,
  updated_at    INTEGER(10)   NOT NULL,

  PRIMARY KEY (id)
)
