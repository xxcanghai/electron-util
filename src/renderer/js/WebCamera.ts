import * as _ from "lodash";

export default class WebCamera {
	constructor(opt: Partial<cameraOption> = {}) {
		this.options = _.merge({}, this.defaultOption, opt);
		this.initVideoStream();
	}

	private noop = function () { };
	/** 默认配置对象 */
	private defaultOption: cameraOption = {
		fps: 30,
		width: 640,
		height: 480,
		mirror: false,
		targetCanvas: <any>null,

		onSuccess: this.noop,
		onError: this.noop,
		onNotSupported: this.noop,
		onFrame: this.noop,
	}
	private options: cameraOption;
	private video: HTMLVideoElement = <any>null;
	private canvas: HTMLCanvasElement = <any>null;
	private context: CanvasRenderingContext2D = <any>null;
	private renderTimer;


	private initVideoStream() {
		this.video = document.createElement("video");
		this.video.setAttribute('width', this.options.width.toString());
		this.video.setAttribute('height', this.options.height.toString());

		if (navigator.getUserMedia) {
			navigator.getUserMedia({
				video: true
			}, (stream) => {
				this.options.onSuccess();

				// if (video.mozSrcObject !== undefined) { // hack for Firefox < 19
				// 	video.mozSrcObject = stream;
				// } else {
				this.video.src = (window.URL && window.URL.createObjectURL(stream));// || stream;
				// }

				this.initCanvas();
			}, this.options.onError);
		} else {
			this.options.onNotSupported();
		}
	}

	private initCanvas() {
		this.canvas = this.options.targetCanvas || document.createElement("canvas");
		this.canvas.setAttribute('width', this.options.width.toString());
		this.canvas.setAttribute('height', this.options.height.toString());

		this.context = <any>this.canvas.getContext('2d');

		// mirror video
		if (this.options.mirror) {
			this.context.translate(this.canvas.width, 0);
			this.context.scale(-1, 1);
		}

		this.start();
	}

	public start() {
		this.video.play();

		this.renderTimer = setInterval(() => {
			try {
				this.context.drawImage(this.video, 0, 0, this.video.width, this.video.height);
				this.options.onFrame(this.canvas);
			} catch (e) {
				// TODO
			}
		}, Math.round(1000 / this.options.fps));
	}

	public stop() {
		this.pause();

		// if (video.mozSrcObject !== undefined) {
		// 	video.mozSrcObject = null;
		// } else {
		this.video.src = "";
		// }
	}

	public pause() {
		if (this.renderTimer) clearInterval(this.renderTimer);
		this.video.pause();
	}

	public static async getMediaDevices(): Promise<MediaDeviceInfo[]> {
		return await navigator.mediaDevices.enumerateDevices();
	}

	public static async getSupportedConstraints(): Promise<MediaTrackSupportedConstraints> {
		return await navigator.mediaDevices.getSupportedConstraints();
	}

}

interface cameraOption {
	/** 帧率 */
	fps: number;
	width: number;
	height: number;
	/** 是否镜像 */
	mirror: boolean;
	/** 目标canvas DOM对象 */
	targetCanvas: HTMLCanvasElement;

	onSuccess: () => void;
	onError: NavigatorUserMediaErrorCallback;
	onNotSupported: () => void;
	onFrame: (canvas: HTMLCanvasElement) => void;
}