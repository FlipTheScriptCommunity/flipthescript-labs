#!/usr/bin/env node
import { App } from 'aws-cdk-lib';
import { DataStack } from '../lib/data-stack';
import { ApiStack } from '../lib/api-stack';

const app = new App();

const dataStack = new DataStack(app, 'FlipTheScriptAcademyDataStack');

new ApiStack(app, 'FlipTheScriptAcademyApiStack', {
  coursesTable: dataStack.coursesTable,
});
