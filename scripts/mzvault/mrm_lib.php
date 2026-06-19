<?php

class mrm_lib {

    public static function get_mrm($q1=null,$q3=null,$rt=null,$page =1, $page_size = 30) {
        $offset = ($page-1) * $page_size;
        $where = "";
        $da = 0.05;

        if (!Utils::isDbNull($q1)) {
            $where = "WHERE ABS(`annotation_hits`.mz - $q1) <= $da";
        } else if (!Utils::isDbNull($q3)) {
            $where = "WHERE ABS(`q3` - $q3) <= $da";
        } else if (!Utils::isDbNull($rt)) {
            $rt = $rt * 60;
            $where = "WHERE ABS(`rt` - $rt) <= 5";
        }

        $sql = "SELECT 
    CONCAT('BioCAD', LPAD(db_xref, 11, '0')) AS metab_id,
    ROUND(mz, 4) AS q1,
    ROUND(q3, 2) AS q3,
    ROUND(rt / 60, 2) AS `rt(min)`,
    top_adducts,
    name,
    total,
    smiles,
    metabolites.note
FROM
    mzvault.annotation_hits
        LEFT JOIN
    cad_registry.metabolites ON metabolites.id = db_xref
        LEFT JOIN
    cad_registry.struct_data ON struct_data.metabolite_id = db_xref
{$where}
ORDER BY total DESC
LIMIT {$offset} , {$page_size};"
        ;
        $tbl = new Table(["mzvault"=>"annotation_hits"]);
        $data = $tbl->getDriver()->Fetch($sql);

        return list_nav( ["mrm" => $data], $page);
    }
}