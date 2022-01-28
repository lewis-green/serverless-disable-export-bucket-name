'use strict';
const path = require('path');

class DisableExportBucketNamePlugin {
    constructor(serverless) {
        this.serverless = serverless;
        this.hooks = {
            'after:aws:package:finalize:addExportNameForOutputs': () => this.afterAwsPackageFinalizeAddExportNameForOutputs(),
            'after:package:initialize': () => this.beforePackageInitialize()
        };
    }

    // The boiler plate create-stack file needs to have it removed, but the Serverless code expects it there so
    // we re-add it back in after it is removed on the outputted file.
    beforePackageInitialize() {
        if(this.serverless?.service?.provider?.compiledCloudFormationTemplate?.Outputs) {
            if (this.serverless.service.provider.compiledCloudFormationTemplate.Outputs["ServerlessDeploymentBucketName"]) {
                const originalOutputs = {};
                Object.assign(originalOutputs, this.serverless.service.provider.compiledCloudFormationTemplate.Outputs);

                delete this.serverless.service.provider.compiledCloudFormationTemplate.Outputs["ServerlessDeploymentBucketName"];
                if (Object.keys(this.serverless.service.provider.compiledCloudFormationTemplate.Outputs).length === 0) {
                    delete this.serverless.service.provider.compiledCloudFormationTemplate.Outputs;
                }
                const coreTemplateFileName = this.serverless.providers.aws.naming.getCoreTemplateFileName();
                const coreTemplateFilePath = path.join(
                    this.serverless.serviceDir,
                    '.serverless',
                    coreTemplateFileName
                );
                this.serverless.utils.writeFileSync(
                    coreTemplateFilePath,
                    this.serverless.service.provider.compiledCloudFormationTemplate
                );

                this.serverless.service.provider.compiledCloudFormationTemplate.Outputs = originalOutputs;
            }
        }
    }

    // Remove from the update-stack file output CFN
    afterAwsPackageFinalizeAddExportNameForOutputs() {
        if (this.serverless?.service?.provider?.compiledCloudFormationTemplate?.Outputs) {
            if (this.serverless.service.provider.compiledCloudFormationTemplate.Outputs["ServerlessDeploymentBucketName"]) {
                delete this.serverless.service.provider.compiledCloudFormationTemplate.Outputs["ServerlessDeploymentBucketName"];
            }
            if(Object.keys(this.serverless.service.provider.compiledCloudFormationTemplate.Outputs).length === 0) {
                delete this.serverless.service.provider.compiledCloudFormationTemplate.Outputs;
            }
        }
    }
}

module.exports = DisableExportBucketNamePlugin;
