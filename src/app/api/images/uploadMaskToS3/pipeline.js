import { pipeline } from "@xenova/transformers";

const P = () =>
  class PipelineSingleton {
    static task = "image-segmentation";
    static model = "Xenova/segformer_b0_clothes";
    static instance = null;

    static getInstance(progress_callback = null) {
      if (this.instance === null) {
        this.instance = pipeline(this.task, this.model, { progress_callback });
        // this.instance = pipeline(this.task, this.model, { progress_callback, cache_dir: '/tmp' });
        console.log("Before pipeline call");
        // this.instance = pipeline(this.task, this.model, {
        //   progress_callback,
        //   cache_dir: "/tmp",
        // });
        console.log("After pipeline call");
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
