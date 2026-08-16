<?php

include __DIR__ . "/../.etc/bootstrap.php";

class App {

    /**
     * Microbial Genome Embedding Visualization
     * 
     * @access *
     * @uses view
    */
    public function metabolic_embedding() {
        View::Display();
    }

    /**
     * Natural Product Library
     * 
     * @access *
     * @uses view
    */
    public function natural_products() {
        View::Display();
    }

    /**
     * Metabolite Spectrum Library
     * 
     * @access *
     * @uses view
     * 
     * @rate 30/min,300/hour,1000/day
    */
    public function metabolite_spectrum($q1=null,$q3=null,$rt=null,$page=1) {
        include_once APP_PATH . "/scripts/mzvault/mrm_lib.php";
        View::Display(mrm_lib::get_mrm($q1,$q3,$rt,$page));
    }

    /**
     * @uses api
     * @rate 30/min,300/hour,1000/day
    */
    public function mrm_table($kegg = null) {
        include_once APP_PATH . "/scripts/mzvault/mrm_lib.php";
        $table = mrm_lib::mrm_table($kegg);
        controller::success($table);
    }
}