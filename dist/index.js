"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
var EcgJsHandler = /** @class */ (function () {
    // -----------------------------------------------------------------
    //                     c o n s t r u c t o r
    // -----------------------------------------------------------------
    /**
     *
     * @param elementId
     * @param plotly
     * @param data data traces
     * @param config plotly js config
     * @param layout plotly js layout
     */
    function EcgJsHandler(elementId, plotly, data, config, layout) {
        if (config === void 0) { config = {}; }
        if (layout === void 0) { layout = {}; }
        /**
         * xaxis range
         */
        this.X_MIN = 0;
        this.X_MAX = 4000;
        /**
         * yaxis range
         */
        this.Y_MIN = 1.12;
        this.Y_MAX = 1.17;
        console.log("[ecgjs] INIT");
        this.$plotly = plotly;
        this.elementId = elementId;
        this.element = document.getElementById(elementId);
        if (!data) {
            this.data = {
                x: [],
                y: []
            };
        }
        else {
            if (!data.x) {
                this.data.x = [];
            }
            if (!data.y) {
                this.data.y = [];
            }
        }
        this.setDefaults();
        this.config = __assign(__assign({}, this.config), config);
        this.layout = __assign(__assign({}, this.layout), layout);
        this.index = 0;
        this.originalSpeed = 1;
        this.speed = this.originalSpeed;
        this.isPlaying = false;
        this.annotations = [];
    }
    // -----------------------------------------------------------------
    //                     p u b l i c
    // -----------------------------------------------------------------
    /**
     * Inits the empty plot.
     */
    EcgJsHandler.prototype.plot = function () {
        console.log("[ecgjs] PLOT");
        this.$plotly.newPlot(this.elementId, [
            {
                x: this.data.x,
                y: this.data.y,
                name: "Ecg",
                mode: "scatter"
            }
        ], this.layout, this.config);
    };
    /**
     * Reset graph to defaults
     */
    EcgJsHandler.prototype.reset = function () {
        console.log("[ecgjs] RESET");
        this.pause();
        this.setDefaults();
        this.$plotly.purge(this.elementId);
        this.index = 0;
        // Reinit void trace
        this.plot();
    };
    /**
     * Clears all the notes.
     */
    EcgJsHandler.prototype.clearNotes = function () {
        console.log("[ecgjs] CLEAR_NOTES");
        this.annotations = [];
        this.$plotly.relayout(this.elementId, { annotations: [] });
    };
    /**
     * Adds a note in the specified point with text.
     *
     * @param text
     * @param plotlyData
     */
    EcgJsHandler.prototype.addNote = function (text, plotlyData) {
        var note = {
            text: text,
            x: plotlyData.points[0].x,
            y: parseFloat(plotlyData.points[0].y.toPrecision(4)),
            font: {
                size: 14,
                color: "#333"
            },
            ax: 20,
            ay: -30,
            borderpad: 2,
            bgcolor: "#FFEC8B",
            opacity: 0.9
        };
        this.annotations = this.layout.annotations || [];
        this.annotations.push(note);
        this.$plotly.relayout(this.elementId, { annotations: this.annotations });
    };
    // public play(): void {
    // 	if (!this.isPlaying) {
    // 		console.log("[ecgjs] PLAY");
    // 		this.hideFull();
    // 		this.isPlaying = true;
    // 		this.interval = setInterval(() => {
    // 			var xValues = [this.data.x[this.index]];
    // 			var yValues = [this.data.y[this.index]];
    // 			for (var i = this.originalSpeed; i < this.speed; i++) {
    // 				xValues.push(this.data.x[this.index + i]);
    // 				yValues.push(this.data.y[this.index + i]);
    // 			}
    // 			let mustModule: boolean = false;
    // 			for (let x of xValues) {
    // 				if (x >= this.X_MAX - 4) {
    // 					mustModule = true;
    // 					break;
    // 				}
    // 			}
    // 			let _index: number = -1;
    // 			if (mustModule) {
    // 				xValues = xValues.map((val: number) => val % this.X_MAX);
    // 				_index = xValues.indexOf(0);
    // 			}
    // 			console.log(
    // 				"current traces (" + this.element.data.length + "):",
    // 				this.element.data
    // 			);
    // 			if (_index > -1) {
    // 				if (_index > 0) {
    // 					// adding last chunks to current trace
    // 					console.log("adding last chunks, extend last trace");
    // 					this.$plotly.extendTraces(
    // 						this.elementId,
    // 						{
    // 							x: [xValues.slice(0, _index - 1)],
    // 							y: [yValues.slice(0, _index - 1)]
    // 						},
    // 						[-1] // -1 = last
    // 					);
    // 				}
    // 				if (this.element.data.length > 1) {
    // 					// delete old trace
    // 					console.log("delete trace: 0");
    // 					this.$plotly.deleteTraces(this.elementId, 0);
    // 				}
    // 				// add new trace
    // 				console.log(
    // 					"add new trace with values:",
    // 					xValues.slice(_index),
    // 					yValues.slice(_index)
    // 				);
    // 				this.$plotly.addTraces(this.elementId, [
    // 					{
    // 						x: xValues.slice(_index),
    // 						y: yValues.slice(_index),
    // 						mode: "lines"
    // 					}
    // 				]);
    // 			} else {
    // 				console.log("extend last trace");
    // 				this.$plotly.extendTraces(
    // 					this.elementId,
    // 					{
    // 						x: [xValues],
    // 						y: [yValues]
    // 					},
    // 					[-1] // -1 = last
    // 				);
    // 			}
    // 			if (this.element.data.length > 1) {
    // 				console.log("must update old trace");
    // 				let new_trace = {
    // 					x: [this.data.x.slice(this.index % 1000, this.index + 100)],
    // 					y: [this.data.y.slice(this.index % 1000, this.index + 100)]
    // 				};
    // 				// update old trace
    // 				this.$plotly.update(this.elementId, new_trace, {}, [0]);
    // 			}
    // 			if (this.index + this.speed === this.data.x.length - 1) {
    // 				clearInterval(this.interval);
    // 			} else {
    // 				this.index += this.speed;
    // 			}
    // 			var mustUpdateRange = false;
    // 			// if (this.data.x[this.index] > this.X_MAX / 2) {
    // 			// 	mustUpdateRange = true;
    // 			// 	var x_start = this.data.x[this.index] - this.X_MAX / 2;
    // 			// 	var x_end = x_start + this.X_MAX;
    // 			// 	this.xRange = [x_start, x_end];
    // 			// }
    // 			// let median: number = this.yRange[1] - this.yRange[0];
    // 			// if (this.data.y[this.index] < median) {
    // 			// 	mustUpdateRange = true;
    // 			// 	var y_start = this.data.y[this.index] - this.Y_MIN / 2;
    // 			// 	var y_end = y_start + this.Y_MIN;
    // 			// 	this.yRange = [y_start, y_end];
    // 			// }
    // 			// if (!!mustUpdateRange) {
    // 			// 	this.updateRange();
    // 			// }
    // 		}, 25);
    // 	}
    // }
    /**
     * Replaces current data.
     *
     * @param data
     */
    EcgJsHandler.prototype.setData = function (data) {
        console.log("[ecgjs] SET_DATA");
        this.data = data;
        this.$plotly.update(this.elementId, {
            x: [this.data.x],
            y: [this.data.y]
        }, {}, [0]);
    };
    /**
     * Adds data, concat arrays.
     *
     * @param data
     */
    EcgJsHandler.prototype.addData = function (data) {
        console.log("[ecgjs] ADD_DATA", data);
        this.data.x = this.data.x.concat(data.x);
        this.data.y = this.data.y.concat(data.y);
        this.$plotly.extendTraces(this.elementId, {
            x: [data.x],
            y: [data.y]
        }, [0]);
        var last = this.data.x[this.data.x.length - 1];
        if (last > this.X_MAX) {
            var x_start = last - this.X_MAX;
            var x_end = x_start + this.X_MAX;
            this.xRange = [x_start, x_end];
            this.updateRange();
        }
    };
    /**
     * Plays the ECG Graph.
     */
    EcgJsHandler.prototype.play = function () {
        var _this = this;
        if (!this.isPlaying) {
            console.log("[ecgjs] PLAY");
            this.isPlaying = true;
            this.interval = setInterval(function () {
                _this.xRange = _this.xRange.map(function (val) { return val + 10 * _this.speed; });
                _this.updateRange();
            }, 25);
        }
    };
    /**
     * Pauses the ECG Graph.
     */
    EcgJsHandler.prototype.pause = function () {
        if (this.isPlaying) {
            console.log("[ecgjs] PAUSE");
            if (!!this.interval) {
                this.isPlaying = false;
                clearInterval(this.interval);
            }
        }
    };
    /**
     * Changes the speed.
     *
     * @param multiplier
     */
    EcgJsHandler.prototype.changeSpeed = function (multiplier) {
        console.log("[ecgjs] CHANGE_SPEED");
        this.speed = this.originalSpeed * multiplier;
    };
    /**
     * Update axis ranges.
     *
     * @param xRange
     * @param yRange
     */
    EcgJsHandler.prototype.updateRange = function (xRange, yRange) {
        console.log("[ecgjs] UPDATE_RANGE");
        if (!!xRange) {
            this.xRange = xRange;
        }
        if (!!yRange) {
            this.yRange = yRange;
        }
        this.$plotly.relayout(this.elementId, {
            "xaxis.range": this.xRange,
            "yaxis.range": this.yRange
        });
    };
    // -----------------------------------------------------------------
    //                     l a y o u t
    // -----------------------------------------------------------------
    /**
     * Hides x axis grid lines.
     */
    EcgJsHandler.prototype.hideXGrid = function () {
        this.relayout({
            "xaxis.showgrid": false
        });
    };
    /**
     * Shows x axis grid lines.
     */
    EcgJsHandler.prototype.showXGrid = function () {
        this.relayout({
            "xaxis.showgrid": true
        });
    };
    /**
     * Hides y axis grid lines.
     */
    EcgJsHandler.prototype.hideYGrid = function () {
        this.relayout({
            "yaxis.showgrid": false
        });
    };
    /**
     * Shows y axis grid lines.
     */
    EcgJsHandler.prototype.showYGrid = function () {
        this.relayout({
            "yaxis.showgrid": true
        });
    };
    /**
     * Hides grid lines.
     */
    EcgJsHandler.prototype.hideGrid = function () {
        this.relayout({
            "xaxis.showgrid": false,
            "yaxis.showgrid": false
        });
    };
    /**
     * Shows grid lines.
     */
    EcgJsHandler.prototype.showGrid = function () {
        this.relayout({
            "xaxis.showgrid": true,
            "yaxis.showgrid": true
        });
    };
    /**
     * Relayouts the graph.
     *
     * @param layout
     */
    EcgJsHandler.prototype.relayout = function (layout) {
        this.$plotly.relayout(this.elementId, layout);
    };
    // -----------------------------------------------------------------
    //                     p r i v a t e
    // -----------------------------------------------------------------
    /**
     * Sets default layout and config props
     */
    EcgJsHandler.prototype.setDefaults = function () {
        this.setDefaultRanges();
        this.layout = {
            title: "EcgJs",
            height: 500,
            colorway: ["#000", "#777"],
            annotations: this.annotations,
            xaxis: {
                title: "Time (ms)",
                range: this.xRange,
                fixedrange: false,
                showline: true,
                showgrid: true,
                gridcolor: "#ff0202",
                tickmode: "linear",
                dtick: 200
            },
            yaxis: {
                title: "Amplitude (mV)",
                range: this.yRange,
                fixedrange: false,
                showline: true,
                showgrid: true,
                gridcolor: "#ff0202",
                tickmode: "linear",
                dtick: 0.005
            }
        };
        this.config = {
            responsive: true,
            scrollZoom: false,
            displayModeBar: true,
            showlegend: false,
            modeBarButtonsToRemove: ["autoScale2d"]
        };
    };
    /**
     * Sets default axis ranges
     */
    EcgJsHandler.prototype.setDefaultRanges = function () {
        this.xRange = [this.X_MIN, this.X_MAX];
        this.yRange = [this.Y_MIN, this.Y_MAX];
    };
    return EcgJsHandler;
}());
/**
 * Init EcgJs
 * @param elementId
 * @param params
 */
function init(elementId, params) {
    var handler = new EcgJsHandler(elementId, params.plotly, params.data, params.config, params.layout);
    handler.plot();
    return handler;
}
exports.init = init;
//# sourceMappingURL=index.js.map