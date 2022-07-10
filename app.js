const AWS = require('aws-sdk');
const _ = require('lodash');

class ElasticIPRotator {
    constructor() {
        this.instanceId = process.argv[2];
        this.region = process.argv[3];
        this.client = new AWS.EC2({
            region: this.region || 'ap-south-1'
        });
    }

    describeAddresses(callback) {
        this.client.describeAddresses({}, (err, data) => {
            if (!err) {
                let elasticIpData = _.find(data.Addresses, { InstanceId: this.instanceId });
                callback(elasticIpData);
            }
            else {
                callback();
            }
        });
    }

    disassociateAddress(associationId, callback) {
        this.client.disassociateAddress({
            AssociationId: associationId
        }, (err) => {
            if (!err) {
                callback(true);
            }
            else {
                callback(false);
            }
        });
    }

    allocateAddress(callback) {
        this.client.allocateAddress({
            Domain: "vpc"
        }, (err, data) => {
            if (!err && data) {
                callback(data.AllocationId);
            }
            else {
                callback();
            }
        });
    }

    associateAddress(allocationId, callback) {
        this.client.associateAddress({
            AllocationId: allocationId,
            InstanceId: this.instanceId
        }, (err, data) => {
            if (!err) {
                callback(true);
            }
            else {
                callback(false);
            }
        });
    }

    releaseAddress(allocationId, callback) {
        this.client.releaseAddress({
            AllocationId: allocationId
        }, (err, data) => {
            callback(err, data);
        });
    }

    assignNewIp(oldAllocationId) {
        this.allocateAddress((newAllocationId) => {
            if (newAllocationId) {
                this.associateAddress(newAllocationId, (success) => {
                    if (success) {
                        console.log("Elastic IP associated successfully!");
                        if (oldAllocationId) {
                            this.releaseAddress(oldAllocationId, (response) => {
                                console.log(response);
                            });
                        }
                    }
                    else {
                        console.log("Unable to associate address", newAllocationId,
                            this.instanceId);
                    }
                });
            }
            else {
                console.log("Unable to allocate a new IP Address");
            }
        });
    }

    start() {
        if (this.instanceId) {
            this.describeAddresses((elasticIpData) => {
                // If there's no elastic IP associated with this instance
                if (elasticIpData) {
                    let oldAllocationId = elasticIpData.AllocationId;
                    let associationId = elasticIpData.AssociationId;
                    this.disassociateAddress(associationId, (success) => {
                        if (success) {
                            this.assignNewIp(oldAllocationId);
                        }
                        else {
                            console.log("Unable to disassociate address:", associationId);
                        }
                    });
                }
                else {
                    this.assignNewIp();
                }
            });
        }
        else {
            console.log("Please provide a valid instance-id");
        }
    }
}

let obj = new ElasticIPRotator();
obj.start();
