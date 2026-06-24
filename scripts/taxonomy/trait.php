<?php

class trait_data {

    public static function page_data($id, $page =1, $page_size = 50) {
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
        $tax_list = (new Table(["cad_registry"=>"organism_traits"]))
            ->left_join("ncbi_taxonomy")
            ->on(["ncbi_taxonomy"=>"id","organism_traits"=>"tax_id"])
            ->left_join("vocabulary")
            ->on(["vocabulary"=>"id","ncbi_taxonomy"=>"rank"])
            ->where(["traits_id" => $id])
            ->limit($offset, $page_size)
            ->select([
                "ncbi_taxonomy.name AS taxname",
                "term AS `rank`",
                "tax_id",
                "GTDB_id",
                "unit",
                "consensus_value",
                "min",
                "mean",
                "max",
                "discrete_values",
                "ontology_ids"
            ]);

        $trait["tax"] = array_map(function($tax) {
            $unit = $tax["unit"];
            $value = $tax["consensus_value"];

            if ($value == "NA") {
                $value = round(floatval($tax["mean"]), 2);

                if ($tax["min"] == $tax["max"]) {
                    # do nothing
                } else {
                    $value = "{$value} ({$tax["min"]} ~ {$tax["max"]})";
                }                
            } else if ($unit != "boolean") {
                $values = json_decode($tax["discrete_values"]);
                $maxKey = null;
                $maxValue = -INF; // 初始化为负无穷，确保任何数值都能比它大

                // 2. 遍历数组寻找最大值
                foreach ($values as$key => $value) {
                    // 将字符串转换为浮点数进行比较
                    $numericValue = floatval($value); 
                    
                    if ($numericValue >$maxValue) {
                        $maxValue =$numericValue;
                        $maxKey =$key;
                    }
                }

                $value = $maxKey;
            }

            $tax["value"] = $value;

            return $tax;
        },$tax_list) ;

        return list_nav( $trait, $page);
    }
}