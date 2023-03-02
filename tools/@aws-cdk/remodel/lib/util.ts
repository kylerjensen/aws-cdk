import * as path from 'path';
import * as fs from 'fs-extra';

export async function discoverIntegPaths(dir: string): Promise<IntegPath[]> {
  const items = await fs.readdir(dir);

  const paths = await Promise.all(items.map(async (item) => {
    const resolved = path.resolve(dir, item);
    const stat = await fs.stat(resolved);
    if (stat.isDirectory()) {
      // it's a snapshot directory bring the whole thing
      if (/^integ\..*\.snapshot$/.test(item)) {
        return {
          path: path.join(dir, item),
          copy: false,
        };
      }

      return discoverIntegPaths(path.join(dir, item));
    } else if (/^integ\..*\.ts$/.test(item)) {
      return {
        path: path.join(dir, item),
        // Copy the .lit.ts items because they are still used in readmes in aws-cdk-lib
        copy: item.endsWith('.lit.ts'),
      };
    }
    return undefined;
  }));

  //TS compains about using `flatMap` above in place of map
  return paths.flat().filter(x => Boolean(x)) as IntegPath[];
}

interface IntegPath {
  path: string;
  copy: boolean;
}

export async function findIntegFiles(dir: string): Promise<IntegPath[]> {
  const discovered = await discoverIntegPaths(dir);

  // extra files used by integ test files
  const extraPaths = [
    'aws-cloudfront/test/test-origin.ts',
    {
      path: 'aws-eks/test/integ-tests-kubernetes-version.ts',
      copy: false,
    },
    'aws-eks/test/hello-k8s.ts',
    'aws-eks/test/pinger/function',
    'aws-eks/test/pinger/pinger.ts',
    'aws-eks/test/bucket-pinger/function',
    'aws-eks/test/bucket-pinger/bucket-pinger.ts',
    'aws-lambda-event-sources/test/test-function.ts',
    'custom-resources/test/provider-framework/integration-test-fixtures/s3-assert-handler',
    'custom-resources/test/provider-framework/integration-test-fixtures/s3-file-handler',
    'custom-resources/test/provider-framework/integration-test-fixtures/s3-assert.ts',
    'custom-resources/test/provider-framework/integration-test-fixtures/s3-file.ts',
    'pipelines/test/testhelpers/assets',
    'pipelines/test/testhelpers/compliance.ts',
    'pipelines/test/testhelpers/index.ts',
    'pipelines/test/testhelpers/legacy-pipeline.ts',
    'pipelines/test/testhelpers/modern-pipeline.ts',
    'pipelines/test/testhelpers/matchers.ts',
    'pipelines/test/testhelpers/test-app.ts',
    { path: 'aws-apigateway/test/sample-definition.yaml', copy: true },
    // { path: 'aws-apigateway/test/integ.token-authorizer.handler', copy: true },
    { path: 'aws-apigateway/test/integ.cors.handler', copy: true },
    { path: 'aws-appsync/test/appsync.none.graphql', copy: true },
    { path: 'aws-appsync/test/appsync.test.graphql', copy: true },
    { path: 'aws-appsync/test/appsync.lambda.graphql', copy: true },
    { path: 'aws-appsync/test/appsync.auth.graphql', copy: true },
    { path: 'aws-appsync/test/integ.graphql-iam.graphql', copy: true },
    { path: 'aws-appsync/test/appsync.js-resolver.graphql', copy: true },
    { path: 'aws-appsync/test/integ.graphql.graphql', copy: true },
    { path: 'aws-appsync/test/verify/lambda-tutorial', copy: true },
    { path: 'aws-cloudformation/test/core-custom-resource-provider-fixture/index.js', copy: true },
    { path: 'aws-cloudformation/test/asset-directory-fixture', copy: true },
    { path: 'aws-codebuild/test/build-spec-asset.yml', copy: true },
    { path: 'aws-codebuild/test/demo-image', copy: true },
    { path: 'aws-codecommit/test/asset-test.zip', copy: true },
    { path: 'aws-codecommit/test/asset-test', copy: true },
    { path: 'aws-codedeploy/test/lambda/handler', copy: true },
    { path: 'aws-codepipeline-actions/test/cloudformation/test-artifact', copy: true },
    { path: 'aws-codepipeline-actions/test/assets/nodejs.zip', copy: true },
    { path: 'aws-ec2/test/import-certificates-handler/index.js', copy: true },
    { path: 'aws-ecr-assets/test/demo-image', copy: true },
    { path: 'aws-ecr-assets/test/demo-tarball-hello-world/hello-world.tar', copy: true },
    { path: 'aws-ecs/test/ec2/firelens.conf', copy: true },
    { path: 'aws-ecs/test/demo-envfiles', copy: true },
    { path: 'aws-ecs-patterns/test/sqs-reader', copy: true },
    { path: 'aws-ecs-patterns/test/demo-image', copy: true },
    { path: 'aws-eks/test/sdk-call-integ-test-docker-app/app', copy: true },
    { path: 'aws-eks/test/test-chart', copy: true },
    { path: 'aws-events-targets/test/ecs/eventhandler-image', copy: true },
    { path: 'aws-iam/test/saml-metadata-document.xml', copy: true },
    { path: 'aws-lambda/test/my-lambda-handler', copy: true },
    { path: 'aws-lambda/test/handler.zip', copy: true },
    { path: 'aws-lambda/test/python-lambda-handler', copy: true },
    { path: 'aws-lambda/test/docker-lambda-handler', copy: true },
    { path: 'aws-lambda/test/docker-arm64-handler', copy: true },
    { path: 'aws-lambda/test/layer-code', copy: true },
    { path: 'aws-lambda-nodejs/test/integ-handlers', copy: true },
    // { path: 'aws-lambda-nodejs/test/integ-handlers/dependencies.ts', copy: true },
    // { path: 'aws-lambda-nodejs/test/integ-handlers/pnpm/dependencies-pnpm.ts', copy: true },
    // { path: 'aws-lambda-nodejs/test/integ-handlers/esm.ts', copy: true },
    // { path: 'aws-lambda-nodejs/test/integ-handlers/ts-handler.ts', copy: true },
    { path: 'aws-rds/test/snapshot-handler', copy: true },
    { path: 'aws-s3/test/put-objects-handler/index.js', copy: true },
    { path: 'aws-s3-assets/test/alpine-markdown', copy: true },
    { path: 'aws-s3-assets/test/file-asset.txt', copy: true },
    { path: 'aws-s3-assets/test/sample-asset-directory', copy: true },
    { path: 'aws-s3-deployment/test/my-website-second', copy: true },
    { path: 'aws-secretsmanager/test/integ.secret-name-parsed.handler/index.js', copy: true },
    // { path: 'aws-secretsmanager/test/my-website', copy: true },
    { path: 'aws-servicecatalog/test/assets', copy: true },
    { path: 'aws-stepfunctions-tasks/test/batch/batchjob-image', copy: true },
    { path: 'aws-stepfunctions-tasks/test/ecs/eventhandler-image', copy: true },
    { path: 'aws-stepfunctions-tasks/test/glue/my-glue-script/job.py', copy: true },
    { path: 'aws-stepfunctions-tasks/test/lambda/my-lambda-handler', copy: true },
    { path: 'lambda-layer-kubectl/test/lambda-handler', copy: true },
  ].map((p) => {
    if (typeof p === 'string') {
      return {
        path: path.join(dir, p),
        copy: true,
      };
    }
    return p;
  });

  //TS compains about using `flatMap` above in place of map
  return [
    ...discovered,
    ...extraPaths,
  ];
}

