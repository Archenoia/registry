namespace viewer {

    export interface metabolite_sources {
        id: number;
        name: string;
        formula: string;
        adducts: string;
        mz: number;
        q3: number;
        rt: number;
        score: number;
    }

    // 提取主题色常量，方便统一管理
    const THEME = {
        background: '#ffffff',
        defaultText: '#535d6b',
        headingText: '#344761',
        accent: '#5c99ee',
        surface: '#ffffff',
        contrast: '#ffffff'
    };

    export class MassSpecVisualizer {
        private chartInstance: echarts.ECharts;

        constructor(dom: HTMLElement) {
            this.chartInstance = echarts.init(dom);
        }

        /**
         * 任务 1: mz, rt 散点热图
         * x轴: rt (分钟), y轴: mz, 颜色映射: score
         */
        public renderScatterHeatmap(data: metabolite_sources[]): void {
            const scores = data.map(d => d.score);
            const minScore = Math.min(...scores);
            const maxScore = Math.max(...scores);

            const seriesData = data.map(item => ({
                value: [item.rt, item.mz, item.score],
                rawData: item
            }));

            const option: echarts.EChartsOption = {
                backgroundColor: THEME.background, // 白色背景
                tooltip: {
                    trigger: 'item',
                    backgroundColor: THEME.headingText, // 深蓝灰背景
                    borderColor: THEME.accent,         // 主题蓝边框
                    borderWidth: 1,
                    textStyle: { color: THEME.contrast }, // 白色文字
                    formatter: (params: any) => {
                        const item = params.data.rawData as metabolite_sources;
                        return `
                        <div style="font-weight:bold; color:${THEME.accent}; margin-bottom:5px;">${item.name}</div>
                        <div>Formula: ${item.formula}</div>
                        <div>Adducts: ${item.adducts}</div>
                        <div>m/z: <span style="color:#00CED1;">${(+item.mz).toFixed(4)}</span></div>
                        <div>RT: <span style="color:#00CED1;">${(+item.rt).toFixed(2)}</span> min</div>
                        <div>Q3: ${(+item.q3).toFixed(4)}</div>
                        <div>Score: <span style="color:#FF6347; font-weight:bold;">${(+item.score).toFixed(4)}</span></div>
                    `;
                    }
                },
                grid: {
                    left: '8%',
                    right: '12%',
                    bottom: '10%',
                    top: '10%',
                    containLabel: true
                },
                xAxis: {
                    type: 'value',
                    name: 'Retention Time (min)',
                    nameTextStyle: { color: THEME.headingText, fontSize: 14 },
                    axisLine: { lineStyle: { color: THEME.defaultText } },
                    axisLabel: { color: THEME.defaultText },
                    splitLine: { lineStyle: { color: 'rgba(83, 93, 107, 0.1)' } } // 浅灰蓝分割线
                },
                yAxis: {
                    type: 'value',
                    name: 'm/z',
                    nameTextStyle: { color: THEME.headingText, fontSize: 14 },
                    axisLine: { lineStyle: { color: THEME.defaultText } },
                    axisLabel: { color: THEME.defaultText },
                    splitLine: { lineStyle: { color: 'rgba(83, 93, 107, 0.1)' } }
                },
                visualMap: {
                    min: minScore,
                    max: maxScore,
                    dimension: 2,
                    calculable: true,
                    orient: 'vertical',
                    right: 0,
                    top: 'center',
                    textStyle: { color: THEME.defaultText },
                    // 适合白色背景的鲜艳明亮配色 (蓝->青->绿->黄->红)
                    inRange: {
                        color: ['#5c99ee', '#00CED1', '#32CD32', '#FFD700', '#FF4500']
                    }
                },
                series: [
                    {
                        type: 'scatter',
                        data: seriesData,
                        symbolSize: 8,
                        itemStyle: {
                            opacity: 0.9,
                            shadowBlur: 4,
                            shadowColor: 'rgba(83, 93, 107, 0.3)' // 柔和的灰蓝阴影
                        },
                        emphasis: {
                            itemStyle: {
                                shadowBlur: 8,
                                borderColor: THEME.headingText,
                                borderWidth: 2
                            },
                            scale: 1.5
                        }
                    }
                ]
            };

            this.chartInstance.setOption(option, true);
        }

        /**
         * 任务 2: 类似 TIC 图的曲线图
         * 使用 10 秒钟 (10/60 分钟) 的 rt 窗口对 score 进行总加和
         */
        public renderBinnedTICChart(data: metabolite_sources[]): void {
            const windowSizeMin = 10 / 60;
            if (data.length === 0) return;

            const sortedData = [...data].sort((a, b) => a.rt - b.rt);

            const minRt = Math.floor(sortedData[0].rt / windowSizeMin) * windowSizeMin;
            const maxRt = Math.ceil(sortedData[sortedData.length - 1].rt / windowSizeMin) * windowSizeMin;

            const bins: {
                rtStart: number;
                rtEnd: number;
                totalScore: number;
                metabolites: metabolite_sources[]
            }[] = [];

            for (let t = minRt; t < maxRt; t += windowSizeMin) {
                bins.push({
                    rtStart: t,
                    rtEnd: t + windowSizeMin,
                    totalScore: 0,
                    metabolites: []
                });
            }

            sortedData.forEach(item => {
                const binIndex = Math.floor((item.rt - minRt) / windowSizeMin);
                if (binIndex >= 0 && binIndex < bins.length) {
                    bins[binIndex].totalScore += item.score;
                    bins[binIndex].metabolites.push(item);
                }
            });

            const lineData = bins.map(bin => ({
                value: [bin.rtStart, bin.totalScore],
                rawData: bin
            }));

            const option: echarts.EChartsOption = {
                backgroundColor: THEME.background,
                tooltip: {
                    trigger: 'axis',
                    backgroundColor: THEME.headingText,
                    borderColor: THEME.accent,
                    borderWidth: 1,
                    textStyle: { color: THEME.contrast },
                    formatter: (params: any) => {
                        const bin = params[0].data.rawData;
                        const timeStr = `${bin.rtStart.toFixed(2)} -${bin.rtEnd.toFixed(2)} min`;

                        const displayCount = Math.min(bin.metabolites.length, 5);
                        let metabolitesList = '';
                        for (let i = 0; i < displayCount; i++) {
                            const m = bin.metabolites[i];
                            metabolitesList += `<div style="font-size:12px; color:#D3D3D3;">
                            &nbsp;&nbsp;• ${m.name} (m/z:${(+m.mz).toFixed(2)}, RT: ${(+m.rt).toFixed(2)})
                        </div>`;
                        }
                        if (bin.metabolites.length > displayCount) {
                            metabolitesList += `<div style="font-size:12px; color:#A9A9A9;">&nbsp;&nbsp;... and ${bin.metabolites.length - displayCount} more</div>`;
                        }

                        return `
                        <div style="font-weight:bold; color:${THEME.accent}; margin-bottom:5px;">RT Window:${timeStr}</div>
                        <div style="margin-bottom:5px;">Total Score: <span style="color:#FFD700; font-weight:bold;">${bin.totalScore.toFixed(4)}</span></div>
                        <div style="font-weight:bold; color:#00CED1;">Metabolites (${bin.metabolites.length}):</div>
                        ${metabolitesList}
                    `;
                    }
                },
                grid: {
                    left: '8%',
                    right: '8%',
                    bottom: '10%',
                    top: '10%',
                    containLabel: true
                },
                xAxis: {
                    type: 'value',
                    name: 'Retention Time (min)',
                    nameTextStyle: { color: THEME.headingText, fontSize: 14 },
                    axisLine: { lineStyle: { color: THEME.defaultText } },
                    axisLabel: { color: THEME.defaultText },
                    splitLine: { lineStyle: { color: 'rgba(83, 93, 107, 0.1)' } }
                },
                yAxis: {
                    type: 'value',
                    name: 'Summed Score (10s window)',
                    nameTextStyle: { color: THEME.headingText, fontSize: 14 },
                    axisLine: { lineStyle: { color: THEME.defaultText } },
                    axisLabel: { color: THEME.defaultText },
                    splitLine: { lineStyle: { color: 'rgba(83, 93, 107, 0.1)' } }
                },
                series: [
                    {
                        type: 'line',
                        data: lineData,
                        smooth: true,
                        symbol: 'circle',
                        symbolSize: 6,
                        lineStyle: {
                            width: 3,
                            color: THEME.accent // 使用主题强调蓝作为曲线颜色
                        },
                        itemStyle: {
                            color: '#FF4500', // 橙红色圆点在白底+蓝线上对比强烈且明亮
                            borderColor: '#fff',
                            borderWidth: 1
                        },
                        areaStyle: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                { offset: 0, color: 'rgba(92, 153, 238, 0.6)' }, // 主题蓝渐变
                                { offset: 1, color: 'rgba(92, 153, 238, 0.02)' }
                            ])
                        },
                        emphasis: {
                            focus: 'series',
                            itemStyle: {
                                borderColor: THEME.headingText,
                                borderWidth: 2,
                                shadowBlur: 8,
                                shadowColor: 'rgba(52, 71, 97, 0.3)'
                            }
                        }
                    }
                ]
            };

            this.chartInstance.setOption(option, true);
        }

        public dispose(): void {
            this.chartInstance.dispose();
        }
    }
}