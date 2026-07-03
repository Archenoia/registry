namespace viewer {

    // 定义数据接口
    export interface PieChartData {
        name: string;
        value: number;
    }

    export interface SpeciesData {
        [key: string]: number;
    }


    export function toPieData(rawData: SpeciesData) {
        return Object.entries(rawData).map(([name, value]) => ({
            name,
            value
        }));
    }

    export class PieViewer {

        public static viz_pie(rawData: SpeciesData, chart_id: string, title: string) {
            // 转换为 ECharts 需要的格式
            const originalData: viewer.PieChartData[] = viewer.toPieData(rawData);

            // 1. 按照 value 降序排序
            originalData.sort((a, b) => b.value - a.value);

            // 2. 保留前9个系列，其余合并到 Other
            const TOP_N = 9;
            let pieData: viewer.PieChartData[] = originalData.slice(0, TOP_N);

            if (originalData.length > TOP_N) {
                const otherData = originalData.slice(TOP_N);
                const otherValue = otherData.reduce((sum, item) => sum + item.value, 0);
                if (otherValue > 0) {
                    pieData.push({ name: 'Other', value: otherValue });
                }
            }

            // 计算总和 (基于处理后的 pieData 或原始数据均可，总和不变)
            const total: number = pieData.reduce((sum, item) => sum + item.value, 0);

            // ECharts 配置项
            const option: echarts.EChartsOption = {
                // 标题配置
                title: {
                    text: title,
                    subtext: `总计: ${total.toFixed(2)}`,
                    left: 'center',
                    top: 20,
                    textStyle: {
                        fontSize: 24,
                        fontWeight: 'bold',
                        color: '#2C3E50'
                    },
                    subtextStyle: {
                        fontSize: 14,
                        color: '#7F8C8D'
                    }
                },

                // 提示框配置
                tooltip: {
                    trigger: 'item',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderColor: '#E0E0E0',
                    borderWidth: 1,
                    textStyle: {
                        color: '#2C3E50'
                    },
                    formatter: (params: any) => {
                        const percent = ((params.value / total) * 100).toFixed(2);
                        return `
          <div style="padding: 8px;">
            <strong style="font-size: 14px;">${params.name}</strong><br/>
            <span style="color: #7F8C8D;">数值: </span>
            <strong>${params.value.toFixed(4)}</strong><br/>
            <span style="color: #7F8C8D;">占比: </span>
            <strong>${percent}%</strong>
          </div>
        `;
                    }
                },

                // 图例配置
                legend: {
                    type: 'scroll',
                    orient: 'vertical',
                    right: 30,
                    top: 'middle',
                    itemWidth: 16,
                    itemHeight: 16,
                    itemGap: 12,
                    textStyle: {
                        fontSize: 13,
                        color: '#2C3E50'
                    },
                    formatter: (name: string) => {
                        const item = pieData.find(d => d.name === name);
                        if (item) {
                            const percent = ((item.value / total) * 100).toFixed(2);
                            return `${name}  (${percent}%)`;
                        }
                        return name;
                    }
                },

                // 系列配置
                series: [
                    {
                        name: '比例分布',
                        type: 'pie',
                        radius: ['35%', '70%'],  // 环形图，更美观
                        center: ['40%', '55%'],
                        avoidLabelOverlap: true,

                        // 标签配置
                        label: {
                            show: true,
                            position: 'outside',
                            formatter: (params: any) => {
                                const percent = ((params.value / total) * 100).toFixed(2);
                                // 占比小于1%的不显示标签
                                if (parseFloat(percent) < 1) {
                                    return '';
                                }
                                return `${params.name}\n${percent}%`;
                            },
                            fontSize: 12,
                            color: '#2C3E50',
                            lineHeight: 18
                        },

                        // 标签引导线
                        labelLine: {
                            show: true,
                            length: 15,
                            length2: 10,
                            smooth: true,
                            lineStyle: {
                                color: '#95A5A6',
                                width: 1.5
                            }
                        },

                        // 强调样式
                        emphasis: {
                            itemStyle: {
                                shadowBlur: 20,
                                shadowOffsetX: 0,
                                shadowColor: 'rgba(0, 0, 0, 0.3)',
                                borderWidth: 3,
                                borderColor: '#FFFFFF'
                            },
                            label: {
                                show: true,
                                fontSize: 14,
                                fontWeight: 'bold'
                            }
                        },

                        // 数据项样式
                        itemStyle: {
                            borderRadius: 8,
                            borderColor: '#FFFFFF',
                            borderWidth: 2
                        },

                        // 数据
                        data: pieData,

                        // 动画配置
                        animationType: 'scale',
                        animationEasing: 'elasticOut',
                        animationDelay: (idx: number) => idx * 100
                    }
                ]
            };

            const chart = viewer.initChart(chart_id, option);

            // 可选：添加点击事件
            chart.on('click', (params: any) => {
                console.log('Clicked:', params.name, params.value);
            });
        }
    }
}
