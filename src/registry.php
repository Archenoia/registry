<?php

include __DIR__ . "/../.etc/bootstrap.php";

class App {

    /**
     * @access *
     * @uses api
    */
    public function hot_search() {
        include_once APP_PATH . "/scripts/hot.php";
        controller::success(hot_search::top());
    }

    /**
     * @uses api
     * @access *
     * 
     * @rate 30/min,500/hour,2000/day
    */
    public function metabolite($id) {
        include APP_PATH . "/scripts/metabolite/page.php";

        $id = metabolite_page::resolve_id($id);
        $main_id = metabolite_page::resolve_main($id);

        if ($main_id > 0) {
            $id = $main_id;
        }

        controller::success(metabolite_page::page_data($id));
    }

    /**
     * @access *
     * @uses api
     * 
     * @rate 30/min,500/hour,2000/day
    */
    public function metabolites($page       = 1, 
                                $topic      = null, 
                                $list       = null, 
                                $location   = null,
                                $ontology   = null,
                                $exact_mass = null,
                                $formula    = null) {

        include APP_PATH . "/scripts/metabolite/list.php";

        $q = metabolite_list::makeQuery($topic, $list, 
            $location, $ontology, $exact_mass,
            $formula
        );
        $data = metabolite_list::getList($q[0], $q[1], $page);

        controller::success($data);
    }

    /**
     * @uses file
     * @access *
     * 
     * @rate 30/min,500/hour,2000/day
    */
    public function motif($logo) {
        $id = Regex::Match($logo, "\d+");
        $logo = (new Table(["cad_registry"=>"motif"]))->where(["id"=>$id])->findfield("logo");

        echo $logo;
    }

    /**
     * rest api for load enzyme table
     * 
     * @param integer[] $q the ec number query
     * 
     * @uses api
     * @access *
     * @method get
     * 
     * @rate 30/min,500/hour,2000/day
    */
    public function enzyme_data($q) {
        include_once APP_PATH . "/scripts/enzyme/list.php";

        if (!is_array($q)) {
            $q = Strings::Split($q, "."); 
        }

        # enzyme_list::expand_mainclass
        # /registry/enzyme_data/?q=1     
        # enzyme_list::expand_subclass
        # /registry/enzyme_data/?q=1.1
        # enzyme_list::expand_subcategory
        # /registry/enzyme_data/?q=1.1.1

        $class_id    = Utils::ReadValue($q, 0); # first digit in ec number    
        $subclass_id = Utils::ReadValue($q, 1); # second digit in ec number  
        $category_id = Utils::ReadValue($q, 2); # third digit in ec number  

        if (Utils::isDbNull($subclass_id )) {
            controller::success(enzyme_list::expand_mainclass($class_id));
        } else if (Utils::isDbNull($category_id)) {
            controller::success(enzyme_list::expand_subclass($class_id, $subclass_id));
        } else {
            controller::success(enzyme_list::expand_subcategory($class_id, $subclass_id, $category_id));
        }
    }

    /**
     * @uses api
     * @method get
     * 
     * @rate 30/min,500/hour,2000/day
    */
    public function organism_source($taxid) {
        include APP_PATH . "/scripts/taxonomy/metabolites.php";
        $data = metabolite::organism_source($taxid, 30);
        controller::success($data);
    }
}