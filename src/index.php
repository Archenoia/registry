<?php

include __DIR__ . "/../.etc/bootstrap.php";

class App {

    /**
     * 数据之源，洞见之始
     * 
     * @access *
     * @uses view
    */
    public function index() {
        View::Display();
    }

    /**
     * Symbol resolver
     * 
     * @access *
     * 
     * @rate 30/min,500/hour,2000/day
    */
    public function s($ref) {
        include APP_PATH . "/scripts/resolver.php";
        resolver::resolve($ref);
    }

    /** 
     * 维护模式
     * 
     * @access *
     * @uses view
    */
    public function maintenance_mode() {
        View::Display();
    }

    /**
     * @access *
     * @uses view
     * 
     * @rate 30/min,500/hour,2000/day
    */
    public function metabolites($page       = 1, 
                                $topic      = null, 
                                $list       = null, 
                                $location   = null,
                                $ontology   = null,
                                $exact_mass = null,
                                $formula    = null, 
                                $q          = null) {

        include APP_PATH . "/scripts/metabolite/list.php";

        $q = metabolite_list::makeQuery($topic, $list, 
            $location, $ontology, $exact_mass,
            $formula, $q
        );
        $data = metabolite_list::getList($q[0], $q[1], $page);

        View::Display($data);
    }

    /**
     * @access *
     * @uses view
     * 
     * @rate 30/min,500/hour,2000/day
    */
    public function proteins($ec=null,$cc=null,$topic=null, $page =1) {
        include APP_PATH . "/scripts/protein/list.php";

        if (!Utils::isDbNull($cc)) {
            View::Show(APP_VIEWS . "/proteins_subcellular.html", model_list::list_cc($cc,$page));
        } else if (!Utils::isDbNull($topic)) {
            View::Show(APP_VIEWS . "/proteins_topic.html", model_list::list_topic($topic,$page));
        } else {
            View::Display(model_list::list_page($ec,$page));
        }        
    }

    /**
     * @access *
     * @uses view
     * 
     * @rate 30/min,500/hour,2000/day
    */
    public function protein($id,$page=1) {
        include APP_PATH . "/scripts/protein/page.php";
        View::Display(model_data::protein_model($id,$page));
    }

    /**
     * @access *
     * @uses view
     * 
     * @rate 30/min,500/hour,2000/day
    */
    public function enzyme($ec = null, $id = null) {
        include_once APP_PATH . "/scripts/enzyme/page.php";
        View::Display(enzyme_data::data($ec, $id));
    }

    /**
     * Metabolic Enzyme Database
     * 
     * @access *
     * @uses view
     * 
     * @rate 30/min,500/hour,2000/day
    */
    public function enzymes($q=null, $page=1) {
        if (Utils::isDbNull($q)) {
            View::Display([
                "counts" => (new Table(["cad_registry"=>"enzyme"]))->count()
            ]);
        } else {
            include APP_PATH . "/scripts/enzyme/list.php";

            $data = enzyme_list::search($q, $page);

            View::Show(APP_VIEWS . "/enzyme_search.html", $data);
        }
    }

    /**
     * @access *
     * @uses view
     * 
     * @rate 30/min,500/hour,2000/day
    */
    public function protein_fasta($id) {
        include APP_PATH . "/scripts/protein/fasta.php";
        View::Display(prot_fasta::seqinfo($id));
    }
    
    /**
     * @access *
     * @uses view
     * 
     * @rate 30/min,500/hour,2000/day
    */
    public function protein_cluster($id, $page = 1) {
        include APP_PATH . "/scripts/protein/cluster.php";
        View::Display(cluster_info::cluster_table($id, $page));
    }

    /**
     * @access *
     * @uses view
     * 
     * @rate 30/min,500/hour,2000/day
    */
    public function protein_domain($id, $page = 1) {
        include APP_PATH . "/scripts/protein/domain.php";
        View::Display(domain_info::domain_table($id, $page));
    }

    /**
     * Subcellular Locations
     * 
     * @access *
     * @uses view
     * 
     * @rate 30/min,500/hour,2000/day
    */
    public function compartments($page=1, $q=null) {
        include APP_PATH . "/scripts/compartments/list.php";
        View::Display(location_list::get_list($page, $q));
    }

    /**
     * @access *
     * @uses view
     * 
     * @rate 30/min,500/hour,2000/day
    */
    public function compartment($name) {
        include APP_PATH . "/scripts/compartments/page.php";
        View::Display(compartment_location::location_data($name));
    }

    /**
     * @access *
     * @uses view
     * 
     * @rate 30/min,500/hour,2000/day
    */
    public function motif($id = null, $family = null,$page=1) {
        include APP_PATH . "/scripts/motifs/page.php";

        if (Utils::isDbNull($id) && Utils::isDbNull($family)) {
            RFC7231Error::err400("Both motif id and motif family parameter should not be empty!");
        }

        if (!Utils::isDbNull($id)) {
            View::Show(APP_VIEWS . "/motif_id.html", motif_data::getdata($id));
        } else {
            View::Show(APP_VIEWS . "/motif_family.html", motif_data::getfamily(urldecode($family), $page));
        }
        
    }

