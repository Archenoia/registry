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

        }

        public static loadMetaboliteData() {
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
                    $ts.get(`${url_organism_source}?taxid=${this.taxid()}`, msg => {
                        if (msg.code == 0) {
                            taxonomy_data.showTable(<any>msg.info);
                        } else {
                            $ts("#metab-source").display(`<div class="alert alert-danger" role="alert">
  Server Error or you have no access to this data.
</div>`);
                        }
                    });
                } else {
                    // do nothing at here
                }
            });
        }

        private static showTable(tbl: []) {
            let data = $from(<metabolite_sources[]>tbl).Select(a => {
                return {
                    "ID": `<a href="/metabolite/${a.id}">${a.id}</a>`,
                    "Name": `<a href="/spectrum/?metab=${a.id}">${a.name}</a>`,
                    "Formula": a.formula,
                    "Exact Mass": a.exact_mass,
                    "Hits": a.size
                };
            });

            if (data.Count == 0) {
                $ts("#metab-source").display(`<div class="alert alert-warning" role="alert">
  No metabolite data found for this organism.
</div>`);
            } else {
                $ts("#metab-source").clear();
                $ts.appendTable(data, "#metab-source", null, { class: "table" });
            }
        }
    }

    export interface metabolite_sources {
        id: number;
        name: string;
        formula: string;
        exact_mass: number;
        size: number;
    }
}