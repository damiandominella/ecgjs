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
        this.X_MAX = 3000;
        /**
         * yaxis range
         */
        this.Y_MIN = 1.12;
        this.Y_MAX = 1.17;
        console.log("[ecgjs] INIT");
        this.$plotly = plotly;
        this.elementId = elementId;
        this.data = data;
        this.fullGraph = {
            x: this.data.x,
            y: this.data.y,
            name: "Full ECG",
            mode: "lines"
        };
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
                x: [],
                y: [],
                name: "EcgJs",
                mode: "lines"
            }
        ], this.layout, this.config);
    };
    /**
     * Reset graph to defaults
     */
    EcgJsHandler.prototype.reset = function () {
        console.log("[ecgjs] RESET");
        this.setDefaults();
        this.hideFull();
        this.pause();
        var el = document.getElementById(this.elementId);
        while (el.data.length > 0) {
            this.$plotly.deleteTraces(this.elementId, [0]);
        }
        this.index = 0;
        this.clearNotes();
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
    /**
     * Plays the ECG Graph.
     */
    EcgJsHandler.prototype.play = function () {
        var _this = this;
        if (!this.isPlaying) {
            console.log("[ecgjs] PLAY");
            this.hideFull();
            this.isPlaying = true;
            this.interval = setInterval(function () {
                var xValues = [_this.data.x[_this.index]];
                var yValues = [_this.data.y[_this.index]];
                for (var i = _this.originalSpeed; i < _this.speed; i++) {
                    xValues.push(_this.data.x[_this.index + i]);
                    yValues.push(_this.data.y[_this.index + i]);
                }
                _this.$plotly.extendTraces(_this.elementId, {
                    x: [xValues],
                    y: [yValues]
                }, [0]);
                if (_this.index + _this.speed === _this.data.x.length - 1) {
                    clearInterval(_this.interval);
                }
                else {
                    _this.index += _this.speed;
                }
                var mustUpdateRange = false;
                if (_this.data.x[_this.index] > _this.X_MAX / 2) {
                    mustUpdateRange = true;
                    var x_start = _this.data.x[_this.index] - _this.X_MAX / 2;
                    var x_end = x_start + _this.X_MAX;
                    _this.xRange = [x_start, x_end];
                }
                if (!!mustUpdateRange) {
                    _this.updateRange();
                }
            }, 10);
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
    /**
     * Shows full ECG as a second trace.
     */
    EcgJsHandler.prototype.showFull = function () {
        if (!this.isFullShowing) {
            console.log("[ecgjs] SHOW_FULL");
            this.pause();
            this.isFullShowing = true;
            this.$plotly.addTraces(this.elementId, this.fullGraph);
        }
    };
    /**
     * Hides full ECG as a second trace.
     */
    EcgJsHandler.prototype.hideFull = function () {
        if (!!this.isFullShowing) {
            console.log("[ecgjs] HIDE_FULL");
            this.isFullShowing = false;
            this.$plotly.deleteTraces(this.elementId, [1]);
        }
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
            colorway: ["#000"],
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