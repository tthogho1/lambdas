import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as tf from '@tensorflow/tfjs-node';

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */

let model :tf.GraphModel | null = null;

const pineconeUrl = "https://imageindex-c5a7176.svc.us-east-1-aws.pinecone.io/vectors/upsert";
const apiKey = "83d5fc94-5fd6-4d8a-ba7e-f7187ae79846";

async function  getModel():Promise <tf.GraphModel>{
    if (model === null){
        model = await tf.loadGraphModel("https://tfhub.dev/google/tfjs-model/imagenet/mobilenet_v2_100_96/feature_vector/2/default/1", { fromTFHub: true });
    }
    return model;
}

async function queryVector(featureVector : number[]) :Promise<string> {
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


export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
///exports.handler = async (event: any, context: any, callback: Function) =>{
    try {
        model = await getModel(); 
        if (event.body != null){
            const requestBody = JSON.parse(event.body);
            const base64Image = requestBody.base64Image;

            const b = Buffer.from(base64Image, 'base64');
            const imageTensor = tf.node.decodeImage(b);
            const imageResized = tf.image.resizeBilinear(imageTensor, [96, 96]);
            const image = imageResized.expandDims(0).toFloat().div(tf.scalar(127)).sub(tf.scalar(1));

            const float32array = ( model.predict(image) as tf.Tensor ).dataSync();
            const featureVector = Array.from(float32array.slice(0));
            
            const json = await queryVector(featureVector);
            return {
                statusCode:200,
                body:JSON.stringify({
                    message:json                    
                }),
            };
        }else{
            throw new Error("no data");
        }
    } catch (err) {
        console.log(err);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'some error happened',
            }),
        };
    }
};