export function rewritePath(importPath: string, currentModule: string, relativeDepth: number) {
  const base = 'aws-cdk-lib';
  let newModuleSpecifier = importPath;

  const selfImportPath = [
    ...new Array(relativeDepth - 1).fill('..'),
    'lib',
  ].join('/');
  const otherImportPath = new Array(relativeDepth).fill('..').join('/');
  const importPathArr = importPath.split('/');
  const library = importPathArr[importPathArr.length -1];

  if (importPath.startsWith(selfImportPath)) {
    const subModulePath = new RegExp(`${selfImportPath}/(.+)`).exec(importPath)?.[1];
    const suffix = `${importPath === selfImportPath ? '' : '/lib'}${subModulePath ? `/${subModulePath}` : ''}`;
    newModuleSpecifier = `${base}/${currentModule}${suffix}`;
  } else if (importPath.startsWith(otherImportPath)) {
    if (['integ-tests', 'aws-apigatewayv2-integrations', 'aws-batch', 'aws-apigatewayv2'].includes(library)) {
      newModuleSpecifier = `@aws-cdk/${library}-alpha`;
    } else if (importPath.includes('core')) {
      newModuleSpecifier = 'aws-cdk-lib';
    } else {
      newModuleSpecifier = importPath.replace(otherImportPath, 'aws-cdk-lib');
    }
  }

  return newModuleSpecifier;
}

