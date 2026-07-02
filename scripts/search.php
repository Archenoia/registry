<?php

class search {

    public function get_result($q, $type="*", $page = 1) {
        $referer = $_SERVER['HTTP_REFERER'];
        $referer = Utils::isDbNull($referer) ? null : URL::mb_parse_url ( $referer );

        if (StringHelpers::IsPattern($q,"BioCAD\d+")) {
            Redirect("/metabolite/$q");
        }

        if (!Utils::isDbNull($referer)) {
            return self::local_search(trim($referer["path"], "/"), $q, $page);
        } else {
            return self::global_search($q, $type, $page);
        } 
    }

    private static function local_search($refer, $q, $page = 1) {
        $encode_q = urlencode($q);
        $refer = Strings::Split($refer, "/")[0];
        $lowerRefer = strtolower($refer);

        // 重定向映射：别名 → 目标路径片段
        $redirectMap = [
            'compartments'    => 'compartments',
            'metabolites'     => 'metabolites', 'metabolite' => 'metabolites', 'spectrum' => 'metabolites', "natural_products" => 'metabolites', "landscape" => 'metabolites',
            'motifs'          => 'motifs',      'motif'      => 'motifs',
            'enzymes'         => 'enzymes',     'enzyme'     => 'enzymes',
            'taxonomy'        => 'taxonomy_search', 'taxonomy_search' => 'taxonomy_search',
            'pathways'        => 'pathways',    'pathway'    => 'pathways',
        ];
        
        if (isset($redirectMap[$lowerRefer])) {
            // 假设 Redirect() 内部含 exit；若无，建议在 Redirect 后显式添加 exit;
            Redirect("/{$redirectMap[$lowerRefer]}/?q={$encode_q}");            
        } else {
            return self::global_search($q, $page);
        }     
    }

    private static function global_search($q, $type, $page = 1) {
        include_once APP_PATH . "/scripts/dbsearch.php";
        $result = portal::db_search($q, $type, $page);
        $result["title"] = "Search Result of '{$q}'";
        return $result;   
    }
}

return new search();