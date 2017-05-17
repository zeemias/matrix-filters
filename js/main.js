(function() {
  var video = document.getElementById('video'),
    canvas = document.getElementById('canvas'),
    context = canvas.getContext("2d"),
    canvasLaplas = document.getElementById('canvas-laplas'),
    canvasRobert = document.getElementById('canvas-robert'),
    canvasSobel = document.getElementById('canvas-sobel'),
    canvasNoise = document.getElementById('canvas-noise'),
    canvasGaus = document.getElementById('canvas-gaus'),
    canvasDOP = document.getElementById('canvas-dop'),
    vendorUrl = window.URL || window.webkitURL;
    navigator.getMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
      
    navigator.getMedia({
	   video: true,
	   audio: false
	}, function(stream) {
	   video.src = vendorUrl.createObjectURL(stream);
	   video.play();
	}, function(error) {
	   alert('Error! Try again!');
	});

    context.translate(400, 0); 
    context.scale(-1, 1);

    function Noise(bcv) {
        bcv.drawImage(canvas, 0, 0, bcv.canvas.width, bcv.canvas.height);
        var apx = bcv.getImageData(0, 0, bcv.canvas.width, bcv.canvas.height);
        var data = apx.data;
        var number;
        for (var i = 0; i < data.length; i += 4) {
            number = Math.floor( Math.random() * 60 );
            data[i] = data[i] + number;
            data[i + 1] = data[i + 1]+ number ;
            data[i + 2] = data[i + 2]+ number;
            data[i + 3] = 255;
        }
        apx.data = data;
        bcv.putImageData(apx, 0, 0);
    }

    function Gaus(ctx, w, h, mix) {
        var weights = [1,4,7,4,1,
        4,16,26,16,4,
        7,26,41,26,7,
        4,16,26,16,4,
        1,4,7,4,1],
            katet = Math.round(Math.sqrt(weights.length)),
            half = (katet * 0.5) | 0,
            dstData = ctx.createImageData(w, h),
            dstBuff = dstData.data,
            srcBuff = ctx.getImageData(0, 0, w, h).data,
            y = h;
        for(var i = 0; i< weights.length;i++){
            weights[i] = weights[i] *  (1/274);
        }
        while (y--) {
            x = w;
            while (x--) {
                var sy = y,
                    sx = x,
                    dstOff = (y * w + x) * 4,
                    r = 0,
                    g = 0,
                    b = 0,
                    a = 0;
                for (var cy = 0; cy < katet; cy++) {
                    for (var cx = 0; cx < katet; cx++) {
                        var scy = sy + cy - half;
                        var scx = sx + cx - half;
                        if (scy >= 0 && scy < h && scx >= 0 && scx < w) {
                            var srcOff = (scy * w + scx) * 4;
                            var wt = weights[cy * katet + cx];
                            r += srcBuff[srcOff] * wt;
                            g += srcBuff[srcOff + 1] * wt;
                            b += srcBuff[srcOff + 2] * wt;
                            a += srcBuff[srcOff + 3] * wt;
                        }
                    }
                }
                dstBuff[dstOff] = r * mix + srcBuff[dstOff] * (1 - mix);
                dstBuff[dstOff + 1] = g * mix + srcBuff[dstOff + 1] * (1 - mix);
                dstBuff[dstOff + 2] = b * mix + srcBuff[dstOff + 2] * (1 - mix);
                dstBuff[dstOff + 3] = srcBuff[dstOff + 3];
            }
        }

        ctx.putImageData(dstData, 0, 0);
    }

    function Laplas(ctx, w, h, mix) {
        var weights = [-1, -1, -1, -1, 8, -1, -1, -1, -1],
            katet = Math.round(Math.sqrt(weights.length)),
            half = (katet * 0.5) | 0,
            dstData = ctx.createImageData(w, h),
            dstBuff = dstData.data,
            srcBuff = ctx.getImageData(0, 0, w, h).data,
            y = h;
        while (y--) {
            x = w;
            while (x--) {
                var sy = y,
                    sx = x,
                    dstOff = (y * w + x) * 4,
                    r = 0,
                    g = 0,
                    b = 0,
                    a = 0;
                for (var cy = 0; cy < katet; cy++) {
                    for (var cx = 0; cx < katet; cx++) {
                        var scy = sy + cy - half;
                        var scx = sx + cx - half;
                        if (scy >= 0 && scy < h && scx >= 0 && scx < w) {
                            var srcOff = (scy * w + scx) * 4;
                            var wt = weights[cy * katet + cx];
                            r += srcBuff[srcOff] * wt;
                            g += srcBuff[srcOff + 1] * wt;
                            b += srcBuff[srcOff + 2] * wt;
                            a += srcBuff[srcOff + 3] * wt;
                        }
                    }
                }
                dstBuff[dstOff] = r * mix + srcBuff[dstOff] * (1 - mix);
                dstBuff[dstOff + 1] = g * mix + srcBuff[dstOff + 1] * (1 - mix);
                dstBuff[dstOff + 2] = b * mix + srcBuff[dstOff + 2] * (1 - mix);
                dstBuff[dstOff + 3] = srcBuff[dstOff + 3];
            }
        }
        ctx.putImageData(dstData, 0, 0);
    }

    function Sobel(ctx, w, h, mix) {
        var weights = [-1, 0, 1, -2, 0, 2, -1, 0, 1],
            katet = Math.round(Math.sqrt(weights.length)),
            half = (katet * 0.5) | 0,
            dstData = ctx.createImageData(w, h),
            dstBuff = dstData.data,
            srcBuff = ctx.getImageData(0, 0, w, h).data,
            y = h;
        while (y--) {
            x = w;
            while (x--) {
                var sy = y,
                    sx = x,
                    dstOff = (y * w + x) * 4,
                    r = 0,
                    g = 0,
                    b = 0,
                    a = 0;
                for (var cy = 0; cy < katet; cy++) {
                    for (var cx = 0; cx < katet; cx++) {
                        var scy = sy + cy - half;
                        var scx = sx + cx - half;
                        if (scy >= 0 && scy < h && scx >= 0 && scx < w) {
                            var srcOff = (scy * w + scx) * 4;
                            var wt = weights[cy * katet + cx];
                            r += srcBuff[srcOff] * wt;
                            g += srcBuff[srcOff + 1] * wt;
                            b += srcBuff[srcOff + 2] * wt;
                            a += srcBuff[srcOff + 3] * wt;
                        }
                    }
                }
                dstBuff[dstOff] = r * mix + srcBuff[dstOff] * (1 - mix);
                dstBuff[dstOff + 1] = g * mix + srcBuff[dstOff + 1] * (1 - mix);
                dstBuff[dstOff + 2] = b * mix + srcBuff[dstOff + 2] * (1 - mix);
                dstBuff[dstOff + 3] = srcBuff[dstOff + 3];
            }
        }
        ctx.putImageData(dstData, 0, 0);
    }

    function D_OP(ctx, w, h, mix) {
        var weights = [-1, -1, -1, 0, 0, 0, 1, 1, 1],
            katet = Math.round(Math.sqrt(weights.length)),
            half = (katet * 0.5) | 0,
            dstData = ctx.createImageData(w, h),
            dstBuff = dstData.data,
            srcBuff = ctx.getImageData(0, 0, w, h).data,
            y = h;
        while (y--) {
            x = w;
            while (x--) {
                var sy = y,
                    sx = x,
                    dstOff = (y * w + x) * 4,
                    r = 0,
                    g = 0,
                    b = 0,
                    a = 0;
                for (var cy = 0; cy < katet; cy++) {
                    for (var cx = 0; cx < katet; cx++) {
                        var scy = sy + cy - half;
                        var scx = sx + cx - half;
                        if (scy >= 0 && scy < h && scx >= 0 && scx < w) {
                            var srcOff = (scy * w + scx) * 4;
                            var wt = weights[cy * katet + cx];
                            r += srcBuff[srcOff] * wt;
                            g += srcBuff[srcOff + 1] * wt;
                            b += srcBuff[srcOff + 2] * wt;
                            a += srcBuff[srcOff + 3] * wt;
                        }
                    }
                }
                dstBuff[dstOff] = r * mix + srcBuff[dstOff] * (1 - mix);
                dstBuff[dstOff + 1] = g * mix + srcBuff[dstOff + 1] * (1 - mix);
                dstBuff[dstOff + 2] = b * mix + srcBuff[dstOff + 2] * (1 - mix);
                dstBuff[dstOff + 3] = srcBuff[dstOff + 3];
            }
        }
        ctx.putImageData(dstData, 0, 0);
    }

    function Robert(ctx, w, h, mix) {
        var weights = [0,1,-1,0],
            katet = Math.round(Math.sqrt(weights.length)),
            half = (katet * 0.5) | 0,
            dstData = ctx.createImageData(w, h),
            dstBuff = dstData.data,
            srcBuff = ctx.getImageData(0, 0, w, h).data,
            y = h;
        while (y--) {
            x = w;
            while (x--) {
                var sy = y,
                    sx = x,
                    dstOff = (y * w + x) * 4,
                    r = 0,
                    g = 0,
                    b = 0,
                    a = 0;
                for (var cy = 0; cy < katet; cy++) {
                    for (var cx = 0; cx < katet; cx++) {
                        var scy = sy + cy - half;
                        var scx = sx + cx - half;
                        if (scy >= 0 && scy < h && scx >= 0 && scx < w) {
                            var srcOff = (scy * w + scx) * 4;
                            var wt = weights[cy * katet + cx];
                            r += srcBuff[srcOff] * wt;
                            g += srcBuff[srcOff + 1] * wt;
                            b += srcBuff[srcOff + 2] * wt;
                            a += srcBuff[srcOff + 3] * wt;
                        }
                    }
                }
                dstBuff[dstOff] = r * mix + srcBuff[dstOff] * (1 - mix);
                dstBuff[dstOff + 1] = g * mix + srcBuff[dstOff + 1] * (1 - mix);
                dstBuff[dstOff + 2] = b * mix + srcBuff[dstOff + 2] * (1 - mix);
                dstBuff[dstOff + 3] = srcBuff[dstOff + 3];
            }
        }
        ctx.putImageData(dstData, 0, 0);
    }

    setInterval(loop, 1000 / 60);

    function loop(){
        context.drawImage(video, 0, 0, 400, 300);
        Noise(canvasNoise.getContext("2d"));
        canvasGaus.getContext("2d").drawImage(canvas, 0, 0, 200, 150);
        Gaus(canvasGaus.getContext("2d"), 200, 150, 1);
        canvasLaplas.getContext("2d").drawImage(canvas, 0, 0, 200, 150);
        Laplas(canvasLaplas.getContext("2d"), 200, 150, 1);
        canvasSobel.getContext("2d").drawImage(canvas, 0, 0, 200, 150);
        Sobel(canvasSobel.getContext("2d"), 200,150,1);
        canvasDOP.getContext("2d").drawImage(canvas, 0, 0, 200, 150);
        D_OP(canvasDOP.getContext("2d"), 200, 150,1);
        canvasRobert.getContext("2d").drawImage(canvas, 0, 0, 200, 150);
        Robert(canvasRobert.getContext("2d"), 200, 150, 1);
    }
})();