const testRegx = new RegExp('aws-cdk-lib/(.+?)/test');
export async function rewriteCdkLibTestImports(rootDir: string) {
  const files: string[] = [
    'aws-stepfunctions-tasks/test/batch/submit-job.test.ts',
    'aws-stepfunctions-tasks/test/batch/run-batch-job.test.ts',
    'aws-stepfunctions-tasks/test/apigateway/call-http-api.test.ts',
    'aws-route53-targets/test/apigatewayv2-target.test.ts',
    'aws-events-targets/test/batch/batch.test.ts',
  ];
  files.forEach(async file => {
    const matches = testRegx.exec(path.join(rootDir, file));
    const currentModule = matches?.[1];
    const absolutePath = path.join(rootDir, file);
    if (!currentModule) throw new Error(`Can't parse module from path ${file}`);
    const lines = (await fs.readFile(absolutePath, 'utf8'))
      .split('\n')
      .map((line) => {
        const importMatches = importRegex.exec(line);
        const importPath = importMatches?.[1];
        if (importPath) {
          const importPathArr = importPath.split('/');
          const library = importPathArr[importPathArr.length -1];
          if (['integ-tests', 'aws-apigatewayv2-integrations', 'aws-batch', 'aws-apigatewayv2'].includes(library)) {
            const newModuleSpecifier = `@aws-cdk/${library}-alpha`;
            return line.replace(/(?<=.*from ["'])(.*)(?=["'])/, `${newModuleSpecifier}`);
          }
        }
        return line;
      });
    await fs.writeFile(absolutePath, lines.join('\n'));
  });
}

// Capture the name of the paths current module
const integRegx = new RegExp('@aws-cdk-testing/framework-integ/test/(.+?)/test');
// Capture the path that the import refers to
const importRegex = new RegExp('from [\'"](.*)[\'"]');
export async function rewriteIntegTestImports(filePath: string, relativeDepth: number) {
  const matches = integRegx.exec(filePath);
  const currentModule = matches?.[1];
  if (!currentModule) throw new Error(`Can't parse module from path ${filePath}`);

  const lines = (await fs.readFile(filePath, 'utf8'))
    .split('\n')
    .map((line) => {
      const importMatches = importRegex.exec(line);
      const importPath = importMatches?.[1];

      if (importPath) {
        const newPath = rewritePath(importPath, currentModule, relativeDepth);
        return line.replace(/(?<=.*from ["'])(.*)(?=["'])/, `${newPath}`);
      }

      return line;
    });

  await fs.writeFile(filePath, lines.join('\n'));
}

export async function addTypesReference(filePath: string) {
  const lines = (await fs.readFile(filePath, 'utf8'))
    .split('\n');

  const newContents = [
    '/// <reference path="../../../../../../../../../node_modules/aws-cdk-lib/custom-resources/lib/provider-framework/types.d.ts" />',
    ...lines,
  ].join('\n');

  await fs.writeFile(filePath, newContents);
}
