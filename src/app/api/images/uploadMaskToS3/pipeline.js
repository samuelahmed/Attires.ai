import { pipeline } from "@xenova/transformers";

const P = () =>
  class PipelineSingleton {
    static task = "image-segmentation";
    static model = "Xenova/segformer_b0_clothes";
    static instance = null;

    static getInstance(progress_callback = null) {
      if (this.instance === null) {
        this.instance = pipeline(this.task, this.model, { progress_callback });
      }
      return this.instance;
    }
  };

let PipelineSingleton;
if (process.env.NODE_ENV !== "production") {
  if (!global.PipelineSingleton) {
    global.PipelineSingleton = P();
  }
  PipelineSingleton = global.PipelineSingleton;
} else {
  PipelineSingleton = P();
}

export default PipelineSingleton;
