import * as tf from '@tensorflow/tfjs-node';
import fetch from "node-fetch";

const pineconeUrl = "https://imageindex-c5a7176.svc.us-east-1-aws.pinecone.io/query";
const apiKey = "83d5fc94-5fd6-4d8a-ba7e-f7187ae79846";
const modelurl = "https://tfhub.dev/google/tfjs-model/imagenet/mobilenet_v2_100_96/feature_vector/2/default/1";

const model = await tf.loadGraphModel(modelurl, { fromTFHub: true });
// const base64String="data:image/jpeg;base64,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";


async function getVector(model,base64Image) {
    // Load the image as a tensor
    const imageBuffer = Buffer.from(base64Image, 'base64');
    const imageTensor = tf.node.decodeImage(imageBuffer);
    const imageResized = tf.image.resizeBilinear(imageTensor, [96, 96]);
    const image = imageResized.expandDims(0).toFloat().div(tf.scalar(127)).sub(tf.scalar(1));

    const features =  model.predict(image);

    // Get the: feature vector as a flat array
    const float32array = features.dataSync();
    const featureVector = Array.from(float32array.slice(0));

    return featureVector;
}

async function queryVector(featureVector){
    const res = await fetch(pineconeUrl,{
        method:'POST',
        headers : {
          'Content-Type': 'application/json',
          'Api-Key': apiKey
        },
        body: JSON.stringify({
    		vector: featureVector,
    		topK: 5,
    		includeMetadata: false,
    		includeValues: false,
    		namespace: 'imageindex'
  		})
    });

    const json = await res.json();
    return json;
}

export const handler = async (event) => {
//const main = :async () => {
  try {
    const body = event.body;
    const base64String = body.base64String;
    const base64Image = base64String.split(',')[1];

    //const base64Image = base64String;
    const featureVector = await getVector(model,base64Image);
    const res = await queryVector(featureVector);
  
    const response = {
      statusCode: 200,
      body: JSON.stringify(res),
    };
    return response;
  } catch (error) {
    const response = {
      statusCode: 500,
      body: JSON.stringify({"error":error}),
    };
    return response;
  }
};