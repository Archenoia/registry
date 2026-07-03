declare namespace app {
    function run(): void;
}
declare namespace data.ZipData {
    type MetabolicEmbedding = viewer.metabolic_embedding;
    /**
     * 从URL下载zip文件并解析为MetabolicEmbedding数组
     * 优先从 localStorage 读取缓存的 ZIP Base64
     */
    export function loadAndParseZipFromUrl(url: string): Promise<MetabolicEmbedding[]>;
    /**
     * 从ArrayBuffer解压并解析CSV
     */
    export function parseZipToArray(zipBuffer: ArrayBuffer): Promise<MetabolicEmbedding[]>;
    /**
     * 解析CSV文本为MetabolicEmbedding数组
     */
    export function parseCsvText(csvText: string): MetabolicEmbedding[];
    export {};
}
declare namespace viewer {
    class SpectrumViewer {
        private chartInstance;
        private modalInstance;
        constructor();
        /**
         * 渲染质谱图
         */
        renderSpectrum(rawData: pages.spectrum_data): void;
    }
}
declare namespace pages {
    class metabolite_data extends Bootstrap {
        get appName(): string;
        protected init(): void;
        private load;
        private click_splash;
    }
    interface spectrum_data {
        splash_id: string;
        name: string;
        adducts: string;
        precursor: number;
        mz: string[];
        intensity: string[];
        smiles: string[];
    }
    interface spectrum_entry {
        adducts: string;
        mz: number;
        npeaks: number;
        splash_id: string;
    }
}
declare namespace msgbox {
    function showMessageModal(message: any, title?: string, type?: "error" | "success" | "warning"): void;
}
declare namespace pages {
    class peakdata extends Bootstrap {
        get appName(): string;
        page: number;
        protected init(): void;
        private show_peakdata;
    }
    interface peak_data {
        mz: number;
        intensity: number;
        smiles: string;
        splash_id: string;
        db_xref: string;
        name: string;
        adducts: string;
        precursor: number;
    }
}
declare namespace pages {
    class spectrum_data extends Bootstrap {
        get appName(): string;
        protected init(): void;
        private load_exp;
        private load_pie;
    }
    interface lcms_exp_result {
        taxname: string;
        taxid: string;
        tissue: string;
        adducts: string;
        size: number;
        q1: number;
        q3: number;
        rt: number;
        rep_id: number;
    }
}
declare namespace pages {
    class taxonomy_data extends Bootstrap {
        get appName(): string;
        static taxid(): string;
        protected init(): void;
        static loadMetaboliteData(): void;
        private static showTable;
    }
}
declare namespace pages {
    const url_user_info = "/user/info/";
    class user_login extends Bootstrap {
        get appName(): string;
        protected init(): void;
        login_onclick(): void;
        do_register_onclick(): void;
    }
}
declare namespace pages.landscapes {
    type GenomeEmbeddingViz = viewer.GenomeEmbeddingViz;
    export class metabolic extends Bootstrap {
        viz: GenomeEmbeddingViz;
        get appName(): string;
        protected init(): void;
    }
    export {};
}
declare namespace viewer {
    function initChart(containerId: string, option: {}): echarts.ECharts;
}
declare namespace viewer {
    interface metabolite_sources {
        id: number;
        name: string;
        formula: string;
        adducts: string;
        mz: number;
        q3: number;
        rt: number;
        score: number;
    }
    class MassSpecVisualizer {
        private chartInstance;
        constructor(dom: HTMLElement);
        /**
         * 任务 1: mz, rt 散点热图
         * x轴: rt (分钟), y轴: mz, 颜色映射: score
         */
        renderScatterHeatmap(data: metabolite_sources[]): void;
        /**
         * 任务 2: 类似 TIC 图的曲线图
         * 使用 10 秒钟 (10/60 分钟) 的 rt 窗口对 score 进行总加和
         */
        renderBinnedTICChart(data: metabolite_sources[]): void;
        dispose(): void;
    }
}
declare namespace viewer {
    /**
     * a scatter point model that represent a microbial genome embedding result
    */
    interface metabolic_embedding {
        /**
         * the genome assembly id
        */
        assembly_id: string;
        /**
         * umap/pca embedding dimension 1
        */
        x: number;
        /**
         * umap/pca embedding dimension 2
        */
        y: number;
        /**
         * umap/pca embedding dimension 3
        */
        z: number;
        /**
         * enzyme embedding raw data, length of 7, represent the emebdding result of ec number class 1-7
        */
        ec_number: number[];
        scientific_name: string;
        ncbi_taxid: string;
        kingdom: string;
        phylum: string;
        class: string;
        order: string;
        family: string;
        genus: string;
        species: string;
    }
    /**
      * Genome Embedding Visualization Module
      * Provides 3D scatter plot and radar chart visualization for microbial genome embedding data
      */
    class GenomeEmbeddingViz {
        scatterChart: any;
        radarChart: any;
        currentData: metabolic_embedding[];
        currentTaxonomyLevel: string;
        colorMap: {};
        selectedGenome: metabolic_embedding;
        /**
         * Initialize charts
         */
        initCharts(): void;
        /**
         * Generate color map for unique values
         */
        generateColorMap(uniqueValues: any): {};
        /**
         * Get unique values for a taxonomy level
         */
        getUniqueValues(data: any, level: any): any;
        /**
         * Update legend
         */
        updateLegend(): void;
        /**
         * Update stats bar
         */
        updateStats(): void;
        /**
         * Update 3D scatter chart
         */
        updateScatterChart(): void;
        /**
         * Select a genome and display its details
         */
        selectGenome(genome: any): void;
        /**
         * Highlight selected point in scatter chart
         */
        highlightPoint(genome: any): void;
        /**
         * Update radar chart for EC number embedding
         */
        updateRadarChart(genome: any): void;
        /**
         * Show/hide loading overlay
         */
        setLoading(isLoading: any): void;
        /**
         * Load embedding data and render visualization
         * @param {Array} data - Array of metabolic_embedding objects
         */
        loadData(data: metabolic_embedding[]): void;
        /**
         * Set taxonomy level for coloring
         * @param {string} level - Taxonomy level (kingdom, phylum, class, order, family, genus, species)
         */
        setTaxonomyLevel(level: any): void;
        /**
         * Get currently selected genome
         * @returns {Object|null} Selected genome or null
         */
        getSelectedGenome(): metabolic_embedding;
        /**
         * Get chart instances for external manipulation
         * @returns {Object} Object containing scatterChart and radarChart instances
         */
        getChartInstances(): {
            scatterChart: any;
            radarChart: any;
        };
        /**
         * Resize charts
         */
        resizeCharts(): void;
    }
}
declare namespace viewer {
    interface PieChartData {
        name: string;
        value: number;
    }
    interface SpeciesData {
        [key: string]: number;
    }
    function toPieData(rawData: SpeciesData): any;
    class PieViewer {
        static viz_pie(rawData: SpeciesData, chart_id: string, title: string): void;
    }
}
