namespace data {

    /**
     * 使用 IQR (四分位距) 方法过滤 mz 和 rt 中的异常离群点
     * @param data 原始数据
     * @param multiplier IQR 的倍数，通常为 1.5 (标准) 或 3.0 (只过滤极端离群点)
     * @returns 过滤后的数据
     */
    export function filterOutliers(data: viewer.metabolite_sources[], multiplier: number = 1.5): viewer.metabolite_sources[] {
        if (data.length === 0) return [];

        // 提取需要过滤的维度
        const rts = data.map(d => d.rt).sort((a, b) => a - b);
        const mzs = data.map(d => d.mz).sort((a, b) => a - b);

        // 计算百分位数的辅助函数
        const getPercentile = (sortedArr: number[], p: number) => {
            const index = (p / 100) * (sortedArr.length - 1);
            const lower = Math.floor(index);
            const upper = Math.ceil(index);
            if (lower === upper) return sortedArr[lower];
            // 线性插值
            return sortedArr[lower] + (sortedArr[upper] - sortedArr[lower]) * (index - lower);
        };

        // 计算 RT 的 IQR 范围
        const rtQ1 = getPercentile(rts, 25);
        const rtQ3 = getPercentile(rts, 75);
        const rtIQR = rtQ3 - rtQ1;
        const rtLowerBound = Math.max(0, rtQ1 - multiplier * rtIQR); // RT不能小于0
        const rtUpperBound = rtQ3 + multiplier * rtIQR;

        // 计算 mz 的 IQR 范围
        const mzQ1 = getPercentile(mzs, 25);
        const mzQ3 = getPercentile(mzs, 75);
        const mzIQR = mzQ3 - mzQ1;
        const mzLowerBound = Math.max(0, mzQ1 - multiplier * mzIQR); // m/z不能小于0
        const mzUpperBound = mzQ3 + multiplier * mzIQR;

        // 过滤数据
        return data.filter(item =>
            item.rt >= rtLowerBound && item.rt <= rtUpperBound &&
            item.mz >= mzLowerBound && item.mz <= mzUpperBound
        );
    }

}