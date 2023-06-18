"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.lambdaHandler = void 0;
var tf = require("@tensorflow/tfjs-node");
/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */
var model = null;
var pineconeUrl = "https://imageindex-c5a7176.svc.us-east-1-aws.pinecone.io/vectors/upsert";
var apiKey = "83d5fc94-5fd6-4d8a-ba7e-f7187ae79846";
function getModel() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(model === null)) return [3 /*break*/, 2];
                    return [4 /*yield*/, tf.loadGraphModel("https://tfhub.dev/google/tfjs-model/imagenet/mobilenet_v2_100_96/feature_vector/2/default/1", { fromTFHub: true })];
                case 1:
                    model = _a.sent();
                    _a.label = 2;
                case 2: return [2 /*return*/, model];
            }
        });
    });
}
function queryVector(featureVector) {
    return __awaiter(this, void 0, void 0, function () {
        var res, json;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch(pineconeUrl, {
                        method: 'POST',
                        headers: {
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
                    })];
                case 1:
                    res = _a.sent();
                    return [4 /*yield*/, res.json()];
                case 2:
                    json = _a.sent();
                    return [2 /*return*/, json];
            }
        });
    });
}
var lambdaHandler = function (event) { return __awaiter(void 0, void 0, void 0, function () {
    var requestBody, base64Image, b, imageTensor, imageResized, image, float32array, featureVector, json, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                return [4 /*yield*/, getModel()];
            case 1:
                model = _a.sent();
                if (!(event.body != null)) return [3 /*break*/, 3];
                requestBody = JSON.parse(event.body);
                base64Image = requestBody.base64Image;
                b = Buffer.from(base64Image, 'base64');
                imageTensor = tf.node.decodeImage(b);
                imageResized = tf.image.resizeBilinear(imageTensor, [96, 96]);
                image = imageResized.expandDims(0).toFloat().div(tf.scalar(127)).sub(tf.scalar(1));
                float32array = model.predict(image).dataSync();
                featureVector = Array.from(float32array.slice(0));
                return [4 /*yield*/, queryVector(featureVector)];
            case 2:
                json = _a.sent();
                return [2 /*return*/, {
                        statusCode: 200,
                        body: JSON.stringify({
                            message: json
                        }),
                    }];
            case 3: throw new Error("no data");
            case 4: return [3 /*break*/, 6];
            case 5:
                err_1 = _a.sent();
                console.log(err_1);
                return [2 /*return*/, {
                        statusCode: 500,
                        body: JSON.stringify({
                            message: 'some error happened',
                        }),
                    }];
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.lambdaHandler = lambdaHandler;
