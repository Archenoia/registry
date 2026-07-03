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
            // 提取 score 的最小最大值用于视觉映射
            const scores = data.map(d => d.score);
            const minScore = Math.min(...scores);
            const maxScore = Math.max(...scores);

            // 构造 ECharts 散点数据格式
            // 为了让 tooltip 能拿到原始数据，我们将原始对象挂载到 data 上
            const seriesData = data.map(item => ({
                value: [item.rt, item.mz, item.score],
                rawData: item
            }));

            const option: echarts.EChartsOption = {
                backgroundColor: '#1e1e2e', // 深色背景更能凸显鲜艳颜色
                tooltip: {
                    trigger: 'item',
                    backgroundColor: 'rgba(50, 50, 50, 0.9)',
                    borderColor: '#fff',
                    borderWidth: 1,
                    textStyle: { color: '#fff' },
                    formatter: (params: any) => {
                        const item = params.data.rawData as metabolite_sources;
                        return `
                        <div style="font-weight:bold; color:#FFD700; margin-bottom:5px;">${item.name}</div>
                        <div>Formula: ${item.formula}</div>
                        <div>Adducts: ${item.adducts}</div>
                        <div>m/z: <span style="color:#00FFFF;">${item.mz.toFixed(4)}</span></div>
                        <div>RT: <span style="color:#00FFFF;">${item.rt.toFixed(2)}</span> min</div>
                        <div>Q3: ${item.q3.toFixed(4)}</div>
                        <div>Score: <span style="color:#FF4500; font-weight:bold;">${item.score.toFixed(4)}</span></div>
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
                    nameTextStyle: { color: '#fff', fontSize: 14 },
                    axisLine: { lineStyle: { color: '#ccc' } },
                    axisLabel: { color: '#ccc' },
                    splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }
                },
                yAxis: {
                    type: 'value',
                    name: 'm/z',
                    nameTextStyle: { color: '#fff', fontSize: 14 },
                    axisLine: { lineStyle: { color: '#ccc' } },
                    axisLabel: { color: '#ccc' },
                    splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }
                },
                visualMap: {
                    min: minScore,
                    max: maxScore,
                    dimension: 2, // 映射数据的第三个维度 (index 2)，即 score
                    calculable: true,
                    orient: 'vertical',
                    right: 0,
                    top: 'center',
                    textStyle: { color: '#fff' },
                    // 鲜艳明亮的颜色配色 (从冷色到暖色/亮色)
                    inRange: {
                        color: ['#00FFCC', '#00FF00', '#FFFF00', '#FF8000', '#FF0000']
                    }
                },
                series: [
                    {
                        type: 'scatter',
                        data: seriesData,
                        symbolSize: 8,
                        itemStyle: {
                            opacity: 0.9,
                            shadowBlur: 10,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        },
                        emphasis: {
                            itemStyle: {
                                shadowBlur: 15,
                                borderColor: '#fff',
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
            const windowSizeMin = 10 / 60; // 10秒转换为分钟
            if (data.length === 0) return;

            // 按 rt 排序
            const sortedData = [...data].sort((a, b) => a.rt - b.rt);

            const minRt = Math.floor(sortedData[0].rt / windowSizeMin) * windowSizeMin;
            const maxRt = Math.ceil(sortedData[sortedData.length - 1].rt / windowSizeMin) * windowSizeMin;

            // 构建分箱
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

            // 将数据填入分箱
            sortedData.forEach(item => {
                const binIndex = Math.floor((item.rt - minRt) / windowSizeMin);
                if (binIndex >= 0 && binIndex < bins.length) {
                    bins[binIndex].totalScore += item.score;
                    bins[binIndex].metabolites.push(item);
                }
            });

            // 构造 ECharts 折线图数据
            const lineData = bins.map(bin => ({
                value: [bin.rtStart, bin.totalScore],
                rawData: bin
            }));

            const option: echarts.EChartsOption = {
                backgroundColor: '#1e1e2e',
                tooltip: {
                    trigger: 'axis',
                    backgroundColor: 'rgba(50, 50, 50, 0.9)',
                    borderColor: '#fff',
                    borderWidth: 1,
                    textStyle: { color: '#fff' },
                    formatter: (params: any) => {
                        const bin = params[0].data.rawData;
                        const timeStr = `${bin.rtStart.toFixed(2)} - ${bin.rtEnd.toFixed(2)} min`;

                        // 提取该窗口内的代谢物信息（限制显示数量防止 tooltip 过长）
                        const displayCount = Math.min(bin.metabolites.length, 5);
                        let metabolitesList = '';
                        for (let i = 0; i < displayCount; i++) {
                            const m = bin.metabolites[i];
                            metabolitesList += `<div style="font-size:12px; color:#DDD;">
                            &nbsp;&nbsp;• ${m.name} (MRM(Q1/Q3): ${m.mz.toFixed(4)}/${m.q3.toFixed(2)}, RT: ${m.rt.toFixed(2)}min)
                        </div>`;
                        }
                        if (bin.metabolites.length > displayCount) {
                            metabolitesList += `<div style="font-size:12px; color:#AAA;">&nbsp;&nbsp;... and ${bin.metabolites.length - displayCount} more</div>`;
                        }

                        return `
                        <div style="font-weight:bold; color:#FFD700; margin-bottom:5px;">RT Window: ${timeStr}</div>
                        <div style="margin-bottom:5px;">Total Score: <span style="color:#FF4500; font-weight:bold;">${bin.totalScore.toFixed(4)}</span></div>
                        <div style="font-weight:bold; color:#00FFFF;">Metabolites (${bin.metabolites.length}):</div>
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
                    nameTextStyle: { color: '#fff', fontSize: 14 },
                    axisLine: { lineStyle: { color: '#ccc' } },
                    axisLabel: { color: '#ccc' },
                    splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }
                },
                yAxis: {
                    type: 'value',
                    name: 'Summed Score (10s window)',
                    nameTextStyle: { color: '#fff', fontSize: 14 },
                    axisLine: { lineStyle: { color: '#ccc' } },
                    axisLabel: { color: '#ccc' },
                    splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }
                },
                series: [
                    {
                        type: 'line',
                        data: lineData,
                        smooth: true, // 平滑曲线模拟 TIC
                        symbol: 'circle',
                        symbolSize: 6,
                        lineStyle: {
                            width: 3,
                            color: '#FF1493' // 鲜艳的深粉色
                        },
                        itemStyle: {
                            color: '#00FFFF', // 鲜艳的青色
                            borderColor: '#fff',
                            borderWidth: 1
                        },
                        areaStyle: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                { offset: 0, color: 'rgba(255, 20, 147, 0.8)' }, // 顶部高亮
                                { offset: 1, color: 'rgba(255, 20, 147, 0.1)' }  // 底部透明
                            ])
                        },
                        emphasis: {
                            focus: 'series',
                            itemStyle: {
                                borderColor: '#fff',
                                borderWidth: 2,
                                shadowBlur: 10,
                                shadowColor: '#FF1493'
                            }
                        }
                    }
                ]
            };

            this.chartInstance.setOption(option, true);
        }

        // 销毁实例
        public dispose(): void {
            this.chartInstance.dispose();
        }
    }
}