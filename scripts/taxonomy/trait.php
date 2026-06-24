<?php

class trait_data {

    public static function page_data($id, $page =1, $page_size = 100) {
        $sql = "SELECT 
                mainclass.term AS main_class,
                subclass.term AS sub_class,
                ontology.term AS `name`
            FROM
                cad_registry.ontology
                    LEFT JOIN
                ontology_relation is_subclass ON is_subclass.term_id = ontology.id
                    LEFT JOIN
                ontology subclass ON subclass.id = is_subclass.is_a
                    LEFT JOIN
                ontology_relation is_mainclass ON is_mainclass.term_id = subclass.id
                    LEFT JOIN
                ontology mainclass ON mainclass.id = is_mainclass.is_a
            WHERE
                ontology.id = {$id}"
        ;
        $trait = (new Table(["cad_registry"=>"ontology"]))->getDriver()->ExecuteScalar($sql);
        $trait["trait_name"] = str_replace("info:","", $trait["name"] );
        $offset = ($page -1) * $page_size;


        return $trait;
    }
}