// @ts-nocheck
"use client";

import { Slider } from "@/components/ui/slider";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Eraser, Paintbrush } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { useState, useEffect, useRef } from "react";

export default function Edit() {
  const [maskImg, setMaskImg] = useState("");
  const [originalImgURL, setOriginalImgURL] = useState("");
  const [activeToggle, setActiveToggle] = useState("eraser");
  const [sliderValue, setSliderValue] = useState([30]);
  const [uploading, setUploading] = useState(false);

  /* 
  Get most recent image that has been uploaded by current user
*/
  const getMostRecentImage = async () => {
    const response = await fetch("/api/images/mostRecentImage", {
      cache: "no-store",
    });
    const data = await response.json();
    setOriginalImgURL(data.url);
  };

  /* 
Get most recent MaskImg that has been uploaded by current user
*/
  const getMostRecentMaskImage = async () => {
    const response = await fetch("/api/images/mostRecentMaskImage", {
      cache: "no-store",
    });
    const data = await response.json();
    setMaskImg(data.url);
  };

  useEffect(() => {
    getMostRecentImage();
    getMostRecentMaskImage();
  }, []);

  /*
    Save edited img to DB
  */
  const handleSubmit = async (file) => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch("/api/images/editMask", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        location.reload();
      }
    } catch (error) {
      console.error(error);
      setUploading(false);
    }
  };

  const downloadMask = async () => {
    const node = document.getElementById("PictureLayer");
    if (!node) return;
    const dataUrl = node.toDataURL().split(",")[1];
    const blob = await fetch(`data:image/png;base64,${dataUrl}`).then((res) =>
      res.blob()
    );
    const file = new File([blob], "mask.png", { type: "image/png" });
    handleSubmit(file);
  };

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    // get img to edit (either background or mask)
    img.src = maskImg;
    const originalImg = new Image();
    originalImg.crossOrigin = "Anonymous";
    //get original image
    originalImg.src = originalImgURL;
    let imgLoaded = false;
    let originalImgLoaded = false;
    img.onload = () => {
      imgLoaded = true;
      if (originalImgLoaded) {
        setup(img, originalImg, 0, 0, img.width, img.height);
      }
    };
    originalImg.onload = () => {
      originalImgLoaded = true;
      if (imgLoaded) {
        setup(img, originalImg, 0, 0, img.width, img.height);
      }
    };
  }, [maskImg, originalImgURL]);

  const ctxRef = useRef(null);
  useEffect(() => {
    if (ctxRef.current) {
      ctxRef.current.lineWidth = sliderValue;
    }
  }, [sliderValue]);
  const returnOgRef = useRef(false);

  let state = {
    isDrawing: false,
    isReturning: false,
  };

  // Function to create a canvas
  const createCanvas = (id, width, height, style) => {
    let can = document.createElement("canvas");
    can.id = id;
    can.width = width;
    can.height = height;
    can.style = style;
    return can;
  };

  // Function to draw image on canvas
  const drawImageOnCanvas = (ctx, img, x, y, width, height, can) => {
    ctx.drawImage(img, x, y, width, height, 0, 0, can.width, can.height);
  };

  // Function to return original image
  const returnOriginal = (event, ctx, originalCtx, getPos) => {
    const pos = getPos(event);
    const currentCompositeOperation = ctx.globalCompositeOperation;
    ctx.globalCompositeOperation = "source-over";
    const radius = ctx.lineWidth / 2;
    const imageData = originalCtx.getImageData(
      pos.x - radius,
      pos.y - radius,
      radius * 2,
      radius * 2
    );
    let tempCanvas = document.createElement("canvas");
    let tempCtx = tempCanvas.getContext("2d");
    tempCanvas.width = radius * 2;
    tempCanvas.height = radius * 2;
    tempCtx.putImageData(imageData, 0, 0);
    tempCtx.globalCompositeOperation = "destination-in";
    tempCtx.beginPath();
    tempCtx.arc(radius, radius, radius, 0, Math.PI * 2);
    tempCtx.fill();
    ctx.drawImage(tempCanvas, pos.x - radius, pos.y - radius);
    ctx.globalCompositeOperation = currentCompositeOperation;
  };

  const startDrawing = (event, isDrawing, points, getPos) => {
    state.isDrawing = true;
    const pos = getPos(event);
    points.setStart(pos.x, pos.y);
  };

  const stopDrawing = () => {
    state.isDrawing = false;
  };

  const draw = (event, isDrawing, points, getPos) => {
    if (!state.isDrawing) return;
    const pos = getPos(event);
    points.newPoint(pos.x, pos.y);
  };

  const startReturning = (event, ctx, originalCtx, state, getPos, can) => {
    state.isReturning = true;
    returnOriginal(event, ctx, originalCtx, () => getPos(event, can));
  };

  const stopReturning = (state) => {
    state.isReturning = false;
  };

  const returnOg = (event, ctx, originalCtx, state, getPos, can) => {
    if (!state.isReturning) return;
    returnOriginal(event, ctx, originalCtx, () => getPos(event, can));
  };

  const managePoints = (ctx) => {
    let queue = [],
      qi = 0;
    function clear() {
      queue = [];
      qi = 0;
    }
    function setStart(x, y) {
      clear();
      newPoint(x, y);
    }
    function newPoint(x, y) {
      queue.push([x, y]);
    }
    function tick() {
      let k = 20;
      if (queue.length - qi > 1) {
        ctx.beginPath();
        if (qi === 0) ctx.moveTo(queue[0][0], queue[0][1]);
        else ctx.moveTo(queue[qi - 1][0], queue[qi - 1][1]);

        for (++qi; --k >= 0 && qi < queue.length; ++qi) {
          ctx.lineTo(queue[qi][0], queue[qi][1]);
        }
        ctx.stroke();
      }
    }
    setInterval(tick, 50);
    return {
      setStart: setStart,
      newPoint: newPoint,
    };
  };

  const getPos = (e, can) => {
    let rect = can.getBoundingClientRect();
    if (e.touches) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  // Main setup function
  const setup = (img, originalImg, x, y, width, height) => {
    const node = document.getElementById("PictureLayer");
    if (node && node.parentNode) {
      node.parentNode.removeChild(node);
    }
    // why is this causing issues sometimes?
    let canvasSize;
    if (window.innerWidth > 768) {
      canvasSize = 512;
    } else {
      canvasSize = (window.innerWidth * 9) / 10;
    }
    let can = createCanvas(
      "PictureLayer",
      canvasSize,
      canvasSize,
      "margin:auto;"
    );

    const outerCanvas = document.getElementById("outer-canvas");
    outerCanvas.appendChild(can);
    let ctx = can.getContext("2d");
    ctxRef.current = ctx;
    drawImageOnCanvas(ctx, img, x, y, width, height, can);
    ctx.lineCap = "round";
    ctx.lineWidth = sliderValue;
    ctx.globalCompositeOperation = "destination-out";

    // Create a separate canvas for the original image
    let originalCanvas = createCanvas("originalCanvas", can.width, can.height);
    let originalCtx = originalCanvas.getContext("2d");
    drawImageOnCanvas(originalCtx, originalImg, x, y, width, height, can);
    can.addEventListener("mousedown", (event) => {
      if (returnOgRef.current) {
        startReturning(
          event,
          ctx,
          originalCtx,
          state,
          () => getPos(event, can),
          can
        );
      } else {
        startDrawing(event, state, points, () => getPos(event, can));
        draw(event, state, points, () => getPos(event, can));
      }
    });
    can.addEventListener("mouseup", () => {
      stopReturning(state);
      stopDrawing(state);
    });
    can.addEventListener("mousemove", (event) => {
      if (returnOgRef.current) {
        returnOg(event, ctx, originalCtx, state, () => getPos(event, can), can);
      } else {
        draw(event, state, points, () => getPos(event, can));
      }
    });
    let points = managePoints(ctx);

    // MOBILE
    can.addEventListener("touchstart", (event) => {
      event.preventDefault();
      if (returnOgRef.current) {
        startReturning(
          event,
          ctx,
          originalCtx,
          state,
          () => getPos(event, can),
          can
        );
      } else {
        startDrawing(event, state, points, () => getPos(event, can));
        draw(event, state, points, () => getPos(event, can));
      }
    });

    can.addEventListener("touchend", (event) => {
      event.preventDefault();
      stopReturning(state);
      stopDrawing(state);
    });

    can.addEventListener("touchmove", (event) => {
      event.preventDefault();
      if (returnOgRef.current) {
        returnOg(event, ctx, originalCtx, state, () => getPos(event, can), can);
      } else {
        draw(event, state, points, () => getPos(event, can));
      }
    });
  };

  useEffect(() => {
    const cursorCanvas = document.createElement("canvas");
    cursorCanvas.width = sliderValue;
    cursorCanvas.height = sliderValue;
    const ctx = cursorCanvas.getContext("2d");
    ctx.beginPath();
    ctx.arc(sliderValue / 2, sliderValue / 2, sliderValue / 2, 0, Math.PI * 2);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.stroke();
    const cursorUrl = cursorCanvas.toDataURL();
    const outerCanvas = document.getElementById("outer-canvas");
    if (outerCanvas) {
      outerCanvas.style.cursor = `url(${cursorUrl}) ${sliderValue / 2} ${
        sliderValue / 2
      }, auto`;
    }
  }, [sliderValue]);

  return (
    <>
      <div className="backgroundStyle h-screen w-screen flex flex-col">
        <Header />
        <main className="flex flex-col flex-grow items-center space-y-10 mt-10">
          <div className="w-4/5 md:w-1/2 flex flex-col space-y-2 ">
            <div className="flex flex-row space-x-2 text-sm items-center pl-1">
              <div className="flex flex-row space-x-1">
                <Toggle
                  pressed={activeToggle === "eraser"}
                  onPressedChange={(isPressed) => {
                    if (isPressed) {
                      setActiveToggle("eraser");
                      returnOgRef.current = false;
                    }
                  }}
                >
                  <Eraser />
                </Toggle>
                <Toggle
                  pressed={activeToggle === "paintbrush"}
                  onPressedChange={(isPressed) => {
                    if (isPressed) {
                      setActiveToggle("paintbrush");
                      returnOgRef.current = true;
                    }
                  }}
                >
                  <Paintbrush />
                </Toggle>
              </div>
              <Slider
                defaultValue={sliderValue}
                min={2}
                max={100}
                step={1}
                onValueChange={(newValue) => {
                  setSliderValue(newValue);
                }}
              />
              <Button
                onClick={downloadMask}
                id="Activate Visualizer AI"
                type="submit"
                disabled={uploading}
              >
                Save
              </Button>
            </div>
          </div>
          <div id="outer-canvas" className="bg-yellow"></div>
        </main>
      </div>
    </>
  );
}
