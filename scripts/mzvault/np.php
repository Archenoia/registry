<?php

define("plant_nps", 749);
define("microbial_nps", 750);
define("marine_nps", 1216);

class np {

    public static function plant_np($page=1, $page_size = 50) {
        accessController::log_pageview("plant_np", "page_" . $page);
        return self::np_library(plant_nps, "Plant Natural Product", $page, $page_size);
    }

    public static function microbial_np($page=1, $page_size = 50) {
        accessController::log_pageview("microbial_np", "page_" . $page);
        return self::np_library(microbial_nps, "Microbial Natural Product", $page, $page_size);
    }

    public static function marine_np($page=1, $page_size = 50) {
        accessController::log_pageview("marine_np", "page_" . $page);
        return self::np_library(marine_nps, "Marine Natural Product", $page, $page_size);
    }

    public static function np_library($topic_id, $name, $page=1, $page_size = 50) {
        $offset = ($page - 1) * $page_size;
        $text_len = 150;
        $data = (new Table(["cad_registry"=>"vocabulary"]))->where(["id"=>$topic_id])->find();
        $meta_class = ENTITY_METABOLITE;
        $sql = "SELECT 
        CONCAT('BioCAD', LPAD(metabolite_id, 11, '0')) AS id,
        name,
        formula,
        round(exact_mass,4) as exact_mass,
        cas_id,
        kegg_id,
        hmdb_id,
        drugbank_id,
        biocyc,
        mesh_id,
        smiles,
        IF(CHAR_LENGTH(metabolites.note) > {$text_len},
            CONCAT(MID(metabolites.note, 1, {$text_len}), '...'),
            metabolites.note) AS note
    FROM
        cad_registry.topic            
            LEFT JOIN
        struct_data ON struct_data.metabolite_id = model_id
            LEFT JOIN
        metabolites ON metabolites.id = model_id
    WHERE
        topic_id = {$topic_id} AND topic.type = $meta_class
            AND metabolite_id IN (SELECT 
                db_xref
            FROM
                mzvault.annotation_hits)
    LIMIT {$offset} , {$page_size}"
    ;
        $data["name"] = $name;
        $data["np"] = (new Table(["cad_registry"=>"topic"]))->getDriver()->Fetch($sql);

        return list_nav( $data, $page);
    }
}