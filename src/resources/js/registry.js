var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
///<reference path="../linq.d.ts" />
var app;
(function (app) {
    function run() {
        Router.AddAppHandler(new pages.spectrum_data());
        Router.AddAppHandler(new pages.taxonomy_data());
        Router.AddAppHandler(new pages.metabolite_data());
        Router.AddAppHandler(new pages.peakdata());
        Router.AddAppHandler(new pages.landscapes.metabolic());
        Router.AddAppHandler(new pages.user_login());
        Router.RunApp();
    }
    app.run = run;
})(app || (app = {}));
$ts.mode = Modes.debug;
$ts(app.run);
var data;
(function (data) {
    var ZipData;
    (function (ZipData) {
        // 缓存配置
        // 修改这个版本号可以强制让用户刷新缓存（例如数据更新时）
        var CACHE_VERSION = 'v1_20231027';
        var CACHE_KEY = "metabolic_embedding_zip_".concat(CACHE_VERSION);
        /**
         * 从URL下载zip文件并解析为MetabolicEmbedding数组
         * 优先从 localStorage 读取缓存的 ZIP Base64
         */
        function loadAndParseZipFromUrl(url) {
            return __awaiter(this, void 0, void 0, function () {
                var cachedBase64, arrayBuffer_1, error_1, response, arrayBuffer, base64;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 3, , 4]);
                            cachedBase64 = localStorage.getItem(CACHE_KEY);
                            if (!cachedBase64) return [3 /*break*/, 2];
                            console.log('[Cache] Loading data from localStorage...');
                            arrayBuffer_1 = base64ToArrayBuffer(cachedBase64);
                            if (!(arrayBuffer_1 && arrayBuffer_1.byteLength > 0)) return [3 /*break*/, 2];
                            return [4 /*yield*/, parseZipToArray(arrayBuffer_1)];
                        case 1: return [2 /*return*/, _a.sent()];
                        case 2: return [3 /*break*/, 4];
                        case 3:
                            error_1 = _a.sent();
                            console.warn('[Cache] Failed to read cache, fetching from network...', error_1);
                            // 如果读取失败（如解析错误），清除脏数据
                            localStorage.removeItem(CACHE_KEY);
                            return [3 /*break*/, 4];
                        case 4:
                            // 2. 没有缓存或缓存失效，从网络获取
                            console.log('[Network] Fetching zip file from server...');
                            return [4 /*yield*/, fetch(url)];
                        case 5:
                            response = _a.sent();
                            if (!response.ok) {
                                throw new Error("Failed to fetch zip file: ".concat(response.status, " ").concat(response.statusText));
                            }
                            return [4 /*yield*/, response.arrayBuffer()];
                        case 6:
                            arrayBuffer = _a.sent();
                            // 3. 存入 localStorage (异步执行，不阻塞解析)
                            // 注意：如果数据超过 localStorage 限制（通常5MB），try-catch 会捕获错误
                            try {
                                base64 = arrayBufferToBase64(arrayBuffer);
                                localStorage.setItem(CACHE_KEY, base64);
                                console.log('[Cache] Data cached successfully.');
                            }
                            catch (error) {
                                console.warn('[Cache] Failed to save to localStorage (likely quota exceeded).', error);
                            }
                            // 4. 解析并返回
                            return [2 /*return*/, parseZipToArray(arrayBuffer)];
                    }
                });
            });
        }
        ZipData.loadAndParseZipFromUrl = loadAndParseZipFromUrl;
        /**
         * ArrayBuffer 转 Base64 字符串
         */
        function arrayBufferToBase64(buffer) {
            var binary = '';
            var bytes = new Uint8Array(buffer);
            var len = bytes.byteLength;
            for (var i = 0; i < len; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            return window.btoa(binary);
        }
        /**
         * Base64 字符串 转 ArrayBuffer
         */
        function base64ToArrayBuffer(base64) {
            var binaryString = window.atob(base64);
            var len = binaryString.length;
            var bytes = new Uint8Array(len);
            for (var i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            return bytes.buffer;
        }
        /**
         * 从ArrayBuffer解压并解析CSV
         */
        function parseZipToArray(zipBuffer) {
            return __awaiter(this, void 0, void 0, function () {
                var zip, csvFile, csvText;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, JSZip.loadAsync(zipBuffer)];
                        case 1:
                            zip = _a.sent();
                            csvFile = Object.keys(zip.files).find(function (filename) { return filename.toLowerCase().endsWith('.csv'); });
                            if (!csvFile) {
                                throw new Error('No CSV file found in the zip archive');
                            }
                            return [4 /*yield*/, zip.file(csvFile).async('string')];
                        case 2:
                            csvText = _a.sent();
                            return [2 /*return*/, parseCsvText(csvText)];
                    }
                });
            });
        }
        ZipData.parseZipToArray = parseZipToArray;
        /**
         * 解析CSV文本为MetabolicEmbedding数组
         */
        function parseCsvText(csvText) {
            var lines = csvText.trim().split('\n');
            if (lines.length < 2) {
                throw new Error('CSV file is empty or has no data rows');
            }
            // 解析表头
            var headers = parseCsvLine(lines[0]);
            // 定义列索引映射
            var columnMap = {
                assembly_id: headers.indexOf('assembly_id'),
                dimension_1: headers.indexOf('dimension_1'),
                dimension_2: headers.indexOf('dimension_2'),
                dimension_3: headers.indexOf('dimension_3'),
                ec_1: headers.indexOf('1.-.-.-'),
                ec_2: headers.indexOf('2.-.-.-'),
                ec_3: headers.indexOf('3.-.-.-'),
                ec_4: headers.indexOf('4.-.-.-'),
                ec_5: headers.indexOf('5.-.-.-'),
                ec_6: headers.indexOf('6.-.-.-'),
                ec_7: headers.indexOf('7.-.-.-'),
                scientific_name: headers.indexOf('scientific_name'),
                kingdom: headers.indexOf('kingdom'),
                phylum: headers.indexOf('phylum'),
                class: headers.indexOf('class'),
                order: headers.indexOf('order'),
                family: headers.indexOf('family'),
                genus: headers.indexOf('genus'),
                species: headers.indexOf('species'),
                ncbi_taxid: headers.indexOf('ncbi_taxid')
            };
            // 验证必要列存在
            var requiredColumns = ['assembly_id', 'dimension_1', 'dimension_2', 'dimension_3'];
            for (var _i = 0, requiredColumns_1 = requiredColumns; _i < requiredColumns_1.length; _i++) {
                var col = requiredColumns_1[_i];
                if (columnMap[col] === -1) {
                    throw new Error("Required column \"".concat(col, "\" not found in CSV header"));
                }
            }
            var result = [];
            var _loop_1 = function (i) {
                var line = lines[i].trim();
                if (!line)
                    return "continue"; // 跳过空行
                var values = parseCsvLine(line);
                var getNumber = function (colName) {
                    var idx = columnMap[colName];
                    var val = idx >= 0 ? values[idx] : '0';
                    return parseFloat(val) || 0;
                };
                var getString = function (colName) {
                    var idx = columnMap[colName];
                    return idx >= 0 ? (values[idx] || '') : '';
                };
                result.push({
                    assembly_id: getString('assembly_id'),
                    x: getNumber('dimension_1'),
                    y: getNumber('dimension_2'),
                    z: getNumber('dimension_3'),
                    ec_number: [
                        getNumber('ec_1'),
                        getNumber('ec_2'),
                        getNumber('ec_3'),
                        getNumber('ec_4'),
                        getNumber('ec_5'),
                        getNumber('ec_6'),
                        getNumber('ec_7'),
                    ],
                    scientific_name: getString('scientific_name'),
                    ncbi_taxid: getString('ncbi_taxid'),
                    kingdom: getString('kingdom'),
                    phylum: getString('phylum'),
                    class: getString('class'),
                    order: getString('order'),
                    family: getString('family'),
                    genus: getString('genus'),
                    species: getString('species')
                });
            };
            // 解析数据行
            for (var i = 1; i < lines.length; i++) {
                _loop_1(i);
            }
            return result;
        }
        ZipData.parseCsvText = parseCsvText;
        /**
         * 解析单行CSV，正确处理引号包裹的字段
         */
        function parseCsvLine(line) {
            var result = [];
            var current = '';
            var inQuotes = false;
            for (var i = 0; i < line.length; i++) {
                var char = line[i];
                if (char === '"') {
                    if (inQuotes && line[i + 1] === '"') {
                        // 转义的引号
                        current += '"';
                        i++;
                    }
                    else {
                        // 切换引号状态
                        inQuotes = !inQuotes;
                    }
                }
                else if (char === ',' && !inQuotes) {
                    result.push(current);
                    current = '';
                }
                else {
                    current += char;
                }
            }
            result.push(current);
            return result;
        }
    })(ZipData = data.ZipData || (data.ZipData = {}));
})(data || (data = {}));
var viewer;
(function (viewer) {
    var SpectrumViewer = /** @class */ (function () {
        function SpectrumViewer() {
            var _this = this;
            this.chartInstance = null;
            // 初始化时可以预绑定 Modal，或者使用时再获取
            var modalDom = document.getElementById('spectrumModal');
            if (modalDom) {
                // 这里的 Modal 是 Bootstrap 的全局对象，根据你的项目引入方式调整
                this.modalInstance = new window.bootstrap.Modal(modalDom);
                // 监听模态框显示事件，触发 ECharts resize，防止图表变形
                modalDom.addEventListener('shown.bs.modal', function () {
                    if (_this.chartInstance) {
                        _this.chartInstance.resize();
                    }
                });
            }
        }
        /**
         * 渲染质谱图
         */
        SpectrumViewer.prototype.renderSpectrum = function (rawData) {
            // 1. 数据清洗与类型转换
            // API 返回的是字符串数组，需要转换为数字数组
            var mzValues = rawData.mz.map(function (v) { return parseFloat(v); });
            var intensityValues = rawData.intensity.map(function (v) { return parseFloat(v); });
            var precursorMz = typeof rawData.precursor === 'string' ? parseFloat(rawData.precursor) : rawData.precursor;
            var smilesArr = rawData.smiles || [];
            // 构造 ECharts 所需的数据格式
            // data 结构: [mz, intensity, smiles]
            var chartData = mzValues.map(function (mz, index) {
                return [
                    mz,
                    intensityValues[index],
                    smilesArr[index] || '' // 防止 smiles 数组缺失
                ];
            });
            // 2. 初始化图表
            var chartDom = document.getElementById('spectrum_chart');
            if (!chartDom)
                return;
            if (this.chartInstance) {
                this.chartInstance.dispose(); // 销毁旧实例
            }
            this.chartInstance = echarts.init(chartDom);
            // 3. ECharts 配置项
            var option = {
                backgroundColor: '#fff', // 亮色主题
                title: {
                    text: rawData.name || 'MS/MS Spectrum',
                    subtext: "Precursor m/z: ".concat(precursorMz.toFixed(4), " | Adduct: ").concat(rawData.adducts),
                    left: 'center',
                    top: 10,
                    textStyle: {
                        fontSize: 16,
                        fontWeight: 'bold'
                    }
                },
                tooltip: {
                    trigger: 'item', // 触发方式：数据项图形触发
                    axisPointer: {
                        type: 'shadow'
                    },
                    formatter: function (params) {
                        // params.data 结构对应上面构造的 [mz, intensity, smiles]
                        var mz = params.data[0];
                        var intensity = params.data[1];
                        var smiles = params.data[2];
                        // 格式化输出: m/z: mz(intensity) [smiles]
                        return "m/z: <strong>".concat(mz.toFixed(4), "</strong> (").concat(intensity.toFixed(2), ")<br/>") +
                            "<span style=\"font-size:10px;color:#666;\">[".concat(smiles, "]</span>");
                    }
                },
                grid: {
                    left: 60,
                    right: 20,
                    top: 80,
                    bottom: 60,
                    containLabel: false
                },
                xAxis: {
                    type: 'value',
                    name: 'm/z',
                    nameLocation: 'middle',
                    nameGap: 30,
                    min: function (value) { return value.min - 10; }, // 留出边距
                    splitLine: {
                        show: false // 质谱图通常不显示垂直网格线
                    },
                    axisLine: {
                        show: true,
                        lineStyle: { color: '#333' }
                    }
                },
                yAxis: {
                    type: 'value',
                    name: 'Intensity (%)', // 假设是相对丰度
                    nameLocation: 'middle',
                    nameGap: 40,
                    min: 0,
                    max: 100, // 根据数据看最大值是 100，通常 MS2 归一化到 100
                    splitLine: {
                        lineStyle: { color: '#eee' } // 淡灰色网格线
                    },
                    axisLine: {
                        show: true,
                        lineStyle: { color: '#333' }
                    }
                },
                // // 数据区域缩放组件，方便查看局部细节
                // dataZoom: [
                //     {
                //         type: 'inside', // 内置型，支持鼠标滚轮缩放
                //         xAxisIndex: 0,
                //         filterMode: 'none'
                //     },
                //     {
                //         type: 'slider', // 滑动条型
                //         xAxisIndex: 0,
                //         bottom: 10,
                //         height: 20,
                //         filterMode: 'none'
                //     }
                // ],
                series: [
                    {
                        type: 'bar',
                        data: chartData,
                        barWidth: 2, // 极细的柱宽，模拟质谱棒状图
                        itemStyle: {
                            color: '#000', // 经典质谱图通常为黑色线条
                        },
                        // [修改点1] 添加 cursor 属性，悬停时显示手型图标，提示可点击
                        cursor: 'pointer',
                        emphasis: {
                            itemStyle: {
                                color: '#0d6efd' // Bootstrap primary color，鼠标悬停高亮
                            }
                        },
                        // 标记前体离子位置
                        markLine: {
                            symbol: 'none',
                            label: {
                                show: true,
                                position: 'end',
                                formatter: 'Precursor',
                                fontSize: 10
                            },
                            lineStyle: {
                                color: '#dc3545', // Bootstrap danger color
                                type: 'dashed'
                            },
                            data: [
                                { xAxis: precursorMz }
                            ]
                        }
                    }
                ]
            };
            this.chartInstance.setOption(option);
            // [修改点2] 绑定点击事件
            this.chartInstance.on('click', function (params) {
                // 确保点击的是数据柱子
                if (params.componentType === 'series') {
                    // 这里的 params.data 就是构造 chartData 时的数组：[mz, intensity, smiles]
                    var mzValue = params.data[0];
                    // 构造跳转链接
                    var url = "/mzvault/peak/?mz=".concat(mzValue);
                    // 执行页面跳转
                    $goto(url);
                }
            });
            // 显示模态框
            if (this.modalInstance) {
                this.modalInstance.show();
            }
        };
        return SpectrumViewer;
    }());
    viewer.SpectrumViewer = SpectrumViewer;
})(viewer || (viewer = {}));
/// <reference path="../viewer/SpectrumViewer.ts"/>
var pages;
(function (pages) {
    var url_spectrum_list = "/mzvault/spectrum_list/";
    var url_spectrum_data = "/mzvault/spectrum/";
    var metabolite_data = /** @class */ (function (_super) {
        __extends(metabolite_data, _super);
        function metabolite_data() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(metabolite_data.prototype, "appName", {
            get: function () {
                return "metabolite_data";
            },
            enumerable: false,
            configurable: true
        });
        metabolite_data.prototype.init = function () {
            this.load();
        };
        metabolite_data.prototype.load = function () {
            var _this = this;
            $ts.get(url_spectrum_list, function (msg) {
                if (msg.code == 0) {
                    var list = $from(msg.info).Select(function (entry) {
                        return {
                            Adduct: entry.adducts,
                            "m/z": entry.mz,
                            "Num Peaks": entry.npeaks,
                            "Splash_id": "<a href=\"#\" onclick=\"javascript:void(0);\" class=\"splash_id\" data=\"".concat(entry.splash_id, "\">").concat(entry.splash_id, "</a>")
                        };
                    });
                    $ts("#spectrum_list").clear();
                    $ts.appendTable(list, "#spectrum_list", null, { class: "table" });
                    $ts.select(".splash_id").onClick(function (a) { return _this.click_splash(a.getAttribute("data")); });
                }
            });
        };
        metabolite_data.prototype.click_splash = function (splash_id) {
            $ts.get("".concat(url_spectrum_data, "?splash=").concat(splash_id), function (data) {
                if (data.code == 0) {
                    var spectrum = data.info;
                    var display = new viewer.SpectrumViewer();
                    // display the spectrum on page
                    display.renderSpectrum(spectrum);
                }
            });
        };
        return metabolite_data;
    }(Bootstrap));
    pages.metabolite_data = metabolite_data;
})(pages || (pages = {}));
var msgbox;
(function (msgbox) {
    // 辅助函数：显示消息对话框
    function showMessageModal(message, title, type) {
        if (title === void 0) { title = "Error Message"; }
        if (type === void 0) { type = "error"; }
        var modalEl = document.getElementById('messageModal');
        var contentEl = document.getElementById('messageModalContent');
        var titleEl = document.getElementById('messageModalLabel');
        var textEl = document.getElementById('messageModalText');
        // 清除之前的状态类
        contentEl.classList.remove('error', 'success', 'warning');
        // 隐藏所有图标
        contentEl.querySelectorAll('.icon-wrapper svg').forEach(function (icon) { return icon.classList.add('d-none'); });
        // 设置当前状态
        contentEl.classList.add(type);
        titleEl.textContent = title;
        textEl.textContent = message;
        // 显示对应图标
        if (type === 'error') {
            contentEl.querySelector('.error-icon').classList.remove('d-none');
        }
        else if (type === 'success') {
            contentEl.querySelector('.success-icon').classList.remove('d-none');
        }
        else if (type === 'warning') {
            contentEl.querySelector('.warning-icon').classList.remove('d-none');
        }
        // 显示 Modal
        var modal = bootstrap.Modal.getOrCreateInstance(modalEl);
        modal.show();
    }
    msgbox.showMessageModal = showMessageModal;
})(msgbox || (msgbox = {}));
var pages;
(function (pages) {
    var peakdata = /** @class */ (function (_super) {
        __extends(peakdata, _super);
        function peakdata() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.page = 1;
            return _this;
        }
        Object.defineProperty(peakdata.prototype, "appName", {
            get: function () {
                return "peakdata";
            },
            enumerable: false,
            configurable: true
        });
        peakdata.prototype.init = function () {
            this.show_peakdata();
        };
        peakdata.prototype.show_peakdata = function () {
            var mz = $ts("@mz");
            var da = $ts("@da");
            $ts.get("/mzvault/peakdata/?mz=".concat(mz, "&da=").concat(da), function (result) {
                if (result.code == 0) {
                    var peaks = result.info.peak;
                    var data_1 = $from(peaks).Select(function (a) {
                        return {
                            metabolite: "<a href=\"/spectrum/?metab=".concat(a.db_xref, "\">").concat(a.name, "</a><br /><br />\n                            adduct: ").concat(a.adducts, "<br />\n                            precurosr: ").concat(a.precursor, "\n                            "),
                            splash_id: a.splash_id,
                            mz: "".concat(a.mz, " (").concat(a.intensity, ")"),
                            "fragment smiles": a.smiles
                        };
                    });
                    console.table(peaks);
                    $ts("#peaksdata").clear();
                    $ts.appendTable(data_1, "#peaksdata", null, { class: "table" });
                }
            });
        };
        return peakdata;
    }(Bootstrap));
    pages.peakdata = peakdata;
})(pages || (pages = {}));
var pages;
(function (pages) {
    var url_experiment_source = "/mzvault/experiment_source/";
    var url_annotation_hits = "/mzvault/annotation_hits/";
    var spectrum_data = /** @class */ (function (_super) {
        __extends(spectrum_data, _super);
        function spectrum_data() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(spectrum_data.prototype, "appName", {
            get: function () {
                return "spectrum_data";
            },
            enumerable: false,
            configurable: true
        });
        spectrum_data.prototype.init = function () {
            this.load_exp();
            this.load_pie();
        };
        spectrum_data.prototype.load_exp = function () {
            $ts.get(url_experiment_source, function (msg) {
                if (msg.code == 0) {
                    var data_2 = $ts(msg.info).Select(function (a) {
                        return {
                            "Organism Source": "<a href=\"/taxonomy/?id=".concat(a.taxid, "\">").concat(a.taxname, "</a>"),
                            "Tissue": a.tissue,
                            "Adducts": a.adducts,
                            "Size": a.size,
                            "Representative[Q1/Q3/rt(min)]": "<a href=\"#\" data=\"".concat(a.rep_id, "\">").concat(a.q1, "/").concat(a.q3, " [").concat(a.rt, "min]</a>")
                        };
                    });
                    if (data_2.Count > 0) {
                        $ts("#exp_table").clear();
                        $ts.appendTable(data_2, "#exp_table", null, { class: "table" });
                    }
                }
            });
        };
        spectrum_data.prototype.load_pie = function () {
            $ts.get(url_annotation_hits, function (msg) {
                if (msg.code == 0) {
                    var anno_hits = msg.info;
                    viewer.PieViewer.viz_pie(anno_hits.organism, "org_pie", '物种分布统计');
                    viewer.PieViewer.viz_pie(anno_hits.tissue, "tissue_pie", '来源分布统计');
                }
            });
        };
        return spectrum_data;
    }(Bootstrap));
    pages.spectrum_data = spectrum_data;
})(pages || (pages = {}));
var pages;
(function (pages) {
    var url_organism_source = "/registry/organism_source/";
    var taxonomy_data = /** @class */ (function (_super) {
        __extends(taxonomy_data, _super);
        function taxonomy_data() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(taxonomy_data.prototype, "appName", {
            get: function () {
                return "taxonomy_data";
            },
            enumerable: false,
            configurable: true
        });
        taxonomy_data.prototype.taxid = function () {
            return $ts.location("id");
        };
        taxonomy_data.prototype.init = function () {
            $ts.get("".concat(url_organism_source, "?taxid=").concat(this.taxid()), function (msg) {
                if (msg.code == 0) {
                    var data_3 = $from(msg.info).Select(function (a) {
                        return {
                            "ID": "<a href=\"/metabolite/".concat(a.id, "\">").concat(a.id, "</a>"),
                            "Name": "<a href=\"/spectrum/?metab=".concat(a.id, "\">").concat(a.name, "</a>"),
                            "Formula": a.formula,
                            "Exact Mass": a.exact_mass,
                            "Hits": a.size
                        };
                    });
                    $ts("#metab-source").clear();
                    $ts.appendTable(data_3, "#metab-source", null, { class: "table" });
                }
            });
        };
        return taxonomy_data;
    }(Bootstrap));
    pages.taxonomy_data = taxonomy_data;
})(pages || (pages = {}));
var pages;
(function (pages) {
    var user_login = /** @class */ (function (_super) {
        __extends(user_login, _super);
        function user_login() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(user_login.prototype, "appName", {
            get: function () {
                return "user_login";
            },
            enumerable: false,
            configurable: true
        });
        user_login.prototype.init = function () {
        };
        user_login.prototype.login_onclick = function () {
            var email = $ts("#loginEmail").value;
            var password = $ts("#loginPassword").value;
            var loginForm = document.getElementById("loginForm");
            if (email && password) {
                // Simulate login
                var btn_1 = loginForm.querySelector('button[id="login"]');
                var originalText_1 = btn_1.textContent;
                btn_1.textContent = "登录中...";
                btn_1.disabled = true;
                $ts.post("/user/login/", { email: email, passwd: md5(password) }, function (result) {
                    if (result.code == 0) {
                        var $goto_url = $ts.location("goto", false, "/database/");
                        $goto_url = decodeURIComponent($goto_url);
                        $goto($goto_url);
                    }
                    else {
                        btn_1.textContent = originalText_1;
                        btn_1.disabled = false;
                        msgbox.showMessageModal(result.info);
                    }
                });
            }
            else {
                msgbox.showMessageModal("Email or Password is required!");
            }
        };
        user_login.prototype.do_register_onclick = function () {
            // Register Form
            var registerForm = document.getElementById("registerForm");
            var password = $ts("#regPassword").value;
            var confirmPassword = $ts("#regConfirmPassword").value;
            var name = $ts("#regName").value;
            var affi = $ts("#regInstitution").value;
            var regEmail = $ts("#regEmail").value;
            if (password !== confirmPassword) {
                alert("两次输入的密码不一致，请重新输入。");
                return;
            }
            if (password.length < 8) {
                alert("密码长度至少为8位。");
                return;
            }
            // Simulate registration
            var btn = document.querySelector('#registerModal button[id="do_register"]');
            btn.textContent = "注册中...";
            btn.disabled = true;
            $ts.post("/user/register/", {
                name: name,
                email: regEmail,
                passwd: md5(password),
                affiliation: affi
            }, function (result) {
                btn.textContent = "注册账号";
                btn.disabled = false;
                if (result.code == 0) {
                    alert("注册成功！请查收验证邮件。");
                }
                bootstrap.Modal.getInstance(document.getElementById("registerModal")).hide();
            });
        };
        return user_login;
    }(Bootstrap));
    pages.user_login = user_login;
})(pages || (pages = {}));
var pages;
(function (pages) {
    var landscapes;
    (function (landscapes) {
        var metabolic = /** @class */ (function (_super) {
            __extends(metabolic, _super);
            function metabolic() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            Object.defineProperty(metabolic.prototype, "appName", {
                get: function () {
                    return "metabolic_landscape";
                },
                enumerable: false,
                configurable: true
            });
            metabolic.prototype.init = function () {
                var _this = this;
                this.viz = new viewer.GenomeEmbeddingViz();
                this.viz.initCharts();
                data.ZipData.loadAndParseZipFromUrl("/resources/assets/Metabolic-UMAP.zip")
                    .then(function (data) {
                    _this.viz.loadData(data);
                });
            };
            return metabolic;
        }(Bootstrap));
        landscapes.metabolic = metabolic;
    })(landscapes = pages.landscapes || (pages.landscapes = {}));
})(pages || (pages = {}));
var viewer;
(function (viewer) {
    // 初始化 ECharts 实例
    function initChart(containerId, option) {
        var container = document.getElementById(containerId);
        if (!container) {
            throw new Error("Container with id \"".concat(containerId, "\" not found"));
        }
        var chart = echarts.init(container, undefined, {
            renderer: 'canvas'
        });
        // 设置配置项
        chart.setOption(option);
        // 响应式调整
        window.addEventListener('resize', function () {
            chart.resize();
        });
        return chart;
    }
    viewer.initChart = initChart;
})(viewer || (viewer = {}));
var viewer;
(function (viewer) {
    // Color palette for taxonomy categories
    var COLOR_PALETTE = [
        '#2563eb', '#dc2626', '#16a34a', '#ea580c', '#7c3aed',
        '#0891b2', '#c026d3', '#65a30d', '#0d9488', '#db2777',
        '#f59e0b', '#4f46e5', '#059669', '#e11d48', '#7c2d12',
        '#1d4ed8', '#b91c1c', '#15803d', '#c2410c', '#6d28d9',
        '#0e7490', '#a21caf', '#4d7c0f', '#0f766e', '#be185d',
        '#d97706', '#4338ca', '#047857', '#be123c', '#713f12',
        '#1e40af', '#991b1b', '#166534', '#9a3412', '#5b21b6',
        '#155e75', '#86198f', '#3f6212', '#115e59', '#9d174d'
    ];
    // EC number class labels
    var EC_LABELS = [
        'EC1 Oxidoreductases',
        'EC2 Transferases',
        'EC3 Hydrolases',
        'EC4 Lyases',
        'EC5 Isomerases',
        'EC6 Ligases',
        'EC7 Translocases'
    ];
    /**
      * Genome Embedding Visualization Module
      * Provides 3D scatter plot and radar chart visualization for microbial genome embedding data
      */
    var GenomeEmbeddingViz = /** @class */ (function () {
        function GenomeEmbeddingViz() {
            // State
            this.scatterChart = null;
            this.radarChart = null;
            this.currentData = [];
            this.currentTaxonomyLevel = 'family';
            this.colorMap = {};
            this.selectedGenome = null;
        }
        /**
         * Initialize charts
         */
        GenomeEmbeddingViz.prototype.initCharts = function () {
            var _this = this;
            // Initialize scatter chart
            var scatterDom = document.getElementById('scatter-chart');
            this.scatterChart = echarts.init(scatterDom, null, { renderer: 'canvas' });
            // Initialize radar chart
            var radarDom = document.getElementById('radar-chart');
            this.radarChart = echarts.init(radarDom, null, { renderer: 'canvas' });
            // Handle resize
            window.addEventListener('resize', function () {
                if (_this.scatterChart)
                    _this.scatterChart.resize();
                if (_this.radarChart)
                    _this.radarChart.resize();
            });
            // Initialize empty radar chart
            this.updateRadarChart(null);
            // Bind taxonomy select change event
            document.getElementById('taxonomy-select').addEventListener('change', function (e) {
                _this.setTaxonomyLevel(e.target.value);
            });
        };
        /**
         * Generate color map for unique values
         */
        GenomeEmbeddingViz.prototype.generateColorMap = function (uniqueValues) {
            var map = {};
            uniqueValues.forEach(function (value, index) {
                map[value] = COLOR_PALETTE[index % COLOR_PALETTE.length];
            });
            return map;
        };
        /**
         * Get unique values for a taxonomy level
         */
        GenomeEmbeddingViz.prototype.getUniqueValues = function (data, level) {
            var values = new Set();
            data.forEach(function (item) {
                if (item[level]) {
                    values.add(item[level]);
                }
            });
            return Array.from(values).sort();
        };
        /**
         * Update legend
         */
        GenomeEmbeddingViz.prototype.updateLegend = function () {
            var _this = this;
            var container = document.getElementById('legend-container');
            var uniqueValues = Object.keys(this.colorMap).sort();
            container.innerHTML = uniqueValues.map(function (value) { return "\n            <div class=\"legend-item\" data-value=\"".concat(value, "\">\n                <span class=\"legend-color\" style=\"background-color: ").concat(_this.colorMap[value], "\"></span>\n                <span class=\"legend-label\" title=\"").concat(value, "\">").concat(value || 'Unknown', "</span>\n            </div>\n        "); }).join('');
        };
        /**
         * Update stats bar
         */
        GenomeEmbeddingViz.prototype.updateStats = function () {
            document.getElementById('stat-total').textContent = this.currentData.length.toString();
            document.getElementById('stat-colorby').textContent =
                this.currentTaxonomyLevel.charAt(0).toUpperCase() + this.currentTaxonomyLevel.slice(1);
            document.getElementById('stat-categories').textContent = Object.keys(this.colorMap).length.toString();
        };
        /**
         * Update 3D scatter chart
         */
        GenomeEmbeddingViz.prototype.updateScatterChart = function () {
            var _this = this;
            var scatterChart = this.scatterChart;
            var currentData = this.currentData;
            if (!scatterChart || !currentData.length)
                return;
            var uniqueValues = this.getUniqueValues(currentData, this.currentTaxonomyLevel);
            this.colorMap = this.generateColorMap(uniqueValues);
            // Group data by taxonomy value
            var seriesMap = {};
            currentData.forEach(function (item) {
                var taxValue = item[_this.currentTaxonomyLevel] || 'Unknown';
                if (!seriesMap[taxValue]) {
                    seriesMap[taxValue] = [];
                }
                seriesMap[taxValue].push([
                    item.x, // 0
                    item.y, // 1
                    item.z, // 2
                    item.scientific_name,
                    item.ncbi_taxid,
                    item.assembly_id,
                    "k__".concat(item.kingdom, ";p__").concat(item.phylum, ";c__").concat(item.class, ";o__").concat(item.order, ";f__").concat(item.family, ";g__").concat(item.genus, ";s__").concat(item.species)
                ]);
            });
            // Create series for each taxonomy group
            var series = Object.entries(seriesMap).map(function (_a) {
                var taxValue = _a[0], data = _a[1];
                return ({
                    name: taxValue,
                    type: 'scatter3D',
                    data: data.map(function (d) { return ({
                        value: [d[0], d[1], d[2]],
                        itemStyle: {
                            color: _this.colorMap[taxValue]
                        },
                        genomeData: {
                            scientific_name: d[3],
                            ncbi_taxid: d[4],
                            assembly_id: d[5],
                            taxonomy: d[6]
                        }
                    }); }),
                    symbolSize: 3,
                    emphasis: {
                        itemStyle: {
                            borderWidth: 0.5,
                            borderColor: '#1a1d26'
                        }
                    }
                });
            });
            var option = {
                tooltip: {
                    formatter: function (params) {
                        if (params.data && params.data.genomeData) {
                            var g = params.data.genomeData;
                            return "<strong>".concat(g.scientific_name, "</strong><br/>\n                                <span style=\"color:#8b92a5\">NCBI TaxID: ").concat(g.ncbi_taxid, "</span> <br/>\n                                <span style=\"color:#8b92a5\">Taxonomy: <i>").concat(g.taxonomy, "</i></span>\n                                ");
                        }
                        return '';
                    },
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderColor: '#d8dce6',
                    borderWidth: 1,
                    padding: [8, 12],
                    textStyle: {
                        color: '#1a1d26',
                        fontSize: 12,
                        fontFamily: 'Space Grotesk'
                    }
                },
                xAxis3D: {
                    type: 'value',
                    name: 'UMAP-1',
                    nameTextStyle: {
                        color: '#5a6275',
                        fontSize: 11
                    },
                    axisLine: {
                        lineStyle: { color: '#d8dce6' }
                    },
                    axisLabel: {
                        color: '#8b92a5',
                        fontSize: 10
                    },
                    splitLine: {
                        lineStyle: { color: '#eef1f6' }
                    }
                },
                yAxis3D: {
                    type: 'value',
                    name: 'UMAP-2',
                    nameTextStyle: {
                        color: '#5a6275',
                        fontSize: 11
                    },
                    axisLine: {
                        lineStyle: { color: '#d8dce6' }
                    },
                    axisLabel: {
                        color: '#8b92a5',
                        fontSize: 10
                    },
                    splitLine: {
                        lineStyle: { color: '#eef1f6' }
                    }
                },
                zAxis3D: {
                    type: 'value',
                    name: 'UMAP-3',
                    nameTextStyle: {
                        color: '#5a6275',
                        fontSize: 11
                    },
                    axisLine: {
                        lineStyle: { color: '#d8dce6' }
                    },
                    axisLabel: {
                        color: '#8b92a5',
                        fontSize: 10
                    },
                    splitLine: {
                        lineStyle: { color: '#eef1f6' }
                    }
                },
                grid3D: {
                    // boxWidth: 120,
                    // boxHeight: 80,
                    // boxDepth: 80,
                    viewControl: {
                        autoRotate: false,
                        distance: 200,
                        alpha: 20,
                        beta: 40
                    },
                    light: {
                        main: {
                            intensity: 1.2,
                            shadow: false
                        },
                        ambient: {
                            intensity: 0.3
                        }
                    },
                    postEffect: {
                        enable: false,
                        bloom: {
                            enable: true,
                            intensity: 0.8
                        }
                    }
                },
                series: series
            };
            scatterChart.setOption(option, true);
            // Add click handler
            scatterChart.off('click');
            scatterChart.on('click', function (params) {
                if (params.data && params.data.genomeData) {
                    var assemblyId_1 = params.data.genomeData.assembly_id;
                    var genome = currentData.find(function (g) { return g.assembly_id === assemblyId_1; });
                    if (genome) {
                        _this.selectGenome(genome);
                    }
                }
            });
            this.updateLegend();
            this.updateStats();
        };
        /**
         * Select a genome and display its details
         */
        GenomeEmbeddingViz.prototype.selectGenome = function (genome) {
            this.selectedGenome = genome;
            // Update genome detail panel
            var detailContainer = document.getElementById('genome-detail');
            var taxonomyHtml = "\n            <li><span class=\"taxonomy-rank\">Kingdom</span><span class=\"taxonomy-value\">".concat(genome.kingdom || '-', "</span></li>\n            <li><span class=\"taxonomy-rank\">Phylum</span><span class=\"taxonomy-value\">").concat(genome.phylum || '-', "</span></li>\n            <li><span class=\"taxonomy-rank\">Class</span><span class=\"taxonomy-value\">").concat(genome.class || '-', "</span></li>\n            <li><span class=\"taxonomy-rank\">Order</span><span class=\"taxonomy-value\">").concat(genome.order || '-', "</span></li>\n            <li><span class=\"taxonomy-rank\">Family</span><span class=\"taxonomy-value\">").concat(genome.family || '-', "</span></li>\n            <li><span class=\"taxonomy-rank\">Genus</span><span class=\"taxonomy-value\">").concat(genome.genus || '-', "</span></li>\n            <li><span class=\"taxonomy-rank\">Species</span><span class=\"taxonomy-value\">").concat(genome.species || '-', "</span></li>\n        ");
            detailContainer.innerHTML = "\n            <div class=\"genome-card fade-in\">\n                <div class=\"genome-name\"><a href=\"/taxonomy_search/?q=".concat(encodeURIComponent(genome.scientific_name), "\">").concat(genome.scientific_name, "</a></div>\n                <div class=\"genome-taxid\">NCBI TaxID: <a href=\"/taxonomy/?id=").concat(genome.ncbi_taxid, "\">").concat(genome.ncbi_taxid, "</a></div>\n            </div>\n            <div class=\"section-title\" style=\"margin-top: 0.5rem;\">Taxonomy</div>\n            <ul class=\"taxonomy-list\">\n                ").concat(taxonomyHtml, "\n            </ul>\n        ");
            // Update radar chart
            this.updateRadarChart(genome);
            // Highlight selected point in scatter
            // this.highlightPoint(genome);
        };
        /**
         * Highlight selected point in scatter chart
         */
        GenomeEmbeddingViz.prototype.highlightPoint = function (genome) {
            var _this = this;
            // Re-render with emphasis on selected point
            var uniqueValues = this.getUniqueValues(this.currentData, this.currentTaxonomyLevel);
            var seriesMap = {};
            this.currentData.forEach(function (item) {
                var taxValue = item[_this.currentTaxonomyLevel] || 'Unknown';
                if (!seriesMap[taxValue]) {
                    seriesMap[taxValue] = [];
                }
                seriesMap[taxValue].push(item);
            });
            var series = Object.entries(seriesMap).map(function (_a) {
                var taxValue = _a[0], data = _a[1];
                return ({
                    name: taxValue,
                    type: 'scatter3D',
                    data: data.map(function (d) { return ({
                        value: [d.x, d.y, d.z],
                        itemStyle: {
                            color: _this.colorMap[taxValue],
                            borderWidth: d.assembly_id === genome.assembly_id ? 3 : 0,
                            borderColor: '#1a1d26'
                        },
                        symbolSize: d.assembly_id === genome.assembly_id ? 20 : 12,
                        genomeData: {
                            scientific_name: d.scientific_name,
                            ncbi_taxid: d.ncbi_taxid,
                            assembly_id: d.assembly_id
                        }
                    }); }),
                    emphasis: {
                        itemStyle: {
                            borderWidth: 2,
                            borderColor: '#1a1d26'
                        }
                    }
                });
            });
            this.scatterChart.setOption({ series: series });
        };
        /**
         * Update radar chart for EC number embedding
         */
        GenomeEmbeddingViz.prototype.updateRadarChart = function (genome) {
            if (!this.radarChart)
                return;
            var ecData = genome ? genome.ec_number : [0, 0, 0, 0, 0, 0, 0];
            // Calculate max value for radar scale
            var maxVal = Math.max.apply(Math, __spreadArray(__spreadArray([], ecData, false), [1], false));
            var option = {
                radar: {
                    indicator: EC_LABELS.map(function (label, index) { return ({
                        name: label,
                        max: maxVal * 1.2
                    }); }),
                    radius: '60%',
                    center: ['50%', '50%'],
                    axisName: {
                        color: '#5a6275',
                        fontSize: 9,
                        fontWeight: 500
                    },
                    axisLine: {
                        lineStyle: { color: '#d8dce6' }
                    },
                    splitLine: {
                        lineStyle: { color: '#eef1f6' }
                    },
                    splitArea: {
                        areaStyle: { color: ['transparent', 'rgba(13, 110, 253, 0.03)'] }
                    }
                },
                series: [{
                        type: 'radar',
                        data: [{
                                value: ecData,
                                name: genome ? genome.scientific_name : 'No selection',
                                symbol: 'circle',
                                symbolSize: 5,
                                lineStyle: {
                                    width: 2,
                                    color: '#2563eb'
                                },
                                areaStyle: {
                                    color: 'rgba(37, 99, 235, 0.2)'
                                },
                                itemStyle: {
                                    color: '#2563eb',
                                    borderWidth: 2,
                                    borderColor: '#fff'
                                }
                            }]
                    }]
            };
            this.radarChart.setOption(option, true);
        };
        /**
         * Show/hide loading overlay
         */
        GenomeEmbeddingViz.prototype.setLoading = function (isLoading) {
            var overlay = document.getElementById('loading-overlay');
            if (isLoading) {
                overlay.classList.add('active');
            }
            else {
                overlay.classList.remove('active');
            }
        };
        // ========================================
        // PUBLIC API
        // ========================================
        /**
         * Load embedding data and render visualization
         * @param {Array} data - Array of metabolic_embedding objects
         */
        GenomeEmbeddingViz.prototype.loadData = function (data) {
            var _this = this;
            if (!Array.isArray(data)) {
                console.error('Invalid data: expected an array of metabolic_embedding objects');
                return;
            }
            this.setLoading(true);
            this.currentData = data;
            this.selectedGenome = null;
            // Reset genome detail panel
            document.getElementById('genome-detail').innerHTML = "\n            <div class=\"no-selection\">\n                <div class=\"no-selection-icon\">\n                    <svg width=\"48\" height=\"48\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\">\n                        <circle cx=\"12\" cy=\"12\" r=\"10\"/>\n                        <path d=\"M12 8v4M12 16h.01\"/>\n                    </svg>\n                </div>\n                <p class=\"no-selection-text\">Click a point in the scatter plot to view genome details</p>\n            </div>\n        ";
            // Reset radar chart
            this.updateRadarChart(null);
            // Update scatter chart
            setTimeout(function () {
                _this.updateScatterChart();
                _this.setLoading(false);
            }, 100);
        };
        /**
         * Set taxonomy level for coloring
         * @param {string} level - Taxonomy level (kingdom, phylum, class, order, family, genus, species)
         */
        GenomeEmbeddingViz.prototype.setTaxonomyLevel = function (level) {
            var validLevels = ['kingdom', 'phylum', 'class', 'order', 'family', 'genus', 'species'];
            if (!validLevels.includes(level)) {
                console.error('Invalid taxonomy level:', level);
                return;
            }
            this.currentTaxonomyLevel = level;
            document.getElementById('taxonomy-select').value = level;
            this.updateScatterChart();
        };
        /**
         * Get currently selected genome
         * @returns {Object|null} Selected genome or null
         */
        GenomeEmbeddingViz.prototype.getSelectedGenome = function () {
            return this.selectedGenome;
        };
        /**
         * Get chart instances for external manipulation
         * @returns {Object} Object containing scatterChart and radarChart instances
         */
        GenomeEmbeddingViz.prototype.getChartInstances = function () {
            return {
                scatterChart: this.scatterChart,
                radarChart: this.radarChart
            };
        };
        /**
         * Resize charts
         */
        GenomeEmbeddingViz.prototype.resizeCharts = function () {
            if (this.scatterChart)
                this.scatterChart.resize();
            if (this.radarChart)
                this.radarChart.resize();
        };
        return GenomeEmbeddingViz;
    }());
    viewer.GenomeEmbeddingViz = GenomeEmbeddingViz;
})(viewer || (viewer = {}));
var viewer;
(function (viewer) {
    function toPieData(rawData) {
        return Object.entries(rawData).map(function (_a) {
            var name = _a[0], value = _a[1];
            return ({
                name: name,
                value: value
            });
        });
    }
    viewer.toPieData = toPieData;
    var PieViewer = /** @class */ (function () {
        function PieViewer() {
        }
        PieViewer.viz_pie = function (rawData, chart_id, title) {
            // 转换为 ECharts 需要的格式
            var pieData = viewer.toPieData(rawData);
            // 计算总和
            var total = pieData.reduce(function (sum, item) { return sum + item.value; }, 0);
            // ECharts 配置项
            var option = {
                // 标题配置
                title: {
                    text: title,
                    subtext: "\u603B\u8BA1: ".concat(total.toFixed(2)),
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
                    formatter: function (params) {
                        var percent = ((params.value / total) * 100).toFixed(2);
                        return "\n          <div style=\"padding: 8px;\">\n            <strong style=\"font-size: 14px;\">".concat(params.name, "</strong><br/>\n            <span style=\"color: #7F8C8D;\">\u6570\u503C: </span>\n            <strong>").concat(params.value.toFixed(4), "</strong><br/>\n            <span style=\"color: #7F8C8D;\">\u5360\u6BD4: </span>\n            <strong>").concat(percent, "%</strong>\n          </div>\n        ");
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
                    formatter: function (name) {
                        var item = pieData.find(function (d) { return d.name === name; });
                        if (item) {
                            var percent = ((item.value / total) * 100).toFixed(2);
                            return "".concat(name, "  (").concat(percent, "%)");
                        }
                        return name;
                    }
                },
                // 系列配置
                series: [
                    {
                        name: '比例分布',
                        type: 'pie',
                        radius: ['35%', '70%'], // 环形图，更美观
                        center: ['40%', '55%'],
                        avoidLabelOverlap: true,
                        // 标签配置
                        label: {
                            show: true,
                            position: 'outside',
                            formatter: function (params) {
                                var percent = ((params.value / total) * 100).toFixed(2);
                                // 占比小于1%的不显示标签
                                if (parseFloat(percent) < 1) {
                                    return '';
                                }
                                return "".concat(params.name, "\n").concat(percent, "%");
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
                        animationDelay: function (idx) { return idx * 100; }
                    }
                ]
            };
            var chart = viewer.initChart(chart_id, option);
            // 可选：添加点击事件
            chart.on('click', function (params) {
                console.log('Clicked:', params.name, params.value);
            });
        };
        return PieViewer;
    }());
    viewer.PieViewer = PieViewer;
})(viewer || (viewer = {}));
//# sourceMappingURL=registry.js.map