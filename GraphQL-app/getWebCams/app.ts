import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const bound = JSON.parse(event.body);

    const queryMsg = `query {
  		webcams(query:{status:"active",location:{
                        longitude_lt:${bound.longitude_lt},
                        longitude_gte:${bound.longitude_gte},
                        latitude_lt:${bound.latitude_lt},
                        latitude_gte:${bound.latitude_gte}}}
    	,limit:200
    	,sortBy:ID_ASC) {
			id
			title
    		location{
     		 	latitude
      			longitude
    		}
            player{
               day{
                 available
                 link
              }
           }
           image{
                current{
                    thumbnail
                }    
           }
  		}
	}`;

    try {
	    const response = await fetch('https://realm.mongodb.com/api/client/v2.0/app/webcamql-qrkjj/graphql', {
  		    method: 'POST',
  		    headers: {
			    'apikey': 'zltDLjGDHqJHzQ0tSHA3XSZJUTnV5TxBmjW2PopKInszFsDxqSAEubmtq5tRRLgm' ,
    		    'Content-Type': 'application/json'
  		    },
  		    body: JSON.stringify({
      		    query: queryMsg
  		    })
	    });
        const webcamsJson = await response.json();
        return {
            statusCode: 200,
            body: JSON.stringify(webcamsJson.data.webcams),
        };
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
