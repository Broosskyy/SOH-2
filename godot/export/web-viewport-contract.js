(function () {
	const BUILD = "G0.5.5-PHONE-COMPOSITION";
	let installed = false;

	function readVisual() {
		const vv = window.visualViewport;
		if (!vv) {
			return null;
		}
		return {
			w: vv.width,
			h: vv.height,
			x: vv.offsetLeft,
			y: vv.offsetTop,
		};
	}

	function readInner() {
		return {
			w: window.innerWidth || 0,
			h: window.innerHeight || 0,
		};
	}

	function readClient() {
		const el = document.documentElement;
		return {
			w: el.clientWidth || 0,
			h: el.clientHeight || 0,
		};
	}

	function readCanvas() {
		const canvas = document.getElementById("canvas");
		if (!canvas) {
			return null;
		}
		const rect = canvas.getBoundingClientRect();
		return {
			x: rect.x,
			y: rect.y,
			w: rect.width,
			h: rect.height,
			cssW: canvas.clientWidth,
			cssH: canvas.clientHeight,
			bufferW: canvas.width,
			bufferH: canvas.height,
			styleW: canvas.style.width,
			styleH: canvas.style.height,
		};
	}

	function contentTarget() {
		const visual = readVisual();
		const inner = readInner();
		const client = readClient();
		const w = visual ? visual.w : (client.w || inner.w);
		const h = visual ? visual.h : (client.h || inner.h);
		return {
			w,
			h,
			visual,
			inner,
			client,
		};
	}

	function ensureCanvasFill() {
		const html = document.documentElement;
		const body = document.body;
		const canvas = document.getElementById("canvas");
		if (!html || !body || !canvas) {
			return;
		}
		html.style.width = "100%";
		html.style.height = "100%";
		html.style.margin = "0";
		html.style.padding = "0";
		html.style.overflow = "hidden";
		body.style.width = "100%";
		body.style.height = "100%";
		body.style.margin = "0";
		body.style.padding = "0";
		body.style.overflow = "hidden";
		body.style.touchAction = "none";
		canvas.style.display = "block";
		canvas.style.position = "fixed";
		canvas.style.left = "0";
		canvas.style.top = "0";
		canvas.style.right = "0";
		canvas.style.bottom = "0";
		canvas.style.width = "100%";
		canvas.style.height = "100%";
		canvas.style.margin = "0";
		canvas.style.padding = "0";
		canvas.style.maxWidth = "none";
		canvas.style.maxHeight = "none";
	}

	function coverage() {
		const target = contentTarget();
		const canvas = readCanvas();
		if (!canvas || target.w <= 0 || target.h <= 0) {
			return { x: 0, y: 0 };
		}
		return {
			x: (canvas.w / target.w) * 100,
			y: (canvas.h / target.h) * 100,
		};
	}

	function readMetrics() {
		ensureCanvasFill();
		const target = contentTarget();
		const canvas = readCanvas();
		return {
			build: BUILD,
			inner: readInner(),
			visual: readVisual(),
			client: readClient(),
			container: { x: 0, y: 0, w: target.w, h: target.h },
			canvas,
			coverage: coverage(),
			dpr: window.devicePixelRatio || 1,
			fullscreen: !!document.fullscreenElement,
		};
	}

	function install() {
		if (installed) {
			ensureCanvasFill();
			return;
		}
		installed = true;
		ensureCanvasFill();
		const onResize = () => {
			ensureCanvasFill();
			const existing = window.godotDisplayResized;
			if (typeof existing === "function") {
				existing();
			}
		};
		window.addEventListener("resize", onResize, { passive: true });
		window.addEventListener("orientationchange", onResize, { passive: true });
		document.addEventListener("fullscreenchange", onResize, { passive: true });
		if (window.visualViewport) {
			window.visualViewport.addEventListener("resize", onResize, { passive: true });
		}
	}

	window.AbyssalWebViewport = {
		BUILD,
		install,
		ensureCanvasFill,
		readMetrics,
		contentTarget,
		coverage,
		onGodotResize: null,
	};
})();
