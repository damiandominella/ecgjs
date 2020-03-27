class EcgJsHandler {
	/**
	 * Injected plotly lib
	 */
	private $plotly: any;

	/**
	 * ID of the element where to init the graph
	 */
	private elementId: string;

	/**
	 * Graph data
	 */
	private data: any;
	private fullGraph: any;

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
	private X_MAX: number = 3000;
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
	private isFullShowing: boolean;

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

		this.data = data;
		this.fullGraph = {
			x: this.data.x,
			y: this.data.y,
			name: "Full ECG",
			mode: "lines"
		};

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
					x: [],
					y: [],
					name: "EcgJs",
					mode: "lines"
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
		this.setDefaults();
		this.hideFull();
		this.pause();

		let el: any = document.getElementById(this.elementId);
		while (el.data.length > 0) {
			this.$plotly.deleteTraces(this.elementId, [0]);
		}

		this.index = 0;

		this.clearNotes();

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

	/**
	 * Plays the ECG Graph.
	 */
	public play(): void {
		if (!this.isPlaying) {
			console.log("[ecgjs] PLAY");
			this.hideFull();

			this.isPlaying = true;
			this.interval = setInterval(() => {
				var xValues = [this.data.x[this.index]];
				var yValues = [this.data.y[this.index]];

				for (var i = this.originalSpeed; i < this.speed; i++) {
					xValues.push(this.data.x[this.index + i]);
					yValues.push(this.data.y[this.index + i]);
				}

				this.$plotly.extendTraces(
					this.elementId,
					{
						x: [xValues],
						y: [yValues]
					},
					[0]
				);

				if (this.index + this.speed === this.data.x.length - 1) {
					clearInterval(this.interval);
				} else {
					this.index += this.speed;
				}

				var mustUpdateRange = false;

				if (this.data.x[this.index] > this.X_MAX / 2) {
					mustUpdateRange = true;
					var x_start = this.data.x[this.index] - this.X_MAX / 2;
					var x_end = x_start + this.X_MAX;

					this.xRange = [x_start, x_end];
				}

				if (!!mustUpdateRange) {
					this.updateRange();
				}
			}, 10);
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

	/**
	 * Shows full ECG as a second trace.
	 */
	public showFull(): void {
		if (!this.isFullShowing) {
			console.log("[ecgjs] SHOW_FULL");
			this.pause();

			this.isFullShowing = true;
			this.$plotly.addTraces(this.elementId, this.fullGraph);
		}
	}

	/**
	 * Hides full ECG as a second trace.
	 */
	public hideFull(): void {
		if (!!this.isFullShowing) {
			console.log("[ecgjs] HIDE_FULL");
			this.isFullShowing = false;
			this.$plotly.deleteTraces(this.elementId, [1]);
		}
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
