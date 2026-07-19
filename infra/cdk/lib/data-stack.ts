import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export class DataStack extends Stack {
  public readonly coursesTable: Table;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.coursesTable = new Table(this, 'CoursesTable', {
      tableName: 'flipthescript-academy-courses',
      partitionKey: { name: 'id', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      // Retain data by default; switch to DESTROY only for ephemeral/dev stacks.
      removalPolicy: RemovalPolicy.RETAIN,
    });
  }
}
