<?php

class metabolite {

    public static function organism_source($taxid, $top = 150) {
        $sql = "SELECT 
        CONCAT('BioCAD', LPAD(metabolites.id, 11, '0')) AS id, name, formula, ROUND(exact_mass, 4) AS exact_mass, size
    FROM
        (SELECT 
            db_xref, COUNT(*) AS size
        FROM
            mzvault.sampleinfo
        LEFT JOIN spectrum ON spectrum.sample_id = sampleinfo.id
        LEFT JOIN annotation ON annotation.id = annotation_id
        WHERE
            taxid = {$taxid}
        GROUP BY db_xref
        ORDER BY size DESC
        LIMIT {$top}) t1
            LEFT JOIN
        cad_registry.metabolites ON t1.db_xref = id";
breakpoint($sql);
        return (new Table(["mzvault"=>"sampleinfo"]))->getDriver()->Fetch($sql);
    }
}