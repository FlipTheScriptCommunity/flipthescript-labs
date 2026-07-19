import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { HttpApi, HttpMethod } from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export interface ApiStackProps extends StackProps {
  coursesTable: Table;
}

export class ApiStack extends Stack {
  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    const healthFn = new NodejsFunction(this, 'HealthFunction', {
      entry: '../../apps/api/src/handlers/health.ts',
      runtime: Runtime.NODEJS_22_X,
      timeout: Duration.seconds(10),
    });

    const listCoursesFn = new NodejsFunction(this, 'ListCoursesFunction', {
      entry: '../../apps/api/src/handlers/list-courses.ts',
      runtime: Runtime.NODEJS_22_X,
      timeout: Duration.seconds(10),
      environment: {
        COURSES_TABLE_NAME: props.coursesTable.tableName,
      },
    });
    props.coursesTable.grantReadData(listCoursesFn);

    const httpApi = new HttpApi(this, 'HttpApi', {
      apiName: 'flipthescript-academy-api',
    });

    httpApi.addRoutes({
      path: '/health',
      methods: [HttpMethod.GET],
      integration: new HttpLambdaIntegration('HealthIntegration', healthFn),
    });

    httpApi.addRoutes({
      path: '/courses',
      methods: [HttpMethod.GET],
      integration: new HttpLambdaIntegration(
        'ListCoursesIntegration',
        listCoursesFn,
      ),
    });
  }
}
