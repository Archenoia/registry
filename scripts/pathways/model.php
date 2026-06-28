<?php

class pathway_model {

    public static function get_model($id) {
        $pwy = (new Table(["cad_registry"=>"pathway"]))->where(["id"=>$id])->find();
        $pwy["title"] = $pwy["name"];

        accessController::log_pageview("pathway", $id);

        $pwy["metab"] = (new Table(["cad_registry"=>"pathway_network"]))
            ->left_join("metabolites")->on(["metabolites"=>"id", "pathway_network"=> "model_id"])
            ->left_join("struct_data")->on(["struct_data"=>"metabolite_id","metabolites"=>"id"])
            ->where(["class_id" => ENTITY_METABOLITE, "pathway_id" => $id, "metabolite_id" => not_null()])
            ->select(["metabolite_id", "name", "formula", "exact_mass", "cas_id", "smiles"])
            ;
        $pwy["enzyme"] = (new Table(["cad_registry"=>"pathway_network"]))
            ->left_join("enzyme")
            ->on(["enzyme"=>"id","pathway_network"=>"model_id"])
            ->where(["class_id"=> EC_NUMBER, "pathway_id"=> $id])
            ->select(["`enzyme`.*", "symbol_id as ec_number"])
            ;
        $pwy["org"] = self::pathway_ratio(array_column($pwy["enzyme"], "ec_number"));

        return $pwy;
    }

    private static function pathway_ratio($ecs) {
        $ecs = array_unique($ecs);
        $n = count($ecs);

        if ($n == 0) {
            return [];
        } else {
            $list = (new Table(["cad_registry"=>"db_xrefs"]))
                ->left_join("protein_data")->on(["protein_data"=>"id","db_xrefs"=>"obj_id"])
                ->left_join("ncbi_taxonomy")->on(["ncbi_taxonomy"=>"id","protein_data"=>"ncbi_taxid"])
                ->left_join("refseq")->on(["refseq"=>"species_taxid","protein_data"=>"ncbi_taxid"])
                ->where([
                    "type" => FASTA_PROTEIN,
                    "db_xref" => in($ecs)
                ])
                ->group_by(["ncbi_taxid", "`ncbi_taxonomy`.name"])
                ->order_by("ratio", true)
                ->limit(20)
                ->select([
                    "GROUP_CONCAT(DISTINCT `db_xref` SEPARATOR ' / ') AS ecs",
        "ncbi_taxid",
        "`ncbi_taxonomy`.`name`",
        "ROUND(COUNT(DISTINCT db_xref) / {$n}  * 100, 2) AS ratio",
        "GROUP_CONCAT(DISTINCT `group`) AS tax_group"
                ]);

            for($i =0; $i < count($list); $i++) {
                $group = $list[$i]["tax_group"];

                if (Utils::isDbNull($group)) {
                    $list[$i]["tax_group"] = "MAGs";
                }
            }

            return $list;
        }
    }
}