import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ListLensReviewsCommand, WellArchitectedClient } from '@aws-sdk/client-wellarchitected';

/**
 * @description This solution fetches the high-level lens review data for a given workload.
 */
export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const workloadId = event?.queryStringParameters?.id || '';
    if (!workloadId) throw new Error('Missing "id" in query parameters!');

    const response = await getLensReviews(workloadId);

    return {
      statusCode: 200,
      body: JSON.stringify(response)
    };
  } catch (error: any) {
    return {
      statusCode: 400,
      body: JSON.stringify(error.message)
    };
  }
}

/**
 * @description Get the lens review data.
 * @see https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-wellarchitected/
 */
async function getLensReviews(workloadId: string) {
  const region = process.env.REGION;
  if (!region) throw new Error('Missing region!');

  const client = new WellArchitectedClient({ region });

  const command = new ListLensReviewsCommand({
    WorkloadId: workloadId
  });

  const response = await client.send(command);

  if (response.$metadata.httpStatusCode !== 200) throw new Error('Did not get a status code 200!');
  return response?.LensReviewSummaries || [];
}
