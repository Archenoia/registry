<?php

include __DIR__ . "/../.etc/bootstrap.php";

class App {

    public function __construct() {
        include_once APP_PATH . "/scripts/resolver.php";
    }

    /**
     * @uses api
     * @method get
     * 
     * @rate 30/min,500/hour,2000/day
    */
    public function annotation_hits() {
        include_once APP_PATH . "/scripts/mzvault/stats.php";
        controller::success(stats::organism_piedata(resolver::db_xref()));
    }

    /**
     * @uses api
     * @method get
     * 
     * @rate 30/min,500/hour,2000/day
    */
    public function spectrum_list() {
        include_once APP_PATH . "/scripts/mzvault/library.php";       
        controller::success(library_data::reference_spectrum_list(resolver::db_xref()));
    }

    /**
     * @uses api
     * @method get
     * 
     * @rate 30/min,500/hour,2000/day
    */
    public function spectrum($splash) {
        include_once APP_PATH . "/scripts/mzvault/library.php";
        controller::success(library_data::spectrum_data(resolver::db_xref(), $splash));
    }

    /**
     * @uses api
     * @method get
     * 
     * @rate 30/min,500/hour,2000/day
    */
    public function experiment_source() {
        $metabolite_id = resolver::db_xref();
        $exp = (new Table(["mzvault"=>"annotation"]))
            ->left_join("representative")
            ->on(["representative"=>"precursor_id","annotation"=>"id"])
            ->left_join("`cad_registry`.`ncbi_taxonomy`")
            ->on(["representative"=>"organism","ncbi_taxonomy"=>"id"])
            ->where([
                "db_xref"=> $metabolite_id              
            ])
            ->order_by("hits", true)
            ->select([
                "`ncbi_taxonomy`.name as taxname", 
                "organism as taxid", 
                "tissue", 
                "adducts", 
                "hits AS size", 
                "round(annotation.mz, 4) as q1",
                "round(Q3, 2) as q3", 
                "round(rt/60, 2) as rt", 
                "`representative`.id as rep_id"
            ])
            ;

        controller::success($exp);
    }

    /**
     * Plant Natural Product
     * 
     * @access *
     * @uses view
     * @method get
     * 
     * @rate 30/min,500/hour,2000/day
    */
    public function plant_np($page=1) {
        include_once APP_PATH . "/scripts/mzvault/np.php";
        View::Show(APP_VIEWS . "/mzvault/np_lib.html", np::plant_np($page));
    }

    /**
     * Microbial Natural Product
     * 
     * @access *
     * @uses view
     * @method get
     * 
     * @rate 30/min,500/hour,2000/day
    */
    public function microbial_np($page=1) {
        include_once APP_PATH . "/scripts/mzvault/np.php";
        View::Show(APP_VIEWS . "/mzvault/np_lib.html", np::microbial_np($page));
    }

    /**
     * @uses view
     * @method get
     * 
     * @rate 30/min,500/hour,2000/day
    */
    public function peak($mz) {        
        View::Display(["mz" => $mz,"da"=> 0.05]);
    }

    /**
     * @uses api
     * @method get
     * 
     * @rate 30/min,500/hour,2000/day
    */
    public function peakdata($mz, $da = 0.05, $page = 1) {
        include_once APP_PATH . "/scripts/mzvault/peak.php";
        controller::success(reference_peak::get_peakdata($mz, $da, $page));
    }
}