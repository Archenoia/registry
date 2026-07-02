<?php

class portal {

    // 1. 定义搜索配置：将数据表、字段映射集中管理
    private static $searchSchema = [
        'enzyme'     => ['table' => 'cad_registry.enzyme', 'name_col' => 'recommended_name', 'match_cols' => 'recommended_name, systematic_name, note'],
        'location'   => ['table' => 'cad_registry.compartment_location', 'name_col' => 'name', 'match_cols' => 'fullname, note'],
        'metabolite' => ['table' => 'cad_registry.metabolites', 'name_col' => 'name', 'match_cols' => 'name, note'],
        'pathway'    => ['table' => 'cad_registry.pathway', 'name_col' => 'name', 'match_cols' => 'name, note'],
        'taxonomy'   => ['table' => 'cad_registry.ncbi_taxonomy', 'name_col' => 'name', 'match_cols' => 'name, zh_name, note'],
        'motif'      => ['table' => 'cad_registry.motif', 'name_col' => 'name', 'match_cols' => 'name, note'],
        'protein'    => ['table' => 'cad_registry.protein_data', 'name_col' => '`function`', 'match_cols' => '`function`'],
        'reaction'   => ['table' => 'cad_registry.reaction', 'name_col' => 'name', 'match_cols' => 'name, note'],
    ];

    // 2. 定义URL与样式映射
    private static $displayMap = [
        'enzyme'     => ['url' => '/enzyme/?id=%s', 'color' => 'primary', "name" => "Enzyme", "type" => "enzyme"],
        'location'   => ['url' => '/compartment/?name=%s', 'color' => 'secondary', 'use_name' => true, "name" => "SubCellular Location", "type" => "location"],
        'metabolite' => ['url' => '/metabolite/?id=%s', 'color' => 'success', "name" => "Metabolite", "type" => "metabolite"],
        'pathway'    => ['url' => '/pathway/?id=%s', 'color' => 'danger', "name" => "Pathway", "type" => "pathway"],
        'taxonomy'   => ['url' => '/taxonomy/?id=%s', 'color' => 'warning', "name" => "Taxonomy", "type" => "taxonomy"],
        'motif'      => ['url' => '/motif/?id=%s', 'color' => 'info', "name" => "Motif", "type" => "motif"],
        'protein'    => ['url' => '/protein/fasta/?id=%s', 'color' => 'dark', "name" => "Protein", "type" => "protein"],
        'reaction'   => ['url' => '/reaction/?id=%s', 'color' => 'danger', "name" => "Reaction", "type" => "reaction"],
    ];

    public static function db_search($q, $type_filter, $page = 1, $page_size = 50) {
        $q = Table::make_fulltext_strips($q);
        $offset = ($page - 1) * $page_size;

        accessController::make_stats($q);

        // 动态生成所有 SQL 查询
        $sqlParts = [];
        foreach (self::$searchSchema as $type => $config) {
            if ($type_filter !== "*" && $type_filter !== $type) {
                continue; // 如果指定了类型且不匹配，则跳过
            }
            
            $sqlParts[] = "(SELECT id, {$config['name_col']} AS name, 
                    MATCH ({$config['match_cols']}) AGAINST ('{$q}' IN BOOLEAN MODE) AS score, 
                    '{$type}' AS type 
                    FROM {$config['table']} 
                    WHERE MATCH ({$config['match_cols']}) AGAINST ('{$q}' IN BOOLEAN MODE))";
        }

        if (count($sqlParts) === 0) {
            RFC7231Error::err500("Invalid search type filter '{$type_filter}'.");
        }

        $sql = Strings::Join($sqlParts, " UNION ");
        $sql = "SELECT id, name, score, `type` FROM ({$sql}) t1 ORDER BY score DESC LIMIT {$offset},{$page_size}";

        $data = (new Table(["cad_registry" => "vocabulary"]))->getDriver()->Fetch($sql);
        
        $data = [
            "item" => self::assign_url($data),
            "colors" => self::$displayMap,
            "q" => $q
        ];

        return list_nav($data, $page);
    }

    private static function assign_url($terms) {
        foreach ($terms as &$term) { 
            // 使用引用直接修改数组
            $type = $term["type"];
            
            if (!isset(self::$displayMap[$type])) {
                RFC7231Error::err500("not implemented for build url of item type '{$type}'.");
            }

            $config = self::$displayMap[$type];
            
            // 处理 ID：location 使用 name，其他使用 id
            $idValue = ($config['use_name'] ?? false) ? $term["name"] : $term["id"];
            
            // 如果是 name，需要进行 urlencode (原逻辑行为)
            if ($config['use_name'] ?? false) {
                $idValue = urlencode($idValue);
            }

            $term["url"] = sprintf($config['url'], $idValue);
            $term["bs_color"] = $config['color'];
        }

        # 断开引用
        unset($term); 

        return $terms;
    }
}
