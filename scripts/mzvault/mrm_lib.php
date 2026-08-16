<?php

class mrm_lib {

    public static function get_mrm($q1=null,$q3=null,$rt=null,$page =1, $page_size = 30) {
        $offset = ($page-1) * $page_size;
        $where = "";
        $da = 0.05;

        if (!Utils::isDbNull($q1)) {
            $where = "WHERE ABS(`annotation_hits`.mz - $q1) <= $da";
            accessController::log_pageview("mrm_lib", "q1={$q1}@page_{$page}");
        } else if (!Utils::isDbNull($q3)) {
            $where = "WHERE ABS(`q3` - $q3) <= $da";
            accessController::log_pageview("mrm_lib", "q3={$q3}@page_{$page}");
        } else if (!Utils::isDbNull($rt)) {
            $rt = $rt * 60;
            $where = "WHERE ABS(`rt` - $rt) <= 5";
            accessController::log_pageview("mrm_lib", "rt={$rt}@page_{$page}");
        } else {
            accessController::log_pageview("mrm_lib", "page_{$page}");
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

    public static function mrm_table($kegg = null) {
        $q = null;
        $metab_type = ENTITY_METABOLITE;

        if (!Utils::isDbNull($kegg)) {
            $kegg = Strings::Replace($kegg,"+"," ");
            $kegg = Strings::Split($kegg, " ");
            $q = [
                "`db_xrefs`.type" => ENTITY_METABOLITE,
                "`db_xrefs`.db_name" => DB_KEGG,
                "`db_xrefs`.db_xref" => in($kegg)
            ];
        } else {
            return [];
        }

        $tbl = new Table(["mzvault"=>"annotation_hits"]);
        $q = \MVC\MySql\Expression\WhereAssert::AsExpression($q);
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
        LEFT JOIN
    cad_registry.db_xrefs ON db_xrefs.obj_id = db_xref AND db_xrefs.type => {$metab_type}
WHERE {$q}
ORDER BY total DESC;"
        ;
        $data = $tbl->getDriver()->Fetch($sql);
        return $data;
    }
}