<?php

class metabolite {

    public static function organism_source($taxid, $page =1, $page_size = 150, $tissue = null) {
        if ((!Utils::IsDbNull($tissue)) && $tissue != "*") {
            $tissue = urldecode($tissue);
            $tissue = "AND `representative`.`tissue` = '{$tissue}'";
        } else {
            $tissue = "";
        }

        $offset = ($page - 1) * $page_size;
        $sql = "SELECT 
            ROUND(score, 1) AS score,
            ROUND(rt / 60, 1) AS rt,
            ROUND(q3, 2) AS q3,
            CONCAT('BioCAD', LPAD(db_xref, 11, '0')) AS id,
            metabolites.name,
            adducts,
            ROUND(annotation.mz, 4) AS mz,
            metabolites.formula
        FROM
            mzvault.representative
                LEFT JOIN
            annotation ON annotation.id = precursor_id
                LEFT JOIN
            cad_registry.metabolites ON metabolites.id = db_xref
        WHERE
            organism = {$taxid} AND score > 0 {$tissue}
        ORDER BY score DESC
        LIMIT {$offset},{$page_size}";

        return (new Table(["mzvault"=>"sampleinfo"]))->getDriver()->Fetch($sql);
    }

    public static function organism_samples($taxid) {
        return (new Table(["mzvault"=>"sampleinfo"]))->where(["taxid" => $taxid])->distinct()->project("tissue");
    }
}