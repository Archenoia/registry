namespace pages {

    const url_experiment_source = "/mzvault/experiment_source/";
    const url_annotation_hits = "/mzvault/annotation_hits/";

    export class spectrum_data extends Bootstrap {

        get appName(): string {
            return "spectrum_data";
        }

        protected init(): void {
            this.load_exp();
            this.load_pie();
        }

        private load_exp() {
            $ts.get(url_experiment_source, msg => {
                if (msg.code == 0) {
                    let data = $ts(<lcms_exp_result[]>msg.info).Where(a => (!Strings.Empty(a.taxid, true)) && (!Strings.Empty(a.taxname, true))).Select(a => {
                        return {
                            "Organism Source": `<a href="/taxonomy/?id=${a.taxid}">${a.taxname}</a>`,
                            "Tissue": a.tissue,
                            "Adducts": a.adducts,
                            "Size": a.size,
                            "MRM MSn[Q1/Q3]": `<a href="#" class="spectrum_id" data="${a.rep_id}">${a.q1} / ${a.q3}</a>`,
                            "rt(min)": a.rt
                        }
                    });

                    if (data.Count > 0) {
                        $ts("#exp_table").clear();
                        $ts.appendTable(data, "#exp_table", null, { class: "table" });
                        $ts.select(".spectrum_id").onClick(a => {
                            let rep_spectrum = a.getAttribute("data");

                        });
                    }
                }
            })
        }

        private load_pie() {
            $ts.get(url_annotation_hits, msg => {
                if (msg.code == 0) {
                    let anno_hits = <{ organism: viewer.SpeciesData, tissue: viewer.SpeciesData }>msg.info;

                    viewer.PieViewer.viz_pie(anno_hits.organism, "org_pie", '物种分布统计');
                    viewer.PieViewer.viz_pie(anno_hits.tissue, "tissue_pie", '来源分布统计');
                }
            });
        }
    }

    export interface lcms_exp_result {
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