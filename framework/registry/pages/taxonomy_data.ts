namespace pages {

    const url_organism_source = "/registry/organism_source/";

    export class taxonomy_data extends Bootstrap {

        get appName(): string {
            return "taxonomy_data";
        }

        static taxid() {
            return $ts.location("id");
        }

        protected init(): void {
            taxonomy_data.loadMetaboliteData(true, () => {
                // 假设你已经在 HTML 中准备了一个 div: <div id="chart" style="width: 800px; height: 600px;"></div>             
                const scatter = new viewer.MassSpecVisualizer($ts("#scatter-chart"));
                const tic = new viewer.MassSpecVisualizer($ts("#tic-chart"));
                // 获取数据
                const myData: viewer.metabolite_sources[] = data.filterOutliers(taxonomy_data.metabolite_data);

                // 渲染散点热图
                scatter.renderScatterHeatmap([...myData]);
                // TIC 图
                tic.renderBinnedTICChart([...myData]);
            });
        }

        static metabolite_data: viewer.metabolite_sources[] = [];

        public static loadMetaboliteData(landscape: boolean = false, render?: Delegate.Action) {
            $ts.get(`${url_user_info}`, msg => {
                if (msg.code == 0) {
                    $ts("#metab-source").display(`
<br />
<br />
<div class="d-flex justify-content-center">
  <div class="spinner-border" role="status">
    <span class="visually-hidden">Loading...</span>
  </div>
</div>
<br />
`);
                    $ts.get(`${url_organism_source}?taxid=${this.taxid()}&landscape=${landscape}`, msg => {
                        if (msg.code == 0) {
                            taxonomy_data.showTable(<any>msg.info);
                            taxonomy_data.metabolite_data = <any>msg.info;

                            if (landscape && !isNullOrUndefined(render)) {
                                (<Delegate.Action>render)();
                            }

                        } else {
                            $ts("#metab-source").display(`<div class="alert alert-danger d-flex align-items-center" role="alert">
  <svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Danger:"><use xlink:href="#exclamation-triangle-fill"/></svg>
  <div>
  Server Error or you have no access to this data.
</div>
</div>`);
                        }
                    });
                } else {
                    // do nothing at here
                }
            });
        }

        private static showTable(tbl: []) {
            let data = $from(<viewer.metabolite_sources[]>tbl).Take(30).Select(a => {
                return {
                    "ID": `<a href="/metabolite/${a.id}">${a.id}</a>`,
                    "Name": `<a href="/spectrum/?metab=${a.id}">${a.name}</a>`,
                    "Formula": a.formula,
                    "Adducts": a.adducts,
                    "MRM[Q1/Q3]": `${(+a.mz).toFixed(4)} / ${(+a.q3).toFixed(2)}`,
                    "RT": a.rt + " min",
                    "Score": a.score
                };
            });

            if (data.Count == 0) {
                $ts("#metab-source").display(`<div class="alert alert-warning" role="alert">
  No metabolite data found for this organism.
</div>`);
            } else {
                $ts("#metab-source").clear();
                $ts.appendTable(data, "#metab-source", undefined, { class: "table" });
            }
        }
    }
}