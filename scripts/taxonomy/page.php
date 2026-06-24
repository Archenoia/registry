<?php

class ncbi_taxonomy {

    public static function organism_traits($taxid) {
        $traits = new Table(["cad_registry"=>"organism_traits"]);
        $traits = $traits->getDriver()->Fetch("SELECT 
                mainclass.term AS main_class,
                subclass.term AS sub_class,
                trait_name.term AS trait_name,
                unit,
                consensus_value,
                min,
                median,
                mean,
                max,
                discrete_values,
                ontology_ids
            FROM
                cad_registry.organism_traits
                    LEFT JOIN
                ontology trait_name ON trait_name.id = traits_id
                    LEFT JOIN
                ontology_relation is_subclass ON is_subclass.term_id = trait_name.id
                    LEFT JOIN
                ontology subclass ON subclass.id = is_subclass.is_a
                    LEFT JOIN
                ontology_relation is_mainclass ON is_mainclass.term_id = subclass.id
                    LEFT JOIN
                ontology mainclass ON mainclass.id = is_mainclass.is_a
            WHERE
                tax_id = {$taxid}
            ORDER BY main_class , sub_class , trait_name;
        ");

        return $traits;
    }

    public static function taxon_data($id,$page=1,$page_size = 35) {
        $id = Regex::Match($id, "\d+");
        
        if (strlen($id) == 0) {
            RFC7231Error::err400("invalid taxonomy id parameter!");
        } else {
            accessController::log_pageview("taxonomy", $id);
        }

        $tax = self::find_tax($id);

        if (Utils::isDbNull($tax)) {
            RFC7231Error::err404("Taxonomy data could not be found which is associated with ncbi taxid: $id");
        }

        $tax["title"] = "{$tax["name"]} ({$tax["rank_name"]})";
        $parent = self::find_tax( $tax["ancestor"]);
        $tax["parent_name"] = $parent["name"];
        $tax["parent_rank"] = $parent["rank_name"];
        $childs = json_decode($tax["childs"], true);

        if (!Utils::isDbNull($childs)) {
            if (count($childs) > 0) {
                $childs = (new Table(["cad_registry"=>"ncbi_taxonomy"]))
                    ->left_join("vocabulary")
                    ->on(["ncbi_taxonomy"=>"rank","vocabulary"=>"id"])
                    ->where(["`ncbi_taxonomy`.id"=>in($childs)])
                    ->limit(10)
                    ->select(["ncbi_taxonomy.*","term as rank_name"])
                    ;
                $tax["childs"] = $childs;
            } else {
                $tax["childs"] = [];
            }
        } else {
            $tax["childs"] = [];
        }
    
        
        $tax["enzyme"] = self::organism_proteins($id, $page, $page_size);
        $tax["metabolite"] = self::organism_metabolites($id);

        return list_nav( $tax,$page);
    }

    public static function organism_proteins($taxid, $page =1, $page_size = 35) {
        $prot_offset = ($page-1) * $page_size;
        $prot_data = FASTA_PROTEIN;
        $ec_number = EC_NUMBER;
        $sql = "SELECT 
            protein_data.id,
            source_id,
            source_db,
            term as db_name,
            name,
            `function`,
            db_xref AS ec_number
        FROM
            cad_registry.protein_data
                LEFT JOIN
            db_xrefs ON db_xrefs.obj_id = protein_data.id
                AND db_xrefs.type = {$prot_data}
                AND db_xrefs.db_name = {$ec_number}
                LEFT JOIN
            vocabulary ON vocabulary.id = protein_data.source_db
        WHERE
            ncbi_taxid = {$taxid}
                AND NOT db_xref IS NULL
        LIMIT {$prot_offset},{$page_size}
        ";

        return (new Table(["cad_registry"=>"protein_data"]))->exec($sql);
    }

    public static function organism_metabolites($taxid, $page = 1, $page_size = 100) {
        $offset = ($page -1) * $page_size;

        return (new Table(["cad_registry"=>"organism_source"]))
            ->left_join("metabolites")
            ->on(["metabolites"=>"id","organism_source"=>"metabolite_id"])
            ->left_join("struct_data")
            ->on(["struct_data"=>"metabolite_id","metabolites"=>"id"])
            ->where(["organism_id"=>$taxid])
            ->limit($offset, $page_size)
            ->select(["`metabolites`.id",
                "evidence",
                "name",
                "formula",
                "round(`exact_mass`,4) as `exact_mass`",
                "cas_id",
                "kegg_id",
                "lipidmaps_id",
                "biocyc",
                "smiles"])
            ;
    }

    private static function find_tax($q) {
        return (new Table(["cad_registry"=>"ncbi_taxonomy"]))
            ->left_join("vocabulary")
            ->on(["ncbi_taxonomy"=>"rank","vocabulary"=>"id"])
            ->where(["`ncbi_taxonomy`.id"=>$q])
            ->find(["ncbi_taxonomy.*","term as rank_name"])
            ;
    }
}