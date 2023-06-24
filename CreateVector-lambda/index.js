import * as tf from '@tensorflow/tfjs-node';
import fetch from "node-fetch";

const pineconeUrl = "https://imageindex-c5a7176.svc.us-east-1-aws.pinecone.io/query";
const apiKey = "83d5fc94-5fd6-4d8a-ba7e-f7187ae79846";
const modelurl = "https://tfhub.dev/google/tfjs-model/imagenet/mobilenet_v2_100_96/feature_vector/2/default/1";

const model = await tf.loadGraphModel(modelurl, { fromTFHub: true });

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
//const main = async () => {
  try {
    console.log(event);
    console.log(event.body);

    let jsonMsg = event.body
    if (event.isBase64Encoded){
      jsonMsg = Buffer.from(event.body, 'base64').toString();
      
      console.log(jsonMsg);
    }

    const jsonData = JSON.parse(jsonMsg);
    const base64String = jsonData.base64String;
    const base64Image = base64String.split(',')[1];
    console.log(base64Image);
    const featureVector = await getVector(model,base64Image);
    const res = await queryVector(featureVector);
    console.log(JSON.stringify(res));

    const response = {
      statusCode: 200,
      body: JSON.stringify(res),
    };
    return response;
  } catch (error) {
    const response = {
      statusCode: 500,
      body: JSON.stringify({"errorx" : error.message}),
    };
    return response;
  }
};