    /**
     * Motifs Database
     * 
     * @access *
     * @uses view
     * 
     * @rate 30/min,500/hour,2000/day
    */
    public function motifs($page=1,$q=null,$page_size=10) {
        include APP_PATH . "/scripts/motifs/list.php";

        $data = motif_list::get_list($page, $q, $page_size);

        if (Utils::isDbNull($q)) {
            View::Display($data);
        } else {
            $data["name"] = "Search Result";
            $data["note"] = "Motif search resul of query '{$q}'.";

            View::Show(APP_VIEWS . "/motif_family.html", $data);
        }        
    }

    /**
     * @access *
     * @uses view
     * 
     * @rate 30/min,500/hour,2000/day
    */
    public function metabolite($id) {
        include APP_PATH . "/scripts/metabolite/page.php";

        $id = registry::resolve_id($id, false);
        $main_id = registry::resolve_main($id);

        if ($main_id > 0) {
            Redirect("/metabolite/BioCAD" . str_pad($main_id,11,"0", STR_PAD_LEFT));
        } else {
            View::Display(metabolite_page::page_data($id));
        }       
    }

    /**
     * @access *
     * @uses view
     * 
     * @rate 30/min,500/hour,2000/day
    */
    public function reaction($id) {
        include APP_PATH . "/scripts/reaction/page.php";
        View::Display(reaction_model::get_data($id));        
    }

    /**
     * @access *
     * @uses view
     * 
     * @rate 30/min,500/hour,2000/day
    */
    public function reactions($metabolite=null, $page=1) {
        include APP_PATH . "/scripts/reaction/list.php";
        View::Display(reaction_list::get_list($metabolite,$page));
    }

    /**
     * @access *
     * @uses view
     * 
     * @rate 30/min,500/hour,2000/day
    */
    public function taxonomy($id,$page=1) {
        include APP_PATH . "/scripts/taxonomy/page.php";
        View::Display(ncbi_taxonomy::taxon_data($id,$page));
    }

    /**
     * @access *
     * @uses view
     * 
     * @rate 30/min,500/hour,2000/day
    */
    public function taxonomy_root() {
        include APP_PATH . "/scripts/taxonomy/page.php";
        View::Display(ncbi_taxonomy::taxon_data("1",1));
    }

    /**
     * @access *
     * @uses view
     * 
     * @rate 30/min,500/hour,2000/day
    */
    public function taxonomy_search($q, $page = 1) {
        include APP_PATH . "/scripts/taxonomy/search.php";
        View::Display(search::query_list(urldecode($q), $page));
    }

    /**
     * @access *
     * @uses view
     * 
     * @rate 30/min,500/hour,2000/day
    */
    public function trait($id, $page=1) {
        include APP_PATH . "/scripts/taxonomy/trait.php";
        View::Display(trait_data::page_data($id, $page));
    }

    /**
     * @uses view
     * 
     * @rate 30/min,500/hour,2000/day
    */
    public function spectrum($metab) {
        include APP_PATH . "/scripts/spectrum/page.php";
        View::Display(spectrum_data::get_data(Regex::Match($metab,"\d+")));
    }

    /**
     * @access *
     * @uses view
     * 
     * @rate 30/min,500/hour,2000/day
    */
    public function pathways($tax = null,$metab=null,$q=null, $page=1) {
        include_once APP_PATH . "/scripts/pathways/list.php";
        View::Display(pathway_list::get_list($tax,$metab,$q, $page));
    }

    /**
     * @access *
     * @uses view
     * 
     * @rate 30/min,500/hour,2000/day
    */
    public function pathway($id) {
        include_once APP_PATH . "/scripts/pathways/model.php";
        View::Display(pathway_model::get_model($id));
    }

    /**
     * Data Search
     * 
     * @access *
     * @uses view
    */
    public function database() {
        View::Display();
    }

    /**
     * Resource Downloads
     * 
     * @access *
     * @uses view
    */
    public function downloads() {
        View::Display();
    }

    /**
     * Privacy Policy
     * 
     * @access *
     * @uses view
    */
    public function privacy() {
        View::Display();
    }

    /**
     * Search 
     * 
     * @access *
     * @uses view
     * 
     * @rate 30/min,500/hour,2000/day
    */
    public function search($q, $page = 1) {
        View::Display((include APP_PATH . "/scripts/search.php")->get_result(urldecode($q), $page));
    }

    /**
     * About 
     * 
     * @access *
     * @uses view
    */
    public function about() {
        View::Display();
    }

    /**
     * License
     * 
     * @access *
     * @uses view
    */
    public function license() {
        View::Display();
    }

    /**
     * User Login
     * 
     * @access *
     * @uses view
    */
    public function login() {
        View::Display();
    }
}