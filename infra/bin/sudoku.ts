#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { SudokuStack } from '../lib/sudoku-stack';

const app = new cdk.App();

new SudokuStack(app, 'SudokuStack', {
  bucketName: 'sudoku-2154b72ff2',
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  },
});