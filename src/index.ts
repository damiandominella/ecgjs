class EcgJsHandler {
	/**
	 * Injected plotly lib
	 */
	private $plotly: any;

	/**
	 * ID of the element where to init the graph
	 */
	private elementId: string;
	private element: any;

	/**
	 * Graph data
	 */
	private data: any;

	/**
	 * Plotly js config
	 */
	private config: any;

	/**
	 * Plotly js layout
	 */
	private layout: any;

	/**
	 * xaxis range
	 */
	private X_MIN: number = 0;
	private X_MAX: number = 4000;
	private xRange: number[];

	/**
	 * yaxis range
	 */
	private Y_MIN: number = 1.12;
	private Y_MAX: number = 1.17;
	private yRange: number[];

	/**
	 * Player variables
	 */
	private interval: any;
	private isPlaying: boolean;
	private originalSpeed: number;
	private speed: number;
	private index: number;

	/**
	 * Notes
	 */
	private annotations: any[];

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
	constructor(
		elementId: string,
		plotly: any,
		data: { x: any[]; y: any[] },
		config: any = {},
		layout: any = {}
	) {
		console.log("[ecgjs] INIT");

		this.$plotly = plotly;
		this.elementId = elementId;
		this.element = document.getElementById(elementId);

		if (!data) {
			this.data = {
				x: [],
				y: []
			};
		} else {
			if (!data.x) {
				this.data.x = [];
			}
			if (!data.y) {
				this.data.y = [];
			}
		}

		this.setDefaults();

		this.config = { ...this.config, ...config };
		this.layout = { ...this.layout, ...layout };

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
	public plot(): void {
		console.log("[ecgjs] PLOT");
		this.$plotly.newPlot(
			this.elementId,
			[
				{
					x: this.data.x,
					y: this.data.y,
					name: "Ecg",
					mode: "scatter"
				}
			],
			this.layout,
			this.config
		);
	}

	/**
	 * Reset graph to defaults
	 */
	public reset(): void {
		console.log("[ecgjs] RESET");

		this.pause();
		this.setDefaults();

		this.$plotly.purge(this.elementId);

		this.index = 0;

		// Reinit void trace
		this.plot();
	}

	/**
	 * Clears all the notes.
	 */
	public clearNotes(): void {
		console.log("[ecgjs] CLEAR_NOTES");
		this.annotations = [];
		this.$plotly.relayout(this.elementId, { annotations: [] });
	}

	/**
	 * Adds a note in the specified point with text.
	 *
	 * @param text
	 * @param plotlyData
	 */
	public addNote(text: string, plotlyData: any): void {
		let note: any = {
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
	}

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
	public setData(data: { x: any[]; y: any[] }): void {
		console.log("[ecgjs] SET_DATA");

		this.data = data;
		this.$plotly.update(
			this.elementId,
			{
				x: [this.data.x],
				y: [this.data.y]
			},
			{},
			[0]
		);
	}

	/**
	 * Adds data, concat arrays.
	 *
	 * @param data
	 */
	public addData(data: { x: any[]; y: any[] }): void {
		console.log("[ecgjs] ADD_DATA");

		this.data.x = this.data.x.concat(data.x);
		this.data.y = this.data.y.concat(data.y);

		this.$plotly.extendTraces(
			this.elementId,
			{
				x: [data.x],
				y: [data.y]
			},
			[0]
		);
	}

	/**
	 * Plays the ECG Graph.
	 */
	public play(): void {
		if (!this.isPlaying) {
			console.log("[ecgjs] PLAY");

			this.isPlaying = true;
			this.interval = setInterval(() => {
				this.xRange = this.xRange.map((val: number) => val + 10 * this.speed);

				this.updateRange();
			}, 25);
		}
	}

	/**
	 * Pauses the ECG Graph.
	 */
	public pause(): void {
		if (this.isPlaying) {
			console.log("[ecgjs] PAUSE");
			if (!!this.interval) {
				this.isPlaying = false;
				clearInterval(this.interval);
			}
		}
	}

	/**
	 * Changes the speed.
	 *
	 * @param multiplier
	 */
	public changeSpeed(multiplier: number): void {
		console.log("[ecgjs] CHANGE_SPEED");
		this.speed = this.originalSpeed * multiplier;
	}

	/**
	 * Update axis ranges.
	 *
	 * @param xRange
	 * @param yRange
	 */
	public updateRange(xRange?: number[], yRange?: number[]): void {
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
	}

	// -----------------------------------------------------------------
	//                     p r i v a t e
	// -----------------------------------------------------------------
	/**
	 * Sets default layout and config props
	 */
	private setDefaults(): void {
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
	}

	/**
	 * Sets default axis ranges
	 */
	private setDefaultRanges(): void {
		this.xRange = [this.X_MIN, this.X_MAX];
		this.yRange = [this.Y_MIN, this.Y_MAX];
	}
}

/**
 * Init EcgJs
 * @param elementId
 * @param params
 */
export function init(elementId: string, params: InitParams): EcgJsHandler {
	let handler: EcgJsHandler = new EcgJsHandler(
		elementId,
		params.plotly,
		params.data,
		params.config,
		params.layout
	);
	handler.plot();

	return handler;
}

interface InitParams {
	plotly: any;
	data: any;
	config: any;
	layout: any;
}
